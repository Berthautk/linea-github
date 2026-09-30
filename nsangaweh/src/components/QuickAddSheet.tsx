import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle, Calendar, Check, Clipboard, Mic, MicOff, Sparkles, Wallet as WalletIcon, X } from 'lucide-react';
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
  lineId: string;
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
  const [showOneoff, setShowOneoff] = useState(false);
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
    setShowOneoff(false);
    setLabel('');
    const line = prefill ? calc.month.lines.find((l) => l.id === prefill.lineId) : undefined;
    if (line) {
      const kind = catById.get(line.categoryId)?.kind || 'out';
      setType(kind);
      setPick({ lineId: line.id, categoryId: line.categoryId });
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
  const envelopeCats = kindCats.filter((c) => calc.byCategory[c.id]?.mode === 'envelope');
  const labelMatch = !pick && label.trim() ? matchLine(label, typeLines, categories) : null;

  const finish = (d: QuickAddDraft) => {
    triggerHaptic('success');
    if (d.walletId) localStorage.setItem('nsangaweh-last-wallet', d.walletId);
    onSave(d);
    onClose();
  };

  const submitSaisie = (oneoffCat?: string | null) => {
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
      type: smsType,
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
    const vType: Kind = voice.type === 'in' ? 'in' : 'out';
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

  const typeLabel = (t: Kind) => (t === 'out' ? 'Dépense' : t === 'in' ? 'Revenu' : 'Épargne');

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 animate-in fade-in duration-150" role="dialog" aria-modal="true" aria-label="Noter une opération" onClick={onClose}>
      <div className="w-full max-w-[480px] bg-[var(--color-surface)] rounded-t-[28px] border-t border-[var(--color-border)] shadow-[var(--shadow-raised)] flex flex-col max-h-[94dvh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="pt-3 pb-2 px-4 flex flex-col gap-2 border-b border-[var(--color-border)] shrink-0">
          <span className="w-9 h-1 rounded-full bg-[var(--color-border)] mx-auto" />
          <div className="flex items-center justify-between">
            <div className="flex p-0.5 bg-[var(--color-surface-subtle)] rounded-xl border border-[var(--color-border)]">
              {(['saisie', 'sms', 'voix'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setTab(m)}
                  className={`px-3 py-1 rounded-lg text-xs font-heading font-bold transition ${
                    tab === m ? 'bg-[var(--color-surface)] text-[var(--color-primary)] shadow-xs' : 'text-[var(--color-text-muted)]'
                  }`}
                >
                  {m === 'saisie' ? 'Saisie' : m === 'sms' ? 'SMS MoMo' : 'Voix'}
                </button>
              ))}
            </div>
            <button type="button" onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--color-text-muted)]" aria-label="Fermer">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-3 flex flex-col gap-3 no-scrollbar">
          {tab === 'saisie' && (
            <>
              <div className="grid grid-cols-3 p-1 bg-[var(--color-surface-subtle)] rounded-xl border border-[var(--color-border)]">
                {(['out', 'in', 'save'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      setType(t);
                      setPick(null);
                      setShowOneoff(false);
                    }}
                    className={`py-1.5 rounded-lg text-xs font-heading font-bold transition ${
                      type === t
                        ? `${t === 'in' ? 'bg-[var(--color-income)]' : t === 'save' ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-expense)]'} text-white shadow-xs`
                        : 'text-[var(--color-text-muted)]'
                    }`}
                  >
                    {typeLabel(t)}
                  </button>
                ))}
              </div>

              {!smart && (
                <div className="py-2 px-4 rounded-2xl bg-[var(--color-surface-subtle)] border border-[var(--color-border)] flex items-center justify-between">
                  <span className="text-xs font-heading font-semibold text-[var(--color-text-muted)]">Montant</span>
                  <span className="flex items-baseline gap-1.5">
                    <span className={`text-3xl font-heading font-extrabold num ${amountStr ? '' : 'text-[var(--color-text-muted)]/50'}`}>
                      {amountStr ? fmt(parseInt(amountStr, 10)) : '0'}
                    </span>
                    <span className="text-xs font-heading font-bold text-[var(--color-primary)]">F</span>
                  </span>
                </div>
              )}

              {!smart ? (
                <>
                  {(typeLines.length > 0 || envelopeCats.length > 0) && (
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[11px] font-semibold text-[var(--color-text-muted)] px-1">Pour quelle ligne ?</span>
                      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                        {typeLines.map((l) => {
                          const c = catById.get(l.categoryId);
                          const sel = pick?.lineId === l.id;
                          const rem = remainingOf(l);
                          return (
                            <button
                              key={l.id}
                              type="button"
                              onClick={() => {
                                triggerHaptic('light');
                                if (sel) return setPick(null);
                                setPick({ lineId: l.id, categoryId: l.categoryId });
                                if (rem > 0 && !amountStr) setAmountStr(String(rem));
                              }}
                              className={`shrink-0 h-9 pl-1 pr-2.5 rounded-full flex items-center gap-1.5 border text-xs font-medium transition ${
                                sel ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]' : 'bg-[var(--color-surface)] border-[var(--color-border)]'
                              }`}
                            >
                              <RubricBadge icon={c?.icon} color={sel ? '#FFFFFF' : c?.color} size="sm" className="!w-7 !h-7 rounded-full" />
                              <span className="truncate max-w-[120px]">{l.label}</span>
                              {rem > 0 && <span className={`text-[10px] num ${sel ? 'text-white/80' : 'text-[var(--color-text-muted)]'}`}>reste {fmt(rem)}</span>}
                            </button>
                          );
                        })}
                        {envelopeCats.map((c) => {
                          const sel = pick && !pick.lineId && pick.categoryId === c.id;
                          const rem = calc.byCategory[c.id]?.remaining || 0;
                          return (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => setPick(sel ? null : { lineId: null, categoryId: c.id })}
                              className={`shrink-0 h-9 pl-1 pr-2.5 rounded-full flex items-center gap-1.5 border text-xs font-medium transition ${
                                sel ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]' : 'bg-[var(--color-surface)] border-[var(--color-border)]'
                              }`}
                            >
                              <RubricBadge icon={c.icon} color={sel ? '#FFFFFF' : c.color} size="sm" className="!w-7 !h-7 rounded-full" />
                              <span className="truncate max-w-[120px]">{c.name}</span>
                              {rem > 0 && <span className={`text-[10px] num ${sel ? 'text-white/80' : 'text-[var(--color-text-muted)]'}`}>reste {fmt(rem)}</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {!pick && (
                    <input
                      type="text"
                      value={label}
                      maxLength={MAX_NAME_LENGTH}
                      onChange={(e) => {
                        setLabel(e.target.value);
                        setShowOneoff(false);
                      }}
                      placeholder="Libellé (ex : Pousseur, Beignets, Don)"
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] focus:border-[var(--color-primary)] focus:outline-hidden"
                      aria-label="Libellé"
                    />
                  )}

                  {!pick && labelMatch && (
                    <span className="text-[11px] text-[var(--color-text-muted)] px-1">
                      Sera rangé dans la ligne « {labelMatch.label} » ({catById.get(labelMatch.categoryId)?.name}).
                    </span>
                  )}

                  {!pick && label.trim() && !labelMatch && type !== 'in' && (
                    <div className="p-2.5 rounded-2xl border border-dashed border-[var(--color-border)] flex flex-col gap-2">
                      {!showOneoff ? (
                        <button
                          type="button"
                          onClick={() => setShowOneoff(true)}
                          className="text-xs font-heading font-bold text-[var(--color-primary)] text-left"
                        >
                          + Créer une ligne ponctuelle pour ce mois
                        </button>
                      ) : (
                        <>
                          <span className="text-[11px] text-[var(--color-text-muted)]">
                            Dans quelle rubrique ? La ligne « {label.trim()} » sera créée pour ce mois seulement.
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {kindCats.map((c) => (
                              <button
                                key={c.id}
                                type="button"
                                onClick={() => submitSaisie(c.id)}
                                className="h-9 pl-1 pr-2.5 rounded-full border border-[var(--color-border)] flex items-center gap-1.5 text-xs font-semibold"
                              >
                                <RubricBadge icon={c.icon} color={c.color} size="sm" className="!w-7 !h-7 rounded-full" />
                                {c.name}
                              </button>
                            ))}
                            {!kindCats.some((c) => c.name.toLowerCase() === OTHER_RUBRIC_DEFAULT.name.toLowerCase()) && (
                              <button
                                type="button"
                                onClick={() => submitSaisie(null)}
                                className="h-9 px-3 rounded-full border border-[var(--color-border)] text-xs font-semibold"
                              >
                                {OTHER_RUBRIC_DEFAULT.name}
                              </button>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  )}
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
                          {p.line ? ` · ${catById.get(p.line.categoryId)?.name}` : ' · sans ligne'}
                        </div>
                      );
                    })()}
                </div>
              )}

              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5 min-w-0">
                  <WalletIcon size={14} className="text-[var(--color-text-muted)] shrink-0" />
                  {wallets.map((w) => (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => setWalletId(w.id)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold shrink-0 ${
                        walletId === w.id ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-surface-subtle)] text-[var(--color-text-muted)]'
                      }`}
                    >
                      {w.name}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Calendar size={13} className="text-[var(--color-text-muted)]" />
                  {currentMonth === currentMonthKey() ? (
                    (['today', 'yesterday'] as const).map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setDateMode(d)}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                          dateMode === d ? 'bg-[var(--color-text)] text-[var(--color-surface)]' : 'bg-[var(--color-surface-subtle)] text-[var(--color-text-muted)]'
                        }`}
                      >
                        {d === 'today' ? 'Aujourd’hui' : 'Hier'}
                      </button>
                    ))
                  ) : (
                    <input
                      type="date"
                      value={customDate}
                      onChange={(e) => setCustomDate(e.target.value)}
                      className="px-1.5 py-1 rounded-lg text-[10px] font-bold bg-[var(--color-surface-subtle)]"
                      aria-label="Date"
                    />
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSmart((s) => !s)}
                className="self-start text-[11px] font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-primary)] flex items-center gap-1"
              >
                <Sparkles size={12} className="text-[var(--color-accent)]" />
                {smart ? 'Retour au clavier numérique' : 'Saisie rapide en 1 ligne'}
              </button>

              {!smart && <Keypad value={amountStr} onChange={setAmountStr} />}
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
                        {sortCategories(categories.filter((c) => !c.archived && c.kind === smsType)).map((c) => (
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
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <div className="max-w-xs">
                <span className="text-sm font-heading font-bold block">Dictez votre dépense en français</span>
                <small className="text-xs text-[var(--color-text-muted)] mt-1 block">Exemples : « cinq mille beurre », « vingt-cinq mille maman »</small>
              </div>
              {!speechOk ? (
                <div className="p-3 rounded-xl bg-[var(--color-warning-soft)] text-xs text-left">
                  La reconnaissance vocale n’est pas disponible sur ce navigateur. Utilisez la saisie en 1 ligne.
                </div>
              ) : (
                <button
                  type="button"
                  onClick={toggleVoice}
                  className={`w-20 h-20 rounded-full flex items-center justify-center text-white shadow-lg ${listening ? 'bg-rose-500 animate-pulse' : 'bg-[var(--color-primary)]'}`}
                  aria-label={listening ? 'Arrêter' : 'Parler'}
                >
                  {listening ? <MicOff size={32} /> : <Mic size={32} />}
                </button>
              )}
              {voiceText && (
                <div className="w-full p-3 rounded-2xl bg-[var(--color-surface-subtle)] text-left flex flex-col gap-2">
                  <p className="m-0 text-xs italic">« {voiceText} »</p>
                  {voice?.amount ? (
                    <div className="p-2.5 rounded-xl bg-[var(--color-primary-light)] text-[var(--color-primary)] flex justify-between text-xs font-bold">
                      <span>
                        {voice.type === 'in' ? 'Revenu' : 'Dépense'} : {voice.label}
                      </span>
                      <span className="num">{fmt(voice.amount)} F</span>
                    </div>
                  ) : (
                    <small className="text-[11px] text-[var(--color-text-muted)]">Dites un montant et un motif.</small>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="px-4 pt-2 pb-[calc(12px+env(safe-area-inset-bottom,0px))] border-t border-[var(--color-border)] shrink-0">
          {tab === 'saisie' && (
            <button type="button" onClick={() => submitSaisie()} className="w-full min-h-12 rounded-2xl bg-[var(--color-primary)] text-white font-heading font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98]">
              <Check size={18} /> Enregistrer
            </button>
          )}
          {tab === 'sms' && (
            <button type="button" disabled={!sms} onClick={submitSms} className="w-full min-h-12 rounded-2xl bg-[var(--color-primary)] text-white font-heading font-bold text-sm disabled:opacity-40">
              Valider l’opération SMS
            </button>
          )}
          {tab === 'voix' && (
            <button type="button" disabled={!voice?.amount} onClick={submitVoice} className="w-full min-h-12 rounded-2xl bg-[var(--color-primary)] text-white font-heading font-bold text-sm disabled:opacity-40">
              Confirmer et enregistrer
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
