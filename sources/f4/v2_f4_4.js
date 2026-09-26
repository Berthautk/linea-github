// FORM 4 — v2 light lessons (50 minutes, 3 activities): L23–L29
const { run } = require('./v2');
const L = [];

L.push({
  src: 'FORM4_LESSON23_Wave_Action_in_Coastal_Areas',
  situation: 'On a windy day, Moussa sees small waves on the Benue. His cousin in Kribi says that the waves of the Atlantic Ocean are much bigger and stronger.',
  sitQA: [['What is the problem in the situation?', 'Moussa does not know why some waves are bigger than others.'],
    ['What makes the waves?', 'The wind blowing on the water.'],
    ['Why are sea waves bigger?', 'The wind blows longer over a very large area of water.']],
  justification: 'This lesson helps us to understand waves and their work on the coast.',
  activities: [
    { sec: 'I. MEANING OF WAVES', img: 'f4_waves.jpg', caption: 'Waves on the coast.', q: 'What causes most waves?', a: 'The wind blowing on the sea.', noProj: 'blow on a plate of water.' },
    { sec: 'I. MEANING OF WAVES', img: 'swash.gif', caption: 'Animation: the water goes up the beach and comes back.', q: 'What do we call the water going up the beach? And coming back?', a: 'Up: the swash. Back: the backwash.', noProj: 'draw a beach with an arrow up and an arrow down.' },
    { sec: 'II. TYPES OF WAVES', img: 'f4_bigwaves.jpg', caption: 'Big waves in a storm.', q: 'These high waves take sand away from the beach. What type of waves are they?', a: 'Destructive waves.', noProj: 'compare a calm day and a stormy day at the beach.' },
  ],
  summary: [
    { title: 'I. Definitions', items: [['Wave:', 'It is a movement of the water of the sea.'], ['Swash:', 'It is the water that goes up the beach.'], ['Backwash:', 'It is the water that goes back to the sea.'], ['Fetch:', 'It is the distance of sea over which the wind blows.']] },
    { title: 'II. Strength of Waves', items: [['A. Wind:', 'A stronger wind makes bigger waves.'], ['B. Time:', 'The longer it blows, the bigger the waves.'], ['C. Fetch:', 'A long fetch makes big waves.']] },
    { title: 'III. Types of Waves', items: [['A. Constructive:', 'Low waves; strong swash; they build beaches.'], ['B. Destructive:', 'High waves; strong backwash; they destroy beaches.']], draw: { img: 'waves_types_big.png', caption: 'Copy the two types of waves.' } },
  ],
  evaluation: [['What is the swash?', 'The water that goes up the beach.'], ['Give one difference between constructive and destructive waves.', 'Constructive waves build the beach; destructive waves destroy it.']],
  remediation: ['Most waves are caused by the ______.', 'Water going back to the sea is the ______.', 'High waves that destroy the beach are ______ waves.'],
  remediationAnswers: '1. wind 2. backwash 3. destructive',
});

L.push({
  src: 'FORM4_LESSON24_Erosional_Features_of_Wave_Action',
  situation: 'On holiday in Limbe, Rahila sees big waves crash against the rocky coast. At the bottom of a rock face, the waves have cut a hollow and small caves.',
  sitQA: [['What is the problem in the situation?', 'Rahila wonders how waves can cut hard rock.'],
    ['What did the waves make?', 'A hollow and small caves.'],
    ['What will happen to the caves after many years?', 'They will become arches and then stacks.']],
  justification: 'This lesson helps us to know the landforms made by wave erosion.',
  activities: [
    { sec: 'I. CLIFFS', img: 'f4_cliff.jpg', caption: 'Waves hit a cliff.', q: 'How do waves make a cliff?', a: 'They cut the bottom of the rock; the top falls; a steep cliff is left.', noProj: 'draw a rock with a hollow at the bottom.' },
    { sec: 'II. CAVE, ARCH, STACK', img: 'headland.gif', caption: 'Animation: a headland is worn away.', q: 'Put in order: stack, cave, stump, arch.', a: 'Cave, arch, stack, stump.', noProj: 'draw the four steps on the board.' },
    { sec: 'II. CAVE, ARCH, STACK', img: 'f4_arch.jpg', caption: 'A rock with a hole through it, on the coast.', q: 'The waves have cut a hole right through the rock. What is it called?', a: 'An arch.', noProj: 'use the drawing on the board.' },
  ],
  summary: [
    { title: 'I. Definitions', items: [['Cliff:', 'It is a steep rock face on the coast.'], ['Cave:', 'It is a hole cut by waves in a cliff.'], ['Arch:', 'It is a cave that goes through a headland.'], ['Stack:', 'It is a pillar of rock left in the sea.']] },
    { title: 'II. Erosional Processes', items: [['A. Hydraulic action:', 'The force of waves breaks rock.'], ['B. Abrasion:', 'Stones hit the cliff.'], ['C. Attrition:', 'Stones become small and round.'], ['D. Solution:', 'Sea water dissolves some rocks.']] },
    { title: 'III. Erosional Features', items: [['A. Capes and bays:', 'Hard rock stays; soft rock goes.'], ['B. Cliff and platform:', 'Waves cut the bottom of the rock.'], ['C. Cave to stump:', 'Cave, arch, stack, stump.']], draw: { img: 'headland_last.png', caption: 'Copy the cave, the arch, the stack and the stump.' } },
  ],
  evaluation: [['Put in order: arch, stump, cave, stack.', 'Cave, arch, stack, stump.'], ['What is hydraulic action?', 'The force of the waves breaking the rock.']],
  remediation: ['A steep rock face on the coast is a ______.', 'A cave that goes through a headland becomes an ______.', 'A pillar of rock in the sea is a ______.'],
  remediationAnswers: '1. cliff 2. arch 3. stack',
});

L.push({
  src: 'FORM4_LESSON25_Depositional_Features_of_Wave_Action',
  situation: 'In Kribi, Maïmouna builds a sandcastle. The waves reach the beach at an angle. After an hour, some sand of her castle has moved along the beach.',
  sitQA: [['What is the problem in the situation?', 'Maïmouna does not know why the sand moved along the beach.'],
    ['How do the waves reach the beach?', 'At an angle.'],
    ['What do we call this movement of sand?', 'Longshore drift.']],
  justification: 'This lesson helps us to know the landforms made when waves drop sand.',
  activities: [
    { sec: 'I. LONGSHORE DRIFT', img: 'longshore.gif', caption: 'Animation: sand moves along the beach.', q: 'How does the sand move along the beach?', a: 'The swash pushes it up at an angle; the backwash brings it straight down.', noProj: 'draw a zigzag line along a beach.' },
    { sec: 'II. SPITS', img: 'f4_spit.jpg', caption: 'A long, narrow strip of sand and land in the sea (England).', q: 'This strip of sand is joined to the land at one end. What is it?', a: 'A spit.', noProj: 'draw a coast with a finger of sand.' },
    { sec: 'II. TOMBOLOS', img: 'f4_tombolo.jpg', caption: 'Sand joins an island to the land.', q: 'What do we call sand that joins an island to the land?', a: 'A tombolo.', noProj: 'draw an island joined to the coast by sand.' },
  ],
  summary: [
    { title: 'I. Definitions', items: [['Longshore drift:', 'It is the movement of sand along the beach.'], ['Beach:', 'It is sand and pebbles between low and high tide.'], ['Spit:', 'It is a strip of sand joined to the land at one end.'], ['Tombolo:', 'It is sand that joins an island to the land.']] },
    { title: 'II. Longshore Drift', items: [['Step 1:', 'Waves reach the beach at an angle.'], ['Step 2:', 'The swash pushes sand up at an angle.'], ['Step 3:', 'The backwash brings it straight down.'], ['Step 4:', 'The sand moves along in zigzags.']], draw: { img: 'longshore_last.png', caption: 'Copy the zigzag of longshore drift.' } },
    { title: 'III. Depositional Features', items: [['A. Beaches:', 'Like Kribi and Limbe.'], ['B. Spits:', 'Fingers of sand in the sea.'], ['C. Bars:', 'Sand across a bay.'], ['D. Tombolos:', 'Sand to an island.']] },
  ],
  evaluation: [['What is longshore drift?', 'The movement of sand along the beach by waves.'], ['What is the difference between a spit and a bar?', 'A spit is joined at one end; a bar closes a bay.']],
  remediation: ['The movement of sand along the beach is ______ drift.', 'A strip of sand joined at one end is a ______.', 'Sand joining an island to the land is a ______.'],
  remediationAnswers: '1. longshore 2. spit 3. tombolo',
});

L.push({
  src: 'FORM4_LESSON26_Impact_of_Wave_Action_on_Coastal_Development',
  situation: 'In the market of Garoua, Idrissa sees phones, cloth and rice from abroad. Most of them came by ship to the ports of Douala or Kribi, then by road to Garoua.',
  sitQA: [['What is the problem in the situation?', 'Idrissa wants to know how goods from abroad reach Garoua.'],
    ['Where do the ships arrive?', 'At the ports of Douala and Kribi.'],
    ['Why is the coast important for Garoua?', 'Goods arrive at the coast and then go north by road.']],
  justification: 'This lesson helps us to know the importance and the dangers of the coast.',
  activities: [
    { sec: 'I. IMPORTANCE', img: 'f4_port.jpg', caption: 'A port with a container ship.', q: 'Why are ports important for Cameroon?', a: 'Ships bring and take goods: trade.', noProj: 'ask learners what products come from the port of Douala.' },
    { sec: 'II. HAZARDS', img: 'f4_spit.jpg', caption: 'Old sea defences broken by the waves (England).', q: 'What are the waves doing to this coast?', a: 'Coastal erosion: waves wear away the beach and houses.', noProj: 'describe houses near the sea that are damaged by waves.' },
    { sec: 'III. PROTECTION', img: 'f4_groynes.jpg', caption: 'Low walls built across a beach.', q: 'How do these low walls protect the beach?', a: 'They stop the sand from moving away.', noProj: 'draw a beach with walls across it.' },
  ],
  summary: [
    { title: 'I. Definitions', items: [['Port:', 'It is a place where ships load and unload goods.'], ['Coastal erosion:', 'It is the wearing away of the coast by waves.'], ['Groyne:', 'It is a low wall built across a beach.']] },
    { title: 'II. Importance of Coasts', items: [['A. Ports:', 'Douala and Kribi.'], ['B. Fishing:', 'Fish and shrimps.'], ['C. Tourism:', 'Beaches of Kribi and Limbe.'], ['D. Oil:', 'Oil is found under the sea.']] },
    { title: 'III. Coastal Hazards', items: [['A. Erosion:', 'Waves destroy beaches and houses.'], ['B. Floods:', 'The sea covers low land.'], ['C. Sea-level rise:', 'Douala is in danger.']] },
    { title: 'IV. Protection', items: [['A. Sea walls:', 'They stop the waves.'], ['B. Groynes:', 'They keep the sand.'], ['C. Mangroves:', 'These trees protect the coast.']], draw: { img: 'coastal_defence_big.png', caption: 'Copy the sea wall and the groynes.' } },
  ],
  evaluation: [['Name two ports of Cameroon.', 'Douala and Kribi.'], ['Give two ways to protect the coast.', 'Sea walls and groynes (also mangroves).']],
  remediation: ['A place where ships load goods is a ______.', 'A low wall across a beach is a ______.', 'The wearing away of the coast is coastal ______.'],
  remediationAnswers: '1. port 2. groyne 3. erosion',
});

L.push({
  src: 'FORM4_LESSON27_SemiArid_Desert_Landscapes',
  situation: 'During the Harmattan, Moussa sees that the old wall of his compound is worn near the ground, but the top is still smooth. The worn side faces the north-east, where the Harmattan comes from.',
  sitQA: [['What is the problem in the situation?', 'Moussa does not know how the wind wore away the wall.'],
    ['Which part of the wall is worn?', 'The bottom, facing the north-east.'],
    ['What can protect the wall?', 'A hedge or trees that stop the wind.']],
  justification: 'This lesson helps us to understand how wind shapes rocks in dry areas.',
  activities: [
    { sec: 'I. LOCATION', img: 'deserts_world_big.png', caption: 'The hot deserts of the world.', q: 'Name the largest hot desert. Which dry belt lies south of it?', a: 'The Sahara. The Sahel lies south of it.', noProj: 'draw Africa with the Sahara and the Sahel.' },
    { sec: 'II. WIND EROSION', img: 'abrasion.gif', caption: 'Animation: the wind throws sand against a rock.', q: 'Why is the rock worn more at the bottom?', a: 'The wind carries most sand near the ground.', noProj: 'use the example of Moussa\'s wall.' },
    { sec: 'III. FEATURES', img: 'f4_pedestal.jpg', caption: 'A rock worn by the wind.', q: 'This rock is narrow at the bottom and wide at the top. What is it called?', a: 'A rock pedestal (mushroom rock).', noProj: 'draw a mushroom-shaped rock.' },
  ],
  summary: [
    { title: 'I. Definitions', items: [['Semi-arid region:', 'It is a region with 250 to 500 mm of rain per year.'], ['Deflation:', 'It is the removal of sand by the wind.'], ['Abrasion:', 'It is the wearing of rocks by sand thrown by the wind.']] },
    { title: 'II. Location', items: [['A. The Sahara:', 'The largest hot desert.'], ['B. The Kalahari and the Namib:', 'In Southern Africa.'], ['C. The Sahel:', 'A dry belt with the Far North of Cameroon.']] },
    { title: 'III. Wind Erosion', items: [['A. Deflation:', 'The wind removes sand.'], ['B. Abrasion:', 'Sand wears rocks near the ground.'], ['C. Attrition:', 'Grains hit each other and get smaller.']] },
    { title: 'IV. Features', items: [['A. Rock pedestal:', 'A mushroom-shaped rock.'], ['B. Zeugen:', 'Hard rock on soft rock.'], ['C. Yardangs:', 'Long ridges in the direction of the wind.'], ['D. Inselberg:', 'A lonely hill on a plain.']], draw: { img: 'abrasion_last.png', caption: 'Copy the rock pedestal.' } },
  ],
  evaluation: [['What is abrasion?', 'The wearing of rocks by sand thrown by the wind.'], ['Why is a rock pedestal narrow at the bottom?', 'The wind throws most sand near the ground.']],
  remediation: ['The removal of loose sand by wind is ______.', 'A mushroom-shaped rock is a rock ______.', 'A lonely hill on a flat plain is an ______.'],
  remediationAnswers: '1. deflation 2. pedestal 3. inselberg',
});

L.push({
  src: 'FORM4_LESSON28_Depositional_Features_Wind',
  situation: 'After a windy Harmattan day, Aminatou sweeps her compound. The sand has piled up only in some places: at the foot of a wall, behind a stone and around a bush.',
  sitQA: [['What is the problem in the situation?', 'Aminatou does not know why the sand piled up in some places.'],
    ['Where did the sand pile up?', 'Near the wall, the stone and the bush.'],
    ['Why there?', 'These obstacles slow the wind, so it drops the sand.']],
  justification: 'This lesson helps us to know the landforms made when the wind drops sand.',
  activities: [
    { sec: 'I. DUNES', img: 'dune_move.gif', caption: 'Animation: a sand dune moves.', q: 'Which slope faces the wind? Is it gentle or steep?', a: 'The windward slope. It is gentle.', noProj: 'draw a dune: a gentle slope and a steep slope.' },
    { sec: 'II. BARCHANS', img: 'barchan_big.png', caption: 'A dune seen from above, shaped like a crescent (a new moon).', q: 'What is this dune called?', a: 'A barchan.', noProj: 'draw a crescent with two horns.' },
    { sec: 'III. SEIF DUNES', img: 'seif_big.png', caption: 'Long, straight lines of dunes seen from above.', q: 'What do we call these long, narrow dunes?', a: 'Seif dunes.', noProj: 'draw long parallel lines of sand.' },
  ],
  summary: [
    { title: 'I. Definitions', items: [['Wind deposition:', 'It is the dropping of sand by the wind.'], ['Sand dune:', 'It is a hill of sand made by the wind.'], ['Loess:', 'It is a thick layer of fine dust.']] },
    { title: 'II. Why the Wind Drops Sand', items: [['A. Slower wind:', 'The wind loses its force.'], ['B. Obstacles:', 'Walls, stones and bushes.'], ['C. Rain:', 'Wet sand is heavy.']] },
    { title: 'III. Features', items: [['A. Sand dunes:', 'Gentle windward slope, steep slip face.'], ['B. Barchans:', 'Crescent-shaped dunes.'], ['C. Seif dunes:', 'Long, straight dunes.'], ['D. Loess:', 'Fine dust far from the desert.']], draw: { img: 'dune_move_last.png', caption: 'Copy the dune and its two slopes.' } },
  ],
  evaluation: [['Why does the wind drop its sand behind a wall?', 'The wall slows the wind.'], ['What is a barchan?', 'A dune shaped like a crescent.']],
  remediation: ['A hill of sand made by the wind is a sand ______.', 'A crescent-shaped dune is a ______.', 'Long, straight dunes are ______ dunes.'],
  remediationAnswers: '1. dune 2. barchan 3. seif',
});

L.push({
  src: 'FORM4_LESSON29_Man_in_Hot_Desert',
  situation: 'In March, the well of the Bouba family dries up. Mrs Bouba walks for more than an hour every morning to get water, and the goats are thin.',
  sitQA: [['What is the problem in the situation?', 'The family has no water near the house.'],
    ['Who suffers?', 'Mrs Bouba and the animals.'],
    ['What can the village do?', 'Dig a deeper well or collect rain water.']],
  justification: 'This lesson helps us to know how people live in hot deserts.',
  activities: [
    { sec: 'I. RESOURCES', img: 'f4_solar.jpg', caption: 'A big solar power station in Morocco.', q: 'Why is the desert a good place for solar power?', a: 'The sun shines strongly almost every day.', noProj: 'ask learners who uses a solar panel at home.' },
    { sec: 'II. CHALLENGES', img: 'f4_fetchwater.jpg', caption: 'Women carry water in the Sahel.', q: 'What is the biggest problem of people in dry areas?', a: 'The lack of water.', noProj: 'use the situation of Mrs Bouba.' },
    { sec: 'III. ADAPTATIONS', img: 'f2t_tree_planting_sahel.jpg', caption: 'Young trees planted in rows.', q: 'How does planting trees help against the desert?', a: 'Trees hold the soil and stop the desert from spreading.', noProj: 'mention the Great Green Wall and Opération Sahel Vert.' },
  ],
  summary: [
    { title: 'I. Definitions', items: [['Resource:', 'It is anything that people can use.'], ['Hazard:', 'It is an event that can harm people.'], ['Desertification:', 'It is the spread of the desert.']] },
    { title: 'II. Resources', items: [['A. Minerals:', 'Oil (Algeria), uranium (Niger).'], ['B. Sun:', 'Solar power (Morocco).'], ['C. Water:', 'Oases and wells.'], ['D. Tourism:', 'Dunes and old monuments.']] },
    { title: 'III. Challenges', items: [['A. Heat and cold:', 'Hot days, cold nights.'], ['B. Lack of water:', 'Less than 250 mm of rain.'], ['C. Sandstorms:', 'They hurt the eyes and lungs.'], ['D. Desertification:', 'The desert spreads.']] },
    { title: 'IV. Adaptations', items: [['A. Nomadism:', 'The Tuareg move with animals.'], ['B. Clothes and houses:', 'Long clothes, thick walls.'], ['C. Irrigation:', 'Water from the Nile and wells.'], ['D. Tree planting:', 'The Great Green Wall.']] },
  ],
  evaluation: [['Give two resources of hot deserts.', 'Oil and solar energy.'], ['How can we fight desertification?', 'Plant trees (Great Green Wall).']],
  remediation: ['The spread of the desert is ______.', 'Morocco makes electricity from the ______.', 'The Tuareg are ______ who move with their animals.'],
  remediationAnswers: '1. desertification 2. sun 3. nomads',
});

module.exports = L;
if (require.main === module) run(L, process.argv.slice(2).length ? process.argv.slice(2) : null);
