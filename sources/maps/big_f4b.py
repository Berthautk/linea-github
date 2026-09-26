"""Big-label diagrams and GIFs for Form 4, Lessons 14–29 and FS2 (v2)."""
from big_common import *
SKY = '#DDEFFB'; SEA = '#2F7ED8'; SAND = '#E8C57A'; ROCK = '#8D6E63'


def boxes(ax, items, y=2.5, h=3.2, fs=24):
    n = len(items); w = (W_ - 0.4 - 0.35 * (n - 1)) / n
    for i, (t, c, d) in enumerate(items):
        x = 0.2 + i * (w + 0.35)
        ax.add_patch(FancyBboxPatch((x, y - h / 2), w, h, boxstyle='round,pad=0.05', fc=c, ec='#333', lw=2))
        ax.text(x + w / 2, y + h / 2 - 0.45, t, fontsize=fs + 2, fontweight='bold', ha='center', color='white')
        ax.text(x + w / 2, y - 0.3, d, fontsize=fs - 2, fontweight='bold', ha='center', va='center', color='#111')
        if i: arrow(ax, (x - 0.33, y), (x - 0.02, y), c='#333', lw=4, ms=28)
    return w


# ---------- L14: denudation ----------
def denudation_gif():
    items = [('WEATHERING', '#8D6E63', 'Rock breaks\nin its place'), ('EROSION', '#E65100', 'Water picks\nup the pieces'), ('TRANSPORT', '#1E88E5', 'The river\ncarries them'), ('DEPOSITION', '#43A047', 'They are\ndropped')]
    frames = []
    for k in range(4 * 8):
        fig, ax = canvas('white'); boxes(ax, items[:k // 8 + 1]); frames.append(frame(fig))
    save_gif(frames, 'denudation.gif', ms=180, hold=14)
    frames[-1].save(OUT + 'denudation_last.png')


# ---------- L15: types of weathering ----------
def weathering_types_big():
    fig, ax = canvas('white')
    for x, t, c, lines in [(0.2, 'PHYSICAL', '#8D6E63', ['Rock breaks into pieces', 'Minerals do not change', 'Hot, dry areas', 'Example: heat and cold']),
                           (6.55, 'CHEMICAL', '#1565C0', ['Rock rots or dissolves', 'Minerals change', 'Hot, wet areas', 'Example: rain and air'])]:
        ax.add_patch(FancyBboxPatch((x, 0.3), 6.05, 4.4, boxstyle='round,pad=0.05', fc='#F5F5F5', ec=c, lw=4))
        ax.text(x + 3.0, 4.1, t, fontsize=32, fontweight='bold', ha='center', color=c)
        for j, it in enumerate(lines): ax.text(x + 0.35, 3.2 - j * 0.85, '• ' + it, fontsize=25, fontweight='bold', va='center')
    save(fig, 'weathering_types_big.png')


# ---------- L16: exfoliation ----------
def exfoliation_gif():
    frames = []; N = 36
    for i in range(N):
        day = (i // 6) % 2 == 0; peel = min(i / (N - 8), 1.0)
        fig, ax = canvas('#BFE3FA' if day else '#0E1A3A'); ax.add_patch(Rectangle((0, 0), W_, 0.8, color='#C9A04A'))
        if day: sun(ax, 11.3, 4.1)
        else:
            ax.add_patch(Circle((11.3, 4.1), 0.4, color='#F5F5DC'))
        ax.add_patch(Wedge((5.2, 0.8), 3.0, 0, 180, color='#9E8B7E', zorder=2))
        ax.add_patch(Wedge((5.2, 0.8), 3.35, 0, 180, width=0.35, color='#B5A397', zorder=2))
        if peel > 0.3:
            off = (peel - 0.3) * 1.2
            ax.add_patch(Wedge((5.2 + off, 0.8 + off * 0.3), 3.35, 20 + 40 * peel, 60 + 40 * peel, width=0.35, color='#B5A397', zorder=3))
        lab(ax, 9.9, 2.4, 'Day: the rock gets hot, it grows' if day else 'Night: the rock cools, it shrinks', fs=22, c=ORANGE if day else BLUE)
        if peel > 0.6: lab(ax, 5.2, 4.55, 'The outer layer peels off', fs=26, c=RED)
        frames.append(frame(fig))
    save_gif(frames, 'exfoliation.gif', ms=170, hold=12)
    frames[-1].save(OUT + 'exfoliation_last.png')


# ---------- FS2: soil profile ----------
def soil_profile_big():
    fig, ax = canvas('white')
    layers = [('Topsoil: dark, with humus', '#4E342E', 3.9, 4.8), ('Subsoil: lighter', '#A1887F', 2.7, 3.9), ('Weathered rock', '#BCAAA4', 1.4, 2.7), ('Hard rock (bedrock)', '#78909C', 0.2, 1.4)]
    for t, c, y0, y1 in layers:
        ax.add_patch(Rectangle((1.0, y0), 3.2, y1 - y0, color=c)); ax.text(4.6, (y0 + y1) / 2, t, fontsize=27, fontweight='bold', va='center')
    for x in (1.5, 2.6, 3.6):
        ax.plot([x, x], [4.8, 5.2], color=GREEN, lw=4); ax.add_patch(Ellipse((x, 5.25), 0.5, 0.2, color=GREEN))
    for k in range(6): ax.add_patch(Rectangle((1.2 + k * 0.5, 1.6 + 0.3 * (k % 3)), 0.35, 0.25, color='#90A4AE'))
    arrow(ax, (11.8, 0.8), (11.8, 4.6), c=RED, lw=5); ax.text(11.5, 2.7, 'Weathering\nmakes soil', fontsize=24, fontweight='bold', color=RED, ha='right', va='center')
    save(fig, 'soil_profile_big.png')


# ---------- L18: rivers ----------
def long_profile_big():
    fig, ax = canvas('white')
    x = np.linspace(0.6, 12.2, 200); y = 0.6 + 3.8 * np.exp(-(x - 0.6) / 2.6)
    ax.fill_between(x, 0, y, color='#C5A880'); ax.plot(x, y, color='#1565C0', lw=6)
    for xx, t, c in [(2.2, 'UPPER COURSE\nsteep, fast', RED), (6.4, 'MIDDLE COURSE\ngentle', ORANGE), (10.4, 'LOWER COURSE\nflat, slow', GREEN)]:
        ax.text(xx, 4.1, t, fontsize=24, fontweight='bold', ha='center', color=c)
    lab(ax, 1.3, 0.35, 'Source', fs=24, c=NAVY); lab(ax, 11.5, 0.35, 'Mouth (sea)', fs=24, c=NAVY)
    for xx in (4.3, 8.4): ax.plot([xx, xx], [0.2, 4.8], color='#999', lw=2, ls='--')
    save(fig, 'long_profile_big.png')


def river_erosion_big():
    fig, ax = canvas('white')
    items = [('HYDRAULIC\nACTION', 'The force of the\nwater breaks rock'), ('ABRASION', 'Stones scrape\nthe bed and banks'), ('ATTRITION', 'Stones hit each\nother, get smaller'), ('SOLUTION', 'Water dissolves\nsome rocks')]
    for i, (t, d) in enumerate(items):
        x = 0.2 + i * 3.15
        ax.add_patch(FancyBboxPatch((x, 0.3), 2.9, 4.4, boxstyle='round,pad=0.05', fc='#E3F2FD', ec='#1565C0', lw=3))
        ax.text(x + 1.45, 3.7, t, fontsize=23, fontweight='bold', ha='center', va='center', color='#0D47A1')
        ax.text(x + 1.45, 1.6, d, fontsize=21, fontweight='bold', ha='center', va='center', color='#222')
    save(fig, 'river_erosion_big.png')


def waterfall_gif():
    frames = []; N = 36
    for i in range(N):
        f = i / (N - 1); r = 3.6 * f  # retreat
        fig, ax = canvas(SKY)
        ax.add_patch(Rectangle((0, 2.4), 8.0 - r, 1.0, color='#5D4037'))     # hard rock cap
        ax.add_patch(Rectangle((0, 0), 8.0 - r - 0.3 * min(f * 3, 1), 2.4, color='#BCAAA4'))  # soft rock (undercut)
        ax.add_patch(Rectangle((8.0 - r, 0), W_, 0.9, color='#BCAAA4'))
        ax.add_patch(Rectangle((0, 3.4), 8.0 - r, 0.25, color='#1E88E5'))
        xs = np.linspace(8.0 - r, 8.3 - r + 0.2, 20); ax.fill_betweenx(np.linspace(0.9, 3.65, 20), 8.0 - r, 8.35 - r, color='#64B5F6', alpha=0.9)
        ax.add_patch(Rectangle((8.0 - r, 0.9), 4.8 + r, 0.25, color='#1E88E5'))
        ax.add_patch(Ellipse((8.2 - r, 0.95), 1.2, 0.5, color='#1565C0'))
        lab(ax, 3.2, 4.4, 'Hard rock', fs=26, c='#5D4037'); lab(ax, 3.0, 1.2, 'Soft rock (worn away faster)', fs=24, c='#6D4C41')
        if f > 0.2: lab(ax, 10.2, 4.4, 'The waterfall moves back', fs=22, c=RED)
        if f > 0.5: lab(ax, 10.6, 2.2, 'A gorge forms', fs=24, c=NAVY)
        frames.append(frame(fig))
    save_gif(frames, 'waterfall.gif', ms=160, hold=12)
    frames[-1].save(OUT + 'waterfall_last.png')


def meander_gif():
    frames = []; N = 34
    for i in range(N):
        f = i / (N - 1); A = 0.6 + 1.2 * f
        fig, ax = canvas('#A5C860'); x = np.linspace(-0.5, 13.3, 300); y = 2.5 + A * np.sin((x - 0.5) / 12 * 2 * np.pi * 1.5)
        ax.plot(x, y, color='#1E88E5', lw=22, solid_capstyle='round')
        # outside of bend erosion (red), inside deposition (yellow)
        for xb in (2.5, 10.5):
            yb = 2.5 + A
            ax.add_patch(Ellipse((xb, yb + 0.33), 1.8, 0.3, color='#E53935', zorder=3)); ax.add_patch(Ellipse((xb, yb - 0.55), 1.2, 0.35, color='#FDD835', zorder=3))
        lab(ax, 6.4, 4.7, 'Outside: fast water ERODES (river cliff)', fs=22, c=RED)
        lab(ax, 7.9, 0.45, 'Inside: slow water DEPOSITS (slip-off slope)', fs=22, c='#8D6E00')
        frames.append(frame(fig))
    save_gif(frames, 'meander.gif', ms=150, hold=12)
    frames[-1].save(OUT + 'meander_last.png')


def oxbow_gif():
    frames = []; N = 40
    t = np.linspace(0, 2 * np.pi, 200)
    for i in range(N):
        f = i / (N - 1); fig, ax = canvas('#A5C860')
        neck = max(0.0, 1.0 - 1.6 * f)  # neck width closes
        cx, cy, r = 6.4, 2.9, 1.5
        ax.plot(cx + r * np.cos(t), cy + r * np.sin(t), color='#1E88E5', lw=20)
        if f < 0.62:
            ax.plot([0, cx - r * 0.35 - neck * 0.5], [1.4, 1.4], color='#1E88E5', lw=20); ax.plot([cx + r * 0.35 + neck * 0.5, W_], [1.4, 1.4], color='#1E88E5', lw=20)
            ax.add_patch(Rectangle((cx - r * 0.35 - neck * 0.5, 1.2), r * 0.7 + neck, 0.4, color='#A5C860', zorder=3))
            lab(ax, 6.4, 0.45, '1. The neck of the meander gets narrow', fs=24, c=NAVY)
        else:
            ax.plot([0, W_], [1.4, 1.4], color='#1E88E5', lw=20)
            ax.add_patch(Rectangle((cx - 0.8, 1.55), 1.6, 0.35, color='#E6D08A', zorder=4))
            lab(ax, 6.4, 0.45, '2. A flood cuts through: the river takes the short way', fs=22, c=NAVY)
            if f > 0.8: lab(ax, 10.3, 4.6, '3. OX-BOW LAKE', fs=28, c=RED)
        frames.append(frame(fig))
    save_gif(frames, 'oxbow.gif', ms=160, hold=14)
    frames[-1].save(OUT + 'oxbow_last.png')


# ---------- L23: waves ----------
def swash_gif():
    frames = []; N = 32
    for i in range(N):
        ph = (i % 16) / 15; up = ph < 0.5; f = ph / 0.5 if up else (1 - ph) / 0.5
        fig, ax = canvas(SKY)
        ax.add_patch(Polygon([(0, 0), (W_, 0), (W_, 3.2), (0, 0.9)], color=SAND))
        edge = 3.0 + 5.5 * f; yy = 0.9 + (3.2 - 0.9) * edge / W_
        ax.add_patch(Polygon([(0, 0), (edge, 0), (edge, yy), (0, 0.9 + 0.6)], color=SEA, alpha=0.9))
        if up: arrow(ax, (edge - 2.5, yy - 0.2), (edge - 0.2, yy + 0.2), c='white', lw=6); lab(ax, 6.4, 4.4, 'SWASH: water rushes UP the beach', fs=26, c=NAVY)
        else: arrow(ax, (edge - 0.2, yy - 0.3), (edge - 2.5, yy - 0.8), c='#FFEB3B', lw=6); lab(ax, 6.4, 4.4, 'BACKWASH: water flows BACK to the sea', fs=26, c=RED)
        frames.append(frame(fig))
    save_gif(frames, 'swash.gif', ms=140, hold=0)
    frames[4].save(OUT + 'swash_up.png')


def waves_types_big():
    fig, ax = canvas(SKY)
    for x0, t, c, amp, n in [(0.2, 'CONSTRUCTIVE: low waves\nbuild the beach', GREEN, 0.25, 3), (6.6, 'DESTRUCTIVE: high waves\ndestroy the beach', RED, 0.8, 6)]:
        xs = np.linspace(x0, x0 + 6.0, 300); ys = 1.6 + amp * np.abs(np.sin((xs - x0) / 6.0 * n * np.pi))
        ax.fill_between(xs, 0, ys, color=SEA); ax.text(x0 + 3.0, 4.2, t, fontsize=24, fontweight='bold', ha='center', color=c)
    save(fig, 'waves_types_big.png')


# ---------- L24: headland ----------
def headland_gif():
    stages = ['1. Waves open a crack: CAVE', '2. The cave goes through: ARCH', '3. The roof falls: STACK', '4. The stack is worn down: STUMP']
    frames = []
    for s in range(4):
        for k in range(9):
            fig, ax = canvas(SKY); ax.add_patch(Rectangle((0, 0), W_, 1.4, color=SEA))
            ax.add_patch(Rectangle((0.3, 1.4), 4.2, 2.8, color=ROCK))
            if s == 0:
                ax.add_patch(Rectangle((5.0, 1.4), 4.5, 2.8, color=ROCK)); ax.add_patch(Ellipse((7.3, 1.6), 1.2, 1.0, color='#3E2723'))
            elif s == 1:
                ax.add_patch(Rectangle((5.0, 1.4), 4.5, 2.8, color=ROCK)); ax.add_patch(Rectangle((6.5, 1.4), 1.6, 1.4, color=SKY)); ax.add_patch(Ellipse((7.3, 2.8), 1.6, 0.9, color=SKY))
            elif s == 2:
                ax.add_patch(Rectangle((5.0, 1.4), 1.5, 2.8, color=ROCK)); ax.add_patch(Rectangle((8.1, 1.4), 1.4, 2.8, color=ROCK))
            else:
                ax.add_patch(Rectangle((5.0, 1.4), 1.5, 2.8, color=ROCK)); ax.add_patch(Rectangle((8.1, 1.4), 1.4, 0.5, color=ROCK))
            for w in range(3): ax.plot([10.4 + 0.5 * w + 0.1 * k, 10.1 + 0.5 * w + 0.1 * k], [0.4 + 0.3 * w, 1.1 + 0.3 * w], color='white', lw=4)
            lab(ax, 6.4, 4.65, stages[s], fs=26, c=RED)
            frames.append(frame(fig))
    save_gif(frames, 'headland.gif', ms=180, hold=10)
    frames[-1].save(OUT + 'headland_last.png')


# ---------- L25: longshore drift ----------
def longshore_gif():
    frames = []; N = 40
    pts = [(1.0, 1.2)]
    for k in range(8):
        x, y = pts[-1]; pts.append((x + 0.7, 2.6)); pts.append((x + 1.4, 1.2))
    for i in range(N):
        fig, ax = canvas(SKY); ax.add_patch(Rectangle((0, 0), W_, 1.9, color=SEA)); ax.add_patch(Rectangle((0, 1.9), W_, 1.6, color=SAND))
        for w in range(5): arrow(ax, (0.8 + 2.4 * w, 0.2), (1.8 + 2.4 * w, 1.6), c='white', lw=4, ms=24)
        n = min(len(pts) - 1, i // 2 + 1); xs, ys = zip(*pts[:n + 1]); ax.plot(xs, ys, color=RED, lw=4)
        ax.add_patch(Circle(pts[n], 0.18, color='#5D4037', zorder=6))
        lab(ax, 6.4, 4.6, 'Swash goes up at an angle, backwash comes straight down', fs=20, c=NAVY)
        lab(ax, 10.6, 3.9, 'Sand moves along the beach', fs=22, c=RED)
        frames.append(frame(fig))
    save_gif(frames, 'longshore.gif', ms=140, hold=10)
    frames[-1].save(OUT + 'longshore_last.png')


# ---------- L27, L28: wind ----------
def abrasion_gif():
    frames = []; N = 36; rng = np.random.default_rng(1)
    grains = rng.uniform(0, 1, (40, 2))
    for i in range(N):
        f = i / (N - 1); fig, ax = canvas('#F7E3B5'); ax.add_patch(Rectangle((0, 0), W_, 0.8, color='#D9B46C'))
        neck = 1.4 - 0.9 * f
        ax.add_patch(Polygon([(6.4 - neck / 2, 0.8), (6.4 + neck / 2, 0.8), (6.4 + neck / 2 + 0.2, 2.3), (7.9, 2.9), (7.9, 4.2), (4.9, 4.2), (4.9, 2.9), (6.4 - neck / 2 - 0.2, 2.3)], color='#A1674A'))
        for gx, gy in grains:
            x = (gx * 13 + i * 0.5) % 13; y = 0.9 + gy * 1.2
            if x < 6.2: ax.plot(x, y, 'o', ms=6, color='#8D6E00')
        arrow(ax, (0.4, 3.3), (3.4, 3.3), c=ORANGE, lw=6); lab(ax, 2.0, 4.2, 'Wind with sand', fs=24, c=ORANGE)
        lab(ax, 10.4, 1.4, 'Sand wears the bottom', fs=24, c=RED)
        if f > 0.6: lab(ax, 10.4, 3.6, 'ROCK PEDESTAL', fs=28, c=NAVY)
        frames.append(frame(fig))
    save_gif(frames, 'abrasion.gif', ms=140, hold=12)
    frames[-1].save(OUT + 'abrasion_last.png')


def dune_move_gif():
    frames = []; N = 36
    for i in range(N):
        f = i / (N - 1); s = 3.5 * f
        fig, ax = canvas(SKY); ax.add_patch(Rectangle((0, 0), W_, 0.7, color='#D9B46C'))
        ax.add_patch(Polygon([(1.5 + s, 0.7), (6.3 + s, 3.2), (7.6 + s, 0.7)], color=SAND))
        for k in range(3): arrow(ax, (0.3, 2.8 + 0.5 * k), (2.3, 2.8 + 0.5 * k), c=ORANGE, lw=5, ms=28)
        ax.plot([2.8 + s, 5.6 + s], [1.4, 2.9], color='#8D6E00', lw=0); arrow(ax, (3.2 + s, 1.5), (5.8 + s, 2.9), c='#8D6E00', lw=4, ms=24)
        arrow(ax, (6.5 + s, 2.9), (7.2 + s, 1.3), c=RED, lw=4, ms=24)
        lab(ax, 3.3, 4.45, 'Gentle windward slope', fs=24, c='#8D6E00'); lab(ax, 10.3, 3.4, 'Steep slip face', fs=24, c=RED)
        lab(ax, 10.3, 1.5, 'The dune moves', fs=24, c=NAVY)
        frames.append(frame(fig))
    save_gif(frames, 'dune_move.gif', ms=150, hold=10)
    frames[-1].save(OUT + 'dune_move_last.png')


ALL = ['denudation_gif', 'weathering_types_big', 'exfoliation_gif', 'soil_profile_big', 'long_profile_big', 'river_erosion_big', 'waterfall_gif', 'meander_gif', 'oxbow_gif',
       'swash_gif', 'waves_types_big', 'headland_gif', 'longshore_gif', 'abrasion_gif', 'dune_move_gif']
if __name__ == '__main__':
    import sys
    for f in (sys.argv[1:] or ALL):
        try: globals()[f](); print('ok', f, flush=True)
        except Exception as e: import traceback; traceback.print_exc(); print('FAIL', f, e, flush=True)
