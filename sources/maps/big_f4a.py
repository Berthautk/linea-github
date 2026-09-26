"""Big-label diagrams and GIFs for Form 4, Lessons 1–13, FS1, PW1, PW2 (v2)."""
from big_common import *
from images2 import africa_land, LAND110
from matplotlib.patches import Arc
DARK = '#0F1B33'


def globe(ax, cx, cy, r, fc='#BBDEFB'):
    ax.add_patch(Circle((cx, cy), r, fc=fc, ec=NAVY, lw=4, zorder=2))


def parallel(ax, cx, cy, r, lat, c, lw=4, ls='-'):
    y = cy + r * np.sin(np.radians(lat)); w = r * np.cos(np.radians(lat))
    ax.add_patch(Ellipse((cx, y), 2 * w, 0.18 * w, fill=False, ec=c, lw=lw, ls=ls, zorder=4))


def meridian(ax, cx, cy, r, k, c, lw=3):
    ax.add_patch(Ellipse((cx, cy), 2 * r * abs(np.sin(np.radians(k))) + 0.001, 2 * r, fill=False, ec=c, lw=lw, zorder=4))


# ---------- FS1: phases of the Moon ----------
def moon_phases_gif():
    frames = []; N = 32
    names = {0: 'New Moon', 8: 'First quarter', 16: 'Full Moon', 24: 'Last quarter'}
    for i in range(N):
        a = 2 * np.pi * i / N  # angle of the Moon around the Earth (0 = between Earth and Sun)
        fig, ax = canvas(DARK)
        sun(ax, 0.7, 2.5, 0.55); lab(ax, 0.9, 0.45, 'Sun', fs=22, c='#FF8F00')
        ex, ey = 4.3, 2.5; ax.add_patch(Circle((ex, ey), 0.45, color='#2F7ED8', zorder=3)); ax.text(ex, ey, 'Earth', color='white', fontsize=15, fontweight='bold', ha='center', va='center', zorder=4)
        ax.add_patch(Circle((ex, ey), 1.75, fill=False, ec='#666', ls='--', lw=2))
        mx, my = ex - 1.75 * np.cos(a), ey - 1.75 * np.sin(a)
        ax.add_patch(Circle((mx, my), 0.28, color='#333', zorder=5)); ax.add_patch(Wedge((mx, my), 0.28, 90, 270, color='#EEE', zorder=6))  # lit half faces the Sun (left)
        # what we see from the Earth
        cx, cy, R = 10.0, 2.6, 1.55
        ax.add_patch(Circle((cx, cy), R, color='#333', zorder=3))
        ph = (i / N) % 1.0  # 0 new, .5 full
        lit = (1 - np.cos(2 * np.pi * ph)) / 2
        xs = np.linspace(-R, R, 200); yy = np.sqrt(np.maximum(R * R - xs ** 2, 0))
        term = (1 - 2 * lit) * yy  # terminator ellipse half-width
        ys = np.linspace(-R, R, 300); hw = np.sqrt(np.maximum(R * R - ys ** 2, 0))
        tx = hw * (1 - 2 * lit)
        if ph <= 0.5:  # waxing: right side lit
            ax.fill_betweenx(cy + ys, cx + tx, cx + hw, color='#F5F5DC', zorder=4)
        else:
            ax.fill_betweenx(cy + ys, cx - hw, cx - tx, color='#F5F5DC', zorder=4)
        nm = min(names, key=lambda k: min(abs(k - i), N - abs(k - i)))
        if min(abs(nm - i), N - abs(nm - i)) <= 1: lab(ax, cx, 0.45, names[nm], fs=28, c=RED)
        lab(ax, cx, 4.65, 'What we see', fs=24, c=NAVY)
        frames.append(frame(fig))
    save_gif(frames, 'moon_phases.gif', ms=220, hold=0)
    frames[16].save(OUT + 'moon_phases_full.png')


def moon_phases_big():
    fig, ax = canvas('white')
    for k, (t, ph) in enumerate([('New Moon', 0), ('First quarter', 0.25), ('Full Moon', 0.5), ('Last quarter', 0.75)]):
        cx, cy, R = 1.7 + k * 3.15, 2.8, 1.15
        ax.add_patch(Circle((cx, cy), R, color='#333', zorder=3))
        ys = np.linspace(-R, R, 300); hw = np.sqrt(np.maximum(R * R - ys ** 2, 0)); lit = (1 - np.cos(2 * np.pi * ph)) / 2; tx = hw * (1 - 2 * lit)
        if 0 < ph <= 0.5: ax.fill_betweenx(cy + ys, cx + tx, cx + hw, color='#F2D95C', zorder=4)
        elif ph > 0.5: ax.fill_betweenx(cy + ys, cx - hw, cx - tx, color='#F2D95C', zorder=4)
        ax.text(cx, 0.9, t, fontsize=26, fontweight='bold', ha='center', color=NAVY)
    save(fig, 'moon_phases_big.png')


# ---------- L2: latitudes and longitudes ----------
def latitudes_big():
    fig, ax = canvas('white'); cx, cy, r = 3.3, 2.5, 2.3; globe(ax, cx, cy, r)
    for lat, t, c, ls in [(0, 'Equator 0°', RED, '-'), (23.5, 'Tropic of Cancer 23½°N', ORANGE, '--'), (-23.5, 'Tropic of Capricorn 23½°S', ORANGE, '--'),
                          (66.5, 'Arctic Circle 66½°N', BLUE, '--'), (-66.5, 'Antarctic Circle 66½°S', BLUE, '--')]:
        parallel(ax, cx, cy, r, lat, c, ls=ls); y = cy + r * np.sin(np.radians(lat))
        ax.plot([cx + r * np.cos(np.radians(lat)), 6.6], [y, y], color=c, lw=2)
        ax.text(6.7, y, t, fontsize=26, fontweight='bold', color=c, va='center')
    save(fig, 'latitudes_big.png')


def longitudes_big():
    fig, ax = canvas('white'); cx, cy, r = 3.3, 2.5, 2.3; globe(ax, cx, cy, r)
    for k in (30, 60): meridian(ax, cx, cy, r, k, '#5C6BC0', 2)
    ax.plot([cx, cx], [cy - r, cy + r], color=RED, lw=5, zorder=5)
    ax.plot(cx, cy + r, 'o', ms=14, color=NAVY, zorder=6); ax.plot(cx, cy - r, 'o', ms=14, color=NAVY, zorder=6)
    lab(ax, 9.3, 3.9, 'Greenwich Meridian 0°', fs=28, c=RED); arrow(ax, (6.6, 3.9), (cx + 0.1, 3.5), c=RED)
    lab(ax, 9.3, 2.5, 'Lines meet at the Poles', fs=28, c=NAVY); arrow(ax, (6.8, 2.8), (cx + 0.2, cy + r - 0.05), c=NAVY)
    lab(ax, 9.3, 1.1, 'Opposite side: 180°', fs=28, c='#5C6BC0')
    save(fig, 'longitudes_big.png')


def grid_map(name, ext, step, dot=None, dotlab=None, towns=(), title_fs=24, shade=None):
    cs, land = africa_land()
    fig = plt.figure(figsize=(12.8, 7.2), dpi=150); ax = fig.add_axes([0.2, 0.04, 0.6, 0.9], projection=PC); ax.set_extent(ext, crs=PC)
    ax.set_facecolor('#CFE6F5'); ax.add_geometries([g for n, g in countries()], PC, facecolor='#F2EFE6', edgecolor='#999', lw=0.8)
    if shade: ax.add_geometries([country(shade)], PC, facecolor='#F4B6B0', edgecolor=RED, lw=2)
    for x in np.arange(np.ceil(ext[0] / step) * step, ext[1] + 0.01, step):
        ax.plot([x, x], ext[2:], color='#1565C0', lw=1.5, transform=PC, zorder=5)
        fig.text(0.2 + 0.6 * (x - ext[0]) / (ext[1] - ext[0]), 0.955, f'{abs(x):.0f}°{"E" if x > 0 else ("W" if x < 0 else "")}', fontsize=title_fs, fontweight='bold', ha='center', color='#1565C0')
    for y in np.arange(np.ceil(ext[2] / step) * step, ext[3] + 0.01, step):
        ax.plot(ext[:2], [y, y], color='#1565C0', lw=1.5, transform=PC, zorder=5)
        fig.text(0.19, 0.04 + 0.9 * (y - ext[2]) / (ext[3] - ext[2]), f'{abs(y):.0f}°{"N" if y > 0 else ("S" if y < 0 else "")}', fontsize=title_fs, fontweight='bold', ha='right', va='center', color='#1565C0')
    for tw in towns:
        x, y, t = tw[:3]; dx, dy = (tw[3], tw[4]) if len(tw) > 3 else (0.25, 0.2)
        ax.plot(x, y, 'o', ms=12, color='black', transform=PC, zorder=8); ax.text(x + dx, y + dy, t, fontsize=22, fontweight='bold', transform=PC, zorder=9, bbox=dict(fc='white', ec='none', alpha=0.8))
    if dot: ax.plot(dot[0], dot[1], 'o', ms=18, color=RED, mec='black', mew=2, transform=PC, zorder=10)
    msave(fig, name)
    return fig


def cameroon_grid_big():
    grid_map('cameroon_grid_big.png', (8, 17, 1.5, 13.5), 2, towns=[(13.4, 9.3, 'Garoua'), (14.32, 10.6, 'Maroua'), (13.58, 7.32, 'Ngaoundéré'), (11.52, 3.87, 'Yaoundé', 0.25, -0.6), (9.7, 4.05, 'Douala', -0.3, 0.35)], shade='Cameroon')


def africa_grid_big():
    grid_map('africa_grid_big.png', (-20, 55, -36, 38), 10, dot=(12, 4), title_fs=20, shade='Cameroon')


def coordinates_gif():
    """PW1: from a dot, follow the lines to the left (latitude) then to the top (longitude)."""
    ext = (8, 17, 1.5, 13.5); X0, Y0 = 13.4, 9.3; frames = []
    for i in range(30):
        fig = plt.figure(figsize=(12.8, 7.2), dpi=80); ax = fig.add_axes([0.12, 0.04, 0.5, 0.9], projection=PC); ax.set_extent(ext, crs=PC)
        ax.set_facecolor('#CFE6F5'); ax.add_geometries([g for n, g in countries()], PC, facecolor='#F2EFE6', edgecolor='#999', lw=0.8)
        ax.add_geometries([country('Cameroon')], PC, facecolor='#F4B6B0', edgecolor=RED, lw=2)
        for x in range(8, 18, 2):
            ax.plot([x, x], ext[2:], color='#1565C0', lw=1.2, transform=PC); fig.text(0.12 + 0.5 * (x - 8) / 9, 0.955, f'{x}°E', fontsize=22, fontweight='bold', ha='center', color='#1565C0')
        for y in range(2, 14, 2):
            ax.plot(ext[:2], [y, y], color='#1565C0', lw=1.2, transform=PC); fig.text(0.11, 0.04 + 0.9 * (y - 1.5) / 12, f'{y}°N', fontsize=22, fontweight='bold', ha='right', va='center', color='#1565C0')
        ax.plot(X0, Y0, 'o', ms=16, color=RED, mec='black', mew=2, transform=PC, zorder=10)
        ax.text(X0 + 0.3, Y0 + 0.3, 'Garoua', fontsize=24, fontweight='bold', transform=PC, zorder=11, bbox=dict(fc='white', ec='none'))
        f1 = min(i / 10, 1); f2 = min(max((i - 12) / 10, 0), 1)
        ax.plot([X0, X0 - (X0 - 8) * f1], [Y0, Y0], color=RED, lw=5, transform=PC, zorder=9)
        if f2 > 0: ax.plot([X0, X0], [Y0, Y0 + (13.5 - Y0) * f2], color=GREEN, lw=5, transform=PC, zorder=9)
        if i >= 10: fig.text(0.66, 0.55, '1. Latitude: 9°N', fontsize=28, fontweight='bold', color=RED)
        if i >= 22: fig.text(0.66, 0.35, '2. Longitude: 13°E', fontsize=28, fontweight='bold', color=GREEN)
        buf = io.BytesIO(); fig.savefig(buf, format='png', dpi=80, facecolor='white'); plt.close(fig); buf.seek(0); frames.append(Image.open(buf).convert('RGB'))
    save_gif(frames, 'coordinates.gif', ms=160, hold=14)
    frames[-1].save(OUT + 'coordinates_last.png')


# ---------- L3: great circles, IDL ----------
def great_circles_big():
    fig, ax = canvas('white')
    for cx, t, c, lat in [(3.2, 'GREAT CIRCLE:\ncuts the Earth in two\nequal halves', RED, 0), (9.6, 'SMALL CIRCLE:\ndoes not cut it into\nequal halves', BLUE, 45)]:
        globe(ax, cx, 3.0, 1.75); parallel(ax, cx, 3.0, 1.75, lat, c, lw=6)
        ax.text(cx, 0.6, t, fontsize=24, fontweight='bold', ha='center', va='center', color=c)
    save(fig, 'great_circles_big.png')


def idl_big():
    fig, ax = canvas('#CFE6F5')
    ax.add_patch(FancyBboxPatch((0.2, 0.6), 2.6, 3.8, boxstyle='round,pad=0.1', fc='#F2E3B3', ec='#8A6A10', lw=2)); ax.text(1.5, 2.5, 'ASIA\nAUSTRALIA', fontsize=26, fontweight='bold', ha='center', va='center')
    ax.add_patch(FancyBboxPatch((10.0, 0.6), 2.6, 3.8, boxstyle='round,pad=0.1', fc='#F2E3B3', ec='#8A6A10', lw=2)); ax.text(11.3, 2.5, 'AMERICA', fontsize=26, fontweight='bold', ha='center', va='center')
    xs = [6.4, 6.4, 6.9, 6.9, 6.1, 6.1, 6.4, 6.4]; ys = [5.0, 4.0, 3.6, 2.8, 2.2, 1.2, 0.8, 0.0]
    ax.plot(xs, ys, color=RED, lw=7)
    lab(ax, 6.5, 4.55, 'International Date Line (180°)', fs=24, c=RED)
    lab(ax, 4.3, 1.5, 'West: MONDAY', fs=28, c=NAVY); lab(ax, 8.6, 1.5, 'East: SUNDAY', fs=28, c=GREEN)
    ax.text(8.8, 3.3, 'PACIFIC\nOCEAN', fontsize=22, ha='center', va='center', color='#0B3D91', fontweight='bold')
    save(fig, 'idl_big.png')


# ---------- L4, PW2: time ----------
def time_line_big():
    fig, ax = canvas('white')
    ax.plot([0.6, 12.2], [2.6, 2.6], color='#333', lw=4)
    for k, lon in enumerate([-45, -30, -15, 0, 15, 30, 45]):
        x = 0.9 + k * 1.83; h = 12 + lon // 15
        ax.plot([x, x], [2.4, 2.8], color='#333', lw=4)
        ax.text(x, 1.9, f'{abs(lon)}°{"E" if lon > 0 else ("W" if lon < 0 else "")}', fontsize=26, fontweight='bold', ha='center', va='center')
        ax.text(x, 3.3, f'{h}:00', fontsize=28, fontweight='bold', ha='center', color=RED if lon == 0 else (GREEN if lon > 0 else BLUE))
    lab(ax, 3.2, 4.45, 'WEST: behind (−)', fs=26, c=BLUE); lab(ax, 9.6, 4.45, 'EAST: ahead (+)', fs=26, c=GREEN)
    lab(ax, 6.4, 0.7, '15° = 1 hour     1° = 4 minutes', fs=28, c=RED)
    save(fig, 'time_line_big.png')


def time_zones_big():
    ext = (-180, 180, -58, 75); fig, ax = map_axes(ext, (12.8, 5.4)); ax.set_position([0, 0, 1, 1])
    for k in range(24):
        x0 = -187.5 + k * 15
        ax.add_patch(Rectangle((x0, -58), 15, 133, color='#FFE082' if k % 2 else '#FFF8E1', alpha=0.55, transform=PC, zorder=2))
    ax.add_geometries([LAND110], PC, facecolor='none', edgecolor='#555', lw=0.8, zorder=3)
    for x, y, t, c in [(0, -48, 'GMT', RED), (15, 60, 'GMT+1\nCameroon', RED), (116, -48, 'GMT+8\nChina', NAVY), (-75, -48, 'GMT−5\nNew York', NAVY)]:
        mlab(ax, x, y, t, fs=22, c=c)
    ax.plot(13.4, 9.3, 'o', ms=12, color=RED, mec='black', transform=PC, zorder=10)
    msave(fig, 'time_zones_big.png')


def time_calc_big():
    fig, ax = canvas('white')
    rows = [('Garoua 13°E: 12:00', NAVY), ('Town 43°E: ?', NAVY), ('Difference: 43° − 13° = 30°', '#333'), ('30° × 4 min = 120 min = 2 h', '#333'), ('East, so we ADD: 12:00 + 2 h = 14:00', RED)]
    for k, (t, c) in enumerate(rows): ax.text(0.5, 4.5 - k * 0.95, t, fontsize=30, fontweight='bold', color=c, va='center')
    save(fig, 'time_calc_big.png')


# ---------- L5, L6: rotation, revolution ----------
def rotation_gif():
    frames = []; N = 36
    for i in range(N):
        fig, ax = canvas(DARK); sun(ax, 1.0, 2.5, 0.7)
        for k in range(5): arrow(ax, (2.2, 1.3 + k * 0.6), (4.0, 1.3 + k * 0.6), c='#FFD54F', lw=3, ms=22)
        cx, cy, r = 7.0, 2.5, 2.1
        ax.add_patch(Circle((cx, cy), r, color='#2F7ED8', zorder=2)); ax.add_patch(Wedge((cx, cy), r, 90, 270, color='#FFF3C4', alpha=0.35, zorder=3))
        ax.add_patch(Wedge((cx, cy), r, -90, 90, color='#000000', alpha=0.5, zorder=3))
        a = np.pi - 2 * np.pi * i / N  # Garoua moves anticlockwise (west to east) seen from above the North Pole
        gx, gy = cx + 1.6 * np.cos(a), cy + 1.6 * np.sin(a) * 0.35
        ax.plot(gx, gy, 'o', ms=18, color=RED, mec='white', mew=2, zorder=6)
        ax.add_patch(Arc((cx, cy + 2.35), 2.6, 0.7, theta1=200, theta2=340, color='white', lw=3, zorder=5)); arrow(ax, (cx + 1.1, cy + 2.15), (cx + 1.35, cy + 2.3), c='white', lw=3, ms=22)
        day = np.cos(a) < 0
        lab(ax, 10.85, 4.4, 'Garoua: DAY' if day else 'Garoua: NIGHT', fs=26, c=ORANGE if day else BLUE)
        lab(ax, 10.7, 0.6, '1 turn = 24 hours', fs=24, c=NAVY)
        ax.text(cx - 1.2, cy - 2.35, 'DAY', fontsize=22, fontweight='bold', color='#FFD54F', ha='center'); ax.text(cx + 1.2, cy - 2.35, 'NIGHT', fontsize=22, fontweight='bold', color='white', ha='center')
        frames.append(frame(fig))
    save_gif(frames, 'rotation.gif', ms=140, hold=0)
    frames[9].save(OUT + 'rotation_mid.png')


def revolution_gif():
    frames = []; N = 48
    pos = [(0, '21 March: Sun overhead\nat the Equator'), (12, '21 June: Sun overhead\nat the Tropic of Cancer'), (24, '23 September: Sun overhead\nat the Equator'), (36, '22 December: Sun overhead\nat the Tropic of Capricorn')]
    for i in range(N):
        fig, ax = canvas(DARK); cx, cy = 4.3, 2.5
        ax.add_patch(Ellipse((cx, cy), 7.2, 3.8, fill=False, ec='#888', ls='--', lw=2)); sun(ax, cx, cy, 0.55)
        a = -np.pi / 2 + 2 * np.pi * i / N
        ex, ey = cx + 3.6 * np.cos(a), cy + 1.9 * np.sin(a)
        ax.add_patch(Circle((ex, ey), 0.38, color='#2F7ED8', zorder=5))
        tilt = np.radians(23.5); ax.plot([ex - 0.55 * np.sin(tilt), ex + 0.55 * np.sin(tilt)], [ey - 0.55 * np.cos(tilt), ey + 0.55 * np.cos(tilt)], color='white', lw=2.5, zorder=6)
        near = min(pos, key=lambda p: min(abs(p[0] - i), N - abs(p[0] - i)))
        if min(abs(near[0] - i), N - abs(near[0] - i)) <= 3: lab(ax, 10.45, 2.5, near[1], fs=21, c=RED)
        lab(ax, 10.45, 0.45, 'One orbit = 365¼ days', fs=22, c=NAVY)
        frames.append(frame(fig))
    save_gif(frames, 'revolution.gif', ms=150, hold=0)
    frames[12].save(OUT + 'revolution_june.png')


def overhead_sun_big():
    fig, ax = canvas('white'); cx, cy, r = 3.6, 2.5, 2.2; globe(ax, cx, cy, r)
    for lat, c in [(23.5, ORANGE), (0, RED), (-23.5, ORANGE)]: parallel(ax, cx, cy, r, lat, c, lw=4)
    for lat, t in [(23.5, '21 June: Tropic of Cancer'), (0, '21 March, 23 Sept: Equator'), (-23.5, '22 Dec: Tropic of Capricorn')]:
        y = cy + r * np.sin(np.radians(lat)); ax.plot([cx + r * np.cos(np.radians(lat)), 6.4], [y, y], color='#555', lw=2)
        ax.text(6.5, y, t, fontsize=25, fontweight='bold', va='center', color=RED if lat == 0 else ORANGE)
    ax.text(0.2, 4.7, 'Where the Sun is overhead at midday', fontsize=24, fontweight='bold', color=NAVY)
    save(fig, 'overhead_sun_big.png')


# ---------- L7: structure of the Earth ----------
LAYERS = [('Crust', '#6D4C41', 1.0), ('Mantle', '#E65100', 0.84), ('Outer core', '#FFB300', 0.52), ('Inner core', '#FFF176', 0.24)]


def earth_layers_big():
    fig, ax = canvas('white'); cx, cy, R = 3.2, 2.5, 2.35
    for t, c, f in LAYERS: ax.add_patch(Circle((cx, cy), R * f, color=c, zorder=2))
    ax.add_patch(Circle((cx, cy), R * 0.97, color=LAYERS[1][1], zorder=2)); ax.add_patch(Circle((cx, cy), R * 0.52, color=LAYERS[2][1], zorder=3)); ax.add_patch(Circle((cx, cy), R * 0.24, color=LAYERS[3][1], zorder=4))
    info = [('Crust: thin, solid rock', 4.4, R * 0.99), ('Mantle: very hot rock', 3.2, R * 0.75), ('Outer core: liquid iron', 2.0, R * 0.4), ('Inner core: solid iron', 0.8, R * 0.12)]
    for (t, y, rr), (_, c, _) in zip(info, LAYERS):
        ax.plot([cx + rr * 0.7, 6.3], [cy + rr * 0.7, y], color='#333', lw=2, zorder=6); ax.plot(cx + rr * 0.7, cy + rr * 0.7, 'o', color='black', ms=7, zorder=7)
        ax.text(6.4, y, t, fontsize=25, fontweight='bold', va='center', color='#222', bbox=dict(boxstyle='round,pad=0.2', fc='white', ec=c, lw=3))
    save(fig, 'earth_layers_big.png')


def earth_depth_gif():
    frames = []; N = 34
    stops = [(0, 'Crust', '15 °C', 0), (35, 'Mantle', '1,000 °C', 0.15), (2900, 'Outer core', '4,000 °C', 0.55), (5150, 'Inner core', '5,500 °C', 0.85), (6370, 'Centre of the Earth', '6,000 °C', 1.0)]
    for i in range(N):
        f = i / (N - 1); fig, ax = canvas('white')
        cols = [('#6D4C41', 0, 0.03), ('#E65100', 0.03, 0.46), ('#FFB300', 0.46, 0.81), ('#FFF176', 0.81, 1.0)]
        for c, a, b in cols: ax.add_patch(Rectangle((0.8, 4.6 - 4.2 * b), 3.0, 4.2 * (b - a), color=c))
        y = 4.6 - 4.2 * f; ax.add_patch(Polygon([(2.3, y), (2.0, y + 0.35), (2.6, y + 0.35)], color='black', zorder=6)); ax.plot([2.3, 2.3], [4.6, y + 0.35], color='black', lw=3)
        cur = [s for s in stops if s[3] <= f + 1e-6][-1]
        depth = int(6370 * f ** 1.0)
        lab(ax, 8.4, 3.8, f'Depth: {depth:,} km', fs=32, c=NAVY); lab(ax, 8.4, 2.5, cur[1], fs=34, c=RED); lab(ax, 8.4, 1.2, 'About ' + cur[2], fs=32, c=ORANGE)
        frames.append(frame(fig))
    save_gif(frames, 'earth_depth.gif', ms=200, hold=12)
    frames[-1].save(OUT + 'earth_depth_last.png')


# ---------- L8: rock cycle ----------
def rock_cycle_big():
    fig, ax = canvas('white')
    pos = {'MAGMA': (6.4, 4.45, '#C62828'), 'IGNEOUS': (2.3, 2.5, '#5D4037'), 'SEDIMENTARY': (6.4, 0.55, '#C49A3A'), 'METAMORPHIC': (10.35, 2.5, '#546E7A')}
    for t, (x, y, c) in pos.items(): ax.text(x, y, t + ('' if t == 'MAGMA' else ' ROCK'), fontsize=24, fontweight='bold', color='white', ha='center', va='center', bbox=dict(boxstyle='round,pad=0.35', fc=c, ec='#222', lw=3), zorder=5)
    for a, b, t, tx, ty in [('MAGMA', 'IGNEOUS', '1. cooling', 2.6, 3.9), ('IGNEOUS', 'SEDIMENTARY', '2. erosion, layers', 2.4, 1.1),
                            ('SEDIMENTARY', 'METAMORPHIC', '3. heat, pressure', 10.3, 1.1), ('METAMORPHIC', 'MAGMA', '4. melting', 10.4, 3.9)]:
        (x1, y1, _), (x2, y2, _) = pos[a], pos[b]
        arrow(ax, (x1 + (x2 - x1) * 0.28, y1 + (y2 - y1) * 0.28), (x1 + (x2 - x1) * 0.72, y1 + (y2 - y1) * 0.72), c='#333', lw=5)
        ax.text(tx, ty, t, fontsize=24, fontweight='bold', color=RED, ha='center')
    save(fig, 'rock_cycle_big.png')


# ---------- L9: jigsaw fit ----------
def jigsaw_gif():
    import shapely.affinity as sa
    C = dict(countries()); from shapely.ops import unary_union
    AF = unary_union([g for n, g in countries() if g.representative_point().x > -20 and g.representative_point().x < 52 and -36 < g.representative_point().y < 38 and n not in ('Madagascar',)]).intersection(box(-20, -36, 52, 38))
    SAM = unary_union([g for n, g in countries() if -82 < g.representative_point().x < -34 and -56 < g.representative_point().y < 13]).intersection(box(-82, -56, -34, 13))
    frames = []; N = 30
    for i in range(N):
        f = min(i / (N - 8), 1.0)
        g = sa.translate(sa.rotate(SAM, -45 * f, origin=(-40, -10)), 25 * f, 3 * f)
        fig, ax = plt.subplots(figsize=(12.8, 6.4), dpi=80); fig.subplots_adjust(0, 0, 1, 1)
        ax.set_xlim(-85, 55); ax.set_ylim(-58, 40); ax.set_aspect('equal'); ax.axis('off'); ax.add_patch(Rectangle((-85, -58), 140, 98, color='#CFE6F5'))
        for geom, c in [(AF, '#E0A548'), (g, '#7CB342')]:
            for p in getattr(geom, 'geoms', [geom]):
                if p.area > 2: ax.add_patch(Polygon(np.array(p.exterior.coords), fc=c, ec='#333', lw=1.5))
        ax.text(25, 5, 'AFRICA', fontsize=30, fontweight='bold', ha='center'); c = g.centroid; ax.text(c.x, c.y, 'SOUTH\nAMERICA', fontsize=26, fontweight='bold', ha='center', va='center')
        lab(ax, -15, 34, 'Today' if i < 3 else ('The coasts fit together' if f >= 1 else 'Close the Atlantic Ocean...'), fs=28, c=RED)
        buf = io.BytesIO(); fig.savefig(buf, format='png', dpi=80, facecolor='white'); plt.close(fig); buf.seek(0); frames.append(Image.open(buf).convert('RGB'))
    save_gif(frames, 'jigsaw.gif', ms=160, hold=14)
    frames[-1].save(OUT + 'jigsaw_last.png')


# ---------- L10: plates ----------
def plates_big():
    import json as _j
    ext = (-180, 180, -60, 75); fig, ax = map_axes(ext, (12.8, 5.4)); ax.set_position([0, 0, 1, 1])
    pb = _j.load(open('/home/claude/maps/pb2002.json'))
    feats = pb['features'] if 'features' in pb else []
    for f_ in feats:
        g = f_['geometry']; lines = g['coordinates'] if g['type'] == 'MultiLineString' else [g['coordinates']]
        for l in lines:
            xs, ys = zip(*l); ax.plot(xs, ys, color=RED, lw=2.5, transform=PC, zorder=5)
    for x, y, t in [(20, 5, 'AFRICAN'), (80, 55, 'EURASIAN'), (-100, 50, 'NORTH AMERICAN'), (-58, -20, 'SOUTH\nAMERICAN'), (-150, -10, 'PACIFIC'), (100, -30, 'INDO-\nAUSTRALIAN'), (30, -58, 'ANTARCTIC')]:
        mlab(ax, x, y, t, fs=20, c='#4E342E')
    ax.plot(12, 5.5, '*', ms=26, color='#1565C0', mec='black', transform=PC, zorder=10)
    msave(fig, 'plates_big.png')


def margins_gif():
    frames = []; N = 30
    for i in range(N):
        f = i / (N - 1); fig, ax = canvas('#DDEFFB')
        # left: constructive (apart)
        d = 0.9 * f
        ax.add_patch(Rectangle((0.3 - d, 1.5), 2.6, 0.9, color='#8D6E63')); ax.add_patch(Rectangle((3.4 + d, 1.5), 2.6, 0.9, color='#A1887F'))
        ax.add_patch(Polygon([(2.9 - d, 1.5), (3.4 + d, 1.5), (3.15, 0.2)], color='#E53935'))
        arrow(ax, (2.2 - d, 2.8), (1.0 - d, 2.8), c=NAVY, lw=5); arrow(ax, (4.1 + d, 2.8), (5.3 + d, 2.8), c=NAVY, lw=5)
        lab(ax, 3.15, 4.4, 'Plates move APART', fs=26, c=GREEN); lab(ax, 3.15, 0.35, 'Magma rises', fs=22, c=RED)
        # right: destructive (together, one sinks)
        s = 0.9 * f
        ax.add_patch(Polygon([(6.8 + s, 2.4), (9.3 + s, 2.4), (9.9 + s, 1.0 - 0.8 * f), (9.3 + s, 1.5), (6.8 + s, 1.5)], color='#8D6E63'))
        ax.add_patch(Rectangle((9.6, 1.5), 3.0, 1.3, color='#A1887F')); ax.add_patch(Polygon([(10.4, 2.8), (10.9, 3.9), (11.4, 2.8)], color='#6D4C41'))
        arrow(ax, (7.2, 3.1), (8.4, 3.1), c=NAVY, lw=5); arrow(ax, (12.4, 3.4), (11.6, 3.4), c=NAVY, lw=5)
        lab(ax, 9.7, 4.4, 'Plates move TOGETHER', fs=26, c=RED); lab(ax, 9.5, 0.35, 'One plate sinks', fs=22, c=RED)
        frames.append(frame(fig))
    save_gif(frames, 'margins.gif', ms=160, hold=12)
    frames[-1].save(OUT + 'margins_last.png')


# ---------- L11: volcano ----------
def volcano_big():
    fig, ax = canvas('#DDEFFB')
    ax.add_patch(Rectangle((0, 0), W_, 1.4, color='#8D6E63'))
    ax.add_patch(Polygon([(2.2, 1.4), (5.6, 4.2), (6.6, 4.2), (10.2, 1.4)], color='#6D4C41'))
    ax.add_patch(Ellipse((6.1, 0.55), 3.0, 0.8, color='#E53935')); ax.add_patch(Rectangle((5.95, 0.55), 0.3, 3.6, color='#E53935'))
    for k in range(5): ax.add_patch(Circle((5.6 + 0.3 * k, 4.55 + 0.1 * (k % 2)), 0.25, color='#9E9E9E', alpha=0.8))
    ax.add_patch(Polygon([(6.6, 4.2), (7.5, 3.1), (7.3, 3.4), (6.4, 4.2)], color='#FF7043'))
    for t, (x, y), (tx, ty) in [('Crater', (6.1, 4.15), (2.2, 4.5)), ('Vent (pipe)', (6.1, 2.8), (2.0, 3.0)), ('Magma chamber', (5.0, 0.5), (2.2, 0.35)), ('Lava', (7.3, 3.4), (10.5, 3.9)), ('Ash and gas', (6.3, 4.7), (10.3, 4.75))]:
        lab(ax, tx, ty, t, fs=26, c=RED if t in ('Lava', 'Magma chamber') else NAVY); arrow(ax, (tx + (1.2 if tx < 6 else -1.3), ty), (x, y), c='#333', lw=3, ms=25)
    save(fig, 'volcano_big.png')


# ---------- L13: earthquake ----------
def quake_gif():
    frames = []; N = 26
    for i in range(N):
        fig, ax = canvas('#DDEFFB'); ax.add_patch(Rectangle((0, 0), W_, 3.6, color='#A1887F'))
        ax.plot([4.0, 8.8], [0.0, 3.6], color='#4E342E', lw=4, ls='--')
        fx, fy = 6.2, 1.6
        for k in range(4):
            r = (i * 0.25 + k * 1.0) % 4.0
            if r > 0.1: ax.add_patch(Circle((fx, fy), r, fill=False, ec=RED, lw=3, alpha=max(0, 1 - r / 4)))
        ax.plot(fx, fy, '*', ms=34, color='yellow', mec='black', zorder=6)
        ax.plot(fx, 3.6, 'v', ms=26, color=RED, mec='black', zorder=6)
        lab(ax, 2.6, 1.6, 'FOCUS', fs=30, c=RED); arrow(ax, (3.5, 1.6), (5.8, 1.6), c=RED, lw=4); lab(ax, 6.2, 4.5, 'EPICENTRE', fs=30, c=NAVY)
        lab(ax, 10.6, 0.6, 'Fault', fs=22, c='#4E342E')
        shake = 0.08 * np.sin(i * 2.2)
        for hx in (1.2, 10.5): ax.add_patch(Rectangle((hx + shake, 3.6), 0.9, 0.7, color='#FFF3E0', ec='#333', lw=2))
        frames.append(frame(fig))
    save_gif(frames, 'quake.gif', ms=120, hold=0)
    frames[10].save(OUT + 'quake_mid.png')


ALL = ['moon_phases_gif', 'moon_phases_big', 'latitudes_big', 'longitudes_big', 'cameroon_grid_big', 'africa_grid_big', 'coordinates_gif', 'great_circles_big', 'idl_big',
       'time_line_big', 'time_zones_big', 'time_calc_big', 'rotation_gif', 'revolution_gif', 'overhead_sun_big', 'earth_layers_big', 'earth_depth_gif', 'rock_cycle_big',
       'jigsaw_gif', 'plates_big', 'margins_gif', 'volcano_big', 'quake_gif']
if __name__ == '__main__':
    import sys
    for f in (sys.argv[1:] or ALL):
        try: globals()[f](); print('ok', f, flush=True)
        except Exception as e: import traceback; traceback.print_exc(); print('FAIL', f, e, flush=True)
