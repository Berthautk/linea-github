# Leçons de géographie au format allégé — DGCAST Garoua (Mr KAMDEM)

70 PowerPoint reconstruits au format validé du pilote (`gen2.js` / `pilot_v2.js`) :

| Dossier | Contenu | Leçons |
|---|---|---|
| `lecons/F2T/` | Form 2 Technical (2 périodes, **5 activités**) | Lesson 1 (problèmes, sem. 7), Lesson 2 (climat, sem. 8), S01 à S22 — 24 fichiers |
| `lecons/F4/` | Form 4 (50 minutes, **3 activités**) | L1 à L42, FS1, FS2, PW1, PW2 — 46 fichiers |

Chaque fichier se termine par `_v2.pptx`, comme le pilote.

## Second cycle : Lower Sixth Arts (LSA) et Upper Sixth Arts (USA)

Même format allégé, avec deux différences : chaque leçon dure **2 périodes (5 activités)**, et chaque point du résumé au tableau compte **2 phrases, 3 au maximum**, au lieu d'une seule. Le contenu suit le **programme national 2019 (MINESEC)**, comparé aux leçons du Drive. Les leçons sont classées par branche. Toutes les Further Studies (FS) et tous les Practical Works (PW) du programme sont traités en classe et rangés dans le dossier de leur branche. Seuls les « Guided Works » de type *Project Based Learning* (projets de terrain rendus sous forme de rapport) ne sont pas préparés en PowerPoint : dans les modules 1 à 7, tous les Guided Works sont de ce type. Dans le module 8, le Fieldwork 2 (météorologie et climatologie) est marqué « DO AS A PROJECT » par le programme : il n'a donc pas de PowerPoint, et le Drive n'a pas de fichier pour lui.

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
| `lecons/USA/Practical Geography/` | Upper Sixth, module 8 (géographie pratique) | MA1 à MA9 (analyse de cartes topographiques : révision, télédétection et SIG, relief, drainage, végétation, transports, utilisation du sol, habitat rural et urbain), QT1 à QT4 (outils cartographiques, collecte de données, statistiques, graphiques), FW1 et FW3 à FW7 (travail de terrain : coordonnées, hydrologie, géomorphologie, biogéographie, activités économiques, habitat) — 19 fichiers. Les extraits de cartes sont inventés pour l'enseignement |

Nom des fichiers : `LSA_GEOMO_L01_Origin_of_the_Earth.pptx`. Reconstruire : `cd /home/claude/f4 && node v2_lsa_geo.js` (runner `sixth.js`, schémas `sources/maps/big_lsa_geo.py`).

## Ce que contient chaque leçon

**Nouveau format (septembre 2026, modèle de M. Kamdem) — déjà appliqué à la Lower Sixth ; l'Upper Sixth, la Form 4 et la Form 2 Tech suivent.**

- **En-tête et bas de page dans le masque des diapositives** : classe, numéro et titre de la leçon, date, « Copyright MINESEC — HOD – GBHS GAROUA » (second cycle) ou « DGCAST-GAROUA » (premier cycle), nom de l'enseignant. Pour changer le nom de l'établissement une seule fois pour toutes les diapositives : *Affichage > Masque des diapositives*, modifier le texte du bas de page (et celui de la page de garde), puis fermer le masque. Le numéro de diapositive est dans le carré en haut à gauche.
- **Feuille « MINESEC — Éducation à distance »** à gauche des diapositives de texte ; sa largeur diminue quand le texte est long, et elle disparaît sur les diapositives de photos, de schémas et de tableaux.
- **Étapes** : page de garde, classe et durée, identification, correction du devoir de la leçon précédente, plan de la leçon, objectifs, prérequis, situation de vie (3 questions), action à mener, justification, 5 activités (image, question, réponse), résumé au tableau, évaluation, remédiation, devoir, prochaine leçon, jeu bilingue, cahier de texte, note de l'enseignant et références.
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
node v2_f2t_1.js            # F2T L1, L2, S01–S04 (v2_f2t_2 … v2_f2t_5 pour S05–S22)
node v2_f4_1.js             # F4 L1–L6, FS1, PW1, PW2 (v2_f4_2 … v2_f4_5 pour L7–L42, FS2)
node v2_f4_3.js L19         # une seule leçon (filtre sur le nom)
```

- `v2.js` fusionne les métadonnées de l'ancienne leçon (`old/*.json`, extraites par `extract.js`) avec le nouveau contenu, ajoute les crédits et vérifie le format (nombre d'activités, « I. Definitions »).
- `gen2.js` est le constructeur validé. Il est inchangé, sauf deux ajouts : une situation en un seul bloc et une note d'activité.
- Photos : `sources/photos/ov.py` (recherche Openverse, planche d'aperçu, choix et crédit), `crop.py` (recadrage au format 1,8:1). Les requêtes utilisées sont dans `sources/photos/requetes/`.
