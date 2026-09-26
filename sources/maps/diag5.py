import numpy as np, matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt, matplotlib.patheffects as pe
from matplotlib.patches import Polygon, Rectangle, Circle, Ellipse, FancyArrowPatch, FancyBboxPatch, Arc, Wedge

OUT = '/home/claude/f4/img/'
RED = '#990011'; NAVY = '#1C3F6E'; BLUE = '#1F5FBF'; SKY = '#EAF4FB'; SAND = '#E9C98B'; ROCK = '#9C7B5B'


def W(c='white'): return [pe.withStroke(linewidth=3, foreground=c)]


def canvas(w, h, bg=SKY):
    fig, ax = plt.subplots(figsize=(w, h), dpi=200)
    ax.set_xlim(0, w); ax.set_ylim(0, h); ax.set_aspect('equal'); ax.axis('off')
    if bg: ax.add_patch(Rectangle((0, 0), w, h, color=bg, zorder=0))
    return fig, ax


def arrow(ax, a, b, c=NAVY, lw=2.5, ms=18, style='-|>', cs=None, z=6):
    ax.add_patch(FancyArrowPatch(a, b, arrowstyle=style, mutation_scale=ms, color=c, lw=lw, connectionstyle=cs or 'arc3', zorder=z))


def lab(ax, x, y, t, fs=12, c='#1A1A1A', ha='center', va='center', rot=0):
    halo = W('#222') if c == 'white' else W()
    ax.text(x, y, t, fontsize=fs, color=c, ha=ha, va=va, fontweight='bold', path_effects=halo, zorder=9, rotation=rot)


def title(ax, x, y, t, fs=16):
    ax.text(x, y, t, fontsize=fs, fontweight='bold', color=RED, ha='center', va='center', zorder=10)


def save(fig, name):
    fig.savefig(OUT + name, bbox_inches='tight', pad_inches=0.06, facecolor='white'); plt.close(fig)


def sun(ax, x, y, r=0.45):
    ax.add_patch(Circle((x, y), r, color='#F7C31A', zorder=5))
    for a in np.linspace(0, 2 * np.pi, 12, endpoint=False):
        ax.plot([x + 1.25 * r * np.cos(a), x + 1.7 * r * np.cos(a)], [y + 1.25 * r * np.sin(a), y + 1.7 * r * np.sin(a)], color='#F2A900', lw=2.2, zorder=5)


def globe(ax, cx, cy, r, lat=True, lon=True, tilt=0, day=False, fc='#CFE6F5'):
    ax.add_patch(Circle((cx, cy), r, fc=fc, ec=NAVY, lw=2, zorder=2))
    if lat:
        for d in (-60, -30, 30, 60):
            y = r * np.sin(np.radians(d)); hw = r * np.cos(np.radians(d))
            ax.add_patch(Ellipse((cx, cy + y), 2 * hw, 0.18 * hw, fill=False, ec='#6D8BB0', lw=1, zorder=3))
    if lon:
        for k in (0.35, 0.72):
            ax.add_patch(Ellipse((cx, cy), 2 * r * k, 2 * r, fill=False, ec='#6D8BB0', lw=1, zorder=3))


# =============== L1 ===============
def earth_shape():
    fig, ax = canvas(12, 7.4, 'white')
    ax.add_patch(Ellipse((4.2, 3.6), 6.0, 5.7, fc='#CFE6F5', ec=NAVY, lw=2.5))
    ax.plot([1.2, 7.2], [3.6, 3.6], color=RED, lw=2); ax.plot([4.2, 4.2], [0.75, 6.45], color='#2E7D32', lw=2)
    lab(ax, 4.2, 6.75, 'North Pole (slightly flattened)', 11, NAVY); lab(ax, 4.2, 0.45, 'South Pole (slightly flattened)', 11, NAVY)
    lab(ax, 5.6, 3.95, 'Equator (bulge)', 11, RED); lab(ax, 3.2, 5.0, 'Polar\naxis', 10.5, '#2E7D32')
    items = [('Equatorial diameter', '12,756 km', RED), ('Polar diameter', '12,714 km', '#2E7D32'), ('Equatorial circumference', '40,075 km', RED), ('Polar circumference', '40,008 km', '#2E7D32')]
    for i, (n, v, c) in enumerate(items):
        y = 5.6 - i * 1.15
        ax.add_patch(FancyBboxPatch((7.9, y - 0.4), 3.9, 0.85, boxstyle='round,pad=0.02,rounding_size=0.12', fc='#F4F8FC', ec=c, lw=1.5))
        ax.text(8.05, y + 0.12, n, fontsize=10.5, color='#333', va='center'); ax.text(11.65, y - 0.15, v, fontsize=13, fontweight='bold', color=c, ha='right', va='center')
    title(ax, 6.0, 7.15, 'THE SHAPE AND SIZE OF THE EARTH: AN OBLATE SPHEROID')
    save(fig, 'earth_shape.png')


def ship_proof():
    fig, ax = canvas(13, 5.6, SKY)
    t = np.linspace(np.radians(60), np.radians(120), 200); R = 14
    xs = 6.5 + R * np.cos(t); ys = -11.2 + R * np.sin(t)
    ax.fill_between(xs, 0, ys, color='#3A7BD5', zorder=1)
    def ship(x, y, ang, s=1):
        import matplotlib.transforms as mt
        tr = mt.Affine2D().rotate_deg_around(x, y, ang) + ax.transData
        ax.add_patch(Polygon([(x - 0.6 * s, y), (x + 0.6 * s, y), (x + 0.45 * s, y - 0.3 * s), (x - 0.45 * s, y - 0.3 * s)], color='#5D4037', transform=tr, zorder=3))
        ax.add_patch(Rectangle((x - 0.03 * s, y), 0.06 * s, 1.1 * s, color='#333', transform=tr, zorder=3))
        ax.add_patch(Polygon([(x + 0.03 * s, y + 1.0 * s), (x + 0.03 * s, y + 0.25 * s), (x + 0.5 * s, y + 0.3 * s)], color='white', ec='#999', transform=tr, zorder=3))
    for x, lbl in [(3.3, '1. Whole ship\nvisible'), (6.5, '2. Hull disappears\nfirst'), (9.7, '3. Only the mast\nis visible')]:
        yy = -11.2 + np.sqrt(R ** 2 - (x - 6.5) ** 2); ang = np.degrees(np.arcsin((6.5 - x) / R))
        ship(x + 0.0, yy + (0 if x < 5 else -0.25 if x < 8 else -0.75), ang)
        lab(ax, x, 4.7, lbl, 11)
    ax.add_patch(Rectangle((0, 0), 1.2, 2.2, color='#8D6E63', zorder=2)); ax.add_patch(Circle((0.6, 2.55), 0.2, color='#333', zorder=3))
    ax.plot([0.8, 12.5], [2.55, 1.2], color='#E53935', lw=1.5, ls='--', zorder=4); lab(ax, 1.4, 3.1, 'Observer on the shore', 10, '#333', ha='left')
    title(ax, 6.5, 5.35, 'PROOF: A SHIP DISAPPEARS OVER THE CURVE OF THE EARTH')
    save(fig, 'ship_proof.png')


# =============== FS1 ===============
def moon_phases():
    fig, ax = canvas(13, 9.4, '#0F1B33')
    ex, ey = 7.0, 4.4
    ax.add_patch(Circle((ex, ey), 0.7, color='#3A7BD5', zorder=3)); ax.text(ex, ey, 'EARTH', color='white', fontsize=10, fontweight='bold', ha='center', va='center', zorder=4)
    for yy in np.linspace(1.4, 7.4, 6): arrow(ax, (0.2, yy), (1.3, yy), c='#F2C94C', lw=2, ms=12)
    ax.text(0.75, 8.0, 'Sunlight', color='#F2C94C', fontsize=12, fontweight='bold', ha='center')
    ax.add_patch(Circle((ex, ey), 2.3, fill=False, ec='#6D7A99', lw=1, ls='--', zorder=2))
    # orbit angle (sun on the left): 180 = new, 0 = full; anticlockwise motion
    data = [(180, 0, 'New Moon'), (225, 45, 'Waxing crescent'), (270, 90, 'First quarter'), (315, 135, 'Waxing gibbous'),
            (0, 180, 'Full Moon'), (45, 225, 'Waning gibbous'), (90, 270, 'Last quarter'), (135, 315, 'Waning crescent')]
    R = 0.34
    for a, ph, n in data:
        r = np.radians(a); mx, my = ex + 2.3 * np.cos(r), ey + 2.3 * np.sin(r)
        ax.add_patch(Circle((mx, my), 0.3, color='#333', zorder=3)); ax.add_patch(Wedge((mx, my), 0.3, 90, 270, color='#F5F5DC', zorder=4))
        ox, oy = ex + 4.6 * np.cos(r), ey + 3.45 * np.sin(r)
        f = (1 - np.cos(np.radians(ph))) / 2; waxing = ph < 180
        ax.add_patch(Circle((ox, oy), R, color='#333', ec='#888', lw=1, zorder=3))
        if f > 0.02:
            ax.add_patch(Wedge((ox, oy), R, -90 if waxing else 90, 90 if waxing else 270, color='#F5F5DC', zorder=4))
            w = 2 * R * abs(1 - 2 * f)
            ax.add_patch(Ellipse((ox, oy), w, 2 * R, color='#333' if f < 0.5 else '#F5F5DC', zorder=5))
        ax.text(ox, oy - 0.62, n, color='white', fontsize=10, fontweight='bold', ha='center', va='center', zorder=6)
    ax.add_patch(FancyArrowPatch((ex + 1.6, ey - 1.65), (ex + 1.65, ey + 1.6), connectionstyle='arc3,rad=0.45', arrowstyle='-|>', mutation_scale=16, color='#81C784', lw=2, zorder=3))
    ax.text(6.5, 9.05, 'THE PHASES OF THE MOON (ONE CYCLE = ABOUT 29.5 DAYS)', color='#FFCDD2', fontsize=15, fontweight='bold', ha='center')
    ax.text(0.1, 0.45, 'Inner circle: the Moon in its orbit.\nOuter circle: how the Moon\nlooks from Earth.', color='#BBB', fontsize=9, ha='left', va='center')
    save(fig, 'moon_phases.png')


def tides():
    fig, ax = canvas(12, 5.6, 'white')
    ax.add_patch(Ellipse((4.0, 2.7), 4.6, 3.3, fc='#90CAF9', ec='#1F5FBF', lw=1.5, zorder=1))
    ax.add_patch(Circle((4.0, 2.7), 1.45, fc='#8BC34A', ec='#33691E', lw=1.5, zorder=2))
    ax.add_patch(Circle((10.6, 2.7), 0.45, fc='#CFD8DC', ec='#78909C', lw=1.5)); lab(ax, 10.6, 1.9, 'Moon', 12)
    arrow(ax, (9.9, 2.7), (6.6, 2.7), c='#555', lw=2); lab(ax, 8.3, 3.05, "Moon's gravity pulls the water", 10.5, '#333')
    lab(ax, 6.45, 4.3, 'High tide', 11.5, BLUE); lab(ax, 1.5, 4.3, 'High tide', 11.5, BLUE)
    lab(ax, 4.0, 4.85, 'Low tide', 11.5, '#E65100'); lab(ax, 4.0, 0.55, 'Low tide', 11.5, '#E65100'); lab(ax, 4.0, 2.7, 'EARTH', 12, 'white')
    title(ax, 6.0, 5.35, 'HOW THE MOON CAUSES TIDES (TWO HIGH TIDES A DAY)')
    save(fig, 'tides.png')


# =============== L2 / L3 ===============
def lat_long():
    fig, ax = canvas(13, 6.8, 'white')
    cx, cy, r = 3.3, 3.2, 2.5
    ax.add_patch(Circle((cx, cy), r, fc='#CFE6F5', ec=NAVY, lw=2))
    lines = [(0, 'Equator 0°', RED), (23.44, 'Tropic of Cancer 23½°N', '#E65100'), (-23.44, 'Tropic of Capricorn 23½°S', '#E65100'), (66.56, 'Arctic Circle 66½°N', BLUE), (-66.56, 'Antarctic Circle 66½°S', BLUE)]
    for d, n, c in lines:
        y = r * np.sin(np.radians(d)); hw = r * np.cos(np.radians(d))
        ax.plot([cx - hw, cx + hw], [cy + y, cy + y], color=c, lw=2.2 if d == 0 else 1.6)
        ax.text(cx + r + 0.15, cy + y, n, fontsize=10, fontweight='bold', color=c, va='center')
    ax.text(cx, cy + r + 0.25, 'N', fontsize=12, fontweight='bold', ha='center'); ax.text(cx, cy - r - 0.35, 'S', fontsize=12, fontweight='bold', ha='center')
    ax.text(cx + 1.5, 0.15, 'LATITUDES (PARALLELS)', fontsize=13, fontweight='bold', color=RED, ha='center')
    cx2 = 10.5
    ax.add_patch(Circle((cx2, cy), r, fc='#CFE6F5', ec=NAVY, lw=2))
    for k, c in [(0.0, '#2E7D32'), (0.4, '#6D8BB0'), (0.75, '#6D8BB0')]:
        if k == 0: ax.plot([cx2, cx2], [cy - r, cy + r], color=c, lw=2.4)
        else: ax.add_patch(Ellipse((cx2, cy), 2 * r * k, 2 * r, fill=False, ec=c, lw=1.4))
    lab(ax, cx2 + 0.15, cy + 0.6, 'Greenwich\nMeridian 0°', 10, '#2E7D32', ha='left')
    lab(ax, cx2 - 1.7, cy - 1.0, 'West\n(W)', 11, NAVY); lab(ax, cx2 + 1.7, cy - 1.0, 'East\n(E)', 11, NAVY)
    ax.text(cx2, cy + r + 0.25, 'North Pole: all longitudes meet', fontsize=10, fontweight='bold', ha='center')
    ax.text(cx2, 0.15, 'LONGITUDES (MERIDIANS)', fontsize=13, fontweight='bold', color=RED, ha='center')
    title(ax, 6.5, 6.55, 'THE IMAGINARY LINES OF THE EARTH')
    save(fig, 'lat_long.png')


def great_circles():
    fig, ax = canvas(12, 6.4, 'white')
    for cx, t in [(3.0, 'GREAT CIRCLES'), (9.0, 'SMALL CIRCLES')]:
        ax.add_patch(Circle((cx, 3.0), 2.3, fc='#CFE6F5', ec=NAVY, lw=2))
        ax.text(cx, 0.25, t, fontsize=13, fontweight='bold', color=RED, ha='center')
    ax.add_patch(Ellipse((3.0, 3.0), 4.6, 0.7, fill=False, ec=RED, lw=2.5)); ax.add_patch(Ellipse((3.0, 3.0), 1.5, 4.6, fill=False, ec='#2E7D32', lw=2.5))
    lab(ax, 3.0, 2.45, 'Equator', 11, RED); lab(ax, 3.95, 4.6, 'A meridian\nand its opposite', 10, '#2E7D32')
    ax.add_patch(Ellipse((3.0, 3.0), 4.6, 1.8, angle=30, fill=False, ec='#8E24AA', lw=2, ls='--')); lab(ax, 1.3, 4.4, 'Any circle\nthrough the centre', 9.5, '#8E24AA')
    for d in (30, 60):
        y = 2.3 * np.sin(np.radians(d)); hw = 2.3 * np.cos(np.radians(d))
        ax.add_patch(Ellipse((9.0, 3.0 + y), 2 * hw, 0.45 * hw, fill=False, ec='#E65100', lw=2.2))
    lab(ax, 9.0, 2.3, 'Latitudes other than\nthe Equator', 10.5, '#E65100')
    lab(ax, 3.0, 5.55, 'Divide the Earth into two equal halves', 10.5, NAVY); lab(ax, 9.0, 1.35, 'Do not divide the Earth\ninto two equal halves', 10.5, NAVY)
    title(ax, 6.0, 6.15, 'GREAT CIRCLES AND SMALL CIRCLES')
    save(fig, 'great_circles.png')


# =============== PW2 ===============
def time_line():
    fig, ax = canvas(13.5, 4.6, 'white')
    xs = np.linspace(0.7, 12.8, 9); lons = [-60, -45, -30, -15, 0, 15, 30, 45, 60]
    ax.plot([0.5, 13.0], [2.2, 2.2], color=NAVY, lw=3)
    for x, lo in zip(xs, lons):
        ax.plot([x, x], [2.05, 2.35], color=NAVY, lw=2)
        ax.text(x, 1.7, ('0°' if lo == 0 else f'{abs(lo)}°' + ('W' if lo < 0 else 'E')), fontsize=11, fontweight='bold', ha='center')
        h = 12 + lo // 15
        ax.text(x, 2.8, f'{h:02d}:00', fontsize=12, fontweight='bold', ha='center', color=RED if lo == 0 else '#333')
    arrow(ax, (7.1, 3.6), (12.6, 3.6), c='#2E7D32', lw=3); lab(ax, 9.8, 3.95, 'EAST: time is AHEAD → ADD', 12, '#2E7D32')
    arrow(ax, (6.3, 3.6), (0.9, 3.6), c='#E65100', lw=3); lab(ax, 3.6, 3.95, 'WEST: time is BEHIND → SUBTRACT', 12, '#E65100')
    lab(ax, 6.75, 0.9, '15° of longitude = 1 hour     1° = 4 minutes', 13, NAVY)
    ax.text(6.75, 4.45, 'LOCAL TIME WHEN IT IS 12:00 NOON AT GREENWICH (0°)', fontsize=14, fontweight='bold', color=RED, ha='center')
    save(fig, 'time_line.png')


# =============== L5 / L6 ===============
def rotation():
    fig, ax = canvas(12, 6.6, '#0F1B33')
    sun(ax, 1.2, 3.3, 0.8)
    for yy in np.linspace(1.6, 5.0, 5): arrow(ax, (2.4, yy), (5.2, yy), c='#F2C94C', lw=2, ms=12)
    cx, cy, r = 7.8, 3.3, 2.2
    ax.add_patch(Circle((cx, cy), r, fc='#3A7BD5', ec='white', lw=1.5, zorder=2)); ax.add_patch(Wedge((cx, cy), r, -90, 90, fc='#101830', alpha=0.85, zorder=3))
    ang = np.radians(23.5)
    ax.plot([cx - (r + 0.9) * np.sin(ang), cx + (r + 0.9) * np.sin(ang)], [cy - (r + 0.9) * np.cos(ang), cy + (r + 0.9) * np.cos(ang)], color='white', lw=2, ls='--', zorder=4)
    ax.text(cx + (r + 0.95) * np.sin(ang) + 0.1, cy + (r + 0.95) * np.cos(ang), 'Axis tilted 23½°', color='white', fontsize=10.5, fontweight='bold', va='center', zorder=5)
    ax.text(cx - 1.1, cy, 'DAY', color='#FFF59D', fontsize=15, fontweight='bold', ha='center', zorder=5); ax.text(cx + 1.1, cy, 'NIGHT', color='#B0BEC5', fontsize=15, fontweight='bold', ha='center', zorder=5)
    ax.add_patch(FancyArrowPatch((cx - 1.6, cy - 2.6), (cx + 1.6, cy - 2.6), connectionstyle='arc3,rad=0.3', arrowstyle='-|>', mutation_scale=20, color='#81C784', lw=3, zorder=5))
    ax.text(cx, cy - 3.05, 'Rotation from WEST to EAST: one turn in 24 hours', color='#C8E6C9', fontsize=11, fontweight='bold', ha='center', zorder=5)
    ax.text(6.0, 6.3, 'THE ROTATION OF THE EARTH', color='#FFCDD2', fontsize=16, fontweight='bold', ha='center')
    save(fig, 'rotation.png')


def revolution():
    fig, ax = canvas(13, 8.9, '#0F1B33')
    cx, cy = 6.5, 4.2
    ax.add_patch(Ellipse((cx, cy), 10.5, 5.2, fill=False, ec='#6D7A99', lw=1.5, ls='--'))
    sun(ax, cx, cy, 0.7)
    pos = [(cx - 5.25, cy, '21 June\nSun overhead at\nthe Tropic of Cancer', 'left'), (cx, cy + 2.6, '21 March: equinox\nSun overhead at the Equator', 'up'),
           (cx + 5.25, cy, '22 December\nSun overhead at the\nTropic of Capricorn', 'right'), (cx, cy - 2.6, '23 September: equinox\nSun overhead at the Equator', 'down')]
    for x, y, t, side in pos:
        ax.add_patch(Circle((x, y), 0.45, fc='#3A7BD5', ec='white', lw=1, zorder=3))
        tilt = np.radians(23.5)
        ax.plot([x - 0.8 * np.sin(tilt), x + 0.8 * np.sin(tilt)], [y - 0.8 * np.cos(tilt), y + 0.8 * np.cos(tilt)], color='white', lw=1.5, zorder=4)
        ax.text(x + 0.85 * np.sin(tilt), y + 0.95 * np.cos(tilt), 'N', color='white', fontsize=9, fontweight='bold', ha='center', zorder=5)
        dx, dy = {'right': (0, -1.45), 'left': (0, -1.45), 'up': (0, 1.25), 'down': (0, -1.25)}[side]
        ax.text(x + dx, y + dy, t, color='white', fontsize=10.5, fontweight='bold', ha='center', va='center', zorder=5)
    ax.add_patch(FancyArrowPatch((cx + 1.6, cy - 2.55), (cx + 3.6, cy - 2.05), connectionstyle='arc3,rad=0.08', arrowstyle='-|>', mutation_scale=20, color='#81C784', lw=3))
    ax.text(cx + 2.7, cy - 3.05, 'One orbit = 365¼ days', color='#C8E6C9', fontsize=11, fontweight='bold', ha='center')
    ax.text(6.5, 8.55, 'THE REVOLUTION OF THE EARTH AROUND THE SUN', color='#FFCDD2', fontsize=16, fontweight='bold', ha='center')
    ax.text(0.1, 0.45, 'The axis always points the same way.\nDates can vary by one day.', color='#BBB', fontsize=9, ha='left', va='center')
    save(fig, 'revolution.png')


def earth_structure():
    fig, ax = canvas(12.5, 7.4, 'white')
    cx, cy = 3.7, 3.5
    for r, c, n in [(3.3, '#8D6E63', ''), (3.1, '#E65100', ''), (1.75, '#FBC02D', ''), (0.8, '#FFF176', '')]:
        ax.add_patch(Circle((cx, cy), r, color=c, zorder=2))
    ax.add_patch(Wedge((cx, cy), 3.35, -30, 30, color='white', zorder=3))
    items = [(3.2, 'CRUST', '5–70 km thick: solid rock\n(oceanic 5–10 km, continental 30–70 km)', '#6D4C41'),
             (2.45, 'MANTLE', 'About 2,900 km thick: hot rock that\nflows very slowly; upper part partly molten', '#E65100'),
             (1.3, 'OUTER CORE', 'About 2,200 km thick: liquid iron and nickel;\nmakes the magnetic field', '#F9A825'),
             (0.4, 'INNER CORE', 'Radius about 1,220 km: solid iron and nickel;\nabout 5,000–6,000 °C', '#F57F17')]
    for i, (r, n, d, c) in enumerate(items):
        y = 6.2 - i * 1.65
        ax.plot([cx + r * np.cos(np.radians(40 - i * 10)), 7.6], [cy + r * np.sin(np.radians(40 - i * 10)), y], color='#333', lw=1)
        ax.text(7.7, y + 0.25, n, fontsize=13, fontweight='bold', color=c, va='center')
        ax.text(7.7, y - 0.35, d, fontsize=10, color='#222', va='center')
    title(ax, 6.2, 7.2, 'THE INTERNAL STRUCTURE OF THE EARTH (CROSS-SECTION)')
    ax.text(cx, 0.05, 'Depth to the centre: about 6,370 km', fontsize=10.5, ha='center', fontweight='bold')
    save(fig, 'earth_structure.png')


def rock_cycle():
    fig, ax = canvas(12, 7.6, 'white')
    def box(x, y, t, c):
        ax.add_patch(FancyBboxPatch((x - 1.6, y - 0.6), 3.2, 1.2, boxstyle='round,pad=0.03,rounding_size=0.2', fc=c, ec='none', zorder=2))
        ax.text(x, y, t, fontsize=12.5, fontweight='bold', color='white', ha='center', va='center', zorder=3)
    box(6.0, 6.3, 'MAGMA', '#C62828'); box(2.0, 3.5, 'IGNEOUS\nROCK', '#6D4C41'); box(10.0, 3.5, 'SEDIMENTARY\nROCK', '#C08A3E'); box(6.0, 0.9, 'METAMORPHIC\nROCK', '#546E7A')
    box(10.0, 6.3, 'SEDIMENTS', '#E0B060')
    arrows = [((5.0, 5.8), (2.6, 4.2), 'cooling and\nhardening', (3.1, 5.3)), ((3.6, 3.7), (8.4, 6.0), 'weathering\nand erosion', (6.0, 4.9)),
              ((10.0, 5.6), (10.0, 4.2), 'compaction\nand cementation', (11.3, 4.9)), ((9.2, 2.8), (7.2, 1.5), 'heat and\npressure', (9.0, 1.8)),
              ((2.6, 2.8), (4.8, 1.3), 'heat and\npressure', (2.8, 1.8)), ((7.0, 1.5), (6.4, 5.6), 'melting', (7.3, 3.3))]
    for a, b, t, p in arrows:
        arrow(ax, a, b, c='#455A64', lw=2.2); lab(ax, p[0], p[1], t, 10, '#37474F')
    title(ax, 6.0, 7.4, 'THE ROCK CYCLE')
    save(fig, 'rock_cycle.png')


# =============== L10 / L11 / L13 ===============
def plate_margins():
    fig, axs = plt.subplots(1, 3, figsize=(15, 5.4), dpi=200)
    for a in axs: a.set_xlim(0, 6); a.set_ylim(-0.9, 5.2); a.set_aspect('equal'); a.axis('off')
    a = axs[0]; a.add_patch(Rectangle((0, 0), 6, 2.2, color='#E65100', alpha=0.8)); a.add_patch(Rectangle((0, 2.2), 2.7, 0.7, color='#6D4C41')); a.add_patch(Rectangle((3.3, 2.2), 2.7, 0.7, color='#6D4C41'))
    a.add_patch(Polygon([(2.7, 2.2), (3.3, 2.2), (3.1, 3.2), (2.9, 3.2)], color='#C62828')); arrow(a, (2.4, 2.55), (0.6, 2.55), c='white', lw=3); arrow(a, (3.6, 2.55), (5.4, 2.55), c='white', lw=3)
    for x in (2.0, 4.0): arrow(a, (3.0, 0.4), (x, 1.9), c='#FFEB3B', lw=2, cs='arc3,rad=0.3' if x > 3 else 'arc3,rad=-0.3')
    a.text(3, 3.7, 'New crust: ridges and\nrift valleys (East Africa)', ha='center', fontsize=10.5, fontweight='bold')
    a.set_title('CONSTRUCTIVE (DIVERGENT)\nPlates move apart', fontsize=12.5, fontweight='bold', color=RED)
    a = axs[1]; a.add_patch(Rectangle((0, 0), 6, 1.6, color='#E65100', alpha=0.8)); a.add_patch(Rectangle((0, 1.9), 3.0, 0.6, color='#455A64'))
    a.add_patch(Polygon([(3.0, 1.9), (3.0, 2.5), (1.8, 0.2), (2.4, 0.2)], color='#455A64')); a.add_patch(Polygon([(3.0, 1.9), (6, 1.9), (6, 2.9), (4.6, 2.9), (4.1, 3.9), (3.7, 2.9), (3.0, 2.6)], color='#8D6E63'))
    a.add_patch(Polygon([(3.9, 3.9), (4.3, 3.9), (4.1, 4.4)], color='#C62828')); arrow(a, (0.4, 2.2), (2.4, 2.2), c='white', lw=3); arrow(a, (5.7, 2.4), (4.7, 2.4), c='white', lw=3)
    a.text(1.3, 3.3, 'Oceanic plate\nsinks (subduction)', ha='center', fontsize=10, fontweight='bold'); a.text(5.15, 3.6, 'Fold mountains,\nvolcanoes,\nearthquakes', ha='center', fontsize=9.5, fontweight='bold')
    a.set_title('DESTRUCTIVE (CONVERGENT)\nPlates move together', fontsize=12.5, fontweight='bold', color=RED)
    a = axs[2]; a.add_patch(Rectangle((0.5, 0.6), 2.4, 3.6, color='#8D6E63')); a.add_patch(Rectangle((3.1, 0.6), 2.4, 3.6, color='#A1887F'))
    a.plot([3.0, 3.0], [0.4, 4.4], color='#C62828', lw=3, ls='--'); arrow(a, (1.7, 1.2), (1.7, 3.8), c='white', lw=3); arrow(a, (4.3, 3.8), (4.3, 1.2), c='white', lw=3)
    a.text(3, -0.3, 'Plates slide past each other:\nstrong earthquakes (San Andreas)', ha='center', fontsize=10.5, fontweight='bold')
    a.set_title('CONSERVATIVE (TRANSFORM)\nPlates slide sideways', fontsize=12.5, fontweight='bold', color=RED)
    fig.suptitle('THE THREE TYPES OF PLATE MARGINS', fontsize=16, fontweight='bold', color=RED, y=1.02)
    fig.savefig(OUT + 'plate_margins.png', bbox_inches='tight', pad_inches=0.06, facecolor='white'); plt.close(fig)


def volcano():
    fig, ax = canvas(13, 7.4, SKY)
    ax.add_patch(Rectangle((0, 0), 13, 3.6, color='#A1887F', zorder=1))
    for y in (0.9, 1.8, 2.7): ax.plot([0, 13], [y, y + 0.05], color='#8D6E63', lw=1, zorder=1)
    ax.add_patch(Polygon([(3.2, 3.6), (6.2, 6.6), (6.9, 6.6), (9.8, 3.6)], fc='#6D4C41', ec='#3E2723', lw=1.5, zorder=2))
    for k in range(4): ax.plot([3.6 + k * 0.5, 6.2 + k * 0.0], [3.6, 6.4 - k * 0.6], color='#5D4037', lw=0.8, zorder=2)
    ax.add_patch(Polygon([(6.2, 6.6), (6.55, 6.25), (6.9, 6.6)], color='#3E2723', zorder=3))
    ax.add_patch(Ellipse((6.55, 1.0), 3.0, 1.2, color='#D84315', zorder=3)); ax.add_patch(Rectangle((6.4, 1.5), 0.3, 4.8, color='#E64A19', zorder=3))
    ax.add_patch(Polygon([(6.9, 6.5), (7.6, 5.7), (8.0, 4.8), (7.8, 4.8), (7.3, 5.6), (6.7, 6.3)], color='#FF7043', zorder=4))
    for k in range(5): ax.add_patch(Circle((6.2 + k * 0.35, 7.1 + 0.15 * (k % 2)), 0.3, color='#78909C', alpha=0.8, zorder=4))
    # intrusive
    ax.add_patch(Rectangle((1.4, 0.3), 0.18, 3.3, color='#E64A19', zorder=3)); ax.add_patch(Rectangle((9.0, 2.2), 3.4, 0.18, color='#E64A19', zorder=3))
    ax.add_patch(Ellipse((11.2, 1.1), 1.6, 0.7, color='#E64A19', zorder=3)); ax.add_patch(Ellipse((2.6, 0.3), 2.6, 0.9, color='#BF360C', zorder=3))
    labs = [(6.55, 7.6, 'Ash and gases', '#333'), (8.6, 5.6, 'Lava flow', '#BF360C'), (5.3, 6.75, 'Crater', '#1A1A1A'), (4.4, 5.1, 'Cone (layers\nof lava and ash)', '#1A1A1A'),
            (7.4, 3.0, 'Vent', 'white'), (6.55, 0.35, 'Magma chamber', 'white'), (1.0, 2.6, 'Dyke', '#BF360C'), (10.7, 2.65, 'Sill', '#BF360C'), (11.2, 1.75, 'Laccolith', '#BF360C'), (2.6, 0.95, 'Batholith', '#BF360C')]
    for x, y, t, c in labs: lab(ax, x, y, t, 11, c)
    lab(ax, 11.5, 4.0, 'Intrusive features\n(inside the crust)', 10.5, NAVY); lab(ax, 1.6, 5.6, 'Extrusive features\n(on the surface)', 10.5, NAVY)
    title(ax, 6.5, 7.2 + 0.0, '')
    fig.suptitle('THE STRUCTURE OF A VOLCANO AND INTRUSIVE FEATURES', fontsize=16, fontweight='bold', color=RED, y=0.98)
    save(fig, 'volcano_structure.png')


def earthquake():
    fig, ax = canvas(12, 6.6, SKY)
    ax.add_patch(Rectangle((0, 0), 12, 4.4, color='#A1887F'))
    ax.add_patch(Polygon([(0, 4.4), (12, 4.4), (12, 4.6), (0, 4.6)], color='#7CB342'))
    ax.plot([7.2, 4.8], [4.4, 0.2], color='#3E2723', lw=3); lab(ax, 7.7, 3.1, 'Fault', 11, '#3E2723')
    fx, fy = 6.0, 2.3
    for r in (0.5, 1.1, 1.7, 2.3, 2.9): ax.add_patch(Circle((fx, fy), r, fill=False, ec='#E53935', lw=1.5, alpha=0.9 - r * 0.2))
    ax.plot(fx, fy, '*', ms=22, color='#C62828', mec='black'); lab(ax, fx + 0.9, fy - 0.35, 'FOCUS', 12, '#C62828')
    ax.plot([fx, fx], [fy, 4.5], color='#333', lw=1.3, ls='--'); ax.plot(fx, 4.5, 'o', ms=11, color='#FFD600', mec='black', zorder=6)
    lab(ax, fx, 5.0, 'EPICENTRE (directly above the focus)', 12, '#333')
    lab(ax, 2.2, 1.2, 'Seismic waves', 11, 'white')
    ax.add_patch(Rectangle((0.6, 4.6), 1.0, 0.8, color='#ECEFF1', ec='#555')); ax.add_patch(Rectangle((10.2, 4.6), 1.1, 1.1, color='#ECEFF1', ec='#555'))
    title(ax, 6.0, 6.3, 'FOCUS AND EPICENTRE OF AN EARTHQUAKE')
    save(fig, 'earthquake.png')


# =============== L14 - L17 ===============
def denudation():
    fig, ax = canvas(13, 4.8, 'white')
    steps = [('WEATHERING', 'Rocks break down\nin place', '#8D6E63'), ('EROSION', 'Material is worn\naway and picked up', '#E65100'), ('TRANSPORTATION', 'Material is\ncarried away', '#1F5FBF'), ('DEPOSITION', 'Material is\ndropped', '#2E7D32')]
    for i, (t, d, c) in enumerate(steps):
        x = 0.3 + i * 3.2
        ax.add_patch(FancyBboxPatch((x, 1.4), 2.8, 2.2, boxstyle='round,pad=0.03,rounding_size=0.2', fc=c, ec='none'))
        ax.text(x + 1.4, 3.1, t, color='white', fontsize=12.5, fontweight='bold', ha='center'); ax.text(x + 1.4, 2.2, d, color='white', fontsize=10.5, fontweight='bold', ha='center', va='center')
        if i < 3: arrow(ax, (x + 2.82, 2.5), (x + 3.18, 2.5), c='#555', lw=2.5)
    ax.plot([0.3, 9.3], [1.15, 1.15], color=RED, lw=2); ax.text(4.8, 0.75, 'DENUDATION = weathering + erosion + transportation', fontsize=12, fontweight='bold', color=RED, ha='center')
    ax.text(4.8, 0.25, 'Agents: running water, wind, waves (and ice)', fontsize=11, ha='center', color='#333')
    title(ax, 6.5, 4.4, 'THE PROCESSES OF DENUDATION')
    save(fig, 'denudation.png')


def weathering_types():
    fig, ax = canvas(13, 6.8, 'white')
    ax.add_patch(FancyBboxPatch((4.8, 5.3), 3.4, 0.9, boxstyle='round,pad=0.03,rounding_size=0.2', fc=RED, ec='none'))
    ax.text(6.5, 5.75, 'WEATHERING', color='white', fontsize=14, fontweight='bold', ha='center', va='center')
    cols = [('PHYSICAL (MECHANICAL)', 'Rock breaks into pieces;\nits minerals do not change', ['Thermal shattering (exfoliation)', 'Frost shattering', 'Wetting and drying (slaking)', 'Pressure release (unloading)', 'Roots and animals'], '#8D6E63', 0.4),
            ('CHEMICAL', 'Minerals change and the\nrock rots and weakens', ['Solution', 'Oxidation', 'Carbonation', 'Hydrolysis', 'Hydration'], '#1F5FBF', 6.8)]
    for t, d, lst, c, x in cols:
        arrow(ax, (6.5, 5.25), (x + 2.9, 4.65), c='#555', lw=2)
        ax.add_patch(FancyBboxPatch((x, 0.3), 5.8, 4.3, boxstyle='round,pad=0.03,rounding_size=0.2', fc='#F7F9FC', ec=c, lw=2.5))
        ax.text(x + 2.9, 4.2, t, color=c, fontsize=13.5, fontweight='bold', ha='center'); ax.text(x + 2.9, 3.5, d, color='#333', fontsize=10.5, ha='center', va='center', style='italic')
        for k, it in enumerate(lst): ax.text(x + 0.4, 2.7 - k * 0.5, '• ' + it, fontsize=11.5, fontweight='bold', color='#222', va='center')
    title(ax, 6.5, 6.6, 'THE TWO TYPES OF WEATHERING')
    save(fig, 'weathering_types.png')


def physical_weathering():
    fig, axs = plt.subplots(1, 4, figsize=(16, 4.8), dpi=200)
    for a in axs: a.set_xlim(0, 4); a.set_ylim(0, 4); a.set_aspect('equal'); a.axis('off'); a.add_patch(Rectangle((0, 0), 4, 4, color=SKY))
    a = axs[0]; sun(a, 3.3, 3.4, 0.3); a.add_patch(Rectangle((0, 0), 4, 0.6, color=SAND))
    for k, r in enumerate([1.5, 1.3, 1.1]): a.add_patch(Wedge((2, 0.6), r, 0, 180, fc=['#A1887F', '#8D6E63', '#795548'][k], ec='#4E342E', lw=1))
    a.add_patch(Polygon([(0.45, 0.6), (0.6, 1.3), (0.9, 1.1)], color='#A1887F', ec='#4E342E'))
    a.text(2, 2.6, 'Outer layers peel off', ha='center', fontsize=10, fontweight='bold'); a.set_title('THERMAL SHATTERING\n(EXFOLIATION): hot day, cool night', fontsize=11, fontweight='bold', color=RED)
    a = axs[1]; a.add_patch(Rectangle((0.5, 0.3), 3, 2.8, fc='#9E9E9E', ec='#424242')); a.add_patch(Polygon([(1.9, 3.1), (2.1, 3.1), (2.0, 1.2)], color='#90CAF9', ec='#1F5FBF'))
    arrow(a, (1.9, 2.3), (1.4, 2.3), c=RED, lw=2, ms=12); arrow(a, (2.1, 2.3), (2.6, 2.3), c=RED, lw=2, ms=12)
    a.text(2, 3.5, 'Water freezes and\nexpands by about 9%', ha='center', fontsize=10, fontweight='bold'); a.set_title('FROST SHATTERING\n(cold mountains)', fontsize=11, fontweight='bold', color=RED)
    a = axs[2]; a.add_patch(Rectangle((0.3, 0.3), 3.4, 2.4, fc='#BCAAA4', ec='#4E342E'))
    for y in (1.9, 2.3): a.plot(np.linspace(0.3, 3.7, 30), y + 0.08 * np.sin(np.linspace(0, 6, 30)), color='#4E342E', lw=1.5)
    a.add_patch(Rectangle((0.3, 2.7), 3.4, 0.9, fc='none', ec='#999', ls='--')); a.text(2, 3.15, 'Rocks above removed', ha='center', fontsize=9.5, color='#555')
    arrow(a, (2, 1.4), (2, 2.1), c=RED, lw=2, ms=12); a.set_title('PRESSURE RELEASE\n(UNLOADING): sheets crack off', fontsize=11, fontweight='bold', color=RED)
    a = axs[3]; a.add_patch(Rectangle((0.3, 0.3), 3.4, 2.2, fc='#9E9E9E', ec='#424242')); a.add_patch(Polygon([(1.8, 2.5), (2.2, 2.5), (2.0, 0.6)], color='#6D4C41'))
    a.plot([2.0, 2.0], [2.5, 3.2], color='#5D4037', lw=4); a.add_patch(Circle((2.0, 3.45), 0.4, color='#43A047'))
    arrow(a, (1.85, 1.6), (1.35, 1.6), c=RED, lw=2, ms=12); arrow(a, (2.15, 1.6), (2.65, 1.6), c=RED, lw=2, ms=12)
    a.set_title('BIOLOGICAL (PHYSICAL):\nroots widen cracks', fontsize=11, fontweight='bold', color=RED)
    fig.suptitle('PROCESSES OF PHYSICAL WEATHERING', fontsize=16, fontweight='bold', color=RED, y=1.04)
    fig.savefig(OUT + 'physical_weathering.png', bbox_inches='tight', pad_inches=0.06, facecolor='white'); plt.close(fig)


def chemical_weathering():
    fig, axs = plt.subplots(1, 4, figsize=(16, 4.8), dpi=200)
    for a in axs: a.set_xlim(0, 4); a.set_ylim(0, 4); a.set_aspect('equal'); a.axis('off'); a.add_patch(Rectangle((0, 0), 4, 4, color=SKY))
    info = [('SOLUTION', 'Minerals such as rock salt\ndissolve in water', '#ECEFF1'), ('OXIDATION', 'Oxygen + iron → rust:\nred, crumbly rock', '#BF6B3C'),
            ('CARBONATION', 'Rain + CO₂ = weak acid\nthat dissolves limestone', '#E0E0D1'), ('HYDROLYSIS', 'Water changes feldspar\n(in granite) into clay', '#D7CCC8')]
    for a, (t, d, c) in zip(axs, info):
        a.add_patch(Rectangle((0.5, 0.4), 3, 1.9, fc=c, ec='#555', lw=1.5))
        for x in np.linspace(0.8, 3.2, 6): a.plot([x, x - 0.12], [3.3, 2.6], color=BLUE, lw=2)
        a.text(2, 3.6, t, ha='center', fontsize=12, fontweight='bold', color=RED)
        a.text(2, -0.25, d, ha='center', va='center', fontsize=10.5, fontweight='bold')
    axs[0].add_patch(Circle((1.4, 1.6), 0.25, color=SKY)); axs[0].add_patch(Circle((2.5, 1.1), 0.3, color=SKY))
    for x, y in [(1.1, 1.8), (2.2, 1.2), (2.9, 1.9), (1.8, 0.9)]: axs[1].add_patch(Circle((x, y), 0.18, color='#8D2E0B'))
    axs[2].add_patch(Polygon([(1.3, 2.3), (1.5, 1.2), (1.7, 2.3)], color=SKY)); axs[2].add_patch(Polygon([(2.4, 2.3), (2.6, 0.9), (2.8, 2.3)], color=SKY))
    for x, y in [(1.2, 1.5), (2.3, 1.8), (2.9, 1.0), (1.8, 0.9)]: axs[3].add_patch(Rectangle((x, y), 0.35, 0.25, color='#FFFFFF', ec='#999'))
    fig.suptitle('PROCESSES OF CHEMICAL WEATHERING', fontsize=16, fontweight='bold', color=RED, y=1.04)
    fig.savefig(OUT + 'chemical_weathering.png', bbox_inches='tight', pad_inches=0.3, facecolor='white'); plt.close(fig)


# =============== L18 - L22 rivers ===============
def long_profile():
    fig = plt.figure(figsize=(13, 7), dpi=200)
    ax = fig.add_axes([0.05, 0.38, 0.9, 0.5])
    x = np.linspace(0, 10, 200); y = 9 * np.exp(-x / 2.2)
    ax.fill_between(x, 0, y, color='#A1887F'); ax.plot(x, y, color=BLUE, lw=4)
    ax.set_xlim(0, 10.3); ax.set_ylim(0, 10); ax.axis('off')
    for a, b, t in [(0, 3.3, 'UPPER COURSE\nsteep gradient\nvertical erosion'), (3.3, 6.6, 'MIDDLE COURSE\ngentler gradient\nlateral erosion, transport'), (6.6, 10, 'LOWER COURSE\nalmost flat\ndeposition')]:
        ax.axvline(b, color='#555', ls='--', lw=1); ax.text((a + b) / 2, 8.4, t, ha='center', fontsize=11, fontweight='bold', color=NAVY)
    ax.text(0.1, 9.3, 'Source', fontsize=11, fontweight='bold'); ax.text(9.95, 0.5, 'Mouth\n(sea level)', fontsize=11, fontweight='bold', ha='right')
    fig.text(0.5, 0.95, 'THE LONG PROFILE OF A RIVER AND ITS VALLEY CROSS-SECTIONS', fontsize=16, fontweight='bold', color=RED, ha='center')
    for i, (shape_, t) in enumerate([('v', 'Narrow, steep V-shaped valley'), ('w', 'Wider valley, gentle slopes'), ('f', 'Very wide, flat floodplain')]):
        a2 = fig.add_axes([0.05 + i * 0.31, 0.03, 0.27, 0.28]); a2.set_xlim(0, 6); a2.set_ylim(0, 3); a2.axis('off')
        if shape_ == 'v': pts = [(0, 3), (2.7, 0.5), (3.3, 0.5), (6, 3), (6, 0), (0, 0)]; wat = [(2.75, 0.5), (3.25, 0.5), (3.15, 0.75), (2.85, 0.75)]
        elif shape_ == 'w': pts = [(0, 2.6), (1.6, 0.8), (4.4, 0.8), (6, 2.6), (6, 0), (0, 0)]; wat = [(2.5, 0.8), (3.5, 0.8), (3.4, 1.05), (2.6, 1.05)]
        else: pts = [(0, 1.5), (0.4, 1.0), (5.6, 1.0), (6, 1.5), (6, 0), (0, 0)]; wat = [(2.3, 1.0), (3.7, 1.0), (3.6, 1.25), (2.4, 1.25)]
        a2.add_patch(Polygon(pts, color='#8D6E63')); a2.add_patch(Polygon(wat, color=BLUE)); a2.text(3, 2.8, t, ha='center', fontsize=10.5, fontweight='bold')
    fig.savefig(OUT + 'long_profile.png', bbox_inches='tight', pad_inches=0.06, facecolor='white'); plt.close(fig)


def erosion_mechanisms():
    fig, axs = plt.subplots(1, 4, figsize=(16, 4.4), dpi=200)
    for a in axs: a.set_xlim(0, 4); a.set_ylim(0, 4); a.set_aspect('equal'); a.axis('off'); a.add_patch(Rectangle((0, 0), 4, 4, color=SKY)); a.add_patch(Rectangle((0, 0), 4, 1.0, color='#8D6E63')); a.add_patch(Rectangle((0, 1.0), 4, 1.6, color='#64B5F6', alpha=0.8))
    info = [('HYDRAULIC ACTION', 'The force of water breaks\nthe bed and banks'), ('ABRASION (CORRASION)', 'The load scrapes the\nbed and banks'),
            ('ATTRITION', 'Stones hit each other and\nbecome small and round'), ('SOLUTION (CORROSION)', 'Water dissolves rocks\nsuch as limestone')]
    for a, (t, d) in zip(axs, info):
        a.text(2, 3.55, t, ha='center', fontsize=11.5, fontweight='bold', color=RED); a.text(2, 3.0, d, ha='center', va='center', fontsize=9.8, fontweight='bold')
        arrow(a, (0.3, 1.8), (1.6, 1.8), c='white', lw=3)
    for x in (1.8, 2.6, 3.3): arrow(axs[0], (x - 0.4, 1.5), (x, 1.05), c=NAVY, lw=2, ms=12)
    for x in (1.6, 2.5, 3.3): axs[1].add_patch(Circle((x, 1.15), 0.14, color='#5D4037'))
    axs[2].add_patch(Circle((2.0, 1.8), 0.3, color='#795548')); axs[2].add_patch(Circle((2.55, 1.9), 0.25, color='#795548')); axs[2].plot(2.3, 1.85, marker=(8, 1, 0), ms=14, color='#E53935')
    for x in (1.7, 2.3, 2.9): axs[3].plot(x, 1.0, 'o', ms=6, color='white', mec='#555')
    fig.suptitle('THE FOUR MECHANISMS OF RIVER EROSION', fontsize=16, fontweight='bold', color=RED, y=1.02)
    fig.savefig(OUT + 'river_erosion.png', bbox_inches='tight', pad_inches=0.06, facecolor='white'); plt.close(fig)


def waterfall():
    fig, ax = canvas(12.5, 6.6, SKY)
    ax.add_patch(Polygon([(0, 4.2), (6.2, 4.2), (6.2, 2.9), (0, 2.9)], color='#546E7A'))  # hard rock
    ax.add_patch(Polygon([(0, 2.9), (6.2, 2.9), (5.4, 1.2), (12.5, 1.2), (12.5, 0), (0, 0)], color='#BCAAA4'))  # soft
    ax.add_patch(Polygon([(5.3, 1.2), (5.0, 0.5), (6.4, 0.3), (6.9, 1.2)], color='#64B5F6'))
    ax.add_patch(Polygon([(0, 4.2), (6.2, 4.2), (6.2, 4.5), (0, 4.5)], color='#64B5F6'))
    ax.add_patch(Polygon([(6.2, 4.5), (6.6, 4.2), (6.4, 1.2), (6.0, 1.2), (6.2, 4.2)], color='#90CAF9', alpha=0.9))
    ax.add_patch(Polygon([(6.9, 1.2), (12.5, 1.2), (12.5, 1.5), (6.9, 1.5)], color='#64B5F6'))
    ax.add_patch(Polygon([(5.3, 2.9), (6.2, 2.9), (6.2, 2.4), (5.5, 2.4)], color=SKY))
    labs = [(2.8, 3.55, 'Hard, resistant rock (cap rock)', 'white'), (2.8, 1.6, 'Soft rock: eroded faster', '#3E2723'), (5.95, 0.15, 'Plunge pool', NAVY),
            (4.6, 2.6, 'Overhang', '#1A1A1A'), (9.5, 2.3, 'Gorge forms as the\nwaterfall retreats upstream', NAVY)]
    for x, y, t, c in labs: lab(ax, x, y, t, 11, c)
    arrow(ax, (9.5, 3.0), (7.2, 3.0), c=RED, lw=2.5); lab(ax, 9.3, 3.4, 'Retreat', 11, RED)
    title(ax, 6.25, 6.25, 'THE FORMATION OF A WATERFALL')
    save(fig, 'waterfall.png')


def spurs():
    fig, ax = canvas(12, 7.2, '#C5E1A5')
    t = np.linspace(0, 12, 300); f = lambda x: 3.2 + 1.2 * np.sin(x * 0.9)
    for xc, up in [(-1.745, True), (1.745, False), (5.236, True), (8.727, False), (12.217, True)]:
        tip = f(xc) + (0.6 if up else -0.6)
        pts = [(xc - 1.7, 6.6 if up else 0), (xc, tip), (xc + 1.7, 6.6 if up else 0)]
        ax.add_patch(Polygon(pts, fc='#8D6E63', ec='#5D4037', lw=1, alpha=0.95, zorder=1))
    ax.plot(t, f(t), color=BLUE, lw=5, zorder=2)
    arrow(ax, (0.3, f(0.3) + 0.35), (1.2, f(1.2) + 0.35), c=NAVY, lw=2, ms=14)
    ax.add_patch(Rectangle((0, 6.6), 12, 0.6, color='white', zorder=3))
    lab(ax, 5.24, 5.3, 'Spur', 12); lab(ax, 1.75, 1.2, 'Spur', 12); lab(ax, 8.73, 1.2, 'Spur', 12)
    lab(ax, 9.3, 5.6, 'The river winds around\nspurs of hard rock', 11.5, NAVY)
    ax.text(6, 6.9, 'INTERLOCKING SPURS IN THE UPPER COURSE (SEEN FROM ABOVE)', fontsize=15, fontweight='bold', color=RED, ha='center', va='center', zorder=4)
    save(fig, 'interlocking_spurs.png')


def meander():
    fig = plt.figure(figsize=(13, 6.6), dpi=200)
    a1 = fig.add_axes([0.02, 0.1, 0.46, 0.78]); a1.set_xlim(0, 6); a1.set_ylim(0, 6); a1.set_aspect('equal'); a1.axis('off'); a1.add_patch(Rectangle((0, 0), 6, 6, color='#C5E1A5'))
    t = np.linspace(0, 6, 300); y = 3 + 1.7 * np.sin(t * 1.05)
    a1.plot(t, y, color=BLUE, lw=14, solid_capstyle='round'); a1.plot(t, y, color='#64B5F6', lw=9)
    a1.text(1.5, 5.3, 'Fastest flow: erosion\n(outer bend)', fontsize=10, fontweight='bold', ha='center', color='#C62828')
    a1.text(1.5, 2.2, 'Slow flow: deposition\n(inner bend)', fontsize=10, fontweight='bold', ha='center', color='#8A5A00')
    a1.plot([1.5, 1.5], [0.8, 5.0], color='#333', ls='--', lw=1.3); a1.text(1.65, 0.6, 'X', fontsize=11, fontweight='bold'); a1.text(1.65, 5.0, 'Y', fontsize=11, fontweight='bold')
    a1.set_title('A MEANDER (PLAN)', fontsize=13, fontweight='bold', color=RED)
    a2 = fig.add_axes([0.52, 0.18, 0.46, 0.6]); a2.set_xlim(0, 6); a2.set_ylim(0, 3.6); a2.axis('off')
    a2.add_patch(Polygon([(0, 2.6), (0.6, 2.6), (3.6, 0.5), (4.4, 0.5), (4.5, 2.8), (6, 2.8), (6, 0), (0, 0)], color='#8D6E63'))
    a2.add_patch(Polygon([(1.5, 1.95), (3.6, 0.5), (4.4, 0.5), (4.48, 1.95)], color='#64B5F6'))
    a2.add_patch(Polygon([(0.6, 2.6), (1.5, 1.95), (2.2, 1.5), (1.0, 2.3)], color=SAND))
    a2.text(0.8, 3.0, 'Slip-off slope (point bar)\ngentle, deposition', fontsize=10, fontweight='bold', ha='center', color='#8A5A00')
    a2.text(5.1, 3.2, 'River cliff\nsteep, erosion', fontsize=10, fontweight='bold', ha='center', color='#C62828')
    a2.text(0.1, 0.2, 'X', fontsize=11, fontweight='bold'); a2.text(5.8, 0.2, 'Y', fontsize=11, fontweight='bold')
    a2.set_title('CROSS-SECTION X–Y', fontsize=13, fontweight='bold', color=RED)
    fig.text(0.5, 0.96, 'MEANDERS: RIVER CLIFFS AND SLIP-OFF SLOPES', fontsize=16, fontweight='bold', color=RED, ha='center')
    fig.savefig(OUT + 'meander.png', bbox_inches='tight', pad_inches=0.06, facecolor='white'); plt.close(fig)


def oxbow():
    fig, axs = plt.subplots(1, 3, figsize=(15, 5), dpi=200)
    for a in axs: a.set_xlim(0, 5); a.set_ylim(0, 5); a.set_aspect('equal'); a.axis('off'); a.add_patch(Rectangle((0, 0), 5, 5, color='#C5E1A5'))
    th = np.linspace(-0.8 * np.pi, 0.8 * np.pi, 200)
    def loop(a, neck, lw=12, c=BLUE):
        x = 2.5 + 1.4 * np.sin(th) * 1.0; y = 2.5 + 1.6 * np.cos(th) * 0.9 + 0.2
        a.plot(x, y, color=c, lw=lw, solid_capstyle='round')
        a.plot([0, 2.5 + 1.4 * np.sin(th[0])], [2.5 + 1.6 * np.cos(th[0]) * 0.9 + 0.2 - neck, 2.5 + 1.6 * np.cos(th[0]) * 0.9 + 0.2], color=c, lw=lw)
        a.plot([2.5 + 1.4 * np.sin(th[-1]), 5], [2.5 + 1.6 * np.cos(th[-1]) * 0.9 + 0.2, 2.5 + 1.6 * np.cos(th[-1]) * 0.9 + 0.2 - neck], color=c, lw=lw)
    loop(axs[0], 0.0); axs[0].set_title('1. The neck of the meander\nbecomes narrow', fontsize=12, fontweight='bold', color=RED)
    loop(axs[1], 0.0); axs[1].plot([0, 5], [1.35, 1.35], color=BLUE, lw=12); axs[1].set_title('2. In a flood, the river\ncuts through the neck', fontsize=12, fontweight='bold', color=RED)
    x = 2.5 + 1.4 * np.sin(th); y = 2.5 + 1.6 * np.cos(th) * 0.9 + 0.2
    axs[2].plot(x, y, color='#4FC3F7', lw=12, solid_capstyle='round'); axs[2].plot([0, 5], [1.35, 1.35], color=BLUE, lw=12)
    axs[2].add_patch(Rectangle((1.2, 1.55), 2.6, 0.25, color=SAND)); axs[2].text(2.5, 4.5, 'OX-BOW LAKE', ha='center', fontsize=12, fontweight='bold', color=NAVY)
    axs[2].text(2.5, 1.95, 'deposits seal it off', ha='center', fontsize=9.5, fontweight='bold', color='#8A5A00')
    axs[2].set_title('3. The old loop is cut off:\nan ox-bow lake', fontsize=12, fontweight='bold', color=RED)
    fig.suptitle('THE FORMATION OF AN OX-BOW LAKE', fontsize=16, fontweight='bold', color=RED, y=1.02)
    fig.savefig(OUT + 'oxbow.png', bbox_inches='tight', pad_inches=0.06, facecolor='white'); plt.close(fig)


def levee_delta():
    fig = plt.figure(figsize=(14, 6), dpi=200)
    a1 = fig.add_axes([0.02, 0.1, 0.5, 0.72]); a1.set_xlim(0, 7); a1.set_ylim(0, 3.5); a1.axis('off')
    a1.add_patch(Polygon([(0, 1.6), (2.6, 1.8), (3.0, 2.2), (3.2, 0.9), (3.8, 0.9), (4.0, 2.2), (4.4, 1.8), (7, 1.6), (7, 0), (0, 0)], color='#8D6E63'))
    a1.add_patch(Polygon([(3.2, 0.9), (3.8, 0.9), (3.95, 1.9), (3.05, 1.9)], color='#64B5F6'))
    for x0 in (0.2, 4.6): a1.add_patch(Rectangle((x0, 1.6), 2.3, 0.08, color='#D7CCC8'))
    a1.text(2.75, 2.55, 'Levee', ha='center', fontsize=11, fontweight='bold'); a1.text(4.25, 2.55, 'Levee', ha='center', fontsize=11, fontweight='bold')
    a1.text(1.2, 2.1, 'Floodplain\n(layers of alluvium)', ha='center', fontsize=10.5, fontweight='bold'); a1.text(5.8, 2.1, 'Floodplain', ha='center', fontsize=10.5, fontweight='bold')
    a1.set_title('LEVEES AND FLOODPLAIN (CROSS-SECTION)', fontsize=13, fontweight='bold', color=RED)
    a2 = fig.add_axes([0.55, 0.05, 0.43, 0.8]); a2.set_xlim(0, 6); a2.set_ylim(0, 6); a2.set_aspect('equal'); a2.axis('off')
    a2.add_patch(Rectangle((0, 0), 6, 6, color='#90CAF9')); a2.add_patch(Rectangle((0, 3.8), 6, 2.2, color='#C5E1A5'))
    a2.add_patch(Polygon([(1.2, 3.8), (4.8, 3.8), (5.6, 2.6), (4.6, 1.3), (3.0, 0.8), (1.4, 1.3), (0.4, 2.6)], color='#DCE775'))
    a2.plot([3.0, 3.0], [6, 3.8], color=BLUE, lw=6)
    for end in [(0.9, 2.3), (1.9, 1.3), (3.0, 0.9), (4.1, 1.3), (5.1, 2.3)]: a2.plot([3.0, end[0]], [3.8, end[1]], color=BLUE, lw=2.5)
    a2.text(3.4, 5.0, 'River', fontsize=11, fontweight='bold'); a2.text(3.0, 2.8, 'Distributaries', fontsize=10.5, fontweight='bold', ha='center')
    a2.text(3.0, 0.3, 'Sea', fontsize=11, fontweight='bold', ha='center', color=NAVY)
    a2.set_title('A DELTA (PLAN)', fontsize=13, fontweight='bold', color=RED)
    fig.text(0.5, 0.97, 'DEPOSITIONAL FEATURES OF THE LOWER COURSE', fontsize=16, fontweight='bold', color=RED, ha='center')
    fig.savefig(OUT + 'levee_delta.png', bbox_inches='tight', pad_inches=0.06, facecolor='white'); plt.close(fig)


# =============== L23 - L26 coasts ===============
def waves():
    fig, axs = plt.subplots(1, 2, figsize=(14, 5), dpi=200)
    for a, t, destructive in [(axs[0], 'CONSTRUCTIVE WAVES', False), (axs[1], 'DESTRUCTIVE WAVES', True)]:
        a.set_xlim(0, 7); a.set_ylim(0, 4); a.axis('off'); a.add_patch(Rectangle((0, 0), 7, 4, color=SKY))
        slope = [(0, 0.3), (7, 2.6)] if not destructive else [(0, 0.3), (4.5, 1.2), (7, 3.2)]
        a.add_patch(Polygon(slope + [(7, 0), (0, 0)], color=SAND))
        x = np.linspace(0, 3.6, 200); amp = 0.25 if not destructive else 0.7; freq = 2.2 if not destructive else 4.5
        a.fill_between(x, 0.3, 1.0 + amp * np.sin(x * freq), color='#64B5F6')
        if not destructive:
            arrow(a, (3.4, 1.3), (5.8, 2.1), c='#1565C0', lw=4); arrow(a, (5.6, 1.7), (4.2, 1.2), c='#90A4AE', lw=1.8)
            a.text(4.6, 2.35, 'Strong swash', fontsize=11, fontweight='bold', color='#1565C0'); a.text(4.8, 1.0, 'Weak backwash', fontsize=10, fontweight='bold', color='#607D8B')
            a.text(3.5, 3.5, 'Low, long waves: 6–8 per minute\nThey BUILD the beach', ha='center', fontsize=11, fontweight='bold')
        else:
            arrow(a, (3.4, 1.6), (5.0, 2.0), c='#90A4AE', lw=1.8); arrow(a, (5.3, 2.1), (3.2, 0.9), c='#C62828', lw=4)
            a.text(4.2, 2.35, 'Weak swash', fontsize=10, fontweight='bold', color='#607D8B'); a.text(4.3, 0.7, 'Strong backwash', fontsize=11, fontweight='bold', color='#C62828')
            a.text(3.5, 3.5, 'High, steep waves: 11–15 per minute\nThey DESTROY the beach', ha='center', fontsize=11, fontweight='bold')
        a.set_title(t, fontsize=13, fontweight='bold', color=RED)
    fig.suptitle('TYPES OF WAVES', fontsize=16, fontweight='bold', color=RED, y=1.02)
    fig.savefig(OUT + 'waves_types.png', bbox_inches='tight', pad_inches=0.06, facecolor='white'); plt.close(fig)


def headland():
    fig, ax = canvas(13.5, 6.8, '#64B5F6')
    ax.add_patch(Rectangle((0, 4.6), 13.5, 2.2, color='#8BC34A'))
    ax.add_patch(Polygon([(1.0, 4.6), (1.0, 2.4), (12.8, 2.4), (12.8, 4.6)], color='#8D6E63'))
    ax.add_patch(Polygon([(1.0, 2.4), (12.8, 2.4), (12.8, 2.1), (1.0, 2.1)], color='#6D4C41'))
    # cave
    ax.add_patch(Ellipse((2.6, 2.4), 1.0, 0.9, color='#3E2723'))
    # arch
    ax.add_patch(Rectangle((5.4, 1.5), 1.3, 0.95, color='#64B5F6')); ax.add_patch(Rectangle((5.0, 1.0), 2.1, 0.5, color='#8D6E63'))
    ax.add_patch(Rectangle((4.9, 1.0), 0.5, 1.45, color='#8D6E63')); ax.add_patch(Rectangle((6.7, 1.0), 0.5, 1.45, color='#8D6E63'))
    # stack
    ax.add_patch(Rectangle((8.7, 0.6), 0.9, 1.3, color='#8D6E63')); ax.add_patch(Ellipse((9.15, 1.9), 0.9, 0.3, color='#7CB342'))
    # stump
    ax.add_patch(Rectangle((11.3, 0.6), 0.9, 0.45, color='#8D6E63'))
    for x, t in [(2.6, '1. CAVE'), (6.05, '2. ARCH'), (9.15, '3. STACK'), (11.75, '4. STUMP')]:
        lab(ax, x, 0.25, t, 12.5, '#1A1A1A')
    for x in (1.2, 3.8, 7.8, 10.5): arrow(ax, (x, 0.6), (x + 0.7, 1.4), c='white', lw=2, ms=14)
    lab(ax, 7.0, 3.5, 'HEADLAND OF HARD ROCK (seen from the sea)', 12.5, 'white')
    lab(ax, 7.0, 6.2, 'Waves attack a line of weakness: cave → arch → stack → stump', 12, '#1A1A1A')
    save(fig, 'headland_erosion.png')


def cliff_platform():
    fig, ax = canvas(12, 6, SKY)
    ax.add_patch(Polygon([(0, 0), (12, 0), (12, 4.8), (7.2, 4.8), (7.2, 1.6), (6.7, 1.3), (7.2, 1.0), (4.0, 0.7), (0, 0.6)], color='#8D6E63'))
    ax.add_patch(Rectangle((4.4, 1.3), 2.8, 3.5, fill=False, ec='#555', lw=1.5, ls='--'))
    ax.add_patch(Polygon([(0, 0.6), (4.0, 0.7), (7.2, 1.0), (7.2, 1.3), (0, 1.3)], color='#64B5F6', alpha=0.85))
    ax.add_patch(Rectangle((7.2, 4.8), 4.8, 0.3, color='#8BC34A'))
    labs = [(9.5, 3.2, 'Sea cliff', 'white'), (6.4, 1.9, 'Wave-cut notch', '#1A1A1A'), (3.3, 0.35, 'Wave-cut platform (seen at low tide)', 'white'), (5.8, 3.4, 'Old cliff\nposition', '#555'), (2.0, 1.55, 'Sea', NAVY)]
    for x, y, t, c in labs: lab(ax, x, y, t, 11.5, c)
    arrow(ax, (10.2, 5.5), (7.6, 5.5), c=RED, lw=2.5); lab(ax, 9.0, 5.75, 'The cliff retreats inland', 11, RED)
    title(ax, 6.0, 5.95 - 0.0, '')
    fig.suptitle('SEA CLIFF AND WAVE-CUT PLATFORM', fontsize=16, fontweight='bold', color=RED, y=0.98)
    save(fig, 'cliff_platform.png')


def longshore():
    fig, ax = canvas(13, 7.2, '#64B5F6')
    ax.add_patch(Rectangle((0, 6.6), 13, 0.6, color='white', zorder=3))
    ax.add_patch(Polygon([(0, 4.2), (8.5, 4.2), (8.5, 6.6), (0, 6.6)], color='#8BC34A'))
    ax.add_patch(Polygon([(0, 3.2), (8.5, 3.2), (8.5, 4.2), (0, 4.2)], color=SAND))
    ax.add_patch(Polygon([(8.5, 4.2), (8.5, 3.2), (12.3, 3.6), (12.6, 3.9), (12.2, 4.05)], color=SAND))
    ax.add_patch(Polygon([(8.5, 4.2), (13, 4.2), (13, 6.6), (8.5, 6.6)], color='#90CAF9'))
    ax.add_patch(Polygon([(8.5, 4.2), (11.0, 4.2), (13, 6.6), (8.5, 6.6)], color='#A5D6A7', alpha=0.6))
    for i, x in enumerate([1.0, 2.6, 4.2, 5.8]):
        arrow(ax, (x, 3.3), (x + 0.8, 4.0), c='#0D47A1', lw=2.5, ms=14); arrow(ax, (x + 0.8, 3.95), (x + 0.8, 3.3), c='#E65100', lw=2.5, ms=14)
    for x in np.linspace(0.8, 6.4, 4): arrow(ax, (x - 0.6, 1.6), (x, 2.8), c='white', lw=2, ms=12)
    lab(ax, 2.5, 1.2, 'Prevailing wind and waves', 11.5, 'white')
    lab(ax, 3.6, 4.55, 'Swash goes up at an angle; backwash comes straight down', 11, '#1A1A1A')
    arrow(ax, (1.0, 2.6), (7.8, 2.6), c='#FFEB3B', lw=3.5); lab(ax, 4.2, 2.3, 'Movement of sand along the coast (longshore drift)', 11, '#1A1A1A')
    lab(ax, 11.0, 3.35, 'SPIT', 13, RED); lab(ax, 11.4, 5.3, 'Salt marsh\n(behind the spit)', 10.5, '#1B5E20'); lab(ax, 10.5, 6.2, 'River estuary', 10.5, NAVY)
    ax.text(6.5, 6.9, 'LONGSHORE DRIFT AND THE FORMATION OF A SPIT', fontsize=15, fontweight='bold', color=RED, ha='center', va='center', zorder=4)
    save(fig, 'longshore_spit.png')


def bar_tombolo():
    fig, axs = plt.subplots(1, 2, figsize=(13, 5.4), dpi=200)
    for a in axs: a.set_xlim(0, 6); a.set_ylim(-0.9, 5.2); a.set_aspect('equal'); a.axis('off'); a.add_patch(Rectangle((0, 0), 6, 5, color='#64B5F6'))
    a = axs[0]; a.add_patch(Polygon([(0, 5), (0, 2.0), (1.2, 2.0), (2.0, 3.6), (4.0, 3.6), (4.8, 2.0), (6, 2.0), (6, 5)], color='#8BC34A'))
    a.add_patch(Polygon([(1.2, 2.0), (4.8, 2.0), (4.8, 2.3), (1.2, 2.3)], color=SAND)); a.add_patch(Polygon([(1.2, 2.3), (4.8, 2.3), (4.0, 3.6), (2.0, 3.6)], color='#81D4FA'))
    a.text(3, 2.85, 'LAGOON', ha='center', fontsize=12, fontweight='bold', color=NAVY); a.text(3, 1.55, 'BAR', ha='center', fontsize=13, fontweight='bold', color=RED)
    a.set_title('A BAR: sand across a bay', fontsize=13, fontweight='bold', color=RED)
    a = axs[1]; a.add_patch(Rectangle((0, 3.6), 6, 1.4, color='#8BC34A')); a.add_patch(Circle((3.0, 1.0), 0.8, color='#8BC34A'))
    a.add_patch(Polygon([(2.7, 3.6), (3.3, 3.6), (3.2, 1.7), (2.8, 1.7)], color=SAND))
    a.text(3.0, 1.0, 'Island', ha='center', fontsize=11, fontweight='bold'); a.text(3.8, 2.7, 'TOMBOLO', fontsize=13, fontweight='bold', color=RED)
    a.text(3, 4.3, 'Mainland', ha='center', fontsize=11, fontweight='bold')
    a.set_title('A TOMBOLO: sand joins an island to the land', fontsize=13, fontweight='bold', color=RED)
    fig.suptitle('BARS AND TOMBOLOS', fontsize=16, fontweight='bold', color=RED, y=1.0)
    fig.savefig(OUT + 'bar_tombolo.png', bbox_inches='tight', pad_inches=0.06, facecolor='white'); plt.close(fig)


def coastal_defence():
    fig, axs = plt.subplots(1, 2, figsize=(14, 5.2), dpi=200)
    for a in axs: a.set_xlim(0, 7); a.set_ylim(0, 5); a.set_aspect('equal'); a.axis('off')
    a = axs[0]; a.add_patch(Rectangle((0, 0), 7, 5, color=SKY)); a.add_patch(Polygon([(0, 0.2), (4.0, 1.2), (7, 1.4), (7, 0), (0, 0)], color=SAND))
    a.add_patch(Polygon([(4.0, 1.2), (4.3, 3.2), (4.9, 3.4), (4.9, 1.3)], color='#9E9E9E', ec='#424242')); a.add_patch(Rectangle((4.9, 1.3), 2.1, 2.1, color='#8BC34A'))
    a.add_patch(Rectangle((5.6, 3.4), 0.9, 0.8, color='#FFE0B2', ec='#8D6E63')); a.fill_between(np.linspace(0, 4.1, 100), 0.2, 1.4 + 0.3 * np.sin(np.linspace(0, 12, 100)), color='#64B5F6')
    arrow(a, (4.15, 2.6), (3.2, 2.9), c=NAVY, lw=2.5, cs='arc3,rad=0.4'); a.text(2.2, 3.6, 'Curved face sends\nthe waves back', ha='center', fontsize=10.5, fontweight='bold')
    a.set_title('SEA WALL', fontsize=13, fontweight='bold', color=RED)
    a = axs[1]; a.add_patch(Rectangle((0, 0), 7, 5, color='#64B5F6')); a.add_patch(Rectangle((0, 3.0), 7, 2.0, color='#8BC34A')); a.add_patch(Rectangle((0, 2.0), 7, 1.0, color=SAND))
    for x in (1.5, 3.5, 5.5):
        a.add_patch(Rectangle((x, 0.8), 0.14, 2.2, color='#5D4037'))
        a.add_patch(Polygon([(x - 0.9, 2.0), (x, 2.0), (x, 1.4)], color=SAND))
    arrow(a, (0.3, 1.5), (6.5, 1.5), c='#FFEB3B', lw=3); a.text(3.5, 1.1, 'Longshore drift', ha='center', fontsize=10.5, fontweight='bold')
    a.text(3.5, 4.2, 'Groynes trap sand and widen the beach', ha='center', fontsize=11, fontweight='bold')
    a.set_title('GROYNES (PLAN)', fontsize=13, fontweight='bold', color=RED)
    fig.suptitle('HARD ENGINEERING: PROTECTING THE COAST', fontsize=16, fontweight='bold', color=RED, y=1.0)
    fig.savefig(OUT + 'coastal_defence.png', bbox_inches='tight', pad_inches=0.06, facecolor='white'); plt.close(fig)


ALL = [earth_shape, ship_proof, moon_phases, tides, lat_long, great_circles, time_line, rotation, revolution, earth_structure, rock_cycle, plate_margins, volcano, earthquake,
       denudation, weathering_types, physical_weathering, chemical_weathering, long_profile, erosion_mechanisms, waterfall, spurs, meander, oxbow, levee_delta, waves, headland,
       cliff_platform, longshore, bar_tombolo, coastal_defence]

def earth_circle():
    fig, ax = canvas(12, 7.4, 'white')
    cx, cy = 3.9, 3.5
    for r, c in [(3.3, '#8D6E63'), (3.1, '#E65100'), (1.75, '#FBC02D'), (0.8, '#FFF176')]:
        ax.add_patch(Circle((cx, cy), r, color=c, zorder=2))
    for lbl, y, c in [('Crust', 3.2, 'white'), ('Mantle', 2.45, 'white'), ('Outer core', 1.3, '#1A1A1A'), ('Inner core', 0.0, '#1A1A1A')]:
        lab(ax, cx, cy + y if y else cy, lbl, 12, c)
    rows = [('CRUST', 'Thin outer layer of solid rock', '#6D4C41'), ('MANTLE', 'Thickest layer: hot rock that flows slowly', '#E65100'), ('OUTER CORE', 'Liquid iron and nickel', '#F9A825'), ('INNER CORE', 'Solid iron and nickel; hottest part', '#F57F17')]
    for i, (n, d, c) in enumerate(rows):
        y = 5.8 - i * 1.45
        ax.add_patch(Rectangle((7.8, y - 0.2), 0.45, 0.45, color=c))
        ax.text(8.45, y + 0.12, n, fontsize=13, fontweight='bold', color=c, va='center'); ax.text(8.45, y - 0.35, d, fontsize=10.5, color='#222', va='center')
    title(ax, 6.0, 7.2, 'THE LAYERS OF THE EARTH (CIRCULAR VIEW)')
    save(fig, 'earth_circle.png')


def capes_bays():
    fig, ax = canvas(12, 7.0, '#64B5F6')
    ax.add_patch(Rectangle((0, 6.4), 12, 0.6, color='white', zorder=3))
    # land: hard rock headlands and soft rock bays
    x = np.linspace(0, 12, 400)
    coast = 3.6 + 1.3 * np.where(((x // 3) % 2) == 0, -np.sin(np.pi * (x % 3) / 3), 0.6 * np.sin(np.pi * (x % 3) / 3))
    ax.fill_between(x, coast, 6.4, color='#8BC34A', zorder=1)
    for k in range(4):
        x0 = k * 3; hard = k % 2 == 0
        ax.fill_between(x[(x >= x0) & (x <= x0 + 3)], coast[(x >= x0) & (x <= x0 + 3)], 6.4, color='#8D6E63' if hard else '#D7B98A', zorder=1, alpha=0.9)
        lab(ax, x0 + 1.5, 5.6, 'HARD ROCK' if hard else 'SOFT ROCK', 11, 'white' if hard else '#4E342E')
        if hard: lab(ax, x0 + 1.5, 3.3, 'Cape\n(headland)', 12, 'white')
        else:
            lab(ax, x0 + 1.5, 3.4, 'Bay', 13, '#1A1A1A')
            ax.fill_between(x[(x >= x0 + 0.3) & (x <= x0 + 2.7)], coast[(x >= x0 + 0.3) & (x <= x0 + 2.7)], coast[(x >= x0 + 0.3) & (x <= x0 + 2.7)] + 0.3, color=SAND, zorder=2)
    for xx in np.linspace(0.6, 11.4, 6): arrow(ax, (xx, 0.4), (xx, 1.4), c='white', lw=2.5, ms=14)
    lab(ax, 6, 0.9, 'Waves attack the coast', 12, 'white')
    lab(ax, 6, 1.75, 'Soft rock is eroded faster: it forms bays. Hard rock resists: it forms capes.', 11.5, NAVY)
    ax.text(6, 6.7, 'CAPES (HEADLANDS) AND BAYS', fontsize=15, fontweight='bold', color=RED, ha='center', va='center', zorder=4)
    save(fig, 'capes_bays.png')

if __name__ == '__main__':
    import sys
    for f in ALL:
        if len(sys.argv) == 1 or f.__name__ in sys.argv:
            try: f(); print('done', f.__name__)
            except Exception as e: print('ERR', f.__name__, e)


def soil_profile():
    fig, ax = canvas(12, 7.0, 'white')
    layers = [(5.6, 6.0, '#3E2723', 'Humus and topsoil', 'Dead plants and animals mix with minerals: fertile'), (4.0, 5.6, '#8D5B3A', 'Subsoil', 'Fine particles from weathered rock'),
              (2.2, 4.0, '#B08968', 'Weathered rock (regolith)', 'Broken and rotting rock'), (0.4, 2.2, '#78909C', 'Bedrock (parent rock)', 'Solid rock, attacked by weathering')]
    for y0, y1, c, n, d in layers:
        ax.add_patch(Rectangle((0.6, y0), 4.2, y1 - y0, color=c))
        ax.text(5.2, (y0 + y1) / 2 + 0.18, n, fontsize=13, fontweight='bold', color=c if c != '#3E2723' else '#3E2723', va='center')
        ax.text(5.2, (y0 + y1) / 2 - 0.25, d, fontsize=10.5, color='#222', va='center')
    for x in (1.2, 2.4, 3.6): ax.plot([x, x - 0.1, x + 0.1], [6.0, 6.5, 6.5], color='#2E7D32', lw=2); ax.add_patch(Circle((x, 6.55), 0.15, color='#43A047'))
    for x, y in [(1.2, 3.0), (2.6, 2.6), (3.8, 3.3), (1.8, 3.5)]: ax.add_patch(Polygon([(x, y), (x + 0.4, y + 0.1), (x + 0.3, y + 0.4), (x - 0.05, y + 0.3)], color='#6D4C41'))
    arrow(ax, (11.3, 1.0), (11.3, 5.8), c=RED, lw=3); ax.text(11.0, 4.75, 'Weathering over\nthousands of years', fontsize=11, fontweight='bold', color=RED, ha='right', va='center')
    title(ax, 6.0, 6.8, 'WEATHERING FORMS SOIL: A SOIL PROFILE')
    save(fig, 'soil_profile.png')
