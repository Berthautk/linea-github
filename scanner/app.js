import {
  MAX_SRC, makeCanvas, blobToCanvas, decodePhoto, canvasToBlob, detectQuad, defaultQuad, orderQuad,
  warp, rotateCanvas, enhance, fitCanvas, resizeCanvas, FILTERS,
  assessQuality, drawWatermark, inkToAlpha, trimAlpha, estimateSkew, rotateSmall, cleanBorders,
} from './imgproc.js';
import { buildPdf, buildTextPdf, PAGE_SIZES } from './pdf.js';
import { recognize, plainText, paragraphText } from './ocr.js';
import { buildDocx, zip } from './docx.js';
import * as store from './store.js';
import { t, L, getLang, setLang, applyI18n } from './i18n.js';
import { CATEGORIES, PIECES, DOSSIER_NAMES, SYNONYMS, pieceById, slug } from './catalog.js';
import { isPdf, openPdf, renderPdfPage, closePdf } from './pdfin.js';
import { createReader } from './reader.js';
import { createTextEditor, refitOcr, ocrUnreliable } from './textedit.js';
import { createCamera, liveCameraSupported } from './camera.js';

export const APP_VERSION = '1.4.1';

const $ = (id) => document.getElementById(id);
const nextFrame = () => new Promise(r => setTimeout(r, 30));

// Bibliothèque : documents simples et dossiers de candidature.
// Un dossier a en plus : kind 'dossier', pieces [{ key, cid, label, ids }], holder.
// Pour tous : ids = toutes les pages, dans l'ordre.
const lib = { docs: [] };
let doc = null;                    // document ou dossier ouvert
const pages = new Map();           // pages du document ouvert
const thumbUrls = new Map();

/* ------------------------------ utilitaires ------------------------------ */

const prefs = {
  get(k, d = '') { try { return localStorage.getItem('ls.' + k) ?? d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem('ls.' + k, v); } catch { /* navigation privée */ } },
};

function stamp() {
  const d = new Date(), p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}h${p(d.getMinutes())}`;
}
function defaultName(kind = 'doc') {
  return `${t(kind === 'dossier' ? 'name.dossier' : 'name.scan')} ${stamp()}`;
}

function safeName(s) {
  const n = (s || '').replace(/[\\/:*?"<>|\u0000-\u001f]+/g, ' ').replace(/\s+/g, ' ').trim();
  return n.slice(0, 120) || defaultName();
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function fmtSize(n) {
  if (n >= 1e6) return t('size.mb', { n: (n / 1e6).toFixed(1).replace('.', getLang() === 'fr' ? ',' : '.') });
  return t('size.kb', { n: Math.max(1, Math.round(n / 1e3)) });
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

let busyDepth = 0;
async function busy(text, fn) {
  busyDepth++;
  $('busyText').textContent = text;
  $('busy').hidden = false;
  await nextFrame();
  try { return await fn(); }
  finally { if (--busyDepth === 0) $('busy').hidden = true; }
}
function setBusyText(s) { $('busyText').textContent = s; }

let toastTimer;
function toast(msg, ms = 3500) {
  const el = $('toast');
  el.textContent = msg;
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (el.hidden = true), ms);
}

function saveLib() {
  if (doc) doc.updated = Date.now();
  return store.putMeta('library', {
    docs: lib.docs.map(d => ({
      ...d, ids: d.ids.slice(),
      pieces: d.pieces ? d.pieces.map(p => ({ ...p, ids: p.ids.slice() })) : undefined,
    })),
    current: doc && doc.id,
  });
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

// Partage direct ; si le téléphone refuse, le fichier est enregistré.
async function shareOrSave(files, title, onDone) {
  const data = { files, title };
  const saveInstead = (why) => {
    files.forEach((f, i) => setTimeout(() => download(f), i * 300));
    toast(t('toast.savedInstead', { why }), 7000);
    onDone('saved');
  };
  let ok = false;
  try { ok = !!(navigator.canShare && navigator.canShare(data)); } catch { ok = false; }
  if (!ok) { saveInstead(t('toast.shareNo')); return; }
  try {
    await navigator.share(data);
    onDone('shared');
  } catch (e) {
    // Chrome sur Android refuse de partager certains types (Word, zip…).
    if (e.name !== 'AbortError') saveInstead(t('toast.shareFail'));
  }
}

// Petit sélecteur de fichier créé à la volée (appareil photo ou galerie).
function pickFiles({ camera, multiple }, cb) {
  const inp = document.createElement('input');
  inp.type = 'file';
  inp.accept = 'image/*';
  if (camera) inp.setAttribute('capture', 'environment');
  if (multiple) inp.multiple = true;
  inp.onchange = () => { const f = [...inp.files]; if (f.length) cb(f); };
  inp.click();
}

const isDossier = () => !!(doc && doc.kind === 'dossier');

/* ------------------------------ traitement ------------------------------ */

// Garde en mémoire la photo d'origine et les étapes de la page ouverte.
const cache = { id: null, orig: null, warpKey: null, warped: null, baseKey: null, base: null };

function resetCache(id, orig = null) {
  Object.assign(cache, { id, orig, warpKey: null, warped: null, baseKey: null, base: null });
}

async function getOrig(page) {
  if (cache.id !== page.id || !cache.orig) resetCache(page.id, await blobToCanvas(page.orig || page.proc, MAX_SRC));
  return cache.orig;
}

async function getWarped(page) {
  const orig = await getOrig(page);
  const key = JSON.stringify(page.quad);
  if (cache.warpKey !== key) {
    const flat = warp(orig, page.quad, page.maxLong || undefined);
    // Contrôle de netteté et redressement fin sur une seule copie réduite.
    const small = fitCanvas(flat, 1400);
    page.quality = assessQuality(small);
    // Redressement fin : lignes de texte parfaitement horizontales (pas pour une photo d'identité).
    page.skew = page.kind === 'photo' || page.src === 'pdf' ? 0 : estimateSkew(small);
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
  // Page de PDF : l'image d'origine n'est gardée à part qu'à la première retouche.
  if (!page.orig) page.orig = page.proc;
  page.proc = await canvasToBlob(out, 'image/jpeg', 0.92);
  // L'image a changé : le texte sera relu, sauf s'il a été corrigé à la main
  // (il est alors gardé, ses positions suivent la rotation ou le recadrage).
  const kept = page.ocr && page.ocr.edited && page.w
    ? refitOcr(page.ocr, page.w, page.h, out.width, out.height, page.turn || 0) : null;
  page.ocr = kept;
  page.turn = 0;
  if (page.transc && page.transc.w !== out.width) page.transc = null;
  if (doc) doc.editedAt = Date.now();
  page.w = out.width;
  page.h = out.height;
  page.thumb = await canvasToBlob(fitCanvas(out, 420), 'image/jpeg', 0.8);
  const old = thumbUrls.get(page.id);
  if (old) URL.revokeObjectURL(old);
  thumbUrls.set(page.id, URL.createObjectURL(page.thumb));
  await store.putPage(page);
}

// Photo d'identité : cadre centré au format 4:5 (ou toute l'image si elle
// est déjà recadrée) ; pas de détection de bords.
function photoQuad(w, h) {
  const target = 4 / 5;
  const r = w / h;
  if (Math.abs(r - target) < 0.12 || Math.abs(r - 1) < 0.06) return defaultQuad(w, h, 0);
  let cw = w, ch = h;
  if (r > target) cw = h * target; else ch = w / target;
  const x = (w - cw) / 2, y = (h - ch) / 2;
  return [{ x, y }, { x: x + cw, y }, { x: x + cw, y: y + ch }, { x, y: y + ch }];
}

async function loadPhoto(page, file, quadHint = null) {
  // Une seule lecture de la photo ; les bords sont cherchés sur une petite copie.
  const { canvas, small, resized } = await decodePhoto(file, MAX_SRC);
  // Photo JPEG gardée telle quelle (pas de réencodage : plus rapide, sans perte).
  page.orig = !resized && file.type === 'image/jpeg' ? file : await canvasToBlob(canvas, 'image/jpeg', 0.93);
  const k = canvas.width / small.width;
  const found = page.kind === 'photo' ? null : detectQuad(small);
  page.quad = page.kind === 'photo'
    ? photoQuad(canvas.width, canvas.height)
    : (found && found.map(p => ({ x: p.x * k, y: p.y * k }))) || hintQuad(quadHint, canvas) || defaultQuad(canvas.width, canvas.height);
  resetCache(page.id, canvas);
}

// Carte (CNI, permis…) ou photo d'identité : fond coloré et photo, on garde
// les vraies couleurs au lieu de blanchir le fond.
function autoFilter(page, warped) {
  const isCard = Math.abs(Math.max(warped.width, warped.height) / Math.min(warped.width, warped.height) - 85.6 / 54) < 0.07;
  if (page.kind === 'photo' || page.kind === 'card' || isCard) page.filter = 'color';
}

// Cadre vu dans l'aperçu de la caméra, repris si la photo a le même format.
function hintQuad(h, canvas) {
  if (!h || !h.quad || !h.frameW) return null;
  if (Math.abs(canvas.width / canvas.height - h.frameW / h.frameH) > 0.03) return null;
  const k = canvas.width / h.frameW;
  return h.quad.map(p => ({ x: p.x * k, y: p.y * k }));
}

// Une photo → une page prête (recadrée, redressée, rendu appliqué, enregistrée).
// maxLong : côté long de la page (défaut : A4 à 300 ppp ; plus petit = plus rapide).
async function makePage(file, { kind = 'doc', quadHint = null, maxLong = 0 } = {}) {
  const page = { id: uid(), rot: 0, filter: defaultFilter(), overlays: [], kind };
  if (maxLong) page.maxLong = maxLong;
  await loadPhoto(page, file, quadHint);
  pages.set(page.id, page);
  autoFilter(page, await getWarped(page));
  await nextFrame();
  await commit(page, await renderPage(page));
  return page;
}

function defaultFilter() {
  const f = prefs.get('defFilter', 'desk');
  return FILTERS.some(x => x.id === f) ? f : 'desk';
}

// Ajoute des photos au document, ou à une pièce du dossier.
async function addFiles(files, { edit, piece = null, at = -1 }) {
  const pdfs = [...files].filter(isPdf);
  files = [...files].filter(f => f && !isPdf(f) && (f.type.startsWith('image/') || !f.type));
  if (pdfs.length) {
    const added = files.length ? await addFiles(files, { edit: false, piece, at }) : [];
    for (const f of pdfs) added.push(...await importPdf(f, { piece, at: at >= 0 ? at + added.length : -1 }));
    return added;
  }
  if (!files.length) return [];
  const added = [];
  const kind = piece ? (pieceById(piece.cid)?.kind || 'doc') : 'doc';
  await busy(t('busy.analyse'), async () => {
    // Une seule photo, ouverte au recadrage : elle n'est traitée qu'après
    // « Valider » (sinon elle le serait deux fois).
    const defer = edit && files.length === 1;
    for (let i = 0; i < files.length; i++) {
      if (files.length > 1) setBusyText(t('busy.pageOf', { i: i + 1, n: files.length }));
      try {
        let page;
        if (defer) {
          page = { id: uid(), rot: 0, filter: defaultFilter(), overlays: [], kind, autoFilter: true };
          await loadPhoto(page, files[i]);
          pages.set(page.id, page);
        } else page = await makePage(files[i], { kind });
        added.push(page.id);
      } catch (e) {
        console.error(e);
        toast(t('toast.badImage'));
      }
    }
    if (piece) {
      if (at >= 0) piece.ids.splice(at, 0, ...added); else piece.ids.push(...added);
      syncIds();
    } else {
      doc.ids.push(...added);
    }
    await saveLib();
  });
  refreshHome();
  if (edit && added.length && files.length === 1) openEditor(added[added.length - 1], 'crop');
  return added;
}

/* ------------------------------ import de PDF ------------------------------ */

let stopAsked = false;
$('busyStop').onclick = () => { stopAsked = true; $('busyStop').disabled = true; };

// Pages d'un PDF → pages du document (ou de la pièce du dossier). Un PDF
// importé dans un document qui a déjà des pages ouvre un nouveau document.
async function importPdf(file, { piece = null, at = -1 } = {}) {
  let pdf;
  try {
    pdf = await busy(t('busy.pdfOpen'), () => openPdf(file, (again) => prompt(t(again ? 'pdf.badPass' : 'pdf.pass'))));
  } catch (e) {
    console.error(e);
    toast(e && e.name === 'PasswordException' ? t('pdf.locked') : t('pdf.bad'));
    return [];
  }
  const n = pdf.numPages;
  // Place disponible (≈ 350 Ko par page).
  try {
    const est = await navigator.storage.estimate();
    if (est.quota && est.quota - est.usage < n * 350e3 && !confirm(t('pdf.space', { n }))) { closePdf(pdf); return []; }
  } catch { /* estimation indisponible */ }
  const title = (file.name || '').replace(/\.pdf$/i, '').replace(/[_]+/g, ' ').trim();
  if (!piece && !isDossier()) {
    if (doc.ids.length) await openDoc(newDocRecord('doc').id);
    if (title) { doc.name = safeName(title); $('docName').value = doc.name; }
  }
  const added = [];
  let withText = 0;
  stopAsked = false;
  $('busyStop').hidden = false;
  $('busyStop').disabled = false;
  try {
    await busy(t('busy.pdfPage', { i: 1, n }), async () => {
      for (let i = 1; i <= n && !stopAsked; i++) {
        setBusyText(t('busy.pdfPage', { i, n }));
        try {
          const { canvas, paragraphs, quality } = await renderPdfPage(pdf, i);
          const page = { id: uid(), rot: 0, filter: 'original', overlays: [], kind: 'doc', src: 'pdf', skew: 0 };
          page.proc = await canvasToBlob(canvas, 'image/jpeg', quality);
          page.quad = defaultQuad(canvas.width, canvas.height, 0);
          page.w = canvas.width;
          page.h = canvas.height;
          page.thumb = await canvasToBlob(fitCanvas(canvas, 420), 'image/jpeg', 0.8);
          if (paragraphs) { page.ocr = { lang: 'pdf', pdf: true, w: page.w, h: page.h, paragraphs }; withText++; }
          canvas.width = canvas.height = 0;
          await store.putPage(page);
          pages.set(page.id, page);
          thumbUrls.set(page.id, URL.createObjectURL(page.thumb));
          added.push(page.id);
          // Rangé au fur et à mesure : rien n'est perdu si l'application est fermée.
          if (piece) {
            if (at >= 0) piece.ids.splice(at + added.length - 1, 0, page.id); else piece.ids.push(page.id);
            syncIds();
          } else doc.ids.push(page.id);
          if (i % 10 === 0 || i === n) await saveLib();
        } catch (e) {
          console.error(e);
          toast(t('pdf.pageFail', { i }));
        }
        await nextFrame();
      }
      if (doc) doc.editedAt = Date.now();
      await saveLib();
    });
  } finally {
    $('busyStop').hidden = true;
    closePdf(pdf);
  }
  if (added.length >= 20 && navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
  refreshHome();
  if (!piece && added.length) showPdfDlg(added.length, n, withText);
  else if (added.length < n) toast(t('pdf.partial', { k: added.length, n }));
  return added;
}

function showPdfDlg(k, n, withText) {
  $('pdTitle').textContent = doc.name;
  const lines = [k < n ? t('pdf.partial', { k, n }) : t('pdf.done', { n: k })];
  if (withText === k) lines.push(t('pdf.hasText'));
  else if (!withText) lines.push(t('pdf.scanned'));
  else lines.push(t('pdf.mixed', { a: withText, b: k - withText }));
  $('pdInfo').textContent = lines.join(' ');
  $('pdfDlg').showModal();
}

$('pdRead').onclick = () => { $('pdfDlg').close(); reader.open({ index: 0, autoplay: true }); };
$('pdWord').onclick = () => {
  $('pdfDlg').close();
  $('exFormat').value = 'docx';
  $('exportBtn').click();
};

function isBad(p) {
  return !!(p && p.quality && (p.quality.blurry || p.quality.reflet));
}

/* ------------------------------ écran principal ------------------------------ */

function refreshHome() {
  if (isDossier()) renderDossier(); else renderGrid();
}

function showView() {
  const ds = isDossier();
  $('docView').hidden = ds;
  $('dossierView').hidden = !ds;
  $('docActions').hidden = ds;
  $('dsActions').hidden = !ds;
  $('tabDoc').classList.toggle('on', !ds);
  $('tabDossier').classList.toggle('on', ds);
  $('tabDoc').setAttribute('aria-selected', String(!ds));
  $('tabDossier').setAttribute('aria-selected', String(ds));
}

function renderGrid() {
  const grid = $('grid');
  grid.textContent = '';
  $('empty').hidden = doc.ids.length > 0;
  $('exportBtn').disabled = doc.ids.length === 0;
  updateFlow();
  updateReadRow();
  doc.ids.forEach((id, i) => {
    const tile = document.createElement('div');
    tile.className = 'tile';
    const img = document.createElement('img');
    img.alt = t('tile.page', { n: i + 1 });
    img.src = thumbUrls.get(id) || '';
    const num = document.createElement('span');
    num.className = 'num';
    num.textContent = i + 1;
    tile.append(img, num);
    if (isBad(pages.get(id))) {
      const f = document.createElement('span');
      f.className = 'flag';
      f.textContent = '⚠️';
      f.title = t('tile.bad');
      tile.append(f);
    }
    const mv = document.createElement('div');
    mv.className = 'mv';
    const left = document.createElement('button');
    left.type = 'button'; left.textContent = '‹'; left.disabled = i === 0;
    left.setAttribute('aria-label', t('tile.before'));
    const right = document.createElement('button');
    right.type = 'button'; right.textContent = '›'; right.disabled = i === doc.ids.length - 1;
    right.setAttribute('aria-label', t('tile.after'));
    left.onclick = (e) => { e.stopPropagation(); move(i, -1); };
    right.onclick = (e) => { e.stopPropagation(); move(i, 1); };
    mv.append(left, right);
    tile.append(mv);
    tile.onclick = () => openEditor(id, 'filter');
    grid.append(tile);
  });
}

// « Lire et écouter » : avec la page où l'on s'était arrêté.
function updateReadRow() {
  const n = doc.ids.length;
  $('readRow').hidden = !n;
  if (!n) return;
  const i = doc.readPos ? doc.ids.indexOf(doc.readPos.id) : -1;
  const ready = doc.ids.filter(id => { const p = pages.get(id); return p && p.ocr; }).length;
  const parts = [];
  if (i >= 0) parts.push(t('rd.resume', { i: i + 1, n }));
  else parts.push(t('lib.pages', { n }));
  if (ready < n) parts.push(t('rd.textReady', { r: ready, n }));
  $('readInfo').textContent = parts.join(' · ');
}

// Où en est le document : 1 photographier, 2 vérifier (page floue ou avec
// reflet), 3 envoyer, 4 envoyé. Seul le bouton de l'étape suivante ressort.
function flowStep() {
  const n = doc.ids.length;
  if (!n) return 1;
  if (doc.exportedAt && doc.exportedAt >= (doc.editedAt || 0)) return 4;
  if (doc.ids.some(id => isBad(pages.get(id)))) return 2;
  return 3;
}

function updateFlow() {
  const step = flowStep();
  const n = doc.ids.length;
  const bad = doc.ids.filter(id => isBad(pages.get(id))).length;
  document.querySelectorAll('#steps li').forEach(li => {
    const k = +li.dataset.step;
    li.className = step === 4 || k < step || (k === 2 && step === 3) ? 'done'
      : k === step ? (step === 2 ? 'warn' : 'now') : '';
    li.querySelector('.dot').textContent = li.className === 'done' ? '✓' : k;
  });
  const cam = $('camBtn'), exp = $('exportBtn');
  cam.className = 'btn' + (step === 1 ? ' primary big' : '');
  $('camLabel').textContent = step === 1 ? t('btn.scan') : t('btn.addPage');
  exp.className = 'btn' + (step === 3 ? ' accent big' : step === 2 ? ' accent' : step === 4 ? ' sent' : '');
  exp.textContent = step === 4 ? t('btn.sent') : t('btn.send');
  $('newDocBtn').classList.toggle('hl', step === 4);
  $('nextHint').textContent = [
    '', t('hint.1'), bad > 1 ? t('hint.2many', { n: bad }) : t('hint.2one'), t('hint.3', { n }), t('hint.4'),
  ][step];
}

function markExported(closeBtn) {
  doc.exportedAt = Date.now();
  saveLib();
  if (!isDossier()) updateFlow(); else renderDossier();
  $(closeBtn).textContent = t('ex.finish');
  $(closeBtn).classList.add('primaryclose');
}

function move(i, dir) {
  const j = i + dir;
  if (j < 0 || j >= doc.ids.length) return;
  [doc.ids[i], doc.ids[j]] = [doc.ids[j], doc.ids[i]];
  doc.editedAt = Date.now();
  saveLib();
  renderGrid();
}

/* ------------------------------ bibliothèque ------------------------------ */

function syncIds() {
  if (doc && doc.pieces) doc.ids = doc.pieces.flatMap(p => p.ids);
}

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
  if (doc.kind === 'dossier') {
    doc.pieces = (doc.pieces || []).map(pc => ({ ...pc, ids: pc.ids.filter(x => pages.has(x)) }));
    syncIds();
    prefs.set('lastDossier', doc.id);
    $('dsName').value = doc.name;
  } else {
    prefs.set('lastDoc', doc.id);
    $('docName').value = doc.name;
  }
  await saveLib();
  showView();
  refreshHome();
}

function newDocRecord(kind = 'doc') {
  const d = { id: uid(), name: defaultName(kind), ids: [], updated: Date.now(), kind };
  if (kind === 'dossier') { d.pieces = []; d.holder = ''; }
  lib.docs.unshift(d);
  return d;
}

async function newDoc() {
  const kind = isDossier() ? 'dossier' : 'doc';
  if (!doc.ids.length) {
    doc.name = defaultName(kind);
    if (kind === 'dossier') { $('dsName').value = doc.name; doc.pieces = []; } else $('docName').value = doc.name;
    return saveLib();
  }
  await openDoc(newDocRecord(kind).id);
  toast(t('toast.newDoc'));
}

// Onglets : chacun rouvre le dernier document (ou dossier) utilisé.
async function switchTab(kind) {
  if ((kind === 'dossier') === isDossier()) return;
  const lastId = prefs.get(kind === 'dossier' ? 'lastDossier' : 'lastDoc');
  let d = lib.docs.find(x => x.id === lastId && (x.kind === 'dossier') === (kind === 'dossier'));
  if (!d) d = lib.docs.slice().sort((a, b) => (b.updated || 0) - (a.updated || 0))
    .find(x => (x.kind === 'dossier') === (kind === 'dossier'));
  if (!d) d = newDocRecord(kind);
  await busy(t('busy.open'), () => openDoc(d.id));
}

async function deleteDoc(id) {
  const d = lib.docs.find(x => x.id === id);
  if (!d || !confirm(t('confirm.delDoc', { name: d.name }))) return;
  const ids = d.id === doc.id ? doc.ids : d.ids;
  for (const pid of ids) await store.delPage(pid);
  lib.docs = lib.docs.filter(x => x.id !== id);
  if (d.id === doc.id) {
    const kind = d.kind === 'dossier' ? 'dossier' : 'doc';
    const next = lib.docs.find(x => (x.kind === 'dossier') === (kind === 'dossier')) || newDocRecord(kind);
    await openDoc(next.id);
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
    b.textContent = `${d.kind === 'dossier' ? '📂' : '📄'} ${d.name}`;
    const s = document.createElement('span');
    const date = d.updated ? new Date(d.updated).toLocaleDateString(getLang() === 'en' ? 'en-GB' : 'fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
    const count = d.kind === 'dossier'
      ? t('lib.pieces', { n: (d.id === doc.id ? doc.pieces : d.pieces || []).length })
      : t('lib.pages', { n: ids.length }) + (d.readPos && ids.indexOf(d.readPos.id) >= 0
        ? ' · 🎧 ' + t('rd.pShort', { i: ids.indexOf(d.readPos.id) + 1 }) : '');
    s.textContent = `${count}${date ? ' · ' + date : ''}${d.id === doc.id ? ' · ' + t('lib.open') : ''}`;
    meta.append(b, s);
    const del = document.createElement('button');
    del.type = 'button';
    del.textContent = '🗑';
    del.setAttribute('aria-label', t('lib.del', { name: d.name }));
    del.onclick = (e) => { e.stopPropagation(); deleteDoc(d.id); };
    it.append(thumb, meta, del);
    it.onclick = async () => {
      $('libDlg').close();
      if (d.id !== doc.id) await busy(t('busy.open'), () => openDoc(d.id));
    };
    box.append(it);
  }
}

// Sauvegarde complète : un seul fichier avec tous les documents, dossiers et photos.
async function backupAll() {
  await busy(t('busy.backup'), async () => {
    const out = { app: 'vraiscan', version: 2, created: new Date().toISOString(), docs: [] };
    const sig = await store.getMeta('signature');
    if (sig) out.signature = sig;
    for (const d of lib.docs) {
      const cur = d.id === doc.id;
      const ids = cur ? doc.ids : d.ids;
      const od = { name: d.name, updated: d.updated, kind: d.kind || 'doc', holder: d.holder, pages: [] };
      if (d.kind === 'dossier') {
        od.pieces = (cur ? doc.pieces : d.pieces || []).map(pc => ({ cid: pc.cid, label: pc.label, n: pc.ids.length }));
      }
      for (const pid of ids) {
        const p = cur && pages.get(pid) ? pages.get(pid) : await store.getPage(pid);
        if (!p) continue;
        od.pages.push({
          quad: p.quad, rot: p.rot, filter: p.filter, overlays: p.overlays || [], quality: p.quality,
          w: p.w, h: p.h, kind: p.kind, src: p.src, skew: p.skew, ocr: p.ocr || null,
          orig: p.orig ? await blobToDataUrl(p.orig) : null, proc: await blobToDataUrl(p.proc),
          thumb: p.thumb ? await blobToDataUrl(p.thumb) : null,
        });
      }
      out.docs.push(od);
    }
    const d = new Date(), pad = (n) => String(n).padStart(2, '0');
    const file = new File([JSON.stringify(out)],
      `VraiScan_${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}.vraiscan`,
      { type: 'application/octet-stream' });
    download(file);
    prefs.set('lastBackup', String(Date.now()));
    toast(t('toast.backupDone', { size: fmtSize(file.size) }), 5000);
  });
}

async function restoreBackup(file) {
  let data;
  try { data = JSON.parse(await file.text()); } catch { data = null; }
  if (!data || !['vraiscan', 'linea-scan'].includes(data.app) || !Array.isArray(data.docs)) {
    toast(t('toast.notBackup'));
    return;
  }
  let n = 0;
  await busy(t('busy.restore'), async () => {
    if (data.signature && !(await store.getMeta('signature'))) await store.putMeta('signature', data.signature);
    for (const od of data.docs) {
      const kind = od.kind === 'dossier' ? 'dossier' : 'doc';
      const d = { id: uid(), name: od.name || defaultName(kind), ids: [], updated: od.updated || Date.now(), kind };
      for (const sp of od.pages || []) {
        const p = {
          id: uid(), quad: sp.quad, rot: sp.rot || 0, filter: sp.filter || 'desk', kind: sp.kind || 'doc',
          overlays: sp.overlays || [], quality: sp.quality, w: sp.w, h: sp.h,
          src: sp.src, skew: sp.skew, ocr: sp.ocr || null,
          orig: sp.orig ? await dataUrlToBlob(sp.orig) : null, proc: await dataUrlToBlob(sp.proc),
          thumb: sp.thumb ? await dataUrlToBlob(sp.thumb) : null,
        };
        await store.putPage(p);
        d.ids.push(p.id);
      }
      if (kind === 'dossier') {
        d.holder = od.holder || '';
        let k = 0;
        d.pieces = (od.pieces || []).map(pc => {
          const ids = d.ids.slice(k, k + (pc.n || 0));
          k += pc.n || 0;
          return { key: uid(), cid: pc.cid, label: pc.label, ids };
        });
      }
      lib.docs.push(d);
      n++;
    }
    await saveLib();
  });
  renderLib();
  toast(t('toast.restored', { n }));
}

/* ------------------------------ éditeur ------------------------------ */

const ed = { id: null, mode: 'crop', quad: null, shown: null, drag: -1, sel: -1, act: null };
const SVGNS = 'http://www.w3.org/2000/svg';

function showScreen(name) {
  $('home').hidden = name !== 'home';
  $('editor').hidden = name !== 'editor';
  $('reader').hidden = name !== 'reader';
  $('texted').hidden = name !== 'texted';
  $('transc').hidden = name !== 'transc';
  $('cam').hidden = name !== 'cam';
}

function edCounter() {
  const piece = isDossier() ? pieceOf(ed.id) : null;
  if (piece) {
    const i = piece.ids.indexOf(ed.id);
    $('edCount').textContent = t('ed.count', { i: i + 1, n: piece.ids.length });
    $('edPiece').textContent = t('ds.piece', { name: pieceName(piece) });
    $('edPiece').hidden = false;
  } else {
    const idx = doc.ids.indexOf(ed.id);
    $('edCount').textContent = idx >= 0 ? t('ed.count', { i: idx + 1, n: doc.ids.length }) : '';
    $('edPiece').hidden = true;
  }
}

async function openEditor(id, mode) {
  ed.id = id;
  showScreen('editor');
  edCounter();
  await setMode(mode);
}

function showQuality(page) {
  const q = page && page.quality;
  const msgs = [];
  if (q && q.blurry) msgs.push(t('q.blurry'));
  if (q && q.reflet) msgs.push(t('q.glare'));
  $('qText').textContent = msgs.length ? '⚠️ ' + msgs.join(' ') + ' ' + t('q.tip') : '';
  $('qWarn').hidden = !msgs.length || ed.mode === 'crop';
}

async function setMode(mode) {
  ed.mode = mode;
  ed.sel = -1;
  const page = pages.get(ed.id);
  $('edTitle').textContent = t({ crop: 'ed.crop', filter: 'ed.filter', anno: 'ed.anno' }[mode]);
  $('cropTools').hidden = mode !== 'crop';
  $('filterTools').hidden = mode !== 'filter';
  $('annoTools').hidden = mode !== 'anno';
  $('overlay').textContent = '';
  if (mode === 'crop') {
    const orig = await busy(t('busy.load'), () => getOrig(page));
    ed.quad = page.quad.map(p => ({ ...p }));
    showCanvas(orig);
  } else if (mode === 'filter') {
    renderChips();
    showCanvas(await busy(t('busy.work'), () => renderPage(page)));
  } else {
    showCanvas(await busy(t('busy.work'), () => renderBase(page)));
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
  const Lp = $('loupe');
  const lc = Lp.getContext('2d');
  // Zone vue dans la loupe : grossissement x2,2 par rapport à l'affichage.
  const span = (Lp.width / 2.2) * unit();
  lc.fillStyle = '#000';
  lc.fillRect(0, 0, Lp.width, Lp.height);
  lc.drawImage(ed.shown, pt.x - span / 2, pt.y - span / 2, span, span, 0, 0, Lp.width, Lp.height);
  lc.strokeStyle = '#4fb3ff';
  lc.lineWidth = 1.5;
  lc.beginPath();
  lc.moveTo(Lp.width / 2, 20); lc.lineTo(Lp.width / 2, Lp.height - 20);
  lc.moveTo(20, Lp.height / 2); lc.lineTo(Lp.width - 20, Lp.height / 2);
  lc.stroke();
  const st = $('stage').getBoundingClientRect();
  let lx = e.clientX - st.left - 65, ly = e.clientY - st.top - 170;
  if (ly < 4) ly = e.clientY - st.top + 50;
  lx = Math.max(4, Math.min(st.width - 134, lx));
  Lp.style.left = `${lx}px`;
  Lp.style.top = `${ly}px`;
  Lp.hidden = false;
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
  const page = pages.get(ed.id);
  const q = page && page.kind === 'photo' ? photoQuad(ed.shown.width, ed.shown.height) : detectQuad(ed.shown);
  if (q) { ed.quad = q; drawOverlay(); }
  else toast(t('toast.noEdges'));
};
$('cFull').onclick = () => {
  ed.quad = defaultQuad(ed.shown.width, ed.shown.height, 0);
  drawOverlay();
};
$('cOk').onclick = async () => {
  const page = pages.get(ed.id);
  page.quad = orderQuad(ed.quad);
  await busy(t('busy.straighten'), async () => {
    if (page.autoFilter) { autoFilter(page, await getWarped(page)); delete page.autoFilter; }
    await commit(page, await renderPage(page));
  });
  refreshHome();
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
    b.textContent = t(`flt.${f.id}`);
    b.onclick = () => applyEdit(p => { p.filter = f.id; });
    box.append(b);
  }
  $('fHint').textContent = t(`flt.${page.filter}.h`);
}

async function applyEdit(change) {
  const page = pages.get(ed.id);
  change(page);
  renderChips();
  const out = await busy(t('busy.work'), async () => {
    const o = await renderPage(page);
    await commit(page, o);
    return o;
  });
  showCanvas(out);
  refreshHome();
}

// Retire une page du document (et de sa pièce, dans un dossier).
async function removePage(id) {
  doc.ids = doc.ids.filter(x => x !== id);
  if (doc.pieces) {
    for (const pc of doc.pieces) pc.ids = pc.ids.filter(x => x !== id);
    doc.pieces = doc.pieces.filter(pc => pc.ids.length);
  }
  doc.editedAt = Date.now();
  pages.delete(id);
  const u = thumbUrls.get(id);
  if (u) URL.revokeObjectURL(u);
  thumbUrls.delete(id);
  await store.delPage(id);
}

$('fRotL').onclick = () => applyEdit(p => { p.rot = (p.rot + 270) % 360; p.turn = 270; rotateOverlays(p, 270); });
$('fRotR').onclick = () => applyEdit(p => { p.rot = (p.rot + 90) % 360; p.turn = 90; rotateOverlays(p, 90); });
$('fCrop').onclick = () => setMode('crop');
$('fAnno').onclick = () => setMode('anno');
$('fDel').onclick = async () => {
  if (!confirm(t('confirm.delPage'))) return;
  await removePage(ed.id);
  await saveLib();
  closeEditor();
};
$('fDone').onclick = () => closeEditor();
$('edBack').onclick = async () => {
  const page = pages.get(ed.id);
  if (ed.mode === 'anno' && page) await busy(t('busy.work'), async () => commit(page, await renderPage(page)));
  if (ed.mode === 'crop' && page && !page.proc) await busy(t('busy.work'), async () => {
    if (page.autoFilter) { autoFilter(page, await getWarped(page)); delete page.autoFilter; }
    await commit(page, await renderPage(page));
  });
  if (ed.mode === 'filter') closeEditor(); else setMode('filter');
};

function closeEditor() {
  const last = ed.id;
  ed.id = null;
  ed.shown = null;
  showScreen('home');
  if (isDossier()) {
    showSeg('mine');
    renderDossier();
    const pc = last && pieceOf(last);
    if (pc) flashPiece(pc.key);
  } else renderGrid();
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
  await busy(t('busy.work'), async () => commit(page, await renderPage(page)));
  refreshHome();
  setMode('filter');
};

/* ------------------------------ livre : séparer 2 pages ------------------------------ */

// Cherche le pli central (bande verticale la plus sombre entre 40 et 60 %
// de la largeur). Renvoie la position en fraction, ou 0,5 à défaut.
function findGutter(src) {
  const c = fitCanvas(src, 800);
  const w = c.width, h = c.height;
  const d = c.getContext('2d', { willReadFrequently: true }).getImageData(0, 0, w, h).data;
  const col = new Float32Array(w);
  for (let x = 0; x < w; x++) {
    let s = 0;
    for (let y = Math.floor(h * 0.1); y < h * 0.9; y += 2) {
      const j = (y * w + x) * 4;
      s += 0.299 * d[j] + 0.587 * d[j + 1] + 0.114 * d[j + 2];
    }
    col[x] = s;
  }
  const a = Math.floor(w * 0.4), b = Math.ceil(w * 0.6);
  let best = a, min = Infinity, sum = 0;
  for (let x = a; x < b; x++) { sum += col[x]; if (col[x] < min) { min = col[x]; best = x; } }
  const mean = sum / (b - a);
  return { at: min < mean * 0.93 ? best / w : 0.5, found: min < mean * 0.93 };
}

// Double page (livre ouvert) → deux pages, coupées au pli. Remplace la page
// dans le document et dans sa pièce du dossier.
async function splitPage(page) {
  const flat = rotateCanvas(await getWarped(page), page.rot);
  const g = findGutter(flat);
  const cut = Math.round(flat.width * g.at);
  const halves = [[0, cut], [cut, flat.width - cut]].map(([x, w]) => {
    const c = makeCanvas(w, flat.height);
    c.getContext('2d').drawImage(flat, x, 0, w, flat.height, 0, 0, w, flat.height);
    return c;
  });
  const newIds = [];
  for (const half of halves) {
    const np = { id: uid(), rot: 0, filter: page.filter, overlays: [], kind: page.kind || 'doc' };
    np.orig = await canvasToBlob(half, 'image/jpeg', 0.93);
    np.quad = defaultQuad(half.width, half.height, 0);
    resetCache(np.id, half);
    pages.set(np.id, np);
    await commit(np, await renderPage(np));
    newIds.push(np.id);
  }
  const replace = (arr) => { const i = arr.indexOf(page.id); if (i >= 0) arr.splice(i, 1, ...newIds); };
  replace(doc.ids);
  if (doc.pieces) doc.pieces.forEach(pc => replace(pc.ids));
  pages.delete(page.id);
  const old = thumbUrls.get(page.id);
  if (old) { URL.revokeObjectURL(old); thumbUrls.delete(page.id); }
  await store.delPage(page.id);
  return { ids: newIds, found: g.found };
}

$('fBook').onclick = async () => {
  const page = pages.get(ed.id);
  if (!page) return;
  let firstId = null, found = true;
  await busy(t('busy.work'), async () => {
    const r = await splitPage(page);
    found = r.found;
    await saveLib();
    firstId = r.ids[0];
  });
  toast(found ? t('toast.split') : t('toast.noSplit'));
  refreshHome();
  if (firstId) openEditor(firstId, 'filter');
};

/* ------------------------------ lecture à voix haute ------------------------------ */

async function pageText(page) {
  if (!page.ocr || !(page.ocr.pdf || page.ocr.edited || page.ocr.lang === 'fra+eng')) {
    const paragraphs = await recognize(page.proc, 'fra+eng');
    page.ocr = { lang: 'fra+eng', w: page.w, h: page.h, paragraphs };
    await store.putPage(page);
  }
  return page.ocr.paragraphs.map(paragraphText).join('\n\n');
}

// Lecture : ouvre le mode lecture sur cette page.
$('fRead').onclick = () => reader.open({ index: doc.ids.indexOf(ed.id), autoplay: true, from: 'editor' });

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
  await busy(t('busy.sig'), async () => {
    const c = await blobToCanvas(f, 1600);
    const q = detectQuad(c);
    const flat = q ? warp(c, q, 1600) : c;
    const ink = trimAlpha(inkToAlpha(flat), 4);
    if (!ink) { toast(t('toast.noSig')); return; }
    clearPad();
    const s = Math.min(pad.width / ink.width, pad.height / ink.height) * 0.95;
    pctx.drawImage(ink, (pad.width - ink.width * s) / 2, (pad.height - ink.height * s) / 2, ink.width * s, ink.height * s);
    sig.dirty = true;
  });
};

$('sigUse').onclick = async () => {
  const ink = sig.dirty && trimAlpha(pad, 6);
  if (!ink) { toast(t('toast.signFirst')); return; }
  const src = ink.toDataURL('image/png');
  await store.putMeta('signature', src);
  $('sigDlg').close();
  const page = pages.get(ed.id);
  const w = 0.35, h = w * ink.height / ink.width;
  page.overlays.push({ t: 'sig', src, cx: 0.7, cy: 0.82, w, h });
  ed.sel = page.overlays.length - 1;
  drawOverlay();
};

/* ------------------------------ exportation (commune) ------------------------------ */

const ex = { files: null, token: 0, ocr: null };
const SIZES = [0, 100, 200, 300, 500, 1000, 2000, 5000];

function fillSizes(sel, value) {
  const v = value ?? sel.value;
  sel.textContent = '';
  for (const k of SIZES) {
    const o = document.createElement('option');
    o.value = String(k);
    o.textContent = k ? fmtSize(k * 1000) : t('ex.m.none');
    sel.append(o);
  }
  sel.value = String(v || 0);
}

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

// Une « feuille » = une page du fichier final. Mise en page « carte » :
// recto et verso sur la même feuille A4.
function sheetPlan(ids, kind) {
  if (kind !== 'id') return ids.map(id => [id]);
  const out = [];
  for (let i = 0; i < ids.length; i += 2) out.push(ids.slice(i, i + 2));
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

async function encodeSheets(plan, kind, dpi, q, wm, stillValid) {
  const out = [];
  for (const ids of plan) {
    const { canvas, lay } = await renderSheet(ids, kind, dpi, wm);
    const blob = await canvasToBlob(canvas, 'image/jpeg', q);
    out.push({ blob, lay, px: [canvas.width, canvas.height] });
    if (!stillValid()) return null;
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

async function pdfFromSheets(out, title, ocrs) {
  const pdfPages = [];
  for (let i = 0; i < out.length; i++) {
    const o = out[i];
    const pg = { jpeg: new Uint8Array(await o.blob.arrayBuffer()), px: o.px, size: o.lay.size, box: o.lay.box };
    if (ocrs && ocrs[i]) pg.words = wordsInPdf(ocrs[i], o.lay.box);
    pdfPages.push(pg);
  }
  return buildPdf(pdfPages, { title });
}

/* ------------------------------ exportation d'un document ------------------------------ */

const OCR_FORMATS = ['pdfocr', 'docx', 'txt', 'pdftext'];
const LOW_CONF = 60;

// Lit le texte de chaque page (une seule fois : le résultat est gardé avec la page).
async function ensureOcr(ids, lang, token) {
  const out = [];
  for (let i = 0; i < ids.length; i++) {
    const page = pages.get(ids[i]);
    // Texte du PDF d'origine, ou déjà lu en français + anglais : gardé.
    if (!page.ocr || !(page.ocr.lang === lang || page.ocr.pdf || page.ocr.edited || page.ocr.lang === 'fra+eng')) {
      const label = t('ex.readPage', { i: i + 1, n: ids.length });
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
  const textOnly = format === 'docx' || format === 'txt' || format === 'pdftext';
  $('rowLang').hidden = !OCR_FORMATS.includes(format);
  $('exEdit').hidden = !OCR_FORMATS.includes(format);
  for (const id of ['rowPage', 'rowDpi', 'rowMax', 'rowWm']) $(id).hidden = textOnly;
}

function resetExportButtons() {
  $('exSave').textContent = t('ex.download');
  $('exShare').textContent = t('ex.share');
  $('exSave').classList.remove('done');
  $('exShare').classList.remove('done');
  $('exClose').textContent = t('ex.close');
  $('exClose').classList.remove('primaryclose');
}

function exportFileName(s) {
  return $('exSafe').checked ? slug(s, 80) : safeName(s);
}

async function prepareExport() {
  const token = ++ex.token;
  resetExportButtons();
  ex.files = null;
  ex.ocr = null;
  $('exListen').hidden = true;
  updateExportForm();
  $('exShare').disabled = $('exSave').disabled = true;
  $('exWarn').hidden = true;
  $('exInfo').textContent = t('ex.preparing');
  const title = safeName($('exName').value);
  const name = exportFileName($('exName').value);
  const format = $('exFormat').value, dpi = +$('exDpi').value, kind = $('exPage').value;
  const lang = $('exLang').value;
  const maxBytes = +$('exMax').value * 1000;
  const wm = $('exWm').value;
  const q0 = dpi >= 300 ? 0.9 : dpi >= 200 ? 0.86 : 0.8;
  const ids = doc.ids;
  const plan = sheetPlan(ids, kind);
  const warns = [];
  const n = ids.length;

  let ocr = null;
  if (OCR_FORMATS.includes(format)) {
    try {
      ocr = await ensureOcr(ids, lang, token);
    } catch (e) {
      console.error(e);
      if (token !== ex.token) return;
      $('exInfo').textContent = t('ex.ocrFail');
      return;
    }
    if (!ocr) return;
    ex.ocr = ocr;
    $('exListen').hidden = false;
    const low = ocr.reduce((s, o) => s + o.paragraphs.reduce((a, p) => a + p.lines.reduce((b, l) => b + l.words.filter(w => w.c < LOW_CONF).length, 0), 0), 0);
    const all = ocr.reduce((s, o) => s + o.paragraphs.reduce((a, p) => a + p.lines.reduce((b, l) => b + l.words.length, 0), 0), 0);
    const hand = ocr.filter(o => ocrUnreliable(o)).length;
    if (hand) warns.push(t('ex.hand', { n: hand }));
    if (!all) warns.push(t('ex.noText'));
    else if (format === 'docx' && low) warns.push(t('ex.lowDocx', { low, all }));
    else if (low) warns.push(t('ex.low', { low, all }));
  }

  if (format === 'docx' || format === 'txt' || format === 'pdftext') {
    const file = format === 'docx'
      ? new File([buildDocx(ocr, { title })], `${name}.docx`,
        { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
      : format === 'pdftext'
        ? new File([buildTextPdf(ocr, paragraphText, { title })], `${name}.pdf`, { type: 'application/pdf' })
        : new File([plainText(ocr.map(o => o.paragraphs))], `${name}.txt`, { type: 'text/plain;charset=utf-8' });
    if (token !== ex.token) return;
    ex.files = [file];
    $('exInfo').textContent = t('ex.infoText', { n, size: fmtSize(file.size) });
    $('exWarn').textContent = warns.join(' ');
    $('exWarn').hidden = !warns.length;
    $('exSave').disabled = $('exShare').disabled = false;
    return;
  }

  const pdfLike = format === 'pdf' || format === 'pdfocr';
  const pack = async (out) => {
    if (pdfLike) {
      const blob = await pdfFromSheets(out, title, ocr && kind !== 'id' ? ocr : null);
      return [new File([blob], `${name}.pdf`, { type: 'application/pdf' })];
    }
    const sep = $('exSafe').checked ? '_p' : ' - page ';
    return out.map((o, i) => new File([o.blob],
      out.length > 1 ? `${name}${sep}${i + 1}.jpg` : `${name}.jpg`, { type: 'image/jpeg' }));
  };
  // Pour les JPG, la limite s'applique à chaque image (c'est ce que vérifient les sites).
  const tooBig = (files) => maxBytes && (pdfLike
    ? files[0].size > maxBytes : files.some(f => f.size > maxBytes));

  let files, used = [dpi, q0], fits = true;
  for (const [d, q] of maxBytes ? compressionSteps(dpi, q0) : [[dpi, q0]]) {
    $('exInfo').textContent = maxBytes ? t('ex.compress', { dpi: d }) : t('ex.preparing');
    const out = await encodeSheets(plan, kind, d, q, wm, () => token === ex.token);
    if (!out) return;
    files = await pack(out);
    used = [d, q];
    if (!tooBig(files)) { fits = true; break; }
    fits = false;
  }
  if (token !== ex.token) return;
  ex.files = files;
  const total = files.reduce((s, f) => s + f.size, 0);
  let info = t('ex.info', { n, f: files.length, size: fmtSize(total), dpi: used[0] });
  if (format === 'pdfocr' && kind !== 'id') info += t('ex.searchable');
  if (maxBytes && fits && (used[0] !== dpi || used[1] !== q0)) info += t('ex.compressed', { max: fmtSize(maxBytes) });
  $('exInfo').textContent = info;
  if (maxBytes && !fits) warns.push(t('ex.tooBig', { max: fmtSize(maxBytes) }));
  const bad = ids.filter(id => isBad(pages.get(id))).length;
  if (bad) warns.push(t('ex.bad', { n: bad }));
  if (kind === 'id' && n % 2) warns.push(t('ex.odd'));
  if (kind === 'id' && format === 'pdfocr') warns.push(t('ex.idNoText'));
  $('exWarn').textContent = warns.join(' ');
  $('exWarn').hidden = !warns.length;
  $('exSave').disabled = false;
  $('exShare').disabled = false;
}

$('exportBtn').onclick = () => {
  $('exName').value = doc.name;
  $('exWm').value = prefs.get('wm');
  $('exSafe').checked = prefs.get('safeNames', '1') === '1';
  // Que des cartes (CNI recto + verso…) : on propose la photocopie sur une page A4.
  const isCard = (p) => p && p.w && Math.abs(Math.max(p.w, p.h) / Math.min(p.w, p.h) - 85.6 / 54) < 0.07;
  if (doc.ids.length && doc.ids.every(id => isCard(pages.get(id)))) $('exPage').value = 'id';
  $('exportDlg').showModal();
  prepareExport();
};
for (const id of ['exFormat', 'exDpi', 'exPage', 'exMax', 'exLang']) $(id).onchange = prepareExport;
$('exSafe').onchange = () => { prefs.set('safeNames', $('exSafe').checked ? '1' : '0'); prepareExport(); };
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
  toast(t('toast.saved'));
  $('exSave').textContent = t('ex.downloaded');
  $('exSave').classList.add('done');
  markExported('exClose');
};
$('exShare').onclick = () => {
  if (!ex.files) return;
  shareOrSave(ex.files, safeName($('exName').value), (how) => {
    const btn = how === 'shared' ? 'exShare' : 'exSave';
    $(btn).textContent = t(how === 'shared' ? 'ex.shared' : 'ex.downloaded');
    $(btn).classList.add('done');
    markExported('exClose');
  });
};
$('exListen').onclick = () => {
  $('exportDlg').close();
  reader.open({ index: 0, autoplay: true });
};

/* ------------------------------ dossier de candidature ------------------------------ */

function pieceOf(pageId) {
  return doc.pieces ? doc.pieces.find(p => p.ids.includes(pageId)) : null;
}

function pieceName(pc) {
  if (pc.label) return pc.label;
  const c = pieceById(pc.cid);
  if (!c) return '?';
  const ab = c.abbr ? L(c.abbr) : '';
  return ab ? `${L(c)} (${ab})` : L(c);
}

// « 01_CNI » (noms acceptés par les sites) ou « 01 - Carte nationale d'identité (CNI) ».
function pieceFileBase(pc, idx, safe) {
  const nn = String(idx + 1).padStart(2, '0');
  const c = pieceById(pc.cid);
  if (safe) {
    const base = pc.label || (c && c.abbr ? L(c.abbr) : c ? L(c) : 'Piece');
    return `${nn}_${slug(base, 40)}`;
  }
  return `${nn} - ${safeName(pieceName(pc))}`;
}

let dsSeg = 'add';
function showSeg(which) {
  dsSeg = which;
  $('segAdd').classList.toggle('on', which === 'add');
  $('segMine').classList.toggle('on', which === 'mine');
  $('dsAdd').hidden = which !== 'add';
  $('dsMine').hidden = which !== 'mine';
}
$('segAdd').onclick = () => showSeg('add');
$('segMine').onclick = () => showSeg('mine');
$('dsAddBtn').onclick = () => { showSeg('add'); $('dsSearch').focus(); };

const norm = (s) => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

// Recherche par mots : chaque mot tapé (sauf « de », « la »…) doit commencer un
// mot du nom de la pièce, de son sigle ou de ses autres noms.
const STOP = new Set(['de', 'du', 'des', 'la', 'le', 'les', 'l', 'd', 'un', 'une', 'et', 'en', 'a', 'au', 'of', 'the', 'and', 'an', 'my', 'mon', 'ma', 'mes']);
const words = (s) => norm(s).split(/[^a-z0-9°]+/).filter(w => w && !STOP.has(w));
function pieceMatch(p, qw) {
  if (!qw.length) return 1;
  const own = words(`${p.fr} ${p.en} ${p.abbr ? p.abbr.fr + ' ' + p.abbr.en : ''}`);
  const syn = words(SYNONYMS[p.id] || '');
  const has = (list, w) => list.some(x => x.startsWith(w) || (w.length >= 5 && x.startsWith(w.slice(0, -1))));
  if (qw.every(w => has(own, w))) return 2;           // trouvée par son nom
  if (qw.every(w => has(own, w) || has(syn, w))) return 1; // par un autre nom
  return 0;
}
let catQuery = '';
function renderCatalog() {
  const box = $('dsCatalog');
  box.textContent = '';
  const raw = $('dsSearch').value.trim();
  const qw = words(raw);
  catQuery = raw;
  const inFile = new Set((doc.pieces || []).map(p => p.cid));
  let shown = 0, byName = false;
  for (const cat of CATEGORIES) {
    const items = PIECES.filter(p => p.cat === cat.id).filter(p => pieceMatch(p, qw) && !(qw.length && p.id === 'autre'));
    if (!items.length) continue;
    const sec = document.createElement('section');
    sec.className = 'cat';
    const h = document.createElement('h3');
    h.textContent = L(cat);
    sec.append(h);
    for (const p of items) {
      shown++;
      if (pieceMatch(p, qw) === 2) byName = true;
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'pitem' + (inFile.has(p.id) && p.id !== 'autre' ? ' has' : '');
      const title = document.createElement('b');
      title.textContent = L(p) + (p.abbr ? ` (${L(p.abbr)})` : '');
      b.append(title);
      const sub = document.createElement('span');
      const bits = [];
      if (inFile.has(p.id) && p.id !== 'autre') bits.push('✓ ' + t('ds.inFile'));
      if (p.months) bits.push(t('ds.monthsRule', { m: p.months }));
      if (p.rule) bits.push(L(p.rule));
      sub.textContent = bits.join(' · ');
      if (bits.length) b.append(sub);
      b.onclick = () => openPieceDlg(p);
      sec.append(b);
    }
    box.append(sec);
  }
  // Pièce absente du catalogue : on l'ajoute sous le nom tapé.
  if (qw.length && !byName) {
    if (!shown) {
      const pEl = document.createElement('p');
      pEl.className = 'muted';
      pEl.textContent = t('ds.noResult');
      box.append(pEl);
    }
    const add = document.createElement('button');
    add.type = 'button';
    add.className = 'pitem addown';
    const b = document.createElement('b');
    b.textContent = t('ds.addOwn', { name: cap(raw) });
    add.append(b);
    add.onclick = () => openPieceDlg(pieceById('autre'), cap(raw));
    box.append(add);
  }
}
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
$('dsSearch').oninput = renderCatalog;

let pcTarget = null; // entrée du catalogue choisie
// name : nom proposé (pièce trouvée par un autre nom, ou ajoutée telle quelle).
function openPieceDlg(p, name = null) {
  pcTarget = p;
  // Trouvée par un autre nom (« certificat de réussite » → Attestation de
  // réussite) : on garde le nom tapé.
  if (name == null && catQuery && p.id !== 'autre') {
    const qw = words(catQuery), shownName = words(`${L(p)} ${p.abbr ? L(p.abbr) : ''}`);
    if (qw.length && !qw.every(w => shownName.some(x => x.startsWith(w)))) name = cap(catQuery);
  }
  $('pcTitle').textContent = L(p) + (p.abbr ? ` (${L(p.abbr)})` : '');
  const bits = [];
  if (p.months) bits.push(t('ds.monthsRule', { m: p.months }) + '.');
  if (p.rule) bits.push(L(p.rule));
  $('pcRule').textContent = bits.join(' ');
  const hint = p.kind === 'card' ? t('ds.card') : p.kind === 'photo' ? t('ds.photo') : '';
  $('pcHint').textContent = hint;
  $('pcHint').hidden = !hint;
  // Le nom de la pièce est modifiable (ex. « Diplôme de licence »).
  $('pcOtherRow').hidden = false;
  $('pcOther').value = name || (p.id === 'autre' ? '' : L(p));
  $('pieceDlg').showModal();
}

// Nom choisi pour la pièce ; null = nom du catalogue (suit la langue).
function pieceLabel(p) {
  const v = $('pcOther').value.trim();
  if (p.id === 'autre') return v || L(p);
  return v && v !== L(p) && v !== p.fr && v !== p.en ? v : null;
}

async function startPiece(files) {
  const p = pcTarget;
  if (!p || !files.length) return;
  $('pieceDlg').close();
  const pc = { key: uid(), cid: p.id, label: pieceLabel(p), ids: [] };
  doc.pieces.push(pc);
  const added = await addFiles(files, { edit: true, piece: pc });
  if (!added.length) {
    doc.pieces = doc.pieces.filter(x => x !== pc);
    await saveLib();
    renderDossier();
    return;
  }
  toast(t('ds.added', { name: pieceName(pc) }));
  if (files.length > 1) { showSeg('mine'); renderDossier(); flashPiece(pc.key); }
}
for (const id of ['pcCam', 'pcFile']) {
  $(id).onchange = () => {
    const files = [...$(id).files];
    $(id).value = '';
    startPiece(files);
  };
}

function flashPiece(key) {
  requestAnimationFrame(() => {
    const el = document.querySelector(`#dsList li[data-key="${key}"]`);
    if (!el) return;
    el.classList.add('flash');
    el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    setTimeout(() => el.classList.remove('flash'), 1600);
  });
}

function renderDossier() {
  if (!isDossier()) return;
  const list = $('dsList');
  list.textContent = '';
  const n = doc.pieces.length;
  $('dsCount').textContent = n;
  $('dsEmpty').hidden = n > 0;
  const safe = prefs.get('safeNames', '1') === '1';
  doc.pieces.forEach((pc, i) => {
    const li = document.createElement('li');
    li.dataset.key = pc.key;
    const img = document.createElement('img');
    img.alt = '';
    img.src = thumbUrls.get(pc.ids[0]) || '';
    img.onclick = () => pc.ids[0] && openEditor(pc.ids[0], 'filter');
    const body = document.createElement('div');
    body.className = 'pbody';
    const title = document.createElement('b');
    title.textContent = `${String(i + 1).padStart(2, '0')} · ${pieceName(pc)}`;
    const file = document.createElement('span');
    file.className = 'fname';
    file.textContent = `${pieceFileBase(pc, i, safe)}.${pieceById(pc.cid)?.kind === 'photo' ? 'jpg' : 'pdf'}`;
    const meta = document.createElement('span');
    meta.className = 'pmeta';
    const bad = pc.ids.some(id => isBad(pages.get(id)));
    const cat = pieceById(pc.cid);
    const bits = [t('ds.pages', { n: pc.ids.length })];
    if (bad) bits.push('⚠️ ' + t('tile.bad'));
    if (cat && cat.months) bits.push('⏳ ' + t('ds.monthsRule', { m: cat.months }));
    meta.textContent = bits.join(' · ');
    const acts = document.createElement('div');
    acts.className = 'pacts';
    const btn = (label, fn, cls = '', aria) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'mini ' + cls;
      b.textContent = label;
      if (aria) b.setAttribute('aria-label', aria);
      b.onclick = fn;
      acts.append(b);
      return b;
    };
    btn(t('ds.edit'), () => pc.ids[0] && openEditor(pc.ids[0], 'filter'));
    btn(t('ds.addPage'), () => {
      const native = () => pickFiles({ camera: true }, (f) => addFiles(f, { edit: true, piece: pc }));
      if (useLiveCam()) openCam({ piece: pc, native }); else native();
    });
    btn(t('ds.redo'), () => {
      if (!confirm(t('ds.confirmRedo', { name: pieceName(pc) }))) return;
      pickFiles({ camera: true }, async (f) => {
        const old = pc.ids.slice();
        const added = await addFiles(f, { edit: true, piece: pc, at: 0 });
        if (!added.length) return;
        for (const id of old) {
          pc.ids = pc.ids.filter(x => x !== id);
          pages.delete(id);
          await store.delPage(id);
        }
        syncIds();
        await saveLib();
        refreshHome();
      });
    });
    const up = btn('↑', () => movePiece(i, -1), '', t('ds.up'));
    up.disabled = i === 0;
    const down = btn('↓', () => movePiece(i, 1), '', t('ds.down'));
    down.disabled = i === n - 1;
    btn('🗑', async () => {
      if (!confirm(t('ds.confirmRemove', { name: pieceName(pc) }))) return;
      for (const id of pc.ids.slice()) await removePage(id);
      doc.pieces = doc.pieces.filter(x => x !== pc);
      syncIds();
      await saveLib();
      renderDossier();
    }, 'danger', t('ds.remove'));
    body.append(title, file, meta, acts);
    li.append(img, body);
    list.append(li);
  });
  $('dsSendBtn').disabled = n === 0;
  $('dsCheckBtn').disabled = n === 0;
  $('dsSendBtn').className = 'btn' + (n ? ' accent big' : '');
  $('dsAddBtn').className = 'btn' + (n ? '' : ' primary big');
  renderCatalog();
}

function movePiece(i, dir) {
  const j = i + dir;
  if (j < 0 || j >= doc.pieces.length) return;
  [doc.pieces[i], doc.pieces[j]] = [doc.pieces[j], doc.pieces[i]];
  syncIds();
  doc.editedAt = Date.now();
  saveLib();
  renderDossier();
}

$('dsName').oninput = () => { doc.name = $('dsName').value; saveLib(); };
$('dsName').onblur = () => { doc.name = safeName($('dsName').value); $('dsName').value = doc.name; saveLib(); };
$('dsHolder').oninput = () => { doc.holder = $('dsHolder').value; saveLib(); };

/* --- Envoi du dossier --- */

const dx = { files: null, token: 0 };

// Photo d'identité au format demandé (4×4 cm ou 35×45 mm à 300 ppp), sous 50 Ko.
async function photoFile(pc, name, fmt) {
  const src = await blobToCanvas(pages.get(pc.ids[0]).proc, 1e5);
  const [tw, th] = fmt === '3545' ? [413, 531] : [472, 472];
  const r = tw / th;
  let cw = src.width, ch = src.height;
  if (cw / ch > r) cw = ch * r; else ch = cw / r;
  const crop = makeCanvas(cw, ch);
  crop.getContext('2d').drawImage(src, (src.width - cw) / 2, (src.height - ch) / 2, cw, ch, 0, 0, cw, ch);
  const out = resizeCanvas(crop, tw, th);
  let blob;
  for (const q of [0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3]) {
    blob = await canvasToBlob(out, 'image/jpeg', q);
    if (blob.size <= 50000) break;
  }
  return { file: new File([blob], `${name}.jpg`, { type: 'image/jpeg' }), fits: blob.size <= 50000, limit: 50000 };
}

// Fichiers d'une pièce, sous la taille maximale si possible.
async function pieceFiles(pc, idx, opts, stillValid) {
  const c = pieceById(pc.cid);
  const kind = c?.kind || 'doc';
  const base = pieceFileBase(pc, idx, opts.safe);
  if (kind === 'photo' && opts.photo !== 'free') {
    const r = await photoFile(pc, base, opts.photo);
    return [r];
  }
  const layout = kind === 'card' && pc.ids.length >= 1 ? 'id' : 'a4';
  const plan = sheetPlan(pc.ids, layout);
  let files = null, fits = true;
  for (const [d, q] of opts.max ? compressionSteps(300, 0.9) : [[300, 0.9]]) {
    const out = await encodeSheets(plan, layout, d, q, '', stillValid);
    if (!out) return null;
    if (opts.format === 'jpg') {
      const sep = opts.safe ? '_p' : ' - page ';
      files = out.map((o, i) => new File([o.blob], out.length > 1 ? `${base}${sep}${i + 1}.jpg` : `${base}.jpg`, { type: 'image/jpeg' }));
    } else {
      files = [new File([await pdfFromSheets(out, pieceName(pc))], `${base}.pdf`, { type: 'application/pdf' })];
    }
    fits = !opts.max || files.every(f => f.size <= opts.max);
    if (fits) break;
  }
  return files.map(f => ({ file: f, fits: !opts.max || f.size <= opts.max, limit: opts.max }));
}

async function prepareDossierExport() {
  const token = ++dx.token;
  const still = () => token === dx.token;
  dx.files = null;
  $('dxZip').disabled = $('dxShare').disabled = true;
  $('dxZip').textContent = t('dx.zip');
  $('dxShare').textContent = t('dx.files');
  $('dxZip').classList.remove('done');
  $('dxShare').classList.remove('done');
  $('dxClose').textContent = t('ex.close');
  $('dxClose').classList.remove('primaryclose');
  $('dxWarn').hidden = true;
  $('dxList').textContent = '';
  const pieces = doc.pieces.filter(p => p.ids.length);
  if (!pieces.length) { $('dxInfo').textContent = t('dx.empty'); return; }
  const opts = {
    format: $('dxFormat').value, max: +$('dxMax').value * 1000,
    photo: $('dxPhoto').value, safe: $('dxSafe').checked,
  };
  const dname = opts.safe ? slug($('dxName').value, 80) : safeName($('dxName').value);
  $('dxInfo').textContent = t('dx.preparing', { name: dname });
  let entries = [];
  if (opts.format === 'one') {
    // Un seul PDF : toutes les feuilles de toutes les pièces, dans l'ordre.
    const sheets = [];
    for (const pc of pieces) {
      const kind = pieceById(pc.cid)?.kind || 'doc';
      const layout = kind === 'card' ? 'id' : 'a4';
      for (const ids of sheetPlan(pc.ids, layout)) sheets.push({ ids, layout });
    }
    let file = null;
    for (const [d, q] of opts.max ? compressionSteps(300, 0.9) : [[300, 0.9]]) {
      const out = [];
      for (const s of sheets) {
        const r = await encodeSheets([s.ids], s.layout, d, q, '', still);
        if (!r) return;
        out.push(r[0]);
      }
      file = new File([await pdfFromSheets(out, $('dxName').value)], `${dname}.pdf`, { type: 'application/pdf' });
      if (!opts.max || file.size <= opts.max) break;
    }
    entries = [{ file, fits: !opts.max || file.size <= opts.max, limit: opts.max }];
  } else {
    for (let i = 0; i < doc.pieces.length; i++) {
      const pc = doc.pieces[i];
      if (!pc.ids.length) continue;
      const r = await pieceFiles(pc, i, opts, still);
      if (!r) return;
      entries.push(...r);
      if (!still()) return;
    }
  }
  if (!still()) return;
  dx.files = entries.map(e => e.file);
  dx.zipName = `${dname}.zip`;
  const list = $('dxList');
  for (const e of entries) {
    const li = document.createElement('li');
    li.className = e.fits ? '' : 'big';
    li.textContent = `${e.fits ? '✓' : '⚠️'} ${e.file.name} · ${fmtSize(e.file.size)}${e.fits ? '' : ' · ' + t('dx.fileBig')}`;
    list.append(li);
  }
  const total = entries.reduce((s, e) => s + e.file.size, 0);
  $('dxInfo').textContent = t('dx.ready', { n: entries.length, size: fmtSize(total) });
  const warns = [];
  const over = entries.filter(e => !e.fits);
  if (over.length) warns.push(t('ex.tooBig', { max: fmtSize(over[0].limit) }));
  const bad = doc.ids.filter(id => isBad(pages.get(id))).length;
  if (bad) warns.push(t('ex.bad', { n: bad }));
  $('dxWarn').textContent = warns.join(' ');
  $('dxWarn').hidden = !warns.length;
  $('dxZip').disabled = $('dxShare').disabled = false;
}

$('dsSendBtn').onclick = () => {
  $('dxName').value = doc.name;
  $('dxSafe').checked = prefs.get('safeNames', '1') === '1';
  fillSizes($('dxMax'), prefs.get('dxMax', '300'));
  $('dsExportDlg').showModal();
  prepareDossierExport();
};
for (const id of ['dxFormat', 'dxPhoto']) $(id).onchange = prepareDossierExport;
$('dxMax').onchange = () => { prefs.set('dxMax', $('dxMax').value); prepareDossierExport(); };
$('dxSafe').onchange = () => { prefs.set('safeNames', $('dxSafe').checked ? '1' : '0'); prepareDossierExport(); renderDossier(); };
let dxTimer;
$('dxName').oninput = () => {
  doc.name = $('dxName').value;
  $('dsName').value = doc.name;
  saveLib();
  clearTimeout(dxTimer);
  dxTimer = setTimeout(prepareDossierExport, 500);
};
$('dxZip').onclick = async () => {
  if (!dx.files) return;
  const entries = [];
  for (const f of dx.files) entries.push({ name: f.name, data: new Uint8Array(await f.arrayBuffer()) });
  download(new File([zip(entries)], dx.zipName, { type: 'application/zip' }));
  toast(t('toast.saved'));
  $('dxZip').textContent = t('ex.downloaded');
  $('dxZip').classList.add('done');
  markExported('dxClose');
};
$('dxShare').onclick = () => {
  if (!dx.files) return;
  shareOrSave(dx.files, doc.name, (how) => {
    const b = how === 'shared' ? 'dxShare' : 'dxZip';
    $(b).textContent = t(how === 'shared' ? 'ex.shared' : 'ex.downloaded');
    $(b).classList.add('done');
    markExported('dxClose');
  });
};

/* --- Vérification du dossier (indicative) --- */

const MONTHS = {
  janvier: 1, fevrier: 2, mars: 3, avril: 4, mai: 5, juin: 6, juillet: 7, aout: 8,
  septembre: 9, octobre: 10, novembre: 11, decembre: 12,
  january: 1, february: 2, march: 3, april: 4, may: 5, june: 6, july: 7, august: 8,
  september: 9, october: 10, november: 11, december: 12,
};

// Toutes les dates lisibles dans un texte (jj/mm/aaaa, aaaa-mm-jj, « 12 mars 2026 », « March 12, 2026 »).
export function findDates(text) {
  const out = [];
  const s = norm(text);
  const now = new Date();
  const push = (y, m, d) => {
    if (y < 100) y += 2000;
    if (y < 1950 || y > now.getFullYear() + 1 || m < 1 || m > 12 || d < 1 || d > 31) return;
    const dt = new Date(y, m - 1, d);
    if (dt.getMonth() !== m - 1) return;
    if (dt.getTime() <= now.getTime() + 864e5) out.push(dt);
  };
  let m;
  const r1 = /\b(\d{1,2})\s*[/.\-]\s*(\d{1,2})\s*[/.\-]\s*(\d{4}|\d{2})\b/g;
  while ((m = r1.exec(s))) push(+m[3], +m[2], +m[1]);
  const r2 = /\b(\d{4})\s*[/.\-]\s*(\d{1,2})\s*[/.\-]\s*(\d{1,2})\b/g;
  while ((m = r2.exec(s))) push(+m[1], +m[2], +m[3]);
  const names = Object.keys(MONTHS).join('|');
  const r3 = new RegExp(`\\b(\\d{1,2})(?:er)?\\s+(${names})\\s+(\\d{4})\\b`, 'g');
  while ((m = r3.exec(s))) push(+m[3], MONTHS[m[2]], +m[1]);
  const r4 = new RegExp(`\\b(${names})\\s+(\\d{1,2})(?:st|nd|rd|th)?,?\\s+(\\d{4})\\b`, 'g');
  while ((m = r4.exec(s))) push(+m[3], MONTHS[m[1]], +m[2]);
  return out;
}

function fmtDate(d) {
  return d.toLocaleDateString(getLang() === 'en' ? 'en-GB' : 'fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

function photoBackgroundLight(canvas) {
  const c = fitCanvas(canvas, 300);
  const w = c.width, h = c.height;
  const d = c.getContext('2d', { willReadFrequently: true }).getImageData(0, 0, w, h).data;
  let s = 0, sat = 0, n = 0;
  const band = Math.max(2, Math.round(w * 0.08));
  for (let y = 0; y < h * 0.6; y++)
    for (let x = 0; x < w; x++) {
      if (x >= band && x < w - band && y >= band) continue;
      const j = (y * w + x) * 4;
      s += 0.299 * d[j] + 0.587 * d[j + 1] + 0.114 * d[j + 2];
      sat += Math.max(d[j], d[j + 1], d[j + 2]) - Math.min(d[j], d[j + 1], d[j + 2]);
      n++;
    }
  return s / n > 185 && sat / n < 45;
}

async function runCheck() {
  const list = $('ckList');
  list.textContent = '';
  $('ckRun').disabled = true;
  try { await checkPieces(list); } finally { $('ckRun').disabled = false; }
}

async function checkPieces(list) {
  const pieces = doc.pieces.filter(p => p.ids.length);
  if (!pieces.length) { $('ckStatus').textContent = t('ck.empty'); return; }
  const holder = norm(doc.holder || '').split(/[^a-z0-9]+/).filter(x => x.length >= 3);
  for (let i = 0; i < pieces.length; i++) {
    const pc = pieces[i];
    const c = pieceById(pc.cid);
    $('ckStatus').textContent = t('ck.run', { i: i + 1, n: pieces.length });
    const msgs = [];
    if (pc.ids.some(id => isBad(pages.get(id)))) msgs.push(t('ck.blurry'));
    if (c && c.kind === 'photo') {
      const cv = await blobToCanvas(pages.get(pc.ids[0]).proc, 800);
      msgs.push(photoBackgroundLight(cv) ? t('ck.photoOk') : t('ck.photoBg'));
    } else if ((c && c.months) || holder.length) {
      let text = '';
      try {
        for (const id of pc.ids) text += '\n' + await pageText(pages.get(id));
      } catch (e) { console.error(e); }
      if (c && c.months) {
        const dates = findDates(text);
        if (!dates.length) msgs.push(t('ck.noDate', { m: c.months }));
        else {
          const last = dates.reduce((a, b) => (a > b ? a : b));
          const limit = new Date();
          limit.setMonth(limit.getMonth() - c.months);
          msgs.push(last < limit
            ? t('ck.old', { date: fmtDate(last), m: c.months })
            : t('ck.fresh', { date: fmtDate(last), m: c.months }));
        }
      }
      if (holder.length) {
        const nt = norm(text);
        const missing = holder.find(part => !nt.includes(part));
        msgs.push(missing ? t('ck.nameMissing', { part: missing.toUpperCase() }) : t('ck.nameOk'));
      }
    }
    if (!msgs.length) msgs.push(t('ck.ok'));
    const li = document.createElement('li');
    const b = document.createElement('b');
    b.textContent = `${String(doc.pieces.indexOf(pc) + 1).padStart(2, '0')} · ${pieceName(pc)}`;
    li.append(b);
    for (const m of msgs) {
      const p = document.createElement('p');
      p.textContent = m;
      p.className = m.startsWith('⚠️') ? 'warn' : m.startsWith('❔') ? 'maybe' : 'ok';
      li.append(p);
    }
    list.append(li);
  }
  $('ckStatus').textContent = '';
}
$('dsCheckBtn').onclick = () => {
  $('dsHolder').value = doc.holder || '';
  $('ckList').textContent = '';
  $('ckStatus').textContent = '';
  $('checkDlg').showModal();
  // Nom déjà connu : on vérifie tout de suite.
  if (doc.holder) runCheck();
};
$('ckRun').onclick = () => runCheck();

/* ------------------------------ entrées ------------------------------ */

function bindInput(id, edit) {
  const inp = $(id);
  inp.onchange = async () => {
    const files = [...inp.files];
    inp.value = '';
    if (id === 'camNext') {
      // Page suivante : dans un dossier, elle va dans la même pièce.
      const pc = isDossier() && ed.id ? pieceOf(ed.id) : null;
      showScreen('home');
      ed.id = null;
      await addFiles(files, { edit, piece: pc });
      return;
    }
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
  await busy(t('busy.analyse'), async () => {
    await loadPhoto(page, f);
    page.rot = 0;
    page.overlays = [];
    await commit(page, await renderPage(page));
  });
  refreshHome();
  setMode('crop');
};

$('docName').oninput = () => { doc.name = $('docName').value; saveLib(); };
$('docName').onblur = () => {
  doc.name = safeName($('docName').value);
  $('docName').value = doc.name;
  saveLib();
};

$('newDocBtn').onclick = () => newDoc();
$('tabDoc').onclick = () => switchTab('doc');
$('tabDossier').onclick = () => switchTab('dossier');
$('aboutBtn').onclick = () => {
  $('appVersion').textContent = t('about.version', { v: APP_VERSION });
  $('setLang').value = getLang();
  $('setFilter').value = defaultFilter();
  $('aboutDlg').showModal();
};
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

/* ------------------------------ langue ------------------------------ */

function fillLists() {
  const lang = getLang();
  const ideas = $('nameIdeas');
  ideas.textContent = '';
  for (const p of PIECES) {
    if (p.id === 'autre') continue;
    const o = document.createElement('option');
    o.value = L(p);
    ideas.append(o);
  }
  const ds = $('dsNames');
  ds.textContent = '';
  const y = new Date().getFullYear();
  for (const n of DOSSIER_NAMES[lang]) {
    const o = document.createElement('option');
    o.value = `${n} ${y}`;
    ds.append(o);
  }
  fillSizes($('exMax'));
  fillSizes($('dxMax'));
  const sf = $('setFilter');
  const cur = sf.value || defaultFilter();
  sf.textContent = '';
  for (const f of FILTERS) {
    const o = document.createElement('option');
    o.value = f.id;
    o.textContent = t(`flt.${f.id}`);
    sf.append(o);
  }
  sf.value = cur;
}

function applyLang(l) {
  setLang(l);
  prefs.set('lang', getLang());
  applyI18n();
  $('langBtn').textContent = getLang() === 'fr' ? 'EN' : 'FR';
  fillLists();
  if (doc) refreshHome();
  if (ed.id) { edCounter(); setMode(ed.mode); }
  reader.relabel();
  textEd.relabel();
}

$('langBtn').onclick = () => applyLang(getLang() === 'fr' ? 'en' : 'fr');
$('setLang').onchange = () => applyLang($('setLang').value);
$('setFilter').onchange = () => prefs.set('defFilter', $('setFilter').value);

/* ------------------------------ mode lecture ------------------------------ */

let fullUrl = null;
const reader = createReader({
  getDoc: () => doc,
  pages,
  putPage: (p) => store.putPage(p),
  saveLib,
  showScreen,
  toast,
  prefs,
  thumbUrl(page, full) {
    if (!full) return thumbUrls.get(page.id);
    if (fullUrl) URL.revokeObjectURL(fullUrl);
    fullUrl = URL.createObjectURL(page.proc);
    return fullUrl;
  },
  onClose(from) {
    if (from === 'home') refreshHome();
  },
});
$('readBtn').onclick = () => reader.open();

/* ------------------------------ correction du texte ------------------------------ */

const textEd = createTextEditor({
  getDoc: () => doc,
  pages,
  ensureText: (p) => pageText(p),
  putPage: (p) => store.putPage(p),
  showScreen,
  toast,
  busy,
  onClose(from) {
    saveLib();
    if (from === 'home') refreshHome();
    if (from === 'reader') reader.refresh();
    if (from === 'export') $('exportBtn').click();
  },
});
$('editTextBtn').onclick = () => textEd.open();
$('fText').onclick = () => textEd.open({ index: doc.ids.indexOf(ed.id), from: 'editor' });
$('rdEdit').onclick = () => { const i = reader.index; reader.pause(); textEd.open({ index: i, from: 'reader' }); };
$('exEdit').onclick = () => { $('exportDlg').close(); textEd.open({ from: 'export' }); };

/* ------------------------------ caméra intégrée ------------------------------ */

// Les photos sont traitées une à une en arrière-plan pendant qu'on continue.
const camQ = { list: [], running: false, groups: [], target: null };
const FAST_LONG = 2480;
let camBypass = false, camDenied = false;
const useLiveCam = () => !camDenied && liveCameraSupported();

const camera = createCamera({
  capture(blob, info) { camQ.list.push({ blob, info }); camPump(); },
  pending: () => camQ.list.length + (camQ.running ? 1 : 0),
  added: () => camQ.groups.reduce((n, g) => n + g.length, 0),
  prefs,
  toast,
  showScreen,
  onClose: (reason) => camFinish(reason),
});

async function camPump() {
  if (camQ.running) return;
  camQ.running = true;
  camera.refresh();
  try {
    while (camQ.list.length) {
      const { blob, info } = camQ.list.shift();
      const tg = camQ.target;
      if (!tg) break;
      try {
        const kind = tg.piece ? (pieceById(tg.piece.cid)?.kind || 'doc') : 'doc';
        // Hors dossier (livre, notes) : pages à ~210 ppp, deux fois plus rapides ;
        // les pièces du dossier gardent 300 ppp.
        const page = await makePage(blob, { kind, quadHint: info, maxLong: tg.piece ? 0 : FAST_LONG });
        if (tg.piece) { tg.piece.ids.push(page.id); syncIds(); } else doc.ids.push(page.id);
        let ids = [page.id];
        if (info.book && kind === 'doc') ids = (await splitPage(page)).ids;
        camQ.groups.push(ids);
        doc.editedAt = Date.now();
        await saveLib();
        const bad = ids.some(id => isBad(pages.get(id)));
        camera.showThumb(thumbUrls.get(ids[ids.length - 1]));
        $('camBadge').hidden = !bad;
        $('camUndo').hidden = false;
        if (bad) toast(t('cam.blurry'), 4000);
      } catch (e) {
        console.error(e);
        toast(t('toast.badImage'));
      }
      camera.refresh();
    }
  } finally {
    camQ.running = false;
    camera.refresh();
  }
}

// Supprime la dernière page prise (ou les deux moitiés d'une double page).
$('camUndo').onclick = async () => {
  if (camQ.running || camQ.list.length) { toast(t('cam.wait')); return; }
  const ids = camQ.groups.pop();
  if (!ids) return;
  for (const id of ids) {
    doc.ids = doc.ids.filter(x => x !== id);
    if (doc.pieces) doc.pieces.forEach(pc => { pc.ids = pc.ids.filter(x => x !== id); });
    pages.delete(id);
    const u = thumbUrls.get(id);
    if (u) { URL.revokeObjectURL(u); thumbUrls.delete(id); }
    await store.delPage(id);
  }
  syncIds();
  await saveLib();
  camera._st.shots = Math.max(0, camera._st.shots - 1);
  camera._st.lastShot = null;
  const last = camQ.groups[camQ.groups.length - 1];
  if (last) camera.showThumb(thumbUrls.get(last[last.length - 1])); else { $('camThumb').hidden = true; $('camUndo').hidden = true; }
  $('camBadge').hidden = true;
  camera.refresh();
  toast(t('cam.undone'));
};

async function openCam(target) {
  camQ.target = target;
  camQ.groups = [];
  camQ.list = [];
  $('camUndo').hidden = true;
  $('camBadge').hidden = true;
  const ok = await camera.open();
  if (!ok) {
    camDenied = true;
    camQ.target = null;
    if (target.newPiece) { doc.pieces = doc.pieces.filter(x => x !== target.piece); await saveLib(); }
    toast(t('cam.denied'), 5000);
    if (target.native) { camBypass = true; target.native(); camBypass = false; }
  }
}

async function camFinish(reason) {
  if (camQ.running || camQ.list.length) {
    await busy(t('cam.finishing'), async () => {
      while (camQ.running || camQ.list.length) {
        setBusyText(t('cam.finishingN', { n: camQ.list.length + (camQ.running ? 1 : 0) }));
        await new Promise(r => setTimeout(r, 200));
      }
    });
  }
  const tg = camQ.target || {};
  const added = camQ.groups.flat();
  camQ.target = null;
  showScreen('home');
  if (tg.piece) {
    if (!tg.piece.ids.length && tg.newPiece) doc.pieces = doc.pieces.filter(x => x !== tg.piece);
    await saveLib();
    if (tg.piece.ids.length && reason !== 'native') {
      if (tg.newPiece) toast(t('ds.added', { name: pieceName(tg.piece) }));
      showSeg('mine');
      renderDossier();
      flashPiece(tg.piece.key);
    }
  }
  refreshHome();
  if (reason === 'native') {
    if (tg.native) { camBypass = true; tg.native(); camBypass = false; }
    return;
  }
  const oneShot = camQ.groups.length === 1 && added.length === 1;
  if (oneShot) openEditor(added[0], 'filter');
  else if (added.length) toast(t('cam.added', { n: added.length }), 4000);
}

// Les boutons « Scanner » ouvrent la caméra intégrée ; la photo classique
// du téléphone reste possible (bouton dans la caméra, ou si la caméra est refusée).
function hookCam(labelId, inputId, makeTarget) {
  $(labelId).addEventListener('click', (e) => {
    if (camBypass || !useLiveCam()) return;
    e.preventDefault();
    const target = makeTarget();
    if (!target) return;
    target.native = () => $(inputId).click();
    openCam(target);
  });
}
hookCam('camBtn', 'camIn', () => ({}));
hookCam('camNextBtn', 'camNext', () => {
  const pc = isDossier() && ed.id ? pieceOf(ed.id) : null;
  showScreen('home');
  ed.id = null;
  return { piece: pc };
});
hookCam('pcCamBtn', 'pcCam', () => {
  const p = pcTarget;
  if (!p) return null;
  $('pieceDlg').close();
  const pc = { key: uid(), cid: p.id, label: pieceLabel(p), ids: [] };
  doc.pieces.push(pc);
  return { piece: pc, newPiece: true };
});

/* ------------------------------ démarrage ------------------------------ */

async function init() {
  const saved0 = prefs.get('lang', '');
  applyLang(saved0 || ((navigator.language || 'fr').toLowerCase().startsWith('fr') ? 'fr' : 'en'));
  let saved = await store.getMeta('library');
  if (!saved) {
    // Ancienne version : un seul document.
    const old = await store.getMeta('doc');
    saved = { docs: old ? [{ id: uid(), name: old.name || defaultName(), ids: old.ids || [], updated: Date.now() }] : [] };
    if (saved.docs.length) saved.current = saved.docs[0].id;
  }
  lib.docs = saved.docs || [];
  if (!lib.docs.length) newDocRecord('doc');
  const cur = lib.docs.find(d => d.id === saved.current) || lib.docs[0];
  await openDoc(cur.id);
  const params = new URLSearchParams(location.search);
  // Raccourcis de l'icône de l'application.
  if (params.get('open') === 'library') $('libBtn').click();
  if (params.get('open') === 'dossier') switchTab('dossier');
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
}
init();

// Pour les tests automatiques.
window.__vraiscan = {
  lib, get doc() { return doc; }, pages, addFiles, prepareExport, ex, dx, restoreBackup, findDates,
  switchTab, applyLang, importPdf, reader, textEd, camera, splitPage,
};
