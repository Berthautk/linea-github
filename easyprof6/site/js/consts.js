// Constantes métier partagées.
// Types de séance : « lesson » (leçon) et « practical » (TP) comptent une leçon ; les autres comptent des heures seulement.
export const TYPES = [
  { id: 'lesson', fr: 'Leçon', en: 'Lesson', icon: '📖', lesson: true },
  { id: 'practical', fr: 'Travaux pratiques', en: 'Practical work', icon: '🧭', lesson: true },
  { id: 'orientation', fr: 'Première rencontre / orientation', en: 'First meeting / orientation', icon: '🤝' },
  { id: 'revision', fr: 'Révision', en: 'Revision', icon: '🔁' },
  { id: 'assessment', fr: 'Évaluation / devoir', en: 'Assessment / test', icon: '📝' },
];
// Jours sans cours : « out » = retiré des heures dues (ce n'est pas la faute de l'enseignant) ; sinon heures non faites.
export const REASONS = [
  { id: 'holiday', fr: 'Jour férié', en: 'Public holiday', icon: '🎌', out: true },
  { id: 'school', fr: 'Activités péri / post-scolaires', en: 'School activities', icon: '🎭', out: true },
  { id: 'council', fr: 'Conseil de classe / examens de l’école', en: 'Class council / school exams', icon: '🗂️', out: true },
  { id: 'sick', fr: 'Maladie', en: 'Sick leave', icon: '🤒', out: false },
  { id: 'personal', fr: 'Empêchement personnel', en: 'Personal impediment', icon: '🧳', out: false },
  { id: 'mission', fr: 'Mission / formation / réunion', en: 'Mission / training / meeting', icon: '📋', out: false },
  { id: 'other', fr: 'Autre motif', en: 'Other reason', icon: '✏️', out: false },
];
export const reasonOf = (id) => REASONS.find(r => r.id === id) || REASONS[REASONS.length - 1];
export const typeOf = (id) => TYPES.find(t => t.id === id) || TYPES[0];
export const isLessonType = (t) => t === 'lesson' || t === 'practical';
// Seuils d'alerte de l'arrêté conjoint MINEDUB/MINESEC du 14/08/2026 (art. 18 et 21)
export const THRESHOLDS = { hours: 80, lessons: 70, success: 40 };
