"""Big-label diagrams for Form 2 Technical: the Equatorial region (progression sheet weeks 2-5)."""
from big_common import *
from images2 import LAND110


def equatorial_world_big():
    ext = (-95, 160, -30, 30); fig, ax = map_axes(ext, (12.8, 3.1)); ax.set_position([0, 0, 1, 1])
    band = box(-180, -5, 180, 5).union(box(-15, 3, 12, 8)).intersection(LAND110)   # 5°N-5°S, plus the Guinea coast
    ax.add_geometries([band], PC, facecolor='#2E7D32', edgecolor='#1B5E20', lw=0.8, zorder=3)
    latline(ax, ext, 0, 'Equator 0°', c=RED, ls='-')
    for la, t in [(5, '5°N'), (-5, '5°S')]:
        ax.plot([ext[0], ext[1]], [la, la], color='#1565C0', ls='--', lw=2.5, transform=PC, zorder=6)
        ax.text(152, la, t, fontsize=20, fontweight='bold', color='#1565C0', ha='center', va='center', transform=PC, zorder=30,
                bbox=dict(boxstyle='round,pad=0.15', fc='white', ec='none'))
    for x, y, t in [(-62, -17, 'AMAZON BASIN'), (20, -18, 'CONGO BASIN'), (112, -17, 'SOUTH-EAST ASIA'), (-45, 17, 'GUINEA COAST')]:
        mlab(ax, x, y, t, fs=22, c='#1B5E20')
    ax.plot([-28, -8], [15.5, 7], color='#1B5E20', lw=3, transform=PC, zorder=39)
    ax.plot(11.5, 3.9, 'o', ms=14, color=RED, mec='black', transform=PC, zorder=40); mlab(ax, 38, 18, 'Yaoundé', c=RED, fs=22)
    ax.plot([12, 32], [4.5, 15.5], color=RED, lw=3, transform=PC, zorder=39)
    msave(fig, 'equatorial_world_big.png')


def yaounde_climate_big():
    t = [24.0, 24.6, 24.2, 23.9, 23.7, 22.8, 22.0, 22.1, 22.6, 22.9, 23.4, 23.7]; r = [18, 45, 135, 175, 200, 150, 55, 75, 210, 295, 120, 25]
    def note(ax, a2):
        a2.text(5.5, 30.0, 'Hot all year: about 23 °C', fontsize=26, fontweight='bold', color=RED, ha='center')
    climate_graph('yaounde_climate_big.png', t, r, note, tlim=(0, 32), rlim=(0, 340))


def rainforest_layers_big():
    fig, ax = canvas('#E8F5E9')
    ax.add_patch(Rectangle((0, 0), W_, 0.45, color='#6D4C41', zorder=1))
    def tree(x, h, w, c):
        ax.add_patch(Rectangle((x - 0.07, 0.45), 0.14, h - 0.45, color='#5D4037', zorder=2))
        ax.add_patch(Ellipse((x, h), w, w * 0.45, color=c, ec='#1B5E20', lw=1.5, zorder=3))
    for x in (1.2, 5.6): tree(x, 4.35, 1.5, '#388E3C')                       # emergents
    for x in (0.4, 2.4, 3.4, 4.5, 6.7): tree(x, 3.35, 1.2, '#43A047')          # canopy
    for x in (0.9, 2.0, 3.0, 4.1, 5.1, 6.2): tree(x, 2.3, 0.8, '#66BB6A')      # under-canopy
    for x in np.arange(0.3, 7.2, 0.45): ax.add_patch(Ellipse((x, 1.0), 0.45, 0.5, color='#81C784', ec='#2E7D32', lw=1, zorder=4))  # shrubs
    rows = [(4.35, 'EMERGENTS (over 45 m)'), (3.35, 'CANOPY (about 30 m)'), (2.3, 'UNDER-CANOPY (15 m)'), (1.0, 'SHRUB LAYER'), (0.22, 'FOREST FLOOR')]
    for y, t in rows:
        ax.plot([7.3, 7.6], [y, y], color='#1B5E20', lw=3, zorder=5)
        lab(ax, 7.7, y, t, fs=21, c='#1B5E20', ha='left')
    save(fig, 'rainforest_layers_big.png')


if __name__ == '__main__':
    equatorial_world_big(); yaounde_climate_big(); rainforest_layers_big()
