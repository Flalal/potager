@AGENTS.md

# Mon Potager — guide projet

Application de jardinage pour débutants : quoi semer/planter/récolter, quand et
où. **Next.js 16** (App Router) + React 19 + TypeScript + Tailwind v4, base
**SQLite** via `node:sqlite`. Voir [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
(technique) et [docs/GUIDE.md](docs/GUIDE.md) (usage).

## Commandes

```bash
npm run dev          # serveur de dev (http://localhost:3000)
npm run build        # build de prod
npm run start        # sert le build
npm run lint         # eslint
npm test             # vitest run (CI)
npx next typegen     # régénère les types de routes (voir gotcha plus bas)
```

## Conventions & pièges (IMPORTANT)

- **Next 16** : le middleware s'appelle `proxy.ts` (à la racine de `src/`, pas
  du projet). `cookies()`, `headers()`, et `params`/`searchParams` sont **async**
  (await). Les helpers `PageProps<'/route'>` / `RouteContext<'/route'>` sont
  **générés** : après avoir ajouté une route, lancer `npx next typegen` sinon
  tsc échoue. Toujours lire `node_modules/next/dist/docs/` avant de coder du
  Next (breaking changes).
- **DB** : `node:sqlite` intégré (zéro dépendance native). Connexion
  **paresseuse** via le proxy dans `db.ts` (ne pas ouvrir à l'import). Pas de
  système de migrations → `ALTER TABLE` idempotents (try/catch) dans `db.ts`.
- **server-only** : `*-store.ts`, `session.ts`, `notify.ts`, `db.ts` importent
  `server-only`. Ne **jamais** les importer depuis un composant client ; les
  composants client passent par les **route handlers** (`/api/...`).
- **Hooks données client** (`garden.ts`, `plots.ts`, `journal.ts`, `tasks.ts`) :
  même patron = cache module partagé + maj **optimiste** + événement `window` +
  `fetch` vers l'API. Réutiliser ce patron pour toute nouvelle donnée serveur.
- **Logique pure dans `lib/*.ts`** (calendar, garden-calc, quantities,
  shopping, plot-logic, weather, login-throttle) avec un `*.test.ts` Vitest en
  regard. **Ajouter des tests** pour toute nouvelle logique pure.
- **Mode sombre** : classes `dark:` partout, `.dark` sur `<html>`. Tout nouveau
  composant UI doit inclure ses variantes `dark:` (surfaces `dark:bg-zinc-900`,
  bordures `dark:border-zinc-800`, textes `dark:text-emerald-{50..300}`).
- **ESLint** : `react-hooks/set-state-in-effect` est en **erreur**. Pour le
  pattern légitime « lire localStorage au montage », encadrer le `setState` par
  `/* eslint-disable react-hooks/set-state-in-effect */`.
- **Env** : `NEXT_PUBLIC_*` sont **figées au build** (rebuild requis si on les
  change). Les autres sont lues au **runtime** (restart suffit). Secrets dans
  `.env.production` / `.env.local` — **jamais** committer (seul `.env.example`
  est versionné).
- **Vérif locale** : ne **pas** lancer `next build` pendant que `next dev`
  tourne (même dossier `.next` → corrompt le serveur de dev). En dev, le mot de
  passe foyer est `jardin` (dans `.env.local`, ignoré par git).
- Les avertissements git **LF → CRLF** sont bénins (dépôt sur Windows).

## Déploiement

Proxmox / LXC, systemd derrière un reverse proxy HTTPS. Procédure complète dans
le [README](README.md). HTTPS requis pour la PWA et le Web Push.
