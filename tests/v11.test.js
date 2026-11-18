/* Tests de la V1.1 : modifier une séance terminée, rouvrir, fin de séance plus sûre, accords.
   Lancer : node tests/v11.test.js */
const assert=require('assert');
const {ouvrirAppli}=require('./appli');
const tests=[];const test=(nom,fn)=>tests.push({nom,fn});
const H=3600e3;

/* Une séance A terminée à une date donnée, avec dc à charge/répétitions données. */
function seanceA(a,{date,heure=19,dc=[[60,12],[60,12],[60,12]],presse=[[100,10]]}){
  return a.run(`(()=>{const t=pkey('${date}').getTime()+${heure}*3600e3;demarrerSeance('A',{start:t});
    const dc=${JSON.stringify(dc)},pr=${JSON.stringify(presse)};
    S.draft.sets.dc=dc.map(([w,r])=>({w:String(w),r:String(r),done:true}));
    S.draft.sets.presse=pr.map(([w,r])=>({w:String(w),r:String(r),done:true}));
    return terminerSeance(t+60*60000).ses.id;})()`);
}
/* Modifie : f reçoit S.modif dans l'appli (code JS). */
const modifier=(a,id,code)=>a.run(`(()=>{const r=ouvrirModif('${id}');if(r.erreur)return r;S.route='modif';const m=S.modif;${code};S.route='historique';return enregistrerModif();})()`);

test('Modifier une séance : charges, séries, exercices ; records, courbe, suggestion recalculés',async()=>{
  const a=await ouvrirAppli();
  const hier=a.run('dkey(addDays(new Date(),-1))'),avant=a.run('dkey(addDays(new Date(),-8))');
  seanceA(a,{date:avant,dc:[[55,10],[55,10],[55,10]]});
  const id=seanceA(a,{date:hier});
  // haut de fourchette atteint partout : Sporty propose de monter
  assert.equal(a.run(`suggest('dc').up`),true);assert.equal(a.run(`maxEver('dc')`),60);
  // je m'étais trompé : 2e série à 8 répétitions, une série en moins à la presse, un exercice ajouté
  const r=modifier(a,id,`m.d.sets.dc[1].r='8';m.d.sets.dc[2].w='70';
    m.d.sets.presse.push({w:'100',r:'9',done:true});
    m.d.list.push('lat');m.d.sets.lat=[{w:'8',r:'15',done:true},{w:'8',r:'',done:false}];`);
  assert.ok(r.ok,r.erreur);
  const s=a.run(`S.sessions.find(x=>x.id==='${id}')`);
  assert.deepEqual(s.ex.dc,[{w:60,r:12},{w:60,r:8},{w:70,r:12}]);
  assert.equal(s.ex.presse.length,2);assert.deepEqual(s.ex.lat,[{w:8,r:15}],'seules les séries cochées sont gardées');
  assert.equal(s.modifiee,true);assert.equal(s.id,id);
  assert.equal(a.run(`maxEver('dc')`),70,'record recalculé');
  assert.equal(a.run(`suggest('dc').up`),false,'suggestion recalculée : plus de montée de charge');
  assert.equal(a.run(`lastFor('dc').id`),id);
  // courbe : la valeur de la séance (charge max) suit la modification
  assert.equal(a.run(`Math.max(...S.sessions.find(x=>x.id==='${id}').ex.dc.map(x=>x.w))`),70);
  // retirer un exercice entier
  assert.ok(modifier(a,id,`m.d.list=m.d.list.filter(x=>x!=='lat');delete m.d.sets.lat;`).ok);
  assert.equal(a.run(`!!S.sessions.find(x=>x.id==='${id}').ex.lat`),false);
  // remplacer par une alternative
  assert.ok(modifier(a,id,`swapEx('presse','hack_squat');m.d.sets.hack_squat.forEach(x=>{x.w='80';x.r='10';x.done=true;});`).ok);
  const s2=a.run(`S.sessions.find(x=>x.id==='${id}')`);
  assert.ok(!s2.ex.presse&&s2.ex.hack_squat.length===3);assert.deepEqual(s2.remplace,{hack_squat:'presse'});
  // refus : plus aucune série validée
  assert.match(modifier(a,id,`Object.values(m.d.sets).forEach(a=>a.forEach(x=>x.done=false));`).erreur,/au moins une série/);
  // gardé après réouverture de l'appli
  await a.attendre();const b=await ouvrirAppli(a.disque);assert.equal(b.run(`S.sessions.find(x=>x.id==='${id}').modifiee`),true);
});
test('Modifier : date, heure de début et durée ; objectif de la semaine et séance prévue',async()=>{
  const a=await ouvrirAppli();
  const lun=a.run('dkey(weekStart())'),lunAvant=a.run('dkey(addDays(weekStart(),-7))');
  const ws='weekStart()',wsAvant='addDays(weekStart(),-7)';
  const id=seanceA(a,{date:lun});
  assert.equal(a.run(`weekStatus(${ws}).A`),true);
  const fait=()=>a.run(`objectifSemaine(${ws}).faites`),faitAvant=()=>a.run(`objectifSemaine(${wsAvant}).faites`);
  const f0=fait(),fa0=faitAvant();
  // déplacer la séance terminée dans la semaine d'avant, à 7 h 30, 75 min
  const r=modifier(a,id,`m.champs.date='${lunAvant}';m.champs.heure='07:30';m.champs.dur='75';`);
  assert.ok(r.ok,r.erreur);
  const s=a.run(`S.sessions.find(x=>x.id==='${id}')`);
  assert.equal(s.date,lunAvant);assert.equal(new Date(s.ts).getHours(),7);assert.equal(new Date(s.ts).getMinutes(),30);assert.equal(s.dur,75);
  assert.equal(a.run(`weekStatus(${ws}).A`),false,'plus faite cette semaine');assert.equal(a.run(`weekStatus(${wsAvant}).A`),true);
  assert.equal(fait(),f0-1);assert.equal(faitAvant(),fa0+1);
  // séance prévue à une date : la séance modifiée sur ce jour la marque « faite »
  const p=a.run(`prevoir('B','${lun}').plan`);
  assert.equal(a.run(`semaineItems(${ws}).find(x=>x.planId==='${p.id}').etat`),dkey(a)<=lun?'prevu':'passe');
  const idB=a.run(`(()=>{const t=pkey('${lunAvant}').getTime()+18*3600e3;demarrerSeance('B',{start:t,planId:'${p.id}'});S.draft.sets[S.draft.list[0]][0].done=true;return terminerSeance(t+3600e3).ses.id;})()`);
  assert.notEqual(a.run(`semaineItems(${ws}).find(x=>x.planId==='${p.id}').etat`),'fait','faite hors de sa semaine');
  modifier(a,idB,`m.champs.date='${lun}';`);
  assert.equal(a.run(`semaineItems(${ws}).find(x=>x.planId==='${p.id}').etat`),'fait','déplacée sur sa date : faite');
  // refus : date dans le futur, heure ou durée invalides
  assert.match(modifier(a,id,`m.champs.date=dkey(addDays(new Date(),2));`).erreur,/futur/);
  assert.match(modifier(a,id,`m.champs.heure='25:00';`).erreur,/heure/);
  assert.match(modifier(a,id,`m.champs.dur='0';`).erreur,/durée/);
});
const dkey=a=>a.run('dkey()');
test('Modifier un Five : durée, date et note',async()=>{
  const a=await ouvrirAppli();
  const hier=a.run('dkey(addDays(new Date(),-1))'),avant=a.run('dkey(addDays(new Date(),-3))');
  a.run(`S.sessions.push({id:'f1',type:'five',date:'${hier}',ts:pkey('${hier}').getTime()+20*3600e3,min:60})`);
  const r=modifier(a,'f1',`m.champs.min='90';m.champs.date='${avant}';m.champs.note='3 buts';`);
  assert.ok(r.ok,r.erreur);
  assert.deepEqual(a.run(`(({min,date,note,modifiee})=>({min,date,note,modifiee}))(S.sessions.find(x=>x.id==='f1'))`),{min:90,date:avant,note:'3 buts',modifiee:true});
  assert.ok(modifier(a,'f1',`m.champs.note='';`).ok);assert.equal(a.run(`'note' in S.sessions.find(x=>x.id==='f1')`),false);
  assert.match(modifier(a,'f1',`m.champs.min='5';`).erreur,/durée/);
});
test('Modifier : un exercice perso supprimé depuis est gardé ; quitter sans changement n\'est pas « modifié »',async()=>{
  const a=await ouvrirAppli();
  a.run(`S.settings.custom=[{id:'c_x',name:'Ma machine',group:'dos',equip:'Machine',mode:'kg'}];buildEx();`);
  const hier=a.run('dkey(addDays(new Date(),-1))');
  a.run(`S.sessions.push({id:'s1',type:'L',date:'${hier}',ts:pkey('${hier}').getTime()+19*3600e3,dur:40,ex:{c_x:[{w:30,r:10}],dc:[{w:50,r:10}]}})`);
  a.run(`S.settings.custom=[];buildEx();`);
  a.run(`ouvrirModif('s1')`);assert.equal(a.run('modifSale()'),false);
  a.run(`S.modif.d.sets.dc[0].r='11'`);assert.equal(a.run('modifSale()'),true);
  assert.ok(a.run('enregistrerModif()').ok);
  assert.deepEqual(a.run(`S.sessions[0].ex.c_x`),[{w:30,r:10}]);
});
test('Rouvrir : pendant 3 heures, pas après, pas si une autre séance est en cours',async()=>{
  const a=await ouvrirAppli();
  const now=a.run('Date.now()');
  // séance finie il y a 1 heure
  const id=a.run(`(()=>{const t=${now}-2*3600e3;demarrerSeance('A',{start:t});S.draft.sets.dc.forEach(x=>{x.w='60';x.r='10';x.done=true;});return terminerSeance(t+3600e3).ses.id;})()`);
  assert.equal(a.run(`peutRouvrir(S.sessions[0])`),true);
  // autre séance en cours : refus
  a.run(`demarrerSeance('B')`);
  assert.match(a.run(`rouvrirSeance('${id}').erreur`),/déjà en cours/);
  a.run(`annulerSeance()`);
  // après 3 heures : refus
  assert.match(a.run(`rouvrirSeance('${id}',${now}+2.5*3600e3).erreur`),/3 heures/);
  assert.equal(a.run(`peutRouvrir(S.sessions[0],${now}+2.5*3600e3)`),false);
  // avant 3 heures : la séance redevient en cours, séries cochées, et quitte l'historique
  assert.ok(a.run(`rouvrirSeance('${id}',${now}).ok`));
  assert.equal(a.run('S.sessions.length'),0);
  assert.deepEqual(a.run(`S.draft.sets.dc.map(x=>x.done)`),[true,true,true]);assert.equal(a.run(`S.draft.sets.dc[0].w`),'60');
  assert.deepEqual(a.run('S.draft.list'),a.run(`modeleAB('A').ex.map(l=>l.id).concat('tapis')`),'tout le programme revient, dans l\'ordre');
  assert.equal(a.run(`S.draft.sets.presse.every(x=>!x.done)`),true);
  // j'ajoute ce qui manquait, puis je termine 20 min plus tard
  a.run(`S.draft.sets.presse[0].w='100';S.draft.sets.presse[0].r='10';S.draft.sets.presse[0].done=true;`);
  const r=a.run(`terminerSeance(${now}+20*60000)`);
  assert.equal(r.ses.id,id,'même séance');assert.equal(r.ses.dur,80,'durée : 60 min + 20 min');
  assert.equal(r.ses.ex.presse.length,1);assert.equal(a.run('S.sessions.length'),1);
});
test('Rouvrir puis annuler : la séance revient telle qu\'elle était',async()=>{
  const a=await ouvrirAppli();
  const id=a.run(`(()=>{const t=Date.now()-2*3600e3;demarrerSeance('A',{start:t});S.draft.sets.dc[0].w='60';S.draft.sets.dc[0].done=true;return terminerSeance(t+3600e3).ses.id;})()`);
  const avant=a.run(`JSON.stringify(S.sessions[0])`);
  a.run(`rouvrirSeance('${id}');S.draft.sets.dc[0].w='999';`);
  assert.equal(a.run(`annulerSeance().restauree`),true);
  assert.equal(a.run(`JSON.stringify(S.sessions[0])`),avant);assert.equal(a.run('S.draft'),null);
});
test('Fin de séance : séries remplies, vides, et les 3 choix',async()=>{
  const a=await ouvrirAppli();
  const prep=`(()=>{demarrerSeance('A');const d=S.draft;
    d.sets.presse[0]=Object.assign(d.sets.presse[0],{w:'100',r:'10',done:true});
    d.sets.dc[0]=Object.assign(d.sets.dc[0],{w:'60',r:'10',done:false,saisie:true});   // remplie
    d.sets.dc[1]=Object.assign(d.sets.dc[1],{w:'60',r:'9',done:false,saisie:true});    // remplie
    d.sets.dc[2]=Object.assign(d.sets.dc[2],{w:'',r:'8',done:false,saisie:true});      // charge vide : vide
    })()`;
  a.run(prep);
  const e=a.run('etatFin()');
  const total=a.run('S.draft.list.reduce((n,id)=>n+S.draft.sets[id].length,0)');
  assert.equal(e.valides,1);assert.equal(e.remplies,2);assert.equal(e.vides,total-3);
  // 1. « Continuer la séance » : rien ne change
  assert.deepEqual(a.run('etatFin()'),e);
  // 2. « Valider ces 2 séries et terminer »
  assert.equal(a.run('validerRemplies()'),2);
  let r=a.run('terminerSeance()');assert.deepEqual(r.ses.ex.dc,[{w:60,r:10},{w:60,r:9}]);assert.equal(r.n,3);
  // 3. « Terminer sans elles » : seules les séries déjà validées
  a.run(prep);r=a.run('terminerSeance()');assert.equal(r.n,1);assert.equal(r.ses.ex.dc,undefined);
  // toutes validées : rien à demander
  a.run(`demarrerSeance('L');S.draft.list.push('dc');S.draft.sets.dc=[{w:'50',r:'10',done:true}]`);
  assert.deepEqual(a.run('etatFin()'),{valides:1,remplies:0,vides:0});
  // poids du corps et cardio : les répétitions ou minutes suffisent
  assert.equal(a.run(`serieRemplie('traction',{w:'',r:'8',saisie:true})`),true);assert.equal(a.run(`serieRemplie('tapis',{w:'',r:'20',saisie:true})`),true);
  assert.equal(a.run(`serieRemplie('dc',{w:'',r:'8',saisie:true})`),false);
  // valeurs proposées par Sporty (dernière charge, 20 min de tapis) mais pas tapées : pas « remplies »
  a.run(`demarrerSeance('A')`);assert.equal(a.run(`serieRemplie('tapis',S.draft.sets.tapis[0])`),false);assert.equal(a.run('etatFin().remplies'),0);
});
test('Séance de plus de 3 heures : heure de fin réelle, durée juste',async()=>{
  const a=await ouvrirAppli();
  const t=a.run('Date.now()-5*3600e3');
  a.run(`demarrerSeance('A',{start:${t}});S.draft.sets.dc[0].w='60';S.draft.sets.dc[0].done=true;`);
  assert.equal(a.run('seanceTropLongue()'),true);
  assert.equal(a.run(`seanceTropLongue(${t}+2*3600e3)`),false);
  const est=a.run('finEstimee()');assert.equal(est,t+a.run(`dureeEstimee(modeleAB('A'))`)*60000,'pré-rempli : début + durée estimée');
  const r=a.run(`terminerSeance(${t}+70*60000)`);assert.equal(r.ses.dur,70);
  // une séance rouverte n'est pas « trop longue »
  const id=r.ses.id;a.run(`S.sessions[0].ts=Date.now()-4*3600e3;S.sessions[0].dur=70;S.sessions[0].ts=Date.now()-2*3600e3`);
  a.run(`rouvrirSeance('${id}')`);assert.equal(a.run('seanceTropLongue()'),false);
});
test('Accords : 1 série, 2 séries',async()=>{
  const a=await ouvrirAppli();
  assert.equal(a.run(`nb(1,'série','séries')`),'1 série');assert.equal(a.run(`nb(0,'série','séries')`),'0 série');assert.equal(a.run(`nb(2,'série','séries')`),'2 séries');
});
test('Sauvegarde puis import, avec une séance modifiée',async()=>{
  const a=await ouvrirAppli();
  const id=seanceA(a,{date:a.run('dkey(addDays(new Date(),-1))')});
  modifier(a,id,`m.d.sets.dc[0].w='65';m.champs.dur='72';`);
  const txt=a.run('contenuSauvegarde(true)');
  const b=await ouvrirAppli();
  b.run(`applyTheme=()=>{};importEnAttente=lireSauvegarde(${JSON.stringify(txt)});`);await b.run('appliquerImport(true)');
  const s=b.run(`S.sessions.find(x=>x.id==='${id}')`);
  assert.equal(s.modifiee,true);assert.equal(s.dur,72);assert.equal(s.ex.dc[0].w,65);
  assert.equal(b.run(`maxEver('dc')`),65);
});

(async()=>{
  let ok=0;const ko=[];
  for(const t of tests){try{await t.fn();ok++;console.log('  ✓ '+t.nom);}catch(e){ko.push(t.nom);console.log('  ✗ '+t.nom+'\n      '+String(e.message).split('\n').join('\n      '));}}
  console.log(`\n${ok}/${tests.length} tests réussis`);if(ko.length)process.exit(1);
})();
