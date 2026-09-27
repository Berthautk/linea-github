// FORM 4 — v2 light lessons (50 minutes, 3 activities): L7–L13
const { run } = require('./v2');
const L = [];

L.push({
  src: 'FORM4_LESSON07_Internal_Structure_of_the_Earth',
  situation: 'Workers dig a deep well in Garoua. First they dig through red soil. Then they reach very hard rock. Amadou wonders what they would find if they could dig to the centre of the Earth.',
  sitQA: [['What is the problem in the situation?', 'Amadou does not know what is inside the Earth.'],
    ['What did the workers find under the soil?', 'Very hard rock.'],
    ['Can people dig to the centre of the Earth?', 'No. It is too deep and too hot.']],
  justification: 'This lesson helps us to know the layers inside the Earth.',
  activities: [
    { sec: 'I. THE CRUST', img: 'f2t_laterite.jpg', caption: 'People dig a big pit in the ground.', q: 'When we dig, which layer of the Earth do we reach?', a: 'Only the crust, the thin outer layer.', noProj: 'ask learners how deep the wells of their area are.' },
    { sec: 'II. THE LAYERS', img: 'earth_layers_big.png', caption: 'The layers of the Earth.', q: 'Name the four layers from the outside to the centre.', a: 'Crust, mantle, outer core and inner core.', noProj: 'cut a boiled egg or an onion: shell, white, yolk.' },
    { sec: 'II. THE LAYERS', img: 'earth_depth.gif', caption: 'Animation: a journey to the centre of the Earth.', q: 'What happens to the temperature as we go deeper?', a: 'It rises: about 6,000 °C at the centre.', noProj: 'write the depth and temperature of each layer on the board.' },
  ],
  summary: [
    { title: 'I. Definitions', items: [['Crust:', 'It is the thin outer layer of rock.'], ['Mantle:', 'It is the thick layer of very hot rock under the crust.'], ['Core:', 'It is the centre of the Earth, made of iron.']] },
    { title: 'II. Structure of the Earth', items: [['Illustration:', 'The layers form circles, one inside the other.']], draw: { img: 'earth_layers_big.png', caption: 'Copy the four layers.' } },
    { title: 'III. The Main Layers', items: [['A. Crust:', 'Thin and solid; we live on it.'], ['B. Mantle:', 'About 2,900 km thick, very hot.'], ['C. Outer core:', 'Liquid iron.'], ['D. Inner core:', 'Solid iron, about 6,000 °C.']] },
  ],
  evaluation: [['Name the layer on which we live.', 'The crust.'], ['Why is the inner core solid though it is very hot?', 'Because of the enormous pressure.']],
  remediation: ['The thin outer layer of the Earth is the ______.', 'The layer under the crust is the ______.', 'The outer core is made of ______ iron.'],
  remediationAnswers: '1. crust 2. mantle 3. liquid',
});

L.push({
  src: 'FORM4_LESSON08_Rocks',
  situation: 'In Garoua, a new mosque is built on hard grey stones with small crystals. Some walls are made of blocks with thin layers. Kadidja wonders why the stones are different.',
  sitQA: [['What is the problem in the situation?', 'Kadidja does not know why rocks are different.'],
    ['Describe the two kinds of stones.', 'Hard grey stones with crystals, and stones with layers.'],
    ['How are rocks grouped?', 'By the way they were formed: igneous, sedimentary, metamorphic.']],
  justification: 'This lesson helps us to know the rocks around us.',
  activities: [
    { sec: 'I. IGNEOUS ROCKS', img: 'f4_granite.jpg', caption: 'Big granite rocks.', q: 'Granite has crystals. How was it formed?', a: 'Hot magma cooled and became hard. It is an igneous rock.', noProj: 'show a piece of granite from the school yard.' },
    { sec: 'II. SEDIMENTARY ROCKS', img: 'f4_sandstone.jpg', caption: 'A rock with layers.', q: 'This rock has layers. How was it formed?', a: 'Layers of sand and mud were pressed together. It is a sedimentary rock.', noProj: 'show layers in a cut road bank.' },
    { sec: 'III. METAMORPHIC ROCKS', img: 'f4_marble.jpg', caption: 'A block of marble in a quarry.', q: 'Marble was limestone. What changed it?', a: 'Great heat and pressure. It is a metamorphic rock.', noProj: 'show a marble tile.' },
  ],
  summary: [
    { title: 'I. Definitions', items: [['Rock:', 'It is a hard natural material of the crust.'], ['Magma:', 'It is melted rock under the ground.'], ['Fossil:', 'It is the mark of an old plant or animal in a rock.']] },
    { title: 'II. Types of Rocks', items: [['A. Igneous:', 'Formed when magma cools (granite, basalt).'], ['B. Sedimentary:', 'Formed from layers (sandstone, limestone).'], ['C. Metamorphic:', 'Changed by heat and pressure (marble).'], ['D. Fossils:', 'They are found in sedimentary rocks.']] },
    { title: 'III. The Rock Cycle', items: [['Meaning:', 'One type of rock can become another type.']], draw: { img: 'rock_cycle_big.png', caption: 'Copy the rock cycle.' } },
  ],
  evaluation: [['How are igneous rocks formed?', 'When magma or lava cools and becomes hard.'], ['Give one example of a metamorphic rock.', 'Marble (or slate, gneiss).']],
  remediation: ['Granite is an ______ rock.', 'Rocks formed from layers are ______ rocks.', 'Heat and pressure make ______ rocks.'],
  remediationAnswers: '1. igneous 2. sedimentary 3. metamorphic',
});

L.push({
  src: 'FORM4_LESSON09_Continental_Drift',
  situation: 'Djibrilla looks at a map. The coast of Africa and the coast of South America look like two pieces of a puzzle. He wonders if they were once joined.',
  sitQA: [['What is the problem in the situation?', 'Djibrilla wonders if Africa and South America were once joined.'],
    ['What does he notice?', 'The two coasts fit like a puzzle.'],
    ['Who first explained this?', 'Alfred Wegener, in 1912.']],
  justification: 'This lesson helps us to understand that the continents move.',
  activities: [
    { sec: 'I. MAIN IDEA', img: 'jigsaw.gif', caption: 'Animation: closing the Atlantic Ocean.', q: 'What happens when we bring South America near Africa? What did Wegener conclude?', a: 'The two coasts fit together like a puzzle, so the continents were once joined and have drifted apart.', noProj: 'cut a paper map of the two continents and fit them.' },
    { sec: 'II. ILLUSTRATION OF DRIFTING', img: 'drift_stages_big.png', caption: 'The break-up of Pangaea.', q: 'Describe the drifting of the continents shown on the diagram.', a: 'Pangaea split into Laurasia and Gondwanaland, which broke into the continents of today.', noProj: 'draw the three stages on the board.' },
    { sec: 'III. EVIDENCE', img: 'f4_fossil.jpg', caption: 'A fossil of a fish in rock.', q: 'The fossils of the same small reptile (Mesosaurus) are found in Brazil and in southern Africa. What does it prove?', a: 'The two continents were once joined.', noProj: 'explain: this small animal could not swim across the ocean.', note: 'The photo shows a fossil fish; Mesosaurus fossils look similar and are found on both sides of the Atlantic.' },
  ],
  summary: [
    { title: 'I. Definitions', items: [['Continental drift:', 'It is the slow movement of the continents.'], ['Pangaea:', 'It is the single big continent of long ago.']] },
    { title: 'II. The Theory', items: [['A. Author:', 'Alfred Wegener (1912).'], ['B. Idea:', 'All continents were once one: Pangaea.'], ['C. Break-up:', 'Pangaea broke into pieces that moved apart.']] },
    { title: 'III. Evidence', items: [['A. Jigsaw fit:', 'Africa and South America fit together.'], ['B. Fossils:', 'The same fossils are on both sides.'], ['C. Rocks:', 'The same rocks are on both sides.'], ['D. Old ice:', 'Marks of ice are found in hot lands.']], draw: { img: 'jigsaw_last.png', caption: 'Copy the fit of the two continents.' } },
  ],
  evaluation: [['What is Pangaea?', 'The single big continent of long ago.'], ['Give two pieces of evidence for continental drift.', 'The jigsaw fit and the same fossils on both continents.']],
  remediation: ['The theory of continental drift was given by ______.', 'The single big continent was called ______.', 'Africa and South America fit like a ______.'],
  remediationAnswers: '1. Wegener 2. Pangaea 3. puzzle (jigsaw)',
});

L.push({
  src: 'FORM4_LESSON10_Plate_Tectonics',
  situation: 'On television, Mariam sees an earthquake in Japan and a volcano in Italy. In Garoua, the ground feels safe. She knows that Mount Cameroon is an active volcano and wonders why.',
  sitQA: [['What is the problem in the situation?', 'Mariam does not know why some places have volcanoes and earthquakes.'],
    ['Name one active volcano in Cameroon.', 'Mount Cameroon.'],
    ['Where do most earthquakes and volcanoes happen?', 'At the edges of the plates.']],
  justification: 'This lesson helps us to know the plates of the Earth and how they move.',
  activities: [
    { sec: 'I. DEFINITION', img: 'plates_big.png', caption: 'The main plates of the Earth.', q: 'What is plate tectonics? On which plate is Cameroon?', a: 'It is the theory that the crust is broken into rigid plates that move; Cameroon is on the African Plate.', noProj: 'break a biscuit into pieces: the pieces are like the plates.' },
    { sec: 'II. MAIN IDEAS', img: 'mantle_convection.gif', caption: 'Animation: convection currents in the mantle.', q: 'How many major plates are there, and what makes them move?', a: 'There are seven major plates, and convection currents in the hot mantle move them a few centimetres a year.', noProj: 'watch rice move in boiling water.' },
    { sec: 'III. PLATE MARGINS AND LANDFORMS', img: 'margins.gif', caption: 'Animation: plates move apart (left) and together (right).', q: 'What happens when plates move apart and together, and what landforms form?', a: 'Apart: magma rises and forms ridges and rift valleys. Together: one plate sinks and forms fold mountains, trenches and volcanoes.', noProj: 'move two books apart, then push them together.' },
  ],
  summary: [
    { title: 'I. Definitions', items: [['Plate:', 'It is a large piece of the crust.'], ['Plate margin:', 'It is the place where two plates meet.'], ['Plate tectonics:', 'It is the theory that plates move.']] },
    { title: 'II. The Plates', items: [['A. Number:', 'There are 7 major plates.'], ['B. Cameroon:', 'It is on the African Plate.'], ['C. Movement:', 'Heat in the mantle moves the plates.']], draw: { img: 'plates_big.png', caption: 'Copy the main plates.' } },
    { title: 'III. Plate Margins', items: [['A. Constructive:', 'Plates move apart; new crust forms.'], ['B. Destructive:', 'Plates move together; one sinks.'], ['C. Conservative:', 'Plates slide side by side.']] },
  ],
  evaluation: [['What is a plate?', 'A large piece of the crust.'], ['What happens at a destructive margin?', 'Plates move together and one sinks under the other.']],
  remediation: ['Cameroon is on the ______ Plate.', 'At a constructive margin, plates move ______.', 'At a conservative margin, plates slide ______ by side.'],
  remediationAnswers: '1. African 2. apart 3. side',
});

L.push({
  src: 'FORM4_LESSON11_Volcanoes',
  situation: 'Mount Cameroon, near Buea, is a very high mountain and an active volcano. In 1999 and 2000, lava flowed down its sides. The soils around it are dark and very fertile.',
  sitQA: [['What is the problem in the situation?', 'People live near an active volcano.'],
    ['What came out of Mount Cameroon in 2000?', 'Lava.'],
    ['Why do people still live there?', 'The volcanic soils are very fertile.']],
  justification: 'This lesson helps us to know volcanoes and their parts.',
  activities: [
    { sec: 'I. DEFINITION AND ORIGIN', img: 'f4_eruption.jpg', caption: 'A volcano erupts.', q: 'What is a volcano, and where does its magma come from?', a: 'It is an opening in the crust where magma, gases and ash come out; magma rises from the hot mantle at plate margins and hot spots.', noProj: 'describe the 2000 eruption of Mount Cameroon.' },
    { sec: 'II. TYPES OF VOLCANOES', img: 'volcano_types_big.png', caption: 'Types of volcanoes by shape.', q: 'Name three types of volcanoes by shape and three by activity.', a: 'By shape: shield, composite and ash cone. By activity: active, dormant and extinct.', noProj: 'draw the three shapes on the board.' },
    { sec: 'III. PROCESSES AND STRUCTURE', img: 'volcano_big.png', caption: 'The parts of a volcano.', q: 'Name the parts of a volcano from the bottom to the top.', a: 'Magma chamber, vent (pipe), cone and crater.', noProj: 'draw a simple volcano on the board.' },
  ],
  summary: [
    { title: 'I. Definitions', items: [['Volcano:', 'It is an opening in the crust where magma comes out.'], ['Lava:', 'It is magma that comes out on the surface.'], ['Crater:', 'It is the round hollow at the top of a volcano.']] },
    { title: 'II. Types of Volcanoes', items: [['A. Active:', 'It erupts now or recently (Mount Cameroon).'], ['B. Dormant:', 'It is sleeping but can erupt.'], ['C. Extinct:', 'It will not erupt again.']] },
    { title: 'III. Structure', items: [['Parts:', 'Magma chamber, vent, crater, lava and ash.']], draw: { img: 'volcano_big.png', caption: 'Copy the volcano and its parts.' } },
    { title: 'IV. Volcanic Features', items: [['A. Inside the crust:', 'Dykes, sills, batholiths.'], ['B. On the surface:', 'Cones, craters, calderas, lava plateaux.']] },
  ],
  evaluation: [['What is a volcano?', 'An opening in the crust where magma comes out.'], ['Is Mount Cameroon active, dormant or extinct?', 'Active: it erupted in 1999 and 2000.']],
  remediation: ['Magma on the surface is called ______.', 'The pipe of a volcano is the ______.', 'A volcano that erupts now is ______.'],
  remediationAnswers: '1. lava 2. vent 3. active',
});

L.push({
  src: 'FORM4_LESSON12_Impact_of_Volcanicity_on_Man',
  situation: 'A friend of Aboubakar\'s family wants to start a farm near Buea because the soil is very fertile. Another friend says, "It is dangerous! You will live near an active volcano."',
  sitQA: [['What is the problem in the situation?', 'The land is fertile but near a dangerous volcano.'],
    ['Give one danger of the volcano.', 'Lava can burn farms and houses.'],
    ['What can people do to stay safe?', 'Listen to warnings and leave when the volcano erupts.']],
  justification: 'This lesson helps us to know the dangers and the benefits of volcanoes.',
  activities: [
    { sec: 'I. HAZARDS', img: 'f4_lavahouse.jpg', caption: 'Lava has covered a road.', q: 'What does lava do to farms, roads and houses?', a: 'It burns and buries them.', noProj: 'describe the lava of 1999 near Bakingili.' },
    { sec: 'I. HAZARDS', img: 'f4_nyos.jpg', caption: 'Lake Nyos, North-West Region of Cameroon.', q: 'In 1986, gas came out of this lake. What happened?', a: 'The gas killed about 1,700 people and many animals.', noProj: 'tell the story of Lake Nyos (1986).' },
    { sec: 'II. BENEFITS', img: 'f4_geothermal.jpg', caption: 'A power station that uses the heat of the Earth.', q: 'How can volcanoes give electricity?', a: 'Hot steam from the ground turns machines.', noProj: 'compare with steam from a boiling pot.' },
  ],
  summary: [
    { title: 'I. Definitions', items: [['Hazard:', 'It is an event that can harm people and property.'], ['Geothermal energy:', 'It is energy from the heat of the Earth.']] },
    { title: 'II. Volcanic Hazards', items: [['A. Lava and ash:', 'They burn and bury farms.'], ['B. Gases:', 'Lake Nyos killed about 1,700 people (1986).'], ['C. Earthquakes:', 'They happen near volcanoes.']] },
    { title: 'III. Benefits', items: [['A. Fertile soils:', 'Tea and bananas around Mount Cameroon.'], ['B. Energy:', 'Geothermal power stations.'], ['C. Tourism:', 'People visit volcanoes.'], ['D. Building stones:', 'Basalt and pozzolana.']] },
    { title: 'IV. Protection', items: [['A. Watching:', 'Scientists watch the volcano.'], ['B. Warning:', 'People leave in time.'], ['C. Lake Nyos:', 'Pipes remove the gas from the lake.']] },
  ],
  evaluation: [['Give one danger and one benefit of volcanoes.', 'Danger: lava. Benefit: fertile soils.'], ['What happened at Lake Nyos in 1986?', 'A cloud of gas killed about 1,700 people.']],
  remediation: ['Energy from the heat of the Earth is ______ energy.', 'In 1986, gas came out of Lake ______.', 'The soils near volcanoes are very ______.'],
  remediationAnswers: '1. geothermal 2. Nyos 3. fertile',
});

L.push({
  src: 'FORM4_LESSON13_Earthquakes',
  situation: 'On the news, Ismaïla sees that an earthquake in Morocco in September 2023 destroyed many villages. Thousands of people died. He wonders what makes the ground shake.',
  sitQA: [['What is the problem in the situation?', 'Ismaïla does not know what makes the ground shake.'],
    ['What did the earthquake destroy?', 'Villages and houses.'],
    ['Why do so many people die?', 'Their houses fall on them.']],
  justification: 'This lesson helps us to know earthquakes and how to reduce their damage.',
  activities: [
    { sec: 'I. MEANING', img: 'quake.gif', caption: 'Animation: the waves of an earthquake.', q: 'Where does the earthquake start? What is the point just above it?', a: 'It starts at the focus. The point above is the epicentre.', noProj: 'drop a stone in water: the waves spread in circles.' },
    { sec: 'II. MEASUREMENT', img: 'f4_seismograph.jpg', caption: 'A seismograph.', q: 'What does this instrument do?', a: 'It records the shaking of the ground.', noProj: 'draw a zigzag line on the board.' },
    { sec: 'III. IMPACT', img: 'f4_quakedamage.jpg', caption: 'Houses destroyed by an earthquake.', q: 'What is the main cause of death during an earthquake?', a: 'Buildings fall on people.', noProj: 'ask learners how houses could be made stronger.' },
  ],
  summary: [
    { title: 'I. Definitions', items: [['Earthquake:', 'It is a sudden shaking of the ground.'], ['Focus:', 'It is the point under the ground where it starts.'], ['Epicentre:', 'It is the point on the surface above the focus.']] },
    { title: 'II. Causes', items: [['A. Plates:', 'Plates move along faults (main cause).'], ['B. Volcanoes:', 'Eruptions shake the ground.'], ['C. People:', 'Mines and big dams.']], draw: { img: 'quake_mid.png', caption: 'Copy the focus and the epicentre.' } },
    { title: 'III. Measurement', items: [['A. Seismograph:', 'It records the waves.'], ['B. Richter scale:', 'It measures the strength.']] },
    { title: 'IV. Impact and Protection', items: [['A. Impact:', 'Deaths, destroyed houses and roads.'], ['B. Strong buildings:', 'They resist the shaking.'], ['C. Education:', 'People learn what to do.']] },
  ],
  evaluation: [['What is the epicentre?', 'The point on the surface above the focus.'], ['How do countries like Japan reduce the damage?', 'They build houses that resist earthquakes.']],
  remediation: ['A sudden shaking of the ground is an ______.', 'The instrument that records earthquakes is the ______.', 'The point under the ground where it starts is the ______.'],
  remediationAnswers: '1. earthquake 2. seismograph 3. focus',
});

module.exports = L;
if (require.main === module) run(L, process.argv.slice(2).length ? process.argv.slice(2) : null);
