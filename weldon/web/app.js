// Weldon — préparation aux concours camerounais, section francophone et section anglophone.
// Fonctionne avec le serveur Weldon (comptes, contenu protégé, paiement Chariow, correction IA)
// ou seule en « mode démo » (contenu embarqué, comptes et paiement simulés dans le navigateur).
(() => {
  "use strict";

  const PREP_SECONDS = 120;
  // Application Android (Capacitor) : pas de vente d'abonnement dans l'application (règles Google Play).
  const NATIVE = Boolean(window.Capacitor?.isNativePlatform?.());

  // ---------- Textes de l'interface ----------
  const T = {
    fr: {
      tabs: { concours: "Concours", quiz: "Quiz", epreuves: "Épreuves", corriges: "Corrigés", oral: "Oral", salle: "Salle" },
      tabsLong: { concours: "Les concours", quiz: "S'entraîner", epreuves: "Épreuves", corriges: "Corrigés rédigés", oral: "Préparer l'oral", salle: "Salle d'examen" },
      section: "Section francophone",
      changeSection: "Passer en section anglophone",
      subscribe: "S'abonner",
      subscriber: "Abonné",
      designer: "Concepteur",
      fullAccess: "Accès complet",
      perYear: (p) => `${p} pour 12 mois. Épreuves, corrigés, oral et salle d'examen.`,
      until: (d) => `Accès complet jusqu'au ${d}`,
      designerAccess: "Accès concepteur : tout est débloqué.",
      demoNotice:
        "<b>Mode démo.</b> Les sujets et corrigés sont des sujets d'entraînement rédigés pour la démonstration. Comptes et paiement sont simulés dans ce navigateur.",
      sampleTag: "Sujet d'entraînement",
      offered: "Offerte",
      readFree: "Lire gratuitement",
      locked: "Réservé aux abonnés",
      session: (y) => `Session ${y}`,
      papers: (n) => `${n} épreuve${n > 1 ? "s" : ""}`,
      sessions: (n) => `${n} session${n > 1 ? "s" : ""}`,
      noPapers: "Les épreuves de ce concours seront ajoutées prochainement.",
      chooseSchool: "Choisissez une école ou un concours",
      hero: "Chaque concours a ses règles. Apprends-les, puis entraîne-toi en conditions réelles.",
      heroSub: "Fiches des concours, épreuves classées par session, corrigés entièrement rédigés, préparation à l'oral et salle d'examen chronométrée.",
      enterRoom: "Entrer en salle d'examen",
      seePapers: "Voir les épreuves",
      statConcours: "concours décrits",
      statPapers: "épreuves avec corrigé",
      statFree: "épreuve offerte",
      statSections: "sections : FR et EN",
      allTypes: "Tous",
      search: "Rechercher un concours, une école, un ministère…",
      noResult: "Aucun concours ne correspond à votre recherche.",
      tutelle: "Ministère de tutelle",
      category: "Type de recrutement",
      sessionsDoc: "Sessions",
      placesPerSession: "Places par session",
      thYear: "Session",
      thPlaces: "Places",
      subjects: "Épreuves et matières",
      papersSoon: "Les épreuves de ce concours seront ajoutées dans Weldon au fur et à mesure.",
      inWeldon: (n) => `${n} épreuve${n > 1 ? "s" : ""} dans Weldon`,
      moreSoon: (n) => `${n} autres concours sont décrits dans « Les concours ». Leurs épreuves arrivent au fur et à mesure.`,
      officialNote: "Informations relevées dans les communiqués officiels. Vérifiez toujours l'arrêté de la session en cours.",
      latestPlaces: (y, d) => `${y} : ${d}${/place/i.test(d) ? "" : " places"}`,
      practiceBlock: "Sujets d'entraînement Weldon",
      inProgress: "En cours",
      inProgressLong: "Épreuves en cours d'ajout",
      selfTitle: "Corrigez-vous vous-même",
      selfHow: "Lisez le corrigé ci-dessous en gardant votre copie à côté, puis remplissez le barème qui suit : chaque critère explique ce qui vaut tous les points, la moitié ou zéro. La note se calcule toute seule.",
      selfGrid: "Votre note selon le barème",
      selfGlobal: "Votre note",
      selfSave: "Enregistrer ma note",
      selfSaved: "Note enregistrée dans « Mes compositions ».",
      selfHint: "Saisissez vos points pour voir votre note.",
      selfGood: "Très bien : au-dessus de la moyenne d'admission habituelle (12/20).",
      selfMid: "Moyenne atteinte, mais beaucoup de concours exigent 12/20. Retravaillez les points perdus.",
      selfLow: "Sous la moyenne : relisez le corrigé et recomposez ce sujet dans quelques jours.",
      retry: "Recomposer ce sujet",
      history: "Mes compositions",
      thNote: "Note",
      practiceSub: "Rédigés par Weldon au format officiel du concours, avec corrigé complet.",
      coverage: "Épreuves par concours",
      coverageSub: (a, b) => `${a} concours sur ${b} ont au moins une épreuve dans cette section.`,
      thPapers: "Épreuves",
      thOfficial: "Officielles",
      thConcours: "Concours",
      presentation: "Présentation",
      pickConcours: "Choisis ton concours",
      pickConcoursSub: "Conditions, limite d'âge, épreuves, coefficients, oral : tout ce qu'il faut savoir avant de déposer ton dossier.",
      writtenPapers: (n) => `${n} épreuves écrites`,
      oralYes: "Oral",
      oralNo: "Pas d'oral",
      allConcours: "Tous les concours",
      ficheHistory: "Historique",
      ficheConditions: "Conditions de candidature",
      fichePapers: "Épreuves écrites",
      thPaper: "Épreuve",
      thDuration: "Durée",
      thCoef: "Coef.",
      thElim: "Note élim.",
      places: "Places",
      calendar: "Calendrier",
      oral: "Oral",
      oralForEligible: "Oui, pour les admissibles",
      no: "Non",
      admission: "Admission",
      seeN: (n) => `Voir les ${n} épreuves`,
      prepOral: "Préparer l'oral",
      trainRoom: "S'entraîner en salle",
      epreuvesTitle: "Épreuves par école et par session",
      epreuvesSub: {
        premium: "Toutes les épreuves sont débloquées.",
        free: "Votre épreuve offerte est débloquée. Abonnez-vous pour accéder à toutes les autres.",
        none: "Choisissez <b>une</b> épreuve à lire gratuitement. Les autres sont réservées aux abonnés.",
      },
      corrigesTitle: "Corrigés rédigés",
      corrigesSub: "Chaque sujet entièrement rédigé, comme une copie modèle.",
      backTo: (x) => `Retour : ${x}`,
      duration: (d) => `Durée ${d}`,
      seeCorrige: "Voir le corrigé",
      seeSujet: "Revoir le sujet",
      composeRoom: "Composer en salle d'examen",
      sourceLabel: "Source du sujet",
      toCheck: "Passages à vérifier (scan ou photo peu lisible) :",
      toCheckAnswer: "Points du corrigé à vérifier (non confirmés par un texte officiel) :",
      scale: "Barème : comment se noter",
      gridHow: "Pour chaque critère, relisez votre copie, trouvez la phrase qui décrit le mieux ce que vous avez écrit, et donnez-vous les points indiqués.",
      ptsUnit: (n) => (n > 1 ? "pts" : "pt"),
      oralTitle: "Préparer l'oral",
      oralSub: "Pour les concours qui comportent un oral : comment il se déroule, ce que le jury demande, comment s'y préparer.",
      howOral: "Comment se passe l'oral",
      juryQuestions: "Questions fréquentes du jury",
      tips: "Conseils pour réussir",
      unlockOral: "Débloquer la préparation complète",
      roomTitle: "Salle d'examen",
      roomSub: "Choisissez une école, une session, puis l'épreuve par laquelle vous voulez commencer. Le chronomètre suit la durée officielle.",
      steps: ["1. Préparation", "2. Composition", "3. Auto-correction"],
      startsIn: "La composition commence dans",
      subjectAuto: "Le sujet s'affichera automatiquement.",
      ready: "Je suis prêt, commencer maintenant",
      setup: "Installez-vous comme le jour J",
      checklist: ["Un cahier ou des feuilles de copie", "Deux stylos (bleu ou noir) et une règle", "Un endroit calme, sans bruit autour de vous", "Téléphone en silencieux, pas d'aide extérieure", "Une bouteille d'eau"],
      handwrite: "Écrivez votre copie à la main, comme au concours. À la fin, vous verrez le corrigé et vous vous noterez avec le barème.",
      quitRoom: "Quitter la salle",
      timeLeft: "Temps restant",
      done: "J'ai terminé",
      keepOpen: "Gardez cette page ouverte. Si vous la fermez, le chronomètre continue.",
      timeUp: "Temps écoulé",
      finished: "Copie terminée",
      timeUsed: "Temps utilisé",
      outOf: (d) => `sur ${d} accordées`,
      newPaper: "Nouvelle épreuve",
      shouldWrite: "Ce qu'il fallait écrire",
      modelAnswer: "Corrigé rédigé",
      corrLoading: "Chargement du corrigé…",
      corrFailed: "Le corrigé n'a pas pu être chargé. Vérifiez votre connexion internet puis réessayez.",
      tryAgain: "Réessayer",
      examFailed: "L'épreuve n'a pas pu être chargée. Vérifiez votre connexion internet puis réessayez.",
      confirmFreeTitle: "Lire cette épreuve gratuitement ?",
      confirmFreeText:
        "Vous avez droit à <b>une seule</b> épreuve offerte. Les autres épreuves, les corrigés, l'oral et la salle d'examen sont réservés aux abonnés.",
      confirmFreeYes: "Oui, c'est mon épreuve offerte",
      confirmFreeNo: "Choisir une autre",
      finishTitle: "Rendre votre copie ?",
      finishText: (t) => `Il vous reste <b>${t}</b>. Une fois la copie rendue, vous ne pourrez plus revenir au sujet en temps limité.`,
      finishYes: "Oui, j'ai terminé",
      finishNo: "Continuer à composer",
      timeUpToast: "Temps écoulé. Posez vos stylos.",
      payTitle: "Weldon Accès complet",
      perYearShort: "FCFA / 12 mois",
      perMonthShort: "FCFA / mois",
      planAnnual: "12 mois",
      planMonthly: "1 mois",
      planMonthlyNote: "Pas de renouvellement automatique : vous repayez quand vous voulez.",
      planSave: (n) => `Économisez ${n}`,
      planTotal: (n) => `Soit ${n} sur 12 mois.`,
      nativeNoSale: "Les abonnements ne sont pas vendus dans l'application. Si vous êtes déjà abonné, utilisez l'e-mail de votre compte Weldon : votre accès complet est reconnu automatiquement.",
      oneTime: "Un seul paiement. Pas de renouvellement automatique.",
      perks: [
        "Toutes les épreuves, classées par école et par session",
        "Tous les corrigés entièrement rédigés",
        "La préparation à l'oral de chaque concours",
        "La salle d'examen chronométrée, avec corrigé et auto-correction",
      ],
      momo: "Numéro Mobile Money",
      payAs: (e) => `Le paiement sera rattaché à votre compte <b>${e}</b>.`,
      pay: (p) => `Payer ${p}`,
      simulatePay: "Simuler le paiement (démo)",
      payInfo: "Paiement sécurisé par Chariow : MTN Mobile Money, Orange Money ou carte bancaire. Vous serez redirigé vers la page de paiement puis ramené dans Weldon.",
      alreadyPaid: "Déjà payé ?",
      checkPayment: "Vérifier mon paiement",
      phoneErr: "Indiquez votre numéro Mobile Money.",
      paidSim: "Paiement simulé : accès complet activé pour 12 mois.",
      checking: "Vérification de votre paiement…",
      confirmed: "Paiement confirmé. Bienvenue dans Weldon !",
      notYet: "Paiement pas encore confirmé. Cliquez sur « Vérifier mon paiement » dans quelques minutes.",
      noSub: "Aucun paiement trouvé pour cet e-mail pour l'instant.",
      foundSub: "Abonnement trouvé. Bonne préparation !",
      account: "Mon compte",
      logout: "Se déconnecter",
      admin: "Espace concepteur",
      adminUsers: "Comptes inscrits",
      adminGrant: "Offrir un accès",
      adminGrantSub: "La personne doit d'abord créer son compte. Indiquez son e-mail et la durée.",
      days: "Jours",
      grant: "Offrir l'accès",
      granted: "Accès offert.",
      thUser: "Élève",
      thStatus: "Statut",
      free: "Gratuit",
      shieldTitle: "Contenu masqué",
      shieldText: "Revenez dans Weldon pour continuer. Les captures d'écran sont interdites.",
      noCapture: "Les captures d'écran sont interdites dans Weldon.",
      watermark: (e) => `Weldon · ${e} · reproduction interdite`,
      wakeUp: "Connexion au serveur…",
    },
    en: {
      tabs: { concours: "Exams", quiz: "Quiz", epreuves: "Papers", corriges: "Answers", oral: "Oral", salle: "Exam room" },
      tabsLong: { concours: "Competitions", quiz: "Practice", epreuves: "Past papers", corriges: "Model answers", oral: "Oral preparation", salle: "Exam room" },
      section: "Anglophone section",
      changeSection: "Switch to the francophone section",
      subscribe: "Subscribe",
      subscriber: "Subscriber",
      designer: "Designer",
      fullAccess: "Full access",
      perYear: (p) => `${p} for 12 months. Papers, model answers, oral and exam room.`,
      until: (d) => `Full access until ${d}`,
      designerAccess: "Designer access: everything is unlocked.",
      demoNotice:
        "<b>Demo mode.</b> Papers and model answers are practice papers written for the demonstration. Accounts and payment are simulated in this browser.",
      sampleTag: "Practice paper",
      offered: "Free",
      readFree: "Read for free",
      locked: "Subscribers only",
      session: (y) => `${y} session`,
      papers: (n) => `${n} paper${n > 1 ? "s" : ""}`,
      sessions: (n) => `${n} session${n > 1 ? "s" : ""}`,
      noPapers: "Papers for this competition will be added soon.",
      chooseSchool: "Choose a school or competition",
      hero: "Every competition has its rules. Learn them, then practise in real exam conditions.",
      heroSub: "Competition profiles, past papers by session, fully written model answers, oral preparation and a timed exam room.",
      enterRoom: "Enter the exam room",
      seePapers: "See the papers",
      statConcours: "competitions described",
      statPapers: "papers with model answers",
      statFree: "free paper",
      statSections: "sections: EN and FR",
      allTypes: "All",
      search: "Search a competition, school or ministry…",
      noResult: "No competition matches your search.",
      tutelle: "Supervising ministry",
      category: "Type of recruitment",
      sessionsDoc: "Sessions",
      placesPerSession: "Places per session",
      thYear: "Session",
      thPlaces: "Places",
      subjects: "Papers and subjects",
      papersSoon: "Papers for this competition will be added to Weldon progressively.",
      inWeldon: (n) => `${n} paper${n > 1 ? "s" : ""} in Weldon`,
      moreSoon: (n) => `${n} other competitions are described under "Competitions". Their papers are being added progressively.`,
      officialNote: "Information taken from official announcements. Always check the order for the current session.",
      latestPlaces: (y, d) => `${y}: ${d}${/place/i.test(d) ? "" : " places"}`,
      practiceBlock: "Weldon practice papers",
      inProgress: "Coming soon",
      inProgressLong: "Papers being added",
      selfTitle: "Mark your own script",
      selfHow: "Read the model answer below with your script beside you, then fill in the marking guide that follows: each criterion explains what earns full, half or no marks. Your mark is calculated automatically.",
      selfGrid: "Your mark from the marking guide",
      selfGlobal: "Your mark",
      selfSave: "Save my mark",
      selfSaved: "Mark saved in \"My papers\".",
      selfHint: "Enter your marks to see your score.",
      selfGood: "Very good: above the usual admission average (12/20).",
      selfMid: "Pass mark reached, but many competitions require 12/20. Work on the marks you lost.",
      selfLow: "Below average: reread the model answer and rewrite this paper in a few days.",
      retry: "Rewrite this paper",
      history: "My papers",
      thNote: "Mark",
      practiceSub: "Written by Weldon in the official format of the competition, with a full model answer.",
      coverage: "Papers per competition",
      coverageSub: (a, b) => `${a} of ${b} competitions have at least one paper in this section.`,
      thPapers: "Papers",
      thOfficial: "Official",
      thConcours: "Competition",
      presentation: "Overview",
      pickConcours: "Choose your competition",
      pickConcoursSub: "Requirements, age limit, papers, coefficients, oral: everything to know before you apply.",
      writtenPapers: (n) => `${n} written papers`,
      oralYes: "Oral",
      oralNo: "No oral",
      allConcours: "All competitions",
      ficheHistory: "History",
      ficheConditions: "Requirements",
      fichePapers: "Written papers",
      thPaper: "Paper",
      thDuration: "Duration",
      thCoef: "Coef.",
      thElim: "Elim. mark",
      places: "Places",
      calendar: "Calendar",
      oral: "Oral",
      oralForEligible: "Yes, for eligible candidates",
      no: "No",
      admission: "Admission",
      seeN: (n) => `See the ${n} papers`,
      prepOral: "Prepare for the oral",
      trainRoom: "Practise in the exam room",
      epreuvesTitle: "Past papers by school and session",
      epreuvesSub: {
        premium: "All papers are unlocked.",
        free: "Your free paper is unlocked. Subscribe to access all the others.",
        none: "Choose <b>one</b> paper to read for free. The others are for subscribers.",
      },
      corrigesTitle: "Model answers",
      corrigesSub: "Every paper fully answered, like a model script.",
      backTo: (x) => `Back: ${x}`,
      duration: (d) => `Duration ${d}`,
      seeCorrige: "See the model answer",
      seeSujet: "See the question paper",
      composeRoom: "Write it in the exam room",
      sourceLabel: "Source of the paper",
      toCheck: "Passages to check (scan or photo hard to read):",
      toCheckAnswer: "Points of the model answer to check (not confirmed by an official text):",
      scale: "Marking guide: how to mark yourself",
      gridHow: "For each criterion, reread your script, find the line that best describes what you wrote, and give yourself the marks shown.",
      ptsUnit: (n) => (n > 1 ? "marks" : "mark"),
      oralTitle: "Oral preparation",
      oralSub: "For competitions with an oral: how it works, what the panel asks and how to prepare.",
      howOral: "How the oral works",
      juryQuestions: "Frequent panel questions",
      tips: "Tips to succeed",
      unlockOral: "Unlock the full preparation",
      roomTitle: "Exam room",
      roomSub: "Choose a school, a session, then the paper you want to start with. The timer follows the official duration.",
      steps: ["1. Get ready", "2. Writing", "3. Self-marking"],
      startsIn: "The paper starts in",
      subjectAuto: "The question paper will appear automatically.",
      ready: "I'm ready, start now",
      setup: "Set up as on exam day",
      checklist: ["An exercise book or answer sheets", "Two pens (blue or black) and a ruler", "A quiet place with no noise around you", "Phone on silent, no outside help", "A bottle of water"],
      handwrite: "Write your answers by hand, as in the real exam. At the end, you will see the model answer and mark yourself with the marking guide.",
      quitRoom: "Leave the exam room",
      timeLeft: "Time left",
      done: "I've finished",
      keepOpen: "Keep this page open. If you close it, the timer keeps running.",
      timeUp: "Time is up",
      finished: "Script handed in",
      timeUsed: "Time used",
      outOf: (d) => `out of ${d} allowed`,
      newPaper: "New paper",
      shouldWrite: "What you should have written",
      modelAnswer: "Model answer",
      corrLoading: "Loading the model answer…",
      corrFailed: "The model answer could not be loaded. Check your internet connection and try again.",
      tryAgain: "Try again",
      examFailed: "The paper could not be loaded. Check your internet connection and try again.",
      confirmFreeTitle: "Read this paper for free?",
      confirmFreeText:
        "You are entitled to <b>one</b> free paper. All other papers, model answers, the oral and the exam room are for subscribers.",
      confirmFreeYes: "Yes, this is my free paper",
      confirmFreeNo: "Choose another one",
      finishTitle: "Hand in your script?",
      finishText: (t) => `You have <b>${t}</b> left. Once handed in, you cannot go back to the timed paper.`,
      finishYes: "Yes, I've finished",
      finishNo: "Keep writing",
      timeUpToast: "Time is up. Pens down.",
      payTitle: "Weldon Full access",
      perYearShort: "FCFA / 12 months",
      perMonthShort: "FCFA / month",
      planAnnual: "12 months",
      planMonthly: "1 month",
      planMonthlyNote: "No automatic renewal: you pay again whenever you wish.",
      planSave: (n) => `Save ${n}`,
      planTotal: (n) => `That is ${n} over 12 months.`,
      nativeNoSale: "Subscriptions are not sold in the app. If you already subscribe, use the email of your Weldon account: your full access is recognised automatically.",
      oneTime: "One payment. No automatic renewal.",
      perks: [
        "All past papers, by school and session",
        "All fully written model answers",
        "Oral preparation for every competition",
        "The timed exam room, with model answer and self-marking",
      ],
      momo: "Mobile Money number",
      payAs: (e) => `The payment will be linked to your account <b>${e}</b>.`,
      pay: (p) => `Pay ${p}`,
      simulatePay: "Simulate payment (demo)",
      payInfo: "Secure payment by Chariow: MTN Mobile Money, Orange Money or bank card. You will be taken to the payment page and then back to Weldon.",
      alreadyPaid: "Already paid?",
      checkPayment: "Check my payment",
      phoneErr: "Enter your Mobile Money number.",
      paidSim: "Simulated payment: full access activated for 12 months.",
      checking: "Checking your payment…",
      confirmed: "Payment confirmed. Welcome to Weldon!",
      notYet: "Payment not confirmed yet. Tap \"Check my payment\" in a few minutes.",
      noSub: "No payment found for this email yet.",
      foundSub: "Subscription found. Good luck with your preparation!",
      account: "My account",
      logout: "Log out",
      admin: "Designer area",
      adminUsers: "Registered accounts",
      adminGrant: "Give free access",
      adminGrantSub: "The person must create an account first. Enter their email and the duration.",
      days: "Days",
      grant: "Give access",
      granted: "Access given.",
      thUser: "Student",
      thStatus: "Status",
      free: "Free",
      shieldTitle: "Content hidden",
      shieldText: "Come back to Weldon to continue. Screenshots are not allowed.",
      noCapture: "Screenshots are not allowed in Weldon.",
      watermark: (e) => `Weldon · ${e} · do not copy`,
      wakeUp: "Connecting to the server…",
    },
  };

  // Écrans de connexion et de choix de section : bilingues.
  const AUTH = {
    title: "Prépare tes concours · Prepare for your competitive exams",
    login: "Se connecter · Log in",
    register: "Créer un compte · Sign up",
    name: "Nom complet · Full name",
    email: "E-mail",
    password: "Mot de passe · Password",
    pwHint: "8 caractères minimum · at least 8 characters",
    submitLogin: "Se connecter · Log in",
    submitRegister: "Créer mon compte · Create my account",
    forgot: "Mot de passe oublié ? Écrivez au support Weldon. · Forgot your password? Contact Weldon support.",
    chooseTitle: "Choisissez votre section · Choose your section",
    chooseSub: "Toutes les épreuves, les corrigés et l'oral suivront la langue choisie. Vous pourrez changer plus tard. · All papers, model answers and the oral will follow the language you choose. You can change it later.",
    fr: ["Section francophone", "Épreuves, corrigés et oral en français"],
    en: ["Anglophone section", "Papers, model answers and oral in English"],
  };

  // ---------- Stockage local ----------
  const local = {
    get(k, d) {
      try {
        const v = localStorage.getItem("weldon." + k);
        return v == null ? d : JSON.parse(v);
      } catch {
        return d;
      }
    },
    set(k, v) {
      try {
        localStorage.setItem("weldon." + k, JSON.stringify(v));
      } catch {}
    },
    del(k) {
      try {
        localStorage.removeItem("weldon." + k);
      } catch {}
    },
  };

  const state = {
    demo: true,
    config: { price_xaf: 100000, payment_enabled: false, ai_enabled: false },
    token: local.get("token", null),
    user: null,
    catalog: null,
    tab: local.get("tab", "concours"),
    nav: {}, // par onglet : { concours: id } puis { doc: id }
    authMode: "login",
    q: "",
    cat: "all",
    exam: local.get("exam", null),
    examDoc: null,
    selfScores: {},
    docCache: {},
    docError: {},
    space: local.get("space", "concours"),
    bourses: null,
    bf: {},
    bFicheId: null,
    oralCache: {},
    booting: true,
  };

  const lang = () => state.user?.lang || "fr";
  const t = () => T[lang()];

  // ---------- Accès aux données : serveur réel ou démo locale ----------
  async function http(path, { method = "GET", body } = {}) {
    const headers = { "Content-Type": "application/json" };
    if (state.token) headers.Authorization = "Bearer " + state.token;
    const res = await fetch(path, { method, headers, body: body ? JSON.stringify(body) : undefined });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      const e = new Error(json.error || "Le serveur ne répond pas. Vérifiez votre connexion.");
      e.status = res.status;
      e.code = json.code;
      throw e;
    }
    return json;
  }

  const live = {
    config: () => http("/api/config"),
    register: (b) => http("/api/register", { method: "POST", body: b }),
    login: (b) => http("/api/login", { method: "POST", body: b }),
    me: () => http("/api/me"),
    update: (b) => http("/api/me", { method: "POST", body: b }),
    catalog: (l) => http("/api/catalog?lang=" + l),
    orientation: (l) => http("/api/orientation?lang=" + l),
    sujet: (id) => http(`/api/epreuves/${id}/sujet`),
    corrige: (id) => http(`/api/epreuves/${id}/corrige`),
    oral: (cid, l) => http(`/api/oral/${cid}?lang=${l}`),
    checkout: (b) => http("/api/checkout", { method: "POST", body: b }),
    verifySale: (id) => http("/api/verify-sale", { method: "POST", body: { sale_id: id } }),
    sync: () => http("/api/sync-subscription", { method: "POST" }),
    adminUsers: () => http("/api/admin/users"),
    grant: (b) => http("/api/admin/grant", { method: "POST", body: b }),
    report: (b) => http("/api/report", { method: "POST", body: b }),
    annonces: () => http("/api/annonces"),
    bourses: (l) => http("/api/bourses?lang=" + l),
    bourse: (id, l) => http("/api/bourse?id=" + encodeURIComponent(id) + "&lang=" + l),
    conseils: (l) => http("/api/conseils?lang=" + l),
    conseil: (id, l) => http("/api/conseil?id=" + encodeURIComponent(id) + "&lang=" + l),
    followBourse: (id, on) => http("/api/follow-bourse", { method: "POST", body: { id, on } }),
    adminSaveBourse: (b) => http("/api/admin/bourse", { method: "POST", body: b }),
    plan: () => http("/api/plan"),
    savePlan: (b) => http("/api/plan", { method: "POST", body: b }),
    quizStats: () => http("/api/quiz/stats"),
    quizDaily: (l) => http("/api/quiz/daily?lang=" + l),
    quizRevision: (l) => http("/api/quiz/revision?lang=" + l),
    quizSeries: (theme, n, l) => http(`/api/quiz/series?lang=${l}&n=${n}&theme=${encodeURIComponent(theme || "")}`),
    quizBlanc: (l) => http("/api/quiz/blanc?lang=" + l),
    quizCheck: (mode, answers) => http("/api/quiz/check", { method: "POST", body: { mode, answers } }),
    follow: (id, on) => http("/api/follow", { method: "POST", body: { id, on } }),
    adminAnnonces: () => http("/api/admin/annonces"),
    adminSaveFiche: (b) => http("/api/admin/fiche", { method: "POST", body: b }),
    adminSaveAnnonce: (b) => http("/api/admin/annonce", { method: "POST", body: b }),
    adminRejectAnnonce: (id) => http("/api/admin/annonce-reject", { method: "POST", body: { id } }),
    exportData: () => http("/api/me/export"),
    deleteAccount: (password) => http("/api/account/delete", { method: "POST", body: { password } }),
    adminReports: () => http("/api/admin/reports"),
    adminCloseReport: (id) => http("/api/admin/report-close", { method: "POST", body: { id } }),
    adminEpreuves: () => http("/api/admin/epreuves"),
    adminSwitch: (id, off) => http("/api/admin/epreuve-switch", { method: "POST", body: { id, off } }),
  };

  // Démo : même interface, données embarquées (window.WELDON_DEMO) et comptes dans ce navigateur.
  const demo = (() => {
    const C = () => window.WELDON_DEMO;
    const users = () => local.get("demo.users", {});
    const saveUsers = (u) => local.set("demo.users", u);
    const fail = (msg, code, status = 400) => {
      const e = new Error(msg);
      e.code = code;
      e.status = status;
      throw e;
    };
    const current = () => {
      const u = users()[state.token];
      if (!u) fail("Session expirée.", null, 401);
      return u;
    };
    const premium = (u) => u.admin || (u.premium_until && Date.parse(u.premium_until) > Date.now());
    const profile = (u) => ({ email: u.email, name: u.name, lang: u.lang, admin: Boolean(u.admin), premium: Boolean(premium(u)), premium_until: u.admin ? null : u.premium_until || null, free_id: u.free_id || null });
    const save = (u) => {
      const all = users();
      all[u.email] = u;
      saveUsers(all);
      return profile(u);
    };
    return {
      config: async () => ({ mode: "demo", price_xaf: 100000, payment_enabled: false, ai_enabled: false }),
      async register({ email, name, password }) {
        email = String(email || "").trim().toLowerCase();
        if (!name) fail("Indiquez votre nom. · Enter your name.");
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fail("Adresse e-mail invalide. · Invalid email address.");
        if (String(password).length < 8) fail("8 caractères minimum. · At least 8 characters.");
        if (users()[email]) fail("Un compte existe déjà avec cet e-mail. · An account already exists with this email.");
        const u = { email, name, pw: password, lang: null, admin: /concepteur|admin/.test(email) };
        save(u);
        return { token: email, user: profile(u) };
      },
      async login({ email, password }) {
        const u = users()[String(email || "").trim().toLowerCase()];
        if (!u || u.pw !== password) fail("E-mail ou mot de passe incorrect. · Wrong email or password.", null, 401);
        return { token: u.email, user: profile(u) };
      },
      me: async () => profile(current()),
      async update(b) {
        const u = current();
        if (b.lang) u.lang = b.lang;
        if (b.profil) u.profil = { ...(u.profil || {}), ...b.profil };
        return save(u);
      },
      report: async () => ({ ok: true }),
      annonces: async () => [],
      bourses: async () => fail("Les bourses ne sont pas disponibles dans la démo.", "demo", 400),
      bourse: async () => fail("Non disponible dans la démo.", "demo", 400),
      conseils: async () => fail("Non disponible dans la démo.", "demo", 400),
      conseil: async () => fail("Non disponible dans la démo.", "demo", 400),
      followBourse: async () => fail("Non disponible dans la démo.", "demo", 400),
      adminSaveBourse: async () => ({ ok: true }),
      plan: async () => ({ plan: null }),
      savePlan: async () => fail("Le plan n'est pas disponible dans la démo.", "demo", 400),
      quizStats: async () => fail("L'entraînement n'est pas disponible dans la démo.", "demo", 400),
      async follow(id, on) {
        const u = current();
        const list = new Set(u.suivis || []);
        if (on === false) list.delete(id);
        else list.add(id);
        u.suivis = [...list];
        return save(u);
      },
      adminAnnonces: async () => [],
      adminSaveFiche: async () => ({ ok: true }),
      adminSaveAnnonce: async () => ({ ok: true }),
      adminRejectAnnonce: async () => ({ ok: true }),
      exportData: async () => ({ compte: profile(current()) }),
      deleteAccount: async () => fail("Non disponible dans la démo.", "demo", 400),
      adminReports: async () => [],
      adminCloseReport: async () => ({ ok: true }),
      adminEpreuves: async () => [],
      adminSwitch: async () => ({ ok: true }),
      orientation: async () => fail("L'orientation n'est pas disponible dans la démo.", "demo", 400),
      async catalog(l) {
        const d = C();
        return {
          lang: l,
          groupes: Object.fromEntries(Object.entries(d.groupes).map(([k, v]) => [k, v[l]])),
          categories: Object.fromEntries(Object.entries(d.categories).map(([k, v]) => [k, v[l]])),
          photos: Object.fromEntries(Object.entries(d.photos || {}).filter(([k]) => !k.startsWith("_"))),
          concours: d.concours.filter((c) => c[l]).map((c) => ({ id: c.id, sigle: c.sigle, couleur: c.couleur, groupe: c.groupe, categorie: c.categorie, tutelle: c.tutelle, oral: c.oral, priorite: c.priorite || 999, theme: c.theme, ...c[l] })),
          epreuves: d.epreuves.filter((e) => e.lang === l).map((e) => ({ id: e.id, concours: e.concours, annee: e.annee, matiere: e.matiere, duree: e.duree, exemple: Boolean(e.exemple), apercu: e.sujet.slice(0, 140) })),
          oral: Object.fromEntries(Object.entries(d.oral).filter(([, v]) => v[l]).map(([k, v]) => [k, { deroulement: v[l].deroulement }])),
        };
      },
      async sujet(id) {
        const u = current();
        const e = C().epreuves.find((x) => x.id === id);
        if (!premium(u)) {
          if (!u.free_id) {
            u.free_id = id;
            save(u);
          } else if (u.free_id !== id) fail("Réservé aux abonnés.", "locked", 402);
        }
        const { corrige, bareme, grille, ...s } = e;
        return s;
      },
      async corrige(id) {
        if (!premium(current())) fail("Réservé aux abonnés.", "locked", 402);
        return C().epreuves.find((x) => x.id === id);
      },
      async oral(cid, l) {
        if (!premium(current())) fail("Réservé aux abonnés.", "locked", 402);
        return C().oral[cid][l];
      },
      async checkout() {
        const u = current();
        u.premium_until = new Date(Date.now() + 365 * 864e5).toISOString();
        return { step: "demo_paid", user: save(u) };
      },
      verifySale: async () => ({ paid: false }),
      sync: async () => profile(current()),
      adminUsers: async () => Object.values(users()).map(profile),
      async grant({ email, days }) {
        const all = users();
        const u = all[String(email).toLowerCase()];
        if (!u) fail("Aucun compte avec cet e-mail.");
        u.premium_until = new Date(Date.now() + Number(days) * 864e5).toISOString();
        return save(u);
      },
    };
  })();

  const api = () => (state.demo ? demo : live);

  // ---------- Icônes ----------
  const I = {
    concours: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18M5 21V10l7-5 7 5v11M9 21v-6h6v6"/></svg>',
    bhome: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11.5V16c0 1.5 2.7 3 6 3s6-1.5 6-3v-4.5M22 9v6"/></svg>',
    bfind: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>',
    bcal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
    bguide: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5a2 2 0 0 1 2-2h12v16H6a2 2 0 0 0-2 2z"/><path d="M4 21V5M9 8h6M9 12h6"/></svg>',
    bfollow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/></svg>',
    quiz: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M9.6 9.4a2.5 2.5 0 1 1 3.6 2.2c-.8.4-1.2 1-1.2 1.8M12 17h.01"/></svg>',
    epreuves: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M8 13h8M8 17h5"/></svg>',
    corriges: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M8.5 15l2.5 2.5 4.5-5"/></svg>',
    oral: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>',
    salle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5M9 2h6"/></svg>',
    lock: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/></svg>',
    info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8h.01M11 12h1v5h1"/></svg>',
    back: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>',
    chevron: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>',
    user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>',
  };
  const LOGO = `<svg class="brand-mark" viewBox="0 0 40 40" aria-hidden="true"><rect width="40" height="40" rx="11" fill="var(--green)"/><path d="M9 12l4.6 16L20 15l6.4 13L31 12" fill="none" stroke="var(--green-ink)" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/><circle cx="31" cy="9" r="4" fill="var(--sun)"/></svg>`;
  const BRAND = `<div class="brand">${LOGO}<span class="brand-name">Wel<span>don</span></span></div>`;

  // ---------- Orientation : textes (la logique est côté serveur, server/orientation.js) ----------
  const LEVELS = ["bepc", "probatoire", "terminale", "bac", "bac+2", "licence", "master", "doctorat"];
  const SERIES_BY_LANG = { fr: ["A", "C", "D", "E", "TI", "F", "G", "AUTRE"], en: ["ARTS", "LA1", "LA2", "LA3", "LA4", "LA5", "SCIENCE", "LS1", "LS2", "LS3", "LS4", "TECH", "AUTRE"] };
  // Série du bac → branche et filières de bourses à proposer en premier (séries anglophones : voir la fiche des Lower Sixth).
  const SERIE_MAP = {
    A: ["lettres", ["lettres-langues", "histoire-geographie", "droit-politique", "philo-sociologie"]],
    G: ["lettres", ["economie-gestion"]],
    C: ["sciences", ["maths", "physique-chimie", "ingenierie", "informatique"]],
    D: ["sciences", ["sante", "agronomie-environnement", "physique-chimie"]],
    E: ["sciences", ["ingenierie", "maths"]],
    TI: ["sciences", ["informatique", "ingenierie"]],
    F: ["sciences", ["ingenierie"]],
    ARTS: ["lettres", []],
    LA1: ["lettres", ["lettres-langues", "histoire-geographie"]],
    LA2: ["lettres", ["histoire-geographie", "economie-gestion"]],
    LA3: ["lettres", ["economie-gestion", "lettres-langues", "histoire-geographie"]],
    LA4: ["lettres", ["economie-gestion", "histoire-geographie"]],
    LA5: ["lettres", ["philo-sociologie", "histoire-geographie", "lettres-langues"]],
    SCIENCE: ["sciences", []],
    LS1: ["sciences", ["maths", "physique-chimie", "ingenierie", "informatique"]],
    LS2: ["sciences", ["physique-chimie", "sante"]],
    LS3: ["sciences", ["sante", "agronomie-environnement", "physique-chimie"]],
    LS4: ["sciences", ["agronomie-environnement", "sante"]],
    TECH: ["sciences", ["ingenierie"]],
  };
  const REGIONS = ["adamaoua", "centre", "est", "extreme-nord", "littoral", "nord", "nord-ouest", "ouest", "sud", "sud-ouest"];
  const INTERESTS = ["ordre", "enseignement", "sante", "administration", "finances", "technique", "nature", "ecoles"];
  const ORI = {
    fr: {
      cta: "Quel concours pour moi ?",
      ctaSub: "Indiquez votre niveau, votre série et votre âge : Weldon classe les concours accessibles et explique pourquoi.",
      ctaBtn: "Trouver mon concours",
      title: "Quel concours pour moi ?",
      sub: "Le but n'est pas de passer n'importe quel concours, mais celui qui correspond à votre projet.",
      formTitle: "Votre profil",
      formSub: "Une minute suffit. Vous pourrez le modifier à tout moment.",
      level: "Niveau d'études",
      levelPh: "Choisissez votre niveau",
      levels: {
        cep: "CEP (certificat d'études primaires)",
        bepc: "BEPC / GCE Ordinary Level",
        probatoire: "Probatoire / Lower Sixth",
        terminale: "En Terminale / Upper Sixth (bac pas encore obtenu)",
        bac: "Baccalauréat / GCE Advanced Level",
        "bac+2": "Bac + 2 (BTS, DUT, DEUG…)",
        licence: "Licence",
        master: "Master",
        doctorat: "Doctorat",
      },
      series: "Série du baccalauréat",
      seriesHelp: "Pour ceux qui ont le bac ou qui le préparent.",
      seriesPh: "Choisissez votre série",
      seriesNames: { A: "A (littéraire)", C: "C (maths et sciences physiques)", D: "D (maths et sciences de la vie)", E: "E (maths et techniques)", TI: "TI (technologies de l'information)", F: "F (techniques industrielles)", G: "G (gestion, commerce)", ARTS: "Arts", SCIENCE: "Science", TECH: "Technique", AUTRE: "Autre / je ne sais pas", LA1: "LA1 (Français, Histoire, Littérature)", LA2: "LA2 (Histoire, Économie, Géographie)", LA3: "LA3 (Économie, Histoire, Littérature)", LA4: "LA4 (Économie, Géographie, Maths)", LA5: "LA5 (Philosophie, Histoire, Littérature)", LS1: "LS1 (Physique, Chimie, Maths)", LS2: "LS2 (Physique, Chimie, Biologie)", LS3: "LS3 (Chimie, Biologie, Maths)", LS4: "LS4 (Chimie, Biologie, Géologie)" },
      birth: "Année de naissance",
      birthHelp: "Seulement l'année : elle sert à vérifier les limites d'âge.",
      region: "Région (facultatif)",
      regionPh: "—",
      regions: { adamaoua: "Adamaoua", centre: "Centre", est: "Est", "extreme-nord": "Extrême-Nord", littoral: "Littoral", nord: "Nord", "nord-ouest": "Nord-Ouest", ouest: "Ouest", sud: "Sud", "sud-ouest": "Sud-Ouest" },
      interests: "Ce qui vous attire (facultatif)",
      interestsHelp: "Cela sert à classer les concours, jamais à en exclure.",
      interestNames: { ordre: "Ordre, sécurité et défense", enseignement: "Enseignement, jeunesse et sport", sante: "Santé et action sociale", administration: "Administration, justice et communication", finances: "Finances et douanes", technique: "Ingénierie, numérique et transports", nature: "Agriculture, élevage et environnement", ecoles: "Grandes écoles et économie" },
      save: "Voir mes concours",
      edit: "Modifier mon profil",
      born: (y) => `né(e) en ${y}`,
      target: (y) => `Âge calculé pour la session ${y}.`,
      loading: "Analyse de votre profil…",
      groups: {
        bien: ["Bien adaptés", "Votre profil répond aux conditions connues."],
        adapte: ["Adaptés", "Vous remplissez les conditions, mais votre niveau ou vos centres d'intérêt s'éloignent un peu."],
        possible: ["Possibles : à vérifier", "Un point reste à confirmer dans l'arrêté officiel."],
        improbable: ["Probablement hors conditions", "Une condition ne semble pas remplie, selon une source non officielle. Vérifiez l'arrêté avant d'abandonner."],
        inconnu: ["Conditions pas encore renseignées", "Nous n'avons pas encore vérifié leurs conditions : consultez l'arrêté officiel."],
        non: ["Non accessibles avec ce profil", "Une condition vérifiée n'est pas remplie."],
      },
      none: "Aucun concours dans cette catégorie.",
      open: "Voir la fiche",
      verify: "À vérifier",
      reason(r, lv) {
        const list = (r.series || []).join(", ");
        const age = r.age_min != null && r.age_max != null ? `${r.age_min} à ${r.age_max} ans` : r.age_max != null ? `${r.age_max} ans au plus` : `${r.age_min} ans au moins`;
        const weak = r.weak ? " (source non officielle)" : "";
        return {
          level_ok: `Niveau demandé : ${lv(r.min)} : vous l'avez.`,
          level_over: "Vous dépassez le niveau demandé.",
          level_low: `Niveau demandé : ${lv(r.min)} ou plus${weak}.`,
          level_high: `Réservé aux niveaux jusqu'à : ${lv(r.max)}${weak}.`,
          level_terminale: "Le baccalauréat est exigé : vous devrez l'avoir obtenu avant le dépôt du dossier (à confirmer).",
          level_unknown: "Niveau demandé non précisé : à vérifier.",
          series_ok: `Votre série est admise (${list}).`,
          series_no: `Séries admises : ${list}${weak}.`,
          series_unknown: `Séries admises : ${list}. Indiquez la vôtre pour savoir.`,
          series_system: `Séries citées : ${list}. Elles ne correspondent pas à votre système : à vérifier.`,
          series_free: "Pas de série imposée dans les conditions connues.",
          diploma_check: "Vérifiez que votre filière correspond au diplôme demandé.",
          age_ok: `Âge demandé : ${age} : vous êtes dans la limite.`,
          age_over: `Limite d'âge : ${age}${weak}.`,
          age_under: `Âge demandé : ${age}${weak}.`,
          age_border: `Âge demandé : ${age}. Selon votre date de naissance exacte, vous pouvez être juste dans la limite ou juste au-dessus.`,
          age_unknown: `Une limite d'âge existe (${age}) : indiquez votre année de naissance.`,
          age_missing: "Limite d'âge non précisée dans nos sources : à vérifier.",
          age_none: "Pas de limite d'âge.",
          interest_match: "Correspond à ce qui vous attire.",
          interest_other: "Éloigné de ce qui vous attire.",
          no_data: "Conditions pas encore renseignées.",
          pause: this.per.pauseReason(r.prochaine),
        }[r.code];
      },
      pauseTag: "En pause",
      per: {
        title: "Périodicité",
        types: { annuelle: "Chaque année", irreguliere: "Irrégulière", inconnue: "Périodicité non établie" },
        everyN: (n) => `Tous les ${n} ans environ`,
        sessions: "Sessions connues",
        last: "Dernière session",
        next: "Prochaine session probable",
        toConfirm: "à confirmer",
        pauseTitle: "Concours en pause",
        pauseText: (y) => `Aucune session n'est attendue avant ${y} environ. Cette date est probable, elle sera à confirmer par l'arrêté officiel.`,
        alternatives: "Concours alternatifs pour votre profil",
        needProfile: "Indiquez votre profil pour voir des concours alternatifs.",
        none: "Aucune alternative trouvée pour ce profil.",
        conf: { officiel: "source officielle", secondaire: "source relais, non officielle", deduit: "déduit de l'historique", non_trouve: "non confirmé" },
        pauseReason: (y) => `En pause : prochaine session probable en ${y} (à confirmer).`,
      },
      accessTitle: "Conditions d'accès",
      accessNote: (y) => `Conditions ${y ? "de la session " + y : "relevées"}, à confirmer dans l'arrêté officiel.`,
      diplomas: "Diplômes",
      seriesLabel: "Séries",
      ageLabel: "Âge",
      ageText: (a) => (a.age_min != null && a.age_max != null ? `${a.age_min} à ${a.age_max} ans` : a.age_max != null ? `${a.age_max} ans au plus` : `${a.age_min} ans au moins`),
      others: "Autres conditions",
      nationality: "Nationalité",
      cameroonian: "Camerounaise",
      outcomes: "Débouchés",
      periodTitle: "Période habituelle (probable)",
      launch: "Lancement",
      deadline: "Dépôt des dossiers",
      exams: "Épreuves",
      fees: "Frais",
      dossier: "Pièces du dossier",
      variants: "Autres corps ou cycles",
      register: "Inscription officielle",
      sources: "Sources",
      lastVerified: (d) => `Dernière vérification : ${d}`,
      unverified: "Informations à vérifier : elles n'ont pas encore été confirmées par un texte officiel.",
      scamTitle: "Éviter les arnaques",
      scam: [
        "Aucun concours ne se gagne en payant : personne ne peut vous garantir une place.",
        "Les frais officiels et les inscriptions se vérifient uniquement sur les sites officiels du ministère ou de l'école.",
        "Méfiez-vous de ceux qui demandent de l'argent pour « placer » ou « accélérer » un dossier.",
        "Weldon n'est affilié à aucune institution. Les informations peuvent changer : vérifiez toujours l'arrêté de la session.",
      ],
    },
    en: {
      cta: "Which competition is right for me?",
      ctaSub: "Tell us your level, series and age: Weldon ranks the competitions you can enter and explains why.",
      ctaBtn: "Find my competition",
      title: "Which competition is right for me?",
      sub: "The aim is not to sit just any competition, but the one that fits your plans.",
      formTitle: "Your profile",
      formSub: "One minute is enough. You can change it at any time.",
      level: "Level of studies",
      levelPh: "Choose your level",
      levels: {
        cep: "First School Leaving Certificate (CEP)",
        bepc: "GCE Ordinary Level / BEPC",
        probatoire: "Lower Sixth / Probatoire",
        terminale: "In Upper Sixth / Terminale (A Level not yet obtained)",
        bac: "GCE Advanced Level / Baccalauréat",
        "bac+2": "Two years after A Level (HND, DUT…)",
        licence: "Bachelor's degree",
        master: "Master's degree",
        doctorat: "Doctorate",
      },
      series: "A Level stream",
      seriesHelp: "For those who have their A Level or are preparing it.",
      seriesPh: "Choose your stream",
      seriesNames: { A: "A (literary)", C: "C (maths and physics)", D: "D (maths and life sciences)", E: "E (maths and technology)", TI: "TI (information technology)", F: "F (industrial technology)", G: "G (management, commerce)", ARTS: "Arts", SCIENCE: "Science", TECH: "Technical", AUTRE: "Other / I don't know", LA1: "LA1 (French, History, Literature)", LA2: "LA2 (History, Economics, Geography)", LA3: "LA3 (Economics, History, Literature)", LA4: "LA4 (Economics, Geography, Mathematics)", LA5: "LA5 (Philosophy, History, Literature)", LS1: "LS1 (Physics, Chemistry, Mathematics)", LS2: "LS2 (Physics, Chemistry, Biology)", LS3: "LS3 (Chemistry, Biology, Mathematics)", LS4: "LS4 (Chemistry, Biology, Geology)" },
      birth: "Year of birth",
      birthHelp: "The year only: it is used to check age limits.",
      region: "Region (optional)",
      regionPh: "—",
      regions: { adamaoua: "Adamawa", centre: "Centre", est: "East", "extreme-nord": "Far North", littoral: "Littoral", nord: "North", "nord-ouest": "North-West", ouest: "West", sud: "South", "sud-ouest": "South-West" },
      interests: "What attracts you (optional)",
      interestsHelp: "This is used to rank competitions, never to rule any out.",
      interestNames: { ordre: "Law enforcement, security and defence", enseignement: "Teaching, youth and sport", sante: "Health and social work", administration: "Administration, justice and communication", finances: "Finance and customs", technique: "Engineering, digital and transport", nature: "Agriculture, livestock and environment", ecoles: "Top schools and economics" },
      save: "See my competitions",
      edit: "Edit my profile",
      born: (y) => `born in ${y}`,
      target: (y) => `Age worked out for the ${y} session.`,
      loading: "Analysing your profile…",
      groups: {
        bien: ["Well suited", "Your profile meets the known conditions."],
        adapte: ["Suited", "You meet the conditions, but your level or interests are a little off."],
        possible: ["Possible: to be checked", "One point still has to be confirmed in the official order."],
        improbable: ["Probably outside the conditions", "A condition does not seem to be met, according to an unofficial source. Check the official order before giving up."],
        inconnu: ["Conditions not yet recorded", "We have not yet checked their conditions: read the official order."],
        non: ["Not open to this profile", "A verified condition is not met."],
      },
      none: "No competition in this category.",
      open: "See the page",
      verify: "To be checked",
      reason(r, lv) {
        const list = (r.series || []).join(", ");
        const age = r.age_min != null && r.age_max != null ? `${r.age_min} to ${r.age_max} years` : r.age_max != null ? `${r.age_max} years at most` : `${r.age_min} years at least`;
        const weak = r.weak ? " (unofficial source)" : "";
        return {
          level_ok: `Level required: ${lv(r.min)}: you have it.`,
          level_over: "You are above the level required.",
          level_low: `Level required: ${lv(r.min)} or higher${weak}.`,
          level_high: `Reserved for levels up to: ${lv(r.max)}${weak}.`,
          level_terminale: "An A Level / Baccalauréat is required: you will need to have it before submitting your file (to be confirmed).",
          level_unknown: "Level required not specified: to be checked.",
          series_ok: `Your stream is accepted (${list}).`,
          series_no: `Streams accepted: ${list}${weak}.`,
          series_unknown: `Streams accepted: ${list}. Enter yours to find out.`,
          series_system: `Streams quoted: ${list}. They do not match your system: to be checked.`,
          series_free: "No stream required in the known conditions.",
          diploma_check: "Check that your field matches the diploma required.",
          age_ok: `Age required: ${age}: you are within the limit.`,
          age_over: `Age limit: ${age}${weak}.`,
          age_under: `Age required: ${age}${weak}.`,
          age_border: `Age required: ${age}. Depending on your exact birth date, you may be just inside the limit or just over it.`,
          age_unknown: `There is an age limit (${age}): enter your year of birth.`,
          age_missing: "Age limit not stated in our sources: to be checked.",
          age_none: "No age limit.",
          interest_match: "Matches what attracts you.",
          interest_other: "Far from what attracts you.",
          no_data: "Conditions not yet recorded.",
          pause: this.per.pauseReason(r.prochaine),
        }[r.code];
      },
      pauseTag: "On hold",
      per: {
        title: "How often",
        types: { annuelle: "Every year", irreguliere: "Irregular", inconnue: "Frequency not established" },
        everyN: (n) => `About every ${n} years`,
        sessions: "Known sessions",
        last: "Last session",
        next: "Next probable session",
        toConfirm: "to be confirmed",
        pauseTitle: "Competition on hold",
        pauseText: (y) => `No session is expected before about ${y}. This date is probable and will have to be confirmed by the official order.`,
        alternatives: "Alternative competitions for your profile",
        needProfile: "Enter your profile to see alternative competitions.",
        none: "No alternative found for this profile.",
        conf: { officiel: "official source", secondaire: "relay site, unofficial", deduit: "inferred from history", non_trouve: "not confirmed" },
        pauseReason: (y) => `On hold: next probable session in ${y} (to be confirmed).`,
      },
      accessTitle: "Entry requirements",
      accessNote: (y) => `Conditions ${y ? "of the " + y + " session" : "found"}, to be confirmed in the official order.`,
      diplomas: "Diplomas",
      seriesLabel: "Streams",
      ageLabel: "Age",
      ageText: (a) => (a.age_min != null && a.age_max != null ? `${a.age_min} to ${a.age_max} years` : a.age_max != null ? `${a.age_max} years at most` : `${a.age_min} years at least`),
      others: "Other conditions",
      nationality: "Nationality",
      cameroonian: "Cameroonian",
      outcomes: "Career prospects",
      periodTitle: "Usual period (probable)",
      launch: "Call published",
      deadline: "File deadline",
      exams: "Exams",
      fees: "Fees",
      dossier: "Documents for the file",
      variants: "Other corps or cycles",
      register: "Official registration",
      sources: "Sources",
      lastVerified: (d) => `Last checked: ${d}`,
      unverified: "To be checked: this information has not yet been confirmed by an official text.",
      scamTitle: "Avoiding scams",
      scam: [
        "No competition is won by paying: nobody can guarantee you a place.",
        "Official fees and registrations are checked only on the official websites of the ministry or school.",
        "Beware of anyone who asks for money to “place” or “speed up” a file.",
        "Weldon is not affiliated with any institution. Information may change: always check the official order of the session.",
      ],
    },
  };
  // Fin d'épreuve, signalement d'erreur, nature du corrigé, espace concepteur
  const REV = {
    fr: {
      revealTitle: "Votre copie est terminée",
      revealText: "Voulez-vous voir le corrigé ? Gardez votre copie à côté : vous allez vous noter vous-même, critère par critère.",
      revealYes: "Voir le corrigé et me noter",
      revealLater: "Plus tard (quitter la salle)",
      backExam: "Pour sortir de la salle d'examen, utilisez le bouton « Quitter ». Votre chronomètre continue.",
      report: "Signaler une erreur",
      reportTitle: "Signaler une erreur",
      reportWhere: "Où est l'erreur ?",
      kinds: { sujet: "Dans le sujet", corrige: "Dans le corrigé", bareme: "Dans le barème", autre: "Autre" },
      reportMsg: "Décrivez l'erreur : la question, la ligne, ce qui est faux.",
      send: "Envoyer",
      reportThanks: "Merci, votre signalement a bien été transmis.",
      proposed: "Corrigé proposé par Weldon",
      official: "Corrigé officiel",
      reportsTitle: "Signalements d'erreurs",
      noReports: "Aucun signalement.",
      closeReport: "Traité",
      papersTitle: "Épreuves en ligne",
      papersSub: "Retirer une épreuve la fait disparaître tout de suite pour tous les élèves.",
      withdraw: "Retirer",
      restore: "Remettre",
      withdrawn: "Retirée",
    },
    en: {
      revealTitle: "Your script is finished",
      revealText: "Would you like to see the model answer? Keep your script beside you: you will mark yourself, criterion by criterion.",
      revealYes: "See the model answer and mark myself",
      revealLater: "Later (leave the room)",
      backExam: "To leave the exam room, use the “Leave” button. Your timer keeps running.",
      report: "Report a mistake",
      reportTitle: "Report a mistake",
      reportWhere: "Where is the mistake?",
      kinds: { sujet: "In the paper", corrige: "In the model answer", bareme: "In the marking guide", autre: "Other" },
      reportMsg: "Describe the mistake: the question, the line, what is wrong.",
      send: "Send",
      reportThanks: "Thank you, your report has been sent.",
      proposed: "Model answer proposed by Weldon",
      official: "Official model answer",
      reportsTitle: "Mistake reports",
      noReports: "No reports.",
      closeReport: "Done",
      papersTitle: "Papers online",
      papersSub: "Withdrawing a paper makes it disappear at once for all students.",
      withdraw: "Withdraw",
      restore: "Restore",
      withdrawn: "Withdrawn",
    },
  };
  // Confidentialité, promesses, droits de la personne
  const LEGAL = {
    fr: {
      privacy: "Confidentialité",
      promises: "Nos promesses",
      export: "Exporter mes données",
      del: "Supprimer mon compte",
      delTitle: "Supprimer mon compte",
      delText: "Votre compte, votre profil et vos signalements seront effacés définitivement. Votre historique de notes, gardé sur cet appareil, sera aussi effacé. Si vous avez payé, pensez à exporter vos données avant : votre abonnement ne pourra pas être retrouvé sur un compte supprimé.",
      delPw: "Votre mot de passe pour confirmer",
      delGo: "Supprimer définitivement",
      deleted: "Votre compte a été supprimé.",
      privacySections: (cfg) => [
        ["Ce que nous collectons", "Votre e-mail, votre nom, la langue de votre section et votre mot de passe (conservé chiffré : personne ne peut le lire). Si vous les donnez : niveau d'études, série, année de naissance, région, centres d'intérêt et concours suivis. L'historique de vos notes reste sur votre appareil."],
        ["Ce que nous ne faisons pas", "Pas de publicité et pas de revente de vos données."],
        ["Paiement", "Le paiement se fait sur la page sécurisée de Chariow. Weldon ne conserve pas votre numéro Mobile Money : il est transmis directement à Chariow."],
        ["Où sont vos données", "L'application est hébergée chez Netlify ; les comptes sont dans une base de données PostgreSQL hébergée chez Neon. Les données ne servent qu'à faire fonctionner Weldon."],
        ["Vos droits", "Depuis « Mon compte », vous pouvez à tout moment exporter toutes vos données ou supprimer votre compte. Chariow conserve de son côté les reçus de vos achats."],
        ["Aucune affiliation", "Weldon n'est affilié à aucune institution ni à aucun ministère. Les informations sur les concours peuvent changer : vérifiez toujours l'arrêté officiel avant de vous inscrire."],
        ...(cfg.whatsapp_contact ? [["Nous contacter", `Une question sur vos données ? Écrivez-nous sur WhatsApp : ${cfg.whatsapp_contact}`]] : []),
      ],
      promiseItems: [
        ["Ce qui est gratuit le reste", "Les fiches des concours, l'orientation, le calendrier et une épreuve offerte restent gratuits."],
        ["Pas de renouvellement automatique", "Vous ne payez que lorsque vous le décidez. Aucun prélèvement ne se fait sans vous."],
        ["Prix garanti 12 mois", "Le prix que vous avez payé est garanti pour toute la durée de votre abonnement, et un abonné existant ne subit pas une hausse pendant 12 mois."],
        ["Vos données vous appartiennent", "Vous pouvez les exporter et supprimer votre compte à tout moment."],
        ["Rien n'est effacé à la fin de l'abonnement", "Votre compte, votre profil et votre progression restent là si vous revenez plus tard."],
        ["Aucune garantie de réussite", "Weldon vous prépare, mais ne remplace pas votre travail et ne promet jamais un résultat."],
      ],
    },
    en: {
      privacy: "Privacy",
      promises: "Our promises",
      export: "Export my data",
      del: "Delete my account",
      delTitle: "Delete my account",
      delText: "Your account, profile and reports will be erased for good. Your marks history, kept on this device, will be erased too. If you have paid, export your data first: your subscription cannot be recovered on a deleted account.",
      delPw: "Your password to confirm",
      delGo: "Delete for good",
      deleted: "Your account has been deleted.",
      privacySections: (cfg) => [
        ["What we collect", "Your e-mail, your name, the language of your section and your password (stored encrypted: nobody can read it). If you give them: level of studies, stream, year of birth, region, interests and followed competitions. Your marks history stays on your device."],
        ["What we do not do", "No advertising and no selling of your data."],
        ["Payment", "Payment is made on Chariow's secure page. Weldon does not keep your Mobile Money number: it is passed straight to Chariow."],
        ["Where your data is", "The app is hosted by Netlify; accounts are kept in a PostgreSQL database hosted by Neon. Data is used only to run Weldon."],
        ["Your rights", "From “My account” you can export all your data or delete your account at any time. Chariow keeps the receipts of your purchases on its side."],
        ["No affiliation", "Weldon is not affiliated with any institution or ministry. Information about competitions may change: always check the official order before registering."],
        ...(cfg.whatsapp_contact ? [["Contact us", `A question about your data? Write to us on WhatsApp: ${cfg.whatsapp_contact}`]] : []),
      ],
      promiseItems: [
        ["What is free stays free", "Competition pages, orientation, the calendar and one free paper remain free."],
        ["No automatic renewal", "You pay only when you decide to. Nothing is ever charged without you."],
        ["Price guaranteed for 12 months", "The price you paid is guaranteed for your whole subscription, and an existing subscriber will not face a rise for 12 months."],
        ["Your data belongs to you", "You can export it and delete your account at any time."],
        ["Nothing is erased when a subscription ends", "Your account, profile and progress are still there if you come back later."],
        ["No guarantee of success", "Weldon prepares you, but does not replace your work and never promises a result."],
      ],
    },
  };
  const legal = () => LEGAL[lang()];

  // Calendrier, suivi, annonces, rappels
  const CAL = {
    fr: {
      cta: "Calendrier des concours",
      ctaSub: "Quand les concours sont habituellement lancés, quand déposer son dossier et passer les épreuves.",
      ctaBtn: "Voir le calendrier",
      title: "Calendrier des concours",
      sub: "Les périodes sont probables, d'après les sessions précédentes. La date officielle est toujours celle de l'arrêté.",
      months: ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"],
      monthNames: ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"],
      legend: { lancement: "Lancement", depot: "Dépôt des dossiers", epreuves: "Épreuves" },
      thisMonth: (m) => `En ce moment : ${m} (périodes probables)`,
      noneThisMonth: "Aucune période connue ce mois-ci.",
      pauseSection: "En pause : pas de session attendue cette année",
      pauseRow: (y) => `Prochaine session probable : ${y} (à confirmer)`,
      announcements: "Annonces",
      noAnn: "Aucune annonce pour le moment. Les annonces officielles vérifiées apparaîtront ici.",
      newTag: "Nouveau",
      kinds: { lancement: "Lancement", date_limite: "Date limite", epreuves: "Épreuves", resultats: "Résultats", info: "Information" },
      inDays: (d) => (d === 0 ? "Aujourd'hui" : d === 1 ? "Demain" : `J-${d}`),
      dateOn: (d) => `le ${d}`,
      follow: "Suivre",
      unfollow: "Ne plus suivre",
      followed: "Suivi",
      myFollows: "Mes concours suivis",
      noFollows: "Suivez un concours avec l'étoile pour voir ses rappels ici.",
      followHelp: (n) => `Sans abonnement, vous pouvez suivre ${n} concours.`,
      phaseNow: { lancement: "lancement habituel", depot: "dépôt des dossiers habituel", epreuves: "épreuves habituelles" },
      noPhase: "Pas de période probable en ce moment.",
      whatsapp: "Recevoir les alertes sur WhatsApp",
      contact: "Écrire à Weldon sur WhatsApp",
      source: "Source",
      bannerNew: (n) => (n > 1 ? `${n} nouvelles annonces` : "Nouvelle annonce"),
      seeAnn: "Voir",
      starLabel: "Suivre ce concours",
      probable: "probable",
      adminAnn: "Annonces",
      adminAnnSub: "Les liens repérés chaque jour par la veille arrivent ici en brouillon. Rien n'est public tant que vous n'avez pas publié.",
      annNew: "Nouvelle annonce",
      fConcours: "Concours",
      fKind: "Type",
      fTitle: "Titre",
      fMessage: "Détail (facultatif)",
      fDate: "Date (facultatif)",
      fLink: "Lien officiel (facultatif)",
      fPublish: "Publier tout de suite",
      save: "Enregistrer",
      publish: "Publier",
      reject: "Rejeter",
      drafts: "Brouillons",
      published: "Publiée",
      noConcours: "(aucun)",
      annSaved: "Annonce enregistrée.",
    },
    en: {
      cta: "Competition calendar",
      ctaSub: "When competitions are usually launched, when to file your application and sit the exams.",
      ctaBtn: "See the calendar",
      title: "Competition calendar",
      sub: "Periods are probable, based on previous sessions. The official date is always the one in the official order.",
      months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      monthNames: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
      legend: { lancement: "Call published", depot: "File deadline", epreuves: "Exams" },
      thisMonth: (m) => `Right now: ${m} (probable periods)`,
      noneThisMonth: "No known period this month.",
      pauseSection: "On hold: no session expected this year",
      pauseRow: (y) => `Next probable session: ${y} (to be confirmed)`,
      announcements: "Announcements",
      noAnn: "No announcement yet. Verified official announcements will appear here.",
      newTag: "New",
      kinds: { lancement: "Call published", date_limite: "Deadline", epreuves: "Exams", resultats: "Results", info: "Information" },
      inDays: (d) => (d === 0 ? "Today" : d === 1 ? "Tomorrow" : `D-${d}`),
      dateOn: (d) => `on ${d}`,
      follow: "Follow",
      unfollow: "Unfollow",
      followed: "Following",
      myFollows: "Competitions I follow",
      noFollows: "Follow a competition with the star to see its reminders here.",
      followHelp: (n) => `Without a subscription you can follow ${n} competitions.`,
      phaseNow: { lancement: "usual call period", depot: "usual file deadline period", epreuves: "usual exam period" },
      noPhase: "No probable period right now.",
      whatsapp: "Get alerts on WhatsApp",
      contact: "Write to Weldon on WhatsApp",
      source: "Source",
      bannerNew: (n) => (n > 1 ? `${n} new announcements` : "New announcement"),
      seeAnn: "See",
      starLabel: "Follow this competition",
      probable: "probable",
      adminAnn: "Announcements",
      adminAnnSub: "Links spotted daily by the watch script arrive here as drafts. Nothing is public until you publish it.",
      annNew: "New announcement",
      fConcours: "Competition",
      fKind: "Type",
      fTitle: "Title",
      fMessage: "Details (optional)",
      fDate: "Date (optional)",
      fLink: "Official link (optional)",
      fPublish: "Publish right away",
      save: "Save",
      publish: "Publish",
      reject: "Reject",
      drafts: "Drafts",
      published: "Published",
      noConcours: "(none)",
      annSaved: "Announcement saved.",
    },
  };
  const cal = () => CAL[lang()];

  // Entraînement : quiz du jour, révisions, séries, concours blanc
  const QZ = {
    fr: {
      title: "S'entraîner",
      sub: "Des questions originales, dans le style des concours. Chaque erreur entre dans votre carnet et revient au bon moment.",
      themes: { histoire: "Histoire", geographie: "Géographie", institutions: "Institutions", civisme: "Éducation civique", sciences: "Culture scientifique", logique: "Logique", maths: "Mathématiques", langue1: "Français", langue2: "Anglais" },
      daily: "Mini-quiz du jour",
      dailySub: "5 questions, 5 minutes. Revenez chaque jour : c'est la régularité qui fait retenir.",
      start: "Commencer",
      resume: "Continuer",
      seeAnswers: "Revoir mes réponses",
      doneToday: (a, b) => `Terminé aujourd'hui : ${a} sur ${b}.`,
      comeBack: "Un nouveau quiz vous attend demain.",
      streak: (d) => (d ? `${d} jour${d > 1 ? "s" : ""} d'affilée` : "Commencez une série aujourd'hui"),
      revision: "Révisions du jour",
      revSub: "Les questions ratées reviennent après 1, 2, 4, 8 puis 16 jours, jusqu'à ce que vous les maîtrisiez.",
      revDue: (d) => (d ? `${d} question${d > 1 ? "s" : ""} à revoir aujourd'hui` : "Rien à revoir aujourd'hui, bravo."),
      carnet: (c) => `${c} dans votre carnet d'erreurs`,
      revStart: "Réviser maintenant",
      series: "Séries par thème",
      seriesSub: "10, 20 ou 40 questions, avec la correction après chaque réponse.",
      allThemes: "Tous les thèmes",
      launch: "Lancer la série",
      blanc: "Concours blanc",
      blancSub: "40 questions de tous les thèmes en 40 minutes. La correction vient à la fin, comme à l'examen.",
      blancStart: "Passer le concours blanc",
      locked: "Réservé aux abonnés",
      prep: "Ma préparation",
      prepSub: "Vos résultats par thème : les plus faibles d'abord.",
      noStats: "Répondez à quelques questions pour voir vos résultats.",
      notTried: "pas encore essayé",
      last30: "30 derniers jours",
      qOf: (i, n) => `Question ${i} sur ${n}`,
      next: "Question suivante",
      prev: "Précédente",
      seeResult: "Voir mon résultat",
      correct: "Bonne réponse !",
      wrong: "Ce n'est pas ça.",
      goodAnswer: "La bonne réponse",
      yourAnswer: "Votre réponse",
      unanswered: "Pas de réponse",
      leave: "Quitter",
      leaveSure: "Quitter maintenant ? Vos réponses déjà corrigées sont gardées.",
      leaveSureBlanc: "Quitter le concours blanc ? Vos réponses ne seront pas corrigées.",
      leaveYes: "Quitter",
      stay: "Rester",
      submitYes: "Terminer",
      keep: "Continuer",
      timeLeft: "Temps restant",
      submit: "Terminer et corriger",
      submitSure: (m) => `Il reste ${m} question(s) sans réponse. Terminer quand même ?`,
      score: "Votre score",
      verdict: (p) => (p >= 80 ? "Excellent travail." : p >= 60 ? "Bon résultat, continuez." : p >= 40 ? "Des bases à consolider : vos erreurs reviendront en révision." : "Ne vous découragez pas : relisez les explications, vos erreurs reviendront en révision."),
      review: "À retenir : vos erreurs",
      perfect: "Aucune erreur !",
      back: "Retour à l'entraînement",
      report: "Signaler une erreur",
      timeUp: "Temps écoulé : correction en cours.",
      limit: "Réservé aux abonnés",
    },
    en: {
      title: "Practice",
      sub: "Original questions in the style of the competitions. Every mistake goes into your notebook and comes back at the right time.",
      themes: { histoire: "History", geographie: "Geography", institutions: "Institutions", civisme: "Civics", sciences: "Science and general culture", logique: "Logic", maths: "Mathematics", langue1: "English language", langue2: "French" },
      daily: "Daily mini-quiz",
      dailySub: "5 questions, 5 minutes. Come back every day: regularity is what makes things stick.",
      start: "Start",
      resume: "Continue",
      seeAnswers: "Review my answers",
      doneToday: (a, b) => `Done today: ${a} out of ${b}.`,
      comeBack: "A new quiz is waiting for you tomorrow.",
      streak: (d) => (d ? `${d} day${d > 1 ? "s" : ""} in a row` : "Start a streak today"),
      revision: "Today's revision",
      revSub: "Questions you missed come back after 1, 2, 4, 8 then 16 days, until you master them.",
      revDue: (d) => (d ? `${d} question${d > 1 ? "s" : ""} to review today` : "Nothing to review today, well done."),
      carnet: (c) => `${c} in your mistakes notebook`,
      revStart: "Review now",
      series: "Series by theme",
      seriesSub: "10, 20 or 40 questions, with the correction after each answer.",
      allThemes: "All themes",
      launch: "Start the series",
      blanc: "Mock competition",
      blancSub: "40 questions from every theme in 40 minutes. The correction comes at the end, as in the real exam.",
      blancStart: "Take the mock competition",
      locked: "Subscribers only",
      prep: "My preparation",
      prepSub: "Your results by theme: weakest first.",
      noStats: "Answer a few questions to see your results.",
      notTried: "not tried yet",
      last30: "Last 30 days",
      qOf: (i, n) => `Question ${i} of ${n}`,
      next: "Next question",
      prev: "Previous",
      seeResult: "See my result",
      correct: "Correct!",
      wrong: "Not quite.",
      goodAnswer: "The right answer",
      yourAnswer: "Your answer",
      unanswered: "No answer",
      leave: "Leave",
      leaveSure: "Leave now? Answers already marked are kept.",
      leaveSureBlanc: "Leave the mock competition? Your answers will not be marked.",
      leaveYes: "Leave",
      stay: "Stay",
      submitYes: "Finish",
      keep: "Keep going",
      timeLeft: "Time left",
      submit: "Finish and mark",
      submitSure: (m) => `${m} question(s) left unanswered. Finish anyway?`,
      score: "Your score",
      verdict: (p) => (p >= 80 ? "Excellent work." : p >= 60 ? "A good result, keep going." : p >= 40 ? "Some basics to consolidate: your mistakes will come back in revision." : "Don't be discouraged: reread the explanations, your mistakes will come back in revision."),
      review: "To remember: your mistakes",
      perfect: "No mistakes!",
      back: "Back to practice",
      report: "Report a mistake",
      timeUp: "Time is up: marking in progress.",
      limit: "Subscribers only",
    },
  };
  const qz = () => QZ[lang()];

  // Mon plan : plan à rebours, séances du jour, rappel quotidien
  const PL = {
    fr: {
      cta: "Mon plan à rebours",
      ctaSub: "Indiquez la date de votre concours : Weldon construit votre programme semaine par semaine, avec vos thèmes faibles en priorité.",
      create: "Créer mon plan",
      open: "Ouvrir mon plan",
      title: "Mon plan",
      daysLeft: (d) => (d === 1 ? "Demain : jour J" : `J-${d}`),
      formConcours: "Concours visé",
      formDate: "Date du concours",
      formDateHelp: "Si la date officielle n'est pas encore connue, prenez la date probable : vous pourrez la changer.",
      formHours: "Heures de travail par semaine",
      hoursLabel: (h) => `${h} h`,
      modes: { normal: "Plan complet", court: "Plan court", urgence30: "Plan d'urgence (moins de 30 jours)", urgence14: "Plan d'urgence (moins de 14 jours)" },
      phases: { bases: "Bases", entrainement: "Entraînement", simulation: "Simulation", final: "Dernière ligne droite" },
      today: "Aujourd'hui",
      restDay: "Rien de prévu au plan aujourd'hui : jour de repos, ou avancez sur votre carnet d'erreurs.",
      dailyTask: "Mini-quiz du jour (5 min)",
      dailyDone: "Mini-quiz du jour : fait",
      revTask: (d) => `Révisions du carnet : ${d} question${d > 1 ? "s" : ""}`,
      kinds: {
        revision: "Révisions du carnet (25 min)",
        quiz_theme: (th) => `Série : ${th} (25 min)`,
        epreuve: (m) => `Épreuve en salle d'examen : ${m}`,
        blanc: "Concours blanc (40 min)",
        redaction: "Rédaction chronométrée (1 h)",
      },
      go: "Commencer",
      week: (n) => `Semaine ${n}`,
      focus: "À travailler",
      locked: "Plan complet réservé aux abonnés",
      lockedSub: "Sans abonnement, vous voyez la première semaine. L'abonnement ouvre toutes les semaines, les séries par thème et les concours blancs.",
      edit: "Modifier mon plan",
      remove: "Supprimer mon plan",
      removeSure: "Supprimer votre plan ?",
      removeYes: "Supprimer",
      removeKeep: "Garder",
      expired: "La date de votre concours est passée. Créez un nouveau plan pour la prochaine session.",
      saved: "Plan enregistré.",
      back: "Retour",
      reminder: "Rappel quotidien",
      reminderHelp: "Une notification chaque jour à l'heure choisie, pour ne pas laisser passer la journée.",
      reminderWeb: "Les rappels fonctionnent dans l'application Android de Weldon.",
      reminderOn: "Activer",
      reminderOff: "Désactiver",
      reminderSet: (t) => `Rappel tous les jours à ${t}.`,
      reminderDenied: "Notifications refusées : autorisez-les dans les réglages du téléphone.",
      reminderBody: "5 minutes de quiz aujourd'hui ? Votre série et votre plan vous attendent.",
      weekdays: ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"],
    },
    en: {
      cta: "My countdown plan",
      ctaSub: "Enter the date of your competition: Weldon builds your programme week by week, with your weak themes first.",
      create: "Create my plan",
      open: "Open my plan",
      title: "My plan",
      daysLeft: (d) => (d === 1 ? "Tomorrow: exam day" : `D-${d}`),
      formConcours: "Target competition",
      formDate: "Competition date",
      formDateHelp: "If the official date is not known yet, use the probable date: you can change it later.",
      formHours: "Study hours per week",
      hoursLabel: (h) => `${h} h`,
      modes: { normal: "Full plan", court: "Short plan", urgence30: "Emergency plan (under 30 days)", urgence14: "Emergency plan (under 14 days)" },
      phases: { bases: "Foundations", entrainement: "Training", simulation: "Simulation", final: "Final stretch" },
      today: "Today",
      restDay: "Nothing planned today: a rest day, or work on your mistakes notebook.",
      dailyTask: "Daily mini-quiz (5 min)",
      dailyDone: "Daily mini-quiz: done",
      revTask: (d) => `Notebook revision: ${d} question${d > 1 ? "s" : ""}`,
      kinds: {
        revision: "Notebook revision (25 min)",
        quiz_theme: (th) => `Series: ${th} (25 min)`,
        epreuve: (m) => `Paper in the exam room: ${m}`,
        blanc: "Mock competition (40 min)",
        redaction: "Timed essay (1 h)",
      },
      go: "Start",
      week: (n) => `Week ${n}`,
      focus: "To work on",
      locked: "Full plan for subscribers",
      lockedSub: "Without a subscription you see the first week. A subscription opens every week, the series by theme and the mock competitions.",
      edit: "Edit my plan",
      remove: "Delete my plan",
      removeSure: "Delete your plan?",
      removeYes: "Delete",
      removeKeep: "Keep it",
      expired: "The date of your competition has passed. Create a new plan for the next session.",
      saved: "Plan saved.",
      back: "Back",
      reminder: "Daily reminder",
      reminderHelp: "A notification every day at the time you choose, so the day does not slip by.",
      reminderWeb: "Reminders work in the Weldon Android app.",
      reminderOn: "Turn on",
      reminderOff: "Turn off",
      reminderSet: (t) => `Reminder every day at ${t}.`,
      reminderDenied: "Notifications refused: allow them in the phone settings.",
      reminderBody: "5 minutes of quiz today? Your streak and your plan are waiting.",
      weekdays: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    },
  };
  const pl = () => PL[lang()];

  // Éditeur de fiches (espace concepteur)
  const FI = {
    fr: {
      title: "Fiches des concours : conditions d'accès",
      sub: "Corrigez les conditions après lecture de l'arrêté officiel. Cochez « vérifié » seulement si vous l'avez lu : le concours n'est alors plus classé « à vérifier ». Les textes sont ceux de la section affichée ; changez de section pour l'autre langue.",
      pick: "Concours",
      levelMin: "Niveau minimum",
      levelMax: "Niveau maximum (si l'arrêté en fixe un)",
      none: "— non précisé —",
      series: "Séries admises (séparées par des virgules)",
      seriesHelp: "Laisser vide si aucune série n'est imposée ou si elle n'est pas précisée.",
      ageMin: "Âge minimum",
      ageMax: "Âge maximum",
      noLimit: "L'arrêté dit qu'il n'y a aucune limite d'âge",
      confidence: "Source des conditions",
      conf: { secondaire: "Site relais, non officiel", site_officiel: "Site officiel", arrete: "Arrêté lu" },
      year: "Année de l'arrêté",
      diplomas: "Diplômes exigés (texte affiché)",
      seriesNote: "Séries : précision affichée",
      ageNote: "Âge : précision affichée (date de référence, dérogations…)",
      fees: "Frais en FCFA",
      launch: "Lancement (ex. juin–juillet)",
      deadline: "Dépôt des dossiers (ex. juillet–août)",
      exams: "Épreuves (ex. septembre)",
      link: "Lien d'inscription officiel",
      perType: "Périodicité",
      perTypes: { inconnue: "Non établie", annuelle: "Chaque année", pluriannuelle: "Tous les N ans", irreguliere: "Irrégulière" },
      perInterval: "Intervalle en années (si tous les N ans)",
      perSessions: "Années des sessions connues (séparées par des virgules)",
      perLast: "Dernière session",
      perNext: "Prochaine session probable",
      perNote: "Précision affichée sur la périodicité",
      verified: "J'ai vérifié ces conditions dans l'arrêté officiel",
      save: "Enregistrer la fiche",
      saved: "Fiche enregistrée.",
    },
    en: {
      title: "Competition pages: entry requirements",
      sub: "Correct the requirements after reading the official order. Tick “verified” only if you have read it: the competition is then no longer ranked “to be checked”. Texts are those of the section shown; switch section for the other language.",
      pick: "Competition",
      levelMin: "Minimum level",
      levelMax: "Maximum level (if the order sets one)",
      none: "— not stated —",
      series: "Accepted streams (comma separated)",
      seriesHelp: "Leave empty if no stream is required or if it is not stated.",
      ageMin: "Minimum age",
      ageMax: "Maximum age",
      noLimit: "The order says there is no age limit",
      confidence: "Source of the requirements",
      conf: { secondaire: "Relay site, unofficial", site_officiel: "Official website", arrete: "Order read" },
      year: "Year of the order",
      diplomas: "Diplomas required (text shown)",
      seriesNote: "Streams: note shown",
      ageNote: "Age: note shown (reference date, waivers…)",
      fees: "Fees in FCFA",
      launch: "Call published (e.g. June–July)",
      deadline: "File deadline (e.g. July–August)",
      exams: "Exams (e.g. September)",
      link: "Official registration link",
      perType: "How often",
      perTypes: { inconnue: "Not established", annuelle: "Every year", pluriannuelle: "Every N years", irreguliere: "Irregular" },
      perInterval: "Interval in years (if every N years)",
      perSessions: "Years of known sessions (comma separated)",
      perLast: "Last session",
      perNext: "Next probable session",
      perNote: "Note shown about the frequency",
      verified: "I have checked these requirements in the official order",
      save: "Save the page",
      saved: "Page saved.",
    },
  };
  const fi = () => FI[lang()];

  // ---------- Bourses d'études ----------
  const BTABS = ["bhome", "bfind", "bguide", "bcal", "bfollow"];
  const BR = {
    fr: {
      space: { concours: "Concours", bourses: "Bourses" },
      tabs: { bhome: "Accueil", bfind: "Explorer", bguide: "Conseils", bcal: "Échéances", bfollow: "Suivi" },
      tabsLong: { bhome: "Accueil des bourses", bfind: "Explorer les bourses", bguide: "Conseils et modèles", bcal: "Calendrier des échéances", bfollow: "Mes bourses suivies" },
      title: "Bourses d'études",
      sub: "Trouvez une bourse selon votre filière et votre niveau, et ne ratez plus une échéance.",
      status: { cloture_proche: "Clôture proche", ouverte: "Ouverte", a_venir: "Bientôt ouverte", attendue: "Relance attendue", expiree: "Expirée", inconnue: "Dates non annoncées" },
      line: {
        cloture_proche: (d, date) => (d === 0 ? `Clôture aujourd'hui · ${date}` : `Clôture dans ${d} jour${d > 1 ? "s" : ""} · ${date}`),
        ouverte: (d, date) => (d == null ? `Ouverte depuis le ${date}. Date de clôture à vérifier sur le site officiel.` : `Clôture le ${date} (dans ${d} jours)`),
        permanente: "Candidatures ouvertes en continu (souvent attribuée à l'admission).",
        a_venir: (d, date) => `Ouvre le ${date} (dans ${d} jours)`,
        attendue: (mois) => `Ouverture habituelle : ${mois}. Pas encore annoncée.`,
        habituelle: (mois) => `Clôture habituelle : ${mois}. Édition en cours non annoncée.`,
        expiree: (date, relance, habituelle) => `Expirée le ${date}.${relance ? ` Relance probable : ${relance} (à confirmer).` : habituelle ? ` Clôture habituelle : ${habituelle} (prochaine édition à confirmer).` : ""}`,
        inconnue: "Les dates ne sont pas annoncées.",
      },
      toConfirm: "dates à confirmer",
      verifyTag: "À vérifier",
      branches: { sciences: "Sciences", lettres: "Littérature" },
      branchSub: { sciences: "Maths, informatique, physique, santé, ingénierie, agronomie…", lettres: "Droit, histoire, géographie, lettres, langues, économie, éducation…" },
      allBranches: "Toutes les filières",
      chooseBranch: "Quelle est votre filière ?",
      chooseBranchSub: "Choisissez Sciences ou Littérature : les bourses sont ensuite classées pour vous.",
      changeBranch: "Changer de branche",
      domains: { maths: "Mathématiques", informatique: "Informatique", "physique-chimie": "Physique et chimie", sante: "Santé", ingenierie: "Ingénierie", "agronomie-environnement": "Agronomie et environnement", "droit-politique": "Droit et sciences politiques", "histoire-geographie": "Histoire et géographie", "lettres-langues": "Lettres et langues", "philo-sociologie": "Philosophie et sociologie", communication: "Communication et journalisme", education: "Éducation", "economie-gestion": "Économie et gestion", tous: "Toutes filières" },
      allDomains: "Toutes les filières",
      levels: { licence: "Licence", master: "Master", doctorat: "Doctorat", postdoc: "Post-doctorat", autre: "Autre" },
      allLevels: "Tous niveaux",
      coverage: { complete: "Bourse complète", partielle: "Bourse partielle", variable: "Montant variable" },
      cameroon: { oui: "Ouverte aux Camerounais", non_precise: "Éligibilité du Cameroun à confirmer" },
      une: "À la une",
      uneSub: "Les programmes les plus recherchés par les étudiants africains.",
      byType: "Par type de bourse",
      byTypeSub: "Choisissez le type de financement qui vous convient.",
      types: { complete: "Entièrement financées", gouvernementale: "Gouvernementales", universitaire: "Universitaires", fondation: "Fondations et organisations" },
      typeSub: { complete: "Scolarité, vie courante, souvent le billet d'avion", gouvernementale: "Chevening, DAAD, Fulbright, Eiffel…", universitaire: "Offertes par les universités à l'admission", fondation: "Mastercard, Aga Khan, Rotary…" },
      origins: { gouvernementale: "Gouvernementale", universitaire: "Universitaire", fondation: "Fondation / organisation" },
      typeLabel: "Type de bourse",
      allTypes: "Tous types",
      byCountry: "Par pays d'accueil",
      countryLabel: "Pays d'accueil",
      allCountries: "Tous pays",
      stat: (n, c) => `${n} bourses répertoriées dans ${c} pays`,
      more: (n) => `Voir ${n} bourses de plus`,
      usualClosing: "Clôture habituelle",
      serieTitle: "Votre série du bac",
      serieSub: "Elle sert à vous montrer en premier les bourses de votre filière et de votre niveau. Gratuit.",
      serieSet: (n) => `Série ${n}`,
      serieChange: "Changer",
      levelTitle: "Votre niveau actuel",
      searchPh: "Chercher une bourse, un pays, une université…",
      searchGo: "Chercher",
      forYouSerie: "Pour votre série et votre niveau",
      forYouSerieSub: "Les bourses qui correspondent à votre série (et à votre niveau si vous l'avez choisi).",
      searchFor: (q) => `Recherche : « ${q} »`,
      clearSearch: "Effacer la recherche",
      valueLabel: "Valeur",
      eligLabel: "Qui peut candidater",
      costLabel: "Coût de candidature",
      notCovered: "Non couvert",
      permanent: "Candidatures ouvertes en continu",
      lock: {
        title: "Lien officiel, dossier et conseils : réservés aux abonnés",
        sub: "Vous voyez déjà de quoi choisir : valeur, niveau, filières, conditions et dates. L'abonnement ouvre le lien officiel, la liste des documents à préparer, les conseils et le suivi sans limite.",
        cta: "Débloquer avec l'abonnement",
        pill: "Abonnés",
        linkLocked: "Lien officiel verrouillé",
        free: "Aperçu gratuit",
        block: "Section réservée aux abonnés",
        honest: "Vous payez l'accès à une information classée, vérifiée et tenue à jour. Jamais une place : personne ne peut vous garantir une bourse.",
      },
      alert: "Alerte",
      unlockBanner: "Voir les liens officiels et les dossiers",
      unlockBannerSub: "Toutes les bourses sont visibles gratuitement. Les liens et les dossiers sont réservés aux abonnés.",
      guideTitle: "Conseils et modèles",
      guideSub: "Comprendre les bourses, préparer un dossier solide et éviter les erreurs.",
      guideEmpty: "Les conseils arrivent bientôt.",
      guideCats: { comprendre: "Comprendre", dossier: "Le dossier", langues: "Langues", visa: "Visa", apres: "Après la sélection", filieres: "Par filière" },
      guideFree: "Gratuit",
      guideLocked: "Abonnés",
      guideLockedBody: "Cet article est réservé aux abonnés.",
      guideBack: "Retour aux conseils",
      adminVedette: "Mettre à la une",
      adminPreview: "Aperçu gratuit (fiche ouverte à tous)",
      results: (n) => `${n} bourse${n > 1 ? "s" : ""}`,
      noResults: "Aucune bourse pour ce choix. Essayez « Tous niveaux » ou une autre filière.",
      expired: "Expirées : relance à surveiller",
      closingSoon: "Clôtures à venir",
      opened: "Ouvertes en ce moment",
      soon: "Bientôt ouvertes",
      forYou: "Pour vous",
      forYouSub: "D'après la filière et le niveau que vous avez choisis.",
      findCta: "Trouver une bourse pour moi",
      tickerTitle: "Alertes bourses",
      tick: {
        cloture_proche: (n, d) => (d === 0 ? `⏰ ${n} : clôture aujourd'hui` : `⏰ ${n} : clôture dans ${d} jour${d > 1 ? "s" : ""}`),
        ouverte: (n, date) => `🟢 ${n} : ouverte jusqu'au ${date}`,
        a_venir: (n, d) => `🔜 ${n} : ouvre dans ${d} jours`,
        expiree: (n, relance) => `🔁 ${n} : expirée${relance ? `, relance attendue en ${relance}` : ""}`,
      },
      empty: "Aucune bourse n'est encore publiée dans cette section.",
      follow: "Suivre",
      unfollow: "Ne plus suivre",
      followed: "Suivie",
      followHelp: (n) => `Sans abonnement, vous pouvez suivre ${n} bourses.`,
      followEmpty: "Suivez une bourse avec l'étoile pour voir ici ses échéances.",
      followTitle: "Mes bourses suivies",
      mine: "Ma filière",
      mineSub: "Elle sert à vous proposer les bonnes bourses dès l'accueil.",
      saved: "Enregistré.",
      back: "Retour aux bourses",
      official: "Voir le site officiel",
      share: "Partager sur WhatsApp",
      shareText: (n, url) => `Bourse : ${n}. Plus d'infos sur Weldon : ${url}`,
      sections: { resume: "En bref", coverage: "Ce que couvre la bourse", conditions: "Conditions", dossier: "Documents à préparer", advice: "Conseil", dates: "Dates", sources: "Sources" },
      cond: { age: "Âge maximum", diploma: "Diplôme", language: "Langue", other: "Autres conditions", countries: "Pays d'accueil", levels: "Niveaux", domains: "Filières" },
      years: (n) => `${n} ans`,
      edition: "Édition",
      opening: "Ouverture",
      closing: "Clôture",
      notAnnounced: "non annoncée",
      lastChecked: (d) => `Dernière vérification : ${d}`,
      unverified: "Informations à vérifier : confirmez toujours les dates et les conditions sur le site officiel.",
      scamTitle: "Éviter les arnaques",
      scam: ["Aucune bourse sérieuse ne demande de payer pour candidater ou pour « réserver » une place. Méfiez-vous de quiconque promet une bourse « garantie » contre de l'argent.", "Candidatez uniquement depuis le site officiel de l'organisme, jamais depuis un lien reçu par message.", "Weldon n'est affilié à aucun organisme de bourses : vérifiez toujours les dates sur le site officiel."],
      calTitle: "Calendrier des échéances",
      calSub: "Les barres montrent la période d'ouverture. Elles sont probables tant que les dates de l'édition ne sont pas confirmées.",
      calOpen: "Ouverture",
      calProbable: "Période probable",
      thisMonth: "Cette période",
      adminTitle: "Bourses : dates de l'édition en cours",
      adminSub: "Relevez les dates sur la page officielle. « Confirmé » veut dire que vous les avez lues sur le site officiel.",
      pick: "Bourse",
      editionLabel: "Édition (ex. 2027/28)",
      confirmed: "Dates confirmées sur le site officiel",
      verified: "J'ai vérifié cette bourse sur le site officiel",
      linkLabel: "Lien officiel",
      save: "Enregistrer la bourse",
    },
    en: {
      space: { concours: "Competitions", bourses: "Scholarships" },
      tabs: { bhome: "Home", bfind: "Explore", bguide: "Advice", bcal: "Deadlines", bfollow: "Following" },
      tabsLong: { bhome: "Scholarships home", bfind: "Explore scholarships", bguide: "Advice and templates", bcal: "Deadline calendar", bfollow: "Scholarships I follow" },
      title: "Scholarships",
      sub: "Find a scholarship for your field and level, and never miss a deadline again.",
      status: { cloture_proche: "Closing soon", ouverte: "Open", a_venir: "Opening soon", attendue: "Reopening expected", expiree: "Expired", inconnue: "Dates not announced" },
      line: {
        cloture_proche: (d, date) => (d === 0 ? `Closes today · ${date}` : `Closes in ${d} day${d > 1 ? "s" : ""} · ${date}`),
        ouverte: (d, date) => (d == null ? `Open since ${date}. Check the closing date on the official website.` : `Closes on ${date} (in ${d} days)`),
        permanente: "Applications open all year (often awarded at admission).",
        a_venir: (d, date) => `Opens on ${date} (in ${d} days)`,
        attendue: (mois) => `Usually opens: ${mois}. Not announced yet.`,
        habituelle: (mois) => `Usual closing: ${mois}. Current edition not announced.`,
        expiree: (date, relance, habituelle) => `Expired on ${date}.${relance ? ` Probable reopening: ${relance} (to be confirmed).` : habituelle ? ` Usual closing: ${habituelle} (next edition to be confirmed).` : ""}`,
        inconnue: "Dates are not announced.",
      },
      toConfirm: "dates to be confirmed",
      verifyTag: "To be checked",
      branches: { sciences: "Science", lettres: "Arts" },
      branchSub: { sciences: "Maths, computing, physics, health, engineering, agriculture…", lettres: "Law, history, geography, languages, economics, education…" },
      allBranches: "All fields",
      chooseBranch: "What is your field?",
      chooseBranchSub: "Choose Science or Arts: scholarships are then ranked for you.",
      changeBranch: "Change field",
      domains: { maths: "Mathematics", informatique: "Computer science", "physique-chimie": "Physics and chemistry", sante: "Health", ingenierie: "Engineering", "agronomie-environnement": "Agriculture and environment", "droit-politique": "Law and political science", "histoire-geographie": "History and geography", "lettres-langues": "Literature and languages", "philo-sociologie": "Philosophy and sociology", communication: "Communication and journalism", education: "Education", "economie-gestion": "Economics and management", tous: "All fields" },
      allDomains: "All subjects",
      levels: { licence: "Bachelor's", master: "Master's", doctorat: "PhD", postdoc: "Postdoctoral", autre: "Other" },
      allLevels: "All levels",
      coverage: { complete: "Full scholarship", partielle: "Partial scholarship", variable: "Amount varies" },
      cameroon: { oui: "Open to Cameroonians", non_precise: "Cameroon eligibility to be confirmed" },
      une: "Featured",
      uneSub: "The programmes most sought after by African students.",
      byType: "By type of scholarship",
      byTypeSub: "Pick the kind of funding that suits you.",
      types: { complete: "Fully funded", gouvernementale: "Government", universitaire: "University", fondation: "Foundations and organisations" },
      typeSub: { complete: "Tuition, living costs, often the flight", gouvernementale: "Chevening, DAAD, Fulbright, Eiffel…", universitaire: "Offered by universities at admission", fondation: "Mastercard, Aga Khan, Rotary…" },
      origins: { gouvernementale: "Government", universitaire: "University", fondation: "Foundation / organisation" },
      typeLabel: "Type of scholarship",
      allTypes: "All types",
      byCountry: "By host country",
      countryLabel: "Host country",
      allCountries: "All countries",
      stat: (n, c) => `${n} scholarships listed in ${c} countries`,
      more: (n) => `Show ${n} more`,
      usualClosing: "Usual closing",
      serieTitle: "Your A Level stream",
      serieSub: "It is used to show you first the scholarships for your field and level. Free.",
      serieSet: (n) => `Stream ${n}`,
      serieChange: "Change",
      levelTitle: "Your current level",
      searchPh: "Search a scholarship, a country, a university…",
      searchGo: "Search",
      forYouSerie: "For your stream and level",
      forYouSerieSub: "Scholarships that match your stream (and your level if you chose one).",
      searchFor: (q) => `Search: “${q}”`,
      clearSearch: "Clear search",
      valueLabel: "Value",
      eligLabel: "Who can apply",
      costLabel: "Application cost",
      notCovered: "Not covered",
      permanent: "Applications open all year",
      lock: {
        title: "Official link, application file and advice: subscribers only",
        sub: "You can already see enough to choose: value, level, subjects, requirements and dates. A subscription opens the official link, the list of documents to prepare, the advice and unlimited following.",
        cta: "Unlock with a subscription",
        pill: "Subscribers",
        linkLocked: "Official link locked",
        free: "Free preview",
        block: "Section for subscribers",
        honest: "You pay for access to organised, checked and up-to-date information. Never for a place: nobody can guarantee you a scholarship.",
      },
      alert: "Alert",
      unlockBanner: "See official links and application files",
      unlockBannerSub: "Every scholarship is visible for free. Links and application files are for subscribers.",
      guideTitle: "Advice and templates",
      guideSub: "Understand scholarships, build a strong application and avoid mistakes.",
      guideEmpty: "Advice is coming soon.",
      guideCats: { comprendre: "Understand", dossier: "The application", langues: "Languages", visa: "Visa", apres: "After selection", filieres: "By field" },
      guideFree: "Free",
      guideLocked: "Subscribers",
      guideLockedBody: "This article is for subscribers.",
      guideBack: "Back to advice",
      adminVedette: "Feature on home",
      adminPreview: "Free preview (open to everyone)",
      results: (n) => `${n} scholarship${n > 1 ? "s" : ""}`,
      noResults: "No scholarship for this choice. Try “All levels” or another subject.",
      expired: "Expired: watch for the reopening",
      closingSoon: "Upcoming deadlines",
      opened: "Open now",
      soon: "Opening soon",
      forYou: "For you",
      forYouSub: "Based on the field and level you chose.",
      findCta: "Find a scholarship for me",
      tickerTitle: "Scholarship alerts",
      tick: {
        cloture_proche: (n, d) => (d === 0 ? `⏰ ${n}: closes today` : `⏰ ${n}: closes in ${d} day${d > 1 ? "s" : ""}`),
        ouverte: (n, date) => `🟢 ${n}: open until ${date}`,
        a_venir: (n, d) => `🔜 ${n}: opens in ${d} days`,
        expiree: (n, relance) => `🔁 ${n}: expired${relance ? `, reopening expected in ${relance}` : ""}`,
      },
      empty: "No scholarship is published in this section yet.",
      follow: "Follow",
      unfollow: "Unfollow",
      followed: "Following",
      followHelp: (n) => `Without a subscription you can follow ${n} scholarships.`,
      followEmpty: "Follow a scholarship with the star to see its deadlines here.",
      followTitle: "Scholarships I follow",
      mine: "My field",
      mineSub: "It is used to suggest the right scholarships on the home page.",
      saved: "Saved.",
      back: "Back to scholarships",
      official: "See the official website",
      share: "Share on WhatsApp",
      shareText: (n, url) => `Scholarship: ${n}. More on Weldon: ${url}`,
      sections: { resume: "In brief", coverage: "What the scholarship covers", conditions: "Requirements", dossier: "Documents to prepare", advice: "Advice", dates: "Dates", sources: "Sources" },
      cond: { age: "Maximum age", diploma: "Diploma", language: "Language", other: "Other requirements", countries: "Host countries", levels: "Levels", domains: "Fields" },
      years: (n) => `${n} years`,
      edition: "Edition",
      opening: "Opens",
      closing: "Closes",
      notAnnounced: "not announced",
      lastChecked: (d) => `Last checked: ${d}`,
      unverified: "To be checked: always confirm dates and requirements on the official website.",
      scamTitle: "Avoiding scams",
      scam: ["No serious scholarship asks you to pay to apply or to “reserve” a place. Beware of anyone promising a “guaranteed” scholarship for money.", "Apply only from the organisation's official website, never from a link received in a message.", "Weldon is not affiliated with any scholarship provider: always check the dates on the official website."],
      calTitle: "Deadline calendar",
      calSub: "Bars show the opening period. They are probable until the edition's dates are confirmed.",
      calOpen: "Open",
      calProbable: "Probable period",
      thisMonth: "This period",
      adminTitle: "Scholarships: dates of the current edition",
      adminSub: "Copy the dates from the official page. “Confirmed” means you read them on the official website.",
      pick: "Scholarship",
      editionLabel: "Edition (e.g. 2027/28)",
      confirmed: "Dates confirmed on the official website",
      verified: "I have checked this scholarship on the official website",
      linkLabel: "Official link",
      save: "Save the scholarship",
    },
  };
  const br = () => BR[lang()];
  const bourseOn = () => Boolean(state.config?.bourses_public || state.user?.admin);
  const isBFollowed = (id) => (state.user?.bourses_suivies || []).includes(id);
  const bFmt = (iso) => dateFmt(iso + "T12:00:00Z");
  const bMonth = (m) => cal().monthNames[m - 1];
  const bRelance = (r) => (r ? `${bMonth(r.mois)} ${r.annee}` : "");

  function ficheFields(id) {
    const F = fi();
    const O = ori();
    const c = concoursById(id);
    const a = c?.acces || {};
    const k = c?.calendrier || {};
    const per = c?.periodicite || {};
    const lv = ["cep", ...LEVELS.filter((x) => x !== "terminale")];
    const levelOpts = (cur) => `<option value="">${F.none}</option>${lv.map((x) => `<option value="${x}" ${x === cur ? "selected" : ""}>${esc(O.levels[x])}</option>`).join("")}`;
    const num = (v) => (v == null ? "" : esc(v));
    return `
      <div class="field"><label for="ff-min">${F.levelMin}</label><select id="ff-min" name="niveaux_min">${levelOpts(a.niveaux_min)}</select></div>
      <div class="field"><label for="ff-max">${F.levelMax}</label><select id="ff-max" name="niveaux_max">${levelOpts(a.niveaux_max)}</select></div>
      <div class="field full"><label for="ff-series">${F.series}</label><input id="ff-series" name="series" value="${esc((a.series || []).join(", "))}"><span class="small muted">${F.seriesHelp}</span></div>
      <div class="field"><label for="ff-amin">${F.ageMin}</label><input id="ff-amin" name="age_min" type="number" min="5" max="70" value="${num(a.age_min)}"></div>
      <div class="field"><label for="ff-amax">${F.ageMax}</label><input id="ff-amax" name="age_max" type="number" min="5" max="70" value="${num(a.age_max)}"></div>
      <label class="full"><input type="checkbox" name="age_aucune" ${a.age_aucune ? "checked" : ""}> ${F.noLimit}</label>
      <div class="field"><label for="ff-conf">${F.confidence}</label><select id="ff-conf" name="confiance">${["secondaire", "site_officiel", "arrete"].map((x) => `<option value="${x}" ${(a.confiance || "secondaire") === x ? "selected" : ""}>${F.conf[x]}</option>`).join("")}</select></div>
      <div class="field"><label for="ff-year">${F.year}</label><input id="ff-year" name="annee_conditions" type="number" min="2000" max="2100" value="${num(a.annee_conditions)}"></div>
      <div class="field full"><label for="ff-dip">${F.diplomas}</label><textarea id="ff-dip" name="diplomes" rows="2" maxlength="400">${esc(a.diplomes || "")}</textarea></div>
      <div class="field full"><label for="ff-sn">${F.seriesNote}</label><textarea id="ff-sn" name="series_note" rows="2" maxlength="400">${esc(a.series_note || "")}</textarea></div>
      <div class="field full"><label for="ff-an">${F.ageNote}</label><textarea id="ff-an" name="age_note" rows="2" maxlength="400">${esc(a.age_note || "")}</textarea></div>
      <div class="field"><label for="ff-fees">${F.fees}</label><input id="ff-fees" name="frais_fcfa" type="number" min="0" value="${num(k.frais_fcfa)}"></div>
      <div class="field"><label for="ff-link">${F.link}</label><input id="ff-link" name="lien_inscription" type="url" placeholder="https://" value="${esc(c?.lien_inscription || "")}"></div>
      <div class="field"><label for="ff-l">${F.launch}</label><input id="ff-l" name="mois_lancement" value="${esc(k.mois_lancement || "")}"></div>
      <div class="field"><label for="ff-d">${F.deadline}</label><input id="ff-d" name="mois_limite_depot" value="${esc(k.mois_limite_depot || "")}"></div>
      <div class="field"><label for="ff-e">${F.exams}</label><input id="ff-e" name="mois_epreuves" value="${esc(k.mois_epreuves || "")}"></div>
      <div class="field"><label for="ff-ptype">${F.perType}</label><select id="ff-ptype" name="p_type">${["inconnue", "annuelle", "pluriannuelle", "irreguliere"].map((x) => `<option value="${x}" ${(per.type || "inconnue") === x ? "selected" : ""}>${F.perTypes[x]}</option>`).join("")}</select></div>
      <div class="field"><label for="ff-pint">${F.perInterval}</label><input id="ff-pint" name="p_intervalle" type="number" min="2" max="10" value="${num(per.intervalle_ans)}"></div>
      <div class="field full"><label for="ff-psess">${F.perSessions}</label><input id="ff-psess" name="p_sessions" value="${esc((per.sessions || []).join(", "))}"></div>
      <div class="field"><label for="ff-plast">${F.perLast}</label><input id="ff-plast" name="p_derniere" type="number" min="1990" max="2100" value="${num(per.derniere_session)}"></div>
      <div class="field"><label for="ff-pnext">${F.perNext}</label><input id="ff-pnext" name="p_prochaine" type="number" min="1990" max="2100" value="${num(per.prochaine_probable)}"></div>
      <div class="field full"><label for="ff-pnote">${F.perNote}</label><textarea id="ff-pnote" name="p_note" rows="2" maxlength="400">${esc(per.note || "")}</textarea></div>
      <label class="full"><input type="checkbox" name="verified" ${c?.status === "verified" ? "checked" : ""}> <b>${F.verified}</b></label>`;
  }

  function bourseFields(id) {
    const B = br();
    const b = (state.bourses || []).find((x) => x.id === id);
    const e = b?.edition || {};
    return `
      <div class="field"><label for="bf-lib">${B.editionLabel}</label><input id="bf-lib" name="libelle" maxlength="20" value="${esc(e.libelle || "")}"></div>
      <div class="field"><label for="bf-link">${B.linkLabel}</label><input id="bf-link" name="lien_officiel" type="url" placeholder="https://" value="${esc(b?.lien_officiel || "")}"></div>
      <div class="field"><label for="bf-open">${B.opening}</label><input id="bf-open" name="ouverture" type="date" value="${esc(e.ouverture || "")}"></div>
      <div class="field"><label for="bf-close">${B.closing}</label><input id="bf-close" name="cloture" type="date" value="${esc(e.cloture || "")}"></div>
      <label class="full"><input type="checkbox" name="confirme" ${e.confirme ? "checked" : ""}> ${B.confirmed}</label>
      <label class="full"><input type="checkbox" name="vedette" ${b?.vedette ? "checked" : ""}> ${B.adminVedette}</label>
      <label class="full"><input type="checkbox" name="apercu_gratuit" ${b?.apercu_gratuit ? "checked" : ""}> ${B.adminPreview}</label>
      <label class="full"><input type="checkbox" name="verified" ${b?.status === "verified" ? "checked" : ""}> <b>${B.verified}</b></label>`;
  }

  async function submitBourse(form) {
    const err = form.querySelector("#bourse-err");
    const fd = new FormData(form);
    try {
      await api().adminSaveBourse({
        id: fd.get("id"),
        lang: lang(),
        edition: { libelle: fd.get("libelle"), ouverture: fd.get("ouverture"), cloture: fd.get("cloture"), confirme: fd.get("confirme") === "on" },
        lien_officiel: fd.get("lien_officiel"),
        verified: fd.get("verified") === "on",
        vedette: fd.get("vedette") === "on",
        apercu_gratuit: fd.get("apercu_gratuit") === "on",
      });
    } catch (e) {
      err.textContent = e.message;
      err.hidden = false;
      return;
    }
    state.bourseSel = fd.get("id");
    state.bourses = null;
    toast(br().saved);
    openAdmin();
  }

  async function submitFiche(form) {
    const err = form.querySelector("#fiche-err");
    const fd = new FormData(form);
    const g = (k) => fd.get(k) || "";
    try {
      await api().adminSaveFiche({
        id: g("concours"),
        lang: lang(),
        verified: fd.get("verified") === "on",
        acces: {
          niveaux_min: g("niveaux_min"),
          niveaux_max: g("niveaux_max"),
          series: g("series").split(",").map((x) => x.trim()).filter(Boolean),
          age_min: g("age_min"),
          age_max: g("age_max"),
          age_aucune: fd.get("age_aucune") === "on",
          confiance: g("confiance"),
          annee_conditions: g("annee_conditions"),
        },
        calendrier: { mois_lancement: g("mois_lancement"), mois_limite_depot: g("mois_limite_depot"), mois_epreuves: g("mois_epreuves"), frais_fcfa: g("frais_fcfa") },
        lien_inscription: g("lien_inscription"),
        texts: { diplomes: g("diplomes"), series_note: g("series_note"), age_note: g("age_note") },
        periodicite: { type: g("p_type"), intervalle_ans: g("p_intervalle"), sessions: g("p_sessions"), derniere_session: g("p_derniere"), prochaine_probable: g("p_prochaine"), note: g("p_note"), confiance: g("confiance") === "arrete" ? "officiel" : g("confiance") === "site_officiel" ? "officiel" : "secondaire" },
      });
    } catch (e) {
      err.textContent = e.message;
      err.hidden = false;
      return;
    }
    state.ficheSel = g("concours");
    state.catalog = null;
    state.orient = null;
    loadCatalog();
    toast(fi().saved);
    openAdmin();
  }

  // Rappel quotidien : notification locale (application Android), sans serveur.
  const LN = () => window.Capacitor?.Plugins?.LocalNotifications;
  async function scheduleReminder() {
    const r = local.get("reminder", null);
    const plugin = LN();
    if (!plugin) return;
    try {
      await plugin.cancel({ notifications: [{ id: 1001 }] });
      if (!r?.on) return;
      await plugin.schedule({ notifications: [{ id: 1001, title: "Weldon", body: pl().reminderBody, schedule: { on: { hour: r.h, minute: r.m }, allowWhileIdle: true } }] });
    } catch {
      /* le rappel est un plus : on n'interrompt jamais l'application */
    }
  }
  const isFollowed = (id) => (state.user?.suivis || []).includes(id);
  const annText = (a, k) => (lang() === "en" && a[k + "_en"]) || a[k];
  // Jours calendaires restants (J-7 = dans 7 jours à la même heure, peu importe l'heure de la journée).
  const daysUntil = (iso) => Math.round((Date.parse(iso + "T00:00:00") - new Date().setHours(0, 0, 0, 0)) / 86400000);
  const followButton = (id) =>
    `<button type="button" class="btn btn-ghost btn-small follow ${isFollowed(id) ? "on" : ""}" data-follow="${id}" aria-pressed="${isFollowed(id)}">${isFollowed(id) ? "★ " + cal().followed : "☆ " + cal().follow}</button>`;
  const rev = () => REV[lang()];
  const sourceTag = (doc) => `<span class="tag ${doc.corrige_source === "officiel" ? "tag-green" : "tag-line"}">${doc.corrige_source === "officiel" ? rev().official : rev().proposed}</span>`;
  const reportButton = (id, kind) => `<button type="button" class="btn btn-ghost btn-small" data-report="${id}" data-kind="${kind}">${rev().report}</button>`;
  const ori = () => ORI[lang()];
  const levelName = (code) => (code ? ori().levels[code] || code : "");

  const TABS = ["concours", "quiz", "epreuves", "corriges", "oral", "salle"];
  const PREMIUM_TABS = new Set(["corriges", "oral", "salle"]);

  // ---------- Utilitaires ----------
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const fmtNum = (n) => new Intl.NumberFormat(lang() === "en" ? "en-GB" : "fr-FR").format(n);
  const fcfa = (n) => fmtNum(n) + " FCFA";
  const premium = () => Boolean(state.user?.premium);
  const hm = (min) => (min >= 60 ? `${Math.floor(min / 60)} h${min % 60 ? " " + String(min % 60).padStart(2, "0") : ""}` : `${min} min`);
  const clock = (ms) => {
    const s = Math.max(0, Math.round(ms / 1000));
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    return (h ? h + ":" + String(m).padStart(2, "0") : String(m).padStart(2, "0")) + ":" + String(s % 60).padStart(2, "0");
  };
  const dateFmt = (iso) => new Date(iso).toLocaleDateString(lang() === "en" ? "en-GB" : "fr-FR", { day: "numeric", month: "long", year: "numeric" });
  const concoursById = (id) => state.catalog?.concours.find((c) => c.id === id);
  const epreuveMeta = (id) => state.catalog?.epreuves.find((e) => e.id === id);
  const epreuvesOf = (cid) => state.catalog.epreuves.filter((e) => e.concours === cid);

  function toast(msg) {
    document.querySelectorAll(".toast").forEach((x) => x.remove());
    const el = document.createElement("div");
    el.className = "toast";
    el.setAttribute("role", "status");
    el.textContent = msg;
    document.body.append(el);
    setTimeout(() => el.remove(), 3400);
  }

  function setSession(token, user) {
    state.token = token;
    state.user = user;
    if (token) local.set("token", token);
    else local.del("token");
  }

  function go(tab, nav = {}) {
    state.tab = tab;
    state.nav[tab] = nav;
    local.set("tab", tab);
    render();
    window.scrollTo({ top: 0 });
  }

  // ---------- Écrans d'accueil : connexion, section ----------
  function viewAuth() {
    const reg = state.authMode === "register";
    return `
      <div class="auth">
        <div class="auth-card">
          ${BRAND}
          <p class="muted">${AUTH.title}</p>
          <div class="seg" role="tablist">
            <button type="button" role="tab" aria-selected="${!reg}" data-auth="login">${AUTH.login}</button>
            <button type="button" role="tab" aria-selected="${reg}" data-auth="register">${AUTH.register}</button>
          </div>
          <form id="auth-form" class="form" novalidate>
            ${reg ? `<div class="field full"><label for="af-name">${AUTH.name}</label><input id="af-name" name="name" autocomplete="name" required></div>` : ""}
            <div class="field full"><label for="af-email">${AUTH.email}</label><input id="af-email" name="email" type="email" autocomplete="email" required></div>
            <div class="field full"><label for="af-pw">${AUTH.password}</label><input id="af-pw" name="password" type="password" autocomplete="${reg ? "new-password" : "current-password"}" minlength="8" required>
              ${reg ? `<span class="small muted">${AUTH.pwHint}</span>` : ""}</div>
            <p class="err full" id="auth-err" hidden></p>
            <button class="btn btn-primary btn-block full" type="submit">${reg ? AUTH.submitRegister : AUTH.submitLogin}</button>
          </form>
          ${reg ? "" : `<p class="small muted">${AUTH.forgot}</p>`}
          <p class="small"><button type="button" class="linkish" data-legal="privacy">${LEGAL.fr.privacy} · Privacy</button></p>
          ${state.demo ? `<div class="notice">${I.info}<span class="small">${T.fr.demoNotice}</span></div>` : ""}
        </div>
      </div>`;
  }

  function viewChooseSection() {
    const card = (l) => `
      <button type="button" class="section-card" data-lang="${l}">
        <span class="section-flag">${l === "fr" ? "FR" : "EN"}</span>
        <span><b>${AUTH[l][0]}</b><span class="small muted">${AUTH[l][1]}</span></span>
        ${I.chevron}
      </button>`;
    return `
      <div class="auth">
        <div class="auth-card">
          ${BRAND}
          <h1 style="font-size:1.5rem">${AUTH.chooseTitle}</h1>
          <p class="muted small">${AUTH.chooseSub}</p>
          <div style="display:grid;gap:12px">${card("fr")}${card("en")}</div>
        </div>
      </div>`;
  }

  // ---------- Coquille ----------
  function shell() {
    const L = t();
    const inB = state.space === "bourses" && bourseOn();
    const list = inB ? BTABS : TABS;
    const longNames = inB ? br().tabsLong : L.tabsLong;
    const shortNames = inB ? br().tabs : L.tabs;
    const nav = list
      .map(
        (id) =>
          `<button type="button" data-tab="${id}" ${state.tab === id ? 'aria-current="page"' : ""}>${I[id]}<span>${longNames[id]}</span>${
            !inB && PREMIUM_TABS.has(id) && !premium() ? `<span class="lock">${I.lock}</span>` : ""
          }</button>`
      )
      .join("");
    const tabs = list.map((id) => `<button type="button" data-tab="${id}" ${state.tab === id ? 'aria-current="page"' : ""}>${I[id]}<span>${shortNames[id]}</span></button>`).join("");
    const spaces = bourseOn()
      ? `<div class="space-switch" role="tablist" aria-label="Espace">${["concours", "bourses"]
          .map((k) => `<button type="button" role="tab" data-space="${k}" aria-selected="${(inB ? "bourses" : "concours") === k}">${br().space[k]}</button>`)
          .join("")}</div>`
      : "";
    const badge = state.user.admin
      ? `<span class="tag tag-sun">${L.designer}</span>`
      : premium()
      ? `<span class="tag tag-green">${L.subscriber}</span>`
      : `<button type="button" class="btn btn-sun btn-sm" data-pay>${L.subscribe}</button>`;
    return `
      <div class="app">
        <aside class="sidebar">
          ${BRAND}
          <button type="button" class="section-pill" data-account>${lang().toUpperCase()} · ${L.section}</button>
          <nav class="nav" aria-label="Sections">${nav}</nav>
          <div class="sidebar-foot">${accessBox()}</div>
        </aside>
        <div class="main">
          <header class="topbar">
            ${BRAND}
            <div style="display:flex;gap:8px;align-items:center">${badge}<button type="button" class="icon-btn" data-account aria-label="${L.account}">${I.user}</button></div>
          </header>
          ${spaces}
          <main class="view" id="view"></main>
        </div>
        <nav class="tabbar" aria-label="Sections" style="grid-template-columns:repeat(${list.length}, minmax(0, 1fr))">${tabs}</nav>
      </div>`;
  }

  function accessBox() {
    const L = t();
    const u = state.user;
    const head = `<div class="row" style="display:flex;gap:10px;align-items:center"><span class="avatar">${esc(u.name.slice(0, 1).toUpperCase())}</span><span style="min-width:0"><b class="ellipsis">${esc(u.name)}</b><span class="small muted ellipsis">${esc(u.email)}</span></span></div>`;
    let body;
    if (u.admin) body = `<span class="small muted">${L.designerAccess}</span>`;
    else if (premium()) body = `<span class="small muted">${L.until(dateFmt(u.premium_until))}</span>`;
    else body = `<span class="small muted">${L.perYear(fcfa(state.config.price_xaf))}</span><button type="button" class="btn btn-sun btn-block" data-pay>${L.subscribe}</button>`;
    return `<div class="status-pill">${head}${body}<button type="button" class="linkish small" data-account>${L.account}</button></div>`;
  }

  function demoNotice() {
    return state.demo ? `<div class="notice">${I.info}<span>${t().demoNotice}</span></div>` : "";
  }

  function lockedIntro(tab) {
    const L = t();
    const txt = {
      corriges: [L.corrigesTitle, L.corrigesSub],
      oral: [L.oralTitle, L.oralSub],
      salle: [L.roomTitle, L.roomSub],
    }[tab];
    return `
      <section class="card" style="gap:14px;padding:clamp(18px,4vw,30px)">
        <span class="tag tag-sun" style="align-self:flex-start">${I.lock} ${L.locked}</span>
        <h1>${txt[0]}</h1>
        <p class="muted" style="max-width:56ch">${txt[1]}</p>
        <div><button type="button" class="btn btn-sun" data-pay>${L.subscribe} · ${fcfa(state.config.price_xaf)}</button></div>
      </section>`;
  }

  // ---------- Concours (présentation) ----------
  function viewConcours() {
    const L = t();
    const nav = state.nav.concours || {};
    if (nav.concours) return viewFiche(concoursById(nav.concours));
    if (nav.orient) return viewOrient();
    if (nav.calendrier) return viewCalendar();
    if (!state.annonces && !state.demo) loadAnnonces();
    if (bourseOn() && !state.bourses && !state.demo) loadBourses(); // le bandeau d'alertes des bourses défile aussi sur l'accueil des concours
    const O = ori();
    return `
      <section class="hero">
        <div>
          <span class="eyebrow" style="color:inherit;opacity:.85">${L.section}</span>
          <h1>${L.hero}</h1>
          <p>${L.heroSub}</p>
          <div class="cta">
            <button type="button" class="btn btn-sun" data-tab="salle">${L.enterRoom}</button>
            <button type="button" class="btn btn-ghost" data-tab="epreuves">${L.seePapers}</button>
          </div>
        </div>
        <div class="hero-stats">
          <div class="hero-stat"><b>${state.catalog.concours.length}</b><span>${L.statConcours}</span></div>
          <div class="hero-stat"><b>${state.catalog.epreuves.length}</b><span>${L.statPapers}</span></div>
          <div class="hero-stat"><b>2</b><span>${L.statSections}</span></div>
          <div class="hero-stat"><b>1</b><span>${L.statFree}</span></div>
        </div>
      </section>
      ${demoNotice()}
      ${bourseOn() && state.bourses?.length ? tickerHtml(state.bourses) : ""}
      ${state.demo ? "" : newBanner() + remindersCard()}
      ${state.demo ? "" : `<section class="card orient-cta"><div><h2>${O.cta}</h2><p class="muted">${O.ctaSub}</p></div><button type="button" class="btn btn-primary" data-orient>${O.ctaBtn}</button></section>
        <section class="card orient-cta"><div><h2>${cal().cta}</h2><p class="muted">${cal().ctaSub}</p></div>
          <div class="cta-buttons"><button type="button" class="btn btn-primary" data-calendar>${cal().ctaBtn}</button>${state.config.whatsapp_channel ? `<a class="btn btn-ghost" href="${esc(state.config.whatsapp_channel)}" target="_blank" rel="noopener noreferrer">${cal().whatsapp}</a>` : ""}</div></section>`}
      <div class="section-head"><div><span class="eyebrow">${L.presentation}</span><h2>${L.pickConcours}</h2></div><p class="muted small">${L.pickConcoursSub}</p></div>
      ${categoryChips()}
      <input id="concours-search" class="search" type="search" placeholder="${L.search}" value="${esc(state.q)}" autocomplete="off">
      <div id="concours-list">${concoursList()}</div>
      ${scamCard()}`;
  }

  async function loadAnnonces() {
    if (state.annoncesLoading) return;
    state.annoncesLoading = true;
    try {
      state.annonces = await api().annonces();
    } catch {
      state.annonces = [];
    }
    state.annoncesLoading = false;
    render();
  }

  const unseenAnn = () => {
    const seen = local.get("ann_seen", "");
    return (state.annonces || []).filter((a) => a.published_at > seen);
  };
  const markAnnSeen = () => {
    if (state.annonces?.length) local.set("ann_seen", state.annonces.map((a) => a.published_at).sort().pop());
  };

  // Bandeau « Nouveau » : annonces publiées depuis la dernière visite du calendrier.
  function newBanner() {
    const C = cal();
    const fresh = unseenAnn();
    if (!fresh.length) return "";
    return `<section class="card new-banner"><div><span class="tag tag-sun">${C.newTag}</span> <b>${C.bannerNew(fresh.length)}</b><p class="small">${esc(annText(fresh[0], "titre"))}</p></div>
      <button type="button" class="btn btn-sun" data-calendar>${C.seeAnn}</button></section>`;
  }

  // Rappels des concours suivis : annonces datées à J-30, puis période probable en cours.
  function remindersCard() {
    const C = cal();
    const ids = state.user?.suivis || [];
    if (!ids.length) return "";
    const month = new Date().getMonth() + 1;
    const rows = ids
      .map((id) => {
        const c = concoursById(id);
        if (!c) return "";
        const next = (state.annonces || [])
          .filter((a) => a.concours === id && a.date && daysUntil(a.date) >= 0)
          .sort((a, b) => a.date.localeCompare(b.date))[0];
        let hint;
        if (next) {
          const d = daysUntil(next.date);
          hint = `<span class="tag ${d <= 7 ? "tag-sun" : "tag-green"}">${C.inDays(d)}</span> ${esc(C.kinds[next.kind])} · ${esc(annText(next, "titre"))}`;
        } else {
          const phases = Object.entries(c.calendrier?.mois || {}).filter(([, ms]) => ms.includes(month)).map(([k]) => C.phaseNow[k]);
          hint = phases.length ? `<span class="tag tag-line">${C.probable}</span> ${esc(phases.join(", "))}` : `<span class="muted">${C.noPhase}</span>`;
        }
        return `<button type="button" class="paper-row" data-open-cal="${id}"><span style="min-width:0"><b>${esc(c.sigle)} · ${esc(c.nom)}</b><span class="small">${hint}</span></span>${I.chevron}</button>`;
      })
      .join("");
    return `<section class="card"><h2>${C.myFollows}</h2><div class="paper-list">${rows}</div></section>`;
  }

  // ---------- Calendrier ----------
  function viewCalendar() {
    const L = t();
    const C = cal();
    if (!state.annonces) loadAnnonces();
    else markAnnSeen();
    const month = new Date().getMonth() + 1;
    const withCal = state.catalog.concours.filter((c) => c.calendrier?.mois);
    const order = (c) => (isFollowed(c.id) ? 0 : 1000) + (c.priorite || 999);
    withCal.sort((a, b) => order(a) - order(b));
    const phases = ["lancement", "depot", "epreuves"];

    const paused = withCal.filter((c) => c.periodicite?.pause);
    const now = withCal
      .filter((c) => !c.periodicite?.pause)
      .map((c) => ({ c, ph: phases.filter((p) => c.calendrier.mois[p].includes(month)) }))
      .filter((x) => x.ph.length);
    const nowHtml = now.length
      ? `<div class="paper-list">${now.map(({ c, ph }) => `<button type="button" class="paper-row" data-open-cal="${c.id}"><span style="min-width:0"><b>${esc(c.sigle)} · ${esc(c.nom)}</b><span class="small muted">${ph.map((p) => C.phaseNow[p]).join(", ")}</span></span>${I.chevron}</button>`).join("")}</div>`
      : `<p class="muted">${C.noneThisMonth}</p>`;

    const annHtml = (state.annonces || []).length
      ? `<div class="ann-list">${state.annonces
          .map((a) => {
            const c = a.concours ? concoursById(a.concours) : null;
            const d = a.date ? daysUntil(a.date) : null;
            return `<article class="card ann ${c && isFollowed(c.id) ? "mine" : ""}">
              <div class="ann-top"><span class="tag tag-indigo">${esc(C.kinds[a.kind])}</span>${c ? `<button type="button" class="linkish" data-open-cal="${c.id}">${esc(c.sigle)}</button>` : ""}
                ${d != null && d >= 0 ? `<span class="tag ${d <= 7 ? "tag-sun" : "tag-green"}">${C.inDays(d)}</span>` : ""}</div>
              <b>${esc(annText(a, "titre"))}</b>
              ${annText(a, "message") ? `<p class="small">${esc(annText(a, "message"))}</p>` : ""}
              ${a.date ? `<p class="small muted">${C.dateOn(dateFmt(a.date))}</p>` : ""}
              ${a.lien ? `<p class="small"><a href="${esc(a.lien)}" target="_blank" rel="noopener noreferrer">${C.source}</a></p>` : ""}
            </article>`;
          })
          .join("")}</div>`
      : `<p class="muted">${C.noAnn}</p>`;

    const head = `<tr><th class="sticky">${L.thConcours}</th>${C.months.map((m, i) => `<th class="${i + 1 === month ? "cur" : ""}">${m}</th>`).join("")}</tr>`;
    const rows = withCal
      .map((c) => {
        const cells = C.months
          .map((_, i) => {
            const on = phases.filter((p) => c.calendrier.mois[p].includes(i + 1));
            return `<td class="${i + 1 === month ? "cur" : ""}">${on.map((p) => `<i class="ph ph-${p}" title="${esc(C.legend[p])}"></i>`).join("")}</td>`;
          })
          .join("");
        return `<tr class="${c.periodicite?.pause ? "pause" : ""}"><th class="sticky"><div class="cal-name"><button type="button" class="linkish" data-open-cal="${c.id}">${esc(c.sigle)}</button>
          <button type="button" class="star ${isFollowed(c.id) ? "on" : ""}" data-follow="${c.id}" aria-pressed="${isFollowed(c.id)}" aria-label="${C.starLabel}: ${esc(c.nom)}">${isFollowed(c.id) ? "★" : "☆"}</button></div></th>${cells}</tr>`;
      })
      .join("");
    const legend = phases.map((p) => `<span class="legend-item"><i class="ph ph-${p}"></i>${C.legend[p]}</span>`).join("");
    return `<button type="button" class="back" data-back>${I.back} ${L.allConcours}</button>
      <div><span class="eyebrow">${L.section}</span><h1>${C.title}</h1></div><p class="muted">${C.sub}</p>
      <div style="display:flex;gap:10px;flex-wrap:wrap">${state.config.whatsapp_channel ? `<a class="btn btn-ghost" href="${esc(state.config.whatsapp_channel)}" target="_blank" rel="noopener noreferrer">${C.whatsapp}</a>` : ""}${state.config.whatsapp_contact ? `<a class="btn btn-ghost" href="${esc(state.config.whatsapp_contact)}" target="_blank" rel="noopener noreferrer">${C.contact}</a>` : ""}</div>
      <section class="orient-group"><h2>${C.announcements}</h2>${annHtml}</section>
      <section class="orient-group"><h2>${C.thisMonth(C.monthNames[month - 1])}</h2>${nowHtml}</section>
      ${paused.length ? `<section class="orient-group"><h2>${C.pauseSection}</h2><div class="paper-list">${paused.map((c) => `<button type="button" class="paper-row" data-open-cal="${c.id}"><span style="min-width:0"><b>${esc(c.sigle)} · ${esc(c.nom)}</b><span class="small muted">${C.pauseRow(c.periodicite.prochaine_probable)}</span></span>${I.chevron}</button>`).join("")}</div></section>` : ""}
      <section class="orient-group"><div class="legend">${legend}</div><p class="small muted">${C.followHelp(2)}</p>
        <div class="table-wrap cal-wrap"><table class="cal"><thead>${head}</thead><tbody>${rows}</tbody></table></div></section>`;
  }

  function scamCard() {
    const O = ori();
    return `<article class="card scam"><h3>${I.info} ${O.scamTitle}</h3><ul class="clean">${O.scam.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></article>`;
  }

  // ---------- « Quel concours pour moi ? » ----------
  function viewOrient() {
    const L = t();
    const O = ori();
    const p = state.user.profil || {};
    const back = `<button type="button" class="back" data-back>${I.back} ${L.allConcours}</button>`;
    const head = `<div><span class="eyebrow">${L.section}</span><h1>${O.title}</h1></div><p class="muted">${O.sub}</p>`;
    if (!p.niveau || state.editProfil) return back + head + orientForm(p);
    const summary = [
      O.levels[p.niveau],
      p.serie && p.serie !== "AUTRE" ? O.seriesNames[p.serie] : "",
      p.annee_naissance ? O.born(p.annee_naissance) : "",
      p.region ? O.regions[p.region] : "",
    ].filter(Boolean);
    const top = `${back}${head}<section class="card profil-summary"><div class="chips">${summary.map((x) => `<span class="tag tag-line">${esc(x)}</span>`).join("")}</div>
      <button type="button" class="btn btn-ghost" data-edit-profil>${O.edit}</button></section>`;
    if (!state.orient) {
      loadOrient();
      return top + `<p class="muted">${O.loading}</p>`;
    }
    const by = {};
    for (const r of state.orient.resultats) (by[r.categorie] ||= []).push(r);
    const card = (r) => {
      const c = concoursById(r.id);
      if (!c) return "";
      const reasons = r.raisons
        .map((x) => ({ ok: x, text: O.reason(x, levelName) }))
        .filter((x) => x.text)
        .map(({ ok: x, text }) => `<li class="r-${x.ok === true ? "ok" : x.ok === false ? "ko" : "chk"}"><span aria-hidden="true">${x.ok === true ? "✓" : x.ok === false ? "✕" : "!"}</span><span>${esc(text)}</span></li>`)
        .join("");
      return `<article class="card result">
        <div class="row" style="display:flex;gap:12px;align-items:center"><div class="${sigleClass(c)}">${esc(c.sigle)}</div>
          <div style="min-width:0"><b>${esc(c.nom)}</b><span class="small muted" style="display:block">${esc(c.organisme)}</span></div></div>
        <ul class="reasons">${reasons}</ul>
        ${r.pause ? `<div class="pause-alts"><span class="tag tag-sun">${O.pauseTag}</span>${(alternativesFor(c.id) || []).length ? `<p class="small"><b>${O.per.alternatives}</b> : ${alternativesFor(c.id).map((a) => `<button type="button" class="linkish" data-open-orient="${a.id}">${esc(a.sigle)}</button>`).join(" · ")}</p>` : ""}</div>` : ""}
        <div class="row-actions"><span class="tag tag-line">${O.verify}</span><button type="button" class="btn btn-ghost" data-open-orient="${c.id}">${O.open}</button></div>
      </article>`;
    };
    const compact = (r) => {
      const c = concoursById(r.id);
      return c ? `<button type="button" class="paper-row" data-open-orient="${c.id}"><span style="min-width:0"><b>${esc(c.nom)}</b><span class="small muted">${esc(c.organisme)}</span></span>${I.chevron}</button>` : "";
    };
    const open = ["bien", "adapte", "possible"];
    const folded = ["improbable", "inconnu", "non"];
    const section = (k) => {
      const list = by[k] || [];
      if (!list.length && open.includes(k)) return "";
      if (!list.length) return "";
      const [title, sub] = O.groups[k];
      const body = k === "inconnu" ? `<div class="paper-list">${list.map(compact).join("")}</div>` : `<div class="results">${list.map(card).join("")}</div>`;
      const inner = `<p class="small muted">${esc(sub)}</p>${body}`;
      return folded.includes(k)
        ? `<details class="fold"><summary><b>${esc(title)}</b> <span class="muted">${list.length}</span></summary>${inner}</details>`
        : `<section class="orient-group"><h2>${esc(title)} <span class="muted">${list.length}</span></h2>${inner}</section>`;
    };
    const any = open.some((k) => (by[k] || []).length);
    return `${top}
      <p class="small muted">${O.target(state.orient.annee_cible)}</p>
      ${any ? "" : `<div class="notice">${I.info}<span>${O.none}</span></div>`}
      ${[...open, ...folded].map(section).join("")}
      ${scamCard()}`;
  }

  async function loadOrient() {
    if (state.orientLoading) return;
    state.orientLoading = true;
    try {
      state.orient = await api().orientation(lang());
    } catch (e) {
      toast(e.message);
      state.editProfil = true;
    }
    state.orientLoading = false;
    render();
  }

  function orientForm(p) {
    const O = ori();
    const opt = (v, label, cur) => `<option value="${esc(v)}" ${cur === v ? "selected" : ""}>${esc(label)}</option>`;
    const years = new Date().getFullYear();
    return `<form id="profil-form" class="card form" novalidate>
      <div class="full"><h2>${O.formTitle}</h2><p class="muted small">${O.formSub}</p></div>
      <div class="field full"><label for="pf-niveau">${O.level}</label>
        <select id="pf-niveau" name="niveau" required><option value="">${O.levelPh}</option>${LEVELS.map((v) => opt(v, O.levels[v], p.niveau)).join("")}</select></div>
      <div class="field full"><label for="pf-serie">${O.series}</label>
        <select id="pf-serie" name="serie"><option value="">${O.seriesPh}</option>${SERIES_BY_LANG[lang()].map((v) => opt(v, O.seriesNames[v], p.serie)).join("")}</select>
        <span class="small muted">${O.seriesHelp}</span></div>
      <div class="field"><label for="pf-birth">${O.birth}</label>
        <input id="pf-birth" name="annee_naissance" type="number" inputmode="numeric" min="${years - 70}" max="${years - 8}" placeholder="2005" value="${p.annee_naissance || ""}">
        <span class="small muted">${O.birthHelp}</span></div>
      <div class="field"><label for="pf-region">${O.region}</label>
        <select id="pf-region" name="region"><option value="">${O.regionPh}</option>${REGIONS.map((v) => opt(v, O.regions[v], p.region)).join("")}</select></div>
      <fieldset class="field full interests"><legend>${O.interests}</legend><p class="small muted">${O.interestsHelp}</p>
        <div class="picks">${INTERESTS.map((v) => `<label class="pick"><input type="checkbox" name="interets" value="${v}" ${(p.interets || []).includes(v) ? "checked" : ""}><span>${esc(O.interestNames[v])}</span></label>`).join("")}</div></fieldset>
      <p class="err full" id="profil-err" hidden></p>
      <button class="btn btn-primary btn-block full" type="submit">${O.save}</button>
    </form>`;
  }

  async function submitProfil(f) {
    const fd = new FormData(f);
    const err = f.querySelector("#profil-err");
    const niveau = fd.get("niveau");
    if (!niveau) {
      err.textContent = ori().levelPh + ".";
      err.hidden = false;
      return;
    }
    try {
      state.user = await api().update({
        profil: { niveau, serie: fd.get("serie") || "", annee_naissance: fd.get("annee_naissance") || "", region: fd.get("region") || "", interets: fd.getAll("interets") },
      });
    } catch (e) {
      err.textContent = e.message;
      err.hidden = false;
      return;
    }
    state.editProfil = false;
    state.orient = null;
    render();
  }

  // Concours alternatifs pour le profil : bien adaptés ou adaptés, hors pause, de préférence dans le même domaine.
  function alternativesFor(id) {
    const res = state.orient?.resultats;
    if (!res) return null;
    const me = res.find((r) => r.id === id);
    const pool = res.filter((r) => r.id !== id && !r.pause && ["bien", "adapte"].includes(r.categorie));
    const same = pool.filter((r) => me?.interet && r.interet === me.interet);
    return [...same, ...pool.filter((r) => !same.includes(r))].slice(0, 3).map((r) => concoursById(r.id)).filter(Boolean);
  }

  function alternativesBlock(c) {
    const O = ori();
    if (!state.user?.profil?.niveau) return `<p class="small">${O.per.needProfile} <button type="button" class="linkish" data-orient>${O.ctaBtn}</button></p>`;
    if (!state.orient) {
      loadOrient();
      return `<p class="small muted">…</p>`;
    }
    const alts = alternativesFor(c.id) || [];
    if (!alts.length) return `<p class="small muted">${O.per.none}</p>`;
    return `<p class="small"><b>${O.per.alternatives}</b></p><div class="paper-list">${alts
      .map((a) => `<button type="button" class="paper-row" data-open-orient="${a.id}"><span style="min-width:0"><b>${esc(a.sigle)} · ${esc(a.nom)}</b><span class="small muted">${esc(a.organisme)}</span></span>${I.chevron}</button>`)
      .join("")}</div>`;
  }

  function periodCard(c) {
    const per = c.periodicite;
    if (!per) return "";
    const P = ori().per;
    const type = per.type === "pluriannuelle" ? P.everyN(per.intervalle_ans) : P.types[per.type];
    const rows = [
      `<div><dt>${P.title}</dt><dd>${esc(type)}</dd></div>`,
      per.sessions?.length ? `<div><dt>${P.sessions}</dt><dd>${esc(per.sessions.join(", "))}</dd></div>` : per.derniere_session ? `<div><dt>${P.last}</dt><dd>${esc(per.derniere_session)}</dd></div>` : "",
      per.prochaine_probable ? `<div><dt>${P.next}</dt><dd>${esc(per.prochaine_probable)} <span class="tag tag-sun">${P.toConfirm}</span></dd></div>` : "",
    ].join("");
    const pause = per.pause
      ? `<div class="notice">${I.info}<span><b>${P.pauseTitle}.</b> ${P.pauseText(per.prochaine_probable)}</span></div>${alternativesBlock(c)}`
      : "";
    return `<article class="card"><h3>${P.title}</h3><dl class="kv">${rows}</dl>
      ${per.note ? `<p class="small">${esc(per.note)}</p>` : ""}
      <p class="small muted">${per.confiance ? P.conf[per.confiance] || "" : ""}</p>${pause}</article>`;
  }

  // Conditions d'accès structurées d'une fiche (niveau, séries, âge…), toujours « à confirmer dans l'arrêté ».
  function accessCard(c) {
    const a = c.acces;
    const O = ori();
    if (!a) return "";
    const row = (k, v) => (v ? `<div><dt>${k}</dt><dd>${v}</dd></div>` : "");
    const hasAge = a.age_min != null || a.age_max != null;
    const cal = c.calendrier || {};
    const period = [
      cal.mois_lancement ? `${O.launch} : ${esc(cal.mois_lancement)}` : "",
      cal.mois_limite_depot ? `${O.deadline} : ${esc(cal.mois_limite_depot)}` : "",
      cal.mois_epreuves ? `${O.exams} : ${esc(cal.mois_epreuves)}` : "",
    ].filter(Boolean);
    const fees = cal.frais_fcfa != null ? fcfa(cal.frais_fcfa) + (cal.frais_note ? " · " + esc(cal.frais_note) : "") : cal.frais_note ? esc(cal.frais_note) : "";
    return `<article class="card access"><h3>${O.accessTitle}</h3>
      <dl class="kv">
        ${row(O.diplomas, esc(a.diplomes || (a.niveaux_min ? levelName(a.niveaux_min) : "")))}
        ${row(O.seriesLabel, a.series_note ? esc(a.series_note) : a.series?.length ? esc(a.series.join(", ")) : "")}
        ${row(O.ageLabel, hasAge ? esc(a.age_note || O.ageText(a)) : a.age_note ? esc(a.age_note) : "")}
        ${row(O.nationality, a.nationalite ? O.cameroonian : "")}
        ${row(O.others, a.autres?.length ? `<ul class="clean">${a.autres.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : "")}
        ${row(O.fees, fees)}
        ${row(O.periodTitle, period.length ? period.join("<br>") : "")}
        ${row(O.dossier, cal.pieces?.length ? `<ul class="clean">${cal.pieces.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : "")}
        ${row(O.outcomes, c.debouches ? esc(c.debouches) : "")}
        ${row(O.variants, c.variantes?.length ? `<ul class="clean">${c.variantes.map((v) => `<li><b>${esc(v.nom)}</b> : ${esc(v.difference)}</li>`).join("")}</ul>` : "")}
      </dl>
      <div class="notice">${I.info}<span class="small">${O.accessNote(a.annee_conditions)} ${c.status !== "verified" ? O.unverified : ""}</span></div>
      ${c.lien_inscription ? `<p class="small"><a href="${esc(c.lien_inscription)}" target="_blank" rel="noopener noreferrer">${O.register}</a></p>` : ""}
      ${c.sources?.length ? `<details class="sources"><summary class="small">${O.sources} (${c.sources.length})</summary><ul class="clean small">${c.sources.map((x) => `<li>${x.url ? `<a href="${esc(x.url)}" target="_blank" rel="noopener noreferrer">${esc(x.titre || x.url)}</a>` : esc(x.titre)}${x.annee ? " (" + esc(x.annee) + ")" : ""}</li>`).join("")}</ul></details>` : ""}
      ${c.last_verified ? `<p class="small muted">${O.lastVerified(dateFmt(c.last_verified))}</p>` : ""}
    </article>`;
  }

  function categoryChips() {
    const L = t();
    const counts = {};
    for (const c of state.catalog.concours) counts[c.categorie] = (counts[c.categorie] || 0) + 1;
    const chip = (id, label, n) => `<button type="button" class="chip" data-cat="${id}" aria-pressed="${state.cat === id}">${esc(label)} <span class="muted">${n}</span></button>`;
    return `<div class="chips" role="group">${chip("all", L.allTypes, state.catalog.concours.length)}${Object.entries(state.catalog.categories)
      .filter(([k]) => counts[k])
      .map(([k, v]) => chip(k, v, counts[k]))
      .join("")}</div>`;
  }

  const norm = (s) => String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  function concoursList() {
    const q = norm(state.q);
    const filter = (c) =>
      (state.cat === "all" || c.categorie === state.cat) &&
      (!q || norm([c.nom, c.sigle, c.organisme, c.tutelle].join(" ")).includes(q));
    return schoolGroups("fiche", filter) || `<p class="muted">${t().noResult}</p>`;
  }

  // Cartes des écoles, regroupées par ministère / institution.
  const rank = (c) => (epreuvesOf(c.id).length ? 0 : 1000) + (c.priorite || 999);
  function schoolGroups(mode, filter = () => true) {
    const L = t();
    const groups = {};
    for (const c of [...state.catalog.concours].sort((a, b) => rank(a) - rank(b))) {
      if (!filter(c)) continue;
      (groups[c.groupe] ||= []).push(c);
    }
    return Object.entries(groups)
      .sort(([, a], [, b]) => rank(a[0]) - rank(b[0]))
      .map(([g, list]) => {
        const cards = list
          .map((c) => {
            const eps = epreuvesOf(c.id);
            const last = c.annuaire?.places?.[0];
            const foot =
              mode === "fiche"
                ? `${eps.length ? `<span class="tag tag-green">${L.inWeldon(eps.length)}</span>` : `<span class="tag tag-sun">${L.inProgress}</span>`}${
                    last ? `<span class="tag tag-line">${esc(L.latestPlaces(last.annee, last.detail.split(" (")[0]))}</span>` : ""
                  }${c.oral ? `<span class="tag tag-indigo">${L.oralYes}</span>` : ""}`
                : eps.length
                ? `<span class="tag tag-line">${L.papers(eps.length)}</span>`
                : `<span class="tag tag-sun">${L.inProgress}</span>`;
            const summary = c.resume || (c.annuaire ? c.annuaire.matieres.join(" · ") : "");
            return `
              <button type="button" class="card card-click${photoOf(c) ? " has-photo" : ""}" data-school="${c.id}" data-mode="${mode}">
                ${photoOf(c) ? `<img class="card-photo" src="img/themes/${esc(photoOf(c).fichier)}" alt="" loading="lazy">` : ""}
                <div class="row"><div class="${sigleClass(c)}">${esc(c.sigle)}</div>
                  <div style="min-width:0"><h3>${esc(c.nom)}</h3><span class="small muted">${esc(state.catalog.categories[c.categorie] || "")}</span></div></div>
                ${mode === "fiche" && summary ? `<p class="muted small">${esc(summary)}</p>` : ""}
                <div class="foot"><span class="row">${foot}</span>${I.chevron}</div>
              </button>`;
          })
          .join("");
        return `<section class="group"><h3 class="group-label">${esc(state.catalog.groupes[g] || g)}</h3><div class="grid">${cards}</div></section>`;
      })
      .join("");
  }

  // Photo du thème du concours (web/img/themes), affichée seulement si elle existe.
  const photoOf = (c) => state.catalog.photos?.[c.theme] || null;
  function banner(c) {
    const ph = photoOf(c);
    if (!ph) return "";
    return `<figure class="concours-banner c-${c.couleur}">
      <img src="img/themes/${esc(ph.fichier)}" alt="${esc(c.nom)}" loading="lazy">
      ${ph?.credit ? `<figcaption>${esc(ph.credit)}</figcaption>` : ""}
    </figure>`;
  }

  const sigleClass = (c) => `sigle c-${c.couleur}${c.sigle.length > 5 ? " sigle-long" : ""}`;

  function placesTable(a) {
    const L = t();
    if (!a) return "";
    const rows = a.places.map((p) => `<tr><td>${esc(p.annee)}</td><td>${esc(p.detail)}</td></tr>`).join("");
    return `<article class="card"><h3>${L.placesPerSession}</h3>
      ${rows ? `<div class="table-wrap"><table><thead><tr><th>${L.thYear}</th><th>${L.thPlaces}</th></tr></thead><tbody>${rows}</tbody></table></div>` : ""}
      ${a.places_note ? `<p class="small muted">${esc(a.places_note)}</p>` : ""}</article>`;
  }

  // Fiche courte pour les concours du répertoire (sans fiche détaillée).
  function viewFicheSimple(c) {
    const L = t();
    const a = c.annuaire;
    const n = epreuvesOf(c.id).length;
    return `
      <button type="button" class="back" data-back>${I.back} ${L.allConcours}</button>
      ${banner(c)}
      <div class="row" style="display:flex;gap:14px;align-items:center;flex-wrap:wrap">
        <div class="${sigleClass(c)}" style="width:64px;height:64px">${esc(c.sigle)}</div>
        <div style="min-width:0"><span class="eyebrow">${esc(state.catalog.categories[c.categorie] || "")}</span><h1>${esc(c.nom)}</h1></div>
        ${followButton(c.id)}
      </div>
      <div class="fiche">
        <div style="display:grid;gap:16px;min-width:0">
          <article class="card"><h3>${L.subjects}</h3><ul class="clean">${a.matieres.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></article>
          ${periodCard(c)}
          ${accessCard(c)}
          ${placesTable(a)}
        </div>
        <aside class="card" style="min-width:0">
          <dl class="kv">
            <div><dt>${L.tutelle}</dt><dd>${esc(c.organisme)}${c.tutelle && c.tutelle.includes("/") ? `<br><span class="small muted">${esc(c.tutelle)}</span>` : ""}</dd></div>
            <div><dt>${L.category}</dt><dd>${esc(state.catalog.categories[c.categorie] || "")}</dd></div>
            <div><dt>${L.sessionsDoc}</dt><dd>${esc(a.sessions)}</dd></div>
            <div><dt>${L.oral}</dt><dd>${c.oral ? L.oralYes : L.no}</dd></div>
          </dl>
          <div class="notice">${I.info}<span class="small">${n ? L.inWeldon(n) : L.papersSoon} ${L.officialNote}</span></div>
          ${n ? `<button type="button" class="btn btn-primary" data-jump="epreuves" data-c="${c.id}">${L.seeN(n)}</button>` : ""}
        </aside>
      </div>`;
  }

  function viewFiche(c) {
    if (!c.fiche) return viewFicheSimple(c);
    const L = t();
    const f = c.fiche;
    const rows = f.epreuves_officielles
      .map((e) => `<tr><td>${esc(e.nom)}</td><td>${e.duree ? hm(e.duree) : "—"}</td><td>${esc(e.coef)}</td><td>${e.note_eliminatoire ? e.note_eliminatoire + "/20" : "—"}</td></tr>`)
      .join("");
    const n = epreuvesOf(c.id).length;
    return `
      <button type="button" class="back" data-back>${I.back} ${L.allConcours}</button>
      ${banner(c)}
      <div class="row" style="display:flex;gap:14px;align-items:center;flex-wrap:wrap">
        <div class="${sigleClass(c)}" style="width:64px;height:64px">${esc(c.sigle)}</div>
        <div style="min-width:0"><span class="eyebrow">${esc(c.organisme)}</span><h1>${esc(c.nom)}</h1></div>
        ${followButton(c.id)}
      </div>
      <div class="fiche">
        <div style="display:grid;gap:16px;min-width:0">
          <article class="card"><h3>${L.presentation}</h3><p>${esc(f.presentation)}</p></article>
          <article class="card"><h3>${L.ficheHistory}</h3><p>${esc(f.historique)}</p></article>
          ${periodCard(c)}
          ${c.acces ? accessCard(c) : `<article class="card"><h3>${L.ficheConditions}</h3><ul class="clean">${f.conditions.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></article>`}
          <article class="card"><h3>${L.fichePapers}</h3>
            <div class="table-wrap"><table><thead><tr><th>${L.thPaper}</th><th>${L.thDuration}</th><th>${L.thCoef}</th><th>${L.thElim}</th></tr></thead><tbody>${rows}</tbody></table></div>
            <p class="small muted">${esc(f.autres_epreuves)}</p></article>
          ${placesTable(c.annuaire)}
        </div>
        <aside class="card" style="min-width:0">
          <dl class="kv">
            <div><dt>${L.places}</dt><dd>${esc(f.places)}</dd></div>
            <div><dt>${L.calendar}</dt><dd>${esc(f.calendrier)}</dd></div>
            <div><dt>${L.oral}</dt><dd>${c.oral ? L.oralForEligible : L.no}</dd></div>
            <div><dt>${L.admission}</dt><dd>${esc(f.admission)}</dd></div>
          </dl>
          <div class="notice">${I.info}<span class="small">${esc(f.a_verifier)}</span></div>
          ${n ? `<button type="button" class="btn btn-primary" data-jump="epreuves" data-c="${c.id}">${L.seeN(n)}</button>` : ""}
          ${c.oral ? `<button type="button" class="btn btn-ghost" data-jump="oral" data-c="${c.id}">${L.prepOral}</button>` : ""}
          ${n ? `<button type="button" class="btn btn-ghost" data-jump="salle" data-c="${c.id}">${L.trainRoom}</button>` : ""}
        </aside>
      </div>`;
  }

  // ---------- Bourses : vues ----------
  function setSpace(k) {
    state.space = k;
    local.set("space", k);
    state.tab = k === "bourses" ? "bhome" : "concours";
    state.bFicheId = null;
    state.play = null;
    render();
    window.scrollTo({ top: 0 });
  }

  async function loadBourses() {
    if (state.boursesLoading) return;
    state.boursesLoading = true;
    try {
      state.bourses = (await api().bourses(lang())).bourses;
    } catch {
      state.bourses = [];
    }
    state.boursesLoading = false;
    render();
  }

  // Branche, filière et niveau choisis : mémorisés sur le compte pour personnaliser l'accueil.
  const BRANCH_DOMAINS = {
    sciences: ["maths", "informatique", "physique-chimie", "sante", "ingenierie", "agronomie-environnement"],
    lettres: ["droit-politique", "histoire-geographie", "lettres-langues", "philo-sociologie", "communication", "education", "economie-gestion"],
  };
  const bPref = () => state.user?.bourse_profil || {};
  const bState = () => ({ branche: state.bf.branche, domaine: state.bf.domaine || "", niveau: state.bf.niveau || bPref().niveau || "" });
  function saveBPref(patch) {
    const next = { branche: patch.branche ?? bPref().branche ?? "", domaine: patch.domaine ?? bPref().domaine ?? "", niveau: patch.niveau ?? bPref().niveau ?? "" };
    api().update({ bourse_profil: next }).then((u) => (state.user = u)).catch(() => {});
  }

  function filterB(list, f) {
    const all = (b) => b.domaines.includes("tous") || !b.domaines.length;
    return list.filter(
      (b) =>
        (!f.branche || b.branches.includes(f.branche)) &&
        (!f.domaine || all(b) || b.domaines.includes(f.domaine)) &&
        (!f.niveau || b.niveaux.includes(f.niveau)) &&
        (!f.pays || b.pays_accueil.includes(f.pays)) &&
        (!f.type || (f.type === "complete" ? b.couverture.niveau === "complete" : b.origine === f.type)) &&
        (!f.q || searchHay(b).includes(plain(f.q)))
    );
  }
  const plain = (x) => String(x || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
  const searchHay = (b) => plain([b.nom, b.organisme, b.valeur, b.pays_accueil.join(" "), b.niveaux.map((x) => br().levels[x]).join(" "), b.domaines.map((d) => br().domains[d]).join(" ")].join(" "));
  // Série du compte → branche + filières proposées ; classe d'abord les bourses de ces filières (« tous » en second).
  const serieInfo = () => SERIE_MAP[state.user?.profil?.serie] || null;
  function forSerie(list) {
    const info = serieInfo();
    if (!info) return [];
    const [branche, doms] = info;
    const niveau = bPref().niveau;
    const score = (b) => (b.domaines.some((d) => doms.includes(d)) ? 2 : b.domaines.includes("tous") ? 1 : 0);
    return list
      .filter((b) => ["cloture_proche", "ouverte", "a_venir", "attendue"].includes(b.statut.code) && b.branches.includes(branche) && (!niveau || b.niveaux.includes(niveau)) && (!doms.length || score(b) > 0))
      .sort((a, c) => score(c) - score(a));
  }

  // Choix de la série (gratuit) et du niveau, au-dessus des résultats.
  function bSerieCard() {
    const B = br();
    const O = ori();
    const cur = state.user?.profil?.serie;
    const levels = ["licence", "master", "doctorat"];
    const chips = SERIES_BY_LANG[lang()]
      .filter((v) => v !== "AUTRE")
      .map((v) => `<button type="button" class="chip" data-bserie="${v}" aria-pressed="${cur === v}" title="${esc(O.seriesNames[v] || v)}">${esc(v === "ARTS" || v === "SCIENCE" || v === "TECH" ? (O.seriesNames[v] || v) : v)}</button>`)
      .join("");
    const lvl = levels.map((l) => `<button type="button" class="chip" data-bniveau-pref="${l}" aria-pressed="${bPref().niveau === l}">${esc(B.levels[l])}</button>`).join("");
    const detail = cur && O.seriesNames[cur] && /^L[AS]\d$/.test(cur) ? `<p class="small muted">${esc(O.seriesNames[cur])}</p>` : "";
    return `<section class="card"><h2>${B.serieTitle}</h2><p class="muted small">${B.serieSub}</p>
      <div class="chips wrap" role="group" aria-label="${B.serieTitle}">${chips}</div>${detail}
      <h3 style="margin-top:12px">${B.levelTitle}</h3><div class="chips" role="group" aria-label="${B.levelTitle}">${lvl}</div></section>`;
  }

  function bSearchForm(q) {
    const B = br();
    return `<form id="bsearch-form" class="search" role="search"><input id="bq" name="q" type="search" value="${esc(q || "")}" placeholder="${esc(B.searchPh)}" aria-label="${esc(B.searchPh)}" autocomplete="off"><button type="submit" class="btn btn-primary btn-small">${B.searchGo}</button></form>`;
  }

  function statusLine(b) {
    const L = br().line;
    const s = b.statut;
    if (s.code === "cloture_proche") return L.cloture_proche(s.jours, bFmt(s.cloture));
    if (s.code === "ouverte") return s.permanente ? L.permanente : L.ouverte(s.jours, bFmt(s.cloture || s.ouverture));
    if (s.code === "a_venir") return L.a_venir(s.jours, bFmt(s.ouverture));
    if (s.code === "attendue") return s.relance ? L.attendue(b.cycle?.ouverture_mois || "") : L.habituelle(bRelance(s.prochaine_cloture));
    if (s.code === "expiree") return L.expiree(bFmt(s.cloture), bRelance(s.relance), bRelance(s.prochaine_cloture));
    return L.inconnue;
  }
  const statusTag = (b) => {
    const cls = { cloture_proche: "tag-sun", ouverte: "tag-green", a_venir: "tag-indigo", attendue: "tag-indigo", expiree: "tag-line", inconnue: "tag-line" }[b.statut.code];
    return `<span class="tag ${cls}">${br().status[b.statut.code]}</span>`;
  };

  function cardB(b) {
    const B = br();
    const dated = ["cloture_proche", "ouverte", "a_venir"].includes(b.statut.code) && b.statut.probable && !b.statut.permanente;
    const where = b.pays_accueil.filter((x) => !(b.organisme || "").includes(x));
    return `<article class="card bcard ${b.statut.code === "expiree" ? "past" : ""}">
      <button type="button" class="bcard-main" data-open-b="${esc(b.id)}">
        <span class="row-actions" style="justify-content:flex-start;gap:6px">${statusTag(b)}<span class="tag tag-line">${B.coverage[b.couverture.niveau]}</span>${dated ? `<span class="tag tag-line">${B.toConfirm}</span>` : ""}${b.alerte ? `<span class="tag tag-sun">${I.info} ${B.alert}</span>` : ""}</span>
        <b>${esc(b.nom)}</b>
        <span class="small muted">${esc(b.organisme || "")}${where.length ? " · " + esc(where.join(", ")) : ""}</span>
        ${b.valeur ? `<span class="small bvalue">${esc(b.valeur.length > 110 ? b.valeur.slice(0, 108) + "…" : b.valeur)}</span>` : ""}
        <span class="small">${esc(statusLine(b))}</span>
        <span class="chips-inline">${b.niveaux.map((x) => `<span class="tag tag-line">${esc(B.levels[x])}</span>`).join("")}${b.verrou && b.a_lien ? `<span class="lock-pill">${I.lock}${B.lock.pill}</span>` : ""}${!b.verrou && b.apercu_gratuit && !premium() ? `<span class="tag tag-green">${B.lock.free}</span>` : ""}</span>
      </button>
      <button type="button" class="star ${isBFollowed(b.id) ? "on" : ""}" data-follow-b="${esc(b.id)}" aria-pressed="${isBFollowed(b.id)}" aria-label="${isBFollowed(b.id) ? B.unfollow : B.follow}: ${esc(b.nom)}">${isBFollowed(b.id) ? "★" : "☆"}</button>
    </article>`;
  }

  // Bandeau d'alertes qui défile : clôtures proches, ouvertures, relances à surveiller.
  function tickerHtml(list) {
    const B = br();
    const mine = new Set(state.user?.bourses_suivies || []);
    const items = [];
    for (const b of list) {
      const s = b.statut;
      let text = null;
      if (s.code === "cloture_proche") text = B.tick.cloture_proche(b.nom, s.jours);
      else if (s.code === "ouverte" && s.jours != null && s.jours <= 45) text = B.tick.ouverte(b.nom, bFmt(s.cloture));
      else if (s.code === "a_venir" && s.jours <= 30) text = B.tick.a_venir(b.nom, s.jours);
      else if (s.code === "expiree" && s.jours >= -45) text = B.tick.expiree(b.nom, bRelance(s.relance));
      if (text) items.push({ id: b.id, text, rank: (mine.has(b.id) ? 0 : 10) + { cloture_proche: 0, ouverte: 1, a_venir: 2, expiree: 3 }[s.code] });
    }
    items.sort((a, c) => a.rank - c.rank);
    if (!items.length) return "";
    const btns = items.slice(0, 14).map((i) => `<button type="button" class="tick" data-open-b="${esc(i.id)}">${esc(i.text)}</button>`).join("");
    return `<section class="ticker" aria-label="${B.tickerTitle}"><div class="ticker-track">${btns}</div></section>`;
  }

  function bScamCard() {
    const B = br();
    return `<article class="card scam"><h3>${I.info} ${B.scamTitle}</h3><ul class="clean">${B.scam.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></article>`;
  }

  function viewBourses() {
    const B = br();
    if (!state.bourses) {
      loadBourses();
      return `<div><span class="eyebrow">${t().section}</span><h1>${B.title}</h1></div><p class="muted">…</p>`;
    }
    if (state.bFicheId) return viewBFiche(state.bFicheId);
    if (state.tab === "bfind") return viewBFind();
    if (state.tab === "bguide") return viewBGuide();
    if (state.tab === "bcal") return viewBCal();
    if (state.tab === "bfollow") return viewBFollow();
    return viewBHome();
  }

  // Bandeau « abonnez-vous » : discret, jamais bloquant.
  function bUnlockBanner() {
    const B = br();
    if (premium()) return "";
    return `<section class="card unlock-banner"><div>${I.lock}<span><b>${B.unlockBanner}</b><span class="small muted">${B.unlockBannerSub}</span></span></div><button type="button" class="btn btn-sun" data-bunlock>${B.lock.cta}</button></section>`;
  }

  function viewBHome() {
    const B = br();
    const all = state.bourses;
    if (!all.length) return `<div><span class="eyebrow">${t().section}</span><h1>${B.title}</h1></div><div class="notice">${I.info}<span>${B.empty}</span></div>`;
    const pref = bPref();
    const active = (b) => ["cloture_proche", "ouverte", "a_venir", "attendue"].includes(b.statut.code);
    const mineList = !serieInfo() && (pref.branche || pref.niveau) ? filterB(all.filter(active), { branche: pref.branche, domaine: pref.domaine, niveau: pref.niveau }).slice(0, 4) : [];
    const closing = all.filter((b) => b.statut.code === "cloture_proche" || (b.statut.code === "ouverte" && b.statut.jours != null && b.statut.jours <= 45)).slice(0, 6);
    const shown = new Set(closing.map((b) => b.id));
    const opened = all.filter((b) => b.statut.code === "ouverte" && !shown.has(b.id)).slice(0, 6);
    const soon = all.filter((b) => b.statut.code === "a_venir").slice(0, 4);
    const countries = [...new Set(all.flatMap((b) => b.pays_accueil))].filter((c) => c !== "Plusieurs pays");
    const une = all.filter((b) => b.vedette).sort((a, c) => (a.statut.code === "expiree") - (c.statut.code === "expiree")).slice(0, 10);
    const block = (title, sub, list) => (list.length ? `<section class="orient-group"><h2>${title}</h2>${sub ? `<p class="small muted">${sub}</p>` : ""}<div class="results">${list.map(cardB).join("")}</div></section>` : "");
    const branchCard = (k) => `<button type="button" class="section-card" data-bbranche="${k}"><span class="section-flag">${k === "sciences" ? "Sc" : "Ar"}</span><span><b>${esc(B.branches[k])}</b><span class="small muted">${esc(B.branchSub[k])}</span></span>${I.chevron}</button>`;
    const typeTile = (k) => {
      const n = filterB(all, { type: k }).length;
      return `<button type="button" class="tile" data-btype="${k}"><b>${esc(B.types[k])}</b><span class="small muted">${esc(B.typeSub[k])}</span><span class="tile-n">${n}</span></button>`;
    };
    return `
      <div class="section-head"><div><span class="eyebrow">${t().section}</span><h1>${B.title}</h1></div><p class="muted small">${B.stat(all.length, countries.length)}</p></div>
      ${tickerHtml(all)}
      ${bSearchForm("")}
      ${bSerieCard()}
      ${block(B.forYouSerie, B.forYouSerieSub, forSerie(all).slice(0, 6))}
      <section class="card"><h2>${B.chooseBranch}</h2><p class="muted small">${B.chooseBranchSub}</p>
        <div class="branch-pick">${branchCard("sciences")}${branchCard("lettres")}</div></section>
      ${bUnlockBanner()}
      ${une.length ? `<section class="orient-group"><h2>${B.une}</h2><p class="small muted">${B.uneSub}</p><div class="hscroll">${une.map(cardB).join("")}</div></section>` : ""}
      <section class="orient-group"><h2>${B.byType}</h2><p class="small muted">${B.byTypeSub}</p><div class="tiles">${["complete", "gouvernementale", "universitaire", "fondation"].map(typeTile).join("")}</div></section>
      <section class="orient-group"><h2>${B.byCountry}</h2><div class="chips" role="group">${countries
        .map((c) => [c, all.filter((b) => b.pays_accueil.includes(c)).length])
        .sort((a, c) => c[1] - a[1])
        .map(([c, n]) => `<button type="button" class="chip" data-bpays-go="${esc(c)}">${esc(c)} <span class="muted">${n}</span></button>`)
        .join("")}</div></section>
      ${block(B.forYou, B.forYouSub, mineList)}
      ${block(B.closingSoon, "", closing)}
      ${block(B.opened, "", opened)}
      ${block(B.soon, "", soon)}
      ${bScamCard()}`;
  }

  function viewBFind() {
    const B = br();
    if (state.bf.branche === undefined && serieInfo()) state.bf = { ...state.bf, branche: serieInfo()[0] }; // la série du compte fixe la branche
    const f = bState();
    if (f.branche === undefined) {
      const card = (k, label, sub) => `<button type="button" class="section-card" data-bbranche="${k}"><span class="section-flag">${k === "sciences" ? "Sc" : k === "lettres" ? "Ar" : "★"}</span><span><b>${esc(label)}</b><span class="small muted">${esc(sub)}</span></span>${I.chevron}</button>`;
      return `<div><span class="eyebrow">${t().section}</span><h1>${B.chooseBranch}</h1></div><p class="muted">${B.chooseBranchSub}</p>
        <div style="display:grid;gap:12px;max-width:560px">${card("sciences", B.branches.sciences, B.branchSub.sciences)}${card("lettres", B.branches.lettres, B.branchSub.lettres)}${card("", B.allBranches, "")}</div>${bScamCard()}`;
    }
    const domains = f.branche ? BRANCH_DOMAINS[f.branche] : Object.values(BRANCH_DOMAINS).flat();
    const chip = (attr, val, label, on) => `<button type="button" class="chip" data-${attr}="${esc(val)}" aria-pressed="${on}">${esc(label)}</button>`;
    const flt = { ...f, type: state.bf.type || "", pays: state.bf.pays || "", q: state.bf.q || "" };
    const list = filterB(state.bourses, flt);
    const active = list.filter((b) => b.statut.code !== "expiree");
    const expired = list.filter((b) => b.statut.code === "expiree");
    const limit = state.bf.n || 30;
    const countries = [...new Set(state.bourses.flatMap((b) => b.pays_accueil))].sort((a, c) => state.bourses.filter((b) => b.pays_accueil.includes(c)).length < state.bourses.filter((b) => b.pays_accueil.includes(a)).length ? 1 : -1);
    const page = (arr) => arr.slice(0, limit);
    const rest = Math.max(active.length - limit, 0);
    return `
      <div class="row-actions"><div><span class="eyebrow">${t().section}</span><h1>${f.branche ? B.branches[f.branche] : B.allBranches}</h1></div>
        <button type="button" class="btn btn-ghost btn-small" data-bchange>${B.changeBranch}</button></div>
      ${bSearchForm(state.bf.q)}
      ${state.bf.q ? `<p class="small">${esc(B.searchFor(state.bf.q))} <button type="button" class="linkish" data-bclearq>${B.clearSearch}</button></p>` : ""}
      <div class="chips" role="group" aria-label="${B.cond.domains}">${chip("bdomaine", "", B.allDomains, !f.domaine)}${domains.map((d) => chip("bdomaine", d, B.domains[d], f.domaine === d)).join("")}</div>
      <div class="chips" role="group" aria-label="${B.cond.levels}">${chip("bniveau", "", B.allLevels, !f.niveau)}${["licence", "master", "doctorat", "postdoc"].map((l) => chip("bniveau", l, B.levels[l], f.niveau === l)).join("")}</div>
      <div class="chips" role="group" aria-label="${B.typeLabel}">${chip("btype", "", B.allTypes, !flt.type)}${["complete", "gouvernementale", "universitaire", "fondation"].map((k) => chip("btype", k, B.types[k], flt.type === k)).join("")}</div>
      <div class="chips" role="group" aria-label="${B.countryLabel}">${chip("bpays", "", B.allCountries, !flt.pays)}${countries.map((c) => chip("bpays", c, c, flt.pays === c)).join("")}</div>
      <p class="small muted">${B.results(list.length)}</p>
      ${active.length ? `<div class="results">${page(active).map(cardB).join("")}</div>` : `<div class="notice">${I.info}<span>${B.noResults}</span></div>`}
      ${rest ? `<button type="button" class="btn btn-ghost" data-bmore>${B.more(rest)}</button>` : ""}
      ${expired.length ? `<details class="fold"><summary><b>${B.expired}</b> <span class="muted">${expired.length}</span></summary><div class="results">${expired.slice(0, 60).map(cardB).join("")}</div></details>` : ""}
      ${bUnlockBanner()}
      ${bScamCard()}`;
  }

  // Mois couverts par la fenêtre d'ouverture d'une bourse (confirmée, ou probable d'après le cycle).
  function windowMonths(b) {
    const e = b.edition || {};
    const span = (a, z) => {
      const out = [];
      for (let m = a, k = 0; k < 12; k++, m = (m % 12) + 1) {
        out.push(m);
        if (m === z) break;
      }
      return out;
    };
    if (b.statut.code !== "expiree" && e.ouverture && e.cloture && !b.statut.probable) return { months: span(Number(e.ouverture.slice(5, 7)), Number(e.cloture.slice(5, 7))), probable: false };
    const o = b.cycle?.mois?.ouverture || [];
    const c = b.cycle?.mois?.cloture || [];
    if (o.length) return { months: span(o[0], (c.length ? c[c.length - 1] : o[o.length - 1])), probable: true };
    if (c.length) return { months: [c[c.length - 1]], probable: true }; // seul le mois de clôture habituel est connu
    if (e.ouverture && e.cloture) return { months: span(Number(e.ouverture.slice(5, 7)), Number(e.cloture.slice(5, 7))), probable: true };
    return null;
  }

  function viewBCal() {
    const B = br();
    const C = cal();
    const month = new Date().getMonth() + 1;
    const rows = state.bourses
      .filter((b) => b.statut.code !== "expiree" || isBFollowed(b.id) || b.vedette) // 300+ lignes illisibles : l'actif, le suivi et la une
      .slice(0, 120)
      .map((b) => ({ b, w: windowMonths(b) }))
      .filter((x) => x.w)
      .map(({ b, w }) => {
        const cells = C.months
          .map((_, i) => `<td class="${i + 1 === month ? "cur" : ""}">${w.months.includes(i + 1) ? `<i class="ph ${w.probable ? "ph-bprob" : "ph-bopen"}" title="${w.probable ? B.calProbable : B.calOpen}"></i>` : ""}</td>`)
          .join("");
        return `<tr class="${b.statut.code === "expiree" ? "pause" : ""}"><th class="sticky"><div class="cal-name"><button type="button" class="linkish" data-open-b="${esc(b.id)}">${esc(b.nom.length > 22 ? b.nom.slice(0, 21) + "…" : b.nom)}</button>
          <button type="button" class="star ${isBFollowed(b.id) ? "on" : ""}" data-follow-b="${esc(b.id)}" aria-pressed="${isBFollowed(b.id)}" aria-label="${B.follow}: ${esc(b.nom)}">${isBFollowed(b.id) ? "★" : "☆"}</button></div></th>${cells}</tr>`;
      })
      .join("");
    const now = state.bourses.filter((b) => ["cloture_proche", "ouverte"].includes(b.statut.code));
    return `<div><span class="eyebrow">${t().section}</span><h1>${B.calTitle}</h1></div><p class="muted">${B.calSub}</p>
      <section class="orient-group"><h2>${B.thisMonth}</h2>${now.length ? `<div class="results">${now.map(cardB).join("")}</div>` : `<p class="muted">${C.noneThisMonth}</p>`}</section>
      <section class="orient-group"><div class="legend"><span class="legend-item"><i class="ph ph-bopen"></i>${B.calOpen}</span><span class="legend-item"><i class="ph ph-bprob"></i>${B.calProbable}</span></div>
        <div class="table-wrap cal-wrap"><table class="cal"><thead><tr><th class="sticky">${B.title}</th>${C.months.map((m, i) => `<th class="${i + 1 === month ? "cur" : ""}">${m}</th>`).join("")}</tr></thead><tbody>${rows}</tbody></table></div></section>`;
  }

  function viewBFollow() {
    const B = br();
    const mine = state.bourses.filter((b) => isBFollowed(b.id));
    const pref = bPref();
    const opt = (v, label, cur) => `<option value="${esc(v)}" ${(cur || "") === v ? "selected" : ""}>${esc(label)}</option>`;
    const domainList = pref.branche ? BRANCH_DOMAINS[pref.branche] : Object.values(BRANCH_DOMAINS).flat();
    return `<div><span class="eyebrow">${t().section}</span><h1>${B.followTitle}</h1></div>
      ${mine.length ? `<div class="results">${mine.map(cardB).join("")}</div><p class="small muted">${B.followHelp(3)}</p>` : `<div class="notice">${I.info}<span>${B.followEmpty}</span></div>`}
      <form id="bpref-form" class="card form" novalidate>
        <div class="full"><h2>${B.mine}</h2><p class="muted small">${B.mineSub}</p></div>
        <div class="field"><label for="bp-b">${B.chooseBranch}</label><select id="bp-b" name="branche">${opt("", B.allBranches, pref.branche)}${opt("sciences", B.branches.sciences, pref.branche)}${opt("lettres", B.branches.lettres, pref.branche)}</select></div>
        <div class="field"><label for="bp-d">${B.cond.domains}</label><select id="bp-d" name="domaine">${opt("", B.allDomains, pref.domaine)}${domainList.map((d) => opt(d, B.domains[d], pref.domaine)).join("")}</select></div>
        <div class="field"><label for="bp-n">${B.cond.levels}</label><select id="bp-n" name="niveau">${opt("", B.allLevels, pref.niveau)}${["licence", "master", "doctorat", "postdoc"].map((l) => opt(l, B.levels[l], pref.niveau)).join("")}</select></div>
        <button class="btn btn-primary full" type="submit">${B.mine}</button></form>
      ${state.config.whatsapp_channel ? `<a class="btn btn-ghost" href="${esc(state.config.whatsapp_channel)}" target="_blank" rel="noopener noreferrer">${cal().whatsapp}</a>` : ""}`;
  }

  // Fiche détaillée : la liste est légère, le détail (et ce qui est verrouillé) vient du serveur à l'ouverture.
  async function loadBDetail(id) {
    state.bDetail = state.bDetail || {};
    if (state.bDetail[id] || state.bDetailLoading === id) return;
    state.bDetailLoading = id;
    try {
      state.bDetail[id] = (await api().bourse(id, lang())).bourse;
    } catch {
      state.bDetail[id] = {};
    }
    state.bDetailLoading = null;
    if (state.bFicheId === id) render();
  }

  function lockCard(title) {
    const B = br();
    return `<article class="card lockcard"><h3>${I.lock} ${esc(title)}</h3><div class="blur" aria-hidden="true"><i></i><i></i><i></i></div>
      <p class="small">${B.lock.block}</p><button type="button" class="btn btn-sun" data-bunlock>${B.lock.cta}</button></article>`;
  }

  function viewBFiche(id) {
    const B = br();
    const item = state.bourses.find((x) => x.id === id);
    if (!item) return `<button type="button" class="back" data-bback>${I.back} ${B.back}</button>`;
    loadBDetail(id);
    const d = state.bDetail?.[id];
    const b = { ...item, ...(d && d.id ? d : {}) };
    const loaded = Boolean(d && d.id);
    const row = (k, v) => (v ? `<div><dt>${k}</dt><dd>${v}</dd></div>` : "");
    const c = b.conditions || {};
    const e = b.edition || {};
    const locked = b.verrou;
    const share = `https://wa.me/?text=${encodeURIComponent(B.shareText(b.nom, location.origin))}`;
    const dated = ["cloture_proche", "ouverte", "a_venir"].includes(b.statut.code) && b.statut.probable && !b.statut.permanente;
    return `<button type="button" class="back" data-bback>${I.back} ${B.back}</button>
      <div class="row-actions"><div style="min-width:0"><span class="eyebrow">${esc(b.organisme || "")}</span><h1>${esc(b.nom)}</h1></div>${`<button type="button" class="btn btn-ghost btn-small follow ${isBFollowed(b.id) ? "on" : ""}" data-follow-b="${esc(b.id)}" aria-pressed="${isBFollowed(b.id)}">${isBFollowed(b.id) ? "★ " + B.followed : "☆ " + B.follow}</button>`}</div>
      <div class="bstatus">${statusTag(b)}<b>${esc(statusLine(b))}</b>${dated ? `<span class="tag tag-line">${B.toConfirm}</span>` : ""}${b.origine ? `<span class="tag tag-line">${esc(B.origins[b.origine])}</span>` : ""}${!locked && b.apercu_gratuit && !premium() ? `<span class="tag tag-green">${B.lock.free}</span>` : ""}</div>
      ${b.alerte ? `<div class="notice alert-card">${I.info}<span><b>${B.alert}.</b> ${esc(b.alerte)}</span></div>` : ""}
      <div class="fiche"><div style="display:grid;gap:16px;min-width:0">
        ${b.resume || b.resume_long ? `<article class="card"><h3>${B.sections.resume}</h3><p>${esc(locked ? b.resume : b.resume_long || b.resume)}</p></article>` : ""}
        <article class="card"><h3>${B.sections.coverage}</h3><p><span class="tag tag-green">${B.coverage[b.couverture.niveau]}</span></p>
          ${b.valeur ? `<p><b>${B.valueLabel} :</b> ${esc(b.valeur)}</p>` : ""}
          ${!locked && b.couverture.detail ? `<p>${esc(b.couverture.detail)}</p>` : ""}
          ${!locked && b.ne_couvre_pas ? `<p class="small muted"><b>${B.notCovered} :</b> ${esc(b.ne_couvre_pas)}</p>` : ""}
          ${!locked && b.cout_candidature ? `<p class="small muted"><b>${B.costLabel} :</b> ${esc(b.cout_candidature)}</p>` : ""}</article>
        <article class="card"><h3>${B.sections.conditions}</h3><dl class="kv">
          ${row(B.eligLabel, esc(b.eligibilite || ""))}
          ${row(B.cond.levels, esc(b.niveaux.map((x) => B.levels[x]).join(", ")))}
          ${row(B.cond.domains, esc((b.domaines.includes("tous") ? [B.domains.tous] : b.domaines.map((x) => B.domains[x])).join(", ")))}
          ${row(B.cond.countries, esc(b.pays_accueil.join(", ")))}
          ${row(B.cond.age, c.age_max != null ? esc(B.years(c.age_max)) : "")}
          ${row(B.cond.diploma, esc(c.diplome || ""))}
          ${row(B.cond.language, esc(c.langue || ""))}
          ${(c.autres || []).length ? row(B.cond.other, `<ul class="clean">${c.autres.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>`) : ""}
        </dl><p class="small"><span class="tag ${b.cameroun === "oui" ? "tag-green" : "tag-sun"}">${B.cameroon[b.cameroun] || B.cameroon.non_precise}</span></p></article>
        ${loaded ? (locked ? lockCard(B.sections.dossier) : (b.dossier || []).length ? `<article class="card"><h3>${B.sections.dossier}</h3><ul class="clean">${b.dossier.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></article>` : "") : ""}
        ${loaded ? (locked ? lockCard(B.sections.advice) : b.conseil ? `<article class="card"><h3>${B.sections.advice}</h3><p>${esc(b.conseil)}</p></article>` : "") : ""}
      </div>
      <aside class="card" style="min-width:0"><h3>${B.sections.dates}</h3><dl class="kv">
        ${row(B.edition, esc(e.libelle || ""))}
        ${e.permanente ? row(B.opening, B.permanent) : row(B.opening, e.ouverture ? esc(bFmt(e.ouverture)) : B.notAnnounced)}
        ${e.permanente ? "" : row(B.closing, e.cloture ? esc(bFmt(e.cloture)) : B.notAnnounced)}
        ${b.cycle?.ouverture_mois ? row(cal().probable, esc(b.cycle.ouverture_mois)) : b.cycle?.cloture_mois ? row(B.usualClosing, esc(b.cycle.cloture_mois)) : ""}
      </dl>${e.note ? `<p class="small">${esc(e.note)}</p>` : ""}
        <div class="notice">${I.info}<span class="small">${B.unverified}</span></div>
        ${loaded && !locked && b.lien_officiel ? `<a class="btn btn-primary btn-block" href="${esc(b.lien_officiel)}" target="_blank" rel="noopener noreferrer">${B.official}</a>` : ""}
        ${locked && b.a_lien ? `<button type="button" class="btn btn-sun btn-block" data-bunlock>${I.lock} ${B.lock.linkLocked}</button><p class="small muted">${B.lock.honest}</p>` : ""}
        <a class="btn btn-ghost btn-block" href="${share}" target="_blank" rel="noopener noreferrer">${B.share}</a>
        ${!locked && (b.sources || []).length ? `<details class="sources"><summary class="small">${B.sections.sources} (${b.sources.length})</summary><ul class="clean small">${b.sources.map((x) => `<li>${x.url ? `<a href="${esc(x.url)}" target="_blank" rel="noopener noreferrer">${esc(x.titre || x.url)}</a>` : esc(x.titre)}</li>`).join("")}</ul></details>` : ""}
        ${b.last_verified ? `<p class="small muted">${B.lastChecked(dateFmt(b.last_verified + "T12:00:00Z"))}</p>` : ""}</aside></div>
      ${bScamCard()}`;
  }

  // ---------- Bourses : conseils et modèles ----------
  async function loadConseils() {
    if (state.conseilsLoading) return;
    state.conseilsLoading = true;
    try {
      state.conseils = (await api().conseils(lang())).conseils;
    } catch {
      state.conseils = [];
    }
    state.conseilsLoading = false;
    render();
  }

  async function openConseil(id) {
    state.conseilId = id;
    state.conseilBody = null;
    render();
    window.scrollTo({ top: 0 });
    try {
      state.conseilBody = (await api().conseil(id, lang())).conseil;
    } catch (err) {
      state.conseilBody = { error: err.message };
    }
    render();
  }

  function viewBGuide() {
    const B = br();
    if (!state.conseils) {
      loadConseils();
      return `<div><span class="eyebrow">${t().section}</span><h1>${B.guideTitle}</h1></div><p class="muted">…</p>`;
    }
    if (state.conseilId) {
      const a = state.conseils.find((x) => x.id === state.conseilId);
      const body = state.conseilBody;
      const sections = (body?.sections || [])
        .map((sc) => `<article class="card">${sc.h ? `<h3>${esc(sc.h)}</h3>` : ""}${(sc.p || []).map((x) => `<p>${esc(x)}</p>`).join("")}${(sc.liste || []).length ? `<ul class="clean">${sc.liste.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : ""}</article>`)
        .join("");
      return `<button type="button" class="back" data-conseil-back>${I.back} ${B.guideBack}</button>
        <div><span class="eyebrow">${esc(B.guideCats[a?.categorie] || "")}</span><h1>${esc(a?.titre || "")}</h1></div>
        ${!body ? `<p class="muted">…</p>` : body.error || body.verrou ? lockCard(a?.titre || B.guideTitle) : sections}
        ${bScamCard()}`;
    }
    if (!state.conseils.length) return `<div><span class="eyebrow">${t().section}</span><h1>${B.guideTitle}</h1></div><div class="notice">${I.info}<span>${B.guideEmpty}</span></div>`;
    const cats = Object.keys(B.guideCats).filter((k) => state.conseils.some((x) => x.categorie === k));
    const card = (a) => `<article class="card bcard"><button type="button" class="bcard-main" data-conseil="${esc(a.id)}"><span class="row-actions" style="justify-content:flex-start;gap:6px"><span class="tag ${a.gratuit ? "tag-green" : "tag-line"}">${a.gratuit ? B.guideFree : B.guideLocked}</span>${a.gratuit || premium() ? "" : `<span class="lock-pill">${I.lock}${B.lock.pill}</span>`}</span><b>${esc(a.titre)}</b><span class="small muted">${esc(a.resume || "")}</span></button></article>`;
    return `<div class="section-head"><div><span class="eyebrow">${t().section}</span><h1>${B.guideTitle}</h1></div><p class="muted small">${B.guideSub}</p></div>
      ${bUnlockBanner()}
      ${cats.map((k) => `<section class="orient-group"><h2>${B.guideCats[k]}</h2><div class="results">${state.conseils.filter((x) => x.categorie === k).map(card).join("")}</div></section>`).join("")}
      ${bScamCard()}`;
  }

  // ---------- Entraînement ----------
  const themeName = (k) => qz().themes[k] || k;
  const dayUTC = (offset = 0) => new Date(Date.now() + offset * 86400000).toISOString().slice(0, 10);

  async function loadQuizHome() {
    if (state.qzLoading) return;
    state.qzLoading = true;
    try {
      state.qzStats = await api().quizStats();
      if (state.qzStats.daily_done) state.qzDaily = await api().quizDaily(lang());
    } catch (e) {
      state.qzStats = { error: e.message, themes: {}, bank: {}, days: [] };
    }
    state.qzLoading = false;
    render();
  }

  function viewQuiz() {
    const Q = qz();
    const L = t();
    if (state.play) return state.play.finished ? viewQuizResult() : state.play.mode === "blanc" ? viewBlanc() : viewQuestion();
    if (state.qzView === "plan") return viewPlan();
    if (state.demo) return `<div class="notice">${I.info}<span>${esc(L.demoNotice || "")}</span></div>`;
    if (!state.qzStats) {
      loadQuizHome();
      return `<div><span class="eyebrow">${L.section}</span><h1>${Q.title}</h1></div><p class="muted">…</p>`;
    }
    const st = state.qzStats;
    if (st.error) return `<div><h1>${Q.title}</h1></div><div class="notice">${I.info}<span>${esc(st.error)}</span></div>`;
    const lock = (txt) => (premium() ? "" : `<span class="lock-pill">${I.lock}${txt}</span>`);
    const daily = st.daily_done
      ? `<p class="ok">${Q.doneToday(st.daily_score ?? state.qzDaily?.score ?? 0, 5)}</p><p class="small muted">${Q.comeBack}</p><button type="button" class="btn btn-ghost" data-quiz-daily>${Q.seeAnswers}</button>`
      : `<button type="button" class="btn btn-primary" data-quiz-daily>${Q.start}</button>`;
    const themes = Object.keys(st.bank).sort();
    const chips = [["", Q.allThemes], ...themes.map((k) => [k, themeName(k)])]
      .map(([k, label]) => `<button type="button" class="chip" data-series-theme="${k}" aria-pressed="${(state.seriesTheme || "") === k}">${esc(label)}</button>`)
      .join("");
    const sizes = [10, 20, 40].map((k) => `<button type="button" class="chip" data-series-n="${k}" aria-pressed="${(state.seriesN || 10) === k}">${k}</button>`).join("");
    const rows = Object.keys(st.bank)
      .map((k) => {
        const s = st.themes[k] || { ok: 0, ko: 0 };
        const total = s.ok + s.ko;
        return { k, total, pct: total ? Math.round((s.ok / total) * 100) : null, ok: s.ok };
      })
      .sort((a, b) => (a.pct ?? 101) - (b.pct ?? 101) || a.k.localeCompare(b.k))
      .sort((a, b) => (a.total ? 0 : 1) - (b.total ? 0 : 1));
    const bars = rows
      .map((r) => `<div class="theme-row"><span>${esc(themeName(r.k))}</span><span class="bar"><i class="${r.pct == null ? "" : r.pct < 50 ? "low" : r.pct < 75 ? "mid" : "high"}" style="width:${r.pct ?? 0}%"></i></span><span class="small muted">${r.pct == null ? Q.notTried : `${r.ok}/${r.total} · ${r.pct} %`}</span></div>`)
      .join("");
    const active = new Set(st.days);
    const dots = Array.from({ length: 30 }, (_, i) => dayUTC(i - 29)).map((d) => `<i class="dot ${active.has(d) ? "on" : ""}" title="${d}"></i>`).join("");
    return `
      <div class="section-head"><div><span class="eyebrow">${L.section}</span><h1>${Q.title}</h1></div><p class="muted small">${Q.sub}</p></div>
      ${planCard()}
      <section class="card"><div class="row-actions"><h2>${Q.daily}</h2><span class="tag ${st.streak ? "tag-sun" : "tag-line"}">${Q.streak(st.streak)}</span></div>
        <p class="muted">${Q.dailySub}</p>${daily}</section>
      <section class="card"><h2>${Q.revision}</h2><p class="muted small">${Q.revSub}</p>
        <p><b>${Q.revDue(st.due)}</b><br><span class="small muted">${Q.carnet(st.carnet)}</span></p>
        ${st.due ? `<button type="button" class="btn btn-primary" data-quiz-revision>${Q.revStart}</button>` : ""}</section>
      <section class="card"><div class="row-actions"><h2>${Q.series}</h2>${lock(Q.locked)}</div><p class="muted small">${Q.seriesSub}</p>
        <div class="chips" role="group">${chips}</div><div class="chips" role="group">${sizes}</div>
        <div><button type="button" class="btn btn-primary" data-quiz-series>${Q.launch}</button></div></section>
      <section class="card"><div class="row-actions"><h2>${Q.blanc}</h2>${lock(Q.locked)}</div><p class="muted">${Q.blancSub}</p>
        <div><button type="button" class="btn btn-primary" data-quiz-blanc>${Q.blancStart}</button></div></section>
      <section class="card"><h2>${Q.prep}</h2><p class="muted small">${Q.prepSub}</p>
        ${rows.some((r) => r.total) ? `<div class="theme-rows">${bars}</div>` : `<p class="muted">${Q.noStats}</p>`}
        <p class="small muted">${Q.last30}</p><div class="dots">${dots}</div></section>`;
  }

  function planCard() {
    const P = pl();
    const info = state.plan;
    if (!info) {
      loadPlan();
      return "";
    }
    if (!info.plan || info.expired) {
      return `<section class="card"><h2>${P.cta}</h2><p class="muted">${info.expired ? P.expired : P.ctaSub}</p><div><button type="button" class="btn btn-primary" data-plan-open>${P.create}</button></div></section>`;
    }
    const c = concoursById(info.plan.concours);
    return `<section class="card"><div class="row-actions"><h2>${P.title} · ${esc(c?.sigle || "")}</h2><span class="tag tag-sun">${P.daysLeft(info.built.days_left)}</span></div>
      <p class="muted small">${P.modes[info.built.mode]}</p><div><button type="button" class="btn btn-primary" data-plan-open>${P.open}</button></div></section>`;
  }

  async function loadPlan() {
    if (state.planLoading) return;
    state.planLoading = true;
    try {
      state.plan = await api().plan();
    } catch {
      state.plan = { plan: null };
    }
    state.planLoading = false;
    render();
  }

  function planForm() {
    const P = pl();
    const cur = state.plan?.plan || {};
    const mine = state.user.suivis || [];
    const list = [...state.catalog.concours].sort((a, b) => (mine.includes(a.id) ? 0 : 1000) + (a.priorite || 999) - ((mine.includes(b.id) ? 0 : 1000) + (b.priorite || 999)));
    const tomorrow = dayUTC(1);
    return `<form id="plan-form" class="card form" novalidate>
      <div class="field full"><label for="pl-c">${P.formConcours}</label><select id="pl-c" name="concours" required>${list.map((c) => `<option value="${esc(c.id)}" ${c.id === cur.concours ? "selected" : ""}>${esc(c.sigle)} · ${esc(c.nom.slice(0, 60))}</option>`).join("")}</select></div>
      <div class="field full"><label for="pl-d">${P.formDate}</label><input id="pl-d" name="date" type="date" min="${tomorrow}" value="${esc(cur.date || "")}" required><span class="small muted">${P.formDateHelp}</span></div>
      <fieldset class="field full interests"><legend>${P.formHours}</legend><div class="picks">${[3, 5, 8, 12].map((h) => `<label class="pick"><input type="radio" name="hours" value="${h}" ${(cur.hours || 5) === h ? "checked" : ""}><span>${P.hoursLabel(h)}</span></label>`).join("")}</div></fieldset>
      <p class="err full" id="plan-err" hidden></p>
      <button class="btn btn-primary btn-block full" type="submit">${P.create}</button></form>`;
  }

  function viewPlan() {
    const P = pl();
    const Q = qz();
    const back = `<button type="button" class="back" data-plan-back>${I.back} ${Q.title}</button>`;
    const info = state.plan;
    if (!info) {
      loadPlan();
      return back + `<p class="muted">…</p>`;
    }
    if (!info.plan || info.expired || state.planEdit) return `${back}<div><span class="eyebrow">${t().section}</span><h1>${P.title}</h1></div>${info.expired ? `<div class="notice">${I.info}<span>${P.expired}</span></div>` : ""}${planForm()}`;
    const b = info.built;
    const c = concoursById(info.plan.concours);
    const today = dayUTC();
    const dayName = (d) => `${P.weekdays[new Date(d + "T12:00:00Z").getUTCDay()]} ${dateFmt(d + "T12:00:00Z").replace(/ \d{4}$/, "")}`;
    const label = (x) => {
      if (x.kind === "quiz_theme") return P.kinds.quiz_theme(themeName(x.theme));
      if (x.kind === "epreuve") return P.kinds.epreuve(epreuveMeta(x.epreuve)?.matiere || "");
      return P.kinds[x.kind];
    };
    const startBtn = (x) => `<button type="button" class="btn btn-ghost btn-small" data-plan-start="${x.kind}" data-theme="${esc(x.theme || "")}" data-epreuve="${esc(x.epreuve || "")}">${P.go}</button>`;
    const week = b.weeks.find((w) => w.from <= today && today <= w.to) || b.weeks[0];
    const todays = week.sessions.filter((x) => x.day === today);
    const st = state.qzStats;
    const todayHtml = `<section class="card"><h2>${P.today}</h2><div class="paper-list">
      <div class="paper-row static"><span>${st?.daily_done ? P.dailyDone : P.dailyTask}</span>${st?.daily_done ? "✓" : `<button type="button" class="btn btn-ghost btn-small" data-quiz-daily-from-plan>${P.go}</button>`}</div>
      ${st?.due ? `<div class="paper-row static"><span>${P.revTask(st.due)}</span><button type="button" class="btn btn-ghost btn-small" data-plan-start="revision">${P.go}</button></div>` : ""}
      ${todays.map((x) => `<div class="paper-row static"><span>${esc(label(x))}</span>${startBtn(x)}</div>`).join("")}
      </div>${todays.length ? "" : `<p class="small muted">${P.restDay}</p>`}</section>`;
    const weeksHtml = b.weeks
      .map((w) => {
        const current = w === week;
        const days = {};
        for (const x of w.sessions) (days[x.day] ||= []).push(x);
        const inner = w.locked
          ? `<p class="small muted">${I.lock} ${P.locked}</p>`
          : Object.entries(days).map(([d, list]) => `<div class="plan-day ${d === today ? "today" : ""}"><b>${esc(dayName(d))}</b><ul>${list.map((x) => `<li>${esc(label(x))}</li>`).join("")}</ul></div>`).join("");
        return `<details class="fold" ${current ? "open" : ""}><summary><b>${P.week(w.n)}</b> · ${esc(P.phases[w.phase])} <span class="muted small">${dateFmt(w.from + "T12:00:00Z")}</span></summary>
          <p class="small muted">${P.focus} : ${w.focus.map((k) => esc(themeName(k))).join(", ")}</p>${inner}</details>`;
      })
      .join("");
    const r = local.get("reminder", null) || { on: false, h: 18, m: 0 };
    const hhmm = `${String(r.h).padStart(2, "0")}:${String(r.m).padStart(2, "0")}`;
    const reminder = LN()
      ? `<section class="card"><h2>${P.reminder}</h2><p class="muted small">${P.reminderHelp}</p>
          <div class="row-actions"><input type="time" id="reminder-time" value="${hhmm}" aria-label="${P.reminder}">
          <button type="button" class="btn btn-primary btn-small" data-reminder="${r.on ? "off" : "on"}">${r.on ? P.reminderOff : P.reminderOn}</button></div>
          ${r.on ? `<p class="small ok">${P.reminderSet(hhmm)}</p>` : ""}</section>`
      : `<section class="card"><h2>${P.reminder}</h2><p class="muted small">${P.reminderWeb}</p></section>`;
    return `${back}
      <div class="row" style="display:flex;gap:14px;align-items:center;flex-wrap:wrap"><div class="${sigleClass(c)}">${esc(c?.sigle || "")}</div>
        <div style="min-width:0"><span class="eyebrow">${P.modes[b.mode]}</span><h1>${esc(c?.nom || "")}</h1></div></div>
      <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap"><span class="tag tag-sun">${P.daysLeft(b.days_left)}</span><span class="small muted">${dateFmt(info.plan.date + "T12:00:00Z")}</span>
        <button type="button" class="btn btn-ghost btn-small" data-plan-edit>${P.edit}</button><button type="button" class="btn btn-ghost btn-small" data-plan-remove>${P.remove}</button></div>
      ${todayHtml}
      ${b.weeks.some((w) => w.locked) ? `<div class="notice">${I.lock}<span><b>${P.locked}.</b> ${P.lockedSub} <button type="button" class="linkish" data-pay>${t().subscribe}</button></span></div>` : ""}
      <section class="orient-group">${weeksHtml}</section>
      ${reminder}`;
  }

  async function submitPlan(form) {
    const err = form.querySelector("#plan-err");
    const fd = new FormData(form);
    try {
      state.plan = await api().savePlan({ concours: fd.get("concours"), date: fd.get("date"), hours: Number(fd.get("hours")) });
      state.planEdit = false;
      state.qzView = "plan";
      toast(pl().saved);
      render();
    } catch (e) {
      err.textContent = e.message;
      err.hidden = false;
    }
  }

  // Lance une session : mode = daily | revision | series | blanc
  async function startQuiz(mode, opts = {}) {
    const Q = qz();
    try {
      let data;
      if (mode === "daily") data = await api().quizDaily(lang());
      else if (mode === "revision") data = await api().quizRevision(lang());
      else if (mode === "series") data = await api().quizSeries(state.seriesTheme || "", state.seriesN || 10, lang());
      else data = await api().quizBlanc(lang());
      if (!data.questions.length) return toast(Q.revDue(0));
      const play = { mode, questions: data.questions, i: 0, choice: {}, result: { ...(data.results || {}) }, finished: false };
      if (mode === "daily") {
        play.i = Math.max(0, data.questions.findIndex((q) => !play.result[q.id]));
        if (data.done) {
          play.finished = true;
        }
        for (const [id, r] of Object.entries(play.result)) play.choice[id] = r.choice;
      }
      if (mode === "blanc") play.endAt = Date.now() + data.duree * 60 * 1000;
      state.play = play;
      render();
      window.scrollTo({ top: 0 });
    } catch (e) {
      if (e.code === "locked") return openPaywall();
      toast(e.message);
    }
  }

  const playTitle = (mode) => ({ daily: qz().daily, revision: qz().revision, series: qz().series, blanc: qz().blanc })[mode];

  function viewQuestion() {
    const Q = qz();
    const pl = state.play;
    const q = pl.questions[pl.i];
    const r = pl.result[q.id];
    const opts = q.options
      .map((o, k) => {
        const cls = r ? (k === r.answer ? "good" : k === r.choice ? "bad" : "") : "";
        return `<button type="button" class="option ${cls}" data-pick="${k}" ${r ? "disabled" : ""}><span class="letter">${"ABCD"[k]}</span><span>${esc(o)}</span></button>`;
      })
      .join("");
    const last = pl.i === pl.questions.length - 1;
    const fb = r
      ? `<div class="feedback ${r.ok ? "ok" : "ko"}"><b>${r.ok ? Q.correct : Q.wrong}</b>${r.ok ? "" : ` ${Q.goodAnswer} : ${esc(q.options[r.answer])}.`}<p>${esc(r.explication)}</p>
          <div class="row-actions"><button type="button" class="btn btn-primary" data-quiz-next>${last ? Q.seeResult : Q.next}</button>
          <button type="button" class="linkish small" data-report-q="${esc(q.id)}">${Q.report}</button></div></div>`
      : "";
    return `
      <div class="row-actions"><span class="eyebrow">${playTitle(pl.mode)} · ${themeName(q.theme)}</span><button type="button" class="btn btn-ghost btn-small" data-quiz-leave>✕ ${Q.leave}</button></div>
      <div class="progress-line"><i style="width:${((pl.i + (r ? 1 : 0)) / pl.questions.length) * 100}%"></i></div>
      <article class="card protected question"><span class="small muted">${Q.qOf(pl.i + 1, pl.questions.length)}</span><h2>${esc(q.q)}</h2><div class="options">${opts}</div>${fb}</article>`;
  }

  function viewBlanc() {
    const Q = qz();
    const pl = state.play;
    const q = pl.questions[pl.i];
    const picked = pl.choice[q.id];
    const opts = q.options
      .map((o, k) => `<button type="button" class="option ${picked === k ? "picked" : ""}" data-pick="${k}"><span class="letter">${"ABCD"[k]}</span><span>${esc(o)}</span></button>`)
      .join("");
    const grid = pl.questions.map((x, k) => `<button type="button" class="qdot ${k === pl.i ? "cur" : ""} ${pl.choice[x.id] != null ? "done" : ""}" data-goto="${k}" aria-label="${k + 1}">${k + 1}</button>`).join("");
    return `
      <div class="exam-bar" data-bar><div><div class="small" style="opacity:.8;font-weight:700">${Q.timeLeft}</div><div class="timer" data-tick="blanc">${clock(pl.endAt - Date.now())}</div></div>
        <div class="progress" aria-hidden="true"><i data-tick="blanc-progress"></i></div>
        <button type="button" class="btn btn-sun" data-quiz-submit>${Q.submit}</button></div>
      <article class="card protected question"><span class="small muted">${Q.qOf(pl.i + 1, pl.questions.length)} · ${themeName(q.theme)}</span><h2>${esc(q.q)}</h2><div class="options">${opts}</div>
        <div class="row-actions"><button type="button" class="btn btn-ghost" data-quiz-prev ${pl.i === 0 ? "disabled" : ""}>${Q.prev}</button>
          <button type="button" class="btn btn-ghost" data-quiz-next ${pl.i === pl.questions.length - 1 ? "disabled" : ""}>${Q.next}</button></div></article>
      <div class="qdots">${grid}</div>`;
  }

  function viewQuizResult() {
    const Q = qz();
    const pl = state.play;
    const total = pl.questions.length;
    const good = pl.questions.filter((q) => pl.result[q.id]?.ok).length;
    const pct = Math.round((good / total) * 100);
    const wrong = pl.questions.filter((q) => !pl.result[q.id]?.ok);
    const review = wrong
      .map((q) => {
        const r = pl.result[q.id];
        const mine = r?.choice != null ? q.options[r.choice] : null;
        return `<article class="card protected review"><span class="small muted">${themeName(q.theme)}</span><b>${esc(q.q)}</b>
          <p class="small">${Q.yourAnswer} : <span class="bad-text">${mine ? esc(mine) : Q.unanswered}</span><br>${Q.goodAnswer} : <span class="good-text">${r ? esc(q.options[r.answer]) : "—"}</span></p>
          ${r ? `<p class="small muted">${esc(r.explication)}</p>` : ""}
          <button type="button" class="linkish small" data-report-q="${esc(q.id)}">${Q.report}</button></article>`;
      })
      .join("");
    return `<div><span class="eyebrow">${playTitle(pl.mode)}</span><h1>${Q.score}</h1></div>
      <section class="card" style="align-items:center;text-align:center"><div class="score-ring" style="--p:${pct}"><div><b>${good}</b><small>/${total}</small></div></div><p><b>${pct} %</b> · ${Q.verdict(pct)}</p></section>
      ${wrong.length ? `<h2>${Q.review} (${wrong.length})</h2><div style="display:grid;gap:12px">${review}</div>` : `<div class="notice">${I.info}<span>${Q.perfect}</span></div>`}
      <div><button type="button" class="btn btn-primary" data-quiz-back>${Q.back}</button></div>`;
  }

  async function quizPick(k) {
    const pl = state.play;
    const q = pl.questions[pl.i];
    if (pl.mode === "blanc") {
      pl.choice[q.id] = k;
      return render();
    }
    if (pl.result[q.id]) return;
    pl.choice[q.id] = k;
    try {
      const r = await api().quizCheck(pl.mode, [{ id: q.id, choice: k }]);
      pl.result[q.id] = r.results[0];
      state.qzStats = null; // les chiffres de l'accueil sont à rafraîchir
    } catch (e) {
      delete pl.choice[q.id];
      if (e.code === "locked") {
        state.play = null;
        return openPaywall();
      }
      toast(e.message);
    }
    render();
  }

  async function finishBlanc(auto) {
    const pl = state.play;
    if (pl.finished || pl.submitting) return;
    pl.submitting = true;
    if (auto) toast(qz().timeUp);
    try {
      const answers = Object.entries(pl.choice).map(([id, choice]) => ({ id, choice }));
      const r = answers.length ? await api().quizCheck("blanc", answers) : { results: [] };
      for (const x of r.results) pl.result[x.id] = x;
      pl.finished = true;
      state.qzStats = null;
    } catch (e) {
      toast(e.message);
    }
    pl.submitting = false;
    render();
  }

  function quizNext(delta) {
    const pl = state.play;
    const i = pl.i + delta;
    if (i >= pl.questions.length) {
      pl.finished = true;
      state.qzStats = null;
    } else if (i >= 0) pl.i = i;
    render();
    window.scrollTo({ top: 0 });
  }

  // ---------- Épreuves, corrigés, salle : école → sessions par année → épreuve ----------
  function canSee(e, mode) {
    if (mode === "corriges") return premium();
    if (mode === "salle") return premium();
    return premium() || state.user.free_id === e.id;
  }

  function viewBrowse(mode) {
    const L = t();
    const nav = state.nav[mode] || {};
    if (mode === "epreuves" || mode === "corriges") {
      if (nav.doc) return viewDoc(nav.doc, mode);
    }
    const intro = {
      epreuves: `<div class="section-head"><div><span class="eyebrow">${L.section}</span><h1>${L.epreuvesTitle}</h1></div><p class="muted small">${
        premium() ? L.epreuvesSub.premium : state.user.free_id ? L.epreuvesSub.free : L.epreuvesSub.none
      }</p></div>`,
      corriges: premium() ? `<div class="section-head"><div><span class="eyebrow">${L.section}</span><h1>${L.corrigesTitle}</h1></div><p class="muted small">${L.corrigesSub}</p></div>` : lockedIntro("corriges"),
      salle: premium() ? `<div class="section-head"><div><span class="eyebrow">${L.section}</span><h1>${L.roomTitle}</h1></div><p class="muted small">${L.roomSub}</p></div>${resultsHistory()}` : lockedIntro("salle"),
    }[mode];
    if (!nav.concours) {
      return intro + demoNotice() + `<p class="eyebrow">${L.chooseSchool}</p>` + schoolGroups(mode);
    }
    return viewSessions(concoursById(nav.concours), mode);
  }

  function viewSessions(c, mode) {
    const L = t();
    const eps = epreuvesOf(c.id);
    const official = eps.filter((e) => !e.exemple);
    const practice = eps.filter((e) => e.exemple);
    const years = [...new Set(official.map((e) => e.annee))].sort((a, b) => b - a);
    const groups = years.map((y) => [L.session(y), official.filter((e) => e.annee === y), ""]);
    if (practice.length) groups.push([L.practiceBlock, practice.sort((a, b) => b.annee - a.annee), L.practiceSub]);
    const blocks = groups
      .map(([label, list, sub]) => {
        const rows = list
          .map((e) => {
            const open = canSee(e, mode);
            const free = state.user.free_id === e.id && !premium() ? `<span class="tag tag-green">${L.offered}</span>` : "";
            const action = mode === "salle" ? `data-start="${e.id}"` : `data-doc="${e.id}" data-mode="${mode}"`;
            const right = open ? `<span class="muted">${hm(e.duree)}</span>${I.chevron}` : `<span class="lock-pill">${I.lock}${mode === "epreuves" && !state.user.free_id ? L.readFree : L.locked}</span>`;
            return `<button type="button" class="paper-row" ${action}>
                <span style="min-width:0"><b>${esc(e.matiere)}</b><span class="small muted">${hm(e.duree)}${e.exemple ? " · " + L.sampleTag + " " + e.annee : ""}</span></span>
                <span class="row">${free}${right}</span></button>`;
          })
          .join("");
        return `<section class="session"><div class="year-label">${esc(label)}</div>${sub ? `<p class="small muted">${esc(sub)}</p>` : ""}<div class="paper-list">${rows}</div></section>`;
      })
      .join("");
    return `
      <button type="button" class="back" data-back>${I.back} ${L.backTo(L.tabsLong[mode])}</button>
      <div class="row" style="display:flex;gap:14px;align-items:center;flex-wrap:wrap">
        <div class="${sigleClass(c)}">${esc(c.sigle)}</div>
        <div style="min-width:0"><span class="eyebrow">${esc(c.organisme)}</span><h1>${esc(c.nom)}</h1></div>
      </div>
      ${mode !== "epreuves" && !premium() ? lockedIntro(mode) : ""}
      ${blocks || `<div class="notice">${I.info}<span><b>${L.inProgressLong}.</b> ${L.noPapers}</span></div>`}`;
  }

  function viewDoc(id, mode) {
    const L = t();
    const meta = epreuveMeta(id);
    const c = concoursById(meta.concours);
    const key = `${mode}:${id}`;
    const doc = state.docCache[key];
    if (!doc) {
      loadDoc(id, mode);
      return `<button type="button" class="back" data-back>${I.back} ${esc(c.nom)}</button><p class="muted">…</p>`;
    }
    const isCorrige = mode === "corriges";
    return `
      <button type="button" class="back" data-back>${I.back} ${esc(c.nom)}</button>
      <div><span class="eyebrow">${esc(c.nom)} · ${meta.exemple ? L.practiceBlock : L.session(meta.annee)}</span>
        <h1>${isCorrige ? L.modelAnswer + " — " : ""}${esc(meta.matiere)}</h1></div>
      <div class="row" style="display:flex;gap:8px;flex-wrap:wrap">
        <span class="tag tag-line">${L.duration(hm(meta.duree))}</span>
        ${meta.exemple ? `<span class="tag tag-sun">${L.sampleTag}</span>` : ""}
        ${isCorrige ? sourceTag(doc) : ""}
      </div>
      ${meta.source || doc.source ? `<p class="small muted">${esc(t().sourceLabel)} : ${esc(doc.source || meta.source)}</p>` : ""}
      ${doc.a_verifier?.length ? `<div class="notice">${I.info}<span class="small"><b>${esc(t().toCheck)}</b> ${doc.a_verifier.map(esc).join(" · ")}</span></div>` : ""}
      ${isCorrige && doc.corrige_a_verifier?.length ? `<div class="notice">${I.info}<span class="small"><b>${esc(t().toCheckAnswer)}</b><br>${doc.corrige_a_verifier.map((x) => "• " + esc(x)).join("<br>")}</span></div>` : ""}
      ${protectedPaper(isCorrige ? doc.corrige : doc.sujet, isCorrige ? "" : "ruled")}
      ${isCorrige && gridItems(doc).length ? `<article class="card protected"><h3>${L.scale}</h3><p class="small muted">${L.gridHow}</p><div class="score-grid">${gridHtml(doc, null)}</div></article>` : ""}
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        ${
          isCorrige
            ? `<button type="button" class="btn btn-ghost" data-doc="${id}" data-mode="epreuves">${L.seeSujet}</button>`
            : `<button type="button" class="btn btn-primary" data-doc="${id}" data-mode="corriges">${premium() ? "" : I.lock + " "}${L.seeCorrige}</button>`
        }
        <button type="button" class="btn btn-ghost" data-start="${id}">${premium() ? "" : I.lock + " "}${L.composeRoom}</button>
        ${reportButton(id, isCorrige ? "corrige" : "sujet")}
      </div>`;
  }

  // Sujet ou corrigé affiché avec un filigrane au nom de l'élève (dissuasion et traçabilité).
  function protectedPaper(text, extra = "") {
    const mark = esc(t().watermark(state.user.email));
    return `<article class="paper protected ${extra}"><div class="watermark" aria-hidden="true">${Array.from({ length: 18 }, () => `<span>${mark}</span>`).join("")}</div><div class="paper-text">${esc(text)}</div></article>`;
  }

  const pending = new Set();
  async function loadDoc(id, mode) {
    const key = `${mode}:${id}`;
    if (pending.has(key)) return;
    pending.add(key);
    delete state.docError[key];
    try {
      state.docCache[key] = mode === "corriges" ? await api().corrige(id) : await api().sujet(id);
      if (mode === "epreuves" && !premium() && !state.user.free_id) state.user.free_id = id;
      render();
    } catch (e) {
      if (state.tab === "salle") {
        state.docError[key] = e.message;
        return render();
      }
      state.nav[mode] = { concours: epreuveMeta(id).concours };
      if (e.code === "locked") openPaywall();
      else toast(e.message);
      render();
    } finally {
      pending.delete(key);
    }
  }

  // ---------- Oral ----------
  function viewOral() {
    const L = t();
    const withOral = state.catalog.concours.filter((c) => c.oral && state.catalog.oral[c.id]);
    if (!withOral.length) return `<p class="muted">${L.noPapers}</p>`;
    const sel = withOral.find((c) => c.id === state.nav.oral?.concours) || withOral[0];
    const chips = withOral.map((c) => `<button type="button" class="chip" data-oral="${c.id}" aria-pressed="${sel.id === c.id}">${esc(c.sigle)}</button>`).join("");
    const full = state.oralCache[`${sel.id}:${lang()}`];
    if (premium() && !full) loadOral(sel.id);
    const detail = (o) => `<div class="fb-cols">
        <article class="card"><h3>${L.juryQuestions}</h3><ul class="clean">${o.questions.map((q) => `<li>${esc(q)}</li>`).join("")}</ul></article>
        <article class="card"><h3>${L.tips}</h3><ul class="clean">${o.conseils.map((q) => `<li>${esc(q)}</li>`).join("")}</ul></article></div>`;
    const placeholder = { questions: ["••••••••••••••••", "•••••••••••••••••••••", "••••••••••••"], conseils: ["•••••••••••••••••", "••••••••••••••"] };
    return `
      <div class="section-head"><div><span class="eyebrow">${L.section}</span><h1>${L.oralTitle}</h1></div><p class="muted small">${L.oralSub}</p></div>
      <div class="chips" role="group">${chips}</div>
      <article class="card"><span class="eyebrow">${esc(sel.nom)}</span><h2>${L.howOral}</h2><p>${esc(state.catalog.oral[sel.id].deroulement)}</p></article>
      ${
        premium()
          ? full
            ? `<div class="protected">${detail(full)}</div>`
            : `<p class="muted">…</p>`
          : `<div class="locked" style="border-radius:var(--radius)"><div class="blur">${detail(placeholder)}</div><div class="lock-overlay"><button type="button" class="lock-pill" data-pay style="border:0;cursor:pointer">${I.lock}${L.unlockOral}</button></div></div>`
      }`;
  }

  async function loadOral(cid) {
    const key = `${cid}:${lang()}`;
    if (state.oralCache[key] === null) return;
    state.oralCache[key] = null;
    try {
      state.oralCache[key] = await api().oral(cid, lang());
    } catch (e) {
      delete state.oralCache[key];
      toast(e.message);
    }
    render();
  }

  // ---------- Salle d'examen ----------
  function viewSalle() {
    const ex = state.exam;
    if (premium() && ex && epreuveMeta(ex.id)) {
      if (!state.examDoc || state.examDoc.id !== ex.id) {
        if (state.examError) {
          return `<article class="card"><p>${esc(t().examFailed)}</p><p class="small muted">${esc(state.examError)}</p>
            <div style="display:flex;gap:10px;flex-wrap:wrap"><button type="button" class="btn btn-primary" data-reload-exam>${t().tryAgain}</button>
            <button type="button" class="btn btn-ghost" data-quit>${t().quitRoom}</button></div></article>`;
        }
        // Sujet et corrigé chargés dès l'entrée en salle : la fin d'épreuve ne dépend plus du réseau.
        if (!pending.has("exam")) {
          pending.add("exam");
          api()
            .corrige(ex.id)
            .then((d) => {
              state.examDoc = d;
              state.docCache[`corriges:${ex.id}`] = d;
            })
            .catch((e) => {
              state.examError = e.message;
            })
            .finally(() => {
              pending.delete("exam");
              render();
            });
        }
        return `<p class="muted">…</p>`;
      }
      if (ex.phase === "prep") return sallePrep(ex);
      if (ex.phase === "compose") return salleCompose(ex);
      if (ex.phase === "done") return salleDone(ex);
    }
    return viewBrowse("salle");
  }

  function startExam(id) {
    if (!premium()) return openPaywall();
    state.exam = { id, phase: "prep", prepEnd: Date.now() + PREP_SECONDS * 1000 };
    state.examError = null;
    delete state.selfScores[id];
    local.set("exam", state.exam);
    go("salle", state.nav.salle || {});
  }

  function steps(i) {
    return `<div class="exam-steps">${t().steps.map((s, k) => `<span class="${k === i ? "on" : ""}">${s}</span>`).join("")}</div>`;
  }

  function sallePrep(ex) {
    const L = t();
    const e = epreuveMeta(ex.id);
    const c = concoursById(e.concours);
    return `
      ${steps(0)}
      <div><span class="eyebrow">${esc(c.nom)} · ${L.session(e.annee)}</span><h1>${esc(e.matiere)} — ${hm(e.duree)}</h1></div>
      <div class="prep">
        <article class="card" style="align-items:center;text-align:center">
          <span class="eyebrow">${L.startsIn}</span>
          <div class="countdown" data-tick="prep">${clock(ex.prepEnd - Date.now())}</div>
          <p class="muted small">${L.subjectAuto}</p>
          <button type="button" class="btn btn-primary" data-begin>${L.ready}</button>
        </article>
        <article class="card">
          <h3>${L.setup}</h3>
          <ul class="checklist">${L.checklist.map((x, i) => `<li><label><input type="checkbox" id="ck${i}"> ${x}</label></li>`).join("")}</ul>
          <p class="small muted">${L.handwrite}</p>
        </article>
      </div>
      <button type="button" class="back" data-quit>${L.quitRoom}</button>`;
  }

  function beginCompose() {
    const e = epreuveMeta(state.exam.id);
    const now = Date.now();
    state.exam = { ...state.exam, phase: "compose", start: now, end: now + e.duree * 60 * 1000 };
    local.set("exam", state.exam);
    requestWakeLock();
    render();
  }

  function salleCompose(ex) {
    const L = t();
    return `
      ${steps(1)}
      <div class="exam-bar" data-bar>
        <div><div class="small" style="opacity:.8;font-weight:700">${L.timeLeft}</div><div class="timer" data-tick="compose">${clock(ex.end - Date.now())}</div></div>
        <div class="progress" aria-hidden="true"><i data-tick="progress"></i></div>
        <button type="button" class="btn btn-sun" data-finish>${L.done}</button>
      </div>
      ${protectedPaper(state.examDoc.sujet)}
      <p class="small muted">${L.keepOpen}</p>`;
  }

  function finishExam(auto) {
    state.exam = { ...state.exam, phase: "done", finishedAt: Math.min(Date.now(), state.exam.end), auto: Boolean(auto) };
    local.set("exam", state.exam);
    releaseWakeLock();
    if (auto) toast(t().timeUpToast);
    render();
  }

  function salleDone(ex) {
    const L = t();
    const e = epreuveMeta(ex.id);
    const used = Math.max(1, Math.round((ex.finishedAt - ex.start) / 60000));
    const corr = state.docCache[`corriges:${ex.id}`];
    const corrErr = state.docError[`corriges:${ex.id}`];
    if (!corr && !corrErr) loadDoc(ex.id, "corriges");
    const scores = state.selfScores[ex.id] || {};
    const grid = gridItems(corr).length
      ? gridHtml(corr, scores)
      : `<div class="score-row"><label for="sc0">${L.selfGlobal}</label><span class="score-input"><input id="sc0" type="number" inputmode="decimal" min="0" max="20" step="0.5" data-score="0" value="${scores[0] ?? ""}"> / 20</span></div>`;
    return `
      ${steps(2)}
      <div><span class="eyebrow">${esc(e.matiere)} · ${hm(e.duree)}</span><h1>${ex.auto ? L.timeUp : L.finished}</h1></div>
      <div class="fb-cols">
        <article class="card"><span class="eyebrow">${L.timeUsed}</span><div class="countdown" style="font-size:3rem;text-align:left">${hm(used)}</div>
          <p class="small muted">${L.outOf(hm(e.duree))}</p></article>
        <article class="card"><h3>${L.selfTitle}</h3><p class="small muted">${L.selfHow}</p></article>
      </div>
      ${
        !ex.revealed
          ? `<article class="card" style="gap:14px"><h2>${rev().revealTitle}</h2><p class="muted">${rev().revealText}</p>
              <div style="display:flex;gap:10px;flex-wrap:wrap"><button type="button" class="btn btn-primary" data-reveal>${rev().revealYes}</button>
              <button type="button" class="btn btn-ghost" data-quit>${rev().revealLater}</button></div></article>`
          : `<div><span class="eyebrow">${L.shouldWrite}</span><h2>${L.modelAnswer}</h2>${corr ? `<p>${sourceTag(corr)}</p>` : ""}</div>`
      }
      ${
        !ex.revealed
          ? ""
          : corr
          ? (corr.corrige_a_verifier?.length ? `<div class="notice">${I.info}<span class="small"><b>${esc(t().toCheckAnswer)}</b><br>${corr.corrige_a_verifier.map((x) => "• " + esc(x)).join("<br>")}</span></div>` : "") + protectedPaper(corr.corrige)
          : corrErr
            ? `<article class="card"><p>${esc(L.corrFailed)}</p><p class="small muted">${esc(corrErr)}</p><button type="button" class="btn btn-primary" data-reload-corr="${ex.id}">${L.tryAgain}</button></article>`
            : `<p class="muted">${L.corrLoading}</p>`
      }
      <article class="card" id="self-card" ${ex.revealed ? "" : "hidden"}>
        <h3>${L.selfGrid}</h3>
        <p class="small muted">${L.gridHow}</p>
        <div class="score-grid">${grid}</div>
        <div class="score" style="margin-top:6px"><div class="score-ring" id="self-ring" style="--p:0"><div><b id="self-total">—</b><small>/20</small></div></div>
          <div style="flex:1 1 220px;display:grid;gap:10px"><p class="small muted" id="self-msg"></p>
          <button type="button" class="btn btn-primary" data-save-score>${L.selfSave}</button></div></div>
      </article>
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        <button type="button" class="btn btn-ghost" data-start="${e.id}">${L.retry}</button>
        <button type="button" class="btn btn-ghost" data-quit>${L.newPaper}</button>
        ${ex.revealed ? reportButton(ex.id, "corrige") : ""}
      </div>`;
  }

  // Critères notés d'un corrigé : grille détaillée (niveaux) si elle existe, sinon barème en texte.
  function gridItems(doc) {
    if (doc?.grille) return doc.grille.flatMap((b) => b.criteres.map((c) => ({ bloc: b.titre, label: c.label, max: c.pts, niveaux: c.niveaux || [] })));
    return parseBareme(doc?.bareme).map((it) => ({ ...it, niveaux: [] }));
  }

  // Grille affichée par blocs (Introduction, Développement…) ; avec scores, chaque critère a sa case à remplir.
  function gridHtml(doc, scores) {
    const L = t();
    const unit = (n) => `${fmtScore(n)} ${L.ptsUnit(n)}`;
    const blocks = doc.grille || [{ titre: "", criteres: gridItems(doc).map((it) => ({ label: it.label, pts: it.max })) }];
    let i = 0;
    return blocks
      .map((b) => {
        const rows = b.criteres
          .map((c) => {
            const k = i++;
            const field = scores
              ? `<span class="score-input"><input id="sc${k}" type="number" inputmode="decimal" min="0" max="${c.pts}" step="0.5" data-score="${k}" value="${scores[k] ?? ""}"> / ${fmtScore(c.pts)}</span>`
              : `<span class="score-input">${unit(c.pts)}</span>`;
            const levels = (c.niveaux || []).length ? `<ul class="levels">${c.niveaux.map((n) => `<li>${esc(n)}</li>`).join("")}</ul>` : "";
            return `<div class="score-row"><div class="crit"><label ${scores ? `for="sc${k}"` : ""}>${esc(c.label)}</label>${levels}</div>${field}</div>`;
          })
          .join("");
        const head = b.titre ? `<div class="grid-head"><b>${esc(b.titre)}</b><span>${unit(b.pts ?? b.criteres.reduce((s, c) => s + c.pts, 0))}</span></div>` : "";
        const aide = b.aide ? `<p class="small grid-aide">${esc(b.aide)}</p>` : "";
        return `<section class="grid-block">${head}${aide}${rows}</section>`;
      })
      .join("");
  }

  // Barème : une ligne par critère, au format « Critère : N pts » (voir content/GUIDE-CORRIGES.md).
  function parseBareme(text) {
    if (!text) return [];
    const items = [];
    for (const line of text.split("\n")) {
      const m = line.trim().match(/^(.*?)\s*:?\s*(\d+(?:[.,]5)?)\s*(?:pts?|points?|marks?)?\s*$/i);
      if (!m || !m[1].trim()) continue;
      const max = Number(m[2].replace(",", "."));
      if (max > 0 && max <= 20) items.push({ label: m[1].replace(/[\s:]+$/, ""), max });
    }
    const sum = items.reduce((s, x) => s + x.max, 0);
    return sum >= 5 && sum <= 40 ? items : [];
  }

  const fmtScore = (n) => String(Math.round(n * 10) / 10).replace(".", lang() === "fr" ? "," : ".");

  function selfTotal(id) {
    const corr = state.docCache[`corriges:${id}`];
    const items = gridItems(corr);
    const scores = state.selfScores[id] || {};
    const max = items.length ? items.reduce((s, x) => s + x.max, 0) : 20;
    const keys = items.length ? items.map((_, i) => i) : [0];
    if (!keys.some((k) => scores[k] !== undefined && scores[k] !== "")) return null;
    const got = keys.reduce((s, k) => {
      const lim = items.length ? items[k].max : 20;
      return s + Math.min(lim, Math.max(0, Number(scores[k]) || 0));
    }, 0);
    return (got / max) * 20;
  }

  function updateSelfTotal() {
    const L = t();
    const note = selfTotal(state.exam.id);
    const ring = document.getElementById("self-ring");
    if (!ring) return;
    ring.style.setProperty("--p", note == null ? 0 : (note / 20) * 100);
    document.getElementById("self-total").textContent = note == null ? "—" : fmtScore(note);
    document.getElementById("self-msg").textContent = note == null ? L.selfHint : note >= 12 ? L.selfGood : note >= 10 ? L.selfMid : L.selfLow;
  }

  function saveSelfScore() {
    const L = t();
    const ex = state.exam;
    const note = selfTotal(ex.id);
    if (note == null) return toast(L.selfHint);
    const key = "results." + state.user.email;
    const list = local.get(key, []);
    list.unshift({ id: ex.id, note: Math.round(note * 10) / 10, minutes: Math.max(1, Math.round((ex.finishedAt - ex.start) / 60000)), date: new Date().toISOString() });
    local.set(key, list.slice(0, 50));
    toast(L.selfSaved);
  }

  function resultsHistory() {
    const L = t();
    const list = local.get("results." + state.user?.email, []).filter((r) => epreuveMeta(r.id)).slice(0, 8);
    if (!list.length) return "";
    const rows = list
      .map((r) => {
        const e = epreuveMeta(r.id);
        const c = concoursById(e.concours);
        return `<tr><td><b>${esc(c.sigle)}</b> ${esc(e.matiere)}</td><td>${dateFmt(r.date)}</td><td>${hm(r.minutes)}</td><td><b>${fmtScore(r.note)}</b>/20</td></tr>`;
      })
      .join("");
    return `<article class="card"><h3>${L.history}</h3><div class="table-wrap"><table><thead><tr><th>${L.thPaper}</th><th>Date</th><th>${L.thDuration}</th><th>${L.thNote}</th></tr></thead><tbody>${rows}</tbody></table></div></article>`;
  }

  let wakeLock = null;
  async function requestWakeLock() {
    try {
      wakeLock = await navigator.wakeLock?.request("screen");
    } catch {}
  }
  function releaseWakeLock() {
    wakeLock?.release?.().catch(() => {});
    wakeLock = null;
  }

  // ---------- Compte et espace concepteur ----------
  function openAccount() {
    const L = t();
    const u = state.user;
    const status = u.admin ? L.designerAccess : premium() ? L.until(dateFmt(u.premium_until)) : L.free;
    modal(`
      <div style="display:flex;gap:12px;align-items:center"><span class="avatar" style="width:48px;height:48px;font-size:1.3rem">${esc(u.name.slice(0, 1).toUpperCase())}</span>
        <div style="min-width:0"><h2>${esc(u.name)}</h2><span class="small muted">${esc(u.email)}</span></div></div>
      <div class="status-pill"><b>${L.section}</b><span class="small muted">${status}</span></div>
      <button type="button" class="btn btn-ghost btn-block" data-lang="${lang() === "fr" ? "en" : "fr"}">${L.changeSection}</button>
      ${!premium() ? `<button type="button" class="btn btn-sun btn-block" data-pay>${L.subscribe}</button><button type="button" class="btn btn-ghost btn-block" data-sync>${L.checkPayment}</button>` : ""}
      ${u.admin ? `<button type="button" class="btn btn-primary btn-block" data-admin>${L.admin}</button>` : ""}
      <button type="button" class="btn btn-ghost btn-block" data-logout>${L.logout}</button>
      <div class="legal-links">
        <button type="button" class="linkish" data-legal="privacy">${legal().privacy}</button>
        <button type="button" class="linkish" data-legal="promises">${legal().promises}</button>
        <button type="button" class="linkish" data-export>${legal().export}</button>
        <button type="button" class="linkish danger" data-delete-account>${legal().del}</button>
      </div>`);
  }

  function openLegal(kind) {
    const G = legal();
    const items = kind === "privacy" ? G.privacySections(state.config) : G.promiseItems;
    modal(`<h2>${kind === "privacy" ? G.privacy : G.promises}</h2>
      <div class="legal">${items.map(([h, p]) => `<section><h3>${esc(h)}</h3><p>${esc(p)}</p></section>`).join("")}</div>`, true);
  }

  async function exportMyData() {
    try {
      const data = await api().exportData();
      data.historique_notes = local.get("results." + state.user.email, []);
      const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = "weldon-mes-donnees.json";
      document.body.append(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    } catch (e) {
      toast(e.message);
    }
  }

  function openDeleteAccount() {
    const G = legal();
    modal(`<h2>${G.delTitle}</h2><p class="muted">${G.delText}</p>
      <form id="delete-form" class="form" novalidate>
        <div class="field full"><label for="df-pw">${G.delPw}</label><input id="df-pw" name="password" type="password" autocomplete="current-password" required></div>
        <p class="err full" id="delete-err" hidden></p>
        <button type="submit" class="btn btn-primary btn-block full" style="background:var(--coral)">${G.delGo}</button>
      </form>`);
  }

  async function submitDelete(form) {
    const err = form.querySelector("#delete-err");
    try {
      await api().deleteAccount(new FormData(form).get("password"));
    } catch (e) {
      err.textContent = e.message;
      err.hidden = false;
      return;
    }
    const email = state.user.email;
    for (const k of ["results." + email, "exam"]) local.del(k);
    closeModal();
    setSession(null, null);
    state.catalog = null;
    state.docCache = {};
    state.oralCache = {};
    state.exam = null;
    render();
    toast(legal().deleted);
  }

  async function openAdmin() {
    const L = t();
    modal(`<h2>${L.admin}</h2><p class="muted">…</p>`, true);
    try {
      const [users, reports, papers, annonces] = await Promise.all([api().adminUsers(), api().adminReports(), api().adminEpreuves(), api().adminAnnonces()]);
      if (!state.bourses && !state.demo) state.bourses = await api().bourses(lang()).then((r) => r.bourses, () => []);
      state.adminAnn = annonces;
      const C = cal();
      const concoursOpts = (cur) => `<option value="">${C.noConcours}</option>${state.catalog.concours.map((c) => `<option value="${esc(c.id)}" ${c.id === cur ? "selected" : ""}>${esc(c.sigle)} · ${esc(c.nom.slice(0, 40))}</option>`).join("")}`;
      const kindOpts = (cur) => Object.entries(C.kinds).map(([k, v]) => `<option value="${k}" ${k === cur ? "selected" : ""}>${esc(v)}</option>`).join("");
      const draftRows = annonces
        .filter((a) => a.status === "draft")
        .map(
          (a) => `<div class="draft" data-ann-row>
            <div><b>${a.lien ? `<a href="${esc(a.lien)}" target="_blank" rel="noopener noreferrer">${esc(a.titre)}</a>` : esc(a.titre)}</b><br><span class="small muted">${esc(a.source)} · ${dateFmt(a.at)}</span></div>
            <div class="draft-actions"><select data-ann-concours aria-label="${C.fConcours}">${concoursOpts(a.concours)}</select><select data-ann-kind aria-label="${C.fKind}">${kindOpts(a.kind)}</select>
              <button type="button" class="btn btn-primary btn-small" data-ann-publish="${esc(a.id)}">${C.publish}</button>
              <button type="button" class="btn btn-ghost btn-small" data-ann-reject="${esc(a.id)}">${C.reject}</button></div></div>`
        )
        .join("");
      const pubRows = annonces
        .filter((a) => a.status === "published")
        .map((a) => `<tr><td><b>${esc(a.titre)}</b><br><span class="small muted">${esc(C.kinds[a.kind])}${a.concours ? " · " + esc(a.concours) : ""} · ${C.published}</span></td><td><button type="button" class="btn btn-ghost btn-small" data-ann-reject="${esc(a.id)}">${C.reject}</button></td></tr>`)
        .join("");
      const R = rev();
      const reportRows = reports
        .map(
          (r) => `<tr><td><b>${esc(r.epreuve)}</b> · ${esc(R.kinds[r.kind] || r.kind)}<br><span class="small">${esc(r.message)}</span><br><span class="small muted">${esc(r.email)} · ${dateFmt(r.at)}</span></td>
            <td>${r.status === "open" ? `<button type="button" class="btn btn-ghost btn-small" data-close-report="${esc(r.id)}">${R.closeReport}</button>` : "✓"}</td></tr>`
        )
        .join("");
      const paperRows = papers
        .filter((e) => e.lang === lang())
        .map(
          (e) => `<tr><td><b>${esc(e.id)}</b>${e.off ? ` <span class="tag tag-sun">${R.withdrawn}</span>` : ""}</td>
            <td><button type="button" class="btn btn-ghost btn-small" data-withdraw-paper="${esc(e.id)}" data-off="${e.off ? 0 : 1}">${e.off ? R.restore : R.withdraw}</button></td></tr>`
        )
        .join("");
      const rows = users
        .map(
          (u) =>
            `<tr><td><b>${esc(u.name)}</b><br><span class="small muted">${esc(u.email)}</span></td><td>${(u.lang || "—").toUpperCase()}</td><td>${
              u.admin ? L.designer : u.premium ? L.until(dateFmt(u.premium_until)) : L.free
            }</td></tr>`
        )
        .join("");
      modal(
        `<h2>${L.admin}</h2>
        <h3>${L.adminGrant}</h3><p class="small muted">${L.adminGrantSub}</p>
        <form id="grant-form" class="form" novalidate>
          <div class="field"><label for="gf-email">E-mail</label><input id="gf-email" name="email" type="email" required></div>
          <div class="field"><label for="gf-days">${L.days}</label><input id="gf-days" name="days" type="number" min="1" max="3650" value="30" required></div>
          <p class="err full" id="grant-err" hidden></p>
          <button type="submit" class="btn btn-primary full">${L.grant}</button>
        </form>
        ${(state.bourses || []).length ? `<h3>${br().adminTitle}</h3><p class="small muted">${br().adminSub}</p>
        <form id="bourse-form" class="form" novalidate>
          <div class="field full"><label for="bourse-select">${br().pick}</label><select id="bourse-select" name="id">${state.bourses.map((b) => `<option value="${esc(b.id)}" ${b.id === (state.bourseSel || state.bourses[0].id) ? "selected" : ""}>${esc(b.nom.slice(0, 50))}${b.status === "verified" ? " ✓" : ""}</option>`).join("")}</select></div>
          <div id="bourse-fields" class="form full" style="grid-template-columns:1fr 1fr">${bourseFields(state.bourseSel || state.bourses[0].id)}</div>
          <p class="err full" id="bourse-err" hidden></p>
          <button type="submit" class="btn btn-primary full">${br().save}</button>
        </form>` : ""}
        <h3>${fi().title}</h3><p class="small muted">${fi().sub}</p>
        <form id="fiche-form" class="form" novalidate>
          <div class="field full"><label for="fiche-select">${fi().pick}</label><select id="fiche-select" name="concours">${state.catalog.concours.map((c) => `<option value="${esc(c.id)}" ${c.id === (state.ficheSel || "gardiens-paix") ? "selected" : ""}>${esc(c.sigle)} · ${esc(c.nom.slice(0, 50))}${c.status === "verified" ? " ✓" : ""}</option>`).join("")}</select></div>
          <div id="fiche-fields" class="form full" style="grid-template-columns:1fr 1fr">${ficheFields(state.ficheSel || "gardiens-paix")}</div>
          <p class="err full" id="fiche-err" hidden></p>
          <button type="submit" class="btn btn-primary full">${fi().save}</button>
        </form>
        <h3>${C.adminAnn} · ${C.drafts} (${annonces.filter((a) => a.status === "draft").length})</h3><p class="small muted">${C.adminAnnSub}</p>
        ${draftRows || ""}
        ${pubRows ? `<div class="table-wrap" style="max-height:200px;overflow:auto"><table><tbody>${pubRows}</tbody></table></div>` : ""}
        <form id="ann-form" class="form" novalidate>
          <h4 class="full" style="margin:0">${C.annNew}</h4>
          <div class="field"><label for="an-c">${C.fConcours}</label><select id="an-c" name="concours">${concoursOpts("")}</select></div>
          <div class="field"><label for="an-k">${C.fKind}</label><select id="an-k" name="kind">${kindOpts("lancement")}</select></div>
          <div class="field full"><label for="an-t">${C.fTitle}</label><input id="an-t" name="titre" maxlength="200" required></div>
          <div class="field full"><label for="an-m">${C.fMessage}</label><textarea id="an-m" name="message" rows="2" maxlength="1000"></textarea></div>
          <div class="field"><label for="an-d">${C.fDate}</label><input id="an-d" name="date" type="date"></div>
          <div class="field"><label for="an-l">${C.fLink}</label><input id="an-l" name="lien" type="url" placeholder="https://"></div>
          <label class="full"><input type="checkbox" name="publish" checked> ${C.fPublish}</label>
          <p class="err full" id="ann-err" hidden></p>
          <button type="submit" class="btn btn-primary full">${C.save}</button>
        </form>
        <h3>${R.reportsTitle} (${reports.filter((r) => r.status === "open").length})</h3>
        ${reportRows ? `<div class="table-wrap" style="max-height:260px;overflow:auto"><table><tbody>${reportRows}</tbody></table></div>` : `<p class="small muted">${R.noReports}</p>`}
        <h3>${R.papersTitle}</h3><p class="small muted">${R.papersSub}</p>
        <div class="table-wrap" style="max-height:260px;overflow:auto"><table><tbody>${paperRows}</tbody></table></div>
        <h3>${L.coverage} · ${L.section}</h3>
        ${coverageTable()}
        <h3>${L.adminUsers} (${users.length})</h3>
        <div class="table-wrap"><table><thead><tr><th>${L.thUser}</th><th>Section</th><th>${L.thStatus}</th></tr></thead><tbody>${rows}</tbody></table></div>`,
        true
      );
    } catch (e) {
      toast(e.message);
    }
  }

  async function publishDraft(id, row) {
    const draft = (state.adminAnn || []).find((a) => a.id === id);
    if (!draft || !row) return;
    try {
      await api().adminSaveAnnonce({ ...draft, concours: row.querySelector("[data-ann-concours]").value, kind: row.querySelector("[data-ann-kind]").value, publish: true });
    } catch (e) {
      return toast(e.message);
    }
    state.annonces = null;
    toast(cal().annSaved);
    openAdmin();
  }

  async function submitAnnonce(form) {
    const err = form.querySelector("#ann-err");
    const fd = new FormData(form);
    try {
      await api().adminSaveAnnonce({ ...Object.fromEntries(fd), publish: fd.get("publish") === "on" });
    } catch (e) {
      err.textContent = e.message;
      err.hidden = false;
      return;
    }
    state.annonces = null;
    toast(cal().annSaved);
    openAdmin();
  }

  function openReport(epreuve, kind) {
    const R = rev();
    modal(`<h2>${R.reportTitle}</h2>
      <form id="report-form" class="form" novalidate>
        <input type="hidden" name="epreuve" value="${esc(epreuve)}">
        <div class="field full"><label for="rf-kind">${R.reportWhere}</label>
          <select id="rf-kind" name="kind">${Object.entries(R.kinds).map(([k, v]) => `<option value="${k}" ${k === kind ? "selected" : ""}>${esc(v)}</option>`).join("")}</select></div>
        <div class="field full"><label for="rf-msg">${R.reportMsg}</label><textarea id="rf-msg" name="message" rows="4" maxlength="1000" required></textarea></div>
        <p class="err full" id="report-err" hidden></p>
        <button type="submit" class="btn btn-primary full">${R.send}</button>
      </form>`);
  }

  async function submitReport(form) {
    const err = form.querySelector("#report-err");
    try {
      await api().report(Object.fromEntries(new FormData(form)));
      closeModal();
      toast(rev().reportThanks);
    } catch (e) {
      err.textContent = e.message;
      err.hidden = false;
    }
  }

  function coverageTable() {
    const L = t();
    const rows = state.catalog.concours.map((c) => {
      const eps = epreuvesOf(c.id);
      return { c, n: eps.length, off: eps.filter((e) => !e.exemple).length };
    });
    const done = rows.filter((r) => r.n).length;
    rows.sort((a, b) => b.n - a.n || a.c.nom.localeCompare(b.c.nom));
    const tr = rows
      .map((r) => `<tr><td><b>${esc(r.c.sigle)}</b> ${esc(r.c.nom)}</td><td>${r.n || "—"}</td><td>${r.off || "—"}</td></tr>`)
      .join("");
    return `<p class="small muted">${L.coverageSub(done, rows.length)}</p>
      <div class="table-wrap" style="max-height:320px;overflow:auto"><table><thead><tr><th>${L.thConcours}</th><th>${L.thPapers}</th><th>${L.thOfficial}</th></tr></thead><tbody>${tr}</tbody></table></div>`;
  }

  async function submitGrant(form) {
    const err = form.querySelector("#grant-err");
    try {
      await api().grant(Object.fromEntries(new FormData(form)));
      toast(t().granted);
      openAdmin();
    } catch (e) {
      err.textContent = e.message;
      err.hidden = false;
    }
  }

  // ---------- Abonnement (Chariow) ----------
  function openPaywall() {
    const L = t();
    const perk = (x) => `<li>${I.check}<span>${x}</span></li>`;
    const plans = state.config.plans?.length ? state.config.plans : [{ id: "annual", price_xaf: state.config.price_xaf, days: 365 }];
    const plan = plans.find((x) => x.id === state.plan) || plans[0];
    const planName = (x) => (x.id === "monthly" ? L.planMonthly : L.planAnnual);
    const monthlyPlan = plans.find((x) => x.id === "monthly");
    const annualPlan = plans.find((x) => x.id === "annual");
    const saving = monthlyPlan && annualPlan ? monthlyPlan.price_xaf * 12 - annualPlan.price_xaf : 0; // ce que l'annuel fait économiser
    const chooser =
      plans.length > 1
        ? `<div class="plans" role="group">${plans
            .map((x) => `<button type="button" class="plan" data-plan="${x.id}" aria-pressed="${x.id === plan.id}"><b>${planName(x)}</b><span>${fmtNum(x.price_xaf)} FCFA</span>${x.id === "annual" && saving > 0 ? `<small>${L.planSave(fcfa(saving))}</small>` : ""}</button>`)
            .join("")}</div>${plan.id === "monthly" ? `<p class="small muted">${L.planMonthlyNote} ${monthlyPlan ? L.planTotal(fcfa(monthlyPlan.price_xaf * 12)) : ""}</p>` : ""}`
        : "";
    closeModal();
    const m = document.createElement("div");
    m.className = "modal";
    m.id = "modal";
    m.setAttribute("role", "dialog");
    m.setAttribute("aria-modal", "true");
    m.innerHTML = `
      <div class="modal-box">
        <div class="modal-head">
          <button type="button" class="modal-close" data-close aria-label="×">×</button>
          <span class="eyebrow" style="color:inherit">${L.payTitle}</span>
          <h2 class="price">${fmtNum(plan.price_xaf)} <small>${plan.id === "monthly" ? L.perMonthShort : L.perYearShort}</small></h2>
          <span style="font-weight:700">${L.oneTime}</span>
        </div>
        <div class="modal-body">
          <ul class="perks">${L.perks.map(perk).join("")}</ul>
          ${NATIVE ? "" : chooser}
          ${NATIVE ? `<p>${L.nativeNoSale}</p><button type="button" class="btn btn-primary btn-block" data-sync>${L.checkPayment}</button>` : `<form class="form" id="pay-form" novalidate>
            <p class="small full">${L.payAs(esc(state.user.email))}</p>
            <div class="field full"><label for="pf-phone">${L.momo}</label><input id="pf-phone" name="phone" type="tel" inputmode="numeric" autocomplete="tel" required placeholder="6XX XX XX XX"></div>
            <p class="err full" id="pay-err" hidden></p>
            <button class="btn btn-primary btn-block full" type="submit" id="pay-btn">${state.demo ? L.simulatePay : L.pay(fcfa(plan.price_xaf))}</button>
            <p class="small muted full">${L.payInfo}</p>
          </form>
          <p class="small">${L.alreadyPaid} <button type="button" class="linkish" data-sync>${L.checkPayment}</button></p>`}
          <p class="small"><button type="button" class="linkish" data-legal="promises">${legal().promises}</button> · <button type="button" class="linkish" data-legal="privacy">${legal().privacy}</button></p>
        </div>
      </div>`;
    document.body.append(m);
    m.querySelector("input")?.focus();
  }

  function modal(html, wide = false) {
    closeModal();
    const m = document.createElement("div");
    m.className = "modal";
    m.id = "modal";
    m.setAttribute("role", "dialog");
    m.setAttribute("aria-modal", "true");
    m.innerHTML = `<div class="modal-box" ${wide ? 'style="width:min(720px,100%)"' : ""}><div class="modal-body"><button type="button" class="modal-close" data-close aria-label="×" style="position:static;align-self:flex-end">×</button>${html}</div></div>`;
    document.body.append(m);
  }

  function closeModal() {
    document.getElementById("modal")?.remove();
    if (state.confirmResolve) {
      const r = state.confirmResolve;
      state.confirmResolve = null;
      r(false); // fermer la fenêtre sans répondre = refuser
    }
  }

  // Confirmation dans l'application (à la place de la boîte du navigateur, qui affiche l'adresse du site).
  function askConfirm(text, yes, no) {
    return new Promise((resolve) => {
      modal(`<p style="font-weight:700;font-size:1.05rem">${esc(text)}</p>
        <div style="display:flex;gap:10px;flex-wrap:wrap"><button type="button" class="btn btn-primary" data-confirm="1">${esc(yes)}</button><button type="button" class="btn btn-ghost" data-confirm="0">${esc(no)}</button></div>`);
      state.confirmResolve = resolve;
    });
  }

  // ---------- Bouton Retour du téléphone ----------
  // Sans cela, Retour quitte toute l'application. Dès qu'on entre dans un écran « enfant » (quiz en cours, fiche,
  // plan, fenêtre…), on ajoute une entrée d'historique : Retour revient alors d'un niveau, et ne quitte l'application
  // que depuis un écran principal.
  function isNested() {
    if (!state.user) return false;
    if (document.getElementById("modal")) return true;
    if (state.play) return true;
    if (state.space === "bourses") return Boolean(state.bFicheId) || (state.tab === "bguide" && Boolean(state.conseilId)) || (state.tab === "bfind" && state.bf.branche !== undefined);
    if (state.tab === "quiz") return state.qzView === "plan";
    if (state.tab === "salle" && state.exam && ["prep", "compose"].includes(state.exam.phase) && state.examDoc) return true;
    const nav = state.nav[state.tab] || {};
    return Boolean(nav.concours || nav.orient || nav.calendrier || nav.doc);
  }

  function syncHistory() {
    const nested = isNested();
    if (nested && !state.sentinel) {
      history.pushState({ weldon: 1 }, "");
      state.sentinel = true;
    } else if (!nested && state.sentinel) {
      state.sentinel = false;
      state.popIgnore = (state.popIgnore || 0) + 1;
      history.back(); // retire l'entrée devenue inutile
    }
  }

  function navBack() {
    const nav = state.nav[state.tab] || {};
    if (nav.from === "orient") return go("concours", { orient: true });
    if (nav.from === "cal") return go("concours", { calendrier: true });
    return go(state.tab, nav.doc ? { concours: nav.concours } : {});
  }

  async function backOne() {
    if (document.getElementById("modal")) return closeModal();
    const pl = state.play;
    if (pl) {
      if (pl.mode === "blanc" && !pl.finished && !(await askConfirm(qz().leaveSureBlanc, qz().leaveYes, qz().stay))) return render();
      state.play = null;
      state.qzStats = null;
      return render();
    }
    if (state.tab === "salle" && state.exam && ["prep", "compose"].includes(state.exam.phase) && state.examDoc) {
      toast(rev().backExam);
      return render(); // l'entrée d'historique est remise : on ne sort pas de la salle par mégarde
    }
    if (state.space === "bourses") {
      if (state.bFicheId) state.bFicheId = null;
      else if (state.tab === "bguide" && state.conseilId) {
        state.conseilId = null;
        state.conseilBody = null;
      } else if (state.tab === "bfind") state.bf = {};
      return render();
    }
    if (state.tab === "quiz" && state.qzView === "plan") {
      if (state.planEdit && state.plan?.plan && !state.plan.expired) state.planEdit = false;
      else state.qzView = null;
      return render();
    }
    return navBack();
  }

  window.addEventListener("popstate", () => {
    if (state.popIgnore > 0) {
      state.popIgnore--;
      return;
    }
    if (!state.sentinel) return; // rien à faire dans l'application : le navigateur quitte la page
    state.sentinel = false; // Retour vient de consommer l'entrée
    backOne();
  });
  new MutationObserver(() => syncHistory()).observe(document.body, { childList: true }); // ouverture et fermeture des fenêtres

  async function submitPay(form) {
    const L = t();
    const err = form.querySelector("#pay-err");
    const btn = form.querySelector("#pay-btn");
    const phone = String(new FormData(form).get("phone") || "").replace(/\D/g, "");
    err.hidden = true;
    if (phone.length < 8) {
      err.textContent = L.phoneErr;
      err.hidden = false;
      return;
    }
    btn.disabled = true;
    try {
      const r = await api().checkout({ phone, country_code: "CM", plan: state.plan || "annual" });
      if (r.step === "payment") {
        window.location.href = r.checkout_url;
        return;
      }
      if (r.user) state.user = r.user;
      closeModal();
      toast(state.demo ? L.paidSim : L.foundSub);
      render();
    } catch (e) {
      err.textContent = e.message;
      err.hidden = false;
      btn.disabled = false;
    }
  }

  async function syncPayment() {
    const L = t();
    try {
      state.user = await api().sync();
      closeModal();
      toast(premium() ? L.foundSub : L.noSub);
      render();
    } catch (e) {
      toast(e.message);
    }
  }

  // Retour de la page de paiement Chariow : ?sale=sal_xxx
  async function handleReturnFromPayment() {
    const sale = new URLSearchParams(location.search).get("sale");
    if (!sale || state.demo || !state.user) return;
    history.replaceState(null, "", location.pathname);
    const L = t();
    toast(L.checking);
    for (let i = 0; i < 6; i++) {
      try {
        const r = await api().verifySale(sale);
        if (r.paid) {
          state.user = r.user;
          toast(L.confirmed);
          render();
          return;
        }
      } catch (e) {
        toast(e.message);
        return;
      }
      await new Promise((ok) => setTimeout(ok, 4000));
    }
    toast(L.notYet);
  }

  // ---------- Protection contre les captures et la copie ----------
  // Sur le web, aucun site ne peut empêcher techniquement une capture d'écran. On combine :
  // filigrane au nom de l'élève, contenu masqué dès que l'app perd le focus, détection des
  // raccourcis de capture, copie et clic droit bloqués. L'application Android ajoutera FLAG_SECURE.
  function shield(on) {
    document.body.classList.toggle("shielded", on);
  }
  function warnCapture() {
    shield(true);
    toast(t().noCapture);
    try {
      navigator.clipboard?.writeText?.("").catch(() => {});
    } catch {}
    setTimeout(() => {
      if (document.hasFocus()) shield(false);
    }, 2500);
  }
  document.addEventListener("visibilitychange", () => {
    shield(document.hidden);
    if (!document.hidden && state.user && state.token) {
      api()
        .me()
        .then((u) => {
          const changed = u.premium !== state.user.premium || u.admin !== state.user.admin;
          state.user = u;
          if (changed) render();
        })
        .catch(() => {});
    }
  });
  window.addEventListener("blur", () => state.user && shield(true));
  window.addEventListener("focus", () => shield(false));
  // Touche Windows / Cmd : sur ordinateur, les raccourcis de capture (Win+Maj+S, Cmd+Maj+4…)
  // commencent tous par elle. Le contenu est masqué dès qu'elle est enfoncée, avant la capture.
  let metaTimer;
  document.addEventListener("keydown", (ev) => {
    if (ev.key === "Meta" || ev.key === "OS") {
      clearTimeout(metaTimer);
      shield(true);
    }
  });
  document.addEventListener("keyup", (ev) => {
    if (ev.key === "Meta" || ev.key === "OS") {
      clearTimeout(metaTimer);
      metaTimer = setTimeout(() => document.hasFocus() && shield(false), 1500);
    }
  });
  document.addEventListener("keydown", (ev) => {
    const k = ev.key;
    const shot = k === "PrintScreen" || (ev.metaKey && ev.shiftKey && ["3", "4", "5", "s", "S"].includes(k)) || (ev.ctrlKey && k === "p");
    if (shot) {
      ev.preventDefault();
      warnCapture();
    }
    if (k === "Escape") closeModal();
  });
  document.addEventListener("keyup", (ev) => {
    if (ev.key === "PrintScreen") warnCapture();
  });
  for (const type of ["copy", "cut", "contextmenu", "dragstart", "selectstart"]) {
    document.addEventListener(type, (ev) => {
      if (ev.target.closest?.(".protected")) ev.preventDefault();
    });
  }

  // ---------- Rendu ----------
  function render() {
    const root = document.getElementById("root");
    if (state.booting) {
      root.innerHTML = `<div class="auth"><div class="auth-card">${BRAND}<p class="muted">${T.fr.wakeUp}</p></div></div>`;
      return;
    }
    if (!state.user) {
      root.innerHTML = viewAuth();
      return;
    }
    if (!state.user.lang) {
      root.innerHTML = viewChooseSection();
      return;
    }
    if (!state.catalog || state.catalog.lang !== lang()) {
      root.innerHTML = `<div class="auth"><div class="auth-card">${BRAND}<p class="muted">…</p></div></div>`;
      loadCatalog();
      return;
    }
    document.documentElement.lang = lang();
    root.innerHTML = shell() + `<div class="shield-screen" aria-hidden="true"><div>${LOGO}<h2>${t().shieldTitle}</h2><p>${t().shieldText}</p></div></div>`;
    const v = document.getElementById("view");
    if (state.space === "bourses" && !bourseOn()) setSpace("concours");
    if (state.space === "bourses" && bourseOn()) {
      v.innerHTML = viewBourses();
      syncHistory();
      return;
    }
    const tab = state.tab;
    if (tab === "concours") v.innerHTML = viewConcours();
    else if (tab === "quiz") v.innerHTML = viewQuiz();
    else if (tab === "epreuves") v.innerHTML = viewBrowse("epreuves");
    else if (tab === "corriges") v.innerHTML = viewBrowse("corriges");
    else if (tab === "oral") v.innerHTML = viewOral();
    else if (tab === "salle") v.innerHTML = viewSalle();
    if (state.exam?.phase === "done") updateSelfTotal();
    syncHistory();
    tick();
  }

  let catalogLoading = null;
  async function loadCatalog() {
    if (catalogLoading === lang()) return;
    catalogLoading = lang();
    try {
      state.catalog = await api().catalog(lang());
    } catch (e) {
      toast(e.message);
    }
    catalogLoading = null;
    render();
  }

  function tick() {
    const pl = state.play;
    if (state.tab === "quiz" && pl?.mode === "blanc" && !pl.finished) {
      const left = pl.endAt - Date.now();
      if (left <= 0) return finishBlanc(true);
      const el = document.querySelector('[data-tick="blanc"]');
      if (el) el.textContent = clock(left);
      const bar = document.querySelector('[data-tick="blanc-progress"]');
      if (bar) bar.style.width = (1 - left / (40 * 60 * 1000)) * 100 + "%";
      document.querySelector("[data-bar]")?.classList.toggle("warn", left < 5 * 60 * 1000);
    }
    const ex = state.exam;
    if (state.tab !== "salle" || !ex || !state.examDoc) return;
    const now = Date.now();
    if (ex.phase === "prep") {
      if (now >= ex.prepEnd) return beginCompose();
      const el = document.querySelector('[data-tick="prep"]');
      if (el) el.textContent = clock(ex.prepEnd - now);
    } else if (ex.phase === "compose") {
      if (now >= ex.end) return finishExam(true);
      const left = ex.end - now;
      const el = document.querySelector('[data-tick="compose"]');
      if (el) el.textContent = clock(left);
      const bar = document.querySelector('[data-tick="progress"]');
      if (bar) bar.style.width = ((now - ex.start) / (ex.end - ex.start)) * 100 + "%";
      document.querySelector("[data-bar]")?.classList.toggle("warn", left < 15 * 60 * 1000);
    }
  }

  document.addEventListener("change", (ev) => {
    if (ev.target.id === "bourse-select") {
      state.bourseSel = ev.target.value;
      document.getElementById("bourse-fields").innerHTML = bourseFields(ev.target.value);
      return;
    }
    if (ev.target.id !== "fiche-select") return;
    state.ficheSel = ev.target.value;
    document.getElementById("fiche-fields").innerHTML = ficheFields(ev.target.value);
  });

  // ---------- Événements ----------
  document.addEventListener("click", async (ev) => {
    const el = ev.target.closest("button, label");
    if (!el) {
      if (ev.target.id === "modal") closeModal();
      return;
    }
    const d = el.dataset;
    if (d.auth) {
      state.authMode = d.auth;
      return render();
    }
    if (d.lang) {
      closeModal();
      try {
        state.user = await api().update({ lang: d.lang });
      } catch (e) {
        return toast(e.message);
      }
      state.nav = {};
      state.docCache = {};
      state.orient = null;
      state.exam = null;
      local.del("exam");
      // Nouveau compte sans profil : on l'emmène directement à « Quel concours pour moi ? »
      if (!state.user.profil?.niveau) return go("concours", { orient: true });
      return render();
    }
    if (d.tab) {
      state.bFicheId = null;
      if (d.tab === "quiz") {
        state.qzView = null;
        state.play = state.play?.finished ? null : state.play;
      }
      return go(d.tab, {});
    }
    if (d.jump) return go(d.jump, { concours: d.c });
    if (d.school) return go(d.mode === "fiche" ? "concours" : d.mode, { concours: d.school });
    if (d.oral) return go("oral", { concours: d.oral });
    if (d.cat) {
      state.cat = d.cat;
      return render();
    }
    if ("planOpen" in d) {
      state.qzView = "plan";
      state.planEdit = !state.plan?.plan || state.plan?.expired;
      return render();
    }
    if ("planBack" in d) {
      state.qzView = null;
      state.planEdit = false;
      return render();
    }
    if ("planEdit" in d) {
      state.planEdit = true;
      return render();
    }
    if ("planRemove" in d) {
      if (!(await askConfirm(pl().removeSure, pl().removeYes, pl().removeKeep))) return;
      try {
        state.plan = await api().savePlan({ clear: true });
      } catch (e) {
        return toast(e.message);
      }
      state.qzView = null;
      return render();
    }
    if (d.planStart) {
      const k = d.planStart;
      state.qzView = null;
      if (k === "revision") return startQuiz("revision");
      if (k === "blanc") return premium() ? startQuiz("blanc") : openPaywall();
      if (k === "quiz_theme") {
        if (!premium()) return openPaywall();
        state.seriesTheme = d.theme || "";
        state.seriesN = 20;
        return startQuiz("series");
      }
      if (k === "epreuve" && d.epreuve) return startExam(d.epreuve);
      return go("salle", {});
    }
    if ("quizDailyFromPlan" in d) {
      state.qzView = null;
      return startQuiz("daily");
    }
    if (d.reminder) {
      const plugin = LN();
      if (!plugin) return;
      const [h, m] = (document.getElementById("reminder-time")?.value || "18:00").split(":").map(Number);
      if (d.reminder === "off") local.set("reminder", { on: false, h, m });
      else {
        try {
          const perm = await plugin.requestPermissions();
          if (perm.display !== "granted") return toast(pl().reminderDenied);
        } catch {
          return toast(pl().reminderDenied);
        }
        local.set("reminder", { on: true, h, m });
      }
      await scheduleReminder();
      return render();
    }
    if ("quizDaily" in d) return startQuiz("daily");
    if ("quizRevision" in d) return startQuiz("revision");
    if ("quizSeries" in d) return premium() ? startQuiz("series") : openPaywall();
    if ("quizBlanc" in d) return premium() ? startQuiz("blanc") : openPaywall();
    if (d.seriesTheme !== undefined) {
      state.seriesTheme = d.seriesTheme;
      return render();
    }
    if (d.seriesN) {
      state.seriesN = Number(d.seriesN);
      return render();
    }
    if (d.pick !== undefined) return quizPick(Number(d.pick));
    if ("quizNext" in d) return quizNext(1);
    if ("quizPrev" in d) return quizNext(-1);
    if (d.goto !== undefined) {
      state.play.i = Number(d.goto);
      return render();
    }
    if ("quizSubmit" in d) {
      const left = state.play.questions.length - Object.keys(state.play.choice).length;
      if (left && !(await askConfirm(qz().submitSure(left), qz().submitYes, qz().keep))) return;
      return finishBlanc(false);
    }
    if ("quizLeave" in d) {
      if (!(await askConfirm(qz().leaveSure, qz().leaveYes, qz().stay))) return;
      state.play = null;
      state.qzStats = null;
      return render();
    }
    if ("quizBack" in d) {
      state.play = null;
      state.qzStats = null;
      return render();
    }
    if (d.reportQ) return openReport("quiz:" + d.reportQ, "autre");
    if (d.space) return setSpace(d.space);
    if (d.openB) {
      state.bFicheId = d.openB;
      render();
      return window.scrollTo({ top: 0 });
    }
    if ("bback" in d) {
      state.bFicheId = null;
      return render();
    }
    if (d.bbranche !== undefined) {
      state.bf = { ...state.bf, branche: d.bbranche, domaine: "", n: 30 };
      saveBPref({ branche: d.bbranche, domaine: "" });
      if (state.tab !== "bfind") state.tab = "bfind";
      return render();
    }
    if (d.bdomaine !== undefined) {
      state.bf = { ...state.bf, domaine: d.bdomaine, n: 30 };
      saveBPref({ domaine: d.bdomaine });
      return render();
    }
    // Depuis l'accueil : un type ou un pays ouvre l'exploration sur toutes les filières, déjà filtrée.
    if (d.btype !== undefined) {
      const onFind = state.tab === "bfind";
      state.bf = onFind ? { ...state.bf, type: d.btype, n: 30 } : { branche: "", type: d.btype };
      state.tab = "bfind";
      return render();
    }
    if (d.bpaysGo !== undefined || d.bpays !== undefined) {
      const v = d.bpaysGo ?? d.bpays;
      const onFind = state.tab === "bfind";
      state.bf = onFind ? { ...state.bf, pays: v, n: 30 } : { branche: "", pays: v };
      state.tab = "bfind";
      return render();
    }
    if (d.bserie !== undefined) {
      try {
        state.user = await api().update({ profil: { serie: state.user?.profil?.serie === d.bserie ? "" : d.bserie } });
        const info = serieInfo();
        if (info) state.bf = { ...state.bf, branche: info[0], domaine: "" };
        else state.bf = {};
        render();
      } catch (e) {
        toast(e.message);
      }
      return;
    }
    if (d.bniveauPref !== undefined) {
      const next = bPref().niveau === d.bniveauPref ? "" : d.bniveauPref;
      state.bf = { ...state.bf, niveau: next };
      saveBPref({ niveau: next });
      state.user = { ...state.user, bourse_profil: { ...bPref(), niveau: next } };
      return render();
    }
    if ("bclearq" in d) {
      state.bf = { ...state.bf, q: "" };
      return render();
    }
    if ("bmore" in d) {
      state.bf = { ...state.bf, n: (state.bf.n || 30) + 30 };
      return render();
    }
    if ("bunlock" in d) return openPaywall();
    if (d.conseil) return openConseil(d.conseil);
    if ("conseilBack" in d) {
      state.conseilId = null;
      state.conseilBody = null;
      return render();
    }
    if (d.bniveau !== undefined) {
      state.bf = { ...state.bf, niveau: d.bniveau, n: 30 };
      saveBPref({ niveau: d.bniveau });
      return render();
    }
    if ("bchange" in d) {
      state.bf = {};
      return render();
    }
    if (d.followB) {
      const id = d.followB;
      try {
        state.user = await api().followBourse(id, !isBFollowed(id));
        render();
      } catch (e) {
        toast(e.message);
        if (e.code === "follow_limit") openPaywall();
      }
      return;
    }
    if ("calendar" in d) return go("concours", { calendrier: true });
    if (d.openCal) return go("concours", { concours: d.openCal, from: "cal" });
    if (d.follow) {
      const id = d.follow;
      try {
        state.user = await api().follow(id, !isFollowed(id));
        render();
      } catch (e) {
        toast(e.message);
        if (e.code === "follow_limit") openPaywall();
      }
      return;
    }
    if (d.annPublish) return publishDraft(d.annPublish, el.closest("[data-ann-row]"));
    if (d.annReject) {
      try {
        await api().adminRejectAnnonce(d.annReject);
      } catch (e) {
        return toast(e.message);
      }
      return openAdmin();
    }
    if (d.legal) return openLegal(d.legal);
    if ("export" in d) return exportMyData();
    if ("deleteAccount" in d) return openDeleteAccount();
    if (d.plan) {
      state.plan = d.plan;
      return openPaywall();
    }
    if ("reveal" in d) {
      state.exam = { ...state.exam, revealed: true };
      local.set("exam", state.exam);
      return render();
    }
    if (d.report) return openReport(d.report, d.kind);
    if (d.closeReport) {
      try {
        await api().adminCloseReport(d.closeReport);
      } catch (e) {
        return toast(e.message);
      }
      return openAdmin();
    }
    if (d.withdrawPaper) {
      try {
        await api().adminSwitch(d.withdrawPaper, d.off === "1");
        state.catalog = null;
        loadCatalog();
      } catch (e) {
        return toast(e.message);
      }
      return openAdmin();
    }
    if ("orient" in d) return go("concours", { orient: true });
    if ("editProfil" in d) {
      state.editProfil = true;
      return render();
    }
    if (d.openOrient) return go("concours", { concours: d.openOrient, from: "orient" });
    if ("back" in d) return navBack();
    if (d.confirm !== undefined) {
      const r = state.confirmResolve;
      state.confirmResolve = null;
      closeModal();
      return r?.(d.confirm === "1");
    }
    if (d.doc) {
      const meta = epreuveMeta(d.doc);
      if (d.mode === "corriges" && !premium()) return openPaywall();
      if (d.mode === "epreuves" && !canSee(meta, "epreuves")) {
        if (!state.user.free_id) return confirmFree(meta);
        return openPaywall();
      }
      return go(d.mode, { concours: meta.concours, doc: d.doc });
    }
    if (d.freeYes) {
      closeModal();
      const meta = epreuveMeta(d.freeYes);
      return go("epreuves", { concours: meta.concours, doc: d.freeYes });
    }
    if (d.start) return startExam(d.start);
    if (d.reloadCorr) return loadDoc(d.reloadCorr, "corriges");
    if ("reloadExam" in d) {
      state.examError = null;
      return render();
    }
    if ("begin" in d) return beginCompose();
    if ("finish" in d) return confirmFinish();
    if ("finishYes" in d) {
      closeModal();
      return finishExam(false);
    }
    if ("quit" in d) {
      state.exam = null;
      state.examDoc = null;
      state.examError = null;
      local.del("exam");
      releaseWakeLock();
      return render();
    }
    if ("saveScore" in d) return saveSelfScore();
    if ("pay" in d) return openPaywall();
    if ("sync" in d) return syncPayment();
    if ("account" in d) return openAccount();
    if ("admin" in d) return openAdmin();
    if ("logout" in d) {
      closeModal();
      setSession(null, null);
      state.catalog = null;
      state.docCache = {};
      state.oralCache = {};
      return render();
    }
    if ("close" in d) return closeModal();
  });

  function confirmFree(e) {
    const L = t();
    const c = concoursById(e.concours);
    modal(`
      <h2>${L.confirmFreeTitle}</h2>
      <p><b>${esc(c.sigle)} · ${esc(e.matiere)} · ${L.session(e.annee)}</b></p>
      <p class="muted">${L.confirmFreeText}</p>
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        <button type="button" class="btn btn-primary" data-free-yes="${e.id}">${L.confirmFreeYes}</button>
        <button type="button" class="btn btn-ghost" data-close>${L.confirmFreeNo}</button>
      </div>`);
  }

  function confirmFinish() {
    const L = t();
    modal(`
      <h2>${L.finishTitle}</h2>
      <p class="muted">${L.finishText(clock(state.exam.end - Date.now()))}</p>
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        <button type="button" class="btn btn-primary" data-finish-yes>${L.finishYes}</button>
        <button type="button" class="btn btn-ghost" data-close>${L.finishNo}</button>
      </div>`);
  }

  document.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    const f = ev.target;
    if (f.id === "pay-form") return submitPay(f);
    if (f.id === "profil-form") return submitProfil(f);
    if (f.id === "report-form") return submitReport(f);
    if (f.id === "plan-form") return submitPlan(f);
    if (f.id === "delete-form") return submitDelete(f);
    if (f.id === "ann-form") return submitAnnonce(f);
    if (f.id === "fiche-form") return submitFiche(f);
    if (f.id === "bourse-form") return submitBourse(f);
    if (f.id === "bsearch-form") {
      ev.preventDefault();
      const q = String(new FormData(f).get("q") || "").trim();
      state.bf = state.tab === "bfind" ? { ...state.bf, q, n: 30 } : { branche: "", q };
      state.tab = "bfind";
      return render();
    }
    if (f.id === "bpref-form") {
      const fd = new FormData(f);
      state.bf = { branche: fd.get("branche"), domaine: fd.get("domaine"), niveau: fd.get("niveau") };
      try {
        state.user = await api().update({ bourse_profil: { branche: fd.get("branche"), domaine: fd.get("domaine"), niveau: fd.get("niveau") } });
        toast(br().saved);
      } catch (e) {
        toast(e.message);
      }
      return render();
    }
    if (f.id === "grant-form") return submitGrant(f);
    if (f.id === "auth-form") {
      const err = f.querySelector("#auth-err");
      const btn = f.querySelector("button[type=submit]");
      err.hidden = true;
      btn.disabled = true;
      try {
        const b = Object.fromEntries(new FormData(f));
        const r = state.authMode === "register" ? await api().register(b) : await api().login(b);
        setSession(r.token, r.user);
        render();
      } catch (e) {
        err.textContent = e.message;
        err.hidden = false;
        btn.disabled = false;
      }
    }
  });

  document.addEventListener("input", (ev) => {
    if (ev.target.dataset?.score !== undefined) {
      (state.selfScores[state.exam.id] ||= {})[ev.target.dataset.score] = ev.target.value;
      return updateSelfTotal();
    }
    if (ev.target.id !== "concours-search") return;
    state.q = ev.target.value;
    const list = document.getElementById("concours-list");
    if (list) list.innerHTML = concoursList();
  });

  // ---------- Démarrage ----------
  async function init() {
    render();
    setInterval(tick, 500);
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 70000); // le serveur gratuit peut mettre ~1 min à se réveiller
      const res = await fetch("/api/config", { signal: ctrl.signal });
      clearTimeout(timer);
      const cfg = res.ok ? await res.json() : null;
      if (cfg?.mode === "live") {
        state.demo = false;
        state.config = cfg;
      }
    } catch {}
    if (state.demo && !window.WELDON_DEMO) {
      state.booting = false;
      document.getElementById("root").innerHTML = `<div class="auth"><div class="auth-card">${BRAND}<p class="err">Le serveur Weldon ne répond pas. Réessayez dans un instant. · The Weldon server is not responding. Please try again shortly.</p></div></div>`;
      return;
    }
    if (state.token) {
      try {
        state.user = await api().me();
      } catch {
        setSession(null, null);
      }
    }
    state.booting = false;
    render();
    handleReturnFromPayment();
    if (state.user) scheduleReminder(); // remet en place le rappel quotidien choisi (application Android)
    if ("serviceWorker" in navigator && !state.demo) navigator.serviceWorker.register("/sw.js").catch(() => {});
  }

  init();
})();
