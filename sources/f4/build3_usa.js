// Rebuild Upper Sixth Arts in the v3 format, in the order of the 2019 syllabus (Modules 4 to 8)
const fs = require('fs');
const { run, seqOf, arrange, key } = require('./sixth3');
// lessons rewritten natively from the teacher's supports (v3n/<prefix>_*.js) replace the old v2+v3 entries with the same key
const overlay = (seq, prefix) => {
  const N = [].concat(...fs.readdirSync(__dirname + '/v3n').filter((f) => f.startsWith(prefix + '_')).sort().map((f) => { const S = require('./v3n/' + f); return S.L.map((l) => ({ L: l, B: S.B, P: l })); }));
  const X = fs.existsSync(__dirname + '/v3n/' + prefix + '.js') ? require('./v3n/' + prefix) : {};   // small overrides for kept lessons (homework...)
  return seq.map((e) => N.find((n) => key(n.L) === key(e.L)) || (X[key(e.L)] ? { L: Object.assign({}, e.L, X[key(e.L)]), B: e.B, P: Object.assign({}, e.P, X[key(e.L)]) } : e));
};
const L = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => 'Lesson ' + (a + i));
const seq = [].concat(
  overlay(seqOf('./v2_usa_pop', './v3/usa_pop'), 'usapop'), seqOf('./v2_usa_set', './v3/usa_set'),
  // syllabus: FS2 (forests) comes after Lesson 13, just before FS3 and FS4
  arrange([].concat(seqOf('./v2_usa_eco1', './v3/usa_eco1'), seqOf('./v2_usa_eco2', './v3/usa_eco2'), seqOf('./v2_usa_eco3', './v3/usa_eco3')),
    [...L(1, 6), 'Practical Work 1', ...L(7, 10), 'Further Study 1', 'Lesson 11', 'Lesson 13', 'Further Study 2', 'Further Study 3', 'Further Study 4',
      ...L(14, 19), 'Practical Work 2', ...L(20, 23), 'Practical Work 3', ...L(24, 26), 'Further Study 5', 'Lesson 27', 'Practical Work 4',
      'Lesson 28', 'Lesson 29', 'Practical Work 5', 'Lesson 30', 'Further Study 6', 'Lesson 31', 'Further Study 7']),
  seqOf('./v2_usa_env1', './v3/usa_env'), seqOf('./v2_usa_env2', './v3/usa_env'),
  seqOf('./v2_usa_prac1', './v3/usa_prac'), seqOf('./v2_usa_prac2', './v3/usa_prac'));
run(seq, process.argv.slice(2).length ? process.argv.slice(2) : null);
