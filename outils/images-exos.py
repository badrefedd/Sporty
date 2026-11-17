"""Convertit les photos de free-exercise-db en WebP pour Sporty.
Usage : python3 -I outils/images-exos.py <dossier free-exercise-db> <dossier de sortie>
Pour chaque exercice « exacte » ou « proche » de outils/animations.json :
  <sortie>/<id>-0.webp (départ) et <id>-1.webp (arrivée), environ 480 px de large, moins de 30 Ko.
Les deux images d'un exercice sont recadrées à la même taille pour que le fondu ne saute pas."""
import json, os, sys, io
from PIL import Image
LARGEUR, MAX_OCTETS = 480, 30 * 1024
ici = os.path.dirname(os.path.abspath(__file__))
corr = json.load(open(os.path.join(ici, 'animations.json'), encoding='utf-8'))
depot, sortie = sys.argv[1], sys.argv[2]
os.makedirs(sortie, exist_ok=True)

def webp(im, chemin):
    # qualité la plus haute qui reste sous 30 Ko
    for q in range(82, 20, -4):
        b = io.BytesIO(); im.save(b, 'WEBP', quality=q, method=6)
        if b.tell() <= MAX_OCTETS: break
    open(chemin, 'wb').write(b.getvalue()); return b.tell(), q

total, n, qmin = 0, 0, 100
for sid, val in corr.items():
    if sid.startswith('_') or not val[0]: continue
    ims = [Image.open(os.path.join(depot, 'exercises', val[0], f'{k}.jpg')).convert('RGB') for k in (0, 1)]
    # même taille pour les deux images : la plus petite des deux
    w = min(i.width for i in ims); h = min(i.height for i in ims)
    for k, im in enumerate(ims):
        if im.size != (w, h):
            l, t = (im.width - w) // 2, (im.height - h) // 2; im = im.crop((l, t, l + w, t + h))
        if w > LARGEUR: im = im.resize((LARGEUR, round(h * LARGEUR / w)), Image.LANCZOS)
        o, q = webp(im, os.path.join(sortie, f'{sid}-{k}.webp')); total += o; n += 1; qmin = min(qmin, q)
print(f'{n} images, {total/1024/1024:.2f} Mo, qualité minimale {qmin}')
