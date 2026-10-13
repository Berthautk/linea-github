// Calendrier des concours : lit les périodes écrites en toutes lettres (« juin–juillet », « novembre à janvier »)
// et en tire les numéros de mois (1 à 12). Les dates restent « probables » tant qu'un arrêté n'est pas publié.

const MOIS = {
  janvier: 1, fevrier: 2, mars: 3, avril: 4, mai: 5, juin: 6, juillet: 7, aout: 8, septembre: 9, octobre: 10, novembre: 11, decembre: 12,
  january: 1, february: 2, march: 3, april: 4, may: 5, june: 6, july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
};
const NAMES = new RegExp(`\\b(${Object.keys(MOIS).join("|")})\\b`, "g");
const RANGE = /(?:^|[\s\d])(?:[–—-]|a|au|à|to|until|jusqu)(?:[\s\d]|$)|^\s*[–—-]\s*$/;

export function parseMois(text) {
  if (!text || typeof text !== "string") return [];
  const s = text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const found = [...s.matchAll(NAMES)].map((m) => ({ n: MOIS[m[1]], at: m.index, end: m.index + m[1].length }));
  const out = new Set();
  found.forEach((m, i) => {
    out.add(m.n);
    const prev = found[i - 1];
    if (prev && RANGE.test(s.slice(prev.end, m.at))) {
      // « juin à août » : on remplit les mois intermédiaires, en passant par décembre si besoin
      for (let k = (prev.n % 12) + 1; k !== m.n; k = (k % 12) + 1) out.add(k);
    }
  });
  return [...out].sort((a, b) => a - b);
}

// Périodes d'un concours : { lancement: [6, 7], depot: [7, 8], epreuves: [9, 10] }
export function moisOf(cal) {
  if (!cal) return null;
  const mois = { lancement: parseMois(cal.mois_lancement), depot: parseMois(cal.mois_limite_depot), epreuves: parseMois(cal.mois_epreuves) };
  return mois.lancement.length || mois.depot.length || mois.epreuves.length ? mois : null;
}

// Année du prochain concours : dès septembre, on parle de l'année suivante.
export const targetYear = (now = new Date()) => now.getFullYear() + (now.getMonth() >= 8 ? 1 : 0);

export const PERIODICITES = ["annuelle", "pluriannuelle", "irreguliere", "inconnue"];

// Un concours à cycle de plusieurs années est « en pause » quand sa prochaine session probable
// tombe après la prochaine année de concours. Une date probable n'est jamais présentée comme officielle.
export function enPause(per, now = new Date()) {
  return Boolean(per && per.type === "pluriannuelle" && Number.isInteger(per.prochaine_probable) && per.prochaine_probable > targetYear(now));
}
