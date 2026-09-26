import json, matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt, matplotlib.patheffects as pe
import cartopy.crs as ccrs
from shapely.geometry import shape, Polygon
from matplotlib.patches import Patch
from render import load
from images2 import rivers
PC = ccrs.PlateCarree(); W = [pe.withStroke(linewidth=2.5, foreground='white')]
fig = plt.figure(figsize=(6.6, 8), dpi=220)
ax = plt.axes(projection=PC); ax.set_extent([8.3, 16.4, 5.5, 13.2], crs=PC); ax.set_facecolor('#BFDDF2')
cmr = None
for nm, g in load('countries50.geojson'):
    if nm in ('Nigeria', 'Chad', 'Central African Rep.', 'Niger'):
        ax.add_geometries([g], PC, facecolor='#E3E3E3', edgecolor='#777', linewidth=0.7)
    if nm == 'Cameroon': cmr = g
d = json.load(open('cmr_adm1.geojson'))
for f in d['features']:
    ax.add_geometries([shape(f['geometry'])], PC, facecolor='#FBF3DC', edgecolor='#A08A5A', linewidth=0.7)
desert = Polygon([(13.6, 10.2), (15.7, 10.0), (15.2, 13.1), (14.0, 13.1), (13.8, 11.5)]).intersection(cmr)
ax.add_geometries([desert], PC, facecolor='#E3A857', edgecolor='none', alpha=0.75, zorder=3)
from shapely.geometry import shape as shp, box as bx
from shapely.ops import unary_union as uu
rv = json.load(open('ne_50m_rivers_lake_centerlines.geojson'))
lines = []
for f in rv['features']:
    nm = f['properties'].get('name') or ''
    g = shp(f['geometry'])
    if nm in ('Benue', 'Bénoué'): lines.append(g.intersection(bx(12.4, 8.95, 13.75, 9.6)))
    if nm in ('Logone', 'Chari'): lines.append(g.intersection(bx(14.5, 10.0, 15.6, 12.3)))
flood = [uu([l for l in lines if not l.is_empty]).buffer(0.12)]
for p in flood: ax.add_geometries([p.intersection(cmr)], PC, facecolor='#1F5FBF', edgecolor='none', alpha=0.55, zorder=4)
rivers(ax, {'Benue': 2.2, 'Bénoué': 2.2, 'Logone': 2.0, 'Chari': 2.0})
ax.add_geometries([cmr], PC, facecolor='none', edgecolor='#990011', linewidth=2, zorder=6)
for nm, la, lo in [('Garoua', 9.30, 13.40), ('Maroua', 10.59, 14.32), ('Kousseri', 12.08, 15.03), ('Yagoua', 10.34, 15.23), ('Ngaoundéré', 7.32, 13.58)]:
    ax.plot(lo, la, 'o', ms=6, color='#C00000', mec='black', transform=PC, zorder=8)
    ax.text(lo + (0.15 if nm in ('Garoua','Maroua') else -0.12), la + (0.12 if nm not in ('Garoua','Yagoua') else 0.2 if nm=='Garoua' else -0.35), nm, fontsize=10, fontweight='bold', ha='left' if nm in ('Garoua','Maroua') else 'right', transform=PC, zorder=9, path_effects=W)
ax.plot(13.6, 9.07, 's', ms=8, color='#0D47A1', mec='white', transform=PC, zorder=8); ax.text(13.75, 8.8, 'Lagdo dam', fontsize=9.5, fontweight='bold', transform=PC, zorder=9, path_effects=W)
ax.text(11.4, 9.35, 'R. Benue', fontsize=9.5, color='#0B3D91', fontweight='bold', transform=PC, zorder=9, path_effects=W)
ax.text(15.35, 11.4, 'R. Logone', fontsize=9.5, color='#0B3D91', fontweight='bold', transform=PC, zorder=9, path_effects=W)
ax.text(8.45, 12.9, 'HYDRO-CLIMATIC HAZARDS\nIN NORTHERN CAMEROON', fontsize=12, fontweight='bold', color='#990011', transform=PC, zorder=9, path_effects=W)
ax.legend(handles=[Patch(facecolor='#1F5FBF', alpha=0.55, label='Areas often flooded (approx.)'), Patch(facecolor='#E3A857', alpha=0.75, label='Drought and desertification risk (approx.)')],
          loc='lower left', fontsize=9, framealpha=0.95)
plt.savefig('/home/claude/f4/img/cmr_hazards.png', bbox_inches='tight', pad_inches=0.08, facecolor='white'); print('ok')
