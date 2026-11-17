"""Convertit les photos de free-exercise-db en WebP pour Sporty et écrit js/illustrations.js.
Usage : python3 -I outils/images-exos.py <dossier free-exercise-db>
Pour chaque exercice « exacte » ou « proche » de outils/animations.json :
  - animée : images/exos/<id>-0.webp (départ) et <id>-1.webp (arrivée), même taille toutes les deux ;
  - fixe   : images/exos/<id>-0.webp seulement (la photo choisie : 1re ou 2e).
Environ 480 px de large, moins de 30 Ko par image."""
import json, os, sys, io, glob
from PIL import Image
LARGEUR, MAX_OCTETS = 480, 30 * 1024
racine = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
corr = json.load(open(os.path.join(racine, 'outils', 'animations.json'), encoding='utf-8'))
depot = sys.argv[1]
sortie = os.path.join(racine, 'images', 'exos')
os.makedirs(sortie, exist_ok=True)
for f in glob.glob(os.path.join(sortie, '*.webp')): os.remove(f)

def webp(im, chemin):
    for q in range(82, 20, -4):   # qualité la plus haute qui reste sous 30 Ko
        b = io.BytesIO(); im.save(b, 'WEBP', quality=q, method=6)
        if b.tell() <= MAX_OCTETS: break
    open(chemin, 'wb').write(b.getvalue()); return b.tell()

total, n, data = 0, 0, {}
for sid, val in corr.items():
    if sid.startswith('_') or not val[0]: continue
    src, typ, diff, aff = val
    photos = [0, 1] if aff == 'animée' else [int(aff.split(':')[1])]
    ims = [Image.open(os.path.join(depot, 'exercises', src, f'{k}.jpg')).convert('RGB') for k in photos]
    w = min(i.width for i in ims); h = min(i.height for i in ims)
    sorties = []
    for k, im in enumerate(ims):
        if im.size != (w, h):
            l, t = (im.width - w) // 2, (im.height - h) // 2; im = im.crop((l, t, l + w, t + h))
        if w > LARGEUR: im = im.resize((LARGEUR, round(h * LARGEUR / w)), Image.LANCZOS)
        total += webp(im, os.path.join(sortie, f'{sid}-{k}.webp')); n += 1; sorties.append(im.size)
    e = {'t': typ, 'w': sorties[0][0], 'h': sorties[0][1]}
    if diff: e['d'] = diff
    if aff != 'animée': e['fixe'] = True
    data[sid] = e

js = ("'use strict';\n/* Fichier généré par outils/images-exos.py : ne pas modifier à la main.\n"
      "   Photos des exercices (free-exercise-db, domaine public), dans images/exos/.\n"
      "   t : exacte | proche ; d : différence affichée pour « proche » ; fixe : une seule image, pas d'animation ;\n"
      "   w, h : taille de l'image, pour réserver la place pendant le chargement. */\n"
      "const ILLUS=" + json.dumps(data, ensure_ascii=False, separators=(',', ':')).replace('},"', '},\n"') + ";\n")
open(os.path.join(racine, 'js', 'illustrations.js'), 'w', encoding='utf-8').write(js)
print(f'{n} images, {total/1024/1024:.2f} Mo, {len(data)} exercices illustrés')
