"""Big-label diagrams for the revised Upper Sixth statistical techniques (teacher's support, 2026)."""
import sys
from big_common import *
from big_usa_pop import box_, table_big
from big_geo2 import cols, txt


def cs(name, fig): fig.savefig(OUT + name, dpi=150, facecolor='white'); plt.close(fig)


# ---------- QT2: data collection ----------
def stat2_techniques():
    cols('stat2_techniques.png', 'Primary data collection techniques', ['OBSERVATION', 'MEASUREMENT', 'QUESTIONNAIRES', 'FOCUS GROUPS'],
         ['counting motos on\nthe Pont Neuf,\nphotos, films', 'thermometer, rain\ngauge, tape,\nclinometer', 'closed and open\nquestions;\nstructured or not', '6–10 people\n(cotton farmers)\ndiscuss a topic'], [GREEN, BLUE, ORANGE, NAVY], 16)


def stat2_systematic():
    fig, ax = canvas('white')
    txt(ax, 6.4, 4.6, 'Systematic sampling: 20 students from a list of 200', 21, NAVY)
    txt(ax, 6.4, 3.8, 'interval k = population ÷ sample = 200 ÷ 20 = 10', 22, RED)
    for i in range(40):
        x = 0.4 + i * 0.3; sel = (i % 10 == 6)
        ax.add_patch(Circle((x, 2.6), 0.11, color=RED if sel else '#B0BEC5'))
        if sel: txt(ax, x, 2.1, str(i + 1), 15, RED)
    txt(ax, 6.4, 1.2, 'random start (e.g. 7), then every 10th: 7, 17, 27, 37 …', 20, GREEN)
    save(fig, 'stat2_systematic.png')


# ---------- QT3 part 1 ----------
def stat2_mean():
    table_big('stat2_mean.png', ['Data', 'Working', 'Mean'],
              [['Services in 10 villages: 3, 10, 6, 8, 4, 5, 7, 18, 2, 1', 'Σx = 64; n = 10', '64 ÷ 10 = 6.4'],
               ['Station A, monthly temperature (°C)', 'Σx = 322; n = 12', '322 ÷ 12 ≈ 26.8 °C'],
               ['Ndu, annual rainfall 1963–1972 (mm)', 'Σx = 18,989; n = 10', '≈ 1,899 mm']], colw=[6.0, 3.2, 2.8], fs=15, note='Mean = Σx ÷ n')


def stat2_median():
    fig, ax = canvas('white')
    txt(ax, 6.4, 4.6, 'Median = value in position (n + 1) ÷ 2 after ordering', 21, NAVY)
    for row, (vals, mid, lab) in enumerate([([3, 4, 5, 6, 8, 8, 10], [3], 'n = 7 (odd): (7 + 1) ÷ 2 = 4th value → median = 6'),
                                          ([2, 3, 4, 5, 6, 7, 9, 12], [3, 4], 'n = 8 (even): 4th and 5th → (5 + 6) ÷ 2 = 5.5')]):
        y = 3.4 - row * 1.8
        for i, v in enumerate(vals):
            x = 1.0 + i * 0.9; c = RED if i in mid else '#E3F2FD'
            ax.add_patch(Rectangle((x - 0.35, y - 0.3), 0.7, 0.6, color=c, ec='#607D8B')); txt(ax, x, y, str(v), 18, 'white' if i in mid else '#222')
        txt(ax, 6.4, y - 0.7, lab, 18, GREEN)
    save(fig, 'stat2_median.png')


def stat2_mode():
    table_big('stat2_mode.png', ['Temperature of station A (°C)', 'Frequency (number of months)'],
              [['23', '1'], ['26', '4'], ['27', '1'], ['28', '6  ← mode'], ['Total', 'Σf = 12']], colw=[6.0, 6.0], fs=18,
              note='2, 5, 8, 3, 7 → no mode;   1, 8, 7, 8, 5, 9, 11, 5 → bimodal (5 and 8)')


def stat2_central_compare():
    table_big('stat2_central_compare.png', ['', 'Mean', 'Median', 'Mode'],
              [['Uses all values', 'yes', 'no', 'no'], ['Affected by outliers', 'strongly', 'no', 'no'], ['Categorical data', 'no', 'no', 'yes'],
               ['Always one value', 'yes', 'yes', 'not always'], ['Further statistics', 'yes (SD)', 'little', 'little']], colw=[3.6, 2.8, 2.8, 2.8], fs=17)


def stat2_iqr():
    fig, ax = canvas('white')
    vals = [102, 104, 105, 107, 108, 109, 110, 112, 115, 116, 118]
    txt(ax, 6.4, 4.6, 'Quartiles and interquartile range (n = 11, ordered)', 21, NAVY)
    for i, v in enumerate(vals):
        x = 0.8 + i * 1.1; c = RED if i == 5 else (GREEN if i in (2, 8) else '#E3F2FD')
        ax.add_patch(Rectangle((x - 0.45, 2.9), 0.9, 0.7, color=c, ec='#607D8B')); txt(ax, x, 3.25, str(v), 17, 'white' if c != '#E3F2FD' else '#222')
    txt(ax, 0.8 + 2 * 1.1, 2.4, 'Q1 = 105', 18, GREEN); txt(ax, 0.8 + 5 * 1.1, 2.4, 'median = 109', 18, RED); txt(ax, 0.8 + 8 * 1.1, 2.4, 'Q3 = 115', 18, GREEN)
    txt(ax, 6.4, 1.3, 'IQR = Q3 − Q1 = 115 − 105 = 10  (the middle 50 % of the data)', 20, NAVY)
    txt(ax, 6.4, 0.5, 'Range = highest − lowest = 118 − 102 = 16', 19, ORANGE)
    save(fig, 'stat2_iqr.png')


# ---------- QT3 part 2 ----------
def stat2_sd():
    table_big('stat2_sd.png', ['Household', 'x (minimum age)', 'x − mean', '(x − mean)²'],
              [['1 – 5', '5, 8, 3, 2, 7', '0, 3, −2, −3, 2', '0, 9, 4, 9, 4'], ['6 – 10', '9, 8, 2, 2, 4', '4, 3, −3, −3, −1', '16, 9, 9, 9, 1'],
               ['Totals', 'Σx = 50, mean = 5', '', 'Σ = 70']], colw=[2.2, 3.4, 3.2, 3.2], fs=16,
              note='Variance = 70 ÷ 10 = 7;   SD = √7 ≈ 2.65 years')


def stat2_variance():
    table_big('stat2_variance.png', ['Data', 'Mean', 'Σ(x − mean)²', 'Variance (÷ n)', 'SD'],
              [['610, 450, 160, 420, 310 mm', '390', '112,200', '22,440', '≈ 149.8'], ['3, 8, 6, 10, 12, 9, 11, 10, 12, 7', '8.8', '73.6', '7.36', '≈ 2.71'],
               ['12, 6, 7, 3, 15, 10, 18, 5', '9.5', '190', '23.75', '≈ 4.87']], colw=[4.2, 1.4, 2.4, 2.2, 1.8], fs=15)


def stat2_cv():
    fig, ax = canvas('white')
    txt(ax, 6.4, 4.5, 'Coefficient of variation = SD ÷ mean × 100', 26, NAVY)
    txt(ax, 6.4, 3.3, 'Example: SD = 10.05 and mean = 13', 21, '#222')
    txt(ax, 6.4, 2.3, 'CV = 10.05 ÷ 13 × 100 ≈ 77.3 %', 26, RED)
    txt(ax, 6.4, 1.0, 'high CV = very variable data;  low CV = regular data\n(it compares data with different units or sizes)', 19, GREEN)
    save(fig, 'stat2_cv.png')


# ---------- QT3 part 3 ----------
def stat2_spearman():
    table_big('stat2_spearman.png', ['n°', 'Slope (°)', 'Soil depth (cm)', 'Rank slope', 'Rank soil', 'd', 'd²'],
              [['1', '9', '60', '2', '1.5', '0.5', '0.25'], ['2', '8', '48', '3', '3', '0', '0'], ['3', '7', '33', '4', '4', '0', '0'], ['4', '6', '18', '5', '9', '−4', '16'],
               ['5', '2', '22', '9', '8', '1', '1'], ['6', '3', '29', '8', '5', '3', '9'], ['7', '5', '24', '6', '6.5', '−0.5', '0.25'], ['8', '1', '24', '10', '6.5', '3.5', '12.25'],
               ['9', '4', '12', '7', '10', '−3', '9'], ['10', '10', '60', '1', '1.5', '−0.5', '0.25']], colw=[0.9, 1.6, 2.4, 2.0, 2.0, 1.5, 1.6], fs=14,
              note='Σd² = 48;   Rs = 1 − (6 × 48) ÷ (10³ − 10) = 1 − 288 ÷ 990 ≈ +0.71')


def stat2_rs_scale():
    fig, ax = canvas('white')
    txt(ax, 6.4, 4.6, 'Interpreting Rs (from −1 to +1)', 22, NAVY)
    ax.plot([0.8, 12.0], [2.9, 2.9], color='#333', lw=4)
    for v, lab, c in [(-1, '−1\nperfect\nnegative', RED), (-0.5, '−0.5\nstrong\nnegative', RED), (0, '0\nno\ncorrelation', '#555'), (0.5, '+0.5\nstrong\npositive', GREEN), (1, '+1\nperfect\npositive', GREEN)]:
        x = 6.4 + v * 5.6; ax.plot([x, x], [2.7, 3.1], color=c, lw=4); txt(ax, x, 1.9, lab, 16, c)
    txt(ax, 6.4 + 0.71 * 5.6, 3.55, '+0.71', 20, BLUE); ax.plot([6.4 + 0.71 * 5.6], [2.9], marker='v', ms=18, color=BLUE)
    txt(ax, 6.4, 0.6, 'n = 10: critical value 0.648 (95 %), 0.794 (99 %) → significant at 95 % only', 17, NAVY)
    save(fig, 'stat2_rs_scale.png')


# ---------- QT4: graphs ----------
def stat2_bar():
    fig, ax = chart(); r = ['North', 'South', 'East', 'West', 'Central']; v = [120, 200, 150, 180, 100]
    ax.bar(r, v, color=GREEN, width=0.6)
    for i, x in enumerate(v): ax.text(i, x + 4, str(x), fontsize=20, fontweight='bold', ha='center')
    ax.set_ylabel('Maize (tons)', fontsize=21, fontweight='bold'); ax.set_ylim(0, 230); ax.tick_params(axis='x', labelsize=20)
    ax.set_title('Vertical bar graph: maize production by region', fontsize=20, fontweight='bold', color=NAVY)
    fig.subplots_adjust(top=0.9); cs('stat2_bar.png', fig)


def stat2_hbar():
    fig, ax = chart(); r = ['City A', 'City B', 'City C', 'City D', 'City E']; v = [450, 700, 620, 580, 500]
    ax.barh(r, v, color=BLUE, height=0.6); ax.invert_yaxis()
    for i, x in enumerate(v): ax.text(x + 8, i, f'{x} mm', fontsize=19, fontweight='bold', va='center')
    ax.set_xlabel('Rainfall (mm)', fontsize=21, fontweight='bold'); ax.set_xlim(0, 820); ax.tick_params(axis='y', labelsize=20)
    ax.set_title('Horizontal bar graph: annual rainfall of five cities', fontsize=20, fontweight='bold', color=NAVY)
    fig.subplots_adjust(left=0.14, top=0.9, bottom=0.16); cs('stat2_hbar.png', fig)


def stat2_line():
    fig, ax = chart(); e = [0, 500, 1000, 1500]; t = [30, 25, 20, 15]
    ax.plot(e, t, color=RED, lw=5, marker='o', ms=14)
    for x, y in zip(e, t): ax.text(x + 30, y + 0.6, f'({x}, {y})', fontsize=18, fontweight='bold')
    ax.set_xlabel('Elevation (m)', fontsize=21, fontweight='bold'); ax.set_ylabel('Temperature (°C)', fontsize=21, fontweight='bold'); ax.set_ylim(10, 33)
    ax.set_title('Simple line graph: temperature falls 5 °C every 500 m', fontsize=20, fontweight='bold', color=NAVY)
    fig.subplots_adjust(top=0.9, bottom=0.16); cs('stat2_line.png', fig)


def stat2_ogive():
    fig, ax = chart(); x = [0, 10, 20, 30, 40, 50]; y = [0, 2, 7, 15, 21, 25]
    ax.plot(x, y, color=NAVY, lw=5, marker='o', ms=12)
    for a, b in zip(x[1:], y[1:]): ax.text(a - 1, b + 1, str(b), fontsize=18, fontweight='bold', ha='right')
    ax.axhline(12.5, color=RED, ls='--', lw=2); ax.text(1, 13.3, 'n ÷ 2 = 12.5 → median ≈ 27 marks', fontsize=18, fontweight='bold', color=RED)
    ax.set_xlabel('Scores (upper class limit)', fontsize=21, fontweight='bold'); ax.set_ylabel('Cumulative frequency', fontsize=21, fontweight='bold'); ax.set_ylim(0, 28)
    ax.set_title('Ogive: test scores of 25 students', fontsize=20, fontweight='bold', color=NAVY)
    fig.subplots_adjust(top=0.9, bottom=0.16); cs('stat2_ogive.png', fig)


def stat2_pie():
    fig, ax = plt.subplots(figsize=(12.8, 5.6), dpi=150); fig.subplots_adjust(0, 0, 1, 1)
    lab = ['Cereals', 'Tubers', 'Livestock', 'Processed food', 'Others']; v = [30, 15, 20, 25, 10]
    col = ['#F9A825', '#8D6E63', '#E53935', '#1E88E5', '#78909C']
    ax.pie(v, colors=col, startangle=90, counterclock=False, center=(-0.9, 0), radius=1.0, wedgeprops=dict(ec='white', lw=3))
    for i, (l, p) in enumerate(zip(lab, v)):
        ax.text(0.5, 0.8 - i * 0.38, f'{l}: {p} % × 3.6 = {p * 3.6:g}°', fontsize=20, fontweight='bold', color=col[i], va='center')
    ax.text(0.5, -1.15, 'Total = 100 % = 360°', fontsize=20, fontweight='bold', color=NAVY)
    ax.set_xlim(-2.1, 3.2); ax.set_ylim(-1.3, 1.2); ax.set_aspect('equal')
    cs('stat2_pie.png', fig)


def stat2_triangle():
    fig, ax = canvas('white')
    A, Bp, C = np.array([1.2, 0.5]), np.array([7.2, 0.5]), np.array([4.2, 0.5 + 6 * 0.866 * 0.77])
    ax.add_patch(Polygon([A, Bp, C], fill=False, ec=NAVY, lw=3))
    for k in range(1, 10):
        f = k / 10
        for P, Q, R in [(A, Bp, C), (Bp, C, A), (C, A, Bp)]:
            p1 = P + (Q - P) * f; p2 = P + (R - P) * f; ax.plot([p1[0], p2[0]], [p1[1], p2[1]], color='#CFD8DC', lw=1)
    q, f_, m = 0.5, 0.3, 0.2
    pt = q * A + f_ * Bp + m * C; ax.plot(pt[0], pt[1], marker='o', ms=16, color=RED)
    txt(ax, A[0] - 0.2, A[1] - 0.25, 'QUARTZ', 17, BROWN); txt(ax, Bp[0] + 0.2, Bp[1] - 0.25, 'FELDSPAR', 17, BROWN); txt(ax, C[0], C[1] + 0.3, 'MICA', 17, BROWN)
    txt(ax, 10.0, 3.3, 'Rock sample:\nquartz 50 %\nfeldspar 30 %\nmica 20 %', 19, RED)
    txt(ax, 10.0, 1.3, 'the three parts\nmust add up to 100 %', 17, NAVY)
    save(fig, 'stat2_triangle.png')


def stat2_scatter():
    fig, ax = chart(); m = [25, 20, 22, 26, 29, 24, 18, 30, 32, 15]; o = [5.1, 4.6, 4.6, 6.2, 7.1, 5.4, 3.8, 4.7, 6.9, 3.2]
    ax.scatter(m, o, s=160, color=NAVY, zorder=3)
    a, b = np.polyfit(m, o, 1); xs = np.array([14, 33]); ax.plot(xs, a * xs + b, color=RED, lw=3, ls='--', label='line of best fit')
    ax.scatter([30], [4.7], s=420, facecolors='none', edgecolors=ORANGE, lw=3); ax.text(30.4, 4.1, 'anomaly', fontsize=17, fontweight='bold', color=ORANGE)
    ax.set_xlabel('Moisture content (%)', fontsize=21, fontweight='bold'); ax.set_ylabel('Organic content (%)', fontsize=21, fontweight='bold'); ax.legend(fontsize=16, loc='upper left')
    ax.set_title('Scatter graph: positive correlation', fontsize=20, fontweight='bold', color=NAVY)
    fig.subplots_adjust(top=0.9, bottom=0.16); cs('stat2_scatter.png', fig)


def stat2_scatter_alt():
    fig, ax = chart(); st = ['Nairobi', 'Cape Coast', 'Yaoundé', 'Bamenda', 'Entebbe', 'Lubango', 'Lagos']; al = [1770, 0, 793, 1177, 1134, 1760, 3]; t = [17, 27, 23, 21, 22, 17, 27]
    ax.scatter(al, t, s=170, color=NAVY, zorder=3)
    for s_, x, y in zip(st, al, t):
        dy = {'Lagos': -1.2, 'Lubango': -1.2}.get(s_, 0.5); ax.text(x + 25, y + dy, s_, fontsize=15, fontweight='bold')
    a, b = np.polyfit(al, t, 1); xs = np.array([-50, 1850]); ax.plot(xs, a * xs + b, color=RED, lw=3, ls='--')
    ax.set_xlabel('Altitude (m)', fontsize=21, fontweight='bold'); ax.set_ylabel('Mean temperature (°C)', fontsize=21, fontweight='bold'); ax.set_ylim(14, 29.5)
    ax.set_title('Scatter graph: strong negative correlation', fontsize=20, fontweight='bold', color=NAVY)
    fig.subplots_adjust(top=0.9, bottom=0.16); cs('stat2_scatter_alt.png', fig)


if __name__ == '__main__':
    only = sys.argv[1:]
    for n, f in list(globals().items()):
        if n.startswith('stat2_') and callable(f) and (not only or n in only): f(); print('ok', n)
