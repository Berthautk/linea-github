// En-tête officiel de la fiche : texte automatique (Cameroun) ou texte libre écrit par l'animateur, en français et en anglais.
const up = (s) => String(s || '').toUpperCase();

export function defaultLetter(hd = {}, lang = 'fr') {
  const lines = lang === 'en'
    ? ['REPUBLIC OF CAMEROON', 'Peace – Work – Fatherland', 'MINISTRY OF SECONDARY EDUCATION', hd.region ? 'REGIONAL DELEGATION FOR ' + up(hd.region) : '', hd.division ? 'DIVISIONAL DELEGATION FOR ' + up(hd.division) : '', hd.contact || '']
    : ['RÉPUBLIQUE DU CAMEROUN', 'Paix – Travail – Patrie', 'MINISTÈRE DES ENSEIGNEMENTS SECONDAIRES', hd.region ? 'DÉLÉGATION RÉGIONALE ' + up(hd.region) : '', hd.division ? 'DÉLÉGATION DÉPARTEMENTALE ' + up(hd.division) : '', hd.contact || ''];
  return lines.filter(Boolean).join('\n');
}

/** Texte réellement imprimé : le texte libre s'il existe, sinon le texte automatique. */
export function letterText(hd = {}, lang = 'fr') {
  const own = String(hd[lang] || '').trim();
  return own || defaultLetter(hd, lang);
}
export const showArms = (hd = {}) => hd.arms !== '0';
