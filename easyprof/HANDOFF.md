# EasyProf 5.1 – passation

AP Géographie, GBHS Garoua. App = PWA React + Firebase (Firestore, Auth Google), un seul fichier HTML (bundle Vite minifié).
**Contraintes** : Firebase Spark gratuit, jamais Blaze ni carte. Doute → poser la question. Langue : français.
`data/` (sauvegarde JSON réelle + PDF emplois du temps) est **ignoré par git** : ne jamais publier.

## Reconstruire / tester
```
cd src && python3 build.py                       # EasyProf-4.original.html + epx.js + epi.js -> ../EasyProf-5.html
python3 tests/e2e/make_test_html.py EasyProf-5.html /chemin/test5.html   # copie DE TEST (faux utilisateur Firebase, jamais livrée)
BACKUP=data/<sauvegarde>.json PW=<playwright-core> node tests/e2e/run_all.mjs /chemin/test5.html /tmp   # 28 vérifications
deploy/make_public.sh                            # deploy/public/ : v5 à la racine, v4 en secours sur /v4/
```
Le build patche le bundle par ancres exactes (assertions d'unicité). CSS Tailwind purgé : n'utiliser que des classes existantes ou du CSS propre (`.epx-*`, `.epi-*`).

## Ce qui a changé (v5.1)
- **Inspection** (`epi.js`) : période libre (dates de l'inspecteur + raccourcis T1/T2/T3/année), heures dues d'après les emplois du temps hors calendrier, absences déclarées par les enseignants prises automatiquement, retards/rattrapages manuels (datés), révisions/évaluations = heures sans leçon, situation cumulée depuis la rentrée, motifs configurables (retiré des heures dues ou absence), impression A4 paysage limitée à la fiche. Référence 07/09–09/10/2026 : 255 h dues, 236 faites, −19, 92,5 %, 15,5 % année ; 128/118/−10 leçons.
- **Saisie enseignant** : type de séance en liste déroulante (leçon, TP, première rencontre/orientation, révision, évaluation) ; carte « Pas de cours ? » (férié, activités péri-scolaires, conseil/examens, maladie, empêchement, mission, autre) sur une ou plusieurs dates. Stockée comme **saisie `type:"absence"`** (0 min, `classId:""`, `reason`) donc synchronisée sans toucher aux règles Firestore ; elle supprime le rappel « saisie en attente » (côté enseignant et alerte AP). Révision/évaluation/contact/absence ne comptent jamais comme leçon (`Nr` patché, `EPX_NOLESSON`). Pas de rappel non plus les jours du calendrier.
- **Configuration → onglet « Année & PIN »** (`epx.js`, `EPY`) : mise à jour 2026-2027 en un clic (diff affiché avant), trimestres modifiables + trimestre actif (n'était modifiable nulle part), jours d'enseignement par enseignant, calendrier fériés/vacances, sécurité des PIN, version installée.
- **PIN** : cause du « suite de chiffres et lettres » = empreinte `h1$…` créée automatiquement à la 1re connexion de l'enseignant, que l'espace AP affichait. Désormais : jamais affiché (🔒 protégé / ⚠ en clair), champ vide à l'édition (vide = inchangé), haché à l'enregistrement (SHA-256 synchrone identique à `EasyProfHashPin`), bouton Générer (affiché une seule fois), bouton « Protéger les PIN en clair » (garde la valeur, personne n'est bloqué). Rien n'est modifié sans clic de l'AP.
- **Palette** : remap global du CSS/JS/manifeste (`PALETTE` dans build.py) : encre `#17413F`, turquoise `#2A9D8F`, abricot `#E9A23B`, crème `#FBF7EF`, sable `#F3ECDD`, texte `#26332F`, atténué `#66736C`.
- Correction de la ligne « GLOBAL TOTAL » du récap (v5.0).

## Stockage
`state.reportObservations.__inspection` = `{ps,pe,lh,tt,adj,ft,ac,yh,yl,cal,rd,hol}` (synchronisé `metadata/settings`). `cal`=[{f,t,n}] calendrier, `rd`={motif:true|false} (true = retiré des heures dues). Absences : `entries` (type `absence`).

## Points ouverts / à valider avec l'AP
- Dates de fin de trimestre 2026-2027 = proposition (mêmes jours que l'an dernier) ; seul le début de T1 (07/09/2026) est connu. Vacances scolaires et fêtes mobiles (Pâques, Ascension, Tabaski…) à saisir ; seules les fêtes à date fixe sont pré-remplies.
- Samedis de T1 de KAMDEM (LSA/USA) non inclus dans `teachingDays` (un jour est valable toute l'année).
- Retard/rattrapage KAMDEM saisis sans date : comptés dans toutes les périodes tant qu'ils ne sont pas datés.
- Taux annuel de la période = heures faites / heures annuelles prévues (somme des classes) ; la situation cumulée est donnée à part.
- Firestore : vérifier qu'un compte enseignant peut bien écrire une saisie `absence` (règles non consultées).
- **Pas de service worker** : « PWA » = raccourci avec manifeste ; la mise à jour passe par `Cache-Control: no-cache` (deploy/firebase.json). Les téléphones rechargent la page ; vérifier la version dans Année & PIN.
- Idées : relance auto des enseignants sans saisie, fiche multi-départements, export PDF direct.
