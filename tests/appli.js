/* Charge la logique de l'appli hors navigateur (sans écran), avec un faux localStorage.
   Deux appels qui partagent le même « disque » simulent la fermeture et la réouverture de l'appli. */
const fs=require('fs'),path=require('path'),vm=require('vm');
const FICHIERS=['js/outils.js','js/exercices.js','js/alternatives.js','js/stockage.js','js/sauvegarde.js','js/logique.js','js/seances.js','js/illustrations.js','js/visuels.js','js/photos.js'];

function nouveauDisque(){return new Map();}
async function ouvrirAppli(disque){
  disque=disque||nouveauDisque();
  const localStorage={getItem:k=>disque.has(k)?disque.get(k):null,setItem:(k,v)=>disque.set(k,String(v)),removeItem:k=>disque.delete(k)};
  const ctx=vm.createContext({console:{log:console.log,error:console.error,warn:()=>{}},localStorage,window:{},document:{},navigator:{},setTimeout,clearTimeout,setInterval:()=>0,clearInterval:()=>{},Date,Math,JSON,Promise});
  for(const f of FICHIERS)vm.runInContext(fs.readFileSync(path.join(__dirname,'..',f),'utf8'),ctx,{filename:f});
  /* Pas d'écran : les fonctions d'affichage ne font rien, les messages sont gardés pour les tests. */
  vm.runInContext(`var __toasts=[];toast=m=>__toasts.push(m);function render(){};function closeModal(){};function openModal(){};`,ctx);
  const app={
    ctx,disque,
    run:code=>vm.runInContext(code,ctx),
    async init(){await vm.runInContext('Store.init()',ctx);vm.runInContext('buildEx()',ctx);return app;},
    async attendre(){await vm.runInContext('Promise.all(Object.values(Store.queues))',ctx);}
  };
  return app.init();
}
module.exports={ouvrirAppli,nouveauDisque};
