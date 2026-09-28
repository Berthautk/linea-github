import {
  MAX_SRC, blobToCanvas, canvasToBlob, detectQuad, defaultQuad, orderQuad,
  warp, rotateCanvas, enhance, fitCanvas, resizeCanvas, FILTERS,
} from './imgproc.js';
import { buildPdf, PAGE_SIZES } from './pdf.js';
import * as store from './store.js';

const $ = (id) => document.getElementById(id);
const nextFrame = () => new Promise(r => setTimeout(r, 30));

const doc = { name: '', ids: [] };
const pages = new Map();   // id -> { id, orig, quad, rot, filter, proc, thumb, w, h }
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
function toast(msg, ms = 3000) {
  const t = $('toast');
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (t.hidden = true), ms);
}

function saveDoc() {
  return store.putMeta('doc', { name: doc.name, ids: doc.ids.slice() });
}

/* ------------------------------ traitement ------------------------------ */

// Garde en mémoire la photo d'origine et le redressement de la page ouverte.
const cache = { id: null, orig: null, warpKey: null, warped: null };

async function getOrig(page) {
  if (cache.id !== page.id || !cache.orig) {
    cache.id = page.id;
    cache.orig = await blobToCanvas(page.orig, MAX_SRC);
    cache.warpKey = null;
    cache.warped = null;
  }
  return cache.orig;
}

async function getWarped(page) {
  const orig = await getOrig(page);
  const key = JSON.stringify(page.quad);
  if (cache.warpKey !== key) {
    cache.warped = warp(orig, page.quad);
    cache.warpKey = key;
  }
  return cache.warped;
}

async function renderPage(page) {
  const warped = await getWarped(page);
  return enhance(rotateCanvas(warped, page.rot), page.filter);
}

async function commit(page, out) {
  page.proc = await canvasToBlob(out, 'image/jpeg', 0.92);
  page.w = out.width;
  page.h = out.height;
  page.thumb = await canvasToBlob(fitCanvas(out, 420), 'image/jpeg', 0.8);
  const old = thumbUrls.get(page.id);
  if (old) URL.revokeObjectURL(old);
  thumbUrls.set(page.id, URL.createObjectURL(page.thumb));
  await store.putPage(page);
}

async function createPage(file) {
  const canvas = await blobToCanvas(file, MAX_SRC);
  const orig = await canvasToBlob(canvas, 'image/jpeg', 0.93);
  const quad = detectQuad(canvas) || defaultQuad(canvas.width, canvas.height);
  const page = { id: uid(), orig, quad, rot: 0, filter: 'scan', proc: null, thumb: null };
  cache.id = page.id; cache.orig = canvas; cache.warpKey = null; cache.warped = null;
  pages.set(page.id, page);
  return page;
}

async function addFiles(files, { edit }) {
  files = [...files].filter(f => f && (f.type.startsWith('image/') || !f.type));
  if (!files.length) return;
  let lastId = null;
  await busy('Analyse de la photo…', async () => {
    for (let i = 0; i < files.length; i++) {
      if (files.length > 1) setBusyText(`Page ${i + 1} sur ${files.length}…`);
      try {
        const page = await createPage(files[i]);
        await nextFrame();
        await commit(page, await renderPage(page));
        doc.ids.push(page.id);
        lastId = page.id;
      } catch (e) {
        console.error(e);
        toast("Impossible de lire une des images.");
      }
    }
    await saveDoc();
  });
  renderGrid();
  if (edit && lastId && files.length === 1) openEditor(lastId, 'crop');
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
    tile.append(img, num, mv);
    tile.onclick = () => openEditor(id, 'filter');
    grid.append(tile);
  });
}

function move(i, dir) {
  const j = i + dir;
  if (j < 0 || j >= doc.ids.length) return;
  [doc.ids[i], doc.ids[j]] = [doc.ids[j], doc.ids[i]];
  saveDoc();
  renderGrid();
}

/* ------------------------------ éditeur ------------------------------ */

const ed = { id: null, mode: 'crop', quad: null, shown: null, drag: -1 };
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

async function setMode(mode) {
  ed.mode = mode;
  const page = pages.get(ed.id);
  $('edTitle').textContent = mode === 'crop' ? 'Recadrer' : 'Rendu';
  $('cropTools').hidden = mode !== 'crop';
  $('filterTools').hidden = mode !== 'filter';
  if (mode === 'crop') {
    const orig = await busy('Chargement…', () => getOrig(page));
    ed.quad = page.quad.map(p => ({ ...p }));
    showCanvas(orig);
    drawOverlay();
  } else {
    $('overlay').textContent = '';
    renderChips();
    const out = await busy('Traitement…', () => renderPage(page));
    showCanvas(out);
  }
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
  if (ed.mode === 'crop') drawOverlay();
}
addEventListener('resize', layoutCanvas);

function drawOverlay() {
  const svg = $('overlay');
  const W = ed.shown.width, H = ed.shown.height;
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.textContent = '';
  const poly = document.createElementNS(SVGNS, 'polygon');
  poly.setAttribute('points', ed.quad.map(p => `${p.x},${p.y}`).join(' '));
  svg.append(poly);
  const cssW = $('edCanvas').clientWidth || W;
  const unit = W / cssW; // unités SVG par pixel écran
  ed.quad.forEach((p, i) => {
    const h = document.createElementNS(SVGNS, 'circle');
    h.setAttribute('class', 'h');
    h.setAttribute('cx', p.x); h.setAttribute('cy', p.y);
    h.setAttribute('r', 22 * unit);
    h.dataset.i = i;
    const dot = document.createElementNS(SVGNS, 'circle');
    dot.setAttribute('class', 'dot');
    dot.setAttribute('cx', p.x); dot.setAttribute('cy', p.y);
    dot.setAttribute('r', 4 * unit);
    svg.append(h, dot);
  });
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
  const unit = ed.shown.width / ($('edCanvas').clientWidth || ed.shown.width);
  return bd < 60 * unit ? best : -1;
}

function drawLoupe(pt, e) {
  const L = $('loupe');
  const lc = L.getContext('2d');
  // Zone vue dans la loupe : grossissement x2,2 par rapport à l'affichage.
  const span = (L.width / 2.2) * (ed.shown.width / $('edCanvas').clientWidth);
  lc.fillStyle = '#000';
  lc.fillRect(0, 0, L.width, L.height);
  lc.imageSmoothingEnabled = true;
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

const ov = $('overlay');
ov.addEventListener('pointerdown', (e) => {
  if (ed.mode !== 'crop') return;
  const i = nearestHandle(toImage(e));
  if (i < 0) return;
  ed.drag = i;
  ov.setPointerCapture(e.pointerId);
  drawLoupe(ed.quad[i], e);
  e.preventDefault();
});
ov.addEventListener('pointermove', (e) => {
  if (ed.drag < 0) return;
  const pt = toImage(e);
  ed.quad[ed.drag] = pt;
  drawOverlay();
  drawLoupe(pt, e);
});
const endDrag = () => { ed.drag = -1; $('loupe').hidden = true; };
ov.addEventListener('pointerup', endDrag);
ov.addEventListener('pointercancel', endDrag);

$('cAuto').onclick = () => {
  const q = detectQuad(ed.shown);
  if (q) { ed.quad = q; drawOverlay(); }
  else toast("Bords non trouvés : placez les coins à la main.");
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

$('fRotL').onclick = () => applyEdit(p => { p.rot = (p.rot + 270) % 360; });
$('fRotR').onclick = () => applyEdit(p => { p.rot = (p.rot + 90) % 360; });
$('fCrop').onclick = () => setMode('crop');
$('fDel').onclick = async () => {
  if (!confirm('Supprimer cette page ?')) return;
  const id = ed.id;
  doc.ids = doc.ids.filter(x => x !== id);
  pages.delete(id);
  const u = thumbUrls.get(id);
  if (u) URL.revokeObjectURL(u);
  thumbUrls.delete(id);
  await store.delPage(id);
  await saveDoc();
  closeEditor();
};
$('fDone').onclick = () => closeEditor();
$('edBack').onclick = async () => {
  if (ed.mode === 'crop') {
    const page = pages.get(ed.id);
    if (page && !page.proc) await busy('Traitement…', async () => commit(page, await renderPage(page)));
  }
  closeEditor();
};

function closeEditor() {
  ed.id = null;
  ed.shown = null;
  showScreen('home');
  renderGrid();
}

/* ------------------------------ exportation ------------------------------ */

const ex = { file: null, files: null, token: 0 };

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

async function prepareExport() {
  const token = ++ex.token;
  ex.file = null; ex.files = null;
  $('exShare').disabled = $('exSave').disabled = true;
  $('exInfo').textContent = 'Préparation du fichier…';
  const name = safeName($('exName').value);
  const format = $('exFormat').value, dpi = +$('exDpi').value, kind = $('exPage').value;
  const q = dpi >= 300 ? 0.9 : dpi >= 200 ? 0.86 : 0.8;
  const out = [];
  for (let i = 0; i < doc.ids.length; i++) {
    const page = pages.get(doc.ids[i]);
    const c = await blobToCanvas(page.proc, 1e5);
    const lay = pageLayout(c.width, c.height, kind);
    const tw = Math.round((lay.box[2] / 72) * dpi), th = Math.round((lay.box[3] / 72) * dpi);
    const scaled = tw < c.width ? resizeCanvas(c, tw, th) : c;
    const blob = await canvasToBlob(scaled, 'image/jpeg', q);
    out.push({ blob, lay, px: [scaled.width, scaled.height] });
    if (token !== ex.token) return;
    await nextFrame();
  }
  let files;
  if (format === 'pdf') {
    const pdfPages = [];
    for (const o of out) {
      pdfPages.push({ jpeg: new Uint8Array(await o.blob.arrayBuffer()), px: o.px, size: o.lay.size, box: o.lay.box });
    }
    const pdf = buildPdf(pdfPages, { title: name });
    files = [new File([pdf], `${name}.pdf`, { type: 'application/pdf' })];
  } else {
    files = out.map((o, i) => new File([o.blob],
      out.length > 1 ? `${name} - page ${i + 1}.jpg` : `${name}.jpg`, { type: 'image/jpeg' }));
  }
  if (token !== ex.token) return;
  ex.files = files;
  const total = files.reduce((s, f) => s + f.size, 0);
  const size = total > 1e6 ? `${(total / 1048576).toFixed(1)} Mo` : `${Math.max(1, Math.round(total / 1024))} Ko`;
  $('exInfo').textContent = `${doc.ids.length} page${doc.ids.length > 1 ? 's' : ''} · ${files.length} fichier${files.length > 1 ? 's' : ''} · ${size}`;
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
  $('exportDlg').showModal();
  prepareExport();
};
for (const id of ['exFormat', 'exDpi', 'exPage']) $(id).onchange = prepareExport;
let nameTimer;
$('exName').oninput = () => {
  doc.name = $('exName').value;
  $('docName').value = doc.name;
  saveDoc();
  clearTimeout(nameTimer);
  nameTimer = setTimeout(prepareExport, 400);
};
$('exSave').onclick = () => {
  if (!ex.files) return;
  ex.files.forEach((f, i) => setTimeout(() => download(f), i * 300));
  toast('Fichier enregistré dans « Téléchargements ».');
};
$('exShare').onclick = async () => {
  if (!ex.files) return;
  const data = { files: ex.files, title: safeName($('exName').value) };
  if (navigator.canShare && navigator.canShare(data)) {
    try { await navigator.share(data); }
    catch (e) { if (e.name !== 'AbortError') toast("Le partage a échoué. Utilisez « Télécharger »."); }
  } else {
    ex.files.forEach((f, i) => setTimeout(() => download(f), i * 300));
    toast("Partage direct non disponible ici : le fichier a été téléchargé.");
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

$('docName').oninput = () => { doc.name = $('docName').value; saveDoc(); };
$('docName').onblur = () => {
  doc.name = safeName($('docName').value);
  $('docName').value = doc.name;
  saveDoc();
};

$('newDocBtn').onclick = async () => {
  if (doc.ids.length && !confirm('Commencer un nouveau document ? Les pages actuelles seront effacées de l\'appareil (pensez à enregistrer le PDF avant).')) return;
  for (const u of thumbUrls.values()) URL.revokeObjectURL(u);
  thumbUrls.clear();
  pages.clear();
  doc.ids = [];
  doc.name = defaultName();
  $('docName').value = doc.name;
  await store.clearPages();
  await saveDoc();
  renderGrid();
};

/* ------------------------------ démarrage ------------------------------ */

async function init() {
  const saved = await store.getMeta('doc');
  doc.name = saved?.name || defaultName();
  $('docName').value = doc.name;
  if (saved?.ids?.length) {
    for (const id of saved.ids) {
      const p = await store.getPage(id);
      if (!p || !p.proc) continue;
      pages.set(id, p);
      thumbUrls.set(id, URL.createObjectURL(p.thumb || p.proc));
      doc.ids.push(id);
    }
  }
  renderGrid();
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
}
init();

// Pour les tests automatiques.
window.__lineaScan = { doc, pages, addFiles, prepareExport, ex };
