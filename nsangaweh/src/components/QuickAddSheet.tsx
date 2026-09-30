import React, { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  Calendar,
  Check,
  Clipboard,
  Delete,
  Mic,
  MicOff,
  Sparkles,
  Wallet as WalletIcon,
  X,
} from 'lucide-react';
import {
  currentMonthKey,
  DEFAULT_WALLETS,
  fmt,
  GROUPS,
  parseQuick,
  todayStr,
} from '../lib/budget-math';
import { parseVoiceTranscript } from '../lib/frenchNumbers';
import { triggerHaptic } from '../lib/haptics';
import { parseMomoSMS } from '../lib/momoParser';
import { RubricIconBadge } from '../lib/rubrics';
import {
  Entry,
  EntrySource,
  EntryType,
  MonthCalculation,
  PlanLine,
  RecipientMemory,
  Wallet,
} from '../lib/types';

interface QuickAddSheetProps {
  isOpen: boolean;
  currentMonth: string;
  calc: MonthCalculation;
  wallets?: Wallet[];
  recipientMemories?: RecipientMemory[];
  initialType?: EntryType;
  onClose: () => void;
  onSave: (entry: {
    type: EntryType;
    amt: number;
    label: string;
    date: string;
    plan: PlanLine | null;
    walletId: string;
    fee?: number;
    ref?: string;
    who?: string;
    src?: EntrySource;
    saveMemory?: { name: string; rubric: string; lineLabel?: string };
  }) => void;
}

export const QuickAddSheet: React.FC<QuickAddSheetProps> = ({
  isOpen,
  currentMonth,
  calc,
  wallets = DEFAULT_WALLETS,
  recipientMemories = [],
  initialType = 'out',
  onClose,
  onSave,
}) => {
  // Top segmented control: Saisie | SMS | Voix
  const [tabMode, setTabMode] = useState<'saisie' | 'sms' | 'voix'>('saisie');

  // Saisie states
  const [type, setType] = useState<EntryType>(initialType);
  const [amountStr, setAmountStr] = useState<string>('');
  const [selectedPlanLine, setSelectedPlanLine] = useState<PlanLine | null>(null);
  const [customLabel, setCustomLabel] = useState<string>('');
  const [selectedWalletId, setSelectedWalletId] = useState<string>(() => {
    return localStorage.getItem('nsangaweh-last-wallet') || wallets[0]?.id || 'wallet-cash';
  });
  const [dateMode, setDateMode] = useState<'today' | 'yesterday' | 'custom'>('today');
  const [customDate, setCustomDate] = useState<string>(() =>
    currentMonth === currentMonthKey() ? todayStr() : `${currentMonth}-01`
  );
  const [isSmartTextMode, setIsSmartTextMode] = useState(false);
  const [smartInputText, setSmartInputText] = useState('');

  // SMS states
  const [smsRawText, setSmsRawText] = useState('');
  const [parsedSms, setParsedSms] = useState<any | null>(null);
  const [smsAmt, setSmsAmt] = useState<string>('');
  const [smsFee, setSmsFee] = useState<string>('');
  const [smsWho, setSmsWho] = useState<string>('');
  const [smsRef, setSmsRef] = useState<string>('');
  const [smsType, setSmsType] = useState<EntryType>('out');
  const [smsRubric, setSmsRubric] = useState<string>('Repas');
  const [smsWalletId, setSmsWalletId] = useState<string>('wallet-momo');
  const [alwaysClassifyPerson, setAlwaysClassifyPerson] = useState(false);

  // Voice states
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [voiceParsed, setVoiceParsed] = useState<any | null>(null);
  const [speechSupported, setSpeechSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  // Reset when opened
  useEffect(() => {
    if (isOpen) {
      setTabMode('saisie');
      setType(initialType);
      setAmountStr('');
      setSelectedPlanLine(null);
      setCustomLabel('');
      setIsSmartTextMode(false);
      setSmartInputText('');
      setDateMode('today');
      setCustomDate(currentMonth === currentMonthKey() ? todayStr() : `${currentMonth}-01`);
      setSmsRawText('');
      setParsedSms(null);
      setVoiceTranscript('');
      setVoiceParsed(null);
      setIsListening(false);
    }
  }, [isOpen, initialType, currentMonth]);

  // Clean up speech recognition
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  if (!isOpen) return null;

  // Keypad Handlers
  const handleKeyPress = (char: string) => {
    triggerHaptic('light');
    if (amountStr.length >= 9) return;
    if (amountStr === '' && (char === '0' || char === '000')) return;

    if (char === '000') {
      if (amountStr !== '') {
        setAmountStr((prev) => prev + '000');
      }
    } else {
      setAmountStr((prev) => prev + char);
    }
  };

  const handleBackspace = () => {
    triggerHaptic('light');
    setAmountStr((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    triggerHaptic('light');
    setAmountStr('');
  };

  // Plan line chip selection
  const handleChipClick = (p: PlanLine) => {
    triggerHaptic('light');
    if (selectedPlanLine?.id === p.id) {
      setSelectedPlanLine(null);
    } else {
      setSelectedPlanLine(p);
      setCustomLabel('');
      const act = calc.byPlan[p.id] || 0;
      const rem = Math.max(0, (p.a || 0) - act);
      if (rem > 0 && amountStr === '') {
        setAmountStr(String(rem));
      }
    }
  };

  // Resolve target date
  const resolvedDate = (() => {
    if (dateMode === 'custom') return customDate;
    const now = new Date();
    if (dateMode === 'yesterday') {
      now.setDate(now.getDate() - 1);
    }
    const pad = (n: number) => (n < 10 ? '0' : '') + n;
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  })();

  // 1. Submit Saisie
  const handleSubmitSaisie = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (isSmartTextMode) {
      const parsed = parseQuick(smartInputText, calc.monthData);
      if (!parsed || !parsed.amt || parsed.amt <= 0) {
        triggerHaptic('warning');
        return;
      }
      triggerHaptic('success');
      localStorage.setItem('nsangaweh-last-wallet', selectedWalletId);
      onSave({
        type: parsed.type,
        amt: parsed.amt,
        label: parsed.label,
        date: resolvedDate,
        plan: parsed.planLine,
        walletId: selectedWalletId,
        src: 'manual',
      });
      onClose();
      return;
    }

    const amt = parseInt(amountStr, 10);
    if (!amt || amt <= 0) {
      triggerHaptic('warning');
      return;
    }

    const finalLabel = selectedPlanLine
      ? selectedPlanLine.l
      : customLabel.trim() || (type === 'in' ? 'Revenu' : type === 'save' ? 'Épargne' : 'Dépense');

    triggerHaptic('success');
    localStorage.setItem('nsangaweh-last-wallet', selectedWalletId);
    onSave({
      type,
      amt,
      label: finalLabel,
      date: resolvedDate,
      plan: selectedPlanLine,
      walletId: selectedWalletId,
      src: 'manual',
    });
    onClose();
  };

  // 2. Parse SMS
  const handleParseSmsText = (text: string) => {
    setSmsRawText(text);
    if (!text.trim()) {
      setParsedSms(null);
      return;
    }

    const res = parseMomoSMS(text, calc.monthData.entries);
    setParsedSms(res);

    if (res.amount) setSmsAmt(String(res.amount));
    if (res.fee) setSmsFee(String(res.fee));
    if (res.who) setSmsWho(res.who);
    if (res.ref) setSmsRef(res.ref);
    setSmsType(res.direction === 'in' ? 'in' : 'out');

    // Auto-select wallet
    if (res.operator === 'MTN') {
      const mtnW = wallets.find((w) => w.type === 'momo');
      if (mtnW) setSmsWalletId(mtnW.id);
    } else if (res.operator === 'Orange') {
      const omW = wallets.find((w) => w.type === 'om');
      if (omW) setSmsWalletId(omW.id);
    }

    // Check Recipient Memory
    if (res.who) {
      const mem = recipientMemories.find(
        (m) => m.name.toLowerCase() === res.who?.toLowerCase()
      );
      if (mem) {
        setSmsRubric(mem.rubric);
      } else if (res.type === 'paiement') {
        setSmsRubric('Logement');
      } else {
        setSmsRubric('Soutien famille');
      }
    }
  };

  const handlePasteClipboard = async () => {
    triggerHaptic('light');
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const txt = await navigator.clipboard.readText();
        if (txt) {
          handleParseSmsText(txt);
        }
      }
    } catch {
      // Clipboard read denied / unsupported
    }
  };

  const handleSubmitSms = () => {
    const amt = parseInt(smsAmt, 10);
    if (!amt || amt <= 0) return;

    triggerHaptic('success');
    const feeVal = parseInt(smsFee, 10) || 0;

    // Look for matching plan line in chosen rubric
    const matchedLine =
      calc.monthData.plan.find(
        (p) =>
          p.g === smsRubric &&
          (p.l.toLowerCase().includes(smsWho.toLowerCase()) ||
            smsWho.toLowerCase().includes(p.l.toLowerCase()))
      ) || null;

    const label = smsWho
      ? `${smsWho}`
      : matchedLine
      ? matchedLine.l
      : parsedSms?.type || 'Opération MoMo';

    onSave({
      type: smsType,
      amt,
      label,
      date: resolvedDate,
      plan: matchedLine,
      walletId: smsWalletId,
      fee: feeVal,
      ref: smsRef,
      who: smsWho,
      src: 'sms',
      saveMemory:
        alwaysClassifyPerson && smsWho
          ? { name: smsWho, rubric: smsRubric, lineLabel: matchedLine?.l }
          : undefined,
    });
    onClose();
  };

  // 3. Web Speech API handler
  const handleToggleVoice = () => {
    triggerHaptic('medium');
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'fr-FR';
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceTranscript('');
        setVoiceParsed(null);
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        setVoiceTranscript(transcript);
        const parsed = parseVoiceTranscript(transcript);
        setVoiceParsed(parsed);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setSpeechSupported(false);
      setIsListening(false);
    }
  };

  const handleSubmitVoice = () => {
    if (!voiceParsed || !voiceParsed.amount) return;
    triggerHaptic('success');

    const matchedLine =
      calc.monthData.plan.find(
        (p) =>
          p.t === voiceParsed.type &&
          p.l.toLowerCase().includes(voiceParsed.label.toLowerCase())
      ) || null;

    onSave({
      type: voiceParsed.type,
      amt: voiceParsed.amount,
      label: voiceParsed.label,
      date: voiceParsed.dateStr || resolvedDate,
      plan: matchedLine,
      walletId: selectedWalletId,
      src: 'voice',
    });
    onClose();
  };

  const planLinesForType = calc.monthData.plan.filter(
    (p) => (p.t || 'out') === type
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label="Noter une opération"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[480px] bg-[var(--color-surface)] rounded-t-[28px] border-t border-[var(--color-border)] shadow-[var(--shadow-raised)] flex flex-col max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Pill with Tabs */}
        <div className="pt-3 pb-2 px-5 flex flex-col gap-2.5 border-b border-[var(--color-border)] shrink-0">
          <span className="w-9 h-1 rounded-full bg-[var(--color-border)] mx-auto" />

          <div className="flex items-center justify-between">
            {/* Segmented Mode: Saisie | SMS | Voix */}
            <div className="flex p-0.5 bg-[var(--color-surface-subtle)] rounded-xl border border-[var(--color-border)]">
              {(['saisie', 'sms', 'voix'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setTabMode(m);
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-heading font-bold transition capitalize ${
                    tabMode === m
                      ? 'bg-[var(--color-surface)] text-[var(--color-primary)] shadow-xs'
                      : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                  }`}
                >
                  {m === 'saisie' ? 'Saisie' : m === 'sms' ? 'SMS MoMo' : 'Voix'}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--color-text-muted)] hover:bg-[var(--color-surface-subtle)]"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3.5 no-scrollbar">
          {/* TAB 1: SAISIE */}
          {tabMode === 'saisie' && (
            <>
              {/* Type Switcher: Sortie / Entrée / Épargne */}
              <div className="grid grid-cols-3 p-1 bg-[var(--color-surface-subtle)] rounded-xl border border-[var(--color-border)] shrink-0">
                {(['out', 'in', 'save'] as const).map((t) => {
                  const isActive = type === t;
                  const label = t === 'out' ? 'Sortie' : t === 'in' ? 'Entrée' : 'Épargne';
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => {
                        triggerHaptic('light');
                        setType(t);
                        setSelectedPlanLine(null);
                      }}
                      className={`py-1.5 rounded-lg text-xs font-heading font-bold transition text-center ${
                        isActive
                          ? t === 'in'
                            ? 'bg-[var(--color-income)] text-white shadow-xs'
                            : t === 'save'
                            ? 'bg-[var(--color-primary)] text-white shadow-xs'
                            : 'bg-[var(--color-expense)] text-white shadow-xs'
                          : 'text-[var(--color-text-muted)]'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              {/* Amount Display */}
              <div className="py-2.5 px-4 rounded-2xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)] flex items-center justify-between">
                <span className="text-xs font-heading font-semibold text-[var(--color-text-muted)]">
                  Montant
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span
                    className={`text-3xl font-heading font-extrabold tracking-tight num ${
                      amountStr ? 'text-[var(--color-text)]' : 'text-[var(--color-text-muted)]/50'
                    }`}
                  >
                    {amountStr ? fmt(parseInt(amountStr, 10)) : '0'}
                  </span>
                  <span className="text-xs font-heading font-bold text-[var(--color-primary)]">
                    FCFA
                  </span>
                </div>
              </div>

              {/* Plan line chips or Smart Text */}
              {!isSmartTextMode ? (
                <>
                  {/* Horizontally scrollable chips */}
                  {planLinesForType.length > 0 && (
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[11px] font-semibold text-[var(--color-text-muted)] px-1">
                        Lignes prévues ({type === 'in' ? 'entrées' : 'sorties'}) :
                      </span>
                      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                        {planLinesForType.map((p) => {
                          const isSel = selectedPlanLine?.id === p.id;
                          const act = calc.byPlan[p.id] || 0;
                          const rem = Math.max(0, (p.a || 0) - act);

                          return (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => handleChipClick(p)}
                              className={`shrink-0 h-9 px-2.5 rounded-full flex items-center gap-1.5 border text-xs font-medium transition ${
                                isSel
                                  ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-xs'
                                  : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text)] hover:border-[var(--color-primary)]'
                              }`}
                            >
                              <RubricIconBadge
                                groupName={p.g}
                                size="sm"
                                className={isSel ? 'bg-white/20 text-white' : ''}
                              />
                              <span className="truncate max-w-[120px]">{p.l}</span>
                              {rem > 0 && (
                                <span
                                  className={`text-[10px] num px-1 rounded-full ${
                                    isSel
                                      ? 'bg-white/25 text-white'
                                      : 'bg-[var(--color-surface-subtle)] text-[var(--color-text-muted)]'
                                  }`}
                                >
                                  reste {fmt(rem)}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Free Label input if no line selected */}
                  {!selectedPlanLine && (
                    <input
                      type="text"
                      value={customLabel}
                      onChange={(e) => setCustomLabel(e.target.value)}
                      placeholder="Libellé libre (ex : Pousseur, Beignets, Don)"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-hidden font-medium"
                    />
                  )}
                </>
              ) : (
                /* Smart Text Input */
                <div className="flex flex-col gap-1.5">
                  <div className="relative">
                    <input
                      type="text"
                      autoFocus
                      value={smartInputText}
                      onChange={(e) => setSmartInputText(e.target.value)}
                      placeholder='Ex : "5000 beurre", "+150000 salaire", "5k taxi"'
                      className="w-full pl-3 pr-8 py-2.5 text-xs rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-hidden font-medium"
                    />
                    <Sparkles
                      size={15}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--color-accent)]"
                    />
                  </div>
                  {smartInputText.trim() && (
                    <div className="p-2 rounded-xl bg-[var(--color-primary-light)] text-[11px] text-[var(--color-primary)] font-medium">
                      Aperçu : {parseQuick(smartInputText, calc.monthData).type === 'in' ? 'Entrée' : 'Sortie'} ·{' '}
                      <b>{fmt(parseQuick(smartInputText, calc.monthData).amt)} F</b> →{' '}
                      {parseQuick(smartInputText, calc.monthData).label}
                    </div>
                  )}
                </div>
              )}

              {/* Wallet and Date Chips Row */}
              <div className="flex items-center justify-between gap-2 pt-0.5">
                {/* Wallet Selector Chip */}
                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
                  <WalletIcon size={14} className="text-[var(--color-text-muted)] shrink-0" />
                  {wallets.map((w) => (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => {
                        triggerHaptic('light');
                        setSelectedWalletId(w.id);
                      }}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold transition shrink-0 ${
                        selectedWalletId === w.id
                          ? 'bg-[var(--color-primary)] text-white shadow-2xs'
                          : 'bg-[var(--color-surface-subtle)] text-[var(--color-text-muted)]'
                      }`}
                    >
                      {w.name}
                    </button>
                  ))}
                </div>

                {/* Date Chips */}
                <div className="flex items-center gap-1 shrink-0">
                  <Calendar size={13} className="text-[var(--color-text-muted)] shrink-0" />
                  {(['today', 'yesterday'] as const).map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => {
                        triggerHaptic('light');
                        setDateMode(d);
                      }}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold transition ${
                        dateMode === d
                          ? 'bg-[var(--color-text)] text-white shadow-2xs'
                          : 'bg-[var(--color-surface-subtle)] text-[var(--color-text-muted)]'
                      }`}
                    >
                      {d === 'today' ? "Aujourd'hui" : 'Hier'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggle Smart Text */}
              <div className="flex justify-between items-center text-[11px] text-[var(--color-text-muted)]">
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setIsSmartTextMode(!isSmartTextMode);
                  }}
                  className="hover:text-[var(--color-primary)] flex items-center gap-1 font-semibold"
                >
                  <Sparkles size={12} className="text-[var(--color-accent)]" />
                  {isSmartTextMode ? 'Retour au clavier numérique' : 'Saisie rapide en 1 ligne'}
                </button>
              </div>

              {/* Custom Numeric Keypad (when not in smart text mode) */}
              {!isSmartTextMode && (
                <div className="grid grid-cols-3 gap-1.5 pt-1">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9', '000', '0'].map((digit) => (
                    <button
                      key={digit}
                      type="button"
                      onClick={() => handleKeyPress(digit)}
                      className="h-11 rounded-xl bg-[var(--color-surface-subtle)] text-[var(--color-text)] font-heading font-bold text-base hover:bg-[var(--color-border)] active:scale-95 transition cursor-pointer"
                    >
                      {digit}
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={handleBackspace}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      handleClear();
                    }}
                    className="h-11 rounded-xl bg-[var(--color-surface-subtle)] text-[var(--color-text)] flex items-center justify-center hover:bg-[var(--color-border)] active:scale-95 transition cursor-pointer"
                    aria-label="Effacer"
                  >
                    <Delete size={18} />
                  </button>
                </div>
              )}

              {/* Save Button */}
              <button
                type="button"
                onClick={() => handleSubmitSaisie()}
                className="w-full py-3.5 rounded-2xl bg-[var(--color-primary)] text-white font-heading font-bold text-sm shadow-[var(--shadow-fab)] hover:bg-[var(--color-primary-dark)] active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer mt-1"
              >
                <Check size={18} />
                Enregistrer l'opération
              </button>
            </>
          )}

          {/* TAB 2: SMS (Mobile Money) */}
          {tabMode === 'sms' && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-heading font-bold text-[var(--color-text)]">
                  Collez le SMS de confirmation MTN ou Orange
                </span>
                <button
                  type="button"
                  onClick={handlePasteClipboard}
                  className="px-2.5 py-1 rounded-xl bg-[var(--color-primary-light)] text-[var(--color-primary)] text-xs font-bold flex items-center gap-1"
                >
                  <Clipboard size={13} />
                  Coller
                </button>
              </div>

              <textarea
                rows={3}
                value={smsRawText}
                onChange={(e) => handleParseSmsText(e.target.value)}
                placeholder="Ex : Transfert effectue avec succes. Vous avez envoye 25 000 FCFA a CABREL KAMGA... ID transaction: 18274910283."
                className="w-full p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-subtle)] text-xs text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-hidden font-mono leading-relaxed"
              />

              {parsedSms && (
                <div className="p-3.5 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] shadow-xs flex flex-col gap-2.5 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-full bg-[var(--color-primary-light)] text-[var(--color-primary)] text-[10px] font-bold">
                      {parsedSms.operator} · {parsedSms.type.toUpperCase()}
                    </span>
                    {parsedSms.isDuplicate && (
                      <span className="px-2 py-0.5 rounded-full bg-[var(--color-warning-soft)] text-[var(--color-warning)] text-[10px] font-bold flex items-center gap-1">
                        <AlertCircle size={10} />
                        Déjà enregistré
                      </span>
                    )}
                  </div>

                  {/* Editable Fields */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="text-[10px] text-[var(--color-text-muted)] font-semibold block">
                        Montant (FCFA)
                      </label>
                      <input
                        type="number"
                        value={smsAmt}
                        onChange={(e) => setSmsAmt(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-[var(--color-border)] font-bold text-xs num"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-[var(--color-text-muted)] font-semibold block">
                        Frais (FCFA)
                      </label>
                      <input
                        type="number"
                        value={smsFee}
                        onChange={(e) => setSmsFee(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-[var(--color-border)] font-bold text-xs num"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="text-[10px] text-[var(--color-text-muted)] font-semibold block">
                        Destinataire / Émetteur
                      </label>
                      <input
                        type="text"
                        value={smsWho}
                        onChange={(e) => setSmsWho(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-[var(--color-border)] font-medium text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-[var(--color-text-muted)] font-semibold block">
                        Rubrique
                      </label>
                      <select
                        value={smsRubric}
                        onChange={(e) => setSmsRubric(e.target.value)}
                        className="w-full px-2 py-1.5 rounded-lg border border-[var(--color-border)] font-medium text-xs bg-[var(--color-surface)]"
                      >
                        {GROUPS.map((g) => (
                          <option key={g} value={g}>
                            {g}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Recipient Memory prompt */}
                  {smsWho && (
                    <label className="flex items-center gap-2 text-[11px] text-[var(--color-text-muted)] cursor-pointer pt-1">
                      <input
                        type="checkbox"
                        checked={alwaysClassifyPerson}
                        onChange={(e) => setAlwaysClassifyPerson(e.target.checked)}
                        className="rounded-xs text-[var(--color-primary)]"
                      />
                      Toujours classer <b>{smsWho}</b> dans <b>{smsRubric}</b>
                    </label>
                  )}

                  <button
                    type="button"
                    onClick={handleSubmitSms}
                    className="w-full py-3 rounded-xl bg-[var(--color-primary)] text-white font-heading font-bold text-xs shadow-xs hover:bg-[var(--color-primary-dark)] active:scale-95 transition mt-1"
                  >
                    Valider l'opération SMS
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: VOIX */}
          {tabMode === 'voix' && (
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <div className="max-w-xs">
                <span className="text-sm font-heading font-bold text-[var(--color-text)] block">
                  Dictez votre dépense en français
                </span>
                <small className="text-xs text-[var(--color-text-muted)] mt-1 block">
                  Exemples : « Cinq mille beurre », « Vingt-cinq mille Maman », « Cent vingt mille
                  scolarité hier »
                </small>
              </div>

              {!speechSupported ? (
                <div className="p-3 rounded-xl bg-[var(--color-warning-soft)] text-[var(--color-warning)] text-xs text-left">
                  La reconnaissance vocale Web Speech n'est pas disponible sur ce navigateur.
                  Utilisez la saisie en 1 ligne sur l'onglet Saisie.
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleToggleVoice}
                  className={`w-20 h-20 rounded-full flex items-center justify-center text-white shadow-lg transition transform active:scale-95 cursor-pointer ${
                    isListening
                      ? 'bg-rose-500 animate-pulse ring-8 ring-rose-200'
                      : 'bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)]'
                  }`}
                >
                  {isListening ? <MicOff size={32} /> : <Mic size={32} />}
                </button>
              )}

              {isListening && (
                <span className="text-xs font-semibold text-rose-500 animate-pulse">
                  Écoute en cours… Parlez distinctement
                </span>
              )}

              {voiceTranscript && (
                <div className="w-full p-3 rounded-2xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)] text-left flex flex-col gap-2">
                  <span className="text-[10px] uppercase font-bold text-[var(--color-text-muted)]">
                    Texte entendu :
                  </span>
                  <p className="m-0 text-xs text-[var(--color-text)] italic">
                    « {voiceTranscript} »
                  </p>

                  {voiceParsed && voiceParsed.amount ? (
                    <div className="p-2.5 rounded-xl bg-[var(--color-primary-light)] text-[var(--color-primary)] flex items-center justify-between text-xs font-bold">
                      <span>
                        {voiceParsed.type === 'in' ? 'Entrée' : 'Sortie'} : {voiceParsed.label}
                      </span>
                      <span className="num text-sm">{fmt(voiceParsed.amount)} F</span>
                    </div>
                  ) : (
                    <small className="text-[11px] text-[var(--color-text-muted)]">
                      Dites un montant et un motif (ex : « 5000 transport »).
                    </small>
                  )}
                </div>
              )}

              {voiceParsed && voiceParsed.amount && (
                <button
                  type="button"
                  onClick={handleSubmitVoice}
                  className="w-full py-3.5 rounded-2xl bg-[var(--color-primary)] text-white font-heading font-bold text-sm shadow-xs hover:bg-[var(--color-primary-dark)] active:scale-95 transition"
                >
                  Confirmer et enregistrer
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
