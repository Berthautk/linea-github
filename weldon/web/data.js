// Contenu de démonstration Weldon.
// IMPORTANT : les sujets ci-dessous sont des SUJETS D'ENTRAÎNEMENT rédigés pour la démo,
// au format des épreuves officielles. Ils ne sont pas des sujets officiels.
// Les fiches « concours » doivent être vérifiées sur les arrêtés officiels avant publication
// (champ `a_verifier`). L'équipe éditoriale remplacera ce fichier par le vrai catalogue.

window.WELDON_DATA = {
  concours: [
    {
      id: "police-inspecteurs",
      nom: "Élèves inspecteurs de police",
      sigle: "POLICE",
      organisme: "DGSN – Délégation Générale à la Sûreté Nationale",
      couleur: "indigo",
      resume:
        "Recrutement direct au niveau BEPC pour former les inspecteurs de police, agents de terrain chargés des enquêtes et du maintien de l'ordre.",
      fiche: {
        presentation:
          "La Sûreté Nationale recrute chaque année des élèves inspecteurs de police. Après leur admission, les élèves suivent une formation dans les écoles de police avant d'être affectés dans les commissariats, les brigades et les unités spécialisées du pays.",
        historique:
          "La police camerounaise est placée sous l'autorité de la Délégation Générale à la Sûreté Nationale (DGSN). Le concours des élèves inspecteurs est organisé par arrêté du Délégué Général, avec inscription en ligne sur concours-dgsn.cm.",
        conditions: [
          "Être de nationalité camerounaise",
          "Avoir entre 17 et 28 ans au 1er janvier de l'année du concours (session 2026)",
          "Être titulaire du BEPC ou du GCE O/L (3 matières au moins)",
          "Être apte physiquement et médicalement",
        ],
        places: "395 places en recrutement direct (session 2026)",
        calendrier: "Inscription en ligne puis dépôt du dossier ; écrits en septembre dans les chefs-lieux de région",
        epreuves_officielles: [
          { nom: "Rédaction (composition française)", duree: 150, coef: 3, note_eliminatoire: 6 },
          { nom: "Culture générale", duree: 150, coef: 5, note_eliminatoire: 6 },
        ],
        oral: false,
        autres_epreuves: "Épreuves sportives et visite médicale pour les admissibles",
        admission: "Moyenne d'au moins 12/20 sans note éliminatoire",
        a_verifier: "Chiffres de la session 2026 relevés sur les annonces publiques ; vérifier l'arrêté de la session en cours.",
      },
    },
    {
      id: "emia",
      nom: "École Militaire Interarmées",
      sigle: "EMIA",
      organisme: "MINDEF – Ministère de la Défense",
      couleur: "green",
      resume:
        "L'école qui forme les officiers des forces de défense camerounaises. Son cœur de métier : la formation au commandement.",
      fiche: {
        presentation:
          "L'EMIA, à Yaoundé, forme les officiers de l'Armée de Terre, de la Marine, de l'Armée de l'Air et de la Gendarmerie. Le concours du Cours « A » recrute directement des bacheliers et des diplômés du supérieur.",
        historique:
          "Créée en 1959, l'école est inaugurée le 18 janvier 1961 sous le nom d'École Militaire Interarmes du Cameroun (EMIAC). Chaque promotion reçoit un nom de baptême à sa sortie.",
        conditions: [
          "Être de nationalité camerounaise, de bonne moralité, avec un casier judiciaire vierge",
          "Cours « A » (recrutement direct) : avoir entre 18 et 23 ans",
          "Cours « B » : réservé aux militaires en service, avec une limite d'âge plus élevée",
          "Être reconnu apte après visite médicale",
        ],
        places: "Fixées chaque année par arrêté du MINDEF",
        calendrier: "Ouverture au premier semestre, écrits en milieu d'année, résultats définitifs à l'automne",
        epreuves_officielles: [
          { nom: "Culture générale", duree: 240, coef: 4 },
          { nom: "Mathématiques ou épreuve de spécialité", duree: 240, coef: 4 },
          { nom: "Langue (français / anglais)", duree: 120, coef: 2 },
        ],
        oral: true,
        autres_epreuves: "Épreuves sportives, visite médicale et entretien devant un jury",
        admission: "Classement final après écrits, sport et oral",
        a_verifier: "Durées et coefficients à confirmer sur l'arrêté de la session en cours.",
      },
    },
    {
      id: "ens-yaounde",
      nom: "École Normale Supérieure de Yaoundé – 1er cycle",
      sigle: "ENS",
      organisme: "MINESUP – Université de Yaoundé I",
      couleur: "amber",
      resume: "Forme les professeurs de l'enseignement secondaire général (PCEG au 1er cycle).",
      fiche: {
        presentation:
          "L'ENS de Yaoundé forme les enseignants des lycées et collèges. Le concours d'entrée en 1re année du 1er cycle est ouvert aux bacheliers selon les filières.",
        historique:
          "L'ENS de Yaoundé est l'une des plus anciennes grandes écoles du pays. Elle est rattachée à l'Université de Yaoundé I.",
        conditions: [
          "Être titulaire du baccalauréat ou du GCE A/L selon la filière",
          "Candidats non fonctionnaires : 29 ans au plus au 1er janvier de l'année du concours",
          "Constituer le dossier demandé par l'arrêté (relevés de notes, acte de naissance, etc.)",
        ],
        places: "Fixées par filière dans l'arrêté du MINESUP",
        calendrier: "Écrits du 1er cycle fin août",
        epreuves_officielles: [
          { nom: "Étude du dossier scolaire", duree: 0, coef: "25 %" },
          { nom: "Épreuve écrite de spécialité", duree: 180, coef: "37,5 %" },
          { nom: "Épreuve écrite de culture générale", duree: 180, coef: "37,5 %" },
        ],
        oral: true,
        autres_epreuves: "Oral d'admission pour les candidats admissibles",
        admission: "Dossier (25 %) + écrits (75 %), puis oral",
        a_verifier: "Pondération relevée pour la session 2026 ; vérifier l'arrêté MINESUP.",
      },
    },
    {
      id: "enam",
      nom: "École Nationale d'Administration et de Magistrature",
      sigle: "ENAM",
      organisme: "MINFOPRA",
      couleur: "red",
      resume: "Forme les administrateurs civils, magistrats, greffiers et cadres des régies financières.",
      fiche: {
        presentation:
          "L'ENAM, à Yaoundé, prépare aux carrières de la haute fonction publique : administration générale, magistrature, greffes, douanes, impôts, trésor.",
        historique:
          "L'ENAM succède à l'École Camerounaise d'Administration (ECA), créée en 1959 pour former les cadres appelés à prendre la relève de l'administration coloniale.",
        conditions: [
          "Être de nationalité camerounaise",
          "Cycle A : licence ou master selon la division ; cycle B : baccalauréat ou équivalent",
          "Limites d'âge fixées par l'arrêté de chaque division",
        ],
        places: "220 places à la session 2026 (toutes divisions)",
        calendrier: "Arrêtés en juin, écrits entre août et septembre selon la division",
        epreuves_officielles: [
          { nom: "Culture générale (dissertation)", duree: 240, coef: 4 },
          { nom: "Épreuve de spécialité (droit, économie…)", duree: 240, coef: 4 },
          { nom: "Résumé / note de synthèse", duree: 180, coef: 2 },
        ],
        oral: true,
        autres_epreuves: "Grand oral devant un jury pour les admissibles",
        admission: "Classement après écrits et oral",
        a_verifier: "Durées et coefficients variables selon la division ; vérifier l'arrêté.",
      },
    },
  ],

  // Épreuves classées par concours puis par année.
  epreuves: [
    {
      id: "pol-2025-redaction",
      concours: "police-inspecteurs",
      annee: 2025,
      matiere: "Rédaction",
      duree: 150,
      exemple: true,
      sujet:
        "Sujet d'entraînement – Rédaction\n\nDans de nombreux quartiers de nos villes, les jeunes se plaignent du chômage, tandis que les forces de l'ordre constatent une montée de la petite délinquance.\n\nSelon vous, quels liens peut-on établir entre le chômage des jeunes et l'insécurité urbaine ? Quelles solutions proposeriez-vous, en tant que futur inspecteur de police, pour réduire ce phénomène ?\n\nVous illustrerez votre réflexion par des exemples précis tirés de la société camerounaise.",
      bareme:
        "Compréhension du sujet et introduction : 3 pts\nArgumentation (causes, liens) : 6 pts\nSolutions concrètes et réalistes : 5 pts\nExemples pertinents : 2 pts\nConclusion : 1 pt\nLangue (orthographe, syntaxe, ponctuation) : 3 pts",
      corrige:
        "INTRODUCTION\n\nLe Cameroun compte une population très jeune : plus de la moitié des habitants a moins de 25 ans. Cette jeunesse est une force, mais elle se heurte à un marché du travail étroit. Dans les grandes villes comme Douala et Yaoundé, les vols à l'arraché, les agressions nocturnes et le trafic de stupéfiants inquiètent les populations. Faut-il voir dans le chômage des jeunes l'une des causes de cette insécurité ? Nous montrerons d'abord que le chômage favorise la délinquance sans en être la seule cause, puis nous proposerons des solutions à la portée d'un inspecteur de police et de la société tout entière.\n\nI. LE CHÔMAGE, TERRAIN FAVORABLE À L'INSÉCURITÉ\n\n1. Le désœuvrement et la précarité. Un jeune sans revenu et sans occupation passe ses journées dans la rue. La pression des besoins quotidiens (manger, se loger, aider la famille) peut pousser certains à chercher de l'argent facile : vols, recel, escroqueries en ligne (« feymania »).\n\n2. La perte de repères. Le chômage prolongé détruit l'estime de soi. Le jeune se sent inutile et rejeté ; il peut alors trouver dans le gang ou le groupe de quartier une reconnaissance que la société ne lui donne pas.\n\n3. Mais le chômage n'explique pas tout. La majorité des jeunes chômeurs restent honnêtes : ils se débrouillent comme moto-taximen, vendeurs à la sauvette ou apprentis. D'autres facteurs comptent : la consommation de drogue (tramadol, chanvre), la démission de certains parents, l'exode rural qui coupe le jeune de sa communauté, et l'impunité lorsque les délits ne sont pas sanctionnés.\n\nII. QUELLES SOLUTIONS ?\n\n1. Le rôle de la police. L'inspecteur de police doit d'abord assurer une présence visible : patrouilles régulières, îlotage dans les quartiers sensibles, éclairage des points noirs signalés aux mairies. Il doit aussi développer la police de proximité : connaître les chefs de quartier, les associations de jeunes, les leaders religieux, pour recueillir le renseignement et prévenir plutôt que réprimer. Enfin, il doit lutter fermement contre les réseaux de drogue et de recel, qui exploitent les jeunes.\n\n2. Le rôle de l'État et des collectivités. Les programmes d'insertion (PIAASI, FNE, formations professionnelles) doivent être mieux connus des jeunes. Les communes peuvent créer des chantiers à haute intensité de main-d'œuvre (curage des drains, entretien des routes).\n\n3. Le rôle des familles et de la société civile. L'éducation civique, l'encadrement par les parents, les activités sportives et culturelles dans les quartiers occupent sainement la jeunesse.\n\nCONCLUSION\n\nLe chômage des jeunes est un terreau de l'insécurité urbaine, mais il n'en est pas la cause unique : la drogue, la faiblesse de l'encadrement familial et l'impunité y contribuent aussi. La réponse doit donc associer la fermeté et la prévention. Le futur inspecteur de police a un rôle central à jouer, à condition de travailler main dans la main avec les populations. La sécurité de demain se construit autant par l'emploi que par la répression.",
    },
    {
      id: "pol-2025-culture",
      concours: "police-inspecteurs",
      annee: 2025,
      matiere: "Culture générale",
      duree: 150,
      exemple: true,
      sujet:
        "Sujet d'entraînement – Culture générale\n\nPARTIE A – Questions (10 points)\n1. Quelle est la capitale politique du Cameroun et quelle est sa capitale économique ? (1 pt)\n2. Combien de régions compte le Cameroun ? Citez-en cinq. (2 pts)\n3. Quelles sont les deux langues officielles du Cameroun ? (1 pt)\n4. En quelle année le Cameroun sous administration française accède-t-il à l'indépendance ? (1 pt)\n5. Que signifie le sigle DGSN ? (1 pt)\n6. Citez deux organisations internationales ou régionales dont le Cameroun est membre. (2 pts)\n7. Qu'est-ce que le droit de garde à vue ? (2 pts)\n\nPARTIE B – Dissertation (10 points)\n« Le policier est d'abord au service du citoyen. » Commentez cette affirmation.",
      bareme: "Partie A : 10 pts selon le détail des questions\nPartie B : introduction 2 pts, développement 6 pts, conclusion 1 pt, langue 1 pt",
      corrige:
        "PARTIE A\n\n1. La capitale politique est Yaoundé ; la capitale économique est Douala.\n\n2. Le Cameroun compte 10 régions : Adamaoua, Centre, Est, Extrême-Nord, Littoral, Nord, Nord-Ouest, Ouest, Sud, Sud-Ouest. (Cinq suffisent.)\n\n3. Le français et l'anglais.\n\n4. Le 1er janvier 1960.\n\n5. Délégation Générale à la Sûreté Nationale.\n\n6. Exemples acceptés : ONU, Union africaine (UA), CEMAC, CEEAC, Commonwealth, Organisation internationale de la Francophonie.\n\n7. La garde à vue est une mesure de contrainte décidée par un officier de police judiciaire : une personne soupçonnée d'avoir commis une infraction est retenue dans les locaux de la police ou de la gendarmerie pour les besoins de l'enquête, pendant une durée limitée fixée par le Code de procédure pénale, sous le contrôle du procureur de la République, et dans le respect de ses droits (être informée des faits, avoir un avocat, recevoir des soins).\n\nPARTIE B – Plan rédigé\n\nIntroduction. Pour beaucoup de citoyens, le policier évoque d'abord le contrôle routier ou l'arrestation. Pourtant, sa mission première est de protéger les personnes et les biens. En quoi le policier est-il au service du citoyen, et à quelles conditions cette mission est-elle remplie ?\n\nI. Le policier, serviteur du citoyen. Il protège la vie et les biens (patrouilles, interventions, secours). Il garantit l'exercice des libertés (circulation, manifestations encadrées, sécurité des élections). Il reçoit les plaintes et conduit les enquêtes qui permettent à la justice de rendre droit aux victimes.\n\nII. Une mission parfois mal perçue. Les abus (corruption, usage excessif de la force) abîment la confiance. Le manque de moyens et d'effectifs limite la présence policière dans certains quartiers.\n\nIII. Restaurer la confiance. Formation éthique et respect des droits de l'homme ; sanctions contre les abus ; police de proximité et accueil de qualité dans les commissariats.\n\nConclusion. Le policier n'est pas au-dessus du citoyen mais à son service. La force qu'il détient lui est confiée par la loi pour protéger tous. C'est par son intégrité qu'il gagnera la confiance des populations.",
    },
    {
      id: "pol-2024-redaction",
      concours: "police-inspecteurs",
      annee: 2024,
      matiere: "Rédaction",
      duree: 150,
      exemple: true,
      sujet:
        "Sujet d'entraînement – Rédaction\n\nLes réseaux sociaux occupent une place grandissante dans la vie des jeunes Camerounais. Ils informent, mais ils propagent aussi de fausses nouvelles et des discours de haine.\n\nMontrez les avantages et les dangers des réseaux sociaux, puis dites comment on peut en faire un usage responsable.",
      bareme: "Introduction 3 pts ; avantages 4 pts ; dangers 5 pts ; usage responsable 4 pts ; conclusion 1 pt ; langue 3 pts",
      corrige:
        "Introduction. WhatsApp, Facebook et TikTok sont devenus en quelques années les principales sources d'information et de divertissement des jeunes. Mais derrière cette facilité se cachent des risques réels. Quels sont les avantages et les dangers des réseaux sociaux, et comment les utiliser de façon responsable ?\n\nI. Des avantages réels. Ils rapprochent les familles dispersées entre villes, villages et diaspora. Ils donnent accès à l'information et à la formation (cours en ligne, offres d'emploi, annonces de concours). Ils permettent aux jeunes entrepreneurs de vendre leurs produits.\n\nII. Des dangers sérieux. Les fausses nouvelles (« fake news ») créent la panique et peuvent troubler l'ordre public. Les discours de haine tribaux ou politiques menacent le vivre-ensemble ; la loi camerounaise de 2019 réprime d'ailleurs l'outrage tribal. La cybercriminalité (arnaques, chantage, usurpation d'identité) fait de nombreuses victimes. Enfin, la dépendance détourne les élèves de leurs études.\n\nIII. Pour un usage responsable. Vérifier une information avant de la partager ; ne pas publier de données personnelles ; signaler les contenus haineux ; limiter le temps d'écran ; éduquer les jeunes au numérique dès l'école.\n\nConclusion. Les réseaux sociaux ne sont ni bons ni mauvais en eux-mêmes : tout dépend de l'usage. Un citoyen responsable, et plus encore un futur policier, doit montrer l'exemple en vérifiant, en respectant autrui et en signalant les abus.",
    },
    {
      id: "emia-2025-culture",
      concours: "emia",
      annee: 2025,
      matiere: "Culture générale",
      duree: 240,
      exemple: true,
      sujet:
        "Sujet d'entraînement – Culture générale (dissertation)\n\n« Un chef, c'est quelqu'un qui a besoin des autres. » (Paul Valéry)\n\nVous discuterez cette affirmation en vous appuyant sur des exemples tirés de l'histoire, de la vie militaire et de la société camerounaise.",
      bareme: "Problématique 4 pts ; plan et argumentation 10 pts ; exemples 3 pts ; expression 3 pts",
      corrige:
        "Introduction. On imagine souvent le chef comme un homme seul, qui décide et que les autres suivent. Paul Valéry renverse cette image : le chef serait d'abord celui qui a besoin des autres. Le commandement est-il une relation de dépendance plutôt que de domination ?\n\nI. Le chef dépend de ceux qu'il commande. Sans troupe, pas de victoire : un officier ne vaut que par la cohésion de sa section. Le chef a besoin de l'information remontée par ses subordonnés pour décider. Il a besoin de leur confiance : on obéit mieux à un chef respecté qu'à un chef craint.\n\nII. Mais le chef reste celui qui tranche. Dans l'urgence du combat, il doit décider seul et assumer la responsabilité. Il fixe le cap, donne l'exemple et porte le poids des échecs.\n\nIII. Le commandement, un service. C'est le sens de la formation à l'EMIA : former des officiers qui commandent par l'exemple et qui servent la Nation. Le bon chef sait s'entourer, écoute, puis décide et assume.\n\nConclusion. Avoir besoin des autres n'est pas une faiblesse du chef : c'est la condition de son autorité. Le chef véritable unit des hommes autour d'une mission commune.",
    },
    {
      id: "ens-2025-culture",
      concours: "ens-yaounde",
      annee: 2025,
      matiere: "Culture générale",
      duree: 180,
      exemple: true,
      sujet:
        "Sujet d'entraînement – Culture générale\n\nL'école camerounaise doit-elle d'abord transmettre des connaissances ou préparer à un métier ?\n\nVous répondrez dans une dissertation argumentée.",
      bareme: "Introduction 3 pts ; développement 12 pts ; conclusion 2 pts ; langue 3 pts",
      corrige:
        "Introduction. Le chômage des diplômés relance un vieux débat : l'école doit-elle former des esprits cultivés ou des travailleurs immédiatement employables ?\n\nI. Transmettre des connaissances : une mission fondamentale. Savoirs de base, esprit critique, culture commune qui fait la Nation.\n\nII. Préparer à un métier : une exigence actuelle. Inadéquation formation-emploi, professionnalisation de l'enseignement technique, apprentissage.\n\nIII. Concilier les deux. Socle commun solide, puis orientation et filières professionnelles ; rôle de l'enseignant formé à l'ENS.\n\nConclusion. L'école doit former à la fois l'homme et le travailleur : l'un ne va pas sans l'autre.",
    },
    {
      id: "enam-2025-culture",
      concours: "enam",
      annee: 2025,
      matiere: "Culture générale (dissertation)",
      duree: 240,
      exemple: true,
      sujet:
        "Sujet d'entraînement – Culture générale\n\nLa décentralisation peut-elle renforcer l'unité nationale ?\n\nVous traiterez ce sujet en vous appuyant notamment sur le cas du Cameroun.",
      bareme: "Problématique 4 pts ; argumentation 10 pts ; exemples et références 3 pts ; expression 3 pts",
      corrige:
        "Introduction. Le Code général des collectivités territoriales décentralisées de 2019 a donné plus de compétences aux communes et créé les régions. On pourrait craindre qu'en confiant des pouvoirs aux territoires, on affaiblisse l'unité de l'État. La décentralisation est-elle une menace ou un ciment pour l'unité nationale ?\n\nI. Les risques de la décentralisation. Repli identitaire, inégalités entre régions riches et pauvres, conflits de compétences.\n\nII. Un outil d'unité. Elle rapproche la décision du citoyen, reconnaît les spécificités (statut spécial du Nord-Ouest et du Sud-Ouest), renforce l'adhésion à l'État.\n\nIII. Les conditions du succès. Transferts réels de ressources, péréquation, contrôle de tutelle, formation des élus et des cadres territoriaux.\n\nConclusion. Bien conduite, la décentralisation n'oppose pas les territoires à la Nation : elle fait de chaque citoyen un acteur de l'unité.",
    },
  ],

  // Préparation à l'oral, pour les concours qui en comportent un.
  oral: {
    emia: {
      deroulement:
        "Entretien d'une vingtaine de minutes devant un jury d'officiers. Le jury évalue la motivation, la présentation, la culture générale, la connaissance de l'institution militaire et l'aptitude au commandement.",
      questions: [
        "Présentez-vous en deux minutes.",
        "Pourquoi voulez-vous devenir officier ?",
        "Que savez-vous de l'EMIA et de ses promotions ?",
        "Quelles qualités doit avoir un chef ?",
        "Que feriez-vous si un subordonné refusait d'exécuter un ordre ?",
        "Citez les grandes missions des forces de défense camerounaises.",
      ],
      conseils: [
        "Tenue sobre, posture droite, regard franc vers le jury.",
        "Préparez une présentation de deux minutes et répétez-la à voix haute.",
        "Révisez l'actualité de défense et de sécurité des six derniers mois.",
        "Répondez avec calme ; si vous ne savez pas, dites-le simplement.",
      ],
    },
    "ens-yaounde": {
      deroulement:
        "Oral d'admission pour les candidats admissibles : entretien portant sur la motivation pour le métier d'enseignant et sur la discipline choisie.",
      questions: [
        "Pourquoi voulez-vous enseigner ?",
        "Comment géreriez-vous une classe de 80 élèves ?",
        "Expliquez une notion de votre discipline comme à des élèves de 6e.",
      ],
      conseils: [
        "Montrez votre goût de la transmission avec un exemple vécu.",
        "Entraînez-vous à expliquer simplement une notion de votre matière.",
      ],
    },
    enam: {
      deroulement:
        "Grand oral devant un jury de hauts fonctionnaires et magistrats : tirage d'un sujet, courte préparation, exposé puis questions.",
      questions: [
        "Quel est le rôle du préfet dans l'administration territoriale ?",
        "Qu'est-ce que la séparation des pouvoirs ?",
        "Comment lutter contre la corruption dans l'administration ?",
      ],
      conseils: [
        "Annoncez un plan en deux parties dès le début de l'exposé.",
        "Maîtrisez la Constitution et l'organisation administrative du pays.",
        "Gardez un ton mesuré et neutre sur les questions politiques.",
      ],
    },
  },

  // Exemple de correction IA affiché en mode démo (sans serveur).
  correction_demo: {
    lisible: true,
    transcription_resume:
      "Le candidat introduit le sujet par la jeunesse de la population, développe deux causes (pauvreté, drogue) et propose des patrouilles et des formations.",
    note_sur_20: 11.5,
    appreciation:
      "Copie sérieuse et bien organisée, mais l'argumentation reste trop générale. Le lien entre chômage et insécurité est affirmé plus que démontré.",
    points_forts: [
      "Introduction claire avec une problématique posée",
      "Plan visible en deux parties",
      "Solutions adaptées au rôle de l'inspecteur de police",
    ],
    points_faibles: [
      "Aucune nuance : le chômage est présenté comme la seule cause",
      "Exemples peu précis (aucun quartier, aucun programme d'insertion cité)",
      "Conclusion sans ouverture",
    ],
    erreurs_langue: ["« les jeunes qui sont désœuvré » → « désœuvrés »", "« malgré que » → « bien que »"],
    conseils: [
      "Ajoutez une sous-partie « le chômage n'explique pas tout » pour nuancer.",
      "Citez un programme réel (PIAASI, FNE) et un exemple de ville.",
      "Gardez 10 minutes à la fin pour relire l'orthographe.",
    ],
    gestion_du_temps: "Copie rendue en 1 h 52 sur 2 h 30 : vous aviez le temps de relire et d'enrichir les exemples.",
  },
};
