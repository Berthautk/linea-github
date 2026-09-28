// Rebuild Lower Sixth Arts in the v3 format, in the order of the 2019 syllabus (Climatology, Hydrology, Geomorphology, Biogeography)
const { run, seqOf, arrange, overlay } = require('./sixth3');
const L = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => 'Lesson ' + (a + i));
const seq = [].concat(
  // syllabus: FS1 (tropical disturbances) comes after Lesson 19; FS2 and FS3 after Lesson 21
  arrange(seqOf('./v2_lsa_clim', './v3/lsa_clim'), [...L(1, 19), 'Further Study 1', 'Lesson 20', 'Lesson 21', 'Further Study 2', 'Further Study 3']),
  // syllabus: PW1 and PW2 come before FS4 (drainage of Cameroon)
  arrange(seqOf('./v2_lsa_hydro', './v3/lsa_hydro'), [...L(22, 34), 'Practical Work 1', 'Practical Work 2', 'Further Study 4']),
  overlay(seqOf('./v2_lsa_geo', './v3/lsa_geo'), 'lsageo'),
  seqOf('./v2_lsa_bio1', './v3/lsa_bio_a'), seqOf('./v2_lsa_bio2', './v3/lsa_bio_b'));
run(seq, process.argv.slice(2).length ? process.argv.slice(2) : null);
