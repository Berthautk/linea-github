// FORM 4 — v2 light lessons (50 minutes, 3 activities): L14–L17, FS2, L18–L22
const { run } = require('./v2');
const L = [];

L.push({
  src: 'FORM4_LESSON14_Denudation',
  situation: 'After a heavy storm in Garoua, Halima sees a small channel cut in the red soil beside the road. The water carried sand and stones and dropped them lower down.',
  sitQA: [['What is the problem in the situation?', 'Halima does not know how water changes the land.'],
    ['What did the water do?', 'It cut a channel, carried sand and stones, and dropped them.'],
    ['What do we call this wearing down of the land?', 'Denudation.']],
  justification: 'This lesson helps us to know how the land is slowly worn down.',
  activities: [
    { sec: 'I. DEFINITION', img: 'f4_gully.jpg', caption: 'A channel cut by rain water in red soil.', q: 'What has the rain water done to the soil?', a: 'It has worn away the soil and carried it away.', noProj: 'describe the channels beside the roads after a storm.' },
    { sec: 'II. PROCESSES', img: 'denudation.gif', caption: 'Animation: the four processes of denudation.', q: 'Name the four processes in the right order.', a: 'Weathering, erosion, transport, deposition.', noProj: 'write the four words with arrows on the board.' },
    { sec: 'III. AGENTS', img: 'f4_muddyriver.jpg', caption: 'A muddy river seen from space.', q: 'Which agent carries the mud? Name two other agents.', a: 'Running water. Others: wind, waves, ice.', noProj: 'compare the Benue in August and in March.' },
  ],
  summary: [
    { title: 'I. Definitions', items: [['Denudation:', 'It is the wearing down of the land.'], ['Weathering:', 'It is the breaking of rocks in their place.'], ['Erosion:', 'It is the wearing away and removal of rock and soil.'], ['Deposition:', 'It is the dropping of the material.']] },
    { title: 'II. Processes', items: [['A. Weathering:', 'Rocks break in their place.'], ['B. Erosion:', 'Pieces are picked up.'], ['C. Transport:', 'Pieces are carried away.'], ['D. Deposition:', 'Pieces are dropped.']], draw: { img: 'denudation_last.png', caption: 'Copy the four boxes.' } },
    { title: 'III. Agents', items: [['A. Running water:', 'The most important agent.'], ['B. Wind:', 'Strong in deserts.'], ['C. Waves:', 'On the coast (Kribi, Limbe).'], ['D. Ice:', 'In cold mountains.']] },
  ],
  evaluation: [['What is denudation?', 'The wearing down of the land.'], ['Name the four processes of denudation.', 'Weathering, erosion, transport and deposition.']],
  remediation: ['The breaking of rocks in their place is ______.', 'The dropping of material is ______.', 'The most important agent of denudation is running ______.'],
  remediationAnswers: '1. weathering 2. deposition 3. water',
});

L.push({
  src: 'FORM4_LESSON15_Weathering',
  situation: 'In Sadou\'s compound, an old wall is cracked. Its stones break into sandy pieces at the bottom. A new wall with the same stones still looks strong.',
  sitQA: [['What is the problem in the situation?', 'The old wall breaks into pieces.'],
    ['Why is the old wall weaker than the new one?', 'It has been in the sun and rain for many years.'],
    ['What do we call this slow breaking of rock?', 'Weathering.']],
  justification: 'This lesson helps us to know how rocks break down.',
  activities: [
    { sec: 'I. DEFINITION', img: 'f4_oldwall.jpg', caption: 'An old wall that is breaking.', q: 'What makes this old wall break slowly?', a: 'Sun, rain and air: weathering.', noProj: 'show an old wall of the school.' },
    { sec: 'II. TYPES', img: 'f4_rust.jpg', caption: 'A rusty piece of metal.', q: 'Rain and air make iron red and weak. Which type of weathering is similar?', a: 'Chemical weathering.', noProj: 'show a rusty nail.' },
    { sec: 'III. FACTORS', img: 'f4_roots.jpg', caption: 'Tree roots break a rock.', q: 'How can plants break rocks?', a: 'Their roots grow in cracks and open them.', noProj: 'show a tree root in a cracked wall or road.' },
  ],
  summary: [
    { title: 'I. Definitions', items: [['Weathering:', 'It is the breaking down of rocks in their place.'], ['Physical weathering:', 'Rocks break into pieces but do not change.'], ['Chemical weathering:', 'The minerals of the rock change.']] },
    { title: 'II. Types of Weathering', items: [['A. Physical:', 'Heat, cold and roots break rocks.'], ['B. Chemical:', 'Rain and air make rocks rot.']], draw: { img: 'weathering_types_big.png', caption: 'Copy the table.' } },
    { title: 'III. Factors', items: [['A. Climate:', 'Hot, wet areas favour chemical weathering.'], ['B. Type of rock:', 'Soft rocks break faster.'], ['C. Plants and animals:', 'Roots and animals break rocks.'], ['D. People:', 'Roads and quarries expose rocks.']] },
  ],
  evaluation: [['What is weathering?', 'The breaking down of rocks in their place.'], ['Give the two types of weathering.', 'Physical and chemical weathering.']],
  remediation: ['Rocks breaking into pieces without changing is ______ weathering.', 'Rain and air change the minerals: ______ weathering.', 'Tree ______ can break rocks.'],
  remediationAnswers: '1. physical 2. chemical 3. roots',
});

L.push({
  src: 'FORM4_LESSON16_Physical_Weathering',
  situation: 'In the dry season, Yaya walks past a big granite rock. At midday, it is too hot to touch. Its outer surface peels off in thin layers, like an onion.',
  sitQA: [['What is the problem in the situation?', 'Yaya does not know why the rock peels off.'],
    ['When is the rock very hot?', 'At midday, in the dry season.'],
    ['What happens at night?', 'The rock cools down.']],
  justification: 'This lesson helps us to know how rocks break into pieces.',
  activities: [
    { sec: 'I. THERMAL SHATTERING', img: 'exfoliation.gif', caption: 'Animation: heating by day, cooling at night.', q: 'What happens to the outer layer of the rock after many days and nights?', a: 'It cracks and peels off.', noProj: 'compare with a glass that breaks when hot water is poured in it.' },
    { sec: 'I. THERMAL SHATTERING', img: 'f4_granite.jpg', caption: 'Round granite rocks in a hot, dry area.', q: 'These granite rocks lost their outer layers again and again. What do we call this peeling of rock?', a: 'Exfoliation (onion weathering).', noProj: 'ask learners about big granite rocks near Garoua.' },
    { sec: 'II. OTHER PROCESSES', img: 'f4_roots.jpg', caption: 'Tree roots in a cracked rock.', q: 'How do the roots break the rock?', a: 'They grow bigger in the cracks and push the rock apart.', noProj: 'show a road cracked by tree roots.' },
  ],
  summary: [
    { title: 'I. Definitions', items: [['Physical weathering:', 'It is the breaking of rocks into pieces without changing them.'], ['Exfoliation:', 'It is the peeling of rock in thin layers.']] },
    { title: 'II. Processes and Products', items: [['A. Heating and cooling:', 'Rocks peel off (exfoliation).'], ['B. Frost:', 'Water freezes in cracks and breaks rocks.'], ['C. Wetting and drying:', 'Clay rocks crumble.'], ['D. Roots and animals:', 'They open cracks.'], ['E. Release of pressure:', 'Granite cracks in layers.']], draw: { img: 'exfoliation_last.png', caption: 'Copy the peeling rock.' } },
  ],
  evaluation: [['Why does granite peel off in hot deserts?', 'It gets hot by day and cold at night, again and again.'], ['How do roots break rocks?', 'They grow in cracks and push the rock apart.']],
  remediation: ['The peeling of rock like an onion is ______.', 'Water that freezes in cracks causes ______ shattering.', 'Physical weathering does not change the ______ of the rock.'],
  remediationAnswers: '1. exfoliation 2. frost 3. minerals',
});

L.push({
  src: 'FORM4_LESSON17_Chemical_Weathering',
  situation: 'In the rainy season, Kaltouma sees that the old metal gate of her compound is reddish-brown. It flakes and crumbles. A new gate still shines.',
  sitQA: [['What is the problem in the situation?', 'The old gate is rusting and breaking.'],
    ['What makes it rust?', 'Rain and the air (oxygen).'],
    ['Can rocks also rust?', 'Yes, rocks with iron become red: oxidation.']],
  justification: 'This lesson helps us to know how rain and air change rocks.',
  activities: [
    { sec: 'I. OXIDATION', img: 'f4_rust.jpg', caption: 'Rusty metal.', q: 'Rain and air make iron red. What is this process?', a: 'Oxidation.', noProj: 'show a rusty nail and a new nail.' },
    { sec: 'II. OXIDATION', img: 'f4_redsoil.jpg', caption: 'Red soil in a dry area.', q: 'Why are many soils around Garoua red?', a: 'The iron in the soil is oxidised (rusted).', noProj: 'show red soil from the school yard.' },
    { sec: 'III. CARBONATION', img: 'f4_karst.jpg', caption: 'A cave in limestone.', q: 'Rain water dissolves limestone. What forms after a long time?', a: 'Caves (with stalactites).', noProj: 'drop a piece of chalk in vinegar: it slowly dissolves.' },
  ],
  summary: [
    { title: 'I. Definitions', items: [['Chemical weathering:', 'It is the change of the minerals of a rock.'], ['Oxidation:', 'It is the rusting of iron in rocks.'], ['Carbonation:', 'It is when rain water dissolves limestone.']] },
    { title: 'II. Processes and Products', items: [['A. Solution:', 'Water dissolves salts.'], ['B. Carbonation:', 'Limestone forms caves.'], ['C. Oxidation:', 'Iron makes soils red.'], ['D. Hydrolysis:', 'Granite becomes clay.'], ['E. Hydration:', 'Rocks take water and swell.']] },
  ],
  evaluation: [['Why are the soils of Garoua red?', 'The iron in them is oxidised.'], ['What does carbonation produce in limestone?', 'Caves.']],
  remediation: ['The rusting of iron in rocks is ______.', 'Rain water dissolves limestone by ______.', 'Granite changes into clay by ______.'],
  remediationAnswers: '1. oxidation 2. carbonation 3. hydrolysis',
});

L.push({
  src: 'FORM4_FURTHER_STUDY2_Impact_of_Weathering',
  situation: 'Djaouro\'s uncle says that his rich soil came from rocks that broke down over thousands of years. But last rainy season, rocks fell from a hill and blocked the road to his farm.',
  sitQA: [['What is the problem in the situation?', 'Weathering gives good soil but also causes rockfalls.'],
    ['What is good about weathering?', 'It makes soil.'],
    ['What is bad about it?', 'Weathered rocks can fall and block roads.']],
  justification: 'This lesson helps us to know the good and bad effects of weathering.',
  activities: [
    { sec: 'I. POSITIVE IMPACTS', img: 'soil_profile_big.png', caption: 'A soil profile.', q: 'How does weathering make soil?', a: 'Rocks break down and mix with humus.', noProj: 'dig a small hole and show the layers.' },
    { sec: 'II. NEGATIVE IMPACTS', img: 'f4_landslide.jpg', caption: 'A landslide on a road.', q: 'Why do landslides often happen after heavy rain?', a: 'Weathered soil gets wet and heavy, and slides down.', noProj: 'describe a landslide in the West or South-West regions.' },
    { sec: 'III. MEASURES', img: 'f4_terraces.jpg', caption: 'Steps (terraces) on a hillside.', q: 'How do these steps protect the slope?', a: 'They slow the water and hold the soil.', noProj: 'describe terraces in the Mandara Mountains.' },
  ],
  summary: [
    { title: 'I. Definitions', items: [['Soil:', 'It is the top layer of the land where plants grow.'], ['Landslide:', 'It is the sliding of soil and rocks down a slope.']] },
    { title: 'II. Positive Impacts', items: [['A. Soil:', 'Weathering makes soil for farming.'], ['B. Minerals:', 'Bauxite of Minim-Martap.'], ['C. Materials:', 'Sand and clay for building.']] },
    { title: 'III. Negative Impacts', items: [['A. Landslides:', 'They block roads and destroy houses.'], ['B. Buildings:', 'Walls and roads crack.'], ['C. Leaching:', 'Rain washes plant food away.']] },
    { title: 'IV. Measures', items: [['A. Trees and grass:', 'They hold the soil.'], ['B. Terraces:', 'They slow the water.'], ['C. Good buildings:', 'Strong walls and drains.']] },
  ],
  evaluation: [['Give one positive impact of weathering.', 'It makes soil.'], ['Give one measure against landslides.', 'Plant trees on slopes (or build terraces).']],
  remediation: ['Weathering helps to form ______.', 'Soil sliding down a slope is a ______.', 'Steps built on a hillside are ______.'],
  remediationAnswers: '1. soil 2. landslide 3. terraces',
});

L.push({
  src: 'FORM4_LESSON18_Action_of_Rivers',
  situation: 'The Benue begins on the Adamawa Plateau and flows into Nigeria. In Garoua, it is wide and slow and carries a lot of brown mud in the rainy season.',
  sitQA: [['What is the problem in the situation?', 'We want to understand how the river changes from its start to its end.'],
    ['Where does the Benue begin?', 'On the Adamawa Plateau.'],
    ['What does it carry?', 'Mud and sand.']],
  justification: 'This lesson helps us to understand the work of rivers.',
  activities: [
    { sec: 'I. THE LONG PROFILE', img: 'long_profile_big.png', caption: 'The long profile of a river.', q: 'Where is the river steep? Where is it almost flat?', a: 'Steep near the source; almost flat near the mouth.', noProj: 'draw a curve going down from left to right.' },
    { sec: 'II. EROSION', img: 'river_erosion_big.png', caption: 'The four ways a river erodes.', q: 'Name the four ways a river wears away its bed and banks.', a: 'Hydraulic action, abrasion, attrition and solution.', noProj: 'write the four words on the board.' },
    { sec: 'III. TRANSPORT', img: 'f4_muddyriver.jpg', caption: 'A muddy river seen from space.', q: 'What does the brown colour show?', a: 'The river carries a lot of mud (its load).', noProj: 'shake soil in a bottle of water.' },
  ],
  summary: [
    { title: 'I. Definitions', items: [['Source:', 'It is the place where a river begins.'], ['Mouth:', 'It is the place where a river ends.'], ['Long profile:', 'It is the slope of a river from source to mouth.'], ['Load:', 'It is the material carried by a river.']] },
    { title: 'II. The Three Courses', items: [['A. Upper course:', 'Steep; the river cuts down.'], ['B. Middle course:', 'Gentle; the river cuts sideways.'], ['C. Lower course:', 'Flat; the river drops its load.']], draw: { img: 'long_profile_big.png', caption: 'Copy the long profile.' } },
    { title: 'III. River Erosion', items: [['A. Hydraulic action:', 'The force of water breaks rock.'], ['B. Abrasion:', 'Stones scrape the bed.'], ['C. Attrition:', 'Stones hit each other.'], ['D. Solution:', 'Water dissolves rocks.']] },
  ],
  evaluation: [['Name the three courses of a river.', 'Upper, middle and lower course.'], ['What is attrition?', 'Stones hit each other and become smaller.']],
  remediation: ['The place where a river begins is its ______.', 'The material carried by a river is its ______.', 'Stones scraping the river bed is ______.'],
  remediationAnswers: '1. source 2. load 3. abrasion',
});

L.push({
  src: 'FORM4_LESSON19_Upper_Course',
  situation: 'Near Ngaoundéré, the Vina River falls over a cliff of hard rock. The water is fast and noisy, and the valley sides are steep. Bouba compares it with the slow Benue at Garoua.',
  sitQA: [['What is the problem in the situation?', 'Bouba does not know why the river is so different in two places.'],
    ['Describe the Vina near Ngaoundéré.', 'Fast, noisy, with a waterfall and steep sides.'],
    ['Which course of the river is this?', 'The upper course.']],
  justification: 'This lesson helps us to know the landforms of the upper course.',
  activities: [
    { sec: 'I. V-SHAPED VALLEY', img: 'vvalley_big.png', caption: 'A cross-section of a valley in the upper course.', q: 'What is the shape of this valley? Why?', a: 'A V shape. The river cuts down into its bed.', noProj: 'draw a V on the board.' },
    { sec: 'II. WATERFALL', img: 'f4_waterfall.jpg', caption: 'A waterfall.', q: 'Why does a waterfall form?', a: 'The river flows from hard rock onto soft rock that wears away faster.', noProj: 'describe the Vina Falls near Ngaoundéré.' },
    { sec: 'II. WATERFALL', img: 'waterfall.gif', caption: 'Animation: a waterfall moves back and makes a gorge.', q: 'What happens to the waterfall over many years?', a: 'It moves back and leaves a gorge.', noProj: 'draw the hard rock on top of soft rock.' },
  ],
  summary: [
    { title: 'I. Definitions', items: [['Upper course:', 'It is the steep part of a river near its source.'], ['Waterfall:', 'It is a place where a river falls over a cliff.'], ['Gorge:', 'It is a deep, narrow valley below a waterfall.']] },
    { title: 'II. Characteristics', items: [['A. Slope:', 'Steep.'], ['B. Water:', 'Fast and noisy.'], ['C. Main work:', 'The river cuts down (vertical erosion).']] },
    { title: 'III. Landforms', items: [['A. V-shaped valley:', 'Narrow with steep sides.'], ['B. Interlocking spurs:', 'Hills the river winds around.'], ['C. Waterfall and gorge:', 'Hard rock on soft rock.'], ['D. Rapids and potholes:', 'Fast water on rocks.']], draw: { img: 'waterfall_last.png', caption: 'Copy the waterfall.' } },
  ],
  evaluation: [['What is the main work of a river in its upper course?', 'It cuts down (vertical erosion).'], ['How does a gorge form?', 'The waterfall moves back and leaves a deep, narrow valley.']],
  remediation: ['In the upper course, the valley is ______-shaped.', 'A river falling over a cliff forms a ______.', 'The deep valley below a waterfall is a ______.'],
  remediationAnswers: '1. V 2. waterfall 3. gorge',
});

L.push({
  src: 'FORM4_LESSON20_Middle_Course',
  situation: 'From the Benue Bridge in Garoua, Adama sees that the river bends. On the outside of the bend, the bank is steep. On the inside, there is a gentle beach of sand.',
  sitQA: [['What is the problem in the situation?', 'Adama does not know why the two banks are different.'],
    ['Describe the two banks.', 'Steep outside; gentle and sandy inside.'],
    ['What do we call a big bend in a river?', 'A meander.']],
  justification: 'This lesson helps us to know the landforms of the middle course.',
  activities: [
    { sec: 'I. MEANDERS', img: 'f4_meander.jpg', caption: 'A river with big bends, seen from the sky.', q: 'What do we call these big bends?', a: 'Meanders.', noProj: 'draw a snake-like river on the board.' },
    { sec: 'I. MEANDERS', img: 'meander.gif', caption: 'Animation: a meander grows.', q: 'Where does the water erode? Where does it deposit?', a: 'It erodes the outside of the bend and deposits on the inside.', noProj: 'draw a bend and mark the outside and the inside.' },
    { sec: 'II. RIVER CLIFF', img: 'rivercliff_big.png', caption: 'A cross-section of a meander.', q: 'What is the steep bank on the outside of the bend called?', a: 'A river cliff.', noProj: 'describe the banks of the Benue at Garoua.' },
  ],
  summary: [
    { title: 'I. Definitions', items: [['Middle course:', 'It is the part of a river with a gentle slope.'], ['Meander:', 'It is a big bend in a river.'], ['River cliff:', 'It is a steep bank on the outside of a bend.'], ['Slip-off slope:', 'It is a gentle bank on the inside of a bend.']] },
    { title: 'II. Characteristics', items: [['A. Slope:', 'Gentle.'], ['B. Valley:', 'Wider, with a flat floor.'], ['C. Main work:', 'The river cuts sideways.']] },
    { title: 'III. Landforms', items: [['A. Meanders:', 'Big bends.'], ['B. River cliff:', 'Erosion on the outside.'], ['C. Slip-off slope:', 'Deposition on the inside.']], draw: { img: 'meander_last.png', caption: 'Copy the meander.' } },
  ],
  evaluation: [['What is a meander?', 'A big bend in a river.'], ['Why is the outside of a bend steep?', 'The fast water erodes it.']],
  remediation: ['A big bend in a river is a ______.', 'The steep bank on the outside is a river ______.', 'The gentle bank on the inside is a slip-off ______.'],
  remediationAnswers: '1. meander 2. cliff 3. slope',
});

L.push({
  src: 'FORM4_LESSON21_Lower_Course',
  situation: 'In the dry season, Oumar sees many sandbanks in the Benue at Garoua. The water splits into small channels. He wonders where all this sand comes from.',
  sitQA: [['What is the problem in the situation?', 'Oumar does not know where the sandbanks come from.'],
    ['What did the river do with its sand?', 'It dropped it (deposition).'],
    ['Why does the river drop its load?', 'The water is slow and there is less water.']],
  justification: 'This lesson helps us to know the landforms of the lower course.',
  activities: [
    { sec: 'I. FLOODPLAIN', img: 'f4_floodplain.jpg', caption: 'Flat land beside a river, covered by flood water.', q: 'This flat land is covered by the river in floods. What is it called?', a: 'A floodplain.', noProj: 'describe the flat land along the Benue.' },
    { sec: 'II. OX-BOW LAKE', img: 'oxbow.gif', caption: 'Animation: an ox-bow lake forms.', q: 'How does an ox-bow lake form?', a: 'The river cuts through the neck of a meander and leaves the old bend.', noProj: 'draw the three steps on the board.' },
    { sec: 'III. DELTA', img: 'f4_delta.jpg', caption: 'The Nile Delta seen from space.', q: 'The river drops its load at the sea. What landform is this?', a: 'A delta.', noProj: 'draw a triangle at the mouth of a river.' },
  ],
  summary: [
    { title: 'I. Definitions', items: [['Lower course:', 'It is the flat part of a river near its mouth.'], ['Floodplain:', 'It is flat land covered by floods.'], ['Ox-bow lake:', 'It is an old meander cut off from the river.'], ['Delta:', 'It is land made by a river at its mouth.']] },
    { title: 'II. Characteristics', items: [['A. Slope:', 'Almost flat.'], ['B. Water:', 'Slow and wide.'], ['C. Main work:', 'The river drops its load.']] },
    { title: 'III. Landforms', items: [['A. Floodplain and levees:', 'Mud is dropped in floods.'], ['B. Ox-bow lakes:', 'Old bends cut off.'], ['C. Delta:', 'Like the Nile and the Niger.'], ['D. Braided channels:', 'Sandbanks split the river.']], draw: { img: 'oxbow_last.png', caption: 'Copy the ox-bow lake.' } },
  ],
  evaluation: [['What is the main work of the river in its lower course?', 'Deposition.'], ['Give one example of a delta.', 'The Nile Delta (or the Niger Delta).']],
  remediation: ['Flat land covered by floods is a ______.', 'An old meander cut off is an ______ lake.', 'Land made by a river at its mouth is a ______.'],
  remediationAnswers: '1. floodplain 2. ox-bow 3. delta',
});

L.push({
  src: 'FORM4_LESSON22_Man_and_Floodplain_Interactions',
  situation: 'In September, the Benue is very high at Garoua. In 2012, heavy rain and water from the Lagdo Dam flooded many villages. Farms and houses were destroyed.',
  sitQA: [['What is the problem in the situation?', 'Floods destroyed farms and houses.'],
    ['What caused the flood of 2012?', 'Heavy rain and water released from the Lagdo Dam.'],
    ['Why do people live near the river?', 'The soil is fertile and there is water.']],
  justification: 'This lesson helps us to know the advantages and dangers of living near rivers.',
  activities: [
    { sec: 'I. IMPORTANCE', img: 'f4_ricefield.jpg', caption: 'A woman in a rice field.', q: 'Why are floodplains good for farming?', a: 'The soil is fertile (alluvium) and there is water.', noProj: 'ask learners what grows along the Benue.' },
    { sec: 'II. PROBLEMS', img: 'f4_flood.jpg', caption: 'A flooded street.', q: 'What problems do floods cause?', a: 'They destroy houses and crops, and bring diseases.', noProj: 'ask learners to describe the flood of 2012.' },
    { sec: 'III. SOLUTIONS', img: 'f4_dyke.jpg', caption: 'A dyke (levee) along a river, USA, 1912.', q: 'How does this bank protect the land?', a: 'It stops the river from flooding the land.', noProj: 'describe sandbags put along a river.' },
  ],
  summary: [
    { title: 'I. Definitions', items: [['Flood:', 'It is when water covers land that is usually dry.'], ['Dyke:', 'It is a high bank built to stop floods.'], ['Alluvium:', 'It is the fertile mud dropped by a river.']] },
    { title: 'II. Importance of Floodplains', items: [['A. Farming:', 'Fertile soil for rice and onions.'], ['B. Water:', 'For drinking and fishing.'], ['C. Energy:', 'The Lagdo Dam gives electricity.']] },
    { title: 'III. Problems', items: [['A. Floods:', 'They destroy houses and crops.'], ['B. Diseases:', 'Cholera and malaria.'], ['C. Deaths:', 'People and animals drown.']] },
    { title: 'IV. Solutions', items: [['A. Dykes and dams:', 'They control the water.'], ['B. Warnings:', 'Radio messages before floods.'], ['C. Safe places:', 'Build houses far from the river.'], ['D. Trees:', 'They hold the soil.']] },
  ],
  evaluation: [['Give one advantage of living on a floodplain.', 'The soil is fertile.'], ['Give two solutions to floods.', 'Build dykes and give flood warnings.']],
  remediation: ['Fertile mud dropped by a river is ______.', 'A high bank built to stop floods is a ______.', 'In 2012, water from the ______ Dam flooded villages.'],
  remediationAnswers: '1. alluvium 2. dyke 3. Lagdo',
});

module.exports = L;
if (require.main === module) run(L, process.argv.slice(2).length ? process.argv.slice(2) : null);
