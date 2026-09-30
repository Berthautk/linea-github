import React, { useState } from 'react';
import {
  ArrowDownLeft,
  ArrowRightLeft,
  ArrowUpRight,
  Banknote,
  Building2,
  Check,
  Plus,
  Smartphone,
  Wallet as WalletIcon,
  X,
} from 'lucide-react';
import { fmt, generateId } from '../lib/budget-math';
import { triggerHaptic } from '../lib/haptics';
import { Entry, Wallet } from '../lib/types';

interface WalletsSheetProps {
  isOpen: boolean;
  wallets: Wallet[];
  entries: Entry[];
  onClose: () => void;
  onUpdateWallets: (updated: Wallet[]) => void;
  onInternalTransfer: (transfer: {
    fromWalletId: string;
    toWalletId: string;
    amount: number;
    fee: number;
    date: string;
  }) => void;
}

export const WalletsSheet: React.FC<WalletsSheetProps> = ({
  isOpen,
  wallets,
  entries,
  onClose,
  onUpdateWallets,
  onInternalTransfer,
}) => {
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferFrom, setTransferFrom] = useState(wallets[1]?.id || wallets[0]?.id || '');
  const [transferTo, setTransferTo] = useState(wallets[0]?.id || '');
  const [transferAmt, setTransferAmt] = useState('');
  const [transferFee, setTransferFee] = useState('');

  // Add/edit wallet modal
  const [showAddWallet, setShowAddWallet] = useState(false);
  const [newWalletName, setNewWalletName] = useState('');
  const [newWalletType, setNewWalletType] = useState<Wallet['type']>('cash');
  const [newWalletColor, setNewWalletColor] = useState('#12A150');
  const [newWalletBalance, setNewWalletBalance] = useState('');

  if (!isOpen) return null;

  // Compute live wallet balances
  // Balance = initial + entries(in) - entries(out) - fees
  const getWalletBalance = (wId: string, initial = 0) => {
    let bal = initial;
    entries.forEach((e) => {
      if (e.status === 'declined') return;
      if (e.w === wId) {
        if (e.t === 'in') {
          bal += e.amt;
        } else if (e.t === 'out' || e.t === 'save') {
          bal -= e.amt;
          if (e.fee) bal -= e.fee;
        }
      }
    });
    return bal;
  };

  const totalAllWallets = wallets.reduce(
    (acc, w) => acc + getWalletBalance(w.id, w.initialBalance),
    0
  );

  const handleExecuteTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseInt(transferAmt, 10);
    if (!amt || amt <= 0 || transferFrom === transferTo) return;
    triggerHaptic('success');
    const feeVal = parseInt(transferFee, 10) || 0;
    const today = new Date().toISOString().slice(0, 10);

    onInternalTransfer({
      fromWalletId: transferFrom,
      toWalletId: transferTo,
      amount: amt,
      fee: feeVal,
      date: today,
    });

    setTransferAmt('');
    setTransferFee('');
    setShowTransferModal(false);
  };

  const handleAddWallet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWalletName.trim()) return;
    triggerHaptic('success');
    const initBal = parseInt(newWalletBalance, 10) || 0;
    const newW: Wallet = {
      id: generateId(),
      name: newWalletName.trim(),
      type: newWalletType,
      color: newWalletColor,
      icon:
        newWalletType === 'momo' || newWalletType === 'om'
          ? 'Smartphone'
          : newWalletType === 'bank'
          ? 'Building2'
          : 'Banknote',
      initialBalance: initBal,
    };
    onUpdateWallets([...wallets, newW]);
    setNewWalletName('');
    setNewWalletBalance('');
    setShowAddWallet(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[480px] bg-[var(--color-surface)] rounded-t-[28px] border-t border-[var(--color-border)] shadow-[var(--shadow-raised)] flex flex-col max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="pt-3 pb-2.5 px-5 flex items-center justify-between border-b border-[var(--color-border)] shrink-0">
          <span className="w-9 h-1 rounded-full bg-[var(--color-border)] mx-auto absolute left-1/2 -translate-x-1/2 top-2.5" />
          <div className="flex items-center gap-2">
            <h3 className="m-0 text-base font-heading font-bold text-[var(--color-text)]">
              Mes Portefeuilles
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--color-text-muted)] hover:bg-[var(--color-surface-subtle)]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3.5 no-scrollbar">
          {/* Total balance hero */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-800 to-emerald-900 text-white flex items-center justify-between shadow-xs">
            <div>
              <span className="text-[11px] font-semibold text-emerald-200 uppercase tracking-wider block">
                Solde total disponible
              </span>
              <b className="text-2xl font-heading font-extrabold num">
                {fmt(totalAllWallets)} FCFA
              </b>
            </div>
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setShowTransferModal(true);
              }}
              className="px-3 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-heading font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              <ArrowRightLeft size={14} />
              Virement interne
            </button>
          </div>

          {/* Wallets list */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-heading font-bold text-[var(--color-text)]">
                Comptes & caisses
              </span>
              <button
                type="button"
                onClick={() => setShowAddWallet(true)}
                className="text-xs font-bold text-[var(--color-primary)] hover:underline flex items-center gap-1"
              >
                <Plus size={14} /> Ajouter un compte
              </button>
            </div>

            {wallets.map((w) => {
              const currentBal = getWalletBalance(w.id, w.initialBalance);
              return (
                <div
                  key={w.id}
                  className="p-3.5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-2xs flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-2xs"
                      style={{ backgroundColor: w.color }}
                    >
                      {w.type === 'momo' || w.type === 'om' ? (
                        <Smartphone size={20} />
                      ) : w.type === 'bank' ? (
                        <Building2 size={20} />
                      ) : (
                        <Banknote size={20} />
                      )}
                    </div>
                    <div className="min-w-0">
                      <span className="font-heading font-bold text-xs text-[var(--color-text)] block truncate">
                        {w.name}
                      </span>
                      <small className="text-[10px] text-[var(--color-text-muted)] block capitalize">
                        {w.type === 'cash'
                          ? 'Espèces en poche'
                          : w.type === 'momo'
                          ? 'Compte MTN'
                          : w.type === 'om'
                          ? 'Compte Orange'
                          : 'Compte bancaire'}
                      </small>
                    </div>
                  </div>

                  <div className="text-right">
                    <b
                      className={`font-heading font-extrabold text-sm num block ${
                        currentBal < 0 ? 'text-[var(--color-expense)]' : 'text-[var(--color-text)]'
                      }`}
                    >
                      {fmt(currentBal)} F
                    </b>
                    <small className="text-[10px] text-[var(--color-text-muted)]">
                      Initial : {fmt(w.initialBalance)} F
                    </small>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Internal Transfer Modal */}
          {showTransferModal && (
            <div
              className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4"
              onClick={() => setShowTransferModal(false)}
            >
              <div
                className="w-full max-w-sm bg-[var(--color-surface)] p-5 rounded-3xl shadow-xl flex flex-col gap-3 text-xs"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center">
                  <h4 className="m-0 text-sm font-heading font-bold">
                    Virement interne entre comptes
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowTransferModal(false)}
                    className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                  >
                    <X size={16} />
                  </button>
                </div>

                <p className="m-0 text-[11px] text-[var(--color-text-muted)]">
                  Exemple : retrait MoMo vers espèces, ou dépôt banque. Le virement n'est ni une
                  dépense ni un revenu, mais les frais éventuels sont notés dans la rubrique Frais.
                </p>

                <form onSubmit={handleExecuteTransfer} className="flex flex-col gap-2.5">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-semibold text-[var(--color-text-muted)] block">
                        Depuis :
                      </label>
                      <select
                        value={transferFrom}
                        onChange={(e) => setTransferFrom(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]"
                      >
                        {wallets.map((w) => (
                          <option key={w.id} value={w.id}>
                            {w.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-semibold text-[var(--color-text-muted)] block">
                        Vers :
                      </label>
                      <select
                        value={transferTo}
                        onChange={(e) => setTransferTo(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]"
                      >
                        {wallets.map((w) => (
                          <option key={w.id} value={w.id}>
                            {w.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-semibold text-[var(--color-text-muted)] block">
                        Montant transféré (F)
                      </label>
                      <input
                        type="number"
                        required
                        value={transferAmt}
                        onChange={(e) => setTransferAmt(e.target.value)}
                        placeholder="Ex : 25000"
                        className="w-full px-2.5 py-1.5 rounded-xl border border-[var(--color-border)] font-bold num"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-semibold text-[var(--color-text-muted)] block">
                        Frais du transfert (F)
                      </label>
                      <input
                        type="number"
                        value={transferFee}
                        onChange={(e) => setTransferFee(e.target.value)}
                        placeholder="Ex : 350"
                        className="w-full px-2.5 py-1.5 rounded-xl border border-[var(--color-border)] font-bold num"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-[var(--color-primary)] text-white font-bold mt-1"
                  >
                    Valider le virement
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Add Wallet Modal */}
          {showAddWallet && (
            <div
              className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4"
              onClick={() => setShowAddWallet(false)}
            >
              <div
                className="w-full max-w-sm bg-[var(--color-surface)] p-5 rounded-3xl shadow-xl flex flex-col gap-3 text-xs"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center">
                  <h4 className="m-0 text-sm font-heading font-bold">Nouveau compte</h4>
                  <button
                    type="button"
                    onClick={() => setShowAddWallet(false)}
                    className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                  >
                    <X size={16} />
                  </button>
                </div>

                <form onSubmit={handleAddWallet} className="flex flex-col gap-2.5">
                  <input
                    type="text"
                    required
                    value={newWalletName}
                    onChange={(e) => setNewWalletName(e.target.value)}
                    placeholder="Nom (ex : UBA Épargne, Caisse Tontine)"
                    className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)]"
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={newWalletType}
                      onChange={(e) => setNewWalletType(e.target.value as any)}
                      className="px-2 py-1.5 rounded-xl border border-[var(--color-border)]"
                    >
                      <option value="cash">Espèces</option>
                      <option value="momo">MTN MoMo</option>
                      <option value="om">Orange Money</option>
                      <option value="bank">Banque</option>
                    </select>

                    <input
                      type="number"
                      value={newWalletBalance}
                      onChange={(e) => setNewWalletBalance(e.target.value)}
                      placeholder="Solde initial"
                      className="px-3 py-1.5 rounded-xl border border-[var(--color-border)] num font-bold"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-[var(--color-primary)] text-white font-bold"
                  >
                    Créer le compte
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
