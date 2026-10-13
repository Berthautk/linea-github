// Équipe : comptes des collègues, emplois du temps, leçons prévues dans chaque classe (animateur pédagogique).
import { html, useState } from '../vendor/preact-htm.js';
import { t } from '../i18n.js';
import { Icon } from '../icons.js';
import { Field, Chip, Empty, Modal, openModal, closeModal, confirmDialog, copyText, num1 } from '../ui.js';
import { api } from '../api.js';
import { state, myId, setToast } from '../store.js';
import { replaceMeta, saveTeacher, saveAssign, removeAssign, saveDept } from '../actions.js';
import { makeCtx } from '../calc.js';
import { syncNow } from '../sync.js';
import { dayName, fmt } from '../dates.js';
import { getLang } from '../i18n.js';

export function showCredentials({ name, username, password, fresh = true }) {
  const text = t('Rekort : bonjour {n}, voici votre accès.\nAdresse : {u}\nIdentifiant : {i}\nMot de passe : {p}\nVous pourrez changer le mot de passe dans Réglages › Mon profil.', { n: name, u: location.origin, i: username, p: password });
  openModal(() => html`<${Modal} title=${fresh ? t('Compte créé') : t('Nouveau mot de passe')} onClose=${closeModal}>
    <p>${t('Donnez ces informations à {n}. Le mot de passe ne sera plus affiché ensuite.', { n: name })}</p>
    <div class="card flat stack" style="gap:6px"><div class="row"><span class="lab">${t('Adresse')}</span><b>${location.origin}</b></div><div class="row"><span class="lab">${t('Identifiant')}</span><b>${username}</b></div><div class="row"><span class="lab">${t('Mot de passe')}</span><span class="code" style="padding:6px 14px;font-size:20px">${password}</span></div></div>
    <div class="row"><button class="btn soft grow" onClick=${async () => setToast((await copyText(text)) ? t('Copié') : t('Copie impossible'))}><${Icon} n="copy" />${t('Copier le message')}</button>
    <a class="btn grow" style="background:#25D366" target="_blank" rel="noreferrer" href=${'https://wa.me/?text=' + encodeURIComponent(text)}><${Icon} n="whatsapp" />${t('Envoyer par WhatsApp')}</a></div><//>`);
}

function AddTeacher() {
  const [f, setF] = useState({ name: '', phone: '', username: '', password: '' }), [err, setErr] = useState(''), [busy, setBusy] = useState(false);
  const go = async (e) => {
    e.preventDefault(); setBusy(true); setErr('');
    try { const r = await api('/team/add', f, state.session.token); replaceMeta(r.meta); closeModal(); showCredentials({ name: r.teacher.name, username: r.username, password: r.password }); syncNow(); }
    catch (x) { setErr(x.offline ? t('Pas de connexion à Internet. La création d’un compte en a besoin.') : x.message); }
    setBusy(false);
  };
  return html`<${Modal} title=${t('Ajouter un collègue')} onClose=${closeModal}><form class="stack" onSubmit=${go}>
    <${Field} label=${t('Nom complet')}><input class="input" value=${f.name} onInput=${(e) => setF({ ...f, name: e.target.value })} placeholder=${t('Mme ASTHA Noura')} required /><//>
    <${Field} label=${t('Téléphone WhatsApp (facultatif)')}><input class="input" inputmode="tel" value=${f.phone} onInput=${(e) => setF({ ...f, phone: e.target.value })} placeholder="+237…" /><//>
    <details><summary class="sub" style="cursor:pointer">${t('Choisir moi-même l’identifiant et le mot de passe')}</summary><div class="stack" style="margin-top:10px">
      <${Field} label=${t('Identifiant')} hint=${t('Laissez vide : il est créé à partir du nom.')}><input class="input" autocapitalize="none" value=${f.username} onInput=${(e) => setF({ ...f, username: e.target.value })} /><//>
      <${Field} label=${t('Mot de passe')} hint=${t('Laissez vide : un mot de passe de 6 caractères est généré.')}><input class="input" value=${f.password} onInput=${(e) => setF({ ...f, password: e.target.value })} /><//></div></details>
    ${err ? html`<div class="err" role="alert">${err}</div>` : null}<button class="btn block" disabled=${busy}>${busy ? t('Création…') : t('Créer le compte')}</button></form><//>`;
}

export function Team() {
  const ctx = makeCtx(state.data);
  return html`<div class="page"><div class="page-h"><div class="row"><a class="icon-btn" href="#/settings" aria-label=${t('Retour')}><${Icon} n="left" /></a><h1>${t('Équipe')}</h1></div><button class="btn" onClick=${() => openModal(() => html`<${AddTeacher} />`)}><${Icon} n="plus" />${t('Ajouter un collègue')}</button></div>
    <p class="sub">${t('Chaque collègue reçoit un identifiant et un mot de passe. Il retrouve ensuite ses classes, son emploi du temps et son avancement sur son téléphone.')}</p>
    <div class="card"><div class="list">${ctx.teachers.map(tc => { const n = ctx.assign.filter(a => a.teacherId === tc.id).length, sl = (tc.slots || []).length;
      return html`<a class="item" href=${'#/settings/team/' + tc.id} style="text-decoration:none;color:inherit"><div class="dot">${tc.role === 'ap' ? '⭐' : '🧑‍🏫'}</div><div class="grow"><b>${tc.name}${tc.id === myId() ? ' (' + t('vous') + ')' : ''}</b><span>${tc.username} · ${sl} ${t('créneau(x)')} · ${n} ${t('classe(s)')}</span></div>
        ${!sl || !n ? html`<${Chip} tone="warn">${t('à compléter')}<//>` : html`<${Chip} tone="ok">${t('prêt')}<//>`}<${Icon} n="right" size="18" /></a>`; })}</div></div>
    <div class="card row"><div class="grow"><b>${t('Tout est correct ?')}</b><p class="sub">${t('Quand les noms, identifiants, emplois du temps et leçons prévues sont bons, confirmez : l’étape disparaît de « Pour bien démarrer ».')}</p></div>
      ${(ctx.dept.setup || {}).team ? html`<${Chip} tone="ok">✓ ${t('Confirmé')}<//>` : html`<button class="btn" onClick=${() => { saveDept({ setup: { ...(ctx.dept.setup || {}), team: true, tt: true } }); setToast(t('Équipe confirmée.')); }}>${t('Tout est correct')}</button>`}</div></div>`;
}

const DAYS = [1, 2, 3, 4, 5, 6];
function OnlyDates({ dates, onChange }) {
  const [v, setV] = useState(''), lang = getLang();
  const add = () => { if (v && !dates.includes(v)) onChange([...dates, v].sort()); setV(''); };
  return html`<div><div class="row" style="gap:8px;flex-wrap:wrap"><span class="lab" style="width:100%">${t('Seulement à ces dates (facultatif)')}</span>
    ${dates.map(d => html`<button class="chip" type="button" onClick=${() => onChange(dates.filter(x => x !== d))} aria-label=${t('Retirer')}>${fmt(d, lang, { noYear: true })} ✕</button>`)}
    <input class="input" type="date" style="width:150px" value=${v} onInput=${(e) => setV(e.target.value)} /><button class="btn soft sm" type="button" disabled=${!v} onClick=${add}>${t('Ajouter la date')}</button></div></div>`;
}

function Slots({ tc, ctx }) {
  const lang = getLang(), slots = tc.slots || [];
  const set = (i, patch) => saveTeacher(tc.id, { slots: slots.map((s, j) => (j === i ? { ...s, ...patch } : s)) });
  const add = () => saveTeacher(tc.id, { slots: [...slots, { d: 1, c: (ctx.classes[0] || {}).id || '', h: 2, tm: '', st: '' }] });
  const del = (i) => saveTeacher(tc.id, { slots: slots.filter((_, j) => j !== i) });
  const total = slots.reduce((s, x) => s + (+x.h || 0), 0);
  return html`<div class="card"><div class="card-h"><h3>${t('Emploi du temps de la semaine')}</h3><${Chip} tone="info">${num1(total)} h / ${t('semaine')}<//></div>
    ${!ctx.classes.length ? html`<p class="sub">${t('Créez d’abord les classes.')}</p>` : null}
    <div class="stack" style="gap:10px">${slots.map((s, i) => html`<div class="card flat stack" style="padding:12px;gap:10px">
      <div class="slot-row">
        <select class="input" value=${s.d} onChange=${(e) => set(i, { d: +e.target.value })} aria-label=${t('Jour')}>${DAYS.map(d => html`<option value=${d}>${dayName(d % 7, lang)}</option>`)}</select>
        <div class="row" style="gap:6px;flex-wrap:nowrap"><input class="input" type="number" step="0.5" min="0" max="12" value=${s.h} onChange=${(e) => set(i, { h: +e.target.value || 0 })} aria-label=${t('Heures')} /><span class="sub">h</span></div>
        <button class="icon-btn" onClick=${() => del(i)} aria-label=${t('Supprimer')}><${Icon} n="trash" /></button>
        <select class="input full" value=${s.c} onChange=${(e) => set(i, { c: e.target.value })} aria-label=${t('Classe')}>${ctx.classes.map(c => html`<option value=${c.id}>${c.name}</option>`)}</select></div>
      <div class="grid2"><${Field} label=${t('Heure de début')}><input class="input" type="time" value=${s.st || ''} onChange=${(e) => set(i, { st: e.target.value })} /><//>
        <${Field} label=${t('Valable')}><select class="input" value=${s.tm || ''} onChange=${(e) => set(i, { tm: e.target.value })}><option value="">${t('toute l’année')}</option>${ctx.terms.map(x => html`<option value=${x.id}>${x.name}</option>`)}</select><//></div>
      <${OnlyDates} dates=${s.only || []} onChange=${(only) => set(i, { only })} /></div>`)}</div>
    <div class="row" style="margin-top:12px"><button class="btn soft" onClick=${add}><${Icon} n="plus" />${t('Ajouter un créneau')}</button></div>
    <p class="hint" style="margin-top:8px">${t('Un créneau = un jour, une classe, un nombre d’heures. Pour un cours de 2 h le lundi puis 3 h le mardi dans la même classe, ajoutez deux créneaux. Un créneau « valable le 1er trimestre » sert par exemple aux samedis de rattrapage de début d’année.')}</p></div>`;
}

function Plan({ tc, ctx }) {
  const mine = ctx.assign.filter(a => a.teacherId === tc.id), free = ctx.classes.filter(c => !mine.some(a => a.classId === c.id));
  const [add, setAdd] = useState('');
  const upd = (a, k, v) => saveAssign({ teacherId: tc.id, classId: a.classId, th: a.th, pr: a.pr, hours: a.hours, [k]: v });
  const tot = mine.reduce((s, a) => s + (+a.th || 0) + (+a.pr || 0), 0);
  return html`<div class="card"><div class="card-h"><h3>${t('Classes et leçons prévues')}</h3><${Chip} tone="info">${tot} ${t('leçons dans l’année')}<//></div>
    <p class="sub" style="margin-bottom:10px">${t('Indiquez, pour chaque classe de ce collègue, le nombre de leçons à faire dans l’année (programme). Rekort en déduit où il devrait en être chaque semaine et signale les retards.')}</p>
    ${mine.length ? html`<div class="tbl-wrap"><table class="tbl"><thead><tr><th>${t('Classe')}</th><th>${t('Leçons de théorie')}</th><th>${t('TP')}</th><th>${t('Heures prévues (facultatif)')}</th><th></th></tr></thead><tbody>
      ${mine.map(a => html`<tr><td>${(ctx.cls(a.classId) || {}).name || a.classId}</td>${['th', 'pr', 'hours'].map(k => html`<td><input class="input" type="number" min="0" inputmode="numeric" style="width:92px;min-height:40px" value=${a[k] || ''} onChange=${(e) => upd(a, k, +e.target.value || 0)} /></td>`)}<td><button class="icon-btn" onClick=${() => removeAssign(tc.id, a.classId)} aria-label=${t('Retirer')}><${Icon} n="x" /></button></td></tr>`)}</tbody></table></div>` : html`<${Empty} icon="📚" title=${t('Aucune classe pour ce collègue')} text=${t('Ajoutez ses classes ci-dessous.')} />`}
    ${free.length ? html`<div class="row" style="margin-top:12px"><select class="input grow" value=${add} onChange=${(e) => setAdd(e.target.value)}><option value="">${t('Ajouter une classe…')}</option>${free.map(c => html`<option value=${c.id}>${c.name}</option>`)}</select><button class="btn" disabled=${!add} onClick=${() => { saveAssign({ teacherId: tc.id, classId: add, th: 0, pr: 0, hours: 0 }); setAdd(''); }}><${Icon} n="plus" />${t('Ajouter')}</button></div>` : (!ctx.classes.length ? html`<p class="sub">${t('Créez d’abord les classes.')}</p>` : null)}</div>`;
}

function SetPassword({ tc }) {
  const [pw, setPw] = useState(''), [err, setErr] = useState(''), [busy, setBusy] = useState(false);
  const go = async (e) => {
    e.preventDefault(); setBusy(true); setErr('');
    try { const r = await api('/team/reset', { teacherId: tc.id, password: pw.trim() }, state.session.token); closeModal(); showCredentials({ name: tc.name, username: r.username, password: r.password, fresh: false }); }
    catch (x) { setErr(x.message); } setBusy(false);
  };
  return html`<${Modal} title=${t('Mot de passe de {n}', { n: tc.name })} onClose=${closeModal}><form class="stack" onSubmit=${go}>
    <p class="sub">${t('L’ancien mot de passe ne fonctionnera plus.')}</p>
    <${Field} label=${t('Nouveau mot de passe')} hint=${t('Au moins 6 caractères. Laissez vide pour en générer un.')}><input class="input" value=${pw} onInput=${(e) => setPw(e.target.value)} autocomplete="off" /><//>
    ${err ? html`<div class="err" role="alert">${err}</div>` : null}<button class="btn block" disabled=${busy}>${t('Enregistrer')}</button></form><//>`;
}

function Username({ tc }) {
  const [v, setV] = useState(tc.username), [busy, setBusy] = useState(false);
  const save = async () => {
    const u = v.trim().toLowerCase(); if (!u || u === tc.username) return setV(tc.username);
    setBusy(true);
    try { const r = await api('/team/rename', { teacherId: tc.id, username: u }, state.session.token); replaceMeta(r.meta); setToast(t('Identifiant modifié.')); syncNow(); }
    catch (x) { setToast(x.message, 'bad'); setV(tc.username); } setBusy(false);
  };
  return html`<${Field} label=${t('Identifiant')} hint=${t('Ce que le collègue tape pour se connecter. Exemple : son nom de famille.')}><input class="input" value=${v} disabled=${busy} autocapitalize="none" autocomplete="off" onInput=${(e) => setV(e.target.value)} onChange=${save} /><//>`;
}

export function TeacherDetail({ id }) {
  const ctx = makeCtx(state.data), tc = ctx.teacher(id);
  if (!tc) return html`<div class="page"><${Empty} title=${t('Collègue introuvable')}><a class="btn sm" href="#/settings/team">${t('Retour')}</a><//></div>`;
  const reset = () => openModal(() => html`<${SetPassword} tc=${tc} />`);
  const remove = () => confirmDialog({ title: t('Retirer {n} ?', { n: tc.name }), message: t('Son compte sera désactivé. Ses saisies restent dans les statistiques du département.'), confirm: t('Retirer'), danger: true,
    onConfirm: async () => { try { const r = await api('/team/remove', { teacherId: id }, state.session.token); replaceMeta(r.meta); location.hash = '#/settings/team'; syncNow(); } catch (x) { setToast(x.message, 'bad'); } } });
  return html`<div class="page"><div class="page-h"><div class="row"><a class="icon-btn" href="#/settings/team" aria-label=${t('Retour')}><${Icon} n="left" /></a><h1>${tc.name}</h1></div></div>
    <div class="card stack"><div class="grid2"><${Field} label=${t('Nom complet')}><input class="input" value=${tc.name} onChange=${(e) => e.target.value.trim() && saveTeacher(id, { name: e.target.value.trim() })} /><//>
      <${Field} label=${t('Téléphone WhatsApp')}><input class="input" inputmode="tel" value=${tc.phone || ''} onChange=${(e) => saveTeacher(id, { phone: e.target.value.trim() })} /><//></div>
      ${tc.id !== myId() ? html`<${Username} tc=${tc} />` : html`<div class="row"><span class="lab">${t('Identifiant')}</span><b>${tc.username}</b></div>`}
      ${tc.id !== myId() ? html`<div class="row"><button class="btn soft" onClick=${reset}><${Icon} n="lock" />${t('Définir le mot de passe')}</button><button class="btn danger" onClick=${remove}><${Icon} n="trash" />${t('Retirer du département')}</button></div>` : html`<p class="hint">${t('C’est votre compte : changez votre mot de passe dans Réglages › Mon profil.')}</p>`}</div>
    <${Slots} tc=${tc} ctx=${ctx} /><${Plan} tc=${tc} ctx=${ctx} /></div>`;
}
