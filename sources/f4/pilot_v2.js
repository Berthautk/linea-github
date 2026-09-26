const { build } = require('./gen2');
const OUT = '/home/claude/f4/out/V2/';

// ================= FORM 4 — LESSON 1 (50 minutes) =================
const F4T = 'The Earth as a Planet in the Solar System', F4S = 'The Earth as a Planet of the Solar System';
const f4 = {
  header: 'FORM 4', outdir: OUT, file: 'FORM4_LESSON01_Our_Planet_the_Earth_v2',
  label: 'FORM 4 GEOGRAPHY  —  LESSON 1', title: 'Our Planet, the Earth: Size, Shape and Proofs', sumTitle: 'Our Planet, the Earth',
  coverNote: 'Good morning, class. Today we study Lesson 1: our planet, the Earth.',
  cls: 'Form 4', chapter: F4T + ' — ' + F4S, duration: '50 minutes', topic: F4T, subtopic: F4S, lesson: 'Lesson 1: Our Planet, the Earth — Size, Shape and Proofs',
  notions: 'Planet, Earth, solar system.',
  focus: 'The size of the Earth; the shape of the Earth; proofs that the Earth is spherical.',
  competence: 'Learners are able to explain, with simple observations, why the Earth is round.',
  objectives: ['Give the size of the Earth.', 'Describe the shape of the Earth.', 'Give three proofs that the Earth is round.'],
  recall: ['The Earth is one of the eight planets of the solar system.', 'The Earth moves around the Sun.'],
  situation: 'On a long, straight road, Aïcha sees a lorry coming from far away. First, she sees only the top of the lorry. Then she sees the whole lorry. Her brother says, "The Earth is flat."',
  sitQA: [['What is the problem in the situation?', 'Aïcha cannot explain why she saw the top of the lorry first.'],
    ['Which part of the lorry did she see first?', 'She saw the top of the lorry first.'],
    ['How can she show her brother that the Earth is round?', 'She can show him a globe and photos of the Earth from space.']],
  justification: 'This lesson helps us to know the size and the shape of our planet.',
  activities: [
    { sec: 'SIZE AND SHAPE', img: 'earth_shape_big.png', caption: 'The shape of the Earth (not to scale: the flattening is exaggerated).', title: 'Activity 1',
      q: 'Look at the picture. Where is the Earth flattened, and where is it wider?', a: 'The Earth is flattened at the poles and wider at the Equator.',
      noProj: 'draw an ellipse on the board, label the poles and the Equator, and ask the question.' },
    { sec: 'PROOFS', img: 'ship_sailing.gif', caption: 'Animation: a ship sails away from the coast.', title: 'Activity 2',
      q: 'Which part of the ship disappears first? Why?', a: 'The hull disappears first, because the ship moves over the curve of the Earth.',
      noProj: 'draw three ships going down behind a curved line (hull, then deck, then mast) and ask the question.' },
    { sec: 'PROOFS', img: 'eclipse_big.png', caption: 'An eclipse of the Moon.', title: 'Activity 3',
      q: 'What is the shape of the shadow of the Earth on the Moon?', a: 'The shadow is round. Only a round object gives a round shadow.',
      noProj: 'hold a ball in front of a torch or a window: its shadow on the wall is round.' },
  ],
  summary: [
    { title: 'I. Definitions', items: [['Planet:', 'A large body that moves around the Sun.'], ['Oblate spheroid:', 'A ball flattened at the poles and wider at the Equator.']] },
    { title: 'II. Size of the Earth', intro: 'The main measurements of the Earth are:', items: [['A. Equatorial circumference:', 'about 40,075 km.'], ['B. Polar circumference:', 'about 40,008 km.'], ['C. Equatorial diameter:', 'about 12,756 km.']] },
    { title: 'III. Shape of the Earth', items: [['Shape:', 'The Earth is an oblate spheroid.']], draw: { img: 'earth_shape_big.png', caption: 'Copy this simple drawing.' } },
    { title: 'IV. Proofs of the Shape', intro: 'The main proofs are:', items: [['A. The ship:', 'Its hull disappears first.'], ['B. The eclipse of the Moon:', 'The shadow of the Earth is round.'], ['C. Photos from space:', 'They show a round Earth.'], ['D. Travel around the world:', 'We return to the start.']] },
  ],
  evaluation: [['What is the shape of the Earth?', 'It is an oblate spheroid.'], ['Give two proofs that the Earth is round.', 'The ship at sea and the round shadow of the Earth on the Moon.']],
  remediation: ['The Earth is flattened at the ______.', 'The Earth is wider at the ______.', 'The shadow of the Earth on the Moon is ______.'],
  remediationAnswers: '1. poles 2. Equator 3. round',
  homework: 'Look at the Moon on three evenings this week and draw its shape each time.',
  homeworkTag: 'This prepares Further Study 1: The Universe and the Moon.',
  bilingual: [['Planet', 'La planète'], ['Shape', 'La forme'], ['Size', 'La taille'], ['Proof', 'La preuve'], ['Shadow', "L'ombre"], ['Ship', 'Le navire']],
  timing: ['Set-up, recall 5 min', 'Situation 5 min', '3 activities 12 min', 'Board summary (copying) 15 min', 'Evaluation, homework 5 min', 'Logbook 5 min', 'Spare 3 min'],
  teacherNote: ['Figures: equatorial circumference 40,075 km; polar 40,008 km; equatorial diameter 12,756 km; polar 12,714 km.', 'Activity 2 is an animation (GIF): it plays automatically in slide-show mode.'],
  references: ['National Geography Syllabus (MINESEC), Form 4.'],
};

// ================= FORM 2 TECHNICAL — L2 PART 5 (2 periods = 100 minutes) =================
const f2 = {
  header: '!ECO. GEOGRAPHY — FORM 2 TECH', outdir: OUT, file: 'S04_L2_P5_Tropical_Grassland_Problems_Solutions_v2',
  label: 'FORM 2 TECHNICAL  —  LESSON 2 (PART 5)', title: 'The Tropical Grassland Region: Problems and Solutions', sumTitle: 'The Tropical Grassland Region',
  coverNote: 'Good morning, class. Today we study the problems of the savanna and their solutions.',
  cls: 'Form 2 Technical', chapter: 'Economic Geography — Natural Regions: 2. Tropical Grassland Regions', duration: '2 periods (2 × 50 minutes)',
  topic: 'Man in His Environment', subtopic: 'Natural Regions', lesson: 'Lesson 2: The Tropical Grassland Region — Part 5: Problems Faced and Attempted Solutions',
  notions: 'Drought, bush fire, overgrazing, soil erosion, desertification.',
  focus: 'Problems faced in the Tropical Grassland region and the solutions attempted.',
  competence: 'Learners are able to take simple actions against bush fires and soil erosion around their homes.',
  objectives: ['Name the main problems of the savanna.', 'Give the main solutions to these problems.'],
  recall: ['People in the savanna grow crops and rear cattle.', 'Herders move with their cattle in the dry season.'],
  situation: 'In a village near Garoua, a herder\'s cattle entered a farmer\'s field at night and ate his maize. The two men started to fight.',
  sitQA: [['What is the problem in the situation?', 'A herder and a farmer are fighting because the cattle ate the maize.'],
    ['Why did the cattle enter the field?', 'There was little grass, and nobody guarded them.'],
    ['What can the chief do?', 'He can separate farms from grazing areas.']],
  justification: 'This lesson helps us to know the problems of the savanna and how to solve them.',
  activities: [
    { sec: 'I. PROBLEMS FACED', img: 'drought_big.png', caption: 'A field in the dry savanna.', title: 'Activity 1', q: 'What problem do you see in the picture?', a: 'Drought: there is no rain, so the crops dry up.', noProj: 'ask learners what happens to crops when the rain stops early.' },
    { sec: 'I. PROBLEMS FACED', img: 'bushfire_big.png', caption: 'A bush fire in the savanna.', title: 'Activity 2', q: 'What does the fire leave behind it?', a: 'It leaves burnt, bare soil. Plants and animals are destroyed.', noProj: 'ask learners who have seen a bush fire to describe the land after it.' },
    { sec: 'I. PROBLEMS FACED', img: 'erosion_rain.gif', caption: 'Animation: rain on bare soil and on grass.', title: 'Activity 3', q: 'Why is the soil washed away on the left, but not on the right?', a: 'On the left, the soil is bare. On the right, the grass protects it.', noProj: 'pour water on a tray of bare soil and on a tray of soil with grass.' },
    { sec: 'I. PROBLEMS FACED', img: 'conflict_big.png', caption: 'A herder, his cattle and a farmer.', title: 'Activity 4', q: 'Why do farmers and herders sometimes fight?', a: 'Cattle enter the fields and eat the crops.', noProj: 'use the situation of the lesson.' },
    { sec: 'II. ATTEMPTED SOLUTIONS', img: 'treeplant_big.png', caption: 'Planting trees in the dry savanna (Opération Sahel Vert).', title: 'Activity 5', q: 'How does planting trees help the savanna?', a: 'Trees protect the soil and stop the desert from spreading.', noProj: 'ask learners where trees have been planted in Garoua.' },
  ],
  summary: [
    { title: 'I. Definitions', items: [['Drought:', 'A long period without enough rain.'], ['Overgrazing:', 'Too many animals on the same land.'], ['Desertification:', 'The spread of desert conditions.']] },
    { title: 'II. Problems Faced', intro: 'The main problems are:', items: [['A. Drought:', 'Crops dry up.'], ['B. Bush fires:', 'They destroy plants and animals.'], ['C. Soil erosion:', 'Rain and wind remove bare soil.'], ['D. Farmer–herder conflicts:', 'Cattle eat the crops.']] },
    { title: 'III. Attempted Solutions', intro: 'The main solutions are:', items: [['A. Irrigation:', 'Farmers water their crops.'], ['B. Tree planting:', 'Trees stop the desert.'], ['C. Firebreaks:', 'They stop bush fires.'], ['D. Grazing zones:', 'They separate cattle from farms.']] },
  ],
  evaluation: [['Give two problems of the savanna.', 'Drought and bush fires (also soil erosion and conflicts).'], ['Give two solutions.', 'Irrigation and tree planting.']],
  remediation: ['A long period without rain is a ______.', 'Too many animals on the same land is ______.', 'Planting trees helps to stop the ______.'],
  remediationAnswers: '1. drought 2. overgrazing 3. desert',
  homework: 'On a map of Africa in your atlas, find the Sahara Desert and write the names of three countries it covers.',
  homeworkTag: 'This prepares Lesson 3: Desert Regions.',
  bilingual: [['Drought', 'La sécheresse'], ['Bush fire', 'Le feu de brousse'], ['Overgrazing', 'Le surpâturage'], ['Soil erosion', "L'érosion des sols"], ['Tree planting', 'Le reboisement'], ['Firebreak', 'Le pare-feu']],
  timing: ['Set-up, recall 8 min', 'Situation 8 min', '5 activities 25 min', 'Board summary (copying) 30 min', 'Evaluation, remediation 10 min', 'Homework 4 min', 'Logbook 10 min', 'Spare 5 min'],
  teacherNote: ['Activity 3 is an animation (GIF): it plays automatically in slide-show mode.', 'Opération Sahel Vert is the Cameroonian tree-planting programme in the North and Far North.'],
  references: ['National Economic Geography Syllabus (MINESEC), Form 2 Technical.'],
};

(async () => { await build(f4); await build(f2); })();
