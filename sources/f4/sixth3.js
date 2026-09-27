// v3 runner for all levels: lesson specs (v2_*.js) + v3 patches (v3/*.js: new board summary, section labels,
// homework answer, action to take) -> gen3.build. Lessons are chained in teaching order: each lesson corrects the
// previous homework and announces the next lesson.
const fs = require('fs');
const { build } = require('./gen3');
const CRED = '/home/claude/f4/photos/credits.json';
const OUT = '/home/claude/v3out/';
const CLASS = { LSA: 'Lower Sixth Arts', USA: 'Upper Sixth Arts', F4: 'Form 4', F2T: 'Form 2 Technical' };
const SCHOOL = { LSA: 'GBHS GAROUA', USA: 'GBHS GAROUA', F4: 'DGCAST-GAROUA', F2T: 'DGCAST-GAROUA' };
const TIMING2 = ['Homework correction, plan, objectives 8 min', 'Recall, situation, action 10 min', '5 activities 30 min', 'Board summary (copying) 30 min', 'Evaluation, remediation 10 min', 'Homework, next lesson 5 min', 'Logbook 7 min'];
const key = (l) => `${l.kind || 'Lesson'} ${l.no}`;
const nameOf = (l) => `${l.kind || 'Lesson'} ${l.no}: ${l.title}`;

function prepare(seq) {
  // seq: [{ L: lesson, B: branch defaults, P: patch or undefined }] in teaching order
  return seq.map(({ L: l, B, P }, i) => {
    const sp = Object.assign({}, l, P || {});
    if (P && P.secs) sp.activities = l.activities.map((a, k) => Object.assign({}, a, { sec: P.secs[k] || a.sec }));
    if (P && P.activities) sp.activities = P.activities;
    const kind = sp.kind || 'Lesson';
    const prev = i > 0 ? seq[i - 1] : null, next = i < seq.length - 1 ? seq[i + 1] : null;
    const prevSp = prev ? Object.assign({}, prev.L, prev.P || {}) : null;
    Object.assign(sp, {
      cls: CLASS[B.level], clsHeader: CLASS[B.level].toUpperCase(), school: SCHOOL[B.level], level: B.level,
      lesson: nameOf(sp), lessonLabel: `${kind} ${sp.no}: ${sp.title}`,
      chapter: B.module, duration: sp.duration || '2 periods (2 × 50 minutes)', topic: sp.topic || B.topicDefault, subtopic: sp.subtopic || B.branch,
      timing: sp.timing || TIMING2,
      prevHomework: prevSp && prevSp.hwAnswer ? { lesson: nameOf(prevSp), q: prevSp.homework, a: prevSp.hwAnswer } : null,
      nextLesson: next ? nameOf(next.L) : null,
      outdir: OUT + B.level + '/' + B.folder + '/',
      file: `${B.level}_${B.code}_${kind === 'Lesson' ? 'L' : kind.replace(/[^A-Z]/g, '')}${String(sp.no).padStart(2, '0')}_${sp.title.replace(/[^A-Za-z0-9]+/g, '_').replace(/_+$/, '').slice(0, 60)}`,
    });
    const cred = fs.existsSync(CRED) ? JSON.parse(fs.readFileSync(CRED)) : {};
    const credits = [];
    sp.activities.forEach((a, k) => { if (a.img && cred[a.img]) credits.push(`Photo, Activity ${k + 1}: ${cred[a.img]}`); });
    const gifs = sp.activities.map((a, k) => (a.img && a.img.endsWith('.gif') ? k + 1 : 0)).filter(Boolean);
    sp.teacherNote = (l.teacherNote || []).concat(gifs.length ? [`Activit${gifs.length > 1 ? 'ies' : 'y'} ${gifs.join(' and ')} ${gifs.length > 1 ? 'are animations' : 'is an animation'} (GIF): it plays automatically in slide-show mode.`] : []);
    sp.references = (B.refs || [`National Geography Syllabus, MINESEC/IGE/IP-SS, 2019 — ${B.moduleShort}.`]).concat(l.extraRefs || [], credits, ['Diagrams and animations: drawn for this lesson (Geography Department).']);
    // checks
    const second = B.level === 'LSA' || B.level === 'USA';
    if (!P) console.warn('.. ' + sp.file + ': no v3 patch yet (old summary kept)');
    else {
      if (!sp.hwAnswer) console.warn('!! ' + sp.file + ': no homework answer');
      if (!sp.action) console.warn('!! ' + sp.file + ': no action to take');
      sp.summary.forEach((p) => (p.items || []).forEach(([h, t]) => {
        const k = (t.match(/[.!?](\s|$)/g) || []).length; const def = /DEFINITION/i.test(p.title) || /Meaning|Definition/i.test(p.title + ' ' + (p.sub || ''));
        const lo = second ? (def ? 1 : 2) : 1, hi = second ? 3 : (def ? 2 : 1);
        if (k < lo || k > hi) console.warn(`!! ${sp.file}: "${h}" has ${k} sentence(s)`);
      }));
    }
    if (sp.activities.length !== 5 && second) console.warn('!! ' + sp.file + ': ' + sp.activities.length + ' activities');
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
function seqOf(specFile, patchFile, B) {
  const S = require(specFile); const P = patchFile && fs.existsSync(patchFile + '.js') ? require(patchFile) : {};
  const b = Object.assign({}, S.B || {}, B || {});
  return S.L.map((l) => ({ L: l, B: b, P: P[key(l)] }));
}
module.exports = { run, prepare, seqOf, key };
