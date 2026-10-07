// DGCAST individual timetable 2026/2027, Mr KAMDEM (typed from the handwritten sheet)
const fs = require('fs');
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, ImageRun, AlignmentType, WidthType, BorderStyle, ShadingType,
  VerticalAlign, VerticalMergeType, PageOrientation, HeightRule } = require('docx');
const DIR = '/tmp/claude-0/-home-user-linea-github/389cf9fb-8078-5c81-95f2-72f084366795/scratchpad/ep26/';
const LOGO = fs.readFileSync(DIR + 'logo_dgc.png');
const FONT = 'Century Gothic', W = 15398;
const none = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
const NC = { top: none, bottom: none, left: none, right: none };
const ln = { style: BorderStyle.SINGLE, size: 6, color: '000000' };
const CB = { top: ln, bottom: ln, left: ln, right: ln };
const r = (t, o = {}) => new TextRun({ text: t, bold: o.bold, italics: o.italics, font: FONT, size: o.size || 20, color: o.color });
const P = (parts, o = {}) => new Paragraph({ alignment: o.align, spacing: { before: o.before || 0, after: o.after || 0 }, children: [].concat(parts).map((x) => (typeof x === 'string' ? r(x, o) : x)) });
const cell = (children, w, o = {}) => new TableCell({ width: { size: w, type: WidthType.DXA }, verticalAlign: VerticalAlign.CENTER, verticalMerge: o.vmerge,
  margins: { top: 40, bottom: 40, left: 50, right: 50 }, borders: o.borders || CB, shading: o.shade ? { fill: o.shade, type: ShadingType.CLEAR, color: 'auto' } : undefined, children: [].concat(children) });

const PERIODS = ['7.30 – 8.20', '8.20 – 9.10', '9.10 – 10.00', '10.00 – 10.15', '10.15 – 11.05', '11.05 – 11.55', '11.55 – 12.45', '12.45 – 01.20', '01.20 – 02.10', '02.10 – 03.00'];
const BREAKS = { 3: 'SHORT BREAK', 7: 'LONG BREAK' };
const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
const SLOTS = { THURSDAY: { 0: 'Geo 3G', 1: 'Geo 3G', 2: 'Geo 2B', 4: 'Geo 2B', 8: 'Geo 1B', 9: 'Geo 1B' },
  FRIDAY: { 0: 'Geo 1A', 1: 'Geo 1A', 2: 'Geo 4G', 4: 'Geo 2T', 5: 'Geo 2T' } };

const dw = 2100, pw = Math.floor((W - dw) / 10); const widths = [dw].concat(Array(10).fill(pw)); widths[10] += W - dw - pw * 10;
const head = new TableRow({ height: { value: 700, rule: HeightRule.ATLEAST }, children: [cell(P('DAYS / PERIODS', { bold: true, size: 18 }), dw, { shade: 'D9D9D9' }),
  ...PERIODS.map((t, i) => cell(P(t, { align: AlignmentType.CENTER, bold: true, size: 18 }), widths[i + 1], { shade: 'D9D9D9' }))] });
const rows = DAYS.map((d, di) => new TableRow({ height: { value: 1050, rule: HeightRule.EXACT }, children: [cell(P(d, { bold: true, size: 21 }), dw),
  ...PERIODS.map((_, pi) => (BREAKS[pi]
    ? cell(di === 0 ? BREAKS[pi].split('').map((c) => P(c === ' ' ? ' ' : c, { align: AlignmentType.CENTER, bold: true, size: 15, color: '595959' })) : P(''), widths[pi + 1],
      { shade: 'EDEDED', vmerge: di === 0 ? VerticalMergeType.RESTART : VerticalMergeType.CONTINUE })
    : cell(P((SLOTS[d] || {})[pi] || '', { align: AlignmentType.CENTER, bold: true, size: 22 }), widths[pi + 1])))] }));
const n = Object.values(SLOTS).reduce((a, d) => a + Object.keys(d).length, 0);

const header = new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: [2400, 10598, 2400], borders: { top: none, bottom: none, left: none, right: none, insideHorizontal: none, insideVertical: none },
  rows: [new TableRow({ children: [
    cell(new Paragraph({ alignment: AlignmentType.CENTER, children: [new ImageRun({ type: 'png', data: LOGO, transformation: { width: 120, height: 93 } })] }), 2400, { borders: NC }),
    cell([P('DIVINE GRACE COLLEGE OF ARTS, SCIENCE AND TECHNOLOGY (DGCAST) GAROUA', { align: AlignmentType.CENTER, bold: true, size: 24 }),
      P('INDIVIDUAL TIMETABLE FOR 2026/2027 ACADEMIC YEAR', { align: AlignmentType.CENTER, bold: true, size: 22, before: 80 })], 10598, { borders: NC }),
    cell(P(''), 2400, { borders: NC })] })] });
const infos = P([r('Name of teacher: ', { bold: true }), r('Mr KAMDEM Emmanuel'), r('          Subject(s): ', { bold: true }), r('Geography'),
  r('          No. of periods: ', { bold: true }), r(String(n))], { align: AlignmentType.CENTER, before: 120, after: 160 });
const legend = P([r('Classes: ', { bold: true, size: 18 }), r('Geo 1A, Geo 1B (Form 1)  •  Geo 2B (Form 2)  •  Geo 2T (Form 2 Technical)  •  Geo 3G (Form 3)  •  Geo 4G (Form 4)', { size: 18 })], { before: 100 });

const doc = new Document({ styles: { default: { document: { run: { font: FONT, size: 20 } } } }, sections: [{
  properties: { page: { size: { width: 11906, height: 16838, orientation: PageOrientation.LANDSCAPE }, margin: { top: 600, bottom: 500, left: 720, right: 720 } } },
  children: [header, infos, new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: widths, rows: [head, ...rows] }), legend] }] });
Packer.toBuffer(doc).then((b) => { fs.mkdirSync(DIR + 'tt', { recursive: true }); fs.writeFileSync(DIR + 'tt/DGCAST_Timetable_2026-2027_KAMDEM.docx', b); console.log('periods', n); });
