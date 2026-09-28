"""Big-label diagrams for the revised Lower Sixth Geomorphology (teacher's support, 2026)."""
import sys
from big_common import *
from big_usa_pop import box_, table_big


def txt(ax, x, y, t, fs=20, c='#222', ha='center', va='center', w='bold'):
    ax.text(x, y, t, fontsize=fs, fontweight=w, ha=ha, va=va, color=c, zorder=8)


def cols(name, title, heads, bodies, colors, fs_b=18):
    fig, ax = canvas('white'); n = len(heads); w = (12.2 - 0.2 * (n - 1)) / n
    if title: txt(ax, 6.4, 4.6, title, 22, NAVY)
    for k, (h, b, c) in enumerate(zip(heads, bodies, colors)):
        x = 0.3 + k * (w + 0.2); box_(ax, x, 3.1, w, 0.95, h, c, fs=20 if n <= 3 else (18 if n == 4 else 13)); txt(ax, x + w / 2, 1.7, b, fs_b, c)
    save(fig, name)


def geo2_branches():
    cols('geo2_branches.png', 'The two branches of geomorphology', ['STRUCTURAL GEOMORPHOLOGY', 'DYNAMIC GEOMORPHOLOGY'],
         ['internal structure, rocks,\nfolds, faults, volcanoes\n(e.g. the Himalayas)', 'external forces: rivers, wind,\nice, gravity, weathering\n(e.g. the Grand Canyon)'], [BROWN, BLUE], 20)


def geo2_endo_exo():
    cols('geo2_endo_exo.png', 'Landform-forming processes', ['INTERNAL (ENDOGENIC)', 'EXTERNAL (EXOGENIC)'],
         ['driven by the Earth\'s heat\nbuild up the land:\nplate movements, volcanoes,\nfolding, faulting', 'driven by the Sun\'s energy\nwear down the land:\nweathering, erosion,\ndeposition, glaciation'], [RED, GREEN], 19)


def geo2_eras():
    table_big('geo2_eras.png', ['Era', 'Dates (million years ago)', 'Key events'],
              [['Precambrian', '4,600 – 541', 'Earth, oceans, first simple life'], ['Palaeozoic ("ancient life")', '541 – 252', 'fish, first land plants; Pangaea forms'],
               ['Mesozoic ("middle life")', '252 – 66', 'dinosaurs; Pangaea breaks up'], ['Cenozoic ("recent life")', '66 – today', 'mammals, Alps, Himalayas, humans']],
              colw=[3.4, 2.8, 5.8], fs=16)


def geo2_orders():
    cols('geo2_orders.png', 'Categories of landforms', ['1st ORDER (MAJOR)', '2nd ORDER', '3rd ORDER (MINOR)'],
         ['continents and\nocean basins', 'mountains, plateaux,\nplains (Adamawa,\nBenue plain)', 'valleys, hills,\ngullies, sandbanks\n(Benue valley)'], [NAVY, ORANGE, GREEN], 19)


def geo2_pangaea():
    fig, ax = canvas('white')
    ax.add_patch(Ellipse((6.4, 2.4), 9.5, 4.0, color='#E9DDBE', ec=BROWN, lw=3))
    ax.plot([2.0, 10.8], [2.55, 2.25], color=BLUE, lw=6)
    txt(ax, 6.4, 3.4, 'LAURASIA\n(North America, Europe, Asia)', 20, NAVY); txt(ax, 6.4, 1.4, 'GONDWANALAND\n(South America, Africa, India,\nAntarctica, Australia)', 19, GREEN)
    txt(ax, 6.4, 4.75, 'PANGAEA ("all lands"), about 200 million years ago', 21, RED); txt(ax, 12.2, 2.4, 'Tethys\nSea', 16, BLUE)
    save(fig, 'geo2_pangaea.png')


def geo2_evidence():
    cols('geo2_evidence.png', "Wegener's evidence for continental drift (1912)", ['JIGSAW FIT', 'ROCKS', 'FOSSILS', 'CLIMATES'],
         ['coasts of Africa\nand South America\nfit together', 'same rocks and\nmountains on both\nsides (Appalachians,\nScotland)', 'Mesosaurus,\nGlossopteris on\nseparated\ncontinents', 'glacial scratches\nin hot Africa\nand India'], [BROWN, NAVY, GREEN, BLUE], 17)


def geo2_margins3():
    table_big('geo2_margins3.png', ['Margin', 'Movement', 'Landforms', 'Example'],
              [['Constructive (divergent)', 'apart', 'ridges, rift valleys', 'Mid-Atlantic Ridge'], ['Destructive (convergent)', 'towards', 'trenches, fold mountains, volcanoes', 'Andes, Himalayas'],
               ['Conservative (transform)', 'past each other', 'faults, earthquakes only', 'San Andreas Fault']], colw=[3.0, 1.9, 4.5, 2.6], fs=15)


def geo2_volc_life():
    cols('geo2_volc_life.png', 'The life cycle of a volcano', ['ACTIVE', 'DORMANT', 'EXTINCT'],
         ['erupting or erupted\nin recorded history\n(Mount Cameroon)', 'sleeping, may\nerupt again\n(Kilimanjaro, Fuji)', 'dead, will not\nerupt again\n(Rhumsiki necks)'], [RED, ORANGE, '#607D8B'], 20)


def geo2_products():
    cols('geo2_products.png', 'Products of a volcanic eruption', ['LAVA', 'PYROCLASTS', 'GASES'],
         ['basic: runny, flows far\nacid: sticky, stays\nnear the vent', 'ash, cinders\n(lapilli) and\nvolcanic bombs', 'water vapour,\ncarbon dioxide,\nsulphur dioxide'], [RED, BROWN, '#607D8B'], 19)


def geo2_cones():
    table_big('geo2_cones.png', ['Landform', 'Material', 'Shape', 'Example'],
              [['Shield cone', 'runny basic lava', 'wide, gentle slopes', 'Mauna Loa'], ['Acid lava dome', 'sticky acid lava', 'steep dome', 'Mont Pelée'],
               ['Ash and cinder cone', 'pyroclasts', 'steep, small', 'Parícutin'], ['Composite cone', 'layers of lava and ash', 'tall, steep cone', 'Mount Cameroon'],
               ['Lava plateau', 'fissure eruptions', 'flat, very wide', 'Deccan (India)'], ['Crater / caldera', 'collapse of the top', 'bowl (< 1 km) / basin', 'Lake Nyos crater']],
              colw=[2.8, 3.2, 3.2, 2.8], fs=16)


def geo2_volc_man():
    cols('geo2_volc_man.png', 'Volcanoes and man', ['RESOURCES', 'HAZARDS', 'RESPONSES'],
         ['fertile soils (CDC)\ntourism (Race of Hope)\ngeothermal energy\nbuilding stone, minerals', 'lava flows, ash fall\npyroclastic flows\nlahars (mudflows)\ntoxic gases (Nyos)', 'monitoring (seismometers,\ngas sensors, GPS)\nhazard maps, zoning\neducation, evacuation'], [GREEN, RED, NAVY], 17)


def geo2_quake():
    fig, ax = canvas('#F3E9D8')
    ax.add_patch(Rectangle((0, 3.4), 12.8, 1.6, color='#DDEFFB', zorder=0))
    ax.plot([0, 12.8], [3.4, 3.4], color=BROWN, lw=4)
    fx, fy = 6.4, 1.2
    for r in (0.7, 1.4, 2.1): ax.add_patch(Circle((fx, fy), r, fill=False, ec=RED, lw=3, ls='--'))
    ax.plot([fx], [fy], marker='*', ms=30, color=RED); ax.plot([fx, fx], [fy, 3.4], color='#333', lw=2, ls=':')
    ax.plot([fx], [3.4], marker='v', ms=22, color=NAVY)
    txt(ax, 10.3, 1.2, 'FOCUS (hypocentre):\nwhere rocks break', 19, RED); txt(ax, 6.4, 4.2, 'EPICENTRE: point on the surface above the focus', 19, NAVY)
    txt(ax, 2.6, 2.6, 'seismic waves', 19, RED)
    save(fig, 'geo2_quake.png')


def geo2_quake_resp():
    cols('geo2_quake_resp.png', 'Reducing earthquake damage', ['PREDICTION', 'STRUCTURES', 'PREPAREDNESS'],
         ['monitoring ground\nmovements and\nwarnings', 'reinforced buildings,\nspecial foundations,\nno building on\nloose soils', '"Drop, Cover,\nHold On"\nemergency kits\nevacuation drills'], [NAVY, BROWN, GREEN], 18)


def geo2_denudation():
    cols('geo2_denudation.png', 'Denudation = weathering + mass movement + erosion', ['WEATHERING', 'MASS MOVEMENT', 'EROSION'],
         ['rocks broken down\nin place\n(no movement)', 'material moves\ndown the slope\nby gravity', 'material removed\nby rivers, wind,\nice, waves'], [BROWN, ORANGE, BLUE], 19)


def geo2_slopes():
    fig, ax = canvas('white')
    x = np.linspace(0, 3.4, 60)
    for k, (t, y, c) in enumerate([('CONVEX\nsteeper downwards', 3.2 - 0.28 * x ** 2, RED), ('RECTILINEAR\nconstant angle', 3.2 - 0.94 * x, ORANGE), ('CONCAVE\ngentler downwards', 0.0 + 3.2 * np.exp(-1.1 * x), GREEN)]):
        x0 = 0.4 + k * 4.2; ax.fill_between(x0 + x, 0.3, np.maximum(y, 0) + 0.3, color='#D7C4A3'); ax.plot(x0 + x, np.maximum(y, 0) + 0.3, color=c, lw=5)
        txt(ax, x0 + 1.7, 4.4, t, 18, c)
    save(fig, 'geo2_slopes.png')


def geo2_weathering():
    table_big('geo2_weathering.png', ['Type', 'Process', 'Example'],
              [['Mechanical', 'exfoliation (heating and cooling)', 'granite domes near Garoua'], ['Mechanical', 'frost action (water freezes, +9 %)', 'cold mountains'],
               ['Chemical', 'oxidation (iron rusts)', 'red soils and rocks'], ['Chemical', 'solution, carbonation', 'rock salt, limestone'],
               ['Biological', 'roots, burrowing animals, humans', 'trees splitting rocks, quarries']], colw=[2.4, 5.0, 4.6], fs=16)


def geo2_wfactors():
    cols('geo2_wfactors.png', 'Factors of the intensity of weathering', ['CLIMATE', 'ROCK', 'RELIEF', 'VEGETATION', 'HUMANS'],
         ['heat and\nrainfall\n(the most\nimportant)', 'hardness,\nminerals,\njoints', 'steep: fresh\nrock exposed\nflat: deep\nsoils', 'roots split\nrocks; cover\nprotects', 'quarries,\nroads,\nploughing,\nacid rain'], [RED, BROWN, ORANGE, GREEN, NAVY], 16)


def geo2_wimpact():
    cols('geo2_wimpact.png', 'The impact of weathering', ['POSITIVE EFFECTS', 'NEGATIVE EFFECTS'],
         ['soil for farming (cotton, millet)\nsand, gravel, clay for building\nbauxite and iron ores\nlandscapes for tourism\ngroundwater in the regolith', 'cracked walls, potholes\nweak rocks: landslides,\nrockfalls\nleaching of nutrients'], [GREEN, RED], 18)


def geo2_mw_evidence():
    cols('geo2_mw_evidence.png', 'Evidence of mass wasting', ['TILTED OBJECTS', 'CURVED TREES', 'TERRACETTES', 'TENSION CRACKS'],
         ['poles, fences,\nwalls leaning\ndownhill', 'J-shaped trunks\nat the base', 'small steps\non grassy\nslopes', 'cracks at the\ntop of a slope'], [NAVY, GREEN, BROWN, RED], 17)


def geo2_mw_factors():
    cols('geo2_mw_factors.png', 'Factors of mass wasting', ['GRAVITY', 'WATER', 'SLOPE', 'NO VEGETATION', 'HUMANS', 'VIBRATIONS'],
         ['the driving\nforce', 'weight and\nlubrication\n(main trigger)', 'steeper than\nthe angle of\nrepose', 'no roots\nto bind\nthe soil', 'road cuts,\nwaste tips', 'earthquakes,\nheavy traffic'], [NAVY, BLUE, BROWN, GREEN, ORANGE, RED], 14)


def geo2_mw_solutions():
    cols('geo2_mw_solutions.png', 'Controlling mass wasting', ['AFFORESTATION', 'DRAINAGE', 'RETAINING WALLS', 'TERRACING', 'ZONING'],
         ['roots bind\nthe soil', 'channels and\npipes remove\nwater', 'hold back\nsoil at the\nfoot', 'steps slow\nrunoff', 'no houses in\ndanger zones'], [GREEN, BLUE, BROWN, ORANGE, NAVY], 16)


def geo2_transport():
    fig, ax = canvas('#DDEFFB')
    ax.add_patch(Rectangle((0, 0), 12.8, 1.0, color='#C8B28A'))
    ax.add_patch(Circle((1.8, 1.45), 0.45, color='#6D4C41')); txt(ax, 1.8, 2.5, 'TRACTION\nboulders roll', 18, BROWN)
    for i, x in enumerate([4.3, 4.9, 5.5]): ax.add_patch(Circle((x, 1.2 + (0.5 if i == 1 else 0)), 0.18, color='#8D6E63'))
    ax.plot([4.1, 4.9, 5.7], [1.15, 1.75, 1.15], color='#8D6E63', lw=2, ls='--'); txt(ax, 5.0, 2.7, 'SALTATION\npebbles bounce', 18, BROWN)
    rng = np.random.default_rng(1); ax.scatter(rng.uniform(7.0, 9.4, 90), rng.uniform(1.3, 3.8, 90), s=12, color='#A1887F'); txt(ax, 8.2, 4.4, 'SUSPENSION\nsilt and clay (most load)', 18, NAVY)
    txt(ax, 11.2, 2.5, 'SOLUTION\ndissolved\nminerals\n(invisible)', 18, BLUE)
    arrow(ax, (0.5, 4.5), (3.0, 4.5), c=BLUE, lw=5); txt(ax, 1.75, 4.8, 'flow', 16, BLUE)
    save(fig, 'geo2_transport.png')


def geo2_courses():
    table_big('geo2_courses.png', ['', 'Upper course', 'Middle course', 'Lower course'],
              [['Gradient', 'very steep', 'gentle', 'almost flat'], ['Valley', 'narrow V-shape', 'wider, flat floor', 'wide floodplain'],
               ['Main work', 'vertical erosion', 'transport, lateral erosion', 'deposition'], ['Landforms', 'waterfalls, gorges, spurs', 'meanders, river cliffs', 'levees, ox-bows, deltas'],
               ['Example', 'streams of the Adamawa', 'Benue below Lagdo', 'Benue at Garoua']], colw=[2.3, 3.2, 3.3, 3.2], fs=16)


def geo2_coast():
    cols('geo2_coast.png', 'Coastal processes', ['EROSION', 'TRANSPORT', 'DEPOSITION'],
         ['hydraulic action,\nabrasion, attrition,\nsolution\n→ cliffs, caves, arches,\nstacks, stumps', 'longshore drift:\nswash up at an angle,\nbackwash straight\ndown', 'in sheltered bays\n→ beaches,\nspits, bars'], [RED, ORANGE, BLUE], 17)


def geo2_coast_threats():
    cols('geo2_coast_threats.png', 'Threats to the coast of Cameroon', ['EROSION', 'FLOODING', 'POLLUTION'],
         ['beaches and roads\nlost at Kribi\nand Limbe', 'storm surges and\nsea-level rise\n(Douala lowlands)', 'waste from towns,\nindustries, ships\n(mangroves)'], [RED, BLUE, BROWN], 19)


if __name__ == '__main__':
    only = sys.argv[1:]
    for n, f in list(globals().items()):
        if n.startswith('geo2_') and callable(f) and (not only or n in only): f(); print('ok', n)
