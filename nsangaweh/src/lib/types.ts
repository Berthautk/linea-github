export type EntryType = 'in' | 'out' | 'save';
export type EntrySource = 'manual' | 'sms' | 'voice' | 'recurring';
export type ApprovalStatus = 'pending' | 'approved' | 'declined';

export interface PlanLine {
  id: string;
  g: string; // group / rubric
  l: string; // label
  a: number; // planned amount (integer FCFA)
  t: EntryType; // 'in' | 'out' | 'save'
  commitmentId?: string;
  provisionId?: string;
}

export interface Entry {
  id: string;
  d: string; // YYYY-MM-DD
  ts: number; // timestamp ms
  t: EntryType; // 'in' | 'out' | 'save'
  amt: number; // integer FCFA
  p: string | null; // plan line id or null
  l: string; // free label
  w: string; // wallet id
  fee?: number; // integer FCFA
  ref?: string; // transaction ID / receipt reference
  who?: string; // recipient or sender
  src?: EntrySource; // 'manual' | 'sms' | 'voice' | 'recurring'
  status?: ApprovalStatus; // 'pending' | 'approved' | 'declined'
  declinedBy?: string;
  approvedAt?: number;
  debtId?: string;
  provisionId?: string;
  goalId?: string;
}

export interface MonthData {
  plan: PlanLine[];
  entries: Entry[];
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
  rubric: string;
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
  rubric: string;
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
  rubric: string;
  planLineLabel?: string;
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
  exemptRubrics: string[];
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

export interface MemberProfile {
  uid: string;
  name: string;
  color: string;
  joined: number;
}

export interface MemberData {
  uid: string;
  name: string;
  color?: string;
  me: boolean;
  months: Record<string, MonthData>;
  wallets?: Wallet[];
  debts?: Debt[];
  commitments?: Commitment[];
  provisions?: Provision[];
  tontines?: Tontine[];
}

export interface MonthCalculation {
  monthKey: string;
  monthData: MonthData;
  inc: number; // actual income
  out: number; // actual expenses
  saved: number; // actual savings / provisions
  pIn: number; // planned income
  pOut: number; // planned expenses
  pSave: number; // planned savings
  toPay: number; // remaining planned expenses to pay
  free: number; // solde - toPay
  unset: number; // number of plan lines with a === 0
  byGroup: Record<string, number>;
  byPlan: Record<string, number>;
  offOut: number; // non-planned expenses
}

export interface FamilyCalculation {
  monthKey: string;
  inc: number;
  out: number;
  saved: number;
  pIn: number;
  pOut: number;
  pSave: number;
  toPay: number;
  free: number;
  byGroup: Record<string, number>;
  planned: Record<string, number>;
  per: Array<{
    uid: string;
    name: string;
    color?: string;
    me: boolean;
    inc: number;
    out: number;
    saved: number;
    pOut: number;
    toPay: number;
    monthData: MonthData;
  }>;
}

export interface RankedExpense {
  label: string;
  group: string;
  amt: number;
  who?: string;
}

export interface QuotaUsage {
  readsToday: number;
  writesToday: number;
  lastResetDay: string; // YYYY-MM-DD
}
