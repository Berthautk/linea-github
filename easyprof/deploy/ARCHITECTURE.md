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

## Feuille de route : une seule application pour tous (comme une appli grand public)
Pourquoi ce n'est pas déjà le cas : EasyProf a été conçu pour **un** département ; toutes les données sont dans les mêmes chemins Firestore. Les applications comme Binance sont « multi-locataires » : un seul déploiement, un seul code, et les données de chaque utilisateur sont rangées sous son identifiant, protégées par des règles de sécurité. Personne ne redéploie quand un utilisateur s'inscrit ; on ne redéploie que quand le **code** change.

Ce qu'il faudrait faire (réalisable sur Spark) :
1. Ranger les données sous `departments/{deptId}/…` (metadata, teachers, classes, entries, logs) et créer `users/{uid}` = {deptId, rôle}.
2. Règles Firestore : lecture/écriture seulement si l'utilisateur appartient au département ; un enseignant n'écrit que ses propres saisies.
3. Inscription : un AP crée son département (établissement, discipline), invite ses collègues par e-mail ; chacun se connecte avec Google et arrive dans son département.
4. Réduire les lectures (cache local persistant, ne charger que le trimestre actif, purger les `logs`) pour rester dans les 50 000 lectures/jour gratuites avec plusieurs départements.
5. Migrer les données de GBHS Garoua dans la nouvelle structure.
Limites : test réel impossible sans accès au projet (émulateur Firebase à installer) ; les règles de sécurité sont critiques et doivent être relues avant ouverture à d'autres établissements ; au-delà de quelques dizaines de départements actifs le quota gratuit ne suffirait plus.
