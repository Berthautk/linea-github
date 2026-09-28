// Correction du texte reconnu, et transcription d'une page écrite à la main.
// Le texte corrigé est gardé avec la page (page.ocr, marqué « edited ») et
// sert partout : Word, PDF cherchable, PDF propre, texte, écoute.
//
// Structure du texte (comme l'OCR) : paragraphes > lignes > mots, chaque
// élément avec sa boîte b = [x0, y0, x1, y1] en pixels de l'image de la page ;
// mot : { t: texte, c: confiance 0..100 }. Un mot corrigé ou validé a c = 100.

import { t } from './i18n.js';

const $ = (id) => document.getElementById(id);
export const LOW = 60;

/* ------------------------------ outils ------------------------------ */

const median = (a) => {
  if (!a.length) return 0;
  const s = a.slice().sort((x, y) => x - y);
  return s[Math.floor(s.length / 2)];
};
const union = (bs) => [
  Math.min(...bs.map(b => b[0])), Math.min(...bs.map(b => b[1])),
  Math.max(...bs.map(b => b[2])), Math.max(...bs.map(b => b[3])),
];
const words = (s) => (s || '').replace(/\s+/g, ' ').trim().split(' ').filter(Boolean);

// Mots d'une ligne, posés dans sa boîte au prorata des caractères.
function lineFrom(text, b) {
  const ws = words(text);
  const total = ws.reduce((s, w) => s + w.length, 0) + Math.max(0, ws.length - 1);
  const W = b[2] - b[0];
  let pos = 0;
  const out = ws.map(w => {
    const x0 = b[0] + (W * pos) / (total || 1);
    pos += w.length;
    const x1 = b[0] + (W * pos) / (total || 1);
    pos += 1;
    return { t: w, c: 100, b: [Math.round(x0), b[1], Math.round(x1), b[3]] };
  });
  return { b: b.slice(), words: out };
}

// Répartit un texte sur des lignes. boxes : lignes d'origine (le texte en
// reprend le nombre, ou davantage s'il est plus long) ; frame : zone pour un
// nouveau paragraphe { x0, y, width }.
function linesFrom(text, boxes, lh, frame) {
  const ws = words(text);
  if (!ws.length) return [];
  const width = boxes.length ? Math.max(...boxes.map(b => b[2] - b[0])) : frame.width;
  const x0 = boxes.length ? Math.min(...boxes.map(b => b[0])) : frame.x0;
  const perLine = Math.max(12, Math.round(width / (lh * 0.5)));
  const target = boxes.length ? Math.max(perLine * 0.6, ws.join(' ').length / boxes.length) : perLine;
  const chunks = [];
  let cur = '';
  for (const w of ws) {
    if (cur && cur.length + 1 + w.length > target * 1.15) { chunks.push(cur); cur = w; } else cur = cur ? cur + ' ' + w : w;
  }
  if (cur) chunks.push(cur);
  let y = boxes.length ? boxes[0][1] : frame.y;
  return chunks.map((c, i) => {
    const b = boxes[i] ? boxes[i].slice()
      : [x0, Math.round(y), Math.round(x0 + Math.min(width, (c.length / perLine) * width)), Math.round(y + lh)];
    y = b[3] + lh * 0.35;
    return lineFrom(c, b);
  });
}

// Texte lu par l'OCR qui ne ressemble pas à du texte (page écrite à la main,
// photo illisible) : trop de mots douteux ou trop peu de vrais mots.
export function ocrUnreliable(ocr) {
  if (!ocr || ocr.edited || ocr.pdf || ocr.hand) return false;
  const ws = ocr.paragraphs.flatMap(p => p.lines.flatMap(l => l.words));
  if (ws.length < 3) return false;
  const low = ws.filter(w => (w.c ?? 100) < LOW).length / ws.length;
  const wordlike = ws.filter(w => /^[(«"]?[\p{L}'’-]{3,}[.,;:!?»")]*$/u.test(w.t)).length / ws.length;
  return low > 0.35 || wordlike < 0.3;
}

export function paraText(p) {
  return p.lines.map(l => l.words.map(w => w.t).join(' ')).join('\n');
}

function lineHeight(ocr) {
  return median(ocr.paragraphs.flatMap(p => p.lines.map(l => l.b[3] - l.b[1]))) || Math.round(ocr.h * 0.014);
}

// Texte d'une page après rotation ou recadrage : les boîtes suivent.
export function refitOcr(ocr, ow, oh, nw, nh, turn) {
  const map = ([x0, y0, x1, y1]) => {
    let p = [[x0, y0], [x1, y1]];
    if (turn === 90) p = p.map(([x, y]) => [((oh - y) * nw) / oh, (x * nh) / ow]);
    else if (turn === 270) p = p.map(([x, y]) => [(y * nw) / oh, ((ow - x) * nh) / ow]);
    else p = p.map(([x, y]) => [(x * nw) / ow, (y * nh) / oh]);
    return [Math.min(p[0][0], p[1][0]), Math.min(p[0][1], p[1][1]), Math.max(p[0][0], p[1][0]), Math.max(p[0][1], p[1][1])].map(Math.round);
  };
  return {
    ...ocr, w: nw, h: nh,
    paragraphs: ocr.paragraphs.map(p => ({
      ...p, b: map(p.b), lines: p.lines.map(l => ({ ...l, b: map(l.b), words: l.words.map(w => ({ ...w, b: map(w.b) })) })),
    })),
  };
}

/* ------------------------------ lignes d'écriture ------------------------------ */

// Lignes d'écriture sur l'image de la page : profil horizontal de l'encre.
export function detectLines(img) {
  const W = 900, scale = W / img.width, H = Math.max(1, Math.round(img.height * scale));
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const x = c.getContext('2d', { willReadFrequently: true });
  x.drawImage(img, 0, 0, W, H);
  const d = x.getImageData(0, 0, W, H).data;
  const lum = new Float32Array(W * H);
  for (let i = 0, j = 0; i < d.length; i += 4, j++) lum[j] = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
  // Encre : nettement plus sombre que le papier autour (seuil local, qui suit
  // les ombres et les plis de la feuille).
  const R = 14, IW = W + 1;
  const integ = new Float64Array(IW * (H + 1));
  for (let y = 0; y < H; y++) {
    let row = 0;
    for (let xx = 0; xx < W; xx++) { row += lum[y * W + xx]; integ[(y + 1) * IW + xx + 1] = integ[y * IW + xx + 1] + row; }
  }
  const ink = new Uint8Array(W * H);
  for (let y = 0; y < H; y++) {
    const ya = Math.max(0, y - R), yb = Math.min(H, y + R + 1);
    for (let xx = 0; xx < W; xx++) {
      const xa = Math.max(0, xx - R), xb = Math.min(W, xx + R + 1);
      const mean = (integ[yb * IW + xb] - integ[ya * IW + xb] - integ[yb * IW + xa] + integ[ya * IW + xa]) / ((yb - ya) * (xb - xa));
      const v = lum[y * W + xx];
      if (v < mean * 0.8 && v < mean - 22) ink[y * W + xx] = 1;
    }
  }
  // Lignes du cahier, marges, plis, bords : longs traits droits, effacés.
  const longH = Math.round(W * 0.07), longV = Math.round(H * 0.05);
  for (let y = 0; y < H; y++) {
    let st = -1;
    for (let xx = 0; xx <= W; xx++) {
      const on = xx < W && (ink[y * W + xx] || (y > 0 && ink[(y - 1) * W + xx] && xx > 0 && ink[y * W + xx - 1]));
      if (on && st < 0) st = xx;
      if (!on && st >= 0) { if (xx - st >= longH) for (let k = st; k < xx; k++) ink[y * W + k] = 2; st = -1; }
    }
  }
  for (let xx = 0; xx < W; xx++) {
    let st = -1;
    for (let y = 0; y <= H; y++) {
      const on = y < H && ink[y * W + xx];
      if (on && st < 0) st = y;
      if (!on && st >= 0) { if (y - st >= longV) for (let k = st; k < y; k++) ink[k * W + xx] = 2; st = -1; }
    }
  }
  const isInk = (i) => ink[i] === 1;
  // Cahier ligné : l'écart entre ses lignes donne la hauteur d'une ligne d'écriture.
  let ruled = 0;
  {
    const centers = [];
    let st = -1;
    for (let y = 0; y <= H; y++) {
      let n = 0;
      if (y < H) for (let xx = 0; xx < W; xx++) if (ink[y * W + xx] === 2) n++;
      const on = n > W * 0.25;
      if (on && st < 0) st = y;
      if (!on && st >= 0) { centers.push((st + y) / 2); st = -1; }
    }
    const d = centers.slice(1).map((c, i) => c - centers[i]).filter(v => v > 6);
    if (d.length >= 3) ruled = median(d);
  }
  const mx = Math.round(W * 0.03); // marges ignorées (ombres de bord)
  const rows = new Float32Array(H);
  for (let y = 0; y < H; y++) {
    let n = 0;
    for (let xx = mx; xx < W - mx; xx++) if (isInk(y * W + xx)) n++;
    rows[y] = n;
  }
  // Profil lissé (les traits fins d'une écriture laissent des trous).
  const sm = new Float32Array(H);
  for (let y = 0; y < H; y++) {
    let v = 0, n = 0;
    for (let k = -3; k <= 3; k++) if (y + k >= 0 && y + k < H) { v += rows[y + k]; n++; }
    sm[y] = v / n;
  }
  const minInk = Math.max(1.5, (W - 2 * mx) * 0.004);
  let bands = [];
  let start = -1;
  for (let y = 0; y <= H; y++) {
    const on = y < H && sm[y] >= minInk;
    if (on && start < 0) start = y;
    if (!on && start >= 0) { bands.push([start, y]); start = -1; }
  }
  if (!bands.length) return [];
  // Poussières et restes de lignes du cahier : trop peu d'encre.
  const mass = (b) => { let m = 0; for (let y = b[0]; y < b[1]; y++) m += rows[y]; return m; };
  const maxMass = Math.max(...bands.map(mass));
  // Reste d'une ligne du cahier : l'encre tient sur 1 à 4 rangées de pixels,
  // alors qu'une écriture s'étale sur toute la hauteur des lettres.
  const spread = (b) => {
    let peak = 0, n = 0;
    for (let y = b[0]; y < b[1]; y++) peak = Math.max(peak, rows[y]);
    for (let y = b[0]; y < b[1]; y++) if (rows[y] > peak * 0.3) n++;
    return n;
  };
  // Trait fin et penché (ligne du cahier) : 1 ou 2 pixels d'encre par colonne ;
  // une lettre en a davantage (jambages, boucles).
  const thickness = (b) => {
    let cols = 0, px = 0;
    for (let xx = mx; xx < W - mx; xx++) {
      let n = 0;
      for (let y = b[0]; y < b[1]; y++) if (isInk(y * W + xx)) n++;
      if (n) { cols++; px += n; }
    }
    return cols ? px / cols : 0;
  };
  bands = bands.filter(b => mass(b) >= Math.max(40, maxMass * 0.08) && spread(b) > 4 && thickness(b) > 2.4
    && (!ruled || b[1] - b[0] >= ruled * 0.45));
  if (!bands.length) return [];
  // Recolle les morceaux d'une même ligne (points des i, accents, jambages).
  const h0 = median(bands.map(b => b[1] - b[0])) || 10;
  const merged = [];
  for (const b of bands) {
    const last = merged[merged.length - 1];
    if (last && b[0] - last[1] < h0 * 0.25) last[1] = b[1];
    else merged.push(b.slice());
  }
  bands = merged;
  // Lignes collées : coupées au creux d'encre.
  // Hauteur d'une ligne d'écriture : l'écart du cahier ligné, sinon la hauteur
  // habituelle des bandes, entre 2,5 et 4,5 % de la largeur de la page.
  const hm = ruled || Math.min(W * 0.045, Math.max(W * 0.025, median(bands.map(b => b[1] - b[0])) || h0));
  const out = [];
  const split = (b) => {
    if (b[1] - b[0] < hm * 1.6) { out.push(b); return; }
    let best = -1, bv = Infinity;
    for (let y = b[0] + Math.round(hm * 0.7); y < b[1] - hm * 0.7; y++) if (sm[y] < bv) { bv = sm[y]; best = y; }
    if (best < 0) { out.push(b); return; }
    split([b[0], best]);
    split([best, b[1]]);
  };
  for (const b of bands) {
    const from = out.length;
    split(b);
    // Morceau trop léger (jambages, queues de lettres) : rendu à la ligne voisine.
    const parts = out.splice(from);
    const avg = parts.reduce((m, q) => m + mass(q), 0) / parts.length;
    const kept = [];
    for (const q of parts) {
      if (parts.length > 1 && mass(q) < avg * 0.3) {
        if (kept.length) kept[kept.length - 1][1] = q[1]; else q.light = true;
        if (kept.length) continue;
      }
      if (kept.length && kept[kept.length - 1].light) { q[0] = kept.pop()[0]; }
      kept.push(q);
    }
    out.push(...kept);
  }
  // Étendue horizontale de chaque ligne.
  return out.map(([y0, y1]) => {
    let x0 = W, x1 = 0;
    for (let y = y0; y < y1; y++) for (let xx = mx; xx < W - mx; xx++) if (isInk(y * W + xx)) { if (xx < x0) x0 = xx; if (xx > x1) x1 = xx; }
    return [x0, y0, Math.max(x0 + 1, x1), y1].map(v => Math.round(v / scale));
  }).filter(b => b[2] - b[0] > 8 / scale);
}

/* ------------------------------ l'éditeur ------------------------------ */

export function createTextEditor(ctx) {
  // ctx : { getDoc, pages, ensureText(page), putPage, showScreen, toast, onClose, busy }
  const st = { open: false, idx: 0, from: 'home', img: null, imgFor: null, sel: null, trLines: [], tri: 0 };
  const doc = () => ctx.getDoc();
  const pageAt = (i) => ctx.pages.get(doc().ids[i]);

  async function pageImage(page) {
    if (st.imgFor === page.id && st.img) return st.img;
    const url = URL.createObjectURL(page.proc);
    try {
      const img = new Image();
      img.src = url;
      await img.decode();
      st.img = img;
      st.imgFor = page.id;
      return img;
    } finally { setTimeout(() => URL.revokeObjectURL(url), 1000); }
  }

  // Dessine une zone de la page (boîte b) dans le canevas, avec un cadre sur hi.
  async function drawCrop(canvas, page, b, hi, maxZoom = 3, mode = 'scroll') {
    const img = await pageImage(page);
    const sx = img.naturalWidth / page.w, sy = img.naturalHeight / page.h;
    const lh = b[3] - b[1];
    const pad = Math.max(8, lh * 0.35);
    let bx0 = b[0], bx1 = b[2];
    // Un mot : on montre le mot et ses voisins, assez grand pour être lu.
    if (hi) {
      const span = Math.max((hi[2] - hi[0]) * 3, lh * 9);
      const cx = (hi[0] + hi[2]) / 2;
      bx0 = Math.max(b[0], cx - span / 2);
      bx1 = Math.min(b[2], cx + span / 2);
      if (bx1 - bx0 < span) { if (bx0 === b[0]) bx1 = Math.min(b[2], bx0 + span); else bx0 = Math.max(b[0], bx1 - span); }
    }
    const x0 = Math.max(0, bx0 - pad), y0 = Math.max(0, b[1] - pad);
    const x1 = Math.min(page.w, bx1 + pad), y1 = Math.min(page.h, b[3] + pad);
    const cw = canvas.parentElement.clientWidth || 320;
    const W = x1 - x0, Hh = y1 - y0;
    let z = Math.min(maxZoom, cw / W);
    // Ligne trop fine pour être lue : coupée en morceaux empilés (wrap), ou
    // agrandie avec défilement horizontal.
    let k = 1;
    if (Hh * z < 44) {
      if (mode === 'wrap') k = Math.min(3, Math.ceil(44 / (Hh * z)));
      else z = Math.min(maxZoom, 44 / Hh);
    }
    const segW = W / k, zz = mode === 'wrap' ? Math.min(maxZoom, cw / segW) : z;
    canvas.width = Math.round(segW * zz);
    canvas.height = Math.round(Hh * zz * k + (k - 1) * 6);
    canvas.style.maxWidth = mode === 'scroll' ? 'none' : '';
    const g = canvas.getContext('2d');
    g.fillStyle = '#fff';
    g.fillRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < k; i++) {
      const sx0 = x0 + i * segW, dy = i * (Hh * zz + 6);
      g.drawImage(img, sx0 * sx, y0 * sy, segW * sx, Hh * sy, 0, dy, canvas.width, Hh * zz);
      if (i) { g.fillStyle = '#d7dde3'; g.fillRect(0, dy - 4, canvas.width, 2); }
    }
    if (hi) {
      g.strokeStyle = '#e8590c';
      g.lineWidth = 3;
      g.strokeRect((hi[0] - x0) * zz - 3, (hi[1] - y0) * zz - 3, (hi[2] - hi[0]) * zz + 6, (hi[3] - hi[1]) * zz + 6);
    }
    const box = canvas.parentElement;
    if (hi && box.scrollWidth > box.clientWidth) box.scrollLeft = (hi[0] - x0) * zz - box.clientWidth / 3;
  }

  function markEdited(page) {
    page.ocr.edited = true;
    doc().editedAt = Date.now();
    return ctx.putPage(page);
  }

  function lowCount(page) {
    if (!page || !page.ocr) return 0;
    return page.ocr.paragraphs.reduce((s, p) => s + p.lines.reduce((a, l) => a + l.words.filter(w => (w.c ?? 100) < LOW).length, 0), 0);
  }

  /* ---------- affichage d'une page ---------- */

  function render() {
    const page = pageAt(st.idx), n = doc().ids.length;
    $('tePage').textContent = t('rd.page', { i: st.idx + 1, n });
    $('tePrev').disabled = st.idx === 0;
    $('teNext').disabled = st.idx >= n - 1;
    const body = $('teBody');
    body.textContent = '';
    const ocr = page.ocr;
    const bad = ocrUnreliable(ocr);
    const low = bad ? 0 : lowCount(page);
    const totalLow = doc().ids.reduce((s, id) => {
      const q = ctx.pages.get(id);
      return s + (q && !ocrUnreliable(q.ocr) ? lowCount(q) : 0);
    }, 0);
    $('teHint').textContent = !ocr || !ocr.paragraphs.length ? t('te.empty')
      : bad ? t('te.badHint') : low ? t('te.hintLow', { n: low }) : t('te.hintOk');
    $('teNextLow').hidden = !totalLow;
    $('teNextLow').textContent = t('te.nextLow', { n: totalLow });
    $('teHand').classList.toggle('primary', bad || !ocr || !ocr.paragraphs.length);
    if (!ocr) return;
    // Lecture peu fiable : on le dit, on propose la transcription, et le texte
    // lu n'est montré que sur demande.
    let target = body;
    if (bad) {
      const box = document.createElement('div');
      box.className = 'tebad';
      const p = document.createElement('p');
      p.textContent = t('te.bad');
      const go = document.createElement('button');
      go.type = 'button';
      go.className = 'btn primary';
      go.textContent = t('te.badGo');
      go.onclick = () => $('teHand').click();
      box.append(p, go);
      body.append(box);
      const det = document.createElement('details');
      const sum = document.createElement('summary');
      sum.textContent = t('te.badShow');
      det.append(sum);
      body.append(det);
      target = det;
    }
    ocr.paragraphs.forEach((p, pi) => {
      const div = document.createElement('div');
      div.className = 'tpara';
      p.lines.forEach((l, li) => {
        l.words.forEach((w, wi) => {
          const s = document.createElement('span');
          s.className = 'tw' + ((w.c ?? 100) < LOW ? ' low' : '');
          s.textContent = w.t;
          s.dataset.k = `${pi}.${li}.${wi}`;
          div.append(s, ' ');
        });
        if (li < p.lines.length - 1 && /[.:;!?»)]$/.test(l.words.map(w => w.t).join(' ')) && /^[A-ZÀ-ÖØ-Þ0-9•\-–—(«"]/.test((p.lines[li + 1].words[0] || {}).t || '')) {
          div.append(document.createElement('br'));
        }
      });
      const ed = document.createElement('button');
      ed.type = 'button';
      ed.className = 'tpedit';
      ed.textContent = '✏️';
      ed.setAttribute('aria-label', t('te.editPara'));
      ed.onclick = () => openPara(pi);
      div.append(ed);
      target.append(div);
    });
  }

  async function show(i) {
    st.idx = Math.max(0, Math.min(doc().ids.length - 1, i));
    const page = pageAt(st.idx);
    if (!page.ocr) {
      try { await ctx.busy(t('busy.read'), () => ctx.ensureText(page)); } catch (e) { console.error(e); ctx.toast(t('ex.ocrFail')); }
    }
    render();
    $('teBody').scrollTop = 0;
  }

  /* ---------- un mot ---------- */

  function wordAt(k) {
    const [pi, li, wi] = k.split('.').map(Number);
    const page = pageAt(st.idx);
    const p = page.ocr.paragraphs[pi], l = p && p.lines[li], w = l && l.words[wi];
    return w ? { page, p, l, w, pi, li, wi } : null;
  }

  async function openWord(k) {
    const r = wordAt(k);
    if (!r) return;
    st.sel = k;
    $('wdInput').value = r.w.t;
    $('wdLow').hidden = (r.w.c ?? 100) >= LOW;
    $('wordDlg').showModal();
    await drawCrop($('wdCrop'), r.page, r.l.b, r.w.b);
    $('wdInput').focus();
    $('wdInput').select();
  }

  async function saveWord() {
    const r = st.sel && wordAt(st.sel);
    if (!r) return;
    const v = $('wdInput').value.replace(/\s+/g, ' ').trim();
    if (!v) { r.l.words.splice(r.wi, 1); } else { r.w.t = v; r.w.c = 100; }
    if (!r.l.words.length) r.p.lines.splice(r.li, 1);
    if (!r.p.lines.length) r.page.ocr.paragraphs.splice(r.pi, 1);
    await markEdited(r.page);
    render();
  }

  // Prochain mot à vérifier, à partir du mot choisi (pages suivantes comprises).
  async function nextLow(fromK) {
    const n = doc().ids.length;
    let [pi0, li0, wi0] = fromK ? fromK.split('.').map(Number) : [0, 0, -1];
    for (let k = 0; k < n; k++) {
      const i = (st.idx + k) % n;
      const page = pageAt(i);
      if (!page.ocr) continue;
      const ps = page.ocr.paragraphs;
      for (let pi = k === 0 ? pi0 : 0; pi < ps.length; pi++) {
        for (let li = k === 0 && pi === pi0 ? li0 : 0; li < ps[pi].lines.length; li++) {
          const ws = ps[pi].lines[li].words;
          for (let wi = k === 0 && pi === pi0 && li === li0 ? wi0 + 1 : 0; wi < ws.length; wi++) {
            if ((ws[wi].c ?? 100) < LOW) {
              if (i !== st.idx) { st.idx = i; render(); }
              const key = `${pi}.${li}.${wi}`;
              const span = $('teBody').querySelector(`[data-k="${key}"]`);
              if (span) span.scrollIntoView({ block: 'center' });
              await openWord(key);
              return true;
            }
          }
        }
      }
      pi0 = 0; li0 = 0; wi0 = -1;
    }
    ctx.toast(t('te.allChecked'));
    return false;
  }

  /* ---------- un paragraphe ---------- */

  async function openPara(pi) {
    const page = pageAt(st.idx);
    st.para = pi;
    const p = pi >= 0 ? page.ocr.paragraphs[pi] : null;
    $('ptText').value = p ? paraText(p).replace(/\n/g, ' ') : '';
    $('ptDel').hidden = !p;
    $('ptTitle').textContent = t(p ? 'te.editPara' : 'te.addPara');
    $('ptCropBox').hidden = !p || p.added;
    $('paraDlg').showModal();
    if (p && !p.added) await drawCrop($('ptCrop'), page, p.b, null, 3);
    $('ptText').focus();
  }

  async function savePara() {
    const page = pageAt(st.idx);
    const ocr = page.ocr || (page.ocr = { lang: 'hand', w: page.w, h: page.h, paragraphs: [] });
    const text = $('ptText').value;
    const lh = lineHeight(ocr);
    const pi = st.para;
    if (pi >= 0) {
      const p = ocr.paragraphs[pi];
      const lines = linesFrom(text, p.lines.map(l => l.b), lh);
      if (!lines.length) ocr.paragraphs.splice(pi, 1);
      else { p.lines = lines; p.b = union(lines.map(l => l.b)); }
    } else {
      // Nouveau paragraphe, sous le dernier.
      const last = ocr.paragraphs[ocr.paragraphs.length - 1];
      const x0 = ocr.paragraphs.length ? Math.min(...ocr.paragraphs.map(p => p.b[0])) : Math.round(page.w * 0.1);
      const x1 = ocr.paragraphs.length ? Math.max(...ocr.paragraphs.map(p => p.b[2])) : Math.round(page.w * 0.9);
      const y = Math.min(page.h - lh * 2, last ? last.b[3] + lh : page.h * 0.08);
      const lines = linesFrom(text, [], lh, { x0, y: Math.round(y), width: x1 - x0 });
      if (lines.length) ocr.paragraphs.push({ b: union(lines.map(l => l.b)), lines, added: true });
    }
    await markEdited(page);
    render();
  }

  /* ---------- transcription d'une page écrite à la main ---------- */

  async function startTranscribe() {
    const page = pageAt(st.idx);
    const img = await pageImage(page);
    let saved = page.transc && page.transc.w === page.w ? page.transc : null;
    if (!saved) {
      const found = detectLines(img).map(b => {
        const sx = page.w / img.naturalWidth, sy = page.h / img.naturalHeight;
        return [b[0] * sx, b[1] * sy, b[2] * sx, b[3] * sy].map(Math.round);
      });
      if (!found.length) { ctx.toast(t('tr.noLines')); return; }
      // Texte déjà reconnu sur la ligne (parties imprimées) : proposé.
      const ocrWords = page.ocr && !page.ocr.hand && !ocrUnreliable(page.ocr) ? page.ocr.paragraphs.flatMap(p => p.lines.flatMap(l => l.words)) : [];
      const gaps = found.slice(1).map((b, i) => b[1] - found[i][3]);
      // Écart ordinaire entre deux lignes : le bas de la distribution (les
      // grands écarts sont justement les changements de paragraphe).
      const g = gaps.length ? gaps.slice().sort((x, y) => x - y)[Math.floor(gaps.length * 0.3)] : 0;
      saved = {
        w: page.w, i: 0,
        lines: found.map((b, i) => ({
          b,
          text: ocrWords.filter(w => (w.c ?? 100) >= LOW && (w.b[1] + w.b[3]) / 2 > b[1] && (w.b[1] + w.b[3]) / 2 < b[3]).map(w => w.t).join(' '),
          np: i === 0 || gaps[i - 1] > Math.max(g * 1.8, (b[3] - b[1]) * 0.9),
        })),
      };
    }
    page.transc = saved;
    st.tr = saved;
    ctx.showScreen('transc');
    await showLine(saved.i || 0);
  }

  async function showLine(i) {
    const page = pageAt(st.idx), tr = st.tr;
    tr.i = Math.max(0, Math.min(tr.lines.length - 1, i));
    const L = tr.lines[tr.i];
    $('trCount').textContent = t('tr.count', { i: tr.i + 1, n: tr.lines.length });
    $('trText').value = L.text || '';
    $('trPara').classList.toggle('on', !!L.np);
    $('trPrev').disabled = tr.i === 0;
    $('trNext').textContent = tr.i >= tr.lines.length - 1 ? t('tr.finish') : t('tr.next');
    await drawCrop($('trCrop'), page, L.b, null, 4, 'wrap');
    $('trText').focus();
  }

  function keepLine() {
    const L = st.tr.lines[st.tr.i];
    L.text = $('trText').value.replace(/\s+/g, ' ').trim();
  }

  async function finishTranscribe() {
    keepLine();
    const page = pageAt(st.idx), tr = st.tr;
    const paragraphs = [];
    let cur = null;
    for (const L of tr.lines) {
      if (!L.text) { if (L.np) cur = null; continue; }
      if (!cur || L.np) { cur = { b: L.b.slice(), lines: [] }; paragraphs.push(cur); }
      cur.lines.push(lineFrom(L.text, L.b));
      cur.b = union(cur.lines.map(l => l.b));
    }
    page.ocr = { lang: 'hand', hand: true, edited: true, w: page.w, h: page.h, paragraphs };
    doc().editedAt = Date.now();
    await ctx.putPage(page);
    ctx.showScreen('texted');
    render();
    ctx.toast(t('tr.done', { n: paragraphs.reduce((s, p) => s + p.lines.length, 0) }));
  }

  /* ---------- boutons ---------- */

  $('teBody').onclick = (e) => {
    const s = e.target.closest('.tw');
    if (s) openWord(s.dataset.k);
  };
  $('tePrev').onclick = () => show(st.idx - 1);
  $('teNext').onclick = () => show(st.idx + 1);
  $('teNextLow').onclick = () => nextLow(null);
  $('teAdd').onclick = () => openPara(-1);
  $('teHand').onclick = () => {
    const page = pageAt(st.idx);
    if (page.ocr && page.ocr.edited && !page.ocr.hand && !confirm(t('tr.replace'))) return;
    startTranscribe();
  };
  $('teBack').onclick = () => close();
  $('teDone').onclick = () => close();

  $('wdOk').onclick = async () => { await saveWord(); $('wordDlg').close(); };
  $('wdNext').onclick = async () => { await saveWord(); $('wordDlg').close(); await nextLow(st.sel); };
  $('wdDel').onclick = async () => { $('wdInput').value = ''; await saveWord(); $('wordDlg').close(); };
  $('wdPara').onclick = () => { const r = wordAt(st.sel); $('wordDlg').close(); if (r) openPara(r.pi); };
  $('wdInput').onkeydown = (e) => { if (e.key === 'Enter') { e.preventDefault(); $('wdNext').click(); } };

  $('ptSave').onclick = async () => { await savePara(); $('paraDlg').close(); };
  $('ptDel').onclick = async () => {
    const page = pageAt(st.idx);
    page.ocr.paragraphs.splice(st.para, 1);
    await markEdited(page);
    $('paraDlg').close();
    render();
  };

  $('trPrev').onclick = () => { keepLine(); showLine(st.tr.i - 1); };
  $('trNext').onclick = () => {
    keepLine();
    if (st.tr.i >= st.tr.lines.length - 1) finishTranscribe(); else showLine(st.tr.i + 1);
    ctx.putPage(pageAt(st.idx));
  };
  $('trPara').onclick = () => {
    const L = st.tr.lines[st.tr.i];
    L.np = !L.np;
    $('trPara').classList.toggle('on', L.np);
  };
  $('trText').onkeydown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); $('trNext').click(); } };
  $('trDone').onclick = () => finishTranscribe();
  $('trBack').onclick = () => { keepLine(); ctx.putPage(pageAt(st.idx)); ctx.showScreen('texted'); };
  $('trRedo').onclick = async () => {
    if (!confirm(t('tr.redoConfirm'))) return;
    const page = pageAt(st.idx);
    page.transc = null;
    await startTranscribe();
  };

  /* ---------- ouverture ---------- */

  async function open({ index = 0, from = 'home', hand = false } = {}) {
    if (!doc().ids.length) return;
    st.open = true;
    st.from = from;
    $('teTitle').textContent = doc().name;
    ctx.showScreen('texted');
    await show(index);
    if (hand) $('teHand').click();
  }

  function close() {
    st.open = false;
    st.img = null;
    st.imgFor = null;
    ctx.showScreen(st.from === 'export' ? 'home' : st.from);
    ctx.onClose && ctx.onClose(st.from);
  }

  return {
    open,
    get isOpen() { return st.open; },
    relabel() { if (st.open) render(); },
    _st: st,
  };
}
