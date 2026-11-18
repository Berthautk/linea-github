"""Diagram for the Form 3 second sequence paper: the Earth at four positions A, B, C, D on its orbit (redrawn)."""
import numpy as np, matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import Ellipse, Circle, FancyArrowPatch
import sys
fig, ax = plt.subplots(figsize=(7.2, 4.4), dpi=200)
ax.set_xlim(-5, 5); ax.set_ylim(-3.9, 3.1); ax.set_aspect('equal'); ax.axis('off')
ax.add_patch(Ellipse((0, 0), 8.0, 5.0, fill=False, ec='black', lw=1.6))
# the Sun
ax.add_patch(Circle((0, 0), 0.38, fc='white', ec='black', lw=1.5))
for a in np.linspace(0, 2 * np.pi, 16, endpoint=False):
    ax.plot([0.48 * np.cos(a), 0.7 * np.cos(a)], [0.48 * np.sin(a), 0.7 * np.sin(a)], color='black', lw=1.2)
ax.text(0, 0, 'Sun', ha='center', va='center', fontsize=8)
# Earth at four positions (axis tilted 23.5° from the vertical, always in the same direction)
t = np.radians(23.5)
pos = {'A': (0, 2.5), 'B': (-4.0, 0), 'C': (0, -2.5), 'D': (4.0, 0)}
for k, (x, y) in pos.items():
    ax.add_patch(Circle((x, y), 0.42, fc='white', ec='black', lw=1.6, zorder=3))
    dx, dy = np.sin(t), np.cos(t)
    ax.plot([x - 0.78 * dx, x + 0.78 * dx], [y - 0.78 * dy, y + 0.78 * dy], color='black', lw=1.8, zorder=4)
    ax.plot([x - 0.42, x + 0.42], [y - 0.42 * 0.0, y], color='black', lw=0.8, ls=(0, (3, 2)), zorder=4)   # equator
    off = {'A': (0.75, 0.35), 'B': (-0.85, 0.0), 'C': (0.75, -0.35), 'D': (0.85, 0.0)}[k]
    ax.text(x + off[0], y + off[1], k, fontsize=15, fontweight='bold', ha='center', va='center',
            bbox=dict(boxstyle='circle,pad=0.25', fc='white', ec='black', lw=1.3))
ax.text(0, 0.95, 'N', fontsize=0)
# direction of revolution: anticlockwise, from B towards C (arrow just outside the orbit)
th = np.radians(np.linspace(205, 245, 40))
xs, ys = 4.45 * np.cos(th), 2.95 * np.sin(th)
ax.plot(xs[:-3], ys[:-3], color='black', lw=2)
ax.add_patch(FancyArrowPatch((xs[-4], ys[-4]), (xs[-1], ys[-1]), arrowstyle='-|>', mutation_scale=18, lw=2, color='black', zorder=5))
ax.text(-3.0, -3.35, 'Direction of the Earth’s revolution (orbit)', fontsize=8.5, ha='center', style='italic')
ax.text(0, -3.75, 'The axis of the Earth is tilted and always points in the same direction.', fontsize=8, ha='center', color='#444')
fig.savefig(sys.argv[1], dpi=200, bbox_inches='tight', facecolor='white')
