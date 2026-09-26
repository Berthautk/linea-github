#!/usr/bin/env python3
"""Wikimedia Commons helper: search candidates, download a photo into img/v2 and store its credit.
  wm.py s "query" [n]              -> list candidate files (title, size, licence, author)
  wm.py g "File:Title.jpg" out.jpg [crop]  -> download 1600px version, record credit in credits.json
"""
import json, sys, time, re, html, urllib.request, urllib.parse, os
UA = 'DGCAST-LessonBuilder/1.0 (educational slides)'
API = 'https://commons.wikimedia.org/w/api.php?'
OUT = '/home/claude/f4/img/v2/'
CRED = '/home/claude/f4/photos/credits.json'

def get(url, tries=12):
    for k in range(tries):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': UA}), timeout=60) as r:
                return r.read()
        except urllib.error.HTTPError as e:
            if e.code in (429, 503):
                w = int(e.headers.get('retry-after') or 20) + 2; time.sleep(min(w, 90) + 5 * k); continue
            if e.code == 404: raise
            raise
        except Exception:
            time.sleep(5)
    raise SystemExit('failed ' + url)

def strip(s): return html.unescape(re.sub('<[^>]+>', '', s or '')).strip()

def info(q, n=8, gen='search'):
    p = {'action': 'query', 'format': 'json', 'prop': 'imageinfo', 'iiprop': 'url|extmetadata|size|mime', 'iiurlwidth': 1600}
    if gen == 'search': p.update({'generator': 'search', 'gsrsearch': q, 'gsrnamespace': 6, 'gsrlimit': n})
    else: p['titles'] = q
    d = json.loads(get(API + urllib.parse.urlencode(p)))
    pages = sorted(d.get('query', {}).get('pages', {}).values(), key=lambda x: x.get('index', 0))
    res = []
    for pg in pages:
        if 'imageinfo' not in pg: continue
        ii = pg['imageinfo'][0]; m = ii.get('extmetadata', {})
        res.append(dict(title=pg['title'], w=ii['width'], h=ii['height'], mime=ii['mime'], thumb=ii.get('thumburl', ii['url']),
                        lic=strip(m.get('LicenseShortName', {}).get('value')), artist=strip(m.get('Artist', {}).get('value'))[:80],
                        desc=strip(m.get('ImageDescription', {}).get('value'))[:140], page=ii.get('descriptionurl')))
    return res

if __name__ == '__main__':
    if sys.argv[1] == 's':
        for r in info(sys.argv[2], int(sys.argv[3]) if len(sys.argv) > 3 else 8):
            if r['mime'] not in ('image/jpeg', 'image/png'): continue
            print(f"{r['title']} | {r['w']}x{r['h']} | {r['lic']} | {r['artist'][:40]} | {r['desc'][:90]}")
    elif sys.argv[1] == 'p':   # wm.py p NAME key#i:out.jpg ...
        for a in sys.argv[3:]:
            k, o = a.split(':'); key, i = k.split('#'); print(pick(sys.argv[2], key, int(i), o))
    elif sys.argv[1] == 'g':
        r = info(sys.argv[2], gen='titles')[0]
        data = get(r['thumb']); path = OUT + sys.argv[3]
        open(path, 'wb').write(data)
        c = json.load(open(CRED)) if os.path.exists(CRED) else {}
        c[sys.argv[3]] = f"{r['title'][5:]} — {r['artist'] or 'unknown author'}, {r['lic']}, via Wikimedia Commons ({r['page']})"
        json.dump(c, open(CRED, 'w'), indent=1, ensure_ascii=False)
        print('saved', sys.argv[3], len(data), c[sys.argv[3]][:120])

def pick(name, key, i, out):
    """download candidate key#i of cand/name.json"""
    C = json.load(open(f'/home/claude/f4/photos/cand/{name}.json')); r = C[key][i]
    import shutil; shutil.copy(f'/home/claude/f4/photos/cache/{key}_{i}.jpg', OUT + out)
    c = json.load(open(CRED)) if os.path.exists(CRED) else {}
    c[out] = f"{r['title'][5:]} — {r['artist'] or 'unknown author'}, {r['lic']}, via Wikimedia Commons"
    json.dump(c, open(CRED, 'w'), indent=1, ensure_ascii=False); return out

def url1280(r):
    import re as _re
    u = r['thumb'].split('?')[0].replace('thumb.wikimedia.org', 'upload.wikimedia.org')
    if r['w'] <= 1280 or '/thumb/' not in u: return u
    return _re.sub(r'/\d+px-', '/1280px-', u)
