import json
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patheffects as pe
import cartopy.crs as ccrs
from shapely.geometry import shape
from render import load

PC = ccrs.PlateCarree()
W = [pe.withStroke(linewidth=2.2, foreground='white')]
REG_COL = {'Far North': '#F6E7B0', 'North': '#FBEFC6', 'Adamaoua': '#F3DFA2', 'East': '#FBEFC6', 'Centre': '#F6E7B0',
           'South': '#F3DFA2', 'Littoral': '#FBEFC6', 'West': '#F3DFA2', 'North-West': '#F6E7B0', 'South-West': '#F3DFA2'}
REG_LBL = {'Far North': ('FAR NORTH', 14.5, 11.0), 'North': ('NORTH', 14.3, 8.35), 'Adamaoua': ('ADAMAWA', 12.6, 6.75),
           'East': ('EAST', 14.9, 3.3), 'Centre': ('CENTRE', 12.3, 4.75), 'South': ('SOUTH', 11.6, 2.55),
           'Littoral': ('LITTORAL', 10.25, 3.65), 'West': ('WEST', 10.55, 5.35), 'North-West': ('NORTH-\nWEST', 10.6, 6.55),
           'South-West': ('SOUTH-\nWEST', 9.25, 5.1)}
TOWNS = [('Kousseri', 12.08, 15.03, 'r'), ('Maroua', 10.59, 14.32, 'r'), ('Garoua', 9.30, 13.40, 'r'), ('Ngaoundéré', 7.32, 13.58, 'r'),
         ('Bamenda', 5.96, 10.15, 'r'), ('Bertoua', 4.58, 13.68, 'r'), ('Douala', 4.05, 9.70, 'l'), ('Yaoundé', 3.87, 11.52, 'r')]


def draw(fname, towns=True):
    fig = plt.figure(figsize=(6.2, 8), dpi=230)
    ax = plt.axes(projection=PC)
    ax.set_extent([8, 17, 1.5, 13.3], crs=PC)
    ax.set_facecolor('#BFDDF2')
    for nm, g in load('countries50.geojson'):
        if nm in ('Nigeria', 'Chad', 'Central African Rep.', 'Congo', 'Gabon', 'Eq. Guinea', 'Niger'):
            ax.add_geometries([g], PC, facecolor='#E3E3E3', edgecolor='#777777', linewidth=0.7)
    d = json.load(open('cmr_adm1.geojson'))
    for f in d['features']:
        nm = f['properties']['shapeName']
        ax.add_geometries([shape(f['geometry'])], PC, facecolor=REG_COL[nm], edgecolor='#8A7A4A', linewidth=0.8)
    for nm, g in load('countries50.geojson'):
        if nm == 'Cameroon':
            ax.add_geometries([g], PC, facecolor='none', edgecolor='#990011', linewidth=2.0)
    for nm, (t, x, y) in REG_LBL.items():
        ax.text(x, y, t, ha='center', va='center', fontsize=7.5, style='italic', color='#7A6A3A', fontweight='bold', transform=PC, zorder=5)
    for t, x, y in [('NIGERIA', 10.0, 9.6), ('CHAD', 16.2, 10.0), ('C.A.R.', 16.4, 6.2), ('CONGO', 15.8, 1.85), ('GABON', 11.3, 1.75),
                    ('EQ. GUINEA', 9.9, 1.75), ('NIGER', 12.4, 13.0)]:
        ax.text(x, y, t, ha='center', va='center', fontsize=9, color='#555555', fontweight='bold', transform=PC, zorder=5)
    ax.text(8.9, 2.9, 'ATLANTIC\nOCEAN', ha='center', fontsize=8.5, style='italic', color='#2E6DB4', fontweight='bold', transform=PC)
    # grid every 1°
    for lo in range(8, 18):
        ax.plot([lo, lo], [1.5, 13.3], color='#2E6DB4', lw=0.6, alpha=0.8, transform=PC, zorder=4)
        ax.text(lo, 1.35, f'{lo}°E', ha='center', va='top', fontsize=9, fontweight='bold', color='#1C3F6E', transform=PC, clip_on=False)
        ax.text(lo, 13.45, f'{lo}°E', ha='center', va='bottom', fontsize=9, fontweight='bold', color='#1C3F6E', transform=PC, clip_on=False)
    for la in range(2, 14):
        ax.plot([8, 17], [la, la], color='#2E6DB4', lw=0.6, alpha=0.8, transform=PC, zorder=4)
        ax.text(7.85, la, f'{la}°N', ha='right', va='center', fontsize=9, fontweight='bold', color='#1C3F6E', transform=PC, clip_on=False)
        ax.text(17.15, la, f'{la}°N', ha='left', va='center', fontsize=9, fontweight='bold', color='#1C3F6E', transform=PC, clip_on=False)
    if towns:
        for nm, la, lo, side in TOWNS:
            cap = nm == 'Yaoundé'
            ax.plot(lo, la, 's' if cap else 'o', ms=7 if cap else 6, color='#C00000', mec='black', mew=0.8, transform=PC, zorder=8)
            dx = 0.18 if side == 'r' else -0.18
            ax.text(lo + dx, la + 0.02, nm + (' (capital)' if cap else ''), ha='left' if side == 'r' else 'right', va='center', fontsize=10,
                    fontweight='bold', color='#111111', transform=PC, zorder=9, path_effects=W)
    ax.text(8.15, 13.0, 'CAMEROON', fontsize=13, fontweight='bold', color='#990011', transform=PC, zorder=9, path_effects=W)
    ax.text(8.15, 12.55, 'Latitude & longitude map', fontsize=9, style='italic', color='#990011', transform=PC, zorder=9, path_effects=W)
    ax.text(16.45, 9.45, 'N', ha='center', va='bottom', fontsize=11, fontweight='bold', transform=PC, zorder=9)
    ax.annotate('', xy=(16.45, 9.35), xytext=(16.45, 8.4), xycoords=PC._as_mpl_transform(ax), ha='center', fontsize=11, fontweight='bold',
                arrowprops=dict(arrowstyle='-|>', color='black', lw=1.8), zorder=9)
    ax.spines['geo'].set_linewidth(1.5)
    plt.savefig(fname, bbox_inches='tight', pad_inches=0.12, facecolor='white')
    plt.close()


draw('cameroon_latlon.png')
print('ok')
