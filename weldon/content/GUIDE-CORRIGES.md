# Guide d'intégration des sujets et de rédaction des corrigés

Ce guide décrit comment les sujets achetés et scannés sont intégrés dans Weldon, et comment les corrigés sont rédigés.

## 1. Ce que le concepteur fournit

Pour chaque lot, un PDF (ou des photos) par sujet, avec :
- le concours (ex. « Élèves gardiens de la paix ») ;
- l'année de la session ;
- la section : francophone ou anglophone ;
- le corrigé s'il existe dans le document acheté.

## 2. Intégration du sujet

Chaque sujet devient une entrée de `content/epreuves.json` :

| Champ | Contenu |
|---|---|
| `id` | `<concours>-<année>-<matière>-<fr/en>` |
| `concours` | identifiant du concours dans `concours.json` |
| `lang` | `fr` ou `en` |
| `annee` | année de la session |
| `matiere` | intitulé exact de l'épreuve (ex. « Rédaction », « Essay writing ») |
| `duree` | durée officielle en minutes |
| `sujet` | texte du sujet recopié fidèlement, sans correction ni ajout |
| `grille` | grille d'auto-correction (voir § 4), le total fait 20 |
| `corrige` | corrigé entièrement rédigé |

Un sujet officiel n'a pas de champ `exemple`. Il est alors rangé sous « Session <année> ». Les sujets écrits par Weldon portent `"exemple": true` et sont rangés à part, dans « Sujets d'entraînement Weldon ».

## 3. Rédaction des corrigés

**Quand le document acheté contient un corrigé**, il est recopié tel quel. Il sert aussi de **modèle** pour les autres sujets du même concours : même structure, même longueur, même niveau d'exigence.

**Quand il n'y a pas de corrigé**, le corrigé est rédigé en suivant le modèle du concours :

- **Rédaction, dissertation / Essay writing** : copie modèle **entièrement rédigée**, telle qu'un très bon candidat la rendrait : ni titres, ni numéros, des paragraphes séparés par une ligne.
  - Introduction : amener le sujet, poser le problème, annoncer le plan.
  - Développement en deux parties : plan dialectique (thèse, antithèse) pour un sujet à discuter, plan analytique (causes et solutions, avantages et dangers…) quand le sujet le demande. Chaque partie s'ouvre sur une phrase qui annonce son idée directrice ; chaque argument tient en un paragraphe (idée, explication, exemple camerounais précis) ; des connecteurs logiques relient les idées. Entre les deux parties : une petite synthèse et une phrase de transition.
  - Conclusion : bilan, réponse claire au problème, ouverture.
  - Après la copie, une ligne `———` puis « Comment cette copie est construite : » qui cite le début de chaque étape (amener le sujet, poser le problème…), pour que l'élève compare avec sa copie.
- **Culture générale / General knowledge (questions)** : pour chaque question, trois lignes : `Question n (x pts) : …`, `Réponse : …` en **phrase complète** qui reprend la question (ex. « Le plus grand continent au monde est l'Asie ; elle couvre environ 44,6 millions de km², soit près de 30 % des terres émergées. »), puis `Points : …` qui dit comment répartir les points.
- **Mathématiques et sciences** : solution pas à pas, avec les calculs intermédiaires et le résultat encadré.

Le corrigé s'écrit dans la langue de la section (français ou anglais). Les faits (dates, chiffres, institutions) sont vérifiés.

## 4. Barème et auto-correction

À la fin d'une épreuve en salle d'examen, l'élève lit le corrigé puis se note **critère par critère**. Chaque critère dit ce qui vaut tous les points, la moitié ou zéro ; l'application calcule la note sur 20.

Les grilles communes sont dans `content/grilles.json` ; une épreuve y renvoie par leur nom :

- `"grille": ["dissertation"]` pour une rédaction ou une dissertation sur 20 : introduction 3 pts (amener le sujet, poser le problème, annoncer le plan : 1 pt chacun), développement 12 pts (première partie 5, deuxième partie 5, transition et connecteurs 2), conclusion 3 pts (bilan, réponse au problème, ouverture : 1 pt chacun), présentation et langue 2 pts ;
- `"dissertation-partie-b"` : la même grille sur 10 points, pour la dissertation d'une épreuve en deux parties ;
- un bloc de questions, une ligne par question, avec l'aide commune `"questions"` (phrase complète exigée) :

```json
"grille": [
  { "titre": "Partie A – Questions", "aide": "questions",
    "criteres": [ { "label": "Question 1 – capitales", "pts": 1 }, { "label": "Question 2 – régions", "pts": 2 } ] },
  "dissertation-partie-b"
]
```

Le serveur refuse de démarrer si une grille ne fait pas 20 points.
