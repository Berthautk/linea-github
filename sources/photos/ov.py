"""Openverse search + download (Flickr and other CC sources; Wikimedia skipped because it is throttled here).
  ov.py NAME "key::query" ...        -> cand/NAME.json, cache/<key>_<i>.jpg, sheet_NAME.png
  ov.py p NAME key#i:out.jpg ...     -> copy to img/v2 and record the credit in credits.json
"""
import sys, time, json, os, io, urllib.request, urllib.parse, shutil
from PIL import Image, ImageDraw, ImageFont
UA = 'DGCAST-LessonBuilder/1.0 (educational slides)'
OUT = '/home/claude/f4/img/v2/'; CRED = '/home/claude/f4/photos/credits.json'; D = '/home/claude/f4/photos/'
LIC = {'by': 'CC BY', 'by-sa': 'CC BY-SA', 'cc0': 'CC0', 'pdm': 'Public domain', 'by-nd': 'CC BY-ND', 'by-nc': 'CC BY-NC', 'by-nc-sa': 'CC BY-NC-SA', 'by-nc-nd': 'CC BY-NC-ND'}


def get(url, tries=6):
    for k in range(tries):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': UA}), timeout=60) as r:
                return r.read()
        except urllib.error.HTTPError as e:
            if e.code in (429, 503):
                time.sleep(min(int(e.headers.get('retry-after') or 30), 120)); continue
            raise
        except Exception:
            time.sleep(4)
    raise RuntimeError('failed ' + url)


def search(q, n=3):
    p = {'q': q, 'page_size': 20, 'aspect_ratio': 'wide', 'mature': 'false'}
    d = json.loads(get('https://api.openverse.org/v1/images/?' + urllib.parse.urlencode(p)))
    res = []
    for r in d.get('results', []):
        if r.get('source') == 'wikimedia' or 'wikimedia' in (r.get('url') or ''): continue
        if (r.get('width') or 0) < 800: continue
        res.append(dict(title=r.get('title') or '', url=r['url'], src=r.get('source'),
                        lic=(LIC.get(r.get('license'), 'CC ' + str(r.get('license')).upper()) + ' ' + (r.get('license_version') or '')).strip(),
                        creator=r.get('creator') or 'unknown', page=r.get('foreign_landing_url') or '', w=r.get('width'), h=r.get('height')))
        if len(res) >= n: break
    return res


def credit(r):
    src = {'flickr': 'Flickr'}.get(r['src'], r['src'])
    return f"“{r['title'][:70]}” by {r['creator']}, {r['lic']}, via {src} ({r['page']})"


def sheet(name, keys, C):
    font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 20); tiles = []
    for key in keys:
        for i in range(len(C.get(key, []))):
            f = D + f'cache/{key}_{i}.jpg'
            if not os.path.exists(f): continue
            im = Image.open(f); im.thumbnail((360, 240)); t = Image.new('RGB', (360, 268), 'white'); t.paste(im, (0, 0))
            ImageDraw.Draw(t).text((3, 243), f'{key}#{i}', fill='red', font=font); tiles.append(t)
    c = 6; rr = max(1, (len(tiles) + c - 1) // c); M = Image.new('RGB', (360 * c, 268 * rr), 'white')
    for i, t in enumerate(tiles): M.paste(t, ((i % c) * 360, (i // c) * 268))
    M.save(D + f'sheet_{name}.png'); print(name, len(tiles), 'tiles', flush=True)


if __name__ == '__main__':
    if sys.argv[1] == 'p':
        name = sys.argv[2]; C = json.load(open(D + f'cand/{name}.json'))
        c = json.load(open(CRED)) if os.path.exists(CRED) else {}
        for a in sys.argv[3:]:
            k, o = a.split(':'); key, i = k.split('#'); r = C[key][int(i)]
            shutil.copy(D + f'cache/{key}_{i}.jpg', OUT + o); c[o] = credit(r); print(o, '<-', c[o][:110])
        json.dump(c, open(CRED, 'w'), indent=1, ensure_ascii=False); sys.exit()
    name = sys.argv[1]; args = sys.argv[2:]
    os.makedirs(D + 'cand', exist_ok=True); os.makedirs(D + 'cache', exist_ok=True)
    path = D + f'cand/{name}.json'; C = json.load(open(path)) if os.path.exists(path) else {}
    keys = []
    for arg in args:
        key, q = arg.split('::'); keys.append(key)
        if key not in C:
            try: C[key] = search(q)
            except Exception as e: print('search fail', key, e, flush=True); C[key] = []
            json.dump(C, open(path, 'w'), indent=1); time.sleep(3.5)
        for i, r in enumerate(C[key]):
            f = D + f'cache/{key}_{i}.jpg'
            if os.path.exists(f): continue
            try:
                im = Image.open(io.BytesIO(get(r['url']))).convert('RGB'); im.thumbnail((1600, 1600)); im.save(f, quality=88)
            except Exception as e: print('dl fail', key, i, e, flush=True)
        print('done', key, len(C[key]), flush=True)
    sheet(name, keys, C)
