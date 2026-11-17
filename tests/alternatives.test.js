/* Test des alternatives. Lancer : node tests/alternatives.test.js */
const {EX,MOUV,ALT,SCHEMAS,parseAlt,memePoste}=require('./charger')();
const ids=Object.keys(EX),erreurs=[];
const nom=x=>EX[x]?EX[x].name:`« ${x} »`;
const err=(id,msg)=>erreurs.push(`${id} (${EX[id]?EX[id].name:'?'}) : ${msg}`);

for(const id of ids){
  const m=MOUV[id],alt=ALT[id];
  if(!m){err(id,'pas de schéma de mouvement');continue;}
  if(!SCHEMAS[m[0]])err(id,`schéma inconnu « ${m[0]} »`);
  if(!alt){err(id,'pas d\'alternatives');continue;}
  const a=alt.a.map(s=>parseAlt(s).id),d=alt.d.map(s=>parseAlt(s).id);
  // 1. au moins 2 alternatives ou 1 dépannage
  if(a.length<2&&d.length<1)err(id,`${a.length} alternative(s) et aucun dépannage`);
  // 2. ne se propose pas lui-même
  if(a.includes(id)||d.includes(id))err(id,'se propose lui-même');
  // 3. pas d'exercice inexistant, pas de doublon
  for(const x of a.concat(d))if(!EX[x])err(id,`pointe vers « ${x} », qui n'existe pas`);
  if(new Set(a.concat(d)).size!==a.length+d.length)err(id,'doublon dans la liste');
  // 4. isolation ↔ polyarticulaire interdit hors dépannage ; cardio ↔ cardio
  for(const x of a){
    if(!EX[x])continue;
    const k1=m[1],k2=MOUV[x]&&MOUV[x][1];
    if((k1==='iso'&&k2==='poly')||(k1==='poly'&&k2==='iso'))err(id,`${k1==='iso'?'isolation':'polyarticulaire'} remplacé par ${nom(x)} (${k2==='iso'?'isolation':'polyarticulaire'}) hors dépannage`);
    if((k1==='cardio')!==(k2==='cardio'))err(id,`mélange cardio et musculation : ${nom(x)}`);
  }
  // 5. « même poste » en fin de liste
  let vuMeme=false;
  for(const x of a){const mp=memePoste(id,x);if(vuMeme&&!mp)err(id,`${nom(x)} (autre poste) est après un exercice « même poste »`);if(mp)vuMeme=true;}
  // 6. 2 dépannages maximum
  if(d.length>2)err(id,`${d.length} dépannages (2 maximum)`);
}
for(const id of Object.keys(ALT))if(!EX[id])err(id,'liste d\'alternatives pour un exercice inexistant');
for(const id of Object.keys(MOUV))if(!EX[id])err(id,'schéma pour un exercice inexistant');

if(erreurs.length){console.error(`ÉCHEC : ${erreurs.length} problème(s)\n- `+erreurs.join('\n- '));process.exit(1);}
console.log(`OK : ${ids.length} exercices vérifiés, ${ids.reduce((n,id)=>n+ALT[id].a.length,0)} alternatives, ${ids.reduce((n,id)=>n+ALT[id].d.length,0)} dépannages.`);
const peu=ids.filter(id=>ALT[id].a.length<3);
console.log(`\nMoins de 3 vraies alternatives (${peu.length}) :`);
peu.forEach(id=>console.log(`- ${EX[id].name} : ${ALT[id].a.length}${ALT[id].d.length?` + ${ALT[id].d.length} dépannage(s)`:''}`));
