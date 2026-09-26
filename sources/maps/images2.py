import json, numpy as np, matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt, matplotlib.patheffects as pe
from matplotlib.patches import Patch, Polygon as MPoly, Rectangle, Circle, Ellipse, FancyArrowPatch, FancyBboxPatch
import cartopy.crs as ccrs
from shapely.geometry import Polygon, box, shape
from shapely.ops import unary_union
from render import load
from desert_maps import SAHARA, SAHEL, KALAHARI, NAMIB

PC = ccrs.PlateCarree(); W = [pe.withStroke(linewidth=2.5, foreground='white')]
OUT = '/home/claude/f4/img/'
C110 = load('countries110.geojson'); LAND110 = unary_union([g for n, g in C110 if g.bounds[2] - g.bounds[0] < 300])
C50 = [(n, g) for n, g in load('countries50.geojson') if g.bounds[2] - g.bounds[0] < 150]


def P(pts): return Polygon(pts)


def world_axes(title, ext=(-130, 160, -50, 62), size=(12, 6.4)):
    fig = plt.figure(figsize=size, dpi=200)
    ax = plt.axes(projection=PC); ax.set_extent(ext, crs=PC); ax.set_facecolor('#CFE6F5')
    ax.add_geometries([LAND110], PC, facecolor='#F2EFE6', edgecolor='#999', linewidth=0.4)
    ax.text(ext[0] + 2, ext[3] - 5, title, fontsize=15, fontweight='bold', color='#990011', transform=PC, zorder=9, path_effects=W)
    return fig, ax


def lat_lines(ax, ext, lines):
    for la, t, st in lines:
        ax.plot([ext[0], ext[1]], [la, la], color='#2E6DB4', lw=1.2 if la == 0 else 0.8, ls=st, transform=PC, zorder=4)
        ax.text(ext[0] + 1, la + 0.8, t, fontsize=9.5, fontweight='bold', color='#1C3F6E', transform=PC, zorder=6, path_effects=W)


# ---------------- deserts of the world ----------------
def deserts_world():
    ext = (-125, 150, -55, 55)
    fig, ax = world_axes('THE MAIN DESERTS OF THE WORLD', ext)
    hot = {'SAHARA': SAHARA, 'ARABIAN': P([(35, 29), (40, 32), (47, 30), (56, 24), (58, 20), (52, 16), (45, 17), (39, 21)]),
           'THAR': P([(69, 24), (71, 29.5), (74, 30), (75, 27), (72, 24.5)]), 'KALAHARI': KALAHARI, 'NAMIB': NAMIB,
           'GREAT AUSTRALIAN': P([(115, -21), (125, -20), (135, -21), (140, -24), (140, -29), (135, -31), (125, -30), (118, -27)]),
           'SONORAN / MOJAVE': P([(-117, 36), (-114, 37), (-108, 34), (-104, 30), (-103, 26), (-107, 26), (-110, 28), (-113, 31), (-116, 32)]),
           'ATACAMA': P([(-71.5, -18), (-69.3, -18), (-69.3, -27), (-71.2, -27.5)])}
    cold = {'GOBI': P([(95, 44), (105, 44.5), (112, 45), (113, 42), (105, 40), (97, 40.5)]),
            'TAKLAMAKAN': P([(76, 39), (88, 39.5), (89, 37.5), (82, 36.8), (77, 37.5)]),
            'PATAGONIAN': P([(-70, -40), (-65, -40), (-65.5, -47), (-69, -50), (-71, -47)])}
    for d, c in [(hot, '#E0A548'), (cold, '#9BB7C9')]:
        for k, poly in d.items():
            ax.add_geometries([poly.intersection(LAND110)], PC, facecolor=c, edgecolor='#6B4A10' if c == '#E0A548' else '#3F5F75', linewidth=0.6, zorder=3)
    lat_lines(ax, ext, [(0, 'Equator', '-'), (23.44, 'Tropic of Cancer (23½°N)', '--'), (-23.44, 'Tropic of Capricorn (23½°S)', '--')])
    labels = [(8, 24, 'SAHARA', 13), (47, 22.5, 'ARABIAN', 10), (71, 31.5, 'THAR', 9.5), (23.5, -23.5, 'KALAHARI', 9.5), (9.5, -26.5, 'NAMIB', 9.5),
              (128, -26, 'GREAT AUSTRALIAN\nDESERT', 10), (-110, 38.5, 'SONORAN &\nMOJAVE', 9.5), (-58, -22, 'ATACAMA', 9.5), (104, 46.5, 'GOBI', 10),
              (82, 41.5, 'TAKLAMAKAN', 9.5), (-55, -46, 'PATAGONIAN', 9.5)]
    for x, y, t, fs in labels:
        ax.text(x, y, t, fontsize=fs, fontweight='bold', ha='center', color='#3A2A00', transform=PC, zorder=7, path_effects=W)
    ax.legend(handles=[Patch(facecolor='#E0A548', edgecolor='#6B4A10', label='Hot desert'), Patch(facecolor='#9BB7C9', edgecolor='#3F5F75', label='Cold (mid-latitude) desert')],
              loc='upper center', bbox_to_anchor=(0.5, -0.01), ncol=2, fontsize=11.5, frameon=False)
    plt.savefig(OUT + 'deserts_world.png', bbox_inches='tight', pad_inches=0.08, facecolor='white'); plt.close()


# ---------------- temperate regions of the world ----------------
def temperate_world():
    ext = (-130, 180, -50, 66)
    fig, ax = world_axes('THE MAIN TEMPERATE REGIONS OF THE WORLD', ext)
    med = [P([(-10, 36), (-9, 43), (3, 43.5), (10, 44.5), (19, 42), (29, 41.5), (36, 37), (35.5, 32), (20, 32.5), (10, 33.5), (-2, 34.5), (-9, 33)]).difference(SAHARA),
           P([(-124.5, 42), (-120, 42), (-117, 34), (-117, 32.5), (-120, 34.5), (-123, 38)]), P([(-72.5, -30), (-70.5, -30), (-70.5, -38), (-73.8, -38)]),
           P([(17.8, -31.5), (18.3, -34.5), (22, -34.2), (21.5, -33.2), (19, -32)]), P([(114.5, -29), (118, -29), (119, -34.8), (114.8, -34.8)]),
           P([(135, -33), (140, -34), (142, -38.5), (138, -36.5), (136, -35.5)])]
    ocean = [P([(-10.5, 43), (-5, 43.5), (3, 43.5), (15, 48), (15, 55), (10, 58), (5, 62), (-8, 58.5), (-11, 52)]), P([(-128, 42), (-121, 42), (-121, 49), (-126, 55), (-133, 58.5), (-137, 57.5), (-130, 52), (-125.5, 49)]),
             P([(-75.5, -38), (-72, -38), (-71.5, -48), (-74, -53), (-76.5, -48)]), P([(165, -47.5), (179, -47.5), (179, -34), (172, -34)]),
             P([(143, -37.3), (150, -37.3), (149, -43.8), (144, -43.8)])]
    cont = [P([(-114, 54), (-97, 52), (-95, 45), (-97, 35), (-104, 33), (-105, 40), (-110, 45), (-114, 49)]),
            P([(28, 52), (45, 53), (60, 55), (80, 54), (88, 50), (80, 46), (60, 46), (50, 46), (40, 46), (30, 46)]),
            P([(-65, -31), (-58, -31), (-57.5, -35), (-58, -38.5), (-63, -39.5), (-65, -36)]), P([(26, -25), (31, -25.5), (30.5, -29), (26, -29.5), (25, -27)]),
            P([(142, -28), (151, -26.5), (150, -33), (146, -35), (142, -33)])]
    for group, col, ec in [(med, '#E5A13B', '#8A5A10'), (ocean, '#5FA66B', '#2E6B3A'), (cont, '#E8D46A', '#8A7A10')]:
        for poly in group:
            ax.add_geometries([poly.intersection(LAND110)], PC, facecolor=col, edgecolor=ec, linewidth=0.6, zorder=3)
    lat_lines(ax, ext, [(0, 'Equator', '-'), (30, '30°N', '--'), (-30, '30°S', '--'), ])
    labs = [(-2, 47, 'WESTERN\nEUROPE'), (55, 50.5, 'STEPPES'), (-104, 48, 'PRAIRIES'), (-60, -35, 'PAMPAS'), (29, -23.5, 'VELD'), (18, 38.5, 'MEDITERRANEAN'),
            (-113, 36.5, 'CALIFORNIA'), (153, -44.5, 'NEW\nZEALAND')]
    for x, y, t in labs:
        ax.text(x, y, t, fontsize=9.5, fontweight='bold', ha='center', color='#1A1A1A', transform=PC, zorder=7, path_effects=W)
    ax.legend(handles=[Patch(facecolor='#E5A13B', edgecolor='#8A5A10', label='Mediterranean type'), Patch(facecolor='#5FA66B', edgecolor='#2E6B3A', label='Cool temperate western margin (oceanic)'),
                       Patch(facecolor='#E8D46A', edgecolor='#8A7A10', label='Temperate continental (grasslands)')], loc='upper center', bbox_to_anchor=(0.5, -0.01), ncol=3, fontsize=11, frameon=False)
    plt.savefig(OUT + 'temperate_world.png', bbox_inches='tight', pad_inches=0.08, facecolor='white'); plt.close()


# ---------------- Africa helpers ----------------
def africa_axes(title, ext=(-19, 52, -36, 38), size=(8, 8.4)):
    fig = plt.figure(figsize=size, dpi=220)
    ax = plt.axes(projection=PC); ax.set_extent(ext, crs=PC); ax.set_facecolor('#CFE6F5')
    ax.text(ext[0] + 0.7, ext[3] - 2.2, title, fontsize=12.5, fontweight='bold', color='#990011', transform=PC, zorder=9, path_effects=W)
    return fig, ax


def africa_land():
    ext = box(-26, -38, 56, 41)
    cs = [(n, g) for n, g in C50 if g.intersects(ext)]
    ASIA_EU = {'Saudi Arabia', 'Yemen', 'Oman', 'Israel', 'Jordan', 'Syria', 'Lebanon', 'Iraq', 'Iran', 'Kuwait', 'Qatar', 'United Arab Emirates', 'Bahrain',
               'Turkey', 'Cyprus', 'N. Cyprus', 'Greece', 'Italy', 'Spain', 'Portugal', 'France', 'Malta', 'Palestine', 'Albania', 'Bulgaria', 'Georgia', 'Armenia', 'Azerbaijan',
               'Macedonia', 'North Macedonia', 'Montenegro', 'Kosovo', 'Serbia', 'Croatia', 'Bosnia and Herz.', 'Slovenia', 'Romania', 'Pakistan', 'Afghanistan', 'Turkmenistan', 'India', 'Gibraltar'}
    af = [(n, g) for n, g in cs if n not in ASIA_EU]
    return cs, unary_union([g for n, g in af])


def africa_location():
    cs, land = africa_land()
    fig, ax = africa_axes('AFRICA: LOCATION AND EXTREME POINTS', ext=(-19, 52, -36, 43.5))
    for n, g in cs:
        ax.add_geometries([g], PC, facecolor='#F2E3B3' if g.representative_point().y < 37.5 and g.representative_point().x < 51.5 and not (g.representative_point().x > 34 and g.representative_point().y > 12.5) else '#E6E6E6',
                          edgecolor='#999', linewidth=0.4)
    for la, t in [(0, 'Equator (0°)'), (23.44, 'Tropic of Cancer'), (-23.44, 'Tropic of Capricorn')]:
        ax.plot([-19, 52], [la, la], color='#2E6DB4', lw=1.1, ls='-' if la == 0 else '--', transform=PC, zorder=4)
        ax.text(-18.5, la + 0.7, t, fontsize=9, fontweight='bold', color='#1C3F6E', transform=PC, zorder=6, path_effects=W)
    ax.plot([0, 0], [-36, 43.5], color='#2E6DB4', lw=1.1, transform=PC, zorder=4); ax.text(0.5, -33.5, 'Greenwich\nMeridian (0°)', fontsize=8.5, color='#1C3F6E', fontweight='bold', transform=PC, zorder=6, path_effects=W)
    pts = [(9.8, 37.3, 'North: Ras ben Sakka\n(Tunisia) 37°N', 'left', 1.3, 0.3), (20.0, -34.8, 'South: Cape Agulhas\n(South Africa) 35°S', 'left', 2.5, -0.3),
           (-17.5, 14.7, 'West: Cap Vert\n(Senegal) 17°W', 'left', 0.8, 2.6), (51.3, 10.4, 'East: Ras Hafun\n(Somalia) 51°E', 'right', -0.8, 3.0)]
    for x, y, t, ha, dx, dy in pts:
        ax.plot(x, y, '*', ms=15, color='#C00000', mec='black', transform=PC, zorder=8)
        ax.text(x + dx, y + dy, t, fontsize=9.5, fontweight='bold', ha=ha, transform=PC, zorder=9, path_effects=W)
    for x, y, t in [(-12, 25, 'ATLANTIC\nOCEAN'), (44, -20, 'INDIAN\nOCEAN'), (22, 33.2, 'Mediterranean Sea'), (38.3, 20.3, 'Red\nSea')]:
        ax.text(x, y, t, fontsize=10, style='italic', fontweight='bold', color='#2E6DB4', ha='center', transform=PC, zorder=6)
    ax.annotate('Strait of Gibraltar', xy=(-5.6, 35.95), xytext=(-18, 33.2), xycoords=PC._as_mpl_transform(ax), fontsize=9, fontweight='bold',
                arrowprops=dict(arrowstyle='-', lw=1), path_effects=W, zorder=9)
    ax.annotate('Suez Canal', xy=(32.3, 30.5), xytext=(35, 34.5), xycoords=PC._as_mpl_transform(ax), fontsize=9, fontweight='bold', arrowprops=dict(arrowstyle='-', lw=1), path_effects=W, zorder=9)
    ax.plot(13.4, 9.3, 'o', ms=6, color='#990011', mec='black', transform=PC, zorder=8)
    ax.text(14.2, 9.0, 'Garoua', fontsize=9, fontweight='bold', transform=PC, zorder=9, path_effects=W)
    plt.savefig(OUT + 'africa_location.png', bbox_inches='tight', pad_inches=0.08, facecolor='white'); plt.close()


def rivers(ax, names_lw):
    d = json.load(open('ne_50m_rivers_lake_centerlines.geojson'))
    for f in d['features']:
        nm = f['properties'].get('name') or ''
        g = f['geometry']; lines = g['coordinates'] if g['type'] == 'MultiLineString' else [g['coordinates']]
        for l in lines:
            xs, ys = zip(*l)
            if not (min(xs) > -20 and max(xs) < 52 and min(ys) > -36 and max(ys) < 38):
                continue
            ax.plot(xs, ys, color='#1F5FBF', lw=names_lw.get(nm, 0.8), transform=PC, zorder=5)
    lk = json.load(open('ne_50m_lakes.geojson'))
    for f in lk['features']:
        g = shape(f['geometry'])
        if g.bounds[0] > -20 and g.bounds[2] < 52 and g.bounds[1] > -36 and g.bounds[3] < 38:
            ax.add_geometries([g], PC, facecolor='#6FA8DC', edgecolor='#1F5FBF', linewidth=0.5, zorder=5)


def africa_relief():
    cs, land = africa_land()
    fig, ax = africa_axes('AFRICA: RELIEF (SIMPLIFIED)')
    for n, g in cs:
        ax.add_geometries([g], PC, facecolor='#E9F0DC', edgecolor='#AAA', linewidth=0.3)
    high = [P([(9, 34), (0, 36), (-6, 34.5), (-9.5, 30.5), (-7, 30), (-2, 32.5), (4, 34.5), (9, 33.2)]),  # Atlas
            P([(34, 15.5), (40, 15.5), (43, 11), (42, 8), (40, 4.5), (35.5, 5), (34.8, 10)]),  # Ethiopian highlands
            P([(29, 3), (37.5, 3), (40, -4), (36, -9), (33, -11), (29, -8.5), (28.5, -2)]),  # E African plateau
            P([(12, -8), (24, -10), (32, -12), (35, -18), (31, -26), (27, -30), (24, -32.5), (19, -32), (16, -27), (14, -18), (12.5, -12)]),  # Southern plateau
            P([(9.2, 4.2), (11, 7.5), (15.5, 8), (15, 6.5), (12, 6), (10.3, 5)]),  # Cameroon/Adamawa highlands
            P([(4, 24), (8, 25.5), (8, 22), (5, 21.5)]), P([(16.5, 22), (19.5, 22), (19, 19.5), (17, 19.8)]), P([(-13, 12.2), (-11, 12.2), (-10.5, 10), (-12.5, 10)])]
    for poly in high:
        ax.add_geometries([poly.intersection(land)], PC, facecolor='#C98B4A', edgecolor='#8A5A20', linewidth=0.5, alpha=0.9, zorder=3)
    rivers(ax, {'Nile': 1.8, 'Congo': 1.8, 'Niger': 1.8, 'Zambezi': 1.5})
    peaks = [('Kilimanjaro 5,895 m', 37.35, -3.08, 'right'), ('Mt Kenya 5,199 m', 37.3, -0.15, 'left'), ('Ras Dejen 4,533 m', 38.37, 13.24, 'right'),
             ('Toubkal 4,165 m', -7.92, 31.06, 'left'), ('Thabana Ntlenyana 3,482 m', 29.27, -29.47, 'left'), ('Mt Cameroon 4,040 m', 9.17, 4.2, 'right')]
    for t, x, y, side in peaks:
        ax.plot(x, y, '^', ms=9, color='#5A2E0A', mec='white', transform=PC, zorder=8)
        ax.text(x + (0.8 if side == 'left' else -0.8), y, t, fontsize=8.5, fontweight='bold', ha=side, va='center', transform=PC, zorder=9, path_effects=W)
    for t, x, y in [('ATLAS MOUNTAINS', 0, 32.2), ('AHAGGAR', 6, 23), ('TIBESTI', 18, 23.2), ('ETHIOPIAN\nHIGHLANDS', 39, 9.2), ('EAST AFRICAN\nPLATEAU', 31.5, -9.3),
                    ('DRAKENSBERG', 29.5, -31.5), ('CONGO\nBASIN', 21, -1), ('CHAD\nBASIN', 17, 15), ('KALAHARI\nBASIN', 22.5, -22.5), ('FOUTA\nDJALLON', -11.5, 13.3), ('ADAMAWA', 13, 7.2)]:
        ax.text(x, y, t, fontsize=8, fontweight='bold', ha='center', color='#3A2000', transform=PC, zorder=7, path_effects=W)
    ax.plot(42.41, 11.67, 'v', ms=8, color='#1F5FBF', mec='black', transform=PC, zorder=8)
    ax.text(43.3, 10.2, 'Lake Assal\n−155 m', fontsize=8, fontweight='bold', ha='left', transform=PC, zorder=9, path_effects=W)
    ax.legend(handles=[Patch(facecolor='#C98B4A', edgecolor='#8A5A20', label='Highlands and plateaux (simplified)'), Patch(facecolor='#E9F0DC', edgecolor='#AAA', label='Lowlands and basins')],
              loc='lower left', fontsize=9.5, framealpha=0.95)
    plt.savefig(OUT + 'africa_relief.png', bbox_inches='tight', pad_inches=0.08, facecolor='white'); plt.close()


def africa_drainage():
    cs, land = africa_land()
    fig, ax = africa_axes('AFRICA: MAIN RIVERS AND LAKES')
    for n, g in cs:
        ax.add_geometries([g], PC, facecolor='#F2EFE6', edgecolor='#AAA', linewidth=0.3)
    rivers(ax, {'Nile': 2.4, 'Congo': 2.4, 'Niger': 2.4, 'Zambezi': 2.0, 'Orange': 1.6, 'Limpopo': 1.6, 'Sénégal': 1.4, 'Volta': 1.4,
                'El Bahr el Abyad': 1.8, 'El Bahr el Azraq': 1.8, 'Lualaba': 2.0, 'Ubangi': 1.4, 'Benue': 1.4, 'Bénoué': 1.4, 'Sanaga': 1.4, 'Chari': 1.4, 'Kasai': 1.4})
    labs = [('R. Nile', 31.5, 24, 0), ('R. Congo', 18.5, 2.2, 0), ('R. Niger', 2.5, 16.7, 0), ('R. Zambezi', 27.5, -15, 0), ('R. Orange', 21, -29.7, 0),
            ('R. Limpopo', 29.5, -21.8, 0), ('R. Senegal', -13.5, 16.8, 0), ('R. Volta', -0.5, 9.6, 0), ('R. Benue', 10, 8.2, 0), ('R. Sanaga', 11.3, 4.3, 0),
            ('L. Victoria', 36.5, -1.8, 0), ('L. Tanganyika', 25.5, -6.5, 0), ('L. Malawi', 36.2, -12.5, 0), ('L. Chad', 14.2, 14.2, 0), ('L. Volta', -3.5, 7.2, 0),
            ('Victoria Falls', 26, -18.8, 0), ('Blue Nile', 38.8, 12.6, 0), ('White Nile', 29.5, 10.5, 0)]
    for t, x, y, r in labs:
        ax.text(x, y, t, fontsize=8.5, fontweight='bold', color='#0B3D91', ha='center', transform=PC, zorder=9, path_effects=W)
    ax.plot(25.86, -17.92, 'o', ms=5, color='#C00000', transform=PC, zorder=9)
    for x, y, t in [(-12, 0, 'ATLANTIC\nOCEAN'), (45, -12, 'INDIAN\nOCEAN'), (20, 34.5, 'Mediterranean Sea')]:
        ax.text(x, y, t, fontsize=10, style='italic', fontweight='bold', color='#2E6DB4', ha='center', transform=PC, zorder=6)
    plt.savefig(OUT + 'africa_drainage.png', bbox_inches='tight', pad_inches=0.08, facecolor='white'); plt.close()


def africa_zones(kind):
    cs, land = africa_land()
    med = unary_union([P([(-10, 30.5), (-9.5, 33.5), (-6, 35.9), (10, 37.4), (11.2, 33.2), (5, 34.3), (0, 34.6), (-5, 33.8), (-8, 31)]),
                       P([(19.8, 32), (23, 33), (23.2, 32.2), (20, 31.4)]), P([(17.8, -31.5), (18.3, -34.5), (22, -34.2), (21.5, -33.2), (19, -32)])])
    mountain = unary_union([P([(36, 14.5), (39.5, 14.5), (40.5, 9.5), (42, 9), (39, 5), (35.5, 6), (35, 10)]), P([(34.5, 1.5), (37.9, 0.8), (37.9, -3.6), (35.5, -4), (34.5, -1)]),
                            P([(9.4, 5.3), (10.8, 6.9), (11.4, 6.1), (10, 4.6)]), P([(27, -28.6), (29.5, -28.4), (29.9, -30.2), (28, -30.7)]),
                            P([(-8, 31.2), (-5, 32.3), (0, 33.5), (2, 34.3), (-2, 34.4), (-6, 33.2)])])
    forest = unary_union([P([(8.5, 4.5), (10, 6), (12, 5.5), (15, 4.3), (18, 4.8), (24, 4.5), (29, 3.5), (30.5, 0), (29.5, -4), (24, -5.5), (18, -5.5), (13, -5), (11.5, -3), (9.2, -1), (9.3, 2.5)]),
                          P([(-13.8, 9.6), (-8, 8.4), (-3, 7.3), (-1.5, 6.2), (-3, 4.8), (-7.5, 4.2), (-11.5, 6.6)]), P([(4, 6.8), (8.5, 6.6), (9.5, 4.8), (6, 4.2)]),
                          P([(47.5, -13), (50.5, -15.5), (48.5, -22), (47.4, -25), (47, -22), (48.8, -15.5)])])
    desert = unary_union([SAHARA, NAMIB, P([(40, 15), (43, 12.5), (43.5, 11.5), (51.5, 11.8), (50, 8), (47, 5.5), (45, 5), (42, 7), (40.5, 10)])])
    semi = unary_union([SAHEL, P([(12, -15), (16, -15), (22, -17), (26, -19), (27.5, -22), (28, -27), (25, -30), (20, -31), (17.5, -29), (15, -26), (13, -19)]),
                        P([(38.5, 15.5), (43, 12.5), (51.5, 12), (51.5, 8), (48, 3), (42, -1.5), (40, 1.5), (40, 6), (38, 9)]),
                        P([(-10, 30.5), (-8, 31), (-5, 33.8), (0, 34.6), (5, 34.3), (11.2, 33.2), (10, 31.5), (0, 31), (-8, 29)])]).difference(desert)
    temperate = box(-20, -36, 52, -26.5).intersection(land).difference(unary_union([med, mountain, semi, desert]))
    savanna = box(-20, -27, 52, 16).intersection(land).difference(unary_union([med, mountain, forest, desert, semi, temperate]))
    if kind == 'climate':
        title = 'AFRICA: MAIN CLIMATIC ZONES (SIMPLIFIED)'
        cls = [(forest, '#1E7B34', 'Equatorial (hot and wet all year)'), (savanna, '#9CCB5B', 'Tropical (wet and dry seasons)'), (semi, '#E8D57A', 'Semi-arid (short rainy season)'),
               (desert, '#E3A857', 'Hot desert'), (med, '#D96C6C', 'Mediterranean (dry summer, wet winter)'), (mountain, '#8C6BB1', 'Mountain (cooler with altitude)'),
               (temperate, '#6BAED6', 'Warm temperate')]
        fname = 'africa_climate.png'
    else:
        title = 'AFRICA: MAIN VEGETATION ZONES (SIMPLIFIED)'
        cls = [(forest, '#1E7B34', 'Equatorial rainforest'), (savanna, '#9CCB5B', 'Savanna (tropical grassland)'), (semi, '#E8D57A', 'Semi-desert scrub and steppe'),
               (desert, '#E3A857', 'Desert'), (med, '#D96C6C', 'Mediterranean vegetation'), (mountain, '#8C6BB1', 'Mountain vegetation'), (temperate, '#6BAED6', 'Temperate grassland (veld)')]
        fname = 'africa_vegetation.png'
    fig, ax = africa_axes(title)
    for n, g in cs:
        ax.add_geometries([g], PC, facecolor='#EEEEEE', edgecolor='#BBB', linewidth=0.3)
    for geom, col, lab in cls:
        ax.add_geometries([geom.intersection(land)], PC, facecolor=col, edgecolor='none', zorder=2)
    for n, g in cs:
        ax.add_geometries([g], PC, facecolor='none', edgecolor='#FFFFFF', linewidth=0.3, alpha=0.6, zorder=3)
    ax.plot([-19, 52], [0, 0], color='#1C3F6E', lw=0.8, ls='--', transform=PC, zorder=4); ax.text(-18.5, 0.6, 'Equator', fontsize=8.5, color='#1C3F6E', fontweight='bold', transform=PC, zorder=6, path_effects=W)
    ax.plot(13.4, 9.3, 'o', ms=6, color='#990011', mec='black', transform=PC, zorder=8); ax.text(14.1, 9.0, 'Garoua', fontsize=9, fontweight='bold', transform=PC, zorder=9, path_effects=W)
    ax.legend(handles=[Patch(facecolor=c, label=l) for g, c, l in cls], loc='lower left', fontsize=8.8, framealpha=0.95)
    plt.savefig(OUT + fname, bbox_inches='tight', pad_inches=0.08, facecolor='white'); plt.close()


# ---------------- climate graphs ----------------
def climate_graph(fname, title, months_t, rain, t_lines, ylim_t, ylim_r, note, annot=None):
    m = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D']
    if rain is None:
        fig, a1 = plt.subplots(figsize=(9, 5.6), dpi=200); a2 = None
    else:
        fig, (a1, a2) = plt.subplots(2, 1, figsize=(9, 7.4), dpi=200, sharex=True, gridspec_kw={'height_ratios': [1.1, 1], 'hspace': 0.12})
    x = np.arange(12)
    for lab, vals, col in t_lines:
        a1.plot(x, vals, color=col, lw=2.5, marker='o', ms=7, mec='white', mew=1.3, label=lab)
    if len(t_lines) > 1:
        a1.legend(loc='upper left', fontsize=10.5, frameon=False)
    a1.set_ylim(*ylim_t); a1.set_ylabel('Temperature (°C)', fontsize=12, fontweight='bold')
    a1.set_title(title, fontsize=14, fontweight='bold', color='#990011', loc='left')
    if annot:
        for (xy, xyt, t) in annot:
            a1.annotate(t, xy=xy, xytext=xyt, fontsize=10.5, fontweight='bold', arrowprops=dict(arrowstyle='-', lw=1))
    if a2 is not None:
        a2.bar(x, rain, color='#2E6DB4', width=0.7, edgecolor='white', linewidth=2)
        for i, v in enumerate(rain):
            a2.text(i, v + ylim_r[1] * 0.02, f'{v:.0f}', ha='center', fontsize=10, color='#333')
        a2.set_ylim(*ylim_r); a2.set_ylabel('Rainfall (mm)', fontsize=12, fontweight='bold')
    last = a2 if a2 is not None else a1
    last.set_xticks(x); last.set_xticklabels(m, fontsize=12, fontweight='bold')
    for a in [a for a in (a1, a2) if a is not None]:
        a.spines[['top', 'right']].set_visible(False); a.grid(axis='y', color='#E3E3E3', lw=0.8); a.set_axisbelow(True)
    fig.text(0.99, 0.01, note, ha='right', fontsize=9.5, color='#555')
    plt.savefig(OUT + fname, bbox_inches='tight', pad_inches=0.12, facecolor='white'); plt.close()


def graphs():
    climate_graph('aswan_climate.png', 'ASWAN (EGYPT): A HOT DESERT CLIMATE',
                  None, None,
                  [('Mean daily maximum', [23.2, 25.9, 30.3, 35.5, 39.5, 41.6, 41.9, 41.9, 40.0, 36.4, 29.8, 24.5], '#C0392B'),
                   ('Mean daily minimum', [10.0, 11.7, 15.5, 20.1, 24.6, 26.7, 27.8, 27.9, 25.5, 22.3, 16.2, 11.4], '#2E6DB4')],
                  (0, 48), (0, 20), 'Rainfall: about 2 mm per year, so no rainfall graph is needed. Data: NOAA normals 1991–2020.',
                  annot=[((6, 41.9), (7.3, 45.5), 'Hot days: 42 °C in July'), ((6, 27.8), (7.4, 17.5), 'Nights about 14 °C cooler')])
    climate_graph('london_climate.png', 'LONDON (UK): A COOL TEMPERATE OCEANIC CLIMATE',
                  None, [59.9, 45.4, 39.0, 43.6, 44.6, 49.7, 45.2, 55.1, 51.9, 67.9, 66.0, 59.2],
                  [('Mean monthly temperature', [5.3, 5.6, 7.7, 10.1, 13.3, 16.2, 18.5, 18.2, 15.4, 11.9, 8.0, 5.6], '#C0392B')],
                  (0, 25), (0, 90), 'Annual rainfall: about 630 mm, spread over the whole year. Data: Met Office, Kew Gardens 1991–2020.',
                  annot=[((6, 18.5), (7.5, 22.5), 'Mild summer: 18.5 °C'), ((0, 5.3), (1.2, 1.5), 'Cool winter: 5 °C')])


# ---------------- simple diagrams ----------------
def canvas(w, h, bg='#EAF4FB'):
    fig, ax = plt.subplots(figsize=(w, h), dpi=200)
    ax.set_xlim(0, w); ax.set_ylim(0, h); ax.set_aspect('equal'); ax.axis('off')
    ax.add_patch(Rectangle((0, 0), w, h, color=bg, zorder=0)); return fig, ax


def lab(ax, x, y, t, fs=13, c='#1A1A1A', ha='center'):
    ax.text(x, y, t, fontsize=fs, fontweight='bold', color=c, ha=ha, va='center', path_effects=W, zorder=9)


def savanna_diagram():
    fig, ax = canvas(13, 6.4)
    ax.add_patch(Rectangle((0, 0), 13, 1.3, color='#C9A15A', zorder=1))
    rng = np.random.default_rng(5)
    for x in np.arange(0.1, 13, 0.18):  # tall grass tufts
        hgt = rng.uniform(1.0, 1.6)
        for dx in (-0.06, 0, 0.06):
            ax.plot([x, x + dx * 3], [1.3, 1.3 + hgt], color='#B8A040', lw=1.6, zorder=3)
    # acacia (umbrella)
    def acacia(x, s=1):
        ax.plot([x, x - 0.15 * s, x + 0.2 * s], [1.3, 2.9 * s + 0.2, 3.2 * s], color='#5A3A1A', lw=5, zorder=4)
        ax.add_patch(Ellipse((x, 3.4 * s), 2.8 * s, 0.7 * s, color='#5E8C31', zorder=5))
    def baobab(x):
        ax.add_patch(MPoly([(x - 0.55, 1.3), (x - 0.4, 3.3), (x + 0.4, 3.3), (x + 0.55, 1.3)], color='#8A6A50', zorder=4))
        for dx, dy in [(-1, 0.7), (-0.5, 1.0), (0.3, 1.0), (0.9, 0.6)]:
            ax.plot([x + dx * 0.3, x + dx], [3.3, 3.3 + dy], color='#8A6A50', lw=4, zorder=4)
            ax.add_patch(Circle((x + dx, 3.3 + dy), 0.22, color='#6E9A3A', zorder=5))
    acacia(2.2); acacia(10.8, 0.9); baobab(6.6)
    lab(ax, 2.2, 4.4, 'Acacia: umbrella-shaped crown,\nsmall leaves and thorns', 11.5)
    lab(ax, 6.6, 5.5, 'Baobab: thick trunk\nthat stores water', 11.5)
    lab(ax, 10.8, 4.2, 'Trees far apart', 11.5)
    lab(ax, 6.5, 0.65, 'Tall grasses (up to 3 m), green in the wet season, dry and yellow in the dry season', 11)
    ax.text(6.5, 6.1, 'THE VEGETATION OF THE TROPICAL GRASSLAND (SAVANNA)', fontsize=16, fontweight='bold', color='#990011', ha='center')
    plt.savefig(OUT + 'savanna_vegetation.png', bbox_inches='tight', pad_inches=0.05); plt.close()


def oasis_layers():
    fig, ax = canvas(12, 6.4)
    ax.add_patch(Rectangle((0, 0), 12, 1.2, color='#D8B878', zorder=1))
    for x in [0.8, 3.0, 5.2, 7.4]:  # date palms
        ax.plot([x, x + 0.1], [1.2, 5.0], color='#6B4A2A', lw=6, zorder=3)
        for ang in np.linspace(15, 165, 7):
            a = np.radians(ang); ax.plot([x + 0.1, x + 0.1 + 1.0 * np.cos(a)], [5.0, 5.0 + 0.5 * np.sin(a) - 0.25], color='#2E8B3A', lw=4, zorder=4)
    for x in [1.9, 4.1, 6.3]:  # fruit trees
        ax.plot([x, x], [1.2, 2.4], color='#6B4A2A', lw=4, zorder=3); ax.add_patch(Circle((x, 2.8), 0.6, color='#4F9A3A', zorder=4))
        for dx, dy in [(-0.2, 0.1), (0.25, -0.1), (0, 0.35)]:
            ax.add_patch(Circle((x + dx, 2.8 + dy), 0.08, color='#E0752A', zorder=5))
    for x in np.arange(0.3, 12, 0.35):  # vegetables
        ax.add_patch(Ellipse((x, 1.35), 0.25, 0.3, color='#7CC24A', zorder=3))
    ax.add_patch(Rectangle((0, 0.55), 12, 0.25, color='#3A86D6', zorder=2))
    lab(ax, 10.2, 5.0, '1. Date palms\n(top layer)', 12.5, '#1B5A2A', 'center')
    lab(ax, 10.2, 3.2, '2. Fruit trees: citrus,\nfigs, pomegranates\n(middle layer)', 12, '#1B5A2A')
    lab(ax, 10.2, 1.75, '3. Vegetables, wheat,\nbarley (ground layer)', 12, '#1B5A2A')
    lab(ax, 6, 0.3, 'Irrigation channel bringing water from a well or spring', 11, '#0B3D91')
    ax.text(6, 6.2, 'FARMING IN AN OASIS: THREE LAYERS OF CROPS', fontsize=16, fontweight='bold', color='#990011', ha='center')
    plt.savefig(OUT + 'oasis_layers.png', bbox_inches='tight', pad_inches=0.05); plt.close()


def sectors_chain():
    fig, ax = canvas(13.5, 5.4, 'white')
    boxes = [('PRIMARY', 'Farmers grow\ncotton in the\nNorth Region', '#6AA84F'), ('SECONDARY', 'Factories gin the\ncotton (SODECOTON)\nand weave cloth\n(CICAM, Garoua)', '#E69138'),
             ('TERTIARY', 'Transporters and\ntraders sell the\ncloth in markets', '#3D85C6'), ('QUATERNARY', 'Researchers create\nbetter cotton seeds\nand share information', '#8E7CC3')]
    for i, (t, d, c) in enumerate(boxes):
        x = 0.3 + i * 3.35
        ax.add_patch(FancyBboxPatch((x, 1.0), 2.9, 3.0, boxstyle='round,pad=0.05,rounding_size=0.2', fc=c, ec='none', zorder=2))
        ax.text(x + 1.45, 3.45, t, fontsize=14, fontweight='bold', color='white', ha='center', zorder=3)
        ax.text(x + 1.45, 2.1, d, fontsize=11, color='white', ha='center', va='center', fontweight='bold', zorder=3)
        if i < 3:
            ax.add_patch(FancyArrowPatch((x + 2.95, 2.5), (x + 3.35, 2.5), arrowstyle='-|>', mutation_scale=22, color='#555', lw=2.5, zorder=4))
    ax.text(6.75, 4.75, 'THE SECTORS OF THE ECONOMY: THE EXAMPLE OF COTTON', fontsize=15, fontweight='bold', color='#990011', ha='center')
    ax.text(6.75, 0.45, 'Extract → Transform → Serve → Research and information', fontsize=12, color='#333', ha='center', style='italic')
    plt.savefig(OUT + 'sectors_chain.png', bbox_inches='tight', pad_inches=0.05); plt.close()


if __name__ == '__main__':
    import sys
    todo = sys.argv[1:] or ['all']
    fns = {'deserts': deserts_world, 'temperate': temperate_world, 'loc': africa_location, 'relief': africa_relief, 'drain': africa_drainage,
           'clim': lambda: africa_zones('climate'), 'veg': lambda: africa_zones('vegetation'), 'graphs': graphs, 'sav': savanna_diagram, 'oasis': oasis_layers, 'sect': sectors_chain}
    for k, f in fns.items():
        if 'all' in todo or k in todo:
            f(); print('done', k)
