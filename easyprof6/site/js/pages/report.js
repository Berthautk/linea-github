// Fiche de l'inspection nationale (colonnes officielles) et récapitulatif par classe, sur les dates choisies.
import { html, useState, useEffect } from '../vendor/preact-htm.js';
import { t, getLang } from '../i18n.js';
import { Icon } from '../icons.js';
import { Seg, Chip, num1 } from '../ui.js';
import { makeCtx, stats, factors, followUp, periodOf, classProgress } from '../calc.js';
import { PeriodBar, ScopeBar, currentTid, periodLabel , viewData, YearBar } from '../widgets.js';
import { state, setUI, isAP, myId } from '../store.js';
import { fmt, minISO } from '../dates.js';
import { reasonOf, THRESHOLDS } from '../consts.js';
import { letterText, showArms } from '../letterhead.js';
import { exportWord } from '../exports.js';

const up = (s) => String(s || '').toUpperCase();
function factorTexts(ctx, S) {
  const out = [];
  for (const f of factors(ctx, S)) {
    if (f.kind === 'absence') out.push(t('Absences déclarées ({r}) : {w}.', { r: t(reasonOf(f.reason).fr).toLowerCase(), w: f.who.map(x => (x.teacher ? x.teacher + ' ' : '') + '(' + num1(x.h) + ' h)').join(' ; ') }));
    else if (f.kind === 'closed') out.push(t('Jours fériés et vacances, non comptés dans les heures dues : {h} h.', { h: num1(f.h) }));
    else if (f.kind === 'excused') out.push(t('Activités scolaires et jours fériés déclarés, non comptés dans les heures dues : {h} h.', { h: num1(f.h) }));
    else if (f.kind === 'revision') out.push(t('Séances de révision : {h} h (comptées en heures, pas en leçons).', { h: num1(f.h) }));
    else if (f.kind === 'assessment') out.push(t('Séances d’évaluation : {h} h (comptées en heures, pas en leçons).', { h: num1(f.h) }));
    else if (f.kind === 'regul') out.push(t('Régularisation d’heures : {h} h.', { h: (f.h > 0 ? '+' : '') + num1(f.h) }));
  }
  if (!out.length && S.gap >= 0) out.push(t('Aucun écart significatif.'));
  return out.join('\n');
}
function actionTexts(S) {
  const out = [];
  for (const a of S.alerts) {
    if (a.kind === 'hours') out.push(t('Couverture horaire inférieure au seuil de 80 % : mesures correctives obligatoires, à notifier à la Délégation Régionale sous huitaine (arrêté conjoint du 14/08/2026, art. 18).'));
    if (a.kind === 'lessons') out.push(t('Couverture du programme inférieure au seuil de 70 % : examen en conseil d’enseignement et plan de remédiation (art. 21).'));
    if (a.kind === 'success') out.push(t('Taux de réussite inférieur à 40 % : remédiation obligatoire (art. 21).'));
  }
  if (S.gap < 0) { out.push(t('Organiser des séances de rattrapage (samedis, plages libres) pour les classes dont les cours n’ont pas eu lieu.')); out.push(t('Reprogrammer les leçons en retard et en suivre l’exécution chaque semaine.')); }
  out.push(t('Saisie régulière de tous les enseignants dans Rekort ; contrôle par l’animateur pédagogique chaque vendredi.'));
  return out.join('\n');
}
function LetterSide({ text }) {
  const lines = text.split('\n');
  return html`<div><b>${lines[0]}</b>${lines.slice(1).map(l => html`<br />${l}`)}</div>`;
}
function Letterhead({ d, hd }) {
  return html`<div class="hd"><${LetterSide} text=${letterText(hd, 'fr')} />
      <div style="align-self:center">${showArms(hd) ? html`<img src="/icons/armoiries.png" alt="" style="width:74px;height:auto;display:block;margin:0 auto 4px" />` : null}<div style="font-weight:800;font-size:10px">${up(d.name)}</div></div>
      <${LetterSide} text=${letterText(hd, 'en')} /></div>`;
}

const sg = (n) => html`<span class=${n < 0 ? 'neg' : n > 0 ? 'pos' : ''}>${(n > 0 ? '+' : '') + num1(n)}</span>`;

export function Sheet({ ctx, tid, S, Y, p, who, facts, acts }) {
  const lang = getLang(), d = ctx.dept, hd = d.header || {}, same = p.ps.slice(0, 4) === p.pe.slice(0, 4);
  const teachers = tid ? ctx.teachers.filter(x => x.id === tid) : ctx.teachers;
  const wk = (x) => (x.slots || []).reduce((s, y) => s + (+y.h || 0), 0);
  return html`<div class="paper">
    <${Letterhead} d=${d} hd=${hd} />
    <h2>${t('Fiche de l’inspection nationale')}</h2><div style="text-align:center;font-size:11px;margin-bottom:8px">${t('Année scolaire')} ${d.year || ''}</div>
    <table><thead><tr><th rowspan="2">${t('Période')}</th><th rowspan="2">${t('Disciplines / Matières')}</th><th colspan="5">${t('Couverture des horaires')}</th><th colspan="5">${t('Couverture des programmes')}</th><th rowspan="2">${t('Identification des facteurs d’écart entre prévisions et exécution (programmes et plans d’horaires)')}</th><th rowspan="2">${t('Actions correctives / de remédiation')}</th></tr>
      <tr><th>${t('Nombre d’heures dues pour la période')}</th><th>${t('Nombre d’heures faites')}</th><th>${t('Écart (+/-) par rapport à la période')}</th><th>${t('Taux de couverture par rapport à la période (%)')}</th><th>${t('Taux de couverture par rapport à l’année (%)')}</th>
      <th>${t('Nombre de leçons prévues pour la période')}</th><th>${t('Nombre de leçons faites')}</th><th>${t('Écart (+/-) par rapport à la période')}</th><th>${t('Taux de couverture par rapport à la période (%)')}</th><th>${t('Taux de couverture par rapport à l’année (%)')}</th></tr></thead>
    <tbody><tr><td style="font-size:11px">${t('Du {a} au {b}', { a: fmt(p.ps, lang), b: fmt(p.pe, lang) })}</td><td style="font-weight:800">${up(d.discipline)}${who ? html`<br /><span style="font-weight:600;font-size:10px">${who}</span>` : ''}</td>
      <td>${num1(S.due)}</td><td>${num1(S.hours)}</td><td>${sg(S.gap)}</td><td>${num1(S.rate)} %</td><td>${num1(Y.rateYH)} %</td>
      <td>${Math.round(S.lessonsPlanned)}</td><td>${S.lessonsDone}</td><td>${sg(Math.round(S.lessonGap))}</td><td>${num1(S.rateL)} %</td><td>${num1(Y.rateYL)} %</td>
      <td class="l">${facts}</td><td class="l">${acts}</td></tr></tbody></table>
    <p style="font-size:10px;margin:6px 0 0"><b>${t('Situation cumulée depuis la rentrée')} (${fmt(ctx.ys, lang, { noYear: ctx.ys.slice(0, 4) === Y.pe.slice(0, 4) })} ${t('au')} ${fmt(Y.pe, lang)}) : </b>${num1(Y.hours)} h ${t('faites sur')} ${num1(Y.due)} h ${t('dues')} (${num1(Y.rate)} %) · ${t('soit')} ${num1(Y.rateYH)} % ${t('des')} ${num1(Y.planYear.hours)} h ${t('prévues sur l’année')} · ${Y.lessonsDone} / ${Math.round(Y.lessonsPlanned)} ${t('leçons')}.</p>
    <div class="sig"><div>${tid ? t('Enseignant(e)') : t('Animateur pédagogique')}<br /><b>${who || ((ctx.teacher(state.session.teacherId) || {}).name || '')}</b></div><div>${t('Censeur / Vice-Principal')}</div><div>${t('Proviseur / Principal')}</div></div>
    <div class="annex"><div style="font-weight:800;font-size:12px;margin:0 0 6px">${tid ? t('Annexe : détail de mes heures') : t('Annexe : détail par enseignant')}</div>
      <table><thead><tr><th>${t('Enseignant')}</th><th>${t('H / semaine')}</th><th>${t('Dues')}</th><th>${t('Faites')}</th><th>${t('Écart')}</th><th>${t('Taux')}</th><th>${t('Leçons faites / attendues')}</th><th>${t('Dont révisions et évaluations (h)')}</th><th>${t('Absences déclarées (h)')}</th><th>${t('Retirées des heures dues (h)')}</th></tr></thead><tbody>
      ${teachers.map(x => { const s = stats(ctx, x.id, p.ps, p.pe); return html`<tr><td style="text-align:left">${x.name}</td><td>${num1(wk(x))}</td><td>${num1(s.due)}</td><td><b>${num1(s.hours)}</b></td><td>${sg(s.gap)}</td><td>${num1(s.rate)} %</td><td>${s.lessonsDone} / ${num1(s.lessonsPlanned)}</td><td>${num1(s.revisionH + s.assessH)}</td><td>${num1(s.absent)}</td><td>${num1(s.excused + s.closed)}</td></tr>`; })}</tbody></table>
      <p style="font-size:10px;margin:6px 0 0">${t('Heures dues : emplois du temps, hors jours fériés, vacances et activités scolaires, comptées jusqu’à aujourd’hui. Heures faites : séances saisies dans Rekort (révisions et évaluations comptent en heures mais pas en leçons). Leçons attendues : plan annuel de chaque classe réparti selon les heures de cours. Seuils d’alerte de l’arrêté conjoint du 14/08/2026 : {h} % (heures), {l} % (programme).', { h: THRESHOLDS.hours, l: THRESHOLDS.lessons })}</p></div></div>`;
}

const TERM_NAME = { T1: '1er trimestre', T2: '2e trimestre', T3: '3e trimestre' };
const TERM_END = { T1: 'Fin du 1er trimestre', T2: 'Fin du 2e trimestre', T3: 'Fin du 3e trimestre' };
function Follow({ ctx, p }) {
  const F = followUp(ctx, p.ps, p.pe), lang = getLang(), d = ctx.dept, hd = d.header || {};
  const live = p.kind === 'term' && TERM_END[p.term] && p.pe > ctx.today;   // trimestre en cours : on le dit
  const full = p.kind === 'term' && TERM_END[p.term] ? (live ? t(TERM_NAME[p.term]) + ' · ' + t('situation au {d}', { d: fmt(ctx.today, lang) }) : t(TERM_END[p.term])) : t('Du {a} au {b}', { a: fmt(p.ps, lang), b: fmt(p.pe, lang) });
  const P = (v) => num1(v);
  const tail = (r) => html`<td>${r.eff || ''}</td><td>${r.ev}</td><td>${P(r.rateEv)}</td><td>${r.ok}</td><td>${P(r.rateOk)}</td>`;
  const body = (r) => html`<td>${P(r.planL)}</td><td>${P(r.doneL)}</td><td><b>${P(r.rateL)}</b></td><td>${r.planPr}</td><td>${r.pr}</td><td>${P(r.ratePr)}</td><td>${r.planPr}</td><td>${r.digital}</td><td>${P(r.rateDg)}</td>
    <td>${P(r.planH)}</td><td>${P(r.doneH)}</td><td><b>${P(r.rateH)}</b></td>${tail(r)}`;
  const line = (r) => html`<tr><td style="text-align:left">${r.name}</td><td>${up(d.abbr || d.discipline).slice(0, 4)}</td><td style="text-align:left">${r.teachers.join(', ')}</td>${body(r)}</tr>`;
  const tot = (label, r, strong) => html`<tr style=${'font-weight:800;background:' + (strong ? '#F3ECDD' : '#EEF6F4')}><td colspan="3" style="text-align:left">${label}</td>${body(r)}</tr>`;
  const cyc = (label, list, T) => list.length ? html`${list.map(line)}${tot(t('Total {c}', { c: label }), T, false)}` : null;
  return html`${F.over.length ? html`<div class="notice no-print"><${Icon} n="alert" size="18" /><span>${t('Plafonné à 100 % (saisi au-delà du prévu) : {l}. Vérifiez ces classes dans l’historique et dans « Heures hors application ».', { l: F.over.map(r => r.name + ' (' + (r.rawL > r.planL + 0.05 ? num1(r.rawL) + ' / ' + num1(r.planL) + ' ' + t('leçons') : '') + (r.rawL > r.planL + 0.05 && r.rawH > r.planH + 0.05 ? ', ' : '') + (r.rawH > r.planH + 0.05 ? num1(r.rawH) + ' / ' + num1(r.planH) + ' h' : '') + ')').join(' ; ') })}</span></div>` : null}
  <div class="paper wide">
    <${Letterhead} d=${d} hd=${hd} />
    <h2>${t('Fiche pédagogique de suivi')}</h2><div style="text-align:center;font-size:11px;margin-bottom:2px"><b>${full}</b> · ${t('Année scolaire')} ${d.year || ''}</div>
    <div style="display:flex;justify-content:space-between;font-size:11px;margin:6px 0 8px"><span>${t('Établissement')} : <b>${up(d.name)}</b></span><span>${t('Discipline')} : <b>${up(d.discipline)}</b></span></div>
    <table class="follow"><thead><tr><th rowspan="2">${t('Classe')}</th><th rowspan="2">${t('Matière')}</th><th rowspan="2">${t('Enseignant(s)')}</th><th colspan="3">${t('Leçons')}</th><th colspan="3">${t('Travaux pratiques')}</th><th colspan="3">${t('Digitalisation')}</th><th colspan="3">${t('Heures')}</th><th>${t('Effectif')}</th><th>${t('Évalués')}</th><th>${t('% évalués')}</th><th>${t('Moyenne ≥ 10')}</th><th>${t('Taux de réussite (%)')}</th></tr>
      <tr><th>${t('Prév.')}</th><th>${t('Faites')}</th><th>%</th><th>${t('Prév.')}</th><th>${t('Faits')}</th><th>%</th><th>${t('Prév.')}</th><th>${t('Faits')}</th><th>%</th><th>${t('Prév.')}</th><th>${t('Faites')}</th><th>%</th><th>EFF</th><th>EVAL</th><th>%EVAL</th><th>≥10</th><th>%</th></tr></thead>
      <tbody>${F.n ? html`${cyc(t('1er cycle'), F.g1, F.t1)}${cyc(t('2nd cycle'), F.g2, F.t2)}${tot(t('TOTAL GÉNÉRAL'), F.total, true)}` : html`<tr><td colspan="20">${t('Aucune classe')}</td></tr>`}</tbody></table>
    <p style="font-size:9px;margin:6px 0 0">${t('Prév. = prévu pour la période (leçons du programme réparties selon les heures de cours ; heures dues d’après les emplois du temps). Faites = ce qui est réalisé, jamais au-delà du prévu. % = Faites ÷ Prév. Le total annuel est la somme des trimestres. Travaux pratiques et digitalisation : cumul depuis la rentrée face au prévu de l’année. Évalués et réussite : dernière évaluation saisie dans la période pour la classe.')}</p>
    <div class="sig"><div>${t('Animateur pédagogique')}<br /><b>${((ctx.teacher(state.session.teacherId) || {}).name || '')}</b></div><div>${t('Censeur / Vice-Principal')}</div><div>${t('Proviseur / Principal')}</div></div></div>`;
}

/** Aperçu : la fiche (format A4) est réduite pour tenir dans la largeur du téléphone, sans toucher à l'impression. */
function fitPaper() {
  const box = document.querySelector('.paper-fit'), paper = box && box.querySelector('.paper'); if (!paper) return;
  paper.style.zoom = ''; const w = paper.scrollWidth, avail = box.clientWidth;
  if (w > avail + 2) paper.style.zoom = String(Math.max(0.3, avail / w));
}

/** Évaluations et assiduité par classe sur la période : seuils de l'arrêté (réussite 40 %, assiduité 75 %). */
function Evals({ ctx, p, tid }) {
  const lang = getLang(), d = ctx.dept, hd = d.header || {}, P = (v) => (v == null ? '—' : num1(v) + ' %');
  const es = ctx.entries.filter(e => e.type !== 'absence' && e.date >= p.ps && e.date <= p.pe && (!tid || e.teacherId === tid));
  const rows = ctx.classes.map(c => {
    const mine = es.filter(e => e.classId === c.id), evs = mine.filter(e => e.eval && +e.eval.evaluated > 0), pres = mine.filter(e => e.present != null && e.present !== '');
    const ev = evs.reduce((s, e) => s + +e.eval.evaluated, 0), ok = evs.reduce((s, e) => s + +e.eval.passed, 0), eff = +(c.effectif || {}).total || 0;
    const att = pres.length && eff ? pres.reduce((s, e) => s + Math.min(eff, +e.present), 0) / (pres.length * eff) * 100 : null;
    return { c, n: evs.length, ev, ok, rate: ev ? ok / ev * 100 : null, last: evs.map(e => e.date).sort().pop(), eff, nPres: pres.length, att };
  }).filter(r => r.n || r.nPres);
  const bad = (v, s) => v != null && v < s;
  return html`<div class="paper">
    <${Letterhead} d=${d} hd=${hd} />
    <h2>${t('Évaluations et assiduité des élèves')}</h2><div style="text-align:center;font-size:11px;margin-bottom:8px">${t('Du {a} au {b}', { a: fmt(p.ps, lang), b: fmt(p.pe, lang) })} · ${t('Année scolaire')} ${d.year || ''}</div>
    <table><thead><tr><th>${t('Classe')}</th><th>${t('Évaluations')}</th><th>${t('Élèves évalués')}</th><th>${t('Moyenne ≥ 10')}</th><th>${t('Taux de réussite')}</th><th>${t('Effectif')}</th><th>${t('Cours avec présences')}</th><th>${t('Taux d’assiduité')}</th></tr></thead>
      <tbody>${rows.length ? rows.map(r => html`<tr><td style="text-align:left">${r.c.name}</td><td>${r.n}</td><td>${r.ev}</td><td>${r.ok}</td><td style=${bad(r.rate, 40) ? 'color:#C0472A;font-weight:800' : ''}>${P(r.rate)}</td><td>${r.eff || ''}</td><td>${r.nPres}</td><td style=${bad(r.att, 75) ? 'color:#C0472A;font-weight:800' : ''}>${P(r.att)}</td></tr>`)
        : html`<tr><td colspan="8">${t('Aucune évaluation ni présence saisie sur la période. Pour les ajouter : à la saisie d’un cours, « Élèves présents » et « Il y a eu une évaluation ».')}</td></tr>`}</tbody></table>
    <p style="font-size:9px;margin:6px 0 0">${t('Seuils de l’arrêté conjoint du 14/08/2026 : réussite sous 40 % → remédiation obligatoire ; assiduité sous 75 % → mesures à notifier. En rouge : sous le seuil.')}</p>
    ${rows.some(r => bad(r.rate, 40) || bad(r.att, 75)) ? html`<p style="font-size:10px;margin:6px 0 0"><b>${t('Classes à suivre')} :</b> ${rows.filter(r => bad(r.rate, 40) || bad(r.att, 75)).map(r => r.c.name + (bad(r.rate, 40) ? ' (' + t('réussite') + ' ' + P(r.rate) + ')' : '') + (bad(r.att, 75) ? ' (' + t('assiduité') + ' ' + P(r.att) + ')' : '')).join(' ; ')}</p>` : null}
    <div class="sig"><div>${t('Animateur pédagogique')}<br /><b>${((ctx.teacher(state.session.teacherId) || {}).name || '')}</b></div><div>${t('Censeur / Vice-Principal')}</div><div>${t('Proviseur / Principal')}</div></div></div>`;
}

/** Bilan d'une page pour le censeur : situation du département, collègues, classes en retard, mesures. */
function Bilan({ ctx, p, S, facts, acts }) {
  const lang = getLang(), d = ctx.dept, hd = d.header || {};
  const per = ctx.teachers.map(tc => ({ tc, S: stats(ctx, tc.id, p.ps, p.pe) }));
  const lateCls = ctx.teachers.flatMap(tc => classProgress(ctx, tc.id, minISO(p.pe, ctx.today)).filter(r => r.status === 'late' || r.status === 'slight').map(r => ({ ...r, who: tc.short || tc.name })));
  return html`<div class="paper">
    <${Letterhead} d=${d} hd=${hd} />
    <h2>${t('Bilan du département')}</h2><div style="text-align:center;font-size:11px;margin-bottom:8px">${t('Du {a} au {b}', { a: fmt(p.ps, lang), b: fmt(p.pe, lang) })} · ${up(d.discipline)} · ${t('Année scolaire')} ${d.year || ''}</div>
    <table><thead><tr><th>${t('Indicateur')}</th><th>${t('Fait')}</th><th>${t('Dû à ce jour')}</th><th>%</th><th>${t('Seuil')}</th></tr></thead><tbody>
      <tr><td style="text-align:left">${t('Couverture horaire')}</td><td>${num1(S.hours)} h</td><td>${num1(S.due)} h</td><td>${num1(S.rate)} %</td><td>80 %</td></tr>
      <tr><td style="text-align:left">${t('Couverture du programme (leçons)')}</td><td>${S.lessonsDone}</td><td>${num1(S.lessonsPlanned)}</td><td>${num1(S.rateL)} %</td><td>70 %</td></tr></tbody></table>
    <h3 style="font-size:11px;margin:10px 0 4px">${t('Par enseignant')}</h3>
    <table><thead><tr><th>${t('Enseignant')}</th><th>${t('Heures faites / dues')}</th><th>%</th><th>${t('Leçons faites / attendues')}</th><th>%</th></tr></thead><tbody>
      ${per.map(({ tc, S: x }) => html`<tr><td style="text-align:left">${tc.name}</td><td>${num1(x.hours)} / ${num1(x.due)}</td><td style=${x.due && x.rate < 80 ? 'color:#C0472A;font-weight:800' : ''}>${num1(x.rate)} %</td><td>${x.lessonsDone} / ${num1(x.lessonsPlanned)}</td><td style=${x.lessonsPlanned && x.rateL < 70 ? 'color:#C0472A;font-weight:800' : ''}>${num1(x.rateL)} %</td></tr>`)}</tbody></table>
    <h3 style="font-size:11px;margin:10px 0 4px">${t('Classes en retard sur le programme')}</h3>
    <p style="font-size:10px;margin:0">${lateCls.length ? lateCls.map(r => r.name + ' (' + r.who + ', ' + t('{n} leçon(s) de retard', { n: num1(r.lag) }) + ')').join(' ; ') : t('Aucune.')}</p>
    <h3 style="font-size:11px;margin:10px 0 4px">${t('Facteurs d’écart')}</h3><p style="font-size:10px;margin:0;white-space:pre-line">${facts}</p>
    <h3 style="font-size:11px;margin:10px 0 4px">${t('Mesures proposées')}</h3><p style="font-size:10px;margin:0;white-space:pre-line">${acts}</p>
    <div class="sig"><div>${t('Animateur pédagogique')}<br /><b>${((ctx.teacher(state.session.teacherId) || {}).name || '')}</b></div><div>${t('Censeur / Vice-Principal')}</div><div>${t('Proviseur / Principal')}</div></div></div>`;
}

export function Report() {
  useEffect(() => { fitPaper(); const f = () => fitPaper(); addEventListener('resize', f); return () => removeEventListener('resize', f); });
  const ctx = makeCtx(viewData()), ap = isAP(), tid = currentTid();
  const [tab, setTab] = useState('sheet'), [edit, setEdit] = useState({ ft: null, ac: null });
  const p = state.ui.rperiod && state.ui.rperiod.ps ? state.ui.rperiod : { kind: 'custom', ps: ctx.ys, pe: minISO(ctx.today, ctx.ye) };
  const S = stats(ctx, tid, p.ps, p.pe), Y = stats(ctx, tid, ctx.ys, p.pe);
  const who = tid ? (ctx.teacher(tid) || {}).name : '';
  const facts = edit.ft != null ? edit.ft : factorTexts(ctx, S), acts = edit.ac != null ? edit.ac : actionTexts(S);
  return html`<div class="page"><div class="page-h noprint"><h1>${({ sheet: t('Fiche d’inspection'), recap: t('Fiche pédagogique'), bilan: t('Bilan du département'), evals: t('Évaluations et assiduité') })[tab]}</h1></div>
    <div class="export-bar noprint"><button class="btn accent" onClick=${() => window.print()}><${Icon} n="print" />${t('Imprimer PDF')}</button><button class="btn" onClick=${() => exportWord(document.querySelector('.paper'), 'rekort-' + ({ sheet: 'fiche-inspection', recap: 'fiche-pedagogique', bilan: 'bilan', evals: 'evaluations' }[tab] || 'fiche') + '-' + ctx.today)}><${Icon} n="download" />${t('Imprimer Word')}</button></div>
    <div class="noprint stack"><${YearBar} /><${ScopeBar} ctx=${ctx} />${ap && !ctx.assign.some(x => (+x.th || 0) + (+x.pr || 0) > 0) ? html`<a class="notice" href="#/settings/classes"><${Icon} n="alert" size="18" /><span>${t('Les leçons et heures prévues pour l’année ne sont pas encore renseignées : la colonne « prévues » de la fiche affiche 0. Touchez ici pour les saisir, classe par classe.')}</span></a>` : null}<div class="scope-big sm"><${Seg} full options=${[{ id: 'sheet', label: '📋 ' + t('Inspection') }, ...(ap ? [{ id: 'recap', label: '🏫 ' + t('Censorat') }, { id: 'bilan', label: '📝 ' + t('Bilan') }] : []), { id: 'evals', label: '🎯 ' + t('Évaluations') }]} value=${tab} onChange=${setTab} /></div>
      <div class="card"><div class="card-h"><h3>${t('Période demandée par l’inspecteur')}</h3></div><${PeriodBar} ctx=${ctx} period=${p} onChange=${(np) => { setUI({ rperiod: np }); setEdit({ ft: null, ac: null }); }} />
        <div class="row" style="margin-top:10px"><button class="btn soft sm" onClick=${() => setUI({ rperiod: { kind: 'custom', ps: ctx.ys, pe: minISO(ctx.today, ctx.ye) } })}>${t('De la rentrée à aujourd’hui')}</button></div></div>
      ${S.alerts.length ? html`<div class="err">${S.alerts.map(a => a.kind === 'hours' ? t('Couverture horaire sous 80 % : mesures correctives obligatoires.') : a.kind === 'lessons' ? t('Couverture du programme sous 70 % : plan de remédiation.') : t('Taux de réussite sous 40 %.')).join(' ')}</div>` : null}
      ${tab === 'sheet' ? html`<div class="card"><div class="card-h"><h3>${t('Commentaires de la fiche')}</h3><button class="btn soft sm" onClick=${() => setEdit({ ft: null, ac: null })}><${Icon} n="refresh" />${t('Régénérer')}</button></div>
        <div class="grid2"><div class="field"><label>${t('Facteurs d’écart')}</label><textarea class="input" rows="5" value=${facts} onInput=${(e) => setEdit({ ...edit, ft: e.target.value })}></textarea></div><div class="field"><label>${t('Actions correctives')}</label><textarea class="input" rows="5" value=${acts} onInput=${(e) => setEdit({ ...edit, ac: e.target.value })}></textarea></div></div><p class="hint" style="margin-top:8px">${t('Texte proposé automatiquement ; vous pouvez le modifier avant d’imprimer.')}</p></div>` : null}</div>
    <p class="sub noprint" style="text-align:center">${t('Aperçu de la fiche, réduit à la largeur de l’écran (l’impression et Word gardent la taille réelle).')}</p>
    <div class="paper-fit">${tab === 'sheet' ? html`<${Sheet} ctx=${ctx} tid=${tid} S=${S} Y=${Y} p=${p} who=${who} facts=${facts} acts=${acts} />` : tab === 'bilan' ? html`<${Bilan} ctx=${ctx} p=${p} S=${stats(ctx, null, p.ps, p.pe)} facts=${facts} acts=${acts} />` : tab === 'evals' ? html`<${Evals} ctx=${ctx} p=${p} tid=${tid} />` : html`<${Follow} ctx=${ctx} p=${p} />`}</div></div>`;
}
