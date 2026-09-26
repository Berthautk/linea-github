"""Big-label diagrams and GIFs for Lower Sixth Climatology (Module 1, v2 format)."""
import sys
from big_common import *
SKY = '#DDEFFB'; SEA = '#2F7ED8'; GROUND = '#8BC34A'


def gases_pie_big():
    fig, ax = canvas('white')
    ax2 = fig.add_axes([0.02, 0.04, 0.42, 0.92])
    ax2.pie([78, 21, 1], colors=['#1E88E5', '#43A047', '#FB8C00'], startangle=90, wedgeprops=dict(ec='white', lw=3))
    ax2.set_aspect('equal')
    for y, c, t in [(4.1, '#1E88E5', 'Nitrogen: 78 %'), (3.1, '#43A047', 'Oxygen: 21 %'), (2.1, '#FB8C00', 'Others (argon, CO₂…): 1 %')]:
        ax.add_patch(Rectangle((6.0, y - 0.25), 0.5, 0.5, color=c)); ax.text(6.7, y, t, fontsize=26, fontweight='bold', va='center')
    lab(ax, 9.0, 0.9, 'CO₂ and water vapour vary (variable gases)', fs=21, c=RED)
    save(fig, 'gases_pie_big.png')


def temp_profile_big():
    fig, ax = chart((12.8, 5.6))
    t = [15, -56, -56, 0, -90, -90, 20]; h = [0, 12, 20, 50, 85, 90, 110]
    ax.plot(t, h, color=RED, lw=6)
    for y0, y1, c, n in [(0, 12, '#BBDEFB', 'Troposphere'), (12, 50, '#D1C4E9', 'Stratosphere'), (50, 85, '#E1BEE7', 'Mesosphere'), (85, 110, '#F8BBD0', 'Thermosphere')]:
        ax.axhspan(y0, y1, color=c, alpha=0.6, zorder=0); ax.text(-118, (y0 + y1) / 2, n, fontsize=24, fontweight='bold', va='center', color=NAVY)
    ax.text(5, 32, 'Ozone warms\nthis layer', fontsize=20, fontweight='bold', color='#4A148C', va='center')
    ax.set_xlim(-120, 40); ax.set_ylim(0, 110); ax.set_xlabel('Temperature (°C)', fontsize=24, fontweight='bold'); ax.set_ylabel('Height (km)', fontsize=24, fontweight='bold')
    fig.savefig(OUT + 'temp_profile_big.png', dpi=150, facecolor='white'); plt.close(fig)


def spectrum_big():
    fig, ax = canvas('white')
    for x, w, c, n, s in [(0.4, 3.4, '#7E57C2', 'ULTRAVIOLET', '7 %: burns skin'), (4.0, 3.8, '#FDD835', 'VISIBLE LIGHT', '43 %: we see it'), (8.0, 4.4, '#E53935', 'INFRARED', '50 %: we feel heat')]:
        ax.add_patch(Rectangle((x, 2.2), w, 1.6, color=c)); ax.text(x + w / 2, 3.0, n, fontsize=24, fontweight='bold', ha='center', va='center', color='white' if c != '#FDD835' else '#333')
        ax.text(x + w / 2, 1.6, s, fontsize=22, fontweight='bold', ha='center', color='#333')
    arrow(ax, (0.4, 4.4), (12.4, 4.4), c='#333', lw=3); ax.text(6.4, 4.6, 'Short waves  →  longer waves', fontsize=22, fontweight='bold', ha='center')
    lab(ax, 6.4, 0.6, 'The Sun sends SHORT-WAVE radiation', fs=22, c=RED)
    save(fig, 'spectrum_big.png')


def depletion_big():
    fig, ax = canvas(SKY)
    ax.add_patch(Rectangle((0, 0), W_, 0.8, color=GROUND)); sun(ax, 0.9, 4.3, 0.45)
    ax.add_patch(Ellipse((6.4, 3.3), 3.0, 0.9, color='white', ec='#999', lw=2))
    arrow(ax, (1.4, 4.2), (6.0, 3.5), c='#F9A825', lw=6); ax.text(1.7, 4.55, '100 %', fontsize=24, fontweight='bold', color='#F57F17')
    arrow(ax, (6.3, 3.8), (4.2, 4.8), c='#1E88E5', lw=5); lab(ax, 2.6, 4.55, 'Reflected: 30 %', fs=22, c=BLUE)
    arrow(ax, (6.9, 3.4), (9.0, 4.3), c='#7B1FA2', lw=5); lab(ax, 10.3, 4.55, 'Absorbed by air: 20 %', fs=20, c='#7B1FA2')
    arrow(ax, (6.6, 2.9), (7.4, 0.9), c='#EF6C00', lw=6); lab(ax, 9.8, 1.6, 'Reaches the ground: 50 %', fs=22, c=ORANGE)
    lab(ax, 3.0, 2.0, 'Scattering: blue sky', fs=21, c=NAVY)
    save(fig, 'depletion_big.png')


def radiation_balance_big():
    fig, ax = chart((12.8, 5.6))
    la = np.linspace(-90, 90, 181); inc = 330 * np.cos(np.radians(la)) ** 1.2 + 40; out = 200 + 40 * np.cos(np.radians(la))
    ax.plot(la, inc, color='#F9A825', lw=6, label='Incoming (from the Sun)'); ax.plot(la, out, color=NAVY, lw=6, label='Outgoing (from the Earth)')
    ax.fill_between(la, inc, out, where=inc > out, color='#EF9A9A', alpha=0.6); ax.fill_between(la, inc, out, where=inc < out, color='#90CAF9', alpha=0.6)
    ax.text(0, 300, 'SURPLUS', fontsize=26, fontweight='bold', ha='center', color=RED)
    ax.text(-72, 150, 'DEFICIT', fontsize=24, fontweight='bold', ha='center', color=BLUE); ax.text(72, 150, 'DEFICIT', fontsize=24, fontweight='bold', ha='center', color=BLUE)
    ax.set_xticks([-90, -60, -30, 0, 30, 60, 90]); ax.set_xticklabels(['90°S', '60°S', '30°S', '0°', '30°N', '60°N', '90°N'])
    ax.set_yticks([]); ax.set_ylabel('Energy', fontsize=24, fontweight='bold'); ax.legend(fontsize=20, loc='lower center', frameon=False)
    ax.set_ylim(20, 400); fig.savefig(OUT + 'radiation_balance_big.png', dpi=150, facecolor='white'); plt.close(fig)


def heat_transfer_big():
    fig, ax = canvas('white'); cx, cy, r = 3.2, 2.5, 2.3
    ax.add_patch(Circle((cx, cy), r, color='#E3F2FD', ec=NAVY, lw=3))
    ax.add_patch(Rectangle((cx - r * 0.97, cy - 0.5), 2 * r * 0.97, 1.0, color='#FFCDD2', zorder=1))
    ax.text(cx, cy, 'HOT (surplus)', fontsize=20, fontweight='bold', ha='center', va='center', color=RED, zorder=5)
    arrow(ax, (cx, cy + 0.6), (cx, cy + 1.9), c=RED, lw=6); arrow(ax, (cx, cy - 0.6), (cx, cy - 1.9), c=RED, lw=6)
    ax.text(cx, cy + 2.05, 'COLD', fontsize=18, fontweight='bold', ha='center', color=BLUE); ax.text(cx, cy - 2.25, 'COLD', fontsize=18, fontweight='bold', ha='center', color=BLUE)
    for y, t, c in [(4.0, 'Winds (advection)', NAVY), (2.7, 'Warm ocean currents', BLUE), (1.4, 'Storms carry latent heat', RED)]:
        ax.text(6.4, y, '•  ' + t, fontsize=26, fontweight='bold', va='center', color=c)
    lab(ax, 9.3, 0.4, 'Heat moves from the tropics to the poles', fs=20, c=RED)
    save(fig, 'heat_transfer_big.png')


def ocean_currents_big():
    fig, ax = map_axes([-100, 40, -45, 65])
    for pts, c, t, tp in [([(-80, 25), (-60, 38), (-30, 48), (-5, 58)], RED, 'Gulf Stream (warm)', (-50, 55)),
                          ([(12, -35), (10, -25), (8, -15)], BLUE, 'Benguela (cold)', (15, -40)),
                          ([(-12, 35), (-17, 25), (-20, 15)], BLUE, 'Canary (cold)', (-30, 30)),
                          ([(-10, 3), (0, 3), (8, 3)], RED, 'Guinea (warm)', (-5, -4))]:
        for a, b in zip(pts[:-1], pts[1:]):
            ax.annotate('', xy=b, xytext=a, arrowprops=dict(arrowstyle='-|>', color=c, lw=6, mutation_scale=35), transform=PC, xycoords=PC._as_mpl_transform(ax), textcoords=PC._as_mpl_transform(ax))
        mlab(ax, tp[0], tp[1], t, fs=21, c=c)
    msave(fig, 'ocean_currents_big.png')


def continentality_big():
    m = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D']
    fig, ax = chart(); x = np.arange(12)
    d = [27.5, 28, 28, 27.5, 27, 26, 25, 25, 25.5, 26, 27, 27.5]; n = [24, 27, 31, 34, 33, 31, 28, 27, 28, 29, 27, 24]
    ax.plot(x, d, color=BLUE, lw=6, marker='o', ms=10, label='Douala (coast): range 3 °C'); ax.plot(x, n, color=RED, lw=6, marker='o', ms=10, label="N'Djamena (inland): range 10 °C")
    ax.set_xticks(x); ax.set_xticklabels(m, fontsize=24, fontweight='bold'); ax.set_ylim(20, 38); ax.set_ylabel('Temperature (°C)', fontsize=24, fontweight='bold')
    ax.legend(fontsize=21, loc='upper right', frameon=False)
    fig.savefig(OUT + 'continentality_big.png', dpi=150, facecolor='white'); plt.close(fig)


def aspect_big():
    fig, ax = canvas(SKY); sun(ax, 1.0, 4.3, 0.45)
    ax.add_patch(Polygon([(1.5, 0.4), (6.4, 4.0), (11.3, 0.4)], color='#8D6E63'))
    for k in range(4): arrow(ax, (1.6 + k * 0.5, 3.9 - k * 0.2), (3.0 + k * 0.7, 1.7 + k * 0.5), c='#F9A825', lw=4, ms=25)
    lab(ax, 3.0, 0.9, 'Sunny slope: WARM', fs=24, c=RED); lab(ax, 9.6, 0.9, 'Shady slope: COOL', fs=24, c=BLUE)
    ax.add_patch(Polygon([(6.4, 4.0), (11.3, 0.4), (6.4, 0.4)], color='#5D4037', alpha=0.6))
    save(fig, 'aspect_big.png')


def heat_island_big():
    fig, ax = canvas(SKY)
    x = np.linspace(0, W_, 200); y = 2.7 + 1.3 * np.exp(-((x - 6.4) / 2.3) ** 2)
    ax.plot(x, y, color=RED, lw=6)
    ax.add_patch(Rectangle((0, 0), W_, 0.6, color=GROUND))
    for bx, bh in [(4.6, 1.2), (5.2, 1.8), (5.8, 1.4), (6.4, 2.0), (7.0, 1.5), (7.6, 1.1)]: ax.add_patch(Rectangle((bx, 0.6), 0.5, bh, color='#607D8B'))
    for tx in [0.8, 1.8, 2.8, 10.0, 11.0, 12.0]: acacia(ax, tx, 0.6, 0.7)
    lab(ax, 6.4, 4.6, 'City centre: 3–5 °C warmer', fs=24, c=RED); lab(ax, 1.9, 3.6, 'Countryside: cooler', fs=22, c=GREEN); lab(ax, 10.9, 3.6, 'Countryside: cooler', fs=22, c=GREEN)
    save(fig, 'heat_island_big.png')


def lapse_rate_big():
    fig, ax = canvas(SKY)
    ax.add_patch(Polygon([(0.6, 0.3), (5.0, 4.6), (9.4, 0.3)], color='#6D4C41'))
    ax.add_patch(Polygon([(4.45, 4.06), (5.0, 4.6), (5.55, 4.06)], color='white'))
    for y, t, c in [(0.6, 'Sea level: 27 °C', RED), (1.9, '2,000 m: 14 °C', ORANGE), (3.2, '3,000 m: 7 °C', BLUE), (4.4, 'Top, 4,095 m: 0 °C', NAVY)]:
        ax.plot([5.0, 9.3], [y, y], color='#333', lw=1.5, ls=':'); ax.text(9.4, y, t, fontsize=20, fontweight='bold', va='center', color=c)
    lab(ax, 2.3, 4.3, '−6.5 °C every 1,000 m', fs=22, c=RED)
    save(fig, 'lapse_rate_big.png')


def heated_below_big():
    fig, ax = canvas(SKY); sun(ax, 1.0, 4.3, 0.45)
    ax.add_patch(Rectangle((0, 0), W_, 0.7, color='#C49A6C'))
    arrow(ax, (1.5, 4.0), (4.0, 0.8), c='#F9A825', lw=6); ax.text(1.5, 2.2, 'Sun heats\nthe GROUND', fontsize=22, fontweight='bold', color='#F57F17')
    for x in [6, 7.5, 9, 10.5]:
        ax.plot([x, x], [0.8, 3.5], color=RED, lw=4, ls=(0, (1, 1.2)))
        arrow(ax, (x, 3.2), (x, 3.9), c=RED, lw=4, ms=25)
    lab(ax, 8.2, 4.5, 'The ground heats the air from below', fs=22, c=RED)
    lab(ax, 8.2, 1.5, 'Warmest air near the ground', fs=21, c=ORANGE)
    save(fig, 'heated_below_big.png')


def inversion_graph_big():
    fig, (a1, a2) = plt.subplots(1, 2, figsize=(12.8, 5.6), dpi=150); fig.subplots_adjust(0.11, 0.15, 0.98, 0.9, wspace=0.3)
    a1.plot([25, 12], [0, 2000], color=RED, lw=6); a1.set_title('NORMAL: colder upwards', fontsize=22, fontweight='bold', color=NAVY)
    a2.plot([12, 18, 10], [0, 500, 2000], color=RED, lw=6); a2.axhspan(0, 500, color='#BBDEFB', alpha=0.6); a2.set_title('INVERSION: warmer upwards', fontsize=22, fontweight='bold', color=RED)
    a2.text(10.5, 250, 'Cold air\ntrapped', fontsize=20, fontweight='bold', color=BLUE, va='center')
    for a in (a1, a2):
        a.set_xlim(8, 27); a.set_ylim(0, 2000); a.tick_params(labelsize=20); a.set_xlabel('Temperature (°C)', fontsize=22, fontweight='bold')
    a1.set_ylabel('Height (m)', fontsize=22, fontweight='bold')
    fig.savefig(OUT + 'inversion_graph_big.png', dpi=150, facecolor='white'); plt.close(fig)


def inversion_gif():
    frames = []; N = 36
    for i in range(N):
        f = i / (N - 1); fig, ax = canvas('#1A237E')
        ax.add_patch(Polygon([(0, 4.2), (4.4, 0.6), (8.4, 0.6), (12.8, 4.2), (12.8, 0), (0, 0)], color='#33691E'))
        for s in [(1.0, 3.5), (1.9, 2.7), (2.8, 1.9)]:
            p = min(1, f * 1.4); arrow(ax, s, (s[0] + 1.3 * p + 0.01, s[1] - 1.0 * p - 0.01), c='#81D4FA', lw=4, ms=25)
            s2 = (W_ - s[0], s[1]); arrow(ax, s2, (s2[0] - 1.3 * p - 0.01, s2[1] - 1.0 * p - 0.01), c='#81D4FA', lw=4, ms=25)
        h = 1.6 * f
        if h > 0.05: ax.add_patch(Rectangle((3.4, 0.6), 6.0, h, color='#E3F2FD', alpha=0.75))
        lab(ax, 6.4, 4.5, 'Night: cold, heavy air slides into the valley' if f < 0.6 else 'Cold air + fog trapped below warm air', fs=21, c=NAVY)
        if f > 0.6: lab(ax, 6.4, 3.1, 'Warmer air above', fs=21, c=RED)
        frames.append(frame(fig))
    save_gif(frames, 'inversion.gif', ms=150, hold=14)
    frames[-1].save(OUT + 'inversion_last.png')


def humidity_big():
    fig, ax = canvas('white')
    for x, t, g, h in [(1.0, '10 °C', '9 g', 1.0), (5.0, '20 °C', '17 g', 1.9), (9.0, '30 °C', '30 g', 3.3)]:
        ax.add_patch(Rectangle((x, 0.6), 2.4, 3.6, fill=False, ec=NAVY, lw=4)); ax.add_patch(Rectangle((x + 0.05, 0.62), 2.3, h, color='#42A5F5'))
        ax.text(x + 1.2, 4.5, t, fontsize=26, fontweight='bold', ha='center', color=RED); ax.text(x + 1.2, 0.6 + h / 2 if h > 0.8 else 1.9, g, fontsize=24, fontweight='bold', ha='center', va='center', color='white' if h > 0.8 else NAVY)
    lab(ax, 6.4, 0.25, 'Warm air can hold more water vapour (per m³)', fs=20, c=NAVY)
    save(fig, 'humidity_big.png')


def cloud_types_big():
    fig, ax = canvas(SKY)
    ax.add_patch(Rectangle((0, 0), W_, 0.4, color=GROUND))
    for y, t in [(4.2, 'HIGH (above 6 km)'), (2.6, 'MIDDLE (2–6 km)'), (1.1, 'LOW (below 2 km)')]:
        ax.plot([0, W_], [y - 0.6, y - 0.6], color='#90A4AE', lw=1.5, ls='--'); ax.text(0.15, y, t, fontsize=19, fontweight='bold', color='#455A64')
    for k in range(4): ax.plot([4.2 + k * 0.4, 5.2 + k * 0.4], [4.0, 4.5], color='white', lw=5)
    lab(ax, 7.2, 4.25, 'Cirrus: thin, feathery', fs=20, c=NAVY)
    ax.add_patch(Ellipse((5.0, 2.6), 2.5, 0.5, color='#ECEFF1', ec='#B0BEC5')); lab(ax, 8.2, 2.6, 'Alto-stratus: grey sheet', fs=20, c=NAVY)
    ax.add_patch(Rectangle((3.4, 0.9), 3.2, 0.4, color='#B0BEC5')); lab(ax, 8.0, 1.1, 'Stratus: low grey layer', fs=20, c=NAVY)
    for cx, cy, r in [(11.2, 1.0, 0.5), (11.8, 1.3, 0.6), (11.5, 1.9, 0.6), (11.6, 2.6, 0.55), (11.5, 3.2, 0.5)]: ax.add_patch(Circle((cx, cy), r, color='#78909C'))
    ax.add_patch(Rectangle((10.6, 3.5), 2.0, 0.3, color='#78909C')); lab(ax, 9.3, 3.4, 'Cumulonimbus: storm', fs=18, c=RED)
    save(fig, 'cloud_types_big.png')


def rain_latitude_big():
    fig, ax = chart()
    lat = ['90°', '60°', '30°', '0°', '30°', '60°', '90°']; r = [150, 1000, 300, 2500, 350, 1100, 100]
    cols = ['#90CAF9', '#1E88E5', '#FFB74D', '#1B5E20', '#FFB74D', '#1E88E5', '#90CAF9']
    ax.bar(range(7), r, color=cols, width=0.7); ax.set_xticks(range(7)); ax.set_xticklabels(['90°N', '60°N', '30°N', 'Equator', '30°S', '60°S', '90°S'], fontsize=21, fontweight='bold')
    ax.set_ylabel('Rain (mm/year)', fontsize=24, fontweight='bold')
    for i, t in [(3, 'Low pressure: WET'), (2, 'High: DRY'), (1, 'Fronts')]: ax.text(i, r[i] + 60, t, fontsize=19, fontweight='bold', ha='center', color=NAVY)
    ax.set_ylim(0, 2900); fig.subplots_adjust(left=0.13); fig.savefig(OUT + 'rain_latitude_big.png', dpi=150, facecolor='white'); plt.close(fig)


def tricellular_big():
    fig, ax = canvas(SKY); ax.add_patch(Rectangle((0, 0), W_, 0.8, color='#C49A6C'))
    xs = [1.0, 4.6, 8.6, 11.8]
    for x, la, p, c in zip(xs, ['Equator', '30°', '60°', '90°'], ['LOW', 'HIGH', 'LOW', 'HIGH'], [RED, ORANGE, BLUE, NAVY]):
        ax.text(x, 0.45, la, fontsize=19, fontweight='bold', ha='center', va='center', color='#333')
        ax.text(x, 1.1, p, fontsize=20, fontweight='bold', ha='center', color=c)
    for x0, x1, n, c in [(xs[0], xs[1], 'HADLEY', RED), (xs[1], xs[2], 'FERREL', GREEN), (xs[2], xs[3], 'POLAR', BLUE)]:
        cx = (x0 + x1) / 2; ax.add_patch(Ellipse((cx, 2.9), (x1 - x0) * 0.85, 2.3, fill=False, ec=c, lw=5))
        lab(ax, cx, 2.9, n, fs=22, c=c)
    for x in (xs[0] + 0.3, xs[2]): arrow(ax, (x, 1.9), (x, 3.9), c=RED, lw=6)
    for x in (xs[1], xs[3] - 0.3): arrow(ax, (x, 3.9), (x, 1.9), c=BLUE, lw=6)
    lab(ax, 6.4, 4.65, 'Air rises at LOW pressure and sinks at HIGH pressure', fs=19, c=NAVY)
    save(fig, 'tricellular_big.png')


def hadley_gif():
    frames = []; N = 36
    for i in range(N):
        fig, ax = canvas(SKY); ax.add_patch(Rectangle((0, 0), W_, 0.7, color='#C49A6C'))
        ax.add_patch(Rectangle((0, 4.6), W_, 0.4, color='#90A4AE'))
        t = np.linspace(0, 2 * np.pi, 120); ax.plot(6.4 + 5.2 * np.cos(t), 2.65 + 1.6 * np.sin(t), color='#EF9A9A', lw=3, ls='--')
        a = 2 * np.pi * i / N
        arrow(ax, (11.6, 2.0), (11.6, 3.3), c=RED, lw=5); arrow(ax, (1.2, 3.3), (1.2, 2.0), c=ORANGE, lw=5)
        arrow(ax, (7.4, 4.25), (5.4, 4.25), c=NAVY, lw=4); arrow(ax, (5.4, 1.05), (7.4, 1.05), c=GREEN, lw=4)
        for k in range(4):
            aa = a + k * np.pi / 2; ax.plot(6.4 + 5.2 * np.cos(aa), 2.65 + 1.6 * np.sin(aa), 'o', ms=16, color=RED)
        ax.text(10.9, 0.25, 'EQUATOR: air RISES', fontsize=19, fontweight='bold', ha='center', color=RED)
        ax.text(1.8, 0.25, '30°N: air SINKS (dry)', fontsize=19, fontweight='bold', ha='center', color=ORANGE)
        lab(ax, 6.4, 1.55, 'Trade winds blow back to the Equator', fs=18, c=GREEN); lab(ax, 6.4, 3.7, 'High up: air moves away from the Equator', fs=17, c=NAVY)
        frames.append(frame(fig))
    save_gif(frames, 'hadley.gif', ms=120, hold=0)
    frames[0].save(OUT + 'hadley_first.png')


def stability_big():
    fig, (a1, a2) = plt.subplots(1, 2, figsize=(12.8, 5.6), dpi=150); fig.subplots_adjust(0.08, 0.15, 0.98, 0.9, wspace=0.3)
    h = [0, 3000]
    for a, elr, tt, c in [(a1, 9, 'UNSTABLE: the air keeps rising', RED), (a2, 4, 'STABLE: the air sinks back', BLUE)]:
        a.plot([30, 30 - elr * 3], h, color='#333', lw=5, label='Surrounding air')
        a.plot([30, 30 - 6.5 * 3], h, color=c, lw=5, ls='--', label='Rising parcel')
        a.set_title(tt, fontsize=19, fontweight='bold', color=c); a.tick_params(labelsize=18); a.set_xlabel('Temperature (°C)', fontsize=20, fontweight='bold')
        a.legend(fontsize=16, loc='upper right', frameon=False)
    a1.set_ylabel('Height (m)', fontsize=20, fontweight='bold')
    fig.savefig(OUT + 'stability_big.png', dpi=150, facecolor='white'); plt.close(fig)


def parcel_gif():
    frames = []; N = 34
    for i in range(N):
        f = i / (N - 1); fig, ax = canvas(SKY); ax.add_patch(Rectangle((0, 0), W_, 0.6, color='#C49A6C'))
        y = 0.9 + 3.3 * f; x = 4.0
        if f > 0.6:
            for cx, r in [(3.4, 0.5), (4.0, 0.7), (4.7, 0.5)]: ax.add_patch(Circle((cx, 4.3), r, color='white', ec='#B0BEC5'))
        ax.add_patch(Circle((x, y), 0.45, color='#EF5350' if f < 0.6 else '#FFCDD2', ec=RED, lw=3))
        ax.text(x, y, '25°' if f < 0.3 else ('20°' if f < 0.6 else '15°'), fontsize=16, fontweight='bold', ha='center', va='center')
        lab(ax, 9.3, 3.9, 'Warmer than the air around it,\nthe parcel keeps rising', fs=19, c=RED)
        lab(ax, 9.3, 2.1, 'It cools, water vapour condenses:\na cloud forms (instability)', fs=19, c=NAVY)
        frames.append(frame(fig))
    save_gif(frames, 'parcel.gif', ms=130, hold=12)
    frames[-1].save(OUT + 'parcel_last.png')


def planetary_winds_big():
    fig, ax = canvas('white'); cx, cy, R = 3.4, 2.5, 2.35
    ax.add_patch(Circle((cx, cy), R, color='#E3F2FD', ec=NAVY, lw=3))
    for a in [0, 30, 60, -30, -60]:
        y = cy + R * np.sin(np.radians(a)); w = R * np.cos(np.radians(a)); ax.plot([cx - w, cx + w], [y, y], color='#90A4AE', lw=2)
    for y0, dx, dy, c in [(cy + 0.55, -0.7, -0.35, GREEN), (cy - 0.55, -0.7, 0.35, GREEN), (cy + 1.55, 0.7, 0.3, BLUE), (cy - 1.55, 0.7, -0.3, BLUE), (cy + 2.1, -0.5, -0.15, NAVY), (cy - 2.1, -0.5, 0.15, NAVY)]:
        for x0 in ([cx - 0.6, cx + 0.8] if abs(y0 - cy) < 2 else [cx + 0.2]): arrow(ax, (x0, y0), (x0 + dx, y0 + dy), c=c, lw=5, ms=25)
    for y, t, c in [(4.2, 'Polar easterlies', NAVY), (3.3, 'Westerlies (30°–60°)', BLUE), (2.1, 'Trade winds (0°–30°)', GREEN)]:
        ax.text(6.4, y, t, fontsize=26, fontweight='bold', va='center', color=c)
    lab(ax, 9.3, 0.8, 'Winds blow from HIGH to LOW pressure', fs=19, c=RED)
    save(fig, 'planetary_winds_big.png')


def coriolis_gif():
    frames = []; N = 36
    for i in range(N):
        f = i / (N - 1); fig, ax = canvas('white')
        ax.add_patch(Rectangle((0, 0), W_ / 2 - 0.05, H_, color='#E3F2FD')); ax.add_patch(Rectangle((W_ / 2 + 0.05, 0), W_ / 2, H_, color='#FFF3E0'))
        ax.text(3.2, 4.6, 'NORTH: turns RIGHT', fontsize=22, fontweight='bold', ha='center', color=BLUE)
        ax.text(9.6, 4.6, 'SOUTH: turns LEFT', fontsize=22, fontweight='bold', ha='center', color=ORANGE)
        t = np.linspace(0, f, 60)
        ax.plot(3.2 + 0 * t, 0.5 + 3.4 * t, color='#BDBDBD', lw=3, ls='--'); ax.plot(9.6 + 0 * t, 0.5 + 3.4 * t, color='#BDBDBD', lw=3, ls='--')
        ax.plot(3.2 + 2.2 * t ** 2, 0.5 + 3.4 * t, color=BLUE, lw=6); ax.plot(9.6 - 2.2 * t ** 2, 0.5 + 3.4 * t, color=ORANGE, lw=6)
        ax.plot(3.2 + 2.2 * f ** 2, 0.5 + 3.4 * f, 'o', ms=16, color=BLUE); ax.plot(9.6 - 2.2 * f ** 2, 0.5 + 3.4 * f, 'o', ms=16, color=ORANGE)
        frames.append(frame(fig))
    save_gif(frames, 'coriolis.gif', ms=110, hold=14)
    frames[-1].save(OUT + 'coriolis_last.png')


def monsoon_big():
    fig = plt.figure(figsize=(12.8, 6.4), dpi=150)
    for k, (tt, wind, c) in enumerate([('SUMMER: wet wind from the sea', 1, BLUE), ('WINTER: dry wind from the land', -1, ORANGE)]):
        ax = fig.add_axes([k * 0.5 + 0.005, 0.0, 0.49, 0.88], projection=PC); ext = [55, 100, 0, 35]; ax.set_extent(ext, crs=PC)
        ax.set_facecolor('#CFE6F5'); ax.add_geometries([land()], PC, facecolor='#F2EFE6', edgecolor='#888', lw=0.6)
        for x, y in [(65, 8), (75, 6), (85, 9)]:
            a, b = ((x, y), (x + 6, y + 12)) if wind > 0 else ((x + 6, y + 14), (x, y + 2))
            ax.annotate('', xy=b, xytext=a, arrowprops=dict(arrowstyle='-|>', color=c, lw=6, mutation_scale=35), xycoords=PC._as_mpl_transform(ax), textcoords=PC._as_mpl_transform(ax))
        mlab(ax, 78, 22, 'INDIA', fs=22, c=NAVY, box=False)
        fig.text(k * 0.5 + 0.25, 0.93, tt, fontsize=22, fontweight='bold', ha='center', color=c)
    fig.savefig(OUT + 'monsoon_big.png', dpi=150, facecolor='white'); plt.close(fig)


def anabatic_big():
    fig, ax = canvas('white')
    for k, (tt, bg, up) in enumerate([('DAY: anabatic wind blows UP', SKY, True), ('NIGHT: katabatic wind blows DOWN', '#1A237E', False)]):
        x0 = k * 6.45; ax.add_patch(Rectangle((x0, 0), 6.35, 4.3, color=bg))
        ax.add_patch(Polygon([(x0, 3.8), (x0 + 3.17, 0.4), (x0 + 6.35, 3.8), (x0 + 6.35, 0), (x0, 0)], color='#558B2F'))
        for s in (1, -1):
            a = (x0 + 3.17 - s * 1.0, 1.6); b = (x0 + 3.17 - s * 2.3, 3.0)
            arrow(ax, a if up else b, b if up else a, c=RED if up else '#81D4FA', lw=6)
        ax.text(x0 + 3.17, 4.62, tt, fontsize=19, fontweight='bold', ha='center', color=ORANGE if up else NAVY)
    save(fig, 'anabatic_big.png')


def foehn_big():
    fig, ax = canvas(SKY)
    ax.add_patch(Polygon([(1.5, 0.4), (6.4, 4.0), (11.3, 0.4)], color='#6D4C41'))
    for cx, r in [(3.8, 0.5), (4.4, 0.6), (5.0, 0.5)]: ax.add_patch(Circle((cx, 2.7), r, color='white', ec='#B0BEC5'))
    for k in range(5): ax.plot([3.4 + k * 0.35, 3.2 + k * 0.35], [2.1, 1.6], color=BLUE, lw=3)
    arrow(ax, (0.3, 0.8), (3.0, 2.8), c=BLUE, lw=6); arrow(ax, (7.2, 3.6), (12.4, 0.9), c=RED, lw=6)
    lab(ax, 1.9, 4.3, 'Wet air rises, cools\nand drops its rain', fs=19, c=BLUE)
    lab(ax, 10.3, 3.6, 'Dry air sinks and warms:\nhot, dry FOEHN wind', fs=19, c=RED)
    save(fig, 'foehn_big.png')


def airmass_source_big():
    fig, ax = canvas('white')
    for x, bg, g, t, s in [(0.2, '#FFE0B2', '#E0B060', 'Over a hot DESERT', 'hot and dry air'), (6.6, '#BBDEFB', SEA, 'Over a warm OCEAN', 'warm and wet air')]:
        ax.add_patch(Rectangle((x, 0.3), 6.0, 4.4, color=bg)); ax.add_patch(Rectangle((x, 0.3), 6.0, 0.9, color=g))
        ax.add_patch(Ellipse((x + 3.0, 2.6), 4.6, 1.5, color='white', alpha=0.8, ec=NAVY, lw=3))
        ax.text(x + 3.0, 2.6, s, fontsize=22, fontweight='bold', ha='center', va='center', color=RED if 'dry' in s else BLUE)
        ax.text(x + 3.0, 4.2, t, fontsize=23, fontweight='bold', ha='center', color=NAVY)
        for k in range(3): arrow(ax, (x + 1.5 + k * 1.5, 1.2), (x + 1.5 + k * 1.5, 1.85), c=ORANGE if 'dry' in s else BLUE, lw=4, ms=22)
    save(fig, 'airmass_source_big.png')


def airmass_classes_big():
    fig, ax = canvas('white')
    ax.text(4.5, 4.5, 'CONTINENTAL (c): dry', fontsize=22, fontweight='bold', ha='center', color=ORANGE); ax.text(10.0, 4.5, 'MARITIME (m): wet', fontsize=22, fontweight='bold', ha='center', color=BLUE)
    ax.text(0.9, 3.0, 'TROPICAL\n(T): hot', fontsize=20, fontweight='bold', ha='center', va='center', color=RED); ax.text(0.9, 1.2, 'POLAR\n(P): cold', fontsize=20, fontweight='bold', ha='center', va='center', color=NAVY)
    for x, y, c, t, e in [(2.1, 2.2, '#FFCC80', 'cT', 'Sahara (Harmattan)'), (7.4, 2.2, '#90CAF9', 'mT', 'Gulf of Guinea (monsoon)'), (2.1, 0.3, '#FFE0B2', 'cP', 'Siberia, Canada'), (7.4, 0.3, '#BBDEFB', 'mP', 'North Atlantic')]:
        ax.add_patch(Rectangle((x, y), 5.1, 1.7, color=c, ec='white', lw=4)); ax.text(x + 0.9, y + 0.85, t, fontsize=34, fontweight='bold', va='center', color=NAVY)
        ax.text(x + 3.35, y + 0.85, e.split(' (')[0], fontsize=17, fontweight='bold', ha='center', va='center', color='#333')
    save(fig, 'airmass_classes_big.png')


def wa_airmasses_big():
    fig, ax = map_axes([-18, 30, -2, 26])
    x = np.linspace(-18, 30, 50); ax.plot(x, 15 + 1.5 * np.sin(x / 8), color=RED, lw=5, ls='--', transform=PC)
    mlab(ax, 22, 17.9, 'ITF (July)', fs=21, c=RED)
    for a, b in [((20, 24), (10, 18)), ((10, 24), (0, 18))]: ax.annotate('', xy=b, xytext=a, arrowprops=dict(arrowstyle='-|>', color=ORANGE, lw=7, mutation_scale=40), xycoords=PC._as_mpl_transform(ax), textcoords=PC._as_mpl_transform(ax))
    for a, b in [((-10, 1), (-2, 10)), ((2, 0), (10, 10))]: ax.annotate('', xy=b, xytext=a, arrowprops=dict(arrowstyle='-|>', color=BLUE, lw=7, mutation_scale=40), xycoords=PC._as_mpl_transform(ax), textcoords=PC._as_mpl_transform(ax))
    mlab(ax, 22, 22.5, 'cT: hot, dry (Harmattan)', fs=21, c=ORANGE); mlab(ax, -6, 3.5, 'mT: warm, wet (monsoon)', fs=21, c=BLUE)
    ax.plot(12.4, 4.0, 'o', ms=12, color=RED, transform=PC); mlab(ax, 20, 4.0, 'Cameroon', fs=20, c=NAVY, box=False)
    msave(fig, 'wa_airmasses_big.png')


def koppen_big():
    fig, ax = map_axes([-180, 180, -60, 80])
    zones = [(-12, 12, '#1B5E20', 'A: tropical humid'), (12, 30, '#FFB74D', 'B: dry'), (30, 45, '#AED581', 'C: warm temperate'), (45, 65, '#4FC3F7', 'D: cold forest'), (65, 80, '#E0E0E0', 'E: polar')]
    L = land()
    for y0, y1, c, t in zones:
        for s in (1, -1):
            if s < 0 and y0 >= 45: continue
            b = box(-180, min(s * y0, s * y1), 180, max(s * y0, s * y1)); g = L.intersection(b)
            if not g.is_empty: ax.add_geometries([g], PC, facecolor=c, edgecolor='none', alpha=0.9)
    ax.add_geometries([L.intersection(box(-180, -60, 180, -45))], PC, facecolor='#4FC3F7', edgecolor='none')
    for i, (y0, y1, c, t) in enumerate(zones):
        ax.text(0.01, 0.94 - i * 0.075, '■ ' + t, transform=ax.transAxes, fontsize=19, fontweight='bold', color=c if c != '#E0E0E0' else '#757575', bbox=dict(fc='white', ec='none', alpha=0.85))
    ax.text(0.99, 0.03, 'Simplified (zones follow latitude)', transform=ax.transAxes, ha='right', fontsize=15, style='italic', color='#555')
    msave(fig, 'koppen_big.png')


def thunderstorm_big():
    fig, ax = canvas(SKY); ax.add_patch(Rectangle((0, 0), W_, 0.4, color=GROUND))
    for x0, n, t, c in [(0.3, 'CUMULUS', 'Air rises', BLUE), (4.5, 'MATURE', 'Rain, lightning, hail', RED), (8.7, 'DISSIPATING', 'Air sinks, rain stops', GREEN)]:
        ax.text(x0 + 1.9, 4.65, n, fontsize=22, fontweight='bold', ha='center', color=c); ax.text(x0 + 1.9, 0.05 + 0.15, t, fontsize=17, fontweight='bold', ha='center', color='#333')
    for cx, cy, r in [(1.7, 1.4, 0.5), (2.3, 1.7, 0.55), (2.0, 2.2, 0.5)]: ax.add_patch(Circle((cx, cy), r, color='white', ec='#B0BEC5'))
    arrow(ax, (2.2, 0.5), (2.2, 3.2), c=RED, lw=5)
    for cx, cy, r in [(6.0, 1.6, 0.6), (6.6, 2.2, 0.8), (6.3, 3.0, 0.7)]: ax.add_patch(Circle((cx, cy), r, color='#78909C'))
    ax.add_patch(Rectangle((5.0, 3.5), 2.8, 0.35, color='#78909C'))
    for k in range(5): ax.plot([5.7 + k * 0.25, 5.5 + k * 0.25], [1.0, 0.5], color=BLUE, lw=3)
    ax.plot([7.3, 7.0, 7.4, 7.1], [1.6, 1.1, 1.1, 0.5], color='#FFD600', lw=4)
    for cx, cy, r in [(10.2, 2.9, 0.5), (10.9, 3.2, 0.6), (11.3, 2.8, 0.45)]: ax.add_patch(Circle((cx, cy), r, color='#CFD8DC'))
    arrow(ax, (10.6, 2.3), (10.6, 0.6), c=BLUE, lw=5)
    save(fig, 'thunderstorm_big.png')


def cyclone_big():
    fig, ax = canvas('#0D47A1')
    t = np.linspace(0, 5 * np.pi, 400)
    for k in range(4):
        r = 0.5 + 0.35 * t; a = t + k * np.pi / 2; ax.plot(6.4 + 0.45 * r * np.cos(a), 2.5 + 0.45 * r * np.sin(a), color='white', lw=7, alpha=0.85)
    ax.add_patch(Circle((6.4, 2.5), 0.35, color='#0D47A1'))
    lab(ax, 2.0, 4.4, 'Eye: calm', fs=22, c=NAVY); ax.plot([2.9, 6.2], [4.3, 2.6], color='white', lw=2)
    lab(ax, 10.7, 4.4, 'Eye wall: strongest winds', fs=20, c=RED); lab(ax, 10.7, 0.6, 'Spiral bands of rain', fs=20, c=NAVY)
    lab(ax, 2.2, 0.6, 'Forms over sea above 27 °C', fs=19, c=ORANGE)
    save(fig, 'cyclone_big.png')


def synoptic_big():
    fig, ax = canvas('white')
    for k, r in enumerate([0.7, 1.4, 2.1]):
        ax.add_patch(Ellipse((3.0, 2.5), 2 * r * 1.3, 2 * r, fill=False, ec=NAVY, lw=3)); ax.add_patch(Ellipse((9.8, 2.5), 2 * r * 1.3, 2 * r, fill=False, ec=NAVY, lw=3))
    ax.text(3.0, 2.5, 'L', fontsize=44, fontweight='bold', ha='center', va='center', color=RED); ax.text(9.8, 2.5, 'H', fontsize=44, fontweight='bold', ha='center', va='center', color=BLUE)
    for k, p in enumerate([1000, 1004, 1008]): ax.text(3.0 + (0.7 + 0.7 * k) * 1.3 * 0.72, 2.5 + (0.7 + 0.7 * k) * 0.72, str(p), fontsize=15, fontweight='bold', color=NAVY, bbox=dict(fc='white', ec='none'))
    for k, p in enumerate([1024, 1020, 1016]): ax.text(9.8 + (0.7 + 0.7 * k) * 1.3 * 0.72, 2.5 + (0.7 + 0.7 * k) * 0.72, str(p), fontsize=15, fontweight='bold', color=NAVY, bbox=dict(fc='white', ec='none'))
    lab(ax, 6.4, 4.6, 'Isobars: lines of equal pressure (hPa)', fs=21, c=NAVY)
    lab(ax, 3.0, 0.2, 'Low: clouds, rain', fs=19, c=RED); lab(ax, 9.8, 0.2, 'High: dry, clear', fs=19, c=BLUE)
    save(fig, 'synoptic_big.png')


def cameroon_climate_big():
    fig, ax = map_axes([4, 26, 1.5, 13.3], size=(12.8, 6.4))
    cm = country('Cameroon')
    for y0, y1, c in [(1.5, 4.8, '#1B5E20'), (4.8, 6.5, '#66BB6A'), (6.5, 9.0, '#C0CA33'), (9.0, 13.3, '#FFB74D')]:
        ax.add_geometries([cm.intersection(box(7, y0, 18, y1))], PC, facecolor=c, edgecolor='none')
    ax.add_geometries([cm.intersection(box(8.4, 3.9, 10.8, 7.2))], PC, facecolor='#8D6E63', edgecolor='none', alpha=0.85)
    ax.add_geometries([cm], PC, facecolor='none', edgecolor='#333', lw=2)
    for i, (c, t) in enumerate([('#1B5E20', 'Equatorial (Guinea): 4 seasons'), ('#8D6E63', 'Cameroon type (coast, mountains)'), ('#66BB6A', 'Humid tropical'), ('#C0CA33', 'Tropical (Sudan): 2 seasons'), ('#FFB74D', 'Dry tropical (Sahel)')]):
        ax.text(0.52, 0.85 - i * 0.1, '■ ' + t, transform=ax.transAxes, fontsize=19, fontweight='bold', color=c, bbox=dict(fc='white', ec='none', alpha=0.9))
    msave(fig, 'cameroon_climate_big.png')


def douala_climate_big():
    t = [27.5, 28, 28, 27.5, 27, 26, 25, 25, 25.5, 26, 27, 27.5]; r = [50, 90, 210, 240, 350, 500, 720, 700, 580, 420, 150, 60]
    def note(ax, a2): ax.text(0.02, 0.92, 'Douala: 4,000 mm, hot all year', transform=ax.transAxes, fontsize=21, fontweight='bold', color=NAVY)
    climate_graph('douala_climate_big.png', t, r, note, tlim=(0, 40), rlim=(0, 800))


def wet_months_big():
    fig, ax = chart()
    towns = ['Douala', 'Yaoundé', 'Ngaoundéré', 'Garoua', 'Kousseri']; m = [11, 9, 7, 5, 3]
    ax.barh(range(5), m, color=['#1B5E20', '#43A047', '#9CCC65', '#FFB74D', '#EF6C00'], height=0.65)
    ax.set_yticks(range(5)); ax.set_yticklabels(towns, fontsize=23, fontweight='bold'); ax.invert_yaxis()
    for i, v in enumerate(m): ax.text(v + 0.15, i, f'{v} months', fontsize=21, fontweight='bold', va='center')
    fig.subplots_adjust(left=0.2); ax.set_xlim(0, 14.5); ax.set_xlabel('Months of the rainy season (approx.)', fontsize=22, fontweight='bold')
    fig.savefig(OUT + 'wet_months_big.png', dpi=150, facecolor='white'); plt.close(fig)


ALL = [k for k in list(globals()) if k.endswith('_big') or k.endswith('_gif')]
if __name__ == '__main__':
    for f in (sys.argv[1:] or ALL):
        try: globals()[f](); print('ok', f)
        except Exception as e: print('FAIL', f, e)
