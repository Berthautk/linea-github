# Hébergement et plusieurs départements : ce que l'architecture permet

## Faits relevés dans le code
- Hébergement (Firebase ou Netlify) = un seul fichier HTML statique. Données et connexion Google restent dans **Firebase (Firestore + Auth)** dans les deux cas.
- Firestore : chemins fixes `metadata/settings`, `teachers`, `classes`, `entries`, `logs`. **Aucune séparation par établissement ou département** : un projet Firebase = un département. Deux départements sur la même base se mélangeraient.
- La configuration Firebase est écrite dans le HTML : une base par département = un HTML par département.
- Lecture : l'app écoute des collections entières (`entries`, `logs`…) à chaque ouverture, sans cache local persistant : chaque ouverture relit tous les documents. Écriture : seuls les documents modifiés sont réécrits (bien).
- Le PIN est un contrôle côté navigateur au-dessus de la connexion Google ; la vraie protection est la liste `allowedEmails` et les règles Firestore (non consultées).

## Quotas Firebase Spark (gratuit, à re-vérifier dans la console)
Firestore : 50 000 lectures/jour, 20 000 écritures/jour, 1 Gio. Hosting : 10 Go, 360 Mo/jour de transfert.
Estimation : en fin d'année un département a ~1 000 à 1 500 documents (`entries` + `logs`). 10 ouvertures/jour ≈ 10 000 à 15 000 lectures : acceptable pour un département, **dépassé à partir de 3-4 départements sur la même base**.

## Options
1. **Un projet Firebase par département ou établissement** (gratuit chacun, quotas séparés, aucun mélange, pas de refonte). Coût : créer le projet, activer Firestore/Auth Google, publier les règles, générer le HTML. Chaque AP est propriétaire de ses données.
2. **Une base partagée multi-départements** : refonte nécessaire (préfixer tous les chemins par établissement/département, règles de sécurité par rôle, lectures limitées au trimestre actif, cache local, purge des `logs`) + passage probable au plan payant au-delà de quelques départements : exclu par la contrainte « jamais Blaze ».
