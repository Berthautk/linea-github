// « Saisir un cours » : une seule page qui se lit de haut en bas, avec des questions numérotées.
// 1 Quelle classe ? 2 Quel jour, combien de périodes ? 3 Qu'avez-vous fait ? 4 Quelle leçon / quelle séquence ? 5 Leçon terminée ?
// Plusieurs activités possibles dans un même cours (leçon + évaluation…). Chaque activité devient une séance enregistrée.
import { html, useState } from '../vendor/preact-htm.js';
import { t, getLang } from '../i18n.js';
import { Icon } from '../icons.js';
import { Modal, closeModal, openModal, num1, confirmDialog } from '../ui.js';
import { todaySlots, checkEntry, nextNumber } from '../calc.js';
import { state, myId, setToast, isAP } from '../store.js';
import { saveEntry, deleteEntry, restoreEntry } from '../actions.js';
import { openAbsence } from '../widgets.js';
import { isLessonType } from '../consts.js';
import { addDays, fmt, endFor } from '../dates.js';
import { planOf, suggestLesson, doneOf, seqResults, evalWeekOf, titleOf } from '../progress.js';

const ACTS = [['lesson', '📖', 'Leçon'], ['practical', '🧭', 'Travaux pratiques'], ['assessment', '📝', 'Évaluation'], ['correction', '🩹', 'Remédiation'], ['revision', '🧩', 'Intégration partielle des ressources'], ['other', '⋯', 'Autre']];
const OTHER = [['further', '🔎', 'Further study / travail dirigé'], ['orientation', '🤝', 'Première rencontre / orientation']];
const RESOURCES = ['Carte projetée', 'Vidéo', 'Diaporama', 'Tableau interactif', 'Smartphone', 'Salle multimédia'];
const Q = ({ n, children }) => html`<div class="q"><i>${n}</i><span>${children}</span></div>`;

/** Tableau filles / garçons / total pour une évaluation (2 lignes) ou une remédiation (3 lignes). */
function ResTable({ res, rows, onChange }) {
  const lab = { c: t('Élèves de la classe'), p: t('Ont composé'), r: t('Ont réussi (≥ 10)') };
  const cell = (k) => html`<td><input class="input num" type="number" min="0" inputmode="numeric" value=${res[k] == null ? '' : res[k]} onInput=${(e) => onChange({ ...res, [k]: e.target.value === '' ? '' : +e.target.value })} /></td>`;
  return html`<table class="restab"><thead><tr><th></th><th>${t('Filles')}</th><th>${t('Garçons')}</th><th>${t('Total')}</th></tr></thead><tbody>
    ${rows.map(r => html`<tr><th>${lab[r]}</th>${cell(r + 'f')}${cell(r + 'g')}<td><b>${(+res[r + 'f'] || 0) + (+res[r + 'g'] || 0)}</b></td></tr>`)}</tbody></table>`;
}
const pc = (a, b) => (b ? num1(a / b * 100) + ' %' : '—');

/** Une activité à l'intérieur du cours. */
function Activity({ ctx, tid, classId, date, act, set, idx, many, total, onRemove }) {
  const lang = getLang(), a = ctx.assign.find(x => x.teacherId === tid && x.classId === classId), cls = ctx.cls(classId);
  const plan = planOf(ctx, a, cls), kind = act.type === 'practical' ? 'p' : act.type === 'further' ? 'f' : 'l';
  const [pick, setPick] = useState(false), d = doneOf(ctx, tid, classId);
  const items = plan.filter(x => x.k === kind);
  const title = act.n != null ? titleOf(ctx, a, cls, kind, act.n) : '';
  const isOther = OTHER.some(o => o[0] === act.type);
  const res = act.res || {}, isEval = act.type === 'assessment', isRem = act.type === 'correction';
  return html`<div class=${'act-card' + (many ? ' many' : '')}>
    ${many ? html`<div class="row" style="flex-wrap:nowrap"><b class="grow">${t('Activité {n}', { n: idx + 1 })}</b>${idx > 0 ? html`<button type="button" class="icon-btn" onClick=${onRemove} aria-label=${t('Retirer')}><${Icon} n="trash" /></button>` : null}</div>` : null}
    <${Q} n=${3}>${t('Qu’avez-vous fait ?')}<//>
    <div class="tiles">${ACTS.map(([id, ic, fr]) => { const on = act.type === id || (id === 'other' && isOther); return html`<button type="button" class=${on ? 'on' : ''} aria-pressed=${on} onClick=${() => set(id === 'other' ? { type: 'further' } : { type: id })}><span>${ic}</span>${t(fr)}</button>`; })}</div>
    ${isOther ? html`<div class="chips">${OTHER.map(([id, ic, fr]) => html`<button type="button" class=${act.type === id ? 'on' : ''} onClick=${() => set({ type: id })}>${ic} ${t(fr)}</button>`)}</div>` : null}
    ${act.type === 'revision' ? html`<p class="hint">${t('Intégration partielle des ressources : les heures comptent, aucune leçon n’est comptée. Vous pouvez noter les leçons concernées ci-dessous.')}</p><input class="input" placeholder=${t('Ex. leçons 5 à 8')} value=${act.title || ''} onInput=${(e) => set({ title: e.target.value })} />` : null}
    ${act.type === 'orientation' ? html`<p class="hint">${t('Premier cours avec la classe : les heures comptent, aucune leçon n’est comptée.')}</p>` : null}

    ${isLessonType(act.type) ? html`<${Q} n=${4}>${act.type === 'practical' ? t('Quel TP ?') : act.type === 'further' ? t('Quel further study ?') : t('Quelle leçon ?')}<//>
      <div class="lessonbox"><b>${act.type === 'practical' ? t('TP') : act.type === 'further' ? 'FS' : t('Leçon')} ${act.n != null ? act.n : '?'}${title ? ' · ' + title : ''}</b>
        <small>${[act.type === 'lesson' && d.inProgress === act.n && d.first[act.n] ? t('En cours · commencée le {d}', { d: fmt(d.first[act.n], lang, { noYear: true }) }) : '', (items.find(x => x.n === act.n) || {}).date ? t('prévue le {d}', { d: fmt(items.find(x => x.n === act.n).date, lang, { noYear: true }) }) : ''].filter(Boolean).join(' · ')}</small>
        ${pick ? html`<div class="picklist">${items.length ? items.map(x => html`<button type="button" class=${x.n === act.n ? 'on' : ''} onClick=${() => { set({ n: x.n }); setPick(false); }}><b>${x.n}</b> ${x.branch ? x.branch + ' · ' : ''}${x.t}${act.type === 'lesson' && d.done.has(x.n) ? ' ✓' : act.type === 'lesson' && d.inProgress === x.n ? ' …' : ''}</button>`)
          : html`<div class="row"><span class="lab">${t('N°')}</span><input class="input num" type="number" min="1" inputmode="numeric" value=${act.n == null ? '' : act.n} onInput=${(e) => set({ n: e.target.value === '' ? null : +e.target.value })} /></div>`}</div>`
          : html`<button type="button" class="link" onClick=${() => setPick(true)}>${t('Changer de leçon ›')}</button>`}</div>
      ${act.type === 'lesson' ? html`<${Q} n=${5}>${t('La leçon est-elle terminée ?')}<//>
        <div class="yn"><button type="button" class=${act.done !== false ? 'y' : ''} onClick=${() => set({ done: true })}>✓ ${t('Oui, terminée')}</button><button type="button" class=${act.done === false ? 'y warn' : ''} onClick=${() => set({ done: false })}>${t('Non, je continue')}</button></div>
        ${act.done === false ? html`<p class="hint">${t('Les heures comptent dès aujourd’hui. La leçon comptera dans le programme quand vous la marquerez terminée.')}</p>` : null}` : null}` : null}

    ${isEval || isRem ? html`<${Q} n=${4}>${t('Quelle séquence ?')}<//>
      <div class="chips">${[1, 2, 3, 4, 5, 6].map(s => html`<button type="button" class=${+act.seq === s ? 'on' : ''} onClick=${() => set({ seq: s, ...(isRem ? { res: prefill(ctx, classId, s, res) } : {}) })}>${s}</button>`)}</div>
      <${Q} n=${5}>${isEval ? t('Les élèves de la classe') : t('Résultats de la séquence {s}', { s: act.seq || '…' })}<//>
      <${ResTable} res=${res} rows=${isEval ? ['c', 'p'] : ['c', 'p', 'r']} onChange=${(r) => set({ res: r })} />
      ${isRem ? html`<div class="okbox">${t('Taux de réussite : {r}', { r: pc((+res.rf || 0) + (+res.rg || 0), (+res.pf || 0) + (+res.pg || 0)) })} · ${t('filles')} ${pc(+res.rf || 0, +res.pf || 0)} · ${t('garçons')} ${pc(+res.rg || 0, +res.pg || 0)}</div>` : null}
      <p class="hint">${isEval ? t('« Élèves de la classe » est rempli avec l’effectif de la classe : vérifiez. Vous avez seulement surveillé une salle ? Laissez le tableau vide : vos heures comptent quand même.') : t('Remédiation = correction de l’évaluation et remise des copies. Les deux premières lignes reprennent le jour de l’évaluation.')}</p>` : null}

    ${many ? html`<div class="row" style="gap:6px"><span class="lab">${t('Périodes de cette activité')}</span>${[1, 2, 3, 4].filter(x => x <= total).map(x => html`<button type="button" class=${'btn sm ' + (+act.per === x ? '' : 'soft')} onClick=${() => set({ per: x })}>${x}</button>`)}</div>` : null}
  </div>`;
}

function prefill(ctx, classId, seq, cur) {
  const r = (seqResults(ctx)[classId] || {})[seq], c = ctx.cls(classId) || {}, e = c.effectif || {};
  return { cf: cur.cf != null && cur.cf !== '' ? cur.cf : r ? r.cf : +e.girls || '', cg: cur.cg != null && cur.cg !== '' ? cur.cg : r ? r.cg : +e.boys || '', pf: cur.pf != null && cur.pf !== '' ? cur.pf : r ? r.pf : '', pg: cur.pg != null && cur.pg !== '' ? cur.pg : r ? r.pg : '', rf: cur.rf != null ? cur.rf : r && r.remed ? r.rf : '', rg: cur.rg != null ? cur.rg : r && r.remed ? r.rg : '' };
}

function newAct(ctx, tid, classId, date, type) {
  const w = evalWeekOf(ctx, date), ty = type || (w ? 'assessment' : 'lesson'), act = { type: ty, done: true, per: 1 };
  return withType(ctx, tid, classId, act, ty, w);
}
function withType(ctx, tid, classId, act, type, w) {
  const out = { ...act, type };
  if (type === 'lesson') { const s = suggestLesson(ctx, tid, classId); out.n = s.n; out.done = true; }
  else if (type === 'practical' || type === 'further') {
    const a = ctx.assign.find(x => x.teacherId === tid && x.classId === classId), k = type === 'practical' ? 'p' : 'f';
    const did = new Set((ctx.byTeacher[tid] || []).filter(e => e.classId === classId && e.type === type && e.n != null).map(e => e.n));
    const next = planOf(ctx, a, ctx.cls(classId)).find(x => x.k === k && !did.has(x.n)); out.n = next ? next.n : nextNumber(ctx, tid, classId, type);
  } else out.n = null;
  if (type === 'assessment' || type === 'correction') { const seq = out.seq || (w ? w.seq : lastSeq(ctx, classId)); out.seq = seq || ''; out.res = type === 'correction' ? prefill(ctx, classId, seq, {}) : prefill(ctx, classId, seq, {}); if (type === 'assessment') { delete out.res.rf; delete out.res.rg; } }
  return out;
}
const lastSeq = (ctx, classId) => { const r = seqResults(ctx)[classId] || {}; const ks = Object.keys(r).map(Number); return ks.length ? Math.max(...ks) : ''; };
const fromEntry = (e) => ({ type: e.type, n: e.n, done: e.done !== false, seq: e.seq || '', res: e.res || {}, digital: !!e.digital, resource: e.resource || '', prac: !!e.prac, present: e.present == null ? '' : e.present, title: e.type === 'revision' ? e.title || '' : '', per: Math.max(1, Math.round((+e.minutes || 60) / 60)) });

/** Le formulaire. `init` : { classId, date, start, entry } ; `onDone(saved)` après l'enregistrement. */
export function QuickLog({ ctx, tid, init = {}, onDone, inModal }) {
  const lang = getLang(), editing = !!init.entry;
  const mine = [...new Set(ctx.assign.filter(a => a.teacherId === tid).map(a => a.classId))].filter(id => ctx.cls(id));
  const slotFor = (cid, iso) => todaySlots(ctx, tid, iso).rows.find(r => r.c === cid);
  const firstSlot = todaySlots(ctx, tid, init.date || ctx.today).rows.find(r => !r.done);
  const [classId, setClassId] = useState(init.classId || (init.entry && init.entry.classId) || (firstSlot && firstSlot.c) || mine[0] || '');
  const [date, setDate] = useState(init.date || (init.entry && init.entry.date) || ctx.today);
  const [total, setTotal] = useState(() => { if (init.entry) return Math.max(1, Math.round((+init.entry.minutes || 60) / 60)); const r = slotFor(classId, date); return r ? Math.max(1, Math.min(4, Math.round(r.h))) : 2; });
  const [acts, setActs] = useState(() => (init.entry ? [fromEntry(init.entry)] : [newAct(ctx, tid, classId, date, init.type)]));
  const [more, setMore] = useState(false), [err, setErr] = useState('');
  const many = acts.length > 1, used = acts.reduce((s, a) => s + (+a.per || 0), 0), left = total - used;
  const setAct = (i, patch) => setActs(list => list.map((a, j) => (j !== i ? a : patch.type && patch.type !== a.type ? withType(ctx, tid, classId, { ...a, ...patch }, patch.type, evalWeekOf(ctx, date)) : { ...a, ...patch })));
  const changeClass = (cid) => { setClassId(cid); const r = slotFor(cid, date); if (r && !editing) setTotal(Math.max(1, Math.min(4, Math.round(r.h)))); setActs(list => list.map(a => withType(ctx, tid, cid, a, a.type, evalWeekOf(ctx, date)))); };
  const changeDate = (iso) => { setDate(iso); const r = slotFor(classId, iso); if (r && !editing) setTotal(Math.max(1, Math.min(4, Math.round(r.h)))); };
  const other = ctx.classes.filter(c => !mine.includes(c.id));
  const yest = addDays(ctx.today, -1), dayKind = date === ctx.today ? 'today' : date === yest ? 'yest' : 'other';
  const warns = classId ? checkEntry(ctx, tid, { id: init.entry && init.entry.id, classId, date, start: (slotFor(classId, date) || {}).st || '07:30', end: (slotFor(classId, date) || {}).en || '09:30' }).filter(w => w.kind !== 'dup' || !editing) : [];

  const save = () => {
    setErr('');
    if (!classId) return setErr(t('Choisissez la classe.'));
    for (const a of acts) {
      if (isLessonType(a.type) && !(+a.n > 0)) return setErr(t('Indiquez le numéro de la leçon (touchez « Changer de leçon »).'));
      if (a.digital && !String(a.resource || '').trim()) return setErr(t('Vous avez dit que la leçon était digitalisée : indiquez la ressource utilisée.'));
      if (a.res && +a.res.rf + +a.res.rg > +a.res.pf + +a.res.pg) return setErr(t('Plus d’élèves ont réussi que d’élèves ont composé : vérifiez le tableau.'));
    }
    const P = ctx.dept.period || 60, slot = slotFor(classId, date), a0 = ctx.assign.find(x => x.teacherId === tid && x.classId === classId), cls = ctx.cls(classId);
    let cur = (init.entry && init.entry.start) || (slot && slot.st) || '07:30'; const saved = [];
    acts.forEach((a, i) => {
      const per = many ? Math.max(1, +a.per || 1) : total, end = endFor(cur, per, ctx.dept.breaks, P), kind = a.type === 'practical' ? 'p' : a.type === 'further' ? 'f' : 'l';
      const res = a.res && Object.values(a.res).some(v => v !== '' && v != null) ? a.res : null;
      saved.push(saveEntry({ id: i === 0 && init.entry ? init.entry.id : undefined, teacherId: tid, type: a.type, classId, date, start: cur, end, minutes: per * 60,
        n: isLessonType(a.type) ? +a.n : null, title: a.type === 'revision' ? a.title || '' : isLessonType(a.type) ? titleOf(ctx, a0, cls, kind, a.n) : '',
        done: a.type === 'lesson' ? a.done !== false : undefined, seq: a.seq || undefined, res,
        eval: res && (a.type === 'correction' || a.type === 'assessment') ? { evaluated: (+res.pf || 0) + (+res.pg || 0), passed: (+res.rf || 0) + (+res.rg || 0) } : null,
        digital: !!a.digital, resource: a.digital ? a.resource : '', prac: !!a.prac || a.type === 'practical', present: a.present, note: tid === myId() ? '' : t('Saisi par l’animateur pédagogique') }));
      cur = end;
    });
    const c = (cls || {}).name || '', l = acts.find(a => a.type === 'lesson');
    setToast(l ? t('{c} · leçon {n} enregistrée', { c, n: l.n }) : t('{c} · séance enregistrée', { c }), '', editing ? null : { label: t('Annuler'), run: () => saved.forEach(r => deleteEntry(r.id)) });
    onDone && onDone(saved);
  };

  return html`<div class="quick">
    <${Q} n=${1}>${t('Quelle classe ?')}<//>
    <div class="chips">${mine.map(id => html`<button type="button" class=${classId === id ? 'on' : ''} onClick=${() => changeClass(id)}>${ctx.cls(id).name}</button>`)}
      ${other.length ? html`<select class="input" style="width:auto;min-height:48px" value=${mine.includes(classId) ? '' : classId} onChange=${(e) => e.target.value && changeClass(e.target.value)}><option value="">${mine.length ? t('Autre classe…') : t('Choisir la classe…')}</option>${other.map(c => html`<option value=${c.id}>${c.name}</option>`)}</select>` : null}</div>
    <${Q} n=${2}>${t('Quel jour ? Combien de périodes ?')}<//>
    <div class="chips"><button type="button" class=${dayKind === 'today' ? 'on' : ''} onClick=${() => changeDate(ctx.today)}>${t('Aujourd’hui')}</button><button type="button" class=${dayKind === 'yest' ? 'on' : ''} onClick=${() => changeDate(yest)}>${t('Hier')}</button>
      <label class=${'datechip' + (dayKind === 'other' ? ' on' : '')}>📅 <input type="date" value=${date} max=${ctx.today} onInput=${(e) => e.target.value && changeDate(e.target.value)} aria-label=${t('Autre date')} /></label></div>
    ${dayKind === 'other' ? html`<p class="hint" style="margin-top:-6px">${fmt(date, lang, { weekday: true })}</p>` : null}
    <div class="chips"><span class="lab" style="align-self:center">${t('Périodes')} :</span>${[1, 2, 3, 4].map(x => html`<button type="button" class=${total === x ? 'on' : ''} onClick=${() => setTotal(x)}>${x}</button>`)}</div>
    ${acts.map((a, i) => html`<${Activity} key=${i} ctx=${ctx} tid=${tid} classId=${classId} date=${date} act=${a} idx=${i} many=${many} total=${total} set=${(p) => setAct(i, p)} onRemove=${() => setActs(acts.filter((_, j) => j !== i))} />`)}
    ${many ? html`<div class=${left === 0 ? 'okbox' : 'warnbox'}>${t('Périodes restantes')} : <b>${left}</b>${left === 0 ? ' ✓' : left > 0 ? ' · ' + t('il reste des périodes à répartir') : ' · ' + t('trop de périodes')}</div>` : null}
    ${editing ? null : html`<button type="button" class="link" onClick=${() => { const first = { ...acts[0], per: Math.max(1, total - 1) }; setActs([first, ...acts.slice(1), { ...newAct(ctx, tid, classId, date, acts.some(a => a.type === 'lesson') ? 'assessment' : 'lesson'), per: 1 }]); }}>＋ ${t('J’ai fait une autre activité dans ce cours')}</button>`}
    <button type="button" class="link muted" onClick=${() => setMore(!more)}>${more ? '▾' : '▸'} ${t('Plus de détails (numérique, leçon pratique, élèves présents)')}</button>
    ${more ? html`<div class="act-card">${acts.map((a, i) => html`${many ? html`<b>${t('Activité {n}', { n: i + 1 })}</b>` : null}
      <div class="row2"><div><span class="lab">${t('Leçon digitalisée ?')}</span><div class="yn sm"><button type="button" class=${a.digital ? 'y' : ''} onClick=${() => setAct(i, { digital: true })}>${t('Oui')}</button><button type="button" class=${!a.digital ? 'y' : ''} onClick=${() => setAct(i, { digital: false })}>${t('Non')}</button></div></div>
        <div><span class="lab">${t('Leçon pratique ?')}</span><div class="yn sm"><button type="button" class=${a.prac || a.type === 'practical' ? 'y' : ''} onClick=${() => setAct(i, { prac: true })}>${t('Oui')}</button><button type="button" class=${!(a.prac || a.type === 'practical') ? 'y' : ''} onClick=${() => setAct(i, { prac: false })}>${t('Non')}</button></div></div></div>
      ${a.digital ? html`<span class="lab">${t('Ressource utilisée *')}</span><div class="chips">${RESOURCES.map(r => html`<button type="button" class=${a.resource === t(r) ? 'on' : ''} onClick=${() => setAct(i, { resource: t(r) })}>${t(r)}</button>`)}</div><input class="input" placeholder=${t('Ou écrivez la ressource…')} value=${a.resource || ''} onInput=${(e) => setAct(i, { resource: e.target.value })} />` : null}
      <span class="lab">${t('Élèves présents (facultatif)')}</span><input class="input num" type="number" min="0" inputmode="numeric" value=${a.present} onInput=${(e) => setAct(i, { present: e.target.value })} />`)}</div>` : null}
    ${warns.map(w => html`<div class="warnbox">${w.kind === 'noday' ? t('Ce jour n’est pas un jour de cours (dimanche, jour férié ou vacances). Vérifiez la date.') : w.kind === 'noslot' ? t('Cette classe n’est pas dans votre emploi du temps ce jour-là. Vérifiez, ou continuez s’il s’agit d’un cours exceptionnel.') : t('Un cours est déjà saisi dans cette classe ce jour-là. Est-ce un doublon ?')}</div>`)}
    ${err ? html`<div class="err" role="alert">${err}</div>` : null}
    <div class=${inModal ? 'quick-foot' : 'quick-foot page-foot'}><button type="button" class="btn block big" onClick=${save}><${Icon} n="check" />${editing ? t('Enregistrer les modifications') : t('Enregistrer')}</button></div>
    ${editing ? html`<button type="button" class="btn ghost block" style="color:var(--coral)" onClick=${() => confirmDialog({ title: t('Supprimer ce cours ?'), message: t('Il sera retiré de vos heures et de vos leçons. Vous pourrez annuler juste après.'), confirm: t('Supprimer'), danger: true, onConfirm: () => { const old = deleteEntry(init.entry.id); setToast(t('Cours supprimé.'), '', { label: t('Annuler'), run: () => old && restoreEntry(old) }); } })}><${Icon} n="trash" />${t('Supprimer ce cours')}</button>` : null}
  </div>`;
}

/** Ouvre le formulaire dans une fenêtre (accueil, « Mes cours »). */
export function openQuickLog(ctx, tid, init) {
  openModal(() => html`<${Modal} title=${init && init.entry ? t('Modifier le cours') : t('Saisir un cours')} onClose=${closeModal}><${QuickLog} ctx=${ctx} tid=${tid} init=${init} inModal onDone=${() => closeModal()} /><//>`);
}

/** Page « Saisir ». */
export function Saisir({ ctx }) {
  const tid = myId(), [k, setK] = useState(0);
  return html`<div class="page"><div class="page-h"><h1>${t('Saisir un cours')}</h1><div class="row">${isAP() ? html`<a class="btn soft sm" href="#/week">${t('Ronde en classe')}</a>` : null}</div></div>
    ${!ctx.classes.length ? html`<div class="card"><p class="sub">${t('L’animateur pédagogique doit d’abord créer les classes du département.')}</p></div>`
      : html`<div class="card"><${QuickLog} key=${k} ctx=${ctx} tid=${tid} onDone=${() => { setK(k + 1); location.hash = '#/home'; }} /></div>`}
    <button type="button" class="btn ghost block" onClick=${() => openAbsence(ctx, tid, { from: ctx.today, to: ctx.today, reason: 'unknown' })}>${t('Je n’ai pas eu cours (absence, jour férié, sortie…)')}</button></div>`;
}
