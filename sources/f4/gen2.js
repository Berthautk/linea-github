// v2 "light" lesson builder — big images, few activities, short board summary (one sentence per point).
const { make } = require('./lib');
const fs = require('fs');
const IMG2 = '/home/claude/f4/img/v2/';
const IMG1 = '/home/claude/f4/img/';
const RED = '990011', GREY = '555555', BLACK = '111111';

function imgPath(p) { return fs.existsSync(IMG2 + p) ? IMG2 + p : IMG1 + p; }
function sizeOf(p) {
  const b = fs.readFileSync(p);
  if (b[0] === 0x89) return [b.readUInt32BE(16), b.readUInt32BE(20)];
  if (b.toString('ascii', 0, 3) === 'GIF') return [b.readUInt16LE(6), b.readUInt16LE(8)];
  let i = 2; while (i < b.length) { const m = b[i + 1], L = b.readUInt16BE(i + 2); if (m >= 0xC0 && m <= 0xC3) return [b.readUInt16BE(i + 7), b.readUInt16BE(i + 5)]; i += 2 + L; }
}

// spec: { header, outdir, file, label, title, sumTitle, cls, chapter, duration, topic, subtopic, lesson, notions, focus, competence,
//   objectives, recall, situation (string), sitQA [[q,a]x3], justification,
//   activities: [{ sec, img, caption, title, q, a, noProj }],
//   summary: [{ title, intro, items: [[lead, text]], draw: {img, caption} }],
//   evaluation [[q,a]x2], remediation [..3], remediationAnswers, homework, homeworkTag, bilingual, timing [..], teacherNote, references }
function build(sp) {
  const L = make(sp.header);
  const pres = L.pres;

  function bigImage(section, t, img, caption, note) {
    const s = pres.addSlide(); L.chrome(s, section); L.title(s, t);
    const p = imgPath(img); const [iw, ih] = sizeOf(p); const r = iw / ih;
    const bx = 0.3, by = 1.85, bw = 12.73, bh = caption ? 4.95 : 5.2;
    let w = bw, h = bw / r; if (h > bh) { h = bh; w = bh * r; }
    s.addImage({ path: p, x: bx + (bw - w) / 2, y: by + (bh - h) / 2, w, h });
    if (caption) s.addText(caption, { x: 0.5, y: 6.83, w: 12.33, h: 0.3, fontFace: 'Times New Roman', fontSize: 14, italic: true, color: GREY, align: 'center', valign: 'middle', margin: 0, isTextBox: true });
    if (note) s.addNotes(note);
    return s;
  }
  // board summary: "A. Lead: one short sentence." — several points per slide, 40 pt, never shrunk
  function sumPart(part) {
    const paras = [];
    if (part.intro) paras.push({ runs: [{ t: part.intro }] , plain: part.intro });
    part.items.forEach(([lead, text]) => paras.push({ runs: [{ t: lead + ' ', b: true, c: RED }, { t: text }], plain: lead + ' ' + text }));
    const est = (t) => { let lines = 1, cur = 0; t.split(' ').forEach((w) => { if (cur && cur + 1 + w.length > 54) { lines++; cur = w.length; } else cur += (cur ? 1 : 0) + w.length; }); return lines * 0.667 + 0.14; };
    const fits = (arr) => arr.reduce((h, x) => h + est(x.plain), 0) <= 5.0;
    const pages = []; let cur = [];
    paras.forEach((p) => { if (cur.length && !fits(cur.concat([p]))) { pages.push(cur); cur = [p]; } else cur.push(p); });
    if (cur.length) pages.push(cur);
    const extra = part.draw ? 1 : 0; const total = pages.length + extra;
    pages.forEach((pg, i) => {
      const s = pres.addSlide(); L.chrome(s, 'BOARD SUMMARY');
      L.title(s, total > 1 ? `${part.title} (${i + 1}/${total})` : part.title);
      const runs = [];
      pg.forEach((p, k) => p.runs.forEach((r, j) => runs.push({ text: r.t, options: { bold: !!r.b, color: r.c || BLACK, fontSize: 40, breakLine: j === p.runs.length - 1 && k < pg.length - 1, paraSpaceAfter: 10 } })));
      s.addText(runs, { x: 0.5, y: 1.95, w: 12.33, h: 5.1, fontFace: 'Times New Roman', valign: 'top', margin: 0, isTextBox: true });
    });
    if (part.draw) bigImage('BOARD SUMMARY', total > 1 ? `${part.title} (${total}/${total})` : part.title, part.draw.img, part.draw.caption);
  }

  const d = Object.assign({}, sp, { situation: Array.isArray(sp.situation) ? sp.situation : [sp.situation] });
  L.intro(d);
  sp.activities.forEach((a, i) => {
    const t = a.title || `Activity ${i + 1}`;
    if (a.img) bigImage(a.sec, t, a.img, a.caption, [a.note, a.noProj ? 'Without the projector: ' + a.noProj : ''].filter(Boolean).join('\n') || undefined);
    L.slide(a.sec, t + ': Question', [a.q], {}, !a.img && a.noProj ? 'Without the projector: ' + a.noProj : undefined);
    L.slide(a.sec, 'Answer', [a.a]);
  });
  L.closing(d);
  sp.summary.forEach(sumPart);
  L.ending(Object.assign({}, d, {
    remediation: [sp.remediation],
    teacherNote: (sp.timing ? ['Timing: ' + sp.timing.join(' | ')] : []).concat(sp.teacherNote || []),
    matter: sp.matter || sp.summary.map((p) => p.title + ': ' + p.items.map((x) => x[0].replace(/[.:]$/, '').replace(/^[A-Z]\. /, '')).join(', ')).join('; ') + '.',
  }));
  fs.mkdirSync(sp.outdir, { recursive: true });
  return pres.writeFile({ fileName: sp.outdir + sp.file + '.pptx' }).then(() => console.log(sp.file, L.count(), 'slides', L.warnings().filter((w) => !w.includes('0.78 > 0.7'))));
}
module.exports = { build };
