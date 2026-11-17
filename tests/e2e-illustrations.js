/* Parcours des illustrations dans un iPhone simulé (nécessite Playwright).
   Lancer : node tests/e2e-illustrations.js   (serveur intégré, port 8767) */
const {chromium,devices}=require('playwright');
const http=require('http'),fs=require('fs'),path=require('path'),assert=require('assert'),os=require('os');
const RACINE=path.join(__dirname,'..'),PORT=8767,U=`http://localhost:${PORT}/`;
const TYPES={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.webmanifest':'application/manifest+json','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.woff2':'font/woff2'};
const serveur=http.createServer((req,res)=>{
  let f=path.join(RACINE,decodeURIComponent(req.url.split('?')[0]));if(f.endsWith('/'))f+='index.html';
  if(!f.startsWith(RACINE)||!fs.existsSync(f)){res.writeHead(404);return res.end();}
  res.writeHead(200,{'Content-Type':TYPES[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(res);
});
const IPHONE={...devices['iPhone 13']};
let navigateur;
async function page(opts={}){
  const c=await navigateur.newContext({...IPHONE,acceptDownloads:true,...opts});const p=await c.newPage();p.erreurs=[];
  p.on('pageerror',e=>p.erreurs.push(e.message));p.on('console',m=>{if(m.type()==='error')p.erreurs.push(m.text());});
  return p;
}
const p1=p=>p.evaluate(()=>{const el=document.querySelector('#sheet .illu');return {cls:el.className,etat:el.querySelector('.p1')?getComputedStyle(el.querySelector('.p1')).animationPlayState:null};});
const etapes=[];const etape=(nom,fn)=>etapes.push({nom,fn});

etape('L\'animation tourne, se met en pause au toucher, et hors écran',async()=>{
  const p=await page();await p.goto(U+'#exos');await p.waitForSelector('#bankList');
  await p.evaluate(()=>exInfo('dc'));await p.waitForTimeout(400);
  let s=await p1(p);assert.match(s.cls,/\bactif\b/);assert.equal(s.etat,'running');
  await p.click('#sheet .illu');s=await p1(p);assert.match(s.cls,/\bpause\b/);assert.equal(s.etat,'paused');
  assert.equal(await p.getAttribute('#sheet .illu','aria-pressed'),'true');
  await p.click('#sheet .illu');s=await p1(p);assert.equal(s.etat,'running');
  // vignette en séance : animée à l'écran, en pause hors écran
  await p.evaluate(()=>closeModal());await p.goto(U+'#semaine');await p.click('.hero [data-act="start"]');await p.waitForSelector('#ex-presse .illu');await p.waitForTimeout(300);
  const v=()=>p.evaluate(()=>{const el=document.querySelector('#ex-presse .illu');return {actif:el.classList.contains('actif'),etat:getComputedStyle(el.querySelector('.p1')).animationPlayState};});
  assert.deepEqual(await v(),{actif:true,etat:'running'});
  await p.evaluate(()=>window.scrollTo(0,document.body.scrollHeight));await p.waitForTimeout(400);
  assert.deepEqual(await v(),{actif:false,etat:'paused'});
  // la liste de la banque n'anime rien
  await p.goto(U+'#exos');await p.waitForSelector('.illu-liste');assert.equal(await p.$$eval('#bankList .illu.anim',a=>a.length),0);
  // un exercice fixe n'est pas animé
  await p.evaluate(()=>exInfo('planche'));await p.waitForTimeout(200);assert.equal(await p.$$eval('#sheet .illu img',a=>a.length),1);assert.equal(await p.$('#sheet .illu.anim'),null);
  // mention « proche »
  await p.evaluate(()=>exInfo('lat_machine'));assert.match(await p.textContent('#sheet .illu-note'),/Illustration approchante : aux haltères au lieu de la machine/);
  assert.deepEqual(p.erreurs,[]);await p.context().close();
});
etape('« Réduire les animations » : 2 images côte à côte avec Départ / Arrivée ; une seule pour un exercice fixe',async()=>{
  const p=await page({reducedMotion:'reduce'});await p.goto(U+'#exos');await p.waitForSelector('#bankList');
  await p.evaluate(()=>exInfo('dc'));await p.waitForTimeout(300);
  const r=await p.evaluate(()=>{const el=document.querySelector('#sheet .illu');const caps=[...el.querySelectorAll('figcaption')].filter(c=>getComputedStyle(c).display!=='none').map(c=>c.textContent);
    const [a,b]=[...el.querySelectorAll('img')].map(i=>i.getBoundingClientRect());return {display:getComputedStyle(el).display,caps,cote:Math.abs(a.top-b.top)<2&&b.left>a.right-1,op:getComputedStyle(el.querySelector('.p1')).opacity};});
  assert.equal(r.display,'grid');assert.deepEqual(r.caps,['Départ','Arrivée']);assert.ok(r.cote,'côte à côte');assert.equal(r.op,'1');
  await p.screenshot({path:path.join(os.tmpdir(),'sporty-reduit.png')});
  await p.evaluate(()=>exInfo('planche'));await p.waitForTimeout(200);
  const f=await p.evaluate(()=>({imgs:document.querySelectorAll('#sheet .illu img').length,caps:[...document.querySelectorAll('#sheet figcaption')].length,txt:document.querySelector('#sheet .figbox').textContent}));
  assert.deepEqual(f,{imgs:1,caps:0,txt:''});
  assert.deepEqual(p.erreurs,[]);await p.context().close();
});
etape('Mode sombre : cadre arrondi avec liseré, couleurs de la photo inchangées',async()=>{
  const p=await page({colorScheme:'dark'});await p.goto(U+'#exos');await p.waitForSelector('#bankList');
  await p.evaluate(()=>{S.settings.theme='dark';applyTheme();exInfo('dc');});await p.waitForTimeout(300);
  const s=await p.evaluate(()=>{const el=document.querySelector('#sheet .illu'),img=el.querySelector('img'),cs=getComputedStyle(el),ci=getComputedStyle(img);return {sombre:document.documentElement.classList.contains('dark'),rayon:cs.borderRadius,ombre:cs.boxShadow,filtre:ci.filter,melange:ci.mixBlendMode,op:ci.opacity};});
  assert.ok(s.sombre);assert.equal(s.rayon,'14px');assert.match(s.ombre,/rgba\(255, 255, 255, 0\.22\)/);
  assert.equal(s.filtre,'none');assert.equal(s.melange,'normal');assert.equal(s.op,'1');
  await p.screenshot({path:path.join(os.tmpdir(),'sporty-sombre.png')});
  assert.deepEqual(p.erreurs,[]);await p.context().close();
});
etape('Séance A complète sans réseau, avec les animations',async()=>{
  const p=await page();await p.goto(U+'#semaine');await p.waitForSelector('.week');
  await p.evaluate(()=>navigator.serviceWorker.ready);
  // les images des séances sont gardées tout de suite
  await p.waitForFunction(()=>S.imagesGardees===true,null,{timeout:20000});
  assert.equal(await p.evaluate(async()=>{const c=await caches.open('sporty-images');const k=(await c.keys()).map(r=>r.url);return urlsSeances().filter(u=>!k.some(x=>x.endsWith(u))).length;}),0,'toutes les images des séances sont gardées');
  await p.reload();await p.waitForSelector('.week');
  await p.context().setOffline(true);await p.reload();await p.waitForSelector('.week');
  await p.click('.hero [data-act="start"]');await p.waitForSelector('.card.ex');
  for(const id of await p.evaluate(()=>S.draft.list)){
    await p.evaluate(i=>document.getElementById('ex-'+i).scrollIntoView({block:'center'}),id);await p.waitForTimeout(150);
    const ok=await p.evaluate(i=>[...document.querySelectorAll(`#ex-${i} .ex-thumb img`)].every(im=>im.complete&&im.naturalWidth>0),id);
    assert.ok(ok,id+' : image non chargée hors connexion');
    await p.fill(`#w-${id}-0`,'10');await p.click(`#ex-${id} [data-act="toggleset"][data-i="0"]`);const t=await p.$('[data-act="timerstop"]');if(t&&await t.isVisible())await t.click();
  }
  await p.evaluate(()=>exInfo('presse'));await p.waitForTimeout(300);
  assert.ok(await p.evaluate(()=>[...document.querySelectorAll('#sheet .illu img')].every(i=>i.complete&&i.naturalWidth>0)));
  await p.evaluate(()=>closeModal());await p.click('[data-act="finish"]');await p.waitForSelector('#sheet h2');
  assert.match(await p.textContent('#sheet h2'),/Séance A terminée/);
  assert.deepEqual(p.erreurs.filter(e=>!/net::ERR_INTERNET_DISCONNECTED|Failed to load resource/.test(e)),[]);await p.context().close();
});
etape('Ajouter 2 photos perso, puis sauvegarde et import avec photos',async()=>{
  const p=await page();await p.goto(U+'#exos');await p.waitForSelector('#bankList');
  await p.evaluate(()=>exInfo('hip_machine'));await p.click('#sheet [data-act="photos"]');await p.waitForSelector('.pslots');
  const img=k=>({name:`photo${k}.webp`,mimeType:'image/webp',buffer:fs.readFileSync(path.join(RACINE,'images','exos',`squat-${k}.webp`))});
  await p.setInputFiles('[data-pslot="0"]',img(0));await p.waitForSelector('.pslot img');
  await p.setInputFiles('[data-pslot="1"]',img(1));await p.waitForFunction(()=>document.querySelectorAll('.pslot img').length===2);
  await p.click('[data-act="psave"]');await p.waitForSelector('#sheet .illu.perso.anim');
  const ph=await p.evaluate(()=>S.photos.hip_machine.map(u=>({jpeg:u.startsWith('data:image/jpeg'),octets:Math.round((u.length-u.indexOf(',')-1)*3/4)})));
  assert.equal(ph.length,2);ph.forEach(x=>{assert.ok(x.jpeg);assert.ok(x.octets<80*1024,x.octets);});
  assert.match(await p.textContent('#sheet'),/Revenir à l'illustration d'origine/);
  // sauvegarde avec photos
  await p.evaluate(()=>closeModal());await p.goto(U+'#reglages');await p.waitForSelector('#bk-photos');
  assert.ok(await p.isChecked('#bk-photos'));
  const [dl]=await Promise.all([p.waitForEvent('download'),p.click('[data-act="backup"]')]);
  const fichier=path.join(os.tmpdir(),'sporty-test-photos.json');await dl.saveAs(fichier);
  assert.equal(JSON.parse(fs.readFileSync(fichier,'utf8')).photos.hip_machine.length,2);
  // import dans une appli neuve
  const q=await page();await q.goto(U+'#reglages');await q.waitForSelector('#donnees');
  await q.click('[data-act="openimport"]');await q.setInputFiles('#importfile',fichier);await q.waitForSelector('[data-act="importremplacer"]');
  assert.match(await q.textContent('#importres'),/1 exercice avec mes photos/);
  await q.click('[data-act="importremplacer"]');await q.click('[data-act="confirmok"]');await q.waitForTimeout(400);
  assert.equal(await q.evaluate(()=>typeVisuel('hip_machine')),'perso');
  await q.reload();await q.waitForSelector('#donnees');assert.equal(await q.evaluate(()=>S.photos.hip_machine.length),2,'gardées après rechargement');
  // revenir à l'illustration d'origine
  await q.evaluate(()=>exInfo('hip_machine'));await q.click('[data-act="photosdel"]');await q.click('[data-act="confirmok"]');await q.waitForTimeout(300);
  assert.equal(await q.evaluate(()=>typeVisuel('hip_machine')),'photo');
  assert.deepEqual(p.erreurs.concat(q.erreurs),[]);await p.context().close();await q.context().close();
});

(async()=>{
  await new Promise(r=>serveur.listen(PORT,r));navigateur=await chromium.launch();let ok=0;
  for(const e of etapes){try{await e.fn();ok++;console.log('  ✓ '+e.nom);}catch(err){console.log('  ✗ '+e.nom+'\n      '+String(err.message).split('\n').join('\n      '));}}
  console.log(`\n${ok}/${etapes.length} parcours réussis`);await navigateur.close();serveur.close();process.exit(ok===etapes.length?0:1);
})();
