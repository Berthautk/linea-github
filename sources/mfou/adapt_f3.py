#!/usr/bin/env python3
"""Adapt the Form 3 physical-geography decks (lecons/F3) for Madame CHE Yvonne, Lycée Bilingue de Mfou:
new teacher and school on the layouts and in the speaker notes, neutral situations (no 'Garoua' framing), neutral first names.
Usage: adapt_f3.py <input_dir> <output_dir>"""
import glob, os, re, sys
from pptx import Presentation

SRC, DST = sys.argv[1], sys.argv[2]
os.makedirs(DST, exist_ok=True)

# ---------------------------------------------------------------- school and teacher
LAYOUT = [
    ('DGCAST-GAROUA  —  GEOGRAPHY DEPARTMENT', 'LYCÉE BILINGUE DE MFOU  —  GEOGRAPHY DEPARTMENT'),
    ('Copyright MINESEC  —  HOD – DGCAST-GAROUA', 'Copyright MINESEC  —  LYCÉE BILINGUE DE MFOU'),
    ('Copyright MINESEC  —  HOD – GBHS GAROUA', 'Copyright MINESEC  —  LYCÉE BILINGUE DE MFOU'),
    ('GBHS GAROUA  —  GEOGRAPHY DEPARTMENT', 'LYCÉE BILINGUE DE MFOU  —  GEOGRAPHY DEPARTMENT'),
    ('KAMDEM Emmanuel Berthaut', 'Madame CHE Yvonne'),
    ('Mr KAMDEM E.  —  Geography', 'Madame CHE Yvonne  —  Geography'),
]
NOTES = [('Mr Kamdem', 'Madam Che')]
CLASS = [('FORM 4', 'FORM 3'), ('Form 4', 'Form 3')]   # these are the lessons of the Form 3 syllabus

# ---------------------------------------------------------------- neutral first names
NAMES = [('Mrs Bouba', 'Mrs Ndongo'), ('the Bouba family', 'the Ndongo family'), ('Baba Hamadou', 'Papa Joseph'),
    ('Aïcha', 'Carine'), ('Hawaou', 'Estelle'), ('Ibrahim', 'Joseph'), ('Fatimé', 'Sandrine'), ('Alima', 'Brenda'), ('Moussa', 'Paul'),
    ('Oumarou', 'Joël'), ('Salamatou', 'Nadine'), ('Amadou', 'Samuel'), ('Kadidja', 'Grace'), ('Djibrilla', 'Daniel'), ('Mariam', 'Josiane'),
    ('Aboubakar', 'Thomas'), ('Ismaïla', 'Patrick'), ('Halima', 'Nadège'), ('Sadou', 'Martin'), ('Yaya', 'Eric'), ('Kaltouma', 'Ruth'),
    ('Djaouro', 'Alain'), ('Aminatou', 'Chantal'), ('Bouba', 'Pierre'), ('Adama', 'Hervé'), ('Oumar', 'Fabrice'), ('Rahila', 'Linda'),
    ('Maïmouna', 'Marie'), ('Idrissa', 'Franck'), ('Ali', 'Marc'), ('Hadja', 'Berthe'), ('Hamidou', 'Thierry'), ('Mohamadou', 'Boris'),
    ('Nafissatou', 'Laure')]

# ---------------------------------------------------------------- neutral wording (all decks)
GLOBAL = [
    # lesson 3 and practical work 1
    ('but after midnight in Garoua, people in America are still waiting.', 'but people in America are still waiting for it.'),
    ('A Red Cross team in Garoua must bring', 'A Red Cross team must bring'),
    ('Some towns of our region and of Cameroon have the following coordinates', 'Some towns of Cameroon have the following coordinates'),
    ('Towns of the Region on the Map of Cameroon', 'Towns on the Map of Cameroon'),
    # lesson 4
    ('Garoua is at about 13° E.', 'Cameroon lies between about 8° E and 16° E.'),
    ('but in Garoua we watch it at 7 p.m.', 'but in Cameroon we watch it at 7 p.m.'),
    ('in Brazil and in Garoua at the same moment', 'in Brazil and in Cameroon at the same moment'),
    ('why Brazil and Garoua have different times', 'why Brazil and Cameroon have different times'),
    ('Why is it later in Garoua?', 'Why is it later in Cameroon?'),
    ('Garoua is east of Brazil, so it sees the Sun first.', 'Cameroon is east of Brazil, so it sees the Sun first.'),
    # practical work 2
    ('Moussa and his friends in Garoua (GMT + 1)', 'Moussa and his friends in Cameroon (GMT + 1)'),
    ('the time and the day of the match in Garoua', 'the time and the day of the match in Cameroon'),
    ('between Los Angeles and Garoua', 'between Los Angeles and Cameroon'),
    ('It is 12:00 in Garoua (13° E). What is the local time at 43° E?', 'It is 12:00 at a place on longitude 13° E. What is the local time at 43° E?'),
    ('It is 22:00 on Friday in Garoua (GMT + 1)', 'It is 22:00 on Friday in Cameroon (GMT + 1)'),
    ('Example: Garoua (13° E) 12:00; at 43° E', 'Example: a place on 13° E has 12:00; at 43° E'),
    ('Example: Garoua GMT + 1 at 22:00 Friday', 'Example: Cameroon (GMT + 1) at 22:00 Friday'),
    ('It is 10:00 at Garoua (13° E). What is the local time at 17° W?', 'It is 10:00 at a place on longitude 13° E. What is the local time at 17° W?'),
    # lesson 5
    ('Every morning in Garoua, the first light', 'Every morning, the first light'),
    ('Watch Garoua (red dot). Why does it have day and then night?', 'Watch the red dot (a town in Cameroon). Why does it have day and then night?'),
    ('Garoua faces the Sun (day)', 'the town faces the Sun (day)'),
    ('where the Sun rises in Garoua', 'where the Sun rises near their school'),
    # lesson 6
    ('In September, it is the rainy season in Garoua and the Benue is full. In December and January, the dry Harmattan season comes.',
     'In some months of the year it rains almost every day, and in other months the weather is dry and dusty.'),
    ('Name the two seasons of Garoua.', 'Name the two main seasons of Cameroon.'),
    ('Which season does Garoua have?', 'Which season does northern Cameroon have?'),
    ('rainy and dry seasons of Garoua', 'rainy and dry seasons of northern Cameroon'),
    ('which months are rainy in Garoua', 'which months are rainy where they live'),
    # lessons 7 to 21
    ('Workers dig a deep well in Garoua.', 'Workers dig a deep well in a village.'),
    ('In Garoua, a new mosque is built on', 'In a town, a new building is built on'),
    ('while the ground in Garoua feels safe', 'while the ground around her feels safe'),
    ('After a heavy storm in Garoua, Halima sees', 'After a heavy storm, Halima sees'),
    ('Around Garoua, many soils are also red.', 'In many parts of Cameroon, soils are also red.'),
    ('Why are many soils around Garoua red?', 'Why are many soils in Cameroon red?'),
    ('Why are the soils of Garoua red?', 'Why are many soils in Cameroon red?'),
    ('but in Garoua it is wide and slow', 'but further downstream it is wide and slow'),
    ('while the Benue at Garoua is wide and slow', 'while the Benue downstream is wide and slow'),
    ('Use the waterfalls of our region for tourism', 'Use the waterfalls of Cameroon for tourism'),
    ('From the Benue Bridge in Garoua, Adama sees', 'From a bridge, Adama sees'),
    ('sees many sandbanks in the Benue at Garoua, and', 'sees many sandbanks in a big river such as the Benue, and'),
    ('along the Benue near Garoua, destroying', 'along the Benue in northern Cameroon, destroying'),
    ('along the Benue near Garoua.', 'along the Benue in northern Cameroon.'),
    # lessons 26 to 31
    ('In the market of Garoua, Idrissa sees', 'In a market in Cameroon, Idrissa sees'),
    ('ask about solar panels in Garoua', 'ask about solar panels in your town'),
    ('Nafissatou flies from Garoua to Douala.', 'Nafissatou flies from Douala to Paris.'),
    ('On Monday morning it rains in Garoua, so Idrissa', 'On Monday morning it rains in his town, so Idrissa'),
    ('"But Garoua has a hot climate.', '"But Cameroon has a hot climate.'),
    ('What is the weather in Garoua on Monday?', 'What is the weather in his town on Monday?'),
    ('What is the climate of Garoua?', 'What is the climate of Cameroon?'),
    ('It is hot, with a wet season and a dry season (tropical).', 'It is hot and rainy for much of the year (tropical or equatorial).'),
    ('describe the weather station of Garoua airport', 'describe the weather station of a nearby airport or school'),
    # lessons 33 to 42
    ('Example: In Garoua, relative humidity', 'Example: In northern Cameroon, relative humidity'),
    ('Example: Garoua has many hours of sunshine', 'Example: Northern Cameroon has many hours of sunshine'),
    ('In September, Garoua has short, heavy afternoon storms.', "In September, Emmanuel's home town has short, heavy afternoon storms."),
    ('Describe the rain in Garoua.', "Describe the rain in Emmanuel's home town."),
    ('heavy afternoon storms, as in Garoua.', 'heavy afternoon storms, as in many towns of Cameroon.'),
    ('describe afternoon storms in Garoua', 'describe afternoon storms in your town'),
    ('the wind in Garoua comes from the south-west', 'the wind in northern Cameroon comes from the south-west'),
    ('the winds of Garoua change direction', 'the winds of northern Cameroon change direction'),
    ('understand the seasons of Garoua', 'understand the seasons of northern Cameroon'),
    ('explain why Garoua has a moist south-west wind', 'explain why northern Cameroon has a moist south-west wind'),
    ('Why does Garoua have rain in July and not in January?', 'Why does northern Cameroon have rain in July and not in January?'),
    ('reach Garoua.', 'reach northern Cameroon.'),
    ('then the Harmattan, to Garoua.', 'then the Harmattan, to northern Cameroon.'),
    ('Which wind brings rain to Garoua?', 'Which wind brings rain to northern Cameroon?'),
    ('The dry wind of January in Garoua is', 'The dry wind of January in northern Cameroon is'),
    ('Oumar travels from Garoua to Ngaoundéré, only about 270 km away. In Garoua it is 35 °C, but in Ngaoundéré, in the evening, he needs a sweater.',
     'Oumar travels from Douala to Dschang, only about 210 km away. In Douala it is 32 °C, but in Dschang, in the evening, he needs a sweater.'),
    ('What is different about Ngaoundéré?', 'What is different about Dschang?'),
    ('It is much higher (on the Adamawa Plateau).', 'It is much higher (about 1,400 m, in the Western Highlands).'),
    ('so Ngaoundéré is cooler than Garoua', 'so Dschang is cooler than Douala'),
    ('Why is Ngaoundéré cooler than Garoua?', 'Why is Dschang cooler than Douala?'),
    ('compare Garoua and Ngaoundéré', 'compare Douala and Dschang'),
    ('Climate normals of Garoua, Maroua, Ngaoundéré and Douala', 'Climate normals of Cameroonian towns'),
    ('In March, the Benue at Garoua is shallow', 'In March, the Benue is shallow'),
    ('the rains in Garoua started every year in May and March was less hot', 'the rains came on time every year and the hot months were less hot'),
    ('floods destroyed villages along the Benue near Garoua.', 'floods destroyed villages along the Benue in northern Cameroon.'),
    ('In low quarters of Douala, Yaoundé and Garoua.', 'In low quarters of Douala, Yaoundé and many other towns.'),
    ('Towns such as Garoua grow fast', 'Towns such as Yaoundé and Douala grow fast'),
]
DECK = {'42': [('Which town is hotter?', 'Which town is hotter?')]}   # placeholder for deck rules below

NAME_SET = {a for a, _ in NAMES}

def sub_text(t, subs):
    for a, b in subs:
        if a in NAME_SET:
            t = re.sub(r'(?<!\w)' + re.escape(a) + r'(?!\w)', b, t)
        else:
            t = t.replace(a, b)
    return t

def fix_par(par, subs):
    runs = par.runs
    if not runs:
        return False
    old = ''.join(r.text for r in runs)
    new = sub_text(old, subs)
    if new == old:
        return False
    done = [sub_text(r.text, subs) for r in runs]
    if ''.join(done) == new:
        for r, t in zip(runs, done):
            r.text = t
    else:
        runs[0].text = new
        for r in runs[1:]:
            r.text = ''
    return True

def walk(shapes):
    for sh in shapes:
        if sh.shape_type == 6:
            yield from walk(sh.shapes)
        else:
            yield sh

def pars(shape):
    if shape.has_text_frame:
        yield from shape.text_frame.paragraphs
    if getattr(shape, 'has_table', False) and shape.has_table:
        for r in shape.table.rows:
            for c in r.cells:
                yield from c.text_frame.paragraphs

def process(path):
    prs = Presentation(path)
    prefix = os.path.basename(path)[:2]
    subs_slide = GLOBAL + NAMES + CLASS
    changed = 0
    for lay in list(prs.slide_layouts) + [prs.slide_master]:
        for sh in walk(lay.shapes):
            for p in pars(sh):
                changed += fix_par(p, LAYOUT + CLASS)
    for slide in prs.slides:
        for sh in walk(slide.shapes):
            for p in pars(sh):
                t = ''.join(r.text for r in p.runs)
                extra = []
                if prefix == '42' and t.strip() == 'Garoua.':
                    extra = [('Garoua.', 'Douala.')]
                changed += fix_par(p, extra + subs_slide)
        if slide.has_notes_slide:
            ntf = slide.notes_slide.notes_text_frame
            for p in ntf.paragraphs:
                t = ''.join(r.text for r in p.runs)
                extra = [('Good. Garoua.', 'Good. Douala.')] if (prefix == '42' and 'Good. Garoua.' in t) else []
                changed += fix_par(p, extra + subs_slide + NOTES)
    prs.core_properties.author = 'Madame CHE Yvonne – Lycée Bilingue de Mfou'
    prs.core_properties.last_modified_by = 'Madame CHE Yvonne – Lycée Bilingue de Mfou'
    out = os.path.join(DST, os.path.basename(path))
    prs.save(out)
    return changed

tot = 0
for f in sorted(glob.glob(os.path.join(SRC, '*.pptx'))):
    n = process(f)
    tot += n
    print(os.path.basename(f)[:60], n)
print('paragraphs changed:', tot)
