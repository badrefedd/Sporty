/* Lance tous les tests sans navigateur : node tests/run.js (ou npm test) */
const {execFileSync}=require('child_process'),path=require('path');
let ok=true;
for(const f of ['alternatives.test.js','seances.test.js','illustrations.test.js','v11.test.js']){
  console.log(`\n=== ${f} ===`);
  try{execFileSync(process.execPath,[path.join(__dirname,f)],{stdio:'inherit'});}catch(e){ok=false;}
}
process.exit(ok?0:1);
