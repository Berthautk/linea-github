// First sequence evaluations 2026-2027, Geography, GBHS Garoua: one Word file per class
const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, ImageRun, AlignmentType, WidthType,
  BorderStyle, TabStopType, LeaderType, VerticalAlign, ShadingType, Footer, PageNumber,
} = require('docx');

const DIR = '/tmp/claude-0/-home-user-linea-github/389cf9fb-8078-5c81-95f2-72f084366795/scratchpad/ep26/';
const OUT = process.argv[2] || DIR + 'out/';
const LOGO = fs.readFileSync(DIR + 'logo.jpeg');
const CIRCLE = fs.readFileSync(DIR + 'circle.png');
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
function idBlock(x, full) {
  const s = 20;
  const p = (t, o = {}) => P(t, Object.assign({ after: 0, size: s }, o));
  const out = [];
  if (full) out.push(table([5466, 500, 500, 4000], [[p('**Student’s names:**'), p('F', { align: AlignmentType.CENTER }), p('M', { align: AlignmentType.CENTER }), p('**Class:** ' + x.cls)]]));
  else out.push(table([10466], [[p('**Class:** ' + x.cls)]]));
  out.push(table([1500, 2766, 1700, 2200, 2300], [[p('**SEQ N° 1**'), p('**Assessment of module N°:** ' + x.module), p('**Date:**'), p('**Discipline:** Geography'), p('**Duration:** ' + x.duration)]]));
  out.push(table([10466], [[p('**Evaluated competence:** ' + x.competence)]]));
  if (full) {
    out.push(table([5233, 5233], [[p('**Student performance:**'), p('**Remarks**', { align: AlignmentType.CENTER })]]));
    out.push(table([2600, 2633, 1046, 1046, 1047, 1047, 1047], [[p('**Mark/20:**'), p('**Grade:**'), ...['CVWA', 'CWA', 'CA', 'CAA', 'CNA'].map((g) => p(g, { align: AlignmentType.CENTER }))]]));
    out.push(table([3000, 3733, 3733], [[cell([p('Seal of the school'), p('DISCIPLINE – WORK – SUCCESS', { italics: true })], 3000),
      cell([p('Signature, name and comments of the teacher:'), p(' '), p(' ')], 3733), cell([p('Signature and name of parent/guardian:'), p(' '), p(' ')], 3733)]]));
  }
  return out;
}

// title line under the block
function titles(x) {
  return [
    C('**FIRST SEQUENCE EVALUATION – SCHOOL YEAR ' + YEAR + '**', { before: 160, after: 40, size: 24 }),
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
  const children = [header(), new Paragraph({ spacing: { after: 80 }, children: [] }), ...idBlock(x, x.full), ...titles(x), ...x.body, ...facilitators(x.facilitators)];
  const doc = new Document({
    creator: 'Geography Department, GBHS Garoua', title: x.title,
    styles: { default: { document: { run: { font: FONT, size: 24 } } } },
    sections: [{
      properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 567, bottom: 567, left: 720, right: 720 } } },
      footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [
        new TextRun({ text: `GBHS Garoua – Geography – ${x.cls} – First Sequence ${YEAR} – Page `, font: FONT, size: 16 }),
        new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 16 })] })] }) },
      children,
    }],
  });
  return Packer.toBuffer(doc).then((b) => { fs.mkdirSync(OUT, { recursive: true }); fs.writeFileSync(OUT + x.file, b); console.log('written', x.file); });
}

// =====================================================================
// FORM ONE
// =====================================================================
const firstCycle = (opts) => Object.assign({ full: true, duration: '1 hour', instructions: ['Answer ALL questions on this question paper.', 'In Section I, mark an (X) on the letter of the correct answer.'] }, opts);

const F1 = firstCycle({
  file: 'F1_Geography_Seq1_2026-2027.docx', title: 'Form One Geography – First Sequence', cls: 'FORM ONE BIL A / B', module: '1',
  competence: 'Learners are able to adapt to cosmic changes.',
  facilitators: ['Mme ASTHA Noura'],
  body: [
    Hc('PART ONE: VERIFICATION OF RESOURCES (9 marks)'),
    H('Section I: Multiple Choice Questions (1 × 5 = 5 marks)'),
    mcq([
      ['Imaginary lines that divide the Earth into two equal halves are called:', ['Great circles', 'Latitudes', 'Longitudes', 'Cardinal points']],
      ['Large masses of land on the Earth’s surface separated by oceans are called:', ['Oceans', 'Continents', 'Islands', 'The Equator']],
      ['Because about 71 % of its surface is covered by water, the Earth is also called:', ['The red planet', 'The Greenwich Meridian', 'The blue planet', 'The world map']],
      ['The spinning movement of the Earth on its axis is called:', ['A year', 'The seasons', 'Revolution', 'Rotation']],
      ['Which of the following is at the centre of the solar system?', ['The Sun', 'The Moon', 'The stars', 'The galaxies']],
    ]),
    H('Section II: Structural Question (4 marks)'),
    P('The circle below represents the Earth. On it, draw and label the **Equator**, the **Tropic of Cancer**, the **Tropic of Capricorn** and the **Arctic Circle**. **(4 × 1 = 4 marks)**', { indent: 0, line: 300 }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 60, after: 60 }, children: [new ImageRun({ type: 'png', data: CIRCLE, transformation: { width: 220, height: 220 } })] }),
    Hc('PART TWO: VERIFICATION OF COMPETENCES (9 marks)'),
    situation('Your family is travelling by car to the village. On the way, your little brother Samy looks out of the window and says that the trees along the road are moving. The driver laughs and tells him that, in the same way, the Sun seems to “move” across the sky every day, from the east to the west. Samy does not understand, and he asks you, a Form One geography student, to explain what is really moving.'),
    P('**Perform the following tasks:**', { before: 120, after: 0 }),
    ...task(1, 'Present the problem raised in the situation above.', '3 marks', 3),
    ...task(2, 'Give two effects of the rotation of the Earth on its axis.', '3 marks', 2, ['i)', 'ii)']),
    ...task(3, 'Give three proofs to convince Samy that it is the Earth that moves and not the Sun.', '3 marks', 2, ['i)', 'ii)', 'iii)']),
    P('**Presentation: 2 marks**', { before: 160, align: AlignmentType.RIGHT }),
  ],
});

// =====================================================================
// FORM TWO
// =====================================================================
const F2 = firstCycle({
  file: 'F2_Geography_Seq1_2026-2027.docx', title: 'Form Two Geography – First Sequence', cls: 'FORM TWO BIL A / B', module: '2',
  competence: 'Learners are able to manage the consequences of population growth.',
  facilitators: ['Mme ASTHA Noura'],
  instructions: ['Answer ALL questions on this question paper. Calculators are allowed.', 'In Section I, mark an (X) on the letter of the correct answer.'],
  body: [
    Hc('PART ONE: VERIFICATION OF RESOURCES (9 marks)'),
    H('Section I: Multiple Choice Questions (1 × 5 = 5 marks)'),
    mcq([
      ['The average number of people living in a unit area, such as one square kilometre, is called:', ['Population density', 'Population growth', 'Overpopulation', 'Population distribution']],
      ['The parts of the Earth’s surface where people live permanently are called:', ['The non-ecumene', 'The ecumene', 'Both A and B', 'Population density']],
      ['People who leave their own country to settle in another country are called:', ['Travellers', 'Emigrants', 'Tourists', 'Immigrants']],
      ['Which of the following is NOT a factor of the uneven distribution of population?', ['Water supply', 'Relief', 'Soil fertility', 'The shape of the Earth']],
      ['The number of live births per 1,000 people in one year is called the:', ['Birth rate', 'Population growth', 'Natural increase', 'Death rate']],
    ]),
    H('Section II: Calculations (4 × 1 = 4 marks)'),
    P('In 2025, the population of the Comoros was estimated at **900,000** inhabitants, on an area of **2,200 km²**. In the same year, **27,000** children were born and **6,300** people died; **2,100** people moved into the country and **1,700** left it.', { line: 300 }),
    P('Write the formula, then calculate:', { after: 40 }),
    table([5233, 5233], [
      [cell([P('**a)** The population density', { after: 0 }), ...DOTS(3, 0, 5040)], 5233), cell([P('**b)** The death rate', { after: 0 }), ...DOTS(3, 0, 5040)], 5233)],
      [cell([P('**c)** The net migration', { after: 0 }), ...DOTS(3, 0, 5040)], 5233), cell([P('**d)** The rate of natural increase (in %)', { after: 0 }), ...DOTS(3, 0, 5040)], 5233)],
    ]),
    Hc('PART TWO: VERIFICATION OF COMPETENCES (9 marks)'),
    situation('The population of your town has increased very quickly in recent years. Every morning, it is difficult to find a motorbike taxi to go to school, and the market is always overcrowded. The mayor of the town calls upon you, a Form Two geography student, to help him understand the situation and to propose actions to manage its consequences.'),
    P('**Perform the following tasks:**', { before: 120, after: 0 }),
    ...task(1, 'Present the problem raised in the situation above.', '3 marks', 3),
    ...task(2, 'Give three factors that explain the rapid growth of the population of your town.', '3 marks', 1, ['i)', 'ii)', 'iii)']),
    ...task(3, 'The mayor wants to know the exact number of people living in the town in order to build new markets and organise transport. Explain what he should do to obtain this number.', '3 marks', 3),
    P('**Presentation: 2 marks**', { before: 160, align: AlignmentType.RIGHT }),
  ],
});

// =====================================================================
// FORM THREE
// =====================================================================
const F3 = firstCycle({
  file: 'F3_Geography_Seq1_2026-2027.docx', title: 'Form Three Geography – First Sequence', cls: 'FORM THREE', module: '1',
  competence: 'Learners are able to describe the planet Earth and to locate places on its surface.',
  facilitators: ['Mme ASTHA Noura', 'Mr KAMDEM Emmanuel'],
  instructions: ['Answer ALL questions on this question paper. Calculators are allowed.', 'In Section I, mark an (X) on the letter of the correct answer.'],
  body: [
    Hc('PART ONE: VERIFICATION OF RESOURCES (9 marks)'),
    H('Section I: Multiple Choice Questions (1 × 5 = 5 marks)'),
    mcq([
      ['From the Sun, the Earth is the:', ['First planet', 'Second planet', 'Third planet', 'Fourth planet']],
      ['The natural satellite of the Earth is:', ['The Sun', 'The Moon', 'Mars', 'The Milky Way']],
      ['The phase of the Moon in which its whole lit face can be seen from the Earth is called the:', ['New Moon', 'First quarter', 'Full Moon', 'Last quarter']],
      ['The line of longitude 0° is called the:', ['Equator', 'International Date Line', 'Greenwich (Prime) Meridian', 'Arctic Circle']],
      ['Which of the following lines is a great circle?', ['The Tropic of Cancer', 'The Equator', 'The Arctic Circle', 'The Tropic of Capricorn']],
    ]),
    H('Section II: Structural Questions (2 × 2 = 4 marks)', { pageBreak: true }),
    P('**1.** Town A is on latitude **12° N** and town B is on latitude **3° S**, on the same meridian. Taking 1° of latitude = 111 km, calculate the distance between the two towns. **(2 marks)**', { line: 300, after: 0 }),
    ...DOTS(3),
    P('**2.** Give **two** differences between lines of latitude and lines of longitude. **(2 marks)**', { before: 120, line: 300, after: 0 }),
    ...DOTS(3),
    Hc('PART TWO: VERIFICATION OF COMPETENCES (9 marks)'),
    situation('During a geography lesson in Garoua, your classmate Ali says that the Earth is flat. He explains that when he looks around the town or across the Benue plain, the land looks flat, and that if the Earth were round, people living at the bottom would fall off. Some classmates believe him. Your teacher asks you, a Form Three geography student, to help the class understand the true shape of the Earth.'),
    P('**Perform the following tasks:**', { before: 120, after: 0 }),
    ...task(1, 'Present the problem raised in the situation above.', '3 marks', 3),
    ...task(2, 'Give three proofs that show that the Earth is spherical.', '3 marks', 1, ['i)', 'ii)', 'iii)']),
    ...task(3, 'Using the size of the Earth, explain to Ali why the land around Garoua looks flat, although the Earth is round.', '3 marks', 3),
    P('**Presentation: 2 marks**', { before: 160, align: AlignmentType.RIGHT }),
  ],
});

// =====================================================================
// FORM FOUR (GCE type, Human Geography)
// =====================================================================
const centred = (t) => new Table({ alignment: AlignmentType.CENTER, width: { size: 7000, type: WidthType.DXA }, columnWidths: [4000, 3000], borders: BOX,
  rows: [new TableRow({ children: [cell(P('**Country**', { align: AlignmentType.CENTER, after: 0, size: 22 }), 4000, { shade: 'D9D9D9' }), cell(P('**HDI value**', { align: AlignmentType.CENTER, after: 0, size: 22 }), 3000, { shade: 'D9D9D9' })] }),
    ...t.map(([a, b]) => new TableRow({ children: [cell(P(a, { after: 0, size: 22 }), 4000), cell(P(b, { align: AlignmentType.CENTER, after: 0, size: 22 }), 3000)] }))] });

const upper = (opts) => Object.assign({ full: false }, opts);

const F4 = upper({
  file: 'F4_Geography_Seq1_2026-2027.docx', title: 'Form Four Geography – First Sequence', cls: 'FORM FOUR', module: '2', duration: '1 hour',
  competence: 'Learners are able to assess development and explain wave action on coasts.',
  facilitators: ['Mme ASTHA Noura', 'Mr KAMDEM Emmanuel', 'Mme TSOGO Sylviane'],
  instructions: ['Answer ALL questions. Write your answers on the answer sheets provided.', 'The number of marks is given in brackets at the end of each question.'],
  body: [
    Hc('HUMAN GEOGRAPHY'),
    H('QUESTION 1 (10 marks)'),
    gq('(a)', '(i)  Define the Human Development Index (HDI).', '2 marks'),
    gq('', '(ii)  State the value from which the HDI of a country is considered very high.', '1 mark'),
    gq('(b)', 'Study **Table 1** below, which shows the HDI of some countries.', ''),
    centred([['Norway', '0.97'], ['Republic of Korea', '0.93'], ['Brazil', '0.76'], ['Cameroon', '0.59'], ['Chad', '0.39']]),
    C('**Table 1:** Human Development Index of selected countries (approximate values, UNDP)', { size: 20, italics: true, before: 40, after: 80 }),
    gq('', 'Using the table, state the level of human development of **Cameroon** and of **Chad**.', '2 marks'),
    gq('(c)', 'Name **three** regions of the world where Newly Industrialised Countries (NICs) are found.', '3 marks'),
    gq('(d)', 'Give **two** weaknesses of Rostow’s model of economic growth.', '2 marks'),
    Hc('PHYSICAL GEOGRAPHY'),
    H('QUESTION 2 (10 marks)'),
    gq('(a)', 'State **two** characteristics of destructive waves.', '2 marks'),
    gq('(b)', 'With the aid of a well-labelled diagram, explain how a cliff is formed and why it retreats inland.', '3 marks'),
    gq('(c)', 'Describe the stages through which a headland is eroded to form a stack. Illustrate your answer with diagrams.', '3 marks'),
    gq('(d)', 'Explain how longshore drift leads to the formation of a spit.', '2 marks'),
  ],
});

// =====================================================================
// FORM FIVE (GCE type, Human Geography of the Form Four programme)
// =====================================================================
const cropTable = new Table({ alignment: AlignmentType.CENTER, width: { size: 8000, type: WidthType.DXA }, columnWidths: [3000, 5000], borders: BOX,
  rows: [new TableRow({ children: [cell(P('**Cash crop**', { align: AlignmentType.CENTER, after: 0, size: 22 }), 3000, { shade: 'D9D9D9' }), cell(P('**Main producing regions**', { align: AlignmentType.CENTER, after: 0, size: 22 }), 5000, { shade: 'D9D9D9' })] }),
    ...[['Cocoa', 'Centre, South, South-West'], ['Coffee', 'West, North-West, Littoral'], ['Cotton', 'North, Far North'], ['Bananas', 'Littoral, South-West']]
      .map(([a, b]) => new TableRow({ children: [cell(P(a, { after: 0, size: 22 }), 3000), cell(P(b, { after: 0, size: 22 }), 5000)] }))] });

const F5 = upper({
  file: 'F5_Geography_Seq1_2026-2027.docx', title: 'Form Five Geography – First Sequence', cls: 'FORM FIVE', module: 'Human Geography (Form Four programme)', duration: '1 hour',
  competence: 'Learners are able to explain the role of agriculture, fishing and mining in the economy of Cameroon.',
  facilitators: ['Mme TSOGO Sylviane', 'Mr NEBASIBI'],
  instructions: ['Answer ALL questions. Write your answers on the answer sheets provided.', 'The number of marks is given in brackets at the end of each question.'],
  body: [
    Hc('HUMAN GEOGRAPHY'),
    H('QUESTION 1 (10 marks)'),
    gq('(a)', 'Distinguish between **intensive** and **extensive** agriculture, giving one example of each.', '4 marks'),
    gq('(b)', 'Study **Table 1** below, which shows the main cash crops of Cameroon and their producing regions.', ''),
    cropTable,
    C('**Table 1:** Main cash crops of Cameroon and their producing regions', { size: 20, italics: true, before: 40, after: 80 }),
    gq('', '(i)  Name the cash crop that is grown mainly in the northern part of Cameroon.', '1 mark'),
    gq('', '(ii)  Explain **two** physical factors that favour the cultivation of this crop in that area.', '4 marks'),
    gq('', '(iii)  State **one** problem faced by the farmers of this crop.', '1 mark'),
    H('QUESTION 2 (10 marks)'),
    gq('(a)', '(i)  Define fishing.', '1 mark'),
    gq('', '(ii)  Describe **two** methods of fishing used in Cameroon.', '2 marks'),
    gq('(b)', 'Explain **two** ways in which fishing contributes to the economy of Cameroon.', '4 marks'),
    gq('(c)', 'Outline **three** economic benefits of the exploitation of mineral resources in Cameroon.', '3 marks'),
  ],
});

// =====================================================================
// LOWER SIXTH ARTS and UPPER SIXTH ARTS (A Level type, three questions to choose)
// =====================================================================
const sixthInstr = ['Answer THREE questions in all, chosen freely from any of the sub-branches below.', 'Each question carries 20 marks. Start each question on a new sheet of paper.', 'Illustrate your answers with well-labelled diagrams and sketch maps where necessary.'];
const Q = (n, branch, parts) => [H(`SECTION ${'ABCDEFG'[n - 1]}: ${branch}`, { before: 200 }), P(`**Question ${n}**`, { after: 60, keepNext: true }), ...parts.map(([l, t, m]) => gq(l, t, m))];

const LSA = upper({
  file: 'LSA_Geography_Seq1_2026-2027.docx', title: 'Lower Sixth Arts Geography – First Sequence', cls: 'LOWER SIXTH ARTS', module: 'All sub-branches', duration: '2 hours 15 minutes',
  competence: 'Learners are able to explain physical and human geographical phenomena and to apply this knowledge to Cameroon.',
  facilitators: ['Mr KAMDEM Emmanuel', 'Mr NEBASIBI', 'Mme TSOGO Sylviane'],
  instructions: sixthInstr,
  body: [
    ...Q(1, 'METEOROLOGY', [
      ['(a)', 'What is the atmosphere?', '2 marks'],
      ['(b)', 'Describe the composition of the atmosphere, distinguishing between the constant gases and the variable gases.', '8 marks'],
      ['(c)', 'With the aid of a well-labelled diagram, describe the vertical structure of the atmosphere.', '10 marks']]),
    ...Q(2, 'GEOMORPHOLOGY', [
      ['(a)', 'Briefly explain **two** theories of the origin of the Earth.', '8 marks'],
      ['(b)', 'With the aid of a well-labelled diagram, describe the internal structure of the Earth.', '12 marks']]),
    ...Q(3, 'BIOGEOGRAPHY', [
      ['(a)', 'Define soil.', '2 marks'],
      ['(b)', 'Describe the **four** main components of the soil, giving their approximate proportions in a good loam soil.', '8 marks'],
      ['(c)', '(i)  What is soil texture?', '2 marks'],
      ['', '(ii)  Explain how soil texture affects the drainage, the aeration and the fertility of the soil.', '8 marks']]),
    ...Q(4, 'POPULATION GEOGRAPHY', [
      ['(a)', 'Distinguish between a census and a sample survey.', '6 marks'],
      ['(b)', 'Explain **three** problems faced when conducting a population census in a developing country such as Cameroon.', '9 marks'],
      ['(c)', '(i)  Cameroon has about 29 million inhabitants on an area of 475,650 km². Calculate its arithmetic density.', '2 marks'],
      ['', '(ii)  Explain why physiological density is a better measure of population pressure than arithmetic density.', '3 marks']]),
    ...Q(5, 'SETTLEMENT GEOGRAPHY', [
      ['(a)', 'Distinguish between the site and the situation of a settlement.', '4 marks'],
      ['(b)', 'Explain **four** factors that influenced the location of early settlements.', '12 marks'],
      ['(c)', 'With reference to a named town in Cameroon, show how its situation has favoured its growth.', '4 marks']]),
    ...Q(6, 'ECONOMIC GEOGRAPHY', [
      ['(a)', 'Distinguish between renewable and non-renewable natural resources, giving **two** examples of each.', '6 marks'],
      ['(b)', 'Distinguish between arable farming, pastoral farming and mixed farming.', '6 marks'],
      ['(c)', 'Explain **four** ways in which agriculture is important to the economy of a country.', '8 marks']]),
    ...Q(7, 'GEOGRAPHY OF CAMEROON', [
      ['(a)', 'Name the **three** major highlands and the **two** major lowlands of Cameroon.', '5 marks'],
      ['(b)', 'With the aid of a sketch map, describe the main characteristics of the Western Highlands.', '7 marks'],
      ['(c)', 'Explain how the air masses and the movement of the ITCZ produce the seasons of Cameroon.', '8 marks']]),
  ],
});

const USA = upper({
  file: 'USA_Geography_Seq1_2026-2027.docx', title: 'Upper Sixth Arts Geography – First Sequence', cls: 'UPPER SIXTH ARTS', module: 'All sub-branches', duration: '2 hours 15 minutes',
  competence: 'Learners are able to explain physical and human geographical phenomena and to apply this knowledge to Cameroon.',
  facilitators: ['Mr KAMDEM Emmanuel', 'Mr NEBASIBI', 'Mme TSOGO Sylviane'],
  instructions: sixthInstr,
  body: [
    ...Q(1, 'GEOMORPHOLOGY', [
      ['(a)', 'Assess the benefits and the hazards of volcanic activity to man, with reference to Mount Cameroon.', '12 marks'],
      ['(b)', 'Examine the measures taken to reduce the damage caused by earthquakes.', '8 marks']]),
    ...Q(2, 'METEOROLOGY', [
      ['(a)', 'Explain how altitude, distance from the sea and ocean currents influence the temperature of a place.', '9 marks'],
      ['(b)', 'What is temperature inversion?', '2 marks'],
      ['(c)', 'With the aid of a diagram, explain how temperature inversion occurs in a valley, and state **two** of its effects.', '9 marks']]),
    ...Q(3, 'POPULATION GEOGRAPHY', [
      ['(a)', 'Draw the population pyramid of a developing country such as Cameroon and comment on its shape.', '10 marks'],
      ['(b)', 'Examine the factors responsible for the rapid growth of the world population since 1950.', '10 marks']]),
    ...Q(4, 'BIOGEOGRAPHY', [
      ['(a)', 'Explain how climate and parent rock influence soil formation.', '8 marks'],
      ['(b)', 'With the aid of a well-labelled diagram, describe a typical soil profile.', '6 marks'],
      ['(c)', 'Describe the process of laterisation.', '6 marks']]),
    ...Q(5, 'SETTLEMENT GEOGRAPHY', [
      ['(a)', 'What is the rural-urban fringe?', '3 marks'],
      ['(b)', 'Examine the characteristics of the rural-urban fringe and the land-use conflicts found there.', '9 marks'],
      ['(c)', 'Explain **four** changes taking place in rural settlements in Cameroon today.', '8 marks']]),
    ...Q(6, 'GEOGRAPHY OF CAMEROON', [
      ['(a)', 'Account for the rapid growth of towns in Cameroon since independence.', '10 marks'],
      ['(b)', 'Examine the problems facing the exploitation of forests in Cameroon and suggest solutions.', '10 marks']]),
    ...Q(7, 'ECONOMIC GEOGRAPHY AND ENVIRONMENT', [
      ['(a)', 'With reference to specific examples, explain the meaning of agriculture.', '4 marks'],
      ['(b)', '“Some natural resources can be replenished, while others are exhaustible.” Discuss this statement with reference to specific examples.', '10 marks'],
      ['(c)', 'What is pollution? Examine **three** types of pollution and their effects on the environment.', '6 marks']]),
  ],
});

(async () => { for (const x of [F1, F2, F3, F4, F5, LSA, USA]) await build(x); })();
