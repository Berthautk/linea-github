// FORM 2 TECHNICAL — Lesson 1, parts 1–4 (Equatorial region, progression sheet weeks 2–5), added in the v3 format.
// Metadata (objectives, recall, homework, bilingual…) is in old/F2T_L1_P*.json; the board summary is in v3/f2t_0.js.
const L = [];

// ============ LESSON 1 (PART 1, week 2): location and climate ============
L.push({
  src: 'F2T_L1_P1_Equatorial_Location_Climate',
  situation: 'Nadia lives in Garoua. Her cousin in Yaoundé writes to her: "Here it rains in almost every month, the air is hot and wet, and our clothes take a long time to dry." Nadia is surprised, because in Garoua there is no rain for about six months.',
  sitQA: [['What is the problem in the situation?', 'Nadia does not understand why it rains in almost every month in Yaoundé.'],
    ['How is the weather in Yaoundé?', 'It is hot and wet, with rain in almost every month.'],
    ['Why is Yaoundé wetter than Garoua?', 'Yaoundé is closer to the Equator, in the Equatorial region.']],
  justification: 'This lesson helps us to know where the Equatorial region is and to understand its hot and wet climate.',
  activities: [
    { sec: '1. MEANING AND LOCATION', img: 'f2t_rainforest.jpg', caption: 'A thick forest near the Equator.', q: 'Describe the vegetation in the picture. In which natural region do we find it?', a: 'It is a thick, green forest with tall trees close together. We find it in the Equatorial region.', noProj: 'ask learners who have travelled south to describe the forest.' },
    { sec: '1. MEANING AND LOCATION', img: 'equatorial_world_big.png', caption: 'The Equatorial regions of the world.', q: 'Between which latitudes is the Equatorial region found? Name three areas.', a: 'Between about 5° N and 5° S of the Equator: the Amazon Basin, the Congo Basin and South-East Asia.', noProj: 'draw the Equator and two lines at 5° N and 5° S on the board.' },
    { sec: '2. CLIMATE', img: 'yaounde_climate_big.png', caption: 'The climate of Yaoundé: rain (blue bars) and temperature (red line).', q: 'Look at the red line. Is Yaoundé hot or cold? Does the temperature change much during the year?', a: 'It is hot all year, about 23 °C to 25 °C. The temperature changes very little, so the annual range is small.', noProj: 'write the monthly temperatures of Yaoundé on the board.' },
    { sec: '2. CLIMATE', img: 'yaounde_climate_big.png', caption: 'The climate of Yaoundé: two rainy seasons.', q: 'Look at the blue bars. Does it rain in every month? How many rainy seasons are there?', a: 'It rains in almost every month. There are two rainy seasons, with the heaviest rains in May and in October.', noProj: 'write the monthly rainfall of Yaoundé on the board.' },
    { sec: '2. CLIMATE', img: 'f2t_storm.jpg', caption: 'A big storm cloud in the afternoon.', q: 'In the Equatorial region, heavy rain often falls in the afternoon. Why?', a: 'The hot sun heats the wet air in the morning. The air rises, cools and forms big clouds that give heavy rain with thunder in the afternoon: this is convectional rain.', noProj: 'describe an afternoon storm in the rainy season.' },
  ],
  evaluation: [['Between which latitudes is the Equatorial region found?', 'Between about 5° N and 5° S of the Equator.'], ['Give two characteristics of the equatorial climate.', 'It is hot all year (about 25 °C) and it rains in almost every month.']],
  remediation: ['The Equatorial region is found near the ______.', 'The rain that falls in the afternoon after strong heating is ______ rain.', 'The difference between the hottest and the coldest month is the annual ______.'],
  remediationAnswers: '1. Equator 2. convectional 3. range',
  teacherNote: ['Yaoundé (Central Region) has two rainy seasons (March–June and September–November); Douala, near Mount Cameroon, receives about 4,000 mm of rain a year.'],
});

// ============ LESSON 1 (PART 2, week 3): soils and vegetation ============
L.push({
  src: 'F2T_L1_P2_Equatorial_Soils_Vegetation',
  situation: 'Jean visits a village near Ebolowa. The forest is so thick that little light reaches the ground. The farmers tell him that the soil is good for a few years after clearing the forest, and then the crops become poor.',
  sitQA: [['What is the problem in the situation?', 'The crops become poor a few years after the forest is cleared.'],
    ['Why does little light reach the ground?', 'The tall trees and their leaves cover the forest like a roof.'],
    ['Why does the soil become poor?', 'Heavy rain washes the plant food out of the soil when the forest is cleared.']],
  justification: 'This lesson helps us to understand the rich forest of the Equatorial region and its fragile soils.',
  activities: [
    { sec: '1. VEGETATION', img: 'f2t_rainforest.jpg', caption: 'The equatorial forest is green all year.', q: 'The trees of this forest are green all year. Why?', a: 'It is hot and wet all year, so the trees never need to lose all their leaves: the forest is evergreen.', noProj: 'compare with the trees of Garoua that lose their leaves in the dry season.' },
    { sec: '1. VEGETATION', img: 'rainforest_layers_big.png', caption: 'The layers of the equatorial forest.', q: 'Name the layers of the forest from the top to the ground.', a: 'The emergents, the canopy, the under-canopy, the shrub layer and the forest floor.', noProj: 'draw the layers on the board.' },
    { sec: '1. VEGETATION', img: 'lsa_mangrove.jpg', caption: 'A mangrove forest along a coast.', q: 'Where do mangroves grow in Cameroon? What is special about them?', a: 'They grow along the coast near Douala and Limbe, in salty water, on long roots above the mud.', noProj: 'describe the mangroves of the Wouri estuary.' },
    { sec: '2. SOILS', img: 'f4_redsoil.jpg', caption: 'A red soil.', q: 'What is the colour of the soils of the forest region? What gives them this colour?', a: 'They are red or yellow ferrallitic soils. Iron in the soil gives the red colour.', noProj: 'show a handful of red soil.' },
    { sec: '2. SOILS', img: 'f2t_laterite.jpg', caption: 'Hard laterite used to make bricks.', q: 'Heavy rain washes plant food deep into the soil. What is this called, and what happens to the soil?', a: 'It is leaching. The top soil becomes poor, and a hard layer of laterite can form.', noProj: 'pour water through a pot of soil and show the dirty water that comes out.' },
  ],
  evaluation: [['Give two characteristics of the equatorial forest.', 'It is evergreen and it has several layers of tall trees (also hardwoods, climbers).'], ['Why are equatorial soils poor when the forest is cleared?', 'Heavy rain washes the plant food out of the soil (leaching) and the thin humus is quickly used up.']],
  remediation: ['A forest that is green all year is ______.', 'The layer of tree tops about 30 m high is the ______.', 'The washing of plant food deep into the soil is ______.'],
  remediationAnswers: '1. evergreen 2. canopy 3. leaching',
  teacherNote: ['Hardwoods of the Cameroon forest: sapele, iroko, mahogany (acajou), ayous, moabi, ebony.'],
});

// ============ LESSON 1 (PART 3, week 4): resources and methods of exploitation ============
L.push({
  src: 'F2T_L1_P3_Equatorial_Resources',
  situation: 'In the port of Kribi, Amina sees logs, bags of cocoa and tanks of oil waiting to be loaded on ships. Her father tells her that all these products come from the forest region of Cameroon.',
  sitQA: [['What is the problem in the situation?', 'Amina wants to know the resources of the forest region and how they are exploited.'],
    ['Name three products Amina sees.', 'Logs (timber), cocoa and oil.'],
    ['Where do these products go?', 'They are exported to other countries by ship.']],
  justification: 'This lesson helps us to know the riches of the Equatorial region and how people use them.',
  activities: [
    { sec: '1. FOREST RESOURCES', img: 'f2t_logging_truck.jpg', caption: 'A lorry carries logs in the East Region of Cameroon.', q: 'Which resource is shown? How is it exploited?', a: 'Timber. Trees are cut with chainsaws and the logs are carried by lorries to sawmills and ports.', noProj: 'name objects in the classroom made of wood.' },
    { sec: '1. WATER RESOURCES', img: 'f2t_lagdo.jpg', caption: 'A dam and its lake.', q: 'How are the big rivers of the forest region, like the Sanaga, used?', a: 'Dams produce hydro-electricity, as at Edéa and Song Loulou, and people fish in the rivers.', noProj: 'ask where the electricity of Garoua comes from.' },
    { sec: '1. MINERAL RESOURCES', img: 'f2t_gold_mining.jpg', caption: 'Artisanal gold mining.', q: 'Name two minerals of the forest region of Cameroon and how they are exploited.', a: 'Oil is drilled under the sea near Kribi and Limbe; gold is dug and washed by hand in the East.', noProj: 'list the minerals learners know.' },
    { sec: '1. FARMLAND', img: 'usa_cocoa.jpg', caption: 'A farmer dries cocoa beans in the sun.', q: 'Which crop is this? Why does it grow well in the forest region?', a: 'Cocoa. It needs heat and rain all year, like the equatorial climate.', noProj: 'show a chocolate wrapper.' },
    { sec: '1. WILDLIFE', img: 'f2t_elephants.jpg', caption: 'Elephants in a national park.', q: 'How is the wildlife of the forest exploited?', a: 'By tourism in national parks like the Dja and Lobéké, and by hunting, which must be controlled.', noProj: 'name animals of the forest.' },
  ],
  evaluation: [['Name four resources of the Equatorial region.', 'Timber, water, minerals (oil, gold), farmland and wildlife.'], ['How is timber exploited?', 'Trees are cut with chainsaws, carried by lorries and sawn in sawmills or exported.']],
  remediation: ['Wood used for building and furniture is called ______.', 'The dams at Edéa and Song Loulou are on the River ______.', 'Oil is drilled under the sea near ______ and Limbe.'],
  remediationAnswers: '1. timber 2. Sanaga 3. Kribi',
  teacherNote: ['The photo shows a dam and its lake (in the USA); in the forest region of Cameroon the main dams are Edéa, Song Loulou, Lom Pangar, Memve\'ele and Nachtigal.'],
});

// ============ LESSON 1 (PART 4, week 5): human activities ============
L.push({
  src: 'F2T_L1_P4_Equatorial_Human_Activities',
  situation: 'Paul\'s grandfather lives near Sangmélima. Every few years he clears a new piece of forest, burns it and plants cassava and plantains. Near the town, a big company grows oil palm on a very large farm.',
  sitQA: [['What is the problem in the situation?', 'We want to know the different ways people farm in the forest region.'],
    ['What does the grandfather do every few years?', 'He clears and burns a new piece of forest to farm.'],
    ['How is the company farm different?', 'It is very large, it grows one crop and it sells the harvest.']],
  justification: 'This lesson helps us to understand how people earn a living in the Equatorial region.',
  activities: [
    { sec: '1. SHIFTING CULTIVATION', img: 'f2t_clearing.jpg', caption: 'A piece of forest cleared and burnt for farming.', q: 'What is this farmer preparing? Why does he move to a new place after a few years?', a: 'He is preparing a farm by slash and burn. After a few years the soil becomes poor, so he moves: this is shifting cultivation.', noProj: 'describe how a farm is cleared in the forest.' },
    { sec: '1. FOOD CROPS', img: 'f2t_cassava_farm.jpg', caption: 'A farm with cassava and bananas.', q: 'Name three food crops grown in the forest region.', a: 'Cassava, plantains and cocoyams (also maize and groundnuts).', noProj: 'list foods from the south sold in Garoua.' },
    { sec: '1. PLANTATIONS', img: 'lsa_oilpalm.jpg', caption: 'An oil palm plantation seen from the air.', q: 'What is a plantation? Give two examples in Cameroon.', a: 'A very large farm that grows one cash crop for sale, like the oil palm and rubber of the CDC or SOCAPALM.', noProj: 'name products made from palm oil.' },
    { sec: '1. CASH CROPS', img: 'usa_cocoa.jpg', caption: 'A small farmer dries cocoa beans.', q: 'Which cash crops do small farmers grow in the forest region?', a: 'Cocoa and coffee (also oil palm and bananas).', noProj: 'ask who has seen cocoa pods.' },
    { sec: '2. LUMBERING', img: 'usa_sawmill.jpg', caption: 'Workers in a sawmill.', q: 'Give the stages of lumbering from the forest to the port.', a: 'Felling the trees, dragging the logs, carrying them by lorry, sawing them in a sawmill and exporting them from Douala or Kribi.', noProj: 'write the stages on the board.' },
  ],
  evaluation: [['What is shifting cultivation?', 'Clearing and burning a piece of forest, farming it for a few years and moving to a new place when the soil is poor.'], ['Name two activities other than farming in the Equatorial region.', 'Lumbering and hunting (also gathering, fishing, mining).']],
  remediation: ['Clearing the forest by cutting and burning is called slash and ______.', 'A very large farm that grows one cash crop is a ______.', 'The cutting and selling of trees for timber is ______.'],
  remediationAnswers: '1. burn 2. plantation 3. lumbering',
  teacherNote: ['The Baka of the East and South Regions live mainly from hunting and gathering; hunting is regulated by the Forestry Law of 1994 (protected species, hunting seasons).'],
});

module.exports = L;
