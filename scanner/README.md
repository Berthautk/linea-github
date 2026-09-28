# VraiScan — le vrai scanner, dans votre téléphone

Application web installable (PWA), publiable sur Google Play, **en français et en anglais**, qui transforme la photo d'un document en un fichier identique à celui d'un scanner de bureau, et qui prépare des **dossiers de candidature complets**. Gratuite, sans compte, sans filigrane, sans publicité. Les photos restent sur le téléphone : rien n'est envoyé sur internet, même la lecture du texte.

## Dossier de candidature

Onglet **📂 Dossier** : on constitue un dossier pièce par pièce.

1. **Ajouter une pièce** : la liste contient 65 pièces rangées en 8 catégories (identité et état civil, études, emploi, santé et casier, argent et logement, voyage et visa, formulaires, autre), avec leur sigle — « Carte nationale d'identité (CNI) » — et la règle habituelle (« à dater de moins de 3 mois », « recto puis verso »…). Recherche par mot : « casier », « CNI », « diplôme ». Liste complète et sources : [`PIECES.md`](PIECES.md).
2. On touche la pièce, on la **scanne** (ou on importe une photo) ; on recadre, on choisit le rendu, on ajoute le verso ou d'autres pages.
3. La pièce se range dans **Mon dossier**, numérotée, avec son nom de fichier : `01_CNI.pdf`, `02_Acte_de_naissance.pdf`… Pour chaque pièce : ✏️ modifier, ＋ page, 🔄 recommencer, ↑ ↓ changer l'ordre, 🗑 retirer.
4. **🔎 Vérifier** (indicatif) : page floue ou avec reflet ; date la plus récente lue sur les pièces qui doivent avoir moins de 3 ou 6 mois ; même nom sur chaque pièce (si le nom est saisi) ; fond blanc de la photo d'identité.
5. **📤 Envoyer** : un PDF par pièce, des images JPG (sites qui refusent le PDF) ou un seul PDF ; taille maximale par fichier (300 Ko par défaut, comme Campus France) ; photo d'identité en 4 × 4 cm ou 35 × 45 mm et moins de 50 Ko ; noms acceptés par les sites (sans espaces ni accents). Tout le dossier en un **.zip** au nom choisi (propositions : « Dossier de concours 2026 », « Dossier Campus France 2026 »…), ou partage des fichiers.

Les cartes (CNI, titre de séjour, carte d'étudiant) sont mises recto et verso sur une page A4, à la taille réelle.

## Ce qu'elle fait

- **Photo ou import** : appareil photo du téléphone (meilleure mise au point) ou images de la galerie, plusieurs à la fois.
- **Recadrage automatique** : les 4 coins du document sont trouvés seuls, même pour une carte colorée (deux méthodes : « ressemble à du papier » et « se distingue du fond »). On peut les déplacer au doigt, avec une loupe.
- **Qualité scanner de bureau** :
  - redressement de la perspective, puis **redressement fin** : les lignes de texte sont remises parfaitement horizontales (écart de 0,3 à 3° corrigé automatiquement) ;
  - photo gardée à 4 000 px pour une vraie page **A4 à 300 ppp** ; proportions remises exactement en A4 ou au format carte (85,6 × 54 mm) ;
  - **bords propres** : les bouts de table et l'ombre du bord de la feuille sont effacés, comme sur la vitre d'un scanner.
- **Rendus** :
  - *Scanner de bureau* (par défaut) : fond blanc, ombres et éclairage inégal supprimés, tons naturels, texte net (accentuation des seuls contours, sans faire ressortir le grain). **Cachets, tampons et signatures gardent leur couleur.**
  - *Contrasté* (écritures pâles, crayon), *Gris*, *Photocopie* (noir et blanc pur), *Couleur* (choisi automatiquement pour les cartes), *Original*.
- **Conversion en Word, PDF cherchable et texte** : le texte est lu sur le téléphone, hors ligne (français, anglais, ou les deux).
  - **Word (.docx)** modifiable : la mise en page suit le document (taille des caractères, titres en gras, centrage, retours à la ligne), et **les mots lus avec un doute sont surlignés en jaune** pour être vérifiés ;
  - **PDF avec texte cherchable et copiable** : l'image du scan reste identique, avec le texte invisible posé exactement sur chaque mot ;
  - **texte seul** (.txt).
- **Contrôle qualité immédiat** : si la photo est floue ou a un reflet de lumière, un bandeau le dit tout de suite, avec un bouton « Reprendre ». On ne découvre plus au guichet que le texte est illisible.
- **Carte d'identité recto-verso sur une page A4, à la taille réelle**, comme une photocopie de CNI. Proposé automatiquement quand toutes les pages sont des cartes.
- **Taille maximale du fichier** (300 Ko, 500 Ko, 1 Mo, 2 Mo, 5 Mo) : la compression s'ajuste seule pour passer sur les sites de dépôt en ligne (concours, inscriptions), sans descendre sous ce qui reste lisible.
- **Filigrane de protection** (« Copie réservée au dossier de concours ENS 2026 ») : une copie de vos pièces ne peut pas être réutilisée pour autre chose.
- **Signer** un document : signature au doigt, ou **tirée d'une photo de votre signature au stylo** (l'encre est détourée, sa couleur gardée). Elle est mémorisée pour la fois suivante.
- **Masquer une zone** (numéro, adresse) avant d'envoyer : le rectangle noir est fondu dans l'image, il ne peut pas être retiré par le destinataire.
- **Mes documents** : tous les documents restent sur le téléphone, rangés, avec leur nom (liste de noms courants : acte de naissance, relevé de notes…).
- **Sauvegarde complète en un fichier** et restauration sur un autre téléphone.
- **Export** en PDF, PDF cherchable, Word, texte ou JPG, 150 / 200 / 300 ppp, **partage direct** (WhatsApp, Gmail, Drive…).
- **Livres et cahiers** : « 📖 Séparer 2 pages » coupe une double page au niveau du pli.
- **🔊 Écouter** : lecture à voix haute du texte de la page (lu sur le téléphone).
- **Noms de fichiers acceptés par les sites** (sans espaces ni accents), réglable.
- **Rendu par défaut** au choix (À propos).
- **Français / English** : bouton FR/EN en haut, ou dans À propos.
- **Hors ligne**, sans compte, sans publicité, sans abonnement.

## Ce qu'elle corrige par rapport à CamScanner

D'après les avis (Trustpilot : 1,9/5 ; note « réelle » 3,2/5 sur 45 000 avis) :

| Reproche fait à CamScanner | VraiScan |
|---|---|
| Essai qui devient un abonnement annuel, prélèvements après résiliation | Gratuit, pas d'abonnement, aucun paiement possible |
| Filigrane et paiement pour exporter ou partager | Aucun filigrane imposé ; export et partage libres |
| Publicités toutes les 15 secondes | Aucune publicité |
| Documents envoyés sur leurs serveurs sans accord, impossibles à effacer | Rien ne quitte le téléphone ; « supprimer » efface vraiment |
| Documents et étiquettes qui disparaissent, pas de sauvegarde fiable | Sauvegarde complète en un fichier, restauration sur un autre téléphone |
| Application devenue lourde et confuse | Quelques centaines de Ko, un seul écran principal |
| Conversion en Word, OCR, compression réservés aux abonnés | Tout est inclus, et la lecture du texte se fait sur le téléphone |

En plus, pensé pour les dossiers officiels : alerte flou/reflet dès la photo, taille maximale garantie pour les sites de dépôt, CNI recto-verso à taille réelle, filigrane de protection, signature extraite d'une photo, cachets gardés en couleur.

## L'utiliser

L'application doit être servie en HTTPS (obligatoire pour l'appareil photo et l'installation). Pour tester tout de suite : **GitHub Pages** (*Settings > Pages*), puis ouvrir `https://<utilisateur>.github.io/<dépôt>/scanner/`. Sur le téléphone : Chrome, menu ⋮ > *Ajouter à l'écran d'accueil*.

Pour tester sur un ordinateur : `npx http-server scanner` puis ouvrir `http://localhost:8080`.

## Publier sur Google Play

Tout est prêt dans [`store/`](store/) :

| Fichier | Contenu |
|---|---|
| [`store/PUBLIER.md`](store/PUBLIER.md) | **Le guide pas à pas** : mise en ligne, compte développeur, fabrication de l'application Android (PWABuilder), test fermé de 14 jours avec 12 testeurs, demande de mise en production |
| [`store/fiche-play-store.md`](store/fiche-play-store.md) | Textes de la fiche en français et en anglais, aux bonnes longueurs |
| [`store/questionnaires.md`](store/questionnaires.md) | Réponses : sécurité des données, classification, public cible, annonces |
| `store/icon-512.png`, `store/feature-graphic.png`, `store/screenshots/` | Icône 512 × 512, image de présentation 1024 × 500, 5 captures 1080 × 1920 |
| `store/twa-manifest.json`, `.well-known/assetlinks.json`, `.nojekyll` | Configuration de l'application Android et liaison avec le site |
| [`privacy.html`](privacy.html) | Politique de confidentialité (français et anglais) |

## Changer de nom

Le nom apparaît dans `index.html`, `manifest.webmanifest`, `privacy.html`, `pdf.js` (producteur du PDF), `app.js` (sauvegarde) et `store/`. Rechercher « VraiScan » et remplacer.

## Fichiers

| Fichier | Rôle |
|---|---|
| `index.html`, `app.css` | Écrans |
| `app.js` | Déroulement : photo, recadrage, rendus, signature, bibliothèque, export, partage, dossier, vérification |
| `catalog.js` | Catalogue des pièces (français et anglais) ; [`PIECES.md`](PIECES.md) en est tiré |
| `i18n.js` | Tous les textes en français et en anglais |
| `imgproc.js` | Détection des bords, perspective, redressement fin, rendus, nettoyage des bords, contrôle qualité |
| `ocr.js` | Lecture du texte sur le téléphone (Tesseract, dans `vendor/tesseract/`) |
| `docx.js` | Fichier Word (sans bibliothèque) |
| `pdf.js` | PDF, avec couche de texte cherchable (sans bibliothèque) |
| `store.js` | Enregistrement local (IndexedDB) |
| `sw.js`, `manifest.webmanifest`, `icons/` | Installation et mode hors ligne |
