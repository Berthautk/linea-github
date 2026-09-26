// FORM 2 TECHNICAL — v2 light lessons: Lesson 1 (problems), Lesson 2 (climate), S01–S04
const { run } = require('./v2');
const L = [];

// ============ LESSON 1 (week 7): Equatorial region — problems and solutions ============
L.push({
  src: 'FORM2TECH_LESSON1_WEEK7_Problems_Solutions',
  situation: 'Paul visits his uncle in a village of the East Region. A logging company has cut many trees near the village. After a heavy rain, muddy water runs into the village stream. Now the water is dirty and there are fewer fish.',
  sitQA: [['What is the problem in the situation?', 'The village stream is muddy and has fewer fish.'],
    ['Why did the mud go into the stream?', 'The trees were cut, so the rain washed the bare soil into the stream.'],
    ['What can the village do?', 'It can plant trees and keep the trees along the stream.']],
  justification: 'This lesson helps us to know the problems of the forest region and how to solve them.',
  activities: [
    { sec: 'I. PROBLEMS FACED BY MAN', img: 'f2t_muddy_road.jpg', caption: 'A road after heavy rain in Cameroon.', q: 'Look at the road. What problem does heavy rain cause for transport?', a: 'The road becomes muddy. Cars and people move with difficulty.', noProj: 'ask learners to describe the roads of their village in August.' },
    { sec: 'I. PROBLEMS FACED BY MAN', img: 'f2t_mosquito_net.jpg', caption: 'A bed with a mosquito net.', q: 'Why do people sleep under a net like this? Which disease does it prevent?', a: 'The net stops mosquitoes. It prevents malaria.', noProj: 'show a real mosquito net in class.' },
    { sec: 'II. PROBLEMS CAUSED BY MAN', img: 'f2t_logging_truck.jpg', caption: 'A lorry carries big logs in the East Region of Cameroon.', q: 'Where do these logs come from? What happens to the forest?', a: 'They come from the forest. The trees are cut: this is deforestation.', noProj: 'ask learners where the wood of their school desks comes from.' },
    { sec: 'II. PROBLEMS CAUSED BY MAN', img: 'erosion_rain.gif', caption: 'Animation: rain on bare soil (left) and on soil covered with plants (right).', q: 'On which side does the rain wash the soil away? Why?', a: 'On the left, because the soil is bare. The plants protect the soil on the right.', noProj: 'pour water on bare soil and on soil with grass.' },
    { sec: 'III. ATTEMPTED SOLUTIONS', img: 'f2t_tree_planting.jpg', caption: 'A girl holds a young tree to plant it.', q: 'What is she going to do? How does it help the forest?', a: 'She will plant the young tree. New trees bring the forest back.', noProj: 'ask learners if they have ever planted a tree.' },
  ],
  summary: [
    { title: 'I. Definitions', items: [['Deforestation:', 'It is the cutting down of forests.'], ['Soil erosion:', 'It is the washing away of soil by rain or wind.'], ['Reforestation:', 'It is the planting of new trees.'], ['Conservation:', 'It is the protection of nature for the future.']] },
    { title: 'II. Problems Faced by Man', intro: 'The main problems are:', items: [['A. Transport:', 'Heavy rain makes the roads muddy.'], ['B. Diseases:', 'Mosquitoes carry malaria.'], ['C. The thick forest:', 'It is hard to clear for farms and roads.'], ['D. Poor soils:', 'Rain washes the plant food out of the soil.']] },
    { title: 'III. Problems Caused by Man', intro: 'The main problems are:', items: [['A. Deforestation:', 'People cut too many trees.'], ['B. Soil erosion:', 'Rain washes away the bare soil.'], ['C. Loss of animals:', 'Gorillas and elephants become rare.'], ['D. Water pollution:', 'Mining makes the rivers dirty.']] },
    { title: 'IV. Attempted Solutions', intro: 'The main solutions are:', items: [['A. Reforestation:', 'People plant new trees.'], ['B. Protected areas:', 'Parks like the Dja protect plants and animals.'], ['C. Selective logging:', 'Companies cut only some big trees.'], ['D. Health care:', 'The government gives mosquito nets.']] },
  ],
  evaluation: [['Give two problems faced by man in the forest region.', 'Muddy roads and diseases like malaria.'], ['Give two solutions to deforestation.', 'Planting new trees and creating protected areas.']],
  remediation: ['The cutting down of forests is called ______.', 'Mosquitoes carry a disease called ______.', 'The planting of new trees is called ______.'],
  remediationAnswers: '1. deforestation 2. malaria 3. reforestation',
  teacherNote: ['Dja Faunal Reserve: UNESCO World Heritage site since 1987. Forestry Law No. 94/01 of 20 January 1994 obliges logging companies to follow a management plan.'],
});

// ============ LESSON 2 (week 8): Tropical grassland — location and climate ============
L.push({
  src: 'FORM2TECH_LESSON2_WEEK8_Tropical_Grassland_Climate',
  situation: 'In March, Moussa\'s father plants maize near Garoua. After a few weeks, the young plants dry up and die. His neighbour plants in June, and his maize grows well.',
  sitQA: [['What is the problem in the situation?', 'The maize of Moussa\'s father died.'],
    ['Why did it die?', 'He planted in March, in the dry season. There was no rain.'],
    ['When should he plant?', 'He should plant when the rains start, in May or June.']],
  justification: 'This lesson helps us to know where the savanna is and to understand its seasons.',
  activities: [
    { sec: 'I. DEFINITION AND LOCATION', img: 'f2t_savanna.jpg', caption: 'The savanna: tall grass and trees far apart.', q: 'Describe the plants in the picture. What do we call this region?', a: 'Tall grass and trees far apart. It is the savanna, or Tropical Grassland.', noProj: 'ask learners to describe the land between Garoua and Ngaoundéré.' },
    { sec: 'I. DEFINITION AND LOCATION', img: 'savanna_africa_big.png', caption: 'The savanna regions of Africa.', q: 'Between which latitudes do we find the savanna?', a: 'Between 5° and 15° north and south of the Equator.', noProj: 'draw the Equator and the lines 5° and 15° on the board.' },
    { sec: 'II. CLIMATE', img: 'garoua_climate_big.png', caption: 'The climate of Garoua: rain (blue bars) and temperature (red line).', q: 'Which months are wet in Garoua? Which months are dry?', a: 'Wet: May to October. Dry: November to April.', noProj: 'write the rainfall of Garoua month by month on the board.' },
    { sec: 'II. CLIMATE', img: 'f2t_harmattan.jpg', caption: 'A dusty sky in the dry season.', q: 'Which dry, dusty wind makes the sky grey in the dry season?', a: 'The Harmattan. It comes from the Sahara Desert.', noProj: 'ask learners how the sky looks in December in Garoua.' },
    { sec: 'II. CLIMATE', img: 'f2t_storm.jpg', caption: 'A big storm cloud in the rainy season.', q: 'How does the rain fall in the savanna in the wet season?', a: 'It falls as heavy storms with thunder, usually in the afternoon.', noProj: 'ask learners to describe a storm in July.' },
  ],
  summary: [
    { title: 'I. Definitions', items: [['Savanna:', 'It is a region of tall grass and trees far apart.'], ['Wet season:', 'It is the period of the year when it rains.'], ['Harmattan:', 'It is a dry and dusty wind from the Sahara.']] },
    { title: 'II. Location', intro: 'The savanna is between 5° and 15° north and south of the Equator:', items: [['A. Africa:', 'West Africa (North Cameroon), East Africa and Southern Africa.'], ['B. South America:', 'The Llanos and the Campos.'], ['C. Australia:', 'The north of the country.']], draw: { img: 'savanna_africa_big.png', caption: 'Copy the savanna belt and the lines 5° and 15°.' } },
    { title: 'III. Climate', intro: 'The climate has these characteristics:', items: [['A. Temperature:', 'It is hot all year (20 °C to 33 °C).'], ['B. Seasons:', 'There is a wet season and a dry season.'], ['C. Rainfall:', 'It is between 500 mm and 1,500 mm per year.'], ['D. Winds:', 'The Harmattan blows in the dry season.']] },
  ],
  evaluation: [['Between which latitudes is the savanna found?', 'Between 5° and 15° north and south of the Equator.'], ['Name the two seasons of Garoua.', 'The wet season (May–October) and the dry season (November–April).']],
  remediation: ['Tall grass and trees far apart form the ______.', 'The dry, dusty wind from the Sahara is the ______.', 'In Garoua, the rains fall from May to ______.'],
  remediationAnswers: '1. savanna 2. Harmattan 3. October',
  teacherNote: ['Garoua climate data: NOAA climate normals 1961–1990 (about 1,000 mm per year; hottest month April, 33 °C).'],
});

// ============ S01: Soils and vegetation ============
L.push({
  src: 'S01_L2_P2_Tropical_Grassland_Soils_Vegetation',
  situation: 'In January, Hawa travels from Garoua to Ngaoundéré. The grass is dry and yellow, and many trees have no leaves. But one big tree, the shea tree, still has leaves, and its bark is not burnt.',
  sitQA: [['What is the problem in the situation?', 'Hawa does not know how savanna plants survive the dry season.'],
    ['What did Hawa see?', 'Dry grass and trees without leaves.'],
    ['How can we protect the trees from fire?', 'We can avoid bush fires and make firebreaks.']],
  justification: 'This lesson helps us to know the plants and soils around us.',
  activities: [
    { sec: 'I. VEGETATION', img: 'f2t_baobab.jpg', caption: 'A baobab tree.', q: 'Look at the trunk of the baobab. How does it help the tree in the dry season?', a: 'The big trunk keeps water for the dry season.', noProj: 'ask learners where they have seen a baobab.' },
    { sec: 'I. VEGETATION', img: 'f2t_dry_trees.jpg', caption: 'A tree without leaves in the dry season.', q: 'Why do many savanna trees lose their leaves in the dry season?', a: 'To lose less water when there is no rain.', noProj: 'ask learners which trees near their home lose their leaves.' },
    { sec: 'I. VEGETATION', img: 'f2t_shea_tree.jpg', caption: 'A shea tree (karité).', q: 'The shea tree has a thick bark. How does it help the tree?', a: 'The thick bark protects the tree from bush fires.', noProj: 'bring a piece of shea bark or shea butter to class.' },
    { sec: 'II. SOILS', img: 'f2t_laterite.jpg', caption: 'Bricks cut from red laterite.', q: 'This red soil becomes very hard when it dries. What is it called? What do we use it for?', a: 'It is laterite. We use it for roads and bricks.', noProj: 'ask learners the colour of the soil of the school yard.' },
    { sec: 'II. SOILS', img: 'f2t_cracked_soil.jpg', caption: 'Clay soil with big cracks in the dry season.', q: 'Black cotton soils are clay soils that crack when dry. Why do farmers like them?', a: 'It is fertile and keeps water. It is good for cotton and sorghum.', noProj: 'describe the black soils (karal) of the Far North.' },
  ],
  summary: [
    { title: 'I. Definitions', items: [['Deciduous tree:', 'It is a tree that loses its leaves in the dry season.'], ['Laterite:', 'It is a hard, red layer in the soil.'], ['Leaching:', 'It is the washing of plant food deep into the soil.']] },
    { title: 'II. Vegetation', intro: 'The vegetation of the savanna is:', items: [['A. Grass:', 'Tall grass grows up to 3 metres high.'], ['B. Trees:', 'Baobab, acacia and shea trees grow far apart.'], ['C. Adaptation:', 'Many trees lose their leaves in the dry season.'], ['D. Thick bark:', 'It protects trees from bush fires.']] },
    { title: 'III. Soils', intro: 'The soils of the savanna are:', items: [['A. Red soils:', 'They are only fairly fertile.'], ['B. Laterite:', 'It is used for roads and bricks.'], ['C. Black cotton soils:', 'They are fertile and keep water.'], ['D. Little humus:', 'Bush fires burn the dead plants.']] },
  ],
  evaluation: [['Give two ways savanna trees survive the dry season.', 'They lose their leaves; the baobab keeps water in its trunk.'], ['What is laterite used for?', 'For roads and bricks.']],
  remediation: ['Trees that lose their leaves are ______ trees.', 'The tree that keeps water in its trunk is the ______.', 'The hard red layer in the soil is ______.'],
  remediationAnswers: '1. deciduous 2. baobab 3. laterite',
});

// ============ S02: Resources ============
L.push({
  src: 'S02_L2_P3_Tropical_Grassland_Resources',
  situation: 'Ibrahim lives near the Lagdo lake. His uncle fishes in the lake, his father grows cotton, and his cousin guides tourists in the Bénoué National Park. A visitor says, "The savanna is a poor region."',
  sitQA: [['What is the problem in the situation?', 'A visitor thinks the savanna is poor, but it has many resources.'],
    ['Name three resources in the situation.', 'Fish, farmland for cotton, and wild animals.'],
    ['What can Ibrahim answer?', 'He can say that the savanna gives food, money and jobs.']],
  justification: 'This lesson helps us to know the riches of the savanna and how people use them.',
  activities: [
    { sec: 'I. PASTURE', img: 'f2t_cattle.jpg', caption: 'Cattle feed on the savanna grass.', q: 'What do these animals eat? Who rears them in North Cameroon?', a: 'They eat grass. The Fulani (Mbororo) rear them.', noProj: 'ask learners who rears cattle in their area.' },
    { sec: 'II. FARMLAND', img: 'f2t_cotton_field.jpg', caption: 'A cotton field.', q: 'Which crop grows here? Why do farmers grow it?', a: 'Cotton. Farmers sell it to earn money.', noProj: 'bring a piece of raw cotton to class.' },
    { sec: 'III. WILDLIFE', img: 'f2t_elephants.jpg', caption: 'Elephants in a savanna park.', q: 'Where can we see these animals in North Cameroon? Who comes to see them?', a: 'In the Bénoué, Bouba Ndjida and Waza parks. Tourists come to see them.', noProj: 'ask learners to name wild animals of the savanna.' },
    { sec: 'IV. WATER', img: 'f2t_lagdo.jpg', caption: 'A lake made by a dam, seen from the sky.', q: 'The Lagdo dam made a big lake on the Benue. Give two ways people use its water.', a: 'For fishing and for electricity. Also to water the fields.', noProj: 'ask learners where the electricity of Garoua comes from.' },
    { sec: 'V. TREES', img: 'f2t_charcoal.jpg', caption: 'Bags of charcoal for sale.', q: 'What do people make from the trees of the savanna?', a: 'Firewood, charcoal, shea butter and fruits.', noProj: 'ask learners what their mother uses to cook.' },
  ],
  summary: [
    { title: 'I. Definitions', items: [['Resource:', 'It is anything in nature that people can use.'], ['Exploitation:', 'It is the use of a resource to meet our needs or earn money.']] },
    { title: 'II. Resources and Their Exploitation', intro: 'The main resources are:', items: [['A. Pasture:', 'The grass feeds cattle, sheep and goats.'], ['B. Farmland:', 'Farmers grow cotton, maize and sorghum.'], ['C. Wildlife:', 'Tourists visit the national parks.'], ['D. Water:', 'The Lagdo dam gives fish and electricity.'], ['E. Trees:', 'They give firewood, charcoal and shea butter.']] },
  ],
  evaluation: [['What is a resource?', 'It is anything in nature that people can use.'], ['Give two resources of the savanna and how they are used.', 'Grass for cattle; water of Lagdo for fishing and electricity.']],
  remediation: ['Anything in nature that people can use is a ______.', 'The grass is used to feed ______.', 'The Lagdo dam produces fish and ______.'],
  remediationAnswers: '1. resource 2. cattle (animals) 3. electricity',
  teacherNote: ['The Lagdo dam on the Benue (1982) produces about 72 MW of electricity.'],
});

// ============ S03: Human activities ============
L.push({
  src: 'S03_L2_P4_Tropical_Grassland_Human_Activities',
  situation: 'Every year in November, Adamou, a Fulani herder, leaves his village near Garoua with his cattle. He walks south for weeks and comes back when the rains return. His classmate Paul thinks Adamou is lost.',
  sitQA: [['What is the problem in the situation?', 'Paul does not understand why Adamou moves every year.'],
    ['When does Adamou leave, and when does he come back?', 'He leaves in November and comes back when the rains return.'],
    ['Why does he move?', 'To find grass and water for his cattle.']],
  justification: 'This lesson helps us to know the work of the people of the savanna.',
  activities: [
    { sec: 'I. CROP FARMING', img: 'f2t_cotton_harvest.jpg', caption: 'Farmers harvest cotton.', q: 'Do farmers grow cotton to eat it or to sell it? What do we call this type of crop?', a: 'To sell it. It is a cash crop.', noProj: 'ask learners which crops their family sells.' },
    { sec: 'I. CROP FARMING', img: 'f2t_rice_field.jpg', caption: 'A rice field with water.', q: 'Rice needs a lot of water. How do farmers get water in the dry savanna?', a: 'They bring water from rivers and dams to the fields: irrigation.', noProj: 'mention the rice fields of Lagdo and Yagoua (SEMRY).' },
    { sec: 'II. LIVESTOCK REARING', img: 'transhumance.gif', caption: 'Animation: the herder moves with his cattle.', q: 'Where does the herder go in the dry season? And in the rainy season?', a: 'South in the dry season; back north in the rainy season.', noProj: 'draw an arrow going south and an arrow going north on the board.' },
    { sec: 'II. LIVESTOCK REARING', img: 'f2t_maasai.jpg', caption: 'Maasai herders with their cattle in East Africa.', q: 'Why are cattle important for these herders?', a: 'Cattle give milk, meat and money. They show that a man is rich.', noProj: 'compare with the Fulani of North Cameroon.' },
    { sec: 'III. OTHER ACTIVITIES', img: 'f2t_fishing.jpg', caption: 'Fishermen in a canoe on a river.', q: 'Give two other activities of the people of the savanna.', a: 'Fishing and tourism. Also hunting and cutting wood.', noProj: 'ask learners what work their parents do.' },
  ],
  summary: [
    { title: 'I. Definitions', items: [['Cash crop:', 'It is a crop grown to be sold.'], ['Food crop:', 'It is a crop grown to feed the family.'], ['Transhumance:', 'It is the movement of herders with their animals between seasons.'], ['Irrigation:', 'It is bringing water to the fields.']] },
    { title: 'II. Crop Farming', intro: 'Crop farming in the savanna:', items: [['A. Food crops:', 'Farmers grow sorghum, millet and maize.'], ['B. Cash crops:', 'Farmers grow cotton and sell it to SODECOTON.'], ['C. Irrigated farming:', 'Rice is grown at Lagdo and Yagoua.']] },
    { title: 'III. Livestock Rearing', intro: 'Herders rear animals in three ways:', items: [['A. Nomadic herding:', 'Herders move from place to place.'], ['B. Transhumance:', 'Herders go south in the dry season.'], ['C. Ranching:', 'Cattle are kept on the Adamawa plateau.']] },
    { title: 'IV. Other Activities', items: [['A. Fishing:', 'People fish in the Lagdo lake and the Benue.'], ['B. Tourism:', 'Tourists visit the national parks.'], ['C. Hunting:', 'People hunt in hunting zones.']] },
  ],
  evaluation: [['What is the difference between a food crop and a cash crop?', 'A food crop feeds the family; a cash crop is sold.'], ['What is transhumance?', 'The movement of herders with their animals between seasons.']],
  remediation: ['Cotton is a ______ crop.', 'The movement of herders between seasons is called ______.', 'Bringing water to the fields is called ______.'],
  remediationAnswers: '1. cash 2. transhumance 3. irrigation',
  teacherNote: ['SODECOTON buys the cotton of North Cameroon; SEMRY manages the irrigated rice fields of Yagoua.'],
});

// ============ S04: Problems and solutions (pilot, now with real photos) ============
L.push({
  src: 'S04_L2_P5_Tropical_Grassland_Problems_Solutions',
  situation: 'In a village near Garoua, a herder\'s cattle entered a farmer\'s field at night and ate his maize. The two men started to fight.',
  sitQA: [['What is the problem in the situation?', 'A herder and a farmer are fighting because the cattle ate the maize.'],
    ['Why did the cattle enter the field?', 'There was little grass, and nobody guarded them.'],
    ['What can the chief do?', 'He can separate farms from grazing areas.']],
  justification: 'This lesson helps us to know the problems of the savanna and how to solve them.',
  activities: [
    { sec: 'I. PROBLEMS FACED', img: 'f2t_drought.jpg', caption: 'Dry, cracked soil after a long time without rain.', q: 'What problem do you see in the picture?', a: 'Drought: there is no rain, so the crops dry up.', noProj: 'ask learners what happens to crops when the rain stops early.' },
    { sec: 'I. PROBLEMS FACED', img: 'f2t_bushfire.jpg', caption: 'Land after a bush fire.', q: 'What does a bush fire leave behind it?', a: 'It leaves burnt, bare soil. Plants and animals are destroyed.', noProj: 'ask learners who have seen a bush fire to describe the land after it.' },
    { sec: 'I. PROBLEMS FACED', img: 'erosion_rain.gif', caption: 'Animation: rain on bare soil and on grass.', q: 'Why is the soil washed away on the left, but not on the right?', a: 'On the left, the soil is bare. On the right, the grass protects it.', noProj: 'pour water on a tray of bare soil and on a tray of soil with grass.' },
    { sec: 'I. PROBLEMS FACED', img: 'f2t_cattle_field.jpg', caption: 'Herders and cattle on a path between farms.', q: 'Why do farmers and herders sometimes fight?', a: 'Cattle enter the fields and eat the crops.', noProj: 'use the situation of the lesson.' },
    { sec: 'II. ATTEMPTED SOLUTIONS', img: 'f2t_tree_planting_sahel.jpg', caption: 'Young trees planted in rows.', q: 'How does planting trees help the savanna?', a: 'Trees protect the soil and stop the desert from spreading.', noProj: 'ask learners where trees have been planted in Garoua.' },
  ],
  summary: [
    { title: 'I. Definitions', items: [['Drought:', 'It is a long period without enough rain.'], ['Overgrazing:', 'It is when too many animals eat the grass of the same land.'], ['Desertification:', 'It is the spread of the desert.']] },
    { title: 'II. Problems Faced', intro: 'The main problems are:', items: [['A. Drought:', 'Crops dry up.'], ['B. Bush fires:', 'They destroy plants and animals.'], ['C. Soil erosion:', 'Rain and wind remove bare soil.'], ['D. Farmer–herder conflicts:', 'Cattle eat the crops.']] },
    { title: 'III. Attempted Solutions', intro: 'The main solutions are:', items: [['A. Irrigation:', 'Farmers water their crops.'], ['B. Tree planting:', 'Trees stop the desert.'], ['C. Firebreaks:', 'They stop bush fires.'], ['D. Grazing zones:', 'They separate cattle from farms.']] },
  ],
  evaluation: [['Give two problems of the savanna.', 'Drought and bush fires (also soil erosion and conflicts).'], ['Give two solutions.', 'Irrigation and tree planting.']],
  remediation: ['A long period without rain is a ______.', 'Too many animals on the same land is ______.', 'Planting trees helps to stop the ______.'],
  remediationAnswers: '1. drought 2. overgrazing 3. desert',
  teacherNote: ['Opération Sahel Vert is the Cameroonian tree-planting programme in the North and Far North.'],
});

module.exports = L;
if (require.main === module) run(L, process.argv.slice(2).length ? process.argv.slice(2) : null);
