// Marking guide, Upper Sixth Arts (A2), Population Geography, first sequence 2026-2027 (questions written by the teacher on the board).
const fs = require('fs');
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, AlignmentType, WidthType, BorderStyle, ShadingType, VerticalAlign, Footer, PageNumber } = require('docx');
const OUT = process.argv[2] || '.';
const FONT = 'Times New Roman', W = 10466;
const ln = { style: BorderStyle.SINGLE, size: 4, color: '808080' };
const BOX = { top: ln, bottom: ln, left: ln, right: ln, insideHorizontal: ln, insideVertical: ln };
const runs = (t, o = {}) => String(t).split(/(\*\*[^*]+\*\*)/).filter(Boolean).map((s) => new TextRun({ text: s.startsWith('**') ? s.slice(2, -2) : s, bold: s.startsWith('**') || o.bold, italics: o.italics, font: FONT, size: (o.size || 22), color: o.color }));
const P = (t, o = {}) => new Paragraph({ alignment: o.align, keepNext: o.keepNext, spacing: { before: o.before || 0, after: o.after === undefined ? 50 : o.after }, indent: o.left ? { left: o.left } : undefined, children: runs(t, o) });
const cell = (t, w, o = {}) => new TableCell({ width: { size: w, type: WidthType.DXA }, margins: { top: 40, bottom: 40, left: 80, right: 80 }, verticalAlign: VerticalAlign.CENTER,
  shading: o.shade ? { fill: o.shade, type: ShadingType.CLEAR, color: 'auto' } : undefined, children: [].concat(t).map((x) => P(x, { after: 20, size: 21, bold: o.bold, align: o.align })) });
const split = (r) => { const m = String(r[2]).match(/^(.*) = \*\*(.+)\*\*$/); return m ? [r[0], r[1], m[1], '**' + m[2] + '**'] : [r[0], r[1], '', '**' + r[2] + '**']; };
const tbl = (widths, head, rows, total) => new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: widths, borders: BOX,
  rows: [new TableRow({ tableHeader: true, children: ['Point', 'Expected answer', 'Mark breakdown', 'Marks'].map((h, i) => cell(h, widths[i], { shade: 'D9E2F3', bold: true, align: i === 3 ? AlignmentType.CENTER : undefined })) }),
    ...rows.map(split).map((r) => new TableRow({ cantSplit: true, children: r.map((c, i) => cell(c, widths[i], { align: i === 3 ? AlignmentType.CENTER : undefined })) })),
    ...(total ? [new TableRow({ children: [cell('**Total**', widths[0], { shade: 'F2F2F2' }), cell('', widths[1], { shade: 'F2F2F2' }), cell('', widths[2], { shade: 'F2F2F2' }), cell('**' + total + '**', widths[3], { shade: 'F2F2F2', align: AlignmentType.CENTER })] })] : [])] });
const H = (t) => P('**' + t + '**', { before: 160, after: 60, size: 24, keepNext: true, color: '1F3864' });
const WD = [1300, 5500, 2700, 966];

const body = [
  P('**GBHS GAROUA – GEOGRAPHY DEPARTMENT**', { align: AlignmentType.CENTER, size: 22, after: 20 }),
  P('**MARKING GUIDE – UPPER SIXTH ARTS (A2) – POPULATION GEOGRAPHY**', { align: AlignmentType.CENTER, size: 28, after: 20, color: '1F3864' }),
  P('First Sequence Evaluation, School Year 2026-2027  •  Marks: 20  •  Teacher: Mr KAMDEM Emmanuel', { align: AlignmentType.CENTER, size: 19, italics: true, after: 60 }),
  P('Distribution of marks: Question 1 = 8 marks (1a: 4; 1b: 4) • Question 2 = 7 marks • Question 3 = 5 marks = **20 marks**. Accept any other correct point, with an example or a figure from the lessons.', { size: 20, after: 40 }),

  H('QUESTION 1 (8 marks)'),
  P('**1a) Define census and sample survey (4 marks)**', { after: 40 }),
  tbl(WD, ['Term', 'Expected answer', 'Marks'], [
    ['Census', 'A census is the **complete official count of all the people** of a country or region **at a given time**. It records their age, sex, marital status, education, occupation and residence. It is normally held **every ten years** (Cameroon: 1976, 1987 and 2005, organised by BUCREP).', 'Definition (complete count of all the people at a given time): 1.5 • One extra detail (every ten years, content recorded or example): 0.5 = **2**'],
    ['Sample survey', 'A sample survey is the **collection of data from a small part of the population, chosen to represent the whole**; the results are then extended to the whole population. It is cheaper and faster than a census (examples: Demographic and Health Surveys, household surveys of the National Institute of Statistics).', 'Definition (small representative part, results extended to the whole): 1.5 • One extra detail (cost, speed, random sampling or example): 0.5 = **2**'],
  ], '4'),
  P('', { after: 40 }),
  P('**1b) Distinguish between the de facto and the de jure methods of counting people in a census (4 marks)**', { after: 40 }),
  tbl(WD, ['Method', 'Expected answer', 'Marks'], [
    ['De facto', 'People are counted **where they are found on census night**, even if they are only visiting. Example: a Garoua trader sleeping in Douala on census night is counted in Douala. Weakness: the population of towns and markets can be overestimated.', 'Definition (where found on census night): 1 • Example or weakness: 1 = **2**'],
    ['De jure', 'People are counted **at their usual place of residence**, wherever they are on census night. Example: the same trader is counted in Garoua. It is the method used in Cameroon and in the USA. Weakness: it is difficult to decide where homeless people or people with two homes usually live.', 'Definition (usual place of residence): 1 • Example or weakness: 1 = **2**'],
  ], '4'),
  P('The question says “distinguish”: the candidate must show the difference between the two methods. Two correct definitions with no contrast, no example and no link to census night: maximum 1.5 out of 4.', { size: 19, italics: true, before: 40 }),

  H('QUESTION 2 (7 marks)'),
  P('**Describe how the world population is unevenly distributed according to latitude, altitude and distance from the sea.**', { after: 40 }),
  tbl(WD, ['Point', 'Expected answer', 'Marks'], [
    ['Introduction', 'The world population is **very unevenly distributed**: a few regions are crowded while large areas are almost empty (the non-ecumene: Antarctica, Greenland, the Sahara, high mountains).', '1'],
    ['Latitude', 'About **90 % of people live in the northern hemisphere**, mostly between **20° N and 60° N** (temperate and sub-tropical areas: Europe, East and South Asia, North America). The southern hemisphere has more ocean and less land. Very cold polar areas and very hot, dry desert areas are almost empty.', 'Hemisphere or belt of 20° N–60° N with figure: 1 • Explanation or empty areas: 1 = **2**'],
    ['Altitude', 'Density **generally falls with altitude**: about **56 % of people live below 200 m** and about four-fifths below 500 m, because high land is cold, steep and has poor soils. In the tropics, however, **cool, healthy highlands are densely populated** (Western Highlands of Cameroon, Bamenda Highlands, Ethiopian Highlands).', 'General trend with figure: 1 • Tropical exception with example: 1 = **2**'],
    ['Distance from the sea', 'About **two-thirds of the world population live within 500 km of the sea**: coasts attract people for ports, trade, fishing and a mild climate (Douala, Lagos, Abidjan). Areas far inland are less populated (continentality): the interior of the Sahara and of Central Africa is thinly populated.', 'Coastal concentration with figure: 1 • Thin interior with example: 1 = **2**'],
  ], '7'),
  P('Accept equivalent figures given in class. Do not give the marks of a factor which is only named; it must be described.', { size: 19, italics: true, before: 40 }),

  H('QUESTION 3 (5 marks)'),
  P('**Explain how a Lorenz curve shows the unevenness of population distribution.**', { after: 40 }),
  tbl(WD, ['Point', 'Expected answer', 'Marks'], [
    ['What it is', 'The Lorenz curve is a **graph comparing the cumulative percentage of population with the cumulative percentage of area**.', '1'],
    ['Construction', 'The areas (regions, divisions or countries) are **ranked from the least to the most densely populated**; their percentages of population and of area are **added up** (cumulated). The **cumulative % of population is plotted on the vertical axis against the cumulative % of area on the horizontal axis**.', 'Ranking of the areas: 1 • Cumulative percentages on the two axes: 1 = **2**'],
    ['Reading', 'The **diagonal line shows a perfectly even distribution** (each part of the area has the same share of population). **The further the curve lies from the diagonal, the more uneven the distribution** (for example, when most of the people live on a small part of the area). A curve close to the diagonal means a fairly even distribution.', 'Diagonal = even distribution: 1 • Distance from the diagonal = unevenness: 1 = **2**'],
  ], '5'),
  P('A neat Lorenz curve drawn and labelled (axes, diagonal, curve) can replace the description of the construction: give the marks of that point. A candidate who explains the curve without saying that it is compared with the diagonal cannot have more than 3 out of 5.', { size: 19, italics: true, before: 40 }),

  P('**TOTAL: 8 + 7 + 5 = 20 marks**', { align: AlignmentType.CENTER, size: 24, before: 160, color: '9B1B1B' }),
  P('Source: Population Geography, Upper Sixth Arts: Lesson 1 (Sources of Population Data), Lesson 2 (Population Distribution and Density), Practical Work 1 (Techniques of Mapping Population Distribution and Density).', { size: 18, italics: true, align: AlignmentType.CENTER, before: 60 }),
];
const doc = new Document({ styles: { default: { document: { run: { font: FONT, size: 22 } } } },
  sections: [{ properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 800, bottom: 800, left: 720, right: 720 } } },
    footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'GBHS Garoua – Upper Sixth Arts – Population Geography – Marking guide, first sequence 2026-2027 – Page ', font: FONT, size: 16 }), new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 16 })] })] }) },
    children: body }] });
Packer.toBuffer(doc).then((b) => { fs.writeFileSync(OUT + '/USA_Population_Geography_Marking_Guide_Seq1_2026-2027.docx', b); console.log('ok'); });
