# Réponses aux questionnaires de Play Console

## Sécurité des données (*Règles et programmes > Contenu de l'application > Sécurité des données*)

| Question | Réponse |
|---|---|
| Votre application collecte-t-elle ou partage-t-elle des types de données utilisateur obligatoires ? | **Non** |
| Toutes les données sont-elles chiffrées en transit ? | Sans objet : aucune donnée ne quitte l'appareil (répondre *Oui* si la question est imposée : la page est servie en HTTPS) |
| Les utilisateurs peuvent-ils demander la suppression de leurs données ? | Les données restent sur l'appareil ; l'utilisateur les supprime lui-même (« Mes documents » ou désinstallation) |

Pourquoi « Non » : photos, documents, texte reconnu et signature sont traités et
enregistrés **uniquement sur l'appareil** (IndexedDB). Google définit la
« collecte » comme l'envoi de données hors de l'appareil : il n'y en a pas. Le
partage d'un fichier par l'utilisateur (WhatsApp, e-mail…) est une action de
l'utilisateur via une autre application, ce n'est pas une collecte.

## Classification du contenu (questionnaire IARC)

- Adresse e-mail : la vôtre.
- Catégorie : **Utilitaire, productivité, communication ou autre**.
- Violence, peur, sexualité, langage grossier, drogues, jeux d'argent : **Non** à tout.
- Les utilisateurs peuvent-ils interagir ou échanger du contenu entre eux dans l'application ? **Non**
  (le partage passe par d'autres applications choisies par l'utilisateur).
- Partage de la position : **Non**. Achats numériques : **Non**.
- Navigateur web ou moteur de recherche non filtré : **Non**.

Résultat attendu : **PEGI 3 / Tout public**.

## Public cible et contenu

- Tranches d'âge : **18 ans et plus** (conseillé : cela évite les règles « Familles »
  et n'empêche personne d'installer l'application).
- L'application attire-t-elle les enfants ? **Non**.

## Annonces

- Votre application contient-elle des annonces ? **Non**.

## Autorisations

La TWA ne demande **aucune autorisation Android sensible** : l'appareil photo est
ouvert par le sélecteur de fichiers du système (l'application appareil photo du
téléphone), pas directement par VraiScan.
