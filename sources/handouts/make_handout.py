"""Build the student handout (docx + pdf) of a lesson from its deck: board summary text and illustrations.
python3 make_handout.py <deck.pptx> <workdir> <out_basename> <class> <class_footer> <module> <footer_line> [--no-class-in-footer]"""
import sys, json, re, os, subprocess
from pptx import Presentation
deck, work, out, cls, clsf, module = sys.argv[1:7]
os.makedirs(work + '/img', exist_ok=True)
p = Presentation(deck)
def texts(s): return [(sh.name, sh.text_frame.text.strip()) for sh in s.shapes if sh.has_text_frame and sh.text_frame.text.strip()]
bs, images = [], {}
hw = nxt = None; ident = {}; lesson_no = title = None
for i, s in enumerate(p.slides, 1):
    t = texts(s); sec = t[0][1] if t else ''
    if i == 1: lesson_no, title = [x.strip() for x in t[1][1].split('\n')][:2]
    if sec == 'IDENTIFICATION':
        # table
        for sh in s.shapes:
            if sh.has_table:
                for r in sh.table.rows: ident[r.cells[0].text.strip()] = r.cells[1].text.strip()
    if sec == 'HOMEWORK': hw = [x for n, x in t if n.startswith('Text 2')][0] if any(n.startswith('Text 2') for n, x in t) else t[-2][1]
    if sec == 'NEXT LESSON': nxt = t[-2][1].split('\n')[-1]
    if sec != 'BOARD SUMMARY' or (len(t) > 1 and t[1][1] == 'Board Summary'): continue
    sl = {'n': i, 'shapes': []}
    for sh in s.shapes:
        if sh.has_text_frame and sh.text_frame.text.strip():
            paras = []
            for para in sh.text_frame.paragraphs:
                if not para.text.strip(): continue
                paras.append([(r.text, bool(r.font.bold)) for r in para.runs])
            sl['shapes'].append({'name': sh.name, 'top': sh.top, 'paras': paras})
    pics = [sh for sh in s.shapes if sh.shape_type == 13 and sh.image.size != (482, 539)]
    cap = [x for n, x in t if x.startswith('Illustration:')]
    if pics and cap:
        im = pics[0].image; f = f's{i}_0.{im.ext}'
        open(work + '/img/' + f, 'wb').write(im.blob)
        c = cap[0][len('Illustration:'):].strip().rstrip('.'); c = c[0].upper() + c[1:]
        images[i] = [f, im.ext, im.size[0], im.size[1], c]
    bs.append(sl)
json.dump(bs, open(work + '/bs.json', 'w'), ensure_ascii=False)
cfg = {'cls': cls, 'cls_footer': clsf, 'module': module, 'line1': lesson_no.upper(), 'line2': title.upper(),
       'topic': ident.get('Topic', ''), 'subtopic': ident.get('Sub-topic', ''), 'footer': f'{lesson_no}: {title}',
       'images': images, 'homework': hw, 'next': nxt}
json.dump(cfg, open(work + '/cfg.json', 'w'), ensure_ascii=False, indent=1)
print(json.dumps({k: v for k, v in cfg.items() if k != 'images'}, ensure_ascii=False, indent=1)); print({k: v[4] for k, v in images.items()})
