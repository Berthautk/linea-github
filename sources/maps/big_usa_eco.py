"""Big-label diagrams for Upper Sixth Economic Geography (Module 6). Values marked approximate are rounded for teaching."""
import sys
from big_common import *
from big_usa_pop import box_, table_big, regions, cm_base
from images2 import rivers
GR = '#F1F8E9'


def boxes4(name, items, fs=22, sfs=17):
    fig, ax = canvas('white')
    for k, (t, c, s) in enumerate(items):
        x = 0.3 + (k % 2) * 6.3; y = 2.6 - (k // 2) * 2.3; box_(ax, x, y + 1.1, 6.0, 0.9, t, c, fs=fs); ax.text(x + 3.0, y + 0.45, s, fontsize=sfs, fontweight='bold', ha='center', va='center', color=c)
    save(fig, name)


def boxes3(name, items, note=None, fs=20, sfs=17):
    fig, ax = canvas('white')
    for k, (t, c, s) in enumerate(items):
        x = 0.3 + k * 4.2; box_(ax, x, 3.3, 3.9, 1.2, t, c, fs=fs); ax.text(x + 1.95, 2.0, s, fontsize=sfs, fontweight='bold', ha='center', va='center', color=c)
    if note: lab(ax, 6.4, 0.5, note, fs=18, c=NAVY)
    save(fig, name)


def system_big(name, inputs, process, outputs, feedback=None):
    fig, ax = canvas('white')
    box_(ax, 4.6, 1.6, 3.6, 2.2, process, GREEN, fs=18)
    ax.text(1.6, 4.6, 'INPUTS', fontsize=20, fontweight='bold', ha='center', color=NAVY); ax.text(11.2, 4.6, 'OUTPUTS', fontsize=20, fontweight='bold', ha='center', color=RED)
    for i, t in enumerate(inputs): y = 3.9 - i * 0.75; ax.text(0.2, y, t, fontsize=17, fontweight='bold', va='center', color=NAVY); arrow(ax, (3.2, y), (4.55, 2.7), c='#90A4AE', lw=2, ms=16)
    for i, t in enumerate(outputs): y = 3.9 - i * 0.75; arrow(ax, (8.25, 2.7), (9.4, y), c='#90A4AE', lw=2, ms=16); ax.text(9.5, y, t, fontsize=17, fontweight='bold', va='center', color=RED)
    if feedback:
        ax.annotate('', xy=(4.0, 0.9), xytext=(9.0, 0.9), arrowprops=dict(arrowstyle='-|>', lw=3, color=ORANGE, connectionstyle='arc3,rad=0.25', mutation_scale=22))
        ax.text(6.4, 0.25, feedback, fontsize=16, fontweight='bold', ha='center', color=ORANGE)
    save(fig, name)


# ---------- RESOURCES AND AGRICULTURE ----------
def resources_big():
    fig, ax = canvas('white')
    box_(ax, 4.6, 4.0, 3.6, 0.8, 'NATURAL RESOURCES', NAVY, fs=19)
    box_(ax, 0.6, 2.4, 5.0, 0.9, 'RENEWABLE', GREEN, fs=22); box_(ax, 7.2, 2.4, 5.0, 0.9, 'NON-RENEWABLE', RED, fs=22)
    arrow(ax, (5.6, 3.95), (3.1, 3.35), c='#90A4AE', lw=2); arrow(ax, (7.2, 3.95), (9.7, 3.35), c='#90A4AE', lw=2)
    ax.text(3.1, 1.3, 'sun, wind, water, forests,\nsoils, fish (if well managed)', fontsize=17, fontweight='bold', ha='center', va='center', color=GREEN)
    ax.text(9.7, 1.3, 'oil, coal, gas,\nminerals (iron, bauxite, gold)', fontsize=17, fontweight='bold', ha='center', va='center', color=RED)
    save(fig, 'resources_big.png')


def agri_system_big(): system_big('agri_system_big.png', ['Land, soil, climate', 'Labour, seeds', 'Capital, machines', 'Fertiliser, water'], 'FARM\nploughing, sowing,\nweeding, harvesting', ['Crops, milk, meat', 'Income', 'Waste, erosion'], 'Feedback: profits are reinvested in the farm')


def agri_types_big():
    fig, ax = canvas('white')
    ax.text(4.2, 4.75, 'SUBSISTENCE (for the family)', fontsize=18, fontweight='bold', ha='center', color=GREEN); ax.text(9.9, 4.75, 'COMMERCIAL (for sale)', fontsize=18, fontweight='bold', ha='center', color=BLUE)
    ax.text(0.7, 3.3, 'INTENSIVE\nmuch input\nper hectare', fontsize=15, fontweight='bold', ha='center', va='center', color=RED); ax.text(0.7, 1.2, 'EXTENSIVE\nlittle input\nper hectare', fontsize=15, fontweight='bold', ha='center', va='center', color=ORANGE)
    for x, y, c, t in [(1.5, 2.35, '#C8E6C9', 'Wet rice in Asia\n(small plots, much labour)'), (7.2, 2.35, '#BBDEFB', 'Market gardens, dairy,\ngreenhouses (Netherlands)'),
                       (1.5, 0.2, '#DCEDC8', 'Shifting cultivation,\nnomadic herding (Sahel)'), (7.2, 0.2, '#E3F2FD', 'Wheat farms and cattle ranches\n(Canada, Argentina, Australia)')]:
        ax.add_patch(Rectangle((x, y), 5.5, 1.95, color=c, ec='white', lw=4)); ax.text(x + 2.75, y + 0.97, t, fontsize=17, fontweight='bold', ha='center', va='center', color='#222')
    save(fig, 'agri_types_big.png')


def influences_big(): boxes3('influences_big.png', [('PHYSICAL', GREEN, 'climate, relief,\nsoils, pests'), ('HUMAN', ORANGE, 'markets, capital, labour,\ntechnology, culture'), ('GOVERNMENT', NAVY, 'subsidies, quotas,\nland reform, research')], 'The farmer decides within these limits')


def vonthunen_big():
    fig, ax = canvas(GR)
    cols = [('#E53935', 'Market gardening, dairy'), ('#6D4C41', 'Forestry (wood)'), ('#FDD835', 'Arable crops'), ('#81C784', 'Livestock ranching')]
    for r, (c, _) in zip([2.3, 1.75, 1.2, 0.65][::-1], cols[::-1]): pass
    for r, (c, t) in zip([2.3, 1.75, 1.2, 0.65], cols[::-1]): ax.add_patch(Circle((3.0, 2.5), r, color=c, ec='white', lw=2))
    ax.add_patch(Circle((3.0, 2.5), 0.2, color='black')); ax.text(3.0, 2.5, '', fontsize=10)
    for k, (c, t) in enumerate(cols): ax.add_patch(Rectangle((6.2, 4.0 - k * 0.8), 0.45, 0.45, color=c)); ax.text(6.85, 4.22 - k * 0.8, f'{k + 1}. {t}', fontsize=19, fontweight='bold', va='center')
    ax.text(6.2, 0.6, 'City (market) in the centre;\nisolated state, flat land, one market', fontsize=16, fontweight='bold', color='#555')
    save(fig, 'vonthunen_big.png')


def rent_curves_big():
    fig = plt.figure(figsize=(12.8, 5.8), dpi=150); ax = fig.add_axes([0.09, 0.3, 0.88, 0.66]); d = np.linspace(0, 60, 300)
    crops = [('Vegetables', 400, 10, '#E53935'), ('Wheat', 250, 3.5, '#FDD835'), ('Cattle', 120, 1.2, '#81C784')]
    for n, a, b, c in crops: ax.plot(d, np.maximum(a - b * d, 0), lw=5, color=c, label=n)
    ax.set_xlim(0, 60); ax.set_ylim(0, 420); ax.set_ylabel('Locational rent', fontsize=19, fontweight='bold'); ax.tick_params(labelsize=15); ax.legend(fontsize=18, frameon=False)
    a2 = fig.add_axes([0.09, 0.08, 0.88, 0.14]); a2.set_xlim(0, 60); a2.axis('off'); a2.set_ylim(0, 1)
    for x0, x1, c, t in [(0, 23, '#E53935', 'Vegetables'), (23, 56, '#FDD835', 'Wheat'), (56, 60, '#81C784', '')]: a2.add_patch(Rectangle((x0, 0), x1 - x0, 1, color=c)); a2.text((x0 + x1) / 2, 0.5, t, fontsize=16, fontweight='bold', ha='center', va='center')
    fig.text(0.53, 0.01, 'Distance from the market (km) → the highest curve wins the land', fontsize=15, fontweight='bold', ha='center')
    fig.savefig(OUT + 'rent_curves_big.png', dpi=150, facecolor='white'); plt.close(fig)


def pw_rent_table_big():
    table_big('pw_rent_table_big.png', ['Crop', 'Yield (t/ha)', 'Price (F/t)', 'Cost (F/t)', 'Transport (F/t/km)'],
              [['Vegetables', '20', '60', '40', '0.5'], ['Wheat', '5', '100', '50', '0.7'], ['Cattle', '1', '300', '180', '1.2']], colw=[2.4, 2.2, 2.2, 2.2, 3.0], fs=19,
              note='LR = Y(P − C) − Y·T·d   e.g. vegetables at 10 km: 20(60 − 40) − 20 × 0.5 × 10 = 300')


def sinclair_big():
    fig, ax = chart(); d = np.linspace(0, 10, 200)
    for n, a, b, c in [('Dairy / grazing', 20, 1.5, '#81C784'), ('Arable', 5, 3.0, '#FDD835'), ('Market gardening', -8, 5.0, '#E53935')]: ax.plot(d, a + b * d, lw=5, color=c, label=n)
    ax.axvspan(0, 2.5, color='#ECEFF1'); ax.text(1.25, 32, 'Urban\nshadow', fontsize=17, fontweight='bold', ha='center', color='#555')
    ax.set_xlabel('Distance from the expanding city', fontsize=19, fontweight='bold'); ax.set_ylabel('Value of farm land use', fontsize=19, fontweight='bold'); ax.set_xticks([]); ax.set_yticks([]); ax.legend(fontsize=17, frameon=False, loc='lower right')
    ax.text(5, 50, 'Near a growing city, farmers expect to sell land for building,\nso they invest little: value rises with distance', fontsize=15, fontweight='bold', color=NAVY)
    fig.savefig(OUT + 'sinclair_big.png', dpi=150, facecolor='white'); plt.close(fig)


def green_rev_big():
    table_big('green_rev_big.png', ['Green Revolution', 'Examples / effects'],
              [['Aspects', 'high-yield seeds (HYVs), fertiliser, irrigation, pesticides'], ['Advantages', 'yields doubled or tripled (India, Mexico, Philippines)'], ['Disadvantages', 'costly inputs, pollution, rich farmers gain most'], ['New Green Revolution', 'GM crops, biotechnology, drip irrigation']],
              colw=[3.4, 8.6], fs=18)


def cereal_yield_big():
    fig, ax = chart(); y = [1960, 1970, 1980, 1990, 2000, 2010, 2020]
    for n, v, c in [('East Asia', [1.4, 2.0, 2.8, 3.9, 4.6, 5.4, 6.1], '#E65100'), ('South Asia', [0.9, 1.1, 1.4, 1.9, 2.3, 2.8, 3.3], NAVY), ('Sub-Saharan Africa', [0.8, 0.9, 1.0, 1.0, 1.1, 1.3, 1.5], GREEN)]:
        ax.plot(y, v, lw=6, marker='o', ms=9, color=c, label=n)
    ax.set_ylabel('Cereal yield (tonnes per hectare)', fontsize=18, fontweight='bold'); ax.legend(fontsize=18, frameon=False); ax.text(2019, 0.3, '(approximate)', fontsize=14, style='italic', ha='right', color='#555')
    fig.savefig(OUT + 'cereal_yield_big.png', dpi=150, facecolor='white'); plt.close(fig)


def food_solutions_big(): boxes4('food_solutions_big.png', [('IMPROVE FARMING', GREEN, 'intensification (yields),\nextensification (new land)'), ('NEW FOOD SOURCES', ORANGE, 'food industry, fish farming,\nless waste'),
                                                                ('BETTER DISTRIBUTION', BLUE, 'roads, storage, markets,\nfood aid in crises'), ('RURAL AND POPULATION', NAVY, 'rural development,\nfamily planning')])


def agri_impacts_big():
    table_big('agri_impacts_big.png', ['Negative impacts', 'Positive impacts'],
              [['deforestation, bush fires', 'terraces and contour farming'], ['soil erosion, overgrazing', 'agroforestry, tree crops'], ['pollution by fertiliser and pesticides', 'wetland and landscape care'], ['loss of wildlife, water overuse', 'organic farming: no chemicals']], colw=[6.0, 6.0], fs=18)


# ---------- ENERGY AND MINERALS ----------
def energy_mix_big():
    fig, ax = chart(); s = ['Oil', 'Coal', 'Gas', 'Hydro', 'Nuclear', 'Wind, solar,\nother']; v = [31, 27, 23, 6, 4, 9]
    ax.bar(range(6), v, color=['#424242', '#212121', '#1565C0', '#0288D1', '#8E24AA', '#43A047'], width=0.65)
    for i, x in enumerate(v): ax.text(i, x + 0.6, f'{x} %', fontsize=20, fontweight='bold', ha='center')
    ax.set_xticks(range(6)); ax.set_xticklabels(s, fontsize=18, fontweight='bold'); ax.set_ylabel('% of world energy use', fontsize=19, fontweight='bold'); ax.set_ylim(0, 36)
    ax.text(5.4, 33, 'Fossil fuels ≈ 80 % (approximate)', fontsize=17, fontweight='bold', ha='right', color=RED)
    fig.subplots_adjust(bottom=0.2); fig.savefig(OUT + 'energy_mix_big.png', dpi=150, facecolor='white'); plt.close(fig)


def energy_class_big():
    fig, ax = canvas('white')
    box_(ax, 0.4, 3.4, 5.6, 0.9, 'NON-RENEWABLE (fossil, nuclear)', RED, fs=18); box_(ax, 6.8, 3.4, 5.6, 0.9, 'RENEWABLE (clean)', GREEN, fs=20)
    for i, t in enumerate(['Oil (petroleum)', 'Coal', 'Natural gas', 'Uranium (nuclear)']): ax.text(3.2, 2.8 - i * 0.6, t, fontsize=18, fontweight='bold', ha='center', color='#B71C1C')
    for i, t in enumerate(['Hydro-electric power (HEP)', 'Solar, wind', 'Geothermal, tidal, waves', 'Biomass (wood, biogas)']): ax.text(9.6, 2.8 - i * 0.6, t, fontsize=18, fontweight='bold', ha='center', color='#1B5E20')
    save(fig, 'energy_class_big.png')


def oil_producers_big():
    fig, ax = chart(); c = ['USA', 'Saudi\nArabia', 'Russia', 'Canada', 'Iraq', 'Nigeria', 'Cameroon']; v = [13, 10.5, 10.5, 5.8, 4.4, 1.5, 0.07]
    ax.bar(range(7), v, color=[NAVY] * 5 + [GREEN, RED], width=0.6)
    for i, x in enumerate(v): ax.text(i, x + 0.2, f'{x:g}', fontsize=18, fontweight='bold', ha='center')
    ax.set_xticks(range(7)); ax.set_xticklabels(c, fontsize=17, fontweight='bold'); ax.set_ylabel('Million barrels per day', fontsize=19, fontweight='bold'); ax.set_ylim(0, 15)
    ax.text(6.4, 13.5, '(approximate, 2020s)', fontsize=14, style='italic', ha='right', color='#555')
    fig.subplots_adjust(bottom=0.2); fig.savefig(OUT + 'oil_producers_big.png', dpi=150, facecolor='white'); plt.close(fig)


def mineral_class_big(): boxes4('mineral_class_big.png', [('METALLIC: ferrous', '#6D4C41', 'iron ore, manganese,\nnickel, cobalt'), ('METALLIC: non-ferrous', ORANGE, 'bauxite (aluminium),\ncopper, tin, gold'),
                                                           ('NON-METALLIC', BLUE, 'limestone, salt,\nphosphate, diamonds'), ('ENERGY MINERALS', '#212121', 'coal, oil, natural gas,\nuranium')])


def mining_methods_big():
    fig, ax = canvas('#DDEFFB')
    ax.add_patch(Rectangle((0, 0), W_, 3.2, color='#A1887F'))
    ax.add_patch(Polygon([(0.3, 3.2), (1.0, 2.2), (2.8, 2.2), (3.5, 3.2)], color='#DDEFFB')); ax.add_patch(Polygon([(1.0, 2.2), (1.4, 1.6), (2.4, 1.6), (2.8, 2.2)], color='#DDEFFB'))
    ax.text(1.9, 4.2, 'OPEN-CAST\n(near surface)', fontsize=15, fontweight='bold', ha='center', color=NAVY)
    ax.add_patch(Rectangle((4.8, 0.4), 0.35, 2.8, color='#424242')); ax.add_patch(Rectangle((5.15, 0.6), 1.6, 0.3, color='#424242')); ax.add_patch(Rectangle((5.15, 1.5), 1.2, 0.3, color='#424242'))
    ax.add_patch(Rectangle((6.2, 0.45), 0.8, 0.6, color='#212121')); ax.text(5.6, 4.2, 'SHAFT\n(deep ore)', fontsize=15, fontweight='bold', ha='center', color=NAVY)
    ax.add_patch(Polygon([(7.8, 3.2), (8.8, 4.3), (9.8, 3.2)], color='#8D6E63')); ax.add_patch(Rectangle((8.2, 2.4), 1.4, 0.35, color='#424242')); ax.text(8.8, 4.55, 'DRIFT / ADIT', fontsize=15, fontweight='bold', ha='center', color=NAVY)
    ax.add_patch(Rectangle((10.3, 2.9), 2.3, 0.3, color='#64B5F6')); ax.text(11.45, 4.2, 'PLACER / ALLUVIAL\n(river sands: gold)', fontsize=14, fontweight='bold', ha='center', color=NAVY)
    ax.add_patch(Rectangle((10.3, 0.5), 0.4, 2.6, color='#212121')); ax.text(11.7, 1.2, 'DRILLING\n(oil, gas)', fontsize=14, fontweight='bold', ha='center', color='white')
    save(fig, 'mining_methods_big.png')


def mineral_problems_big(): boxes4('mineral_problems_big.png', [('EXHAUSTION', RED, 'reserves run out;\nghost towns'), ('ENVIRONMENT', GREEN, 'land scars, polluted rivers,\ndeforestation'),
                                                                   ('PRICES', ORANGE, 'world prices rise and fall;\npoor countries lose'), ('CONSERVATION', BLUE, 'recycling, substitutes,\nless waste, laws')])


# ---------- INDUSTRY ----------
def industrial_system_big(): system_big('industrial_system_big.png', ['Raw materials', 'Labour, skills', 'Capital, power', 'Land, transport'], 'FACTORY\nprocessing,\nassembly', ['Finished products', 'Profits, wages', 'Waste, pollution'], 'Feedback: profits reinvested, new technology')


def industry_class_big(): boxes4('industry_class_big.png', [('PRIMARY', '#6D4C41', 'farming, mining,\nfishing, forestry'), ('SECONDARY', ORANGE, 'manufacturing:\nheavy and light industry'),
                                                               ('TERTIARY', BLUE, 'services: trade, transport,\nbanks, health'), ('QUATERNARY', '#8E24AA', 'research, information,\nhigh technology')])


def location_factors_big():
    fig, ax = canvas('white'); box_(ax, 4.9, 2.2, 3.0, 1.0, 'FACTORY', NAVY, fs=22)
    pts = [('Raw materials', 1.6, 4.3, '#6D4C41'), ('Market', 6.4, 4.6, RED), ('Power', 11.2, 4.3, ORANGE), ('Transport', 11.2, 1.0, BLUE), ('Labour', 6.4, 0.4, GREEN), ('Capital, land,\ngovernment', 1.6, 1.0, '#8E24AA')]
    for t, x, y, c in pts: lab(ax, x, y, t, fs=18, c=c); arrow(ax, (x + (0.9 if x < 6 else -0.9 if x > 7 else 0), y + (-0.3 if y > 2.5 else 0.3)), (6.4 + (x - 6.4) * 0.25, 2.7 + (y - 2.7) * 0.35), c='#90A4AE', lw=2, ms=16)
    save(fig, 'location_factors_big.png')


def weber_big():
    fig, ax = canvas('white')
    M, R1, R2 = (2.0, 0.8), (8.5, 0.8), (5.2, 4.4)
    ax.add_patch(Polygon([M, R1, R2], fill=False, ec=NAVY, lw=3))
    for p, t, c in [(M, 'Market', RED), (R1, 'Raw material 1', '#6D4C41'), (R2, 'Raw material 2', '#6D4C41')]: ax.plot(*p, 'o', ms=20, color=c); ax.text(p[0], p[1] - 0.45 if p[1] < 2 else p[1] + 0.3, t, fontsize=16, fontweight='bold', ha='center', color=c)
    ax.plot(5.0, 2.0, '*', ms=28, color=ORANGE); ax.text(5.35, 1.95, 'least-cost\nlocation', fontsize=15, fontweight='bold', color=ORANGE)
    ax.text(9.2, 4.2, 'Material index (MI) =', fontsize=17, fontweight='bold', color=NAVY); ax.text(9.2, 3.6, 'weight of materials ÷', fontsize=16, fontweight='bold', color=NAVY); ax.text(9.2, 3.2, 'weight of product', fontsize=16, fontweight='bold', color=NAVY)
    ax.text(9.2, 2.4, 'MI > 1: near raw materials', fontsize=15, fontweight='bold', color='#6D4C41'); ax.text(9.2, 1.9, 'MI < 1: near the market', fontsize=15, fontweight='bold', color=RED)
    save(fig, 'weber_big.png')


def mi_table_big():
    table_big('mi_table_big.png', ['Industry', 'Materials (t)', 'Product (t)', 'MI', 'Location'],
              [['Sugar (cane)', '8', '1', '8', 'near raw material'], ['Aluminium (bauxite)', '4', '1', '4', 'raw material, power'], ['Brewing (water added)', '0.2', '1', '0.2', 'near market'], ['Bakery', '1', '1', '1', 'footloose / either']],
              colw=[3.6, 2.2, 2.0, 1.2, 3.0], fs=18, note='MI = total weight of localised materials ÷ weight of the finished product')


def isodapanes_big():
    fig, ax = canvas(GR); P = (3.6, 2.5)
    for k, r in enumerate([0.7, 1.4, 2.1]):
        t = np.linspace(0, 2 * np.pi, 100); ax.plot(P[0] + r * 1.3 * np.cos(t), P[1] + r * np.sin(t), color=NAVY, lw=2.5, ls='--'); ax.text(P[0] + r * 1.3 * 0.72, P[1] + r * 0.72, f'+{(k + 1) * 10}', fontsize=15, fontweight='bold', color=NAVY, bbox=dict(fc='white', ec='none'))
    ax.plot(*P, '*', ms=26, color=ORANGE); ax.text(P[0], P[1] - 0.45, 'least transport\ncost point', fontsize=13, fontweight='bold', ha='center', color=ORANGE)
    ax.plot(6.2, 3.6, 'o', ms=16, color=GREEN); ax.text(6.45, 3.6, 'Cheap labour town:\nsaving = 25', fontsize=15, fontweight='bold', va='center', color=GREEN)
    ax.text(8.2, 2.0, 'Isodapane: line of equal\nextra transport cost.\nMove to the labour town if\nlabour saving > extra cost\n(critical isodapane)', fontsize=16, fontweight='bold', color=NAVY)
    save(fig, 'isodapanes_big.png')


def smith_big():
    fig, ax = chart(); d = np.linspace(0, 10, 200); cost = 60 + 0.8 * (d - 5) ** 2; rev = np.full_like(d, 75)
    ax.plot(d, cost, lw=5, color=RED, label='Total cost'); ax.plot(d, rev, lw=5, color=GREEN, label='Revenue (price)')
    ax.fill_between(d, cost, rev, where=rev > cost, color='#C8E6C9', alpha=0.7); ax.text(5, 69, 'profit', fontsize=19, fontweight='bold', ha='center', color=GREEN)
    for x in (5 - np.sqrt(15 / 0.8), 5 + np.sqrt(15 / 0.8)): ax.axvline(x, color='#555', ls='--', lw=2)
    ax.text(0.3, 88, 'Spatial margin', fontsize=16, fontweight='bold', color='#555'); ax.text(8.1, 88, 'Spatial margin', fontsize=16, fontweight='bold', color='#555')
    ax.set_xlabel('Location (distance)', fontsize=19, fontweight='bold'); ax.set_ylabel('Cost and revenue', fontsize=19, fontweight='bold'); ax.set_xticks([]); ax.set_yticks([]); ax.legend(fontsize=17, frameon=False, loc='upper center')
    ax.set_ylim(55, 95); fig.savefig(OUT + 'smith_big.png', dpi=150, facecolor='white'); plt.close(fig)


def losch_big():
    fig, ax = canvas('white')
    for cx in (2.2, 4.4):
        t = np.linspace(0, 2 * np.pi, 7); ax.add_patch(Polygon([(cx + 1.2 * np.cos(a), 2.5 + 1.2 * np.sin(a)) for a in t], color='#BBDEFB', ec=NAVY, lw=2)); ax.plot(cx, 2.5, 'o', ms=12, color=RED)
    ax.text(3.3, 0.7, 'Hexagonal market areas', fontsize=16, fontweight='bold', ha='center', color=NAVY)
    ax.text(6.6, 4.2, 'LÖSCH (1940):', fontsize=20, fontweight='bold', color=NAVY)
    for i, t in enumerate(['A firm seeks the location with the', 'largest market (maximum revenue),', 'not only the lowest cost.', 'Demand falls with distance, so', 'market areas become hexagons.']): ax.text(6.6, 3.5 - i * 0.55, t, fontsize=16, fontweight='bold', color='#333')
    save(fig, 'losch_big.png')


def lq_big():
    table_big('lq_big.png', ['Region', 'Textile workers', 'All workers', 'LQ'],
              [['North', '3,000', '50,000', '3.0'], ['Coast', '5,000', '250,000', '1.0'], ['Centre', '2,000', '200,000', '0.5'], ['Country', '10,000', '500,000', '—']],
              colw=[2.6, 3.4, 3.4, 2.6], fs=19, note='North: (3,000 ÷ 50,000) ÷ (10,000 ÷ 500,000) = 3.0.  LQ > 1 = concentrated')


def iron_steel_big():
    fig, ax = canvas('white')
    st = [('1800s: COALFIELD', '#212121', 'coal was the main\nraw material (heavy)'), ('1900s: ORE FIELD', '#6D4C41', 'less coal needed;\nnear iron ore'), ('1950s–today: COAST', BLUE, 'imported ore and coal\nby sea (Dunkirk, Taranto)')]
    for k, (t, c, s) in enumerate(st):
        x = 0.3 + k * 4.2; box_(ax, x, 3.3, 3.9, 1.0, t, c, fs=16); ax.text(x + 1.95, 2.1, s, fontsize=16, fontweight='bold', ha='center', va='center', color=c)
        if k < 2: arrow(ax, (x + 3.95, 3.8), (x + 4.2, 3.8), c='#555', lw=3, ms=18)
    lab(ax, 6.4, 0.6, 'The changing location of iron and steel', fs=18, c=NAVY)
    save(fig, 'iron_steel_big.png')


def industry_world_big():
    fig, ax = map_axes([-130, 150, -40, 65])
    for x, y, w, h, t, c in [(-85, 42, 22, 10, 'NE USA / Great Lakes', NAVY), (8, 50, 18, 10, 'W. Europe', NAVY), (139, 36, 8, 6, 'Japan', NAVY), (117, 30, 14, 14, 'China (factory of the world)', RED),
                             (127, 36, 3, 3, 'S. Korea', ORANGE), (104, 1.3, 4, 3, 'Singapore', ORANGE), (-47, -23, 8, 6, 'Brazil (NIC)', ORANGE), (78, 20, 10, 12, 'India', ORANGE)]:
        ax.add_patch(Ellipse((x, y), w, h, transform=PC, color=c, alpha=0.55, zorder=10)); mlab(ax, x, y - h / 2 - 5, t, fs=13, c=c)
    ax.text(0.01, 0.94, 'Blue: old industrial countries (AICs)   Red/orange: NICs and "Asian tigers"', transform=ax.transAxes, fontsize=15, fontweight='bold', color=NAVY, bbox=dict(fc='white', ec='none', alpha=0.85))
    msave(fig, 'industry_world_big.png')


def linkages_big():
    fig, ax = canvas('white'); box_(ax, 4.9, 2.1, 3.0, 1.1, 'CAR\nASSEMBLY', NAVY, fs=18)
    for t, x, y in [('Tyres', 1.3, 4.2), ('Glass', 1.3, 2.6), ('Steel', 1.3, 1.0)]: box_(ax, x - 1.0, y - 0.35, 2.0, 0.7, t, '#6D4C41', fs=16); arrow(ax, (x + 1.05, y), (4.85, 2.65), c='#90A4AE', lw=2)
    for t, x, y in [('Car dealers', 11.4, 4.2), ('Repair garages', 11.4, 2.6), ('Transport firms', 11.4, 1.0)]: box_(ax, x - 1.3, y - 0.35, 2.6, 0.7, t, BLUE, fs=15); arrow(ax, (7.95, 2.65), (x - 1.35, y), c='#90A4AE', lw=2)
    ax.text(2.2, 4.8, 'BACKWARD linkages', fontsize=16, fontweight='bold', ha='center', color='#6D4C41'); ax.text(10.6, 4.8, 'FORWARD linkages', fontsize=16, fontweight='bold', ha='center', color=BLUE)
    save(fig, 'linkages_big.png')


def deindust_big():
    fig, ax = chart(); y = [1970, 1980, 1990, 2000, 2010, 2020]
    ax.plot(y, [35, 30, 22, 17, 10, 8], lw=6, marker='o', ms=9, color=RED, label='UK: % of jobs in manufacturing')
    ax.plot(y, [10, 15, 20, 24, 27, 27], lw=6, marker='o', ms=9, color=GREEN, label='China: % of world manufacturing output')
    ax.set_ylabel('Percent', fontsize=20, fontweight='bold'); ax.legend(fontsize=17, frameon=False); ax.text(2020, 32, '(approximate)', fontsize=14, style='italic', ha='right', color='#555')
    fig.savefig(OUT + 'deindust_big.png', dpi=150, facecolor='white'); plt.close(fig)


def pollution_big(): boxes4('ind_pollution_big.png', [('AIR', '#607D8B', 'smoke, acid rain,\ngreenhouse gases'), ('WATER', BLUE, 'chemicals and waste\nin rivers and sea'), ('LAND', '#6D4C41', 'dumps, mine scars,\nloss of farmland'), ('SOLUTIONS', GREEN, 'filters, treatment plants,\nlaws, recycling, green industry')])


# ---------- TRANSPORT ----------
def transport_costs_big():
    fig, ax = chart(); d = np.linspace(0, 1000, 200)
    for n, a, b, c in [('Road', 20, 0.12, ORANGE), ('Rail', 60, 0.06, NAVY), ('Water', 110, 0.025, BLUE)]: ax.plot(d, a + b * d, lw=5, color=c, label=n)
    ax.axvline(160, color='#999', ls='--'); ax.axvline(670, color='#999', ls='--'); ax.text(60, 150, 'road\ncheapest', fontsize=15, fontweight='bold', ha='center', color=ORANGE); ax.text(400, 150, 'rail\ncheapest', fontsize=15, fontweight='bold', ha='center', color=NAVY); ax.text(850, 150, 'water\ncheapest', fontsize=15, fontweight='bold', ha='center', color=BLUE)
    ax.set_xlabel('Distance (km)', fontsize=19, fontweight='bold'); ax.set_ylabel('Cost per tonne', fontsize=19, fontweight='bold'); ax.set_yticks([]); ax.legend(fontsize=17, frameon=False, loc='lower right'); ax.set_ylim(0, 170)
    ax.text(990, 5, 'terminal cost = where each line starts', fontsize=14, style='italic', ha='right', color='#555')
    fig.savefig(OUT + 'transport_costs_big.png', dpi=150, facecolor='white'); plt.close(fig)


def tapering_big():
    fig, ax = chart(); d = np.linspace(1, 1000, 200)
    ax.plot(d, 60 + 0.08 * d, lw=5, color='#9E9E9E', ls='--', label='If cost rose evenly'); ax.plot(d, 60 + 12 * np.sqrt(d), lw=6, color=NAVY, label='Tapering: cost per km falls with distance')
    ax.step([0, 200, 400, 600, 800, 1000], [150, 200, 250, 290, 320, 340], where='post', lw=4, color=ORANGE, label='Stepped freight rates (zones)')
    ax.set_xlabel('Distance (km)', fontsize=19, fontweight='bold'); ax.set_ylabel('Total cost', fontsize=19, fontweight='bold'); ax.set_yticks([]); ax.legend(fontsize=16, frameon=False, loc='upper left')
    fig.savefig(OUT + 'tapering_big.png', dpi=150, facecolor='white'); plt.close(fig)


def pw_transport_big():
    table_big('pw_transport_big.png', ['Mode', 'Terminal cost (F/t)', 'Line cost (F/t/km)', 'Cost for 300 km'],
              [['Road', '2,000', '60', '2,000 + 60 × 300 = 20,000'], ['Rail', '6,000', '30', '6,000 + 30 × 300 = 15,000'], ['River', '10,000', '15', '10,000 + 15 × 300 = 14,500']],
              colw=[1.8, 2.7, 2.7, 4.8], fs=18, note='Total cost = terminal cost + (line cost × distance)   (hypothetical values)')


def modes_big():
    table_big('modes_big.png', ['Mode', 'Advantages', 'Disadvantages'],
              [['Head portage', 'cheap, reaches any place', 'slow, small loads'], ['Road', 'door to door, flexible', 'accidents, costly on long trips'], ['Rail', 'heavy loads, long distance', 'costly to build, fixed routes'], ['Water', 'cheapest for bulk goods', 'slow, needs ports'], ['Air', 'fastest, long distance', 'most expensive'], ['Pipeline', 'cheap for oil and gas', 'only liquids, fixed']],
              colw=[2.4, 4.8, 4.8], fs=16)


def network_terms_big():
    fig, ax = canvas(GR)
    N = {'A': (1.2, 3.8), 'B': (3.8, 4.2), 'C': (6.4, 3.0), 'D': (3.4, 1.2), 'E': (8.6, 4.2), 'F': (9.4, 1.0)}
    for a, b in [('A', 'B'), ('B', 'C'), ('A', 'D'), ('D', 'C'), ('C', 'E'), ('C', 'F'), ('B', 'D')]: ax.plot(*zip(N[a], N[b]), color='#424242', lw=4)
    for k, p in N.items(): ax.plot(*p, 'o', ms=24, color=RED); ax.text(*p, k, fontsize=15, fontweight='bold', color='white', ha='center', va='center')
    ax.text(10.4, 4.3, 'NODES (vertices):', fontsize=16, fontweight='bold', color=RED); ax.text(10.4, 3.9, 'towns, junctions = 6', fontsize=15, fontweight='bold', color=RED)
    ax.text(10.4, 3.0, 'LINKS (edges):', fontsize=16, fontweight='bold', color='#424242'); ax.text(10.4, 2.6, 'roads, rails = 7', fontsize=15, fontweight='bold', color='#424242')
    ax.text(10.4, 1.7, 'Beta index =', fontsize=16, fontweight='bold', color=NAVY); ax.text(10.4, 1.3, 'links ÷ nodes', fontsize=15, fontweight='bold', color=NAVY); ax.text(10.4, 0.9, '= 7 ÷ 6 ≈ 1.17', fontsize=15, fontweight='bold', color=NAVY)
    save(fig, 'network_terms_big.png')


def beta_scale_big():
    fig, ax = canvas('white')
    for k, (edges, t, c) in enumerate([([(0, 1), (1, 2), (2, 3)], 'β < 1: branching\n(poorly connected)', RED), ([(0, 1), (1, 2), (2, 3), (3, 0)], 'β = 1: one circuit', ORANGE), ([(0, 1), (1, 2), (2, 3), (3, 0), (0, 2), (1, 3)], 'β > 1: many circuits\n(well connected)', GREEN)]):
        x0 = 0.8 + k * 4.2; P = [(x0, 3.8), (x0 + 2.4, 3.8), (x0 + 2.4, 1.6), (x0, 1.6)]
        for a, b in edges: ax.plot(*zip(P[a], P[b]), color='#424242', lw=4)
        for p in P: ax.plot(*p, 'o', ms=18, color=c)
        ax.text(x0 + 1.2, 0.7, t, fontsize=16, fontweight='bold', ha='center', va='center', color=c)
    save(fig, 'beta_scale_big.png')


def shimbel_big():
    table_big('shimbel_big.png', ['', 'A', 'B', 'C', 'D', 'Shimbel (total)', 'König (max)'],
              [['A', '0', '1', '2', '1', '4', '2'], ['B', '1', '0', '1', '1', '3', '1'], ['C', '2', '1', '0', '1', '4', '2'], ['D', '1', '1', '1', '0', '3', '1']],
              colw=[1.0, 1.1, 1.1, 1.1, 1.1, 3.3, 3.3], fs=19, note='Number of links on the shortest path. Lowest Shimbel = most accessible node (B and D)')


def taaffe_big():
    fig, ax = canvas('white')
    for k, t in enumerate(['1. Scattered ports', '2. Lines of penetration', '3. Feeder routes', '4. Interconnection']):
        x0 = 0.25 + k * 3.15; ax.add_patch(Rectangle((x0, 0.9), 2.9, 3.3, color='#FFF8E1', ec='#90A4AE', lw=2)); ax.add_patch(Rectangle((x0, 0.9), 2.9, 0.45, color='#64B5F6'))
        ports = [(x0 + 0.5, 1.35), (x0 + 1.45, 1.35), (x0 + 2.4, 1.35)]
        for p in ports: ax.plot(*p, 'o', ms=12, color=RED)
        if k >= 1: ax.plot([x0 + 0.5, x0 + 0.9], [1.35, 3.8], color='#424242', lw=4); ax.plot([x0 + 2.4, x0 + 2.0], [1.35, 3.6], color='#424242', lw=4); ax.plot(x0 + 0.9, 3.8, 's', ms=10, color=NAVY); ax.plot(x0 + 2.0, 3.6, 's', ms=10, color=NAVY)
        if k >= 2:
            for a, b in [((x0 + 0.7, 2.5), (x0 + 0.2, 2.9)), ((x0 + 2.2, 2.5), (x0 + 2.7, 2.2)), ((x0 + 0.8, 3.2), (x0 + 1.4, 3.0))]: ax.plot(*zip(a, b), color='#795548', lw=2)
        if k >= 3: ax.plot([x0 + 0.9, x0 + 2.0], [3.8, 3.6], color='#424242', lw=4); ax.plot([x0 + 1.45, x0 + 1.4], [1.35, 3.0], color='#424242', lw=3)
        ax.text(x0 + 1.45, 4.5, t, fontsize=14, fontweight='bold', ha='center', color=NAVY)
    ax.text(6.4, 0.35, 'Taaffe, Morrill and Gould (1963): network growth in a developing country', fontsize=14, fontweight='bold', ha='center', color='#555')
    save(fig, 'taaffe_big.png')


# ---------- TOURISM ----------
def butler_big():
    fig, ax = chart(); t = np.linspace(0, 10, 300); v = 100 / (1 + np.exp(-(t - 4.5) * 1.2))
    ax.plot(t, v, lw=6, color=NAVY)
    for x0, x1, s in [(0, 1.5, 'Exploration'), (1.5, 3, 'Involvement'), (3, 5.5, 'Development'), (5.5, 7, 'Consolidation'), (7, 8.2, 'Stagnation')]:
        ax.axvline(x1, color='#BDBDBD', lw=1.5); ax.text((x0 + x1) / 2, 104, s, fontsize=13, fontweight='bold', ha='center', va='bottom', color=NAVY, rotation=0 if x1 - x0 > 2 else 40)
    ax.plot([8.2, 10], [100, 118], color=GREEN, lw=4, ls='--'); ax.plot([8.2, 10], [100, 60], color=RED, lw=4, ls='--')
    ax.text(9.9, 120, 'Rejuvenation', fontsize=15, fontweight='bold', ha='right', color=GREEN); ax.text(9.9, 50, 'Decline', fontsize=15, fontweight='bold', ha='right', color=RED)
    ax.set_xlabel('Time', fontsize=19, fontweight='bold'); ax.set_ylabel('Number of tourists', fontsize=19, fontweight='bold'); ax.set_xticks([]); ax.set_yticks([]); ax.set_ylim(0, 140)
    fig.savefig(OUT + 'butler_big.png', dpi=150, facecolor='white'); plt.close(fig)


def tourism_flows_big():
    fig, ax = map_axes([-130, 150, -40, 65])
    for x, y, t in [(2, 47, 'France'), (-3, 40, 'Spain'), (-98, 38, 'USA'), (110, 32, 'China'), (12, 43, 'Italy'), (35, 39, 'Türkiye'), (100, 14, 'Thailand'), (-6, 32, 'Morocco'), (25, -30, 'South Africa'), (37, 0, 'Kenya')]:
        ax.plot(x, y, 'o', ms=12, color=RED, transform=PC, zorder=20); mlab(ax, x, y + 5, t, fs=12, c=NAVY)
    for a, b in [((10, 52), (-3, 40)), ((10, 52), (12, 43)), ((-100, 45), (-80, 23)), ((5, 52), (37, 0)), ((10, 55), (100, 14)), ((0, 50), (-6, 32))]:
        ax.annotate('', xy=b, xytext=a, arrowprops=dict(arrowstyle='-|>', color=ORANGE, lw=3, mutation_scale=22, connectionstyle='arc3,rad=0.2'), xycoords=PC._as_mpl_transform(ax), textcoords=PC._as_mpl_transform(ax))
    ax.text(0.01, 0.05, 'Main destinations (red) and flows from rich countries (orange)', transform=ax.transAxes, fontsize=15, fontweight='bold', color=NAVY, bbox=dict(fc='white', ec='none', alpha=0.85))
    msave(fig, 'tourism_flows_big.png')


def tourism_impacts_big():
    table_big('tourism_impacts_big.png', ['', 'Positive', 'Negative'],
              [['Economic', 'jobs, foreign currency', 'seasonal jobs, profits leave'], ['Social / cultural', 'pride in culture, crafts', 'loss of traditions, crime'], ['Environmental', 'parks and reserves funded', 'waste, damaged reefs and parks'], ['Political', 'image of the country', 'insecurity scares tourists']],
              colw=[2.6, 4.7, 4.7], fs=17)


# ---------- CAMEROON MAPS ----------
def pts_map(name, pts, legend, lines=(), extra=None):
    fig, ax = cm_base(); R = regions()
    for n, g in R.items(): ax.add_geometries([g], PC, facecolor='#FAFAFA', edgecolor='#BDBDBD', lw=1)
    for ln, c, w in lines: ax.plot([p[0] for p in ln], [p[1] for p in ln], color=c, lw=w, transform=PC, zorder=15)
    if extra: extra(ax)
    for pt in pts:
        x, y, t, c, m, dx = pt[:6]; dy = pt[6] if len(pt) > 6 else 0.12
        ax.plot(x, y, m, ms=13, color=c, transform=PC, zorder=20, mec='white')
        if t: ax.text(x + dx, y + dy, t, fontsize=12, fontweight='bold', transform=PC, zorder=21, color=c, ha='left' if dx >= 0 else 'right', bbox=dict(fc='white', ec='none', alpha=0.75, pad=0.5))
    for i, (c, m, t) in enumerate(legend):
        ax.plot([0.605, 0.635] if m == '-' else [0.62], [0.9 - i * 0.075] * (2 if m == '-' else 1), m, ms=14, lw=4, color=c, transform=ax.transAxes); ax.text(0.645, 0.9 - i * 0.075, t, transform=ax.transAxes, fontsize=16, fontweight='bold', va='center', color=NAVY)
    ax.text(0.99, 0.02, 'Simplified', transform=ax.transAxes, ha='right', fontsize=13, style='italic', color='#555')
    msave(fig, name)


def cmr_agri_big():
    R = regions(); g = lambda *n: unary_union([R[k] for k in n])
    fig, ax = cm_base()
    for geo, c in [(g('Centre', 'South', 'East'), '#8D6E63'), (g('West', 'North-West'), '#43A047'), (g('South-West', 'Littoral'), '#FDD835'), (g('Adamaoua'), '#AED581'), (g('North', 'Far North'), '#FFB74D')]:
        ax.add_geometries([geo], PC, facecolor=c, edgecolor='#555', lw=1)
    for i, (c, t) in enumerate([('#FDD835', 'Plantations: banana, palm, rubber, tea'), ('#8D6E63', 'Cocoa, robusta coffee, food crops'), ('#43A047', 'Arabica coffee, maize, vegetables'), ('#AED581', 'Cattle rearing'), ('#FFB74D', 'Cotton, millet, sorghum, groundnuts, cattle')]):
        ax.text(0.56, 0.88 - i * 0.085, '■', transform=ax.transAxes, fontsize=24, color=c, va='center'); ax.text(0.59, 0.88 - i * 0.085, t, transform=ax.transAxes, fontsize=15, fontweight='bold', va='center', color=NAVY)
    ax.text(0.99, 0.02, 'Simplified', transform=ax.transAxes, ha='right', fontsize=13, style='italic', color='#555')
    msave(fig, 'cmr_agri_big.png')


def cmr_forest_big():
    R = regions(); g = lambda *n: unary_union([R[k] for k in n])
    def ex(ax): ax.add_geometries([g('Centre', 'South', 'East', 'Littoral', 'South-West') - box(11.0, 5.3, 16.5, 7.0)], PC, facecolor='#A5D6A7', edgecolor='none', zorder=5)
    pts_map('cmr_forest_big.png', [(12.8, 3.2, 'Dja', GREEN, '^', 0.25), (16.0, 2.3, 'Lobéké', GREEN, '^', -0.25), (14.9, 2.6, 'Boumba-Bek', GREEN, '^', 0.25), (8.85, 5.1, 'Korup', GREEN, '^', -0.25), (10.0, 2.4, "Campo-Ma'an", GREEN, '^', 0.25),
                                   (13.68, 4.58, 'Bertoua', '#6D4C41', 's', 0.25), (13.3, 4.93, 'Bélabo', '#6D4C41', 's', 0.25), (9.7, 4.05, 'Douala (export)', RED, 'o', -0.25)],
            [(GREEN, '^', 'Protected areas'), ('#6D4C41', 's', 'Sawmills, timber centres'), (RED, 'o', 'Timber export port')], extra=ex)


def cmr_minerals_big():
    pts_map('cmr_minerals_big.png', [(8.7, 4.5, 'Oil (Rio del Rey)', '#212121', 'D', -0.25), (9.6, 2.7, 'Oil, gas (Kribi)', '#212121', 'D', -0.25), (9.75, 3.95, 'Gas (Logbaba)', '#212121', 'D', -0.25),
                                     (13.0, 6.9, 'Bauxite (Minim-Martap)', ORANGE, 'o', 0.25), (10.0, 5.5, 'Bauxite (Fongo-Tongo)', ORANGE, 'o', 0.25), (14.0, 2.1, 'Iron ore (Mbalam)', '#6D4C41', 's', 0.25),
                                     (13.6, 3.1, 'Cobalt, nickel (Lomié)', '#1565C0', 's', 0.25), (14.36, 4.43, 'Gold (Batouri)', '#F9A825', '*', 0.25), (14.08, 5.6, 'Gold (Bétaré-Oya)', '#F9A825', '*', 0.25), (13.96, 9.76, 'Limestone (Figuil)', '#9E9E9E', 'o', 0.25)],
            [('#212121', 'D', 'Oil and gas'), (ORANGE, 'o', 'Bauxite'), ('#6D4C41', 's', 'Iron ore'), ('#F9A825', '*', 'Gold'), ('#1565C0', 's', 'Cobalt, nickel')])


def cmr_water_big():
    def ex(ax): rivers(ax, {'Sanaga': 3, 'Benue': 3, 'Bénoué': 3, 'Chari': 3, 'Logone': 3})
    pts_map('cmr_water_big.png', [(10.4, 3.55, 'Edéa, Song Loulou (HEP)', BLUE, 's', 0.25, -0.2), (10.13, 3.8, '', BLUE, 's', -0.25), (13.5, 5.35, 'Lom Pangar (dam)', BLUE, 's', 0.25), (10.4, 2.4, "Memve'ele (HEP)", BLUE, 's', 0.25),
                                  (13.7, 9.05, 'Lagdo (HEP, irrigation, fish)', BLUE, 's', 0.25), (15.2, 10.35, 'SEMRY rice (Yagoua)', GREEN, 'o', -0.25), (14.95, 10.8, 'Maga (rice)', GREEN, 'o', -0.25),
                                  (10.4, 6.0, 'UNVDA rice (Ndop)', GREEN, 'o', 0.25), (14.2, 12.8, 'Lake Chad fishing', ORANGE, '^', 0.25), (9.2, 4.0, 'Sea fishing (Limbe)', ORANGE, '^', -0.25, 0.3)],
            [(BLUE, 's', 'Dams, hydro-electricity'), (GREEN, 'o', 'Irrigation schemes'), (ORANGE, '^', 'Fishing')], extra=ex)


def cmr_industry_big():
    pts_map('cmr_industry_big.png', [(9.7, 4.05, 'Douala: food, drinks, chemicals', RED, 'o', -0.25, 0.4), (10.13, 3.8, 'Edéa: aluminium', RED, 'o', -0.25, -0.45), (9.2, 4.0, 'Limbe: refinery', RED, 'o', -0.25, 0.05),
                                     (11.52, 3.87, 'Yaoundé: drinks, printing, wood', ORANGE, 'o', 0.25), (11.5, 3.5, 'Mbalmayo: wood', ORANGE, 'o', 0.25, -0.35), (10.42, 5.48, 'Bafoussam: coffee, food', GREEN, 'o', 0.25),
                                     (10.15, 5.96, 'Bamenda', GREEN, 'o', -0.25), (13.4, 9.3, 'Garoua: textiles, cotton', BLUE, 'o', -0.25), (14.32, 10.59, 'Maroua', BLUE, 'o', 0.25), (13.96, 9.76, 'Figuil: cement', BLUE, 'o', 0.25)],
            [(RED, 'o', 'Coastal region'), (ORANGE, 'o', 'Centre-South region'), (GREEN, 'o', 'Western region'), (BLUE, 'o', 'Northern region')])


def cmr_transport_big():
    rail = [(9.70, 4.05), (10.13, 3.80), (11.52, 3.87), (12.4, 4.4), (13.3, 4.93), (13.4, 6.2), (13.58, 7.32)]
    roads = [[(9.70, 4.05), (10.0, 4.9), (10.42, 5.48), (10.15, 5.96)], [(11.52, 3.87), (11.0, 4.7), (10.42, 5.48)], [(13.58, 7.32), (13.4, 9.3), (14.32, 10.59), (15.03, 12.08)], [(11.52, 3.87), (13.68, 4.58)], [(11.52, 3.87), (11.15, 2.9), (11.3, 2.2)], [(9.70, 4.05), (9.91, 2.94)], [(9.70, 4.05), (9.2, 4.0)]]
    pts_map('cmr_transport_big.png', [(9.7, 4.05, 'Douala (port, airport)', RED, 's', -0.25), (9.91, 2.94, 'Kribi deep-sea port', RED, 's', -0.25), (11.52, 3.87, 'Yaoundé (airport)', NAVY, '^', 0.25), (13.4, 9.3, 'Garoua (airport, river port)', NAVY, '^', -0.25), (13.58, 7.32, 'Ngaoundéré (railhead)', '#424242', 'o', 0.25)],
            [(RED, 's', 'Sea ports'), (NAVY, '^', 'Airports'), ('#424242', '-', 'Railway (Transcam)'), (ORANGE, '-', 'Main roads')], lines=[(rail, '#212121', 4)] + [(r, ORANGE, 3) for r in roads])


def cmr_tourism_big():
    pts_map('cmr_tourism_big.png', [(14.6, 11.2, 'Waza NP', GREEN, '^', 0.25), (13.8, 8.3, 'Bénoué NP', GREEN, '^', 0.25), (13.6, 10.6, 'Rhumsiki', '#6D4C41', 'o', -0.25), (10.9, 5.72, 'Foumban (culture)', '#8E24AA', 'o', 0.25),
                                    (9.2, 4.0, 'Limbe beaches', BLUE, 's', -0.25, -0.35), (9.17, 4.2, 'Mount Cameroon', '#6D4C41', 'o', -0.25, 0.35), (9.91, 2.94, 'Kribi, Lobé falls', BLUE, 's', -0.25), (12.8, 3.2, 'Dja reserve', GREEN, '^', 0.25), (8.85, 5.1, 'Korup NP', GREEN, '^', -0.25)],
            [(GREEN, '^', 'National parks'), (BLUE, 's', 'Beaches'), ('#6D4C41', 'o', 'Mountains, landscapes'), ('#8E24AA', 'o', 'Culture, chiefdoms')])


ALL = [k for k in list(globals()) if (k.endswith('_big') or k.endswith('_gif')) and k not in ('table_big', 'system_big')]
if __name__ == '__main__':
    for f in (sys.argv[1:] or ALL):
        try: globals()[f](); print('ok', f)
        except Exception as e: print('FAIL', f, repr(e))
