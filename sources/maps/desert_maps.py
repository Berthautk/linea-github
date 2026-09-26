import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patheffects as pe
import cartopy.crs as ccrs
from shapely.geometry import Polygon, box
from shapely.ops import unary_union
from render import load

PC = ccrs.PlateCarree()
W = [pe.withStroke(linewidth=2.5, foreground='white')]
OUT = '/home/claude/f4/img/'

SAHARA = Polygon([(-17.5, 21), (-16.5, 26), (-10, 28.5), (-4, 30.5), (2, 31.5), (7, 32.5), (10, 33.2), (12, 32), (15, 31), (19, 30.3), (21, 31.6),
                  (25, 31.2), (29, 30.8), (32.5, 30.5), (34, 28), (35.5, 24), (37.5, 19), (36, 17), (33, 16), (25, 15.8), (15, 15.2),
                  (5, 16.3), (-5, 16.8), (-12, 17.3), (-16.5, 18.2)])
SAHEL = Polygon([(-16.5, 18.2), (-12, 17.3), (-5, 16.8), (5, 16.3), (15, 15.2), (25, 15.8), (33, 16), (36, 17), (38.5, 15), (38, 12.5),
                 (33, 12), (25, 11.5), (20, 11.2), (16, 10.4), (13.5, 10.6), (10, 12), (3, 12.3), (-5, 12.6), (-12, 12.8), (-17.5, 13.8)])
KALAHARI = Polygon([(18.5, -18.5), (22, -17.3), (25.5, -18.8), (27.2, -21.5), (26.5, -25.5), (24.5, -27.8), (21, -28.6), (18.7, -26.5), (18.3, -22)])
NAMIB = Polygon([(11.7, -15.2), (12.8, -15.2), (14.2, -19.5), (15.4, -23.3), (16.2, -26.5), (16.6, -28.6), (16.3, -29.4), (15.4, -28.3),
                 (14.6, -25.5), (14.0, -22.5), (13.0, -19.5)])


def base(ax, cs, highlight_cmr=True):
    ax.set_facecolor('#CFE6F5')
    for nm, g in cs:
        fc = '#F2EFE6'
        if nm == 'Cameroon' and highlight_cmr:
            fc = '#F4B6B0'
        ax.add_geometries([g], PC, facecolor=fc, edgecolor='#9A9A9A', linewidth=0.4, zorder=1)


def africa_extent():
    ext = box(-26, -38, 56, 41)
    return [(n, g) for n, g in load('countries50.geojson') if g.intersects(ext) and (g.bounds[2] - g.bounds[0]) < 150]


def deserts_map():
    cs = africa_extent()
    land = unary_union([g for n, g in cs])
    fig = plt.figure(figsize=(8, 8.4), dpi=220)
    ax = plt.axes(projection=PC)
    ax.set_extent([-19, 52, -36, 38], crs=PC)
    base(ax, cs)
    for poly, col, hatch in [(SAHARA, '#E9B96E', None), (SAHEL, '#F6E19A', '..'), (KALAHARI, '#E9B96E', None), (NAMIB, '#D9924A', None)]:
        ax.add_geometries([poly.intersection(land)], PC, facecolor=col, edgecolor='#8A5A20', linewidth=0.6, hatch=hatch, alpha=0.9, zorder=2)
    for nm, g in cs:
        if nm == 'Cameroon':
            ax.add_geometries([g], PC, facecolor='none', edgecolor='#990011', linewidth=1.8, zorder=4)
    ax.text(8, 24, 'SAHARA DESERT', fontsize=17, fontweight='bold', color='#6B3A0A', ha='center', transform=PC, zorder=6, path_effects=W)
    ax.text(0, 14.0, 'S  A  H  E  L', fontsize=12, fontweight='bold', color='#7A5A00', ha='center', transform=PC, zorder=6, path_effects=W)
    ax.text(23.5, -23.5, 'KALAHARI\nDESERT', fontsize=11, fontweight='bold', color='#6B3A0A', ha='center', transform=PC, zorder=6, path_effects=W)
    ax.text(8.2, -24.5, 'NAMIB\nDESERT', fontsize=11, fontweight='bold', color='#6B3A0A', ha='center', transform=PC, zorder=6, path_effects=W)
    ax.annotate('', xy=(14.6, -22.8), xytext=(10.5, -23.3), xycoords=PC._as_mpl_transform(ax), arrowprops=dict(arrowstyle='-', color='#6B3A0A', lw=1.2), zorder=6)
    # Cameroon, Garoua, Maroua
    ax.plot(13.40, 9.30, 'o', ms=6, color='#990011', mec='black', transform=PC, zorder=7)
    ax.text(12.9, 8.6, 'Garoua', fontsize=10, fontweight='bold', ha='right', transform=PC, zorder=7, path_effects=W)
    ax.text(15.3, 5.0, 'CAMEROON', fontsize=9, fontweight='bold', color='#990011', ha='left', transform=PC, zorder=7, path_effects=W)
    # Harmattan
    ax.annotate('', xy=(12.8, 11.2), xytext=(24, 22), xycoords=PC._as_mpl_transform(ax),
                arrowprops=dict(arrowstyle='-|>', color='#1C3F6E', lw=3.5, mutation_scale=26), zorder=8)
    ax.text(20.5, 18.6, 'Harmattan\n(from the NE)', fontsize=10, fontweight='bold', color='#1C3F6E', ha='left', transform=PC, zorder=8, path_effects=W)
    for x, y, t in [(-15, 0, 'ATLANTIC\nOCEAN'), (45, -12, 'INDIAN\nOCEAN'), (26, 33.6, 'Mediterranean Sea')]:
        ax.text(x, y, t, fontsize=10, style='italic', fontweight='bold', color='#2E6DB4', ha='center', transform=PC, zorder=5)
    ax.text(-4, -0.9, 'Equator', fontsize=8.5, style='italic', color='#2E6DB4', transform=PC, zorder=5)
    ax.plot([-19, 52], [0, 0], color='#2E6DB4', lw=0.8, ls='--', transform=PC, zorder=3)
    ax.text(-18.3, 36.6, 'AFRICA: HOT DESERTS AND THE SAHEL', fontsize=13, fontweight='bold', color='#990011', transform=PC, zorder=9, path_effects=W)
    # legend
    from matplotlib.patches import Patch
    hs = [Patch(facecolor='#E9B96E', edgecolor='#8A5A20', label='Hot desert (approximate extent)'),
          Patch(facecolor='#F6E19A', edgecolor='#8A5A20', hatch='..', label='Sahel: semi-arid belt'),
          Patch(facecolor='#F4B6B0', edgecolor='#990011', label='Cameroon')]
    ax.legend(handles=hs, loc='lower left', fontsize=9.5, framealpha=0.95)
    ax.annotate('N', xy=(48.5, 34), xytext=(48.5, 28.5), xycoords=PC._as_mpl_transform(ax), ha='center', fontsize=12, fontweight='bold',
                arrowprops=dict(arrowstyle='-|>', color='black', lw=2), zorder=9)
    plt.savefig(OUT + 'africa_deserts.png', bbox_inches='tight', pad_inches=0.1, facecolor='white')
    plt.close()


def resources_map():
    cs = africa_extent()
    land = unary_union([g for n, g in cs])
    fig = plt.figure(figsize=(9, 6.2), dpi=220)
    ax = plt.axes(projection=PC)
    ax.set_extent([-18, 40, 12, 37.5], crs=PC)
    base(ax, cs, highlight_cmr=False)
    ax.add_geometries([SAHARA.intersection(land)], PC, facecolor='#EDC98A', edgecolor='#8A5A20', linewidth=0.6, alpha=0.85, zorder=2)
    for nm, g in cs:
        if nm in ('Algeria', 'Libya', 'Egypt', 'Mali', 'Niger', 'Chad', 'Mauritania', 'Morocco', 'Sudan', 'Tunisia'):
            p = g.representative_point()
            off = {'Algeria': (1, -1.5), 'Libya': (0, -1.5), 'Egypt': (-1, -2.5), 'Niger': (1, -2.5), 'Mali': (0, -1.5),
                   'Morocco': (-2.2, 2.3), 'Mauritania': (0, 0), 'Chad': (0.5, -2.5), 'Sudan': (0, -2), 'Tunisia': (0.6, 0.5)}.get(nm, (0, 0))
            ax.text(p.x + off[0], p.y + off[1], nm.upper(), fontsize=8.5, fontweight='bold', color='#555555', ha='center', transform=PC, zorder=5)
    items = [
        (6.07, 31.68, 'D', '#1A1A1A', 'Oil: Hassi Messaoud'),
        (20.0, 28.8, 'D', '#1A1A1A', 'Oil & gas: Libya'),
        (7.35, 18.74, '^', '#7B2CBF', 'Uranium: Arlit'),
        (-12.85, 26.3, 's', '#2E7D32', 'Phosphates: Bou Craa'),
        (12.92, 18.69, 'o', '#FFFFFF', 'Salt: Bilma'),
        (-6.86, 30.99, '*', '#F2A900', 'Solar power: Noor Ouarzazate'),
        (25.52, 29.2, 'P', '#1B8A3A', 'Oasis: Siwa'),
    ]
    for x, y, m, c, t in items:
        ax.plot(x, y, m, ms=13 if m == '*' else 10, color=c, mec='black', mew=1, transform=PC, zorder=8)
    lab = {'Oil: Hassi Messaoud': (6.9, 32.3, 'left'), 'Oil & gas: Libya': (20.8, 28.2, 'left'), 'Uranium: Arlit': (6.6, 19.6, 'right'),
           'Phosphates: Bou Craa': (-12.2, 25.3, 'left'), 'Salt: Bilma': (13.7, 18.2, 'left'), 'Solar power: Noor Ouarzazate': (-6.0, 29.7, 'left'),
           'Oasis: Siwa': (26.3, 29.8, 'left')}
    for (x, y, m, c, t) in items:
        lx, ly, ha = lab[t]
        ax.text(lx, ly, t, fontsize=9.5, fontweight='bold', ha=ha, transform=PC, zorder=9, path_effects=W)
    # Nile valley
    ax.plot([31.2, 30.8, 31.2, 32.6, 32.9, 31.3], [30.0, 28.0, 27.2, 25.7, 24.1, 21.8], color='#1B8A3A', lw=4, alpha=0.8, transform=PC, zorder=6)
    ax.text(33.6, 25.0, 'Irrigated\nNile valley\n(Egypt)', fontsize=9.5, fontweight='bold', color='#1B6A2A', transform=PC, zorder=9, path_effects=W)
    ax.text(-17.3, 36.3, 'SOME RESOURCES OF THE SAHARA', fontsize=13, fontweight='bold', color='#990011', transform=PC, zorder=9, path_effects=W)
    plt.savefig(OUT + 'sahara_resources.png', bbox_inches='tight', pad_inches=0.1, facecolor='white')
    plt.close()


if __name__ == '__main__':
    import os
    os.makedirs(OUT, exist_ok=True)
    deserts_map()
    resources_map()
    print('ok')
