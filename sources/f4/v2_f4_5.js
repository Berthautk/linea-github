// FORM 4 — v2 light lessons (50 minutes, 3 activities): L30–L42
const { run } = require('./v2');
const L = [];

L.push({
  src: 'FORM4_LESSON30_The_Atmosphere',
  situation: 'Nafissatou flies from Garoua to Douala. The pilot says: "We are at 11,000 metres. The temperature outside is minus 50 degrees." She is surprised, because the plane is closer to the Sun.',
  sitQA: [['What is the problem in the situation?', 'Nafissatou does not understand why it is so cold high up.'],
    ['What is the temperature outside the plane?', 'Minus 50 °C.'],
    ['What happens to temperature as we go up?', 'It falls.']],
  justification: 'This lesson helps us to know the layer of air around the Earth.',
  activities: [
    { sec: 'I. DEFINITION', img: 'f4_planewindow.jpg', caption: 'The view from a plane above the clouds.', q: 'The plane flies in the air around the Earth. What is this layer of air called?', a: 'The atmosphere.', noProj: 'ask learners who has travelled by plane.' },
    { sec: 'II. STRUCTURE', img: 'atmosphere_big.png', caption: 'The four layers of the atmosphere.', q: 'In which layer do clouds, rain and wind form?', a: 'In the troposphere, the lowest layer.', noProj: 'draw four layers on the board.' },
    { sec: 'III. THE OZONE LAYER', img: 'f4_ozonehole.jpg', caption: 'A map of the ozone layer over Antarctica, made from satellite data.', q: 'The ozone layer protects us from the rays of the Sun. What damaged it?', a: 'Chemicals (CFCs) from old fridges and sprays.', noProj: 'explain: ozone is like a sun hat for the Earth.' },
  ],
  summary: [
    { title: 'I. Definitions', items: [['Atmosphere:', 'It is the layer of air around the Earth.'], ['Ozone layer:', 'It is a layer of gas that stops harmful sun rays.']] },
    { title: 'II. Composition', items: [['A. Nitrogen:', 'about 78%.'], ['B. Oxygen:', 'about 21%.'], ['C. Other gases:', 'carbon dioxide and water vapour.']] },
    { title: 'III. Structure', items: [['A. Troposphere:', '0–12 km; weather; it gets colder upwards.'], ['B. Stratosphere:', '12–50 km; the ozone layer.'], ['C. Mesosphere:', '50–85 km; very cold.'], ['D. Thermosphere:', 'above 85 km.']], draw: { img: 'atmosphere_big.png', caption: 'Copy the four layers.' } },
    { title: 'IV. Ozone Layer Depletion', items: [['A. Cause:', 'CFC gases from old fridges and sprays.'], ['B. Effects:', 'Skin cancer and eye disease.'], ['C. Solution:', 'CFCs are banned (Montreal, 1987).']] },
  ],
  evaluation: [['In which layer does the weather happen?', 'In the troposphere.'], ['What is the role of the ozone layer?', 'It stops harmful rays from the Sun.']],
  remediation: ['The layer of air around the Earth is the ______.', 'Clouds and rain form in the ______.', 'The ozone layer is in the ______.'],
  remediationAnswers: '1. atmosphere 2. troposphere 3. stratosphere',
});

L.push({
  src: 'FORM4_LESSON31_Weather_and_Climate',
  situation: 'On Monday morning, it rains in Garoua, so Idrissa takes an umbrella. His cousin in Paris says: "But Garoua has a hot climate. Why do you need an umbrella?"',
  sitQA: [['What is the problem in the situation?', 'The cousin mixes up weather and climate.'],
    ['What is the weather in Garoua on Monday?', 'Cloudy and rainy.'],
    ['What is the climate of Garoua?', 'Hot, with a wet and a dry season.']],
  justification: 'This lesson helps us to know the difference between weather and climate.',
  activities: [
    { sec: 'I. DEFINITIONS', img: 'f2t_storm.jpg', caption: 'A rainy afternoon.', q: 'The condition of the air today is rainy. Is this the weather or the climate?', a: 'The weather.', noProj: 'ask learners to describe the weather today.' },
    { sec: 'II. THE WEATHER STATION', img: 'f4_stevenson.jpg', caption: 'A weather station.', q: 'What do people do in this place?', a: 'They measure the weather every day.', noProj: 'mention the weather station at Garoua airport.' },
    { sec: 'III. INSTRUMENTS', img: 'f4_anemometer.jpg', caption: 'Instruments that measure the wind.', q: 'Which instrument measures wind speed? Which one shows wind direction?', a: 'The anemometer (speed); the wind vane (direction).', noProj: 'make a paper wind vane.' },
  ],
  summary: [
    { title: 'I. Definitions', items: [['Weather:', 'It is the condition of the air at a place today.'], ['Climate:', 'It is the average weather of a place over about 30 years.'], ['Weather station:', 'It is a place where the weather is measured.'], ['Isoline:', 'It is a line joining places with the same value.']] },
    { title: 'II. Instruments', items: [['A. Thermometer:', 'temperature (°C).'], ['B. Rain gauge:', 'rainfall (mm).'], ['C. Wind vane and anemometer:', 'wind.'], ['D. Barometer:', 'air pressure.']], draw: { img: 'instruments_big.png', caption: 'Copy the table of instruments.' } },
  ],
  evaluation: [['What is the difference between weather and climate?', 'Weather is today; climate is the average over about 30 years.'], ['Which instrument measures rainfall?', 'The rain gauge.']],
  remediation: ['The condition of the air today is the ______.', 'The average weather over 30 years is the ______.', 'Wind speed is measured with an ______.'],
  remediationAnswers: '1. weather 2. climate 3. anemometer',
});

L.push({
  src: 'FORM4_LESSON32_Atmospheric_Temperatures',
  situation: 'Ali puts his thermometer in the sun on the concrete and reads 45 °C. Bouba hangs his in the shade of a tree and reads 36 °C. They wonder which reading is correct.',
  sitQA: [['What is the problem in the situation?', 'The two readings are different.'],
    ['Which reading is correct?', 'Bouba\'s, in the shade.'],
    ['Where should a thermometer be placed?', 'In the shade, in a Stevenson screen.']],
  justification: 'This lesson helps us to measure the temperature of the air correctly.',
  activities: [
    { sec: 'I. MEASUREMENT', img: 'f4_maxmin.jpg', caption: 'A thermometer that shows the highest and the lowest temperature.', q: 'What does this thermometer record?', a: 'The maximum and the minimum temperature of the day.', noProj: 'draw a U-shaped thermometer.' },
    { sec: 'II. CALCULATIONS', img: 'temp_mean_big.png', caption: 'A worked example.', q: 'Maximum 38 °C, minimum 24 °C. Find the mean and the range.', a: 'Mean: 31 °C. Range: 14 °C.', noProj: 'write the example on the board.' },
    { sec: 'III. THE STEVENSON SCREEN', img: 'f4_stevenson.jpg', caption: 'A Stevenson screen.', q: 'Why is this box white with openings on the sides?', a: 'White reflects the sun; the openings let the air pass.', noProj: 'describe a white wooden box on legs.' },
  ],
  summary: [
    { title: 'I. Definitions', items: [['Temperature:', 'It is how hot or cold the air is.'], ['Mean daily temperature:', 'It is (maximum + minimum) ÷ 2.'], ['Daily range:', 'It is maximum − minimum.']] },
    { title: 'II. Measurement', items: [['A. Thermometer:', 'It gives the temperature now.'], ['B. Six\'s thermometer:', 'It gives the maximum and minimum.'], ['C. Example:', 'Mean 31 °C, range 14 °C.']] },
    { title: 'III. The Stevenson Screen', items: [['A. White:', 'It reflects the sunlight.'], ['B. Open sides:', 'The air moves freely.'], ['C. Siting:', 'On grass, in the open, about 1.2 m high.']] },
  ],
  evaluation: [['Maximum 34 °C, minimum 20 °C. What is the mean?', '27 °C.'], ['Why is the Stevenson screen painted white?', 'To reflect the sunlight.']],
  remediation: ['The highest and lowest temperatures are recorded by the ______ thermometer.', 'Mean = (maximum + minimum) ÷ ______.', 'Thermometers are kept in a ______ screen.'],
  remediationAnswers: '1. Six\'s 2. 2 3. Stevenson',
});

L.push({
  src: 'FORM4_LESSON33_Other_Weather_Elements',
  situation: 'In August, Hadja\'s washing takes a whole day to dry and the air feels heavy. In January, during the Harmattan, the same clothes dry in less than one hour.',
  sitQA: [['What is the problem in the situation?', 'Hadja does not know why clothes dry slowly in August.'],
    ['When do clothes dry fast?', 'In January, during the Harmattan.'],
    ['Why?', 'The air is dry: there is little water vapour.']],
  justification: 'This lesson helps us to know humidity, wind, pressure and sunshine.',
  activities: [
    { sec: 'I. HUMIDITY', img: 'f4_laundry.jpg', caption: 'Clothes drying on a line.', q: 'Why do clothes dry slowly when the air is wet?', a: 'The air already has a lot of water vapour (high humidity).', noProj: 'use the situation of Hadja.' },
    { sec: 'II. WIND', img: 'f4_windsock.jpg', caption: 'A windsock at an airport.', q: 'What does the windsock show? Why is it useful for pilots?', a: 'The direction and the force of the wind. Planes take off against the wind.', noProj: 'hold a piece of cloth in the wind.' },
    { sec: 'III. PRESSURE', img: 'f4_barometer.jpg', caption: 'A barometer.', q: 'What does a barometer measure? What if it falls quickly?', a: 'Air pressure. A quick fall means rain or a storm.', noProj: 'explain that air has weight.' },
  ],
  summary: [
    { title: 'I. Definitions', items: [['Humidity:', 'It is the amount of water vapour in the air.'], ['Wind:', 'It is air that moves.'], ['Air pressure:', 'It is the weight of the air.']] },
    { title: 'II. Humidity', items: [['A. Instrument:', 'The hygrometer (wet and dry bulbs).'], ['B. Unit:', 'Percent (%).'], ['C. Garoua:', 'High in August, low in January.']] },
    { title: 'III. Wind, Pressure and Sunshine', items: [['A. Wind direction:', 'Wind vane; named from where it comes.'], ['B. Wind speed:', 'Anemometer.'], ['C. Pressure:', 'Barometer (millibars).'], ['D. Sunshine:', 'Sunshine recorder (hours).']] },
  ],
  evaluation: [['What is humidity?', 'The amount of water vapour in the air.'], ['The Harmattan blows from the north-east. What is its name as a wind direction?', 'A north-easterly wind.']],
  remediation: ['Humidity is measured with a ______.', 'Air pressure is measured with a ______.', 'A wind is named after the direction it comes ______.'],
  remediationAnswers: '1. hygrometer 2. barometer 3. from',
});

L.push({
  src: 'FORM4_LESSON34_Condensation',
  situation: 'On a hot afternoon, Yaya takes a cold bottle out of the refrigerator. After a few minutes, drops of water cover the outside of the bottle. The bottle is closed.',
  sitQA: [['What is the problem in the situation?', 'Yaya does not know where the drops come from.'],
    ['Where is the water from?', 'From the water vapour in the air.'],
    ['What changed it into drops?', 'The cold bottle cooled the air.']],
  justification: 'This lesson helps us to understand how clouds, fog and dew form.',
  activities: [
    { sec: 'I. MEANING', img: 'f4_coldbottle.jpg', caption: 'Drops of water on a cold bottle.', q: 'What do we call the change of water vapour into drops of water?', a: 'Condensation.', noProj: 'bring a cold bottle to class.' },
    { sec: 'II. FORMS', img: 'f4_fog.jpg', caption: 'Fog in the valleys in the morning.', q: 'What is fog?', a: 'A cloud at ground level.', noProj: 'describe a foggy morning on the Adamawa plateau.' },
    { sec: 'II. FORMS', img: 'f4_cumulonimbus.jpg', caption: 'A very tall storm cloud.', q: 'This cloud brings heavy rain and thunder. What is it called?', a: 'A cumulonimbus cloud.', noProj: 'draw a very tall cloud with a flat top.' },
  ],
  summary: [
    { title: 'I. Definitions', items: [['Condensation:', 'It is the change of water vapour into water.'], ['Dew point:', 'It is the temperature at which condensation starts.'], ['Fog:', 'It is a cloud at ground level.']] },
    { title: 'II. Conditions', items: [['A. Moist air:', 'The air has water vapour.'], ['B. Cooling:', 'The air cools to the dew point.'], ['C. Small particles:', 'Dust helps drops to form.']] },
    { title: 'III. Forms of Condensation', items: [['A. Dew:', 'Drops on grass in the morning.'], ['B. Fog and mist:', 'Clouds at ground level.'], ['C. Clouds:', 'Cumulus, stratus, cirrus, cumulonimbus.'], ['D. Frost:', 'Ice when it is very cold.']] },
  ],
  evaluation: [['What is condensation?', 'The change of water vapour into water.'], ['Which cloud brings thunderstorms?', 'The cumulonimbus.']],
  remediation: ['Water vapour becoming water is ______.', 'Drops on grass in the morning are ______.', 'A cloud at ground level is ______.'],
  remediationAnswers: '1. condensation 2. dew 3. fog',
});

L.push({
  src: 'FORM4_LESSON35_Precipitation',
  situation: 'In September, Garoua has short, heavy afternoon storms. Emmanuel\'s cousin in Buea, on Mount Cameroon, says that it rains there for many days without stopping.',
  sitQA: [['What is the problem in the situation?', 'Emmanuel does not know why the rain is different in the two towns.'],
    ['How does it rain in Garoua?', 'Short, heavy storms in the afternoon.'],
    ['Why does it rain so much in Buea?', 'The mountain forces wet air to rise.']],
  justification: 'This lesson helps us to know how rain forms and how it is measured.',
  activities: [
    { sec: 'I. DEFINITION', img: 'f4_heavyrain.jpg', caption: 'Heavy rain.', q: 'Rain, hail and snow fall from clouds. What is their general name?', a: 'Precipitation.', noProj: 'ask learners to name what can fall from clouds.' },
    { sec: 'II. MEASUREMENT', img: 'f4_raingauge.jpg', caption: 'A rain gauge.', q: 'What does this instrument measure? In which unit?', a: 'Rainfall, in millimetres (mm).', noProj: 'make a rain gauge with a bottle and a funnel.' },
    { sec: 'III. TYPES OF RAINFALL', img: 'convection.gif', caption: 'Animation: the storms of Garoua.', q: 'The hot ground heats the air, which rises and makes storms. What type of rain is this?', a: 'Convectional rain.', noProj: 'draw the ground, rising air and a cloud.' },
  ],
  summary: [
    { title: 'I. Definitions', items: [['Precipitation:', 'It is water that falls from clouds.'], ['Rain gauge:', 'It is the instrument that measures rain.']] },
    { title: 'II. Forms', items: [['A. Rain:', 'Drops of water.'], ['B. Drizzle:', 'Very small drops.'], ['C. Hail:', 'Balls of ice.'], ['D. Snow:', 'Ice crystals.']] },
    { title: 'III. Types of Rainfall', items: [['A. Convectional:', 'Hot ground, rising air (Garoua).'], ['B. Relief:', 'A mountain lifts the air (Buea).'], ['C. Frontal:', 'Warm air rises over cold air (Europe).']], draw: { img: 'rainfall_types_big.png', caption: 'Copy the three types of rainfall.' } },
  ],
  evaluation: [['Which instrument measures rainfall?', 'The rain gauge.'], ['Why does Buea receive a lot of rain?', 'Mount Cameroon forces wet air to rise (relief rain).']],
  remediation: ['Water falling from clouds is ______.', 'Balls of ice falling from clouds are ______.', 'Rain caused by a mountain is ______ rain.'],
  remediationAnswers: '1. precipitation 2. hail 3. relief',
});

L.push({
  src: 'FORM4_LESSON36_Pressure_Belts_Planetary_Winds',
  situation: 'From June to September, the wind in Garoua comes from the south-west and brings rain. From December to February, the dry Harmattan comes from the north-east.',
  sitQA: [['What is the problem in the situation?', 'We want to know why the wind changes with the seasons.'],
    ['Which wind brings rain?', 'The south-west wind.'],
    ['Which wind is dry?', 'The Harmattan, from the north-east.']],
  justification: 'This lesson helps us to understand the big winds of the Earth.',
  activities: [
    { sec: 'I. PRESSURE BELTS', img: 'pressure_belts_big.png', caption: 'Pressure belts of the Northern Hemisphere.', q: 'Is the pressure high or low at the Equator? Why?', a: 'Low. Hot air rises there.', noProj: 'draw the belts on a circle.' },
    { sec: 'II. PLANETARY WINDS', img: 'f2t_harmattan.jpg', caption: 'The sky during the Harmattan.', q: 'The Harmattan blows from the Sahara towards the Equator. Which planetary wind is it?', a: 'The north-east Trade Wind.', noProj: 'use the example of December in Garoua.' },
    { sec: 'III. SEASONS IN GAROUA', img: 'itcz.gif', caption: 'Animation: the rain belt moves north in July and south in January.', q: 'Why does Garoua have rain in July and not in January?', a: 'In July, the rain belt and the wet south-west wind reach Garoua.', noProj: 'move a paper strip up and down a map of Africa.' },
  ],
  summary: [
    { title: 'I. Definitions', items: [['Pressure belt:', 'It is a zone of high or low pressure around the Earth.'], ['Planetary wind:', 'It is a big wind that blows between pressure belts.'], ['Doldrums:', 'They are calm winds at the Equator.']] },
    { title: 'II. Pressure Belts', items: [['A. Equatorial Low:', 'Hot air rises; rain.'], ['B. Sub-tropical Highs:', 'Air sinks; deserts.'], ['C. Temperate Lows:', 'At about 60°.'], ['D. Polar Highs:', 'Cold air sinks.']], draw: { img: 'pressure_belts_big.png', caption: 'Copy the belts and the Trade Wind.' } },
    { title: 'III. Planetary Winds', items: [['A. Trade Winds:', 'From 30° to the Equator.'], ['B. Westerlies:', 'From 30° to 60°.'], ['C. Polar winds:', 'From the poles.'], ['D. Garoua:', 'SW wind in July, Harmattan in January.']] },
  ],
  evaluation: [['Where is the Equatorial Low?', 'At the Equator (0°).'], ['Which wind brings rain to Garoua?', 'The south-west wind (monsoon) in the wet season.']],
  remediation: ['At the Equator, the pressure is ______.', 'The winds that blow to the Equator are the ______ Winds.', 'The dry wind of January in Garoua is the ______.'],
  remediationAnswers: '1. low 2. Trade 3. Harmattan',
});

L.push({
  src: 'FORM4_LESSON37_Local_Winds',
  situation: 'In Kribi, fishermen leave the beach very early, before sunrise, and come back in the afternoon. They say the wind pushes their canoes to the sea in the morning and back to land later.',
  sitQA: [['What is the problem in the situation?', 'We want to know why the wind changes direction during the day.'],
    ['When do the fishermen leave?', 'Early in the morning.'],
    ['Which wind brings them back?', 'The sea breeze in the afternoon.']],
  justification: 'This lesson helps us to know winds that blow over small areas.',
  activities: [
    { sec: 'I. LAND AND SEA BREEZES', img: 'seabreeze.gif', caption: 'Animation: the wind by day and by night.', q: 'By day, does the wind blow from the sea or from the land? And at night?', a: 'Day: from the sea (sea breeze). Night: from the land (land breeze).', noProj: 'draw the sea and the land with arrows.' },
    { sec: 'I. LAND AND SEA BREEZES', img: 'f2t_fishing.jpg', caption: 'Fishermen in canoes.', q: 'Why do fishermen leave early in the morning?', a: 'The land breeze pushes the canoes to the sea.', noProj: 'use the situation of Kribi.' },
    { sec: 'II. MOUNTAIN AND VALLEY BREEZES', img: 'mountain_valley_big.png', caption: 'Winds in a valley by day and by night.', q: 'Which wind blows up the slopes by day?', a: 'The valley breeze.', noProj: 'mention the Mandara Mountains near Mokolo.' },
  ],
  summary: [
    { title: 'I. Definitions', items: [['Local wind:', 'It is a wind that blows over a small area.'], ['Sea breeze:', 'It is a wind from the sea by day.'], ['Land breeze:', 'It is a wind from the land at night.']] },
    { title: 'II. Types of Local Winds', items: [['A. Sea breeze:', 'By day, the land is hotter.'], ['B. Land breeze:', 'At night, the sea is warmer.'], ['C. Valley breeze:', 'Up the slopes by day.'], ['D. Mountain breeze:', 'Down the slopes at night.']], draw: { img: 'seabreeze_day.png', caption: 'Copy the sea breeze.' } },
  ],
  evaluation: [['Why does the sea breeze blow by day?', 'The land heats faster than the sea.'], ['Which wind blows down the slopes at night?', 'The mountain breeze.']],
  remediation: ['By day, the ______ breeze blows from the sea.', 'At night, the ______ breeze blows from the land.', 'The wind that blows up the slopes by day is the ______ breeze.'],
  remediationAnswers: '1. sea 2. land 3. valley',
});

L.push({
  src: 'FORM4_LESSON38_Factors_of_Temperature',
  situation: 'Oumar travels from Garoua to Ngaoundéré. In Garoua, it is 35 °C. In Ngaoundéré, in the evening, he needs a sweater. The two towns are not far apart.',
  sitQA: [['What is the problem in the situation?', 'Oumar does not know why Ngaoundéré is cooler.'],
    ['What is the difference between the two towns?', 'Ngaoundéré is high (1,212 m); Garoua is low.'],
    ['What happens to temperature with height?', 'It falls.']],
  justification: 'This lesson helps us to know why temperatures change from place to place.',
  activities: [
    { sec: 'I. LATITUDE', img: 'sun_rays_big.png', caption: 'Sun rays at the Equator and near the poles.', q: 'Why is it hotter near the Equator?', a: 'The sun rays are direct there.', noProj: 'shine a torch straight and then at an angle on the table.' },
    { sec: 'II. ALTITUDE', img: 'f2t_kilimanjaro.jpg', caption: 'Mount Kilimanjaro, near the Equator, has snow on top.', q: 'Why is there snow on a mountain near the Equator?', a: 'It is very high. Temperature falls with height.', noProj: 'compare Garoua and Ngaoundéré.' },
    { sec: 'III. OTHER FACTORS', img: 'f2t_cattle_field.jpg', caption: 'People and animals near a big shady tree.', q: 'Why is it cooler under trees?', a: 'The leaves stop the sun rays.', noProj: 'ask learners where they rest at midday.' },
  ],
  summary: [
    { title: 'I. Definitions', items: [['Latitude:', 'It is the distance from the Equator.'], ['Altitude:', 'It is the height above the sea.']] },
    { title: 'II. Latitude and Altitude', items: [['A. Latitude:', 'Direct rays at the Equator: hot.'], ['B. Altitude:', 'About 6.5 °C less every 1,000 m.']], draw: { img: 'sun_rays_big.png', caption: 'Copy the sun rays.' } },
    { title: 'III. Other Factors', items: [['A. Clouds:', 'Cooler days, warmer nights.'], ['B. Winds:', 'The Harmattan is dry and cool at night.'], ['C. Distance from the sea:', 'Douala has a small range.'], ['D. Plants and towns:', 'Trees cool; towns are hotter.']] },
  ],
  evaluation: [['Why is Ngaoundéré cooler than Garoua?', 'It is higher (altitude).'], ['Why is Douala\'s temperature range small?', 'It is near the sea.']],
  remediation: ['Temperature falls when ______ increases.', 'At the Equator, the sun rays are ______.', 'Places near the sea have a ______ temperature range.'],
  remediationAnswers: '1. altitude 2. direct 3. small',
});

L.push({
  src: 'FORM4_LESSON39_Hydrological_Cycle',
  situation: 'In March, the Benue at Garoua is shallow with many sandbanks. In September, after months of rain, the river is wide and full. Mohamadou wonders where the water goes and comes from.',
  sitQA: [['What is the problem in the situation?', 'Mohamadou does not know where the water of the Benue comes from.'],
    ['When is the river full?', 'In September.'],
    ['Where does the water come from?', 'From the rain.']],
  justification: 'This lesson helps us to understand the journey of water.',
  activities: [
    { sec: 'I. THE WATER CYCLE', img: 'water_cycle.gif', caption: 'Animation: the journey of water.', q: 'Name the four steps of the water cycle.', a: 'Evaporation, condensation, precipitation, runoff.', noProj: 'draw the sea, a cloud, rain and a river on the board.' },
    { sec: 'I. THE WATER CYCLE', img: 'f4_muddyriver.jpg', caption: 'A big river seen from space.', q: 'How does rain water reach the river?', a: 'It runs on the ground (runoff) or flows under the ground.', noProj: 'describe the Benue in September.' },
    { sec: 'II. AN OPEN SYSTEM', img: 'open_system_big.png', caption: 'The drainage basin as a system.', q: 'What is the input? Name two outputs.', a: 'Input: rain. Outputs: evaporation and river flow to the sea.', noProj: 'draw three boxes with arrows.' },
  ],
  summary: [
    { title: 'I. Definitions', items: [['Hydrological cycle:', 'It is the journey of water from the sea to the air, the land and back.'], ['Evaporation:', 'It is water changing into vapour.'], ['Runoff:', 'It is water flowing on the ground.']] },
    { title: 'II. Components', items: [['A. Evaporation:', 'The sun heats the sea.'], ['B. Condensation:', 'Vapour forms clouds.'], ['C. Precipitation:', 'Rain falls.'], ['D. Runoff:', 'Rivers go back to the sea.']], draw: { img: 'water_cycle_last.png', caption: 'Copy the water cycle.' } },
    { title: 'III. An Open System', items: [['A. Input:', 'Rain.'], ['B. Stores:', 'Soil, lakes, rivers, plants.'], ['C. Outputs:', 'Evaporation and river flow.']] },
  ],
  evaluation: [['What is evaporation?', 'Water changing into vapour.'], ['Why is a drainage basin an open system?', 'Water enters (rain) and leaves (evaporation, rivers).']],
  remediation: ['Water changing into vapour is ______.', 'Water flowing on the ground is ______.', 'Rain falling from clouds is ______.'],
  remediationAnswers: '1. evaporation 2. runoff 3. precipitation',
});

L.push({
  src: 'FORM4_LESSON40_Global_Warming',
  situation: 'Baba Hamadou, 70 years old, says that when he was young, the rains in Garoua started every year in May and March was less hot. Today, the heat is stronger and the rains are irregular.',
  sitQA: [['What is the problem in the situation?', 'The climate of Garoua is changing.'],
    ['What changes does Baba Hamadou see?', 'More heat and irregular rains.'],
    ['What is this change of the whole Earth called?', 'Global warming.']],
  justification: 'This lesson helps us to understand global warming and what we can do.',
  activities: [
    { sec: 'I. DEFINITION', img: 'greenhouse_big.png', caption: 'The greenhouse effect.', q: 'How do greenhouse gases warm the Earth?', a: 'They trap the heat, like a blanket.', noProj: 'compare with a closed car in the sun.' },
    { sec: 'II. CAUSES', img: 'f4_exhaust.jpg', caption: 'Smoke from a factory.', q: 'Which gas comes out when we burn coal, petrol and diesel?', a: 'Carbon dioxide (CO₂).', noProj: 'ask learners about the smoke of motorbikes and generators.' },
    { sec: 'III. SOLUTIONS', img: 'f4_solar.jpg', caption: 'A solar power station.', q: 'How do solar panels help against global warming?', a: 'They make electricity without smoke.', noProj: 'ask learners who uses a solar lamp.' },
  ],
  summary: [
    { title: 'I. Definitions', items: [['Global warming:', 'It is the rise of the temperature of the Earth.'], ['Greenhouse gases:', 'They are gases that trap heat, like CO₂.'], ['Mitigation:', 'It is reducing the causes.'], ['Adaptation:', 'It is living with the changes.']] },
    { title: 'II. Causes', items: [['A. Burning fuel:', 'Petrol, diesel and coal give CO₂.'], ['B. Deforestation:', 'Fewer trees take in CO₂.'], ['C. Natural causes:', 'Changes of the Sun and volcanoes.']], draw: { img: 'greenhouse_big.png', caption: 'Copy the greenhouse effect.' } },
    { title: 'III. Effects', items: [['A. Weather:', 'More heat, droughts and floods.'], ['B. Sea level:', 'Douala and Limbe are threatened.'], ['C. Farming:', 'Harvests are poorer.']] },
    { title: 'IV. Solutions', items: [['A. Mitigation:', 'Solar energy and tree planting.'], ['B. Adaptation:', 'Seeds that resist drought.']] },
  ],
  evaluation: [['Give one human cause of global warming.', 'Burning petrol and diesel (or deforestation).'], ['What is the difference between mitigation and adaptation?', 'Mitigation reduces the causes; adaptation lives with the changes.']],
  remediation: ['The rise of the temperature of the Earth is global ______.', 'The main greenhouse gas is ______.', 'Planting trees is a form of ______.'],
  remediationAnswers: '1. warming 2. carbon dioxide (CO₂) 3. mitigation',
});

L.push({
  src: 'FORM4_LESSON41_Floods_Droughts_Desertification',
  situation: 'In September 2012, floods destroyed villages along the Benue near Garoua. Six months later, in the Far North, the rains stopped early and the crops dried up.',
  sitQA: [['What is the problem in the situation?', 'The North suffers from both floods and droughts.'],
    ['What happened in 2012?', 'Floods along the Benue.'],
    ['What happened in the Far North?', 'A drought: the rains stopped early.']],
  justification: 'This lesson helps us to know floods, droughts and desertification.',
  activities: [
    { sec: 'I. FLOODS', img: 'f4_floodvillage.jpg', caption: 'A flooded street.', q: 'Give two causes of floods along the Benue.', a: 'Heavy rain and water released from the Lagdo Dam.', noProj: 'describe the flood of 2012.' },
    { sec: 'II. DROUGHT', img: 'f2t_drought.jpg', caption: 'Dry, cracked soil in a drought.', q: 'What is the difference between a drought and desertification?', a: 'A drought is a period without rain; desertification is the spread of the desert.', noProj: 'describe a year when the rains stopped early.' },
    { sec: 'III. SOLUTIONS', img: 'f4_zai.jpg', caption: 'Farmers dig small pits (zaï) to keep water for plants.', q: 'How do these pits help farmers in dry areas?', a: 'They keep water and manure near the plants.', noProj: 'describe the zaï pits of the Sahel.' },
  ],
  summary: [
    { title: 'I. Definitions', items: [['Flood:', 'It is when water covers dry land.'], ['Drought:', 'It is a long period without enough rain.'], ['Desertification:', 'It is the spread of the desert.']] },
    { title: 'II. Causes', items: [['A. Floods:', 'Heavy rain and dam releases.'], ['B. Drought:', 'Low and irregular rain.'], ['C. Desertification:', 'Overgrazing, cutting trees, bush fires.']] },
    { title: 'III. Effects', items: [['A. Floods:', 'Houses and crops destroyed.'], ['B. Drought:', 'Hunger and loss of animals.'], ['C. Desertification:', 'The land becomes poor.']] },
    { title: 'IV. Solutions', items: [['A. Floods:', 'Dykes, drains and warnings.'], ['B. Drought:', 'Irrigation and good seeds.'], ['C. Desertification:', 'Tree planting (Sahel Vert).']] },
  ],
  evaluation: [['What is desertification?', 'The spread of the desert.'], ['Give one way to fight desertification.', 'Plant trees (or stop overgrazing).']],
  remediation: ['A long period without enough rain is a ______.', 'The spread of the desert is ______.', 'In 2012, water from the ______ Dam flooded villages.'],
  remediationAnswers: '1. drought 2. desertification 3. Lagdo',
});

L.push({
  src: 'FORM4_LESSON42_Water_Scarcity',
  situation: 'Every year in March, the taps in Aminatou\'s neighbourhood run dry for several days. Women and children queue for hours at the borehole, and water sellers raise their prices.',
  sitQA: [['What is the problem in the situation?', 'There is not enough water in March.'],
    ['What do the people do?', 'They queue at the borehole or buy water.'],
    ['What can families do?', 'Store rain water and save water.']],
  justification: 'This lesson helps us to understand water scarcity and how to save water.',
  activities: [
    { sec: 'I. MEANING', img: 'f4_borehole.jpg', caption: 'Children fetch water at a hand pump.', q: 'There is not enough clean water for everyone. What is this situation called?', a: 'Water scarcity.', noProj: 'use the situation of Aminatou.' },
    { sec: 'II. CAUSES', img: 'f4_leakingtap.jpg', caption: 'A tap that leaks.', q: 'Give one human cause of water scarcity.', a: 'Wasting water (leaks) or too many people.', noProj: 'ask learners where water is wasted at school.' },
    { sec: 'III. CONSERVATION', img: 'rainwater_big.png', caption: 'Collecting rain water.', q: 'How can a family keep water for the dry season?', a: 'Collect rain water from the roof in a tank.', noProj: 'draw a house, a pipe and a tank.' },
  ],
  summary: [
    { title: 'I. Definitions', items: [['Water scarcity:', 'It is when there is not enough clean water.'], ['Water conservation:', 'It is using water carefully.']] },
    { title: 'II. Causes', items: [['A. Nature:', 'Long dry season and droughts.'], ['B. People:', 'More people, waste and pollution.'], ['C. Poor networks:', 'Old pipes and few boreholes.']] },
    { title: 'III. Effects', items: [['A. Time:', 'Long walks and queues.'], ['B. Health:', 'Cholera and diarrhoea.'], ['C. Money:', 'Water is expensive.'], ['D. School:', 'Children miss classes.']] },
    { title: 'IV. Water Conservation', items: [['A. At home:', 'Repair leaks and close taps.'], ['B. Rain water:', 'Store it in tanks.'], ['C. Farming:', 'Drip irrigation.'], ['D. Big works:', 'Dams and boreholes.']], draw: { img: 'rainwater_big.png', caption: 'Copy rain water harvesting.' } },
  ],
  evaluation: [['Give two effects of water scarcity.', 'Long queues and diseases like cholera.'], ['Give two ways of saving water at home.', 'Repair leaks and close taps.']],
  remediation: ['Not enough clean water is water ______.', 'Using water carefully is water ______.', 'Rain water can be stored in a ______.'],
  remediationAnswers: '1. scarcity 2. conservation 3. tank',
});

module.exports = L;
if (require.main === module) run(L, process.argv.slice(2).length ? process.argv.slice(2) : null);
