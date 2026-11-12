"""Form 3, Lesson 11 (Volcanoes, three parts): drawings that replace the photographs (every activity and figure is drawn).
Run: python3 big_f3d.py"""
import numpy as np
from matplotlib.patches import Polygon, Rectangle, Ellipse, Circle
from illus import canvas, lab, arrow, save, RED, NAVY, W_, H_
SKY = '#E3F2FD'; BR = '#6D4C41'; MAG = '#E53935'; LAVA = '#FF7043'; GR = '#8D6E63'

def ground(ax, h=0.9): ax.add_patch(Rectangle((0, 0), W_, h, color=GR, zorder=1))
def cone(ax, cx, base, h, y0=0.9, c=BR, top=0.5):
    ax.add_patch(Polygon([(cx - base / 2, y0), (cx - top / 2, y0 + h), (cx + top / 2, y0 + h), (cx + base / 2, y0)], color=c, zorder=3))
def smoke(ax, x, y, n=4, c='#9E9E9E'):
    for k in range(n): ax.add_patch(Circle((x + 0.25 * k * (-1) ** k, y + 0.5 * k), 0.3 + 0.1 * k, color=c, alpha=0.85, zorder=4))

def eruption():
    fig, ax = canvas(SKY); ground(ax)
    cone(ax, 6.4, 7.0, 2.0, top=0.9)
    ax.add_patch(Rectangle((6.2, 0.9), 0.4, 2.0, color=MAG, zorder=4))
    smoke(ax, 6.4, 3.1, 4)
    for dx, dy in [(-1.1, 3.5), (-0.5, 3.9), (1.2, 3.4), (0.6, 4.0)]: ax.add_patch(Circle((6.4 + dx, dy), 0.14, color=LAVA, zorder=6))
    ax.add_patch(Polygon([(5.95, 2.9), (5.2, 1.9), (4.2, 0.9), (4.9, 0.9), (5.7, 1.9), (6.1, 2.8)], color=LAVA, zorder=5))
    lab(ax, 2.4, 4.3, 'ash and gases', fs=22, c='#424242'); lab(ax, 10.6, 4.3, 'lava bombs', fs=22, c=RED)
    lab(ax, 2.4, 2.0, 'lava flow', fs=22, c=RED); lab(ax, 10.6, 2.0, 'volcano', fs=22, c=BR)
    save(fig, 'eruption_big.png')

def activity():
    fig, ax = canvas(SKY); ground(ax)
    ax.plot([4.25, 4.25], [0, H_], color=NAVY, lw=3, ls='--', zorder=9); ax.plot([8.5, 8.5], [0, H_], color=NAVY, lw=3, ls='--', zorder=9)
    cone(ax, 2.1, 3.4, 2.0, top=0.5); ax.add_patch(Rectangle((1.95, 0.9), 0.3, 2.0, color=MAG, zorder=4)); smoke(ax, 2.1, 3.1, 3)
    ax.add_patch(Polygon([(1.9, 2.8), (1.2, 1.8), (0.8, 0.9), (1.4, 0.9), (1.7, 1.8), (2.0, 2.7)], color=LAVA, zorder=5))
    cone(ax, 6.4, 3.4, 2.0, top=0.5)
    ax.text(6.0, 3.3, 'z z z', fontsize=24, color='#455A64', fontweight='bold', zorder=6)
    cone(ax, 10.7, 3.4, 2.0, top=1.2, c='#757575'); ax.add_patch(Ellipse((10.7, 2.9), 1.1, 0.25, color='#1E88E5', zorder=4))
    lab(ax, 2.1, 4.55, 'ACTIVE', c=RED); lab(ax, 6.4, 4.55, 'DORMANT', c='#E65100'); lab(ax, 10.7, 4.55, 'EXTINCT', c='#455A64')
    lab(ax, 2.1, 0.45, 'erupts now', fs=18, c='white', box=False); lab(ax, 6.4, 0.45, 'sleeping', fs=18, c='white', box=False); lab(ax, 10.7, 0.45, 'will not erupt', fs=18, c='white', box=False)
    save(fig, 'volcano_activity_big.png')

def volcanic_mountain():
    fig, ax = canvas(SKY); ground(ax)
    ax.add_patch(Polygon([(1.0, 0.9), (5.0, 4.0), (6.0, 4.1), (8.0, 3.9), (11.8, 0.9)], color=BR, zorder=3))
    ax.add_patch(Polygon([(4.4, 3.55), (5.0, 4.0), (6.0, 4.1), (8.0, 3.9), (8.6, 3.45), (7.4, 3.6), (6.5, 3.35), (5.5, 3.6)], color='white', zorder=4))
    ax.add_patch(Polygon([(2.2, 0.9), (4.4, 2.5), (6.0, 1.6), (8.6, 2.6), (10.6, 0.9)], color='#7CB342', zorder=4, alpha=0.9))
    for x in (3.0, 4.4, 8.6, 9.7): ax.add_patch(Circle((x, 1.3), 0.35, color='#2E7D32', zorder=5))
    lab(ax, 6.4, 4.65, 'VOLCANIC MOUNTAIN', c=BR); lab(ax, 6.4, 3.2, 'built by many eruptions', fs=20, c='white', box=False)
    save(fig, 'volcanic_mountain_big.png')

def plateau():
    fig, ax = canvas(SKY)
    for k, c in enumerate(['#8D6E63', '#A1887F', '#6D4C41', '#BCAAA4']): ax.add_patch(Rectangle((0, k * 0.9), W_, 0.9, color=c, zorder=1))
    ax.add_patch(Rectangle((2.6, 3.6), 7.6, 0.55, color='#37474F', zorder=3))
    ax.add_patch(Polygon([(0, 3.6), (2.6, 3.6), (2.6, 4.15), (2.0, 4.15), (0, 3.6)], color='#8D6E63', zorder=2))
    ax.add_patch(Polygon([(10.2, 3.6), (W_, 3.6), (W_, 3.6), (10.8, 4.15), (10.2, 4.15)], color='#8D6E63', zorder=2))
    for x in (3.6, 6.4, 9.2): ax.add_patch(Rectangle((x, 0.2), 0.18, 3.4, color=MAG, zorder=3))
    arrow(ax, (4.0, 2.4), (4.0, 3.5), c=RED, lw=5); arrow(ax, (6.8, 2.4), (6.8, 3.5), c=RED, lw=5)
    lab(ax, 6.4, 4.65, 'LAVA PLATEAU: wide, flat highland', c='#37474F', fs=24); lab(ax, 2.0, 1.4, 'long cracks', fs=20, c=RED); lab(ax, 11.0, 2.3, 'layers of lava', fs=20, c='#37474F')
    save(fig, 'lava_plateau_big.png')

def dyke():
    fig, ax = canvas(SKY)
    for k, c in enumerate(['#BCAAA4', '#A1887F', '#D7CCC8', '#8D6E63']): ax.add_patch(Rectangle((0, k * 1.1), W_, 1.1, color=c, zorder=1))
    ax.add_patch(Rectangle((0, 4.4), W_, 0.6, color=SKY, zorder=1))
    ax.add_patch(Rectangle((6.1, 0.0), 0.6, 4.4, color=MAG, zorder=3))
    arrow(ax, (6.4, 0.3), (6.4, 3.9), c='white', lw=5)
    lab(ax, 4.2, 4.65, 'DYKE: a vertical wall of igneous rock', c=RED, fs=22); lab(ax, 3.0, 2.2, 'layers of rock', fs=22, c='#4E342E', box=False)
    lab(ax, 10.2, 3.3, 'it cuts across the layers', fs=20, c=RED, box=False)
    save(fig, 'dyke_big.png')

def plug():
    fig, ax = canvas(SKY); ground(ax, 1.0)
    ax.add_patch(Polygon([(0, 1.0), (4.0, 1.0), (2.0, 2.2)], color='#C5B9A8', zorder=2, alpha=0.8, ls='--'))
    ax.text(0.5, 1.15, 'old cone (eroded)', fontsize=17, color='#6D4C41', zorder=6, fontweight='bold')
    ax.add_patch(Polygon([(7.0, 1.0), (7.4, 3.4), (7.9, 4.3), (8.5, 3.4), (8.9, 1.0)], color='#4E342E', zorder=4))
    ax.add_patch(Polygon([(10.0, 1.0), (10.3, 2.6), (10.7, 3.2), (11.1, 2.6), (11.4, 1.0)], color='#4E342E', zorder=4))
    lab(ax, 8.0, 4.65, 'VOLCANIC PLUG', c=RED, fs=24); lab(ax, 3.2, 3.5, 'the soft cone is removed by erosion', fs=19, c='#4E342E', box=False)
    lab(ax, 8.0, 0.5, 'the hard magma of the vent remains', fs=20, c='white', box=False)
    save(fig, 'plug_big.png')

eruption(); activity(); volcanic_mountain(); plateau(); dyke(); plug()
