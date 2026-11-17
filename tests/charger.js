/* Charge les données de l'appli (banque + alternatives) hors navigateur, pour les tests et les scripts. */
const fs=require('fs'),path=require('path'),vm=require('vm');
module.exports=function charger(){
  const ctx=vm.createContext({console,S:{settings:{custom:[],hidden:[],alts:{}}},isHidden:()=>false});
  for(const f of ['js/exercices.js','js/alternatives.js'])
    vm.runInContext(fs.readFileSync(path.join(__dirname,'..',f),'utf8'),ctx,{filename:f});
  vm.runInContext('buildEx()',ctx);
  return vm.runInContext('({BANK,EX,GROUPS,MODES,MOUV,ALT,SCHEMAS,TYPES,parseAlt,memePoste,altTags})',ctx);
};
