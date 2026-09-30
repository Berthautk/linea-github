import {
  Entry,
  EntryType,
  FamilyCalculation,
  MemberData,
  MonthCalculation,
  MonthData,
  PlanLine,
  RankedExpense,
  Wallet,
} from './types';

export const GROUPS = [
  'Revenus',
  'Logement',
  'Enfants',
  'Maison',
  'Soutien famille',
  'Santé',
  'Transport',
  'Repas',
  'Dettes',
  'Frais',
  'Provisions',
  'Tontine',
  'Autres',
] as const;

export const DEFAULT_WALLETS: Wallet[] = [
  {
    id: 'wallet-cash',
    name: 'Espèces',
    type: 'cash',
    color: '#12A150',
    icon: 'Banknote',
    initialBalance: 0,
  },
  {
    id: 'wallet-momo',
    name: 'MTN MoMo',
    type: 'momo',
    color: '#F5B700',
    icon: 'Smartphone',
    initialBalance: 0,
  },
  {
    id: 'wallet-om',
    name: 'Orange Money',
    type: 'om',
    color: '#EA580C',
    icon: 'Smartphone',
    initialBalance: 0,
  },
  {
    id: 'wallet-bank',
    name: 'Banque',
    type: 'bank',
    color: '#2563EB',
    icon: 'Building2',
    initialBalance: 0,
  },
];

export const SEED_DATA: Record<string, MonthData> = {
  '2026-09': {
    seeded: true,
    plan: [
      { id: 'p-rev-1', g: 'Revenus', l: 'Revenus du mois', a: 0, t: 'in' },
      { id: 'p-log-1', g: 'Logement', l: 'Loyer', a: 0, t: 'out' },
      { id: 'p-log-2', g: 'Logement', l: 'Eau', a: 0, t: 'out' },
      { id: 'p-log-3', g: 'Logement', l: 'Électricité', a: 10000, t: 'out' },
      {
        id: 'p-enf-1',
        g: 'Enfants',
        l: 'Scolarité et fournitures des enfants',
        a: 120000,
        t: 'out',
      },
      { id: 'p-mai-1', g: 'Maison', l: 'Femme de ménage', a: 0, t: 'out' },
      { id: 'p-fam-1', g: 'Soutien famille', l: 'Maman', a: 10000, t: 'out' },
      { id: 'p-fam-2', g: 'Soutien famille', l: 'Cabrel', a: 17500, t: 'out' },
      {
        id: 'p-fam-3',
        g: 'Soutien famille',
        l: 'Transport maman',
        a: 20000,
        t: 'out',
      },
      { id: 'p-san-1', g: 'Santé', l: 'Remède', a: 12000, t: 'out' },
      { id: 'p-san-2', g: 'Santé', l: 'Consultation', a: 0, t: 'out' },
      { id: 'p-tra-1', g: 'Transport', l: 'Réparation moto', a: 13000, t: 'out' },
      { id: 'p-tra-2', g: 'Transport', l: 'Pousse-pousse', a: 10000, t: 'out' },
      { id: 'p-rep-1', g: 'Repas', l: 'Petit déjeuner', a: 50000, t: 'out' },
      { id: 'p-det-1', g: 'Dettes', l: 'Chaussures', a: 17000, t: 'out' },
      { id: 'p-det-2', g: 'Dettes', l: 'Beurre', a: 5000, t: 'out' },
      { id: 'p-det-3', g: 'Dettes', l: 'Claude', a: 10000, t: 'out' },
    ],
    entries: [],
  },
};

/**
 * Format integer FCFA into readable French format with narrow non-breaking space
 */
export function fmt(n: number | null | undefined): string {
  if (n === null || n === undefined || isNaN(n)) return '0';
  return Math.round(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '\u202F');
}

/**
 * Signed format for balance
 */
export function fmtS(n: number | null | undefined): string {
  if (n === null || n === undefined || isNaN(n)) return '+0';
  const val = Math.round(n);
  const formatted = fmt(Math.abs(val));
  return val > 0 ? `+${formatted}` : val < 0 ? `−${formatted}` : `0`;
}

/**
 * Compact formatting for charts
 */
export function compact(n: number): string {
  if (Math.abs(n) >= 1_000_000) {
    return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  }
  if (Math.abs(n) >= 1_000) {
    return `${Math.round(n / 1_000)}k`;
  }
  return String(Math.round(n));
}

/**
 * Strip accents and lowercase
 */
export function norm(s: string): string {
  return (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Parse FCFA amount strings like "5000", "5k", "5 000 F", "1.5M"
 */
export function parseAmount(str: string): number | null {
  if (!str) return null;
  const clean = str.trim().toLowerCase();
  const kMatch = clean.match(/^(\d+(?:[.,]\d+)?)\s*k$/);
  if (kMatch) {
    const num = parseFloat(kMatch[1].replace(',', '.'));
    return Math.round(num * 1000);
  }
  const mMatch = clean.match(/^(\d+(?:[.,]\d+)?)\s*m$/);
  if (mMatch) {
    const num = parseFloat(mMatch[1].replace(',', '.'));
    return Math.round(num * 1000000);
  }
  const digitsOnly = clean.replace(/[^\d]/g, '');
  if (!digitsOnly) return null;
  const val = parseInt(digitsOnly, 10);
  return isNaN(val) ? null : val;
}

/**
 * Generate 10-char random code without ambiguous characters
 */
export function generateHouseholdCode(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 10; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function generateId(): string {
  return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7);
}

export function todayStr(): string {
  const d = new Date();
  const pad = (n: number) => (n < 10 ? '0' : '') + n;
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function currentMonthKey(): string {
  return todayStr().slice(0, 7);
}

export function addMonth(monthKey: string, delta: number): string {
  const [yStr, mStr] = monthKey.split('-');
  let y = parseInt(yStr, 10);
  let m = parseInt(mStr, 10) + delta;
  while (m < 1) {
    m += 12;
    y -= 1;
  }
  while (m > 12) {
    m -= 12;
    y += 1;
  }
  return `${y}-${m < 10 ? '0' : ''}${m}`;
}

export function monthLabel(monthKey: string): string {
  const [y, m] = monthKey.split('-');
  const months = [
    'janvier',
    'février',
    'mars',
    'avril',
    'mai',
    'juin',
    'juillet',
    'août',
    'septembre',
    'octobre',
    'novembre',
    'décembre',
  ];
  const idx = parseInt(m, 10) - 1;
  return `${months[idx] || m} ${y}`;
}

export function monthName(monthKey: string): string {
  const parts = monthLabel(monthKey).split(' ');
  return parts[0].charAt(0).toUpperCase() + parts[0].slice(1) + ' ' + parts[1];
}

export function shortMonth(monthKey: string): string {
  const m = parseInt(monthKey.split('-')[1], 10);
  const names = [
    'Jan',
    'Fév',
    'Mar',
    'Avr',
    'Mai',
    'Juin',
    'Juil',
    'Aoû',
    'Sep',
    'Oct',
    'Nov',
    'Déc',
  ];
  return names[m - 1] || monthKey;
}

export function daysInMonth(monthKey: string): number {
  const [y, m] = monthKey.split('-').map((v) => parseInt(v, 10));
  return new Date(y, m, 0).getDate();
}

/**
 * Return month key taking custom start day (1 to 28) into account
 */
export function getBudgetMonthForDate(dateStr: string, monthStartDay: number = 1): string {
  if (monthStartDay <= 1) return dateStr.slice(0, 7);
  const [y, m, d] = dateStr.split('-').map((v) => parseInt(v, 10));
  if (d >= monthStartDay) {
    // Current calendar month or next?
    // If start day is e.g. 25, then Sept 25 belongs to October cycle
    return addMonth(`${y}-${m < 10 ? '0' : ''}${m}`, 1);
  }
  return `${y}-${m < 10 ? '0' : ''}${m}`;
}

/**
 * Calculate month figures:
 * IMPORTANT: Épargne (type 'save') is counted as savings, NEVER as expense (out).
 * Entries with status === 'declined' are excluded from calculations.
 */
export function calcMonth(data?: MonthData): MonthCalculation {
  const mData = data || { plan: [], entries: [] };
  let inc = 0;
  let out = 0;
  let saved = 0;
  let offOut = 0;
  const byGroup: Record<string, number> = {};
  const byPlan: Record<string, number> = {};

  GROUPS.forEach((g) => {
    byGroup[g] = 0;
  });
  byGroup['Hors plan'] = 0;

  mData.plan.forEach((p) => {
    byPlan[p.id] = 0;
  });

  mData.entries.forEach((e) => {
    // Exclude declined entries from active totals
    if (e.status === 'declined') return;

    if (e.t === 'in') {
      inc += e.amt;
    } else if (e.t === 'save') {
      saved += e.amt;
      // Also if provision/goal, record into byGroup
      const rubric = e.p ? mData.plan.find((x) => x.id === e.p)?.g || 'Provisions' : 'Provisions';
      byGroup[rubric] = (byGroup[rubric] || 0) + e.amt;
      if (e.p) {
        byPlan[e.p] = (byPlan[e.p] || 0) + e.amt;
      }
    } else {
      // Outflow (expense)
      out += e.amt;
      if (e.fee && e.fee > 0) {
        out += e.fee;
        byGroup['Frais'] = (byGroup['Frais'] || 0) + e.fee;
      }
      if (e.p && byPlan[e.p] !== undefined) {
        byPlan[e.p] = (byPlan[e.p] || 0) + e.amt;
        const line = mData.plan.find((p) => p.id === e.p);
        if (line) {
          byGroup[line.g] = (byGroup[line.g] || 0) + e.amt;
        } else {
          byGroup['Hors plan'] = (byGroup['Hors plan'] || 0) + e.amt;
          offOut += e.amt;
        }
      } else {
        byGroup['Hors plan'] = (byGroup['Hors plan'] || 0) + e.amt;
        offOut += e.amt;
      }
    }
  });

  let pIn = 0;
  let pOut = 0;
  let pSave = 0;
  let toPay = 0;
  let unset = 0;

  mData.plan.forEach((p) => {
    const a = p.a || 0;
    if (p.t === 'in') {
      pIn += a;
    } else if (p.t === 'save') {
      pSave += a;
      const actual = byPlan[p.id] || 0;
      if (a === 0) unset++;
      else if (actual < a) toPay += a - actual;
    } else {
      pOut += a;
      const actual = byPlan[p.id] || 0;
      if (a === 0) unset++;
      else if (actual < a) toPay += a - actual;
    }
  });

  const solde = inc - out;
  const free = solde - toPay;

  return {
    monthKey: '',
    monthData: mData,
    inc,
    out,
    saved,
    pIn,
    pOut,
    pSave,
    toPay,
    free,
    unset,
    byGroup,
    byPlan,
    offOut,
  };
}

/**
 * Calculate consolidated family totals
 */
export function calcFamily(members: MemberData[], monthKey: string): FamilyCalculation {
  let inc = 0;
  let out = 0;
  let saved = 0;
  let pIn = 0;
  let pOut = 0;
  let pSave = 0;
  let toPay = 0;
  const byGroup: Record<string, number> = {};
  const planned: Record<string, number> = {};

  GROUPS.forEach((g) => {
    byGroup[g] = 0;
    planned[g] = 0;
  });
  byGroup['Hors plan'] = 0;

  const per = members.map((m) => {
    const mData = m.months[monthKey] || { plan: [], entries: [] };
    const c = calcMonth(mData);
    inc += c.inc;
    out += c.out;
    saved += c.saved;
    pIn += c.pIn;
    pOut += c.pOut;
    pSave += c.pSave;
    toPay += c.toPay;

    GROUPS.forEach((g) => {
      byGroup[g] = (byGroup[g] || 0) + (c.byGroup[g] || 0);
    });
    byGroup['Hors plan'] = (byGroup['Hors plan'] || 0) + c.offOut;

    mData.plan.forEach((p) => {
      planned[p.g] = (planned[p.g] || 0) + (p.a || 0);
    });

    return {
      uid: m.uid,
      name: m.name,
      color: m.color,
      me: m.me,
      inc: c.inc,
      out: c.out,
      saved: c.saved,
      pOut: c.pOut,
      toPay: c.toPay,
      monthData: mData,
    };
  });

  const solde = inc - out;
  const free = solde - toPay;

  return {
    monthKey,
    inc,
    out,
    saved,
    pIn,
    pOut,
    pSave,
    toPay,
    free,
    byGroup,
    planned,
    per,
  };
}

/**
 * Rank expenses (sorties) from highest to lowest
 * Epargne is NOT an expense, so it is excluded from ranked expenses.
 */
export function rankExpenses(
  memberList: Array<{ monthData: MonthData; name?: string }>
): RankedExpense[] {
  const map: Record<string, { amt: number; group: string; who?: string }> = {};

  memberList.forEach(({ monthData, name }) => {
    monthData.entries.forEach((e) => {
      if (e.t !== 'out' || e.status === 'declined') return;
      let label = e.l;
      let group = 'Hors plan';
      if (e.p) {
        const line = monthData.plan.find((p) => p.id === e.p);
        if (line) {
          label = line.l;
          group = line.g;
        }
      }
      const key = `${group}::${label}`;
      if (!map[key]) {
        map[key] = { amt: 0, group, who: name };
      }
      map[key].amt += e.amt;
    });
  });

  return Object.entries(map)
    .map(([key, data]) => ({
      label: key.split('::')[1],
      group: data.group,
      amt: data.amt,
      who: data.who,
    }))
    .sort((a, b) => b.amt - a.amt);
}

/**
 * Label and group resolver for entries
 */
export function getEntryLabel(
  mData: MonthData,
  e: Entry
): { l: string; g: string } {
  if (e.p) {
    const line = mData.plan.find((p) => p.id === e.p);
    if (line) return { l: line.l, g: line.g };
  }
  return {
    l: e.l || (e.t === 'in' ? 'Entrée diverse' : e.t === 'save' ? 'Épargne' : 'Dépense diverse'),
    g: e.t === 'save' ? 'Provisions' : 'Hors plan',
  };
}

/**
 * Quick smart 1-line text entry parser
 * Examples: "5000 beurre", "+150000 salaire", "5k pousse"
 */
export function parseQuick(
  text: string,
  monthData?: MonthData
): {
  type: EntryType;
  amt: number | null;
  label: string;
  planLine: PlanLine | null;
} {
  const raw = text.trim();
  if (!raw) {
    return { type: 'out', amt: null, label: '', planLine: null };
  }

  let type: EntryType = 'out';
  let working = raw;

  if (working.startsWith('+')) {
    type = 'in';
    working = working.slice(1).trim();
  } else if (working.startsWith('-')) {
    type = 'out';
    working = working.slice(1).trim();
  }

  // Check amount at start
  const firstToken = working.split(/\s+/)[0];
  const parsedAmt = parseAmount(firstToken);
  let labelPart = '';

  if (parsedAmt !== null) {
    labelPart = working.slice(firstToken.length).trim();
  } else {
    // Check amount at end
    const lastToken = working.split(/\s+/).pop() || '';
    const parsedEndAmt = parseAmount(lastToken);
    if (parsedEndAmt !== null) {
      labelPart = working.slice(0, working.length - lastToken.length).trim();
      return resolveMatch(type, parsedEndAmt, labelPart, monthData);
    }
  }

  return resolveMatch(type, parsedAmt, labelPart, monthData);
}

function resolveMatch(
  explicitType: EntryType,
  amt: number | null,
  rawLabel: string,
  monthData?: MonthData
): {
  type: EntryType;
  amt: number | null;
  label: string;
  planLine: PlanLine | null;
} {
  let type = explicitType;
  const nLabel = norm(rawLabel);

  const incomeKeywords = [
    'salaire',
    'revenu',
    'vente',
    'paie',
    'prime',
    'bourse',
    'remboursement',
    'gain',
    'honoraires',
    'virement recu',
  ];

  if (explicitType === 'out' && incomeKeywords.some((k) => nLabel.includes(k))) {
    type = 'in';
  }

  const saveKeywords = ['epargne', 'provision', 'tontine', 'economie', 'reserve'];
  if (saveKeywords.some((k) => nLabel.includes(k))) {
    type = 'save';
  }

  let matchedPlan: PlanLine | null = null;

  if (monthData && monthData.plan.length && rawLabel.trim()) {
    const candidates = monthData.plan.filter((p) => p.t === type);
    const labelWords = nLabel.split(/\s+/).filter((w) => w.length >= 3);

    let bestScore = 0;
    candidates.forEach((p) => {
      const pNorm = norm(p.l);
      let score = 0;
      if (pNorm === nLabel) {
        score = 100;
      } else if (pNorm.includes(nLabel) || nLabel.includes(pNorm)) {
        score = 70;
      } else {
        labelWords.forEach((w) => {
          if (pNorm.includes(w)) score += 30;
        });
      }
      if (score > bestScore && score >= 30) {
        bestScore = score;
        matchedPlan = p;
      }
    });
  }

  const cleanLabel = rawLabel.trim();
  const displayLabel = matchedPlan ? (matchedPlan as PlanLine).l : cleanLabel;

  return {
    type,
    amt,
    label: displayLabel,
    planLine: matchedPlan,
  };
}

/**
 * End-of-month Forecast calculation
 */
export function computeForecast(
  calc: MonthCalculation,
  currentMonth: string
): {
  forecastBalance: number;
  dailyPace: number;
  daysPassed: number;
  daysLeft: number;
  topRubrics: Array<{ rubric: string; amt: number }>;
} {
  const totalDays = daysInMonth(currentMonth);
  const now = new Date();
  const isCurrentMonth = currentMonth === todayStr().slice(0, 7);
  const currentDay = isCurrentMonth ? Math.min(now.getDate(), totalDays) : totalDays;
  const daysPassed = Math.max(1, currentDay);
  const daysLeft = Math.max(0, totalDays - currentDay);

  const dailyPace = calc.out / daysPassed;
  const projectedExtraSpending = dailyPace * daysLeft;
  // If there are still planned payments not yet made, they are considered in the forecast
  const forecastBalance = calc.inc - (calc.out + projectedExtraSpending);

  const rubricEntries = Object.entries(calc.byGroup)
    .filter(([g, amt]) => g !== 'Revenus' && amt > 0)
    .map(([rubric, amt]) => ({ rubric, amt }))
    .sort((a, b) => b.amt - a.amt);

  return {
    forecastBalance: Math.round(forecastBalance),
    dailyPace: Math.round(dailyPace),
    daysPassed,
    daysLeft,
    topRubrics: rubricEntries.slice(0, 3),
  };
}

export interface MonthInsightData {
  monthKey: string;
  inc: number;
  out: number;
  pOut: number;
  byGroup: Record<string, number>;
}

export function getInsights(dataList: MonthInsightData[]): string[] {
  if (!dataList || dataList.length === 0) {
    return ['Commencez à noter vos opérations pour voir vos tendances financières.'];
  }
  const insights: string[] = [];
  const latest = dataList[dataList.length - 1];

  if (latest.inc > 0) {
    const rate = Math.round(((latest.inc - latest.out) / latest.inc) * 100);
    if (rate >= 20) {
      insights.push(`Bravo ! Vous conservez <b>${rate}%</b> de vos revenus.`);
    } else if (rate > 0) {
      insights.push(`Solde positif : <b>${rate}%</b> de vos revenus non dépensés.`);
    } else {
      insights.push(`Attention : vos dépenses dépassent vos entrées ce mois-ci.`);
    }
  }

  if (dataList.length >= 2) {
    const prev = dataList[dataList.length - 2];
    if (prev.out > 0) {
      const diff = Math.round(((latest.out - prev.out) / prev.out) * 100);
      if (diff > 0) {
        insights.push(`Dépenses en hausse de <b>+${diff}%</b> par rapport au mois précédent.`);
      } else if (diff < 0) {
        insights.push(`Dépenses maîtrisées en baisse de <b>${diff}%</b> par rapport au mois précédent.`);
      }
    }
  }

  const topRubric = Object.entries(latest.byGroup)
    .filter(([g]) => g !== 'Revenus')
    .sort((a, b) => b[1] - a[1])[0];
  if (topRubric && topRubric[1] > 0) {
    insights.push(`Poste principal : <b>${topRubric[0]}</b> (${fmt(topRubric[1])} F).`);
  }

  if (latest.pOut > 0) {
    const execRate = Math.round((latest.out / latest.pOut) * 100);
    insights.push(`Exécution du plan : <b>${execRate}%</b> du budget prévu engagé.`);
  }

  return insights.length > 0 ? insights : ['Vos données sont prêtes pour l’analyse.'];
}
