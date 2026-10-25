import React, { useState } from 'react';
import { Download, Plus, Share2, Trash2 } from 'lucide-react';
import { fmt, generateId, todayStr } from '../lib/budget-math';
import { exportLedgerToCSV } from '../lib/csv-export';
import { triggerHaptic } from '../lib/haptics';
import { MonthCalc } from '../lib/calc';
import { Entry, GoalContribution, MemberBudget, Provision, SharedGoal, Tontine } from '../lib/types';
import { ErrorText, FieldLabel, inputClass, PrimaryButton, Sheet } from './ui';

type Who = { uid: string; name: string };

const card = 'rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3.5 flex flex-col gap-2.5';
const muted = 'text-[12px] text-[var(--color-text-muted)]';

const num = (s: string) => parseInt(s.replace(/\D/g, ''), 10) || 0;

const Progress: React.FC<{ value: number; target: number }> = ({ value, target }) => {
  const pct = target > 0 ? Math.min(100, Math.round((value / target) * 100)) : 0;
  return (
    <div>
      <div className="h-2.5 rounded-full bg-[var(--color-surface-subtle)] overflow-hidden" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-full rounded-full bg-[var(--color-primary)]" style={{ width: `${pct}%` }} />
      </div>
      <div className={`${muted} mt-1 flex justify-between`}>
        <span>{fmt(value)} F</span>
        <span>
          {pct} % de {fmt(target)} F
        </span>
      </div>
    </div>
  );
};

const AmountField: React.FC<{ id: string; label: string; value: string; onChange: (v: string) => void; placeholder?: string }> = ({
  id,
  label,
  value,
  onChange,
  placeholder,
}) => (
  <div className="flex flex-col gap-1">
    <FieldLabel htmlFor={id}>{label}</FieldLabel>
    <input id={id} inputMode="numeric" className={inputClass} value={value} placeholder={placeholder || 'Ex : 25000'} onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 9))} />
  </div>
);

const TextField: React.FC<{ id: string; label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }> = ({
  id,
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}) => (
  <div className="flex flex-col gap-1">
    <FieldLabel htmlFor={id}>{label}</FieldLabel>
    <input id={id} type={type} className={inputClass} value={value} placeholder={placeholder} maxLength={60} onChange={(e) => onChange(e.target.value)} />
  </div>
);

const Empty: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className={`m-0 text-center py-6 ${muted}`}>{children}</p>
);

/* ------------------------------ Provisions ------------------------------ */

export const ProvisionsSheet: React.FC<{
  open: boolean;
  provisions: Provision[];
  walletId: string;
  onChange: (list: Provision[], message: string) => void;
  onClose: () => void;
}> = ({ open, provisions, walletId, onChange, onClose }) => {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [due, setDue] = useState('');
  const [err, setErr] = useState('');
  const [action, setAction] = useState<{ id: string; kind: 'put' | 'use' } | null>(null);
  const [amt, setAmt] = useState('');
  const [why, setWhy] = useState('');

  const saved = (p: Provision) => Math.max(0, (p.contributions || []).reduce((s, c) => s + c.amt, 0) - (p.spent || []).reduce((s, c) => s + c.amt, 0));

  const create = () => {
    if (!name.trim()) return setErr('Donnez un nom à cette réserve (ex : Rentrée scolaire).');
    if (!num(target)) return setErr('Indiquez le montant à atteindre.');
    setErr('');
    onChange(
      [...provisions, { id: generateId(), name: name.trim(), icon: 'piggy', targetAmount: num(target), dueDate: due || '', contributions: [], spent: [] }],
      `Réserve « ${name.trim()} » créée.`
    );
    setAdding(false);
    setName('');
    setTarget('');
    setDue('');
  };

  const submitAction = (p: Provision) => {
    const a = num(amt);
    if (!a) return setErr('Indiquez un montant.');
    if (action?.kind === 'use' && a > saved(p)) return setErr(`Il n’y a que ${fmt(saved(p))} F dans cette réserve.`);
    setErr('');
    const next =
      action?.kind === 'put'
        ? { ...p, contributions: [...(p.contributions || []), { id: generateId(), date: todayStr(), amt: a, wallet: walletId }] }
        : { ...p, spent: [...(p.spent || []), { id: generateId(), date: todayStr(), amt: a, label: why.trim() || 'Dépense', categoryId: '' }] };
    onChange(provisions.map((x) => (x.id === p.id ? next : x)), action?.kind === 'put' ? `${fmt(a)} F mis de côté.` : `${fmt(a)} F retirés de la réserve.`);
    setAction(null);
    setAmt('');
    setWhy('');
  };

  return (
    <Sheet open={open} title="Provisions" onClose={onClose} footer={!adding ? <PrimaryButton onClick={() => setAdding(true)}><Plus size={16} /> Nouvelle réserve</PrimaryButton> : undefined}>
      <div className="flex flex-col gap-3 p-4">
        <p className={`m-0 ${muted}`}>Une réserve, c’est de l’argent que vous gardez de côté pour un moment précis (rentrée, fêtes, imprévus). Ça ne change pas le budget du mois.</p>
        {adding && (
          <div className={card}>
            <TextField id="prov-name" label="Pour quoi ?" value={name} onChange={setName} placeholder="Ex : Rentrée scolaire" />
            <AmountField id="prov-target" label="Montant à atteindre (F)" value={target} onChange={setTarget} />
            <TextField id="prov-due" type="date" label="Pour quelle date ? (facultatif)" value={due} onChange={setDue} />
            <ErrorText>{err}</ErrorText>
            <div className="flex gap-2">
              <PrimaryButton tone="ghost" onClick={() => { setAdding(false); setErr(''); }}>Annuler</PrimaryButton>
              <PrimaryButton onClick={create}>Créer</PrimaryButton>
            </div>
          </div>
        )}
        {!provisions.length && !adding && <Empty>Aucune réserve pour l’instant.</Empty>}
        {provisions.map((p) => (
          <div key={p.id} className={card}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="font-heading font-bold text-[15px]">{p.name}</div>
                {p.dueDate && <div className={muted}>Pour le {p.dueDate.split('-').reverse().join('/')}</div>}
              </div>
              <button type="button" aria-label={`Supprimer ${p.name}`} className="p-2 text-[var(--color-text-muted)]" onClick={() => onChange(provisions.filter((x) => x.id !== p.id), `Réserve « ${p.name} » supprimée.`)}>
                <Trash2 size={16} />
              </button>
            </div>
            <Progress value={saved(p)} target={p.targetAmount} />
            {action?.id === p.id ? (
              <div className="flex flex-col gap-2">
                <AmountField id={`prov-amt-${p.id}`} label={action.kind === 'put' ? 'Montant mis de côté (F)' : 'Montant retiré (F)'} value={amt} onChange={setAmt} />
                {action.kind === 'use' && <TextField id={`prov-why-${p.id}`} label="Pour quoi ?" value={why} onChange={setWhy} placeholder="Ex : Fournitures" />}
                <ErrorText>{err}</ErrorText>
                <div className="flex gap-2">
                  <PrimaryButton tone="ghost" onClick={() => { setAction(null); setErr(''); }}>Annuler</PrimaryButton>
                  <PrimaryButton onClick={() => submitAction(p)}>Valider</PrimaryButton>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <PrimaryButton tone="ghost" onClick={() => { setAction({ id: p.id, kind: 'put' }); setAmt(''); setErr(''); }}>Mettre de côté</PrimaryButton>
                <PrimaryButton tone="ghost" onClick={() => { setAction({ id: p.id, kind: 'use' }); setAmt(''); setErr(''); }}>Utiliser</PrimaryButton>
              </div>
            )}
          </div>
        ))}
      </div>
    </Sheet>
  );
};

/* -------------------------------- Objectifs -------------------------------- */

export const GoalsSheet: React.FC<{
  open: boolean;
  goals: SharedGoal[];
  me: Who;
  onChange: (list: SharedGoal[], message: string) => void;
  onClose: () => void;
}> = ({ open, goals, me, onChange, onClose }) => {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [deadline, setDeadline] = useState('');
  const [err, setErr] = useState('');
  const [payFor, setPayFor] = useState<string | null>(null);
  const [amt, setAmt] = useState('');

  const total = (g: SharedGoal) => (g.contributions || []).reduce((s, c) => s + c.amt, 0);

  const create = () => {
    if (!name.trim()) return setErr('Donnez un nom à ce projet (ex : Voyage au village).');
    if (!num(target)) return setErr('Indiquez le montant à atteindre.');
    setErr('');
    onChange([...goals, { id: generateId(), name: name.trim(), target: num(target), deadline, icon: 'target', color: '#2563EB', contributions: [] }], `Projet « ${name.trim()} » créé.`);
    setAdding(false);
    setName('');
    setTarget('');
    setDeadline('');
  };

  const contribute = (g: SharedGoal) => {
    const a = num(amt);
    if (!a) return setErr('Indiquez un montant.');
    setErr('');
    const c: GoalContribution = { id: generateId(), uid: me.uid, name: me.name || 'Moi', date: todayStr(), amt: a };
    onChange(goals.map((x) => (x.id === g.id ? { ...x, contributions: [...(x.contributions || []), c] } : x)), `${fmt(a)} F ajoutés au projet « ${g.name} ».`);
    setPayFor(null);
    setAmt('');
  };

  return (
    <Sheet open={open} title="Objectifs" onClose={onClose} footer={!adding ? <PrimaryButton onClick={() => setAdding(true)}><Plus size={16} /> Nouveau projet</PrimaryButton> : undefined}>
      <div className="flex flex-col gap-3 p-4">
        <p className={`m-0 ${muted}`}>Un projet que vous financez ensemble. Chacun ajoute ce qu’il peut, vous voyez qui a mis combien.</p>
        {adding && (
          <div className={card}>
            <TextField id="goal-name" label="Nom du projet" value={name} onChange={setName} placeholder="Ex : Voyage au village" />
            <AmountField id="goal-target" label="Montant à atteindre (F)" value={target} onChange={setTarget} />
            <TextField id="goal-date" type="date" label="Date limite (facultatif)" value={deadline} onChange={setDeadline} />
            <ErrorText>{err}</ErrorText>
            <div className="flex gap-2">
              <PrimaryButton tone="ghost" onClick={() => { setAdding(false); setErr(''); }}>Annuler</PrimaryButton>
              <PrimaryButton onClick={create}>Créer</PrimaryButton>
            </div>
          </div>
        )}
        {!goals.length && !adding && <Empty>Aucun projet pour l’instant.</Empty>}
        {goals.map((g) => {
          const byPerson = new Map<string, { name: string; amt: number }>();
          (g.contributions || []).forEach((c) => byPerson.set(c.uid, { name: c.name, amt: (byPerson.get(c.uid)?.amt || 0) + c.amt }));
          return (
            <div key={g.id} className={card}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-heading font-bold text-[15px]">{g.name}</div>
                  {g.deadline && <div className={muted}>Avant le {g.deadline.split('-').reverse().join('/')}</div>}
                </div>
                <button type="button" aria-label={`Supprimer ${g.name}`} className="p-2 text-[var(--color-text-muted)]" onClick={() => onChange(goals.filter((x) => x.id !== g.id), `Projet « ${g.name} » supprimé.`)}>
                  <Trash2 size={16} />
                </button>
              </div>
              <Progress value={total(g)} target={g.target} />
              {byPerson.size > 0 && (
                <div className={`${muted} flex flex-wrap gap-x-3`}>
                  {[...byPerson.values()].map((p) => (
                    <span key={p.name}>
                      {p.name} : <b>{fmt(p.amt)} F</b>
                    </span>
                  ))}
                </div>
              )}
              {payFor === g.id ? (
                <div className="flex flex-col gap-2">
                  <AmountField id={`goal-amt-${g.id}`} label="Montant ajouté (F)" value={amt} onChange={setAmt} />
                  <ErrorText>{err}</ErrorText>
                  <div className="flex gap-2">
                    <PrimaryButton tone="ghost" onClick={() => { setPayFor(null); setErr(''); }}>Annuler</PrimaryButton>
                    <PrimaryButton onClick={() => contribute(g)}>Valider</PrimaryButton>
                  </div>
                </div>
              ) : (
                <PrimaryButton tone="ghost" onClick={() => { setPayFor(g.id); setAmt(''); setErr(''); }}>J’ajoute de l’argent</PrimaryButton>
              )}
            </div>
          );
        })}
      </div>
    </Sheet>
  );
};

/* -------------------------------- Tontine -------------------------------- */

const STEP_DAYS = { hebdo: 7, bimensuelle: 15, mensuelle: 30 } as const;
const FREQ_LABEL = { hebdo: 'chaque semaine', bimensuelle: 'tous les 15 jours', mensuelle: 'chaque mois' } as const;

function cycleDate(start: string, freq: Tontine['frequency'], index: number): string {
  const d = new Date(`${start}T12:00:00`);
  if (freq === 'mensuelle') d.setMonth(d.getMonth() + index);
  else d.setDate(d.getDate() + index * STEP_DAYS[freq]);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export const TontineSheet: React.FC<{
  open: boolean;
  tontines: Tontine[];
  onChange: (list: Tontine[], message: string) => void;
  onClose: () => void;
}> = ({ open, tontines, onChange, onClose }) => {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [freq, setFreq] = useState<Tontine['frequency']>('mensuelle');
  const [membersText, setMembersText] = useState('');
  const [start, setStart] = useState(todayStr());
  const [position, setPosition] = useState('1');
  const [err, setErr] = useState('');

  const create = () => {
    const names = membersText.split(/[,\n]/).map((s) => s.trim()).filter(Boolean);
    if (!name.trim()) return setErr('Donnez un nom à la tontine.');
    if (!num(amount)) return setErr('Indiquez la cotisation de chaque tour.');
    if (names.length < 2) return setErr('Écrivez au moins 2 participants, séparés par une virgule.');
    const pos = Math.min(names.length, Math.max(1, num(position) || 1));
    setErr('');
    onChange(
      [
        ...tontines,
        {
          id: generateId(),
          name: name.trim(),
          contributionAmount: num(amount),
          frequency: freq,
          members: names.map((n, i) => ({ name: n, order: i + 1 })),
          startDate: start || todayStr(),
          myPosition: pos,
          potAmount: num(amount) * names.length,
          payments: [],
        },
      ],
      `Tontine « ${name.trim()} » créée.`
    );
    setAdding(false);
    setName('');
    setAmount('');
    setMembersText('');
    setPosition('1');
  };

  const togglePaid = (t: Tontine, index: number) => {
    const has = (t.payments || []).find((p) => p.cycleIndex === index);
    const payments = has
      ? t.payments.filter((p) => p.cycleIndex !== index)
      : [...(t.payments || []), { cycleIndex: index, date: todayStr(), paid: true, amt: t.contributionAmount }];
    onChange(tontines.map((x) => (x.id === t.id ? { ...x, payments } : x)), has ? 'Cotisation décochée.' : 'Cotisation notée comme payée.');
  };

  return (
    <Sheet open={open} title="Tontine / Njangi" onClose={onClose} footer={!adding ? <PrimaryButton onClick={() => setAdding(true)}><Plus size={16} /> Nouvelle tontine</PrimaryButton> : undefined}>
      <div className="flex flex-col gap-3 p-4">
        <p className={`m-0 ${muted}`}>Suivez vos tours de table : qui reçoit à quel tour, et si vous avez payé votre cotisation.</p>
        {adding && (
          <div className={card}>
            <TextField id="t-name" label="Nom de la tontine" value={name} onChange={setName} placeholder="Ex : Njangi des amis" />
            <AmountField id="t-amt" label="Cotisation de chaque tour (F)" value={amount} onChange={setAmount} />
            <div className="flex flex-col gap-1">
              <FieldLabel htmlFor="t-freq">À quelle fréquence ?</FieldLabel>
              <select id="t-freq" className={inputClass} value={freq} onChange={(e) => setFreq(e.target.value as Tontine['frequency'])}>
                <option value="hebdo">Chaque semaine</option>
                <option value="bimensuelle">Tous les 15 jours</option>
                <option value="mensuelle">Chaque mois</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <FieldLabel htmlFor="t-members">Participants, dans l’ordre des tours (séparés par une virgule)</FieldLabel>
              <textarea id="t-members" className={inputClass} rows={2} value={membersText} onChange={(e) => setMembersText(e.target.value)} placeholder="Marie, Paul, Moi, Joël" />
            </div>
            <AmountField id="t-pos" label="Mon tour (numéro)" value={position} onChange={setPosition} placeholder="Ex : 3" />
            <TextField id="t-start" type="date" label="Date du premier tour" value={start} onChange={setStart} />
            <ErrorText>{err}</ErrorText>
            <div className="flex gap-2">
              <PrimaryButton tone="ghost" onClick={() => { setAdding(false); setErr(''); }}>Annuler</PrimaryButton>
              <PrimaryButton onClick={create}>Créer</PrimaryButton>
            </div>
          </div>
        )}
        {!tontines.length && !adding && <Empty>Aucune tontine pour l’instant.</Empty>}
        {tontines.map((t) => {
          const today = todayStr();
          return (
            <div key={t.id} className={card}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-heading font-bold text-[15px]">{t.name}</div>
                  <div className={muted}>
                    {fmt(t.contributionAmount)} F {FREQ_LABEL[t.frequency]} · cagnotte {fmt(t.contributionAmount * t.members.length)} F
                  </div>
                </div>
                <button type="button" aria-label={`Supprimer ${t.name}`} className="p-2 text-[var(--color-text-muted)]" onClick={() => onChange(tontines.filter((x) => x.id !== t.id), `Tontine « ${t.name} » supprimée.`)}>
                  <Trash2 size={16} />
                </button>
              </div>
              <ul className="m-0 p-0 list-none flex flex-col divide-y divide-[var(--color-border)]">
                {t.members.map((m, i) => {
                  const d = cycleDate(t.startDate, t.frequency, i);
                  const paid = (t.payments || []).some((p) => p.cycleIndex === i && p.paid);
                  const mine = i + 1 === t.myPosition;
                  return (
                    <li key={i} className="flex items-center gap-2 py-2">
                      <span className={`w-6 text-center text-[12px] font-bold ${d <= today ? 'text-[var(--color-text)]' : 'text-[var(--color-text-muted)]'}`}>{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-semibold truncate">
                          {m.name} {mine && <span className="text-[var(--color-primary)]">· mon tour</span>}
                        </div>
                        <div className={muted}>{d.split('-').reverse().join('/')}</div>
                      </div>
                      <button
                        type="button"
                        aria-pressed={paid}
                        onClick={() => togglePaid(t, i)}
                        className={`min-h-9 px-3 rounded-full text-[12px] font-bold border ${paid ? 'bg-[var(--color-primary)] text-white border-transparent' : 'border-[var(--color-border)] text-[var(--color-text-muted)]'}`}
                      >
                        {paid ? 'Payé' : 'À payer'}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </Sheet>
  );
};

/* ---------------------------- Conseil de famille ---------------------------- */

const dayStr = (d: Date) => {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

export function weeklyReview(budget: MemberBudget, people: Array<{ uid: string; name: string }>, days = 7) {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - (days - 1));
  const f = dayStr(from);
  const t = dayStr(to);
  const all: Entry[] = Object.values(budget.months).flatMap((m) => m.entries);
  const week = all.filter((e) => e.d >= f && e.d <= t && e.t !== 'transfer');
  const cats = new Map(budget.categories.map((c) => [c.id, c.name]));
  const nameOf = (uid?: string) => people.find((p) => p.uid === uid)?.name || 'Quelqu’un';
  const income = week.filter((e) => e.t === 'in').reduce((s, e) => s + e.amt, 0);
  const out = week.filter((e) => e.t === 'out');
  const spent = out.reduce((s, e) => s + e.amt, 0);
  const perPerson = people.map((p) => ({
    name: p.name,
    spent: out.filter((e) => e.by === p.uid).reduce((s, e) => s + e.amt, 0),
    received: week.filter((e) => e.t === 'in' && e.by === p.uid).reduce((s, e) => s + e.amt, 0),
  }));
  const byCat = new Map<string, number>();
  out.forEach((e) => {
    const n = (e.categoryId && cats.get(e.categoryId)) || 'Sans rubrique';
    byCat.set(n, (byCat.get(n) || 0) + e.amt);
  });
  const top = [...byCat.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);
  const biggest = [...out].sort((a, b) => b.amt - a.amt)[0];
  return { from: f, to: t, income, spent, count: week.length, perPerson, top, biggest, biggestBy: biggest ? nameOf(biggest.by) : '' };
}

async function shareText(text: string, done: (msg: string) => void) {
  try {
    if (navigator.share) {
      await navigator.share({ text });
      return;
    }
    await navigator.clipboard.writeText(text);
    done('Texte copié : vous pouvez le coller dans WhatsApp.');
  } catch {
    done('Partage annulé.');
  }
}

export const CouncilSheet: React.FC<{
  open: boolean;
  budget: MemberBudget;
  people: Array<{ uid: string; name: string }>;
  householdName?: string;
  notify: (msg: string) => void;
  onClose: () => void;
}> = ({ open, budget, people, householdName, notify, onClose }) => {
  if (!open) return null;
  const r = weeklyReview(budget, people);
  const text = [
    `Conseil de famille${householdName ? ` — ${householdName}` : ''} (7 derniers jours)`,
    `Entrées : ${fmt(r.income)} F · Sorties : ${fmt(r.spent)} F`,
    ...r.perPerson.map((p) => `• ${p.name} : a dépensé ${fmt(p.spent)} F, a reçu ${fmt(p.received)} F`),
    r.top.length ? `Ce qui a le plus coûté : ${r.top.map(([n, a]) => `${n} (${fmt(a)} F)`).join(', ')}` : '',
  ]
    .filter(Boolean)
    .join('\n');
  return (
    <Sheet open={open} title="Conseil de famille" onClose={onClose} footer={<PrimaryButton onClick={() => shareText(text, notify)}><Share2 size={16} /> Envoyer le bilan</PrimaryButton>}>
      <div className="flex flex-col gap-3 p-4">
        <p className={`m-0 ${muted}`}>Le bilan des 7 derniers jours, pour en parler tranquillement à deux.</p>
        {r.count === 0 ? (
          <Empty>Rien n’a été noté ces 7 derniers jours.</Empty>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-2.5">
              <div className={card}>
                <span className={muted}>Entrées</span>
                <b className="text-lg text-[var(--color-income)]">{fmt(r.income)} F</b>
              </div>
              <div className={card}>
                <span className={muted}>Sorties</span>
                <b className="text-lg text-[var(--color-expense)]">{fmt(r.spent)} F</b>
              </div>
            </div>
            <div className={card}>
              <b className="text-[13px]">Qui a fait quoi</b>
              {r.perPerson.map((p) => (
                <div key={p.name} className="flex justify-between text-[13px]">
                  <span>{p.name}</span>
                  <span>
                    dépensé <b>{fmt(p.spent)} F</b> · reçu <b>{fmt(p.received)} F</b>
                  </span>
                </div>
              ))}
            </div>
            {r.top.length > 0 && (
              <div className={card}>
                <b className="text-[13px]">Ce qui a le plus coûté</b>
                {r.top.map(([n, a]) => (
                  <div key={n} className="flex justify-between text-[13px]">
                    <span>{n}</span>
                    <b>{fmt(a)} F</b>
                  </div>
                ))}
              </div>
            )}
            {r.biggest && (
              <div className={card}>
                <b className="text-[13px]">Plus grosse dépense</b>
                <span className="text-[13px]">
                  {r.biggest.label} · {fmt(r.biggest.amt)} F · {r.biggestBy}
                </span>
              </div>
            )}
            <div className={card}>
              <b className="text-[13px]">À discuter</b>
              <span className="text-[13px]">
                {r.spent > r.income
                  ? 'Vous avez dépensé plus que vous n’avez reçu cette semaine : quelle sortie aurait pu attendre ?'
                  : 'Vous avez reçu plus que dépensé cette semaine : pensez à mettre un peu de côté dans une réserve.'}
              </span>
            </div>
          </>
        )}
      </div>
    </Sheet>
  );
};

/* ------------------------------ Bilans & Export ------------------------------ */

export const ReportsSheet: React.FC<{
  open: boolean;
  budget: MemberBudget;
  calc: MonthCalc;
  monthKey: string;
  monthName: string;
  userName: string;
  householdId: string;
  householdName?: string;
  notify: (msg: string) => void;
  onClose: () => void;
}> = ({ open, budget, calc, monthName, userName, householdId, householdName, notify, onClose }) => {
  if (!open) return null;
  const rows = [...calc.expense, ...(calc.byCategory ? Object.values(calc.byCategory).filter((c) => c.kind === 'save') : [])]
    .filter((c) => !c.category.archived || c.actual > 0)
    .map((c) => ({
      name: c.category.name,
      planned: c.planned,
      actual: c.actual,
      pct: c.planned > 0 ? Math.round((c.actual / c.planned) * 100) : null,
    }))
    .filter((r) => r.planned > 0 || r.actual > 0)
    .sort((a, b) => b.actual - a.actual);
  const hasAny = calc.month.entries.length > 0 || rows.length > 0;
  const biggest = rows[0];
  const status = (pct: number | null) => (pct === null ? '' : pct > 100 ? 'dépassée' : pct >= 90 ? 'presque vide' : pct >= 70 ? 'bien entamée' : 'ok');
  const text = [
    `Récapitulatif ${monthName}${householdName ? ` — ${householdName}` : ''}`,
    `Entrées : ${fmt(calc.inc)} F`,
    `Sorties : ${fmt(calc.out)} F`,
    calc.saved ? `Épargne : ${fmt(calc.saved)} F` : '',
    `Reste en main : ${fmt(calc.inc - calc.out - calc.saved)} F`,
    '',
    'Où l’argent est parti :',
    ...rows.filter((r) => r.actual > 0).map((r) => `• ${r.name} : ${fmt(r.actual)} F${r.planned ? ` sur ${fmt(r.planned)} F prévus (${r.pct} %)` : ''}`),
  ]
    .filter((l, i, a) => l !== '' || a[i - 1] !== '')
    .join('\n');

  return (
    <Sheet open={open} title={`Récapitulatif de ${monthName}`} onClose={onClose} footer={<PrimaryButton disabled={!hasAny} onClick={() => { triggerHaptic('light'); shareText(text, notify); }}><Share2 size={16} /> Envoyer ce récapitulatif</PrimaryButton>}>
      <div className="flex flex-col gap-3 p-4">
        <p className={`m-0 ${muted}`}>Les faits du mois : combien est rentré, combien est sorti, et comment chaque enveloppe a été utilisée.</p>
        {!hasAny ? (
          <Empty>Rien n’a encore été noté ce mois-ci.</Empty>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-2">
              <div className={card}>
                <span className={muted}>Entrées</span>
                <b className="text-[15px] text-[var(--color-income)] num">{fmt(calc.inc)} F</b>
              </div>
              <div className={card}>
                <span className={muted}>Sorties</span>
                <b className="text-[15px] text-[var(--color-expense)] num">{fmt(calc.out)} F</b>
              </div>
              <div className={card}>
                <span className={muted}>Reste</span>
                <b className="text-[15px] num">{fmt(calc.inc - calc.out - calc.saved)} F</b>
              </div>
            </div>
            {biggest && biggest.actual > 0 && (
              <div className={card}>
                <span className={muted}>C’est là que l’argent est le plus parti</span>
                <b className="text-[14px]">
                  {biggest.name} · {fmt(biggest.actual)} F{calc.out > 0 ? ` (${Math.round((biggest.actual / calc.out) * 100)} % des sorties)` : ''}
                </b>
              </div>
            )}
            <div className={card}>
              <b className="text-[13px]">Mes enveloppes</b>
              {rows.map((r) => {
                const over = r.pct !== null && r.pct > 100;
                const high = r.pct !== null && r.pct >= 90;
                const mid = r.pct !== null && r.pct >= 70;
                return (
                  <div key={r.name} className="flex flex-col gap-1">
                    <div className="flex justify-between gap-2 text-[13px]">
                      <span className="font-semibold truncate">{r.name}</span>
                      <span className="num whitespace-nowrap">
                        {fmt(r.actual)} F{r.planned ? ` / ${fmt(r.planned)} F` : ''}
                      </span>
                    </div>
                    {r.planned > 0 && (
                      <>
                        <div className="h-2 rounded-full bg-[var(--color-surface-subtle)] overflow-hidden">
                          <div
                            className={`h-full rounded-full ${over || high ? 'bg-[var(--color-expense)]' : mid ? 'bg-amber-500' : 'bg-[var(--color-primary)]'}`}
                            style={{ width: `${Math.min(100, r.pct || 0)}%` }}
                          />
                        </div>
                        <span className={`text-[11px] ${over || high ? 'text-[var(--color-expense)] font-bold' : muted}`}>
                          Utilisée à {r.pct} % · {status(r.pct)}
                          {over ? ` (+${fmt(r.actual - r.planned)} F)` : ''}
                        </span>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
        <div className={card}>
          <b className="text-[14px]">Tout mon budget dans un tableau</b>
          <p className={`m-0 ${muted}`}>Un fichier CSV avec toutes les opérations, qui s’ouvre dans Excel ou Google Sheets.</p>
          <PrimaryButton tone="ghost" onClick={() => { exportLedgerToCSV(budget, userName, householdId); notify('Fichier téléchargé.'); }}>
            <Download size={16} /> Télécharger le fichier CSV
          </PrimaryButton>
        </div>
      </div>
    </Sheet>
  );
};
