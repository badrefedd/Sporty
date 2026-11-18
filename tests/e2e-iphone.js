/* Parcours complets dans un navigateur, en iPhone simulé.
   Nécessite Playwright. Lancer : node tests/e2e-iphone.js
   (démarre son propre petit serveur sur le port 8766). */
const {chromium,devices}=require('playwright');
const http=require('http'),fs=require('fs'),path=require('path'),assert=require('assert');
const RACINE=path.join(__dirname,'..'),PORT=8766,U=`http://localhost:${PORT}/`;
const TYPES={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.webmanifest':'application/manifest+json','.svg':'image/svg+xml','.png':'image/png','.woff2':'font/woff2'};
const serveur=http.createServer((req,res)=>{
  let f=path.join(RACINE,decodeURIComponent(req.url.split('?')[0]));
  if(f.endsWith('/'))f+='index.html';
  if(!f.startsWith(RACINE)||!fs.existsSync(f)){res.writeHead(404);return res.end();}
  res.writeHead(200,{'Content-Type':TYPES[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(res);
});
/* « Terminer la séance » : s'il reste des séries non validées, on choisit « Terminer sans elles ». */
async function terminer(p){await p.click('[data-act="finish"]');await p.waitForTimeout(150);const b=await p.$('#sheet [data-act="finsans"]');if(b)await b.click();await p.waitForSelector('#sheet h2:has-text("terminée")');}
const etapes=[];const etape=(nom,fn)=>etapes.push({nom,fn});

etape('Créer une séance perso dans l\'éditeur (refus puis enregistrement)',async p=>{
  await p.goto(U+'#seances');await p.waitForSelector('.mseance');
  await p.click('[data-act="newseance"]');await p.waitForSelector('#ed-nom');
  await p.click('[data-act="edsave"]');
  assert.match(await p.textContent('#ed-err'),/Donne un nom/);
  await p.fill('#ed-nom','Bras');await p.fill('#ed-badge','B');
  await p.click('[data-act="edadd"]');await p.fill('#pickq','curl barre ez');await p.click('#pickList [data-act="pick"]');
  await p.click('[data-act="edadd"]');await p.fill('#pickq','corde');await p.click('#pickList [data-act="pick"]');
  await p.click('[data-act="edsave"]');
  assert.match(await p.textContent('#ed-err'),/« B » est déjà pris/);
  await p.fill('#ed-badge','c');await p.click('.pastille.c-rose');
  await p.fill('[data-edi="0"][data-edf="sets"]','4');await p.selectOption('[data-edi="0"][data-edf="rest"]','90');
  await p.click('[data-act="edup"][data-i="1"]');                    // corde en premier
  await p.click('label.opt:has(#ed-tapis)');                          // décoche le tapis
  await p.click('[data-act="edsave"]');await p.waitForSelector('.mseance');
  const m=await p.evaluate(()=>S.modeles[0]);
  assert.equal(m.badge,'C');assert.equal(m.couleur,'rose');assert.equal(m.tapis,false);
  assert.deepEqual(m.ex.map(l=>[l.id,l.sets,l.rest]),[['tri_corde',3,90],['curl_ez',4,90]]);
});
etape('Démarrer la séance perso depuis l\'onglet Séance, la terminer, voir l\'historique',async p=>{
  await p.goto(U+'#seance');await p.waitForSelector('.scard');
  const id=await p.evaluate(()=>S.modeles[0].id);
  await p.click(`.scard[data-type="${id}"]`);await p.waitForSelector('#ex-curl_ez');
  assert.match(await p.textContent('.session-head'),/Bras/);
  assert.equal(await p.$$eval('#ex-curl_ez .set',a=>a.length),4);
  await p.fill('#w-curl_ez-0','20');await p.click('#ex-curl_ez [data-act="toggleset"][data-i="0"]');await p.click('[data-act="timerstop"]');
  await terminer(p);await p.waitForSelector('#sheet h2');
  assert.match(await p.textContent('#sheet h2'),/Bras terminée/);
  await p.click('#sheet [data-act="close"]');
  await p.goto(U+'#historique');await p.waitForSelector('.hist-item');
  assert.match(await p.textContent('.hist-item'),/Bras/);
});
etape('Renommer le modèle : l\'historique garde « Bras »',async p=>{
  await p.goto(U+'#seances');const id=await p.evaluate(()=>S.modeles[0].id);
  await p.click(`[data-act="editseance"][data-m="${id}"]`);await p.fill('#ed-nom','Gros bras');await p.click('[data-act="edsave"]');
  await p.goto(U+'#historique');await p.waitForSelector('.hist-item');
  assert.match(await p.textContent('.hist-item'),/Bras/);assert.doesNotMatch(await p.textContent('.hist-item'),/Gros bras/);
});
etape('Séance libre → « Enregistrer comme séance perso »',async p=>{
  await p.goto(U+'#seance');await p.click('.scard[data-type="L"]');await p.waitForSelector('#pickq');
  await p.fill('#pickq','rowing assis à la poulie');await p.click('#pickList [data-act="pick"]');await p.waitForSelector('#ex-row');
  await p.fill('#w-row-0','40');await p.click('#ex-row [data-act="toggleset"][data-i="0"]');await p.click('[data-act="timerstop"]');
  await p.fill('#w-row-1','40');await p.click('#ex-row [data-act="toggleset"][data-i="1"]');await p.click('[data-act="timerstop"]');
  await terminer(p);await p.click('[data-act="saveasperso"]');await p.waitForSelector('#ed-nom');
  assert.equal(await p.inputValue('[data-edi="0"][data-edf="sets"]'),'2');
  await p.fill('#ed-nom','Dos rapide');await p.click('[data-act="edsave"]');await p.waitForSelector('.mseance');
  assert.ok(await p.evaluate(()=>S.modeles.some(m=>m.nom==='Dos rapide')));
});
etape('Historique → « Refaire cette séance »',async p=>{
  await p.goto(U+'#historique');await p.click('.hist-item [data-act="togglehist"]');
  await p.click('[data-act="refaire"]');await p.waitForSelector('#ed-nom');
  assert.match(await p.inputValue('#ed-nom'),/\(copie\)/);
  await p.click('[data-act="edcancel"]');
});
etape('Prévoir une séance un jour, la déplacer, la retirer',async p=>{
  await p.goto(U+'#semaine');await p.waitForSelector('.week');
  const demain=await p.evaluate(()=>dkey(addDays(new Date(),1))),apres=await p.evaluate(()=>dkey(addDays(new Date(),2)));
  await p.click(`.day[data-date="${demain}"]`);await p.click('[data-act="prevoir"]');await p.click('[data-act="prevoirpick"][data-m="B"]');
  await p.waitForSelector('.prevu');
  const plan=await p.evaluate(()=>S.plans[0]);assert.equal(plan.date,demain);
  await p.click(`[data-act="itpanel"][data-it="p:${plan.id}"]`);await p.click(`[data-act="itmove"][data-it="p:${plan.id}"][data-to="${apres}"]`);
  assert.equal(await p.evaluate(()=>S.plans[0].date),apres);
  await p.click(`[data-act="itdel"][data-it="p:${plan.id}"]`);
  assert.equal(await p.evaluate(()=>S.plans.length),0);
  await p.click('#sheet [data-act="close"]');
});
etape('Semaine : A pas faite lundi → « La placer aujourd\'hui »',async p=>{
  // date fixée au mardi 17 novembre 2026 (plan lundi + mercredi)
  await p.goto(U+'#semaine');await p.waitForSelector('.week');
  assert.match(await p.textContent('.nudge.manquee'),/Séance A pas faite lundi/);
  await p.click('.nudge.manquee [data-act="itmove"]');
  assert.equal(await p.$('.nudge.manquee'),null);
  assert.match(await p.textContent('.hero .eyebrow'),/prévue aujourd'hui/);
  assert.ok(await p.$('[data-act="semdefaut"]'),'bouton « Remettre la semaine par défaut » visible');
});
etape('Semaine : déplacer A à jeudi, puis retirer B de mercredi, depuis la journée',async p=>{
  await p.click('.day[data-date="2026-11-17"]');await p.waitForSelector('.prevu');
  assert.match(await p.textContent('.prevu'),/déplacée \(prévue lundi\)/);
  assert.match(await p.textContent('#sheet'),/ne concerne que cette semaine/);
  await p.click('.prevu [data-act="itpanel"]');await p.click('.itpanel:not([hidden]) [data-act="itmove"][data-to="2026-11-19"]');
  await p.waitForTimeout(150);await p.click('#sheet [data-act="close"]');
  assert.match(await p.textContent('.hero .eyebrow'),/prévue jeudi/);
  const jeu=await p.$$eval('.day[data-date="2026-11-19"] .badge',a=>a.map(x=>x.textContent+':'+x.className));
  assert.ok(jeu.some(x=>x.startsWith('A:')&&/out/.test(x)),'A en contour jeudi : '+jeu);
  assert.equal(await p.$$eval('.day[data-date="2026-11-16"] .badge',a=>a.map(x=>x.textContent).join()),'–','lundi n\'affiche plus rien');
  await p.click('.day[data-date="2026-11-18"]');await p.waitForSelector('.prevu');
  await p.click('.prevu [data-act="itdel"]');await p.waitForTimeout(150);await p.click('#sheet [data-act="close"]');
  assert.ok(!(await p.$$eval('.day[data-date="2026-11-18"] .badge',a=>a.map(x=>x.textContent))).includes('B'));
  assert.match(await p.textContent('#view'),/Objectif de la semaine : 0\/1/);
});
etape('Mois : mêmes actions, puis « Remettre la semaine par défaut »',async p=>{
  await p.goto(U+'#mois');await p.waitForSelector('.cal');
  await p.click('.cal-cell[data-date="2026-11-19"]');await p.waitForSelector('.prevu');
  await p.click('.prevu [data-act="itpanel"]');await p.click('.itpanel:not([hidden]) [data-act="itmove"][data-to="2026-11-21"]');
  await p.waitForTimeout(150);await p.click('#sheet [data-act="close"]');
  assert.match(await p.textContent('.cal-cell[data-date="2026-11-21"]'),/A/);
  await p.goto(U+'#semaine');await p.click('[data-act="semdefaut"]');await p.click('[data-act="confirmok"]');await p.waitForTimeout(150);
  assert.equal(await p.$('[data-act="semdefaut"]'),null);
  assert.equal(await p.evaluate(()=>S.exceptions.length),0);
  assert.match(await p.textContent('.nudge.manquee'),/Séance A pas faite lundi/);
});
etape('« Changer mes jours habituels » sur A → Mes jours de salle',async p=>{
  await p.click('.day[data-date="2026-11-18"]');await p.waitForSelector('.prevu');
  await p.click('.prevu [data-act="habituels"]');await p.waitForSelector('#jours-salle');
  assert.equal(await p.evaluate(()=>location.hash),'#reglages');
});
etape('Coller un code (texte autour, guillemets typographiques, exercice introuvable) puis « Enregistrer et placer »',async p=>{
  await p.goto(U+'#seance');await p.click('[data-act="coller"]');await p.waitForSelector('#imptxt');
  await p.fill('#imptxt',`Voici :\nSPORTY-SEANCE-V1\n{ “nom”: “Bras express”, "badge": "C", "couleur": "violet", "date": "2026-11-20",\n "exercices": [ {"id":"curl_ez","series":3,"reps":"10-12","repos":90}, {"nom":"Planche lestée","series":3,"duree":"30-45"} ] }\nBonne séance`);
  await p.click('[data-act="impread"]');await p.waitForSelector('.imp-l.ko');
  assert.match(await p.textContent('#impzone'),/« C » est déjà pris par « Gros bras » : la séance prend « [A-Z0-9]+ »/);
  assert.ok(await p.$eval('[data-act="impsave"]',b=>b.disabled));
  await p.click('[data-act="impbanque"]');await p.fill('#pickq','gainage (planche)');await p.click('#pickList [data-act="pick"]');
  await p.waitForSelector('.imp-l.ok >> nth=1');
  assert.equal(await p.inputValue('#impdate'),'2026-11-20');
  await p.click('[data-act="impplace"]');await p.waitForTimeout(200);
  const r=await p.evaluate(()=>({m:S.modeles.find(m=>m.nom==='Bras express'),p:S.plans[0]}));
  assert.deepEqual(r.m.ex.map(l=>l.id),['curl_ez','planche']);assert.equal(r.p.date,'2026-11-20');assert.equal(r.p.modele,r.m.id);
});
etape('Code illisible : message, pas d\'écran blanc',async p=>{
  await p.goto(U+'#seances');await p.click('[data-act="coller"]');await p.waitForSelector('#imptxt');
  await p.fill('#imptxt','bonjour, ceci n\'est pas un code');await p.click('[data-act="impread"]');
  assert.match(await p.textContent('#impzone'),/Ce code n'est pas une séance Sporty valide/);
  await p.click('#sheet [data-act="close"]');
});
etape('Copier le code d\'une séance',async p=>{
  await p.goto(U+'#seances');const id=await p.evaluate(()=>S.modeles[0].id);
  await p.click(`[data-act="copycode"][data-m="${id}"]`);await p.waitForTimeout(150);
  const txt=await p.evaluate(()=>navigator.clipboard.readText());
  assert.ok(txt.startsWith('SPORTY-SEANCE-V1'));assert.match(txt,/"nom": "Gros bras"/);
});
etape('Supprimer une séance perso (avec confirmation) ; l\'historique reste',async p=>{
  await p.goto(U+'#seances');const id=await p.evaluate(()=>S.modeles[0].id);
  await p.click(`[data-act="delseance"][data-m="${id}"]`);await p.click('[data-act="confirmok"]');await p.waitForTimeout(150);
  assert.ok(!(await p.evaluate(i=>S.modeles.some(m=>m.id===i),id)));
  await p.goto(U+'#historique');await p.waitForSelector('.hist-item');
  assert.ok((await p.$$eval('.hist-item b',a=>a.map(x=>x.textContent))).includes('Bras'));
  await p.goto(U+'#seances');
  assert.equal(await p.$$eval('.mseance [data-act="delseance"][data-m="A"]',a=>a.length),0);
});

(async()=>{
  await new Promise(r=>serveur.listen(PORT,r));
  const b=await chromium.launch();
  const c=await b.newContext({...devices['iPhone 13'],permissions:['clipboard-read','clipboard-write']});
  await c.clock.setFixedTime(new Date('2026-11-17T10:00:00'));
  const p=await c.newPage();const erreurs=[];
  p.on('pageerror',e=>erreurs.push(e.message));p.on('console',m=>{if(m.type()==='error')erreurs.push(m.text());});
  let ok=0;
  for(const e of etapes){
    try{await e.fn(p);ok++;console.log('  ✓ '+e.nom);}
    catch(err){console.log('  ✗ '+e.nom+'\n      '+String(err.message).split('\n').join('\n      '));if(process.env.CAPTURE)await p.screenshot({path:process.env.CAPTURE});break;}
  }
  if(erreurs.length)console.log('Erreurs JavaScript :',erreurs);
  console.log(`\n${ok}/${etapes.length} parcours réussis`);
  await b.close();serveur.close();
  process.exit(ok===etapes.length&&!erreurs.length?0:1);
})();
