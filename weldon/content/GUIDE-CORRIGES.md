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
| `bareme` | barème, une ligne par critère : `Critère : N pts` (le total fait 20) |
| `corrige` | corrigé entièrement rédigé |

Un sujet officiel n'a pas de champ `exemple`. Il est alors rangé sous « Session <année> ». Les sujets écrits par Weldon portent `"exemple": true` et sont rangés à part, dans « Sujets d'entraînement Weldon ».

## 3. Rédaction des corrigés

**Quand le document acheté contient un corrigé**, il est recopié tel quel. Il sert aussi de **modèle** pour les autres sujets du même concours : même structure, même longueur, même niveau d'exigence.

**Quand il n'y a pas de corrigé**, le corrigé est rédigé en suivant le modèle du concours :

- **Rédaction / Essay writing** : copie modèle complète, telle qu'un très bon candidat l'écrirait en temps limité. Introduction (amorce, problématique, annonce du plan), développement en deux ou trois parties avec sous-parties et exemples camerounais précis, conclusion avec ouverture.
- **Culture générale / General knowledge (questions)** : réponse exacte à chaque question, avec une phrase d'explication quand elle aide à retenir.
- **Dissertation** : plan détaillé rédigé, avec les arguments et les exemples attendus dans chaque partie.
- **Mathématiques et sciences** : solution pas à pas, avec les calculs intermédiaires et le résultat encadré.

Le corrigé s'écrit dans la langue de la section (français ou anglais). Les faits (dates, chiffres, institutions) sont vérifiés.

## 4. Barème et auto-correction

Le barème est indispensable : à la fin d'une épreuve en salle d'examen, l'élève lit le corrigé et se note **ligne par ligne** avec ce barème. L'application calcule la note sur 20. Une ligne de barème par critère, au format `Critère : N pts`.
