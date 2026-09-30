import { describe, expect, it } from 'vitest';
import {
  computeForecast,
  deMonth,
  fmt,
  fmtS,
  generateHouseholdCode,
  getBudgetMonthForDate,
  parseQuick,
} from './budget-math';
import { calcMonth, rankExpenses } from './calc';
import { parseFrenchNumberWords, parseVoiceTranscript } from './frenchNumbers';
import { cleanMomoAmount, parseMomoSMS } from './momoParser';
import { MOMO_FIXTURES } from './momoParser.fixtures';
import { Category, Entry, MonthDoc } from './types';

const cat = (id: string, name: string, kind: Category['kind'] = 'out'): Category => ({
  id,
  name,
  icon: 'Shapes',
  color: '#475569',
  order: 0,
  kind,
  budgetMode: 'lines',
  archived: false,
  createdAt: 0,
});
const entry = (p: Partial<Entry> & Pick<Entry, 'id' | 't' | 'amt'>): Entry => ({
  d: '2026-09-01',
  ts: 1,
  categoryId: null,
  lineId: null,
  label: '',
  w: 'cash',
  ...p,
});

describe('NSANGAWEH Core Logic & Tests', () => {
  describe('Formatting & Pure Helpers', () => {
    it('formats FCFA numbers with non-breaking spaces', () => {
      expect(fmt(5000)).toMatch(/5\s000/);
      expect(fmt(120000)).toMatch(/120\s000/);
      expect(fmtS(25000)).toMatch(/\+25\s000/);
      expect(fmtS(-15000)).toMatch(/−15\s000/);
    });

    it('generates 10-char household codes without ambiguous characters', () => {
      const code = generateHouseholdCode();
      expect(code).toHaveLength(10);
      expect(code).toMatch(/^[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{10}$/);
      expect(code).not.toMatch(/[01IO]/);
    });

    it('calculates custom month start days properly', () => {
      // If monthStartDay is 25:
      // Sept 24 belongs to Sept
      // Sept 25 belongs to Oct cycle
      expect(getBudgetMonthForDate('2026-09-24', 25)).toBe('2026-09');
      expect(getBudgetMonthForDate('2026-09-25', 25)).toBe('2026-10');
      // If monthStartDay is 1: normal calendar month
      expect(getBudgetMonthForDate('2026-09-25', 1)).toBe('2026-09');
    });
  });

  describe('Budget Math & Epargne Rule', () => {
    const cats = [cat('rev', 'Revenus', 'in'), cat('log', 'Logement'), cat('prov', 'Provisions', 'save')];
    const month: MonthDoc = {
      planCreated: true,
      lines: [
        { id: 'p1', categoryId: 'rev', label: 'Salaire', amount: 500000, origin: 'recurring' },
        { id: 'p2', categoryId: 'log', label: 'Loyer', amount: 150000, origin: 'recurring' },
        { id: 'p3', categoryId: 'prov', label: 'Rentrée scolaire', amount: 50000, origin: 'recurring' },
      ],
      entries: [
        entry({ id: 'e1', t: 'in', amt: 500000, categoryId: 'rev', lineId: 'p1' }),
        entry({ id: 'e2', t: 'out', amt: 150000, categoryId: 'log', lineId: 'p2' }),
        entry({ id: 'e3', t: 'save', amt: 50000, categoryId: 'prov', lineId: 'p3' }),
      ],
    };

    it('counts type save as epargne and NEVER as depense', () => {
      const c = calcMonth(cats, month);
      expect(c.inc).toBe(500000);
      expect(c.out).toBe(150000);
      expect(c.saved).toBe(50000);
      const ranked = rankExpenses([{ categories: cats, month }]);
      expect(ranked.some((r) => r.category?.id === 'prov')).toBe(false);
      expect(ranked[0].amt).toBe(150000);
    });

    it('excludes declined entries from active totals', () => {
      const c = calcMonth(cats, {
        ...month,
        entries: [entry({ id: 'e1', t: 'out', amt: 150000, categoryId: 'log', lineId: 'p2', status: 'declined' })],
      });
      expect(c.out).toBe(0);
    });

    it('computes end-of-month forecast based on pace and remaining days', () => {
      const forecast = computeForecast({ inc: 300000, out: 50000 }, '2026-09');
      expect(forecast.dailyPace).toBeGreaterThan(0);
    });
  });

  describe('One-line Quick Parser', () => {
    const cats = [cat('det', 'Dettes')];
    const month: MonthDoc = {
      lines: [{ id: 'l-beurre', categoryId: 'det', label: 'Beurre', amount: 5000, origin: 'oneoff' }],
      entries: [],
    };

    it('parses quick entries with amount prefixes and matches the month line', () => {
      const p = parseQuick('5000 beurre', month, cats);
      expect(p.type).toBe('out');
      expect(p.amt).toBe(5000);
      expect(p.label).toBe('Beurre');
      expect(p.line?.id).toBe('l-beurre');
    });

    it('auto-switches to income on keywords like salaire', () => {
      const p = parseQuick('150000 salaire');
      expect(p.type).toBe('in');
      expect(p.amt).toBe(150000);
    });

    it('respects sign prefixes', () => {
      const p = parseQuick('+25000 prime');
      expect(p.type).toBe('in');
      expect(p.amt).toBe(25000);
    });

    it('writes month names with the right French elision', () => {
      expect(deMonth('2026-10')).toBe('d’octobre');
      expect(deMonth('2026-09')).toBe('de septembre');
    });
  });

  describe('Mobile Money SMS Parser & All 12 Fixtures', () => {
    it('correctly parses all 12 MTN and Orange fixtures', () => {
      MOMO_FIXTURES.forEach((fixture) => {
        const res = parseMomoSMS(fixture.sms);
        expect(res.operator).toBe(fixture.operator);
        expect(res.type).toBe(fixture.type);
        expect(res.amount).toBe(fixture.expected.amount);

        if (fixture.expected.fee !== undefined) {
          expect(res.fee).toBe(fixture.expected.fee);
        }
        if (fixture.expected.ref) {
          expect(res.ref).toBe(fixture.expected.ref);
        }
        if (fixture.expected.balanceAfter) {
          expect(res.balanceAfter).toBe(fixture.expected.balanceAfter);
        }
      });
    });

    it('detects duplicate SMS by transaction ID', () => {
      const existingEntries: Entry[] = [
        {
          id: '1',
          d: '2026-09-30',
          ts: 1,
          t: 'out',
          amt: 25000,
          categoryId: null,
          lineId: null,
          label: 'Cabrel',
          w: 'momo',
          ref: '18274910283',
        },
      ];

      const res = parseMomoSMS(MOMO_FIXTURES[0].sms, existingEntries);
      expect(res.isDuplicate).toBe(true);
    });
  });

  describe('French Voice & Number Words Parser', () => {
    it('parses French complex number words', () => {
      expect(parseFrenchNumberWords('cinq mille')).toBe(5000);
      expect(parseFrenchNumberWords('dix mille cinq cents')).toBe(10500);
      expect(parseFrenchNumberWords('cent vingt mille')).toBe(120000);
      expect(parseFrenchNumberWords('soixante-dix')).toBe(70);
      expect(parseFrenchNumberWords('quatre-vingts')).toBe(80);
      expect(parseFrenchNumberWords('quatre-vingt-dix')).toBe(90);
      expect(parseFrenchNumberWords('deux mille deux cents')).toBe(2200);
      expect(parseFrenchNumberWords('un million')).toBe(1000000);
      expect(parseFrenchNumberWords('5 mille')).toBe(5000);
      expect(parseFrenchNumberWords('5k')).toBe(5000);
    });

    it('parses spoken phrases into voice budget entries', () => {
      const v1 = parseVoiceTranscript('cinq mille beurre');
      expect(v1.amount).toBe(5000);
      expect(v1.label.toLowerCase()).toContain('beurre');
      expect(v1.type).toBe('out');

      const v2 = parseVoiceTranscript('cent vingt mille scolarite hier');
      expect(v2.amount).toBe(120000);
      expect(v2.label.toLowerCase()).toContain('scolarite');

      const v3 = parseVoiceTranscript("j'ai reçu cent cinquante mille salaire");
      expect(v3.amount).toBe(150000);
      expect(v3.type).toBe('in');
    });
  });
});
