// Fiche de l'inspection nationale (colonnes officielles) et récapitulatif par classe, sur les dates choisies.
import { html, useState } from '../vendor/preact-htm.js';
import { t, getLang } from '../i18n.js';
import { Icon } from '../icons.js';
import { Seg, Chip, num1 } from '../ui.js';
import { makeCtx, stats, factors, recap, periodOf } from '../calc.js';
import { PeriodBar, ScopeBar, currentTid, periodLabel } from '../widgets.js';
import { state, setUI, isAP, myId } from '../store.js';
import { fmt, minISO } from '../dates.js';
import { reasonOf, THRESHOLDS } from '../consts.js';

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
  out.push(t('Saisie régulière de tous les enseignants dans EasyProf ; contrôle par l’animateur pédagogique chaque vendredi.'));
  return out.join('\n');
}
const sg = (n) => html`<span class=${n < 0 ? 'neg' : n > 0 ? 'pos' : ''}>${(n > 0 ? '+' : '') + num1(n)}</span>`;

export function Sheet({ ctx, tid, S, Y, p, who, facts, acts }) {
  const lang = getLang(), d = ctx.dept, hd = d.header || {}, same = p.ps.slice(0, 4) === p.pe.slice(0, 4);
  const teachers = tid ? ctx.teachers.filter(x => x.id === tid) : ctx.teachers;
  const wk = (x) => (x.slots || []).reduce((s, y) => s + (+y.h || 0), 0);
  return html`<div class="paper">
    <div class="hd"><div><b>RÉPUBLIQUE DU CAMEROUN</b><br />Paix – Travail – Patrie<br />MINISTÈRE DES ENSEIGNEMENTS SECONDAIRES<br />${hd.region ? 'DÉLÉGATION RÉGIONALE ' + up(hd.region) : ''}<br />${hd.division ? 'DÉLÉGATION DÉPARTEMENTALE ' + up(hd.division) : ''}</div>
      <div style="align-self:center;font-weight:800;font-size:11px">${up(d.name)}</div>
      <div><b>REPUBLIC OF CAMEROON</b><br />Peace – Work – Fatherland<br />MINISTRY OF SECONDARY EDUCATION<br />${hd.region ? 'REGIONAL DELEGATION FOR ' + up(hd.region) : ''}<br />${hd.division ? 'DIVISIONAL DELEGATION FOR ' + up(hd.division) : ''}</div></div>
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
      <p style="font-size:10px;margin:6px 0 0">${t('Heures dues : emplois du temps, hors jours fériés, vacances et activités scolaires, comptées jusqu’à aujourd’hui. Heures faites : séances saisies dans EasyProf (révisions et évaluations comptent en heures mais pas en leçons). Leçons attendues : plan annuel de chaque classe réparti selon les heures de cours. Seuils d’alerte de l’arrêté conjoint du 14/08/2026 : {h} % (heures), {l} % (programme).', { h: THRESHOLDS.hours, l: THRESHOLDS.lessons })}</p></div></div>`;
}

function Recap({ ctx, p }) {
  const R = recap(ctx, p.ps, p.pe), lang = getLang();
  const row = (r, bold) => html`<tr style=${bold ? 'font-weight:800;background:#faf6ec' : ''}><td style="text-align:left">${r.name}</td><td>${r.effectif ? r.effectif.total || r.total || '' : r.total || ''}</td><td>${num1(r.planH)}</td><td>${num1(r.hours)}</td><td>${num1(r.rateH)} %</td><td>${r.planTh}</td><td>${r.th}</td><td>${num1(r.rateTh)} %</td><td>${r.planPr}</td><td>${r.pr}</td><td>${num1(r.ratePr)} %</td><td>${r.digital}</td></tr>`;
  const cyc = (label, list, tot) => list.length ? html`<tr><td colspan="12" style="text-align:left;background:#F3ECDD;font-weight:800">${label}</td></tr>${list.map(r => row(r))}${row({ ...tot, name: t('Total {c}', { c: label }), effectif: null }, true)}` : null;
  return html`<div class="paper"><h2>${t('Récapitulatif par classe')}</h2><div style="text-align:center;font-size:11px;margin-bottom:8px">${up(ctx.dept.name)} · ${up(ctx.dept.discipline)} · ${t('Du {a} au {b}', { a: fmt(p.ps, lang), b: fmt(p.pe, lang) })}</div>
    <table><thead><tr><th rowspan="2">${t('Classe')}</th><th rowspan="2">${t('Effectif')}</th><th colspan="3">${t('Heures')}</th><th colspan="3">${t('Leçons de théorie')}</th><th colspan="3">${t('Travaux pratiques')}</th><th rowspan="2">${t('Leçons digitalisées')}</th></tr>
      <tr><th>${t('Prévues')}</th><th>${t('Faites')}</th><th>%</th><th>${t('Prévues')}</th><th>${t('Faites')}</th><th>%</th><th>${t('Prévus')}</th><th>${t('Faits')}</th><th>%</th></tr></thead><tbody>
      ${R.rows.length ? html`${cyc(t('1er cycle'), R.g1, R.t1)}${cyc(t('2nd cycle'), R.g2, R.t2)}${row({ ...R.total, name: t('TOTAL GÉNÉRAL'), effectif: null }, true)}` : html`<tr><td colspan="12">${t('Aucune classe')}</td></tr>`}</tbody></table>
    <p style="font-size:10px;margin:6px 0 0">${t('Heures prévues : total annuel indiqué par l’animateur pour chaque enseignant dans la classe (à défaut, heures de l’emploi du temps à ce jour).')}</p></div>`;
}

export function Report() {
  const ctx = makeCtx(state.data), ap = isAP(), tid = currentTid();
  const [tab, setTab] = useState('sheet'), [edit, setEdit] = useState({ ft: null, ac: null });
  const p = state.ui.rperiod && state.ui.rperiod.ps ? state.ui.rperiod : { kind: 'custom', ps: ctx.ys, pe: minISO(ctx.today, ctx.ye) };
  const S = stats(ctx, tid, p.ps, p.pe), Y = stats(ctx, tid, ctx.ys, p.pe);
  const who = tid ? (ctx.teacher(tid) || {}).name : '';
  const facts = edit.ft != null ? edit.ft : factorTexts(ctx, S), acts = edit.ac != null ? edit.ac : actionTexts(S);
  return html`<div class="page"><div class="page-h noprint"><h1>${t('Fiche d’inspection')}</h1><button class="btn accent" onClick=${() => window.print()}><${Icon} n="print" />${t('Imprimer / PDF')}</button></div>
    <div class="noprint stack"><${ScopeBar} ctx=${ctx} /><${Seg} options=${[{ id: 'sheet', label: t('Fiche de l’inspection') }, { id: 'recap', label: t('Récapitulatif par classe') }]} value=${tab} onChange=${setTab} />
      <div class="card"><div class="card-h"><h3>${t('Période demandée par l’inspecteur')}</h3></div><${PeriodBar} ctx=${ctx} period=${p} onChange=${(np) => { setUI({ rperiod: np }); setEdit({ ft: null, ac: null }); }} />
        <div class="row" style="margin-top:10px"><button class="btn soft sm" onClick=${() => setUI({ rperiod: { kind: 'custom', ps: ctx.ys, pe: minISO(ctx.today, ctx.ye) } })}>${t('De la rentrée à aujourd’hui')}</button></div></div>
      ${S.alerts.length ? html`<div class="err">${S.alerts.map(a => a.kind === 'hours' ? t('Couverture horaire sous 80 % : mesures correctives obligatoires.') : a.kind === 'lessons' ? t('Couverture du programme sous 70 % : plan de remédiation.') : t('Taux de réussite sous 40 %.')).join(' ')}</div>` : null}
      ${tab === 'sheet' ? html`<div class="card"><div class="card-h"><h3>${t('Commentaires de la fiche')}</h3><button class="btn soft sm" onClick=${() => setEdit({ ft: null, ac: null })}><${Icon} n="refresh" />${t('Régénérer')}</button></div>
        <div class="grid2"><div class="field"><label>${t('Facteurs d’écart')}</label><textarea class="input" rows="5" value=${facts} onInput=${(e) => setEdit({ ...edit, ft: e.target.value })}></textarea></div><div class="field"><label>${t('Actions correctives')}</label><textarea class="input" rows="5" value=${acts} onInput=${(e) => setEdit({ ...edit, ac: e.target.value })}></textarea></div></div><p class="hint" style="margin-top:8px">${t('Texte proposé automatiquement ; vous pouvez le modifier avant d’imprimer.')}</p></div>` : null}</div>
    ${tab === 'sheet' ? html`<${Sheet} ctx=${ctx} tid=${tid} S=${S} Y=${Y} p=${p} who=${who} facts=${facts} acts=${acts} />` : html`<${Recap} ctx=${ctx} p=${p} />`}</div>`;
}
