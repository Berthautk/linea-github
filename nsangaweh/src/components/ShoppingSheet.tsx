import React, { useMemo, useState } from 'react';
import { ArrowLeft, Bike, Check, Mic, MicOff, Plus, ShoppingBasket, Trash2 } from 'lucide-react';
import { fmt, generateId, monthLabel, todayStr } from '../lib/budget-math';
import { sortCategories } from '../lib/calc';
import { guessCategory, parseShoppingTranscript } from '../lib/shopping';
import { useVoice } from '../lib/useVoice';
import { Category, MonthLine, ShoppingItem, ShoppingList, Wallet } from '../lib/types';
import { ErrorText, FieldLabel, inputClass, PrimaryButton, Sheet } from './ui';

export interface ShoppingPurchase {
  label: string;
  amt: number;
  categoryId: string | null;
  lineId: string | null;
}

const card = 'rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3.5 flex flex-col gap-2.5';
const muted = 'text-[12px] text-[var(--color-text-muted)]';
const num = (s: string) => parseInt(s.replace(/\D/g, ''), 10) || 0;
const sum = (items: ShoppingItem[]) => items.reduce((s, i) => s + (i.amt || 0), 0);

export const ShoppingSheet: React.FC<{
  open: boolean;
  lists: ShoppingList[];
  categories: Category[];
  lines: MonthLine[];
  wallets: Wallet[];
  myUid: string;
  onChange: (lists: ShoppingList[], message?: string) => void;
  onFinish: (list: ShoppingList, purchases: ShoppingPurchase[], walletId: string) => void;
  onClose: () => void;
}> = ({ open, lists, categories, lines, wallets, myUid, onChange, onFinish, onClose }) => {
  const [openId, setOpenId] = useState<string | null>(null);
  const [step, setStep] = useState<'list' | 'finish'>('list');
  const [label, setLabel] = useState('');
  const [amt, setAmt] = useState('');
  const [heard, setHeard] = useState('');
  const [err, setErr] = useState('');
  const [walletId, setWalletId] = useState('');
  const [picks, setPicks] = useState<Record<string, string>>({});

  const list = lists.find((l) => l.id === openId) || null;
  const outCats = useMemo(() => sortCategories(categories.filter((c) => !c.archived && c.kind === 'out')), [categories]);

  const update = (patch: Partial<ShoppingList>, msg?: string) => list && onChange(lists.map((l) => (l.id === list.id ? { ...l, ...patch } : l)), msg);
  const setItems = (items: ShoppingItem[]) => update({ items });
  const patchItem = (id: string, p: Partial<ShoppingItem>) => list && setItems(list.items.map((i) => (i.id === id ? { ...i, ...p } : i)));

  const addItems = (rows: Array<{ label: string; amt: number }>, kind: ShoppingItem['kind'] = 'item') => {
    if (!list || !rows.length) return;
    setItems([...list.items, ...rows.map((r) => ({ id: generateId(), label: r.label, amt: r.amt, done: false, kind }))]);
  };

  const mic = useVoice((t) => setHeard(t));
  const stopAndAdd = () => {
    const rows = parseShoppingTranscript(heard);
    mic.stop();
    if (rows.length) addItems(rows);
    setHeard('');
  };
  const toggleMic = () => {
    if (mic.listening) {
      stopAndAdd();
    } else {
      setHeard('');
      mic.toggle();
    }
  };
  // when the 10 s run out, keep what was heard and add it
  const prevListening = React.useRef(false);
  React.useEffect(() => {
    if (prevListening.current && !mic.listening && heard) {
      const rows = parseShoppingTranscript(heard);
      if (rows.length) addItems(rows);
      setHeard('');
    }
    prevListening.current = mic.listening;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mic.listening]);

  const create = () => {
    const l: ShoppingList = { id: generateId(), name: `Courses du ${todayStr().split('-').reverse().join('/')}`, date: todayStr(), budget: 0, items: [], status: 'open', by: myUid };
    onChange([...lists, l], 'Liste de courses créée.');
    setOpenId(l.id);
    setStep('list');
  };

  const addManual = () => {
    if (!label.trim()) return setErr('Écrivez ce que vous achetez (ex : Tomates).');
    setErr('');
    addItems([{ label: label.trim().slice(0, 40), amt: num(amt) }]);
    setLabel('');
    setAmt('');
  };

  const back = () => {
    mic.stop();
    setHeard('');
    if (step === 'finish') return setStep('list');
    setOpenId(null);
  };

  const close = () => {
    mic.stop();
    setOpenId(null);
    setStep('list');
    onClose();
  };

  const startFinish = () => {
    if (!list) return;
    const bought = list.items.filter((i) => i.done);
    const next: Record<string, string> = {};
    bought.forEach((i) => (next[i.id] = guessCategory(i.label, i.kind, categories, lines).categoryId || ''));
    setPicks(next);
    setWalletId(localStorage.getItem('nsangaweh-last-wallet') || wallets[0]?.id || '');
    setStep('finish');
  };

  const confirm = () => {
    if (!list) return;
    const bought = list.items.filter((i) => i.done && i.amt > 0);
    const purchases: ShoppingPurchase[] = bought.map((i) => {
      const chosen = picks[i.id] || '';
      const g = guessCategory(i.label, i.kind, categories, lines);
      return {
        label: i.label,
        amt: i.amt,
        categoryId: chosen || null,
        lineId: chosen && g.categoryId === chosen ? g.lineId : null,
      };
    });
    onFinish(list, purchases, walletId);
    setOpenId(null);
    setStep('list');
  };

  const total = list ? sum(list.items) : 0;
  const bought = list ? sum(list.items.filter((i) => i.done)) : 0;
  const budget = list?.budget || 0;
  const over = budget > 0 && total > budget;

  /* ------------------------------- list of lists ------------------------------- */
  if (!list) {
    return (
      <Sheet open={open} title="Courses" onClose={close} footer={<PrimaryButton onClick={create}><Plus size={16} /> Nouvelle liste de courses</PrimaryButton>}>
        <div className="flex flex-col gap-3 p-4">
          <p className={`m-0 ${muted}`}>
            Avant d’aller au marché, notez tout ce que vous voulez acheter (à la main ou en parlant). Au marché, cochez au fur et à mesure. À la fin, tout part dans vos sorties.
          </p>
          {!lists.length && <p className={`m-0 text-center py-6 ${muted}`}>Aucune liste pour l’instant.</p>}
          {[...lists].reverse().map((l) => (
            <button key={l.id} type="button" onClick={() => { setOpenId(l.id); setStep('list'); }} className={`${card} text-left`}>
              <div className="flex items-center justify-between gap-2">
                <b className="font-heading text-[14px]">{l.name}</b>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${l.status === 'done' ? 'bg-[var(--color-surface-subtle)] text-[var(--color-text-muted)]' : 'bg-[var(--color-primary-light)] text-[var(--color-primary)]'}`}>
                  {l.status === 'done' ? 'Terminée' : 'En cours'}
                </span>
              </div>
              <span className={muted}>
                {l.items.length} article{l.items.length > 1 ? 's' : ''} · {fmt(sum(l.items))} F{l.budget ? ` sur ${fmt(l.budget)} F prévus` : ''}
              </span>
            </button>
          ))}
        </div>
      </Sheet>
    );
  }

  /* --------------------------------- finishing --------------------------------- */
  if (step === 'finish') {
    const boughtItems = list.items.filter((i) => i.done);
    const missed = list.items.length - boughtItems.length;
    const recorded = boughtItems.filter((i) => i.amt > 0);
    return (
      <Sheet
        open={open}
        title="J’ai terminé mes courses"
        onClose={close}
        headerRight={undefined}
        footer={
          <div className="flex gap-2">
            <PrimaryButton tone="ghost" onClick={back}>Retour</PrimaryButton>
            <PrimaryButton disabled={!recorded.length} onClick={confirm}>
              Enregistrer {fmt(sum(recorded))} F dans mes sorties
            </PrimaryButton>
          </div>
        }
      >
        <div className="flex flex-col gap-3 p-4">
          <p className={`m-0 ${muted}`}>
            Vérifiez chaque achat. Vous pouvez changer le montant réellement payé, ou la rubrique. Seuls les achats cochés sont enregistrés{missed ? ` (${missed} non coché${missed > 1 ? 's' : ''}, ignoré${missed > 1 ? 's' : ''})` : ''}.
          </p>
          {wallets.length > 0 && (
            <div className="flex flex-col gap-1">
              <FieldLabel htmlFor="shop-wallet">Payé avec</FieldLabel>
              <select id="shop-wallet" className={inputClass} value={walletId} onChange={(e) => setWalletId(e.target.value)}>
                {wallets.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          {!boughtItems.length && <p className={`m-0 text-center py-4 ${muted}`}>Aucun article n’est coché. Retournez à la liste et cochez ce que vous avez acheté.</p>}
          <ul className="m-0 p-0 list-none flex flex-col gap-2">
            {boughtItems.map((i) => (
              <li key={i.id} className={card}>
                <div className="flex items-center gap-2">
                  <span className="flex-1 min-w-0 font-semibold text-[13px] truncate">{i.label}</span>
                  <input
                    aria-label={`Montant payé pour ${i.label}`}
                    inputMode="numeric"
                    className={`${inputClass} !w-28 text-right`}
                    value={i.amt ? String(i.amt) : ''}
                    placeholder="0"
                    onChange={(e) => patchItem(i.id, { amt: num(e.target.value) })}
                  />
                  <span className="text-[12px]">F</span>
                </div>
                <select aria-label={`Rubrique pour ${i.label}`} className={inputClass} value={picks[i.id] ?? ''} onChange={(e) => setPicks({ ...picks, [i.id]: e.target.value })}>
                  <option value="">Sans rubrique</option>
                  {outCats.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </li>
            ))}
          </ul>
          <p className={`m-0 ${muted}`}>Ces sorties seront comptées dans {monthLabel(todayStr().slice(0, 7))} et retirées de vos enveloppes.</p>
        </div>
      </Sheet>
    );
  }

  /* ----------------------------------- list ----------------------------------- */
  const readOnly = list.status === 'done';
  return (
    <Sheet
      open={open}
      title={
        <span className="flex items-center gap-2">
          <button type="button" aria-label="Retour aux listes" onClick={back} className="p-1 -ml-1">
            <ArrowLeft size={18} />
          </button>
          {list.name}
        </span>
      }
      onClose={close}
      footer={
        readOnly ? (
          <PrimaryButton tone="ghost" onClick={() => onChange(lists.filter((l) => l.id !== list.id), 'Liste supprimée.')}>
            <Trash2 size={16} /> Supprimer cette liste
          </PrimaryButton>
        ) : (
          <PrimaryButton disabled={!list.items.some((i) => i.done)} onClick={startFinish}>
            <Check size={16} /> J’ai terminé : enregistrer mes achats
          </PrimaryButton>
        )
      }
    >
      <div className="flex flex-col gap-3 p-4">
        <div className={card}>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <span className={`block ${muted}`}>Total de la liste</span>
              <b className={`text-[15px] num ${over ? 'text-[var(--color-expense)]' : ''}`}>{fmt(total)} F</b>
            </div>
            <div>
              <span className={`block ${muted}`}>Déjà acheté</span>
              <b className="text-[15px] num">{fmt(bought)} F</b>
            </div>
            <div>
              <span className={`block ${muted}`}>{budget ? 'Il reste' : 'Prévu'}</span>
              <b className={`text-[15px] num ${budget && budget - total < 0 ? 'text-[var(--color-expense)]' : ''}`}>{budget ? `${fmt(budget - total)} F` : '—'}</b>
            </div>
          </div>
          {!readOnly && (
            <div className="flex flex-col gap-1">
              <FieldLabel htmlFor="shop-budget">Combien j’ai prévu pour ces courses (F)</FieldLabel>
              <input id="shop-budget" inputMode="numeric" className={inputClass} value={list.budget ? String(list.budget) : ''} placeholder="Ex : 15000" onChange={(e) => update({ budget: num(e.target.value) })} />
            </div>
          )}
          {over && <p className="m-0 text-[12px] font-bold text-[var(--color-expense)]">Attention : la liste dépasse de {fmt(total - budget)} F ce que vous avez prévu.</p>}
        </div>

        {!readOnly && (
          <div className={card}>
            <b className="text-[13px]">Ajouter un achat</b>
            <div className="flex gap-2">
              <input aria-label="Achat" className={inputClass} value={label} maxLength={40} placeholder="Ex : Tomates" onChange={(e) => setLabel(e.target.value)} />
              <input aria-label="Prix" inputMode="numeric" className={`${inputClass} !w-24 text-right`} value={amt} placeholder="Prix" onChange={(e) => setAmt(e.target.value.replace(/\D/g, '').slice(0, 9))} />
            </div>
            <ErrorText>{err}</ErrorText>
            <div className="flex gap-2">
              <PrimaryButton onClick={addManual}><Plus size={16} /> Ajouter</PrimaryButton>
              <PrimaryButton tone="ghost" onClick={() => addItems([{ label: 'Transport (moto)', amt: 0 }], 'transport')}>
                <Bike size={16} /> + Moto
              </PrimaryButton>
            </div>
            {mic.supported && (
              <div className="flex flex-col items-center gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={toggleMic}
                  aria-label={mic.listening ? 'Terminé' : 'Dicter mes achats'}
                  className={`w-16 h-16 rounded-full flex items-center justify-center text-white shadow-lg ${mic.listening ? 'bg-rose-500 animate-pulse' : 'bg-[var(--color-primary)]'}`}
                >
                  {mic.listening ? <MicOff size={26} /> : <Mic size={26} />}
                </button>
                <span className="text-[11px] text-center text-[var(--color-text-muted)]">
                  {mic.listening ? `Je vous écoute… ${mic.left} s · touchez quand vous avez fini` : 'Parlez 10 secondes : « tomates 50 francs, sel 200 francs… »'}
                </span>
                {heard && <p className="m-0 text-xs italic text-center">« {heard} »</p>}
              </div>
            )}
          </div>
        )}

        {!list.items.length && <p className={`m-0 text-center py-4 ${muted}`}>La liste est vide. Ajoutez votre premier achat ci-dessus.</p>}
        <ul className="m-0 p-0 list-none flex flex-col divide-y divide-[var(--color-border)] rounded-2xl border border-[var(--color-border)] overflow-hidden">
          {list.items.map((i) => (
            <li key={i.id} className={`flex items-center gap-2 px-3 py-2 min-h-14 ${i.done ? 'bg-[var(--color-surface-subtle)]' : 'bg-[var(--color-surface)]'}`}>
              <input
                type="checkbox"
                aria-label={`Acheté : ${i.label}`}
                className="w-6 h-6 accent-[var(--color-primary)] shrink-0"
                checked={i.done}
                disabled={readOnly}
                onChange={() => patchItem(i.id, { done: !i.done })}
              />
              <span className={`flex-1 min-w-0 text-[14px] font-semibold truncate ${i.done ? 'line-through text-[var(--color-text-muted)]' : ''}`}>
                {i.kind === 'transport' && <Bike size={13} className="inline mr-1 -mt-0.5" />}
                {i.label}
              </span>
              <input
                aria-label={`Prix de ${i.label}`}
                inputMode="numeric"
                disabled={readOnly}
                className={`w-20 text-right text-[14px] font-bold num rounded-lg border border-transparent focus:border-[var(--color-primary)] bg-transparent px-1 py-1 ${i.done ? 'line-through text-[var(--color-text-muted)]' : ''}`}
                value={i.amt ? String(i.amt) : ''}
                placeholder="0"
                onChange={(e) => patchItem(i.id, { amt: num(e.target.value) })}
              />
              <span className="text-[11px] text-[var(--color-text-muted)]">F</span>
              {!readOnly && (
                <button type="button" aria-label={`Retirer ${i.label}`} className="p-2 text-[var(--color-text-muted)]" onClick={() => setItems(list.items.filter((x) => x.id !== i.id))}>
                  <Trash2 size={15} />
                </button>
              )}
            </li>
          ))}
        </ul>
        {readOnly && (
          <p className={`m-0 ${muted}`}>
            <ShoppingBasket size={13} className="inline mr-1 -mt-0.5" />
            Cette liste est terminée : les achats cochés sont déjà dans vos sorties.
          </p>
        )}
      </div>
    </Sheet>
  );
};
