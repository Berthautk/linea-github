# Linea Scan — scanner de documents gratuit

Application web installable (PWA) qui transforme la photo d'un document en un fichier propre, comme s'il sortait d'un scanner de bureau. Gratuite, sans compte, sans filigrane, sans publicité. Les photos restent sur le téléphone : rien n'est envoyé sur internet.

## Ce qu'elle fait

- **Photo ou import** : appareil photo du téléphone (meilleure mise au point) ou images de la galerie, plusieurs à la fois.
- **Recadrage automatique** : les 4 coins du document sont trouvés seuls, même pour une carte colorée (deux méthodes : « ressemble à du papier » et « se distingue du fond »). On peut les déplacer au doigt, avec une loupe.
- **Redressement** : la perspective est corrigée ; les proportions sont remises exactement en A4 ou au format carte (85,6 × 54 mm) quand le document en est proche.
- **Rendus** :
  - *Scanner* (par défaut) : fond blanc, ombres et éclairage inégal supprimés, texte net. **Les tampons, cachets et signatures gardent leur couleur.**
  - *Gris*, *Photocopie* (noir et blanc pur), *Couleur* (choisi automatiquement pour les cartes), *Original*.
- **Contrôle qualité immédiat** : si la photo est floue ou a un reflet de lumière, un bandeau le dit tout de suite, avec un bouton « Reprendre ». On ne découvre plus au guichet que le texte est illisible.
- **Carte d'identité recto-verso sur une page A4, à la taille réelle**, comme une photocopie de CNI. Proposé automatiquement quand toutes les pages sont des cartes.
- **Taille maximale du fichier** (300 Ko, 500 Ko, 1 Mo, 2 Mo, 5 Mo) : la compression s'ajuste seule pour passer sur les sites de dépôt en ligne (concours, inscriptions), sans descendre sous ce qui reste lisible.
- **Filigrane de protection** (« Copie réservée au dossier de concours ENS 2026 ») : une copie de vos pièces ne peut pas être réutilisée pour autre chose.
- **Signer** un document : signature au doigt, ou **tirée d'une photo de votre signature au stylo** (l'encre est détourée, sa couleur gardée). Elle est mémorisée pour la fois suivante.
- **Masquer une zone** (numéro, adresse) avant d'envoyer : le rectangle noir est fondu dans l'image, il ne peut pas être retiré par le destinataire.
- **Mes documents** : tous les documents restent sur le téléphone, rangés, avec leur nom (liste de noms courants : acte de naissance, relevé de notes…).
- **Sauvegarde complète en un fichier** et restauration sur un autre téléphone.
- **Export** en PDF ou JPG, 150 / 200 / 300 ppp, **partage direct** (WhatsApp, Gmail, Drive…).
- **Hors ligne**, sans compte, sans publicité, sans abonnement.

## Ce qu'elle corrige par rapport à CamScanner

D'après les avis (Trustpilot : 1,9/5 ; note « réelle » 3,2/5 sur 45 000 avis) :

| Reproche fait à CamScanner | Linea Scan |
|---|---|
| Essai qui devient un abonnement annuel, prélèvements après résiliation | Gratuit, pas d'abonnement, aucun paiement possible |
| Filigrane et paiement pour exporter ou partager | Aucun filigrane imposé ; export et partage libres |
| Publicités toutes les 15 secondes | Aucune publicité |
| Documents envoyés sur leurs serveurs sans accord, impossibles à effacer | Rien ne quitte le téléphone ; « supprimer » efface vraiment |
| Documents et étiquettes qui disparaissent, pas de sauvegarde fiable | Sauvegarde complète en un fichier, restauration sur un autre téléphone |
| Application devenue lourde et confuse | Quelques centaines de Ko, un seul écran principal |
| Compression, signature, mode carte d'identité réservés aux abonnés | Inclus |
| Mode N&B qui noircit ou efface les cachets bleus | Le rendu « Scanner » garde leur couleur |

Et ce que CamScanner ne fait pas : alerte flou/reflet dès la photo, taille maximale garantie pour les sites de dépôt, filigrane de protection des pièces d'identité, signature extraite d'une photo.

## L'utiliser

L'application doit être servie en HTTPS (obligatoire pour l'appareil photo et l'installation). Le plus simple : **GitHub Pages**. Dans le dépôt GitHub : *Settings > Pages > Deploy from a branch*, choisir la branche, puis ouvrir `https://<utilisateur>.github.io/<dépôt>/scanner/`.

Sur le téléphone : ouvrir l'adresse dans Chrome, puis menu ⋮ > *Ajouter à l'écran d'accueil* (Safari sur iPhone : bouton Partager > *Sur l'écran d'accueil*).

Pour tester sur un ordinateur : `npx http-server scanner` puis ouvrir `http://localhost:8080`.

## Conseils pour un résultat « scanner »

- Poser la feuille à plat sur une surface **plus foncée** que le papier (table en bois, tissu sombre).
- Bonne lumière, sans flash si possible, et sans que l'ombre du téléphone tombe sur la feuille.
- Tenir le téléphone bien au-dessus de la feuille ; la feuille entière doit être dans la photo.
- Pour un dossier officiel, choisir la qualité **Haute (300 ppp)**.

## Fichiers

| Fichier | Rôle |
|---|---|
| `index.html`, `app.css` | Écrans |
| `app.js` | Déroulement : photo, recadrage, rendus, pages, export, partage |
| `imgproc.js` | Détection des bords, redressement de la perspective, filtres |
| `pdf.js` | Création du PDF (sans bibliothèque externe) |
| `store.js` | Sauvegarde locale (IndexedDB) |
| `sw.js`, `manifest.webmanifest`, `icons/` | Installation et mode hors ligne |
