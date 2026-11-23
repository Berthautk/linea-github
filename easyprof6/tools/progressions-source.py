# Fiches de progression nationales 2026/2027 (Geography, sous-système anglophone), Forms 1-5.
# (genre, n°, titre, semaine début, semaine fin) ; semaine = 'T1W2' (trimestre 1, semaine 2 de la fiche).
F = {}
F['form 1'] = [('M',0,'MODULE 1: THE EARTH IN THE UNIVERSE','',''),
('L',1,'Geography: definition, branches and sub-branches, methods and importance','T1W2','T1W2'),
('L',2,'Our planet the Earth (solar system; shape & dimensions; locational references; landmasses and water bodies; great circles)','T1W2','T1W7'),
('PW',1,'Representation of the earth’s shape and size (marginal information on maps)','T1W4','T1W4'),
('PW',2,'Locate a place on a map (geographical coordinates)','T1W7','T1W7'),
('L',3,'The earth: a planet moving in space (rotation, revolution, local & standard time)','T1W8','T1W9'),
('PW',3,'Calculation of local time (from GMT; time zones)','T1W9','T1W9'),
('M',0,'MODULE 2: PRESERVATION OF THE ENVIRONMENT','',''),
('L',4,'The notion of the environment (definition, components, ecosystem)','T1W10','T1W10'),
('L',5,'Natural regions of Cameroon (equatorial, tropical)','T2W1','T2W2'),
('PW',4,'Construction of a climograph','T2W3','T2W3'),
('L',6,'Forms of degradation of natural regions in Cameroon','T2W4','T2W4'),
('GW',1,'Degradation of the natural region of the locality of the school','T2W7','T2W7'),
('PW',5,'Solid waste management (collect & sort waste)','T2W8','T2W8'),
('M',0,'MODULE 3: PROTECTION FROM THE WRATH OF NATURE','',''),
('L',7,'The atmosphere (definition, composition, structure)','T2W9','T2W9'),
('L',8,'Atmospheric circulation (pressure, winds & pressure belts)','T2W10','T2W10'),
('L',9,'Atmospheric disturbances','T3W1','T3W1'),
('FS',1,'The atmospheric disturbances in Cameroon','T3W2','T3W2'),
('PW',6,'Mechanisms or processes of rain formation','T3W2','T3W2'),
('L',10,'Climate change and consequences','T3W4','T3W4'),
('L',11,'The internal structure of the earth (crust, mantle, core)','T3W5','T3W5'),
('L',12,'Plate movements (types of plates, types of movements)','T3W6','T3W6'),
('L',13,'Consequences of the instability of the earth’s crust: earthquakes, volcanism','T3W7','T3W7'),
('FS',2,'What to do in case of an earthquake or volcanic eruption','T3W8','T3W8')]
F['form 2'] = [('M',0,'MODULE 1: MAN IN HIS ENVIRONMENT','',''),
('L',1,'Rapid growth of the world’s population','T1W2','T1W3'),
('PW',1,'Calculation of the demographic indices (BR, DR & NI)','T1W3','T1W4'),
('L',2,'Uneven distribution of world population','T1W4','T1W7'),
('PW',2,'Population densities in Cameroon','T1W8','T1W8'),
('L',3,'Man in the equatorial zone','T1W9','T1W10'),
('FS',1,'Deforestation in Cameroon','T1W11','T2W1'),
('L',4,'Man in the tropical zone','T2W1','T2W2'),
('FS',2,'Firewood crisis','T2W3','T2W3'),
('FS',3,'Products gathered from the wild in Cameroon (njangsa, eru, bush mango…)','T2W4','T2W4'),
('PW',3,'Identification of the biological resources in Cameroon','T2W7','T2W7'),
('L',5,'Man in the hot desert milieu','T2W8','T2W8'),
('FS',4,'Water scarcity','T2W9','T2W9'),
('M',0,'MODULE 2: SPACE OCCUPATION','',''),
('L',6,'Countrysides in Africa','T2W10','T3W1'),
('L',7,'Towns in Africa','T3W1','T3W2'),
('FS',5,'Informal sector activities in Africa','T3W2','T3W2'),
('PW',4,'Location of regional and divisional headquarters','T3W4','T3W4'),
('FS',6,'Urban problems in Cameroon','T3W5','T3W5'),
('L',8,'Relationship between towns and countryside','T3W6','T3W7'),
('FS',7,'Rural exodus in Cameroon','T3W8','T3W8')]
f3=[('M',0,'MODULE 1: ASTRONOMICAL RELATIONS OF THE EARTH IN THE UNIVERSE','',''),
('L',1,'Our planet: the Earth (size, shape & proofs)','T1W1','T1W1'),
('FS',1,'The universe and its influence on the earth and its people','T1W2','T1W2'),
('L',2,'Earth divisions (latitudes & longitudes)','T1W2','T1W2'),
('PW',1,'Locate a place on a map (geographical coordinates)','T1W3','T1W4'),
('L',3,'Great circles & the International Date Line','T1W4','T1W4'),
('L',4,'Local time, standard time, time zones','T1W4','T1W4'),
('PW',2,'Calculation of time and date','T1W6','T1W6'),
('L',5,'Rotation of the earth and effects','T1W6','T1W6'),
('L',6,'Revolution of the earth and effects','T1W7','T1W7'),
('M',0,'MODULE 2: PROCESSES OPERATING IN NATURE & PROTECTION FROM ENVIRONMENTAL HAZARDS','','')]
for n,t,w in [(7,'The internal structure of the earth','T1W8'),(8,'Rocks (definition, classification, rock cycle)','T1W8'),(9,'Theories of the earth’s structure (continental drift)','T1W9'),(10,'Plate tectonics','T1W9'),(11,'Volcanicity','T1W10'),(12,'Impact of volcanicity on man','T1W11'),(13,'Earthquakes','T2W1'),(14,'Denudation','T2W2'),(15,'Weathering (definition, types, factors)','T2W2'),(16,'Physical weathering processes & products','T2W3'),(17,'Chemical weathering processes','T2W4')]: f3.append(('L',n,t,w,w))
f3.append(('FS',2,'Impacts of weathering on the environment','T2W4','T2W4'))
for n,t,w in [(18,'Action of rivers: the long profile of a river','T2W6'),(19,'The upper course: erosional processes & features','T2W7'),(20,'The middle course','T2W7'),(21,'The lower course','T2W8'),(22,'Man and flood plain interactions','T2W8'),(23,'Wave action in coastal areas','T2W9'),(24,'Main erosional features of wave action','T2W9'),(25,'Main depositional features of wave action','T2W10'),(26,'Impacts of wave action on human development along the coast','T3W1'),(27,'Semi-arid and desert landscapes (wind erosion)','T3W1'),(28,'Depositional features of wind action','T3W2'),(29,'Man in the hot desert environments','T3W2')]: f3.append(('L',n,t,w,w))
f3.append(('M',0,'MODULE 3: WEATHER & CLIMATE / ADAPTATION TO CLIMATIC EXCESSES','',''))
for n,t,w in [(30,'The atmosphere','T3W4'),(31,'Weather and climate','T3W4'),(32,'Weather elements (temperature, rainfall, humidity)','T3W5'),(33,'Weather elements (wind, atmospheric pressure, sunshine)','T3W6'),(34,'Condensation','T3W6'),(35,'Precipitation','T3W6'),(36,'Planetary distribution of pressure belts and planetary winds','T3W7'),(37,'Local winds','T3W7'),(38,'Factors affecting temperature','T3W8'),(39,'The hydrological cycle','T3W8'),(40,'Global warming','T3W9'),(41,'Floods, droughts and desertification','T3W9'),(42,'Water scarcity','T3W9')]: f3.append(('L',n,t,w,w))
F['form 3']=f3
f4=[('M',0,'MODULE 1: ECOLOGICAL SYSTEMS & THEIR RESOURCES','',''),('L',1,'Concept of the soil','T1W1','T1W2')]
for n,t,w in [(2,'Soil profile','T1W2'),(3,'Soil erosion','T1W2'),(4,'Soil conservation','T1W3'),(5,'The ecosystem','T1W3'),(6,'Functioning of the ecosystem','T1W3'),(7,'Tropical rainforest biome','T1W4')]: f4.append(('L',n,t,w,w))
f4.append(('L',8,'Tropical savannah biome','T1W6','T1W7'))
for n,t,w in [(9,'Tropical monsoon biome','T1W7'),(10,'Hot desert biome','T1W8'),(11,'Mediterranean biome','T1W8'),(12,'Situation of Cameroon (location, size)','T1W8'),(13,'Relief of Cameroon','T1W9'),(14,'Drainage of Cameroon','T1W9'),(15,'Climatic types of Cameroon','T1W10'),(16,'Vegetation of Cameroon','T2W1'),(17,'Soil types in Cameroon','T2W1')]: f4.append(('L',n,t,w,w))
f4 += [('FS',1,'The biogeographic regions of Cameroon','T2W2','T2W2'),('PW',1,'Basic principles of map analysis','T2W2','T2W2'),('PW',2,'Conventional signs & symbols','T2W2','T2W2'),('PW',3,'Gridlines & locational references','T2W2','T2W2'),('PW',4,'Directions on maps','T2W3','T2W3'),('PW',5,'Scales & map measurements','T2W3','T2W3'),('PW',6,'Map copying, reduction & enlargement','T2W4','T2W4'),('PW',7,'Interpreting relief forms from maps','T2W4','T2W4'),('PW',8,'Description of relief & sketching of relief areas from maps','T2W5','T2W5'),('PW',9,'Description of drainage on maps','T2W6','T2W6'),('M',0,'MODULE 2: DEVELOPMENT AND MANAGEMENT OF PRIMARY RESOURCES','','')]
for n,t,w in [(18,'The notion of development','T2W7'),(19,'Indicators of development and underdevelopment','T2W8'),(20,'Classification of nations by development levels','T2W8'),(21,'Rostow’s model','T2W9'),(22,'Challenges of development','T2W9'),(23,'Global solutions to poverty and underdevelopment','T2W9'),(24,'Strategies for the emergence of the NICs','T2W10'),(25,'Economic activities','T2W10'),(26,'Agriculture','T2W10'),(27,'Agricultural systems','T2W11'),(28,'Intensive & extensive agriculture','T2W11'),(29,'The green revolution','T2W12'),(30,'Impact of agriculture (economy, environment)','T2W12'),(31,'Sustainable agriculture','T3W1'),(32,'Climate smart agriculture','T3W1'),(33,'Spatial patterns of agriculture: Von Thünen’s model','T3W1'),(34,'Arable agriculture in Cameroon','T3W2'),(35,'Pastoral agriculture in Cameroon','T3W2'),(36,'Impact of agriculture on the economy of Cameroon','T3W2'),(37,'Food loss and food waste in Cameroon','T3W2'),(38,'Problems of tropical agriculture with reference to Cameroon','T3W2'),(39,'(absente de la fiche : à préciser)','T3W4')]: f4.append(('L',n,t,w,w))
f4 += [('L',40,'Management of forest resources in Cameroon','T3W4','T3W5'),('FS',2,'Deforestation in Cameroon and consequences','T3W5','T3W5'),('PW',10,'Description of vegetation on maps','T3W5','T3W5')]
for n,t,w in [(41,'Fish resources & management','T3W6'),(42,'Management of fish resources in Cameroon','T3W6'),(43,'Management of mineral resources','T3W7'),(44,'Management of mineral resources in Cameroon','T3W7'),(45,'Energy resources','T3W8'),(46,'Energy resources of Cameroon','T3W8')]: f4.append(('L',n,t,w,w))
F['form 4']=f4
f5=[('M',0,'MODULE 1: MANAGEMENT OF MANUFACTURING & TERTIARY ACTIVITIES','','')]
seq=[('L',1,'Manufacturing industries','T1W1'),('L',2,'The agglomeration of industries','T1W1'),('L',3,'Industrialisation in the LICs','T1W2'),('L',4,'Industrialisation in the AICs','T1W2'),('L',5,'Weber’s industrial location model','T1W3'),('L',6,'Secondary industries in Cameroon','T1W3'),('PW',1,'Location of economic activities and description of land use','T1W4'),('L',7,'Communication','T1W4'),('L',8,'Development of road transport','T1W4'),('L',9,'Development of rail transport','T1W4'),('L',10,'Impact of road and railway on the economy','T1W6'),('L',11,'Air and water transport','T1W7'),('FS',2,'Containerization','T1W7'),('L',12,'Specialised forms of transport (motorways & cableways)','T1W8'),('L',13,'Pipelines','T1W8'),('L',14,'Globalisation','T1W8'),('L',15,'Telecommunications','T1W9'),('L',16,'Transport development in Cameroon','T1W9'),('PW',2,'Communication on maps','T1W9'),('L',17,'Volume of trade','T1W10')]
f5 += [(k,n,t,w,w) for k,n,t,w in seq]
f5 += [('L',18,'Trade blocs','T1W10','T1W11'),('L',19,'Tourism','T1W12','T2W1'),('L',20,'General effects of tourism','T2W1','T2W1'),('L',21,'Development of tourism in Cameroon','T2W2','T2W2'),('L',22,'Economic growth of Cameroon','T2W2','T2W2'),('M',0,'MODULE 2: PRESERVATION OF NATURAL RESOURCES','','')]
seq=[('L',23,'Land reclamation','T2W3'),('L',24,'Multipurpose river development projects','T2W3'),('L',25,'Multipurpose river development projects in Cameroon','T2W4'),('L',26,'Problems of waste management','T2W4'),('L',27,'Pollution','T2W5'),('M',0,'MODULE 3: MANAGEMENT OF POPULATION & SPACE COLONISATION',''),('L',28,'Basic notions on population','T2W6'),('FS',3,'Sources of population data','T2W7'),('L',29,'Population distribution and density','T2W7'),('PW',3,'Population densities in Cameroon','T2W7'),('L',30,'Spatial distribution of the world’s population','T2W7'),('L',31,'Age and sex composition of population','T2W8'),('L',32,'Basic types of age-sex pyramids','T2W8'),('L',33,'Population growth','T2W8'),('L',34,'The demographic transition model','T2W9'),('L',35,'Rapid population growth in LICs','T2W9'),('FS',4,'Control of population growth','T2W9'),('L',36,'Migration','T2W10'),('L',37,'Optimum population, over-population and under-population','T2W10'),('L',38,'Population and resources model (Malthus)','T2W10')]
f5 += [(k,n,t,w,w) for k,n,t,w in seq]
f5 += [('L',39,'Population of Cameroon (growth, structure, distribution)','T2W12','T3W1')]
seq=[('L',40,'Migration patterns in Cameroon','T3W1'),('PW',4,'Calculation of the determinants of population growth (BR, DR, NI, PGR)','T3W1'),('L',41,'Settlement','T3W2'),('L',42,'Location of settlements','T3W2'),('L',43,'Concept of rural settlement','T3W2'),('L',44,'Rural settlement form','T3W2'),('L',45,'Rural settlement distribution and patterns','T3W2'),('L',46,'The concept of urban settlement','T3W3'),('L',47,'Urbanisation','T3W3'),('L',48,'Consequences of the urbanisation process','T3W4'),('FS',5,'Shanty settlements','T3W4'),('L',49,'Functions of urban settlements','T3W4'),('L',50,'Urban fields or spheres of influence','T3W5'),('L',51,'Settlement size–functional relationship','T3W5'),('PW',5,'Settlements on maps','T3W5'),('L',52,'Settlements in Cameroon','T3W6'),('L',53,'Urban spheres of influence in Cameroon','T3W6'),('FS',6,'Site and situation of either Douala or Yaoundé','T3W6')]
f5 += [(k,n,t,w,w) for k,n,t,w in seq]
F['form 5']=f5
# Sixth : semaine prévue par n° de leçon dans chaque sous-branche (fiche Lower Sixth = ls, Upper Sixth = us)
def rng(a,b,w): return {i:w for i in range(a,b+1)}
SX = {
 'met': {**rng(1,4,'T1W1'),**rng(5,8,'T1W2'),**rng(9,12,'T1W3'),**rng(13,15,'T1W4'),**rng(16,18,'T1W5')},
 'clim': {19:'T1W5',20:'T1W6',21:'T1W6'},
 'hydro': {**rng(22,25,'T1W7'),**rng(26,28,'T1W8'),**rng(29,31,'T1W9'),**rng(32,34,'T1W10')},
 'geomo': {1:'T1W12',2:'T2W1',3:'T2W1',**rng(4,8,'T2W2'),**rng(9,12,'T2W3'),**rng(13,15,'T2W4'),16:'T2W5'},
 'bio': {1:'T2W6',2:'T2W6',**rng(3,7,'T2W7'),**rng(8,11,'T2W8'),**rng(12,15,'T2W9'),**rng(16,18,'T2W10'),**rng(19,22,'T2W11'),23:'T2W12',24:'T2W12',**rng(25,27,'T3W1'),28:'T3W2'},
 'pop': {1:'T1W1',2:'T1W1',3:'T1W2',4:'T1W2',**rng(5,9,'T1W3'),**rng(10,13,'T1W4'),14:'T1W5',15:'T1W5',16:'T1W6',17:'T1W6',18:'T1W7'},
 'set': {1:'T1W7',**rng(2,5,'T1W8'),**rng(6,9,'T1W9'),**rng(10,14,'T1W10'),15:'T1W11',**rng(16,18,'T1W12'),**rng(19,22,'T2W1')},
 'eco': {**rng(1,3,'T2W2'),**rng(4,6,'T2W3'),**rng(7,10,'T2W4'),11:'T2W5',13:'T2W6',**rng(14,17,'T2W8'),**rng(18,22,'T2W9'),**rng(23,26,'T2W10'),27:'T2W11',28:'T2W12',29:'T2W12',30:'T3W1',31:'T3W1'},
 'env': {**rng(1,3,'T3W2'),**rng(4,7,'T3W3'),**rng(8,14,'T3W5')},
}
SXYEAR = {'met':'ls','clim':'ls','hydro':'ls','geomo':'ls','bio':'ls','pop':'us','set':'us','eco':'us','env':'us','cam':'ls','prac':'us'}
