// Réglages : profil, établissement, année scolaire, classes, régularisations, sauvegarde et import.
import { html, useState } from '../vendor/preact-htm.js';
import { t, getLang } from '../i18n.js';
import { Icon } from '../icons.js';
import { Field, Seg, Chip, Empty, Modal, openModal, closeModal, confirmDialog, copyText, num1 } from '../ui.js';
import { api } from '../api.js';
import { state, update, setLanguage, setToast, logout, isAP, myId, me, flush, nextU } from '../store.js';
import { saveDept, saveClass, deleteClass, saveTeacher, saveRegul, deleteRegul, replaceMeta, replaceStartRegul, uid } from '../actions.js';
import { makeCtx, catchUp } from '../calc.js';
import * as D from '../dates.js';
import { Team, TeacherDetail, showCredentials } from './team.js';
import { Guide } from './guide.js';
import { defaultTerms, defaultCalendar } from '../defaults.js';
import { REASONS } from '../consts.js';
import { fmt, todayISO, DEFAULT_BREAKS } from '../dates.js';
import { letterText, defaultLetter, showArms } from '../letterhead.js';
import { exportCSV } from '../exports.js';
import { isOldBackup, isNewBackup, summarize, convert, surname } from '../import-old.js';
import { syncNow } from '../sync.js';

const Back = ({ title, children }) => html`<div class="page-h"><div class="row"><a class="icon-btn" href="#/settings" aria-label=${t('Retour')}><${Icon} n="left" /></a><h1>${title}</h1></div>${children}</div>`;

function Menu() {
  const ap = isAP(), items = [
    ['#/settings/guide', 'info', t('Mode d’emploi'), t('Comment utiliser Rekort, pas à pas')],
    ['#/settings/profile', 'user', t('Mon profil'), t('Nom, téléphone, mot de passe, langue')],
    ...(ap ? [['#/settings/dept', 'school', t('Établissement et en-tête'), t('Nom de l’école, texte imprimé en haut des fiches (français / anglais)')],
      ['#/settings/year', 'calendar', t('Année scolaire et calendrier'), t('Dates des trimestres, vacances, jours sans cours')],
      ['#/settings/classes', 'book', t('Classes'), t('Les classes et leurs effectifs')],
      ['#/settings/team', 'users', t('Collègues et emplois du temps'), t('Créer les comptes, choisir mots de passe, cours de la semaine, leçons prévues')],
      ['#/settings/regul', 'clock', t('Heures hors application'), t('Compter des heures faites avant Rekort')]] : []),
    ['#/settings/data', 'download', t('Sauvegarde et import'), ap ? t('Exporter, importer l’ancienne version') : t('Exporter vos données')],
  ];
  return html`<div class="page"><div class="page-h"><h1>${t('Réglages')}</h1></div><div class="card"><div class="list">${items.map(([href, ic, title, sub]) => html`<a class="item" href=${href} style="text-decoration:none;color:inherit"><div class="dot"><${Icon} n=${ic} /></div><div class="grow"><b>${title}</b><span>${sub}</span></div><${Icon} n="right" size="18" /></a>`)}</div></div>
    <p class="sub" style="text-align:center">Rekort · ${t('Département')} ${state.data.dept.name}</p></div>`;
}

function RecoveryCard() {
  const [pw, setPw] = useState(''), [err, setErr] = useState('');
  const go = async (e) => { e.preventDefault(); setErr(''); try { const r = await api('/me/recovery', { password: pw }, state.session.token); setPw(''); update(s => { s.recovery = r.recovery; }); } catch (x) { setErr(x.message); } };
  return html`<form class="card stack" onSubmit=${go}><h3>${t('Code de récupération')}</h3><p class="sub">${t('Il permet de retrouver votre accès si vous oubliez votre mot de passe. Il s’affiche une seule fois : notez-le. Créer un nouveau code annule l’ancien.')}</p>
    <${Field} label=${t('Votre mot de passe')}><input class="input" type="password" autocomplete="current-password" value=${pw} onInput=${(e) => setPw(e.target.value)} required /><//>
    ${err ? html`<div class="err">${err}</div>` : null}<button class="btn soft" style="align-self:flex-start">${t('Créer un nouveau code')}</button></form>`;
}

function Profile() {
  const m = me(), [pw, setPw] = useState({ old: '', password: '' }), [msg, setMsg] = useState(null);
  const change = async (e) => { e.preventDefault(); setMsg(null); try { await api('/me/password', pw, state.session.token); setMsg({ ok: t('Mot de passe modifié.') }); setPw({ old: '', password: '' }); } catch (x) { setMsg({ err: x.message }); } };
  const inst = window.__epInstall;
  return html`<div class="page"><${Back} title=${t('Mon profil')} />
    <div class="card stack"><div class="grid2"><${Field} label=${t('Nom complet')}><input class="input" value=${m ? m.name : ''} onChange=${(e) => e.target.value.trim() && saveTeacher(myId(), { name: e.target.value.trim() })} /><//>
      <${Field} label=${t('Téléphone WhatsApp')}><input class="input" inputmode="tel" value=${m ? m.phone || '' : ''} onChange=${(e) => saveTeacher(myId(), { phone: e.target.value.trim() })} /><//></div>
      <div class="row"><span class="lab">${t('Identifiant')}</span><b>${state.session.username}</b><${Chip} tone="info">${isAP() ? t('Animateur pédagogique') : t('Enseignant')}<//></div>
      <div class="row"><span class="lab">${t('Langue')}</span><${Seg} options=${[{ id: 'fr', label: 'Français' }, { id: 'en', label: 'English' }]} value=${state.lang} onChange=${setLanguage} /></div></div>
    <form class="card stack" onSubmit=${change}><h3>${t('Changer mon mot de passe')}</h3><div class="grid2"><${Field} label=${t('Mot de passe actuel')}><input class="input" type="password" autocomplete="current-password" value=${pw.old} onInput=${(e) => setPw({ ...pw, old: e.target.value })} required /><//>
      <${Field} label=${t('Nouveau mot de passe')} hint=${t('Au moins 6 caractères.')}><input class="input" type="password" autocomplete="new-password" value=${pw.password} onInput=${(e) => setPw({ ...pw, password: e.target.value })} required /><//></div>
      ${msg && msg.ok ? html`<div class="ok">${msg.ok}</div>` : null}${msg && msg.err ? html`<div class="err">${msg.err}</div>` : null}<button class="btn" style="align-self:flex-start">${t('Changer le mot de passe')}</button></form>
    ${isAP() ? html`<${RecoveryCard} />` : null}
    <div class="card stack"><h3>${t('Cet appareil')}</h3>${inst ? html`<button class="btn accent" onClick=${async () => { inst.prompt(); await inst.userChoice; window.__epInstall = null; update(() => { }); }}><${Icon} n="download" />${t('Installer Rekort sur ce téléphone')}</button>` : html`<p class="sub">${t('Pour installer l’application : menu du navigateur › « Ajouter à l’écran d’accueil » ou « Installer l’application ».')}</p>`}
      <button class="btn soft" onClick=${() => logout()}><${Icon} n="logout" />${t('Se déconnecter')}</button>
      <button class="btn danger" onClick=${() => confirmDialog({ title: t('Effacer les données de cet appareil ?'), message: t('Vos données restent enregistrées sur le serveur et reviendront à la prochaine connexion. Les saisies pas encore synchronisées seraient perdues.'), confirm: t('Effacer et se déconnecter'), danger: true, onConfirm: () => logout({ wipe: true }) })}>${t('Se déconnecter et effacer cet appareil')}</button></div></div>`;
}

function Dept() {
  const d = state.data.dept, h = d.header || {}, set = (patch) => { saveDept(patch); setToast(t('Enregistré.')); }, seth = (k, v) => set({ header: { ...h, [k]: v } });
  return html`<div class="page"><${Back} title=${t('Établissement et en-tête')} /><div class="card stack">
    <${Field} label=${t('Établissement')}><input class="input" value=${d.name} onChange=${(e) => set({ name: e.target.value.trim() })} /><//>
    <div class="grid2"><${Field} label=${t('Discipline')}><input class="input" value=${d.discipline} onChange=${(e) => set({ discipline: e.target.value.trim() })} /><//><${Field} label=${t('Abréviation')}><input class="input" value=${d.abbr} maxlength="8" onChange=${(e) => set({ abbr: e.target.value.trim().toUpperCase() })} /><//></div>
    <${Field} group label=${t('Système')}><${Seg} options=${[{ id: 'anglophone', label: t('Anglophone') }, { id: 'francophone', label: t('Francophone') }]} value=${d.system} onChange=${(v) => set({ system: v })} /><//>
    <div class="grid2"><${Field} label=${t('Année scolaire')}><input class="input" value=${d.year} placeholder="2026/2027" onChange=${(e) => set({ year: e.target.value.trim() })} /><//><${Field} label=${t('Durée d’une leçon (heures)')} hint=${t('Sert à estimer les leçons quand aucun plan n’est défini.')}><input class="input" type="number" step="0.5" min="0.5" value=${d.lh} onChange=${(e) => set({ lh: +e.target.value || 2 })} /><//></div></div>
    <div class="card stack"><h3>${t('En-tête de la fiche d’inspection')}</h3><p class="sub">${t('C’est le texte imprimé en haut des fiches : le français à gauche, l’anglais à droite, les armoiries au centre. Remplissez la région et le département : le texte est écrit pour vous. Vous pouvez aussi le modifier librement ci-dessous.')}</p>
      <div class="grid2"><${Field} label=${t('Région')}><input class="input" value=${h.region || ''} placeholder=${t('Nord')} onChange=${(e) => seth('region', e.target.value.trim())} /><//><${Field} label=${t('Département (division)')}><input class="input" value=${h.division || ''} placeholder=${t('Bénoué')} onChange=${(e) => seth('division', e.target.value.trim())} /><//></div>
      <${Field} label=${t('Contact (facultatif)')} hint=${t('Ex. : BP 548 Garoua · Tél : 22 15 68 07 · dresnord@gmail.com')}><input class="input" value=${h.contact || ''} onChange=${(e) => seth('contact', e.target.value.trim())} /><//>
      <${Field} label=${t('Texte à gauche (français)')} hint=${t('Une ligne par ligne imprimée ; la première est en gras.')}><textarea class="input" rows="6" value=${letterText(h, 'fr')} onChange=${(e) => seth('fr', e.target.value.trim() === defaultLetter(h, 'fr') ? '' : e.target.value.trim())}></textarea><//>
      <${Field} label=${t('Texte à droite (anglais)')}><textarea class="input" rows="6" value=${letterText(h, 'en')} onChange=${(e) => seth('en', e.target.value.trim() === defaultLetter(h, 'en') ? '' : e.target.value.trim())}></textarea><//>
      <label class="opt"><input type="checkbox" checked=${showArms(h)} onChange=${(e) => seth('arms', e.target.checked ? '' : '0')} /><span>${t('Afficher les armoiries du Cameroun au centre')}</span></label>
      <div class="row"><button class="btn soft sm" onClick=${() => set({ header: { ...h, fr: '', en: '' } })}>${t('Rétablir le texte automatique')}</button></div></div>
    <div class="card stack"><h3>${t('Pauses de la journée')}</h3><p class="sub">${t('Un cours qui commence avant une pause et finit après ne la compte pas dans sa durée. Exemple : de 9 h 30 à 11 h 45 avec une pause de 10 h 30 à 10 h 45 = 2 h.')}</p>
      ${(d.breaks || DEFAULT_BREAKS).map((b, i, all) => html`<div class="row" style="gap:8px"><input class="input" type="time" value=${b.f} onChange=${(e) => set({ breaks: all.map((x, j) => (j === i ? { ...x, f: e.target.value } : x)) })} /><span>→</span><input class="input" type="time" value=${b.t} onChange=${(e) => set({ breaks: all.map((x, j) => (j === i ? { ...x, t: e.target.value } : x)) })} />
        <button class="icon-btn" onClick=${() => set({ breaks: all.filter((_, j) => j !== i) })} aria-label=${t('Supprimer')}><${Icon} n="trash" /></button></div>`)}
      <div class="row"><button class="btn soft sm" onClick=${() => set({ breaks: [...(d.breaks || DEFAULT_BREAKS), { f: '10:00', t: '10:15' }] })}><${Icon} n="plus" />${t('Ajouter une pause')}</button></div></div></div>`;
}

function Year() {
  const ctx = makeCtx(state.data), d = state.data.dept, lang = getLang();
  const setTerm = (id, patch) => { saveDept({ terms: d.terms.map(x => (x.id === id ? { ...x, ...patch } : x)) }); };
  const [c, setC] = useState({ f: '', t: '', n: '' });
  const cal = d.calendar || [];
  const reset = () => confirmDialog({ title: t('Rétablir le calendrier officiel ?'), message: t('Trimestres et vacances 2026/2027 de l’arrêté conjoint du 14/08/2026. Vos modifications seront remplacées.'), confirm: t('Rétablir'), onConfirm: () => { saveDept({ terms: defaultTerms(), calendar: defaultCalendar(), year: '2026/2027' }); setToast(t('Calendrier rétabli.')); } });
  return html`<div class="page"><${Back} title=${t('Année scolaire et calendrier')}><button class="btn soft sm" onClick=${reset}>${t('Rétablir l’officiel 2026/2027')}</button><//>
    <div class="card"><div class="card-h"><h3>${t('Trimestres')}</h3></div><div class="stack" style="gap:14px">${d.terms.map(x => html`<div class="stack" style="gap:8px"><div class="row"><input class="input grow" value=${x.name} onChange=${(e) => setTerm(x.id, { name: e.target.value })} /></div>
      <div class="grid2"><${Field} label=${t('Début')}><input class="input" type="date" value=${x.start} onChange=${(e) => e.target.value && setTerm(x.id, { start: e.target.value })} /><//><${Field} label=${t('Fin officielle')}><input class="input" type="date" value=${x.end} onChange=${(e) => e.target.value && setTerm(x.id, { end: e.target.value })} /><//></div></div>`)}</div></div>
    <div class="card"><div class="card-h"><h3>${t('Jours sans cours de l’établissement')}</h3></div>
      <div class="list">${cal.map((r, i) => html`<div class="item"><div class="grow"><b>${r.n || t('Jour sans cours')}</b><span>${r.t && r.t !== r.f ? fmt(r.f, lang, { noYear: true }) + ' → ' + fmt(r.t, lang) : fmt(r.f, lang)}</span></div><button class="icon-btn" onClick=${() => saveDept({ calendar: cal.filter((_, j) => j !== i) })} aria-label=${t('Supprimer')}><${Icon} n="trash" /></button></div>`)}</div>
      <div class="stack" style="margin-top:12px;gap:10px"><div class="grid3"><${Field} label=${t('Du')}><input class="input" type="date" value=${c.f} onInput=${(e) => setC({ ...c, f: e.target.value, t: c.t < e.target.value ? e.target.value : c.t })} /><//><${Field} label=${t('Au')}><input class="input" type="date" min=${c.f} value=${c.t} onInput=${(e) => setC({ ...c, t: e.target.value })} /><//><${Field} label=${t('Nom')}><input class="input" value=${c.n} placeholder=${t('Tabaski, journée pédagogique…')} onInput=${(e) => setC({ ...c, n: e.target.value })} /><//></div>
        <button class="btn soft" style="align-self:flex-start" disabled=${!c.f} onClick=${() => { saveDept({ calendar: [...cal, { f: c.f, t: c.t || c.f, n: c.n }].sort((a, b) => (a.f < b.f ? -1 : 1)) }); setC({ f: '', t: '', n: '' }); }}><${Icon} n="plus" />${t('Ajouter')}</button></div>
      <p class="hint" style="margin-top:8px">${t('Ces jours sont retirés des heures dues de tous les enseignants et ne déclenchent aucun rappel.')}</p></div>
    <div class="card"><div class="card-h"><h3>${t('Comment compter les jours sans cours déclarés ?')}</h3></div><div class="list">${REASONS.map(r => { const out = ctx.reasonOut(r.id); return html`<div class="item"><div class="dot">${r.icon}</div><div class="grow"><b>${t(r.fr)}</b></div><${Seg} options=${[{ id: 'out', label: t('Non dû') }, { id: 'abs', label: t('Absence') }]} value=${out ? 'out' : 'abs'} onChange=${(v) => saveDept({ dueOut: { ...(d.dueOut || {}), [r.id]: v === 'out' } })} /></div>`; })}</div>
      <p class="hint" style="margin-top:8px">${t('« Non dû » : ces heures sont retirées des heures dues (pas de faute de l’enseignant). « Absence » : elles restent dues mais ne sont pas faites.')}</p></div></div>`;
}

function ClassEdit({ cls }) {
  const [f, setF] = useState({ name: cls ? cls.name : '', level: cls ? cls.level : '', cycle: cls ? cls.cycle : '1er', total: cls ? cls.effectif.total || '' : '', girls: cls ? cls.effectif.girls || '' : '', boys: cls ? cls.effectif.boys || '' : '' });
  const go = (e) => { e.preventDefault(); saveClass({ id: cls && cls.id, name: f.name.trim(), level: f.level.trim(), cycle: f.cycle, effectif: { total: +f.total || (+f.girls || 0) + (+f.boys || 0), girls: +f.girls || 0, boys: +f.boys || 0 } }); closeModal(); setToast(t('Classe enregistrée.')); };
  return html`<${Modal} title=${cls ? t('Modifier la classe') : t('Nouvelle classe')} onClose=${closeModal}><form class="stack" onSubmit=${go}>
    <${Field} label=${t('Nom de la classe')}><input class="input" value=${f.name} onInput=${(e) => setF({ ...f, name: e.target.value })} placeholder=${t('Form 3 A  ou  3e A')} required /><//>
    <${Field} label=${t('Niveau')}><input class="input" value=${f.level} onInput=${(e) => setF({ ...f, level: e.target.value })} placeholder=${t('Form 3 / 3e / Lower Sixth…')} /><//>
    <${Field} group label=${t('Cycle')}><${Seg} full options=${[{ id: '1er', label: t('1er cycle') }, { id: '2nd', label: t('2nd cycle') }]} value=${f.cycle} onChange=${(v) => setF({ ...f, cycle: v })} /><//>
    <div class="grid3"><${Field} label=${t('Effectif')}><input class="input" type="number" min="0" inputmode="numeric" value=${f.total} onInput=${(e) => setF({ ...f, total: e.target.value })} /><//><${Field} label=${t('Filles')}><input class="input" type="number" min="0" inputmode="numeric" value=${f.girls} onInput=${(e) => setF({ ...f, girls: e.target.value })} /><//><${Field} label=${t('Garçons')}><input class="input" type="number" min="0" inputmode="numeric" value=${f.boys} onInput=${(e) => setF({ ...f, boys: e.target.value })} /><//></div>
    <button class="btn block">${t('Enregistrer')}</button></form><//>`;
}
const USUAL = {
  anglophone: [['Form 1 A', 'Form 1', '1er'], ['Form 1 B', 'Form 1', '1er'], ['Form 2 A', 'Form 2', '1er'], ['Form 2 B', 'Form 2', '1er'], ['Form 3 A', 'Form 3', '1er'], ['Form 3 B', 'Form 3', '1er'], ['Form 4 Arts', 'Form 4', '1er'], ['Form 4 Science', 'Form 4', '1er'], ['Form 5 Arts', 'Form 5', '1er'], ['Form 5 Science', 'Form 5', '1er'], ['Lower Sixth Arts', 'Lower Sixth', '2nd'], ['Upper Sixth Arts', 'Upper Sixth', '2nd']],
  francophone: [['6e A', '6e', '1er'], ['5e A', '5e', '1er'], ['4e A', '4e', '1er'], ['3e A', '3e', '1er'], ['2nde A', '2nde', '2nd'], ['1ère A', '1ère', '2nd'], ['Tle A', 'Tle', '2nd']],
};
function Classes() {
  const ctx = makeCtx(state.data);
  const missing = (USUAL[state.data.dept.system] || USUAL.anglophone).filter(([n]) => !ctx.classes.some(c => c.name.toLowerCase() === n.toLowerCase()));
  const addUsual = () => { missing.forEach(([name, level, cycle]) => saveClass({ name, level, cycle, effectif: { total: 0, girls: 0, boys: 0 } })); setToast(t('{n} classe(s) ajoutée(s). Indiquez leurs effectifs.', { n: missing.length })); };
  return html`<div class="page"><${Back} title=${t('Classes')}><button class="btn" onClick=${() => openModal(() => html`<${ClassEdit} />`)}><${Icon} n="plus" />${t('Nouvelle classe')}</button><//>
    <p class="sub">${t('Le nombre de leçons prévues se règle ensuite pour chaque collègue, dans Équipe.')}</p>
    ${missing.length ? html`<button class="btn soft" style="align-self:flex-start" onClick=${addUsual}><${Icon} n="plus" />${t('Ajouter les classes habituelles')}</button>` : null}
    ${!ctx.classes.length ? html`<div class="card"><${Empty} icon="🏫" title=${t('Aucune classe')} text=${t('Ajoutez les classes où le département enseigne.')} /></div>` : html`<div class="card"><div class="list">${ctx.classes.map(c => html`<div class="item"><div class="dot">📘</div><div class="grow"><b>${c.name}</b><span>${c.cycle === '2nd' ? t('2nd cycle') : t('1er cycle')} · ${(c.effectif || {}).total || 0} ${t('élèves')}</span></div>
      <button class="icon-btn" onClick=${() => openModal(() => html`<${ClassEdit} cls=${c} />`)} aria-label=${t('Modifier')}><${Icon} n="edit" /></button>
      <button class="icon-btn" onClick=${() => confirmDialog({ title: t('Supprimer la classe {c} ?', { c: c.name }), message: t('Les saisies déjà faites dans cette classe restent dans l’historique.'), confirm: t('Supprimer'), danger: true, onConfirm: () => deleteClass(c.id) })} aria-label=${t('Supprimer')}><${Icon} n="trash" /></button></div>`)}</div></div>`}</div>`;
}

function CatchUp({ ctx }) {
  const lang = getLang(), start = ctx.dept.terms.length ? ctx.ys : ctx.today;
  const { addDays, mondayOf } = D;
  const prev = ctx.regul.filter(r => r.tag === 'start');
  const [date, setDate] = useState(() => { const d = addDays(mondayOf(ctx.today), -3); return d < start ? start : d; });
  const [rows, setRows] = useState(null);
  const calc = () => setRows(catchUp(ctx, date).map(r => ({ ...r, h: String(r.h), lessons: String(r.lessons) })));
  const setRow = (i, k, v) => setRows(rows.map((r, j) => (j === i ? { ...r, [k]: v } : r)));
  const save = () => { replaceStartRegul(rows.filter(r => +r.h > 0 || +r.lessons > 0).map(r => ({ ...r, d: start, d2: date, note: t('Reprise : à jour jusqu’au {d}', { d: fmt(date, lang) }) }))); setRows(null); setToast(t('Reprise enregistrée.')); };
  return html`<div class="card stack"><h3>${t('Démarrer sans être « en retard »')}</h3>
    <p class="sub">${t('Rekort compte ce que chacun saisit. Pour les semaines passées, indiquez ici la date jusqu’à laquelle tout était à jour : on ajoute alors, pour chaque classe, les heures et leçons prévues qui n’ont pas été saisies. À partir de cette date, chacun saisit normalement.')}</p>
    ${prev.length ? html`<div class="ok">${t('Reprise déjà enregistrée ({n} lignes), jusqu’au {d}.', { n: prev.length, d: fmt(prev[0].d2, lang) })} <button class="btn sm danger" style="margin-left:8px" onClick=${() => { replaceStartRegul([]); setToast(t('Reprise annulée.')); }}>${t('Annuler la reprise')}</button></div>` : null}
    <div class="row"><${Field} label=${t('Tout était à jour jusqu’au')} class="grow"><input class="input" type="date" min=${start} max=${ctx.today} value=${date} onInput=${(e) => { setDate(e.target.value); setRows(null); }} /><//><button class="btn" style="align-self:flex-end" onClick=${calc}>${t('Calculer')}</button></div>
    ${rows ? (rows.length ? html`<div class="tbl-wrap"><table class="tbl"><thead><tr><th>${t('Enseignant · classe')}</th><th>${t('Heures')}</th><th>${t('Leçons')}</th></tr></thead><tbody>${rows.map((r, i) => html`<tr><td style="white-space:normal">${(ctx.teacher(r.teacherId) || {}).short} · ${(ctx.cls(r.classId) || {}).name || r.classId}</td>
      <td><input class="input" type="number" step="0.5" min="0" style="width:70px;min-height:38px" value=${r.h} onInput=${(e) => setRow(i, 'h', e.target.value)} /></td><td><input class="input" type="number" min="0" style="width:60px;min-height:38px" value=${r.lessons} onInput=${(e) => setRow(i, 'lessons', e.target.value)} /></td></tr>`)}</tbody></table></div>
      <p class="hint">${t('Vous pouvez corriger les chiffres (par exemple pour un collègue absent) avant d’enregistrer.')}</p><button class="btn" style="align-self:flex-start" onClick=${save}><${Icon} n="check" />${t('Enregistrer la reprise')}</button>` : html`<p class="sub">${t('Rien à ajouter : les saisies couvrent déjà tout ce qui était prévu.')}</p>`) : null}</div>`;
}

function Regul() {
  const ctx = makeCtx(state.data), lang = getLang();
  const [f, setF] = useState({ teacherId: myId(), classId: '', d: ctx.ys, d2: '', h: '', lessons: '', note: '' });
  const rows = ctx.regul.slice().sort((a, b) => (a.d < b.d ? 1 : -1));
  return html`<div class="page"><${Back} title=${t('Heures hors application')} />
    <${CatchUp} ctx=${ctx} />
    <div class="card stack"><h3>${t('Ajouter à la main')}</h3><p class="sub">${t('Pour compter des heures ou des leçons réellement faites hors application, ou corriger une erreur : nombre positif ou négatif, réparti sur la période.')}</p>
      <div class="grid2"><${Field} label=${t('Enseignant')}><select class="input" value=${f.teacherId} onChange=${(e) => setF({ ...f, teacherId: e.target.value })}>${ctx.teachers.map(x => html`<option value=${x.id}>${x.name}</option>`)}</select><//>
      <${Field} label=${t('Classe (pour les leçons)')}><select class="input" value=${f.classId} onChange=${(e) => setF({ ...f, classId: e.target.value })}><option value="">${t('— toutes —')}</option>${ctx.classes.map(c => html`<option value=${c.id}>${c.name}</option>`)}</select><//></div>
      <div class="grid2"><${Field} label=${t('Heures (+ ou −)')}><input class="input" type="number" step="0.5" inputmode="decimal" value=${f.h} onInput=${(e) => setF({ ...f, h: e.target.value })} /><//><${Field} label=${t('Leçons (+ ou −)')}><input class="input" type="number" inputmode="numeric" value=${f.lessons} onInput=${(e) => setF({ ...f, lessons: e.target.value })} /><//></div>
      <div class="grid2"><${Field} label=${t('Du')}><input class="input" type="date" value=${f.d} onInput=${(e) => setF({ ...f, d: e.target.value })} /><//><${Field} label=${t('Au (si étalé)')}><input class="input" type="date" min=${f.d} value=${f.d2} onInput=${(e) => setF({ ...f, d2: e.target.value })} /><//></div>
      <${Field} label=${t('Raison')}><input class="input" value=${f.note} onInput=${(e) => setF({ ...f, note: e.target.value })} /><//>
      <button class="btn" style="align-self:flex-start" disabled=${!(f.h || f.lessons) || !f.d} onClick=${() => { saveRegul(f); setF({ ...f, h: '', lessons: '', note: '', d2: '' }); setToast(t('Enregistré.')); }}><${Icon} n="plus" />${t('Ajouter')}</button></div>
    ${rows.length ? html`<div class="card"><div class="list">${rows.map(r => html`<div class="item"><div class="dot">${r.tag === 'start' ? '🏁' : (r.h >= 0 ? '➕' : '➖')}</div><div class="grow"><b>${(ctx.teacher(r.teacherId) || {}).name || '?'}${r.classId ? ' · ' + ((ctx.cls(r.classId) || {}).name || '') : ''}</b><span>${r.h ? (r.h > 0 ? '+' : '') + num1(r.h) + ' h' : ''}${r.h && r.lessons ? ' · ' : ''}${r.lessons ? (r.lessons > 0 ? '+' : '') + num1(r.lessons) + ' ' + t('leçon(s)') : ''} · ${fmt(r.d, lang, { noYear: true })}${r.d2 ? ' → ' + fmt(r.d2, lang, { noYear: true }) : ''}${r.note ? ' · ' + r.note : ''}</span></div>${r.tag === 'start' ? null : html`<button class="icon-btn" onClick=${() => deleteRegul(r.id)} aria-label=${t('Supprimer')}><${Icon} n="trash" /></button>`}</div>`)}</div></div>` : null}</div>`;
}

function ImportOld({ json, onDone }) {
  const sum = summarize(json), [who, setWho] = useState((sum.teachers.find(x => x.isAP) || sum.teachers[0] || {}).id), [busy, setBusy] = useState(false), [err, setErr] = useState(''), [creds, setCreds] = useState(null);
  const run = async () => {
    setBusy(true); setErr('');
    try {
      const map = { [who]: myId() }, made = [], here = state.data.teachers.filter(x => !x.deleted);
      for (const tc of sum.teachers) {
        if (tc.id === who) continue;
        const known = here.find(x => x.id !== myId() && surname(x.name) === surname(tc.name));
        if (known) { map[tc.id] = known.id; continue; }
        const r = await api('/team/add', { name: tc.name, phone: tc.phone }, state.session.token);
        map[tc.id] = r.teacher.id; made.push({ name: r.teacher.name, username: r.username, password: r.password }); replaceMeta(r.meta);
      }
      const c = convert(json, (id) => map[id], nextU());
      update(s => {
        const d = s.data, now = nextU(), tid = new Set(c.entries.map(e => e.id));
        s.data = { ...d, dept: { ...d.dept, ...c.dept, header: { ...d.dept.header, ...Object.fromEntries(Object.entries(c.dept.header).filter(([, v]) => v)) }, u: now },
          teachers: d.teachers.map(x => (c.slots[x.id] ? { ...x, slots: c.slots[x.id], u: now } : x)), classes: [...d.classes.filter(x => !c.classes.some(y => y.id === x.id)), ...c.classes],
          assign: [...d.assign.filter(x => !c.assign.some(y => y.id === x.id)), ...c.assign], entries: [...d.entries.filter(e => !tid.has(e.id)), ...c.entries] };
      });
      syncNow(); setCreds(made);
    } catch (x) { setErr(x.offline ? t('Pas de connexion à Internet. L’import crée les comptes de vos collègues et en a besoin.') : x.message); }
    setBusy(false);
  };
  if (creds) return html`<${Modal} title=${t('Import terminé')} onClose=${() => { closeModal(); onDone(); }}><div class="ok">${t('{c} classes, {e} saisies et {t} collègue(s) importés.', { c: sum.classes, e: sum.entries, t: creds.length })}</div>
    ${creds.length ? html`<p>${t('Voici les accès de vos collègues (leurs anciens codes ne sont pas repris). Donnez-les-leur : ils ne seront plus affichés.')}</p><div class="list">${creds.map(c => html`<div class="cred"><b>${c.name}</b><span class="sub">${t('Identifiant')} : <code>${c.username}</code> · ${t('Mot de passe')} : <code>${c.password}</code></span></div>`)}</div>
      <button class="btn soft" onClick=${async () => setToast((await copyText(creds.map(c => `${c.name} : ${c.username} / ${c.password}`).join('\n'))) ? t('Copié') : t('Copie impossible'))}><${Icon} n="copy" />${t('Copier la liste')}</button>` : null}
    <p class="hint">${t('Il reste à indiquer l’emploi du temps et les leçons prévues de chaque collègue dans Équipe.')}</p><button class="btn block" onClick=${() => { closeModal(); onDone(); }}>${t('Terminer')}</button><//>`;
  return html`<${Modal} title=${t('Importer l’ancienne sauvegarde')} onClose=${closeModal}>
    <p><b>${sum.name}</b> · ${sum.discipline} · ${sum.year}<br /><span class="sub">${sum.classes} ${t('classes')} · ${sum.teachers.length} ${t('enseignants')} · ${sum.entries} ${t('saisies')}</span></p>
    <${Field} label=${t('Qui êtes-vous dans cette sauvegarde ?')}><select class="input" value=${who} onChange=${(e) => setWho(e.target.value)}>${sum.teachers.map(x => html`<option value=${x.id}>${x.name}${x.isAP ? ' (AP)' : ''}</option>`)}</select><//>
    <p class="hint">${t('Les collègues déjà présents dans Rekort sont reconnus par leur nom de famille ; les autres reçoivent un nouveau compte (identifiant et mot de passe). Les classes, saisies, effectifs et emplois du temps sont repris ; les saisies déjà importées sont mises à jour sans doublon. Le plan de leçons de chaque classe est réparti à parts égales entre ses enseignants (modifiable ensuite).')}</p>
    ${err ? html`<div class="err">${err}</div>` : null}<button class="btn block" disabled=${busy} onClick=${run}>${busy ? t('Import en cours…') : t('Importer')}</button><//>`;
}

function Data() {
  const [msg, setMsg] = useState('');
  const exportJSON = () => {
    const d = state.data, mine = isAP() ? d : { ...d, entries: d.entries.filter(e => e.teacherId === myId()) };
    const blob = new Blob([JSON.stringify({ format: 'rekort', version: 1, exported: new Date().toISOString(), data: mine }, null, 1)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `rekort-${(d.dept.abbr || 'dept').toLowerCase()}-${todayISO()}.json`; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  };
  const exportRows = () => {
    const d = state.data, c = makeCtx(d), rows = [['Enseignant', 'Classe', 'Date', 'Début', 'Fin', 'Minutes', 'Type', 'Leçon n°', 'Titre', 'Digitalisée', 'Évalués', 'Moyenne ≥ 10', 'Motif', 'Note']];
    for (const e of c.entries.slice().sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))) rows.push([(c.teacher(e.teacherId) || {}).name, (c.cls(e.classId) || {}).name, e.date, e.start, e.end, e.minutes, e.type, e.n, e.title, e.digital ? 'oui' : '', e.eval ? e.eval.evaluated : '', e.eval ? e.eval.passed : '', e.reason, e.note]);
    exportCSV(rows, 'rekort-saisies-' + todayISO());
  };
  const pick = (e) => {
    const file = e.target.files[0]; e.target.value = ''; if (!file) return;
    const r = new FileReader();
    r.onload = () => {
      let j; try { j = JSON.parse(r.result); } catch { return setMsg(t('Ce fichier n’est pas une sauvegarde valide.')); }
      if (isOldBackup(j)) { if (!isAP()) return setMsg(t('Seul l’animateur pédagogique peut importer l’ancienne sauvegarde.')); openModal(() => html`<${ImportOld} json=${j} onDone=${() => setMsg(t('Import terminé.'))} />`); }
      else if (isNewBackup(j)) { const n = j.data; update(s => { const now = nextU(), ids = new Set(n.entries.map(x => x.id)); s.data = { ...s.data, entries: [...s.data.entries.filter(x => !ids.has(x.id)), ...n.entries.map(x => ({ ...x, u: now }))] }; }); syncNow(); setMsg(t('{n} saisies restaurées.', { n: n.entries.length })); }
      else setMsg(t('Format de sauvegarde non reconnu.'));
    };
    r.readAsText(file);
  };
  return html`<div class="page"><${Back} title=${t('Sauvegarde et import')} />
    <div class="card stack"><h3>${t('Exporter')}</h3><p class="sub">${t('Télécharge un fichier avec vos données : une copie de sécurité à garder.')}</p><button class="btn" style="align-self:flex-start" onClick=${exportJSON}><${Icon} n="download" />${t('Télécharger la sauvegarde')}</button></div>
    ${isAP() ? html`<div class="card stack"><h3>${t('Toutes les saisies (Excel)')}</h3><p class="sub">${t('Un tableau avec chaque séance : enseignant, classe, date, heures, leçon. S’ouvre dans Excel.')}</p><button class="btn soft" style="align-self:flex-start" onClick=${exportRows}><${Icon} n="download" />${t('Télécharger en CSV')}</button></div>` : null}
    <div class="card stack"><h3>${t('Importer')}</h3><p class="sub">${isAP() ? t('Choisissez le fichier de sauvegarde de l’ancienne version d’EasyProf (Profil › sauvegarde) pour reprendre vos classes, collègues et saisies, ou une sauvegarde Rekort.') : t('Choisissez une sauvegarde Rekort pour restaurer vos saisies.')}</p>
      <label class="btn soft" style="align-self:flex-start;cursor:pointer"><${Icon} n="upload" />${t('Choisir un fichier')}<input type="file" accept=".json,application/json" onChange=${pick} style="display:none" /></label>${msg ? html`<div class="ok">${msg}</div>` : null}</div></div>`;
}

export function Settings({ route }) {
  const [, , a, b] = route.split('/'); // /settings/<a>/<b>
  if (!isAP() && ['dept', 'year', 'classes', 'team', 'regul'].includes(a)) return html`<${Menu} />`;
  switch (a) {
    case 'profile': return html`<${Profile} />`; case 'dept': return html`<${Dept} />`; case 'year': return html`<${Year} />`; case 'classes': return html`<${Classes} />`;
    case 'team': return b ? html`<${TeacherDetail} id=${b} />` : html`<${Team} />`; case 'regul': return html`<${Regul} />`; case 'guide': return html`<${Guide} />`; case 'data': return html`<${Data} />`;
    default: return html`<${Menu} />`;
  }
}
