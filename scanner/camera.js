// Caméra intégrée pour scanner vite, page après page : la page est cadrée en
// direct, une photo en un geste (ou toute seule quand la page est immobile),
// et le traitement se fait en arrière-plan pendant qu'on tourne la page.

import { detectQuad } from './imgproc.js';
import { t } from './i18n.js';

const $ = (id) => document.getElementById(id);
const TICK = 180;            // analyse de l'image, en ms
const STILL = 4;             // images immobiles de suite avant la prise automatique
const MAX_QUEUE = 4;         // photos en attente de traitement au plus

export function liveCameraSupported() {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.isSecureContext);
}

export function createCamera(ctx) {
  // ctx : { capture(blob, info) → void, pending() → nombre, prefs, onClose(reason), toast, showScreen }
  const st = {
    open: false, stream: null, track: null, ic: null, timer: 0, quad: null, shown: null, miss: 0,
    prev: null, lastShot: null, still: 0, moved: true, busy: false, shots: 0, lock: null, framesOnly: false,
  };
  const video = $('camVideo');
  const ana = document.createElement('canvas');
  const tiny = document.createElement('canvas');
  tiny.width = 32; tiny.height = 24;

  const auto = () => ctx.prefs.get('camAuto', '0') === '1';
  // Modes : chacun règle le rendu (et la double page pour un livre ouvert).
  const MODES = ['doc', 'livre', 'carte', 'recu', 'tableau'];
  let mode = 'doc';
  const book = () => mode === 'livre';
  function setMode(m, save = true) {
    mode = MODES.includes(m) ? m : 'doc';
    if (save) ctx.prefs.set('camMode', mode);
    document.querySelectorAll('#camModes button').forEach(b => b.classList.toggle('on', b.dataset.m === mode));
    st.still = 0;
  }

  function setToggles() {
    $('camAuto').classList.toggle('on', auto());
    $('camAuto').setAttribute('aria-pressed', String(auto()));
  }

  function setCount() {
    const n = ctx.added ? ctx.added() : st.shots, p = ctx.pending();
    $('camCount').textContent = t(n > 1 ? 'cam.countN' : 'cam.count1', { n }) + (p ? ' · ' + t('cam.pending', { n: p }) : '');
    $('camDone').disabled = false;
  }

  function hint(key, vars) { $('camHint').textContent = t(key, vars); }

  /* ---------- aperçu ---------- */

  // Position de l'image de la caméra dans l'écran (object-fit: contain).
  function box() {
    const vw = video.videoWidth, vh = video.videoHeight;
    const r = video.getBoundingClientRect();
    const s = Math.min(r.width / vw, r.height / vh);
    return { s, x: r.left + (r.width - vw * s) / 2, y: r.top + (r.height - vh * s) / 2 };
  }

  function drawQuad() {
    const poly = $('camPoly');
    if (!st.shown || !video.videoWidth) { poly.setAttribute('points', ''); return; }
    const b = box();
    poly.setAttribute('points', st.shown.map(p => `${b.x + p.x * b.s},${b.y + p.y * b.s}`).join(' '));
    poly.classList.toggle('ready', st.still >= 2);
  }

  function tinyGray() {
    const g = tiny.getContext('2d', { willReadFrequently: true });
    g.drawImage(video, 0, 0, 32, 24);
    const d = g.getImageData(0, 0, 32, 24).data;
    const out = new Uint8Array(32 * 24);
    for (let i = 0, j = 0; i < out.length; i++, j += 4) out[i] = (d[j] * 0.3 + d[j + 1] * 0.59 + d[j + 2] * 0.11) | 0;
    return out;
  }
  const diff = (a, b) => {
    if (!a || !b) return 255;
    let s = 0;
    for (let i = 0; i < a.length; i++) s += Math.abs(a[i] - b[i]);
    return s / a.length;
  };

  function tick() {
    if (!st.open || !video.videoWidth || video.readyState < 2) return;
    const vw = video.videoWidth, vh = video.videoHeight;
    const k = 360 / Math.max(vw, vh);
    ana.width = Math.round(vw * k);
    ana.height = Math.round(vh * k);
    ana.getContext('2d').drawImage(video, 0, 0, ana.width, ana.height);
    let q = null;
    try { q = detectQuad(ana); } catch { q = null; }
    // Une forme trop petite n'est pas la page.
    if (q) {
      const area = Math.abs(q.reduce((s, p, i) => { const n = q[(i + 1) % 4]; return s + p.x * n.y - n.x * p.y; }, 0)) / 2;
      if (area < ana.width * ana.height * 0.12) q = null;
    }
    if (q) {
      q = q.map(p => ({ x: p.x / k, y: p.y / k }));
      st.quad = q;
      st.miss = 0;
      st.shown = st.shown ? st.shown.map((p, i) => ({ x: p.x * 0.45 + q[i].x * 0.55, y: p.y * 0.45 + q[i].y * 0.55 })) : q;
    } else if (++st.miss > 3) { st.quad = null; st.shown = null; }

    const g = tinyGray();
    const motion = diff(g, st.prev);
    st.prev = g;
    if (motion > 12) st.moved = true;
    st.still = motion < 3.5 && st.quad ? st.still + 1 : 0;
    drawQuad();

    // Après une photo, on attend qu'il se passe quelque chose (page tournée,
    // feuille changée : grand mouvement) puis que tout soit de nouveau immobile.
    const waitingTurn = st.shots > 0 && !st.moved;
    if (st.busy) return;
    if (ctx.pending() >= MAX_QUEUE) { hint('cam.wait'); return; }
    if (!st.quad) hint(book() ? 'cam.findBook' : 'cam.find');
    else if (auto() && waitingTurn) hint(book() ? 'cam.turnBook' : 'cam.turn');
    else if (st.still < 2) hint('cam.hold');
    else hint(auto() ? 'cam.autoSoon' : 'cam.ready');
    $('camShot').style.setProperty('--p', auto() && !waitingTurn && st.quad ? Math.min(1, st.still / STILL) : 0);
    if (auto() && st.quad && st.still >= STILL && !waitingTurn) shoot(true);
  }

  /* ---------- photo ---------- */

  async function grab() {
    if (st.ic && !st.framesOnly) {
      const t0 = Date.now();
      try {
        const blob = await Promise.race([
          st.ic.takePhoto(),
          new Promise((_, rej) => setTimeout(() => rej(new Error('lent')), 4000)),
        ]);
        // Trop lent sur ce téléphone : on prendra les images de l'aperçu.
        if (Date.now() - t0 > 2500) st.framesOnly = true;
        return { blob, w: 0, h: 0 };
      } catch (e) {
        console.warn('takePhoto', e);
        st.framesOnly = true;
      }
    }
    const c = document.createElement('canvas');
    c.width = video.videoWidth;
    c.height = video.videoHeight;
    c.getContext('2d').drawImage(video, 0, 0);
    const blob = await new Promise(res => c.toBlob(res, 'image/jpeg', 0.93));
    return { blob, w: c.width, h: c.height };
  }

  async function shoot(isAuto) {
    if (st.busy || !st.open) return;
    if (ctx.pending() >= MAX_QUEUE) { hint('cam.wait'); return; }
    st.busy = true;
    const quad = st.quad ? st.quad.map(p => ({ ...p })) : null;
    const fw = video.videoWidth, fh = video.videoHeight;
    const flash = $('camFlash');
    flash.classList.remove('go');
    void flash.offsetWidth;
    flash.classList.add('go');
    if (navigator.vibrate) navigator.vibrate(35);
    hint('cam.shot');
    try {
      const { blob } = await grab();
      st.shots++;
      st.lastShot = tinyGray();
      st.moved = false;
      st.still = 0;
      ctx.capture(blob, { quad, frameW: fw, frameH: fh, book: book(), mode, auto: isAuto });
      setCount();
      hint(auto() ? (book() ? 'cam.turnBook' : 'cam.turn') : 'cam.next');
    } catch (e) {
      console.error(e);
      ctx.toast(t('cam.fail'));
    } finally {
      st.busy = false;
    }
  }

  /* ---------- ouverture ---------- */

  async function keepAwake(on) {
    try {
      if (on && !st.lock && 'wakeLock' in navigator) st.lock = await navigator.wakeLock.request('screen');
      else if (!on && st.lock) { await st.lock.release(); st.lock = null; }
    } catch { /* l'écran peut s'éteindre */ }
  }

  // m : mode imposé (pièce du dossier) ; sinon le dernier mode utilisé.
  async function open(m = null) {
    // Ancien réglage « Double page » : devient le mode Livre.
    if (!ctx.prefs.get('camMode') && ctx.prefs.get('camBook') === '1') ctx.prefs.set('camMode', 'livre');
    setMode(m || ctx.prefs.get('camMode', 'doc'), !m);
    Object.assign(st, { quad: null, shown: null, miss: 0, prev: null, lastShot: null, still: 0, moved: true, shots: 0, busy: false });
    setToggles();
    setCount();
    $('camThumb').hidden = true;
    hint('cam.starting');
    ctx.showScreen('cam');
    st.open = true;
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 3840 }, height: { ideal: 2160 } },
      });
    } catch (e) {
      console.warn(e);
      st.open = false;
      ctx.showScreen('home');
      return false;
    }
    st.stream = stream;
    st.track = stream.getVideoTracks()[0];
    video.srcObject = stream;
    try { await video.play(); } catch { /* lecture automatique */ }
    try { await st.track.applyConstraints({ advanced: [{ focusMode: 'continuous' }] }); } catch { /* pas de réglage */ }
    st.ic = null;
    try { if ('ImageCapture' in window) st.ic = new window.ImageCapture(st.track); } catch { st.ic = null; }
    const caps = st.track.getCapabilities ? st.track.getCapabilities() : {};
    $('camTorch').hidden = !caps.torch;
    $('camTorch').classList.remove('on');
    keepAwake(true);
    clearInterval(st.timer);
    st.timer = setInterval(tick, TICK);
    return true;
  }

  function stop() {
    st.open = false;
    clearInterval(st.timer);
    if (st.stream) st.stream.getTracks().forEach(tr => tr.stop());
    st.stream = null;
    st.track = null;
    video.srcObject = null;
    keepAwake(false);
  }

  function close(reason = 'done') {
    stop();
    ctx.onClose(reason);
  }

  // Miniature de la dernière page traitée.
  function showThumb(url) {
    $('camThumbImg').src = url;
    $('camThumb').hidden = false;
    setCount();
  }

  $('camShot').onclick = () => shoot(false);
  $('camDone').onclick = () => close('done');
  $('camThumb').onclick = () => close('done');
  $('camClose').onclick = () => close('done');
  $('camNative').onclick = () => close('native');
  $('camAuto').onclick = () => {
    ctx.prefs.set('camAuto', auto() ? '0' : '1');
    setToggles();
    if (auto()) ctx.toast(t('cam.autoOn'));
  };
  $('camModes').onclick = (e) => {
    const b = e.target.closest('button[data-m]');
    if (!b) return;
    setMode(b.dataset.m);
    ctx.toast(t('cam.mode.' + mode + '.h'));
  };
  $('camTorch').onclick = async () => {
    const on = !$('camTorch').classList.contains('on');
    try { await st.track.applyConstraints({ advanced: [{ torch: on }] }); $('camTorch').classList.toggle('on', on); } catch { /* sans lampe */ }
  };
  window.addEventListener('resize', drawQuad);
  document.addEventListener('visibilitychange', () => {
    if (st.open && document.visibilityState === 'visible') keepAwake(true);
  });

  return {
    open,
    close,
    stop,
    showThumb,
    refresh: setCount,
    get isOpen() { return st.open; },
    get shots() { return st.shots; },
    _st: st,
    _shoot: shoot,
  };
}
