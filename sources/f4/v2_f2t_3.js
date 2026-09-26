// FORM 2 TECHNICAL — v2 light lessons: Lesson 4, The Temperate Region (S10–S13)
const { run } = require('./v2');
const L = [];

L.push({
  src: 'S10_L4_P1_Temperate_Location_Types_Climate',
  situation: 'Aïssatou\'s brother is going to study in France in January. He packs only T-shirts and sandals. His mother says, "You need a thick coat, gloves and closed shoes. It is winter there."',
  sitQA: [['What is the problem in the situation?', 'The brother does not know that France is cold in January.'],
    ['What season is it in France in January?', 'Winter.'],
    ['What should he take?', 'A thick coat, gloves and closed shoes.']],
  justification: 'This lesson helps us to know where the temperate regions are and their seasons.',
  activities: [
    { sec: 'I. LOCATION', img: 'temperate_world_big.png', caption: 'The temperate regions of the world (green).', q: 'Between which latitudes are the temperate regions?', a: 'Between 30° and 60° north and south of the Equator.', noProj: 'draw the Equator and the lines 30° and 60° on the board.' },
    { sec: 'II. CLIMATE', img: 'four_seasons_big.png', caption: 'The four seasons of the temperate region.', q: 'How many seasons are there? Name them.', a: 'Four: spring, summer, autumn and winter.', noProj: 'write the four seasons on the board with one word for each.' },
    { sec: 'II. CLIMATE', img: 'f2t_snow_city.jpg', caption: 'A street in Europe in winter.', q: 'What covers the street? What must people wear?', a: 'Snow. People wear thick coats, gloves and boots.', noProj: 'describe snow: frozen rain that is white and very cold.' },
    { sec: 'II. CLIMATE', img: 'london_climate_big.png', caption: 'The climate of London (England).', q: 'Is it cold in winter in London? Does it rain every month?', a: 'Yes, about 5 °C in winter. Yes, it rains every month.', noProj: 'write the temperature of London in January and July on the board.' },
    { sec: 'II. CLIMATE', img: 'f2t_mediterranean.jpg', caption: 'Olive trees in a Mediterranean country in summer.', q: 'Here, summers are hot and dry, winters are mild and wet. What type of climate is this?', a: 'The Mediterranean climate.', noProj: 'name countries around the Mediterranean Sea: Spain, Italy, Greece.' },
  ],
  summary: [
    { title: 'I. Definitions', items: [['Temperate region:', 'It is a region between 30° and 60° with four seasons.'], ['Season:', 'It is a part of the year with its own weather.'], ['Westerlies:', 'They are winds that bring rain from the ocean.']] },
    { title: 'II. Location', items: [['A. Northern Hemisphere:', 'Europe, North America and Asia.'], ['B. Southern Hemisphere:', 'Argentina, South Africa, Australia and New Zealand.']], draw: { img: 'temperate_world_big.png', caption: 'Copy the lines 30° and 60° and the temperate lands.' } },
    { title: 'III. Types of Climate', intro: 'There are four seasons and three main climates:', items: [['A. Oceanic (British):', 'Mild summers, cool winters, rain all year.'], ['B. Mediterranean:', 'Hot, dry summers and mild, wet winters.'], ['C. Continental:', 'Hot summers and very cold winters.']] },
  ],
  evaluation: [['Name the four seasons of the temperate region.', 'Spring, summer, autumn and winter.'], ['Give one characteristic of the Mediterranean climate.', 'Hot, dry summers (and mild, wet winters).']],
  remediation: ['The temperate region is between 30° and ______.', 'The cold season is called ______.', 'Hot, dry summers are found in the ______ climate.'],
  remediationAnswers: '1. 60° 2. winter 3. Mediterranean',
  teacherNote: ['London data (approximate normals): January 5 °C, July 19 °C, about 600 mm of rain spread over the year.'],
});

L.push({
  src: 'S11_L4_P2_Temperate_Soils_Vegetation',
  situation: 'On a trip to Europe in November, Samuel sees a forest with yellow and red leaves. Many leaves fall to the ground. In January, the trees have no leaves at all.',
  sitQA: [['What is the problem in the situation?', 'Samuel does not know why the trees lose their leaves.'],
    ['What did he see in November and in January?', 'Yellow and red leaves in November; no leaves in January.'],
    ['What happens to the fallen leaves?', 'They rot and make the soil rich.']],
  justification: 'This lesson helps us to know the plants and soils of the temperate region.',
  activities: [
    { sec: 'I. VEGETATION', img: 'f2t_autumn_forest.jpg', caption: 'A forest in autumn.', q: 'Why do these trees lose their leaves in autumn?', a: 'To survive the cold winter.', noProj: 'compare with savanna trees that lose their leaves in the dry season.' },
    { sec: 'I. VEGETATION', img: 'f2t_conifer.jpg', caption: 'A forest of pine trees in winter.', q: 'These trees keep their thin, needle leaves in winter. How do the leaves help them?', a: 'Needle leaves lose little water and the snow slides off.', noProj: 'show a picture of a Christmas tree (pine).' },
    { sec: 'I. VEGETATION', img: 'f2t_olive_tree.jpg', caption: 'An olive tree.', q: 'The olive tree has small, hard leaves. How does this help it in the dry summer?', a: 'Small, hard leaves lose little water.', noProj: 'bring a bottle of olive oil to class.' },
    { sec: 'I. VEGETATION', img: 'f2t_prairie.jpg', caption: 'A grassland in North America.', q: 'There are almost no trees here, only grass. Why?', a: 'There is too little rain for trees.', noProj: 'name the temperate grasslands: Prairies, Steppes, Pampas, Veld.' },
    { sec: 'II. SOILS', img: 'f2t_black_soil.jpg', caption: 'A dark, rich soil.', q: 'This black soil is found under grasslands. Why is it good for wheat?', a: 'It is full of humus, so it is very fertile.', noProj: 'compare with the red soils of Garoua.' },
  ],
  summary: [
    { title: 'I. Definitions', items: [['Deciduous forest:', 'It is a forest whose trees lose their leaves in autumn.'], ['Coniferous forest:', 'It is a forest of trees with needle leaves.'], ['Chernozem:', 'It is a very black and rich soil.']] },
    { title: 'II. Vegetation', items: [['A. Deciduous forest:', 'Oak and beech lose their leaves in autumn.'], ['B. Coniferous forest:', 'Pine trees keep their needles.'], ['C. Mediterranean plants:', 'Olive trees have small, hard leaves.'], ['D. Grasslands:', 'Short grass and few trees.']] },
    { title: 'III. Soils', items: [['A. Brown forest soils:', 'They are rich in humus.'], ['B. Podzols:', 'They are grey and poor.'], ['C. Chernozems:', 'They are black and very rich.'], ['D. Red soils:', 'They are found around the Mediterranean.']] },
  ],
  evaluation: [['Why do deciduous trees lose their leaves in autumn?', 'To survive the cold winter.'], ['Why is the chernozem good for wheat?', 'It is black and full of humus, so it is very fertile.']],
  remediation: ['Trees that lose their leaves in autumn form a ______ forest.', 'Pine trees have ______ leaves.', 'The black, rich soil of grasslands is the ______.'],
  remediationAnswers: '1. deciduous 2. needle 3. chernozem',
});

L.push({
  src: 'S12_L4_P3_Temperate_Farming',
  situation: 'In a shop in Garoua, Blaise sees wheat flour from France, milk powder from the Netherlands and olive oil from Spain. He wonders how these countries produce so much food.',
  sitQA: [['What is the problem in the situation?', 'Blaise does not know how these countries produce so much food.'],
    ['Name the three products and their countries.', 'Flour (France), milk (Netherlands), olive oil (Spain).'],
    ['What helps these farmers to produce a lot?', 'Machines, good seeds and fertilisers.']],
  justification: 'This lesson helps us to know how farmers work in the temperate region.',
  activities: [
    { sec: 'I. TYPES OF FARMING', img: 'f2t_mixed_farm.jpg', caption: 'Cows on a farm with fields.', q: 'This farmer grows crops and rears animals on the same farm. What is this type of farming?', a: 'Mixed farming.', noProj: 'ask learners if their family grows crops and keeps animals too.' },
    { sec: 'I. TYPES OF FARMING', img: 'f2t_dairy.jpg', caption: 'Cows on a farm in the Netherlands.', q: 'These cows are reared for milk, butter and cheese. What is this type of farming?', a: 'Dairy farming.', noProj: 'show a tin of powdered milk.' },
    { sec: 'I. TYPES OF FARMING', img: 'f2t_combine.jpg', caption: 'A big machine harvests wheat.', q: 'Why can one farmer in Canada grow so much wheat?', a: 'He uses big machines on a huge farm.', noProj: 'compare with a farmer who harvests sorghum by hand.' },
    { sec: 'I. TYPES OF FARMING', img: 'f2t_ranch.jpg', caption: 'A farmer with his sheep.', q: 'In Australia, sheep are reared on huge farms. What are these farms called?', a: 'Ranches.', noProj: 'compare with the ranches of the Adamawa plateau.' },
    { sec: 'I. TYPES OF FARMING', img: 'f2t_vineyard.jpg', caption: 'Picking grapes in France.', q: 'Name two crops of Mediterranean farming.', a: 'Grapes and olives (also oranges and wheat).', noProj: 'ask learners where oranges in the market come from.' },
  ],
  summary: [
    { title: 'I. Definitions', items: [['Mixed farming:', 'It is growing crops and rearing animals on the same farm.'], ['Dairy farming:', 'It is rearing cows for milk.'], ['Ranch:', 'It is a very large farm for animals.']] },
    { title: 'II. Types of Farming', items: [['A. Mixed farming:', 'England and France.'], ['B. Dairy farming:', 'The Netherlands and Denmark.'], ['C. Grain farming:', 'Wheat on the Prairies of Canada.'], ['D. Ranching:', 'Argentina and Australia.'], ['E. Mediterranean farming:', 'Olives, grapes and oranges.']] },
    { title: 'III. Characteristics', items: [['A. Machines:', 'Few workers produce a lot.'], ['B. Science:', 'Good seeds and fertilisers.'], ['C. Trade:', 'Most products are sold.']] },
  ],
  evaluation: [['What is mixed farming?', 'Growing crops and rearing animals on the same farm.'], ['Why do temperate farmers produce a lot?', 'They use machines, good seeds and fertilisers.']],
  remediation: ['Rearing cows for milk is ______ farming.', 'A very large farm for animals is a ______.', 'Wheat is harvested by a big ______.'],
  remediationAnswers: '1. dairy 2. ranch 3. machine (combine harvester)',
});

L.push({
  src: 'S13_L4_P4_Temperate_Problems_Adaptations',
  situation: 'In January, heavy snow falls on a village in Canada. The roads are blocked, the water pipes freeze and the farmer cannot take his cows out.',
  sitQA: [['What is the problem in the situation?', 'The snow blocks the roads and freezes the water pipes.'],
    ['Why can the cows not go out?', 'The grass is under the snow.'],
    ['What can the farmer give them?', 'Hay that he stored in summer.']],
  justification: 'This lesson helps us to know the problems of the temperate region and how people adapt.',
  activities: [
    { sec: 'I. PROBLEMS FACED', img: 'f2t_snowplough.jpg', caption: 'A machine clears the snow from a road.', q: 'What problem does snow cause? How do people solve it?', a: 'It blocks the roads. Machines clear the snow.', noProj: 'describe a road covered with snow.' },
    { sec: 'I. PROBLEMS FACED', img: 'f2t_dust_bowl.jpg', caption: 'A dust storm on a farm in the USA in the 1930s.', q: 'The wind blew away the dry soil of the farms. What was this disaster called?', a: 'The Dust Bowl.', noProj: 'compare with a very strong Harmattan.' },
    { sec: 'I. PROBLEMS FACED', img: 'f2t_forest_fire.jpg', caption: 'A forest fire in Greece in summer.', q: 'Why are there forest fires around the Mediterranean in summer?', a: 'The summer is hot and dry, so plants burn easily.', noProj: 'compare with bush fires in the savanna.' },
    { sec: 'II. ADAPTATIONS', img: 'f2t_greenhouse.jpg', caption: 'Vegetables grow inside a glass house.', q: 'How can farmers grow vegetables when it is too cold outside?', a: 'They grow them in greenhouses, where it is warm.', noProj: 'explain: a house of glass that keeps the heat of the sun.' },
    { sec: 'II. ADAPTATIONS', img: 'f2t_shelterbelt.jpg', caption: 'Lines of trees around fields.', q: 'Why do farmers plant lines of trees around their fields?', a: 'The trees stop the wind, so the soil is not blown away.', noProj: 'compare with trees planted against the Harmattan.' },
  ],
  summary: [
    { title: 'I. Definitions', items: [['Greenhouse:', 'It is a glass house where plants grow in the warmth.'], ['Shelterbelt:', 'It is a line of trees that stops the wind.'], ['Frost:', 'It is ice that forms when it is very cold.']] },
    { title: 'II. Problems Faced', items: [['A. Cold winters:', 'Snow blocks roads and freezes pipes.'], ['B. Short growing season:', 'Crops grow only in summer.'], ['C. Soil erosion:', 'The wind blows away dry soil.'], ['D. Forest fires:', 'They burn Mediterranean forests.'], ['E. Pollution:', 'Fertilisers pollute rivers.']] },
    { title: 'III. Adaptations', items: [['A. Houses and clothes:', 'Heating, thick walls and coats.'], ['B. Transport:', 'Machines clear the snow.'], ['C. Farming:', 'Greenhouses and stored hay.'], ['D. Soil protection:', 'Shelterbelts stop the wind.']] },
  ],
  evaluation: [['Give two problems of the temperate region.', 'Cold winters with snow; soil erosion by wind.'], ['How can farmers grow vegetables in winter?', 'In greenhouses.']],
  remediation: ['A glass house for plants is a ______.', 'A line of trees that stops the wind is a ______.', 'The 1930s disaster in the USA was the Dust ______.'],
  remediationAnswers: '1. greenhouse 2. shelterbelt 3. Bowl',
});

module.exports = L;
if (require.main === module) run(L, process.argv.slice(2).length ? process.argv.slice(2) : null);
