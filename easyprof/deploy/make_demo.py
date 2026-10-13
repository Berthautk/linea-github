#!/usr/bin/env python3
"""Fabrique une version de DÉMONSTRATION d'EasyProf (sans aucune connexion à votre Firebase, données anonymisées).
Usage: python3 make_demo.py ../EasyProf-5.html <sauvegarde.json> OUT.html
- configuration Firebase factice + écritures Firestore coupées + faux utilisateur connecté
- noms, téléphones, e-mails et PIN retirés ; PIN de démo 1234
Le fichier produit ne doit servir qu'à essayer l'interface."""
import sys, re, json, hashlib
src, backup, out = sys.argv[1:4]
s = open(src, encoding='utf-8').read()
d = json.load(open(backup, encoding='utf-8'))

def sub(s, old, new):
    assert s.count(old) == 1, (old[:60], s.count(old))
    return s.replace(old, new)

# 1. isolement total du vrai Firebase
s = re.sub(r'(apiKey|authDomain|projectId|storageBucket|messagingSenderId|appId):"[^"]*"', lambda m: m.group(1) + ':"demo-easyprof"', s)
s = sub(s, 'async function sU(n,e){try{', 'async function sU(n,e){return;try{')
s = sub(s, 'const kt=UV(Cs,bt=>{f(bt);',
        'const kt=(setTimeout(()=>{f({email:"demo@example.com",uid:"u-demo"});u(!1)},0),()=>{});const _unused=UV(Cs,bt=>{if(!0)return;f(bt);')

# 2. état de démonstration anonymisé (trimestres officiels 2026-2027)
def h(p): return 'h1$' + hashlib.sha256(('easyprof:' + p).encode()).hexdigest()
names = {'KAMDEM': ('Mr. PROFESSEUR Alpha', 'ALPHA'), 'ASTHA': ('Mme PROFESSEUR Bravo', 'BRAVO'), 'NEBASIBI': ('Mr. PROFESSEUR Charlie', 'CHARLIE'), 'TSOGO2026': ('Mme PROFESSEUR Delta', 'DELTA')}
teachers = []
for t in d['teachers']:
    n = names.get(t['id'], ('Enseignant ' + t['id'], t['id'][:6]))
    teachers.append({'id': t['id'], 'name': n[0], 'shortName': n[1], 'isAP': t.get('isAP', False), 'phone': '', 'pin': '1234' if t['id'] == 'NEBASIBI' else h('1234'),
                     'teachingDays': t.get('teachingDays', []), 'isFirstLogin': False})
teachers = [dict(t) for t in teachers]
for t in teachers:
    if t['id'] == 'KAMDEM': t['teachingDays'] = [1, 2, 6]; t['dayTerms'] = {'6': ['T1']}
    if t['id'] == 'TSOGO2026': t['teachingDays'] = [3, 4, 5]
T = {'T1': ('2026-09-07', '2026-11-27'), 'T2': ('2026-11-30', '2027-03-05'), 'T3': ('2027-03-08', '2027-06-11')}
terms = [dict(t, startDate=T[t['id']][0], endDate=T[t['id']][1]) for t in d['terms']]
est = dict(d['establishment'], schoolYear='2026/2027')
state = {'discipline': d['discipline'], 'disciplineAbbr': d['disciplineAbbr'], 'establishment': est, 'teachers': teachers, 'classes': d['classes'],
         'entries': d['entries'], 'terms': terms, 'syllabus': d.get('syllabus', {}), 'allowedEmails': [], 'reportObservations': {}, 'meetingMinutes': [],
         'logs': [], 'activeLanguage': 'fr', 'activeSpace': 'AP', 'isDarkMode': False,
         'currentUser': next(t for t in teachers if t['id'] == 'KAMDEM')}
s = sub(s, 'function m7(n){var e;', 'function m7(n){n=window.__DEMO||n;var e;')
banner = ('<script>window.__DEMO=' + json.dumps(state, ensure_ascii=False).replace('</', '<\\/') + ';'
          'window.addEventListener("DOMContentLoaded",function(){var b=document.createElement("div");b.textContent="DÉMO · données fictives · rien n\'est enregistré en ligne · PIN de démo : 1234";'
          'b.style.cssText="position:fixed;left:50%;bottom:8px;transform:translateX(-50%);z-index:99999;background:#17413F;color:#fff;font:600 11px system-ui;padding:6px 12px;border-radius:999px;opacity:.92;pointer-events:none;white-space:nowrap";document.body.appendChild(b)});</script>')
s = sub(s, '<title>EasyProf — Suivi Pédagogique</title>', '<title>EasyProf Démo</title>' + banner)

# 3. le gabarit de publication fournit doctype/html/head/body
for pat in (r'<!DOCTYPE html>', r'</?html[^>]*>', r'</?head>', r'</?body[^>]*>'):
    s = re.sub(pat, '', s, flags=re.I)
open(out, 'w', encoding='utf-8').write(s)
print('démo ->', out, len(s))
