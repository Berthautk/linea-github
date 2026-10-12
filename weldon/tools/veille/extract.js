// Veille : repère, dans une page officielle, les liens qui ressemblent à une annonce de concours.
// Fonctions pures (sans réseau), testées dans server/veille.test.js.

export const MOTS_CLES = /(concours|recrutement|arr[êe]t[ée]|ouverture|avis|communiqu[ée]|inscription|admission|[ée]preuves|r[ée]sultats?)/i;

const ENTITES = { "&amp;": "&", "&quot;": '"', "&#039;": "'", "&#39;": "'", "&rsquo;": "’", "&lsquo;": "‘", "&nbsp;": " ", "&laquo;": "«", "&raquo;": "»", "&lt;": "<", "&gt;": ">" };
const texte = (html) =>
  html
    .replace(/<[^>]*>/g, " ")
    .replace(/&(?:amp|quot|#0?39|rsquo|lsquo|nbsp|laquo|raquo|lt|gt);/g, (m) => ENTITES[m])
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/\s+/g, " ")
    .trim();

// Renvoie [{ titre, url }] : liens dont le texte contient un mot-clé, sans doublon, du plus haut de la page vers le bas.
export function extractCandidates(html, baseUrl, { max = 10 } = {}) {
  const seen = new Set();
  const out = [];
  for (const m of String(html).matchAll(/<a\s[^>]*href\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
    const titre = texte(m[2]);
    // Les titres très courts sont des rubriques de menu (« Concours »), pas des annonces.
    // On écarte aussi les noms de fichiers (« Concours_UD_IUT.pdf ») : moins de 3 mots.
    if (titre.length < 18 || titre.length > 220 || titre.split(" ").length < 3 || !MOTS_CLES.test(titre)) continue;
    let url;
    try {
      url = new URL(m[1], baseUrl);
    } catch {
      continue;
    }
    if (!/^https?:$/.test(url.protocol) || /\/(category|tag|author)\//.test(url.pathname)) continue; // pages de rubrique
    url.hash = "";
    const key = url.toString();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ titre, url: key });
    if (out.length >= max) break;
  }
  return out;
}

// robots.txt minimal : refuse si le groupe « * » interdit le chemin demandé.
export function robotsAllows(robotsTxt, path) {
  let applies = false;
  let seenRule = false;
  for (const raw of String(robotsTxt || "").split(/\r?\n/)) {
    const line = raw.replace(/#.*/, "").trim();
    const m = line.match(/^(user-agent|disallow|allow)\s*:\s*(.*)$/i);
    if (!m) continue;
    const [k, v] = [m[1].toLowerCase(), m[2].trim()];
    if (k === "user-agent") {
      if (seenRule) applies = false;
      seenRule = false;
      if (v === "*") applies = true;
    } else if (applies) {
      seenRule = true;
      if (k === "disallow" && v && path.startsWith(v)) return false;
    }
  }
  return true;
}
