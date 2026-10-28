// Marking guides, DGCAST first sequence 2026-2027: Form 1, Form 2, Form 2 Technical, Form 4 (papers actually used)
const fs = require('fs');
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, AlignmentType, WidthType, BorderStyle, ShadingType, VerticalAlign, Footer, PageNumber } = require('docx');
const OUT = process.argv[2] || '.';
const FONT = 'Times New Roman', W = 10466;
const ln = { style: BorderStyle.SINGLE, size: 4, color: '808080' };
const BOX = { top: ln, bottom: ln, left: ln, right: ln, insideHorizontal: ln, insideVertical: ln };
const runs = (t, o = {}) => String(t).split(/(\*\*[^*]+\*\*)/).filter(Boolean).map((s) => new TextRun({ text: s.startsWith('**') ? s.slice(2, -2) : s, bold: s.startsWith('**') || o.bold, italics: o.italics, font: FONT, size: o.size || 22, color: o.color }));
const P = (t, o = {}) => new Paragraph({ alignment: o.align, keepNext: o.keepNext, spacing: { before: o.before || 0, after: o.after === undefined ? 50 : o.after }, children: runs(t, o) });
const cell = (t, w, o = {}) => new TableCell({ width: { size: w, type: WidthType.DXA }, margins: { top: 40, bottom: 40, left: 80, right: 80 }, verticalAlign: VerticalAlign.CENTER,
  shading: o.shade ? { fill: o.shade, type: ShadingType.CLEAR, color: 'auto' } : undefined, children: [].concat(t).map((x) => (typeof x === 'string' ? P(x, { after: 0, size: 21, bold: o.bold, align: o.align }) : x)) });
const tbl = (widths, head, rows) => new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: widths, borders: BOX,
  rows: [new TableRow({ tableHeader: true, children: head.map((h, i) => cell(h, widths[i], { shade: 'D9E2F3', bold: true })) }),
    ...rows.map((r) => new TableRow({ cantSplit: true, children: r.map((c, i) => cell(c, widths[i], { align: i === 0 || i === widths.length - 1 ? AlignmentType.CENTER : undefined })) }))] });
const H = (t) => P('**' + t + '**', { before: 160, after: 60, size: 24, keepNext: true, color: '1F3864' });
const NOTE = (t) => P(t, { size: 19, italics: true, before: 40 });

const mcqTable = (rows) => tbl([800, 5866, 3000, 800], ['N°', 'Question', 'Correct answer', 'Marks'], rows);
const gridTable = (first, rows) => tbl([800, 5266, 3600, 800], [first, 'Expected answer', 'Marking', 'Marks'], rows);
const presentation = () => [H('PRESENTATION (2 marks)'), tbl([6000, 3666, 800], ['Criterion', 'Marking', 'Marks'], [
  ['Neat paper, legible handwriting, answers written in the spaces provided', '1 mark if clean and legible; ½ mark if partly', '1'],
  ['Correct spelling and complete sentences', '1 mark if few errors; ½ mark if many', '1']])];

function guide(x) {
  const body = [
    P('**DIVINE GRACE COLLEGE OF ARTS, SCIENCE AND TECHNOLOGY (DGCAST) – GAROUA**', { align: AlignmentType.CENTER, size: 22, after: 20 }),
    P('**MARKING GUIDE – ' + x.cls + ' GEOGRAPHY**', { align: AlignmentType.CENTER, size: 30, after: 20, color: '1F3864' }),
    P('First Sequence Evaluation, School Year 2026-2027  •  Duration: 1 hour  •  Marks: 20  •  Facilitator' + (x.fac2 ? 's' : '') + ': Mr KAMDEM Emmanuel' + (x.fac2 ? ' – ' + x.fac2 : ''), { align: AlignmentType.CENTER, size: 19, italics: true, after: 60 }),
    ...x.body,
  ];
  const doc = new Document({ styles: { default: { document: { run: { font: FONT, size: 22 } } } },
    sections: [{ properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 500, bottom: 560, left: 720, right: 720 } } },
      footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `DGCAST Garoua – Geography – ${x.cls} – Marking guide, First Sequence 2026-2027 – Page `, font: FONT, size: 16 }), new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 16 })] })] }) },
      children: body }] });
  return Packer.toBuffer(doc).then((b) => { fs.writeFileSync(OUT + '/' + x.file, b); console.log('ok', x.file); });
}
const T3 = [P('Distribution of marks: Part One 9 marks (Section I: 5; Section II: 4) • Part Two 9 marks (3 tasks × 3) • Presentation 2 marks = **20 marks**.', { size: 20, after: 40 })];
const K = (n, q, a) => [String(n), q, a, '0.5'];

// ---------------------------------------------------------------- FORM ONE
const F1 = { file: 'DGCAST_F1_Marking_Guide_Seq1_2026-2027.docx', cls: 'FORM ONE', body: [...T3,
  H('PART ONE: VERIFICATION OF RESOURCES (9 marks)'), H('Section I: Multiple Choice Questions (10 × 0.5 = 5 marks)'),
  mcqTable([
    K(1, 'The study of the Earth, its features and the people who live on it', 'B: Geography'),
    K(2, 'Branch that studies relief, climate, rivers and soils', 'C: physical geography'),
    K(3, 'Population and settlement geography belong to', 'B: human geography'),
    K(4, 'Method to collect information directly from people', 'A: questionnaires and interviews'),
    K(5, 'From the Sun, the Earth is the …', 'C: third planet'),
    K(6, 'Water covers about … of the Earth’s surface', 'C: 71 %'),
    K(7, 'The largest ocean', 'C: Pacific Ocean'),
    K(8, 'A round model of the Earth', 'B: globe'),
    K(9, 'Part of a map that explains the signs and colours', 'C: key (legend)'),
    K(10, 'Latitude and longitude of a place are its …', 'B: geographical coordinates')]),
  NOTE('No half-mark for a wrong answer; two letters marked for one question = 0.'),
  H('Section II: Structural Questions (4 marks)'),
  gridTable('N°', [
    ['1', 'Real distance = 7 cm × 20 km = **140 km**.', 'Method (7 × 20): 1 mark. Answer with unit (140 km): 1 mark.', '2'],
    ['2', 'Any two differences: a globe is a round model of the Earth, a map is a flat drawing; a globe shows the whole Earth at once, a map shows the whole Earth or only part of it; a globe shows true shapes and distances, a map distorts them; a globe is not easy to carry, a map is easy to carry and to draw.', '1 mark per difference (both sides stated), up to 2.', '2']]),
  H('PART TWO: VERIFICATION OF COMPETENCES (9 marks)'),
  gridTable('Task', [
    ['1', 'Aïcha **does not understand the signs, colours and numbers on the map**, so she cannot find Maroua nor know how far it is from Garoua.', 'Problem identified (she cannot read the map): 2 marks. Consequence (cannot find Maroua / the distance): 1 mark.', '3'],
    ['2', 'Using Document 1, any three: the **title** (tells what the map shows); the **key** (explains the signs and colours); the **scale** (calculates real distances); the **north arrow** (shows directions); the **lines of latitude and longitude** (locate places).', '1 mark per element with its use, up to 3 (1½ for the element only is not accepted).', '3'],
    ['3', 'Any three: read the key to understand the signs and colours; use the latitude and longitude (coordinates) to locate Maroua; use the scale and a ruler to measure and calculate the distance; use the north arrow to find the direction (Maroua is north of Garoua); ask the teacher or an adult / use an atlas.', '1 mark per valid proposal, up to 3.', '3']]),
  NOTE('Document 2 (a cattle market) is a distractor: a candidate who uses it receives no mark for that point.'),
  ...presentation(), P('**Total: 5 + 4 + 9 + 2 = 20 marks.**', { before: 120 })] };

// ---------------------------------------------------------------- FORM TWO
const F2 = { file: 'DGCAST_F2_Marking_Guide_Seq1_2026-2027.docx', cls: 'FORM TWO', body: [...T3,
  H('PART ONE: VERIFICATION OF RESOURCES (9 marks)'), H('Section I: Multiple Choice Questions (10 × 0.5 = 5 marks)'),
  mcqTable([
    K(1, 'The number of people living in a place at a given time', 'A: population'),
    K(2, 'Natural growth is the difference between …', 'A: births and deaths'),
    K(3, 'Until about 1800 the world population was below …', 'A: 1 billion'),
    K(4, 'The world population passed 8 billion in …', 'D: 2022'),
    K(5, 'A factor of rapid population growth', 'A: a falling death rate'),
    K(6, 'The birth rate is expressed …', 'B: per thousand (‰)'),
    K(7, 'Population density is calculated as …', 'B: population ÷ area'),
    K(8, 'A sparsely populated area', 'C: the Sahara Desert'),
    K(9, 'Region of Cameroon with the lowest density', 'D: the East'),
    K(10, 'People settle near rivers, lakes and coasts mainly because of …', 'A: water')]),
  NOTE('No half-mark for a wrong answer; two letters marked for one question = 0.'),
  H('Section II: Structural Questions (4 marks)'),
  P('Data: 200,000 inhabitants; 7,000 births; 1,600 deaths.', { size: 20, italics: true }),
  gridTable('N°', [
    ['a)', 'Birth rate = (number of births ÷ total population) × 1,000', 'Correct formula: 1 mark.', '1'],
    ['b)', 'Death rate = (number of deaths ÷ total population) × 1,000', 'Correct formula: 1 mark.', '1'],
    ['c)', '7,000 ÷ 200,000 × 1,000 = **35 ‰**', 'Correct result with unit (35 ‰, or 35 per thousand): 1 mark.', '1'],
    ['d)', '1,600 ÷ 200,000 × 1,000 = **8 ‰**', 'Correct result with unit (8 ‰, or 8 per thousand): 1 mark.', '1']]),
  H('PART TWO: VERIFICATION OF COMPETENCES (9 marks)'),
  gridTable('Task', [
    ['1', 'The population of the village has doubled (**rapid population growth**) and puts **pressure on resources**: farms are smaller, soils are poor, trees are cut for firewood and the well dries up.', 'Rapid population growth: 2 marks. Pressure on resources / one effect quoted from the situation: 1 mark.', '3'],
    ['2', 'Using Document 1: **early marriage** (many girls marry before 18); **high fertility** (about six children per woman); **falling death rate** thanks to the health centre and vaccination.', '1 mark per cause from the document, up to 3.', '3'],
    ['3', 'Any three: family planning and education on the number of children; keep girls in school and delay marriage; plant trees (reforestation); improve farming (fertilizer, improved seeds, irrigation); build boreholes and wells; use other sources of energy (gas, solar); create jobs outside farming.', '1 mark per valid solution that protects the resources of the village, up to 3.', '3']]),
  NOTE('Document 2 (the Indomitable Lions) is a distractor: a candidate who uses it receives no mark for that point.'),
  ...presentation(), P('**Total: 5 + 4 + 9 + 2 = 20 marks.**', { before: 120 })] };

// ---------------------------------------------------------------- FORM TWO TECHNICAL
const F2T = { file: 'DGCAST_F2T_Marking_Guide_Seq1_2026-2027.docx', cls: 'FORM TWO TECHNICAL', body: [...T3,
  H('PART ONE: VERIFICATION OF RESOURCES (9 marks)'), H('Section I: Multiple Choice Questions (10 × 0.5 = 5 marks)'),
  mcqTable([
    K(1, 'The equatorial region lies between about …', 'A: 5° N and 5° S'),
    K(2, 'An equatorial region', 'B: the Congo Basin'),
    K(3, 'Average temperature of the equatorial region', 'C: 27 °C (nearest option; the lessons give 23 to 25 °C)'),
    K(4, 'Annual rainfall of the equatorial region', 'C: above 1,500 mm'),
    K(5, 'Annual range of temperature', 'A: very small (2 to 3 °C)'),
    K(6, 'Washing down of soil nutrients by heavy rain', 'A: leaching'),
    K(7, 'The equatorial forest is evergreen because …', 'A: its trees shed their leaves at different times'),
    K(8, 'A hardwood of the equatorial forest', 'B: mahogany'),
    K(9, 'A human activity of the equatorial region', 'A: lumbering'),
    K(10, 'A problem of the equatorial region', 'A: deforestation')]),
  NOTE('No half-mark for a wrong answer; two letters marked for one question = 0. Question 3: the option “27 °C” is the nearest to the real value (23 to 25 °C); it is the only acceptable answer.'),
  H('Section II: Structural Questions (4 marks)'),
  gridTable('N°', [
    ['a)', 'The wettest month is **October** (290 mm).', 'Correct month: 1 mark.', '1'],
    ['b)', 'Any two characteristics shown by the figures: **hot all year** (22 to 25 °C); **very small annual range of temperature** (25 − 22 = 3 °C); **heavy rainfall** (about 1,515 mm a year); **rain in every month** (no dry month); two peaks of rain (May and October).', 'For each characteristic: 1 mark for the characteristic and ½ mark for the figure quoted from the table (1½ × 2 = 3).', '3']]),
  H('PART TWO: VERIFICATION OF COMPETENCES (9 marks)'),
  gridTable('Task', [
    ['1', 'The **equatorial forest is being destroyed (deforestation)** by logging and clearing for farms; animals and medicinal plants become rare and the rains irregular.', 'Deforestation / destruction of the forest: 2 marks. A consequence quoted (rare animals and plants, irregular rains): 1 mark.', '3'],
    ['2', 'Using Document 1, any three: **timber** (logging for export); **new farms**; **firewood and charcoal**; **roads and mines**.', '1 mark per cause from the document, up to 3.', '3'],
    ['3', 'Any three: **reforestation**; creating national parks and protected areas; forest laws and control of logging licences; fighting illegal logging; improved farming that does not need new land (agroforestry, fertilizer); using gas or other energy instead of firewood; educating the population.', '1 mark per valid measure, up to 3.', '3']]),
  NOTE('Document 2 (a photograph unrelated to the forest) is a distractor: a candidate who uses it receives no mark for that point.'),
  ...presentation(), P('**Total: 5 + 4 + 9 + 2 = 20 marks.**', { before: 120 })] };

// ---------------------------------------------------------------- FORM FOUR (paper of Mr TABIT)
const F4 = { file: 'DGCAST_F4_Marking_Guide_Seq1_2026-2027.docx', cls: 'FORM FOUR', fac2: 'Mr TABIT B. Ajong', body: [
  P('Paper marked: the Form 4 paper arranged by Mr TABIT (Section A: Verification of Resources; Section B: Verification of Competency). Marks printed on the paper: MCQ 10, structural question 8, Section B 5, presentation 2.', { size: 20, after: 40 }),
  P('**Please decide before marking:** the printed marks add up to 25. Either mark out of 25 and convert to 20 (× 0.8), or count each MCQ for 0.5 mark (5 marks), which gives exactly 20. The grid below is written for **1 mark per MCQ (10 marks)**; with 0.5 mark per MCQ, halve the MCQ marks.', { size: 20, after: 40 }),
  H('SECTION A (i): MULTIPLE CHOICE QUESTIONS (10 marks)'),
  tbl([800, 5866, 3000, 800], ['N°', 'Question', 'Correct answer', 'Marks'], [
    ['1', 'Soil is formed by physical, chemical and biological processes and is mainly composed of', 'B: mineral particles, organic matter, water and air', '1'],
    ['2', 'Erosion caused mainly by human activities, very fast', 'B: accelerated soil erosion', '1'],
    ['3', 'Cutting a slope into flat steps for cultivation', 'B: terracing', '1'],
    ['4', 'An ecosystem is best described as …', 'B: a natural area where living and non-living components interact', '1'],
    ['5', 'Organisms that make their own food from solar energy', 'B: producers (autotrophs)', '1'],
    ['6', 'Energy transferred from one trophic level to the next', 'C: 10 %', '1'],
    ['7', 'A depositional feature of hot deserts', 'B: barchans', '1'],
    ['8', 'A strategy against water scarcity in hot deserts', 'A: construction of water reservoirs (C “cultivating near oasis” is also arguable: decide before marking)', '1'],
    ['9', 'Relief units of Cameroon EXCEPT …', 'No option is a clear exception (all four are relief units): decide before marking, or give the mark to all candidates', '1'],
    ['10', 'Cameroon is located between latitudes …', 'No option is correct (the right answer, 2° N and 13° N, is not listed): give the mark to all candidates', '1']]),
  NOTE('No half-mark for a wrong answer; two letters marked for one question = 0.'),
  H('SECTION A (ii): STRUCTURAL QUESTION (8 marks)'),
  P('Table 1 (station X): total rainfall = 939 mm; temperature 26 to 33 °C; rain mainly from May to October.', { size: 20, italics: true }),
  gridTable('N°', [
    ['(a)(i)', 'Annual range of temperature = highest − lowest = 33 °C − 26 °C = **7 °C**.', 'Formula or method (highest − lowest): 1 mark. Correct values (33 and 26): 1 mark. Answer with unit (7 °C): 1 mark.', '3'],
    ['(a)(ii)', 'The wettest month is **August** (220 mm).', 'Correct month: 2 marks.', '2'],
    ['(b)', 'The biome is the **tropical wet and dry (savanna) biome**. Reasons (any two): hot all year (26 to 33 °C) with a small annual range (7 °C); one long rainy season (May to October) with about 939 mm of rain; a long dry season (November to April, with almost no rain in December to March).', 'Biome named: 1 mark. Each reason with a figure from the table: 1 mark (up to 2).', '3']]),
  H('SECTION B: VERIFICATION OF COMPETENCY (5 marks)'),
  P('Situation: Mrs Nkwetecha’s yields have dropped and her farm on a hill slope has lost much soil carried by wind and torrential rain.', { size: 20, italics: true }),
  gridTable('Task', [
    ['1', 'The problem is **soil erosion** (loss of the soil by wind and water on her farm), which reduces her yields (loss of soil fertility).', 'Soil erosion named: 1 mark.', '1'],
    ['2', 'Any two causes: farming on a steep slope without protection (ploughing up and down); clearing the plant cover (deforestation, bush fires); heavy rain and strong winds on bare soil; continuous cultivation without rest or manure.', '1 mark per cause, up to 2.', '2'],
    ['3', 'Any two measures: terracing; contour ploughing or strip cultivation; planting trees, windbreaks and cover crops; mulching; crop rotation and manure.', '1 mark per measure, up to 2.', '2']]),
  H('PRESENTATION (2 marks)'),
  tbl([6000, 3666, 800], ['Criterion', 'Marking', 'Marks'], [
    ['Neat paper, legible handwriting, answers written in the spaces provided', '1 mark if clean and legible; ½ mark if partly', '1'],
    ['Correct spelling and complete sentences', '1 mark if few errors; ½ mark if many', '1']]),
  P('**Total printed: 10 + 8 + 5 + 2 = 25 marks (convert to 20 by × 0.8), or 5 + 8 + 5 + 2 = 20 marks with 0.5 mark per MCQ.**', { before: 120 })] };

(async () => { for (const x of [F1, F2, F2T, F4]) await guide(x); })();
