"""Richer flat-vector scene helpers for v2 illustrations (gradients, layered trees, flames, zebu cattle)."""
import numpy as np, matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import Polygon, Rectangle, Circle, Ellipse, FancyArrowPatch, PathPatch
from matplotlib.path import Path
from matplotlib.colors import LinearSegmentedColormap, to_rgb
from PIL import Image
import io, os

OUT = '/home/claude/f4/img/v2/'; os.makedirs(OUT, exist_ok=True)
RED = '#B0001A'; NAVY = '#12305A'; W_, H_ = 12.8, 5.0
RNG = np.random.default_rng(7)


def canvas(bg=None, w=W_, h=H_):
    fig, ax = plt.subplots(figsize=(w, h), dpi=150)
    fig.subplots_adjust(0, 0, 1, 1)
    ax.set_xlim(0, w); ax.set_ylim(0, h); ax.set_aspect('equal'); ax.axis('off')
    if bg: ax.add_patch(Rectangle((0, 0), w, h, color=bg, zorder=0))
    return fig, ax


def grad(ax, x0, x1, y0, y1, c_bottom, c_top, z=0):
    cm = LinearSegmentedColormap.from_list('g', [to_rgb(c_bottom), to_rgb(c_top)])
    ax.imshow(np.linspace(0, 1, 256).reshape(-1, 1), extent=(x0, x1, y0, y1), origin='lower', cmap=cm, aspect='auto', zorder=z)


def lab(ax, x, y, t, fs=26, c='#111', ha='center', va='center', box=True, z=40):
    kw = dict(fontsize=fs, color=c, ha=ha, va=va, fontweight='bold', zorder=z)
    if box: kw['bbox'] = dict(boxstyle='round,pad=0.25', fc='white', ec=c, lw=2.5, alpha=0.95)
    ax.text(x, y, t, **kw)


def arrow(ax, a, b, c=RED, lw=5, ms=35, cs='arc3', z=30):
    ax.add_patch(FancyArrowPatch(a, b, arrowstyle='-|>', mutation_scale=ms, color=c, lw=lw, connectionstyle=cs, zorder=z))


def save(fig, name):
    fig.savefig(OUT + name, dpi=150, facecolor='white'); plt.close(fig)


def frame(fig, dpi=80):
    buf = io.BytesIO(); fig.savefig(buf, format='png', dpi=dpi, facecolor='white'); plt.close(fig); buf.seek(0)
    return Image.open(buf).convert('RGB')


def save_gif(frames, name, ms=120, hold=10):
    frames = frames + [frames[-1]] * hold
    pal = [f.convert('P', palette=Image.ADAPTIVE, colors=160) for f in frames]
    pal[0].save(OUT + name, save_all=True, append_images=pal[1:], duration=ms, loop=0, optimize=True)


# ---------------- landscape ----------------
def sky(ax, y0=1.6, top='#8EC5F0', bottom='#E8F4FC'):
    grad(ax, 0, W_, y0, H_, bottom, top, z=0)


def ground(ax, y1=1.6, top='#D9B56E', bottom='#B8904A'):
    grad(ax, 0, W_, 0, y1, bottom, top, z=1)


def hills(ax, y=1.6, c='#9DB88A', amp=0.5, seed=1):
    r = np.random.default_rng(seed); x = np.linspace(0, W_, 200)
    yy = y + amp * (0.6 + 0.4 * np.sin(x * 0.7 + r.uniform(0, 6))) * (0.7 + 0.3 * np.sin(x * 1.9 + r.uniform(0, 6)))
    ax.fill_between(x, y, yy, color=c, zorder=1.5)


def sun(ax, x, y, r=0.45, c='#FFC107'):
    ax.add_patch(Circle((x, y), r * 1.9, color='#FFE082', alpha=0.35, zorder=2))
    ax.add_patch(Circle((x, y), r, color=c, zorder=2.1))


def cloud(ax, x, y, s=1.0, c='white', a=0.95, z=2):
    for dx, dy, r in [(0, 0, 0.45), (0.45, 0.12, 0.55), (0.95, 0, 0.42), (0.5, -0.12, 0.45)]:
        ax.add_patch(Circle((x + dx * s, y + dy * s), r * s, color=c, alpha=a, zorder=z))


def acacia(ax, x, y, s=1.0, leaves=True, dry=False, z=6):
    tc = '#5D4037'
    ax.add_patch(Ellipse((x, y), 1.8 * s, 0.18 * s, color='#000', alpha=0.15, zorder=z - 0.5))
    ax.add_patch(Polygon([(x - 0.07 * s, y), (x + 0.07 * s, y), (x + 0.05 * s, y + 0.9 * s), (x - 0.05 * s, y + 0.9 * s)], color=tc, zorder=z))
    for dx, dy in [(-0.55, 0.45), (0.6, 0.5), (-0.2, 0.55), (0.25, 0.6)]:
        ax.plot([x, x + dx * s], [y + 0.75 * s, y + (0.75 + dy) * s], color=tc, lw=4 * s, zorder=z, solid_capstyle='round')
    if leaves:
        greens = ['#4F7F2A', '#5E9432', '#6FA83B'] if not dry else ['#9C8A3C', '#B09A48', '#C2AB5A']
        for k, (dx, dy, w, h) in enumerate([(-0.55, 1.2, 1.1, 0.34), (0.55, 1.25, 1.1, 0.34), (0, 1.38, 1.4, 0.38), (-0.2, 1.52, 0.9, 0.26), (0.35, 1.5, 0.9, 0.26)]):
            ax.add_patch(Ellipse((x + dx * s, y + dy * s), w * s, h * s, color=greens[k % 3], zorder=z + 0.1 + k * 0.01))


def grass_field(ax, x0, x1, y, h=0.45, n=260, colors=('#9CB84A', '#B5C95A', '#C9B45A'), z=4, seed=3):
    r = np.random.default_rng(seed)
    xs = r.uniform(x0, x1, n)
    for x in xs:
        hh = h * r.uniform(0.6, 1.3); lean = r.uniform(-0.12, 0.12)
        ax.plot([x, x + lean], [y + r.uniform(-0.05, 0.05), y + hh], color=colors[r.integers(len(colors))], lw=2.2, zorder=z, solid_capstyle='round')


def flame_tongue(ax, x, y, w, h, c, z, phase=0.0):
    t = np.linspace(0, 1, 30)
    left = np.column_stack([x - w / 2 + w * 0.5 * t + 0.08 * w * np.sin(9 * t + phase), y + h * t ** 1.2])
    right = np.column_stack([x + w / 2 - w * 0.5 * t + 0.08 * w * np.sin(7 * t + phase + 1), y + h * t ** 1.2])[::-1]
    ax.add_patch(Polygon(np.vstack([left, right]), color=c, zorder=z, lw=0))


def fire_front(ax, x0, x1, y, h=1.3, phase=0.0, z=10):
    ax.add_patch(Ellipse(((x0 + x1) / 2, y + 0.4), (x1 - x0) * 1.3, h * 1.6, color='#FF9800', alpha=0.25, zorder=z - 1))
    r = np.random.default_rng(11)
    xs = np.linspace(x0, x1, int((x1 - x0) / 0.28))
    for i, x in enumerate(xs):
        hh = h * (0.6 + 0.5 * abs(np.sin(i * 1.7 + phase)))
        flame_tongue(ax, x, y, 0.55, hh, '#D84315', z, phase + i)
        flame_tongue(ax, x, y, 0.38, hh * 0.72, '#FF7043', z + 0.1, phase + i + 2)
        flame_tongue(ax, x, y, 0.22, hh * 0.45, '#FFD54F', z + 0.2, phase + i + 4)


def smoke(ax, x, y, n=9, drift=0.35, phase=0.0, z=9):
    for k in range(n):
        rr = 0.35 + 0.13 * k
        ax.add_patch(Circle((x + drift * k + 0.1 * np.sin(k + phase), y + 0.42 * k), rr, color=('#6D6D6D' if k < 4 else '#9E9E9E'), alpha=0.55 - 0.035 * k, zorder=z))


def zebu(ax, x, y, s=1.0, c='#E8E0D0', face=1, z=8):
    """Zebu cow (humped), typical of the North of Cameroon."""
    f = face
    ax.add_patch(Ellipse((x, y + 0.62 * s), 1.35 * s, 0.6 * s, color=c, zorder=z))
    ax.add_patch(Ellipse((x + f * 0.32 * s, y + 0.93 * s), 0.34 * s, 0.26 * s, color=c, zorder=z))  # hump
    for dx in (-0.45, -0.28, 0.28, 0.45):
        ax.add_patch(Polygon([(x + dx * s - 0.05 * s, y + 0.45 * s), (x + dx * s + 0.05 * s, y + 0.45 * s), (x + dx * s + 0.04 * s, y), (x + dx * s - 0.04 * s, y)], color=c, zorder=z - 0.1))
        ax.add_patch(Rectangle((x + dx * s - 0.045 * s, y - 0.03 * s), 0.09 * s, 0.07 * s, color='#333', zorder=z))
    hx = x + f * 0.8 * s; hy = y + 0.78 * s
    ax.add_patch(Polygon([(x + f * 0.55 * s, y + 0.85 * s), (hx, hy + 0.12 * s), (hx + f * 0.18 * s, hy - 0.2 * s), (x + f * 0.6 * s, y + 0.55 * s)], color=c, zorder=z))
    ax.add_patch(Ellipse((hx + f * 0.12 * s, hy - 0.12 * s), 0.3 * s, 0.22 * s, color=c, zorder=z + 0.1))
    ax.plot([hx, hx - f * 0.1 * s, hx - f * 0.02 * s], [hy + 0.08 * s, hy + 0.35 * s, hy + 0.5 * s], color='#F5F0E6', lw=3 * s, zorder=z + 0.2)
    ax.plot([hx + f * 0.1 * s, hx + f * 0.25 * s, hx + f * 0.2 * s], [hy + 0.08 * s, hy + 0.33 * s, hy + 0.48 * s], color='#F5F0E6', lw=3 * s, zorder=z + 0.2)
    ax.plot([x - f * 0.66 * s, x - f * 0.78 * s], [y + 0.7 * s, y + 0.25 * s], color=c, lw=2.5 * s, zorder=z)


def person(ax, x, y, s=1.0, c='#1565C0', skin='#5D4037', hat=None, z=12):
    ax.add_patch(Circle((x, y + 1.28 * s), 0.16 * s, color=skin, zorder=z))
    ax.add_patch(Polygon([(x - 0.24 * s, y + 0.45 * s), (x + 0.24 * s, y + 0.45 * s), (x + 0.19 * s, y + 1.1 * s), (x - 0.19 * s, y + 1.1 * s)], color=c, zorder=z))
    ax.plot([x - 0.1 * s, x - 0.13 * s], [y + 0.47 * s, y], color='#3E2723', lw=5 * s, zorder=z); ax.plot([x + 0.1 * s, x + 0.13 * s], [y + 0.47 * s, y], color='#3E2723', lw=5 * s, zorder=z)
    if hat: ax.add_patch(Polygon([(x - 0.32 * s, y + 1.36 * s), (x + 0.32 * s, y + 1.36 * s), (x, y + 1.62 * s)], color=hat, zorder=z + 0.1))


def maize(ax, x, y, s=1.0, dry=False, z=7):
    stem = '#B8963F' if dry else '#2E7D32'; leaf = '#CDAE62' if dry else '#43A047'
    ax.plot([x, x], [y, y + 1.35 * s], color=stem, lw=4.5 * s, zorder=z)
    for k, hgt in enumerate([0.3, 0.55, 0.8, 1.05]):
        d = 1 if k % 2 == 0 else -1
        if dry: ax.plot([x, x + d * 0.3 * s, x + d * 0.38 * s], [y + hgt * s, y + (hgt - 0.02) * s, y + (hgt - 0.38) * s], color=leaf, lw=3.5 * s, zorder=z)
        else: ax.plot([x, x + d * 0.35 * s, x + d * 0.55 * s], [y + hgt * s, y + (hgt + 0.2) * s, y + (hgt + 0.12) * s], color=leaf, lw=3.5 * s, zorder=z)
    if not dry: ax.add_patch(Ellipse((x + 0.07 * s, y + 0.7 * s), 0.1 * s, 0.25 * s, color='#F9A825', zorder=z + 0.1))


def cracks(ax, x0, x1, y0, y1, n=45, c='#7A5A2A', seed=5):
    r = np.random.default_rng(seed)
    for _ in range(n):
        x = r.uniform(x0, x1); y = r.uniform(y0, y1); pts = [(x, y)]
        for k in range(3): x += r.uniform(-0.35, 0.35); y += r.uniform(-0.12, 0.12); pts.append((x, y))
        ax.plot(*zip(*pts), color=c, lw=2, zorder=3)
