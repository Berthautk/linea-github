import {
  MAX_SRC, makeCanvas, blobToCanvas, canvasToBlob, detectQuad, defaultQuad, orderQuad,
  warp, rotateCanvas, enhance, fitCanvas, resizeCanvas, FILTERS,
  assessQuality, drawWatermark, inkToAlpha, trimAlpha, estimateSkew, rotateSmall, cleanBorders,
} from './imgproc.js';
import { buildPdf, PAGE_SIZES } from './pdf.js';
import { recognize, plainText } from './ocr.js';
import { buildDocx } from './docx.js';
import * as store from './store.js';

export const APP_VERSION = '1.0.0';

const $ = (id) => document.getElementById(id);
const nextFrame = () => new Promise(r => setTimeout(r, 30));

// Bibliothèque : plusieurs documents, chacun avec ses pages.
const lib = { docs: [] };          // { id, name, ids, updated }
let doc = null;                    // document ouvert
const pages = new Map();           // pages du document ouvert
const thumbUrls = new Map();

/* ------------------------------ utilitaires ------------------------------ */

function defaultName() {
  const d = new Date(), p = (n) => String(n).padStart(2, '0');
  return `Scan ${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}h${p(d.getMinutes())}`;
}

function safeName(s) {
  const n = (s || '').replace(/[\\/:*?"<>|\u0000-\u001f]+/g, ' ').replace(/\s+/g, ' ').trim();
  return n.slice(0, 120) || defaultName();
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function fmtSize(n) {
  return n >= 1e6 ? `${(n / 1e6).toFixed(1).replace('.', ',')} Mo` : `${Math.max(1, Math.round(n / 1e3))} Ko`;
}

function blobToDataUrl(b) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.onerror = () => rej(r.error);
    r.readAsDataURL(b);
  });
}
const dataUrlToBlob = async (u) => (await fetch(u)).blob();

const imgCache = new Map();
function loadImg(src) {
  if (!imgCache.has(src)) {
    imgCache.set(src, new Promise((res, rej) => {
      const i = new Image();
      i.onload = () => res(i);
      i.onerror = rej;
      i.src = src;
    }));
  }
  return imgCache.get(src);
}

const prefs = {
  get(k, d = '') { try { return localStorage.getItem('ls.' + k) ?? d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem('ls.' + k, v); } catch { /* navigation privée */ } },
};

let busyDepth = 0;
async function busy(text, fn) {
  busyDepth++;
  $('busyText').textContent = text;
  $('busy').hidden = false;
  await nextFrame();
  try { return await fn(); }
  finally { if (--busyDepth === 0) $('busy').hidden = true; }
}
function setBusyText(t) { $('busyText').textContent = t; }

let toastTimer;
function toast(msg, ms = 3500) {
  const t = $('toast');
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (t.hidden = true), ms);
}

function saveLib() {
  if (doc) doc.updated = Date.now();
  return store.putMeta('library', {
    docs: lib.docs.map(d => ({ ...d, ids: d.ids.slice() })),
    current: doc && doc.id,
  });
}

/* ------------------------------ traitement ------------------------------ */

// Garde en mémoire la photo d'origine et les étapes de la page ouverte.
const cache = { id: null, orig: null, warpKey: null, warped: null, baseKey: null, base: null };

function resetCache(id, orig = null) {
  Object.assign(cache, { id, orig, warpKey: null, warped: null, baseKey: null, base: null });
}

async function getOrig(page) {
  if (cache.id !== page.id || !cache.orig) resetCache(page.id, await blobToCanvas(page.orig, MAX_SRC));
  return cache.orig;
}

async function getWarped(page) {
  const orig = await getOrig(page);
  const key = JSON.stringify(page.quad);
  if (cache.warpKey !== key) {
    const flat = warp(orig, page.quad);
    page.quality = assessQuality(flat);
    // Redressement fin : lignes de texte parfaitement horizontales.
    page.skew = estimateSkew(flat);
    cache.warped = rotateSmall(flat, page.skew);
    cache.warpKey = key;
    cache.baseKey = null;
  }
  return cache.warped;
}

// Page redressée + tournée + filtrée, sans signature ni masque.
async function renderBase(page) {
  const warped = await getWarped(page);
  const key = `${page.rot}|${page.filter}`;
  if (cache.baseKey !== key) {
    cache.base = enhance(rotateCanvas(warped, page.rot), page.filter);
    // Bords propres comme sur un scanner (sauf rendus « couleur » et « original »).
    if (['desk', 'scan', 'gray', 'bw'].includes(page.filter)) cleanBorders(cache.base);
    cache.baseKey = key;
  }
  return cache.base;
}

// Signatures et masques. Position : centre (cx, cy) en fraction de la page ;
// taille (w, h) en fraction du petit côté, pour survivre aux rotations.
function overlayBox(o, W, H) {
  const S = Math.min(W, H), w = o.w * S, h = o.h * S;
  return { x: o.cx * W - w / 2, y: o.cy * H - h / 2, w, h };
}

async function drawOverlays(base, overlays) {
  if (!overlays || !overlays.length) return base;
  const out = makeCanvas(base.width, base.height);
  const ctx = out.getContext('2d');
  ctx.drawImage(base, 0, 0);
  for (const o of overlays) {
    const b = overlayBox(o, out.width, out.height);
    if (o.t === 'mask') {
      ctx.fillStyle = '#000';
      ctx.fillRect(b.x, b.y, b.w, b.h);
    } else if (o.t === 'sig') {
      ctx.drawImage(await loadImg(o.src), b.x, b.y, b.w, b.h);
    }
  }
  return out;
}

function rotateOverlays(page, deg) {
  for (const o of page.overlays || []) {
    const { cx, cy } = o;
    if (deg === 90) { o.cx = 1 - cy; o.cy = cx; } else { o.cx = cy; o.cy = 1 - cx; }
    if (o.t === 'mask') [o.w, o.h] = [o.h, o.w];
  }
}

async function renderPage(page) {
  return drawOverlays(await renderBase(page), page.overlays);
}

async function commit(page, out) {
  page.proc = await canvasToBlob(out, 'image/jpeg', 0.92);
  page.ocr = null; // l'image a changé : le texte sera relu
  page.w = out.width;
  page.h = out.height;
  page.thumb = await canvasToBlob(fitCanvas(out, 420), 'image/jpeg', 0.8);
  const old = thumbUrls.get(page.id);
  if (old) URL.revokeObjectURL(old);
  thumbUrls.set(page.id, URL.createObjectURL(page.thumb));
  await store.putPage(page);
}

async function loadPhoto(page, file) {
  const canvas = await blobToCanvas(file, MAX_SRC);
  page.orig = await canvasToBlob(canvas, 'image/jpeg', 0.93);
  page.quad = detectQuad(canvas) || defaultQuad(canvas.width, canvas.height);
  resetCache(page.id, canvas);
}

async function addFiles(files, { edit }) {
  files = [...files].filter(f => f && (f.type.startsWith('image/') || !f.type));
  if (!files.length) return;
  let lastId = null;
  await busy('Analyse de la photo…', async () => {
    for (let i = 0; i < files.length; i++) {
      if (files.length > 1) setBusyText(`Page ${i + 1} sur ${files.length}…`);
      try {
        const page = { id: uid(), rot: 0, filter: 'desk', overlays: [] };
        await loadPhoto(page, files[i]);
        pages.set(page.id, page);
        // Carte (CNI, permis, carte d'étudiant) : fond coloré et photo, on
        // garde les vraies couleurs au lieu de blanchir le fond.
        const w = await getWarped(page);
        if (Math.abs(Math.max(w.width, w.height) / Math.min(w.width, w.height) - 85.6 / 54) < 0.07) page.filter = 'color';
        await nextFrame();
        await commit(page, await renderPage(page));
        doc.ids.push(page.id);
        lastId = page.id;
      } catch (e) {
        console.error(e);
        toast('Impossible de lire une des images.');
      }
    }
    await saveLib();
  });
  renderGrid();
  if (edit && lastId && files.length === 1) openEditor(lastId, 'crop');
  else if (files.length > 1) {
    const bad = doc.ids.filter(id => isBad(pages.get(id))).length;
    if (bad) toast(`⚠️ ${bad} page(s) floue(s) ou avec reflet : touchez-les pour vérifier.`, 5000);
  }
}

function isBad(p) {
  return !!(p && p.quality && (p.quality.blurry || p.quality.reflet));
}

/* ------------------------------ écran principal ------------------------------ */

function renderGrid() {
  const grid = $('grid');
  grid.textContent = '';
  $('empty').hidden = doc.ids.length > 0;
  $('exportBtn').disabled = doc.ids.length === 0;
  doc.ids.forEach((id, i) => {
    const tile = document.createElement('div');
    tile.className = 'tile';
    const img = document.createElement('img');
    img.alt = `Page ${i + 1}`;
    img.src = thumbUrls.get(id) || '';
    const num = document.createElement('span');
    num.className = 'num';
    num.textContent = i + 1;
    tile.append(img, num);
    if (isBad(pages.get(id))) {
      const f = document.createElement('span');
      f.className = 'flag';
      f.textContent = '⚠️';
      f.title = 'Photo floue ou avec reflet';
      tile.append(f);
    }
    const mv = document.createElement('div');
    mv.className = 'mv';
    const left = document.createElement('button');
    left.type = 'button'; left.textContent = '‹'; left.disabled = i === 0;
    left.setAttribute('aria-label', 'Déplacer avant');
    const right = document.createElement('button');
    right.type = 'button'; right.textContent = '›'; right.disabled = i === doc.ids.length - 1;
    right.setAttribute('aria-label', 'Déplacer après');
    left.onclick = (e) => { e.stopPropagation(); move(i, -1); };
    right.onclick = (e) => { e.stopPropagation(); move(i, 1); };
    mv.append(left, right);
    tile.append(mv);
    tile.onclick = () => openEditor(id, 'filter');
    grid.append(tile);
  });
}

function move(i, dir) {
  const j = i + dir;
  if (j < 0 || j >= doc.ids.length) return;
  [doc.ids[i], doc.ids[j]] = [doc.ids[j], doc.ids[i]];
  saveLib();
  renderGrid();
}

/* ------------------------------ bibliothèque ------------------------------ */

async function openDoc(id) {
  for (const u of thumbUrls.values()) URL.revokeObjectURL(u);
  thumbUrls.clear();
  pages.clear();
  resetCache(null);
  doc = lib.docs.find(d => d.id === id);
  const ids = doc.ids;
  doc.ids = [];
  for (const pid of ids) {
    const p = await store.getPage(pid);
    if (!p || !p.proc) continue;
    p.overlays = p.overlays || [];
    pages.set(pid, p);
    thumbUrls.set(pid, URL.createObjectURL(p.thumb || p.proc));
    doc.ids.push(pid);
  }
  $('docName').value = doc.name;
  await saveLib();
  renderGrid();
}

function newDocRecord(name = defaultName()) {
  const d = { id: uid(), name, ids: [], updated: Date.now() };
  lib.docs.unshift(d);
  return d;
}

async function newDoc() {
  if (!doc.ids.length) { doc.name = defaultName(); $('docName').value = doc.name; return saveLib(); }
  await openDoc(newDocRecord().id);
  toast('Nouveau document. L\'ancien est dans « Mes documents ».');
}

async function deleteDoc(id) {
  const d = lib.docs.find(x => x.id === id);
  if (!d || !confirm(`Supprimer « ${d.name} » de ce téléphone ?`)) return;
  const ids = d.id === doc.id ? doc.ids : d.ids;
  for (const pid of ids) await store.delPage(pid);
  lib.docs = lib.docs.filter(x => x.id !== id);
  if (d.id === doc.id) {
    if (!lib.docs.length) newDocRecord();
    await openDoc(lib.docs[0].id);
  } else await saveLib();
  renderLib();
}

async function renderLib() {
  const box = $('libList');
  box.textContent = '';
  const docs = lib.docs.slice().sort((a, b) => (b.updated || 0) - (a.updated || 0));
  for (const d of docs) {
    const it = document.createElement('div');
    it.className = 'libitem' + (d.id === doc.id ? ' cur' : '');
    const ids = d.id === doc.id ? doc.ids : d.ids;
    let thumb;
    if (ids.length) {
      const p = d.id === doc.id ? pages.get(ids[0]) : await store.getPage(ids[0]);
      if (p && (p.thumb || p.proc)) {
        thumb = document.createElement('img');
        thumb.src = URL.createObjectURL(p.thumb || p.proc);
        thumb.onload = () => URL.revokeObjectURL(thumb.src);
        thumb.alt = '';
      }
    }
    if (!thumb) { thumb = document.createElement('div'); thumb.className = 'ph'; }
    const meta = document.createElement('div');
    meta.className = 'meta';
    const b = document.createElement('b');
    b.textContent = d.name;
    const s = document.createElement('span');
    const date = d.updated ? new Date(d.updated).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
    s.textContent = `${ids.length} page${ids.length > 1 ? 's' : ''}${date ? ' · ' + date : ''}${d.id === doc.id ? ' · ouvert' : ''}`;
    meta.append(b, s);
    const del = document.createElement('button');
    del.type = 'button';
    del.textContent = '🗑';
    del.setAttribute('aria-label', `Supprimer ${d.name}`);
    del.onclick = (e) => { e.stopPropagation(); deleteDoc(d.id); };
    it.append(thumb, meta, del);
    it.onclick = async () => {
      $('libDlg').close();
      if (d.id !== doc.id) await busy('Ouverture…', () => openDoc(d.id));
    };
    box.append(it);
  }
}

// Sauvegarde complète : un seul fichier avec tous les documents et photos.
async function backupAll() {
  await busy('Préparation de la sauvegarde…', async () => {
    const out = { app: 'vraiscan', version: 1, created: new Date().toISOString(), docs: [] };
    const sig = await store.getMeta('signature');
    if (sig) out.signature = sig;
    for (const d of lib.docs) {
      const ids = d.id === doc.id ? doc.ids : d.ids;
      const od = { name: d.name, updated: d.updated, pages: [] };
      for (const pid of ids) {
        const p = pages.get(pid) && d.id === doc.id ? pages.get(pid) : await store.getPage(pid);
        if (!p) continue;
        od.pages.push({
          quad: p.quad, rot: p.rot, filter: p.filter, overlays: p.overlays || [], quality: p.quality,
          w: p.w, h: p.h,
          orig: await blobToDataUrl(p.orig), proc: await blobToDataUrl(p.proc),
          thumb: p.thumb ? await blobToDataUrl(p.thumb) : null,
        });
      }
      out.docs.push(od);
    }
    const d = new Date(), pad = (n) => String(n).padStart(2, '0');
    const file = new File([JSON.stringify(out)],
      `VraiScan - sauvegarde ${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}.vraiscan`,
      { type: 'application/octet-stream' });
    download(file);
    prefs.set('lastBackup', String(Date.now()));
    toast(`Sauvegarde enregistrée (${fmtSize(file.size)}). Gardez-la sur Drive ou une clé USB.`, 5000);
  });
}

async function restoreBackup(file) {
  let data;
  try { data = JSON.parse(await file.text()); } catch { data = null; }
  if (!data || !['vraiscan', 'linea-scan'].includes(data.app) || !Array.isArray(data.docs)) {
    toast('Ce fichier n\'est pas une sauvegarde VraiScan.');
    return;
  }
  let n = 0;
  await busy('Restauration…', async () => {
    if (data.signature && !(await store.getMeta('signature'))) await store.putMeta('signature', data.signature);
    for (const od of data.docs) {
      const d = { id: uid(), name: od.name || defaultName(), ids: [], updated: od.updated || Date.now() };
      for (const sp of od.pages || []) {
        const p = {
          id: uid(), quad: sp.quad, rot: sp.rot || 0, filter: sp.filter || 'desk',
          overlays: sp.overlays || [], quality: sp.quality, w: sp.w, h: sp.h,
          orig: await dataUrlToBlob(sp.orig), proc: await dataUrlToBlob(sp.proc),
          thumb: sp.thumb ? await dataUrlToBlob(sp.thumb) : null,
        };
        await store.putPage(p);
        d.ids.push(p.id);
      }
      lib.docs.push(d);
      n++;
    }
    await saveLib();
  });
  renderLib();
  toast(`${n} document(s) restauré(s).`);
}

/* ------------------------------ éditeur ------------------------------ */

const ed = { id: null, mode: 'crop', quad: null, shown: null, drag: -1, sel: -1, act: null };
const SVGNS = 'http://www.w3.org/2000/svg';

function showScreen(name) {
  $('home').hidden = name !== 'home';
  $('editor').hidden = name !== 'editor';
}

async function openEditor(id, mode) {
  ed.id = id;
  showScreen('editor');
  const idx = doc.ids.indexOf(id);
  $('edCount').textContent = idx >= 0 ? `Page ${idx + 1}/${doc.ids.length}` : '';
  await setMode(mode);
}

function showQuality(page) {
  const q = page && page.quality;
  const msgs = [];
  if (q && q.blurry) msgs.push('Photo floue : le texte risque d\'être illisible.');
  if (q && q.reflet) msgs.push('Reflet de lumière détecté : une partie peut être effacée.');
  $('qText').textContent = msgs.length ? '⚠️ ' + msgs.join(' ') + ' Reprenez la photo sans flash, téléphone immobile.' : '';
  $('qWarn').hidden = !msgs.length || ed.mode === 'crop';
}

async function setMode(mode) {
  ed.mode = mode;
  ed.sel = -1;
  const page = pages.get(ed.id);
  $('edTitle').textContent = { crop: 'Recadrer', filter: 'Rendu', anno: 'Signer / masquer' }[mode];
  $('cropTools').hidden = mode !== 'crop';
  $('filterTools').hidden = mode !== 'filter';
  $('annoTools').hidden = mode !== 'anno';
  $('overlay').textContent = '';
  if (mode === 'crop') {
    const orig = await busy('Chargement…', () => getOrig(page));
    ed.quad = page.quad.map(p => ({ ...p }));
    showCanvas(orig);
  } else if (mode === 'filter') {
    renderChips();
    showCanvas(await busy('Traitement…', () => renderPage(page)));
  } else {
    showCanvas(await busy('Traitement…', () => renderBase(page)));
  }
  showQuality(page);
}

function showCanvas(src) {
  const c = $('edCanvas');
  const disp = fitCanvas(src, 1600);
  c.width = disp.width;
  c.height = disp.height;
  c.getContext('2d').drawImage(disp, 0, 0);
  ed.shown = src;
  layoutCanvas();
}

function layoutCanvas() {
  const c = $('edCanvas');
  if (!ed.shown) return;
  const st = $('stage');
  const aw = st.clientWidth - 32, ah = st.clientHeight - 32;
  const s = Math.min(aw / ed.shown.width, ah / ed.shown.height);
  c.style.width = `${Math.floor(ed.shown.width * s)}px`;
  c.style.height = `${Math.floor(ed.shown.height * s)}px`;
  drawOverlay();
}
addEventListener('resize', layoutCanvas);

const unit = () => ed.shown.width / ($('edCanvas').clientWidth || ed.shown.width);

function svgEl(tag, attrs) {
  const el = document.createElementNS(SVGNS, tag);
  for (const k in attrs) el.setAttribute(k, attrs[k]);
  return el;
}

function drawOverlay() {
  const svg = $('overlay');
  svg.textContent = '';
  if (!ed.shown || ed.mode === 'filter') return;
  const W = ed.shown.width, H = ed.shown.height, u = unit();
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  if (ed.mode === 'crop') {
    svg.append(svgEl('polygon', { points: ed.quad.map(p => `${p.x},${p.y}`).join(' ') }));
    for (const p of ed.quad) {
      svg.append(svgEl('circle', { class: 'h', cx: p.x, cy: p.y, r: 22 * u }));
      svg.append(svgEl('circle', { class: 'dot', cx: p.x, cy: p.y, r: 4 * u }));
    }
    return;
  }
  const page = pages.get(ed.id);
  page.overlays.forEach((o, i) => {
    const b = overlayBox(o, W, H);
    if (o.t === 'mask') svg.append(svgEl('rect', { class: 'mask', x: b.x, y: b.y, width: b.w, height: b.h }));
    else svg.append(svgEl('image', { href: o.src, x: b.x, y: b.y, width: b.w, height: b.h, preserveAspectRatio: 'none' }));
    if (i === ed.sel) {
      svg.append(svgEl('rect', { class: 'sel', x: b.x, y: b.y, width: b.w, height: b.h }));
      svg.append(svgEl('circle', { class: 'rs', cx: b.x + b.w, cy: b.y + b.h, r: 14 * u }));
    }
  });
  $('aDel').disabled = ed.sel < 0;
}

function toImage(e) {
  const r = $('overlay').getBoundingClientRect();
  const W = ed.shown.width, H = ed.shown.height;
  return {
    x: Math.max(0, Math.min(W, ((e.clientX - r.left) / r.width) * W)),
    y: Math.max(0, Math.min(H, ((e.clientY - r.top) / r.height) * H)),
  };
}

function nearestHandle(pt) {
  let best = -1, bd = Infinity;
  ed.quad.forEach((p, i) => {
    const d = Math.hypot(p.x - pt.x, p.y - pt.y);
    if (d < bd) { bd = d; best = i; }
  });
  return bd < 60 * unit() ? best : -1;
}

function drawLoupe(pt, e) {
  const L = $('loupe');
  const lc = L.getContext('2d');
  // Zone vue dans la loupe : grossissement x2,2 par rapport à l'affichage.
  const span = (L.width / 2.2) * unit();
  lc.fillStyle = '#000';
  lc.fillRect(0, 0, L.width, L.height);
  lc.drawImage(ed.shown, pt.x - span / 2, pt.y - span / 2, span, span, 0, 0, L.width, L.height);
  lc.strokeStyle = '#4fb3ff';
  lc.lineWidth = 1.5;
  lc.beginPath();
  lc.moveTo(L.width / 2, 20); lc.lineTo(L.width / 2, L.height - 20);
  lc.moveTo(20, L.height / 2); lc.lineTo(L.width - 20, L.height / 2);
  lc.stroke();
  const st = $('stage').getBoundingClientRect();
  let lx = e.clientX - st.left - 65, ly = e.clientY - st.top - 170;
  if (ly < 4) ly = e.clientY - st.top + 50;
  lx = Math.max(4, Math.min(st.width - 134, lx));
  L.style.left = `${lx}px`;
  L.style.top = `${ly}px`;
  L.hidden = false;
}

// Sélection d'une signature ou d'un masque : poignée de taille, puis intérieur.
function hitOverlay(pt) {
  const page = pages.get(ed.id);
  const W = ed.shown.width, H = ed.shown.height, u = unit();
  if (ed.sel >= 0 && page.overlays[ed.sel]) {
    const b = overlayBox(page.overlays[ed.sel], W, H);
    if (Math.hypot(pt.x - b.x - b.w, pt.y - b.y - b.h) < 30 * u) return { i: ed.sel, resize: true };
  }
  for (let i = page.overlays.length - 1; i >= 0; i--) {
    const b = overlayBox(page.overlays[i], W, H);
    const m = 10 * u;
    if (pt.x >= b.x - m && pt.x <= b.x + b.w + m && pt.y >= b.y - m && pt.y <= b.y + b.h + m) return { i, resize: false };
  }
  return null;
}

const ov = $('overlay');
ov.addEventListener('pointerdown', (e) => {
  if (!ed.shown) return;
  const pt = toImage(e);
  if (ed.mode === 'crop') {
    const i = nearestHandle(pt);
    if (i < 0) return;
    ed.drag = i;
    drawLoupe(ed.quad[i], e);
  } else if (ed.mode === 'anno') {
    const hit = hitOverlay(pt);
    ed.sel = hit ? hit.i : -1;
    drawOverlay();
    if (!hit) return;
    const o = pages.get(ed.id).overlays[hit.i];
    ed.act = { resize: hit.resize, start: pt, o0: { ...o } };
  } else return;
  ov.setPointerCapture(e.pointerId);
  e.preventDefault();
});
ov.addEventListener('pointermove', (e) => {
  const pt = toImage(e);
  if (ed.mode === 'crop' && ed.drag >= 0) {
    ed.quad[ed.drag] = pt;
    drawOverlay();
    drawLoupe(pt, e);
  } else if (ed.mode === 'anno' && ed.act) {
    const W = ed.shown.width, H = ed.shown.height, S = Math.min(W, H);
    const o = pages.get(ed.id).overlays[ed.sel], a = ed.act, o0 = a.o0;
    const dx = pt.x - a.start.x, dy = pt.y - a.start.y;
    if (a.resize) {
      // Le coin haut-gauche reste fixe.
      const left = o0.cx * W - (o0.w * S) / 2, top = o0.cy * H - (o0.h * S) / 2;
      let w = Math.max(0.03 * S, o0.w * S + dx), h = Math.max(0.02 * S, o0.h * S + dy);
      if (o.t === 'sig') h = w * (o0.h / o0.w);
      o.w = w / S; o.h = h / S;
      o.cx = (left + w / 2) / W; o.cy = (top + h / 2) / H;
    } else {
      o.cx = Math.max(0, Math.min(1, o0.cx + dx / W));
      o.cy = Math.max(0, Math.min(1, o0.cy + dy / H));
    }
    drawOverlay();
  }
});
const endDrag = () => { ed.drag = -1; ed.act = null; $('loupe').hidden = true; };
ov.addEventListener('pointerup', endDrag);
ov.addEventListener('pointercancel', endDrag);

$('cAuto').onclick = () => {
  const q = detectQuad(ed.shown);
  if (q) { ed.quad = q; drawOverlay(); }
  else toast('Bords non trouvés : placez les coins à la main.');
};
$('cFull').onclick = () => {
  ed.quad = defaultQuad(ed.shown.width, ed.shown.height, 0);
  drawOverlay();
};
$('cOk').onclick = async () => {
  const page = pages.get(ed.id);
  page.quad = orderQuad(ed.quad);
  await busy('Redressement…', async () => commit(page, await renderPage(page)));
  renderGrid();
  setMode('filter');
};

function renderChips() {
  const page = pages.get(ed.id);
  const box = $('chips');
  box.textContent = '';
  for (const f of FILTERS) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip' + (page.filter === f.id ? ' on' : '');
    b.textContent = f.label;
    b.onclick = () => applyEdit(p => { p.filter = f.id; });
    box.append(b);
  }
  $('fHint').textContent = FILTERS.find(f => f.id === page.filter)?.hint || '';
}

async function applyEdit(change) {
  const page = pages.get(ed.id);
  change(page);
  renderChips();
  const out = await busy('Traitement…', async () => {
    const o = await renderPage(page);
    await commit(page, o);
    return o;
  });
  showCanvas(out);
  renderGrid();
}

$('fRotL').onclick = () => applyEdit(p => { p.rot = (p.rot + 270) % 360; rotateOverlays(p, 270); });
$('fRotR').onclick = () => applyEdit(p => { p.rot = (p.rot + 90) % 360; rotateOverlays(p, 90); });
$('fCrop').onclick = () => setMode('crop');
$('fAnno').onclick = () => setMode('anno');
$('fDel').onclick = async () => {
  if (!confirm('Supprimer cette page ?')) return;
  const id = ed.id;
  doc.ids = doc.ids.filter(x => x !== id);
  pages.delete(id);
  const u = thumbUrls.get(id);
  if (u) URL.revokeObjectURL(u);
  thumbUrls.delete(id);
  await store.delPage(id);
  await saveLib();
  closeEditor();
};
$('fDone').onclick = () => closeEditor();
$('edBack').onclick = async () => {
  const page = pages.get(ed.id);
  if (ed.mode === 'anno' && page) await busy('Traitement…', async () => commit(page, await renderPage(page)));
  if (ed.mode === 'crop' && page && !page.proc) await busy('Traitement…', async () => commit(page, await renderPage(page)));
  if (ed.mode === 'filter') closeEditor(); else setMode('filter');
};

function closeEditor() {
  ed.id = null;
  ed.shown = null;
  showScreen('home');
  renderGrid();
}

// Annotation
$('aMask').onclick = () => {
  const page = pages.get(ed.id);
  page.overlays.push({ t: 'mask', cx: 0.5, cy: 0.5, w: 0.4, h: 0.06 });
  ed.sel = page.overlays.length - 1;
  drawOverlay();
};
$('aDel').onclick = () => {
  const page = pages.get(ed.id);
  if (ed.sel < 0) return;
  page.overlays.splice(ed.sel, 1);
  ed.sel = -1;
  drawOverlay();
};
$('aOk').onclick = async () => {
  const page = pages.get(ed.id);
  await busy('Traitement…', async () => commit(page, await renderPage(page)));
  renderGrid();
  setMode('filter');
};

/* ------------------------------ signature ------------------------------ */

const sig = { color: '#1537a8', drawing: false, last: null, dirty: false };
const pad = $('sigPad');
const pctx = pad.getContext('2d');

function clearPad() {
  pctx.clearRect(0, 0, pad.width, pad.height);
  sig.dirty = false;
}
function padPoint(e) {
  const r = pad.getBoundingClientRect();
  return { x: ((e.clientX - r.left) / r.width) * pad.width, y: ((e.clientY - r.top) / r.height) * pad.height };
}
pad.addEventListener('pointerdown', (e) => {
  sig.drawing = true;
  sig.last = padPoint(e);
  sig.mid = sig.last;
  pad.setPointerCapture(e.pointerId);
  e.preventDefault();
});
pad.addEventListener('pointermove', (e) => {
  if (!sig.drawing) return;
  const p = padPoint(e);
  const mid = { x: (sig.last.x + p.x) / 2, y: (sig.last.y + p.y) / 2 };
  pctx.strokeStyle = sig.color;
  pctx.lineWidth = 6;
  pctx.lineCap = pctx.lineJoin = 'round';
  pctx.beginPath();
  pctx.moveTo(sig.mid.x, sig.mid.y);
  pctx.quadraticCurveTo(sig.last.x, sig.last.y, mid.x, mid.y);
  pctx.stroke();
  sig.last = p;
  sig.mid = mid;
  sig.dirty = true;
});
pad.addEventListener('pointerup', () => { sig.drawing = false; });
pad.addEventListener('pointercancel', () => { sig.drawing = false; });

function setSigColor(c, btn) {
  sig.color = c;
  $('sigBlue').classList.toggle('on', btn === 'sigBlue');
  $('sigBlack').classList.toggle('on', btn === 'sigBlack');
  // Recolore l'encre déjà tracée.
  const img = pctx.getImageData(0, 0, pad.width, pad.height);
  const d = img.data;
  const [r, g, b] = [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
  for (let j = 0; j < d.length; j += 4) if (d[j + 3]) { d[j] = r; d[j + 1] = g; d[j + 2] = b; }
  pctx.putImageData(img, 0, 0);
}
$('sigBlue').onclick = () => setSigColor('#1537a8', 'sigBlue');
$('sigBlack').onclick = () => setSigColor('#111111', 'sigBlack');
$('sigClear').onclick = clearPad;

$('aSig').onclick = async () => {
  clearPad();
  const saved = await store.getMeta('signature');
  if (saved) {
    const im = await loadImg(saved);
    const s = Math.min(pad.width / im.width, pad.height / im.height) * 0.9;
    pctx.drawImage(im, (pad.width - im.width * s) / 2, (pad.height - im.height * s) / 2, im.width * s, im.height * s);
    sig.dirty = true;
  }
  $('sigDlg').showModal();
};

$('sigPhoto').onchange = async () => {
  const f = $('sigPhoto').files[0];
  $('sigPhoto').value = '';
  if (!f) return;
  await busy('Extraction de la signature…', async () => {
    const c = await blobToCanvas(f, 1600);
    const q = detectQuad(c);
    const flat = q ? warp(c, q, 1600) : c;
    const ink = trimAlpha(inkToAlpha(flat), 4);
    if (!ink) { toast('Aucune signature trouvée sur la photo.'); return; }
    clearPad();
    const s = Math.min(pad.width / ink.width, pad.height / ink.height) * 0.95;
    pctx.drawImage(ink, (pad.width - ink.width * s) / 2, (pad.height - ink.height * s) / 2, ink.width * s, ink.height * s);
    sig.dirty = true;
  });
};

$('sigUse').onclick = async () => {
  const ink = sig.dirty && trimAlpha(pad, 6);
  if (!ink) { toast('Signez d\'abord dans le cadre.'); return; }
  const src = ink.toDataURL('image/png');
  await store.putMeta('signature', src);
  $('sigDlg').close();
  const page = pages.get(ed.id);
  const w = 0.35, h = w * ink.height / ink.width;
  page.overlays.push({ t: 'sig', src, cx: 0.7, cy: 0.82, w, h });
  ed.sel = page.overlays.length - 1;
  drawOverlay();
};

/* ------------------------------ exportation ------------------------------ */

const ex = { files: null, token: 0 };
const MM = 72 / 25.4;

function pageLayout(w, h, kind) {
  const portrait = h >= w;
  const std = PAGE_SIZES[kind === 'letter' ? 'letter' : 'a4'];
  const [PW, PH] = portrait ? std : [std[1], std[0]];
  const s = Math.min(PW / w, PH / h);
  let bw = w * s, bh = h * s;
  if (kind === 'fit') return { size: [bw, bh], box: [0, 0, bw, bh] };
  // Proportions presque identiques à la page : on remplit toute la page.
  if (Math.abs(bw - PW) / PW < 0.035 && Math.abs(bh - PH) / PH < 0.035) { bw = PW; bh = PH; }
  return { size: [PW, PH], box: [(PW - bw) / 2, (PH - bh) / 2, bw, bh] };
}

// Une « feuille » = une page du fichier final.
function sheetPlan(kind) {
  if (kind !== 'id') return doc.ids.map(id => [id]);
  const out = [];
  for (let i = 0; i < doc.ids.length; i += 2) out.push(doc.ids.slice(i, i + 2));
  return out;
}

async function renderSheet(ids, kind, dpi, wm) {
  if (kind === 'id') {
    // Recto et verso l'un sous l'autre, à la taille réelle d'une carte (85,6 mm).
    const [PWpt, PHpt] = PAGE_SIZES.a4;
    const W = Math.round((PWpt / 72) * dpi), H = Math.round((PHpt / 72) * dpi);
    const sheet = makeCanvas(W, H);
    const ctx = sheet.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, W, H);
    const cardW = (85.6 / 25.4) * dpi;
    for (let k = 0; k < ids.length; k++) {
      let c = await blobToCanvas(pages.get(ids[k]).proc, 1e5);
      if (c.height > c.width) c = rotateCanvas(c, 90);
      const cardH = cardW * c.height / c.width;
      const cy = H * (k === 0 ? 0.25 : 0.58);
      ctx.drawImage(resizeCanvas(c, cardW, cardH), (W - cardW) / 2, cy - cardH / 2);
    }
    drawWatermark(sheet, wm);
    return { canvas: sheet, lay: { size: [PWpt, PHpt], box: [0, 0, PWpt, PHpt] } };
  }
  const c = await blobToCanvas(pages.get(ids[0]).proc, 1e5);
  const lay = pageLayout(c.width, c.height, kind);
  const tw = Math.round((lay.box[2] / 72) * dpi), th = Math.round((lay.box[3] / 72) * dpi);
  const scaled = tw < c.width ? resizeCanvas(c, tw, th) : c;
  drawWatermark(scaled, wm);
  return { canvas: scaled, lay };
}

async function encodeAll(plan, kind, dpi, q, wm, token) {
  const out = [];
  for (const ids of plan) {
    const { canvas, lay } = await renderSheet(ids, kind, dpi, wm);
    const blob = await canvasToBlob(canvas, 'image/jpeg', q);
    out.push({ blob, lay, px: [canvas.width, canvas.height] });
    if (token !== ex.token) return null;
    await nextFrame();
  }
  return out;
}

// Réglages essayés dans l'ordre pour tenir sous la taille maximale :
// on baisse d'abord la compression, puis la résolution, sans descendre
// sous ce qui reste lisible.
function compressionSteps(dpi, q0) {
  const all = [[dpi, q0], [dpi, 0.72], [200, 0.68], [150, 0.68], [150, 0.55], [130, 0.5], [120, 0.42], [100, 0.4], [90, 0.32]];
  const seen = new Set();
  return all.filter(([d, q]) => d <= dpi && q <= q0 && !seen.has(`${d}|${q}`) && seen.add(`${d}|${q}`));
}

const OCR_FORMATS = ['pdfocr', 'docx', 'txt'];
const LOW_CONF = 60;

// Lit le texte de chaque page (une seule fois : le résultat est gardé avec la page).
async function ensureOcr(lang, token) {
  const out = [];
  for (let i = 0; i < doc.ids.length; i++) {
    const page = pages.get(doc.ids[i]);
    if (!page.ocr || page.ocr.lang !== lang) {
      const label = `Lecture du texte… page ${i + 1}/${doc.ids.length}`;
      $('exInfo').textContent = label;
      const paragraphs = await recognize(page.proc, lang, (p) => {
        if (token === ex.token) $('exInfo').textContent = `${label} (${Math.round(p * 100)} %)`;
      });
      page.ocr = { lang, w: page.w, h: page.h, paragraphs };
      await store.putPage(page);
    }
    if (token !== ex.token) return null;
    out.push(page.ocr);
  }
  return out;
}

// Mots de la page en points PDF, placés sur l'image (ligne de base en bas du mot).
function wordsInPdf(ocr, box) {
  const [bx, by, bw, bh] = box;
  const sx = bw / ocr.w, sy = bh / ocr.h;
  const words = [];
  for (const p of ocr.paragraphs)
    for (const l of p.lines)
      for (const w of l.words) {
        const [x0, y0, x1, y1] = w.b;
        const h = (y1 - y0) * sy;
        words.push({ t: w.t, x: bx + x0 * sx, y: by + (ocr.h - y1) * sy + h * 0.21, w: (x1 - x0) * sx, h });
      }
  return words;
}

function updateExportForm() {
  const format = $('exFormat').value;
  const textOnly = format === 'docx' || format === 'txt';
  $('rowLang').hidden = !OCR_FORMATS.includes(format);
  for (const id of ['rowPage', 'rowDpi', 'rowMax', 'rowWm']) $(id).hidden = textOnly;
}

async function prepareExport() {
  const token = ++ex.token;
  ex.files = null;
  updateExportForm();
  $('exShare').disabled = $('exSave').disabled = true;
  $('exWarn').hidden = true;
  $('exInfo').textContent = 'Préparation du fichier…';
  const name = safeName($('exName').value);
  const format = $('exFormat').value, dpi = +$('exDpi').value, kind = $('exPage').value;
  const lang = $('exLang').value;
  const maxBytes = +$('exMax').value * 1000;
  const wm = $('exWm').value;
  const q0 = dpi >= 300 ? 0.9 : dpi >= 200 ? 0.86 : 0.8;
  const plan = sheetPlan(kind);
  const warns = [];
  const n = doc.ids.length;

  let ocr = null;
  if (OCR_FORMATS.includes(format)) {
    try {
      ocr = await ensureOcr(lang, token);
    } catch (e) {
      console.error(e);
      if (token !== ex.token) return;
      $('exInfo').textContent = 'La lecture du texte a échoué sur cet appareil.';
      return;
    }
    if (!ocr) return;
    const low = ocr.reduce((s, o) => s + o.paragraphs.reduce((a, p) => a + p.lines.reduce((b, l) => b + l.words.filter(w => w.c < LOW_CONF).length, 0), 0), 0);
    const all = ocr.reduce((s, o) => s + o.paragraphs.reduce((a, p) => a + p.lines.reduce((b, l) => b + l.words.length, 0), 0), 0);
    if (!all) warns.push('Aucun texte reconnu. Essayez le rendu « Scanner de bureau » ou « Contrasté », ou vérifiez la langue.');
    else if (format === 'docx' && low) warns.push(`${low} mot(s) sur ${all} à vérifier : ils sont surlignés en jaune dans Word.`);
    else if (low) warns.push(`${low} mot(s) sur ${all} lus avec un doute.`);
  }

  if (format === 'docx' || format === 'txt') {
    const file = format === 'docx'
      ? new File([buildDocx(ocr, { title: name })], `${name}.docx`,
        { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
      : new File([plainText(ocr.map(o => o.paragraphs))], `${name}.txt`, { type: 'text/plain;charset=utf-8' });
    if (token !== ex.token) return;
    ex.files = [file];
    $('exInfo').textContent = `${n} page${n > 1 ? 's' : ''} · texte modifiable · ${fmtSize(file.size)}`;
    $('exWarn').textContent = warns.join(' ');
    $('exWarn').hidden = !warns.length;
    $('exSave').disabled = $('exShare').disabled = false;
    return;
  }

  const pdfLike = format === 'pdf' || format === 'pdfocr';
  const pack = async (out) => {
    if (pdfLike) {
      const pdfPages = [];
      for (let i = 0; i < out.length; i++) {
        const o = out[i];
        const pg = { jpeg: new Uint8Array(await o.blob.arrayBuffer()), px: o.px, size: o.lay.size, box: o.lay.box };
        if (ocr && kind !== 'id') pg.words = wordsInPdf(ocr[i], o.lay.box);
        pdfPages.push(pg);
      }
      return [new File([buildPdf(pdfPages, { title: name })], `${name}.pdf`, { type: 'application/pdf' })];
    }
    return out.map((o, i) => new File([o.blob],
      out.length > 1 ? `${name} - page ${i + 1}.jpg` : `${name}.jpg`, { type: 'image/jpeg' }));
  };
  // Pour les JPG, la limite s'applique à chaque image (c'est ce que vérifient les sites).
  const tooBig = (files) => maxBytes && (pdfLike
    ? files[0].size > maxBytes : files.some(f => f.size > maxBytes));

  let files, used = [dpi, q0], fits = true;
  for (const [d, q] of maxBytes ? compressionSteps(dpi, q0) : [[dpi, q0]]) {
    $('exInfo').textContent = maxBytes ? `Compression… (${d} ppp)` : 'Préparation du fichier…';
    const out = await encodeAll(plan, kind, d, q, wm, token);
    if (!out) return;
    files = await pack(out);
    used = [d, q];
    if (!tooBig(files)) { fits = true; break; }
    fits = false;
  }
  if (token !== ex.token) return;
  ex.files = files;
  const total = files.reduce((s, f) => s + f.size, 0);
  let info = `${n} page${n > 1 ? 's' : ''} · ${files.length} fichier${files.length > 1 ? 's' : ''} · ${fmtSize(total)} · ${used[0]} ppp`;
  if (format === 'pdfocr' && kind !== 'id') info += ' · texte cherchable';
  if (maxBytes && fits && (used[0] !== dpi || used[1] !== q0)) info += ` (compressé pour tenir sous ${fmtSize(maxBytes)})`;
  $('exInfo').textContent = info;
  if (maxBytes && !fits) warns.push(`Impossible de descendre sous ${fmtSize(maxBytes)} en restant lisible. Retirez des pages ou envoyez-les en plusieurs fichiers.`);
  const bad = doc.ids.filter(id => isBad(pages.get(id))).length;
  if (bad) warns.push(`⚠️ ${bad} page(s) floue(s) ou avec reflet : vérifiez avant d'envoyer.`);
  if (kind === 'id' && n % 2) warns.push('Nombre impair de pages : la dernière carte sera seule sur sa feuille.');
  if (kind === 'id' && format === 'pdfocr') warns.push('Mise en page carte : le texte cherchable n\'est pas ajouté.');
  $('exWarn').textContent = warns.join(' ');
  $('exWarn').hidden = !warns.length;
  $('exSave').disabled = false;
  $('exShare').disabled = false;
}

function download(file) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(file);
  a.download = file.name;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 60000);
}

$('exportBtn').onclick = () => {
  $('exName').value = doc.name;
  $('exWm').value = prefs.get('wm');
  // Que des cartes (CNI recto + verso…) : on propose la photocopie sur une page A4.
  const isCard = (p) => p && p.w && Math.abs(Math.max(p.w, p.h) / Math.min(p.w, p.h) - 85.6 / 54) < 0.07;
  if (doc.ids.length && doc.ids.every(id => isCard(pages.get(id)))) $('exPage').value = 'id';
  $('exportDlg').showModal();
  prepareExport();
};
for (const id of ['exFormat', 'exDpi', 'exPage', 'exMax', 'exLang']) $(id).onchange = prepareExport;
let nameTimer;
$('exName').oninput = () => {
  doc.name = $('exName').value;
  $('docName').value = doc.name;
  saveLib();
  clearTimeout(nameTimer);
  nameTimer = setTimeout(prepareExport, 400);
};
$('exWm').oninput = () => {
  prefs.set('wm', $('exWm').value);
  clearTimeout(nameTimer);
  nameTimer = setTimeout(prepareExport, 600);
};
$('exSave').onclick = () => {
  if (!ex.files) return;
  ex.files.forEach((f, i) => setTimeout(() => download(f), i * 300));
  toast('Fichier enregistré dans « Téléchargements ».');
};
$('exShare').onclick = async () => {
  if (!ex.files) return;
  const data = { files: ex.files, title: safeName($('exName').value) };
  const saveInstead = (why) => {
    ex.files.forEach((f, i) => setTimeout(() => download(f), i * 300));
    toast(`${why} Le fichier a été enregistré dans « Téléchargements » : envoyez-le depuis WhatsApp ou Gmail (trombone > Document).`, 7000);
  };
  let ok = false;
  try { ok = !!(navigator.canShare && navigator.canShare(data)); } catch { ok = false; }
  if (!ok) { saveInstead('Ce téléphone ne permet pas de partager ce type de fichier directement.'); return; }
  try { await navigator.share(data); }
  catch (e) {
    // Chrome sur Android refuse de partager certains types (Word…).
    if (e.name !== 'AbortError') saveInstead('Partage direct impossible pour ce fichier.');
  }
};

/* ------------------------------ entrées ------------------------------ */

function bindInput(id, edit) {
  const inp = $(id);
  inp.onchange = async () => {
    const files = [...inp.files];
    inp.value = '';
    if (id === 'camNext') closeEditor();
    await addFiles(files, { edit });
  };
}
bindInput('camIn', true);
bindInput('camNext', true);
bindInput('fileIn', true);

$('camRetake').onchange = async () => {
  const f = $('camRetake').files[0];
  $('camRetake').value = '';
  const page = pages.get(ed.id);
  if (!f || !page) return;
  await busy('Analyse de la photo…', async () => {
    await loadPhoto(page, f);
    page.rot = 0;
    page.overlays = [];
    await commit(page, await renderPage(page));
  });
  renderGrid();
  setMode('crop');
};

$('docName').oninput = () => { doc.name = $('docName').value; saveLib(); };
$('docName').onblur = () => {
  doc.name = safeName($('docName').value);
  $('docName').value = doc.name;
  saveLib();
};

$('newDocBtn').onclick = () => newDoc();
$('aboutBtn').onclick = () => { $('appVersion').textContent = APP_VERSION; $('aboutDlg').showModal(); };
$('libBtn').onclick = async () => {
  await renderLib();
  $('libDlg').showModal();
};
$('bkSave').onclick = () => backupAll();
$('bkLoad').onchange = async () => {
  const f = $('bkLoad').files[0];
  $('bkLoad').value = '';
  if (f) await restoreBackup(f);
};

/* ------------------------------ démarrage ------------------------------ */

async function init() {
  let saved = await store.getMeta('library');
  if (!saved) {
    // Ancienne version : un seul document.
    const old = await store.getMeta('doc');
    saved = { docs: old ? [{ id: uid(), name: old.name || defaultName(), ids: old.ids || [], updated: Date.now() }] : [] };
    if (saved.docs.length) saved.current = saved.docs[0].id;
  }
  lib.docs = saved.docs || [];
  if (!lib.docs.length) newDocRecord();
  const cur = lib.docs.find(d => d.id === saved.current) || lib.docs[0];
  await openDoc(cur.id);
  // Raccourci « Mes documents » de l'icône de l'application.
  if (new URLSearchParams(location.search).get('open') === 'library') $('libBtn').click();
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
}
init();

// Pour les tests automatiques.
window.__vraiscan = { lib, get doc() { return doc; }, pages, addFiles, prepareExport, ex, restoreBackup };
