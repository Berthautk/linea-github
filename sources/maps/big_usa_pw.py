"""Big-label diagrams for the pilot of the deeper second-cycle board summary (USA Population, PW1)."""
import sys
from big_common import *
from big_f5 import CMR_POP


def pop_isopleth_big():
    fig = plt.figure(figsize=(12.8, 5.6), dpi=150); ax = fig.add_axes([0.02, 0.04, 0.6, 0.92])
    x, y = np.meshgrid(np.linspace(0, 10, 400), np.linspace(0, 7, 280))
    d = 900 * np.exp(-np.hypot(x - 3.5, y - 3.8) / 0.9) + 300 * np.exp(-np.hypot(x - 7.8, y - 2.0) / 0.7) + 60 * np.exp(-np.abs(y - 0.35 * x - 1.0) / 0.6) + 8
    lev = [0, 20, 50, 100, 500, 2000]; cols = ['#FFF8E1', '#FFE0B2', '#FFB74D', '#F57C00', '#B71C1C']
    ax.contourf(x, y, d, levels=lev, colors=cols)
    cs = ax.contour(x, y, d, levels=lev[1:-1], colors='#333', linewidths=2)
    ax.clabel(cs, fmt='%d', fontsize=16, inline=True)
    ax.plot(3.5, 3.8, 's', ms=14, color='black'); ax.text(3.7, 4.05, 'City', fontsize=18, fontweight='bold')
    ax.plot(7.8, 2.0, 's', ms=10, color='black'); ax.text(8.0, 2.2, 'Town', fontsize=16, fontweight='bold')
    ax.set_xticks([]); ax.set_yticks([])
    t = fig.add_axes([0.64, 0.04, 0.35, 0.92]); t.axis('off')
    t.text(0, 0.9, 'ISOPLETH MAP', fontsize=24, fontweight='bold', color=NAVY)
    t.text(0, 0.68, 'Lines (isopleths) join places\nwith the same population\ndensity (people per km²)', fontsize=17, fontweight='bold', color=NAVY, va='center')
    for i, (a, b, c) in enumerate(zip(lev[:-1], lev[1:], cols)):
        t.add_patch(Rectangle((0, 0.42 - i * 0.085), 0.08, 0.06, color=c, ec='#555'))
        t.text(0.11, 0.45 - i * 0.085, f'{a}–{b} per km²' if b < 2000 else f'over {a} per km²', fontsize=15, fontweight='bold', va='center')
    t.text(0, 0.0, 'Invented figures for teaching', fontsize=13, style='italic', color='#555')
    msave(fig, 'pop_isopleth_big.png')


def lorenz_cmr_big():
    rows = sorted(CMR_POP, key=lambda r: r[1] / r[2])            # least dense first
    A = sum(r[2] for r in rows); P = sum(r[1] for r in rows)
    xs, ys = [0], [0]
    for n, p, a in rows: xs.append(xs[-1] + 100 * a / A); ys.append(ys[-1] + 100 * p / P)
    fig, ax = chart((12.8, 5.8))
    ax.plot([0, 100], [0, 100], color=GREEN, lw=4, ls='--', label='Line of perfect equality (45°)')
    ax.plot(xs, ys, color=RED, lw=6, marker='o', ms=9, label='Lorenz curve: regions of Cameroon')
    ax.fill_between(xs, ys, xs, color='#FFCDD2', alpha=0.6)
    # share of population on the densest 20 % of the land
    y80 = np.interp(80, xs, ys); share = 100 - y80
    ax.annotate(f'The densest 20 % of the land\nholds about {share:.0f} % of the people', xy=(80, y80), xytext=(20, 62), fontsize=17, fontweight='bold', color=RED,
                arrowprops=dict(arrowstyle='-|>', color=RED, lw=2.5))
    ax.axvline(80, color='#999', lw=1.5, ls=':')
    ax.set_xlabel('Cumulative % of area', fontsize=20, fontweight='bold'); ax.set_ylabel('Cumulative % of population', fontsize=20, fontweight='bold')
    ax.set_xlim(0, 100); ax.set_ylim(0, 100); ax.legend(fontsize=16, frameon=False, loc='upper left')
    ax.text(99, 3, 'Regions ranked from least to most dense (approximate figures)', fontsize=12, style='italic', ha='right', color='#555')
    fig.subplots_adjust(left=0.1, bottom=0.15); msave(fig, 'lorenz_cmr_big.png')
    print('share', round(share, 1), [round(v) for v in ys])


def lapse_example_big():
    fig, ax = chart((12.8, 5.6)); d = np.linspace(0, 20, 200); D = 12000 * np.exp(-0.35 * d)
    ax.plot(d, D, color=NAVY, lw=6); ax.fill_between(d, D, color='#BBDEFB', alpha=0.6)
    for k in (5, 15):
        v = 12000 * np.exp(-0.35 * k); ax.plot([k, k], [0, v], color=RED, ls=':', lw=2); ax.plot(k, v, 'o', ms=12, color=RED)
        ax.text(k + 0.4 if k < 10 else k - 5.2, v + 700, f'{k} km: about {round(v, -1 if v < 1000 else -2):,.0f} per km²', fontsize=17, fontweight='bold', color=RED)
    ax.text(0.4, 12400, 'CBD (city centre)', fontsize=17, fontweight='bold', color=RED)
    ax.set_xlabel('Distance from the city centre (km)', fontsize=20, fontweight='bold'); ax.set_ylabel('People per km²', fontsize=20, fontweight='bold')
    ax.set_ylim(0, 13500); ax.set_xlim(0, 20)
    ax.text(19.8, 12000, 'Invented figures for teaching', fontsize=13, style='italic', ha='right', color='#555')
    fig.subplots_adjust(left=0.12, bottom=0.16); msave(fig, 'lapse_example_big.png')


def methods_compare_big():
    from big_usa_pop import table_big
    table_big('methods_compare_big.png', ['Technique', 'What it shows', 'Advantage', 'Disadvantage'],
              [['Dot map', 'where people live', 'shows the real pattern', 'dots merge in dense areas'],
               ['Choropleth map', 'density by area', 'easy to compare areas', 'hides differences inside areas'],
               ['Isopleth map', 'lines of equal density', 'shows gradual change', 'needs many data points'],
               ['Proportional symbols', 'population of each town', 'totals seen at a glance', 'symbols overlap'],
               ['Lorenz curve', 'degree of inequality', 'measures inequality', 'does not show location'],
               ['Density lapse graph', 'density vs distance', 'shows change from the CBD', 'one city at a time']],
              colw=[2.9, 3.0, 3.0, 3.1], fs=13)


if __name__ == '__main__':
    for n in (sys.argv[1:] or [k for k in dir() if k.endswith('_big')]): globals()[n]()
