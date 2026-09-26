import numpy as np, matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt, matplotlib.patheffects as pe
import cartopy.crs as ccrs
from shapely.geometry import Polygon
from shapely.ops import unary_union
from render import load
PC = ccrs.PlateCarree(); W = [pe.withStroke(linewidth=2.5, foreground='white')]
OUT = '/home/claude/f4/img/'
cs = load('countries110.geojson'); land = unary_union([g for n, g in cs if g.bounds[2]-g.bounds[0] < 300])
SAV = {
 'W. Africa': [(-17,11),(-17,14.5),(-5,14),(5,13.5),(15,12.5),(25,12.5),(33,12),(36,10),(35,6.5),(30,4.8),(25,4.8),(20,4.6),(15,5.5),(10,7),(5,7.8),(2,6.3),(0,8),(-5,7.8),(-10,8.5),(-15,10)],
 'E. Africa': [(33,3.5),(38,3.5),(40.5,-1),(39.5,-5),(38.5,-9),(35,-10),(31.5,-8),(29.5,-5),(30.5,-1.5),(32,1)],
 'S. Africa': [(12,-6),(24,-6.5),(30,-9),(36,-11.5),(40,-15),(36,-19),(33,-24),(30,-25.5),(27,-23),(24,-19),(20,-17.5),(16,-17),(13,-15),(12,-10)],
 'Llanos': [(-73,8.5),(-66,10),(-61,8.5),(-62,6.5),(-67,4.5),(-72,3.5),(-74,5.5)],
 'Campos': [(-58,-6),(-44,-4),(-38.5,-9),(-41,-15),(-44,-20),(-50,-22),(-57,-19),(-60,-13),(-59,-9)],
 'N. Australia': [(121,-16),(129,-13),(136,-11.5),(142,-11),(146,-15),(147,-20),(141,-20.5),(131,-20),(123,-19)],
}
fig = plt.figure(figsize=(12, 6.2), dpi=200)
ax = plt.axes(projection=PC); ax.set_extent([-95, 160, -38, 36], crs=PC); ax.set_facecolor('#CFE6F5')
ax.add_geometries([land], PC, facecolor='#F2EFE6', edgecolor='#999', linewidth=0.4)
for k, pts in SAV.items():
    ax.add_geometries([Polygon(pts).intersection(land)], PC, facecolor='#E3C04B', edgecolor='#8A6A10', linewidth=0.6, zorder=3)
for la, t in [(0, 'Equator (0°)'), (5, '5°N'), (-5, '5°S'), (15, '15°N'), (-15, '15°S')]:
    ax.plot([-95, 160], [la, la], color='#2E6DB4', lw=1.4 if la == 0 else 0.8, ls='-' if la == 0 else '--', transform=PC, zorder=4)
    ax.text(-94, la + 0.6, t, fontsize=10, fontweight='bold', color='#1C3F6E', transform=PC, zorder=6, path_effects=W)
labels = [(-3, 16.5, 'SUDAN SAVANNA\n(West Africa)'), (44, 2, 'EAST AFRICA'), (22, -12, 'SOUTHERN\nAFRICA'), (-80, 10.5, 'LLANOS'), (-50, -12, 'CAMPOS'), (133, -24.5, 'NORTHERN AUSTRALIA')]
for x, y, t in labels:
    ax.text(x, y, t, fontsize=11, fontweight='bold', ha='center', color='#5A4000', transform=PC, zorder=7, path_effects=W)
ax.plot(13.40, 9.30, 'o', ms=8, color='#990011', mec='black', transform=PC, zorder=8)
ax.annotate('Garoua', xy=(13.4, 9.3), xytext=(20, 24), xycoords=PC._as_mpl_transform(ax), fontsize=11, fontweight='bold', color='#990011',
            arrowprops=dict(arrowstyle='-', color='#990011', lw=1.5), path_effects=W, zorder=8)
ax.text(-93, 31, 'THE TROPICAL GRASSLAND (SAVANNA) REGIONS OF THE WORLD', fontsize=15, fontweight='bold', color='#990011', transform=PC, zorder=9, path_effects=W)
from matplotlib.patches import Patch
ax.legend(handles=[Patch(facecolor='#E3C04B', edgecolor='#8A6A10', label='Tropical grassland (approximate extent)')], loc='lower left', fontsize=11, framealpha=0.95)
plt.savefig(OUT + 'savanna_world.png', bbox_inches='tight', pad_inches=0.08, facecolor='white'); plt.close()

# Garoua climate: two panels sharing months (NOAA 1961-1990)
m = ['J','F','M','A','M','J','J','A','S','O','N','D']
t = [26.0,28.9,32.2,33.0,30.7,28.2,26.6,26.4,26.7,28.1,27.3,26.0]
r = [0.0,0.0,2.0,44.1,108.4,134.8,205.3,247.9,190.0,63.3,1.6,0.0]
fig, (a1, a2) = plt.subplots(2, 1, figsize=(9, 7.4), dpi=200, sharex=True, gridspec_kw={'height_ratios': [1, 1.25], 'hspace': 0.12})
x = np.arange(12)
a1.plot(x, t, color='#C0392B', lw=2.5, marker='o', ms=8, mec='white', mew=1.5)
a1.set_ylim(20, 36); a1.set_ylabel('Temperature (°C)', fontsize=12, fontweight='bold')
a1.set_title('GAROUA: MEAN MONTHLY TEMPERATURE AND RAINFALL', fontsize=14, fontweight='bold', color='#990011', loc='left')
a1.annotate('Hottest: 33 °C (April)', xy=(3, 33.0), xytext=(4.6, 34.3), fontsize=11, fontweight='bold', arrowprops=dict(arrowstyle='-', lw=1))
a1.annotate('Coolest: 26 °C (Dec, Jan)', xy=(11, 26.0), xytext=(7.4, 22.2), fontsize=11, fontweight='bold', arrowprops=dict(arrowstyle='-', lw=1))
cols = ['#2E6DB4' if v >= 50 else '#9DB9DD' for v in r]
a2.bar(x, r, color=cols, width=0.7, edgecolor='white', linewidth=2)
for i, v in enumerate(r):
    a2.text(i, v + 4, f'{v:.0f}', ha='center', fontsize=10, color='#333')
a2.set_ylim(0, 300); a2.set_ylabel('Rainfall (mm)', fontsize=12, fontweight='bold')
a2.set_xticks(x); a2.set_xticklabels(m, fontsize=12, fontweight='bold')
a2.axvspan(3.55, 9.45, color='#2E6DB4', alpha=0.07); a2.text(6.5, 282, 'WET SEASON', ha='center', fontsize=12, fontweight='bold', color='#2E6DB4')
a2.text(0.9, 150, 'DRY\nSEASON', ha='center', fontsize=12, fontweight='bold', color='#8A6A10'); a2.text(11, 150, 'DRY\nSEASON', ha='center', fontsize=12, fontweight='bold', color='#8A6A10')
for a in (a1, a2):
    a.spines[['top', 'right']].set_visible(False); a.grid(axis='y', color='#E3E3E3', lw=0.8); a.set_axisbelow(True)
fig.text(0.99, 0.01, 'Annual rainfall: about 1,000 mm. Data: NOAA normals 1961–1990.', ha='right', fontsize=9.5, color='#555')
plt.savefig(OUT + 'garoua_climate.png', bbox_inches='tight', pad_inches=0.12, facecolor='white'); plt.close()
print('ok')
