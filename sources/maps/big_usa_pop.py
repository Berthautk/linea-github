"""Big-label diagrams for Upper Sixth Population Geography (Module 4). Values marked approximate are rounded for teaching."""
import sys
from big_common import *
SKY = '#DDEFFB'


def box_(ax, x, y, w, h, t, c, fs=19, tc='white'):
    ax.add_patch(FancyBboxPatch((x, y), w, h, boxstyle='round,pad=0.05', fc=c, ec='white', lw=2, zorder=5))
    ax.text(x + w / 2, y + h / 2, t, fontsize=fs, fontweight='bold', ha='center', va='center', color=tc, zorder=6)


def table_big(name, head, rows, colw=None, fs=20, note=None, hc=NAVY):
    fig, ax = canvas('white'); n = len(head); colw = colw or [12.0 / n] * n; y = 4.75; rh = min(0.62, 4.1 / (len(rows) + 1)); x = 0.4
    for w, h in zip(colw, head):
        ax.add_patch(Rectangle((x, y - rh), w, rh, color=hc)); ax.text(x + w / 2, y - rh / 2, h, fontsize=fs - 3, fontweight='bold', ha='center', va='center', color='white'); x += w
    for k, r in enumerate(rows):
        x = 0.4; yy = y - rh * (k + 2)
        for w, c in zip(colw, r):
            ax.add_patch(Rectangle((x, yy), w, rh, color='#E3F2FD' if k % 2 == 0 else 'white', ec='#90A4AE', lw=1)); ax.text(x + w / 2, yy + rh / 2, str(c), fontsize=fs, fontweight='bold', ha='center', va='center', color='#222'); x += w
    if note: ax.text(6.4, 0.2, note, fontsize=16, fontweight='bold', ha='center', color=RED)
    save(fig, name)


def regions():
    d = json.load(open('/home/claude/maps/cmr_adm1.geojson'))
    return {f['properties']['shapeName']: shape(f['geometry']).buffer(0) for f in d['features']}


DENS = {'Littoral': 190, 'West': 150, 'Far North': 130, 'North-West': 125, 'South-West': 70, 'Centre': 67, 'North': 42, 'Adamaoua': 20, 'South': 17, 'East': 11}


def cm_base():
    fig = plt.figure(figsize=(12.8, 6.4), dpi=150); ax = plt.axes([0, 0, 1, 1], projection=PC); ax.set_extent([4, 26, 1.5, 13.3], crs=PC)
    ax.set_facecolor('#CFE6F5'); ax.add_geometries([land()], PC, facecolor='#F2EFE6', edgecolor='#888', lw=0.6)
    return fig, ax


# ---------- DATA AND DISTRIBUTION ----------
def data_sources_big():
    fig, ax = canvas('white')
    for k, (t, c, s) in enumerate([('CENSUS', NAVY, 'count of every person,\nevery 10 years'), ('SAMPLE SURVEY', GREEN, 'questions to a part\nof the population'),
                                    ('VITAL REGISTRATION', ORANGE, 'births, deaths,\nmarriages recorded'), ('MIGRATION RECORDS', RED, 'passports, visas,\nborder counts')]):
        x = 0.3 + (k % 2) * 6.3; y = 2.6 - (k // 2) * 2.3; box_(ax, x, y + 1.1, 6.0, 0.9, t, c, fs=23); ax.text(x + 3.0, y + 0.45, s, fontsize=18, fontweight='bold', ha='center', va='center', color=c)
    save(fig, 'data_sources_big.png')


def world_pop_big():
    fig, ax = chart(); r = ['Asia', 'Africa', 'Europe', 'Latin\nAmerica', 'North\nAmerica', 'Oceania']; v = [4.8, 1.5, 0.74, 0.66, 0.38, 0.045]
    ax.bar(range(6), v, color=['#E65100', '#2E7D32', '#1565C0', '#8E24AA', '#00838F', '#6D4C41'], width=0.65)
    for i, x in enumerate(v): ax.text(i, x + 0.08, f'{x:g}', fontsize=20, fontweight='bold', ha='center')
    ax.set_xticks(range(6)); ax.set_xticklabels(r, fontsize=19, fontweight='bold'); ax.set_ylabel('Billions of people', fontsize=22, fontweight='bold'); ax.set_ylim(0, 5.5)
    ax.text(5.4, 5.0, 'World: about 8.1 billion\n(2024, approximate)', fontsize=18, fontweight='bold', ha='right', color=NAVY)
    fig.subplots_adjust(bottom=0.2); fig.savefig(OUT + 'world_pop_big.png', dpi=150, facecolor='white'); plt.close(fig)


def density_types_big():
    table_big('density_types_big.png', ['Type of density', 'Formula', 'Shows'],
              [['Arithmetic (crude)', 'people ÷ total area', 'general crowding'], ['Physiological', 'people ÷ farmland area', 'pressure on farmland'], ['Agricultural', 'farmers ÷ farmland area', 'farmer pressure on land']],
              colw=[3.6, 4.4, 4.0], fs=19, note='Cameroon: about 28 million ÷ 475,000 km² ≈ 59 people per km²')


def choropleth_big():
    R = regions(); fig, ax = cm_base()
    bins = [(0, 20, '#FFF3E0'), (20, 50, '#FFCC80'), (50, 100, '#FB8C00'), (100, 999, '#BF360C')]
    for n, g in R.items():
        d = DENS[n]; c = [b[2] for b in bins if b[0] <= d < b[1]][0]; ax.add_geometries([g], PC, facecolor=c, edgecolor='#333', lw=1.2)
        p = g.representative_point(); ax.text(p.x, p.y, str(d), fontsize=14, fontweight='bold', ha='center', va='center', transform=PC, color='white' if d >= 50 else '#333', zorder=20)
    for i, (a, b, c) in enumerate(bins):
        ax.text(0.6, 0.85 - i * 0.09, '■', transform=ax.transAxes, fontsize=26, color=c, va='center'); ax.text(0.635, 0.85 - i * 0.09, f'{a}–{b} per km²' if b < 999 else 'over 100 per km²', transform=ax.transAxes, fontsize=18, fontweight='bold', va='center', color=NAVY)
    ax.text(0.6, 0.36, 'Choropleth map:\ndensity by region\n(approximate)', transform=ax.transAxes, fontsize=17, fontweight='bold', color='#333')
    msave(fig, 'choropleth_big.png')


def dot_map_big():
    R = regions(); fig, ax = cm_base(); rng = np.random.default_rng(4)
    for n, g in R.items():
        ax.add_geometries([g], PC, facecolor='#FAFAFA', edgecolor='#999', lw=1)
        k = int(g.area * DENS[n] / 3.5); minx, miny, maxx, maxy = g.bounds; placed = 0
        while placed < k:
            x, y = rng.uniform(minx, maxx), rng.uniform(miny, maxy)
            if g.contains(shape({'type': 'Point', 'coordinates': (x, y)})): ax.plot(x, y, 'o', ms=3, color='#B71C1C', transform=PC); placed += 1
    ax.text(0.6, 0.8, 'Dot map:\n1 dot = a fixed\nnumber of people', transform=ax.transAxes, fontsize=20, fontweight='bold', color=NAVY)
    ax.text(0.6, 0.55, 'Dense: West, Littoral,\nFar North\nSparse: East, South', transform=ax.transAxes, fontsize=17, fontweight='bold', color='#B71C1C')
    msave(fig, 'dot_map_big.png')


def lorenz_big():
    fig, ax = chart((12.8, 5.8)); x = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]; y = [0, 1, 3, 6, 10, 15, 22, 31, 43, 62, 100]
    ax.plot([0, 100], [0, 100], color=GREEN, lw=4, ls='--', label='Line of equal distribution'); ax.plot(x, y, color=RED, lw=6, marker='o', ms=8, label='Lorenz curve (real data)')
    ax.fill_between(x, y, x, color='#FFCDD2', alpha=0.6); ax.text(58, 38, 'Gap = unequal\ndistribution', fontsize=20, fontweight='bold', color=RED, ha='center')
    ax.set_xlabel('Cumulative % of area', fontsize=21, fontweight='bold'); ax.set_ylabel('Cumulative % of population', fontsize=21, fontweight='bold'); ax.legend(fontsize=18, frameon=False, loc='upper left')
    fig.subplots_adjust(left=0.12, bottom=0.15); fig.savefig(OUT + 'lorenz_big.png', dpi=150, facecolor='white'); plt.close(fig)


def density_lapse_big():
    fig, ax = chart(); d = np.linspace(0, 20, 100); D = 12000 * np.exp(-0.25 * d)
    ax.plot(d, D, color=NAVY, lw=6); ax.fill_between(d, 0, D, color='#BBDEFB', alpha=0.6)
    ax.text(1, 11000, 'City centre: very dense', fontsize=20, fontweight='bold', color=RED); ax.text(12, 2500, 'Suburbs and rural edge:\nless dense', fontsize=20, fontweight='bold', color=GREEN)
    ax.set_xlabel('Distance from the city centre (km)', fontsize=21, fontweight='bold'); ax.set_ylabel('People per km²', fontsize=21, fontweight='bold')
    fig.subplots_adjust(left=0.13); fig.savefig(OUT + 'density_lapse_big.png', dpi=150, facecolor='white'); plt.close(fig)


def mapping_methods_big():
    table_big('mapping_methods_big.png', ['Method', 'Advantage', 'Disadvantage'],
              [['Dot map', 'shows real pattern', 'hard to count dots'], ['Choropleth', 'easy to read and compare', 'hides differences inside areas'], ['Lorenz curve', 'measures inequality', 'no map; needs data'], ['Density lapse graph', 'shows change from centre', 'only one city at a time']],
              colw=[3.4, 4.3, 4.3], fs=18)


def world_density_big():
    fig, ax = map_axes([-170, 180, -58, 78])
    for x, y, w, h, t in [(115, 32, 30, 18, 'East Asia'), (80, 22, 22, 16, 'South Asia'), (12, 50, 30, 12, 'Europe'), (-78, 40, 16, 10, 'NE USA'), (6, 9, 14, 8, 'West Africa'), (31, 28, 4, 10, 'Nile')]:
        ax.add_patch(Ellipse((x, y), w, h, transform=PC, color=RED, alpha=0.55, zorder=10)); mlab(ax, x, y + h / 2 + 4, t, fs=15, c=RED)
    for x, y, t in [(10, 22, 'Sahara'), (-62, -5, 'Amazon'), (100, 63, 'Siberia'), (133, -25, 'Australian\ndesert'), (-100, 62, 'N. Canada')]:
        mlab(ax, x, y, t, fs=15, c=BLUE, box=False)
    ax.text(0.01, 0.06, '● Dense areas     Blue: sparse areas', transform=ax.transAxes, fontsize=16, fontweight='bold', color=NAVY, bbox=dict(fc='white', ec='none', alpha=0.85))
    msave(fig, 'world_density_big.png')


def altitude_pop_big():
    fig, ax = chart(); a = ['0–500', '500–1,000', '1,000–2,000', '2,000–3,000', 'over 3,000']
    ax.bar(np.arange(5) - 0.2, [55, 25, 14, 4, 2], width=0.4, color=BLUE, label='Temperate lands (Europe)')
    ax.bar(np.arange(5) + 0.2, [30, 20, 32, 12, 6], width=0.4, color=ORANGE, label='Tropical lands (Andes, East Africa)')
    ax.set_xticks(range(5)); ax.set_xticklabels(a, fontsize=18, fontweight='bold'); ax.set_xlabel('Altitude (m)', fontsize=20, fontweight='bold'); ax.set_ylabel('% of population', fontsize=20, fontweight='bold')
    ax.legend(fontsize=18, frameon=False); ax.text(2.2, 34, 'Cool, healthy highlands', fontsize=17, fontweight='bold', color=ORANGE, ha='center')
    ax.text(4.4, 50, '(approximate)', fontsize=14, style='italic', ha='right', color='#555')
    fig.savefig(OUT + 'altitude_pop_big.png', dpi=150, facecolor='white'); plt.close(fig)


def altitude_table_big():
    table_big('altitude_table_big.png', ['Town', 'Altitude (m)', 'Mean temperature', 'Density of the area'],
              [['Douala', '13', '27 °C', 'very high (port, industry)'], ['Bamenda', '1,600', '20 °C', 'high (cool, fertile)'], ['Dschang', '1,400', '20 °C', 'high (cool, volcanic soils)'], ['Mount Cameroon top', '4,095', 'about 0 °C', 'none (too cold)']],
              colw=[3.2, 2.4, 2.6, 3.8], fs=18, note='In the tropics, highlands can be more crowded than lowlands')


def growth_rates_big():
    fig, ax = chart(); r = ['Africa', 'Asia', 'Latin\nAmerica', 'North\nAmerica', 'Oceania', 'Europe']; v = [2.4, 0.7, 0.7, 0.5, 1.1, -0.1]
    cols = [GREEN if x > 1 else (ORANGE if x > 0 else RED) for x in v]; ax.bar(range(6), v, color=cols, width=0.6); ax.axhline(0, color='#333', lw=2)
    for i, x in enumerate(v): ax.text(i, x + (0.08 if x >= 0 else -0.25), f'{x:+.1f} %', fontsize=20, fontweight='bold', ha='center')
    ax.set_xticks(range(6)); ax.set_xticklabels(r, fontsize=18, fontweight='bold'); ax.set_ylabel('Growth rate per year', fontsize=21, fontweight='bold'); ax.set_ylim(-0.6, 2.9)
    ax.text(5.4, 2.6, '(approximate, 2020s)', fontsize=14, style='italic', ha='right', color='#555')
    fig.subplots_adjust(bottom=0.2); fig.savefig(OUT + 'growth_rates_big.png', dpi=150, facecolor='white'); plt.close(fig)


def pop_share_big():
    fig, ax = chart(); yrs = ['1950', '2000', '2050 (projected)']; data = {'Asia': [55, 61, 54], 'Africa': [9, 13, 26], 'Europe': [22, 12, 7], 'Americas': [13, 14, 12], 'Oceania': [1, 0.5, 1]}
    cols = ['#E65100', '#2E7D32', '#1565C0', '#8E24AA', '#6D4C41']; bottom = np.zeros(3)
    for (k, v), c in zip(data.items(), cols):
        ax.barh(range(3), v, left=bottom, color=c, label=k, height=0.6)
        for i in range(3):
            if v[i] > 6: ax.text(bottom[i] + v[i] / 2, i, f'{v[i]:g}%', fontsize=16, fontweight='bold', ha='center', va='center', color='white')
        bottom += np.array(v)
    ax.set_yticks(range(3)); ax.set_yticklabels(yrs, fontsize=19, fontweight='bold'); ax.set_xlim(0, 100); ax.set_xlabel('Share of world population (%)', fontsize=20, fontweight='bold')
    ax.legend(fontsize=16, ncol=5, loc='upper center', bbox_to_anchor=(0.5, 1.13), frameon=False); ax.invert_yaxis()
    fig.subplots_adjust(left=0.2, top=0.86); fig.savefig(OUT + 'pop_share_big.png', dpi=150, facecolor='white'); plt.close(fig)


# ---------- STRUCTURE ----------
def structure_components_big():
    fig, ax = canvas('white')
    for k, (t, c, s) in enumerate([('DEMOGRAPHIC', NAVY, 'age, sex,\nmarital status'), ('SOCIO-POLITICAL', GREEN, 'ethnic group, religion,\nlanguage, nationality'), ('ECONOMIC', ORANGE, 'occupation, income,\neducation, literacy')]):
        x = 0.3 + k * 4.2; box_(ax, x, 3.5, 3.9, 1.0, t, c, fs=22); ax.text(x + 1.95, 2.3, s, fontsize=20, fontweight='bold', ha='center', va='center', color=c)
    lab(ax, 6.4, 0.6, 'Population structure = the make-up of a population', fs=19, c=NAVY)
    save(fig, 'structure_components_big.png')


def youth_ageing_big():
    fig, ax = chart(); c = ['Niger', 'Cameroon', 'World', 'Germany', 'Japan']; u = [49, 42, 25, 14, 12]; o = [3, 3, 10, 22, 29]
    ax.bar(np.arange(5) - 0.2, u, width=0.4, color=GREEN, label='Under 15 years'); ax.bar(np.arange(5) + 0.2, o, width=0.4, color=RED, label='Over 65 years')
    for i in range(5): ax.text(i - 0.2, u[i] + 1, f'{u[i]}%', fontsize=17, fontweight='bold', ha='center'); ax.text(i + 0.2, o[i] + 1, f'{o[i]}%', fontsize=17, fontweight='bold', ha='center')
    ax.set_xticks(range(5)); ax.set_xticklabels(c, fontsize=20, fontweight='bold'); ax.set_ylabel('% of population', fontsize=21, fontweight='bold'); ax.legend(fontsize=19, frameon=False); ax.set_ylim(0, 58)
    ax.text(4.4, 53, '(approximate)', fontsize=14, style='italic', ha='right', color='#555')
    fig.savefig(OUT + 'youth_ageing_big.png', dpi=150, facecolor='white'); plt.close(fig)


AGES = ['0–4', '5–9', '10–14', '15–19', '20–24', '25–29', '30–34', '35–39', '40–44', '45–49', '50–54', '55–59', '60–64', '65–69', '70–74', '75+']
CMR = ([7.8, 7.0, 6.3, 5.5, 4.8, 4.1, 3.5, 2.9, 2.4, 1.9, 1.5, 1.2, 0.9, 0.6, 0.4, 0.4], [7.6, 6.9, 6.2, 5.5, 4.8, 4.2, 3.6, 3.0, 2.4, 1.9, 1.6, 1.2, 1.0, 0.7, 0.5, 0.5])
JPN = ([1.9, 2.1, 2.2, 2.3, 2.5, 2.6, 2.7, 3.0, 3.4, 4.0, 3.5, 3.2, 3.0, 3.4, 3.6, 5.6], [1.8, 2.0, 2.1, 2.2, 2.4, 2.5, 2.6, 2.9, 3.3, 3.9, 3.5, 3.2, 3.1, 3.6, 4.0, 8.4])


def pyramid(name, M, F, title, xmax=9, loc='upper right'):
    fig, ax = plt.subplots(figsize=(12.8, 5.8), dpi=150); fig.subplots_adjust(0.1, 0.12, 0.98, 0.9)
    y = np.arange(len(AGES)); ax.barh(y, [-m for m in M], color='#1E88E5', height=0.9, label='Males'); ax.barh(y, F, color='#E91E63', height=0.9, label='Females')
    ax.set_yticks(y); ax.set_yticklabels(AGES, fontsize=14, fontweight='bold'); ax.set_xlim(-xmax, xmax)
    t = np.arange(-xmax + 1, xmax, 2); ax.set_xticks(t); ax.set_xticklabels([f'{abs(v):g}' for v in t], fontsize=15); ax.set_xlabel('% of population', fontsize=18, fontweight='bold')
    ax.axvline(0, color='#333', lw=1); ax.set_title(title, fontsize=21, fontweight='bold', color=NAVY); ax.legend(fontsize=17, loc=loc, frameon=False)
    fig.savefig(OUT + name, dpi=150, facecolor='white'); plt.close(fig)


def pyramid_cameroon_big(): pyramid('pyramid_cameroon_big.png', *CMR, 'Cameroon (about 2020, approximate): wide base', 9)
def pyramid_japan_big(): pyramid('pyramid_japan_big.png', *JPN, 'Japan (about 2020, approximate): narrow base', 9, 'lower right')


def pyramid_types_big():
    fig, ax = canvas('white')
    shapes = [('EXPANSIVE', GREEN, 'high births, short life\n(Niger, Cameroon)', [(0.4, 0.9), (3.6, 0.9), (2.0, 4.1)]),
              ('STATIONARY', ORANGE, 'births ≈ deaths\n(USA, France)', [(4.6, 0.9), (7.8, 0.9), (7.4, 3.4), (6.6, 4.1), (5.8, 4.1), (5.0, 3.4)]),
              ('CONSTRICTIVE', RED, 'few births, long life\n(Japan, Germany)', [(10.2, 0.9), (10.8, 0.9), (11.6, 2.2), (12.0, 3.4), (11.4, 4.1), (9.6, 4.1), (9.0, 3.4), (9.4, 2.2)])]
    for n, c, s, pts in shapes:
        ax.add_patch(Polygon(pts, color=c, alpha=0.85)); cx = np.mean([p[0] for p in pts])
        ax.text(cx, 4.55, n, fontsize=21, fontweight='bold', ha='center', color=c); ax.text(cx, 0.42, s, fontsize=14, fontweight='bold', ha='center', va='center', color='#333')
    save(fig, 'pyramid_types_big.png')


def dependency_big():
    fig, ax = canvas('white')
    ax.text(6.4, 4.2, 'Dependency ratio =', fontsize=30, fontweight='bold', ha='center', color=NAVY)
    ax.text(6.4, 3.25, '(people aged 0–14) + (people aged 65+)', fontsize=24, fontweight='bold', ha='center', color=RED); ax.plot([2.2, 10.6], [2.95, 2.95], color='#333', lw=3)
    ax.text(6.4, 2.5, 'people aged 15–64', fontsize=24, fontweight='bold', ha='center', color=GREEN); ax.text(11.4, 2.95, '× 100', fontsize=24, fontweight='bold', va='center', color=NAVY)
    lab(ax, 6.4, 1.2, 'Cameroon: (42 + 3) ÷ 55 × 100 ≈ 82 dependants per 100 workers', fs=18, c=NAVY)
    save(fig, 'dependency_big.png')


def pw_pyramid_table_big():
    table_big('pw_pyramid_table_big.png', ['Age group', 'Males', 'Females'],
              [['0–14', '2,100', '2,050'], ['15–29', '1,400', '1,450'], ['30–44', '800', '850'], ['45–64', '450', '500'], ['65+', '120', '150']],
              colw=[4.0, 4.0, 4.0], fs=22, note='Total = 9,870. Change each number into % of the total, then draw the bars.')


# ---------- GROWTH ----------
def world_growth_big():
    fig, ax = chart(); y = [1, 1000, 1500, 1650, 1750, 1800, 1900, 1927, 1950, 1960, 1974, 1987, 1999, 2011, 2022]; p = [0.3, 0.31, 0.5, 0.55, 0.79, 1.0, 1.65, 2, 2.5, 3, 4, 5, 6, 7, 8]
    ax.plot(y, p, color=RED, lw=6); ax.fill_between(y, 0, p, color='#FFCDD2', alpha=0.5)
    for yy, pp in [(1800, 1), (1927, 2), (1974, 4), (2022, 8)]: ax.plot(yy, pp, 'o', ms=12, color=NAVY); ax.text(yy - 25, pp + 0.35, f'{pp} bn ({yy})', fontsize=16, fontweight='bold', ha='right', color=NAVY)
    ax.axvspan(1760, 1850, color='#FFF59D', alpha=0.6); ax.text(1700, 5.2, 'Industrial\nRevolution', fontsize=17, fontweight='bold', ha='center', color='#F57F17')
    ax.set_xlim(1, 2050); ax.set_ylim(0, 9); ax.set_xlabel('Year', fontsize=21, fontweight='bold'); ax.set_ylabel('World population (billions)', fontsize=20, fontweight='bold')
    fig.subplots_adjust(left=0.1); fig.savefig(OUT + 'world_growth_big.png', dpi=150, facecolor='white'); plt.close(fig)


def regional_growth_big():
    fig, ax = chart(); y = [1950, 1970, 1990, 2010, 2020, 2050]; m = [0.81, 1.01, 1.14, 1.24, 1.27, 1.26]; l = [1.72, 2.68, 4.19, 5.73, 6.52, 8.4]
    ax.plot(y, l, color=GREEN, lw=6, marker='o', ms=9, label='Less developed countries (LEDCs)'); ax.plot(y, m, color=BLUE, lw=6, marker='o', ms=9, label='More developed countries (MEDCs)')
    ax.axvspan(2020, 2050, color='#ECEFF1'); ax.text(2035, 1.8, 'projected', fontsize=17, style='italic', ha='center', color='#555')
    ax.set_ylabel('Population (billions)', fontsize=21, fontweight='bold'); ax.legend(fontsize=18, frameon=False, loc='upper left'); ax.set_ylim(0, 9.2)
    fig.savefig(OUT + 'regional_growth_big.png', dpi=150, facecolor='white'); plt.close(fig)


def change_system_big():
    fig, ax = canvas('white')
    box_(ax, 4.6, 1.9, 3.6, 1.3, 'POPULATION', NAVY, fs=26)
    for y, t, c in [(3.6, 'Births', GREEN), (1.3, 'In-migrants', '#00838F')]: box_(ax, 0.4, y - 0.4, 2.9, 0.8, t, c, fs=21); arrow(ax, (3.35, y), (4.55, 2.55), c=c, lw=5)
    for y, t, c in [(3.6, 'Deaths', RED), (1.3, 'Out-migrants', ORANGE)]: box_(ax, 9.5, y - 0.4, 2.9, 0.8, t, c, fs=21); arrow(ax, (8.25, 2.55), (9.45, y), c=c, lw=5)
    lab(ax, 6.4, 0.45, 'Change = (births − deaths) + (in-migrants − out-migrants)', fs=17, c=NAVY)
    lab(ax, 6.4, 4.6, 'Natural increase = births − deaths', fs=18, c=GREEN)
    save(fig, 'change_system_big.png')


def growth_types_big():
    fig, ax = chart(); c = ['Niger', 'Cameroon', 'France', 'Italy', 'Japan']; v = [3.7, 2.6, 0.3, -0.2, -0.5]
    cols = [GREEN, GREEN, ORANGE, RED, RED]; ax.bar(range(5), v, color=cols, width=0.6); ax.axhline(0, color='#333', lw=2)
    for i, x in enumerate(v): ax.text(i, x + (0.1 if x >= 0 else -0.35), f'{x:+.1f} %', fontsize=20, fontweight='bold', ha='center')
    ax.set_xticks(range(5)); ax.set_xticklabels(c, fontsize=20, fontweight='bold'); ax.set_ylabel('Growth rate per year', fontsize=21, fontweight='bold'); ax.set_ylim(-1, 4.3)
    ax.text(1.0, 3.3, 'POSITIVE', fontsize=19, fontweight='bold', color=GREEN, ha='center'); ax.text(2, 1.0, 'near ZERO', fontsize=19, fontweight='bold', color=ORANGE, ha='center'); ax.text(3.5, 0.7, 'NEGATIVE', fontsize=19, fontweight='bold', color=RED, ha='center')
    fig.savefig(OUT + 'growth_types_big.png', dpi=150, facecolor='white'); plt.close(fig)


def birth_death_big():
    fig, ax = chart(); r = ['Africa', 'Asia', 'Latin\nAmerica', 'North\nAmerica', 'Europe']; b = [33, 15, 15, 11, 9]; d = [8, 7, 6, 9, 11]
    ax.bar(np.arange(5) - 0.2, b, width=0.4, color=GREEN, label='Birth rate (per 1,000)'); ax.bar(np.arange(5) + 0.2, d, width=0.4, color=RED, label='Death rate (per 1,000)')
    ax.set_xticks(range(5)); ax.set_xticklabels(r, fontsize=18, fontweight='bold'); ax.set_ylabel('Per 1,000 people per year', fontsize=20, fontweight='bold'); ax.legend(fontsize=18, frameon=False); ax.set_ylim(0, 40)
    ax.text(4.4, 36, '(approximate)', fontsize=14, style='italic', ha='right', color='#555')
    fig.subplots_adjust(bottom=0.2); fig.savefig(OUT + 'birth_death_big.png', dpi=150, facecolor='white'); plt.close(fig)


def indices_big():
    fig, ax = canvas('white')
    for y, t, c in [(4.5, 'Crude birth rate (CBR) = births ÷ population × 1,000', GREEN), (3.7, 'Crude death rate (CDR) = deaths ÷ population × 1,000', RED),
                    (2.9, 'Natural increase (%) = (CBR − CDR) ÷ 10', NAVY), (2.1, 'Total fertility rate = children per woman (15–49)', '#8E24AA'),
                    (1.3, 'Doubling time (years) ≈ 70 ÷ growth rate (%)', ORANGE), (0.5, 'Net migration = in-migrants − out-migrants', '#00838F')]:
        ax.text(0.4, y, t, fontsize=20, fontweight='bold', va='center', color=c)
    save(fig, 'indices_big.png')


def pw_indices_big():
    table_big('pw_indices_big.png', ['Data (one year)', 'Value', 'Result'],
              [['Population', '1,000,000', '—'], ['Births', '36,000', 'CBR = 36 ‰'], ['Deaths', '9,000', 'CDR = 9 ‰'], ['Natural increase', '—', '(36 − 9) ÷ 10 = 2.7 %'], ['Doubling time', '—', '70 ÷ 2.7 ≈ 26 years']],
              colw=[4.2, 3.3, 4.5], fs=20)


def projection_big():
    fig, ax = chart(); t = np.arange(0, 61); p = 28 * (1.027) ** t
    ax.plot(2020 + t, p, color=RED, lw=6); ax.axhline(56, color='#999', ls='--', lw=2); ax.axvline(2046, color='#999', ls='--', lw=2)
    ax.text(2047, 30, 'Doubles in about\n26 years (2.7 %/year)', fontsize=19, fontweight='bold', color=NAVY)
    ax.set_xlabel('Year', fontsize=21, fontweight='bold'); ax.set_ylabel('Population (millions)', fontsize=21, fontweight='bold'); ax.text(2021, 120, 'Projection if the rate stays the same', fontsize=17, fontweight='bold', color=RED)
    fig.savefig(OUT + 'projection_big.png', dpi=150, facecolor='white'); plt.close(fig)


def growth_factors_big():
    fig, ax = canvas('white')
    box_(ax, 0.3, 3.8, 6.0, 0.9, 'HIGH FERTILITY', GREEN, fs=22); box_(ax, 6.5, 3.8, 6.0, 0.9, 'FALLING MORTALITY', BLUE, fs=22)
    for y, t in [(3.1, 'Early marriage'), (2.4, 'Children as labour and security'), (1.7, 'Religion and tradition'), (1.0, 'Little family planning'), (0.3, 'Low education of women')]: ax.text(3.3, y, t, fontsize=18, fontweight='bold', ha='center', color='#1B5E20')
    for y, t in [(3.1, 'Vaccines and medicines'), (2.4, 'Clean water, sanitation'), (1.7, 'Better food supply'), (1.0, 'More hospitals'), (0.3, 'Education on health')]: ax.text(9.5, y, t, fontsize=18, fontweight='bold', ha='center', color='#0D47A1')
    save(fig, 'growth_factors_big.png')


def policies_big():
    table_big('policies_big.png', ['Policy', 'Aim', 'Examples'],
              [['Anti-natal', 'fewer births', 'China (one-child, 1979–2015), India'], ['Pro-natal', 'more births', 'France, Russia, Singapore'], ['Restrictive migration', 'fewer immigrants', 'USA (quotas, border control)'], ['Open migration', 'attract workers', 'Canada (points system)']],
              colw=[3.4, 3.0, 5.6], fs=18)


def dtm_big():
    fig, ax = chart((12.8, 5.8)); x = np.linspace(0, 5, 300)
    br = np.interp(x, [0, 1.8, 2.8, 3.8, 5], [40, 40, 25, 12, 9]); dr = np.interp(x, [0, 1, 2.0, 3.0, 5], [38, 36, 18, 11, 11])
    ax.plot(x, br, color=GREEN, lw=6, label='Birth rate'); ax.plot(x, dr, color=RED, lw=6, label='Death rate'); ax.fill_between(x, dr, br, where=br > dr, color='#C8E6C9', alpha=0.7)
    for s in [1, 2, 3, 4]: ax.axvline(s, color='#555', lw=1.5, ls='--')
    for i, t in enumerate(['1. High\nstationary', '2. Early\nexpanding', '3. Late\nexpanding', '4. Low\nstationary', '5. Declining']): ax.text(i + 0.5, 43.5, t, fontsize=15, fontweight='bold', ha='center', color=NAVY)
    ax.text(2.2, 24, 'Natural\nincrease', fontsize=17, fontweight='bold', color=GREEN, ha='center')
    ax.set_ylim(0, 50); ax.set_xticks([]); ax.set_ylabel('Rate per 1,000', fontsize=20, fontweight='bold'); ax.legend(fontsize=17, loc='lower left', frameon=False)
    fig.savefig(OUT + 'dtm_big.png', dpi=150, facecolor='white'); plt.close(fig)


def dtm_countries_big():
    table_big('dtm_countries_big.png', ['Stage', 'Birth / death rates', 'Examples today'],
              [['1', 'both high', 'none (isolated tribes)'], ['2', 'high births, falling deaths', 'Niger, Chad'], ['3', 'falling births, low deaths', 'Cameroon, India'], ['4', 'both low', 'USA, France'], ['5', 'births below deaths', 'Japan, Germany']],
              colw=[1.8, 5.0, 5.2], fs=19)


def rostow_big():
    fig, ax = canvas('white')
    st = [('Traditional\nsociety', '#8D6E63'), ('Pre-conditions\nfor take-off', '#FB8C00'), ('Take-off', '#FDD835'), ('Drive to\nmaturity', '#7CB342'), ('High mass\nconsumption', '#1565C0')]
    for i, (t, c) in enumerate(st):
        ax.add_patch(Rectangle((0.4 + i * 2.45, 0.4), 2.35, 0.7 + i * 0.65, color=c)); ax.text(1.575 + i * 2.45, 1.2 + i * 0.65, t, fontsize=16, fontweight='bold', ha='center', va='bottom', color=NAVY)
        ax.text(1.575 + i * 2.45, 0.7, f'DTM {i + 1}', fontsize=15, fontweight='bold', ha='center', color='white')
    ax.text(0.4, 4.7, "Rostow's stages of economic growth match the DTM", fontsize=19, fontweight='bold', color=NAVY)
    save(fig, 'rostow_big.png')


def cmr_rates_big():
    fig, ax = chart(); y = [1960, 1970, 1980, 1990, 2000, 2010, 2020]; b = [44, 45, 45, 43, 40, 37, 35]; d = [25, 20, 17, 15, 14, 11, 9]
    ax.plot(y, b, color=GREEN, lw=6, marker='o', ms=10, label='Birth rate'); ax.plot(y, d, color=RED, lw=6, marker='o', ms=10, label='Death rate')
    ax.fill_between(y, d, b, color='#C8E6C9', alpha=0.6); ax.set_ylim(0, 50); ax.set_ylabel('Rate per 1,000', fontsize=21, fontweight='bold'); ax.legend(fontsize=19, frameon=False, loc='lower left')
    ax.text(2019, 46, 'Cameroon (approximate): stage 3 of the DTM', fontsize=18, fontweight='bold', ha='right', color=NAVY)
    fig.savefig(OUT + 'cmr_rates_big.png', dpi=150, facecolor='white'); plt.close(fig)


# ---------- MIGRATION ----------
def zipf_big():
    fig, ax = chart(); d = np.linspace(10, 500, 200); m = 20000 / d
    ax.plot(d, m, color=NAVY, lw=6); ax.fill_between(d, 0, m, color='#BBDEFB', alpha=0.5)
    ax.text(60, 1500, 'Many migrants move\nshort distances', fontsize=20, fontweight='bold', color=GREEN); ax.text(300, 300, 'Few move far', fontsize=20, fontweight='bold', color=RED)
    ax.set_xlabel('Distance (km)', fontsize=21, fontweight='bold'); ax.set_ylabel('Number of migrants', fontsize=21, fontweight='bold'); ax.set_ylim(0, 2100)
    ax.text(480, 1900, "Zipf: migrants ∝ 1 ÷ distance", fontsize=19, fontweight='bold', ha='right', color=NAVY)
    fig.subplots_adjust(left=0.12); fig.savefig(OUT + 'zipf_big.png', dpi=150, facecolor='white'); plt.close(fig)


def gravity_big():
    fig, ax = canvas('white')
    ax.add_patch(Circle((1.6, 3.4), 0.9, color='#1565C0')); ax.text(1.6, 3.4, 'A', fontsize=30, fontweight='bold', color='white', ha='center', va='center')
    ax.add_patch(Circle((5.4, 3.4), 0.6, color='#E65100')); ax.text(5.4, 3.4, 'B', fontsize=26, fontweight='bold', color='white', ha='center', va='center')
    ax.annotate('', xy=(4.75, 3.4), xytext=(2.55, 3.4), arrowprops=dict(arrowstyle='<->', lw=3, color='#333')); ax.text(3.65, 3.65, 'distance d', fontsize=17, fontweight='bold', ha='center')
    ax.text(9.3, 4.2, 'Interaction =  P(A) × P(B)', fontsize=26, fontweight='bold', ha='center', color=NAVY); ax.plot([7.9, 11.9], [3.85, 3.85], color='#333', lw=3); ax.text(9.9, 3.45, 'd²', fontsize=26, fontweight='bold', ha='center', color=NAVY)
    lab(ax, 6.4, 1.6, 'Example: Douala 3.9 M, Yaoundé 4.1 M, d = 240 km', fs=18, c=NAVY)
    lab(ax, 6.4, 0.6, '3.9 × 4.1 ÷ 240² ≈ 0.00028 (compare with other town pairs)', fs=17, c=RED)
    save(fig, 'gravity_big.png')


def stouffer_big():
    fig, ax = canvas('#F1F8E9')
    ax.add_patch(Circle((1.4, 2.5), 0.7, color='#8D6E63')); ax.text(1.4, 2.5, 'Village', fontsize=16, fontweight='bold', color='white', ha='center', va='center')
    ax.add_patch(Circle((11.2, 2.5), 0.9, color=NAVY)); ax.text(11.2, 2.5, 'Big city', fontsize=16, fontweight='bold', color='white', ha='center', va='center')
    ax.add_patch(Circle((6.2, 2.5), 0.65, color=ORANGE)); ax.text(6.2, 2.5, 'Town', fontsize=16, fontweight='bold', color='white', ha='center', va='center')
    arrow(ax, (2.2, 2.7), (5.5, 2.7), c=GREEN, lw=6); arrow(ax, (2.2, 2.2), (10.2, 2.2), c='#9E9E9E', lw=3, cs='arc3,rad=0.25')
    lab(ax, 6.2, 4.3, 'Intervening opportunity: jobs in the nearer town', fs=19, c=ORANGE)
    lab(ax, 6.4, 0.5, 'Stouffer: migrants depend on opportunities, not only distance', fs=17, c=NAVY)
    save(fig, 'stouffer_big.png')


def ullman_big():
    fig, ax = canvas('white')
    for k, (t, c, s) in enumerate([('COMPLEMENTARITY', GREEN, 'one place has what\nthe other needs'), ('TRANSFERABILITY', BLUE, 'movement is possible:\ncost and time are low'), ('INTERVENING\nOPPORTUNITY', ORANGE, 'a nearer place can\nreplace the far one')]):
        x = 0.3 + k * 4.2; box_(ax, x, 3.3, 3.9, 1.3, t, c, fs=19); ax.text(x + 1.95, 2.1, s, fontsize=18, fontweight='bold', ha='center', va='center', color=c)
    lab(ax, 6.4, 0.6, "Ullman's three bases of spatial interaction", fs=19, c=NAVY)
    save(fig, 'ullman_big.png')


def migration_types_big():
    fig, ax = canvas('white')
    box_(ax, 4.9, 4.1, 3.0, 0.75, 'MIGRATION', NAVY, fs=22)
    for x, t, c in [(0.6, 'By choice:\nVOLUNTARY', GREEN), (9.2, 'By force:\nFORCED', RED)]: box_(ax, x, 2.9, 3.0, 0.9, t, c, fs=17); arrow(ax, (6.4, 4.05), (x + 1.5, 3.85), c='#90A4AE', lw=2, ms=18)
    box_(ax, 3.9, 2.9, 5.0, 0.9, 'By distance: INTERNAL\nor INTERNATIONAL', ORANGE, fs=17); arrow(ax, (6.4, 4.05), (6.4, 3.85), c='#90A4AE', lw=2, ms=18)
    for y, t in [(2.2, 'Rural → urban'), (1.6, 'Rural → rural'), (1.0, 'Urban → rural, urban → urban'), (0.4, 'Commuting (daily)')]: ax.text(6.4, y, t, fontsize=17, fontweight='bold', ha='center', color='#E65100')
    for y, t in [(2.2, 'Economic migrants')]: ax.text(2.1, y, t, fontsize=17, fontweight='bold', ha='center', color=GREEN)
    for y, t in [(2.2, 'Refugees'), (1.6, 'Internally displaced'), (1.0, 'persons (IDPs)')]: ax.text(10.7, y, t, fontsize=17, fontweight='bold', ha='center', color=RED)
    save(fig, 'migration_types_big.png')


# ---------- POPULATION AND RESOURCES ----------
def carrying_big():
    fig, ax = chart(); t = np.linspace(0, 10, 300); s = 100 / (1 + np.exp(-(t - 4)))
    j = np.minimum(8 * np.exp(0.42 * t), 140)
    ax.plot(t, s, color=GREEN, lw=6, label='S-curve: growth slows near the limit'); ax.plot(t[t < 6.2], j[t < 6.2], color=RED, lw=5, ls='--', label='J-curve: overshoot, then crash')
    ax.axhline(100, color=NAVY, lw=3); ax.text(0.2, 104, 'Carrying capacity', fontsize=19, fontweight='bold', color=NAVY)
    ax.set_xlabel('Time', fontsize=21, fontweight='bold'); ax.set_ylabel('Population', fontsize=21, fontweight='bold'); ax.set_xticks([]); ax.set_yticks([]); ax.legend(fontsize=17, frameon=False, loc='lower right'); ax.set_ylim(0, 150)
    fig.savefig(OUT + 'carrying_big.png', dpi=150, facecolor='white'); plt.close(fig)


def regimes_big():
    table_big('regimes_big.png', ['Regime (Zelinsky)', 'People / resources', 'Example'],
              [['US type', 'few people, rich resources, high technology', 'USA, Canada'], ['European type', 'many people, few resources, high technology', 'Netherlands, Japan'], ['Egyptian type', 'many people, few resources, low technology', 'Bangladesh, Rwanda'], ['Brazilian type', 'few people, rich resources, low technology', 'Congo, Gabon']],
              colw=[3.2, 5.6, 3.2], fs=16)


def optimum_big():
    fig, ax = chart(); p = np.linspace(0, 10, 300); o = 100 * np.exp(-((p - 5) / 2.5) ** 2)
    ax.plot(p, o, color=NAVY, lw=6); ax.axvline(5, color=GREEN, lw=3, ls='--')
    ax.axvspan(0, 3.5, color='#BBDEFB', alpha=0.5); ax.axvspan(6.5, 10, color='#FFCDD2', alpha=0.5)
    ax.text(1.75, 60, 'UNDER-\nPOPULATION', fontsize=19, fontweight='bold', ha='center', color=BLUE); ax.text(5, 105, 'OPTIMUM', fontsize=20, fontweight='bold', ha='center', color=GREEN); ax.text(8.25, 60, 'OVER-\nPOPULATION', fontsize=19, fontweight='bold', ha='center', color=RED)
    ax.set_xlabel('Number of people (same resources and technology)', fontsize=19, fontweight='bold'); ax.set_ylabel('Output per person', fontsize=20, fontweight='bold'); ax.set_xticks([]); ax.set_yticks([]); ax.set_ylim(0, 118)
    fig.savefig(OUT + 'optimum_big.png', dpi=150, facecolor='white'); plt.close(fig)


def malthus_big():
    fig, ax = chart(); t = np.arange(0, 8); p = 2 ** t; f = 1 + t
    ax.plot(t * 25, p, color=RED, lw=6, marker='o', ms=10, label='Population: 1, 2, 4, 8, 16… (geometric)'); ax.plot(t * 25, f, color=GREEN, lw=6, marker='o', ms=10, label='Food: 1, 2, 3, 4, 5… (arithmetic)')
    ax.axvline(25, color='#555', ls='--', lw=2); ax.text(30, 50, 'Crisis point: famine,\nwar and disease\n(positive checks)', fontsize=18, fontweight='bold', color=RED)
    ax.set_xlabel('Years', fontsize=21, fontweight='bold'); ax.set_ylabel('Amount', fontsize=21, fontweight='bold'); ax.legend(fontsize=17, frameon=False, loc='upper left')
    fig.savefig(OUT + 'malthus_big.png', dpi=150, facecolor='white'); plt.close(fig)


def boserup_big():
    fig, ax = canvas('white')
    st = [('Forest fallow\n(20 years)', '#2E7D32'), ('Bush fallow\n(6–10 years)', '#7CB342'), ('Short fallow\n(1–2 years)', '#C0CA33'), ('Annual\ncropping', '#FB8C00'), ('Multi-cropping,\nirrigation', '#1565C0')]
    for i, (t, c) in enumerate(st):
        ax.add_patch(Rectangle((0.4 + i * 2.45, 0.4), 2.35, 0.6 + i * 0.6, color=c)); ax.text(1.575 + i * 2.45, 1.1 + i * 0.6, t, fontsize=15, fontweight='bold', ha='center', va='bottom', color=NAVY)
    arrow(ax, (0.6, 4.25), (12.2, 4.25), c=RED, lw=5); ax.text(6.4, 4.55, 'Population pressure grows →  farmers invent new methods', fontsize=17, fontweight='bold', color=RED, ha='center')
    save(fig, 'boserup_big.png')


# ---------- CAMEROON ----------
def cmr_growth_big():
    fig, ax = chart(); y = [1976, 1987, 2005, 2024]; p = [7.7, 10.5, 17.5, 29]
    ax.bar(range(4), p, color=[NAVY, NAVY, NAVY, '#90A4AE'], width=0.6)
    for i, v in enumerate(p): ax.text(i, v + 0.6, f'{v:g} M', fontsize=21, fontweight='bold', ha='center')
    ax.set_xticks(range(4)); ax.set_xticklabels(['1976\ncensus', '1987\ncensus', '2005\ncensus', '2024\nestimate'], fontsize=19, fontweight='bold'); ax.set_ylabel('Population (millions)', fontsize=21, fontweight='bold'); ax.set_ylim(0, 33)
    fig.subplots_adjust(bottom=0.2); fig.savefig(OUT + 'cmr_growth_big.png', dpi=150, facecolor='white'); plt.close(fig)


def cmr_migration_big():
    R = regions(); fig, ax = cm_base()
    for n, g in R.items(): ax.add_geometries([g], PC, facecolor='#FAFAFA', edgecolor='#999', lw=1)
    cities = {'Douala': (9.7, 4.05), 'Yaoundé': (11.52, 3.87), 'Bamenda': (10.15, 5.96), 'Bafoussam': (10.42, 5.48), 'Maroua': (14.32, 10.6), 'Garoua': (13.4, 9.3)}
    for k, (x, y) in cities.items(): ax.plot(x, y, 'o', ms=9, color=NAVY, transform=PC, zorder=20); ax.text(x + 0.25, y + 0.15, k, fontsize=14, fontweight='bold', transform=PC, zorder=21, color=NAVY)
    for a, b, c in [((10.2, 5.9), (9.75, 4.2), RED), ((10.4, 5.4), (11.4, 4.0), RED), ((14.3, 10.5), (11.6, 4.1), ORANGE), ((13.4, 9.2), (9.9, 4.2), ORANGE), ((10.1, 5.9), (9.3, 4.2), RED)]:
        ax.annotate('', xy=b, xytext=a, arrowprops=dict(arrowstyle='-|>', color=c, lw=4, mutation_scale=28, connectionstyle='arc3,rad=0.1'), xycoords=PC._as_mpl_transform(ax), textcoords=PC._as_mpl_transform(ax))
    ax.text(0.6, 0.85, '→ Highlands to coast\n   and towns (red)', transform=ax.transAxes, fontsize=18, fontweight='bold', color=RED)
    ax.text(0.6, 0.68, '→ North to southern\n   cities (orange)', transform=ax.transAxes, fontsize=18, fontweight='bold', color=ORANGE)
    ax.text(0.6, 0.53, 'Main flows (simplified)', transform=ax.transAxes, fontsize=15, style='italic', color='#555')
    msave(fig, 'cmr_migration_big.png')


ALL = [k for k in list(globals()) if (k.endswith('_big') or k.endswith('_gif')) and k not in ('table_big',)]
if __name__ == '__main__':
    for f in (sys.argv[1:] or ALL):
        try: globals()[f](); print('ok', f)
        except Exception as e: print('FAIL', f, repr(e))
