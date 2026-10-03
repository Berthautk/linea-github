# Weldon

Application de préparation aux concours camerounais : fiches des concours, épreuves classées par année, corrigés entièrement rédigés, préparation à l'oral et salle d'examen chronométrée avec correction de la copie par l'IA.

Fonctionne dans le navigateur (ordinateur, tablette, téléphone), s'installe comme une application (PWA) et peut être publiée sur le Play Store.

## Ce que contient ce dossier

| Dossier | Rôle |
|---|---|
| `web/` | L'application (HTML, CSS, JavaScript sans framework). `data.js` contient le catalogue : concours, épreuves, corrigés, oral. |
| `server/` | Serveur Node.js : sert l'application, gère le paiement Chariow, délivre les accès d'un an, corrige les copies avec l'IA. |
| `tools/build-demo.mjs` | Produit `dist/weldon-demo.html`, une démo autonome en un seul fichier (paiement et correction simulés). |

## Les sections de l'application

1. **Les concours** : présentation de chaque concours (historique, conditions, limite d'âge, épreuves, durées, coefficients, oral, calendrier). Gratuit.
2. **Épreuves** : sujets classés par concours puis par année. Sans abonnement, l'utilisateur choisit **une** épreuve offerte ; les autres sont floutées.
3. **Corrigés rédigés** : chaque sujet entièrement rédigé. Réservé aux abonnés.
4. **Préparer l'oral** : déroulement, questions fréquentes du jury, conseils. Le déroulement est visible gratuitement, le reste est flouté.
5. **Salle d'examen** : choix du concours puis de l'épreuve, 2 minutes de préparation (cahier, stylo, calme), sujet affiché avec le chronomètre officiel (ex. 2 h 30), bouton « J'ai terminé », temps enregistré, photos de la copie, correction par l'IA (note /20, points forts, points faibles, fautes de langue, conseils, gestion du temps), puis corrigé rédigé.

Abonnement : **10 000 FCFA pour 12 mois**, payé une fois via Chariow (Mobile Money MTN / Orange ou carte).

## Lancer en local

```bash
cd weldon/server
npm install
cp .env.example .env      # puis remplir TOKEN_SECRET au minimum
npm start                 # http://localhost:8080
npm test                  # 7 tests (paiement, jetons, webhook) sans réseau
```

Sans clés Chariow, l'application reste en **mode démo** (paiement simulé). Sans `ANTHROPIC_API_KEY`, la correction affiche un exemple.

## Paiement avec Chariow

Chariow fournit une API REST (`https://api.chariow.com/v1`, clé `sk_live_…` en en-tête `Authorization: Bearer`).

### À faire dans le tableau de bord Chariow

1. Créer un produit numérique **« Weldon – Accès complet 1 an »** à 10 000 FCFA et le publier. Noter son identifiant (`prd_…`) → `CHARIOW_PRODUCT_ID`.
2. Créer une clé API dans **Paramètres → API** → `CHARIOW_API_KEY`.
3. Créer un Pulse (webhook) dans **Automatisations → Pulses** vers `https://<votre-domaine>/api/webhooks/chariow`, événement `successful.sale`. Copier le secret de signature `whsec_…` → `CHARIOW_PULSE_SECRET`.

### Déroulement d'un paiement

1. L'utilisateur saisit prénom, nom, e-mail et numéro Mobile Money.
2. Le serveur appelle `POST /v1/checkout` avec `redirect_url = https://<domaine>/?sale={sale_id}` et reçoit `checkout_url`.
3. L'utilisateur paie sur la page Chariow, puis revient dans Weldon.
4. Le serveur vérifie la vente avec `GET /v1/sales/{sale_id}` : statut `completed`, bon produit. Il délivre alors un jeton signé valable 365 jours après la date de paiement.
5. « Retrouver mon accès » (changement de téléphone) : recherche par e-mail dans les ventes de l'année.
6. Un même achat fonctionne sur 3 appareils au plus (`MAX_DEVICES`) pour limiter le partage de compte.

La clé API reste sur le serveur ; elle n'est jamais envoyée au navigateur. Les Pulses sont vérifiés par HMAC-SHA256 sur le corps brut et dédoublonnés par `x-pulse-delivery-id`.

## Correction par l'IA

`server/correction.js` envoie les photos de la copie, le sujet, le barème et le corrigé de référence au modèle Claude, qui lit l'écriture manuscrite et rend une évaluation structurée. Chaque abonné a droit à 15 corrections par mois (`AI_MONTHLY_LIMIT`) pour maîtriser les coûts.

Il n'existe pas d'IA à la fois gratuite et fiable pour lire une copie manuscrite et la noter. Une correction (4 pages photographiées) coûte environ 50 à 150 FCFA en appels API. Un abonné qui utiliserait tout son quota chaque mois coûterait plus que les 10 000 FCFA payés ; en pratique la plupart en utilisent bien moins. Ajuster le quota selon l'usage réel observé.

## Mise en ligne

- **Hébergement** : n'importe quel hébergeur Node.js (Render, Railway, Fly.io, un VPS). Le serveur sert à la fois l'API et l'application. HTTPS est obligatoire (Chariow l'exige pour les Pulses).
- **Base de données** : le prototype enregistre les appareils et quotas dans `server/data/store.json`. Pour la production, passer à PostgreSQL ou Supabase.
- **Play Store** : l'application étant une PWA, on l'emballe avec **Bubblewrap** (Trusted Web Activity) ou **Capacitor**, puis on publie via un compte Google Play Console (25 $ une fois). Google exige ses propres moyens de paiement pour les contenus numériques achetés *dans* une application Play Store : vérifier les règles de facturation de Google Play pour le Cameroun avant la publication. Le site web n'est pas concerné.

## Nom « Weldon »

Vérification du 3 octobre 2026 :

- **Play Store** : aucune application nommée exactement « Weldon ». Il existe des applications dont le nom contient « Weldon » (Weldon Valley School District, Weldon Maintenance…), sans rapport avec l'éducation au Cameroun.
- **Domaines** : `weldon.com` et `weldon.app` sont déjà pris. `weldon.cm`, `weldon.africa`, `weldonapp.com`, `getweldon.com` et `weldon.education` semblaient libres (à confirmer chez un registraire avant achat).
- « Weldon » est aussi un nom de famille anglais courant ; un dépôt de marque auprès de l'OAPI protégerait le nom en zone OAPI.

## Concurrence

| Application | Points forts | Points faibles | Ce que Weldon fait mieux |
|---|---|---|---|
| **Kamerpower** (site + app) | Très grand catalogue d'anciennes épreuves gratuites, actualité des concours | Sujets souvent scannés, peu de corrigés rédigés, publicité, pas d'entraînement | Corrigés rédigés en texte, salle d'examen, lecture confortable sur téléphone |
| **Sujets concours / Prepa Concours** | Sujets regroupés par concours, gratuit | Sujets sans corrigé détaillé, pas de mise en situation | Corrigés complets, correction de la copie |
| **ConcourGuide-CMR** | Guide des concours et orientation, quelques corrigés | Contenu limité, pas de simulation | Fiches détaillées et entraînement chronométré |
| **MyConcours** (Cameroon Desk) | Annonces, contenus de révision, mise en relation avec des centres de préparation | Modèle « plateforme de centres », peu d'entraînement individuel | Parcours individuel complet de la fiche à la correction |
| **MAXA** | Cours structurés, examens blancs chronométrés avec classement, correction critère par critère, IA, hors ligne, prix bas (dès 1 000 FCFA, BAC 500 FCFA/an, 7 jours d'essai) | Peu de concours (ENSPY, ENSPD, médecine, police, CAPESA, BAC) | Couverture de tous les concours (ENAM, EMIA, ENS, gendarmerie…), fiches concours, préparation à l'oral |

MAXA est le concurrent le plus proche. Ses prix sont bas : à 10 000 FCFA, Weldon doit offrir clairement plus (plus de concours, corrigés rédigés, oral, correction de copie).

## Points à décider

1. **Contenu** : le fichier `web/data.js` contient des *sujets d'entraînement* rédigés pour la démo. Les vraies anciennes épreuves doivent être obtenues légalement (sujets publics, accord des auteurs ou rédaction par une équipe d'enseignants). Ne pas recopier les sites concurrents.
2. **Protection du contenu** : dans le prototype, les épreuves sont chargées dans le navigateur et seulement floutées. Avant le lancement, le serveur doit envoyer sujets et corrigés uniquement aux abonnés (route `/api/content` protégée par jeton).
3. **Prix** : propositions à tester : abonnement par concours (ex. 3 000 FCFA), accès complet à 10 000 FCFA, essai gratuit de 7 jours, parrainage via les affiliés Chariow.
4. **Fiches des concours** : chaque fiche porte un champ `a_verifier`. Vérifier les chiffres sur les arrêtés officiels de la session en cours.
