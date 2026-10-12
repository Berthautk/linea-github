// Sequence 1 (2026-2027), GBHS Garoua: papers to be WRITTEN ON THE BOARD (F3, F4, LSA, USA), /20, GCE style.
// Page 1 = the text to copy on the board; page 2 = marking guide for the teacher.
const fs = require('fs');
const { Document, Packer, Paragraph, TextRun, AlignmentType, BorderStyle, TabStopType, Footer, PageNumber } = require('docx');
const DIR = '/tmp/claude-0/-home-user-linea-github/389cf9fb-8078-5c81-95f2-72f084366795/scratchpad/ep26/';
const OUT = process.argv[2] || DIR + 'board/';
const FONT = 'Times New Roman';
const runs = (t, o = {}) => String(t).split(/(\*\*[^*]+\*\*)/).filter(Boolean).map((s) => new TextRun(
  s.startsWith('**') ? { text: s.slice(2, -2), bold: true, font: FONT, size: o.size || 28, italics: o.italics } : { text: s, bold: o.bold, font: FONT, size: o.size || 28, italics: o.italics }));
const P = (t, o = {}) => new Paragraph({ alignment: o.align, pageBreakBefore: o.pb, keepNext: o.keepNext,
  spacing: { before: o.before || 0, after: o.after === undefined ? 80 : o.after, line: o.line || 320 },
  indent: o.left !== undefined ? { left: o.left, hanging: o.hang || 0 } : undefined, children: runs(t, o) });
const C = (t, o = {}) => P(t, Object.assign({ align: AlignmentType.CENTER }, o));
const rule = () => new Paragraph({ spacing: { after: 100 }, border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: '000000', space: 2 } }, children: [] });

// a question part: label, text, marks
const part = (label, t, m) => P(`${label}\t${t}${m ? ' **(' + m + ')**' : ''}`, { left: 700, hang: 700, after: 70 });
const sub = (label, t, m) => P(`${label}\t${t}${m ? ' **(' + m + ')**' : ''}`, { left: 1250, hang: 550, after: 50 });
const qhead = (t) => P(`**${t}**`, { before: 140, after: 60, keepNext: true });

function paper(x) {
  const children = [
    C('**GOVERNMENT BILINGUAL HIGH SCHOOL GAROUA  –  GEOGRAPHY DEPARTMENT**', { size: 24, after: 20 }),
    C(`**FIRST SEQUENCE EVALUATION  –  SCHOOL YEAR 2026-2027  –  ${x.cls}**`, { size: 24, after: 20 }),
    C(`Duration: ${x.duration}     Marks: 20     ${x.module}`, { size: 22, after: 20, italics: true }),
    C(`Facilitators: ${x.facilitators}`, { size: 22, after: 20, italics: true }),
    rule(),
    C(`**${x.instruction}**`, { size: 24, after: 100 }),
    ...x.questions,
    C('**END OF PAPER**', { before: 200, size: 24 }),
    // marking guide
    C('**MARKING GUIDE  –  FOR THE TEACHER ONLY**', { pb: true, size: 26, after: 20 }),
    C(`${x.cls}  –  First Sequence 2026-2027`, { size: 22, after: 80, italics: true }),
    rule(),
    ...x.guide.flatMap(([h, lines]) => [P(`**${h}**`, { size: 22, before: 100, after: 30, keepNext: true }), ...lines.map((l) => P(l, { size: 21, left: 300, after: 20, line: 270 }))]),
  ];
  return new Document({ creator: 'Geography Department', title: x.cls + ' Geography Seq 1',
    styles: { default: { document: { run: { font: FONT, size: 28 } } } },
    sections: [{ properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 900, bottom: 900, left: 1100, right: 1100 } } },
      footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'GBHS Garoua – Geography – ' + x.cls + ' – Seq 1 – Page ', font: FONT, size: 18 }), new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 18 })] })] }) },
      children }] });
}

// ===================================================================== FORM THREE
const F3 = {
  file: 'F3_Geography_Seq1_Tableau.docx', cls: 'FORM THREE', duration: '1 hour', module: 'Lessons 1 – 3',
  facilitators: 'Mme ASTHA Noura – Mr KAMDEM Emmanuel',
  instruction: 'Answer ALL the questions.',
  questions: [
    qhead('QUESTION 1  (6 marks)'),
    part('(a)', 'Name the shape of the Earth.', '1 mark'),
    part('(b)', 'State **two** measurements that show the size of the Earth.', '2 marks'),
    part('(c)', 'List **three** proofs that the Earth is round.', '3 marks'),
    qhead('QUESTION 2  (6 marks)'),
    part('(a)', '(i)  Define a galaxy.', '1 mark'),
    sub('', '(ii)  Name the galaxy in which we live.', '1 mark'),
    part('(b)', 'List the **four** main phases of the Moon.', '2 marks'),
    part('(c)', 'Explain how the Moon causes the tides.', '2 marks'),
    qhead('QUESTION 3  (8 marks)'),
    part('(a)', 'Define (i) latitude and (ii) longitude.', '2 marks'),
    part('(b)', 'Name the line of 0° latitude and the line of 0° longitude.', '2 marks'),
    part('(c)', 'Give **two** differences between lines of latitude and lines of longitude.', '2 marks'),
    part('(d)', 'Garoua is at about 9° N, 13° E. Explain what each of these two numbers tells us.', '2 marks'),
  ],
  guide: [
    ['Question 1 (6 marks)', ['(a) An oblate spheroid (a sphere slightly flattened at the poles): 1 mark.',
      '(b) Any two: equatorial circumference about 40,075 km; polar circumference about 40,008 km; equatorial diameter about 12,756 km; polar diameter about 12,714 km; surface about 510 million km²: 1 mark each.',
      '(c) Any three: ship disappearing bottom first; round shadow of the Earth on the Moon in an eclipse; photos from space; a traveller going always in one direction returns to the start; circular horizon; Sun rises earlier in the east: 1 mark each.']],
    ['Question 2 (6 marks)', ['(a)(i) A huge group of stars, gas and dust held together by gravity: 1 mark. (ii) The Milky Way: 1 mark.',
      '(b) New Moon, first quarter, full Moon, last quarter: ½ mark each.',
      '(c) The Moon pulls (gravity) the water of the sea: 1 mark; the sea rises and falls twice a day (high and low tides): 1 mark.']],
    ['Question 3 (8 marks)', ['(a) Latitude: angular distance of a place north or south of the Equator, in degrees: 1 mark. Longitude: angular distance of a place east or west of the Greenwich Meridian, in degrees: 1 mark.',
      '(b) The Equator: 1 mark. The Greenwich (Prime) Meridian: 1 mark.',
      '(c) Any two: latitudes run west–east, longitudes north–south; latitudes never meet, longitudes meet at the poles; latitudes have different lengths, longitudes equal lengths; latitudes go up to 90°, longitudes up to 180°; latitudes show climate zones, longitudes help to calculate time: 1 mark each.',
      '(d) 9° N: Garoua is 9 degrees north of the Equator: 1 mark. 13° E: Garoua is 13 degrees east of the Greenwich Meridian: 1 mark.']],
  ],
};

// ===================================================================== FORM FOUR
const F4 = {
  file: 'F4_Geography_Seq1_Tableau.docx', cls: 'FORM FOUR', duration: '1 hour', module: 'Physical Geography, Lessons 4 – 24',
  facilitators: 'Mme ASTHA Noura – Mr KAMDEM Emmanuel – Mme TSOGO Sylviane',
  instruction: 'Answer ALL the questions.',
  questions: [
    qhead('QUESTION 1  (4 marks)'),
    part('(a)', 'State the direction of the rotation of the Earth and the time taken by one revolution of the Earth around the Sun.', '2 marks'),
    part('(b)', 'It is 12:00 noon at Garoua (13° E). Calculate the local time at a place on longitude 33° E.', '2 marks'),
    qhead('QUESTION 2  (4 marks)'),
    part('(a)', 'Name the layers of the Earth, from the surface to the centre.', '2 marks'),
    part('(b)', 'State **two** pieces of evidence that support the theory of continental drift.', '2 marks'),
    qhead('QUESTION 3  (4 marks)'),
    part('(a)', 'Distinguish between an active volcano and an extinct volcano. Give one example of each in Cameroon.', '2 marks'),
    part('(b)', 'State **two** measures that reduce the damage caused by earthquakes.', '2 marks'),
    qhead('QUESTION 4  (4 marks)'),
    part('(a)', 'Distinguish between physical weathering and chemical weathering.', '2 marks'),
    part('(b)', 'Explain how a meander is formed.', '2 marks'),
    qhead('QUESTION 5  (4 marks)'),
    part('(a)', 'Distinguish between constructive waves and destructive waves.', '2 marks'),
    part('(b)', 'List, in the correct order, the **four** features formed when a headland is eroded by waves.', '2 marks'),
  ],
  guide: [
    ['Question 1 (4 marks)', ['(a) From west to east: 1 mark. 365¼ days (one year): 1 mark.',
      '(b) Difference of longitude 33° − 13° = 20° (1 mark). 20 × 4 min = 80 min = 1 h 20 min; the place is to the east, so it is ahead: 13:20 (1 mark).']],
    ['Question 2 (4 marks)', ['(a) Crust, mantle, outer core, inner core: ½ mark each.',
      '(b) Any two: the coasts of Africa and South America fit like a jigsaw; the same fossils (e.g. Mesosaurus) on separated continents; the same rocks and mountain chains continue from one continent to another; ancient glacier marks in hot lands; coal in Antarctica: 1 mark each.']],
    ['Question 3 (4 marks)', ['(a) Active: erupts now or has erupted recently, e.g. Mount Cameroon (1 mark). Extinct: will never erupt again, e.g. Mount Manengouba (1 mark).',
      '(b) Any two: strong buildings; land-use planning (not building on faults); monitoring and warning; education and drills; emergency services: 1 mark each.']],
    ['Question 4 (4 marks)', ['(a) Physical: rocks break into smaller pieces without any change in their minerals (1 mark). Chemical: the minerals of the rock are changed by water and air, so the rock rots or dissolves (1 mark).',
      '(b) On the outside of the bend the fast, deep water erodes the bank and forms a river cliff (1 mark); on the inside of the bend the slow water deposits sand and gravel and forms a slip-off slope (1 mark).']],
    ['Question 5 (4 marks)', ['(a) Constructive: low, gentle waves; swash stronger than backwash; they build up beaches (1 mark). Destructive: high, steep waves; backwash stronger than swash; they erode beaches (1 mark).',
      '(b) Cave, arch, stack, stump: ½ mark each, in the correct order.']],
  ],
};

// ===================================================================== LOWER SIXTH ARTS: POPULATION GEOGRAPHY
const LSA = {
  file: 'LSA_Geography_Seq1_Tableau.docx', cls: 'LOWER SIXTH ARTS', duration: '1 hour', module: 'Population Geography, Lessons 1 – 2 and Practical Work 1',
  facilitators: 'Mr KAMDEM Emmanuel',
  instruction: 'Answer ONE question only, chosen from the three questions below. Each question carries 20 marks.',
  questions: [
    qhead('QUESTION 1'),
    part('(a)', 'Define (i) a census and (ii) a sample survey.', '4 marks'),
    part('(b)', 'Distinguish between the de facto and the de jure methods of counting people in a census.', '4 marks'),
    part('(c)', 'Examine the strengths and the weaknesses of sample surveys as a source of population data.', '6 marks'),
    part('(d)', 'Assess the reliability of vital registration and of migration records in developing countries.', '6 marks'),
    qhead('QUESTION 2'),
    part('(a)', 'Distinguish between population distribution and population density.', '4 marks'),
    part('(b)', 'Describe how the world population is unevenly distributed according to latitude, altitude and distance from the sea.', '6 marks'),
    part('(c)', 'A country has 40 million inhabitants on a total area of 800,000 km², of which 200,000 km² is cultivable. Calculate its (i) arithmetic density and (ii) physiological density.', '4 marks'),
    part('(d)', 'Assess the usefulness and the limits of population distribution and density data.', '6 marks'),
    qhead('QUESTION 3'),
    part('(a)', 'Define (i) a choropleth map and (ii) a dot map.', '4 marks'),
    part('(b)', 'Describe how an isopleth map and a proportional symbol map show population.', '4 marks'),
    part('(c)', 'Explain how a Lorenz curve shows the unevenness of population distribution.', '4 marks'),
    part('(d)', 'Assess the advantages and the disadvantages of the choropleth map and of the dot map.', '8 marks'),
  ],
  guide: [
    ['Question 1 (20 marks)', ['(a) Census: complete official count of all the people of a country at a given time (2). Sample survey: data collected from a small part of the population chosen to represent the whole (2).',
      '(b) De facto: people counted where they are found on census night (2). De jure: people counted at their usual place of residence (2). Example: a Garoua trader sleeping in Douala is counted in Douala (de facto) or in Garoua (de jure).',
      '(c) Strengths (3): low cost and speed; detailed questions possible; random or systematic sampling gives a representative sample; example: Demographic and Health Surveys. Weaknesses (3): a badly chosen sample is not representative; results extended to the whole population are then wrong; gives no exact count.',
      '(d) Vital registration (3): continuous recording of births, deaths, marriages by the civil status office; complete in developed countries; incomplete in developing countries because many village births and deaths are never declared. Migration records (3): passports, visas, border records and refugee registers measure international migration; internal movements are rarely recorded and many people cross borders informally, so migration is underestimated.']],
    ['Question 2 (20 marks)', ['(a) Distribution: how people are spread over an area, where they are concentrated or scattered (2). Density: number of people per unit area (km²), found by dividing population by area (2).',
      '(b) Latitude: about 90 % of people live in the northern hemisphere, mostly between 20° N and 60° N (2). Altitude: density generally falls with altitude, about 56 % live below 200 m (2). Sea: about two-thirds live within 500 km of the sea (2). Examples (Asia densest, Oceania sparse) may be credited.',
      '(c) (i) 40,000,000 ÷ 800,000 = 50 people per km² (2). (ii) 40,000,000 ÷ 200,000 = 200 people per km² (2).',
      '(d) Usefulness (3): urban planning; sharing of water, electricity, health care; economic planning (shops, banks, factories); environmental protection: 1 mark each, any three. Limits (3): density is an average that hides contrasts inside an area; it says nothing about living conditions: 1½ marks each.']],
    ['Question 3 (20 marks)', ['(a) Choropleth: a map that shows density with shades of colour for each administrative area (2). Dot map: each dot stands for a fixed number of people (2).',
      '(b) Isopleth: lines join places of equal density, like contour lines; shows gradual change without following boundaries (2). Proportional symbols: circles or squares whose area is proportional to the population of each town; the radius is proportional to the square root of the population (2).',
      '(c) The cumulative % of population is plotted against the cumulative % of area (2); the diagonal shows an even distribution and the further the curve is from the diagonal, the more uneven the distribution (2).',
      '(d) Choropleth (4): advantages: easy to draw and read, quick comparison of areas; disadvantages: hides differences inside each area, depends on administrative boundaries. Dot map (4): advantages: shows the real pattern and clusters; disadvantages: dots merge in crowded areas, exact number is hard to read. 1 mark each point, with explanation.']],
  ],
};

// ===================================================================== UPPER SIXTH ARTS: METEOROLOGY
const USA = {
  file: 'USA_Geography_Seq1_Tableau.docx', cls: 'UPPER SIXTH ARTS', duration: '1 hour', module: 'Meteorology, Lessons 10 – 15',
  facilitators: 'Mr KAMDEM Emmanuel',
  instruction: 'Answer ONE question only, chosen from the three questions below. Each question carries 20 marks.',
  questions: [
    qhead('QUESTION 1'),
    part('(a)', 'Distinguish between absolute humidity and relative humidity.', '4 marks'),
    part('(b)', 'Explain how temperature, nearness to water bodies and vegetation cover influence atmospheric humidity.', '6 marks'),
    part('(c)', 'With the aid of diagrams, explain the three types of rainfall.', '6 marks'),
    part('(d)', 'Describe how clouds are formed.', '4 marks'),
    qhead('QUESTION 2'),
    part('(a)', 'What is the Intertropical Convergence Zone (ITCZ)?', '2 marks'),
    part('(b)', 'Describe the distribution of precipitation according to latitude.', '6 marks'),
    part('(c)', 'With the aid of a diagram, explain how the Hadley cell works.', '6 marks'),
    part('(d)', 'Account for the influence of relief, ocean currents and distance from the sea on local rainfall.', '6 marks'),
    qhead('QUESTION 3'),
    part('(a)', 'Define the adiabatic lapse rate.', '2 marks'),
    part('(b)', 'Distinguish between absolute instability and absolute stability, and state the weather conditions associated with each.', '8 marks'),
    part('(c)', 'Describe the characteristics of the trade winds, the westerlies and the polar easterlies.', '6 marks'),
    part('(d)', 'Explain the Coriolis effect and its influence on planetary winds.', '4 marks'),
  ],
  guide: [
    ['Question 1 (20 marks)', ['(a) Absolute: mass of water vapour in a given volume of air, in g/m³ (2). Relative: actual vapour compared with the maximum the air can hold at the same temperature, in % (RH = actual ÷ maximum × 100) (2).',
      '(b) Temperature: warm air holds more vapour than cold air, so RH changes with temperature (2). Water bodies: more evaporation, so coasts and lake shores are more humid than the interior (2). Vegetation: transpiration adds vapour, so forests are more humid than bare land and deforestation lowers humidity (2).',
      '(c) Convectional: strong heating, moist air rises, cumulonimbus, heavy short showers (2). Orographic: moist winds forced up mountains, rain on the windward side, rain shadow on the leeward side (2). Cyclonic (frontal): warm air rises over cold air along a front, long steady rain (2). One mark per diagram may be included.',
      '(d) Moist air rises, expands and cools (about 10 °C per 1,000 m) (1); at the dew point it is saturated (1); the vapour condenses on nuclei of dust, salt or smoke (1); billions of tiny droplets or ice crystals form the cloud (1).']],
    ['Question 2 (20 marks)', ['(a) The equatorial low-pressure zone (1) where the trade winds meet and air rises (1).',
      '(b) Equatorial zone: heaviest rainfall, more than 2,000 mm, in every month (1½). Tropical and subtropical zones (10° to 30°): rainfall decreases and the dry season lengthens; below 250 mm in the hot deserts at 20° to 30° (1½). Temperate zone (40° to 60°): moderate, 500 to 1,500 mm, in all seasons (1½). Polar zones: very low, under 250 mm, mainly snow (1½).',
      '(c) Diagram (2). Step 1: strong heating at the Equator, air rises, equatorial low (1). Step 2: at the tropopause (about 15 km) it spreads towards the poles and cools (1). Step 3: at about 30° it sinks and warms, subtropical high, deserts (1). Step 4: return flow at the surface as trade winds (1).',
      '(d) Relief: heavy rain on the windward side, rain shadow on the leeward side (2). Distance from the sea: coasts and islands receive much moisture, inland areas are drier (2). Ocean currents: warm currents bring moisture and rain, cold currents cool the air, make it stable and give dry coasts (2).']],
    ['Question 3 (20 marks)', ['(a) The rate at which rising air cools by expansion (or sinking air warms by compression) (1) without exchange of heat with the surrounding air (1).',
      '(b) Absolute instability: ELR greater than DALR; the lifted parcel is always warmer and lighter and keeps rising (2). Weather: towering cumulus and cumulonimbus, heavy showers and thunderstorms, turbulence (2). Absolute stability: ELR smaller than SALR, e.g. during a temperature inversion; the parcel is always cooler and sinks back (2). Weather: clear calm skies, fog and layer clouds, trapped pollution (haze, smog) (2).',
      '(c) Trade winds: blow from the subtropical highs to the equatorial low, from the north-east in the northern hemisphere and the south-east in the southern hemisphere (2). Westerlies: blow from the subtropical highs to the subpolar lows (30° to 60°), from the south-west in the northern hemisphere and the north-west in the southern (2). Polar easterlies: blow from the polar highs to the subpolar lows, from the east, very cold and dry (2).',
      '(d) Coriolis effect: deflection of winds by the rotation of the Earth, to the right in the northern hemisphere and to the left in the southern (2). Winds therefore do not blow straight from high to low pressure; this gives the north-east and south-east trades and the south-west and north-west westerlies (2).']],
  ],
};

(async () => { fs.mkdirSync(OUT, { recursive: true }); for (const x of [F3, F4, LSA, USA]) { fs.writeFileSync(OUT + x.file, await Packer.toBuffer(paper(x))); console.log('ok', x.file); } })();
