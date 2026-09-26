// FORM 2 TECHNICAL — v2 light lessons: Lesson 6, Africa (S20–S22)
const { run } = require('./v2');
const L = [];

L.push({
  src: 'S20_L6_P1_Africa_Location_Physical',
  situation: 'During a football tournament, a boy from Brazil asks Kevin: "Where exactly is Africa? Is it a country or a continent? Which seas are around it?"',
  sitQA: [['What is the problem in the situation?', 'The boy does not know where Africa is.'],
    ['Is Africa a country or a continent?', 'A continent, with 54 countries.'],
    ['How can Kevin show him?', 'With a map or a globe.']],
  justification: 'This lesson helps us to know where Africa is and what its land looks like.',
  activities: [
    { sec: 'I. LOCATION AND SIZE', img: 'africa_location_big.png', caption: 'Africa and the seas around it.', q: 'Name the oceans and seas around Africa.', a: 'The Atlantic Ocean, the Indian Ocean, the Mediterranean Sea and the Red Sea.', noProj: 'draw Africa on the board and write the four names around it.' },
    { sec: 'I. LOCATION AND SIZE', img: 'f2t_suez.jpg', caption: 'The Suez Canal in Egypt.', q: 'The Suez Canal separates Africa from which continent?', a: 'From Asia.', noProj: 'explain: a canal is a river dug by people.' },
    { sec: 'II. PHYSICAL CHARACTERISTICS', img: 'africa_plateau_big.png', caption: 'A cross-section of Africa.', q: 'Most of Africa is high, flat land. What do we call it?', a: 'A plateau.', noProj: 'compare with the Adamawa plateau.' },
    { sec: 'II. PHYSICAL CHARACTERISTICS', img: 'f2t_kilimanjaro.jpg', caption: 'Mount Kilimanjaro, Tanzania.', q: 'This is the highest mountain of Africa. What is its name?', a: 'Kilimanjaro (5,895 m).', noProj: 'compare with Mount Cameroon (4,095 m).' },
    { sec: 'II. PHYSICAL CHARACTERISTICS', img: 'f2t_nile.jpg', caption: 'The River Nile in Egypt.', q: 'This is the longest river of Africa. What is its name?', a: 'The Nile (about 6,650 km).', noProj: 'find the Nile in the atlas.' },
  ],
  summary: [
    { title: 'I. Definitions', items: [['Continent:', 'It is a very large area of land.'], ['Plateau:', 'It is a high, flat area of land.'], ['Canal:', 'It is a waterway dug by people.']] },
    { title: 'II. Location and Size', items: [['A. Seas:', 'Atlantic, Indian, Mediterranean and Red Sea.'], ['B. The Equator:', 'It crosses the middle of Africa.'], ['C. Neighbours:', 'Gibraltar (Europe) and Suez (Asia).'], ['D. Size:', 'About 30 million km² and 54 countries.']], draw: { img: 'africa_location_big.png', caption: 'Copy the map of Africa and its seas.' } },
    { title: 'III. Physical Characteristics', items: [['A. A plateau:', 'Most of Africa is high and flat.'], ['B. Highest point:', 'Kilimanjaro (5,895 m).'], ['C. Longest river:', 'The Nile.'], ['D. Coast:', 'It has few bays and few natural ports.']] },
  ],
  evaluation: [['Name the four seas and oceans around Africa.', 'Atlantic, Indian, Mediterranean and Red Sea.'], ['What is the highest mountain of Africa?', 'Kilimanjaro.']],
  remediation: ['Africa is a ______, not a country.', 'The longest river of Africa is the ______.', 'High, flat land is called a ______.'],
  remediationAnswers: '1. continent 2. Nile 3. plateau',
});

L.push({
  src: 'S21_L6_P2_Africa_Climate_Soils_Relief',
  situation: 'Douala gets about 4,000 mm of rain per year, Garoua about 1,000 mm and Maroua about 800 mm. On the Adamawa plateau, the air is cooler than in Garoua. Nadia wonders why.',
  sitQA: [['What is the problem in the situation?', 'Nadia does not know why the climate changes from place to place.'],
    ['Which town is the wettest?', 'Douala.'],
    ['Why is the Adamawa cooler?', 'It is high: the higher we go, the cooler it is.']],
  justification: 'This lesson helps us to know the climate, relief and soils of Africa.',
  activities: [
    { sec: 'I. CLIMATE', img: 'africa_climate_big.png', caption: 'The climates of Africa.', q: 'Which climate is found around the Equator? Which is near the tropics?', a: 'Equatorial near the Equator; desert near the tropics.', noProj: 'draw the Equator and bands of climate on the board.' },
    { sec: 'I. CLIMATE', img: 'f2t_tea_highlands.jpg', caption: 'Tea on the cool highlands of Kenya.', q: 'Nairobi is near the Equator, but it is cool. Why?', a: 'It is high. The higher the land, the cooler the air.', noProj: 'compare Garoua and Ngaoundéré.' },
    { sec: 'II. RELIEF', img: 'f2t_rift_valley.jpg', caption: 'The Great Rift Valley in Kenya.', q: 'The land has sunk between two lines of cracks. What is this valley called?', a: 'The Great Rift Valley.', noProj: 'show two books pushed apart with a pencil falling between them.' },
    { sec: 'II. RELIEF', img: 'f2t_atlas.jpg', caption: 'The Atlas Mountains in Morocco.', q: 'These mountains were formed by folding. Name them.', a: 'The Atlas Mountains (also the Cape Ranges).', noProj: 'fold a sheet of paper to show folding.' },
    { sec: 'III. SOILS', img: 'f2t_mount_cameroon.jpg', caption: 'A banana plantation.', q: 'Near Mount Cameroon, farmers grow bananas and tea. Why are the soils there so fertile?', a: 'They come from volcanic rocks.', noProj: 'ask learners what grows around Buea and Limbe.' },
  ],
  summary: [
    { title: 'I. Definitions', items: [['Relief:', 'It is the shape of the land: high or low.'], ['Rift valley:', 'It is a long valley formed when land sinks.'], ['Volcanic soil:', 'It is a soil made from volcano rocks.']] },
    { title: 'II. Climate', items: [['A. Equatorial:', 'Hot and wet all year.'], ['B. Tropical:', 'A wet and a dry season.'], ['C. Desert:', 'Very little rain.'], ['D. Mountain:', 'Cooler because it is high.']], draw: { img: 'africa_climate_big.png', caption: 'Copy the main climate zones.' } },
    { title: 'III. Relief', items: [['A. Plateaux:', 'High Africa in the south and east.'], ['B. Basins:', 'The Congo and Chad basins.'], ['C. Mountains:', 'Atlas (folded) and Kilimanjaro (volcano).'], ['D. Rift Valley:', 'It is in East Africa.']] },
    { title: 'IV. Soils', items: [['A. Red soils:', 'In the forest and savanna.'], ['B. Desert soils:', 'Sandy and poor.'], ['C. Volcanic soils:', 'Very fertile (Mount Cameroon).']] },
  ],
  evaluation: [['Why is Nairobi cool though it is near the Equator?', 'Because it is high.'], ['Why are the soils of Mount Cameroon fertile?', 'They come from volcanic rocks.']],
  remediation: ['Around the Equator, the climate is ______.', 'The long valley of East Africa is the Great ______ Valley.', 'Soils made from volcano rocks are ______ soils.'],
  remediationAnswers: '1. equatorial 2. Rift 3. volcanic',
});

L.push({
  src: 'S22_L6_P3_Africa_Vegetation_Drainage',
  situation: 'Lake Chad, north of Cameroon, is much smaller today than sixty years ago. Many fishermen and farmers who lived near it have lost their work. Mariam wonders why the lake is shrinking.',
  sitQA: [['What is the problem in the situation?', 'Lake Chad is getting smaller.'],
    ['Who suffers from this problem?', 'Fishermen and farmers near the lake.'],
    ['Why is the lake shrinking?', 'Less rain and too much water taken for farms.']],
  justification: 'This lesson helps us to know the vegetation, rivers and lakes of Africa.',
  activities: [
    { sec: 'I. VEGETATION', img: 'africa_vegetation_big.png', caption: 'The vegetation of Africa.', q: 'Which vegetation covers the Congo Basin? Which covers most of Africa?', a: 'Rainforest in the Congo Basin; savanna in most of Africa.', noProj: 'draw the bands of vegetation on the board.' },
    { sec: 'I. VEGETATION', img: 'f2t_rainforest.jpg', caption: 'The rainforest seen from the sky.', q: 'Why is the forest so thick here?', a: 'It is hot and wet all year near the Equator.', noProj: 'compare the forest of the South with the savanna of Garoua.' },
    { sec: 'II. DRAINAGE', img: 'africa_drainage_big.png', caption: 'The main rivers and lakes of Africa.', q: 'Name four big rivers of Africa.', a: 'The Nile, the Congo, the Niger and the Zambezi.', noProj: 'draw the four rivers on a sketch of Africa.' },
    { sec: 'II. DRAINAGE', img: 'f2t_benue.jpg', caption: 'A big river of West Africa in the dry season.', q: 'The Benue flows through Garoua. It joins which big river?', a: 'The River Niger.', noProj: 'ask learners where the Benue flows after Garoua.' },
    { sec: 'II. DRAINAGE', img: 'f2t_lake_chad.jpg', caption: 'Lake Chad from 1963 to 2007 (maps made from satellite images).', q: 'What has happened to Lake Chad?', a: 'It has become much smaller.', noProj: 'draw a big lake and a small lake on the board.' },
  ],
  summary: [
    { title: 'I. Definitions', items: [['Vegetation:', 'It is all the plants of a place.'], ['Drainage:', 'It is all the rivers and lakes of a place.'], ['Tributary:', 'It is a river that joins a bigger river.']] },
    { title: 'II. Vegetation', items: [['A. Rainforest:', 'Congo Basin and southern Cameroon.'], ['B. Savanna:', 'It covers most of Africa.'], ['C. Semi-desert and desert:', 'Thorny bushes or no plants.'], ['D. Mediterranean:', 'Bushes in the far north and south.']], draw: { img: 'africa_vegetation_big.png', caption: 'Copy the main vegetation zones.' } },
    { title: 'III. Drainage', items: [['A. The Nile:', 'The longest river; it flows to the Mediterranean.'], ['B. The Congo:', 'It carries the most water.'], ['C. The Niger:', 'The Benue joins it.'], ['D. Lakes:', 'Victoria is the largest; Chad is shrinking.'], ['E. Uses:', 'Fishing, irrigation and electricity.']] },
  ],
  evaluation: [['Which vegetation covers most of Africa?', 'The savanna.'], ['The Benue is a tributary of which river?', 'The Niger.']],
  remediation: ['The longest river of Africa is the ______.', 'A river that joins a bigger river is a ______.', 'The lake north of Cameroon that is shrinking is Lake ______.'],
  remediationAnswers: '1. Nile 2. tributary 3. Chad',
});

module.exports = L;
if (require.main === module) run(L, process.argv.slice(2).length ? process.argv.slice(2) : null);
