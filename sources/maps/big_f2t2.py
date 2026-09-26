"""Big-label diagrams, maps and GIFs for Form 2 Technical S05–S22 (v2)."""
from big_common import *
import images2 as I2
from images2 import africa_land, rivers, P, SAHARA, SAHEL, KALAHARI, NAMIB, LAND110
from matplotlib.patches import Patch


def side_legend(fig, items, x0=0.60, y0=0.86, dy=0.13, fs=28, title=None):
    if title: fig.text(x0, y0 + 0.06, title, fontsize=fs, fontweight='bold', color=RED)
    for i, (c, t) in enumerate(items):
        y = y0 - i * dy
        fig.patches.append(Rectangle((x0, y - 0.035), 0.045, 0.07, transform=fig.transFigure, fc=c, ec='#333', lw=1.5, figure=fig))
        fig.text(x0 + 0.06, y, t, fontsize=fs, fontweight='bold', va='center', color='#111')


def africa_fig(ext=(-19, 52, -36, 38)):
    fig = plt.figure(figsize=(12.8, 7.2), dpi=150)
    ax = fig.add_axes([0.0, 0.0, 0.56, 1.0], projection=PC); ax.set_extent(ext, crs=PC); ax.set_facecolor('#CFE6F5')
    return fig, ax


def zones():
    cs, land = africa_land()
    med = unary_union([P([(-10, 30.5), (-9.5, 33.5), (-6, 35.9), (10, 37.4), (11.2, 33.2), (5, 34.3), (0, 34.6), (-5, 33.8), (-8, 31)]),
                       P([(19.8, 32), (23, 33), (23.2, 32.2), (20, 31.4)]), P([(17.8, -31.5), (18.3, -34.5), (22, -34.2), (21.5, -33.2), (19, -32)])])
    mountain = unary_union([P([(36, 14.5), (39.5, 14.5), (40.5, 9.5), (42, 9), (39, 5), (35.5, 6), (35, 10)]), P([(34.5, 1.5), (37.9, 0.8), (37.9, -3.6), (35.5, -4), (34.5, -1)]),
                            P([(9.4, 5.3), (10.8, 6.9), (11.4, 6.1), (10, 4.6)]), P([(27, -28.6), (29.5, -28.4), (29.9, -30.2), (28, -30.7)]),
                            P([(-8, 31.2), (-5, 32.3), (0, 33.5), (2, 34.3), (-2, 34.4), (-6, 33.2)])])
    forest = unary_union([P([(8.5, 4.5), (10, 6), (12, 5.5), (15, 4.3), (18, 4.8), (24, 4.5), (29, 3.5), (30.5, 0), (29.5, -4), (24, -5.5), (18, -5.5), (13, -5), (11.5, -3), (9.2, -1), (9.3, 2.5)]),
                          P([(-13.8, 9.6), (-8, 8.4), (-3, 7.3), (-1.5, 6.2), (-3, 4.8), (-7.5, 4.2), (-11.5, 6.6)]), P([(4, 6.8), (8.5, 6.6), (9.5, 4.8), (6, 4.2)]),
                          P([(47.5, -13), (50.5, -15.5), (48.5, -22), (47.4, -25), (47, -22), (48.8, -15.5)])])
    desert = unary_union([SAHARA, NAMIB, P([(40, 15), (43, 12.5), (43.5, 11.5), (51.5, 11.8), (50, 8), (47, 5.5), (45, 5), (42, 7), (40.5, 10)])])
    semi = unary_union([SAHEL, P([(12, -15), (16, -15), (22, -17), (26, -19), (27.5, -22), (28, -27), (25, -30), (20, -31), (17.5, -29), (15, -26), (13, -19)]),
                        P([(38.5, 15.5), (43, 12.5), (51.5, 12), (51.5, 8), (48, 3), (42, -1.5), (40, 1.5), (40, 6), (38, 9)]),
                        P([(-10, 30.5), (-8, 31), (-5, 33.8), (0, 34.6), (5, 34.3), (11.2, 33.2), (10, 31.5), (0, 31), (-8, 29)])]).difference(desert)
    temperate = box(-20, -36, 52, -26.5).intersection(land).difference(unary_union([med, mountain, semi, desert]))
    savanna = box(-20, -27, 52, 16).intersection(land).difference(unary_union([med, mountain, forest, desert, semi, temperate]))
    return cs, land, dict(forest=forest, savanna=savanna, semi=semi, desert=desert, med=unary_union([med, temperate]), mountain=mountain)


def africa_zone_map(kind):
    cs, land, Z = zones()
    fig, ax = africa_fig()
    ax.add_geometries([land], PC, facecolor='#EEEEEE', edgecolor='#999', lw=0.6)
    if kind == 'climate':
        cls = [('forest', '#1E7B34', 'Equatorial: rain all year'), ('savanna', '#9CCB5B', 'Tropical: 2 seasons'), ('semi', '#E8D57A', 'Semi-arid: little rain'),
               ('desert', '#E0A548', 'Desert: no rain'), ('med', '#C98BB9', 'Mediterranean'), ('mountain', '#8C7B6B', 'Mountain: cool')]
        name = 'africa_climate_big.png'
    else:
        cls = [('forest', '#1E7B34', 'Rainforest'), ('savanna', '#9CCB5B', 'Savanna'), ('semi', '#E8D57A', 'Thorny bushes (Sahel)'),
               ('desert', '#E0A548', 'Desert'), ('med', '#C98BB9', 'Mediterranean bushes'), ('mountain', '#8C7B6B', 'Mountain forest')]
        name = 'africa_vegetation_big.png'
    for k, c, t in cls: ax.add_geometries([Z[k].intersection(land)], PC, facecolor=c, edgecolor='none', zorder=2)
    ax.plot([-19, 52], [0, 0], color=RED, lw=3, transform=PC, zorder=6)
    ax.text(-18, 1, 'Equator', fontsize=24, fontweight='bold', color=RED, transform=PC, zorder=7, bbox=dict(fc='white', ec='none', alpha=0.8))
    ax.plot(13.4, 9.3, 'o', ms=14, color='white', mec='black', mew=2.5, transform=PC, zorder=8)
    side_legend(fig, [(c, t) for k, c, t in cls], x0=0.57, y0=0.80, dy=0.125, fs=24)
    fig.text(0.58, 0.07, '○ Garoua', fontsize=26, fontweight='bold')
    msave(fig, name)


def africa_location_big():
    cs, land, Z = zones()
    fig = plt.figure(figsize=(12.8, 7.2), dpi=150)
    ax = fig.add_axes([0.2, 0.0, 0.6, 1.0], projection=PC); ext = (-32, 62, -38, 42); ax.set_extent(ext, crs=PC); ax.set_facecolor('#CFE6F5')
    ax.add_geometries([LAND110], PC, facecolor='#E3E3E3', edgecolor='#999', lw=0.5)
    ax.add_geometries([land], PC, facecolor='#F2D48F', edgecolor='#8A6A10', lw=1)
    cam = [g for n, g in cs if n == 'Cameroon'][0]; ax.add_geometries([cam], PC, facecolor=RED, edgecolor='black', lw=1, zorder=4)
    ax.plot([-32, 62], [0, 0], color=RED, lw=3, transform=PC, zorder=5)
    ax.text(-31, 1, 'Equator', fontsize=22, fontweight='bold', color=RED, transform=PC, zorder=7)
    for x, y, t in [(-22, 12, 'ATLANTIC\nOCEAN'), (58, -12, 'INDIAN\nOCEAN'), (18, 38.5, 'MEDITERRANEAN SEA'), (44, 24, 'RED\nSEA')]:
        ax.text(x, y, t, fontsize=24, fontweight='bold', color='#0B3D91', ha='center', va='center', transform=PC, zorder=9, bbox=dict(fc='white', ec='#0B3D91', lw=2, boxstyle='round,pad=0.2'))
    ax.text(30, 3, 'AFRICA', fontsize=30, fontweight='bold', color='#5A4000', ha='center', transform=PC, zorder=9)
    ax.annotate('Cameroon', xy=(12.5, 5.5), xytext=(-24, -22), xycoords=PC._as_mpl_transform(ax), textcoords=PC._as_mpl_transform(ax),
                fontsize=26, fontweight='bold', color=RED, arrowprops=dict(arrowstyle='-|>', color=RED, lw=3), zorder=10,
                bbox=dict(fc='white', ec=RED, lw=2, boxstyle='round,pad=0.2'))
    msave(fig, 'africa_location_big.png')


def africa_drainage_big():
    cs, land, Z = zones()
    fig = plt.figure(figsize=(12.8, 7.2), dpi=150)
    ax = fig.add_axes([0.14, 0.0, 0.72, 1.0], projection=PC); ax.set_extent((-19, 52, -36, 38), crs=PC); ax.set_facecolor('#CFE6F5')
    ax.add_geometries([land], PC, facecolor='#F2EFE6', edgecolor='#999', lw=0.6)
    rivers(ax, {'Nile': 5, 'Congo': 5, 'Niger': 5, 'Zambezi': 4.5, 'El Bahr el Abyad': 4, 'El Bahr el Azraq': 3, 'Lualaba': 4, 'Benue': 3.5, 'Bénoué': 3.5, 'Chari': 3})
    for t, x, y in [('NILE', 34, 22), ('CONGO', 17.5, 2.5), ('NIGER', 0, 17.5), ('ZAMBEZI', 29, -13), ('BENUE', 9, 7.2), ('L. CHAD', 14, 16.3), ('L. VICTORIA', 42, -2)]:
        ax.text(x, y, t, fontsize=24, fontweight='bold', color='#0B3D91', ha='center', transform=PC, zorder=9, bbox=dict(fc='white', ec='#0B3D91', lw=2, boxstyle='round,pad=0.15', alpha=0.92))
    msave(fig, 'africa_drainage_big.png')


def deserts_world_big():
    ext = (-125, 150, -50, 52); fig, ax = map_axes(ext, (12.8, 5.6)); ax.set_position([0, 0, 1, 1])
    hot = [SAHARA, NAMIB, KALAHARI, P([(35, 29), (40, 32), (47, 30), (56, 24), (58, 20), (52, 16), (45, 17), (39, 21)]), P([(69, 24), (71, 29.5), (74, 30), (75, 27), (72, 24.5)]),
           P([(115, -21), (125, -20), (135, -21), (140, -24), (140, -29), (135, -31), (125, -30), (118, -27)]),
           P([(-117, 36), (-114, 37), (-108, 34), (-104, 30), (-103, 26), (-107, 26), (-110, 28), (-113, 31), (-116, 32)]), P([(-71.5, -18), (-69.3, -18), (-69.3, -27), (-71.2, -27.5)])]
    for g in hot: ax.add_geometries([g.intersection(LAND110)], PC, facecolor='#E0A548', edgecolor='#6B4A10', lw=1, zorder=3)
    latline(ax, ext, 23.44, 'Tropic of Cancer', c='#B0001A'); latline(ax, ext, -23.44, 'Tropic of Capricorn', c='#B0001A'); latline(ax, ext, 0, 'Equator', c='#1565C0', ls='-')
    for x, y, t in [(10, 25, 'SAHARA'), (128, -27, 'AUSTRALIA'), (22, -34, 'KALAHARI'), (-66, -32, 'ATACAMA'), (47, 36, 'ARABIAN'), (-100, 40, 'MOJAVE')]:
        mlab(ax, x, y, t, fs=22, c='#5A3A00')
    msave(fig, 'deserts_world_big.png')


def trade_wind_dry():
    fig, ax = canvas('#DDEFFB')
    ax.add_patch(Rectangle((0, 0), W_, 1.3, color='#E0B060', zorder=1)); sun(ax, 11.4, 4.1)
    for y in (2.2, 3.0, 3.8):
        arrow(ax, (0.6, y), (8.2, y - 0.4), c=ORANGE, lw=7, ms=45)
    lab(ax, 3.5, 4.5, 'Wind from the land: dry', c=ORANGE, fs=28)
    lab(ax, 9.6, 2.0, 'No clouds, no rain', c=RED, fs=28)
    lab(ax, 3.0, 0.6, 'LAND', c='#5A3A00', fs=26, box=False); lab(ax, 9.6, 0.6, 'DESERT', c='#5A3A00', fs=26, box=False)
    save(fig, 'trade_wind_dry.png')


def rain_compare_big():
    fig, ax = chart((12.8, 5.4)); fig.subplots_adjust(0.25, 0.2, 0.97, 0.95)
    v = [4000, 1000, 2]; t = ['Douala', 'Garoua', 'Aswan']
    b = ax.barh(t[::-1], v[::-1], color=['#E0A548', '#9CCB5B', '#1E7B34'], height=0.6)
    for i, x in enumerate(v[::-1]): ax.text(x + 60, i, f'{x:,} mm', va='center', fontsize=30, fontweight='bold')
    ax.set_xlim(0, 5200); ax.tick_params(labelsize=26); ax.set_xlabel('Rain per year (mm)', fontsize=26, fontweight='bold')
    for s in ('top', 'right'): ax.spines[s].set_visible(False)
    fig.savefig(OUT + 'rain_compare_big.png', dpi=150, facecolor='white'); plt.close(fig)


def aswan_temp_big():
    mx = [23, 25, 29, 35, 39, 42, 42, 41, 39, 35, 29, 24]; mn = [9, 10, 14, 18, 22, 25, 26, 26, 24, 20, 15, 11]
    fig, ax = chart(); x = np.arange(12)
    ax.plot(x, mx, color=RED, lw=6, marker='o', ms=12, label='Day'); ax.plot(x, mn, color=BLUE, lw=6, marker='o', ms=12, label='Night')
    ax.set_xticks(x); ax.set_xticklabels(list('JFMAMJJASOND'), fontsize=24, fontweight='bold'); ax.set_ylim(0, 48)
    ax.set_ylabel('Temperature (°C)', fontsize=24, fontweight='bold')
    ax.text(6, 44.5, 'Day: 42 °C', fontsize=30, fontweight='bold', color=RED, ha='center'); ax.text(6, 18.5, 'Night: 26 °C', fontsize=30, fontweight='bold', color=BLUE, ha='center')
    ax.text(0.3, 3, 'Aswan (Egypt): 2 mm of rain per year', fontsize=24, fontweight='bold', color='#5A3A00')
    for s in ('right',): ax.spines[s].set_visible(False)
    fig.savefig(OUT + 'aswan_temp_big.png', dpi=150, facecolor='white'); plt.close(fig)


def thermo(ax, x, y, val, vmax=50, c=RED):
    ax.add_patch(FancyBboxPatch((x - 0.18, y), 0.36, 3.0, boxstyle='round,pad=0.05', fc='white', ec='#333', lw=3, zorder=10))
    ax.add_patch(Circle((x, y), 0.34, fc=c, ec='#333', lw=3, zorder=11))
    ax.add_patch(Rectangle((x - 0.09, y), 0.18, 3.0 * val / vmax, color=c, zorder=12))


def desert_night_gif():
    frames = []
    for k in range(40):
        night = k >= 20; f = (k % 20) / 19
        fig, ax = canvas('#0E1A3A' if night else '#BFE3FA')
        ax.add_patch(Rectangle((0, 0), W_, 1.4, color='#C9A04A' if not night else '#6B5630', zorder=1))
        if not night:
            sun(ax, 3 + f * 2, 4.0)
            for i in range(4): arrow(ax, (2.5 + i * 1.2, 3.4), (2.2 + i * 1.2, 1.5), c='#FF9800', lw=4, ms=28)
            val = 30 + 12 * f; lab(ax, 4.2, 0.65, 'Day: the sun heats the sand', c=RED, fs=26)
        else:
            ax.add_patch(Circle((2.5, 4.0), 0.4, color='#F5F5DC', zorder=3))
            for sx, sy in [(1, 4.5), (4, 4.6), (6, 4.2), (7.5, 4.7), (3.2, 3.6), (8.6, 3.9)]: ax.plot(sx, sy, '*', ms=16, color='white', zorder=3)
            for i in range(4): arrow(ax, (2.2 + i * 1.2, 1.5), (2.5 + i * 1.2, 1.5 + 2.2 * f + 0.3), c='#FF7043', lw=4, ms=28)
            val = 42 - 30 * f; lab(ax, 4.6, 0.65, 'Night: no clouds, the heat escapes', c=BLUE, fs=26)
        thermo(ax, 10.6, 1.2, val); lab(ax, 11.8, 3.9, f'{val:.0f} °C', c=RED if not night else BLUE, fs=32)
        frames.append(frame(fig))
    save_gif(frames, 'desert_night.gif', ms=150, hold=8)
    frames[39].save(OUT + 'desert_night_last.png')


def desert_roots_big():
    fig, ax = canvas('#DDEFFB')
    ax.add_patch(Rectangle((0, 0), W_, 3.2, color='#D9B46C', zorder=1)); ax.add_patch(Rectangle((0, 0), W_, 0.5, color='#4F8FD6', zorder=2))
    acacia(ax, 3.5, 3.2, 1.0)
    for dx, bend in [(0, 0), (-0.3, -0.2), (0.3, 0.25)]:
        ax.plot([3.5, 3.5 + dx + bend, 3.5 + dx], [3.2, 1.8, 0.5], color='#6D4C41', lw=5, zorder=3)
    lab(ax, 7.8, 0.25, 'Water deep under the ground', c=BLUE, fs=24)
    lab(ax, 7.6, 2.0, 'Very long roots reach the water', c=BROWN, fs=26)
    arrow(ax, (5.4, 2.0), (3.8, 1.4), c=BROWN)
    lab(ax, 8.8, 4.3, 'Small leaves and thorns', c=GREEN, fs=26); arrow(ax, (6.6, 4.3), (4.4, 4.6), c=GREEN)
    save(fig, 'desert_roots_big.png')


def oasis_big():
    fig, ax = canvas('#DDEFFB')
    xs = np.array([0, 1.8, 3.2, 4.5, 6.5, 8.4, 9.6, 12.8]); ys = np.array([4.3, 3.6, 3.0, 2.7, 2.5, 2.5, 2.6, 2.7])
    ax.fill_between(xs, 0, ys, color='#E0B060', zorder=1)
    ax.fill_between([0, 12.8], [0.9, 0.9], [2.3, 1.7], color='#8FB8E8', zorder=2)  # water-bearing rock
    ax.fill_between([0, 12.8], 0, [0.9, 0.9], color='#7B6A5A', zorder=2)
    ax.add_patch(Ellipse((7.4, 2.5), 2.2, 0.35, color='#1E88E5', zorder=4))
    for x in (6.6, 7.0, 7.9, 8.3):
        ax.plot([x, x], [2.5, 3.6], color='#6D4C41', lw=5, zorder=5); ax.add_patch(Ellipse((x, 3.7), 0.9, 0.3, color=GREEN, zorder=6))
    for i in range(6): ax.plot([0.4 + i * 0.25, 0.2 + i * 0.25], [4.9, 4.5], color='#1E88E5', lw=3)
    lab(ax, 1.8, 4.75, 'Rain on the hills', c=BLUE, fs=24)
    arrow(ax, (1.2, 1.9), (6.0, 1.5), c=BLUE, lw=6)
    lab(ax, 3.2, 1.25, 'Water moves under the ground', c=BLUE, fs=22)
    lab(ax, 10.9, 4.1, 'OASIS', c=GREEN, fs=30); arrow(ax, (10.2, 3.9), (8.6, 3.1), c=GREEN)
    save(fig, 'oasis_big.png')


def temperate_world_big():
    ext = (-130, 180, -55, 70); fig, ax = map_axes(ext, (12.8, 5.2)); ax.set_position([0, 0, 1, 1])
    for la, sg in ((30, 1), (-30, -1)):
        pass
    band = unary_union([box(-180, 30, 180, 60), box(-180, -60, 180, -30)]).intersection(LAND110)
    ax.add_geometries([band], PC, facecolor='#7CB342', edgecolor='#33691E', lw=0.8, zorder=3)
    for la, t in [(60, '60°N'), (30, '30°N'), (-30, '30°S'), (-60, '60°S')]: latline(ax, ext, la, t)
    latline(ax, ext, 0, 'Equator', c=RED, ls='-')
    for x, y, t in [(15, 50, 'EUROPE'), (-100, 45, 'NORTH AMERICA'), (-64, -40, 'ARGENTINA'), (25, -33, 'SOUTH AFRICA'), (140, -35, 'AUSTRALIA'), (90, 50, 'ASIA')]:
        mlab(ax, x, y, t, fs=20, c='#1B5E20')
    msave(fig, 'temperate_world_big.png')


def london_climate_big():
    t = [5.2, 5.3, 7.6, 9.9, 13.3, 16.5, 18.7, 18.5, 15.7, 12.0, 8.0, 5.5]; r = [55, 41, 42, 44, 49, 45, 45, 50, 49, 69, 59, 55]
    def note(ax, a2):
        a2.text(3.3, 21.5, 'Summer: 19 °C', fontsize=26, fontweight='bold', color=RED, ha='center')
        a2.text(1.3, 11.5, 'Winter: 5 °C', fontsize=26, fontweight='bold', color=BLUE, ha='center')
        ax.text(2.0, 118, 'Rain every month', fontsize=26, fontweight='bold', color='#0D47A1', ha='center')
    climate_graph('london_climate_big.png', t, r, note, tlim=(-12, 25), rlim=(0, 160))


def four_seasons_big():
    fig, ax = canvas('white')
    cols = [('SPRING', '#A5D6A7', 'Warm, flowers'), ('SUMMER', '#FFE082', 'Hot, long days'), ('AUTUMN', '#FFAB91', 'Cool, leaves fall'), ('WINTER', '#B3E5FC', 'Cold, snow')]
    for i, (s, c, d) in enumerate(cols):
        x = 0.2 + i * 3.15
        ax.add_patch(FancyBboxPatch((x, 0.4), 2.9, 4.2, boxstyle='round,pad=0.05', fc=c, ec='#333', lw=2))
        ax.text(x + 1.45, 3.8, s, fontsize=32, fontweight='bold', ha='center', color='#222')
        ax.text(x + 1.45, 1.6, d.replace(', ', ',\n'), fontsize=26, fontweight='bold', ha='center', va='center', color='#333')
    save(fig, 'four_seasons_big.png')


def cotton_journey_gif():
    steps = [('PRIMARY', '#8BC34A', 'Farmer grows\ncotton'), ('SECONDARY', '#FF9800', 'Factory makes\ncloth'), ('TERTIARY', '#29B6F6', 'Trader sells\nthe cloth'), ('QUATERNARY', '#AB47BC', 'Researcher finds\nbetter seeds')]
    frames = []
    for k in range(4 * 8):
        fig, ax = canvas('white'); n = k // 8 + 1
        for i, (s, c, d) in enumerate(steps[:n]):
            x = 0.15 + i * 3.18
            ax.add_patch(FancyBboxPatch((x, 0.5), 2.85, 3.9, boxstyle='round,pad=0.05', fc=c, ec='#333', lw=2))
            ax.text(x + 1.42, 3.6, s, fontsize=24, fontweight='bold', ha='center', color='white')
            ax.text(x + 1.42, 1.9, d, fontsize=21, fontweight='bold', ha='center', va='center', color='#111')
            if i: arrow(ax, (x - 0.35, 2.45), (x + 0.02, 2.45), c='#333', lw=4, ms=30)
        frames.append(frame(fig))
    save_gif(frames, 'cotton_journey.gif', ms=180, hold=14)
    frames[-1].save(OUT + 'cotton_journey_last.png')


def formal_informal_big():
    fig, ax = canvas('white')
    for x, t, c, items in [(0.2, 'FORMAL', '#1565C0', ['Registered', 'Pays taxes', 'Contract, salary', 'Pension (CNPS)']),
                           (6.55, 'INFORMAL', '#E65100', ['Not registered', 'Few taxes', 'No contract', 'No pension'])]:
        ax.add_patch(FancyBboxPatch((x, 0.3), 6.05, 4.4, boxstyle='round,pad=0.05', fc='#F5F5F5', ec=c, lw=4))
        ax.text(x + 3.0, 4.1, t, fontsize=32, fontweight='bold', ha='center', color=c)
        for j, it in enumerate(items): ax.text(x + 0.5, 3.2 - j * 0.85, '• ' + it, fontsize=28, fontweight='bold', va='center')
    save(fig, 'formal_informal_big.png')


def quaternary_big():
    fig, ax = canvas('white')
    ax.add_patch(Circle((6.4, 2.5), 1.35, fc='#AB47BC', ec='#333', lw=2)); ax.text(6.4, 2.5, 'RESEARCH\nKNOWLEDGE', fontsize=24, fontweight='bold', ha='center', va='center', color='white')
    for (x, y, t, c) in [(2.1, 4.1, 'Better seeds', '#8BC34A'), (10.6, 4.1, 'New machines', '#FF9800'), (2.1, 0.9, 'Mobile money', '#29B6F6'), (10.6, 0.9, 'New medicines', '#EF5350')]:
        lab(ax, x, y, t, c=c, fs=28); arrow(ax, (6.4 + (1.3 if x > 6 else -1.3), 2.5 + (0.6 if y > 2.5 else -0.6)), (x + (-1.2 if x > 6 else 1.2), y), c='#555', lw=4)
    save(fig, 'quaternary_big.png')


def africa_plateau_big():
    fig, ax = canvas('#DDEFFB')
    xs = [0, 0.8, 1.4, 2.0, 5.0, 8.0, 10.6, 11.2, 12.0, 12.8]; ys = [0.6, 0.7, 2.6, 3.2, 3.4, 3.3, 3.1, 2.4, 0.7, 0.6]
    ax.fill_between(xs, 0, ys, color='#C9A04A', zorder=2); ax.add_patch(Rectangle((0, 0), 1.0, 0.6, color='#1E88E5', zorder=3)); ax.add_patch(Rectangle((11.9, 0), 0.9, 0.6, color='#1E88E5', zorder=3))
    lab(ax, 6.4, 4.2, 'High, flat land: a PLATEAU', c=RED, fs=30)
    lab(ax, 1.9, 1.4, 'Narrow coastal plain', c='#5A3A00', fs=20); lab(ax, 0.55, 0.28, 'Sea', c=BLUE, fs=20, box=False)
    save(fig, 'africa_plateau_big.png')


ALL = ['deserts_world_big', 'trade_wind_dry', 'rain_compare_big', 'aswan_temp_big', 'desert_night_gif', 'desert_roots_big', 'oasis_big', 'temperate_world_big',
       'london_climate_big', 'four_seasons_big', 'cotton_journey_gif', 'formal_informal_big', 'quaternary_big', 'africa_location_big', 'africa_drainage_big', 'africa_plateau_big']
if __name__ == '__main__':
    import sys
    for f in (sys.argv[1:] or ALL + ['climate', 'vegetation']):
        if f in ('climate', 'vegetation'): africa_zone_map(f)
        else: globals()[f]()
        print('ok', f, flush=True)


def oasis_layers_big():
    fig, ax = canvas('#DDEFFB'); ax.add_patch(Rectangle((0, 0), W_, 0.7, color='#C9A04A'))
    for x in (1.2, 3.4, 5.6):
        ax.plot([x, x], [0.7, 3.9], color='#6D4C41', lw=9); ax.add_patch(Ellipse((x, 4.0), 1.9, 0.55, color=GREEN))
    for x in (2.3, 4.5):
        ax.plot([x, x], [0.7, 1.9], color='#6D4C41', lw=6); ax.add_patch(Circle((x, 2.2), 0.55, color='#7CB342'))
        for dx in (-0.2, 0.2): ax.add_patch(Circle((x + dx, 2.1), 0.1, color=ORANGE))
    for k in range(14): ax.add_patch(Ellipse((0.6 + 0.42 * k, 0.9), 0.3, 0.35, color='#9CCC65'))
    lab(ax, 9.7, 4.0, '1. Date palms (top)', fs=26, c=GREEN); lab(ax, 9.7, 2.2, '2. Fruit trees (middle)', fs=26, c=ORANGE); lab(ax, 9.7, 0.9, '3. Vegetables (ground)', fs=26, c='#558B2F')
    save(fig, 'oasis_layers_big.png')
