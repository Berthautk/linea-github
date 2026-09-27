// v3 first cycle, lessons written natively in the v3 format (Forms 1, 2, 4 and 5 of the 2023 national syllabus)
// node build3_new.js F1|F2|F4|F5 [filters...]
const fs = require('fs');
const { run, seqNative } = require('./sixth3');
const lvl = process.argv[2];
const files = fs.readdirSync(__dirname + '/v3n').filter((f) => f.startsWith(lvl.toLowerCase() + '_') && f.endsWith('.js')).sort();
const seq = [].concat(...files.map((f) => seqNative('./v3n/' + f)));
run(seq, process.argv.slice(3).length ? process.argv.slice(3) : null);
