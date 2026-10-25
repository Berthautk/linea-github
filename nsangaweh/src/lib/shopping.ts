import { matchLine } from './budget-math';
import { parseFrenchNumberWords } from './frenchNumbers';
import { Category, MonthLine, ShoppingItem } from './types';

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim();

const TRANSPORT_WORDS = ['moto', 'taxi', 'bus', 'transport', 'trajet', 'carburant', 'essence', 'benskin', 'clando', 'yango'];

export function isTransportLabel(label: string): boolean {
  const n = norm(label);
  return TRANSPORT_WORDS.some((w) => n.includes(w));
}

/** Pull one amount (digits or French words) out of a short phrase; the rest is the label. */
function splitAmount(segment: string): { label: string; amt: number } {
  const words = segment.split(/\s+/).filter(Boolean);
  // digits anywhere ("tomates 50", "50 tomates", "2k")
  for (let i = words.length - 1; i >= 0; i--) {
    const w = words[i].replace(/ /g, '');
    if (/^\d+(?:[.,]\d+)?\s*(k|m)?$/i.test(w)) {
      const m = w.match(/^(\d+(?:[.,]\d+)?)\s*(k|m)?$/i)!;
      const v = parseFloat(m[1].replace(',', '.'));
      const amt = Math.round(m[2]?.toLowerCase() === 'k' ? v * 1000 : m[2]?.toLowerCase() === 'm' ? v * 1e6 : v);
      return { label: [...words.slice(0, i), ...words.slice(i + 1)].join(' ').trim(), amt };
    }
  }
  // number words at the end ("sel deux cents"), then at the start
  for (let len = Math.min(words.length - 1, 6); len >= 1; len--) {
    const tail = parseFrenchNumberWords(words.slice(-len).join(' '));
    if (tail) return { label: words.slice(0, -len).join(' ').trim(), amt: tail };
  }
  for (let len = Math.min(words.length - 1, 6); len >= 1; len--) {
    const head = parseFrenchNumberWords(words.slice(0, len).join(' '));
    if (head) return { label: words.slice(len).join(' ').trim(), amt: head };
  }
  return { label: segment.trim(), amt: 0 };
}

const cap = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

/**
 * "tomates 50 francs, sel 200 francs et du savon 300" -> three items.
 * An item without an amount keeps 0 so it can be filled in later.
 */
export function parseShoppingTranscript(text: string): Array<{ label: string; amt: number }> {
  const cleaned = text
    .replace(/\b(f\s?cfa|fcfa|xaf|cfa|francs?)\b/gi, '|')
    .replace(/(\d)\s*f\b/gi, '$1|')
    .replace(/[,;.\n]|\bet\b|\bpuis\b|\bensuite\b|\baussi\b/gi, '|');
  return cleaned
    .split('|')
    .map((s) => s.replace(/\b(du|de la|des|de l'|d'|un|une|le|la|les|l')\s*/gi, ' ').replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .map(splitAmount)
    .filter((x) => x.label || x.amt)
    .map((x) => ({ label: cap(x.label || 'Achat'), amt: x.amt }));
}

/** Best rubric for a purchase: a matching line first, then a rubric whose name fits, else none. */
export function guessCategory(
  label: string,
  kindOfItem: ShoppingItem['kind'],
  categories: Category[],
  lines: MonthLine[]
): { categoryId: string | null; lineId: string | null } {
  const out = categories.filter((c) => !c.archived && c.kind === 'out');
  const line = matchLine(label, lines.filter((l) => out.some((c) => c.id === l.categoryId)), categories);
  if (line) return { categoryId: line.categoryId, lineId: line.id };
  const byName = (words: string[]) => out.find((c) => words.some((w) => norm(c.name).includes(w)));
  if (kindOfItem === 'transport' || isTransportLabel(label)) {
    const c = byName(['transport', 'deplacement', 'moto', 'carburant']);
    if (c) return { categoryId: c.id, lineId: null };
  }
  const direct = out.find((c) => norm(label).includes(norm(c.name)) || norm(c.name).includes(norm(label)));
  if (direct && norm(label).length >= 3) return { categoryId: direct.id, lineId: null };
  if (kindOfItem === 'item' && !isTransportLabel(label)) {
    const c = byName(['aliment', 'repas', 'nourriture', 'cuisine', 'marche', 'course', 'manger']);
    if (c) return { categoryId: c.id, lineId: null };
  }
  return { categoryId: null, lineId: null };
}
