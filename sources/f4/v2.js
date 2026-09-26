// v2 runner: old lesson metadata (old/<file>.json) + new light content -> gen2.build, with automatic photo credits.
const fs = require('fs');
const { build } = require('./gen2');
const CRED = '/home/claude/f4/photos/credits.json';
const OUT = { F2T: '/home/claude/f4/out/F2T_v2/', F4: '/home/claude/f4/out/F4_v2/' };
const KEEP = ['header', 'label', 'title', 'sumTitle', 'coverNote', 'cls', 'chapter', 'duration', 'topic', 'subtopic', 'lesson', 'notions', 'focus', 'competence',
  'objectives', 'recall', 'recallNote', 'justification', 'homework', 'homeworkTag', 'bilingual', 'references'];

function meta(src) {
  const j = JSON.parse(fs.readFileSync(__dirname + '/old/' + src + '.json'));
  const m = { header: j.header };
  const both = Object.assign({}, j.d, j.end || {});
  KEEP.forEach((k) => { if (both[k] !== undefined && k !== 'header') m[k] = both[k]; });
  return m;
}
const TIMING = {
  3: ['Set-up, recall 5 min', 'Situation 5 min', '3 activities 12 min', 'Board summary (copying) 15 min', 'Evaluation, homework 5 min', 'Logbook 5 min', 'Spare 3 min'],
  5: ['Set-up, recall 8 min', 'Situation 8 min', '5 activities 25 min', 'Board summary (copying) 30 min', 'Evaluation, remediation 10 min', 'Homework 4 min', 'Logbook 10 min', 'Spare 5 min'],
};

function lesson(spec) {
  const m = meta(spec.src);
  const sp = Object.assign({}, m, spec);
  const form = sp.header === 'FORM 4' ? 'F4' : 'F2T';
  sp.outdir = OUT[form]; sp.file = (spec.file || spec.src) + '_v2';
  const n = sp.activities.length;
  const want = /2 periods/.test(sp.duration) ? 5 : 3;
  if (n !== want) console.warn('!! ' + sp.file + ': ' + n + ' activities, expected ' + want);
  sp.timing = sp.timing || TIMING[want];
  // notes: GIF animations and photo credits
  const cred = fs.existsSync(CRED) ? JSON.parse(fs.readFileSync(CRED)) : {};
  const gifs = sp.activities.map((a, i) => (a.img && a.img.endsWith('.gif') ? i + 1 : 0)).filter(Boolean);
  sp.teacherNote = (spec.teacherNote || []).concat(gifs.length ? [`Activit${gifs.length > 1 ? 'ies' : 'y'} ${gifs.join(' and ')} ${gifs.length > 1 ? 'are animations' : 'is an animation'} (GIF): it plays automatically in slide-show mode.`] : []);
  const credits = [];
  sp.activities.forEach((a, i) => { if (a.img && cred[a.img]) credits.push(`Photo, Activity ${i + 1}: ${cred[a.img]}`); });
  sp.summary.forEach((p) => { if (p.draw && cred[p.draw.img]) credits.push(`Photo, board summary: ${cred[p.draw.img]}`); });
  const base = (m.references || []).filter((r) => !/drawn from Natural Earth|image generated|illustration/i.test(r));
  sp.references = base.concat(spec.extraRefs || [], credits, ['Diagrams and animations: drawn for this lesson (DGCAST Geography Department).']);
  // checks: summary starts with definitions, 40 pt text is automatic
  if (!/^I\. Definition/.test(sp.summary[0].title)) console.warn('!! ' + sp.file + ': summary does not start with I. Definitions');
  sp.activities.forEach((a) => { if (a.img && !fs.existsSync('/home/claude/f4/img/v2/' + a.img) && !fs.existsSync('/home/claude/f4/img/' + a.img)) throw new Error(sp.file + ': missing image ' + a.img); });
  return build(sp);
}
async function run(list, only) { for (const s of list) if (!only || only.some((o) => (s.file || s.src).includes(o))) { try { await lesson(s); } catch (e) { console.log('SKIPPED', e.message); } } }
module.exports = { lesson, run, meta };
