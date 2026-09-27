"""Big-label diagrams for the Form 3 programme (physical geography), added for L9-L11 (2023 syllabus wording)."""
import sys
from big_common import *
from matplotlib.patches import Polygon, Ellipse
SEA = '#CFE6F5'; LAND = '#D7C49E'


def drift_stages_big():
    fig = plt.figure(figsize=(12.8, 5.0), dpi=150)
    heads = ['About 250 million years ago', 'About 150 million years ago', 'Today']
    for k in range(2):
        ax = fig.add_axes([0.01 + k * 0.335, 0.02, 0.31, 0.8]); ax.set_xlim(0, 4); ax.set_ylim(0, 5); ax.axis('off')
        ax.add_patch(Rectangle((0, 0), 4, 5, color=SEA))
        if k == 0:
            ax.add_patch(Polygon([(0.6, 1.0), (1.6, 0.6), (2.8, 0.9), (3.3, 1.8), (2.4, 2.3), (3.3, 2.9), (3.4, 3.9), (2.4, 4.4), (1.0, 4.2), (0.5, 3.2), (0.8, 2.2)], color=LAND, ec='#6D4C41', lw=2))
            ax.text(1.6, 2.6, 'PANGAEA', fontsize=20, fontweight='bold', ha='center', color='#4E342E')
            ax.text(3.35, 2.45, 'Tethys', fontsize=12, fontweight='bold', ha='center', color=NAVY)
            ax.text(2.0, 0.2, 'Panthalassa (one ocean)', fontsize=13, fontweight='bold', ha='center', color=NAVY)
        else:
            ax.add_patch(Polygon([(0.4, 3.2), (1.5, 3.0), (2.8, 3.2), (3.6, 3.7), (3.2, 4.4), (1.8, 4.6), (0.6, 4.2)], color=LAND, ec='#6D4C41', lw=2))
            ax.add_patch(Polygon([(0.6, 0.7), (1.8, 0.5), (3.0, 0.8), (3.4, 1.7), (2.6, 2.4), (1.4, 2.5), (0.5, 1.9)], color=LAND, ec='#6D4C41', lw=2))
            ax.text(2.0, 3.8, 'LAURASIA', fontsize=17, fontweight='bold', ha='center', color='#4E342E')
            ax.text(1.9, 1.5, 'GONDWANALAND', fontsize=15, fontweight='bold', ha='center', color='#4E342E')
            ax.text(2.0, 2.75, 'Tethys Sea', fontsize=13, fontweight='bold', ha='center', color=NAVY)
            for x in (0.9, 3.1):
                ax.annotate('', xy=(x, 4.85), xytext=(x, 4.45), arrowprops=dict(arrowstyle='-|>', color=RED, lw=3))
                ax.annotate('', xy=(x, 0.1), xytext=(x, 0.5), arrowprops=dict(arrowstyle='-|>', color=RED, lw=3))
        fig.text(0.165 + k * 0.335, 0.9, heads[k], fontsize=17, fontweight='bold', ha='center', color=NAVY)
        if k == 0: fig.text(0.335, 0.45, '→', fontsize=40, fontweight='bold', ha='center', va='center', color=RED)
        else: fig.text(0.67, 0.45, '→', fontsize=40, fontweight='bold', ha='center', va='center', color=RED)
    ax = fig.add_axes([0.685, 0.08, 0.31, 0.72], projection=PC); ax.set_extent([-170, 180, -58, 80], crs=PC); ax.set_facecolor(SEA)
    ax.add_geometries([land()], PC, facecolor=LAND, edgecolor='#6D4C41', lw=0.6)
    fig.text(0.84, 0.9, heads[2], fontsize=17, fontweight='bold', ha='center', color=NAVY)
    fig.text(0.84, 0.02, 'The continents still move a few cm a year', fontsize=12, fontweight='bold', ha='center', color=RED)
    msave(fig, 'drift_stages_big.png')


def volcano_types_big():
    fig, ax = canvas(bg='#E3F2FD')
    ax.add_patch(Rectangle((0, 0), W_, 0.9, color='#8D6E63'))
    shapes = [('SHIELD VOLCANO', 'gentle slopes of runny lava\n(Mauna Loa, Hawaii)', [(0.3, 0.9), (2.2, 1.9), (2.6, 2.0), (3.0, 1.9), (4.1, 0.9)]),
              ('COMPOSITE CONE', 'layers of lava and ash\n(Mount Cameroon, Fuji)', [(4.5, 0.9), (6.1, 3.3), (6.6, 3.4), (7.1, 3.3), (8.5, 0.9)]),
              ('ASH / CINDER CONE', 'small, steep cone of ash\n(Paricutin, Mexico)', [(9.4, 0.9), (10.7, 2.8), (11.1, 2.8), (12.4, 0.9)])]
    for k, (t, d, pts) in enumerate(shapes):
        ax.add_patch(Polygon(pts, color='#6D4C41', zorder=3))
        if k == 1:
            for y in (1.4, 2.0, 2.6): ax.plot([4.5 + (y - 0.9) / 2.4 * 1.6 + 0.1, 8.5 - (y - 0.9) / 2.4 * 1.4 - 0.1], [y, y], color='#BCAAA4', lw=3, zorder=4)
        cx = (pts[0][0] + pts[-1][0]) / 2
        ax.text(cx, 4.55, t, fontsize=20, fontweight='bold', ha='center', color=[NAVY, RED, ORANGE][k])
        ax.text(cx, 3.85, d, fontsize=14, fontweight='bold', ha='center', va='center', color='#333')
        px, py = max(pts, key=lambda p: p[1]); px = (pts[1][0] + pts[-2][0]) / 2 if k != 0 else pts[2][0]
        ax.plot([px], [py + 0.05], marker='v', ms=12, color='#E53935', zorder=5)
    ax.text(W_ / 2, 0.4, 'Types of volcanoes by shape', fontsize=17, fontweight='bold', ha='center', color='white')
    save(fig, 'volcano_types_big.png')


def intrusive_extrusive_big():
    fig, ax = canvas(bg='#E3F2FD')
    ax.add_patch(Rectangle((0, 0), W_, 3.2, color='#A1887F', zorder=1))
    for y in (0.8, 1.6, 2.4): ax.plot([0, W_], [y, y], color='#8D6E63', lw=2, zorder=2)
    ax.add_patch(Ellipse((6.4, 0.15), 6.0, 1.6, color='#E53935', zorder=3)); lab(ax, 9.2, 0.45, 'Batholith', fs=17, c=RED)
    ax.add_patch(Rectangle((6.25, 0.8), 0.3, 2.4, color='#E53935', zorder=3))
    ax.add_patch(Polygon([(4.9, 3.2), (6.4, 4.7), (7.9, 3.2)], color='#6D4C41', zorder=4)); lab(ax, 8.9, 4.35, 'Volcanic cone', fs=17, c='#4E342E')
    ax.plot([6.4, 6.4], [3.2, 4.65], color='#E53935', lw=8, zorder=5)
    ax.add_patch(Polygon([(7.4, 3.5), (10.5, 3.2), (7.9, 3.2)], color='#FF7043', zorder=4)); lab(ax, 11.1, 3.55, 'Lava flow', fs=17, c=ORANGE)
    ax.add_patch(Rectangle((2.3, 0.9), 0.22, 2.3, color='#E53935', zorder=3)); lab(ax, 1.4, 2.7, 'Dyke', fs=17, c=RED)
    ax.add_patch(Rectangle((2.52, 1.95), 3.72, 0.2, color='#E53935', zorder=3)); lab(ax, 3.9, 1.55, 'Sill', fs=17, c=RED)
    ax.add_patch(Ellipse((10.4, 2.1), 1.8, 0.9, color='#E53935', zorder=3)); lab(ax, 10.4, 1.2, 'Laccolith', fs=17, c=RED)
    ax.plot([10.4, 10.4], [0.7, 1.7], color='#E53935', lw=5, zorder=3)
    ax.text(0.2, 4.7, 'EXTRUSIVE: on the surface', fontsize=18, fontweight='bold', color=ORANGE)
    ax.text(0.2, 0.25, 'INTRUSIVE: inside the crust', fontsize=18, fontweight='bold', color='white', zorder=6)
    save(fig, 'intrusive_extrusive_big.png')


if __name__ == '__main__':
    for n in (sys.argv[1:] or [k for k in dir() if k.endswith('_big')]): globals()[n]()
