// Fiche de l'inspection nationale (colonnes officielles) et récapitulatif par classe, sur les dates choisies.
import { html, useState } from '../vendor/preact-htm.js';
import { t, getLang } from '../i18n.js';
import { Icon } from '../icons.js';
import { Seg, Chip, num1 } from '../ui.js';
import { makeCtx, stats, factors, followUp, periodOf } from '../calc.js';
import { PeriodBar, ScopeBar, currentTid, periodLabel } from '../widgets.js';
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
      <td>${num1(S.due)}</td><td>${num1(S.hours)}</td><td>${sg(S.gap)}</td><td>${num1(S.rate)} %</td><td>${num1(S.rateYH)} %</td>
      <td>${Math.round(S.lessonsPlanned)}</td><td>${S.lessonsDone}</td><td>${sg(Math.round(S.lessonGap))}</td><td>${num1(S.rateL)} %</td><td>${num1(S.rateYL)} %</td>
      <td class="l">${facts}</td><td class="l">${acts}</td></tr></tbody></table>
    <p style="font-size:10px;margin:6px 0 0"><b>${t('Situation cumulée depuis la rentrée')} (${fmt(ctx.ys, lang, { noYear: ctx.ys.slice(0, 4) === Y.pe.slice(0, 4) })} ${t('au')} ${fmt(Y.pe, lang)}) : </b>${num1(Y.hours)} h ${t('faites sur')} ${num1(Y.due)} h ${t('dues')} (${num1(Y.rate)} %) · ${t('soit')} ${num1(Y.rateYH)} % ${t('des')} ${num1(Y.planYear.hours)} h ${t('prévues sur l’année')} · ${Y.lessonsDone} / ${Math.round(Y.lessonsPlanned)} ${t('leçons')}.</p>
    <div class="sig"><div>${tid ? t('Enseignant(e)') : t('Animateur pédagogique')}<br /><b>${who || ((ctx.teacher(state.session.teacherId) || {}).name || '')}</b></div><div>${t('Censeur / Vice-Principal')}</div><div>${t('Proviseur / Principal')}</div></div>
    <div class="annex"><div style="font-weight:800;font-size:12px;margin:0 0 6px">${tid ? t('Annexe : détail de mes heures') : t('Annexe : détail par enseignant')}</div>
      <table><thead><tr><th>${t('Enseignant')}</th><th>${t('H / semaine')}</th><th>${t('Dues')}</th><th>${t('Faites')}</th><th>${t('Écart')}</th><th>${t('Taux')}</th><th>${t('Leçons faites / attendues')}</th><th>${t('Dont révisions et évaluations (h)')}</th><th>${t('Absences déclarées (h)')}</th><th>${t('Retirées des heures dues (h)')}</th></tr></thead><tbody>
      ${teachers.map(x => { const s = stats(ctx, x.id, p.ps, p.pe); return html`<tr><td style="text-align:left">${x.name}</td><td>${num1(wk(x))}</td><td>${num1(s.due)}</td><td><b>${num1(s.hours)}</b></td><td>${sg(s.gap)}</td><td>${num1(s.rate)} %</td><td>${s.lessonsDone} / ${num1(s.lessonsPlanned)}</td><td>${num1(s.revisionH + s.assessH)}</td><td>${num1(s.absent)}</td><td>${num1(s.excused + s.closed)}</td></tr>`; })}</tbody></table>
      <p style="font-size:10px;margin:6px 0 0">${t('Heures dues : emplois du temps, hors jours fériés, vacances et activités scolaires, comptées jusqu’à aujourd’hui. Heures faites : séances saisies dans Rekort (révisions et évaluations comptent en heures mais pas en leçons). Leçons attendues : plan annuel de chaque classe réparti selon les heures de cours. Seuils d’alerte de l’arrêté conjoint du 14/08/2026 : {h} % (heures), {l} % (programme).', { h: THRESHOLDS.hours, l: THRESHOLDS.lessons })}</p></div></div>`;
}

const TERM_END = { T1: 'Fin du 1er trimestre', T2: 'Fin du 2e trimestre', T3: 'Fin du 3e trimestre' };
function Follow({ ctx, p }) {
  const F = followUp(ctx, p.ps, p.pe), lang = getLang(), d = ctx.dept, hd = d.header || {};
  const full = p.kind === 'term' && TERM_END[p.term] ? t(TERM_END[p.term]) : t('Du {a} au {b}', { a: fmt(p.ps, lang), b: fmt(p.pe, lang) });
  const P = (v) => num1(v);
  const tail = (r) => html`<td>${r.eff || ''}</td><td>${r.ev}</td><td>${P(r.rateEv)}</td><td>${r.ok}</td><td>${P(r.rateOk)}</td>`;
  const body = (r, label) => html`<td>${r.planTh}</td><td>${r.th}</td><td>${r.planPr}</td><td>${r.pr}</td><td>${P(r.ratePr)}</td><td>${r.planPr}</td><td>${r.digital}</td><td>${P(r.rateDg)}</td><td>${P(r.rateTh)}</td>
    <td>${r.objH}<br /><span style="font-size:8px;color:#666">(${r.objTh} h Th + ${r.objPr} h Pr)</span></td><td>${P(r.hours)}</td><td>${P(r.rateH)}</td>${tail(r)}`;
  const line = (r) => html`<tr><td style="text-align:left">${r.name}</td><td>${up(d.abbr || d.discipline).slice(0, 4)}</td><td style="text-align:left">${r.teachers.join(', ')}</td>${body(r)}</tr>`;
  const tot = (label, r, strong) => html`<tr style=${'font-weight:800;background:' + (strong ? '#F3ECDD' : '#EEF6F4')}><td colspan="3" style="text-align:left">${label}</td>${body(r)}</tr>`;
  const cyc = (label, list, T) => list.length ? html`${list.map(line)}${tot(t('Total {c}', { c: label }), T, false)}` : null;
  return html`<div class="paper wide">
    <${Letterhead} d=${d} hd=${hd} />
    <h2>${t('Fiche pédagogique de suivi')}</h2><div style="text-align:center;font-size:11px;margin-bottom:2px"><b>${full}</b> · ${t('Année scolaire')} ${d.year || ''}</div>
    <div style="display:flex;justify-content:space-between;font-size:11px;margin:6px 0 8px"><span>${t('Établissement')} : <b>${up(d.name)}</b></span><span>${t('Discipline')} : <b>${up(d.discipline)}</b></span></div>
    <table class="follow"><thead><tr><th rowspan="2">${t('Classe')}</th><th rowspan="2">${t('Matière')}</th><th rowspan="2">${t('Enseignant(s)')}</th><th>${t('Leçons prévues pour l’année')}</th><th>${t('Leçons faites')}</th><th colspan="3">${t('Travaux pratiques')}</th><th colspan="3">${t('Digitalisation')}</th><th>${t('% leçons couvertes / année')}</th><th>${t('Heures dues pour l’année')}</th><th>${t('Heures faites')}</th><th>${t('% heures couvertes')}</th><th>${t('Effectif')}</th><th>${t('Évalués')}</th><th>${t('% évalués')}</th><th>${t('Moyenne ≥ 10')}</th><th>${t('Taux de réussite (%)')}</th></tr>
      <tr><th>OBJ</th><th>${t('Faites')}</th><th>${t('Prév.')}</th><th>${t('Faits')}</th><th>%</th><th>${t('Prév.')}</th><th>${t('Faits')}</th><th>%</th><th>%</th><th>OBJ</th><th>${t('Faites')}</th><th>%</th><th>EFF</th><th>EVAL</th><th>%EVAL</th><th>≥10</th><th>%</th></tr></thead>
      <tbody>${F.n ? html`${cyc(t('1er cycle'), F.g1, F.t1)}${cyc(t('2nd cycle'), F.g2, F.t2)}${tot(t('TOTAL GÉNÉRAL'), F.total, true)}` : html`<tr><td colspan="20">${t('Aucune classe')}</td></tr>`}</tbody></table>
    <p style="font-size:9px;margin:6px 0 0">${t('Heures dues pour l’année : total fixé par l’animateur pour la classe (à défaut, heures des emplois du temps sur l’année). Évalués et réussite : dernière évaluation saisie dans la période pour la classe.')}</p>
    <div class="sig"><div>${t('Animateur pédagogique')}<br /><b>${((ctx.teacher(state.session.teacherId) || {}).name || '')}</b></div><div>${t('Censeur / Vice-Principal')}</div><div>${t('Proviseur / Principal')}</div></div></div>`;
}

export function Report() {
  const ctx = makeCtx(state.data), ap = isAP(), tid = currentTid();
  const [tab, setTab] = useState('sheet'), [edit, setEdit] = useState({ ft: null, ac: null });
  const p = state.ui.rperiod && state.ui.rperiod.ps ? state.ui.rperiod : { kind: 'custom', ps: ctx.ys, pe: minISO(ctx.today, ctx.ye) };
  const S = stats(ctx, tid, p.ps, p.pe), Y = stats(ctx, tid, ctx.ys, p.pe);
  const who = tid ? (ctx.teacher(tid) || {}).name : '';
  const facts = edit.ft != null ? edit.ft : factorTexts(ctx, S), acts = edit.ac != null ? edit.ac : actionTexts(S);
  return html`<div class="page"><div class="page-h noprint"><h1>${t('Fiche d’inspection')}</h1><div class="row"><button class="btn soft" onClick=${() => exportWord(document.querySelector('.paper'), 'rekort-' + (tab === 'sheet' ? 'fiche-inspection' : 'fiche-pedagogique') + '-' + ctx.today)}><${Icon} n="download" />${t('Word')}</button><button class="btn accent" onClick=${() => window.print()}><${Icon} n="print" />${t('Imprimer / PDF')}</button></div></div>
    <div class="noprint stack"><${ScopeBar} ctx=${ctx} /><${Seg} options=${[{ id: 'sheet', label: t('Fiche de l’inspection') }, ...(ap ? [{ id: 'recap', label: t('Fiche pédagogique (censorat)') }] : [])]} value=${tab} onChange=${setTab} />
      <div class="card"><div class="card-h"><h3>${t('Période demandée par l’inspecteur')}</h3></div><${PeriodBar} ctx=${ctx} period=${p} onChange=${(np) => { setUI({ rperiod: np }); setEdit({ ft: null, ac: null }); }} />
        <div class="row" style="margin-top:10px"><button class="btn soft sm" onClick=${() => setUI({ rperiod: { kind: 'custom', ps: ctx.ys, pe: minISO(ctx.today, ctx.ye) } })}>${t('De la rentrée à aujourd’hui')}</button></div></div>
      ${S.alerts.length ? html`<div class="err">${S.alerts.map(a => a.kind === 'hours' ? t('Couverture horaire sous 80 % : mesures correctives obligatoires.') : a.kind === 'lessons' ? t('Couverture du programme sous 70 % : plan de remédiation.') : t('Taux de réussite sous 40 %.')).join(' ')}</div>` : null}
      ${tab === 'sheet' ? html`<div class="card"><div class="card-h"><h3>${t('Commentaires de la fiche')}</h3><button class="btn soft sm" onClick=${() => setEdit({ ft: null, ac: null })}><${Icon} n="refresh" />${t('Régénérer')}</button></div>
        <div class="grid2"><div class="field"><label>${t('Facteurs d’écart')}</label><textarea class="input" rows="5" value=${facts} onInput=${(e) => setEdit({ ...edit, ft: e.target.value })}></textarea></div><div class="field"><label>${t('Actions correctives')}</label><textarea class="input" rows="5" value=${acts} onInput=${(e) => setEdit({ ...edit, ac: e.target.value })}></textarea></div></div><p class="hint" style="margin-top:8px">${t('Texte proposé automatiquement ; vous pouvez le modifier avant d’imprimer.')}</p></div>` : null}</div>
    ${tab === 'sheet' ? html`<${Sheet} ctx=${ctx} tid=${tid} S=${S} Y=${Y} p=${p} who=${who} facts=${facts} acts=${acts} />` : html`<${Follow} ctx=${ctx} p=${p} />`}</div>`;
}
