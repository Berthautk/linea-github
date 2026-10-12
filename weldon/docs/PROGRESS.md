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
| C2 Catalogue et orientation | Fait : profil, orientation, conditions d'accès sourcées pour 23 concours, section « Éviter les arnaques ». À faire : éditeur de fiches dans l'admin, conditions des autres concours, validation par le concepteur (tout est `to_verify`). |
| C3 Calendrier, suivi, alertes | Fait : calendrier annuel, suivi (2 gratuits), annonces avec J-n, bandeau « Nouveau », boutons WhatsApp, veille automatique en brouillons (GitHub Actions). À faire : notifications envoyées à distance (Firebase), après vérification de la faisabilité gratuite. |
| C4 Simulation d'épreuve | Fait : « Voir le corrigé ? » après la fin, « Signaler une erreur » (signalements traités dans l'espace concepteur), interrupteur par épreuve, mention « corrigé proposé » ou « officiel ». |
| C5 Plan et méthode | Fait : plan à rebours (3, 5, 8 ou 12 h par semaine, plan d'urgence sous 30 et 14 jours, thèmes faibles prioritaires, première semaine gratuite), séances du jour, carnet d'erreurs, révisions espacées (1, 2, 4, 8, 16 jours), rappel quotidien (application Android). À faire : « Mes questions » (questions personnelles de l'élève). |
| C6 Entraînement | Fait : onglet « S'entraîner », mini-quiz du jour (gratuit), séries de 10, 20 ou 40 questions et concours blanc de 40 questions en 40 minutes (abonnés), tableau « Ma préparation », 216 questions originales FR/EN (9 thèmes) à valider par échantillon (`verifie: non_verifie`). À faire : enrichir la banque, concours blancs par concours. |
| C7 Abonnement | Fait : annuel, mensuelle prête (invisible tant que le produit Chariow n'est pas renseigné), page « Nos promesses ». Non retenu pour l'instant : essai de 7 jours (décision : 1 épreuve gratuite). À décider : lien de paiement pour les parents (le paiement doit se faire avec l'e-mail de l'élève, ou une vérification différente). |
| C8 Extension | À chaque recueil fourni. |
| C9 « Mes cours » | Plus tard. |

## Points d'attention
- Aucun arrêté officiel n'a pu être lu pendant la recherche : les conditions viennent de sites relais (`confiance: secondaire`). Le moteur n'exclut donc jamais un candidat sur cette base (« improbable »).
- Les alertes à distance et la veille automatique : GitHub Actions (gratuit) plutôt que des fonctions Netlify, pour ne pas consommer de crédits.
