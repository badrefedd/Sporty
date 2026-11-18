/* Service worker : garde une copie de l'appli sur le téléphone pour qu'elle s'ouvre
   instantanément, même sans réseau à la salle.
   À chaque mise à jour de l'appli, change VERSION : le téléphone téléchargera
   la nouvelle version en arrière-plan et l'utilisera à la prochaine ouverture. */
const VERSION='sporty-v3.6.0';
const FICHIERS=[
  './','./index.html','./manifest.webmanifest','./css/styles.css',
  './js/outils.js','./js/exercices.js','./js/alternatives.js','./js/stockage.js','./js/sauvegarde.js',
  './js/illustrations.js','./js/visuels.js','./js/photos.js','./js/logique.js','./js/seances.js','./js/vues.js','./js/vues-seances.js','./js/app.js',
  './icons/icon.svg','./icons/apple-touch-icon.png','./icons/icon-192.png','./icons/icon-512.png',
  './fonts/Barlow-400-latin-ext.woff2',
  './fonts/Barlow-400-latin.woff2',
  './fonts/Barlow-500-latin-ext.woff2',
  './fonts/Barlow-500-latin.woff2',
  './fonts/Barlow-600-latin-ext.woff2',
  './fonts/Barlow-600-latin.woff2',
  './fonts/Barlow-700-latin-ext.woff2',
  './fonts/Barlow-700-latin.woff2',
  './fonts/BarlowCondensed-600-latin-ext.woff2',
  './fonts/BarlowCondensed-600-latin.woff2',
  './fonts/BarlowCondensed-700-latin-ext.woff2',
  './fonts/BarlowCondensed-700-latin.woff2',
  './fonts/BarlowCondensed-700i-latin-ext.woff2',
  './fonts/BarlowCondensed-700i-latin.woff2',
  './fonts/BarlowCondensed-800-latin-ext.woff2',
  './fonts/BarlowCondensed-800-latin.woff2',
  './fonts/BarlowCondensed-800i-latin-ext.woff2',
  './fonts/BarlowCondensed-800i-latin.woff2',
];
self.addEventListener('install',e=>{
  /* La nouvelle version attend : l'appli affiche « Nouvelle version disponible » et c'est toi qui lances la mise à jour. */
  e.waitUntil(caches.open(VERSION).then(c=>c.addAll(FICHIERS)));
});
/* Les images d'exercices ont leur propre réserve, gardée d'une version à l'autre. */
const IMAGES='sporty-images';
self.addEventListener('message',e=>{if(e.data==='mettre-a-jour')self.skipWaiting();});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VERSION&&k!==IMAGES).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
/* Cache d'abord (rapide, marche hors ligne) ; sinon réseau, et on garde une copie. */
self.addEventListener('fetch',e=>{
  const req=e.request;
  if(req.method!=='GET'||new URL(req.url).origin!==location.origin)return;
  /* image d'exercice : réserve d'abord, sinon réseau puis on la garde */
  if(new URL(req.url).pathname.includes('/images/exos/')){
    e.respondWith(caches.open(IMAGES).then(c=>c.match(req).then(hit=>hit||fetch(req).then(res=>{if(res.ok)c.put(req,res.clone());return res;}))));
    return;
  }
  e.respondWith(
    caches.match(req,{ignoreSearch:true}).then(hit=>hit||fetch(req).then(res=>{
      if(res.ok){const copy=res.clone();caches.open(VERSION).then(c=>c.put(req,copy));}
      return res;
    }).catch(()=>req.mode==='navigate'?caches.match('./index.html'):Response.error()))
  );
});
