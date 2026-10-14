# Mettre Rekort en ligne sur Netlify (sans ligne de commande)

Durée : environ 10 minutes, une seule fois. Aucune carte bancaire. Après cela, **vous n'avez plus jamais rien à déployer vous-même** : quand le code change, c'est l'équipe technique (moi) qui publie ; vos collègues ouvrent simplement le lien.

## 1. Créer le compte Netlify
1. Allez sur https://app.netlify.com et choisissez **Sign up with GitHub** (le compte GitHub qui contient le dépôt `linea-github`).
2. Autorisez Netlify à lire vos dépôts quand il le demande.

## 2. Relier le dépôt
1. Cliquez **Add new project → Import an existing project → Deploy with GitHub**.
2. Choisissez le dépôt **linea-github**.
3. Réglages à renseigner :
   - **Branch to deploy** : `ccr-3666762a-uo25fr` (ou `main` une fois les modifications fusionnées).
   - **Base directory** : `easyprof6`
   - **Build command** et **Publish directory** : ne rien changer, ils sont lus dans `netlify.toml` (`publish = site`, fonctions dans `netlify/functions`).
4. Cliquez **Deploy**. Au bout d'une à deux minutes, le site est en ligne sur une adresse du type `https://xxxx.netlify.app`.

## 3. Choisir l'adresse
**Project configuration → General → Project details → Change project name** : par exemple `rekort` (si le nom est libre ; sinon `rekort-cmr`) ; l'adresse devient `https://rekort.netlify.app`. C'est ce lien que vous donnerez à vos collègues.

## 4. Vérifier que tout marche (5 minutes)
1. Ouvrez l'adresse, cliquez **Je n'ai pas de compte : créer mon département**, créez votre compte.
2. Notez le **code de récupération** affiché une seule fois.
3. Dans **Réglages › Sauvegarde et import**, importez la sauvegarde de l'ancienne application (Profil › sauvegarde) pour reprendre vos classes, collègues et saisies.
4. Dans **Réglages › Équipe**, ouvrez chaque collègue : ajoutez son emploi du temps et ses leçons prévues par classe. Transmettez-lui son identifiant et son mot de passe (bouton WhatsApp).
5. Dans **Réglages › Heures hors application**, utilisez « Démarrer sans être en retard » pour que personne ne démarre avec du retard sur les semaines déjà passées.

## 5. Installer sur le téléphone
Ouvrir le lien dans Chrome, menu ⋮ › **Installer l'application** (ou **Ajouter à l'écran d'accueil**). L'application s'ouvre ensuite en plein écran et fonctionne **sans Internet** ; elle se synchronise dès qu'il y a du réseau.

## 6. À savoir sur l'offre gratuite (chiffres de la documentation Netlify)
- **300 crédits par mois**, limite stricte : quand ils sont épuisés, le site est mis en pause jusqu'au mois suivant (les téléphones qui ont déjà l'application continuent de fonctionner hors ligne et se resynchronisent après).
- Tarifs : **15 crédits** par déploiement en production · **2 crédits** pour 10 000 requêtes · **20 crédits** par Go transféré · **10 crédits** par Go-heure de calcul des fonctions.
- C'est pourquoi `netlify.toml` ne déploie automatiquement que si le message du dernier commit contient **`[deploy]`**. Publication manuelle : **Deploys → Trigger deploy → Deploy project without cache**.
- La synchronisation passe par le serveur (c'est ce qui permet aux collègues de partager leurs données), mais elle est économe : l'application garde tout sur le téléphone, ne s'adresse au serveur que **quand elle est ouverte à l'écran** (au plus une fois toutes les 3 minutes, plus un envoi 2 secondes après chaque saisie) et le code de l'application est mis en cache sur le téléphone (presque aucun transfert au quotidien).
- Ordre de grandeur : une centaine d'utilisateurs actifs consomment largement moins de 100 crédits par mois. Surveillance : **Team settings → Usage and billing**.

## 7. Plusieurs départements, plusieurs établissements
Rien à faire : chaque personne qui crée un compte obtient **son propre département**, isolé des autres (ses données ne sont visibles que de son équipe). Un collègue sans compte crée simplement le sien ou reçoit un identifiant de son animateur.

## En cas de problème
- **« Pas de connexion à Internet »** à la première connexion : normal hors réseau ; la première connexion et la création d'un compte exigent Internet.
- **Session expirée** : le bandeau orange propose « Se reconnecter » ; vos données ne sont pas perdues.
- **Mot de passe oublié** : l'animateur utilise son code de récupération ; un collègue demande à son animateur de réinitialiser son mot de passe (Réglages › Équipe).

## Changer de compte Netlify (crédits épuisés) sans perdre les données

Les comptes et les saisies sont stockés chez Netlify (Blobs) : un nouveau site Netlify démarre **vide**. Marche à suivre :

1. **Avant tout**, sur le téléphone de l'animateur (qui a toutes les données synchronisées) : Réglages › Sauvegarde et import › « Exporter » → garder le fichier `rekort-….json` (données réelles : ne jamais le publier).
2. Sur le nouveau compte Netlify : Add new site › Import from Git › ce dépôt, branche `ccr-3666762a-uo25fr` (voir plus haut). Choisir un nom de site libre (ex. `rekort-gbhs`).
3. Ouvrir la nouvelle adresse, « Créer mon département », avec l'identifiant de l'animateur. Noter le code de récupération.
4. Réglages › Sauvegarde et import › Importer : choisir le fichier de l'étape 1. Rekort recrée les comptes des collègues (même identifiant, **nouveau mot de passe**), remet classes, emplois du temps et saisies, puis affiche la liste des accès à envoyer par WhatsApp.
5. Les collègues utilisent la nouvelle adresse (ouvrir, « Ajouter à l'écran d'accueil »).
