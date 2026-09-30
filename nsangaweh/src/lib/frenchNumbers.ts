import { EntryType } from './types';

const SMALL_NUMBERS: Record<string, number> = {
  zero: 0,
  un: 1,
  une: 1,
  deux: 2,
  trois: 3,
  quatre: 4,
  cinq: 5,
  six: 6,
  sept: 7,
  huit: 8,
  neuf: 9,
  dix: 10,
  onze: 11,
  douze: 12,
  treize: 13,
  quatorze: 14,
  quinze: 15,
  seize: 16,
  'dix-sept': 17,
  'dix-huit': 18,
  'dix-neuf': 19,
  vingt: 20,
  vingts: 20,
  trente: 30,
  quarante: 40,
  cinquante: 50,
  soixante: 60,
};

/**
 * Normalise French words (lowercase, strip accents, replace hyphens)
 */
function cleanWord(w: string): string {
  return w
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Parses a sequence of French number words into an integer.
 * STRICT: Only returns a number if ALL words in wordsStr are recognized number parts!
 */
export function parseFrenchNumberWords(wordsStr: string): number | null {
  if (!wordsStr) return null;

  // Handle shorthand like "5k" or "5 mille" or "1.5m"
  const kShorthand = wordsStr.match(/^(\d+(?:[.,]\d+)?)\s*(?:k|mille)$/i);
  if (kShorthand) {
    const val = parseFloat(kShorthand[1].replace(',', '.'));
    return Math.round(val * 1000);
  }

  const mShorthand = wordsStr.match(/^(\d+(?:[.,]\d+)?)\s*(?:m|million|millions)$/i);
  if (mShorthand) {
    const val = parseFloat(mShorthand[1].replace(',', '.'));
    return Math.round(val * 1000000);
  }

  const rawTokens = wordsStr
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/-/g, ' ')
    .split(/\s+/)
    .filter((w) => w && w !== 'et');

  if (rawTokens.length === 0) return null;

  let total = 0;
  let currentGroup = 0;

  for (let i = 0; i < rawTokens.length; i++) {
    const tok = rawTokens[i];

    // Direct numeric digits
    if (/^\d+$/.test(tok)) {
      currentGroup += parseInt(tok, 10);
      continue;
    }

    if (tok === 'million' || tok === 'millions') {
      const mult = currentGroup === 0 ? 1 : currentGroup;
      total += mult * 1_000_000;
      currentGroup = 0;
      continue;
    }

    if (tok === 'mille' || tok === 'k') {
      const mult = currentGroup === 0 ? 1 : currentGroup;
      total += mult * 1_000;
      currentGroup = 0;
      continue;
    }

    if (tok === 'cent' || tok === 'cents') {
      const mult = currentGroup === 0 ? 1 : currentGroup;
      currentGroup = mult * 100;
      continue;
    }

    const nextTok = rawTokens[i + 1] ? rawTokens[i + 1].replace(/s$/, '') : '';
    const nextNextTok = rawTokens[i + 2] ? rawTokens[i + 2].replace(/s$/, '') : '';

    if (tok === 'quatre' && (nextTok === 'vingt' || nextTok === 'vingts')) {
      i++; // skip 'vingt(s)'
      if (nextNextTok === 'dix') {
        i++; // skip 'dix'
        currentGroup += 90;
      } else {
        currentGroup += 80;
      }
      continue;
    }

    if (tok === 'soixante' && nextTok === 'dix') {
      i++; // skip 'dix'
      currentGroup += 70;
      continue;
    }

    const normTok = tok.replace(/s$/, '');
    if (SMALL_NUMBERS[tok] !== undefined) {
      currentGroup += SMALL_NUMBERS[tok];
      continue;
    }
    if (SMALL_NUMBERS[normTok] !== undefined) {
      currentGroup += SMALL_NUMBERS[normTok];
      continue;
    }

    // Unrecognized word inside candidate sequence -> Invalid number sequence
    return null;
  }

  total += currentGroup;
  return total > 0 ? total : null;
}

export interface VoiceParsedEntry {
  rawTranscript: string;
  amount: number | null;
  type: EntryType;
  label: string;
  dateStr: string; // YYYY-MM-DD
}

/**
 * Parses spoken French voice transcript into structured budget entry
 */
export function parseVoiceTranscript(transcript: string): VoiceParsedEntry {
  const text = transcript.trim();
  const lower = cleanWord(text);

  // 1. Detect date
  const now = new Date();
  let dateObj = new Date();
  if (lower.includes('avant-hier') || lower.includes('avant hier')) {
    dateObj.setDate(now.getDate() - 2);
  } else if (lower.includes('hier')) {
    dateObj.setDate(now.getDate() - 1);
  }
  const pad = (n: number) => (n < 10 ? '0' : '') + n;
  const dateStr = `${dateObj.getFullYear()}-${pad(dateObj.getMonth() + 1)}-${pad(dateObj.getDate())}`;

  // 2. Detect type
  let type: EntryType = 'out';
  if (
    lower.includes('entree') ||
    lower.includes('recu') ||
    lower.includes("j'ai recu") ||
    lower.includes('salaire') ||
    lower.includes('gain') ||
    lower.includes('virement')
  ) {
    type = 'in';
  } else if (
    lower.includes('epargne') ||
    lower.includes('provision') ||
    lower.includes('mettre de cote')
  ) {
    type = 'save';
  }

  // 3. Remove date and intent words to parse amount and label
  const cleaned = text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents for easier regex
    .replace(/\b(hier|avant-hier|avant hier|aujourd'hui|ce jour)\b/gi, '')
    .replace(/\b(j'ai paye|j'ai recu|j'ai envoye|payer|depense|entree|sortie|mettre de cote)\b/gi, '')
    .replace(/\b(fcfa|f|xaf|francs?)\b/gi, '')
    .trim();

  const words = cleaned.split(/\s+/).filter(Boolean);
  let amount: number | null = null;
  let labelWords: string[] = [];

  // Try parsing from words.length down to 1
  for (let len = words.length; len >= 1; len--) {
    const candidateNumberStr = words.slice(0, len).join(' ');
    const parsed = parseFrenchNumberWords(candidateNumberStr);
    if (parsed !== null && parsed > 0) {
      amount = parsed;
      labelWords = words.slice(len);
      break;
    }
  }

  // Fallback: check if first word is digits (e.g. "5000 beurre")
  if (amount === null && words.length > 0) {
    const directDigits = words[0].replace(/[^\d]/g, '');
    if (directDigits) {
      amount = parseInt(directDigits, 10);
      labelWords = words.slice(1);
    }
  }

  const label = labelWords.join(' ').trim() || (type === 'in' ? 'Revenu' : 'Dépense');

  return {
    rawTranscript: text,
    amount,
    type,
    label,
    dateStr,
  };
}
