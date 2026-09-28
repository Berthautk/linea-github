"""Big-label diagrams for the revised Form 1 lessons (one element per slide with its picture)."""
import sys
from big_common import *
import cartopy.crs as ccrs


def globe_big():
    fig = plt.figure(figsize=(12.8, 5.6), dpi=150)
    ax = fig.add_axes([0.02, 0.02, 0.5, 0.96], projection=ccrs.Orthographic(15, 10))
    ax.set_global(); ax.add_geometries([land()], PC, facecolor='#A5D6A7', edgecolor='#555', lw=0.6); ax.set_facecolor('#90CAF9')
    ax.gridlines(color='#1565C0', lw=0.8, alpha=0.6)
    t = fig.add_axes([0.55, 0.05, 0.43, 0.9]); t.axis('off')
    t.text(0, 0.85, 'THE GLOBE', fontsize=28, fontweight='bold', color=NAVY)
    t.text(0, 0.62, 'A round model of the Earth', fontsize=20, fontweight='bold', color='#333')
    t.text(0, 0.42, '+ true shapes and sizes', fontsize=19, fontweight='bold', color=GREEN)
    t.text(0, 0.28, '− shows only half the Earth at once', fontsize=19, fontweight='bold', color=RED)
    t.text(0, 0.14, '− few details, not easy to carry', fontsize=19, fontweight='bold', color=RED)
    msave(fig, 'globe_big.png')


def map_projections_big():
    fig = plt.figure(figsize=(12.8, 5.2), dpi=150)
    specs = [(ccrs.Mercator(min_latitude=-75, max_latitude=80), 'Cylindrical (Mercator)', 'shapes kept, sizes wrong\nnear the poles'),
             (ccrs.Mollweide(), 'Equal-area (Mollweide)', 'sizes kept,\nshapes bent at the edges'),
             (ccrs.NorthPolarStereo(), 'Azimuthal (polar)', 'good near the pole,\nwrong far away')]
    for k, (pr, t, d) in enumerate(specs):
        ax = fig.add_axes([0.02 + k * 0.33, 0.22, 0.3, 0.62], projection=pr)
        if k == 2: ax.set_extent([-180, 180, 10, 90], PC)
        else: ax.set_global()
        ax.add_geometries([land()], PC, facecolor='#A5D6A7', edgecolor='#555', lw=0.4); ax.set_facecolor('#BBDEFB'); ax.gridlines(color='#1565C0', lw=0.5, alpha=0.6)
        fig.text(0.17 + k * 0.33, 0.9, t, fontsize=17, fontweight='bold', ha='center', color=NAVY)
        fig.text(0.17 + k * 0.33, 0.04, d, fontsize=15, fontweight='bold', ha='center', color=RED)
    msave(fig, 'map_projections_big.png')


def land_water_big():
    fig = plt.figure(figsize=(12.8, 5.2), dpi=150); ax = fig.add_axes([0.05, 0.05, 0.45, 0.9])
    ax.pie([71, 29], colors=['#42A5F5', '#A1887F'], startangle=90, wedgeprops=dict(ec='white', lw=3),
           labels=['Water\n71 %', 'Land\n29 %'], labeldistance=0.45, textprops=dict(fontsize=24, fontweight='bold', color='white'))
    t = fig.add_axes([0.55, 0.05, 0.43, 0.9]); t.axis('off')
    t.text(0, 0.8, 'THE SURFACE OF THE EARTH', fontsize=22, fontweight='bold', color=NAVY)
    t.text(0, 0.55, 'Water: oceans, seas,\nlakes and rivers', fontsize=19, fontweight='bold', color='#1565C0', va='center')
    t.text(0, 0.3, 'Land: continents\nand islands', fontsize=19, fontweight='bold', color='#5D4037', va='center')
    msave(fig, 'land_water_big.png')


if __name__ == '__main__':
    for n in (sys.argv[1:] or [k for k in dir() if k.endswith('_big')]): globals()[n]()
