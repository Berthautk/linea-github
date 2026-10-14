# Sécurité de Rekort : ce qui est protégé, et comment le vérifier

Audit fait en se mettant à la place d'un attaquant (octobre 2026). Chaque point ci-dessous est couvert par un test automatique (`npm test`, `tests/api.test.mjs`) ou par le parcours navigateur (`tests/e2e/run.mjs`).

## Ce qui est protégé

| Attaque tentée | Défense |
|---|---|
| Deviner un mot de passe | Mots de passe stockés avec scrypt (jamais en clair). 8 essais ratés / 10 min par (identifiant + adresse) et 40 par identifiant. Un inconnu ne peut donc pas bloquer la connexion d'un collègue depuis une autre adresse. Mots de passe évidents refusés (123456, identifiant…). |
| Se faire passer pour quelqu'un d'autre (jeton falsifié) | Jetons signés (HMAC), liés à l'identité du compte et à sa version : changer un mot de passe, récupérer ou renommer un compte annule tous les anciens jetons. Jetons modifiés, sans signature ou « alg: none » refusés. |
| Lire ou écrire chez un autre département | Chaque appel vérifie le jeton ; toutes les données sont rangées sous l'identifiant du département du jeton. |
| Un enseignant qui se donne les droits de l'animateur, écrit chez un collègue ou modifie le département | Refusé côté serveur (pas seulement caché dans l'écran). Une saisie est toujours rattachée à son auteur. Les routes d'équipe sont réservées à l'animateur. |
| Injection de données piégées (`__proto__`, nombres énormes, dates dans le futur) | Toutes les données reçues sont reconstruites champ par champ ; tailles, nombres et dates limités. |
| Inscriptions en masse pour saturer le stockage | 5 inscriptions par heure et par adresse, 300 par jour au total. Option : définir la variable `REKORT_SIGNUP_CODE` sur Netlify pour que seules les personnes qui connaissent ce code puissent créer un département. |
| Un site pirate qui fait appeler l'API par le navigateur d'un utilisateur | Appels refusés si l'origine n'est pas celle de Rekort, ou si le contenu n'est pas du JSON. Aucun cookie n'est utilisé. |
| Code injecté dans une page (XSS) | Les textes saisis sont toujours échappés. En plus, une politique de sécurité (CSP) interdit tout script extérieur ou en ligne et toute connexion vers un autre site ; pages non intégrables dans un cadre (anti-clickjacking) ; HTTPS imposé (HSTS). |
| Numéros de téléphone et identifiants de connexion des collègues | Cachés aux autres enseignants : seul l'animateur les voit. |
| Savoir quels identifiants existent | Connexion et récupération répondent de la même façon pour un identifiant inconnu ; un compte désactivé n'est révélé qu'avec le bon mot de passe. |
| Retrouver un compte avec le code de récupération | Code long, stocké chiffré, limité en essais, renouvelé après usage. |

## À savoir (choix assumés)

- Tous les enseignants d'un département peuvent **lire** les saisies du département (heures, leçons) : c'est voulu pour le suivi collectif. Ils ne peuvent écrire que les leurs.
- Les données restent aussi sur chaque téléphone (hors ligne). Un téléphone perdu et déverrouillé donne accès à l'application connectée : utilisez le verrouillage de l'écran, et « Se déconnecter et effacer cet appareil » sur un appareil partagé.

## Hors de l'application (à régler sur GitHub / Firebase)

- Le dépôt GitHub est **public** : il contient aussi des emplois du temps de collègues (`emplois_du_temps/`) et des documents de cours. Si ces fichiers ne doivent pas être publics, déplacez-les dans un dépôt privé ou rendez le dépôt privé (Settings › Danger zone). Les données réelles de Rekort (sauvegardes) ne sont **jamais** dans le dépôt (`private/` est ignoré).
- L'ancienne application EasyProf (dossier `easyprof/`) contient la clé web d'un projet Firebase. Une clé web n'est pas un secret, mais si ce projet n'est plus utilisé, supprimez-le ou désactivez-le dans la console Firebase.
