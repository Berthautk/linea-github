// Second sequence evaluations 2026-2027, Geography, DGCAST Garoua (Divine Grace College): one Word file per class. Teacher's name in the identification table.
const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, ImageRun, AlignmentType, WidthType,
  BorderStyle, TabStopType, LeaderType, VerticalAlign, ShadingType, Footer, PageNumber, SectionType,
} = require('docx');

const OUT = process.argv[2] || '.';
const LOGO = fs.readFileSync(__dirname + '/logo_dgc.png');
const W = 10466;                       // A4 width 11906 minus 2 × 720
const FONT = 'Times New Roman';
const YEAR = '2026-2027';

// ---------- small helpers ----------
const none = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
const NOB = { top: none, bottom: none, left: none, right: none, insideHorizontal: none, insideVertical: none };
const line = { style: BorderStyle.SINGLE, size: 4, color: '000000' };
const BOX = { top: line, bottom: line, left: line, right: line, insideHorizontal: line, insideVertical: line };

function runs(t, o = {}) {           // **bold** inside a string
  return String(t).split(/(\*\*[^*]+\*\*)/).filter(Boolean).map((s) => (s.startsWith('**')
    ? new TextRun({ text: s.slice(2, -2), bold: true, font: FONT, size: o.size || 24, italics: o.italics })
    : new TextRun({ text: s, bold: o.bold, font: FONT, size: o.size || 24, italics: o.italics })));
}
const P = (t, o = {}) => new Paragraph({ alignment: o.align, spacing: { before: o.before || 0, after: o.after === undefined ? 60 : o.after, line: o.line },
  indent: o.indent ? { left: o.indent, hanging: o.hanging || 0 } : undefined, keepNext: o.keepNext, children: runs(t, o) });
const C = (t, o = {}) => P(t, Object.assign({ align: AlignmentType.CENTER }, o));
const DOTS = (n, indent = 0, width = W) => Array.from({ length: n }, () => new Paragraph({ indent: { left: indent }, spacing: { before: 0, after: 0, line: 380 },
  tabStops: [{ type: TabStopType.RIGHT, position: width - indent, leader: LeaderType.DOT }], children: [new TextRun({ text: '\t', font: FONT, size: 24 })] }));
const SPACE = (n = 1) => Array.from({ length: n }, () => new Paragraph({ spacing: { after: 0 }, children: [] }));

function cell(children, width, o = {}) {
  return new TableCell({ width: { size: width, type: WidthType.DXA }, columnSpan: o.span, verticalAlign: o.valign || VerticalAlign.CENTER,
    margins: { top: 50, bottom: 50, left: 90, right: 90 }, borders: o.borders,
    shading: o.shade ? { fill: o.shade, type: ShadingType.CLEAR, color: 'auto' } : undefined,
    children: Array.isArray(children) ? children : [children] });
}
function table(widths, rows, borders = BOX) {
  return new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: widths, borders,
    rows: rows.map((r) => new TableRow({ children: r.map((c, i) => (c instanceof TableCell ? c : cell(typeof c === 'string' ? P(c, { after: 0, size: 21 }) : c, widths[i]))) })) });
}

// ---------- official bilingual header ----------
function header() {
  const fr = ['REPUBLIQUE DU CAMEROUN', 'Paix – Travail – Patrie', '********', 'MINISTERE DES ENSEIGNEMENTS SECONDAIRES', '********',
    'DELEGATION REGIONALE DU NORD', '********', 'DELEGATION DEPARTEMENTALE DE LA BENOUE', '********', 'DIVINE GRACE COLLEGE OF ARTS, SCIENCE AND TECHNOLOGY', '(DGCAST) – GAROUA'];
  const en = ['REPUBLIC OF CAMEROON', 'Peace – Work – Fatherland', '********', 'MINISTRY OF SECONDARY EDUCATION', '********',
    'NORTH REGIONAL DELEGATION', '********', 'BENOUE DIVISIONAL DELEGATION', '********', 'DIVINE GRACE COLLEGE OF ARTS, SCIENCE AND TECHNOLOGY', '(DGCAST) – GAROUA'];
  const col = (arr) => arr.map((t, i) => C(t, { size: 15, after: 0, bold: i === 0 || i >= 9, italics: i === 1 }));
  return new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: [4133, 2200, 4133], borders: NOB,
    rows: [new TableRow({ children: [
      cell(col(fr), 4133, { borders: NOB }),
      cell(new Paragraph({ alignment: AlignmentType.CENTER, children: [new ImageRun({ type: 'png', data: LOGO, transformation: { width: 150, height: 116 } })] }), 2200, { borders: NOB }),
      cell(col(en), 4133, { borders: NOB })] })] });
}

// student / paper identification block (the school model)
function idBlockCompact(x) {
  const p = (t, o = {}) => P(t, Object.assign({ after: 0, size: 19 }, o));
  const dotsP = (label, w) => new Paragraph({ spacing: { after: 0 }, tabStops: [{ type: TabStopType.RIGHT, position: w, leader: LeaderType.DOT }], children: [...runs('**' + label + '**', { size: 19 }), new TextRun({ text: '\t', font: FONT, size: 19 })] });
  const rows = [
    [p('**DEPARTMENT**'), p('GEOGRAPHY', { align: AlignmentType.CENTER, bold: true }), p('**DURATION**'), p(x.durationShort, { bold: true })],
    [p('**SUBJECT**'), p(x.subject, { align: AlignmentType.CENTER, bold: true }), p('**COEFFICIENT**'), p('')],
    [p('**CLASS**'), p(x.cls, { align: AlignmentType.CENTER, bold: true }), p('**ENROLMENT**'), p('')],
    [p('**TEACHERS**'), p(x.teacher, { align: AlignmentType.CENTER }), p('**SEQUENCE N°**'), p('2', { bold: true })],
  ];
  const w = [1750, 4916, 1800, 2000];
  return [
    new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: w, borders: BOX, rows: rows.map((r) => new TableRow({ children: r.map((c, i) => cell(c, w[i])) })) }),
    new Paragraph({ spacing: { after: 40 }, children: [] }),
    table([5300, 500, 500, 4166], [[cell(dotsP('STUDENT’S NAMES: ', 5000), 5300, { borders: NOB }), cell(p('F', { align: AlignmentType.CENTER }), 500), cell(p('M', { align: AlignmentType.CENTER }), 500), cell(dotsP('Class number: ', 3900), 4166, { borders: NOB })]]),
  ];
}
function titlesCompact(x) {
  return [
    C('**SECOND SEQUENCE EVALUATION – SCHOOL YEAR ' + YEAR + '**', { before: 80, after: 20, size: 23 }),
    C('**INSTRUCTIONS TO CANDIDATES**', { after: 0, size: 20 }),
    ...x.instructions.map((t) => C(t, { after: 0, size: 20, italics: true })),
    new Paragraph({ spacing: { after: 60 }, border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: '000000', space: 2 } }, children: [] }),
  ];
}
function idBlock(x) {
  const s = 20;
  const p = (t, o = {}) => P(t, Object.assign({ after: 0, size: s }, o));
  const out = [];
  out.push(table([3500, 500, 500, 3966, 2000], [[p('**Student’s names:**'), p('F', { align: AlignmentType.CENTER }), p('M', { align: AlignmentType.CENTER }), p('**Class:** ' + x.cls), p('**Class N°:**')]]));
  out.push(table([1500, 2766, 1700, 2200, 2300], [[p('**SEQ N° 2**'), p('**Assessment of module N°:** ' + x.module), p('**Date:**'), p('**Discipline:** ' + (x.subject || 'Geography')), p('**Duration:** ' + x.duration)]]));
  out.push(table([10466], [[p('**Teacher:** ' + x.teacher)]]));
  out.push(table([10466], [[p('**Evaluated competence:** ' + x.competence)]]));
  out.push(table([5233, 5233], [[p('**Student performance:**'), p('**Remarks**', { align: AlignmentType.CENTER })]]));
  out.push(table([2600, 2633, 1046, 1046, 1047, 1047, 1047], [[p('**Mark/20:**'), p('**Grade:**'), ...['CVWA', 'CWA', 'CA', 'CAA', 'CNA'].map((g) => p(g, { align: AlignmentType.CENTER }))]]));
  out.push(table([3000, 3733, 3733], [[cell([p('Seal of the school'), p('DISCIPLINE – WORK – SUCCESS', { italics: true })], 3000),
    cell([p('Signature, name and comments of the teacher:'), p(' '), p(' ')], 3733), cell([p('Signature and name of parent/guardian:'), p(' '), p(' ')], 3733)]]));
  return out;
}

// title line under the block
function titles(x) {
  return [
    C('**SECOND SEQUENCE EVALUATION – SCHOOL YEAR ' + YEAR + '**', { before: 160, after: 40, size: 24 }),
    C('**GEOGRAPHY DEPARTMENT**', { after: 80, size: 26 }),
    C('**INSTRUCTIONS TO CANDIDATES**', { after: 20, size: 22 }),
    ...x.instructions.map((t) => C(t, { after: 20, size: 22, italics: true })),
    new Paragraph({ spacing: { after: 120 }, border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: '000000', space: 4 } }, children: [] }),
  ];
}

const H = (t, o = {}) => (o.pageBreak ? new Paragraph({ pageBreakBefore: true, spacing: { after: 80 }, keepNext: true, children: runs('**' + t + '**') }) : P('**' + t + '**', Object.assign({ before: 160, after: 80, size: 24, keepNext: true }, o)));
const Hc = (t) => C('**' + t + '**', { before: 160, after: 80, size: 24, keepNext: true });

// MCQ block: two columns of questions, each with options A–D
function mcq(qs) {
  const one = (q, n) => [P(`**${n}. ${q[0]}**`, { after: 40, size: 22 }),
    ...q[1].map((o, i) => P(`${'ABCD'[i]}.  ${o}`, { indent: 360, after: 0, size: 22 })), P('', { after: 80 })];
  const half = Math.ceil(qs.length / 2);
  const left = qs.slice(0, half).flatMap((q, i) => one(q, i + 1));
  const right = qs.slice(half).flatMap((q, i) => one(q, i + 1 + half));
  return new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: [5233, 5233], borders: NOB,
    rows: [new TableRow({ children: [cell(left, 5233, { borders: NOB, valign: VerticalAlign.TOP }), cell(right, 5233, { borders: NOB, valign: VerticalAlign.TOP })] })] });
}

// competence situation in a framed box
const situation = (t) => table([10466], [[cell([P('**Situation:**', { after: 40 }), P(t, { after: 40, line: 300 })], 10466, { shade: 'F2F2F2' })]]);

// numbered task followed by dotted answer lines
const task = (n, t, marks, nLines, sub) => [P(`**${n}.** ${t} **(${marks})**`, { before: 120, after: 40, indent: 360, hanging: 360, keepNext: true }),
  ...(sub ? sub.flatMap((s) => [P(s, { indent: 360, after: 0 }), ...DOTS(nLines, 360)]) : DOTS(nLines, 360))];

// GCE-type question: [label, text, marks]
const gq = (label, t, marks) => {
  const m = t.match(/^\((i{1,3}|iv)\)\s+(.*)$/); const sub = m ? '(' + m[1] + ')' : null; const text = m ? m[2] : t;
  const left = sub ? 1500 : 1000;
  return new Paragraph({ indent: { left, hanging: left - 400 }, spacing: { after: 70, line: 300 }, tabStops: [{ type: TabStopType.LEFT, position: 1000 }, { type: TabStopType.LEFT, position: 1500 }],
    children: runs(`${label}\t${sub ? sub + '\t' : ''}${text}${marks ? ' **(' + marks + ')**' : ''}`) });
};

const facilitators = (names) => [C('**FACILITATOR' + (names.length > 1 ? 'S' : '') + ':** ' + names.join('  –  '), { before: 160, after: 0, size: 22 })];

function build(x) {
  const children = x.compact ? [header(true), new Paragraph({ spacing: { after: 40 }, children: [] }), ...idBlockCompact(x), ...titlesCompact(x), ...x.body] : [header(), new Paragraph({ spacing: { after: 80 }, children: [] }), ...idBlock(x), ...titles(x), ...x.body];
  const footers = () => ({ default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [
    new TextRun({ text: `DGCAST Garoua – Geography – ${x.cls} – Second Sequence ${YEAR} – Page `, font: FONT, size: 16 }),
    new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 16 })] })] }) });
  const page = { size: { width: 11906, height: 16838 }, margin: { top: 567, bottom: 567, left: 720, right: 720 } };
  const sections = [{ properties: { page }, footers: footers(), children }];
  // questions that flow in two columns: the whole left column first (top to bottom), then the right column, then the next page
  if (x.colBody) sections.push({ properties: { type: SectionType.CONTINUOUS, page, column: { count: 2, space: 500, separate: true } }, footers: footers(), children: x.colBody });
  if (x.tailBody) sections.push({ properties: { type: SectionType.CONTINUOUS, page }, footers: footers(), children: x.tailBody });
  const doc = new Document({
    creator: 'Geography Department, DGCAST Garoua', title: x.title,
    styles: { default: { document: { run: { font: FONT, size: 24 } } } },
    sections,
  });
  return Packer.toBuffer(doc).then((bf) => { fs.mkdirSync(OUT, { recursive: true }); fs.writeFileSync(OUT + x.file, bf); console.log('written', x.file); });
}

// =====================================================================
// The two papers keep the questions and the chapters written by the class teacher (Mme ASTHA Noura);
// the wording, the layout and the situation are rewritten, and Documents 1 and 2 (Document 2 = distractor) are added.
let FOURKEY = '';
const base = (o) => Object.assign({ duration: '1 hour', teacher: 'Mme ASTHA Noura', instructions: ['Answer ALL questions on this question paper.', 'In Section I, mark an (X) on the letter of the correct answer.'] }, o);
const docCell = (d, w) => cell([P('**' + d.title + '**', { after: 40, size: 22 }), ...[].concat(d.text).map((t) => P(t, { after: 40, size: 22, line: 280 }))], w, { valign: VerticalAlign.TOP });
const documents = (d1, d2) => table([5233, 5233], [[docCell(d1, 5233), docCell(d2, 5233)]]);
const mcqRows = (qs, lines, off = 0) => {
  const LB = lines ? { top: none, left: none, right: none, bottom: { style: BorderStyle.SINGLE, size: 6, color: '808080' } } : NOB;
  const one = (q, n) => [P(`**${n}. ${q[0]}**`, { after: 40, size: 22 }), ...q[1].map((o, i) => P(`${'ABCD'[i]}.  ${o}`, { indent: 360, after: 0, size: 22 })), P('', { after: 80 })];
  const half = Math.ceil(qs.length / 2); const rows = [];
  for (let i = 0; i < half; i++) rows.push(new TableRow({ cantSplit: true, children: [cell(one(qs[i], i + 1 + off), 5233, { borders: LB, valign: VerticalAlign.TOP }), qs[i + half] ? cell(one(qs[i + half], i + 1 + half + off), 5233, { borders: LB, valign: VerticalAlign.TOP }) : cell(P(''), 5233, { borders: NOB })] }));
  return new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: [5233, 5233], borders: NOB, rows });
};
// questions as ordinary paragraphs: they fill a column from top to bottom, then the next column, then the next page
const flowQ = (q, n) => [
  new Paragraph({ keepNext: true, keepLines: true, spacing: { before: 40, after: 30 }, children: runs(`**${n}. ${q[0]}**`, { size: 21 }) }),
  ...q[1].map((o, i) => new Paragraph({ keepNext: i < 3, keepLines: true, indent: { left: 360 }, spacing: { after: 0 }, children: runs(`${'ABCD'[i]}.  ${o}`, { size: 21 }) })),
  new Paragraph({ spacing: { before: 40, after: 40 }, border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: '808080', space: 1 } }, children: [] }),
];
const flowH = (t) => new Paragraph({ keepNext: true, spacing: { before: 60, after: 60 }, border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: '808080', space: 2 } }, children: runs('**' + t + '**', { size: 23 }) });
const completeTable = (widths, head, rows, rh = 1100) => new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: widths, borders: BOX,
  rows: [new TableRow({ children: head.map((h, i) => cell(P('**' + h + '**', { align: AlignmentType.CENTER, after: 0, size: 22 }), widths[i], { shade: 'D9D9D9' })) }),
    ...rows.map((r) => new TableRow({ cantSplit: true, height: { value: rh, rule: 'atLeast' }, children: r.map((c, i) => cell(P(c, { after: 0, size: 22, bold: i === 0 }), widths[i])) }))] });
// a calculation box: question text + space for the working
const calc = (n, text, marks) => [P(`**${n})** ${text} **(${marks})**`, { before: 120, after: 40, indent: 360, hanging: 360, line: 300, keepNext: true }), ...DOTS(3, 360)];

// =====================================================================
// DGCAST: first-cycle format. Part One: 10 MCQs (10 × 0.5), one structural question (4 marks); Part Two: situation, Document 1, Document 2 (distractor)
// =====================================================================
// MCQs in two columns: the left column holds the first half (1 to 5), the right column the second half (6 to 10); a line under each question
const mcqCols = (qs) => {
  const LINE = { bottom: { style: BorderStyle.SINGLE, size: 6, color: '808080' } };
  const one = (q, n) => [P(`**${n}. ${q[0]}**`, { after: 40, size: 22 }),
    ...q[1].map((o, i) => P(`${'ABCD'[i]}.  ${o}`, { indent: 360, after: 0, size: 22 })),
    new Paragraph({ spacing: { before: 40, after: 70 }, border: LINE, children: [] })];
  const half = Math.ceil(qs.length / 2);
  return new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: [5233, 5233], borders: NOB,
    rows: [new TableRow({ children: [cell(qs.slice(0, half).flatMap((q, i) => one(q, i + 1)), 5233, { borders: NOB, valign: VerticalAlign.TOP }),
      cell(qs.slice(half).flatMap((q, i) => one(q, i + 1 + half)), 5233, { borders: NOB, valign: VerticalAlign.TOP })] })] });
};
const dataTable = (head, rows, widths) => new Table({ alignment: AlignmentType.CENTER, width: { size: widths.reduce((a, b) => a + b, 0), type: WidthType.DXA }, columnWidths: widths, borders: BOX,
  rows: [new TableRow({ children: head.map((h, i) => cell(P('**' + h + '**', { align: AlignmentType.CENTER, after: 0, size: 19 }), widths[i], { shade: 'D9D9D9' })) }),
    ...rows.map((r) => new TableRow({ children: r.map((c, i) => cell(P(c, { align: i === 0 ? AlignmentType.LEFT : AlignmentType.CENTER, after: 0, size: 19, bold: i === 0 }), widths[i])) }))] });

const DGC_Q = [
      ['The study and description of the Earth and of the people who live on it is called:', ['Geography', 'History', 'Biology', 'Astronomy'], 0],
      ['From the Sun, the Earth is the:', ['First planet', 'Second planet', 'Third planet', 'Fourth planet'], 2],
      ['Which of the following is a proof that the Earth is round?', ['Ships disappear gradually below the horizon', 'The Sun rises in the east', 'The sea is salty', 'The Moon changes its shape'], 0],
      ['The line of latitude 0° is called the:', ['Greenwich Meridian', 'Equator', 'Tropic of Cancer', 'Arctic Circle'], 1],
      ['The spinning of the Earth on its axis in about 24 hours is called:', ['Revolution', 'Rotation', 'Orbit', 'Season'], 1],
      ['The movement of the Earth around the Sun, which causes the seasons, is called:', ['Rotation', 'Revolution', 'Tide', 'Eclipse'], 1],
      ['Rivers, lakes, seas and oceans form the:', ['Lithosphere', 'Atmosphere', 'Hydrosphere', 'Biosphere'], 2],
      ['A community of living things and their non-living surroundings that depend on one another is called an:', ['Resource', 'Ecosystem', 'Environment only', 'Continent'], 1],
      ['A graph that shows the monthly temperature and rainfall of a place is called a:', ['Pie chart', 'Pyramid', 'Climograph', 'Histogram of births'], 2],
      ['The natural vegetation of the equatorial region of Cameroon is:', ['The steppe', 'The rainforest', 'The desert', 'The Sahel savanna'], 1],
];
// spread the correct letters (no regular order)
[2, 0, 3, 1, 2, 0, 1, 3, 0, 2].forEach((t, k) => { const q = DGC_Q[k]; const c = q[2]; [q[1][c], q[1][t]] = [q[1][t], q[1][c]]; q[2] = t; });
if (process.env.KEY) console.log('DGC F1 ' + DGC_Q.map((q, i) => `${i + 1}${'ABCD'[q[2]]}`).join(' '));
const DGC_F1 = base({
  file: 'DGCAST_F1_Geography_Seq2_2026-2027.docx', title: 'DGCAST Form One Geography – Second Sequence', cls: 'FORM ONE', module: '1 and 2',
  teacher: 'Mr KAMDEM Emmanuel',
  competence: 'Learners are able to locate places on the Earth, to explain the movements of the Earth and to preserve their natural environment.',
  body: [
    Hc('PART ONE: VERIFICATION OF RESOURCES (9 marks)'),
    H('Section I: Multiple Choice Questions (10 × 0.5 = 5 marks)'),
  ],
  colBody: DGC_Q.map((q, k) => flowQ(q, k + 1)).flat(),
  tailBody: [
    H('Section II: Structural Question (4 × 1 = 4 marks)'),
    P('The table below shows the average monthly rainfall and temperature of Garoua.', { line: 300, after: 60, keepNext: true }),
    dataTable(['Month', 'J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'], [
      ['Rainfall (mm)', '0', '3', '16', '62', '133', '158', '207', '262', '222', '96', '5', '0'],
      ['Temperature (°C)', '26', '29', '32', '32', '29', '27', '26', '25', '26', '27', '27', '24'],
    ], [2000, 700, 700, 700, 700, 700, 700, 700, 700, 700, 700, 700, 700]),
    P('Study the table, then answer the questions that follow. Months with more than 100 mm of rain are rainy months.', { line: 300, before: 80, after: 20 }),
    ...calc('a', 'Which month has the highest rainfall? Give the amount.', '1 mark'),
    ...calc('b', 'Which month has the lowest temperature? Give its value.', '1 mark'),
    ...calc('c', 'How many months make up the rainy season?', '1 mark'),
    ...calc('d', 'In which natural region of Cameroon is Garoua found?', '1 mark'),
    new Paragraph({ pageBreakBefore: true, spacing: { after: 80 }, keepNext: true, alignment: AlignmentType.CENTER, children: runs('**PART TWO: VERIFICATION OF COMPETENCES (9 marks)**') }),
    situation('Paul, a Form One pupil, travels by bus from Yaoundé to Garoua during the holidays. At the start of the journey, he sees a thick green forest. Then he sees tall grass with a few scattered trees and, near Garoua, only short grass and thorny trees. In Garoua, his cousin tells him that many trees are cut every day for firewood and charcoal. Paul wonders why the landscape changes so much from the south to the north, and how the vegetation can be protected.'),
    P('', { after: 60 }),
    documents(
      { title: 'Document 1: The two natural regions of Cameroon', text: ['**Equatorial region (Yaoundé):** between 2° N and 6° N. It is hot all year, with heavy rainfall of about 2,500 mm in almost every month. The vegetation is a thick evergreen rainforest, and the soils are ferrallitic.', '**Tropical region (Garoua):** between 6° N and 13° N. It has a long dry season and less rainfall, about 1,000 mm. The vegetation is savanna of grass with scattered thorny trees, and the soils are ferruginous.'] },
      { title: 'Document 2', text: 'The Indomitable Lions, the national football team of Cameroon, have won the Africa Cup of Nations five times: in 1984, 1988, 2000, 2002 and 2017.' }),
    P('**Perform the following tasks:**', { before: 120, after: 0 }),
    ...task(1, 'What is the problem raised in the situation above?', '3 marks', 3),
    ...task(2, 'Give three differences between the natural region of Yaoundé and that of Garoua.', '3 marks', 3),
    ...task(3, 'Suggest three actions that pupils can carry out in their school and neighbourhood to protect the vegetation.', '3 marks', 3),
    P('**Presentation: 2 marks**', { before: 160, align: AlignmentType.RIGHT }),
  ],
});

// =====================================================================
// DGCAST Form 2: lessons 1 to 4 of the national syllabus (L1 population growth, PW1 demographic indices, L2 uneven distribution, PW2 densities,
// L3 man in the equatorial zone, FS1 deforestation, L4 man in the tropical zone)
// =====================================================================
const DGC_Q2 = [
  ['The difference between the number of births and the number of deaths in a population is called:', ['Migration', 'Natural population growth', 'Density', 'Distribution'], 1],
  ['Which of the following explains the rapid growth of the world population?', ['A rising death rate', 'The fall of the death rate thanks to vaccines and hospitals', 'The fall of food production', 'The absence of children'], 1],
  ['The birth rate is the number of births per:', ['100 people in one year', '1,000 people in one year', '1,000 people in one month', '10,000 people in one year'], 1],
  ['The population density of an area is calculated by dividing:', ['The area by the population', 'The population by the area', 'The births by the deaths', 'The deaths by the births'], 1],
  ['Which of the following areas is sparsely populated?', ['East Asia', 'Western Europe', 'The hot deserts', 'The north-east of the USA'], 2],
  ['A region has 600,000 inhabitants on 3,000 km². Its population density is:', ['20 persons per km²', '200 persons per km²', '2,000 persons per km²', '18,000 persons per km²'], 1],
  ['The equatorial zone lies between about:', ['5° N and 5° S of the Equator', '15° N and 30° N', '30° N and 60° N', '60° N and the North Pole'], 0],
  ['Farming a plot for a few years and then moving to a new plot when the soil becomes poor is called:', ['Irrigation', 'Shifting cultivation', 'Ranching', 'Market gardening'], 1],
  ['The destruction of forests by people is called:', ['Reforestation', 'Afforestation', 'Deforestation', 'Conservation'], 2],
  ['Moving with animals from place to place in search of grass and water is called:', ['Pastoral nomadism', 'Crop rotation', 'Bush fallowing', 'Fishing'], 0],
];
// spread the correct letters (questions with numbers as options keep their order)
[3, 1, 0, 2, 3, 1, 0, 2, 1, 3].forEach((t, k) => { const q = DGC_Q2[k]; if (q[1].some((o) => /^\d/.test(o))) return; const c = q[2]; [q[1][c], q[1][t]] = [q[1][t], q[1][c]]; q[2] = t; });
if (process.env.KEY) console.log('DGC F2 ' + DGC_Q2.map((q, i) => `${i + 1}${'ABCD'[q[2]]}`).join(' '));
const DGC_F2 = base({
  file: 'DGCAST_F2_Geography_Seq2_2026-2027.docx', title: 'DGCAST Form Two Geography – Second Sequence', cls: 'FORM TWO', module: '1',
  teacher: 'Mr KAMDEM Emmanuel',
  competence: 'Learners are able to manage the consequences of population growth and to exploit the resources of the equatorial and tropical zones.',
  body: [
    Hc('PART ONE: VERIFICATION OF RESOURCES (9 marks)'),
    H('Section I: Multiple Choice Questions (10 × 0.5 = 5 marks)'),
  ],
  colBody: DGC_Q2.map((q, k) => flowQ(q, k + 1)).flat(),
  tailBody: [
    H('Section II: Structural Question (4 × 1 = 4 marks)'),
    P('In 2025, a town had **50,000** inhabitants and covered an area of **250 km²**. During the year, **1,750** children were born and **450** people died. Write the formula, then calculate:', { line: 300, after: 60 }),
    ...calc('a', 'The birth rate (in ‰).', '1 mark'),
    ...calc('b', 'The death rate (in ‰).', '1 mark'),
    ...calc('c', 'The natural growth rate (in %).', '1 mark'),
    ...calc('d', 'The population density of the town (persons per km²).', '1 mark'),
    new Paragraph({ pageBreakBefore: true, spacing: { after: 80 }, keepNext: true, alignment: AlignmentType.CENTER, children: runs('**PART TWO: VERIFICATION OF COMPETENCES (9 marks)**') }),
    situation('In a village of the equatorial forest, the population has doubled in twenty years. To feed their families, the villagers clear more forest every year for new farms. Timber companies cut the valuable trees along the new roads, and the women now walk farther and farther to find firewood. The village chief notices that the forest is disappearing, the soils are becoming poor and the animals have left. He asks you, a Form Two pupil, to help the villagers.'),
    P('', { after: 60 }),
    documents(
      { title: 'Document 1: Extract from the report of a forest officer', text: ['“In twenty years, the forest around the village has lost nearly half of its trees. The main causes are the following: the clearing of the forest by farmers for shifting cultivation, the felling of valuable trees by logging companies, the cutting of trees for firewood and charcoal, and the opening of new roads and settlements. As a result, the soils are washed away by the rain and many animals have disappeared.”'] },
      { title: 'Document 2', text: 'The Eiffel Tower, in Paris, is about 330 metres high. It was built in 1889 for a world exhibition and receives millions of visitors every year.' }),
    P('**Perform the following tasks:**', { before: 120, after: 0 }),
    ...task(1, 'What is the problem raised in the situation above?', '3 marks', 3),
    ...task(2, 'State three causes of the disappearance of the forest around the village.', '3 marks', 3),
    ...task(3, 'Suggest three actions that the villagers can carry out to protect the forest.', '3 marks', 3),
    P('**Presentation: 2 marks**', { before: 160, align: AlignmentType.RIGHT }),
  ],
});

// =====================================================================
// DGCAST Form 2 Technical (Economic Geography): Natural regions: the equatorial region and the tropical grassland region
// (harmonised progression sheet: location, climate, soils and vegetation, resources and exploitation, human activities, problems and solutions)
// =====================================================================
const DGC_QT = [
  ['The equatorial region lies on both sides of the Equator, between about:', ['5° N and 5° S', '15° N and 30° N', '30° N and 60° N', '60° N and 90° N'], 0],
  ['Which of the following describes the equatorial climate?', ['Hot all year with heavy rain in almost every month', 'Cool all year with little rain', 'A long dry season and a short rainy season', 'Very cold winters and hot summers'], 0],
  ['The red or yellow soils of the equatorial region, washed by heavy rain, are called:', ['Black cotton soils', 'Ferrallitic soils', 'Sandy soils', 'Alluvial soils'], 1],
  ['Which of the following trees is a hardwood of the equatorial forest?', ['Baobab', 'Acacia', 'Sapele', 'Shea tree'], 2],
  ['Farming a piece of forest for a few years and moving to another one when the soil becomes poor is called:', ['Irrigated farming', 'Ranching', 'Shifting cultivation', 'Transhumance'], 2],
  ['The tropical grassland (savanna) lies between about:', ['5° and 15° N and S of the Equator', '0° and 5° N and S of the Equator', '30° and 40° N and S of the Equator', '60° and 90° N and S of the Equator'], 0],
  ['The climate of the tropical grassland has:', ['One season with rain all year', 'A wet season and a dry season', 'Snow in winter', 'No rain at all'], 1],
  ['Which tree of the savanna stores water in its trunk?', ['Baobab', 'Mahogany', 'Ebony', 'Iroko'], 0],
  ['A red soil that becomes very hard when it dries, used for roads and bricks, is called:', ['Humus', 'Laterite', 'Loam', 'Peat'], 1],
  ['The seasonal movement of herders and their animals in search of grass and water is called:', ['Lumbering', 'Mining', 'Transhumance', 'Fishing'], 2],
];
[0, 1, 3, 2, 3, 0, 2, 1, 0, 3].forEach((t, k) => { const q = DGC_QT[k]; if (q[1].some((o) => /^\d/.test(o))) return; const c = q[2]; [q[1][c], q[1][t]] = [q[1][t], q[1][c]]; q[2] = t; });
if (process.env.KEY) console.log('DGC F2T ' + DGC_QT.map((q, i) => `${i + 1}${'ABCD'[q[2]]}`).join(' '));
const completeTable2 = (widths, head, rows) => new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: widths, borders: BOX,
  rows: [new TableRow({ children: head.map((h, i) => cell(P('**' + h + '**', { align: AlignmentType.CENTER, after: 0, size: 21 }), widths[i], { shade: 'D9D9D9' })) }),
    ...rows.map((r) => new TableRow({ cantSplit: true, height: { value: 900, rule: 'atLeast' }, children: r.map((c, i) => cell(P(c, { after: 0, size: 21, bold: i === 0 }), widths[i])) }))] });
const DGC_F2T = base({
  file: 'DGCAST_F2T_Geography_Seq2_2026-2027.docx', title: 'DGCAST Form Two Technical Economic Geography – Second Sequence', cls: 'FORM TWO TECHNICAL', module: '1',
  teacher: 'Mr KAMDEM Emmanuel', subject: 'Economic Geography',
  competence: 'Learners are able to exploit the resources of the equatorial and tropical grassland regions and to solve the problems of these regions.',
  body: [
    Hc('PART ONE: VERIFICATION OF RESOURCES (9 marks)'),
    H('Section I: Multiple Choice Questions (10 × 0.5 = 5 marks)'),
  ],
  colBody: DGC_QT.map((q, k) => flowQ(q, k + 1)).flat(),
  tailBody: [
    H('Section II: Structural Question (4 × 1 = 4 marks)'),
    P('Complete the table below on the natural regions studied. Write the **natural vegetation** and **one resource with its use** for each region.', { line: 300, after: 60, keepNext: true }),
    completeTable2([2600, 3933, 3933], ['Region', 'Natural vegetation (1 mark each)', 'One resource and its use (1 mark each)'], [['Equatorial region', '', ''], ['Tropical grassland region', '', '']]),
    new Paragraph({ pageBreakBefore: true, spacing: { after: 80 }, keepNext: true, alignment: AlignmentType.CENTER, children: runs('**PART TWO: VERIFICATION OF COMPETENCES (9 marks)**') }),
    situation('Samuel, a Form Two Technical student, spends the holidays in his uncle’s village, in the equatorial forest of the South Region. In the rainy season, the earth road is so muddy that vehicles cannot reach the village, and the sick cannot be taken to the health centre. Many villagers have malaria. The farmers say that their farms give very little after two years, and loggers cut the big trees every day. Samuel wonders why life is so difficult in the forest and how it can be improved.'),
    P('', { after: 60 }),
    documents(
      { title: 'Document 1: Extract from the report of the Divisional Officer', text: ['“In this equatorial zone, the earth roads become muddy in the rainy season and cut off many villages. Malaria and sleeping sickness are common among the inhabitants. The thick forest is difficult to clear and to cross. The heavy rain washes the plant food out of the soil, so the farms become poor after two or three years.”'] },
      { title: 'Document 2', text: 'Mount Everest, in the Himalayas, is the highest mountain in the world. It is about 8,849 metres high.' }),
    P('**Perform the following tasks:**', { before: 120, after: 0 }),
    ...task(1, 'What is the problem raised in the situation above?', '3 marks', 3),
    ...task(2, 'State three problems faced by the people of the equatorial region.', '3 marks', 3),
    ...task(3, 'Suggest three solutions to improve the life of the villagers.', '3 marks', 3),
    P('**Presentation: 2 marks**', { before: 160, align: AlignmentType.RIGHT }),
  ],
});

// =====================================================================
// DGCAST Form 3 (general): lessons 1 to 6 of the national syllabus, with Further Study 1 and Practical Works 1 and 2
// (L1 Our planet, FS1 Universe and Moon, L2 Latitudes and longitudes, L3 Great circles and IDL, PW1 Locate a place, L4 Time, PW2 Calculation of time, L5 Rotation, L6 Revolution)
// =====================================================================
const DGC_Q3 = [
  ['The shape of the Earth is best described as:', ['A perfect sphere', 'An oblate spheroid', 'A flat disc', 'A cube'], 1],
  ['Which of the following observations is a proof that the Earth is spherical?', ['The shadow of the Earth on the Moon during an eclipse is always curved', 'The Sun rises in the east', 'The sea is salty', 'The Moon has phases'], 0],
  ['The phase of the Moon in which the whole lit face is seen from the Earth is the:', ['New Moon', 'First quarter', 'Full Moon', 'Last quarter'], 2],
  ['Spring tides, which are very high, occur at:', ['The first and last quarters of the Moon', 'New Moon and full Moon', 'Noon only', 'Midnight only'], 1],
  ['The line of latitude 23½° N is called the:', ['Tropic of Capricorn', 'Arctic Circle', 'Tropic of Cancer', 'Equator'], 2],
  ['The only line of latitude that is a great circle is the:', ['Tropic of Cancer', 'Equator', 'Arctic Circle', 'Tropic of Capricorn'], 1],
  ['The Earth turns 360° in 24 hours. One degree of longitude therefore corresponds to a time difference of:', ['1 minute', '4 minutes', '15 minutes', '1 hour'], 1],
  ['The standard time of Cameroon is:', ['GMT − 1', 'GMT', 'GMT + 1', 'GMT + 5'], 2],
  ['In the northern hemisphere, the rotation of the Earth deflects winds and ocean currents to the:', ['Left', 'Right', 'North', 'South'], 1],
  ['On 21 June, the Sun is overhead at the:', ['Equator', 'Tropic of Capricorn', 'Tropic of Cancer', 'Arctic Circle'], 2],
];
[3, 0, 1, 2, 3, 0, 1, 2, 1, 0].forEach((t, k) => { const q = DGC_Q3[k]; if (q[1].some((o) => /^\d/.test(o))) return; const c = q[2]; [q[1][c], q[1][t]] = [q[1][t], q[1][c]]; q[2] = t; });
if (process.env.KEY) console.log('DGC F3 ' + DGC_Q3.map((q, i) => `${i + 1}${'ABCD'[q[2]]}`).join(' '));
const DGC_F3 = base({
  file: 'DGCAST_F3_Geography_Seq2_2026-2027.docx', title: 'DGCAST Form Three Geography – Second Sequence', cls: 'FORM THREE', module: '1',
  teacher: 'Mr KAMDEM Emmanuel',
  competence: 'Learners are able to describe the planet Earth, to locate places and to explain the effects of the movements of the Earth.',
  body: [
    Hc('PART ONE: VERIFICATION OF RESOURCES (9 marks)'),
    H('Section I: Multiple Choice Questions (10 × 0.5 = 5 marks)'),
  ],
  colBody: DGC_Q3.map((q, k) => flowQ(q, k + 1)).flat(),
  tailBody: [
    H('Section II: Structural Question (4 × 1 = 4 marks)'),
    P('Garoua is on longitude **13° E**. At 12:00 noon in Garoua, calculate (show your working):', { line: 300, after: 60, keepNext: true }),
    ...calc('a', 'The difference of longitude between Garoua and Nairobi, which is on longitude 37° E.', '1 mark'),
    ...calc('b', 'The difference of time between the two towns, in hours and minutes.', '1 mark'),
    ...calc('c', 'The local time in Nairobi.', '1 mark'),
    ...calc('d', 'The local time in a town on longitude 17° W.', '1 mark'),
    new Paragraph({ pageBreakBefore: true, spacing: { after: 80 }, keepNext: true, alignment: AlignmentType.CENTER, children: runs('**PART TWO: VERIFICATION OF COMPETENCES (9 marks)**') }),
    situation('Mariam, a Form Three student in Garoua, receives a message from her cousin who studies in Oslo, in Norway. He writes: “In June, it is still bright at midnight, and in December the day lasts only five hours.” Mariam is surprised, because in Garoua the days and the nights have almost the same length all year. She asks you, her classmate, to help her to understand the situation.'),
    P('', { after: 60 }),
    documents(
      { title: 'Document 1: The revolution of the Earth', text: ['The Earth moves around the Sun in 365¼ days. During this revolution, its axis stays tilted at 23½° and always points in the same direction. As a result, each hemisphere leans towards the Sun for part of the year. Away from the Equator, days are long in summer and short in winter, and beyond the polar circles the Sun can stay up for 24 hours (midnight Sun) or stay down (polar night). Near the Equator, the days last about 12 hours all year.'] },
      { title: 'Document 2', text: 'The Nile is the longest river in Africa. It is about 6,650 kilometres long and flows into the Mediterranean Sea.' }),
    P('**Perform the following tasks:**', { before: 120, after: 0 }),
    ...task(1, 'What is the problem raised in the situation above?', '3 marks', 3),
    ...task(2, 'Explain why the length of the day and of the night changes during the year in Norway but hardly changes in Garoua.', '3 marks', 3),
    ...task(3, 'Suggest three activities that Mariam can organise at school to help her classmates to understand the movements of the Earth.', '3 marks', 3),
    P('**Presentation: 2 marks**', { before: 160, align: AlignmentType.RIGHT }),
  ],
});

(async () => { for (const x of [DGC_F1, DGC_F2, DGC_F2T, DGC_F3]) await build(x); })();
