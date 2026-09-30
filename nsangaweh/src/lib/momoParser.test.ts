import { describe, expect, it } from 'vitest';
import { MOMO_FIXTURES } from './momoParser.fixtures';
import { cleanMomoAmount, parseMomoSMS } from './momoParser';

describe('momoParser', () => {
  it('cleans amounts correctly across different representations', () => {
    expect(cleanMomoAmount('25 000 FCFA')).toBe(25000);
    expect(cleanMomoAmount('50.000')).toBe(50000);
    expect(cleanMomoAmount('12,500')).toBe(12500);
    expect(cleanMomoAmount('500')).toBe(500);
    expect(cleanMomoAmount('')).toBe(null);
  });

  describe('Fixtures validation', () => {
    MOMO_FIXTURES.forEach((fixture) => {
      it(`parses fixture: ${fixture.id}`, () => {
        const parsed = parseMomoSMS(fixture.sms);
        expect(parsed.operator).toBe(fixture.operator);
        expect(parsed.amount).toBe(fixture.expected.amount);

        if (fixture.expected.fee !== undefined) {
          expect(parsed.fee).toBe(fixture.expected.fee);
        }
        if (fixture.expected.ref) {
          expect(parsed.ref).toBe(fixture.expected.ref);
        }
        if (fixture.expected.who) {
          expect(parsed.who?.toUpperCase()).toContain(fixture.expected.who.toUpperCase());
        }
        if (fixture.expected.balanceAfter !== undefined) {
          expect(parsed.balanceAfter).toBe(fixture.expected.balanceAfter);
        }
      });
    });
  });

  it('detects duplicate SMS references', () => {
    const existing = [
      {
        id: 'e1',
        d: '2026-09-30',
        ts: Date.now(),
        t: 'out' as const,
        amt: 25000,
        p: null,
        w: 'w-momo',
        l: 'Envoi Cabrel',
        ref: '18274910283',
      },
    ];

    const parsed = parseMomoSMS(
      'Transfert effectue avec succes. Vous avez envoye 25 000 FCFA a CABREL KAMGA. ID transaction: 18274910283.',
      existing
    );
    expect(parsed.isDuplicate).toBe(true);
  });
});
