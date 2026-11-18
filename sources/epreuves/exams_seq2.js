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
// The two papers keep the questions and the chapters written by the class teacher (Mme ASTHA Noura);
// the wording, the layout and the situation are rewritten, and Documents 1 and 2 (Document 2 = distractor) are added.
let FOURKEY = '';
const base = (o) => Object.assign({ duration: '1 hour', teacher: 'Mme ASTHA Noura', instructions: ['Answer ALL questions on this question paper.', 'In Section I, mark an (X) on the letter of the correct answer.'] }, o);
const docCell = (d, w) => cell([P('**' + d.title + '**', { after: 40, size: 22 }), ...[].concat(d.text).map((t) => P(t, { after: 40, size: 22, line: 280 }))], w, { valign: VerticalAlign.TOP });
const documents = (d1, d2) => table([5233, 5233], [[docCell(d1, 5233), docCell(d2, 5233)]]);
const mcqRows = (qs, lines) => {
  const LB = lines ? { top: none, left: none, right: none, bottom: { style: BorderStyle.SINGLE, size: 6, color: '808080' } } : NOB;
  const one = (q, n) => [P(`**${n}. ${q[0]}**`, { after: 40, size: 22 }), ...q[1].map((o, i) => P(`${'ABCD'[i]}.  ${o}`, { indent: 360, after: 0, size: 22 })), P('', { after: 80 })];
  const half = Math.ceil(qs.length / 2); const rows = [];
  for (let i = 0; i < half; i++) rows.push(new TableRow({ cantSplit: true, children: [cell(one(qs[i], i + 1), 5233, { borders: LB, valign: VerticalAlign.TOP }), qs[i + half] ? cell(one(qs[i + half], i + 1 + half), 5233, { borders: LB, valign: VerticalAlign.TOP }) : cell(P(''), 5233, { borders: NOB })] }));
  return new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: [5233, 5233], borders: NOB, rows });
};
const completeTable = (widths, head, rows, rh = 1100) => new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: widths, borders: BOX,
  rows: [new TableRow({ children: head.map((h, i) => cell(P('**' + h + '**', { align: AlignmentType.CENTER, after: 0, size: 22 }), widths[i], { shade: 'D9D9D9' })) }),
    ...rows.map((r) => new TableRow({ cantSplit: true, height: { value: rh, rule: 'atLeast' }, children: r.map((c, i) => cell(P(c, { after: 0, size: 22, bold: i === 0 }), widths[i])) }))] });
// a calculation box: question text + space for the working
const calc = (n, text, marks) => [P(`**${n})** ${text} **(${marks})**`, { before: 120, after: 40, indent: 360, hanging: 360, line: 300, keepNext: true }), ...DOTS(3, 360)];

// =====================================================================
// FORM ONE: module 1 (cosmic changes: the map, the movements of the Earth, the winds, time)
// =====================================================================
const F1 = base({
  file: 'F1_Geography_Seq2_2026-2027.docx', title: 'Form One Geography – Second Sequence', cls: 'FORM ONE BIL A / B', module: '1',
  competence: 'Learners are able to adapt to cosmic changes.',
  body: [
    Hc('PART ONE: VERIFICATION OF RESOURCES (9 marks)'),
    H('Section I: Multiple Choice Questions (1 × 5 = 5 marks)'),
    mcq([
      ['Which of the following is NOT a marginal information of a map?', ['The title', 'The scale', 'The conventional signs', 'The cardinal points']],
      ['Which of the following is NOT an effect of the rotation of the Earth?', ['The change of seasons', 'The succession of day and night', 'The rise and fall of sea tides', 'The deflection of winds']],
      ['In the northern hemisphere, the winds are deflected to the:', ['Right', 'Downward', 'Left', 'Regular direction']],
      ['In which season are the days longer and the nights shorter?', ['Winter solstice', 'Summer solstice', 'Spring', 'Autumn']],
      ['The parts of the Earth that exist without being modified by man form the:', ['Natural environment', 'Waste', 'Forest', 'Seasons']],
    ]),
    H('Section II: Structural Questions (2 × 2 = 4 marks)', { pageBreak: true }),
    P('Show the correct calculation procedure.', { italics: true, after: 40 }),
    ...calc(1, 'What is the local time in **Cairo**, on longitude **30° E**, if the GMT is **8:00 am**?', '2 marks'),
    ...calc(2, 'What is the longitude of **Los Angeles**, whose local time is **10:00 am** when the GMT is **6:00 pm (18:00)**?', '2 marks'),
    Hc('PART TWO: VERIFICATION OF COMPETENCES (9 marks)'),
    situation('Your elder brother lives in Tokyo. One day, he phones you in Garoua and tells you that he is just getting up from sleep, but on your watch it is midday. Moussa, a pupil who lives in Maroua, notices that in January his parents wake him up to prepare for school when it is still dark, but in September the sun is already up at the same time. You are called upon to explain these situations.'),
    P('', { after: 60 }),
    documents(
      { title: 'Document 1: The movements of the Earth', text: ['**Rotation:** the Earth spins on its axis from west to east in about 24 hours. It causes the succession of day and night. It also causes differences of time between places: places to the east are ahead, and places to the west are behind.', '**Revolution:** the Earth moves around the Sun in about 365 days, with its axis tilted. It causes the seasons and the unequal length of days and nights during the year.'] },
      { title: 'Document 2', text: 'Mount Cameroon, in the South-West Region, is the highest mountain of Cameroon. It is about 4,040 metres high and it is an active volcano.' }),
    P('**Perform the following tasks:**', { before: 120, after: 0 }),
    ...task(1, 'Present the problem raised in the situation above.', '3 marks', 3),
    ...task(2, 'Using Document 1, give two effects of the phenomenon raised in the situation above.', '3 marks', 2, ['i)', 'ii)']),
    ...task(3, 'Suggest two solutions to your friend Moussa on what to do, or how to adapt, during the cold season, when the mornings are still dark.', '3 marks', 2, ['1)', '2)']),
    P('**Presentation: 2 marks**', { before: 160, align: AlignmentType.RIGHT }),
  ],
});

// =====================================================================
// FORM TWO: module 1 (man in the equatorial, tropical and hot desert zones)
// =====================================================================
const F2 = base({
  file: 'F2_Geography_Seq2_2026-2027.docx', title: 'Form Two Geography – Second Sequence', cls: 'FORM TWO BIL A / B', module: '1',
  competence: 'Learners are able to manage the natural resources of the equatorial, tropical and hot desert zones.',
  body: [
    Hc('PART ONE: VERIFICATION OF RESOURCES (9 marks)'),
    H('Section I: Multiple Choice Questions (1 × 5 = 5 marks)'),
    mcq([
      ['The hot desert milieu is located between the latitudes (north and south of the equator):', ['0° and 5°', '5° and 10°', '10° and 15°', '15° and 30°']],
      ['Which of the following animals of Cameroon is gathered from the wild?', ['The cow', 'The goat', 'The pangolin', 'The cock']],
      ['The movement of herdsmen and their cattle from place to place, in search of pasture and water, is called:', ['Grazing', 'Pastoral nomadism', 'Cattle rearing', 'Pasture']],
      ['The places in the world where people do not live are called:', ['The forest', 'The non-ecumene', 'The deciduous forest', 'The ecumene']],
      ['The soil of the tropical zone is called:', ['Volcanic soil', 'Ferrallitic soil', 'Ferruginous soil', 'Loam soil']],
    ]),
    H('Section II: Structural Question (4 × 1 = 4 marks)'),
    P('Using your knowledge of the lessons, complete the table below. Give **one cause** and **one consequence** of each problem.', { line: 300, after: 80 }),
    completeTable([3400, 3533, 3533], ['Problem', 'Cause', 'Consequence'], [['Firewood crisis', '', ''], ['Deforestation', '', '']]),
    Hc('PART TWO: VERIFICATION OF COMPETENCES (9 marks)'),
    situation('In your locality, there used to be a natural cover with many plants and trees. The municipal council wanted to create a park, a restaurant and a hall for celebrations and meetings. To build them, the trees had to be cut down. Today, the trees have progressively disappeared: on one side there is empty land, and on the other side there are buildings and playgrounds.'),
    P('', { after: 60 }),
    documents(
      { title: 'Document 1: Extract from a report of the municipal council', text: ['“The site covered 8 hectares of trees. To build the park, the restaurant and the hall for ceremonies and meetings, the trees were cut down on 6 hectares. The inhabitants also cut some trees for firewood and for building poles. Nobody has planted new trees since the works. The ground is now bare and dusty in many places, and the air is hotter.”'] },
      { title: 'Document 2', text: 'The Sahara is the largest hot desert in the world. It covers about 9 million km² in the north of Africa. Very few people live there, and nomads move from one oasis to another.' }),
    P('**Perform the following tasks:**', { before: 120, after: 0 }),
    ...task(1, 'Present the problem raised in the situation above.', '3 marks', 3),
    ...task(2, 'Using Document 1, state the factors that caused the cutting down of the trees.', '3 marks', 3),
    ...task(3, 'What should be done to bring back the trees on that land?', '3 marks', 3),
    P('**Presentation: 2 marks**', { before: 160, align: AlignmentType.RIGHT }),
  ],
});

// =====================================================================
// FORM THREE: built from the pages given by the teachers (rotation and revolution of the Earth, great circles, the International Date Line, time)
// =====================================================================
const ORBIT = fs.readFileSync(__dirname + '/orbit_f3.png');
const F3 = base({
  file: 'F3_Geography_Seq2_2026-2027.docx', title: 'Form Three Geography – Second Sequence', cls: 'FORM THREE', module: '1',
  teacher: 'Mme ASTHA Noura  and  Mr KAMDEM Emmanuel',
  competence: 'Learners are able to explain the effects of the movements of the Earth and to calculate time differences.',
  instructions: ['Answer ALL questions on this question paper. Calculators are allowed.', 'In Section I, mark an (X) on the letter of the correct answer.'],
  body: [
    Hc('PART ONE: VERIFICATION OF RESOURCES (9 marks)'),
    H('Section I: Multiple Choice Questions (10 × 0.5 = 5 marks)'),
    mcqRows([
      ['The Earth rotates on its axis from:', ['South to north', 'North to south', 'West to east', 'East to west']],
      ['The Earth completes one full rotation in approximately:', ['12 hours', '24 hours', '365 days', '30 days']],
      ['The apparent deflection of winds and ocean currents caused by the rotation of the Earth is called the:', ['Albedo effect', 'Greenhouse effect', 'Doppler effect', 'Coriolis effect']],
      ['In the northern hemisphere, the Coriolis effect deflects moving objects to the:', ['South only', 'Left', 'Right', 'North only']],
      ['The axis of the Earth is tilted from the vertical (the perpendicular to the plane of its orbit) at an angle of approximately:', ['23.5°', '45°', '66.5°', '90°']],
      ['Which of the following is NOT an effect of the rotation of the Earth?', ['Tidal bulges influenced by the rotation', 'The four seasons', 'Day and night', 'The deflection of winds and currents']],
      ['A traveller crossing the International Date Line from west to east on Monday 10 March will find that the date becomes:', ['Tuesday 11 March', 'Sunday 9 March', 'Monday 10 March', 'Monday 17 March']],
      ['The International Date Line is drawn mainly through the Pacific Ocean because:', ['The Pacific has the strongest currents', 'Greenwich lies in the Pacific', 'The Pacific is the warmest ocean', 'Few people and countries live along the 180° meridian there']],
      ['Which statement about great circles is NOT correct?', ['They divide the Earth into two equal halves', 'The shortest distance between two places lies along a great circle', 'All parallels of latitude are great circles', 'The Equator is a great circle']],
      ['Identify the pair of longitudes that forms a great circle.', ['145° East and 35° East', '120° East and 60° East', '120° West and 60° West', '120° East and 60° West']],
    ]),
    H('Section II: Structural Questions (4 marks)'),
    P('**1.** Study the diagram below, which shows the Earth at four positions A, B, C and D in its orbit round the Sun, then complete the table with the approximate date and the season experienced in the **northern hemisphere** at each position. **(4 × 0.5 = 2 marks)**', { line: 300, after: 40 }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 40, after: 40 }, children: [new ImageRun({ type: 'png', data: ORBIT, transformation: { width: 330, height: 197 } })] }),
    completeTable([1500, 4000, 4966], ['Position', 'Approximate date', 'Season in the northern hemisphere'], [['A', '', ''], ['B', '', ''], ['C', '', ''], ['D', '', '']], 620),
    P('**2.** An aeroplane leaves Douala (standard time GMT + 1) on Monday at 23:30 and flies to New York (standard time GMT − 5). The flight takes 8 hours.', { before: 160, line: 300, after: 40, keepNext: true }),
    ...calc('a', 'Calculate the time difference between Douala and New York.', '0.5 mark'),
    ...calc('b', 'What is the time in New York when the aeroplane leaves Douala?', '0.5 mark'),
    ...calc('c', 'Calculate the time and the day on which the aeroplane lands in New York (New York time). Show your working.', '1 mark'),
    new Paragraph({ pageBreakBefore: true, spacing: { after: 80 }, keepNext: true, alignment: AlignmentType.CENTER, children: runs('**PART TWO: VERIFICATION OF COMPETENCES (9 marks)**') }),
    situation('Your cousin in Douala wants to telephone his business partner in New York during the partner’s normal working hours (9:00 am to 5:00 pm). He once called at 8:00 pm Cameroon time and was told that it was still the afternoon in New York. He asks the Geography Club to find, by calculation, the best time to call.'),
    P('', { after: 60 }),
    documents(
      { title: 'Document 1: Standard time zones (practical work sheet)', text: ['Douala (Cameroon): GMT + 1', 'London: GMT', 'New York: GMT − 5', 'Tokyo: GMT + 9'] },
      { title: 'Document 2: Extract from an encyclopaedia', text: 'New York is home to Wall Street, one of the largest financial centres in the world, and its subway system carries millions of passengers every day.' }),
    P('**Perform the following tasks:**', { before: 120, after: 0 }),
    ...task(1, 'Present the problem raised in the situation above.', '3 marks', 3),
    ...task(2, 'Using Document 1, explain why the time in New York differs from the time in Douala, and state the number of hours of the difference.', '3 marks', 3),
    ...task(3, 'Suggest a convenient time (in Cameroon time) at which your cousin can call New York during working hours, and justify your answer.', '3 marks', 3),
    P('**Presentation: 2 marks**', { before: 160, align: AlignmentType.RIGHT }),
  ],
});

// =====================================================================
// FORM FOUR ARTS: 35 MCQs only (wave action on coasts, coastal management, wind action in deserts), taken from the pages given by the teachers
// =====================================================================
// [question, [options], index of the correct answer]
const Q4 = [
  ['The wearing away of a coastline by the sheer force of waves striking the rock is called:', ['Attrition', 'Corrasion', 'Hydraulic action', 'Solution'], 2],
  ['The wearing away of a coastline by rock fragments carried by waves grinding against it is called:', ['Hydraulic action', 'Attrition', 'Solution', 'Corrasion (abrasion)'], 3],
  ['The process by which rock fragments carried by waves wear each other down into smaller, rounder pieces is called:', ['Solution', 'Hydraulic action', 'Corrasion', 'Attrition'], 3],
  ['A steep rock face formed by wave erosion along a coastline is called a:', ['Sea cliff', 'Tombolo', 'Bar', 'Spit'], 0],
  ['The gently sloping rock platform found at the base of a sea cliff, exposed at low tide, is called a:', ['Arch', 'Bay', 'Stack', 'Wave-cut platform'], 3],
  ['A tall column of rock isolated from the mainland by wave erosion is called a:', ['Stack', 'Arch', 'Spit', 'Cave'], 0],
  ['An opening eroded right through a headland, joining two caves, is called a sea:', ['Arch', 'Cliff', 'Platform', 'Stack'], 0],
  ['Study the following list: (1) Hydraulic action (2) Deflation (3) Attrition (4) Saltation (5) Corrasion. Select the answer that gives only processes of wave erosion:', ['1, 3 and 5', '1, 2 and 4', '2, 4 and 5', '3, 4 and 5'], 0],
  ['A cliff retreats at an average rate of 0.4 m per year. How far will it retreat in 25 years?', ['0.1 m', '1.0 m', '10 m', '100 m'], 2],
  ['An accumulation of sand and shingle deposited along a shoreline by wave action is called a:', ['Cave', 'Beach', 'Cliff', 'Stack'], 1],
  ['A long, narrow ridge of sand or shingle projecting from the coast into the sea, often with a curved (hooked) end, is called a:', ['Cliff', 'Wave-cut platform', 'Arch', 'Spit'], 3],
  ['A ridge of sand or shingle connecting two areas of land or partially blocking the entrance to a bay is called a:', ['Bar', 'Headland', 'Cave', 'Stack'], 0],
  ['A bar that connects an island to the mainland is specifically called a:', ['Delta', 'Levee', 'Spit', 'Tombolo'], 3],
  ['Spits and bars are mainly built up by the process of:', ['Longshore drift depositing material', 'River flooding only', 'Volcanic eruption', 'Wave erosion'], 0],
  ['A shallow body of water partly cut off from the sea by a bar or spit is called a:', ['Lagoon', 'Fjord', 'Delta', 'Estuary only'], 0],
  ['The material deposited to form beaches, spits and bars is mainly:', ['Magma', 'Volcanic ash', 'Ice', 'Sand and shingle transported by waves and currents'], 3],
  ['Beaches are considered valuable to man mainly because they:', ['Cause constant flooding', 'Are always dangerous to settle near', 'Support tourism and recreation', 'Prevent all fishing activities'], 2],
  ['Study the following list: (i) Spit (ii) Stack (iii) Bar (iv) Wave-cut platform (v) Tombolo. Select the answer that gives only depositional features of wave action:', ['(ii), (iii) and (iv)', '(i), (ii) and (iv)', '(ii), (iv) and (v)', '(i), (iii) and (v)'], 3],
  ['Which of the following is an economic benefit of coastal areas shaped by wave action?', ['Tourism based on beaches', 'Permanent flooding of all settlements', 'Destruction of all farmland', 'Complete absence of fishing activity'], 0],
  ['Which of the following is a hazard associated with coastal areas?', ['Abundant freshwater everywhere', 'Coastal erosion damaging property', 'Absence of storms', 'Permanent fertile soils only'], 1],
  ['A wall built parallel to the shore to absorb and reduce the force of waves is called a:', ['Sea wall', 'Levee', 'Spit', 'Groyne'], 0],
  ['A wooden or stone barrier built perpendicular to the shore to trap sand and reduce longshore drift is called a:', ['Sea wall', 'Groyne', 'Tombolo', 'Breakwater offshore only'], 1],
  ['Rising sea levels linked to climate change pose which major threat to low-lying coastal settlements?', ['Immediate drought', 'Volcanic eruption', 'Guaranteed protection from erosion', 'Increased risk of flooding and land loss'], 3],
  ['Mangrove forests along tropical coastlines help to protect the coast mainly by:', ['Reducing wave energy and stabilising the shoreline', 'Attracting more storms', 'Causing more erosion', 'Increasing wave energy'], 0],
  ['One sustainable strategy for managing coastal erosion is to:', ['Remove all vegetation along the coast', 'Ignore rising sea levels', 'Combine hard engineering (sea walls) with soft measures (mangrove planting)', 'Build unrestricted settlements on unstable cliffs'], 2],
  ['Study the following list: (1) Sea wall (2) Groyne (3) Mangrove planting (4) Rip-rap (5) Beach nourishment. Select the answer that gives only soft (natural) methods of coastal protection:', ['1 and 2', '3 and 5', '2 and 4', '1 and 4'], 1],
  ['A region with an average annual rainfall below 250 mm is generally classified as a:', ['Tropical rainforest', 'Desert', 'Tundra', 'Savanna'], 1],
  ['The removal of loose sand and dust by wind, leaving behind a stony surface, is called:', ['Deposition', 'Deflation', 'Saltation', 'Abrasion'], 1],
  ['The wearing away of rock surfaces by wind-blown sand grains rubbing against them is called:', ['Deflation', 'Solution', 'Abrasion (corrasion)', 'Saltation'], 2],
  ['A mushroom-shaped rock formed by wind abrasion, which erodes the base more than the top, is called a:', ['Inselberg', 'Rock pedestal (zeugen)', 'Barchan', 'Yardang'], 1],
  ['A long, streamlined ridge of rock carved by wind abrasion and aligned parallel to the prevailing wind direction is called a:', ['Yardang', 'Seif dune', 'Rock pedestal', 'Barchan'], 0],
  ['An isolated hill or small mountain rising abruptly from a flat desert plain is called an:', ['Inselberg', 'Yardang', 'Oasis', 'Wadi'], 0],
  ['A desert landscape that has been stripped of its fine sand and left covered mainly with pebbles and gravel is called a:', ['Reg (stony desert)', 'Erg (sand desert)', 'Oasis', 'Wadi'], 0],
  ['Which of the following statements about barchan dunes is NOT correct?', ['They are crescent-shaped', 'Their horns point downwind', 'They move slowly in the direction of the wind', 'Their steep slope faces the wind'], 3],
  ['A barchan dune moves forward at 15 m per year. How long will it take to reach a road 600 m away?', ['4 years', '25 years', '40 years', '90 years'], 2],
];
// Form 4 Arts and Science: 20 questions of physical geography (taken from the teachers' pages) + 15 of human geography (agriculture, from the Form 4 syllabus)
const PHYS = [0, 1, 3, 5, 7, 10, 12, 13, 14, 17, 20, 21, 23, 24, 25, 27, 28, 29, 33, 34].map((i) => Q4[i]);
const HUM = [
  ['Climate-smart agriculture is a type of farming that:', ['Uses only traditional tools and no new ideas', 'Raises production, adapts to climate change and reduces greenhouse gas emissions', 'Is practised only in cold regions', 'Aims only at exporting crops'], 1],
  ['Which of the following is NOT one of the three pillars of climate-smart agriculture?', ['Productivity', 'Adaptation', 'Mitigation', 'Mechanisation of all farms'], 3],
  ['Which of the following techniques of climate-smart agriculture helps farmers to save water?', ['Zaï pits and water harvesting', 'Burning the bush', 'Felling the forest', 'Overgrazing'], 0],
  ['Which of the following products brings foreign currency to Cameroon?', ['Cocoa, coffee and cotton', 'Cassava, yams and plantains grown for the family', 'Firewood', 'Sand from the rivers'], 0],
  ['Agriculture contributes to the economy of Cameroon mainly because it:', ['Employs most of the working population', 'Produces only for the farmers’ families', 'Has no link with industries', 'Is practised only by the state'], 0],
  ['In the long term, agriculture helps industrialisation because it:', ['Replaces all factories', 'Supplies raw materials to agro-industries such as SOSUCAM and SOCAPALM', 'Reduces the number of jobs', 'Stops the export of products'], 1],
  ['The dependence of Cameroon on exports of raw agricultural products makes the incomes of farmers unstable because:', ['The world prices of these products fall and rise', 'Farmers do not produce enough cassava', 'There are no roads in the country', 'Cocoa is not sold abroad'], 0],
  ['The Green Revolution is:', ['The planting of trees in towns', 'The great increase in food production since the 1960s through science and new inputs', 'The return to traditional farming', 'A political movement against farming'], 1],
  ['Which of the following is a characteristic of the Green Revolution?', ['High-yielding varieties of rice, wheat and maize', 'The use of seeds without selection', 'The refusal of fertilisers', 'Farming without water'], 0],
  ['One advantage of the Green Revolution is that:', ['It increased yields and reduced hunger and famine in Asia', 'It stopped all pollution', 'It made inputs cheap for all farmers', 'It was a great success in all African countries'], 0],
  ['One disadvantage of the Green Revolution is that:', ['It reduced yields', 'Chemicals pollute soils and water', 'It needs no inputs', 'It reduced the production of food'], 1],
  ['In a farm seen as a system, which of the following is an input?', ['Harvest', 'Income from the sale', 'Seeds and fertiliser', 'Milk and meat'], 2],
  ['In a farm seen as a system, which of the following is a process?', ['Ploughing, sowing, weeding and harvesting', 'Land and labour', 'Crops and income', 'Capital and water'], 0],
  ['In a farm seen as a system, which of the following is an output?', ['Land', 'Labour', 'Crops, milk and meat', 'Fertiliser'], 2],
  ['In the system of a farm, the part of the profit or of the harvest which is reinvested in the farm is called:', ['An input only', 'Feedback', 'A process', 'Waste'], 1],
];
const ALL = PHYS.concat(HUM);
// spread the correct letters evenly: the correct option is swapped with the option at the target place (lists of numbers keep their order)
const TARGET = [1, 3, 2, 0, 2, 3, 0, 1, 2, 0, 3, 1, 0, 2, 1, 3, 0, 2, 3, 1, 0, 3, 2, 1, 3, 0, 2, 3, 1, 2, 0, 3, 1, 2, 0];
let ti = 0;
ALL.forEach((q) => { const t = TARGET[ti++]; if (q[1].some((o) => /^[\d(]/.test(o))) return; const c = q[2]; [q[1][c], q[1][t]] = [q[1][t], q[1][c]]; q[2] = t; });
const F4 = base({
  file: 'F4_Geography_Seq2_2026-2027.docx', title: 'Form Four Arts and Science Geography – Second Sequence', cls: 'FORM FOUR ARTS AND SCIENCE', module: '2',
  teacher: 'Mme ASTHA Noura  and  Mr KAMDEM Emmanuel',
  competence: 'Learners are able to explain the action of waves and of the wind on the landscape and to manage agricultural resources for development.',
  instructions: ['Answer ALL the 35 questions.', 'In the table below, draw a horizontal line on the letter with the correct answer.'],
  body: [
    H('MULTIPLE CHOICE QUESTIONS: Physical Geography (questions 1 to 20) and Human Geography (questions 21 to 35)'),
    P('35 questions × 1 mark = 35 marks, converted to 20 marks.', { italics: true, size: 21, after: 80 }),
    (() => { const cw = Array(5).fill(2093); const rows = [];
      for (let r = 0; r < 7; r++) rows.push(new TableRow({ children: cw.map((w, c) => { const n = r * 5 + c + 1; return cell(P(`**${String(n).padStart(2, '0')}**  [A] [B] [C] [D]`, { after: 0, size: 21, align: AlignmentType.CENTER }), w); }) }));
      return new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: cw, borders: BOX, rows }); })(),
    P('', { after: 120 }),
    mcqRows(ALL.map((q) => [q[0], q[1]]), true),
  ],
});
FOURKEY = ALL.map((q, i) => `${i + 1}${'ABCD'[q[2]]}`).join(' ');
if (process.env.KEY) console.log(FOURKEY);

(async () => { for (const x of [F1, F2, F3, F4]) await build(x); })();
