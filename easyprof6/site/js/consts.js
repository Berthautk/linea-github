// Constantes métier partagées.
// Types de séance : « lesson » (leçon) et « practical » (TP) comptent une leçon ; les autres comptent des heures seulement.
export const TYPES = [
  { id: 'lesson', fr: 'Leçon', en: 'Lesson', icon: '📖', lesson: true },
  { id: 'practical', fr: 'Travaux pratiques', en: 'Practical work', icon: '🧭', lesson: true },
  { id: 'further', fr: 'Further study / travail guidé', en: 'Further study / guided work', icon: '🔎', lesson: true },
  { id: 'orientation', fr: 'Première rencontre / orientation', en: 'First meeting / orientation', icon: '🤝' },
  { id: 'revision', fr: 'Révision', en: 'Revision', icon: '🔁' },
  { id: 'assessment', fr: 'Évaluation / devoir', en: 'Assessment / test', icon: '📝' },
];
// Motifs d'absence ou de jour sans cours. « out » = retiré des heures dues (ce n'est pas la faute de l'enseignant) ; sinon les heures restent dues mais non faites.
// L'animateur peut changer ce classement pour chaque motif (Réglages › Année scolaire). « other » reste en dernier : c'est le motif de repli.
export const REASONS = [
  { id: 'holiday', fr: 'Jour férié', en: 'Public holiday', icon: '🎌', out: true },
  { id: 'teacherday', fr: 'Journée de l’enseignant', en: 'Teachers’ Day', icon: '🍎', out: true },
  { id: 'pedagogic', fr: 'Journée pédagogique / séminaire / conférence', en: 'Pedagogic day / seminar / conference', icon: '🎓', out: true },
  { id: 'school', fr: 'Activités péri / post-scolaires (sport, culture, fête)', en: 'School activities (sports, culture, festivities)', icon: '🎭', out: true },
  { id: 'council', fr: 'Conseil de classe / examens de l’école', en: 'Class council / school exams', icon: '🗂️', out: true },
  { id: 'exam', fr: 'Examens officiels (surveillance, correction, jury)', en: 'Official exams (invigilation, marking, jury)', icon: '📝', out: true },
  { id: 'closure', fr: 'Établissement fermé (grève, intempéries, deuil, sécurité)', en: 'School closed (strike, bad weather, bereavement, security)', icon: '🚧', out: true },
  { id: 'national', fr: 'Cérémonie ou événement officiel (défilé, visite)', en: 'Official ceremony or event (parade, visit)', icon: '🇨🇲', out: true },
  { id: 'classaway', fr: 'Classe absente (sortie, évaluation, orientation)', en: 'Class away (trip, assessment, guidance)', icon: '🚌', out: true },
  { id: 'sick', fr: 'Maladie', en: 'Sick leave', icon: '🤒', out: false },
  { id: 'leave', fr: 'Congé autorisé (maternité, annuel, permission)', en: 'Authorised leave (maternity, annual, permission)', icon: '🏖️', out: false },
  { id: 'personal', fr: 'Empêchement personnel', en: 'Personal impediment', icon: '🧳', out: false },
  { id: 'mission', fr: 'Mission / formation / réunion', en: 'Mission / training / meeting', icon: '📋', out: false },
  { id: 'transport', fr: 'Retard ou panne de transport', en: 'Transport delay or breakdown', icon: '🚗', out: false },
  { id: 'unknown', fr: 'Absent, motif inconnu', en: 'Absent, reason unknown', icon: '❔', out: false },
  { id: 'other', fr: 'Autre motif', en: 'Other reason', icon: '✏️', out: false },
];
export const reasonOf = (id) => REASONS.find(r => r.id === id) || REASONS[REASONS.length - 1];
export const typeOf = (id) => TYPES.find(t => t.id === id) || TYPES[0];
export const isLessonType = (t) => t === 'lesson' || t === 'practical';
// Seuils d'alerte de l'arrêté conjoint MINEDUB/MINESEC du 14/08/2026 (art. 18 et 21)
export const THRESHOLDS = { hours: 80, lessons: 70, success: 40 };
