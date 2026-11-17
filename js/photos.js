'use strict';
/* =====================================================================
   Illustrations des exercices : photos animées (fondu départ ↔ arrivée),
   image fixe, mes photos perso, et mise en cache hors connexion.
   Ordre de priorité : mes photos > photo de la base > bonhomme animé > schéma des muscles.
   ===================================================================== */
const DOSSIER_EXOS='images/exos/';
const CACHE_IMAGES='sporty-images';
const PHOTO_MAX_COTE=600,PHOTO_MAX_OCTETS=80*1024;

/* Quel visuel pour cet exercice ? perso | photo | bonhomme | schema | aucun (exercice inconnu) */
function typeVisuel(id){
  if(!EX[id])return 'aucun';
  if(S.photos&&S.photos[id]&&S.photos[id].length)return 'perso';
  if(typeof ILLUS!=='undefined'&&ILLUS[id])return 'photo';
  if(typeof FIG!=='undefined'&&FIG[id])return 'bonhomme';
  return 'schema';
}
/* Images à afficher (1 = fixe, 2 = animée), avec leur taille si on la connaît. */
function imagesExo(id){
  const t=typeVisuel(id);
  if(t==='perso')return {srcs:S.photos[id].slice(0,2),w:4,h:3,perso:true};
  if(t==='photo'){const i=ILLUS[id];return {srcs:i.fixe?[DOSSIER_EXOS+id+'-0.webp']:[DOSSIER_EXOS+id+'-0.webp',DOSSIER_EXOS+id+'-1.webp'],w:i.w,h:i.h};}
  return null;
}
const estAnimee=id=>{const im=imagesExo(id);return !!im&&im.srcs.length===2;};

/* HTML du visuel. mode : grand (fiche), vignette (carte en séance), liste (banque, sans animation). */
function illuHTML(id,mode){
  const e=EX[id];if(!e)return '';
  const im=imagesExo(id);
  if(!im){
    if(mode==='liste')return mmapSVG(e.group,' ',true);
    return FIG[id]?figSVG(id,'Animation du mouvement : '+e.name):mmapSVG(e.group,mode==='vignette'?' ':'Muscles travaillés : '+e.muscles.join(', '),mode==='vignette');
  }
  const taille=`width="${im.w}" height="${im.h}"`;
  if(mode==='liste')return `<img class="illu-liste" src="${esc(im.srcs[0])}" ${taille} alt="" loading="lazy" decoding="async">`;
  const ratio=`style="aspect-ratio:${im.w}/${im.h}"`,cls=`illu${mode==='vignette'?' vignette':''}${im.perso?' perso':''}`;
  if(im.srcs.length<2)
    return `<div class="${cls} fixe" ${ratio}><img src="${esc(im.srcs[0])}" ${taille} alt="Illustration : ${esc(e.name)}" decoding="async"></div>`;
  const fig=(src,k)=>`<figure class="pos p${k}"><img src="${esc(src)}" ${taille} alt="" decoding="async"><figcaption>${k?'Arrivée':'Départ'}</figcaption></figure>`;
  return `<div class="${cls} anim" ${ratio} role="img" aria-label="Animation : ${esc(e.name)}"${mode==='vignette'?'':' tabindex="0" aria-pressed="false" title="Touche pour mettre en pause"'}>${fig(im.srcs[0],0)}${fig(im.srcs[1],1)}${mode==='vignette'?'':`<span class="pause-ic" aria-hidden="true">${I.stop}</span>`}</div>`;
}
/* Mention sous la grande image. */
function illuNote(id){
  const t=typeVisuel(id);
  if(t==='perso')return '<p class="small muted illu-note">Tes photos</p>';
  if(t==='photo'&&ILLUS[id].t==='proche')return `<p class="small muted illu-note">Illustration approchante : ${esc(ILLUS[id].d)}</p>`;
  return '';
}

/* ---------- Animation : seulement à l'écran, pause au toucher ---------- */
let obsIllus=null;
function surveillerIllus(racine){
  if(typeof IntersectionObserver==='undefined')return;
  if(!obsIllus)obsIllus=new IntersectionObserver(es=>es.forEach(x=>x.target.classList.toggle('actif',x.isIntersecting)),{threshold:.15});
  (racine||document).querySelectorAll('.illu.anim:not([data-vu])').forEach(el=>{el.dataset.vu='1';obsIllus.observe(el);});
}
function basculerPause(el){
  const p=!el.classList.contains('pause');el.classList.toggle('pause',p);el.setAttribute('aria-pressed',p);
}

/* ---------- Hors connexion ---------- */
/* Les images des exercices de mes séances sont gardées tout de suite ; les autres le sont
   la première fois qu'elles s'affichent (le service worker s'en charge). */
function urlsSeances(){
  const ids=new Set();modelesTous().forEach(m=>m.ex.forEach(l=>ids.add(l.id)));ids.add('tapis');
  const u=[];ids.forEach(id=>{if(typeVisuel(id)==='photo')imagesExo(id).srcs.forEach(s=>u.push(s));});
  return u;
}
async function garderImagesSeances(){
  try{
    if(typeof caches==='undefined'||location.protocol==='file:')return 0;
    const c=await caches.open(CACHE_IMAGES);
    const urls=urlsSeances().map(u=>new URL(u,location.href).href);
    const manquantes=(await Promise.all(urls.map(u=>c.match(u).then(r=>r?null:u)))).filter(Boolean);
    const res=await Promise.allSettled(manquantes.map(u=>c.add(u)));
    S.imagesGardees=true;
    return res.filter(r=>r.status==='fulfilled').length;
  }catch(e){return 0;}
}

/* ---------- Mes photos ---------- */
function lireImage(file){
  return new Promise((ok,ko)=>{const u=URL.createObjectURL(file),img=new Image();
    img.onload=()=>{URL.revokeObjectURL(u);ok(img);};img.onerror=()=>{URL.revokeObjectURL(u);ko(new Error('image illisible'));};img.src=u;});
}
/* Réduit une photo : 600 px au plus grand côté, JPEG de moins de 80 Ko. Renvoie une data URL. */
async function reduirePhoto(file){
  const img=await lireImage(file);
  const k=Math.min(1,PHOTO_MAX_COTE/Math.max(img.naturalWidth,img.naturalHeight));
  const c=document.createElement('canvas');c.width=Math.round(img.naturalWidth*k);c.height=Math.round(img.naturalHeight*k);
  c.getContext('2d').drawImage(img,0,0,c.width,c.height);
  let url='';
  for(let q=.85;q>=.3;q-=.08){url=c.toDataURL('image/jpeg',q);if(octetsDataUrl(url)<=PHOTO_MAX_OCTETS)break;}
  return url;
}
const octetsDataUrl=u=>Math.round((u.length-u.indexOf(',')-1)*3/4);
function enregistrerPhotos(id,imgs){
  imgs=(imgs||[]).filter(Boolean).slice(0,2);
  S.photos=Object.assign({},S.photos);
  if(imgs.length)S.photos[id]=imgs;else delete S.photos[id];
  return Store.savePhotos(id);
}
const supprimerPhotos=id=>enregistrerPhotos(id,[]);
const nbPhotos=()=>Object.values(S.photos||{}).reduce((n,a)=>n+a.length,0);

/* Feuille « Ajouter mes photos ». */
function photosSheet(id){
  const e=EX[id];if(!e)return;
  if(!S.photoEdit||S.photoEdit.id!==id)S.photoEdit={id,imgs:(S.photos&&S.photos[id]||[]).slice(0,2)};
  const P=S.photoEdit;
  const slot=(k,t)=>`<div class="pslot"><span class="small" style="font-weight:700">${t}</span>
    ${P.imgs[k]?`<img src="${P.imgs[k]}" alt="${t}">`:'<div class="pvide">Pas de photo</div>'}
    <label class="btn sm ghost" style="cursor:pointer">${P.imgs[k]?'Changer':'Choisir'}<input type="file" accept="image/*" data-pslot="${k}" hidden></label>
    ${P.imgs[k]?`<button class="btn sm ghost rm" data-act="pslotdel" data-k="${k}">Retirer</button>`:''}</div>`;
  openModal(`<div class="sheet-head"><div><div class="eyebrow">Mes photos</div><h2 class="title-l">${esc(e.name)}</h2></div><button class="x" data-act="close" aria-label="Fermer">${I.x}</button></div>
    <p class="small muted" style="margin:0">Prends 1 ou 2 photos dans ta galerie ou avec l'appareil photo. Avec 2 photos (départ et arrivée), elles s'animent comme les autres.</p>
    <div class="pslots">${slot(0,'Départ')}${slot(1,'Arrivée (facultatif)')}</div>
    <button class="btn primary block" data-act="psave" data-ex="${id}" ${P.imgs[0]||P.imgs[1]?'':'disabled'}>Enregistrer mes photos</button>
    <p class="small muted" style="margin:0">Les photos sont réduites et gardées sur ce téléphone. Elles remplacent l'illustration de la base pour cet exercice.</p>`);
}
