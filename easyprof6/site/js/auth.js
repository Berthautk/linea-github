// Connexion, inscription (création d'un département) et récupération du mot de passe.
import { html, useState } from './vendor/preact-htm.js';
import { t, getLang } from './i18n.js';
import { api } from './api.js';
import { Field, Seg, copyText, Modal, PasswordInput } from './ui.js';
import { Icon } from './icons.js';
import { startSession, setLanguage, state, update, setToast } from './store.js';
import { newDept } from './defaults.js';
import { syncNow } from './sync.js';

const DISCIPLINES = [['Géographie', 'GEO'], ['Histoire', 'HIST'], ['Éducation à la citoyenneté et à la morale', 'ECM'], ['Mathématiques', 'MATHS'], ['Physique', 'PHY'], ['Chimie', 'CHIM'], ['Sciences de la vie et de la Terre', 'SVT'],
  ['Français', 'FR'], ['Anglais', 'ENG'], ['Informatique', 'INFO'], ['Philosophie', 'PHILO'], ['Économie', 'ECO'], ['Éducation physique et sportive', 'EPS'], ['Arts', 'ARTS'], ['Langues nationales', 'LN']];

const strip = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '.').replace(/^\.+|\.+$/g, '').slice(0, 20);

function Lang() { return html`<div class="row" style="justify-content:center"><${Seg} options=${[{ id: 'fr', label: 'Français' }, { id: 'en', label: 'English' }]} value=${state.lang} onChange=${setLanguage} /></div>`; }
function Brand() { return html`<div class="brand"><img src="/icons/icon-192.png" alt="" /><h1>Rekort</h1><p class="sub">${t('Le suivi pédagogique de votre département, simple et fiable.')}</p></div>`; }

export function AuthScreen() {
  const [mode, setMode] = useState('login');
  return html`<div class="auth"><${Lang} /><${Brand} />
    ${mode === 'login' ? html`<${Login} go=${setMode} />` : mode === 'signup' ? html`<${Signup} go=${setMode} />` : html`<${Recover} go=${setMode} />`}
    <div class="pitch">
      <div><span>📱</span><span>${t('Vos données restent sur votre téléphone : vous saisissez même sans Internet.')}</span></div>
      <div><span>🔄</span><span>${t('Les collègues d’un même département se synchronisent automatiquement.')}</span></div>
      <div><span>🧾</span><span>${t('La fiche de l’inspection se remplit toute seule, sur les dates que vous choisissez.')}</span></div>
    </div></div>`;
}

function Login({ go }) {
  const [u, setU] = useState(''), [p, setP] = useState(''), [busy, setBusy] = useState(false), [err, setErr] = useState('');
  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setErr('');
    try { const r = await api('/login', { username: u, password: p }); startSession({ ...r.session, token: r.token }); syncNow(); }
    catch (x) { setErr(x.offline ? t('Pas de connexion à Internet. La première connexion en a besoin.') : x.message); }
    setBusy(false);
  };
  return html`<form class="card stack" onSubmit=${submit}>
    <h2>${t('Se connecter')}</h2>
    <${Field} label=${t('Identifiant')}><input class="input" autocomplete="username" autocapitalize="none" autocorrect="off" value=${u} onInput=${(e) => setU(e.target.value)} required /><//>
    <${Field} label=${t('Mot de passe')}><${PasswordInput} class="input" autocomplete="current-password" value=${p} onInput=${(e) => setP(e.target.value)} required /><//>
    ${err ? html`<div class="err" role="alert">${err}</div>` : null}
    <button class="btn block" disabled=${busy}>${busy ? t('Connexion…') : t('Se connecter')}</button>
    <p class="hint">${t('Vous avez reçu un identifiant et un mot de passe de votre animateur pédagogique ? Saisissez-les ici.')}</p>
    <hr style="border:0;border-top:1px dashed var(--line);width:100%" />
    <button type="button" class="btn ghost block" onClick=${() => go('signup')}>${t('Je n’ai pas de compte : créer mon département')}</button>
    <button type="button" class="btn soft sm" style="align-self:center" onClick=${() => go('recover')}>${t('Mot de passe oublié (animateur)')}</button>
  </form>`;
}

function Signup({ go }) {
  const [step, setStep] = useState(1), [busy, setBusy] = useState(false), [err, setErr] = useState('');
  const [f, setF] = useState({ name: '', username: '', password: '', phone: '', school: '', discipline: '', abbr: '', system: 'anglophone', region: '', division: '', touched: false });
  const set = (k, v) => setF(o => ({ ...o, [k]: v }));
  const onName = (v) => setF(o => ({ ...o, name: v, username: o.touched ? o.username : strip(v) }));
  const onDisc = (v) => { const d = DISCIPLINES.find(x => x[0].toLowerCase() === v.toLowerCase()); setF(o => ({ ...o, discipline: v, abbr: d ? d[1] : o.abbr })); };
  const next = (e) => {
    e.preventDefault(); setErr('');
    if (step === 1) { if (f.password.length < 6) return setErr(t('Le mot de passe doit avoir au moins 6 caractères.')); if (!/^[a-z0-9][a-z0-9._-]{2,23}$/.test(f.username)) return setErr(t('Identifiant : 3 à 24 caractères (lettres minuscules, chiffres, point, tiret).')); return setStep(2); }
    submit();
  };
  const submit = async () => {
    setBusy(true);
    try {
      const dept = newDept({ name: f.school, discipline: f.discipline, abbr: f.abbr || f.discipline.slice(0, 4).toUpperCase(), system: f.system, region: f.region, division: f.division });
      const r = await api('/signup', { username: f.username, password: f.password, name: f.name, phone: f.phone, dept });
      update(s => { s.recovery = r.recovery; });
      startSession({ ...r.session, token: r.token }, r.meta);
      setToast(t('Bienvenue ! Votre département est créé.'));
    } catch (x) { setErr(x.offline ? t('Pas de connexion à Internet. L’inscription en a besoin.') : x.message); if (x.code === 'username_taken' || x.code === 'bad_username') setStep(1); }
    setBusy(false);
  };
  return html`<form class="card stack" onSubmit=${next}>
    <div class="row"><h2 class="grow">${t('Créer mon département')}</h2><span class="chip info">${t('Étape {n} sur 2', { n: step })}</span></div>
    ${step === 1 ? html`
      <p class="sub">${t('Vous serez l’animateur pédagogique : vous gérez le département, vos collègues et vos propres cours.')}</p>
      <${Field} label=${t('Votre nom complet')}><input class="input" autocomplete="name" value=${f.name} onInput=${(e) => onName(e.target.value)} placeholder=${t('Mr. KAMDEM Emmanuel')} required /><//>
      <${Field} label=${t('Identifiant de connexion')} hint=${t('Sans espace. Vous l’utiliserez pour vous reconnecter.')}><input class="input" autocapitalize="none" autocorrect="off" value=${f.username} onInput=${(e) => setF(o => ({ ...o, username: e.target.value.toLowerCase(), touched: true }))} required /><//>
      <${Field} label=${t('Mot de passe')} hint=${t('Au moins 6 caractères.')}><${PasswordInput} class="input" autocomplete="new-password" value=${f.password} onInput=${(e) => set('password', e.target.value)} required /><//>
      <${Field} label=${t('Téléphone WhatsApp (facultatif)')}><input class="input" inputmode="tel" value=${f.phone} onInput=${(e) => set('phone', e.target.value)} placeholder="+237…" /><//>` : html`
      <${Field} label=${t('Établissement')}><input class="input" value=${f.school} onInput=${(e) => set('school', e.target.value)} placeholder=${t('Ex. GBHS GAROUA')} required /><//>
      <${Field} label=${t('Discipline du département')}><input class="input" list="disc" value=${f.discipline} onInput=${(e) => onDisc(e.target.value)} placeholder=${t('Ex. Géographie')} required /><datalist id="disc">${DISCIPLINES.map(d => html`<option value=${d[0]} />`)}</datalist><//>
      <${Field} group label=${t('Système')}><${Seg} full options=${[{ id: 'anglophone', label: t('Anglophone') }, { id: 'francophone', label: t('Francophone') }]} value=${f.system} onChange=${(v) => set('system', v)} /><//>
      <div class="grid2"><${Field} label=${t('Région')}><input class="input" value=${f.region} onInput=${(e) => set('region', e.target.value)} placeholder=${t('Nord')} /><//><${Field} label=${t('Département (division)')}><input class="input" value=${f.division} onInput=${(e) => set('division', e.target.value)} placeholder=${t('Bénoué')} /><//></div>
      <p class="hint">${t('Vous pourrez tout modifier plus tard dans Réglages.')}</p>`}
    ${err ? html`<div class="err" role="alert">${err}</div>` : null}
    <div class="row">${step === 2 ? html`<button type="button" class="btn soft" onClick=${() => setStep(1)}>${t('Retour')}</button>` : null}<button class="btn grow" disabled=${busy}>${step === 1 ? t('Continuer') : busy ? t('Création…') : t('Créer mon département')}</button></div>
    <button type="button" class="btn soft sm" style="align-self:center" onClick=${() => go('login')}>${t('J’ai déjà un compte')}</button>
  </form>`;
}

function Recover({ go }) {
  const [f, setF] = useState({ username: '', code: '', password: '' }), [err, setErr] = useState(''), [done, setDone] = useState(null), [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setErr('');
    try { const r = await api('/recover', f); setDone(r.recovery); } catch (x) { setErr(x.message); }
    setBusy(false);
  };
  if (done) return html`<div class="card stack"><h2>${t('Mot de passe modifié')}</h2><div class="ok">${t('Vous pouvez vous connecter avec votre nouveau mot de passe.')}</div><p class="sub">${t('Votre ancien code de récupération ne fonctionne plus. Voici le nouveau, à conserver :')}</p><div class="code">${done}</div>
    <button class="btn block" onClick=${() => go('login')}>${t('Se connecter')}</button></div>`;
  return html`<form class="card stack" onSubmit=${submit}><h2>${t('Mot de passe oublié')}</h2>
    <p class="sub">${t('Réservé à l’animateur pédagogique : utilisez le code de récupération reçu à l’inscription. Un collègue doit demander à son animateur de réinitialiser son mot de passe.')}</p>
    <${Field} label=${t('Identifiant')}><input class="input" autocapitalize="none" value=${f.username} onInput=${(e) => setF({ ...f, username: e.target.value })} required /><//>
    <${Field} label=${t('Code de récupération')}><input class="input" autocapitalize="characters" value=${f.code} onInput=${(e) => setF({ ...f, code: e.target.value })} placeholder="XXXX-XXXX-XXXX" required /><//>
    <${Field} label=${t('Nouveau mot de passe')}><${PasswordInput} class="input" autocomplete="new-password" value=${f.password} onInput=${(e) => setF({ ...f, password: e.target.value })} required /><//>
    ${err ? html`<div class="err" role="alert">${err}</div>` : null}
    <button class="btn block" disabled=${busy}>${t('Changer le mot de passe')}</button><button type="button" class="btn soft sm" style="align-self:center" onClick=${() => go('login')}>${t('Retour')}</button></form>`;
}

/* fenêtre affichée une seule fois après l'inscription */
export function RecoverySheet() {
  const [copied, setCopied] = useState(false); const code = state.recovery;
  return html`<${Modal} title=${t('Votre code de récupération')} onClose=${() => { }}>
    <p>${t('Notez ce code ou prenez une capture d’écran. Il permet de récupérer votre compte si vous oubliez votre mot de passe. Il ne sera plus affiché.')}</p>
    <div class="code">${code}</div>
    <div class="row"><button class="btn soft grow" onClick=${async () => setCopied(await copyText(code))}><${Icon} n="copy" />${copied ? t('Copié') : t('Copier')}</button>
    <button class="btn grow" onClick=${() => { update(s => { s.recovery = null; }); location.hash = '#/home'; }}>${t('J’ai noté mon code')}</button></div><//>`;
}
