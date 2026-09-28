// Import de PDF, sur le téléphone et hors ligne (pdf.js de Mozilla, dans
// vendor/pdfjs). Chaque page devient une image ; le texte déjà présent dans le
// PDF (fichier fait sur ordinateur) est repris tel quel, sans relecture.

import { makeCanvas } from './imgproc.js';

const BASE = new URL('vendor/pdfjs/', location.href).href;
let libP = null;

function pdfjs() {
  if (!libP) {
    libP = import('./vendor/pdfjs/pdf.min.mjs').then(m => {
      m.GlobalWorkerOptions.workerSrc = BASE + 'pdf.worker.min.mjs';
      return m;
    });
    libP.catch(() => { libP = null; });
  }
  return libP;
}

export function isPdf(f) {
  return !!f && (f.type === 'application/pdf' || /\.pdf$/i.test(f.name || ''));
}

// askPassword(retry) → mot de passe, ou null pour abandonner.
export async function openPdf(file, askPassword) {
  const lib = await pdfjs();
  const task = lib.getDocument({
    data: new Uint8Array(await file.arrayBuffer()),
    wasmUrl: BASE + 'wasm/',
    standardFontDataUrl: BASE + 'standard_fonts/',
    iccUrl: BASE + 'iccs/',
    isEvalSupported: false,
  });
  task.onPassword = (update, reason) => {
    const p = askPassword ? askPassword(reason === lib.PasswordResponses.INCORRECT_PASSWORD) : null;
    if (p == null) task.destroy(); else update(p);
  };
  return task.promise;
}

// Page n (à partir de 1) : image et texte du PDF au format de l'OCR
// (paragraphes > lignes > mots, en pixels de l'image). Page avec texte :
// image plus légère (le texte vient du PDF) ; page scannée : image plus fine,
// pour que la lecture du texte (OCR) soit bonne.
export async function renderPdfPage(pdf, n) {
  const lib = await pdfjs();
  const page = await pdf.getPage(n);
  try {
    let items = [];
    try { items = (await page.getTextContent()).items; } catch (e) { console.warn(e); }
    const letters = items.reduce((s, it) => s + ((it.str || '').match(/[\p{L}\p{N}]/gu) || []).length, 0);
    // Moins de 20 lettres : page scannée (image seule).
    const hasText = letters >= 20;
    const maxLong = hasText ? 1600 : 2200;
    const vp1 = page.getViewport({ scale: 1 });
    const scale = Math.min(maxLong / Math.max(vp1.width, vp1.height), 5);
    const vp = page.getViewport({ scale });
    const canvas = makeCanvas(Math.round(vp.width), Math.round(vp.height));
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvasContext: ctx, viewport: vp }).promise;
    const paragraphs = hasText ? textToParagraphs(items, vp, lib.Util) : null;
    return { canvas, paragraphs: paragraphs && paragraphs.length ? paragraphs : null, quality: hasText ? 0.8 : 0.85 };
  } finally {
    page.cleanup();
  }
}

// Morceaux de texte du PDF → mots positionnés. On garde l'ordre du fichier,
// qui est en général l'ordre de lecture (colonnes comprises).
export function textToParagraphs(items, vp, Util) {
  const runs = [];
  for (const it of items) {
    if (typeof it.str !== 'string') continue;
    const m = Util.transform(vp.transform, it.transform);
    const h = Math.hypot(m[2], m[3]);
    if (!h) continue;
    const x = m[4], y = m[5];
    const w = (it.width || 0) * vp.scale;
    runs.push({ s: it.str, x, y, w, h, eol: !!it.hasEOL });
  }

  // Lignes
  const lines = [];
  let line = null;
  const flush = () => { if (line && line.words.length) lines.push(line); line = null; };
  for (const r of runs) {
    if (line && (Math.abs(r.y - line.y) > line.h * 0.5 || r.x < line.x1 - line.h)) flush();
    if (r.s.trim()) {
      if (!line) line = { y: r.y, h: r.h, x1: r.x, words: [] };
      addRun(line, r);
      line.h = Math.max(line.h, r.h);
    }
    if (r.eol) flush();
  }
  flush();

  // Paragraphes : nouvel écart vertical, retour vers le haut (colonne suivante)
  // ou décalage à gauche important.
  const paragraphs = [];
  let para = null, prev = null;
  for (const l of lines) {
    const b = boxOf(l.words);
    const lineOut = { b, words: l.words.map(w => ({ t: w.t, c: 99, b: [w.x0, w.y0, w.x1, w.y1] })) };
    const gap = prev ? l.y - prev.y : 0;
    const newPara = !para || gap < -prev.h * 0.5 || gap > Math.max(l.h, prev.h) * 1.75
      || Math.abs(b[0] - para.b[0]) > l.h * 6 || Math.abs(l.h - prev.h) > prev.h * 0.35;
    if (newPara) {
      para = { b: b.slice(), lines: [] };
      paragraphs.push(para);
    }
    para.lines.push(lineOut);
    para.b = [Math.min(para.b[0], b[0]), Math.min(para.b[1], b[1]), Math.max(para.b[2], b[2]), Math.max(para.b[3], b[3])];
    prev = l;
  }
  return paragraphs.map(p => ({ b: p.b.map(Math.round), lines: p.lines.map(l => ({
    b: l.b.map(Math.round), words: l.words.map(w => ({ ...w, b: w.b.map(Math.round) })),
  })) }));
}

// Découpe un morceau en mots, positionnés au prorata des caractères.
function addRun(line, r) {
  const n = r.s.length || 1;
  const top = r.y - r.h * 0.8, bottom = r.y + r.h * 0.22;
  const re = /\S+/g;
  let m;
  let first = true;
  while ((m = re.exec(r.s))) {
    const x0 = r.x + (r.w * m.index) / n, x1 = r.x + (r.w * (m.index + m[0].length)) / n;
    const last = line.words[line.words.length - 1];
    // Mot coupé entre deux morceaux (« Bon » + « jour ») : on recolle.
    if (first && m.index === 0 && last && x0 - last.x1 < r.h * 0.12 && x0 >= last.x0) {
      last.t += m[0];
      last.x1 = Math.max(last.x1, x1);
      last.y0 = Math.min(last.y0, top);
      last.y1 = Math.max(last.y1, bottom);
    } else {
      line.words.push({ t: m[0], x0, x1, y0: top, y1: bottom });
    }
    first = false;
  }
  line.x1 = Math.max(line.x1, r.x + r.w);
}

function boxOf(words) {
  return [
    Math.min(...words.map(w => w.x0)), Math.min(...words.map(w => w.y0)),
    Math.max(...words.map(w => w.x1)), Math.max(...words.map(w => w.y1)),
  ];
}

export function closePdf(pdf) {
  try { (pdf.loadingTask || pdf).destroy(); } catch { /* déjà fermé */ }
}
