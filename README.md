# Leçons de géographie au format allégé — DGCAST Garoua (Mr KAMDEM)

70 PowerPoint reconstruits au format validé du pilote (`gen2.js` / `pilot_v2.js`) :

| Dossier | Contenu | Leçons |
|---|---|---|
| `lecons/F2T/` | Form 2 Technical (2 périodes, **5 activités**) | Lesson 1 (problèmes, sem. 7), Lesson 2 (climat, sem. 8), S01 à S22 — 24 fichiers |
| `lecons/F4/` | Form 4 (50 minutes, **3 activités**) | L1 à L42, FS1, FS2, PW1, PW2 — 46 fichiers |

Chaque fichier se termine par `_v2.pptx`, comme le pilote.

## Second cycle : Lower Sixth Arts (LSA) et Upper Sixth Arts (USA)

Même format allégé, avec deux différences : chaque leçon dure **2 périodes (5 activités)**, et chaque point du résumé au tableau compte **2 phrases, 3 au maximum**, au lieu d'une seule. Le contenu suit le **programme national 2019 (MINESEC)**, comparé aux leçons du Drive. Les leçons sont classées par branche. Toutes les Further Studies (FS) et tous les Practical Works (PW) du programme sont traités en classe et rangés dans le dossier de leur branche. Seuls les « Guided Works » de type *Project Based Learning* (projets de terrain rendus sous forme de rapport) ne sont pas préparés en PowerPoint : dans les modules 1 à 5, tous les Guided Works sont de ce type.

| Dossier | Contenu | Leçons |
|---|---|---|
| `lecons/LSA/Climatology/` | Module 1 (météorologie, climatologie) | L1 à L21, FS1 (perturbations tropicales), FS2 (observation et prévision du temps), FS3 (climat du Cameroun) — 24 fichiers |
| `lecons/LSA/Hydrology/` | Module 1 (hydrologie) | L22 à L34, FS4 (réseau hydrographique du Cameroun), PW1 (hydrogrammes et régimes), PW2 (morphométrie des bassins) — 16 fichiers |
| `lecons/LSA/Geomorphology/` | Module 2 (géomorphologie) | L1 à L16, FS1 (premières théories), FS2 (expansion des fonds océaniques), FS3 (relief du Cameroun) — 19 fichiers |
| `lecons/LSA/Biogeography/` | Module 3 (sols, végétation, écosystèmes) | L1 à L28, FS1 (sols du Cameroun), FS2 (végétation du Cameroun), FS3 (services des écosystèmes), PW1 (texture du sol), PW2 (productivité) — 33 fichiers |
| `lecons/USA/Population Geography/` | Upper Sixth, module 4 (géographie de la population) | L1 à L18, PW1 à PW4 (cartes de densité, altitude, pyramides, indices démographiques), FS1 (population du Cameroun) — 23 fichiers |
| `lecons/USA/Settlement Geography/` | Upper Sixth, module 5 (géographie de l'habitat) | L1 à L22, PW1 (indice du plus proche voisin), PW2 (zones d'influence, loi de Reilly), FS1 (urbanisation au Cameroun) — 25 fichiers |
| `lecons/USA/Economic Geography/` | Upper Sixth, module 6 (activités économiques) | L1 à L11 et L13 à L31 (le programme n'a pas de leçon 12), PW1 (rente de situation), PW2 (quotient de localisation), PW3 (indice matière, isodapanes), PW4 (coûts de transport), PW5 (indices de réseau), FS1 à FS7 (agriculture, forêts, mines et énergie, eau, industrie, transports, tourisme au Cameroun) — 42 fichiers |
| `lecons/USA/Environment and Development/` | Upper Sixth, module 7 (environnement et développement) | L1 à L14 (pollution, déforestation et désertification, érosion des sols, changement climatique, réchauffement, inondations, développement, stratégies, NPI, mondialisation, commerce, blocs commerciaux, OMC et APE, aide), FS1 (contrastes de développement au Cameroun) — 15 fichiers |

Nom des fichiers : `LSA_GEOMO_L01_Origin_of_the_Earth.pptx`. Reconstruire : `cd /home/claude/f4 && node v2_lsa_geo.js` (runner `sixth.js`, schémas `sources/maps/big_lsa_geo.py`).

## Ce que contient chaque leçon

- Page de garde, informations, objectifs, rappel, situation de vie (un seul paragraphe court) et 3 questions.
- **Activités** : une grande image sur toute la largeur, une petite légende, puis une diapositive « Question » et une diapositive « Answer » (réponse courte). Chaque activité a une consigne « Without the projector » dans les notes.
- **Résumé au tableau** en taille 40, qui commence toujours par **« I. Definitions »** (« Terme: It is… »). Il est suivi de parties II, III… avec des points A, B, C… d'une seule phrase simple. Quand c'est utile, un schéma à recopier est ajouté.
- Évaluation (2 questions), remédiation (3 trous), devoir, jeu bilingue, cahier de texte, note de l'enseignant (minutage) et références avec les **crédits photo**.

## Images

- **Photos réelles** pour les scènes de la vie (environ 165 photos, recadrées au format large). Elles viennent surtout de Flickr, via Openverse, et de Wikimedia Commons, toutes sous licence libre. Les crédits sont sur la diapositive « References » de chaque leçon et dans `CREDITS-PHOTOS.md`.
  - Pexels et Unsplash n'ont pas pu être utilisés : leur recherche est bloquée sans clé d'API depuis cet environnement. Seuls leurs liens directs d'images fonctionnent.
  - Wikimedia est joignable (avec un User-Agent et des tailles de miniatures standard), mais il limite fortement le débit (erreurs 429). La recherche s'est donc faite par Openverse, qui indexe aussi Flickr.
- **Schémas en gros caractères** (étiquettes de 22 à 34 pt) pour les processus et les cartes. Ils sont générés par `sources/maps/big_*.py`.
- **Animations GIF** (elles se lisent en mode diaporama). Il y en a 27 : navire (« the bottom of the ship disappears first »), phases de la Lune, rotation, révolution, coordonnées, voyage au centre de la Terre, dérive des continents, marges de plaques, séisme, dénudation, exfoliation, cascade, méandre, bras mort, swash/backwash, falaise → arche → stack, dérive littorale, abrasion éolienne, dune, convection, brise de mer, zone des pluies (FIT), cycle de l'eau, transhumance, parcours du coton, érosion et nuit dans le désert.

## Vocabulaire

Les phrases sont courtes et utilisent des mots familiers aux élèves. Exemples : « the bottom of the ship » au lieu de « hull », et « Crust: It is the thin outer layer of rock ». Les termes du programme (erg, reg, transhumance, deciduous…) sont gardés, mais chacun est défini simplement dans « I. Definitions ».

## Reconstruire

Les scripts utilisent les chemins absolus d'origine (`/home/claude/f4`, `/home/claude/maps`). Pour reconstruire, copiez `sources/f4` dans `/home/claude/f4` et `sources/maps` dans `/home/claude/maps`, puis :

```bash
cd /home/claude/f4 && npm i pptxgenjs
node v2_f2t_1.js            # F2T L1, L2, S01–S04 (v2_f2t_2 … v2_f2t_5 pour S05–S22)
node v2_f4_1.js             # F4 L1–L6, FS1, PW1, PW2 (v2_f4_2 … v2_f4_5 pour L7–L42, FS2)
node v2_f4_3.js L19         # une seule leçon (filtre sur le nom)
```

- `v2.js` fusionne les métadonnées de l'ancienne leçon (`old/*.json`, extraites par `extract.js`) avec le nouveau contenu, ajoute les crédits et vérifie le format (nombre d'activités, « I. Definitions »).
- `gen2.js` est le constructeur validé. Il est inchangé, sauf deux ajouts : une situation en un seul bloc et une note d'activité.
- Photos : `sources/photos/ov.py` (recherche Openverse, planche d'aperçu, choix et crédit), `crop.py` (recadrage au format 1,8:1). Les requêtes utilisées sont dans `sources/photos/requetes/`.
