"""Big-label diagrams for Upper Sixth Practical Geography (Module 8): synthetic topographic extracts, cartographic, statistical and fieldwork diagrams.
All maps are invented teaching extracts (not real survey sheets); all data are hypothetical unless stated."""
import sys
from big_common import *
from big_usa_pop import box_, table_big
from big_usa_eco import boxes4, boxes3
from big_usa_env import two_cols

X0, X1, Y0, Y1 = 0.6, 8.1, 0.25, 4.65          # map frame (1 unit = 1 km)
BR = '#A1662F'; FOREST = '#81C784'; RIVER = '#1E88E5'


def terrain(peaks, base=100, tilt=(0, 0)):
    xs, ys = np.meshgrid(np.linspace(X0, X1, 400), np.linspace(Y0, Y1, 230))
    z = base + tilt[0] * (xs - X0) + tilt[1] * (ys - Y0)
    for x, y, h, sx, sy in peaks: z = z + h * np.exp(-(((xs - x) / sx) ** 2 + ((ys - y) / sy) ** 2))
    return xs, ys, z


def topo(ax, peaks, base=100, step=20, tilt=(0, 0), e0=20, n0=40, labels=True, clab=True):
    ax.add_patch(Rectangle((X0, Y0), X1 - X0, Y1 - Y0, color='#FFFDF5', zorder=0))
    xs, ys, z = terrain(peaks, base, tilt)
    lv = np.arange(0, 2000, step); cs = ax.contour(xs, ys, z, levels=lv, colors=BR, linewidths=[2.2 if v % (step * 5) == 0 else 1.1 for v in lv], zorder=2)
    if clab: ax.clabel(cs, levels=[v for v in lv if v % (step * 5) == 0 or step >= 50], fmt='%d', fontsize=11, inline=True)
    for k in range(int(X1 - X0) + 1): ax.plot([X0 + k, X0 + k], [Y0, Y1], color='#90A4AE', lw=0.8, zorder=3)
    for k in range(int(Y1 - Y0) + 1): ax.plot([X0, X1], [Y0 + k, Y0 + k], color='#90A4AE', lw=0.8, zorder=3)
    if labels:
        for k in range(int(X1 - X0) + 1): ax.text(X0 + k, Y1 + 0.08, f'{e0 + k}', fontsize=11, ha='center', va='bottom', color='#37474F', fontweight='bold')
        for k in range(int(Y1 - Y0) + 1): ax.text(X0 - 0.06, Y0 + k, f'{n0 + k}', fontsize=11, ha='right', va='center', color='#37474F', fontweight='bold')
    ax.add_patch(Rectangle((X0, Y0), X1 - X0, Y1 - Y0, fill=False, ec='#263238', lw=2.5, zorder=40))
    return z


def river(ax, pts, w=3, z=6): ax.plot(*zip(*pts), color=RIVER, lw=w, zorder=z, solid_capstyle='round')
def road(ax, pts, c='#D32F2F', w=4): ax.plot(*zip(*pts), color='#6D0000', lw=w + 1.6, zorder=7); ax.plot(*zip(*pts), color=c, lw=w, zorder=8)
def track(ax, pts): ax.plot(*zip(*pts), color='#5D4037', lw=1.8, ls='--', zorder=7)
def rail(ax, pts): ax.plot(*zip(*pts), color='#212121', lw=3.5, zorder=7); ax.plot(*zip(*pts), color='white', lw=1.4, ls=(0, (4, 4)), zorder=8)
def huts(ax, pts, s=5.5, c='#212121'): ax.plot([p[0] for p in pts], [p[1] for p in pts], 's', ms=s, color=c, zorder=9, ls='none')
def forest(ax, poly, n=40, seed=1):
    ax.add_patch(Polygon(poly, color=FOREST, alpha=0.55, zorder=1)); rng = np.random.default_rng(seed); P = SPoly(poly); (a, b, c, d) = P.bounds; k = 0
    while k < n:
        x, y = rng.uniform(a, c), rng.uniform(b, d)
        if P.contains(SPoly([(x - .01, y), (x + .01, y), (x, y + .01)])): ax.plot(x, y, marker='$♣$', ms=9, color='#1B5E20', zorder=4); k += 1
def grass(ax, poly, n=25, seed=2):
    rng = np.random.default_rng(seed); P = SPoly(poly); (a, b, c, d) = P.bounds; k = 0
    while k < n:
        x, y = rng.uniform(a, c), rng.uniform(b, d)
        if P.contains(SPoly([(x - .01, y), (x + .01, y), (x, y + .01)])): ax.text(x, y, 'ıı', fontsize=10, color='#558B2F', ha='center', va='center', zorder=4); k += 1
def swamp(ax, cx, cy, n=8):
    for i in range(n): x = cx + (i % 4) * 0.28 - 0.4; y = cy + (i // 4) * 0.22; ax.plot([x - 0.1, x + 0.1], [y, y], color=RIVER, lw=1.6, zorder=5); ax.text(x, y + 0.06, 'ψ', fontsize=9, color=RIVER, ha='center', zorder=5)
def tlab(ax, x, y, t, c='#111', fs=12, **k): ax.text(x, y, t, fontsize=fs, fontweight='bold', color=c, ha=k.pop('ha', 'center'), va='center', zorder=30, bbox=dict(fc='white', ec='none', alpha=0.8, pad=0.8), **k)


def key(ax, items, x=8.7, y=4.6, title='KEY', dy=0.42):
    ax.text(x, y, title, fontsize=15, fontweight='bold', color=NAVY)
    for i, (kind, t) in enumerate(items):
        yy = y - 0.45 - i * dy
        if kind == 'road': ax.plot([x, x + 0.5], [yy, yy], color='#6D0000', lw=5.5); ax.plot([x, x + 0.5], [yy, yy], color='#D32F2F', lw=4)
        elif kind == 'track': ax.plot([x, x + 0.5], [yy, yy], color='#5D4037', lw=1.8, ls='--')
        elif kind == 'rail': ax.plot([x, x + 0.5], [yy, yy], color='#212121', lw=3.5); ax.plot([x, x + 0.5], [yy, yy], color='white', lw=1.4, ls=(0, (4, 4)))
        elif kind == 'river': ax.plot([x, x + 0.5], [yy, yy], color=RIVER, lw=3)
        elif kind == 'contour': ax.plot([x, x + 0.5], [yy, yy], color=BR, lw=1.6)
        elif kind == 'hut': ax.plot(x + 0.25, yy, 's', ms=6, color='#212121')
        elif kind == 'forest': ax.plot(x + 0.25, yy, marker='$♣$', ms=11, color='#1B5E20')
        elif kind == 'grass': ax.text(x + 0.25, yy, 'ıı', fontsize=12, color='#558B2F', ha='center', va='center')
        elif kind == 'swamp': ax.text(x + 0.25, yy, 'ψ', fontsize=13, color=RIVER, ha='center', va='center')
        elif kind == 'spot': ax.plot(x + 0.25, yy, '.', ms=10, color='#111')
        elif kind.startswith('#'): ax.add_patch(Rectangle((x + 0.05, yy - 0.13), 0.4, 0.26, color=kind))
        else: ax.plot(x + 0.25, yy, kind[0], ms=10, color=kind[1:] if len(kind) > 1 else '#111')
        ax.text(x + 0.65, yy, t, fontsize=13, fontweight='bold', va='center', color='#263238')


def scale_bar(ax, x=8.7, y=0.35):
    for k in range(4): ax.add_patch(Rectangle((x + k * 0.5, y), 0.5, 0.1, color='#263238' if k % 2 == 0 else 'white', ec='#263238', lw=1))
    ax.text(x, y + 0.22, '0', fontsize=11, ha='center', fontweight='bold'); ax.text(x + 2, y + 0.22, '2 km', fontsize=11, ha='center', fontweight='bold'); ax.text(x + 1, y - 0.18, 'Scale 1:50,000', fontsize=12, ha='center', fontweight='bold', color=NAVY)


def north(ax, x=12.2, y=4.35):
    ax.annotate('', xy=(x, y + 0.35), xytext=(x, y - 0.25), arrowprops=dict(arrowstyle='-|>', lw=3, color='#263238', mutation_scale=22)); ax.text(x, y + 0.5, 'N', fontsize=15, fontweight='bold', ha='center')


# ---------- MAP ANALYSIS 1: REVIEW ----------
def topo_base_big():
    fig, ax = canvas('white'); topo(ax, [(2.5, 3.2, 180, 1.2, 0.9), (6.2, 1.4, 120, 1.0, 0.8)], base=200, step=20)
    river(ax, [(0.6, 1.1), (1.5, 1.4), (3.0, 1.2), (4.2, 2.0), (5.0, 2.8), (6.4, 3.4), (8.1, 3.7)])
    road(ax, [(0.6, 0.6), (2.0, 0.8), (4.3, 1.9), (5.6, 2.3), (8.1, 2.0)]); track(ax, [(4.3, 1.9), (3.6, 3.4), (3.9, 4.65)])
    huts(ax, [(4.35, 2.1), (4.55, 1.95), (4.2, 1.8), (4.5, 2.25), (4.7, 2.05)]); tlab(ax, 4.9, 2.55, 'Mbé', fs=13)
    ax.plot(2.5, 3.2, '.', ms=10, color='#111', zorder=9); tlab(ax, 2.85, 3.3, '382', fs=11)
    ax.plot([1.5, 6.4], [1.4, 3.4], color='#8E24AA', lw=2.5, ls=':', zorder=20); tlab(ax, 1.3, 1.65, 'A', c='#8E24AA'); tlab(ax, 6.6, 3.6, 'B', c='#8E24AA')
    key(ax, [('road', 'Main road'), ('track', 'Track'), ('river', 'River'), ('contour', 'Contour (20 m)'), ('hut', 'Huts'), ('spot', 'Spot height')]); scale_bar(ax); north(ax)
    save(fig, 'topo_base_big.png')


def gridref_big():
    fig, ax = canvas('white')
    for k in range(4): ax.plot([1 + k * 1.5, 1 + k * 1.5], [0.5, 4.5], color='#546E7A', lw=2); ax.text(1 + k * 1.5, 4.7, f'{20 + k}', fontsize=17, fontweight='bold', ha='center')
    for k in range(3): ax.plot([1, 5.5], [0.5 + k * 2, 0.5 + k * 2], color='#546E7A', lw=2); ax.text(0.7, 0.5 + k * 2, f'{40 + k}', fontsize=17, fontweight='bold', ha='right', va='center')
    for k in range(11): x = 2.5 + k * 0.15; ax.plot([x, x], [2.5, 2.6 if k % 5 else 2.7], color=RED, lw=1.5)
    ax.plot(2.5 + 0.6, 2.5 + 0.2 * 7, 'o', ms=14, color=RED); ax.text(3.35, 3.9, 'school', fontsize=16, fontweight='bold', color=RED)
    ax.annotate('', xy=(3.1, 2.5), xytext=(2.5, 2.5), arrowprops=dict(arrowstyle='-|>', lw=2.5, color=BLUE)); ax.annotate('', xy=(3.1, 3.9), xytext=(3.1, 2.5), arrowprops=dict(arrowstyle='-|>', lw=2.5, color=GREEN))
    ax.text(6.3, 4.1, '1. EASTINGS first (along the corridor):', fontsize=16, fontweight='bold', color=BLUE); ax.text(6.3, 3.6, '    21 + 4 tenths → 214', fontsize=16, fontweight='bold', color=BLUE)
    ax.text(6.3, 2.9, '2. NORTHINGS next (up the stairs):', fontsize=16, fontweight='bold', color=GREEN); ax.text(6.3, 2.4, '    41 + 7 tenths → 417', fontsize=16, fontweight='bold', color=GREEN)
    ax.text(6.3, 1.5, 'Six-figure grid reference = 214 417', fontsize=18, fontweight='bold', color=RED); ax.text(6.3, 0.9, '(each square = 1 km on a 1:50,000 map)', fontsize=14, color='#555', fontweight='bold')
    save(fig, 'gridref_big.png')


def scale_types_big():
    table_big('scale_types_big.png', ['Type of scale', 'Example', 'How to use it'],
              [['Ratio (RF)', '1:50,000', '1 cm on the map = 50,000 cm = 0.5 km'], ['Statement', '2 cm to 1 km', 'measure in cm and divide by 2'], ['Linear (bar)', '0 ─── 1 ─── 2 km', 'lay a paper strip on the bar'],
               ['Worked example', 'A to B = 11 cm on the map', '11 × 0.5 = 5.5 km on the ground']], colw=[2.4, 3.6, 6.0], fs=17)


def contour_principles_big():
    fig, ax = canvas('white')
    for r, h in zip([2.1, 1.7, 1.3, 0.75, 0.35], [100, 150, 200, 250, 300]):
        ax.add_patch(Ellipse((2.6 + (2.1 - r) * 0.45, 2.6), 2 * r * 1.15, 2 * r, fill=False, ec=BR, lw=2.2)); ax.text(2.6 + (2.1 - r) * 0.45 - r * 1.15 + 0.05, 2.6, f'{h}', fontsize=12, fontweight='bold', color=BR, ha='left', va='center', bbox=dict(fc='white', ec='none', pad=0.3))
    ax.text(0.55, 0.3, 'gentle (lines far apart)', fontsize=14, fontweight='bold', color=GREEN); ax.text(3.2, 0.3, 'steep (lines close)', fontsize=14, fontweight='bold', color=RED)
    x = np.linspace(6.6, 12.4, 100); h = 0.6 + 3.2 * np.exp(-((x - 10.2) / np.where(x < 10.2, 2.2, 0.9)) ** 2)
    ax.fill_between(x, 0.6, h, color='#D7CCC8'); ax.plot(x, h, color=BR, lw=3)
    for v in [1.2, 1.9, 2.6, 3.3]: ax.plot([6.6, 12.4], [v, v], color='#BDBDBD', lw=1, ls='--')
    ax.text(7.8, 4.4, 'Cross-section: gentle slope', fontsize=15, fontweight='bold', color=GREEN); ax.text(11.2, 4.1, 'steep', fontsize=15, fontweight='bold', color=RED)
    ax.text(9.5, 0.2, 'Contours join places of equal height', fontsize=16, fontweight='bold', color=NAVY, ha='center')
    save(fig, 'contour_principles_big.png')


def signs_big():
    fig, ax = canvas('white'); items = [('road', 'Main road (tarred)'), ('track', 'Footpath / track'), ('rail', 'Railway'), ('river', 'River'), ('contour', 'Contour'), ('hut', 'Huts / houses'),
                                        ('forest', 'Forest'), ('grass', 'Grassland (savanna)'), ('swamp', 'Swamp / marsh'), ('spot', 'Spot height'), ('^#E65100', 'Quarry / mine'), ('P#1565C0', 'Post office')]
    key(ax, items[:6], x=0.8, y=4.6, title='LINES AND POINTS', dy=0.68); key(ax, items[6:], x=6.9, y=4.6, title='AREAS AND FEATURES', dy=0.68)
    save(fig, 'signs_big.png')


# ---------- MAP ANALYSIS 2: MODERN TECHNIQUES ----------
def remote_sensing_big():
    fig, ax = canvas('#0D1B3E'); sun(ax, 1.0, 4.2, 0.5) if 'sun' in globals() else None
    ax.add_patch(Rectangle((0, 0), 12.8, 1.0, color='#558B2F'))
    ax.add_patch(Rectangle((8.6, 3.7), 0.9, 0.5, color='#B0BEC5')); ax.add_patch(Rectangle((7.9, 3.85), 0.7, 0.2, color='#1565C0')); ax.add_patch(Rectangle((9.5, 3.85), 0.7, 0.2, color='#1565C0'))
    ax.text(9.05, 4.45, 'SATELLITE', fontsize=15, fontweight='bold', ha='center', color='white')
    arrow(ax, (1.5, 3.8), (4.6, 1.1), c='#FFD54F', lw=4); ax.text(2.3, 2.3, '1. Energy from\nthe sun', fontsize=15, fontweight='bold', color='#FFD54F')
    arrow(ax, (4.9, 1.1), (8.6, 3.6), c='#FF8A65', lw=4); ax.text(5.6, 2.9, '2. Reflected by\nthe ground', fontsize=15, fontweight='bold', color='#FF8A65')
    ax.add_patch(Rectangle((11.3, 1.0), 0.9, 0.7, color='#ECEFF1')); ax.plot([11.75, 11.75], [1.7, 2.2], color='#ECEFF1', lw=3); ax.add_patch(Wedge((11.75, 2.3), 0.35, 200, 340, color='#ECEFF1'))
    arrow(ax, (9.4, 3.6), (11.6, 2.5), c='#80DEEA', lw=4); ax.text(10.6, 3.35, '3. Sent to\nground station', fontsize=15, fontweight='bold', color='#80DEEA')
    ax.text(11.75, 0.45, '4. Image processed', fontsize=14, fontweight='bold', color='white', ha='center')
    ax.text(4.8, 0.45, 'forest, farms, water, towns', fontsize=14, fontweight='bold', color='white', ha='center')
    save(fig, 'remote_sensing_big.png')


def aerial_types_big():
    fig, ax = canvas('#E3F2FD'); ax.add_patch(Rectangle((0, 0), 12.8, 0.8, color='#8D6E63'))
    for x0 in (1.0, 7.2):
        ax.add_patch(Polygon([(x0, 3.9), (x0 + 1.2, 3.8), (x0 + 1.5, 4.05), (x0 + 1.2, 4.3), (x0, 4.2)], color='#455A64'))
    ax.plot([1.7, 0.6], [3.8, 0.8], color=ORANGE, lw=2, ls='--'); ax.plot([1.7, 2.8], [3.8, 0.8], color=ORANGE, lw=2, ls='--'); ax.text(1.7, 0.35, 'VERTICAL: camera points\nstraight down (like a map)', fontsize=14, fontweight='bold', ha='center', color='white')
    ax.plot([8.0, 10.2], [3.8, 0.8], color=RED, lw=2, ls='--'); ax.plot([8.0, 12.6], [3.8, 1.8], color=RED, lw=2, ls='--'); ax.text(10.4, 0.35, 'OBLIQUE: camera at an angle\n(shows the sides of objects)', fontsize=14, fontweight='bold', ha='center', color='white')
    ax.text(4.8, 3.0, 'Interpretation keys:\ntone, colour, shape,\nsize, texture, shadow,\npattern, site', fontsize=15, fontweight='bold', color=NAVY, ha='center', va='center')
    save(fig, 'aerial_types_big.png')


def gis_layers_big():
    fig, ax = canvas('white')
    for i, (t, c) in enumerate([('Relief (contours)', '#A1887F'), ('Rivers', RIVER), ('Roads', '#E53935'), ('Settlements', '#424242'), ('Land use', '#66BB6A')]):
        y = 0.4 + i * 0.85; ax.add_patch(Polygon([(1.0, y), (4.6, y), (5.6, y + 0.6), (2.0, y + 0.6)], color=c, alpha=0.75, ec='white', lw=2)); ax.text(6.0, y + 0.3, t, fontsize=16, fontweight='bold', va='center', color=c)
    ax.text(9.9, 3.9, 'GIS', fontsize=26, fontweight='bold', color=NAVY, ha='center'); ax.text(9.9, 2.6, 'a computer system that\nstores, combines, analyses\nand maps data in LAYERS', fontsize=16, fontweight='bold', color=NAVY, ha='center', va='center')
    ax.text(9.9, 1.0, 'Uses: planning, disasters,\nfarming, health, elections', fontsize=15, fontweight='bold', color=GREEN, ha='center', va='center')
    save(fig, 'gis_layers_big.png')


# ---------- MAP ANALYSIS 3: RELIEF ----------
def contour_forms_big():
    fig, ax = canvas('white'); T = [('HILL', 'rings, highest inside'), ('SPUR', '"V" pointing downhill'), ('VALLEY', '"V" pointing uphill'), ('ESCARPMENT', 'lines crowded on one side'), ('PLATEAU', 'flat top, steep edges')]
    for k, (t, s) in enumerate(T):
        cx = 1.25 + k * 2.55; cy = 2.6
        if k == 0:
            for r in (1.0, 0.7, 0.4): ax.add_patch(Ellipse((cx, cy), 2 * r, 1.6 * r, fill=False, ec=BR, lw=2.2))
        elif k in (1, 2):
            for j, d in enumerate((0, 0.35, 0.7)):
                sgn = -1 if k == 1 else 1; ax.plot([cx - 1.0, cx, cx + 1.0], [cy + 0.8 - d, cy + 0.8 - d + sgn * 0.9, cy + 0.8 - d], color=BR, lw=2.2)
                ax.text(cx + 1.05, cy + 0.8 - d, f'{300 - j * 50 if k == 1 else 200 + j * 50}', fontsize=11, color=BR, fontweight='bold', va='center')
            if k == 2: ax.plot([cx, cx], [cy - 0.6, cy + 1.3], color=RIVER, lw=3)
        elif k == 3:
            for j, d in enumerate((0, 0.12, 0.24, 0.36)): ax.plot(np.linspace(cx - 1, cx + 1, 20), cy + 0.3 - d + 0.1 * np.sin(np.linspace(0, 3, 20)), color=BR, lw=2)
            ax.plot(np.linspace(cx - 1, cx + 1, 20), cy + 1.2 + 0.1 * np.sin(np.linspace(0, 3, 20)), color=BR, lw=2)
        else:
            for r in (1.0, 0.92, 0.84): ax.add_patch(Rectangle((cx - r, cy - 0.8 * r), 2 * r, 1.6 * r, fill=False, ec=BR, lw=2.2))
            ax.text(cx, cy, 'flat', fontsize=14, fontweight='bold', ha='center', color='#555')
        ax.text(cx, 4.55, t, fontsize=16, fontweight='bold', ha='center', color=NAVY); ax.text(cx, 0.9, s, fontsize=12.5, fontweight='bold', ha='center', color=RED)
    save(fig, 'contour_forms_big.png')


def topo_relief_big():
    fig, ax = canvas('white'); topo(ax, [(1.8, 3.6, 380, 1.4, 1.0), (3.2, 3.9, 300, 1.0, 0.7), (6.8, 1.2, 160, 1.2, 0.7)], base=300, step=20, tilt=(-12, 0))
    river(ax, [(5.0, 4.65), (4.8, 3.5), (5.2, 2.4), (6.0, 2.2), (8.1, 2.6)]); river(ax, [(2.4, 1.8), (3.6, 2.0), (5.0, 2.3)], w=2)
    tlab(ax, 1.8, 3.55, 'HIGHLAND', c=RED, fs=13); tlab(ax, 4.5, 1.0, 'LOWLAND / PLAIN', c=GREEN, fs=13); tlab(ax, 6.8, 1.25, 'HILL', c=ORANGE, fs=12); tlab(ax, 5.5, 3.7, 'VALLEY', c=BLUE, fs=12)
    ax.plot([0.8, 7.5], [3.0, 1.2], color='#8E24AA', lw=2.5, ls=':', zorder=20); tlab(ax, 0.6, 3.1, 'X', c='#8E24AA'); tlab(ax, 7.7, 1.1, 'Y', c='#8E24AA')
    key(ax, [('contour', 'Contour (20 m)'), ('river', 'River')]); ax.text(8.7, 2.8, 'Relief regions:\n• highland (NW)\n• river valley\n• lowland plain\n• isolated hill (SE)', fontsize=14, fontweight='bold', color=NAVY, va='top'); scale_bar(ax); north(ax)
    save(fig, 'topo_relief_big.png')


def cross_section_big():
    fig, ax = canvas('white'); x = np.linspace(0.8, 12.2, 300); h = 300 + 280 * np.exp(-((x - 3.0) / 1.8) ** 2) - 30 * np.exp(-((x - 6.3) / 0.6) ** 2) + 120 * np.exp(-((x - 10.0) / 1.2) ** 2) - 0.0 * x
    y = 0.8 + (h - 250) / 110
    ax.fill_between(x, 0.8, y, color='#D7CCC8'); ax.plot(x, y, color=BR, lw=3.5)
    for v in (300, 400, 500): yy = 0.8 + (v - 250) / 110; ax.plot([0.65, 0.8], [yy, yy], color='#333', lw=2); ax.text(0.02, yy, f'{v} m', fontsize=13, fontweight='bold', ha='left', va='center')
    ax.plot([0.8, 0.8], [0.8, 4.3], color='#333', lw=2); ax.plot([0.8, 12.2], [0.8, 0.8], color='#333', lw=2)
    ax.text(0.8, 0.35, 'X', fontsize=18, fontweight='bold', color='#8E24AA', ha='center'); ax.text(12.2, 0.35, 'Y', fontsize=18, fontweight='bold', color='#8E24AA', ha='center')
    tlab(ax, 3.0, y.max() + 0.35, 'highland', c=RED, fs=15); tlab(ax, 6.3, 1.9, 'river valley', c=BLUE, fs=15); tlab(ax, 10.0, 2.7, 'hill', c=ORANGE, fs=15)
    ax.text(6.5, 4.6, 'Steps: paper strip on X–Y → mark contours → plot heights → join smoothly', fontsize=14, fontweight='bold', ha='center', color=NAVY)
    save(fig, 'cross_section_big.png')


def topo_river_big():
    fig, ax = canvas('white'); topo(ax, [(1.0, 4.4, 200, 1.4, 0.6), (7.4, 0.6, 140, 1.4, 0.6)], base=60, step=20, clab=False)
    t = np.linspace(0, 1, 300); rx = 0.25 + 8.0 * t; ry = 2.5 + 0.55 * np.sin(t * 5 * 2 * np.pi) * (0.3 + t)
    river(ax, list(zip(rx, ry)), w=3.5)
    ax.add_patch(Ellipse((5.3, 3.55), 0.9, 0.35, fill=False, ec=RIVER, lw=3, zorder=6)); tlab(ax, 5.3, 4.05, 'ox-bow lake', c=BLUE)
    swamp(ax, 2.2, 1.35); tlab(ax, 2.2, 1.0, 'marsh', c=BLUE); tlab(ax, 5.6, 1.35, 'FLOODPLAIN (flat, no contours)', c=GREEN, fs=12)
    tlab(ax, 6.9, 3.5, 'meander', c=RED); tlab(ax, 1.0, 4.4, 'steep valley side', c=BR, fs=11)
    ax.text(8.7, 4.3, 'Fluvial features', fontsize=16, fontweight='bold', color=NAVY)
    ax.text(8.7, 3.8, '• meanders\n• ox-bow lake\n• floodplain\n• marshes\n• V-shaped valley\n  (upstream, contours\n  pointing upstream)', fontsize=14, fontweight='bold', color=NAVY, va='top'); scale_bar(ax); north(ax)
    save(fig, 'topo_river_big.png')


def topo_coast_big():
    fig, ax = canvas('white'); topo(ax, [(2.0, 4.3, 160, 1.5, 0.8), (6.8, 4.4, 120, 1.3, 0.6)], base=0, step=20, tilt=(0, 20), clab=False)
    sea = [(0.6, 0.25), (8.1, 0.25), (8.1, 1.6), (7.0, 1.9), (5.6, 2.4), (4.4, 1.6), (3.2, 1.3), (2.0, 2.0), (0.6, 1.9)]
    ax.add_patch(Polygon(sea, color='#BBDEFB', zorder=5))
    ax.plot([4.5, 5.2, 6.0, 6.7], [1.62, 1.85, 1.9, 1.75], color='#FBC02D', lw=7, zorder=6); tlab(ax, 5.4, 1.35, 'SPIT', c=ORANGE)
    ax.add_patch(Polygon([(3.2, 1.3), (4.4, 1.6), (3.9, 1.7), (3.3, 1.52)], color='#FFE082', zorder=6)); tlab(ax, 3.7, 2.05, 'BAY with beach', c=ORANGE, fs=11)
    for x in np.linspace(0.4, 1.9, 8): ax.plot([x, x], [1.93, 2.1], color='#4E342E', lw=2, zorder=7)
    tlab(ax, 1.1, 2.4, 'CLIFF', c=RED); ax.plot([2.2, 2.35], [1.75, 1.8], 's', ms=7, color='#6D4C41', zorder=7); tlab(ax, 2.3, 1.4, 'stack', c=RED, fs=11)
    tlab(ax, 4.0, 0.7, 'SEA', c=BLUE, fs=16); river(ax, [(5.9, 4.65), (5.7, 3.4), (5.6, 2.4)], w=2.5)
    ax.text(8.7, 4.3, 'Coastal features', fontsize=16, fontweight='bold', color=NAVY)
    ax.text(8.7, 3.8, 'Erosion: cliff, stack,\nheadland\nDeposition: beach,\nspit, bay-head beach', fontsize=14, fontweight='bold', color=NAVY, va='top'); scale_bar(ax); north(ax)
    save(fig, 'topo_coast_big.png')


# ---------- MAP ANALYSIS 4: DRAINAGE ----------
def drain_patterns_big():
    fig, ax = canvas('white'); T = ['DENDRITIC\n(tree-like; same rock)', 'TRELLIS\n(right angles; folded rocks)', 'RADIAL\n(out from a hill)', 'PARALLEL\n(steep even slope)', 'RECTANGULAR\n(joints, faults)']
    for k, t in enumerate(T):
        cx = 1.25 + k * 2.55
        if k == 0:
            ax.plot([cx, cx], [0.9, 3.9], color=RIVER, lw=4)
            for y, d in [(1.6, 1), (2.3, -1), (2.9, 1), (3.4, -1)]: ax.plot([cx, cx + 0.8 * d], [y, y + 0.6], color=RIVER, lw=2.5); ax.plot([cx + 0.4 * d, cx + 0.7 * d], [y + 0.3, y + 0.15], color=RIVER, lw=1.5)
        elif k == 1:
            ax.plot([cx, cx], [0.9, 3.9], color=RIVER, lw=4)
            for y in (1.4, 2.1, 2.8, 3.5): ax.plot([cx - 0.9, cx + 0.9], [y, y], color=RIVER, lw=2.5)
        elif k == 2:
            ax.plot(cx, 2.4, '^', ms=18, color=BR)
            for a in np.linspace(0, 2 * np.pi, 9)[:-1]: ax.plot([cx + 0.3 * np.cos(a), cx + 1.05 * np.cos(a)], [2.4 + 0.3 * np.sin(a), 2.4 + 1.05 * np.sin(a)], color=RIVER, lw=2.5)
        elif k == 3:
            for x in np.linspace(cx - 0.8, cx + 0.8, 5): ax.plot([x, x + 0.1], [3.9, 0.9], color=RIVER, lw=2.5)
        else:
            ax.plot([cx - 0.8, cx - 0.8, cx + 0.3, cx + 0.3, cx + 0.9], [3.9, 2.8, 2.8, 1.5, 1.5], color=RIVER, lw=4); ax.plot([cx - 0.8, cx - 0.2, cx - 0.2], [2.0, 2.0, 1.0], color=RIVER, lw=2.5); ax.plot([cx + 0.3, cx + 0.9, cx + 0.9], [3.4, 3.4, 3.9], color=RIVER, lw=2.5)
        ax.text(cx, 4.45, t, fontsize=12.5, fontweight='bold', ha='center', va='center', color=NAVY)
    save(fig, 'drain_patterns_big.png')


def bifurcation_big():
    table_big('bifurcation_big.png', ['Order (u)', 'Number of streams (Nu)', 'Bifurcation ratio (Nu ÷ Nu+1)'],
              [['1', '16', '16 ÷ 5 = 3.2'], ['2', '5', '5 ÷ 2 = 2.5'], ['3', '2', '2 ÷ 1 = 2.0'], ['4', '1', '—']], colw=[2.6, 4.2, 5.2], fs=19,
              note='Mean Rb = (3.2 + 2.5 + 2.0) ÷ 3 = 2.6.  Low Rb (2–3) = high flood risk; high Rb (3–5) = lower risk')


def drainage_calc_big():
    table_big('drainage_calc_big.png', ['Measure', 'Formula', 'Example'],
              [['Drainage density', 'total stream length ÷ basin area', '48 km ÷ 16 km² = 3.0 km/km²'], ['Stream frequency', 'number of streams ÷ basin area', '24 ÷ 16 km² = 1.5 per km²'],
               ['Sinuosity', 'channel length ÷ straight length', '7.5 ÷ 5 = 1.5 (meandering)']], colw=[2.8, 4.6, 4.6], fs=18,
              note='High density: impermeable rock, heavy rain, little vegetation.  Sinuosity > 1.5 = meandering')


# ---------- MAP ANALYSIS 5–7: VEGETATION, TRANSPORT, LAND USE ----------
def topo_veg_big():
    fig, ax = canvas('white'); topo(ax, [(2.0, 3.8, 260, 1.4, 0.9), (6.4, 3.6, 180, 1.0, 0.8)], base=200, step=20, clab=False)
    river(ax, [(0.6, 1.5), (2.5, 1.8), (4.4, 1.3), (6.2, 1.9), (8.1, 1.6)])
    forest(ax, [(0.9, 3.0), (3.3, 2.9), (3.4, 4.6), (0.8, 4.6)], n=45); forest(ax, [(0.6, 1.3), (8.1, 1.4), (8.1, 1.85), (6.2, 2.15), (4.4, 1.6), (2.5, 2.05), (0.6, 1.75)], n=30, seed=4)
    grass(ax, [(3.6, 2.2), (8.0, 2.3), (8.0, 4.6), (3.6, 4.6)], n=40); swamp(ax, 4.3, 0.55)
    tlab(ax, 2.1, 4.35, 'forest on high slopes', c='#1B5E20', fs=11); tlab(ax, 6.0, 2.6, 'savanna grassland', c='#558B2F', fs=11); tlab(ax, 1.6, 1.0, 'gallery forest along river', c='#1B5E20', fs=11); tlab(ax, 5.6, 0.55, 'swamp', c=BLUE, fs=11)
    key(ax, [('forest', 'Forest'), ('grass', 'Grassland'), ('swamp', 'Swamp'), ('river', 'River'), ('contour', 'Contour')]); scale_bar(ax); north(ax)
    save(fig, 'topo_veg_big.png')


def topo_transport_big():
    fig, ax = canvas('white'); topo(ax, [(4.2, 3.6, 300, 1.2, 0.8), (1.2, 1.2, 120, 0.9, 0.7)], base=200, step=20, clab=False)
    river(ax, [(0.6, 2.5), (2.4, 2.6), (4.0, 1.9), (6.0, 2.0), (8.1, 1.4)])
    road(ax, [(0.6, 0.8), (2.6, 1.0), (4.5, 1.2), (6.4, 1.1), (8.1, 1.3)]); road(ax, [(2.6, 1.0), (2.9, 2.6), (2.2, 4.65)]); road(ax, [(6.4, 1.1), (6.8, 2.8), (7.9, 4.65)])
    rail(ax, [(0.6, 0.45), (8.1, 0.6)]); track(ax, [(2.9, 2.6), (4.2, 2.6), (5.3, 2.9), (6.8, 2.8)])
    for x, y, t in [(2.6, 1.0, 'A'), (6.4, 1.1, 'B'), (2.9, 2.6, 'C'), (6.8, 2.8, 'D')]: ax.plot(x, y, 'o', ms=13, color='#212121', zorder=12); tlab(ax, x + 0.25, y + 0.25, t, c=RED, fs=13)
    tlab(ax, 4.2, 3.6, 'hill: roads go around it', c=BR, fs=11); tlab(ax, 4.6, 0.95, 'road and railway follow the flat valley floor', c=NAVY, fs=11)
    key(ax, [('road', 'Main road'), ('track', 'Track'), ('rail', 'Railway'), ('river', 'River'), ('o#212121', 'Town / junction')]); scale_bar(ax); north(ax)
    save(fig, 'topo_transport_big.png')


def topological_big():
    fig, ax = canvas('white'); N = {'A': (1.5, 1.2), 'B': (5.0, 1.2), 'C': (1.8, 3.8), 'D': (5.3, 3.8)}
    for a, b, c in [('A', 'B', '#D32F2F'), ('A', 'C', '#D32F2F'), ('B', 'D', '#D32F2F'), ('C', 'D', '#5D4037')]: ax.plot(*zip(N[a], N[b]), color=c, lw=5)
    for k, p in N.items(): ax.plot(*p, 'o', ms=30, color=NAVY); ax.text(*p, k, fontsize=17, fontweight='bold', color='white', ha='center', va='center')
    ax.text(7.0, 4.2, 'Topological diagram of the map', fontsize=17, fontweight='bold', color=NAVY)
    ax.text(7.0, 3.5, 'Nodes (v) = 4    Links (e) = 4', fontsize=17, fontweight='bold', color=RED)
    ax.text(7.0, 2.8, 'Beta index β = e ÷ v = 4 ÷ 4 = 1.0', fontsize=17, fontweight='bold', color=GREEN)
    ax.text(7.0, 2.1, 'Detour index = (road ÷ straight line) × 100', fontsize=16, fontweight='bold', color=ORANGE)
    ax.text(7.0, 1.5, 'e.g. A–D: 6.3 km ÷ 4.5 km × 100 = 140 %', fontsize=16, fontweight='bold', color=ORANGE)
    ax.text(7.0, 0.8, '100 % = straight; higher = more winding', fontsize=14, fontweight='bold', color='#555')
    save(fig, 'topological_big.png')


def topo_landuse_big():
    fig, ax = canvas('white'); topo(ax, [(6.8, 3.9, 260, 1.4, 0.9), (1.2, 4.3, 140, 1.0, 0.5)], base=80, step=20, clab=False)
    river(ax, [(0.6, 2.0), (2.6, 2.2), (4.6, 1.6), (8.1, 1.9)]); road(ax, [(0.6, 0.8), (4.0, 0.9), (8.1, 0.7)]); rail(ax, [(0.6, 0.45), (8.1, 0.4)])
    ax.add_patch(Rectangle((0.6, 2.5), 2.6, 1.3, color='#FFF176', alpha=0.8, zorder=1)); ax.text(1.9, 3.15, 'PLANTATION\n(oil palm)', fontsize=12, fontweight='bold', ha='center', va='center', color='#6D4C41', zorder=10)
    for x in np.arange(0.8, 3.2, 0.3):
        for y in (2.7, 3.55): ax.plot(x, y, marker='$*$', ms=8, color='#827717', zorder=4)
    forest(ax, [(5.5, 3.0), (8.1, 3.0), (8.1, 4.6), (5.5, 4.6)], n=30); tlab(ax, 6.8, 2.75, 'forest reserve', c='#1B5E20', fs=11)
    ax.plot(6.0, 1.3, '^', ms=15, color=ORANGE, zorder=12); tlab(ax, 6.0, 1.05, 'quarry', c=ORANGE, fs=11)
    ax.add_patch(Rectangle((3.5, 0.95), 0.6, 0.35, color='#546E7A', zorder=12)); tlab(ax, 3.8, 1.55, 'factory near road, rail, river', c='#37474F', fs=11)
    huts(ax, [(4.6, 2.9), (4.8, 3.1), (4.4, 3.2), (4.9, 2.8)]); grass(ax, [(3.4, 3.4), (5.3, 3.4), (5.3, 4.6), (3.4, 4.6)], n=15); tlab(ax, 4.4, 4.1, 'grazing', c='#558B2F', fs=11)
    key(ax, [('#FFF176', 'Plantation'), ('forest', 'Forest reserve'), ('grass', 'Grazing land'), ('^#E65100', 'Quarry'), ('s#546E7A', 'Factory'), ('rail', 'Railway')]); scale_bar(ax); north(ax)
    save(fig, 'topo_landuse_big.png')


# ---------- MAP ANALYSIS 8–9: SETTLEMENT ----------
def topo_settle_big():
    fig, ax = canvas('white'); topo(ax, [(6.8, 3.9, 240, 1.3, 0.9), (1.2, 4.3, 120, 1.0, 0.5)], base=100, step=20, clab=False)
    river(ax, [(0.6, 2.0), (2.6, 2.3), (4.6, 1.6), (8.1, 1.9)]); road(ax, [(0.6, 0.8), (4.0, 0.9), (8.1, 0.7)])
    huts(ax, [(1.2 + dx, 2.75 + dy) for dx, dy in [(0, 0), (0.15, 0.1), (-0.1, 0.12), (0.12, -0.08), (0.6, 0.05), (-0.05, -0.12), (0.05, 0.22), (0.2, 0.2)]]); tlab(ax, 1.3, 3.25, 'nucleated (river crossing)', c=RED, fs=11)
    huts(ax, [(x, 0.95 + 0.03 * np.sin(x * 4)) for x in np.arange(4.4, 7.4, 0.22)]); tlab(ax, 5.8, 1.3, 'linear (along road)', c=BLUE, fs=11)
    rng = np.random.default_rng(3); huts(ax, [(rng.uniform(5.4, 8.0), rng.uniform(2.6, 4.5)) for _ in range(9)]); tlab(ax, 6.9, 2.45, 'dispersed (hill farms)', c=GREEN, fs=11)
    tlab(ax, 3.4, 4.1, 'no settlement: steep slopes', c=BR, fs=11); swamp(ax, 3.4, 1.5); tlab(ax, 3.4, 1.25, 'swamp: avoided', c=BLUE, fs=11)
    key(ax, [('hut', 'Huts / houses'), ('road', 'Road'), ('river', 'River'), ('swamp', 'Swamp'), ('contour', 'Contour')]); scale_bar(ax); north(ax)
    save(fig, 'topo_settle_big.png')


def topo_urban_big():
    fig, ax = canvas('white'); ax.add_patch(Rectangle((X0, Y0), X1 - X0, Y1 - Y0, color='#FFFDF5'))
    river(ax, [(0.6, 0.9), (3.0, 1.0), (5.0, 0.8), (8.1, 1.0)], w=5); rail(ax, [(0.6, 1.5), (8.1, 1.55)])
    for x in np.arange(3.0, 5.2, 0.3):
        for y in np.arange(2.3, 3.6, 0.3): ax.add_patch(Rectangle((x, y), 0.24, 0.24, color='#B71C1C', zorder=5))
    for x in np.arange(0.5, 2.7, 0.35):
        for y in (1.7, 2.1): ax.add_patch(Rectangle((x, y), 0.3, 0.25, color='#546E7A', zorder=5))
    rng = np.random.default_rng(5)
    for _ in range(90): x, y = rng.uniform(5.4, 8.1), rng.uniform(1.8, 4.6); ax.add_patch(Rectangle((x, y), 0.07, 0.07, color='#424242', zorder=5))
    for x in np.arange(0.6, 2.8, 0.45):
        for y in np.arange(3.0, 4.5, 0.45): ax.add_patch(Rectangle((x, y), 0.16, 0.16, color='#6D4C41', zorder=5)); ax.plot(x + 0.3, y + 0.3, marker='$♣$', ms=7, color='#2E7D32', zorder=5)
    for pts in ([(0.6, 2.9), (8.1, 3.0)], [(4.1, 1.2), (4.1, 4.65)], [(4.1, 2.95), (8.1, 4.4)]): road(ax, pts, w=3)
    tlab(ax, 4.1, 3.85, 'CBD (dense grid)', c=RED, fs=12); tlab(ax, 1.6, 2.55, 'industrial zone (rail, river)', c='#37474F', fs=11); tlab(ax, 1.6, 4.55, 'low-density residential', c='#6D4C41', fs=11)
    tlab(ax, 6.8, 4.55, 'high-density / informal', c='#424242', fs=11); tlab(ax, 4.2, 0.5, 'port / river front', c=BLUE, fs=11)
    ax.add_patch(Rectangle((X0, Y0), X1 - X0, Y1 - Y0, fill=False, ec='#263238', lw=2.5, zorder=40))
    key(ax, [('#B71C1C', 'Commercial (CBD)'), ('#546E7A', 'Industry'), ('#6D4C41', 'Low density housing'), ('#424242', 'High density housing'), ('road', 'Road'), ('rail', 'Railway')]); north(ax)
    save(fig, 'topo_urban_big.png')


def site_factors_big(): boxes4('site_factors_big.png', [('WATER SUPPLY', BLUE, 'near rivers and springs,\nbut above flood level'), ('RELIEF', BR, 'gentle slopes, hill tops\nfor defence'),
                                                        ('ROUTES', RED, 'junctions, bridges,\nriver crossings'), ('SOIL AND RESOURCES', GREEN, 'fertile land, forests,\nminerals')])


# ---------- CARTOGRAPHIC TOOLS ----------
def isopleth_big():
    fig, ax = canvas('white'); xs, ys = np.meshgrid(np.linspace(0.3, 7.5, 200), np.linspace(0.3, 4.7, 120)); z = 3000 - 380 * ys - 60 * xs + 800 * np.exp(-(((xs - 2) / 1.0) ** 2 + ((ys - 1.6) / 0.8) ** 2))
    cs = ax.contourf(xs, ys, z, levels=[0, 500, 1000, 1500, 2000, 2500, 4000], colors=['#FFF9C4', '#C8E6C9', '#81C784', '#4DB6AC', '#1E88E5', '#0D47A1'], zorder=1)
    c2 = ax.contour(xs, ys, z, levels=[500, 1000, 1500, 2000, 2500], colors='#263238', linewidths=1.5, zorder=2); ax.clabel(c2, fmt='%d mm', fontsize=11)
    ax.add_patch(Rectangle((0.3, 0.3), 7.2, 4.4, fill=False, ec='#263238', lw=2))
    ax.text(8.0, 4.2, 'ISOPLETH MAP', fontsize=18, fontweight='bold', color=NAVY); ax.text(8.0, 3.5, 'lines join places with\nthe same value', fontsize=15, fontweight='bold', color=NAVY, va='top')
    ax.text(8.0, 2.3, 'isohyets = rainfall\nisotherms = temperature\nisobars = pressure\ncontours = height', fontsize=15, fontweight='bold', color=BLUE, va='top')
    save(fig, 'isopleth_big.png')


def prop_circles_big():
    fig, ax = canvas('white'); D = [('Douala', 3.9, 2.4, 3.9), ('Yaoundé', 4.3, 6.4, 3.0), ('Garoua', 0.9, 9.3, 3.6), ('Bamenda', 0.6, 11.4, 2.9), ('Maroua', 0.5, 11.5, 1.0)]
    for n, v, x, y in D[:4]: r = 0.45 * np.sqrt(v); y = y - 0.35; ax.add_patch(Circle((x, y), r, color=RED, alpha=0.75)); ax.text(x, y - r - 0.3, f'{n}\n{v} M', fontsize=14, fontweight='bold', ha='center', va='top', color=NAVY)
    ax.text(0.3, 4.6, 'PROPORTIONAL CIRCLES: area ∝ value, so radius ∝ √value', fontsize=16, fontweight='bold', color=NAVY)
    ax.text(0.3, 0.45, 'e.g. √3.9 = 1.97 and √0.9 = 0.95 → Douala\'s radius is about twice Garoua\'s (population in millions, approximate)', fontsize=13.5, fontweight='bold', color='#555')
    save(fig, 'prop_circles_big.png')


def star_big():
    fig = plt.figure(figsize=(12.8, 5.0), dpi=150); ax = fig.add_axes([0.02, 0.05, 0.45, 0.9], projection='polar'); ax.set_theta_zero_location('N'); ax.set_theta_direction(-1)
    d = [18, 8, 5, 6, 12, 10, 25, 16]; th = np.deg2rad(np.arange(0, 360, 45))
    ax.bar(th, d, width=np.deg2rad(30), color=[BLUE if v < 20 else RED for v in d], alpha=0.85, edgecolor='white')
    ax.set_xticks(th); ax.set_xticklabels(['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'], fontsize=15, fontweight='bold'); ax.tick_params(axis='y', labelsize=11)
    t = fig.add_axes([0.5, 0, 0.5, 1]); t.axis('off')
    t.text(0.02, 0.85, 'STAR DIAGRAM (wind rose)', fontsize=19, fontweight='bold', color=NAVY); t.text(0.02, 0.62, 'Each bar = number of days\nthe wind came from that\ndirection (hypothetical)', fontsize=16, fontweight='bold', color=NAVY, va='top')
    t.text(0.02, 0.25, 'Prevailing wind: WEST (25 days)', fontsize=17, fontweight='bold', color=RED)
    fig.savefig(OUT + 'star_big.png', dpi=150, facecolor='white'); plt.close(fig)


def flow_map_big():
    fig, ax = map_axes([5, 20, 1.5, 13.5]); ax.add_geometries([country('Cameroon')], PC, facecolor='#FFF3E0', edgecolor='#555', lw=1.5, zorder=5)
    D = (9.7, 4.05)
    for (x, y, v, t) in [(14.3, 10.6, 9, 'Far North'), (13.4, 9.3, 7, 'North'), (10.2, 5.95, 12, 'West'), (13.7, 4.4, 4, 'East')]:
        ax.annotate('', xy=D, xytext=(x, y), arrowprops=dict(arrowstyle='-|>', lw=v * 0.9, color=RED, alpha=0.8, mutation_scale=18 + v * 1.5), xycoords=PC._as_mpl_transform(ax), textcoords=PC._as_mpl_transform(ax), zorder=10)
        mlab(ax, x, y + 0.5, f'{t}: {v}k', fs=12, c=NAVY)
    mlab(ax, 9.3, 3.3, 'Douala', fs=13, c=RED)
    ax.text(0.01, 0.97, 'FLOW-LINE MAP\nwidth ∝ number of migrants\n(hypothetical)', transform=ax.transAxes, ha='left', va='top', fontsize=15, fontweight='bold', color=NAVY, bbox=dict(fc='white', ec='none', alpha=0.85))
    msave(fig, 'flow_map_big.png')


# ---------- DATA COLLECTION ----------
def data_sources_big(): two_cols('data_sources_big.png', 'PRIMARY DATA (you collect)', 'SECONDARY DATA (already exists)', GREEN, BLUE,
                                 ['observation and counting', 'measurements (rain gauge, tape)', 'questionnaires, interviews', 'photos, videos, focus groups'],
                                 ['census (BUCREP), statistics (INS)', 'maps, atlases, satellite images', 'books, reports, internet', 'weather station records'])


def sampling_big():
    fig, ax = canvas('white'); rng = np.random.default_rng(7); T = [('RANDOM', 'every point has an\nequal chance (random numbers)'), ('SYSTEMATIC', 'regular interval:\nevery 10th house, every 5 m'), ('STRATIFIED', 'sample each group\nin proportion to its size')]
    for k, (t, s) in enumerate(T):
        x0 = 0.4 + k * 4.2; ax.add_patch(Rectangle((x0, 1.3), 3.6, 2.7, fill=False, ec='#546E7A', lw=2))
        if k == 2: ax.add_patch(Rectangle((x0, 1.3), 1.4, 2.7, color='#C8E6C9')); ax.add_patch(Rectangle((x0 + 1.4, 1.3), 2.2, 2.7, color='#FFE0B2'))
        for i in range(8):
            for j in range(5): ax.plot(x0 + 0.25 + i * 0.44, 1.55 + j * 0.55, '.', ms=6, color='#90A4AE')
        if k == 0: P = [(x0 + 0.25 + rng.integers(0, 8) * 0.44, 1.55 + rng.integers(0, 5) * 0.55) for _ in range(8)]
        elif k == 1: P = [(x0 + 0.25 + i * 0.44, 1.55 + j * 0.55) for i in range(0, 8, 2) for j in range(0, 5, 2)]
        else: P = [(x0 + 0.25 + i * 0.44, 1.55 + j * 0.55) for i, j in [(0, 1), (2, 3), (4, 0), (5, 2), (6, 4), (7, 1), (4, 3), (1, 4)]]
        for p in P: ax.plot(*p, 'o', ms=12, color=RED)
        ax.text(x0 + 1.8, 4.5, t, fontsize=18, fontweight='bold', ha='center', color=NAVY); ax.text(x0 + 1.8, 0.7, s, fontsize=13.5, fontweight='bold', ha='center', va='center', color=RED)
    save(fig, 'sampling_big.png')


def questionnaire_big():
    table_big('questionnaire_big.png', ['Good question', 'Bad question', 'Why'],
              [['Where do you buy food?', 'Isn\'t the market dirty?', 'leading'], ['How many times a week?', 'Do you shop often?', 'vague'],
               ['Age group: 15–24 / 25–44 / 45+', 'What is your exact income?', 'too personal']], colw=[4.8, 4.6, 2.6], fs=17)


# ---------- DATA ANALYSIS ----------
def stats_central_big():
    table_big('stats_central_big.png', ['Data: monthly rainfall at a station (mm)', 'Result'],
              [['12, 20, 35, 35, 60, 110, 180, 250, 300', 'n = 9, total = 1,002'], ['Mean = total ÷ n', '1,002 ÷ 9 = 111.3 mm'], ['Median = middle value (5th)', '60 mm'],
               ['Mode = most frequent', '35 mm'], ['Range = highest − lowest', '300 − 12 = 288 mm'], ['Quartiles: LQ = 27.5, UQ = 215', 'IQR = 215 − 27.5 = 187.5 mm']], colw=[7.0, 5.0], fs=17)


def sd_big():
    table_big('sd_big.png', ['x (daily max °C)', 'x − mean', '(x − mean)²'],
              [['30', '−2', '4'], ['31', '−1', '1'], ['32', '0', '0'], ['33', '+1', '1'], ['34', '+2', '4'], ['Σx = 160, mean = 32', '', 'Σ = 10']], colw=[4.4, 3.4, 4.2], fs=18,
              note='Variance = 10 ÷ 5 = 2;  SD = √2 = 1.41 °C;  CV = SD ÷ mean × 100 = 4.4 %')


def spearman_big():
    table_big('spearman_big.png', ['Town', 'Population rank', 'Services rank', 'd', 'd²'],
              [['A', '1', '1', '0', '0'], ['B', '2', '3', '−1', '1'], ['C', '3', '2', '1', '1'], ['D', '4', '4', '0', '0'], ['E', '5', '6', '−1', '1'], ['F', '6', '5', '1', '1']],
              colw=[1.6, 3.2, 3.2, 1.6, 1.6], fs=18, note='Rs = 1 − (6Σd²) ÷ (n³ − n) = 1 − (6 × 4) ÷ (216 − 6) = 1 − 0.11 = +0.89: strong positive correlation')


def box_whisker_big():
    fig, ax = chart(); d = [12, 20, 35, 35, 60, 110, 180, 250, 300]
    ax.boxplot([d], orientation='horizontal', widths=0.5, patch_artist=True, boxprops=dict(facecolor='#BBDEFB', lw=2.5), medianprops=dict(color=RED, lw=4), whiskerprops=dict(lw=2.5), capprops=dict(lw=2.5))
    for v, t, y in [(12, 'lowest', 1.4), (27.5, 'LQ', 0.55), (60, 'median', 1.4), (215, 'UQ', 0.55), (300, 'highest', 1.4)]: ax.text(v, y, t, fontsize=16, fontweight='bold', ha='center', color=NAVY)
    ax.set_yticks([]); ax.set_xlabel('Monthly rainfall (mm)', fontsize=19, fontweight='bold'); ax.set_ylim(0.3, 1.7)
    fig.savefig(OUT + 'box_whisker_big.png', dpi=150, facecolor='white'); plt.close(fig)


# ---------- GRAPHICAL TECHNIQUES ----------
def compound_bar_big():
    fig, ax = chart(); y = ['1987', '2005', '2020']; u = np.array([38, 49, 57]); r = 100 - u
    ax.bar(y, r, color=GREEN, width=0.55, label='Rural %'); ax.bar(y, u, bottom=r, color=ORANGE, width=0.55, label='Urban %')
    for i in range(3): ax.text(i, r[i] / 2, f'{r[i]} %', ha='center', fontsize=18, fontweight='bold', color='white'); ax.text(i, r[i] + u[i] / 2, f'{u[i]} %', ha='center', fontsize=18, fontweight='bold', color='white')
    ax.set_ylabel('% of population', fontsize=19, fontweight='bold'); ax.legend(fontsize=17, frameon=False, loc='upper left', bbox_to_anchor=(1.0, 1)); ax.set_xticks(range(3)); ax.set_xticklabels(y, fontsize=20, fontweight='bold')
    ax.set_title('Compound bar graph: urban and rural population of Cameroon (approximate)', fontsize=16, fontweight='bold', color=NAVY); fig.subplots_adjust(right=0.8)
    fig.subplots_adjust(top=0.9); fig.savefig(OUT + 'compound_bar_big.png', dpi=150, facecolor='white'); plt.close(fig)


def ogive_big():
    fig, ax = chart(); x = [0, 10, 20, 30, 40, 50, 60]; c = [0, 4, 12, 26, 38, 46, 50]
    ax.plot(x, c, lw=6, marker='o', ms=10, color=NAVY); ax.axhline(25, color=RED, ls='--', lw=2); ax.axvline(29.3, color=RED, ls='--', lw=2)
    ax.text(30.5, 3, 'median ≈ 29 min', fontsize=16, fontweight='bold', color=RED); ax.text(1, 27, 'n ÷ 2 = 25', fontsize=16, fontweight='bold', color=RED)
    ax.set_xlabel('Travel time to school (minutes, upper class limit)', fontsize=17, fontweight='bold'); ax.set_ylabel('Cumulative frequency', fontsize=17, fontweight='bold')
    ax.set_title('Ogive (cumulative frequency curve), 50 students (hypothetical)', fontsize=16, fontweight='bold', color=NAVY); fig.subplots_adjust(top=0.9)
    fig.savefig(OUT + 'ogive_big.png', dpi=150, facecolor='white'); plt.close(fig)


def pie_big():
    fig, ax = plt.subplots(figsize=(12.8, 5.6), dpi=150); fig.subplots_adjust(0, 0, 1, 1); v = [44, 15, 41]; n = ['Farming 44 %', 'Industry 15 %', 'Services 41 %']
    ax.pie(v, colors=[GREEN, '#607D8B', BLUE], startangle=90, counterclock=False, wedgeprops=dict(ec='white', lw=3), center=(-0.8, 0), radius=1.0)
    for i, t in enumerate(n): ax.text(1.0, 0.45 - i * 0.35, t, fontsize=19, fontweight='bold', color=[GREEN, '#607D8B', BLUE][i])
    ax.text(1.0, 0.85, 'Pie chart: jobs by sector (approximate)', fontsize=18, fontweight='bold', color=NAVY); ax.text(1.0, -0.75, 'Angle = % × 3.6\n44 % → 158°', fontsize=17, fontweight='bold', color=RED)
    ax.set_xlim(-2.0, 3.9); ax.set_ylim(-1.15, 1.15); ax.set_aspect('equal')
    fig.savefig(OUT + 'pie_big.png', dpi=150, facecolor='white'); plt.close(fig)


def triangular_big():
    fig, ax = canvas('white'); A, Bp, Cp = np.array([1.6, 0.6]), np.array([6.4, 0.6]), np.array([4.0, 0.6 + 4.8 * 0.83])
    ax.add_patch(Polygon([A, Bp, Cp], fill=False, ec=NAVY, lw=2.5))
    def pt(p, s, t): return (p * Cp + s * Bp + t * A) / 100
    for k in range(10, 100, 10):
        for P, Q in [((k, 0, 100 - k), (k, 100 - k, 0)), ((0, k, 100 - k), (100 - k, k, 0)), ((0, 100 - k, k), (100 - k, 0, k))]: ax.plot(*zip(pt(*P), pt(*Q)), color='#CFD8DC', lw=0.8)
    for (p, s, t), n, c in [((70, 10, 20), 'Chad', GREEN), ((44, 15, 41), 'Cameroon', ORANGE), ((2, 20, 78), 'UK', BLUE)]: ax.plot(*pt(p, s, t), 'o', ms=14, color=c); ax.text(*(pt(p, s, t) + np.array([0.2, 0.05])), n, fontsize=15, fontweight='bold', color=c)
    ax.text(*Cp + np.array([0, 0.2]), '100 % primary', fontsize=14, fontweight='bold', ha='center'); ax.text(*Bp + np.array([0.1, -0.3]), '100 % secondary', fontsize=14, fontweight='bold', ha='center'); ax.text(*A + np.array([-0.1, -0.3]), '100 % tertiary', fontsize=14, fontweight='bold', ha='center')
    ax.text(7.6, 3.8, 'TRIANGULAR GRAPH', fontsize=18, fontweight='bold', color=NAVY); ax.text(7.6, 3.1, 'three parts that add\nup to 100 %', fontsize=16, fontweight='bold', color=NAVY, va='top')
    ax.text(7.6, 1.8, 'Cameroon: 44 % primary,\n15 % secondary, 41 % tertiary\n(approximate)', fontsize=15, fontweight='bold', color=ORANGE, va='top')
    save(fig, 'triangular_big.png')


def scatter_big():
    fig, ax = chart(); rng = np.random.default_rng(2); x = np.array([300, 500, 700, 900, 1100, 1300, 1500, 1700, 1900, 2100]); y = 29 - 0.0062 * x + rng.normal(0, 0.6, 10)
    ax.scatter(x, y, s=150, color=NAVY, zorder=3); m, b = np.polyfit(x, y, 1); ax.plot(x, m * x + b, color=RED, lw=4, ls='--', label='best-fit line')
    ax.set_xlabel('Altitude (m)', fontsize=19, fontweight='bold'); ax.set_ylabel('Mean temperature (°C)', fontsize=19, fontweight='bold'); ax.legend(fontsize=17, frameon=False)
    ax.set_title('Scatter graph: negative correlation (hypothetical stations)', fontsize=16, fontweight='bold', color=NAVY)
    fig.subplots_adjust(top=0.9); fig.savefig(OUT + 'scatter_big.png', dpi=150, facecolor='white'); plt.close(fig)


def graph_choice_big():
    table_big('graph_choice_big.png', ['Graph', 'Best used for'],
              [['Bar graph (simple, compound)', 'comparing amounts between places or years'], ['Line graph', 'change over time (population, rainfall)'], ['Climograph', 'rainfall (bars) and temperature (line) of a station'],
               ['Pie chart', 'parts of a whole (%)'], ['Triangular graph', 'three parts adding to 100 % (soil, jobs)'], ['Scatter graph / ogive', 'relationship between two variables / cumulative data']], colw=[4.4, 7.6], fs=17)


# ---------- FIELDWORK ----------
def fieldwork_steps_big():
    fig, ax = canvas('white'); S = [('1. AIM /\nHYPOTHESIS', NAVY), ('2. PLAN:\nsites, tools,\nsafety', BLUE), ('3. COLLECT\ndata', GREEN), ('4. PRESENT:\nmaps, graphs', ORANGE), ('5. ANALYSE\nand conclude', RED)]
    for k, (t, c) in enumerate(S):
        x = 0.3 + k * 2.52; box_(ax, x, 1.7, 2.1, 1.6, t, c, fs=15)
        if k < 4: arrow(ax, (x + 2.12, 2.5), (x + 2.5, 2.5), c='#90A4AE', lw=3, ms=20)
    ax.text(6.4, 0.8, 'Example hypothesis: "River velocity increases downstream."', fontsize=16, fontweight='bold', ha='center', color=NAVY)
    save(fig, 'fieldwork_steps_big.png')


def bearings_big():
    fig, ax = canvas('white'); c = (3.0, 2.5)
    ax.add_patch(Circle(c, 2.0, fill=False, ec=NAVY, lw=2.5))
    for a, t in [(0, 'N 000°'), (90, 'E 090°'), (180, 'S 180°'), (270, 'W 270°'), (45, 'NE'), (135, 'SE'), (225, 'SW'), (315, 'NW')]:
        r = np.deg2rad(90 - a); ax.plot([c[0], c[0] + 2.0 * np.cos(r)], [c[1], c[1] + 2.0 * np.sin(r)], color='#90A4AE', lw=1.5)
        ax.text(c[0] + 2.35 * np.cos(r), c[1] + 2.25 * np.sin(r), t, fontsize=14 if len(t) > 2 else 13, fontweight='bold', ha='center', va='center', color=NAVY)
    r = np.deg2rad(90 - 120); ax.annotate('', xy=(c[0] + 1.9 * np.cos(r), c[1] + 1.9 * np.sin(r)), xytext=c, arrowprops=dict(arrowstyle='-|>', lw=4, color=RED, mutation_scale=25))
    ax.add_patch(matplotlib.patches.Arc(c, 1.2, 1.2, theta1=-30, theta2=90, color=RED, lw=2.5)); ax.text(c[0] + 0.75, c[1] + 0.55, '120°', fontsize=15, fontweight='bold', color=RED)
    ax.text(6.3, 4.2, 'BEARING: angle measured', fontsize=17, fontweight='bold', color=NAVY); ax.text(6.3, 3.7, 'CLOCKWISE from NORTH (3 figures)', fontsize=17, fontweight='bold', color=NAVY)
    ax.text(6.3, 2.8, 'School → market = 120° (ESE)', fontsize=16, fontweight='bold', color=RED)
    ax.text(6.3, 1.9, 'Compass: hold flat, turn until the', fontsize=15, fontweight='bold', color=GREEN); ax.text(6.3, 1.45, 'needle points N, read the angle', fontsize=15, fontweight='bold', color=GREEN)
    ax.text(6.3, 0.6, 'GPS: gives latitude, longitude, altitude', fontsize=15, fontweight='bold', color=ORANGE)
    save(fig, 'bearings_big.png')


def channel_measure_big():
    fig, ax = canvas('#E3F2FD'); x = np.linspace(1, 7, 100); d = 0.3 + 1.6 * np.sin((x - 1) / 6 * np.pi)
    ax.fill_between(x, 4.0 - d, 4.0, color='#64B5F6'); ax.plot(x, 4.0 - d, color='#5D4037', lw=4); ax.plot([0.5, 1, 1], [4.3, 4.3, 4.0], color='#5D4037', lw=4); ax.plot([7, 7, 7.5], [4.0, 4.3, 4.3], color='#5D4037', lw=4)
    ax.annotate('', xy=(7, 4.55), xytext=(1, 4.55), arrowprops=dict(arrowstyle='<->', lw=2.5, color=RED)); ax.text(4, 4.7, 'width = 6 m', fontsize=15, fontweight='bold', color=RED, ha='center')
    for xx in np.arange(1.5, 7, 1): dd = 0.3 + 1.6 * np.sin((xx - 1) / 6 * np.pi); ax.plot([xx, xx], [4.0, 4.0 - dd], color=NAVY, lw=2); ax.text(xx, 4.0 - dd - 0.25, f'{dd * 0.5:.1f}', fontsize=12, fontweight='bold', color=NAVY, ha='center')
    ax.text(4, 1.2, 'depths (m) every 1 m', fontsize=14, fontweight='bold', color=NAVY, ha='center')
    ax.text(7.8, 3.9, 'Area = width × mean depth', fontsize=16, fontweight='bold', color=NAVY); ax.text(7.8, 3.4, '     = 6 × 0.5 = 3.0 m²', fontsize=16, fontweight='bold', color=NAVY)
    ax.text(7.8, 2.6, 'Velocity (float): 10 m in 20 s', fontsize=16, fontweight='bold', color=GREEN); ax.text(7.8, 2.1, '     = 0.5 m/s', fontsize=16, fontweight='bold', color=GREEN)
    ax.text(7.8, 1.3, 'Discharge Q = A × V', fontsize=17, fontweight='bold', color=RED); ax.text(7.8, 0.8, '     = 3.0 × 0.5 = 1.5 m³/s', fontsize=17, fontweight='bold', color=RED)
    save(fig, 'channel_measure_big.png')


def load_size_big():
    fig, ax = chart(); s = ['Site 1\n(upstream)', 'Site 2', 'Site 3', 'Site 4\n(downstream)']; v = [22, 15, 9, 4]; r = [1.5, 2.5, 3.5, 4.5]
    ax.bar(np.arange(4) - 0.2, v, width=0.4, color='#8D6E63', label='Mean pebble size (cm)'); a2 = ax.twinx(); a2.plot(range(4), r, lw=5, marker='o', ms=11, color=RED, label='Roundness (1–6)')
    ax.set_xticks(range(4)); ax.set_xticklabels(s, fontsize=16, fontweight='bold'); ax.set_ylabel('Size (cm)', fontsize=18, fontweight='bold'); a2.set_ylabel('Roundness', fontsize=18, fontweight='bold', color=RED); a2.set_ylim(0, 6); a2.tick_params(labelsize=18)
    ax.legend(loc='upper center', fontsize=15, frameon=False); a2.legend(loc='upper right', fontsize=15, frameon=False); ax.set_ylim(0, 30)
    ax.set_title('Load gets smaller and rounder downstream (hypothetical)', fontsize=16, fontweight='bold', color=NAVY)
    fig.subplots_adjust(top=0.9); fig.savefig(OUT + 'load_size_big.png', dpi=150, facecolor='white'); plt.close(fig)


def slope_survey_big():
    fig, ax = canvas('white'); x = np.linspace(0.6, 9.0, 60); y = 0.8 + 3.0 * np.exp(-(x - 0.6) / 2.8)
    ax.fill_between(x, 0.5, y, color='#D7CCC8'); ax.plot(x, y, color=BR, lw=3)
    for i, xx in enumerate([1.2, 3.0]):
        yy = 0.8 + 3.0 * np.exp(-(xx - 0.6) / 2.8); x2 = xx + 1.8; y2 = 0.8 + 3.0 * np.exp(-(x2 - 0.6) / 2.8)
        for px, py in ((xx, yy), (x2, y2)): ax.plot([px, px], [py, py + 1.0], color=RED if i == 0 else ORANGE, lw=5)
        ax.plot([xx, x2], [yy + 0.8, y2 + 0.8], color=NAVY, lw=1.5, ls='--')
    ax.text(2.1, 4.35, 'ranging poles', fontsize=14, fontweight='bold', color=RED, ha='center'); ax.text(2.4, 2.45, 'clinometer angle', fontsize=13, fontweight='bold', color=NAVY)
    ax.text(9.2, 4.2, 'Long or beach profile:', fontsize=16, fontweight='bold', color=NAVY); ax.text(9.2, 3.6, '• poles at fixed intervals\n• angle with a clinometer\n  (phone app)\n• distance with a tape\n• plot a profile graph', fontsize=14, fontweight='bold', color=NAVY, va='top')
    save(fig, 'slope_survey_big.png')


def longshore_big():
    fig, ax = canvas('#FFF8E1'); ax.add_patch(Rectangle((0, 0), 12.8, 1.8, color='#64B5F6'))
    for x in np.arange(1.0, 11.0, 2.4):
        ax.annotate('', xy=(x + 1.0, 2.6), xytext=(x, 1.0), arrowprops=dict(arrowstyle='-|>', lw=3.5, color=NAVY, mutation_scale=20))
        ax.annotate('', xy=(x + 1.0, 1.3), xytext=(x + 1.0, 2.55), arrowprops=dict(arrowstyle='-|>', lw=3.5, color=RED, mutation_scale=20))
        ax.plot([x, x + 1.0, x + 1.0], [2.2, 2.9, 2.2], color='#795548', lw=1.5, ls=':')
    ax.text(1.0, 0.45, 'wind and waves from the SW', fontsize=15, fontweight='bold', color='white'); ax.text(6.4, 4.4, 'Swash (up the beach at an angle) and backwash (straight back down)', fontsize=15, fontweight='bold', ha='center', color=NAVY)
    ax.annotate('', xy=(12.3, 3.5), xytext=(8.5, 3.5), arrowprops=dict(arrowstyle='-|>', lw=5, color=ORANGE, mutation_scale=28)); ax.text(10.4, 3.8, 'LONGSHORE DRIFT', fontsize=16, fontweight='bold', color=ORANGE, ha='center')
    ax.text(3.2, 3.6, 'Field test: put a float or painted\npebble in the sea, time and\nmeasure how far it moves', fontsize=14, fontweight='bold', color=GREEN, ha='center', va='center')
    save(fig, 'longshore_big.png')


def kite_big():
    fig, ax = canvas('white'); sites = np.arange(0, 10); ax.plot([2.1, 11.4], [0.7, 0.7], color='#333', lw=2)
    for k, (n, v, c) in enumerate([('Tall grass', [0, 5, 20, 35, 40, 30, 15, 5, 0, 0], '#558B2F'), ('Shrubs', [10, 25, 30, 20, 10, 5, 0, 0, 0, 0], '#8D6E63'), ('Trees', [0, 0, 0, 5, 10, 20, 35, 45, 50, 55], '#1B5E20')]):
        y0 = 1.6 + k * 1.2; w = np.array(v) / 100 * 1.0; xs = 2.2 + sites * 1.0
        ax.fill_between(xs, y0 - w / 2, y0 + w / 2, color=c, alpha=0.85); ax.text(2.0, y0, n, fontsize=14, fontweight='bold', ha='right', va='center', color=c)
    for s in sites: ax.text(2.2 + s * 1.0, 0.4, f'{s * 10} m', fontsize=12, fontweight='bold', ha='center')
    ax.text(6.4, 4.75, 'Kite diagram: % cover in quadrats along a transect (hypothetical)', fontsize=15, fontweight='bold', ha='center', color=NAVY)
    save(fig, 'kite_big.png')


def farm_distance_big():
    fig, ax = chart(); d = ['0–1 km', '1–3 km', '3–5 km', '5–8 km']; ax.bar(np.arange(4) - 0.2, [85, 60, 35, 15], width=0.4, color=GREEN, label='% of land cultivated')
    ax.bar(np.arange(4) + 0.2, [9, 6, 3, 1], width=0.4, color=ORANGE, label='Visits per week'); ax.set_xticks(range(4)); ax.set_xticklabels(d, fontsize=18, fontweight='bold')
    ax.set_xlabel('Distance from the village', fontsize=18, fontweight='bold'); ax.legend(fontsize=16, frameon=False); ax.set_title('Farm intensity falls with distance (hypothetical survey)', fontsize=16, fontweight='bold', color=NAVY)
    fig.subplots_adjust(top=0.9); fig.savefig(OUT + 'farm_distance_big.png', dpi=150, facecolor='white'); plt.close(fig)


def traffic_count_big():
    fig, ax = chart(); h = ['6–8', '8–10', '10–12', '12–14', '14–16', '16–18', '18–20']
    for i, (n, v, c) in enumerate([('Motorbikes', [60, 45, 30, 35, 30, 70, 50], ORANGE), ('Cars and taxis', [25, 30, 20, 22, 20, 35, 20], BLUE), ('Trucks', [5, 12, 15, 14, 12, 8, 3], '#5D4037')]):
        ax.bar(np.arange(7) + (i - 1) * 0.27, v, width=0.27, color=c, label=n)
    ax.set_xticks(range(7)); ax.set_xticklabels(h, fontsize=16, fontweight='bold'); ax.set_xlabel('Time of day (hours)', fontsize=18, fontweight='bold'); ax.set_ylabel('Vehicles per 15 min', fontsize=17, fontweight='bold')
    ax.legend(fontsize=15, frameon=False); ax.set_title('Traffic count on a town road: peaks at 6–8 h and 16–18 h (hypothetical)', fontsize=15, fontweight='bold', color=NAVY)
    fig.subplots_adjust(top=0.9); fig.savefig(OUT + 'traffic_count_big.png', dpi=150, facecolor='white'); plt.close(fig)


def industry_inputs_big():
    table_big('industry_inputs_big.png', ['Input', 'Cottage industry (e.g. weaving, pottery)', 'Modern factory (e.g. brewery)'],
              [['Raw materials', 'local clay, cotton, wood', 'imported and local (malt, maize)'], ['Labour', 'family, few workers', 'many paid, skilled workers'], ['Capital, power', 'hand tools, little capital', 'machines, electricity, loans'],
               ['Market', 'village and local market', 'national and export']], colw=[2.4, 4.8, 4.8], fs=17)


def sphere_big():
    fig, ax = canvas('#F1F8E9'); c = (6.4, 2.5); ax.plot(*c, 's', ms=24, color=RED, zorder=10); ax.text(6.4, 2.0, 'MARKET', fontsize=15, fontweight='bold', ha='center', color=RED)
    rng = np.random.default_rng(4)
    for _ in range(26):
        a = rng.uniform(0, 2 * np.pi); r = rng.uniform(0.5, 1.7) * (1.35 if np.cos(a) > 0.3 else 1.0); p = (c[0] + 2.4 * r * np.cos(a), c[1] + 1.05 * r * np.sin(a))
        ax.plot([p[0], c[0]], [p[1], c[1]], color='#546E7A', lw=1.5, zorder=3); ax.plot(*p, 'o', ms=8, color=NAVY, zorder=5)
    ax.add_patch(Ellipse((6.9, 2.5), 10.5, 4.3, fill=False, ec=ORANGE, lw=3, ls='--')); ax.text(11.2, 4.5, 'sphere of influence', fontsize=15, fontweight='bold', color=ORANGE, ha='center')
    ax.text(0.3, 0.3, 'Desire lines: where buyers come from (questionnaire at the market). Longer to the east = along the main road.', fontsize=13, fontweight='bold', color=NAVY)
    save(fig, 'sphere_big.png')


def landuse_transect_big():
    fig, ax = canvas('white'); Z = [('CBD: shops,\nbanks', '#B71C1C', 2.2), ('Mixed: shops\nand houses', '#EF6C00', 2.0), ('High-density\nhousing', '#616161', 2.8), ('Low-density\nhousing', '#6D4C41', 2.4), ('Farms', '#558B2F', 2.0)]
    x = 0.4
    for t, c, w in Z: ax.add_patch(Rectangle((x, 2.2), w, 1.2, color=c)); ax.text(x + w / 2, 2.8, t, fontsize=14, fontweight='bold', ha='center', va='center', color='white'); x += w
    ax.annotate('', xy=(11.9, 1.6), xytext=(0.4, 1.6), arrowprops=dict(arrowstyle='-|>', lw=3, color=NAVY)); ax.text(6.2, 1.1, 'Distance from the town centre (land-use survey every 100 m)', fontsize=15, fontweight='bold', ha='center', color=NAVY)
    ax.text(6.2, 4.3, 'Land-use transect: land values and building heights fall outwards', fontsize=16, fontweight='bold', ha='center', color=RED)
    save(fig, 'landuse_transect_big.png')


ALL = [k for k in list(globals()) if k.endswith('_big') and k not in ('table_big',)]
if __name__ == '__main__':
    for f in (sys.argv[1:] or ALL):
        try: globals()[f](); print('ok', f)
        except Exception as e: print('FAIL', f, repr(e))
