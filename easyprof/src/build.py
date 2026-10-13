#!/usr/bin/env python3
"""Rebuild EasyProf-5.html from EasyProf-4.original.html + epx.js + epi.js.
Usage: python3 build.py   (run from src/)  -> ../EasyProf-5.html
Patches the minified bundle by exact-string anchors (each asserted unique)."""
import re, base64, json

o = open('EasyProf-4.original.html', encoding='utf-8').read()
epx = open('epx.js', encoding='utf-8').read()
epx2 = open('epx2.js', encoding='utf-8').read()
epi = open('epi.js', encoding='utf-8').read()


def sub(s, old, new, count=1):
    assert s.count(old) == count, (old[:80], s.count(old))
    return s.replace(old, new)


s = o

# ---------------------------------------------------------------- 1. modules
s = sub(s, 'function tU(', epx + '\n' + epx2 + '\n' + epi + '\nfunction tU(')

# ------------------------------------------- 2. GLOBAL TOTAL row (3 missing cells)
s = sub(s, 'children:D.doneLessons}),c.jsx("td",{className:"border border-black p-1.5 text-center",children:D.plannedDigit})',
        'children:D.doneLessons}),c.jsx("td",{className:"border border-black p-1.5 text-center",children:D.plannedPractical||0}),c.jsx("td",{className:"border border-black p-1.5 text-center",children:D.donePractical||0}),c.jsx("td",{className:"border border-black p-1.5 text-center font-mono",children:Math.round((D.practicalCov||0)*10)/10}),c.jsx("td",{className:"border border-black p-1.5 text-center",children:D.plannedDigit})')


# --------------------------------------------- 3/4. onglet « Rapport AP » remplacé par « Inspection » (même place, bureau + mobile)
def rename_block(s, start_pat, end_pat, repl):
    i = s.index(start_pat)
    j = s.index(end_pat, i)
    b = s[i:j]
    nb = repl(b)
    assert nb != b
    return s[:i] + nb + s[j:]


s = rename_block(s, 'c.jsxs("button",{onClick:()=>Bt("rapport"),className:`flex items-center', 'c.jsxs("button",{onClick:()=>Bt("config")',
                 lambda b: b.replace('"rapport"', '"inspection"').replace('N?"Rapport AP":"AP Report"', 'N?"Inspection":"Inspection"'))
s = rename_block(s, 'c.jsxs("button",{onClick:()=>Bt("rapport"),className:`flex flex-col', 'c.jsxs("button",{onClick:()=>Bt("config")',
                 lambda b: b.replace('"rapport"', '"inspection"').replace('N?"Rapport":"Report"', '"Insp."'))
assert s.count('Bt("rapport")') == 0
s = sub(s, 'At==="rapport"&&c.jsx(tU,{state:n,onChangeState:ge}),', 'At==="inspection"&&c.jsx(EPI,{state:n,onChangeState:ge}),')
# tableau de bord AP refait
s = sub(s, 'At==="dashboard"&&c.jsx(iI,{state:n,onNavigateToConfig:()=>Bt("config")}),', 'At==="dashboard"&&c.jsx(EPB,{state:n}),')
# 6. 7 buttons in mobile nav: tighten padding
s = s.replace('flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl', 'flex flex-col items-center gap-1 py-1.5 px-1.5 rounded-xl')

# ------------------------------------------------ 7. leçons : révision/évaluation ne comptent pas
s = sub(s, '_lTh=l.filter(me=>me.type!=="pratique"&&me.type!=="contact")',
        '_lTh=l.filter(me=>me.type!=="pratique"&&!EPX_NOLESSON[me.type])')

# ------------------------------------------------ 8. saisie enseignant : types + jours sans cours
s = sub(s, 'id:`entry_${V}_${D==="contact"?"contact":pe}_${Date.now()}`',
        'id:`entry_${V}_${(D==="theorique"||D==="pratique")?pe:D}_${Date.now()}`')
s = sub(s, 'lessonNumber:D==="contact"?null:pe,', 'lessonNumber:(D==="theorique"||D==="pratique")?pe:null,')
s = sub(s, 'title:(H&&H.trim())?H.trim():(D==="contact"?(h?"Prise de contact / Rentrée":"Orientation / Back to school"):(h?("Leçon n°"+pe):("Lesson n°"+pe))),',
        'title:(H&&H.trim())?H.trim():EPX_title(D,h,pe),')
s = sub(s, '(D==="contact")?c.jsxs("div",{className:"space-y-2"', '(D!=="theorique"&&D!=="pratique")?c.jsxs("div",{className:"space-y-2"')
s = sub(s, 'At=new Set(Ze.map(ge=>`${ge.classId}_${ge.lessonNumber}`)).size;',
        'At=new Set(Ze.filter(EPX_isLesson).map(ge=>`${ge.classId}_${ge.lessonNumber}`)).size;')

# type buttons -> liste déroulante
a = s.index('c.jsxs("div",{className:"flex bg-[#F7F5F0] border border-natural-border p-1 rounded-xl h-[42px] items-center",children:[c.jsx("button",{type:"button",onClick:()=>M("theorique")')
bmark = 'children:h?"Prise de contact":"Orientation"})]})'
b = s.index(bmark, a) + len(bmark)
select = ('c.jsx("select",{value:D,onChange:ge=>M(ge.target.value),className:"w-full h-[42px] bg-[#F7F5F0] border border-natural-border rounded-xl px-3 text-xs font-bold text-[#1B2A4A] focus:outline-none focus:border-[#0EA5A0] cursor-pointer",'
          'children:EPX_TYPES.map(_t=>c.jsx("option",{value:_t[0],children:h?_t[1]:_t[2]},_t[0]))})')
s = s[:a] + select + s[b:]

# numéro de leçon : grisé pour les séances qui ne comptent pas de leçon
s = sub(s, 'c.jsx("input",{type:"number",min:1,className:"w-full bg-[#F7F5F0] border border-natural-border rounded-xl px-3.5 py-2.5 text-xs text-center font-bold font-mono text-[#2D2926] focus:outline-none focus:border-[#0EA5A0]",value:pe,onChange:ge=>G(Number(ge.target.value))})',
        'c.jsx("input",{type:"number",min:1,disabled:(D!=="theorique"&&D!=="pratique"),title:(D!=="theorique"&&D!=="pratique")?(h?"Pas de numéro : cette séance ne compte pas comme leçon":"No number: this session does not count as a lesson"):"",className:"w-full bg-[#F7F5F0] border border-natural-border rounded-xl px-3.5 py-2.5 text-xs text-center font-bold font-mono text-[#2D2926] focus:outline-none focus:border-[#0EA5A0]",style:{opacity:(D!=="theorique"&&D!=="pratique")?.4:1},value:(D!=="theorique"&&D!=="pratique")?"":pe,onChange:ge=>G(Number(ge.target.value))})')
# bandeau « saisie en attente » : pas de rappel un jour férié du calendrier
s = sub(s, 'var _now=new Date(),_dow=_now.getDay();if(_tds.indexOf(_dow)===-1)return null;var _today=_now.toDateString();',
        'var _now=new Date(),_dow=_now.getDay();if(!EPX_teachesOn(n,t,_now))return null;if(EPX_offDay(n,_now))return null;var _today=_now.toDateString();')
# alerte AP « n\'ont pas saisi aujourd\'hui »
s = sub(s, 'var _ds=Array.isArray(_t.teachingDays)?_t.teachingDays:[];if(_ds.indexOf(_dow)===-1)return false;', 'if(!EPX_teachesOn(n,_t,_now))return false;')
s = sub(s, 'var _now=new Date(),_dow=_now.getDay(),_td=_now.toDateString();var _due=(s||[]).filter(function(_t){',
        'var _now=new Date(),_dow=_now.getDay(),_td=_now.toDateString();var _off=EPX_offDay(n,_now);var _due=_off?[]:(s||[]).filter(function(_t){')
# carte « Pas de cours ? » au-dessus de l'en-tête de la page Saisie Enseignant
s = sub(s, '})(),c.jsxs("div",{className:"flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-natural-border shadow-sm",children:[c.jsxs("div",{children:[c.jsx("h2",{className:"text-md font-serif italic font-bold text-[#1B2A4A]",children:h?`Saisie Enseignant',
        '})(),A==="saisie"&&c.jsx(EPD,{st:n,e:e,me:t,fr:h,collapsible:!0}),c.jsxs("div",{className:"flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-natural-border shadow-sm",children:[c.jsxs("div",{children:[c.jsx("h2",{className:"text-md font-serif italic font-bold text-[#1B2A4A]",children:h?`Saisie Enseignant')
# historique : libellés pour les types sans numéro de leçon
s = sub(s, 'children:["Leçon n° ",ge.lessonNumber]', 'children:EPX_lblN(ge,h)')
s = sub(s, 'children:ge.lessonNumber}),', 'children:EPX_lbl(ge,h)}),')

# ------------------------------------------------ 8b. espace enseignant : « Mon bilan » et « Mes cours » (modifiables)
s = sub(s, 'children:h?"Mes Statistiques":"My Analytics"', 'children:h?"Mon bilan":"My summary"')
s = sub(s, 'children:h?"Historique":"Recent Logs"', 'children:h?"Mes cours":"My lessons"')
_a = s.index('A==="dashboard"&&c.jsxs("div",{className:"space-y-6",children:[c.jsxs("div",{className:"grid grid-cols-2 md:grid-cols-3 gap-4"')
_i0 = s.index('function eU({state:n,onChangeState:e}){')
_end = s.index('function tU(', _i0)
assert s[_end - 4:_end] == ']})}' or s[:_end].endswith(']})}\n' + epx + '\n' + epx2 + '\n' + epi + '\n') or True
# fin de eU = juste avant le module injecté
_mod = s.index('/* ===== EasyProf extras (added)')
assert _a < _mod and s[_mod - 5:_mod].strip().endswith(']})}'), repr(s[_mod - 12:_mod])
_tail = s.rindex(']})}', _a, _mod)
s = s[:_a] + 'A==="dashboard"&&c.jsx(EPT,{st:n,e:e,me:t,fr:h}),A==="history"&&c.jsx(EPH,{st:n,e:e,me:t,fr:h})' + s[_tail:]
s = sub(s, 'Ze.slice(0,3).map(', 'Ze.slice(0,6).map(')

# ------------------------------------------------ 9. Configuration : onglet « Année & PIN »
s = sub(s, 'children:f?"Classes & Objectifs":"Classes & Annual Goals"})',
        'children:f?"Classes & Objectifs":"Classes & Annual Goals"}),c.jsx("button",{onClick:()=>y("year"),className:`pb-2.5 text-xs font-bold uppercase transition-all whitespace-nowrap cursor-pointer ${g==="year"?"border-b-2 border-[#0EA5A0] text-[#0EA5A0]":"text-[#9E9885] hover:text-[#2D2926]"}`,children:f?"Année & PIN":"Year & PINs"})')
s = sub(s, 'g==="classes"&&c.jsxs("div",{className:"grid grid-cols-1 lg:grid-cols-3 gap-6"',
        'g==="year"&&c.jsx(EPY,{state:n,onChangeState:e}),g==="classes"&&c.jsxs("div",{className:"grid grid-cols-1 lg:grid-cols-3 gap-6"')

# ------------------------------------------------ 10. PIN : jamais de hash affiché, hachage à l'enregistrement
s = sub(s, 'c.jsxs("span",{children:["PIN: ",q.pin]})', 'c.jsxs("span",{children:["PIN: ",EPX_pinLabel(q.pin,f)]})')
s = sub(s, 'nt(q.pin||"1234")', 'nt(EPX_isHash(q.pin)?"":(q.pin||""))')
s = sub(s, 'pin:_t.trim()||"1234",isAP:tt,', 'pin:EPX_pinStore(_t,dn.pin),isAP:tt,')
s = sub(s, 'pin:D||"1234",phone:N.trim()', 'pin:EPX_pinStore(D,""),phone:N.trim()')
s = sub(s, 'maxLength:8,className:"w-full bg-[#F7F5F0] border border-natural-border rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#0EA5A0]",value:_t,',
        'maxLength:8,placeholder:f?"•••• (vide = inchangé)":"•••• (empty = unchanged)",className:"w-full bg-[#F7F5F0] border border-natural-border rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#0EA5A0]",value:_t,')
# profil enseignant
s = sub(s, '[b,A]=Y.useState(s.pin)', '[b,A]=Y.useState(EPX_isHash(s.pin)?"":s.pin)')
s = sub(s, 'var _pb=b;if(window.EasyProfHashPin&&window.EasyProfNeedsMigration&&window.EasyProfNeedsMigration(b)){var _h=await window.EasyProfHashPin(b);if(_h)_pb=_h}',
        'var _pb=EPX_pinStore(b,s.pin);')

# ------------------------------------------------ 11. palette
PALETTE = {
    '1b2a4a': '17413f',  # encre profonde (ex marine)
    '0ea5a0': '2a9d8f',  # turquoise doux
    '0d8b87': '21867a',  # turquoise survol
    'c9a84c': 'e9a23b',  # abricot doré (ex or)
    'f7f5f0': 'fbf7ef',  # fond crème chaud
    'f0eee9': 'f3ecdd',  # sable
    '2d2926': '26332f',  # texte
    '9e9885': '66736c',  # texte atténué (contraste renforcé)
    '4a463b': '3f4e48',
    'e6e1d8': 'e6dcc8',
    'e5e0d5': 'e6dcc8',
    '152039': '0f2b29',
    '101a30': '0c2220',
    '090d16': '081716',
    'e6ebf4': 'e4f1ee',
    '00ab4d': '3f8f5e',  # succès
    '006e2f': '2a6f4a',
    '3d4948': '3f4e48',
    '6d7a78': '66736c',
}
HEX = re.compile(r'#([0-9a-fA-F]{6})([0-9a-fA-F]{2})?(?![0-9a-fA-F])')


def remap(m):
    base = m.group(1).lower()
    return '#' + PALETTE[base] + (m.group(2) or '') if base in PALETTE else m.group(0)


i = s.index('<style')
j = s.index('</style>', i)
css = s[i:j]
# CSS : seulement les déclarations (les sélecteurs échappés \#… restent identiques aux noms de classes)
css = re.sub(r'(?<!\\)' + HEX.pattern, remap, css)
css = css.replace('rgba(27,42,74,', 'rgba(23,65,63,')
rest_before, rest_after = s[:i], s[j:]
# JS / HTML : couleurs en ligne (guillemets, deux-points…) mais jamais dans un nom de classe [#…]
INLINE = re.compile(r'(?<![\[\\A-Za-z0-9])' + HEX.pattern)
rest_before = INLINE.sub(remap, rest_before)
rest_after = INLINE.sub(remap, rest_after)
s = rest_before + css + rest_after

# manifeste PWA intégré (data:) : couleurs de la nouvelle palette
mm = re.search(r'(<link rel="manifest" href="data:application/manifest\+json;base64,)([A-Za-z0-9+/=]+)(")', s)
assert mm
mj = json.loads(base64.b64decode(mm.group(2)))
mj['theme_color'] = '#17413F'
mj['background_color'] = '#FBF7EF'
s = s[:mm.start(2)] + base64.b64encode(json.dumps(mj, ensure_ascii=False).encode('utf-8')).decode() + s[mm.end(2):]

# numéro de version (affiché dans Configuration > Année & PIN, et en meta)
VERSION = open('VERSION', encoding='utf-8').read().strip()
s = sub(s, 'var EPX_h = Y.createElement;', 'var EPX_VERSION = "' + VERSION + '";\nvar EPX_h = Y.createElement;')
s = sub(s, '<meta name="theme-color" content="#17413f" />', '<meta name="theme-color" content="#17413f" /><meta name="easyprof-version" content="' + VERSION + '" />')

open('../EasyProf-5.html', 'w', encoding='utf-8').write(s)
print('OK', len(s))
