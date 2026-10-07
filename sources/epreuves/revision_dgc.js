// DGCAST revision sheets, first sequence 2026-2027: one sheet per class, each question followed by its answer (max. 2 pages)
const fs = require('fs');
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, ImageRun, AlignmentType, WidthType, BorderStyle, ShadingType, VerticalAlign, Footer, PageNumber } = require('docx');

const DIR = '/tmp/claude-0/-home-user-linea-github/389cf9fb-8078-5c81-95f2-72f084366795/scratchpad/ep26/';
const OUT = process.argv[2] || DIR + 'rev/';
const LOGO = fs.readFileSync(DIR + 'logo_dgc.png');
const W = 10466, FONT = 'Times New Roman', S = 21;      // 10.5 pt body

const none = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
const NOB = { top: none, bottom: none, left: none, right: none, insideHorizontal: none, insideVertical: none };
const ln = { style: BorderStyle.SINGLE, size: 4, color: '808080' };
const BOX = { top: ln, bottom: ln, left: ln, right: ln, insideHorizontal: ln, insideVertical: ln };

function runs(t, o = {}) {
  return String(t).split(/(\*\*[^*]+\*\*)/).filter(Boolean).map((s) => new TextRun({ text: s.startsWith('**') ? s.slice(2, -2) : s, bold: s.startsWith('**') || o.bold,
    italics: o.italics, font: FONT, size: o.size || S, color: o.color }));
}
const P = (t, o = {}) => new Paragraph({ alignment: o.align, keepNext: o.keepNext, spacing: { before: o.before || 0, after: o.after === undefined ? 30 : o.after },
  indent: o.indent ? { left: o.indent } : undefined, children: runs(t, o) });
const cell = (children, w, o = {}) => new TableCell({ width: { size: w, type: WidthType.DXA }, margins: { top: 30, bottom: 30, left: 70, right: 70 }, verticalAlign: o.valign || VerticalAlign.CENTER,
  borders: o.borders, shading: o.shade ? { fill: o.shade, type: ShadingType.CLEAR, color: 'auto' } : undefined, children: [].concat(children) });

// section banner
const SEC = (t) => new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: [W], borders: NOB,
  rows: [new TableRow({ children: [cell(P('**' + t + '**', { color: 'FFFFFF', after: 0, size: 22 }), W, { shade: '1F3864', borders: NOB })] })] });
// question then its answer
let qn = 0;
const QA = (q, a) => { qn += 1; return [P(`**${qn}. ${q}**`, { before: 50, after: 10, keepNext: true }),
  ...[].concat(a).map((x, i) => P((i === 0 ? '**Answer:** ' : '') + x, { indent: 300, after: 10, color: '1F3864' }))]; };
// quick quiz: [question, answer] pairs in a two-column table
const QUIZ = (rows) => new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: [7000, 3466], borders: BOX,
  rows: [new TableRow({ children: [cell(P('**Quick quiz**', { after: 0 }), 7000, { shade: 'D9E2F3' }), cell(P('**Answer**', { after: 0 }), 3466, { shade: 'D9E2F3' })] }),
    ...rows.map(([q, a]) => new TableRow({ children: [cell(P(q, { after: 0 }), 7000), cell(P(a, { after: 0, color: '1F3864', bold: true }), 3466)] }))] });
const months = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
const CLIM = (temp, rain) => new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: [1966].concat(Array(12).fill(708)), borders: BOX,
  rows: [['Month'].concat(months), ['Temp. (°C)'].concat(temp), ['Rain (mm)'].concat(rain)].map((r, i) => new TableRow({ children: r.map((c, j) =>
    cell(P(i === 0 || j === 0 ? '**' + c + '**' : String(c), { align: j ? AlignmentType.CENTER : undefined, after: 0, size: 19 }), j ? 708 : 1966, { shade: i === 0 ? 'D9E2F3' : undefined })) })) });
const BOXED = (title, t) => new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: [W], borders: BOX,
  rows: [new TableRow({ children: [cell([P('**' + title + '**', { after: 20 }), P(t, { after: 0, italics: true })], W, { shade: 'F2F2F2' })] })] });
const TIP = (t) => P('**Exam tip:** ' + t, { before: 60, after: 20, italics: true });

function head(cls, lessons) {
  return [new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: [1700, 8766], borders: NOB, rows: [new TableRow({ children: [
    cell(new Paragraph({ children: [new ImageRun({ type: 'png', data: LOGO, transformation: { width: 92, height: 71 } })] }), 1700, { borders: NOB }),
    cell([P('**DIVINE GRACE COLLEGE OF ARTS, SCIENCE AND TECHNOLOGY (DGCAST) – GAROUA**', { align: AlignmentType.CENTER, after: 10, size: 20 }),
      P('**GEOGRAPHY REVISION SHEET – ' + cls + '**', { align: AlignmentType.CENTER, after: 10, size: 28, color: '1F3864' }),
      P('First Sequence Evaluation, School Year 2026-2027  •  Teacher: Mr KAMDEM Emmanuel', { align: AlignmentType.CENTER, after: 10, size: 19, italics: true }),
      P('Lessons revised: ' + lessons, { align: AlignmentType.CENTER, after: 0, size: 19 })], 8766, { borders: NOB })] })] }),
    new Paragraph({ spacing: { after: 60 }, border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: '1F3864', space: 2 } }, children: [] })];
}

function build(file, cls, lessons, body) {
  const doc = new Document({ styles: { default: { document: { run: { font: FONT, size: S } } } },
    sections: [{ properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 567, bottom: 567, left: 720, right: 720 } } },
      footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [
        new TextRun({ text: `DGCAST Garoua – Geography revision – ${cls} – Page `, font: FONT, size: 16 }), new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 16 })] })] }) },
      children: [...head(cls, lessons), ...body] }] });
  return Packer.toBuffer(doc).then((b) => { fs.mkdirSync(OUT, { recursive: true }); fs.writeFileSync(OUT + file, b); console.log('written', file); });
}

const firstCycleTip = TIP('In Part Two, Question 1 asks for the problem of the situation, Question 2 is answered with **Document 1**, and Question 3 asks you to propose your own solutions. **Document 2 has nothing to do with the situation: do not use it.**');

// ============================== FORM ONE ==============================
const F1 = () => { qn = 0; return [
  SEC('A. GEOGRAPHY: MEANING, BRANCHES, METHODS AND IMPORTANCE'),
  ...QA('What is geography?', 'Geography is the study of the Earth, its physical features and the activities of the people who live on it.'),
  ...QA('Name the three main branches of geography and say what each one studies.', ['**Physical geography** studies natural features: relief, climate, rivers, soils and vegetation.', '**Human geography** studies people and their activities: population, settlement, economic activities.', '**Practical geography** studies the tools of the geographer: maps, statistics, fieldwork.']),
  ...QA('Give two sub-branches of physical geography and two of human geography.', 'Physical: geomorphology, climatology, hydrology, biogeography. Human: population geography, settlement geography, economic geography.'),
  ...QA('Give three methods used by geographers to collect information.', 'Observation and fieldwork; questionnaires and interviews; maps, photographs and satellite images; statistics and graphs.'),
  ...QA('Give two reasons why geography is important.', 'It helps us to find places and read maps; it helps farmers to know seasons and soils; it helps to plan roads, schools and towns; it teaches us to protect the environment.'),
  SEC('B. OUR PLANET, THE EARTH'),
  ...QA('Name the eight planets of the solar system in order from the Sun.', 'Mercury, Venus, **Earth** (3rd), Mars, Jupiter, Saturn, Uranus, Neptune.'),
  ...QA('Why is the Earth a special planet?', 'It is the only planet known to have life, liquid water and air (oxygen).'),
  ...QA('Describe the shape and the size of the Earth.', 'The Earth is a sphere, slightly flattened at the poles. Its circumference at the Equator is about 40,000 km and its diameter about 12,700 km.'),
  ...QA('Name the seven continents and the five oceans.', ['Continents: Asia, Africa, North America, South America, Antarctica, Europe, Australia (Oceania).', 'Oceans: Pacific (the largest), Atlantic, Indian, Southern, Arctic. Water covers about **71 %** of the Earth and land about **29 %**.']),
  SEC('C. REPRESENTATION OF THE EARTH AND LOCATION OF PLACES'),
  ...QA('Give two differences between a globe and a map.', ['A globe is a **round model** of the Earth; a map is a **flat drawing** of the Earth or part of it.', 'A globe shows the true shapes but only half of the Earth at a time; a map shows the whole Earth at once, is easy to carry and shows more details.']),
  ...QA('Name four elements of the marginal information of a map and give the use of each.', ['**Title**: tells what the map shows. **Key (legend)**: explains the signs and colours.', '**Scale**: helps to calculate real distances. **North arrow**: shows directions. **Latitudes and longitudes**: help to locate places.']),
  ...QA('On a map with a scale of 1 cm to 25 km, two towns are 8 cm apart. Calculate the real distance.', 'Real distance = map distance × scale value = 8 × 25 = **200 km**.'),
  ...QA('What are geographical coordinates? How are they written?', 'They are the latitude and the longitude of a place. We write the latitude first (N or S), then the longitude (E or W), for example Garoua: **9° N, 13° E**.'),
  ...QA('Give the approximate coordinates of Maroua and Yaoundé, and the position of Cameroon.', 'Maroua: 11° N, 14° E. Yaoundé: 4° N, 12° E. Cameroon lies between about 2° N and 13° N and between 8° E and 16° E.'),
  QUIZ([['A round model of the Earth is called a …', 'Globe'], ['The largest ocean is the …', 'Pacific Ocean'], ['Population geography belongs to …', 'Human geography'], ['The part of a map that explains signs and colours is the …', 'Key (legend)']]),
  SEC('D. PRACTICE OF COMPETENCE'),
  BOXED('Situation', 'Moussa lives in Garoua. He wants to visit his uncle in Ngaoundéré, but on the map of Cameroon he cannot find the town, nor calculate how far it is. He asks you for help.'),
  ...QA('What is the problem raised in the situation?', 'Moussa cannot read a map: he is unable to locate Ngaoundéré and to calculate its distance from Garoua.'),
  ...QA('Propose three things Moussa can do.', 'Read the key and the title of the map; find Ngaoundéré with its coordinates (about 7° N, 13° E); measure the distance on the map with a ruler and multiply it by the scale; ask a teacher or use a phone with GPS.'),
  firstCycleTip,
]; };

// ============================== FORM TWO ==============================
const F2 = () => { qn = 0; return [
  SEC('A. KEY DEFINITIONS'),
  ...QA('Define: population, birth rate, death rate, natural growth.', ['**Population**: the number of people living in a place at a given time.', '**Birth rate**: the number of births per 1,000 people in one year (‰). **Death rate**: the number of deaths per 1,000 people in one year (‰).', '**Natural growth**: the difference between births and deaths.']),
  ...QA('Define population density, ecumene and emigrant.', '**Density**: the average number of people per km² (population ÷ area). **Ecumene**: the parts of the Earth where people live permanently. **Emigrant**: a person who leaves their own country to live in another.'),
  SEC('B. THE RAPID GROWTH OF THE WORLD’S POPULATION'),
  ...QA('Describe the evolution of the world population.', 'Fewer than 1 billion people until about 1800; about 2.5 billion in 1950; more than **8 billion in 2022**. Growth is now fastest in Africa and Asia.'),
  ...QA('Give four factors of the rapid growth of population.', 'A high birth rate; a falling death rate (vaccines, hospitals, clean water); a better food supply; early marriages and the wish for big families.'),
  ...QA('Give three consequences of rapid population growth on natural resources.', 'Farmland becomes scarce and farms smaller; forests are cut for farms and firewood; water becomes scarce and polluted; soils are overused and lose their fertility.'),
  SEC('C. CALCULATION OF DEMOGRAPHIC INDICES (PRACTICE)'),
  P('A town of **150,000** inhabitants with an area of **300 km²** recorded **5,400** births and **1,350** deaths in one year.', { after: 20 }),
  ...QA('Write the formula of the birth rate and calculate it.', 'Birth rate = (births ÷ population) × 1,000 = (5,400 ÷ 150,000) × 1,000 = **36 ‰**.'),
  ...QA('Write the formula of the death rate and calculate it.', 'Death rate = (deaths ÷ population) × 1,000 = (1,350 ÷ 150,000) × 1,000 = **9 ‰**.'),
  ...QA('Calculate the natural growth rate and the population density.', 'Natural growth rate = (36 − 9) ÷ 10 = **2.7 %**. Density = 150,000 ÷ 300 = **500 people per km²**.'),
  SEC('D. THE UNEVEN DISTRIBUTION OF THE WORLD’S POPULATION'),
  ...QA('Name three densely populated areas and three sparsely populated areas of the world.', 'Dense: East Asia, South Asia, Western Europe, West Africa, north-east USA. Sparse: hot deserts (Sahara), polar lands, high mountains, thick forests.'),
  ...QA('Give four factors of the uneven distribution of population.', 'Climate (mild climate with enough rain); relief and soils (flat land, fertile soils); water (rivers, lakes, coasts); economic factors (jobs, industries, ports, mines); social and political factors (services, security).'),
  ...QA('Classify the regions of Cameroon by population density.', 'High (over 100 per km²): Littoral, West, North-West, Far North. Moderate: Centre, South-West, North. Low (under 20 per km²): **East**, South, Adamawa.'),
  QUIZ([['The birth rate is expressed …', 'Per thousand (‰)'], ['Density = … ÷ …', 'Population ÷ area'], ['A sparsely populated area of the world', 'The Sahara Desert'], ['Region of Cameroon with the lowest density', 'The East']]),
  SEC('E. PRACTICE OF COMPETENCE'),
  BOXED('Situation', 'In a quarter of Garoua, families get bigger every year. Long queues form at the only borehole, classrooms are overcrowded and the last trees are cut for firewood. The quarter chief asks you for help.'),
  ...QA('What is the problem raised in the situation?', 'The rapid growth of the population puts heavy pressure on the resources and services of the quarter (water, schools, trees).'),
  ...QA('Propose three solutions.', 'Educate families on family planning and send girls to school; build more boreholes and classrooms; plant trees and use improved stoves to save firewood.'),
  firstCycleTip,
]; };

// ============================== FORM TWO TECHNICAL ==============================
const F2T = () => { qn = 0; return [
  SEC('A. LOCATION AND CLIMATE OF THE EQUATORIAL REGION'),
  ...QA('Where is the equatorial region located? Give examples.', 'Between about **5° N and 5° S** of the Equator: the Congo Basin (including southern Cameroon), the Amazon Basin and South-East Asia (Indonesia, Malaysia).'),
  ...QA('Give five characteristics of the equatorial climate.', 'Hot all year (about **27 °C**); very small annual range of temperature (**2 to 3 °C**); heavy rainfall (**above 1,500 mm**) falling all year; two rainy seasons; high humidity and convectional rain in the afternoon.'),
  P('**Practice:** study the climate data of a station Y in southern Cameroon (approximate values).', { before: 40, after: 20 }),
  CLIM([25, 25, 25, 25, 24, 24, 23, 23, 24, 24, 24, 25], [40, 80, 150, 190, 210, 160, 60, 90, 230, 280, 130, 40]),
  ...QA('Calculate the annual range of temperature and the total annual rainfall.', 'Range = highest − lowest = 25 − 23 = **2 °C**. Total rainfall = sum of the 12 months = **1,660 mm**.'),
  ...QA('Name the wettest month and state two characteristics of the equatorial climate shown.', 'Wettest month: **October** (280 mm). It is hot all year with a very small range (2 °C), rainfall is heavy (above 1,500 mm) and there are two rainy seasons (March–June and September–November).'),
  SEC('B. SOILS AND VEGETATION'),
  ...QA('Describe the equatorial soils.', 'They are red or yellow **ferrallitic** soils. Heavy rain washes the nutrients down (**leaching**), so they become poor once the forest is cleared.'),
  ...QA('Give four characteristics of the equatorial forest.', 'It is dense and **evergreen** (trees shed their leaves at different times); it has several layers, with emergent trees of 50 to 60 m; it has hardwoods (mahogany, sapele, iroko, ebony, ayous), lianas and buttress roots; there is little undergrowth because little light reaches the ground.'),
  SEC('C. RESOURCES, HUMAN ACTIVITIES AND PROBLEMS'),
  ...QA('Give three resources of the equatorial region.', 'Timber and other forest products; wildlife; minerals and oil; rivers for fishing and hydroelectricity.'),
  ...QA('Give three human activities of the equatorial region.', '**Lumbering**; shifting cultivation; plantation agriculture (cocoa, oil palm, rubber); hunting and gathering; mining.'),
  ...QA('Give three problems of the equatorial region.', '**Deforestation**; leaching and poor soils; diseases such as malaria; poor roads and communication in the dense forest.'),
  QUIZ([['Washing down of soil nutrients by heavy rain', 'Leaching'], ['A hardwood of the equatorial forest', 'Mahogany'], ['A human activity of the equatorial region', 'Lumbering'], ['Average temperature of the equatorial region', 'About 27 °C']]),
  SEC('D. PRACTICE OF COMPETENCE'),
  BOXED('Situation', 'Near Lomié, farmers clear new forest plots every two years because their old fields no longer produce enough. The chief does not understand why the soil becomes poor so quickly.'),
  ...QA('What is the problem raised in the situation?', 'The soils become poor quickly after the forest is cleared, which pushes farmers to destroy more forest (deforestation).'),
  ...QA('Propose three measures to solve it.', 'Practise agroforestry and plant cover crops; add compost or manure to the soil; replant trees and protect the remaining forest; leave the land to rest (fallow).'),
  firstCycleTip,
]; };

// ============================== FORM THREE ==============================
const F3 = () => { qn = 0; return [
  SEC('A. OUR PLANET, THE EARTH'),
  ...QA('What is the position of the Earth in the solar system?', 'The Earth is the **third planet** from the Sun, between Venus and Mars.'),
  ...QA('Describe the shape and the size of the Earth.', 'The Earth is a **sphere slightly flattened at the poles**. Its circumference at the Equator is about **40,000 km**, its diameter about 12,700 km and its surface area about 510 million km².'),
  ...QA('Give four proofs that the Earth is spherical.', 'Ships disappear gradually below the horizon (the hull first); the shadow of the Earth on the Moon during an eclipse is round; photographs from space show a round Earth; travellers can go round the Earth; the horizon gets wider when we climb higher.'),
  SEC('B. THE UNIVERSE AND THE MOON'),
  ...QA('What is the universe and what does it contain?', 'It is all of space and everything in it: galaxies (such as the **Milky Way**), stars (such as the Sun), planets, satellites and comets.'),
  ...QA('What is the Moon? Name its main phases.', 'The Moon is the **natural satellite** of the Earth. It has no light of its own: it reflects the light of the Sun. Phases: new moon, crescent, first quarter, **full moon** (whole lit face visible), last quarter. A full cycle lasts about 29.5 days.'),
  ...QA('Give two influences of the Moon on the Earth and its people.', 'It causes the **tides** of the sea; it lights the night; it is used for calendars and religious feasts (Ramadan); fishermen use its phases.'),
  SEC('C. LATITUDES AND LONGITUDES'),
  ...QA('Define latitude and longitude.', '**Latitude**: the distance of a place north or south of the Equator, in degrees. **Longitude**: the distance of a place east or west of the Greenwich Meridian, in degrees.'),
  ...QA('Name the major lines of latitude with their values.', 'Equator 0°; Tropic of Cancer **23½° N**; Tropic of Capricorn 23½° S; Arctic Circle 66½° N; Antarctic Circle 66½° S; North and South Poles 90°. The Greenwich (Prime) Meridian is longitude 0°.'),
  ...QA('Give two differences between lines of latitude and lines of longitude.', 'Latitudes (**parallels**) run east–west and are parallel to the Equator; longitudes (**meridians**) run from pole to pole. Latitudes get shorter towards the poles; all longitudes have the same length. Latitudes go from 0° to 90° N/S; longitudes from 0° to 180° E/W.'),
  ...QA('How do you read the geographical coordinates of a town on a map?', 'Follow the line of latitude to the side of the map and read its value with N or S; follow the line of longitude to the top or bottom and read its value with E or W. Write the latitude first: Ngaoundéré is about **7° N, 13° E**; Yaoundé about **4° N, 12° E**.'),
  ...QA('Town A is on latitude 13° N and town B on latitude 4° S, on the same meridian. Calculate the distance between them (1° = 111 km).', 'The towns are on opposite sides of the Equator, so we **add**: 13 + 4 = 17°. Distance = 17 × 111 = **1,887 km**. (If both were in the same hemisphere, we would subtract.)'),
  QUIZ([['Natural satellite of the Earth', 'The Moon'], ['Latitude 0° is called the …', 'Equator'], ['Lines of longitude are also called …', 'Meridians'], ['Circumference of the Earth at the Equator', 'About 40,000 km']]),
  SEC('D. PRACTICE OF COMPETENCE'),
  BOXED('Situation', 'Your little cousin sees that the Moon is round one week and thin like a banana another week. She thinks that the Moon breaks into pieces and asks you to explain.'),
  ...QA('What is the problem raised in the situation?', 'Your cousin does not understand the **phases of the Moon** and believes that the Moon really changes its shape.'),
  ...QA('Propose three ways to help her understand.', 'Explain that the Moon reflects the light of the Sun and that, as it moves round the Earth, we see a different part of its lit face; observe the Moon with her every evening for a month and draw its shapes; show her a lamp and a ball to imitate the phases.'),
  firstCycleTip,
]; };

// ============================== FORM FOUR ==============================
const F4 = () => { qn = 0; return [
  SEC('A. READING CLIMATE DATA AND IDENTIFYING BIOMES'),
  ...QA('How do you calculate the annual range of temperature, the total rainfall and find the wettest month?', 'Annual range = highest monthly temperature − lowest monthly temperature (°C). Total rainfall = sum of the 12 monthly figures (mm). The wettest month is the month with the highest rainfall.'),
  ...QA('Give the main characteristics of the tropical wet and dry (savanna) climate.', 'Hot all year (25 to 33 °C), with the highest temperatures just before the rains; rainfall of about 750 to 1,500 mm; **one rainy season** (summer) and a **long dry season** of 5 to 7 months; annual range of about 5 to 8 °C. Example: Garoua.'),
  ...QA('Describe two adaptations of savanna vegetation to the long dry season.', 'Trees such as the baobab store water in their thick trunks; many trees shed their leaves in the dry season to reduce water loss; trees have deep roots and thick bark against fires; grasses dry up above the ground and grow again with the first rains.'),
  P('**Practice:** study the climate data of a station Z (approximate values).', { before: 40, after: 20 }),
  CLIM([14, 16, 20, 25, 29, 33, 34, 33, 30, 25, 19, 15], [5, 3, 2, 0, 0, 0, 0, 0, 0, 1, 3, 6]),
  ...QA('Calculate the annual range of temperature and the total rainfall of station Z.', 'Range = 34 − 14 = **20 °C**. Total rainfall = **20 mm**.'),
  ...QA('Name the biome of station Z and give two reasons.', '**Hot desert** biome: the rainfall is very low (20 mm, far below 250 mm), and the annual range of temperature is very large (20 °C) with very hot summers.'),
  ...QA('Compare the main biomes studied.', 'Equatorial: hot and wet all year, range 2–3 °C, evergreen forest. Savanna: one rainy and one dry season, grassland with scattered trees. Monsoon: heavy summer rains and dry winter. Hot desert: below 250 mm, very large ranges, sparse xerophytic plants. Mediterranean: hot dry summers and mild wet winters.'),
  SEC('B. SOIL EROSION AND SOIL CONSERVATION'),
  ...QA('Define soil erosion and name its types.', 'Soil erosion is the **removal of the top soil** by water, wind or human activities. Types: sheet erosion, rill erosion, gully erosion and wind erosion.'),
  ...QA('Explain three human activities that cause soil erosion in Cameroon.', '**Deforestation and bush fires** leave the soil bare, so rain washes it away. **Overgrazing** by cattle in the north destroys the grass cover. **Farming up and down slopes**, as on the hills of the West, lets water run quickly and carry the soil.'),
  ...QA('Describe three methods of soil conservation used by farmers in Cameroon.', '**Terracing** on steep slopes, as in the Mandara Mountains, slows down runoff. **Contour ploughing** makes ridges across the slope that hold water. **Afforestation, cover crops and mulching** protect the soil from rain and wind. Crop rotation, manure and controlled grazing also keep the soil fertile.'),
  ...QA('Why is soil erosion a serious problem?', 'It removes the most fertile layer of the soil, so harvests fall; it forms gullies that destroy fields and roads; the soil carried away silts rivers and reservoirs such as Lagdo.'),
  TIP('In GCE questions, **“State”** asks for short points; **“Explain”** and **“Describe”** need a full sentence for each point, with an example from Cameroon. Always show your working in calculations and give the unit (°C, mm).'),
]; };

(async () => {
  await build('DGCAST_F1_Revision_Seq1_2026-2027.docx', 'FORM ONE', 'Lesson 1 (Geography), Lesson 2 (Our Planet, the Earth), PW1 and PW2', F1());
  await build('DGCAST_F2_Revision_Seq1_2026-2027.docx', 'FORM TWO', 'Lesson 1 (Rapid growth), PW1 (Demographic indices), Lesson 2 (Uneven distribution), PW2 (Densities in Cameroon)', F2());
  await build('DGCAST_F2T_Revision_Seq1_2026-2027.docx', 'FORM TWO TECHNICAL', 'Lesson 1: The equatorial region (location, climate, soils, vegetation, resources, activities, problems)', F2T());
  await build('DGCAST_F3_Revision_Seq1_2026-2027.docx', 'FORM THREE', 'Lesson 1 (Our Planet, the Earth), Further Study 1 (Universe and Moon), Lesson 2 (Latitudes and Longitudes)', F3());
  await build('DGCAST_F4_Revision_Seq1_2026-2027.docx', 'FORM FOUR', 'Physical geography: biomes and climate data, soils, soil erosion and conservation', F4());
})();
