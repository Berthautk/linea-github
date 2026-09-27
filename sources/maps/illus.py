"""Big, classroom-readable illustrations (v2 standard): few labels, large fonts, no in-image titles.
Figures are 12.8 x 5.0 in so they fill the projected slide area; labels are 24-30 pt."""
import numpy as np, matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt, matplotlib.patheffects as pe
from matplotlib.patches import Polygon, Rectangle, Circle, Ellipse, FancyArrowPatch, Wedge
from PIL import Image
import io, sys

OUT = '/home/claude/f4/img/v2/'
import os; os.makedirs(OUT, exist_ok=True)
GIF_DPI = 150
RED = '#B0001A'; NAVY = '#12305A'; W_, H_ = 12.8, 5.0
LAB = 26


def canvas(bg='#DDEFFB'):
    fig, ax = plt.subplots(figsize=(W_, H_), dpi=150)
    fig.subplots_adjust(0, 0, 1, 1)
    ax.set_xlim(0, W_); ax.set_ylim(0, H_); ax.set_aspect('equal'); ax.axis('off')
    if bg: ax.add_patch(Rectangle((0, 0), W_, H_, color=bg, zorder=0))
    return fig, ax


def lab(ax, x, y, t, fs=LAB, c='#111', ha='center', va='center', box=True, z=20):
    kw = dict(fontsize=fs, color=c, ha=ha, va=va, fontweight='bold', zorder=z, fontfamily='DejaVu Sans')
    if box: kw['bbox'] = dict(boxstyle='round,pad=0.25', fc='white', ec=c, lw=2.5, alpha=0.95)
    ax.text(x, y, t, **kw)


def arrow(ax, a, b, c=RED, lw=5, ms=35, cs='arc3', z=15):
    ax.add_patch(FancyArrowPatch(a, b, arrowstyle='-|>', mutation_scale=ms, color=c, lw=lw, connectionstyle=cs, zorder=z))


def save(fig, name):
    fig.savefig(OUT + name, dpi=150, facecolor='white'); plt.close(fig)


def frame(fig):
    buf = io.BytesIO(); fig.savefig(buf, format='png', dpi=GIF_DPI, facecolor='white'); plt.close(fig); buf.seek(0)
    return Image.open(buf).convert('RGB')


def save_gif(frames, name, ms=120, hold=12):
    """Full frames (no delta/transparency) with one shared palette: PowerPoint shows them crisp and without ghosting."""
    w, h = frames[0].size; step = max(1, len(frames) // 8)
    sample = Image.new('RGB', (w, h * len(frames[::step])))
    for i, f in enumerate(frames[::step]): sample.paste(f.resize((w, h)), (0, i * h))
    pal = sample.quantize(colors=255, method=Image.Quantize.MEDIANCUT)
    P = [f.resize((w, h)).quantize(palette=pal, dither=Image.Dither.NONE) for f in frames]
    for k, p in enumerate(P):          # alternate two corner pixels so every frame is saved whole (no cropped delta frames)
        p.putpixel((0, 0), k % 2); p.putpixel((w - 1, h - 1), 1 - k % 2)
    dur = [ms] * (len(P) - 1) + [ms * (hold + 1)]
    P[0].save(OUT + name, save_all=True, append_images=P[1:], duration=dur, loop=0, optimize=False, disposal=1)


# ---------------- simple drawing helpers ----------------
def sun(ax, x, y, r=0.45):
    ax.add_patch(Circle((x, y), r, color='#FFC107', zorder=3))
    for a in np.linspace(0, 2 * np.pi, 12, endpoint=False):
        ax.plot([x + 1.3 * r * np.cos(a), x + 1.8 * r * np.cos(a)], [y + 1.3 * r * np.sin(a), y + 1.8 * r * np.sin(a)], color='#FF9800', lw=4, zorder=3)


def acacia(ax, x, y, s=1.0, c='#4E8B2E', dead=False):
    tc = '#6D4C41'
    ax.plot([x, x], [y, y + 1.1 * s], color=tc, lw=7 * s, zorder=4, solid_capstyle='round')
    ax.plot([x, x - 0.45 * s], [y + 0.8 * s, y + 1.25 * s], color=tc, lw=5 * s, zorder=4); ax.plot([x, x + 0.5 * s], [y + 0.85 * s, y + 1.3 * s], color=tc, lw=5 * s, zorder=4)
    if not dead: ax.add_patch(Ellipse((x, y + 1.4 * s), 2.0 * s, 0.55 * s, color=c, zorder=5))


def tuft(ax, x, y, c='#7CB342', s=1.0):
    for dx, h in [(-0.12, 0.35), (0, 0.45), (0.12, 0.33)]:
        ax.plot([x, x + dx * s * 1.4], [y, y + h * s], color=c, lw=3.5, zorder=4, solid_capstyle='round')


def maize(ax, x, y, s=1.0, dry=False):
    stem = '#B08A3E' if dry else '#2E7D32'; leaf = '#C9A55A' if dry else '#43A047'
    ax.plot([x, x], [y, y + 1.3 * s], color=stem, lw=5, zorder=6)
    for k, hgt in enumerate([0.35, 0.65, 0.95]):
        d = 1 if k % 2 == 0 else -1
        if dry: ax.plot([x, x + d * 0.35 * s, x + d * 0.45 * s], [y + hgt * s, y + (hgt - 0.05) * s, y + (hgt - 0.35) * s], color=leaf, lw=4, zorder=6)
        else: ax.plot([x, x + d * 0.4 * s, x + d * 0.55 * s], [y + hgt * s, y + (hgt + 0.18) * s, y + (hgt + 0.1) * s], color=leaf, lw=4, zorder=6)


def cow(ax, x, y, s=1.0, c='#8D6E63', face=1):
    ax.add_patch(Ellipse((x, y + 0.55 * s), 1.2 * s, 0.55 * s, color=c, zorder=7))
    for dx in (-0.4, -0.2, 0.2, 0.4): ax.plot([x + dx * s, x + dx * s], [y + 0.35 * s, y], color=c, lw=5 * s, zorder=7)
    hx = x + face * 0.72 * s
    ax.add_patch(Ellipse((hx, y + 0.72 * s), 0.38 * s, 0.3 * s, color=c, zorder=8))
    ax.plot([hx - 0.12 * s, hx - 0.25 * s], [y + 0.85 * s, y + 1.05 * s], color='#EEE', lw=3, zorder=8); ax.plot([hx + 0.12 * s, hx + 0.25 * s], [y + 0.85 * s, y + 1.05 * s], color='#EEE', lw=3, zorder=8)
    ax.plot([x - face * 0.6 * s, x - face * 0.75 * s], [y + 0.65 * s, y + 0.3 * s], color=c, lw=3, zorder=7)


def person(ax, x, y, s=1.0, c='#1565C0', skin='#5D4037'):
    ax.add_patch(Circle((x, y + 1.25 * s), 0.17 * s, color=skin, zorder=9))
    ax.add_patch(Polygon([(x - 0.22 * s, y + 0.5 * s), (x + 0.22 * s, y + 0.5 * s), (x + 0.18 * s, y + 1.05 * s), (x - 0.18 * s, y + 1.05 * s)], color=c, zorder=9))
    ax.plot([x - 0.1 * s, x - 0.12 * s], [y + 0.5 * s, y], color=skin, lw=5 * s, zorder=9); ax.plot([x + 0.1 * s, x + 0.12 * s], [y + 0.5 * s, y], color=skin, lw=5 * s, zorder=9)


def flame(ax, x, y, s=1.0):
    ax.add_patch(Polygon([(x - 0.35 * s, y), (x + 0.35 * s, y), (x + 0.2 * s, y + 0.5 * s), (x + 0.05 * s, y + 1.0 * s), (x - 0.1 * s, y + 0.6 * s), (x - 0.25 * s, y + 0.75 * s)], color='#FF5722', zorder=8))
    ax.add_patch(Polygon([(x - 0.18 * s, y), (x + 0.18 * s, y), (x + 0.08 * s, y + 0.45 * s), (x - 0.05 * s, y + 0.6 * s)], color='#FFC107', zorder=9))


# ================= FORM 4 L1 =================
def ship_gif():
    """What an observer on the shore sees: the ship goes down behind the curved horizon, hull first."""
    frames = []; HZ = 2.0; N = 36
    for i in range(N):
        fig, ax = canvas('#DDEFFB')
        ax.add_patch(Rectangle((0, 0), W_, HZ, color='#2F7ED8', zorder=5))
        for k in range(6): ax.plot([0.5 + k * 2.1, 1.3 + k * 2.1], [0.6 + 0.2 * (k % 2), 0.6 + 0.2 * (k % 2)], color='#90CAF9', lw=3, zorder=6)
        f = i / (N - 1)
        s = 1.9 - 0.9 * min(f * 1.6, 1.0)            # the ship gets a little smaller
        sink = 0 if f < 0.3 else (f - 0.3) / 0.7 * 2.9 * s   # then goes down behind the horizon
        x = 6.4; base = HZ + 0.05 - sink
        ax.add_patch(Polygon([(x - 1.3 * s, base + 0.45 * s), (x + 1.3 * s, base + 0.45 * s), (x + 1.0 * s, base), (x - 1.0 * s, base)], color='#4E342E', zorder=3))
        ax.add_patch(Rectangle((x - 0.07 * s, base + 0.45 * s), 0.14 * s, 2.0 * s, color='#222', zorder=3))
        ax.add_patch(Polygon([(x + 0.07 * s, base + 2.35 * s), (x + 0.07 * s, base + 0.7 * s), (x + 1.1 * s, base + 0.8 * s)], color='white', ec='#555', lw=1.5, zorder=3))
        ax.add_patch(Polygon([(x - 0.07 * s, base + 2.2 * s), (x - 0.07 * s, base + 0.8 * s), (x - 0.9 * s, base + 0.85 * s)], color='#F5F5F5', ec='#555', lw=1.5, zorder=3))
        if f < 0.55: lab(ax, 6.4, 0.95, 'A ship sails away from the coast', 26, NAVY, z=30)
        else: lab(ax, 6.4, 0.95, 'The bottom of the ship disappears first', 26, RED, z=30)
        frames.append(frame(fig))
    save_gif(frames, 'ship_sailing.gif', ms=140, hold=14)
    frames[len(frames) * 3 // 4].save(OUT + 'ship_sailing_mid.png')


def earth_shape_big():
    fig, ax = canvas('white')
    ax.add_patch(Ellipse((4.0, 2.5), 5.0, 4.55, fc='#BBDEFB', ec=NAVY, lw=4))
    ax.plot([1.5, 6.5], [2.5, 2.5], color=RED, lw=4); ax.plot([4.0, 4.0], [0.22, 4.78], color='#2E7D32', lw=4)
    lab(ax, 9.4, 4.25, 'Flattened at the poles', 28, '#2E7D32'); arrow(ax, (7.1, 4.25), (4.35, 4.72), c='#2E7D32')
    lab(ax, 9.4, 2.5, 'Wider at the Equator', 28, RED); arrow(ax, (7.3, 2.5), (6.55, 2.5), c=RED)
    lab(ax, 9.4, 0.75, 'Shape: oblate spheroid', 28, NAVY, box=True)
    save(fig, 'earth_shape_big.png')


def eclipse_big():
    fig, ax = canvas('#0F1B33')
    sun(ax, 1.2, 2.5, 0.9)
    ax.add_patch(Polygon([(6.2, 3.6), (6.2, 1.4), (11.6, 2.1), (11.6, 2.9)], color='#000000', alpha=0.55, zorder=2))
    ax.add_patch(Circle((6.2, 2.5), 1.1, color='#2F7ED8', zorder=3)); ax.text(6.2, 2.5, 'EARTH', color='white', fontsize=22, fontweight='bold', ha='center', va='center', zorder=4)
    moon = Circle((11.2, 2.5), 0.62, color='#E0E0E0', zorder=3); ax.add_patch(moon)
    sh = Circle((10.62, 2.5), 0.75, color='#3A3A3A', zorder=4); ax.add_patch(sh); sh.set_clip_path(moon)
    ax.text(11.2, 3.55, 'MOON', color='white', fontsize=22, fontweight='bold', ha='center', zorder=4)
    lab(ax, 8.6, 0.65, 'The shadow of the Earth is round', 26, RED)
    save(fig, 'eclipse_big.png')


# ================= FORM 2T: savanna problems =================
def savanna_base(ax, ground='#C9A45A', sky='#DDEFFB'):
    ax.add_patch(Rectangle((0, 1.6), W_, H_ - 1.6, color=sky, zorder=0))
    ax.add_patch(Rectangle((0, 0), W_, 1.6, color=ground, zorder=1))


def drought_big():
    fig, ax = canvas(None); savanna_base(ax, '#D7B26A')
    sun(ax, 11.3, 4.1, 0.55)
    rng = np.random.default_rng(3)
    for k in range(40):
        x = rng.uniform(0, W_); y = rng.uniform(0.05, 1.5)
        ax.plot([x, x + rng.uniform(-0.6, 0.6)], [y, y + rng.uniform(-0.2, 0.2)], color='#7A5A2A', lw=2.5, zorder=2)
    for x in np.arange(1.0, 8.5, 1.1): maize(ax, x, 1.2, 1.4, dry=True)
    acacia(ax, 9.8, 1.4, 1.5, dead=True)
    lab(ax, 4.5, 4.3, 'No rain: the crops dry up', 26, RED)
    save(fig, 'drought_big.png')


def bushfire_big():
    fig, ax = canvas(None); savanna_base(ax, '#B89A55', '#F3D9B1')
    ax.add_patch(Rectangle((0, 0), 5.2, 1.6, color='#3E3E3E', zorder=2))
    for x in np.arange(0.4, 5.0, 0.8): acacia(ax, x, 1.4, 0.9, dead=True) if x in (1.2, 3.6) else None
    for x in np.arange(5.4, 8.6, 0.55): flame(ax, x, 1.2, 1.3 + 0.3 * np.sin(x * 3))
    for x in np.arange(8.9, 12.6, 0.5): tuft(ax, x, 1.3, '#9CCC65', 1.4)
    acacia(ax, 10.8, 1.4, 1.4)
    for k in range(6): ax.add_patch(Circle((6.0 + k * 0.5, 3.3 + 0.25 * k), 0.45 + 0.1 * k, color='#757575', alpha=0.45, zorder=3))
    lab(ax, 2.6, 3.9, 'Burnt, bare soil', 26, '#333'); lab(ax, 10.6, 4.3, 'Grass not yet burnt', 24, '#2E7D32')
    save(fig, 'bushfire_big.png')


def overgrazing_big():
    fig, ax = canvas(None); savanna_base(ax, '#C8A165')
    for k, x in enumerate([1.2, 2.8, 4.4, 6.0, 7.6, 3.6, 5.2]):
        cow(ax, x, 0.35 if k < 5 else 0.95, 1.1, ['#8D6E63', '#5D4037', '#BCAAA4', '#6D4C41', '#A1887F', '#795548', '#D7CCC8'][k], face=1 if k % 2 == 0 else -1)
    for x in (9.4, 10.6, 11.8):
        ax.plot([x - 0.4, x + 0.1, x - 0.2, x + 0.3], [1.55, 0.9, 0.5, 0.05], color='#6D4C41', lw=4, zorder=3)
    tuft(ax, 0.4, 1.4, '#9E9D24', 1.0); tuft(ax, 8.6, 1.3, '#9E9D24', 1.0)
    lab(ax, 4.4, 4.2, 'Too many animals: no grass left', 26, RED); lab(ax, 10.6, 3.2, 'Bare soil\nis eroded', 24, '#5D4037')
    save(fig, 'overgrazing_big.png')


def conflict_big():
    fig, ax = canvas(None); savanna_base(ax, '#C9A45A')
    ax.add_patch(Rectangle((6.3, 0), 6.5, 1.6, color='#8BAA4A', zorder=1))
    for x in np.arange(6.8, 12.5, 0.8): maize(ax, x, 1.0, 1.3)
    for k, x in enumerate([5.6, 7.5, 9.0]): cow(ax, x, 0.25, 1.1, ['#8D6E63', '#5D4037', '#A1887F'][k], face=1)
    ax.plot([6.3, 6.3], [0, 1.6], color='#6D4C41', lw=4, ls=(0, (4, 3)), zorder=2)
    person(ax, 11.8, 0.3, 1.3, c='#2E7D32'); person(ax, 1.4, 0.3, 1.3, c='#F9A825')
    lab(ax, 2.5, 3.9, 'Herder', 26, '#8D6E00'); lab(ax, 10.2, 4.2, 'Farmer', 26, '#2E7D32')
    lab(ax, 6.4, 2.9, 'The cattle eat the maize', 24, RED)
    save(fig, 'conflict_big.png')


def treeplant_big():
    fig, ax = canvas(None); savanna_base(ax, '#C9A45A')
    for k, x in enumerate(np.arange(1.0, 12.4, 1.4)):
        s = 0.35 + 0.12 * k
        acacia(ax, x, 1.1, min(s, 1.4))
    person(ax, 3.2, 0.2, 1.2, c='#1565C0'); ax.plot([3.45, 3.9], [0.95, 0.35], color='#795548', lw=5, zorder=9)
    lab(ax, 6.4, 4.3, 'Planting trees stops the desert', 26, '#2E7D32')
    save(fig, 'treeplant_big.png')


def erosion_gif():
    """Rain on a bare slope (left) and a grassy slope (right): soil flows away only on the bare slope."""
    rng = np.random.default_rng(1)
    drops = rng.uniform([0, 2.2], [W_, 5.0], size=(70, 2))
    frames = []
    for i in range(30):
        fig, ax = canvas('#CFD8DC')
        # left bare slope
        ax.add_patch(Polygon([(0, 0), (6.2, 0), (6.2, 0.6), (0, 2.4)], color='#B5835A', zorder=2))
        # right grassy slope
        ax.add_patch(Polygon([(6.6, 0), (W_, 0), (W_, 2.4), (6.6, 0.6)], color='#8D6E63', zorder=2))
        for x in np.arange(6.8, 12.7, 0.35): tuft(ax, x, 0.6 + (x - 6.6) / 6.2 * 1.8, '#43A047', 0.9)
        # rain
        for (x, y) in drops:
            yy = (y - i * 0.18) % 3.2 + 1.8
            ax.plot([x, x - 0.05], [yy, yy - 0.25], color='#1E88E5', lw=2, zorder=5)
        # muddy flow on bare slope grows with time
        n = min(i, 20)
        for k in range(n):
            px = 0.3 + k * 0.28; py = 2.4 - px * (1.8 / 6.2) - 0.05
            ax.add_patch(Circle((px, py), 0.09, color='#6D4C41', zorder=6))
        ax.add_patch(Ellipse((6.1, 0.35), 0.4 + 0.06 * n, 0.25 + 0.02 * n, color='#795548', zorder=6))
        lab(ax, 3.0, 4.55, 'Bare soil: washed away', 24, RED); lab(ax, 9.8, 4.55, 'Grass: soil protected', 24, '#2E7D32')
        frames.append(frame(fig))
    save_gif(frames, 'erosion_rain.gif', ms=140, hold=10)
    frames[-1].save(OUT + 'erosion_rain_last.png')


ALL = [ship_gif, earth_shape_big, eclipse_big, drought_big, bushfire_big, overgrazing_big, conflict_big, treeplant_big, erosion_gif]
if __name__ == '__main__':
    for f in ALL:
        if len(sys.argv) == 1 or f.__name__ in sys.argv:
            try: f(); print('done', f.__name__)
            except Exception as e: import traceback; traceback.print_exc(); print('ERR', f.__name__, e)
