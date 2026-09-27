"""Shared helpers for v2 big-label diagrams and maps (fonts 26-34, no small text)."""
import numpy as np, matplotlib, io, os, json
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import Polygon, Rectangle, Circle, Ellipse, FancyArrowPatch, Wedge, FancyBboxPatch
from PIL import Image
from illus import canvas, lab, arrow, save, frame, save_gif, GIF_DPI, sun, acacia, tuft, maize, cow, person, flame, OUT, RED, NAVY, W_, H_
BLUE = '#1565C0'; GREEN = '#2E7D32'; BROWN = '#6D4C41'; ORANGE = '#E65100'
plt.rcParams['font.family'] = 'DejaVu Sans'

def chart(size=(12.8, 5.6)):
    fig, ax = plt.subplots(figsize=size, dpi=150); fig.subplots_adjust(0.09, 0.14, 0.91, 0.97)
    for s in ('top',): ax.spines[s].set_visible(False)
    ax.tick_params(labelsize=22)
    return fig, ax

def climate_graph(name, temp, rain, note=None, tlim=(0, 40), rlim=(0, 300), wet=None):
    m = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D']
    fig, ax = chart(); x = np.arange(12)
    if wet: ax.axvspan(wet[0] - 0.5, wet[1] + 0.5, color='#BBDEFB', alpha=0.5, zorder=0)
    ax.bar(x, rain, color='#1E88E5', width=0.7, zorder=2); ax.set_ylim(*rlim); ax.set_ylabel('Rain (mm)', fontsize=24, color='#1E88E5', fontweight='bold')
    ax.set_xticks(x); ax.set_xticklabels(m, fontsize=24, fontweight='bold')
    a2 = ax.twinx(); a2.plot(x, temp, color=RED, lw=5, marker='o', ms=10, zorder=3); a2.set_ylim(*tlim); a2.tick_params(labelsize=22)
    a2.set_ylabel('Temperature (°C)', fontsize=24, color=RED, fontweight='bold')
    if note: note(ax, a2)
    fig.savefig(OUT + name, dpi=150, facecolor='white'); plt.close(fig)

# ---------- maps ----------
import cartopy.crs as ccrs, cartopy.feature as cf
from shapely.geometry import shape, box, Polygon as SPoly
from shapely.ops import unary_union
PC = ccrs.PlateCarree()
_C = None
def countries():
    global _C
    if _C is None:
        g = json.load(open('/home/claude/maps/countries50.geojson'))
        _C = [((f['properties'].get('NAME') or f['properties'].get('name') or f['properties'].get('ADMIN')), shape(f['geometry'])) for f in g['features']]
    return _C
def land():
    return unary_union([g.buffer(0) for n, g in countries()])
def map_axes(ext, size=(12.8, 6.4)):
    fig = plt.figure(figsize=size, dpi=150); ax = plt.axes([0, 0, 1, 1], projection=PC); ax.set_extent(ext, crs=PC)
    ax.set_facecolor('#CFE6F5'); ax.add_geometries([land()], PC, facecolor='#F2EFE6', edgecolor='#888', lw=0.6)
    return fig, ax
def mlab(ax, x, y, t, fs=26, c='#111', box=True, **k):
    kw = dict(fontsize=fs, color=c, ha='center', va='center', fontweight='bold', transform=PC, zorder=30)
    if box: kw['bbox'] = dict(boxstyle='round,pad=0.25', fc='white', ec=c, lw=2.5, alpha=0.95)
    kw.update(k); ax.text(x, y, t, **kw)
def latline(ax, ext, la, t, c='#1565C0', ls='--', fs=22):
    ax.plot([ext[0], ext[1]], [la, la], color=c, lw=2.5, ls=ls, transform=PC, zorder=10)
    ax.text(ext[0] + (ext[1] - ext[0]) * 0.01, la, t, fontsize=fs, color=c, fontweight='bold', va='bottom', transform=PC, zorder=31,
            bbox=dict(boxstyle='round,pad=0.15', fc='white', ec='none', alpha=0.85))
def msave(fig, name): fig.savefig(OUT + name, dpi=150, facecolor='white'); plt.close(fig)
def country(n): return [g for k, g in countries() if k == n][0]
