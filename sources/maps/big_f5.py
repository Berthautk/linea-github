"""Big-label diagrams for Form 5 (2023 syllabus). Values marked approximate are rounded for teaching."""
import sys
from big_common import *
from matplotlib.patches import FancyBboxPatch


def cmr_gdp_big():
    fig, ax = chart()
    per = ['1960–1985', '1986–1994', '1995–2008', '2009–2019', '2020', '2021–2024']
    g = [7, -3, 4, 4, 0.5, 3.5]
    ax.bar(range(len(g)), g, color=[NAVY if v >= 0 else RED for v in g], width=0.6)
    for i, v in enumerate(g): ax.text(i, v + (0.3 if v >= 0 else -0.8), f'{v:+g} %', fontsize=20, fontweight='bold', ha='center')
    ax.axhline(0, color='#333', lw=1.5)
    ax.set_xticks(range(len(g))); ax.set_xticklabels(per, fontsize=17, fontweight='bold')
    ax.set_ylabel('GDP growth per year (%)', fontsize=20, fontweight='bold'); ax.set_ylim(-5, 9)
    ax.text(1, 0.8, 'economic crisis', fontsize=19, fontweight='bold', color=RED, ha='center')
    ax.text(5.4, 8.2, 'approximate averages', fontsize=15, style='italic', ha='right', color='#555')
    fig.subplots_adjust(bottom=0.15); msave(fig, 'cmr_gdp_big.png')


def _box(ax, x, y, w, h, t, c, fs=19, tc='white'):
    ax.add_patch(FancyBboxPatch((x - w / 2, y - h / 2), w, h, boxstyle='round,pad=0.05', fc=c, ec='white', lw=2, zorder=5))
    ax.text(x, y, t, fontsize=fs, fontweight='bold', ha='center', va='center', color=tc, zorder=6)


def spoke(name, centre, items, cc=NAVY):
    fig, ax = canvas(bg='#F4F8FB'); cx, cy = W_ / 2, H_ / 2
    _box(ax, cx, cy, 3.0, 1.0, centre, cc, fs=21)
    n = len(items)
    for i, (t, c) in enumerate(items):
        a = np.pi / 2 - 2 * np.pi * i / n; x = cx + 4.6 * np.cos(a); y = cy + 1.85 * np.sin(a)
        arrow(ax, (cx + 1.45 * np.cos(a), cy + 0.5 * np.sin(a)), (x - 1.25 * np.cos(a), y - 0.35 * np.sin(a)), c='#78909C', lw=3, ms=22)
        _box(ax, x, y, 2.9, 0.75, t, c, fs=17)
    save(fig, name)


def mrdp_big():
    spoke('mrdp_big.png', 'Multipurpose\nriver project', [('Hydro-electricity', BLUE), ('Irrigation', GREEN), ('Navigation', NAVY), ('Flood control', RED),
          ('Water supply', BLUE), ('Fishing', ORANGE), ('Tourism', GREEN)])


def reclamation_big():
    spoke('reclamation_big.png', 'Land\nreclamation', [('Polders (dykes,\npumping)', BLUE), ('Draining\nswamps', GREEN), ('Irrigating\ndrylands', ORANGE),
          ('Landfill in the sea', NAVY), ('Terracing\neroded slopes', BROWN), ('Tree planting\n(desert edges)', GREEN)])


def waste_cycle_big():
    spoke('waste_problems_big.png', 'Poor waste\nmanagement', [('Open dumps', BROWN), ('Blocked drains\nand floods', BLUE), ('Diseases\n(cholera, malaria)', RED),
          ('Water pollution', BLUE), ('Bad smell\nand ugliness', ORANGE), ('Burning:\nair pollution', NAVY)])


CMR_POP = [('Littoral', 3850000, 20248), ('West', 2080000, 13892), ('Far North', 4450000, 34263), ('North-West', 2160000, 17300), ('South-West', 1780000, 25410),
           ('Centre', 4620000, 68953), ('North', 2780000, 66090), ('Adamaoua', 1270000, 63701), ('South', 800000, 47191), ('East', 1200000, 109002)]


def cmr_popdata_big():
    from big_usa_pop import table_big
    table_big('cmr_popdata_big.png', ['Region', 'Population (approx.)', 'Area (km²)', 'Density (per km²)'],
              [[n, f'{p:,}', f'{a:,}', '?'] for n, p, a in CMR_POP], colw=[3.0, 3.4, 2.8, 2.8], fs=16,
              note='Density = population ÷ area   (figures rounded for teaching)')


def cmr_pw_rates_big():
    from big_usa_pop import table_big
    table_big('cmr_pw_rates_big.png', ['Cameroon (one year, approx.)', 'Value', 'To calculate'],
              [['Population at mid-year', '28,000,000', '—'], ['Live births', '980,000', 'Birth rate = ?'], ['Deaths', '252,000', 'Death rate = ?'],
               ['Immigrants / emigrants', '30,000 / 20,000', 'Natural increase = ?'], ['', '', 'Growth rate = ?']],
              colw=[4.6, 3.4, 4.0], fs=19, note='Figures rounded for teaching')


def _house(ax, x, y, s=0.13, c='#6D4C41'):
    ax.add_patch(Rectangle((x - s / 2, y - s / 2), s, s * 0.8, color=c, zorder=6))
    ax.add_patch(Polygon([(x - s * 0.65, y + s * 0.3), (x + s * 0.65, y + s * 0.3), (x, y + s * 0.85)], color='#4E342E', zorder=6))


def rural_forms_big():
    from matplotlib.patches import Polygon
    fig, ax = canvas(bg='#F1F8E9'); road = dict(color='#9E9E9E', lw=5, zorder=3)
    names = ['STAR', 'LINEAR', 'RECTANGULAR', 'CRUCIFORM']; cols = [NAVY, BLUE, ORANGE, RED]
    for k in range(4):
        x0 = 0.25 + k * 3.15; ax.add_patch(Rectangle((x0, 0.8), 2.9, 3.9, fc='white', ec='#90A4AE', lw=2, zorder=1))
        ax.text(x0 + 1.45, 0.4, names[k], fontsize=21, fontweight='bold', ha='center', color=cols[k])
        cx, cy = x0 + 1.45, 2.75
        if k == 0:
            for a in np.linspace(0, 2 * np.pi, 6, endpoint=False):
                ax.plot([cx, cx + 1.3 * np.cos(a)], [cy, cy + 1.7 * np.sin(a)], **road)
                for t in (0.35, 0.6, 0.85): _house(ax, cx + 1.3 * t * np.cos(a) + 0.12 * np.sin(a), cy + 1.7 * t * np.sin(a) - 0.12 * np.cos(a))
        elif k == 1:
            ax.plot([x0 + 0.15, x0 + 2.75], [cy, cy], **road)
            for t in np.linspace(x0 + 0.35, x0 + 2.55, 7): _house(ax, t, cy + 0.3); _house(ax, t, cy - 0.35)
        elif k == 2:
            ax.add_patch(Rectangle((cx - 0.9, cy - 1.2), 1.8, 2.4, fill=False, ec='#9E9E9E', lw=5, zorder=3))
            for t in np.linspace(cx - 0.7, cx + 0.7, 5): _house(ax, t, cy + 1.45); _house(ax, t, cy - 1.45)
            for t in np.linspace(cy - 0.8, cy + 0.8, 4): _house(ax, cx - 1.15, t); _house(ax, cx + 1.15, t)
        else:
            ax.plot([x0 + 0.15, x0 + 2.75], [cy, cy], **road); ax.plot([cx, cx], [0.95, 4.55], **road)
            for t in (0.35, 0.65, 0.95, 1.2):
                _house(ax, cx + t, cy + 0.3); _house(ax, cx - t, cy + 0.3); _house(ax, cx + t, cy - 0.35); _house(ax, cx - t, cy - 0.35)
                _house(ax, cx + 0.3, cy + t + 0.1); _house(ax, cx - 0.3, cy + t + 0.1); _house(ax, cx + 0.3, cy - t); _house(ax, cx - 0.3, cy - t)
    save(fig, 'rural_forms_big.png')


def urban_functions_big():
    spoke('urban_functions_big.png', 'Urban\nfunctions', [('Administrative', NAVY), ('Commercial', ORANGE), ('Industrial', BROWN),
          ('Transport (port)', BLUE), ('Educational', GREEN), ('Religious', RED), ('Tourist / resort', GREEN), ('Residential', NAVY)])


def douala_site_big():
    from matplotlib.patches import Polygon
    fig, ax = canvas(bg='#EAF4E4')
    ax.add_patch(Polygon([(0, 0), (4.2, 0), (4.4, 1.0), (3.2, 2.4), (0, 3.4)], color='#90CAF9', zorder=1))
    ax.text(1.5, 1.0, 'Atlantic Ocean\n(Gulf of Guinea)', fontsize=18, fontweight='bold', color=NAVY, ha='center')
    ax.plot([3.6, 6.0, 8.0, 10.6], [1.3, 2.7, 3.6, 4.9], color='#1E88E5', lw=30, solid_capstyle='butt', zorder=2)
    ax.text(9.4, 4.33, 'Wouri estuary', fontsize=16, fontweight='bold', color='white', ha='center', va='center', rotation=27, zorder=3)
    ax.add_patch(Polygon([(6.3, 1.6), (7.3, 2.55), (8.8, 3.15), (10.4, 2.9), (10.2, 0.9), (7.0, 0.8)], color='#C62828', alpha=0.9, zorder=4))
    ax.text(8.6, 1.9, 'DOUALA\n(left bank)', fontsize=21, fontweight='bold', color='white', ha='center', va='center', zorder=5)
    ax.add_patch(Polygon([(4.9, 3.1), (6.3, 3.75), (6.1, 4.55), (4.6, 4.2)], color='#C62828', alpha=0.7, zorder=4))
    ax.text(5.45, 3.9, 'Bonabéri', fontsize=15, fontweight='bold', color='white', ha='center', zorder=5)
    ax.plot([6.3, 7.0], [3.55, 2.45], color='#212121', lw=9, zorder=6); lab(ax, 7.9, 4.3, 'Wouri bridge', fs=15)
    ax.plot([7.3, 6.75], [4.1, 3.1], color='#212121', lw=1.5, zorder=6)
    lab(ax, 5.3, 1.1, 'port', fs=16, c=NAVY); ax.plot([5.7, 6.4], [1.2, 1.75], color=NAVY, lw=2, zorder=6)
    arrow(ax, (10.4, 2.0), (12.6, 2.0), c=NAVY, lw=4, ms=26); ax.text(11.5, 2.25, 'rail + road\nto Yaoundé', fontsize=15, fontweight='bold', ha='center', va='bottom', color=NAVY)
    arrow(ax, (10.0, 1.0), (12.5, 0.35), c=NAVY, lw=4, ms=26); ax.text(11.6, 0.95, 'to Edéa, Kribi', fontsize=15, fontweight='bold', ha='center', color=NAVY)
    arrow(ax, (4.7, 3.7), (2.7, 3.75), c=NAVY, lw=4, ms=26); ax.text(1.5, 3.75, 'to Limbe,\nBuea', fontsize=15, fontweight='bold', ha='center', va='center', color=NAVY)
    arrow(ax, (5.3, 4.35), (4.5, 4.95), c=NAVY, lw=4, ms=26); ax.text(2.4, 4.7, 'to Nkongsamba, Bafoussam', fontsize=15, fontweight='bold', ha='center', color=NAVY)
    ax.text(8.4, 0.35, 'low, flat land with mangroves', fontsize=15, style='italic', ha='center', color='#1B5E20', zorder=6)
    ax.text(12.6, 4.95, 'simplified, not to scale', fontsize=13, style='italic', ha='right', va='top', color='#555')
    save(fig, 'douala_site_big.png')


if __name__ == '__main__':
    for n in (sys.argv[1:] or [k for k in dir() if k.endswith('_big')]): globals()[n]()
