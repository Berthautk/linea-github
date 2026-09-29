# Leçons de géographie — DGCAST Garoua / GBHS Garoua (Mr KAMDEM)

Toutes les leçons (290 PowerPoint) sont au nouveau format de septembre 2026 (voir « Ce que contient chaque leçon »).

## Premier cycle : Form 1 à Form 5 et Form 2 Technical (F2T)

Ordre des fichiers (numéro en tête du nom) : pour la F2T, l'ordre de la *Harmonised Progression Sheet* (Economic Geography, Form 2) ; pour F1 à F5, l'ordre du syllabus national *Geography Syllabus Forms I–V* (MINESEC, 2023) ; le dossier F3 contient le programme de la Form 3 (Physical Geography, 42 leçons, commencées en Form 3 et terminées en Form 4).

| Dossier | Contenu | Leçons |
|---|---|---|
| `lecons/F2T/` | Form 2 Technical (2 périodes, **5 activités**) | Lesson 1, parties 1 à 5 (région équatoriale : localisation et climat, sols et végétation, ressources, activités humaines — semaines 2 à 5 —, puis problèmes et solutions, sem. 7), Lesson 2 à Lesson 6 (S01 à S22) — 28 fichiers |
| `lecons/F1/` | Form 1 (2 périodes, **5 activités**) | Modules 1 à 3 : L1 à L13, PW1 à PW6, FS1, FS2, Guided Work 1 — 22 fichiers |
| `lecons/F2/` | Form 2 (2 périodes, **5 activités**) | Modules 1 et 2 : L1 à L8, PW1 à PW4, FS1 à FS7 — 19 fichiers |
| `lecons/F3/` | Programme de la Form 3 (Physical Geography), enseigné en Form 4 (50 minutes, **3 activités**) | L1 à L42, FS1, FS2, PW1, PW2 — 46 fichiers |
| `lecons/F4/` | Form 4 — programme officiel *Ecological Systems and Economic Development* (2 périodes, **5 activités**) | Module I : L1 à L17, FS1, PW1 à PW9 (lecture de cartes) ; Module II : L18 à L46, FS2, PW10 — 58 fichiers |
| `lecons/F5/` | Form 5 (2 périodes, **5 activités**) | Module I : L1 à L22, FS2, PW1, PW2 ; Module II : L23 à L27 ; Module III : L28 à L53, FS3 à FS6, PW3 à PW5 — 63 fichiers |

Au premier cycle, chaque point du résumé au tableau tient en **une phrase**, et le bas de page porte « DGCAST-GAROUA ». Reconstruire : `cd /home/claude/f4 && node build3_first.js F3` (ou `F2T`), et `node build3_new.js F1` (F2, F4, F5) pour les leçons écrites directement au nouveau format (`sources/f4/v3n/`) ; le résumé de chaque leçon est dans `sources/f4/v3/f4_*.js` et `f2t_*.js`.

## Second cycle : Lower Sixth Arts (LSA) et Upper Sixth Arts (USA)

Chaque leçon dure **2 périodes (5 activités)**, et chaque point du résumé au tableau compte **2 phrases, 3 au maximum**, au lieu d'une seule. Le contenu suit le **programme national 2019 (MINESEC)**, comparé aux leçons du Drive. Les leçons sont classées par branche. Toutes les Further Studies (FS) et tous les Practical Works (PW) du programme sont traités en classe et rangés dans le dossier de leur branche. Seuls les « Guided Works » de type *Project Based Learning* (projets de terrain rendus sous forme de rapport) ne sont pas préparés en PowerPoint : dans les modules 1 à 7, tous les Guided Works sont de ce type. Dans le module 8, le Fieldwork 2 (météorologie et climatologie) est marqué « DO AS A PROJECT » par le programme : il n'a donc pas de PowerPoint, et le Drive n'a pas de fichier pour lui.

| Dossier | Contenu | Leçons |
|---|---|---|
| `lecons/LSA/Meteorology/` | Module 1 (météorologie, d'après les notes de cours de M. Kamdem) | L1 à L18 (atmosphère, énergie, température, humidité, pressions, vents, masses d'air), FS2 (observation, prévision et cartographie du temps) — 19 fichiers |
| `lecons/LSA/Climatology/` | Module 1 (climatologie) | L19 (climat et classification de Köppen), FS1 (perturbations tropicales), L20 (microclimats), L21 (climats de montagne), FS3 (climat du Cameroun) — 5 fichiers |
| `lecons/LSA/Hydrology/` | Module 1 (hydrologie) | L22 à L34, FS4 (réseau hydrographique du Cameroun), PW1 (hydrogrammes et régimes), PW2 (morphométrie des bassins) — 16 fichiers |
| `lecons/LSA/Geomorphology/` | Module 2 (géomorphologie, d'après les notes de cours de M. Kamdem) | L1 à L16, FS1 (premières théories), FS2 (expansion des fonds océaniques), FS3 (relief du Cameroun) — 19 fichiers |
| `lecons/LSA/Biogeography/` | Module 3 (sols, végétation, écosystèmes) | L1 à L28, FS1 (sols du Cameroun), FS2 (végétation du Cameroun), FS3 (services des écosystèmes), PW1 (texture du sol), PW2 (productivité) — 33 fichiers |
| `lecons/LSA/Geography of Cameroon/` | Géographie du Cameroun (Further Studies des modules 1 à 7, d'après les notes de cours de M. Kamdem) | L1 relief, L2 climat, L3 sols, L4 végétation, L5 réseau hydrographique, L6 population, L7 urbanisation, L8 agriculture, L9 forêts, L10 mines et énergie, L11 eau, L12 industrie, L13 transports, L14 tourisme, L15 contrastes de développement — 15 fichiers (reconstruire : `node build3_new.js LSACAM`) |
| `lecons/USA/Population Geography/` | Upper Sixth, module 4 (géographie de la population, d'après les notes de cours de M. Kamdem) | L1 à L18, PW1 à PW4 (cartes de densité, altitude, pyramides, indices démographiques), FS1 (population du Cameroun) — 23 fichiers |
| `lecons/USA/Settlement Geography/` | Upper Sixth, module 5 (géographie de l'habitat) | L1 à L22, PW1 (indice du plus proche voisin), PW2 (zones d'influence, loi de Reilly), FS1 (urbanisation au Cameroun) — 25 fichiers |
| `lecons/USA/Economic Geography/` | Upper Sixth, module 6 (activités économiques) | L1 à L11 et L13 à L31 (le programme n'a pas de leçon 12), PW1 (rente de situation), PW2 (quotient de localisation), PW3 (indice matière, isodapanes), PW4 (coûts de transport), PW5 (indices de réseau), FS1 à FS7 (agriculture, forêts, mines et énergie, eau, industrie, transports, tourisme au Cameroun) — 42 fichiers |
| `lecons/USA/Environment and Development/` | Upper Sixth, module 7 (environnement et développement) | L1 à L14 (pollution, déforestation et désertification, érosion des sols, changement climatique, réchauffement, inondations, développement, stratégies, NPI, mondialisation, commerce, blocs commerciaux, OMC et APE, aide), FS1 (contrastes de développement au Cameroun) — 15 fichiers |
| `lecons/USA/Practical Geography/` | Upper Sixth, module 8 (géographie pratique) | MA1 à MA9 (analyse de cartes topographiques : révision, télédétection et SIG, relief, drainage, végétation, transports, utilisation du sol, habitat rural et urbain), QT1 à QT4 (outils cartographiques, collecte de données, statistiques en trois parties — tendance centrale, dispersion, corrélation de Spearman —, graphiques ; QT2 à QT4 d'après les notes de cours de M. Kamdem), FW1 et FW3 à FW7 (travail de terrain : coordonnées, hydrologie, géomorphologie, biogéographie, activités économiques, habitat) — 21 fichiers. Les extraits de cartes sont inventés pour l'enseignement |

Nom des fichiers : `01_LSA_GEOMO_L01_Origin_of_the_Earth.pptx`. Le numéro en tête donne l'ordre du syllabus national 2019 : dans chaque dossier, les leçons, Further Studies et Practical Works s'affichent dans l'ordre où ils sont enseignés. Reconstruire : `cd /home/claude/f4 && node build3_lsa.js` ou `node build3_usa.js` (constructeur `gen3.js`, runner `sixth3.js`, résumés dans `sources/f4/v3/`, schémas dans `sources/maps/big_*.py`).

## Ce que contient chaque leçon

**Nouveau format (septembre 2026, modèle de M. Kamdem), appliqué à toutes les classes : F1 à F5, F2T, LSA et USA.**

- **En-tête et bas de page dans le masque des diapositives** : classe, numéro et titre de la leçon, date, « Copyright MINESEC — HOD – GBHS GAROUA » (second cycle) ou « DGCAST-GAROUA » (premier cycle), nom de l'enseignant. Pour changer le nom de l'établissement une seule fois pour toutes les diapositives : *Affichage > Masque des diapositives*, modifier le texte du bas de page (et celui de la page de garde), puis fermer le masque. Le numéro de diapositive est dans le carré en haut à gauche.
- **Feuille « MINESEC — Éducation à distance »** à gauche des diapositives de texte ; sa largeur diminue quand le texte est long, et elle disparaît sur les diapositives de photos, de schémas et de tableaux.
- **Étapes** : page de garde, classe et durée, identification, correction du devoir de la leçon précédente, plan de la leçon, objectifs, prérequis, situation de vie (3 questions), action à mener, justification, activités (5 pour 2 périodes, 3 pour la Form 4 de 50 minutes ; image, question, réponse), résumé au tableau, évaluation, remédiation, devoir, prochaine leçon, jeu bilingue, cahier de texte, note de l'enseignant et références.
- **Résumé au tableau** (Times New Roman, titres 36, texte 40) : les grands points suivent ceux du syllabus (1., 2., …) avec leurs sous-points A), B), … Chaque partie commence par une phrase d'annonce, puis chaque élément est sur sa ligne : « **Terme:** These are… ». La partie « DEFINITIONS » vient en premier, sauf si le premier grand point du syllabus est déjà « Meaning ». Au second cycle, chaque point compte 2 à 3 phrases ; au premier cycle, une phrase. Les illustrations ont leur propre diapositive dans la partie concernée.
- **Commentaires (notes) sur chaque diapositive**, en anglais, rédigés comme si l'enseignant parlait directement aux élèves.

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
node build3_first.js F3     # programme de Form 3 (46 leçons) ; F2T pour la Form 2 Technical
node build3_new.js F1       # Form 1 (idem F2, F4, F5)
node build3_first.js F3 FORM4_LESSON19   # une seule leçon (filtre sur le nom)
node build3_lsa.js          # Lower Sixth ; build3_usa.js pour l'Upper Sixth
```

- `gen3.js` est le constructeur du nouveau format (masque des diapositives, feuille MINESEC, notes). `sixth3.js` enchaîne les leçons dans l'ordre (correction du devoir précédent, prochaine leçon) et vérifie le nombre de phrases par point.
- Les contenus des leçons (situation, activités, évaluation) sont dans `v2_*.js` ; les nouveaux résumés au tableau, l'action à mener et le corrigé du devoir sont dans `v3/*.js`.
- `v2.js` fusionne les métadonnées de l'ancienne leçon (`old/*.json`, extraites par `extract.js`) avec le nouveau contenu, ajoute les crédits et vérifie le format (nombre d'activités, « I. Definitions »).
- `gen2.js` est l'ancien constructeur (format allégé v2), gardé pour mémoire.
- Photos : `sources/photos/ov.py` (recherche Openverse, planche d'aperçu, choix et crédit), `crop.py` (recadrage au format 1,8:1). Les requêtes utilisées sont dans `sources/photos/requetes/`.
