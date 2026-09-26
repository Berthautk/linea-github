import json
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patheffects as pe
import cartopy.crs as ccrs
from shapely.geometry import shape
from render import load
PC = ccrs.PlateCarree(); W = [pe.withStroke(linewidth=2.5, foreground='white')]
fig = plt.figure(figsize=(9, 6.6), dpi=220)
ax = plt.axes(projection=PC); ax.set_extent([8.3, 16.6, 1.6, 7.3], crs=PC); ax.set_facecolor('#BFDDF2')
for nm, g in load('countries50.geojson'):
    if nm in ('Nigeria', 'Central African Rep.', 'Congo', 'Gabon', 'Eq. Guinea', 'Chad'):
        ax.add_geometries([g], PC, facecolor='#E3E3E3', edgecolor='#777', linewidth=0.7)
d = json.load(open('cmr_adm1.geojson'))
for f in d['features']:
    ax.add_geometries([shape(f['geometry'])], PC, facecolor='#CFE8C2', edgecolor='#6E8B5A', linewidth=0.8)
for nm, g in load('countries50.geojson'):
    if nm == 'Cameroon': ax.add_geometries([g], PC, facecolor='none', edgecolor='#990011', linewidth=2)
for t, x, y in [('SOUTH-WEST', 9.35, 5.6), ('LITTORAL', 10.45, 4.6), ('CENTRE', 12.0, 4.6), ('SOUTH', 11.3, 2.75), ('EAST', 14.2, 4.3), ('WEST', 10.5, 5.4)]:
    ax.text(x, y, t, fontsize=9, style='italic', color='#4A6A3A', fontweight='bold', ha='center', transform=PC)
parks = [('Korup National Park', 8.85, 5.1, 'left'), ('Campo Ma\'an National Park', 10.2, 2.4, 'left'), ('Dja Faunal Reserve\n(UNESCO World Heritage)', 13.0, 3.1, 'right'), ('Lobéké National Park', 15.75, 2.3, 'rightup')]
for nm, x, y, side in parks:
    ax.plot(x, y, '^', ms=16, color='#1B7A2A', mec='black', mew=1, transform=PC, zorder=8)
    yy = y + (0.45 if side == 'rightup' else 0.05); side = 'right' if side == 'rightup' else side
    ax.text(x + (0.3 if side == 'left' else -0.3), yy, nm, fontsize=11, fontweight='bold', ha=side, va='center', transform=PC, zorder=9, path_effects=W)
for nm, la, lo in [('Douala', 4.05, 9.70), ('Yaoundé', 3.87, 11.52), ('Bertoua', 4.58, 13.68)]:
    ax.plot(lo, la, 'o', ms=6, color='#C00000', mec='black', transform=PC, zorder=8)
    ax.text(lo + 0.12, la + 0.12, nm, fontsize=10, fontweight='bold', transform=PC, zorder=9, path_effects=W)
for t, x, y in [('NIGERIA', 8.9, 6.45), ('C.A.R.', 15.9, 5.4), ('CONGO', 15.2, 1.85), ('GABON', 11.6, 1.8), ('EQ. GUINEA', 10.0, 1.8)]:
    ax.text(x, y, t, fontsize=10, color='#555', fontweight='bold', ha='center', transform=PC)
ax.text(8.45, 2.8, 'ATLANTIC\nOCEAN', fontsize=9, style='italic', color='#2E6DB4', fontweight='bold', transform=PC)
ax.text(8.45, 7.0, 'SOME PROTECTED AREAS IN THE FOREST ZONE OF CAMEROON', fontsize=12.5, fontweight='bold', color='#990011', transform=PC, zorder=9, path_effects=W)
ax.plot(16.2, 6.85, '^', ms=12, color='#1B7A2A', mec='black', transform=PC); ax.text(16.0, 6.85, 'Protected area', fontsize=9.5, ha='right', va='center', fontweight='bold', transform=PC, path_effects=W)
plt.savefig('/home/claude/f2t/img_parks.png', bbox_inches='tight', pad_inches=0.08, facecolor='white'); print('ok')
