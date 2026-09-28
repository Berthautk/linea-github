"""Big-label diagrams for the revised Lower Sixth Meteorology (teacher's support, 2026)."""
import sys
from big_common import *
from big_usa_pop import box_, table_big
from big_geo2 import cols, txt


def met2_gases():
    cols('met2_gases.png', 'Composition of the atmosphere', ['CONSTANT GASES', 'VARIABLE GASES', 'AEROSOLS'],
         ['nitrogen 78 %\noxygen 21 %\nargon 0.9 %', 'water vapour (0–4 %)\ncarbon dioxide\nmethane, ozone', 'liquid: droplets\nsolid: dust, salt,\npollen, ash, soot'], [NAVY, GREEN, BROWN], 20)


def met2_homo():
    fig, ax = canvas('#0B1F3A')
    ax.add_patch(Rectangle((0, 0), 12.8, 3.1, color='#1E5AA8')); ax.add_patch(Rectangle((0, 3.1), 12.8, 1.9, color='#0B1F3A'))
    ax.plot([0, 12.8], [3.1, 3.1], color='white', lw=3, ls='--')
    txt(ax, 6.4, 1.6, 'HOMOSPHERE (0 – about 80 km)\ngases well mixed: 78 % N₂, 21 % O₂', 22, 'white')
    txt(ax, 6.4, 4.05, 'HETEROSPHERE (above 80 km)\ngases in layers by weight: nitrogen, oxygen, helium, hydrogen at the top', 18, '#FFD54F')
    save(fig, 'met2_homo.png')


def met2_layers():
    table_big('met2_layers.png', ['Layer', 'Height', 'Temperature', 'Key facts'],
              [['Troposphere', '0 – 8/18 km', 'falls (6.5 °C/km)', 'weather, clouds, 75 % of the air'], ['Stratosphere', 'to 50 km', 'rises', 'ozone layer, calm, dry'],
               ['Mesosphere', '50 – 80 km', 'falls to about −90 °C', 'meteors burn up'], ['Thermosphere', 'above 80 km', 'rises above 1,000 °C', 'aurora, space station']],
              colw=[2.4, 2.2, 3.0, 4.4], fs=15)


def met2_ozone():
    cols('met2_ozone.png', 'Protecting the ozone layer', ['MONTREAL PROTOCOL (1987)', 'NO CFC PRODUCTS', 'AWARENESS'],
         ['ozone-destroying\nchemicals phased\nout worldwide', 'old fridges, air\nconditioners and\nsprays collected', 'education, safe\nalternatives,\nsun protection'], [NAVY, GREEN, ORANGE], 19)


def met2_albedo():
    table_big('met2_albedo.png', ['Surface', 'Albedo (reflected)', 'Effect'],
              [['Fresh snow', '80 – 90 %', 'stays cold'], ['Thick clouds', '60 – 90 %', 'cool days'], ['Dry sand (Sahara)', '30 – 40 %', 'hot but bright'],
               ['Savanna grass', '15 – 25 %', 'warms well'], ['Forest', '10 – 15 %', 'absorbs a lot'], ['Tarred road, sea', 'under 10 %', 'very hot / warm']],
              colw=[4.0, 3.6, 4.4], fs=17)


def met2_surplus():
    fig, ax = chart(); lat = np.linspace(-90, 90, 181)
    inc = 340 * np.cos(np.radians(lat)) ** 1.2 + 20; out = 200 + 40 * np.cos(np.radians(lat))
    ax.plot(lat, inc, color=RED, lw=5, label='incoming (solar)'); ax.plot(lat, out, color=BLUE, lw=5, label='outgoing (terrestrial)')
    ax.fill_between(lat, inc, out, where=inc > out, color='#FFCDD2'); ax.fill_between(lat, inc, out, where=inc <= out, color='#BBDEFB')
    ax.text(0, 300, 'SURPLUS', fontsize=24, fontweight='bold', color=RED, ha='center'); ax.text(-70, 150, 'DEFICIT', fontsize=22, fontweight='bold', color=BLUE, ha='center'); ax.text(70, 150, 'DEFICIT', fontsize=22, fontweight='bold', color=BLUE, ha='center')
    ax.axvline(9, color='#333', ls=':', lw=2); ax.text(11, 280, 'Garoua (9° N)', fontsize=17, fontweight='bold')
    ax.set_xlabel('Latitude (°S – °N)', fontsize=21, fontweight='bold'); ax.set_ylabel('Energy (W/m²)', fontsize=21, fontweight='bold'); ax.set_yticks([]); ax.legend(fontsize=14, loc='upper left')
    fig.subplots_adjust(bottom=0.17); fig.savefig(OUT + 'met2_surplus.png', dpi=150, facecolor='white'); plt.close(fig)


def met2_imbalance():
    cols('met2_imbalance.png', 'Why low latitudes receive more energy', ['ANGLE OF THE RAYS', 'ALBEDO', 'PATH THROUGH THE AIR', 'LENGTH OF DAY'],
         ['high sun: energy\nconcentrated\nlow sun: spread out', 'ice and snow\nreflect; forests\nand seas absorb', 'slanting rays cross\nmore air and\nlose more energy', 'long days in\nsummer, very\nshort in winter'], [RED, '#607D8B', ORANGE, NAVY], 17)


def met2_transfer():
    cols('met2_transfer.png', 'How heat moves', ['ADVECTION', 'CONDUCTION', 'CONVECTION', 'LATENT HEAT'],
         ['horizontal: winds\nand air masses\n(Harmattan)', 'by contact: hot\nground warms\nthe air touching it', 'warm air rises,\ncool air sinks', 'stored by\nevaporation,\nreleased in clouds'], [ORANGE, BROWN, RED, BLUE], 17)


def met2_geofactors():
    cols('met2_geofactors.png', 'Geographical factors of temperature', ['LAND / SEA', 'RELIEF', 'CURRENTS', 'WINDS', 'CLOUDS', 'TOWNS'],
         ['continentality:\ninland extremes', 'altitude and\naspect', 'warm Guinea,\ncold Benguela', 'Harmattan\nbrings heat', 'cool days,\nwarm nights', 'urban heat\nisland'], [BLUE, BROWN, '#00838F', ORANGE, '#607D8B', RED], 14)


def met2_elr():
    cols('met2_elr.png', 'Why temperature falls with height', ['HEATED FROM BELOW', 'DENSER AIR BELOW', 'PRESSURE AND EXPANSION'],
         ['the Sun heats the ground;\nthe ground heats the air\n(terrestrial radiation)', 'more gases, dust and\nwater vapour near the\nground absorb heat', 'rising air meets lower\npressure, expands\nand cools'], [RED, BROWN, BLUE], 17)


def met2_inv_causes():
    cols('met2_inv_causes.png', 'Conditions for a surface inversion', ['LONG NIGHTS', 'CLEAR SKIES', 'CALM AIR', 'DRY AIR'],
         ['more time for\nthe ground to\nlose heat', 'heat escapes\nto space', 'no wind to\nmix the layers', 'cools quickly\n(Harmattan)'], [NAVY, BLUE, GREEN, ORANGE], 18)


def met2_humidity():
    fig, ax = canvas('white')
    txt(ax, 6.4, 4.6, 'Relative humidity = actual vapour ÷ maximum vapour at that temperature × 100', 19, NAVY)
    for k, (t, cap, act, c) in enumerate([('30 °C (afternoon)', 30, 15, ORANGE), ('20 °C (early morning)', 17, 15, BLUE)]):
        x = 1.6 + k * 5.6
        ax.add_patch(Rectangle((x, 0.6), 2.2, 3.0 * cap / 30, fill=False, ec='#333', lw=3)); ax.add_patch(Rectangle((x, 0.6), 2.2, 3.0 * act / 30, color=c, alpha=0.7))
        txt(ax, x + 1.1, 0.3, t, 17, c); txt(ax, x + 3.3, 2.6, f'max {cap} g/m³\nhas {act} g/m³\nRH = {round(100 * act / cap)} %', 18, c, ha='left')
    save(fig, 'met2_humidity.png')


def met2_precip():
    table_big('met2_precip.png', ['Form', 'Description', 'Where / when'],
              [['Dew', 'droplets on cool surfaces (condensation)', 'grass, cars at dawn'], ['Fog / mist', 'cloud at ground level', 'Benue valley, cold mornings'],
               ['Drizzle', 'drops under 0.5 mm', 'stratus clouds'], ['Rain', 'drops over 0.5 mm', 'rainy season'], ['Hail', 'balls of ice', 'cumulonimbus storms'],
               ['Snow / frost', 'ice crystals', 'cold lands, high mountains']], colw=[2.4, 5.0, 4.6], fs=16)


def met2_rain_factors():
    cols('met2_rain_factors.png', 'Factors of the distribution of rainfall', ['PRESSURE BELTS', 'AIR MASSES', 'RELIEF', 'DISTANCE FROM SEA', 'VEGETATION'],
         ['low: rising air,\nrain\nhigh: sinking\nair, deserts', 'maritime: moist\ncontinental: dry', 'windward wet,\nleeward rain\nshadow', 'coasts wet,\ninterior drier', 'forests add\nvapour'], [NAVY, BLUE, BROWN, '#00838F', GREEN], 15)


# ---------- LESSONS 13-18, FS2 ----------
def met2_pressure():
    fig, ax = canvas('#EAF4FB')
    for x, t, c, up in [(3.2, 'LOW PRESSURE (cyclone)', RED, True), (9.6, 'HIGH PRESSURE (anticyclone)', BLUE, False)]:
        ax.add_patch(Rectangle((x - 2.6, 0.3), 5.2, 0.35, color='#8D6E63'))
        for dx in (-1.2, 0, 1.2):
            if up: arrow(ax, (x + dx, 1.0), (x + dx, 3.3), c=c, lw=5)
            else: arrow(ax, (x + dx, 3.3), (x + dx, 1.0), c=c, lw=5)
        txt(ax, x, 4.55, t, 20, c); txt(ax, x, 3.85, 'air rises: clouds, rain' if up else 'air sinks: clear, dry, calm', 18, '#333')
    save(fig, 'met2_pressure.png')


def met2_stab_rules():
    table_big('met2_stab_rules.png', ['Comparison of lapse rates', 'State of the air', 'Weather'],
              [['ELR greater than DALR (10 °C/km)', 'absolutely unstable', 'cumulonimbus, storms'], ['ELR between SALR (≈ 6 °C/km) and DALR', 'conditionally unstable', 'showers once saturated'],
               ['ELR smaller than SALR', 'absolutely stable', 'clear skies, fog, haze']], colw=[5.4, 3.4, 3.2], fs=14)


def met2_winds3():
    table_big('met2_winds3.png', ['Planetary wind', 'From → to', 'Direction (N. hemisphere)', 'Character'],
              [['Trade winds', '30° high → Equator', 'north-east', 'steady; dry over land (Harmattan)'], ['Westerlies', '30° high → 60° low', 'south-west (from the west)', 'variable, stormy, rain'],
               ['Polar easterlies', 'pole → 60° low', 'north-east', 'cold, dry, irregular']], colw=[2.4, 2.8, 3.2, 3.6], fs=13)


def met2_monsoon():
    cols('met2_monsoon.png', 'The monsoon: seasonal reversal of winds', ['SUMMER (WET) MONSOON', 'WINTER (DRY) MONSOON'],
         ['land hotter than sea: low\npressure over land\nwind from sea to land: rain\n(South-West monsoon, May–Oct)', 'land colder than sea: high\npressure over land\nwind from land to sea: dry\n(Harmattan, Nov–March)'], [BLUE, ORANGE], 18)


def met2_harmattan():
    cols('met2_harmattan.png', 'Effects of the Harmattan', ['NEGATIVE EFFECTS', 'POSITIVE EFFECTS'],
         ['dust haze, poor visibility (flights)\ncoughs, catarrh, asthma,\ncracked lips\nbush fires\ndust everywhere', 'cooler nights and mornings\ndrying of millet, beans, cotton\nfewer mosquitoes and\nless malaria'], [RED, GREEN], 18)


def met2_local():
    table_big('met2_local.png', ['Local wind', 'When', 'Direction', 'Cause'],
              [['Sea breeze', 'day', 'sea → land', 'land hotter: low pressure over land'], ['Land breeze', 'night', 'land → sea', 'land cooler: high pressure over land'],
               ['Anabatic (valley) wind', 'day', 'up the slopes', 'slopes heat the air'], ['Katabatic (mountain) wind', 'night', 'down the slopes', 'cold, heavy air drains down'],
               ['Foehn (Chinook)', 'any time', 'down the leeward side', 'dry air warms as it descends']], colw=[3.5, 1.4, 2.8, 4.3], fs=14)


def met2_am_cmr():
    table_big('met2_am_cmr.png', ['', 'Tropical continental (cT)', 'Tropical maritime (mT)'],
              [['Source', 'Sahara Desert', 'South Atlantic Ocean'], ['Character', 'hot, very dry, dusty, stable', 'warm, very moist, unstable'],
               ['Wind', 'Harmattan (north-east)', 'South-West monsoon'], ['Season in Garoua', 'dry season (Nov – March)', 'rainy season (May – Sept/Oct)']], colw=[2.8, 4.6, 4.6], fs=17)


def met2_obs():
    table_big('met2_obs.png', ['Element / tool', 'Instrument', 'Unit'],
              [['Temperature', 'thermometers (max–min) in a Stevenson screen', '°C'], ['Rainfall', 'rain gauge', 'mm'], ['Pressure', 'barometer', 'hPa (millibars)'],
               ['Wind', 'wind vane, anemometer', 'direction, km/h'], ['Humidity', 'hygrometer', '%'], ['Upper air', 'radiosonde (balloon)', 'several'],
               ['Storms, clouds', 'Doppler radar, satellites', 'images']], colw=[3.0, 6.0, 3.0], fs=15)


def met2_modif():
    cols('met2_modif.png', 'Weather modification', ['CLOUD SEEDING', 'HAIL SUPPRESSION', 'FOG DISPERSAL', 'HURRICANE MODIFICATION'],
         ['silver iodide or\ndry ice to make\nclouds rain', 'seeding to keep\nhailstones small', 'heating or dry ice\nto clear airports', 'experimental,\nnot practised'], [BLUE, NAVY, '#607D8B', RED], 16)


def met2_fronts():
    fig, ax = canvas('white')
    txt(ax, 6.4, 4.6, 'Symbols of a synoptic chart', 22, NAVY)
    x = np.linspace(0.5, 3.6, 7)
    ax.plot(x, [3.5] * 7, color=BLUE, lw=4)
    for xi in x[:-1] + 0.25: ax.add_patch(Polygon([(xi - 0.15, 3.5), (xi + 0.15, 3.5), (xi, 3.8)], color=BLUE))
    txt(ax, 2.0, 3.0, 'cold front', 18, BLUE)
    ax.plot(x + 4.5, [3.5] * 7, color=RED, lw=4)
    for xi in x[:-1] + 4.75: ax.add_patch(Wedge((xi, 3.5), 0.17, 0, 180, color=RED))
    txt(ax, 6.5, 3.0, 'warm front', 18, RED)
    ax.plot(x + 9.0, [3.5] * 7, color='#7B1FA2', lw=4)
    for i, xi in enumerate(x[:-1] + 9.25):
        if i % 2: ax.add_patch(Wedge((xi, 3.5), 0.17, 0, 180, color='#7B1FA2'))
        else: ax.add_patch(Polygon([(xi - 0.15, 3.5), (xi + 0.15, 3.5), (xi, 3.8)], color='#7B1FA2'))
    txt(ax, 11.0, 3.0, 'occluded front', 18, '#7B1FA2')
    for r in (0.5, 0.9, 1.3): ax.add_patch(Circle((3.0, 1.1), r * 0.8, fill=False, ec='#333', lw=2))
    txt(ax, 3.0, 1.1, 'L', 28, RED); txt(ax, 5.3, 1.1, 'isobars: lines of\nequal pressure', 17, '#333')
    for r in (0.5, 0.9, 1.3): ax.add_patch(Circle((9.8, 1.1), r * 0.8, fill=False, ec='#333', lw=2))
    txt(ax, 9.8, 1.1, 'H', 28, BLUE); txt(ax, 11.7, 1.1, 'close isobars:\nstrong winds', 15, '#333')
    save(fig, 'met2_fronts.png')


if __name__ == '__main__':
    only = sys.argv[1:]
    for n, f in list(globals().items()):
        if n.startswith('met2_') and callable(f) and (not only or n in only): f(); print('ok', n)
