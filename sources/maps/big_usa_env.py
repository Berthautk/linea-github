"""Big-label diagrams for Upper Sixth Environment and Development (Module 7). Values marked approximate are rounded for teaching."""
import sys
from big_common import *
from big_usa_pop import box_, table_big, regions, cm_base
from big_usa_eco import boxes4, boxes3, pts_map


def cycle_big(name, items, colors, centre=None, fs=16):
    fig, ax = canvas('white'); n = len(items); cx, cy, r = 6.4, 2.55, 1.95
    P = [(cx + 3.1 * np.cos(np.pi / 2 - 2 * np.pi * k / n), cy + r * np.sin(np.pi / 2 - 2 * np.pi * k / n)) for k in range(n)]
    for k in range(n):
        a, b = P[k], P[(k + 1) % n]
        ax.annotate('', xy=(a[0] + 0.72 * (b[0] - a[0]), a[1] + 0.72 * (b[1] - a[1])), xytext=(a[0] + 0.28 * (b[0] - a[0]), a[1] + 0.28 * (b[1] - a[1])), arrowprops=dict(arrowstyle='-|>', lw=3, color='#90A4AE', mutation_scale=24))
    for (x, y), t, c in zip(P, items, colors): box_(ax, x - 1.45, y - 0.36, 2.9, 0.72, t, c, fs=fs)
    if centre: ax.text(cx, cy, centre, fontsize=19, fontweight='bold', ha='center', va='center', color=NAVY)
    save(fig, name)


def two_cols(name, left, right, lc, rc, items_l, items_r, fs=17):
    fig, ax = canvas('white')
    box_(ax, 0.4, 4.0, 5.8, 0.8, left, lc, fs=21); box_(ax, 6.6, 4.0, 5.8, 0.8, right, rc, fs=21)
    for i, t in enumerate(items_l): ax.text(3.3, 3.45 - i * 0.72, t, fontsize=fs, fontweight='bold', ha='center', va='center', color=lc)
    for i, t in enumerate(items_r): ax.text(9.5, 3.45 - i * 0.72, t, fontsize=fs, fontweight='bold', ha='center', va='center', color=rc)
    ax.plot([6.4, 6.4], [0.3, 3.8], color='#CFD8DC', lw=3)
    save(fig, name)


# ---------- ENVIRONMENTAL DEGRADATION ----------
def env_pollution_big(): boxes4('env_pollution_big.png', [('AIR', '#607D8B', 'smoke, car fumes,\nburning waste'), ('WATER', BLUE, 'sewage, chemicals,\noil spills, plastics'),
                                                            ('LAND', BROWN, 'rubbish dumps, pesticides,\nmining waste'), ('NOISE', '#8E24AA', 'traffic, factories,\nloudspeakers')])


def acid_rain_big():
    fig, ax = canvas('#E3F2FD')
    ax.add_patch(Rectangle((0, 0), 12.8, 0.9, color='#8D6E63'))
    ax.add_patch(Rectangle((0.8, 0.9), 1.6, 1.4, color='#616161')); ax.add_patch(Rectangle((1.1, 2.3), 0.35, 1.3, color='#424242')); ax.add_patch(Rectangle((1.8, 2.3), 0.35, 1.0, color='#424242'))
    for x, y, s in [(1.3, 3.8, 0.3), (1.8, 4.1, 0.35), (2.4, 4.15, 0.33), (2.0, 3.5, 0.25)]: ax.add_patch(Circle((x, y), s, color='#9E9E9E', alpha=0.8))
    ax.text(1.6, 0.45, 'FACTORY / CARS', fontsize=15, fontweight='bold', ha='center', color='white')
    arrow(ax, (3.1, 4.0), (5.4, 4.0), c=ORANGE, lw=4); ax.text(4.25, 4.3, 'SO₂ and NOx gases', fontsize=16, fontweight='bold', ha='center', color=ORANGE)
    for x, y, s in [(6.6, 4.0, 0.5), (7.4, 4.2, 0.55), (8.3, 4.0, 0.5), (7.4, 3.8, 0.45)]: ax.add_patch(Circle((x, y), s, color='#78909C'))
    ax.text(7.4, 4.0, 'acid clouds', fontsize=16, fontweight='bold', ha='center', va='center', color='white')
    for x in np.arange(6.4, 9.6, 0.35): ax.plot([x, x - 0.15], [3.4, 2.4], color='#1E88E5', lw=2.5)
    ax.text(7.9, 2.9, 'ACID RAIN', fontsize=20, fontweight='bold', ha='center', color=RED, bbox=dict(fc='white', ec=RED, boxstyle='round'))
    ax.add_patch(Ellipse((10.8, 0.95), 3.0, 0.5, color='#4FC3F7')); ax.text(10.8, 0.45, 'lake: fish die', fontsize=15, fontweight='bold', ha='center', color='white')
    for x in (9.4, 9.9): ax.plot([x, x], [0.9, 2.2], color='#5D4037', lw=5); ax.plot([x - 0.3, x, x + 0.3], [2.4, 2.1, 2.5], color='#5D4037', lw=3)
    ax.text(9.65, 2.65, 'trees die', fontsize=15, fontweight='bold', ha='center', color=BROWN)
    ax.text(6.4, 0.45, 'wind carries gases far away', fontsize=15, fontweight='bold', ha='center', color='white')
    save(fig, 'acid_rain_big.png')


def pollution_table_big():
    table_big('pollution_table_big.png', ['Type', 'Main causes', 'Effects', 'Solutions'],
              [['Air', 'factories, cars, burning', 'lung diseases, acid rain', 'filters, clean fuels'], ['Water', 'sewage, chemicals, oil', 'cholera, fish die', 'treatment plants, laws'],
               ['Land', 'waste, pesticides, mines', 'poor soils, ugly land', 'recycling, safe dumps']], colw=[1.4, 3.6, 3.4, 3.6], fs=17)


def deforest_causes_big(): boxes4('deforest_causes_big.png', [('FARMING', GREEN, 'shifting cultivation,\nplantations, ranches'), ('LOGGING', BROWN, 'timber for export\nand local use'),
                                                                ('FUELWOOD', ORANGE, 'firewood and charcoal\nfor cooking'), ('MINING, ROADS, TOWNS', '#607D8B', 'clearing for projects\nand settlements')])


def desert_cycle_big():
    cycle_big('desert_cycle_big.png', ['Overgrazing', 'Plants disappear', 'Bare soil', 'Wind and water erosion', 'Less water in soil', 'Poorer land, lower yields'],
              [BROWN, GREEN, ORANGE, '#607D8B', BLUE, RED], 'DESERTIFICATION\nCYCLE', fs=14)


def sahel_map_big():
    fig, ax = map_axes([-20, 45, -5, 30])
    g = box(-18, 12, 42, 18)
    ax.add_geometries([land().intersection(g)], PC, facecolor='#FFB74D', edgecolor='none', alpha=0.8, zorder=5)
    ax.add_geometries([land().intersection(box(-18, 18, 42, 30))], PC, facecolor='#FFF59D', edgecolor='none', alpha=0.7, zorder=4)
    ax.add_geometries([country('Cameroon')], PC, facecolor='none', edgecolor=RED, lw=3, zorder=12)
    mlab(ax, 12, 24, 'SAHARA DESERT', fs=17, c=BROWN); mlab(ax, 5, 15, 'SAHEL: high risk of desertification', fs=16, c=RED)
    mlab(ax, 22, 3, 'forest zone', fs=15, c=GREEN); mlab(ax, 15.5, 8.5, 'Far North of Cameroon', fs=13, c=RED)
    msave(fig, 'sahel_map_big.png')


def erosion_types_big(): boxes4('erosion_types_big.png', [('SPLASH', BLUE, 'raindrops knock soil\nparticles loose'), ('SHEET', '#607D8B', 'a thin layer of soil\nwashed off evenly'),
                                                          ('RILL', ORANGE, 'small channels\n(a few cm deep)'), ('GULLY', RED, 'deep wide channels\n(metres deep)')])


def soil_conservation_big(): boxes4('soil_conservation_big.png', [('TERRACES', BROWN, 'steps on steep slopes\nslow the water'), ('CONTOUR PLOUGHING', GREEN, 'furrows across the slope\nhold rainwater'),
                                                                  ('COVER CROPS, MULCH', '#558B2F', 'soil is never bare'), ('TREES, NO BUSH FIRES', ORANGE, 'windbreaks, agroforestry,\ncontrolled grazing')])


# ---------- CLIMATE CHANGE ----------
def co2_temp_big():
    fig, ax = chart(); y = np.array([1960, 1970, 1980, 1990, 2000, 2010, 2020])
    ax.plot(y, [317, 326, 339, 354, 369, 390, 414], lw=6, marker='o', ms=9, color='#424242', label='CO₂ in the air (ppm)')
    ax.set_ylabel('CO₂ (ppm)', fontsize=19, fontweight='bold'); ax.set_ylim(300, 430)
    a2 = ax.twinx(); a2.plot(y, [-0.03, 0.02, 0.26, 0.45, 0.61, 0.82, 1.1], lw=6, marker='s', ms=9, color=RED, label='Temperature change (°C)'); a2.set_ylim(-0.2, 1.3)
    a2.set_ylabel('Warming since 1850–1900 (°C)', fontsize=17, fontweight='bold', color=RED); a2.tick_params(labelsize=20)
    ax.legend(loc='upper left', fontsize=17, frameon=False); a2.legend(loc='lower right', fontsize=17, frameon=False)
    ax.text(1960, 303, '(approximate)', fontsize=14, style='italic', color='#555')
    fig.savefig(OUT + 'co2_temp_big.png', dpi=150, facecolor='white'); plt.close(fig)


def climate_evidence_big(): boxes4('climate_evidence_big.png', [('WEATHER RECORDS', RED, 'thermometers since 1850:\nabout +1.1 °C'), ('ICE AND GLACIERS', BLUE, 'glaciers melt, ice cores\nshow past climates'),
                                                                ('SEA LEVEL', '#00838F', 'about 20 cm higher\nsince 1900'), ('PLANTS AND ANIMALS', GREEN, 'tree rings, pollen,\nspecies move')])


def climate_causes_big(): two_cols('climate_causes_big.png', 'NATURAL CAUSES', 'HUMAN CAUSES', BLUE, RED,
                                   ['changes in the Earth\'s orbit', 'changes in the sun\'s energy', 'volcanic eruptions (dust)', 'ocean currents (El Niño)'],
                                   ['burning coal, oil and gas', 'deforestation', 'cattle and rice fields (methane)', 'industry and fertilisers'])


def warming_impacts_big():
    table_big('warming_impacts_big.png', ['Area', 'Impacts of global warming'],
              [['Sea and coasts', 'sea-level rise, floods in Douala, Lagos, Bangladesh'], ['Farming', 'droughts in the Sahel, lower yields, new pests'], ['Health', 'heat waves, more malaria and cholera'],
               ['Nature', 'melting ice, coral bleaching, species lost'], ['Weather', 'stronger storms, floods and droughts']], colw=[3.0, 9.0], fs=18)


def mit_adapt_big(): two_cols('mit_adapt_big.png', 'MITIGATION (reduce causes)', 'ADAPTATION (live with it)', GREEN, ORANGE,
                              ['solar, wind and hydro power', 'plant trees, stop deforestation', 'save energy, public transport', 'Paris Agreement (2015)'],
                              ['drought-resistant crops', 'sea walls, flood warnings', 'water harvesting, irrigation', 'build away from floodplains'])


def flood_causes_big(): two_cols('flood_causes_big.png', 'PHYSICAL CAUSES', 'HUMAN CAUSES', BLUE, RED,
                                 ['heavy or long rain', 'snowmelt, storms (surges)', 'impermeable rock, saturated soil', 'flat low land, steep slopes'],
                                 ['urbanisation (concrete, tar)', 'deforestation', 'blocked drains, rubbish', 'building on floodplains'])


def flood_measures_big():
    table_big('flood_measures_big.png', ['', 'Hard engineering', 'Soft engineering'],
              [['Examples', 'dams, levees, channels', 'land-use zoning, trees, warnings'], ['Advantages', 'protects towns quickly', 'cheap, natural, lasts long'], ['Disadvantages', 'costly, can fail', 'slow, people must move']],
              colw=[2.4, 4.8, 4.8], fs=18)


# ---------- DEVELOPMENT ----------
VH = ['Norway', 'Switzerland', 'Iceland', 'Sweden', 'Denmark', 'Germany', 'Netherlands', 'Ireland', 'Australia', 'Finland', 'Belgium', 'New Zealand', 'Canada', 'United States of America', 'United Kingdom', 'Japan', 'South Korea',
      'Austria', 'France', 'Spain', 'Italy', 'Israel', 'Slovenia', 'Czechia', 'Estonia', 'Poland', 'Greece', 'Portugal', 'Lithuania', 'Latvia', 'Slovakia', 'Hungary', 'Croatia', 'Chile', 'Argentina', 'Saudi Arabia', 'United Arab Emirates',
      'Qatar', 'Kuwait', 'Bahrain', 'Oman', 'Russia', 'Uruguay', 'Romania', 'Bulgaria', 'Serbia', 'Belarus', 'Kazakhstan', 'Montenegro', 'Georgia', 'Turkey', 'Greenland', 'Taiwan', 'Singapore', 'Malaysia', 'Luxembourg', 'Cyprus']
LOW = ['Niger', 'Chad', 'Central African Rep.', 'S. Sudan', 'Somalia', 'Mali', 'Burkina Faso', 'Sierra Leone', 'Guinea', 'Mozambique', 'Burundi', 'Yemen', 'Dem. Rep. Congo', 'Liberia', 'Guinea-Bissau', 'Eritrea', 'Ethiopia',
       'Sudan', 'Malawi', 'Gambia', 'Madagascar', 'Afghanistan', 'Haiti', 'Senegal', 'Benin', 'Togo', 'Uganda', 'Rwanda', 'Nigeria', 'Lesotho', 'Mauritania', "Côte d'Ivoire", 'Tanzania', 'Pakistan', 'Djibouti', 'Somaliland']
MED = ['Cameroon', 'India', 'Bangladesh', 'Ghana', 'Kenya', 'Congo', 'Angola', 'Zambia', 'Zimbabwe', 'Morocco', 'Iraq', 'Nepal', 'Myanmar', 'Laos', 'Cambodia', 'Namibia', 'Eq. Guinea', 'Honduras', 'Nicaragua', 'Guatemala',
       'Tajikistan', 'Kyrgyzstan', 'Syria', 'Papua New Guinea', 'Bhutan', 'Timor-Leste', 'eSwatini', 'Solomon Is.', 'Venezuela', 'Comoros', 'São Tomé and Principe', 'Cabo Verde', 'Vanuatu', 'Kiribati', 'El Salvador', 'Bolivia', 'Philippines']


def hdi_map_big():
    fig, ax = map_axes([-170, 180, -58, 80])
    for n, g in countries():
        if n in ('Antarctica',): continue
        c = '#1B5E20' if n in VH else '#C62828' if n in LOW else '#FFB300' if n in MED else '#81C784'
        ax.add_geometries([g], PC, facecolor=c, edgecolor='white', lw=0.3, zorder=5)
    for i, (c, t) in enumerate([('#1B5E20', 'Very high HDI'), ('#81C784', 'High'), ('#FFB300', 'Medium (Cameroon)'), ('#C62828', 'Low')]):
        ax.add_patch(Rectangle((0.015, 0.36 - i * 0.075), 0.03, 0.05, color=c, transform=ax.transAxes, zorder=30)); ax.text(0.052, 0.385 - i * 0.075, t, transform=ax.transAxes, fontsize=16, fontweight='bold', va='center', color=NAVY, zorder=30)
    ax.text(0.99, 0.02, 'Human Development Index (approximate, UNDP)', transform=ax.transAxes, ha='right', fontsize=14, style='italic', color='#333', zorder=30, bbox=dict(fc='white', ec='none', alpha=0.8))
    msave(fig, 'hdi_map_big.png')


def dev_indicators_big():
    table_big('dev_indicators_big.png', ['Country', 'GNI per person (US$)', 'Life expectancy', 'Literacy', 'HDI'],
              [['Norway', '85,000', '83', '99 %', '0.97'], ['China', '12,000', '78', '97 %', '0.79'], ['Cameroon', '1,600', '62', '78 %', '0.59'], ['Niger', '600', '62', '38 %', '0.39']],
              colw=[2.4, 3.2, 2.6, 2.0, 1.8], fs=19, note='Approximate values (World Bank, UNDP)')


def sustain_big():
    fig, ax = canvas('white')
    for (x, y), c, t in [((5.2, 3.2), GREEN, 'ENVIRONMENT\nprotect nature'), ((7.6, 3.2), BLUE, 'ECONOMY\njobs, income'), ((6.4, 1.5), ORANGE, 'SOCIETY\nhealth, education,\nequity')]:
        ax.add_patch(Circle((x, y), 1.75, color=c, alpha=0.35, zorder=2))
    for x, y, c, t in [(4.3, 3.8, GREEN, 'ENVIRONMENT'), (8.5, 3.8, BLUE, 'ECONOMY'), (6.4, 0.55, ORANGE, 'SOCIETY')]: ax.text(x, y, t, fontsize=19, fontweight='bold', ha='center', color=c, zorder=5)
    ax.text(6.4, 2.65, 'SUSTAINABLE\nDEVELOPMENT', fontsize=15, fontweight='bold', ha='center', va='center', color=NAVY, zorder=5)
    ax.text(10.9, 1.4, 'meet today\'s needs\nwithout harming\nfuture generations\n(Brundtland, 1987)', fontsize=15, fontweight='bold', ha='center', va='center', color=NAVY)
    save(fig, 'sustain_big.png')


def mdg_sdg_big():
    table_big('mdg_sdg_big.png', ['', 'MDGs (2000–2015)', 'SDGs (2015–2030)'],
              [['Number', '8 goals', '17 goals'], ['Main aims', 'hunger, schools, health', 'poverty, climate, peace'], ['Countries', 'mainly poor countries', 'all countries'],
               ['Results', 'extreme poverty halved', 'still in progress']], colw=[2.4, 4.8, 4.8], fs=18)


def epi_transition_big():
    fig, ax = chart(); t = np.linspace(0, 10, 200)
    inf = 80 / (1 + np.exp((t - 4.5) * 1.1)) + 8; deg = 70 / (1 + np.exp(-(t - 5.5) * 1.1)) + 10
    ax.plot(t, inf, lw=6, color=RED, label='Infectious diseases (malaria, cholera)'); ax.plot(t, deg, lw=6, color=NAVY, label='Degenerative diseases (heart, cancer, diabetes)')
    for x, s in [(1.5, 'Stage 1\npestilence\nand famine'), (5, 'Stage 2\nreceding\npandemics'), (8.5, 'Stage 3\ndegenerative\ndiseases')]: ax.text(x, 128, s, fontsize=15, fontweight='bold', ha='center', va='top', color='#555')
    ax.axvline(3.3, color='#BDBDBD'); ax.axvline(6.7, color='#BDBDBD')
    ax.set_xticks([]); ax.set_yticks([]); ax.set_ylim(0, 130); ax.set_xlabel('Time and development', fontsize=19, fontweight='bold'); ax.set_ylabel('Share of deaths', fontsize=19, fontweight='bold')
    ax.legend(fontsize=15, frameon=False, loc='upper center', bbox_to_anchor=(0.5, 0.8))
    fig.savefig(OUT + 'epi_transition_big.png', dpi=150, facecolor='white'); plt.close(fig)


def women_dev_big(): boxes4('women_dev_big.png', [('FOOD PRODUCERS', GREEN, 'most farm work in Africa\nis done by women'), ('HEALTH AND FAMILY', ORANGE, 'educated mothers have\nhealthier children'),
                                                  ('ECONOMY', BLUE, 'trade, crafts, savings\ngroups (njangi)'), ('OBSTACLES', RED, 'less land, credit\nand schooling')])


def nics_big():
    table_big('nics_big.png', ['Generation', 'Examples', 'Main industries'],
              [['1st (1960s)', 'South Korea, Taiwan, Singapore, Hong Kong', 'ships, steel, electronics'], ['2nd (1980s)', 'Malaysia, Thailand, Indonesia', 'electronics, cars, textiles'],
               ['3rd (1990s–)', 'China, India, Vietnam, Brazil, Mexico', 'software, cars, clothes']], colw=[2.4, 5.6, 4.0], fs=17)


def nic_strategies_big(): boxes4('nic_strategies_big.png', [('STRONG STATE', NAVY, 'plans, stability,\nsupport to firms'), ('EXPORT-LED', ORANGE, 'free zones, low taxes,\ncheap exports'),
                                                            ('SKILLED LABOUR', GREEN, 'education and\ntraining'), ('INVESTMENT', BLUE, 'foreign capital (TNCs),\nhigh savings, ports')])


# ---------- GLOBALISATION AND TRADE ----------
def glob_components_big(): boxes4('glob_components_big.png', [('TRADE', ORANGE, 'goods and services\nmove worldwide'), ('CAPITAL', GREEN, 'investment and TNCs\nin many countries'),
                                                              ('PEOPLE', '#8E24AA', 'migrants, tourists,\nworkers'), ('INFORMATION', BLUE, 'internet, phones,\ntelevision')])


def shrinking_world_big():
    fig, ax = chart(); n = ['1500–1840\nsailing ships', '1850–1930\nsteam ships\nand trains', '1950s\npropeller\nplanes', '1960s–today\njet planes']
    v = [16, 55, 500, 900]; b = ax.bar(range(4), v, color=['#8D6E63', '#607D8B', BLUE, NAVY], width=0.6)
    for i, x in enumerate(v): ax.text(i, x + 20, f'{x} km/h', fontsize=18, fontweight='bold', ha='center', color=NAVY)
    ax.set_xticks(range(4)); ax.set_xticklabels(n, fontsize=15, fontweight='bold'); ax.set_ylabel('Speed (km/h)', fontsize=19, fontweight='bold'); ax.set_ylim(0, 1050)
    ax.text(3.4, 980, '(approximate)', fontsize=14, style='italic', ha='right', color='#555')
    fig.subplots_adjust(bottom=0.25); fig.savefig(OUT + 'shrinking_world_big.png', dpi=150, facecolor='white'); plt.close(fig)


def glob_impacts_big():
    table_big('glob_impacts_big.png', ['', 'Positive', 'Negative'],
              [['Economic', 'jobs, investment, cheap goods', 'job losses, dependence on TNCs'], ['Social', 'ideas, education, phones', 'loss of local culture'], ['Environment', 'clean technology spreads', 'pollution, more transport']],
              colw=[2.4, 4.8, 4.8], fs=18)


def triad_big():
    fig, ax = map_axes([-130, 150, -40, 65])
    C = {'N. America': (-98, 40), 'Europe': (10, 50), 'East Asia': (118, 33)}
    for k, (x, y) in C.items(): ax.add_patch(Circle((x, y), 11, color=NAVY, alpha=0.75, transform=PC, zorder=10)); mlab(ax, x, y - 16, k, fs=15, c=NAVY)
    for a, b in [('N. America', 'Europe'), ('Europe', 'East Asia'), ('N. America', 'East Asia')]:
        ax.plot(*zip(C[a], C[b]), color=RED, lw=6, transform=ccrs.Geodetic() if False else PC, zorder=8)
    for x, y, t in [(20, 2, 'Africa'), (-60, -15, 'Latin America'), (48, 26, 'Middle East (OPEC)')]:
        ax.annotate('', xy=(10, 45), xytext=(x, y), arrowprops=dict(arrowstyle='-|>', color=ORANGE, lw=3, mutation_scale=20), xycoords=PC._as_mpl_transform(ax), textcoords=PC._as_mpl_transform(ax)); mlab(ax, x, y - 5, t, fs=13, c=ORANGE)
    ax.text(0.01, 0.05, 'Red: the TRIAD (most world trade).  Orange: raw materials to the North', transform=ax.transAxes, fontsize=15, fontweight='bold', color=NAVY, bbox=dict(fc='white', ec='none', alpha=0.85))
    msave(fig, 'triad_big.png')


def comp_adv_big():
    table_big('comp_adv_big.png', ['Country', 'Cocoa (t per worker)', 'Cloth (m per worker)', 'Best choice'],
              [['Cameroon', '4', '2', 'specialise in cocoa'], ['Country B', '1', '6', 'specialise in cloth']], colw=[2.4, 3.2, 3.2, 3.2], fs=19,
              note='Each country makes what it is relatively best at, then they trade (hypothetical)')


def balance_big():
    table_big('balance_big.png', ['Term', 'Meaning', 'Example'],
              [['Balance of trade', 'exports − imports of goods', '1,000 − 1,300 = −300'], ['Balance of payments', 'all money in − all money out', 'goods, services, loans, aid'],
               ['Surplus', 'more money in than out', 'China'], ['Deficit', 'more money out than in', 'Cameroon (often)']], colw=[3.4, 4.6, 4.0], fs=17)


def cmr_trade_big():
    fig, ax = chart(); n = ['Crude oil', 'Cocoa', 'Timber', 'Gas (LNG)', 'Cotton', 'Bananas, coffee, others']; v = [35, 20, 12, 10, 5, 18]
    ax.barh(range(6)[::-1], v, color=['#424242', '#6D4C41', '#8D6E63', '#607D8B', '#FFB74D', GREEN])
    for i, x in enumerate(v): ax.text(x + 0.6, 5 - i, f'{x} %', fontsize=19, fontweight='bold', va='center', color=NAVY)
    ax.set_yticks(range(6)[::-1]); ax.set_yticklabels(n, fontsize=18, fontweight='bold'); ax.set_xlabel('% of export value', fontsize=19, fontweight='bold'); ax.set_xlim(0, 42)
    ax.text(41, 0, '(approximate)', fontsize=14, style='italic', ha='right', color='#555'); fig.subplots_adjust(left=0.3)
    fig.savefig(OUT + 'cmr_trade_big.png', dpi=150, facecolor='white'); plt.close(fig)


CEMAC = ['Cameroon', 'Chad', 'Central African Rep.', 'Congo', 'Gabon', 'Eq. Guinea']
ECOWAS = ['Nigeria', 'Ghana', "Côte d'Ivoire", 'Senegal', 'Benin', 'Togo', 'Liberia', 'Sierra Leone', 'Guinea', 'Guinea-Bissau', 'Gambia', 'Cabo Verde', 'Mali', 'Burkina Faso', 'Niger']


def blocs_africa_big():
    fig, ax = map_axes([-20, 32, -8, 26])
    for n, g in countries():
        if n in CEMAC: ax.add_geometries([g], PC, facecolor='#43A047', edgecolor='white', lw=1, zorder=5)
        elif n in ECOWAS: ax.add_geometries([g], PC, facecolor='#FFA726', edgecolor='white', lw=1, zorder=5)
    mlab(ax, 15, 1.5, 'CEMAC (1994)\n6 countries, CFA franc', fs=14, c=GREEN); mlab(ax, -6, 17.5, 'ECOWAS (1975)\n15 countries (2023)', fs=14, c=ORANGE)
    mlab(ax, 12.5, 6.2, 'Cameroon', fs=12, c=RED)
    ax.text(0.99, 0.02, 'Mali, Burkina Faso and Niger announced their exit in 2024', transform=ax.transAxes, ha='right', fontsize=12, style='italic', color='#333', zorder=30, bbox=dict(fc='white', ec='none', alpha=0.8))
    msave(fig, 'blocs_africa_big.png')


def blocs_table_big():
    table_big('blocs_table_big.png', ['Category', 'Meaning', 'Example'],
              [['Free trade area', 'no taxes between members', 'AfCFTA, USMCA'], ['Customs union', 'free trade + common outside tax', 'CEMAC, ECOWAS'], ['Common market', 'also free movement of people, capital', 'EAC'],
               ['Economic union', 'also common money and policies', 'European Union, CEMAC (CFA)']], colw=[2.8, 5.0, 4.2], fs=17)


def coffee_chain_big():
    fig, ax = chart(); n = ['Farmer', 'Local trader,\nexporter', 'Shipping,\nroasting', 'Shops, cafés,\ntaxes']; v = [7, 8, 25, 60]
    ax.bar(range(4), v, color=[GREEN, '#8D6E63', BLUE, NAVY], width=0.6)
    for i, x in enumerate(v): ax.text(i, x + 1.5, f'{x} %', fontsize=20, fontweight='bold', ha='center', color=NAVY)
    ax.set_xticks(range(4)); ax.set_xticklabels(n, fontsize=16, fontweight='bold'); ax.set_ylabel('Share of the final price (%)', fontsize=17, fontweight='bold'); ax.set_ylim(0, 70)
    ax.text(3.4, 66, 'Who earns from a cup of coffee? (approximate)', fontsize=15, style='italic', ha='right', color='#555')
    fig.subplots_adjust(bottom=0.2); fig.savefig(OUT + 'coffee_chain_big.png', dpi=150, facecolor='white'); plt.close(fig)


def terms_trade_big():
    fig, ax = chart(); y = [1980, 1990, 2000, 2010, 2020]
    ax.plot(y, [10, 16, 22, 26, 30], lw=6, marker='o', ms=9, color=RED, label='Bags of cocoa needed to buy one tractor')
    ax.set_ylabel('Bags of cocoa', fontsize=19, fontweight='bold'); ax.legend(fontsize=17, frameon=False, loc='upper left'); ax.text(2020, 11, '(hypothetical)', fontsize=14, style='italic', ha='right', color='#555')
    fig.savefig(OUT + 'terms_trade_big.png', dpi=150, facecolor='white'); plt.close(fig)


def wto_epa_big():
    table_big('wto_epa_big.png', ['', 'WTO', 'EPA'],
              [['Created', '1995 (replaced GATT)', 'EU + African, Caribbean, Pacific'], ['Aim', 'fair world trade rules', 'free trade with the EU'], ['Cameroon', 'member since 1995', 'interim EPA (2009, applied 2016)'],
               ['Criticism', 'rich countries dominate', 'local industries face EU competition']], colw=[2.2, 4.6, 5.2], fs=17)


def aid_types_big(): boxes4('aid_types_big.png', [('BILATERAL', NAVY, 'from one government\nto another'), ('MULTILATERAL', BLUE, 'through World Bank,\nIMF, UN agencies'),
                                                  ('VOLUNTARY (NGOs)', GREEN, 'charities: Red Cross,\nOxfam, Plan'), ('TIED / EMERGENCY', ORANGE, 'tied: must buy from donor;\nemergency: disasters')])


def aid_debate_big(): two_cols('aid_debate_big.png', 'FOR AID', 'AGAINST AID', GREEN, RED,
                               ['saves lives in disasters', 'builds schools, roads, wells', 'transfers skills and technology', 'fights disease (vaccines)'],
                               ['creates dependence and debt', 'tied aid helps the donor', 'corruption: aid is stolen', 'harms local farmers (food aid)'])


# ---------- FURTHER STUDY: CAMEROON ----------
def core_periphery_big():
    fig, ax = canvas('white')
    ax.add_patch(Circle((3.4, 2.5), 2.2, color='#FFE0B2')); ax.add_patch(Circle((3.4, 2.5), 0.9, color=RED)); ax.text(3.4, 2.5, 'CORE', fontsize=19, fontweight='bold', ha='center', va='center', color='white')
    ax.text(3.4, 0.75, 'PERIPHERY', fontsize=17, fontweight='bold', ha='center', color=ORANGE)
    for a in np.linspace(0, 2 * np.pi, 7)[:-1]: arrow(ax, (3.4 + 2.0 * np.cos(a), 2.5 + 2.0 * np.sin(a)), (3.4 + 1.0 * np.cos(a), 2.5 + 1.0 * np.sin(a)), c='#5D4037', lw=3)
    ax.text(6.3, 4.4, 'MYRDAL (1957): cumulative causation', fontsize=17, fontweight='bold', color=NAVY)
    ax.text(6.3, 3.75, '• Backwash: people, money and raw\n   materials flow to the core', fontsize=15, fontweight='bold', color=RED, va='top')
    ax.text(6.3, 2.55, '• Spread: later, growth reaches\n   the periphery', fontsize=15, fontweight='bold', color=GREEN, va='top')
    ax.text(6.3, 1.35, 'FRIEDMANN (1966): core-periphery\n4 stages → a balanced national space', fontsize=15, fontweight='bold', color=NAVY, va='top')
    save(fig, 'core_periphery_big.png')


def cmr_contrast_big():
    pts_map('cmr_contrast_big.png', [(9.7, 4.05, 'Douala (core)', RED, 's', -0.25), (11.52, 3.87, 'Yaoundé (core)', RED, 's', 0.25), (10.15, 5.95, 'Western Highlands', ORANGE, 'o', -0.25), (13.58, 7.32, 'Adamawa (lagging)', '#5D4037', 'v', 0.25),
                                     (13.7, 4.4, 'East (lagging)', '#5D4037', 'v', 0.25), (14.3, 10.6, 'Far North (lagging)', '#5D4037', 'v', 0.25)],
            [(RED, 's', 'Prosperous cores'), (ORANGE, 'o', 'Fairly developed'), ('#5D4037', 'v', 'Lagging regions')])


def cmr_dev_table_big():
    table_big('cmr_dev_table_big.png', ['Indicator', 'Coastal lowlands (Littoral)', 'Adamawa'],
              [['Density (per km²)', 'about 190', 'about 20'], ['Main activities', 'industry, port, services', 'cattle, farming'], ['Schools, hospitals', 'many', 'few'], ['Roads, electricity', 'good', 'limited']],
              colw=[3.4, 4.6, 4.0], fs=18, note='Approximate comparison')


ALL = [k for k in list(globals()) if k.endswith('_big') and k not in ('table_big', 'cycle_big')]
if __name__ == '__main__':
    for f in (sys.argv[1:] or ALL):
        try: globals()[f](); print('ok', f)
        except Exception as e: print('FAIL', f, repr(e))
