import { describe, expect, it } from 'vitest';
import { parseFrenchNumberWords, parseVoiceTranscript } from './frenchNumbers';

describe('frenchNumbers', () => {
  describe('parseFrenchNumberWords', () => {
    it('parses small numbers correctly', () => {
      expect(parseFrenchNumberWords('cinq')).toBe(5);
      expect(parseFrenchNumberWords('dix')).toBe(10);
      expect(parseFrenchNumberWords('quinze')).toBe(15);
      expect(parseFrenchNumberWords('vingt')).toBe(20);
    });

    it('parses compound French numbers (70, 80, 90)', () => {
      expect(parseFrenchNumberWords('soixante-dix')).toBe(70);
      expect(parseFrenchNumberWords('quatre-vingts')).toBe(80);
      expect(parseFrenchNumberWords('quatre-vingt-dix')).toBe(90);
    });

    it('parses hundreds and thousands', () => {
      expect(parseFrenchNumberWords('cinq cents')).toBe(500);
      expect(parseFrenchNumberWords('cinq mille')).toBe(5000);
      expect(parseFrenchNumberWords('dix mille cinq cents')).toBe(10500);
      expect(parseFrenchNumberWords('vingt-cinq mille')).toBe(25000);
      expect(parseFrenchNumberWords('cent vingt mille')).toBe(120000);
    });

    it('parses shorthand expressions', () => {
      expect(parseFrenchNumberWords('5k')).toBe(5000);
      expect(parseFrenchNumberWords('25k')).toBe(25000);
      expect(parseFrenchNumberWords('1.5m')).toBe(1500000);
    });

    it('returns null for non-numeric phrases', () => {
      expect(parseFrenchNumberWords('pain beurre')).toBe(null);
      expect(parseFrenchNumberWords('')).toBe(null);
    });
  });

  describe('parseVoiceTranscript', () => {
    it('parses standard spoken expense phrase: "cinq mille taxi"', () => {
      const res = parseVoiceTranscript('cinq mille taxi');
      expect(res.amount).toBe(5000);
      expect(res.label.toLowerCase()).toContain('taxi');
      expect(res.type).toBe('out');
    });

    it('parses "j\'ai payé vingt-cinq mille scolarité"', () => {
      const res = parseVoiceTranscript("j'ai paye vingt-cinq mille scolarite");
      expect(res.amount).toBe(25000);
      expect(res.label.toLowerCase()).toContain('scolarite');
      expect(res.type).toBe('out');
    });

    it('parses spoken income phrase: "j\'ai reçu cinquante mille salaire"', () => {
      const res = parseVoiceTranscript("j'ai recu cinquante mille salaire");
      expect(res.amount).toBe(50000);
      expect(res.type).toBe('in');
    });

    it('detects "hier" date keyword', () => {
      const res = parseVoiceTranscript('hier dix mille courses');
      expect(res.amount).toBe(10000);
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const pad = (n: number) => (n < 10 ? '0' : '') + n;
      const expectedDate = `${yesterday.getFullYear()}-${pad(yesterday.getMonth() + 1)}-${pad(yesterday.getDate())}`;
      expect(res.dateStr).toBe(expectedDate);
    });
  });
});
