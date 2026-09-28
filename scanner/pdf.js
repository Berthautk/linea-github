// Petit générateur PDF : une image JPEG par page, sans bibliothèque externe.
// Option : une couche de texte invisible posée sur chaque mot reconnu (OCR),
// pour chercher, sélectionner et copier le texte, comme un PDF de scanner pro.

const enc = new TextEncoder();

export const PAGE_SIZES = {
  a4: [595.28, 841.89],
  letter: [612, 792],
};

// Largeurs Helvetica (1/1000 em), caractères 32 à 126.
const HELV = [278, 278, 355, 556, 556, 889, 667, 191, 333, 333, 389, 584, 278, 333, 278, 278,
  556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 278, 278, 584, 584, 584, 556, 1015,
  667, 667, 722, 722, 667, 611, 778, 722, 278, 500, 667, 556, 833, 722, 778, 667, 778, 722,
  667, 611, 722, 667, 944, 667, 667, 611, 278, 278, 278, 469, 556, 333,
  556, 556, 500, 556, 556, 278, 556, 556, 222, 222, 500, 222, 833, 556, 556, 556, 556, 333,
  500, 278, 556, 500, 722, 500, 500, 500, 334, 260, 334, 584];

const CP1252 = {
  0x20ac: 0x80, 0x201a: 0x82, 0x0192: 0x83, 0x201e: 0x84, 0x2026: 0x85, 0x2020: 0x86, 0x2021: 0x87,
  0x02c6: 0x88, 0x2030: 0x89, 0x0160: 0x8a, 0x2039: 0x8b, 0x0152: 0x8c, 0x017d: 0x8e, 0x2018: 0x91,
  0x2019: 0x92, 0x201c: 0x93, 0x201d: 0x94, 0x2022: 0x95, 0x2013: 0x96, 0x2014: 0x97, 0x02dc: 0x98,
  0x2122: 0x99, 0x0161: 0x9a, 0x203a: 0x9b, 0x0153: 0x9c, 0x017e: 0x9e, 0x0178: 0x9f,
};

// Texte -> octets WinAnsi (accents français compris) ; le reste devient « ? ».
function winAnsi(s) {
  const out = [];
  for (const ch of s) {
    const cp = ch.codePointAt(0);
    if (cp < 0x80 || (cp >= 0xa0 && cp <= 0xff)) out.push(cp);
    else out.push(CP1252[cp] || 0x3f);
  }
  return out;
}

function textWidth(bytes) {
  let w = 0;
  for (const b of bytes) w += b >= 32 && b <= 126 ? HELV[b - 32] : 556;
  return w / 1000;
}

function utf16Hex(s) {
  let h = 'FEFF';
  for (const ch of s) {
    const cp = ch.codePointAt(0);
    const units = cp > 0xffff
      ? [0xd800 + ((cp - 0x10000) >> 10), 0xdc00 + ((cp - 0x10000) & 0x3ff)]
      : [cp];
    for (const u of units) h += u.toString(16).padStart(4, '0').toUpperCase();
  }
  return `<${h}>`;
}

function pdfDate(d = new Date()) {
  const p = (n) => String(n).padStart(2, '0');
  return `(D:${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())})`;
}

const f = (v) => (Math.round(v * 100) / 100).toString();

// Couche de texte invisible (mode de rendu 3) : chaque mot est étiré
// horizontalement pour couvrir exactement le mot de l'image.
function textLayer(words) {
  const bytes = [...enc.encode('BT 3 Tr\n')];
  for (const w of words) {
    const t = winAnsi(w.t);
    if (!t.length || w.w <= 0 || w.h <= 0) continue;
    const size = w.h;
    const natural = textWidth(t) * size;
    const tz = natural > 0 ? Math.max(10, Math.min(1000, (w.w / natural) * 100)) : 100;
    bytes.push(...enc.encode(`/F1 ${f(size)} Tf ${f(tz)} Tz 1 0 0 1 ${f(w.x)} ${f(w.y)} Tm (`));
    for (const b of t) {
      if (b === 0x28 || b === 0x29 || b === 0x5c) bytes.push(0x5c);
      bytes.push(b);
    }
    bytes.push(...enc.encode(') Tj\n'));
  }
  bytes.push(...enc.encode('ET\n'));
  return new Uint8Array(bytes);
}

// pages : [{ jpeg: Uint8Array, px: [l, h], box: [x, y, l, h] en points, size: [l, h] en points,
//            words?: [{ t, x, y (ligne de base), w, h }] en points }]
export function buildPdf(pages, { title = 'Document', producer = 'VraiScan' } = {}) {
  const chunks = [];
  let offset = 0;
  const offsets = [];
  const push = (data) => {
    const b = typeof data === 'string' ? enc.encode(data) : data;
    chunks.push(b);
    offset += b.length;
  };
  const obj = (num, body) => {
    offsets[num] = offset;
    push(`${num} 0 obj\n`);
    for (const part of [].concat(body)) push(part);
    push('\nendobj\n');
  };

  push('%PDF-1.4\n');
  push(new Uint8Array([0x25, 0xe2, 0xe3, 0xcf, 0xd3, 0x0a]));

  const n = pages.length;
  const pageNum = (i) => 5 + i * 3;
  const kids = pages.map((_, i) => `${pageNum(i)} 0 R`).join(' ');

  obj(1, '<< /Type /Catalog /Pages 2 0 R >>');
  obj(2, `<< /Type /Pages /Kids [${kids}] /Count ${n} >>`);
  obj(3, `<< /Title ${utf16Hex(title)} /Producer ${utf16Hex(producer)} /CreationDate ${pdfDate()} /ModDate ${pdfDate()} >>`);
  obj(4, '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');

  pages.forEach((pg, i) => {
    const P = pageNum(i), C = P + 1, I = P + 2;
    const [pw, ph] = pg.size;
    const [bx, by, bw, bh] = pg.box;
    const hasText = pg.words && pg.words.length;
    obj(P, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${f(pw)} ${f(ph)}] ` +
      `/Resources << /XObject << /Im0 ${I} 0 R >>${hasText ? ' /Font << /F1 4 0 R >>' : ''} >> /Contents ${C} 0 R >>`);
    const img = enc.encode(`q ${f(bw)} 0 0 ${f(bh)} ${f(bx)} ${f(by)} cm /Im0 Do Q\n`);
    const txt = hasText ? textLayer(pg.words) : new Uint8Array(0);
    const content = new Uint8Array(img.length + txt.length);
    content.set(img, 0);
    content.set(txt, img.length);
    obj(C, [`<< /Length ${content.length} >>\nstream\n`, content, '\nendstream']);
    obj(I, [
      `<< /Type /XObject /Subtype /Image /Width ${pg.px[0]} /Height ${pg.px[1]} ` +
      `/ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${pg.jpeg.length} >>\nstream\n`,
      pg.jpeg,
      '\nendstream',
    ]);
  });

  const xref = offset;
  const total = 5 + n * 3;
  let x = `xref\n0 ${total}\n0000000000 65535 f \n`;
  for (let i = 1; i < total; i++) x += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  push(x);
  push(`trailer\n<< /Size ${total} /Root 1 0 R /Info 3 0 R >>\nstartxref\n${xref}\n%%EOF\n`);
  return new Blob(chunks, { type: 'application/pdf' });
}
