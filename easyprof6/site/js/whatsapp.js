// Envoi par WhatsApp : au choix WhatsApp (normal) ou WhatsApp Business, car beaucoup de téléphones ont les deux.
// Sur Android, un lien « intent » impose l'application voulue ; ailleurs, on retombe sur le lien wa.me ordinaire.
import { html } from './vendor/preact-htm.js';
import { t } from './i18n.js';
import { Icon } from './icons.js';
import { copyText } from './ui.js';
import { setToast } from './store.js';

const KEY = 'ep6:wa';
export const getWa = () => { try { return localStorage.getItem(KEY) || 'normal'; } catch { return 'normal'; } };
export const setWa = (v) => { try { localStorage.setItem(KEY, v); } catch { /* sans stockage : tant pis */ } };
const android = () => typeof navigator !== 'undefined' && /android/i.test(navigator.userAgent || '');

/** Numéro au format international sans « + » (un numéro camerounais à 9 chiffres reçoit 237). */
export function phoneDigits(p) {
  let d = String(p || '').replace(/[^0-9]/g, ''); if (d.startsWith('00')) d = d.slice(2);
  if (d.length === 9 && d.startsWith('6')) d = '237' + d;
  return d;
}

/** app : 'normal' | 'business' | 'auto' (le téléphone décide). */
export function waHref(phone, text, app = 'auto') {
  const d = phoneDigits(phone), enc = encodeURIComponent(text), web = 'https://wa.me/' + d + '?text=' + enc;
  if (android() && (app === 'normal' || app === 'business')) {
    const pkg = app === 'business' ? 'com.whatsapp.w4b' : 'com.whatsapp';
    return `intent://send?${d ? 'phone=' + d + '&' : ''}text=${enc}#Intent;scheme=whatsapp;package=${pkg};S.browser_fallback_url=${encodeURIComponent(web)};end`;
  }
  return web;
}

/** Trois boutons : WhatsApp, WhatsApp Business, copier le message. Le dernier choix est retenu. */
export function WaButtons({ phone, text, onSent }) {
  const last = getWa(), go = (app) => { setWa(app); onSent && onSent(app); };
  const btn = (app, label, bg) => html`<a class=${'btn grow' + (last === app ? '' : ' soft')} style=${last === app ? 'background:' + bg : ''} href=${waHref(phone, text, app)} target=${android() ? null : '_blank'} rel="noreferrer" onClick=${() => go(app)}><${Icon} n="whatsapp" />${label}</a>`;
  return html`<div class="stack" style="gap:8px"><div class="row" style="gap:8px;flex-wrap:wrap">${btn('normal', t('WhatsApp'), '#25D366')}${btn('business', t('WhatsApp Business'), '#128C7E')}</div>
    <button class="btn ghost" onClick=${async () => setToast((await copyText(text)) ? t('Message copié') : t('Copie impossible'))}><${Icon} n="copy" />${t('Copier le message')}</button>
    <p class="hint">${t('Le mauvais WhatsApp s’ouvre ? Choisissez l’autre bouton : votre choix est retenu. Sinon : Paramètres du téléphone › Applications › WhatsApp Business › Ouvrir par défaut › Effacer les valeurs par défaut.')}</p></div>`;
}
