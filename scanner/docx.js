// Fichier Word (.docx) fait à partir du texte reconnu, sans bibliothèque :
// un .docx est une archive ZIP de quelques fichiers XML.
//
// La mise en page suit le document scanné : taille des caractères d'après la
// hauteur des lignes, titres en gras, centrage, espaces entre paragraphes.
// Les mots dont la lecture est incertaine sont surlignés en jaune pour être
// vérifiés.

import { keepBreak } from './ocr.js';

const enc = new TextEncoder();

/* ------------------------------ ZIP (sans compression) ------------------------------ */

const CRC = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(b) {
  let c = 0xffffffff;
  for (let i = 0; i < b.length; i++) c = CRC[(c ^ b[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

export function zip(files) {
  const parts = [], central = [];
  let offset = 0;
  const d = new Date();
  const time = (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1);
  const date = ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate();
  for (const f of files) {
    const name = enc.encode(f.name);
    const data = typeof f.data === 'string' ? enc.encode(f.data) : f.data;
    const crc = crc32(data);
    const h = new DataView(new ArrayBuffer(30));
    h.setUint32(0, 0x04034b50, true); h.setUint16(4, 20, true); h.setUint16(6, 0x0800, true);
    h.setUint16(8, 0, true); h.setUint16(10, time, true); h.setUint16(12, date, true);
    h.setUint32(14, crc, true); h.setUint32(18, data.length, true); h.setUint32(22, data.length, true);
    h.setUint16(26, name.length, true); h.setUint16(28, 0, true);
    parts.push(new Uint8Array(h.buffer), name, data);
    const c = new DataView(new ArrayBuffer(46));
    c.setUint32(0, 0x02014b50, true); c.setUint16(4, 20, true); c.setUint16(6, 20, true);
    c.setUint16(8, 0x0800, true); c.setUint16(10, 0, true); c.setUint16(12, time, true); c.setUint16(14, date, true);
    c.setUint32(16, crc, true); c.setUint32(20, data.length, true); c.setUint32(24, data.length, true);
    c.setUint16(28, name.length, true); c.setUint32(42, offset, true);
    central.push(new Uint8Array(c.buffer), name);
    offset += 30 + name.length + data.length;
  }
  const cdSize = central.reduce((s, p) => s + p.length, 0);
  const e = new DataView(new ArrayBuffer(22));
  e.setUint32(0, 0x06054b50, true);
  e.setUint16(8, files.length, true); e.setUint16(10, files.length, true);
  e.setUint32(12, cdSize, true); e.setUint32(16, offset, true);
  return new Blob([...parts, ...central, new Uint8Array(e.buffer)]);
}

/* ------------------------------ Word ------------------------------ */

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  // Caractères interdits en XML
  .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '');

const A4_W_PT = 595.28;
const LOW_CONF = 60;

function median(a) {
  if (!a.length) return 0;
  const s = a.slice().sort((x, y) => x - y);
  return s[s.length >> 1];
}

// pages : [{ w, h, paragraphs }] (positions en pixels de l'image de la page)
export function buildDocx(pages, { title = 'Document', highlight = true } = {}) {
  const body = [];
  pages.forEach((pg, pi) => {
    if (pi > 0) body.push('<w:p><w:r><w:br w:type="page"/></w:r></w:p>');
    // Échelle : l'image de la page est ramenée à la largeur d'une page A4.
    const ptPerPx = A4_W_PT / pg.w;
    // Corps du texte d'après la hauteur de la ligne : la boîte d'une ligne va
    // du haut des majuscules/ascendantes au bas des descendantes (g, p, q…).
    const lineSize = (l) => {
      const t = l.words.map(w => w.t).join('');
      const k = !/[a-zà-ÿ]/.test(t) ? 0.72 : /[gjpqyç]/.test(t) ? 0.95 : 0.76;
      return ((l.b[3] - l.b[1]) * ptPerPx) / k;
    };
    const sizes = [];
    for (const p of pg.paragraphs) for (const l of p.lines) sizes.push(lineSize(l));
    const bodySize = median(sizes) || 12;
    let prevBottom = null;
    for (const p of pg.paragraphs) {
      const lh = median(p.lines.map(l => (l.b[3] - l.b[1]) * ptPerPx));
      const raw = median(p.lines.map(lineSize));
      const size = Math.max(8, Math.min(36, Math.round(raw * 2) / 2));
      const bold = raw > bodySize * 1.3;
      const [x0, y0, x1, y1] = p.b;
      const cx = (x0 + x1) / 2 / pg.w, width = (x1 - x0) / pg.w;
      let jc = '';
      if (width < 0.75 && Math.abs(cx - 0.5) < 0.06) jc = 'center';
      else if (x0 / pg.w > 0.55) jc = 'right';
      const before = prevBottom === null ? 0 : Math.max(0, Math.min(36, (y0 - prevBottom) * ptPerPx - lh * 0.3));
      prevBottom = y1;
      // Texte suivi (lignes pleines) : un seul paragraphe ; sinon on garde
      // les retours à la ligne (adresses, listes, formulaires).
      const flowing = p.lines.length > 1 &&
        p.lines.slice(0, -1).every(l => (l.b[2] - l.b[0]) > (x1 - x0) * 0.8);
      const rPr = `<w:rPr>${bold ? '<w:b/>' : ''}<w:sz w:val="${size * 2}"/><w:szCs w:val="${size * 2}"/></w:rPr>`;
      const runs = [];
      const pushWord = (w, space) => {
        const hl = highlight && w.c < LOW_CONF ? '<w:highlight w:val="yellow"/>' : '';
        const pr = hl ? rPr.replace('</w:rPr>', `${hl}</w:rPr>`) : rPr;
        runs.push(`<w:r>${pr}<w:t xml:space="preserve">${esc((space ? ' ' : '') + w.t)}</w:t></w:r>`);
      };
      if (flowing) {
        // Recolle les mots coupés en fin de ligne.
        const words = [];
        let prevText = '';
        p.lines.forEach((l, li) => {
          const text = l.words.map(w => w.t).join(' ');
          const br = li > 0 && keepBreak(prevText, text);
          prevText = text;
          l.words.forEach((w, wi) => {
            const last = words[words.length - 1];
            if (li > 0 && wi === 0 && last && /[a-zà-ÿ]-$/i.test(last.t)) {
              last.t = last.t.slice(0, -1) + w.t;
              last.c = Math.min(last.c, w.c);
            } else words.push({ ...w, br: br && wi === 0 });
          });
        });
        words.forEach((w, i) => {
          if (w.br) runs.push(`<w:r>${rPr}<w:br/></w:r>`);
          pushWord(w, i > 0 && !w.br);
        });
      } else {
        p.lines.forEach((l, li) => {
          if (li > 0) runs.push(`<w:r>${rPr}<w:br/></w:r>`);
          l.words.forEach((w, i) => pushWord(w, i > 0));
        });
      }
      const pPr = `<w:pPr><w:spacing w:before="${Math.round(before * 20)}" w:after="0"/>${jc ? `<w:jc w:val="${jc}"/>` : ''}</w:pPr>`;
      body.push(`<w:p>${pPr}${runs.join('')}</w:p>`);
    }
    if (!pg.paragraphs.length) body.push('<w:p><w:r><w:t>(Aucun texte reconnu sur cette page.)</w:t></w:r></w:p>');
  });

  const W = 'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"';
  const document = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document ${W}><w:body>${body.join('')}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134" w:header="567" w:footer="567" w:gutter="0"/></w:sectPr></w:body></w:document>`;
  const styles = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles ${W}><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman" w:eastAsia="Times New Roman"/><w:sz w:val="24"/><w:szCs w:val="24"/><w:lang w:val="fr-FR"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="0" w:line="264" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults><w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/></w:style></w:styles>`;
  const now = new Date().toISOString().replace(/\.\d+Z$/, 'Z');
  const core = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>${esc(title)}</dc:title><dcterms:created xsi:type="dcterms:W3CDTF">${now}</dcterms:created><dcterms:modified xsi:type="dcterms:W3CDTF">${now}</dcterms:modified></cp:coreProperties>`;
  return zip([
    { name: '[Content_Types].xml', data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/></Types>` },
    { name: '_rels/.rels', data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/></Relationships>` },
    { name: 'word/_rels/document.xml.rels', data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>` },
    { name: 'word/document.xml', data: document },
    { name: 'word/styles.xml', data: styles },
    { name: 'docProps/core.xml', data: core },
  ]);
}

