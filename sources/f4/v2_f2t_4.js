// FORM 2 TECHNICAL — v2 light lessons: Lesson 5, The Sectors of the Economy (S14–S19)
const { run } = require('./v2');
const L = [];

L.push({
  src: 'S14_L5_P1_Sectors_Introduction',
  situation: 'Ahmadou\'s father grows cotton near Garoua. His uncle works in the CICAM factory, where cotton becomes cloth. His aunt sells cloth in the market. His cousin looks for better cotton seeds in a research centre.',
  sitQA: [['What is the problem in the situation?', 'Ahmadou does not know how to group the jobs of his family.'],
    ['Who works with cotton first?', 'His father, who grows it.'],
    ['What links all these jobs?', 'They all work with cotton, one after the other.']],
  justification: 'This lesson helps us to know the main groups of jobs in a country.',
  activities: [
    { sec: 'I. DEFINITIONS', img: 'f2t_tailor.jpg', caption: 'A tailor at work.', q: 'The tailor makes a dress. Can we touch it? Is it a good or a service?', a: 'Yes, we can touch it. It is a good.', noProj: 'show a piece of cloth or a pen: things we can touch are goods.' },
    { sec: 'I. DEFINITIONS', img: 'f2t_doctor.jpg', caption: 'A health worker with a patient.', q: 'The doctor treats a patient. Is this a good or a service?', a: 'A service: work done for other people.', noProj: 'ask learners to name people who give services in Garoua.' },
    { sec: 'I. DEFINITIONS', img: 'f2t_cotton_harvest2.jpg', caption: 'Raw cotton after the harvest.', q: 'Cotton is used to make cloth. What do we call it?', a: 'A raw material.', noProj: 'bring raw cotton and a piece of cloth.' },
    { sec: 'II. THE FOUR SECTORS', img: 'cotton_journey.gif', caption: 'Animation: the journey of cotton.', q: 'Name the four sectors in the order of the journey of cotton.', a: 'Primary, secondary, tertiary and quaternary.', noProj: 'draw four boxes on the board: farmer, factory, trader, researcher.' },
    { sec: 'II. THE FOUR SECTORS', img: 'f2t_researcher.jpg', caption: 'A scientist in a laboratory.', q: 'Ahmadou\'s cousin looks for better seeds. In which sector does she work?', a: 'In the quaternary sector.', noProj: 'ask learners what a researcher does.' },
  ],
  summary: [
    { title: 'I. Definitions', items: [['Economy:', 'It is all the work people do to produce, sell and buy.'], ['Goods:', 'They are things we can touch, like food.'], ['Services:', 'They are work done for others, like teaching.'], ['Raw material:', 'It is a natural product used to make goods.'], ['Sector:', 'It is a group of jobs of the same kind.']] },
    { title: 'II. The Four Sectors', items: [['A. Primary:', 'It takes products from nature.'], ['B. Secondary:', 'It makes goods in factories.'], ['C. Tertiary:', 'It gives services.'], ['D. Quaternary:', 'It creates knowledge.']], draw: { img: 'cotton_journey_last.png', caption: 'Copy the journey of cotton.' } },
  ],
  evaluation: [['What is the difference between a good and a service?', 'A good can be touched; a service is work done for others.'], ['Name the four sectors of the economy.', 'Primary, secondary, tertiary and quaternary.']],
  remediation: ['Things that we can touch are ______.', 'A natural product used to make goods is a ______ material.', 'The sector that makes goods in factories is the ______ sector.'],
  remediationAnswers: '1. goods 2. raw 3. secondary',
  teacherNote: ['CICAM (Cotonnière Industrielle du Cameroun) spins and weaves cotton in Garoua.'],
});

L.push({
  src: 'S15_L5_P2_Formal_Informal_Sectors',
  situation: 'Mr Bello works in a bank in Garoua. He has a contract, a salary every month and a pension later. His neighbour Moussa is a moto-taxi driver. He has no contract, and his money changes every day.',
  sitQA: [['What is the problem in the situation?', 'Moussa has no contract and no regular money.'],
    ['What does Mr Bello have that Moussa does not have?', 'A contract, a monthly salary and a pension.'],
    ['What can Moussa do?', 'Register his work and join the CNPS.']],
  justification: 'This lesson helps us to know the difference between the formal and the informal sector.',
  activities: [
    { sec: 'I. THE FORMAL SECTOR', img: 'f2t_bank.jpg', caption: 'A bank in an African city.', q: 'The bank is registered and pays taxes. Which sector does it belong to?', a: 'The formal sector.', noProj: 'ask learners to name a bank or company in Garoua.' },
    { sec: 'I. THE FORMAL SECTOR', img: 'f2t_factory_workers.jpg', caption: 'Workers in a food factory.', q: 'These workers have contracts and a salary. Give one advantage.', a: 'They are paid every month and get a pension.', noProj: 'ask learners who works for SODECOTON, a school or a hospital.' },
    { sec: 'II. THE INFORMAL SECTOR', img: 'f2t_moto_taxi.jpg', caption: 'Moto-taxis in a Cameroonian town.', q: 'Is the moto-taxi driver registered? Which sector is this?', a: 'Usually not. It is the informal sector.', noProj: 'use the situation of Moussa.' },
    { sec: 'II. THE INFORMAL SECTOR', img: 'f2t_street_vendor.jpg', caption: 'A woman sells roasted maize in the street.', q: 'Why do many young people work in the informal sector?', a: 'It is easy to start and needs little money.', noProj: 'ask learners about small traders in their area.' },
    { sec: 'III. COMPARISON', img: 'formal_informal_big.png', caption: 'Formal and informal sectors.', q: 'Give two problems of working in the informal sector.', a: 'No contract and no pension. The money is not regular.', noProj: 'draw the two columns on the board.' },
  ],
  summary: [
    { title: 'I. Definitions', items: [['Formal sector:', 'It is work that is registered and pays taxes.'], ['Informal sector:', 'It is small work that is not registered.'], ['Pension:', 'It is money paid to a worker after he stops working.']] },
    { title: 'II. The Formal Sector', items: [['A. Registration:', 'Companies pay taxes.'], ['B. Contracts:', 'Workers get a monthly salary.'], ['C. Protection:', 'Workers join the CNPS.'], ['D. Examples:', 'SODECOTON, banks, schools and hospitals.']] },
    { title: 'III. The Informal Sector', items: [['A. Examples:', 'Moto-taxis, street sellers and mechanics.'], ['B. Importance:', 'It gives work to most people.'], ['C. Problems:', 'No contract and no pension.'], ['D. Solutions:', 'Register the work and join the CNPS.']], draw: { img: 'formal_informal_big.png', caption: 'Copy the table.' } },
  ],
  evaluation: [['What is the informal sector?', 'Small work that is not registered with the state.'], ['Give one problem of informal workers.', 'They have no pension (or no contract).']],
  remediation: ['Work that is registered and pays taxes is the ______ sector.', 'A moto-taxi driver usually works in the ______ sector.', 'Money paid after a worker stops working is a ______.'],
  remediationAnswers: '1. formal 2. informal 3. pension',
  teacherNote: ['CNPS: Caisse Nationale de Prévoyance Sociale (national social insurance fund). About 9 workers out of 10 in Cameroon work in the informal sector.'],
});

L.push({
  src: 'S16_L5_P3_Primary_Sector',
  situation: 'In the Garoua market, Rahila sees maize from Pitoa, fish from the Lagdo lake, beef from the Adamawa and firewood from the bush. Her mother says, "All these come from nature."',
  sitQA: [['What is the problem in the situation?', 'Rahila wants to know how these products are grouped.'],
    ['Where does each product come from?', 'Maize from Pitoa, fish from Lagdo, beef from Adamawa, wood from the bush.'],
    ['What do they have in common?', 'They are all taken from nature.']],
  justification: 'This lesson helps us to know the jobs that take products from nature.',
  activities: [
    { sec: 'I. AGRICULTURE', img: 'f2t_maize.jpg', caption: 'A farmer holds a cob of maize.', q: 'The farmer takes food from nature. Which sector is this?', a: 'The primary sector.', noProj: 'ask learners which crops their family grows.' },
    { sec: 'II. LIVESTOCK REARING', img: 'f2t_cattle_market.jpg', caption: 'A cattle market.', q: 'Where do most cattle of Cameroon come from?', a: 'From the North and the Adamawa plateau.', noProj: 'ask learners where cattle are sold in Garoua.' },
    { sec: 'III. FISHING', img: 'f2t_fish_market.jpg', caption: 'Fresh fish for sale.', q: 'Name two places where people fish in Cameroon.', a: 'The Lagdo lake and the sea at Kribi (also Limbe, Douala).', noProj: 'ask learners where the fish of the Garoua market comes from.' },
    { sec: 'IV. FORESTRY', img: 'f2t_logging_truck.jpg', caption: 'Logs from the forest of East Cameroon.', q: 'Which primary product comes from the forest?', a: 'Timber (wood).', noProj: 'ask learners what wood is used for.' },
    { sec: 'V. MINING', img: 'f2t_gold_mining.jpg', caption: 'People dig for gold by hand.', q: 'What are these people taking from the ground?', a: 'Gold. Taking minerals from the ground is mining.', noProj: 'name minerals of Cameroon: oil, gold, bauxite, limestone.' },
  ],
  summary: [
    { title: 'I. Definitions', items: [['Primary sector:', 'It is the sector that takes products from nature.'], ['Mining:', 'It is taking minerals from the ground.']] },
    { title: 'II. Examples', items: [['A. Agriculture:', 'Maize, cassava, cotton and cocoa.'], ['B. Livestock rearing:', 'Cattle in the North and Adamawa.'], ['C. Fishing:', 'Lagdo, Kribi and Limbe.'], ['D. Forestry:', 'Timber from the southern forests.'], ['E. Mining:', 'Oil, gold and limestone.']] },
    { title: 'III. Importance', items: [['A. Food:', 'It feeds the people.'], ['B. Jobs:', 'It employs most people in villages.'], ['C. Exports:', 'Cameroon sells cocoa, cotton and timber.']] },
  ],
  evaluation: [['What is the primary sector?', 'The sector that takes products from nature.'], ['Give three primary activities.', 'Farming, fishing and mining (also rearing, forestry).']],
  remediation: ['Taking products from nature is the ______ sector.', 'Taking minerals from the ground is called ______.', 'Cutting trees for timber is called ______.'],
  remediationAnswers: '1. primary 2. mining 3. forestry (lumbering)',
});

L.push({
  src: 'S17_L5_P4_Secondary_Sector',
  situation: 'Cameroon sells raw cotton and cocoa beans at low prices. Later, it buys back clothes and chocolate made from them at high prices. Djibrilla wonders why.',
  sitQA: [['What is the problem in the situation?', 'Cameroon sells raw products cheaply and buys finished goods at high prices.'],
    ['What are clothes and chocolate made from?', 'Cotton and cocoa.'],
    ['What can Cameroon do?', 'Build more factories to make the goods here.']],
  justification: 'This lesson helps us to know the jobs that make goods.',
  activities: [
    { sec: 'I. DEFINITION', img: 'f2t_textile_factory.jpg', caption: 'Machines that weave cloth in a factory.', q: 'This factory turns cotton into cloth. Which sector is this?', a: 'The secondary sector.', noProj: 'show raw cotton and a piece of cloth.' },
    { sec: 'II. EXAMPLES', img: 'f2t_brewery.jpg', caption: 'Machines fill bottles in a drinks factory.', q: 'Name two factories of North Cameroon and what they make.', a: 'CICAM (cloth) and SODECOTON (cotton oil). Also drinks factories.', noProj: 'ask learners which products are made in Garoua.' },
    { sec: 'II. EXAMPLES', img: 'f2t_aluminium.jpg', caption: 'An aluminium factory seen from the sky.', q: 'Alucam at Edéa makes aluminium. What type of industry is this?', a: 'A heavy industry: it transforms minerals.', noProj: 'show a cooking pot made of aluminium.' },
    { sec: 'II. EXAMPLES', img: 'f2t_construction.jpg', caption: 'Workers build a house.', q: 'Is building houses and roads part of the secondary sector? Why?', a: 'Yes. Builders make new things from sand, cement and iron.', noProj: 'ask learners to name buildings under construction in Garoua.' },
    { sec: 'II. EXAMPLES', img: 'f2t_blacksmith.jpg', caption: 'A blacksmith makes tools.', q: 'The blacksmith makes tools by hand. What do we call this work?', a: 'Crafts (handicraft).', noProj: 'ask learners to name craftsmen: tailors, potters, carpenters.' },
  ],
  summary: [
    { title: 'I. Definitions', items: [['Secondary sector:', 'It is the sector that turns raw materials into goods.'], ['Industry:', 'It is a factory or group of factories.'], ['Craft:', 'It is making goods by hand.']] },
    { title: 'II. Examples', items: [['A. Agro-industries:', 'CICAM makes cloth from cotton.'], ['B. Heavy industries:', 'Alucam makes aluminium.'], ['C. Construction:', 'Building houses, roads and bridges.'], ['D. Energy:', 'The Lagdo and Edéa dams make electricity.'], ['E. Crafts:', 'Tailors, blacksmiths and potters.']] },
  ],
  evaluation: [['What is the secondary sector?', 'The sector that turns raw materials into goods.'], ['Give two examples of industries in Cameroon.', 'CICAM (cloth) and Alucam (aluminium).']],
  remediation: ['Turning raw materials into goods is the ______ sector.', 'CICAM turns cotton into ______.', 'Alucam at Edéa makes ______.'],
  remediationAnswers: '1. secondary 2. cloth 3. aluminium',
});

L.push({
  src: 'S18_L5_P5_Tertiary_Sector',
  situation: 'The CICAM factory in Garoua has made a lot of cloth. But the road to Ngaoundéré is damaged, and lorries cannot pass. The cloth stays in the factory, and traders in the South have nothing to sell.',
  sitQA: [['What is the problem in the situation?', 'The cloth cannot reach the traders because the road is damaged.'],
    ['Which service is missing?', 'Transport.'],
    ['What can the government do?', 'Repair the road.']],
  justification: 'This lesson helps us to know the jobs that give services.',
  activities: [
    { sec: 'I. TRADE', img: 'f2t_market.jpg', caption: 'A market in Cameroon.', q: 'These people buy and sell. What do we call this service?', a: 'Trade.', noProj: 'ask learners to describe the Garoua central market.' },
    { sec: 'II. TRANSPORT', img: 'f2t_train.jpg', caption: 'A train in Cameroon.', q: 'Name three means of transport used in Cameroon.', a: 'Road (lorries, buses), train and plane (also boats).', noProj: 'ask learners how they travel to Ngaoundéré or Yaoundé.' },
    { sec: 'III. BANKING', img: 'f2t_mobile_money.jpg', caption: 'A mobile money shop.', q: 'How does mobile money help people?', a: 'People can send and keep money with a phone.', noProj: 'ask learners who uses mobile money in their family.' },
    { sec: 'IV. SOCIAL SERVICES', img: 'f2t_classroom.jpg', caption: 'A teacher in a classroom.', q: 'Name two services given by the state.', a: 'Schools (education) and hospitals (health).', noProj: 'use the class itself as the example.' },
    { sec: 'V. TOURISM', img: 'f2t_safari.jpg', caption: 'A leopard in a national park.', q: 'Why do tourists visit North Cameroon?', a: 'To see wild animals in the Waza and Bénoué parks.', noProj: 'ask learners to name the national parks of the North.' },
  ],
  summary: [
    { title: 'I. Definitions', items: [['Tertiary sector:', 'It is the sector that gives services.'], ['Trade:', 'It is buying and selling goods.'], ['Tourism:', 'It is travelling to visit places for pleasure.']] },
    { title: 'II. Examples', items: [['A. Trade:', 'Markets, shops and supermarkets.'], ['B. Transport:', 'Road, train, plane and boat.'], ['C. Banking:', 'Banks and mobile money.'], ['D. Social services:', 'Schools and hospitals.'], ['E. Tourism:', 'Waza and Bénoué parks, Kribi beach.']] },
  ],
  evaluation: [['What is the tertiary sector?', 'The sector that gives services.'], ['Give three examples of services.', 'Trade, transport and education (also banking, health, tourism).']],
  remediation: ['The sector that gives services is the ______ sector.', 'Buying and selling goods is called ______.', 'Visiting parks for pleasure is ______.'],
  remediationAnswers: '1. tertiary 2. trade 3. tourism',
});

L.push({
  src: 'S19_L5_P6_Quaternary_Sector',
  situation: 'For many years, drought destroyed the maize of farmers near Garoua. Then researchers created a new maize that grows fast and needs less water. Now the harvests are better.',
  sitQA: [['What was the problem in the situation?', 'Drought destroyed the maize.'],
    ['Who solved the problem?', 'Researchers, with a new maize.'],
    ['Which sector do researchers belong to?', 'The quaternary sector.']],
  justification: 'This lesson helps us to know the jobs of knowledge and research.',
  activities: [
    { sec: 'I. DEFINITION', img: 'f2t_researcher2.jpg', caption: 'Researchers at work.', q: 'Researchers create new knowledge. Which sector is this?', a: 'The quaternary sector.', noProj: 'use the situation of the new maize.' },
    { sec: 'II. EXAMPLES', img: 'f2t_field_trial.jpg', caption: 'Researchers test new plants in a field.', q: 'Give one research centre in Cameroon.', a: 'IRAD (research for farming). Also the universities.', noProj: 'mention the IRAD station at Garoua.' },
    { sec: 'II. EXAMPLES', img: 'f2t_phone_farmer.jpg', caption: 'A farmer uses a mobile phone.', q: 'How does the phone help farmers and traders?', a: 'They get prices and weather news, and send money.', noProj: 'ask learners how their parents use phones for work.' },
    { sec: 'II. EXAMPLES', img: 'f2t_computer_class.jpg', caption: 'Students learn with computers.', q: 'Name one job of information technology.', a: 'Making software, websites or phone apps.', noProj: 'ask learners who uses a computer at home or at school.' },
    { sec: 'III. IMPORTANCE', img: 'quaternary_big.png', caption: 'Research helps all the other sectors.', q: 'How does research help the other sectors?', a: 'Better seeds, new machines, new medicines and mobile money.', noProj: 'draw a circle with four arrows on the board.' },
  ],
  summary: [
    { title: 'I. Definitions', items: [['Quaternary sector:', 'It is the sector of knowledge and research.'], ['Research:', 'It is careful work to find new knowledge.'], ['ICT:', 'It is computers, phones and the internet.']] },
    { title: 'II. Examples', items: [['A. Research:', 'IRAD and the universities.'], ['B. ICT:', 'Software, websites and phone apps.'], ['C. Advice:', 'Experts help the government and companies.']] },
    { title: 'III. Importance', items: [['A. Farming:', 'Better seeds.'], ['B. Industry:', 'New machines.'], ['C. Services:', 'Mobile money and new medicines.']], draw: { img: 'quaternary_big.png', caption: 'Copy this simple drawing.' } },
  ],
  evaluation: [['What is the quaternary sector?', 'The sector of knowledge and research.'], ['Give one example of how research helps farmers.', 'It gives better seeds that resist drought.']],
  remediation: ['The sector of knowledge and research is the ______ sector.', 'The research centre for farming in Cameroon is ______.', 'Computers, phones and the internet are called ______.'],
  remediationAnswers: '1. quaternary 2. IRAD 3. ICT',
  teacherNote: ['IRAD: Institut de Recherche Agricole pour le Développement, with a regional centre at Garoua.'],
});

module.exports = L;
if (require.main === module) run(L, process.argv.slice(2).length ? process.argv.slice(2) : null);
