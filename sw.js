/* Service worker : garde une copie de l'appli sur le téléphone pour qu'elle s'ouvre
   instantanément, même sans réseau à la salle.
   À chaque mise à jour de l'appli, change VERSION : le téléphone téléchargera
   la nouvelle version en arrière-plan et l'utilisera à la prochaine ouverture. */
const VERSION='sporty-v3.0.0';
const FICHIERS=[
  './','./index.html','./manifest.webmanifest','./css/styles.css',
  './js/outils.js','./js/exercices.js','./js/stockage.js','./js/sauvegarde.js',
  './js/visuels.js','./js/logique.js','./js/vues.js','./js/app.js',
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
  e.waitUntil(caches.open(VERSION).then(c=>c.addAll(FICHIERS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
/* Cache d'abord (rapide, marche hors ligne) ; sinon réseau, et on garde une copie. */
self.addEventListener('fetch',e=>{
  const req=e.request;
  if(req.method!=='GET'||new URL(req.url).origin!==location.origin)return;
  e.respondWith(
    caches.match(req,{ignoreSearch:true}).then(hit=>hit||fetch(req).then(res=>{
      if(res.ok){const copy=res.clone();caches.open(VERSION).then(c=>c.put(req,copy));}
      return res;
    }).catch(()=>req.mode==='navigate'?caches.match('./index.html'):Response.error()))
  );
});
