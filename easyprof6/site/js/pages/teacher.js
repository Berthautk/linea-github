// Écrans simplifiés de l'enseignant : Accueil (mes cours d'aujourd'hui, où j'en suis) et « Mes cours » (semaine par semaine).
import { html, useState } from '../vendor/preact-htm.js';
import { t, getLang } from '../i18n.js';
import { Icon } from '../icons.js';
import { num1 } from '../ui.js';
import { todaySlots, stats, periodOf } from '../calc.js';
import { state, myId, me, setToast } from '../store.js';
import { saveEntry, deleteEntry } from '../actions.js';
import { openAbsence } from '../widgets.js';
import { typeOf, reasonOf } from '../consts.js';
import { addDays, mondayOf, fmt, endFor } from '../dates.js';
import { whereAmI, evalWeekOf } from '../progress.js';
import { openQuickLog } from './saisir.js';

const firstName = (n) => String(n || '').replace(/^(Mr?\.?|Mme|Mlle|Mrs|Miss)\s+/i, '').trim().split(/\s+/).pop();
const cname = (ctx, id) => (ctx.cls(id) || {}).name || id;

/** Résumé d'une séance enregistrée, en mots simples. */
export function entryText(ctx, e) {
  const ty = typeOf(e.type), per = Math.max(1, Math.round((+e.minutes || 0) / 60)), P = per > 1 ? t('{n} périodes', { n: per }) : t('1 période');
  if (e.type === 'lesson') return t('Leçon {n}', { n: e.n }) + (e.title ? ' · ' + e.title : '') + ' · ' + P + ' · ' + (e.done === false ? t('en cours') : t('terminée'));
  if (e.type === 'practical' || e.type === 'further') return t(ty.fr) + ' ' + (e.n != null ? e.n : '') + (e.title ? ' · ' + e.title : '') + ' · ' + P;
  if (e.type === 'assessment' || e.type === 'correction') { const r = e.res || {}, comp = (+r.pf || 0) + (+r.pg || 0), pass = (+r.rf || 0) + (+r.rg || 0);
    return t(ty.fr) + (e.seq ? ' · ' + t('séquence {s}', { s: e.seq }) : '') + (e.type === 'correction' && comp ? ' · ' + t('{p} ont réussi sur {c}', { p: pass, c: comp }) : comp ? ' · ' + t('{c} ont composé', { c: comp }) : '') + ' · ' + P; }
  return t(ty.fr) + (e.title ? ' · ' + e.title : '') + ' · ' + P;
}
const icon = (e) => (e.type === 'lesson' ? (e.done === false ? '½' : '✓') : typeOf(e.type).icon);

/** Met tous les cours de la semaine (jusqu'à aujourd'hui) non saisis en « Évaluation » de la séquence. */
function markWeekAsEval(ctx, tid, w) {
  const mon = mondayOf(ctx.today); let n = 0;
  for (let k = 0; k < 6; k++) {
    const iso = addDays(mon, k); if (iso > ctx.today || iso < w.f || iso > (w.t || w.f)) continue;
    for (const r of todaySlots(ctx, tid, iso).rows) {
      if (r.done || r.absent) continue;
      const st = r.st || '07:30'; saveEntry({ teacherId: tid, type: 'assessment', classId: r.c, date: iso, start: st, end: r.en || endFor(st, r.h, ctx.dept.breaks, ctx.dept.period), minutes: Math.round(r.h * 60), seq: w.seq, title: '' }); n++;
    }
  }
  setToast(n ? t('{n} cours enregistrés en évaluation (séquence {s}).', { n, s: w.seq }) : t('Rien à ajouter : vos cours de la semaine sont déjà saisis.'));
}

function Mirror({ ctx, tid, classId }) {
  const w = whereAmI(ctx, tid, classId); if (!w) return null;
  const lab = (x) => (x ? x.n + (x.branch ? ' (' + x.branch + ')' : '') : '—');
  return html`<div class="tcard"><div class="tc-h"><b>${cname(ctx, classId)}</b><span>${t('{d} leçons faites sur {n}', { d: w.done, n: w.total })}</span></div>
    <div class="mirror">${w.expected ? html`${t('Leçon prévue à ce jour')} : <b>${lab(w.expected)}</b> · ` : null}${t('Vous êtes à')} : <b>${w.current ? lab(w.current) + ' (' + t('en cours') + ')' : lab(w.last)}</b></div>
    ${w.status === 'late' ? html`<div class="badbox">⚠️ ${w.gap > 1 ? t('{n} leçons de retard : prévoyez un rattrapage', { n: w.gap }) : t('1 leçon de retard : prévoyez un rattrapage')}</div>`
      : w.status === 'ahead' ? html`<div class="infobox">⏩ ${w.gap > 1 ? t('{n} leçons d’avance : vous pouvez ralentir', { n: w.gap }) : t('1 leçon d’avance : vous pouvez ralentir')}</div>`
      : w.status === 'ok' ? html`<div class="okbox">✓ ${t('Dans les temps')}</div>` : null}</div>`;
}

/** Accueil de l'enseignant. */
export function TeacherHome({ ctx, live, extras }) {
  const lang = getLang(), tid = myId(), m = me(), td = todaySlots(live, tid, live.today), w = evalWeekOf(live, live.today);
  const mine = [...new Set(live.assign.filter(a => a.teacherId === tid).map(a => a.classId))].filter(id => live.cls(id));
  const left = td.rows.filter(r => !r.done && !r.absent).length;
  const p = periodOf(live, 'term'), S = stats(live, tid, p.ps, p.pe);
  return html`<div class="page tpage">
    <div class="hello"><h1>${t('Bonjour')}${m ? ', ' + firstName(m.name) : ''} 👋</h1><p class="sub cap">${fmt(live.today, lang, { weekday: true })}</p></div>
    ${w ? html`<div class="tcard evalw"><b>📝 ${t('Semaine d’évaluation · séquence {s}', { s: w.seq })}</b><p>${t('Du {a} au {b}. Vous surveillez ou faites composer : vos heures comptent, sans leçon.', { a: fmt(w.f, lang, { noYear: true }), b: fmt(w.t || w.f, lang, { noYear: true }) })}</p>
      <button class="btn accent block big" onClick=${() => markWeekAsEval(live, tid, w)}>${t('Mettre tous mes cours de la semaine en « Évaluation »')}</button><p class="hint">${t('Un seul geste pour la semaine (jusqu’à aujourd’hui). Vous pouvez corriger un cours à part dans « Mes cours ».')}</p></div>` : null}
    <h2 class="sec">${t('Mes cours d’aujourd’hui')}</h2>
    ${!td.teaching ? html`<div class="tcard"><p class="sub">${td.reason ? reasonOf(td.reason).icon + ' ' + t(reasonOf(td.reason).fr) : t('Pas de cours aujourd’hui.')}</p><button class="btn block big" onClick=${() => openQuickLog(live, tid, {})}><${Icon} n="plus" />${t('Saisir un autre cours')}</button></div>`
      : !td.rows.length ? html`<div class="tcard"><p class="sub">${(m && (m.slots || []).length) ? t('Pas de cours aujourd’hui dans votre emploi du temps.') : t('Votre emploi du temps n’est pas encore renseigné : demandez-le à votre animateur.')}</p><button class="btn block big" onClick=${() => openQuickLog(live, tid, {})}><${Icon} n="plus" />${t('Saisir un cours')}</button></div>`
      : td.rows.map(r => { const es = td.entries.filter(e => e.classId === r.c);
        return html`<div class="tcard"><div class="tc-h"><b>${cname(live, r.c)}</b><span>${r.st ? r.st + ' – ' + r.en : num1(r.h) + ' h'}</span></div>
          ${r.done ? es.map(e => html`<button class="okbox left" onClick=${() => openQuickLog(live, tid, { entry: e })}>✓ ${entryText(live, e)} <u>${t('Modifier')}</u></button>`)
            : r.absent ? html`<div class="badbox">✗ ${t('Absent')} (${t(reasonOf(r.absent).fr).toLowerCase()})</div>`
            : html`<button class="btn block big" onClick=${() => openQuickLog(live, tid, { classId: r.c, date: live.today })}>✏️ ${t('Saisir ce cours')}</button>`}</div>`; })}
    ${td.rows.length && !left ? html`<p class="hint" style="text-align:center">${t('Tous vos cours d’aujourd’hui sont saisis. Merci !')}</p>` : null}
    ${mine.length ? html`<h2 class="sec">${t('Où j’en suis')}</h2>${mine.map(cid => html`<${Mirror} ctx=${live} tid=${tid} classId=${cid} />`)}` : null}
    <a class="tcard link-card" href="#/mine"><b>📋 ${t('Mes cours de la semaine')}</b><span>${t('Voir, modifier, compléter ce qui manque')} ›</span></a>
    <div class="tcard"><div class="tc-h"><b>${t('Ce trimestre')}</b></div><div class="mirror">${t('{h} h faites sur {d} h dues à ce jour', { h: num1(S.hours), d: num1(S.due) })} · ${t('{l} leçons terminées', { l: S.lessonsDone })}</div></div>
    ${extras}
  </div>`;
}

/** « Mes cours » : une semaine à la fois, jour par jour. */
export function MyCourses({ ctx }) {
  const lang = getLang(), tid = myId(), [mon, setMon] = useState(mondayOf(ctx.today));
  const days = [0, 1, 2, 3, 4, 5].map(k => addDays(mon, k)); let due = 0, done = 0;
  const blocks = days.map(iso => {
    const td = todaySlots(ctx, tid, iso), past = iso <= ctx.today, extra = td.entries.filter(e => !td.rows.some(r => r.c === e.classId));
    if (!td.rows.length && !td.entries.length && !td.reason) return null;
    const rows = td.rows.map(r => { const es = td.entries.filter(e => e.classId === r.c); if (past && !td.reason) { due++; if (r.done) done++; }
      if (r.done) return es.map(e => html`<div class="crow"><div class=${'ck ' + (e.type === 'lesson' && e.done === false ? 'half' : 'ok')}>${icon(e)}</div><div class="grow"><b>${cname(ctx, e.classId)}</b><span>${entryText(ctx, e)}</span></div><button class="btn ghost sm" onClick=${() => openQuickLog(ctx, tid, { entry: e })}>${t('Modifier')}</button></div>`);
      if (r.absent) return html`<div class="crow"><div class="ck bad">✗</div><div class="grow"><b>${cname(ctx, r.c)}</b><span>${t('Absent')} · ${t(reasonOf(r.absent).fr)}</span></div></div>`;
      return html`<div class=${'crow' + (past ? ' miss' : '')}><div class=${'ck ' + (past ? 'bad' : '')}>${past ? '!' : '·'}</div><div class="grow"><b>${cname(ctx, r.c)}${r.st ? ' · ' + r.st : ''}</b><span>${past ? t('Pas encore saisi') : t('À venir')}</span></div>${past ? html`<button class="btn sm" onClick=${() => openQuickLog(ctx, tid, { classId: r.c, date: iso })}>${t('Saisir')}</button>` : null}</div>`; });
    return html`<div class="dayblk"><div class="day cap">${fmt(iso, lang, { weekday: true, noYear: true })}${td.reason ? ' · ' + reasonOf(td.reason).icon + ' ' + t(reasonOf(td.reason).fr) : ''}</div>${rows}
      ${extra.map(e => html`<div class="crow"><div class="ck ok">${icon(e)}</div><div class="grow"><b>${cname(ctx, e.classId)}</b><span>${entryText(ctx, e)}</span></div><button class="btn ghost sm" onClick=${() => openQuickLog(ctx, tid, { entry: e })}>${t('Modifier')}</button></div>`)}</div>`;
  });
  return html`<div class="page tpage"><div class="page-h"><h1>${t('Mes cours')}</h1></div>
    <div class="weeknav"><button class="icon-btn" onClick=${() => setMon(addDays(mon, -7))} aria-label=${t('Semaine précédente')}><${Icon} n="left" /></button><b>${t('Semaine du {a} au {b}', { a: fmt(mon, lang, { noYear: true }), b: fmt(addDays(mon, 5), lang, { noYear: true }) })}</b><button class="icon-btn" onClick=${() => setMon(addDays(mon, 7))} aria-label=${t('Semaine suivante')}><${Icon} n="right" /></button></div>
    ${due ? html`<div class=${done === due ? 'okbox' : 'warnbox'}>${t('Cette semaine : {d} cours saisis sur {n}', { d: done, n: due })}${done < due ? ' · ' + t('{k} à compléter', { k: due - done }) : ' ✓'}</div>` : null}
    ${blocks.some(Boolean) ? blocks : html`<p class="sub">${t('Aucun cours prévu cette semaine dans votre emploi du temps.')}</p>`}
    <button class="btn block big" onClick=${() => openQuickLog(ctx, tid, {})}><${Icon} n="plus" />${t('Saisir un autre cours')}</button>
    <button class="btn ghost block" onClick=${() => openAbsence(ctx, tid, { from: ctx.today, to: ctx.today, reason: 'unknown' })}>${t('Je n’ai pas eu cours (absence, jour férié, sortie…)')}</button></div>`;
}
