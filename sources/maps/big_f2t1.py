from big_common import *
from shapely.geometry import Polygon as SP
SAV = {'W': [(-17,11),(-17,14.5),(-5,14),(5,13.5),(15,12.5),(25,12.5),(33,12),(36,10),(35,6.5),(30,4.8),(25,4.8),(20,4.6),(15,5.5),(10,7),(5,7.8),(2,6.3),(0,8),(-5,7.8),(-10,8.5),(-15,10)],
 'E': [(33,3.5),(38,3.5),(40.5,-1),(39.5,-5),(38.5,-9),(35,-10),(31.5,-8),(29.5,-5),(30.5,-1.5),(32,1)],
 'S': [(12,-6),(24,-6.5),(30,-9),(36,-11.5),(40,-15),(36,-19),(33,-24),(30,-25.5),(27,-23),(24,-19),(20,-17.5),(16,-17),(13,-15),(12,-10)]}

def savanna_africa_big():
    ext = (-20, 55, -30, 25); fig, ax = map_axes(ext, (12.8, 7.0)); L = land()
    for pts in SAV.values(): ax.add_geometries([SP(pts).intersection(L)], PC, facecolor='#E3B53B', edgecolor='#8A6A10', lw=1, zorder=3)
    latline(ax, ext, 0, 'Equator 0°', c='#B0001A', ls='-'); latline(ax, ext, 15, '15°N'); latline(ax, ext, 5, '5°N'); latline(ax, ext, -5, '5°S'); latline(ax, ext, -15, '15°S')
    mlab(ax, 40, 19, 'Savanna', c='#8A6A10', fs=30)
    ax.plot(13.4, 9.3, 'o', ms=16, color=RED, mec='black', transform=PC, zorder=40); mlab(ax, 22, 21, 'Garoua', c=RED, fs=26)
    ax.plot([14, 20.5], [9.8, 20], color=RED, lw=3, transform=PC, zorder=39)
    msave(fig, 'savanna_africa_big.png')

def garoua_climate_big():
    t = [26.0,28.9,32.2,33.0,30.7,28.2,26.6,26.4,26.7,28.1,27.3,26.0]; r = [0,0,2,44,108,135,205,248,190,63,2,0]
    def note(ax, a2):
        ax.text(6.5, 285, 'Wet season', fontsize=28, fontweight='bold', color='#0D47A1', ha='center')
        ax.text(0.7, 285, 'Dry season', fontsize=28, fontweight='bold', color='#8D6E63', ha='center')
        ax.text(10.9, 285, 'Dry', fontsize=28, fontweight='bold', color='#8D6E63', ha='center')
    climate_graph('garoua_climate_big.png', t, r, note, tlim=(0, 40), rlim=(0, 320), wet=(4, 9))

def transhumance_gif():
    frames = []
    for k in range(34):
        fig, ax = canvas('#F3E3B5')
        ax.add_patch(Rectangle((0, 0), W_, H_ / 2, color='#A5C860', zorder=1))
        lab(ax, 1.9, 4.55, 'NORTH: Garoua', c=RED); lab(ax, 2.6, 0.45, 'SOUTH: river valleys', c=GREEN)
        dry = k < 17; f = (k if dry else k - 17) / 16
        y = (3.6 - 2.5 * f) if dry else (1.1 + 2.5 * f)
        lab(ax, 9.3, 4.55 if dry else 0.45, 'Dry season: go south' if dry else 'Rainy season: come back north', c=ORANGE if dry else BLUE, fs=26)
        for j, dx in enumerate([0, 0.9, 1.8]): cow(ax, 5.2 + dx, y - 0.1 * j, 0.8, face=1)
        person(ax, 7.8, y - 0.2, 0.9, c='#6A1B9A')
        arrow(ax, (11.6, 3.7), (11.6, 1.3) if dry else (11.6, 3.7), c=ORANGE, lw=6) if dry else arrow(ax, (11.6, 1.3), (11.6, 3.7), c=BLUE, lw=6)
        frames.append(frame(fig))
    save_gif(frames, 'transhumance.gif', ms=160, hold=6)
    frames[8].save(OUT + 'transhumance_mid.png')

if __name__ == '__main__':
    import sys
    for f in (sys.argv[1:] or ['savanna_africa_big', 'garoua_climate_big', 'transhumance_gif']): globals()[f]()
