"""Big-label diagrams and GIFs for Lower Sixth Hydrology (Module 1, lessons 22–34, FS4, PW1, PW2)."""
import sys
from big_common import *
from images2 import rivers
SKY = '#DDEFFB'; SEA = '#2F7ED8'; SOIL = '#A1887F'; GROUND = '#8BC34A'


def box_(ax, x, y, w, h, t, c, fs=19, tc='white'):
    ax.add_patch(FancyBboxPatch((x, y), w, h, boxstyle='round,pad=0.05', fc=c, ec='white', lw=2, zorder=5))
    ax.text(x + w / 2, y + h / 2, t, fontsize=fs, fontweight='bold', ha='center', va='center', color=tc, zorder=6)


def world_water_big():
    fig, ax = canvas('white')
    ax.add_patch(Rectangle((0.4, 3.2), 11.0, 1.0, color=SEA)); ax.add_patch(Rectangle((11.4, 3.2), 0.3, 1.0, color='#80DEEA'))
    ax.text(6.0, 3.7, 'OCEANS: salt water 97.5 %', fontsize=26, fontweight='bold', ha='center', va='center', color='white')
    ax.text(11.2, 4.55, 'Fresh: 2.5 %', fontsize=20, fontweight='bold', ha='center', color='#00838F')
    arrow(ax, (11.55, 3.1), (10.5, 2.35), c='#00838F', lw=3, ms=22)
    x = 0.4
    for w, c, t in [(7.4, '#E1F5FE', 'Ice caps and glaciers 69 %'), (3.3, '#8D6E63', 'Ground water 30 %'), (0.3, '#1565C0', '')]:
        ax.add_patch(Rectangle((x, 1.2), w, 1.0, color=c, ec='#90A4AE')); ax.text(x + w / 2, 1.7, t, fontsize=20, fontweight='bold', ha='center', va='center', color=NAVY if c == '#E1F5FE' else 'white'); x += w
    ax.text(11.9, 0.65, 'Lakes, rivers,\nair: 1 %', fontsize=16, fontweight='bold', ha='center', va='center', color='#1565C0')
    ax.text(0.4, 2.45, 'The 2.5 % of fresh water:', fontsize=20, fontweight='bold', color='#00838F')
    save(fig, 'world_water_big.png')


def global_cycle_big():
    fig, ax = canvas(SKY)
    ax.add_patch(Rectangle((0, 0), 6.4, 1.5, color=SEA)); ax.add_patch(Polygon([(6.4, 0), (6.4, 1.5), (9.0, 2.4), (12.8, 2.0), (12.8, 0)], color='#7CB342'))
    ax.text(3.2, 0.7, 'OCEAN (store)', fontsize=24, fontweight='bold', ha='center', color='white'); ax.text(10.0, 0.9, 'LAND (store)', fontsize=24, fontweight='bold', ha='center', color='white')
    ax.add_patch(Ellipse((6.4, 4.3), 5.0, 1.0, color='white', ec='#90A4AE')); ax.text(6.4, 4.3, 'ATMOSPHERE (store)', fontsize=21, fontweight='bold', ha='center', va='center', color=NAVY)
    arrow(ax, (1.6, 1.6), (4.2, 3.8), c=RED, lw=5); lab(ax, 1.4, 3.0, 'Evaporation 413', fs=18, c=RED)
    arrow(ax, (5.2, 3.8), (4.6, 1.6), c=BLUE, lw=5); lab(ax, 5.5, 2.6, 'Rain 373', fs=18, c=BLUE)
    arrow(ax, (8.0, 3.8), (9.0, 2.4), c=BLUE, lw=5); lab(ax, 9.4, 3.3, 'Rain 113', fs=18, c=BLUE)
    arrow(ax, (11.6, 2.2), (8.9, 3.9), c=RED, lw=5); lab(ax, 11.4, 3.4, 'Evapo-\ntranspiration 73', fs=16, c=RED)
    arrow(ax, (8.2, 1.7), (6.0, 1.2), c=NAVY, lw=6); lab(ax, 7.6, 1.95, 'Runoff 40', fs=18, c=NAVY)
    ax.text(12.7, 0.15, 'thousand km³ per year', fontsize=15, ha='right', style='italic', color='white')
    save(fig, 'global_cycle_big.png')


def basin_system_big():
    fig, ax = canvas('white')
    box_(ax, 0.2, 4.1, 3.0, 0.7, 'INPUT: rain', BLUE)
    box_(ax, 4.2, 4.1, 3.4, 0.7, 'Interception store', GREEN)
    box_(ax, 4.2, 2.9, 3.4, 0.7, 'Surface store', '#26A69A')
    box_(ax, 4.2, 1.7, 3.4, 0.7, 'Soil water store', '#8D6E63')
    box_(ax, 4.2, 0.5, 3.4, 0.7, 'Ground water store', '#5D4037')
    box_(ax, 9.2, 1.7, 3.4, 0.7, 'CHANNEL store', NAVY)
    box_(ax, 9.2, 4.1, 3.4, 0.7, 'OUTPUT: evapo-\ntranspiration', RED, fs=15)
    box_(ax, 9.2, 0.2, 3.4, 0.7, 'OUTPUT: runoff', RED, fs=17)
    for a, b, t in [((3.2, 4.45), (4.2, 4.45), ''), ((5.9, 4.1), (5.9, 3.6), 'throughfall'), ((5.9, 2.9), (5.9, 2.4), 'infiltration'), ((5.9, 1.7), (5.9, 1.2), 'percolation'),
                    ((7.6, 3.25), (9.3, 2.35), 'overland flow'), ((7.6, 2.05), (9.2, 2.05), 'throughflow'), ((7.6, 0.85), (9.3, 1.8), 'base flow'), ((10.9, 1.7), (10.9, 0.9), ''), ((7.6, 4.45), (9.2, 4.45), '')]:
        arrow(ax, a, b, c='#455A64', lw=3, ms=20)
        if t: ax.text((a[0] + b[0]) / 2 + (0.1 if a[0] == b[0] else 0), (a[1] + b[1]) / 2 + (0 if a[0] == b[0] else 0.12), t, fontsize=14, fontweight='bold', color='#37474F', ha='left' if a[0] == b[0] else 'center')
    save(fig, 'basin_system_big.png')


def drainage_basin_big():
    fig, ax = canvas('#F1F8E9')
    t = np.linspace(0, 2 * np.pi, 200); x = 6.2 + 5.6 * np.cos(t) * (1 + 0.1 * np.sin(3 * t)); y = 2.6 + 2.1 * np.sin(t) * (1 + 0.08 * np.cos(2 * t))
    ax.plot(x, y, color=RED, lw=4, ls='--')
    main = [(1.2, 2.2), (3.5, 2.5), (6.0, 2.3), (8.5, 2.6), (11.9, 2.4)]
    ax.plot(*zip(*main), color=BLUE, lw=7)
    for a, b in [((2.5, 4.3), (3.5, 2.5)), ((4.2, 0.7), (6.0, 2.3)), ((7.0, 4.4), (8.5, 2.6)), ((9.5, 0.8), (8.5, 2.6)), ((1.8, 0.9), (3.5, 2.5))]: ax.plot(*zip(a, b), color=BLUE, lw=4)
    lab(ax, 1.4, 3.3, 'Source', fs=19, c=BLUE); lab(ax, 12.0, 3.2, 'Mouth', fs=19, c=BLUE); lab(ax, 7.2, 4.6, 'Watershed (divide)', fs=19, c=RED)
    lab(ax, 4.5, 3.6, 'Tributary', fs=19, c=NAVY); lab(ax, 8.6, 1.7, 'Confluence', fs=19, c=NAVY); ax.plot(8.5, 2.6, 'o', ms=14, color=NAVY)
    lab(ax, 6.0, 1.2, 'Main river', fs=19, c=BLUE)
    save(fig, 'drainage_basin_big.png')


def urban_hydro_big():
    fig, ax = chart(); x = np.linspace(0, 48, 300)
    r = 2 + 10 * np.exp(-((x - 24) / 8) ** 2) * (x > 6); u = 2 + 26 * np.exp(-((x - 15) / 4) ** 2) * (x > 6)
    ax.plot(x, r, color=GREEN, lw=6, label='Before: forest'); ax.plot(x, u, color=RED, lw=6, label='After: town (concrete, drains)')
    ax.bar([4, 5, 6], [8, 12, 6], width=0.9, color=BLUE, alpha=0.5)
    ax.set_xlabel('Hours after rain starts', fontsize=22, fontweight='bold'); ax.set_ylabel('River discharge', fontsize=22, fontweight='bold'); ax.set_yticks([])
    ax.legend(fontsize=20, frameon=False, loc='upper right'); ax.text(15, 29, 'Higher, faster peak', fontsize=20, fontweight='bold', color=RED, ha='center')
    ax.set_ylim(0, 33); fig.savefig(OUT + 'urban_hydro_big.png', dpi=150, facecolor='white'); plt.close(fig)


def evapotranspiration_big():
    fig, ax = canvas(SKY); sun(ax, 1.0, 4.3, 0.45)
    ax.add_patch(Rectangle((0, 0), W_, 1.0, color=SOIL)); ax.add_patch(Rectangle((0.8, 0.6), 3.2, 0.45, color=SEA))
    ax.add_patch(Rectangle((8.2, 1.0), 0.35, 1.9, color='#6D4C41')); ax.add_patch(Circle((8.4, 3.3), 1.1, color='#43A047'))
    for x in [1.6, 2.4, 3.2]: arrow(ax, (x, 1.2), (x, 2.6), c=RED, lw=4, ms=22)
    lab(ax, 2.4, 3.2, 'Evaporation (water, soil)', fs=19, c=RED)
    for x in [7.8, 8.4, 9.0]: arrow(ax, (x, 4.3), (x, 4.95), c=GREEN, lw=4, ms=22)
    lab(ax, 11.0, 3.6, 'Transpiration\n(from leaves)', fs=19, c=GREEN)
    arrow(ax, (8.4, 0.3), (8.4, 1.2), c=BLUE, lw=4, ms=22); ax.text(9.0, 0.45, 'roots take water', fontsize=16, fontweight='bold', color='white')
    lab(ax, 4.3, 4.6, 'E + T = EVAPOTRANSPIRATION', fs=17, c=NAVY)
    save(fig, 'evapotranspiration_big.png')


def interception_big():
    fig, ax = canvas(SKY)
    ax.add_patch(Rectangle((0, 0), W_, 0.8, color=SOIL))
    ax.add_patch(Rectangle((6.1, 0.8), 0.5, 2.3, color='#6D4C41'))
    for cx, cy, r in [(5.0, 3.4, 1.1), (6.4, 3.9, 1.3), (7.8, 3.4, 1.1)]: ax.add_patch(Circle((cx, cy), r, color='#43A047'))
    for x in np.arange(0.4, 12.6, 0.6):
        if 3.8 < x < 9.0: ax.plot([x, x - 0.1], [4.95, 4.65], color=BLUE, lw=2)
        else: ax.plot([x, x - 0.15], [4.8, 1.2], color=BLUE, lw=1.5, alpha=0.6)
    arrow(ax, (4.2, 2.2), (4.2, 0.9), c=BLUE, lw=4); lab(ax, 2.2, 2.2, 'Throughfall', fs=20, c=BLUE)
    arrow(ax, (6.7, 2.9), (6.7, 0.9), c=NAVY, lw=4); lab(ax, 8.6, 1.6, 'Stemflow', fs=20, c=NAVY)
    arrow(ax, (7.8, 4.5), (9.6, 4.9), c=RED, lw=4); lab(ax, 11.0, 4.3, 'Interception loss\n(evaporation)', fs=18, c=RED)
    save(fig, 'interception_big.png')


def infiltration_big():
    fig, ax = chart(); t = np.linspace(0, 6, 200); f = 10 + 40 * np.exp(-t / 1.2)
    ax.plot(t, f, color='#6D4C41', lw=6, label='Infiltration capacity')
    ax.axhline(25, color=BLUE, lw=5, ls='--', label='Rainfall intensity')
    ax.fill_between(t, f, 25, where=f < 25, color='#90CAF9', alpha=0.6)
    ax.text(4.3, 15, 'Overland flow\n(Hortonian)', fontsize=21, fontweight='bold', color=BLUE, ha='center')
    ax.text(0.9, 42, 'All rain soaks in', fontsize=20, fontweight='bold', color='#6D4C41')
    ax.set_xlabel('Time since rain began (hours)', fontsize=22, fontweight='bold'); ax.set_ylabel('mm per hour', fontsize=22, fontweight='bold')
    ax.legend(fontsize=19, frameon=False, loc='upper right'); ax.set_ylim(0, 55)
    fig.savefig(OUT + 'infiltration_big.png', dpi=150, facecolor='white'); plt.close(fig)


def overland_gif():
    frames = []; N = 36
    for i in range(N):
        f = i / (N - 1); fig, ax = canvas(SKY)
        ax.add_patch(Polygon([(0, 3.2), (12.8, 0.9), (12.8, 0), (0, 0)], color='#8D6E63'))
        wet = min(1, f * 1.6)
        ax.add_patch(Polygon([(0, 3.2), (12.8, 0.9), (12.8, 0.9 - 0.9 * wet), (0, 3.2 - 1.6 * wet)], color='#4E342E', alpha=0.7))
        rng = np.random.default_rng(i)
        for x in rng.uniform(0.2, 12.6, 25):
            y0 = rng.uniform(3.6, 4.9); ax.plot([x, x - 0.08], [y0, y0 - 0.3], color=BLUE, lw=2)
        if f > 0.6:
            g = (f - 0.6) / 0.4
            ax.plot([1.0, 1.0 + 11 * g], [3.2 - 0.18 * 1.0 + 0.04, 3.2 - 0.18 * (1.0 + 11 * g) + 0.04], color='#1E88E5', lw=8, solid_capstyle='round')
        lab(ax, 6.4, 4.65, '1. Rain soaks into the soil (infiltration)' if f < 0.6 else '2. The soil is full: water flows over the surface', fs=20, c=NAVY if f < 0.6 else RED)
        frames.append(frame(fig))
    save_gif(frames, 'overland.gif', ms=140, hold=14)
    frames[-1].save(OUT + 'overland_last.png')


def soil_states_big():
    fig, ax = canvas('white')
    for x, h, c, t, s in [(0.6, 3.6, '#1565C0', 'SATURATION', 'all pores full of water'), (4.7, 2.6, '#42A5F5', 'FIELD CAPACITY', 'extra water has drained'), (8.8, 0.9, '#BBDEFB', 'WILTING POINT', 'plants can no longer drink')]:
        ax.add_patch(Rectangle((x, 0.6), 3.4, 3.8, color=SOIL, alpha=0.5, ec='#5D4037', lw=3)); ax.add_patch(Rectangle((x, 0.6), 3.4, h, color=c, alpha=0.85))
        ax.text(x + 1.7, 4.65, t, fontsize=21, fontweight='bold', ha='center', color=NAVY); ax.text(x + 1.7, 0.25, s, fontsize=15, fontweight='bold', ha='center', color='#333')
    save(fig, 'soil_states_big.png')


def soil_budget_big():
    m = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D']; x = np.arange(12)
    p = [5, 10, 40, 90, 140, 170, 200, 230, 190, 90, 15, 5]; e = [130, 140, 160, 150, 140, 125, 115, 110, 115, 125, 125, 125]
    fig, ax = chart(); ax.plot(x, p, color=BLUE, lw=6, marker='o', ms=9, label='Precipitation (P)'); ax.plot(x, e, color=RED, lw=6, marker='o', ms=9, label='Potential evapotranspiration (PET)')
    xs = np.linspace(0, 11, 300); pi = np.interp(xs, x, p); ei = np.interp(xs, x, e)
    ax.fill_between(xs, pi, ei, where=pi > ei, color='#64B5F6', alpha=0.5); ax.fill_between(xs, pi, ei, where=pi < ei, color='#FFCC80', alpha=0.6)
    ax.text(7.0, 175, 'SURPLUS', fontsize=21, fontweight='bold', ha='center', color=BLUE)
    ax.text(1.4, 90, 'DEFICIT', fontsize=21, fontweight='bold', ha='center', color=ORANGE); ax.text(4.5, 100, 'Recharge', fontsize=18, fontweight='bold', ha='center', color='#1E88E5')
    ax.text(9.9, 150, 'Utilisation', fontsize=18, fontweight='bold', ha='center', color='#EF6C00')
    ax.set_xticks(x); ax.set_xticklabels(m, fontsize=22, fontweight='bold'); ax.set_ylabel('mm per month', fontsize=22, fontweight='bold'); ax.set_ylim(0, 260)
    ax.legend(fontsize=17, frameon=False, loc='upper left')
    fig.savefig(OUT + 'soil_budget_big.png', dpi=150, facecolor='white'); plt.close(fig)


def storm_hydrograph_big():
    fig, ax = chart(); x = np.linspace(0, 48, 300); base = 4 + 0.05 * x
    q = base + 22 * (x / 18) ** 3 * np.exp(3 * (1 - x / 18)) * (x > 0)
    ax.plot(x, q, color=NAVY, lw=6); ax.plot(x, base, color='#8D6E63', lw=4, ls='--')
    ax.fill_between(x, base, q, color='#BBDEFB', alpha=0.6); ax.fill_between(x, 0, base, color='#D7CCC8', alpha=0.6)
    a2 = ax.twinx(); a2.bar([3, 4, 5, 6, 7], [4, 9, 12, 7, 3], width=0.9, color=BLUE); a2.set_ylim(70, 0); a2.set_yticks([]); a2.text(9, 10, 'Rainfall', fontsize=20, fontweight='bold', color=BLUE)
    ax.plot([5, 5], [0, 31], color=RED, lw=2, ls=':'); ax.plot([18, 18], [0, 27], color=RED, lw=2, ls=':'); ax.annotate('', xy=(18, 1.6), xytext=(5, 1.6), arrowprops=dict(arrowstyle='<->', lw=3, color=RED)); ax.text(11.5, 2.2, 'Lag time', fontsize=21, fontweight='bold', ha='center', color=RED)
    ax.text(20, 27.5, 'PEAK', fontsize=21, fontweight='bold', ha='left', color=NAVY)
    ax.text(7.0, 17, 'Rising\nlimb', fontsize=20, fontweight='bold', ha='center', color=NAVY); ax.text(30, 21, 'Falling limb', fontsize=20, fontweight='bold', color=NAVY)
    ax.text(38, 3, 'Base flow', fontsize=20, fontweight='bold', color='#5D4037'); ax.text(22, 9, 'Quick flow', fontsize=19, fontweight='bold', color='#1565C0')
    ax.set_xlabel('Hours', fontsize=22, fontweight='bold'); ax.set_ylabel('Discharge (m³/s)', fontsize=22, fontweight='bold'); ax.set_ylim(0, 34); ax.set_xlim(0, 48)
    fig.savefig(OUT + 'storm_hydrograph_big.png', dpi=150, facecolor='white'); plt.close(fig)


def hydrograph_types_big():
    fig, ax = chart(); x = np.linspace(0, 48, 300)
    f = 4 + 24 * np.exp(-((x - 10) / 3.5) ** 2); s = 4 + 9 * np.exp(-((x - 22) / 9) ** 2); d = 4 + 13 * np.exp(-((x - 9) / 3) ** 2) + 10 * np.exp(-((x - 28) / 5) ** 2)
    ax.plot(x, f, color=RED, lw=6, label='Flashy: steep, short lag'); ax.plot(x, s, color=GREEN, lw=6, label='Subdued: low, long lag'); ax.plot(x, d, color=BLUE, lw=5, ls='--', label='Double peak')
    ax.set_xlabel('Hours', fontsize=22, fontweight='bold'); ax.set_ylabel('Discharge', fontsize=22, fontweight='bold'); ax.set_yticks([]); ax.legend(fontsize=20, frameon=False)
    fig.savefig(OUT + 'hydrograph_types_big.png', dpi=150, facecolor='white'); plt.close(fig)


def basin_shapes_big():
    fig, ax = canvas('white')
    ax.add_patch(Circle((1.9, 3.0), 1.4, color='#C5E1A5', ec=GREEN, lw=3)); ax.add_patch(Ellipse((1.9, 1.0), 1.2, 0.5, color='white'))
    ax.add_patch(Ellipse((8.2, 3.0), 4.6, 1.2, color='#C5E1A5', ec=GREEN, lw=3))
    for a in np.linspace(0, 2 * np.pi, 7)[:-1]: ax.plot([1.9 + 1.3 * np.cos(a), 1.9], [3.0 + 1.3 * np.sin(a), 3.0], color=BLUE, lw=3)
    ax.plot([6.0, 10.4], [3.0, 3.0], color=BLUE, lw=4)
    for xx in [6.8, 7.8, 8.8, 9.6]: ax.plot([xx, xx + 0.4], [3.5, 3.0], color=BLUE, lw=2); ax.plot([xx, xx + 0.4], [2.5, 3.0], color=BLUE, lw=2)
    lab(ax, 1.9, 0.9, 'Round basin:\nhigh, fast peak', fs=18, c=RED); lab(ax, 8.2, 1.2, 'Long basin: low, slow peak', fs=18, c=GREEN)
    lab(ax, 11.3, 4.4, 'Also: steep slopes, clay,\nbare soil, towns = flashy', fs=15, c=NAVY)
    save(fig, 'basin_shapes_big.png')


def regime_big():
    m = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D']; x = np.arange(12)
    sa = [900, 700, 650, 900, 1300, 1500, 1600, 1900, 2800, 3800, 3500, 1700]; be = [60, 40, 30, 40, 150, 500, 1300, 2600, 3400, 1500, 300, 110]
    fig, ax = chart(); ax.plot(x, sa, color=BLUE, lw=6, marker='o', ms=9, label='Sanaga at Edéa (south)'); ax.plot(x, be, color=ORANGE, lw=6, marker='o', ms=9, label='Benue at Garoua (north)')
    ax.set_xticks(x); ax.set_xticklabels(m, fontsize=22, fontweight='bold'); ax.set_ylabel('Discharge (m³/s)', fontsize=22, fontweight='bold')
    fig.subplots_adjust(left=0.12); ax.legend(fontsize=19, frameon=False, loc='upper left'); ax.text(11, 180, '(approximate values)', fontsize=15, style='italic', ha='right', color='#555')
    fig.savefig(OUT + 'regime_big.png', dpi=150, facecolor='white'); plt.close(fig)


def strahler_big():
    fig, ax = canvas('#F1F8E9')
    segs1 = [((0.6, 4.5), (2.0, 3.4)), ((0.6, 2.4), (2.0, 3.4)), ((3.0, 4.7), (3.8, 3.6)), ((4.6, 4.7), (3.8, 3.6)), ((5.6, 0.5), (6.4, 1.8)), ((7.2, 0.5), (6.4, 1.8)), ((9.2, 4.7), (9.2, 3.4))]
    for a, b in segs1: ax.plot(*zip(a, b), color='#64B5F6', lw=3)
    segs2 = [((2.0, 3.4), (4.8, 2.6)), ((3.8, 3.6), (4.8, 2.6)), ((6.4, 1.8), (7.8, 2.6))]
    for a, b in segs2: ax.plot(*zip(a, b), color='#1E88E5', lw=6)
    ax.plot([4.8, 7.8, 9.2], [2.6, 2.6, 2.6], color=NAVY, lw=10); ax.plot([9.2, 9.2], [3.4, 2.6], color='#64B5F6', lw=3)
    ax.plot([9.2, 12.4], [2.6, 2.6], color=NAVY, lw=10)
    for x, y, t in [(1.0, 3.8, '1'), (3.2, 4.2, '1'), (4.3, 4.2, '1'), (5.9, 1.2, '1'), (7.0, 1.2, '1'), (9.5, 4.1, '1'), (3.3, 2.6, '2'), (4.6, 3.3, '2'), (7.0, 2.0, '2'), (6.3, 3.0, '3'), (11.0, 3.0, '3')]:
        ax.text(x, y, t, fontsize=22, fontweight='bold', ha='center', va='center', color=RED, bbox=dict(boxstyle='circle,pad=0.15', fc='white', ec=RED, lw=2))
    lab(ax, 10.6, 1.0, '1 + 1 = 2;  2 + 2 = 3;\n2 + 1 = still 2', fs=18, c=NAVY)
    save(fig, 'strahler_big.png')


def cameroon_drainage_big():
    fig = plt.figure(figsize=(12.8, 6.4), dpi=150); ax = plt.axes([0, 0, 1, 1], projection=PC); ext = [4, 26, 1.5, 13.3]; ax.set_extent(ext, crs=PC)
    ax.set_facecolor('#CFE6F5'); ax.add_geometries([land()], PC, facecolor='#F2EFE6', edgecolor='#888', lw=0.6)
    cm = country('Cameroon')
    basins = [('#FFE0B2', box(8, 10.3, 16.5, 13.3), 'Chad basin'), ('#FFE0B2', box(14.6, 8.4, 16.5, 10.3), None),
              ('#DCEDC8', box(8, 7.0, 14.6, 10.3), 'Niger basin (Benue)'), ('#C5CAE9', box(13.6, 1.5, 16.5, 5.2), 'Congo basin'), ('#B3E5FC', box(8, 1.5, 13.6, 7.0), 'Atlantic basin')]
    for c, b, t in basins: ax.add_geometries([cm.intersection(b)], PC, facecolor=c, edgecolor='none')
    ax.add_geometries([cm.intersection(box(13.6, 5.2, 16.5, 7.0))], PC, facecolor='#B3E5FC', edgecolor='none')
    ax.add_geometries([cm], PC, facecolor='none', edgecolor='#333', lw=2)
    rivers(ax, {'Sanaga': 4, 'Benue': 4, 'Bénoué': 4, 'Chari': 4, 'Kadéï': 3, 'Lom': 3, 'Sangha': 3.5})
    for x, y, t in [(11.2, 4.3, 'SANAGA'), (12.0, 9.5, 'BENUE'), (15.6, 11.8, 'CHARI')]:
        ax.text(x, y, t, fontsize=17, fontweight='bold', color='#0B3D91', ha='center', transform=PC, zorder=9, bbox=dict(fc='white', ec='#0B3D91', lw=1.5, boxstyle='round,pad=0.12', alpha=0.9))
    for i, (c, t) in enumerate([('#B3E5FC', 'Atlantic: Sanaga, Nyong, Wouri'), ('#C5CAE9', 'Congo: Sangha, Dja, Kadéï'), ('#DCEDC8', 'Niger: Benue, Faro, Mayo Kebbi'), ('#FFE0B2', 'Chad: Logone, Chari')]):
        ax.text(0.6, 0.86 - i * 0.1, '■', transform=ax.transAxes, fontsize=26, color=c, va='center'); ax.text(0.635, 0.86 - i * 0.1, t, transform=ax.transAxes, fontsize=17, fontweight='bold', va='center', color=NAVY)
    ax.text(0.99, 0.02, 'Simplified basin limits', transform=ax.transAxes, ha='right', fontsize=14, style='italic', color='#555')
    msave(fig, 'cameroon_drainage_big.png')


def morphometry_big():
    fig, ax = canvas('white')
    ax.add_patch(Polygon([(1.0, 3.8), (3.4, 3.8), (3.0, 2.4), (1.4, 2.4)], color='#90CAF9', ec=NAVY, lw=3))
    ax.annotate('', xy=(3.4, 4.2), xytext=(1.0, 4.2), arrowprops=dict(arrowstyle='<->', lw=3, color=RED)); ax.text(2.2, 4.4, 'width', fontsize=18, fontweight='bold', ha='center', color=RED)
    ax.annotate('', xy=(3.8, 2.4), xytext=(3.8, 3.8), arrowprops=dict(arrowstyle='<->', lw=3, color=RED)); ax.text(4.0, 3.1, 'depth', fontsize=18, fontweight='bold', color=RED)
    ax.plot([1.0, 1.4, 3.0, 3.4], [3.8, 2.4, 2.4, 3.8], color=ORANGE, lw=6); ax.text(2.2, 1.9, 'wetted perimeter', fontsize=17, fontweight='bold', ha='center', color=ORANGE)
    for y, t in [(4.3, 'Cross-section area = width × mean depth'), (3.4, 'Hydraulic radius = area ÷ wetted perimeter'), (2.5, 'Sinuosity = channel length ÷ straight length'), (1.6, 'Drainage density = total stream length ÷ area'), (0.7, 'Bifurcation ratio = streams of order n ÷ order n+1')]:
        ax.text(5.1, y, t, fontsize=17, fontweight='bold', va='center', color=NAVY)
    save(fig, 'morphometry_big.png')


def table_big(name, head, rows, colw=None, fs=20, note=None):
    fig, ax = canvas('white'); n = len(head); colw = colw or [12.0 / n] * n; y = 4.5; rh = min(0.62, 4.0 / (len(rows) + 1))
    x = 0.4
    for w, h in zip(colw, head):
        ax.add_patch(Rectangle((x, y - rh), w, rh, color=NAVY)); ax.text(x + w / 2, y - rh / 2, h, fontsize=fs - 2, fontweight='bold', ha='center', va='center', color='white'); x += w
    for k, r in enumerate(rows):
        x = 0.4; yy = y - rh * (k + 2)
        for w, c in zip(colw, r):
            ax.add_patch(Rectangle((x, yy), w, rh, color='#E3F2FD' if k % 2 == 0 else 'white', ec='#90A4AE', lw=1)); ax.text(x + w / 2, yy + rh / 2, str(c), fontsize=fs, fontweight='bold', ha='center', va='center', color='#222'); x += w
    if note: ax.text(6.4, 0.2, note, fontsize=17, fontweight='bold', ha='center', color=RED)
    save(fig, name)


def pw_data_big():
    t = [0, 3, 6, 9, 12, 18, 24, 36, 48]; q = [4, 5, 9, 18, 26, 22, 15, 9, 6]; r = [0, 12, 20, 6, 0, 0, 0, 0, 0]
    table_big('pw_data_big.png', ['Hour', *[str(v) for v in t]], [['Rain (mm)', *r], ['Discharge (m³/s)', *q]], colw=[3.0] + [1.0] * 9, fs=20,
              note='Plot discharge as a line and rain as bars on the same time axis')


def bifurcation_big():
    table_big('bifurcation_big.png', ['Stream order', 'Number of streams', 'Bifurcation ratio'],
              [['1', '24', '24 ÷ 6 = 4.0'], ['2', '6', '6 ÷ 2 = 3.0'], ['3', '2', '2 ÷ 1 = 2.0'], ['4', '1', '—']], colw=[3.4, 4.0, 4.6], fs=22,
              note='Mean ratio = (4 + 3 + 2) ÷ 3 = 3.0')


ALL = [k for k in list(globals()) if (k.endswith('_big') or k.endswith('_gif'))]
if __name__ == '__main__':
    for f in (sys.argv[1:] or ALL):
        try: globals()[f](); print('ok', f)
        except Exception as e: print('FAIL', f, repr(e))
