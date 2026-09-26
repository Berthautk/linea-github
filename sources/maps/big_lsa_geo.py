"""Big-label diagrams and GIFs for Lower Sixth Geomorphology (v2 format)."""
from big_common import *
from matplotlib.patches import Arc
SKY = '#DDEFFB'; SEA = '#2F7ED8'


def geologic_time_big():
    fig, ax = canvas('white')
    eras = [('PRECAMBRIAN', '4,000 My', '#8D6E63', 'Simple life'), ('PALAEOZOIC', '290 My', '#43A047', 'Fish, plants'),
            ('MESOZOIC', '186 My', '#FB8C00', 'Dinosaurs'), ('CENOZOIC', '66 My', '#1E88E5', 'Mammals')]
    x = 0.3
    for (n, d, c, life), w in zip(eras, [4.0, 2.75, 2.75, 2.7]):
        ax.add_patch(Rectangle((x, 2.2), w - 0.08, 1.5, color=c))
        ax.text(x + w / 2, 3.2, n, fontsize=21, fontweight='bold', ha='center', va='center', color='white')
        ax.text(x + w / 2, 2.6, d, fontsize=21, fontweight='bold', ha='center', va='center', color='white')
        ax.text(x + w / 2, 1.6, life, fontsize=22, fontweight='bold', ha='center', color=c)
        x += w
    arrow(ax, (0.3, 4.3), (12.5, 4.3), c='#333', lw=4); ax.text(0.3, 4.55, '4,600 million years ago', fontsize=20, fontweight='bold'); ax.text(12.5, 4.55, 'Today', fontsize=20, fontweight='bold', ha='right')
    ax.text(6.4, 0.6, 'My = million years (not to scale)', fontsize=20, ha='center', color='#555', style='italic')
    save(fig, 'geologic_time_big.png')


def earth_disc_big():
    fig, ax = canvas('white'); cx, cy = 3.0, 0.0
    for r, c in [(4.9, '#6D4C41'), (4.75, '#E65100'), (2.6, '#FFB300'), (1.1, '#FFF176')]:
        ax.add_patch(Wedge((cx, cy), r, 0, 90, color=c))
    for r, t, y in [(4.75, 'Moho: crust | mantle', 4.5), (2.6, 'Gutenberg: mantle | core', 3.0), (1.1, 'Lehmann: outer | inner core', 1.4)]:
        ax.add_patch(Arc((cx, cy), 2 * r, 2 * r, theta1=0, theta2=90, color='black', lw=3, ls='--'))
        ax.plot([cx + r * 0.72, 7.4], [cy + r * 0.69, y], color='#333', lw=2); ax.text(7.5, y, t, fontsize=22, fontweight='bold', va='center')
    lab(ax, 9.9, 0.4, 'Discontinuities = boundaries', fs=22, c=RED)
    save(fig, 'earth_disc_big.png')


def isostasy_gif():
    frames = []; N = 36
    for i in range(N):
        f = i / (N - 1); fig, ax = canvas(SKY)
        ax.add_patch(Rectangle((0, 0), W_, 2.0, color='#E65100', alpha=0.8)); ax.text(0.3, 0.4, 'Mantle (soft, flows slowly)', fontsize=22, fontweight='bold', color='white')
        ice = 1.6 * (1 - f)
        sink = 0.7 * (1 - f)
        ax.add_patch(Rectangle((3.5, 1.3 + (0.7 - sink)), 5.8, 1.6, color='#8D6E63'))
        if ice > 0.05: ax.add_patch(Rectangle((4.0, 2.9 + (0.7 - sink)), 4.8, ice, color='#E3F2FD', ec='#90CAF9', lw=2))
        lab(ax, 6.4, 4.65, 'Heavy ice: the crust sinks' if f < 0.3 else ('The ice melts...' if f < 0.7 else 'The crust rises again (isostatic recovery)'), fs=24, c=NAVY if f < 0.7 else RED)
        frames.append(frame(fig))
    save_gif(frames, 'isostasy.gif', ms=150, hold=12)
    frames[0].save(OUT + 'isostasy_first.png')


def seafloor_gif():
    frames = []; N = 40; cols = ['#1565C0', '#EF6C00']
    for i in range(N):
        f = i / (N - 1); fig, ax = canvas(SKY); ax.add_patch(Rectangle((0, 3.2), W_, 1.8, color=SEA))
        ax.add_patch(Rectangle((0, 0), W_, 1.2, color='#E65100', alpha=0.7))
        n = 1 + int(f * 5); w = 0.55
        for k in range(n):
            c = cols[k % 2]
            for side in (-1, 1):
                x = 6.4 + side * (k * w) - (w if side < 0 else 0)
                ax.add_patch(Rectangle((x, 1.2), w, 2.0, color=c, alpha=0.9))
        ax.add_patch(Polygon([(6.1, 1.2), (6.7, 1.2), (6.4, 3.4)], color='#D32F2F'))
        arrow(ax, (5.6, 2.2), (6.4 - n * w - 0.4, 2.2), c='white', lw=5); arrow(ax, (7.2, 2.2), (6.4 + n * w + 0.4, 2.2), c='white', lw=5)
        lab(ax, 6.4, 4.6, 'Mid-ocean ridge: new rock is made and pushed apart', fs=21, c=RED)
        lab(ax, 6.4, 0.45, 'Stripes of rock record the magnetic field', fs=21, c=NAVY)
        frames.append(frame(fig))
    save_gif(frames, 'seafloor.gif', ms=160, hold=12)
    frames[-1].save(OUT + 'seafloor_last.png')


def mantle_convection_gif():
    frames = []; N = 32
    for i in range(N):
        fig, ax = canvas('white')
        ax.add_patch(Rectangle((0, 3.8), W_, 0.5, color='#6D4C41')); ax.add_patch(Rectangle((0, 0.3), W_, 3.5, color='#FFCC80'))
        ax.add_patch(Rectangle((0, 0), W_, 0.35, color='#E53935'))
        for cx, sgn in [(3.2, 1), (9.6, -1)]:
            t = np.linspace(0, 2 * np.pi, 100); ax.plot(cx + 2.6 * np.cos(t), 2.05 + 1.35 * np.sin(t), color='#BF360C', lw=3, ls='--')
            a = sgn * 2 * np.pi * i / N + (0 if sgn > 0 else np.pi)
            ax.plot(cx + 2.6 * np.cos(a), 2.05 + 1.35 * np.sin(a), 'o', ms=18, color=RED)
        arrow(ax, (5.6, 4.5), (3.6, 4.5), c=NAVY, lw=5); arrow(ax, (7.2, 4.5), (9.2, 4.5), c=NAVY, lw=5)
        lab(ax, 6.4, 4.75, 'Plates move apart', fs=22, c=NAVY)
        lab(ax, 6.4, 2.05, 'Hot rock rises', fs=22, c=RED)
        lab(ax, 6.4, 0.6, 'Heat from the core', fs=20, c='#B71C1C')
        frames.append(frame(fig))
    save_gif(frames, 'mantle_convection.gif', ms=130, hold=0)
    frames[5].save(OUT + 'mantle_convection_mid.png')


def horst_graben_gif():
    frames = []; N = 30
    for i in range(N):
        f = i / (N - 1); d = 1.2 * f; fig, ax = canvas(SKY)
        # three blocks separated by faults; middle drops (graben) then show horst label
        layers = ['#A1887F', '#D7CCC8', '#8D6E63']
        for bx, dy in [(0.3, 0), (4.5, -d), (8.7, 0)]:
            for k, c in enumerate(layers):
                ax.add_patch(Polygon([(bx + 0.4 * (bx == 4.5), 0.4 + k * 0.9 + dy), (bx + 3.8 + 0.4 * (bx != 0.3) - 0.4 * (bx == 4.5), 0.4 + k * 0.9 + dy),
                                      (bx + 3.8 + 0.4 * (bx != 0.3) - 0.4 * (bx == 4.5), 1.3 + k * 0.9 + dy), (bx + 0.4 * (bx == 4.5), 1.3 + k * 0.9 + dy)], color=c, ec='#555', lw=1))
        for x in (4.5, 8.7): ax.plot([x + 0.2, x - 0.2], [0.2, 3.4], color=RED, lw=4, ls='--')
        arrow(ax, (1.8, 4.2), (0.4, 4.2), c=NAVY, lw=5); arrow(ax, (11.0, 4.2), (12.4, 4.2), c=NAVY, lw=5)
        lab(ax, 6.4, 4.4, 'Tension: the crust is pulled apart', fs=22, c=NAVY)
        if f > 0.6: lab(ax, 6.6, 1.2 - d + 1.9, 'RIFT VALLEY (graben)', fs=20, c=RED)
        frames.append(frame(fig))
    save_gif(frames, 'horst_graben.gif', ms=150, hold=12)
    frames[-1].save(OUT + 'horst_graben_last.png')


def folding_gif():
    frames = []; N = 30; x = np.linspace(0.8, 12.0, 300)
    for i in range(N):
        f = i / (N - 1); fig, ax = canvas(SKY); amp = 1.3 * f
        for k, c in enumerate(['#8D6E63', '#D7CCC8', '#A1887F', '#EFEBE9']):
            y0 = 0.5 + k * 0.55
            y = y0 + amp * np.sin((x - 0.8) / 11.2 * 2 * np.pi - np.pi / 2) * 0.9 + amp
            ax.fill_between(x, y, y + 0.55, color=c, ec='#555', lw=1)
        arrow(ax, (0.1, 1.6 + amp), (0.75, 1.6 + amp), c=RED, lw=6); arrow(ax, (12.7, 1.6 + amp), (12.05, 1.6 + amp), c=RED, lw=6)
        lab(ax, 6.4, 4.7, 'Compression: layers are pushed together and fold', fs=22, c=RED)
        if f > 0.7:
            lab(ax, 3.6, 4.0, 'Anticline (up-fold)', fs=20, c=NAVY); lab(ax, 9.3, 0.3, 'Syncline (down-fold)', fs=20, c=NAVY)
        frames.append(frame(fig))
    save_gif(frames, 'folding.gif', ms=150, hold=12)
    frames[-1].save(OUT + 'folding_last.png')


def subduction_big():
    fig, ax = canvas(SKY)
    ax.add_patch(Rectangle((0, 2.9), 6.0, 0.9, color=SEA)); ax.text(1.0, 3.25, 'Ocean', fontsize=22, color='white', fontweight='bold')
    ax.add_patch(Polygon([(0, 2.9), (6.0, 2.9), (7.6, 0.4), (7.0, 0.1), (5.6, 2.4), (0, 2.4)], color='#6D4C41'))
    ax.add_patch(Polygon([(6.0, 2.9), (12.8, 3.4), (12.8, 1.8), (7.6, 1.6)], color='#A1887F'))
    ax.add_patch(Polygon([(9.0, 3.3), (9.6, 4.6), (10.2, 3.35)], color='#5D4037')); ax.add_patch(Rectangle((9.5, 1.9), 0.2, 1.5, color='#E53935'))
    lab(ax, 3.2, 4.5, 'Oceanic plate (heavy)', fs=22, c=NAVY); lab(ax, 11.0, 4.6, 'Volcano', fs=22, c=RED)
    lab(ax, 6.0, 4.0, 'Trench', fs=22, c='#333'); arrow(ax, (6.0, 3.7), (6.05, 3.0), c='#333')
    lab(ax, 10.5, 0.8, 'Benioff zone: earthquakes', fs=22, c=RED)
    for p in [(6.4, 1.9), (6.9, 1.2), (7.2, 0.6)]: ax.plot(*p, '*', ms=22, color='yellow', mec='black')
    arrow(ax, (2.0, 2.0), (4.5, 2.0), c='white', lw=5)
    save(fig, 'subduction_big.png')


def slope_system_big():
    fig, ax = canvas('white')
    for x, t, c in [(0.3, 'INPUTS\nRain, sun heat,\nweathered rock', '#1E88E5'), (4.55, 'PROCESSES\nWeathering,\nmovement down', '#43A047'), (8.8, 'OUTPUTS\nSoil and rock at\nthe foot, into rivers', '#E65100')]:
        ax.add_patch(FancyBboxPatch((x, 0.8), 3.7, 3.4, boxstyle='round,pad=0.05', fc=c, ec='#333', lw=2))
        ax.text(x + 1.85, 2.5, t, fontsize=21, fontweight='bold', ha='center', va='center', color='white')
    arrow(ax, (4.05, 2.5), (4.5, 2.5), c='#333', lw=5); arrow(ax, (8.3, 2.5), (8.75, 2.5), c='#333', lw=5)
    save(fig, 'slope_system_big.png')


def peltier_big():
    fig, ax = chart((12.8, 5.8)); fig.subplots_adjust(0.12, 0.15, 0.97, 0.96)
    ax.set_xlim(-15, 30); ax.set_ylim(0, 2000); ax.set_xlabel('Mean annual temperature (°C)', fontsize=24, fontweight='bold'); ax.set_ylabel('Rainfall (mm/year)', fontsize=22, fontweight='bold')
    ax.fill_between([-15, 30], 0, 2000, color='#FFF8E1')
    ax.fill_between([-15, 5], 300, 2000, color='#BBDEFB'); ax.text(-5, 1300, 'STRONG\nFROST ACTION\n(cold, wet)', fontsize=22, fontweight='bold', ha='center', color='#0D47A1')
    ax.fill_between([15, 30], 1000, 2000, color='#C8E6C9'); ax.text(22.5, 1500, 'STRONG\nCHEMICAL\n(hot, wet)', fontsize=22, fontweight='bold', ha='center', color='#1B5E20')
    ax.text(18, 300, 'WEAK: dry areas', fontsize=22, fontweight='bold', ha='center', color='#8D6E00')
    ax.plot(28, 1000, 'o', ms=16, color=RED, mec='black'); ax.text(27.5, 850, 'Garoua', fontsize=20, fontweight='bold', color=RED, ha='right')
    ax.tick_params(labelsize=20)
    fig.savefig(OUT + 'peltier_big.png', dpi=150, facecolor='white'); plt.close(fig)


def carson_kirkby_big():
    fig, ax = canvas('white')
    A, B, C = (1.2, 0.5), (11.6, 0.5), (6.4, 4.7)
    ax.add_patch(Polygon([A, B, C], fc='#FFF8E1', ec='#333', lw=3))
    lab(ax, 1.4, 0.2, 'SLOW (creep)', fs=22, c=NAVY); lab(ax, 11.3, 0.2, 'WET (flows)', fs=22, c=BLUE); lab(ax, 6.4, 4.85, 'FAST (falls, slides)', fs=22, c=RED)
    for (x, y, t) in [(3.4, 1.2, 'Soil creep'), (8.9, 1.2, 'Mudflow'), (6.4, 3.7, 'Rockfall'), (4.9, 2.4, 'Landslide'), (8.0, 2.4, 'Slump')]:
        ax.text(x, y, t, fontsize=22, fontweight='bold', ha='center', color='#333')
    save(fig, 'carson_kirkby_big.png')


def creep_gif():
    frames = []; N = 30
    for i in range(N):
        f = i / (N - 1); fig, ax = canvas(SKY)
        xs = np.array([0, 12.8]); ax.fill_between(xs, 0, [4.2, 0.8], color='#A1887F')
        for k, x in enumerate([2.0, 4.5, 7.0, 9.5]):
            yb = 4.2 - 3.4 * x / 12.8; tilt = 0.25 + 0.5 * f
            ax.plot([x, x + tilt], [yb, yb + 1.1], color='#5D4037', lw=6)
        for j in range(8): ax.plot(1 + j * 1.4 + 0.3 * f, 4.0 - 3.4 * (1 + j * 1.4) / 12.8 - 0.3, 'o', ms=8, color='#6D4C41')
        arrow(ax, (3.5, 3.9), (7.5, 2.8), c=RED, lw=5)
        lab(ax, 9.0, 4.4, 'Soil creep: very slow movement', fs=24, c=RED); lab(ax, 9.3, 3.5, 'Posts and trees lean', fs=22, c=NAVY)
        frames.append(frame(fig))
    save_gif(frames, 'creep.gif', ms=150, hold=10)
    frames[-1].save(OUT + 'creep_last.png')


def hjulstrom_big():
    fig, ax = chart((12.8, 5.8)); fig.subplots_adjust(0.12, 0.17, 0.97, 0.96)
    d = np.logspace(-3, 3, 200)
    ero = 20 * (d / 0.3) ** -0.35 * (d < 0.3) + 20 * (d / 0.3) ** 0.45 * (d >= 0.3)
    dep = 0.8 * d ** 0.5 * 10
    ax.loglog(d, ero, color=RED, lw=5); ax.loglog(d, dep, color=BLUE, lw=5)
    ax.fill_between(d, ero, 1000, color='#FFCDD2', alpha=0.6); ax.fill_between(d, dep, ero, where=ero > dep, color='#FFF9C4', alpha=0.7); ax.fill_between(d, 0.1, dep, color='#BBDEFB', alpha=0.6)
    ax.text(0.01, 300, 'EROSION', fontsize=26, fontweight='bold', color=RED); ax.text(0.05, 3, 'TRANSPORT', fontsize=24, fontweight='bold', color='#8D6E00')
    ax.text(30, 1.5, 'DEPOSITION', fontsize=24, fontweight='bold', color=BLUE)
    ax.set_xlabel('Particle size (mm): clay → sand → boulders', fontsize=22, fontweight='bold'); ax.set_ylabel('Velocity (cm/s)', fontsize=22, fontweight='bold')
    ax.set_ylim(0.1, 1000); ax.tick_params(labelsize=18)
    fig.savefig(OUT + 'hjulstrom_big.png', dpi=150, facecolor='white'); plt.close(fig)


def load_gif():
    frames = []; N = 36
    for i in range(N):
        fig, ax = canvas(SKY); ax.add_patch(Rectangle((0, 0), W_, 0.6, color='#8D6E63')); ax.add_patch(Rectangle((0, 0.6), W_, 3.4, color='#64B5F6'))
        arrow(ax, (0.3, 3.7), (2.3, 3.7), c='white', lw=5)
        x = (i * 0.12) % 12.8; ax.add_patch(Circle((x, 0.85), 0.25, color='#5D4037')); lab(ax, 2.4, 1.35, 'Traction: rolled', fs=20, c='#5D4037')
        xs = (i * 0.2) % 12.8; ys = 0.75 + 0.8 * abs(np.sin(i * 0.5)); ax.add_patch(Circle((xs, ys), 0.12, color='#8D6E00')); lab(ax, 6.4, 2.2, 'Saltation: bounced', fs=20, c='#8D6E00')
        for k in range(12): ax.plot(((k * 1.1 + i * 0.3) % 12.8), 2.9 + 0.3 * np.sin(k), '.', ms=8, color='#6D4C41')
        lab(ax, 10.3, 3.35, 'Suspension: carried', fs=20, c='#4E342E'); lab(ax, 10.3, 4.55, 'Solution: dissolved', fs=20, c=NAVY)
        frames.append(frame(fig))
    save_gif(frames, 'load.gif', ms=110, hold=0)
    frames[18].save(OUT + 'load_mid.png')


def refraction_big():
    fig, ax = canvas(SEA)
    ax.add_patch(Polygon([(0, 5), (12.8, 5), (12.8, 3.6), (8.2, 3.9), (6.4, 2.3), (4.6, 3.9), (0, 3.6)], color='#E8C57A'))
    for k in range(4):
        y = 0.5 + k * 0.45; xs = np.linspace(0, 12.8, 200); ys = y + 0.9 * np.exp(-((xs - 6.4) / 2.2) ** 2) * (k + 1) / 4
        ax.plot(xs, ys, color='white', lw=3)
    lab(ax, 6.4, 2.9, 'Headland: waves bend and attack it', fs=22, c=RED)
    lab(ax, 2.2, 4.3, 'Bay: weak waves', fs=22, c=NAVY); lab(ax, 10.6, 4.3, 'Bay: weak waves', fs=22, c=NAVY)
    save(fig, 'refraction_big.png')


def cameroon_relief_big():
    import json as _j
    from shapely.geometry import shape as _shape
    fig = plt.figure(figsize=(12.8, 7.2), dpi=150); ax = fig.add_axes([0.02, 0.02, 0.5, 0.96], projection=PC); ax.set_extent((8.3, 16.4, 1.6, 13.2), crs=PC)
    ax.set_facecolor('#CFE6F5'); ax.add_geometries([g for n, g in countries()], PC, facecolor='#EEE', edgecolor='#999', lw=0.6)
    cam = country('Cameroon'); ax.add_geometries([cam], PC, facecolor='#C5E1A5', edgecolor='black', lw=1.5)
    from shapely.geometry import Polygon as SP
    zones = [('#8D6E63', SP([(11.2, 6.2), (15.6, 6.4), (15.3, 8.0), (11.8, 8.0), (11.0, 7.0)]), 'Adamawa Plateau'),
             ('#A1887F', SP([(13.3, 10.3), (14.3, 11.3), (14.1, 10.0), (13.6, 9.9)]), 'Mandara Mts'),
             ('#6D4C41', SP([(9.0, 4.0), (9.4, 4.5), (10.4, 6.2), (11.3, 6.8), (10.8, 5.3), (9.9, 4.6)]), 'Western Highlands'),
             ('#FFF59D', SP([(14.0, 11.5), (15.5, 11.5), (15.2, 13.1), (14.2, 12.9)]), 'Chad Plain'),
             ('#AED581', SP([(9.4, 3.9), (10.4, 3.6), (10.3, 2.4), (9.7, 2.3), (9.2, 3.2)]), 'Coastal lowlands'),
             ('#DCE775', SP([(12.4, 8.3), (14.2, 8.3), (14.3, 9.8), (12.7, 9.6)]), 'Benue lowland'),
             ('#9CCC65', SP([(10.6, 2.4), (16.0, 2.3), (15.2, 4.3), (13.0, 5.8), (11.0, 5.0)]), 'Southern Plateau')]
    for c, g, t in zones: ax.add_geometries([g.intersection(cam)], PC, facecolor=c, edgecolor='none', zorder=2)
    ax.plot(9.17, 4.2, '^', ms=18, color='#B71C1C', mec='black', transform=PC, zorder=5)
    for i, (c, g, t) in enumerate(zones):
        y = 0.9 - i * 0.12
        fig.patches.append(Rectangle((0.56, y - 0.03), 0.04, 0.06, transform=fig.transFigure, fc=c, ec='#333', figure=fig))
        fig.text(0.615, y, t, fontsize=22, fontweight='bold', va='center')
    fig.text(0.56, 0.06, '▲ Mount Cameroon (4,095 m)', fontsize=22, fontweight='bold', color='#B71C1C')
    msave(fig, 'cameroon_relief_big.png')


ALL = ['geologic_time_big', 'earth_disc_big', 'isostasy_gif', 'seafloor_gif', 'mantle_convection_gif', 'horst_graben_gif', 'folding_gif', 'subduction_big',
       'slope_system_big', 'peltier_big', 'carson_kirkby_big', 'creep_gif', 'hjulstrom_big', 'load_gif', 'refraction_big', 'cameroon_relief_big']
if __name__ == '__main__':
    import sys
    for f in (sys.argv[1:] or ALL):
        try: globals()[f](); print('ok', f, flush=True)
        except Exception as e: import traceback; traceback.print_exc(); print('FAIL', f, e, flush=True)
