// v3 first cycle: node build3_first.js F4|F2T [filters...]
const { run, seqFirst } = require('./sixth3');
const lvl = process.argv[2];
const seq = lvl === 'F4'
  ? seqFirst(['./v2_f4_1', './v2_f4_2', './v2_f4_3', './v2_f4_4', './v2_f4_5'], './v3/f4', 'F4')
  : seqFirst(['./v2_f2t_1', './v2_f2t_2', './v2_f2t_3', './v2_f2t_4', './v2_f2t_5'], './v3/f2t', 'F2T');
run(seq, process.argv.slice(3).length ? process.argv.slice(3) : null);
