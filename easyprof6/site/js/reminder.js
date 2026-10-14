// Rappel à un collègue qui n'a pas saisi : le message s'adapte (depuis combien de temps, quels cours manquent) et part par WhatsApp.
import { html, useState } from './vendor/preact-htm.js';
import { t, getLang } from './i18n.js';
import { Field, Modal, Seg, openModal, closeModal } from './ui.js';
import { missedSlots, silence, reminderText } from './reminder-text.js';
import { WaButtons } from './whatsapp.js';

function Reminder({ ctx, tc }) {
  const [lang, setLang] = useState(getLang()), [text, setText] = useState(() => reminderText(ctx, tc, getLang()));
  const { days, level } = silence(ctx, tc);
  const pick = (l) => { setLang(l); setText(reminderText(ctx, tc, l)); };
  return html`<${Modal} title=${t('Rappeler {n}', { n: tc.name })} onClose=${closeModal}>
    <p class="sub">${days == null ? t('Aucune saisie depuis le début de l’année.') : days === 0 ? t('A saisi aujourd’hui.') : t('Dernière saisie : il y a {n} jour(s).', { n: days })} ${level === 3 ? t('Le message est ferme.') : level === 2 ? t('Le message est plus insistant.') : t('Simple rappel amical.')}</p>
    <${Seg} options=${[{ id: 'fr', label: 'Français' }, { id: 'en', label: 'English' }]} value=${lang} onChange=${pick} />
    <${Field} label=${t('Message (vous pouvez le modifier)')}><textarea class="input" rows="9" value=${text} onInput=${(e) => setText(e.target.value)}></textarea><//>
    <${WaButtons} phone=${tc.phone} text=${text} onSent=${() => setTimeout(closeModal, 300)} /><//>`;
}

export function openReminder(ctx, tc) { openModal(() => html`<${Reminder} key=${tc.id} ctx=${ctx} tc=${tc} />`); }
