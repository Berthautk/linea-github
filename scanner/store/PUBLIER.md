# Publier Paperlume sur Google Play — pas à pas

Paperlume est une application web installable (PWA). Pour Google Play, on l'emballe
dans une vraie application Android appelée **TWA** (*Trusted Web Activity*) : c'est
la méthode officielle de Google pour publier une PWA. L'application s'ouvre en plein
écran, sans barre d'adresse, comme n'importe quelle application.

Tout ce qui dépend de l'application elle-même est prêt dans ce dossier :
textes de la fiche, icône, image de présentation, captures d'écran, politique de
confidentialité, réponses aux questionnaires, configuration Android.
Ce qui reste demande **votre** compte, **votre** identité et **votre** clé de
signature : Google ne permet pas qu'un tiers le fasse à votre place.

Durée totale à prévoir : **environ 3 semaines**, dont 14 jours de test obligatoire.

---

## Étape 1 — Mettre l'application en ligne à la racine d'un domaine

Google vérifie que l'application Android et le site appartiennent à la même
personne, grâce au fichier `/.well-known/assetlinks.json`, qui doit être **à la
racine** du domaine. Une adresse du type `berthautk.github.io/linea-github/scanner/`
ne convient donc pas.

Solution gratuite : **GitHub Pages sur un dépôt nommé `berthautk.github.io`**.

1. Sur GitHub, créez un dépôt public nommé exactement `berthautk.github.io`.
2. Copiez-y **le contenu** du dossier `scanner/` (pas le dossier lui-même), y compris
   le dossier `.well-known/` et le fichier `.nojekyll` (sans lui, GitHub Pages
   ignore les dossiers qui commencent par un point).
3. *Settings > Pages > Deploy from a branch > main / (root)*.
4. Vérifiez que `https://berthautk.github.io/` ouvre Paperlume, et que
   `https://berthautk.github.io/privacy.html` s'affiche.

(Plus tard, un nom de domaine à vous, par exemple `paperlume.app`, fonctionne de la
même façon : il faudra alors changer l'identifiant du paquet, voir étape 3.)

Avant de continuer, remplacez `[adresse e-mail du développeur]` dans
`privacy.html` par votre adresse de contact.

## Étape 2 — Créer le compte développeur Google Play

1. https://play.google.com/console/signup — compte **personnel**.
2. Frais d'inscription : **25 $**, une seule fois (pas d'abonnement).
3. Vérification d'identité : pièce d'identité et adresse. Comptez quelques jours.
4. Vérifiez aussi votre numéro de téléphone Android dans la console : c'est demandé.

## Étape 3 — Fabriquer l'application Android (fichier .aab)

Le plus simple, sans rien installer : **PWABuilder** (outil gratuit de Microsoft).

1. Ouvrez https://www.pwabuilder.com et entrez `https://berthautk.github.io/`.
2. *Package for stores* > **Android** > *Generate package*, avec ces réglages
   (ce sont aussi ceux de `twa-manifest.json`) :
   - **Package ID** : `io.github.berthautk.paperlume`
   - **App name** : `Paperlume — scanner, lecture, PDF` ; **Launcher name** : `Paperlume`
   - **App version** : `1.0.0` ; **Version code** : `1`
   - **Display mode** : Standalone ; **Status bar / Nav bar color** : `#0F3D5E`
   - **Signing key** : *Create new* — renseignez votre nom et un mot de passe solide.
3. Téléchargez le ZIP. Il contient :
   - `*.aab` : le fichier à envoyer à Google Play ;
   - `signing.keystore` et `signing-key-info.txt` : **votre clé de signature**.
     Gardez-les en lieu sûr (clé USB + Drive), **ne les mettez jamais sur GitHub**.
     Sans cette clé, vous ne pourrez plus publier de mise à jour.
   - `assetlinks.json` : voir étape 5.

(Variante en ligne de commande : `npm i -g @bubblewrap/cli`, puis
`bubblewrap init --manifest https://berthautk.github.io/manifest.webmanifest`
et `bubblewrap build`. Le fichier `twa-manifest.json` de ce dossier contient les
mêmes réglages.)

## Étape 4 — Créer l'application dans Play Console

*Tout afficher > Créer une application* :
- Nom : `Paperlume : scanner PDF & Word` ; langue par défaut : Français (France) ;
- Application (pas jeu) ; **Gratuite** ; acceptez les déclarations.

Puis remplissez *Configurer votre application* (tableau de bord) :

| Rubrique | Réponse |
|---|---|
| Politique de confidentialité | `https://berthautk.github.io/privacy.html` |
| Accès à l'application | Toutes les fonctionnalités sont disponibles sans restriction (pas de connexion) |
| Annonces | **Non**, l'application ne contient pas d'annonces |
| Classification du contenu | Voir `questionnaires.md` → résultat attendu : **Tout public / PEGI 3** |
| Public cible | 18 ans et plus (le plus simple ; cela n'empêche personne de l'installer) |
| Application d'actualités | Non |
| Sécurité des données | Voir `questionnaires.md` → **aucune donnée collectée ni partagée** |
| Applications gouvernementales | Non |
| Fonctionnalités financières | Aucune |
| Santé | Aucune |

Fiche du Store : copiez les textes de `fiche-play-store.md` et envoyez les images
de ce dossier (`icon-512.png`, `feature-graphic.png`, `screenshots/`).

## Étape 5 — Relier le site et l'application (assetlinks.json)

Sans cette étape, une barre d'adresse s'affiche en haut de l'application.

1. Dans Play Console : *Test et publication > Configuration > Intégrité de
   l'application > Signature d'application* : copiez l'**empreinte du certificat
   SHA-256 de la clé de signature d'application** (Google re-signe l'application :
   c'est **cette** empreinte qu'il faut, et pas seulement celle de votre clé).
2. Ouvrez `.well-known/assetlinks.json` (dans `scanner/`) et remplacez les
   deux lignes `REMPLACER_...` par :
   - l'empreinte copiée à l'étape 1 ;
   - l'empreinte de votre clé d'importation (dans `signing-key-info.txt` ou le
     `assetlinks.json` fourni par PWABuilder).
3. Publiez le fichier (étape 1) et vérifiez qu'il s'ouvre à
   `https://berthautk.github.io/.well-known/assetlinks.json`.

## Étape 6 — Test fermé obligatoire : 12 testeurs pendant 14 jours

Règle Google pour les comptes personnels créés après le 13 novembre 2023 : avant
de pouvoir publier pour tout le monde, l'application doit être testée en **test
fermé** par **au moins 12 testeurs**, inscrits **sans interruption pendant 14 jours**.

1. *Test et publication > Tests > Test fermé > Créer un canal* ; envoyez le `.aab`.
2. Ajoutez une liste de testeurs (adresses Gmail) : prévoyez **15 à 20 personnes**,
   pour garder 12 inscrits même si certains se désinscrivent.
3. Envoyez-leur le lien d'inscription : chacun accepte, installe l'application
   depuis Play Store **et la garde installée 14 jours**.
4. Demandez-leur de vraiment l'utiliser (quelques scans, un PDF, un Word) et de
   laisser un avis dans le test : Google regarde l'activité réelle.
5. Pour les mises à jour pendant le test : même Package ID, **Version code** +1.

Idées de testeurs : collègues enseignants, élèves majeurs, famille, amis.

## Étape 7 — Demander l'accès à la production

Au bout des 14 jours : tableau de bord > **Demander l'accès à la production**.
Google pose quelques questions sur le test (réponses possibles ci-dessous), puis
répond en général sous 7 jours.

- *Comment avez-vous recruté vos testeurs ?* — Des collègues, des élèves majeurs et
  des proches, qui scannent des documents officiels (dossiers d'inscription,
  concours, pièces d'identité).
- *Qu'avez-vous changé grâce aux tests ?* — Décrivez les vrais retours reçus
  (réglages de détection des bords, rendus, textes de l'interface…).
- *L'application est-elle prête ?* — Oui : fonctionne hors ligne, sans compte,
  toutes les fonctions sont accessibles.

Ensuite : *Production > Créer une version* > envoyez le même `.aab` (ou un plus
récent) > **Lancer le déploiement**. L'examen prend de quelques heures à quelques
jours.

## Mises à jour

Modifiez le site : les utilisateurs reçoivent les changements **sans passer par
Play Store** (c'est l'avantage d'une TWA). Un nouveau `.aab` n'est nécessaire que
pour changer le nom, l'icône ou les réglages Android : même clé de signature,
Version code +1.

## Liste de contrôle

- [ ] Site en ligne à la racine du domaine, en HTTPS
- [ ] `privacy.html` : adresse e-mail renseignée
- [ ] Compte Play Console vérifié (25 $)
- [ ] `.aab` généré, clé de signature sauvegardée en deux endroits
- [ ] Fiche du Store remplie, images envoyées
- [ ] Questionnaires : contenu, public cible, sécurité des données, annonces
- [ ] `assetlinks.json` avec les deux empreintes SHA-256, en ligne
- [ ] Test fermé : 12 testeurs ou plus, 14 jours sans interruption
- [ ] Demande d'accès à la production
- [ ] Version de production déployée
