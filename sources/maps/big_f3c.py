"""Diagrams added when lessons 10 (Plate Tectonics) and 11 (Volcanoes) of the Form 3 programme were enriched
(volcanic features of the old syllabus: intrusive and extrusive features; the three kinds of destructive margins).
Standalone: needs only matplotlib. Run: python3 big_f3c.py [name ...]"""
import sys
import numpy as np
from matplotlib.patches import Polygon, Rectangle, Ellipse, Circle, FancyArrowPatch, PathPatch
from matplotlib.path import Path
from illus import canvas, lab, arrow, save, RED, NAVY, W_, H_

SKY = '#E3F2FD'; ROCK = ['#BCAAA4', '#A1887F', '#D7CCC8', '#8D6E63']; MAG = '#E53935'; DARK = '#4E342E'; ORANGE = '#E65100'
LAVA = '#FF7043'; ASH = '#9E9E9E'


def strata(ax, x0, x1, ytop, ybot, n=3, tilt=0.0):
    h = (ytop - ybot) / n
    for k in range(n):
        ax.add_patch(Rectangle((x0, ybot + k * h), x1 - x0, h, color=ROCK[k % 4], zorder=1))
        ax.plot([x0, x1], [ybot + k * h, ybot + k * h], color='#6D4C41', lw=1.5, zorder=2)


def intrusive_features_big():
    fig, ax = canvas(bg=SKY)
    G = 3.2                                              # ground level
    strata(ax, 0, W_, G, 0.0, n=4)
    # batholith (large mass at depth) + pipe + cone + plug
    ax.add_patch(Ellipse((6.9, 0.0), 6.2, 2.1, color=MAG, zorder=3)); lab(ax, 6.9, 0.45, 'Batholith', fs=18, c=RED)
    ax.add_patch(Rectangle((6.78, 1.0), 0.24, G - 1.0 + 0.9, color=MAG, zorder=3))
    ax.add_patch(Polygon([(6.0, G), (6.9, G + 1.05), (7.8, G)], color='#6D4C41', zorder=4))
    lab(ax, 8.0, G + 1.15, 'Volcanic cone', fs=16, c=DARK)
    lab(ax, 6.9, G - 0.35, 'Plug', fs=15, c=RED)
    # dyke + sill
    ax.add_patch(Rectangle((3.35, 0.9), 0.2, G - 0.9, color=MAG, zorder=3)); lab(ax, 3.45, G + 0.6, 'Dyke', fs=18, c=RED)
    ax.add_patch(Rectangle((3.55, 1.75), 2.3, 0.17, color=MAG, zorder=3)); lab(ax, 4.7, 1.25, 'Sill', fs=18, c=RED)
    # phacolith in a fold (left)
    xs = np.linspace(0.2, 2.9, 80)
    for yb, c in ((2.2, '#6D4C41'), (2.6, '#6D4C41')):
        ax.plot(xs, yb + 0.35 * np.sin((xs - 0.2) / 2.7 * 2 * np.pi), color=c, lw=2, zorder=2)
    ax.add_patch(Ellipse((1.55, 2.75), 0.9, 0.28, color=MAG, zorder=3)); lab(ax, 1.55, 1.55, 'Phacolith', fs=17, c=RED)
    ax.annotate('', xy=(1.55, 2.62), xytext=(1.55, 1.9), arrowprops=dict(arrowstyle='-', color=RED, lw=2), zorder=3)
    # laccolith (dome, flat base)
    th = np.linspace(0, np.pi, 60)
    ax.add_patch(Polygon(np.c_[9.0 + 0.85 * np.cos(th), 1.9 + 0.7 * np.sin(th)], color=MAG, zorder=3))
    ax.plot([9.0, 9.0], [0.7, 1.9], color=MAG, lw=6, zorder=3)
    lab(ax, 9.9, 3.55, 'Laccolith', fs=18, c=RED)
    ax.annotate('', xy=(9.1, 2.55), xytext=(9.7, 3.3), arrowprops=dict(arrowstyle='-', color=RED, lw=2), zorder=3)
    # lopolith (saucer)
    t = np.linspace(0, np.pi, 60)
    ax.add_patch(Polygon(np.c_[np.r_[11.2 + 1.2 * np.cos(t)[::-1], 11.2 + 1.0 * np.cos(t)], np.r_[1.9 - 0.9 * np.sin(t)[::-1] + 0.5, 1.9 - 0.8 * np.sin(t) + 0.2]], color=MAG, zorder=3))
    lab(ax, 11.8, 3.9, 'Lopolith', fs=18, c=RED)
    ax.annotate('', xy=(11.5, 1.75), xytext=(11.8, 3.65), arrowprops=dict(arrowstyle='-', color=RED, lw=2), zorder=3)
    ax.text(0.2, 4.65, 'INTRUSIVE FEATURES: magma cools INSIDE the crust', fontsize=19, fontweight='bold', color=RED)
    save(fig, 'intrusive_features_big.png')


def _ground(ax, h=0.9, c='#8D6E63'):
    ax.add_patch(Rectangle((0, 0), W_, h, color=c, zorder=1))


def lava_cone_big():
    fig, ax = canvas(bg=SKY); _ground(ax)
    # panel 1: lava (shield) cone with gentle slopes
    ax.add_patch(Polygon([(0.3, 0.9), (2.0, 1.55), (3.2, 1.8), (4.4, 1.55), (6.1, 0.9)], color='#6D4C41', zorder=3))
    for k, (a, b) in enumerate(((1.45, 1.1), (1.2, 1.3))):
        ax.plot([0.9 + k * 0.5, 5.5 - k * 0.5], [1.1 + k * 0.28, 1.1 + k * 0.28], color=LAVA, lw=4, zorder=4)
    ax.add_patch(Rectangle((3.15, 0.9), 0.1, 0.9, color=MAG, zorder=4))
    ax.add_patch(Ellipse((3.2, 0.5), 2.4, 0.7, color=MAG, zorder=2))
    lab(ax, 3.2, 3.9, 'LAVA CONE', fs=20, c=NAVY); lab(ax, 3.2, 3.2, 'runny lava, gentle slopes', fs=15, c='#333')
    lab(ax, 3.2, 2.45, 'e.g. Mauna Loa (Hawaii)', fs=14, c='#555')
    # panel 2: lava dome (thick lava, steep)
    ax.add_patch(Polygon([(7.4, 0.9), (7.7, 1.8), (8.4, 2.5), (9.2, 2.6), (10.0, 2.5), (10.7, 1.8), (11.0, 0.9)], color='#6D4C41', zorder=3))
    ax.add_patch(Rectangle((9.1, 0.9), 0.12, 1.5, color=MAG, zorder=4))
    lab(ax, 9.2, 3.9, 'LAVA DOME', fs=20, c=ORANGE); lab(ax, 9.2, 3.35, 'thick lava, steep rounded sides', fs=15, c='#333')
    ax.plot([6.6, 6.6], [0.3, 4.4], color='#999', lw=2, ls='--', zorder=2)
    save(fig, 'lava_cone_big.png')


def cinder_cone_big():
    fig, ax = canvas(bg=SKY); _ground(ax)
    ax.add_patch(Polygon([(2.6, 0.9), (5.2, 3.0), (5.6, 2.9), (6.0, 3.0), (8.6, 0.9)], color='#5D4037', zorder=3))
    rng = np.random.RandomState(3)
    for _ in range(150):
        x = rng.uniform(3.0, 8.2); top = 3.0 - 2.1 * abs(x - 5.6) / 3.0 * 1.0
        y = rng.uniform(0.95, max(1.0, top - 0.1))
        ax.plot([x], [y], '.', color='#BCAAA4', ms=5, zorder=4)
    ax.add_patch(Polygon([(5.2, 3.0), (5.6, 2.6), (6.0, 3.0)], color='#8D6E63', zorder=4))
    ax.add_patch(Rectangle((5.5, 0.9), 0.2, 1.8, color=MAG, zorder=4))
    for dx, dy in ((5.2, 3.9), (5.6, 4.3), (6.1, 3.7)):
        ax.plot([5.6, dx], [3.0, dy], color=ASH, lw=6, alpha=0.6, zorder=5)
    lab(ax, 2.2, 3.9, 'ASH AND CINDER CONE', fs=20, c=ORANGE, ha='left')
    lab(ax, 9.9, 2.4, 'small and steep', fs=16, c='#333'); lab(ax, 9.9, 1.7, 'loose ash and cinders', fs=16, c='#333')
    lab(ax, 3.2, 2.3, 'crater', fs=15, c=DARK); ax.annotate('', xy=(5.55, 2.8), xytext=(3.7, 2.3), arrowprops=dict(arrowstyle='-|>', color=DARK, lw=2), zorder=6)
    save(fig, 'cinder_cone_big.png')


def composite_cone_big():
    fig, ax = canvas(bg=SKY); _ground(ax)
    P = [(2.0, 0.9), (5.4, 4.0), (5.9, 4.1), (6.4, 4.0), (9.8, 0.9)]
    ax.add_patch(Polygon(P, color='#5D4037', zorder=3))
    for k, y in enumerate((1.5, 2.1, 2.7, 3.3)):                    # alternating layers of lava and ash
        x0 = 2.0 + (y - 0.9) / 3.1 * 3.4; x1 = 9.8 - (y - 0.9) / 3.1 * 3.4
        ax.plot([x0 + 0.1, x1 - 0.1], [y, y], color=LAVA if k % 2 == 0 else ASH, lw=7, zorder=4, solid_capstyle='butt')
    ax.add_patch(Rectangle((5.8, 0.9), 0.2, 3.1, color=MAG, zorder=5))
    ax.add_patch(Polygon([(5.4, 4.0), (5.9, 3.65), (6.4, 4.0)], color='#8D6E63', zorder=5))
    ax.add_patch(Polygon([(7.8, 1.9), (8.3, 2.4), (8.8, 1.9)], color='#4E342E', zorder=5))
    ax.plot([5.9, 8.3], [1.4, 2.3], color=MAG, lw=4, zorder=5)
    ax.add_patch(Ellipse((5.9, 0.35), 3.0, 0.7, color=MAG, zorder=2))
    lab(ax, 2.3, 4.4, 'COMPOSITE CONE', fs=20, c=RED, ha='left')
    lab(ax, 10.6, 3.2, 'layers of lava', fs=15, c=ORANGE); lab(ax, 10.6, 2.6, 'and ash', fs=15, c='#555')
    lab(ax, 10.9, 1.5, 'side cone', fs=15, c=DARK); ax.annotate('', xy=(8.4, 2.1), xytext=(10.0, 1.6), arrowprops=dict(arrowstyle='-|>', color=DARK, lw=2), zorder=6)
    lab(ax, 1.4, 2.7, 'vent', fs=15, c=RED); ax.annotate('', xy=(5.78, 2.7), xytext=(2.0, 2.7), arrowprops=dict(arrowstyle='-|>', color=RED, lw=2), zorder=6)
    save(fig, 'composite_cone_big.png')


def caldera_big():
    fig, ax = canvas(bg=SKY); _ground(ax)
    # crater (left): small bowl on top of a cone
    ax.add_patch(Polygon([(0.5, 0.9), (2.5, 3.0), (2.9, 2.55), (3.3, 2.55), (3.7, 3.0), (5.7, 0.9)], color='#6D4C41', zorder=3))
    ax.add_patch(Rectangle((3.0, 0.9), 0.2, 1.65, color=MAG, zorder=4))
    lab(ax, 3.1, 4.4, 'CRATER', fs=20, c=NAVY); lab(ax, 3.1, 3.75, 'small bowl at the top of the vent', fs=14, c='#333')
    # caldera (right): wide basin with lake
    ax.add_patch(Polygon([(7.0, 0.9), (8.2, 2.8), (8.6, 2.4), (9.0, 1.9), (10.6, 1.9), (11.0, 2.4), (11.4, 2.8), (12.6, 0.9)], color='#6D4C41', zorder=3))
    ax.add_patch(Rectangle((9.0, 1.9), 1.6, 0.3, color='#4FC3F7', zorder=4))
    ax.add_patch(Ellipse((9.8, 0.55), 3.4, 0.9, color=MAG, zorder=2))
    lab(ax, 9.9, 4.4, 'CALDERA', fs=20, c=ORANGE); lab(ax, 9.9, 3.75, 'huge basin left when the cone collapses', fs=14, c='#333')
    lab(ax, 9.8, 2.85, 'crater lake', fs=14, c='#0277BD'); ax.annotate('', xy=(9.8, 2.25), xytext=(9.8, 2.6), arrowprops=dict(arrowstyle='-|>', color='#0277BD', lw=2), zorder=6)
    arrow(ax, (9.1, 3.1), (9.1, 2.3), c=RED, lw=4, ms=28)
    arrow(ax, (10.5, 3.1), (10.5, 2.3), c=RED, lw=4, ms=28)
    ax.plot([6.3, 6.3], [0.3, 4.9], color='#999', lw=2, ls='--', zorder=2)
    save(fig, 'caldera_big.png')


def destructive_types_big():
    fig, ax = canvas(bg='#FFFFFF')
    panels = [('OCEAN – CONTINENT', 'trench, fold mountains,\nvolcanoes (Andes)'), ('OCEAN – OCEAN', 'trench and island arc\n(Japan, Philippines)'), ('CONTINENT – CONTINENT', 'collision: very high fold\nmountains (Himalayas)')]
    for k, (t, d) in enumerate(panels):
        x0 = 0.1 + k * 4.3
        ax.add_patch(Rectangle((x0, 0.2), 4.1, 1.6, color='#EF7C34', zorder=1))        # mantle
        ocean = '#455A64'; cont = '#8D6E63'
        if k == 0:
            ax.add_patch(Rectangle((x0, 1.8), 1.9, 0.5, color=ocean, zorder=2)); ax.add_patch(Polygon([(x0 + 1.9, 1.8), (x0 + 1.9, 2.3), (x0 + 4.1, 2.3), (x0 + 4.1, 1.8)], color=cont, zorder=2))
            ax.add_patch(Polygon([(x0 + 1.5, 1.8), (x0 + 2.4, 1.8), (x0 + 1.4, 0.3), (x0 + 0.9, 0.3)], color=ocean, zorder=2))
            ax.add_patch(Polygon([(x0 + 2.6, 2.3), (x0 + 3.2, 3.1), (x0 + 3.8, 2.3)], color='#6D4C41', zorder=3))
            ax.add_patch(Polygon([(x0 + 3.15, 3.1), (x0 + 3.2, 3.2), (x0 + 3.3, 3.1)], color=MAG, zorder=4))
            lab(ax, x0 + 1.05, 2.8, 'trench', fs=13, c=NAVY)
        elif k == 1:
            ax.add_patch(Rectangle((x0, 1.8), 1.9, 0.5, color=ocean, zorder=2)); ax.add_patch(Rectangle((x0 + 1.9, 1.8), 2.2, 0.5, color='#607D8B', zorder=2))
            ax.add_patch(Polygon([(x0 + 1.5, 1.8), (x0 + 2.4, 1.8), (x0 + 1.4, 0.3), (x0 + 0.9, 0.3)], color=ocean, zorder=2))
            for xx in (2.7, 3.3, 3.8):
                ax.add_patch(Polygon([(x0 + xx - 0.25, 2.3), (x0 + xx, 2.8), (x0 + xx + 0.25, 2.3)], color='#6D4C41', zorder=3))
            lab(ax, x0 + 1.05, 2.8, 'trench', fs=13, c=NAVY)
        else:
            ax.add_patch(Polygon([(x0, 1.8), (x0, 2.3), (x0 + 2.1, 2.3), (x0 + 2.1, 1.8)], color=cont, zorder=2)); ax.add_patch(Polygon([(x0 + 2.1, 1.8), (x0 + 2.1, 2.3), (x0 + 4.1, 2.3), (x0 + 4.1, 1.8)], color='#A1887F', zorder=2))
            ax.add_patch(Polygon([(x0 + 1.2, 2.3), (x0 + 2.05, 3.5), (x0 + 2.9, 2.3)], color='#6D4C41', zorder=3))
            ax.plot([x0 + 1.55, x0 + 2.55], [2.45, 2.45], color='#D7CCC8', lw=3, zorder=4); ax.plot([x0 + 1.75, x0 + 2.35], [2.85, 2.85], color='#D7CCC8', lw=3, zorder=4)
        lab(ax, x0 + 2.05, 4.55, t, fs=15, c=RED)
        lab(ax, x0 + 2.05, 3.95 if k != 2 else 4.0, d, fs=12, c='#333')
    for xx in (0.1 + 4.1 + 0.1, 0.1 + 8.6 - 0.1):
        ax.plot([xx, xx], [0.2, 4.9], color='#BBB', lw=1.5, ls='--')
    save(fig, 'destructive_types_big.png')


if __name__ == '__main__':
    for n in (sys.argv[1:] or [k for k in dir() if k.endswith('_big')]):
        globals()[n]()
