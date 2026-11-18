/* Parcours V1.1 dans un iPhone simulé (nécessite Playwright).
   Lancer : node tests/e2e-v11.js   (serveur intégré, port 8768)
   Le serveur peut changer la version du service worker pour simuler une mise à jour publiée. */
const {chromium,devices}=require('playwright');
const http=require('http'),fs=require('fs'),path=require('path'),assert=require('assert');
const RACINE=path.join(__dirname,'..'),PORT=8768,U=`http://localhost:${PORT}/`;
const TYPES={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.webmanifest':'application/manifest+json','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.woff2':'font/woff2'};
let versionSW=null;   // null = sw.js tel quel ; sinon, version publiée simulée
const serveur=http.createServer((req,res)=>{
  let f=path.join(RACINE,decodeURIComponent(req.url.split('?')[0]));if(f.endsWith('/'))f+='index.html';
  if(!f.startsWith(RACINE)||!fs.existsSync(f)){res.writeHead(404);return res.end();}
  const h={'Content-Type':TYPES[path.extname(f)]||'application/octet-stream','Cache-Control':'no-store'};
  if(f.endsWith('sw.js')&&versionSW){res.writeHead(200,h);return res.end(fs.readFileSync(f,'utf8').replace(/const VERSION='[^']+'/,`const VERSION='${versionSW}'`));}
  res.writeHead(200,h);fs.createReadStream(f).pipe(res);
});
let nav;
async function page(opts={}){
  const c=await nav.newContext({...devices['iPhone 13'],...opts});const p=await c.newPage();p.erreurs=[];
  p.on('pageerror',e=>p.erreurs.push(e.message));p.on('console',m=>{if(m.type()==='error')p.erreurs.push(m.text());});return p;
}
const valider=async(p,id,i,w,r)=>{if(w!=null)await p.fill(`#w-${id}-${i}`,String(w));if(r!=null)await p.fill(`#r-${id}-${i}`,String(r));await p.click(`#ex-${id} [data-act="toggleset"][data-i="${i}"]`);const t=await p.$('[data-act="timerstop"]');if(t&&await t.isVisible())await t.click();};
const etapes=[];const etape=(nom,fn)=>etapes.push({nom,fn});

etape('Fin de séance : un seul « Terminer », confirmation avec les 3 choix, accords',async()=>{
  const p=await page();await p.goto(U+'#semaine');await p.click('.hero [data-act="start"]');await p.waitForSelector('#ex-dc');
  assert.equal(await p.$('[data-act="stop"]'),null,'plus de « Arrêter et enregistrer »');
  assert.ok(await p.$('[data-act="abandon"]'));assert.equal(await p.$$eval('[data-act="finish"]',a=>a.length),1);
  // champ de charge vide : « – » gris, pas « 0 »
  assert.equal(await p.getAttribute('#w-dc-0','placeholder'),'–');
  await valider(p,'presse',0,100,10);
  await p.fill('#w-dc-0','60');await p.fill('#r-dc-0','10');   // remplie, pas validée
  await p.click('[data-act="finish"]');await p.waitForSelector('#sheet [data-act="finvalider"]');
  const txt=await p.textContent('#sheet');
  assert.match(txt,/1 série remplie mais pas validée/);assert.match(txt,/1 série est validée/);
  assert.match(txt,/Valider cette série et terminer/);assert.match(txt,/Terminer sans elles/);assert.match(txt,/Continuer la séance/);
  // « Continuer la séance »
  await p.click('#sheet button.btn:has-text("Continuer la séance")');assert.ok(await p.isHidden('#modal'));
  assert.ok(await p.evaluate(()=>!!S.draft));
  // « Valider cette série et terminer »
  await p.click('[data-act="finish"]');await p.click('#sheet [data-act="finvalider"]');await p.waitForSelector('#sheet h2:has-text("terminée")');
  const ses=await p.evaluate(()=>S.sessions[S.sessions.length-1]);assert.deepEqual(Object.keys(ses.ex).sort(),['dc','presse']);
  assert.match(await p.textContent('#sheet .tiles'),/Séries\s*2/);
  await p.click('#sheet [data-act="close"]');
  // historique : « 2 séries » / « 1 série »
  await p.goto(U+'#historique');assert.match(await p.textContent('.hist-item .meta'),/2 séries/);
  // « Terminer sans elles »
  await p.goto(U+'#semaine');await p.click('.hero [data-act="start"]').catch(()=>{});await p.goto(U+'#seance');
  if(!(await p.evaluate(()=>!!S.draft))){await p.click('.scard[data-type="B"]');}
  await p.waitForSelector('.card.ex');const id=await p.evaluate(()=>S.draft.list[0]);
  await valider(p,id,0,20,10);
  await p.click('[data-act="finish"]');await p.click('#sheet [data-act="finsans"]');await p.waitForSelector('#sheet h2:has-text("terminée")');
  assert.match(await p.textContent('#sheet .tiles'),/Série\s*1/,'tuile au singulier');
  await p.click('#sheet [data-act="close"]');await p.goto(U+'#historique');
  assert.match(await p.textContent('.hist-item .meta'),/1 série ·/);
  // toutes validées : fin directe
  await p.goto(U+'#seance');await p.click('.scard[data-type="L"]');await p.fill('#pickq','pompes');await p.click('#pickList [data-act="pick"]');await p.waitForSelector('#ex-pompes');
  for(let i=0;i<3;i++)await valider(p,'pompes',i,null,12);
  await p.click('[data-act="finish"]');await p.waitForSelector('#sheet h2:has-text("terminée")');
  assert.deepEqual(p.erreurs,[]);await p.context().close();
});
etape('Séance de plus de 3 heures : heure de fin réelle',async()=>{
  const p=await page();await p.goto(U+'#semaine');await p.click('.hero [data-act="start"]');await p.waitForSelector('#ex-dc');
  await valider(p,'dc',0,60,10);
  await p.evaluate(()=>{const n=new Date();n.setHours(n.getHours()-5,0,0,0);S.draft.start=n.getTime();Store.saveDraft();});
  await p.click('[data-act="finish"]');await p.click('#sheet [data-act="finsans"]');await p.waitForSelector('#finheure');
  const attendu=await p.evaluate(()=>hhmm(finEstimee()));assert.equal(await p.inputValue('#finheure'),attendu,'pré-rempli : début + durée estimée');
  const fin=await p.evaluate(()=>hhmm(S.draft.start+70*60000));await p.fill('#finheure',fin);
  await p.click('[data-act="finheure"]');await p.waitForSelector('#sheet h2:has-text("terminée")');
  assert.equal(await p.evaluate(()=>S.sessions[S.sessions.length-1].dur),70);
  assert.deepEqual(p.erreurs,[]);await p.context().close();
});
etape('Modifier une séance terminée depuis l\'historique, avec confirmation si on quitte',async()=>{
  const p=await page();await p.goto(U+'#semaine');await p.click('.hero [data-act="start"]');await p.waitForSelector('#ex-dc');
  for(let i=0;i<3;i++)await valider(p,'dc',i,60,12);
  await p.click('[data-act="finish"]');await p.click('#sheet [data-act="finsans"]');await p.click('#sheet [data-act="close"]');
  await p.goto(U+'#historique');await p.click('.hist-item [data-act="togglehist"]');await p.click('.hist-item [data-act="modifier"]');
  await p.waitForSelector('#m-date');assert.equal(await p.evaluate(()=>location.hash),'#modif');
  assert.equal(await p.$$eval('#ex-dc .set.done',a=>a.length),3,'séries cochées');
  // je change la 2e série, j'ajoute une série, je retire un exercice ajouté
  await p.fill('#r-dc-1','8');await p.click('#ex-dc [data-act="addset"]');await valider(p,'dc',3,62.5,6);
  // quitter sans enregistrer : confirmation
  await p.click('nav.tabs a[href="#poids"]');await p.waitForSelector('#sheet [data-act="confirmok"]');
  assert.match(await p.textContent('#sheet'),/Quitter sans enregistrer/);
  await p.click('#sheet [data-act="close"]');assert.equal(await p.evaluate(()=>location.hash),'#modif');
  assert.equal(await p.inputValue('#r-dc-1'),'8','rien de perdu');
  // date, heure, durée
  const hier=await p.evaluate(()=>dkey(addDays(new Date(),-1)));
  await p.fill('#m-date',hier);await p.fill('#m-heure','18:15');await p.fill('#m-dur','55');
  await p.click('[data-act="modifsave"]');await p.waitForTimeout(200);
  const s=await p.evaluate(()=>S.sessions[0]);
  assert.equal(s.date,hier);assert.equal(s.dur,55);assert.equal(new Date(s.ts).getHours(),18);
  assert.deepEqual(s.ex.dc.map(x=>x.r),[12,8,12,6]);assert.ok(s.modifiee);
  await p.click('.hist-item [data-act="togglehist"]').catch(()=>{});
  assert.match(await p.textContent('#view'),/modifiée/);
  // sortir sans changement : pas de question
  await p.click('.hist-item [data-act="modifier"]').catch(async()=>{await p.click('.hist-item [data-act="togglehist"]');await p.click('.hist-item [data-act="modifier"]');});
  await p.waitForSelector('#m-date');await p.click('[data-act="modifannuler"]');await p.waitForTimeout(150);
  assert.equal(await p.evaluate(()=>location.hash),'#historique');
  assert.deepEqual(p.erreurs,[]);await p.context().close();
});
etape('Modifier un Five depuis la journée du calendrier',async()=>{
  const p=await page();await p.goto(U+'#semaine');
  const hier=await p.evaluate(()=>{const k=dkey(addDays(new Date(),-1));S.sessions.push({id:'f1',type:'five',date:k,ts:pkey(k).getTime()+20*3600e3,min:60});Store.saveSession(S.sessions[0]);return k;});
  await p.goto(U+'#mois');await p.click(`.cal-cell[data-date="${hier}"]`);await p.click('#sheet [data-act="modifier"]');
  await p.waitForSelector('#m-min');await p.fill('#m-min','75');await p.fill('#m-note','2 buts');
  await p.click('[data-act="modifsave"]');await p.waitForTimeout(150);
  assert.equal(await p.evaluate(()=>location.hash),'#mois');
  assert.deepEqual(await p.evaluate(()=>[S.sessions[0].min,S.sessions[0].note,S.sessions[0].modifiee]),[75,'2 buts',true]);
  assert.deepEqual(p.erreurs,[]);await p.context().close();
});
etape('Rouvrir la séance depuis le récapitulatif ; refus si une autre est en cours',async()=>{
  const p=await page();await p.goto(U+'#semaine');await p.click('.hero [data-act="start"]');await p.waitForSelector('#ex-dc');
  await valider(p,'dc',0,60,10);
  await p.click('[data-act="finish"]');await p.click('#sheet [data-act="finsans"]');await p.waitForSelector('#sheet [data-act="rouvrir"]');
  await p.click('#sheet [data-act="rouvrir"]');await p.waitForSelector('#ex-dc');
  assert.equal(await p.evaluate(()=>location.hash),'#seance');
  assert.equal(await p.$$eval('#ex-dc .set.done',a=>a.length),1);assert.ok(await p.$('#ex-presse'),'tout le programme revient');
  assert.equal(await p.evaluate(()=>S.sessions.length),0,'retirée de l\'historique');
  await valider(p,'presse',0,100,10);
  await p.click('[data-act="finish"]');await p.click('#sheet [data-act="finsans"]');await p.waitForSelector('#sheet h2:has-text("terminée")');
  assert.equal(await p.evaluate(()=>S.sessions.length),1);
  // une autre séance en cours : message
  await p.click('#sheet [data-act="close"]');const sid=await p.evaluate(()=>S.sessions[0].id);
  await p.goto(U+'#seance');await p.click('.scard[data-type="B"]');await p.waitForSelector('.card.ex');
  await p.goto(U+'#historique');await p.click('.hist-item [data-act="togglehist"]');await p.click(`.hist-item [data-act="rouvrir"][data-id="${sid}"]`);
  assert.match(await p.textContent('#toast'),/déjà en cours/);
  assert.deepEqual(p.erreurs,[]);await p.context().close();
});
etape('Repos fini pendant l\'absence : « Go ! » au retour, pas de compteur négatif',async()=>{
  const p=await page();await p.goto(U+'#semaine');await p.click('.hero [data-act="start"]');await p.waitForSelector('#ex-dc');
  await p.evaluate(()=>{Timer.start(90,'Développé couché');S.draft.repos.end=Date.now()-20000;Store.saveDraft();});
  await p.waitForTimeout(1200);await p.reload();await p.waitForSelector('#timer:not([hidden])');
  assert.equal(await p.textContent('#timerT'),'Go !');
  await p.evaluate(()=>{Timer.start(90,'x');});await p.waitForTimeout(300);await p.reload();await p.waitForSelector('#timer:not([hidden])');
  const tt=await p.textContent('#timerT');assert.match(tt,/^1:(2\d|30)$/,'repos en cours repris après rechargement : '+tt+' '+JSON.stringify(await p.evaluate(()=>S.draft.repos)));
  assert.deepEqual(p.erreurs,[]);await p.context().close();
});
etape('Bandeau « Nouvelle version disponible » ; jamais pendant une séance',async()=>{
  versionSW=null;
  const p=await page();await p.goto(U+'#semaine');await p.evaluate(()=>navigator.serviceWorker.ready);
  await p.reload();await p.waitForFunction(()=>!!navigator.serviceWorker.controller&&!!Maj.reg);
  assert.ok(await p.isHidden('#maj'));
  // une nouvelle version est publiée
  versionSW='sporty-test-v2';await p.evaluate(()=>Maj.reg.update());
  await p.waitForSelector('#maj:not([hidden])',{timeout:15000});
  assert.match(await p.textContent('#maj'),/Nouvelle version disponible/);
  // pendant une séance : caché, puis de retour à la fin
  await p.click('.hero [data-act="start"]');await p.waitForSelector('#ex-dc');assert.ok(await p.isHidden('#maj'));
  await valider(p,'dc',0,60,10);await p.click('[data-act="finish"]');await p.click('#sheet [data-act="finsans"]');await p.click('#sheet [data-act="close"]');
  assert.ok(await p.isVisible('#maj'),'réapparaît une fois la séance finie');
  // « Mettre à jour » : la nouvelle version prend la main et l'appli se recharge
  await Promise.all([p.waitForEvent('load'),p.click('#maj [data-act="maj"]')]);
  await p.waitForFunction(()=>!!Maj.reg);
  assert.equal(await p.evaluate(async()=>(await caches.keys()).includes('sporty-test-v2')),true);
  assert.ok(await p.isHidden('#maj'),'plus de bandeau après la mise à jour');
  assert.equal(await p.evaluate(()=>S.sessions.length),1,'données intactes');
  versionSW=null;await p.context().close();
});
etape('Zones à toucher d\'au moins 44 × 44 px, sur tous les écrans',async()=>{
  const p=await page();const petits=[];
  const audit=async nom=>{(await p.evaluate(()=>{const out=[];document.querySelectorAll('button,a[href],input:not([type=hidden]),select,label.btn,[data-act],textarea').forEach(el=>{
    if(el.closest('[hidden]'))return;const s=getComputedStyle(el);if(s.display==='none'||s.visibility==='hidden'||el.matches('input[type=file],input[type=checkbox][hidden]'))return;
    let r=el.getBoundingClientRect();if(!r.width||!r.height)return;const lab=el.closest('label');if(lab&&lab!==el){const rl=lab.getBoundingClientRect();if(rl.height>r.height)r=rl;}
    if(r.height<44||r.width<44)out.push(`${el.tagName.toLowerCase()}${el.dataset.act?'['+el.dataset.act+']':''} ${Math.round(r.width)}×${Math.round(r.height)}`);});return out;})).forEach(x=>petits.push(nom+' : '+x));};
  for(const r of ['semaine','mois','seance','exos','historique','poids','reglages','seances']){await p.goto(U+'#'+r);await p.waitForTimeout(250);await audit(r);}
  await p.goto(U+'#seance');await p.click('.scard[data-type="A"]');await p.waitForSelector('.card.ex');await audit('séance');
  await p.click('[data-act="finish"]');await p.waitForTimeout(150);await audit('fin de séance');await p.click('#sheet [data-act="close"]');
  await p.evaluate(()=>exInfo('dc'));await p.waitForTimeout(150);await audit('fiche');
  await p.evaluate(()=>{closeModal();daySheet(dkey());});await p.waitForTimeout(150);await audit('journée');
  await p.evaluate(()=>{closeModal();ouvrirEditeur(nouveauModele());});await p.waitForTimeout(250);await audit('éditeur');
  assert.deepEqual([...new Set(petits)],[]);await p.context().close();
});
etape('Écran allumé : réglage visible seulement si l\'appareil le permet',async()=>{
  const p=await page();await p.goto(U+'#reglages');await p.waitForSelector('#donnees');
  const dispo=await p.evaluate(()=>'wakeLock' in navigator);
  assert.equal(!!(await p.$('[data-act="ecran"]')),dispo);
  if(dispo){assert.equal(await p.getAttribute('[data-act="ecran"]','aria-checked'),'true','activé par défaut');
    await p.click('[data-act="ecran"]');assert.equal(await p.evaluate(()=>S.settings.ecranAllume),false);}
  await p.evaluate(()=>{delete navigator.__proto__.wakeLock;});await p.evaluate(()=>render());
  assert.equal(await p.$('[data-act="ecran"]'),null,'caché sans Screen Wake Lock');
  await p.context().close();
});

(async()=>{
  await new Promise(r=>serveur.listen(PORT,r));nav=await chromium.launch();let ok=0;
  for(const e of etapes){try{await e.fn();ok++;console.log('  ✓ '+e.nom);}catch(err){console.log('  ✗ '+e.nom+'\n      '+String(err.message).split('\n').slice(0,6).join('\n      '));}}
  console.log(`\n${ok}/${etapes.length} parcours réussis`);await nav.close();serveur.close();process.exit(ok===etapes.length?0:1);
})();
