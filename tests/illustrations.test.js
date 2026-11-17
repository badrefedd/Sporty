/* Tests des illustrations (photos animées, images fixes, mes photos).
   Lancer : node tests/illustrations.test.js */
const assert=require('assert'),fs=require('fs'),path=require('path');
const {ouvrirAppli}=require('./appli');
const RACINE=path.join(__dirname,'..'),DOSSIER=path.join(RACINE,'images','exos');
const A=require('../outils/animations.json');
const tests=[];const test=(nom,fn)=>tests.push({nom,fn});
const ids=Object.keys(A).filter(k=>!k.startsWith('_'));

test('chaque exercice « exacte » ou « proche » a ses images sur le disque (2 si animée, 1 si fixe)',()=>{
  for(const id of ids){const [src,t,,aff]=A[id];
    if(t==='aucune'){assert.ok(!fs.existsSync(path.join(DOSSIER,id+'-0.webp')),id+' : image alors que « aucune »');continue;}
    assert.ok(src,id+' : pas de source');
    assert.ok(fs.existsSync(path.join(DOSSIER,id+'-0.webp')),id+'-0.webp manquant');
    if(aff==='animée')assert.ok(fs.existsSync(path.join(DOSSIER,id+'-1.webp')),id+'-1.webp manquant');
    else{assert.match(aff,/^fixe:[01]$/,id);assert.ok(!fs.existsSync(path.join(DOSSIER,id+'-1.webp')),id+' : fixe mais a une 2e image');}
  }
});
test('aucune image ne dépasse 30 Ko, et rien d\'autre dans le dossier',()=>{
  const fichiers=fs.readdirSync(DOSSIER);
  for(const f of fichiers){const o=fs.statSync(path.join(DOSSIER,f)).size;assert.ok(o<=30*1024,`${f} : ${o} octets`);}
  const attendus=new Set();ids.forEach(id=>{if(A[id][1]!=='aucune'){attendus.add(id+'-0.webp');if(A[id][3]==='animée')attendus.add(id+'-1.webp');}});
  assert.deepEqual(fichiers.filter(f=>!attendus.has(f)),[],'fichiers en trop');
  assert.equal(fichiers.length,attendus.size);
});
test('js/illustrations.js correspond à ANIMATIONS (types, fixes, différences)',async()=>{
  const a=await ouvrirAppli();const IL=a.run('ILLUS');
  for(const id of ids){const [,t,d,aff]=A[id];
    if(t==='aucune'){assert.ok(!IL[id],id);continue;}
    assert.equal(IL[id].t,t,id);assert.equal(!!IL[id].fixe,aff!=='animée',id);
    if(t==='proche')assert.equal(IL[id].d,d,id);
    assert.ok(IL[id].w>0&&IL[id].h>0,id+' : taille');
  }
});
test('chaque exercice a un visuel (photo, bonhomme ou schéma), y compris perso, masqué et supprimé',async()=>{
  const a=await ouvrirAppli();
  a.run(`S.settings.custom=[{id:'c_test',name:'Machine de ma salle',group:'dos',equip:'Machine',mode:'kg'}];S.settings.hidden=['dc','lat_machine'];buildEx();`);
  const tous=a.run('Object.keys(EX)');
  for(const id of tous){const t=a.run(`typeVisuel('${id}')`);assert.ok(['photo','bonhomme','schema','perso'].includes(t),id+' : '+t);
    const h=a.run(`illuHTML('${id}','grand')`);assert.ok(h.length>20,id+' : visuel vide');}
  assert.equal(a.run(`typeVisuel('c_test')`),'schema');
  assert.equal(a.run(`typeVisuel('dc')`),'photo','un exercice masqué garde son visuel');
  for(const id of ['rotation','skierg','airbike','burpees','wall_ball'])assert.equal(a.run(`typeVisuel('${id}')`),'schema',id);
  // exercice supprimé (perso retiré) : pas de plantage
  a.run(`S.settings.custom=[];buildEx();`);
  assert.equal(a.run(`typeVisuel('c_test')`),'aucun');assert.equal(a.run(`illuHTML('c_test','grand')`),'');
});
test('un exercice « fixe » n\'est jamais animé',async()=>{
  const a=await ouvrirAppli();
  for(const id of ids.filter(id=>(A[id][3]||'').startsWith('fixe'))){
    for(const mode of ['grand','vignette']){const h=a.run(`illuHTML('${id}','${mode}')`);
      assert.ok(!/class="[^"]*\banim\b/.test(h),`${id} (${mode}) animé`);assert.equal((h.match(/<img /g)||[]).length,1,id);}
    assert.equal(a.run(`estAnimee('${id}')`),false,id);
  }
  for(const id of ids.filter(id=>A[id][3]==='animée')){const h=a.run(`illuHTML('${id}','grand')`);assert.match(h,/class="illu anim"/,id);assert.equal((h.match(/<img /g)||[]).length,2,id);}
});
test('« Réduire les animations » : un exercice fixe n\'a pas « Départ / Arrivée »',async()=>{
  const a=await ouvrirAppli();
  const fixe=a.run(`illuHTML('planche','grand')`),anim=a.run(`illuHTML('dc','grand')`);
  assert.doesNotMatch(fixe,/Départ|Arrivée/);assert.match(anim,/<figcaption>Départ<\/figcaption>/);assert.match(anim,/<figcaption>Arrivée<\/figcaption>/);
  const css=fs.readFileSync(path.join(RACINE,'css','styles.css'),'utf8');
  const bloc=css.slice(css.lastIndexOf('@media (prefers-reduced-motion:reduce){\n  .illu'));
  assert.match(bloc,/\.illu\.anim:not\(\.vignette\)\{display:grid/,'côte à côte seulement pour les animées');
  assert.doesNotMatch(bloc,/\.illu\.fixe/,'rien de spécial pour les fixes');
});
test('la liste de la banque n\'anime jamais (vignette fixe, chargement différé)',async()=>{
  const a=await ouvrirAppli();
  const h=a.run(`illuHTML('dc','liste')`);assert.match(h,/^<img class="illu-liste" src="images\/exos\/dc-0.webp"/);assert.match(h,/loading="lazy"/);
  assert.match(a.run(`illuHTML('dc','grand')`),/width="480" height="\d+"/,'taille fixe');
  assert.match(a.run(`illuHTML('lat_machine','grand')`),/aria-label="Animation : Élévations latérales machine"/);
});
test('mes photos : remplacent l\'illustration, puis « Revenir à l\'illustration d\'origine »',async()=>{
  const a=await ouvrirAppli();
  const P='data:image/jpeg;base64,'+'A'.repeat(400);
  await a.run(`enregistrerPhotos('dc',['${P}','${P}'])`);
  assert.equal(a.run(`typeVisuel('dc')`),'perso');assert.equal(a.run(`estAnimee('dc')`),true);
  assert.match(a.run(`illuNote('dc')`),/Tes photos/);
  await a.run(`enregistrerPhotos('c1',['${P}'])`);  // une seule photo : fixe
  await a.attendre();const b=await ouvrirAppli(a.disque);
  assert.equal(b.run(`S.photos.dc.length`),2,'gardées après réouverture');
  await b.run(`supprimerPhotos('dc')`);assert.equal(b.run(`typeVisuel('dc')`),'photo');
});
test('sauvegarde et import, avec et sans photos',async()=>{
  const a=await ouvrirAppli();
  const P='data:image/jpeg;base64,'+'B'.repeat(300);
  await a.run(`enregistrerPhotos('presse',['${P}','${P}'])`);
  const avec=a.run('contenuSauvegarde(true)'),sans=a.run('contenuSauvegarde(false)');
  assert.equal(JSON.parse(avec).photos.presse.length,2);assert.equal(JSON.parse(sans).photos,undefined);
  const imp=async(app,txt,rempl)=>{app.run(`applyTheme=()=>{};importEnAttente=lireSauvegarde(${JSON.stringify(txt)});`);await app.run(`appliquerImport(${rempl})`);};
  const b=await ouvrirAppli();await imp(b,avec,true);
  assert.equal(b.run(`S.photos.presse.length`),2);
  await b.attendre();const c=await ouvrirAppli(b.disque);assert.equal(c.run(`typeVisuel('presse')`),'perso');
  await imp(c,sans,true);assert.equal(c.run(`typeVisuel('presse')`),'perso','un fichier sans photos ne les efface pas');
  // une photo invalide dans le fichier est ignorée
  const bad=JSON.stringify({app:'sporty',version:6,seances:[],photos:{dc:['javascript:alert(1)'],presse:[P]}});
  const d=await ouvrirAppli();await imp(d,bad,false);assert.equal(d.run(`!!S.photos.dc`),false);assert.equal(d.run(`S.photos.presse.length`),1);
  // une ancienne sauvegarde (v5, sans photos) s'importe toujours
  const v5=JSON.stringify({app:'sporty',version:5,seances:[],pesees:[{date:'2026-10-01',kg:87}],activite:[],reglages:{plan:'1'},modeles:[],prevues:[],exceptions:[]});
  const e=await ouvrirAppli();await imp(e,v5,true);assert.equal(e.run('S.weights.length'),1);assert.deepEqual(e.run('S.photos'),{});
});
test('hors connexion : les images de mes séances (A, B, perso) sont dans la liste à garder',async()=>{
  const a=await ouvrirAppli();
  const u=a.run('urlsSeances()');
  for(const l of a.run(`modeleAB('A').ex.concat(modeleAB('B').ex)`))if(a.run(`typeVisuel('${l.id}')`)==='photo')assert.ok(u.includes(`images/exos/${l.id}-0.webp`),l.id);
  assert.ok(u.includes('images/exos/tapis-0.webp'));assert.ok(!u.includes('images/exos/tapis-1.webp'),'tapis : image fixe');
  assert.ok(!u.includes('images/exos/sled-0.webp'),'pas les exercices hors séances');
  a.run(`enregistrerModele(nouveauModele({nom:'Bras',ex:[ligneDefaut('curl_ez')]}))`);
  assert.ok(a.run('urlsSeances()').includes('images/exos/curl_ez-1.webp'));
});

(async()=>{
  let ok=0;const ko=[];
  for(const t of tests){try{await t.fn();ok++;console.log('  ✓ '+t.nom);}catch(e){ko.push(t.nom);console.log('  ✗ '+t.nom+'\n      '+String(e.message).split('\n').join('\n      '));}}
  console.log(`\n${ok}/${tests.length} tests réussis`);if(ko.length)process.exit(1);
})();
