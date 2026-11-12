"""Form 1, Lesson 4 (The Notion of the Environment): board-style drawings."""
from illus import *
import numpy as np

def tree(ax, x, y, s=1.0):
    ax.add_patch(Rectangle((x - 0.07 * s, y), 0.14 * s, 0.55 * s, color='#6D4C41', zorder=6))
    ax.add_patch(Circle((x, y + 0.85 * s), 0.45 * s, color='#2E7D32', zorder=7))

def house(ax, x, y, s=1.0):
    ax.add_patch(Rectangle((x, y), 0.9 * s, 0.6 * s, color='#E0A96D', zorder=6))
    ax.add_patch(Polygon([[x - 0.1 * s, y + 0.6 * s], [x + 1.0 * s, y + 0.6 * s], [x + 0.45 * s, y + 1.05 * s]], color='#B0001A', zorder=7))
    ax.add_patch(Rectangle((x + 0.35 * s, y), 0.2 * s, 0.35 * s, color='#5D4037', zorder=7))

def car(ax, x, y, s=1.0):
    ax.add_patch(Rectangle((x, y + 0.15 * s), 1.1 * s, 0.35 * s, color='#1565C0', zorder=6))
    ax.add_patch(Rectangle((x + 0.25 * s, y + 0.5 * s), 0.6 * s, 0.25 * s, color='#1565C0', zorder=6))
    for dx in (0.25, 0.85): ax.add_patch(Circle((x + dx * s, y + 0.13 * s), 0.13 * s, color='#222', zorder=7))

def mountain(ax, x, w, h, y=1.6, c='#8D6E63'):
    ax.add_patch(Polygon([[x - w / 2, y], [x, y + h], [x + w / 2, y]], color=c, zorder=3))

def cloud(ax, x, y, s=1.0):
    for dx, dy, r in [(0, 0, .4), (.4, .1, .45), (.85, 0, .38), (.4, -.1, .4)]:
        ax.add_patch(Circle((x + dx * s, y + dy * s), r * s, color='white', zorder=4))

def bird(ax, x, y):
    ax.add_patch(Ellipse((x, y), 0.5, 0.25, color='#E65100', zorder=7)); ax.add_patch(Circle((x + 0.3, y + 0.1), 0.1, color='#E65100', zorder=7))

def natural_vs_made():
    fig, ax = canvas('#DDEFFB')
    ax.add_patch(Rectangle((0, 0), W_, 1.7, color='#7CB342', zorder=1))
    ax.add_patch(Rectangle((0, 0), 6.4, 1.7, color='#7CB342', zorder=1)); ax.add_patch(Rectangle((6.4, 0), 6.4, 1.7, color='#B0B0B0', zorder=1))
    ax.plot([6.4, 6.4], [0, H_], color='#12305A', lw=4, zorder=9, ls='--')
    sun(ax, 1.0, 4.2); mountain(ax, 4.6, 3.2, 1.6)
    ax.add_patch(Polygon([[1.2, 0], [2.4, 1.7], [3.0, 1.7], [2.0, 0]], color='#1E88E5', zorder=2))
    tree(ax, 0.7, 0.3); tree(ax, 4.9, 0.2, 1.1); bird(ax, 3.4, 3.3)
    house(ax, 7.1, 1.7, 1.3); house(ax, 9.3, 1.7, 1.0); car(ax, 8.2, 0.55, 1.3)
    ax.add_patch(Rectangle((10.9, 1.7), 0.4, 2.4, color='#546E7A', zorder=6)); ax.add_patch(Rectangle((11.4, 1.7), 0.4, 1.7, color='#78909C', zorder=6))
    lab(ax, 3.2, 4.55, 'NATURAL ENVIRONMENT', c='#1B5E20'); lab(ax, 9.6, 4.55, 'MADE BY MAN', c=RED)
    lab(ax, 1.5, 0.4, 'water', fs=20, c='#0D47A1', box=False); lab(ax, 3.4, 2.8, 'animals', fs=20, c='#BF360C', box=False)
    save(fig, 'env_natural_man_big.png')

def spheres():
    fig, ax = canvas('#BBDEFB')
    ax.add_patch(Rectangle((0, 0), W_, 2.0, color='#8D6E63', zorder=1))             # lithosphere
    ax.add_patch(Polygon([[3.4, 2.0], [5.2, 3.9], [7.0, 2.0]], color='#795548', zorder=2))
    ax.add_patch(Polygon([[0, 2.0], [3.0, 2.0], [3.0, 2.6], [0, 2.6]], color='#6D9F3A', zorder=2))
    ax.add_patch(Rectangle((7.0, 2.0), 3.2, 0.9, color='#1E88E5', zorder=2))        # hydrosphere
    ax.add_patch(Polygon([[10.2, 2.0], [12.8, 2.0], [12.8, 2.6], [10.2, 2.9]], color='#1E88E5', zorder=2))
    ax.add_patch(Rectangle((0, 0), W_, 0.01, color='#555'))
    tree(ax, 1.0, 2.6); tree(ax, 2.3, 2.6, 0.8); bird(ax, 1.6, 4.1)                 # biosphere
    cloud(ax, 7.2, 4.1); cloud(ax, 10.6, 4.2, 0.8)                                  # atmosphere
    lab(ax, 2.6, 1.0, 'LITHOSPHERE', c='#4E342E'); lab(ax, 9.9, 3.6, 'HYDROSPHERE', c='#0D47A1')
    lab(ax, 1.9, 4.6, 'BIOSPHERE', c='#1B5E20'); lab(ax, 6.4, 4.65, 'ATMOSPHERE', c='#01579B')
    lab(ax, 9.9, 1.0, 'rocks and soil', fs=20, c='#4E342E', box=False); lab(ax, 6.4, 0.9, 'rocks, soil', fs=1, c='#8D6E63', box=False)
    save(fig, 'spheres_env_big.png')

def ecosystem_needs():
    fig, ax = canvas('#DDEFFB')
    ax.add_patch(Rectangle((0, 0), W_, 1.3, color='#8D6E63', zorder=1))
    sun(ax, 1.2, 4.2, 0.6)
    tree(ax, 3.0, 1.3, 1.5); bird(ax, 6.6, 2.6)
    ax.add_patch(Circle((10.3, 2.1), 0.28, color='#FBC02D', zorder=7)); ax.add_patch(Rectangle((10.1, 1.3), 0.4, 0.55, color='#1565C0', zorder=7))
    arrow(ax, (1.8, 3.9), (2.7, 3.0), c='#F9A825'); arrow(ax, (4.6, 2.6), (6.0, 2.6)); arrow(ax, (7.2, 2.6), (9.4, 2.2))
    arrow(ax, (3.9, 0.45), (3.4, 1.5), c='#4E342E')
    lab(ax, 1.4, 3.25, 'sunlight', fs=20, c='#E65100', box=False); lab(ax, 6.2, 0.55, 'soil, water and air', fs=22, c='white', box=False)
    lab(ax, 5.3, 3.2, 'food', fs=20, c='#1B5E20', box=False); lab(ax, 8.3, 3.2, 'food', fs=20, c='#1B5E20', box=False)
    lab(ax, 3.0, 4.7, 'PLANTS', c='#1B5E20', fs=22); lab(ax, 6.6, 3.5, 'ANIMALS', c='#BF360C', fs=22); lab(ax, 10.3, 3.0, 'HUMAN BEINGS', c=NAVY, fs=22)
    save(fig, 'ecosystem_needs_big.png')

natural_vs_made(); spheres(); ecosystem_needs()

def resources():
    fig, ax = canvas('#FFF8E1')
    for k, (x, t, u) in enumerate([(2.2, 'WATER', 'drinking, farming'), (6.4, 'SOIL', 'growing crops'), (10.6, 'WOOD', 'building, firewood')]):
        ax.add_patch(Rectangle((x - 1.9, 0.5), 3.8, 4.0, fc='white', ec='#12305A', lw=3, zorder=1))
        lab(ax, x, 4.0, t, c='#12305A'); lab(ax, x, 0.95, u, fs=17, c='#333', box=False)
    ax.add_patch(Polygon([[2.2, 3.0], [1.5, 1.9], [2.9, 1.9]], color='#1E88E5', zorder=3)); ax.add_patch(Circle((2.2, 1.95), 0.7, color='#1E88E5', zorder=3))
    ax.add_patch(Rectangle((4.8, 1.6), 3.2, 0.9, color='#5D4037', zorder=3)); ax.add_patch(Rectangle((4.8, 2.5), 3.2, 0.3, color='#7CB342', zorder=3))
    tree(ax, 6.4, 2.8, 0.55)
    for y in (1.7, 2.3, 2.9): ax.add_patch(Ellipse((10.6, y), 2.6, 0.5, color='#8D6E63', zorder=3)); ax.add_patch(Ellipse((11.9, y), 0.4, 0.5, color='#D7B899', zorder=4))
    save(fig, 'resources_env_big.png')
resources()

def living_nonliving():
    fig, ax = canvas('#DDEFFB')
    ax.add_patch(Rectangle((0, 0), W_, 1.3, color='#7CB342', zorder=1))
    ax.plot([6.4, 6.4], [0, H_], color='#12305A', lw=4, zorder=9, ls='--')
    tree(ax, 1.3, 1.3, 1.2); bird(ax, 3.2, 3.0)
    ax.add_patch(Circle((4.8, 2.35), 0.28, color='#FBC02D', zorder=7)); ax.add_patch(Rectangle((4.6, 1.5), 0.4, 0.55, color='#1565C0', zorder=7))
    ax.add_patch(Ellipse((2.9, 1.6), 0.9, 0.5, color='#8D4F2B', zorder=7)); ax.add_patch(Circle((3.35, 1.8), 0.17, color='#8D4F2B', zorder=7))
    sun(ax, 8.0, 3.7, 0.5)
    ax.add_patch(Polygon([[10.0, 1.3], [10.9, 2.7], [11.8, 1.3]], color='#8D6E63', zorder=6)); ax.add_patch(Ellipse((9.2, 1.45), 1.4, 0.35, color='#9E9E9E', zorder=6))
    ax.add_patch(Ellipse((8.0, 0.65), 3.0, 0.7, color='#1E88E5', zorder=6)); cloud(ax, 10.2, 3.9, 0.9)
    lab(ax, 3.2, 4.5, 'LIVING (BIOTIC)', c='#1B5E20'); lab(ax, 9.6, 4.5, 'NON-LIVING (ABIOTIC)', c='#4E342E')
    lab(ax, 1.3, 0.55, 'plants', fs=18, c='white', box=False); lab(ax, 4.0, 0.55, 'animals, people', fs=18, c='white', box=False)
    lab(ax, 8.0, 3.0, 'sunlight', fs=18, c='#E65100', box=False); lab(ax, 11.7, 0.55, 'rocks', fs=18, c='#222', box=False)
    save(fig, 'living_nonliving_big.png')
living_nonliving()
