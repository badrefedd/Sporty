/* Génère ALTERNATIVES.md à partir de js/alternatives.js.
   Lancer : node outils/alternatives-md.js */
const fs=require('fs'),path=require('path');
const {BANK,EX,GROUPS,MOUV,ALT,SCHEMAS,TYPES,parseAlt,altTags}=require('../tests/charger')();
const uniLabel=id=>['quadri','ischios','fessiers','adducteurs','mollets'].includes(EX[id].group)?'par jambe':'par bras';
const tagsOf=(a,b,o)=>altTags(a,b,o).map(t=>t==='par bras'||t==='par jambe'?uniLabel(b):t);
const fmt=(a,s,o)=>{const x=parseAlt(s),t=tagsOf(a,x.id,o).filter(t=>t!=='dépannage');return `${EX[x.id].name}${x.note?` (${x.note})`:''}${t.length?' '+t.map(t=>`*${t}*`).join(' '):''}`;};
const self=id=>{const m=MOUV[id],t=[];if(/t/.test(m[3]))t.push('technique');if(/u/.test(m[3]))t.push(uniLabel(id));return t.length?' '+t.map(t=>`*${t}*`).join(' '):'';};
let md=`# Alternatives des exercices Sporty

Fichier généré à partir de \`js/alternatives.js\` : ne pas le modifier à la main.
Pour le mettre à jour : \`node outils/alternatives-md.js\`.

## Règles

Une **vraie alternative** fait le même mouvement et travaille les mêmes muscles, avec un autre matériel. Ordre de classement :

1. un autre poste avant le même poste (*même poste* toujours en fin de liste) ;
2. même angle et même trajectoire ;
3. guidé si l'original est guidé, libre si l'original est libre ;
4. facilité à charger lourd.

Un exercice d'isolation n'est jamais remplacé par un polyarticulaire, ni l'inverse, sauf en **dépannage** (mouvement différent, en dernier recours, 2 au maximum).

Étiquettes : *même poste* (inutile si le poste est pris), *technique* (difficile à bien exécuter au début), *par bras* / *par jambe* (répétitions comptées de chaque côté).
Le hip thrust et ses variantes sont classés en isolation : seule la hanche bouge.

`;
for(const g of Object.keys(GROUPS)){
  const ids=BANK.map(r=>r[0]).filter(id=>EX[id].group===g);if(!ids.length)continue;
  md+=`## ${GROUPS[g]} (${ids.length})\n\n| Exercice | Schéma | Alternatives, de la plus proche à la moins proche | Dépannage |\n|---|---|---|---|\n`;
  for(const id of ids){
    const m=MOUV[id],A=ALT[id];
    const a=A.a.length?A.a.map((s,i)=>`${i+1}. ${fmt(id,s,{})}`).join('<br>'):'*Aucune dans la banque*';
    const d=A.d.length?A.d.map(s=>fmt(id,s,{dep:true})).join('<br>'):'–';
    md+=`| **${EX[id].name}**${self(id)} | ${SCHEMAS[m[0]]} · ${TYPES[m[1]]} | ${a} | ${d} |\n`;
  }
  md+='\n';
}
const peu=Object.keys(EX).filter(id=>ALT[id].a.length<3);
md+=`## Exercices avec moins de 3 vraies alternatives (${peu.length})\n\n`+peu.map(id=>`- ${EX[id].name} : ${ALT[id].a.length}${ALT[id].d.length?` + ${ALT[id].d.length} dépannage${ALT[id].d.length>1?'s':''}`:''}`).join('\n')+'\n';
fs.writeFileSync(path.join(__dirname,'..','ALTERNATIVES.md'),md);
console.log('ALTERNATIVES.md écrit');
