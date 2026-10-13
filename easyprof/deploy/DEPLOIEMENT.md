# Déploiement d'EasyProf 5.2 sur Firebase (offre gratuite Spark)

Je n'ai aucun accès à votre compte Firebase ; la publication se fait depuis votre ordinateur, en 5 minutes, sans carte bancaire.
Publier ne touche **pas** à vos données (elles restent dans Firestore) : seul le fichier de l'application est remplacé.

## Une seule fois
1. Installer **Node.js LTS** : https://nodejs.org (suivre l'installation par défaut).
2. Ouvrir **PowerShell** et taper : `npm install -g firebase-tools` puis `firebase login` (connexion avec votre compte Google, celui du projet).
3. Télécharger le dossier : GitHub → dépôt `linea-github` → branche `ccr-3666762a-uo25fr` → *Code* → *Download ZIP*, puis décompresser. Le dossier à utiliser est `easyprof/deploy` (il contient déjà `public/`, prêt à publier).

## À chaque mise à jour du code (pas à chaque utilisateur)
Double-cliquer sur **`DEPLOYER-WINDOWS.bat`** (ou, dans PowerShell, dans ce dossier : `firebase deploy --only hosting --project easyprof-cmr`).
- Nouvelle version : https://easyprof-cmr.web.app/ ; version de secours : https://easyprof-cmr.web.app/v4/ (mêmes données : retour arrière sans perte).
- Retour arrière : console Firebase → Hosting → historique des versions → *Rollback*.
- Les téléphones rechargent la page à l'ouverture (en-tête `no-cache`, pas de service worker) : rien à vider. Vérifier : Configuration → Année & PIN → « Version installée : 5.2 ».

## Juste après la première publication
1. Configuration → Année & PIN → **Appliquer ces changements** (trimestres officiels, jours d'enseignement).
2. Essayer une déclaration « Pas de cours » depuis un compte enseignant (règles Firestore non vérifiées).
3. NEBASIBI : « Protéger les PIN en clair » puis « Générer » un nouveau PIN à lui communiquer.
4. Console Firebase → Firestore → Règles : vérifier qu'elles ne sont pas ouvertes à tous.

## Alternative Netlify
Glisser `public/` sur https://app.netlify.com/drop, puis ajouter le domaine Netlify dans Firebase → Authentication → Paramètres → *Domaines autorisés*. Nouvelle adresse : chacun doit réinstaller le raccourci.
