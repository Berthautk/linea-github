// Accueil : le tableau de bord (département pour l'animateur, ou « mes données »).
import { html, useState } from '../vendor/preact-htm.js';
import { ReminderSetup } from '../reminders.js';
import { t, getLang } from '../i18n.js';
import { Icon } from '../icons.js';
import { Bar, Chip, Empty, Seg, Field, statusChip, num1 } from '../ui.js';
import { BarChart, ProgressChart, TermChart } from '../charts.js';
import { makeCtx, yearsOf, compareYears, stats, overall, noTimetable, dueRange, cumulative, byTerm, activity, lagStatus, pct, periodOf, classProgress, series, todaySlots, factors, gapReport } from '../calc.js';
import { PeriodBar, ScopeBar, TodayCard, currentTid, periodLabel, unitFor, viewData, YearBar } from '../widgets.js';
import { state, setUI, isAP, myId, me, getScope, setScope } from '../store.js';
import { saveDept } from '../actions.js';
import { openReminder } from '../reminder.js';
import { record, absent, openRound } from './week.js';
import { minISO, fmt, addDays, dow } from '../dates.js';
import { reasonOf, THRESHOLDS } from '../consts.js';

const firstName = (n) => (n || '').replace(/^(Mr?\.?|Mme|Mlle|M\.)\s+/i, '').split(' ').filter(Boolean).slice(-1)[0] || '';

function Setup({ ctx }) {
  const d = state.data, dept = d.dept, ok = dept.setup || {}, others = ctx.teachers.filter(x => x.id !== myId());
  const confirm = (key) => saveDept({ setup: { ...ok, [key]: true } });
  const ttOk = ctx.teachers.length > 0 && ctx.teachers.every(x => (x.slots || []).some(sl => +sl.h > 0));
  const steps = [
    { key: 'dept', done: !!(dept.name && (dept.header.region || dept.header.division)) || ok.dept, href: '#/settings/dept', title: t('Établissement et en-tête'), sub: t('Nom, région, département : ils figurent sur la fiche d’inspection.') },
    { key: 'classes', done: ctx.classes.length > 0 || ok.classes, href: '#/settings/classes', title: t('Vos classes'), sub: t('Ajoutez les classes du département avec leurs effectifs.') },
    { key: 'team', done: ok.team || (others.length === 0 && !!state.ui.soloOk), href: '#/settings/team', title: t('Vos collègues'), sub: others.length ? t('{n} collègue(s) ajouté(s). Vérifiez les noms, identifiants et mots de passe, puis confirmez.', { n: others.length }) : t('Créez leurs comptes : ils recevront un identifiant et un mot de passe. (Seul dans le département ? Passez cette étape.)'), skip: others.length ? null : () => setUI({ soloOk: true }) },
    { key: 'tt', done: ok.tt || (ttOk && d.assign.some(a => !a.deleted)), href: '#/settings/team', title: t('Emplois du temps et leçons prévues'), sub: ttOk ? t('Pour chaque enseignant : ses cours de la semaine et le nombre de leçons dans chaque classe.') : t('Il manque l’emploi du temps de : {n}.', { n: ctx.teachers.filter(x => !(x.slots || []).some(sl => +sl.h > 0)).map(x => x.short || x.name).join(', ') }) },
    { key: 'regul', done: ok.regul || d.regul.some(r => !r.deleted && r.tag === 'start'), href: '#/settings/regul', title: t('Reprendre les semaines passées'), sub: t('Indiquez la date jusqu’à laquelle tout était à jour : personne ne démarre « en retard ». Rien à signaler ? Confirmez.') },
    { key: 'year', done: !!ok.year, href: '#/settings/year', title: t('Calendrier de l’année'), sub: t('Vérifiez les trimestres et les vacances.') },
  ];
  const n = steps.filter(s => s.done).length; if (n === steps.length || ok.hide) return null;
  return html`<div class="card"><div class="card-h"><h3>${t('Pour bien démarrer')}</h3><div class="row"><${Chip} tone="info">${n} / ${steps.length}<//><a class="btn soft sm" href="#/settings/guide">${t('Mode d’emploi')}</a><button class="btn ghost sm" onClick=${() => confirm('hide')}>${t('Masquer')}</button></div></div><div class="bar" style="margin-bottom:6px"><i style=${{ width: n / steps.length * 100 + '%' }}></i></div>
    ${steps.map((s, i) => html`<div class=${'step ' + (s.done ? 'done' : '')}><a class="row grow" href=${s.href} style="text-decoration:none;color:inherit;gap:12px;flex-wrap:nowrap"><span class="n">${s.done ? '✓' : i + 1}</span><div class="grow"><b>${s.title}</b><span>${s.sub}</span></div></a>
      ${s.done ? null : html`<div class="row" style="gap:6px;flex:none"><button class="btn sm" onClick=${() => confirm(s.key)}>${t('C’est bon')}</button>${s.skip ? html`<button class="btn soft sm" onClick=${s.skip}>${t('Passer')}</button>` : null}</div>`}</div>`)}</div>`;
}

function Alerts({ S }) {
  if (!S.alerts.length) return null;
  const msg = (a) => a.kind === 'hours' ? t('Couverture horaire de {v} % : sous le seuil d’alerte de {s} %. Des mesures correctives sont obligatoires et doivent être notifiées à la Délégation Régionale sous huitaine (arrêté conjoint du 14/08/2026, art. 18).', { v: num1(a.value), s: a.threshold })
    : a.kind === 'lessons' ? t('Couverture du programme de {v} % : sous le seuil d’alerte de {s} % (art. 21). Prévoyez un plan de remédiation.', { v: num1(a.value), s: a.threshold })
      : t('Taux de réussite de {v} % : sous le seuil de {s} % (art. 21). Remédiation obligatoire.', { v: num1(a.value), s: a.threshold });
  return html`<div class="stack" style="gap:8px">${S.alerts.map(a => html`<div class="err" style="display:flex;gap:10px"><${Icon} n="alert" size="20" style=${{ flex: 'none' }} /><span>${msg(a)}</span></div>`)}</div>`;
}

function Classes({ rows, ctx, tid }) {
  if (!rows.length) return html`<div class="card"><${Empty} icon="📚" title=${t('Aucune classe affectée')} text=${isAP() && tid === myId() ? t('Indiquez vos classes et le nombre de leçons prévues dans Réglages › Équipe › vous.') : t('Votre animateur pédagogique doit indiquer vos classes et le nombre de leçons prévues dans chaque classe.')}>
    ${isAP() ? html`<a class="btn sm" href="#/settings/team">${t('Ouvrir Équipe')}</a>` : null}<//></div>`;
  return html`<div class="card"><div class="card-h"><h3>${t('Mon avancement par classe')}</h3><span class="sub">${t('Le trait montre où vous devriez en être aujourd’hui.')}</span></div>
    <div class="stack" style="gap:16px">${rows.map(r => html`<div class="stack" style="gap:6px"><div class="row"><b class="grow">${r.name}</b>${statusChip(r.status)}</div>
      <${Bar} value=${r.progress} expected=${r.plan.total ? r.expectedPct : null} tone=${r.status === 'late' ? 'bad' : r.status === 'slight' ? 'warn' : ''} />
      <div class="sub">${r.plan.total ? t('{d} leçon(s) faite(s) sur {p} prévues · attendu à ce jour : {e}', { d: r.done, p: r.plan.total, e: num1(r.expected) }) + (r.lag > 1 ? ' · ' + t('retard de {n}', { n: num1(r.lag) }) : r.lag <= -1.5 ? ' · ' + t('avance de {n}', { n: num1(-r.lag) }) : '') : t('{d} leçon(s) saisie(s) · pas de plan défini', { d: r.done })} · ${num1(r.hours)} h</div></div>`)}</div></div>`;
}

function todayState(ctx, tc) {
  const td = todaySlots(ctx, tc.id);
  if (td.reason) return ['warn', reasonOf(td.reason).icon + ' ' + t('pas de cours')];
  if (!td.teaching || !td.rows.length) return ['', '—'];
  if (td.entries.length) return ['ok', '✓ ' + t('a saisi')];
  return ['bad', '⏰ ' + t('en attente')];
}
/** Objectifs cumulés depuis la rentrée : la cible (contour) et le réalisé (plein), semaine par semaine, puis à la fin de chaque trimestre. */
function Goals({ ctx, tid, p }) {
  const mode = state.ui.dmode || 'L', cid = state.ui.dclass || '', lang = getLang(), unit = mode === 'L' ? t('leçons') : 'h';
  const opts = ctx.classes.filter(c => ctx.assign.some(a => (!tid || a.teacherId === tid) && a.classId === c.id));
  const all = cumulative(ctx, tid, cid || null), terms = byTerm(ctx, tid, cid || null), past = all.filter(r => !r.future), cur = past[past.length - 1];
  const span = p.kind === 'year' ? 'year' : 'term', tm = (p.term && ctx.terms.find(x => x.id === p.term)) || ctx.terms.find(x => x.end >= ctx.today) || ctx.terms[ctx.terms.length - 1], rows = span === 'term' && tm ? all.filter(r => r.ps <= tm.end) : all;
  const g = (r) => (mode === 'L' ? r.goalL : r.goalH), d = (r) => (mode === 'L' ? r.doneL : r.doneH);
  if (!ctx.assign.some(a => !tid || a.teacherId === tid) && mode === 'L') return null;
  const ratio = cur && g(cur) ? Math.round(d(cur) / g(cur) * 100) : 0, tone = !cur || !g(cur) ? '' : ratio >= 90 ? 'ok' : ratio >= 70 ? 'warn' : 'bad';
  return html`<div class="card"><div class="card-h"><h3>${t('Objectifs depuis la rentrée')}</h3></div>
    ${opts.length > 1 ? html`<${Field} label=${t('Classe')}><select class="input" value=${cid} onChange=${(e) => setUI({ dclass: e.target.value })}><option value="">${t('Toutes les classes')}</option>${opts.map(c => html`<option value=${c.id}>${c.name}</option>`)}</select><//>` : null}
    ${cur ? html`<div class="row" style="flex-wrap:wrap;gap:8px;margin:10px 0 4px"><${Chip} tone=${tone} style="white-space:normal;line-height:1.35">${t('Après {k} semaine(s) : objectif {g} {u} · fait {d} ({p} %)', { k: cur.k, g: num1(g(cur)), u: unit, d: num1(d(cur)), p: ratio })}<//></div>` : null}
    <${ProgressChart} rows=${rows} mode=${mode} />
    <div class="legend"><span><i style="background:var(--sand);border:1.5px solid var(--line)"></i>${t('objectif cumulé')}</span><span><i style="background:var(--teal)"></i>${t('réalisé')}</span><span><i style="background:var(--coral)"></i>${t('en retard')}</span><span class="sub">${t('Numéro de la semaine depuis la rentrée')}</span></div>
    <details style="margin-top:10px"><summary><b>${t('Détail semaine par semaine')}</b></summary><div class="tbl-wrap"><table class="tbl"><thead><tr><th>${t('Semaine')}</th><th>${t('Objectif')}</th><th>${t('Fait')}</th><th>%</th></tr></thead><tbody>
      ${past.slice().reverse().map(r => html`<tr><td>${r.k} · ${fmt(r.ps, lang, { noYear: true })}</td><td>${num1(g(r))}</td><td>${num1(d(r))}</td><td><${Chip} tone=${g(r) && d(r) / g(r) < 0.7 ? 'bad' : g(r) && d(r) / g(r) < 0.9 ? 'warn' : 'ok'}>${g(r) ? Math.round(d(r) / g(r) * 100) : 0} %<//></td></tr>`)}</tbody></table></div></details></div>
  <div class="card"><div class="card-h"><h3>${t('Objectifs par trimestre')}</h3><span class="sub">${mode === 'L' ? t('cumul des leçons') : t('cumul des heures')}</span></div>
    <${TermChart} rows=${terms} mode=${mode} /><div class="legend"><span><i style="background:var(--sand);border:1.5px solid var(--line)"></i>${t('objectif à la fin du trimestre')}</span><span><i style="background:var(--teal)"></i>${t('réalisé à ce jour')}</span></div>
    <div class="list" style="margin-top:6px">${terms.map(r => html`<div class="item"><div class="grow"><b>${r.name}</b><span>${t('fin le {d}', { d: fmt(r.end, lang) })}</span></div><span class="sub">${r.future ? t('à venir') + ' · ' : ''}${t('objectif {g} {u}', { g: num1(g(r)), u: unit })}${d(r) != null ? ' · ' + t('fait {d}', { d: num1(d(r)) }) + ' (' + (g(r) ? Math.round(d(r) / g(r) * 100) : 0) + ' %)' : ''}</span></div>`)}</div></div>`;
}

/** Qui remplit l'application, et à quel rythme. */
function Activity({ ctx }) {
  const rows = ctx.teachers.map(tc => ({ tc, A: activity(ctx, tc.id) })); if (!rows.length) return null;
  const lab = { regular: t('Régulier'), irregular: t('Irrégulier'), low: t('Peu actif'), inactive: t('Inactif'), none: '—' }, tone = { regular: 'ok', irregular: 'warn', low: 'bad', inactive: 'bad', none: '' };
  return html`<div class="card"><div class="card-h"><h3>${t('Activité des collègues')}</h3><span class="sub">${t('Depuis la rentrée')}</span></div>
    <div class="list">${rows.map(({ tc, A }) => html`<div class="item" style="align-items:flex-start"><div class="grow"><b>${tc.name}</b>
      <div class="bar" style="margin:6px 0 4px"><i style=${{ width: A.rate + '%' }}></i></div>
      <span>${t('{a} semaine(s) active(s) sur {w}', { a: A.active, w: A.weeks })} · ${t('{f} classe(s) saisie(s) sur {c}', { f: A.filled, c: A.classes })} · ${A.last ? (A.since === 0 ? t('a saisi aujourd’hui') : t('dernière saisie il y a {n} jour(s)', { n: A.since })) : t('aucune saisie')}</span></div>
      <div class="stack" style="gap:6px;align-items:flex-end"><${Chip} tone=${tone[A.level]}>${lab[A.level]}<//>${isAP() && tc.id !== myId() && A.level !== 'regular' ? html`<button class="btn sm" style="background:#25D366" onClick=${() => openReminder(ctx, tc)}>${t('Rappeler')}</button>` : null}</div></div>`)}</div></div>`;
}

/** Collègues qui devaient faire cours ces 7 derniers jours mais n'ont rien saisi ni déclaré. */
function Inactive({ ctx }) {
  const from = addDays(ctx.today, -7), list = ctx.teachers.filter(tc => tc.id !== myId() && (tc.slots || []).length
    && dueRange(ctx, tc.id, from, ctx.today).due > 0 && !(ctx.byTeacher[tc.id] || []).some(e => e.date >= from && e.date <= ctx.today));
  if (!list.length) return null;
  return html`<div class="card"><div class="card-h"><h3>${t('Rien saisi depuis 7 jours')}</h3><${Chip} tone="warn">${list.length}<//></div>
    <div class="list">${list.map(tc => { return html`<div class="item"><div class="dot warn">⏰</div><div class="grow"><b>${tc.name}</b><span>${t('Des cours étaient prévus, mais rien n’est enregistré.')}</span></div>
      <button class="btn sm" style="background:#25D366" onClick=${() => openReminder(ctx, tc)}>${t('Rappeler')}</button><a class="btn soft sm" href="#/week" onClick=${() => setUI({ wtid: tc.id })}>${t('Contrôler')}</a></div>`; })}</div></div>`;
}
function Team({ ctx, p }) {
  const ap0 = isAP();
  const rows = ctx.teachers.map(tc => ({ tc, S: stats(ctx, tc.id, p.ps, p.pe), st: todayState(ctx, tc) }));
  if (!rows.length) return null;
  return html`<div class="card"><div class="card-h"><h3>${t('Résultats par collègue')}</h3><span class="sub">${periodLabel(p, ctx)}</span></div>
    <p class="sub" style="margin-bottom:6px">${t('Heures : faites sur dues d’après l’emploi du temps. Leçons : faites sur attendues d’après le plan de l’année.')}</p>
    <div class="list">${rows.map(({ tc, S, st }) => { const nt = noTimetable(ctx, tc.id).length > 0;
      return html`<div class="item" style="align-items:flex-start"><div class="grow"><b>${tc.name}</b>
        <div class="sub">${t('Heures')} : ${nt ? html`${num1(S.hours)} h <${Chip} tone="warn">${t('emploi du temps ?')}<//>` : html`${num1(S.hours)} ${t('sur')} ${num1(S.due)} (<em style=${{ fontStyle: 'normal', fontWeight: 800, color: S.due && S.rate < THRESHOLDS.hours ? 'var(--coral)' : 'inherit' }}>${num1(S.rate)} %</em>)`}</div>
        <div class="sub">${t('Leçons')} : ${S.lessonsDone} ${t('sur')} ${num1(S.lessonsPlanned)}</div>
        <div class="row" style="margin-top:6px;gap:6px"><${Chip} tone=${st[0]}>${st[1]}<//>${nt ? null : statusChip(overall(S))}</div></div>
        <div class="stack" style="gap:6px;align-items:flex-end">${ap0 && tc.id !== myId() && st[0] === 'bad' ? html`<button class="btn sm" style="background:#25D366" onClick=${() => openReminder(ctx, tc)}>${t('Rappeler')}</button>` : null}
          ${ap0 && tc.id !== myId() ? html`<a class="btn soft sm" href="#/week" onClick=${() => setUI({ wtid: tc.id })}>${t('Contrôler')}</a>` : null}
          <button class="btn soft sm" onClick=${() => setScope(tc.id === myId() ? 'me' : tc.id)}>${t('Voir')}</button></div></div>`; })}</div></div>`;
}
function DeptClasses({ ctx }) {
  const by = {};
  for (const tc of ctx.teachers) for (const r of classProgress(ctx, tc.id)) { const x = (by[r.classId] = by[r.classId] || { name: r.name, plan: 0, done: 0, expected: 0, hours: 0 }); x.plan += r.plan.total; x.done += r.done; x.expected += r.expected; x.hours += r.hours; }
  const rows = Object.values(by).filter(x => x.plan || x.done).sort((a, b) => (a.name < b.name ? -1 : 1)); if (!rows.length) return null;
  return html`<div class="card"><div class="card-h"><h3>${t('Avancement par classe')}</h3><span class="sub">${t('Depuis la rentrée')}</span></div>
    <p class="sub" style="margin-bottom:6px">${t('La barre montre les leçons faites sur celles prévues pour l’année ; le petit trait montre où l’on devrait en être aujourd’hui.')}</p>
    <div class="stack" style="gap:14px">${rows.map(x => { const lag = x.expected - x.done, st = x.plan ? lagStatus(lag) : 'none';
      return html`<div class="stack" style="gap:6px"><div class="row"><b class="grow">${x.name}</b>${statusChip(st)}</div>
        <${Bar} value=${x.plan ? pct(x.done, x.plan) : 0} expected=${x.plan ? pct(x.expected, x.plan) : null} tone=${st === 'late' ? 'bad' : st === 'slight' ? 'warn' : ''} />
        <div class="sub">${t('{d} leçon(s) faite(s) · {e} attendues à ce jour · {p} prévues dans l’année · {h} h', { d: x.done, e: num1(x.expected), p: x.plan, h: num1(x.hours) })}</div></div>`; })}</div></div>`;
}

function FridayRound({ ctx }) {
  const ics = 'data:text/calendar;charset=utf-8,' + encodeURIComponent(['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Rekort//FR', 'BEGIN:VEVENT', 'UID:rekort-ronde-vendredi@rekort', 'DTSTAMP:20261001T000000Z', 'DTSTART:20261002T070000', 'DTEND:20261002T073000', 'RRULE:FREQ=WEEKLY;BYDAY=FR', 'SUMMARY:Rekort : ronde en classe', 'DESCRIPTION:Contrôler la présence et les leçons de chaque collègue dans Rekort.', 'BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:Ronde en classe', 'TRIGGER:PT0S', 'END:VALARM', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n'));
  return html`<div class="card row" style="gap:14px;border-color:var(--teal)"><div class="dot ok" style="font-size:20px">🗓️</div><div class="grow"><b>${t('C’est vendredi : ronde en classe')}</b><p class="sub">${t('Passez dans les classes, puis ouvrez chaque collègue et cochez, jour par jour : présent, absent, retard (minutes), leçons. Cela met à jour tout de suite l’accueil et les deux fiches.')}</p>
    <div class="fri-actions"><a class="btn sm" href="#/week">${t('Commencer la ronde')}</a><a class="btn soft sm" href=${ics} download="rekort-ronde-vendredi.ics">${t('Rappel chaque vendredi dans mon téléphone')}</a></div></div></div>`;
}

/** En premier sur l'accueil : mes cours de ces derniers jours pas encore cochés. Un geste par cours ; la carte disparaît quand tout est fait. */
function ToCheck({ ctx }) {
  const me = myId(), tc = ctx.teacher(me), lang = getLang();
  if (!tc || !(tc.slots || []).some(sl => +sl.h > 0)) return null;
  const from = addDays(ctx.today, -13), list = gapReport(ctx, me).missing.filter(m => m.iso >= from && m.iso < ctx.today).sort((a, b) => (a.iso < b.iso ? 1 : a.iso > b.iso ? -1 : 0));
  if (!list.length) return null;
  const cname = (id) => (ctx.cls(id) || {}).name || id;
  return html`<div class="card tocheck"><div class="card-h"><h3>✅ ${t('À cocher : vos cours de ces derniers jours')}</h3><${Chip} tone="warn">${list.length}<//></div>
    <p class="sub" style="margin-bottom:6px">${t('Pour chaque cours : « Fait » s’il a eu lieu, « Absent » sinon. C’est enregistré tout de suite, dans la bonne semaine.')}</p>
    <div class="list">${list.slice(0, 6).map(m => html`<div class="item" style="flex-wrap:wrap"><div class="grow"><b>${cname(m.row.c)}</b><span class="cap">${fmt(m.iso, lang, { weekday: true, noYear: true })}${m.row.st ? ' · ' + m.row.st + ' → ' + m.row.en : ''} · ${m.row.h} h</span></div>
      <div class="wk-act"><button class="btn sm" onClick=${() => record(ctx, me, m.iso, m.row)}><${Icon} n="check" />${t('Fait')}</button><button class="btn soft sm" onClick=${() => absent(ctx, me, m.iso, m.row)}>${t('Absent')}</button><button class="btn ghost sm" onClick=${() => openRound(ctx, me, m.iso, m.row)}>${t('Détails…')}</button></div></div>`)}</div>
    ${list.length > 6 ? html`<a class="btn soft sm" style="margin-top:8px" href="#/lessons">${t('Voir les {n} autres dans Historique › À compléter', { n: list.length - 6 })}</a>` : null}</div>`;
}

/** Comparaison des années : couverture horaire et des leçons, par trimestre et sur l'année. */
function Compare({ tid }) {
  const ys = yearsOf(state.data); if (ys.length < 2) return null;
  const rows = compareYears(state.data, tid, makeCtx(state.data).today), cols = rows[0].cells.map(c => c.id);
  const head = (id) => (id === 'Y' ? t('Année') : id);
  const cell = (c) => !c ? '—' : c.rateH == null ? t('à venir') : html`<div><b>${num1(c.rateH)} %</b> ${t('heures')}</div><div class="sub">${num1(c.rateL)} % ${t('leçons')}</div>`;
  return html`<div class="card"><div class="card-h"><h3>📊 ${t('Comparer les années')}</h3><span class="sub">${t('couverture sur la période entière')}</span></div>
    <div class="tbl-wrap"><table class="tbl"><thead><tr><th>${t('Année')}</th>${cols.map(id => html`<th>${head(id)}</th>`)}</tr></thead><tbody>
      ${rows.map(r => html`<tr><td><b>${r.year}</b>${r.year === ys[0] ? html`<div class="sub">${t('à ce jour')}</div>` : null}</td>${cols.map(id => html`<td>${cell(r.cells.find(c => c.id === id))}</td>`)}</tr>`)}</tbody></table></div>
    <p class="hint" style="margin-top:6px">${t('Heures faites sur heures dues (emploi du temps de l’année) ; leçons faites sur leçons prévues (programme de l’année). Pour l’année en cours, les trimestres pas encore finis sont comptés à ce jour.')}</p></div>`;
}

/** Une seule fois : proposer les rappels du soir dans le calendrier du téléphone. */
const ASK = 'ep6:remind-asked';
function RemindInvite({ ctx }) {
  const [hide, setHide] = useState(() => { try { return !!localStorage.getItem(ASK); } catch { return true; } });
  const me = myId(), tc = ctx.teacher(me);
  if (hide || !tc || !(tc.slots || []).some(sl => +sl.h > 0)) return null;
  const done = () => { try { localStorage.setItem(ASK, '1'); } catch { } setHide(true); };
  return html`<div class="card stack" style="border:2px solid var(--apricot)"><div class="card-h"><h3>⏰ ${t('Un rappel le soir de vos jours de cours ?')}</h3><button class="btn ghost sm" onClick=${done}>${t('Plus tard')}</button></div>
    <${ReminderSetup} ctx=${ctx} tid=${me} onDone=${done} /></div>`;
}

export function Home() {
  const ctx = makeCtx(viewData()), live = makeCtx(state.data), past = !!state.ui.year, lang = getLang(), ap = isAP();
  const tid = currentTid(), scope = getScope();
  const p = state.ui.period && state.ui.period.ps ? state.ui.period : periodOf(ctx, (state.ui.period && state.ui.period.kind) || 'term');
  const S = stats(ctx, tid, p.ps, p.pe), Y = stats(ctx, tid, ctx.ys, minISO(ctx.today, ctx.ye));
  const who = tid ? (ctx.teacher(tid) || {}).name : t('Département {d}', { d: state.data.dept.discipline || '' });
  const mode = state.ui.dmode || 'L', denL = p.kind === 'year' && S.planYear.lessons ? S.planYear.lessons : S.lessonsFull;
  const den = p.kind === 'year' && S.planYear.hours ? S.planYear.hours : S.dueFull;
  const noTT = noTimetable(ctx, tid), unreliable = noTT.length > 0 && S.hours > 0;
  const st = unreliable ? 'none' : overall(S);
  const data = series(ctx, tid, p.ps, p.pe, unitFor(p));
  const rows = tid ? classProgress(ctx, tid) : [];
  const worst = rows.filter(r => r.status === 'late' || r.status === 'slight').sort((a, b) => b.lag - a.lag)[0];
  const lag = S.lessonsPlanned - S.lessonsDone;
  const lateTeachers = !tid ? ctx.teachers.filter(x => !noTimetable(ctx, x.id).length && overall(stats(ctx, x.id, p.ps, p.pe)) === 'late').length : 0;
  const empty = !ctx.teachers.length || (!state.data.classes.length && ap);
  return html`<div class="page">
    ${past ? null : html`<${ToCheck} ctx=${live} /><${RemindInvite} ctx=${live} />`}
    <${YearBar} />
    <${ScopeBar} ctx=${ctx} />
    <div class="card stack" style="gap:10px"><div class="scope-big sm"><${Seg} full options=${[{ id: 'L', label: '📖 ' + t('Leçons') }, { id: 'H', label: '⏱️ ' + t('Heures') }]} value=${mode} onChange=${(v) => setUI({ dmode: v })} /></div><${PeriodBar} ctx=${ctx} period=${p} onChange=${(np) => setUI({ period: np })} /></div>
    <div class="hero stack" style="gap:10px"><div><p class="sub">${fmt(ctx.today, lang, { weekday: true })}</p><h1>${t('Bonjour')}${me() && firstName(me().name) ? ', ' + firstName(me().name) : ''} 👋</h1><p class="sub">${who} · ${state.data.dept.name}</p></div>
      ${unreliable ? html`<div><div style="font-size:44px;font-weight:800;line-height:1">${num1(S.hours)} h</div><div class="sub">${t('heures faites')} · ${periodLabel(p, ctx)}</div></div>
        ${ap ? html`<div class="row" style="gap:8px;flex-wrap:wrap"><a class="btn sm" href="#/settings/team">${t('Saisir les emplois du temps')}</a><a class="btn soft sm" href="#/settings/data">${t('J’ai un fichier : l’importer')}</a></div>` : null}
        <a class="notice" href=${ap ? '#/settings/team' : '#/home'}><${Icon} n="alert" size="18" /><span>${ap ? t('Emploi du temps manquant : {n}. Sans lui, les heures dues et les pourcentages ne peuvent pas être calculés.', { n: noTT.map(x => x.short || x.name).join(', ') }) : t('Votre emploi du temps n’est pas encore renseigné : demandez à votre animateur pédagogique de l’ajouter.')}</span></a>`
      : S.due || S.hours ? html`<div class="row" style="align-items:flex-end;gap:18px"><div><div style="font-size:44px;font-weight:800;line-height:1">${mode === 'L' ? (denL ? num1(pct(S.lessonsDone, denL)) + ' %' : S.lessonsDone) : den ? num1(pct(S.hours, den)) + ' %' : num1(S.hours) + ' h'}</div><div class="sub">${mode === 'L' ? t('des leçons prévues sont faites') : t('des heures prévues sont faites')} · ${periodLabel(p, ctx)}</div></div><div class="grow"></div>${st !== 'none' ? statusChip(st) : null}</div>
      <${Bar} value=${mode === 'L' ? (denL ? pct(S.lessonsDone, denL) : 0) : den ? pct(S.hours, den) : 0} /><div class="sub">${mode === 'L' ? t('{h} leçons faites sur {f} prévues sur cette période', { h: S.lessonsDone, f: num1(denL) }) : t('{h} h faites sur {f} h prévues sur cette période', { h: num1(S.hours), f: num1(den) })}</div>
      ${mode === 'L' ? (S.lessonsPlanned ? html`<div class="sub" style="color:#fff"><b>${t('Rythme à ce jour : {r} %', { r: num1(S.rateL) })}</b> · ${t('{h} leçons faites sur {d} qui devaient l’être déjà (minimum {m} %)', { h: S.lessonsDone, d: num1(S.lessonsPlanned), m: THRESHOLDS.lessons })}</div>` : null)
        : S.due ? html`<div class="sub" style="color:#fff"><b>${t('Rythme à ce jour : {r} %', { r: num1(S.rate) })}</b> · ${t('{h} h faites sur {d} h qui devaient l’être déjà (minimum {m} %)', { h: num1(S.hours), d: num1(S.due), m: THRESHOLDS.hours })}</div>` : null}`
        : html`<p style="font-size:15px;max-width:34em">${ap && !tid ? t('Bienvenue dans votre département. Suivez les étapes ci-dessous : dès que les emplois du temps et les premières saisies seront là, vos statistiques apparaîtront ici.') : t('Vos statistiques apparaîtront ici dès que votre emploi du temps sera renseigné et que vous aurez saisi vos premiers cours.')}</p>`}</div>
    ${ap && empty ? html`<${Setup} ctx=${ctx} />` : ap && scope === 'dept' ? html`<${Setup} ctx=${ctx} />` : null}
    ${ap && ctx.teachers.length > 1 && dow(ctx.today) === 5 ? html`<${FridayRound} ctx=${ctx} />` : null}
    ${tid && tid === myId() && !past ? html`<${TodayCard} ctx=${live} tid=${tid} />` : null}
    <${Alerts} S=${unreliable ? { ...S, alerts: S.alerts.filter(a => a.kind !== 'hours') } : S} />
    <div class="kpis">
      <div class=${'kpi ' + (!unreliable && S.due && S.rate < THRESHOLDS.hours ? 'bad' : '')}><span class="l">${t('Heures faites')}</span><span class="v">${num1(S.hours)}<small>${unreliable ? ' h' : ' / ' + num1(S.due) + ' h'}</small></span><${Bar} value=${unreliable ? 0 : S.rate} tone=${!unreliable && S.due && S.rate < THRESHOLDS.hours ? 'bad' : ''} /><span class="s">${S.gap >= 0 ? t('+{n} h par rapport aux heures dues', { n: num1(S.gap) }) : t('{n} h par rapport aux heures dues', { n: num1(S.gap) })}</span></div>
      <div class=${'kpi ' + (S.lessonsPlanned && S.rateL < THRESHOLDS.lessons ? 'bad' : '')}><span class="l">${t('Leçons')}</span><span class="v">${S.lessonsDone}<small> / ${num1(S.lessonsPlanned)}</small></span><${Bar} value=${S.rateL} tone=${S.lessonsPlanned && S.rateL < THRESHOLDS.lessons ? 'bad' : ''} /><span class="s">${S.planned ? (lag > 1 ? t('Retard de {n} leçon(s)', { n: num1(lag) }) : lag <= -1.5 ? t('Avance de {n} leçon(s)', { n: num1(-lag) }) : t('Au rythme prévu')) : t('Aucun plan de leçons défini')}</span></div>
      <div class="kpi"><span class="l">${t('Sur l’année')}</span><span class="v">${num1(Y.rateYL)}<small> % ${t('des leçons')}</small></span><${Bar} value=${Y.rateYL} /><span class="s">${t('{d} leçons sur {p} prévues dans l’année', { d: Y.lessonsDone, p: Math.round(Y.planYear.lessons) })} · ${t('heures : {h} h sur {ph} h ({r} %)', { h: num1(Y.hours), ph: num1(Y.planYear.hours), r: num1(Y.rateYH) })}</span></div>
      <div class="kpi"><span class="l">${tid ? t('Mon état') : t('État du département')}</span><span class="v" style="font-size:22px;padding-top:4px">${statusChip(st)}</span><span class="s">${tid ? (worst ? t('Le plus en retard : {c} ({n} leçon(s))', { c: worst.name, n: num1(worst.lag) }) : t('Aucun retard marquant')) : (lateTeachers ? t('{n} collègue(s) en retard', { n: lateTeachers }) : t('Aucun collègue en retard'))}</span></div>
    </div>
    ${data.length > 1 && data.some(d => d.due || d.done) ? html`<div class="card"><div class="card-h"><h3>${unitFor(p) === 'day' ? t('Heures par jour') : unitFor(p) === 'month' ? t('Heures par mois') : t('Heures par semaine')}</h3><div class="legend"><span><i style="background:var(--sand);border:1.5px solid var(--line)"></i>${t('dues')}</span><span><i style="background:var(--teal)"></i>${t('faites')}</span></div></div><${BarChart} data=${data} unit=${unitFor(p)} /></div>` : null}
    <${Goals} ctx=${ctx} tid=${tid} p=${p} />
    ${tid ? html`<${Classes} rows=${rows} ctx=${ctx} tid=${tid} />` : html`${ap && ctx.teachers.length > 1 ? html`<a class="card row" href="#/week" style="text-decoration:none;color:inherit;gap:14px"><div class="dot ok" style="font-size:20px">✅</div><div class="grow"><b>${t('Ronde en classe')}</b><p class="sub">${t('Un collègue n’a pas saisi ? Faites la ronde : choisissez-le et cochez ce que les élèves vous disent.')}</p></div><${Icon} n="right" size="18" /></a>` : null}<${Activity} ctx=${ctx} />${ap ? html`<${Inactive} ctx=${ctx} />` : null}<${Team} ctx=${ctx} p=${p} /><${DeptClasses} ctx=${ctx} />`}
    <${Compare} tid=${tid} />
  </div>`;
}
