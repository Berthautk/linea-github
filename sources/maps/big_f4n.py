"""Big-label diagrams for Form 4 (2023 syllabus: ecological systems and economic development)."""
from big_common import *


def map_enlarge_big():
    fig, ax = canvas('white')
    river = np.array([[0.1, 0.2], [0.35, 0.45], [0.5, 0.4], [0.7, 0.7], [0.9, 0.85]])
    def grid(x0, y0, s, n=4, lab=None):
        for i in range(n + 1):
            ax.plot([x0, x0 + s * n], [y0 + i * s, y0 + i * s], color='#90A4AE', lw=1.5)
            ax.plot([x0 + i * s, x0 + i * s], [y0, y0 + s * n], color='#90A4AE', lw=1.5)
        ax.plot(x0 + river[:, 0] * s * n, y0 + river[:, 1] * s * n, color='#1E88E5', lw=4)
        ax.plot(x0 + 0.62 * s * n, y0 + 0.28 * s * n, '^', ms=10 + s * 8, color='#6D4C41')
        ax.text(x0 + s * n / 2, y0 - 0.35, lab, fontsize=22, fontweight='bold', ha='center', color=NAVY)
    grid(1.3, 1.0, 0.55, lab='Original: 1 cm squares')
    grid(6.3, 0.9, 1.0, lab='Enlarged ×2: 2 cm squares')
    arrow(ax, (3.7, 2.1), (6.0, 2.1), c=RED, lw=4, ms=30)
    ax.text(4.9, 2.5, 'copy square\nby square', fontsize=20, fontweight='bold', ha='center', color=RED)
    save(fig, 'map_enlarge_big.png')


def poverty_cycle_big():
    fig, ax = canvas('white')
    pts = [(6.4, 4.3, 'LOW INCOME', RED), (10.3, 2.5, 'LOW SAVINGS', '#E65100'), (6.4, 0.6, 'LOW INVESTMENT', '#6D4C41'), (2.5, 2.5, 'LOW PRODUCTION', NAVY)]
    for x, y, t, c in pts:
        ax.add_patch(FancyBboxPatch((x - 1.6, y - 0.35), 3.2, 0.7, boxstyle='round,pad=0.05', fc=c, ec='#333', lw=2, zorder=3))
        ax.text(x, y, t, fontsize=22, fontweight='bold', color='white', ha='center', va='center', zorder=4)
    for (a, b) in [((8.0, 4.2), (9.9, 2.95)), ((9.9, 2.05), (8.0, 0.75)), ((4.8, 0.75), (2.9, 2.05)), ((2.9, 2.95), (4.8, 4.2))]:
        arrow(ax, a, b, c='#555', lw=4, ms=30, cs='arc3,rad=-0.2')
    ax.text(6.4, 2.5, 'THE POVERTY\nCYCLE', fontsize=26, fontweight='bold', color=RED, ha='center', va='center')
    save(fig, 'poverty_cycle_big.png')


def underdev_causes_big():
    fig, ax = canvas('white')
    items = [(0.3, 2.7, '#12305A', 'POLITICAL', 'corruption, poor\ngovernance, conflicts'), (6.6, 2.7, '#E65100', 'ECONOMIC', 'unfair trade, debt,\nraw material exports'),
             (0.3, 0.2, '#2E7D32', 'SOCIAL', 'illiteracy, diseases,\nrapid population growth'), (6.6, 0.2, '#6D4C41', 'NATURAL', 'droughts, poor soils,\nlandlocked position')]
    for x, y, c, t, d in items:
        ax.add_patch(FancyBboxPatch((x, y + 1.3), 5.9, 0.75, boxstyle='round,pad=0.05', fc=c, ec='#333', lw=2))
        ax.text(x + 2.95, y + 1.67, t, fontsize=24, fontweight='bold', color='white', ha='center', va='center')
        ax.text(x + 2.95, y + 0.65, d, fontsize=20, fontweight='bold', color=c, ha='center', va='center')
    save(fig, 'underdev_causes_big.png')


if __name__ == '__main__':
    map_enlarge_big(); poverty_cycle_big(); underdev_causes_big(); print('done')
