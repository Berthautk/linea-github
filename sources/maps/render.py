import json
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patheffects as pe
import cartopy.crs as ccrs
from shapely.geometry import shape, box
from shapely.ops import unary_union

PAL = ['#F6D98B', '#B9D98C', '#F4B183', '#C6B3E0', '#9FD3D6', '#F2A7B8', '#E8C9A0']
OCEAN = '#CFE6F5'
RENAME = {'Central African Rep.': 'C.A.R.', 'Dem. Rep. Congo': 'D.R. CONGO', 'S. Sudan': 'SOUTH SUDAN',
          'W. Sahara': 'WESTERN\nSAHARA', 'Eq. Guinea': '', "Côte d'Ivoire": "CÔTE\nD'IVOIRE", 'South Africa': 'SOUTH\nAFRICA',
          'Burkina Faso': 'BURKINA\nFASO', 'Mauritania': 'MAURITANIA'}


def _fix(geom):
    from shapely.geometry import Polygon, MultiPolygon
    from shapely.affinity import translate
    polys = list(geom.geoms) if geom.geom_type == 'MultiPolygon' else [geom]
    out = []
    for p in polys:
        if p.bounds[2] - p.bounds[0] > 180:
            ext = [((x + 360) if x < 0 else x, y) for x, y in p.exterior.coords]
            q = Polygon(ext).buffer(0)
            out.append(q.intersection(box(-180, -90, 180, 90)))
            out.append(translate(q.intersection(box(180, -90, 540, 90)), -360))
        else:
            out.append(p.buffer(0))
    return unary_union([o for o in out if not o.is_empty])


def load(path):
    d = json.load(open(path))
    out = []
    for f in d['features']:
        nm = f['properties']['name']
        if nm == 'Antarctica':
            continue
        try:
            g = _fix(shape(f['geometry']))
        except Exception:
            continue
        out.append((nm, g))
    return out


def colour(countries):
    cols = {}
    for i, (nm, g) in enumerate(countries):
        used = set()
        gb = g.buffer(0.05)
        for j in range(i):
            nm2, g2 = countries[j]
            if gb.bounds[0] > g2.bounds[2] or gb.bounds[2] < g2.bounds[0] or gb.bounds[1] > g2.bounds[3] or gb.bounds[3] < g2.bounds[1]:
                continue
            if gb.intersects(g2):
                used.add(cols[nm2])
        cols[nm] = next(c for c in PAL if c not in used)
    return cols


# ---------------- Africa latitude / longitude map ----------------
def africa():
    allc = load('countries50.geojson')
    ext = box(-26, -38, 56, 41)
    cs = [(n, g) for n, g in allc if g.intersects(ext) and (g.bounds[2]-g.bounds[0]) < 150]
    cols = colour(cs)
    fig = plt.figure(figsize=(8, 8), dpi=220)
    ax = plt.axes(projection=ccrs.PlateCarree())
    ax.set_extent([-25, 55, -37, 40], crs=ccrs.PlateCarree())
    ax.set_facecolor(OCEAN)
    africa_names = {'Cameroon', 'Ghana', 'Nigeria', 'Chad', 'Niger', 'Mali', 'Algeria', 'Libya', 'Egypt', 'Sudan', 'Ethiopia', 'Kenya',
                    'Tanzania', 'Angola', 'Namibia', 'South Africa', 'Madagascar', 'Mauritania', 'Morocco', 'Dem. Rep. Congo',
                    'Central African Rep.', 'Gabon', 'Congo', 'Zambia', 'Mozambique', 'Somalia', 'S. Sudan', 'Botswana',
                    'Zimbabwe', 'Burkina Faso', 'Tunisia', 'W. Sahara', 'Uganda', "Côte d'Ivoire", 'Guinea', 'Senegal'}
    for nm, g in cs:
        fc = cols[nm]
        if nm == 'Cameroon':
            fc = '#E0392B'
        elif nm == 'Ghana':
            fc = '#F2B01E'
        inAf = g.representative_point().x > -20 and g.representative_point().y < 38 and not (g.representative_point().x > 34 and g.representative_point().y > 12)
        if not inAf and nm not in africa_names:
            fc = '#E6E6E6'
        ax.add_geometries([g], ccrs.PlateCarree(), facecolor=fc, edgecolor='#555555', linewidth=0.5)
    # grid every 10°
    for lo in range(-20, 60, 10):
        ax.plot([lo, lo], [-37, 40], color='#2E6DB4', lw=1.4 if lo == 0 else 0.7, transform=ccrs.PlateCarree(), zorder=3)
    for la in range(-30, 50, 10):
        ax.plot([-25, 55], [la, la], color='#2E6DB4', lw=1.4 if la == 0 else 0.7, transform=ccrs.PlateCarree(), zorder=3)
    # labels on frame
    for lo in range(-20, 60, 10):
        t = '0°' if lo == 0 else (f'{abs(lo)}°W' if lo < 0 else f'{lo}°E')
        for yy, va in [(-37, 'top'), (40, 'bottom')]:
            ax.text(lo, yy + (-0.6 if va == 'top' else 0.6), t, ha='center', va=va, fontsize=10, fontweight='bold', color='#1C3F6E', transform=ccrs.PlateCarree(), clip_on=False)
    for la in range(-30, 50, 10):
        t = '0°' if la == 0 else (f'{abs(la)}°S' if la < 0 else f'{la}°N')
        ax.text(-25.8, la, t, ha='right', va='center', fontsize=10, fontweight='bold', color='#1C3F6E', transform=ccrs.PlateCarree(), clip_on=False)
        ax.text(55.8, la, t, ha='left', va='center', fontsize=10, fontweight='bold', color='#1C3F6E', transform=ccrs.PlateCarree(), clip_on=False)
    # minor ticks every 2°
    for lo in range(-24, 56, 2):
        if lo % 10:
            ax.plot([lo, lo], [-37, -36.2], color='#1C3F6E', lw=0.8, transform=ccrs.PlateCarree(), zorder=4)
            ax.plot([lo, lo], [39.2, 40], color='#1C3F6E', lw=0.8, transform=ccrs.PlateCarree(), zorder=4)
    for la in range(-36, 40, 2):
        if la % 10:
            ax.plot([-25, -24.2], [la, la], color='#1C3F6E', lw=0.8, transform=ccrs.PlateCarree(), zorder=4)
            ax.plot([54.2, 55], [la, la], color='#1C3F6E', lw=0.8, transform=ccrs.PlateCarree(), zorder=4)
    ax.text(-10.5, 0.8, 'Equator', fontsize=9, style='italic', color='#2E6DB4', fontweight='bold', transform=ccrs.PlateCarree(), zorder=5)
    ax.text(0.6, -27, 'Greenwich\nMeridian', fontsize=9, style='italic', color='#2E6DB4', fontweight='bold', transform=ccrs.PlateCarree(), zorder=5)
    # country names
    manual = {'Cameroon': (17.2, 3.0), 'Ghana': (-1.0, 3.3), 'Nigeria': (8.0, 9.8), 'Morocco': (-6.5, 31.8), 'Congo': (16.3, 1.2),
              'Gabon': (13.4, -1.5), 'Burkina Faso': (-1.6, 12.4), "Côte d'Ivoire": (-6.6, 7.0), 'Senegal': (-14.5, 14.6),
              'Guinea': (-10.8, 10.6), 'Tunisia': (9.5, 34.0), 'Uganda': (32.3, 1.4), 'Somalia': (45.5, 5.0),
              'Mozambique': (37.0, -15.0), 'Zimbabwe': (29.8, -19.0), 'Botswana': (24.0, -22.5), 'Eritrea': (38.5, 15.5)}
    for nm, g in cs:
        if nm not in africa_names:
            continue
        lbl = RENAME.get(nm, nm.upper())
        if not lbl:
            continue
        x, y = manual.get(nm, (g.representative_point().x, g.representative_point().y))
        big = g.area > 60
        fs = 9 if big else 6.5
        if nm in ('Cameroon', 'Ghana'):
            fs = 8.5
        if nm in ('Gabon', 'Congo', "Côte d'Ivoire"):
            fs = 6
        ax.text(x, y, lbl.upper() if '\n' not in lbl else lbl, ha='center', va='center', fontsize=fs, fontweight='bold',
                color='#1A1A1A', transform=ccrs.PlateCarree(), zorder=6,
                path_effects=[pe.withStroke(linewidth=2, foreground='white')])
    for x, y, t in [(-17, -20, 'ATLANTIC\nOCEAN'), (46, -28, 'INDIAN\nOCEAN'), (24, 34.6, 'MEDITERRANEAN SEA')]:
        ax.text(x, y, t, ha='center', va='center', fontsize=10, style='italic', color='#2E6DB4', fontweight='bold', transform=ccrs.PlateCarree(), zorder=5)
    # arrows and points: Cameroon (12°E, 6°N), Ghana (2°W, 8°N)
    for (px, py), (sx, sy) in [((12, 6), (10, -13)), ((-2, 8), (-14, -6))]:
        ax.annotate('', xy=(px, py), xytext=(sx, sy), xycoords=ccrs.PlateCarree()._as_mpl_transform(ax),
                    arrowprops=dict(arrowstyle='-|>', color='#C00000', lw=3, mutation_scale=22), zorder=8)
        ax.plot(px, py, 'o', ms=6, color='black', transform=ccrs.PlateCarree(), zorder=9)
    ax.text(-24, 38.2, 'AFRICA — LATITUDE AND LONGITUDE MAP', fontsize=12, fontweight='bold', color='#990011', transform=ccrs.PlateCarree(), zorder=7,
            path_effects=[pe.withStroke(linewidth=3, foreground='white')])
    # north arrow
    ax.annotate('N', xy=(51.5, 36), xytext=(51.5, 29), xycoords=ccrs.PlateCarree()._as_mpl_transform(ax), ha='center', fontsize=12, fontweight='bold',
                arrowprops=dict(arrowstyle='-|>', color='black', lw=2), zorder=8)
    ax.spines['geo'].set_linewidth(1.5)
    plt.savefig('africa_latlon.png', bbox_inches='tight', pad_inches=0.15, facecolor='white')
    plt.close()


# ---------------- Globe (image A) ----------------
def globe():
    cs = load('countries110.geojson')
    land = unary_union([g for _, g in cs if g.bounds[2]-g.bounds[0] < 300])
    fig = plt.figure(figsize=(6, 6), dpi=220)
    ax = plt.axes(projection=ccrs.Orthographic(central_longitude=15, central_latitude=12))
    ax.set_global()
    ax.set_facecolor('#3F86C6')
    ax.add_geometries([land], ccrs.PlateCarree(), facecolor='#6FAE4F', edgecolor='#3C6E2A', linewidth=0.4)
    # Sahara & Arabian desert tint
    ax.gridlines(color='white', alpha=0.45, linewidth=0.6, xlocs=range(-180, 181, 30), ylocs=range(-90, 91, 30))
    ax.spines['geo'].set_edgecolor('#1C3F6E'); ax.spines['geo'].set_linewidth(2.5)
    plt.savefig('globe.png', bbox_inches='tight', pad_inches=0.05, facecolor='white')
    plt.close()


# ---------------- World map, Mercator (image B) ----------------
def worldmap():
    cs = [(n, g) for n, g in load('countries110.geojson') if n != 'Antarctica']
    cols = colour(cs)
    fig = plt.figure(figsize=(10, 7.2), dpi=200)
    ax = plt.axes(projection=ccrs.Mercator(min_latitude=-58, max_latitude=82))
    ax.set_global()
    ax.set_facecolor(OCEAN)
    for nm, g in cs:
        ax.add_geometries([g], ccrs.PlateCarree(), facecolor=cols[nm], edgecolor='#666666', linewidth=0.3)
    lab = [(-100, 45, 'NORTH\nAMERICA', 12), (-60, -12, 'SOUTH\nAMERICA', 12), (20, 5, 'AFRICA', 13), (15, 52, 'EUROPE', 11),
           (90, 50, 'ASIA', 14), (134, -25, 'AUSTRALIA', 11), (-41, 74, 'GREENLAND', 11)]
    for x, y, t, fs in lab:
        ax.text(x, y, t, ha='center', va='center', fontsize=fs, fontweight='bold', color='#1A1A1A', transform=ccrs.PlateCarree(),
                path_effects=[pe.withStroke(linewidth=2.5, foreground='white')])
    for x, y, t in [(-35, 25, 'ATLANTIC\nOCEAN'), (-145, 5, 'PACIFIC\nOCEAN'), (160, 5, 'PACIFIC\nOCEAN'), (78, -25, 'INDIAN\nOCEAN')]:
        ax.text(x, y, t, ha='center', va='center', fontsize=11, style='italic', fontweight='bold', color='#2E6DB4', transform=ccrs.PlateCarree())
    ax.spines['geo'].set_linewidth(1.5)
    plt.savefig('worldmap_mercator.png', bbox_inches='tight', pad_inches=0.08, facecolor='white')
    plt.close()


if __name__ == "__main__":
    africa(); globe(); worldmap()
print('done')
