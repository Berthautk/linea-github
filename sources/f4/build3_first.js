// v3 first cycle: node build3_first.js F4|F2T [filters...]
const { run, seqFirst } = require('./sixth3');
const lvl = process.argv[2];
const seq = lvl === 'F3'
  ? seqFirst(['./v2_f4_1', './v2_f4_2', './v2_f4_3', './v2_f4_4', './v2_f4_5'], './v3/f4', 'F3')
  : seqFirst(['./v2_f2t_0', './v2_f2t_1', './v2_f2t_2', './v2_f2t_3', './v2_f2t_4', './v2_f2t_5'], './v3/f2t', 'F2T');
const VP = require('./v3/f3_volcano_parts');
// Lesson 11 is taught in three short parts (Volcanoes, Extrusive Features, Intrusive Features)
const seq2 = [].concat(...seq.map((e) => {
  if (!(lvl === 'F3' && e.L.src === 'FORM4_LESSON11_Volcanoes')) return [e];
  const mk = (extra, withSrc) => { const L = Object.assign({}, e.L, extra); if (!withSrc) delete L.src; return { L, B: e.B, P: Object.assign({}, e.P, extra) }; };
  const no1 = { no: '11 (Part 1)', ...VP.part1 }, no2 = Object.assign({}, VP.part2), no3 = Object.assign({}, VP.part3);
  const e1 = mk(no1, false); e1.L.fileOverride = e.L.fileOverride;
  return [e1, mk(no2, false), mk(Object.assign({}, no3, { keepSrc: undefined }), true)];
}));
run(seq2, process.argv.slice(3).length ? process.argv.slice(3) : null);
