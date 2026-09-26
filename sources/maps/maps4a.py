import json, numpy as np, matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt, matplotlib.patheffects as pe
import cartopy.crs as ccrs
from shapely.geometry import shape, Polygon, MultiPolygon, LineString
from shapely.ops import unary_union
from shapely.affinity import translate
from matplotlib.patches import Patch
from matplotlib.lines import Line2D
from render import load

PC = ccrs.PlateCarree(); W = [pe.withStroke(linewidth=2.5, foreground='white')]
OUT = '/home/claude/f4/img/'
RED = '#990011'
C110 = load('countries110.geojson'); LAND = unary_union([g for n, g in C110 if g.bounds[2] - g.bounds[0] < 300])


def title(ax, x, y, t, fs=14):
    ax.text(x, y, t, fontsize=fs, fontweight='bold', color=RED, transform=PC, zorder=10, path_effects=W)


# ---------- plates ----------
def plates():
    fig = plt.figure(figsize=(12.5, 6.6), dpi=200)
    ax = plt.axes(projection=ccrs.PlateCarree(central_longitude=10)); ax.set_global(); ax.set_facecolor('#DCEBF7')
    ax.add_geometries([LAND], PC, facecolor='#F2EFE6', edgecolor='#999', linewidth=0.3)
    d = json.load(open('pb2002.json'))
    for f in d['features']:
        xs, ys = zip(*f['geometry']['coordinates'])
        sub = f['properties']['Type'] == 'subduction'
        ax.plot(xs, ys, color='#C62828' if sub else '#E65100', lw=1.8 if sub else 1.2, transform=ccrs.Geodetic(), zorder=4)
    names = [(20, 5, 'AFRICAN\nPLATE'), (90, 55, 'EURASIAN PLATE'), (-100, 45, 'NORTH AMERICAN\nPLATE'), (-60, -18, 'SOUTH\nAMERICAN\nPLATE'), (-150, 5, 'PACIFIC PLATE'),
             (130, -25, 'INDO-AUSTRALIAN\nPLATE'), (40, -70, 'ANTARCTIC PLATE'), (-95, -18, 'NAZCA'), (48, 24, 'ARABIAN')]
    for x, y, t in names:
        ax.text(x, y, t, fontsize=9.5, fontweight='bold', ha='center', color='#3A2A00', transform=PC, zorder=6, path_effects=W)
    ax.plot(9.17, 4.2, '^', ms=10, color='#B71C1C', mec='black', transform=PC, zorder=7)
    ax.text(3, 1.2, 'Mount\nCameroon', fontsize=8.5, fontweight='bold', ha='right', transform=PC, zorder=7, path_effects=W)
    ax.legend(handles=[Line2D([], [], color='#C62828', lw=2, label='Destructive (subduction) margins'), Line2D([], [], color='#E65100', lw=1.4, label='Constructive and transform margins')],
              loc='upper center', bbox_to_anchor=(0.5, -0.01), ncol=2, frameon=False, fontsize=11)
    ax.set_title('THE MAIN TECTONIC PLATES AND THEIR MARGINS', fontsize=15, fontweight='bold', color=RED, loc='left')
    plt.savefig(OUT + 'plates_map.png', bbox_inches='tight', pad_inches=0.08, facecolor='white'); plt.close()


# ---------- International Date Line ----------
IDL = [(180, 90), (180, 75), (-169, 68), (-169, 65.5), (-169, 64), (-180, 60), (172.5, 53), (180, 48), (180, 5), (-150, 5), (-150, -11), (-171, -11), (-171, -16), (-172.5, -20), (-172.5, -45), (180, -51), (180, -90)]


def idl():
    fig = plt.figure(figsize=(9.5, 8), dpi=200)
    ax = plt.axes(projection=ccrs.PlateCarree(central_longitude=180)); ax.set_extent([120, 240, -66, 75], crs=PC); ax.set_facecolor('#DCEBF7')
    ax.add_geometries([LAND], PC, facecolor='#F2EFE6', edgecolor='#999', linewidth=0.4)
    xs = [p[0] % 360 for p in IDL]; ys = [p[1] for p in IDL]
    ax.plot(xs, ys, color=RED, lw=3, transform=PC, zorder=5)
    ax.plot([180, 180], [-60, 75], color='#555', lw=1, ls='--', transform=PC, zorder=4)
    ax.text(181, -48, '180°', fontsize=10, fontweight='bold', transform=PC)
    for x, y, t, ha in [(150, 10, 'WEST of the line:\none day AHEAD\n(e.g. Monday)', 'center'), (212, 30, 'EAST of the line:\none day BEHIND\n(e.g. Sunday)', 'center')]:
        ax.text(x, y, t, fontsize=12, fontweight='bold', ha=ha, color='#1C3F6E', transform=PC, zorder=6, path_effects=W)
    for x, y, t in [(135, 35, 'JAPAN'), (133, -25, 'AUSTRALIA'), (174, -40, 'NEW\nZEALAND'), (200, 62, 'ALASKA\n(USA)'), (140, 62, 'RUSSIA'), (183, -14, 'Samoa'), (-150 % 360, 0, 'Kiribati\n(Line Is.)')]:
        ax.text(x, y, t, fontsize=9, fontweight='bold', ha='center', transform=PC, zorder=6, path_effects=W)
    ax.annotate('', xy=(160, -55), xytext=(200, -55), xycoords=PC._as_mpl_transform(ax), arrowprops=dict(arrowstyle='-|>', color='#2E7D32', lw=2.5))
    ax.text(180, -53, 'Crossing westwards: add one day', fontsize=9.5, fontweight='bold', color='#2E7D32', ha='center', transform=PC, path_effects=W)
    ax.annotate('', xy=(200, -60), xytext=(160, -60), xycoords=PC._as_mpl_transform(ax), arrowprops=dict(arrowstyle='-|>', color='#E65100', lw=2.5))
    ax.text(180, -64.5, 'Crossing eastwards: subtract one day', fontsize=9.5, fontweight='bold', color='#E65100', ha='center', transform=PC, path_effects=W)
    ax.set_title('THE INTERNATIONAL DATE LINE (SIMPLIFIED)', fontsize=15, fontweight='bold', color=RED, loc='left')
    plt.savefig(OUT + 'idl_map.png', bbox_inches='tight', pad_inches=0.08, facecolor='white'); plt.close()


# ---------- time zones ----------
def timezones():
    fig = plt.figure(figsize=(13, 6.6), dpi=200)
    ax = plt.axes(projection=PC); ax.set_extent([-180, 180, -58, 78], crs=PC); ax.set_facecolor('#DCEBF7')
    cols = ['#FFF3E0', '#E3F2FD']
    for k in range(-12, 13):
        lo = k * 15 - 7.5; hi = k * 15 + 7.5
        ax.add_patch(plt.Rectangle((max(lo, -180), -58), min(hi, 180) - max(lo, -180), 136, color=cols[k % 2], alpha=0.9, transform=PC, zorder=0))
        if -180 <= k * 15 <= 180:
            ax.text(k * 15, 71, f'{k:+d}' if k else '0', fontsize=8.5, fontweight='bold', ha='center', transform=PC, zorder=6)
    ax.add_geometries([LAND], PC, facecolor='#D7CCC8', edgecolor='#777', linewidth=0.3, alpha=0.85, zorder=2)
    for n, g in C110:
        if n == 'Cameroon': ax.add_geometries([g], PC, facecolor='#C62828', edgecolor='black', linewidth=0.8, zorder=3)
    ax.plot([0, 0], [-58, 68], color='#1C3F6E', lw=1.5, transform=PC, zorder=4)
    ax.text(2, -54, 'Greenwich (0°): GMT', fontsize=9.5, fontweight='bold', transform=PC, zorder=6, path_effects=W)
    ax.text(15, -8, 'Cameroon:\nGMT + 1\n(WAT)', fontsize=10, fontweight='bold', color=RED, transform=PC, zorder=6, path_effects=W)
    ax.text(-178, 62, 'Hours ahead (+) or behind (−) GMT', fontsize=9.5, fontweight='bold', transform=PC, zorder=6)
    ax.set_title('THE 24 STANDARD TIME ZONES (NOMINAL, EACH 15° WIDE)', fontsize=15, fontweight='bold', color=RED, loc='left')
    fig.text(0.99, 0.03, 'Real time-zone boundaries follow countries and regions; this map shows the theoretical 15° zones.', ha='right', fontsize=9, color='#555')
    plt.savefig(OUT + 'time_zones.png', bbox_inches='tight', pad_inches=0.08, facecolor='white'); plt.close()


# ---------- jigsaw fit (Bullard fit rotation of South America) ----------
def rot(lon, lat, plon, plat, ang):
    lon, lat, plon, plat, ang = map(np.radians, (lon, lat, plon, plat, ang))
    v = np.array([np.cos(lat) * np.cos(lon), np.cos(lat) * np.sin(lon), np.sin(lat)])
    k = np.array([np.cos(plat) * np.cos(plon), np.cos(plat) * np.sin(plon), np.sin(plat)])
    vr = v * np.cos(ang) + np.cross(k, v) * np.sin(ang) + k * np.dot(k, v) * (1 - np.cos(ang))
    return np.degrees(np.arctan2(vr[1], vr[0])), np.degrees(np.arcsin(vr[2]))


def rotate_geom(g, plon, plat, ang):
    polys = list(g.geoms) if g.geom_type == 'MultiPolygon' else [g]
    out = []
    for p in polys:
        pts = [rot(x, y, plon, plat, ang) for x, y in p.exterior.coords]
        out.append(Polygon(pts))
    return unary_union(out)


def jigsaw():
    C50 = load('countries50.geojson')
    sa_names = {'Brazil', 'Argentina', 'Uruguay', 'Paraguay', 'Bolivia', 'Peru', 'Chile', 'Ecuador', 'Colombia', 'Venezuela', 'Guyana', 'Suriname'}
    af_ex = {'Madagascar'}
    SA = unary_union([g for n, g in C50 if n in sa_names or n == 'France' and False])
    AF = unary_union([g for n, g in C50 if g.representative_point().x > -20 and g.representative_point().x < 52 and -36 < g.representative_point().y < 37.5
                      and not (g.representative_point().x > 34 and g.representative_point().y > 12.5) and n not in af_ex and g.area > 0.05])
    SAr = rotate_geom(SA, -30.6, 44.0, 57.0)
    fig, axs = plt.subplots(1, 2, figsize=(13, 6.5), dpi=200, subplot_kw={'projection': PC})
    a = axs[0]; a.set_extent([-85, 55, -58, 38], crs=PC); a.set_facecolor('#DCEBF7')
    a.add_geometries([AF], PC, facecolor='#E3B25C', edgecolor='#6B4A10', lw=0.6); a.add_geometries([SA], PC, facecolor='#8BC34A', edgecolor='#33691E', lw=0.6)
    a.text(20, 5, 'AFRICA', fontsize=12, fontweight='bold', ha='center', transform=PC); a.text(-58, -12, 'SOUTH\nAMERICA', fontsize=12, fontweight='bold', ha='center', transform=PC)
    a.text(-25, -5, 'ATLANTIC\nOCEAN', fontsize=10, style='italic', color='#1F5FBF', ha='center', transform=PC)
    a.set_title('TODAY', fontsize=13, fontweight='bold', color=RED)
    b = axs[1]; b.set_extent([-45, 55, -58, 38], crs=PC); b.set_facecolor('#DCEBF7')
    b.add_geometries([AF], PC, facecolor='#E3B25C', edgecolor='#6B4A10', lw=0.6); b.add_geometries([SAr], PC, facecolor='#8BC34A', edgecolor='#33691E', lw=0.6, alpha=0.95)
    b.text(22, 5, 'AFRICA', fontsize=12, fontweight='bold', ha='center', transform=PC); b.text(-20, -20, 'SOUTH\nAMERICA', fontsize=12, fontweight='bold', ha='center', transform=PC)
    b.set_title('ABOUT 200 MILLION YEARS AGO: THE COASTS FIT', fontsize=13, fontweight='bold', color=RED)
    fig.suptitle('EVIDENCE 1: THE JIGSAW FIT OF AFRICA AND SOUTH AMERICA', fontsize=15, fontweight='bold', color=RED, y=0.98)
    fig.text(0.99, 0.02, 'South America rotated back using the classic Bullard (1965) fit; approximate.', ha='right', fontsize=9, color='#555')
    plt.savefig(OUT + 'jigsaw_fit.png', bbox_inches='tight', pad_inches=0.08, facecolor='white'); plt.close()


# ---------- Cameroon Volcanic Line ----------
def cvl():
    fig = plt.figure(figsize=(8, 7.4), dpi=220)
    ax = plt.axes(projection=PC); ax.set_extent([7.6, 15.6, 1.2, 8.6], crs=PC); ax.set_facecolor('#BFDDF2')
    for n, g in load('countries50.geojson'):
        if n in ('Nigeria', 'Eq. Guinea', 'Gabon', 'Congo', 'Central African Rep.', 'Chad'):
            ax.add_geometries([g], PC, facecolor='#E3E3E3', edgecolor='#777', lw=0.6)
        if n == 'Cameroon':
            ax.add_geometries([g], PC, facecolor='#FBF3DC', edgecolor=RED, lw=1.8)
    ax.plot([8.6, 13.9], [3.3, 7.3], color='#E65100', lw=14, alpha=0.18, transform=PC, solid_capstyle='round')
    vols = [('Mount Cameroon (4,040 m)\nactive: 1999, 2000', 9.17, 4.20, 'right'), ('Lake Nyos: gas disaster\n1986 (about 1,700 deaths)', 10.30, 6.44, 'right'),
            ('Lake Monoun: 1984', 10.60, 5.58, 'left'), ('Mount Manengouba', 9.83, 5.03, 'left'), ('Bamboutos Mts', 10.07, 5.63, 'right'), ('Mount Oku', 10.50, 6.20, 'left'),
            ('Bioko Island', 8.75, 3.55, 'right')]
    for t, x, y, ha in vols:
        ax.plot(x, y, '^', ms=11, color='#B71C1C', mec='black', transform=PC, zorder=7)
        ax.text(x + (-0.18 if ha == 'right' else 0.18), y, t, fontsize=9.5, fontweight='bold', ha=ha, va='center', transform=PC, zorder=8, path_effects=W)
    for t, la, lo in [('Douala', 4.05, 9.70), ('Buea', 4.16, 9.24), ('Yaoundé', 3.87, 11.52), ('Bamenda', 5.96, 10.15)]:
        ax.plot(lo, la, 'o', ms=5, color='black', transform=PC, zorder=7)
        ax.text(lo + 0.12, la - 0.18, t, fontsize=9, transform=PC, zorder=8, path_effects=W)
    ax.text(12.3, 6.25, 'CAMEROON VOLCANIC LINE', fontsize=11, fontweight='bold', color='#E65100', rotation=37, ha='center', transform=PC, zorder=8, path_effects=W)
    ax.text(7.75, 8.3, 'VOLCANOES OF CAMEROON', fontsize=13, fontweight='bold', color=RED, transform=PC, zorder=9, path_effects=W)
    ax.text(8.1, 2.2, 'ATLANTIC\nOCEAN', fontsize=10, style='italic', color='#1F5FBF', fontweight='bold', transform=PC)
    plt.savefig(OUT + 'cameroon_volcanic_line.png', bbox_inches='tight', pad_inches=0.08, facecolor='white'); plt.close()


if __name__ == '__main__':
    import sys
    for f in [plates, idl, timezones, jigsaw, cvl]:
        if len(sys.argv) == 1 or f.__name__ in sys.argv: f(); print('done', f.__name__)
