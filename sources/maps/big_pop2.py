"""Big-label diagrams for the revised Upper Sixth Population Geography (teacher's support, 2026). Values marked approximate are rounded."""
import sys
from big_common import *
from big_usa_pop import box_, table_big


def txt(ax, x, y, t, fs=20, c='#222', ha='center', va='center', w='bold'):
    ax.text(x, y, t, fontsize=fs, fontweight=w, ha=ha, va=va, color=c, zorder=8)


# ---------- LESSON 1 ----------
def pop2_static_dynamic():
    fig, ax = canvas('white')
    box_(ax, 0.3, 3.9, 6.0, 0.8, 'STATIC METHODS (primary)', NAVY, fs=22)
    box_(ax, 6.6, 3.9, 5.9, 0.8, 'DYNAMIC METHODS (secondary)', ORANGE, fs=22)
    txt(ax, 3.3, 3.45, 'a "photograph" of the population', 18, NAVY)
    txt(ax, 9.55, 3.45, 'a "film" of changes, recorded all the time', 18, ORANGE)
    for k, (t, s) in enumerate([('CENSUS', 'every person counted\n(Cameroon: 1976, 1987, 2005)'), ('SAMPLE SURVEY', 'a part of the population\n(e.g. 10 % of households)')]):
        box_(ax, 0.6, 2.55 - k * 1.6, 5.4, 0.65, t, '#1E4E8C', fs=20); txt(ax, 3.3, 2.1 - k * 1.6, s, 16, '#222')
    for k, (t, s) in enumerate([('VITAL REGISTRATION', 'births, deaths, marriages\nat the civil status office'), ('MIGRATION RECORDS', 'passports, visas,\nborder and refugee records')]):
        box_(ax, 6.9, 2.55 - k * 1.6, 5.3, 0.65, t, '#EF6C00', fs=20); txt(ax, 9.55, 2.1 - k * 1.6, s, 16, '#222')
    save(fig, 'pop2_static_dynamic.png')


def pop2_facto_jure():
    fig, ax = canvas('white')
    txt(ax, 6.4, 4.6, 'Census night: Amadou lives in Garoua but sleeps in Douala', 22, NAVY)
    for x, name, c in [(2.2, 'GAROUA\n(usual residence)', GREEN), (10.4, 'DOUALA\n(place on census night)', BLUE)]:
        ax.add_patch(Circle((x, 2.6), 1.5, color=c, alpha=0.18, zorder=2)); txt(ax, x, 2.6, name, 16, c)
    arrow(ax, (3.8, 2.6), (8.8, 2.6), c='#555', lw=4)
    box_(ax, 0.3, 0.2, 5.8, 0.8, 'DE JURE: counted in Garoua', GREEN, fs=20)
    box_(ax, 6.7, 0.2, 5.8, 0.8, 'DE FACTO: counted in Douala', BLUE, fs=20)
    save(fig, 'pop2_facto_jure.png')


def pop2_sample():
    fig, ax = canvas('white')
    rng = np.random.default_rng(3)
    xs, ys = rng.uniform(0.4, 5.6, 300), rng.uniform(0.5, 4.2, 300)
    ax.scatter(xs, ys, s=18, color='#90A4AE', zorder=3)
    sel = rng.choice(300, 30, replace=False); ax.scatter(xs[sel], ys[sel], s=60, color=RED, zorder=4)
    txt(ax, 3.0, 4.6, 'Village: 3,000 people', 22, NAVY)
    txt(ax, 9.3, 4.1, '10 % sample = 300 people', 22, RED)
    txt(ax, 9.3, 3.2, '30 of the 300 are married', 22, '#222')
    txt(ax, 9.3, 2.3, '30 ÷ 300 = 10 %', 24, GREEN)
    txt(ax, 9.3, 1.3, 'so about 10 % of the 3,000\n(about 300 people) are married', 20, NAVY)
    save(fig, 'pop2_sample.png')


def pop2_other_sources():
    fig, ax = canvas('white')
    txt(ax, 6.4, 4.6, 'Other sources of population data', 24, NAVY)
    for k, (t, s, c) in enumerate([('UN Statistics Division', 'world population figures', NAVY), ('WHO', 'health, diseases, life expectancy', GREEN),
                                   ('ILO', 'jobs and labour force', ORANGE), ('Ministries of Health', 'hospital and vaccination records', '#6A1B9A'),
                                   ('Electoral registers', 'adults who can vote', RED), ('Schools (enrolment)', 'number of children at school', BLUE)]):
        x = 0.3 + (k % 3) * 4.15; y = 2.6 - (k // 3) * 2.0
        box_(ax, x, y + 0.7, 3.9, 0.75, t, c, fs=19); txt(ax, x + 1.95, y + 0.2, s, 16, c)
    save(fig, 'pop2_other_sources.png')


def pop2_trends():
    fig, ax = canvas('white')
    txt(ax, 6.4, 4.6, 'The world population today (about 2025, approximate)', 22, NAVY)
    for k, (big, s, c) in enumerate([('8.2 billion', 'people on Earth', NAVY), ('+70 million', 'people per year\n(growth is slowing)', GREEN),
                                     ('57 %', 'live in towns\n(urban population)', ORANGE), ('10 %', 'are aged 65 or more\n(ageing)', RED)]):
        x = 0.3 + k * 3.1
        ax.add_patch(FancyBboxPatch((x, 0.5), 2.9, 3.5, boxstyle='round,pad=0.05', fc='#F5F9FC', ec=c, lw=3))
        txt(ax, x + 1.45, 3.0, big, 30, c); txt(ax, x + 1.45, 1.6, s, 17, '#222')
    save(fig, 'pop2_trends.png')


# ---------- LESSON 2 ----------
def pop2_cont_density():
    fig, ax = chart(); r = ['Asia', 'Europe', 'Africa', 'Latin\nAmerica', 'North\nAmerica', 'Oceania']; v = [150, 73, 50, 33, 20, 5]
    ax.bar(range(6), v, color=['#E65100', '#1565C0', '#2E7D32', '#8E24AA', '#00838F', '#6D4C41'], width=0.65)
    for i, x in enumerate(v): ax.text(i, x + 3, f'{x}', fontsize=22, fontweight='bold', ha='center')
    ax.set_xticks(range(6)); ax.set_xticklabels(r, fontsize=19, fontweight='bold'); ax.set_ylabel('People per km²', fontsize=22, fontweight='bold'); ax.set_ylim(0, 175)
    ax.text(5.4, 160, 'Density by continent\n(about 2024, approximate)', fontsize=18, fontweight='bold', ha='right', color=NAVY)
    fig.subplots_adjust(bottom=0.2); fig.savefig(OUT + 'pop2_cont_density.png', dpi=150, facecolor='white'); plt.close(fig)


def pop2_hemisphere():
    ext = [-180, 180, -58, 80]
    fig, ax = map_axes(ext)
    ax.add_patch(Rectangle((-180, 20), 360, 40, color='#E65100', alpha=0.25, transform=PC, zorder=5))
    latline(ax, ext, 0, 'Equator', c=RED, ls='-')
    latline(ax, ext, 20, '20° N'); latline(ax, ext, 60, '60° N')
    mlab(ax, 60, 40, 'About 4/5 of humanity\nlives between 20° N and 60° N', fs=22, c='#B71C1C')
    mlab(ax, -100, -35, 'Southern hemisphere:\nabout 10 % of the people', fs=22, c=NAVY)
    mlab(ax, -20, 10, 'Northern hemisphere: about 90 %', fs=20, c=GREEN)
    msave(fig, 'pop2_hemisphere.png')


def pop2_coast():
    fig, ax = chart(); r = ['below 200 m\nof altitude', 'within 500 km\nof the sea', 'within 1,000 km\nof the sea']; v = [56, 67, 75]
    ax.barh(range(3), v, color=[BROWN, BLUE, '#00838F'], height=0.6)
    for i, x in enumerate(v): ax.text(x + 1, i, f'about {x} %', fontsize=22, fontweight='bold', va='center')
    ax.set_yticks(range(3)); ax.set_yticklabels(r, fontsize=19, fontweight='bold'); ax.set_xlim(0, 100); ax.invert_yaxis()
    ax.set_xlabel('Share of the world population (%)', fontsize=21, fontweight='bold')
    fig.subplots_adjust(left=0.25); fig.savefig(OUT + 'pop2_coast.png', dpi=150, facecolor='white'); plt.close(fig)


def pop2_density_calc():
    table_big('pop2_density_calc.png', ['Density', 'Data of country X', 'Result'],
              [['Arithmetic', '10,000,000 people ÷ 500,000 km²', '20 people per km²'],
               ['Physiological', '10,000,000 people ÷ 200,000 km² of farmland', '50 people per km²'],
               ['Agricultural', '1,000,000 farmers ÷ 200,000 km² of farmland', '5 farmers per km²']],
              colw=[2.6, 6.2, 3.2], fs=18, note='Cameroon: about 29 million ÷ 475,650 km² ≈ 61 people per km² (2024, approximate)')


# ---------- LESSON 3 ----------
def pop2_ecumene():
    ext = [-180, 180, -60, 83]
    fig, ax = map_axes(ext)
    for x, y, t in [(10, 45, 'W. Europe'), (100, 25, 'S. & E. Asia'), (31, 28, 'Nile valley'), (-78, 40, 'NE USA')]:
        ax.add_patch(Ellipse((x, y), 30 if t != 'Nile valley' else 6, 14, color=GREEN, alpha=0.55, transform=PC, zorder=6)); mlab(ax, x + (14 if t == 'Nile valley' else 0), y - 11, t, fs=18, c=GREEN)
    for x, y, t in [(-42, 72, 'Greenland'), (0, 20, 'Sahara'), (-60, -4, 'Amazon'), (95, 62, 'Siberia'), (125, -25, 'Australian\ndesert')]:
        mlab(ax, x, y, t, fs=18, c=RED)
    mlab(ax, 0, -52, 'Green: ecumene (dense)    Red: non-ecumene or very sparse', fs=18, c=NAVY)
    msave(fig, 'pop2_ecumene.png')


def pop2_factors():
    fig, ax = canvas('white')
    for k, (t, c, s) in enumerate([('PHYSICAL', GREEN, 'climate, relief,\nwater, soils'), ('ECONOMIC & SOCIAL', ORANGE, 'jobs, industry,\nservices, culture'), ('POLITICAL & HISTORICAL', NAVY, 'peace, security,\nold civilisations')]):
        x = 0.3 + k * 4.15; box_(ax, x, 2.9, 3.9, 1.0, t, c, fs=19); txt(ax, x + 1.95, 1.9, s, 20, c)
    txt(ax, 6.4, 0.6, 'Technology can overcome harsh conditions (Dubai, Mecca)', 19, RED)
    save(fig, 'pop2_factors.png')


# ---------- LESSON 4 ----------
def pop2_push_pull():
    fig, ax = canvas('white')
    box_(ax, 0.3, 3.8, 3.6, 0.8, 'VILLAGE (origin)', BROWN, fs=21); box_(ax, 8.9, 3.8, 3.6, 0.8, 'CITY (destination)', BLUE, fs=21)
    arrow(ax, (4.2, 4.2), (8.6, 4.2), c=RED, lw=6); txt(ax, 6.4, 4.65, 'migration', 19, RED)
    txt(ax, 2.1, 3.3, 'PUSH factors', 21, BROWN)
    for k, s in enumerate(['few jobs', 'poor roads and services', 'drought, poor harvests', 'insecurity']): txt(ax, 2.1, 2.65 - k * 0.6, '• ' + s, 18, '#333')
    txt(ax, 10.7, 3.3, 'PULL factors', 21, BLUE)
    for k, s in enumerate(['jobs and higher pay', 'schools and hospitals', 'water and electricity', 'bright lights, security']): txt(ax, 10.7, 2.65 - k * 0.6, '• ' + s, 18, '#333')
    save(fig, 'pop2_push_pull.png')


def pop2_growth_effects():
    table_big('pop2_growth_effects.png', ['', 'High growth (Nigeria, Niger)', 'Low growth (Japan, Germany)'],
              [['Births', 'many children', 'few children'], ['Towns', 'overcrowding, slums', 'empty villages, closed schools'],
               ['Economy', 'too few jobs', 'too few workers'], ['State spends on', 'schools, maternity care', 'pensions, old people']],
              colw=[2.6, 4.7, 4.7], fs=18)


# ---------- LESSONS 5-7, PW3 ----------
def pop2_sectors():
    fig, ax = canvas('white')
    txt(ax, 6.4, 4.6, 'Occupational structure: three sectors', 23, NAVY)
    for k, (t, c, s) in enumerate([('PRIMARY', GREEN, 'farming, fishing,\nmining, forestry\n(cotton farmers)'), ('SECONDARY', ORANGE, 'manufacturing,\nprocessing, building\n(CICAM textile factory)'), ('TERTIARY', BLUE, 'services: teachers,\nnurses, traders,\nmoto-taxi drivers')]):
        x = 0.3 + k * 4.15; box_(ax, x, 3.0, 3.9, 0.9, t, c, fs=22); txt(ax, x + 1.95, 1.7, s, 19, c)
    save(fig, 'pop2_sectors.png')


def pop2_pyramid_parts():
    fig, ax = canvas('white')
    ages = ['0-4', '10-14', '20-24', '30-34', '40-44', '50-54', '60-64', '70+']
    v = [7.5, 6.3, 5.0, 3.9, 2.9, 2.0, 1.2, 0.6]
    for i, x in enumerate(v):
        y = 0.45 + i * 0.5
        ax.add_patch(Rectangle((6.4 - x * 0.55, y), x * 0.55, 0.45, color=BLUE)); ax.add_patch(Rectangle((6.4, y), x * 0.55, 0.45, color='#E91E63'))
        txt(ax, 6.4, y + 0.22, ages[i], 13, 'white')
    txt(ax, 3.0, 4.6, 'MALES (left)', 21, BLUE); txt(ax, 9.8, 4.6, 'FEMALES (right)', 21, '#C2185B')
    txt(ax, 11.6, 1.5, 'BASE:\nbirths,\nchildren', 16, GREEN); txt(ax, 9.9, 3.7, 'APEX: old people,\nlife expectancy', 17, RED)
    txt(ax, 1.2, 2.4, 'vertical axis:\nage groups\n(5 years)', 17, NAVY); txt(ax, 6.4, 0.15, 'horizontal axis: % (or number) of the population', 17, NAVY)
    save(fig, 'pop2_pyramid_parts.png')


def pop2_pyramid4():
    fig, ax = canvas('white')
    shapes = [('PROGRESSIVE', GREEN, [(0, 0), (3, 0), (1.5, 3.2)], 'Nigeria, Cameroon'),
              ('REGRESSIVE', RED, [(0.6, 0), (2.4, 0), (3, 1.6), (2.4, 3.0), (0.6, 3.0), (0, 1.6)], 'Japan, Germany'),
              ('STATIONARY', ORANGE, [(0.3, 0), (2.7, 0), (2.6, 2.3), (1.9, 3.2), (1.1, 3.2), (0.4, 2.3)], 'Sweden, USA'),
              ('COMPOSITE', '#6A1B9A', [(0.4, 0), (2.6, 0), (3.0, 1.2), (2.2, 2.6), (1.5, 3.2), (0.8, 2.6), (0.0, 1.2)], 'Brazil, Mexico')]
    for k, (t, c, pts, ex) in enumerate(shapes):
        x0 = 0.15 + k * 3.18
        ax.add_patch(Polygon([(x0 + a, 0.75 + b) for a, b in pts], color=c, alpha=0.85))
        txt(ax, x0 + 1.5, 4.55, t, 19, c); txt(ax, x0 + 1.5, 0.35, ex, 16, '#333')
    save(fig, 'pop2_pyramid4.png')


def pop2_dep_indices():
    table_big('pop2_dep_indices.png', ['Index', 'Calculation (× 100)'],
              [['Young dependency ratio', 'people 0–14 ÷ people 15–64'], ['Old-age dependency ratio', 'people 65+ ÷ people 15–64'],
               ['Total (societal) dependency ratio', '(0–14 + 65+) ÷ 15–64'], ['Societal support ratio', 'people 65+ ÷ people 20–64'],
               ['Parental support ratio', 'people 85+ ÷ people 50–64']], colw=[5.6, 6.4], fs=18)


def pop2_dep_uk():
    fig, ax = canvas('white')
    txt(ax, 6.4, 4.55, 'United Kingdom, 1971 (in thousands)', 23, NAVY)
    txt(ax, 6.4, 3.75, 'children (0–14) = 13,387     elderly (65+) = 7,307     adults (15–64) = 31,616', 18, '#222')
    txt(ax, 6.4, 2.75, '(13,387 + 7,307) ÷ 31,616 × 100', 26, RED)
    txt(ax, 6.4, 1.85, '= 20,694 ÷ 31,616 × 100 = 65.45 %', 26, GREEN)
    txt(ax, 6.4, 0.8, '65 dependants for every 100 people of working age', 21, NAVY)
    save(fig, 'pop2_dep_uk.png')


def pop2_sexratio():
    fig, ax = canvas('white')
    txt(ax, 6.4, 4.55, 'Sex ratio = males ÷ females × 100', 26, NAVY)
    for k, (t, s, c) in enumerate([('at birth', 'about 105 boys\nfor 100 girls', BLUE), ('old age', 'more women:\nthey live longer', '#C2185B'), ('migration', 'towns and mining areas:\nmore men', ORANGE)]):
        x = 0.3 + k * 4.15; box_(ax, x, 2.6, 3.9, 0.85, t.upper(), c, fs=22); txt(ax, x + 1.95, 1.5, s, 19, c)
    save(fig, 'pop2_sexratio.png')


# ---------- LESSONS 8-12, PW4 ----------
def pop2_milestones():
    fig, ax = chart(); yrs = [1804, 1927, 1960, 1974, 1987, 1999, 2011, 2022]; bn = range(1, 9)
    ax.plot(yrs, list(bn), color=RED, lw=5, marker='o', ms=14)
    gaps = [None, 123, 33, 14, 13, 12, 12, 11]
    for y, b, g in zip(yrs, bn, gaps):
        ax.text(y + (4 if b == 1 else -3), b + 0.35, f'{b} bn ({y})', fontsize=17, fontweight='bold', ha='left' if b == 1 else 'right', color=NAVY)
        if g: ax.text(y + 2, b - 0.55, f'+{g} yrs', fontsize=15, fontweight='bold', color=GREEN)
    ax.set_xlim(1780, 2040); ax.set_ylim(0, 9.5); ax.set_ylabel('World population (billions)', fontsize=21, fontweight='bold'); ax.set_xlabel('Year', fontsize=21, fontweight='bold')
    ax.text(1790, 8.3, 'Each new billion comes faster', fontsize=22, fontweight='bold', color=RED)
    fig.subplots_adjust(bottom=0.17); fig.savefig(OUT + 'pop2_milestones.png', dpi=150, facecolor='white'); plt.close(fig)


def pop2_medc_ledc():
    table_big('pop2_medc_ledc.png', ['', 'MEDCs (Germany, Japan, USA)', 'LEDCs (Cameroon, Nigeria, Chad)'],
              [['Growth', 'slow, zero or negative', 'rapid'], ['Birth rate', 'low (8–12 ‰)', 'high (30–45 ‰)'], ['Death rate', 'low', 'falling fast'],
               ['Population', 'ageing', 'youthful'], ['Children seen as', 'a cost', 'help and security']], colw=[2.6, 4.7, 4.7], fs=18)


def pop2_garoua_calc():
    fig, ax = canvas('white')
    txt(ax, 6.4, 4.6, 'A town of 400,000 people in one year (hypothetical figures)', 21, NAVY)
    rows = [('CBR = 16,000 births ÷ 400,000 × 1,000', '= 40 ‰', GREEN), ('CDR = 4,000 deaths ÷ 400,000 × 1,000', '= 10 ‰', RED),
            ('RNI = (40 − 10) ÷ 10', '= 3 %', NAVY), ('Doubling time = 70 ÷ 3', '≈ 23 years', ORANGE)]
    for k, (a, b, c) in enumerate(rows):
        y = 3.7 - k * 0.95; txt(ax, 7.4, y, a, 21, c, ha='right'); txt(ax, 7.7, y, b, 24, c, ha='left')
    save(fig, 'pop2_garoua_calc.png')


def pop2_exercises():
    table_big('pop2_exercises.png', ['Exercise', 'Working', 'Answer'],
              [['CBR', '850 ÷ 50,000 × 1,000', '17 ‰'], ['CDR', '1,200 ÷ 150,000 × 1,000', '8 ‰'],
               ['Growth rate', '(35,000 + 5,000) ÷ 3,000,000 × 100', '≈ 1.33 %'], ['Doubling time', '70 ÷ 3', '≈ 23 years']],
              colw=[2.3, 7.4, 2.3], fs=17)


def pop2_demo_nondemo():
    fig, ax = canvas('white')
    box_(ax, 0.3, 3.8, 6.0, 0.8, 'DEMOGRAPHIC FACTORS', NAVY, fs=22); box_(ax, 6.6, 3.8, 5.9, 0.8, 'NON-DEMOGRAPHIC FACTORS', ORANGE, fs=22)
    for k, t in enumerate(['birth rate', 'death rate', 'migration (net)', 'age structure', 'marriage customs']): txt(ax, 3.3, 3.2 - k * 0.62, '• ' + t, 20, NAVY)
    for k, t in enumerate(['wars and conflicts', 'epidemics (AIDS, COVID-19)', 'disasters (floods, droughts)', 'medical services', 'policies and economy']): txt(ax, 9.55, 3.2 - k * 0.62, '• ' + t, 20, ORANGE)
    save(fig, 'pop2_demo_nondemo.png')


def pop2_region_growth():
    table_big('pop2_region_growth.png', ['Region', 'Births / deaths', 'Result'],
              [['Developing (Africa)', 'high births, falling deaths', 'rapid growth, young people'], ['Developed (Europe, Japan)', 'low births, low deaths', 'slow or negative growth, ageing'],
               ['Emerging (Brazil, Mexico)', 'falling births, low deaths', 'moderate growth, many workers'], ['Unstable (war zones)', 'high deaths, flight', 'sudden decline, refugees']],
              colw=[3.6, 4.0, 4.4], fs=17)


def pop2_explosion():
    fig, ax = canvas('white')
    box_(ax, 0.3, 3.8, 6.0, 0.8, 'POSITIVE CONSEQUENCES', GREEN, fs=22); box_(ax, 6.6, 3.8, 5.9, 0.8, 'NEGATIVE CONSEQUENCES', RED, fs=22)
    for k, t in enumerate(['large labour force', 'bigger markets (consumers)', 'more young innovators']): txt(ax, 3.3, 3.1 - k * 0.7, '• ' + t, 20, GREEN)
    for k, t in enumerate(['pressure on water, food, land', 'deforestation, pollution', 'unemployment', 'crowded schools and hospitals']): txt(ax, 9.55, 3.1 - k * 0.7, '• ' + t, 20, RED)
    save(fig, 'pop2_explosion.png')


# ---------- LESSONS 13-18 ----------
def pop2_selectivity():
    fig, ax = canvas('white')
    txt(ax, 6.4, 4.6, 'Who migrates? Migration is selective', 23, NAVY)
    for k, (t, s_, c) in enumerate([('AGE', 'young adults\n(18–35 years)', NAVY), ('SEX', 'men: manual jobs;\nwomen: nurses', '#C2185B'), ('SKILLS', 'doctors and\nengineers\n(brain drain)', GREEN),
                                     ('MARITAL STATUS', 'single people\nmove more', ORANGE), ('ETHNIC GROUP', 'chain migration\nto their own\ncommunity', '#6A1B9A')]):
        x = 0.2 + k * 2.5; box_(ax, x, 2.9, 2.35, 0.8, t, c, fs=16); txt(ax, x + 1.17, 1.9, s_, 16, c)
    save(fig, 'pop2_selectivity.png')


def pop2_gravity_calc():
    fig, ax = canvas('white')
    txt(ax, 6.4, 4.55, 'Gravity model:  M = k × Pi × Pj ÷ d²', 26, NAVY)
    txt(ax, 6.4, 3.6, 'City A = 500,000   City B = 100,000   d = 150 km   k = 1', 20, '#222')
    txt(ax, 6.4, 2.65, '500,000 × 100,000 ÷ 150²', 26, RED)
    txt(ax, 6.4, 1.75, '= 50,000,000,000 ÷ 22,500 ≈ 2,222,222', 26, GREEN)
    txt(ax, 6.4, 0.75, 'an index of interaction, not a number of people', 20, NAVY)
    save(fig, 'pop2_gravity_calc.png')


def pop2_stouffer_calc():
    fig, ax = canvas('white')
    txt(ax, 6.4, 4.55, 'Stouffer (simplified):  M = k × Oj ÷ Oint', 26, NAVY)
    for x, t, c in [(1.5, 'GAROUA\n(origin)', BROWN), (6.4, 'Ngaoundéré + Yaoundé\n20,000 jobs on the way', ORANGE), (11.2, 'DOUALA\n50,000 jobs', BLUE)]:
        txt(ax, x, 3.1, t, 18, c)
    arrow(ax, (2.6, 3.1), (4.2, 3.1), c='#555', lw=4); arrow(ax, (8.6, 3.1), (10.1, 3.1), c='#555', lw=4)
    txt(ax, 6.4, 1.75, '50,000 ÷ 20,000 = 2.5', 28, GREEN)
    txt(ax, 6.4, 0.8, 'the more opportunities on the way, the fewer migrants reach Douala', 19, RED)
    save(fig, 'pop2_stouffer_calc.png')


def pop2_ullman4():
    fig, ax = canvas('white')
    for k, (t, s_, c) in enumerate([('COMPLEMENTARITY', 'surplus here,\ndemand there\n(cotton to Douala)', GREEN), ('TRANSFERABILITY', 'cheap and easy\nto move\n(onions by road)', BLUE),
                                     ('INTERVENING\nOPPORTUNITY', 'a nearer place\nreplaces the far one\n(university of Ngaoundéré)', ORANGE), ('DISTANCE DECAY', 'less interaction\nwith distance\n(friends nearby)', RED)]):
        x = 0.2 + k * 3.15; box_(ax, x, 3.3, 2.95, 1.1, t, c, fs=17); txt(ax, x + 1.47, 2.0, s_, 16, c)
    txt(ax, 6.4, 0.5, "Factors of spatial interaction (after Edward Ullman)", 20, NAVY)
    save(fig, 'pop2_ullman4.png')


def pop2_idp_refugee():
    fig, ax = canvas('white')
    ax.plot([6.4, 6.4], [0.4, 4.4], color='#333', lw=4, ls='--'); txt(ax, 6.4, 4.65, 'international border', 18, '#333')
    box_(ax, 0.4, 3.2, 5.4, 0.8, 'IDP (stays in the country)', ORANGE, fs=20)
    txt(ax, 3.1, 2.0, 'Mayo-Sava villagers\nwho fled to Mora\n(Far North, Cameroon)', 18, ORANGE)
    box_(ax, 7.0, 3.2, 5.4, 0.8, 'REFUGEE (crosses a border)', RED, fs=20)
    txt(ax, 9.7, 2.0, 'Nigerians in the\nMinawao camp;\nCentral Africans in the East', 18, RED)
    save(fig, 'pop2_idp_refugee.png')


def pop2_internal_types():
    table_big('pop2_internal_types.png', ['Type of internal migration', 'Example in Cameroon'],
              [['Rural–urban (rural exodus)', 'village of Adamawa → Douala'], ['Rural–rural', 'Mbororo herders moving south for pasture'], ['Urban–rural', 'retired civil servant back to his village'],
               ['Inter-urban', 'bank employee from Bafoussam to Garoua'], ['Intra-urban', 'family from the centre of Garoua to a new suburb'], ['Commuting (daily)', 'teacher from a suburb to the centre of Maroua']],
              colw=[5.0, 7.0], fs=17)


def pop2_curves():
    fig, axs = plt.subplots(1, 3, figsize=(12.8, 5.0), dpi=150); fig.subplots_adjust(0.03, 0.12, 0.99, 0.84, wspace=0.12)
    t = np.linspace(0, 10, 300); K = 1.0
    S = K / (1 + np.exp(-(t - 5) * 1.2))
    J = np.where(t < 6.3, 0.03 * np.exp(0.6 * t), np.nan); Jc = 0.03 * np.exp(0.6 * 6.3); J2 = np.where(t >= 6.3, 0.5 + (Jc - 0.5) * np.exp(-(t - 6.3) * 1.5) * np.cos((t - 6.3) * 2.2), np.nan)
    I = np.minimum(0.05 * np.exp(0.5 * t), K)
    for ax, (y, y2, ti, c) in zip(axs, [(S, None, 'S-curve:\nprogressive adjustment', GREEN), (J, J2, 'J-curve: overshoot\nand crash (oscillation)', RED), (I, None, 'Instantaneous\nadjustment', NAVY)]):
        ax.plot(t, y, color=c, lw=5)
        if y2 is not None: ax.plot(t, y2, color=c, lw=5)
        ax.axhline(K, color='#555', ls='--', lw=2.5); ax.text(0.2, K + 0.05, 'carrying capacity (K)', fontsize=15, fontweight='bold', color='#555')
        ax.set_ylim(0, 1.5); ax.set_xticks([]); ax.set_yticks([]); ax.set_title(ti, fontsize=19, fontweight='bold', color=c); ax.set_xlabel('time', fontsize=17, fontweight='bold')
    fig.savefig(OUT + 'pop2_curves.png', dpi=150, facecolor='white'); plt.close(fig)


def pop2_regimes3():
    fig, ax = canvas('white')
    for k, (t, s_, c) in enumerate([('OVERPOPULATION', 'people > carrying capacity\nresources destroyed\n(parts of the Sahel)', RED), ('SUSTAINABLE', 'people ≤ carrying capacity\nbalance, high living standards\n(Norway, Sweden)', GREEN),
                                     ('UNDERPOPULATION', 'people far below capacity\nresources unused\n(North Canada, Siberia)', BLUE)]):
        x = 0.3 + k * 4.15; box_(ax, x, 3.2, 3.9, 0.9, t, c, fs=20); txt(ax, x + 1.95, 1.8, s_, 17, c)
    save(fig, 'pop2_regimes3.png')


def pop2_malthus_boserup():
    table_big('pop2_malthus_boserup.png', ['', 'MALTHUS (1798)', 'BOSERUP (1965)'],
              [['View', 'pessimistic', 'optimistic'], ['Population growth', 'a threat to food supply', 'a stimulus to invent'],
               ['Food supply', 'grows arithmetically', 'rises with new methods'], ['Outcome', 'famine, war, disease (checks)', 'intensification, development'],
               ['Weakness', 'forgot technology', 'forgot environmental limits']], colw=[3.2, 4.4, 4.4], fs=18)


if __name__ == '__main__':
    only = sys.argv[1:]
    for n, f in list(globals().items()):
        if n.startswith('pop2_') and callable(f) and (not only or n in only): f(); print('ok', n)
