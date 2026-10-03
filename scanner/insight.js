// Recherche dans le texte des pages et résumé automatique, sur le téléphone.
// Le résumé reprend les phrases clés du document (méthode statistique, sans
// intelligence artificielle en ligne) : chaque phrase renvoie à sa page.

// Minuscules et sans accents, caractère par caractère (même longueur que le
// texte d'origine : les positions trouvées servent à extraire le passage).
export function fold(s) {
  let out = '';
  for (const ch of s) {
    const c = ch.normalize('NFD')[0].toLowerCase();
    out += c.length === ch.length ? c : ch.toLowerCase();
  }
  return out;
}

const STOP = new Set((
  'a à au aux avec ce ces cet cette dans de des du elle elles en et eux il ils je la le les leur leurs lui ma mais me même mes moi mon ne nos notre nous on ou où par pas pour qu que qui sa se ses son sur ta te tes toi ton tu un une vos votre vous y d l n s c j m t qu été être est sont était ont avait avoir fait faire plus moins très tout tous toute toutes comme si non oui aussi ainsi donc car alors entre sans sous chez vers depuis peut peuvent doit cela celui celle ceux dont lors leur ici là ' +
  'deux trois quatre cinq premier première autre autres chaque plusieurs bien encore toujours jamais ' +
  'the of and to in a is that for it as was with be by on not he i this are or his from at which but have an they you were her she there their one all we can has more when will would so no if out been than them into its who what about other some these may only also any could my such then over our two your those after first most new up its how where very'
).split(' '));

const WORD = /[\p{L}][\p{L}'’-]*/gu;

export function tokens(text) {
  const out = [];
  let m;
  WORD.lastIndex = 0;
  while ((m = WORD.exec(text))) out.push({ w: fold(m[0]).replace(/^[a-z]['’]/, ''), at: m.index, len: m[0].length, raw: m[0] });
  return out;
}

// Racine d'un mot cherché : photosynthesis, photosynthèse et photosynthetic
// se retrouvent par leur début commun.
function stem(w) {
  w = fold(w);
  if (w.length >= 7) return w.slice(0, w.length - 3);
  if (w.length >= 5) return w.slice(0, w.length - 1);
  return w;
}

export function queryStems(q) {
  return tokens(q).map(t => t.w).filter(w => w && !(STOP.has(w) && q.trim().split(/\s+/).length > 1)).map(stem);
}

// pages : [{ key, page, text }] → résultats { key, page, count, before, match, after }
export function search(pages, q, max = 300) {
  const st = queryStems(q);
  if (!st.length) return [];
  const res = [];
  for (const p of pages) {
    if (!p.text) continue;
    const toks = tokens(p.text);
    const hits = toks.filter(t => st.some(s => t.w.startsWith(s)));
    if (!st.every(s => hits.some(t => t.w.startsWith(s)))) continue;
    const first = hits.find(t => t.w.startsWith(st[0])) || hits[0];
    const a = Math.max(0, first.at - 70), b = Math.min(p.text.length, first.at + first.len + 90);
    const cut = (s, start) => (start ? s.replace(/^\S*\s/, '') : s);
    res.push({
      key: p.key, page: p.page, count: hits.length,
      before: (a > 0 ? '…' : '') + cut(p.text.slice(a, first.at), a > 0).replace(/\s+/g, ' '),
      match: p.text.slice(first.at, first.at + first.len),
      after: p.text.slice(first.at + first.len, b).replace(/\s+/g, ' ') + (b < p.text.length ? '…' : ''),
    });
    if (res.length >= max) break;
  }
  return res;
}

const ABBR = /(^|[\s('’])(M|Mme|Mlle|Dr|Pr|Me|St|Ste|art|p|pp|n°|no|etc|ex|cf|vol|chap|fig|Mr|Mrs|Ms|vs|al|\p{Lu})\.$/u;
export function sentencesOf(text) {
  const parts = text.replace(/\s*\n\s*/g, ' ').split(/(?<=[.!?…])\s+(?=[«"(]?[\p{Lu}0-9])/u);
  const out = [];
  for (const p of parts) {
    const s = p.trim();
    if (!s) continue;
    // « M. Dupont », « art. 12 » : pas une fin de phrase.
    if (out.length && ABBR.test(out[out.length - 1])) out[out.length - 1] += ' ' + s; else out.push(s);
  }
  return out;
}

// Résumé : phrases notées d'après les mots importants du document.
// pages : [{ key, page, text }] ; n : nombre de phrases.
export function summarize(pages, n = 5) {
  const sents = [];
  const tf = new Map(), df = new Map();
  pages.forEach((p, pi) => {
    if (!p.text) return;
    const seen = new Set();
    for (const s of sentencesOf(p.text)) {
      const words = tokens(s).map(t => t.w).filter(w => w.length >= 3 && !STOP.has(w));
      for (const w of words) { tf.set(w, (tf.get(w) || 0) + 1); seen.add(w); }
      sents.push({ text: s, page: p.page, key: p.key, words, order: sents.length, pi });
    }
    for (const w of seen) df.set(w, (df.get(w) || 0) + 1);
  });
  const P = Math.max(1, pages.filter(p => p.text).length);
  const weight = (w) => Math.log(1 + (tf.get(w) || 0)) * (P > 2 ? Math.log(1 + P / (df.get(w) || 1)) : 1);
  const ok = (s) => {
    const len = s.text.length;
    if (len < 40 || len > 340 || s.words.length < 6) return false;
    const letters = (s.text.match(/\p{L}/gu) || []).length;
    const upper = (s.text.match(/\p{Lu}/gu) || []).length;
    return letters > len * 0.6 && upper < letters * 0.4;
  };
  const scored = sents.filter(ok).map(s => {
    const uniq = [...new Set(s.words)];
    return { ...s, score: uniq.reduce((a, w) => a + weight(w), 0) / Math.max(8, uniq.length) ** 0.85 };
  }).sort((a, b) => b.score - a.score);
  const chosen = [];
  for (const s of scored) {
    const set = new Set(s.words);
    const dup = chosen.some(c => {
      const inter = c.words.filter(w => set.has(w)).length;
      return inter / Math.min(set.size, new Set(c.words).size) > 0.55;
    });
    if (!dup) chosen.push(s);
    if (chosen.length >= n) break;
  }
  chosen.sort((a, b) => a.order - b.order);

  // Mots-clés : fréquents dans le document, sous leur forme la plus courante.
  const forms = new Map();
  pages.forEach(p => {
    if (!p.text) return;
    for (const t of tokens(p.text)) {
      if (t.w.length < 4 || STOP.has(t.w)) continue;
      const f = forms.get(t.w) || new Map();
      f.set(t.raw, (f.get(t.raw) || 0) + 1);
      forms.set(t.w, f);
    }
  });
  // Formes voisines (civil / civile, page / pages) : un seul mot-clé.
  const seenStem = new Set();
  const keywords = [...tf.keys()].filter(w => w.length >= 4 && (tf.get(w) || 0) >= 2)
    .sort((a, b) => weight(b) * tf.get(b) ** 0.3 - weight(a) * tf.get(a) ** 0.3)
    .filter(w => { const k = w.slice(0, Math.max(4, w.length - 2)); const k2 = w.slice(0, 5); if (seenStem.has(k) || seenStem.has(k2)) return false; seenStem.add(k); seenStem.add(k2); return true; })
    .slice(0, 14)
    .map(w => {
      const f = forms.get(w);
      if (!f) return w;
      const best = [...f.entries()].sort((a, b) => b[1] - a[1])[0][0];
      return best.length > 2 && best === best.toUpperCase() ? best : best.toLowerCase();
    });
  return { sentences: chosen.map(s => ({ text: s.text, page: s.page, key: s.key })), keywords };
}

// Catégorie proposée pour un document d'après son nom et son texte.
const CATS = {
  etudes: 'cours chapitre leçon lecon exercice examen devoir université universite école ecole lycée lycee faculté licence master manuel biologie mathématiques physique chimie histoire géographie philosophie lesson chapter exam course school university',
  travail: 'contrat rapport réunion reunion projet client employé employe salarié entreprise société mission stage offre emploi travail report meeting project company job',
  admin: 'acte naissance mariage identité identite nationalité passeport ministère ministere préfecture mairie attestation certificat dossier candidature concours casier visa administration',
  finance: 'facture reçu recu montant total payer paiement banque relevé releve impôt impot fcfa euros prix tva devis quittance invoice receipt amount bank payment',
};
export function guessCategory(text) {
  const toks = new Set(tokens(text || '').map(t => t.w));
  let best = null, bv = 0;
  for (const [cat, list] of Object.entries(CATS)) {
    const v = list.split(' ').filter(w => toks.has(fold(w))).length;
    if (v > bv) { bv = v; best = cat; }
  }
  return bv >= 2 ? best : null;
}

// Questions à trous pour réviser : dans une phrase clé, le mot-clé le plus
// important est caché ; la réponse s'affiche en touchant.
export function cloze(sentences, keywords, max = 8) {
  const keys = keywords.map(k => fold(k));
  const out = [];
  for (const s of sentences) {
    const toks = tokens(s.text);
    const hit = toks.find(t => keys.includes(t.w)) || toks.filter(t => t.w.length >= 6 && !STOP.has(t.w)).sort((a, b) => b.len - a.len)[0];
    if (!hit) continue;
    out.push({ before: s.text.slice(0, hit.at), answer: hit.raw, after: s.text.slice(hit.at + hit.len), page: s.page, key: s.key });
    if (out.length >= max) break;
  }
  return out;
}

// Paragraphes d'un document avec leur rôle (titre ou texte), pour Markdown et HTML.
function blocksOf(docs, textOf) {
  const med = (a) => { const s = a.slice().sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : 0; };
  return docs.map(d => {
    const body = med(d.paragraphs.flatMap(p => p.lines.map(l => l.b[3] - l.b[1]))) || 1;
    return d.paragraphs.map(p => {
      const text = textOf(p).trim();
      const lh = med(p.lines.map(l => l.b[3] - l.b[1]));
      return { text, heading: !p.added && lh > body * 1.3 && text.length < 160 };
    }).filter(b => b.text);
  });
}

export function toMarkdown(docs, textOf, title) {
  const out = [`# ${title}`, ''];
  blocksOf(docs, textOf).forEach((page, i) => {
    if (i > 0) out.push('---', '');
    for (const b of page) out.push(b.heading ? `## ${b.text.replace(/\n/g, ' ')}` : b.text.replace(/\n/g, '  \n'), '');
  });
  return out.join('\n');
}

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
export function toHtml(docs, textOf, title, lang = 'fr') {
  const parts = [];
  blocksOf(docs, textOf).forEach((page, i) => {
    if (i > 0) parts.push('<hr>');
    for (const b of page) parts.push(b.heading ? `<h2>${esc(b.text)}</h2>` : `<p>${esc(b.text).replace(/\n/g, '<br>')}</p>`);
  });
  return `<!doctype html>
<html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<style>body{font:17px/1.6 Georgia,serif;max-width:46em;margin:2em auto;padding:0 1em;color:#16202a}h1,h2{font-family:system-ui,sans-serif}hr{border:0;border-top:1px solid #ccd;margin:2em 0}</style>
</head><body>
<h1>${esc(title)}</h1>
${parts.join('\n')}
</body></html>
`;
}
