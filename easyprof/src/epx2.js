/* ===== EasyProf 5.2 : tableau de bord AP, bilan de l'enseignant, historique modifiable ===== */
var EP2_CSS = ".ep2{display:flex;flex-direction:column;gap:16px;color:var(--ep-text)}.ep2-head{display:flex;flex-wrap:wrap;gap:8px 16px;align-items:baseline;justify-content:space-between}.ep2-head h2{margin:0;font-family:'Playfair Display',Georgia,serif;font-style:italic;font-size:22px;color:var(--ep-ink)}.ep2-sub{font-size:12px;color:var(--ep-muted)}" +
  ".ep2-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:12px}.ep2-kpi{background:#fff;border:1px solid var(--ep-line);border-radius:18px;padding:14px 16px;display:flex;flex-direction:column;gap:6px;min-width:0}.ep2-kpi .l{font-size:10px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--ep-muted)}.ep2-kpi .v{font-size:30px;font-weight:800;color:var(--ep-ink);line-height:1.05;font-variant-numeric:tabular-nums}.ep2-kpi .s{font-size:12px;color:var(--ep-muted)}" +
  ".ep2-kpi.warn .v{color:var(--ep-coral)}.ep2-bar{height:8px;border-radius:99px;background:var(--ep-sand);overflow:hidden}.ep2-bar i{display:block;height:100%;border-radius:99px;background:var(--ep-teal)}.ep2-kpi.warn .ep2-bar i{background:var(--ep-coral)}.ep2-thr{font-size:10px;color:var(--ep-coral);font-weight:700}" +
  ".ep2-card{background:#fff;border:1px solid var(--ep-line);border-radius:18px;padding:16px}.ep2-card h3{margin:0 0 10px;font-size:13px;font-weight:800;letter-spacing:.03em;text-transform:uppercase;color:var(--ep-ink)}.ep2-scroll{overflow-x:auto}.ep2-tbl{border-collapse:collapse;width:100%;font-size:12px;font-variant-numeric:tabular-nums}.ep2-tbl th{font-size:10px;text-transform:uppercase;letter-spacing:.04em;color:var(--ep-muted);text-align:right;padding:6px 8px;border-bottom:2px solid var(--ep-line);white-space:nowrap}.ep2-tbl td{padding:8px;border-bottom:1px dashed var(--ep-line);text-align:right;white-space:nowrap}.ep2-tbl th:first-child,.ep2-tbl td:first-child{text-align:left;font-weight:700}" +
  ".ep2-pill{display:inline-block;border-radius:99px;padding:2px 10px;font-size:11px;font-weight:800}.ep2-ok{background:#E3F3EA;color:var(--ep-leaf)}.ep2-wait{background:#FFF1D6;color:#8A5A00}.ep2-low{background:#FBE4DC;color:var(--ep-coral)}.ep2-mute{background:var(--ep-sand);color:var(--ep-muted)}" +
  ".ep2-ent{display:flex;gap:10px;align-items:flex-start;justify-content:space-between;border-bottom:1px dashed var(--ep-line);padding:10px 0}.ep2-ent .t{font-weight:700;font-size:13px}.ep2-ent .m{font-size:11px;color:var(--ep-muted);display:flex;flex-wrap:wrap;gap:4px 12px;margin-top:2px}.ep2-act{display:flex;gap:6px;flex-shrink:0}.ep2-form{background:var(--ep-cream);border:1px solid var(--ep-line);border-radius:14px;padding:12px;margin:8px 0}" +
  "@media print{.ep2-noprint{display:none!important}}";

function EP2_pad(n) { return n < 10 ? "0" + n : "" + n; }
function EP2_pct(v, thr) { return v < thr ? "warn" : ""; }
function EP2_bounds(st, I) {
  var T = st.terms || [], today = EPX_iso(new Date());
  var ys = (T[0] || {}).startDate || today, ye = (T[T.length - 1] || {}).endDate || today;
  var pe = today < ye ? today : ye; if (pe < ys) pe = ys;
  if ((new Date(pe) - new Date(ys)) / 864e5 > 400) ys = (I && I.ps) || pe;   /* trimestres pas à jour : on ne gonfle pas l'année */
  return { ys: ys, ye: ye < ys ? pe : ye, today: today, pe: pe };
}
function EP2_term(st, iso) {
  var T = st.terms || [];
  return T.filter(function (t) { return t.startDate <= iso && iso <= t.endDate; })[0] || T.filter(function (t) { return t.status === "active"; })[0] || T[0];
}
function EP2_kpi(label, value, sub, pct, thr, thrTxt) {
  var warn = thr != null && pct != null && pct < thr;
  return EPX_h("div", { className: "ep2-kpi" + (warn ? " warn" : "") },
    EPX_h("div", { className: "l" }, label), EPX_h("div", { className: "v" }, value), pct != null ? EPX_h("div", { className: "ep2-bar" }, EPX_h("i", { style: { width: Math.max(0, Math.min(100, pct)) + "%" } })) : null,
    EPX_h("div", { className: "s" }, sub), warn ? EPX_h("div", { className: "ep2-thr" }, "⚠ " + thrTxt) : null);
}
function EP2_fmtD(iso, fr) { return iso ? EPI_fmt(iso, fr) : "…"; }

/* ---------- tableau de bord de l'AP ---------- */
function EPB(props) {
  var st = props.state, fr = st.activeLanguage === "fr", L = function (a, b) { return fr ? a : b; };
  var I = EPI_get(st), B = EP2_bounds(st, I);
  var R = EPI_calc(I, st, B.ys, B.pe);
  var cur = EP2_term(st, B.today) || {};
  var Rt = EPI_calc(I, st, cur.startDate > B.pe ? B.pe : cur.startDate, cur.endDate < B.pe ? cur.endDate : B.pe);
  var thrH = L("sous le seuil d'alerte de 80 %", "below the 80 % alert threshold"), thrL = L("sous le seuil d'alerte de 70 %", "below the 70 % alert threshold");
  var entries = st.entries || [], today = B.today, dow = new Date().getDay(), now = new Date();
  var logged = Math.round(R.rows.reduce(function (s, r) { return s + r.logged; }, 0) * 10) / 10;
  var termRows = (st.terms || []).map(function (t) {
    if (t.startDate > B.today) return { t: t, future: true };
    var pe = t.endDate < B.today ? t.endDate : B.today;
    return { t: t, r: EPI_calc(I, st, t.startDate, pe), pe: pe };
  });
  var teacherStatus = function (t) {
    var has = entries.some(function (e) { return e.teacherId === t.id && (e.timestamp || "").slice(0, 10) === today; });
    var abs = entries.some(function (e) { return e.type === "absence" && e.teacherId === t.id && (e.timestamp || "").slice(0, 10) === today; });
    if (EPX_offDay(st, now)) return ["mute", L("jour sans cours", "no class day")];
    if (abs) return ["mute", L("pas de cours (déclaré)", "no class (declared)")];
    if (has) return ["ok", L("✓ a saisi", "✓ logged")];
    if (EPX_teachesOn(st, t, now)) return ["wait", L("⏰ en attente", "⏰ pending")];
    return ["mute", L("pas de cours aujourd'hui", "no class today")];
  };
  var lastEntry = function (t) { var d = ""; entries.forEach(function (e) { if (e.teacherId === t.id && e.type !== "absence") { var x = (e.timestamp || "").slice(0, 10); if (x > d) d = x; } }); return d; };
  var byTeacher = {}; R.rows.forEach(function (r) { byTeacher[r.id] = r; });
  var tch = (st.teachers || []).filter(function (t) { return byTeacher[t.id]; });
  return EPX_h("div", { className: "ep2" },
    EPX_h("style", null, EP2_CSS),
    EPX_h("div", { className: "ep2-head" },
      EPX_h("h2", null, L("Tableau de bord", "Dashboard")),
      EPX_h("div", { className: "ep2-sub" }, L("Depuis la rentrée (", "Since the start of the year (") + EP2_fmtD(B.ys, fr) + L(") jusqu'au ", ") to ") + EP2_fmtD(B.pe, fr) + " · " + ((st.establishment || {}).name || ""))),
    EPX_h("div", { className: "ep2-grid" },
      EP2_kpi(L("Couverture horaire", "Hours coverage"), R.covP + " %", R.done + " / " + R.due + L(" h depuis la rentrée", " h since the start"), R.covP, 80, thrH),
      EP2_kpi(L("Couverture des leçons", "Lessons coverage"), R.covLP + " %", R.doneL + " / " + R.dueL + L(" leçons depuis la rentrée", " lessons since the start"), R.covLP, 70, thrL),
      EP2_kpi(L("Couverture annuelle", "Yearly coverage"), R.covY + " %", R.done + " h " + L("sur ", "of ") + R.yh + " h " + L("prévues sur l'année", "planned for the year"), R.covY, null),
      EP2_kpi((fr ? "Trimestre en cours · " : "Current term · ") + (cur.id || ""), Rt.covP + " %", Rt.done + " / " + Rt.due + " h · " + Rt.doneL + " / " + Rt.dueL + L(" leçons", " lessons"), Rt.covP, 80, thrH)),
    EPX_h("div", { className: "ep2-card" },
      EPX_h("h3", null, L("Par trimestre", "By term")),
      EPX_h("div", { className: "ep2-scroll" }, EPX_h("table", { className: "ep2-tbl" },
        EPX_h("thead", null, EPX_h("tr", null, ["Trimestre|Term", "Heures dues|Hours due", "Heures faites|Hours done", "Taux|Rate", "Leçons dues|Lessons due", "Leçons faites|Lessons done", "Taux|Rate"].map(function (x, i) { return EPX_h("th", { key: i }, x.split("|")[fr ? 0 : 1]); }))),
        EPX_h("tbody", null, termRows.map(function (x) {
          if (x.future) return EPX_h("tr", { key: x.t.id }, EPX_h("td", null, x.t.id), EPX_h("td", { colSpan: 6, style: { textAlign: "left", color: "var(--ep-muted)" } }, L("à venir (début le ", "upcoming (starts ") + EP2_fmtD(x.t.startDate, fr) + ")"));
          var r = x.r;
          return EPX_h("tr", { key: x.t.id }, EPX_h("td", null, x.t.id + (x.pe < x.t.endDate ? L(" (en cours)", " (ongoing)") : "")), EPX_h("td", null, r.due), EPX_h("td", null, r.done), EPX_h("td", null, EPX_h("span", { className: "ep2-pill " + (r.covP < 80 ? "ep2-low" : "ep2-ok") }, r.covP + " %")), EPX_h("td", null, r.dueL), EPX_h("td", null, r.doneL), EPX_h("td", null, EPX_h("span", { className: "ep2-pill " + (r.covLP < 70 ? "ep2-low" : "ep2-ok") }, r.covLP + " %")));
        }))))),
    EPX_h("div", { className: "ep2-card" },
      EPX_h("h3", null, L("Par enseignant, depuis la rentrée", "By teacher, since the start")),
      EPX_h("div", { className: "ep2-scroll" }, EPX_h("table", { className: "ep2-tbl" },
        EPX_h("thead", null, EPX_h("tr", null, ["Enseignant|Teacher", "Heures dues|Hours due", "Heures faites|Hours done", "Taux|Rate", "Leçons|Lessons", "Saisies (h)|Logged (h)", "Dernière saisie|Last entry", "Aujourd'hui|Today", ""].map(function (x, i) { return EPX_h("th", { key: i }, x.split("|")[fr ? 0 : 1]); }))),
        EPX_h("tbody", null, tch.map(function (t) {
          var r = byTeacher[t.id], s = teacherStatus(t), le = lastEntry(t);
          return EPX_h("tr", { key: t.id }, EPX_h("td", null, t.shortName || t.name), EPX_h("td", null, r.due), EPX_h("td", null, r.done), EPX_h("td", null, EPX_h("span", { className: "ep2-pill " + (r.due && r.done / r.due < .8 ? "ep2-low" : "ep2-ok") }, (r.due ? Math.round(r.done / r.due * 1000) / 10 : 0) + " %")),
            EPX_h("td", null, Math.round(Math.max(r.done - r.rev, 0) / (+I.lh || 2))), EPX_h("td", null, r.logged), EPX_h("td", null, le ? EPI_fmt(le, fr) : "—"),
            EPX_h("td", null, EPX_h("span", { className: "ep2-pill ep2-" + s[0] }, s[1])),
            EPX_h("td", null, s[0] === "wait" && t.phone ? EPX_h("a", { href: "https://wa.me/" + String(t.phone).replace(/[^0-9]/g, "") + "?text=" + encodeURIComponent(fr ? "Bonjour " + t.name + ", petit rappel : merci d'enregistrer votre cours du jour sur EasyProf." : "Hello " + t.name + ", reminder: please record today's lesson on EasyProf."), target: "_blank", rel: "noreferrer", className: "epx-btn", style: { textDecoration: "none", background: "#25D366", padding: "4px 10px" } }, L("Rappeler", "Remind")) : null));
        })))),
      EPX_h("p", { className: "epx-note" }, L("Heures faites = emplois du temps − absences − retards + rattrapages (comme la fiche d'inspection). Les saisies des enseignants (", "Hours done = timetables − absences − delays + catch-ups (as in the inspection sheet). Teacher entries (") + logged + L(" h au total) permettent de suivre le détail leçon par leçon : plus elles sont complètes, plus le suivi est précis.", " h in total) give the lesson-by-lesson detail: the more complete they are, the more precise the follow-up."))));
}

/* ---------- historique modifiable (espace enseignant) ---------- */
function EPH(props) {
  var st = props.st, e = props.e, me = props.me, fr = props.fr, L = function (a, b) { return fr ? a : b; };
  var I = EPI_get(st), B = EP2_bounds(st, I);
  var S = Y.useState({ cls: "", type: "", f: "", t: "" }), F = S[0], setF = S[1];
  var ES = Y.useState(null), ed = ES[0], setEd = ES[1];
  var toast = function (m, k) { if (window.triggerToast) window.triggerToast(m, k || "success"); else alert(m); };
  var classes = (st.classes || []).filter(function (c) { return (c.teacherIds || []).indexOf(me.id) >= 0; });
  var cname = function (id) { var c = (st.classes || []).filter(function (x) { return x.id === id; })[0]; return c ? c.name : (id || ""); };
  var mine = (st.entries || []).filter(function (x) { return x.teacherId === me.id; }).sort(function (a, b) { return a.timestamp < b.timestamp ? 1 : -1; });
  var list = mine.filter(function (x) {
    var d = (x.timestamp || "").slice(0, 10);
    return (!F.cls || x.classId === F.cls) && (!F.type || x.type === F.type) && (!F.f || d >= F.f) && (!F.t || d <= F.t);
  });
  var hours = Math.round(list.reduce(function (s, x) { return s + (+x.durationMinutes || 0) / 60; }, 0) * 10) / 10;
  var typeLab = function (t) { if (t === "absence") return L("Pas de cours", "No class"); var r = EPX_TYPES.filter(function (x) { return x[0] === t; })[0]; return r ? (fr ? r[1] : r[2]) : t; };
  var mins = function (a, b) { var p = function (v) { var q = String(v || "").split(":"); return (+q[0]) * 60 + (+q[1]); }; var d = p(b) - p(a); return isNaN(d) ? 0 : (d < 0 ? d + 1440 : d); };
  var startEdit = function (x) {
    var W = W1(x);
    setEd({ id: x.id, type: x.type, d: (x.timestamp || "").slice(0, 10), cls: x.classId, n: x.lessonNumber == null ? "" : x.lessonNumber, title: x.title || "", st: x.startTime || W.startTime, en: x.endTime || W.endTime, dig: !!x.isDigitized, reason: x.reason || "autre", note: x.note || "" });
  };
  var setE = function (k, v) { setEd(function (o) { var n = Object.assign({}, o); n[k] = v; return n; }); };
  var save = function () {
    var old = mine.filter(function (x) { return x.id === ed.id; })[0]; if (!old) { setEd(null); return; }
    var patch;
    if (old.type === "absence") {
      var r = EPX_reason(ed.reason);
      patch = { reason: ed.reason, note: ed.note, title: (fr ? "Pas de cours – " : "No class – ") + (fr ? r[1] : r[2]) + (ed.note ? " (" + ed.note + ")" : "") };
    } else {
      var dur = mins(ed.st, ed.en);
      if (dur <= 0) { toast(L("L'heure de fin doit être après l'heure de début.", "End time must be after start time."), "error"); return; }
      var isL = ed.type === "theorique" || ed.type === "pratique";
      if (isL && !(+ed.n > 0)) { toast(L("Indiquez le numéro de la leçon.", "Enter the lesson number."), "error"); return; }
      patch = { type: ed.type, classId: ed.cls, lessonNumber: isL ? +ed.n : null, title: ed.title.trim() || EPX_title(ed.type, fr, +ed.n), startTime: ed.st, endTime: ed.en, durationMinutes: dur, isDigitized: !!ed.dig };
    }
    if (ed.d && ed.d !== (old.timestamp || "").slice(0, 10)) {
      patch.timestamp = new Date(ed.d + "T12:00:00").toISOString();
      var tm = EP2_term(st, ed.d); if (tm) patch.termId = tm.id;
    }
    e(function (s) { return Object.assign({}, s, { entries: (s.entries || []).map(function (x) { return x.id === ed.id ? Object.assign({}, x, patch) : x; }) }); });
    setEd(null); toast(L("✓ Saisie modifiée.", "✓ Entry updated."));
  };
  var del = function (x) {
    var go = function () { e(function (s) { return Object.assign({}, s, { entries: (s.entries || []).filter(function (y) { return y.id !== x.id; }) }); }); toast(L("Saisie supprimée.", "Entry deleted.")); };
    if (window.triggerConfirm) window.triggerConfirm(L("Confirmer la suppression", "Confirm deletion"), L("Supprimer cette saisie de votre historique ?", "Delete this entry from your history?"), go); else if (window.confirm(L("Supprimer cette saisie ?", "Delete this entry?"))) go();
  };
  var lab = function (t, ch) { return EPX_h("label", { className: "epx-lab" }, t, ch); };
  var form = function () {
    var abs = ed.type === "absence", isL = ed.type === "theorique" || ed.type === "pratique";
    return EPX_h("div", { className: "ep2-form" },
      EPX_h("div", { className: "epx-row" },
        lab(L("Date", "Date"), EPX_h("input", { className: "epx-in", type: "date", value: ed.d, onChange: function (ev) { setE("d", ev.target.value); } })),
        abs ? lab(L("Motif", "Reason"), EPX_h("select", { className: "epx-in", value: ed.reason, onChange: function (ev) { setE("reason", ev.target.value); } }, EPX_REASONS.map(function (r) { return EPX_h("option", { key: r[0], value: r[0] }, r[3] + " " + (fr ? r[1] : r[2])); }))) : null,
        abs ? lab(L("Précision", "Detail"), EPX_h("input", { className: "epx-in", value: ed.note, onChange: function (ev) { setE("note", ev.target.value); } })) : null,
        !abs ? lab(L("Classe", "Class"), EPX_h("select", { className: "epx-in", value: ed.cls, onChange: function (ev) { setE("cls", ev.target.value); } }, classes.concat(classes.some(function (c) { return c.id === ed.cls; }) ? [] : [{ id: ed.cls, name: cname(ed.cls) }]).map(function (c) { return EPX_h("option", { key: c.id, value: c.id }, c.name); }))) : null,
        !abs ? lab(L("Type", "Type"), EPX_h("select", { className: "epx-in", value: ed.type, onChange: function (ev) { setE("type", ev.target.value); } }, EPX_TYPES.map(function (t) { return EPX_h("option", { key: t[0], value: t[0] }, fr ? t[1] : t[2]); }))) : null,
        !abs && isL ? lab(L("N° leçon", "Lesson no."), EPX_h("input", { className: "epx-in", type: "number", min: 1, style: { width: 80 }, value: ed.n, onChange: function (ev) { setE("n", ev.target.value); } })) : null,
        !abs ? lab(L("Début", "Start"), EPX_h("input", { className: "epx-in", type: "time", value: ed.st, onChange: function (ev) { setE("st", ev.target.value); } })) : null,
        !abs ? lab(L("Fin", "End"), EPX_h("input", { className: "epx-in", type: "time", value: ed.en, onChange: function (ev) { setE("en", ev.target.value); } })) : null),
      !abs ? EPX_h("div", { className: "epx-row", style: { marginTop: 8 } },
        lab(L("Titre / chapitre", "Title / chapter"), EPX_h("input", { className: "epx-in", style: { width: 320, maxWidth: "100%" }, value: ed.title, onChange: function (ev) { setE("title", ev.target.value); } })),
        EPX_h("label", { className: "epx-lab", style: { flexDirection: "row", alignItems: "center", gap: 6 } }, EPX_h("input", { type: "checkbox", checked: ed.dig, onChange: function (ev) { setE("dig", ev.target.checked); } }), L("Leçon digitalisée", "Digitized lesson"))) : null,
      EPX_h("div", { className: "epx-row", style: { marginTop: 10 } }, EPX_h("button", { className: "epx-btn", type: "button", onClick: save }, L("Enregistrer les modifications", "Save changes")), EPX_h("button", { className: "epx-btn alt", type: "button", onClick: function () { setEd(null); } }, L("Annuler", "Cancel"))));
  };
  return EPX_h("div", { className: "ep2" },
    EPX_h("style", null, EP2_CSS),
    EPX_h("div", { className: "ep2-card" },
      EPX_h("h3", null, L("Mes cours depuis la rentrée", "My lessons since the start of the year")),
      EPX_h("div", { className: "epx-row", style: { marginBottom: 8 } },
        lab(L("Classe", "Class"), EPX_h("select", { className: "epx-in", value: F.cls, onChange: function (ev) { setF(Object.assign({}, F, { cls: ev.target.value })); } }, [EPX_h("option", { key: "", value: "" }, L("Toutes", "All"))].concat(classes.map(function (c) { return EPX_h("option", { key: c.id, value: c.id }, c.name); })))),
        lab(L("Type", "Type"), EPX_h("select", { className: "epx-in", value: F.type, onChange: function (ev) { setF(Object.assign({}, F, { type: ev.target.value })); } }, [EPX_h("option", { key: "", value: "" }, L("Tous", "All"))].concat(EPX_TYPES.map(function (t) { return EPX_h("option", { key: t[0], value: t[0] }, fr ? t[1] : t[2]); })).concat([EPX_h("option", { key: "absence", value: "absence" }, L("Pas de cours", "No class"))]))),
        lab(L("Du", "From"), EPX_h("input", { className: "epx-in", type: "date", value: F.f, onChange: function (ev) { setF(Object.assign({}, F, { f: ev.target.value })); } })),
        lab(L("Au", "To"), EPX_h("input", { className: "epx-in", type: "date", value: F.t, onChange: function (ev) { setF(Object.assign({}, F, { t: ev.target.value })); } }))),
      EPX_h("div", { className: "ep2-sub", style: { marginBottom: 6 } }, list.length + L(" saisie(s) · ", " entries · ") + hours + " h"),
      list.length ? list.map(function (x) {
        var abs = x.type === "absence", W = W1(x), d = (x.timestamp || "").slice(0, 10);
        if (ed && ed.id === x.id) return EPX_h("div", { key: x.id }, form());
        return EPX_h("div", { key: x.id, className: "ep2-ent" },
          EPX_h("div", { style: { minWidth: 0 } },
            EPX_h("div", { className: "t" }, abs ? EPX_reason(x.reason)[3] + " " + (fr ? EPX_reason(x.reason)[1] : EPX_reason(x.reason)[2]) + (x.note ? " · " + x.note : "") : cname(x.classId) + " · " + (x.title || "")),
            EPX_h("div", { className: "m" }, EPX_h("span", null, EPI_fmt(d, fr)), abs ? null : EPX_h("span", null, "🕒 " + W.startTime + " – " + W.endTime), abs ? null : EPX_h("span", null, Fu(x.durationMinutes)), EPX_h("span", { className: "ep2-pill ep2-mute" }, abs ? typeLab("absence") : typeLab(x.type) + (x.lessonNumber != null ? " · N°" + x.lessonNumber : "")), x.isDigitized ? EPX_h("span", { className: "ep2-pill ep2-ok" }, "Digital") : null)),
          EPX_h("div", { className: "ep2-act" }, EPX_h("button", { className: "epx-btn alt", type: "button", onClick: function () { startEdit(x); } }, "✎ " + L("Modifier", "Edit")), EPX_h("button", { className: "epx-btn red", type: "button", onClick: function () { del(x); } }, "🗑")));
      }) : EPX_h("p", { className: "epx-note" }, L("Aucune saisie pour ces filtres.", "No entries for these filters."))));
}

/* ---------- bilan de l'enseignant : sa fiche d'inspection sur dates libres ---------- */
function EPT(props) {
  var st = props.st, me = props.me, fr = props.fr, L = function (a, b) { return fr ? a : b; };
  var I0 = EPI_get(st), B = EP2_bounds(st, I0), terms = st.terms || [];
  var S = Y.useState({ ps: B.ys, pe: B.pe }), P = S[0], setP = S[1];
  var TX = Y.useState({ ft: null, ac: null }), T = TX[0], setT = TX[1];
  var hasTT = (I0.tt[me.id] || []).length > 0;
  /* heures dues sur toute l'année pour cet enseignant (emploi du temps, hors vacances) */
  var Ry = EPI_calc(I0, st, B.ys, B.ye, me.id), yrow = Ry.rows[0], yh = yrow ? yrow.due : 0, lh = +I0.lh || 2;
  var Ip = Object.assign({}, I0, { yh: yh || 0, yl: yh ? Math.round(yh / lh) : 0, adj: I0.adj.filter(function (a) { return a.t === me.id; }) });
  var R = EPI_calc(Ip, st, P.ps, P.pe, me.id);
  var Rc = EPI_calc(Ip, st, B.ys, P.pe, me.id);
  var row = R.rows[0] || { due: 0, done: 0, logged: 0, rev: 0, weekly: 0, decl: [] };
  var facts = T.ft != null ? T.ft : EPI_autoFactors(Ip, st, R), acts = T.ac != null ? T.ac : EPI_autoActions(Ip, st, R);
  var presets = terms.map(function (t) { return [t.id, t.startDate, t.endDate < B.pe ? t.endDate : B.pe]; }).filter(function (x) { return x[1] <= B.pe; });
  presets.push([L("rentrée → aujourd'hui", "start → today"), B.ys, B.pe]);
  var inP = function (x) { var d = (x.timestamp || "").slice(0, 10); return x.teacherId === me.id && d >= P.ps && d <= P.pe; };
  var mine = (st.entries || []).filter(inP);
  var lessonsRec = new Set(mine.filter(EPX_isLesson).map(function (x) { return x.classId + "_" + x.type + "_" + x.lessonNumber; })).size;
  var hoursRec = Math.round(mine.filter(function (x) { return x.type !== "absence"; }).reduce(function (s, x) { return s + (+x.durationMinutes || 0) / 60; }, 0) * 10) / 10;
  var fill = row.done > 0 ? Math.min(100, Math.round(hoursRec / row.done * 100)) : 0;
  var myClasses = (st.classes || []).filter(function (c) { return (c.teacherIds || []).indexOf(me.id) >= 0; });
  var perClass = myClasses.map(function (c) {
    var es = mine.filter(function (x) { return x.classId === c.id && x.type !== "absence"; });
    var th = new Set(es.filter(function (x) { return EPX_isLesson(x) && x.type !== "pratique"; }).map(function (x) { return x.lessonNumber; })).size;
    var pr = new Set(es.filter(function (x) { return x.type === "pratique"; }).map(function (x) { return x.lessonNumber; })).size;
    var all = (st.entries || []).filter(function (x) { return x.teacherId === me.id && x.classId === c.id && x.type !== "absence" && (x.timestamp || "").slice(0, 10) <= P.pe; });
    var thAll = new Set(all.filter(function (x) { return EPX_isLesson(x) && x.type !== "pratique"; }).map(function (x) { return x.lessonNumber; })).size;
    var plan = +c.lessonsPlannedTheory > 0 ? +c.lessonsPlannedTheory : (+c.lessonsPlannedYear || 0);
    return { c: c, h: Math.round(es.reduce(function (s, x) { return s + (+x.durationMinutes || 0) / 60; }, 0) * 10) / 10, th: th, pr: pr, thAll: thAll, plan: plan, cov: plan ? Math.min(100, Math.round(thAll / plan * 100)) : 0 };
  });
  var lab = function (t, ch) { return EPX_h("label", { className: "epx-lab" }, t, ch); };
  return EPX_h("div", { className: "ep2" },
    EPX_h("style", null, EP2_CSS + EPI_CSS),
    EPX_h("div", { className: "ep2-head ep2-noprint" }, EPX_h("h2", null, L("Mon bilan", "My summary")), EPX_h("div", { className: "ep2-sub" }, me.name)),
    EPX_h("div", { className: "ep2-card ep2-noprint" },
      EPX_h("h3", null, L("Période (dates demandées par l'inspecteur)", "Period (dates requested by the inspector)")),
      EPX_h("div", { className: "epx-row" },
        lab(L("Du", "From"), EPX_h("input", { className: "epx-in", type: "date", value: P.ps, onChange: function (ev) { setP(Object.assign({}, P, { ps: ev.target.value })); } })),
        lab(L("Au", "To"), EPX_h("input", { className: "epx-in", type: "date", value: P.pe, onChange: function (ev) { setP(Object.assign({}, P, { pe: ev.target.value })); } })),
        presets.map(function (x) { return EPX_h("button", { key: x[0], type: "button", className: "epx-btn " + (P.ps === x[1] && P.pe === x[2] ? "" : "alt"), onClick: function () { setP({ ps: x[1], pe: x[2] }); } }, x[0]); }),
        EPX_h("button", { type: "button", className: "epx-btn warn", style: { marginLeft: "auto" }, onClick: function () { window.print(); } }, "🖨 " + L("Imprimer / PDF", "Print / PDF")))),
    !hasTT ? EPX_h("div", { className: "ep2-card ep2-noprint", style: { borderLeft: "5px solid var(--ep-apricot)" } }, EPX_h("b", null, L("Votre emploi du temps n'est pas encore renseigné par l'AP.", "Your timetable has not been entered by the HOD yet.")), EPX_h("p", { className: "epx-note" }, L("Les heures dues ne peuvent pas être calculées ; vos saisies sont comptées ci-dessous.", "Hours due cannot be computed; your entries are counted below."))) : null,
    EPX_h("div", { className: "ep2-grid ep2-noprint" },
      EP2_kpi(L("Heures sur la période", "Hours in the period"), R.covP + " %", row.done + " / " + row.due + " h", R.covP, 80, L("sous le seuil d'alerte de 80 %", "below the 80 % alert threshold")),
      EP2_kpi(L("Leçons sur la période", "Lessons in the period"), R.covLP + " %", R.doneL + " / " + R.dueL + L(" leçons", " lessons"), R.covLP, 70, L("sous le seuil d'alerte de 70 %", "below the 70 % alert threshold")),
      EP2_kpi(L("Mon année (heures)", "My year (hours)"), Rc.covY + " %", Rc.done + " h " + L("sur ", "of ") + yh + " h " + L("de mon emploi du temps", "of my timetable"), Rc.covY, null),
      EP2_kpi(L("Mes saisies", "My entries"), hoursRec + " h", lessonsRec + L(" leçon(s) saisie(s) · ", " lesson(s) logged · ") + fill + L(" % des heures faites renseignées", " % of hours done logged"), fill, null)),
    EPX_h("div", { className: "ep2-card ep2-noprint" },
      EPX_h("h3", null, L("Mes classes", "My classes")),
      EPX_h("div", { className: "ep2-scroll" }, EPX_h("table", { className: "ep2-tbl" },
        EPX_h("thead", null, EPX_h("tr", null, ["Classe|Class", "Heures saisies (période)|Hours logged (period)", "Leçons théorie (période)|Theory lessons (period)", "TP (période)|Practicals (period)", "Leçons faites / prévues (année)|Lessons done / planned (year)", "Taux année|Year rate"].map(function (x, i) { return EPX_h("th", { key: i }, x.split("|")[fr ? 0 : 1]); }))),
        EPX_h("tbody", null, perClass.map(function (x) { return EPX_h("tr", { key: x.c.id }, EPX_h("td", null, x.c.name), EPX_h("td", null, x.h), EPX_h("td", null, x.th), EPX_h("td", null, x.pr), EPX_h("td", null, x.thAll + " / " + x.plan), EPX_h("td", null, EPX_h("span", { className: "ep2-pill " + (x.cov < 70 ? "ep2-low" : "ep2-ok") }, x.cov + " %"))); })))),
      EPX_h("p", { className: "epx-note" }, L("Les chiffres par classe viennent de vos saisies : plus elles sont complètes, plus ils sont exacts.", "Per-class figures come from your entries: the more complete they are, the more accurate they are."))),
    EPX_h("div", { className: "ep2-card ep2-noprint" },
      EPX_h("h3", null, L("Commentaires pour l'inspecteur (facultatif)", "Notes for the inspector (optional)")),
      EPX_h("div", { className: "epx-lab" }, L("Facteurs d'écart", "Gap factors")), EPX_h(EPI_In, { area: true, value: facts, rows: 3, onCommit: function (v) { setT(Object.assign({}, T, { ft: v })); } }),
      EPX_h("div", { className: "epx-lab", style: { marginTop: 8 } }, L("Actions correctives", "Corrective actions")), EPX_h(EPI_In, { area: true, value: acts, rows: 3, onCommit: function (v) { setT(Object.assign({}, T, { ac: v })); } }),
      EPX_h("p", { className: "epx-note" }, L("Ces textes servent à l'impression ; ils ne sont pas conservés après avoir quitté la page.", "These texts are for printing; they are not kept once you leave the page."))),
    EPI_Sheet({ st: st, I: Ip, R: R, Rc: Rc, yearStart: B.ys, facts: facts, acts: acts, who: me.name }));
}
/* ===== end 5.2 ===== */
