// First sequence evaluations 2026-2027, Geography, DGCAST Garoua (Divine Grace College): one Word file per class
const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, ImageRun, AlignmentType, WidthType,
  BorderStyle, TabStopType, LeaderType, VerticalAlign, ShadingType, Footer, PageNumber,
} = require('docx');

const DIR = '/tmp/claude-0/-home-user-linea-github/389cf9fb-8078-5c81-95f2-72f084366795/scratchpad/ep26/';
const OUT = process.argv[2] || DIR + 'out_dgc/';
const LOGO = fs.readFileSync(DIR + 'logo_dgc.png');
const IMG = '/home/claude/f4/img/v2/';
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
    out.push(table([3000, 3733, 3733], [[cell([p('Seal of the school'), p('HARDWORK – DILIGENCE – SUCCESS', { italics: true })], 3000),
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
  const one = (q, n) => [P(`**${n}. ${q[0]}**`, { after: 30, size: 22 }),
    ...q[1].map((o, i) => P(`${'ABCD'[i]}.  ${o}`, { indent: 360, after: 0, size: 22 }))];
  const half = Math.ceil(qs.length / 2);
  const rows = [];
  for (let i = 0; i < half; i++) rows.push(new TableRow({ cantSplit: true, children: [
    cell(one(qs[i], i + 1), 5233, { borders: NOB, valign: VerticalAlign.TOP }),
    cell(qs[i + half] ? one(qs[i + half], i + 1 + half) : [P('')], 5233, { borders: NOB, valign: VerticalAlign.TOP })] }));
  return new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: [5233, 5233], borders: NOB, rows });
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
    creator: 'Geography Department, DGCAST Garoua', title: x.title,
    styles: { default: { document: { run: { font: FONT, size: 24 } } } },
    sections: [{
      properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 567, bottom: 567, left: 720, right: 720 } } },
      footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [
        new TextRun({ text: `DGCAST Garoua – Geography – ${x.cls} – First Sequence ${YEAR} – Page `, font: FONT, size: 16 }),
        new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 16 })] })] }) },
      children,
    }],
  });
  return Packer.toBuffer(doc).then((b) => { fs.mkdirSync(OUT, { recursive: true }); fs.writeFileSync(OUT + x.file, b); console.log('written', x.file); });
}

// =====================================================================
// DGCAST: first-cycle format (10 MCQ × 0.5, structural questions, situation with two documents)
// =====================================================================
const photo = (f, w = 290) => new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 40, after: 20 },
  children: [new ImageRun({ type: 'jpg', data: fs.readFileSync(IMG + f), transformation: { width: w, height: Math.round(w * 568 / 1024) } })] });
// a document box: [title, text?, image?, caption?]
const docCell = (d, w) => cell([P('**' + d.title + '**', { after: 40, size: 22 }), ...(d.text ? [P(d.text, { after: 40, size: 22, line: 280 })] : []),
  ...(d.img ? [photo(d.img)] : []), ...(d.caption ? [C(d.caption, { italics: true, size: 19, after: 0 })] : [])], w, { valign: VerticalAlign.TOP });
const documents = (d1, d2) => table([5233, 5233], [[docCell(d1, 5233), docCell(d2, 5233)]]);

const dgcFirst = (opts) => Object.assign({ full: true, duration: '1 hour', facilitators: ['Mr KAMDEM Emmanuel'],
  instructions: ['Answer ALL questions on this question paper.', 'In Section I, mark an (X) on the letter of the correct answer.'] }, opts);
const partOne = (qs, structural) => [
  Hc('PART ONE: VERIFICATION OF RESOURCES (9 marks)'),
  H('Section I: Multiple Choice Questions (10 × 0.5 = 5 marks)'),
  mcq(qs),
  H('Section II: Structural Questions (4 marks)'),
  ...structural,
];
const partTwo = (sit, d1, d2, t2, t3) => [
  Hc('PART TWO: VERIFICATION OF COMPETENCES (9 marks)'),
  situation(sit),
  P('', { after: 60 }),
  documents(d1, d2),
  P('**Perform the following tasks:**', { before: 120, after: 0 }),
  ...task(1, 'What is the problem raised in the situation above?', '3 marks', 3),
  ...task(2, t2[0], '3 marks', t2[1] || 1, t2[2]),
  ...task(3, t3[0], '3 marks', t3[1] || 1, t3[2]),
  P('**Presentation: 2 marks**', { before: 160, align: AlignmentType.RIGHT }),
];
const sq = (n, t, marks, nLines = 2) => [P(`**${n}.** ${t} **(${marks})**`, { before: 80, line: 300, after: 0, keepNext: true }), ...DOTS(nLines)];
const III = ['i)', 'ii)', 'iii)'];

// ---------- FORM ONE ----------
const DF1 = dgcFirst({
  file: 'DGCAST_F1_Geography_Seq1_2026-2027.docx', title: 'Form One Geography – First Sequence', cls: 'FORM ONE', module: '1',
  competence: 'Learners are able to use maps and their knowledge of the Earth to locate places.',
  body: [
    ...partOne([
      ['The study of the Earth, its physical features and the activities of the people who live on it is called:', ['History', 'Geography', 'Geology', 'Biology']],
      ['The branch of geography that studies relief, climate, rivers and soils is:', ['Human geography', 'Practical geography', 'Physical geography', 'Economic geography']],
      ['Population geography and settlement geography belong to:', ['Physical geography', 'Human geography', 'Practical geography', 'Climatology']],
      ['Which method do geographers use to collect information directly from people?', ['Questionnaires and interviews', 'Satellite images', 'Map projections', 'Contour lines']],
      ['From the Sun, the Earth is the:', ['First planet', 'Second planet', 'Third planet', 'Fourth planet']],
      ['Water covers about … of the Earth’s surface.', ['29 %', '50 %', '71 %', '90 %']],
      ['The largest ocean in the world is the:', ['Atlantic Ocean', 'Indian Ocean', 'Pacific Ocean', 'Arctic Ocean']],
      ['A round model of the Earth is called a:', ['Map', 'Globe', 'Projection', 'Atlas']],
      ['The part of a map that explains the signs and colours used on it is the:', ['Title', 'Scale', 'Key (legend)', 'North arrow']],
      ['The latitude and the longitude of a place are called its:', ['Cardinal points', 'Geographical coordinates', 'Scale', 'Key']],
    ], [
      ...sq(1, 'On a map with a scale of 1 cm to 20 km, two towns are 7 cm apart. Calculate the real distance between them.', '2 marks'),
      ...sq(2, 'Give **two** differences between a globe and a map.', '2 marks', 3),
    ]),
    ...partTwo(
      'Aïcha has just arrived in Garoua from Douala. She wants to visit her aunt in Maroua, but she does not know where Maroua is, nor how far it is from Garoua. She opens a map of Cameroon, but she does not understand the signs, the colours and the numbers written on it. She asks you, a Form One geography student, for help.',
      { title: 'Document 1: The marginal information of a map', text: 'Every good map has marginal information. The **title** tells what the map shows. The **key** explains the signs and colours. The **scale** helps to calculate real distances. The **north arrow** shows the directions, and the **lines of latitude and longitude** help to locate places.' },
      { title: 'Document 2', img: 'f2t_cattle_market.jpg', caption: 'A cattle market' },
      ['Using Document 1, name **three** elements of a map that can help Aïcha and say what each one is used for.', 1, III],
      ['Propose **three** things Aïcha can do to find Maroua on the map and to know its distance from Garoua.', 1, III]),
  ],
});

// ---------- FORM TWO ----------
const DF2 = dgcFirst({
  file: 'DGCAST_F2_Geography_Seq1_2026-2027.docx', title: 'Form Two Geography – First Sequence', cls: 'FORM TWO', module: '1',
  competence: 'Learners are able to manage the consequences of rapid population growth on natural resources.',
  instructions: ['Answer ALL questions on this question paper. Calculators are allowed.', 'In Section I, mark an (X) on the letter of the correct answer.'],
  body: [
    ...partOne([
      ['The number of people living in a place at a given time is called:', ['Population', 'Density', 'Migration', 'Birth rate']],
      ['Natural population growth is the difference between:', ['Births and deaths', 'Immigrants and emigrants', 'Towns and villages', 'Men and women']],
      ['Until about 1800, the world population was below:', ['1 billion', '3 billion', '5 billion', '8 billion']],
      ['The world population passed 8 billion in:', ['1950', '1999', '2011', '2022']],
      ['Which of the following is a factor of rapid population growth?', ['A falling death rate', 'Wars', 'Famine', 'Epidemics']],
      ['The birth rate is expressed:', ['In per cent (%)', 'Per thousand (‰)', 'In km²', 'In years']],
      ['Population density is calculated as:', ['Area ÷ population', 'Population ÷ area', 'Births ÷ deaths', 'Population × area']],
      ['Which of these areas is sparsely populated?', ['West Africa', 'East Asia', 'The Sahara Desert', 'Western Europe']],
      ['Which region of Cameroon has the lowest population density?', ['The Littoral', 'The West', 'The Far North', 'The East']],
      ['People settle near rivers, lakes and coasts mainly because of:', ['Water', 'Snow', 'Mountains', 'Deserts']],
    ], [
      P('A town of **200,000** inhabitants with an area of **400 km²** recorded **7,000** births and **1,600** deaths in one year. Write the formula, then calculate:', { line: 300, after: 40 }),
      table([5233, 5233], [
        [cell([P('**a)** The birth rate **(1 mark)**', { after: 0 }), ...DOTS(2, 0, 5040)], 5233), cell([P('**b)** The death rate **(1 mark)**', { after: 0 }), ...DOTS(2, 0, 5040)], 5233)],
        [cell([P('**c)** The natural growth rate **(1 mark)**', { after: 0 }), ...DOTS(2, 0, 5040)], 5233), cell([P('**d)** The population density **(1 mark)**', { after: 0 }), ...DOTS(2, 0, 5040)], 5233)],
      ]),
    ]),
    ...partTwo(
      'In the village of Ouro Doukoudjé, near Garoua, the population has doubled in twenty years. Farms have become very small, the soils no longer produce enough, and women walk for hours to find firewood because the trees around the village have been cut down. The village chief asks you, a Form Two geography student, to explain what is happening and to help the village.',
      { title: 'Document 1: A villager speaks', text: '“In 2005, our village had 1,200 people, and each family farmed about 5 hectares. Today we are about 2,400. Many girls marry before 18, and each woman has about six children. Since the health centre was built, vaccination has saved many children. But our farms are now only 2 hectares, and the well dries up in March.”' },
      { title: 'Document 2', text: 'The Indomitable Lions, the national football team of Cameroon, have won the Africa Cup of Nations five times: in 1984, 1988, 2000, 2002 and 2017.' },
      ['Using Document 1, give **three** causes of the rapid growth of the population of the village.', 1, III],
      ['Propose **three** solutions to reduce the effects of rapid population growth on the natural resources of the village.', 1, III]),
  ],
});

// ---------- FORM TWO TECHNICAL ----------
const months = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
const climTable = (title, temp, rain) => new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: [1966].concat(Array(12).fill(708)), borders: BOX,
  rows: [['Month'].concat(months), ['Temperature (°C)'].concat(temp), ['Rainfall (mm)'].concat(rain)].map((r, i) => new TableRow({ children: r.map((c, j) =>
    cell(P(i === 0 || j === 0 ? '**' + c + '**' : String(c), { align: j ? AlignmentType.CENTER : undefined, after: 0, size: 20 }), j ? 708 : 1966, { shade: i === 0 ? 'D9D9D9' : undefined })) })) });

const DF2T = dgcFirst({
  file: 'DGCAST_F2T_Geography_Seq1_2026-2027.docx', title: 'Form Two Technical Geography – First Sequence', cls: 'FORM TWO TECHNICAL', module: '1',
  competence: 'Learners are able to protect the resources of the equatorial region.',
  body: [
    ...partOne([
      ['The equatorial region lies between about:', ['5° N and 5° S of the Equator', '10° N and 20° N', '23½° N and 66½° N', '66½° N and 90° N']],
      ['Which of the following is an equatorial region?', ['The Sahara', 'The Congo Basin', 'The Sahel', 'The Mediterranean']],
      ['The average temperature of the equatorial region is about:', ['10 °C', '18 °C', '27 °C', '40 °C']],
      ['The annual rainfall of the equatorial region is generally:', ['Below 250 mm', 'About 500 mm', 'Above 1,500 mm', 'Nil']],
      ['The annual range of temperature of the equatorial climate is:', ['Very small (2 to 3 °C)', 'About 15 °C', 'About 20 °C', 'About 30 °C']],
      ['The washing down of soil nutrients by heavy rain is called:', ['Leaching', 'Evaporation', 'Irrigation', 'Transpiration']],
      ['The equatorial forest is evergreen because:', ['Its trees shed their leaves at different times', 'Its trees have no leaves', 'It rains only in summer', 'Its trees are very short']],
      ['Which of the following is a hardwood of the equatorial forest?', ['Pine', 'Mahogany', 'Eucalyptus', 'Baobab']],
      ['Which of the following is a human activity of the equatorial region?', ['Lumbering', 'Camel herding', 'Ice fishing', 'Reindeer herding']],
      ['Which of the following is a problem of the equatorial region?', ['Deforestation', 'Desertification', 'Frost', 'Snowstorms']],
    ], [
      P('Study the climate data of Yaoundé below and answer the questions.', { after: 40 }),
      climTable('Yaoundé', [24, 25, 25, 24, 24, 23, 22, 22, 23, 23, 24, 24], [15, 50, 140, 180, 200, 150, 50, 80, 220, 290, 120, 20]),
      C('Climate data of Yaoundé (approximate values)', { italics: true, size: 19, before: 20, after: 40 }),
      table([5233, 5233], [
        [cell([P('**a)** Calculate the annual range of temperature. **(1 mark)**', { after: 0 }), ...DOTS(2, 0, 5040)], 5233), cell([P('**b)** Calculate the total annual rainfall. **(1 mark)**', { after: 0 }), ...DOTS(2, 0, 5040)], 5233)],
        [cell([P('**c)** Name the wettest month. **(1 mark)**', { after: 0 }), ...DOTS(2, 0, 5040)], 5233), cell([P('**d)** State **one** characteristic of the equatorial climate shown by these figures. **(1 mark)**', { after: 0 }), ...DOTS(2, 0, 5040)], 5233)],
      ]),
    ]),
    ...partTwo(
      'During the holidays, Paul visits his uncle in Bertoua, in the East Region. Every day, he sees many lorries carrying huge logs, and large areas of forest cleared for farms. His uncle tells him that animals and medicinal plants are becoming rare and that the rains are no longer regular. Paul asks you, a Form Two Technical student, to explain what is happening.',
      { title: 'Document 1: The forest in danger', img: 'f2t_logging_truck.jpg', caption: 'Logs leaving the equatorial forest', text: 'The equatorial forest is cut for timber, which is sold abroad, for new farms, for firewood and charcoal, and to open roads and mines.' },
      { title: 'Document 2', img: 'f2t_cotton_harvest.jpg', caption: 'A cotton harvest' },
      ['Using Document 1, give **three** causes of the destruction of the equatorial forest.', 1, III],
      ['Propose **three** measures to protect the equatorial forest.', 1, III]),
  ],
});

// ---------- FORM THREE ----------
const DF3 = dgcFirst({
  file: 'DGCAST_F3_Geography_Seq1_2026-2027.docx', title: 'Form Three Geography – First Sequence', cls: 'FORM THREE', module: '1',
  competence: 'Learners are able to describe the planet Earth and to locate places on its surface.',
  instructions: ['Answer ALL questions on this question paper. Calculators are allowed.', 'In Section I, mark an (X) on the letter of the correct answer.'],
  body: [
    ...partOne([
      ['From the Sun, the Earth is the:', ['First planet', 'Second planet', 'Third planet', 'Fourth planet']],
      ['The natural satellite of the Earth is:', ['The Sun', 'The Moon', 'Mars', 'The Milky Way']],
      ['The phase of the Moon in which its whole lit face can be seen from the Earth is called the:', ['New Moon', 'First quarter', 'Full Moon', 'Last quarter']],
      ['The circumference of the Earth at the Equator is about:', ['12,700 km', '20,000 km', '40,000 km', '510 million km']],
      ['The shape of the Earth is best described as:', ['A flat disc', 'A cube', 'A sphere slightly flattened at the poles', 'A cylinder']],
      ['Which of the following is a proof that the Earth is spherical?', ['Ships disappear gradually below the horizon', 'The Sun gives heat', 'Rivers flow to the sea', 'Trees grow upwards']],
      ['The line of latitude 0° is called the:', ['Greenwich Meridian', 'Equator', 'Tropic of Cancer', 'Arctic Circle']],
      ['The line of longitude 0° is called the:', ['Equator', 'International Date Line', 'Greenwich (Prime) Meridian', 'Tropic of Capricorn']],
      ['The Tropic of Cancer is at latitude:', ['0°', '23½° N', '23½° S', '66½° N']],
      ['Lines of longitude are also called:', ['Parallels', 'Meridians', 'Tropics', 'Polar circles']],
    ], [
      ...sq(1, 'Town A is on latitude **8° N** and town B is on latitude **2° S**, on the same meridian. Taking 1° of latitude = 111 km, calculate the distance between the two towns.', '2 marks', 3),
      ...sq(2, 'Give **two** differences between lines of latitude and lines of longitude.', '2 marks', 3),
    ]),
    ...partTwo(
      'One night, the engine of a fishing canoe breaks down in the middle of Lake Lagdo. The fishermen call the rescue team with a mobile phone, but they cannot say exactly where they are. The rescuers ask them to give their position, but the fishermen do not know what latitude and longitude are. You, a Form Three geography student, are asked to help them.',
      { title: 'Document 1: Giving the position of a place', text: 'The exact position of a place is given by its geographical coordinates. Its **latitude** is its distance north or south of the Equator, and its **longitude** is its distance east or west of the Greenwich Meridian; both are measured in degrees. A mobile phone with GPS shows the coordinates of the place where it is, for example about 9° 03′ N, 13° 44′ E near the Lagdo dam.' },
      { title: 'Document 2', img: 'f2t_market.jpg', caption: 'A market day' },
      ['Using Document 1, explain how the fishermen can give their exact position to the rescuers.', 3],
      ['Propose **three** things the fishermen can do so that they can be located easily in the future.', 1, III]),
  ],
});

// ---------- FORM FOUR (GCE type) ----------
const DF4 = Object.assign({ full: false }, {
  file: 'DGCAST_F4_Geography_Seq1_2026-2027.docx', title: 'Form Four Geography – First Sequence', cls: 'FORM FOUR', module: '1', duration: '1 hour',
  competence: 'Learners are able to explain the characteristics of biomes and to manage soils sustainably.',
  facilitators: ['Mr KAMDEM Emmanuel', 'Mr TABIT Blaise'],
  instructions: ['This paper has two sections, A and B. Answer ALL the questions in each section.', 'Answer each section on a separate answer sheet.', 'The number of marks is given in brackets at the end of each question.'],
  body: [
    Hc('SECTION A: PHYSICAL GEOGRAPHY (20 marks)'),
    H('QUESTION 1 (10 marks)'),
    gq('', 'Study **Table 1** below, which shows the climate data of a station X in Africa.', ''),
    climTable('X', [27, 30, 33, 33, 30, 27, 26, 26, 26, 27, 28, 27], [0, 0, 3, 26, 115, 150, 178, 220, 190, 55, 2, 0]),
    C('**Table 1:** Climate data of station X', { size: 20, italics: true, before: 40, after: 80 }),
    gq('(a)', '(i)  Calculate the annual range of temperature of station X.', '1 mark'),
    gq('', '(ii)  Calculate the total annual rainfall of station X.', '1 mark'),
    gq('', '(iii)  Name the wettest month.', '1 mark'),
    gq('(b)', 'Name the biome in which station X is located, and give **two** reasons for your answer.', '3 marks'),
    gq('(c)', 'Describe **two** ways in which the natural vegetation of this biome is adapted to the long dry season.', '4 marks'),
    H('QUESTION 2 (10 marks)'),
    gq('(a)', 'Define soil erosion.', '2 marks'),
    gq('(b)', 'Explain **two** human activities that cause soil erosion in Cameroon.', '4 marks'),
    gq('(c)', 'Describe **two** methods of soil conservation used by farmers in Cameroon.', '4 marks'),
    Hc('SECTION B: HUMAN GEOGRAPHY (20 marks)'),
    C('(This section is set by Mr TABIT Blaise.)', { italics: true, after: 40 }),
    ...SPACE(6),
  ],
});

(async () => { for (const x of [DF1, DF2, DF2T, DF3, DF4]) await build(x); })();
