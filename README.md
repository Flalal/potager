# 🌻 Mon Potager

Application web tout-en-un pour gérer son jardin quand on débute : savoir
**quoi planter, quand, et où**. Pensée pour les personnes qui ne connaissent
rien au jardinage.

## Fonctionnalités

- **Ce mois-ci** — ce qu'il faut semer / planter / récolter maintenant, avec
  filtres cliquables par action.
- **Calendrier de l'année** — grille plantes × 12 mois (semis, plantation,
  récolte), filtrable par catégorie et par action, **imprimable**.
- **Fiches plantes** — 38 plantes (légumes, fruits, aromates) : exposition,
  sol, arrosage, levée, espacement, ravageurs, rotation, compagnonnage,
  **quantité conseillée** et **liens d'achat** (comparateur de prix).
- **Mon jardin** — suivi des plantations avec **récolte prévisionnelle** (selon
  la date de plantation), **tâches du mois cochables**, et **conseils
  d'arrosage selon la météo locale** (Open-Meteo, par géoloc ou par ville).
- **Journal de jardin** — récoltes, semis, observations et traitements datés,
  avec quantités.
- **Plan du potager** — dessin des carrés et placement des plantes, avec :
  détection des **voisinages déconseillés**, **rotation des cultures** (plan par
  année + alerte « même famille ici récemment »), **modèles tout faits**,
  **suggestions de bonnes voisines**, **distances de plantation**, impression.
- **Liste de courses du mois** — graines/plants à acheter ce mois-ci, avec
  quantités (par nombre de personnes) et liens pour comparer les prix.
- **Zone climatique** — tout le calendrier se décale selon la région
  (Nord / France tempérée / Sud).
- **Mode sombre** — bascule clair/sombre, suit le système par défaut.
- **Onboarding** — carte de premiers pas pour les débutants.
- **Accès protégé** — mot de passe unique du foyer (session par cookie),
  protégé contre les tentatives répétées (anti-brute-force).
- **Notifications** — rappels des tâches du mois envoyés sur **Discord**,
  **Home Assistant** et/ou **Web Push** (PWA), déclenchés par un cron.
- **PWA installable** — installable sur mobile/desktop, fonctionnement
  hors-ligne basique via service worker.

Les données du foyer (jardin, plan) sont enregistrées côté serveur dans une
base **SQLite** (`node:sqlite`, sans dépendance native).

## Stack technique

- [Next.js](https://nextjs.org/) 16 (App Router, « Proxy ») + React 19
- TypeScript · Tailwind CSS v4 · Node.js 24
- Persistance : **SQLite** via le module intégré `node:sqlite`
- Notifications Web Push : `web-push` (VAPID)

## Configuration (variables d'environnement)

Copier [`.env.example`](.env.example) en `.env` (dev) ou `.env.production`
(serveur) et renseigner au minimum `HOUSEHOLD_PASSWORD`. Principales clés :

| Variable | Rôle |
| --- | --- |
| `HOUSEHOLD_PASSWORD` | Mot de passe du foyer. **Vide ⇒ auth désactivée** (accès libre LAN). |
| `DATABASE_PATH` | Chemin du fichier SQLite (défaut `./data/potager.db`). |
| `CRON_SECRET` | Secret exigé pour déclencher `/api/notify/run`. |
| `NOTIFY_ZONE_OFFSET` | Décalage de zone du digest (-1 sud, 0 tempéré, 1 nord). |
| `DISCORD_WEBHOOK_URL` | Webhook Discord (optionnel). |
| `HA_WEBHOOK_URL` *ou* `HA_BASE_URL`+`HA_TOKEN`+`HA_NOTIFY_SERVICE` | Home Assistant (optionnel). |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` / `VAPID_SUBJECT` | Web Push (optionnel). Générer : `npx web-push generate-vapid-keys`. |

## Documentation

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — conception technique (stack,
  schéma DB, flux de données, auth, notifications, météo, PWA, tests).
- [docs/GUIDE.md](docs/GUIDE.md) — guide d'utilisation par fonctionnalité.

## Développement local

```bash
npm ci
npm run dev      # http://localhost:3000
```

Autres scripts :

```bash
npm run build      # build de production
npm run start      # sert le build (après build)
npm run lint
npm test           # tests unitaires (Vitest)
npm run test:watch # tests en mode watch
```

---

## Déploiement — Proxmox / conteneur LXC

> Procédure de référence. L'app est un serveur Next.js avec une base SQLite
> locale (fichier) : il suffit d'un conteneur Linux avec Node.js 24, du build,
> d'un fichier `.env.production`, et d'un service qui maintient le process en
> vie derrière un reverse proxy.

### 1. Créer le conteneur LXC (sur l'hôte Proxmox)

- Template **Debian 12** (ou Ubuntu 24.04).
- Ressources conseillées : **1 vCPU, 1 Go RAM, 8 Go disque** (le build Next.js
  est l'étape la plus gourmande ; monter à 2 Go RAM si le build échoue).
- Conteneur **non privilégié**, réseau avec une IP joignable depuis le reverse
  proxy / LAN.

### 2. Préparer le système (dans le conteneur)

```bash
apt update && apt upgrade -y
apt install -y curl git ca-certificates
# Node.js 24 via NodeSource
curl -fsSL https://deb.nodesource.com/setup_24.x | bash -
apt install -y nodejs
node -v   # doit afficher v24.x
```

### 3. Récupérer et builder l'application

```bash
# Utilisateur dédié non-root
useradd -m -s /bin/bash potager
su - potager

git clone https://github.com/Flalal/potager.git
cd potager
npm ci

# Configurer l'environnement (au minimum le mot de passe du foyer)
cp .env.example .env.production
nano .env.production        # HOUSEHOLD_PASSWORD, CRON_SECRET, notifs…

npm run build
```

> Si le dépôt est **privé**, le `git clone` nécessite un Personal Access Token
> (`https://<TOKEN>@github.com/Flalal/potager.git`) ou une clé de déploiement
> SSH. S'il est **public**, le clone HTTPS fonctionne directement.

> La base SQLite est créée automatiquement au premier lancement sous
> `./data/potager.db`. Pour la placer sur un volume persistant, définir
> `DATABASE_PATH=/var/lib/potager/potager.db` (créer le dossier, propriétaire
> `potager`).

### 4. Lancer en service (systemd)

Créer `/etc/systemd/system/potager.service` (en root) :

```ini
[Unit]
Description=Mon Potager (Next.js)
After=network.target

[Service]
Type=simple
User=potager
WorkingDirectory=/home/potager/potager
Environment=NODE_ENV=production
Environment=PORT=3000
# node:sqlite est « expérimental » et émet un warning au démarrage : on le tait
Environment=NODE_OPTIONS=--no-warnings
EnvironmentFile=/home/potager/potager/.env.production
ExecStart=/usr/bin/npm run start
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

Activer :

```bash
systemctl daemon-reload
systemctl enable --now potager
systemctl status potager        # vérifier que c'est "active (running)"
curl http://localhost:3000      # doit renvoyer du HTML
```

### 5. Reverse proxy + HTTPS (optionnel mais recommandé)

Exposer le port 3000 derrière un reverse proxy (Nginx Proxy Manager, Caddy,
Traefik…). Exemple **Caddy** (`/etc/caddy/Caddyfile`) :

```
potager.mondomaine.fr {
    reverse_proxy 127.0.0.1:3000
}
```

Caddy gère automatiquement le certificat TLS Let's Encrypt.

### 6. Notifications (cron)

Les rappels du mois sont envoyés quand on appelle `/api/notify/run` (protégé
par `CRON_SECRET`). Planifier un appel, par ex. tous les lundis à 8 h, via la
crontab du conteneur (`crontab -e`) :

```cron
0 8 * * 1 curl -fsS -X POST "https://potager.mondomaine.fr/api/notify/run?secret=VOTRE_CRON_SECRET" >/dev/null
```

Les canaux actifs dépendent des variables définies (`DISCORD_WEBHOOK_URL`,
`HA_*`, clés `VAPID`). Pour le **Web Push**, chaque appareil doit d'abord
cliquer « 🔔 Activer les rappels » dans *Mon jardin*.

### 7. Mises à jour

```bash
su - potager
cd potager
git pull
npm ci
npm run build
exit
systemctl restart potager
```

---

Généré avec [Claude Code](https://claude.com/claude-code).
