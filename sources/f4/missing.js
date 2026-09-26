const fs = require('fs');
for (const f of process.argv.slice(2)) { const L = require('./' + f);
  for (const s of L) { const miss = s.activities.map((a) => a.img).concat(s.summary.filter((p) => p.draw).map((p) => p.draw.img)).filter((i) => !fs.existsSync('img/v2/' + i) && !fs.existsSync('img/' + i)); if (miss.length) console.log(s.src.slice(0, 26), miss.join(' ')); } }
