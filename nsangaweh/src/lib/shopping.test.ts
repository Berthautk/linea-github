import { describe, expect, it } from 'vitest';
import { guessCategory, parseShoppingTranscript } from './shopping';
import { Category, MonthLine } from './types';

describe('courses : dictée', () => {
  it('lit plusieurs achats avec montants en chiffres', () => {
    expect(parseShoppingTranscript('tomates 50 francs, sel 200 francs et savon 300')).toEqual([
      { label: 'Tomates', amt: 50 },
      { label: 'Sel', amt: 200 },
      { label: 'Savon', amt: 300 },
    ]);
  });
  it('lit les montants en lettres et sans virgule', () => {
    const r = parseShoppingTranscript('oignons deux cents francs poisson mille cinq cents francs');
    expect(r.map((x) => x.amt)).toEqual([200, 1500]);
  });
  it('garde un achat sans montant', () => {
    expect(parseShoppingTranscript('piment')).toEqual([{ label: 'Piment', amt: 0 }]);
  });
});

const cat = (id: string, name: string): Category =>
  ({ id, name, icon: 'Shapes', color: '#000', order: 0, kind: 'out', budgetMode: 'lines', createdAt: 0 }) as Category;

describe('courses : rubrique proposée', () => {
  const cats = [cat('a', 'Alimentation'), cat('t', 'Transport')];
  const lines: MonthLine[] = [];
  it('moto va dans Transport, le reste dans Alimentation', () => {
    expect(guessCategory('Moto', 'transport', cats, lines).categoryId).toBe('t');
    expect(guessCategory('Tomates', 'item', cats, lines).categoryId).toBe('a');
  });
  it('sans rubrique adaptée : aucune', () => {
    expect(guessCategory('Tomates', 'item', [cat('x', 'Loyer')], lines).categoryId).toBeNull();
  });
});
