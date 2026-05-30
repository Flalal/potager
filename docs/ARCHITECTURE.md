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
    page.tsx              Accueil « Ce mois-ci »
    calendrier/           Calendrier annuel
    plantes/              Liste + fiches (génération statique)
    potager/              Plan du potager
    mon-jardin/           Plantations + météo + notifications
    journal/              Journal de jardin
    login/                Écran de connexion
    actions/auth.ts       Server Actions login / logout (+ anti-brute-force)
    api/                  Route Handlers (garden, plots, journal, push, notify)
    manifest.ts           Manifest PWA
  components/             Composants UI (client pour l'interactif)
  lib/
    plants.ts             Catalogue statique (38 plantes)
    types.ts              Types + libellés
    calendar.ts           Logique calendaire (décalage zone, tâches, compat.)
    climate.tsx           Contexte zone climatique (localStorage)
    db.ts                 Connexion SQLite paresseuse + schéma
    session.ts            Sessions (cookie + DB)
    login-throttle.ts     Anti-brute-force (logique pure)
    *-store.ts            Accès DB côté serveur (garden, plots, journal, push…)
    garden.ts/plots.ts/journal.ts   Hooks client (cache optimiste + fetch)
    weather.ts            Conseils d'arrosage (logique pure) + Open-Meteo
  proxy.ts                Garde des routes (ex-middleware)
public/
  sw.js                   Service worker (push + cache hors-ligne)
  icon-*.png              Icônes PWA
```

## Modèle de données

Deux natures de données :

1. **Catalogue de plantes** — statique, dans `src/lib/plants.ts` (versionné,
   livré dans le bundle). 38 plantes avec semis/plantation/récolte par mois,
   compagnonnage, ravageurs, besoins, soins…
2. **Données du foyer** — dynamiques, en base SQLite : plantations, parcelles
   (plan), entrées de journal, abonnements push, sessions, tentatives de login.

### Schéma SQLite

Créé automatiquement au démarrage (`CREATE TABLE IF NOT EXISTS`, voir `db.ts`) :

| Table | Rôle |
| --- | --- |
| `sessions` | jetons de session (token, expiration) |
| `plantations` | plantes installées (Mon jardin) |
| `plots` | parcelles du plan (grille `cells` en JSON) |
| `journal_entries` | journal (récolte/semis/observation…) |
| `push_subscriptions` | abonnements Web Push |
| `login_attempts` | compteur anti-brute-force par IP |

Connexion **paresseuse** (ouverte à la première requête, pas à l'import) pour
éviter les verrous entre les workers du build ; `PRAGMA busy_timeout` + WAL.

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

`weather.ts` contient la **logique pure** (`wateringAdvice`, `summarize`) testée
unitairement. Le composant `WeatherAdvice` géolocalise le navigateur et appelle
**Open-Meteo** (gratuit, sans clé, CORS) côté client, puis affiche un conseil
d'arrosage. La position est mémorisée en `localStorage`.

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

**Vitest** (environnement `node`). Couvre la logique pure :

- `calendar.test.ts` — décalage de zone, tâches du mois, compatibilités.
- `login-throttle.test.ts` — verrou/fenêtre/réinitialisation.
- `weather.test.ts` — conseils d'arrosage, agrégation Open-Meteo.

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
