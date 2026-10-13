/* ===== EasyProf Inspection module (added) ===== */
var EPI_h = Y.createElement;
var EPI_MFR = ["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"];
var EPI_MEN = ["January","February","March","April","May","June","July","August","September","October","November","December"];
var EPI_DFR = ["Dim","Lun","Mar","Mer","Jeu","Ven","Sam"];
var EPI_DEN = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
function EPI_fmt(iso, fr) {
  if (!iso || iso.length < 10) return "…";
  var p = iso.split("-");
  return p[2] + " " + (fr ? EPI_MFR : EPI_MEN)[+p[1] - 1] + " " + p[0];
}
function EPI_days(ps, pe) {
  var out = [], a = new Date(ps + "T00:00:00Z"), b = new Date(pe + "T00:00:00Z");
  if (isNaN(a) || isNaN(b)) return out;
  for (var t = a, k = 0; t <= b && k < 800; t = new Date(t.getTime() + 864e5), k++) out.push({ iso: t.toISOString().slice(0, 10), dow: t.getUTCDay() });
  return out;
}
function EPI_defaults(st) {
  var has = function (id) { return (st.teachers || []).some(function (t) { return t.id === id; }); };
  var S = function (d, c, h) { return { d: d, c: c, h: h }; };
  var tt = {
    KAMDEM: [S(1,"F3_A",2),S(1,"LSA",2),S(1,"F4_AR",1),S(1,"USA",1),S(2,"USA",4),S(2,"LSA",3)],
    NEBASIBI: [S(3,"LSA",2),S(3,"USA",1),S(3,"F5_SC",2),S(4,"LSA",2),S(4,"USA",2),S(5,"F5_A",2),S(5,"LSA",1)],
    ASTHA: [S(1,"F1_A",2),S(1,"F1_B",2),S(1,"F1_ABIL",2),S(1,"F3_B",1),S(3,"F4_SC",2),S(3,"F4_AR",2),S(4,"F2_A",2),S(5,"F3_B",2),S(5,"F2_B",1),S(5,"F3_A",1)],
    TSOGO2026: [S(3,"USA",3),S(4,"F5_A",1),S(4,"F4_SC",1),S(4,"LSA",2),S(5,"USA",1),S(5,"F5_SC",1)]
  };
  var T = {}, adj = [], k = 0;
  Object.keys(tt).forEach(function (id) { if (has(id)) T[id] = tt[id]; });
  var A = function (t, kind, h, d, n) { if (has(t)) adj.push({ id: "a" + (++k), t: t, k: kind, h: h, d: d, n: n }); };
  A("TSOGO2026", "abs", 9, "2026-09-07", "Absente semaine 1 (07–11 sept.)");
  A("NEBASIBI", "abs", 12, "2026-09-07", "Absent semaine 1 (07–11 sept.)");
  A("KAMDEM", "dly", 6, "", "Retard de 3 leçons (3 × 2 h)");
  A("KAMDEM", "cat", 8, "", "Rattrapage 2 samedis : LSA + USA (2 h chacune)");
  return { ps: "2026-09-07", pe: "2026-10-09", lh: 2, hol: [], tt: T, adj: adj, ft: null, ac: null, yh: 0, yl: 0 };
}
function EPI_get(st) {
  var s = st.reportObservations && st.reportObservations.__inspection;
  var d = EPI_defaults(st);
  return s && typeof s === "object" ? Object.assign({}, d, s) : d;
}
function EPI_dueOut(I, r) { return I.rd && I.rd[r] != null ? !!I.rd[r] : EPX_reason(r)[4]; }
function EPI_calc(I, st, ps, pe) {
  ps = ps || I.ps; pe = pe || I.pe;
  var off = EPX_offSet(st), days = EPI_days(ps, pe);
  var termAt = function (iso) { var hit = (st.terms || []).filter(function (t) { return t.startDate <= iso && iso <= t.endDate; })[0]; return hit ? hit.id : ""; };
  var inP = function (a) { return !a.d || (a.d >= ps && a.d <= pe); };
  var rows = (st.teachers || []).filter(function (t) {
    return (I.tt[t.id] || []).length || I.adj.some(function (a) { return a.t === t.id; });
  }).map(function (t) {
    var slots = I.tt[t.id] || [];
    var weekly = slots.reduce(function (s, x) { return s + (+x.h || 0); }, 0);
    /* heures du jour : créneaux du bon jour, et du bon trimestre si le créneau est limité (ex. samedi de T1) */
    var hOn = function (d) {
      var tm = termAt(d.iso);
      return slots.reduce(function (s, x) { return s + ((+x.d) % 7 === d.dow && (!x.tm || !tm || x.tm === tm) ? (+x.h || 0) : 0); }, 0);
    };
    var decl = {};
    (st.entries || []).forEach(function (e) { if (e.type === "absence" && e.teacherId === t.id) decl[(e.timestamp || "").slice(0, 10)] = e.reason; });
    var due = 0, excused = 0, absD = 0, nOff = 0, declList = [];
    days.forEach(function (d) {
      var h = hOn(d); if (!h) return;
      if (off[d.iso]) { nOff += h; return; }
      var r = decl[d.iso];
      if (r && EPI_dueOut(I, r)) { excused += h; declList.push({ d: d.iso, r: r, h: h, out: true }); return; }
      due += h;
      if (r) { absD += h; declList.push({ d: d.iso, r: r, h: h, out: false }); }
    });
    var sum = function (k) { return I.adj.filter(function (a) { return a.t === t.id && a.k === k && inP(a); }).reduce(function (s, a) { return s + (+a.h || 0); }, 0); };
    var absM = sum("abs"), dly = sum("dly"), cat = sum("cat"), abs = absM + absD;
    var inPeriod = function (e) { var d = (e.timestamp || "").slice(0, 10); return e.teacherId === t.id && d >= ps && d <= pe; };
    var logged = (st.entries || []).filter(function (e) { return inPeriod(e) && !e.isDigitized && e.type !== "absence"; })
      .reduce(function (s, e) { return s + (+e.durationMinutes || 0) / 60; }, 0);
    var rev = (st.entries || []).filter(function (e) { return inPeriod(e) && (e.type === "revision" || e.type === "evaluation"); })
      .reduce(function (s, e) { return s + (+e.durationMinutes || 0) / 60; }, 0);
    var done = due - abs - dly + cat;
    return { id: t.id, name: t.shortName || t.name, weekly: weekly, due: due, abs: abs, absM: absM, absD: absD, excused: excused, off: nOff, dly: dly, cat: cat, done: done, rev: Math.min(Math.round(rev * 10) / 10, Math.max(done, 0)), decl: declList, logged: Math.round(logged * 10) / 10 };
  });
  var sm = function (k) { return rows.reduce(function (s, r) { return s + r[k]; }, 0); };
  var due = sm("due"), done = sm("done"), rev = sm("rev");
  var lh = +I.lh || 2;
  var yh = +I.yh || (st.classes || []).reduce(function (s, c) { return s + (+c.hoursPlannedYear || 0); }, 0);
  var yl = +I.yl || (st.classes || []).reduce(function (s, c) { return s + (+c.lessonsPlannedYear || 0); }, 0);
  var dueL = Math.round(due / lh), doneL = Math.round(Math.max(done - rev, 0) / lh);
  var pc = function (a, b) { return b > 0 ? Math.round((a / b) * 1000) / 10 : 0; };
  return { rows: rows, due: due, done: done, gap: done - due, covP: pc(done, due), covY: pc(done, yh), yh: yh, rev: rev, excused: sm("excused"), off: sm("off"),
    dueL: dueL, doneL: doneL, gapL: doneL - dueL, covLP: pc(doneL, dueL), covLY: pc(doneL, yl), yl: yl };
}
function EPI_names(I, st, id) {
  var t = (st.teachers || []).find(function (x) { return x.id === id; });
  return t ? (t.shortName || t.name) : id;
}
function EPI_autoFactors(I, st, R) {
  var fr = st.activeLanguage === "fr";
  var L = [];
  var inP = function (a) { return !a.d || (a.d >= I.ps && a.d <= I.pe); };
  var by = function (k) { return I.adj.filter(function (a) { return a.k === k && inP(a) && +a.h > 0; }); };
  var j = function (arr) { return arr.map(function (a) { return EPI_names(I, st, a.t) + " (" + a.h + " h" + (a.n ? " – " + a.n : "") + ")"; }).join("; "); };
  var ab = by("abs"), dl = by("dly"), ca = by("cat");
  if (ab.length) L.push((fr ? "Absences d'enseignants : " : "Teacher absences: ") + j(ab) + ".");
  /* absences déclarées dans EasyProf, regroupées par motif */
  var byR = {};
  R.rows.forEach(function (r) { r.decl.forEach(function (x) { if (!x.out) { var k = x.r; byR[k] = byR[k] || {}; byR[k][r.name] = (byR[k][r.name] || 0) + x.h; } }); });
  Object.keys(byR).forEach(function (k) {
    var rr = EPX_reason(k);
    L.push((fr ? "Absences (" + rr[1].toLowerCase() + ") : " : "Absences (" + rr[2].toLowerCase() + "): ") + Object.keys(byR[k]).map(function (n) { return n + " (" + byR[k][n] + " h)"; }).join("; ") + ".");
  });
  if (dl.length) L.push((fr ? "Retards dans l'exécution des leçons : " : "Delays in lesson delivery: ") + j(dl) + ".");
  if (ca.length) L.push((fr ? "Heures rattrapées : " : "Catch-up hours: ") + j(ca) + ".");
  if (R.off > 0) L.push((fr ? "Jours fériés / vacances (non comptés dans les heures dues) : " : "Holidays / breaks (not counted in hours due): ") + R.off + " h.");
  if (R.excused > 0) L.push((fr ? "Activités scolaires / jours fériés déclarés (non comptés dans les heures dues) : " : "School activities / declared holidays (not counted in hours due): ") + R.excused + " h.");
  if (R.rev > 0) L.push((fr ? "Séances de révision / évaluation : " : "Revision / assessment sessions: ") + R.rev + (fr ? " h (comptées en heures, pas en leçons)." : " h (counted as hours, not as lessons)."));
  if (R.gap >= 0 && !ab.length && !dl.length && !Object.keys(byR).length) L.push(fr ? "Aucun écart significatif." : "No significant gap.");
  return L.join("\n");
}
function EPI_autoActions(I, st, R) {
  var fr = st.activeLanguage === "fr";
  var L = [];
  if (R.gap < 0) {
    L.push(fr ? "Organiser des séances de rattrapage (samedis / plages libres) pour les classes dont les cours n'ont pas eu lieu." : "Organise catch-up sessions (Saturdays / free slots) for classes whose lessons were missed.");
    L.push(fr ? "Reprogrammer les leçons en retard et suivre leur exécution chaque semaine." : "Reschedule delayed lessons and monitor their delivery weekly.");
  }
  L.push(fr ? "Saisie hebdomadaire obligatoire de tous les enseignants dans EasyProf ; contrôle par l'AP chaque vendredi." : "Mandatory weekly entry by all teachers in EasyProf; weekly check by the HOD every Friday.");
  return L.join("\n");
}
function EPI_In(p) {
  var s = Y.useState(p.value == null ? "" : String(p.value)), v = s[0], setV = s[1];
  Y.useEffect(function () { setV(p.value == null ? "" : String(p.value)); }, [p.value]);
  var commit = function () { if (String(v) !== String(p.value == null ? "" : p.value)) p.onCommit(v); };
  var props = { value: v, onChange: function (e) { setV(e.target.value); if (p.live) p.onCommit(e.target.value); },
    onBlur: commit, onKeyDown: function (e) { if (e.key === "Enter" && !p.area) e.target.blur(); }, className: p.cls || "epi-in", placeholder: p.ph };
  if (p.area) { props.rows = p.rows || 4; return EPI_h("textarea", props); }
  props.type = p.type || "text";
  if (p.type === "number") { props.step = "0.5"; props.min = "0"; }
  return EPI_h("input", props);
}
var EPI_CSS = ".epi{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:var(--ep-text)}.epi h3{font-size:13px;font-weight:800;text-transform:uppercase;letter-spacing:.04em;margin:0 0 10px;color:var(--ep-ink)}" +
".epi-card{background:#fff;border:1px solid var(--ep-line);border-radius:18px;padding:16px;margin-bottom:16px;box-shadow:0 1px 2px rgba(23,65,63,.05)}.epi-row{display:flex;flex-wrap:wrap;gap:10px;align-items:flex-end}" +
".epi-lab{display:flex;flex-direction:column;font-size:10px;font-weight:700;text-transform:uppercase;color:var(--ep-muted);gap:4px}.epi-in{border:1px solid var(--ep-line);border-radius:12px;padding:8px 10px;font-size:13px;min-width:0;background:var(--ep-cream);color:var(--ep-text);font-family:inherit}.epi-in:focus{outline:2px solid var(--ep-teal);border-color:transparent}" +
"textarea.epi-in{width:100%;box-sizing:border-box;resize:vertical}.epi-btn{border:0;border-radius:12px;padding:9px 14px;font-size:12px;font-weight:800;cursor:pointer;background:var(--ep-teal);color:#fff;transition:transform .12s,box-shadow .12s,background .12s}.epi-btn:hover{background:var(--ep-teal-d);transform:translateY(-1px);box-shadow:0 4px 10px rgba(33,134,122,.25)}.epi-btn.alt{background:var(--ep-sand);color:var(--ep-ink)}.epi-btn.alt:hover{background:#ECE2CC}.epi-btn.on{background:var(--ep-ink);color:#fff}.epi-btn.red{background:#FBE4DC;color:var(--ep-coral)}" +
".epi-note{font-size:11px;color:var(--ep-muted);margin:8px 0 0;line-height:1.5}.epi-tbl{border-collapse:collapse;width:100%;font-size:12px}.epi-tbl th,.epi-tbl td{border:1px solid #000;padding:5px 6px;text-align:center;vertical-align:middle}.epi-tbl th{background:#F3ECDD;font-size:11px}" +
".epi-sheet{background:#fff;border:1px solid var(--ep-line);border-radius:14px;padding:16px;overflow-x:auto;color:#000}.epi-sheet h2{text-align:center;font-size:15px;margin:10px 0 2px;text-transform:uppercase}.epi-hd{display:flex;justify-content:space-between;font-size:9px;text-align:center;line-height:1.35}.epi-hd div{flex:1}" +
".epi-tbl td.l{text-align:left;white-space:pre-line}.epi-neg{color:#B3361A;font-weight:800}.epi-pos{color:#1F7A47;font-weight:800}.epi-sig{display:flex;gap:20px;margin-top:22px;font-size:10px;text-align:center}.epi-sig div{flex:1;border:1px dashed #999;min-height:70px;padding:6px}" +
".epi-item{display:flex;flex-wrap:wrap;gap:8px;align-items:center;border-bottom:1px dashed var(--ep-line);padding:6px 0;font-size:12px}.epi-hero{background:linear-gradient(135deg,var(--ep-ink),#1F5B58);color:#fff;border:0}.epi-chip{display:inline-flex;gap:4px;align-items:center;border-radius:999px;padding:2px 9px;font-size:10px;font-weight:700;background:#FFF1D6;color:#8A5A00}" +
"@media print{@page{size:A4 landscape;margin:10mm}body *{visibility:hidden}.epi-sheet,.epi-sheet *{visibility:visible}.epi-sheet{position:absolute;left:0;top:0;width:100%;border:0;padding:0}.epi-noprint{display:none!important}.epi-annex{page-break-before:always}}";
function EPI_fmtS(n) { return (n > 0 ? "+" : "") + (Math.round(n * 10) / 10); }
function EPI(props) {
  var st = props.state, e = props.onChangeState, fr = st.activeLanguage === "fr";
  var I = EPI_get(st), R = EPI_calc(I, st);
  var L = function (a, b) { return fr ? a : b; };
  var terms = st.terms || [];
  var t0 = (terms[0] || {}).startDate || "";
  /* rentrée enregistrée seulement si elle est cohérente avec la période (≤ 13 mois avant la fin) ; sinon on se limite à la période */
  var yearStart = t0 && t0 <= I.pe && (new Date(I.pe) - new Date(t0)) / 864e5 <= 395 ? t0 : I.ps;
  var Rc = EPI_calc(I, st, yearStart, I.pe);              /* cumul depuis le début de l'année */
  var upd = function (patch) {
    e(function (s) {
      var cur = EPI_get(s);
      return Object.assign({}, s, { reportObservations: Object.assign({}, s.reportObservations || {}, { __inspection: Object.assign({}, cur, typeof patch === "function" ? patch(cur) : patch) }) });
    });
  };
  var fs = Y.useState({ t: (st.teachers[0] || {}).id || "", k: "abs", h: "", d: "", n: "" }), F = fs[0], setF = fs[1];
  var os = Y.useState(null), openT = os[0], setOpenT = os[1];
  var facts = I.ft != null ? I.ft : EPI_autoFactors(I, st, R);
  var acts = I.ac != null ? I.ac : EPI_autoActions(I, st, R);
  var hd = (st.establishment || {}).header || {};
  var cls = st.classes || [];
  var kindLab = { abs: L("Absence", "Absence"), dly: L("Retard", "Delay"), cat: L("Rattrapage", "Catch-up") };
  var h2 = EPI_h;
  var sgn = function (n) { return h2("span", { className: n < 0 ? "epi-neg" : n > 0 ? "epi-pos" : "" }, EPI_fmtS(n)); };
  var addAdj = function () {
    if (!F.t || !(+F.h > 0)) return;
    upd(function (c) { return { adj: c.adj.concat([{ id: "a" + Date.now(), t: F.t, k: F.k, h: +F.h, d: F.d, n: F.n }]) }; });
    setF(Object.assign({}, F, { h: "", n: "", d: "" }));
  };
  var weekFill = function () {
    var r = R.rows.find(function (x) { return x.id === F.t; });
    if (r) setF(Object.assign({}, F, { h: r.weekly, n: F.n || L("Semaine entière", "Whole week") }));
  };
  var fieldLab = function (t, child) { return h2("label", { className: "epi-lab" }, t, child); };
  var sel = function (val, opts, on, w) {
    return h2("select", { className: "epi-in", value: val, style: w ? { width: w } : null, onChange: function (ev) { on(ev.target.value); } },
      opts.map(function (o) { return h2("option", { key: o[0], value: o[0] }, o[1]); }));
  };
  var tchOpts = (st.teachers || []).map(function (t) { return [t.id, t.shortName || t.name]; });
  var sumK = function (k) { return Math.round(R.rows.reduce(function (s, r) { return s + r[k]; }, 0) * 10) / 10; };
  var weeklyAll = R.rows.reduce(function (s, r) { return s + r.weekly; }, 0);

  /* ---- sheet (fiche officielle) ---- */
  var sheet = h2("div", { className: "epi-sheet" },
    h2("div", { className: "epi-hd" },
      h2("div", null, h2("b", null, hd.republicFR || hd.countryFR || "REPUBLIQUE DU CAMEROUN"), h2("br"), hd.mottoFR || "Paix-Travail-Patrie", h2("br"), hd.ministryFR || "MINISTERE DES ENSEIGNEMENTS SECONDAIRES", h2("br"), hd.delegationFR || "", h2("br"), hd.regionFR || ""),
      h2("div", { style: { alignSelf: "center", fontWeight: 800, fontSize: 11 } }, (st.establishment || {}).name || ""),
      h2("div", null, h2("b", null, hd.countryEN || "REPUBLIC OF CAMEROON"), h2("br"), hd.mottoEN || "Peace-Work-Fatherland", h2("br"), hd.ministryEN || "MINISTRY OF SECONDARY EDUCATION", h2("br"), hd.delegationEN || "", h2("br"), hd.regionEN || "")),
    h2("h2", null, L("Fiche de l'inspection nationale", "National inspection sheet")),
    h2("div", { style: { textAlign: "center", fontSize: 11, marginBottom: 8 } }, L("Année scolaire ", "School year ") + ((st.establishment || {}).schoolYear || "")),
    h2("table", { className: "epi-tbl" },
      h2("thead", null,
        h2("tr", null,
          h2("th", { rowSpan: 2 }, L("Période", "Period")),
          h2("th", { rowSpan: 2 }, L("Disciplines / Matières", "Subjects")),
          h2("th", { colSpan: 5 }, L("Couverture des horaires", "Hours coverage")),
          h2("th", { colSpan: 5 }, L("Couverture des programmes", "Syllabus coverage")),
          h2("th", { rowSpan: 2 }, L("Identification des facteurs d'écart entre prévisions et exécution (programmes et plans d'horaires)", "Factors explaining the gap between forecast and execution")),
          h2("th", { rowSpan: 2 }, L("Actions correctives / de remédiation", "Corrective / remedial actions"))),
        h2("tr", null,
          h2("th", null, L("Nombre d'heures dues pour la période", "Hours due (period)")), h2("th", null, L("Nombre d'heures faites", "Hours done")), h2("th", null, L("Écart (+/-) par rapport à la période", "Gap (+/-) vs period")), h2("th", null, L("Taux de couverture par rapport à la période (%)", "Coverage rate vs period (%)")), h2("th", null, L("Taux de couverture par rapport à l'année (%)", "Coverage rate vs year (%)")),
          h2("th", null, L("Nombre de leçons prévues pour la période", "Lessons planned (period)")), h2("th", null, L("Nombre de leçons faites", "Lessons done")), h2("th", null, L("Écart (+/-) par rapport à la période", "Gap (+/-) vs period")), h2("th", null, L("Taux de couverture par rapport à la période (%)", "Coverage rate vs period (%)")), h2("th", null, L("Taux de couverture par rapport à l'année (%)", "Coverage rate vs year (%)")))),
      h2("tbody", null, h2("tr", null,
        h2("td", { style: { fontSize: 11 } }, L("Du ", "From ") + EPI_fmt(I.ps, fr) + L(" au ", " to ") + EPI_fmt(I.pe, fr)),
        h2("td", { style: { fontWeight: 800 } }, st.discipline || "GEOGRAPHY"),
        h2("td", null, R.due), h2("td", null, R.done), h2("td", null, sgn(R.gap)), h2("td", null, R.covP + " %"), h2("td", null, R.covY + " %"),
        h2("td", null, R.dueL), h2("td", null, R.doneL), h2("td", null, sgn(R.gapL)), h2("td", null, R.covLP + " %"), h2("td", null, R.covLY + " %"),
        h2("td", { className: "l", style: { fontSize: 10, minWidth: 170 } }, facts),
        h2("td", { className: "l", style: { fontSize: 10, minWidth: 170 } }, acts)))),
    h2("p", { style: { fontSize: 10, margin: "6px 0 0" } },
      h2("b", null, L("Situation cumulée depuis la rentrée (", "Cumulative since the start of the year (") + EPI_fmt(yearStart, fr) + L(" au ", " to ") + EPI_fmt(I.pe, fr) + ") : "),
      Rc.done + " h " + L("faites sur ", "done out of ") + Rc.due + " h " + L("dues", "due") + " (" + Rc.covP + " %) · " + L("soit ", "i.e. ") + Rc.covY + " % " + L("des ", "of the ") + Rc.yh + " h " + L("annuelles prévues", "planned for the year") + " · " + Rc.doneL + " / " + Rc.dueL + L(" leçons", " lessons") + "."),
    h2("div", { className: "epi-sig" },
      h2("div", null, L("Animateur Pédagogique (AP)", "Head of Department (HOD)"), h2("br"), h2("b", null, (st.currentUser && st.currentUser.isAP && st.currentUser.name) || "")),
      h2("div", null, L("Censeur / Vice-Principal", "Vice-Principal")),
      h2("div", null, L("Proviseur / Principal", "Principal"))),
    h2("div", { className: "epi-annex", style: { marginTop: 18 } },
      h2("div", { style: { fontWeight: 800, fontSize: 12, margin: "0 0 6px" } }, L("Annexe – détail par enseignant", "Annex – detail per teacher")),
      h2("table", { className: "epi-tbl" },
        h2("thead", null, h2("tr", null, ["Enseignant|Teacher", "H/sem.|H/week", "Dues|Due", "Absences|Absences", "Retards|Delays", "Rattrapages|Catch-up", "Faites|Done", "dont révisions / éval.|incl. revision / assess.", "Saisies EasyProf|EasyProf logs"].map(function (x, i) { return h2("th", { key: i }, x.split("|")[fr ? 0 : 1]); }))),
        h2("tbody", null, R.rows.map(function (r) { return h2("tr", { key: r.id }, h2("td", { style: { textAlign: "left" } }, r.name), h2("td", null, r.weekly), h2("td", null, r.due), h2("td", null, r.abs ? "−" + r.abs : 0), h2("td", null, r.dly ? "−" + r.dly : 0), h2("td", null, r.cat ? "+" + r.cat : 0), h2("td", { style: { fontWeight: 800 } }, r.done), h2("td", null, r.rev + " h"), h2("td", null, r.logged + " h")); }),
          h2("tr", { style: { fontWeight: 800 } }, h2("td", { style: { textAlign: "left" } }, "TOTAL"), h2("td", null, weeklyAll), h2("td", null, R.due), h2("td", null, "−" + sumK("abs")), h2("td", null, "−" + sumK("dly")), h2("td", null, "+" + sumK("cat")), h2("td", null, R.done), h2("td", null, R.rev + " h"), h2("td", null, sumK("logged") + " h")))),
      h2("p", { style: { fontSize: 10, margin: "6px 0 0" } }, L("Heures faites = heures dues (emplois du temps, hors jours fériés/vacances et activités scolaires) − absences − retards + rattrapages. Les séances de révision et d'évaluation comptent en heures mais pas en leçons. Une leçon = " + I.lh + " h. Heures annuelles prévues : " + R.yh + " h ; leçons annuelles prévues : " + R.yl + ".", "Hours done = hours due (timetables, excluding holidays/breaks and school activities) − absences − delays + catch-ups. Revision and assessment sessions count as hours but not as lessons. One lesson = " + I.lh + " h. Planned yearly hours: " + R.yh + " h; planned yearly lessons: " + R.yl + "."))));

  /* ---- controls ---- */
  var setPeriod = function (a, b) { upd({ ps: a, pe: b }); };
  var presetBtn = function (label, a, b, key) { return h2("button", { key: key, type: "button", className: "epi-btn " + (I.ps === a && I.pe === b ? "on" : "alt"), onClick: function () { setPeriod(a, b); } }, label); };
  var lastEnd = (terms[terms.length - 1] || {}).endDate || I.pe;
  var today = EPX_iso(new Date());
  var ctrlPeriod = h2("div", { className: "epi-card epi-noprint" },
    h2("h3", null, L("1. Période d'inspection (choisissez les dates données par l'inspecteur)", "1. Inspection period (pick the dates given by the inspector)")),
    h2("div", { className: "epi-row" },
      fieldLab(L("Du", "From"), h2(EPI_In, { type: "date", value: I.ps, live: true, onCommit: function (v) { upd({ ps: v }); } })),
      fieldLab(L("Au", "To"), h2(EPI_In, { type: "date", value: I.pe, live: true, onCommit: function (v) { upd({ pe: v }); } })),
      fieldLab(L("Durée d'une leçon (h)", "Lesson length (h)"), h2(EPI_In, { type: "number", value: I.lh, onCommit: function (v) { upd({ lh: +v || 2 }); } })),
      fieldLab(L("Heures annuelles prévues", "Planned yearly hours"), h2(EPI_In, { type: "number", value: I.yh || R.yh, onCommit: function (v) { upd({ yh: +v || 0 }); } })),
      fieldLab(L("Leçons annuelles prévues", "Planned yearly lessons"), h2(EPI_In, { type: "number", value: I.yl || R.yl, onCommit: function (v) { upd({ yl: +v || 0 }); } }))),
    h2("div", { className: "epi-row", style: { marginTop: 10 } },
      h2("span", { className: "epi-lab" }, L("Raccourcis :", "Shortcuts:")),
      terms.map(function (t) { return presetBtn(fr ? t.nameFR.replace("PREMIER", "1er").replace("DEUXIEME", "2e").replace("TROISIEME", "3e").toLowerCase() : t.nameEN.toLowerCase(), t.startDate, t.endDate, t.id); }),
      presetBtn(L("année entière", "whole year"), yearStart, lastEnd, "year"),
      presetBtn(L("rentrée → aujourd'hui", "start → today"), yearStart, today, "today")),
    h2("p", { className: "epi-note" }, L("Les jours fériés et vacances du calendrier (Configuration → Année) sont retirés automatiquement : ", "Holidays and breaks from the calendar (Configuration → Year) are removed automatically: ") + R.off + L(" h concernées sur cette période. ", " h affected in this period. ") + L("Heures dues calculées d'après les emplois du temps (", "Hours due computed from the timetables (") + weeklyAll + L(" h par semaine). Les heures de digitalisation ne sont pas comptées.", " h per week). Digitalisation hours are not counted.")));

  var declared = [];
  R.rows.forEach(function (r) { r.decl.forEach(function (x) { declared.push({ t: r.name, d: x.d, r: x.r, h: x.h, out: x.out }); }); });
  declared.sort(function (a, b) { return a.d < b.d ? -1 : 1; });
  var ctrlAdj = h2("div", { className: "epi-card epi-noprint" },
    h2("h3", null, L("2. Absences, retards, rattrapages", "2. Absences, delays, catch-ups")),
    h2(EPD, { st: st, e: e, fr: fr, teachers: st.teachers || [] }),
    declared.length ? h2("div", { style: { margin: "12px 0" } },
      h2("div", { className: "epi-lab" }, L("Jours sans cours déclarés dans la période (automatique)", "No-class days declared in the period (automatic)")),
      declared.map(function (x, i) { var rr = EPX_reason(x.r); return h2("div", { key: i, className: "epi-item" }, h2("b", null, x.t), h2("span", null, x.d), h2("span", null, rr[3] + " " + (fr ? rr[1] : rr[2])), h2("span", { className: x.out ? "epi-pos" : "epi-neg" }, x.out ? L("non compté dans les heures dues", "not counted in hours due") + " (" + x.h + " h)" : "−" + x.h + " h")); })) : null,
    h2("div", { className: "epi-lab", style: { margin: "12px 0 6px" } }, L("Saisie manuelle (retards, rattrapages, absences passées)", "Manual entry (delays, catch-ups, past absences)")),
    h2("div", { className: "epi-row" },
      fieldLab(L("Enseignant", "Teacher"), sel(F.t, tchOpts, function (v) { setF(Object.assign({}, F, { t: v })); })),
      fieldLab(L("Type", "Type"), sel(F.k, [["abs", kindLab.abs], ["dly", kindLab.dly], ["cat", kindLab.cat]], function (v) { setF(Object.assign({}, F, { k: v })); })),
      fieldLab(L("Heures", "Hours"), h2("input", { className: "epi-in", type: "number", step: "0.5", min: "0", style: { width: 70 }, value: F.h, onChange: function (ev) { setF(Object.assign({}, F, { h: ev.target.value })); } })),
      fieldLab(L("Date (conseillé)", "Date (recommended)"), h2("input", { className: "epi-in", type: "date", value: F.d, onChange: function (ev) { setF(Object.assign({}, F, { d: ev.target.value })); } })),
      fieldLab(L("Note", "Note"), h2("input", { className: "epi-in", value: F.n, style: { width: 190 }, onChange: function (ev) { setF(Object.assign({}, F, { n: ev.target.value })); } })),
      h2("button", { className: "epi-btn alt", onClick: weekFill, type: "button" }, L("Semaine entière", "Whole week")),
      h2("button", { className: "epi-btn", onClick: addAdj, type: "button" }, L("+ Ajouter", "+ Add"))),
    h2("p", { className: "epi-note" }, L("Retard : 3 leçons = 6 h (3 × durée d'une leçon). Rattrapage : heures faites en plus (samedis…). Une ligne sans date est comptée dans toutes les périodes : indiquez une date pour qu'elle ne soit comptée que dans la bonne période.", "Delay: 3 lessons = 6 h. Catch-up: extra hours done (Saturdays…). A line without a date is counted in every period: set a date so it only counts in the right period.")),
    I.adj.map(function (a) {
      return h2("div", { key: a.id, className: "epi-item" },
        h2("b", null, EPI_names(I, st, a.t)), h2("span", null, kindLab[a.k]), h2("span", { className: a.k === "cat" ? "epi-pos" : "epi-neg" }, (a.k === "cat" ? "+" : "−") + a.h + " h"),
        h2("span", { style: { color: "var(--ep-muted)" } }, (a.d ? EPI_fmt(a.d, fr) + " · " : "") + (a.n || "")),
        !a.d ? h2("span", { className: "epi-chip" }, L("sans date : compté partout", "no date: counted everywhere")) : null,
        a.d && (a.d < I.ps || a.d > I.pe) ? h2("span", { style: { color: "#B45309", fontSize: 10 } }, L("(hors période)", "(outside period)")) : null,
        h2("button", { className: "epi-btn red", type: "button", style: { marginLeft: "auto", padding: "3px 9px" }, onClick: function () { upd(function (c) { return { adj: c.adj.filter(function (x) { return x.id !== a.id; }) }; }); } }, "×"));
    }));

  var ctrlTT = h2("div", { className: "epi-card epi-noprint" },
    h2("h3", null, L("3. Emplois du temps (heures par semaine)", "3. Timetables (hours per week)")),
    (st.teachers || []).map(function (t) {
      var slots = I.tt[t.id] || [];
      var w = slots.reduce(function (s, x) { return s + (+x.h || 0); }, 0);
      var open = openT === t.id;
      return h2("div", { key: t.id, style: { borderBottom: "1px dashed var(--ep-line)", padding: "6px 0" } },
        h2("div", { style: { display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }, onClick: function () { setOpenT(open ? null : t.id); } },
          h2("b", { style: { fontSize: 13 } }, (open ? "▾ " : "▸ ") + (t.shortName || t.name)), h2("span", { className: "epi-note", style: { margin: 0 } }, w + " h / " + L("sem.", "wk"))),
        open ? h2("div", { style: { marginTop: 6 } },
          slots.map(function (s, i) {
            var setS = function (p) { upd(function (c) { var tt = Object.assign({}, c.tt); tt[t.id] = (tt[t.id] || []).map(function (x, j) { return j === i ? Object.assign({}, x, p) : x; }); return { tt: tt }; }); };
            return h2("div", { key: i, className: "epi-row", style: { marginBottom: 4 } },
              sel(s.d, [1, 2, 3, 4, 5, 6].map(function (d) { return [d, (fr ? EPI_DFR : EPI_DEN)[d % 7]]; }), function (v) { setS({ d: +v }); }, 80),
              sel(s.c, cls.map(function (c) { return [c.id, c.name]; }).concat(cls.some(function (c) { return c.id === s.c; }) ? [] : [[s.c, s.c]]), function (v) { setS({ c: v }); }, 150),
              h2(EPI_In, { type: "number", value: s.h, cls: "epi-in", onCommit: function (v) { setS({ h: +v || 0 }); } }),
              sel(s.tm || "", [["", L("toute l'année", "all year")]].concat(terms.map(function (tm) { return [tm.id, tm.id]; })), function (v) { setS({ tm: v }); }, 110),
              h2("button", { className: "epi-btn red", type: "button", onClick: function () { upd(function (c) { var tt = Object.assign({}, c.tt); tt[t.id] = (tt[t.id] || []).filter(function (x, j) { return j !== i; }); return { tt: tt }; }); } }, "×"));
          }),
          h2("button", { className: "epi-btn alt", type: "button", onClick: function () { upd(function (c) { var tt = Object.assign({}, c.tt); tt[t.id] = (tt[t.id] || []).concat([{ d: 1, c: (cls[0] || {}).id || "", h: 1 }]); return { tt: tt }; }); } }, L("+ Créneau", "+ Slot"))) : null);
    }),
    h2("p", { className: "epi-note" }, L("Une ligne = une plage (jour, classe, nombre d'heures, et trimestre si elle ne vaut pas toute l'année). Vous pouvez y ajouter les samedis.", "One line = one slot (day, class, hours). Saturdays can be added here.")));

  var rd = I.rd || {};
  var ctrlRd = h2("div", { className: "epi-card epi-noprint" },
    h2("h3", null, L("4. Motifs : comment comptent-ils ?", "4. Reasons: how do they count?")),
    EPX_REASONS.map(function (r) {
      var out = EPI_dueOut(I, r[0]);
      return h2("div", { key: r[0], className: "epi-item" }, h2("span", null, r[3]), h2("b", { style: { minWidth: 230 } }, fr ? r[1] : r[2]),
        h2("button", { type: "button", className: "epi-btn " + (out ? "on" : "alt"), onClick: function () { var n = Object.assign({}, rd); n[r[0]] = true; upd({ rd: n }); } }, L("retiré des heures dues", "removed from hours due")),
        h2("button", { type: "button", className: "epi-btn " + (!out ? "on" : "alt"), onClick: function () { var n = Object.assign({}, rd); n[r[0]] = false; upd({ rd: n }); } }, L("heures non faites (absence)", "hours not done (absence)")));
    }),
    h2("p", { className: "epi-note" }, L("Dans tous les cas, le rappel « saisie en attente » ne s'affiche plus pour un jour déclaré, et aucune leçon n'est comptée ce jour-là.", "In every case the “entry pending” reminder no longer shows for a declared day and no lesson is counted that day.")));

  var ctrlText = h2("div", { className: "epi-card epi-noprint" },
    h2("h3", null, L("5. Facteurs d'écart et actions correctives", "5. Gap factors and corrective actions")),
    h2("div", { className: "epi-lab" }, L("Facteurs d'écart", "Gap factors")),
    h2(EPI_In, { area: true, value: facts, onCommit: function (v) { upd({ ft: v }); } }),
    h2("div", { className: "epi-lab", style: { marginTop: 8 } }, L("Actions correctives / de remédiation", "Corrective actions")),
    h2(EPI_In, { area: true, value: acts, onCommit: function (v) { upd({ ac: v }); } }),
    h2("div", { className: "epi-row", style: { marginTop: 8 } },
      h2("button", { className: "epi-btn alt", type: "button", onClick: function () { upd({ ft: null, ac: null }); } }, L("↻ Régénérer automatiquement", "↻ Regenerate automatically"))));

  return h2("div", { className: "epi" },
    h2("style", null, EPI_CSS),
    h2("div", { className: "epi-card epi-noprint epi-hero" },
      h2("div", { style: { display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", justifyContent: "space-between" } },
        h2("div", null, h2("div", { style: { fontSize: 11, opacity: .8, textTransform: "uppercase", fontWeight: 700, letterSpacing: ".05em" } }, L("Inspection – " + EPI_fmt(I.ps, true) + " → " + EPI_fmt(I.pe, true), "Inspection – " + EPI_fmt(I.ps, false) + " → " + EPI_fmt(I.pe, false))),
          h2("div", { style: { fontSize: 26, fontWeight: 800, color: "#F6C56B", margin: "2px 0" } }, R.done + " / " + R.due + " h · " + R.covP + " %"),
          h2("div", { style: { fontSize: 12, opacity: .9 } }, R.doneL + " / " + R.dueL + L(" leçons · ", " lessons · ") + R.covLP + " % · " + L("année : ", "year: ") + R.covY + " %")),
        h2("button", { className: "epi-btn", style: { background: "#F6C56B", color: "#3b2a06", padding: "11px 18px", fontSize: 13 }, type: "button", onClick: function () { window.print(); } }, L("🖨 Imprimer / PDF", "🖨 Print / PDF")))),
    ctrlPeriod, ctrlAdj, ctrlTT, ctrlRd, ctrlText, sheet);
}
/* ===== end Inspection module ===== */
