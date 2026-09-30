import { norm } from './budget-math';
import { Category } from './types';

export const MAX_NAME_LENGTH = 40;
export const MAX_AMOUNT = 999_999_999;

/** Normalised key for comparing names: lowercase, no accents, single spaces. */
export function nameKey(s: string): string {
  return norm(s || '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/** Trim, collapse spaces and cut to 40 characters. */
export function cleanName(s: string): string {
  return (s || '').replace(/\s+/g, ' ').trim().slice(0, MAX_NAME_LENGTH);
}

export type ValidationResult<T> = { ok: true; value: T } | { ok: false; error: string };

export function validateName(raw: string, what = 'Le nom'): ValidationResult<string> {
  const value = cleanName(raw);
  if (!value) return { ok: false, error: `${what} est obligatoire.` };
  return { ok: true, value };
}

/**
 * A rubric name must be unique for the member (case- and accent-insensitive).
 * Archived rubrics count too, so restoring one never creates a duplicate.
 */
export function validateCategoryName(
  raw: string,
  categories: Category[],
  excludeId?: string
): ValidationResult<string> {
  const base = validateName(raw, 'Le nom de la rubrique');
  if (!base.ok) return base;
  const key = nameKey(base.value);
  const dup = categories.find((c) => c.id !== excludeId && nameKey(c.name) === key);
  if (dup) {
    return {
      ok: false,
      error: dup.archived
        ? `Une rubrique archivée s’appelle déjà « ${dup.name} ». Restaurez-la dans Réglages ou choisissez un autre nom.`
        : `Vous avez déjà une rubrique « ${dup.name} ». Choisissez un autre nom.`,
    };
  }
  return base;
}

/** Amounts are non-negative integers up to 999 999 999. Null means "sans montant". */
export function validateAmount(
  input: string | number | null | undefined,
  allowNull = true
): ValidationResult<number | null> {
  if (input === null || input === undefined || input === '') {
    return allowNull ? { ok: true, value: null } : { ok: false, error: 'Indiquez un montant.' };
  }
  const n = typeof input === 'number' ? input : Number(String(input).replace(/[\s  ]/g, ''));
  if (!Number.isFinite(n) || !Number.isInteger(n)) {
    return { ok: false, error: 'Le montant doit être un nombre entier de francs.' };
  }
  if (n < 0) return { ok: false, error: 'Le montant ne peut pas être négatif.' };
  if (n > MAX_AMOUNT) return { ok: false, error: 'Montant trop grand (maximum 999 999 999 F).' };
  return { ok: true, value: n };
}

/** Clamp any number into a valid stored amount (used when converting old data). */
export function clampAmount(n: unknown): number {
  const v = typeof n === 'number' && Number.isFinite(n) ? Math.round(n) : 0;
  return Math.min(MAX_AMOUNT, Math.max(0, v));
}
