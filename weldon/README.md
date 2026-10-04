# Weldon

Application de préparation aux concours camerounais : fiches des concours, épreuves classées par année, corrigés entièrement rédigés, préparation à l'oral et salle d'examen chronométrée avec correction de la copie par l'IA.

Fonctionne dans le navigateur (ordinateur, tablette, téléphone), s'installe comme une application (PWA) et peut être publiée sur le Play Store.

## Ce que contient ce dossier

| Dossier | Rôle |
|---|---|
| `web/` | L'application (HTML, CSS, JavaScript sans framework), en français et en anglais. |
| `content/` | Le catalogue : `concours.json` (fiches FR/EN), `epreuves.json` (sujets, barèmes, corrigés), `oral.json`, `groupes.json`. |
| `server/` | Serveur Node.js : sert l'application, gère le paiement Chariow, délivre les accès d'un an, corrige les copies avec l'IA. |
| `tools/build-demo.mjs` | Produit `dist/weldon-demo.html`, une démo autonome en un seul fichier (paiement et correction simulés). |

## Les sections de l'application

Chaque élève crée **son propre compte** (e-mail + mot de passe), puis choisit sa **section francophone ou anglophone**. Tout le contenu (fiches, épreuves, corrigés, oral, interface) suit la section choisie ; on peut en changer depuis « Mon compte ».

Les épreuves sont classées par **école** (regroupées par ministère : DGSN, MINDEF, MINESUP, MINFOPRA…), puis par **session** (2025, 2024…), avec dans chaque session les épreuves du concours (ex. Rédaction / Essay writing et Culture générale / General knowledge).

1. **Les concours** : présentation de chaque concours (historique, conditions, limite d'âge, épreuves, durées, coefficients, oral, calendrier). Gratuit.
2. **Épreuves** : école → session → épreuve. Sans abonnement, chaque compte choisit **une** épreuve offerte ; les autres sont verrouillées. Le serveur n'envoie le texte qu'aux comptes autorisés.
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
npm test                  # 9 tests (comptes, contenu protégé, paiement, webhook) sans réseau
```

Sans clés Chariow, l'application reste en **mode démo** (paiement simulé). Sans `ANTHROPIC_API_KEY`, la correction affiche un exemple.

## Paiement avec Chariow

Chariow fournit une API REST (`https://api.chariow.com/v1`, clé `sk_live_…` en en-tête `Authorization: Bearer`).

### À faire dans le tableau de bord Chariow (app.chariow.com)

1. **Créer le produit** : un produit de type « Fichier téléchargeable » nommé **« Weldon – Accès complet 1 an »**, prix 10 000 FCFA (joindre un petit PDF de bienvenue), puis le **publier**. L'API ne voit que les produits publiés.
2. **Créer une clé API** : **Settings → API Keys → Create API Key**. La clé (`sk_live_…`) ne s'affiche qu'une fois : la copier tout de suite dans `server/.env` → `CHARIOW_API_KEY`. Ne jamais la mettre dans le code de l'application web.
3. **Vérifier la connexion** : `cd weldon/server && npm run check-chariow`. Le script affiche le nom de la boutique et la liste des produits publiés avec leur identifiant `prd_…`. Copier celui de Weldon → `CHARIOW_PRODUCT_ID`.
4. **Créer le Pulse** (une fois l'application en ligne en HTTPS) : **Automation → Pulses → Add Pulse**, URL `https://<votre-domaine>/api/webhooks/chariow`, événement `successful.sale`. Ouvrir le Pulse, onglet **Overview → Signing secret**, copier le secret `whsec_…` → `CHARIOW_PULSE_SECRET`.

### Déroulement d'un paiement

1. L'élève connecté saisit son numéro Mobile Money ; le paiement est ouvert au nom et à l'e-mail de son compte.
2. Le serveur appelle `POST /v1/checkout` avec `redirect_url = https://<domaine>/?sale={sale_id}` et reçoit `checkout_url`.
3. L'utilisateur paie sur la page Chariow, puis revient dans Weldon.
4. Le serveur vérifie la vente avec `GET /v1/sales/{sale_id}` : statut `completed`, bon produit, **même e-mail que le compte**. Le compte devient abonné pour 365 jours après la date de paiement.
5. « Vérifier mon paiement » : recherche chez Chariow des ventes payées avec l'e-mail du compte (utile si le retour automatique a échoué).
6. L'élève peut se connecter sur autant d'appareils qu'il veut avec son e-mail et son mot de passe. Changer de mot de passe déconnecte les autres appareils.

La clé API reste sur le serveur ; elle n'est jamais envoyée au navigateur. Les Pulses sont vérifiés par HMAC-SHA256 sur le corps brut et dédoublonnés par `x-pulse-delivery-id`.

## Correction par l'IA

`server/correction.js` envoie les photos de la copie, le sujet, le barème et le corrigé de référence au modèle Claude, qui lit l'écriture manuscrite et rend une évaluation structurée. Chaque abonné a droit à 15 corrections par mois (`AI_MONTHLY_LIMIT`) pour maîtriser les coûts.

Il n'existe pas d'IA à la fois gratuite et fiable pour lire une copie manuscrite et la noter. Une correction (4 pages photographiées) coûte environ 50 à 150 FCFA en appels API. Un abonné qui utiliserait tout son quota chaque mois coûterait plus que les 10 000 FCFA payés ; en pratique la plupart en utilisent bien moins. Ajuster le quota selon l'usage réel observé.

## Mise en ligne

- **Hébergement** : n'importe quel hébergeur Node.js (Render, Railway, Fly.io, un VPS). Le serveur sert à la fois l'API et l'application. HTTPS est obligatoire (Chariow l'exige pour les Pulses).
- **Base de données** : les comptes sont enregistrés dans PostgreSQL via `DATABASE_URL` (Neon propose une base gratuite). Sans elle, un fichier local est utilisé : sur Render gratuit il est effacé à chaque redémarrage.
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

## Accès concepteur

Les e-mails listés dans `ADMIN_EMAILS` ont **tout l'accès sans payer** et un **espace concepteur** (Mon compte → Espace concepteur) :
- liste des comptes inscrits, avec leur section et leur statut ;
- « Offrir un accès » : donne un accès complet pour N jours à un compte existant (testeurs, enseignants partenaires).

## Ajouter des épreuves

Chaque épreuve est une entrée de `content/epreuves.json` :

```json
{
  "id": "gp-2023-redaction-fr",
  "concours": "gardiens-paix",
  "lang": "fr",
  "annee": 2023,
  "matiere": "Rédaction",
  "duree": 120,
  "sujet": "Texte du sujet…",
  "bareme": "Barème…",
  "corrige": "Corrigé entièrement rédigé…"
}
```

`lang` vaut `fr` (section francophone) ou `en` (section anglophone). L'application classe toute seule par école puis par session. Retirer `"exemple": true` pour un vrai sujet officiel.

## Protection contre les captures d'écran

Sur le web, **aucun site ne peut techniquement empêcher une capture d'écran** (le navigateur ne le permet pas). Weldon combine donc :
- un **filigrane** au nom et à l'e-mail de l'élève sur chaque sujet et corrigé : une capture qui circule désigne son auteur ;
- le contenu est **masqué** dès que l'application perd le focus (outil de capture, changement d'application) ;
- les raccourcis de capture (Impr. écran, Cmd+Maj+3/4/5, Win+Maj+S) masquent le contenu et vident le presse-papiers ;
- copier, couper, clic droit, sélection et impression sont bloqués sur les sujets et corrigés ;
- le texte n'est envoyé qu'aux comptes autorisés.

Dans l'**application Android** (Play Store, via Capacitor), le blocage devient réel : le drapeau `FLAG_SECURE` interdit captures et enregistrements d'écran (l'écran apparaît noir) :

```java
// android/app/src/main/java/.../MainActivity.java
import android.os.Bundle;
import android.view.WindowManager;
public class MainActivity extends BridgeActivity {
  @Override public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    getWindow().setFlags(WindowManager.LayoutParams.FLAG_SECURE, WindowManager.LayoutParams.FLAG_SECURE);
  }
}
```

## Points à décider

1. **Contenu** : `content/epreuves.json` contient des *sujets d'entraînement* rédigés pour la démo. Les vraies anciennes épreuves doivent être obtenues légalement (sujets publics, accord des auteurs ou rédaction par une équipe d'enseignants). Ne pas recopier les sites concurrents.
2. **Mot de passe oublié** : il faut un service d'envoi d'e-mails (ex. Brevo, gratuit jusqu'à 300 e-mails/jour) pour envoyer un lien de réinitialisation.
3. **Prix** : propositions à tester : abonnement par concours (ex. 3 000 FCFA), accès complet à 10 000 FCFA, essai gratuit de 7 jours, parrainage via les affiliés Chariow.
4. **Fiches des concours** : chaque fiche porte un champ `a_verifier`. Vérifier les chiffres sur les arrêtés officiels de la session en cours.
