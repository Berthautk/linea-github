// Composants d'interface réutilisables.
import { html, useEffect, useState } from './vendor/preact-htm.js';
import { Icon } from './icons.js';
import { t } from './i18n.js';
import { state, update } from './store.js';
import { REASONS } from './consts.js';

export const Chip = ({ tone = '', style, children }) => html`<span class=${'chip ' + tone} style=${style}>${children}</span>`;
// Champ : le libellé enveloppe la zone de saisie (accessible, et un appui sur le libellé active le champ). `group` pour les boutons à choix.
export const Field = ({ label, hint, children, class: c, group }) => group
  ? html`<div class=${'field ' + (c || '')} role="group" aria-label=${label}><span class="lab">${label}</span>${children}${hint ? html`<span class="hint">${hint}</span>` : null}</div>`
  : html`<label class=${'field ' + (c || '')}><span class="lab">${label}</span>${children}${hint ? html`<span class="hint">${hint}</span>` : null}</label>`;

export function Seg({ options, value, onChange, full }) {
  return html`<div class=${'seg ' + (full ? 'full' : '')} role="group">${options.map(o => html`<button type="button" aria-pressed=${o.id === value} class=${o.id === value ? 'on' : ''} onClick=${() => onChange(o.id)}>${o.label}</button>`)}</div>`;
}
export function Bar({ value, expected, tone }) {
  const w = Math.max(0, Math.min(100, value || 0));
  return html`<div class=${'bar ' + (tone || '')}><i style=${{ width: w + '%' }}></i>${expected != null ? html`<b style=${{ left: Math.min(99, Math.max(0, expected)) + '%' }} title=${t('Où vous devriez en être')}></b>` : null}</div>`;
}
export const Empty = ({ icon = '🌱', title, text, children }) => html`<div class="empty"><div class="big">${icon}</div><b>${title}</b>${text ? html`<p class="sub">${text}</p>` : null}${children}</div>`;
export const Hint = ({ children }) => html`<p class="hint">${children}</p>`;

/* fenêtre modale (feuille) */
export function Modal({ title, onClose, children }) {
  useEffect(() => { const k = (e) => e.key === 'Escape' && onClose(); window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k); }, []);
  return html`<div class="overlay" onClick=${(e) => e.target === e.currentTarget && onClose()}><div class="sheet" role="dialog" aria-modal="true" aria-label=${title}>
    <div class="row"><h2 class="grow">${title}</h2><button class="icon-btn" onClick=${onClose} aria-label=${t('Fermer')}><${Icon} n="x" /></button></div>${children}</div></div>`;
}
export const openModal = (render) => update(s => { s.modal = render; });
export const closeModal = () => update(s => { s.modal = null; });
export function confirmDialog({ title, message, confirm = t('Confirmer'), danger, onConfirm }) {
  openModal(() => html`<${Modal} title=${title} onClose=${closeModal}><p>${message}</p>
    <div class="row"><button class="btn soft grow" onClick=${closeModal}>${t('Annuler')}</button><button class=${'btn grow ' + (danger ? 'danger' : '')} onClick=${() => { closeModal(); onConfirm(); }}>${confirm}</button></div><//>`);
}
export function Toast() {
  const x = state.toast; if (!x) return null;
  return html`<div class=${'toast ' + (x.kind || '')} role="status">${x.msg}${x.action ? html`<button onClick=${() => { x.action.run(); update(s => { s.toast = null; }); }}>${x.action.label}</button>` : null}</div>`;
}

export function SyncChip({ onClick }) {
  const st = state.sync.status, last = state.sync.last;
  let cls = '', icon = 'cloud', label = t('Synchronisé');
  if (st === 'syncing') { icon = 'refresh'; label = t('Synchronisation…'); }
  else if (st === 'offline') { cls = 'off'; icon = 'cloudoff'; label = t('Hors ligne'); }
  else if (st === 'auth') { cls = 'err'; icon = 'lock'; label = t('Reconnexion'); }
  else if (st === 'error') { cls = 'err'; icon = 'alert'; label = t('Erreur'); }
  else if (!last) { cls = 'off'; label = t('Pas encore synchronisé'); }
  return html`<button class=${'sync ' + cls} onClick=${onClick} title=${t('Synchroniser maintenant')}><${Icon} n=${icon} class=${st === 'syncing' ? 'spin' : ''} /><span class="t">${label}</span></button>`;
}

export const pctTone = (v, thr) => (v < thr ? 'bad' : v < thr + 10 ? 'warn' : '');
export const statusChip = (s) => ({
  ahead: html`<${Chip} tone="info">${t('En avance')}<//>`, ok: html`<${Chip} tone="ok">${t('À jour')}<//>`, slight: html`<${Chip} tone="warn">${t('Léger retard')}<//>`,
  late: html`<${Chip} tone="bad">${t('En retard')}<//>`, none: html`<${Chip}>${t('Pas de plan')}<//>`,
}[s] || null);

export function useLocal(key, init) {
  const [v, set] = useState(() => { try { const x = localStorage.getItem(key); return x == null ? init : JSON.parse(x); } catch { return init; } });
  return [v, (n) => { set(n); try { localStorage.setItem(key, JSON.stringify(n)); } catch { /* rien */ } }];
}
export const copyText = async (text) => { try { await navigator.clipboard.writeText(text); return true; } catch { return false; } };
export const num1 = (x) => (Math.round(x * 10) / 10).toString().replace('.', ',');

/** Liste de motifs, en deux groupes : ce qui n'est pas la faute de l'enseignant (heures retirées des heures dues) et les absences (heures non faites). `only` : ne garder qu'un groupe. */
export function ReasonSelect({ value, onChange, only }) {
  const out = (state.data && state.data.dept && state.data.dept.dueOut) || {}, isOut = (r) => (out[r.id] != null ? !!out[r.id] : r.out);
  const opt = (r) => html`<option value=${r.id}>${r.icon} ${t(r.fr)}</option>`;
  const a = REASONS.filter(isOut), b = REASONS.filter(r => !isOut(r));
  return html`<select class="input" value=${value} onChange=${onChange}>${only === 'out' ? a.map(opt) : only === 'absent' ? b.map(opt) : html`<optgroup label=${t('Pas la faute de l’enseignant (heures retirées des heures dues)')}>${a.map(opt)}</optgroup><optgroup label=${t('Absence de l’enseignant (heures non faites)')}>${b.map(opt)}</optgroup>`}</select>`;
}

/** Champ de mot de passe avec un œil pour voir ou cacher ce qu'on tape. */
export function PasswordInput(props) {
  const [show, setShow] = useState(false);
  return html`<div style="position:relative"><input ...${props} type=${show ? 'text' : 'password'} style="padding-right:48px" />
    <button type="button" class="icon-btn" style="position:absolute;right:4px;top:50%;transform:translateY(-50%)" aria-label=${show ? t('Cacher le mot de passe') : t('Voir le mot de passe')} onClick=${() => setShow(!show)}><${Icon} n=${show ? 'eyeoff' : 'eye'} /></button></div>`;
}
