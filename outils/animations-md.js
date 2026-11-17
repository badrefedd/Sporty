/* Génère ANIMATIONS.md à partir de outils/animations.json.
   Lancer : node outils/animations-md.js [dossier de free-exercise-db pour vérifier les images] */
const fs=require('fs'),path=require('path');
const {BANK,EX,GROUPS}=require('../tests/charger')();
const A=require('./animations.json');
const depot=process.argv[2];
const RAW='https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/';
const ids=BANK.map(r=>r[0]);
const aff=id=>{const a=A[id][3]||'';return a.startsWith('fixe')?`fixe (${a.endsWith('1')?'2e':'1re'} photo)`:a||'–';};
const manque=ids.filter(id=>!A[id]);if(manque.length)throw new Error('Sans correspondance : '+manque.join(', '));
if(depot){for(const id of ids){const s=A[id][0];if(!s)continue;for(const k of (A[id][3]==='animée'?[0,1]:[+A[id][3].slice(-1)]))if(!fs.existsSync(path.join(depot,'exercises',s,k+'.jpg')))throw new Error(`Image manquante : ${s}/${k}.jpg (${id})`);}}
const c={exacte:0,proche:0,aucune:0};ids.forEach(id=>c[A[id][1]]++);
let md=`# Animations des exercices Sporty

Source : ${A._source}.
Fichier généré par \`node outils/animations-md.js\` à partir de \`outils/animations.json\`.

**${ids.length} exercices : ${c.exacte} exactes, ${c.proche} proches, ${c.aucune} aucune. ${ids.filter(id=>A[id][3]==='animée').length} animées, ${ids.filter(id=>(A[id][3]||'').startsWith('fixe')).length} fixes.**

- **exacte** : même mouvement, même matériel.
- **proche** : même mouvement, matériel ou angle un peu différent. La différence sera affichée sous l'animation.
- **aucune** : rien de valable dans la base. Sporty garde le schéma des muscles travaillés.

Affichage : **animée** (fondu entre départ et arrivée) ou **fixe** (une seule photo, quand les deux photos ne montrent pas un vrai départ → arrivée : gros plan, autre angle, position tenue).

Les liens « départ » et « arrivée » ouvrent les deux photos de la base pour vérifier.

`;
for(const g of Object.keys(GROUPS)){
  const gi=ids.filter(id=>EX[id].group===g);if(!gi.length)continue;
  md+=`## ${GROUPS[g]} (${gi.length})\n\nid | nom Sporty | exercice free-exercise-db choisi | correspondance | affichage | photos\n---|---|---|---|---|---\n`;
  for(const id of gi){const [s,t,d]=A[id];
    md+=`${id} | ${EX[id].name} | ${s?s.replace(/_/g,' '):'–'} | **${t}**${d?' : '+d:''} | ${aff(id)} | ${s?`[départ](${RAW}${s}/0.jpg) · [arrivée](${RAW}${s}/1.jpg)`:'–'}\n`;}
  md+='\n';
}
const liste=t=>ids.filter(id=>A[id][1]===t);
md+=`## Images fixes (${ids.filter(id=>(A[id][3]||'').startsWith('fixe')).length})\n\n`+ids.filter(id=>(A[id][3]||'').startsWith('fixe')).map(id=>`- **${EX[id].name}** : ${aff(id)}`).join('\n')+'\n\n';
md+=`## Les « proche » (${c.proche})\n\n`+liste('proche').map(id=>`- **${EX[id].name}** ← ${A[id][0].replace(/_/g,' ')} : ${A[id][2]}`).join('\n')+'\n\n';
md+=`## Les « aucune » (${c.aucune})\n\n`+liste('aucune').map(id=>`- **${EX[id].name}**`).join('\n')+'\n';
fs.writeFileSync(path.join(__dirname,'..','ANIMATIONS.md'),md);
console.log('ANIMATIONS.md écrit',c);
