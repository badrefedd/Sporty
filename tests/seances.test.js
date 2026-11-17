/* Tests des séances perso, des séances prévues, du code SPORTY-SEANCE-V1 et de la sauvegarde.
   Lancer : node tests/seances.test.js */
const assert=require('assert');
const {ouvrirAppli,nouveauDisque}=require('./appli');

const tests=[];
const test=(nom,fn)=>tests.push({nom,fn});

/* Une séance perso valable, prête à enregistrer. */
const BRAS=`nouveauModele({nom:'Bras',badge:'C',couleur:'bleu',desc:'Biceps et triceps',tapis:false,
  ex:[Object.assign(ligneDefaut('curl_ez'),{sets:4,min:10,max:12,rest:90}),ligneDefaut('tri_corde')]})`;

/* ---------------- F1. Créer, modifier, dupliquer, supprimer ---------------- */
test('F1 · créer une séance perso',async()=>{
  const a=await ouvrirAppli();
  const r=a.run(`enregistrerModele(${BRAS})`);
  assert.ok(r.ok,r.erreur);
  const m=a.run(`modeleParId(${JSON.stringify(r.id)})`);
  assert.equal(m.nom,'Bras');assert.equal(m.badge,'C');assert.equal(m.couleur,'bleu');
  assert.deepEqual(m.ex.map(l=>l.id),['curl_ez','tri_corde']);
  assert.equal(m.ex[0].sets,4);assert.equal(m.ex[0].rest,90);
  // toujours là après fermeture et réouverture de l'appli
  await a.attendre();
  const b=await ouvrirAppli(a.disque);
  assert.equal(b.run(`modeleParId(${JSON.stringify(r.id)}).nom`),'Bras');
});
test('F1 · modifier une séance perso (nom, ordre, valeurs)',async()=>{
  const a=await ouvrirAppli();
  const id=a.run(`enregistrerModele(${BRAS}).id`);
  const r=a.run(`(()=>{const m=clone(modeleParId('${id}'));m.nom='Bras costauds';m.ex.reverse();m.ex[0].sets=5;return enregistrerModele(m);})()`);
  assert.ok(r.ok,r.erreur);assert.equal(r.id,id);
  const m=a.run(`modeleParId('${id}')`);
  assert.equal(m.nom,'Bras costauds');assert.deepEqual(m.ex.map(l=>l.id),['tri_corde','curl_ez']);assert.equal(m.ex[0].sets,5);
  assert.equal(a.run('modelesPerso().length'),1);
});
test('F1 · modifier A puis revenir à l\'origine',async()=>{
  const a=await ouvrirAppli();
  const r=a.run(`(()=>{const m=modeleAB('A');m.ex=m.ex.filter(l=>l.id!=='presse');m.tapis=false;return enregistrerModele(m);})()`);
  assert.ok(r.ok,r.erreur);
  assert.ok(!a.run(`modeleAB('A').ex.some(l=>l.id==='presse')`));
  assert.equal(a.run(`modeleAB('A').tapis`),false);
  a.run(`reinitialiserAB('A')`);
  assert.ok(a.run(`modeleAB('A').ex.some(l=>l.id==='presse')`));
});
test('F1 · ancien format de programme (liste d\'ids) toujours lu',async()=>{
  const a=await ouvrirAppli();
  a.run(`S.settings.programme={A:['dc','presse']}`);
  assert.deepEqual(a.run(`modeleAB('A').ex.map(l=>l.id)`),['dc','presse']);
});
test('F1 · dupliquer A (« A sans presse »)',async()=>{
  const a=await ouvrirAppli();
  const m=a.run(`dupliquerModele('A')`);
  assert.equal(m.id,null);assert.equal(m.nom,'Séance A (copie)');assert.notEqual(m.badge,'A');
  const r=a.run(`(()=>{const m=dupliquerModele('A');m.nom='A sans presse';m.ex=m.ex.filter(l=>l.id!=='presse');return enregistrerModele(m);})()`);
  assert.ok(r.ok,r.erreur);
  assert.equal(a.run(`modeleParId('${r.id}').ex.length`),a.run(`modeleAB('A').ex.length`)-1);
  assert.ok(a.run(`modeleAB('A').ex.some(l=>l.id==='presse')`),'A ne doit pas changer');
});
test('F1 · supprimer une séance perso ; A et B refusées',async()=>{
  const a=await ouvrirAppli();
  const id=a.run(`enregistrerModele(${BRAS}).id`);
  a.run(`prevoir('${id}',dkey())`);
  assert.ok(a.run(`supprimerModele('${id}').ok`));
  assert.equal(a.run(`modeleParId('${id}')`),null);
  assert.equal(a.run(`S.plans.length`),0,'ses dates prévues disparaissent');
  assert.ok(a.run(`supprimerModele('A').erreur`));assert.ok(a.run(`supprimerModele('B').erreur`));
});

/* ---------------- F2. Refus ---------------- */
test('F2 · badge en double refusé',async()=>{
  const a=await ouvrirAppli();
  a.run(`enregistrerModele(${BRAS})`);
  const r=a.run(`enregistrerModele(Object.assign(${BRAS},{nom:'Autre'}))`);
  assert.match(r.erreur,/déjà pris par « Bras »/);
  assert.match(a.run(`enregistrerModele(Object.assign(${BRAS},{badge:'a'})).erreur`),/déjà pris par « Séance A »/);
  assert.match(a.run(`enregistrerModele(Object.assign(${BRAS},{badge:'L'})).erreur`),/réservé à la séance libre/);
  assert.match(a.run(`enregistrerModele(Object.assign(${BRAS},{badge:'5'})).erreur`),/réservé au Five/);
  assert.match(a.run(`enregistrerModele(Object.assign(${BRAS},{badge:'ABC'})).erreur`),/1 ou 2 caractères/);
  assert.equal(a.run('modelesPerso().length'),1);
});
test('F2 · séance sans nom ou sans exercice refusée',async()=>{
  const a=await ouvrirAppli();
  assert.match(a.run(`enregistrerModele(Object.assign(${BRAS},{nom:'   '})).erreur`),/Donne un nom/);
  assert.match(a.run(`enregistrerModele(Object.assign(${BRAS},{ex:[]})).erreur`),/au moins un exercice/);
  assert.match(a.run(`(()=>{const m=modeleAB('B');m.ex=[];return enregistrerModele(m);})().erreur`),/au moins un exercice/);
  assert.equal(a.run('modelesPerso().length'),0);
});
test('F2 · badge proposé automatiquement : C, puis D',async()=>{
  const a=await ouvrirAppli();
  assert.equal(a.run('nouveauModele().badge'),'C');
  a.run(`enregistrerModele(${BRAS})`);
  assert.equal(a.run('nouveauModele().badge'),'D');
});

/* ---------------- F3. Démarrer et terminer ---------------- */
test('F3 · démarrer une séance perso, la terminer, l\'historique',async()=>{
  const a=await ouvrirAppli();
  const id=a.run(`enregistrerModele(${BRAS}).id`);
  const d=a.run(`demarrerSeance('${id}')`);
  assert.deepEqual(d.list,['curl_ez','tri_corde'],'pas de tapis : option décochée');
  assert.equal(d.sets.curl_ez.length,4,'4 séries comme dans le modèle');
  assert.equal(a.run(`rx('curl_ez').rest`),90);assert.equal(a.run(`rx('curl_ez').max`),12);
  a.run(`S.draft.sets.curl_ez.forEach(s=>{s.w='20';s.r='12';s.done=true;});S.draft.sets.tri_corde[0].w='25';S.draft.sets.tri_corde[0].done=true;`);
  const r=a.run('terminerSeance()');
  assert.ok(!r.erreur,r.erreur);
  assert.equal(r.n,5);
  const ses=a.run(`S.sessions[S.sessions.length-1]`);
  assert.equal(ses.type,id);
  assert.deepEqual(ses.modele,{id,nom:'Bras',badge:'C',couleur:'bleu'});
  assert.equal(ses.ex.curl_ez.length,4);
  assert.equal(a.run('S.draft'),null);
  // la séance compte dans le mois et apparaît dans la semaine
  assert.ok(a.run(`semaineItems(weekStart()).some(x=>x.ses&&x.ses.id==='${ses.id}'&&x.etat==='fait')`));
  // progression : la prochaine fois, Sporty propose de monter (haut de fourchette atteint sur les 4 séries)
  a.run(`demarrerSeance('${id}')`);
  assert.equal(a.run(`suggest('curl_ez').up`),true);
  // la séance est toujours là après réouverture
  await a.attendre();
  const b=await ouvrirAppli(a.disque);
  assert.equal(b.run(`S.sessions.find(s=>s.id==='${ses.id}').modele.nom`),'Bras');
});
test('F3 · séance avec tapis : 20 min ajoutées à la fin',async()=>{
  const a=await ouvrirAppli();
  const id=a.run(`enregistrerModele(Object.assign(${BRAS},{tapis:true})).id`);
  assert.equal(a.run(`demarrerSeance('${id}').list.slice(-1)[0]`),'tapis');
});
test('F3 · une séance perso faite en plus n\'entre pas dans l\'objectif ; avec des jours, si',async()=>{
  const a=await ouvrirAppli();
  const id=a.run(`enregistrerModele(${BRAS}).id`);
  const base=a.run('objectifSemaine(weekStart()).total');
  const wd=a.run('new Date().getDay()||7');
  a.run(`(()=>{const m=clone(modeleParId('${id}'));m.jours=[${wd}];enregistrerModele(m);})()`);
  assert.equal(a.run('objectifSemaine(weekStart()).total'),base+1);
});

/* ---------------- F4. Renommer puis supprimer le modèle ---------------- */
test('F4 · renommer puis supprimer le modèle ne change pas l\'historique',async()=>{
  const a=await ouvrirAppli();
  const id=a.run(`enregistrerModele(${BRAS}).id`);
  a.run(`demarrerSeance('${id}');S.draft.sets.curl_ez[0].done=true;terminerSeance();`);
  const sid=a.run('S.sessions[0].id');
  a.run(`(()=>{const m=clone(modeleParId('${id}'));m.nom='Gros bras';m.badge='G';m.couleur='rose';enregistrerModele(m);})()`);
  assert.deepEqual(a.run(`infoSeance(S.sessions[0])`),{id,nom:'Bras',badge:'C',couleur:'bleu'});
  a.run(`supprimerModele('${id}')`);
  assert.deepEqual(a.run(`infoSeance(S.sessions[0])`),{id,nom:'Bras',badge:'C',couleur:'bleu'});
  assert.equal(a.run(`S.sessions[0].id`),sid);
  assert.equal(a.run(`S.sessions[0].ex.curl_ez.length`),1);
  assert.equal(a.run(`exLabel('curl_ez',S.sessions[0])`),'Curl barre EZ');
});
test('F4 · anciennes séances sans copie : A, B et libre gardent leur nom',async()=>{
  const a=await ouvrirAppli();
  assert.equal(a.run(`infoSeance({type:'A'}).nom`),'Séance A');
  assert.equal(a.run(`infoSeance({type:'L'}).badge`),'L');
  assert.equal(a.run(`infoSeance({type:'five'}).badge`),'5');
});

/* ---------------- F5. Enregistrer une séance libre comme séance perso ---------------- */
test('F5 · « Enregistrer comme séance perso » depuis une séance libre',async()=>{
  const a=await ouvrirAppli();
  a.run(`demarrerSeance('L');
    ['row','dc_halt','lat'].forEach(id=>{S.draft.list.push(id);S.draft.sets[id]=initSets(id);});
    S.draft.sets.row.forEach(s=>s.done=true);              // 3 séries faites
    S.draft.sets.dc_halt[0].done=true;S.draft.sets.dc_halt[1].done=true; // 2 sur 3
    S.draft.sets.lat[0].done=true;`);
  const r=a.run('terminerSeance()');assert.ok(!r.erreur,r.erreur);
  assert.equal(r.ses.type,'L');
  const m=a.run(`modeleDepuisSeance(S.sessions[0],'')`);
  assert.deepEqual(m.ex.map(l=>[l.id,l.sets]),[['row',3],['dc_halt',2],['lat',1]]);
  assert.match(a.run(`enregistrerModele(modeleDepuisSeance(S.sessions[0],'')).erreur`),/Donne un nom/);
  const s=a.run(`enregistrerModele(modeleDepuisSeance(S.sessions[0],'Haut du corps'))`);
  assert.ok(s.ok);assert.equal(a.run(`modeleParId('${s.id}').ex.length`),3);
});
test('B5 · « Refaire cette séance » depuis l\'historique',async()=>{
  const a=await ouvrirAppli();
  a.run(`demarrerSeance('A');S.draft.sets.dc[0].done=true;S.draft.sets.presse[0].done=true;terminerSeance();`);
  const m=a.run(`modeleDepuisSeance(S.sessions[0],'Séance A (copie)')`);
  assert.deepEqual(m.ex.map(l=>l.id),['presse','dc']);
  assert.ok(a.run(`enregistrerModele(modeleDepuisSeance(S.sessions[0],'Séance A (copie)')).ok`));
});

/* ---------------- F6. Sauvegarde et import ---------------- */
async function importer(a,txt,remplacer){
  a.run(`applyTheme=()=>{};importEnAttente=lireSauvegarde(${JSON.stringify(txt)});`);
  await a.run(`appliquerImport(${remplacer?'true':'false'})`);
}
test('F6 · sauvegarde puis import, avec séances perso et dates prévues',async()=>{
  const a=await ouvrirAppli();
  const id=a.run(`enregistrerModele(${BRAS}).id`);
  a.run(`prevoir('${id}','2026-12-01');prevoir('A','2026-12-02');`);
  a.run(`demarrerSeance('${id}');S.draft.sets.curl_ez[0].done=true;terminerSeance();`);
  const txt=a.run('contenuSauvegarde()');
  const o=JSON.parse(txt);
  assert.equal(o.version,5);assert.equal(o.modeles.length,1);assert.equal(o.prevues.length,2);
  // nouvelle appli vide, import « Tout remplacer »
  const b=await ouvrirAppli();
  await importer(b,txt,true);
  assert.equal(b.run(`modeleParId('${id}').nom`),'Bras');
  assert.deepEqual(b.run(`S.plans.map(p=>p.date).sort()`),['2026-12-01','2026-12-02']);
  assert.equal(b.run('S.sessions.length'),1);
  assert.equal(b.run(`semaineItems(weekStart(pkey('2026-12-01'))).filter(x=>x.src==='date').length`),2);
  // et c'est bien enregistré sur le téléphone
  await b.attendre();
  const c=await ouvrirAppli(b.disque);
  assert.equal(c.run('S.modeles.length'),1);assert.equal(c.run('S.plans.length'),2);
});
test('F6 · import en fusion : un badge déjà pris est remplacé',async()=>{
  const a=await ouvrirAppli();a.run(`enregistrerModele(${BRAS})`);
  const txt=a.run('contenuSauvegarde()');
  const b=await ouvrirAppli();
  b.run(`enregistrerModele(Object.assign(${BRAS},{nom:'Jambes'}))`);          // C déjà pris par « Jambes »
  b.run(`S.sessions.push({id:'x',type:'A',date:'2026-11-02',ts:1,ex:{dc:[{w:50,r:10}]}})`);
  await importer(b,txt,false);
  const ms=b.run('S.modeles');
  assert.equal(ms.length,2);
  assert.equal(new Set(ms.map(m=>m.badge)).size,2,'deux badges différents');
  assert.equal(ms.find(m=>m.nom==='Jambes').badge,'C','la séance déjà là garde son badge');
});
test('F6 · ancienne sauvegarde (v2, sans séances perso) toujours importée',async()=>{
  const v2=JSON.stringify({exporte_le:'2026-09-20T18:00:00.000Z',
    seances:[{id:'s1',type:'A',date:'2026-09-14',ts:1789410000000,dur:62,ex:{presse:[{w:80,r:12}],dc:[{w:40,r:10}]}},{id:'s3',type:'five',date:'2026-09-18',ts:1789760000000,min:60}],
    pesees:[{date:'2026-09-10',kg:88.45}],activite:[{date:'2026-09-18',steps:9500,kcal:610}],
    reglages:{theme:'light',plan:'2',goal:72,videos:{},alts:{dc:['dc_halt']},custom:[]}});
  const a=await ouvrirAppli();
  await importer(a,v2,false);
  assert.equal(a.run('S.sessions.length'),2);assert.equal(a.run('S.modeles.length'),0);assert.equal(a.run('S.plans.length'),0);
  assert.equal(a.run(`infoSeance(S.sessions[0]).nom`),'Séance A');
  assert.equal(a.run(`S.settings.plan`),'2');
  // sauvegarde v3 (sans modeles ni prevues) en mode « Tout remplacer »
  const v3=JSON.stringify({app:'sporty',version:3,seances:[],pesees:[{date:'2026-10-01',kg:87}],activite:[],reglages:{theme:'auto',plan:'1',goal:72}});
  await importer(a,v3,true);
  assert.equal(a.run('S.weights.length'),1);assert.equal(a.run('S.modeles.length'),0);
});

/* ---------------- H. Code SPORTY-SEANCE-V1 ---------------- */
const CODE=`SPORTY-SEANCE-V1
{
  "nom": "Bras express",
  "badge": "C",
  "couleur": "bleu",
  "description": "Biceps, triceps, épaules",
  "tapis": true,
  "date": "2026-11-20",
  "jours": [],
  "exercices": [
    {"id": "curl_ez", "nom": "Curl barre EZ", "series": 3, "reps": "10-12", "repos": 90},
    {"id": "tri_corde", "nom": "Extension triceps à la corde", "series": 3, "reps": "10-15", "repos": 60},
    {"id": "planche", "nom": "Gainage (planche)", "series": 3, "duree": "30-45", "repos": 60}
  ]
}`;
test('H · code valide',async()=>{
  const a=await ouvrirAppli();
  const r=a.run(`lireCodeSeance(${JSON.stringify(CODE)})`);
  assert.equal(r.modele.nom,'Bras express');assert.equal(r.modele.badge,'C');assert.equal(r.modele.couleur,'bleu');
  assert.equal(r.date,'2026-11-20');assert.equal(r.modele.tapis,true);
  assert.deepEqual(r.lignes.map(l=>[l.ok,l.id]),[[true,'curl_ez'],[true,'tri_corde'],[true,'planche']]);
  assert.deepEqual(r.lignes[0].ligne,{id:'curl_ez',sets:3,min:10,max:12,rest:90});
  assert.deepEqual(r.lignes[2].ligne,{id:'planche',sets:3,min:30,max:45,rest:60},'durée en secondes pour le gainage');
  assert.deepEqual(r.messages,[]);
  const s=a.run(`enregistrerCode(lireCodeSeance(${JSON.stringify(CODE)}))`);
  assert.ok(s.ok,s.erreur);
  // le code exporté se relit à l'identique
  const code2=a.run(`codeSeance('${s.id}')`);
  assert.ok(code2.startsWith('SPORTY-SEANCE-V1\n'));
  const r2=a.run(`lireCodeSeance(${JSON.stringify(code2)})`);
  assert.deepEqual(r2.lignes.map(l=>l.ligne),r.lignes.map(l=>l.ligne));
});
test('H · code avec du texte autour',async()=>{
  const a=await ouvrirAppli();
  const r=a.run(`lireCodeSeance(${JSON.stringify('Voici ta séance, bonne chance !\n\n'+CODE+'\n\nDis-moi si tu veux plus de jambes.')})`);
  assert.equal(r.modele.nom,'Bras express');assert.equal(r.lignes.length,3);
});
test('H · code avec des guillemets typographiques',async()=>{
  const a=await ouvrirAppli();
  const typo=CODE.replace(/"nom": "Bras express"/,'“nom”: “Bras express”').replace(/"couleur": "bleu"/,'«couleur»: «bleu»');
  const r=a.run(`lireCodeSeance(${JSON.stringify(typo)})`);
  assert.equal(r.modele.nom,'Bras express');assert.equal(r.modele.couleur,'bleu');
});
test('H · exercice trouvé seulement par son nom (sans majuscules ni accents)',async()=>{
  const a=await ouvrirAppli();
  const r=a.run(`lireCodeSeance(${JSON.stringify(JSON.stringify({nom:'Test',exercices:[
    {nom:'extension triceps a la corde'},{id:'inconnu_42',nom:'DEVELOPPE COUCHE HALTERES'},{nom:'Chest press'}]}))})`);
  assert.deepEqual(r.lignes.map(l=>l.id),['tri_corde','dc_halt','chest_press']);
  assert.equal(r.lignes[0].ligne.sets,3,'valeurs de la banque par défaut');
});
test('H · exercice introuvable : signalé, puis corrigé, créé ou ignoré',async()=>{
  const a=await ouvrirAppli();
  a.run(`R=lireCodeSeance(${JSON.stringify(JSON.stringify({nom:'Test',exercices:[{id:'curl_ez'},{nom:'Planche lestée',series:3,duree:'30'},{nom:'Truc inconnu'}]}))})`);
  assert.deepEqual(a.run('R.lignes.map(l=>l.ok)'),[true,false,false]);
  assert.equal(a.run('R.lignes[1].nom'),'Planche lestée');
  // « Choisir dans la banque »
  a.run(`Object.assign(R.lignes[1],{ok:true,id:'planche',ligne:ligneDepuisCode('planche',R.lignes[1].raw)})`);
  assert.equal(a.run('R.lignes[1].ligne.min'),30);
  // « Ignorer »
  a.run('R.lignes[2].ignore=true');
  const s=a.run('enregistrerCode(R)');assert.ok(s.ok,s.erreur);
  assert.deepEqual(a.run(`modeleParId('${s.id}').ex.map(l=>l.id)`),['curl_ez','planche']);
});
test('H · badge déjà pris : le prochain libre, avec un message',async()=>{
  const a=await ouvrirAppli();
  a.run(`enregistrerModele(${BRAS})`);   // prend C
  const r=a.run(`lireCodeSeance(${JSON.stringify(CODE)})`);
  assert.equal(r.modele.badge,'D');
  assert.match(r.messages.join(' '),/« C » est déjà pris par « Bras » : la séance prend « D »/);
  const r2=a.run(`lireCodeSeance(${JSON.stringify(CODE.replace('"badge": "C"','"badge": "A"'))})`);
  assert.equal(r2.modele.badge,'D');
  const r3=a.run(`lireCodeSeance(${JSON.stringify(CODE.replace('"couleur": "bleu"','"couleur": "vert"'))})`);
  assert.equal(r3.modele.couleur,'orange');
});
test('H · même nom : « Remplacer » ou « Garder les deux »',async()=>{
  const a=await ouvrirAppli();
  const s1=a.run(`enregistrerCode(lireCodeSeance(${JSON.stringify(CODE)}))`);
  const r=a.run(`lireCodeSeance(${JSON.stringify(CODE)})`);
  assert.equal(r.memeNom,s1.id);
  const garder=a.run(`enregistrerCode(lireCodeSeance(${JSON.stringify(CODE)}),{remplacer:false})`);
  assert.notEqual(garder.id,s1.id);assert.equal(a.run('modelesPerso().length'),2);
  const rempl=a.run(`enregistrerCode(lireCodeSeance(${JSON.stringify(CODE.replace('"series": 3, "reps": "10-12"','"series": 5, "reps": "6-8"'))}),{remplacer:true})`);
  assert.equal(rempl.id,s1.id);assert.equal(a.run('modelesPerso().length'),2);
  assert.equal(a.run(`modeleParId('${s1.id}').ex[0].sets`),5);
});
test('H · code illisible : message clair, jamais de plantage',async()=>{
  const a=await ouvrirAppli();
  for(const t of ['','bonjour','SPORTY-SEANCE-V1\n{ "nom": "X", ','{"nom":"Sans exercice","exercices":[]}','{"exercices":[{"id":"dc"}]}','[1,2,3]',null]){
    const msg=a.run(`(()=>{try{lireCodeSeance(${JSON.stringify(t)});return 'PAS D\\'ERREUR';}catch(e){return e.message;}})()`);
    assert.match(msg,/Ce code n'est pas une séance Sporty valide/,`pour « ${t} » : ${msg}`);
  }
});

/* ---------------- H4. Séances prévues ---------------- */
test('H4 · placer, déplacer et retirer une séance prévue',async()=>{
  const a=await ouvrirAppli();
  const id=a.run(`enregistrerModele(${BRAS}).id`);
  const demain=a.run('dkey(addDays(new Date(),1))'),apres=a.run('dkey(addDays(new Date(),2))');
  const p=a.run(`prevoir('${id}','${demain}').plan`);
  a.run(`prevoir('A','${demain}')`);                       // plusieurs le même jour
  assert.equal(a.run(`S.plans.filter(x=>x.date==='${demain}').length`),2);
  const it=()=>a.run(`semaineItems(weekStart(pkey('${demain}'))).concat(semaineItems(weekStart(pkey('${apres}')))).filter(x=>x.planId==='${p.id}')[0]`);
  assert.equal(it().etat,'prevu');assert.equal(it().date,demain);
  assert.ok(a.run(`deplacerPrevue('${p.id}','${apres}').ok`));
  assert.equal(it().date,apres);
  assert.ok(a.run(`prevoir('zzz','${demain}').erreur`));assert.ok(a.run(`prevoir('A','pas une date').erreur`));
  a.run(`retirerPrevue('${p.id}')`);
  assert.equal(a.run(`S.plans.some(x=>x.id==='${p.id}')`),false);
  assert.equal(a.run('S.plans.length'),1);
});
test('H4 · séance prévue faite : ✓ ; date passée sans séance : grise ; compte dans l\'objectif',async()=>{
  const a=await ouvrirAppli();
  const id=a.run(`enregistrerModele(${BRAS}).id`);
  const ws=a.run('dkey(weekStart())');
  const total0=a.run('objectifSemaine(weekStart()).total');
  const p=a.run(`prevoir('${id}',dkey()).plan`);
  assert.equal(a.run('objectifSemaine(weekStart()).total'),total0+1);
  a.run(`demarrerSeance('${id}',{planId:'${p.id}'});S.draft.sets.curl_ez[0].done=true;terminerSeance();`);
  assert.equal(a.run(`semaineItems(weekStart()).find(x=>x.planId==='${p.id}').etat`),'fait');
  // une séance prévue la semaine dernière, jamais faite
  const old=a.run(`prevoir('${id}',dkey(addDays(weekStart(),-3))).plan`);
  assert.equal(a.run(`semaineItems(addDays(weekStart(),-7)).find(x=>x.planId==='${old.id}').etat`),'passe');
});
test('H4 · « Enregistrer et placer » depuis un code, avec la date du code',async()=>{
  const a=await ouvrirAppli();
  const r=a.run(`(()=>{const R=lireCodeSeance(${JSON.stringify(CODE)});const s=enregistrerCode(R);return prevoir(s.id,R.date);})()`);
  assert.ok(r.ok);assert.equal(r.plan.date,'2026-11-20');
});

/* ---------------- Semaine modifiable : exceptions des séances récurrentes ---------------- */
/* Semaine type (plan 1) : A lundi, B mercredi, Five vendredi. Semaine future fixe pour des tests stables. */
const FUT='weekStart(pkey("2027-03-03"))';   // lundi 1er mars 2027
const jour=(a,i)=>a.run(`dkey(addDays(${FUT},${i}))`);
const itemsDe=(a,ws,m)=>a.run(`semaineItems(${ws}).filter(x=>x.modele==='${m}').map(x=>x.date+':'+x.etat+(x.deplacee?':deplacee':''))`);
test('Sem · déplacer A de lundi à mardi, pour cette semaine seulement',async()=>{
  const a=await ouvrirAppli();
  const lun=jour(a,0),mar=jour(a,1);
  assert.deepEqual(itemsDe(a,FUT,'A'),[lun+':prevu']);
  const obj0=a.run(`objectifSemaine(${FUT}).total`);
  assert.ok(a.run(`deplacerRecurrente('A','${lun}','${mar}').ok`));
  assert.deepEqual(itemsDe(a,FUT,'A'),[mar+':prevu:deplacee'],'A apparaît mardi, plus rien lundi');
  assert.equal(a.run(`objectifSemaine(${FUT}).total`),obj0,'l\'objectif ne change pas');
  assert.deepEqual(itemsDe(a,`addDays(${FUT},7)`,'A'),[jour(a,7)+':prevu'],'la semaine suivante revient à la normale');
  assert.equal(a.run(`modeleAB('A').jours.join()`),'1','les jours habituels ne changent pas');
});
test('Sem · redéplacer, revenir au jour d\'origine, placer un jour déjà occupé',async()=>{
  const a=await ouvrirAppli();
  const lun=jour(a,0),mar=jour(a,1),mer=jour(a,2);
  a.run(`deplacerRecurrente('A','${lun}','${mar}')`);
  a.run(`deplacerRecurrente('A','${lun}','${mer}')`);                  // redéplacée, le jour de B
  assert.deepEqual(itemsDe(a,FUT,'A'),[mer+':prevu:deplacee']);
  assert.deepEqual(itemsDe(a,FUT,'B'),[mer+':prevu'],'B reste aussi mercredi');
  assert.equal(a.run('S.exceptions.length'),1,'une seule exception par séance et par date');
  a.run(`deplacerRecurrente('A','${lun}','${lun}')`);
  assert.deepEqual(itemsDe(a,FUT,'A'),[lun+':prevu']);assert.equal(a.run('S.exceptions.length'),0);
  assert.ok(a.run(`deplacerRecurrente('A','${mar}','${mer}').erreur`),'A n\'est pas prévue mardi');
});
test('Sem · retirer de ce jour : plus prévue, objectif réduit',async()=>{
  const a=await ouvrirAppli();
  const obj0=a.run(`objectifSemaine(${FUT}).total`);
  a.run(`retirerRecurrente('B','${jour(a,2)}')`);
  assert.deepEqual(itemsDe(a,FUT,'B'),[]);
  assert.equal(a.run(`objectifSemaine(${FUT}).total`),obj0-1);
  assert.deepEqual(itemsDe(a,`addDays(${FUT},7)`,'B'),[jour(a,9)+':prevu']);
});
test('Sem · « Autre date » : déplacer vers la semaine suivante',async()=>{
  const a=await ouvrirAppli();
  a.run(`deplacerRecurrente('A','${jour(a,0)}','${jour(a,8)}')`);       // mardi de la semaine suivante
  assert.deepEqual(itemsDe(a,FUT,'A'),[]);
  assert.deepEqual(itemsDe(a,`addDays(${FUT},7)`,'A'),[jour(a,7)+':prevu',jour(a,8)+':prevu:deplacee']);
});
test('Sem · séance perso avec des jours : mêmes exceptions',async()=>{
  const a=await ouvrirAppli();
  const id=a.run(`enregistrerModele(Object.assign(${BRAS},{jours:[4]})).id`);   // jeudi
  a.run(`deplacerRecurrente('${id}','${jour(a,3)}','${jour(a,5)}')`);
  assert.deepEqual(itemsDe(a,FUT,id),[jour(a,5)+':prevu:deplacee']);
  a.run(`supprimerModele('${id}')`);assert.equal(a.run('S.exceptions.length'),0);
});
test('Sem · « Remettre la semaine par défaut »',async()=>{
  const a=await ouvrirAppli();
  a.run(`deplacerRecurrente('A','${jour(a,0)}','${jour(a,1)}');retirerRecurrente('B','${jour(a,2)}');deplacerRecurrente('A','${jour(a,7)}','${jour(a,8)}')`);
  assert.equal(a.run(`exceptionsSemaine(${FUT}).length`),2);
  a.run(`remettreSemaine(${FUT})`);
  assert.equal(a.run(`exceptionsSemaine(${FUT}).length`),0);
  assert.deepEqual(itemsDe(a,FUT,'A'),[jour(a,0)+':prevu']);
  assert.equal(a.run('S.exceptions.length'),1,'la semaine suivante garde son exception');
});
test('Sem · faite un autre jour sans déplacer : comptée ; pas faite : « manquée »',async()=>{
  const a=await ouvrirAppli();
  // semaine passée : A lundi pas faite, B faite jeudi au lieu de mercredi
  const ws='weekStart(addDays(new Date(),-14))';
  const jeu=a.run(`dkey(addDays(${ws},3))`);
  a.run(`demarrerSeance('B',{start:pkey('${jeu}').getTime()+19*3600e3});S.draft.sets.dc_halt&&0;S.draft.sets[S.draft.list[0]][0].done=true;terminerSeance(pkey('${jeu}').getTime()+20*3600e3);`);
  assert.deepEqual(a.run(`semaineItems(${ws}).filter(x=>x.modele==='B').map(x=>x.etat)`),['fait']);
  assert.deepEqual(a.run(`seancesManquees(${ws}).map(x=>x.modele)`),['A']);
  // « La placer aujourd'hui » sur une séance manquée de cette semaine
  const lundi=a.run('dkey(weekStart())'),auj=a.run('dkey()');
  if(lundi!==auj){
    assert.ok(a.run(`seancesManquees(weekStart()).some(x=>x.modele==='A')`));
    const it=a.run(`seancesManquees(weekStart()).find(x=>x.modele==='A')`);
    a.run(`deplacerItem(${JSON.stringify(it)},dkey())`);
    assert.deepEqual(a.run(`seancesManquees(weekStart()).map(x=>x.modele)`).filter(m=>m==='A'),[]);
    assert.ok(a.run(`semaineItems(weekStart()).some(x=>x.modele==='A'&&x.date===dkey()&&x.etat==='prevu')`));
  }
});
test('Sem · séance placée à une date : déplacer et retirer par le même chemin',async()=>{
  const a=await ouvrirAppli();
  const p=a.run(`prevoir('B','${jour(a,4)}').plan`);
  const it=a.run(`semaineItems(${FUT}).find(x=>x.planId==='${p.id}')`);
  a.run(`deplacerItem(${JSON.stringify(it)},'${jour(a,5)}')`);assert.equal(a.run('S.plans[0].date'),jour(a,5));
  a.run(`retirerItem(${JSON.stringify(it)})`);assert.equal(a.run('S.plans.length'),0);
});
test('Sem · sauvegarde puis import avec exceptions ; ancienne sauvegarde sans exceptions',async()=>{
  const a=await ouvrirAppli();
  a.run(`deplacerRecurrente('A','${jour(a,0)}','${jour(a,1)}');retirerRecurrente('B','${jour(a,2)}')`);
  const txt=a.run('contenuSauvegarde()');
  assert.equal(JSON.parse(txt).exceptions.length,2);
  const b=await ouvrirAppli();await importer(b,txt,false);
  assert.deepEqual(itemsDe(b,FUT,'A'),[jour(b,1)+':prevu:deplacee']);assert.deepEqual(itemsDe(b,FUT,'B'),[]);
  await b.attendre();const c=await ouvrirAppli(b.disque);assert.equal(c.run('S.exceptions.length'),2);
  // fusion : même séance, même date d'origine → une seule exception
  await importer(c,txt,false);assert.equal(c.run('S.exceptions.length'),2);
  // une sauvegarde v4 (sans exceptions) s'importe toujours
  const v4=JSON.stringify({app:'sporty',version:4,seances:[],pesees:[],activite:[],reglages:{plan:'1'},modeles:[],prevues:[]});
  const d=await ouvrirAppli();await importer(d,v4,true);assert.equal(d.run('S.exceptions.length'),0);
  assert.deepEqual(itemsDe(d,FUT,'A'),[jour(d,0)+':prevu']);
});

/* ---------------- Lancement ---------------- */
(async()=>{
  let ok=0;const ko=[];
  for(const t of tests){
    try{await t.fn();ok++;console.log('  ✓ '+t.nom);}
    catch(e){ko.push(t.nom);console.log('  ✗ '+t.nom+'\n      '+(e.message||e).split('\n').join('\n      '));}
  }
  console.log(`\n${ok}/${tests.length} tests réussis`);
  if(ko.length)process.exit(1);
})();
