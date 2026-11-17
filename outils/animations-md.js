/* Génère ANIMATIONS.md à partir de outils/animations.json.
   Lancer : node outils/animations-md.js [dossier de free-exercise-db pour vérifier les images] */
const fs=require('fs'),path=require('path');
const {BANK,EX,GROUPS}=require('../tests/charger')();
const A=require('./animations.json');
const depot=process.argv[2];
const RAW='https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/';
const ids=BANK.map(r=>r[0]);
const manque=ids.filter(id=>!A[id]);if(manque.length)throw new Error('Sans correspondance : '+manque.join(', '));
if(depot){for(const id of ids){const s=A[id][0];if(!s)continue;for(const k of [0,1])if(!fs.existsSync(path.join(depot,'exercises',s,k+'.jpg')))throw new Error(`Image manquante : ${s}/${k}.jpg (${id})`);}}
const c={exacte:0,proche:0,aucune:0};ids.forEach(id=>c[A[id][1]]++);
let md=`# Animations des exercices Sporty

Source : ${A._source}.
Fichier généré par \`node outils/animations-md.js\` à partir de \`outils/animations.json\`.

**${ids.length} exercices : ${c.exacte} exactes, ${c.proche} proches, ${c.aucune} aucune.**

- **exacte** : même mouvement, même matériel.
- **proche** : même mouvement, matériel ou angle un peu différent. La différence sera affichée sous l'animation.
- **aucune** : rien de valable dans la base. Sporty garde le schéma des muscles travaillés.

Les liens « départ » et « arrivée » ouvrent les deux photos de la base pour vérifier.

`;
for(const g of Object.keys(GROUPS)){
  const gi=ids.filter(id=>EX[id].group===g);if(!gi.length)continue;
  md+=`## ${GROUPS[g]} (${gi.length})\n\nid | nom Sporty | exercice free-exercise-db choisi | correspondance | photos\n---|---|---|---|---\n`;
  for(const id of gi){const [s,t,d]=A[id];
    md+=`${id} | ${EX[id].name} | ${s?s.replace(/_/g,' '):'–'} | **${t}**${d?' : '+d:''} | ${s?`[départ](${RAW}${s}/0.jpg) · [arrivée](${RAW}${s}/1.jpg)`:'–'}\n`;}
  md+='\n';
}
const liste=t=>ids.filter(id=>A[id][1]===t);
md+=`## À valider : les « proche » (${c.proche})\n\n`+liste('proche').map(id=>`- **${EX[id].name}** ← ${A[id][0].replace(/_/g,' ')} : ${A[id][2]}`).join('\n')+'\n\n';
md+=`## À valider : les « aucune » (${c.aucune})\n\n`+liste('aucune').map(id=>`- **${EX[id].name}**`).join('\n')+'\n';
fs.writeFileSync(path.join(__dirname,'..','ANIMATIONS.md'),md);
console.log('ANIMATIONS.md écrit',c);
