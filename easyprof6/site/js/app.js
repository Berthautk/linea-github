// Coque de l'application : navigation, barre du haut, fenêtres, messages.
import { html, useState, useEffect } from './vendor/preact-htm.js';
import { t, getLang } from './i18n.js';
import { Icon } from './icons.js';
import { useStore, state, logout, isAP, me, setLanguage } from './store.js';
import { Toast, SyncChip } from './ui.js';
import { AuthScreen, RecoverySheet } from './auth.js';
import { Home } from './pages/home.js';
import { Log } from './pages/log.js';
import { Lessons } from './pages/lessons.js';
import { Report } from './pages/report.js';
import { Settings } from './pages/settings.js';
import { Week } from './pages/week.js';
import { syncNow } from './sync.js';

function useRoute() {
  const [r, setR] = useState(location.hash.slice(1) || '/home');
  useEffect(() => { const f = () => { setR(location.hash.slice(1) || '/home'); window.scrollTo(0, 0); }; window.addEventListener('hashchange', f); return () => window.removeEventListener('hashchange', f); }, []);
  return r;
}

export function App() {
  useStore();
  const route = useRoute();
  if (!state.session) return html`<${AuthScreen} />`;
  const page = route.split('/')[1] || 'home';
  const items = [['home', 'home', t('Accueil')], ['lessons', 'list', t('Cours')], ['log', 'plus', t('Saisir')], ['report', 'file', t('Fiche')], ['settings', 'gear', t('Réglages')]];
  const m = me(), init = ((m && m.name) || state.session.username).replace(/^(Mr?\.?|Mme|Mlle)\s+/i, '').trim().slice(0, 1).toUpperCase();
  const body = page === 'week' ? html`<${Week} />` : page === 'log' ? html`<${Log} />` : page === 'lessons' ? html`<${Lessons} />` : page === 'report' ? html`<${Report} />` : page === 'settings' ? html`<${Settings} route=${route} />` : html`<${Home} />`;
  return html`<div class="shell">
    <nav class="nav" aria-label=${t('Navigation')}><div class="brand"><img src="/icons/icon-192.png" alt="" />Rekort</div>
      ${items.map(([id, ic, label]) => html`<a href=${'#/' + id} class=${((page === id || (id === 'log' && page === 'week')) ? 'on ' : '') + (id === 'log' ? 'add' : '')} aria-current=${(page === id || (id === 'log' && page === 'week')) ? 'page' : null}>${id === 'log' ? html`<i><${Icon} n=${ic} /></i>` : html`<${Icon} n=${ic} />`}<span>${label}</span></a>`)}
      <div style="display:none"></div></nav>
    <div class="main"><header class="top"><img class="logo" src="/icons/icon-192.png" alt="" /><div class="who"><b>${state.data.dept.name || 'Rekort'}</b><span>${m ? m.name : state.session.username} · ${isAP() ? t('Animateur pédagogique') : t('Enseignant')}</span></div><button class="icon-btn" style="font-weight:800;font-size:12px" aria-label=${t('Langue')} onClick=${() => setLanguage(getLang() === 'fr' ? 'en' : 'fr')}>${getLang() === 'fr' ? 'EN' : 'FR'}</button><${SyncChip} onClick=${() => syncNow()} /><a class="avatar" href="#/settings/profile" aria-label=${t('Mon profil')} style="display:grid;place-items:center;text-decoration:none">${init}</a></header>
      ${state.sync.status === 'auth' ? html`<div class="page" style="padding-bottom:0"><div class="banner"><${Icon} n="lock" size="18" /><span class="grow">${t('Votre session a expiré. Reconnectez-vous pour continuer à synchroniser (vos données sont conservées).')}</span><button class="btn sm" onClick=${() => logout()}>${t('Se reconnecter')}</button></div></div>` : null}
      ${body}</div>
    ${state.modal ? state.modal() : null}${state.recovery ? html`<${RecoverySheet} />` : null}<${Toast} /></div>`;
}
