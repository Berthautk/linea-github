"""Big-label diagrams and GIFs for Form 4, Lessons 26 and 30–42 (v2)."""
from big_common import *
SKY = '#DDEFFB'; SEA = '#2F7ED8'; LAND = '#A5C860'


def atmosphere_big():
    fig, ax = canvas('white')
    layers = [('TROPOSPHERE: 0–12 km — weather, clouds, rain', '#BBDEFB', 0.2, 1.4), ('STRATOSPHERE: 12–50 km — ozone layer', '#C5CAE9', 1.4, 2.6),
              ('MESOSPHERE: 50–85 km — very cold', '#D1C4E9', 2.6, 3.7), ('THERMOSPHERE: above 85 km', '#F8BBD0', 3.7, 4.8)]
    for t, c, y0, y1 in layers:
        ax.add_patch(Rectangle((0.2, y0), 12.4, y1 - y0, color=c)); ax.text(0.5, (y0 + y1) / 2, t, fontsize=26, fontweight='bold', va='center')
    ax.add_patch(Rectangle((0.2, 1.8), 12.4, 0.25, color='#7E57C2', alpha=0.5))
    for x in (9.8, 10.8, 11.6): ax.add_patch(Ellipse((x, 0.8), 0.9, 0.35, color='white'))
    save(fig, 'atmosphere_big.png')


def instruments_big():
    fig, ax = canvas('white')
    items = [('Thermometer', 'temperature (°C)'), ('Rain gauge', 'rainfall (mm)'), ('Wind vane', 'wind direction'), ('Anemometer', 'wind speed'), ('Barometer', 'air pressure'), ('Hygrometer', 'humidity (%)')]
    for i, (a, b) in enumerate(items):
        x = 0.3 + (i % 2) * 6.3; y = 4.3 - (i // 2) * 1.6
        ax.text(x, y, a + ':', fontsize=28, fontweight='bold', color=RED, va='center'); ax.text(x + 0.2, y - 0.6, b, fontsize=25, fontweight='bold', color='#222', va='center')
    save(fig, 'instruments_big.png')


def temp_mean_big():
    fig, ax = canvas('white')
    rows = [('Maximum: 38 °C     Minimum: 24 °C', NAVY), ('Mean = (38 + 24) ÷ 2 = 31 °C', GREEN), ('Range = 38 − 24 = 14 °C', RED)]
    for k, (t, c) in enumerate(rows): ax.text(0.5, 4.0 - k * 1.4, t, fontsize=34, fontweight='bold', color=c, va='center')
    save(fig, 'temp_mean_big.png')


def convection_gif():
    frames = []; N = 36
    for i in range(N):
        f = i / (N - 1); fig, ax = canvas(SKY); ax.add_patch(Rectangle((0, 0), W_, 0.8, color='#C9A04A')); sun(ax, 1.2, 4.1)
        y = 1.0 + 2.6 * min(f / 0.6, 1)
        for dx in (-0.6, 0, 0.6): arrow(ax, (6.4 + dx, 1.0), (6.4 + dx, max(y, 1.3)), c=ORANGE, lw=5, ms=26)
        if f > 0.5: ax.add_patch(Ellipse((6.4, 3.9), 4.2 * min((f - 0.5) / 0.3, 1) + 0.1, 1.3, color='#78909C'))
        if f > 0.8:
            for k in range(10): ax.plot([4.8 + 0.35 * k, 4.6 + 0.35 * k], [3.1 - (i % 3) * 0.2, 2.6 - (i % 3) * 0.2], color=BLUE, lw=3)
        lab(ax, 2.9, 1.6, 'Hot ground heats the air', fs=22, c=ORANGE)
        lab(ax, 10.3, 2.6, 'Warm air rises and cools' if f < 0.8 else 'Heavy rain and thunder', fs=22, c=NAVY if f < 0.8 else RED)
        frames.append(frame(fig))
    save_gif(frames, 'convection.gif', ms=150, hold=12)
    frames[-1].save(OUT + 'convection_last.png')


def rainfall_types_big():
    fig, ax = canvas('white')
    for i, (t, c) in enumerate([('CONVECTIONAL', 'Hot ground: air rises'), ('RELIEF', 'A mountain lifts the air'), ('FRONTAL', 'Warm air over cold air')]):
        x0 = 0.2 + i * 4.25; ax.add_patch(Rectangle((x0, 0.6), 4.0, 3.6, color=SKY))
        ax.text(x0 + 2.0, 4.55, t, fontsize=24, fontweight='bold', ha='center', color=RED); ax.text(x0 + 2.0, 0.25, c, fontsize=20, fontweight='bold', ha='center')
        ax.add_patch(Ellipse((x0 + 2.0, 3.6), 2.2, 0.7, color='#78909C'))
        for k in range(6): ax.plot([x0 + 1.2 + 0.3 * k, x0 + 1.1 + 0.3 * k], [3.1, 2.6], color=BLUE, lw=2.5)
        if i == 0: ax.add_patch(Rectangle((x0, 0.6), 4.0, 0.4, color='#C9A04A')); arrow(ax, (x0 + 2.0, 1.1), (x0 + 2.0, 3.1), c=ORANGE, lw=5)
        if i == 1: ax.add_patch(Polygon([(x0, 0.6), (x0 + 3.0, 0.6), (x0 + 2.2, 2.6)], color='#8D6E63')); arrow(ax, (x0 + 0.2, 1.0), (x0 + 1.6, 2.9), c=ORANGE, lw=5)
        if i == 2: ax.add_patch(Polygon([(x0, 0.6), (x0 + 4.0, 0.6), (x0 + 4.0, 2.3)], color='#90CAF9')); arrow(ax, (x0 + 0.4, 1.4), (x0 + 2.4, 2.9), c=ORANGE, lw=5)
    save(fig, 'rainfall_types_big.png')


def pressure_belts_big():
    fig, ax = canvas('white'); cx, cy, r = 3.3, 2.5, 2.35
    ax.add_patch(Circle((cx, cy), r, fc='#E3F2FD', ec=NAVY, lw=3))
    belts = [(0, 'Equatorial LOW (0°): rain', RED), (30, 'Sub-tropical HIGH (30°N): dry', ORANGE), (60, 'Temperate LOW (60°N)', BLUE), (88, 'Polar HIGH (90°N)', NAVY)]
    for lat, t, c in belts:
        y = cy + r * np.sin(np.radians(lat)); w = r * np.cos(np.radians(lat))
        ax.plot([cx - w, cx + w], [y, y], color=c, lw=4)
        ly = {0: y, 30: y, 60: 4.25, 88: 4.85}[lat]
        ax.plot([cx + w, 6.6], [y, ly], color='#999', lw=1.5); ax.text(6.7, ly, t, fontsize=24, fontweight='bold', color=c, va='center')
    y0 = cy + r * np.sin(np.radians(24)); arrow(ax, (cx + 1.2, y0), (cx + 0.3, cy + 0.15), c=GREEN, lw=5)
    ax.text(6.7, cy + 0.55, 'North-east Trade Wind →', fontsize=22, fontweight='bold', color=GREEN, va='center')
    save(fig, 'pressure_belts_big.png')


def itcz_gif():
    frames = []
    for k in range(40):
        july = (k // 20) == 0; f = (k % 20) / 19
        fig, ax = canvas('#F2E3B3'); ax.add_patch(Rectangle((0, 0), W_, 0.9, color=SEA))
        ax.text(0.3, 0.35, 'Atlantic Ocean', fontsize=22, fontweight='bold', color='white')
        ax.text(0.3, 4.55, 'SAHARA', fontsize=24, fontweight='bold', color='#8D6E00')
        ax.plot(6.4, 2.7, 'o', ms=20, color=RED, mec='black'); ax.text(6.7, 2.9, 'Garoua', fontsize=26, fontweight='bold', color=RED)
        yb = 3.6 if july else 1.4
        ax.add_patch(Rectangle((0, yb - 0.25), W_, 0.5, color='#90CAF9', alpha=0.7)); ax.text(8.3, yb, 'Rain belt (low pressure)', fontsize=20, fontweight='bold', color=NAVY, va='center')
        if july:
            for j in range(3): arrow(ax, (2.0 + 2.5 * j, 1.0 + 0.4 * f), (3.0 + 2.5 * j, 2.2 + 0.4 * f), c=BLUE, lw=5)
            lab(ax, 6.4, 1.6 if False else 4.2, 'JULY: wet wind from the south-west = RAIN', fs=22, c=BLUE)
        else:
            for j in range(3): arrow(ax, (10.0 - 2.5 * j, 4.4 - 0.4 * f), (9.0 - 2.5 * j, 3.2 - 0.4 * f), c=ORANGE, lw=5)
            lab(ax, 6.4, 0.45, 'JANUARY: dry Harmattan from the north-east', fs=22, c=ORANGE)
        frames.append(frame(fig))
    save_gif(frames, 'itcz.gif', ms=160, hold=0)
    frames[10].save(OUT + 'itcz_july.png')


def seabreeze_gif():
    frames = []
    for k in range(40):
        day = (k // 20) == 0; f = (k % 20) / 19
        fig, ax = canvas('#BFE3FA' if day else '#0E1A3A')
        ax.add_patch(Rectangle((0, 0), 6.4, 1.2, color=SEA)); ax.add_patch(Rectangle((6.4, 0), 6.4, 1.2, color='#C9A04A'))
        ax.text(3.2, 0.5, 'SEA', fontsize=26, fontweight='bold', ha='center', color='white'); ax.text(9.6, 0.5, 'LAND', fontsize=26, fontweight='bold', ha='center')
        if day:
            sun(ax, 11.6, 4.2, 0.4); x = 2.0 + 6.0 * f; arrow(ax, (x - 1.5, 1.6), (x, 1.6), c=NAVY, lw=6)
            arrow(ax, (9.6, 1.9), (9.6, 3.4), c=ORANGE, lw=5)
            lab(ax, 5.2, 4.3, 'DAY: land is hot, SEA BREEZE blows to the land', fs=21, c=NAVY)
        else:
            ax.add_patch(Circle((11.6, 4.2), 0.35, color='#F5F5DC')); x = 10.8 - 6.0 * f; arrow(ax, (x + 1.5, 1.6), (x, 1.6), c='#FFEB3B', lw=6)
            arrow(ax, (3.2, 1.9), (3.2, 3.4), c=ORANGE, lw=5)
            lab(ax, 5.2, 4.3, 'NIGHT: sea is warmer, LAND BREEZE blows to the sea', fs=21, c=RED)
        frames.append(frame(fig))
    save_gif(frames, 'seabreeze.gif', ms=150, hold=0)
    frames[10].save(OUT + 'seabreeze_day.png')


def mountain_valley_big():
    fig, ax = canvas('white')
    for i, (t, c, up) in enumerate([('DAY: VALLEY BREEZE\nblows UP the slopes', ORANGE, True), ('NIGHT: MOUNTAIN BREEZE\nblows DOWN the slopes', NAVY, False)]):
        x0 = 0.2 + i * 6.3; ax.add_patch(Rectangle((x0, 0.3), 6.0, 3.6, color='#BFE3FA' if up else '#1A2A55'))
        ax.add_patch(Polygon([(x0, 3.4), (x0 + 3.0, 0.3), (x0 + 6.0, 3.4), (x0 + 6.0, 0.3), (x0, 0.3)], color='#7CB342'))
        if up: arrow(ax, (x0 + 2.0, 1.5), (x0 + 0.8, 3.0), c=ORANGE, lw=5); arrow(ax, (x0 + 4.0, 1.5), (x0 + 5.2, 3.0), c=ORANGE, lw=5)
        else: arrow(ax, (x0 + 0.8, 3.0), (x0 + 2.0, 1.5), c='#FFEB3B', lw=5); arrow(ax, (x0 + 5.2, 3.0), (x0 + 4.0, 1.5), c='#FFEB3B', lw=5)
        ax.text(x0 + 3.0, 4.45, t, fontsize=22, fontweight='bold', ha='center', va='center', color=c)
    save(fig, 'mountain_valley_big.png')


def sun_rays_big():
    fig, ax = canvas('white'); cx, cy, r = 7.8, 2.5, 2.3
    ax.add_patch(Circle((cx, cy), r, fc='#E3F2FD', ec=NAVY, lw=3)); ax.plot([cx - r, cx + r], [cy, cy], color=RED, lw=3)
    for y in (cy, cy + 1.8):
        arrow(ax, (0.3, y), (cx - np.sqrt(max(r * r - (y - cy) ** 2, 0)) - 0.05, y), c='#FF9800', lw=6)
    ax.add_patch(Rectangle((cx - r - 0.05, cy - 0.25), 0.25, 0.5, color=RED)); ax.add_patch(Rectangle((cx - 1.45, cy + 1.45), 0.25, 1.2, color='#1565C0', angle=-40))
    lab(ax, 3.0, 1.3, 'Equator: rays are direct, HOT', fs=24, c=RED); lab(ax, 3.3, 4.7, 'Poles: rays are spread, COLD', fs=24, c=BLUE)
    save(fig, 'sun_rays_big.png')


def water_cycle_gif():
    steps = [('1. EVAPORATION: the sun heats the sea', ORANGE), ('2. CONDENSATION: vapour forms clouds', NAVY), ('3. PRECIPITATION: rain falls', BLUE), ('4. RUNOFF: rivers go back to the sea', GREEN)]
    frames = []
    for s in range(4):
        for k in range(9):
            fig, ax = canvas(SKY); sun(ax, 1.0, 4.2, 0.45)
            ax.add_patch(Rectangle((0, 0), 5.0, 1.0, color=SEA)); ax.add_patch(Polygon([(5.0, 0), (5.0, 1.0), (9.0, 2.4), (12.8, 3.2), (12.8, 0)], color=LAND))
            if s >= 0: [arrow(ax, (1.5 + j, 1.1), (1.9 + j, 2.8), c=ORANGE, lw=4) for j in range(3)]
            if s >= 1: ax.add_patch(Ellipse((8.0, 4.0), 3.6, 1.0, color='#90A4AE'))
            if s >= 2: [ax.plot([6.8 + 0.4 * j, 6.6 + 0.4 * j], [3.4 - 0.15 * (k % 3), 2.9 - 0.15 * (k % 3)], color=BLUE, lw=3) for j in range(7)]
            if s >= 3: ax.plot([11.5, 9.0, 7.0, 5.0], [3.0, 2.2, 1.4, 0.9], color='#1565C0', lw=8)
            lab(ax, 6.4, 0.45, steps[s][0], fs=24, c=steps[s][1])
            frames.append(frame(fig))
    save_gif(frames, 'water_cycle.gif', ms=200, hold=10)
    frames[-1].save(OUT + 'water_cycle_last.png')


def open_system_big():
    fig, ax = canvas('white')
    for x, t, c in [(0.3, 'INPUT\nRain', '#1E88E5'), (4.55, 'STORES\nSoil, rivers,\nlakes, plants', '#43A047'), (8.8, 'OUTPUTS\nEvaporation,\nriver to the sea', '#E65100')]:
        ax.add_patch(FancyBboxPatch((x, 0.8), 3.7, 3.4, boxstyle='round,pad=0.05', fc=c, ec='#333', lw=2))
        ax.text(x + 1.85, 2.5, t, fontsize=26, fontweight='bold', ha='center', va='center', color='white')
    arrow(ax, (4.05, 2.5), (4.5, 2.5), c='#333', lw=5); arrow(ax, (8.3, 2.5), (8.75, 2.5), c='#333', lw=5)
    save(fig, 'open_system_big.png')


def greenhouse_big():
    fig, ax = canvas('#0E1A3A'); sun(ax, 1.2, 4.0, 0.55)
    ax.add_patch(Rectangle((0, 0), W_, 0.9, color='#6D8B3A')); ax.add_patch(Rectangle((0, 3.0), W_, 0.35, color='#B39DDB', alpha=0.6))
    ax.text(12.6, 3.17, 'Greenhouse gases (CO₂)', fontsize=22, fontweight='bold', color='white', ha='right', va='center')
    arrow(ax, (1.8, 3.5), (4.5, 1.0), c='#FFD54F', lw=6)
    arrow(ax, (5.2, 1.0), (7.0, 2.9), c='#FF7043', lw=6); arrow(ax, (7.2, 2.95), (8.9, 1.1), c='#FF7043', lw=6)
    lab(ax, 3.3, 2.0, '1. Sunlight comes in', fs=22, c='#E65100'); lab(ax, 10.5, 1.9, '2. Heat is trapped', fs=22, c=RED)
    lab(ax, 6.4, 0.45, 'The Earth gets warmer', fs=24, c=RED)
    save(fig, 'greenhouse_big.png')


def rainwater_big():
    fig, ax = canvas(SKY); ax.add_patch(Rectangle((0, 0), W_, 0.6, color='#C9A04A'))
    ax.add_patch(Rectangle((1.5, 0.6), 3.5, 2.4, color='#FFE0B2', ec='#333', lw=2)); ax.add_patch(Polygon([(1.2, 3.0), (5.3, 3.0), (3.25, 4.2)], color='#8D6E63'))
    ax.plot([5.3, 6.9], [3.0, 3.0], color='#555', lw=6); ax.plot([6.9, 6.9], [3.0, 2.3], color='#555', lw=6)
    ax.add_patch(Rectangle((6.3, 0.6), 2.2, 1.7, color='#1E88E5', ec='#0D47A1', lw=3))
    for k in range(8): ax.plot([1.5 + 0.5 * k, 1.3 + 0.5 * k], [4.9, 4.4], color=BLUE, lw=3)
    lab(ax, 10.5, 3.6, 'Rain on the roof', fs=26, c=BLUE); lab(ax, 10.5, 2.4, 'Gutter and pipe', fs=26, c='#555'); lab(ax, 10.6, 1.2, 'Tank: water for\nthe dry season', fs=22, c=NAVY)
    save(fig, 'rainwater_big.png')


def coastal_defence_big():
    fig, ax = canvas(SKY)
    ax.add_patch(Rectangle((0, 0), 5.8, 1.6, color=SEA)); ax.add_patch(Polygon([(5.8, 0), (5.8, 2.6), (6.3, 2.6), (6.3, 0)], color='#9E9E9E'))
    ax.add_patch(Rectangle((6.3, 0), 0.4, 2.2, color='#C9A04A'))
    lab(ax, 3.0, 3.6, 'SEA WALL: stops the waves', fs=24, c=NAVY); arrow(ax, (4.6, 3.3), (5.9, 2.6), c=NAVY)
    ax.add_patch(Rectangle((7.0, 0), 5.8, 2.4, color='#E8C57A')); ax.add_patch(Rectangle((7.0, 0), 5.8, 0.9, color=SEA))
    for x in (7.8, 9.4, 11.0): ax.add_patch(Rectangle((x, 0.3), 0.25, 1.8, color='#6D4C41'))
    lab(ax, 9.9, 3.6, 'GROYNES: keep the sand', fs=24, c='#6D4C41')
    save(fig, 'coastal_defence_big.png')


ALL = ['atmosphere_big', 'instruments_big', 'temp_mean_big', 'convection_gif', 'rainfall_types_big', 'pressure_belts_big', 'itcz_gif', 'seabreeze_gif',
       'mountain_valley_big', 'sun_rays_big', 'water_cycle_gif', 'open_system_big', 'greenhouse_big', 'rainwater_big', 'coastal_defence_big']
if __name__ == '__main__':
    import sys
    for f in (sys.argv[1:] or ALL):
        try: globals()[f](); print('ok', f, flush=True)
        except Exception as e: import traceback; traceback.print_exc(); print('FAIL', f, e, flush=True)
