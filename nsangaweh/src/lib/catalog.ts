/**
 * Choices offered to the user when creating a rubric. Nothing here drives
 * app logic: rubrics are user data, these are only picker options and
 * suggestions the user can accept, rename or ignore.
 */
import { CategoryKind } from './types';

/** 12 colours for rubrics. */
export const PALETTE = [
  '#0B6E4F',
  '#12A150',
  '#0D9488',
  '#2563EB',
  '#4F46E5',
  '#7C3AED',
  '#DB2777',
  '#E11D48',
  '#DC2626',
  '#EA580C',
  '#D97706',
  '#475569',
] as const;

/** Lucide icon names offered in the icon picker (about 40). */
export const ICON_NAMES = [
  'House',
  'Building2',
  'Zap',
  'Droplets',
  'Flame',
  'ShoppingCart',
  'ShoppingBasket',
  'UtensilsCrossed',
  'Coffee',
  'Bike',
  'Car',
  'Bus',
  'Fuel',
  'GraduationCap',
  'School',
  'BookOpen',
  'Baby',
  'HeartPulse',
  'Pill',
  'Stethoscope',
  'HeartHandshake',
  'Users',
  'Phone',
  'Smartphone',
  'Wifi',
  'PiggyBank',
  'Landmark',
  'Receipt',
  'CreditCard',
  'Wallet',
  'Banknote',
  'HandCoins',
  'Church',
  'Gift',
  'PartyPopper',
  'Gamepad2',
  'Shirt',
  'Scissors',
  'Wrench',
  'Plane',
  'Sprout',
  'Briefcase',
  'Sparkles',
  'Percent',
  'Shapes',
] as const;

export type IconName = (typeof ICON_NAMES)[number];

export interface RubricSuggestion {
  name: string;
  icon: IconName;
  color: string;
  kind: CategoryKind;
  /** Words that hint a pasted line belongs to this rubric (importer only). */
  keywords: string[];
}

/** Suggested rubrics for "Choisir des rubriques". All optional, all renamable. */
export const SUGGESTED_RUBRICS: RubricSuggestion[] = [
  {
    name: 'Logement',
    icon: 'House',
    color: '#2563EB',
    kind: 'out',
    keywords: ['loyer', 'eau', 'electricite', 'courant', 'eneo', 'camwater', 'gaz', 'menage', 'maison'],
  },
  {
    name: 'Alimentation',
    icon: 'ShoppingBasket',
    color: '#EA580C',
    kind: 'out',
    keywords: ['marche', 'nourriture', 'repas', 'dejeuner', 'riz', 'huile', 'beurre', 'pain', 'courses'],
  },
  {
    name: 'Transport',
    icon: 'Bike',
    color: '#D97706',
    kind: 'out',
    keywords: ['transport', 'moto', 'taxi', 'carburant', 'essence', 'bus', 'pousse', 'reparation'],
  },
  {
    name: 'Santé',
    icon: 'HeartPulse',
    color: '#DC2626',
    kind: 'out',
    keywords: ['sante', 'remede', 'medicament', 'hopital', 'consultation', 'pharmacie'],
  },
  {
    name: 'Enfants et école',
    icon: 'GraduationCap',
    color: '#7C3AED',
    kind: 'out',
    keywords: ['ecole', 'scolarite', 'fournitures', 'enfant', 'enfants', 'cantine', 'uniforme', 'rentree'],
  },
  {
    name: 'Soutien à la famille',
    icon: 'HeartHandshake',
    color: '#E11D48',
    kind: 'out',
    keywords: ['maman', 'papa', 'famille', 'soutien', 'parents', 'village'],
  },
  {
    name: 'Communication',
    icon: 'Smartphone',
    color: '#0D9488',
    kind: 'out',
    keywords: ['credit', 'forfait', 'internet', 'telephone', 'data', 'canal'],
  },
  {
    name: 'Épargne',
    icon: 'PiggyBank',
    color: '#12A150',
    kind: 'save',
    keywords: ['epargne', 'economie', 'reserve', 'provision'],
  },
  {
    name: 'Dettes',
    icon: 'Receipt',
    color: '#4F46E5',
    kind: 'out',
    keywords: ['dette', 'pret', 'remboursement', 'credit a'],
  },
  {
    name: 'Dîme et dons',
    icon: 'Church',
    color: '#0B6E4F',
    kind: 'out',
    keywords: ['dime', 'don', 'offrande', 'eglise', 'mosquee', 'quete'],
  },
  {
    name: 'Loisirs',
    icon: 'PartyPopper',
    color: '#DB2777',
    kind: 'out',
    keywords: ['loisir', 'sortie', 'fete', 'anniversaire', 'cinema', 'vacances'],
  },
  {
    name: 'Autres',
    icon: 'Shapes',
    color: '#475569',
    kind: 'out',
    keywords: [],
  },
];

/** Suggested style for an income rubric the app creates on "Ajouter un revenu". */
export const INCOME_RUBRIC_DEFAULT = { name: 'Revenus', icon: 'Wallet' as IconName, color: '#12A150' };
/** Suggested style for the rubric the Carnet de dettes creates if none is linked yet. */
export const DEBTS_RUBRIC_DEFAULT = { name: 'Dettes', icon: 'Receipt' as IconName, color: '#4F46E5' };
/** Fallback rubric for a one-off line when the user picks "Autres". */
export const OTHER_RUBRIC_DEFAULT = { name: 'Autres', icon: 'Shapes' as IconName, color: '#475569' };
