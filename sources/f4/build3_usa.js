// Rebuild Upper Sixth Arts in the v3 format, in the order of the 2019 syllabus (Modules 4 to 8)
const { run, seqOf, arrange, overlay } = require('./sixth3');
const L = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => 'Lesson ' + (a + i));
const seq = [].concat(
  overlay(seqOf('./v2_usa_pop', './v3/usa_pop'), 'usapop'), seqOf('./v2_usa_set', './v3/usa_set'),
  // syllabus: FS2 (forests) comes after Lesson 13, just before FS3 and FS4
  arrange([].concat(seqOf('./v2_usa_eco1', './v3/usa_eco1'), seqOf('./v2_usa_eco2', './v3/usa_eco2'), seqOf('./v2_usa_eco3', './v3/usa_eco3')),
    [...L(1, 6), 'Practical Work 1', ...L(7, 10), 'Further Study 1', 'Lesson 11', 'Lesson 13', 'Further Study 2', 'Further Study 3', 'Further Study 4',
      ...L(14, 19), 'Practical Work 2', ...L(20, 23), 'Practical Work 3', ...L(24, 26), 'Further Study 5', 'Lesson 27', 'Practical Work 4',
      'Lesson 28', 'Lesson 29', 'Practical Work 5', 'Lesson 30', 'Further Study 6', 'Lesson 31', 'Further Study 7']),
  seqOf('./v2_usa_env1', './v3/usa_env'), seqOf('./v2_usa_env2', './v3/usa_env'),
  seqOf('./v2_usa_prac1', './v3/usa_prac'), overlay(seqOf('./v2_usa_prac2', './v3/usa_prac'), 'usaprac'));
// Further Studies on Cameroon are taught in the Geography of Cameroon sub-branch (build3_new.js LSACAM), not repeated here
const kept = seq.filter((e) => !/Cameroon/.test(e.L.title));
run(kept, process.argv.slice(2).length ? process.argv.slice(2) : null);
