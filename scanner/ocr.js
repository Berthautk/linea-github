// Reconnaissance de texte (OCR) sur le téléphone, hors ligne : le moteur et
// les langues sont dans vendor/tesseract. Rien n'est envoyé sur internet.

let workerP = null, curLang = null, progressCb = null;

function loadLib() {
  if (window.Tesseract) return Promise.resolve();
  return new Promise((res, rej) => {
    const s = document.createElement('script');
    s.src = 'vendor/tesseract/tesseract.min.js';
    s.onload = () => res();
    s.onerror = () => rej(new Error('Moteur de reconnaissance introuvable'));
    document.head.append(s);
  });
}

function getWorker(lang) {
  if (workerP && curLang === lang) return workerP;
  const old = workerP;
  curLang = lang;
  workerP = (async () => {
    if (old) { try { (await old).terminate(); } catch { /* déjà arrêté */ } }
    await loadLib();
    const base = new URL('vendor/tesseract/', location.href).href;
    return window.Tesseract.createWorker(lang.split('+'), 1, {
      workerPath: base + 'worker.min.js',
      corePath: base + 'core',
      langPath: base + 'lang',
      gzip: true,
      workerBlobURL: false,
      logger: (m) => { if (progressCb) progressCb(m); },
    });
  })();
  workerP.catch(() => { workerP = null; });
  return workerP;
}

// Résultat simplifié : paragraphes > lignes > mots, positions en pixels de l'image.
function simplify(data) {
  const paragraphs = [];
  for (const b of data.blocks || []) {
    for (const p of b.paragraphs || []) {
      const lines = [];
      for (const l of p.lines || []) {
        const words = (l.words || [])
          .filter(w => w.text && w.text.trim())
          .map(w => ({ t: w.text.trim(), c: Math.round(w.confidence), b: [w.bbox.x0, w.bbox.y0, w.bbox.x1, w.bbox.y1] }));
        if (words.length) lines.push({ b: [l.bbox.x0, l.bbox.y0, l.bbox.x1, l.bbox.y1], words });
      }
      if (lines.length) paragraphs.push({ b: [p.bbox.x0, p.bbox.y0, p.bbox.x1, p.bbox.y1], lines });
    }
  }
  return paragraphs;
}

// onProgress(0..1) pendant la reconnaissance.
export async function recognize(image, lang, onProgress) {
  const w = await getWorker(lang);
  progressCb = (m) => {
    if (onProgress && m.status === 'recognizing text') onProgress(m.progress || 0);
  };
  try {
    const { data } = await w.recognize(image, {}, { blocks: true, text: true });
    return simplify(data);
  } finally {
    progressCb = null;
  }
}

export function paragraphText(p) {
  return linesText(p.lines);
}

// Faut-il garder un retour à la ligne entre ces deux lignes ? Oui quand la
// première finit une phrase et que la suivante commence par une majuscule,
// un chiffre ou un tiret (listes, formulaires, adresses).
export function keepBreak(prev, next) {
  return /[.:;!?»)]$/.test(prev) && /^[A-ZÀ-ÖØ-Þ0-9•\-–—(«"]/.test(next);
}

// Assemble les lignes : un mot coupé en fin de ligne (« docu- ment ») est recollé.
export function linesText(lines) {
  let out = '', prev = '';
  for (const l of lines) {
    const t = l.words.map(w => w.t).join(' ');
    if (!out) out = t;
    else if (/[a-zà-ÿ]-$/i.test(out)) out = out.slice(0, -1) + t;
    else if (keepBreak(prev, t)) out += '\n' + t;
    else out += ' ' + t;
    prev = t;
  }
  return out;
}

export function plainText(pagesOcr) {
  return pagesOcr.map(ps => ps.map(paragraphText).join('\n\n')).join('\n\n\f\n\n');
}
