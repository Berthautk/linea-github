import React from 'react';
import {
  CalendarDays,
  ChevronRight,
  FileSpreadsheet,
  HandCoins,
  HeartHandshake,
  LineChart,
  MessageSquareHeart,
  PiggyBank,
  Receipt,
  Settings,
  Target,
  Users,
  Wallet as WalletIcon,
} from 'lucide-react';
import { fmt } from '../lib/budget-math';
import { triggerHaptic } from '../lib/haptics';
import {
  Commitment,
  Debt,
  Provision,
  SharedGoal,
  Tontine,
  Wallet,
} from '../lib/types';

export type PlusModule =
  | 'evolution'
  | 'dettes'
  | 'engagements'
  | 'provisions'
  | 'objectifs'
  | 'tontine'
  | 'portefeuilles'
  | 'conseil'
  | 'bilans'
  | 'reglages';

interface PlusHubScreenProps {
  debts?: Debt[];
  commitments?: Commitment[];
  provisions?: Provision[];
  goals?: SharedGoal[];
  tontines?: Tontine[];
  wallets?: Wallet[];
  onOpenModule: (mod: PlusModule) => void;
}

export const PlusHubScreen: React.FC<PlusHubScreenProps> = ({
  debts = [],
  commitments = [],
  provisions = [],
  goals = [],
  tontines = [],
  wallets = [],
  onOpenModule,
}) => {
  // Compute live statuses
  const activeDebts = debts.filter((d) => d.status === 'active');
  const debtsTotalAmt = activeDebts.reduce((acc, d) => {
    const paid = d.payments.reduce((pAcc, p) => pAcc + p.amt, 0);
    return acc + Math.max(0, d.principal - paid);
  }, 0);
  const debtsStatus =
    activeDebts.length > 0
      ? `${activeDebts.length} active${activeDebts.length > 1 ? 's' : ''} · ${fmt(debtsTotalAmt)} F`
      : 'Aucune dette en cours';

  const activeCommitments = commitments.filter((c) => c.active);
  const commitmentsAmt = activeCommitments.reduce((acc, c) => acc + c.amount, 0);
  const commitmentsStatus =
    activeCommitments.length > 0
      ? `${activeCommitments.length} mensuel${activeCommitments.length > 1 ? 's' : ''} · ${fmt(commitmentsAmt)} F`
      : 'Envois réguliers à des proches';

  const provisionsTotalSaved = provisions.reduce((acc, p) => {
    const totalContr = p.contributions.reduce((cAcc, c) => cAcc + c.amt, 0);
    const totalSpent = p.spent.reduce((sAcc, s) => sAcc + s.amt, 0);
    return acc + Math.max(0, totalContr - totalSpent);
  }, 0);
  const provisionsStatus =
    provisions.length > 0
      ? `${provisions.length} réserve${provisions.length > 1 ? 's' : ''} · ${fmt(provisionsTotalSaved)} F`
      : 'Épargnes de précaution';

  const goalsStatus =
    goals.length > 0
      ? `${goals.length} projet${goals.length > 1 ? 's' : ''} en cours`
      : 'Projets communs du couple';

  const tontinesStatus =
    tontines.length > 0
      ? `${tontines.length} njangi actif`
      : 'Tours de table & njangi';

  const walletsStatus = `${wallets.length} compte${wallets.length > 1 ? 's' : ''} et soldes`;

  const tiles: Array<{
    id: PlusModule;
    title: string;
    status: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    color: string;
    bgColor: string;
  }> = [
    {
      id: 'evolution',
      title: 'Évolution',
      status: 'Tendances & historique',
      icon: LineChart,
      color: '#0B6E4F',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/40',
    },
    {
      id: 'dettes',
      title: 'Dettes',
      status: debtsStatus,
      icon: Receipt,
      color: '#DC2626',
      bgColor: 'bg-rose-50 dark:bg-rose-950/40',
    },
    {
      id: 'engagements',
      title: 'Engagements',
      status: commitmentsStatus,
      icon: HeartHandshake,
      color: '#EC4899',
      bgColor: 'bg-pink-50 dark:bg-pink-950/40',
    },
    {
      id: 'provisions',
      title: 'Provisions',
      status: provisionsStatus,
      icon: PiggyBank,
      color: '#059669',
      bgColor: 'bg-teal-50 dark:bg-teal-950/40',
    },
    {
      id: 'objectifs',
      title: 'Objectifs',
      status: goalsStatus,
      icon: Target,
      color: '#2563EB',
      bgColor: 'bg-blue-50 dark:bg-blue-950/40',
    },
    {
      id: 'tontine',
      title: 'Tontine / Njangi',
      status: tontinesStatus,
      icon: Users,
      color: '#6366F1',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950/40',
    },
    {
      id: 'portefeuilles',
      title: 'Portefeuilles',
      status: walletsStatus,
      icon: WalletIcon,
      color: '#F59E0B',
      bgColor: 'bg-amber-50 dark:bg-amber-950/40',
    },
    {
      id: 'conseil',
      title: 'Conseil de famille',
      status: 'Bilan hebdo du couple',
      icon: MessageSquareHeart,
      color: '#8B5CF6',
      bgColor: 'bg-purple-50 dark:bg-purple-950/40',
    },
    {
      id: 'bilans',
      title: 'Bilans & Export',
      status: 'Images partageables & CSV',
      icon: FileSpreadsheet,
      color: '#06B6D4',
      bgColor: 'bg-cyan-50 dark:bg-cyan-950/40',
    },
    {
      id: 'reglages',
      title: 'Réglages',
      status: 'Profil, quota & sécurité',
      icon: Settings,
      color: '#4B5563',
      bgColor: 'bg-gray-100 dark:bg-gray-900/50',
    },
  ];

  return (
    <div className="flex flex-col gap-3 pb-24 animate-in fade-in">
      <div className="flex items-center justify-between px-1">
        <h2 className="m-0 text-base font-heading font-extrabold text-[var(--color-text)]">
          Outils & fonctionnalités
        </h2>
      </div>

      {/* 2-column grid of tiles */}
      <div className="grid grid-cols-2 gap-2.5">
        {tiles.map((tile) => {
          const Icon = tile.icon;
          return (
            <div
              key={tile.id}
              onClick={() => {
                triggerHaptic('light');
                onOpenModule(tile.id);
              }}
              className="p-3.5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-2xs hover:border-[var(--color-primary)] active:scale-[0.98] transition cursor-pointer flex flex-col justify-between h-[106px] group"
            >
              <div className="flex items-center justify-between">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${tile.bgColor}`}
                  style={{ color: tile.color }}
                >
                  <Icon size={18} />
                </div>
                <ChevronRight
                  size={15}
                  className="text-[var(--color-text-muted)] group-hover:text-[var(--color-text)] transition-transform group-hover:translate-x-0.5"
                />
              </div>

              <div>
                <span className="block font-heading font-bold text-xs text-[var(--color-text)] truncate">
                  {tile.title}
                </span>
                <span className="block text-[10px] text-[var(--color-text-muted)] truncate mt-0.5 font-medium">
                  {tile.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
