// Traitement d'image : détection du document, redressement de la perspective,
// filtres « scanner ». Tout est fait en JavaScript pur, sur l'appareil.

export const MAX_SRC = 3000;

export function makeCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(w));
  c.height = Math.max(1, Math.round(h));
  return c;
}

function ctx2d(c) {
  return c.getContext('2d', { willReadFrequently: true });
}

export function canvasToBlob(c, type = 'image/jpeg', quality = 0.9) {
  return new Promise((res, rej) =>
    c.toBlob(b => (b ? res(b) : rej(new Error('Encodage impossible'))), type, quality));
}

async function decode(blob) {
  try {
    return await createImageBitmap(blob, { imageOrientation: 'from-image' });
  } catch {
    const url = URL.createObjectURL(blob);
    try {
      return await new Promise((res, rej) => {
        const img = new Image();
        img.onload = () => res(img);
        img.onerror = () => rej(new Error('Image illisible'));
        img.src = url;
      });
    } finally {
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
  }
}

// Charge une photo (fichier ou blob) dans un canvas, en limitant sa taille.
export async function blobToCanvas(blob, maxSide = MAX_SRC) {
  const bmp = await decode(blob);
  const w0 = bmp.naturalWidth || bmp.width, h0 = bmp.naturalHeight || bmp.height;
  const s = Math.min(1, maxSide / Math.max(w0, h0));
  const c = makeCanvas(w0 * s, h0 * s);
  const ctx = ctx2d(c);
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(bmp, 0, 0, c.width, c.height);
  if (bmp.close) bmp.close();
  return c;
}

// Réduction de bonne qualité (par moitiés successives).
export function resizeCanvas(src, w, h) {
  w = Math.round(w); h = Math.round(h);
  let cur = src;
  while (cur.width / 2 >= w && cur.height / 2 >= h) {
    const half = makeCanvas(cur.width / 2, cur.height / 2);
    const cx = ctx2d(half);
    cx.imageSmoothingQuality = 'high';
    cx.drawImage(cur, 0, 0, half.width, half.height);
    cur = half;
  }
  const out = makeCanvas(w, h);
  const cx = ctx2d(out);
  cx.imageSmoothingQuality = 'high';
  cx.drawImage(cur, 0, 0, w, h);
  return out;
}

export function fitCanvas(src, maxSide) {
  const s = Math.min(1, maxSide / Math.max(src.width, src.height));
  return s >= 1 ? src : resizeCanvas(src, src.width * s, src.height * s);
}

export function rotateCanvas(src, deg) {
  deg = ((deg % 360) + 360) % 360;
  if (!deg) return src;
  const swap = deg === 90 || deg === 270;
  const out = makeCanvas(swap ? src.height : src.width, swap ? src.width : src.height);
  const cx = ctx2d(out);
  cx.translate(out.width / 2, out.height / 2);
  cx.rotate((deg * Math.PI) / 180);
  cx.drawImage(src, -src.width / 2, -src.height / 2);
  return out;
}

/* ------------------------------------------------------------------ */
/* Détection automatique des 4 coins du document                        */
/* ------------------------------------------------------------------ */

export function defaultQuad(w, h, inset = 0.04) {
  const dx = w * inset, dy = h * inset;
  return [
    { x: dx, y: dy }, { x: w - dx, y: dy },
    { x: w - dx, y: h - dy }, { x: dx, y: h - dy },
  ];
}

function otsu(values) {
  const hist = new Float64Array(256);
  for (let i = 0; i < values.length; i++) hist[values[i] | 0]++;
  const total = values.length;
  let sum = 0;
  for (let i = 0; i < 256; i++) sum += i * hist[i];
  let sumB = 0, wB = 0, best = 0, t = 127;
  for (let i = 0; i < 256; i++) {
    wB += hist[i];
    if (!wB) continue;
    const wF = total - wB;
    if (!wF) break;
    sumB += i * hist[i];
    const mB = sumB / wB, mF = (sum - sumB) / wF;
    const between = wB * wF * (mB - mF) * (mB - mF);
    if (between > best) { best = between; t = i; }
  }
  return t;
}

// Érosion / dilatation d'un masque binaire (fenêtre carrée, séparable).
function morph(mask, w, h, r, dilate) {
  const tmp = new Uint8Array(mask.length), out = new Uint8Array(mask.length);
  const pass = (src, dst, horiz) => {
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        let v = dilate ? 0 : 1;
        for (let k = -r; k <= r; k++) {
          const xx = horiz ? x + k : x, yy = horiz ? y : y + k;
          if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue;
          const m = src[yy * w + xx];
          if (dilate ? m : !m) { v = dilate ? 1 : 0; break; }
        }
        dst[y * w + x] = v;
      }
    }
  };
  pass(mask, tmp, true);
  pass(tmp, out, false);
  return out;
}

function largestComponent(mask, w, h) {
  const label = new Int32Array(mask.length);
  const stack = new Int32Array(mask.length);
  let best = 0, bestLabel = 0, cur = 0;
  for (let i = 0; i < mask.length; i++) {
    if (!mask[i] || label[i]) continue;
    cur++;
    let sp = 0, area = 0;
    stack[sp++] = i; label[i] = cur;
    while (sp) {
      const p = stack[--sp];
      area++;
      const x = p % w, y = (p / w) | 0;
      if (x > 0 && mask[p - 1] && !label[p - 1]) { label[p - 1] = cur; stack[sp++] = p - 1; }
      if (x < w - 1 && mask[p + 1] && !label[p + 1]) { label[p + 1] = cur; stack[sp++] = p + 1; }
      if (y > 0 && mask[p - w] && !label[p - w]) { label[p - w] = cur; stack[sp++] = p - w; }
      if (y < h - 1 && mask[p + w] && !label[p + w]) { label[p + w] = cur; stack[sp++] = p + w; }
    }
    if (area > best) { best = area; bestLabel = cur; }
  }
  const out = new Uint8Array(mask.length);
  for (let i = 0; i < mask.length; i++) out[i] = label[i] === bestLabel && bestLabel ? 1 : 0;
  return out;
}

function fillHoles(comp, w, h) {
  const seen = new Uint8Array(comp.length);
  const stack = [];
  for (let x = 0; x < w; x++) { stack.push(x, (h - 1) * w + x); }
  for (let y = 0; y < h; y++) { stack.push(y * w, y * w + w - 1); }
  while (stack.length) {
    const p = stack.pop();
    if (seen[p] || comp[p]) continue;
    seen[p] = 1;
    const x = p % w, y = (p / w) | 0;
    if (x > 0) stack.push(p - 1);
    if (x < w - 1) stack.push(p + 1);
    if (y > 0) stack.push(p - w);
    if (y < h - 1) stack.push(p + w);
  }
  let area = 0;
  for (let i = 0; i < comp.length; i++) {
    if (!comp[i] && !seen[i]) comp[i] = 1;
    area += comp[i];
  }
  return area;
}

function convexHull(pts) {
  pts.sort((a, b) => a.x - b.x || a.y - b.y);
  const cross = (o, a, b) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
  const lower = [], upper = [];
  for (const p of pts) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop();
    lower.push(p);
  }
  for (let i = pts.length - 1; i >= 0; i--) {
    const p = pts[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop();
    upper.push(p);
  }
  upper.pop(); lower.pop();
  return lower.concat(upper);
}

function polyArea(p) {
  let a = 0;
  for (let i = 0; i < p.length; i++) {
    const q = p[(i + 1) % p.length];
    a += p[i].x * q.y - q.x * p[i].y;
  }
  return Math.abs(a) / 2;
}

// Réduit le polygone en retirant chaque fois le sommet qui coûte le moins de surface.
function reduceHull(hull, n) {
  const p = hull.slice();
  const tri = (a, b, c) => Math.abs((b.x - a.x) * (c.y - a.y) - (c.x - a.x) * (b.y - a.y)) / 2;
  while (p.length > n) {
    let bi = 0, bv = Infinity;
    for (let i = 0; i < p.length; i++) {
      const v = tri(p[(i - 1 + p.length) % p.length], p[i], p[(i + 1) % p.length]);
      if (v < bv) { bv = v; bi = i; }
    }
    p.splice(bi, 1);
  }
  return p;
}

function maxAreaQuad(poly) {
  const n = poly.length;
  if (n <= 4) return poly;
  let best = null, bestA = -1;
  for (let a = 0; a < n; a++)
    for (let b = a + 1; b < n; b++)
      for (let c = b + 1; c < n; c++)
        for (let d = c + 1; d < n; d++) {
          const q = [poly[a], poly[b], poly[c], poly[d]];
          const A = polyArea(q);
          if (A > bestA) { bestA = A; best = q; }
        }
  return best;
}

// Ordre : haut-gauche, haut-droite, bas-droite, bas-gauche.
export function orderQuad(q) {
  const cx = q.reduce((s, p) => s + p.x, 0) / 4, cy = q.reduce((s, p) => s + p.y, 0) / 4;
  const s = q.slice().sort((a, b) => Math.atan2(a.y - cy, a.x - cx) - Math.atan2(b.y - cy, b.x - cx));
  let k = 0;
  for (let i = 1; i < 4; i++) if (s[i].x + s[i].y < s[k].x + s[k].y) k = i;
  return [0, 1, 2, 3].map(i => ({ x: s[(k + i) % 4].x, y: s[(k + i) % 4].y }));
}

// Renvoie les 4 coins du document dans les coordonnées de `src`, ou null.
export function detectQuad(src) {
  const W = src.width, H = src.height;
  const sc = Math.min(1, 320 / Math.max(W, H));
  const w = Math.max(16, Math.round(W * sc)), h = Math.max(16, Math.round(H * sc));
  const small = resizeCanvas(src, w, h);
  const d = ctx2d(small).getImageData(0, 0, w, h).data;
  const n = w * h;
  // « Ressemblance au papier » : clair et peu coloré.
  const raw = new Float32Array(n);
  for (let i = 0, j = 0; i < n; i++, j += 4) {
    const r = d[j], g = d[j + 1], b = d[j + 2];
    const l = 0.299 * r + 0.587 * g + 0.114 * b;
    const sat = Math.max(r, g, b) - Math.min(r, g, b);
    raw[i] = l - 1.2 * sat;
  }
  const score = new Uint8Array(n);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      let s = 0, c = 0;
      for (let dy = -1; dy <= 1; dy++)
        for (let dx = -1; dx <= 1; dx++) {
          const xx = x + dx, yy = y + dy;
          if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue;
          s += raw[yy * w + xx]; c++;
        }
      score[y * w + x] = Math.max(0, Math.min(255, s / c));
    }
  const t = otsu(score);
  let mask = new Uint8Array(n);
  for (let i = 0; i < n; i++) mask[i] = score[i] > t ? 1 : 0;
  const r = Math.max(1, Math.round(Math.max(w, h) / 160));
  mask = morph(mask, w, h, r, false);
  mask = morph(mask, w, h, r, true);
  const comp = largestComponent(mask, w, h);
  const area = fillHoles(comp, w, h);
  if (area < n * 0.08 || area > n * 0.985) return null;

  const pts = [];
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const p = y * w + x;
      if (!comp[p]) continue;
      if (x === 0 || y === 0 || x === w - 1 || y === h - 1 ||
          !comp[p - 1] || !comp[p + 1] || !comp[p - w] || !comp[p + w])
        pts.push({ x: x + 0.5, y: y + 0.5 });
    }
  if (pts.length < 8) return null;
  const hull = convexHull(pts);
  if (hull.length < 4) return null;
  const quad = maxAreaQuad(reduceHull(hull, 14));
  // La forme doit vraiment ressembler à un quadrilatère.
  if (polyArea(quad) < 0.85 * area) return null;
  return orderQuad(quad).map(p => ({
    x: Math.max(0, Math.min(W, p.x / sc)),
    y: Math.max(0, Math.min(H, p.y / sc)),
  }));
}

/* ------------------------------------------------------------------ */
/* Redressement de la perspective                                       */
/* ------------------------------------------------------------------ */

function solve(A, b) {
  const n = b.length;
  for (let i = 0; i < n; i++) {
    let m = i;
    for (let k = i + 1; k < n; k++) if (Math.abs(A[k][i]) > Math.abs(A[m][i])) m = k;
    [A[i], A[m]] = [A[m], A[i]]; [b[i], b[m]] = [b[m], b[i]];
    for (let k = i + 1; k < n; k++) {
      const f = A[k][i] / A[i][i];
      for (let j = i; j < n; j++) A[k][j] -= f * A[i][j];
      b[k] -= f * b[i];
    }
  }
  const x = new Array(n);
  for (let i = n - 1; i >= 0; i--) {
    let s = b[i];
    for (let j = i + 1; j < n; j++) s -= A[i][j] * x[j];
    x[i] = s / A[i][i];
  }
  return x;
}

function homography(from, to) {
  const A = [], b = [];
  for (let i = 0; i < 4; i++) {
    const { x, y } = from[i], { x: u, y: v } = to[i];
    A.push([x, y, 1, 0, 0, 0, -u * x, -u * y]); b.push(u);
    A.push([0, 0, 0, x, y, 1, -v * x, -v * y]); b.push(v);
  }
  return solve(A, b);
}

const A4 = Math.SQRT2;

export function warp(src, quad, maxLong = MAX_SRC) {
  const q = quad;
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  let ow = (dist(q[0], q[1]) + dist(q[3], q[2])) / 2;
  let oh = (dist(q[0], q[3]) + dist(q[1], q[2])) / 2;
  // Proche du format A4 : on corrige les proportions (effet de la perspective).
  const ratio = Math.max(ow, oh) / Math.min(ow, oh);
  if (Math.abs(ratio - A4) / A4 < 0.08) {
    const areaSide = Math.sqrt(ow * oh / A4);
    if (oh >= ow) { ow = areaSide; oh = areaSide * A4; } else { oh = areaSide; ow = areaSide * A4; }
  }
  const s = Math.min(maxLong / Math.max(ow, oh), 1.3);
  const OW = Math.max(1, Math.round(ow * s)), OH = Math.max(1, Math.round(oh * s));
  const Hm = homography(
    [{ x: 0, y: 0 }, { x: OW, y: 0 }, { x: OW, y: OH }, { x: 0, y: OH }], q);
  const sw = src.width, sh = src.height;
  const sd = ctx2d(src).getImageData(0, 0, sw, sh).data;
  const out = makeCanvas(OW, OH);
  const octx = ctx2d(out);
  const img = octx.createImageData(OW, OH);
  const od = img.data;
  const [h0, h1, h2, h3, h4, h5, h6, h7] = Hm;
  let o = 0;
  for (let y = 0; y < OH; y++) {
    const yy = y + 0.5;
    for (let x = 0; x < OW; x++, o += 4) {
      const xx = x + 0.5;
      const den = h6 * xx + h7 * yy + 1;
      let u = (h0 * xx + h1 * yy + h2) / den - 0.5;
      let v = (h3 * xx + h4 * yy + h5) / den - 0.5;
      if (u < 0) u = 0; else if (u > sw - 1.001) u = sw - 1.001;
      if (v < 0) v = 0; else if (v > sh - 1.001) v = sh - 1.001;
      const x0 = u | 0, y0 = v | 0, fx = u - x0, fy = v - y0;
      const i00 = (y0 * sw + x0) * 4, i10 = i00 + 4, i01 = i00 + sw * 4, i11 = i01 + 4;
      const w00 = (1 - fx) * (1 - fy), w10 = fx * (1 - fy), w01 = (1 - fx) * fy, w11 = fx * fy;
      od[o] = sd[i00] * w00 + sd[i10] * w10 + sd[i01] * w01 + sd[i11] * w11;
      od[o + 1] = sd[i00 + 1] * w00 + sd[i10 + 1] * w10 + sd[i01 + 1] * w01 + sd[i11 + 1] * w11;
      od[o + 2] = sd[i00 + 2] * w00 + sd[i10 + 2] * w10 + sd[i01 + 2] * w01 + sd[i11 + 2] * w11;
      od[o + 3] = 255;
    }
  }
  octx.putImageData(img, 0, 0);
  return out;
}

/* ------------------------------------------------------------------ */
/* Filtres                                                              */
/* ------------------------------------------------------------------ */

export const FILTERS = [
  { id: 'scan', label: 'Scanner', hint: 'Fond blanc, texte net, couleurs (tampons, signatures) conservées' },
  { id: 'gray', label: 'Gris', hint: 'Niveaux de gris, fond blanc' },
  { id: 'bw', label: 'Photocopie', hint: 'Noir et blanc pur, comme une photocopieuse' },
  { id: 'color', label: 'Couleur', hint: 'Couleurs réelles corrigées (cartes, photos, diplômes)' },
  { id: 'original', label: 'Original', hint: 'Sans retouche' },
];

// Estime l'éclairage du papier (fond), bloc par bloc, par canal.
function estimateBackground(d, w, h) {
  const f = Math.max(4, Math.round(Math.max(w, h) / 200));
  const bw = Math.ceil(w / f), bh = Math.ceil(h / f);
  const nb = bw * bh;
  let bg = [new Float32Array(nb), new Float32Array(nb), new Float32Array(nb)];
  for (let y = 0; y < h; y++) {
    const by = ((y / f) | 0) * bw;
    for (let x = 0; x < w; x++) {
      const bi = by + ((x / f) | 0), j = (y * w + x) * 4;
      if (d[j] > bg[0][bi]) bg[0][bi] = d[j];
      if (d[j + 1] > bg[1][bi]) bg[1][bi] = d[j + 1];
      if (d[j + 2] > bg[2][bi]) bg[2][bi] = d[j + 2];
    }
  }
  const morph3 = (a, isMax) => {
    const o = new Float32Array(nb);
    for (let y = 0; y < bh; y++)
      for (let x = 0; x < bw; x++) {
        let m = isMax ? 0 : 255;
        for (let dy = -1; dy <= 1; dy++)
          for (let dx = -1; dx <= 1; dx++) {
            const xx = x + dx, yy = y + dy;
            if (xx < 0 || yy < 0 || xx >= bw || yy >= bh) continue;
            const v = a[yy * bw + xx];
            if (isMax ? v > m : v < m) m = v;
          }
        o[y * bw + x] = m;
      }
    return o;
  };
  const dilate = (a) => morph3(a, true), erode = (a) => morph3(a, false);
  const blur = (a, r) => {
    const t = new Float32Array(nb), o = new Float32Array(nb);
    for (let y = 0; y < bh; y++)
      for (let x = 0; x < bw; x++) {
        let s = 0, c = 0;
        for (let k = -r; k <= r; k++) { const xx = x + k; if (xx >= 0 && xx < bw) { s += a[y * bw + xx]; c++; } }
        t[y * bw + x] = s / c;
      }
    for (let y = 0; y < bh; y++)
      for (let x = 0; x < bw; x++) {
        let s = 0, c = 0;
        for (let k = -r; k <= r; k++) { const yy = y + k; if (yy >= 0 && yy < bh) { s += t[yy * bw + x]; c++; } }
        o[y * bw + x] = s / c;
      }
    return o;
  };
  // Fermeture (dilatation puis érosion) : efface le texte mais garde la
  // position des bords d'ombre, puis léger lissage.
  bg = bg.map(a => blur(erode(erode(dilate(dilate(a)))), 1));
  for (const a of bg) for (let i = 0; i < nb; i++) if (a[i] < 60) a[i] = 60;
  return { bg, f, bw, bh };
}

function percentile(hist, total, p) {
  let acc = 0;
  for (let i = 0; i < 256; i++) { acc += hist[i]; if (acc >= total * p) return i; }
  return 255;
}

export function enhance(src, mode) {
  if (mode === 'original') return src;
  const w = src.width, h = src.height;
  const out = makeCanvas(w, h);
  const octx = ctx2d(out);
  octx.drawImage(src, 0, 0);
  const img = octx.getImageData(0, 0, w, h);
  const d = img.data;

  if (mode === 'color') {
    const hs = [new Float64Array(256), new Float64Array(256), new Float64Array(256)];
    for (let j = 0; j < d.length; j += 16) { hs[0][d[j]]++; hs[1][d[j + 1]]++; hs[2][d[j + 2]]++; }
    const tot = d.length / 16;
    const lo = hs.map(hh => percentile(hh, tot, 0.01)), hi = hs.map(hh => percentile(hh, tot, 0.985));
    const lut = [0, 1, 2].map(c => {
      const t = new Uint8ClampedArray(256), span = Math.max(30, hi[c] - lo[c]);
      for (let i = 0; i < 256; i++) t[i] = ((i - lo[c]) / span) * 255;
      return t;
    });
    for (let j = 0; j < d.length; j += 4) {
      let r = lut[0][d[j]], g = lut[1][d[j + 1]], b = lut[2][d[j + 2]];
      const m = (r + g + b) / 3;
      d[j] = m + (r - m) * 1.15; d[j + 1] = m + (g - m) * 1.15; d[j + 2] = m + (b - m) * 1.15;
    }
    octx.putImageData(img, 0, 0);
    return out;
  }

  const { bg, f, bw, bh } = estimateBackground(d, w, h);
  // Courbe : papier -> blanc pur, encre -> noir, gris moyens assombris.
  const LO = 0.14, HI = 0.86, GAMMA = 1.35;
  const curve = new Uint8ClampedArray(1024);
  for (let i = 0; i < 1024; i++) {
    const n = i / 1023 * 1.25;
    let t = (n - LO) / (HI - LO);
    t = t < 0 ? 0 : t > 1 ? 1 : t;
    curve[i] = Math.pow(t, GAMMA) * 255;
  }
  const idx = (v) => { const k = (v / 1.25 * 1023) | 0; return k < 0 ? 0 : k > 1023 ? 1023 : k; };
  const [bR, bG, bB] = bg;
  for (let y = 0; y < h; y++) {
    let gy = (y + 0.5) / f - 0.5;
    if (gy < 0) gy = 0; if (gy > bh - 1) gy = bh - 1;
    const y0 = gy | 0, y1 = Math.min(bh - 1, y0 + 1), fy = gy - y0;
    for (let x = 0; x < w; x++) {
      let gx = (x + 0.5) / f - 0.5;
      if (gx < 0) gx = 0; if (gx > bw - 1) gx = bw - 1;
      const x0 = gx | 0, x1 = Math.min(bw - 1, x0 + 1), fx = gx - x0;
      const a = y0 * bw + x0, b = y0 * bw + x1, c = y1 * bw + x0, e = y1 * bw + x1;
      const w00 = (1 - fx) * (1 - fy), w10 = fx * (1 - fy), w01 = (1 - fx) * fy, w11 = fx * fy;
      const br = bR[a] * w00 + bR[b] * w10 + bR[c] * w01 + bR[e] * w11;
      const bgc = bG[a] * w00 + bG[b] * w10 + bG[c] * w01 + bG[e] * w11;
      const bb = bB[a] * w00 + bB[b] * w10 + bB[c] * w01 + bB[e] * w11;
      const j = (y * w + x) * 4;
      const nr = d[j] / br, ng = d[j + 1] / bgc, nb = d[j + 2] / bb;
      if (mode === 'scan') {
        let r = curve[idx(nr)], g = curve[idx(ng)], bl = curve[idx(nb)];
        const m = (r + g + bl) / 3;
        d[j] = m + (r - m) * 1.3; d[j + 1] = m + (g - m) * 1.3; d[j + 2] = m + (bl - m) * 1.3;
      } else {
        const n = 0.299 * nr + 0.587 * ng + 0.114 * nb;
        let v;
        if (mode === 'gray') v = curve[idx(n)];
        else { // bw : seuil doux pour des bords de lettres propres
          const t = (n - 0.66) / 0.1;
          v = t <= 0 ? 0 : t >= 1 ? 255 : t * 255;
        }
        d[j] = d[j + 1] = d[j + 2] = v;
      }
    }
  }
  octx.putImageData(img, 0, 0);
  return out;
}
