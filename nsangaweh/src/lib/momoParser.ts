import { Entry } from './types';

export type MomoType =
  | 'envoi'
  | 'retrait'
  | 'paiement'
  | 'reception'
  | 'depot'
  | 'recharge'
  | 'autre';

export type MomoOperator = 'MTN' | 'Orange' | 'Inconnu';

export interface ParsedMomoSMS {
  raw: string;
  operator: MomoOperator;
  type: MomoType;
  direction: 'in' | 'out';
  amount: number | null;
  fee: number | null;
  who: string | null;
  ref: string | null;
  balanceAfter: number | null;
  date: string; // YYYY-MM-DD
  confidence: number; // 0 - 100
  isDuplicate?: boolean;
}

/**
 * Clean amount text like "25 000", "50.000", "17,500", "12500 FCFA", "175 XAF"
 */
export function cleanMomoAmount(str: string): number | null {
  if (!str) return null;
  // If format is like 50.000 or 17,500 with 3 digits at end, treat dot/comma as thousands separator
  let s = str.replace(/[^\d.,]/g, '').trim();
  if (/^\d{1,3}[.,]\d{3}$/.test(s)) {
    s = s.replace(/[.,]/g, '');
  } else {
    // general thousands separator removal
    s = s.replace(/\s+/g, '').replace(/,/g, '').replace(/\./g, '');
  }
  const val = parseInt(s, 10);
  return isNaN(val) ? null : val;
}

/**
 * Parse an incoming SMS message on-device
 */
export function parseMomoSMS(smsText: string, existingEntries: Entry[] = []): ParsedMomoSMS {
  const text = (smsText || '').trim();
  const lower = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  // 1. Detect Operator
  let operator: MomoOperator = 'Inconnu';
  if (
    lower.includes('momo') ||
    lower.includes('mtn') ||
    lower.includes('yello') ||
    lower.includes('txid') ||
    lower.includes('financial transaction') ||
    /67\d{7}/.test(text)
  ) {
    operator = 'MTN';
  } else if (
    lower.includes('orange') ||
    lower.includes(' om ') ||
    lower.includes('solde om') ||
    /\bom[-_0-9]/i.test(text) ||
    /69\d{7}/.test(text)
  ) {
    operator = 'Orange';
  }

  // 2. Detect Operation Type and Direction
  let type: MomoType = 'autre';
  let direction: 'in' | 'out' = 'out';

  if (
    lower.includes('vous avez recu') ||
    lower.includes('recu un transfert') ||
    lower.includes('cash in') ||
    lower.includes('deposited by') ||
    lower.includes('depot effectue')
  ) {
    if (lower.includes('cash in') || lower.includes('deposited by') || lower.includes('depot')) {
      type = 'depot';
    } else {
      type = 'reception';
    }
    direction = 'in';
  } else if (
    lower.includes('retrait') ||
    lower.includes('cash out') ||
    lower.includes('retire') ||
    lower.includes('withdrew')
  ) {
    type = 'retrait';
    direction = 'out';
  } else if (
    lower.includes('paiement') ||
    lower.includes('payes a') ||
    lower.includes('bill payment') ||
    lower.includes('achat marchand')
  ) {
    type = 'paiement';
    direction = 'out';
  } else if (
    lower.includes('recharge') ||
    lower.includes('achat de credit') ||
    lower.includes('airtime')
  ) {
    type = 'recharge';
    direction = 'out';
  } else if (
    lower.includes('envoy') ||
    lower.includes('transfer') ||
    lower.includes('sent')
  ) {
    type = 'envoi';
    direction = 'out';
  }

  // 3. Extract Amount
  let amount: number | null = null;
  // Regex looking for amounts before or after keywords
  const amtPatterns = [
    /(?:envoye|recu|retire|payes?\s*a|transfere|transferred|withdrew|recharge\s*reussie\s*de|cash\s*in\s*successful\.?)\s*([0-9\s.,]+)\s*(?:fcfa|f|xaf)/i,
    /([0-9\s.,]+)\s*(?:fcfa|xaf)\s*(?:transferred|payes|deposited|a|de|pour)/i,
    /([0-9\s.,]+)\s*(?:fcfa|xaf)/i,
  ];

  for (const pat of amtPatterns) {
    const m = text.match(pat);
    if (m && m[1]) {
      const parsed = cleanMomoAmount(m[1]);
      if (parsed !== null && parsed > 0) {
        amount = parsed;
        break;
      }
    }
  }

  // 4. Extract Fee
  let fee: number | null = null;
  const feeMatch = text.match(/(?:frais|fee)[:\s]*([0-9\s.,]+)\s*(?:fcfa|f|xaf)?/i);
  if (feeMatch && feeMatch[1]) {
    fee = cleanMomoAmount(feeMatch[1]);
  }

  // 5. Extract Recipient or Sender
  let who: string | null = null;
  const whoPatterns = [
    /(?:a|to)\s+([A-Z0-9\s\.\-_]+?)(?:\s*\(\d+\)|\.|\,\s*Frais|\s*Fee|\s*Tx|\s*Nouveau|\s*ID)/i,
    /(?:de|from)\s+([A-Z0-9\s\.\-_]+?)(?:\s*\(\d+\)|\.|\,\s*Frais|\s*Votre|\s*Ref|\s*New|\s*ID)/i,
    /(?:chez)\s+([A-Z0-9\s\.\-_]+?)(?:\.|\,\s*Frais|\s*Votre|\s*Ref)/i,
  ];

  for (const pat of whoPatterns) {
    const m = text.match(pat);
    if (m && m[1]) {
      const candidate = m[1].trim();
      if (
        candidate.length > 2 &&
        !/^(fcfa|xaf|agent|nouveau|solde|un|le|la)$/i.test(candidate)
      ) {
        who = candidate;
        break;
      }
    }
  }

  // 6. Extract Transaction Reference / ID
  let ref: string | null = null;
  const refPatterns = [
    /(?:ID transaction|TxID|Txn ID|Transaction ID|Ref transaction|Ref|Financial Transaction Id)[:\s]*([A-Za-z0-9\.\-_]+)/i,
    /(?:Ref:\s*)([A-Za-z0-9\.\-_]+)/i,
  ];

  for (const pat of refPatterns) {
    const m = text.match(pat);
    if (m && m[1]) {
      ref = m[1].trim().replace(/\.$/, '');
      break;
    }
  }

  // 7. Extract Balance After
  let balanceAfter: number | null = null;
  const balPatterns = [
    /(?:Votre\s+)?(?:nouveau\s+)?solde(?:\s+est\s+de|\s+restant|\s+momo|\s+om)?[:\s]+([0-9\s.,]+)\s*(?:fcfa|f|xaf)?/i,
    /(?:New\s+Balance|Balance)[:\s]+([0-9\s.,]+)\s*(?:fcfa|f|xaf)?/i,
  ];
  for (const bp of balPatterns) {
    const m = text.match(bp);
    if (m && m[1]) {
      const parsed = cleanMomoAmount(m[1]);
      if (parsed !== null) {
        balanceAfter = parsed;
        break;
      }
    }
  }

  // 8. Confidence Calculation
  let confidence = 0;
  if (operator !== 'Inconnu') confidence += 20;
  if (type !== 'autre') confidence += 25;
  if (amount !== null && amount > 0) confidence += 35;
  if (ref) confidence += 10;
  if (who || fee !== null) confidence += 10;

  // 9. Check Duplicates
  let isDuplicate = false;
  if (ref && existingEntries && existingEntries.length > 0) {
    isDuplicate = existingEntries.some((e) => e.ref && e.ref.toLowerCase() === ref?.toLowerCase());
  }

  const today = new Date().toISOString().slice(0, 10);

  return {
    raw: text,
    operator,
    type,
    direction,
    amount,
    fee,
    who,
    ref,
    balanceAfter,
    date: today,
    confidence: Math.min(100, confidence),
    isDuplicate,
  };
}
