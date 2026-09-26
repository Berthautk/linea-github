from big_common import *

def vvalley_big():
    fig, ax = canvas('#DDEFFB')
    ax.add_patch(Polygon([(0, 4.6), (5.9, 0.7), (6.9, 0.7), (12.8, 4.6), (12.8, 0), (0, 0)], color='#8D6E63'))
    ax.add_patch(Polygon([(5.9, 0.7), (6.9, 0.7), (6.7, 1.0), (6.1, 1.0)], color='#1E88E5'))
    arrow(ax, (6.4, 2.8), (6.4, 1.2), c=RED, lw=6); lab(ax, 9.3, 2.6, 'The river cuts DOWN', fs=28, c=RED)
    lab(ax, 3.2, 4.4, 'Steep sides: a V shape', fs=28, c=NAVY)
    save(fig, 'vvalley_big.png')

def rivercliff_big():
    fig, ax = canvas('#DDEFFB')
    ax.add_patch(Polygon([(0, 3.4), (2.2, 3.4), (2.3, 1.0), (4.0, 0.6), (9.5, 2.6), (12.8, 3.0), (12.8, 0), (0, 0)], color='#A1887F'))
    ax.add_patch(Polygon([(2.3, 1.0), (4.0, 0.6), (6.5, 1.5), (6.5, 1.9), (2.3, 1.9)], color='#1E88E5'))
    lab(ax, 3.2, 4.3, 'RIVER CLIFF: steep (erosion)', fs=24, c=RED); arrow(ax, (2.6, 4.0), (2.3, 2.4), c=RED)
    lab(ax, 9.3, 3.9, 'SLIP-OFF SLOPE: gentle (deposition)', fs=22, c='#8D6E00'); arrow(ax, (9.3, 3.6), (8.0, 2.2), c='#8D6E00')
    ax.text(4.2, 1.2, 'Deep, fast water', fontsize=20, fontweight='bold', color='white')
    save(fig, 'rivercliff_big.png')

def barchan_big():
    fig, ax = canvas('#F3E3B5')
    t = np.linspace(-np.pi / 2, np.pi / 2, 100)
    outer = np.c_[7.2 - 2.0 * np.cos(t), 2.5 + 2.1 * np.sin(t)]; inner = np.c_[8.6 - 1.2 * np.cos(t[::-1]), 2.5 + 1.5 * np.sin(t[::-1])]
    ax.add_patch(Polygon(np.r_[outer, inner], color='#D9A441', ec='#8D6E00', lw=3))
    for y in (1.6, 2.5, 3.4): arrow(ax, (0.5, y), (3.8, y), c=ORANGE, lw=6)
    lab(ax, 2.1, 4.4, 'Wind', fs=28, c=ORANGE)
    lab(ax, 10.6, 4.55, 'Horn', fs=26, c=RED); lab(ax, 10.6, 0.45, 'Horn', fs=26, c=RED)
    lab(ax, 10.6, 2.5, 'The horns point\nwith the wind', fs=24, c=NAVY)
    save(fig, 'barchan_big.png')

def seif_big():
    fig, ax = canvas('#F3E3B5')
    for k in range(4):
        y = 0.8 + k * 1.05; ax.add_patch(Polygon([(1.5, y), (11.0, y + 0.35), (11.3, y + 0.5), (1.8, y + 0.25)], color='#C98A2E'))
    arrow(ax, (0.3, 4.9), (2.2, 4.3), c=ORANGE, lw=5); arrow(ax, (0.3, 0.1), (2.2, 0.7), c=ORANGE, lw=5)
    lab(ax, 9.0, 4.6, 'Long, straight lines of sand', fs=24, c=NAVY); lab(ax, 3.7, 0.35, 'Wind from two directions', fs=22, c=ORANGE)
    save(fig, 'seif_big.png')

for f in ['vvalley_big', 'rivercliff_big', 'barchan_big', 'seif_big']: globals()[f](); print('ok', f)
