// Coque de l'application : navigation, barre du haut, fenêtres, messages.
import { html, useState, useEffect } from './vendor/preact-htm.js';
import { t, getLang } from './i18n.js';
import { Icon } from './icons.js';
import { useStore, state, logout, isAP, me, setLanguage, getTheme, setTheme } from './store.js';
import { Toast, SyncChip, askLogout } from './ui.js';
import { AuthScreen, RecoverySheet } from './auth.js';
import { Home } from './pages/home.js';
import { Saisir } from './pages/saisir.js';
import { MyCourses } from './pages/teacher.js';
import { makeCtx } from './calc.js';
import { openModal, closeModal, Modal } from './ui.js';
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

function openMenu() {
  const go = (h) => { closeModal(); location.hash = h; };
  const it = (h, ic, title, sub) => html`<button class="menu-item" onClick=${() => go(h)}><span class="mi">${ic}</span><span class="grow"><b>${title}</b><small>${sub}</small></span>›</button>`;
  openModal(() => html`<${Modal} title=${t('Menu')} onClose=${closeModal}><div class="stack" style="gap:8px">
    ${it('#/report', '📄', t('Ma fiche'), t('Mes heures et mes leçons, prêtes à imprimer'))}
    ${it('#/lessons', '🗂️', t('Tout l’historique'), t('Toutes mes saisies depuis la rentrée'))}
    ${it('#/settings/profile', '👤', t('Mon profil'), t('Nom, téléphone, matricule, mot de passe, langue'))}
    ${it('#/settings', '⚙️', t('Réglages'), t('Rappels, sauvegarde, mode d’emploi'))}</div><//>`);
}

export function App() {
  useStore();
  const route = useRoute();
  if (!state.session) return html`<${AuthScreen} />`;
  const page = route.split('/')[1] || 'home';
  const ap = isAP();   // enseignant : 3 boutons seulement (Accueil · Saisir · Mes cours) ; la fiche et les réglages sont dans « Menu »
  const items = ap ? [['home', 'home', t('Accueil')], ['lessons', 'list', t('Historique')], ['log', 'plus', t('Saisir')], ['report', 'file', t('Fiche')], ['settings', 'gear', t('Réglages')]]
    : [['home', 'home', t('Accueil')], ['log', 'plus', t('Saisir')], ['mine', 'list', t('Mes cours')]];
  const m = me(), init = ((m && m.name) || state.session.username).replace(/^(Mr?\.?|Mme|Mlle)\s+/i, '').trim().slice(0, 1).toUpperCase();
  const body = page === 'week' ? html`<${Week} />` : page === 'log' ? html`<${Saisir} ctx=${makeCtx(state.data)} />` : page === 'mine' ? html`<${MyCourses} ctx=${makeCtx(state.data)} />` : page === 'lessons' ? html`<${Lessons} />` : page === 'report' ? html`<${Report} />` : page === 'settings' ? html`<${Settings} route=${route} />` : html`<${Home} />`;
  return html`<div class="shell">
    <nav class=${'nav' + (ap ? '' : ' nav3')} aria-label=${t('Navigation')}><div class="brand"><img src="/icons/icon-192.png" alt="" />Rekort</div>
      ${items.map(([id, ic, label]) => html`<a href=${'#/' + id} onPointerDown=${(e) => { if (e.pointerType === 'touch' && location.hash !== '#/' + id) location.hash = '#/' + id; }} class=${((page === id || (id === 'log' && page === 'week')) ? 'on ' : '') + (id === 'log' ? 'add' : '') + (ap ? '' : ' three')} aria-current=${(page === id || (id === 'log' && page === 'week')) ? 'page' : null}>${id === 'log' ? html`<i><${Icon} n=${ic} /></i>` : html`<${Icon} n=${ic} />`}<span>${label}</span></a>`)}
      <div style="display:none"></div></nav>
    <div class="main"><header class="top"><img class="logo" src="/icons/icon-192.png" alt="" /><div class="who"><b>${state.data.dept.name || 'Rekort'}</b><span>${m ? m.name : state.session.username} · ${isAP() ? t('Animateur pédagogique') : t('Enseignant')}</span></div><button class="icon-btn" style="font-weight:800;font-size:12px" aria-label=${t('Langue')} onClick=${() => setLanguage(getLang() === 'fr' ? 'en' : 'fr')}>${getLang() === 'fr' ? 'EN' : 'FR'}</button><${SyncChip} onClick=${() => syncNow()} /><button class="icon-btn" aria-label=${t('Mode sombre')} title=${t('Mode sombre')} onClick=${() => { const dark = getTheme() === 'dark' || (getTheme() === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches); setTheme(dark ? 'light' : 'dark'); }}>${getTheme() === 'dark' || (getTheme() === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches) ? '☀️' : '🌙'}</button><button class="icon-btn" aria-label=${t('Se déconnecter')} title=${t('Se déconnecter')} onClick=${() => askLogout(logout)}><${Icon} n="logout" /></button>${ap ? null : html`<button class="icon-btn menu-btn" onClick=${openMenu}>☰ ${t('Menu')}</button>`}<a class="avatar" href="#/settings/profile" aria-label=${t('Mon profil')} style="display:grid;place-items:center;text-decoration:none">${init}</a></header>
      ${state.sync.status === 'auth' ? html`<div class="page" style="padding-bottom:0"><div class="banner"><${Icon} n="lock" size="18" /><span class="grow">${t('Votre session a expiré. Reconnectez-vous pour continuer à synchroniser (vos données sont conservées).')}</span><button class="btn sm" onClick=${() => logout()}>${t('Se reconnecter')}</button></div></div>` : null}
      ${body}</div>
    ${state.modal ? state.modal() : null}${state.recovery ? html`<${RecoverySheet} />` : null}<${Toast} /></div>`;
}
