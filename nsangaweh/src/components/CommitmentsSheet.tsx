import React, { useState } from 'react';
import {
  Bell,
  Calendar,
  Check,
  ChevronRight,
  HeartHandshake,
  MessageCircle,
  Plus,
  Send,
  Sparkles,
  User,
  X,
} from 'lucide-react';
import { fmt, generateId, todayStr } from '../lib/budget-math';
import { triggerHaptic } from '../lib/haptics';
import { Commitment, Entry, Wallet } from '../lib/types';

interface CommitmentsSheetProps {
  isOpen: boolean;
  commitments: Commitment[];
  entries: Entry[];
  wallets: Wallet[];
  currentMonth: string;
  onClose: () => void;
  onUpdateCommitments: (updated: Commitment[]) => void;
  onRecordSent: (c: Commitment, walletId: string, ref?: string) => void;
}

export const CommitmentsSheet: React.FC<CommitmentsSheetProps> = ({
  isOpen,
  commitments,
  entries,
  wallets,
  currentMonth,
  onClose,
  onUpdateCommitments,
  onRecordSent,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState<string | null>(null);

  // Send action modal
  const [activeSendCommitment, setActiveSendCommitment] = useState<Commitment | null>(null);
  const [sendWalletId, setSendWalletId] = useState(wallets[1]?.id || wallets[0]?.id || '');
  const [sendSmsRef, setSendSmsRef] = useState('');

  // Add commitment form fields
  const [newLabel, setNewLabel] = useState('');
  const [newRecipient, setNewRecipient] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newDay, setNewDay] = useState('5');
  const [newWallet, setNewWallet] = useState(wallets[0]?.id || 'wallet-momo');

  if (!isOpen) return null;

  // Calculate annual support in 2026
  const currentYear = currentMonth.slice(0, 4);
  const yearEntries = entries.filter((e) => e.d.startsWith(currentYear) && e.t === 'out');
  const totalSentThisYear = commitments.reduce((acc, c) => {
    const cEntries = yearEntries.filter(
      (e) =>
        e.l.toLowerCase().includes(c.recipient.toLowerCase()) ||
        e.l.toLowerCase().includes(c.label.toLowerCase()) ||
        e.who?.toLowerCase().includes(c.recipient.toLowerCase())
    );
    return acc + cEntries.reduce((subAcc, e) => subAcc + e.amt, 0);
  }, 0);

  // Check if sent this month
  const isSentThisMonth = (c: Commitment) => {
    return entries.some(
      (e) =>
        e.d.startsWith(currentMonth) &&
        e.t === 'out' &&
        (e.l.toLowerCase().includes(c.recipient.toLowerCase()) ||
          e.l.toLowerCase().includes(c.label.toLowerCase()) ||
          e.who?.toLowerCase() === c.recipient.toLowerCase())
    );
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel.trim() || !newRecipient.trim()) return;
    const amt = parseInt(newAmount, 10);
    if (!amt || amt <= 0) return;
    triggerHaptic('success');

    const newC: Commitment = {
      id: generateId(),
      label: newLabel.trim(),
      recipient: newRecipient.trim(),
      phone: newPhone.trim() || undefined,
      rubric: 'Soutien famille',
      amount: amt,
      dayOfMonth: parseInt(newDay, 10) || 5,
      wallet: newWallet,
      active: true,
      startMonth: currentMonth,
    };

    onUpdateCommitments([...commitments, newC]);
    setNewLabel('');
    setNewRecipient('');
    setNewPhone('');
    setNewAmount('');
    setShowAddModal(false);
  };

  const handleConfirmSend = () => {
    if (!activeSendCommitment) return;
    triggerHaptic('success');
    onRecordSent(activeSendCommitment, sendWalletId, sendSmsRef.trim() || undefined);
    setActiveSendCommitment(null);
    setSendSmsRef('');
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
            <HeartHandshake size={18} className="text-pink-600" />
            <h3 className="m-0 text-base font-heading font-bold text-[var(--color-text)]">
              Engagements & Soutien famille
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

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3.5 no-scrollbar">
          {/* Gentle Annual Summary Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-950/40 dark:to-rose-950/40 border border-pink-200 dark:border-pink-900 shadow-2xs flex flex-col gap-1">
            <span className="text-[11px] font-semibold text-pink-700 dark:text-pink-300 uppercase tracking-wider">
              Générosité & solidarité
            </span>
            <div className="flex items-baseline gap-2">
              <b className="text-2xl font-heading font-extrabold text-[var(--color-text)] num">
                {fmt(totalSentThisYear)} FCFA
              </b>
              <span className="text-xs text-[var(--color-text-muted)]">
                envoyés à la famille en {currentYear}
              </span>
            </div>
            <p className="m-0 text-[11px] text-[var(--color-text-muted)] leading-relaxed mt-1">
              Chaque contribution protège et soulage vos proches. Vous pouvez enregistrer les
              envois réguliers prévus chaque mois.
            </p>
          </div>

          {/* List of active commitments */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-heading font-bold text-[var(--color-text)]">
                Engagements réguliers ({commitments.length})
              </span>
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="text-xs font-bold text-[var(--color-primary)] hover:underline flex items-center gap-1"
              >
                <Plus size={14} /> Nouvel engagement
              </button>
            </div>

            {commitments.length === 0 ? (
              <div className="p-6 text-center text-xs text-[var(--color-text-muted)] bg-[var(--color-surface-subtle)] rounded-2xl border border-[var(--color-border)]">
                Aucun engagement régulier configuré.
              </div>
            ) : (
              commitments.map((c) => {
                const sent = isSentThisMonth(c);
                return (
                  <div
                    key={c.id}
                    className="p-3.5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-2xs flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-2xl bg-pink-100 dark:bg-pink-950/60 text-pink-600 flex items-center justify-center font-bold shrink-0">
                        {c.recipient.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <span className="font-heading font-bold text-xs text-[var(--color-text)] block truncate">
                          {c.recipient} · {c.label}
                        </span>
                        <small className="text-[10px] text-[var(--color-text-muted)] block">
                          Prévu le {c.dayOfMonth} du mois · {fmt(c.amount)} F
                        </small>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {sent ? (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 text-[11px] font-bold flex items-center gap-1">
                          <Check size={12} /> Envoyé
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            triggerHaptic('light');
                            setActiveSendCommitment(c);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-[var(--color-primary)] text-white text-xs font-bold shadow-2xs flex items-center gap-1 hover:bg-[var(--color-primary-dark)] active:scale-95 transition"
                        >
                          <Send size={12} /> Marquer envoyé
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Add Modal */}
          {showAddModal && (
            <div
              className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4"
              onClick={() => setShowAddModal(false)}
            >
              <div
                className="w-full max-w-sm bg-[var(--color-surface)] p-5 rounded-3xl shadow-xl flex flex-col gap-3 text-xs"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center">
                  <h4 className="m-0 text-sm font-heading font-bold">Nouvel engagement soutien</h4>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                  >
                    <X size={16} />
                  </button>
                </div>

                <form onSubmit={handleAdd} className="flex flex-col gap-2.5">
                  <input
                    type="text"
                    required
                    value={newRecipient}
                    onChange={(e) => setNewRecipient(e.target.value)}
                    placeholder="Bénéficiaire (ex : Maman, Cabrel, Oncle Jean)"
                    className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)]"
                  />

                  <input
                    type="text"
                    required
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    placeholder="Motif (ex : Soutien mensuel, Médicaments)"
                    className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)]"
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      required
                      value={newAmount}
                      onChange={(e) => setNewAmount(e.target.value)}
                      placeholder="Montant FCFA"
                      className="px-3 py-2 rounded-xl border border-[var(--color-border)] font-bold num"
                    />

                    <select
                      value={newDay}
                      onChange={(e) => setNewDay(e.target.value)}
                      className="px-2.5 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]"
                    >
                      {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
                        <option key={d} value={d}>
                          Le {d} du mois
                        </option>
                      ))}
                    </select>
                  </div>

                  <input
                    type="tel"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="Téléphone (ex : 677123456 pour WhatsApp)"
                    className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)]"
                  />

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-[var(--color-primary)] text-white font-bold mt-1"
                  >
                    Enregistrer l'engagement
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Confirm Send Modal */}
          {activeSendCommitment && (
            <div
              className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4"
              onClick={() => setActiveSendCommitment(null)}
            >
              <div
                className="w-full max-w-sm bg-[var(--color-surface)] p-5 rounded-3xl shadow-xl flex flex-col gap-3 text-xs"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center">
                  <h4 className="m-0 text-sm font-heading font-bold">
                    Confirmer l'envoi à {activeSendCommitment.recipient}
                  </h4>
                  <button
                    type="button"
                    onClick={() => setActiveSendCommitment(null)}
                    className="text-[var(--color-text-muted)]"
                  >
                    <X size={16} />
                  </button>
                </div>

                <p className="m-0 text-[11px] text-[var(--color-text-muted)]">
                  Montant : <b>{fmt(activeSendCommitment.amount)} FCFA</b>. Une sortie sera
                  enregistrée dans votre budget.
                </p>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] text-[var(--color-text-muted)] font-semibold">
                    Compte utilisé :
                  </label>
                  <select
                    value={sendWalletId}
                    onChange={(e) => setSendWalletId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] font-medium"
                  >
                    {wallets.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name}
                      </option>
                    ))}
                  </select>

                  <label className="text-[10px] text-[var(--color-text-muted)] font-semibold mt-1">
                    Référence SMS transaction (facultatif) :
                  </label>
                  <input
                    type="text"
                    value={sendSmsRef}
                    onChange={(e) => setSendSmsRef(e.target.value)}
                    placeholder="Ex : 18274910283"
                    className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)]"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleConfirmSend}
                  className="w-full py-2.5 rounded-xl bg-[var(--color-primary)] text-white font-bold mt-1"
                >
                  Valider l'envoi
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
