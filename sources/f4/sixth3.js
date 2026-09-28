// v3 runner for all levels: lesson specs (v2_*.js) + v3 patches (v3/*.js: new board summary, section labels,
// homework answer, action to take) -> gen3.build. Lessons are chained in teaching order: each lesson corrects the
// previous homework and announces the next lesson.
const fs = require('fs');
const { build } = require('./gen3');
const HW = require('./v3/homework');   // short homework preparing the next lesson + answer, per level
const hwOf = (B, l) => (HW[B.level] || {})[l.src || key(l)];
const CRED = '/home/claude/f4/photos/credits.json';
const OUT = '/home/claude/v3out/';
const CLASS = { LSA: 'Lower Sixth Arts', USA: 'Upper Sixth Arts', F1: 'Form 1', F2: 'Form 2', F3: 'Form 4', F4: 'Form 4', F5: 'Form 5', F2T: 'Form 2 Technical' };
const SCHOOL = { LSA: 'GBHS GAROUA', USA: 'GBHS GAROUA', F1: 'DGCAST-GAROUA', F2: 'DGCAST-GAROUA', F3: 'DGCAST-GAROUA', F4: 'DGCAST-GAROUA', F5: 'DGCAST-GAROUA', F2T: 'DGCAST-GAROUA' };
const TIMING2 = ['Homework correction, plan, objectives 8 min', 'Recall, situation, action 10 min', '5 activities 30 min', 'Board summary (copying) 30 min', 'Evaluation, remediation 10 min', 'Homework, next lesson 5 min', 'Logbook 7 min'];
const TIMING1 = ['Homework correction, plan, objectives 4 min', 'Recall, situation, action 6 min', '3 activities 12 min', 'Board summary (copying) 15 min', 'Evaluation, remediation 5 min', 'Homework, next lesson 3 min', 'Logbook 5 min'];
const key = (l) => `${l.kind || 'Lesson'} ${l.no}`;
const nameOf = (l) => `${l.kind || 'Lesson'} ${l.no}: ${l.title}`;

function prepare(seq) {
  // seq: [{ L: lesson, B: branch defaults, P: patch or undefined }] in teaching order
  const rank = {};
  return seq.map(({ L: l, B, P }, i) => {
    const fk = B.level + '/' + B.folder; rank[fk] = (rank[fk] || 0) + 1;
    const nn = String(rank[fk]).padStart(2, '0') + '_';
    const sp = Object.assign({}, l, P || {});
    if (P && P.secs) sp.activities = l.activities.map((a, k) => Object.assign({}, a, { sec: P.secs[k] || a.sec }));
    if (P && P.activities) sp.activities = P.activities;
    const kind = sp.kind || 'Lesson';
    if (sp.bullets === undefined) sp.bullets = B.level === 'F2T';   // F2T: short bulleted points in the board summary
    const prev = i > 0 ? seq[i - 1] : null, next = i < seq.length - 1 ? seq[i + 1] : null;
    const prevSp = prev ? Object.assign({}, prev.L, prev.P || {}) : null;
    const h = hwOf(B, l); if (!h && HW[B.level]) console.warn('!! no new homework for ' + (l.src || key(l)));
    if (h) { sp.homework = h[0]; sp.hwAnswer = h[1]; delete sp.homeworkTag; }
    const ph = prev && hwOf(prev.B, prev.L); if (ph) { prevSp.homework = ph[0]; prevSp.hwAnswer = ph[1]; }
    Object.assign(sp, {
      cls: CLASS[B.level], clsHeader: CLASS[B.level].toUpperCase(), school: SCHOOL[B.level], level: B.level,
      lesson: nameOf(sp), lessonLabel: `${kind} ${sp.no}: ${sp.title}`,
      chapter: B.module, duration: sp.duration || '2 periods (2 × 50 minutes)', topic: sp.topic || B.topicDefault, subtopic: sp.subtopic || B.branch,
      timing: /^50 minutes/.test(sp.duration || '') ? TIMING1 : TIMING2,
      prevHomework: prevSp && prevSp.hwAnswer ? { lesson: nameOf(prevSp), q: prevSp.homework, a: prevSp.hwAnswer } : null,
      nextLesson: next ? nameOf(next.L) : null,
      outdir: OUT + B.level + '/' + B.folder + '/',
      file: nn + (sp.fileOverride || `${B.level}_${B.code}_${kind === 'Lesson' ? 'L' : kind.replace(/[^A-Z]/g, '')}${String(sp.no).padStart(2, '0')}_${sp.title.replace(/[^A-Za-z0-9]+/g, '_').replace(/_+$/, '').slice(0, 60)}`),
    });
    const cred = fs.existsSync(CRED) ? JSON.parse(fs.readFileSync(CRED)) : {};
    const credits = [];
    sp.activities.forEach((a, k) => { if (a.img && cred[a.img]) credits.push(`Photo, Activity ${k + 1}: ${cred[a.img]}`); });
    const seen = new Set(sp.activities.map((a) => a.img));
    (sp.summary || []).forEach((p) => (p.items || []).forEach((it) => { const im = it[2]; if (im && cred[im] && !seen.has(im)) { seen.add(im); credits.push(`Photo, board summary (${it[0].replace(/:$/, '')}): ${cred[im]}`); } }));
    const gifs = sp.activities.map((a, k) => (a.img && a.img.endsWith('.gif') ? k + 1 : 0)).filter(Boolean);
    sp.teacherNote = (l.teacherNote || []).concat(gifs.length ? [`Activit${gifs.length > 1 ? 'ies' : 'y'} ${gifs.join(' and ')} ${gifs.length > 1 ? 'are animations' : 'is an animation'} (GIF): it plays automatically in slide-show mode.`] : []);
    sp.references = (l.baseRefs || B.refs || [`National Geography Syllabus, MINESEC/IGE/IP-SS, 2019 — ${B.moduleShort}.`]).concat(l.extraRefs || [], credits, ['Diagrams and animations: drawn for this lesson (Geography Department).']);
    // checks
    const second = B.level === 'LSA' || B.level === 'USA';
    const want = /^50 minutes/.test(sp.duration) ? 3 : 5;
    if (!P) console.warn('.. ' + sp.file + ': no v3 patch yet (old summary kept)');
    else {
      if (!sp.hwAnswer) console.warn('!! ' + sp.file + ': no homework answer');
      if (!sp.action) console.warn('!! ' + sp.file + ': no action to take');
      sp.summary.forEach((p) => (p.items || []).forEach(([h, t]) => {
        if (Array.isArray(t)) return;   // term followed by a bulleted list (advantages, disadvantages...)
        const k = (t.match(/[.!?](\s|$)/g) || []).length; const def = /DEFINITION/i.test(p.title) || /Meaning|Definition/i.test(p.title + ' ' + (p.sub || ''));
        const lo = 1, hi = 3;
        if (k < lo || k > hi) console.warn(`!! ${sp.file}: "${h}" has ${k} sentence(s)`);
      }));
    }
    if (sp.activities.length !== want) console.warn('!! ' + sp.file + ': ' + sp.activities.length + ' activities, expected ' + want);
    if (false) console.warn('!! ' + sp.file + ': ' + sp.activities.length + ' activities');
    sp.activities.forEach((a) => { if (a.img && !fs.existsSync('/home/claude/f4/img/v2/' + a.img) && !fs.existsSync('/home/claude/f4/img/' + a.img)) throw new Error(sp.file + ': missing image ' + a.img); });
    return sp;
  });
}
async function run(seq, only) {
  const list = prepare(seq);
  for (const sp of list) if (!only || only.some((o) => (sp.lessonLabel + ' ' + sp.file).includes(o))) {
    try { await build(sp); } catch (e) { console.log('FAILED', sp.file, e.message); }
  }
}
// helper: branch spec files + patch file -> seq entries
function seqOf(specFile, patchFile, B, order) {
  const S = require(specFile); const P = patchFile && fs.existsSync(patchFile + '.js') ? require(patchFile) : {};
  const b = Object.assign({}, S.B || {}, B || {});
  let L = S.L;
  // order: syllabus order of the keys ('Lesson 19', 'Further Study 1', ...) when it differs from the spec file
  if (order) { L = order.map((k) => { const l = S.L.find((x) => key(x) === k); if (!l) throw new Error('order: ' + k); return l; }); if (L.length !== S.L.length) throw new Error('order incomplete in ' + specFile); }
  return L.map((l) => ({ L: l, B: b, P: P[key(l)] }));
}
// first cycle: v2 specs (old/<src>.json metadata + light content) + v3 patches keyed by src
function seqFirst(specFiles, patchFile, level) {
  const { meta } = require('./v2');
  const P = patchFile && fs.existsSync(patchFile + '.js') ? require(patchFile) : {};
  const out = [];
  specFiles.forEach((f) => require(f).forEach((spec) => {
    const m = meta(spec.src);
    const lab = (m.label.split('—')[1] || '').trim();
    const mm = lab.match(/^(LESSON|FURTHER STUDY|PRACTICAL WORK)\s+(\d+)(?:\s*\((PART \d+)\))?/);
    const kind = mm[1].toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
    const no = mm[3] ? `${mm[2]} (${mm[3].charAt(0) + mm[3].slice(1).toLowerCase()})` : mm[2];
    const base = (m.references || []).filter((r) => !/drawn from Natural Earth|image generated|illustration/i.test(r));
    const l = Object.assign({}, m, spec, { kind: kind === 'Lesson' ? undefined : kind, no, title: m.title, fileOverride: spec.src, baseRefs: base });
    delete l.timing;
    const B = { level, folder: '', module: m.chapter, branch: m.subtopic, topicDefault: m.topic };
    out.push({ L: l, B, P: P[spec.src] });
  }));
  return out;
}
// arrange: put seq entries (possibly from several spec files) in the syllabus order given by keys
function arrange(seq, order) {
  const out = order.map((k) => { const e = seq.find((x) => key(x.L) === k); if (!e) throw new Error('arrange: ' + k); return e; });
  if (out.length !== seq.length) throw new Error('arrange: ' + seq.length + ' entries, ' + out.length + ' keys');
  return out;
}
// native v3 specs (lessons written directly in the v3 format, no old metadata): file exports { B, L }
function seqNative(specFile) {
  const S = require(specFile);
  return S.L.map((l) => ({ L: l, B: S.B, P: l }));
}
module.exports = { run, prepare, seqOf, seqFirst, seqNative, arrange, key };
