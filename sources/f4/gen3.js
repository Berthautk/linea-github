// v3 lesson builder (teacher's model, Sept 2026)
// - slide master holds header (class, lesson) and footer (year, MINESEC copyright, school, teacher): edit once in
//   View > Slide Master and every slide changes; the slide number sits in the top-left box of the master
// - MINESEC "Education à distance" sheet on the left of text slides; its width shrinks when the text is long,
//   and it is left out on picture, diagram and table slides
// - Times New Roman: titles 36 pt, text 40 pt; board summary: "1. Section" / "A) Sub-point" / announcing sentence /
//   one item per line "Term: These are ..." (term in bold)
// - speaker notes on every slide, written as the teacher speaking to the class (first person, full sentences)
// - steps: cover, class info, identification, homework correction, lesson plan, objectives, recall, situation (+3 Q/A),
//   action to take, justification, 5 activities (image, question, answer), board summary, evaluation, remediation,
//   homework, next lesson, bilingual game, logbook, teacher's note, references
const pptxgen = require('pptxgenjs');
const fs = require('fs');
const IMG2 = '/home/claude/f4/img/v2/', IMG1 = '/home/claude/f4/img/';
const SHEET = '/home/claude/f4/img/minesec_sheet.png';
const RED = '990011', NAVY = '1C3F6E', GOLD = 'B8860B', SLATE = '36454F', BLACK = '111111', GREY = '555555';
const TNR = 'Times New Roman';
const W = 13.333, HDR = 0.72, FTY = 7.1;

function imgPath(p) { return fs.existsSync(IMG2 + p) ? IMG2 + p : IMG1 + p; }
function sizeOf(p) {
  const b = fs.readFileSync(p);
  if (b[0] === 0x89) return [b.readUInt32BE(16), b.readUInt32BE(20)];
  if (b.toString('ascii', 0, 3) === 'GIF') return [b.readUInt16LE(6), b.readUInt16LE(8)];
  let i = 2; while (i < b.length) { const m = b[i + 1], L = b.readUInt16BE(i + 2); if (m >= 0xC0 && m <= 0xC3) return [b.readUInt16BE(i + 7), b.readUInt16BE(i + 5)]; i += 2 + L; }
}
const dot = (t) => { t = String(t || '').trim(); return /[.!?:]$/.test(t) ? t : t + '.'; };
const lc1 = (t) => t.charAt(0).toLowerCase() + t.slice(1);
const plainOf = (it) => (it.runs ? it.runs.map((r) => r.t).join('') : it.text);

// spec (from the runners): header label, cls, level, school, lessonLabel, file, outdir, + lesson content (see sixth.js)
function build(sp) {
  const pres = new pptxgen(); pres.layout = 'LAYOUT_WIDE';
  const warn = []; let n = 0;
  const school = sp.school, klass = sp.clsHeader;
  // ---------- masters ----------
  const footer = [
    { rect: { x: 0, y: FTY, w: 3.0, h: 0.4, fill: { color: NAVY }, line: { color: NAVY } } },
    { text: { text: 'Date: 2026 / 2027', options: { x: 0.15, y: FTY, w: 2.8, h: 0.4, fontFace: 'Calibri', fontSize: 13, color: 'FFFFFF', valign: 'middle', margin: 0 } } },
    { rect: { x: 3.0, y: FTY, w: 6.6, h: 0.4, fill: { color: GOLD }, line: { color: GOLD } } },
    { text: { text: `Copyright MINESEC  —  HOD – ${school}`, options: { x: 3.1, y: FTY, w: 6.4, h: 0.4, fontFace: 'Calibri', fontSize: 13, bold: true, color: 'FFFFFF', align: 'center', valign: 'middle', margin: 0 } } },
    { rect: { x: 9.6, y: FTY, w: 3.733, h: 0.4, fill: { color: SLATE }, line: { color: SLATE } } },
    { text: { text: 'Mr KAMDEM E.  —  Geography', options: { x: 9.7, y: FTY, w: 3.5, h: 0.4, fontFace: 'Calibri', fontSize: 13, color: 'FFFFFF', align: 'right', valign: 'middle', margin: 0 } } },
  ];
  pres.defineSlideMaster({
    title: 'LESSON', background: { color: 'FFFFFF' },
    objects: [
      { rect: { x: 0, y: 0, w: 0.7, h: HDR, fill: { color: RED }, line: { color: RED } } },
      { text: { text: 'GEOGRAPHY / ' + klass, options: { shape: pres.shapes.PENTAGON, x: 0.7, y: 0, w: 5.2, h: HDR, fill: { color: RED }, line: { color: RED }, fontFace: 'Calibri', fontSize: 18, bold: true, color: 'FFFFFF', align: 'center', valign: 'middle', margin: 0 } } },
      { text: { text: sp.lessonLabel.toUpperCase(), options: { shape: pres.shapes.CHEVRON, x: 5.7, y: 0, w: 7.633, h: HDR, fill: { color: NAVY }, line: { color: NAVY }, fontFace: 'Calibri', fontSize: sp.lessonLabel.length > 60 ? 12 : sp.lessonLabel.length > 45 ? 14 : 16, bold: true, color: 'FFFFFF', align: 'center', valign: 'middle', margin: 0 } } },
    ].concat(footer),
    slideNumber: { x: 0.03, y: 0.1, w: 0.64, h: 0.52, fontFace: 'Calibri', fontSize: 20, bold: true, color: 'FFFFFF', align: 'center' },
  });
  pres.defineSlideMaster({
    title: 'COVER', background: { color: 'FFFFFF' },
    objects: [
      { image: { x: 0, y: 0, w: 6.44, h: 7.1, path: SHEET } },
      { text: { text: 'MINESEC', options: { x: 6.7, y: 0.55, w: 6.3, h: 0.9, fontFace: TNR, fontSize: 44, bold: true, color: '1565C0', align: 'center', valign: 'middle', margin: 0 } } },
      { text: { text: school + '  —  GEOGRAPHY DEPARTMENT', options: { x: 6.7, y: 1.45, w: 6.3, h: 0.5, fontFace: 'Calibri', fontSize: 18, bold: true, color: NAVY, align: 'center', valign: 'middle', margin: 0 } } },
      { text: { text: 'KAMDEM Emmanuel Berthaut\nGeography Teacher', options: { x: 6.7, y: 5.75, w: 6.3, h: 1.0, fontFace: TNR, fontSize: 20, bold: true, color: BLACK, align: 'center', valign: 'middle', margin: 0 } } },
    ].concat(footer),
  });

  // ---------- helpers ----------
  const add = (master = 'LESSON') => { n++; return pres.addSlide({ masterName: master }); };
  function section(s, t) { if (t) s.addText(t, { x: 0.5, y: HDR + 0.06, w: W - 0.9, h: 0.3, fontFace: 'Calibri', fontSize: 14, bold: true, color: NAVY, align: 'right', valign: 'middle', margin: 0 }); }
  function note(s, t) { if (t) s.addNotes(Array.isArray(t) ? t.filter(Boolean).join(' ') : t); }
  const lines = (t, cpl) => { let L = 0; String(t).split('\n').forEach((p) => { let c = 0, k = 1; p.split(' ').forEach((w) => { if (c && c + 1 + w.length > cpl) { k++; c = w.length; } else c += (c ? 1 : 0) + w.length; }); L += k; }); return L; };
  const hOf = (items, w, size) => items.reduce((h, it) => { const sz = it.size || size; const bw = it.bullet ? w - 0.5 : w; return h + lines(plainOf(it), Math.floor(bw * 72 / (sz * 0.45))) * sz * 1.2 / 72 + 0.12; }, 0);
  // emblem tiers: [sheet width, text x]; the text area is x .. W-0.35
  const TIERS = [[5.6, 5.85], [4.2, 4.45], [2.7, 2.95], [1.6, 1.85]];
  const BY = 1.95, BH = FTY - 0.08 - BY;
  function place(items, size, sub) {
    const avail = BH - (sub ? 0.5 : 0);
    for (const [ew, x] of TIERS) { const w = W - 0.35 - x; if (hOf(items, w, size) <= avail) return { ew, x, w }; }
    return null;
  }
  function paginate(items, size, sub) {
    const [ew, x] = TIERS[TIERS.length - 1]; const w = W - 0.35 - x; const avail = BH - (sub ? 0.5 : 0);
    const exp = [];
    items.forEach((it) => {           // a paragraph too long for one slide is split at sentence ends
      if (hOf([it], w, size) <= avail) { exp.push(it); return; }
      if (it.runs) {                  // "Term: text" too long: split the text at sentence ends, the term stays on the first part
        const lead = it.runs.length > 1 ? it.runs[0] : null; const body = it.runs[it.runs.length - 1];
        const sents = body.t.match(/[^.!?]+[.!?]+(\s|$)|[^.!?]+$/g) || [body.t]; let cur = [];
        const mk = (arr, first) => ({ runs: (first && lead ? [lead] : []).concat([Object.assign({}, body, { t: arr.join('').trim() })]) });
        let first = true;
        sents.forEach((x) => { if (cur.length && hOf([mk(cur.concat([x]), first)], w, size) > avail) { exp.push(mk(cur, first)); first = false; cur = [x]; } else cur.push(x); });
        if (cur.length) exp.push(mk(cur, first));
        return;
      }
      (it.text.match(/[^.!?]+[.!?]+(\s|$)|[^.!?]+$/g) || [it.text]).forEach((p) => exp.push(Object.assign({}, it, { text: p.trim() })));
    });
    const pages = []; let cur = [];
    exp.forEach((it) => {
      if (cur.length && hOf(cur.concat([it]), w, size) > avail) {
        // never leave an announcing sentence (intro) alone at the bottom of a page: carry it to the next page
        const last = cur[cur.length - 1]; const carry = last && last.intro ? [cur.pop()] : [];
        if (cur.length) pages.push(cur); cur = carry.concat([it]);
      } else cur.push(it);
    });
    if (cur.length) pages.push(cur);
    // a page still too full (announcing sentence carried with a long item): move the last sentences of its last item on
    for (let p = 0; p < pages.length; p++) {
      const pg = pages[p]; const last = pg[pg.length - 1];
      if (pg.length < 2 || hOf(pg, w, size) <= avail || !last.runs) continue;
      const lead = last.runs.length > 1 ? last.runs[0] : null; const body = last.runs[last.runs.length - 1];
      const sents = body.t.match(/[^.!?]+[.!?]+(\s|$)|[^.!?]+$/g) || [body.t];
      let k = sents.length - 1;
      const part = (a, b, withLead) => ({ runs: (withLead && lead ? [lead] : []).concat([Object.assign({}, body, { t: sents.slice(a, b).join('').trim() })]) });
      while (k > 0 && hOf(pg.slice(0, -1).concat([part(0, k, true)]), w, size) > avail) k--;
      if (k === 0) { pages.splice(p + 1, 0, [pg.pop()]); continue; }
      pg[pg.length - 1] = part(0, k, true);
      const rest = part(k, sents.length, false);
      if (pages[p + 1] && hOf([rest].concat(pages[p + 1]), w, size) <= avail) pages[p + 1].unshift(rest); else pages.splice(p + 1, 0, [rest]);
    }
    return pages;
  }
  function runsOf(items, size) {
    const out = [];
    items.forEach((it, k) => {
      const rs = it.runs || [{ t: it.text, b: it.bold, i: it.italic, c: it.color }];
      rs.forEach((r, j) => out.push({ text: r.t, options: { bold: !!r.b, italic: !!r.i, color: r.c || BLACK, fontSize: it.size || size,
        bullet: it.bullet ? (it.bullet === 'num' ? { type: 'number' } : true) : false, breakLine: j === rs.length - 1 && k < items.length - 1, paraSpaceAfter: 8 } }));
    });
    return out;
  }
  // text slide(s) with the MINESEC sheet; returns the slides
  function tslide(sec, title, items, o = {}) {
    const size = o.size || 40; items = items.map((it) => (typeof it === 'string' ? { text: it } : it));
    const pages = place(items, size, o.sub) ? [items] : paginate(items, size, o.sub);
    const out = [];
    pages.forEach((pg, i) => {
      const pl = place(pg, size, o.sub) || { ew: TIERS[3][0], x: TIERS[3][1], w: W - 0.35 - TIERS[3][1] };
      const s = add(); section(s, sec);
      s.addImage({ path: SHEET, x: 0, y: HDR, w: pl.ew, h: FTY - HDR });
      const t = pages.length > 1 && i > 0 && !o.sub ? title + ' (continued)' : title;
      s.addText(t, { x: pl.x, y: 1.1, w: pl.w, h: 0.8, fontFace: o.titleFace || TNR, fontSize: 36, bold: true, color: RED, align: 'center', valign: 'middle', margin: 0, fit: 'shrink' });
      let y = BY;
      if (o.sub) { const st = o.sub + (i > 0 ? ' (continued)' : ''); const ss = Math.min(32, Math.floor(pl.w * 72 / (st.length * 0.5))); s.addText(st, { x: pl.x, y: BY - 0.05, w: pl.w, h: 0.5, fontFace: TNR, fontSize: ss, bold: true, color: RED, align: 'left', valign: 'middle', margin: 0 }); y += 0.5; }
      const est = hOf(pg, pl.w, size); if (est > FTY - 0.05 - y + 0.05) warn.push(`slide ${n}: ${title} est ${est.toFixed(2)}`);
      s.addText(runsOf(pg, size), { x: pl.x, y, w: pl.w, h: FTY - 0.05 - y, fontFace: o.face || TNR, valign: o.valign || 'top', align: o.align || 'left', margin: 0 });
      note(s, typeof o.note === 'function' ? o.note(i, pages.length, pg) : (i === pages.length - 1 || o.noteAll ? o.note : o.noteCont || 'Take your time to copy this part; we will continue together.'));
      out.push(s);
    });
    return out;
  }
  function picture(sec, title, img, caption, nt) {
    const s = add(); section(s, sec);
    s.addText(title, { x: 0.5, y: 1.1, w: W - 1, h: 0.8, fontFace: TNR, fontSize: 36, bold: true, color: RED, align: 'center', valign: 'middle', margin: 0 });
    const p = imgPath(img); const [iw, ih] = sizeOf(p); const bw = W - 0.6, bh = (caption ? 6.62 : 7.0) - 1.95;
    let w = bw, h = bw * ih / iw; if (h > bh) { h = bh; w = bh * iw / ih; }
    s.addImage({ path: p, x: 0.3 + (bw - w) / 2, y: 1.95 + (bh - h) / 2, w, h });
    if (caption) s.addText(caption, { x: 0.5, y: 6.66, w: W - 1, h: 0.38, fontFace: TNR, fontSize: 18, italic: true, color: GREY, align: 'center', valign: 'middle', margin: 0 });
    note(s, nt); return s;
  }
  function table(sec, title, rows, colW, fs, nt, head) {
    const s = add(); section(s, sec);
    s.addText(title, { x: 0.5, y: 1.1, w: W - 1, h: 0.8, fontFace: TNR, fontSize: 36, bold: true, color: RED, align: 'center', valign: 'middle', margin: 0 });
    const data = rows.map((r, ri) => r.map((c, i) => ({ text: c, options: { fontFace: 'Calibri', fontSize: fs, bold: head ? ri === 0 : i === 0, color: (head ? ri === 0 : i === 0) ? 'FFFFFF' : BLACK,
      fill: { color: (head ? ri === 0 : i === 0) ? (head ? RED : NAVY) : (ri % 2 ? 'FFFFFF' : 'F2F4F8') }, valign: 'middle', align: head ? 'center' : 'left' } })));
    const tw = colW.reduce((a, b) => a + b, 0);
    s.addTable(data, { x: (W - tw) / 2, y: 1.95, w: tw, colW, border: { type: 'solid', pt: 1, color: 'BBBBBB' }, margin: 0.08 });
    note(s, nt); return s;
  }

  // ---------- 1. cover and identification ----------
  const lessonName = sp.lesson;
  const cov = add('COVER');
  cov.addText([{ text: sp.cls.toUpperCase(), options: { breakLine: true } }, { text: 'GEOGRAPHY' }], { x: 6.7, y: 2.15, w: 6.3, h: 1.1, fontFace: TNR, fontSize: 26, bold: true, color: BLACK, align: 'center', valign: 'middle', margin: 0 });
  cov.addText([{ text: sp.lessonLabel, options: { breakLine: true, fontSize: 26, color: BLACK } }, { text: sp.title, options: { fontSize: 32, color: RED } }], { x: 6.7, y: 3.35, w: 6.3, h: 2.3, fontFace: TNR, bold: true, align: 'center', valign: 'middle', margin: 0, fit: 'shrink' });
  note(cov, `Good morning, class, and welcome to our geography lesson. I am your geography teacher, Mr Kamdem. Today we are starting ${lessonName}.`);
  table('CLASS INFO', 'Class, Chapter and Duration', [['Class', sp.cls], ['Chapter', sp.chapter], ['Duration', sp.duration]], [2.6, 9.73], 22,
    `This lesson is for ${sp.cls}. It belongs to ${dot(sp.chapter)} We shall need ${sp.duration.replace(/\s*\(.*\)/, '')} to cover it.`);
  table('IDENTIFICATION', 'Lesson Identification', [['Topic', sp.topic], ['Sub-topic', sp.subtopic], ['Lesson', lessonName], ['Notions / Concepts', sp.notions], ['Syllabus focus', sp.focus], ['Competence', sp.competence]], [2.6, 9.73], 17,
    `Our topic is ${sp.topic}, and the sub-topic is ${sp.subtopic}. The key notions we shall use today are: ${lc1(dot(sp.notions))} At the end, you should be able to do this: ${lc1(dot(sp.competence))}`);

  // ---------- 2. homework correction and lesson plan ----------
  if (sp.prevHomework) {
    const ph = sp.prevHomework;
    tslide('HOMEWORK CORRECTION', 'Correction of the Homework', [{ text: 'Question (' + ph.lesson + '):', bold: true, color: NAVY }, ph.q],
      { note: `Before we start the new lesson, let us correct the homework I gave you at the end of ${ph.lesson}. The question was: ${dot(ph.q)} Take out your exercise books.` });
    tslide('HOMEWORK CORRECTION', 'Correction: Possible Answer', [ph.a],
      { note: `Here is a good answer. ${dot(ph.a)} Compare it with your own answer and correct your work in red.` });
  }
  const plan = ['Correction of the homework', 'Objectives and recall', 'Real-life situation and action to take', 'Learning activities', 'Board summary', 'Evaluation, remediation and homework'];
  if (!sp.prevHomework) plan.shift();
  tslide('LESSON PLAN', 'Lesson Plan', plan.map((t) => ({ text: t, bullet: 'num' })),
    { note: `Here is the plan of our lesson today. ${sp.prevHomework ? 'First, we shall correct the homework. Then we' : 'First, we'} shall look at the objectives and recall what you already know. After that, we shall study a situation from real life and the action to take, and do the learning activities. Finally, we shall copy the board summary, do the evaluation and the remediation, and I will give you the homework.` });

  // ---------- 3. objectives, recall, situation ----------
  tslide('OBJECTIVES', 'Objectives', [{ text: 'By the end of this lesson, you should be able to:', bold: true }].concat(sp.objectives.map((o) => ({ text: o, bullet: 'num' }))),
    { note: `By the end of this lesson, you should be able to do three things. ${sp.objectives.map((o, i) => `Number ${i + 1}: ${lc1(dot(o))}`).join(' ')}` });
  tslide('PREVIOUS KNOWLEDGE', 'Previous Knowledge', sp.recall.map((r) => ({ text: r, bullet: true })),
    { note: `Let us first remember what you already know. ${sp.recall.map(dot).join(' ')} Keep this in mind, because we shall build on it today.` });
  const sit = Array.isArray(sp.situation) ? sp.situation.join(' ') : sp.situation;
  tslide('REAL-LIFE SITUATION', 'Situation in Real Life', [sit], { note: `Listen carefully to this situation from real life. ${sit} Think about it, because I am going to ask you some questions.` });
  sp.sitQA.forEach(([q, a], i) => {
    tslide('REAL-LIFE SITUATION', `Situation: Question ${i + 1}`, [q], { note: `Question ${i + 1}: ${q} Think for a moment, then raise your hand to answer.` });
    tslide('REAL-LIFE SITUATION', i === 2 ? 'Possible Answer' : 'Answer', [a], { note: `Good. ${dot(a)}` });
  });
  if (sp.action) tslide('ACTION TO TAKE', 'Action to Take', [sp.action], { note: `From this situation, the action we are working towards in this lesson is the following: ${lc1(dot(sp.action))}` });
  tslide('JUSTIFICATION', 'Justification of the Lesson', [sp.justification], { note: `Why is this lesson important for you? ${dot(sp.justification)}` });

  // ---------- 4. activities ----------
  const kindOf = (img) => (img.endsWith('.gif') ? 'animation' : /_big\.png$/.test(img) ? 'diagram' : 'picture');
  sp.activities.forEach((a, i) => {
    const t = a.title || `Activity ${i + 1}`;
    if (a.img) {
      const k = kindOf(a.img);
      picture(a.sec, t, a.img, a.caption, `Activity ${i + 1}. Look carefully at this ${k}${a.caption ? ': ' + lc1(a.caption.replace(/\.$/, '')) : ''}.` + (k === 'animation' ? ' Watch the animation to the end; it will play again.' : ' Observe every detail before I ask the question.'));
    }
    tslide(a.sec, t + ': Question', [a.q], { note: `Here is the question for Activity ${i + 1}: ${a.q} Take one minute to think and write your answer in your rough notebook.` });
    tslide(a.sec, t + ': Answer', [a.a], { note: `Let us check the answer together. ${dot(a.a)}` });
  });

  // ---------- 5. board summary ----------
  tslide('BOARD SUMMARY', 'Board Summary', [{ text: 'Topic: ' + sp.topic, bold: true }, { text: 'Sub-topic: ' + sp.subtopic, bold: true }, { text: lessonName, bold: true, color: RED }],
    { note: 'Now we are going to copy the board summary. Write the title and the headings neatly in your notebooks. I will give you enough time for each slide, so do not rush.' });
  sp.summary.forEach((part) => {
    const items = [];
    if (part.intro) items.push({ runs: [{ t: part.intro, i: true }], intro: true });
    (part.items || []).forEach(([lead, text]) => items.push({ runs: [{ t: lead + ' ', b: true }, { t: String(text).replace(/ %/g, ' %') }] }));
    const head = part.sub || part.title;
    tslide('BOARD SUMMARY', part.title, items, {
      sub: part.sub,
      note: (i, N, pg) => {
        const terms = pg.filter((x) => x.runs && x.runs.length > 1).map((x) => x.runs[0].t.trim().replace(/:$/, ''));
        const h = /^DEFINITIONS/.test(head) ? 'the definitions' : head.replace(/^[0-9IVX]+\.\s*|^[A-Z]\)\s*/, '');
        return (i === 0 ? `Let us copy ${h}. ${part.intro ? part.intro.replace(/:$/, '.') + ' ' : ''}` : `We continue with ${h}. `)
          + (terms.length ? `On this slide we have ${terms.length > 1 ? terms.slice(0, -1).join(', ') + ' and ' + terms[terms.length - 1] : terms[0]}. Write each point on a new line, with the key term first, and explain it in your own words when we revise.` : 'Copy this carefully.')
          + (i === N - 1 ? '' : ' When you finish, we go to the next slide.');
      },
    });
    if (part.draw) {
      const s = picture('BOARD SUMMARY', part.title, part.draw.img, 'Illustration: ' + (part.draw.caption || '').replace(/\.$/, ''),
        `Now draw this illustration in your notebook: ${lc1((part.draw.caption || 'the diagram').replace(/\.$/, ''))}. Give it a title and label it clearly.`);
    }
  });

  // ---------- 6. evaluation, remediation, homework, next lesson ----------
  sp.evaluation.forEach(([q, a], i) => {
    tslide('FORMATIVE EVALUATION', `Evaluation ${i + 1}`, [q], { note: `Now let us check what you have understood. Question ${i + 1}: ${q} Answer in your exercise book.` });
    tslide('FORMATIVE EVALUATION', 'Expected Answer', [a], { note: `The expected answer is: ${lc1(dot(a))} If you got it right, well done.` });
  });
  tslide('REMEDIATION', 'Remediation', [{ text: 'Fill in the blanks:', bold: true }].concat(sp.remediation.map((g) => ({ text: g, bullet: 'num' }))),
    { note: `For those who need more practice, fill in the blanks in your exercise book. The answers are: ${sp.remediationAnswers.replace(/\s*(\d)\.\s*/g, (m, d) => (d === '1' ? '' : '; ') + 'number ' + d + ', ')}.` });
  tslide('HOMEWORK', 'Homework', [sp.homework], { note: `For your homework: ${dot(sp.homework)} We shall correct it at the beginning of our next lesson.` });
  if (sp.nextLesson) tslide('NEXT LESSON', 'Next Lesson', [{ text: 'Our next lesson will be on:', bold: true }, { text: sp.nextLesson, color: RED, bold: true }],
    { align: 'center', valign: 'middle', note: `Our next lesson will be on ${sp.nextLesson}. Thank you for your attention, and see you next time.` });

  // ---------- 7. bilingual game, logbook, teacher's note, references ----------
  table('BILINGUAL GAME', 'Bilingual Game (Jeu Bilingue)', [['English', 'Français']].concat(sp.bilingual), [4.8, 4.8], 22,
    'Let us play the bilingual game. I say a word in English, and you give me the French word. Then we do the reverse.', true);
  const matter = sp.summary.map((p) => (p.sub ? p.sub.replace(/^[A-Z]\)\s*/, '') : p.title.replace(/^[0-9IVX]+\.\s*/, ''))).filter((v, i, a) => a.indexOf(v) === i).join('; ') + '.';
  table('LOGBOOK', 'Official Logbook (1/2)', [['Module / Topic', sp.topic], ['Lesson Title', lessonName], ['Expected Learning Outcomes', sp.objectives.join(' ')], ['Competence', sp.competence]], [3.3, 9.03], 16,
    'I record this information in the official logbook of the class after the lesson.');
  table('LOGBOOK', 'Official Logbook (2/2)', [['Matter Taught', matter], ['Evaluation', 'Formative evaluation and remediation exercise.'], ['Homework', sp.homework], ['Enrolment / Present / Absent', '____ / ____ / ____'], ['Achievement', 'To be completed after the lesson.']], [3.3, 9.03], 16,
    'I complete the second page of the logbook: the matter taught, the evaluation, the homework and the attendance.');
  const tn = (sp.timing ? ['Timing: ' + sp.timing.join(' | ')] : []).concat(sp.teacherNote || [], sp.activities.filter((a) => a.noProj).map((a, i) => `Without the projector (${a.title || 'Activity ' + (sp.activities.indexOf(a) + 1)}): ${a.noProj}`));
  tslide("TEACHER'S NOTE", "Teacher's Note", tn.map((t) => ({ text: t, bullet: true })), { size: 20, face: 'Calibri', note: 'This slide is for me, the teacher: it gives the timing of the lesson and what to do if the projector is not available.' });
  tslide('REFERENCES', 'References', sp.references.map((t) => ({ text: t, bullet: true })), { size: 18, face: 'Calibri', note: 'These are the references and picture credits used to prepare this lesson.' });

  fs.mkdirSync(sp.outdir, { recursive: true });
  return pres.writeFile({ fileName: sp.outdir + sp.file + '.pptx' }).then(() => console.log(sp.file, n, 'slides', warn));
}
module.exports = { build, sizeOf, imgPath };
