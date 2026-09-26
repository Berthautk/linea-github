import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import Polygon, Circle, FancyArrowPatch, Ellipse, Rectangle
import matplotlib.patheffects as pe

OUT = '/home/claude/f4/img/'
SAND = '#E9C98B'; SAND_D = '#C9A25E'; ROCK = '#9C7B5B'; ROCK_D = '#5E4630'; SKY = '#EAF4FB'
W = [pe.withStroke(linewidth=3, foreground='white')]
rng = np.random.default_rng(3)


def arrow(ax, x1, y1, x2, y2, c='#1C3F6E', lw=2.5, ms=20):
    ax.add_patch(FancyArrowPatch((x1, y1), (x2, y2), arrowstyle='-|>', mutation_scale=ms, color=c, lw=lw))


def label(ax, x, y, t, fs=15, c='#1A1A1A', ha='center', bold=True):
    ax.text(x, y, t, fontsize=fs, color=c, ha=ha, va='center', fontweight='bold' if bold else 'normal', path_effects=W)


def canvas(w=12, h=6.2):
    fig, ax = plt.subplots(figsize=(w, h), dpi=200)
    ax.set_xlim(0, w); ax.set_ylim(0, h); ax.set_aspect('equal'); ax.axis('off')
    ax.add_patch(Rectangle((0, 0), w, h, color=SKY, zorder=0))
    return fig, ax


# ---------- 1. Wind erosion processes ----------
def processes():
    fig, ax = canvas(13, 6.6)
    ax.add_patch(Rectangle((0, 0), 13, 1.6, color=SAND, zorder=1))
    # wind arrows
    for y in (4.6, 3.8, 3.0):
        arrow(ax, 0.3, y, 2.3, y, lw=3)
    label(ax, 1.3, 5.3, 'WIND', 16, '#1C3F6E')
    # --- deflation: grains lifted from surface, pebbles left
    for i in range(40):
        x = rng.uniform(2.3, 5.2); y = rng.uniform(1.7, 3.4)
        ax.add_patch(Circle((x, y), 0.035, color=SAND_D, zorder=3))
    for x in np.linspace(2.4, 5.0, 9):
        ax.add_patch(Ellipse((x, 1.62), 0.28, 0.16, color='#8C8C8C', ec='#555', zorder=4))
    arrow(ax, 2.8, 1.8, 4.2, 3.1, c=SAND_D, lw=2, ms=14)
    label(ax, 3.7, 5.3, '1. DEFLATION', 15, '#990011')
    label(ax, 3.7, 0.95, 'Light sand is blown away;\nheavy pebbles stay behind', 11.5)
    # --- abrasion: rock with worn base
    rock = Polygon([(6.4, 1.6), (6.75, 2.3), (6.6, 3.0), (6.1, 3.4), (6.2, 4.2), (7.2, 4.6), (8.4, 4.3), (8.7, 3.6), (8.2, 3.0),
                    (8.0, 2.3), (8.3, 1.6)], closed=True, color=ROCK, ec=ROCK_D, lw=2, zorder=3)
    ax.add_patch(rock)
    for i in range(45):
        x = rng.uniform(5.2, 6.7); y = rng.uniform(1.7, 2.9)
        ax.add_patch(Circle((x, y), 0.04, color=SAND_D, zorder=4))
    for y in (1.9, 2.3, 2.7):
        arrow(ax, 5.2, y, 6.45, y, c='#B5651D', lw=2, ms=14)
    ax.plot([6.75, 6.75], [1.65, 2.95], color='#990011', lw=2, ls='--', zorder=5)
    label(ax, 7.4, 5.3, '2. ABRASION', 15, '#990011')
    label(ax, 7.3, 0.95, 'Sand blasts the rock,\nstrongest near the ground', 11.5)
    # --- attrition: grains colliding (zoom)
    cx, cy = 10.9, 3.4
    ax.add_patch(Circle((cx, cy), 1.35, color='white', ec='#1C3F6E', lw=2, zorder=3))
    pts = [(10.3, 3.9, 0.22), (10.75, 3.75, 0.2), (11.4, 3.0, 0.24), (11.0, 2.8, 0.18), (10.4, 2.9, 0.16), (11.5, 3.9, 0.15)]
    for x, y, r in pts:
        ax.add_patch(Circle((x, y), r, color=SAND_D, ec='#7A5A20', lw=1.2, zorder=4))
    for x, y in [(10.53, 3.83), (11.2, 2.9)]:
        ax.plot(x, y, marker=(8, 1, 0), ms=16, color='#E02020', zorder=5)
    ax.add_patch(Circle((11.9, 2.6), 0.09, color=SAND_D, ec='#7A5A20', zorder=4))
    ax.add_patch(Circle((12.05, 2.85), 0.06, color=SAND_D, ec='#7A5A20', zorder=4))
    label(ax, 10.9, 5.3, '3. ATTRITION', 15, '#990011')
    label(ax, 10.9, 0.95, 'Grains hit each other and\nbecome smaller and rounder', 11.5)
    ax.text(6.5, 6.25, 'THE THREE PROCESSES OF WIND EROSION', fontsize=17, fontweight='bold', color='#990011', ha='center')
    plt.savefig(OUT + 'wind_processes.png', bbox_inches='tight', pad_inches=0.05); plt.close()


# ---------- 2. Zeugen ----------
def zeugen():
    fig, ax = canvas(12, 6.4)
    ax.add_patch(Rectangle((0, 0), 12, 0.9, color=SAND, zorder=1))
    base_y = 0.9
    ridges = [(0.6, 2.6), (3.6, 5.8), (7.4, 9.2), (10.4, 11.6)]
    for x1, x2 in ridges:
        soft = Polygon([(x1, base_y), (x1 + 0.35, 3.1), (x2 - 0.35, 3.1), (x2, base_y)], color='#E8D3A6', ec='#8A6A3A', lw=1.5, zorder=2)
        hard = Polygon([(x1 + 0.2, 3.1), (x1 + 0.3, 3.9), (x2 - 0.3, 3.9), (x2 - 0.2, 3.1)], color=ROCK_D, ec='#2E2016', lw=1.5, zorder=3)
        ax.add_patch(soft); ax.add_patch(hard)
        for yy in (1.5, 2.1, 2.6):
            ax.plot([x1 + 0.2, x2 - 0.2], [yy, yy], color='#C9AE7A', lw=1, zorder=2)
    # furrows labels
    label(ax, 3.1, 1.5, 'Furrow', 12, '#6B3A0A')
    label(ax, 6.6, 1.5, 'Furrow', 12, '#6B3A0A')
    # labels with leader lines
    ax.annotate('Hard rock (cap)', xy=(4.7, 3.7), xytext=(4.0, 5.1), fontsize=13, fontweight='bold', ha='center',
                arrowprops=dict(arrowstyle='-', color='black', lw=1.3))
    ax.annotate('Soft rock', xy=(8.3, 2.3), xytext=(9.6, 4.9), fontsize=13, fontweight='bold', ha='center',
                arrowprops=dict(arrowstyle='-', color='black', lw=1.3))
    ax.annotate('ZEUGEN\n(flat-topped ridge)', xy=(1.6, 3.9), xytext=(1.6, 5.1), fontsize=13, fontweight='bold', ha='center', color='#990011',
                arrowprops=dict(arrowstyle='-', color='#990011', lw=1.3))
    # wind symbol: into the page (along furrows)
    ax.add_patch(Circle((7.0, 5.1), 0.28, color='white', ec='#1C3F6E', lw=2.5))
    ax.plot([6.82, 7.18], [4.92, 5.28], color='#1C3F6E', lw=2.5); ax.plot([6.82, 7.18], [5.28, 4.92], color='#1C3F6E', lw=2.5)
    ax.text(7.45, 5.1, 'Wind blows along the\nfurrows (into the page)', fontsize=11.5, fontweight='bold', color='#1C3F6E', va='center')
    ax.text(6, 6.1, 'ZEUGEN: HARD ROCK LYING ON SOFT ROCK', fontsize=17, fontweight='bold', color='#990011', ha='center')
    plt.savefig(OUT + 'zeugen.png', bbox_inches='tight', pad_inches=0.05); plt.close()


# ---------- 3. Barchan (plan view) ----------
def barchan():
    fig, ax = canvas(12, 6.6)
    ax.add_patch(Rectangle((0, 0), 12, 6.6, color='#F6E7C3', zorder=0))
    cx, cy = 6.0, 3.0
    to = np.radians(np.linspace(80, 280, 120))
    ox = cx + 0.6 + 3.0 * np.cos(to); oy = cy + 2.3 * np.sin(to)
    ti = np.radians(np.linspace(262, 98, 120))
    ix = cx + 2.3 + 2.0 * np.cos(ti); iy = cy + 1.75 * np.sin(ti)
    pts = [(cx + 3.0, cy + 2.3)] + list(zip(ox, oy)) + [(cx + 3.0, cy - 2.3)] + list(zip(ix, iy))
    ax.add_patch(Polygon(pts, closed=True, color='#E3B25C', ec='#8A5A20', lw=2))
    # slip face shading (inner edge)
    ax.plot(ix, iy, color='#7A4A10', lw=5, alpha=0.6)
    for y in (5.2, 3.0, 0.8):
        arrow(ax, 0.3, y, 2.4, y, lw=3.2)
    label(ax, 1.3, 5.9, 'WIND', 16, '#1C3F6E')
    ax.annotate('Horn', xy=(cx + 2.95, cy + 2.28), xytext=(cx + 3.8, cy + 2.75), fontsize=13, fontweight='bold', arrowprops=dict(arrowstyle='-', lw=1.3))
    ax.annotate('Horn', xy=(cx + 2.95, cy - 2.28), xytext=(cx + 3.8, cy - 2.95), fontsize=13, fontweight='bold', arrowprops=dict(arrowstyle='-', lw=1.3))
    ax.annotate('Windward slope\n(gentle, convex)', xy=(cx - 2.0, cy + 1.2), xytext=(2.4, 1.9), fontsize=12.5, fontweight='bold', ha='center',
                arrowprops=dict(arrowstyle='-', lw=1.3))
    ax.annotate('Slip face / leeward\nslope (steep, concave)', xy=(cx + 0.45, cy - 0.5), xytext=(9.7, 3.0), fontsize=12.5, fontweight='bold', ha='center',
                arrowprops=dict(arrowstyle='-', lw=1.3))
    ax.text(6.6, 6.25, 'BARCHAN DUNE (SEEN FROM ABOVE): THE HORNS POINT DOWNWIND', fontsize=15, fontweight='bold', color='#990011', ha='center')
    plt.savefig(OUT + 'barchan_plan.png', bbox_inches='tight', pad_inches=0.05); plt.close()


# ---------- 4. Oasis cross-section ----------
def oasis():
    fig, ax = canvas(13, 6.4)
    # layers: top sand, permeable sandstone (aquifer), impermeable base
    xs = np.linspace(0, 13, 300)
    surface = 4.2 - 0.25 * np.sin(xs / 2) - np.where(abs(xs - 8.6) < 1.6, 1.75 * np.cos((xs - 8.6) / 1.6 * np.pi / 2) ** 2, 0) + np.where(xs < 2.5, (2.5 - xs) * 0.55, 0)
    aq_top = 3.0 + np.where(xs < 2.5, (2.5 - xs) * 0.45, 0)
    aq_bot = 1.6 + np.where(xs < 2.5, (2.5 - xs) * 0.35, 0)
    ax.fill_between(xs, 0, aq_bot, color='#8C8C8C', zorder=1)
    ax.fill_between(xs, aq_bot, aq_top, color='#C9D8E8', zorder=1, hatch='..', edgecolor='#5B7EA6')
    ax.fill_between(xs, aq_top, surface, color=SAND, zorder=1, where=surface > aq_top)
    # water table (dashed)
    wt = aq_top + 0.0 + np.where(xs < 2.5, 0.2, 0)
    ax.plot(xs, np.minimum(surface, 3.05 + np.where(xs < 2.5, (2.5 - xs) * 0.45, 0)), color='#1F5FBF', lw=2, ls='--', zorder=3)
    # pond at oasis
    m = abs(xs - 8.6) < 1.6
    ax.fill_between(xs[m], surface[m], 3.05, color='#3A86D6', zorder=3, where=surface[m] < 3.05)
    # palm trees
    for px in (7.3, 7.7, 9.6, 10.0):
        py = float(np.interp(px, xs, surface))
        ax.plot([px, px + 0.05], [py, py + 1.1], color='#6B4A2A', lw=4, zorder=4)
        for ang in np.linspace(20, 160, 5):
            a = np.radians(ang)
            ax.plot([px + 0.05, px + 0.05 + 0.55 * np.cos(a)], [py + 1.1, py + 1.1 + 0.3 * np.sin(a) - 0.1], color='#2E8B3A', lw=3.5, zorder=4)
    # rain on highland
    for x in np.linspace(0.3, 1.9, 7):
        ax.plot([x, x - 0.15], [6.0, 5.55], color='#1F5FBF', lw=2)
    ax.add_patch(Ellipse((1.1, 6.15), 2.0, 0.5, color='#B0B8C0'))
    arrow(ax, 2.2, 2.4, 6.8, 2.4, c='#1F5FBF', lw=2.5)
    label(ax, 4.6, 2.05, 'Underground water flows slowly', 11.5, '#1F3F8F')
    label(ax, 1.3, 5.1, 'Rain on distant\nhighlands', 11.5, '#1F3F8F')
    label(ax, 8.7, 5.75, 'OASIS', 16, '#1B6A2A')
    label(ax, 11.6, 3.5, 'Desert sand', 12, '#6B3A0A')
    label(ax, 11.3, 2.3, 'Permeable rock\nholding water', 11.5, '#1F3F8F')
    label(ax, 11.3, 0.8, 'Impermeable rock', 12, '#1A1A1A')
    label(ax, 5.0, 3.35, '- - - water table', 11, '#1F5FBF')
    ax.text(6.5, 6.45, 'HOW AN OASIS IS FORMED', fontsize=17, fontweight='bold', color='#990011', ha='center')
    ax.set_ylim(0, 6.8)
    plt.savefig(OUT + 'oasis.png', bbox_inches='tight', pad_inches=0.05); plt.close()


processes(); zeugen(); barchan(); oasis()
print('ok')
