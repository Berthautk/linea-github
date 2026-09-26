// Capture every old lesson (meta + text) into old/<file>.json without writing pptx.
const fs = require('fs'); const path = require('path');
fs.mkdirSync('old', { recursive: true });
const lib = require('./lib');
let cur = null; const done = [];
const realMake = lib.make;
lib.make = (h) => { const L = realMake(h); cur = { header: h, text: [] };
  const wrap = (k, f) => (...a) => { if (k === 'intro') cur.d = a[0]; if (k === 'ending') Object.assign(cur, { end: a[0] });
    if (['slide', 'imageQ', 'imageFull', 'sum', 'sumImage'].includes(k)) cur.text.push(k + ' | ' + a.filter((x) => typeof x === 'string' || Array.isArray(x)).map((x) => JSON.stringify(x)).join(' | '));
    return f(...a); };
  ['intro', 'ending', 'slide', 'imageQ', 'imageFull', 'sum', 'sumImage'].forEach((k) => { L[k] = wrap(k, L[k]); });
  L.pres.writeFile = ({ fileName }) => { const f = path.basename(fileName, '.pptx'); cur.file = f; fs.writeFileSync('old/' + f + '.json', JSON.stringify(cur, null, 1)); done.push(f); return Promise.resolve(); };
  return L; };
// gen-based files call L.slide etc via intro(); patch build of gens to also save sp
for (const g of ['./f2t_gen', './f4_gen']) { const G = require(g); const rb = G.build; G.build = (sp) => rb(sp).then(() => { const j = JSON.parse(fs.readFileSync('old/' + sp.file + '.json')); j.sp = sp; fs.writeFileSync('old/' + sp.file + '.json', JSON.stringify(j, null, 1)); }); }
const files = ['f2t_l1_problems', 'f2t_l2_climate', 'f2t_L2', 'f2t_L3', 'f2t_L4', 'f2t_L5', 'f2t_L6', 'f4_A', 'f4_B', 'f4_C', 'f4_D', 'f4_E', 'f4_F', 'f4_G', 'l27', 'l28', 'l29'];
(async () => { for (const f of files) { const m = require('./' + f); const arr = Array.isArray(m) ? m : (m && m.S); if (arr) for (const s of arr) await require(f.startsWith('f2t') ? './f2t_gen' : './f4_gen').build(s); await new Promise((r) => setTimeout(r, 200)); }
  console.log(done.length, done.join(' ')); })();
