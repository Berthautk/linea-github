// Student handout (PDF) of LSA Climatology, Further Study 1: Tropical Weather Disturbances. Built from the board summary of the lesson deck.
const fs = require('fs');
const { Document, Packer, Paragraph, TextRun, ImageRun, Table, TableRow, TableCell, AlignmentType, WidthType, BorderStyle, ShadingType, VerticalAlign, Footer, PageNumber } = require('docx');
const DIR = process.argv[2];            // folder with bs.json and img/
const OUT = process.argv[3];
const CFG = JSON.parse(fs.readFileSync(process.argv[4], 'utf8'));  // title, class, topic, images, homework, next lesson, optional table
const FONT = 'Times New Roman', W = 10466;
const bs = JSON.parse(fs.readFileSync(DIR + '/bs.json', 'utf8'));
const IMG = {}; for (const k of Object.keys(CFG.images)) IMG[k] = CFG.images[k];
const TXT = (t, o = {}) => new TextRun({ text: t, font: FONT, size: o.size || 25, bold: o.bold, italics: o.italics, color: o.color });
const para = (children, o = {}) => new Paragraph({ children, alignment: o.align, keepNext: o.keepNext, keepLines: true, spacing: { before: o.before || 0, after: o.after === undefined ? 100 : o.after, line: o.line || 340 },
  indent: o.left ? { left: o.left, hanging: o.hang || 0 } : undefined, border: o.border });
const band = (t) => new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: [W], borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE }, insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE } },
  rows: [new TableRow({ cantSplit: true, children: [new TableCell({ width: { size: W, type: WidthType.DXA }, shading: { fill: '1F3864', type: ShadingType.CLEAR, color: 'auto' }, margins: { top: 70, bottom: 70, left: 140, right: 100 },
    children: [para([TXT(t, { bold: true, size: 27, color: 'FFFFFF' })], { after: 0, keepNext: true })] })] })] });
const h2 = (t) => para([TXT(t, { bold: true, size: 26, color: '9B1B1B' })], { before: 160, after: 60, keepNext: true, border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: '9B1B1B', space: 2 } } });
const picture = (n) => { const [f, ext, w, h, cap] = IMG[n]; const wpx = 400; return [
  new Paragraph({ alignment: AlignmentType.CENTER, keepNext: true, spacing: { before: 80, after: 20 }, children: [new ImageRun({ type: ext, data: fs.readFileSync(DIR + '/img/' + f), transformation: { width: wpx, height: Math.round(wpx * h / w) } })] }),
  para([TXT('Illustration: ' + cap, { italics: true, size: 21 })], { align: AlignmentType.CENTER, after: 120 })]; };

const children = [
  para([TXT('GBHS GAROUA – GEOGRAPHY DEPARTMENT', { bold: true, size: 22 })], { align: AlignmentType.CENTER, after: 20 }),
  para([TXT(CFG.cls + ' – GEOGRAPHY – ' + CFG.module, { size: 22 })], { align: AlignmentType.CENTER, after: 60 }),
  para([TXT(CFG.line1, { bold: true, size: 36, color: '1F3864' })], { align: AlignmentType.CENTER, after: 0 }),
  para([TXT(CFG.line2, { bold: true, size: 34, color: '9B1B1B' })], { align: AlignmentType.CENTER, after: 80 }),
  para([TXT('Topic: ', { bold: true }), TXT(CFG.topic + '     '), TXT('Sub-topic: ', { bold: true }), TXT(CFG.subtopic)], { align: AlignmentType.CENTER, after: 40 }),
  para([TXT('Teacher: Mr KAMDEM Emmanuel – Copy this lesson in your notebook, with the illustrations.', { italics: true, size: 22 })], { align: AlignmentType.CENTER, after: 140, border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: '1F3864', space: 6 } } }),
];

let lastH1 = '', lastH2 = '';
for (const sl of bs) {
  const shapes = sl.shapes.filter((s) => !/Slide Number/.test(s.name) && s.paras.length).sort((a, b) => a.top - b.top);
  const hasText3 = shapes.some((s) => s.name === 'Text 3' && !/^Illustration:/.test(s.paras.map((p) => p.map((r) => r[0]).join('')).join(' ')));
  let ill = null;
  for (const sh of shapes) {
    const flat = sh.paras.map((p) => p.map((r) => r[0]).join('')).join(' ');
    if (sh.name === 'Text 0') continue;
    if (/^Illustration:/.test(flat)) { ill = true; continue; }
    if (sh.name === 'Text 1') {
      const h = flat.replace(/\s*\(continued\)/, '');
      if (h !== lastH1) { children.push(para([], { after: 60 }), band(h.toUpperCase() === h ? h : h), para([], { after: 20 })); lastH1 = h; lastH2 = ''; }
      continue;
    }
    if (sh.name === 'Text 2' && hasText3) {
      const h = flat.replace(/\s*\(continued\)/, '');
      if (h !== lastH2) { children.push(h2(h)); lastH2 = h; }
      continue;
    }
    // body
    for (const pr of sh.paras) {
      const first = pr[0];
      const text = pr.map((r) => r[0]).join('');
      if (pr.length > 1 && first[1]) {
        children.push(para([TXT(first[0], { bold: true }), TXT(pr.slice(1).map((r) => r[0]).join(''))], { left: 360, hang: 360 === 0 ? 0 : 0, after: 110 }));
      } else if (/:$/.test(text.trim())) {
        if (!/key terms/.test(text)) children.push(para([TXT(text, { italics: true })], { after: 70, keepNext: true }));
      } else children.push(para([TXT(text)], { after: 100 }));
    }
  }
  if (ill && IMG[sl.n]) children.push(...picture(sl.n));
}

// optional comparison table
if (CFG.table) {
  const rows = CFG.table;
  const ln = { style: BorderStyle.SINGLE, size: 6, color: '1F3864' };
  const widths = CFG.tableWidths;
  children.push(para([], { after: 60 }), band(CFG.tableTitle), para([], { after: 40 }),
    new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: widths, borders: { top: ln, bottom: ln, left: ln, right: ln, insideHorizontal: ln, insideVertical: ln },
      rows: rows.map((r, i) => new TableRow({ cantSplit: true, children: r.map((c, j) => new TableCell({ width: { size: widths[j], type: WidthType.DXA }, verticalAlign: VerticalAlign.CENTER, margins: { top: 60, bottom: 60, left: 100, right: 100 },
        shading: i === 0 ? { fill: 'D9E2F3', type: ShadingType.CLEAR, color: 'auto' } : j === 0 ? { fill: 'F2F2F2', type: ShadingType.CLEAR, color: 'auto' } : undefined,
        children: [para([TXT(c, { bold: i === 0 || j === 0, size: 23 })], { after: 0, line: 300 })] })) })) }));
}

children.push(para([], { after: 60 }), band('HOMEWORK'), para([], { after: 40 }),
  para([TXT(CFG.homework, { bold: true })], { left: 360, after: 120 }),
  para([TXT('Our next lesson will be on: ', { italics: true }), TXT(CFG.next, { italics: true, bold: true })], { left: 360, after: 60 }));

const doc = new Document({ styles: { default: { document: { run: { font: FONT, size: 25 } } } },
  sections: [{ properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 800, bottom: 800, left: 720, right: 720 } } },
    footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'GBHS Garoua – ' + CFG.cls_footer + ' – Geography – ' + CFG.footer + ' – Page ', font: FONT, size: 17 }), new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 17 })] })] }) },
    children }] });
Packer.toBuffer(doc).then((b) => { fs.writeFileSync(OUT, b); console.log('ok'); });
