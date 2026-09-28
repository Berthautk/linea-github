// Mode lecture : le texte du document, page après page, lu à voix haute
// phrase par phrase, avec la voix du téléphone. Le texte des pages scannées
// est lu (OCR) pendant l'écoute, en commençant par la page en cours ; il est
// gardé avec la page. La position est retenue pour reprendre plus tard.

import { recognize, linesText } from './ocr.js';
import { t, getLang } from './i18n.js';

const $ = (id) => document.getElementById(id);
const RATES = [0.75, 1, 1.25, 1.5, 1.75, 2];
const MIN_CONF = 50; // mots lus avec trop peu de certitude : sautés

export function createReader(ctx) {
  // ctx : { getDoc, pages, putPage, saveLib, showScreen, toast, prefs, thumbUrl }
  const st = {
    open: false, from: 'home', idx: 0, u: 0, units: [], playing: false,
    waiting: false, token: 0, wd: 0, showImg: false,
  };
  const q = { running: false, cur: null, failed: new Set() };
  let saveTimer = 0, lock = null;

  const doc = () => ctx.getDoc();
  const ids = () => doc().ids;
  const pageAt = (i) => ctx.pages.get(ids()[i]);
  const hasText = (p) => !!(p && p.ocr && p.ocr.paragraphs);

  /* ---------- texte à lire ---------- */

  const norm = (s) => s.toLowerCase().replace(/[\d\s\W_]+/g, ' ').trim();
  const isPageNumber = (s) => /^[\s\-–—(|]*((page|p\.)\s*)?\d{1,4}(\s*(\/|sur|of)\s*\d{1,4})?[\s\-–—)|]*$/i.test(s);

  function paraTexts(page) {
    if (!hasText(page)) return [];
    return page.ocr.paragraphs.map(p => {
      const lines = p.lines
        .map(l => ({ ...l, words: l.words.filter(w => (w.c ?? 99) >= MIN_CONF) }))
        .filter(l => l.words.length);
      const h = page.ocr.h || 1;
      return { text: linesText(lines).trim(), top: p.b[1] / h, bottom: p.b[3] / h };
    }).filter(p => p.text);
  }

  // Paragraphes courts dans la marge du haut ou du bas de la page.
  function edgeParas(ps) {
    return ps.filter(p => p.text.length < 100 && (p.bottom < 0.12 || p.top > 0.88));
  }

  // En-têtes et pieds de page répétés d'une page à l'autre, numéros de page : sautés.
  function pageParas(i) {
    const ps = paraTexts(pageAt(i));
    const around = new Set();
    for (const j of [i - 1, i + 1, i - 2, i + 2]) {
      if (j < 0 || j >= ids().length) continue;
      for (const p of edgeParas(paraTexts(pageAt(j)))) around.add(norm(p.text));
    }
    const edge = new Set(edgeParas(ps));
    return ps.filter(p => {
      if (isPageNumber(p.text)) return false;
      return !(edge.has(p) && norm(p.text) && around.has(norm(p.text)));
    }).map(p => p.text);
  }

  const ABBR = /(^|[\s('’])(M|Mme|Mlle|Dr|Pr|Me|St|Ste|art|p|pp|n°|no|etc|ex|cf|vol|chap|fig|Mr|Mrs|Ms|vs|al|av|bd)\.$/i;

  function sentences(text) {
    // Fin de phrase : ponctuation suivie d'un espace (pas « 1.2 » ni « 3,5 »).
    const parts = text.replace(/\s*\n\s*/g, '\n').split(/\n|(?<=[.!?…]["»”’')\]]*)\s+/u);
    const out = [];
    let carry = '';
    for (let s of parts) {
      s = (carry + (s || '')).replace(/\s+/g, ' ').trim();
      carry = '';
      if (!s) continue;
      if (ABBR.test(s) || /(^|\s)\p{Lu}\.$/u.test(s)) { carry = s + ' '; continue; }
      if (out.length && s.length < 3) out[out.length - 1] += ' ' + s; else out.push(s);
    }
    if (carry.trim()) out.push(carry.trim());
    // Phrases très longues : coupées aux virgules ou aux espaces (les voix
    // du téléphone s'arrêtent parfois sur un texte trop long).
    const res = [];
    for (const s of out) {
      if (s.length <= 220) { res.push(s); continue; }
      let rest = s;
      while (rest.length > 220) {
        let cut = Math.max(rest.lastIndexOf(', ', 220), rest.lastIndexOf('; ', 220), rest.lastIndexOf(': ', 220));
        if (cut < 80) cut = rest.lastIndexOf(' ', 220);
        if (cut < 40) cut = 220;
        res.push(rest.slice(0, cut + 1).trim());
        rest = rest.slice(cut + 1).trim();
      }
      if (rest) res.push(rest);
    }
    return res;
  }

  function buildUnits(i) {
    const units = [];
    pageParas(i).forEach((p, k) => { for (const s of sentences(p)) units.push({ text: s, para: k }); });
    return units;
  }

  function langOf(units) {
    const text = units.map(u => u.text).join(' ');
    const fr = (text.match(/\b(le|la|les|des|du|est|et|pour|avec|une|dans|que)\b/gi) || []).length;
    const en = (text.match(/\b(the|and|of|is|for|with|this|that|are|to)\b/gi) || []).length;
    if (!fr && !en) return getLang() === 'en' ? 'en-GB' : 'fr-FR';
    return fr >= en ? 'fr-FR' : 'en-GB';
  }

  function voiceFor(lang) {
    const vs = (window.speechSynthesis && speechSynthesis.getVoices()) || [];
    const two = lang.slice(0, 2);
    const same = vs.filter(v => v.lang && v.lang.replace('_', '-').toLowerCase().startsWith(two));
    return same.find(v => v.lang.replace('_', '-') === lang && v.localService)
      || same.find(v => v.localService) || same.find(v => v.lang.replace('_', '-') === lang) || same[0] || null;
  }

  /* ---------- lecture du texte des pages scannées (OCR) ---------- */

  function nextMissing() {
    const n = ids().length;
    for (let k = 0; k < n; k++) {
      const i = (st.idx + k) % n;
      const p = pageAt(i);
      if (p && !hasText(p) && !q.failed.has(p.id)) return p;
    }
    return null;
  }

  async function pump() {
    if (q.running) return;
    q.running = true;
    try {
      while (st.open) {
        const page = nextMissing();
        if (!page) break;
        q.cur = page.id;
        status();
        try {
          const paragraphs = await recognize(page.proc, 'fra+eng');
          page.ocr = { lang: 'fra+eng', w: page.w, h: page.h, paragraphs };
          await ctx.putPage(page);
        } catch (e) {
          console.error(e);
          if (!st.open) break;
          q.failed.add(page.id);
        }
        if (page.id === ids()[st.idx]) {
          const u = st.u;
          render();
          st.u = Math.min(u, Math.max(0, st.units.length - 1));
          if (st.waiting) { st.waiting = false; if (st.units.length) speakUnit(); else nextPage(true); }
        }
        status();
      }
    } finally {
      q.running = false;
      q.cur = null;
      if (st.open) status();
    }
  }

  function readyCount() {
    return ids().reduce((s, id) => s + (hasText(ctx.pages.get(id)) ? 1 : 0), 0);
  }

  function status() {
    const n = ids().length, ready = readyCount();
    let s;
    if (st.waiting) s = t('rd.waiting', { i: st.idx + 1 });
    else if (ready >= n) s = t('rd.allReady');
    else if (q.cur) s = t('rd.progress', { r: ready, n, i: ids().indexOf(q.cur) + 1 });
    else s = t('rd.partial', { r: ready, n });
    $('rdStatus').textContent = s;
  }

  /* ---------- affichage ---------- */

  function render() {
    const i = st.idx, n = ids().length, page = pageAt(i);
    $('rdPage').textContent = t('rd.page', { i: i + 1, n });
    $('rdGo').value = i + 1;
    $('rdGo').max = n;
    $('rdPrevPage').disabled = i === 0;
    $('rdNextPage').disabled = i >= n - 1;
    const box = $('rdText');
    box.textContent = '';
    st.units = hasText(page) ? buildUnits(i) : [];
    st.lang = langOf(st.units);
    box.lang = st.lang.slice(0, 2);
    if (st.showImg || !hasText(page)) {
      const img = document.createElement('img');
      img.className = 'rdimg';
      img.alt = t('tile.page', { n: i + 1 });
      img.src = ctx.thumbUrl(page, true);
      if (!st.showImg) {
        const p = document.createElement('p');
        p.className = 'muted';
        p.textContent = q.failed.has(page.id) ? t('rd.failed') : t('rd.reading');
        box.append(p);
      }
      box.append(img);
      if (st.showImg) return;
    }
    if (hasText(page) && !st.units.length) {
      const p = document.createElement('p');
      p.className = 'muted';
      p.textContent = t('rd.noText');
      box.append(p);
      return;
    }
    let para = -1, el = null;
    st.units.forEach((u, k) => {
      if (u.para !== para) {
        para = u.para;
        el = document.createElement('p');
        box.append(el);
      }
      const s = document.createElement('span');
      s.dataset.u = k;
      s.textContent = u.text + ' ';
      el.append(s);
    });
    highlight(false);
  }

  function highlight(scroll = true) {
    const box = $('rdText');
    box.querySelectorAll('span.cur').forEach(s => s.classList.remove('cur'));
    const s = box.querySelector(`span[data-u="${st.u}"]`);
    if (!s) return;
    s.classList.add('cur');
    if (scroll) {
      const r = s.getBoundingClientRect(), b = box.getBoundingClientRect();
      if (r.top < b.top + 40 || r.bottom > b.bottom - 40) s.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }

  function setPlayBtn() {
    $('rdPlay').innerHTML = `<svg viewBox="0 0 24 24" width="30" height="30" aria-hidden="true"><path fill="currentColor" d="${st.playing ? 'M6 5h4v14H6zM14 5h4v14h-4z' : 'M8 5v14l11-7z'}"/></svg>`;
    $('rdPlay').setAttribute('aria-label', t(st.playing ? 'rd.pause' : 'rd.play'));
  }

  /* ---------- voix ---------- */

  function savePos() {
    const d = doc();
    d.readPos = { id: ids()[st.idx], u: st.u };
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => ctx.saveLib(), 1200);
  }

  async function keepAwake(on) {
    try {
      if (on && !lock && 'wakeLock' in navigator) {
        lock = await navigator.wakeLock.request('screen');
        lock.addEventListener('release', () => { lock = null; });
      } else if (!on && lock) {
        const l = lock;
        lock = null;
        await l.release();
      }
    } catch { /* refusé : l'écran peut s'éteindre */ }
  }

  function silence() {
    st.token++;
    clearTimeout(st.wd);
    if (window.speechSynthesis) speechSynthesis.cancel();
  }

  function speakUnit() {
    if (!st.playing) return;
    const unit = st.units[st.u];
    if (!unit) { nextPage(true); return; }
    st.token++;
    clearTimeout(st.wd);
    // Pas d'annulation systématique : sur certains téléphones, une phrase
    // lancée juste après une annulation n'est jamais dite.
    if (speechSynthesis.speaking || speechSynthesis.pending) speechSynthesis.cancel();
    const my = st.token;
    highlight();
    savePos();
    const u = new SpeechSynthesisUtterance(unit.text);
    u.lang = st.lang;
    const v = voiceFor(st.lang);
    if (v) u.voice = v;
    u.rate = rate();
    let done = false, started = false, retried = false;
    u.onstart = () => { started = true; };
    const next = () => {
      if (done || my !== st.token) return;
      done = true;
      clearTimeout(st.wd);
      st.u++;
      speakUnit();
    };
    u.onend = next;
    u.onerror = (e) => {
      if (my !== st.token || e.error === 'interrupted' || e.error === 'canceled') return;
      console.warn('speech', e.error);
      if (e.error === 'not-allowed' || e.error === 'synthesis-unavailable') { pause(); ctx.toast(t('toast.noSpeech')); return; }
      next();
    };
    // Certains téléphones n'annoncent pas toujours la fin d'une phrase.
    const check = () => {
      if (my !== st.token) return;
      if (speechSynthesis.speaking || speechSynthesis.pending) st.wd = setTimeout(check, 1500);
      else if (!started && !retried) { retried = true; speechSynthesis.speak(u); st.wd = setTimeout(check, 4000); }
      else next();
    };
    st.wd = setTimeout(check, (unit.text.length / (13 * u.rate) + 4) * 1000);
    speechSynthesis.speak(u);
  }

  function nextPage(auto) {
    if (st.idx >= ids().length - 1) {
      if (auto) {
        pause();
        st.u = 0;
        ctx.toast(t('rd.end'));
        doc().readPos = null;
        ctx.saveLib();
      }
      return;
    }
    goPage(st.idx + 1);
  }

  function goPage(i, keepPlaying = true) {
    silence();
    st.idx = Math.max(0, Math.min(ids().length - 1, i));
    st.u = 0;
    st.waiting = false;
    render();
    savePos();
    pump();
    if (st.playing && keepPlaying) {
      if (!hasText(pageAt(st.idx)) && !q.failed.has(pageAt(st.idx).id)) { st.waiting = true; status(); }
      else if (st.units.length) speakUnit();
      else nextPage(true);
    }
    status();
  }

  function play() {
    if (!('speechSynthesis' in window)) { ctx.toast(t('toast.noSpeech')); return; }
    st.playing = true;
    setPlayBtn();
    keepAwake(true);
    if (st.showImg) { st.showImg = false; render(); }
    const page = pageAt(st.idx);
    if (!hasText(page) && !q.failed.has(page.id)) { st.waiting = true; status(); pump(); return; }
    if (!st.units.length) { nextPage(true); return; }
    if (st.u >= st.units.length) st.u = 0;
    speakUnit();
  }

  function pause() {
    st.playing = false;
    st.waiting = false;
    silence();
    setPlayBtn();
    keepAwake(false);
    status();
  }

  function rate() { return +ctx.prefs.get('rdRate', '1') || 1; }

  function jumpPara(dir) {
    if (!st.units.length) { if (dir > 0) nextPage(false); else if (st.idx > 0) goPage(st.idx - 1); return; }
    const cur = st.units[Math.min(st.u, st.units.length - 1)].para;
    let k;
    if (dir > 0) {
      k = st.units.findIndex(u => u.para > cur);
      if (k < 0) { goPage(st.idx + 1); return; }
    } else {
      const start = st.units.findIndex(u => u.para === cur);
      // Au début du paragraphe : on recule d'un paragraphe ; sinon on revient à son début.
      const target = st.u > start ? cur : cur - 1;
      if (target < 0) {
        if (st.idx > 0) goPage(st.idx - 1);
        else { st.u = 0; restart(); }
        return;
      }
      k = st.units.findIndex(u => u.para === target);
    }
    st.u = k;
    restart();
  }

  function restart() {
    silence();
    highlight();
    savePos();
    if (st.playing) speakUnit();
  }

  function setSize(d) {
    const v = Math.max(15, Math.min(34, (+ctx.prefs.get('rdSize', '20') || 20) + d));
    ctx.prefs.set('rdSize', String(v));
    $('rdText').style.fontSize = v + 'px';
  }

  /* ---------- boutons ---------- */

  $('rdPlay').onclick = () => (st.playing || st.waiting ? pause() : play());
  $('rdPrevPage').onclick = () => goPage(st.idx - 1);
  $('rdNextPage').onclick = () => goPage(st.idx + 1);
  $('rdBackPara').onclick = () => jumpPara(-1);
  $('rdFwdPara').onclick = () => jumpPara(1);
  $('rdGo').onchange = () => {
    const v = parseInt($('rdGo').value, 10);
    if (v >= 1 && v - 1 !== st.idx) goPage(v - 1);
  };
  $('rdSmaller').onclick = () => setSize(-2);
  $('rdBigger').onclick = () => setSize(2);
  $('rdImg').onclick = () => {
    st.showImg = !st.showImg;
    $('rdImg').classList.toggle('on', st.showImg);
    if (st.showImg && st.playing) pause();
    render();
  };
  $('rdRate').onchange = () => { ctx.prefs.set('rdRate', $('rdRate').value); if (st.playing) restart(); };
  $('rdText').onclick = (e) => {
    const s = e.target.closest('span[data-u]');
    if (!s) return;
    st.u = +s.dataset.u;
    if (st.playing) restart(); else play();
  };
  $('rdBack').onclick = () => close();

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'visible' || !st.open || !st.playing) return;
    keepAwake(true);
    // Le téléphone a pu couper la voix pendant que l'écran était éteint : on reprend la phrase.
    if (!st.waiting && !speechSynthesis.speaking && !speechSynthesis.pending) restart();
  });

  function fillRates() {
    const sel = $('rdRate');
    sel.textContent = '';
    const cur = rate();
    for (const r of RATES) {
      const o = document.createElement('option');
      o.value = String(r);
      o.textContent = `${String(r).replace('.', getLang() === 'fr' ? ',' : '.')}×`;
      sel.append(o);
    }
    sel.value = String(RATES.includes(cur) ? cur : 1);
  }

  /* ---------- ouverture ---------- */

  function open({ index = null, autoplay = false, from = 'home' } = {}) {
    const d = doc();
    if (!d.ids.length) return;
    st.open = true;
    st.from = from;
    st.showImg = false;
    $('rdImg').classList.remove('on');
    q.failed.clear();
    let i = index;
    let u = 0;
    if (i == null && d.readPos) {
      i = d.ids.indexOf(d.readPos.id);
      u = d.readPos.u || 0;
    }
    if (i == null || i < 0) { i = 0; u = 0; }
    st.idx = i;
    $('rdTitle').textContent = d.name;
    fillRates();
    setSize(0);
    ctx.showScreen('reader');
    render();
    st.u = Math.min(u, Math.max(0, st.units.length - 1));
    highlight();
    status();
    pump();
    if (autoplay) play(); else setPlayBtn();
  }

  function close() {
    pause();
    st.open = false;
    clearTimeout(saveTimer);
    ctx.saveLib();
    ctx.showScreen(st.from);
    ctx.onClose?.(st.from);
  }

  return {
    open,
    close,
    get isOpen() { return st.open; },
    relabel() { if (st.open) { fillRates(); render(); status(); setPlayBtn(); } },
    // pour les tests
    _st: st,
    _sentences: sentences,
  };
}
