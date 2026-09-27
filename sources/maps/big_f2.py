"""Big-label diagrams for Form 2 (2023 syllabus)."""
from big_common import *
import json
from shapely.geometry import shape

HQ = {'Centre': ('Yaoundé', 11.52, 3.87), 'Far North': ('Maroua', 14.32, 10.59), 'North': ('Garoua', 13.40, 9.30), 'North-West': ('Bamenda', 10.15, 5.96),
      'Adamaoua': ('Ngaoundéré', 13.58, 7.32), 'East': ('Bertoua', 13.68, 4.58), 'South': ('Ebolowa', 11.15, 2.90), 'South-West': ('Buea', 9.24, 4.16),
      'West': ('Bafoussam', 10.42, 5.48), 'Littoral': ('Douala', 9.70, 4.05)}
COL = ['#FFE082', '#FFCC80', '#C5E1A5', '#80CBC4', '#B39DDB', '#F48FB1', '#A5D6A7', '#90CAF9', '#FFAB91', '#E6EE9C']


def cmr_regions_big():
    g = json.load(open('/home/claude/maps/cmr_adm1.geojson'))
    ext = (7.8, 17.2, 1.6, 13.2); fig, ax = map_axes(ext, (12.8, 7.0)); ax.set_position([0, 0, 0.62, 1])
    for i, f in enumerate(g['features']):
        ax.add_geometries([shape(f['geometry'])], PC, facecolor=COL[i % 10], edgecolor='#333', lw=1.2, zorder=3)
        n = f['properties']['shapeName']; t, x, y = HQ[n]
        ax.plot(x, y, '*', ms=16, color=RED, mec='black', transform=PC, zorder=10)
    leg = fig.add_axes([0.62, 0.02, 0.37, 0.96]); leg.axis('off')
    for k, (n, (t, x, y)) in enumerate(HQ.items()):
        leg.text(0.02, 0.95 - k * 0.095, f'{n}: {t}', fontsize=19, fontweight='bold', color=NAVY, transform=leg.transAxes, va='top')
    msave(fig, 'cmr_regions_big.png')


if __name__ == '__main__':
    cmr_regions_big(); print('done')
