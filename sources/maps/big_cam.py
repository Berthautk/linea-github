from big_common import *
import sys

def cam_profile_big():
    # schematic relief section of Cameroon from the coast (SW) to Lake Chad (N); heights approximate, not to scale
    fig, ax = plt.subplots(figsize=(12.8, 6.4), dpi=150)
    x = [0, 3, 6, 10, 14, 18, 22, 26, 30, 33, 36, 40, 44, 48, 52, 56, 60, 64, 68, 72, 76, 80]
    h = [0, 60, 150, 450, 620, 680, 650, 720, 1000, 1150, 1100, 1250, 1100, 700, 300, 220, 250, 500, 1100, 900, 350, 290]
    ax.fill_between(x, 0, h, color='#8D6E63', zorder=2); ax.plot(x, h, color='#4E342E', lw=3, zorder=3)
    ax.fill_between([-2, 1.5], 0, 40, color='#64B5F6', zorder=1)
    lab = [(1.5, 250, 'Coastal\nlowlands\n(0–300 m)', '#1B5E20'), (15, 950, 'Southern Plateau\n(about 650 m)', '#1B5E20'),
           (37, 1480, 'Adamawa Plateau\n(about 1,100 m)', '#4E342E'), (56, 820, 'Benue\ndepression\n(about 200 m)', '#E65100'),
           (68, 1450, 'Mandara Mts\n(up to 1,494 m)', '#4E342E'), (82, 620, 'Chad\nplain\n(about 300 m)', '#E65100')]
    for (a, b, t, c) in lab: ax.text(a, b, t, ha='center', va='center', fontsize=17, fontweight='bold', color=c, bbox=dict(boxstyle='round,pad=0.25', fc='white', ec=c, lw=2))
    ax.text(0, -170, 'SW\n(Kribi)', ha='center', fontsize=16, fontweight='bold'); ax.text(80, -170, 'N\n(Lake Chad)', ha='center', fontsize=16, fontweight='bold')
    ax.text(55, -150, 'Garoua', ha='center', fontsize=16, fontweight='bold', color=RED)
    ax.set_xlim(-3, 87); ax.set_ylim(-280, 1750); ax.set_yticks(range(0, 1751, 250)); ax.set_ylabel('Altitude (m)', fontsize=20, fontweight='bold'); ax.set_xticks([])
    ax.tick_params(labelsize=16); [s.set_visible(False) for k, s in ax.spines.items() if k in ('top', 'right')]
    ax.set_title('Simplified relief section of Cameroon (not to scale)', fontsize=20, fontweight='bold', color=RED)
    fig.tight_layout(); fig.savefig(OUT + 'cam_profile_big.png', dpi=150, facecolor='white'); plt.close(fig)

def ngaoundere_climate_big():
    t = [21.5, 23.5, 25.0, 24.5, 23.0, 21.5, 20.5, 20.5, 21.0, 21.5, 21.5, 21.0]; r = [2, 4, 40, 140, 200, 225, 265, 275, 240, 150, 12, 2]
    def note(ax, a2): ax.text(6.5, 290, 'Wet season (about 7 months)', fontsize=24, fontweight='bold', color='#0D47A1', ha='center')
    climate_graph('ngaoundere_climate_big.png', t, r, note, tlim=(0, 40), rlim=(0, 320), wet=(3, 9))

def maroua_climate_big():
    t = [26.5, 29.0, 32.5, 34.5, 33.0, 29.5, 27.0, 26.0, 27.0, 29.0, 28.5, 26.5]; r = [0, 0, 3, 18, 55, 110, 200, 255, 140, 30, 1, 0]
    def note(ax, a2): ax.text(7, 290, 'Wet season (about 4 months)', fontsize=24, fontweight='bold', color='#0D47A1', ha='center')
    climate_graph('maroua_climate_big.png', t, r, note, tlim=(0, 40), rlim=(0, 320), wet=(5, 8))

def cam_rain_towns_big():
    towns = ['Debundscha', 'Douala', 'Yaoundé', 'Ngaoundéré', 'Garoua', 'Maroua', 'Kousseri']
    rain = [10000, 3900, 1600, 1500, 1000, 800, 550]
    fig, ax = chart(); cols = ['#0D47A1', '#1565C0', '#1E88E5', '#42A5F5', '#FFA726', '#FB8C00', '#E65100']
    ax.bar(range(7), rain, color=cols, width=0.7, zorder=2)
    for i, v in enumerate(rain): ax.text(i, v + 180, f'{v:,}', ha='center', fontsize=20, fontweight='bold')
    ax.set_xticks(range(7)); ax.set_xticklabels(towns, fontsize=15, fontweight='bold'); ax.set_ylim(0, 11200)
    ax.set_ylabel('Mean annual rainfall (mm)', fontsize=20, fontweight='bold'); ax.tick_params(axis='y', labelsize=16)
    ax.text(3.5, 8200, 'Rainfall decreases from the coast inland\n(approximate values)', ha='center', fontsize=20, fontweight='bold', color=RED)
    fig.savefig(OUT + 'cam_rain_towns_big.png', dpi=150, facecolor='white'); plt.close(fig)

if __name__ == '__main__':
    for f in (sys.argv[1:] or ['cam_profile_big', 'ngaoundere_climate_big', 'maroua_climate_big', 'cam_rain_towns_big']): globals()[f]()
