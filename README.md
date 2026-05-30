# 🌻 Mon Potager

Application web tout-en-un pour gérer son jardin quand on débute : savoir
**quoi planter, quand, et où**. Pensée pour les personnes qui ne connaissent
rien au jardinage.

## Fonctionnalités

- **Ce mois-ci** — ce qu'il faut semer / planter / récolter maintenant, avec
  filtres cliquables par action.
- **Calendrier de l'année** — grille plantes × 12 mois (semis, plantation,
  récolte), filtrable par catégorie et par action.
- **Fiches plantes** — 38 plantes (légumes, fruits, aromates) : exposition,
  sol, arrosage, levée, espacement, ravageurs, rotation, compagnonnage.
- **Mon jardin** — suivi personnel des plantations avec rappels de tâches du
  mois (récolte, soins, arrosage).
- **Plan du potager** — dessin des carrés et placement des plantes, avec
  détection des voisinages déconseillés (compagnonnage).
- **Zone climatique** — tout le calendrier se décale selon la région
  (Nord / France tempérée / Sud).

Les données personnelles (jardin, plan) sont stockées dans le `localStorage`
du navigateur : **aucune base de données ni backend** n'est nécessaire.

## Stack technique

- [Next.js](https://nextjs.org/) 16 (App Router) + React 19
- TypeScript
- Tailwind CSS v4
- Node.js 24

## Développement local

```bash
npm ci
npm run dev      # http://localhost:3000
```

Autres scripts :

```bash
npm run build    # build de production
npm run start    # sert le build (après build)
npm run lint
```

---

## Déploiement — Proxmox / conteneur LXC

> Procédure de référence. L'app est un serveur Next.js sans base de données ;
> il suffit d'un conteneur Linux avec Node.js 24, du build, et d'un service
> qui maintient le process en vie derrière un reverse proxy.

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
npm run build
```

> Le dépôt est **privé** : pour `git clone`, utiliser un Personal Access Token
> (`https://<TOKEN>@github.com/Flalal/potager.git`) ou une clé de déploiement
> SSH ajoutée au dépôt.

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

### 6. Mises à jour

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
