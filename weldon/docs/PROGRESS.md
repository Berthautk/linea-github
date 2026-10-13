# Weldon : avancement

Nom retenu : **Weldon** (le prompt v4 dit « Revise Plus »). Design actuel conservé.

## Décisions du concepteur (12 octobre 2026)
- **Prix** : les deux formules, annuelle 10 000 FCFA (en place) et mensuelle 1 500 FCFA (second produit Chariow à créer).
- **Gratuité** : une seule épreuve gratuite par compte (pas d'essai de 7 jours).
- **Priorité** : orientation (profil et « Quel concours pour moi ? »).

## Jalons du prompt v4

| Jalon | État |
|---|---|
| C1 Socle | Fait : comptes, profil concours, section FR/EN, admin, export et suppression du compte, page de confidentialité. |
| C2 Catalogue et orientation | Fait : profil, orientation, conditions d'accès sourcées pour 23 concours, section « Éviter les arnaques ». Éditeur de fiches dans l'espace concepteur : fait (corriger les conditions, les marquer « vérifiées » après lecture de l'arrêté). À faire : conditions des 70 autres concours, validation par le concepteur (tout est encore `to_verify`). |
| C3 Calendrier, suivi, alertes | Fait : calendrier annuel, suivi (2 gratuits), annonces avec J-n, bandeau « Nouveau », boutons WhatsApp, veille automatique en brouillons (GitHub Actions). À faire : notifications envoyées à distance (Firebase), après vérification de la faisabilité gratuite. |
| C4 Simulation d'épreuve | Fait : « Voir le corrigé ? » après la fin, « Signaler une erreur » (signalements traités dans l'espace concepteur), interrupteur par épreuve, mention « corrigé proposé » ou « officiel ». |
| C5 Plan et méthode | Fait : plan à rebours (3, 5, 8 ou 12 h par semaine, plan d'urgence sous 30 et 14 jours, thèmes faibles prioritaires, première semaine gratuite), séances du jour, carnet d'erreurs, révisions espacées (1, 2, 4, 8, 16 jours), rappel quotidien (application Android). À faire : « Mes questions » (questions personnelles de l'élève). |
| C6 Entraînement | Fait : onglet « S'entraîner », mini-quiz du jour (gratuit), séries de 10, 20 ou 40 questions et concours blanc de 40 questions en 40 minutes (abonnés), tableau « Ma préparation », 216 questions originales FR/EN (9 thèmes) à valider par échantillon (`verifie: non_verifie`). À faire : enrichir la banque, concours blancs par concours. |
| C7 Abonnement | Fait : annuel, mensuelle prête (invisible tant que le produit Chariow n'est pas renseigné), page « Nos promesses ». Non retenu pour l'instant : essai de 7 jours (décision : 1 épreuve gratuite). À décider : lien de paiement pour les parents (le paiement doit se faire avec l'e-mail de l'élève, ou une vérification différente). |
| C8 Extension | Prêt à recevoir un recueil à la fois : champs `source`, `source_doc`, `rights`, `a_verifier` contrôlés au démarrage, rapport `tools/ingest/report.mjs`, marche dans `docs/CONTENT_INGEST.md`. Aucun recueil n'est encore ingéré (les 17 épreuves sont des sujets d'entraînement Weldon). |
| C9 « Mes cours » | Plus tard. |

## Points d'attention
- Aucun arrêté officiel n'a pu être lu pendant la recherche : les conditions viennent de sites relais (`confiance: secondaire`). Le moteur n'exclut donc jamais un candidat sur cette base (« improbable »).
- Les alertes à distance et la veille automatique : GitHub Actions (gratuit) plutôt que des fonctions Netlify, pour ne pas consommer de crédits.

## Qualité (12 octobre 2026)
- Lighthouse sur la page de connexion : performance 94, accessibilité 100, bonnes pratiques 96, SEO 100 (vert assombri pour le contraste, `robots.txt` ajouté).
- 57 tests serveur : tokens, comptes, paiement et Pulse, formules, orientation, calendrier, annonces, veille, quiz, plan, éditeur de fiches, export et suppression de compte.
- Application Android : la construction passe avec le plugin de notifications locales.

## Reste à faire ou à décider
- **Notifications envoyées à distance** (nouveau concours, date limite) : faisables gratuitement avec Firebase Cloud Messaging (offre Spark, sans carte). Il faut créer un projet Firebase, déposer `google-services.json` dans l'application Android et créer un compte de service pour un script d'envoi. À lancer seulement si le concepteur le décide.
- **Lien de paiement pour les parents** : le paiement doit aujourd'hui se faire avec l'e-mail du compte de l'élève.
- **« Mes questions »** (v3, non fourni) et **fiches de culture générale** : à préciser.
- Conditions des 70 autres concours et validation de chaque fiche.
- Banque de questions : contrôle par échantillon (`verifie: non_verifie`), puis enrichissement.

## Règle de contenu et de coût (prompt v4 mis à jour)
- Les recueils s'achètent un par un : on avance **un concours à la fois**, et le concepteur ne fournit un recueil que quand il le décide.
- **L'information passe avant les épreuves** : catalogue, orientation, calendrier (C2, C3) sont faits en premier, avec des sources publiques.
- Ordre d'ingestion (`tools/ingest/ordre.json`) : 1) sessions annuelles à fort volume (inspecteur de police en pilote, ENS, ENAM, ENIEG et ENIET, EMIA) ; 2) cycles de plusieurs années (armées, gendarmerie), seulement près de la prochaine session probable ou si la demande est prouvée ; 3) les autres.
- **Périodicité** : chaque fiche peut porter son type (annuelle, tous les N ans, irrégulière), l'historique des sessions et la prochaine session probable, toujours « à confirmer ». Un concours à cycle pluriannuel dont la prochaine session est lointaine est « en pause » : l'orientation, le calendrier et la fiche le disent et proposent des alternatives.

## Périodicité : ce que la recherche montre (13 octobre 2026)
- **Défense (armées, gendarmerie)** : environ **tous les 2 ans** (2017, 2019, 2021 pour la gendarmerie, 2023, 2025), pas tous les 3 ans. L'appel de septembre 2025 a mené à des épreuves en 2026 : « 2023 » et « 2026 » sont deux appels différents. Prochain appel probable vers 2027, déduit du rythme, sans annonce officielle. Source : sites relais, aucun communiqué du MINDEF lu.
- **EMIA** : irrégulière (2023, puis septembre 2025 avec épreuves en janvier 2026). **ENS** : suspendue 2 à 3 ans après 2022/2023, relancée en janvier 2026.
- **Annuels** (sessions 2024 à 2026 confirmées) : gardiens de la paix, inspecteurs, commissaires et officiers de police, ENAM ; douanes (décrets du MINFOPRA lus pour 2024 et 2025).
- Pas assez de sources pour : impôts, médecine, FASA, INJS, CENAJES (« non établie ») ; trésor, santé publique, IEMP (irrégulière).
- Aucun concours n'est « en pause » aujourd'hui avec ces données. Les concepteurs peuvent corriger depuis l'éditeur de fiches.
