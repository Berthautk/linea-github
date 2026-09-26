// FORM 4 — v2 light lessons (50 minutes, 3 activities): L1, FS1, L2, L3, PW1, L4, PW2, L5, L6
const { run } = require('./v2');
const L = [];

L.push({
  src: 'FORM4_LESSON01_Our_Planet_the_Earth',
  situation: 'On a long, straight road, Aïcha sees a lorry coming from far away. First, she sees only the top of the lorry. Then she sees the whole lorry. Her brother says, "The Earth is flat."',
  sitQA: [['What is the problem in the situation?', 'Aïcha cannot explain why she saw the top of the lorry first.'],
    ['Which part of the lorry did she see first?', 'She saw the top of the lorry first.'],
    ['How can she show her brother that the Earth is round?', 'She can show him a globe and photos of the Earth from space.']],
  justification: 'This lesson helps us to know the size and the shape of our planet.',
  activities: [
    { sec: 'SHAPE OF THE EARTH', img: 'f4_earth_space.jpg', caption: 'The Earth seen from space.', q: 'Look at the photo. What is the shape of the Earth?', a: 'The Earth is round, like a ball.', noProj: 'show a globe or a ball.' },
    { sec: 'PROOFS', img: 'ship_sailing.gif', caption: 'Animation: a ship sails away from the coast.', q: 'Which part of the ship disappears first? Why?', a: 'The bottom of the ship disappears first, because the ship goes over the curve of the Earth.', noProj: 'draw three ships going down behind a curved line and ask the question.' },
    { sec: 'PROOFS', img: 'f4_lunar_eclipse.jpg', caption: 'An eclipse of the Moon: the Moon is inside the shadow of the Earth.', q: 'During an eclipse, the edge of the shadow of the Earth on the Moon is always curved. What does this prove?', a: 'The Earth is round. Only a round object gives a round shadow.', noProj: 'hold a ball in front of a torch: its shadow on the wall is round.' },
  ],
  summary: [
    { title: 'I. Definitions', items: [['Planet:', 'It is a large body that moves around the Sun.'], ['Oblate spheroid:', 'It is a ball that is flat at the poles and wider at the Equator.']] },
    { title: 'II. Size of the Earth', intro: 'The main measurements of the Earth are:', items: [['A. Distance around the Equator:', 'about 40,075 km.'], ['B. Distance around the poles:', 'about 40,008 km.'], ['C. Diameter at the Equator:', 'about 12,756 km.']] },
    { title: 'III. Shape of the Earth', items: [['Shape:', 'The Earth is an oblate spheroid.']], draw: { img: 'earth_shape_big.png', caption: 'Copy this simple drawing.' } },
    { title: 'IV. Proofs of the Shape', intro: 'The main proofs are:', items: [['A. The ship:', 'Its bottom disappears first.'], ['B. The eclipse of the Moon:', 'The shadow of the Earth is round.'], ['C. Photos from space:', 'They show a round Earth.'], ['D. Travel around the world:', 'We come back to the start.']] },
  ],
  evaluation: [['What is the shape of the Earth?', 'It is an oblate spheroid.'], ['Give two proofs that the Earth is round.', 'The ship at sea and the round shadow of the Earth on the Moon.']],
  remediation: ['The Earth is flat at the ______.', 'The Earth is wider at the ______.', 'The shadow of the Earth on the Moon is ______.'],
  remediationAnswers: '1. poles 2. Equator 3. round',
  teacherNote: ['Figures: equatorial circumference 40,075 km; polar 40,008 km; equatorial diameter 12,756 km; polar 12,714 km.'],
});

L.push({
  src: 'FORM4_FURTHER_STUDY1_Universe_and_Moon',
  situation: 'One evening, Hawaou sits outside with her grandmother. The full Moon lights up the compound. Grandmother says that people used to plant some crops according to the shape of the Moon. Hawaou wonders why the Moon changes its shape.',
  sitQA: [['What is the problem in the situation?', 'Hawaou does not know why the Moon changes its shape.'],
    ['What lights up the compound?', 'The full Moon.'],
    ['Where does the light of the Moon come from?', 'From the Sun. The Moon has no light of its own.']],
  justification: 'This lesson helps us to know the universe, the Moon and its effects on our life.',
  activities: [
    { sec: 'I. THE UNIVERSE', img: 'f4_milkyway.jpg', caption: 'The Milky Way at night.', q: 'This band of light is made of billions of stars. What is it called?', a: 'The Milky Way, our galaxy.', noProj: 'ask learners to look at the night sky far from town lights.' },
    { sec: 'II. THE PHASES OF THE MOON', img: 'moon_phases.gif', caption: 'Animation: the Moon moves around the Earth.', q: 'Why does the shape of the Moon seem to change?', a: 'The Sun lights half of the Moon. We see a different part of this lit half as the Moon moves.', noProj: 'use a ball and a torch: move the ball around a learner\'s head.' },
    { sec: 'III. IMPACTS OF THE MOON', img: 'f4_lowtide.jpg', caption: 'Boats on the sand when the sea is low.', q: 'The sea goes down and comes back twice a day. What causes this?', a: 'The pull (gravity) of the Moon. This is the tide.', noProj: 'describe the beach at Kribi in the morning and in the evening.' },
  ],
  summary: [
    { title: 'I. Definitions', items: [['Universe:', 'It is all of space and everything in it.'], ['Galaxy:', 'It is a huge group of stars.'], ['Satellite:', 'It is a body that moves around a planet.'], ['Phases of the Moon:', 'They are the shapes of the Moon that we see.']] },
    { title: 'II. The Universe', items: [['A. Galaxies:', 'Our galaxy is the Milky Way.'], ['B. The Sun:', 'It gives light and heat to the Earth.'], ['C. The Moon:', 'It is the satellite of the Earth.']] },
    { title: 'III. The Phases of the Moon', items: [['A. New Moon:', 'We do not see the Moon.'], ['B. First quarter:', 'We see the right half.'], ['C. Full Moon:', 'We see the whole Moon.'], ['D. Last quarter:', 'We see the left half.']], draw: { img: 'moon_phases_big.png', caption: 'Copy the four main phases.' } },
    { title: 'IV. Impacts of the Moon', items: [['A. Tides:', 'The Moon pulls the water of the sea.'], ['B. Fishing:', 'Fishermen use the times of the tide.'], ['C. Calendar:', 'Ramadan begins with the new Moon.']] },
  ],
  evaluation: [['What is a galaxy? Name our galaxy.', 'A huge group of stars. Ours is the Milky Way.'], ['What causes the tides?', 'The pull (gravity) of the Moon.']],
  remediation: ['Our galaxy is called the ______ Way.', 'When we see the whole Moon, it is the ______ Moon.', 'The rise and fall of the sea are called ______.'],
  remediationAnswers: '1. Milky 2. Full 3. tides',
});

L.push({
  src: 'FORM4_LESSON02_Latitudes_and_Longitudes',
  situation: 'Ibrahim\'s cousin in Douala sends a parcel to Japan. On his phone, he shows Tokyo: "35° N, 139° E". Ibrahim does not understand what these numbers mean.',
  sitQA: [['What is the problem in the situation?', 'Ibrahim does not understand the numbers that show a place.'],
    ['What do N and E mean?', 'North and East.'],
    ['What are these two numbers called?', 'The latitude and the longitude.']],
  justification: 'This lesson helps us to find any place on the Earth.',
  activities: [
    { sec: 'I. LATITUDES', img: 'latitudes_big.png', caption: 'The main lines of latitude.', q: 'Name the line in the middle of the Earth. What is its value?', a: 'The Equator. Its value is 0°.', noProj: 'draw a circle with five lines across it on the board.' },
    { sec: 'II. LONGITUDES', img: 'longitudes_big.png', caption: 'Lines of longitude.', q: 'Where do the lines of longitude meet? Name the line of 0°.', a: 'They meet at the poles. The line of 0° is the Greenwich Meridian.', noProj: 'draw lines from the top to the bottom of a circle.' },
    { sec: 'III. COORDINATES', img: 'cameroon_grid_big.png', caption: 'Cameroon with lines of latitude and longitude.', q: 'Garoua is at about 9° N and 13° E. What do these numbers mean?', a: '9° north of the Equator and 13° east of Greenwich.', noProj: 'draw a grid on the board and place a dot for Garoua.' },
  ],
  summary: [
    { title: 'I. Definitions', items: [['Latitude:', 'It is the distance north or south of the Equator.'], ['Longitude:', 'It is the distance east or west of Greenwich.'], ['Coordinates:', 'They are the latitude and the longitude of a place.']] },
    { title: 'II. Latitudes', items: [['A. Equator:', '0°.'], ['B. Tropics:', '23½° N (Cancer) and 23½° S (Capricorn).'], ['C. Polar circles:', '66½° N and 66½° S.'], ['D. Characteristic:', 'Latitudes are parallel and never meet.']], draw: { img: 'latitudes_big.png', caption: 'Copy the five main lines.' } },
    { title: 'III. Longitudes', items: [['A. Greenwich Meridian:', '0°.'], ['B. Opposite line:', '180°.'], ['C. Characteristic:', 'Longitudes meet at the poles.']] },
    { title: 'IV. Coordinates', items: [['A. Order:', 'We write the latitude first.'], ['B. Example:', 'Garoua: 9° N, 13° E.']] },
  ],
  evaluation: [['What is the value of the Equator?', '0°.'], ['Give one difference between latitudes and longitudes.', 'Latitudes never meet; longitudes meet at the poles.']],
  remediation: ['The line of 0° latitude is the ______.', 'The line of 0° longitude is the ______ Meridian.', 'We write the ______ first, then the longitude.'],
  remediationAnswers: '1. Equator 2. Greenwich 3. latitude',
});

L.push({
  src: 'FORM4_LESSON03_Great_Circles_and_IDL',
  situation: 'On 31 December, Fatimé watches the news. In the afternoon, people in Australia are already celebrating the New Year. After midnight in Garoua, people in America are still waiting.',
  sitQA: [['What is the problem in the situation?', 'Fatimé does not understand why the New Year comes at different times.'],
    ['Which country celebrates first?', 'Australia (and New Zealand).'],
    ['Which line decides where a new day begins?', 'The International Date Line.']],
  justification: 'This lesson helps us to know great circles and the line where each new day begins.',
  activities: [
    { sec: 'I. GREAT CIRCLES', img: 'great_circles_big.png', caption: 'A great circle and a small circle.', q: 'Which circle cuts the Earth into two equal halves?', a: 'The great circle, like the Equator.', noProj: 'cut an orange in two equal halves, then cut a small piece from the top.' },
    { sec: 'II. THE DATE LINE', img: 'f4_fireworks.jpg', caption: 'New Year fireworks in Sydney, Australia.', q: 'Why does Australia see the New Year before Cameroon?', a: 'It is far to the east, near the Date Line, where each new day begins.', noProj: 'ask learners who has seen the New Year on television.' },
    { sec: 'II. THE DATE LINE', img: 'idl_big.png', caption: 'The International Date Line in the Pacific Ocean.', q: 'West of the line it is Monday. What day is it east of the line?', a: 'Sunday: one day behind.', noProj: 'draw a line and write MONDAY on the left and SUNDAY on the right.' },
  ],
  summary: [
    { title: 'I. Definitions', items: [['Great circle:', 'It is a circle that cuts the Earth into two equal halves.'], ['Small circle:', 'It is a circle that does not cut the Earth into equal halves.'], ['International Date Line:', 'It is the line where each new day begins.']] },
    { title: 'II. Great Circles', items: [['A. Examples:', 'The Equator and every meridian with its opposite.'], ['B. Importance:', 'A great circle is the shortest way between two places.'], ['C. Use:', 'Pilots and ships follow great circles.']], draw: { img: 'great_circles_big.png', caption: 'Copy the two circles.' } },
    { title: 'III. The International Date Line', items: [['A. Place:', 'It follows 180° in the Pacific Ocean.'], ['B. Shape:', 'It bends to avoid countries.'], ['C. Going west:', 'We add one day.'], ['D. Going east:', 'We remove one day.']] },
  ],
  evaluation: [['Is the Equator a great circle? Why?', 'Yes. It cuts the Earth into two equal halves.'], ['What happens to the date when we cross the Date Line going west?', 'We add one day.']],
  remediation: ['A circle that cuts the Earth into two equal halves is a ______ circle.', 'The International Date Line follows the ______ degree line.', 'Crossing the line going west, we ______ one day.'],
  remediationAnswers: '1. great 2. 180th 3. add',
});

L.push({
  src: 'FORM4_PRACTICAL_WORK1_Locate_a_Place_on_a_Map',
  situation: 'A Red Cross team in Garoua must bring medicines to a small village. The office sends only two numbers: "10° N, 14° E". The team must find the village on their paper map.',
  sitQA: [['What is the problem in the situation?', 'The team must find a village with only two numbers.'],
    ['What do the two numbers show?', 'The latitude (10° N) and the longitude (14° E).'],
    ['Where are these numbers written on a map?', 'On the sides (latitude) and the top (longitude) of the map.']],
  justification: 'This practical work helps us to find a place on a map with its coordinates.',
  activities: [
    { sec: 'I. REVISION', img: 'cameroon_grid_big.png', caption: 'A map of Cameroon with a grid.', q: 'Where is the latitude written on this map? And the longitude?', a: 'Latitude on the left side. Longitude at the top.', noProj: 'draw a grid on the board and number its sides.' },
    { sec: 'II. STEPS', img: 'coordinates.gif', caption: 'Animation: reading the coordinates of Garoua.', q: 'What are the two steps to read the coordinates of Garoua?', a: '1. Go left to read the latitude: 9° N. 2. Go up to read the longitude: 13° E.', noProj: 'show the steps with a ruler on the map of the atlas.' },
    { sec: 'III. EXERCISE', img: 'africa_grid_big.png', caption: 'Africa with a grid of 10°. Find the red dot.', q: 'Give the coordinates of the red dot in Cameroon.', a: 'About 4° N and 12° E.', noProj: 'give learners the atlas map of Africa.' },
  ],
  summary: [
    { title: 'I. Definitions', items: [['Coordinates:', 'They are the latitude and the longitude of a place.'], ['Grid:', 'It is the set of lines of latitude and longitude on a map.']] },
    { title: 'II. Steps to Read Coordinates', items: [['Step 1:', 'Find the place on the map.'], ['Step 2:', 'Go left and read the latitude.'], ['Step 3:', 'Go up and read the longitude.'], ['Step 4:', 'Write the latitude first: 9° N, 13° E.']], draw: { img: 'coordinates_last.png', caption: 'Copy the example of Garoua.' } },
    { title: 'III. Exercise', items: [['A. Garoua:', 'about 9° N, 13° E.'], ['B. Maroua:', 'about 11° N, 14° E.'], ['C. Yaoundé:', 'about 4° N, 12° E.']] },
  ],
  evaluation: [['What do we read first: the latitude or the longitude?', 'The latitude.'], ['Which town is at about 4° N, 12° E?', 'Yaoundé.']],
  remediation: ['On a map, the latitude is read on the ______ side.', 'The longitude is read at the ______.', 'Garoua is at about 9° N and ______ ° E.'],
  remediationAnswers: '1. left (or right) 2. top (or bottom) 3. 13',
});

L.push({
  src: 'FORM4_LESSON04_Local_Time_Standard_Time_Time_Zones',
  situation: 'The Indomitable Lions play a match in Brazil. The match starts at 3 p.m. in Brazil, but in Garoua we watch it at 7 p.m. Alima wonders why the time is not the same everywhere.',
  sitQA: [['What is the problem in the situation?', 'Alima does not know why Brazil and Garoua have different times.'],
    ['What is the time difference?', '4 hours.'],
    ['Why is it later in Garoua?', 'Garoua is east of Brazil. The Sun rises there first.']],
  justification: 'This lesson helps us to understand why time changes from place to place.',
  activities: [
    { sec: 'I. LOCAL TIME', img: 'time_line_big.png', caption: '15° of longitude = 1 hour.', q: 'It is 12:00 at 0°. What time is it at 15° E and at 15° W?', a: '13:00 at 15° E, 11:00 at 15° W.', noProj: 'draw the time line on the board.' },
    { sec: 'II. TIME ZONES', img: 'time_zones_big.png', caption: 'The time zones of the world.', q: 'How many time zones are there? In which one is Cameroon?', a: '24 time zones. Cameroon is in GMT + 1.', noProj: 'draw 24 strips on the board.' },
    { sec: 'II. TIME ZONES', img: 'f4_worldclocks.jpg', caption: 'Clocks showing the time in different cities.', q: 'Why do these clocks show different times?', a: 'Each city is in a different time zone.', noProj: 'ask learners to compare the time on a phone set to another country.' },
  ],
  summary: [
    { title: 'I. Definitions', items: [['Local time:', 'It is the time given by the Sun in a place.'], ['Standard time:', 'It is the official time of a country or zone.'], ['Time zone:', 'It is an area where people use the same time.']] },
    { title: 'II. Local and Standard Time', items: [['A. The rule:', '15° = 1 hour and 1° = 4 minutes.'], ['B. East:', 'Places to the east are ahead.'], ['C. Cameroon:', 'It uses West Africa Time (GMT + 1).']], draw: { img: 'time_line_big.png', caption: 'Copy the time line.' } },
    { title: 'III. Time Zones', items: [['A. Number:', 'There are 24 main time zones.'], ['B. Width:', 'Each zone is about 15° wide.'], ['C. Big countries:', 'Russia has 11 time zones.']] },
  ],
  evaluation: [['How many degrees does the Earth turn in one hour?', '15°.'], ['What is the standard time of Cameroon?', 'West Africa Time, GMT + 1.']],
  remediation: ['The Earth turns ______ ° in one hour.', 'There are ______ main time zones.', 'Places to the east have a time that is ______.'],
  remediationAnswers: '1. 15 2. 24 3. ahead',
});

L.push({
  src: 'FORM4_PRACTICAL_WORK2_Calculation_of_Time_and_Date',
  situation: 'A World Cup match in Los Angeles starts at 5 p.m. on Sunday, local time (GMT − 7). Moussa and his friends in Garoua want to watch it live. They must calculate the time in Garoua.',
  sitQA: [['What is the problem in the situation?', 'Moussa must find the time of the match in Garoua.'],
    ['What is the time difference between Los Angeles and Garoua?', '8 hours (from GMT − 7 to GMT + 1).'],
    ['At what time will they watch?', 'At 1 a.m. on Monday.']],
  justification: 'This practical work helps us to calculate the time and the date in other places.',
  activities: [
    { sec: 'I. THE RULES', img: 'time_line_big.png', caption: 'The rules of time.', q: 'Going east, do we add or remove time? And going west?', a: 'East: we add. West: we remove.', noProj: 'write EAST = + and WEST = − on the board.' },
    { sec: 'II. SUN TIME', img: 'time_calc_big.png', caption: 'A worked example.', q: 'It is 12:00 in Garoua (13° E). What time is it at 43° E?', a: '14:00. The difference is 30°, which is 2 hours, and we add.', noProj: 'write the steps on the board.' },
    { sec: 'III. THE DATE', img: 'idl_big.png', caption: 'The International Date Line.', q: 'It is 10:00 on Sunday west of the Date Line. What day is it just east of the line?', a: 'Saturday, 10:00: we remove one day.', noProj: 'draw the Date Line with the two days.' },
  ],
  summary: [
    { title: 'I. Definitions', items: [['Difference of longitude:', 'It is the number of degrees between two places.'], ['Date:', 'It is the day, the month and the year.']] },
    { title: 'II. The Rules', items: [['Rule 1:', '15° = 1 hour and 1° = 4 minutes.'], ['Rule 2:', 'East: add time. West: remove time.'], ['Rule 3:', 'After midnight, the date changes.'], ['Rule 4:', 'Crossing the Date Line changes the day.']] },
    { title: 'III. Worked Example', items: [['Question:', 'Garoua (13° E) 12:00. Time at 43° E?'], ['Difference:', '43° − 13° = 30°.'], ['Time:', '30° × 4 min = 120 min = 2 hours.'], ['Answer:', '12:00 + 2 h = 14:00.']] },
  ],
  evaluation: [['It is 10:00 at Garoua (13° E). What is the local time at 17° W?', '08:00 (30° = 2 hours, we remove).'], ['It is 22:00 on Friday in Garoua (GMT + 1). What time is it in Tokyo (GMT + 9)?', '06:00 on Saturday.']],
  remediation: ['1° of longitude = ______ minutes.', 'Going west, we ______ time.', 'When the time passes midnight, the ______ changes.'],
  remediationAnswers: '1. 4 2. remove 3. date',
});

L.push({
  src: 'FORM4_LESSON05_Rotation_of_the_Earth',
  situation: 'Every morning in Garoua, the first light appears in the east. In the evening, the Sun disappears in the west. Oumarou\'s little sister thinks that the Sun walks around the Earth.',
  sitQA: [['What is the problem in the situation?', 'The sister thinks that the Sun moves around the Earth every day.'],
    ['Where does the Sun rise and set?', 'It rises in the east and sets in the west.'],
    ['What really moves?', 'The Earth turns on itself.']],
  justification: 'This lesson helps us to understand day and night.',
  activities: [
    { sec: 'I. MEANING', img: 'rotation.gif', caption: 'Animation: the Earth turns on itself.', q: 'Watch Garoua (red dot). Why does it have day and then night?', a: 'The Earth turns. Garoua faces the Sun (day), then turns away (night).', noProj: 'turn a ball in front of a torch with a mark on it.' },
    { sec: 'II. EFFECTS', img: 'f4_sunrise.jpg', caption: 'The Sun low over the savanna.', q: 'Why does the Sun seem to rise in the east?', a: 'The Earth turns from west to east.', noProj: 'ask learners where the Sun rises in Garoua.' },
    { sec: 'II. EFFECTS', img: 'f4_hurricane.jpg', caption: 'A storm seen from space.', q: 'The winds of this storm turn in a circle. Which movement of the Earth makes them turn?', a: 'The rotation of the Earth.', noProj: 'describe water turning when it goes down a sink.' },
  ],
  summary: [
    { title: 'I. Definitions', items: [['Rotation:', 'It is the turning of the Earth on its axis.'], ['Axis:', 'It is the line from the North Pole to the South Pole.']] },
    { title: 'II. Meaning of Rotation', items: [['A. Direction:', 'The Earth turns from west to east.'], ['B. Time:', 'One turn takes 24 hours.'], ['C. Axis:', 'It is tilted at 23½°.']], draw: { img: 'rotation_mid.png', caption: 'Copy the drawing: day and night.' } },
    { title: 'III. Effects of Rotation', items: [['A. Day and night:', 'One side faces the Sun.'], ['B. Sunrise in the east:', 'The Earth turns to the east.'], ['C. Time difference:', 'Places to the east see the Sun first.'], ['D. Winds:', 'Winds and currents are bent.'], ['E. Tides:', 'There are two high tides a day.']] },
  ],
  evaluation: [['What is rotation?', 'The turning of the Earth on its axis.'], ['Give two effects of rotation.', 'Day and night; the Sun seems to rise in the east.']],
  remediation: ['The Earth turns on its ______.', 'One rotation takes ______ hours.', 'The Earth turns from west to ______.'],
  remediationAnswers: '1. axis 2. 24 3. east',
});

L.push({
  src: 'FORM4_LESSON06_Revolution_of_the_Earth',
  situation: 'In September, it is the rainy season in Garoua and the Benue is full. In December and January, the dry Harmattan season comes. Salamatou wonders what causes this change every year.',
  sitQA: [['What is the problem in the situation?', 'Salamatou does not know why the seasons change.'],
    ['Name the two seasons of Garoua.', 'The rainy season and the dry season.'],
    ['Which movement of the Earth causes the seasons?', 'The revolution of the Earth around the Sun.']],
  justification: 'This lesson helps us to understand the seasons and the year.',
  activities: [
    { sec: 'I. MEANING', img: 'revolution.gif', caption: 'Animation: the Earth moves around the Sun.', q: 'How long does the Earth take to go once around the Sun?', a: '365¼ days: one year.', noProj: 'walk around a chair (the Sun) with a ball (the Earth).' },
    { sec: 'II. EQUINOXES AND SOLSTICES', img: 'overhead_sun_big.png', caption: 'Where the Sun is overhead at midday during the year.', q: 'Where is the Sun overhead on 21 June? And on 22 December?', a: '21 June: Tropic of Cancer. 22 December: Tropic of Capricorn.', noProj: 'draw the Equator and the two tropics with the dates.' },
    { sec: 'III. EFFECTS', img: 'f4_rainyseason.jpg', caption: 'A farmer plants seeds when the rains begin.', q: 'In June, the Sun is overhead north of the Equator. What season does Garoua have?', a: 'The rainy season.', noProj: 'ask learners which months are rainy in Garoua.' },
  ],
  summary: [
    { title: 'I. Definitions', items: [['Revolution:', 'It is the movement of the Earth around the Sun.'], ['Equinox:', 'It is the day when day and night are equal everywhere.'], ['Solstice:', 'It is the day when the Sun is overhead at a tropic.'], ['Leap year:', 'It is a year of 366 days.']] },
    { title: 'II. Equinoxes and Solstices', items: [['A. 21 March, 23 Sept:', 'The Sun is overhead at the Equator.'], ['B. 21 June:', 'The Sun is overhead at the Tropic of Cancer.'], ['C. 22 December:', 'The Sun is overhead at the Tropic of Capricorn.']], draw: { img: 'overhead_sun_big.png', caption: 'Copy the drawing with the dates.' } },
    { title: 'III. Effects of Revolution', items: [['A. Seasons:', 'Rainy and dry seasons in Garoua.'], ['B. Length of day:', 'Days change length during the year.'], ['C. The year:', 'It has 365 days; a leap year has 366.']] },
  ],
  evaluation: [['How long does one revolution take?', '365¼ days.'], ['Where is the Sun overhead on 21 March?', 'At the Equator.']],
  remediation: ['The movement of the Earth around the Sun is ______.', 'On 21 June, the Sun is overhead at the Tropic of ______.', 'A year of 366 days is a ______ year.'],
  remediationAnswers: '1. revolution 2. Cancer 3. leap',
});

module.exports = L;
if (require.main === module) run(L, process.argv.slice(2).length ? process.argv.slice(2) : null);
