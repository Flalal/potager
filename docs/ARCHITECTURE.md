# Architecture technique — Mon Potager

Document de référence sur la conception du projet. Pour l'utilisation, voir
[GUIDE.md](./GUIDE.md).

## Vue d'ensemble

Application **Next.js 16** (App Router) servie par un unique process Node, avec
une base **SQLite locale** (fichier) pour les données du foyer. Pas de service
externe obligatoire ; les notifications (Discord, Home Assistant, Web Push) et
la météo (Open-Meteo) sont optionnelles et activées par configuration.

```
Navigateur ──HTTP──> Next.js (Node) ──> SQLite (node:sqlite)
    │                    │
    │                    ├─> Open-Meteo (météo, appel client)
    └─ Service Worker    └─> Discord / Home Assistant / Web Push (notifs)
```

## Stack

- **Next.js 16** (App Router, Server Actions, Route Handlers, « Proxy »).
- **React 19**, **TypeScript**, **Tailwind CSS v4**.
- **Node.js 24** — utilise le module intégré `node:sqlite` (zéro dépendance
  native).
- **web-push** pour les notifications Web Push (VAPID).
- **Vitest** pour les tests unitaires.

## Structure des dossiers

```
src/
  app/
    layout.tsx            Racine : thème, providers, nav, script anti-FOUC
    page.tsx              Accueil « Ce mois-ci » (+ onboarding)
    calendrier/           Calendrier annuel (imprimable)
    plantes/              Liste + fiches (génération statique)
    potager/              Plan du potager (rotation, modèles, distances)
    mon-jardin/           Plantations + récolte prévue + tâches + météo
    journal/              Journal de jardin
    courses/              Liste de courses du mois
    graines/              Inventaire « Mes graines »
    login/                Écran de connexion
    actions/auth.ts       Server Actions login / logout (+ anti-brute-force)
    api/                  Route Handlers (garden, plots, journal, tasks, push, notify)
    manifest.ts           Manifest PWA
  components/             Composants UI (client pour l'interactif)
  lib/
    plants.ts             Catalogue statique (38 plantes)
    types.ts              Types + libellés
    calendar.ts           Logique calendaire (décalage zone, décades, tâches, compat.)
    garden-calc.ts        Récolte prévisionnelle (logique pure)
    quantities.ts         Quantités conseillées par personne (logique pure)
    shopping.ts           Liens d'achat / comparateur (logique pure)
    plot-logic.ts         Rotation, suggestions, modèles de carrés (pure)
    weather.ts            Arrosage + géocodage Open-Meteo (logique pure)
    climate.tsx           Contexte zone climatique (localStorage)
    db.ts                 Connexion SQLite paresseuse + schéma + migrations
    session.ts            Sessions (cookie + DB)
    login-throttle.ts     Anti-brute-force (logique pure)
    *-store.ts            Accès DB côté serveur (garden, plots, journal, tasks, push…)
    garden.ts/plots.ts/journal.ts/tasks.ts/seeds.ts   Hooks client (cache optimiste + fetch)
  proxy.ts                Garde des routes (ex-middleware)
public/
  sw.js                   Service worker (push + cache hors-ligne)
  icon-*.png              Icônes PWA
```

## Modèle de données

Deux natures de données :

1. **Catalogue de plantes** — statique, dans `src/lib/plants.ts` (versionné,
   livré dans le bundle). Plantes avec semis/plantation/récolte par mois,
   compagnonnage, ravageurs, besoins, soins… Les fenêtres de semis/plantation/
   récolte peuvent être **affinées à la décade** (tiers de mois) via les champs
   optionnels `semisD`/`plantationD`/`recolteD` (codage 1..36 ; voir ci-dessous).
   À défaut, le mois plein est utilisé — c'est rétrocompatible.
2. **Données du foyer** — dynamiques, en base SQLite : plantations, parcelles
   (plan), entrées de journal, abonnements push, sessions, tentatives de login.

### Granularité décade (sous le mois)

Le calendrier descend sous le mois grâce aux **décades** (tiers de mois) :
code `1..36` où, pour un mois `m`, `3m-2` = début (1–10), `3m-1` = mi (11–20),
`3m` = fin (21–fin du mois). `calendar.ts` expose `monthToDecades`,
`decadeMonth`, `decadePart`, `shiftDecades` (décalage zone, en mois → ×3),
`decadesForAction` (précision fine si fournie, sinon expansion du mois plein),
`adjustedDecades` et `getCurrentDecade` (d'après le jour courant). La précision
est **additive et optionnelle** : `*D` n'écrase pas les tableaux mensuels, qui
restent la source pour les autres features (journal, tâches, plan…). Un test
d'invariant garantit que les mois couverts par un champ `*D` correspondent
exactement au tableau mensuel associé. Helper d'écriture `dec()` dans `plants.ts`.

### Schéma SQLite

Créé automatiquement au démarrage (`CREATE TABLE IF NOT EXISTS`, voir `db.ts`) :

| Table | Rôle |
| --- | --- |
| `sessions` | jetons de session (token, expiration) |
| `plantations` | plantes installées (Mon jardin) |
| `plots` | parcelles du plan ; `cells` (année courante) + `layouts` (JSON par année) + `year` |
| `journal_entries` | journal (récolte/semis/observation…) |
| `task_done` | tâches cochées (clé `uid:année-mois:libellé`) |
| `seeds` | inventaire des graines possédées (ids de plantes) |
| `push_subscriptions` | abonnements Web Push |
| `login_attempts` | compteur anti-brute-force par IP |

Connexion **paresseuse** (ouverte à la première requête, pas à l'import) pour
éviter les verrous entre les workers du build ; `PRAGMA busy_timeout` + WAL.

**Migrations** : `node:sqlite` n'a pas de système de versions ; `db.ts` applique
des `ALTER TABLE` idempotents (try/catch) au démarrage — c'est ainsi que les
colonnes `year`/`layouts` ont été ajoutées à `plots`.

### Plan du potager & rotation

Chaque carré stocke un **layout par année** (`layouts: { "2025": cells, … }`).
Le sélecteur d'année change le layout édité. `plot-logic.ts` calcule :
`rotationConflicts` (même famille au même endroit dans les 3 ans précédents),
`suggestionsForPlot` (bonnes voisines compatibles) et `PLOT_TEMPLATES` (carrés
tout faits, sans conflit). Les distances de plantation viennent du champ
`espacement` des fiches.

## Flux de données (client ↔ serveur)

Les hooks `useGarden` / `usePlots` / `useJournal` suivent le même patron :

- un **cache module partagé** alimenté par `GET /api/...` au montage ;
- les mutations sont **optimistes** (maj du cache + événement `window` pour la
  réactivité inter-composants), puis envoyées au serveur (`POST`/`PATCH`/
  `DELETE`) et re-synchronisées.

Les Route Handlers (`runtime = "nodejs"`, `dynamic = "force-dynamic"`) vérifient
la session avant tout accès et délèguent aux modules `*-store.ts`.

## Authentification

- **Mot de passe unique du foyer** (`HOUSEHOLD_PASSWORD`). Si la variable est
  absente, l'auth est **désactivée** (accès libre, utile en LAN).
- Vérification à **temps constant** (`timingSafeEqual` sur des hash SHA-256).
- **Sessions en base** + cookie `httpOnly` (`session.ts`).
- **`proxy.ts`** (ex-middleware) fait une vérification *optimiste* (présence du
  cookie) et redirige vers `/login` ; la vérification réelle se fait côté
  serveur dans chaque handler/action.
- **Anti-brute-force** : `login-throttle.ts` (logique pure, testée) + table
  `login_attempts`. 5 échecs dans une fenêtre de 15 min → verrou de 15 min, par
  IP (lue via `x-forwarded-for`).

## Notifications

Module `notify.ts` : une fonction `sendNotification` diffuse le même message
sur **tous les canaux configurés** (pattern *pluggable*) :

- **Discord** : webhook (`DISCORD_WEBHOOK_URL`).
- **Home Assistant** : webhook (`HA_WEBHOOK_URL`) ou API REST + service notify
  (`HA_BASE_URL`/`HA_TOKEN`/`HA_NOTIFY_SERVICE`).
- **Web Push** : VAPID (`web-push`), abonnements en base.

Déclencheur : `POST /api/notify/run?secret=...` (protégé par `CRON_SECRET`),
appelé par un cron. Le digest (`buildMonthlyDigest`) résume les tâches du mois à
partir des plantations.

## Météo

`weather.ts` contient la **logique pure** (`wateringAdvice`, `summarize`,
`geocodeUrl`, `firstGeocode`) testée unitairement. Le composant `WeatherAdvice`
obtient la position par **géolocalisation** ou par **recherche de ville**
(géocodage Open-Meteo), appelle **Open-Meteo** (gratuit, sans clé, CORS) côté
client, puis affiche un conseil d'arrosage. La position est mémorisée en
`localStorage`.

## PWA

- `app/manifest.ts` (manifest typé) + icônes générées.
- `public/sw.js` : notifications push + cache hors-ligne minimal (navigations
  *network-first* avec repli cache).
- Enregistré par `ServiceWorkerRegister`. Nécessite un **contexte sécurisé**
  (HTTPS ou localhost).

## Mode sombre

Piloté par la classe `.dark` sur `<html>` (`@custom-variant` Tailwind v4).
`ThemeToggle` persiste le choix en `localStorage` ; un **script inline**
applique le thème avant le premier paint (anti-FOUC) et `<html>` porte
`suppressHydrationWarning`.

## Tests

**Vitest** (environnement `node`). Couvre la logique pure (56 tests) :

- `calendar.test.ts` — décalage de zone, **décades** (conversion, décalage,
  invariant de cohérence mois↔décade sur tout le catalogue), tâches du mois,
  compatibilités.
- `login-throttle.test.ts` — verrou/fenêtre/réinitialisation.
- `weather.test.ts` — arrosage, agrégation et géocodage Open-Meteo.
- `garden-calc.test.ts` — récolte prévisionnelle.
- `quantities.test.ts` — quantités conseillées.
- `shopping.test.ts` — liens d'achat.
- `plot-logic.test.ts` — rotation, suggestions, validité des modèles.

`npm test` (CI) / `npm run test:watch` (dev).

## Intégration continue

`.github/workflows/ci.yml` sur chaque push/PR : `npm ci` → `next typegen` →
lint → typecheck → **test** → build (Node 24).

## Variables d'environnement

Voir [`.env.example`](../.env.example) et la section dédiée du
[README](../README.md). Rappels clés :

- `NEXT_PUBLIC_*` sont **figées au build** (rebuild nécessaire si on les change).
- Les autres (`HOUSEHOLD_PASSWORD`, `CRON_SECRET`, `DISCORD_*`, `HA_*`,
  `VAPID_PRIVATE_KEY`…) sont lues **au runtime** (un redémarrage suffit).
