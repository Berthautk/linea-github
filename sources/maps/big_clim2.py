"""Big-label diagrams for the revised Lower Sixth Climatology (teacher's support, 2026)."""
import sys
from big_common import *
from big_usa_pop import box_, table_big
from big_geo2 import cols, txt


def clim2_weather_climate():
    cols('clim2_weather_climate.png', 'Weather and climate', ['WEATHER', 'CLIMATE'],
         ['state of the atmosphere\nat a given time\n"today is hot and sunny"', 'average weather over\n30 years or more\n"Garoua has a long dry season\nand a rainy season"'], [ORANGE, NAVY], 19)


def clim2_elements():
    cols('clim2_elements.png', 'Elements of climate', ['TEMPERATURE', 'PRECIPITATION', 'HUMIDITY', 'WIND', 'SUNSHINE', 'PRESSURE'],
         ['°C\nthermometer', 'mm\nrain gauge', '%\nhygrometer', 'direction, speed\nvane, anemometer', 'hours\nsunshine\nrecorder', 'hPa\nbarometer'], [RED, BLUE, '#00838F', GREEN, ORANGE, NAVY], 14)


def clim2_controls():
    cols('clim2_controls.png', 'Controls of climate', ['LATITUDE', 'PRESSURE & WINDS', 'ALTITUDE & RELIEF', 'SEA & CURRENTS', 'VEGETATION & MAN'],
         ['insolation:\nthe most\nimportant', 'Harmattan,\nmonsoon,\nITCZ', 'cooler highlands,\nrain shadows', 'continentality,\nwarm and cold\ncurrents', 'forests add\nmoisture; towns\nand pollution'], [RED, BLUE, BROWN, '#00838F', GREEN], 15)


def clim2_koppen():
    table_big('clim2_koppen.png', ['Group', 'Main criterion', 'Types (examples)'],
              [['A  Tropical humid', 'coldest month above 18 °C', 'Af rainforest, Am monsoon, Aw savanna (Garoua)'],
               ['B  Dry', 'evaporation greater than rainfall', 'BWh desert (Sahara), BSh steppe (Sahel)'],
               ['C  Temperate', 'coldest month between −3 and 18 °C', 'Cs Mediterranean, Cfb (London)'],
               ['D  Continental', 'coldest month below −3 °C', 'Df humid continental, subarctic (Canada)'],
               ['E  Polar', 'warmest month below 10 °C', 'ET tundra, EF ice cap']], colw=[2.6, 4.2, 5.2], fs=14)


def clim2_storms():
    table_big('clim2_storms.png', ['', 'Thunderstorm', 'Tornado', 'Tropical cyclone'],
              [['Size', 'a few km', 'under 1–2 km wide', 'hundreds of km'], ['Where', 'tropics (Garoua), land', 'central USA', 'warm seas, 5°–20°'],
               ['Cause', 'convection, instability', 'wind shear in supercells', 'sea over 26.5 °C, Coriolis'], ['Main danger', 'lightning, floods, hail', 'winds, flying debris', 'storm surge, winds, floods']],
              colw=[2.0, 3.3, 3.3, 3.4], fs=14)


def clim2_storm_measures():
    cols('clim2_storm_measures.png', 'Reducing storm hazards', ['WARNING', 'EDUCATION', 'BUILDINGS', 'EMERGENCY'],
         ['radar, satellites,\nalerts on radio', 'shelter indoors,\navoid trees and\nwater in storms', 'lightning rods,\nstrong roofs,\ngood drains', 'shelters,\ndrills, rescue\nservices'], [NAVY, GREEN, BROWN, RED], 17)


def clim2_micro_types():
    cols('clim2_micro_types.png', 'Types of micro-climates', ['URBAN', 'MOUNTAIN', 'LAKESIDE', 'FOREST'],
         ['towns warmer,\ndrier, polluted\n(centre of Garoua)', 'cooler, windy,\nvaries with\naltitude and aspect', 'cooler, more humid\n(Lake Lagdo)', 'shady, cool,\nhumid, calm'], [RED, BROWN, BLUE, GREEN], 17)


def clim2_urban():
    table_big('clim2_urban.png', ['Element', 'Town compared with the countryside', 'Main cause'],
              [['Temperature', 'higher, especially at night', 'tar and concrete store heat'], ['Humidity', 'lower', 'few plants and little open water'],
               ['Wind', 'weaker, channelled in streets', 'buildings block or funnel wind'], ['Pollution', 'more dust, smoke, gases', 'vehicles, generators, industries'],
               ['Rainfall', 'slightly more storms', 'extra heat and particles']], colw=[2.4, 4.8, 4.8], fs=15)


def clim2_mountain():
    cols('clim2_mountain.png', 'Characteristics of mountain climates', ['COOLER', 'THINNER AIR', 'WETTER WINDWARD', 'STRONG SUN', 'LARGE DAILY RANGE'],
         ['−6.5 °C per\n1,000 m', 'low pressure,\nless oxygen', 'relief rain;\nrain shadow\nleeward', 'more UV\nthrough\nclean air', 'warm days,\ncold nights'], [BLUE, '#607D8B', GREEN, ORANGE, RED], 15)


def clim2_zonation():
    fig, ax = canvas('#DDEFFB')
    zones = [(0, 0.9, '#2E7D32', 'forest and farms (CDC)  0 – 1,800 m  (26 °C at the coast)'), (0.9, 1.9, '#1B5E20', 'montane forest  1,800 – 2,400 m'),
             (1.9, 2.9, '#9E9D24', 'montane grassland  2,400 – 3,500 m'), (2.9, 3.9, '#8D6E63', 'rocks, frost at night  above 3,500 m (summit 4,095 m)')]
    for y0, y1, c, t in zones:
        w0 = 6.0 * (1 - y0 / 4.2); w1 = 6.0 * (1 - y1 / 4.2)
        ax.add_patch(Polygon([(3.0 - w0 / 2 + 0.3, 0.3 + y0), (3.0 + w0 / 2 + 0.3, 0.3 + y0), (3.0 + w1 / 2 + 0.3, 0.3 + y1), (3.0 - w1 / 2 + 0.3, 0.3 + y1)], color=c))
        txt(ax, 6.9, 0.3 + (y0 + y1) / 2, t, 16, c, ha='left')
    txt(ax, 3.3, 4.6, 'Vertical zonation on Mount Cameroon (approximate)', 19, NAVY)
    save(fig, 'clim2_zonation.png')


if __name__ == '__main__':
    only = sys.argv[1:]
    for n, f in list(globals().items()):
        if n.startswith('clim2_') and callable(f) and (not only or n in only): f(); print('ok', n)
