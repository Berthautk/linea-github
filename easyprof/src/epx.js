/* ===== EasyProf extras (added): jours sans cours, PIN, onglet Année ===== */
var EPX_VERSION = "dev";
var EPX_h = Y.createElement;

/* ---------- types de séance & motifs ---------- */
var EPX_TYPES = [
  ["theorique", "Leçon (théorie)", "Lesson (theory)"],
  ["pratique", "Travaux pratiques", "Practical work"],
  ["contact", "Première rencontre / orientation", "First meeting / orientation"],
  ["revision", "Révision", "Revision"],
  ["evaluation", "Évaluation / devoir", "Assessment / test"]
];
/* types qui comptent des heures mais PAS de leçon */
var EPX_NOLESSON = { contact: 1, revision: 1, evaluation: 1, absence: 1 };
function EPX_isLesson(e) { return !EPX_NOLESSON[e.type]; }
/* motif -> [id, fr, en, icône, retiré des heures dues ?] */
var EPX_REASONS = [
  ["ferie", "Jour férié", "Public holiday", "🎌", true],
  ["periscolaire", "Activités péri / post-scolaires", "School activities", "🎭", true],
  ["conseil", "Conseil de classe / examens de l'école", "Class council / school exams", "🗂️", true],
  ["maladie", "Maladie", "Sick leave", "🤒", false],
  ["empechement", "Empêchement personnel", "Personal impediment", "🧳", false],
  ["mission", "Mission / formation / réunion", "Mission / training / meeting", "📋", false],
  ["autre", "Autre motif", "Other reason", "✏️", false]
];
function EPX_reason(id) { return EPX_REASONS.filter(function (r) { return r[0] === id; })[0] || EPX_REASONS[EPX_REASONS.length - 1]; }
function EPX_pad(n) { return (n < 10 ? "0" : "") + n; }
function EPX_iso(d) { return d.getFullYear() + "-" + EPX_pad(d.getMonth() + 1) + "-" + EPX_pad(d.getDate()); }
function EPX_title(type, fr, n) {
  if (type === "contact") return fr ? "Prise de contact / Rentrée" : "Orientation / Back to school";
  if (type === "revision") return fr ? "Séance de révision" : "Revision session";
  if (type === "evaluation") return fr ? "Évaluation" : "Assessment";
  return fr ? "Leçon n°" + n : "Lesson n°" + n;
}
function EPX_lbl(e, fr) {
  if (e.type === "absence") return "—";
  if (EPX_NOLESSON[e.type]) return e.type === "contact" ? (fr ? "Contact" : "Orient.") : e.type === "revision" ? (fr ? "Révision" : "Revision") : (fr ? "Éval." : "Assess.");
  return String(e.lessonNumber == null ? "" : e.lessonNumber);
}
function EPX_lblN(e, fr) { return e.type === "absence" ? (fr ? "Jour sans cours" : "No-class day") : EPX_NOLESSON[e.type] ? EPX_lbl(e, fr) : (fr ? "Leçon n° " : "Lesson n° ") + e.lessonNumber; }

/* ---------- calendrier : jours fériés / vacances (communs à toute l'école) ---------- */
/* st.reportObservations.__inspection.cal = [{f:"2026-12-24",t:"2027-01-03",n:"Vacances de Noël"}], hol = ["2026-10-01"] (ancien format) */
function EPX_calendar(st) {
  var s = st.reportObservations && st.reportObservations.__inspection;
  return (s && Array.isArray(s.cal)) ? s.cal : EPX_calDefault();
}
function EPX_calDefault() {
  /* Arrêté conjoint MINEDUB/MINESEC du 14/08/2026 (calendrier 2026/2027) :
     art. 4 interruptions Noël 18/12 15h30 -> 04/01 7h30 et Pâques 25/03 15h30 -> 12/04 7h30 ;
     art. 22 : les 2 derniers jours de chaque trimestre sont consacrés au suivi pédagogique (T1 : 26-27/11, T2 : 04-05/03, T3 : 10-11/06).
     Les demi-journées de départ en vacances (18/12 et 25/03 après 15h30) ne sont pas retirées. Fêtes mobiles (Tabaski…) : à saisir. */
  var F = function (f, t, n) { return { f: f, t: t, n: n }; };
  return [F("2026-11-26", "2026-11-27", "Suivi pédagogique, fin du 1er trimestre (art. 22)"), F("2026-12-19", "2027-01-03", "Vacances de Noël (art. 4)"), F("2027-02-11", "2027-02-11", "Fête de la Jeunesse"),
    F("2027-03-04", "2027-03-05", "Suivi pédagogique, fin du 2e trimestre (art. 22)"), F("2027-03-26", "2027-04-11", "Vacances de Pâques (art. 4)"), F("2027-05-01", "2027-05-01", "Fête du Travail"),
    F("2027-05-06", "2027-05-06", "Ascension"), F("2027-05-20", "2027-05-20", "Fête nationale"), F("2027-06-10", "2027-06-11", "Suivi pédagogique, fin du 3e trimestre (art. 22)")];
}
function EPX_offSet(st) {
  var set = {}, cal = EPX_calendar(st), s = st.reportObservations && st.reportObservations.__inspection;
  ((s && s.hol) || []).forEach(function (d) { set[d] = 1; });
  cal.forEach(function (r) {
    if (!r || !r.f) return;
    var a = new Date(r.f + "T00:00:00Z"), b = new Date((r.t || r.f) + "T00:00:00Z"), k = 0;
    if (isNaN(a) || isNaN(b)) return;
    for (var t = a; t <= b && k < 400; t = new Date(t.getTime() + 864e5), k++) set[t.toISOString().slice(0, 10)] = 1;
  });
  return set;
}
function EPX_offDay(st, d) { return !!EPX_offSet(st)[EPX_iso(d)]; }

function EPX_termOf(st, d) {
  var iso = EPX_iso(d), T = st.terms || [], hit = T.filter(function (t) { return t.startDate <= iso && iso <= t.endDate; })[0];
  return (hit || T.filter(function (t) { return t.status === "active"; })[0] || {}).id || "";
}
function EPX_teachesOn(st, t, d) {
  var days = Array.isArray(t.teachingDays) ? t.teachingDays : [], dow = d.getDay();
  if (days.indexOf(dow) === -1) return false;
  var dt = t.dayTerms && t.dayTerms[dow];
  return !(Array.isArray(dt) && dt.length && dt.indexOf(EPX_termOf(st, d)) === -1);
}

/* ---------- SHA-256 synchrone (identique à EasyProfHashPin : "h1$" + sha256("easyprof:"+pin)) ---------- */
function EPX_sha256(ascii) {
  var K = [], H = [], pr = 0, c;
  function rr(v, a) { return (v >>> a) | (v << (32 - a)); }
  var is = {};
  for (c = 2; pr < 64; c++) if (!is[c]) { for (var i = c * c; i < 313; i += c) is[i] = 1; H[pr] = (Math.pow(c, 0.5) * 4294967296) | 0; K[pr++] = (Math.pow(c, 1 / 3) * 4294967296) | 0; }
  H = H.slice(0, 8);
  var bytes = unescape(encodeURIComponent(ascii)), len = bytes.length * 8, w = [], j;
  bytes += "\x80";
  while (bytes.length % 64 - 56) bytes += "\x00";
  for (j = 0; j < bytes.length; j++) w[j >> 2] |= bytes.charCodeAt(j) << ((3 - j) % 4) * 8;
  w[w.length] = Math.floor(len / 4294967296); w[w.length] = len | 0;
  for (j = 0; j < w.length;) {
    var W = w.slice(j, j += 16), old = H.slice(0), i2;
    H = H.slice(0, 8);
    for (i2 = 0; i2 < 64; i2++) {
      var w15 = W[i2 - 15], w2 = W[i2 - 2], a = H[0], e = H[4];
      var t1 = H[7] + (rr(e, 6) ^ rr(e, 11) ^ rr(e, 25)) + ((e & H[5]) ^ (~e & H[6])) + K[i2] + (W[i2] = i2 < 16 ? W[i2] : (W[i2 - 16] + (rr(w15, 7) ^ rr(w15, 18) ^ (w15 >>> 3)) + W[i2 - 7] + (rr(w2, 17) ^ rr(w2, 19) ^ (w2 >>> 10))) | 0);
      H = [(t1 + ((rr(a, 2) ^ rr(a, 13) ^ rr(a, 22)) + ((a & H[1]) ^ (a & H[2]) ^ (H[1] & H[2])))) | 0].concat(H);
      H[4] = (H[4] + t1) | 0;
    }
    for (i2 = 0; i2 < 8; i2++) H[i2] = (H[i2] + old[i2]) | 0;
  }
  var out = "";
  for (j = 0; j < 8; j++) for (var b = 3; b + 1; b--) { var v = (H[j] >> (b * 8)) & 255; out += (v < 16 ? "0" : "") + v.toString(16); }
  return out;
}
function EPX_hashPin(p) { return "h1$" + EPX_sha256("easyprof:" + String(p)); }
function EPX_isHash(p) { return String(p == null ? "" : p).indexOf("h1$") === 0; }
/* valeur à stocker : champ vide = on garde l'existant ; sinon on hache */
function EPX_pinStore(input, current) {
  var v = String(input == null ? "" : input).trim();
  if (!v) return current || EPX_hashPin("1234");
  if (EPX_isHash(v)) return v;
  return EPX_hashPin(v);
}
function EPX_pinLabel(p, fr) { return EPX_isHash(p) ? (fr ? "🔒 protégé" : "🔒 protected") : (p ? "⚠ " + p + (fr ? " (en clair)" : " (plain)") : "—"); }
function EPX_randPin() {
  var a = new Uint32Array(1);
  try { crypto.getRandomValues(a); } catch (x) { a[0] = Math.floor(Math.random() * 4294967296); }
  return String(1000 + (a[0] % 9000));
}

/* ---------- styles partagés (variables de la palette) ---------- */
var EPX_CSS = ":root{--ep-ink:#17413F;--ep-teal:#2A9D8F;--ep-teal-d:#21867A;--ep-apricot:#E9A23B;--ep-cream:#FBF7EF;--ep-sand:#F3ECDD;--ep-line:#E6DCC8;--ep-text:#26332F;--ep-muted:#66736C;--ep-coral:#C95B3E;--ep-leaf:#3F8F5E}" +
  ".epx-card{background:#fff;border:1px solid var(--ep-line);border-radius:18px;padding:16px;box-shadow:0 1px 2px rgba(23,65,63,.05)}.epx-card h3{margin:0 0 10px;font-size:13px;font-weight:800;letter-spacing:.03em;text-transform:uppercase;color:var(--ep-ink)}" +
  ".epx-row{display:flex;flex-wrap:wrap;gap:10px;align-items:flex-end}.epx-lab{display:flex;flex-direction:column;gap:4px;font-size:10px;font-weight:700;text-transform:uppercase;color:var(--ep-muted)}" +
  ".epx-in{border:1px solid var(--ep-line);border-radius:12px;padding:8px 10px;font-size:13px;background:var(--ep-cream);color:var(--ep-text);font-family:inherit;min-width:0}.epx-in:focus{outline:2px solid var(--ep-teal);outline-offset:0;border-color:transparent}" +
  ".epx-btn{border:0;border-radius:12px;padding:9px 14px;font-size:12px;font-weight:800;cursor:pointer;background:var(--ep-teal);color:#fff;transition:transform .12s,box-shadow .12s,background .12s}.epx-btn:hover{background:var(--ep-teal-d);transform:translateY(-1px);box-shadow:0 4px 10px rgba(33,134,122,.25)}.epx-btn.alt{background:var(--ep-sand);color:var(--ep-ink)}.epx-btn.alt:hover{background:#ECE2CC}.epx-btn.warn{background:var(--ep-apricot);color:#3b2a06}.epx-btn.red{background:#FBE4DC;color:var(--ep-coral)}" +
  ".epx-note{font-size:11px;color:var(--ep-muted);margin:8px 0 0;line-height:1.5}.epx-chip{display:inline-flex;align-items:center;gap:4px;border-radius:999px;padding:3px 10px;font-size:11px;font-weight:700}.epx-ok{background:#E3F3EA;color:var(--ep-leaf)}.epx-bad{background:#FBE4DC;color:var(--ep-coral)}" +
  ".epx-item{display:flex;flex-wrap:wrap;gap:8px;align-items:center;border-bottom:1px dashed var(--ep-line);padding:7px 0;font-size:12px;color:var(--ep-text)}.epx-day{border:1px solid var(--ep-line);background:var(--ep-cream);border-radius:10px;padding:6px 10px;font-size:12px;font-weight:700;cursor:pointer;color:var(--ep-muted)}.epx-day.on{background:var(--ep-ink);border-color:var(--ep-ink);color:#fff}";
(function () {
  try {
    if (typeof document !== "undefined" && !document.getElementById("epx-style")) {
      var s = document.createElement("style"); s.id = "epx-style"; s.textContent = EPX_CSS; document.head.appendChild(s);
    }
  } catch (x) {}
})();

/* ---------- carte « Pas de cours ? » (espace enseignant et AP) ---------- */
/* props: st, e(onChangeState), me (enseignant courant) , teachers (si AP : liste choisie), fr */
function EPD(p) {
  var st = p.st, fr = p.fr, e = p.e, today = EPX_iso(new Date());
  var teachers = p.teachers || null;
  var S = Y.useState({ r: "maladie", f: today, t: today, n: "", who: (p.me && p.me.id) || (teachers && teachers[0] && teachers[0].id) || "" }), F = S[0], setF = S[1];
  var toast = function (m, k) { if (window.triggerToast) window.triggerToast(m, k || "success"); else alert(m); };
  var set = function (k, v) { setF(function (o) { var n = Object.assign({}, o); n[k] = v; if (k === "f" && n.t < v) n.t = v; return n; }); };
  var tid = (p.me && p.me.id) || F.who;
  var os = Y.useState(!p.collapsible), open = os[0], setOpen = os[1];
  var mine = (st.entries || []).filter(function (x) { return x.type === "absence" && x.teacherId === tid; }).sort(function (a, b) { return a.timestamp < b.timestamp ? 1 : -1; }).slice(0, 8);
  var save = function () {
    if (!tid || !F.f) return;
    var a = new Date(F.f + "T12:00:00"), b = new Date((F.t || F.f) + "T12:00:00"), days = [];
    if (isNaN(a) || isNaN(b) || b < a) { toast(fr ? "Dates invalides." : "Invalid dates.", "error"); return; }
    for (var d = a, k = 0; d <= b && k < 62; d = new Date(d.getTime() + 864e5), k++) if (d.getDay() !== 0) days.push(EPX_iso(d));
    var r = EPX_reason(F.r), lab = fr ? r[1] : r[2], had = {};
    (st.entries || []).forEach(function (x) { if (x.type === "absence" && x.teacherId === tid) had[(x.timestamp || "").slice(0, 10)] = 1; });
    var term = ((st.terms || []).filter(function (t) { return t.status === "active"; })[0] || (st.terms || [])[0] || {}).id || "T1";
    var teacher = (st.teachers || []).filter(function (t) { return t.id === tid; })[0] || {};
    var made = days.filter(function (iso) { return !had[iso]; }).map(function (iso) {
      return { id: "entry_abs_" + tid + "_" + iso + "_" + Date.now(), classId: "", teacherId: tid, termId: term, lessonNumber: null,
        title: (fr ? "Pas de cours – " : "No class – ") + lab + (F.n ? " (" + F.n + ")" : ""), durationMinutes: 0, startTime: "00:00", endTime: "00:00",
        type: "absence", reason: F.r, note: F.n || "", isDigitized: false, timestamp: new Date(iso + "T12:00:00").toISOString() };
    });
    if (!made.length) { toast(fr ? "Déjà déclaré pour ces dates." : "Already declared for these dates.", "error"); return; }
    e(function (s) {
      return Object.assign({}, s, { entries: made.concat(s.entries || []), logs: [{ id: "log_" + Date.now(), userId: (p.me && p.me.id) || "AP", userRole: p.me ? "Teacher" : "AP", userName: (p.me && p.me.name) || "AP",
        description: (fr ? "Jour sans cours déclaré : " : "No-class day declared: ") + lab + " – " + (teacher.shortName || teacher.name || tid) + " (" + made.length + (fr ? " j)" : " d)"), timestamp: new Date().toISOString() }].concat(s.logs || []) });
    });
    toast((fr ? "✓ Enregistré : " : "✓ Saved: ") + lab + " (" + made.length + (fr ? " jour" : " day") + (made.length > 1 ? "s" : "") + ")");
    setF(function (o) { return Object.assign({}, o, { n: "" }); });
  };
  var del = function (id) { e(function (s) { return Object.assign({}, s, { entries: (s.entries || []).filter(function (x) { return x.id !== id; }) }); }); };
  var lab = function (t, ch) { return EPX_h("label", { className: "epx-lab" }, t, ch); };
  if (!open) return EPX_h("button", { type: "button", className: "epx-card", onClick: function () { setOpen(true); }, style: { width: "100%", textAlign: "left", cursor: "pointer", borderLeft: "5px solid var(--ep-apricot)", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, fontWeight: 800, color: "var(--ep-ink)", padding: "12px 16px" } },
    EPX_h("span", null, "📅 " + (fr ? "Pas de cours aujourd'hui ? Maladie, jour férié, activités…" : "No class today? Sickness, holiday, activities…")), EPX_h("span", { style: { color: "var(--ep-teal)" } }, fr ? "Déclarer ▾" : "Declare ▾"));
  return EPX_h("div", { className: "epx-card", style: { borderLeft: "5px solid var(--ep-apricot)" } },
    EPX_h("h3", { style: { display: "flex", justifyContent: "space-between" } }, "📅 " + (fr ? "Pas de cours ? Dites-le ici" : "No class? Tell us here"), p.collapsible ? EPX_h("span", { style: { cursor: "pointer", color: "var(--ep-muted)" }, onClick: function () { setOpen(false); } }, "✕") : null),
    EPX_h("div", { className: "epx-row" },
      teachers ? lab(fr ? "Enseignant" : "Teacher", EPX_h("select", { className: "epx-in", value: F.who, onChange: function (ev) { set("who", ev.target.value); } },
        teachers.map(function (t) { return EPX_h("option", { key: t.id, value: t.id }, t.shortName || t.name); }))) : null,
      lab(fr ? "Motif" : "Reason", EPX_h("select", { className: "epx-in", value: F.r, style: { minWidth: 200 }, onChange: function (ev) { set("r", ev.target.value); } },
        EPX_REASONS.map(function (r) { return EPX_h("option", { key: r[0], value: r[0] }, r[3] + " " + (fr ? r[1] : r[2])); }))),
      lab(fr ? "Du" : "From", EPX_h("input", { className: "epx-in", type: "date", value: F.f, onChange: function (ev) { set("f", ev.target.value); } })),
      lab(fr ? "Au" : "To", EPX_h("input", { className: "epx-in", type: "date", value: F.t, min: F.f, onChange: function (ev) { set("t", ev.target.value); } })),
      lab(fr ? "Précision (facultatif)" : "Detail (optional)", EPX_h("input", { className: "epx-in", value: F.n, style: { width: 170 }, onChange: function (ev) { set("n", ev.target.value); } })),
      EPX_h("button", { className: "epx-btn", type: "button", onClick: save }, fr ? "Enregistrer" : "Save")),
    EPX_h("p", { className: "epx-note" }, fr ? "Une fois enregistré, le rappel « saisie en attente » disparaît pour ces jours. Les jours fériés et les activités scolaires (péri/post-scolaires : mercredi de 13 h à 15 h, art. 9) ne comptent pas comme absence ; maladie, empêchement et mission comptent comme heures non faites. Les leçons ne sont pas comptées ce jour-là." : "Once saved, the “entry pending” reminder disappears for those days. Public holidays and school activities (Wednesday 1-3 pm, art. 9) are not counted as an absence; sickness, impediment and mission count as hours not done. No lesson is counted that day."),
    mine.length ? EPX_h("div", { style: { marginTop: 6 } }, mine.map(function (x) {
      var r = EPX_reason(x.reason);
      return EPX_h("div", { key: x.id, className: "epx-item" }, EPX_h("span", null, r[3]), EPX_h("b", null, (x.timestamp || "").slice(0, 10)), EPX_h("span", null, fr ? r[1] : r[2]), x.note ? EPX_h("span", { style: { color: "var(--ep-muted)" } }, "· " + x.note) : null,
        EPX_h("button", { className: "epx-btn red", type: "button", style: { marginLeft: "auto", padding: "3px 9px" }, onClick: function () { del(x.id); } }, "×"));
    })) : null);
}

/* ---------- onglet « Année » de la Configuration ---------- */
var EPY_PRESET = {
  schoolYear: "2026/2027",
  /* arrêté conjoint du 14/08/2026, art. 10 : T2 = 30/11→05/03 (coupé par les vacances de Noël), T3 = 08/03→11/06 (coupé par Pâques) */
  terms: { T1: ["2026-09-07", "2026-11-27"], T2: ["2026-11-30", "2027-03-05"], T3: ["2027-03-08", "2027-06-11"] },
  /* jours où le samedi n'est enseigné que certains trimestres : {enseignant: {6: ["T1"]}} */
  dayTerms: { KAMDEM: { "6": ["T1"] } },
  /* d'après Timetables_2026-2027 : 1=lun … 6=sam ; KAMDEM enseigne aussi le samedi (USA 8h-10h, LSA 10h30-12h30) */
  days: { ASTHA: [1, 3, 4, 5], KAMDEM: [1, 2, 6], NEBASIBI: [3, 4, 5], TSOGO2026: [3, 4, 5] }
};
function EPY(props) {
  var st = props.state, e = props.onChangeState, fr = st.activeLanguage === "fr";
  var L = function (a, b) { return fr ? a : b; };
  var DN = fr ? ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"] : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  var toast = function (m, k) { if (window.triggerToast) window.triggerToast(m, k || "success"); else alert(m); };
  var terms = st.terms || [], teachers = st.teachers || [];
  var rs = Y.useState(null), reveal = rs[0], setReveal = rs[1];            /* PIN généré, montré une seule fois */
  var ps = Y.useState({}), pins = ps[0], setPins = ps[1];
  var setTerm = function (id, patch) { e(function (s) { return Object.assign({}, s, { terms: (s.terms || []).map(function (t) { return t.id === id ? Object.assign({}, t, patch) : t; }) }); }); };
  var setActive = function (id) { e(function (s) { return Object.assign({}, s, { terms: (s.terms || []).map(function (t) { return Object.assign({}, t, { status: t.id === id ? "active" : "upcoming" }); }) }); }); };
  var setDays = function (tid, days) { e(function (s) { return Object.assign({}, s, { teachers: (s.teachers || []).map(function (t) { return t.id === tid ? Object.assign({}, t, { teachingDays: days }) : t; }) }); }); };
  var toggleDay = function (t, d) { var cur = Array.isArray(t.teachingDays) ? t.teachingDays : []; setDays(t.id, cur.indexOf(d) >= 0 ? cur.filter(function (x) { return x !== d; }) : cur.concat([d]).sort()); };
  var sameDays = function (a, b) { return JSON.stringify((a || []).slice().sort()) === JSON.stringify((b || []).slice().sort()); };
  var diffs = [];
  terms.forEach(function (t) { var p = EPY_PRESET.terms[t.id]; if (p && (t.startDate !== p[0] || t.endDate !== p[1])) diffs.push(t.id + " : " + t.startDate + " → " + t.endDate + "  ⇒  " + p[0] + " → " + p[1]); });
  teachers.forEach(function (t) { var p = EPY_PRESET.days[t.id]; if (p && (!sameDays(t.teachingDays, p) || JSON.stringify(t.dayTerms || null) !== JSON.stringify(EPY_PRESET.dayTerms[t.id] || null))) diffs.push((t.shortName || t.name) + " : " + L("jours ", "days ") + (Array.isArray(t.teachingDays) && t.teachingDays.length ? t.teachingDays.map(function (d) { return DN[d % 7]; }).join("/") : L("(aucun)", "(none)")) + "  ⇒  " + p.map(function (d) { return DN[d % 7]; }).join("/")); });
  if ((st.establishment || {}).schoolYear !== EPY_PRESET.schoolYear) diffs.push(L("Année scolaire : ", "School year: ") + ((st.establishment || {}).schoolYear || "—") + "  ⇒  " + EPY_PRESET.schoolYear);
  var applyPreset = function () {
    e(function (s) {
      return Object.assign({}, s, {
        establishment: Object.assign({}, s.establishment || {}, { schoolYear: EPY_PRESET.schoolYear }),
        terms: (s.terms || []).map(function (t) { var p = EPY_PRESET.terms[t.id]; return p ? Object.assign({}, t, { startDate: p[0], endDate: p[1] }) : t; }),
        teachers: (s.teachers || []).map(function (t) { var p = EPY_PRESET.days[t.id]; return p ? Object.assign({}, t, { teachingDays: p, dayTerms: EPY_PRESET.dayTerms[t.id] || null }) : t; })
      });
    });
    toast(L("✓ Configuration 2026-2027 appliquée.", "✓ 2026-2027 setup applied."));
  };
  var I = (st.reportObservations && st.reportObservations.__inspection) || {};
  var cal = EPX_calendar(st);
  var setCal = function (next) { e(function (s) { var cur = (s.reportObservations && s.reportObservations.__inspection) || {}; return Object.assign({}, s, { reportObservations: Object.assign({}, s.reportObservations || {}, { __inspection: Object.assign({}, cur, { cal: next }) }) }); }); };
  var cs = Y.useState({ f: "", t: "", n: "" }), C = cs[0], setC = cs[1];
  var savePin = function (t, v) {
    e(function (s) { return Object.assign({}, s, { teachers: (s.teachers || []).map(function (x) { return x.id === t.id ? Object.assign({}, x, { pin: EPX_hashPin(v) }) : x; }) }); });
  };
  var clear = teachers.filter(function (t) { return !EPX_isHash(t.pin); });
  var lab = function (t, ch) { return EPX_h("label", { className: "epx-lab" }, t, ch); };
  return EPX_h("div", { className: "space-y-6" },
    EPX_h("div", { className: "epx-note", style: { margin: 0, textAlign: "right" } }, L("Version installée : ", "Installed version: ") + EPX_VERSION),
    /* 1. mise à jour 2026-2027 */
    EPX_h("div", { className: "epx-card", style: { borderLeft: "5px solid var(--ep-teal)" } },
      EPX_h("h3", null, "🗓️ " + L("Mise à jour de l'année 2026-2027", "2026-2027 school-year update")),
      diffs.length ? EPX_h("div", null,
        EPX_h("p", { className: "epx-note", style: { marginTop: 0 } }, L("Changements proposés (rien n'est modifié tant que vous ne cliquez pas) :", "Proposed changes (nothing changes until you click):")),
        diffs.map(function (d, i) { return EPX_h("div", { key: i, className: "epx-item", style: { fontFamily: "ui-monospace,monospace", fontSize: 11 } }, d); }),
        EPX_h("div", { className: "epx-row", style: { marginTop: 10 } }, EPX_h("button", { className: "epx-btn", type: "button", onClick: applyPreset }, L("Appliquer ces changements", "Apply these changes"))),
        EPX_h("p", { className: "epx-note" }, L("Dates des trimestres conformes à l'arrêté conjoint du 14/08/2026 (art. 10). Jours des enseignants d'après les emplois du temps 2026-2027 ; le samedi de KAMDEM est limité au 1er trimestre (modifiable plus bas).", "Term dates follow the joint order of 14/08/2026 (art. 10). Teaching days follow the 2026-2027 timetables; KAMDEM's Saturday is limited to term 1 (editable below)."))
      ) : EPX_h("p", { className: "epx-note", style: { marginTop: 0 } }, L("✓ Tout est déjà à jour (année, trimestres, jours d'enseignement).", "✓ Everything is already up to date."))),
    /* 2. trimestres */
    EPX_h("div", { className: "epx-card" },
      EPX_h("h3", null, "📆 " + L("Trimestres", "Terms")),
      terms.map(function (t) {
        return EPX_h("div", { key: t.id, className: "epx-row", style: { marginBottom: 8 } },
          EPX_h("b", { style: { width: 150, fontSize: 12, alignSelf: "center", color: "var(--ep-ink)" } }, fr ? t.nameFR : t.nameEN),
          lab(L("Début", "Start"), EPX_h(EPI_In, { type: "date", value: t.startDate, cls: "epx-in", live: true, onCommit: function (v) { setTerm(t.id, { startDate: v }); } })),
          lab(L("Fin", "End"), EPX_h(EPI_In, { type: "date", value: t.endDate, cls: "epx-in", live: true, onCommit: function (v) { setTerm(t.id, { endDate: v }); } })),
          EPX_h("button", { className: "epx-btn " + (t.status === "active" ? "" : "alt"), type: "button", onClick: function () { setActive(t.id); } }, t.status === "active" ? "✓ " + L("Trimestre actif", "Active term") : L("Activer", "Set active")));
      }),
      EPX_h("p", { className: "epx-note" }, L("Le trimestre actif est celui dans lequel sont rangées les nouvelles saisies des enseignants. Pensez à l'activer au début de chaque trimestre.", "The active term is where new teacher entries are filed. Remember to activate it at the start of each term."))),
    /* 3. jours d'enseignement */
    EPX_h("div", { className: "epx-card" },
      EPX_h("h3", null, "🧑‍🏫 " + L("Jours d'enseignement (rappels « pas de saisie »)", "Teaching days (“no entry” reminders)")),
      teachers.map(function (t) {
        var cur = Array.isArray(t.teachingDays) ? t.teachingDays : [];
        return EPX_h("div", { key: t.id, className: "epx-item" },
          EPX_h("b", { style: { width: 110 } }, t.shortName || t.name),
          [1, 2, 3, 4, 5, 6].map(function (d) { return EPX_h("button", { key: d, type: "button", className: "epx-day" + (cur.indexOf(d) >= 0 ? " on" : ""), onClick: function () { toggleDay(t, d); } }, DN[d]); }),
          cur.indexOf(6) >= 0 ? EPX_h("span", { className: "epx-note", style: { margin: "0 0 0 6px" } }, L("samedi :", "Saturday:")) : null,
          cur.indexOf(6) >= 0 ? terms.map(function (tm) {
            var sel = (t.dayTerms && t.dayTerms["6"]) || terms.map(function (x) { return x.id; }), on = sel.indexOf(tm.id) >= 0;
            return EPX_h("button", { key: tm.id, type: "button", className: "epx-day" + (on ? " on" : ""), onClick: function () {
              var nx = on ? sel.filter(function (x) { return x !== tm.id; }) : sel.concat([tm.id]);
              e(function (s2) { return Object.assign({}, s2, { teachers: (s2.teachers || []).map(function (x) { return x.id === t.id ? Object.assign({}, x, { dayTerms: Object.assign({}, x.dayTerms || {}, { "6": nx }) }) : x; }) }); });
            } }, tm.id);
          }) : null,
          cur.length ? null : EPX_h("span", { className: "epx-chip epx-bad" }, L("aucun jour : aucun rappel", "no day: no reminder")));
      })),
    /* 4. calendrier */
    EPX_h("div", { className: "epx-card" },
      EPX_h("h3", null, "🎌 " + L("Calendrier : jours fériés et vacances (toute l'école)", "Calendar: holidays and breaks (whole school)")),
      EPX_h("div", { className: "epx-row" },
        lab(L("Du", "From"), EPX_h("input", { className: "epx-in", type: "date", value: C.f, onChange: function (ev) { setC(Object.assign({}, C, { f: ev.target.value, t: C.t && C.t >= ev.target.value ? C.t : ev.target.value })); } })),
        lab(L("Au", "To"), EPX_h("input", { className: "epx-in", type: "date", value: C.t, min: C.f, onChange: function (ev) { setC(Object.assign({}, C, { t: ev.target.value })); } })),
        lab(L("Nom (ex. Vacances de Noël)", "Name (e.g. Christmas break)"), EPX_h("input", { className: "epx-in", value: C.n, style: { width: 210 }, onChange: function (ev) { setC(Object.assign({}, C, { n: ev.target.value })); } })),
        EPX_h("button", { className: "epx-btn", type: "button", onClick: function () { if (!C.f) return; setCal(cal.concat([{ f: C.f, t: C.t || C.f, n: C.n }]).sort(function (a, b) { return a.f < b.f ? -1 : 1; })); setC({ f: "", t: "", n: "" }); } }, "+ " + L("Ajouter", "Add"))),
      cal.map(function (r, i) {
        return EPX_h("div", { key: i, className: "epx-item" }, EPX_h("b", null, r.f + (r.t && r.t !== r.f ? " → " + r.t : "")), EPX_h("span", null, r.n || ""),
          EPX_h("button", { className: "epx-btn red", type: "button", style: { marginLeft: "auto", padding: "3px 9px" }, onClick: function () { setCal(cal.filter(function (x, j) { return j !== i; })); } }, "×"));
      }),
      EPX_h("p", { className: "epx-note" }, L("Ces jours sont retirés des heures dues de la fiche d'inspection et n'envoient aucun rappel. Pré-rempli d'après l'arrêté conjoint du 14/08/2026 (vacances, deux derniers jours de chaque trimestre consacrés au suivi pédagogique, fêtes légales à date fixe). Ajoutez les fêtes mobiles (Tabaski…) et supprimez ce qui ne convient pas à votre établissement.", "These days are removed from the hours due on the inspection sheet and send no reminder. Fixed-date holidays are pre-filled; add school breaks and moveable holidays per the official calendar."))),
    /* 5. PIN */
    EPX_h("div", { className: "epx-card" },
      EPX_h("h3", null, "🔐 " + L("Codes PIN des enseignants", "Teacher PIN codes")),
      reveal ? EPX_h("div", { className: "epx-item", style: { background: "#FFF4DC", borderRadius: 12, padding: 10, border: "1px solid var(--ep-apricot)" } },
        EPX_h("span", null, L("Nouveau PIN de ", "New PIN for ") + reveal.name + " : "), EPX_h("b", { style: { fontSize: 20, letterSpacing: 4, fontFamily: "ui-monospace,monospace" } }, reveal.pin),
        EPX_h("span", { className: "epx-note", style: { margin: 0 } }, L("Notez-le maintenant : il ne sera plus affichable (seule son empreinte est conservée).", "Write it down now: it can't be shown again (only its fingerprint is kept).")),
        EPX_h("button", { className: "epx-btn alt", type: "button", style: { marginLeft: "auto" }, onClick: function () { setReveal(null); } }, "OK")) : null,
      teachers.map(function (t) {
        var prot = EPX_isHash(t.pin);
        return EPX_h("div", { key: t.id, className: "epx-item" },
          EPX_h("b", { style: { width: 110 } }, t.shortName || t.name),
          EPX_h("span", { className: "epx-chip " + (prot ? "epx-ok" : "epx-bad") }, prot ? "🔒 " + L("protégé", "protected") : "⚠ " + L("en clair", "plain text")),
          EPX_h("input", { className: "epx-in", placeholder: L("nouveau PIN (4-8)", "new PIN (4-8)"), maxLength: 8, style: { width: 190 }, value: pins[t.id] || "", onChange: function (ev) { var v = ev.target.value; setPins(function (o) { var n = Object.assign({}, o); n[t.id] = v; return n; }); } }),
          EPX_h("button", { className: "epx-btn alt", type: "button", onClick: function () { var v = (pins[t.id] || "").trim(); if (v.length < 4) { toast(L("Le PIN doit avoir au moins 4 caractères.", "PIN needs at least 4 characters."), "error"); return; } savePin(t, v); setPins(function (o) { var n = Object.assign({}, o); n[t.id] = ""; return n; }); toast(L("✓ PIN enregistré (protégé).", "✓ PIN saved (protected).")); } }, L("Enregistrer", "Save")),
          EPX_h("button", { className: "epx-btn warn", type: "button", onClick: function () { var v = EPX_randPin(); savePin(t, v); setReveal({ name: t.shortName || t.name, pin: v }); } }, "🎲 " + L("Générer", "Generate")));
      }),
      clear.length ? EPX_h("div", { className: "epx-row", style: { marginTop: 10 } },
        EPX_h("button", { className: "epx-btn", type: "button", onClick: function () { e(function (s) { return Object.assign({}, s, { teachers: (s.teachers || []).map(function (t) { return EPX_isHash(t.pin) || !t.pin ? t : Object.assign({}, t, { pin: EPX_hashPin(t.pin) }); }) }); }); toast(L("✓ PIN en clair protégés (valeur inchangée, personne n'est bloqué).", "✓ Plain PINs protected (value unchanged, nobody is locked out).")); } }, "🔒 " + L("Protéger les PIN en clair (" + clear.length + ")", "Protect plain PINs (" + clear.length + ")")),
        EPX_h("span", { className: "epx-note", style: { margin: 0 } }, L("Le PIN actuel reste valable, il n'est simplement plus lisible. Utilisez ensuite « Générer » pour lui en donner un nouveau.", "The current PIN keeps working but is no longer readable. Then use “Generate” to give a new one."))) : null,
      EPX_h("p", { className: "epx-note" }, L("Un PIN n'est jamais affiché une fois enregistré : la longue suite de lettres que vous voyiez était l'empreinte automatique créée à la première connexion de l'enseignant. Désormais le PIN est protégé dès que vous l'enregistrez, et le champ reste vide tant que vous ne le modifiez pas.", "A PIN is never displayed once saved: the long string you used to see was the automatic fingerprint created at the teacher's first sign-in. Now the PIN is protected as soon as you save it, and the field stays empty until you change it."))));
}
/* ===== end extras ===== */
