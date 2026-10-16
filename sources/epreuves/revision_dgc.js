// DGCAST revision sheets, first sequence 2026-2027: one sheet per class, each question followed by its answer (max. 2 pages)
const fs = require('fs');
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, ImageRun, AlignmentType, WidthType, BorderStyle, ShadingType, VerticalAlign, Footer, PageNumber } = require('docx');

const DIR = '/tmp/claude-0/-home-user-linea-github/389cf9fb-8078-5c81-95f2-72f084366795/scratchpad/ep26/';
const OUT = process.argv[2] || DIR + 'rev/';
const LOGO = fs.readFileSync(DIR + 'logo_dgc.png');
const W = 10466, FONT = 'Times New Roman'; let S = 21;      // 10.5 pt body

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
  ...QA('Name the three main branches of geography and say what each one studies.', ['**Physical geography** studies natural features: relief, climate, rivers, soils and vegetation. **Human geography** studies people and their activities: population, settlement, economic activities. **Practical geography** studies the tools of the geographer: maps, statistics, fieldwork.']),
  ...QA('Give three methods used by geographers and two reasons why geography is important.', 'Methods: observation and fieldwork; questionnaires and interviews; maps, photographs and satellite images; statistics and graphs. Importance: it helps us to find places and read maps; it helps farmers to know the seasons and soils; it helps to plan roads, schools and towns; it teaches us to protect the environment.'),
  SEC('B. OUR PLANET, THE EARTH'),
  ...QA('Name the eight planets in order from the Sun. Why is the Earth special?', 'Mercury, Venus, **Earth** (3rd), Mars, Jupiter, Saturn, Uranus, Neptune. The Earth is the only planet known to have life, liquid water and air.'),
  ...QA('Describe the shape and size of the Earth. Name the continents and oceans.', ['A sphere, slightly flattened at the poles; circumference at the Equator about 40,000 km; diameter about 12,700 km. Water covers about **71 %** of the Earth and land about **29 %**.', 'Continents: Asia, Africa, North America, South America, Antarctica, Europe, Australia. Oceans: Pacific (the largest), Atlantic, Indian, Southern, Arctic.']),
  SEC('C. REPRESENTATION OF THE EARTH AND LOCATION OF PLACES'),
  ...QA('Give two differences between a globe and a map.', 'A globe is a **round model** of the Earth; a map is a **flat drawing** of the Earth or part of it. A globe shows the true shapes but only half of the Earth at a time; a map shows the whole Earth at once and is easy to carry.'),
  ...QA('Name four elements of the marginal information of a map and give the use of each.', '**Title**: what the map shows. **Key (legend)**: explains the signs and colours. **Scale**: helps to calculate real distances. **North arrow**: shows directions. **Latitudes and longitudes**: help to locate places.'),
  ...QA('On a map with a scale of 1 cm to 25 km, two towns are 8 cm apart. Calculate the real distance.', 'Real distance = map distance × scale value = 8 × 25 = **200 km**.'),
  ...QA('What are geographical coordinates? How do you read and write them?', 'The latitude and the longitude of a place. Find the place, follow the line of latitude to the side of the map (N or S), then the line of longitude to the top or bottom (E or W). Write the latitude first: Garoua is at about **9° N, 13° E**; Maroua 11° N, 14° E; Yaoundé 4° N, 12° E.'),
  SEC('D. THE EARTH: A PLANET MOVING IN SPACE'),
  ...QA('Define rotation, revolution, axis and orbit.', ['**Rotation**: the turning of the Earth on its axis from west to east in 24 hours. **Revolution**: the movement of the Earth around the Sun in 365¼ days.', '**Axis**: the imaginary line through the Earth from the North Pole to the South Pole. **Orbit**: the path that the Earth follows around the Sun.']),
  ...QA('Give four consequences of rotation.', 'Day and night; the Sun seems to rise in the east and to set in the west; time differences (places in the east are ahead by 1 hour for every 15° of longitude); deflection of winds and ocean currents (to the right in the Northern Hemisphere, to the left in the Southern Hemisphere).'),
  ...QA('Give four consequences of revolution.', 'Change of seasons (the Earth moves round the Sun with its axis tilted); varying length of day and night (longer in summer, shorter in winter, except at the Equator); change in the height of the midday Sun; equinoxes (21 March and 23 September) and solstices (21 June and 22 December); leap year (366 days every fourth year).'),
  QUIZ([['The turning of the Earth on its axis is called …', 'Rotation'], ['The Earth goes round the Sun in …', '365¼ days'], ['Population geography belongs to …', 'Human geography'], ['The part of a map that explains signs and colours is the …', 'Key (legend)']]),
  SEC('E. PRACTICE OF COMPETENCE'),
  BOXED('Situation', 'Moussa lives in Garoua. He wants to visit his uncle in Ngaoundéré, but on the map of Cameroon he cannot find the town, nor calculate how far it is. He asks you for help.'),
  ...QA('What is the problem raised in the situation?', 'Moussa cannot read a map: he is unable to locate Ngaoundéré and to calculate its distance from Garoua.'),
  ...QA('Propose three things Moussa can do.', 'Read the key and the title of the map; find Ngaoundéré with its coordinates (about 7° N, 14° E); measure the distance with a ruler and multiply it by the scale; ask a teacher or use a phone with GPS.'),
  firstCycleTip,
]; };

// ============================== FORM TWO ==============================
const F2 = () => { qn = 0; return [
  SEC('A. KEY DEFINITIONS'),
  ...QA('Define: population, birth rate, death rate, natural growth, density, shifting cultivation, bush fallowing.', ['**Population**: the number of people living in a place at a given time. **Birth rate**: births per 1,000 people in one year (‰). **Death rate**: deaths per 1,000 people in one year (‰). **Natural growth**: the difference between births and deaths.', '**Density**: people per km² (population ÷ area). **Shifting cultivation**: farming a plot for a few years, then moving to a new one when the soil is poor. **Bush fallowing**: leaving farmland to rest so that it becomes fertile again.']),
  SEC('B. THE RAPID GROWTH OF THE WORLD’S POPULATION'),
  ...QA('Describe the evolution of the world population.', 'Fewer than 1 billion people until about 1800; about 2.5 billion in 1950; more than **8 billion in 2022**. Growth is now fastest in Africa and Asia.'),
  ...QA('Give four factors of the rapid growth of population and three consequences on natural resources.', 'Factors: a high birth rate; a falling death rate (vaccines, hospitals, clean water); a better food supply; early marriages and big families. Consequences: farmland becomes scarce; forests are cut; water becomes scarce and polluted; soils lose their fertility.'),
  SEC('C. CALCULATION OF DEMOGRAPHIC INDICES (PRACTICE)'),
  P('A town of **150,000** inhabitants with an area of **300 km²** recorded **5,400** births and **1,350** deaths in one year.', { after: 20 }),
  ...QA('Write the formulas and calculate the birth rate and the death rate.', 'Birth rate = (births ÷ population) × 1,000 = (5,400 ÷ 150,000) × 1,000 = **36 ‰**. Death rate = (deaths ÷ population) × 1,000 = (1,350 ÷ 150,000) × 1,000 = **9 ‰**.'),
  ...QA('Calculate the natural growth rate and the population density.', 'Natural growth rate = (36 − 9) ÷ 10 = **2.7 %**. Density = 150,000 ÷ 300 = **500 people per km²**.'),
  SEC('D. THE UNEVEN DISTRIBUTION OF THE WORLD’S POPULATION'),
  ...QA('Name densely and sparsely populated areas of the world.', 'Dense: East Asia, South Asia, Western Europe, West Africa, north-east USA. Sparse: hot deserts (Sahara), polar lands, high mountains, thick forests.'),
  ...QA('Give four factors of the uneven distribution of population.', 'Climate (mild climate with enough rain); relief and soils (flat land, fertile soils); water (rivers, lakes, coasts); economic factors (jobs, industries, ports, mines); social and political factors (services, security).'),
  ...QA('Classify the regions of Cameroon by population density.', 'High (over 100 per km²): Littoral, West, North-West, Far North. Moderate (20 to 100): Centre, South-West, North. Low (under 20): **East**, South, Adamawa.'),
  SEC('E. MAN IN THE EQUATORIAL ZONE'),
  ...QA('Where is the equatorial zone and what is its climate?', 'Between about **5° N and 5° S** of the Equator: the Congo Basin, the Amazon Basin, South-East Asia and southern Cameroon. It is hot all year (25 to 27 °C), with heavy rain (more than 1,500 mm a year, in almost every month) and humid air.'),
  ...QA('Name the resources of the zone and the ways they are exploited.', 'Forest (timber, fruits, medicines, game): lumbering. Farmland: shifting cultivation with bush fallowing, and plantations of cocoa, coffee, oil palm and rubber. Minerals (oil, gold, iron, bauxite): mining. Water (fish, transport, hydro-electricity): fishing and dams.'),
  ...QA('Give four problems faced by man in the zone and four solutions.', 'Problems: dense forest; heavy rain and bad roads; poor soils (rain washes out the minerals); diseases such as malaria. Solutions: tarred roads; health centres and mosquito nets; fertilisers and improved seeds; reforestation.'),
  QUIZ([['The birth rate is expressed …', 'Per thousand (‰)'], ['Region of Cameroon with the lowest density', 'The East'], ['Equatorial zone: latitudes', '5° N to 5° S'], ['Natural growth rate = …', '(birth rate − death rate) ÷ 10']]),
  SEC('F. PRACTICE OF COMPETENCE'),
  BOXED('Situation', 'In a quarter of Garoua, families get bigger every year. Long queues form at the only borehole, classrooms are overcrowded and the last trees are cut for firewood. The quarter chief asks you for help.'),
  ...QA('What is the problem raised in the situation?', 'The rapid growth of the population puts heavy pressure on the resources and services of the quarter (water, schools, trees).'),
  ...QA('Propose three solutions.', 'Educate families on family planning and send girls to school; build more boreholes and classrooms; plant trees and use improved stoves to save firewood.'),
  firstCycleTip,
]; };

// ============================== FORM TWO TECHNICAL ==============================
const F2T = () => { qn = 0; return [
  SEC('A. THE EQUATORIAL REGION: LOCATION AND CLIMATE'),
  ...QA('Where is the equatorial region located?', 'Between **5° N and 5° S** of the Equator. Africa: the Congo Basin, southern Cameroon and Gabon. South America: the Amazon Basin. Asia: Malaysia and Indonesia.'),
  ...QA('Give five characteristics of the equatorial climate.', 'Hot all year (23 to 25 °C in every month); small annual range of temperature (less than 3 °C); heavy rain in almost every month (1,500 to 2,500 mm a year); convectional rain in the afternoon, with thunder; high humidity.'),
  P('**Practice:** study the climate data of a station Y in southern Cameroon (approximate values).', { before: 40, after: 20 }),
  CLIM([25, 25, 25, 25, 24, 24, 23, 23, 24, 24, 24, 25], [40, 80, 150, 190, 210, 160, 60, 90, 230, 280, 130, 40]),
  ...QA('Calculate the annual range of temperature and the total annual rainfall. Name the wettest month.', 'Range = highest − lowest = 25 − 23 = **2 °C**. Total rainfall = sum of the 12 months = **1,660 mm**. Wettest month: **October** (280 mm). The figures show a very small range (2 °C) and heavy rainfall in every month.'),
  SEC('B. THE EQUATORIAL REGION: SOILS AND VEGETATION'),
  ...QA('Describe the equatorial vegetation and soils.', 'The forest is **evergreen**, with layers (emergents, canopy, under-canopy, shrubs, forest floor), hardwoods (sapele, iroko, mahogany, ebony) and climbers (lianas); mangroves grow in salty water on the coast. The soils are red or yellow **ferrallitic** soils; heavy rain washes the plant food away (**leaching**), the humus is thin, and the soil becomes poor after a few years of farming.'),
  SEC('C. THE EQUATORIAL REGION: RESOURCES, ACTIVITIES AND PROBLEMS'),
  ...QA('Give resources, methods of exploitation and human activities.', 'Resources: forest (timber, firewood, fruits, medicines), water (Sanaga, Congo), minerals (oil, gas, gold, iron ore, bauxite), fertile land, wildlife. Exploitation: chainsaws and sawmills, dams at Edéa and Song Loulou, oil drilling near Kribi and Limbe, farms and plantations, national parks such as Dja. Activities: **shifting cultivation**, plantations (oil palm, rubber, bananas), lumbering, hunting, gathering, fishing, mining.'),
  ...QA('Give problems faced by man, problems caused by man and attempted solutions.', 'Faced: diseases (malaria, sleeping sickness), bad roads, thick forest, poor soils. Caused: **deforestation**, soil erosion, loss of wildlife, water pollution. Solutions: reforestation, national parks, health care (nets, drugs, vaccines), better roads, forest laws.'),
  SEC('D. THE TROPICAL GRASSLAND (SAVANNA) REGION: LOCATION, CLIMATE, VEGETATION AND SOILS'),
  ...QA('Where is the savanna located?', 'Between **5° and 15° N and S** of the Equator. Africa: North Cameroon, the Sudan savanna and East Africa. South America: the Llanos and the Campos. Australia: the north.'),
  ...QA('Describe the savanna climate.', 'Hot all year (25 to 35 °C); **two seasons**: a wet season (May to October) and a dry season (November to April); rainfall of about 750 to 1,500 mm a year, in heavy storms with thunder; the Harmattan, a dry and dusty wind, blows in the dry season. Example: Garoua.'),
  ...QA('Describe the savanna vegetation and soils.', 'Vegetation: tall grass (elephant grass up to 3 m) with scattered trees (baobab, acacia, shea). Many trees lose their leaves in the dry season (deciduous); the **baobab** stores water in its trunk; thick bark protects trees from fire. Soils: red ferruginous soils rich in iron; laterite (a hard red crust used for roads and bricks); fertile black cotton soils that crack when dry; little humus because bush fires burn dead plants.'),
  ...QA('Compare the equatorial and the savanna climates.', 'Equatorial: 23–25 °C, rain all year (1,500–2,500 mm), no dry season, evergreen forest. Savanna: 25–35 °C, wet and dry seasons (750–1,500 mm), grass and scattered trees.'),
  QUIZ([['Washing down of soil nutrients by heavy rain', 'Leaching'], ['A hardwood of the equatorial forest', 'Mahogany'], ['Tree that stores water in its trunk', 'Baobab'], ['Latitudes of the savanna', '5° to 15° N and S']]),
  SEC('E. PRACTICE OF COMPETENCE'),
  BOXED('Situation', 'Near Lomié, farmers clear new forest plots every two years because their old fields no longer produce enough. The chief does not understand why the soil becomes poor so quickly.'),
  ...QA('What is the problem raised in the situation?', 'The soils become poor quickly after the forest is cleared, which pushes farmers to destroy more forest (deforestation).'),
  ...QA('Propose three measures to solve it.', 'Practise agroforestry and plant cover crops; add compost or manure to the soil; replant trees and protect the remaining forest; leave the land to rest (fallow).'),
  firstCycleTip,
]; };

// ============================== FORM THREE ==============================
const F3 = () => { qn = 0; return [
  SEC('A. OUR PLANET, THE EARTH'),
  ...QA('What are the size and the shape of the Earth?', 'The Earth is an **oblate spheroid**: round, slightly flattened at the poles and bulging at the Equator. Equatorial circumference about 40,075 km; polar circumference about 40,008 km; equatorial diameter about 12,756 km; polar diameter about 12,714 km; surface area about 510 million km².'),
  ...QA('Give four proofs that the Earth is spherical.', 'A ship sailing away disappears bottom first; the shadow of the Earth on the Moon during an eclipse is always curved; photos from space show a round Earth; a traveller who always goes in one direction comes back to the starting point; the horizon is a circle that widens as we go higher; the Sun rises earlier in the east than in the west.'),
  SEC('B. FURTHER STUDY 1: THE UNIVERSE AND THE MOON'),
  ...QA('What does the universe contain and how is it linked to the Earth?', 'Billions of galaxies (ours is the **Milky Way**), stars (the Sun is the nearest), the solar system, asteroids, comets, gases and dust. Links: the Sun gives light and heat; the Earth moves round the Sun (year and seasons); the Sun and the Moon pull the Earth (tides); the Earth is the third planet and the only one with life.'),
  ...QA('Name the phases of the Moon. Give impacts of the Moon on the environment and on human activities.', ['Month of about 29½ days: new Moon, first quarter, full Moon, last quarter.', 'Environment: tides (two a day); spring tides (new and full Moon) and neap tides (quarters); light at night; eclipses. Human activities: fishing with the tides, big ships entering shallow ports such as Douala at high tide, calendars and feasts (Ramadan), planting according to the Moon.']),
  SEC('C. LATITUDES AND LONGITUDES'),
  ...QA('Define latitude, longitude, parallels, meridians and geographical coordinates.', '**Latitude**: angular distance north or south of the Equator. **Longitude**: angular distance east or west of the Greenwich Meridian. **Parallels**: lines of equal latitude. **Meridians**: lines of equal longitude, from pole to pole. **Coordinates**: latitude and longitude together.'),
  ...QA('Give the major lines of latitude and longitude with their values.', 'Equator 0°; Tropic of Cancer 23½° N; Tropic of Capricorn 23½° S; Arctic Circle 66½° N; Antarctic Circle 66½° S; poles 90° N and S. Greenwich (Prime) Meridian 0°; the 180° meridian is opposite it. One degree of latitude is about 111 km.'),
  ...QA('Give three differences between latitudes and longitudes.', 'Latitudes run west–east, never meet and have unequal lengths (shorter towards the poles); longitudes run north–south, meet at the poles and have equal lengths. Latitudes go up to 90°, longitudes up to 180°.'),
  SEC('D. GREAT CIRCLES AND THE INTERNATIONAL DATE LINE'),
  ...QA('What is a great circle? Give examples and its importance.', 'A circle whose plane passes through the centre of the Earth and cuts it into two equal halves. Examples: the **Equator** (the only parallel that is a great circle) and every meridian joined to its opposite. The tropics and polar circles are small circles. Importance: shortest route between two places, used by aeroplanes and ships.'),
  ...QA('Where is the International Date Line and why is it important?', 'It follows the **180° meridian** in the Pacific Ocean and bends around islands and countries. West of it, the date is one day ahead. It shows where each new day begins. Crossing it **westwards**, a traveller adds one day; crossing it **eastwards**, he removes one day.'),
  SEC('E. PRACTICAL WORK 1: LOCATE A PLACE ON A MAP'),
  ...QA('How do you read the coordinates of a place on a map?', 'Find the place; follow its parallel to the side of the map and read the latitude with N or S; follow its meridian to the top or bottom and read the longitude with E or W; write the latitude first, for example **9° N, 13° E**.'),
  ...QA('Give the position of Cameroon and the coordinates of four towns.', 'Cameroon lies between about 2° N and 13° N and between 8° E and 16° E (Central Africa). Garoua 9° N, 13° E; Maroua 11° N, 14° E; Ngaoundéré 7° N, 14° E; Yaoundé 4° N, 12° E.'),
  QUIZ([['Natural satellite of the Earth', 'The Moon'], ['Tropic of Cancer', '23½° N'], ['Longitude 0°', 'Greenwich Meridian'], ['The only parallel that is a great circle', 'The Equator']]),
  SEC('F. PRACTICE OF COMPETENCE'),
  BOXED('Situation', 'Your uncle flies from Douala to New York. On the screen in the aeroplane, he sees that the route is curved, not straight, and asks why the pilot does not fly in a straight line.'),
  ...QA('What is the problem raised in the situation?', 'Your uncle does not understand why the aeroplane follows a **curved route** on the map: he does not know the notion of great circle.'),
  ...QA('Propose three ways to explain it to him.', 'Show him on a globe, with a string, that the shortest line between two places is an arc of a **great circle**; explain that the flat map hides the curve of the Earth; say that aeroplanes and ships follow great circle routes to save time and fuel.'),
  firstCycleTip,
]; };

// ============================== FORM FOUR ==============================
// follows, question by question, the paper set for Form 4 (Mr TABIT's version): 10 MCQ, structural question on a climate table, competence on soil erosion
const F4 = () => { qn = 0; return [
  SEC('PART A: MULTIPLE CHOICE QUESTIONS 1 TO 10 (what each question asks)'),
  ...QA('MCQ 1: Soil, its composition and its profile.', '**Soil** is the loose top layer of the Earth’s surface in which plants grow. It is formed by physical, chemical and biological processes and is made of **mineral particles** (about 45 %), **organic matter** or humus (about 5 %), and **water and air** (about half). Profile: topsoil (A), subsoil (B), regolith (C), bedrock (R).'),
  ...QA('MCQ 2: Soil erosion and accelerated erosion; causes and consequences.', 'Soil erosion is the removal of the topsoil by water, wind or people. **Accelerated erosion** is erosion made very fast by human activities (deforestation, overgrazing, bush fires, ploughing down slopes); **normal (geologic) erosion** is slow and natural. Forms: sheet, rill, gully, wind. Consequences: loss of fertility, falling harvests, gullies, rivers and dams filled with mud.'),
  ...QA('MCQ 3: Soil conservation methods.', '**Terracing**: flat steps cut into a steep slope. **Contour ploughing**: ploughing along the contours. **Strip cultivation**: strips of crops across the slope. **Windbreaks**: rows of trees against wind. Also: stone lines, cover crops, mulching, crop rotation, manure, controlled grazing, stopping bush fires.'),
  ...QA('MCQ 4, 5 and 6: The ecosystem, producers and energy flow.', '**Ecosystem**: a natural area where living (biotic) and non-living (abiotic) components interact. Components: abiotic factors, **producers** (green plants that make their own food from solar energy: autotrophs), consumers (herbivores, carnivores), decomposers (fungi and bacteria). Energy: only about **10 %** passes from one trophic level to the next; the rest is lost as heat. Example of a food chain: grass → zebra → lion.'),
  ...QA('MCQ 7: Features of hot deserts. Which are depositional?', 'Hot deserts: less than 250 mm of rain, very hot days and cold nights. **Depositional** (wind deposits sand): **barchans** (crescent-shaped dunes) and seif (long) dunes. **Erosional** (wind wears rock): **inselbergs**, rock pedestals, yardangs, zeugen.'),
  ...QA('MCQ 8: Solving water scarcity in hot deserts.', 'Build **water reservoirs** and dams, dig wells and boreholes, bring water by pipes or canals from rivers, irrigate oasis farms, harvest rainwater, use drip irrigation. (Wearing long sleeves or drilling for oil does not give water.)'),
  ...QA('MCQ 9 and 10: Cameroon, relief and location.', 'Relief units: Western Highlands (Mount Cameroon, 4,095 m), Adamawa Plateau, Mandara Mountains, South Cameroon Plateau; lowlands: Coastal lowlands, Benue lowland, Chad Plain. Location: between about **2° N and 13° N** and **8° E and 16° E**, in Central Africa, on the Gulf of Guinea (about 475,000 km²).'),
  QUIZ([['Soil components (4)', 'Minerals, humus, water, air'], ['Energy passed to the next trophic level', 'About 10 %'], ['Crescent-shaped desert dune', 'Barchan'], ['Latitudes of Cameroon', '2° N to 13° N']]),
  SEC('PART B: STRUCTURAL QUESTION (CLIMATE TABLE OF A STATION IN AFRICA)'),
  ...QA('How do you calculate the annual range of temperature, find the wettest month and name the biome?', 'Annual range = highest − lowest monthly temperature (show: 33 − 26 = 7 gives the method). Wettest month = month with the highest rainfall. Total rainfall = sum of the 12 months. **Biome**: look at the rainfall and the seasons, then give two reasons.'),
  ...QA('Which biome? Compare the three biomes of the course.', '**Equatorial**: 2–3 °C range, rain in every month (1,500–2,500 mm). **Savanna (tropical wet and dry)**: hot all year (about 25 to 33 °C), one rainy season and a long dry season, 750–1,500 mm. **Hot desert**: below 250 mm, very large daily and annual ranges. Always give two reasons: temperature and rainfall (total and seasons).'),
  P('**Practice:** study the climate data of a station W in Africa (approximate values).', { before: 30, after: 10 }),
  CLIM([25, 27, 29, 29, 27, 25, 24, 24, 24, 25, 26, 25], [0, 2, 15, 60, 140, 170, 200, 230, 180, 70, 5, 0]),
  ...QA('Station W: calculate the annual range of temperature, name the wettest month and the biome with two reasons.', 'Range = 29 − 24 = **5 °C**. Wettest month: **August** (230 mm). Biome: **savanna (tropical wet and dry)**: hot all year (24 to 29 °C) with a small range, and one long rainy season (May to October) followed by a long dry season, with about 1,070 mm of rain.'),
  ...QA('Savanna: adaptation of the vegetation to the dry season.', 'The **baobab** stores water in its trunk; many trees shed their leaves; roots are deep and the bark is thick against fires; grasses dry up and grow again with the first rains. Location: about 5° to 15° N and S, including northern Cameroon; soils: red ferruginous.'),
  SEC('PART C: SECTION B, COMPETENCE (A FARMER WHOSE FARM IS LOSING SOIL)'),
  ...QA('Situation: a poor widow farms a hill slope; after two years her yields drop and the soil is carried away by wind and heavy rain. What is the problem?', 'The farm is losing its soil through **soil erosion** (by wind and water), so the yields fall and the soil loses its fertility.'),
  ...QA('Task 2: state two causes of the problem.', 'Farming on a steep slope without protection (ploughing up and down); clearing the plant cover (deforestation, bush fires); heavy rain and strong winds on bare soil; over-cultivation without rest for the soil.'),
  ...QA('Task 3: as a geographer, suggest two measures.', '**Terracing** or **contour ploughing** across the slope; planting trees, **windbreaks** and cover crops; mulching; crop rotation and manure to keep the soil fertile.'),
  TIP('Answer **every** question, write in complete words, show the working for the range of temperature, and keep two marks for **presentation** (clean, neat and correct spelling).'),
]; };

(async () => {
  await build('DGCAST_F1_Revision_Seq1_2026-2027.docx', 'FORM ONE', 'Lesson 1 (Geography), Lesson 2 (Our Planet, the Earth), PW1 and PW2, Lesson 3 (The Earth: a planet moving in space)', F1());
  await build('DGCAST_F2_Revision_Seq1_2026-2027.docx', 'FORM TWO', 'Lesson 1 (Rapid growth), PW1 (Demographic indices), Lesson 2 (Uneven distribution), PW2 (Densities), Lesson 3 (Man in the equatorial zone)', F2());
  await build('DGCAST_F2T_Revision_Seq1_2026-2027.docx', 'FORM TWO TECHNICAL', 'Lesson 1: The equatorial region; Lesson 2: The tropical grassland region (climate, vegetation and soils)', F2T());
  await build('DGCAST_F3_Revision_Seq1_2026-2027.docx', 'FORM THREE', 'Our Planet; Universe and Moon; Latitudes and Longitudes; Great Circles and IDL; Locate a Place on a Map', F3());
  S = 21; const f4 = F4();
  await build('DGCAST_F4_Revision_Seq1_2026-2027.docx', 'FORM FOUR', 'the Form 4 paper question by question: soils and erosion, ecosystems, hot deserts, Cameroon, climate table and competence', f4);
})();
