# Guide d'utilisation — Mon Potager

Comment se servir de l'application au quotidien. Pour la technique, voir
[ARCHITECTURE.md](./ARCHITECTURE.md).

## Se connecter

Si un mot de passe du foyer est configuré, entrez-le sur l'écran de connexion.
La session reste active ~30 jours sur l'appareil. Pour vous déconnecter,
utilisez le bouton **⎋** en haut à droite.

> Après plusieurs essais infructueux, l'accès est temporairement bloqué
> (protection anti-tentatives). Patientez quelques minutes.

## Choisir sa région

En haut, le sélecteur **Région** (Nord / France tempérée / Sud) décale toutes
les dates de semis, plantation et récolte selon votre climat. Réglez-le une
fois ; le choix est mémorisé sur l'appareil.

## Ce mois-ci (accueil)

La page d'accueil montre, pour le mois courant et votre région, ce qu'il faut :

- **À semer**, **À planter**, **À récolter**.
- Cliquez sur une des pastilles (« 19 à semer »…) pour **filtrer** l'affichage
  sur cette action ; « Tout voir » réaffiche tout.
- Cliquez sur une plante pour ouvrir sa **fiche détaillée**.

## Calendrier de l'année

Une grille **plantes × 12 mois** avec un repère couleur par action
(semis / plantation / récolte). Vous pouvez :

- filtrer par **catégorie** (légume / fruit / aromate) ;
- cliquer sur **Semis / Plantation / Récolte** pour n'afficher que ces actions.

Le mois en cours est surligné.

## Fiches plantes

Chaque fiche détaille exposition, sol, arrosage, levée, espacement, ravageurs,
rotation (famille), compagnonnage, un mini-calendrier, la **quantité conseillée**
(ex. ≈ 8 pieds pour 4 pers.) et des **liens d'achat** (« Comparer les prix »
pour trouver le moins cher). Bouton **Ajouter à mon jardin** pour suivre la
plante.

## Plan du potager

Dessinez vos **carrés** (lignes × colonnes), puis placez vos plantes :

1. créez un carré, **ou partez d'un modèle tout fait** (Carré du débutant,
   Tomates & basilic, Carré d'aromates, Carré d'automne) ;
2. dans la **palette**, choisissez une plante (ou la **gomme**) ;
3. cliquez les cases pour les remplir.

L'outil vous aide :

- **⚠️ Voisinage déconseillé** : deux voisines incompatibles sont entourées
  de rouge.
- **🔁 Rotation** : changez l'**année** du carré ; si vous replantez la même
  famille au même endroit dans les 3 ans, la case passe en orange.
- **💡 Bonnes voisines à ajouter** : suggestions compatibles avec ce qui est
  déjà placé (cliquez pour les prendre comme pinceau).
- **📏 Distances de plantation** : la liste des espacements à respecter pour
  chaque plante du carré (aussi dans l'infobulle de chaque case).

Bouton **🖨️ Imprimer le plan** pour l'emporter au jardin. Vous pouvez renommer,
redimensionner ou supprimer un carré.

## Mon jardin

La liste de vos plantations. Pour chacune :

- **Récolte prévue** : estimée à partir de votre date de plantation et de votre
  région.
- **Tâches du mois** (récolte, soins, arrosage) : **cochez-les** (✅) quand
  c'est fait — l'état est enregistré et se réinitialise chaque mois.

On y trouve aussi :

- **Conseils d'arrosage météo** : saisissez votre **ville** (ou « 📍 Ma
  position ») pour que l'app récupère la météo locale (Open-Meteo) et vous dise
  s'il faut arroser ou non (pluie/chaleur prises en compte).
- **Notifications** : bouton « 🔔 Activer les rappels » (voir plus bas).

## Liste de courses du mois

La page **Courses** réunit tout ce qu'il faut acheter ce mois-ci (graines à
semer, plants à repiquer), avec la **quantité conseillée** selon le nombre de
personnes (réglable) et un lien **« Comparer les prix »** par plante.

## Journal de jardin

Gardez la trace de votre saison : récoltes, semis, plantations, observations,
traitements. Pour chaque entrée : date, type, plante (optionnel), titre,
quantité + unité (ex. *2,5 kg*) et une note. Les entrées sont regroupées par
date, de la plus récente à la plus ancienne.

## Mode sombre

Le bouton 🌙 / ☀️ (en haut) bascule entre thème clair et sombre. Par défaut,
l'app suit le réglage de votre système. Le choix est mémorisé.

## Installer l'application (PWA)

Sur mobile ou desktop, le navigateur propose **« Installer l'application »** /
« Ajouter à l'écran d'accueil ». Une fois installée, elle s'ouvre comme une app
et fonctionne en partie hors-ligne. *(Nécessite que le site soit servi en
HTTPS.)*

## Recevoir des rappels (notifications)

Deux mécanismes complémentaires :

- **Notifications serveur** (Discord / Home Assistant) : configurées une fois
  côté serveur ; un récap du mois est envoyé selon la planification (cron).
- **Web Push sur l'appareil** : dans *Mon jardin*, cliquez « 🔔 Activer les
  rappels sur cet appareil » et acceptez la demande du navigateur. Vous
  recevrez les rappels même app fermée. *(HTTPS requis.)*

Le contenu du rappel : les cultures qui ont une tâche ce mois-ci (récolte,
tuteurage, arrosage…) plus le nombre de choses à semer/planter.
