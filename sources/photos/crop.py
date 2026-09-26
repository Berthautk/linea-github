"""Crop chosen photos in img/v2 to a wide 1.8:1 frame (once), so they fill the slide width better."""
import json, os
from PIL import Image
D = '/home/claude/f4/img/v2/'; C = json.load(open('/home/claude/f4/photos/credits.json'))
doneF = '/home/claude/f4/photos/cropped.json'; done = set(json.load(open(doneF))) if os.path.exists(doneF) else set()
R = 1.8
for f in C:
    p = D + f
    if f in done or not os.path.exists(p): continue
    im = Image.open(p).convert('RGB'); w, h = im.size
    if w / h < R - 0.02:
        nh = int(w / R); top = int((h - nh) * 0.4); im = im.crop((0, top, w, top + nh))
    im.save(p, quality=90); done.add(f)
json.dump(sorted(done), open(doneF, 'w'))
print(len(done), 'cropped/checked')
