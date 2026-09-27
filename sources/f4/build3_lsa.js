// Rebuild Lower Sixth Arts in the v3 format (teaching order: Climatology, Hydrology, Geomorphology, Biogeography)
const { run, seqOf } = require('./sixth3');
const seq = [].concat(
  seqOf('./v2_lsa_clim', './v3/lsa_clim'), seqOf('./v2_lsa_hydro', './v3/lsa_hydro'), seqOf('./v2_lsa_geo', './v3/lsa_geo'),
  seqOf('./v2_lsa_bio1', './v3/lsa_bio_a'), seqOf('./v2_lsa_bio2', './v3/lsa_bio_b'));
run(seq, process.argv.slice(2).length ? process.argv.slice(2) : null);
