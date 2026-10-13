// Conversion d'une sauvegarde de l'ancienne version d'EasyProf (JSON) vers le nouveau modèle.
const TYPE = { theorique: 'lesson', pratique: 'practical', contact: 'orientation' };
const cap = (s) => s.toLowerCase().replace(/(^|\s)\S/g, (m) => m.toUpperCase());

export function isOldBackup(j) { return !!(j && (j._easyprofBackup || (j.teachers && j.classes && j.entries && j.establishment))); }
export function isNewBackup(j) { return !!(j && (j.format === 'rekort' || j.format === 'easyprof6') && j.data); }

/** Lit la sauvegarde sans rien modifier : résumé pour l'écran de confirmation. */
export function summarize(j) {
  return { name: (j.establishment || {}).name || '', discipline: j.discipline || '', teachers: (j.teachers || []).map(t => ({ id: t.id, name: t.name, isAP: !!t.isAP, phone: t.phone || '' })),
    classes: (j.classes || []).length, entries: (j.entries || []).length, year: (j.establishment || {}).schoolYear || '' };
}

/** Construit les nouvelles données ; `idFor(oldTeacherId)` donne l'identifiant du collègue dans la nouvelle application. */
export function convert(j, idFor, now = Date.now()) {
  const est = j.establishment || {}, hdr = est.header || {};
  const m = /\bDU\s+(.+)$/i.exec(hdr.regionFR || '') || /^(.*?)\s+REGION$/i.exec(hdr.regionEN || '');
  const dept = { name: est.name || '', discipline: j.discipline || '', abbr: j.disciplineAbbr || '', system: est.system === 'francophone' ? 'francophone' : 'anglophone', header: { region: m ? cap(m[1].trim()) : '', division: est.division ? cap(est.division) : '', email: hdr.emailFR || '', address: '' } };
  const classes = [], assign = [];
  for (const c of j.classes || []) {
    classes.push({ id: c.id, name: c.name, level: c.level || '', cycle: c.cycle === '2nd' ? '2nd' : '1er', effectif: { total: +(c.enrollment || {}).total || 0, girls: +(c.enrollment || {}).girls || 0, boys: +(c.enrollment || {}).boys || 0 }, u: now });
    const th = +c.lessonsPlannedTheory || +c.lessonsPlannedYear || 0, pr = +c.lessonsPlannedPractical || 0, hours = +c.hoursPlannedYear || 0;
    const ids = (c.teacherIds || []).map(idFor).filter(Boolean); const n = ids.length || 1;
    ids.forEach((tid, i) => assign.push({ id: tid + ':' + c.id, teacherId: tid, classId: c.id, th: Math.floor(th / n) + (i === 0 ? th % n : 0), pr: Math.floor(pr / n) + (i === 0 ? pr % n : 0), hours: Math.floor(hours / n) + (i === 0 ? hours % n : 0), u: now }));
  }
  const slots = {}; const tt = ((j.reportObservations || {}).__inspection || {}).tt || {};
  for (const [oid, list] of Object.entries(tt)) { const nid = idFor(oid); if (nid) slots[nid] = list.map(s => ({ d: +s.d, c: s.c, h: +s.h, tm: s.tm || '', st: '' })); }
  const entries = [];
  for (const e of j.entries || []) {
    const tid = idFor(e.teacherId); if (!tid) continue;
    entries.push({ id: e.id, teacherId: tid, type: TYPE[e.type] || 'lesson', classId: e.classId || '', date: (e.timestamp || '').slice(0, 10), start: e.startTime || '', end: e.endTime || '', minutes: +e.durationMinutes || 0,
      n: e.lessonNumber == null ? null : +e.lessonNumber, title: e.title || '', digital: !!e.isDigitized, eval: e.evaluation ? { evaluated: +e.evaluation.evaluatedCount || 0, passed: +e.evaluation.passedCount || 0 } : null, reason: '', note: '', term: e.termId || '', u: now });
  }
  return { dept, classes, assign, slots, entries };
}
