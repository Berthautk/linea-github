export type EntryType = 'in' | 'out' | 'save' | 'transfer';
export type EntrySource = 'manual' | 'sms' | 'voice' | 'recurring';
export type ApprovalStatus = 'pending' | 'approved' | 'declined';

/* ------------------------------------------------------------------ */
/* Dynamic budget structure: every rubric and line is user data.       */
/* ------------------------------------------------------------------ */

export type CategoryKind = 'out' | 'in' | 'save';
export type BudgetMode = 'lines' | 'envelope';

/** A rubric ("Logement", "Revenus"...), created, renamed and deleted by the user. */
export interface Category {
  id: string;
  name: string;
  icon: string; // Lucide icon name from ICON_CHOICES
  color: string; // one of PALETTE
  order: number;
  kind: CategoryKind;
  budgetMode: BudgetMode;
  envelopeAmount?: number | null; // default envelope for new months
  archived: boolean;
  createdAt: number;
  linkedTo?: 'debts'; // fed by the Carnet de dettes
}

export type Recurrence =
  | { kind: 'once'; month: string }
  | { kind: 'monthly'; startMonth?: string; endMonth?: string }
  | { kind: 'everyNMonths'; n: number; startMonth: string; endMonth?: string }
  | { kind: 'months'; months: number[]; startMonth?: string; endMonth?: string }
  | { kind: 'yearly'; month: number; startMonth?: string; endMonth?: string };

/** A budget line template. Month plans are generated from active items. */
export interface BudgetItem {
  id: string;
  categoryId: string;
  label: string;
  amount: number | null; // null = "sans montant fixé"
  recurrence: Recurrence;
  active: boolean;
  order: number;
  archived: boolean;
  note?: string;
  remind?: boolean;
}

export type LineOrigin = 'recurring' | 'oneoff' | 'manual' | 'debt';

/** What the user sees in a given month. Independent from other months. */
export interface MonthLine {
  id: string;
  itemId?: string;
  categoryId: string;
  label: string;
  amount: number | null;
  origin: LineOrigin;
  note?: string;
  order?: number;
  archived?: boolean; // deleted but kept because entries reference it
  debtId?: string;
  remind?: boolean;
}

export interface Entry {
  id: string;
  d: string; // YYYY-MM-DD
  ts: number; // timestamp ms
  t: EntryType; // 'transfer' is a move between wallets, never spending
  amt: number; // integer FCFA
  categoryId: string | null;
  lineId: string | null;
  label: string; // snapshot for history
  w: string; // wallet id
  toW?: string; // destination wallet for transfers
  fee?: number;
  ref?: string;
  who?: string;
  src?: EntrySource;
  status?: ApprovalStatus;
  declinedBy?: string;
  approvedAt?: number;
  debtId?: string;
  provisionId?: string;
  goalId?: string;
}

export interface MonthDoc {
  lines: MonthLine[];
  entries: Entry[];
  envelopes?: Record<string, number | null>; // categoryId -> amount for this month
  planCreated?: boolean;
  createdAt?: number;
  fromTemplate?: boolean;
  updated?: number;
}

export interface MemberBudget {
  categories: Category[];
  items: BudgetItem[];
  debts: Debt[];
  commitments: Commitment[];
  months: Record<string, MonthDoc>;
}

/* Old storage format (before the dynamic model), kept for migration only. */
export interface LegacyPlanLine {
  id: string;
  g: string;
  l: string;
  a: number;
  t: 'in' | 'out' | 'save';
  commitmentId?: string;
  provisionId?: string;
}

export interface LegacyEntry {
  id: string;
  d: string;
  ts: number;
  t: 'in' | 'out' | 'save';
  amt: number;
  p: string | null;
  l: string;
  w: string;
  [key: string]: unknown;
}

export interface LegacyMonthData {
  plan: LegacyPlanLine[];
  entries: LegacyEntry[];
  updated?: number;
  seeded?: boolean;
}

export interface Wallet {
  id: string;
  name: string;
  type: 'cash' | 'momo' | 'om' | 'bank' | 'other';
  color: string;
  icon: string;
  initialBalance: number;
  hidden?: boolean;
}

export interface DebtPayment {
  id: string;
  date: string;
  amt: number;
  note?: string;
}

export interface Debt {
  id: string;
  person: string;
  phone?: string;
  direction: 'i_owe' | 'they_owe'; // 'Je dois' | 'On me doit'
  principal: number; // initial amount
  createdAt: string; // YYYY-MM-DD
  dueDate?: string; // YYYY-MM-DD
  note?: string;
  payments: DebtPayment[];
  shared?: boolean;
  status: 'active' | 'settled';
}

export interface Commitment {
  id: string;
  label: string;
  categoryId: string;
  itemId?: string;
  amount: number;
  dayOfMonth: number; // 1-28
  wallet: string;
  recipient: string;
  phone?: string;
  active: boolean;
  startMonth: string; // YYYY-MM
  endMonth?: string; // YYYY-MM
}

export interface ProvisionContribution {
  id: string;
  date: string;
  amt: number;
  wallet: string;
}

export interface ProvisionSpending {
  id: string;
  date: string;
  amt: number;
  label: string;
  categoryId: string;
}

export interface Provision {
  id: string;
  name: string;
  icon: string;
  color?: string;
  targetAmount: number;
  dueDate: string; // YYYY-MM-DD
  contributions: ProvisionContribution[];
  spent: ProvisionSpending[];
  shared?: boolean;
}

export interface GoalContribution {
  id: string;
  uid: string;
  name: string;
  date: string;
  amt: number;
}

export interface SharedGoal {
  id: string;
  name: string;
  target: number;
  deadline: string; // YYYY-MM-DD
  icon: string;
  color: string;
  contributions: GoalContribution[];
}

export interface TontineMember {
  name: string;
  order: number;
}

export interface TontineCyclePayment {
  cycleIndex: number;
  date: string;
  paid: boolean;
  amt: number;
}

export interface Tontine {
  id: string;
  name: string;
  contributionAmount: number;
  frequency: 'hebdo' | 'bimensuelle' | 'mensuelle';
  members: TontineMember[];
  startDate: string; // YYYY-MM-DD
  myPosition: number; // 1-indexed turn
  potAmount: number;
  payments: TontineCyclePayment[];
  shared?: boolean;
}

export interface RecipientMemory {
  id: string;
  name: string; // person or merchant name
  categoryId: string;
  itemId?: string;
  defaultWallet?: string;
}

export interface AlertItem {
  id: string;
  title: string;
  message: string;
  date: string;
  type: 'warning' | 'info' | 'success' | 'action';
  read: boolean;
  linkTab?: string;
}

export interface HouseholdSettings {
  monthStartDay: number; // 1 to 28
  approvalThreshold: number; // e.g. 50000
  approvalEnabled: boolean;
  exemptCategoryIds?: string[];
  /** Famille view only: normalised rubric name -> canonical normalised name. */
  rubricMerges?: Record<string, string>;
  rubricMergesDismissed?: string[];
  plan: 'free' | 'premium';
  trialEndsAt?: number;
  premiumEnabled?: boolean; // dev test override
}

export interface HouseholdMeta {
  id: string;
  joinCode: string;
  members: string[]; // uids
  createdAt: number;
  settings: HouseholdSettings;
}

/** Stored in households/{hid}/members/{uid}. */
export interface MemberProfile {
  name: string;
  color?: string;
  joined?: number;
  budgetSetupDone?: boolean;
  templateStripDismissed?: boolean;
  envelopeRollover?: boolean;
}

/** A household member with their own budget structure (used by Famille). */
export interface MemberData extends MemberBudget {
  uid: string;
  name: string;
  color?: string;
  me: boolean;
}

export interface QuotaUsage {
  readsToday: number;
  writesToday: number;
  lastResetDay: string; // YYYY-MM-DD
}
