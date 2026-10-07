// Individual timetables, Geography department, GBHS Garoua, 2026/2027 (layout of the 2025-2026 model, data of the departmental Excel file)
const fs = require('fs');
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, ImageRun, AlignmentType, WidthType, BorderStyle, ShadingType,
  VerticalAlign, VerticalMergeType, PageOrientation, HeightRule } = require('docx');

const DIR = '/tmp/claude-0/-home-user-linea-github/389cf9fb-8078-5c81-95f2-72f084366795/scratchpad/ep26/';
const OUT = process.argv[2] || DIR + 'tt/';
const LOGO = fs.readFileSync(DIR + 'logo.jpeg');
const FONT = 'Century Gothic', W = 15398;              // A4 landscape 16838 − 2 × 720
const none = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
const NOB = { top: none, bottom: none, left: none, right: none, insideHorizontal: none, insideVertical: none };
const ln = { style: BorderStyle.SINGLE, size: 6, color: '000000' };
const BOX = { top: ln, bottom: ln, left: ln, right: ln, insideHorizontal: ln, insideVertical: ln };
const CB = { top: ln, bottom: ln, left: ln, right: ln };
const NC = { top: none, bottom: none, left: none, right: none };

const r = (t, o = {}) => new TextRun({ text: t, bold: o.bold, italics: o.italics, font: o.font || FONT, size: o.size || 20, color: o.color });
const P = (parts, o = {}) => new Paragraph({ alignment: o.align, spacing: { before: o.before || 0, after: o.after || 0 },
  children: [].concat(parts).map((x) => (typeof x === 'string' ? r(x, o) : x)) });
const cell = (children, w, o = {}) => new TableCell({ width: { size: w, type: WidthType.DXA }, verticalAlign: VerticalAlign.CENTER, verticalMerge: o.vmerge,
  margins: { top: 40, bottom: 40, left: 60, right: 60 }, borders: o.borders || CB, shading: o.shade ? { fill: o.shade, type: ShadingType.CLEAR, color: 'auto' } : undefined,
  children: [].concat(children) });
// "LABEL: value" pieces on one centred line
const info = (pairs) => P(pairs.flatMap(([k, v], i) => [r((i ? '          ' : '') + k + ': ', { bold: true }), r(v || '……………………')]), { align: AlignmentType.CENTER, after: 30 });

const PERIODS = ['7:30\n8:30', '8:30\n9:30', '9:30\n10:30', '10:30\n10:45', '10:45\n11:45', '11:45\n12:45', '12:45\n13:15', '13:15\n14:15', '14:15\n15:15', '15:15\n16:15', '16:15\n18:00'];
const BREAKS = [3, 6];
const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];

function grid(slots) {
  const dw = 1898, pw = Math.floor((W - dw) / 11); const widths = [dw].concat(Array(11).fill(pw)); widths[11] += W - dw - pw * 11;
  const head = new TableRow({ tableHeader: true, height: { value: 760, rule: HeightRule.ATLEAST }, children: [
    cell([P('PERIODS', { align: AlignmentType.RIGHT, bold: true, size: 18 }), P('DAYS', { bold: true, size: 18 })], dw, { shade: 'D9D9D9' }),
    ...PERIODS.map((t, i) => cell(t.split('\n').map((x) => P(x, { align: AlignmentType.CENTER, bold: true, size: 19 })), widths[i + 1], { shade: 'D9D9D9' }))] });
  const rows = DAYS.map((d, di) => new TableRow({ height: { value: 900, rule: HeightRule.EXACT }, children: [
    cell(P(d, { bold: true, size: 21 }), dw),
    ...PERIODS.map((_, pi) => {
      if (BREAKS.includes(pi)) return cell(di === 0 ? 'BREAK'.split('').map((c) => P(c, { align: AlignmentType.CENTER, bold: true, size: 16, color: '595959' })) : P(''), widths[pi + 1],
        { shade: 'EDEDED', vmerge: di === 0 ? VerticalMergeType.RESTART : VerticalMergeType.CONTINUE });
      const v = (slots[d] || {})[pi]; return cell(P(v || '', { align: AlignmentType.CENTER, bold: true, size: 22 }), widths[pi + 1]);
    })] }));
  return new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: widths, borders: BOX, rows: [head, ...rows] });
}

function sheet(t) {
  const header = new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: [7200, 2000, 6198], borders: NOB, rows: [new TableRow({ children: [
    cell([P('GOVERNMENT  BILINGUAL  HIGH  SCHOOL  GAROUA', { size: 22, bold: true }), P('P.O. BOX: 301 GAROUA      TEL: (+237) 674 23 91 99', { size: 20 })], 7200, { borders: NC }),
    cell(new Paragraph({ alignment: AlignmentType.CENTER, children: [new ImageRun({ type: 'jpg', data: LOGO, transformation: { width: 82, height: 94 } })] }), 2000, { borders: NC }),
    cell([P('SCHOOL ACADEMIC YEAR:', { align: AlignmentType.RIGHT, size: 22, bold: true }), P('2026-2027', { align: AlignmentType.RIGHT, size: 22 })], 6198, { borders: NC })] })] });
  const children = [header,
    P('INDIVIDUAL TIMETABLE', { align: AlignmentType.CENTER, bold: true, size: 24, before: 60, after: 20 }),
    info([['SUBJECT', 'GEOGRAPHY']]),
    info([["TEACHER'S NAMES", t.name], ['PERMANENT TEACHER / PART-TIMER', t.status]]),
    info([['FUNCTION', t.func], ['GRADE', t.grade], ['MATRICULE', t.mat]]),
    info([['LONGEVITY', t.years], ['PHONE NUMBER(S)', t.phone]]),
    info([['HOURS DUE', t.due], ['HOURS DONE', t.done], ['CLASSES TAUGHT', t.classes]]),
    P('', { after: 40 }),
    grid(t.slots || {}),
  ];
  if (t.note) children.push(P([r('Note: ', { bold: true, size: 18 }), r(t.note, { size: 18, italics: true })], { before: 60 }));
  children.push(new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: [10000, 5398], borders: NOB, rows: [new TableRow({ children: [
    cell(t.topics ? [P('SUBJECTS / TOPICS TO BE TAUGHT', { bold: true, size: 18, before: 80, after: 20 }), ...t.topics.map(([c, s]) => P([r(c + ': ', { bold: true, size: 18 }), r(s, { size: 18 })]))]
      : [P('SUBJECTS / TOPICS TO BE TAUGHT', { bold: true, size: 18, before: 80, after: 20 }), P('……………………………………………………………………………………………………………', { size: 18 }), P('……………………………………………………………………………………………………………', { size: 18 })], 10000, { borders: NC }),
    cell([P('Done in Garoua, on the ……………………………', { align: AlignmentType.CENTER, before: 120, after: 500 }), P('The Vice Principal', { align: AlignmentType.CENTER })], 5398, { borders: NC })] })] }));
  return { properties: { page: { size: { width: 11906, height: 16838, orientation: PageOrientation.LANDSCAPE }, margin: { top: 500, bottom: 400, left: 720, right: 720 } } }, children };
}

// slots: day -> { periodIndex: class } (period indexes 0..10, 3 and 6 are breaks)
const TEACHERS = [
  { key: 'KAMDEM', name: 'KAMDEM Emmanuel Berthaut', status: 'Permanent', func: 'H.O.D / Pedagogic Animator', grade: 'PLEG', mat: 'T-042 735', years: '12 Years',
    phone: '675 026 643 / 655 024 704', due: '14', done: '13', classes: 'F3A; F4Art; LSA; USA',
    slots: { MONDAY: { 0: 'F3A', 1: 'F3A', 2: 'LSA', 4: 'LSA', 5: 'F4Art', 9: 'USA' }, TUESDAY: { 0: 'USA', 1: 'USA', 2: 'USA', 4: 'USA', 5: 'LSA', 7: 'LSA', 8: 'LSA' } },
    note: 'During the first term, LSA and USA lessons are also taught on Saturdays (Geomorphology, Statistics).',
    topics: [['F3A', 'Physical Geography'], ['F4Art', 'Physical Geography (continuation)'], ['LSA', 'Geography of Cameroon, Population Geography, Geomorphology, Meteorology'], ['USA', 'Geography of Cameroon, Population Geography, Geomorphology, Meteorology, Statistics']] },
  { key: 'NEBASIBI', name: 'NEBASIBI ENNESSE', status: 'Part-timer', func: 'Teacher (Regional Pedagogic Inspector)', grade: 'PLEG', mat: '', years: '25 Years',
    phone: '676 121 625 / 697 775 388', due: '', done: '12', classes: 'F5Art; F5SC; LSA; USA',
    slots: { WEDNESDAY: { 0: 'LSA', 1: 'LSA', 2: 'USA', 5: 'F5SC', 7: 'F5SC' }, THURSDAY: { 2: 'LSA', 4: 'LSA', 5: 'USA', 7: 'USA' }, FRIDAY: { 0: 'F5Art', 1: 'F5Art', 2: 'LSA' } },
    topics: [['F5Art / F5SC (2 hours each)', 'Map Reading, Geography of Cameroon'], ['LSA', 'Human Geography (Settlement Geography), Biogeography, Hydrology and Climatology'], ['USA', 'Human Geography (Settlement Geography), Biogeography, Hydrology and Climatology, Map Work and Field Work']] },
  { key: 'ASTHA', name: 'ASTHA NOURA ABBA', status: 'Permanent', func: 'Teacher', grade: 'PCEG', mat: 'K-063 985', years: '09 Years',
    phone: '690 26 53 17 / 650 58 81 82', due: '18', done: '17', classes: 'F1A; F1B; F1BIL; F2A; F2B; F3A; F3B; F4Art; F4SC',
    slots: { MONDAY: { 0: 'F1A', 1: 'F1A', 2: 'F1B', 4: 'F1B', 5: 'F1BIL', 7: 'F1BIL', 8: 'F3B' }, WEDNESDAY: { 0: 'F4SC', 1: 'F4SC', 2: 'F4Art', 4: 'F4Art' },
      THURSDAY: { 0: 'F2A', 1: 'F2A' }, FRIDAY: { 0: 'F3B', 1: 'F3B', 2: 'F2B', 4: 'F3A' } },
    topics: [['F1A, F1B, F1BIL, F2A, F2B', 'Geography (first cycle programme)'], ['F3A / F3B', 'Physical Geography'], ['F4Art / F4SC', 'Human Geography']] },
  { key: 'TSOGO', name: 'TSOGO Sylviane', status: 'Part-timer', func: 'Teacher', grade: '', mat: '', years: '', phone: '', due: '', done: '9',
    classes: 'F4SC; F5Art; F5SC; LSA; USA',
    slots: { WEDNESDAY: { 0: 'USA', 1: 'USA', 4: 'USA' }, THURSDAY: { 1: 'F5Art', 4: 'F4SC', 5: 'LSA', 7: 'LSA' }, FRIDAY: { 2: 'USA', 4: 'F5SC' } },
    topics: [['F4SC', 'Physical Geography (continuation)'], ['F5Art / F5SC', 'Human Geography (1 hour each; continuation)'], ['LSA', 'Economic Geography, Contemporary Environmental Issues'], ['USA', 'Economic Geography, Contemporary Environmental Issues']] },
];
const BLANK = { key: 'VIERGE', name: '', status: '', func: '', grade: '', mat: '', years: '', phone: '', due: '', done: '', classes: '' };

// check: hours done = number of filled slots
for (const t of TEACHERS) { const n = Object.values(t.slots).reduce((a, d) => a + Object.keys(d).length, 0); if (String(n) !== t.done) throw new Error(t.key + ' ' + n); }

const save = (name, sections) => Packer.toBuffer(new Document({ styles: { default: { document: { run: { font: FONT, size: 20 } } } }, sections }))
  .then((b) => { fs.mkdirSync(OUT, { recursive: true }); fs.writeFileSync(OUT + name, b); console.log('written', name); });
(async () => {
  for (const t of TEACHERS) await save(`Timetable_2026-2027_${t.key}.docx`, [sheet(t)]);
  await save('Timetable_2026-2027_FICHE_VIERGE.docx', [sheet(BLANK)]);
  await save('Timetables_2026-2027_ALL_TEACHERS.docx', TEACHERS.map(sheet));
})();
