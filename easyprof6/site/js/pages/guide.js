// Mode d'emploi : en quelques étapes simples, comment démarrer et utiliser Rekort au quotidien.
import { html } from '../vendor/preact-htm.js';
import { t, getLang } from '../i18n.js';
import { Icon } from '../icons.js';
import { isAP } from '../store.js';

const AP = [
  { h: ['Une fois, au départ (une dizaine de minutes)', 'Once, at the start (about ten minutes)'], steps: [
    ['Réglages › Établissement et en-tête : le nom de l’école et le texte imprimé en haut des fiches (français à gauche, anglais à droite).', 'Settings › School and header: the school name and the text printed at the top of the sheets (French left, English right).'],
    ['Réglages › Classes : ajoutez les classes du département avec leur effectif (le bouton « Ajouter les classes habituelles » vous fait gagner du temps).', 'Settings › Classes: add the department’s classes with their enrolment (the “Add the usual classes” button saves time).'],
    ['Réglages › Collègues et emplois du temps : créez un compte par collègue. L’identifiant est son nom de famille ; vous choisissez son mot de passe (« Définir le mot de passe ») puis vous lui envoyez l’accès par WhatsApp.', 'Settings › Colleagues and timetables: create one account per colleague. The username is their surname; you choose their password (“Set the password”) then send the access by WhatsApp.'],
    ['Ouvrez ensuite chaque collègue : ajoutez ses cours de la semaine (un cours = un jour + une classe + de telle heure à telle heure), puis le nombre de leçons prévues dans chaque classe pour l’année.', 'Then open each colleague: add their weekly lessons (one lesson = a day + a class + from this time to that time), then the number of lessons planned in each class for the year.'],
    ['Réglages › Année scolaire et calendrier : vérifiez les dates des trimestres et des vacances (le calendrier officiel est déjà rempli).', 'Settings › School year and calendar: check the term and holiday dates (the official calendar is already filled in).'],
    ['Vous avez déjà des semaines passées ? Réglages › Heures hors application › « Démarrer sans être en retard » : indiquez la date jusqu’à laquelle tout était à jour.', 'Already have past weeks? Settings › Hours outside the app › “Start without being late”: enter the date until which everything was up to date.'],
  ] },
  { h: ['Chaque jour', 'Every day'], steps: [
    ['Vous : sur l’Accueil, appuyez sur « Fait » à côté de votre cours du jour. Une seconde par cours.', 'You: on Home, tap “Done” next to your lesson of the day. One second per lesson.'],
    ['Vos collègues font pareil sur leur téléphone. Ce qu’ils saisissent arrive chez vous tout seul, dès qu’ils ont du réseau.', 'Your colleagues do the same on their phone. What they enter reaches you by itself as soon as they have a signal.'],
    ['Un collègue ne saisit pas ? Ouvrez « Contrôle de la semaine » (bouton sur l’Accueil ou dans « Saisir ») : choisissez-le, puis cochez Présent, En retard (avec les minutes) ou 2 leçons, d’après ce que les élèves vous disent. C’est enregistré à son nom.', 'A colleague does not enter? Open “Weekly check” (button on Home or in “Log”): pick them, then tick Present, Late (with minutes) or 2 lessons, from what the students tell you. It is recorded in their name.'],
  ] },
  { h: ['Voir les résultats et imprimer', 'See the results and print'], steps: [
    ['Accueil : heures et leçons faites, retard ou avance, par semaine, mois, trimestre, année ou dates libres.', 'Home: hours and lessons done, late or ahead, by week, month, term, year or custom dates.'],
    ['Fiche : « Fiche de l’inspection » (celle de l’inspecteur) et « Fiche pédagogique (censorat) » (celle du censeur et de la délégation). Choisissez les dates, puis « Imprimer / PDF » ou « Word ». Les deux fiches utilisent exactement les mêmes données.', 'Sheet: “Inspection sheet” (for the inspector) and “Pedagogic follow-up (VP office)” (for the vice-principal and the delegation). Choose the dates, then “Print / PDF” or “Word”. Both sheets use exactly the same data.'],
  ] },
  { h: ['Questions fréquentes', 'Frequently asked questions'], steps: [
    ['« Emploi du temps manquant » : sans les cours de la semaine d’un collègue, l’application ne peut pas savoir combien d’heures il devait faire, donc elle n’affiche pas de pourcentage.', '“Timetable missing”: without a colleague’s weekly lessons the app cannot know how many hours they owed, so it shows no percentage.'],
    ['Un cours qui n’a lieu que certains jours (par exemple deux samedis) : dans le cours de la semaine, utilisez « Seulement à ces dates » et ajoutez ces dates. Les autres semaines ne comptent pas.', 'A lesson held only on certain days (for example two Saturdays): in the weekly lesson, use “Only on these dates” and add those dates. The other weeks do not count.'],
    ['Un jour férié ou une activité de l’école : Réglages › Année scolaire › « Jours sans cours de l’établissement ». Ces heures ne sont plus dues, pour tout le monde.', 'A public holiday or school activity: Settings › School year › “School-wide days off”. Those hours are no longer due, for everyone.'],
    ['Seuils d’alerte (arrêté conjoint du 14/08/2026) : couverture horaire sous 80 %, programme sous 70 %, réussite sous 40 %.', 'Alert thresholds (joint order of 14/08/2026): hours coverage under 80%, syllabus under 70%, success rate under 40%.'],
    ['Plus d’Internet ? Vous pouvez saisir quand même : tout est gardé sur le téléphone et envoyé plus tard.', 'No Internet? You can still enter: everything is kept on the phone and sent later.'],
  ] },
];
const TEACHER = [
  { h: ['Chaque jour', 'Every day'], steps: [
    ['Sur l’Accueil, appuyez sur « Fait » à côté de votre cours du jour. Si la séance a duré moins longtemps, utilisez « Saisir autrement ».', 'On Home, tap “Done” next to your lesson of the day. If the session was shorter, use “Log differently”.'],
    ['Pas de cours aujourd’hui ? « Pas de cours », avec le motif : vous ne recevrez plus de rappel.', 'No lesson today? “No lesson”, with the reason: you will not get a reminder.'],
    ['Une saisie fausse ? Onglet « Cours » : modifier ou supprimer.', 'A wrong entry? “Lessons” tab: edit or delete.'],
  ] },
  { h: ['Voir où vous en êtes', 'See where you stand'], steps: [
    ['Accueil : vos heures et vos leçons faites, et le retard ou l’avance dans chaque classe, par semaine, mois, trimestre ou année.', 'Home: your hours and lessons done, and how late or ahead you are in each class, by week, month, term or year.'],
    ['Fiche : votre fiche personnelle, à imprimer si on vous la demande.', 'Sheet: your personal sheet, to print if asked.'],
  ] },
];

export function Guide() {
  const lang = getLang() === 'en' ? 1 : 0, parts = isAP() ? AP : TEACHER;
  return html`<div class="page"><div class="page-h"><div class="row"><a class="icon-btn" href="#/settings" aria-label=${t('Retour')}><${Icon} n="left" /></a><h1>${t('Mode d’emploi')}</h1></div></div>
    <p class="sub">${t('Rekort suit les heures et les leçons de chaque enseignant, et remplit les fiches pour vous. Voici comment l’utiliser, pas à pas.')}</p>
    ${parts.map(p => html`<div class="card"><div class="card-h"><h3>${p.h[lang]}</h3></div><ol class="guide">${p.steps.map(s => html`<li>${s[lang]}</li>`)}</ol></div>`)}</div>`;
}
