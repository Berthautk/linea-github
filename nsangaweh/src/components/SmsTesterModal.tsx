import React, { useState } from 'react';
import { Check, Clipboard, Play, X } from 'lucide-react';
import { MOMO_FIXTURES } from '../lib/momoParser.fixtures';
import { parseMomoSMS } from '../lib/momoParser';

interface SmsTesterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SmsTesterModal: React.FC<SmsTesterModalProps> = ({ isOpen, onClose }) => {
  const [selectedFixtureId, setSelectedFixtureId] = useState(MOMO_FIXTURES[0].id);
  const [smsText, setSmsText] = useState(MOMO_FIXTURES[0].sms);
  const [parsedJson, setParsedJson] = useState<string>(() => {
    const res = parseMomoSMS(MOMO_FIXTURES[0].sms);
    return JSON.stringify(res, null, 2);
  });

  if (!isOpen) return null;

  const handleSelectFixture = (id: string) => {
    setSelectedFixtureId(id);
    const found = MOMO_FIXTURES.find((f) => f.id === id);
    if (found) {
      setSmsText(found.sms);
      const res = parseMomoSMS(found.sms);
      setParsedJson(JSON.stringify(res, null, 2));
    }
  };

  const handleRunParse = () => {
    const res = parseMomoSMS(smsText);
    setParsedJson(JSON.stringify(res, null, 2));
  };

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-[var(--color-surface)] p-5 rounded-3xl shadow-xl flex flex-col gap-3 text-xs max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-2">
          <div>
            <h3 className="m-0 text-sm font-heading font-bold text-[var(--color-text)]">
              Test du lecteur SMS Mobile Money (MTN & Orange)
            </h3>
            <span className="text-[10px] text-[var(--color-text-muted)]">
              Exécution 100% sur l'appareil (on-device) sans réseau
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center text-[var(--color-text-muted)] hover:bg-[var(--color-surface-subtle)]"
          >
            <X size={16} />
          </button>
        </div>

        {/* Fixtures selector */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase">
            Choisir un exemple type (12 fixtures disponibles) :
          </label>
          <select
            value={selectedFixtureId}
            onChange={(e) => handleSelectFixture(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] font-medium text-xs text-[var(--color-text)]"
          >
            {MOMO_FIXTURES.map((f) => (
              <option key={f.id} value={f.id}>
                [{f.operator}] {f.type.toUpperCase()} ({f.lang}) - {f.expected.amount} F
              </option>
            ))}
          </select>
        </div>

        {/* SMS textarea */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-center">
            <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase">
              Message SMS brut :
            </label>
            <button
              type="button"
              onClick={handleRunParse}
              className="text-[11px] font-bold text-[var(--color-primary)] flex items-center gap-1 hover:underline"
            >
              <Play size={11} /> Analyser
            </button>
          </div>
          <textarea
            rows={3}
            value={smsText}
            onChange={(e) => setSmsText(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-subtle)] font-mono text-[11px] leading-relaxed text-[var(--color-text)]"
          />
        </div>

        {/* Extracted JSON */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase">
            Résultat JSON extrait :
          </label>
          <pre className="p-3 rounded-xl bg-slate-900 text-emerald-400 font-mono text-[10px] overflow-x-auto max-h-56 leading-snug">
            {parsedJson}
          </pre>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-[var(--color-primary)] text-white font-bold text-xs"
        >
          Fermer le testeur
        </button>
      </div>
    </div>
  );
};
