# Linea Scan — scanner de documents gratuit

Application web installable (PWA) qui transforme la photo d'un document en un fichier propre, comme s'il sortait d'un scanner de bureau. Gratuite, sans compte, sans filigrane, sans publicité. Les photos restent sur le téléphone : rien n'est envoyé sur internet.

## Ce qu'elle fait

- **Photo ou import** : appareil photo du téléphone (meilleure mise au point) ou images de la galerie, plusieurs à la fois.
- **Recadrage automatique** : les 4 coins du document sont trouvés tout seuls. On peut les déplacer au doigt, avec une loupe pour placer chaque coin précisément.
- **Redressement** : la perspective est corrigée. Si la feuille est presque au format A4, ses proportions sont remises exactement en A4.
- **Rendus** :
  - *Scanner* (par défaut) : fond blanc, ombres et éclairage inégal supprimés, texte net. **Les tampons, cachets et signatures gardent leur couleur.**
  - *Gris* : même chose en niveaux de gris.
  - *Photocopie* : noir et blanc pur.
  - *Couleur* : vraies couleurs corrigées (cartes d'identité, diplômes, photos).
  - *Original* : sans retouche.
- **Plusieurs pages** : « Page suivante » après chaque photo, puis on change l'ordre, on tourne ou on supprime une page.
- **Nom du document** modifiable à tout moment. C'est aussi le nom du fichier.
- **Export** en PDF (toutes les pages dans un seul fichier) ou en JPG, à 150, 200 ou 300 ppp, sur une page A4, Lettre ou à la taille du document.
- **Partage direct** (WhatsApp, Gmail, Drive…) avec le bouton « Partager », ou enregistrement dans Téléchargements.
- **Sauvegarde automatique** : si le téléphone ferme la page pendant une photo, les pages déjà scannées sont toujours là au retour.
- **Hors ligne** : une fois ouverte, elle marche sans connexion.

## Ce qu'elle corrige par rapport à CamScanner

| CamScanner | Linea Scan |
|---|---|
| Paiement pour exporter ou partager | Gratuit, sans limite |
| Filigrane sur la version gratuite | Aucun filigrane |
| Compte et envoi des documents sur leurs serveurs | Aucun compte ; tout reste sur le téléphone |
| Mode N&B qui rend les cachets bleus en noir ou les efface | Le rendu « Scanner » garde les couleurs des cachets et signatures |
| Publicités, application lourde | Rien à installer depuis un store, quelques centaines de Ko |

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
