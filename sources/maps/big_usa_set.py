"""Big-label diagrams for Upper Sixth Settlement Geography (Module 5). Values marked approximate are rounded for teaching."""
import sys
from big_common import *
from big_usa_pop import box_, table_big, regions, cm_base
SKY = '#DDEFFB'; GR = '#F1F8E9'


def house(ax, x, y, s=0.25, c='#8D6E63'):
    ax.add_patch(Rectangle((x - s / 2, y - s / 2), s, s * 0.8, color=c, zorder=6)); ax.add_patch(Polygon([(x - s * 0.65, y + s * 0.3), (x + s * 0.65, y + s * 0.3), (x, y + s * 0.85)], color='#5D4037', zorder=6))


def evolution_big():
    fig, ax = canvas('white')
    st = [('Camp', 'hunters and\ngatherers', '#A1887F'), ('Hamlet', 'a few farm\nhouses', '#8D6E63'), ('Village', 'farming,\nmarket', '#6D4C41'), ('Town', 'trade, services,\nadministration', '#1565C0'), ('City', 'industry, many\nfunctions', NAVY)]
    for i, (n, s, c) in enumerate(st):
        x = 0.3 + i * 2.5; h = 0.5 + i * 0.5
        ax.add_patch(Rectangle((x, 1.2), 2.3, h, color=c)); ax.text(x + 1.15, 1.2 + h + 0.25, n, fontsize=21, fontweight='bold', ha='center', color=c)
        ax.text(x + 1.15, 0.6, s, fontsize=14, fontweight='bold', ha='center', va='center', color='#333')
    arrow(ax, (0.4, 4.45), (12.4, 4.45), c=RED, lw=4); ax.text(6.4, 4.62, 'time: more people, more functions', fontsize=15, fontweight='bold', ha='center', color=RED)
    save(fig, 'evolution_big.png')


def site_types_big():
    fig, ax = canvas(GR); H = 1.75
    def panel(x0, y0, name, kind):
        ax.add_patch(Rectangle((x0, y0), 3.0, H, color='#E8F5E9', ec='#90A4AE', lw=2)); m = y0 + H * 0.45
        if kind == 'wet': ax.add_patch(Rectangle((x0, y0), 3.0, H, color='#FFE0B2')); ax.add_patch(Circle((x0 + 1.5, m), 0.3, color=BLUE))
        if kind == 'dry': ax.add_patch(Rectangle((x0, y0), 3.0, H, color='#B2EBF2')); ax.add_patch(Ellipse((x0 + 1.5, m), 1.4, 0.8, color='#C5E1A5'))
        if kind == 'hill': ax.add_patch(Polygon([(x0, y0), (x0 + 1.5, y0 + H * 0.7), (x0 + 3, y0)], color='#A1887F'))
        if kind == 'bridge': ax.add_patch(Rectangle((x0 + 1.2, y0), 0.6, H, color=BLUE)); ax.plot([x0 + 0.2, x0 + 2.8], [m, m], color='#424242', lw=4)
        if kind == 'gap':
            ax.add_patch(Polygon([(x0, y0), (x0, y0 + H), (x0 + 1.1, y0 + H), (x0 + 1.3, y0)], color='#8D6E63')); ax.add_patch(Polygon([(x0 + 1.7, y0), (x0 + 1.9, y0 + H), (x0 + 3, y0 + H), (x0 + 3, y0)], color='#8D6E63'))
            ax.plot([x0 + 1.5, x0 + 1.5], [y0, y0 + H], color='#424242', lw=4)
        if kind == 'confluence': ax.plot([x0 + 0.2, x0 + 1.5, x0 + 2.8], [y0 + H - 0.1, m, y0 + H - 0.1], color=BLUE, lw=5); ax.plot([x0 + 1.5, x0 + 1.5], [m, y0], color=BLUE, lw=7)
        up = H * 0.35 if kind == 'hill' else 0
        for dx, dy in [(-0.3, 0.1), (0.1, 0.25), (0.35, -0.05)]: house(ax, x0 + 1.5 + dx, m + dy + up, 0.2)
        ax.text(x0 + 1.5, y0 - 0.2, name, fontsize=15, fontweight='bold', ha='center', color=NAVY)
    for i, (n, k) in enumerate([('Wet point (water)', 'wet'), ('Dry point (above floods)', 'dry'), ('Defence (hilltop)', 'hill'), ('Bridging point', 'bridge')]): panel(0.2 + i * 3.15, 2.95, n, k)
    for i, (n, k) in enumerate([('Gap town', 'gap'), ('Confluence', 'confluence')]): panel(3.35 + i * 3.15, 0.5, n, k)
    save(fig, 'site_types_big.png')


def site_situation_big():
    fig, ax = canvas('white')
    ax.add_patch(Rectangle((0.3, 0.4), 5.6, 4.0, color='#E8F5E9')); ax.add_patch(Rectangle((0.3, 0.4), 1.6, 4.0, color=SEA if False else '#64B5F6'))
    for x, y in [(3.0, 2.2), (3.4, 2.6), (3.8, 2.1), (3.2, 1.7)]: house(ax, x, y, 0.3)
    ax.text(3.1, 4.6, 'SITE: the land the town is built on', fontsize=17, fontweight='bold', ha='center', color=NAVY); ax.text(1.1, 2.4, 'river\nbank', fontsize=15, fontweight='bold', ha='center', color='white')
    ax.add_patch(Rectangle((6.6, 0.4), 5.9, 4.0, color='#FFF8E1'))
    ax.add_patch(Circle((9.5, 2.4), 0.35, color=RED)); ax.text(9.5, 2.95, 'Town', fontsize=15, fontweight='bold', ha='center', color=RED)
    for (a, b) in [((6.8, 0.8), (9.5, 2.4)), ((12.3, 0.8), (9.5, 2.4)), ((9.5, 4.3), (9.5, 2.4)), ((6.8, 3.9), (9.5, 2.4))]: ax.plot(*zip(a, b), color='#424242', lw=3)
    ax.plot([6.8, 12.3], [1.6, 3.4], color='#64B5F6', lw=5)
    ax.text(9.55, 4.6, 'SITUATION: position in the region', fontsize=17, fontweight='bold', ha='center', color=NAVY)
    ax.text(9.55, 0.15, 'roads, river, other towns', fontsize=14, fontweight='bold', ha='center', color='#555')
    save(fig, 'site_situation_big.png')


def hierarchy_big():
    fig, ax = canvas('white')
    lv = [('Isolated dwelling', '1 house', '#A1887F'), ('Hamlet', 'under 100', '#8D6E63'), ('Village', '100–2,000', '#6D4C41'), ('Town', '2,000–100,000', '#1565C0'), ('City', 'over 100,000', '#0D47A1'), ('Conurbation', 'millions', NAVY)]
    for i, (n, p, c) in enumerate(lv):
        w = 12.0 - i * 1.6; y = 0.3 + i * 0.78
        ax.add_patch(Rectangle((6.4 - w / 2, y), w, 0.7, color=c)); ax.text(6.4, y + 0.35, f'{n}  ({p})', fontsize=16, fontweight='bold', ha='center', va='center', color='white')
    save(fig, 'hierarchy_big.png')


def shapes_big():
    fig, ax = canvas(GR); rng = np.random.default_rng(2)
    def panel(x0, y0, name, pts, roads=()):
        ax.add_patch(Rectangle((x0, y0), 2.9, 1.95, color='white', ec='#90A4AE', lw=1.5))
        for r in roads: ax.plot([x0 + r[0], x0 + r[2]], [y0 + r[1], y0 + r[3]], color='#9E9E9E', lw=3, zorder=3)
        for (px, py) in pts: house(ax, x0 + px, y0 + py, 0.15)
        ax.text(x0 + 1.45, y0 - 0.22, name, fontsize=15, fontweight='bold', ha='center', color=NAVY)
    panel(0.3, 2.75, 'Isolated', [(1.45, 1.0)]); panel(3.4, 2.75, 'Compact (nucleated)', [(1.45 + 0.35 * np.cos(a) * r, 1.0 + 0.3 * np.sin(a) * r) for r in (0, 1, 2) for a in np.linspace(0, 6.28, 6 + r * 2)[:-1]])
    panel(6.5, 2.75, 'Linear', [(0.3 + i * 0.3, 1.25) for i in range(9)] + [(0.3 + i * 0.3, 0.75) for i in range(9)], [(0.1, 1.0, 2.8, 1.0)])
    panel(9.6, 2.75, 'Loose-knit', [(rng.uniform(0.3, 2.6), rng.uniform(0.3, 1.7)) for _ in range(12)])
    panel(0.3, 0.3, 'T-shaped', [(0.3 + i * 0.35, 1.5) for i in range(8)] + [(1.25, 1.2 - i * 0.3) for i in range(4)] + [(1.65, 1.2 - i * 0.3) for i in range(4)], [(0.1, 1.3, 2.8, 1.3), (1.45, 0.05, 1.45, 1.3)])
    panel(3.4, 0.3, 'Cross-roads', [(0.35 + i * 0.3, 1.2) for i in range(4)] + [(1.75 + i * 0.3, 0.8) for i in range(4)] + [(1.2, 0.3 + i * 0.3) for i in range(2)] + [(1.7, 1.4 + i * 0.25) for i in range(2)], [(0.1, 1.0, 2.8, 1.0), (1.45, 0.05, 1.45, 1.9)])
    panel(6.5, 0.3, 'Ring (around a square)', [(1.45 + 0.75 * np.cos(a), 1.0 + 0.6 * np.sin(a)) for a in np.linspace(0, 6.28, 13)[:-1]])
    panel(9.6, 0.3, 'Planned (grid)', [(0.4 + i * 0.5, 0.4 + j * 0.45) for i in range(5) for j in range(3)], [(0.1, 0.62, 2.8, 0.62), (0.1, 1.07, 2.8, 1.07)])
    save(fig, 'shapes_big.png')


def patterns_big():
    fig, ax = canvas('white'); rng = np.random.default_rng(5)
    for k, (n, pts, c) in enumerate([('DISPERSED', [(rng.uniform(0.2, 2.6), rng.uniform(0.2, 2.6)) for _ in range(12)], GREEN),
                                       ('NUCLEATED', [(1.4 + rng.normal(0, 0.25), 1.4 + rng.normal(0, 0.25)) for _ in range(12)] + [(0.3, 2.4), (2.5, 0.4)], RED),
                                       ('LINEAR', [(0.2 + i * 0.22, 1.4 + rng.normal(0, 0.12)) for i in range(12)], BLUE),
                                       ('REGULAR / PLANNED', [(0.4 + i * 0.7, 0.4 + j * 0.7) for i in range(4) for j in range(4)], ORANGE)]):
        x0 = 0.3 + k * 3.15; ax.add_patch(Rectangle((x0, 0.9), 2.8, 2.8, color='#FAFAFA', ec='#90A4AE', lw=2))
        for px, py in pts: ax.plot(x0 + px, 0.9 + py, 'o', ms=10, color=c)
        ax.text(x0 + 1.4, 4.1, n, fontsize=17, fontweight='bold', ha='center', color=c)
    ax.text(6.4, 0.35, 'Each dot = one settlement', fontsize=17, fontweight='bold', ha='center', color='#555')
    save(fig, 'patterns_big.png')


def nna_scale_big():
    fig, ax = canvas('white')
    ax.add_patch(Rectangle((0.8, 2.3), 11.2, 0.5, color='#ECEFF1')); x = lambda r: 0.8 + r / 2.15 * 11.2
    for r, t, c in [(0, '0\nclustered', RED), (1.0, '1.0\nrandom', '#555'), (2.15, '2.15\nregular', GREEN)]:
        ax.plot([x(r), x(r)], [2.1, 3.0], color=c, lw=4); ax.text(x(r), 1.5, t, fontsize=20, fontweight='bold', ha='center', va='center', color=c)
    ax.text(6.4, 4.4, 'Rn = 2 d̄ √(n ÷ A)', fontsize=30, fontweight='bold', ha='center', color=NAVY)
    ax.text(6.4, 3.6, 'd̄ = mean distance to nearest neighbour;  n = number of points;  A = area', fontsize=16, fontweight='bold', ha='center', color='#333')
    lab(ax, 6.4, 0.45, 'Example: d̄ = 1.2 km, n = 20, A = 80 km²  →  Rn = 2 × 1.2 × 0.5 = 1.2 (random)', fs=15, c=RED)
    save(fig, 'nna_scale_big.png')


def nna_map_big():
    fig, ax = canvas(GR); rng = np.random.default_rng(11); pts = [(rng.uniform(0.8, 7.6), rng.uniform(0.6, 4.4)) for _ in range(12)]
    ax.add_patch(Rectangle((0.5, 0.3), 7.4, 4.4, fill=False, ec=NAVY, lw=3))
    P = np.array(pts)
    for i, p in enumerate(P):
        d = np.hypot(*(P - p).T); d[i] = 99; j = d.argmin(); ax.plot([p[0], P[j][0]], [p[1], P[j][1]], color=RED, lw=2, ls='--')
        ax.plot(*p, 'o', ms=13, color=NAVY)
    for y, t, c in [(4.2, '1. Number each settlement', NAVY), (3.4, '2. Measure the distance to', NAVY), (3.0, '    its nearest neighbour', NAVY), (2.2, '3. Find the mean distance d̄', NAVY), (1.4, '4. Calculate Rn and read', RED), (1.0, '    it on the scale', RED)]:
        ax.text(8.3, y, t, fontsize=16, fontweight='bold', color=c)
    save(fig, 'nna_map_big.png')


def rural_urban_big():
    table_big('rural_urban_big.png', ['Criterion', 'Rural settlement', 'Urban settlement'],
              [['Population', 'small, low density', 'large, high density'], ['Main work', 'farming, fishing', 'industry, trade, services'], ['Land use', 'fields, scattered houses', 'buildings, roads, shops'], ['Way of life', 'close ties, tradition', 'mixed people, individual'], ['Services', 'few', 'many (hospitals, banks)']],
              colw=[2.8, 4.4, 4.8], fs=18, note='In reality there is a continuum from village to city')


def urban_pct_big():
    fig, ax = chart(); y = [1950, 1970, 1990, 2010, 2030, 2050]; m = [55, 65, 72, 78, 82, 86]; l = [18, 25, 35, 46, 56, 65]; w = [30, 37, 43, 52, 60, 68]
    ax.plot(y, m, color=BLUE, lw=6, marker='o', ms=9, label='More developed countries'); ax.plot(y, w, color='#555', lw=4, ls='--', label='World'); ax.plot(y, l, color=GREEN, lw=6, marker='o', ms=9, label='Less developed countries')
    ax.axvspan(2020, 2050, color='#ECEFF1'); ax.text(2035, 94, 'projected', fontsize=16, style='italic', ha='center', color='#555')
    ax.set_ylabel('% of people living in towns', fontsize=20, fontweight='bold'); ax.set_ylim(0, 100); ax.legend(fontsize=17, frameon=False, loc='lower right')
    ax.text(1952, 92, '(approximate)', fontsize=14, style='italic', color='#555')
    fig.savefig(OUT + 'urban_pct_big.png', dpi=150, facecolor='white'); plt.close(fig)


def urban_cycle_big():
    fig, ax = canvas('white'); cx, cy, r = 6.4, 2.45, 1.75
    st = [('URBANISATION', 'people move into towns', GREEN, 90), ('SUBURBANISATION', 'people move to the suburbs', BLUE, 0), ('COUNTER-\nURBANISATION', 'people leave for small\ntowns and villages', ORANGE, 270), ('RE-URBANISATION', 'people return to the\nrenewed city centre', RED, 180)]
    for n, s, c, a in st:
        x = cx + 3.2 * np.cos(np.radians(a)); y = cy + 1.75 * np.sin(np.radians(a))
        box_(ax, x - 1.55, y - 0.35, 3.1, 0.7, n, c, fs=14 if '\n' in n else 16)
        if a == 270: ax.text(x + 1.7, y, s, fontsize=12.5, fontweight='bold', ha='left', va='center', color=c)
        else: ax.text(x, y - 0.62 if a != 90 else y + 0.55, s, fontsize=12.5, fontweight='bold', ha='center', va='top' if a != 90 else 'bottom', color=c)
    for a0 in [60, -30, -120, 150]:
        arrow(ax, (cx + 1.6 * np.cos(np.radians(a0 + 20)), cy + 1.0 * np.sin(np.radians(a0 + 20))), (cx + 1.6 * np.cos(np.radians(a0 - 20)), cy + 1.0 * np.sin(np.radians(a0 - 20))), c='#90A4AE', lw=3, ms=20, cs='arc3,rad=-0.3')
    ax.text(cx, cy, 'Stages of\nurban change', fontsize=15, fontweight='bold', ha='center', va='center', color=NAVY)
    save(fig, 'urban_cycle_big.png')


def megacities_big():
    fig, ax = map_axes([-130, 165, -40, 60])
    cities = [('Tokyo', 139.7, 35.7, 37), ('Delhi', 77.2, 28.6, 33), ('Shanghai', 121.5, 31.2, 29), ('Dhaka', 90.4, 23.8, 23), ('São Paulo', -46.6, -23.5, 22), ('Cairo', 31.2, 30.0, 22), ('Mexico City', -99.1, 19.4, 22),
              ('Beijing', 116.4, 39.9, 21), ('Mumbai', 72.9, 19.1, 21), ('New York', -74.0, 40.7, 19), ('Kinshasa', 15.3, -4.3, 17), ('Lagos', 3.4, 6.5, 16), ('Karachi', 67.0, 24.9, 17), ('Istanbul', 29.0, 41.0, 16)]
    for n, x, y, p in cities:
        ax.plot(x, y, 'o', ms=p / 2.2, color=RED, alpha=0.75, transform=PC, zorder=20)
        if n in ('Tokyo', 'Delhi', 'Shanghai', 'São Paulo', 'Cairo', 'Mexico City', 'New York', 'Kinshasa', 'Lagos', 'Dhaka'):
            ax.text(x + 3, y + (3 if n not in ('Dhaka', 'Kinshasa') else -6), f'{n} {p}', fontsize=14, fontweight='bold', transform=PC, zorder=21, color=NAVY, bbox=dict(fc='white', ec='none', alpha=0.8, pad=1))
    ax.text(0.01, 0.04, 'Megacities: over 10 million people (millions, approximate)', transform=ax.transAxes, fontsize=16, fontweight='bold', color=NAVY, bbox=dict(fc='white', ec='none', alpha=0.85))
    msave(fig, 'megacities_big.png')


def urban_forms_big():
    fig, ax = canvas('white')
    ax.add_patch(Circle((1.8, 2.5), 1.2, color='#90CAF9')); ax.text(1.8, 2.5, 'City\n1 million+', fontsize=16, fontweight='bold', ha='center', va='center', color=NAVY)
    ax.text(1.8, 0.7, 'MILLIONAIRE CITY', fontsize=15, fontweight='bold', ha='center', color=NAVY)
    for x, r in [(4.9, 0.7), (6.0, 0.9), (7.1, 0.6)]: ax.add_patch(Circle((x, 2.5), r, color='#FFB74D', alpha=0.9))
    ax.text(6.0, 0.7, 'CONURBATION\n(towns grow together)', fontsize=15, fontweight='bold', ha='center', color='#E65100')
    for x in np.linspace(8.6, 12.2, 6): ax.add_patch(Circle((x, 2.5 + 0.3 * np.sin(x * 2)), 0.5, color='#EF9A9A', alpha=0.9))
    ax.plot([8.4, 12.4], [2.5, 2.5], color='#424242', lw=3); ax.text(10.4, 0.7, 'MEGALOPOLIS\n(chain of conurbations)', fontsize=15, fontweight='bold', ha='center', color=RED)
    ax.text(10.4, 4.3, 'Boston–Washington (USA)', fontsize=15, fontweight='bold', ha='center', color='#555'); ax.text(6.0, 4.3, 'Ruhr (Germany)', fontsize=15, fontweight='bold', ha='center', color='#555')
    save(fig, 'urban_forms_big.png')


def urban_field_big():
    fig, ax = canvas(GR)
    for r, c, a in [(2.2, '#FFE0B2', 0.8), (1.4, '#FFCC80', 0.9), (0.6, '#FB8C00', 1)]: ax.add_patch(Ellipse((4.0, 2.5), 2 * r * 1.35, 2 * r, color=c, alpha=a))
    ax.add_patch(Ellipse((10.0, 2.5), 3.4, 2.4, color='#BBDEFB', alpha=0.9)); ax.add_patch(Circle((10.0, 2.5), 0.35, color=NAVY)); ax.add_patch(Circle((4.0, 2.5), 0.45, color=RED))
    ax.text(4.0, 2.5, 'City', fontsize=13, fontweight='bold', ha='center', va='center', color='white'); ax.text(10.0, 3.0, 'Town', fontsize=14, fontweight='bold', ha='center', color=NAVY)
    ax.plot([7.0, 7.0], [0.3, 4.7], color=RED, lw=3, ls='--'); ax.text(7.05, 4.5, 'breaking point', fontsize=15, fontweight='bold', color=RED)
    for y, t in [(4.6, 'Shopping and jobs (large field)'), (3.6, 'Newspaper, hospital'), (2.95, '')]: pass
    ax.text(4.0, 4.55, 'Urban field (hinterland)', fontsize=16, fontweight='bold', ha='center', color='#E65100')
    ax.text(4.0, 0.2, 'Fields are larger for rare services', fontsize=14, fontweight='bold', ha='center', color='#555')
    save(fig, 'urban_field_big.png')


def reilly_big():
    fig, ax = canvas('white')
    ax.text(6.4, 4.4, 'Breaking point from B  =', fontsize=24, fontweight='bold', ha='center', color=NAVY)
    ax.text(6.4, 3.6, 'distance A–B', fontsize=24, fontweight='bold', ha='center', color=RED); ax.plot([4.0, 8.8], [3.35, 3.35], color='#333', lw=3); ax.text(6.4, 2.9, '1 + √(population A ÷ population B)', fontsize=22, fontweight='bold', ha='center', color=GREEN)
    ax.add_patch(Circle((1.2, 1.3), 0.5, color=RED)); ax.text(1.2, 1.3, 'A', fontsize=20, fontweight='bold', color='white', ha='center', va='center')
    ax.add_patch(Circle((11.6, 1.3), 0.35, color=NAVY)); ax.text(11.6, 1.3, 'B', fontsize=18, fontweight='bold', color='white', ha='center', va='center')
    ax.plot([1.7, 11.25], [1.3, 1.3], color='#555', lw=2); ax.plot([8.07, 8.07], [0.9, 1.7], color=RED, lw=4)
    ax.text(6.4, 0.45, 'A = 400,000; B = 100,000; distance 90 km → 90 ÷ (1 + 2) = 30 km from B', fontsize=15, fontweight='bold', ha='center', color='#333')
    save(fig, 'reilly_big.png')


def hexgrid(ax, cx, cy, s, n, col='#1565C0'):
    for i in range(-n, n + 1):
        for j in range(-n, n + 1):
            x = cx + s * 1.5 * i; y = cy + s * np.sqrt(3) * (j + 0.5 * (i % 2))
            h = [(x + s * np.cos(np.radians(a)), y + s * np.sin(np.radians(a))) for a in range(0, 360, 60)]
            ax.add_patch(Polygon(h, fill=False, ec=col, lw=2))
    return


def christaller_big():
    fig, ax = canvas('white'); ax.set_xlim(0, W_); ax.set_ylim(0, H_)
    s = 0.95; hexgrid(ax, 3.2, 2.5, s, 2)
    for i in range(-2, 3):
        for j in range(-2, 3):
            x = 3.2 + s * 1.5 * i; y = 2.5 + s * np.sqrt(3) * (j + 0.5 * (i % 2))
            if 0.2 < x < 6.3 and 0.2 < y < 4.8: ax.plot(x, y, 'o', ms=9, color=ORANGE)
    ax.add_patch(Polygon([(3.2 + 2.85 * np.cos(np.radians(a + 30)) * 0.58, 2.5 + 2.85 * np.sin(np.radians(a + 30)) * 0.58) for a in range(0, 360, 60)], fill=False, ec=RED, lw=4))
    ax.plot(3.2, 2.5, 'o', ms=22, color=RED)
    for y, t, c in [(4.4, 'Central place (town) in red', RED), (3.7, 'Villages (orange) in hexagons', ORANGE), (2.9, 'Hexagons: no gaps, no overlaps', NAVY), (2.1, 'K = 3: marketing principle', BLUE), (1.4, 'K = 4: transport principle', BLUE), (0.7, 'K = 7: administrative principle', BLUE)]:
        ax.text(7.0, y, t, fontsize=18, fontweight='bold', color=c)
    save(fig, 'christaller_big.png')


def range_threshold_big():
    fig, ax = canvas(GR)
    ax.add_patch(Circle((3.5, 2.5), 2.1, color='#BBDEFB', alpha=0.8)); ax.add_patch(Circle((3.5, 2.5), 1.0, color='#FFCC80', alpha=0.9)); ax.add_patch(Circle((3.5, 2.5), 0.25, color=RED))
    ax.annotate('', xy=(5.6, 2.5), xytext=(3.5, 2.5), arrowprops=dict(arrowstyle='->', lw=3, color=BLUE)); ax.text(4.9, 2.7, 'range', fontsize=17, fontweight='bold', color=BLUE)
    ax.text(3.5, 1.8, 'threshold\npopulation', fontsize=14, fontweight='bold', ha='center', color='#E65100')
    for y, t, c in [(4.3, 'THRESHOLD: the minimum number', '#E65100'), (3.85, 'of customers a service needs', '#E65100'), (2.9, 'RANGE: the maximum distance', BLUE), (2.45, 'people will travel for it', BLUE), (1.5, 'Low-order: bread, kiosk', NAVY), (1.05, 'High-order: hospital, university', NAVY)]:
        ax.text(6.5, y, t, fontsize=17, fontweight='bold', color=c)
    save(fig, 'range_threshold_big.png')


def size_function_big():
    fig, ax = chart(); p = np.linspace(0, 100, 100)
    ax.plot(p, 0.45 * p, color=BLUE, lw=5, label='Linear: functions rise steadily'); ax.plot(p, 9 * np.log1p(p / 3), color=GREEN, lw=5, label='Curvilinear: rise slows for big towns')
    ax.plot([30, 60, 75], [30, 12, 42], 'o', ms=14, color=RED); ax.text(62, 12, 'exceptions: resort, mining,\nadministrative towns', fontsize=16, fontweight='bold', color=RED, va='center')
    ax.set_xlabel('Population (thousands)', fontsize=20, fontweight='bold'); ax.set_ylabel('Number of functions', fontsize=20, fontweight='bold'); ax.legend(fontsize=17, frameon=False, loc='upper left')
    fig.savefig(OUT + 'size_function_big.png', dpi=150, facecolor='white'); plt.close(fig)


def rank_size_big():
    fig, ax = chart(); towns = ['Yaoundé', 'Douala', 'Bamenda', 'Bafoussam', 'Garoua', 'Maroua', 'Ngaoundéré', 'Bertoua', 'Kumba', 'Ebolowa']
    real = [4.3, 4.0, 0.7, 0.5, 0.5, 0.45, 0.4, 0.3, 0.25, 0.12]; r = np.arange(1, 11); exp = 4.3 / r
    ax.plot(r, exp, color='#9E9E9E', lw=4, ls='--', marker='o', ms=8, label='Rank-size rule: Pn = P1 ÷ n'); ax.plot(r, real, color=RED, lw=5, marker='o', ms=10, label='Cameroon (approximate)')
    ax.set_xticks(r); ax.set_xticklabels(towns, fontsize=13, fontweight='bold', rotation=30, ha='right'); ax.set_ylabel('Population (millions)', fontsize=20, fontweight='bold')
    ax.legend(fontsize=17, frameon=False); ax.text(2.5, 3.6, 'Two big cities: BINARY pattern', fontsize=18, fontweight='bold', color=RED)
    fig.subplots_adjust(bottom=0.26); fig.savefig(OUT + 'rank_size_big.png', dpi=150, facecolor='white'); plt.close(fig)


def primate_big():
    fig, ax = chart(); r = np.arange(1, 7)
    for k, (n, v, c) in enumerate([('Rank-size (normal)', [100, 50, 33, 25, 20, 17], '#9E9E9E'), ('Primate', [100, 15, 12, 10, 8, 7], RED), ('Binary (Cameroon)', [100, 93, 16, 12, 11, 10], BLUE)]):
        ax.plot(r, v, lw=5, marker='o', ms=9, color=c, label=['Rank-size rule', 'Primate: one giant city (Paris, Dakar)', 'Binary: two big cities (Cameroon)'][k])
    ax.set_xlabel('Rank of town', fontsize=20, fontweight='bold'); ax.set_ylabel('Size (% of largest)', fontsize=20, fontweight='bold'); ax.legend(fontsize=17, frameon=False)
    fig.savefig(OUT + 'primate_big.png', dpi=150, facecolor='white'); plt.close(fig)


def city_models_big():
    fig, ax = canvas('white')
    cols = ['#D32F2F', '#FB8C00', '#FDD835', '#81C784', '#64B5F6']
    for i, r in enumerate([2.0, 1.6, 1.2, 0.8, 0.4]): ax.add_patch(Circle((2.2, 2.6), r, color=cols[4 - i]))
    ax.text(2.2, 0.25, 'BURGESS (rings)', fontsize=16, fontweight='bold', ha='center', color=NAVY)
    ax.add_patch(Circle((6.4, 2.6), 2.0, color='#81C784'))
    for a0, a1, c in [(20, 60, '#FB8C00'), (60, 100, '#FDD835'), (100, 140, '#64B5F6'), (200, 250, '#FB8C00'), (300, 340, '#FDD835')]: ax.add_patch(Wedge((6.4, 2.6), 2.0, a0, a1, color=c))
    ax.add_patch(Circle((6.4, 2.6), 0.4, color='#D32F2F')); ax.text(6.4, 0.25, 'HOYT (sectors)', fontsize=16, fontweight='bold', ha='center', color=NAVY)
    ax.add_patch(Rectangle((8.8, 0.7), 3.8, 3.8, color='#81C784'))
    for x, y, w, h, c in [(9.9, 2.3, 1.1, 0.9, '#D32F2F'), (8.9, 3.4, 1.4, 1.0, '#FB8C00'), (11.3, 0.8, 1.2, 1.3, '#FB8C00'), (11.3, 3.3, 1.2, 1.1, '#64B5F6'), (8.9, 0.8, 1.6, 1.1, '#FDD835')]: ax.add_patch(Rectangle((x, y), w, h, color=c))
    ax.text(10.7, 0.25, 'HARRIS–ULLMAN (nuclei)', fontsize=16, fontweight='bold', ha='center', color=NAVY)
    for k, (c, t) in enumerate([('#D32F2F', 'CBD'), ('#FB8C00', 'Industry'), ('#FDD835', 'Low-class housing'), ('#81C784', 'Middle-class housing'), ('#64B5F6', 'High-class housing')]):
        x0 = [0.3, 1.2, 2.8, 5.4, 8.3][k]; ax.add_patch(Rectangle((x0, 4.65), 0.3, 0.3, color=c)); ax.text(x0 + 0.4, 4.8, t, fontsize=13, fontweight='bold', va='center')
    save(fig, 'city_models_big.png')


def cbd_zones_big():
    fig, ax = canvas('white')
    zones = [('CBD', 'shops, offices, banks', '#D32F2F'), ('Inner city', 'old houses, factories', '#FB8C00'), ('Suburbs', 'newer houses, gardens', '#81C784'), ('Rural-urban fringe', 'farms, new estates, airport', '#A5D6A7')]
    for k, (n, s, c) in enumerate(zones):
        x = 0.3 + k * 3.15; ax.add_patch(Rectangle((x, 1.6), 3.0, 2.2 - k * 0.45, color=c)); ax.text(x + 1.5, 4.2 - k * 0.45 + 0.05, n, fontsize=18, fontweight='bold', ha='center', color=c if k != 3 else GREEN)
        ax.text(x + 1.5, 1.0, s, fontsize=14, fontweight='bold', ha='center', color='#333')
    arrow(ax, (0.4, 0.4), (12.4, 0.4), c=NAVY, lw=4); ax.text(6.4, 0.08, 'distance from the city centre →   buildings become lower and less dense', fontsize=14, fontweight='bold', ha='center', color=NAVY)
    save(fig, 'cbd_zones_big.png')


def bid_rent_big():
    fig = plt.figure(figsize=(12.8, 5.8), dpi=150); ax = fig.add_axes([0.09, 0.3, 0.88, 0.66]); d = np.linspace(0, 10, 200)
    for a, b, c, n in [(100, 25, '#D32F2F', 'Retail / offices'), (60, 9, '#FB8C00', 'Industry'), (40, 4, GREEN, 'Housing')]: ax.plot(d, np.maximum(a - b * d, 0), lw=5, color=c, label=n)
    ax.set_xlim(0, 10); ax.set_ylim(0, 105); ax.set_xticks([]); ax.set_yticks([]); ax.set_ylabel('Rent per m²', fontsize=19, fontweight='bold'); ax.legend(fontsize=17, frameon=False)
    ax.text(2.2, 95, 'CBD: most accessible, highest rent', fontsize=15, fontweight='bold', color='#D32F2F', va='top', ha='left')
    a2 = fig.add_axes([0.09, 0.08, 0.88, 0.16]); a2.set_xlim(0, 10); a2.axis('off')
    for x0, x1, c, t in [(0, 2.3, '#D32F2F', 'Retail'), (2.3, 5.7, '#FB8C00', 'Industry'), (5.7, 10, GREEN, 'Housing')]: a2.add_patch(Rectangle((x0, 0), x1 - x0, 1, color=c)); a2.text((x0 + x1) / 2, 0.5, t, fontsize=17, fontweight='bold', ha='center', va='center', color='white')
    a2.set_ylim(0, 1); fig.text(0.53, 0.01, 'Distance from the CBD →', fontsize=16, fontweight='bold', ha='center')
    fig.savefig(OUT + 'bid_rent_big.png', dpi=150, facecolor='white'); plt.close(fig)


def urban_problems_big():
    fig, ax = canvas('white')
    for k, (t, c, s) in enumerate([('ECONOMIC', NAVY, 'unemployment,\ninformal jobs'), ('SOCIAL', RED, 'slums, crime,\nlack of services'), ('TRANSPORT', ORANGE, 'traffic jams,\npoor roads'), ('ENVIRONMENT', GREEN, 'waste, floods,\nair and water pollution')]):
        x = 0.3 + (k % 2) * 6.3; y = 2.6 - (k // 2) * 2.3; box_(ax, x, y + 1.1, 6.0, 0.9, t, c, fs=23); ax.text(x + 3.0, y + 0.45, s, fontsize=18, fontweight='bold', ha='center', va='center', color=c)
    save(fig, 'urban_problems_big.png')


def sprawl_control_big():
    fig, ax = canvas('#C5E1A5')
    ax.add_patch(Circle((5.0, 2.5), 2.3, color='#A5D6A7')); ax.add_patch(Circle((5.0, 2.5), 1.4, color='#B0BEC5')); ax.add_patch(Circle((5.0, 2.5), 0.45, color='#D32F2F'))
    t = np.linspace(0, 2 * np.pi, 200); ax.plot(5.0 + 1.5 * np.cos(t), 2.5 + 1.5 * np.sin(t), color='#424242', lw=5)
    for x, y in [(8.6, 3.9), (8.9, 1.0)]: ax.add_patch(Circle((x, y), 0.45, color='#FFB74D')); ax.text(x + 0.6, y, 'New town', fontsize=15, fontweight='bold', va='center', color='#E65100')
    ax.add_patch(Rectangle((1.0, 4.2), 0.8, 0.45, color='#7E57C2')); ax.text(1.95, 4.42, 'Hypermarket', fontsize=14, fontweight='bold', va='center', color='#4527A0')
    lab(ax, 5.0, 2.5, 'City', fs=14, c=NAVY); ax.text(5.0, 4.95, 'Green belt: no building allowed', fontsize=16, fontweight='bold', ha='center', va='top', color='#1B5E20')
    ax.text(11.0, 2.5, 'Ring road\n(black)', fontsize=15, fontweight='bold', ha='center', color='#333')
    save(fig, 'sprawl_control_big.png')


def renewal_big():
    fig, ax = canvas('white')
    for k, (t, c, s) in enumerate([('1. DECAY', '#8D6E63', 'old houses, empty\nfactories, poverty'), ('2. CLEARANCE', ORANGE, 'demolish slums,\nclean the site'), ('3. REDEVELOPMENT', BLUE, 'new flats, offices,\nroads, parks'), ('4. GENTRIFICATION', GREEN, 'richer people move in,\nprices rise')]):
        x = 0.3 + k * 3.15; box_(ax, x, 3.2, 2.9, 1.0, t, c, fs=15); ax.text(x + 1.45, 2.3, s, fontsize=15, fontweight='bold', ha='center', va='center', color=c)
        if k < 3: arrow(ax, (x + 2.95, 3.7), (x + 3.2, 3.7), c='#555', lw=3, ms=20)
    lab(ax, 6.4, 0.8, 'Example: London Docklands (1980s–today)', fs=18, c=NAVY)
    save(fig, 'renewal_big.png')


def cmr_towns_big():
    fig, ax = cm_base(); R = regions()
    for n, g in R.items(): ax.add_geometries([g], PC, facecolor='#FAFAFA', edgecolor='#999', lw=1)
    towns = [('Yaoundé', 11.52, 3.87, 4.3), ('Douala', 9.70, 4.05, 4.0), ('Bamenda', 10.15, 5.96, 0.7), ('Bafoussam', 10.42, 5.48, 0.5), ('Garoua', 13.40, 9.30, 0.5), ('Maroua', 14.32, 10.59, 0.45), ('Ngaoundéré', 13.58, 7.32, 0.4), ('Bertoua', 13.68, 4.58, 0.3), ('Kumba', 9.45, 4.64, 0.25), ('Ebolowa', 11.15, 2.90, 0.12), ('Buea', 9.24, 4.16, 0.2), ('Kribi', 9.91, 2.94, 0.1)]
    for n, x, y, p in towns:
        ax.plot(x, y, 'o', ms=6 + p * 7, color=RED, alpha=0.8, transform=PC, zorder=20)
        if p >= 0.25 or n in ('Ebolowa', 'Kribi'): ax.text(x + (0.35 if n not in ('Douala', 'Kumba', 'Buea') else -0.35), y + 0.15, n, fontsize=13, fontweight='bold', ha='left' if n not in ('Douala', 'Kumba', 'Buea') else 'right', transform=PC, zorder=21, color=NAVY)
    ax.text(0.6, 0.85, 'Main towns of Cameroon\n(circle size = population,\napproximate)', transform=ax.transAxes, fontsize=17, fontweight='bold', color=NAVY)
    msave(fig, 'cmr_towns_big.png')


ALL = [k for k in list(globals()) if (k.endswith('_big') or k.endswith('_gif')) and k not in ('table_big',)]
if __name__ == '__main__':
    for f in (sys.argv[1:] or ALL):
        try: globals()[f](); print('ok', f)
        except Exception as e: print('FAIL', f, repr(e))
