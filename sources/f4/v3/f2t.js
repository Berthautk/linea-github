// v3 patches — Form 2 Technical (first cycle: one sentence per point), merged from parts
const fs = require('fs');
module.exports = Object.assign({}, ...[1, 2, 3, 4, 5].map((i) => (fs.existsSync(`${__dirname}/f2t_${i}.js`) ? require(`./f2t_${i}`) : {})));
