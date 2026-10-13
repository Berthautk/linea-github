# Déploiement d'EasyProf 5 (Firebase Spark ou Netlify)

Je n'ai aucun accès à votre compte Firebase ; le déploiement se fait depuis votre ordinateur (gratuit, aucune carte).

## Avant tout
1. Dans l'app actuelle : Profil → **sauvegarde JSON** (copie de vos données).
2. `./make_public.sh` → crée `public/` : `index.html` = EasyProf 5, `v4/index.html` = ancienne version de secours.

## Option A – Firebase Hosting (Spark)
```
npm i -g firebase-tools
firebase login                    # votre compte Google
firebase projects:list            # vérifier que "easyprof-cmr" apparaît (sinon corriger .firebaserc)
firebase deploy --only hosting    # n'utilise ni Blaze ni Cloud Functions
```
- Nouvelle version : https://easyprof-cmr.web.app/ ; secours : https://easyprof-cmr.web.app/v4/ (mêmes données Firestore : retour arrière sans perte).
- Retour arrière rapide : console Firebase → Hosting → historique des versions → *Rollback*.
- Les en-têtes `no-cache` forcent les téléphones à recharger la page à chaque ouverture (il n'y a pas de service worker). Vérifier : Configuration → Année & PIN → « Version installée : 5.1 ».

## Option B – Netlify (gratuit, sans carte)
Glisser le dossier `public/` sur https://app.netlify.com/drop. Puis **obligatoire** : console Firebase → Authentication → Paramètres → *Domaines autorisés* → ajouter le domaine Netlify, sinon la connexion Google échoue. Les téléphones doivent réinstaller le raccourci (nouvelle adresse) ; supprimer l'ancien.

## Après la mise en ligne
1. Configuration → Année & PIN → **Appliquer ces changements** (trimestres 2026-2027, jours d'enseignement KAMDEM/TSOGO) puis corriger les dates de fin de trimestre et ajouter les vacances.
2. Essayer une déclaration « Pas de cours » depuis un compte enseignant (règles Firestore).
3. NEBASIBI : « Protéger les PIN en clair » puis « Générer » un nouveau PIN à lui communiquer.
