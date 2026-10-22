import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle, Calendar, Check, Clipboard, Mic, MicOff, MessageSquareText, PenLine, Sparkles, X } from 'lucide-react';
import { currentMonthKey, defaultEntryLabel, fmt, matchLine, parseQuick, todayStr } from '../lib/budget-math';
import { MonthCalc, sortCategories } from '../lib/calc';
import { OTHER_RUBRIC_DEFAULT } from '../lib/catalog';
import { parseVoiceTranscript } from '../lib/frenchNumbers';
import { triggerHaptic } from '../lib/haptics';
import { RubricBadge } from '../lib/icons';
import { parseMomoSMS } from '../lib/momoParser';
import { Category, EntrySource, MonthLine, RecipientMemory, Wallet } from '../lib/types';
import { MAX_NAME_LENGTH } from '../lib/validation';
import { Keypad } from './ui';

type Kind = 'in' | 'out' | 'save';

export interface QuickAddDraft {
  type: Kind;
  amt: number;
  label: string;
  date: string;
  categoryId: string | null;
  lineId: string | null;
  walletId: string;
  fee?: number;
  ref?: string;
  who?: string;
  src?: EntrySource;
  /** Create a one-off line for this month first ("Autres" when categoryId is null). */
  createOneoff?: { categoryId: string | null };
  saveMemory?: { name: string; categoryId: string };
}

export interface QuickAddPrefill {
  lineId?: string;
  /** Pay into a whole rubric (envelope) instead of a line. */
  categoryId?: string;
  amount?: number;
}

interface Props {
  isOpen: boolean;
  currentMonth: string;
  calc: MonthCalc;
  categories: Category[];
  wallets: Wallet[];
  recipientMemories?: RecipientMemory[];
  initialType?: Kind;
  prefill?: QuickAddPrefill | null;
  onClose: () => void;
  onSave: (d: QuickAddDraft) => void;
}

export const QuickAddSheet: React.FC<Props> = ({
  isOpen,
  currentMonth,
  calc,
  categories,
  wallets,
  recipientMemories = [],
  initialType = 'out',
  prefill,
  onClose,
  onSave,
}) => {
  const [tab, setTab] = useState<'saisie' | 'sms' | 'voix'>('saisie');
  const [type, setType] = useState<Kind>(initialType);
  const [amountStr, setAmountStr] = useState('');
  const [pick, setPick] = useState<{ lineId: string | null; categoryId: string } | null>(null);
  const [label, setLabel] = useState('');
  const [addToBudget, setAddToBudget] = useState(false);
  const [walletId, setWalletId] = useState<string>(() => localStorage.getItem('nsangaweh-last-wallet') || wallets[0]?.id || '');
  const [dateMode, setDateMode] = useState<'today' | 'yesterday' | 'custom'>('today');
  const [customDate, setCustomDate] = useState(`${currentMonth}-01`);
  const [smart, setSmart] = useState(false);
  const [smartText, setSmartText] = useState('');

  const [smsText, setSmsText] = useState('');
  const [sms, setSms] = useState<ReturnType<typeof parseMomoSMS> | null>(null);
  const [smsAmt, setSmsAmt] = useState('');
  const [smsFee, setSmsFee] = useState('');
  const [smsWho, setSmsWho] = useState('');
  const [smsRef, setSmsRef] = useState('');
  const [smsType, setSmsType] = useState<Kind>('out');
  const [smsCat, setSmsCat] = useState('');
  const [smsWallet, setSmsWallet] = useState('');
  const [remember, setRemember] = useState(false);

  const [listening, setListening] = useState(false);
  const [voiceText, setVoiceText] = useState('');
  const [voice, setVoice] = useState<ReturnType<typeof parseVoiceTranscript> | null>(null);
  const [speechOk, setSpeechOk] = useState(true);
  const recRef = useRef<any>(null);

  const catById = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);
  const lines = calc.month.lines.filter((l) => !l.archived && !catById.get(l.categoryId)?.archived);

  // Reset only when the sheet opens.
  useEffect(() => {
    if (!isOpen) return;
    setTab('saisie');
    setSmart(false);
    setSmartText('');
    setDateMode(currentMonth === currentMonthKey() ? 'today' : 'custom');
    setCustomDate(currentMonth === currentMonthKey() ? todayStr() : `${currentMonth}-01`);
    setSmsText('');
    setSms(null);
    setVoiceText('');
    setVoice(null);
    setListening(false);
    setAddToBudget(false);
    setLabel('');
    const line = prefill?.lineId ? calc.month.lines.find((l) => l.id === prefill.lineId) : undefined;
    const prefCat = prefill?.categoryId ? catById.get(prefill.categoryId) : undefined;
    if (line) {
      const kind = catById.get(line.categoryId)?.kind || 'out';
      setType(kind);
      setPick({ lineId: line.id, categoryId: line.categoryId });
      setAmountStr(prefill?.amount ? String(prefill.amount) : '');
    } else if (prefCat) {
      setType(prefCat.kind);
      setPick({ lineId: null, categoryId: prefCat.id });
      setAmountStr(prefill?.amount ? String(prefill.amount) : '');
    } else {
      setType(initialType);
      setPick(null);
      setAmountStr('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => () => recRef.current?.abort?.(), []);

  if (!isOpen) return null;

  const resolvedDate = (() => {
    if (dateMode === 'custom') return customDate;
    const d = new Date();
    if (dateMode === 'yesterday') d.setDate(d.getDate() - 1);
    const p = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
  })();

  const remainingOf = (l: MonthLine) => Math.max(0, (l.amount || 0) - (calc.byLine[l.id] || 0));
  const kindCats = sortCategories(categories.filter((c) => !c.archived && c.kind === type));
  const typeLines = lines.filter((l) => catById.get(l.categoryId)?.kind === type);
  const pickLines = pick ? typeLines.filter((l) => l.categoryId === pick.categoryId) : [];
  const labelMatch = !pick && label.trim() ? matchLine(label, typeLines, categories) : null;

  const finish = (d: QuickAddDraft) => {
    triggerHaptic('success');
    if (d.walletId) localStorage.setItem('nsangaweh-last-wallet', d.walletId);
    onSave(d);
    onClose();
  };

  const submitSaisie = () => {
    const oneoffCat = addToBudget && pick && !pick.lineId && label.trim() ? pick.categoryId : undefined;
    if (smart) {
      const p = parseQuick(smartText, calc.month, categories);
      if (!p.amt) return triggerHaptic('warning');
      return finish({
        type: p.type,
        amt: p.amt,
        label: p.label || defaultEntryLabel(p.type),
        date: resolvedDate,
        categoryId: p.line?.categoryId || null,
        lineId: p.line?.id || null,
        walletId,
        src: 'manual',
      });
    }
    const amt = parseInt(amountStr, 10);
    if (!amt || amt <= 0) return triggerHaptic('warning');
    const chosenLine = pick?.lineId ? lines.find((l) => l.id === pick.lineId) : labelMatch;
    const cleanLabel = label.trim().slice(0, MAX_NAME_LENGTH);
    finish({
      type,
      amt,
      label: chosenLine?.label || cleanLabel || (pick ? catById.get(pick.categoryId)?.name || '' : '') || defaultEntryLabel(type),
      date: resolvedDate,
      categoryId: chosenLine?.categoryId || pick?.categoryId || (oneoffCat !== undefined ? oneoffCat : null),
      lineId: chosenLine?.id || null,
      walletId,
      src: 'manual',
      createOneoff: oneoffCat !== undefined ? { categoryId: oneoffCat } : undefined,
    });
  };

  const parseSms = (text: string) => {
    setSmsText(text);
    if (!text.trim()) return setSms(null);
    const res = parseMomoSMS(text, calc.month.entries);
    setSms(res);
    if (res.amount) setSmsAmt(String(res.amount));
    if (res.fee) setSmsFee(String(res.fee));
    if (res.who) setSmsWho(res.who);
    if (res.ref) setSmsRef(res.ref);
    setSmsType(res.direction === 'in' ? 'in' : 'out');
    setType(res.direction === 'in' ? 'in' : 'out');
    const w =
      res.operator === 'MTN' ? wallets.find((x) => x.type === 'momo') : res.operator === 'Orange' ? wallets.find((x) => x.type === 'om') : undefined;
    setSmsWallet(w?.id || wallets[0]?.id || '');
    const mem = res.who ? recipientMemories.find((m) => m.name.toLowerCase() === res.who!.toLowerCase()) : undefined;
    setSmsCat(mem && catById.get(mem.categoryId) && !catById.get(mem.categoryId)!.archived ? mem.categoryId : '');
  };

  const submitSms = () => {
    const amt = parseInt(smsAmt, 10);
    if (!amt) return;
    const inCat = smsCat ? lines.filter((l) => l.categoryId === smsCat) : [];
    const line = smsWho ? matchLine(smsWho, inCat, categories) : null;
    finish({
      type,
      amt,
      label: line?.label || smsWho || 'Opération Mobile Money',
      date: resolvedDate,
      categoryId: smsCat || null,
      lineId: line?.id || null,
      walletId: smsWallet || walletId,
      fee: parseInt(smsFee, 10) || 0,
      ref: smsRef || undefined,
      who: smsWho || undefined,
      src: 'sms',
      saveMemory: remember && smsWho && smsCat ? { name: smsWho, categoryId: smsCat } : undefined,
    });
  };

  const toggleVoice = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return setSpeechOk(false);
    if (listening) {
      recRef.current?.stop();
      return setListening(false);
    }
    try {
      const r = new SR();
      r.lang = 'fr-FR';
      r.interimResults = true;
      r.onstart = () => {
        setListening(true);
        setVoiceText('');
        setVoice(null);
      };
      r.onresult = (ev: any) => {
        const t = Array.from(ev.results)
          .map((x: any) => x[0].transcript)
          .join('');
        setVoiceText(t);
        setVoice(parseVoiceTranscript(t));
      };
      r.onerror = () => setListening(false);
      r.onend = () => setListening(false);
      recRef.current = r;
      r.start();
    } catch {
      setSpeechOk(false);
    }
  };

  const submitVoice = () => {
    if (!voice?.amount) return;
    const vType: Kind = type;
    const line = matchLine(voice.label, lines.filter((l) => catById.get(l.categoryId)?.kind === vType), categories);
    finish({
      type: vType,
      amt: voice.amount,
      label: line?.label || voice.label || defaultEntryLabel(vType),
      date: voice.dateStr || resolvedDate,
      categoryId: line?.categoryId || null,
      lineId: line?.id || null,
      walletId,
      src: 'voice',
    });
  };

  const typeLabel = (t: Kind) => (t === 'out' ? 'Sortie' : t === 'in' ? 'Entrée' : 'Épargne');

  const walletPicker = (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-heading font-bold text-[var(--color-text)] px-0.5">{type === 'in' ? 'Reçu sur' : 'Payé avec'}</span>
      <div className="flex flex-wrap gap-1.5">
        {wallets.map((w) => (
          <button
            key={w.id}
            type="button"
            onClick={() => setWalletId(w.id)}
            className={`min-h-10 px-3 rounded-full text-xs font-bold border transition ${
              walletId === w.id ? 'bg-[var(--color-text)] text-[var(--color-surface)] border-transparent' : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text)]'
            }`}
            aria-pressed={walletId === w.id}
          >
            {w.name}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 animate-in fade-in duration-150" role="dialog" aria-modal="true" aria-label="Noter une opération" onClick={onClose}>
      <div className="w-full max-w-[480px] bg-[var(--color-surface)] rounded-t-[28px] border-t border-[var(--color-border)] shadow-[var(--shadow-raised)] flex flex-col max-h-[94dvh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="pt-3 pb-3 px-4 flex flex-col gap-2.5 border-b border-[var(--color-border)] shrink-0">
          <span className="w-9 h-1 rounded-full bg-[var(--color-border)] mx-auto" />
          <div className="flex items-center justify-between">
            <h3 className="m-0 text-base font-heading font-extrabold text-[var(--color-text)]">Noter une opération</h3>
            <button type="button" onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center text-[var(--color-text-muted)]" aria-label="Fermer">
              <X size={20} />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-1.5" role="radiogroup" aria-label="Type d’opération">
            {(['out', 'in', 'save'] as const).map((t) => (
              <button
                key={t}
                type="button"
                role="radio"
                aria-checked={type === t}
                onClick={() => {
                  triggerHaptic('light');
                  setType(t);
                  setPick(null);
                  setAddToBudget(false);
                  setSmsCat('');
                }}
                className={`min-h-[56px] rounded-xl font-heading font-bold transition leading-tight ${
                  type === t
                    ? `${t === 'in' ? 'bg-[var(--color-income)]' : t === 'save' ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-expense)]'} text-white shadow-xs`
                    : 'bg-[var(--color-surface-subtle)] text-[var(--color-text-muted)]'
                }`}
              >
                <span className="block text-sm">{typeLabel(t)}</span>
                <span className="block text-[10px] font-semibold opacity-90">{t === 'out' ? 'j’ai payé' : t === 'in' ? 'j’ai reçu' : 'je mets de côté'}</span>
              </button>
            ))}
          </div>

          <span className="text-[11px] font-semibold text-[var(--color-text-muted)] -mb-1 px-0.5">Comment voulez-vous le noter ?</span>
          <div className="grid grid-cols-3 gap-1.5" role="tablist" aria-label="Façon de noter">
            {(
              [
                ['saisie', 'Saisir', PenLine],
                ['voix', 'Dicter', Mic],
                ['sms', 'Coller un SMS', MessageSquareText],
              ] as const
            ).map(([m, label, Icon]) => (
              <button
                key={m}
                type="button"
                role="tab"
                aria-selected={tab === m}
                onClick={() => {
                  triggerHaptic('light');
                  setTab(m);
                }}
                className={`min-h-[60px] rounded-xl border-2 flex flex-col items-center justify-center gap-1 text-xs font-heading font-bold transition active:scale-[0.98] ${
                  tab === m
                    ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)] text-[var(--color-primary)]'
                    : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)]'
                }`}
              >
                <Icon size={22} />
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-3 flex flex-col gap-3 no-scrollbar">
          {tab === 'saisie' && (
            <>
              {!smart ? (
                <>
                  <div className="py-2 px-4 rounded-2xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)] flex items-center justify-between">
                    <span className="text-xs font-heading font-semibold text-[var(--color-text-muted)]">Combien ?</span>
                    <span className="flex items-baseline gap-1.5">
                      <span className={`text-3xl font-heading font-extrabold num ${amountStr ? '' : 'text-[var(--color-text-muted)]/50'}`}>
                        {amountStr ? fmt(parseInt(amountStr, 10)) : '0'}
                      </span>
                      <span className="text-xs font-heading font-bold text-[var(--color-primary)]">F</span>
                    </span>
                  </div>
                  <Keypad value={amountStr} onChange={setAmountStr} />

                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-heading font-bold text-[var(--color-text)] px-0.5">
                      {type === 'in' ? 'D’où vient cet argent ?' : 'C’est pour quoi ?'}{' '}
                      <span className="font-normal text-[var(--color-text-muted)]">(facultatif)</span>
                    </span>
                    {kindCats.length ? (
                      <div className="grid grid-cols-3 gap-1.5">
                        {kindCats.map((c) => {
                          const sel = pick?.categoryId === c.id;
                          return (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => {
                                triggerHaptic('light');
                                setPick(sel ? null : { lineId: null, categoryId: c.id });
                                setAddToBudget(false);
                              }}
                              className={`min-h-[60px] p-1.5 rounded-xl border flex flex-col items-center justify-center gap-1 text-[11px] font-semibold leading-tight text-center transition ${
                                sel ? 'border-transparent text-white' : 'border-[var(--color-border)] text-[var(--color-text)] bg-[var(--color-surface)]'
                              }`}
                              style={sel ? { backgroundColor: c.color } : undefined}
                              aria-pressed={sel}
                            >
                              <RubricBadge icon={c.icon} color={sel ? '#FFFFFF' : c.color} size="sm" />
                              <span className="line-clamp-2">{c.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <span className="text-[11px] text-[var(--color-text-muted)] px-0.5">
                        Pas encore de rubrique : l’opération sera notée « sans rubrique ». Vous pourrez la ranger plus tard.
                      </span>
                    )}
                  </div>

                  {pick && pickLines.length > 0 && (
                    <div className="flex flex-col gap-1.5">
                      <span className="text-xs font-heading font-bold text-[var(--color-text)] px-0.5">
                        Laquelle ? <span className="font-normal text-[var(--color-text-muted)]">(facultatif)</span>
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {pickLines.map((l) => {
                          const sel = pick.lineId === l.id;
                          const rem = remainingOf(l);
                          return (
                            <button
                              key={l.id}
                              type="button"
                              onClick={() => {
                                triggerHaptic('light');
                                setPick({ categoryId: l.categoryId, lineId: sel ? null : l.id });
                                if (!sel && rem > 0 && !amountStr) setAmountStr(String(rem));
                              }}
                              className={`min-h-10 px-3 rounded-full border text-xs font-semibold transition ${
                                sel ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]' : 'bg-[var(--color-surface)] border-[var(--color-border)]'
                              }`}
                              aria-pressed={sel}
                            >
                              {l.label}
                              {rem > 0 && <span className={`ml-1 text-[10px] num ${sel ? 'text-white/80' : 'text-[var(--color-text-muted)]'}`}>reste {fmt(rem)}</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-heading font-bold text-[var(--color-text)] px-0.5">
                      Détail <span className="font-normal text-[var(--color-text-muted)]">(facultatif)</span>
                    </span>
                    <input
                      type="text"
                      value={label}
                      maxLength={MAX_NAME_LENGTH}
                      onChange={(e) => setLabel(e.target.value)}
                      placeholder={type === 'in' ? 'Ex : salaire d’octobre' : 'Ex : essence moto, marché, beignets'}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] focus:border-[var(--color-primary)] focus:outline-hidden"
                      aria-label="Détail"
                    />
                    {pick && !pick.lineId && label.trim() && calc.byCategory[pick.categoryId]?.mode === 'lines' && (
                      <label className="flex items-center gap-2 text-[11px] text-[var(--color-text-muted)] px-0.5 py-1">
                        <input type="checkbox" checked={addToBudget} onChange={(e) => setAddToBudget(e.target.checked)} className="w-4 h-4" />
                        Ajouter « {label.trim()} » comme ligne du budget de ce mois
                      </label>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex flex-col gap-1.5">
                  <input
                    type="text"
                    autoFocus
                    value={smartText}
                    onChange={(e) => setSmartText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && submitSaisie()}
                    placeholder="Ex : 5000 beurre, +150000 salaire, 5k taxi"
                    className="w-full px-3 py-2.5 text-sm rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] focus:border-[var(--color-primary)] focus:outline-hidden"
                    aria-label="Saisie en une ligne"
                  />
                  {smartText.trim() &&
                    (() => {
                      const p = parseQuick(smartText, calc.month, categories);
                      return (
                        <div className="p-2 rounded-xl bg-[var(--color-primary-light)] text-[11px] text-[var(--color-primary)] font-medium">
                          {typeLabel(p.type)} · <b>{fmt(p.amt)} F</b> · {p.label || '—'}
                          {p.line ? ` · ${catById.get(p.line.categoryId)?.name}` : ''}
                        </div>
                      );
                    })()}
                </div>
              )}

              {walletPicker}

              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-heading font-bold text-[var(--color-text)] px-0.5">Quand ?</span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {currentMonth === currentMonthKey() &&
                    (['today', 'yesterday'] as const).map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setDateMode(d)}
                        className={`min-h-10 px-3 rounded-full text-xs font-bold border ${
                          dateMode === d ? 'bg-[var(--color-text)] text-[var(--color-surface)] border-transparent' : 'bg-[var(--color-surface)] border-[var(--color-border)]'
                        }`}
                      >
                        {d === 'today' ? 'Aujourd’hui' : 'Hier'}
                      </button>
                    ))}
                  <label
                    className={`min-h-10 px-3 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
                      dateMode === 'custom' ? 'bg-[var(--color-text)] text-[var(--color-surface)] border-transparent' : 'bg-[var(--color-surface)] border-[var(--color-border)]'
                    }`}
                  >
                    <Calendar size={13} />
                    <input
                      type="date"
                      value={customDate}
                      onChange={(e) => {
                        setCustomDate(e.target.value);
                        setDateMode('custom');
                      }}
                      onFocus={() => setDateMode('custom')}
                      className="bg-transparent text-xs font-bold w-[110px]"
                      aria-label="Autre date"
                    />
                  </label>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSmart((v) => !v)}
                className="self-start min-h-9 text-[11px] font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-primary)] flex items-center gap-1"
              >
                <Sparkles size={12} className="text-[var(--color-accent)]" />
                {smart ? 'Revenir au clavier' : 'Ou écrire en une ligne (ex : « 5000 beurre »)'}
              </button>
            </>
          )}

          {tab === 'sms' && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-heading font-bold">Collez le SMS de confirmation MTN ou Orange</span>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const t = await navigator.clipboard?.readText?.();
                      if (t) parseSms(t);
                    } catch {
                      /* clipboard refused */
                    }
                  }}
                  className="px-2.5 py-1 rounded-xl bg-[var(--color-primary-light)] text-[var(--color-primary)] text-xs font-bold flex items-center gap-1"
                >
                  <Clipboard size={13} /> Coller
                </button>
              </div>
              <textarea
                rows={3}
                value={smsText}
                onChange={(e) => parseSms(e.target.value)}
                placeholder="Ex : Transfert effectue avec succes. Vous avez envoye 25 000 FCFA a ... ID transaction: 18274910283."
                className="w-full p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-subtle)] text-xs font-mono leading-relaxed"
              />
              {sms && (
                <div className="p-3 rounded-2xl border border-[var(--color-border)] flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-full bg-[var(--color-primary-light)] text-[var(--color-primary)] text-[10px] font-bold">
                      {sms.operator} · {sms.type}
                    </span>
                    {sms.isDuplicate && (
                      <span className="px-2 py-0.5 rounded-full bg-[var(--color-warning-soft)] text-[var(--color-warning)] text-[10px] font-bold flex items-center gap-1">
                        <AlertCircle size={10} /> Déjà enregistré
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <label className="flex flex-col gap-0.5">
                      <span className="text-[10px] text-[var(--color-text-muted)] font-semibold">Montant (F)</span>
                      <input inputMode="numeric" value={smsAmt} onChange={(e) => setSmsAmt(e.target.value.replace(/\D/g, '').slice(0, 9))} className="px-2.5 py-1.5 rounded-lg border border-[var(--color-border)] font-bold num" />
                    </label>
                    <label className="flex flex-col gap-0.5">
                      <span className="text-[10px] text-[var(--color-text-muted)] font-semibold">Frais (F)</span>
                      <input inputMode="numeric" value={smsFee} onChange={(e) => setSmsFee(e.target.value.replace(/\D/g, '').slice(0, 9))} className="px-2.5 py-1.5 rounded-lg border border-[var(--color-border)] font-bold num" />
                    </label>
                    <label className="flex flex-col gap-0.5">
                      <span className="text-[10px] text-[var(--color-text-muted)] font-semibold">Destinataire ou émetteur</span>
                      <input value={smsWho} onChange={(e) => setSmsWho(e.target.value)} className="px-2.5 py-1.5 rounded-lg border border-[var(--color-border)]" />
                    </label>
                    <label className="flex flex-col gap-0.5">
                      <span className="text-[10px] text-[var(--color-text-muted)] font-semibold">Rubrique</span>
                      <select value={smsCat} onChange={(e) => setSmsCat(e.target.value)} className="px-2 py-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
                        <option value="">Sans rubrique</option>
                        {sortCategories(categories.filter((c) => !c.archived && c.kind === type)).map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  {smsWho && smsCat && (
                    <label className="flex items-center gap-2 text-[11px] text-[var(--color-text-muted)]">
                      <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                      Toujours ranger <b>{smsWho}</b> dans <b>{catById.get(smsCat)?.name}</b>
                    </label>
                  )}
                  {!!parseInt(smsFee, 10) && (
                    <span className="text-[10px] text-[var(--color-text-muted)]">Les frais sont notés à part, comme une dépense sans rubrique.</span>
                  )}
                </div>
              )}
            </div>
          )}

          {tab === 'voix' && (
            <div className="flex flex-col items-center gap-3 py-1 text-center">
              <div className="max-w-xs">
                <span className="text-sm font-heading font-bold block">Appuyez sur le micro, puis parlez</span>
                <small className="text-xs text-[var(--color-text-muted)] mt-1 block">
                  {type === 'in'
                    ? 'Dites par exemple : « cent mille salaire »'
                    : type === 'save'
                    ? 'Dites par exemple : « dix mille tontine »'
                    : 'Dites par exemple : « cinq mille beurre » ou « vingt-cinq mille maman »'}
                </small>
              </div>
              {!speechOk ? (
                <div className="p-3 rounded-xl bg-[var(--color-warning-soft)] text-xs text-left">
                  La dictée n’est pas disponible sur ce navigateur. Utilisez « Saisir » ou « Coller un SMS ».
                </div>
              ) : (
                <button
                  type="button"
                  onClick={toggleVoice}
                  className={`w-24 h-24 rounded-full flex items-center justify-center text-white shadow-lg ${listening ? 'bg-rose-500 animate-pulse' : 'bg-[var(--color-primary)]'}`}
                  aria-label={listening ? 'Arrêter' : 'Parler'}
                >
                  {listening ? <MicOff size={38} /> : <Mic size={38} />}
                </button>
              )}
              {listening && <span className="text-xs font-semibold text-rose-500">Je vous écoute… parlez distinctement</span>}
              {voiceText && (
                <div className="w-full p-3 rounded-2xl bg-[var(--color-surface-subtle)] text-left flex flex-col gap-2">
                  <p className="m-0 text-xs italic">« {voiceText} »</p>
                  {voice?.amount ? (
                    <div className="p-2.5 rounded-xl bg-[var(--color-primary-light)] text-[var(--color-primary)] flex justify-between gap-2 text-xs font-bold">
                      <span className="min-w-0">
                        {typeLabel(type)} : {voice.label || '—'}
                      </span>
                      <span className="num whitespace-nowrap">{fmt(voice.amount)} F</span>
                    </div>
                  ) : (
                    <small className="text-[11px] text-[var(--color-text-muted)]">Je n’ai pas entendu de montant. Dites un montant puis un motif.</small>
                  )}
                </div>
              )}
              <div className="w-full text-left">{walletPicker}</div>
            </div>
          )}
        </div>

        <div className="px-4 pt-2 pb-[calc(12px+env(safe-area-inset-bottom,0px))] border-t border-[var(--color-border)] shrink-0">
          {tab === 'saisie' && (
            <button type="button" onClick={() => submitSaisie()} className="w-full min-h-12 rounded-2xl bg-[var(--color-primary)] text-white font-heading font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98]">
              <Check size={18} />
              {smart || !amountStr
                ? 'Enregistrer'
                : `Enregistrer ${type === 'in' ? 'l’entrée' : type === 'save' ? 'l’épargne' : 'la sortie'} de ${fmt(parseInt(amountStr, 10))} F`}
            </button>
          )}
          {tab === 'sms' && (
            <button type="button" disabled={!sms} onClick={submitSms} className="w-full min-h-12 rounded-2xl bg-[var(--color-primary)] text-white font-heading font-bold text-sm disabled:opacity-40">
              Valider l’opération SMS
            </button>
          )}
          {tab === 'voix' && (
            <button type="button" disabled={!voice?.amount} onClick={submitVoice} className="w-full min-h-12 rounded-2xl bg-[var(--color-primary)] text-white font-heading font-bold text-sm disabled:opacity-40">
              <Check size={18} className="mr-1.5 inline" />
              {`Enregistrer ${type === 'in' ? 'l’entrée' : type === 'save' ? 'l’épargne' : 'la sortie'}`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
