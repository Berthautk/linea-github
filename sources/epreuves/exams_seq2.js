// Second sequence evaluations 2026-2027, Geography, GBHS Garoua (Form 1 and Form 2): one Word file per class. Teacher's name in the identification table.
const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, ImageRun, AlignmentType, WidthType,
  BorderStyle, TabStopType, LeaderType, VerticalAlign, ShadingType, Footer, PageNumber,
} = require('docx');

const OUT = process.argv[2] || '.';
const LOGO = fs.readFileSync(__dirname + '/logo_gbhs.jpeg');
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
    'DELEGATION REGIONALE DU NORD', '********', 'DELEGATION DEPARTEMENTALE DE LA BENOUE', '********', 'LYCEE BILINGUE DE GAROUA',
    'BP : 301 GAROUA – TEL : 222 27 30 51', 'E-mail : lybilgaroua@yahoo.fr', 'N° Immatriculation : 1CK1GSFD110910109'];
  const en = ['REPUBLIC OF CAMEROON', 'Peace – Work – Fatherland', '********', 'MINISTRY OF SECONDARY EDUCATION', '********',
    'NORTH REGIONAL DELEGATION', '********', 'BENOUE DIVISIONAL DELEGATION', '********', 'GOVERNMENT BILINGUAL HIGH SCHOOL GAROUA',
    'P.O. BOX: 301 GAROUA – TEL: 222 27 30 51', 'E-mail: lybilgaroua@yahoo.fr', 'Registration N°: 1CK1GSFD110910109'];
  const col = (arr) => arr.map((t, i) => C(t, { size: 15, after: 0, bold: i === 0 || i === 9, italics: i === 1 }));
  return new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: [4133, 2200, 4133], borders: NOB,
    rows: [new TableRow({ children: [
      cell(col(fr), 4133, { borders: NOB }),
      cell(new Paragraph({ alignment: AlignmentType.CENTER, children: [new ImageRun({ type: 'jpg', data: LOGO, transformation: { width: 118, height: 136 } })] }), 2200, { borders: NOB }),
      cell(col(en), 4133, { borders: NOB })] })] });
}

// student / paper identification block (the school model)
function idBlock(x) {
  const s = 20;
  const p = (t, o = {}) => P(t, Object.assign({ after: 0, size: s }, o));
  const out = [];
  out.push(table([5466, 500, 500, 4000], [[p('**Student’s names:**'), p('F', { align: AlignmentType.CENTER }), p('M', { align: AlignmentType.CENTER }), p('**Class:** ' + x.cls)]]));
  out.push(table([1500, 2766, 1700, 2200, 2300], [[p('**SEQ N° 2**'), p('**Assessment of module N°:** ' + x.module), p('**Date:**'), p('**Discipline:** Geography'), p('**Duration:** ' + x.duration)]]));
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
  const children = [header(), new Paragraph({ spacing: { after: 80 }, children: [] }), ...idBlock(x), ...titles(x), ...x.body];
  const doc = new Document({
    creator: 'Geography Department, GBHS Garoua', title: x.title,
    styles: { default: { document: { run: { font: FONT, size: 24 } } } },
    sections: [{
      properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 567, bottom: 567, left: 720, right: 720 } } },
      footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [
        new TextRun({ text: `GBHS Garoua – Geography – ${x.cls} – Second Sequence ${YEAR} – Page `, font: FONT, size: 16 }),
        new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 16 })] })] }) },
      children,
    }],
  });
  return Packer.toBuffer(doc).then((b) => { fs.mkdirSync(OUT, { recursive: true }); fs.writeFileSync(OUT + x.file, b); console.log('written', x.file); });
}

// =====================================================================
const base = (o) => Object.assign({ duration: '1 hour', teacher: 'Mme ASTHA Noura', instructions: ['Answer ALL questions on this question paper.', 'In Section I, mark an (X) on the letter of the correct answer.'] }, o);

// a table to complete: [header cells], rows of [given text, '' ...]
const completeTable = (widths, head, rows) => new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: widths, borders: BOX,
  rows: [new TableRow({ children: head.map((h, i) => cell(P('**' + h + '**', { align: AlignmentType.CENTER, after: 0, size: 22 }), widths[i], { shade: 'D9D9D9' })) }),
    ...rows.map((r) => new TableRow({ height: { value: 900, rule: 'atLeast' }, children: r.map((c, i) => cell(P(c, { after: 0, size: 22, bold: i === 0 }), widths[i])) }))] });

// =====================================================================
// FORM ONE: module 2, lessons 4 and 5 (the environment; the natural regions of Cameroon)
// =====================================================================
const F1 = base({
  file: 'F1_Geography_Seq2_2026-2027.docx', title: 'Form One Geography – Second Sequence', cls: 'FORM ONE BIL A / B', module: '2',
  competence: 'Learners are able to preserve their natural environment.',
  body: [
    Hc('PART ONE: VERIFICATION OF RESOURCES (9 marks)'),
    H('Section I: Multiple Choice Questions (1 × 5 = 5 marks)'),
    mcq([
      ['Which of the following is NOT part of the natural environment?', ['Water', 'Plants and animals', 'Buildings', 'Air']],
      ['Rivers, lakes, seas and oceans form the:', ['Lithosphere', 'Hydrosphere', 'Atmosphere', 'Biosphere']],
      ['A community of living things and their non-living surroundings that depend on one another is called:', ['A resource', 'A climate', 'An ecosystem', 'A region']],
      ['The natural vegetation of the equatorial region of Cameroon is:', ['The savanna', 'The steppe', 'The desert', 'The rainforest']],
      ['The soil of the tropical region of northern Cameroon is the:', ['Ferruginous soil', 'Ferrallitic soil', 'Volcanic soil', 'Black soil']],
    ]),
    H('Section II: Structural Question (4 × 1 = 4 marks)'),
    P('Complete the table below on the natural regions of Cameroon. Write the **vegetation** and the **soil** of each region.', { line: 300, after: 80 }),
    completeTable([2800, 2800, 2433, 2433], ['Natural region', 'Location', 'Vegetation', 'Soil'], [
      ['Equatorial region', 'Between 2° N and 6° N', '', ''],
      ['Tropical region', 'Between 6° N and 13° N', '', ''],
    ]),
    Hc('PART TWO: VERIFICATION OF COMPETENCES (9 marks)'),
    situation('During the holidays, Nadège, a Form One pupil, travels by bus from Yaoundé to Garoua to visit her cousin. At the start of the journey she sees a thick green forest, then tall grass with a few scattered trees, and near Garoua only short grass and thorny trees. In Garoua, her cousin tells her that many trees are cut every day for firewood and for charcoal. Nadège wonders why the landscape changes so much from the south to the north, and how the vegetation can be protected. She asks you, a Form One geography pupil, to help her.'),
    P('**Perform the following tasks:**', { before: 120, after: 0 }),
    ...task(1, 'Present the problem raised in the situation above.', '3 marks', 3),
    ...task(2, 'Give three differences between the natural region of Yaoundé and that of Garoua.', '3 marks', 1, ['i)', 'ii)', 'iii)']),
    ...task(3, 'Suggest three actions that pupils can carry out in their school and neighbourhood to protect the vegetation.', '3 marks', 1, ['i)', 'ii)', 'iii)']),
    P('**Presentation: 2 marks**', { before: 160, align: AlignmentType.RIGHT }),
  ],
});

// =====================================================================
// FORM TWO: module 1, lessons 3 to 5 and Further Studies (man in the equatorial, tropical and hot desert zones)
// =====================================================================
const F2 = base({
  file: 'F2_Geography_Seq2_2026-2027.docx', title: 'Form Two Geography – Second Sequence', cls: 'FORM TWO BIL A / B', module: '1',
  competence: 'Learners are able to manage the natural resources of the equatorial, tropical and hot desert zones.',
  body: [
    Hc('PART ONE: VERIFICATION OF RESOURCES (9 marks)'),
    H('Section I: Multiple Choice Questions (1 × 5 = 5 marks)'),
    mcq([
      ['The hot desert milieu lies on both sides of the equator, between latitudes:', ['0° and 5°', '5° and 10°', '10° and 15°', '15° and 30°']],
      ['The parts of the Earth where people do not live permanently are called the:', ['Forest', 'Non-ecumene', 'Savanna', 'Ecumene']],
      ['The movement of herdsmen and their cattle from place to place in search of pasture and water is called:', ['Grazing', 'Pastoral nomadism', 'Ranching', 'Sedentary farming']],
      ['Which of the following animals of Cameroon is obtained from the wild?', ['The cow', 'The hen', 'The sheep', 'The pangolin']],
      ['The soil of the tropical zone of Cameroon is mainly:', ['Volcanic soil', 'Ferrallitic soil', 'Ferruginous soil', 'Sandy soil']],
    ]),
    H('Section II: Structural Question (4 × 1 = 4 marks)'),
    P('Using your knowledge of the lessons, complete the table below. Give **one cause** and **one consequence** of each problem.', { line: 300, after: 80 }),
    completeTable([3400, 3533, 3533], ['Problem', 'Cause', 'Consequence'], [['Firewood crisis', '', ''], ['Deforestation', '', '']]),
    Hc('PART TWO: VERIFICATION OF COMPETENCES (9 marks)'),
    situation('In your locality, there was a green area with many trees where children played and birds nested. The municipal council wanted to build a park, a restaurant and a hall for ceremonies and meetings, so it cut down the trees of the area. A few years later, part of the area is bare and dusty and the rest is covered with buildings and playgrounds. The air is hotter, the birds have gone, and during the rains the water runs over the bare ground and carries the soil away. The inhabitants ask you, a Form Two geography pupil, to explain what happened and to propose solutions.'),
    P('**Perform the following tasks:**', { before: 120, after: 0 }),
    ...task(1, 'Present the problem raised in the situation above.', '3 marks', 3),
    ...task(2, 'Give three factors that cause the cutting down of trees in Cameroon.', '3 marks', 1, ['i)', 'ii)', 'iii)']),
    ...task(3, 'Suggest three actions to bring back the trees in the locality.', '3 marks', 1, ['i)', 'ii)', 'iii)']),
    P('**Presentation: 2 marks**', { before: 160, align: AlignmentType.RIGHT }),
  ],
});

(async () => { for (const x of [F1, F2]) await build(x); })();
