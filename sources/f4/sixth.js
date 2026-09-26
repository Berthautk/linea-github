// Sixth Form (LSA / USA) runner: full lesson spec -> gen2.build (same validated light format).
// Board summary: 2–3 short sentences per point (second cycle). 5 activities per 2-period lesson.
const fs = require('fs');
const { build } = require('./gen2');
const CRED = '/home/claude/f4/photos/credits.json';
const OUT = '/home/claude/sixth/out/';
const CLASS = { LSA: 'Lower Sixth Arts', USA: 'Upper Sixth Arts' };
const TIMING = ['Set-up, recall 8 min', 'Situation 8 min', '5 activities 30 min', 'Board summary (copying) 30 min', 'Evaluation, remediation 10 min', 'Homework, logbook 9 min', 'Spare 5 min'];

function lesson(sp, B) {
  // B = branch defaults: { level, branch, folder, module, topicDefault, code }
  const kind = sp.kind || 'Lesson';
  const lessonName = `${kind} ${sp.no}: ${sp.title}`;
  const s = Object.assign({
    header: `!GEOGRAPHY — ${CLASS[B.level].toUpperCase()}`,
    label: `${CLASS[B.level].toUpperCase()}  —  ${B.branch.toUpperCase()}  —  ${kind.toUpperCase()} ${sp.no}`,
    sumTitle: sp.title,
    coverNote: `Good morning, class. Today we study ${lessonName}.`,
    cls: CLASS[B.level], chapter: B.module, duration: '2 periods (2 × 50 minutes)',
    lesson: lessonName, timing: TIMING,
  }, sp);
  s.topic = sp.topic || B.topicDefault; s.subtopic = sp.subtopic || B.branch;
  s.outdir = OUT + B.level + '/' + B.folder + '/';
  s.file = `${B.level}_${B.code}_${kind === 'Lesson' ? 'L' : kind.replace(/[^A-Z]/g, '')}${String(sp.no).padStart(2, '0')}_${sp.title.replace(/[^A-Za-z0-9]+/g, '_').replace(/_+$/, '').slice(0, 60)}`;
  // checks
  if (s.activities.length !== 5) console.warn('!! ' + s.file + ': ' + s.activities.length + ' activities (expected 5)');
  if (!/^I\. Definition/.test(s.summary[0].title)) console.warn('!! ' + s.file + ': summary does not start with I. Definitions');
  s.summary.slice(1).forEach((p) => p.items.forEach(([h, t]) => {
    const n = (t.match(/[.!?](\s|$)/g) || []).length;
    if (n < 2 || n > 3) console.warn(`!! ${s.file}: "${h}" has ${n} sentence(s)`);
  }));
  const cred = fs.existsSync(CRED) ? JSON.parse(fs.readFileSync(CRED)) : {};
  s.activities.forEach((a) => { if (a.img && !fs.existsSync('/home/claude/f4/img/v2/' + a.img) && !fs.existsSync('/home/claude/f4/img/' + a.img)) throw new Error(s.file + ': missing image ' + a.img); });
  const gifs = s.activities.map((a, i) => (a.img && a.img.endsWith('.gif') ? i + 1 : 0)).filter(Boolean);
  s.teacherNote = (sp.teacherNote || []).concat(gifs.length ? [`Activit${gifs.length > 1 ? 'ies' : 'y'} ${gifs.join(' and ')} ${gifs.length > 1 ? 'are animations' : 'is an animation'} (GIF): it plays automatically in slide-show mode.`] : []);
  const credits = [];
  s.activities.forEach((a, i) => { if (a.img && cred[a.img]) credits.push(`Photo, Activity ${i + 1}: ${cred[a.img]}`); });
  s.references = [`National Geography Syllabus, Sixth Forms (Lower & Upper Sixth), MINESEC/IGE/IP-SS, August 2019 — ${B.moduleShort}.`]
    .concat(sp.extraRefs || [], credits, ['Diagrams and animations: drawn for this lesson (DGCAST Geography Department).']);
  return build(s);
}
async function run(list, B, only) {
  for (const s of list) if (!only || only.some((o) => (`${s.kind || 'Lesson'} ${s.no} ${s.title}`).includes(o))) {
    try { await lesson(s, B); } catch (e) { console.log('SKIPPED', e.message); }
  }
}
module.exports = { lesson, run };
