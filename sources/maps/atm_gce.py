# GCE-style vertical temperature profile of the atmosphere (layers, pauses, pressure, ozone layer)
import numpy as np, matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.colors import LinearSegmentedColormap
OUT = '/home/claude/f4/img/v2/atm_profile_gce.png'
fig, ax = plt.subplots(figsize=(10, 9.2), dpi=160)
# sky gradient: pale at the ground, deep blue at the top
sky = LinearSegmentedColormap.from_list('sky', ['#eef7fb', '#bfe3f2', '#5fb3dc', '#1f6fb3'])
grad = np.linspace(0, 1, 400).reshape(-1, 1)
ax.imshow(grad, extent=[-100, 80, 0, 120], origin='lower', aspect='auto', cmap=sky, zorder=0)
# ozone layer band
ax.axhspan(18, 32, color='#d9f3f6', alpha=0.75, zorder=1)
ax.text(-12, 25.5, 'Ozone Layer', fontsize=15, color='#1b4f72', ha='center', va='center', style='italic', zorder=5)
# temperature profile
T = [15, -56, -56, -2, -2, -90, -90, -80, 0, 70]
Z = [0, 11, 20, 47, 52, 85, 90, 100, 108, 116]
ax.plot(T, Z, color='#7a1f4f', lw=3.2, zorder=6)
# pauses
for z, name, x in [(11, 'Tropopause', -75), (50, 'Stratopause', -58), (85, 'Mesopause', -40)]:
    ax.axhline(z, color='#333', lw=1.3, ls='--', zorder=4)
    ax.text(x, z + 1.2, name, fontsize=16, color='#111', zorder=7, bbox=dict(fc='white', ec='none', alpha=0.6, pad=1.5))
# layers with arrows on the right
xa = 35
for z0, z1, name in [(0, 11, 'Troposphere'), (11, 50, 'Stratosphere'), (50, 85, 'Mesosphere'), (85, 120, 'Thermosphere')]:
    ax.annotate('', xy=(xa, z0 + 0.6), xytext=(xa, z1 - 0.6), arrowprops=dict(arrowstyle='<->', lw=2, color='#111'), zorder=7)
    zm = {'Troposphere': 7.2, 'Stratosphere': 36, 'Mesosphere': 67, 'Thermosphere': 102}[name]
    ax.text(xa, zm, name, fontsize=18, fontweight='bold', ha='center', va='center', color='#111', zorder=8,
            bbox=dict(fc='white', ec='none', alpha=0.55, pad=2))
# pressure labels
for z, p in [(4.5, '1000 hPa'), (16, '100 hPa'), (31, '10 hPa'), (48, '1 hPa'), (64, '0.1 hPa'), (80, '0.01 hPa'), (97, '0.001 hPa')]:
    ax.text(79, z, p, fontsize=12, ha='right', va='center', color='#0b2545', fontweight='bold', zorder=8)
# ground with hills and clouds
xs = np.linspace(-100, 80, 400)
hill = 1.2 + 0.9 * np.sin(xs / 7) + 0.9 * np.sin(xs / 3.1) + 1.4 * np.exp(-((xs + 55) / 9) ** 2) * 2
ax.fill_between(xs, 0, np.clip(hill, 0.3, None), color='#2f3b2a', zorder=3)
for cx, cy in [(-68, 6.5), (-25, 7.5), (62, 7.0)]:
    for dx, r in [(-4, 2.2), (0, 3.0), (4, 2.2)]:
        ax.add_patch(plt.Circle((cx + dx, cy), r, color='white', alpha=0.85, zorder=2))
ax.set_xlim(-100, 80); ax.set_ylim(0, 120)
ax.set_xticks(range(-100, 81, 20)); ax.set_yticks(range(0, 121, 10))
ax.tick_params(labelsize=14, width=1.5, length=6)
ax.set_xlabel('Temperature (°C)', fontsize=17); ax.set_ylabel('Altitude (km)', fontsize=17)
for s in ax.spines.values(): s.set_linewidth(1.8)
fig.tight_layout()
fig.savefig(OUT, facecolor='white'); print(OUT)
