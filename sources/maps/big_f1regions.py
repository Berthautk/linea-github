"""Form 1, Lesson 5 (Natural Regions of Cameroon): savanna types, mangrove, the two soils."""
from illus import *
import numpy as np

def tree(ax, x, y, s=1.0, c='#2E7D32'):
    ax.add_patch(Rectangle((x - 0.06 * s, y), 0.12 * s, 0.6 * s, color='#6D4C41', zorder=6))
    ax.add_patch(Circle((x, y + 0.85 * s), 0.42 * s, color=c, zorder=7))

def acacia(ax, x, y, s=1.0):
    ax.add_patch(Rectangle((x - 0.04 * s, y), 0.08 * s, 0.7 * s, color='#5D4037', zorder=6))
    ax.add_patch(Ellipse((x, y + 0.8 * s), 1.0 * s, 0.28 * s, color='#7C9A3A', zorder=7))

def grass(ax, x0, x1, y, n, h, c):
    rng = np.random.default_rng(3)
    for x in np.linspace(x0, x1, n):
        ax.plot([x, x + rng.uniform(-.08, .08)], [y, y + h * rng.uniform(.6, 1.0)], color=c, lw=2.2, zorder=4)

def savanna_types():
    fig, ax = canvas('#E3F2FD')
    cols = [('#8BC34A', 'GUINEA SAVANNA'), ('#C0CA33', 'SUDAN SAVANNA'), ('#E0B84A', 'SAHEL SAVANNA')]
    for k, (c, t) in enumerate(cols):
        x0 = k * 4.27
        ax.add_patch(Rectangle((x0, 0), 4.27, 1.5, color=c, zorder=1))
        if k: ax.plot([x0, x0], [0, H_], color=NAVY, lw=3, ls='--', zorder=9)
        lab(ax, x0 + 2.1, 4.6, t, c='#33452A', fs=20)
    grass(ax, 0.1, 4.2, 1.5, 90, 1.5, '#558B2F')
    for x in (0.7, 1.5, 2.3, 3.1, 3.8): tree(ax, x, 1.5, 0.9)
    grass(ax, 4.4, 8.4, 1.5, 60, 1.1, '#9E9D24')
    for x in (5.6, 7.2): tree(ax, x, 1.5, 1.0, '#5E8E2C')
    grass(ax, 8.7, 12.7, 1.5, 22, 0.6, '#B08A1E')
    acacia(ax, 10.7, 1.5, 0.9)
    lab(ax, 2.1, 0.7, 'tall grass, many trees', fs=17, c='white', box=False)
    lab(ax, 6.4, 0.7, 'grass, scattered trees', fs=17, c='#33452A', box=False)
    lab(ax, 10.6, 0.7, 'short grass, few thorny trees', fs=17, c='#4E342E', box=False)
    save(fig, 'savanna_types_big.png')

def mangrove():
    fig, ax = canvas('#E3F2FD')
    ax.add_patch(Rectangle((0, 0), W_, 1.4, color='#1E88E5', zorder=1)); ax.add_patch(Rectangle((0, 1.4), W_, 0.35, color='#6D5A44', zorder=1))
    for x in (2.2, 6.4, 10.6):
        ax.add_patch(Circle((x, 3.4), 1.0, color='#2E7D32', zorder=7)); ax.add_patch(Rectangle((x - 0.1, 2.1), 0.2, 1.0, color='#5D4037', zorder=6))
        for dx in (-0.9, -0.5, 0.5, 0.9): ax.plot([x + dx * 0.2, x + dx], [2.3, 1.2], color='#5D4037', lw=4, zorder=6)
    lab(ax, 6.4, 4.65, 'MANGROVE FOREST (coast)', c='#1B5E20', fs=22)
    lab(ax, 2.2, 0.55, 'prop roots above the water', fs=18, c='white', box=False); lab(ax, 10.2, 0.55, 'salty, swampy water', fs=18, c='white', box=False)
    save(fig, 'mangrove_big.png')

def two_soils():
    fig, ax = canvas('#F5F5F5')
    for k, (x0, name, c1, c2, top, thick) in enumerate([(0.4, 'FERRALLITIC SOIL (south)', '#B23A1E', '#C85A32', 'deep, red', 2.7), (6.9, 'FERRUGINOUS SOIL (north)', '#C97A44', '#8E5A36', 'less deep, brownish-red', 1.7)]):
        ax.add_patch(Rectangle((x0, 3.6 - thick), 5.5, thick, color=c1, zorder=2))
        ax.add_patch(Rectangle((x0, 3.6 - thick * 0.45), 5.5, thick * 0.45, color=c2, zorder=3))
        ax.add_patch(Rectangle((x0, 0.2), 5.5, 3.6 - thick - 0.2, color='#78909C', zorder=2))
        ax.add_patch(Rectangle((x0, 3.6), 5.5, 0.15, color='#3E2723', zorder=4))
        lab(ax, x0 + 2.75, 4.55, name, c='#4E342E', fs=19); lab(ax, x0 + 2.75, 3.6 - thick / 2, top, fs=18, c='white', box=False)
    lab(ax, 3.15, 0.55, 'rock', fs=18, c='white', box=False); lab(ax, 9.65, 0.95, 'rock', fs=18, c='white', box=False)
    lab(ax, 3.15, 3.95, 'washed by heavy rain, poor', fs=16, c='#333', box=False); lab(ax, 9.65, 3.95, 'iron-rich, hard in the dry season', fs=16, c='#333', box=False)
    save(fig, 'two_soils_big.png')

savanna_types(); mangrove(); two_soils()
