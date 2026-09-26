import numpy as np, matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt, matplotlib.patheffects as pe
from matplotlib.patches import Polygon, Rectangle, Circle, Ellipse, FancyArrowPatch, FancyBboxPatch, Arc, Wedge

OUT = '/home/claude/f4/img/'
W = [pe.withStroke(linewidth=3, foreground='white')]
RED = '#990011'; NAVY = '#1C3F6E'; BLUE = '#1F5FBF'; SKY = '#EAF4FB'


def canvas(w, h, bg=SKY):
    fig, ax = plt.subplots(figsize=(w, h), dpi=200)
    ax.set_xlim(0, w); ax.set_ylim(0, h); ax.set_aspect('equal'); ax.axis('off')
    if bg: ax.add_patch(Rectangle((0, 0), w, h, color=bg, zorder=0))
    return fig, ax


def arrow(ax, a, b, c=NAVY, lw=2.5, ms=18, style='-|>', cs=None, z=6):
    ax.add_patch(FancyArrowPatch(a, b, arrowstyle=style, mutation_scale=ms, color=c, lw=lw, connectionstyle=cs or 'arc3', zorder=z))


def lab(ax, x, y, t, fs=12, c='#1A1A1A', ha='center', va='center', bold=True):
    pe_ = [pe.withStroke(linewidth=3, foreground='#222')] if c in ('white', '#FFFFFF') else W
    ax.text(x, y, t, fontsize=fs, color=c, ha=ha, va=va, fontweight='bold' if bold else 'normal', path_effects=pe_, zorder=9)


def title(ax, x, y, t, fs=16):
    ax.text(x, y, t, fontsize=fs, fontweight='bold', color=RED, ha='center', va='center', zorder=10)


def save(fig, name):
    fig.savefig(OUT + name, bbox_inches='tight', pad_inches=0.06, facecolor='white'); plt.close(fig)


def cloud(ax, x, y, s=1.0, c='white', ec='#9AA7B5', z=5):
    for dx, dy, r in [(-0.5, 0, 0.35), (-0.15, 0.18, 0.45), (0.3, 0.1, 0.4), (0.62, -0.02, 0.3), (0.05, -0.08, 0.4)]:
        ax.add_patch(Circle((x + dx * s, y + dy * s), r * s, color=c, ec=ec, lw=1, zorder=z))
    for dx, dy, r in [(-0.5, 0, 0.33), (-0.15, 0.18, 0.43), (0.3, 0.1, 0.38), (0.62, -0.02, 0.28), (0.05, -0.08, 0.38)]:
        ax.add_patch(Circle((x + dx * s, y + dy * s), r * s, color=c, ec='none', zorder=z + 0.1))


def sun(ax, x, y, r=0.45):
    ax.add_patch(Circle((x, y), r, color='#F7C31A', zorder=5))
    for a in np.linspace(0, 2 * np.pi, 12, endpoint=False):
        ax.plot([x + 1.25 * r * np.cos(a), x + 1.7 * r * np.cos(a)], [y + 1.25 * r * np.sin(a), y + 1.7 * r * np.sin(a)], color='#F2A900', lw=2.2, zorder=5)


# ---------------- L30 atmosphere ----------------
def atmosphere():
    fig, (ax, ax2) = plt.subplots(1, 2, figsize=(12, 7), dpi=200, gridspec_kw={'width_ratios': [1.35, 1], 'wspace': 0.05}, sharey=True)
    layers = [(0, 12, '#DDEFFB', 'TROPOSPHERE (0 – about 12 km)', 'Weather, clouds, rain; we live here'),
              (12, 50, '#C8E2F5', 'STRATOSPHERE (12 – 50 km)', 'Ozone layer (about 15 – 35 km)'),
              (50, 85, '#B2D3EE', 'MESOSPHERE (50 – 85 km)', 'Meteors burn up here'),
              (85, 110, '#9CC3E6', 'THERMOSPHERE (above 85 km)', 'Auroras; very thin air')]
    for lo, hi, c, t, sub in layers:
        ax.add_patch(Rectangle((0, lo), 10, hi - lo, color=c, zorder=0))
        ax.text(0.3, (lo + hi) / 2 + 2.2, t, fontsize=12.5, fontweight='bold', color=NAVY, va='center')
        ax.text(0.3, (lo + hi) / 2 - 2.6, sub, fontsize=11, color='#222', va='center', style='italic')
    for b, t in [(12, 'Tropopause'), (50, 'Stratopause'), (85, 'Mesopause')]:
        ax.axhline(b, color='#4A6A8A', lw=1, ls='--'); ax.text(9.8, b + 1, t, fontsize=9.5, ha='right', color='#4A6A8A')
    ax.add_patch(Rectangle((0, 18), 10, 17, color='#7E57C2', alpha=0.18, zorder=1))
    ax.text(6.4, 21.8, 'OZONE LAYER', fontsize=11, fontweight='bold', color='#5E35B1', ha='center')
    # mountain, plane, cloud
    ax.add_patch(Polygon([(5.5, 0), (7.6, 8.8), (9.6, 0)], color='#7A6A55', zorder=2))
    ax.add_patch(Polygon([(7.1, 6.8), (7.6, 8.8), (8.1, 6.8)], color='white', zorder=3))
    ax.text(7.6, 9.7, 'Everest 8.8 km', fontsize=8.5, ha='center')
    ax.plot([4.6], [15.2], marker=(3, 0, -90), ms=12, color='#333'); ax.text(5.1, 15.2, 'Planes fly at 10–12 km', fontsize=9, va='center')
    ax.set_xlim(0, 10); ax.set_ylim(0, 110); ax.set_xticks([])
    ax.set_ylabel('Altitude (km)', fontsize=12, fontweight='bold')
    ax.set_title('THE LAYERS OF THE ATMOSPHERE', fontsize=15, fontweight='bold', color=RED, loc='left')
    z = [0, 12, 20, 50, 85, 110]; t = [15, -56, -56, -2, -90, 20]
    ax2.plot(t, z, color='#C0392B', lw=3)
    ax2.set_xlabel('Temperature (°C)', fontsize=12, fontweight='bold'); ax2.set_xlim(-100, 30)
    for b in (12, 50, 85): ax2.axhline(b, color='#4A6A8A', lw=1, ls='--')
    ax2.annotate('Temperature falls\nwith height\n(about 6.5 °C per km)', xy=(-20, 6), xytext=(-99, 22), fontsize=10, fontweight='bold', arrowprops=dict(arrowstyle='-', lw=1))
    ax2.annotate('Temperature rises:\nozone absorbs UV rays', xy=(-25, 38), xytext=(-99, 60), fontsize=10, fontweight='bold', arrowprops=dict(arrowstyle='-', lw=1))
    ax2.set_title('HOW TEMPERATURE CHANGES', fontsize=13, fontweight='bold', color=RED, loc='left')
    ax2.grid(axis='x', color='#E3E3E3'); ax2.spines[['top', 'right']].set_visible(False)
    fig.savefig(OUT + 'atmosphere_layers.png', bbox_inches='tight', pad_inches=0.08, facecolor='white'); plt.close(fig)


# ---------------- instruments ----------------
def draw_thermo(ax, x, y, h=2.2):
    ax.add_patch(FancyBboxPatch((x - 0.12, y), 0.24, h, boxstyle='round,pad=0.02,rounding_size=0.12', fc='white', ec='#555', lw=1.5, zorder=3))
    ax.add_patch(Circle((x, y), 0.22, color='#D62828', zorder=4)); ax.add_patch(Rectangle((x - 0.05, y), 0.1, h * 0.65, color='#D62828', zorder=4))
    for k in range(1, 8): ax.plot([x + 0.12, x + 0.25], [y + k * h / 8] * 2, color='#555', lw=1, zorder=4)


def draw_raingauge(ax, x, y):
    ax.add_patch(Rectangle((x - 0.45, y), 0.9, 1.4, fc='#B0BEC5', ec='#455A64', lw=1.5, zorder=3))
    ax.add_patch(Polygon([(x - 0.55, y + 1.8), (x + 0.55, y + 1.8), (x + 0.08, y + 1.25), (x - 0.08, y + 1.25)], fc='#CFD8DC', ec='#455A64', lw=1.5, zorder=4))
    ax.add_patch(Rectangle((x - 0.2, y + 0.1), 0.4, 0.9, fc='#E3F2FD', ec='#1F5FBF', lw=1.2, zorder=5)); ax.add_patch(Rectangle((x - 0.2, y + 0.1), 0.4, 0.35, color='#64B5F6', zorder=6))
    ax.add_patch(Rectangle((x - 1.0, y - 0.1), 2.0, 0.1, color='#6D8B3A', zorder=2))


def draw_vane(ax, x, y):
    ax.plot([x, x], [y, y + 2.0], color='#444', lw=3, zorder=3)
    ax.plot([x - 0.9, x + 0.9], [y + 1.6, y + 1.6], color='#222', lw=2.5, zorder=4)
    ax.add_patch(Polygon([(x + 0.9, y + 1.6), (x + 0.6, y + 1.75), (x + 0.6, y + 1.45)], color='#222', zorder=5))
    ax.add_patch(Polygon([(x - 0.9, y + 1.6), (x - 0.6, y + 1.95), (x - 0.4, y + 1.95), (x - 0.65, y + 1.6), (x - 0.4, y + 1.25), (x - 0.6, y + 1.25)], color='#222', zorder=5))
    for t, dx, dy in [('N', 0, 0.55), ('S', 0, -0.55), ('E', 0.55, 0), ('W', -0.55, 0)]:
        ax.text(x + dx, y + 0.9 + dy, t, fontsize=9, ha='center', va='center', fontweight='bold')
    ax.plot([x - 0.4, x + 0.4], [y + 0.9, y + 0.9], color='#444', lw=1.5); ax.plot([x, x], [y + 0.5, y + 1.3], color='#444', lw=1.5)


def draw_anemo(ax, x, y):
    ax.plot([x, x], [y, y + 1.7], color='#444', lw=3, zorder=3)
    for a in (0, 120, 240):
        r = np.radians(a); ex, ey = x + 0.85 * np.cos(r), y + 1.7 + 0.3 * np.sin(r)
        ax.plot([x, ex], [y + 1.7, ey], color='#444', lw=2, zorder=3)
        ax.add_patch(Wedge((ex, ey), 0.22, 90 if np.cos(r) > 0 else -90, 270 if np.cos(r) > 0 else 90, color='#1F5FBF', zorder=4))


def draw_barometer(ax, x, y):
    ax.add_patch(Circle((x, y + 1.0), 0.9, fc='#F5E6C8', ec='#8A6A30', lw=3, zorder=3))
    for a in np.linspace(210, -30, 9):
        r = np.radians(a); ax.plot([x + 0.7 * np.cos(r), x + 0.82 * np.cos(r)], [y + 1 + 0.7 * np.sin(r), y + 1 + 0.82 * np.sin(r)], color='#333', lw=1.3, zorder=4)
    ax.plot([x, x + 0.5 * np.cos(np.radians(60))], [y + 1, y + 1 + 0.5 * np.sin(np.radians(60))], color='#C0392B', lw=2.5, zorder=5)
    ax.text(x - 0.5, y + 0.55, 'Rain', fontsize=7.5, ha='center'); ax.text(x + 0.5, y + 0.55, 'Fair', fontsize=7.5, ha='center')


def draw_hygro(ax, x, y):
    ax.add_patch(Rectangle((x - 0.75, y), 1.5, 2.3, fc='#ECEFF1', ec='#607D8B', lw=1.5, zorder=2))
    draw_thermo(ax, x - 0.35, y + 0.35, 1.7); draw_thermo(ax, x + 0.35, y + 0.35, 1.7)
    ax.add_patch(Ellipse((x + 0.35, y + 0.3), 0.5, 0.35, color='#90CAF9', zorder=6)); ax.add_patch(Rectangle((x + 0.15, y - 0.3), 0.4, 0.35, fc='#BBDEFB', ec='#1F5FBF', zorder=5))
    ax.text(x - 0.35, y + 2.45, 'dry', fontsize=8, ha='center'); ax.text(x + 0.35, y + 2.45, 'wet', fontsize=8, ha='center')


def draw_sunrec(ax, x, y):
    ax.add_patch(Rectangle((x - 0.8, y), 1.6, 0.2, color='#6D4C41', zorder=2))
    ax.add_patch(Arc((x, y + 0.9), 1.6, 1.6, theta1=180, theta2=360, color='#8D6E63', lw=4, zorder=3))
    ax.add_patch(Circle((x, y + 0.9), 0.55, fc='#E1F5FE', ec='#4FC3F7', lw=2, alpha=0.9, zorder=4))
    ax.add_patch(Circle((x - 0.15, y + 1.05), 0.12, color='white', zorder=5))
    ax.plot([x - 0.5, x + 0.5], [y + 0.2, y + 0.2], color='#444', lw=1)


def instruments_all():
    fig, ax = canvas(13.5, 7.7, 'white')
    title(ax, 6.2, 7.35, 'THE MAIN INSTRUMENTS OF A WEATHER STATION', 16)
    items = [(draw_thermo, 'Thermometer', 'Temperature (°C)'), (draw_raingauge, 'Rain gauge', 'Rainfall (mm)'), (draw_hygro, 'Hygrometer', 'Humidity (%)'),
             (draw_vane, 'Wind vane', 'Wind direction'), (draw_anemo, 'Anemometer', 'Wind speed (km/h, knots)'), (draw_barometer, 'Barometer', 'Pressure (mb)'), (draw_sunrec, 'Sunshine recorder', 'Sunshine (hours)')]
    for i, (f, n, m) in enumerate(items):
        cx = 1.0 + (i % 4) * 3.8 if i < 4 else 2.9 + (i - 4) * 3.8
        cy = 4.0 if i < 4 else 0.6
        box = FancyBboxPatch((cx - 1.6, cy - 0.65), 3.2, 3.3, boxstyle='round,pad=0.02,rounding_size=0.15', fc='#F4F8FC', ec='#C9D6E3', lw=1.2, zorder=1)
        ax.add_patch(box)
        f(ax, cx, cy + 0.35)
        ax.text(cx, cy - 0.05, n.replace('\n', ' '), fontsize=11, fontweight='bold', color=NAVY, ha='center', va='center')
        ax.text(cx, cy - 0.4, m, fontsize=9.5, color='#333', ha='center', va='center')
    ax.set_xlim(-0.8, 14.2)
    save(fig, 'weather_instruments.png')


# ---------------- Stevenson screen ----------------
def stevenson():
    fig, ax = canvas(12.5, 7.2)
    ax.add_patch(Rectangle((0, 0), 12.5, 1.1, color='#7CB342', zorder=1)); lab(ax, 10.3, 0.55, 'Short grass (not concrete)', 11.5)
    x0, y0, w, h = 3.6, 3.1, 2.8, 2.2
    for lx in (x0 + 0.2, x0 + w - 0.2):
        ax.plot([lx, lx], [1.1, y0], color='#EEE', lw=7, zorder=2); ax.plot([lx, lx], [1.1, y0], color='#BBB', lw=1, zorder=2)
    ax.add_patch(Rectangle((x0, y0), w, h, fc='white', ec='#888', lw=2, zorder=3))
    for k in range(10):
        yy = y0 + 0.15 + k * 0.2; ax.plot([x0 + 0.1, x0 + w - 0.1], [yy, yy - 0.08], color='#BBB', lw=1.5, zorder=4)
    ax.add_patch(Polygon([(x0 - 0.25, y0 + h), (x0 + w / 2, y0 + h + 0.6), (x0 + w + 0.25, y0 + h)], fc='white', ec='#888', lw=2, zorder=4))
    ax.add_patch(Polygon([(x0 - 0.1, y0 + h + 0.12), (x0 + w / 2, y0 + h + 0.45), (x0 + w + 0.1, y0 + h + 0.12)], fc='white', ec='#AAA', lw=1, zorder=5))
    # height arrow
    arrow(ax, (x0 - 0.8, 1.1), (x0 - 0.8, y0 + 1.0), c=RED, style='<|-|>', ms=14, lw=2)
    lab(ax, x0 - 1.9, 2.4, 'Thermometers\nabout 1.25 m\nabove the ground', 11, RED)
    # labels
    ax.annotate('Double roof', xy=(x0 + w / 2, y0 + h + 0.5), xytext=(8.4, 6.4), fontsize=11.5, fontweight='bold', arrowprops=dict(arrowstyle='-', lw=1.2))
    ax.annotate('Louvred sides: air flows in,\nsun and rain stay out', xy=(x0 + w - 0.1, y0 + 1.2), xytext=(7.4, 4.6), fontsize=11.5, fontweight='bold', arrowprops=dict(arrowstyle='-', lw=1.2))
    ax.annotate('Painted white to\nreflect sunlight', xy=(x0 + 0.3, y0 + 1.8), xytext=(0.2, 6.0), fontsize=11.5, fontweight='bold', arrowprops=dict(arrowstyle='-', lw=1.2))
    ax.annotate('Wooden legs', xy=(x0 + 0.2, 2.0), xytext=(1.2, 1.5), fontsize=11, fontweight='bold', arrowprops=dict(arrowstyle='-', lw=1.2))
    lab(ax, 9.6, 3.4, 'Door faces NORTH\n(in the Northern Hemisphere)', 11.5, NAVY)
    # tree and building far away
    ax.add_patch(Rectangle((11.3, 1.1), 0.25, 1.3, color='#6D4C41', zorder=2)); ax.add_patch(Circle((11.42, 2.8), 0.7, color='#4E8B3A', zorder=2))
    arrow(ax, (7.2, 1.7), (10.4, 1.7), c='#555', style='<|-|>', ms=12, lw=1.5); lab(ax, 8.8, 2.05, 'Far from trees and buildings', 10.5)
    title(ax, 6.25, 6.95, 'THE STEVENSON SCREEN AND ITS SITING', 16)
    save(fig, 'stevenson_screen.png')


def sixs():
    fig, ax = canvas(8, 6.6, 'white')
    title(ax, 4, 6.3, "SIX'S MAXIMUM AND MINIMUM THERMOMETER", 14)
    # U tube
    ax.add_patch(Rectangle((2.0, 1.4), 0.35, 4.0, fc='#F5F5F5', ec='#555', lw=1.5)); ax.add_patch(Rectangle((5.65, 1.4), 0.35, 4.0, fc='#F5F5F5', ec='#555', lw=1.5))
    ax.add_patch(Arc((4.0, 1.4), 3.95, 1.6, theta1=180, theta2=360, color='#555', lw=12)); ax.add_patch(Arc((4.0, 1.4), 3.95, 1.6, theta1=180, theta2=360, color='#C0C0C0', lw=8))
    ax.add_patch(Rectangle((2.06, 1.4), 0.23, 1.2, color='#9E9E9E')); ax.add_patch(Rectangle((5.71, 1.4), 0.23, 2.4, color='#9E9E9E'))
    ax.add_patch(Rectangle((2.06, 2.6), 0.23, 2.8, color='#BBDEFB')); ax.add_patch(Rectangle((5.71, 3.8), 0.23, 1.2, color='#BBDEFB'))
    ax.add_patch(Ellipse((2.18, 5.75), 0.7, 0.9, fc='#BBDEFB', ec='#555', lw=1.5))
    ax.add_patch(Rectangle((2.1, 2.62), 0.15, 0.3, color='#1F5FBF')); ax.add_patch(Rectangle((5.75, 3.82), 0.15, 0.3, color='#C0392B'))
    lab(ax, 0.9, 2.8, 'Minimum\nindex', 11, BLUE); lab(ax, 7.0, 4.0, 'Maximum\nindex', 11, '#C0392B')
    lab(ax, 0.8, 5.7, 'Alcohol', 11); lab(ax, 4.0, 0.3, 'Mercury (at the bottom of the U)', 11)
    lab(ax, 4.0, 4.6, 'Read the bottom\nof each index', 10.5, '#333')
    save(fig, 'sixs_thermometer.png')


# ---------------- L34 clouds & condensation forms ----------------
def clouds():
    fig, ax = canvas(13, 7)
    ax.add_patch(Rectangle((0, 0), 13, 0.6, color='#8BC34A'))
    for y, t in [(2.2, 'Low clouds (below 2 km)'), (4.0, 'Middle clouds (2 – 6 km)'), (5.9, 'High clouds (above 6 km)')]:
        ax.text(0.15, y, t, fontsize=10.5, color='#4A6A8A', fontweight='bold')
    ax.plot([0, 13], [3.3, 3.3], color='#9FB6CC', ls='--', lw=1); ax.plot([0, 13], [5.2, 5.2], color='#9FB6CC', ls='--', lw=1)
    # cirrus
    for i in range(5):
        ax.plot(np.linspace(3.2 + i * 0.5, 4.6 + i * 0.5, 30), 6.1 + 0.15 * np.sin(np.linspace(0, 3, 30)) + i * 0.05, color='#90A4AE', lw=2)
    lab(ax, 4.4, 5.55, 'CIRRUS: thin, feathery,\nmade of ice crystals', 10.5)
    # stratus layer
    ax.add_patch(FancyBboxPatch((0.4, 1.3), 4.0, 0.6, boxstyle='round,pad=0.05,rounding_size=0.3', fc='#CFD8DC', ec='#90A4AE'))
    lab(ax, 2.4, 0.95, 'STRATUS: grey layer,\ngives drizzle', 10.5)
    # cumulus
    cloud(ax, 6.3, 2.1, 0.9); lab(ax, 6.3, 1.0, 'CUMULUS: white, puffy,\nfine weather', 10.5)
    # cumulonimbus tower
    ax.add_patch(Polygon([(8.4, 5.7), (12.6, 5.7), (12.9, 6.05), (8.1, 6.05)], fc='#B0BEC5', ec='#78909C', lw=1.5, zorder=4))
    for yy, s_ in [(1.8, 1.25), (2.7, 1.1), (3.6, 1.0), (4.5, 0.95), (5.3, 0.9)]:
        cloud(ax, 10.45, yy, s_, c='#B0BEC5', ec='#78909C')
    for x in np.linspace(9.3, 11.6, 9): ax.plot([x, x - 0.2], [1.1, 0.7], color=BLUE, lw=2)
    ax.plot([10.8, 10.5, 10.9, 10.6], [1.3, 0.95, 0.95, 0.6], color='#F7C31A', lw=3)
    lab(ax, 7.6, 4.3, 'CUMULONIMBUS:\ntall storm cloud,\nheavy rain, thunder\nand lightning', 10.5)
    title(ax, 6.5, 6.75, 'THE MAIN TYPES OF CLOUDS', 16)
    save(fig, 'cloud_types.png')


def condensation_forms():
    fig, ax = canvas(13, 5.2)
    panels = [('DEW', 'Water drops on grass\nafter a clear, calm night'), ('FOG', 'Cloud at ground level:\nwe see less than 1 km'), ('MIST', 'Thin fog: we can see\nmore than 1 km'), ('FROST', 'Ice crystals, when the\ndew point is below 0 °C')]
    for i, (t, d) in enumerate(panels):
        x0 = 0.2 + i * 3.2
        ax.add_patch(FancyBboxPatch((x0, 0.2), 3.0, 4.2, boxstyle='round,pad=0.02,rounding_size=0.15', fc='#F4F8FC', ec='#C9D6E3', lw=1.2))
        ax.add_patch(Rectangle((x0 + 0.1, 0.9), 2.8, 0.4, color='#7CB342'))
        for gx in np.linspace(x0 + 0.2, x0 + 2.8, 14): ax.plot([gx, gx + 0.05], [1.3, 1.75], color='#558B2F', lw=2)
        if t == 'DEW':
            for gx in np.linspace(x0 + 0.25, x0 + 2.75, 9): ax.add_patch(Circle((gx, 1.8), 0.07, color='#64B5F6', ec='#1F5FBF'))
        if t in ('FOG', 'MIST'):
            al = 0.8 if t == 'FOG' else 0.4
            ax.add_patch(Rectangle((x0 + 0.1, 1.3), 2.8, 2.2, color='#ECEFF1', alpha=al))
            ax.add_patch(Rectangle((x0 + 2.2, 1.3), 0.15, 0.9, color='#6D4C41', alpha=0.5 if t == 'FOG' else 0.9)); ax.add_patch(Circle((x0 + 2.27, 2.5), 0.4, color='#4E8B3A', alpha=0.3 if t == 'FOG' else 0.8))
        if t == 'FROST':
            for gx in np.linspace(x0 + 0.25, x0 + 2.75, 9): ax.plot(gx, 1.8, marker=(6, 2, 0), ms=10, color='#90CAF9')
        ax.text(x0 + 1.5, 3.95, t, fontsize=14, fontweight='bold', color=RED, ha='center')
        ax.text(x0 + 1.5, 0.55, d, fontsize=9.5, ha='center', va='center', fontweight='bold')
    ax.text(6.5, 4.85, 'FORMS OF CONDENSATION NEAR THE GROUND', fontsize=16, fontweight='bold', color=RED, ha='center')
    save(fig, 'condensation_forms.png')


# ---------------- L35 rainfall types ----------------
def rainfall_types():
    fig, axs = plt.subplots(1, 3, figsize=(15, 5.6), dpi=200)
    for a in axs: a.set_xlim(0, 6); a.set_ylim(0, 6); a.set_aspect('equal'); a.axis('off'); a.add_patch(Rectangle((0, 0), 6, 6, color=SKY))
    # convectional
    a = axs[0]; a.add_patch(Rectangle((0, 0), 6, 0.8, color='#C9A15A')); sun(a, 0.9, 5.1, 0.35)
    for x in (2.2, 3.0, 3.8): arrow(a, (x, 1.0), (x, 3.3), c='#E53935', lw=2.5)
    a.add_patch(Polygon([(1.6, 3.6), (4.6, 3.6), (4.3, 4.6), (5.0, 5.5), (1.2, 5.5), (1.9, 4.6)], fc='#B0BEC5', ec='#78909C'))
    for x in np.linspace(1.8, 4.4, 8): a.plot([x, x - 0.15], [3.4, 2.4], color=BLUE, lw=1.8)
    lab(a, 3.0, 0.4, 'Hot ground heats the air', 10.5); lab(a, 5.0, 2.2, 'Warm air\nrises and\ncools', 10, '#C62828')
    a.set_title('1. CONVECTIONAL RAINFALL', fontsize=13, fontweight='bold', color=RED)
    # relief
    a = axs[1]; a.add_patch(Rectangle((0, 0), 1.2, 0.6, color='#4F86C6')); a.add_patch(Polygon([(1.2, 0), (3.6, 3.4), (6, 0)], color='#8D6E63')); a.add_patch(Rectangle((1.2, 0), 4.8, 0.2, color='#8D6E63'))
    arrow(a, (0.2, 1.0), (1.3, 1.0), c=NAVY); arrow(a, (1.5, 1.2), (3.0, 3.3), c=NAVY)
    cloud(a, 2.6, 3.9, 0.8, c='#B0BEC5', ec='#78909C')
    for x in np.linspace(2.0, 3.1, 6): a.plot([x, x - 0.12], [3.5, 2.2], color=BLUE, lw=1.8)
    arrow(a, (3.9, 3.4), (5.4, 1.2), c='#E0A020')
    lab(a, 1.2, 4.8, 'Moist air\nfrom the sea', 10); lab(a, 2.0, 1.2, 'Windward\nslope: rain', 10, NAVY); lab(a, 5.0, 2.8, 'Leeward slope:\nrain shadow\n(dry)', 10, '#8A5A00')
    a.set_title('2. RELIEF (OROGRAPHIC) RAINFALL', fontsize=13, fontweight='bold', color=RED)
    # frontal
    a = axs[2]; a.add_patch(Rectangle((0, 0), 6, 0.4, color='#8BC34A'))
    a.add_patch(Polygon([(3.2, 0.4), (6, 0.4), (6, 3.6)], color='#90CAF9', alpha=0.8)); lab(a, 5.1, 1.2, 'Cold,\nheavy air', 10.5, NAVY)
    a.add_patch(Polygon([(0, 0.4), (3.2, 0.4), (6, 3.6), (6, 4.6), (0, 2.5)], color='#FFCC80', alpha=0.7)); lab(a, 1.3, 1.4, 'Warm,\nlight air', 10.5, '#C62828')
    arrow(a, (1.8, 1.2), (4.8, 3.6), c='#C62828')
    cloud(a, 4.2, 4.5, 0.8, c='#B0BEC5', ec='#78909C')
    for x in np.linspace(3.7, 4.8, 6): a.plot([x, x - 0.12], [4.1, 2.9], color=BLUE, lw=1.8)
    lab(a, 2.5, 3.7, 'Warm air rises\nover cold air', 10)
    a.set_title('3. FRONTAL (CYCLONIC) RAINFALL', fontsize=13, fontweight='bold', color=RED)
    fig.savefig(OUT + 'rainfall_types.png', bbox_inches='tight', pad_inches=0.06, facecolor='white'); plt.close(fig)


def rain_gauge():
    fig, ax = canvas(8.6, 6.8, 'white')
    ax.add_patch(Rectangle((0, 0), 8.6, 0.9, color='#8BC34A')); ax.add_patch(Rectangle((0, 0), 8.6, 0.45, color='#6D4C41'))
    x = 3.0
    ax.add_patch(Rectangle((x - 0.9, 0.45), 1.8, 3.2, fc='#CFD8DC', ec='#455A64', lw=2))
    ax.add_patch(Polygon([(x - 1.05, 4.6), (x + 1.05, 4.6), (x + 0.12, 3.5), (x - 0.12, 3.5)], fc='#ECEFF1', ec='#455A64', lw=2))
    ax.add_patch(Rectangle((x - 0.55, 0.7), 1.1, 2.4, fc='#E3F2FD', ec='#1F5FBF', lw=1.5)); ax.add_patch(Rectangle((x - 0.55, 0.7), 1.1, 0.9, color='#64B5F6'))
    for xx in np.linspace(x - 0.8, x + 0.8, 6): ax.plot([xx, xx - 0.1], [5.8, 5.0], color=BLUE, lw=2)
    ax.annotate('Funnel collects the rain', xy=(x + 0.9, 4.4), xytext=(5.0, 5.3), fontsize=12, fontweight='bold', arrowprops=dict(arrowstyle='-', lw=1.2))
    ax.annotate('Collecting jar (bottle)', xy=(x + 0.55, 2.2), xytext=(5.0, 3.3), fontsize=12, fontweight='bold', arrowprops=dict(arrowstyle='-', lw=1.2))
    ax.annotate('Outer case, partly\nburied in the ground', xy=(x + 0.9, 0.7), xytext=(5.0, 1.5), fontsize=12, fontweight='bold', arrowprops=dict(arrowstyle='-', lw=1.2))
    arrow(ax, (0.9, 0.9), (0.9, 4.6), c=RED, style='<|-|>', ms=12, lw=2); lab(ax, 0.9, 5.05, 'Rim about\n30 cm above\nthe ground', 10.5, RED)
    ax.text(4.3, 6.45, 'THE RAIN GAUGE', fontsize=16, fontweight='bold', color=RED, ha='center')
    lab(ax, 4.3, -0.35, 'The water is poured into a measuring cylinder to read the rainfall in mm.', 11)
    ax.set_ylim(-0.7, 6.8)
    save(fig, 'rain_gauge.png')


# ---------------- L36 pressure belts ----------------
def pressure_belts():
    fig, ax = canvas(12, 11, 'white')
    cx, cy, R = 6.0, 5.4, 4.6
    ax.add_patch(Circle((cx, cy), R, fc='#EAF4FB', ec=NAVY, lw=2.5, zorder=1))
    belts = [(90, 'POLAR HIGH (H)', '#1565C0'), (60, 'SUB-POLAR LOW (L)', '#C62828'), (30, 'SUB-TROPICAL HIGH (H)', '#1565C0'), (0, 'EQUATORIAL LOW (L)\nThe Doldrums', '#C62828'),
             (-30, 'SUB-TROPICAL HIGH (H)', '#1565C0'), (-60, 'SUB-POLAR LOW (L)', '#C62828'), (-90, 'POLAR HIGH (H)', '#1565C0')]
    for la, t, c in belts:
        y = cy + R * np.sin(np.radians(la)); half = R * np.cos(np.radians(la))
        if abs(la) < 90:
            ax.plot([cx - half, cx + half], [y, y], color=c, lw=6 if la == 0 else 4, alpha=0.8, zorder=2)
        ax.text(cx + R + 0.3 if abs(la) < 90 else cx, y + (0.35 if la == 90 else -0.35 if la == -90 else 0), (f'{abs(la)}°' + ('N' if la > 0 else 'S' if la < 0 else '') + '  ' + t) if abs(la) < 90 else t,
                fontsize=11, fontweight='bold', color=c, va='center', ha='left' if abs(la) < 90 else 'center', zorder=5)
    def wind(la1, la2, dx, name, side):
        y1 = cy + R * np.sin(np.radians(la1)); y2 = cy + R * np.sin(np.radians(la2))
        for xoff in (-2.2, 0, 2.2):
            x = cx + xoff
            arrow(ax, (x - dx / 2, y1), (x + dx / 2, y2), c='#2E7D32', lw=2.5, ms=16)
        ym = (y1 + y2) / 2; ax.text(cx - R - 0.3, ym, name, fontsize=11, fontweight='bold', color='#2E7D32', ha='right', va='center')
    wind(26, 5, -0.9, 'North-East\nTrade Winds', 0); wind(-26, -5, -0.9, 'South-East\nTrade Winds', 0)
    wind(34, 56, 1.0, 'Westerlies', 0); wind(-34, -56, 1.0, 'Westerlies', 0)
    wind(84, 64, -0.9, 'Polar\nEasterlies', 0); wind(-84, -64, -0.9, 'Polar\nEasterlies', 0)
    ax.text(6.0, 10.6, 'PRESSURE BELTS AND PLANETARY WINDS', fontsize=17, fontweight='bold', color=RED, ha='center')
    ax.text(6.0, -0.2, 'H = high pressure (sinking, dry air)     L = low pressure (rising air, rain)     Winds blow from H to L and are deflected by the Earth\'s rotation',
            fontsize=10, ha='center', color='#333')
    ax.set_xlim(-0.6, 13.6); ax.set_ylim(-0.5, 11)
    save(fig, 'pressure_belts.png')


# ---------------- L37 local winds ----------------
def local_winds():
    fig, axs = plt.subplots(2, 2, figsize=(13, 9), dpi=200)
    for a in axs.flat: a.set_xlim(0, 6); a.set_ylim(0, 4); a.set_aspect('equal'); a.axis('off')
    def coast(a, day):
        a.add_patch(Rectangle((0, 0), 6, 4, color=SKY if day else '#1E2A4A'))
        a.add_patch(Rectangle((0, 0), 3, 1.0, color='#C9A15A')); a.add_patch(Rectangle((3, 0), 3, 0.8, color='#3A7BD5'))
        if day: sun(a, 0.7, 3.4, 0.3)
        else: a.add_patch(Circle((0.7, 3.4), 0.28, color='#F5F5DC')); a.add_patch(Circle((0.82, 3.47), 0.25, color='#1E2A4A'))
        c = '#1A1A1A' if day else 'white'
        if day:
            arrow(a, (4.8, 1.2), (1.8, 1.2), c='#1565C0', lw=3); arrow(a, (1.5, 1.4), (1.5, 2.8), c='#C62828'); arrow(a, (1.8, 3.0), (4.6, 3.0), c='#777'); arrow(a, (4.8, 2.8), (4.8, 1.4), c='#1565C0')
            a.text(1.5, 0.45, 'Land: hot (L)', ha='center', fontsize=11, fontweight='bold'); a.text(4.5, 0.35, 'Sea: cooler (H)', ha='center', fontsize=11, fontweight='bold', color='white')
            a.text(3.2, 1.45, 'SEA BREEZE', ha='center', fontsize=12, fontweight='bold', color='#1565C0')
        else:
            arrow(a, (1.5, 1.2), (4.5, 1.2), c='#64B5F6', lw=3); arrow(a, (4.8, 1.4), (4.8, 2.8), c='#EF9A9A'); arrow(a, (4.5, 3.0), (1.7, 3.0), c='#BBB'); arrow(a, (1.4, 2.8), (1.4, 1.4), c='#64B5F6')
            a.text(1.5, 0.45, 'Land: cool (H)', ha='center', fontsize=11, fontweight='bold'); a.text(4.5, 0.35, 'Sea: warmer (L)', ha='center', fontsize=11, fontweight='bold', color='white')
            a.text(3.0, 1.45, 'LAND BREEZE', ha='center', fontsize=12, fontweight='bold', color='#90CAF9')
    def valley(a, day):
        a.add_patch(Rectangle((0, 0), 6, 4, color=SKY if day else '#1E2A4A'))
        a.add_patch(Polygon([(0, 0), (0, 3.0), (2.4, 0.5), (3.6, 0.5), (6, 3.0), (6, 0)], color='#7A8B55'))
        if day:
            sun(a, 3.0, 3.4, 0.3)
            arrow(a, (2.2, 0.9), (0.6, 2.6), c='#C62828', lw=3); arrow(a, (3.8, 0.9), (5.4, 2.6), c='#C62828', lw=3)
            a.text(3.0, 0.2, 'Valley', ha='center', fontsize=11, fontweight='bold', color='white')
            a.text(3.0, 2.3, 'VALLEY BREEZE:\nwarm air rises\nup the slopes', ha='center', fontsize=11.5, fontweight='bold', color='#C62828')
        else:
            a.add_patch(Circle((3.0, 3.4), 0.28, color='#F5F5DC')); a.add_patch(Circle((3.12, 3.47), 0.25, color='#1E2A4A'))
            arrow(a, (0.6, 2.6), (2.2, 0.9), c='#64B5F6', lw=3); arrow(a, (5.4, 2.6), (3.8, 0.9), c='#64B5F6', lw=3)
            a.text(3.0, 0.2, 'Valley', ha='center', fontsize=11, fontweight='bold', color='white')
            a.text(3.0, 2.3, 'MOUNTAIN BREEZE:\ncold air sinks\ndown the slopes', ha='center', fontsize=11.5, fontweight='bold', color='#90CAF9')
    coast(axs[0, 0], True); coast(axs[0, 1], False); valley(axs[1, 0], True); valley(axs[1, 1], False)
    axs[0, 0].set_title('DAY: SEA BREEZE', fontsize=13, fontweight='bold', color=RED); axs[0, 1].set_title('NIGHT: LAND BREEZE', fontsize=13, fontweight='bold', color=RED)
    axs[1, 0].set_title('DAY: VALLEY (ANABATIC) BREEZE', fontsize=13, fontweight='bold', color=RED); axs[1, 1].set_title('NIGHT: MOUNTAIN (KATABATIC) BREEZE', fontsize=13, fontweight='bold', color=RED)
    fig.suptitle('LOCAL WINDS', fontsize=17, fontweight='bold', color=RED, y=0.99)
    fig.savefig(OUT + 'local_winds.png', bbox_inches='tight', pad_inches=0.06, facecolor='white'); plt.close(fig)


# ---------------- L38 temperature factors ----------------
def temp_altitude():
    towns = [('Douala', 13, 27.0), ('Garoua', 250, 28.3), ('Maroua', 384, 27.9), ('Ngaoundéré', 1212, 22.0)]
    fig, (a1, a2) = plt.subplots(1, 2, figsize=(12, 5.4), dpi=200, gridspec_kw={'wspace': 0.3})
    x = np.arange(len(towns))
    a1.bar(x, [t[1] for t in towns], color='#8D6E63', width=0.6, edgecolor='white', lw=2)
    for i, t in enumerate(towns): a1.text(i, t[1] + 25, f'{t[1]} m', ha='center', fontsize=11, fontweight='bold')
    a1.set_xticks(x); a1.set_xticklabels([t[0] for t in towns], fontsize=11, fontweight='bold'); a1.set_ylabel('Altitude (m)', fontsize=12, fontweight='bold'); a1.set_ylim(0, 1400)
    a1.set_title('ALTITUDE', fontsize=13, fontweight='bold', color=RED, loc='left')
    a2.bar(x, [t[2] for t in towns], color=['#E57373', '#C62828', '#D32F2F', '#64B5F6'], width=0.6, edgecolor='white', lw=2)
    for i, t in enumerate(towns): a2.text(i, t[2] + 0.4, f'{t[2]} °C', ha='center', fontsize=11, fontweight='bold')
    a2.set_xticks(x); a2.set_xticklabels([t[0] for t in towns], fontsize=11, fontweight='bold'); a2.set_ylabel('Mean annual temperature (°C)', fontsize=12, fontweight='bold'); a2.set_ylim(0, 32)
    a2.set_title('MEAN ANNUAL TEMPERATURE', fontsize=13, fontweight='bold', color=RED, loc='left')
    for a in (a1, a2): a.spines[['top', 'right']].set_visible(False); a.grid(axis='y', color='#E3E3E3'); a.set_axisbelow(True)
    fig.text(0.99, -0.02, 'Data: NOAA normals 1961–1990 (Garoua, Maroua, Ngaoundéré); WMO 1991–2020 (Douala). Garoua altitude approximate.', ha='right', fontsize=9, color='#555')
    fig.savefig(OUT + 'temp_altitude_cameroon.png', bbox_inches='tight', pad_inches=0.1, facecolor='white'); plt.close(fig)


def sun_rays_latitude():
    fig, ax = canvas(11, 7, 'white')
    cx, cy, R = 7.0, 3.4, 2.9
    ax.add_patch(Circle((cx, cy), R, fc='#EAF4FB', ec=NAVY, lw=2))
    ax.plot([cx - R, cx + R], [cy, cy], color=RED, lw=1.5); ax.text(cx + R + 0.1, cy, 'Equator', fontsize=10.5, va='center', color=RED, fontweight='bold')
    for yy in (cy - 1.1, cy - 0.35, cy + 0.35, cy + 1.1, cy + 2.35, cy + 2.6):
        pass
    # rays
    for yy in (cy - 0.45, cy + 0.45):
        arrow(ax, (0.6, yy), (cx - np.sqrt(R ** 2 - (yy - cy) ** 2), yy), c='#F2A900', lw=3, ms=16)
    for yy in (cy + 2.3, cy + 2.7):
        arrow(ax, (0.6, yy), (cx - np.sqrt(max(R ** 2 - (yy - cy) ** 2, 0)), yy), c='#F2A900', lw=3, ms=16)
    sun(ax, 0.6, 6.4, 0.35)
    ax.add_patch(Rectangle((cx - R - 0.08, cy - 0.45), 0.35, 0.9, fc='#FFCDD2', ec=RED, lw=1.5, zorder=5))
    lab(ax, 3.2, cy - 1.0, 'Near the Equator: rays are direct,\nheat is concentrated on a small area', 10.5, '#C62828')
    lab(ax, 3.8, 5.3, 'Near the poles: rays are slanting,\nthe same heat is spread over a large area', 10.5, NAVY)
    ax.text(5.5, 0.2, 'WHY LATITUDE AFFECTS TEMPERATURE', fontsize=15, fontweight='bold', color=RED, ha='center')
    save(fig, 'sun_rays_latitude.png')


# ---------------- L39 water cycle ----------------
def water_cycle():
    fig, ax = canvas(13, 7.4)
    ax.add_patch(Polygon([(0, 0), (0, 1.6), (3.5, 1.6), (6.0, 2.2), (8.5, 4.6), (10.2, 3.6), (13, 2.4), (13, 0)], color='#8BC34A', zorder=1))
    ax.add_patch(Polygon([(0, 0), (0, 1.6), (3.5, 1.6), (3.5, 0)], color='#3A7BD5', zorder=2))
    ax.add_patch(Rectangle((0, 0), 13, 0.5, color='#8D6E63', zorder=2))
    sun(ax, 1.0, 6.5, 0.45)
    cloud(ax, 5.2, 5.9, 1.0); cloud(ax, 9.3, 6.0, 1.2, c='#B0BEC5', ec='#78909C')
    for x in np.linspace(8.5, 10.1, 7): ax.plot([x, x - 0.15], [5.4, 4.4], color=BLUE, lw=2, zorder=4)
    for x in (1.3, 2.3): arrow(ax, (x, 1.8), (x + 1.5, 5.2), c='#E53935', lw=2.5)
    lab(ax, 1.4, 3.8, 'EVAPORATION', 11.5, '#C62828')
    # tree + transpiration
    ax.add_patch(Rectangle((6.2, 2.3), 0.2, 0.9, color='#6D4C41', zorder=3)); ax.add_patch(Circle((6.3, 3.5), 0.55, color='#2E7D32', zorder=3))
    arrow(ax, (6.3, 4.1), (6.0, 5.1), c='#43A047', lw=2.5); lab(ax, 7.5, 4.6, 'TRANSPIRATION', 11, '#2E7D32')
    arrow(ax, (6.2, 6.2), (8.0, 6.2), c='#777', lw=2.5); lab(ax, 7.1, 6.75, 'CONDENSATION\n(clouds form)', 11, NAVY)
    lab(ax, 11.3, 5.0, 'PRECIPITATION', 11.5, BLUE)
    # runoff river
    ax.plot([9.0, 7.5, 6.5, 5.0, 3.6], [4.2, 3.2, 2.6, 2.0, 1.6], color='#1F5FBF', lw=4, zorder=4)
    lab(ax, 4.9, 2.6, 'SURFACE RUNOFF', 11, BLUE)
    arrow(ax, (10.5, 3.2), (10.5, 1.0), c='#1565C0', lw=2, style='-|>'); lab(ax, 11.9, 1.7, 'INFILTRATION', 11, '#1565C0')
    arrow(ax, (10.0, 0.8), (4.0, 0.8), c='#0D47A1', lw=2); lab(ax, 7.0, 0.95, 'Groundwater flow', 10, 'white')
    lab(ax, 1.75, 0.9, 'SEA / LAKE / RIVER', 10.5, 'white')
    ax.text(6.5, 7.2, 'THE HYDROLOGICAL (WATER) CYCLE', fontsize=17, fontweight='bold', color=RED, ha='center')
    save(fig, 'water_cycle.png')


def basin_system():
    fig, ax = canvas(13, 6.6, 'white')
    def box(x, y, w, h, t, fc):
        ax.add_patch(FancyBboxPatch((x, y), w, h, boxstyle='round,pad=0.03,rounding_size=0.15', fc=fc, ec='none', zorder=2))
        ax.text(x + w / 2, y + h / 2, t, fontsize=11, fontweight='bold', color='white', ha='center', va='center', zorder=3)
    box(0.2, 4.4, 2.4, 1.0, 'INPUT\nPrecipitation', '#1565C0')
    box(3.4, 4.4, 2.6, 1.0, 'STORE\nInterception\n(vegetation)', '#2E7D32')
    box(3.4, 2.6, 2.6, 1.0, 'STORE\nSurface\n(puddles, lakes)', '#2E7D32')
    box(3.4, 0.8, 2.6, 1.0, 'STORE\nSoil and\ngroundwater', '#2E7D32')
    box(7.2, 2.6, 2.6, 1.0, 'TRANSFER\nRunoff and\nthroughflow', '#EF6C00')
    box(10.4, 4.4, 2.4, 1.0, 'OUTPUT\nEvaporation and\ntranspiration', '#C62828')
    box(10.4, 2.6, 2.4, 1.0, 'OUTPUT\nRiver flow\nto the sea', '#C62828')
    for a, b in [((2.6, 4.9), (3.4, 4.9)), ((4.7, 4.4), (4.7, 3.6)), ((4.7, 2.6), (4.7, 1.8)), ((6.0, 3.1), (7.2, 3.1)), ((6.0, 1.3), (8.5, 2.6)), ((9.8, 3.1), (10.4, 3.1)), ((6.0, 4.9), (10.4, 4.9))]:
        arrow(ax, a, b, c='#555', lw=2)
    ax.text(4.95, 4.0, 'infiltration', fontsize=9.5, style='italic'); ax.text(4.95, 2.2, 'percolation', fontsize=9.5, style='italic')
    ax.text(6.5, 6.25, 'THE DRAINAGE BASIN: AN OPEN SYSTEM (INPUTS → STORES AND TRANSFERS → OUTPUTS)', fontsize=13.5, fontweight='bold', color=RED, ha='center')
    save(fig, 'basin_open_system.png')


# ---------------- L40 greenhouse ----------------
def greenhouse():
    fig, ax = canvas(13, 7)
    ax.add_patch(Rectangle((0, 0), 13, 1.2, color='#8BC34A'))
    ax.add_patch(Rectangle((0, 3.9), 13, 0.9, color='#B39DDB', alpha=0.45)); lab(ax, 11.0, 4.35, 'Greenhouse gases (CO₂, CH₄, water vapour)', 11, '#4527A0')
    sun(ax, 1.0, 6.2, 0.5)
    arrow(ax, (1.6, 5.8), (4.2, 1.3), c='#F2A900', lw=3.5); lab(ax, 1.9, 3.1, '1. Sunlight passes\nthrough the air', 10.5, '#8A5A00')
    arrow(ax, (4.5, 1.3), (5.2, 6.3), c='#FF7043', lw=2.5, style='-|>'); lab(ax, 6.2, 6.3, '2. Some heat escapes\nto space', 10.5, '#D84315')
    arrow(ax, (6.5, 1.3), (7.6, 3.9), c='#E53935', lw=3); arrow(ax, (7.6, 3.9), (8.6, 1.4), c='#E53935', lw=3)
    lab(ax, 9.9, 2.6, '3. Gases trap heat and\nsend it back to Earth', 10.5, '#C62828')
    lab(ax, 6.5, 0.6, 'The ground heats up and gives off heat', 11, '#1A1A1A')
    # human sources
    ax.add_patch(Rectangle((11.2, 1.2), 0.5, 1.4, color='#616161'));
    for k in range(3): ax.add_patch(Circle((11.5 + 0.2 * k, 2.9 + 0.35 * k), 0.25 + 0.05 * k, color='#9E9E9E', alpha=0.8))
    lab(ax, 11.5, 0.45, 'Factories, cars, burning forests', 9.5, 'white')
    ax.text(6.5, 6.8, 'THE GREENHOUSE EFFECT', fontsize=17, fontweight='bold', color=RED, ha='center')
    save(fig, 'greenhouse_effect.png')


# ---------------- L42 rainwater harvesting ----------------
def rainwater():
    fig, ax = canvas(12, 6.8)
    ax.add_patch(Rectangle((0, 0), 12, 0.8, color='#C9A15A'))
    ax.add_patch(Rectangle((1.0, 0.8), 4.2, 2.4, fc='#FFE0B2', ec='#8D6E63', lw=2))
    ax.add_patch(Polygon([(0.6, 3.2), (3.1, 4.6), (5.6, 3.2)], fc='#90A4AE', ec='#546E7A', lw=2))
    ax.add_patch(Rectangle((2.6, 0.8), 0.9, 1.4, color='#8D6E63'))
    for x in np.linspace(0.8, 5.5, 12): ax.plot([x, x - 0.2], [6.0, 5.0], color=BLUE, lw=2)
    ax.plot([5.6, 6.3], [3.15, 3.15], color='#455A64', lw=5); ax.plot([6.3, 6.3], [3.15, 2.6], color='#455A64', lw=5)
    ax.add_patch(Rectangle((6.0, 0.8), 2.4, 1.8, fc='#4FC3F7', ec='#01579B', lw=2)); ax.add_patch(Rectangle((6.0, 0.8), 2.4, 1.1, color='#0288D1'))
    ax.plot([8.4, 8.9], [1.1, 1.1], color='#455A64', lw=4); ax.plot([8.9, 8.9], [1.1, 0.9], color='#455A64', lw=4)
    lab(ax, 3.1, 5.4, 'Rain falls on the roof', 11.5, BLUE); lab(ax, 7.0, 3.6, 'Gutter and pipe', 11.5, '#37474F')
    lab(ax, 7.2, 1.45, 'Storage tank', 11.5, 'white'); lab(ax, 10.3, 1.4, 'Tap: water for the\ndry season', 11.5)
    ax.text(6.0, 6.45, 'RAINWATER HARVESTING', fontsize=17, fontweight='bold', color=RED, ha='center')
    save(fig, 'rainwater_harvesting.png')


if __name__ == '__main__':
    import sys
    fns = [atmosphere, instruments_all, stevenson, sixs, clouds, condensation_forms, rainfall_types, rain_gauge, pressure_belts, local_winds, temp_altitude, sun_rays_latitude,
           water_cycle, basin_system, greenhouse, rainwater]
    names = sys.argv[1:]
    for f in fns:
        if not names or f.__name__ in names:
            f(); print('done', f.__name__)
