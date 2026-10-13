import { render, html } from './vendor/preact-htm.js';
import { init, state, update, setToast } from './store.js';
import { startAutoSync } from './sync.js';
import { App } from './app.js';
import { t } from './i18n.js';

init();
window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); window.__epInstall = e; update(() => { }); });
window.addEventListener('online', () => update(s => { s.online = true; }));
window.addEventListener('offline', () => update(s => { s.online = false; }));
render(html`<${App} />`, document.getElementById('app'));
startAutoSync();

if ('serviceWorker' in navigator) {
  const had = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.register('/sw.js').catch(() => { });
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (had) setToast(t('Nouvelle version installée.'), '', { label: t('Actualiser'), run: () => location.reload() }); });
}
