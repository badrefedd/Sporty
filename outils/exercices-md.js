/* Génère EXERCICES.md : la liste des exercices avec leur identifiant, à donner à Claude
   pour qu'il écrive des séances au format SPORTY-SEANCE-V1.
   Lancer : node outils/exercices-md.js */
const fs=require('fs'),path=require('path');
const {BANK,EX,GROUPS,MODES}=require('../tests/charger')();
const TYPE={kg:'charge',bw:'poids du corps',time:'cardio (minutes)',hold:'gainage (secondes)'};
let md=`# Exercices Sporty (${BANK.length})

Liste à donner à Claude pour écrire une séance que Sporty sait lire.
Fichier généré par \`node outils/exercices-md.js\`.

## Format d'une séance

\`\`\`
SPORTY-SEANCE-V1
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
    {"id": "planche", "nom": "Gainage (planche)", "series": 3, "duree": "30-45", "repos": 60}
  ]
}
\`\`\`

- Obligatoires : \`nom\` et \`exercices\` (au moins 1). Le reste est facultatif.
- \`id\` : l'identifiant de la liste ci-dessous (colonne id). \`nom\` sert de secours si l'id est inconnu.
- \`reps\` pour les types *charge* et *poids du corps* ; \`duree\` en secondes pour le *gainage*, en minutes pour le *cardio*. Un nombre ou une fourchette (« 8-12 »).
- \`repos\` en secondes. \`couleur\` : orange, bleu, violet, rouge, jaune, rose ou gris (jamais de vert).
- \`badge\` : 1 ou 2 caractères ; « A », « B », « L » et « 5 » sont déjà pris.
- \`date\` : AAAA-MM-JJ. \`jours\` : "lundi" … "dimanche", pour une séance qui revient chaque semaine.

## Liste

id | nom | groupe | matériel | type
---|---|---|---|---
`;
for(const g of Object.keys(GROUPS))BANK.filter(r=>r[2]===g).forEach(r=>{const e=EX[r[0]];md+=`${e.id} | ${e.name} | ${GROUPS[g]} | ${e.equip} | ${TYPE[e.mode]}\n`;});
fs.writeFileSync(path.join(__dirname,'..','EXERCICES.md'),md);
console.log('EXERCICES.md écrit');
