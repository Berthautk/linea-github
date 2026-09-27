// Rebuild Upper Sixth Arts in the v3 format (teaching order: Modules 4 to 8)
const { run, seqOf } = require('./sixth3');
const seq = [].concat(
  seqOf('./v2_usa_pop', './v3/usa_pop'), seqOf('./v2_usa_set', './v3/usa_set'),
  seqOf('./v2_usa_eco1', './v3/usa_eco1'), seqOf('./v2_usa_eco2', './v3/usa_eco2'), seqOf('./v2_usa_eco3', './v3/usa_eco3'),
  seqOf('./v2_usa_env1', './v3/usa_env'), seqOf('./v2_usa_env2', './v3/usa_env'),
  seqOf('./v2_usa_prac1', './v3/usa_prac'), seqOf('./v2_usa_prac2', './v3/usa_prac'));
run(seq, process.argv.slice(2).length ? process.argv.slice(2) : null);
