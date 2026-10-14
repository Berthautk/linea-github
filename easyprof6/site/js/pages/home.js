// Accueil : le tableau de bord (département pour l'animateur, ou « mes données »).
import { html } from '../vendor/preact-htm.js';
import { t, getLang } from '../i18n.js';
import { Icon } from '../icons.js';
import { Bar, Chip, Empty, statusChip, num1 } from '../ui.js';
import { BarChart } from '../charts.js';
import { makeCtx, stats, overall, noTimetable, dueRange, periodOf, classProgress, series, todaySlots, factors } from '../calc.js';
import { PeriodBar, ScopeBar, TodayCard, currentTid, periodLabel, unitFor } from '../widgets.js';
import { state, setUI, isAP, myId, me } from '../store.js';
import { saveDept } from '../actions.js';
import { minISO, fmt, addDays } from '../dates.js';
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

function whatsapp(tc, ctx) {
  const digits = String(tc.phone || '').replace(/[^0-9]/g, ''); if (!digits) return null;
  return 'https://wa.me/' + digits + '?text=' + encodeURIComponent(t('Bonjour {n}, petit rappel : merci d’enregistrer votre cours du jour sur Rekort.', { n: tc.name }));
}
function todayState(ctx, tc) {
  const td = todaySlots(ctx, tc.id);
  if (td.reason) return ['warn', reasonOf(td.reason).icon + ' ' + t('pas de cours')];
  if (!td.teaching || !td.rows.length) return ['', '—'];
  if (td.entries.length) return ['ok', '✓ ' + t('a saisi')];
  return ['bad', '⏰ ' + t('en attente')];
}
/** Collègues qui devaient faire cours ces 7 derniers jours mais n'ont rien saisi ni déclaré. */
function Inactive({ ctx }) {
  const from = addDays(ctx.today, -7), list = ctx.teachers.filter(tc => tc.id !== myId() && (tc.slots || []).length
    && dueRange(ctx, tc.id, from, ctx.today).due > 0 && !(ctx.byTeacher[tc.id] || []).some(e => e.date >= from && e.date <= ctx.today));
  if (!list.length) return null;
  return html`<div class="card"><div class="card-h"><h3>${t('Rien saisi depuis 7 jours')}</h3><${Chip} tone="warn">${list.length}<//></div>
    <div class="list">${list.map(tc => { const w = whatsapp(tc, ctx); return html`<div class="item"><div class="dot warn">⏰</div><div class="grow"><b>${tc.name}</b><span>${t('Des cours étaient prévus, mais rien n’est enregistré.')}</span></div>
      ${w ? html`<a class="btn sm" style="background:#25D366" href=${w} target="_blank" rel="noreferrer">${t('Rappeler')}</a>` : null}<a class="btn soft sm" href="#/week" onClick=${() => setUI({ wtid: tc.id })}>${t('Contrôler')}</a></div>`; })}</div></div>`;
}
function Team({ ctx, p }) {
  const rows = ctx.teachers.map(tc => ({ tc, S: stats(ctx, tc.id, p.ps, p.pe), st: todayState(ctx, tc) }));
  if (!rows.length) return null;
  return html`<div class="card"><div class="card-h"><h3>${t('Mon équipe')}</h3></div><div class="tbl-wrap"><table class="tbl"><thead><tr><th>${t('Enseignant')}</th><th>${t('Heures')}</th><th>%</th><th>${t('Leçons')}</th><th>${t('État')}</th><th>${t('Aujourd’hui')}</th><th></th></tr></thead><tbody>
    ${rows.map(({ tc, S, st }) => { const w = whatsapp(tc, ctx), nt = noTimetable(ctx, tc.id).length > 0; return html`<tr><td>${tc.name}</td><td>${nt ? num1(S.hours) + ' h' : num1(S.hours) + ' / ' + num1(S.due)}</td><td>${nt ? html`<${Chip} tone="warn">${t('emploi du temps ?')}<//>` : html`<${Chip} tone=${S.due && S.rate < THRESHOLDS.hours ? 'bad' : 'ok'}>${num1(S.rate)} %<//>`}</td><td>${S.lessonsDone} / ${num1(S.lessonsPlanned)}</td><td>${nt ? null : statusChip(overall(S))}</td>
      <td><${Chip} tone=${st[0]}>${st[1]}<//></td><td style="display:flex;gap:6px;justify-content:flex-end">${st[0] === 'bad' && w ? html`<a class="btn sm" style="background:#25D366" href=${w} target="_blank" rel="noreferrer">${t('Rappeler')}</a>` : null}${tc.id !== myId() ? html`<a class="btn soft sm" href="#/week" onClick=${() => setUI({ wtid: tc.id })}>${t('Contrôler')}</a>` : null}<button class="btn soft sm" onClick=${() => setUI({ scope: tc.id === myId() ? 'me' : tc.id })}>${t('Voir')}</button></td></tr>`; })}</tbody></table></div></div>`;
}
function DeptClasses({ ctx }) {
  const by = {};
  for (const tc of ctx.teachers) for (const r of classProgress(ctx, tc.id)) { const x = (by[r.classId] = by[r.classId] || { name: r.name, plan: 0, done: 0, expected: 0, hours: 0 }); x.plan += r.plan.total; x.done += r.done; x.expected += r.expected; x.hours += r.hours; }
  const rows = Object.values(by).filter(x => x.plan || x.done).sort((a, b) => (a.name < b.name ? -1 : 1)); if (!rows.length) return null;
  return html`<div class="card"><div class="card-h"><h3>${t('Les classes du département')}</h3><span class="sub">${t('Depuis la rentrée')}</span></div><div class="tbl-wrap"><table class="tbl"><thead><tr><th>${t('Classe')}</th><th>${t('Faites')}</th><th>${t('Attendues')}</th><th>${t('Prévues')}</th><th>${t('Heures')}</th><th>${t('État')}</th></tr></thead><tbody>
    ${rows.map(x => html`<tr><td>${x.name}</td><td>${x.done}</td><td>${num1(x.expected)}</td><td>${x.plan}</td><td>${num1(x.hours)}</td><td>${statusChip(x.plan ? (x.expected - x.done <= -1.5 ? 'ahead' : x.expected - x.done <= 1 ? 'ok' : x.expected - x.done <= 3 ? 'slight' : 'late') : 'none')}</td></tr>`)}</tbody></table></div></div>`;
}

export function Home() {
  const ctx = makeCtx(state.data), lang = getLang(), ap = isAP();
  const tid = currentTid(), scope = ap ? state.ui.scope : 'me';
  const p = state.ui.period && state.ui.period.ps ? state.ui.period : periodOf(ctx, (state.ui.period && state.ui.period.kind) || 'term');
  const S = stats(ctx, tid, p.ps, p.pe), Y = stats(ctx, tid, ctx.ys, minISO(ctx.today, ctx.ye));
  const who = tid ? (ctx.teacher(tid) || {}).name : t('Département {d}', { d: state.data.dept.discipline || '' });
  const noTT = noTimetable(ctx, tid), unreliable = noTT.length > 0 && S.hours > 0;
  const st = unreliable ? 'none' : overall(S);
  const data = series(ctx, tid, p.ps, p.pe, unitFor(p));
  const rows = tid ? classProgress(ctx, tid) : [];
  const worst = rows.filter(r => r.status === 'late' || r.status === 'slight').sort((a, b) => b.lag - a.lag)[0];
  const lag = S.lessonsPlanned - S.lessonsDone;
  const lateTeachers = !tid ? ctx.teachers.filter(x => !noTimetable(ctx, x.id).length && overall(stats(ctx, x.id, p.ps, p.pe)) === 'late').length : 0;
  const empty = !ctx.teachers.length || (!state.data.classes.length && ap);
  return html`<div class="page">
    <${ScopeBar} ctx=${ctx} />
    <div class="hero stack" style="gap:10px"><div><p class="sub">${fmt(ctx.today, lang, { weekday: true })}</p><h1>${t('Bonjour')}${me() && firstName(me().name) ? ', ' + firstName(me().name) : ''} 👋</h1><p class="sub">${who} · ${state.data.dept.name}</p></div>
      ${unreliable ? html`<div><div style="font-size:44px;font-weight:800;line-height:1">${num1(S.hours)} h</div><div class="sub">${t('heures faites')} · ${periodLabel(p, ctx)}</div></div>
        <a class="notice" href=${ap ? '#/settings/team' : '#/home'}><${Icon} n="alert" size="18" /><span>${ap ? t('Emploi du temps manquant : {n}. Sans lui, les heures dues et les pourcentages ne peuvent pas être calculés.', { n: noTT.map(x => x.short || x.name).join(', ') }) : t('Votre emploi du temps n’est pas encore renseigné : demandez à votre animateur pédagogique de l’ajouter.')}</span></a>`
      : S.due || S.hours ? html`<div class="row" style="align-items:flex-end;gap:18px"><div><div style="font-size:44px;font-weight:800;line-height:1">${S.due ? num1(S.rate) + ' %' : num1(S.hours) + ' h'}</div><div class="sub">${t('couverture horaire')} · ${periodLabel(p, ctx)}</div></div><div class="grow"></div>${st !== 'none' ? statusChip(st) : null}</div>
      <${Bar} value=${S.rate} /><div class="sub">${t('{h} h faites sur {d} h dues à ce jour', { h: num1(S.hours), d: num1(S.due) })}${S.dueFull > S.due ? ' · ' + t('{f} h prévues sur toute la période', { f: num1(S.dueFull) }) : ''}</div>`
        : html`<p style="font-size:15px;max-width:34em">${ap && !tid ? t('Bienvenue dans votre département. Suivez les étapes ci-dessous : dès que les emplois du temps et les premières saisies seront là, vos statistiques apparaîtront ici.') : t('Vos statistiques apparaîtront ici dès que votre emploi du temps sera renseigné et que vous aurez saisi vos premiers cours.')}</p>`}</div>
    ${ap && empty ? html`<${Setup} ctx=${ctx} />` : ap && scope === 'dept' ? html`<${Setup} ctx=${ctx} />` : null}
    ${tid && tid === myId() ? html`<${TodayCard} ctx=${ctx} tid=${tid} />` : null}
    <div class="card"><${PeriodBar} ctx=${ctx} period=${p} onChange=${(np) => setUI({ period: np })} /></div>
    <${Alerts} S=${unreliable ? { ...S, alerts: S.alerts.filter(a => a.kind !== 'hours') } : S} />
    <div class="kpis">
      <div class=${'kpi ' + (!unreliable && S.due && S.rate < THRESHOLDS.hours ? 'bad' : '')}><span class="l">${t('Heures faites')}</span><span class="v">${num1(S.hours)}<small>${unreliable ? ' h' : ' / ' + num1(S.due) + ' h'}</small></span><${Bar} value=${unreliable ? 0 : S.rate} tone=${!unreliable && S.due && S.rate < THRESHOLDS.hours ? 'bad' : ''} /><span class="s">${S.gap >= 0 ? t('+{n} h par rapport aux heures dues', { n: num1(S.gap) }) : t('{n} h par rapport aux heures dues', { n: num1(S.gap) })}</span></div>
      <div class=${'kpi ' + (S.lessonsPlanned && S.rateL < THRESHOLDS.lessons ? 'bad' : '')}><span class="l">${t('Leçons')}</span><span class="v">${S.lessonsDone}<small> / ${num1(S.lessonsPlanned)}</small></span><${Bar} value=${S.rateL} tone=${S.lessonsPlanned && S.rateL < THRESHOLDS.lessons ? 'bad' : ''} /><span class="s">${S.planned ? (lag > 1 ? t('Retard de {n} leçon(s)', { n: num1(lag) }) : lag <= -1.5 ? t('Avance de {n} leçon(s)', { n: num1(-lag) }) : t('Au rythme prévu')) : t('Aucun plan de leçons défini')}</span></div>
      <div class="kpi"><span class="l">${t('Sur l’année')}</span><span class="v">${num1(Y.rateYH)}<small> %</small></span><${Bar} value=${Y.rateYH} /><span class="s">${t('{h} h sur {p} h prévues', { h: num1(Y.hours), p: num1(Y.planYear.hours) })}</span></div>
      <div class="kpi"><span class="l">${tid ? t('Mon état') : t('État du département')}</span><span class="v" style="font-size:22px;padding-top:4px">${statusChip(st)}</span><span class="s">${tid ? (worst ? t('Le plus en retard : {c} ({n} leçon(s))', { c: worst.name, n: num1(worst.lag) }) : t('Aucun retard marquant')) : (lateTeachers ? t('{n} collègue(s) en retard', { n: lateTeachers }) : t('Aucun collègue en retard'))}</span></div>
    </div>
    ${data.length > 1 && data.some(d => d.due || d.done) ? html`<div class="card"><div class="card-h"><h3>${unitFor(p) === 'day' ? t('Heures par jour') : unitFor(p) === 'month' ? t('Heures par mois') : t('Heures par semaine')}</h3><div class="legend"><span><i style="background:var(--sand);border:1.5px solid var(--line)"></i>${t('dues')}</span><span><i style="background:var(--teal)"></i>${t('faites')}</span></div></div><${BarChart} data=${data} unit=${unitFor(p)} /></div>` : null}
    ${tid ? html`<${Classes} rows=${rows} ctx=${ctx} tid=${tid} />` : html`${ap && ctx.teachers.length > 1 ? html`<a class="card row" href="#/week" style="text-decoration:none;color:inherit;gap:14px"><div class="dot ok" style="font-size:20px">✅</div><div class="grow"><b>${t('Ronde en classe')}</b><p class="sub">${t('Un collègue n’a pas saisi ? Faites la ronde : choisissez-le et cochez ce que les élèves vous disent.')}</p></div><${Icon} n="right" size="18" /></a>` : null}<${Inactive} ctx=${ctx} /><${Team} ctx=${ctx} p=${p} /><${DeptClasses} ctx=${ctx} />`}
  </div>`;
}
