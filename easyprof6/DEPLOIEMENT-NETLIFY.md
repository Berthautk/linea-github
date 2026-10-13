# Mettre EasyProf 6 en ligne sur Netlify (sans ligne de commande)

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
**Project configuration → General → Project details → Change project name** : par exemple `easyprof-cmr` ; l'adresse devient `https://easyprof-cmr.netlify.app`. C'est ce lien que vous donnerez à vos collègues.

## 4. Vérifier que tout marche (5 minutes)
1. Ouvrez l'adresse, cliquez **Je n'ai pas de compte : créer mon département**, créez votre compte.
2. Notez le **code de récupération** affiché une seule fois.
3. Dans **Réglages › Sauvegarde et import**, importez la sauvegarde de l'ancienne application (Profil › sauvegarde) pour reprendre vos classes, collègues et saisies.
4. Dans **Réglages › Équipe**, ouvrez chaque collègue : ajoutez son emploi du temps et ses leçons prévues par classe. Transmettez-lui son identifiant et son mot de passe (bouton WhatsApp).
5. Dans **Réglages › Heures hors application**, utilisez « Démarrer sans être en retard » pour que personne ne démarre avec du retard sur les semaines déjà passées.

## 5. Installer sur le téléphone
Ouvrir le lien dans Chrome, menu ⋮ › **Installer l'application** (ou **Ajouter à l'écran d'accueil**). L'application s'ouvre ensuite en plein écran et fonctionne **sans Internet** ; elle se synchronise dès qu'il y a du réseau.

## 6. À savoir sur l'offre gratuite
- Netlify donne **300 crédits par mois** sur l'offre gratuite. Quand ils sont épuisés, **le site est mis en pause jusqu'au mois suivant** (les téléphones qui l'ont déjà installé continuent de fonctionner hors ligne et se resynchronisent après la pause).
- Un déploiement coûte des crédits. C'est pourquoi `netlify.toml` n'autorise un déploiement automatique que lorsque le message du dernier commit contient **`[deploy]`**. Si vous voulez publier à la main : **Deploys → Trigger deploy → Deploy project without cache**.
- Pour surveiller la consommation : **Team settings → Usage and billing**.
- Chaque ouverture de l'application, synchronisation ou saisie en ligne consomme très peu ; quelques dizaines d'utilisateurs actifs tiennent largement dans le quota.

## 7. Plusieurs départements, plusieurs établissements
Rien à faire : chaque personne qui crée un compte obtient **son propre département**, isolé des autres (ses données ne sont visibles que de son équipe). Un collègue sans compte crée simplement le sien ou reçoit un identifiant de son animateur.

## En cas de problème
- **« Pas de connexion à Internet »** à la première connexion : normal hors réseau ; la première connexion et la création d'un compte exigent Internet.
- **Session expirée** : le bandeau orange propose « Se reconnecter » ; vos données ne sont pas perdues.
- **Mot de passe oublié** : l'animateur utilise son code de récupération ; un collègue demande à son animateur de réinitialiser son mot de passe (Réglages › Équipe).
