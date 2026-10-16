// Réglages : profil, établissement, année scolaire, classes, régularisations, sauvegarde et import.
import { html, useState } from '../vendor/preact-htm.js';
import { t, getLang } from '../i18n.js';
import { Icon } from '../icons.js';
import { Field, PasswordInput, DraftInput, SaveBar, askLogout, isInstalled, Seg, Chip, Empty, Modal, openModal, closeModal, confirmDialog, copyText, num1 } from '../ui.js';
import { api } from '../api.js';
import { state, update, setUI, setLanguage, setToast, logout, isAP, myId, me, flush, nextU, setToken, renameSelf } from '../store.js';
import { applyTiming, saveAssign, removeAssign, saveDept, saveClass, deleteClass, saveTeacher, saveRegul, deleteRegul, replaceMeta, replaceStartRegul, uid } from '../actions.js';
import { makeCtx, catchUp } from '../calc.js';
import * as D from '../dates.js';
import { Team, TeacherDetail, showCredentials } from './team.js';
import { ProgramFields, officialFor, isEmptyProgram, totalHours } from './program.js';
import { Guide } from './guide.js';
import { defaultTerms, defaultCalendar } from '../defaults.js';
import { REASONS } from '../consts.js';
import { fmt, todayISO, DEFAULT_BREAKS } from '../dates.js';
import { letterText, defaultLetter, showArms } from '../letterhead.js';
import { exportCSV } from '../exports.js';
import { isOldBackup, isNewBackup, summarize, convert, surname, remapBackup } from '../import-old.js';
import { syncNow } from '../sync.js';

const Back = ({ title, children }) => html`<div class="page-h"><div class="row"><a class="icon-btn" href="#/settings" aria-label=${t('Retour')}><${Icon} n="left" /></a><h1>${title}</h1></div>${children}</div>`;

function Menu() {
  const ap = isAP(), groups = [
    [t('Mon compte'), [
      ['#/settings/profile', 'user', t('Mon profil'), t('Nom, téléphone, identifiant, mot de passe, langue')],
      ['#/settings/guide', 'info', t('Mode d’emploi'), t('Comment utiliser Rekort, pas à pas')]]],
    ...(ap ? [
      [t('Établissement et fiches'), [
        ['#/settings/dept', 'school', t('En-tête, durée des cours et pauses'), t('Nom de l’école, texte imprimé en haut des fiches, durée d’une heure de cours, pauses')],
        ['#/settings/year', 'calendar', t('Année scolaire et calendrier'), t('Dates des trimestres, vacances, jours sans cours')]]],
      [t('Classes et programme'), [
        ['#/settings/classes', 'book', t('Classes et leçons prévues'), t('Les classes, leurs effectifs, et pour chacune le nombre de leçons et d’heures prévues pour l’année')]]],
      [t('Équipe'), [
        ['#/settings/team', 'users', t('Collègues et emplois du temps'), t('Créer les comptes, mots de passe, cours de la semaine de chaque collègue')]]],
      [t('Données'), [
        ['#/settings/regul', 'clock', t('Heures hors application'), t('Compter des heures faites avant Rekort')],
        ['#/settings/data', 'download', t('Sauvegarde et import'), t('Exporter, importer une sauvegarde ou l’ancienne version')]]]]
    : [[t('Données'), [['#/settings/data', 'download', t('Sauvegarde et import'), t('Exporter vos données')]]]]),
  ];
  return html`<div class="page"><div class="page-h"><h1>${t('Réglages')}</h1></div>
    ${groups.map(([title, items]) => html`<h3 class="grp" style="margin:14px 4px 6px">${title}</h3><div class="card"><div class="list">${items.map(([href, ic, title, sub]) => html`<a class="item" href=${href} style="text-decoration:none;color:inherit"><div class="dot"><${Icon} n=${ic} /></div><div class="grow"><b>${title}</b><span>${sub}</span></div><${Icon} n="right" size="18" /></a>`)}</div></div>`)}
    <p class="sub" style="text-align:center">Rekort · ${t('Département')} ${state.data.dept.name}</p></div>`;
}

function RecoveryCard() {
  const [pw, setPw] = useState(''), [err, setErr] = useState('');
  const go = async (e) => { e.preventDefault(); setErr(''); try { const r = await api('/me/recovery', { password: pw }, state.session.token); setPw(''); update(s => { s.recovery = r.recovery; }); } catch (x) { setErr(x.message); } };
  return html`<form class="card stack" onSubmit=${go}><h3>${t('Code de récupération')}</h3><p class="sub">${t('Il permet de retrouver votre accès si vous oubliez votre mot de passe. Il s’affiche une seule fois : notez-le. Créer un nouveau code annule l’ancien.')}</p>
    <${Field} label=${t('Votre mot de passe')}><${PasswordInput} class="input" autocomplete="current-password" value=${pw} onInput=${(e) => setPw(e.target.value)} required /><//>
    ${err ? html`<div class="err">${err}</div>` : null}<button class="btn soft" style="align-self:flex-start">${t('Créer un nouveau code')}</button></form>`;
}

function OwnUsername() {
  const [v, setV] = useState(state.session.username), [busy, setBusy] = useState(false);
  const save = async () => {
    const u = v.trim().toLowerCase(); if (!u || u === state.session.username) return setV(state.session.username);
    setBusy(true);
    try { const r = await api('/team/rename', { teacherId: myId(), username: u }, state.session.token); renameSelf(r.username, r.token); replaceMeta(r.meta); setToast(t('Identifiant modifié.')); }
    catch (x) { setToast(x.message, 'bad'); setV(state.session.username); } setBusy(false);
  };
  return html`<${Field} label=${t('Identifiant')} hint=${t('Ce que vous tapez pour vous connecter (3 à 24 caractères). Après modification, utilisez le nouveau.')}><input class="input" value=${v} disabled=${busy} autocapitalize="none" autocomplete="off" onInput=${(e) => setV(e.target.value)} onChange=${save} /><//>`;
}

function Profile() {
  const m = me(), [pw, setPw] = useState({ old: '', password: '' }), [msg, setMsg] = useState(null);
  const change = async (e) => { e.preventDefault(); setMsg(null); try { const r = await api('/me/password', pw, state.session.token); setToken(r.token); setMsg({ ok: t('Mot de passe modifié.') }); setPw({ old: '', password: '' }); } catch (x) { setMsg({ err: x.message }); } };
  const inst = window.__epInstall;
  return html`<div class="page"><${Back} title=${t('Mon profil')} />
    <div class="card stack"><div class="grid2"><${Field} label=${t('Nom complet')}><${DraftInput} class="input" value=${m ? m.name : ''} onChange=${(e) => e.target.value.trim() && saveTeacher(myId(), { name: e.target.value.trim() })} /><//>
      <${Field} label=${t('Téléphone WhatsApp')}><${DraftInput} class="input" inputmode="tel" value=${m ? m.phone || '' : ''} onChange=${(e) => saveTeacher(myId(), { phone: e.target.value.trim() })} /><//></div>
      ${isAP() ? html`<${OwnUsername} />` : html`<div class="row"><span class="lab">${t('Identifiant')}</span><b>${state.session.username}</b></div>`}
      <div class="row"><${Chip} tone="info">${isAP() ? t('Animateur pédagogique') : t('Enseignant')}<//></div>
      <div class="row"><span class="lab">${t('Langue')}</span><${Seg} options=${[{ id: 'fr', label: 'Français' }, { id: 'en', label: 'English' }]} value=${state.lang} onChange=${setLanguage} /></div></div>
    <form class="card stack" onSubmit=${change}><h3>${t('Changer mon mot de passe')}</h3><div class="grid2"><${Field} label=${t('Mot de passe actuel')}><${PasswordInput} class="input" autocomplete="current-password" value=${pw.old} onInput=${(e) => setPw({ ...pw, old: e.target.value })} required /><//>
      <${Field} label=${t('Nouveau mot de passe')} hint=${t('Au moins 6 caractères.')}><${PasswordInput} class="input" autocomplete="new-password" value=${pw.password} onInput=${(e) => setPw({ ...pw, password: e.target.value })} required /><//></div>
      ${msg && msg.ok ? html`<div class="ok">${msg.ok}</div>` : null}${msg && msg.err ? html`<div class="err">${msg.err}</div>` : null}<button class="btn" style="align-self:flex-start">${t('Changer le mot de passe')}</button></form>
    ${isAP() ? html`<${RecoveryCard} />` : null}
    <div class="card stack"><h3>${t('Synchronisation')}</h3><p class="sub">${state.sync.last ? t('Dernière synchronisation : {h} (il y a {m} min).', { h: new Date(state.sync.last).toLocaleTimeString(state.lang === 'en' ? 'en-GB' : 'fr-FR', { hour: '2-digit', minute: '2-digit' }), m: Math.max(0, Math.round((Date.now() - state.sync.last) / 60000)) }) : t('Pas encore synchronisé sur cet appareil.')} ${t('Vos saisies partent toutes seules dès qu’il y a du réseau ; celles de vos collègues arrivent à l’ouverture de l’application, puis toutes les 3 minutes.')}</p>
      <button class="btn soft" style="align-self:flex-start" onClick=${() => { syncNow(); setToast(t('Synchronisation lancée.')); }}><${Icon} n="refresh" />${t('Synchroniser maintenant')}</button></div>
    <div class="card stack"><h3>${t('Cet appareil')}</h3>${isInstalled() ? html`<button class="btn accent" disabled><${Icon} n="check" />${t('Rekort est installé sur cet appareil')}</button>
        <button class="btn soft" onClick=${() => openModal(() => html`<${Modal} title=${t('Désinstaller Rekort')} onClose=${closeModal}><p>${t('Une application web ne peut pas se désinstaller elle-même : c’est le téléphone qui le fait, en deux gestes.')}</p><ol class="guide"><li>${t('Fermez Rekort, puis appuyez longuement sur son icône sur l’écran d’accueil.')}</li><li>${t('Choisissez « Désinstaller » (ou « Supprimer », « Retirer de l’écran d’accueil »).')}</li></ol><p class="sub">${t('Vos données restent sur le serveur : en réinstallant et en vous reconnectant, vous les retrouvez.')}</p><button class="btn block" onClick=${closeModal}>${t('J’ai compris')}</button><//>`)}><${Icon} n="trash" />${t('Désinstaller…')}</button>`
      : inst ? html`<button class="btn accent" onClick=${() => confirmDialog({ title: t('Installer Rekort ?'), message: t('Rekort sera ajouté à l’écran d’accueil de cet appareil, comme une application, et s’ouvrira même sans Internet.'), confirm: t('Installer'), onConfirm: async () => { inst.prompt(); await inst.userChoice; window.__epInstall = null; update(() => { }); } })}><${Icon} n="download" />${t('Installer Rekort sur ce téléphone')}</button>` : html`<p class="sub">${t('Pour installer l’application : menu du navigateur › « Ajouter à l’écran d’accueil » ou « Installer l’application ».')}</p>`}
      <button class="btn soft" onClick=${() => askLogout(logout)}><${Icon} n="logout" />${t('Se déconnecter')}</button>
      <button class="btn danger" onClick=${() => confirmDialog({ title: t('Effacer les données de cet appareil ?'), message: t('Vos données restent enregistrées sur le serveur et reviendront à la prochaine connexion. Les saisies pas encore synchronisées seraient perdues.'), confirm: t('Effacer et se déconnecter'), danger: true, onConfirm: () => logout({ wipe: true }) })}>${t('Se déconnecter et effacer cet appareil')}</button></div>
    <${SaveBar} label=${t('Enregistrer et revenir aux réglages')} /></div>`;
}

function Dept() {
  const d = state.data.dept, h = d.header || {}, set = (patch) => { saveDept(patch); setToast(t('Enregistré.')); }, seth = (k, v) => set({ header: { ...h, [k]: v } });
  return html`<div class="page"><${Back} title=${t('Établissement et en-tête')} /><div class="card stack">
    <${Field} label=${t('Établissement')}><${DraftInput} class="input" value=${d.name} onChange=${(e) => set({ name: e.target.value.trim() })} /><//>
    <div class="grid2"><${Field} label=${t('Discipline')}><${DraftInput} class="input" value=${d.discipline} onChange=${(e) => set({ discipline: e.target.value.trim() })} /><//><${Field} label=${t('Abréviation')}><${DraftInput} class="input" value=${d.abbr} maxlength="8" onChange=${(e) => set({ abbr: e.target.value.trim().toUpperCase() })} /><//></div>
    <${Field} group label=${t('Système')}><${Seg} options=${[{ id: 'anglophone', label: t('Anglophone') }, { id: 'francophone', label: t('Francophone') }]} value=${d.system} onChange=${(v) => set({ system: v })} /><//>
    <div class="grid2"><${Field} label=${t('Année scolaire')}><${DraftInput} class="input" value=${d.year} placeholder="2026/2027" onChange=${(e) => set({ year: e.target.value.trim() })} /><//><${Field} label=${t('Durée d’une leçon (heures)')} hint=${t('Sert à estimer les leçons quand aucun plan n’est défini.')}><${DraftInput} class="input" type="number" step="0.5" min="0.5" value=${d.lh} onChange=${(e) => set({ lh: +e.target.value || 2 })} /><//></div></div>
    <div class="card stack"><h3>${t('En-tête de la fiche d’inspection')}</h3><p class="sub">${t('C’est le texte imprimé en haut des fiches : le français à gauche, l’anglais à droite, les armoiries au centre. Remplissez la région et le département : le texte est écrit pour vous. Vous pouvez aussi le modifier librement ci-dessous.')}</p>
      <div class="grid2"><${Field} label=${t('Région')}><${DraftInput} class="input" value=${h.region || ''} placeholder=${t('Nord')} onChange=${(e) => seth('region', e.target.value.trim())} /><//><${Field} label=${t('Département (division)')}><${DraftInput} class="input" value=${h.division || ''} placeholder=${t('Bénoué')} onChange=${(e) => seth('division', e.target.value.trim())} /><//></div>
      <${Field} label=${t('Contact (facultatif)')} hint=${t('Ex. : BP 548 Garoua · Tél : 22 15 68 07 · dresnord@gmail.com')}><${DraftInput} class="input" value=${h.contact || ''} onChange=${(e) => seth('contact', e.target.value.trim())} /><//>
      <${Field} label=${t('Texte à gauche (français)')} hint=${t('Une ligne par ligne imprimée ; la première est en gras.')}><${DraftInput} tag="textarea" class="input" rows="6" value=${letterText(h, 'fr')} onChange=${(e) => seth('fr', e.target.value.trim() === defaultLetter(h, 'fr') ? '' : e.target.value.trim())} /><//>
      <${Field} label=${t('Texte à droite (anglais)')}><${DraftInput} tag="textarea" class="input" rows="6" value=${letterText(h, 'en')} onChange=${(e) => seth('en', e.target.value.trim() === defaultLetter(h, 'en') ? '' : e.target.value.trim())} /><//>
      <label class="opt"><input type="checkbox" checked=${showArms(h)} onChange=${(e) => seth('arms', e.target.checked ? '' : '0')} /><span>${t('Afficher les armoiries du Cameroun au centre')}</span></label>
      <div class="row"><button class="btn soft sm" onClick=${() => set({ header: { ...h, fr: '', en: '' } })}>${t('Rétablir le texte automatique')}</button></div></div>
    <div class="card stack"><h3>${t('Durée d’une heure de cours')}</h3><p class="sub">${t('Dans certains établissements, une heure de cours dure 50 minutes (de 7 h 30 à 8 h 20, puis de 8 h 20 à 9 h 10…). Choisissez la durée : chaque période compte alors pour 1 h dans les heures dues et faites. Les heures de fin se calculent à partir de cette durée.')}</p>
      <${Field} label=${t('Une heure de cours dure')}><select class="input" value=${d.period || 60} onChange=${(e) => applyTiming({ period: +e.target.value })}>${[60, 55, 50, 45, 40].map(m => html`<option value=${m}>${m} min</option>`)}</select><//>
      <div class="row"><button class="btn soft sm" onClick=${() => applyTiming({ period: 50, breaks: [{ f: '10:00', t: '10:15' }, { f: '12:45', t: '13:20' }] })}>${t('Modèle DGCAST : 50 min, pauses 10:00 et 12:45')}</button></div></div>
    <div class="card stack"><h3>${t('Pauses de la journée')}</h3><p class="sub">${t('Un cours qui commence avant une pause et finit après ne la compte pas dans sa durée. Exemple : de 9 h 30 à 11 h 45 avec une pause de 10 h 30 à 10 h 45 = 2 h.')}</p>
      ${(d.breaks || DEFAULT_BREAKS).map((b, i, all) => html`<div class="row" style="gap:8px"><input class="input" type="time" value=${b.f} onChange=${(e) => applyTiming({ breaks: all.map((x, j) => (j === i ? { ...x, f: e.target.value } : x)) })} /><span>→</span><input class="input" type="time" value=${b.t} onChange=${(e) => applyTiming({ breaks: all.map((x, j) => (j === i ? { ...x, t: e.target.value } : x)) })} />
        <button class="icon-btn" onClick=${() => applyTiming({ breaks: all.filter((_, j) => j !== i) })} aria-label=${t('Supprimer')}><${Icon} n="trash" /></button></div>`)}
      <div class="row"><button class="btn soft sm" onClick=${() => applyTiming({ breaks: [...(d.breaks || DEFAULT_BREAKS), { f: '10:00', t: '10:15' }] })}><${Icon} n="plus" />${t('Ajouter une pause')}</button></div></div>
    <${SaveBar} label=${t('Enregistrer et revenir aux réglages')} /></div>`;
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
      <p class="hint" style="margin-top:8px">${t('« Non dû » : ces heures sont retirées des heures dues (pas de faute de l’enseignant). « Absence » : elles restent dues mais ne sont pas faites.')}</p></div>
    <${SaveBar} label=${t('Enregistrer et revenir aux réglages')} /></div>`;
}

function ClassEdit({ cls }) {
  const [f, setF] = useState({ name: cls ? cls.name : '', level: cls ? cls.level : '', cycle: cls ? cls.cycle : '1er', total: cls ? cls.effectif.total || '' : '', girls: cls ? cls.effectif.girls || '' : '', boys: cls ? cls.effectif.boys || '' : '' });
  const save = () => saveClass({ id: cls && cls.id, name: f.name.trim(), level: f.level.trim(), cycle: f.cycle, effectif: { total: +f.total || (+f.girls || 0) + (+f.boys || 0), girls: +f.girls || 0, boys: +f.boys || 0 } });
  const go = (e) => { e.preventDefault(); save(); closeModal(); setToast(t('Classe enregistrée.')); };
  const again = () => { if (!f.name.trim()) return; save(); setToast(t('« {n} » enregistrée. Vous pouvez en ajouter une autre.', { n: f.name.trim() })); setF({ name: '', level: f.level, cycle: f.cycle, total: '', girls: '', boys: '' }); };
  return html`<${Modal} title=${cls ? t('Modifier la classe') : t('Nouvelle classe')} onClose=${closeModal}><form class="stack" onSubmit=${go}>
    <${Field} label=${t('Nom de la classe')}><input class="input" value=${f.name} onInput=${(e) => setF({ ...f, name: e.target.value })} placeholder=${t('Form 3 A  ou  3e A')} required /><//>
    <${Field} label=${t('Niveau')}><input class="input" value=${f.level} onInput=${(e) => setF({ ...f, level: e.target.value })} placeholder=${t('Form 3 / 3e / Lower Sixth…')} /><//>
    <${Field} group label=${t('Cycle')}><${Seg} full options=${[{ id: '1er', label: t('1er cycle') }, { id: '2nd', label: t('2nd cycle') }]} value=${f.cycle} onChange=${(v) => setF({ ...f, cycle: v })} /><//>
    <div class="grid3"><${Field} label=${t('Effectif')}><input class="input" type="number" min="0" inputmode="numeric" value=${f.total} onInput=${(e) => setF({ ...f, total: e.target.value })} /><//><${Field} label=${t('Filles')}><input class="input" type="number" min="0" inputmode="numeric" value=${f.girls} onInput=${(e) => setF({ ...f, girls: e.target.value })} /><//><${Field} label=${t('Garçons')}><input class="input" type="number" min="0" inputmode="numeric" value=${f.boys} onInput=${(e) => setF({ ...f, boys: e.target.value })} /><//></div>
    <button class="btn block">${t('Enregistrer')}</button>${cls ? null : html`<button type="button" class="btn soft block" disabled=${!f.name.trim()} onClick=${again}>${t('Enregistrer et ajouter une autre classe')}</button>`}</form><//>`;
}
const USUAL = {
  anglophone: [['Form 1 A', 'Form 1', '1er'], ['Form 1 B', 'Form 1', '1er'], ['Form 2 A', 'Form 2', '1er'], ['Form 2 B', 'Form 2', '1er'], ['Form 3 A', 'Form 3', '1er'], ['Form 3 B', 'Form 3', '1er'], ['Form 4 Arts', 'Form 4', '1er'], ['Form 4 Science', 'Form 4', '1er'], ['Form 5 Arts', 'Form 5', '1er'], ['Form 5 Science', 'Form 5', '1er'], ['Lower Sixth Arts', 'Lower Sixth', '2nd'], ['Upper Sixth Arts', 'Upper Sixth', '2nd']],
  francophone: [['6e A', '6e', '1er'], ['5e A', '5e', '1er'], ['4e A', '4e', '1er'], ['3e A', '3e', '1er'], ['2nde A', '2nde', '2nd'], ['1ère A', '1ère', '2nd'], ['Tle A', 'Tle', '2nd']],
};
/** Enseignants concernés par une classe : ceux qui y sont rattachés ; dans un département à un seul enseignant, c'est lui d'office. */
const progRows = (ctx, c) => { const mine = ctx.assign.filter(a => a.classId === c.id); return ctx.teachers.length === 1 && !mine.length ? [{ teacherId: ctx.teachers[0].id, classId: c.id, th: 0, pr: 0, hth: 0, hpr: 0, hours: 0 }] : mine; };

/** Programme de l'année d'une classe : pour chaque enseignant, leçons et heures prévues (théorie / TP). Alimente la fiche pédagogique. */
function ClassProgram({ c, ctx, next }) {
  const rows = progRows(ctx, c), free = ctx.teachers.filter(x => !rows.some(a => a.teacherId === x.id)), [add, setAdd] = useState(''), off = officialFor(c);
  const fill = (a) => saveAssign({ teacherId: a.teacherId, classId: c.id, ...off });
  return html`<div class="stack" style="gap:10px;border-top:1px dashed var(--line);padding-top:10px">
    ${rows.length ? null : html`<p class="sub">${t('Aucun enseignant n’est encore rattaché à cette classe : ajoutez-le ci-dessous, puis indiquez ses leçons et heures prévues.')}</p>`}
    ${rows.map(a => html`<div class="card flat stack" style="gap:8px"><div class="row" style="flex-wrap:nowrap"><b class="grow">${(ctx.teacher(a.teacherId) || {}).name || '?'}</b>${ctx.teachers.length > 1 ? html`<button class="icon-btn" onClick=${() => removeAssign(a.teacherId, c.id)} aria-label=${t('Retirer')}><${Icon} n="trash" /></button>` : null}</div>
      <${ProgramFields} a=${a} teacherId=${a.teacherId} classId=${c.id} />
      ${off && isEmptyProgram(a) ? html`<button class="btn soft sm" style="align-self:flex-start" onClick=${() => { fill(a); setToast(t('Programme du niveau repris : à vérifier.')); }}>${t('Remplir avec le programme du niveau ({l} leçons, {h} h)', { l: off.th + off.pr, h: off.hth + off.hpr })}</button>` : null}</div>`)}
    ${free.length ? html`<div class="row"><select class="input grow" value=${add} onChange=${(e) => setAdd(e.target.value)}><option value="">${t('Ajouter un enseignant à cette classe…')}</option>${free.map(x => html`<option value=${x.id}>${x.name}</option>`)}</select><button class="btn" disabled=${!add} onClick=${() => { saveAssign({ teacherId: add, classId: c.id }); setAdd(''); }}>${t('Ajouter')}</button></div>` : null}
    <button class="btn" onClick=${() => { if (document.activeElement && document.activeElement.blur) document.activeElement.blur(); setTimeout(() => { setToast(t('« {n} » enregistrée ✓', { n: c.name })); setUI({ cprog: next ? next.id : '' }); if (!next) window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }); }, 120); }}><${Icon} n="check" />${next ? t('Enregistrer et passer à {n}', { n: next.name }) : t('Enregistrer')}</button></div>`;
}
function Classes() {
  const ctx = makeCtx(state.data);
  const missing = (USUAL[state.data.dept.system] || USUAL.anglophone).filter(([n]) => !ctx.classes.some(c => c.name.toLowerCase() === n.toLowerCase()));
  const addUsual = () => { missing.forEach(([name, level, cycle]) => saveClass({ name, level, cycle, effectif: { total: 0, girls: 0, boys: 0 } })); setToast(t('{n} classe(s) ajoutée(s). Indiquez leurs effectifs.', { n: missing.length })); };
  return html`<div class="page"><${Back} title=${t('Classes')}><button class="btn" onClick=${() => openModal(() => html`<${ClassEdit} />`)}><${Icon} n="plus" />${t('Nouvelle classe')}</button><//>
    <p class="sub">${t('Tout ce qui concerne une classe est ici : son effectif, et, pour chaque enseignant qui y intervient, le nombre de leçons et d’heures prévues pour l’année. Ces chiffres alimentent la fiche pédagogique et les taux de couverture.')}</p>
    ${(() => { const fillable = ctx.classes.flatMap(c => progRows(ctx, c).filter(a => isEmptyProgram(a) && officialFor(c)).map(a => [c, a])); return fillable.length ? html`<button class="btn soft" style="align-self:flex-start" onClick=${() => confirmDialog({ title: t('Remplir {n} programmes d’après le niveau ?', { n: fillable.length }), message: t('Les leçons et heures du programme officiel de chaque niveau (Form 1 à Upper Sixth, d’après votre ancienne sauvegarde) seront reprises pour les classes encore vides. Vérifiez-les ensuite, une classe après l’autre.'), confirm: t('Remplir'), onConfirm: () => { fillable.forEach(([c, a]) => saveAssign({ teacherId: a.teacherId, classId: c.id, ...officialFor(c) })); setToast(t('{n} programmes repris : à vérifier.', { n: fillable.length })); } })}><${Icon} n="check" />${t('Remplir les programmes d’après le niveau ({n} classes)', { n: fillable.length })}</button>` : null; })()}
    ${missing.length && !ctx.classes.length ? html`<button class="btn soft" style="align-self:flex-start" onClick=${addUsual}><${Icon} n="plus" />${t('Ajouter les classes habituelles')}</button>`
      : missing.length ? html`<button class="btn ghost sm" style="align-self:flex-start" onClick=${() => confirmDialog({ title: t('Ajouter {n} classes habituelles ?', { n: missing.length }), message: missing.map(m => m[0]).join(', ') + '. ' + t('Si vous avez renommé des classes, elles seront ajoutées en plus.'), confirm: t('Ajouter'), onConfirm: addUsual })}>${t('Ajouter des classes habituelles…')}</button>` : null}
    ${!ctx.classes.length ? html`<div class="card"><${Empty} icon="🏫" title=${t('Aucune classe')} text=${t('Ajoutez les classes où le département enseigne.')} /></div>` : ctx.classes.map(c => html`<div class="card stack" style="gap:10px"><div class="row" style="flex-wrap:nowrap"><div class="dot">📘</div><div class="grow"><b>${c.name}</b><span class="sub" style="display:block">${c.cycle === '2nd' ? t('2nd cycle') : t('1er cycle')} · ${(c.effectif || {}).total || 0} ${t('élèves')}</span></div>
      <button class="icon-btn" onClick=${() => openModal(() => html`<${ClassEdit} cls=${c} />`)} aria-label=${t('Modifier')}><${Icon} n="edit" /></button>
      <button class="icon-btn" onClick=${() => confirmDialog({ title: t('Supprimer la classe {c} ?', { c: c.name }), message: t('Les saisies déjà faites dans cette classe restent dans l’historique.'), confirm: t('Supprimer'), danger: true, onConfirm: () => deleteClass(c.id) })} aria-label=${t('Supprimer')}><${Icon} n="trash" /></button></div>
      <details open=${state.ui.cprog === c.id} onToggle=${(e) => { if (e.target.open && state.ui.cprog !== c.id) setUI({ cprog: c.id }); else if (!e.target.open && state.ui.cprog === c.id) setUI({ cprog: '' }); }}><summary><b>${t('Programme de l’année')}</b> ${progRows(ctx, c).some(a => !isEmptyProgram(a)) ? html`<${Chip} tone="ok">✓ ${progRows(ctx, c).reduce((s, a) => s + (+a.th || 0) + (+a.pr || 0), 0)} ${t('leçons')} · ${progRows(ctx, c).reduce((s, a) => s + totalHours(a), 0)} h<//>` : html`<${Chip} tone="warn">${t('à compléter')}<//>`}</summary>
        <${ClassProgram} c=${c} ctx=${ctx} next=${ctx.classes[ctx.classes.findIndex(x => x.id === c.id) + 1]} /></details></div>`)}
    ${ctx.classes.length ? html`<div class="card stack"><p class="sub">${t('Chaque classe est enregistrée dès que vous touchez « Enregistrer » dans sa fenêtre. Quand la liste est complète, confirmez ci-dessous.')}</p>
      ${(ctx.dept.setup || {}).classes ? html`<${Chip} tone="ok">✓ ${t('Classes confirmées')}<//>` : null}
      <button class="btn" style="align-self:flex-start" onClick=${() => { saveDept({ setup: { ...(ctx.dept.setup || {}), classes: true } }); setToast(t('Classes confirmées : {n}.', { n: ctx.classes.length })); location.hash = '#/settings'; }}><${Icon} n="check" />${t('Confirmer mes {n} classes', { n: ctx.classes.length })}</button></div>` : null}</div>`;
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

/** Reprise d'une sauvegarde Rekort complète sur un nouveau serveur : recrée les comptes des collègues (nouveaux mots de passe), puis remet classes, emplois du temps et saisies. */
function RestoreFull({ json, onDone }) {
  const n = json.data, [busy, setBusy] = useState(false), [err, setErr] = useState(''), [creds, setCreds] = useState(null);
  const others = (n.teachers || []).filter(x => !x.deleted && x.username !== state.session.username && x.role !== 'ap');
  const go = async () => {
    setBusy(true); setErr('');
    try {
      const idMap = {}, out = [], apOld = (n.teachers || []).find(x => !x.deleted && (x.username === state.session.username || x.role === 'ap'));
      if (apOld) idMap[apOld.id] = myId();
      for (const o of others) {
        let r; try { r = await api('/team/add', { name: o.name, short: o.short, phone: o.phone, username: o.username }, state.session.token); }
        catch (x) { if (x.code === 'username_taken' || /utilisé/.test(x.message || '')) r = await api('/team/add', { name: o.name, short: o.short, phone: o.phone }, state.session.token); else throw x; }
        idMap[o.id] = r.teacher.id; replaceMeta(r.meta); out.push({ name: o.name, username: r.username, password: r.password, phone: o.phone });
      }
      const R = remapBackup(n, idMap, nextU());
      const slots = (old) => ((n.teachers || []).find(x => x.id === old) || {}).slots || [];
      update(s => {
        const teachers = s.data.teachers.map(tc => { const old = Object.keys(idMap).find(k => idMap[k] === tc.id); return old ? { ...tc, slots: slots(old), phone: tc.phone || ((n.teachers.find(x => x.id === old) || {}).phone || ''), u: nextU() } : tc; });
        const ids = new Set(R.entries.map(x => x.id));
        s.data = { ...s.data, dept: R.dept ? { ...R.dept, id: s.data.dept.id } : s.data.dept, teachers, classes: R.classes, assign: R.assign, regul: R.regul, entries: [...s.data.entries.filter(x => !ids.has(x.id)), ...R.entries] };
      });
      syncNow(); setCreds({ out, entries: R.entries.length, dropped: R.dropped });
    } catch (x) { setErr(x.message || String(x)); } setBusy(false);
  };
  if (creds) return html`<${Modal} title=${t('Reprise terminée')} onClose=${() => { closeModal(); onDone(); }}>
    <p>${t('{e} saisies, {c} classes et {k} collègues repris.', { e: creds.entries, c: n.classes.filter(c => !c.deleted).length, k: creds.out.length })}${creds.dropped ? ' ' + t('{d} saisies de collègues retirés n’ont pas été reprises.', { d: creds.dropped }) : ''}</p>
    <p class="sub">${t('Chaque collègue a un nouveau mot de passe. Envoyez-lui son accès (avec la nouvelle adresse) :')}</p>
    <div class="list">${creds.out.map(c => html`<div class="item"><div class="grow"><b>${c.name}</b><span>${c.username} · ${c.password}</span></div><button class="btn sm" onClick=${() => showCredentials(c)}>${t('Envoyer')}</button></div>`)}</div><//>`;
  return html`<${Modal} title=${t('Reprendre cette sauvegarde')} onClose=${closeModal}>
    <p>${t('Ce fichier contient {c} classes, {k} collègues et {e} saisies. Rekort va recréer les comptes des collègues (leur identifiant reste le même, leur mot de passe change), puis remettre classes, emplois du temps et saisies.', { c: (n.classes || []).filter(c => !c.deleted).length, k: others.length, e: (n.entries || []).length })}</p>
    ${err ? html`<div class="err" role="alert">${err}</div>` : null}<button class="btn block" disabled=${busy} onClick=${go}>${busy ? t('Reprise en cours…') : t('Reprendre')}</button><//>`;
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
      else if (isNewBackup(j) && isAP() && (j.data.teachers || []).length > 1 && (j.data.classes || []).length) openModal(() => html`<${RestoreFull} json=${j} onDone=${() => setMsg(t('Import terminé.'))} />`);
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
