// Weldon — application de préparation aux concours camerounais.
// Fonctionne avec le serveur Weldon (paiement Chariow + correction IA) ou seule en « mode démo ».
(() => {
  "use strict";

  const D = window.WELDON_DATA;
  const PRICE = 10000;
  const PREP_SECONDS = 120;

  // ---------- Stockage local (tolérant aux erreurs) ----------
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

  const deviceId = local.get("device", null) || (() => {
    const id = (crypto.randomUUID && crypto.randomUUID()) || String(Date.now()) + Math.random().toString(16).slice(2);
    local.set("device", id);
    return id;
  })();

  const state = {
    tab: local.get("tab", "concours"),
    sub: null,
    filter: "all",
    demo: true,
    config: { price_xaf: PRICE, payment_enabled: false, ai_enabled: false },
    access: local.get("access", null),
    freeId: local.get("free", null),
    exam: local.get("exam", null),
    photos: [],
    correction: null,
  };

  // ---------- Icônes ----------
  const I = {
    concours: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18M5 21V10l7-5 7 5v11M9 21v-6h6v6"/></svg>',
    epreuves: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M8 13h8M8 17h5"/></svg>',
    corriges: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M8.5 15l2.5 2.5 4.5-5"/></svg>',
    oral: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>',
    salle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5M9 2h6"/></svg>',
    lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/></svg>',
    info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8h.01M11 12h1v5h1"/></svg>',
    camera: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="30" height="30"><path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13.5" r="3.5"/></svg>',
    back: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>',
  };

  const TABS = [
    { id: "concours", label: "Concours", long: "Les concours", premium: false },
    { id: "epreuves", label: "Épreuves", long: "Épreuves", premium: false },
    { id: "corriges", label: "Corrigés", long: "Corrigés rédigés", premium: true },
    { id: "oral", label: "Oral", long: "Préparer l'oral", premium: true },
    { id: "salle", label: "Salle", long: "Salle d'examen", premium: true },
  ];

  // ---------- Utilitaires ----------
  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const fcfa = (n) => new Intl.NumberFormat("fr-FR").format(n) + " FCFA";
  const concoursById = (id) => D.concours.find((c) => c.id === id);
  const epreuveById = (id) => D.epreuves.find((e) => e.id === id);
  const isPremium = () => Boolean(state.access && Date.parse(state.access.expires_at) > Date.now());
  const hm = (min) => (min >= 60 ? `${Math.floor(min / 60)} h${min % 60 ? " " + String(min % 60).padStart(2, "0") : ""}` : `${min} min`);
  const clock = (ms) => {
    const s = Math.max(0, Math.round(ms / 1000));
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return (h ? h + ":" + String(m).padStart(2, "0") : String(m).padStart(2, "0")) + ":" + String(sec).padStart(2, "0");
  };
  const dateFr = (iso) => new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

  function toast(msg) {
    const t = document.createElement("div");
    t.className = "toast";
    t.setAttribute("role", "status");
    t.textContent = msg;
    document.body.append(t);
    setTimeout(() => t.remove(), 3200);
  }

  async function api(path, { method = "GET", body, auth = false } = {}) {
    const headers = { "Content-Type": "application/json" };
    if (auth && state.access?.token) headers.Authorization = "Bearer " + state.access.token;
    const res = await fetch(path, { method, headers, body: body ? JSON.stringify(body) : undefined });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.error || "Le serveur ne répond pas. Vérifiez votre connexion.");
    return json;
  }

  function setAccess(a) {
    state.access = a;
    if (a) local.set("access", a);
    else local.del("access");
  }

  function go(tab, sub = null) {
    state.tab = tab;
    state.sub = sub;
    local.set("tab", tab);
    render();
    window.scrollTo({ top: 0 });
  }

  // ---------- Coquille de l'application ----------
  function shell() {
    const navItems = TABS.map(
      (t) =>
        `<button type="button" data-tab="${t.id}" ${state.tab === t.id ? 'aria-current="page"' : ""}>${I[t.id]}<span>${t.long}</span>${
          t.premium && !isPremium() ? `<span class="lock" aria-label="Réservé aux abonnés">${I.lock}</span>` : ""
        }</button>`
    ).join("");
    const tabItems = TABS.map(
      (t) => `<button type="button" data-tab="${t.id}" ${state.tab === t.id ? 'aria-current="page"' : ""}>${I[t.id]}<span>${t.label}</span></button>`
    ).join("");
    const logo = `<svg class="brand-mark" viewBox="0 0 40 40" aria-hidden="true"><rect width="40" height="40" rx="11" fill="var(--green)"/><path d="M9 12l4.6 16L20 15l6.4 13L31 12" fill="none" stroke="var(--green-ink)" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/><circle cx="31" cy="9" r="4" fill="var(--sun)"/></svg>`;
    return `
      <div class="app">
        <aside class="sidebar">
          <div class="brand">${logo}<span class="brand-name">Wel<span>don</span></span></div>
          <nav class="nav" aria-label="Sections">${navItems}</nav>
          <div class="sidebar-foot">${accessBox()}</div>
        </aside>
        <div class="main">
          <header class="topbar">
            <div class="brand">${logo}<span class="brand-name">Wel<span>don</span></span></div>
            ${isPremium() ? '<span class="tag tag-green">Abonné</span>' : '<button type="button" class="btn btn-sun" data-pay style="padding:8px 14px">S\'abonner</button>'}
          </header>
          <main class="view" id="view"></main>
        </div>
        <nav class="tabbar" aria-label="Sections">${tabItems}</nav>
      </div>`;
  }

  function accessBox() {
    if (isPremium()) {
      return `<div class="status-pill"><span class="tag tag-green" style="align-self:flex-start">${I.check.replace("<svg", '<svg width="14" height="14"')} Abonné</span>
        <span class="small muted">Accès complet jusqu'au <b>${dateFr(state.access.expires_at)}</b>${state.access.demo ? " (démo)" : ""}</span></div>`;
    }
    return `<div class="status-pill"><b>Accès complet</b><span class="small muted">${fcfa(state.config.price_xaf)} pour 12 mois. Épreuves, corrigés, oral et salle d'examen.</span>
      <button type="button" class="btn btn-sun btn-block" data-pay>S'abonner</button></div>`;
  }

  function demoNotice() {
    return state.demo
      ? `<div class="notice">${I.info}<span><b>Mode démo.</b> Les sujets et corrigés affichés sont des sujets d'entraînement rédigés pour la démonstration. Le paiement et la correction par IA sont simulés.</span></div>`
      : "";
  }

  function lockedTabPage(tab) {
    const what = {
      corriges: ["Corrigés rédigés", "Chaque sujet entièrement corrigé : rédactions, dissertations et questions de culture générale, classés par concours et par année."],
      oral: ["Préparer l'oral", "Déroulement de l'oral, questions fréquentes du jury et conseils, concours par concours."],
      salle: ["Salle d'examen", "Composez en conditions réelles avec le chronomètre officiel, photographiez votre copie et recevez une correction détaillée par l'IA."],
    }[tab];
    return `
      <section class="card" style="gap:14px;padding:clamp(18px,4vw,30px)">
        <span class="tag tag-sun" style="align-self:flex-start">${I.lock.replace("<svg", '<svg width="14" height="14"')} Réservé aux abonnés</span>
        <h1>${what[0]}</h1>
        <p class="muted" style="max-width:56ch">${what[1]}</p>
        <div><button type="button" class="btn btn-sun" data-pay>Débloquer pour ${fcfa(state.config.price_xaf)} / an</button></div>
      </section>`;
  }

  // ---------- Section Concours ----------
  function viewConcours() {
    if (state.sub?.type === "fiche") return viewFiche(concoursById(state.sub.id));
    const nbEpreuves = D.epreuves.length;
    const cards = D.concours
      .map(
        (c) => `
        <button type="button" class="card card-click" data-fiche="${c.id}">
          <div class="row"><div class="sigle c-${c.couleur}">${esc(c.sigle)}</div>
            <div style="min-width:0"><h3>${esc(c.nom)}</h3><span class="small muted">${esc(c.organisme)}</span></div></div>
          <p class="muted small">${esc(c.resume)}</p>
          <div class="foot">
            <span class="tag tag-line">${c.fiche.epreuves_officielles.length} épreuves écrites</span>
            ${c.fiche.oral ? '<span class="tag tag-indigo">Oral</span>' : '<span class="tag tag-line">Pas d\'oral</span>'}
          </div>
        </button>`
      )
      .join("");
    return `
      <section class="hero">
        <div>
          <span class="eyebrow" style="color:inherit;opacity:.85">Prépare ton concours</span>
          <h1>Chaque concours a ses règles. Apprends-les, puis entraîne-toi en conditions réelles.</h1>
          <p>Fiches des concours, épreuves classées par année, corrigés entièrement rédigés, préparation à l'oral et salle d'examen chronométrée.</p>
          <div class="cta">
            <button type="button" class="btn btn-sun" data-tab="salle">Entrer en salle d'examen</button>
            <button type="button" class="btn btn-ghost" data-tab="epreuves">Voir les épreuves</button>
          </div>
        </div>
        <div class="hero-stats">
          <div class="hero-stat"><b>${D.concours.length}</b><span>concours décrits</span></div>
          <div class="hero-stat"><b>${nbEpreuves}</b><span>sujets avec corrigé</span></div>
          <div class="hero-stat"><b>2 h 30</b><span>chrono de la rédaction Police</span></div>
          <div class="hero-stat"><b>1</b><span>épreuve offerte</span></div>
        </div>
      </section>
      ${demoNotice()}
      <div class="section-head"><div><span class="eyebrow">Présentation</span><h2>Choisis ton concours</h2></div>
        <p class="muted small">Conditions, limite d'âge, épreuves, coefficients, oral : tout ce qu'il faut savoir avant de déposer ton dossier.</p></div>
      <div class="grid">${cards}</div>`;
  }

  function viewFiche(c) {
    const f = c.fiche;
    const rows = f.epreuves_officielles
      .map(
        (e) =>
          `<tr><td>${esc(e.nom)}</td><td>${e.duree ? hm(e.duree) : "—"}</td><td>${esc(e.coef)}</td><td>${e.note_eliminatoire ? e.note_eliminatoire + "/20" : "—"}</td></tr>`
      )
      .join("");
    const nb = D.epreuves.filter((e) => e.concours === c.id).length;
    return `
      <button type="button" class="back" data-back>${I.back} Tous les concours</button>
      <div class="row" style="display:flex;gap:14px;align-items:center;flex-wrap:wrap">
        <div class="sigle c-${c.couleur}" style="width:64px;height:64px">${esc(c.sigle)}</div>
        <div style="min-width:0"><span class="eyebrow">${esc(c.organisme)}</span><h1>${esc(c.nom)}</h1></div>
      </div>
      <div class="fiche">
        <div style="display:grid;gap:16px;min-width:0">
          <article class="card"><h3>Présentation</h3><p>${esc(f.presentation)}</p></article>
          <article class="card"><h3>Historique</h3><p>${esc(f.historique)}</p></article>
          <article class="card"><h3>Conditions de candidature</h3><ul class="clean">${f.conditions.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></article>
          <article class="card"><h3>Épreuves écrites</h3>
            <div class="table-wrap"><table><thead><tr><th>Épreuve</th><th>Durée</th><th>Coef.</th><th>Note élim.</th></tr></thead><tbody>${rows}</tbody></table></div>
            <p class="small muted">${esc(f.autres_epreuves)}</p></article>
        </div>
        <aside class="card" style="min-width:0">
          <dl class="kv">
            <div><dt>Places</dt><dd>${esc(f.places)}</dd></div>
            <div><dt>Calendrier</dt><dd>${esc(f.calendrier)}</dd></div>
            <div><dt>Oral</dt><dd>${f.oral ? "Oui, pour les admissibles" : "Non"}</dd></div>
            <div><dt>Admission</dt><dd>${esc(f.admission)}</dd></div>
          </dl>
          <div class="notice">${I.info}<span class="small">${esc(f.a_verifier)}</span></div>
          <button type="button" class="btn btn-primary" data-tab-filter="epreuves" data-c="${c.id}">Voir les ${nb} épreuve${nb > 1 ? "s" : ""}</button>
          ${f.oral ? `<button type="button" class="btn btn-ghost" data-tab-filter="oral" data-c="${c.id}">Préparer l'oral</button>` : ""}
          <button type="button" class="btn btn-ghost" data-tab-filter="salle" data-c="${c.id}">S'entraîner en salle</button>
        </aside>
      </div>`;
  }

  // ---------- Épreuves et corrigés ----------
  function filterChips() {
    const chips = [{ id: "all", sigle: "Tous" }, ...D.concours]
      .map((c) => `<button type="button" class="chip" data-filter="${c.id}" aria-pressed="${state.filter === c.id}">${esc(c.sigle)}</button>`)
      .join("");
    return `<div class="chips" role="group" aria-label="Filtrer par concours">${chips}</div>`;
  }

  function groupedByYear(list) {
    const years = [...new Set(list.map((e) => e.annee))].sort((a, b) => b - a);
    return years.map((y) => [y, list.filter((e) => e.annee === y)]);
  }

  function canSeeSujet(e) {
    return isPremium() || state.freeId === e.id;
  }

  function viewEpreuves(mode) {
    // mode : "epreuves" (sujets) ou "corriges"
    if (state.sub?.type === "doc") return viewDoc(epreuveById(state.sub.id), state.sub.mode);
    if (mode === "corriges" && !isPremium()) return lockedTabPage("corriges") + epreuveList(mode);
    const intro =
      mode === "epreuves"
        ? `<div class="section-head"><div><span class="eyebrow">Sujets</span><h1>Épreuves par concours et par année</h1></div>
           <p class="muted small">${
             isPremium()
               ? "Toutes les épreuves sont débloquées."
               : state.freeId
               ? "Votre épreuve offerte est débloquée. Abonnez-vous pour accéder à toutes les autres."
               : "Choisissez <b>une</b> épreuve à lire gratuitement. Les autres sont réservées aux abonnés."
           }</p></div>`
        : `<div class="section-head"><div><span class="eyebrow">Corrections</span><h1>Corrigés rédigés</h1></div>
           <p class="muted small">Chaque sujet entièrement rédigé, comme une copie modèle.</p></div>`;
    return intro + demoNotice() + epreuveList(mode);
  }

  function epreuveList(mode) {
    const list = D.epreuves.filter((e) => state.filter === "all" || e.concours === state.filter);
    const groups = groupedByYear(list)
      .map(([y, items]) => {
        const cards = items
          .map((e) => {
            const c = concoursById(e.concours);
            const open = mode === "corriges" ? isPremium() : canSeeSujet(e);
            const preview = esc((mode === "corriges" ? e.corrige : e.sujet).slice(0, 170)) + "…";
            const free = state.freeId === e.id && !isPremium() ? '<span class="tag tag-green">Offerte</span>' : "";
            return `
              <button type="button" class="card card-click" data-doc="${e.id}" data-mode="${mode}">
                <div class="row"><span class="tag c-${c.couleur}">${esc(c.sigle)}</span><span class="tag tag-line">${hm(e.duree)}</span>${
                  e.exemple ? '<span class="tag tag-sun">Sujet d\'entraînement</span>' : ""
                }${free}</div>
                <h3>${esc(e.matiere)} — ${e.annee}</h3>
                <div class="${open ? "" : "locked"}" style="border-radius:8px">
                  <p class="small muted ${open ? "" : "blur"}">${preview}</p>
                  ${
                    open
                      ? ""
                      : `<div class="lock-overlay"><span class="lock-pill">${I.lock.replace("<svg", '<svg width="16" height="16"')}${
                          mode === "epreuves" && !state.freeId ? "Lire gratuitement" : "Réservé aux abonnés"
                        }</span></div>`
                  }
                </div>
              </button>`;
          })
          .join("");
        return `<section class="year"><div class="year-label">Session ${y}</div><div class="grid">${cards}</div></section>`;
      })
      .join("");
    return filterChips() + (groups || '<p class="muted">Aucune épreuve pour ce concours pour l\'instant.</p>');
  }

  function viewDoc(e, mode) {
    const c = concoursById(e.concours);
    const isCorrige = mode === "corriges";
    const text = isCorrige ? e.corrige : e.sujet;
    return `
      <button type="button" class="back" data-back>${I.back} ${isCorrige ? "Tous les corrigés" : "Toutes les épreuves"}</button>
      <div><span class="eyebrow">${esc(c.nom)} · Session ${e.annee}</span>
        <h1>${isCorrige ? "Corrigé — " : ""}${esc(e.matiere)}</h1></div>
      <div class="row" style="display:flex;gap:8px;flex-wrap:wrap">
        <span class="tag tag-line">Durée ${hm(e.duree)}</span>
        ${e.exemple ? '<span class="tag tag-sun">Sujet d\'entraînement Weldon</span>' : ""}
      </div>
      <article class="paper ${isCorrige ? "" : "ruled"}">${esc(text)}</article>
      ${isCorrige && e.bareme ? `<article class="card"><h3>Barème indicatif</h3><p class="small" style="white-space:pre-wrap">${esc(e.bareme)}</p></article>` : ""}
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        ${
          isCorrige
            ? `<button type="button" class="btn btn-ghost" data-doc="${e.id}" data-mode="epreuves">Revoir le sujet</button>`
            : `<button type="button" class="btn btn-primary" data-doc="${e.id}" data-mode="corriges">${isPremium() ? "" : I.lock.replace("<svg", '<svg width="16" height="16"') + " "}Voir le corrigé</button>`
        }
        <button type="button" class="btn btn-ghost" data-start="${e.id}">Composer en salle d'examen</button>
      </div>`;
  }

  // ---------- Oral ----------
  function viewOral() {
    const withOral = D.concours.filter((c) => c.fiche.oral && D.oral[c.id]);
    const selected = withOral.find((c) => c.id === state.filter) || withOral[0];
    const chips = withOral
      .map((c) => `<button type="button" class="chip" data-filter="${c.id}" aria-pressed="${selected.id === c.id}">${esc(c.sigle)}</button>`)
      .join("");
    const o = D.oral[selected.id];
    const premium = isPremium();
    const lockedBlock = (html) =>
      premium
        ? html
        : `<div class="locked" style="border-radius:var(--radius)"><div class="blur">${html}</div><div class="lock-overlay"><button type="button" class="lock-pill" data-pay style="border:0;cursor:pointer">${I.lock.replace(
            "<svg",
            '<svg width="16" height="16"'
          )}Débloquer la préparation complète</button></div></div>`;
    return `
      <div class="section-head"><div><span class="eyebrow">Oral</span><h1>Préparer l'oral</h1></div>
        <p class="muted small">Pour les concours qui comportent un oral : comment il se déroule, ce que le jury demande, comment s'y préparer.</p></div>
      <div class="chips" role="group" aria-label="Choisir un concours">${chips}</div>
      <article class="card"><span class="eyebrow">${esc(selected.nom)}</span><h2>Comment se passe l'oral</h2><p>${esc(o.deroulement)}</p></article>
      ${lockedBlock(`<div class="fb-cols">
        <article class="card"><h3>Questions fréquentes du jury</h3><ul class="clean">${o.questions.map((q) => `<li>${esc(q)}</li>`).join("")}</ul></article>
        <article class="card"><h3>Conseils pour réussir</h3><ul class="clean">${o.conseils.map((q) => `<li>${esc(q)}</li>`).join("")}</ul></article>
      </div>`)}`;
  }

  // ---------- Salle d'examen ----------
  function viewSalle() {
    if (!isPremium()) return lockedTabPage("salle") + salleChoice(true);
    const ex = state.exam;
    if (ex?.phase === "prep") return salleprep(ex);
    if (ex?.phase === "compose") return salleCompose(ex);
    if (ex?.phase === "done") return salleDone(ex);
    return `
      <div class="section-head"><div><span class="eyebrow">Mise en situation</span><h1>Salle d'examen</h1></div>
        <p class="muted small">Choisissez un concours, puis l'épreuve par laquelle vous voulez commencer. Le chronomètre suit la durée officielle.</p></div>
      ${salleChoice(false)}`;
  }

  function salleChoice(disabled) {
    const list = D.concours
      .map((c) => {
        const eps = D.epreuves.filter((e) => e.concours === c.id);
        if (!eps.length) return "";
        const off = c.fiche.epreuves_officielles.map((o) => `${esc(o.nom)} (${o.duree ? hm(o.duree) : "dossier"})`).join(" · ");
        return `
          <article class="card">
            <div class="row"><div class="sigle c-${c.couleur}">${esc(c.sigle)}</div><div style="min-width:0"><h3>${esc(c.nom)}</h3>
              <span class="small muted">Épreuves du concours : ${off}</span></div></div>
            <div style="display:grid;gap:8px">
              ${eps
                .map(
                  (e, i) =>
                    `<button type="button" class="btn btn-ghost" style="justify-content:space-between" data-start="${e.id}" ${disabled ? "disabled" : ""}>
                      <span>Épreuve ${i + 1} · ${esc(e.matiere)} ${e.annee}</span><span class="muted">${hm(e.duree)}</span></button>`
                )
                .join("")}
            </div>
          </article>`;
      })
      .join("");
    return `<div class="grid" ${disabled ? 'style="opacity:.6"' : ""}>${list}</div>`;
  }

  function startExam(id) {
    if (!isPremium()) return openPaywall();
    state.exam = { id, phase: "prep", prepEnd: Date.now() + PREP_SECONDS * 1000 };
    state.photos = [];
    state.correction = null;
    local.set("exam", state.exam);
    go("salle");
  }

  function salleprep(ex) {
    const e = epreuveById(ex.id);
    const c = concoursById(e.concours);
    return `
      <div class="exam-steps"><span class="on">1. Préparation</span><span>2. Composition</span><span>3. Correction</span></div>
      <div><span class="eyebrow">${esc(c.nom)}</span><h1>${esc(e.matiere)} — durée ${hm(e.duree)}</h1></div>
      <div class="prep">
        <article class="card" style="align-items:center;text-align:center">
          <span class="eyebrow">La composition commence dans</span>
          <div class="countdown" data-tick="prep">${clock(ex.prepEnd - Date.now())}</div>
          <p class="muted small">Le sujet s'affichera automatiquement.</p>
          <button type="button" class="btn btn-primary" data-begin>Je suis prêt, commencer maintenant</button>
        </article>
        <article class="card">
          <h3>Installez-vous comme le jour J</h3>
          <ul class="checklist">
            <li><label><input type="checkbox" id="ck1"> Un cahier ou des feuilles de copie</label></li>
            <li><label><input type="checkbox" id="ck2"> Deux stylos (bleu ou noir) et une règle</label></li>
            <li><label><input type="checkbox" id="ck3"> Un endroit calme, sans bruit autour de vous</label></li>
            <li><label><input type="checkbox" id="ck4"> Téléphone en silencieux, pas d'aide extérieure</label></li>
            <li><label><input type="checkbox" id="ck5"> Une bouteille d'eau</label></li>
          </ul>
          <p class="small muted">Écrivez votre copie à la main, comme au concours. À la fin, vous la photographierez pour la correction.</p>
        </article>
      </div>
      <button type="button" class="back" data-quit>Quitter la salle</button>`;
  }

  function beginCompose() {
    const e = epreuveById(state.exam.id);
    const now = Date.now();
    state.exam = { ...state.exam, phase: "compose", start: now, end: now + e.duree * 60 * 1000 };
    local.set("exam", state.exam);
    requestWakeLock();
    render();
  }

  function salleCompose(ex) {
    const e = epreuveById(ex.id);
    return `
      <div class="exam-steps"><span>1. Préparation</span><span class="on">2. Composition</span><span>3. Correction</span></div>
      <div class="exam-bar" data-bar>
        <div><div class="small" style="opacity:.8;font-weight:700">Temps restant</div><div class="timer" data-tick="compose">${clock(ex.end - Date.now())}</div></div>
        <div class="progress" aria-hidden="true"><i data-tick="progress"></i></div>
        <button type="button" class="btn btn-sun" data-finish>J'ai terminé</button>
      </div>
      <article class="paper">${esc(e.sujet)}</article>
      <p class="small muted">Gardez cette page ouverte. Si vous la fermez, le chronomètre continue.</p>`;
  }

  function finishExam(auto) {
    const ex = state.exam;
    const finishedAt = Math.min(Date.now(), ex.end);
    state.exam = { ...ex, phase: "done", finishedAt, auto: Boolean(auto) };
    local.set("exam", state.exam);
    releaseWakeLock();
    if (auto) toast("Temps écoulé. Posez vos stylos.");
    render();
  }

  function salleDone(ex) {
    const e = epreuveById(ex.id);
    const used = Math.round((ex.finishedAt - ex.start) / 60000);
    const photos = state.photos
      .map((p, i) => `<figure><img src="${p.url}" alt="Page ${i + 1} de la copie"><button type="button" data-rm="${i}" aria-label="Retirer la page ${i + 1}">×</button></figure>`)
      .join("");
    return `
      <div class="exam-steps"><span>1. Préparation</span><span>2. Composition</span><span class="on">3. Correction</span></div>
      <div><span class="eyebrow">${esc(e.matiere)} · ${hm(e.duree)}</span><h1>${ex.auto ? "Temps écoulé" : "Copie terminée"}</h1></div>
      <div class="fb-cols">
        <article class="card"><span class="eyebrow">Temps utilisé</span><div class="countdown" style="font-size:3rem;text-align:left">${hm(Math.max(1, used))}</div>
          <p class="small muted">sur ${hm(e.duree)} accordées</p></article>
        <article class="card"><h3>Photographiez votre copie</h3>
          <p class="small muted">Une photo par page, bien éclairée, à plat. Jusqu'à 6 pages.</p>
          <label class="drop" for="photo-input">${I.camera}<span>Prendre ou ajouter des photos</span></label>
          <input id="photo-input" type="file" accept="image/*" capture="environment" multiple hidden>
          ${photos ? `<div class="photos">${photos}</div>` : ""}
        </article>
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        <button type="button" class="btn btn-primary" data-correct ${state.photos.length || state.demo ? "" : "disabled"}>Corriger ma copie</button>
        <button type="button" class="btn btn-ghost" data-doc="${e.id}" data-mode="corriges">Voir directement le corrigé</button>
        <button type="button" class="btn btn-ghost" data-quit>Nouvelle épreuve</button>
      </div>
      <div id="correction">${state.correction ? correctionHtml(state.correction, e) : ""}</div>`;
  }

  function correctionHtml(r, e) {
    if (r.error) return `<p class="err">${esc(r.error)}</p>`;
    if (r.loading) return `<article class="card"><b>Correction en cours…</b><p class="small muted">L'IA lit votre copie et la compare au corrigé. Cela prend environ une minute.</p></article>`;
    const pct = Math.max(0, Math.min(100, (r.note_sur_20 / 20) * 100));
    const list = (arr) => `<ul class="clean">${(arr || []).map((x) => `<li>${esc(x)}</li>`).join("")}</ul>`;
    return `
      ${r.demo ? `<div class="notice">${I.info}<span><b>Exemple de correction.</b> En mode démo, la correction affichée est un exemple. Avec le serveur Weldon, l'IA lit vraiment les photos de votre copie.</span></div>` : ""}
      <article class="card">
        <div class="score"><div class="score-ring" style="--p:${pct}"><div><b>${String(r.note_sur_20).replace(".", ",")}</b><small>/20</small></div></div>
          <div style="min-width:0;flex:1 1 240px"><span class="eyebrow">Appréciation du correcteur</span><p>${esc(r.appreciation)}</p></div></div>
      </article>
      <div class="fb-cols">
        <article class="card fb-good"><h3>Points forts</h3>${list(r.points_forts)}</article>
        <article class="card fb-bad"><h3>Points à améliorer</h3>${list(r.points_faibles)}</article>
        ${r.erreurs_langue?.length ? `<article class="card"><h3>Langue</h3>${list(r.erreurs_langue)}</article>` : ""}
        <article class="card"><h3>Conseils du répétiteur</h3>${list(r.conseils)}<p class="small muted">${esc(r.gestion_du_temps)}</p></article>
      </div>
      <div><span class="eyebrow">Ce qu'il fallait écrire</span><h2>Corrigé rédigé</h2></div>
      <article class="paper">${esc(e.corrige)}</article>`;
  }

  // Réduit les photos avant envoi (réseau mobile) : 1600 px max, JPEG 80 %.
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
    const e = epreuveById(ex.id);
    const c = concoursById(e.concours);
    if (state.demo || !state.config.ai_enabled) {
      state.correction = { loading: true };
      render();
      setTimeout(() => {
        state.correction = { ...D.correction_demo, demo: true };
        render();
        document.getElementById("correction")?.scrollIntoView({ behavior: "smooth" });
      }, 1400);
      return;
    }
    state.correction = { loading: true };
    render();
    try {
      const r = await api("/api/correct", {
        method: "POST",
        auth: true,
        body: {
          concours: c.nom,
          epreuve: `${e.matiere} (${e.annee})`,
          sujet: e.sujet,
          corrige: e.corrige,
          bareme: e.bareme,
          duree_minutes: e.duree,
          temps_utilise_minutes: Math.round((ex.finishedAt - ex.start) / 60000),
          images: state.photos.map(({ media_type, data }) => ({ media_type, data })),
        },
      });
      state.correction = r;
    } catch (err) {
      state.correction = { error: err.message };
    }
    render();
    document.getElementById("correction")?.scrollIntoView({ behavior: "smooth" });
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

  // ---------- Abonnement (Chariow) ----------
  function openPaywall(view = "pay") {
    closeModal();
    const m = document.createElement("div");
    m.className = "modal";
    m.id = "modal";
    m.setAttribute("role", "dialog");
    m.setAttribute("aria-modal", "true");
    m.setAttribute("aria-labelledby", "pay-title");
    const perk = (t) => `<li>${I.check}<span>${t}</span></li>`;
    const payForm = `
      <ul class="perks">
        ${perk("Toutes les épreuves, classées par concours et par année")}
        ${perk("Tous les corrigés entièrement rédigés")}
        ${perk("La préparation à l'oral de chaque concours")}
        ${perk("La salle d'examen chronométrée avec correction de votre copie par l'IA")}
      </ul>
      <form class="form" id="pay-form" novalidate>
        <div class="field"><label for="pf-first">Prénom</label><input id="pf-first" name="first_name" autocomplete="given-name" required></div>
        <div class="field"><label for="pf-last">Nom</label><input id="pf-last" name="last_name" autocomplete="family-name" required></div>
        <div class="field full"><label for="pf-email">E-mail</label><input id="pf-email" name="email" type="email" autocomplete="email" required placeholder="vous@exemple.com"></div>
        <div class="field full"><label for="pf-phone">Téléphone Mobile Money</label><input id="pf-phone" name="phone" type="tel" inputmode="numeric" autocomplete="tel" required placeholder="6XX XX XX XX"></div>
        <p class="err full" id="pay-err" hidden></p>
        <button class="btn btn-primary btn-block full" type="submit" id="pay-btn">${state.demo ? "Simuler le paiement (démo)" : `Payer ${fcfa(state.config.price_xaf)}`}</button>
        <p class="small muted full">Paiement sécurisé par Chariow : MTN Mobile Money, Orange Money ou carte bancaire. Vous serez redirigé vers la page de paiement puis ramené dans Weldon.</p>
      </form>
      <p class="small">Déjà abonné ? <button type="button" class="linkish" data-restore-view>Retrouver mon accès</button></p>`;
    const restoreForm = `
      <form class="form" id="restore-form" novalidate>
        <p class="full">Entrez l'e-mail utilisé lors du paiement. Weldon retrouve votre abonnement chez Chariow.</p>
        <div class="field full"><label for="rf-email">E-mail</label><input id="rf-email" type="email" autocomplete="email" required></div>
        <p class="err full" id="restore-err" hidden></p>
        <button class="btn btn-primary btn-block full" type="submit">Retrouver mon accès</button>
      </form>
      <p class="small"><button type="button" class="linkish" data-pay-view>Revenir à l'abonnement</button></p>`;
    m.innerHTML = `
      <div class="modal-box">
        <div class="modal-head">
          <button type="button" class="modal-close" data-close aria-label="Fermer">×</button>
          <span class="eyebrow" style="color:inherit">Weldon Accès complet</span>
          <h2 id="pay-title" class="price">${new Intl.NumberFormat("fr-FR").format(state.config.price_xaf)} <small>FCFA / 12 mois</small></h2>
          <span style="font-weight:700">Un seul paiement. Pas de renouvellement automatique.</span>
        </div>
        <div class="modal-body">${view === "restore" ? restoreForm : payForm}</div>
      </div>`;
    document.body.append(m);
    m.querySelector("input")?.focus();
  }

  function closeModal() {
    document.getElementById("modal")?.remove();
  }

  async function submitPay(form) {
    const err = form.querySelector("#pay-err");
    const btn = form.querySelector("#pay-btn");
    const data = Object.fromEntries(new FormData(form));
    err.hidden = true;
    if (!data.first_name || !data.last_name || !/^\S+@\S+\.\S+$/.test(data.email) || data.phone.replace(/\D/g, "").length < 8) {
      err.textContent = "Renseignez votre prénom, votre nom, un e-mail valide et votre numéro de téléphone.";
      err.hidden = false;
      return;
    }
    btn.disabled = true;
    if (state.demo) {
      setTimeout(() => {
        setAccess({ token: "demo", email: data.email, expires_at: new Date(Date.now() + 365 * 864e5).toISOString(), demo: true });
        closeModal();
        toast("Paiement simulé : accès complet activé pour 12 mois.");
        render();
      }, 900);
      return;
    }
    try {
      const phone = data.phone.replace(/\D/g, "").replace(/^237/, "");
      local.set("pending_email", data.email);
      const r = await api("/api/checkout", { method: "POST", body: { ...data, phone, country_code: "CM" } });
      if (r.step === "payment") {
        window.location.href = r.checkout_url;
        return;
      }
      if (r.step === "already_purchased") {
        openPaywall("restore");
        toast("Vous avez déjà payé. Retrouvez votre accès avec votre e-mail.");
        return;
      }
      throw new Error("Réponse inattendue du paiement. Réessayez.");
    } catch (e) {
      err.textContent = e.message;
      err.hidden = false;
      btn.disabled = false;
    }
  }

  async function submitRestore(form) {
    const err = form.querySelector("#restore-err");
    const email = form.querySelector("#rf-email").value.trim();
    err.hidden = true;
    if (state.demo) {
      err.textContent = "En mode démo, aucun paiement réel n'existe. Utilisez « Simuler le paiement ».";
      err.hidden = false;
      return;
    }
    try {
      const r = await api("/api/restore", { method: "POST", body: { email, device_id: deviceId } });
      setAccess({ token: r.token, email: r.email, expires_at: r.expires_at });
      closeModal();
      toast("Accès retrouvé. Bonne préparation !");
      render();
    } catch (e) {
      err.textContent = e.message;
      err.hidden = false;
    }
  }

  // Retour de la page de paiement Chariow : ?sale=sal_xxx
  async function handleReturnFromPayment() {
    const params = new URLSearchParams(location.search);
    const sale = params.get("sale");
    if (!sale || state.demo) return;
    history.replaceState(null, "", location.pathname);
    toast("Vérification de votre paiement…");
    for (let i = 0; i < 6; i++) {
      try {
        const r = await api("/api/verify-sale", { method: "POST", body: { sale_id: sale, device_id: deviceId } });
        if (r.paid) {
          setAccess({ token: r.token, email: r.email, expires_at: r.expires_at });
          toast("Paiement confirmé. Bienvenue dans Weldon !");
          render();
          return;
        }
      } catch (e) {
        toast(e.message);
        return;
      }
      await new Promise((ok) => setTimeout(ok, 4000)); // le paiement Mobile Money peut prendre quelques secondes
    }
    toast("Paiement pas encore confirmé. Utilisez « Retrouver mon accès » dans quelques minutes.");
  }

  // ---------- Rendu et événements ----------
  function render() {
    document.getElementById("root").innerHTML = shell();
    const v = document.getElementById("view");
    const t = state.tab;
    if (t === "concours") v.innerHTML = viewConcours();
    else if (t === "epreuves") v.innerHTML = viewEpreuves("epreuves");
    else if (t === "corriges") v.innerHTML = viewEpreuves("corriges");
    else if (t === "oral") v.innerHTML = viewOral();
    else if (t === "salle") v.innerHTML = viewSalle();
    tick();
  }

  function tick() {
    const ex = state.exam;
    if (state.tab !== "salle" || !ex) return;
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

  document.addEventListener("click", (ev) => {
    const el = ev.target.closest("button, label");
    if (!el) {
      if (ev.target.id === "modal") closeModal();
      return;
    }
    const d = el.dataset;
    if (d.tab) {
      state.filter = "all";
      return go(d.tab);
    }
    if (d.tabFilter) {
      state.filter = d.c;
      if (d.tabFilter === "salle") return go("salle");
      return go(d.tabFilter);
    }
    if (d.fiche) return go("concours", { type: "fiche", id: d.fiche });
    if ("back" in d) return go(state.tab);
    if (d.filter) {
      state.filter = d.filter;
      return render();
    }
    if (d.doc) {
      const e = epreuveById(d.doc);
      if (d.mode === "corriges" && !isPremium()) return openPaywall();
      if (d.mode === "epreuves" && !canSeeSujet(e)) {
        if (!state.freeId) return confirmFree(e);
        return openPaywall();
      }
      return go(d.mode, { type: "doc", id: d.doc, mode: d.mode });
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
    if ("restoreView" in d) return openPaywall("restore");
    if ("payView" in d) return openPaywall("pay");
    if ("close" in d) return closeModal();
    if (d.freeYes) {
      state.freeId = d.freeYes;
      local.set("free", d.freeYes);
      closeModal();
      return go("epreuves", { type: "doc", id: d.freeYes, mode: "epreuves" });
    }
  });

  function smallModal(html) {
    closeModal();
    const m = document.createElement("div");
    m.className = "modal";
    m.id = "modal";
    m.setAttribute("role", "dialog");
    m.setAttribute("aria-modal", "true");
    m.innerHTML = `<div class="modal-box"><div class="modal-body">${html}</div></div>`;
    document.body.append(m);
    m.querySelector("button")?.focus();
  }

  function confirmFree(e) {
    const c = concoursById(e.concours);
    smallModal(`
      <h2>Lire cette épreuve gratuitement ?</h2>
      <p><b>${esc(c.sigle)} · ${esc(e.matiere)} ${e.annee}</b></p>
      <p class="muted">Vous avez droit à <b>une seule</b> épreuve offerte. Les autres épreuves, les corrigés, l'oral et la salle d'examen sont réservés aux abonnés.</p>
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        <button type="button" class="btn btn-primary" data-free-yes="${e.id}">Oui, c'est mon épreuve offerte</button>
        <button type="button" class="btn btn-ghost" data-close>Choisir une autre</button>
      </div>`);
  }

  function confirmFinish() {
    const left = state.exam.end - Date.now();
    smallModal(`
      <h2>Rendre votre copie ?</h2>
      <p class="muted">Il vous reste <b>${clock(left)}</b>. Une fois la copie rendue, vous ne pourrez plus revenir au sujet en temps limité.</p>
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        <button type="button" class="btn btn-primary" data-finish-yes>Oui, j'ai terminé</button>
        <button type="button" class="btn btn-ghost" data-close>Continuer à composer</button>
      </div>`);
  }

  document.addEventListener("submit", (ev) => {
    ev.preventDefault();
    if (ev.target.id === "pay-form") submitPay(ev.target);
    if (ev.target.id === "restore-form") submitRestore(ev.target);
  });

  document.addEventListener("change", async (ev) => {
    if (ev.target.id !== "photo-input") return;
    const files = [...ev.target.files].slice(0, 6 - state.photos.length);
    for (const f of files) {
      try {
        state.photos.push(await compress(f));
      } catch {
        toast("Une photo n'a pas pu être lue.");
      }
    }
    render();
  });

  document.addEventListener("keydown", (ev) => {
    if (ev.key === "Escape") closeModal();
  });

  // ---------- Démarrage ----------
  async function init() {
    render();
    setInterval(tick, 500);
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 3000);
      const res = await fetch("/api/config", { signal: ctrl.signal });
      clearTimeout(timer);
      const cfg = res.ok ? await res.json() : null;
      if (cfg?.mode === "live" && cfg.payment_enabled) {
        state.demo = false;
        state.config = cfg;
        if (state.access?.demo) setAccess(null);
      }
    } catch {}
    if (!state.demo && state.access?.token) {
      api("/api/me", { auth: true }).catch(() => setAccess(null)).finally(render);
    }
    render();
    handleReturnFromPayment();
    if ("serviceWorker" in navigator && !state.demo) navigator.serviceWorker.register("/sw.js").catch(() => {});
  }

  init();
})();
