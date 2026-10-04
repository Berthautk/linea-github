// Weldon — préparation aux concours camerounais, section francophone et section anglophone.
// Fonctionne avec le serveur Weldon (comptes, contenu protégé, paiement Chariow, correction IA)
// ou seule en « mode démo » (contenu embarqué, comptes et paiement simulés dans le navigateur).
(() => {
  "use strict";

  const PREP_SECONDS = 120;

  // ---------- Textes de l'interface ----------
  const T = {
    fr: {
      tabs: { concours: "Concours", epreuves: "Épreuves", corriges: "Corrigés", oral: "Oral", salle: "Salle" },
      tabsLong: { concours: "Les concours", epreuves: "Épreuves", corriges: "Corrigés rédigés", oral: "Préparer l'oral", salle: "Salle d'examen" },
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
      scale: "Barème indicatif",
      oralTitle: "Préparer l'oral",
      oralSub: "Pour les concours qui comportent un oral : comment il se déroule, ce que le jury demande, comment s'y préparer.",
      howOral: "Comment se passe l'oral",
      juryQuestions: "Questions fréquentes du jury",
      tips: "Conseils pour réussir",
      unlockOral: "Débloquer la préparation complète",
      roomTitle: "Salle d'examen",
      roomSub: "Choisissez une école, une session, puis l'épreuve par laquelle vous voulez commencer. Le chronomètre suit la durée officielle.",
      steps: ["1. Préparation", "2. Composition", "3. Correction"],
      startsIn: "La composition commence dans",
      subjectAuto: "Le sujet s'affichera automatiquement.",
      ready: "Je suis prêt, commencer maintenant",
      setup: "Installez-vous comme le jour J",
      checklist: ["Un cahier ou des feuilles de copie", "Deux stylos (bleu ou noir) et une règle", "Un endroit calme, sans bruit autour de vous", "Téléphone en silencieux, pas d'aide extérieure", "Une bouteille d'eau"],
      handwrite: "Écrivez votre copie à la main, comme au concours. À la fin, vous la photographierez pour la correction.",
      quitRoom: "Quitter la salle",
      timeLeft: "Temps restant",
      done: "J'ai terminé",
      keepOpen: "Gardez cette page ouverte. Si vous la fermez, le chronomètre continue.",
      timeUp: "Temps écoulé",
      finished: "Copie terminée",
      timeUsed: "Temps utilisé",
      outOf: (d) => `sur ${d} accordées`,
      photoTitle: "Photographiez votre copie",
      photoSub: "Une photo par page, bien éclairée, à plat. Jusqu'à 6 pages.",
      addPhotos: "Prendre ou ajouter des photos",
      correctMe: "Corriger ma copie",
      directCorrige: "Voir directement le corrigé",
      newPaper: "Nouvelle épreuve",
      correcting: "Correction en cours…",
      correctingSub: "L'IA lit votre copie et la compare au corrigé. Cela prend environ une minute.",
      exampleCorrection:
        "<b>Exemple de correction.</b> La correction automatique n'est pas encore activée : la correction affichée est un exemple. Une fois activée, l'IA lira vraiment les photos de votre copie.",
      appreciation: "Appréciation du correcteur",
      strengths: "Points forts",
      weaknesses: "Points à améliorer",
      language: "Langue",
      tutorTips: "Conseils du répétiteur",
      shouldWrite: "Ce qu'il fallait écrire",
      modelAnswer: "Corrigé rédigé",
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
      oneTime: "Un seul paiement. Pas de renouvellement automatique.",
      perks: [
        "Toutes les épreuves, classées par école et par session",
        "Tous les corrigés entièrement rédigés",
        "La préparation à l'oral de chaque concours",
        "La salle d'examen chronométrée avec correction de votre copie",
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
      tabs: { concours: "Exams", epreuves: "Papers", corriges: "Answers", oral: "Oral", salle: "Exam room" },
      tabsLong: { concours: "Competitions", epreuves: "Past papers", corriges: "Model answers", oral: "Oral preparation", salle: "Exam room" },
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
      scale: "Marking guide",
      oralTitle: "Oral preparation",
      oralSub: "For competitions with an oral: how it works, what the panel asks and how to prepare.",
      howOral: "How the oral works",
      juryQuestions: "Frequent panel questions",
      tips: "Tips to succeed",
      unlockOral: "Unlock the full preparation",
      roomTitle: "Exam room",
      roomSub: "Choose a school, a session, then the paper you want to start with. The timer follows the official duration.",
      steps: ["1. Get ready", "2. Writing", "3. Marking"],
      startsIn: "The paper starts in",
      subjectAuto: "The question paper will appear automatically.",
      ready: "I'm ready, start now",
      setup: "Set up as on exam day",
      checklist: ["An exercise book or answer sheets", "Two pens (blue or black) and a ruler", "A quiet place with no noise around you", "Phone on silent, no outside help", "A bottle of water"],
      handwrite: "Write your answers by hand, as in the real exam. At the end, you will photograph your script for marking.",
      quitRoom: "Leave the exam room",
      timeLeft: "Time left",
      done: "I've finished",
      keepOpen: "Keep this page open. If you close it, the timer keeps running.",
      timeUp: "Time is up",
      finished: "Script handed in",
      timeUsed: "Time used",
      outOf: (d) => `out of ${d} allowed`,
      photoTitle: "Photograph your script",
      photoSub: "One photo per page, well lit, flat. Up to 6 pages.",
      addPhotos: "Take or add photos",
      correctMe: "Mark my script",
      directCorrige: "Go straight to the model answer",
      newPaper: "New paper",
      correcting: "Marking in progress…",
      correctingSub: "The AI is reading your script and comparing it with the model answer. This takes about a minute.",
      exampleCorrection:
        "<b>Sample marking.</b> Automatic marking is not switched on yet: the marking shown is an example. Once switched on, the AI will really read the photos of your script.",
      appreciation: "Examiner's comment",
      strengths: "Strengths",
      weaknesses: "To improve",
      language: "Language",
      tutorTips: "Tutor's advice",
      shouldWrite: "What you should have written",
      modelAnswer: "Model answer",
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
      oneTime: "One payment. No automatic renewal.",
      perks: [
        "All past papers, by school and session",
        "All fully written model answers",
        "Oral preparation for every competition",
        "The timed exam room with marking of your script",
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
    config: { price_xaf: 10000, payment_enabled: false, ai_enabled: false },
    token: local.get("token", null),
    user: null,
    catalog: null,
    tab: local.get("tab", "concours"),
    nav: {}, // par onglet : { concours: id } puis { doc: id }
    authMode: "login",
    exam: local.get("exam", null),
    examDoc: null,
    photos: [],
    correction: null,
    docCache: {},
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
    sujet: (id) => http(`/api/epreuves/${id}/sujet`),
    corrige: (id) => http(`/api/epreuves/${id}/corrige`),
    oral: (cid, l) => http(`/api/oral/${cid}?lang=${l}`),
    checkout: (b) => http("/api/checkout", { method: "POST", body: b }),
    verifySale: (id) => http("/api/verify-sale", { method: "POST", body: { sale_id: id } }),
    sync: () => http("/api/sync-subscription", { method: "POST" }),
    correct: (b) => http("/api/correct", { method: "POST", body: b }),
    adminUsers: () => http("/api/admin/users"),
    grant: (b) => http("/api/admin/grant", { method: "POST", body: b }),
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
      config: async () => ({ mode: "demo", price_xaf: 10000, payment_enabled: false, ai_enabled: false }),
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
        return save(u);
      },
      async catalog(l) {
        const d = C();
        return {
          lang: l,
          groupes: Object.fromEntries(Object.entries(d.groupes).map(([k, v]) => [k, v[l]])),
          concours: d.concours.filter((c) => c[l]).map((c) => ({ id: c.id, sigle: c.sigle, couleur: c.couleur, groupe: c.groupe, oral: c.oral, ...c[l] })),
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
        const { corrige, bareme, ...s } = e;
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
      correct: async () => ({ ...C().correction_demo[lang()], demo: true }),
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
    epreuves: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M8 13h8M8 17h5"/></svg>',
    corriges: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M8.5 15l2.5 2.5 4.5-5"/></svg>',
    oral: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>',
    salle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5M9 2h6"/></svg>',
    lock: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/></svg>',
    info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8h.01M11 12h1v5h1"/></svg>',
    camera: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="30" height="30"><path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13.5" r="3.5"/></svg>',
    back: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>',
    chevron: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>',
    user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>',
  };
  const LOGO = `<svg class="brand-mark" viewBox="0 0 40 40" aria-hidden="true"><rect width="40" height="40" rx="11" fill="var(--green)"/><path d="M9 12l4.6 16L20 15l6.4 13L31 12" fill="none" stroke="var(--green-ink)" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/><circle cx="31" cy="9" r="4" fill="var(--sun)"/></svg>`;
  const BRAND = `<div class="brand">${LOGO}<span class="brand-name">Wel<span>don</span></span></div>`;

  const TABS = ["concours", "epreuves", "corriges", "oral", "salle"];
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
    const nav = TABS.map(
      (id) =>
        `<button type="button" data-tab="${id}" ${state.tab === id ? 'aria-current="page"' : ""}>${I[id]}<span>${L.tabsLong[id]}</span>${
          PREMIUM_TABS.has(id) && !premium() ? `<span class="lock">${I.lock}</span>` : ""
        }</button>`
    ).join("");
    const tabs = TABS.map((id) => `<button type="button" data-tab="${id}" ${state.tab === id ? 'aria-current="page"' : ""}>${I[id]}<span>${L.tabs[id]}</span></button>`).join("");
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
          <main class="view" id="view"></main>
        </div>
        <nav class="tabbar" aria-label="Sections">${tabs}</nav>
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
      <div class="section-head"><div><span class="eyebrow">${L.presentation}</span><h2>${L.pickConcours}</h2></div><p class="muted small">${L.pickConcoursSub}</p></div>
      ${schoolGroups("fiche")}`;
  }

  // Cartes des écoles, regroupées par ministère / institution.
  function schoolGroups(mode) {
    const L = t();
    const groups = {};
    for (const c of state.catalog.concours) (groups[c.groupe] ||= []).push(c);
    return Object.entries(groups)
      .map(([g, list]) => {
        const cards = list
          .map((c) => {
            const eps = epreuvesOf(c.id);
            const years = new Set(eps.map((e) => e.annee));
            const foot =
              mode === "fiche"
                ? `<span class="tag tag-line">${L.writtenPapers(c.fiche.epreuves_officielles.length)}</span>${c.oral ? `<span class="tag tag-indigo">${L.oralYes}</span>` : `<span class="tag tag-line">${L.oralNo}</span>`}`
                : `<span class="tag tag-line">${L.sessions(years.size)}</span><span class="tag tag-line">${L.papers(eps.length)}</span>`;
            return `
              <button type="button" class="card card-click" data-school="${c.id}" data-mode="${mode}">
                <div class="row"><div class="sigle c-${c.couleur}">${esc(c.sigle)}</div>
                  <div style="min-width:0"><h3>${esc(c.nom)}</h3><span class="small muted">${esc(c.organisme)}</span></div></div>
                ${mode === "fiche" ? `<p class="muted small">${esc(c.resume)}</p>` : ""}
                <div class="foot"><span class="row">${foot}</span>${I.chevron}</div>
              </button>`;
          })
          .join("");
        return `<section class="group"><h3 class="group-label">${esc(state.catalog.groupes[g] || g)}</h3><div class="grid">${cards}</div></section>`;
      })
      .join("");
  }

  function viewFiche(c) {
    const L = t();
    const f = c.fiche;
    const rows = f.epreuves_officielles
      .map((e) => `<tr><td>${esc(e.nom)}</td><td>${e.duree ? hm(e.duree) : "—"}</td><td>${esc(e.coef)}</td><td>${e.note_eliminatoire ? e.note_eliminatoire + "/20" : "—"}</td></tr>`)
      .join("");
    const n = epreuvesOf(c.id).length;
    return `
      <button type="button" class="back" data-back>${I.back} ${L.allConcours}</button>
      <div class="row" style="display:flex;gap:14px;align-items:center;flex-wrap:wrap">
        <div class="sigle c-${c.couleur}" style="width:64px;height:64px">${esc(c.sigle)}</div>
        <div style="min-width:0"><span class="eyebrow">${esc(c.organisme)}</span><h1>${esc(c.nom)}</h1></div>
      </div>
      <div class="fiche">
        <div style="display:grid;gap:16px;min-width:0">
          <article class="card"><h3>${L.presentation}</h3><p>${esc(f.presentation)}</p></article>
          <article class="card"><h3>${L.ficheHistory}</h3><p>${esc(f.historique)}</p></article>
          <article class="card"><h3>${L.ficheConditions}</h3><ul class="clean">${f.conditions.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></article>
          <article class="card"><h3>${L.fichePapers}</h3>
            <div class="table-wrap"><table><thead><tr><th>${L.thPaper}</th><th>${L.thDuration}</th><th>${L.thCoef}</th><th>${L.thElim}</th></tr></thead><tbody>${rows}</tbody></table></div>
            <p class="small muted">${esc(f.autres_epreuves)}</p></article>
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
      salle: premium() ? `<div class="section-head"><div><span class="eyebrow">${L.section}</span><h1>${L.roomTitle}</h1></div><p class="muted small">${L.roomSub}</p></div>` : lockedIntro("salle"),
    }[mode];
    if (!nav.concours) return intro + demoNotice() + `<p class="eyebrow">${L.chooseSchool}</p>` + schoolGroups(mode);
    return viewSessions(concoursById(nav.concours), mode);
  }

  function viewSessions(c, mode) {
    const L = t();
    const eps = epreuvesOf(c.id);
    const years = [...new Set(eps.map((e) => e.annee))].sort((a, b) => b - a);
    const blocks = years
      .map((y) => {
        const rows = eps
          .filter((e) => e.annee === y)
          .map((e) => {
            const open = canSee(e, mode);
            const free = state.user.free_id === e.id && !premium() ? `<span class="tag tag-green">${L.offered}</span>` : "";
            const action = mode === "salle" ? `data-start="${e.id}"` : `data-doc="${e.id}" data-mode="${mode}"`;
            const right = open ? `<span class="muted">${hm(e.duree)}</span>${I.chevron}` : `<span class="lock-pill">${I.lock}${mode === "epreuves" && !state.user.free_id ? L.readFree : L.locked}</span>`;
            return `<button type="button" class="paper-row" ${action}>
                <span style="min-width:0"><b>${esc(e.matiere)}</b><span class="small muted">${hm(e.duree)}${e.exemple ? " · " + L.sampleTag : ""}</span></span>
                <span class="row">${free}${right}</span></button>`;
          })
          .join("");
        return `<section class="session"><div class="year-label">${L.session(y)}</div><div class="paper-list">${rows}</div></section>`;
      })
      .join("");
    return `
      <button type="button" class="back" data-back>${I.back} ${L.backTo(L.tabsLong[mode])}</button>
      <div class="row" style="display:flex;gap:14px;align-items:center;flex-wrap:wrap">
        <div class="sigle c-${c.couleur}">${esc(c.sigle)}</div>
        <div style="min-width:0"><span class="eyebrow">${esc(c.organisme)}</span><h1>${esc(c.nom)}</h1></div>
      </div>
      ${mode !== "epreuves" && !premium() ? lockedIntro(mode) : ""}
      ${blocks || `<p class="muted">${L.noPapers}</p>`}`;
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
      <div><span class="eyebrow">${esc(c.nom)} · ${L.session(meta.annee)}</span>
        <h1>${isCorrige ? L.modelAnswer + " — " : ""}${esc(meta.matiere)}</h1></div>
      <div class="row" style="display:flex;gap:8px;flex-wrap:wrap">
        <span class="tag tag-line">${L.duration(hm(meta.duree))}</span>
        ${meta.exemple ? `<span class="tag tag-sun">${L.sampleTag}</span>` : ""}
      </div>
      ${protectedPaper(isCorrige ? doc.corrige : doc.sujet, isCorrige ? "" : "ruled")}
      ${isCorrige && doc.bareme ? `<article class="card protected"><h3>${L.scale}</h3><p class="small" style="white-space:pre-wrap">${esc(doc.bareme)}</p></article>` : ""}
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        ${
          isCorrige
            ? `<button type="button" class="btn btn-ghost" data-doc="${id}" data-mode="epreuves">${L.seeSujet}</button>`
            : `<button type="button" class="btn btn-primary" data-doc="${id}" data-mode="corriges">${premium() ? "" : I.lock + " "}${L.seeCorrige}</button>`
        }
        <button type="button" class="btn btn-ghost" data-start="${id}">${premium() ? "" : I.lock + " "}${L.composeRoom}</button>
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
    try {
      state.docCache[key] = mode === "corriges" ? await api().corrige(id) : await api().sujet(id);
      if (mode === "epreuves" && !premium() && !state.user.free_id) state.user.free_id = id;
      render();
    } catch (e) {
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
        api()
          .sujet(ex.id)
          .then((d) => {
            state.examDoc = d;
            render();
          })
          .catch((e) => toast(e.message));
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
    state.photos = [];
    state.correction = null;
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
    const photos = state.photos
      .map((p, i) => `<figure><img src="${p.url}" alt="Page ${i + 1}"><button type="button" data-rm="${i}" aria-label="×">×</button></figure>`)
      .join("");
    return `
      ${steps(2)}
      <div><span class="eyebrow">${esc(e.matiere)} · ${hm(e.duree)}</span><h1>${ex.auto ? L.timeUp : L.finished}</h1></div>
      <div class="fb-cols">
        <article class="card"><span class="eyebrow">${L.timeUsed}</span><div class="countdown" style="font-size:3rem;text-align:left">${hm(used)}</div>
          <p class="small muted">${L.outOf(hm(e.duree))}</p></article>
        <article class="card"><h3>${L.photoTitle}</h3>
          <p class="small muted">${L.photoSub}</p>
          <label class="drop" for="photo-input">${I.camera}<span>${L.addPhotos}</span></label>
          <input id="photo-input" type="file" accept="image/*" capture="environment" multiple hidden>
          ${photos ? `<div class="photos">${photos}</div>` : ""}
        </article>
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        <button type="button" class="btn btn-primary" data-correct ${state.photos.length || !state.config.ai_enabled ? "" : "disabled"}>${L.correctMe}</button>
        <button type="button" class="btn btn-ghost" data-doc="${e.id}" data-mode="corriges">${L.directCorrige}</button>
        <button type="button" class="btn btn-ghost" data-quit>${L.newPaper}</button>
      </div>
      <div id="correction">${state.correction ? correctionHtml(state.correction) : ""}</div>`;
  }

  function correctionHtml(r) {
    const L = t();
    if (r.error) return `<p class="err">${esc(r.error)}</p>`;
    if (r.loading) return `<article class="card"><b>${L.correcting}</b><p class="small muted">${L.correctingSub}</p></article>`;
    const pct = Math.max(0, Math.min(100, (r.note_sur_20 / 20) * 100));
    const list = (arr) => `<ul class="clean">${(arr || []).map((x) => `<li>${esc(x)}</li>`).join("")}</ul>`;
    const corr = state.docCache[`corriges:${state.exam.id}`];
    return `
      ${r.demo ? `<div class="notice">${I.info}<span>${L.exampleCorrection}</span></div>` : ""}
      <article class="card">
        <div class="score"><div class="score-ring" style="--p:${pct}"><div><b>${String(r.note_sur_20).replace(".", lang() === "fr" ? "," : ".")}</b><small>/20</small></div></div>
          <div style="min-width:0;flex:1 1 240px"><span class="eyebrow">${L.appreciation}</span><p>${esc(r.appreciation)}</p></div></div>
      </article>
      <div class="fb-cols">
        <article class="card fb-good"><h3>${L.strengths}</h3>${list(r.points_forts)}</article>
        <article class="card fb-bad"><h3>${L.weaknesses}</h3>${list(r.points_faibles)}</article>
        ${r.erreurs_langue?.length ? `<article class="card"><h3>${L.language}</h3>${list(r.erreurs_langue)}</article>` : ""}
        <article class="card"><h3>${L.tutorTips}</h3>${list(r.conseils)}<p class="small muted">${esc(r.gestion_du_temps)}</p></article>
      </div>
      ${corr ? `<div><span class="eyebrow">${L.shouldWrite}</span><h2>${L.modelAnswer}</h2></div>${protectedPaper(corr.corrige)}` : ""}`;
  }

  function compress(file) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        const scale = Math.min(1, 1600 / Math.max(img.width, img.height));
        const cv = document.createElement("canvas");
        cv.width = Math.round(img.width * scale);
        cv.height = Math.round(img.height * scale);
        cv.getContext("2d").drawImage(img, 0, 0, cv.width, cv.height);
        const dataUrl = cv.toDataURL("image/jpeg", 0.8);
        URL.revokeObjectURL(url);
        resolve({ url: dataUrl, media_type: "image/jpeg", data: dataUrl.split(",")[1] });
      };
      img.onerror = () => reject(new Error("Image illisible"));
      img.src = url;
    });
  }

  async function runCorrection() {
    const ex = state.exam;
    state.correction = { loading: true };
    render();
    try {
      const corrKey = `corriges:${ex.id}`;
      if (!state.docCache[corrKey]) state.docCache[corrKey] = await api().corrige(ex.id);
      if (!state.config.ai_enabled) {
        await new Promise((ok) => setTimeout(ok, 1200));
        state.correction = { ...(state.demo ? await demo.correct() : await sampleCorrection()), demo: true };
      } else {
        state.correction = await api().correct({
          epreuve_id: ex.id,
          temps_utilise_minutes: Math.round((ex.finishedAt - ex.start) / 60000),
          images: state.photos.map(({ media_type, data }) => ({ media_type, data })),
        });
      }
    } catch (e) {
      state.correction = { error: e.message };
    }
    render();
    document.getElementById("correction")?.scrollIntoView({ behavior: "smooth" });
  }

  // Exemple de correction quand l'IA n'est pas activée sur le serveur.
  async function sampleCorrection() {
    const fr = lang() === "fr";
    return {
      note_sur_20: 11.5,
      appreciation: fr
        ? "Exemple : copie sérieuse et organisée, mais l'argumentation reste trop générale."
        : "Example: serious, organised script, but the argument remains too general.",
      points_forts: fr ? ["Introduction claire", "Plan visible"] : ["Clear introduction", "Visible plan"],
      points_faibles: fr ? ["Exemples peu précis", "Conclusion sans ouverture"] : ["Vague examples", "Conclusion without an opening"],
      erreurs_langue: [],
      conseils: fr ? ["Citez des exemples précis tirés du Cameroun."] : ["Use precise examples from Cameroon."],
      gestion_du_temps: "",
    };
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
      <button type="button" class="btn btn-ghost btn-block" data-logout>${L.logout}</button>`);
  }

  async function openAdmin() {
    const L = t();
    modal(`<h2>${L.admin}</h2><p class="muted">…</p>`, true);
    try {
      const users = await api().adminUsers();
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
        <h3>${L.adminUsers} (${users.length})</h3>
        <div class="table-wrap"><table><thead><tr><th>${L.thUser}</th><th>Section</th><th>${L.thStatus}</th></tr></thead><tbody>${rows}</tbody></table></div>`,
        true
      );
    } catch (e) {
      toast(e.message);
    }
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
          <h2 class="price">${fmtNum(state.config.price_xaf)} <small>${L.perYearShort}</small></h2>
          <span style="font-weight:700">${L.oneTime}</span>
        </div>
        <div class="modal-body">
          <ul class="perks">${L.perks.map(perk).join("")}</ul>
          <form class="form" id="pay-form" novalidate>
            <p class="small full">${L.payAs(esc(state.user.email))}</p>
            <div class="field full"><label for="pf-phone">${L.momo}</label><input id="pf-phone" name="phone" type="tel" inputmode="numeric" autocomplete="tel" required placeholder="6XX XX XX XX"></div>
            <p class="err full" id="pay-err" hidden></p>
            <button class="btn btn-primary btn-block full" type="submit" id="pay-btn">${state.demo ? L.simulatePay : L.pay(fcfa(state.config.price_xaf))}</button>
            <p class="small muted full">${L.payInfo}</p>
          </form>
          <p class="small">${L.alreadyPaid} <button type="button" class="linkish" data-sync>${L.checkPayment}</button></p>
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
  }

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
      const r = await api().checkout({ phone, country_code: "CM" });
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
    const tab = state.tab;
    if (tab === "concours") v.innerHTML = viewConcours();
    else if (tab === "epreuves") v.innerHTML = viewBrowse("epreuves");
    else if (tab === "corriges") v.innerHTML = viewBrowse("corriges");
    else if (tab === "oral") v.innerHTML = viewOral();
    else if (tab === "salle") v.innerHTML = viewSalle();
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
      state.exam = null;
      local.del("exam");
      return render();
    }
    if (d.tab) return go(d.tab, {});
    if (d.jump) return go(d.jump, { concours: d.c });
    if (d.school) return go(d.mode === "fiche" ? "concours" : d.mode, { concours: d.school });
    if (d.oral) return go("oral", { concours: d.oral });
    if ("back" in d) {
      const nav = state.nav[state.tab] || {};
      return go(state.tab, nav.doc ? { concours: nav.concours } : {});
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
    if ("begin" in d) return beginCompose();
    if ("finish" in d) return confirmFinish();
    if ("finishYes" in d) {
      closeModal();
      return finishExam(false);
    }
    if ("quit" in d) {
      state.exam = null;
      state.examDoc = null;
      state.photos = [];
      state.correction = null;
      local.del("exam");
      releaseWakeLock();
      return render();
    }
    if (d.rm) {
      state.photos.splice(Number(d.rm), 1);
      return render();
    }
    if ("correct" in d) return runCorrection();
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

  document.addEventListener("change", async (ev) => {
    if (ev.target.id !== "photo-input") return;
    for (const f of [...ev.target.files].slice(0, 6 - state.photos.length)) {
      try {
        state.photos.push(await compress(f));
      } catch {
        toast("×");
      }
    }
    render();
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
    if ("serviceWorker" in navigator && !state.demo) navigator.serviceWorker.register("/sw.js").catch(() => {});
  }

  init();
})();
