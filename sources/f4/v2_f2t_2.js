// FORM 2 TECHNICAL — v2 light lessons: Lesson 3, The Desert Regions (S05–S09)
const { run } = require('./v2');
const L = [];

L.push({
  src: 'S05_L3_P1_Desert_Location_Types',
  situation: 'In Garoua, Salma watches a film about the Sahara. She is surprised: the desert is not only sand. There are also plains of stones and bare rocky mountains.',
  sitQA: [['What is the problem in the situation?', 'Salma thought that the desert was only sand.'],
    ['What did she see in the film?', 'Sand, plains of stones and rocky mountains.'],
    ['Where can she learn more about deserts?', 'In her atlas, her textbook and in this lesson.']],
  justification: 'This lesson helps us to know where deserts are and why they are dry.',
  activities: [
    { sec: 'I. DEFINITION AND LOCATION', img: 'f2t_erg.jpg', caption: 'Sand dunes in the Sahara.', q: 'This region gets less than 250 mm of rain per year. What do we call it?', a: 'A desert.', noProj: 'ask learners to describe the Sahara from films or pictures.' },
    { sec: 'I. DEFINITION AND LOCATION', img: 'deserts_world_big.png', caption: 'The main hot deserts of the world.', q: 'Near which lines are most hot deserts found?', a: 'Near the Tropic of Cancer and the Tropic of Capricorn.', noProj: 'draw the Equator and the two tropics on the board and place the Sahara.' },
    { sec: 'II. TYPES OF DESERTS', img: 'f2t_reg.jpg', caption: 'A desert covered with small stones.', q: 'Is this desert made of sand? What is it made of?', a: 'No. It is made of stones: it is a stony desert (reg).', noProj: 'show a handful of sand and a handful of gravel.' },
    { sec: 'II. TYPES OF DESERTS', img: 'f2t_rocky_desert.jpg', caption: 'A desert of bare rock.', q: 'This desert is made of bare rock. What do we call it?', a: 'A rocky desert (hamada).', noProj: 'describe the rocky hills of the Sahara (Hoggar, Tibesti).' },
    { sec: 'III. CAUSES OF DESERTS', img: 'trade_wind_dry.png', caption: 'The wind comes from the land, not from the sea.', q: 'Why does this wind bring no rain?', a: 'It comes from the land, so it is dry. There are no clouds.', noProj: 'remind learners that the Harmattan is dry because it comes from the Sahara.' },
  ],
  summary: [
    { title: 'I. Definitions', items: [['Desert:', 'It is a region with less than 250 mm of rain per year and very few plants.'], ['Erg:', 'It is a sandy desert.'], ['Reg:', 'It is a stony desert.'], ['Hamada:', 'It is a rocky desert.']] },
    { title: 'II. Location', intro: 'Hot deserts are near the tropics:', items: [['A. Africa:', 'The Sahara, the Kalahari and the Namib.'], ['B. Asia:', 'The Arabian Desert and the Thar Desert.'], ['C. America and Australia:', 'The Atacama, the Mojave and the Australian Desert.']], draw: { img: 'deserts_world_big.png', caption: 'Copy the tropics and the main deserts.' } },
    { title: 'III. Types of Deserts', items: [['A. By temperature:', 'Hot deserts (Sahara) and cold deserts (Gobi).'], ['B. By surface:', 'Sandy (erg), stony (reg) and rocky (hamada).']] },
    { title: 'IV. Causes of Deserts', intro: 'Deserts are dry because of:', items: [['A. Dry winds:', 'The trade winds come from the land.'], ['B. Cold sea currents:', 'They stop rain clouds (Namib).'], ['C. Distance from the sea:', 'Wet winds do not reach the centre.'], ['D. Mountains:', 'They stop the wet winds.']] },
  ],
  evaluation: [['What is a desert?', 'A region with less than 250 mm of rain per year and very few plants.'], ['Name the three types of desert surface.', 'Sandy (erg), stony (reg) and rocky (hamada).']],
  remediation: ['A sandy desert is called an ______.', 'A stony desert is called a ______.', 'The largest hot desert in the world is the ______.'],
  remediationAnswers: '1. erg 2. reg 3. Sahara',
});

L.push({
  src: 'S06_L3_P2_Desert_Climate',
  situation: 'Oumarou, a lorry driver from Garoua, crosses the Sahara. In the day, the metal of his lorry is too hot to touch. But at night, he is so cold that he needs a blanket.',
  sitQA: [['What is the problem in the situation?', 'Oumarou does not understand why the desert is hot by day and cold at night.'],
    ['How is the desert in the day and at night?', 'Very hot in the day and cold at night.'],
    ['What should he take with him?', 'Water, light clothes for the day and a blanket for the night.']],
  justification: 'This lesson helps us to understand the climate of the desert.',
  activities: [
    { sec: 'I. RAINFALL', img: 'rain_compare_big.png', caption: 'Rain per year in Douala, Garoua and Aswan (Egypt).', q: 'Compare the rain of Aswan with the rain of Garoua.', a: 'Aswan gets only 2 mm. Garoua gets 1,000 mm, 500 times more.', noProj: 'write the three numbers on the board.' },
    { sec: 'I. RAINFALL', img: 'f2t_wadi_flood.jpg', caption: 'A sudden flood in a dry desert valley.', q: 'In the desert, rain can stop for years, then a storm brings a flood. What does this show?', a: 'The rain is rare and irregular.', noProj: 'describe a desert valley that is dry for years and suddenly full of water.' },
    { sec: 'II. TEMPERATURES', img: 'aswan_temp_big.png', caption: 'Aswan (Egypt): temperature in the day (red) and at night (blue).', q: 'What is the temperature in July in the day and at night? What is the difference?', a: 'Day 42 °C, night 26 °C. The difference is 16 °C.', noProj: 'write 42 °C and 26 °C on the board and subtract.' },
    { sec: 'II. TEMPERATURES', img: 'desert_night.gif', caption: 'Animation: the desert by day and at night.', q: 'Why does the desert become cold at night?', a: 'There are no clouds, so the heat escapes into the sky.', noProj: 'compare a cloudy night and a clear night in December in Garoua.' },
    { sec: 'III. WINDS', img: 'f2t_sandstorm.jpg', caption: 'A sandstorm arrives.', q: 'What is this? Give one danger.', a: 'A sandstorm. People cannot see, and it hurts the eyes and lungs.', noProj: 'compare with a very dusty Harmattan day.' },
  ],
  summary: [
    { title: 'I. Definitions', items: [['Daily temperature range:', 'It is the difference between the day and the night temperature.'], ['Sandstorm:', 'It is a strong wind that lifts sand into the air.']] },
    { title: 'II. Rainfall', items: [['A. Very little rain:', 'Less than 250 mm per year.'], ['B. Irregular rain:', 'It can stop for years.'], ['C. Clear skies:', 'There are almost no clouds.']] },
    { title: 'III. Temperatures', items: [['A. Hot days:', 'Often more than 40 °C.'], ['B. Cold nights:', 'The heat escapes at night.'], ['C. Large range:', 'It can be 15 °C or more.']], draw: { img: 'aswan_temp_big.png', caption: 'Copy the two lines: day and night.' } },
    { title: 'IV. Winds', items: [['A. Hot, dry winds:', 'The Harmattan and the Sirocco.'], ['B. Sandstorms:', 'They damage crops, roads and machines.']] },
  ],
  evaluation: [['Why is the desert cold at night?', 'There are no clouds, so the heat escapes.'], ['Name one hot, dry wind from the Sahara.', 'The Harmattan (or the Sirocco).']],
  remediation: ['Hot deserts get less than ______ mm of rain per year.', 'The difference between day and night temperature is the daily temperature ______.', 'A strong wind full of sand is a ______.'],
  remediationAnswers: '1. 250 2. range 3. sandstorm',
  teacherNote: ['Aswan data (approximate normals): July day 42 °C, night 26 °C; January day 23 °C, night 9 °C; rainfall about 1–2 mm per year.'],
});

L.push({
  src: 'S07_L3_P3_Desert_Soils_Vegetation',
  situation: 'Fanta planted a mango tree and a small cactus in front of her house in Garoua. She forgot to water them for three months. In March, the mango tree was dead, but the cactus was still green.',
  sitQA: [['What is the problem in the situation?', 'Fanta does not know why the cactus did not die.'],
    ['Which plant survived?', 'The cactus.'],
    ['How did it survive?', 'It keeps water inside its thick stem.']],
  justification: 'This lesson helps us to know how desert plants live with little water.',
  activities: [
    { sec: 'I. VEGETATION', img: 'f2t_desert_plants.jpg', caption: 'Plants in a desert.', q: 'Describe the plants. Why are they far apart?', a: 'They are small and far apart, because there is very little water.', noProj: 'ask learners to imagine the Sahara after the Sahel.' },
    { sec: 'I. VEGETATION', img: 'f2t_cactus.jpg', caption: 'A cactus.', q: 'The cactus has a thick stem and spines. How do they help it?', a: 'The stem keeps water. The spines lose little water and protect it.', noProj: 'bring a cactus or an aloe plant to class.' },
    { sec: 'I. VEGETATION', img: 'desert_roots_big.png', caption: 'An acacia in the desert.', q: 'Why are the roots so long?', a: 'To reach water deep under the ground.', noProj: 'draw a small tree with very long roots on the board.' },
    { sec: 'II. SOILS', img: 'f2t_salt_crust.jpg', caption: 'White salt on the soil of a desert.', q: 'The sun dries the soil and leaves white salt. Is this soil good for crops?', a: 'No. Salty soil is bad for crops.', noProj: 'describe a pot of salty water left in the sun.' },
    { sec: 'II. SOILS', img: 'f2t_nile_fields.jpg', caption: 'Green fields near the River Nile, in Egypt.', q: 'Why are the fields green here, in the middle of the desert?', a: 'Water from the Nile makes the desert soil fertile.', noProj: 'compare with the dry-season gardens along the Benue.' },
  ],
  summary: [
    { title: 'I. Definitions', items: [['Xerophyte:', 'It is a plant that can live with very little water.'], ['Humus:', 'It is the black part of the soil made of dead plants.']] },
    { title: 'II. Vegetation', intro: 'Desert plants are few. They are adapted in these ways:', items: [['A. Water storage:', 'The cactus keeps water in its stem.'], ['B. Small leaves or spines:', 'They lose little water.'], ['C. Long roots:', 'They reach water deep down.'], ['D. Short life:', 'Some plants grow only after rain.']] },
    { title: 'III. Soils', items: [['A. Sandy or stony:', 'They keep little water.'], ['B. Little humus:', 'There are few plants.'], ['C. Salty:', 'The sun leaves salt on top.'], ['D. Fertile with water:', 'Crops grow along the Nile.']] },
  ],
  evaluation: [['Give two ways desert plants are adapted.', 'They keep water in their stems; they have long roots.'], ['Why do desert soils have little humus?', 'Because there are few plants.']],
  remediation: ['A plant that lives with little water is a ______.', 'The cactus keeps water in its ______.', 'Desert soils are often ______ because the sun leaves salt.'],
  remediationAnswers: '1. xerophyte 2. stem 3. salty',
});

L.push({
  src: 'S08_L3_P4_Desert_Problems_Adaptations',
  situation: 'A Tuareg family lives in the Sahara, in Niger. Their well is dry, and there is no grass for their camels and goats. The father must decide what to do.',
  sitQA: [['What is the problem in the situation?', 'The family has no water and no grass for the animals.'],
    ['What can the father do?', 'He can move with his animals to another well.'],
    ['Which animal can help them to travel?', 'The camel.']],
  justification: 'This lesson helps us to know the problems of desert people and how they live.',
  activities: [
    { sec: 'I. PROBLEMS FACED', img: 'f2t_desert_well.jpg', caption: 'People take water from a well in the desert.', q: 'What is the biggest problem in the desert?', a: 'The lack of water.', noProj: 'ask learners how far their family goes to get water.' },
    { sec: 'I. PROBLEMS FACED', img: 'f2t_moving_sand.jpg', caption: 'Sand moved by the wind.', q: 'The wind moves this sand. What can it cover?', a: 'Roads, wells and fields.', noProj: 'describe a road covered with sand after a sandstorm.' },
    { sec: 'II. ADAPTATIONS', img: 'f2t_camels.jpg', caption: 'A camel caravan in the Sahara.', q: 'Why is the camel called the "ship of the desert"?', a: 'It can walk for days without water and carry heavy loads on sand.', noProj: 'ask learners where they have seen camels (Far North).' },
    { sec: 'II. ADAPTATIONS', img: 'f2t_tuareg.jpg', caption: 'A Tuareg man with a long turban.', q: 'Why do desert people wear long, loose clothes and a turban?', a: 'They protect the body from the sun and the sand.', noProj: 'compare with the clothes worn in Garoua in the dry season.' },
    { sec: 'II. ADAPTATIONS', img: 'f2t_desalination.jpg', caption: 'A factory that makes fresh water from sea water.', q: 'Rich desert countries have little fresh water. How do they get drinking water?', a: 'They remove the salt from sea water.', noProj: 'explain that sea water is boiled or filtered to remove the salt.' },
  ],
  summary: [
    { title: 'I. Definitions', items: [['Nomad:', 'It is a person who moves from place to place with animals.'], ['Desalination:', 'It is the removal of salt from sea water.']] },
    { title: 'II. Problems Faced', intro: 'The main problems are:', items: [['A. Lack of water:', 'Wells dry up.'], ['B. Heat and cold:', 'Hot days and cold nights.'], ['C. Sandstorms:', 'They hurt the eyes and cover roads.'], ['D. Poor soils:', 'Farming is difficult.']] },
    { title: 'III. Adaptations', intro: 'People adapt in these ways:', items: [['A. Nomadism:', 'The Tuareg move with their animals.'], ['B. The camel:', 'It travels for days without water.'], ['C. Clothes and houses:', 'Long clothes and thick mud walls.'], ['D. Water supply:', 'Wells and desalination.']] },
  ],
  evaluation: [['Give two problems of desert people.', 'Lack of water and sandstorms.'], ['Why is the camel useful in the desert?', 'It walks for days without water and carries heavy loads.']],
  remediation: ['A person who moves with his animals is a ______.', 'The "ship of the desert" is the ______.', 'Removing salt from sea water is called ______.'],
  remediationAnswers: '1. nomad 2. camel 3. desalination',
});

L.push({
  src: 'S09_L3_P5_Desert_Farming_Oases',
  situation: 'In the middle of the Sahara, travellers see a green place with tall palm trees and gardens. All around, there is only sand. Musa wonders how crops can grow there.',
  sitQA: [['What is the problem in the situation?', 'Musa does not know how crops grow in the desert.'],
    ['What did the travellers see?', 'Palm trees and gardens in the middle of the sand.'],
    ['What do crops need to grow in the desert?', 'Water.']],
  justification: 'This lesson helps us to know how people farm in the desert.',
  activities: [
    { sec: 'I. THE OASIS', img: 'f2t_oasis.jpg', caption: 'An oasis in the Sahara.', q: 'What do we call this green place in the desert?', a: 'An oasis.', noProj: 'describe an oasis: palm trees and water in the middle of the sand.' },
    { sec: 'I. THE OASIS', img: 'oasis_big.png', caption: 'How an oasis gets its water.', q: 'Where does the water of the oasis come from?', a: 'From rain on far hills. It moves under the ground and comes up.', noProj: 'draw the hills, the water under the ground and the oasis.' },
    { sec: 'II. OASIS FARMING', img: 'oasis_layers_big.png', caption: 'The three layers of crops in an oasis.', q: 'Name the three layers of crops. Why do farmers grow crops under the palms?', a: 'Date palms, fruit trees, vegetables. The palms give shade and keep the soil wet.', noProj: 'draw a palm tree, a small fruit tree and vegetables.' },
    { sec: 'II. OASIS FARMING', img: 'f2t_shaduf.jpg', caption: 'A shaduf in Egypt.', q: 'What does this farmer use to lift water from the river?', a: 'A shaduf: a long pole with a bucket.', noProj: 'draw a shaduf: a pole, a weight and a bucket.' },
    { sec: 'II. OASIS FARMING', img: 'f2t_pivot.jpg', caption: 'Round fields watered by machines, seen from the sky.', q: 'How do modern farmers get water in the desert?', a: 'They pump water from deep wells (boreholes).', noProj: 'explain that a pump brings water from deep under the ground.' },
  ],
  summary: [
    { title: 'I. Definitions', items: [['Oasis:', 'It is a green place in the desert where there is water.'], ['Shaduf:', 'It is a pole with a bucket used to lift water.'], ['Borehole:', 'It is a deep well dug with machines.']] },
    { title: 'II. The Oasis', items: [['A. Formation:', 'Water from far hills comes up in the desert.'], ['B. Examples:', 'Siwa in Egypt and Tafilalt in Morocco.']], draw: { img: 'oasis_big.png', caption: 'Copy this simple drawing of an oasis.' } },
    { title: 'III. Farming around Oases', items: [['A. Three layers:', 'Date palms, fruit trees and vegetables.'], ['B. Irrigation:', 'Wells, the shaduf and pumps.'], ['C. The Nile:', 'The Aswan Dam gives water all year.'], ['D. Problems:', 'Wells dry up and sand covers the fields.']] },
  ],
  evaluation: [['What is an oasis?', 'A green place in the desert where there is water.'], ['Name two ways to get water in an oasis.', 'Wells and the shaduf (or pumps).']],
  remediation: ['A green place with water in the desert is an ______.', 'The top layer of an oasis garden is the date ______.', 'A pole with a bucket for lifting water is a ______.'],
  remediationAnswers: '1. oasis 2. palm 3. shaduf',
});

module.exports = L;
if (require.main === module) run(L, process.argv.slice(2).length ? process.argv.slice(2) : null);
