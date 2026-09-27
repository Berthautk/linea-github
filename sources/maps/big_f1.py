"""Big-label diagrams for Form 1 (2023 syllabus)."""
from big_common import *
from images2 import LAND110


def boxes(ax, x, y, w, h, t, c, fs=24, tc='white'):
    ax.add_patch(FancyBboxPatch((x, y), w, h, boxstyle='round,pad=0.05', fc=c, ec='#333', lw=2, zorder=3))
    ax.text(x + w / 2, y + h / 2, t, fontsize=fs, fontweight='bold', ha='center', va='center', color=tc, zorder=4)


def geography_branches_big():
    fig, ax = canvas('white')
    boxes(ax, 4.4, 3.9, 4.0, 0.9, 'GEOGRAPHY', NAVY, 30)
    items = [(0.3, '#2E7D32', 'PHYSICAL', 'relief, climate,\nsoils, vegetation,\nrivers'),
             (4.55, '#E65100', 'HUMAN', 'population,\nsettlements, farming,\nindustry, trade'),
             (8.8, '#6A1B9A', 'PRACTICAL', 'maps, graphs,\nstatistics,\nfieldwork')]
    for x, c, t, d in items:
        boxes(ax, x, 2.35, 3.7, 0.85, t, c, 26)
        ax.text(x + 1.85, 1.15, d, fontsize=21, fontweight='bold', ha='center', va='center', color=c)
        arrow(ax, (6.4, 3.85), (x + 1.85, 3.25), c='#555', lw=3, ms=25)
    save(fig, 'geography_branches_big.png')


def solar_system_big():
    fig, ax = canvas('#0B1026')
    ax.add_patch(Circle((-0.6, 2.5), 2.0, color='#FFB300', zorder=3))
    ax.text(0.45, 0.25, 'SUN', fontsize=26, fontweight='bold', color='#FFE082', ha='center')
    pl = [('Mercury', 0.12, '#9E9E9E'), ('Venus', 0.2, '#FFCC80'), ('Earth', 0.22, '#42A5F5'), ('Mars', 0.16, '#E53935'),
          ('Jupiter', 0.55, '#D7A86E'), ('Saturn', 0.46, '#E6C98A'), ('Uranus', 0.32, '#80DEEA'), ('Neptune', 0.31, '#3F51B5')]
    xs = [2.2, 2.95, 3.75, 4.55, 5.85, 7.55, 9.25, 10.95]
    for (n, r, c), x in zip(pl, xs):
        ax.add_patch(Circle((x, 2.5), r, color=c, zorder=3))
        if n == 'Saturn': ax.add_patch(Ellipse((x, 2.5), 1.35, 0.3, fill=False, ec='#E6C98A', lw=3, zorder=4))
        y = 3.25 if xs.index(x) % 2 == 0 else 1.55
        ax.text(x, y + (0.35 if y > 2.5 else -0.35), n, fontsize=19, fontweight='bold', color='#FF8A80' if n == 'Earth' else 'white', ha='center', va='center')
    save(fig, 'solar_system_big.png')


def continents_oceans_big():
    ext = (-170, 179.9, -60, 80); fig, ax = map_axes(ext, (12.8, 5.4)); ax.set_position([0, 0, 1, 1])
    for x, y, t in [(-100, 45, 'NORTH\nAMERICA'), (-58, -15, 'SOUTH\nAMERICA'), (18, 5, 'AFRICA'), (15, 52, 'EUROPE'), (95, 50, 'ASIA'), (134, -25, 'AUSTRALIA'), (60, -70, 'ANTARCTICA')]:
        mlab(ax, x, y, t, fs=18, c='#1B5E20')
    for x, y, t in [(-150, 5, 'PACIFIC\nOCEAN'), (-30, 25, 'ATLANTIC\nOCEAN'), (78, -25, 'INDIAN\nOCEAN'), (0, 76, 'ARCTIC OCEAN')]:
        mlab(ax, x, y, t, fs=18, c='#0D47A1')
    msave(fig, 'continents_oceans_big.png')


def map_marginal_big():
    fig, ax = canvas('white')
    ax.add_patch(Rectangle((3.2, 0.35), 6.4, 4.3, fill=False, ec='#222', lw=3, zorder=3))
    ax.add_patch(Rectangle((3.35, 0.5), 6.1, 4.0, color='#E8F5E9', zorder=1))
    for i in range(1, 6): ax.plot([3.35 + i * 1.02, 3.35 + i * 1.02], [0.5, 4.5], color='#90A4AE', lw=1, zorder=2)
    for i in range(1, 4): ax.plot([3.35, 9.45], [0.5 + i * 1.0, 0.5 + i * 1.0], color='#90A4AE', lw=1, zorder=2)
    ax.plot([5.4, 6.4, 7.4, 9.2], [0.55, 2.0, 1.6, 3.9], color='#1E88E5', lw=4, zorder=4)
    ax.text(6.4, 4.8, 'TITLE: Map of a village', fontsize=20, fontweight='bold', ha='center', color=NAVY)
    parts = [(1.6, 4.2, 'TITLE'), (1.6, 3.2, 'KEY'), (1.6, 2.2, 'SCALE'), (11.3, 0.9, 'NORTH ARROW'), (11.3, 3.6, 'GRID LINES'), (11.3, 2.2, 'FRAME')]
    for x, y, t in parts: lab(ax, x, y, t, fs=20, c=RED)
    arrow(ax, (2.45, 4.2), (4.0, 4.78), c=RED, lw=2.5, ms=20); arrow(ax, (2.2, 3.2), (3.6, 3.2), c=RED, lw=2.5, ms=20)
    arrow(ax, (2.45, 2.2), (3.9, 1.05), c=RED, lw=2.5, ms=20); arrow(ax, (10.0, 0.9), (9.1, 0.9), c=RED, lw=2.5, ms=20)
    arrow(ax, (10.1, 3.6), (8.45, 3.5), c=RED, lw=2.5, ms=20); arrow(ax, (10.5, 2.2), (9.6, 2.2), c=RED, lw=2.5, ms=20)
    ax.add_patch(Rectangle((3.6, 2.85), 1.5, 0.75, color='white', ec='#333', lw=1.5, zorder=5))
    ax.text(4.35, 3.22, '— river\n▲ hill', fontsize=12, ha='center', va='center', zorder=6)
    ax.plot([3.7, 5.0], [0.9, 0.9], color='#222', lw=4, zorder=5); ax.text(4.35, 1.1, '0    1 km', fontsize=12, ha='center', zorder=6)
    ax.annotate('', xy=(8.9, 1.15), xytext=(8.9, 0.65), arrowprops=dict(arrowstyle='-|>', lw=3, color='#222'), zorder=6)
    ax.text(8.9, 1.25, 'N', fontsize=16, fontweight='bold', ha='center', zorder=6)
    save(fig, 'map_marginal_big.png')


def waste_sort_big():
    fig, ax = canvas('white')
    bins = [(0.4, '#43A047', 'BIODEGRADABLE', 'food peelings,\nleaves, paper', 'compost'),
            (4.6, '#1E88E5', 'RECYCLABLE', 'plastic bottles,\ncans, glass', 'recycling unit'),
            (8.8, '#757575', 'OTHER WASTE', 'broken objects,\nused sachets', 'dustbin / landfill')]
    for x, c, t, d, dest in bins:
        ax.add_patch(Polygon([(x + 0.3, 0.4), (x + 3.3, 0.4), (x + 3.6, 3.2), (x, 3.2)], closed=True, fc=c, ec='#333', lw=2, zorder=3))
        ax.add_patch(Rectangle((x - 0.1, 3.2), 3.8, 0.3, color='#333', zorder=3))
        ax.text(x + 1.8, 2.75, t, fontsize=20, fontweight='bold', color='white', ha='center', zorder=4)
        ax.text(x + 1.8, 1.65, d, fontsize=19, fontweight='bold', color='white', ha='center', va='center', zorder=4)
        ax.text(x + 1.8, 4.1, '→ ' + dest, fontsize=20, fontweight='bold', color=c, ha='center')
    save(fig, 'waste_sort_big.png')


if __name__ == '__main__':
    for f in (geography_branches_big, solar_system_big, continents_oceans_big, map_marginal_big, waste_sort_big): f()
    print('done')


def garoua_data_big():
    t = [26.0, 28.9, 32.2, 33.0, 30.7, 28.2, 26.6, 26.4, 26.7, 28.1, 27.3, 26.0]; r = [0, 0, 2, 44, 108, 135, 205, 248, 190, 63, 2, 0]
    m = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D']
    fig, ax = canvas('white')
    rows = [('Month', m, NAVY, 'white'), ('Temp. (°C)', [f'{v:.0f}' for v in t], '#FDECEA', RED), ('Rain (mm)', [str(v) for v in r], '#E3F2FD', '#0D47A1')]
    x0, w0, w, h = 0.2, 2.3, 0.855, 0.95
    for i, (name, vals, bg, fg) in enumerate(rows):
        y = 3.7 - i * h
        ax.add_patch(Rectangle((x0, y), w0, h, fc=bg if i else NAVY, ec='#90A4AE', lw=1.5))
        ax.text(x0 + w0 / 2, y + h / 2, name, fontsize=20, fontweight='bold', ha='center', va='center', color='white' if i == 0 else fg)
        for k, v in enumerate(vals):
            ax.add_patch(Rectangle((x0 + w0 + k * w, y), w, h, fc=bg, ec='#90A4AE', lw=1.5))
            ax.text(x0 + w0 + k * w + w / 2, y + h / 2, v, fontsize=20, fontweight='bold', ha='center', va='center', color=fg)
    ax.text(W_ / 2, 0.45, 'Garoua: monthly averages (approximate)', fontsize=20, fontweight='bold', color=RED, ha='center')
    save(fig, 'garoua_data_big.png')
