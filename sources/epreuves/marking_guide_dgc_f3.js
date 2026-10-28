// Marking guide, DGCAST Form 3, first sequence 2026-2027 (paper: DGCAST_F3_Geography_Seq1_2026-2027.docx)
const fs = require('fs');
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, AlignmentType, WidthType, BorderStyle, ShadingType, VerticalAlign, Footer, PageNumber } = require('docx');
const OUT = process.argv[2] || '.';
const FONT = 'Times New Roman', W = 10466;
const ln = { style: BorderStyle.SINGLE, size: 4, color: '808080' };
const BOX = { top: ln, bottom: ln, left: ln, right: ln, insideHorizontal: ln, insideVertical: ln };
const runs = (t, o = {}) => String(t).split(/(\*\*[^*]+\*\*)/).filter(Boolean).map((s) => new TextRun({ text: s.startsWith('**') ? s.slice(2, -2) : s, bold: s.startsWith('**') || o.bold, italics: o.italics, font: FONT, size: o.size || 22, color: o.color }));
const P = (t, o = {}) => new Paragraph({ alignment: o.align, keepNext: o.keepNext, spacing: { before: o.before || 0, after: o.after === undefined ? 50 : o.after }, indent: o.left ? { left: o.left } : undefined, children: runs(t, o) });
const cell = (t, w, o = {}) => new TableCell({ width: { size: w, type: WidthType.DXA }, margins: { top: 40, bottom: 40, left: 80, right: 80 }, verticalAlign: VerticalAlign.CENTER,
  shading: o.shade ? { fill: o.shade, type: ShadingType.CLEAR, color: 'auto' } : undefined, children: [].concat(t).map((x) => (typeof x === 'string' ? P(x, { after: 0, size: 21, bold: o.bold, align: o.align }) : x)) });
const tbl = (widths, head, rows) => new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: widths, borders: BOX,
  rows: [new TableRow({ tableHeader: true, children: head.map((h, i) => cell(h, widths[i], { shade: 'D9E2F3', bold: true })) }),
    ...rows.map((r) => new TableRow({ cantSplit: true, children: r.map((c, i) => cell(c, widths[i], { align: i === 0 || i === widths.length - 1 ? AlignmentType.CENTER : undefined })) }))] });
const H = (t) => P('**' + t + '**', { before: 160, after: 60, size: 24, keepNext: true, color: '1F3864' });

const body = [
  P('**DIVINE GRACE COLLEGE OF ARTS, SCIENCE AND TECHNOLOGY (DGCAST) – GAROUA**', { align: AlignmentType.CENTER, size: 22, after: 20 }),
  P('**MARKING GUIDE – FORM THREE GEOGRAPHY**', { align: AlignmentType.CENTER, size: 30, after: 20, color: '1F3864' }),
  P('First Sequence Evaluation, School Year 2026-2027  •  Duration: 1 hour  •  Marks: 20  •  Facilitator: Mr KAMDEM Emmanuel', { align: AlignmentType.CENTER, size: 19, italics: true, after: 60 }),
  P('Distribution of marks: Part One 9 marks (Section I: 5; Section II: 4) • Part Two 9 marks (3 tasks × 3) • Presentation 2 marks = **20 marks**.', { size: 20, after: 40 }),

  H('PART ONE: VERIFICATION OF RESOURCES (9 marks)'),
  H('Section I: Multiple Choice Questions (10 × 0.5 = 5 marks)'),
  tbl([900, 6366, 2200, 1000], ['N°', 'Question', 'Correct answer', 'Marks'], [
    ['1', 'Shape of the Earth', 'C: a sphere slightly flattened at the poles', '0.5'],
    ['2', 'A proof that the Earth is spherical', 'A: ships disappear gradually below the horizon', '0.5'],
    ['3', 'Our galaxy', 'A: the Milky Way', '0.5'],
    ['4', 'The pull of the Moon causes the …', 'A: tides', '0.5'],
    ['5', 'Latitude 0° is called the …', 'B: Equator', '0.5'],
    ['6', 'Longitude 0° is called the …', 'C: Greenwich (Prime) Meridian', '0.5'],
    ['7', 'Which latitude is a great circle?', 'B: the Equator', '0.5'],
    ['8', 'The International Date Line follows the meridian …', 'D: 180°', '0.5'],
    ['9', 'Crossing the International Date Line going west …', 'A: adds one day', '0.5'],
    ['10', 'In geographical coordinates we write first the …', 'B: latitude', '0.5'],
  ]),
  P('No half-mark for a wrong answer; two letters marked for one question = 0.', { size: 19, italics: true, before: 40 }),

  H('Section II: Structural Questions (4 marks)'),
  tbl([900, 5666, 2900, 1000], ['N°', 'Expected answer', 'Marking', 'Marks'], [
    ['1', 'Garoua: about **9° N, 13° E** (accept 9° to 9½° N and 13° to 13½° E, read on the map).', 'Latitude with N: 1 mark. Longitude with E: 1 mark. Latitude must be written first; if the order is reversed or N/E is missing, deduct ½ mark.', '2'],
    ['2', 'Douala: about **4° N, 10° E** (accept 4° N and 9½° to 10° E, read on the map).', 'Latitude with N: 1 mark. Longitude with E: 1 mark. Same rule on order and on N/E.', '2'],
  ]),

  H('PART TWO: VERIFICATION OF COMPETENCES (9 marks)'),
  P('Situation: the fishermen of Lake Lagdo cannot give their exact position to the rescue team because they do not know what latitude and longitude are.', { size: 20, italics: true }),
  tbl([900, 5666, 2900, 1000], ['Task', 'Expected answer', 'Marking', 'Marks'], [
    ['1', 'The fishermen **cannot give their exact position** (their geographical coordinates) to the rescuers, so the rescuers cannot locate them; they do not know what latitude and longitude are.',
      'Problem identified (they cannot give their exact position / do not know the coordinates): 2 marks. Consequence or cause stated (rescuers cannot find them; they ignore latitude and longitude): 1 mark.', '3'],
    ['2', 'Using Document 1: the exact position is given by the **geographical coordinates**. They read **latitude** (distance north or south of the Equator) and **longitude** (distance east or west of the Greenwich Meridian) in degrees on a mobile phone with **GPS**, which shows the place where it is (e.g. about 9° 03′ N, 13° 44′ E near the Lagdo dam); they give the latitude first, then the longitude, to the rescuers.',
      'Use of the phone with GPS: 1 mark. Latitude and longitude (with their meaning or direction): 1 mark. Giving the numbers to the rescuers, latitude first (example from the document): 1 mark.', '3'],
    ['3', 'Any three: learn what latitude and longitude mean; keep a charged phone with GPS (or a GPS device) in the canoe; read and note the coordinates of the fishing area before leaving; carry a map of the lake; give the position to the rescue team at once; tell their families and the port where they will fish.',
      '1 mark per valid proposal, up to 3 (a proposal must help the fishermen to be located easily in future).', '3'],
  ]),
  P('Document 2 (a market) is a distractor: a candidate who uses it receives no mark for that point.', { size: 19, italics: true, before: 40 }),

  H('PRESENTATION (2 marks)'),
  tbl([6000, 3466, 1000], ['Criterion', 'Marking', 'Marks'], [
    ['Neat paper, legible handwriting, answers written in the spaces provided', '1 mark if clean and legible; ½ mark if partly', '1'],
    ['Correct spelling and complete sentences; coordinates written properly (e.g. 9° N, 13° E)', '1 mark if few errors; ½ mark if many', '1'],
  ]),
  P('**Total: 5 + 4 + 9 + 2 = 20 marks.**', { before: 120, size: 22 }),
];

const doc = new Document({ styles: { default: { document: { run: { font: FONT, size: 22 } } } },
  sections: [{ properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 700, bottom: 700, left: 720, right: 720 } } },
    footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'DGCAST Garoua – Geography – FORM THREE – Marking guide, First Sequence 2026-2027 – Page ', font: FONT, size: 16 }), new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 16 })] })] }) },
    children: body }] });
Packer.toBuffer(doc).then((b) => { fs.writeFileSync(OUT + '/DGCAST_F3_Marking_Guide_Seq1_2026-2027.docx', b); console.log('ok'); });
