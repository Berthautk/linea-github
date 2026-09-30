# NSANGAWEH — Budget familial en FCFA pour couples

NSANGAWEH est une application web progressive (PWA) conçue pour aider les couples à gérer leur budget en FCFA (XAF), avec un suivi clair des entrées, des sorties, des prévisions et de l'argent libre après les paiements prévus. Elle fonctionne hors-ligne avec synchronisation automatique dès le retour de la connexion.

---

## 🚀 Guide d'installation et de déploiement pas à pas (pour non-développeur)

Ce guide vous explique comment configurer Firebase gratuitement pour que vous et votre partenaire puissiez synchroniser vos comptes.

### Étape 1 : Créer votre projet Firebase
1. Rendez-vous sur la console Google Firebase : [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Connectez-vous avec votre compte Google.
3. Cliquez sur **« Ajouter un projet »** (ou « Créer un projet »).
4. Nommez votre projet (ex. `nsangaweh-budget`).
5. Désactivez Google Analytics (non nécessaire) puis cliquez sur **« Créer le projet »**.

### Étape 2 : Activer la connexion par e-mail et mot de passe
1. Dans le menu de gauche, cliquez sur **Build** (ou **Créer**) > **Authentication**.
2. Cliquez sur **« Commencer »**.
3. Dans la liste des modes de connexion, choisissez **« Adresse e-mail/Mot de passe »**.
4. Cochez l'interrupteur **« Activer »** (laissez désactivée l'option « Lien par e-mail »).
5. Cliquez sur **« Enregistrer »**.

### Étape 3 : Créer la base de données Firestore
1. Dans le menu de gauche, cliquez sur **Build** > **Firestore Database**.
2. Cliquez sur **« Créer une base de données »**.
3. Choisissez l'emplacement le plus proche (ex. `europe-west1` ou `europe-west9`).
4. Choisissez le mode de démarrage : sélectionnez **« Démarrer en mode production »**.
5. Cliquez sur **« Suivant »** puis **« Activer »**.

### Étape 4 : Déployer les règles de sécurité Firestore
1. Dans Firestore Database, cliquez sur l'onglet **« Règles »** en haut.
2. Remplacez tout le contenu par le code contenu dans le fichier `firestore.rules` de ce projet.
3. Cliquez sur **« Publier »**.

### Étape 5 : Récupérer la configuration Web de Firebase
1. Cliquez sur la roue dentée (paramètres du projet) en haut à gauche > **« Paramètres du projet »**.
2. En bas de la page « Général », dans la section **Vos applications**, cliquez sur l'icône Web **`</>`**.
3. Donnez un nom (ex. `NSANGAWEH Web`) et ne cochez pas Firebase Hosting pour l'instant. Cliquez sur **« Enregistrer l'application »**.
4. Firebase affiche un objet JavaScript `firebaseConfig` :
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "...",
     projectId: "...",
     storageBucket: "...",
     messagingSenderId: "...",
     appId: "..."
   };
   ```
5. Deux options s'offrent à vous :
   - **Soit** coller ces valeurs dans votre fichier `.env` local en vous basant sur `.env.example`.
   - **Soit** les coller directement dans l'application NSANGAWEH depuis l'écran de réglage si vous l'ouvrez dans votre navigateur.

### Étape 6 : Lancer et déployer l'application
Pour exécuter l'application sur votre machine :
```bash
npm install
npm run dev
```
Ouvrez l'adresse indiquée (ex: `http://localhost:3000`).

Pour déployer sur Firebase Hosting :
1. Installez l'outil Firebase CLI si ce n'est pas fait :
   ```bash
   npm install -g firebase-tools
   ```
2. Connectez-vous :
   ```bash
   firebase login
   ```
3. Construisez l'application :
   ```bash
   npm run build
   ```
4. Déployez le site et les règles :
   ```bash
   firebase deploy
   ```

---

## 🔐 Modèle de sécurité et explications techniques

### Structure Firestore (budget dynamique)
Aucune rubrique, icône, libellé ou montant n'est fixé dans le code : tout est une donnée créée, modifiée et supprimée par chaque partenaire.

- `households/{hid}` : `{ joinCode, members: [uid, uid], settings }` — `settings.rubricMerges` regroupe, **dans la vue Famille seulement**, deux noms de rubrique (ex. « Aide famille » → « Soutien famille ») sans toucher aux données de chacun.
- `households/{hid}/members/{uid}` : profil `{ name, color, joined, budgetSetupDone, templateStripDismissed, envelopeRollover }`
- `…/members/{uid}/categories/{id}` : une **rubrique** `{ name, icon, color, order, kind: 'out'|'in'|'save', budgetMode: 'lines'|'envelope', envelopeAmount, archived, createdAt, linkedTo? }`
- `…/members/{uid}/items/{id}` : un **modèle de ligne** `{ categoryId, label, amount (entier ou null), recurrence, active, order, archived }` avec `recurrence` = `once(month)` | `monthly` | `everyNMonths(n, startMonth)` | `months([1..12])` | `yearly(month)` et `startMonth`/`endMonth` facultatifs.
- `…/members/{uid}/months/{YYYY-MM}` : le **plan propre à ce mois** `{ lines, entries, envelopes, planCreated }`. Il est créé à partir des modèles actifs dont la récurrence correspond au mois (revue « Préparer {mois} »). Modifier un mois ne change jamais les autres en silence.
- `…/members/{uid}/debts/{id}` et `…/commitments/{id}` : carnet de dettes (chaque dette « Je dois » devient une ligne de la rubrique liée aux dettes) et engagements (un engagement crée un modèle de ligne mensuel).

Les opérations (`entries`) référencent `categoryId` et `lineId` (jamais un nom) et gardent un libellé en copie pour l'historique : renommer une rubrique ou une ligne se voit partout.

**Quotas Spark** : une écriture groupée (`writeBatch`) toutes les 400 ms (20 s en mode économe) ne contient que les documents réellement modifiés ; les écoutes ne relisent que les documents changés. Aucune Cloud Function, aucun produit payant.

**Migration** : au premier lancement de cette version, les mois de l'ancien format (`plan` + `entries` avec `p`) sont convertis en rubriques, modèles et lignes du mois, sans rien perdre (mêmes identifiants de lignes, copie de l'ancien plan gardée dans `legacyPlan`). La revue « Préparer {mois} » s'affiche au mois suivant pour corriger les récurrences. Les deux partenaires doivent utiliser cette version : les nouvelles règles refusent l'écriture de l'ancien format.

**Tests** : `npx vitest run` (génération des mois selon la récurrence, « seulement ce mois » / « ce mois et les suivants », suppression avec archivage, renommage, migration, enveloppe ou lignes, revue du mois, import de fiche, noms en double, agrégation Famille, règles des totaux).

### Comment fonctionne l'accès par code
- Le foyer est identifié par un code aléatoire de 10 caractères alphanumériques non ambigus (alphabet de 32 caractères : `ABCDEFGHJKLMNPQRSTUVWXYZ23456789`).
- Il y a **32^10 = 1 125 899 906 842 624** combinaisons possibles (~1,1 million de milliards), ce qui rend toute recherche exhaustive ou attaque par force brute impossible.
- Chaque partenaire a son propre compte et **écrit exclusivement dans son propre dossier utilisateur** (`/members/{uid}`). Aucun partenaire ne peut écraser ou altérer les entrées de l'autre.
- Les deux partenaires peuvent **lire** l'ensemble des données du foyer afin d'alimenter la vue consolidée **Famille**.

### Accès par code
- Le document du foyer se lit avec le code (pour pouvoir le rejoindre) ; **les budgets des membres ne sont lisibles que par les deux uid inscrits dans `members`** du document du foyer.
- Les règles valident les types, les listes de valeurs permises (`kind`, `budgetMode`, `recurrence.kind`…), les montants entiers entre 0 et 999 999 999, les noms de 1 à 40 caractères et la taille des listes.
- **Version précédente des règles, pour mémoire** :
  Créer un document racine `households/{hid}` contenant un tableau `memberUids: [uid1, uid2]`.
  Dans les règles de sécurité, vérifier que le demandeur est explicitement inscrit dans ce document :
  ```javascript
  function isHouseholdMember(hid) {
    return isSignedIn() &&
      request.auth.uid in get(/databases/$(database)/documents/households/$(hid)).data.memberUids;
  }
  ```
  Et restreindre la lecture à `allow read: if isHouseholdMember(hid);`.

---

## 🧪 Protocole de test de synchronisation à deux (Checklist)

Pour vérifier le fonctionnement de la synchronisation entre deux partenaires :

1. **Partenaire 1 (Compte A)** :
   - Ouvrir l'application (ou une fenêtre de navigation privée).
   - Cliquer sur « Créer mon compte » avec un e-mail (ex: `partenaire1@test.com`) et un mot de passe.
   - Cliquer sur **« Créer le foyer »**.
   - Noter le code de 10 caractères affiché (ex: `K9X2M4R7T8`).
   - Saisir son prénom (ex: `Alice`) et enregistrer.
   - Saisir une dépense dans « Mon mois » : `5000 beurre` puis Entrée.

2. **Partenaire 2 (Compte B)** :
   - Ouvrir un autre navigateur ou une fenêtre privée distincte.
   - Créer un compte avec un second e-mail (ex: `partenaire2@test.com`).
   - Choisir **« Rejoindre avec un code »**, saisir le code noté par le partenaire 1, puis cliquer sur « Rejoindre le foyer ».
   - Saisir son prénom (ex: `Cabrel`) et enregistrer.
   - Saisir une dépense : `15000 transport` puis Entrée.

3. **Vérification croisée** :
   - Ouvrir l'onglet **« Famille »** sur les deux appareils :
     - Les deux dépenses apparaissent immédiatement dans « Qui a mis, qui a dépensé » (Alice 5 000 F, Cabrel 15 000 F, total 20 000 F).
     - Le classement des sorties de la famille affiche les parts de chacun.
     - Le journal de la famille affiche les deux opérations horodatées avec le prénom de l'auteur.
   - Passer en mode avion ou couper la connexion internet sur un appareil :
     - Ajouter une dépense hors-ligne : elle est enregistrée localement sans blocage.
     - Rétablir la connexion : elle se synchronise automatiquement sur le compte du partenaire.

---

## 📱 Guide de publication Google Play Store (Capacitor & TWA)

L'application NSANGAWEH est architecturée selon les exigences des applications mobiles de production (PWA installable ou application native encapsulée avec Capacitor).

### Option A : Génération de l'Android App Bundle (.aab) avec Capacitor

1. **Installer Capacitor CLI et la plateforme Android** :
   ```bash
   npm install @capacitor/core @capacitor/cli @capacitor/android
   ```

2. **Compiler le projet Web** :
   ```bash
   npm run build
   ```

3. **Initialiser et synchroniser le dossier Android** :
   ```bash
   npx cap add android
   npx cap sync
   ```

4. **Générer la clé de signature (Keystore)** :
   ```bash
   keytool -genkey -v -keystore nsangaweh-release.keystore -alias nsangaweh -keyalg RSA -keysize 2048 -validity 10000
   ```

5. **Ouvrir le projet dans Android Studio et générer le bundle** :
   ```bash
   npx cap open android
   ```
   Dans Android Studio : **Build > Generate Signed Bundle / APK > Android App Bundle (.aab)**.
   Sélectionnez votre fichier `.keystore` et exportez le fichier `.aab`.

### Option B : Trusted Web Activity (TWA via Bubblewrap ou PWABuilder)
1. Rendez-vous sur [PWABuilder.com](https://www.pwabuilder.com/) avec l'URL de votre hébergement Firebase Hosting.
2. Cliquez sur **« Package for Android »**.
3. Renseignez l'ID du paquet (`com.nsangaweh.app`), le nom `NSANGAWEH` et téléchargez le `.aab` prêt à publier.

---

### 📋 Fiche Google Play Console (Textes en Français)

- **Nom de l'application** : `NSANGAWEH - Budget de couple en FCFA`
- **Description courte (max 80 caractères)** :
  `Budget familial et de couple en FCFA. Synchronisation hors-ligne à deux.`
- **Description complète** :
  ```text
  NSANGAWEH est l’application de gestion budgétaire mobile conçue pour les couples et les familles gérant leurs finances en FCFA (XAF).

  Fonctionnalités clés :
  • Budget partagé à deux : chacun note ses dépenses sur son téléphone et le foyer se synchronise en temps réel.
  • Clavier rapide : enregistrez une sortie en 2 secondes grâce au pavé numérique dédié ou par commande naturelle ("5000 beurre").
  • Reste à vivre transparent : découvrez instantanément ce qu'il vous reste après déduction des factures et dépenses prévues du mois, avec une moyenne journalière.
  • Mode 100 % hors-ligne : continuez à enregistrer vos dépenses même en zone sans réseau ; elles se synchronisent dès le retour de la connexion.
  • Suivi analytique : graphiques clairs des entrées/sorties, répartition par rubriques (santé, scolarité, alimentation, soutien famille, loyer) et taux d'épargne.
  • Respect de la vie privée : aucune publicité, aucun accès bancaire intrusif, suppression de compte en un clic.
  ```
- **Idées de captures d'écran (Screenshots Play Store 1080x1920)** :
  1. *Accueil* : Carte émeraude avec le solde du mois, entrées/sorties et reste à vivre.
  2. *Saisie ultra-rapide* : Clavier numérique avec puces des rubriques (Loyer, Marché, École).
  3. *Page Famille* : Vue "Qui a mis, qui a dépensé" et répartition du couple.
  4. *Évolution* : Graphique mensuel avec calcul du taux d'épargne.
- **Graphique promotionnel (1024x500)** :
  Fond vert émeraude `#0B6E4F`, monogramme doré "N", mention « Le budget familial en FCFA pour couples ».

---

### 🛡️ Déclaration Sécurité des Données (Data Safety Google Play)
- **Données financières** : Collectées uniquement pour le fonctionnement de l'application (suivi des dépenses et rentrées). Elles ne sont jamais partagées avec des tiers ni utilisées à des fins publicitaires.
- **Chiffrement** : Toutes les données transmises sont chiffrées en transit via HTTPS / TLS.
- **Suppression des données** : Conforme aux exigences de Google Play, un bouton « Supprimer mon compte et toutes mes données » est accessible dans les Paramètres de l'application pour effacer instantanément le profil et l'historique Firestore.
- **Politique financière** : NSANGAWEH ne propose aucun prêt, crédit, investissement financier, ni agrégation bancaire directe.
