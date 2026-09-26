"""Big-label diagrams and GIFs for Lower Sixth Biogeography (Module 3: soils, vegetation, ecosystems)."""
import sys
from big_common import *
from matplotlib.patches import Arc
SKY = '#DDEFFB'; SOIL = '#8D6E63'; GREEN_ = '#43A047'


def box_(ax, x, y, w, h, t, c, fs=19, tc='white'):
    ax.add_patch(FancyBboxPatch((x, y), w, h, boxstyle='round,pad=0.05', fc=c, ec='white', lw=2, zorder=5))
    ax.text(x + w / 2, y + h / 2, t, fontsize=fs, fontweight='bold', ha='center', va='center', color=tc, zorder=6)


def regions():
    d = json.load(open('/home/claude/maps/cmr_adm1.geojson'))
    return {f['properties']['shapeName']: shape(f['geometry']).buffer(0) for f in d['features']}


def cm_map(zones, legend, name, note='Simplified'):
    fig = plt.figure(figsize=(12.8, 6.4), dpi=150); ax = plt.axes([0, 0, 1, 1], projection=PC); ax.set_extent([4, 26, 1.5, 13.3], crs=PC)
    ax.set_facecolor('#CFE6F5'); ax.add_geometries([land()], PC, facecolor='#F2EFE6', edgecolor='#888', lw=0.6)
    cm = country('Cameroon')
    for g, c in zones: ax.add_geometries([g.intersection(cm)], PC, facecolor=c, edgecolor='none')
    ax.add_geometries([cm], PC, facecolor='none', edgecolor='#333', lw=2)
    for i, (c, t) in enumerate(legend):
        ax.text(0.6, 0.9 - i * 0.085, '■', transform=ax.transAxes, fontsize=26, color=c, va='center'); ax.text(0.635, 0.9 - i * 0.085, t, transform=ax.transAxes, fontsize=17, fontweight='bold', va='center', color=NAVY)
    ax.text(0.99, 0.02, note, transform=ax.transAxes, ha='right', fontsize=14, style='italic', color='#555')
    msave(fig, name)


# ---------------- SOILS ----------------
def soil_components_big():
    fig, ax = canvas('white'); ax2 = fig.add_axes([0.02, 0.04, 0.42, 0.92])
    ax2.pie([45, 25, 25, 5], colors=['#A1887F', '#90CAF9', '#1E88E5', '#33691E'], startangle=90, wedgeprops=dict(ec='white', lw=3)); ax2.set_aspect('equal')
    for y, c, t in [(4.2, '#A1887F', 'Mineral matter: 45 %'), (3.3, '#90CAF9', 'Air: 25 %'), (2.4, '#1E88E5', 'Water: 25 %'), (1.5, '#33691E', 'Organic matter (humus): 5 %')]:
        ax.add_patch(Rectangle((6.0, y - 0.25), 0.5, 0.5, color=c)); ax.text(6.7, y, t, fontsize=24, fontweight='bold', va='center')
    lab(ax, 9.2, 0.5, 'A good loam soil (by volume)', fs=19, c=NAVY)
    save(fig, 'soil_components_big.png')


def soil_system_big():
    fig, ax = canvas('white')
    ax.add_patch(Rectangle((4.2, 0.6), 4.4, 3.4, color='#D7CCC8', ec=SOIL, lw=3)); ax.text(6.4, 3.55, 'SOIL (store)', fontsize=22, fontweight='bold', ha='center', color='#4E342E')
    ax.text(6.4, 2.3, 'Processes:\nweathering, humification,\nleaching, mixing', fontsize=17, fontweight='bold', ha='center', va='center', color='#4E342E')
    for y, t, c in [(4.15, 'Rain water', BLUE), (3.3, 'Dead leaves (litter)', GREEN), (2.3, 'Weathered rock', SOIL), (1.3, 'Sun energy', ORANGE)]:
        ax.text(0.2, y, t, fontsize=19, fontweight='bold', va='center', color=c); arrow(ax, (3.0, y), (4.2, min(y, 3.8)), c=c, lw=3, ms=20)
    ax.text(1.6, 4.72, 'INPUTS', fontsize=20, fontweight='bold', ha='center', color=NAVY); ax.text(11.2, 4.72, 'OUTPUTS', fontsize=20, fontweight='bold', ha='center', color=RED)
    for y, t, c in [(4.15, 'Uptake by plants', GREEN), (3.3, 'Evaporation', ORANGE), (2.3, 'Leaching', BLUE), (1.3, 'Erosion', SOIL)]:
        arrow(ax, (8.6, min(y, 3.8)), (9.8, y), c=c, lw=3, ms=20); ax.text(9.9, y, t, fontsize=19, fontweight='bold', va='center', color=c)
    save(fig, 'soil_system_big.png')


def particle_sizes_big():
    fig, ax = canvas('white')
    for x, r, c, t, s in [(1.4, 0.08, '#6D4C41', 'CLAY', 'below 0.002 mm'), (4.4, 0.25, '#A1887F', 'SILT', '0.002–0.05 mm'), (7.6, 0.7, '#E0B060', 'SAND', '0.05–2 mm'), (11.0, 1.2, '#9E9E9E', 'GRAVEL', 'over 2 mm')]:
        ax.add_patch(Circle((x, 2.8), r, color=c)); ax.text(x, 4.5, t, fontsize=26, fontweight='bold', ha='center', color=c if c != '#E0B060' else '#B8860B')
        ax.text(x, 1.0, s, fontsize=20, fontweight='bold', ha='center', color='#333')
    lab(ax, 6.4, 0.3, 'Texture = the proportions of sand, silt and clay', fs=19, c=NAVY)
    save(fig, 'particle_sizes_big.png')


def texture_triangle_big():
    fig = plt.figure(figsize=(12.8, 6.4), dpi=150); ax = fig.add_axes([0, 0, 1, 1]); ax.set_xlim(-0.35, 1.9); ax.set_ylim(-0.12, 1.0); ax.axis('off'); ax.set_aspect('equal')
    h = np.sqrt(3) / 2
    def P(sand, clay):  # silt = 100 - sand - clay
        s, c = sand / 100, clay / 100
        return (1 - s) - c / 2 + c / 2 + (c / 2) - c / 2 + (0.5 * c) - (0.5 * c) + (1 - s - c) * 0 + 0, 0
    def xy(sand, clay):
        s, c = sand / 100, clay / 100; si = 1 - s - c
        return si + c * 0.5, c * h
    tri = [xy(100, 0), xy(0, 0), xy(0, 100)]
    ax.add_patch(Polygon(tri, fill=False, ec=NAVY, lw=3))
    zones = [('CLAY', [(0, 100), (0, 60), (45, 40), (45, 55)], '#8D6E63'), ('LOAM', [(52, 7), (23, 27), (45, 27), (52, 20)], '#AED581'),
             ('SAND', [(100, 0), (85, 0), (90, 10)], '#FFE082'), ('SILT', [(20, 0), (0, 0), (0, 12), (8, 12)], '#B0BEC5'),
             ('SANDY LOAM', [(85, 0), (52, 0), (52, 7), (45, 20), (80, 20), (90, 10)], '#FFD54F'), ('SILT LOAM', [(52, 0), (20, 0), (8, 12), (0, 12), (0, 27), (23, 27), (52, 7)], '#CFD8DC'),
             ('CLAY LOAM', [(45, 27), (20, 27), (20, 40), (45, 40)], '#BCAAA4')]
    for n, pts, c in zones:
        q = [xy(a, b) for a, b in pts]; ax.add_patch(Polygon(q, color=c, alpha=0.9, ec='white', lw=2))
        cx = np.mean([p[0] for p in q]); cy = np.mean([p[1] for p in q]); ax.text(cx, cy, n, fontsize=14, fontweight='bold', ha='center', va='center', color='#222')
    ax.text(-0.02, -0.07, '100 % sand', fontsize=18, fontweight='bold', ha='center', color='#B8860B'); ax.text(1.02, -0.07, '100 % silt', fontsize=18, fontweight='bold', ha='center', color='#546E7A'); ax.text(0.5, h + 0.04, '100 % clay', fontsize=18, fontweight='bold', ha='center', color='#5D4037')
    for y, t, c in [(0.8, 'Example: 40 % sand, 40 % silt,', NAVY), (0.72, '20 % clay = LOAM', NAVY), (0.5, 'Sand: loose, drains fast', '#B8860B'), (0.4, 'Clay: sticky, holds water', '#5D4037'), (0.3, 'Loam: best for farming', GREEN)]:
        ax.text(1.08, y, t, fontsize=17, fontweight='bold', color=c)
    ax.plot(*xy(40, 20), 'o', ms=14, color=RED)
    msave(fig, 'texture_triangle_big.png')


def soil_structure_big():
    fig, ax = canvas('white')
    rng = np.random.default_rng(3)
    def panel(x0, name, kind):
        ax.add_patch(Rectangle((x0, 0.9), 2.8, 3.2, color='#EFEBE9', ec='#8D6E63', lw=2))
        if kind == 'crumb':
            for _ in range(28): ax.add_patch(Circle((x0 + rng.uniform(0.3, 2.5), rng.uniform(1.2, 3.8)), rng.uniform(0.12, 0.22), color='#6D4C41'))
        if kind == 'blocky':
            for i in range(3):
                for j in range(3): ax.add_patch(Rectangle((x0 + 0.25 + i * 0.8, 1.15 + j * 0.95), 0.7, 0.85, color='#795548'))
        if kind == 'platy':
            for j in range(7): ax.add_patch(Rectangle((x0 + 0.2, 1.1 + j * 0.42), 2.4, 0.3, color='#8D6E63'))
        if kind == 'prism':
            for i in range(4): ax.add_patch(Rectangle((x0 + 0.2 + i * 0.63, 1.1), 0.52, 2.8, color='#5D4037'))
        ax.text(x0 + 1.4, 4.45, name, fontsize=21, fontweight='bold', ha='center', color=NAVY)
    for k, (n, kd) in enumerate([('CRUMB', 'crumb'), ('BLOCKY', 'blocky'), ('PLATY', 'platy'), ('PRISMATIC', 'prism')]): panel(0.3 + k * 3.1, n, kd)
    ax.text(1.7, 0.45, 'best for crops', fontsize=17, fontweight='bold', ha='center', color=GREEN); ax.text(7.9, 0.45, 'water cannot pass', fontsize=17, fontweight='bold', ha='center', color=RED)
    save(fig, 'soil_structure_big.png')


def ph_scale_big():
    fig, ax = canvas('white'); cols = plt.cm.RdYlGn(np.linspace(0, 1, 7))
    for i, v in enumerate(range(3, 10)):
        c = plt.cm.RdYlBu(i / 6); ax.add_patch(Rectangle((0.6 + i * 1.66, 2.3), 1.6, 1.0, color=c)); ax.text(1.4 + i * 1.66, 2.8, str(v), fontsize=26, fontweight='bold', ha='center', va='center')
    ax.text(1.4, 3.7, 'ACID', fontsize=24, fontweight='bold', ha='center', color=RED); ax.text(6.4, 3.7, 'NEUTRAL (7)', fontsize=24, fontweight='bold', ha='center', color=GREEN); ax.text(11.4, 3.7, 'ALKALINE', fontsize=24, fontweight='bold', ha='center', color=BLUE)
    for x, t in [(2.2, 'Ferrallitic soils\n(4.5–5.5)'), (6.4, 'Best for most crops\n(6–7)'), (10.4, 'Black earths,\nsalty soils (8–9)')]:
        ax.text(x, 1.3, t, fontsize=18, fontweight='bold', ha='center', va='center', color='#333')
    lab(ax, 6.4, 4.55, 'Soil pH scale', fs=22, c=NAVY)
    save(fig, 'ph_scale_big.png')


def clorpt_big():
    fig, ax = canvas('white')
    box_(ax, 4.9, 3.9, 3.0, 0.9, 'SOIL', '#6D4C41', fs=26)
    items = [('Cl', 'Climate', ORANGE, 'active'), ('O', 'Organisms', GREEN, 'active'), ('R', 'Relief', '#795548', 'passive'), ('P', 'Parent rock', '#607D8B', 'passive'), ('T', 'Time', NAVY, 'passive')]
    for k, (a, n, c, t) in enumerate(items):
        x = 0.3 + k * 2.5; box_(ax, x, 1.2, 2.2, 1.2, f'{a}\n{n}', c, fs=19); arrow(ax, (x + 1.1, 2.45), (6.4, 3.85), c='#90A4AE', lw=2, ms=18)
        ax.text(x + 1.1, 0.75, t, fontsize=16, fontweight='bold', ha='center', color=RED if t == 'active' else '#555')
    lab(ax, 10.9, 4.35, 'S = f (Cl, O, R, P, T)', fs=20, c=RED)
    save(fig, 'clorpt_big.png')


def soil_formation_gif():
    frames = []; N = 40
    stages = ['1. Bare rock', '2. Rock breaks up (weathering)', '3. Lichens and mosses grow', '4. Plants add humus', '5. A deep soil with horizons']
    for i in range(N):
        f = i / (N - 1); st = min(4, int(f * 5)); fig, ax = canvas(SKY)
        ax.add_patch(Rectangle((0, 0), W_, 1.4, color='#78909C'))
        if st >= 1: ax.add_patch(Rectangle((0, 1.4), W_, 0.35 + 0.2 * st, color='#A1887F'))
        if st >= 1:
            rng = np.random.default_rng(1)
            for x in rng.uniform(0.2, 12.6, 30): ax.add_patch(Circle((x, 1.5), 0.1, color='#607D8B'))
        if st >= 3: ax.add_patch(Rectangle((0, 1.75 + 0.2 * st - 0.35), W_, 0.35, color='#4E342E'))
        if st == 2:
            for x in np.arange(0.5, 12.8, 1.0): ax.add_patch(Ellipse((x, 1.85 + 0.05), 0.5, 0.18, color='#9CCC65'))
        if st >= 3:
            for x in np.arange(0.6, 12.8, 1.3): tuft(ax, x, 1.75 + 0.2 * st, s=0.9)
        if st >= 4:
            for x in [2.0, 6.4, 10.8]: acacia(ax, x, 2.55, 1.1)
        lab(ax, 6.4, 4.55, stages[st], fs=24, c=NAVY)
        frames.append(frame(fig))
    save_gif(frames, 'soil_formation.gif', ms=160, hold=14)
    frames[-1].save(OUT + 'soil_formation_last.png')


def ideal_profile_big():
    fig, ax = canvas('white')
    hz = [('O', 'Organic layer: dead leaves, humus', '#3E2723', 0.35), ('A', 'Topsoil: dark, humus, roots, life', '#5D4037', 0.9), ('E', 'Eluvial layer: pale, washed out', '#D7CCC8', 0.6),
          ('B', 'Subsoil: clay and iron collect here', '#A1887F', 1.0), ('C', 'Weathered parent rock', '#BCAAA4', 0.8), ('R', 'Bedrock', '#78909C', 0.6)]
    y = 4.8
    for n, t, c, h in hz:
        ax.add_patch(Rectangle((0.8, y - h), 3.0, h, color=c, ec='white', lw=2)); ax.text(2.3, y - h / 2, n, fontsize=26, fontweight='bold', ha='center', va='center', color='white' if c in ('#3E2723', '#5D4037', '#78909C') else '#333')
        ax.text(4.2, y - h / 2, t, fontsize=20, fontweight='bold', va='center', color=NAVY); y -= h
    arrow(ax, (11.8, 4.2), (11.8, 1.2), c=BLUE, lw=5); ax.text(11.5, 2.7, 'Leaching', fontsize=18, fontweight='bold', rotation=90, va='center', color=BLUE)
    save(fig, 'ideal_profile_big.png')


def pedogenic_big():
    fig, ax = canvas('white')
    cols = [('PODSOLISATION', 'cold, wet: taiga', ['#3E2723', '#ECEFF1', '#8D6E63', '#BCAAA4'], 'down', BLUE),
            ('LATERISATION', 'hot, wet: tropics', ['#5D4037', '#E65100', '#BF360C', '#BCAAA4'], 'down', BLUE),
            ('CALCIFICATION', 'semi-arid: steppe', ['#212121', '#424242', '#F5F5F5', '#BCAAA4'], 'up', ORANGE),
            ('SALINISATION', 'arid, irrigated', ['#FAFAFA', '#BCAAA4', '#A1887F', '#BCAAA4'], 'up', ORANGE),
            ('GLEYING', 'waterlogged', ['#3E2723', '#78909C', '#607D8B', '#546E7A'], 'none', NAVY)]
    for k, (n, s, cs, d, c) in enumerate(cols):
        x = 0.25 + k * 2.52; y = 4.0
        for cc in cs: ax.add_patch(Rectangle((x + 0.3, y - 0.8), 1.4, 0.8, color=cc, ec='white', lw=1.5)); y -= 0.8
        if d == 'down': arrow(ax, (x + 2.0, 3.8), (x + 2.0, 1.2), c=c, lw=4, ms=22)
        elif d == 'up': arrow(ax, (x + 2.0, 1.2), (x + 2.0, 3.8), c=c, lw=4, ms=22)
        else: ax.add_patch(Rectangle((x + 0.3, 0.8), 1.4, 1.6, color='#1E88E5', alpha=0.25))
        ax.text(x + 1.15, 4.6, n, fontsize=13.5, fontweight='bold', ha='center', color=NAVY); ax.text(x + 1.15, 0.45, s, fontsize=14, fontweight='bold', ha='center', color='#333')
    ax.text(6.4, 0.08, 'Blue arrow: water moves DOWN (leaching)   Orange arrow: water moves UP (capillary rise)', fontsize=13, ha='center', color='#555', fontweight='bold')
    save(fig, 'pedogenic_big.png')


def minor_processes_big():
    fig, ax = canvas('white')
    ax.add_patch(Rectangle((0.8, 3.2), 3.2, 1.2, color='#5D4037')); ax.add_patch(Rectangle((0.8, 2.2), 3.2, 1.0, color='#D7CCC8')); ax.add_patch(Rectangle((0.8, 0.6), 3.2, 1.6, color='#A1887F'))
    ax.text(2.4, 3.8, 'A', fontsize=24, fontweight='bold', color='white', ha='center'); ax.text(2.4, 2.7, 'E', fontsize=24, fontweight='bold', ha='center'); ax.text(2.4, 1.4, 'B', fontsize=24, fontweight='bold', color='white', ha='center')
    arrow(ax, (4.4, 3.8), (4.4, 1.3), c=BLUE, lw=5); arrow(ax, (5.2, 0.8), (5.2, 3.3), c=ORANGE, lw=5)
    for y, t, c in [(4.3, 'Eluviation: material washed OUT of a layer (E)', BLUE), (3.5, 'Leaching: minerals dissolved and carried down', BLUE), (2.7, 'Lessivage: clay carried down in suspension', BLUE),
                    (1.9, 'Illuviation: material washed IN (B)', '#6D4C41'), (1.1, 'Capillary action: water rises and leaves salts', ORANGE), (0.3, 'Organic sorting: worms and roots mix the soil', GREEN)]:
        ax.text(5.9, y, t, fontsize=17, fontweight='bold', va='center', color=c)
    save(fig, 'minor_processes_big.png')


def soil_classes_big():
    fig, ax = canvas('white')
    for x, t, c, s, e in [(0.3, 'ZONAL', '#E65100', 'Formed by climate and\nvegetation of a zone', 'Ferrallitic (tropics)\nPodsol (taiga)\nChernozem (steppe)'),
                          (4.55, 'INTRAZONAL', '#1565C0', 'Formed by a local factor\n(water, salt, rock)', 'Hydromorphic (gley)\nSaline soils\nRendzina (limestone)'),
                          (8.8, 'AZONAL', '#6D4C41', 'Young soils without\nclear horizons', 'Alluvial soils\nVolcanic ash soils\nMountain (skeletal) soils')]:
        box_(ax, x, 3.9, 3.7, 0.8, t, c, fs=24); ax.text(x + 1.85, 2.9, s, fontsize=17, fontweight='bold', ha='center', va='center', color='#333')
        ax.text(x + 1.85, 1.2, e, fontsize=17, fontweight='bold', ha='center', va='center', color=c)
    save(fig, 'soil_classes_big.png')


def cameroon_soils_big():
    R = regions(); g = lambda *n: unary_union([R[k] for k in n])
    zones = [(g('Centre', 'South', 'East', 'Littoral') | box(8, 5.5, 16.5, 6.4), '#E65100'), (g('Adamaoua', 'North') - box(13.6, 10.3, 16.5, 13.3), '#FFB74D'),
             (g('Far North') - box(8, 10.3, 13.9, 13.3), '#424242'), (g('Far North') & box(8, 10.3, 13.9, 13.3), '#FFB74D'),
             (g('West', 'North-West') | (R['South-West'] & box(8.8, 3.9, 9.8, 4.6)), '#8E24AA'), (box(14.3, 9.8, 15.4, 12.9) & g('Far North', 'North'), '#1E88E5'), (R['South-West'] - box(8.8, 3.9, 9.8, 4.6), '#E65100')]
    cm_map(zones, [('#E65100', 'Ferrallitic (red, south)'), ('#FFB74D', 'Ferruginous (north)'), ('#424242', 'Tropical black earths'), ('#8E24AA', 'Volcanic and mountain soils'), ('#1E88E5', 'Hydromorphic (Logone floodplain)')],
           'cameroon_soils_big.png')


# ---------------- VEGETATION ----------------
def veg_system_big():
    fig, ax = canvas(SKY); sun(ax, 1.0, 4.3, 0.45)
    ax.add_patch(Rectangle((0, 0), W_, 0.9, color=SOIL)); ax.add_patch(Rectangle((6.2, 0.9), 0.4, 1.8, color='#6D4C41')); ax.add_patch(Circle((6.4, 3.3), 1.2, color=GREEN_))
    for (a, b, t, c, p) in [((1.5, 4.1), (5.3, 3.6), 'Sunlight', ORANGE, (2.8, 4.3)), ((3.0, 2.2), (5.2, 3.0), 'CO₂', '#607D8B', (2.9, 2.6)), ((4.4, 0.4), (6.2, 1.0), 'Water, nutrients', BLUE, (3.2, 0.45))]:
        arrow(ax, a, b, c=c, lw=4, ms=24); ax.text(*p, t, fontsize=19, fontweight='bold', color=c, ha='center')
    for (a, b, t, c, p) in [((7.5, 3.8), (9.8, 4.4), 'Oxygen, water vapour', RED, (11.1, 4.6)), ((7.3, 2.3), (9.6, 1.2), 'Dead leaves (litter)', '#6D4C41', (11.0, 1.8))]:
        arrow(ax, a, b, c=c, lw=4, ms=24); ax.text(*p, t, fontsize=19, fontweight='bold', color=c, ha='center')
    lab(ax, 6.4, 3.3, 'Photosynthesis', fs=16, c=GREEN)
    save(fig, 'veg_system_big.png')


def succession_gif():
    frames = []; N = 50
    stages = ['Bare rock or lava', 'Pioneers: lichens and mosses', 'Grasses and ferns', 'Shrubs', 'Climax: forest']
    for i in range(N):
        f = i / (N - 1); st = min(4, int(f * 5)); fig, ax = canvas(SKY)
        ax.add_patch(Rectangle((0, 0), W_, 1.0, color='#546E7A' if st == 0 else '#6D4C41'))
        if st >= 1:
            for x in np.arange(0.4, 12.8, 0.8): ax.add_patch(Ellipse((x, 1.02), 0.5, 0.15, color='#C0CA33'))
        if st >= 2:
            for x in np.arange(0.3, 12.8, 0.7): tuft(ax, x, 1.0, s=0.8)
        if st >= 3:
            for x in np.arange(0.8, 12.8, 1.8): ax.add_patch(Circle((x, 1.5), 0.45, color='#7CB342'))
        if st >= 4:
            for x in np.arange(1.0, 12.8, 2.3):
                ax.add_patch(Rectangle((x - 0.12, 1.0), 0.24, 1.9, color='#5D4037')); ax.add_patch(Circle((x, 3.2), 0.95, color='#2E7D32'))
        lab(ax, 6.4, 4.6, f'Stage {st + 1}: {stages[st]}', fs=24, c=NAVY)
        frames.append(frame(fig))
    save_gif(frames, 'succession.gif', ms=150, hold=14)
    frames[-1].save(OUT + 'succession_last.png')


def priseres_big():
    fig, ax = canvas('white')
    for k, (n, s, c) in enumerate([('LITHOSERE', 'on bare rock or lava', '#78909C'), ('HYDROSERE', 'in fresh water (ponds, lakes)', BLUE), ('PSAMMOSERE', 'on sand dunes', '#E0B060'), ('HALOSERE', 'in salt water (mudflats)', '#26A69A')]):
        x = 0.3 + (k % 2) * 6.3; y = 2.7 - (k // 2) * 2.2; box_(ax, x, y, 6.0, 1.8, '', c)
        ax.text(x + 3.0, y + 1.2, n, fontsize=26, fontweight='bold', ha='center', color='white', zorder=7); ax.text(x + 3.0, y + 0.5, s, fontsize=19, fontweight='bold', ha='center', color='white', zorder=7)
    save(fig, 'priseres_big.png')


def hydrosere_big():
    fig, ax = canvas(SKY)
    ax.add_patch(Rectangle((0, 0), W_, 0.8, color='#6D4C41'))
    ax.add_patch(Polygon([(0, 0.8), (4.3, 0.8), (4.3, 2.3), (0, 2.3)], color='#1E88E5')); ax.add_patch(Polygon([(0, 0.8), (4.3, 0.8), (4.3, 1.3), (0, 1.1)], color='#795548'))
    for x in [0.8, 1.9, 3.1]: ax.add_patch(Ellipse((x, 2.32), 0.6, 0.12, color='#43A047'))
    ax.add_patch(Polygon([(4.3, 0.8), (8.6, 0.8), (8.6, 2.3), (4.3, 2.3)], color='#4DB6AC'))
    for x in np.arange(4.5, 8.6, 0.35): ax.plot([x, x], [2.3, 3.2], color='#558B2F', lw=3)
    ax.add_patch(Rectangle((8.6, 0.8), 4.2, 1.5, color='#5D4037'))
    for x in [9.4, 10.8, 12.2]: ax.add_patch(Rectangle((x - 0.1, 2.3), 0.2, 1.2, color='#4E342E')); ax.add_patch(Circle((x, 3.8), 0.7, color='#2E7D32'))
    for x, t in [(2.15, 'Open water:\nwater lilies'), (6.45, 'Swamp: reeds,\nmud builds up'), (10.7, 'Dry land:\nwoodland (climax)')]: lab(ax, x, 4.4, t, fs=18, c=NAVY)
    arrow(ax, (1.0, 0.4), (11.8, 0.4), c='white', lw=3, ms=22); ax.text(6.4, 0.5, 'time', fontsize=16, color='white', fontweight='bold', ha='center')
    save(fig, 'hydrosere_big.png')


def climax_big():
    fig, ax = canvas('white')
    box_(ax, 0.3, 3.1, 3.6, 1.4, 'Succession', GREEN, fs=22); arrow(ax, (4.0, 3.8), (5.2, 3.8), c='#555', lw=4)
    box_(ax, 5.3, 3.1, 3.4, 1.4, 'CLIMATIC\nCLIMAX', '#1B5E20', fs=20); ax.text(10.8, 3.8, 'Monoclimax: one\nclimax set by climate', fontsize=17, fontweight='bold', ha='center', va='center', color='#1B5E20')
    arrow(ax, (4.0, 3.6), (5.2, 1.3), c='#555', lw=4)
    box_(ax, 5.3, 0.5, 3.4, 1.4, 'PLAGIOCLIMAX\n(arrested)', RED, fs=18); ax.text(10.8, 1.55, 'Fire, grazing, farming\nstop succession', fontsize=17, fontweight='bold', ha='center', va='center', color=RED)
    ax.text(10.8, 0.45, 'Polyclimax: many climaxes\n(soil, relief, fire)', fontsize=16, fontweight='bold', ha='center', va='center', color=NAVY)
    ax.text(2.1, 1.3, 'Example: savanna kept\nby yearly bush fires', fontsize=16, fontweight='bold', ha='center', va='center', color='#333')
    save(fig, 'climax_big.png')


def veg_altitude_big():
    fig, ax = canvas(SKY)
    bands = [(0.4, 1.3, '#1B5E20', 'Lowland rainforest (0–800 m)'), (1.3, 2.3, '#388E3C', 'Submontane forest (800–1,800 m)'), (2.3, 3.1, '#66BB6A', 'Montane forest (1,800–2,400 m)'),
             (3.1, 4.0, '#C5E1A5', 'Montane grassland (2,400–3,800 m)'), (4.0, 4.7, '#8D6E63', 'Bare lava and rock')]
    for y0, y1, c, t in bands:
        w0 = 5.0 * (1 - (y0 - 0.4) / 4.3); w1 = 5.0 * (1 - (y1 - 0.4) / 4.3)
        ax.add_patch(Polygon([(3.3 - w0 * 0.6, y0), (3.3 + w0 * 0.6, y0), (3.3 + w1 * 0.6, y1), (3.3 - w1 * 0.6, y1)], color=c))
        ax.plot([3.3 + (w0 + w1) / 2 * 0.6 * 0.9, 6.9], [(y0 + y1) / 2] * 2, color='#555', lw=1.5); ax.text(7.0, (y0 + y1) / 2, t, fontsize=18, fontweight='bold', va='center', color=NAVY)
    ax.text(3.3, 0.12, 'Mount Cameroon (simplified)', fontsize=15, fontweight='bold', ha='center', color='#333')
    save(fig, 'veg_altitude_big.png')


def cameroon_veg_big():
    R = regions(); g = lambda *n: unary_union([R[k] for k in n])
    forest = g('Centre', 'South', 'East', 'Littoral', 'South-West') - box(11.0, 5.3, 16.5, 7.0)
    zones = [(forest, '#1B5E20'), (box(8.4, 2.0, 10.4, 5.0) & box(8.4, 2.0, 9.9, 4.2) - box(9.2, 2.0, 12, 3.6), '#26A69A'),
             (g('West', 'North-West'), '#8BC34A'), (g('Adamaoua') | box(11.0, 5.3, 16.5, 7.0), '#C0CA33'), (g('North'), '#FFD54F'), (g('Far North'), '#FFB74D')]
    cm_map(zones, [('#1B5E20', 'Dense rainforest'), ('#26A69A', 'Mangrove (coast)'), ('#8BC34A', 'Montane forest and grassland'), ('#C0CA33', 'Guinea savanna'), ('#FFD54F', 'Sudan savanna'), ('#FFB74D', 'Sahel savanna (steppe)')],
           'cameroon_veg_big.png')


# ---------------- ECOSYSTEMS ----------------
def ecosystem_components_big():
    fig, ax = canvas('white')
    box_(ax, 0.3, 3.6, 5.8, 1.1, 'ABIOTIC (non-living)', '#607D8B', fs=22); box_(ax, 6.7, 3.6, 5.8, 1.1, 'BIOTIC (living)', GREEN, fs=22)
    for y, t in [(2.9, 'Sunlight, heat'), (2.1, 'Water, air'), (1.3, 'Soil and rocks'), (0.5, 'Nutrients (N, P, K)')]: ax.text(3.2, y, t, fontsize=21, fontweight='bold', ha='center', color='#455A64')
    for y, t, c in [(2.9, 'Producers: green plants', GREEN), (2.1, 'Consumers: animals', ORANGE), (1.3, 'Decomposers: fungi, bacteria', '#6D4C41'), (0.5, 'They all interact', NAVY)]: ax.text(9.6, y, t, fontsize=21, fontweight='bold', ha='center', color=c)
    save(fig, 'ecosystem_components_big.png')


def pond_big():
    fig, ax = canvas(SKY); sun(ax, 11.8, 4.3, 0.4)
    ax.add_patch(Polygon([(0, 3.2), (1.5, 3.2), (3.0, 0.6), (9.8, 0.6), (11.3, 3.2), (12.8, 3.2), (12.8, 0), (0, 0)], color='#6D4C41'))
    ax.add_patch(Polygon([(1.5, 3.2), (3.0, 0.6), (9.8, 0.6), (11.3, 3.2)], color='#64B5F6'))
    for x in [4.0, 5.3, 7.6]: ax.add_patch(Ellipse((x, 3.22), 0.8, 0.14, color='#2E7D32'))
    for x in np.arange(1.7, 2.8, 0.25): ax.plot([x, x], [2.8, 4.0], color='#558B2F', lw=3)
    for x, y in [(5.0, 2.0), (6.8, 1.6), (8.4, 2.3)]: ax.add_patch(Ellipse((x, y), 0.8, 0.3, color='#FB8C00')); ax.add_patch(Polygon([(x + 0.4, y), (x + 0.7, y + 0.2), (x + 0.7, y - 0.2)], color='#FB8C00'))
    lab(ax, 4.6, 4.3, 'Producers: algae, water lilies, reeds', fs=17, c=GREEN); lab(ax, 7.8, 2.9, 'Consumers: fish, frogs', fs=17, c=ORANGE)
    lab(ax, 6.4, 0.3, 'Decomposers in the mud: bacteria', fs=17, c='#4E342E')
    save(fig, 'pond_big.png')


def gersmehl_big(name='gersmehl_big.png', sizes=(1.0, 1.0, 1.0), title=None, ax=None, off=(0, 0), fs=20, k=0.55, sp=1.0):
    own = ax is None
    if own: fig, ax = canvas('white')
    ox, oy = off; B, Li, S = sizes
    pos = {'B': (ox + 3.2 * sp, oy + 3.4), 'L': (ox + 1.4 * sp, oy + 1.0), 'S': (ox + 5.0 * sp, oy + 1.0)}
    for kk, r, c, t in [('B', B, GREEN, 'Biomass'), ('L', Li, '#8D6E63', 'Litter'), ('S', S, '#FFB74D', 'Soil')]:
        ax.add_patch(Circle(pos[kk], k * r + 0.25, color=c, alpha=0.9)); ax.text(*pos[kk], t, fontsize=fs - 4, fontweight='bold', ha='center', va='center', color='white' if c != '#FFB74D' else '#333', zorder=8)
    arrow(ax, (pos['B'][0] - 0.6, pos['B'][1] - 0.5), (pos['L'][0] + 0.3, pos['L'][1] + 0.6), c='#555', lw=3, ms=18)
    arrow(ax, (pos['L'][0] + 0.8, pos['L'][1]), (pos['S'][0] - 0.8, pos['S'][1]), c='#555', lw=3, ms=18)
    arrow(ax, (pos['S'][0] - 0.3, pos['S'][1] + 0.6), (pos['B'][0] + 0.6, pos['B'][1] - 0.5), c='#555', lw=3, ms=18)
    if title: ax.text(ox + 3.2 * sp, oy + 4.6, title, fontsize=fs, fontweight='bold', ha='center', color=NAVY)
    if own:
        ax.text(0.9, 2.5, 'fallout', fontsize=16, fontweight='bold', color='#555'); ax.text(3.2, 0.5, 'decomposition', fontsize=16, fontweight='bold', ha='center', color='#555'); ax.text(4.6, 2.5, 'uptake', fontsize=16, fontweight='bold', color='#555')
        for y, t, c in [(4.2, 'Inputs: rain, weathering', BLUE), (3.2, 'Outputs: leaching, runoff', RED), (2.2, 'Circle size = amount', NAVY), (1.2, 'of nutrients stored', NAVY)]: ax.text(7.4, y, t, fontsize=20, fontweight='bold', color=c)
        save(fig, name)


def gersmehl_compare_big():
    fig, ax = canvas('white')
    gersmehl_big(sizes=(2.0, 0.4, 0.5), title='SELVA', ax=ax, off=(-0.2, -0.2), fs=20, k=0.3, sp=0.72)
    gersmehl_big(sizes=(0.6, 0.5, 2.0), title='STEPPE', ax=ax, off=(4.1, -0.2), fs=20, k=0.3, sp=0.72)
    gersmehl_big(sizes=(1.2, 1.8, 0.4), title='TAIGA', ax=ax, off=(8.4, -0.2), fs=20, k=0.3, sp=0.72)
    save(fig, 'gersmehl_compare_big.png')


def energy_flow_big():
    fig, ax = canvas('white'); sun(ax, 0.8, 3.2, 0.5)
    lv = [('Producers\n(grass)', GREEN, '10,000'), ('Herbivores\n(zebra)', ORANGE, '1,000'), ('Carnivores\n(lion)', RED, '100')]
    for k, (t, c, e) in enumerate(lv):
        x = 2.2 + k * 3.6; box_(ax, x, 2.6, 2.6, 1.3, t, c, fs=18); ax.text(x + 1.3, 4.2, e + ' units', fontsize=18, fontweight='bold', ha='center', color=c)
        arrow(ax, (x + 1.3, 2.55), (x + 1.3, 1.4), c='#E53935', lw=3, ms=20); ax.text(x + 1.3, 1.05, 'heat lost', fontsize=15, fontweight='bold', ha='center', color='#E53935')
        if k < 2: arrow(ax, (x + 2.65, 3.25), (x + 3.55, 3.25), c='#555', lw=4, ms=24)
    arrow(ax, (1.3, 3.2), (2.15, 3.2), c=ORANGE, lw=4, ms=24)
    lab(ax, 6.4, 0.35, 'Only about 10 % of energy passes to the next level', fs=18, c=NAVY)
    save(fig, 'energy_flow_big.png')


def trophic_pyramid_big():
    fig, ax = canvas('white')
    lv = [(0.6, 12.2, '#43A047', 'Producers: grass, trees'), (2.2, 10.6, '#FFB74D', 'Primary consumers: zebra, grasshopper'), (3.8, 9.0, '#EF6C00', 'Secondary consumers: lion, bird'), (5.4, 7.4, '#B71C1C', 'Tertiary')]
    y = 0.3
    for x0, x1, c, t in lv:
        ax.add_patch(Rectangle((x0, y), x1 - x0, 1.05, color=c, ec='white', lw=3)); ax.text(6.4, y + 0.52, t, fontsize=19 if x1 - x0 > 3 else 16, fontweight='bold', ha='center', va='center', color='white'); y += 1.1
    ax.text(0.2, 4.7, 'Trophic levels', fontsize=20, fontweight='bold', color=NAVY)
    save(fig, 'trophic_pyramid_big.png')


def food_web_big():
    fig, ax = canvas('#F1F8E9')
    n = {'Grass': (2.0, 0.8, GREEN), 'Acacia': (6.4, 0.8, GREEN), 'Seeds': (10.8, 0.8, GREEN), 'Zebra': (1.4, 2.6, ORANGE), 'Gazelle': (4.4, 2.6, ORANGE), 'Giraffe': (7.6, 2.6, ORANGE), 'Mouse': (11.0, 2.6, ORANGE),
         'Lion': (3.0, 4.4, RED), 'Cheetah': (6.4, 4.4, RED), 'Eagle': (10.0, 4.4, RED)}
    for a, b in [('Grass', 'Zebra'), ('Grass', 'Gazelle'), ('Acacia', 'Giraffe'), ('Acacia', 'Gazelle'), ('Seeds', 'Mouse'), ('Zebra', 'Lion'), ('Gazelle', 'Lion'), ('Gazelle', 'Cheetah'), ('Giraffe', 'Lion'), ('Mouse', 'Eagle')]:
        arrow(ax, (n[a][0], n[a][1] + 0.3), (n[b][0], n[b][1] - 0.3), c='#78909C', lw=2.5, ms=18)
    for k, (x, y, c) in n.items(): lab(ax, x, y, k, fs=19, c=c)
    ax.text(12.6, 0.1, 'Arrows show "is eaten by"', fontsize=14, ha='right', style='italic', color='#555')
    save(fig, 'food_web_big.png')


def productivity_big():
    fig, ax = chart(); b = ['Rain-\nforest', 'Swamp', 'Temperate\nforest', 'Savanna', 'Taiga', 'Grass-\nland', 'Tundra', 'Desert']; v = [2200, 2000, 1250, 900, 800, 600, 140, 90]
    ax.bar(range(8), v, color=['#1B5E20', '#26A69A', '#66BB6A', '#C0CA33', '#2E7D32', '#AED581', '#B0BEC5', '#FFB74D'], width=0.7)
    ax.set_xticks(range(8)); ax.set_xticklabels(b, fontsize=16, fontweight='bold'); ax.set_ylabel('Net primary productivity\n(g/m²/year)', fontsize=19, fontweight='bold')
    for i, x in enumerate(v): ax.text(i, x + 40, str(x), fontsize=17, fontweight='bold', ha='center')
    fig.subplots_adjust(left=0.13, bottom=0.2); ax.set_ylim(0, 2500)
    fig.savefig(OUT + 'productivity_big.png', dpi=150, facecolor='white'); plt.close(fig)


def table_big(name, head, rows, colw=None, fs=20, note=None):
    fig, ax = canvas('white'); n = len(head); colw = colw or [12.0 / n] * n; y = 4.7; rh = min(0.62, 4.0 / (len(rows) + 1)); x = 0.4
    for w, h in zip(colw, head):
        ax.add_patch(Rectangle((x, y - rh), w, rh, color=NAVY)); ax.text(x + w / 2, y - rh / 2, h, fontsize=fs - 3, fontweight='bold', ha='center', va='center', color='white'); x += w
    for k, r in enumerate(rows):
        x = 0.4; yy = y - rh * (k + 2)
        for w, c in zip(colw, r):
            ax.add_patch(Rectangle((x, yy), w, rh, color='#E8F5E9' if k % 2 == 0 else 'white', ec='#90A4AE', lw=1)); ax.text(x + w / 2, yy + rh / 2, str(c), fontsize=fs, fontweight='bold', ha='center', va='center', color='#222'); x += w
    if note: ax.text(6.4, 0.2, note, fontsize=17, fontweight='bold', ha='center', color=RED)
    save(fig, name)


def pw_productivity_big():
    table_big('pw_productivity_big.png', ['Biome', 'Gross (GPP)', 'Respiration', 'Net (NPP)'],
              [['Rainforest', '4,400', '2,200', '?'], ['Savanna', '1,800', '900', '?'], ['Temperate grassland', '1,200', '600', '?'], ['Desert', '200', '110', '?']], colw=[4.4, 2.6, 2.6, 2.4], fs=21,
              note='NPP = GPP − Respiration  (g/m²/year)')


def biomes_map_big():
    fig, ax = map_axes([-180, 180, -60, 80])
    L = land(); bands = [(-10, 10, '#1B5E20'), (10, 18, '#C0CA33'), (-18, -10, '#C0CA33'), (18, 32, '#FFB74D'), (-32, -18, '#FFB74D'), (32, 50, '#66BB6A'), (-50, -32, '#66BB6A'), (50, 66, '#2E7D32'), (66, 80, '#B0BEC5')]
    for y0, y1, c in bands:
        g = L.intersection(box(-180, y0, 180, y1))
        if not g.is_empty: ax.add_geometries([g], PC, facecolor=c, edgecolor='none', alpha=0.9)
    for i, (c, t) in enumerate([('#1B5E20', 'Tropical rainforest'), ('#C0CA33', 'Savanna'), ('#FFB74D', 'Hot desert'), ('#66BB6A', 'Temperate forest / grassland'), ('#2E7D32', 'Taiga'), ('#B0BEC5', 'Tundra')]):
        ax.text(0.01, 0.94 - i * 0.075, '■ ' + t, transform=ax.transAxes, fontsize=18, fontweight='bold', color=c if c != '#B0BEC5' else '#607D8B', bbox=dict(fc='white', ec='none', alpha=0.85))
    ax.text(0.99, 0.03, 'Simplified (biomes follow latitude and climate)', transform=ax.transAxes, ha='right', fontsize=14, style='italic', color='#555')
    msave(fig, 'biomes_map_big.png')


def biome_classes_big():
    table_big('biome_classes_big.png', ['Climate', 'Forest', 'Grassland', 'Scrub / desert'],
              [['Tropical', 'Rainforest (selva)', 'Savanna', 'Hot desert'], ['Temperate', 'Deciduous forest', 'Steppe, prairie', 'Mediterranean scrub'], ['Cold / polar', 'Taiga', 'Tundra', 'Ice desert']], colw=[2.3, 3.2, 3.0, 3.5], fs=18)


def services_big():
    fig, ax = canvas('white')
    for k, (t, c, e) in enumerate([('PROVISIONING', '#2E7D32', 'food, wood, water,\nmedicines, fish'), ('REGULATING', '#1565C0', 'clean air and water,\nclimate, flood control'),
                                    ('CULTURAL', '#8E24AA', 'tourism, beauty,\nsacred forests, learning'), ('SUPPORTING', '#6D4C41', 'soil formation,\nnutrient cycles, pollination')]):
        x = 0.3 + (k % 2) * 6.3; y = 2.6 - (k // 2) * 2.3; box_(ax, x, y + 1.1, 6.0, 0.9, t, c, fs=23); ax.text(x + 3.0, y + 0.45, e, fontsize=18, fontweight='bold', ha='center', va='center', color=c)
    save(fig, 'services_big.png')


def ecosystem_system_big():
    fig, ax = canvas('white')
    box_(ax, 4.3, 1.0, 4.2, 3.2, '', '#E8F5E9', tc=NAVY)
    ax.text(6.4, 3.8, 'ECOSYSTEM', fontsize=22, fontweight='bold', ha='center', color=GREEN, zorder=8)
    ax.text(6.4, 2.4, 'Stores: biomass,\nlitter, soil\nProcesses: photosynthesis,\nfeeding, decomposition', fontsize=15, fontweight='bold', ha='center', va='center', color=NAVY, zorder=8)
    for y, t, c in [(4.0, 'Sun energy', ORANGE), (3.0, 'Rain, CO₂', BLUE), (2.0, 'Nutrients from rock', '#6D4C41')]: ax.text(0.2, y, t, fontsize=19, fontweight='bold', va='center', color=c); arrow(ax, (2.9, y), (4.25, y), c=c, lw=3, ms=20)
    for y, t, c in [(4.0, 'Heat', RED), (3.0, 'O₂, water vapour', BLUE), (2.0, 'Leaching, erosion', '#6D4C41')]: arrow(ax, (8.55, y), (9.7, y), c=c, lw=3, ms=20); ax.text(9.8, y, t, fontsize=19, fontweight='bold', va='center', color=c)
    ax.text(1.5, 4.7, 'INPUTS', fontsize=20, fontweight='bold', ha='center', color=NAVY); ax.text(11.0, 4.7, 'OUTPUTS', fontsize=20, fontweight='bold', ha='center', color=RED)
    save(fig, 'ecosystem_system_big.png')


def equilibrium_big():
    fig, ax = canvas('white')
    pts = {'Atmosphere': (6.4, 4.2, '#90CAF9'), 'Biomass': (2.2, 2.4, GREEN), 'Soil': (10.6, 2.4, '#FFB74D'), 'Litter': (6.4, 0.7, '#8D6E63')}
    for k, (x, y, c) in pts.items(): box_(ax, x - 1.4, y - 0.4, 2.8, 0.8, k, c, fs=21, tc='white' if c != '#FFB74D' and c != '#90CAF9' else '#222')
    for a, b in [('Atmosphere', 'Biomass'), ('Biomass', 'Litter'), ('Litter', 'Soil'), ('Soil', 'Biomass'), ('Biomass', 'Atmosphere'), ('Soil', 'Atmosphere')]:
        (x1, y1, _), (x2, y2, _) = pts[a], pts[b]; arrow(ax, (x1 + (x2 - x1) * 0.28, y1 + (y2 - y1) * 0.28), (x1 + (x2 - x1) * 0.72, y1 + (y2 - y1) * 0.72), c='#607D8B', lw=3, ms=20, cs='arc3,rad=0.12')
    lab(ax, 11.3, 4.5, 'Balance = equilibrium', fs=17, c=GREEN); lab(ax, 1.6, 4.5, 'Man can upset it', fs=17, c=RED)
    save(fig, 'equilibrium_big.png')


def pw_texture_big():
    table_big('pw_texture_big.png', ['Sample', 'Sand %', 'Silt %', 'Clay %', 'Texture class'],
              [['A (river bank)', '70', '20', '10', 'Sandy loam'], ['B (school farm)', '40', '40', '20', 'Loam'], ['C (valley)', '20', '25', '55', 'Clay']], colw=[3.2, 1.8, 1.8, 1.8, 3.4], fs=21,
              note='Sieve, weigh each part, then plot on the texture triangle')


def ribbon_test_big():
    fig, ax = canvas('white')
    for k, (n, L, c, t) in enumerate([('SAND', 0.0, '#E0B060', 'falls apart,\nno ribbon'), ('LOAM', 1.0, '#8D6E63', 'short ribbon\n(under 2.5 cm)'), ('CLAY', 2.6, '#5D4037', 'long, shiny ribbon\n(over 5 cm)')]):
        x = 0.8 + k * 4.1
        ax.add_patch(Ellipse((x + 0.6, 2.6), 1.3, 0.9, color='#FFCCBC', ec='#8D6E63', lw=2)); ax.add_patch(Ellipse((x + 0.6, 3.5), 1.0, 0.7, color='#FFCCBC', ec='#8D6E63', lw=2))
        if L > 0: ax.add_patch(FancyBboxPatch((x + 1.1, 3.0), L, 0.25, boxstyle='round,pad=0.05', color=c))
        else:
            for dx, dy in [(1.3, 2.2), (1.5, 1.9), (1.2, 1.7), (1.7, 2.4)]: ax.add_patch(Circle((x + dx, dy), 0.08, color=c))
        ax.text(x + 1.4, 4.5, n, fontsize=28, fontweight='bold', ha='center', color=c if c != '#E0B060' else '#B8860B')
        ax.text(x + 1.4, 1.0, t, fontsize=19, fontweight='bold', ha='center', va='center', color='#333')
    lab(ax, 6.4, 0.2, 'Wet the soil and press it between thumb and finger', fs=17, c=NAVY)
    save(fig, 'ribbon_test_big.png')


ALL = [k for k in list(globals()) if (k.endswith('_big') or k.endswith('_gif')) and k not in ('table_big',)]
if __name__ == '__main__':
    for f in (sys.argv[1:] or ALL):
        try: globals()[f](); print('ok', f)
        except Exception as e: print('FAIL', f, repr(e))
