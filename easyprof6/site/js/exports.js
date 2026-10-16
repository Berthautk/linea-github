// Exports : Word (la fiche telle qu'à l'écran) et CSV (toutes les saisies, pour Excel).
async function dataUri(url) {
  try { const b = await (await fetch(url)).blob(); return await new Promise((ok, ko) => { const r = new FileReader(); r.onload = () => ok(r.result); r.onerror = ko; r.readAsDataURL(b); }); } catch { return url; }
}
function download(blob, name) {
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}

/** Word ne comprend ni flexbox ni grid : les blocs posés côte à côte deviennent un tableau sans bordure, et la mise en forme calculée (alignement, gras, taille, majuscules) est recopiée sur chaque élément. */
function wordify(orig, clone) {
  const cs = getComputedStyle(orig), st = clone.style;
  if (cs.display !== 'none') {
    st.textAlign = cs.textAlign; if (+cs.fontWeight >= 600) st.fontWeight = 'bold';
    const px = parseFloat(cs.fontSize); if (px) st.fontSize = Math.max(6, Math.round(px * 0.75 * 10) / 10) + 'pt';
    if (cs.textTransform !== 'none') st.textTransform = cs.textTransform;
    if (cs.whiteSpace.startsWith('pre')) st.whiteSpace = cs.whiteSpace;
  }
  const oc = [...orig.children], cc = [...clone.children];
  oc.forEach((o, i) => cc[i] && wordify(o, cc[i]));
  if (/flex|grid/.test(cs.display) && oc.length > 1 && !/^(TABLE|TBODY|THEAD|TR|TD|TH)$/.test(orig.tagName) && cs.flexDirection !== 'column') {
    const doc = clone.ownerDocument, tb = doc.createElement('table'), tr = doc.createElement('tr');
    tb.setAttribute('width', '100%'); tb.style.cssText = 'border-collapse:collapse;width:100%;border:none';
    for (const k of [...clone.childNodes]) {
      if (k.nodeType === 3 && !k.textContent.trim()) continue;
      const td = doc.createElement('td'); td.style.cssText = 'border:none;vertical-align:top;padding:2pt 4pt;width:' + Math.floor(100 / oc.length) + '%;text-align:' + (k.style ? k.style.textAlign || 'left' : 'left'); td.appendChild(k); tr.appendChild(td);
    }
    tb.appendChild(tr); clone.replaceChildren(tb);
  }
}
export async function exportWord(el, name, landscape = true) {
  const clone = el.cloneNode(true);
  clone.style.zoom = ''; clone.style.transform = '';
  wordify(el, clone);
  for (const img of clone.querySelectorAll('img')) img.setAttribute('src', await dataUri(img.getAttribute('src')));
  for (const n of clone.querySelectorAll('.noprint')) n.remove();
  const size = landscape ? 'size:841.9pt 595.3pt;mso-page-orientation:landscape;margin:36pt' : 'size:595.3pt 841.9pt;margin:42pt';
  const css = `@page Section1{${size}} div.Section1{page:Section1} body{font-family:Calibri,Arial,sans-serif;font-size:9pt;color:#000}
    table{border-collapse:collapse;width:100%} th,td{border:1px solid #000;padding:2pt 3pt;text-align:center;vertical-align:middle;font-size:8pt} th{background:#F3ECDD}
    td.l{text-align:left} h2{text-align:center;font-size:13pt;text-transform:uppercase;margin:8pt 0 2pt}
    .hd{width:100%;text-align:center;font-size:8pt} .sig div{display:inline-block;width:30%;border:1px dashed #666;min-height:60pt;vertical-align:top;margin-right:2%}`;
  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"><title>${String(name).replace(/[<>&"]/g, '')}</title><style>${css}</style></head><body><div class="Section1">${clone.innerHTML}</div></body></html>`;
  download(new Blob(['﻿', html], { type: 'application/msword' }), name + '.doc');
}

const q = (v) => { const s = String(v == null ? '' : v); return /[";\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
export function exportCSV(rows, name) {
  download(new Blob(['﻿', rows.map(r => r.map(q).join(';')).join('\r\n')], { type: 'text/csv;charset=utf-8' }), name + '.csv');
}
