const fs = require('fs');
function stmt(name) {
  const s = fs.readFileSync('database.sql', 'utf8');
  const k = 'INSERT INTO `' + name + '`';
  const i = s.indexOf(k);
  if (i < 0) return null;
  let j = s.indexOf(';', i);
  return s.slice(i, j);
}
for (const t of ['pricing_modules','industry_presets','configurator_settings','coupons','packages','gateway_settings','users','companies']) {
  const st = stmt(t);
  fs.writeFileSync('c:/temp/' + t + '.sql', st || 'NOTFOUND', 'utf8');
  console.log(t, (st||'').length);
}
