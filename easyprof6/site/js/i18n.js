// Traduction : on écrit le texte en français dans le code ; le dictionnaire EN donne la version anglaise (repli : français).
import { EN } from './lang-en.js';
let lang = 'fr';
export const getLang = () => lang;
export function setLang(l) { lang = l === 'en' ? 'en' : 'fr'; if (typeof document !== 'undefined') document.documentElement.lang = lang; }
export function t(fr, vars) {
  let s = lang === 'en' && EN[fr] != null ? EN[fr] : fr;
  if (vars) s = s.replace(/\{(\w+)\}/g, (_, k) => (vars[k] == null ? '' : vars[k]));
  return s;
}
