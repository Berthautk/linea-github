// Modèle d'un nouveau département. Calendrier 2026/2027 : arrêté conjoint MINEDUB/MINESEC du 14/08/2026 (art. 4, 10, 22).
export const YEAR_DEFAULT = '2026/2027';

export function defaultTerms() {
  return [
    // T3 : « last » = dernier jour de cours réel (la réalité du terrain : environ 2 semaines de cours au 3e trimestre) ; modifiable.
    { id: 'T1', name: '1er trimestre', start: '2026-09-07', end: '2026-11-27', last: '2026-11-27' },
    { id: 'T2', name: '2e trimestre', start: '2026-11-30', end: '2027-03-05', last: '2027-03-05' },
    { id: 'T3', name: '3e trimestre', start: '2027-03-08', end: '2027-06-11', last: '2027-03-25' },
  ];
}
export function defaultCalendar() {
  const F = (f, t, n) => ({ f, t, n });
  return [
    F('2026-11-26', '2026-11-27', 'Suivi pédagogique, fin du 1er trimestre (art. 22)'),
    F('2026-12-19', '2027-01-03', 'Vacances de Noël'),
    F('2027-02-11', '2027-02-11', 'Fête de la Jeunesse'),
    F('2027-03-04', '2027-03-05', 'Suivi pédagogique, fin du 2e trimestre (art. 22)'),
    F('2027-03-26', '2027-04-11', 'Vacances de Pâques'),
    F('2027-05-01', '2027-05-01', 'Fête du Travail'),
    F('2027-05-06', '2027-05-06', 'Ascension'),
    F('2027-05-20', '2027-05-20', 'Fête nationale'),
    F('2027-06-10', '2027-06-11', 'Suivi pédagogique, fin du 3e trimestre (art. 22)'),
  ];
}
export function newDept(p = {}) {
  return {
    name: p.name || '', discipline: p.discipline || '', abbr: p.abbr || '', system: p.system || 'anglophone', year: p.year || YEAR_DEFAULT, lh: 2,
    header: { region: p.region || '', division: p.division || '', email: '', address: '' }, terms: defaultTerms(), calendar: defaultCalendar(), dueOut: {}, u: Date.now(),
  };
}
