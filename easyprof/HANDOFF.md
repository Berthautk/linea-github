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
- Calendrier 2026-2027 = **arrêté conjoint MINEDUB/MINESEC du 14/08/2026** (PDF reçu et lu) : T1 07/09→27/11, T2 30/11→05/03, T3 08/03→11/06 (art. 10) ; Noël 18/12 15h30→04/01, Pâques 25/03 15h30→12/04 (art. 4) ; examens secondaires dès le 19/04 ; compositions 03→21/05 ; fin d'année 30/07/2027. Précalendrier : vacances + 2 derniers jours de chaque trimestre (suivi pédagogique, art. 22, retirés des heures dues, supprimables) + fêtes légales à date fixe. Les demi-journées de départ en vacances ne sont pas retirées. Fêtes mobiles (Tabaski…) à saisir.
- Seuils d'alerte de l'arrêté (art. 18 et 21) : couverture horaire < 80 %, programme < 70 % → puce d'alerte + action corrective obligatoire à notifier à la Délégation Régionale sous huitaine (insérée dans la fiche). Art. 9 : péri/post-scolaires le mercredi 13h-15h.
- Samedi de KAMDEM (USA 8h-10h, LSA 10h30-12h30) : `teachingDays` [1,2,6] + `dayTerms {6:[T1]}` (rappels seulement en T1) ; créneaux d'emploi du temps avec `tm` (trimestre). Les créneaux du samedi ne sont **pas** dans l'emploi du temps par défaut de la fiche : question ouverte (quels samedis ont eu lieu entre le 07/09 et le 09/10 ? 12, 19, 26/09, 03/10). Ce sont des cours normaux, pas des rattrapages : la ligne seed « Rattrapage 2 samedis +8 h » devra être remplacée.
- Retard/rattrapage KAMDEM saisis sans date : comptés dans toutes les périodes tant qu'ils ne sont pas datés.
- Taux annuel de la période = heures faites / heures annuelles prévues (somme des classes) ; la situation cumulée est donnée à part.
- Firestore : vérifier qu'un compte enseignant peut bien écrire une saisie `absence` (règles non consultées).
- **Pas de service worker** : « PWA » = raccourci avec manifeste ; la mise à jour passe par `Cache-Control: no-cache` (deploy/firebase.json). Les téléphones rechargent la page ; vérifier la version dans Année & PIN.
- Idées : relance auto des enseignants sans saisie, fiche multi-départements, export PDF direct.

## Démo et architecture
- `deploy/make_demo.py` : version de démonstration anonymisée (Firebase factice, écritures coupées, PIN 1234) publiée comme artefact privé.
- `deploy/ARCHITECTURE.md` : hébergement, multi-départements, quotas Spark.

## 5.2 : grand nettoyage (13/10/2026)
- Supprimé : onglet « Rapport AP » (difficultés, suggestions, procès-verbaux) ; l'onglet Inspection prend sa place.
- **Tableau de bord AP** (`EPB`, `src/epx2.js`) : couverture horaire et leçons depuis la rentrée, annuelle, trimestre en cours, tableau par trimestre et par enseignant (rappel WhatsApp si pas de saisie).
- **Espace enseignant** : « Mon bilan » (`EPT`) = KPIs + fiche d'inspection personnelle à dates libres (même moteur `EPI_calc(..., only)` que la fiche AP, année = heures de son emploi du temps), « Mes cours » (`EPH`) = historique complet de la rentrée, filtres, **modification** et suppression avec confirmation.
- **Ajustements** (retards/rattrapages/absences manuelles) : date ou plage `d..d2` ; sans date = répartis au prorata sur la période d'inspection de l'AP (`EPI_share`). Retard de KAMDEM : 3 h.
- Questions ouvertes : samedis de KAMDEM réellement tenus (22/09 et 06/10 cités sont des mardis) ; le cours de 3 h 7h30-10h30 est le mardi (USA) dans les données, pas le vendredi.
- Multi-départements : voir `deploy/ARCHITECTURE.md` (feuille de route d'une base multi-locataires).
