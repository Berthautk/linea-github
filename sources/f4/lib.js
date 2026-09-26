// Shared DGCAST lesson builder (MINESEC standard: Times New Roman, titles 36, text 40)
const pptxgen = require('pptxgenjs');
const sizeOf = (p) => { const b = require('fs').readFileSync(p); if (b[0] === 0x89) return [b.readUInt32BE(16), b.readUInt32BE(20)];
  let i = 2; while (i < b.length) { const m = b[i + 1], L = b.readUInt16BE(i + 2); if (m >= 0xC0 && m <= 0xC3) return [b.readUInt16BE(i + 7), b.readUInt16BE(i + 5)]; i += 2 + L; } };

const RED = '990011', NAVY = '1C3F6E', GOLD = 'B8860B', SLATE = '36454F', BLACK = '111111', GREY = '555555';
const TNR = 'Times New Roman';
const IMG = '/home/claude/f4/img/';

function make(formLabel) {
  const pres = new pptxgen();
  pres.layout = 'LAYOUT_WIDE';
  let n = 0;
  const warn = [];
  const api = { pres, IMG, RED, NAVY };

  function chrome(s, section) {
    n++;
    s.background = { color: 'FFFFFF' };
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 6.199, h: 0.85, fill: { color: RED }, line: { color: RED } });
    s.addText(formLabel.startsWith('!') ? formLabel.slice(1) : 'GEOGRAPHY — ' + formLabel, { x: 0.3, y: 0, w: 5.9, h: 0.85, fontFace: 'Calibri', fontSize: 18, bold: true, color: 'FFFFFF', valign: 'middle', margin: 0, isTextBox: true });
    s.addShape(pres.shapes.CHEVRON, { x: 6.199, y: 0, w: 7.134, h: 0.85, fill: { color: NAVY }, line: { color: NAVY } });
    s.addText(section, { x: 6.7, y: 0, w: 6.3, h: 0.85, fontFace: 'Calibri', fontSize: 18, bold: true, color: 'FFFFFF', valign: 'middle', margin: 0, isTextBox: true });
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 7.161, w: 4.0, h: 0.34, fill: { color: NAVY }, line: { color: NAVY } });
    s.addText('2026 / 2027', { x: 0.15, y: 7.161, w: 3.7, h: 0.34, fontFace: 'Calibri', fontSize: 11, color: 'FFFFFF', valign: 'middle', margin: 0, isTextBox: true });
    s.addShape(pres.shapes.RECTANGLE, { x: 4.0, y: 7.161, w: 6.4, h: 0.34, fill: { color: GOLD }, line: { color: GOLD } });
    s.addText('DGCAST GAROUA — GEOGRAPHY DEPARTMENT', { x: 4.15, y: 7.161, w: 6.1, h: 0.34, fontFace: 'Calibri', fontSize: 11, color: 'FFFFFF', align: 'center', valign: 'middle', margin: 0, isTextBox: true });
    s.addShape(pres.shapes.RECTANGLE, { x: 10.4, y: 7.161, w: 2.933, h: 0.34, fill: { color: SLATE }, line: { color: SLATE } });
    s.addText('Mr KAMDEM E.   |   ' + n, { x: 10.5, y: 7.161, w: 2.75, h: 0.34, fontFace: 'Calibri', fontSize: 11, color: 'FFFFFF', align: 'right', valign: 'middle', margin: 0, isTextBox: true });
  }
  function title(s, t, o = {}) {
    s.addText(t, { x: 0.5, y: 0.98, w: 12.33, h: 0.85, fontFace: o.face || TNR, fontSize: o.size || 36, bold: true, color: RED, align: 'center', valign: 'middle', margin: 0, isTextBox: true });
  }
  // estimate height for overflow warnings
  function wrapCount(t, cpl) {
    let lines = 0;
    t.split('\n').forEach((p) => { let cur = 0, n = 1; p.split(' ').forEach((wd) => { const L = wd.length; if (cur && cur + 1 + L > cpl) { n++; cur = L; } else cur += (cur ? 1 : 0) + L; }); lines += n; });
    return lines;
  }
  function estimate(items, w, size) {
    let hgt = 0;
    items.forEach((it) => { const t = typeof it === 'string' ? it : it.text; const sz = (it.size || size); const bw = it.bullet ? w - 0.45 : w;
      const cpl = Math.floor((bw * 72) / (sz * 0.43)); hgt += wrapCount(t, cpl) * sz * 1.2 / 72 + 0.11; });
    return hgt;
  }
  function body(s, items, o = {}) {
    const size = o.size || 40, x = o.x || 0.5, y = o.y || 1.95, w = o.w || 12.33, h = o.h || 5.1;
    const runs = items.map((it, i) => { const q = typeof it === 'string' ? { text: it } : it;
      return { text: q.text, options: { bullet: q.bullet ? (q.bullet === 'num' ? { type: 'number' } : true) : false, bold: !!q.bold,
        color: q.color || BLACK, fontSize: q.size || size, breakLine: i < items.length - 1, paraSpaceAfter: 8 } }; });
    const est = estimate(items, w - (items.some((q) => q.bullet) ? 0.5 : 0), size);
    if (est > h + 0.05) warn.push(`slide ${n}: est ${est.toFixed(2)} > ${h}`);
    s.addText(runs, { x, y, w, h, fontFace: o.face || TNR, valign: 'top', lineSpacingMultiple: 1.0, margin: 0, isTextBox: true });
  }
  // split a list of paragraphs into chunks that fit the text box (never shrink the font)
  function chunks(items, o = {}, head) {
    const size = o.size || 40, w = (o.w || 12.33) - (items.some((q) => q.bullet) ? 0.5 : 0), h = o.h || 5.1;
    const fits = (arr) => estimate(arr, w, size) <= h + 0.05;
    const exp = [];
    items.forEach((it) => {
      const q = typeof it === 'string' ? { text: it } : it;
      if (fits((head ? [head] : []).concat([q]))) { exp.push(q); return; }
      const parts = q.text.match(/[^.!?]+[.!?]+(\s|$)|[^.!?]+$/g) || [q.text];
      parts.forEach((p) => exp.push(Object.assign({}, q, { text: p.trim() })));
    });
    const out = []; let cur = [];
    exp.forEach((q) => { const test = (head ? [head] : []).concat(cur, [q]); if (cur.length && !fits(test)) { out.push(cur); cur = [q]; } else cur.push(q); });
    if (cur.length) out.push(cur);
    return out;
  }
  function slide(section, t, items, o = {}, note) {
    const parts = o.noSplit ? [items] : chunks(items, o, o.head);
    let s;
    parts.forEach((p, i) => {
      s = pres.addSlide(); chrome(s, section);
      title(s, parts.length > 1 && i > 0 ? t + ' (continued)' : t, o.titleOpts || {});
      body(s, (o.head && i > 0 ? [o.head] : []).concat(p), o);
      if (note && i === parts.length - 1) s.addNotes(note);
    });
    return s;
  }
  function qa(section, qt, q, a, noteQ, noteA, at) {
    slide(section, qt, [q], {}, noteQ);
    slide(section, at || 'Answer', Array.isArray(a) ? a : [a], {}, noteA);
  }
  function fitImage(s, path, bx, by, bw, bh) {
    const [iw, ih] = sizeOf(path); const r = iw / ih;
    let w = bw, h = bw / r; if (h > bh) { h = bh; w = bh * r; }
    s.addImage({ path, x: bx + (bw - w) / 2, y: by + (bh - h) / 2, w, h });
  }
  // question on the left, image on the right
  function imageQ(section, t, q, img, note, split = 5.6) {
    let sp = split;
    while (estimate([q], sp - 0.7, 40) > 5.1 && sp < 7.6) sp += 0.4;
    if (estimate([q], sp - 0.7, 40) > 5.1) {
      slide(section, t, [q], {}, note);
      const s2 = pres.addSlide(); chrome(s2, section); title(s2, t); fitImage(s2, IMG + img, 0.5, 1.95, 12.33, 5.1); return s2;
    }
    const s = pres.addSlide(); chrome(s, section); title(s, t);
    body(s, [q], { w: sp - 0.7 });
    fitImage(s, IMG + img, sp, 1.95, 13.333 - sp - 0.4, 5.1);
    if (note) s.addNotes(note); return s;
  }
  // full-width image with a one-line instruction
  function imageFull(section, t, line, img, note) {
    const s = pres.addSlide(); chrome(s, section); title(s, t);
    body(s, [line], { h: 0.7 });
    fitImage(s, IMG + img, 0.5, 2.7, 12.33, 4.35);
    if (note) s.addNotes(note); return s;
  }
  const nt = (t, i) => (i ? t.replace(/\((\d+)\/(\d+)\)$/, (m, a, b) => `(${+a + i}/${b})`) : t);
  function sum(t, sub, items) {
    if (!sub) { const ps = chunks(items); let s0; ps.forEach((p, i) => { s0 = pres.addSlide(); chrome(s0, 'BOARD SUMMARY'); title(s0, nt(t, i)); body(s0, p); }); return s0; }
    const head = { text: sub, bold: true, color: RED };
    const parts = chunks(items, {}, head); let s;
    parts.forEach((p, i) => { s = pres.addSlide(); chrome(s, 'BOARD SUMMARY'); title(s, nt(t, i));
      body(s, [i > 0 ? { text: sub + ' (continued)', bold: true, color: RED } : head].concat(p)); });
    return s;
  }
  function sumImage(t, sub, sentence, img) {
    const arr = Array.isArray(sentence) ? sentence : [sentence];
    const items = [{ text: sub, bold: true, color: RED }].concat(arr);
    let w = 6.3;
    while (estimate(items, w, 40) > 5.1 && w < 8.3) w += 0.5;
    if (estimate(items, w, 40) > 5.1) {
      // text alone at full width, then the illustration on its own slide
      const n0 = n; sum(t, sub, arr); const k = n - n0;
      const s2 = pres.addSlide(); chrome(s2, 'BOARD SUMMARY'); title(s2, nt(t, k)); fitImage(s2, IMG + img, 0.5, 1.95, 12.33, 5.1); return s2;
    }
    const s = pres.addSlide(); chrome(s, 'BOARD SUMMARY'); title(s, t);
    body(s, items, { w });
    fitImage(s, IMG + img, w + 0.7, 1.95, 13.333 - w - 1.1, 5.1);
    return s;
  }
  function table(s, rows, colW, y, fs = 16) {
    const data = rows.map((r) => r.map((c, i) => ({ text: c, options: { fontFace: 'Calibri', fontSize: fs, color: i === 0 ? 'FFFFFF' : BLACK, bold: i === 0, fill: { color: i === 0 ? NAVY : 'FFFFFF' }, valign: 'middle' } })));
    s.addTable(data, { x: 0.5, y, w: colW.reduce((a, b) => a + b, 0), colW, border: { type: 'solid', pt: 1, color: 'BBBBBB' }, margin: 0.08 });
  }
  function cover(label, lessonTitle, note) {
    const s = pres.addSlide(); n++;
    s.background = { color: 'FFFFFF' };
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 13.333, h: 0.22, fill: { color: RED }, line: { color: RED } });
    s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 7.28, w: 13.333, h: 0.22, fill: { color: NAVY }, line: { color: NAVY } });
    s.addImage({ path: '/home/claude/pw1/logo.png', x: 5.916, y: 0.5, w: 1.5, h: 1.5 });
    s.addText('DIVINE GRACE COLLEGE OF ARTS, SCIENCE AND TECHNOLOGY', { x: 0.8, y: 2.15, w: 11.73, h: 0.7, fontFace: 'Cambria', fontSize: 20, bold: true, color: NAVY, align: 'center', valign: 'middle', margin: 0, isTextBox: true });
    s.addText('(DGCAST) — GAROUA   |   GEOGRAPHY DEPARTMENT', { x: 1.0, y: 2.85, w: 11.33, h: 0.45, fontFace: 'Calibri', fontSize: 15, color: '1A1A1A', align: 'center', valign: 'middle', margin: 0, isTextBox: true });
    s.addText(label, { x: 1.0, y: 3.5, w: 11.33, h: 0.75, fontFace: 'Cambria', fontSize: 34, bold: true, color: RED, align: 'center', valign: 'middle', margin: 0, isTextBox: true });
    s.addText(lessonTitle, { x: 1.0, y: 4.3, w: 11.33, h: 0.6, fontFace: 'Calibri', fontSize: 21, bold: true, color: GOLD, align: 'center', valign: 'middle', margin: 0, isTextBox: true });
    s.addText([{ text: 'Mr KAMDEM EMMANUEL', options: { bold: true, breakLine: true } }, { text: 'Geography Teacher — PLEG', options: { breakLine: true } }, { text: 'Academic Year 2026 / 2027' }],
      { x: 1.0, y: 5.9, w: 11.33, h: 1.0, fontFace: 'Calibri', fontSize: 16, color: '1A1A1A', align: 'center', valign: 'middle', margin: 0, isTextBox: true });
    if (note) s.addNotes(note);
  }
  function intro(d) {
    cover(d.label, d.title, d.coverNote);
    let s = pres.addSlide(); chrome(s, 'CLASS INFO'); title(s, 'Class, Chapter & Duration', { face: 'Cambria', size: 30 });
    table(s, [['Class', d.cls], ['Chapter', d.chapter], ['Duration', d.duration]], [2.6, 9.73], 1.95, 20);
    s = pres.addSlide(); chrome(s, 'IDENTIFICATION'); title(s, 'Lesson Identification', { face: 'Cambria', size: 30 });
    table(s, [['Topic', d.topic], ['Sub-topic', d.subtopic], ['Lesson', d.lesson], ['Notions / Concepts', d.notions], ['Syllabus focus', d.focus], ['Competence', d.competence]], [2.6, 9.73], 1.95, 16);
    slide('OBJECTIVES', 'Learning Objectives', [{ text: 'By the end of the lesson, the learner should be able to:', bold: true }].concat(d.objectives.map((o) => ({ text: o, bullet: 'num' }))),
      { face: 'Calibri', size: 22, titleOpts: { face: 'Cambria', size: 30 } });
    slide('RECALL', 'Recall', d.recall.map((r) => ({ text: r, bullet: true })), { face: 'Calibri', size: 24, titleOpts: { face: 'Cambria', size: 30 } }, d.recallNote);
    // real-life situation (may be split across slides)
    d.situation.forEach((p, i) => slide('REAL-LIFE SITUATION', d.situation.length > 1 ? `Real-Life Situation (${i + 1}/${d.situation.length})` : 'Real-Life Situation', [p], {}, 'Read the situation slowly, twice.'));
    d.sitQA.forEach(([q, a], i) => { slide('REAL-LIFE SITUATION', `Situation — Question ${i + 1}`, [q]); slide('REAL-LIFE SITUATION', i === 2 ? 'Possible Answer' : 'Answer', [a]); });
    slide('JUSTIFICATION', 'Justification of the Lesson', [d.justification]);
  }
  function closing(d) {
    const s = pres.addSlide(); chrome(s, 'BOARD SUMMARY'); title(s, d.sumTitle || d.title);
    body(s, [{ text: 'Topic: ' + d.topic, bold: true }, { text: 'Sub-topic: ' + d.subtopic, bold: true }, { text: d.lesson, bold: true, color: RED }], { size: 32 });
    s.addNotes('Learners copy the board summary now. Give them enough time for each slide.');
  }
  function ending(d) {
    d.evaluation.forEach(([q, a], i) => { slide('FORMATIVE EVALUATION', `Formative Evaluation ${i + 1}`, [q]); slide('FORMATIVE EVALUATION', 'Expected Answer', [a]); });
    d.remediation.forEach((grp, i) => slide('REMEDIATION', (d.remediation.length > 1 ? `Remediation (${i + 1}/${d.remediation.length})` : 'Remediation'), [{ text: 'Fill in the blanks:', bold: true }].concat(grp.map((g) => ({ text: g, bullet: 'num' }))), { size: 36 }, i === d.remediation.length - 1 ? 'Answers: ' + d.remediationAnswers : undefined));
    slide('HOMEWORK', 'Homework', [d.homework, { text: d.homeworkTag, bold: true, color: RED }], {}, 'This homework prepares the next lesson.');
    let s = pres.addSlide(); chrome(s, 'BILINGUAL GAME'); title(s, 'Bilingual Game (Jeu Bilingue)', { face: 'Cambria', size: 30 });
    const rows = [['English', 'Français']].concat(d.bilingual);
    s.addTable(rows.map((r, i) => r.map((c) => ({ text: c, options: { fontFace: 'Calibri', fontSize: 18, bold: i === 0, color: i === 0 ? 'FFFFFF' : BLACK, fill: { color: i === 0 ? RED : (i % 2 ? 'FFFFFF' : 'F2F4F8') }, align: 'center' } }))),
      { x: 2.2, y: 1.95, w: 8.9, colW: [4.45, 4.45], border: { type: 'solid', pt: 1, color: 'BBBBBB' }, margin: 0.06 });
    s.addNotes('Say the English word; learners give the French word, then the reverse.');
    s = pres.addSlide(); chrome(s, 'LOGBOOK'); title(s, 'Official Logbook (1/2)', { face: 'Cambria', size: 30 });
    table(s, [['Module / Topic', d.topic], ['Lesson Title', d.lesson], ['Expected Learning Outcomes', d.objectives.join(' ')], ['Competence', d.competence]], [3.2, 9.13], 1.95, 15);
    s = pres.addSlide(); chrome(s, 'LOGBOOK'); title(s, 'Official Logbook (2/2)', { face: 'Cambria', size: 30 });
    table(s, [['Matter Taught', d.matter], ['Evaluation', 'Formative evaluation (3 questions) and remediation exercise.'], ['Homework', d.homework], ['Enrolment / Present / Absent', '____ / ____ / ____'], ['Achievement', 'To be completed by the teacher after the lesson.']], [3.2, 9.13], 1.95, 15);
    slide('TEACHER\'S NOTE', "Teacher's Note", d.teacherNote, { face: 'Calibri', size: 20, titleOpts: { face: 'Cambria', size: 30 } });
    slide('REFERENCES', 'References', d.references, { face: 'Calibri', size: 18, titleOpts: { face: 'Cambria', size: 30 } });
  }
  Object.assign(api, { chunks, estimate, chrome, title, body, slide, qa, imageQ, imageFull, sum, sumImage, table, cover, intro, closing, ending, fitImage,
    count: () => n, warnings: () => warn });
  return api;
}
module.exports = { make };
