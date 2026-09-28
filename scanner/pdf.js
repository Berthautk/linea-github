// Petit générateur PDF : une image JPEG par page, sans bibliothèque externe.

const enc = new TextEncoder();

export const PAGE_SIZES = {
  a4: [595.28, 841.89],
  letter: [612, 792],
};

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

// pages : [{ jpeg: Uint8Array, px: [largeur, hauteur], box: [x, y, l, h] en points, size: [l, h] en points }]
export function buildPdf(pages, { title = 'Document' } = {}) {
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
  const pageNum = (i) => 4 + i * 3;
  const kids = pages.map((_, i) => `${pageNum(i)} 0 R`).join(' ');

  obj(1, '<< /Type /Catalog /Pages 2 0 R >>');
  obj(2, `<< /Type /Pages /Kids [${kids}] /Count ${n} >>`);
  obj(3, `<< /Title ${utf16Hex(title)} /CreationDate ${pdfDate()} /ModDate ${pdfDate()} >>`);

  const f = (v) => (Math.round(v * 100) / 100).toString();
  pages.forEach((pg, i) => {
    const P = pageNum(i), C = P + 1, I = P + 2;
    const [pw, ph] = pg.size;
    const [bx, by, bw, bh] = pg.box;
    obj(P, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${f(pw)} ${f(ph)}] ` +
      `/Resources << /XObject << /Im0 ${I} 0 R >> >> /Contents ${C} 0 R >>`);
    const content = `q ${f(bw)} 0 0 ${f(bh)} ${f(bx)} ${f(by)} cm /Im0 Do Q`;
    obj(C, `<< /Length ${enc.encode(content).length} >>\nstream\n${content}\nendstream`);
    obj(I, [
      `<< /Type /XObject /Subtype /Image /Width ${pg.px[0]} /Height ${pg.px[1]} ` +
      `/ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${pg.jpeg.length} >>\nstream\n`,
      pg.jpeg,
      '\nendstream',
    ]);
  });

  const xref = offset;
  const total = 4 + n * 3;
  let x = `xref\n0 ${total}\n0000000000 65535 f \n`;
  for (let i = 1; i < total; i++) x += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  push(x);
  push(`trailer\n<< /Size ${total} /Root 1 0 R /Info 3 0 R >>\nstartxref\n${xref}\n%%EOF\n`);
  return new Blob(chunks, { type: 'application/pdf' });
}
