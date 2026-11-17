'use strict';
/* =====================================================================
   Séances : modèles (A, B, séances perso), séances prévues à une date,
   démarrage et fin d'une séance, code de partage SPORTY-SEANCE-V1.

   Ce fichier ne touche pas à l'écran : il ne fait que lire et modifier S
   et enregistrer via Store. Les écrans sont dans vues-seances.js.

   Modèle de séance :
     { id, nom, badge, couleur, desc, tapis, jours:[1..7], ex:[ligne…] }
     ligne : { id, sets, min, max, rest }
       min/max = répétitions (charge, poids du corps), secondes (gainage) ou minutes (cardio).
     Prévu pour plus tard, sans interface : une ligne pourra porter « bloc » (même valeur
     = exercices enchaînés en superset ou circuit). Rien ne le lit pour l'instant.
   A et B sont « intégrées » : nom, badge et jours fixes, exercices modifiables
   (stockés dans S.settings.programme[A|B] = { ex, tapis }).
   ===================================================================== */

const COULEURS={orange:'Orange',bleu:'Bleu',violet:'Violet',rouge:'Rouge',jaune:'Jaune',rose:'Rose',gris:'Gris'};
const JOURS_NOMS=['lundi','mardi','mercredi','jeudi','vendredi','samedi','dimanche'];
const BADGES_RESERVES={L:'à la séance libre','5':'au Five'};
const REPOS_CHOIX=[0,30,45,60,75,90,120,150,180,240];
const ERR_CODE='Ce code n\'est pas une séance Sporty valide.';

/* ---------- Lecture des modèles ---------- */
function ligneDefaut(id){const e=EX[id];return {id,sets:e.sets,min:e.min,max:e.max,rest:e.rest||0};}
function nettoyerLigne(l){
  const d=ligneDefaut(l.id),n=(v,a,b,def)=>{v=Math.round(Number(v));return isFinite(v)&&v>=a&&v<=b?v:def;};
  const out={id:l.id,sets:n(l.sets,1,20,d.sets),min:n(l.min,1,999,d.min),max:n(l.max,1,999,d.max),rest:n(l.rest,0,900,d.rest)};
  if(out.max<out.min)out.max=out.min;
  if(l.bloc!=null)out.bloc=l.bloc;
  return out;
}
function modeleAB(t){
  const p=PLANS[t],o=S.settings.programme&&S.settings.programme[t];
  let ex,tapis=true;
  if(Array.isArray(o))ex=o.filter(id=>EX[id]&&id!=='tapis').map(ligneDefaut);   // ancien format : liste d'ids
  else if(o&&Array.isArray(o.ex)){ex=o.ex.filter(l=>l&&EX[l.id]).map(nettoyerLigne);if(o.tapis===false)tapis=false;}
  else ex=p.ex.filter(id=>EX[id]).map(ligneDefaut);
  const opt=WEEK_OPTS[S.settings.plan]||WEEK_OPTS['1'];
  const jours=Object.keys(opt.days).filter(d=>opt.days[d]===t).map(Number);
  return {id:t,nom:p.title,badge:t,couleur:t==='A'?'orange':'bleu',desc:p.sub,tapis,jours,ex,integree:true,modifiee:!!o};
}
function modelesPerso(){return S.modeles||[];}
function modelesTous(){return [modeleAB('A'),modeleAB('B')].concat(modelesPerso());}
function modeleParId(id){
  if(id==='A'||id==='B')return modeleAB(id);
  return modelesPerso().find(m=>m.id===id)||null;
}
/* Nom, badge et couleur d'un modèle, y compris la séance libre et le Five. */
function infoModele(id){
  if(id==='L')return {id:'L',nom:'Séance libre',badge:'L',couleur:'noir',desc:'Tes exercices au choix'};
  if(id==='five')return {id:'five',nom:'Five',badge:'5',couleur:'violet',desc:'Foot du vendredi'};
  const m=modeleParId(id);
  return m?{id:m.id,nom:m.nom,badge:m.badge,couleur:m.couleur,desc:m.desc||''}:{id,nom:'Séance supprimée',badge:'?',couleur:'gris',desc:''};
}
/* Une séance enregistrée garde une copie du nom, du badge et de la couleur. */
function infoSeance(s){return s&&s.modele&&s.modele.nom?s.modele:infoModele(s.type);}
const copieInfo=i=>({id:i.id,nom:i.nom,badge:i.badge,couleur:i.couleur});

/* ---------- Badges ---------- */
const badgeNorm=b=>String(b==null?'':b).trim().toUpperCase();
function badgesPris(saufId){
  const m={A:'Séance A',B:'Séance B'};
  modelesPerso().forEach(x=>{if(x.id!==saufId)m[x.badge]=x.nom;});
  return m;
}
function badgeLibre(saufId){
  const pris=badgesPris(saufId);
  for(const c of 'CDEFGHIJKMNOPQRSTUVWXYZ')if(!pris[c])return c;
  for(let i=2;i<100;i++)for(const c of 'CDEFGH'){const b=c+i;if(!pris[b])return b;}
  return 'Z9';
}

/* ---------- Validation et enregistrement ---------- */
/* Renvoie un message d'erreur, ou null si le modèle est valable. */
function validerModele(m){
  if(!m.integree){
    if(!String(m.nom||'').trim())return 'Donne un nom à la séance.';
    const b=badgeNorm(m.badge);
    if(!b||b.length>2)return 'Choisis un badge de 1 ou 2 caractères.';
    if(BADGES_RESERVES[b])return `« ${b} » est réservé ${BADGES_RESERVES[b]}.`;
    const pris=badgesPris(m.id);
    if(pris[b])return `Le badge « ${b} » est déjà pris par « ${pris[b]} ».`;
    if(!COULEURS[m.couleur])return 'Choisis une couleur.';
  }
  if(!m.ex||!m.ex.filter(l=>EX[l.id]).length)return 'Ajoute au moins un exercice.';
  return null;
}
function nouveauModele(base){
  return Object.assign({id:null,nom:'',badge:badgeLibre(),couleur:'orange',desc:'',tapis:true,jours:[],ex:[]},base||{});
}
/* Enregistre (crée ou met à jour). Renvoie {ok, id} ou {erreur}. */
function enregistrerModele(m){
  const err=validerModele(m);if(err)return {erreur:err};
  const ex=m.ex.filter(l=>EX[l.id]).map(nettoyerLigne);
  if(m.integree){
    S.settings.programme=Object.assign({},S.settings.programme,{[m.id]:{ex,tapis:m.tapis!==false}});
    Store.saveSettings();return {ok:true,id:m.id};
  }
  const propre={id:m.id||'p_'+uid(),nom:String(m.nom).trim(),badge:badgeNorm(m.badge),couleur:m.couleur,
    desc:String(m.desc||'').trim(),tapis:m.tapis!==false,jours:[...new Set((m.jours||[]).map(Number).filter(d=>d>=1&&d<=7))].sort(),ex};
  const i=modelesPerso().findIndex(x=>x.id===propre.id);
  S.modeles=modelesPerso().slice();
  if(i>=0)S.modeles[i]=propre;else S.modeles.push(propre);
  Store.saveModeles();return {ok:true,id:propre.id};
}
function dupliquerModele(id){
  const m=modeleParId(id);if(!m)return null;
  return nouveauModele({nom:`${m.nom} (copie)`,couleur:m.couleur==='noir'?'orange':m.couleur,desc:m.desc||'',tapis:m.tapis,jours:[],ex:clone(m.ex)});
}
function supprimerModele(id){
  if(id==='A'||id==='B')return {erreur:'Les séances A et B ne peuvent pas être supprimées.'};
  if(!modeleParId(id))return {erreur:'Séance introuvable.'};
  S.modeles=modelesPerso().filter(m=>m.id!==id);Store.saveModeles();
  /* Les dates prévues de ce modèle disparaissent ; l'historique garde sa copie du nom et du badge. */
  const avant=(S.plans||[]).length;S.plans=(S.plans||[]).filter(p=>p.modele!==id);
  if(S.plans.length!==avant)Store.savePlans();
  return {ok:true};
}
function reinitialiserAB(t){
  const p=Object.assign({},S.settings.programme);delete p[t];S.settings.programme=p;Store.saveSettings();
}

/* Modèle à partir d'une séance faite : exercices dans l'ordre, séries réalisées. */
function modeleDepuisSeance(ses,nom){
  const ex=Object.keys(ses.ex||{}).filter(id=>EX[id]&&id!=='tapis').map(id=>Object.assign(ligneDefaut(id),{sets:Math.max(1,ses.ex[id].length)}));
  const tapis=!!(ses.ex&&ses.ex.tapis)||!!ses.tapis;
  return nouveauModele({nom:nom||'',tapis,ex});
}

/* Durée estimée en minutes, arrondie à 5. */
function dureeEstimee(m){
  let sec=0;
  (m.ex||[]).forEach(l=>{const e=EX[l.id];if(!e)return;
    if(e.mode==='time')sec+=l.max*60;
    else if(e.mode==='hold')sec+=l.sets*(l.max+l.rest);
    else sec+=l.sets*(40+l.rest)+60;});
  if(m.tapis&&!(m.ex||[]).some(l=>l.id==='tapis'))sec+=20*60;
  return Math.max(5,Math.round(sec/300)*5);
}

/* ---------- Démarrer et terminer ---------- */
function demarrerSeance(id,opts={}){
  const info=infoModele(id),m=id==='L'?null:modeleParId(id);
  const d={type:id,info:copieInfo(info),start:opts.start||Date.now(),list:[],sets:{},from:{},rx:{}};
  if(opts.planId)d.planId=opts.planId;
  S.draft=d;
  if(m){
    m.ex.forEach(l=>{if(!EX[l.id]||d.list.includes(l.id))return;d.list.push(l.id);d.rx[l.id]={sets:l.sets,min:l.min,max:l.max,rest:l.rest};});
    if(m.tapis&&!d.list.includes('tapis'))d.list.push('tapis');
  }
  d.list.forEach(x=>{d.sets[x]=initSets(x);});
  if(id==='B'&&S.settings.plan==='3'&&new Date(d.start).getDay()===4&&d.sets.tapis)d.sets.tapis[0].w='9';
  Store.saveDraft();
  return d;
}
/* Enregistre la séance en cours. Renvoie {ses, n, vol, records} ou {erreur}. */
function terminerSeance(fin){
  const d=S.draft;if(!d)return {erreur:'Aucune séance en cours.'};
  const ex={};let n=0,vol=0;
  d.list.forEach(id=>{const s=(d.sets[id]||[]).filter(x=>x.done).map(x=>({w:num(x.w)||0,r:num(x.r)||0}));if(s.length){ex[id]=s;n+=s.length;if(EX[id].mode==='kg')s.forEach(x=>vol+=x.w*x.r);}});
  if(!n)return {erreur:'Valide au moins une série, ou annule la séance.'};
  const info=d.info||copieInfo(infoModele(d.type));
  const ses={id:uid(),type:d.type,modele:copieInfo(info),date:dkey(new Date(d.start)),ts:d.start,dur:Math.max(1,Math.round(((fin||Date.now())-d.start)/60000)),ex};
  if(d.planId)ses.planId=d.planId;
  const rem={};Object.keys(ex).forEach(id=>{if(d.from&&d.from[id])rem[id]=d.from[id];});if(Object.keys(rem).length)ses.remplace=rem;
  const records=Object.keys(ex).filter(id=>{if(EX[id].mode!=='kg')return false;const prev=maxEver(id);const best=Math.max(...ex[id].map(x=>x.w));return prev>0&&best>prev;});
  S.sessions.push(ses);S.draft=null;
  Store.saveSession(ses);Store.saveDraft();
  return {ses,n,vol,records};
}

/* ---------- Séances prévues à une date ---------- */
function prevoir(modeleId,date){
  if(!modeleParId(modeleId))return {erreur:'Séance introuvable.'};
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date||''))return {erreur:'Choisis une date.'};
  const p={id:'d_'+uid(),date,modele:modeleId};
  S.plans=(S.plans||[]).concat([p]);Store.savePlans();return {ok:true,plan:p};
}
function deplacerPrevue(planId,date){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date||''))return {erreur:'Choisis une date.'};
  const p=(S.plans||[]).find(x=>x.id===planId);if(!p)return {erreur:'Séance prévue introuvable.'};
  S.plans=S.plans.map(x=>x.id===planId?Object.assign({},x,{date}):x);Store.savePlans();return {ok:true};
}
function retirerPrevue(planId){
  S.plans=(S.plans||[]).filter(x=>x.id!==planId);Store.savePlans();return {ok:true};
}

/* Ce qui est prévu et fait pendant une semaine.
   Renvoie une liste triée par date : { date, modele, src, planId?, ses?, etat }
   src : semaine (A, B, Five de « Mes jours de salle »), jours (séance perso avec jours),
         date (séance placée à une date), extra (séance faite sans être prévue).
   etat : fait, prevu (à venir ou aujourd'hui), passe (date passée, pas faite). */
function semaineItems(ws){
  const today=dkey(),items=[];
  const opt=WEEK_OPTS[S.settings.plan]||WEEK_OPTS['1'];
  for(let i=0;i<7;i++){
    const k=dkey(addDays(ws,i)),wd=i+1;
    if(opt.days[wd])items.push({date:k,modele:opt.days[wd],src:'semaine'});
    modelesPerso().forEach(m=>{if((m.jours||[]).includes(wd))items.push({date:k,modele:m.id,src:'jours'});});
  }
  (S.plans||[]).forEach(p=>{if(inWeek(p.date,ws))items.push({date:p.date,modele:p.modele,src:'date',planId:p.id});});
  const ses=S.sessions.filter(s=>s.date&&inWeek(s.date,ws)).sort((a,b)=>(a.ts||0)-(b.ts||0));
  const pris=new Set();
  const prendre=(it,f)=>{const s=ses.find(x=>!pris.has(x.id)&&f(x));if(s){pris.add(s.id);it.ses=s;}};
  items.filter(it=>it.src==='date').forEach(it=>prendre(it,s=>s.planId===it.planId));
  items.filter(it=>!it.ses).forEach(it=>prendre(it,s=>s.type===it.modele&&s.date===it.date));
  items.filter(it=>!it.ses&&it.src!=='date').forEach(it=>prendre(it,s=>s.type===it.modele&&!s.planId));
  ses.filter(s=>!pris.has(s.id)).forEach(s=>items.push({date:s.date,modele:s.type,src:'extra',ses:s}));
  items.forEach(it=>{it.etat=it.ses?'fait':it.date<today?'passe':'prevu';});
  return items.sort((a,b)=>a.date<b.date?-1:a.date>b.date?1:0);
}
/* Objectif de la semaine : séances de salle prévues (A, B, perso avec jours, séances placées). */
function objectifSemaine(ws){
  const it=semaineItems(ws).filter(x=>x.src!=='extra'&&x.modele!=='five');
  return {total:it.length,faites:it.filter(x=>x.etat==='fait').length};
}

/* ---------- Code de partage SPORTY-SEANCE-V1 ---------- */
const plage=(a,b)=>a===b?String(a):`${a}-${b}`;
function codeSeance(id){
  const m=modeleParId(id);if(!m)return '';
  const o={nom:m.nom,badge:m.badge,couleur:m.couleur,description:m.desc||'',tapis:!!m.tapis,
    jours:(m.integree?[]:m.jours||[]).map(d=>JOURS_NOMS[d-1]),
    exercices:m.ex.map(l=>{const e=EX[l.id],x={id:l.id,nom:e.name,series:l.sets};
      if(e.mode==='kg'||e.mode==='bw')x.reps=plage(l.min,l.max);else x.duree=plage(l.min,l.max);
      x.repos=l.rest;return x;})};
  return 'SPORTY-SEANCE-V1\n'+JSON.stringify(o,null,2);
}
const nomCle=s=>norm(String(s||'')).replace(/[’']/g,' ').replace(/\s+/g,' ').trim();
const sansParentheses=s=>nomCle(String(s||'').replace(/\([^)]*\)/g,''));
function trouverExercice(raw){
  if(raw.id&&EX[raw.id])return raw.id;
  const n=nomCle(raw.nom);if(!n)return null;
  const ids=Object.keys(EX);
  return ids.find(id=>nomCle(EX[id].name)===n)||ids.find(id=>sansParentheses(EX[id].name)===sansParentheses(raw.nom))||null;
}
function lirePlage(v){
  if(v==null||v==='')return null;
  const m=String(v).match(/\d+/g);if(!m)return null;
  const a=+m[0],b=m[1]!=null?+m[1]:a;return {min:Math.min(a,b),max:Math.max(a,b)};
}
function ligneDepuisCode(id,raw){
  const l=ligneDefaut(id),e=EX[id];
  const r=e.mode==='kg'||e.mode==='bw'?lirePlage(raw.reps!=null?raw.reps:raw.duree):lirePlage(raw.duree!=null?raw.duree:raw.reps);
  if(r){l.min=r.min;l.max=r.max;}
  if(raw.series!=null)l.sets=raw.series;
  if(raw.repos!=null)l.rest=raw.repos;
  return nettoyerLigne(l);
}
/* Lit un code. Lève une erreur au message clair si le code est illisible.
   Renvoie { modele, lignes:[{ok, id?, nom, raw}], date, messages, memeNom } */
function lireCodeSeance(txt){
  const s=String(txt==null?'':txt).replace(/[“”„‟«»″]/g,'"');
  const a=s.indexOf('{'),b=s.lastIndexOf('}');
  if(a<0||b<=a)throw new Error(ERR_CODE);
  let o;try{o=JSON.parse(s.slice(a,b+1));}catch(e){throw new Error(ERR_CODE);}
  if(!o||typeof o!=='object'||Array.isArray(o))throw new Error(ERR_CODE);
  const nom=String(o.nom==null?'':o.nom).trim();
  if(!nom)throw new Error(ERR_CODE+' Il manque le nom de la séance.');
  if(!Array.isArray(o.exercices)||!o.exercices.length)throw new Error(ERR_CODE+' Il ne contient aucun exercice.');
  const messages=[];
  const lignes=o.exercices.filter(x=>x&&typeof x==='object').map(raw=>{
    const id=trouverExercice(raw);
    return id?{ok:true,id,nom:EX[id].name,raw,ligne:ligneDepuisCode(id,raw)}:{ok:false,nom:String(raw.nom||raw.id||'Exercice sans nom'),raw};
  });
  if(!lignes.length)throw new Error(ERR_CODE+' Il ne contient aucun exercice.');
  let couleur=norm(String(o.couleur||'')).trim();
  if(!COULEURS[couleur]){if(couleur)messages.push(`Couleur « ${o.couleur} » inconnue : la séance sera orange.`);couleur='orange';}
  const jours=(Array.isArray(o.jours)?o.jours:[]).map(j=>JOURS_NOMS.indexOf(norm(String(j)).trim())+1).filter(d=>d>0);
  const date=typeof o.date==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(o.date)&&!isNaN(pkey(o.date))?o.date:null;
  const memeNom=(modelesPerso().find(m=>nomCle(m.nom)===nomCle(nom))||{}).id||null;
  const modele=nouveauModele({nom,couleur,desc:String(o.description||'').trim(),tapis:o.tapis!==false,jours,badge:''});
  const res={modele,lignes,date,messages,memeNom,badgeDemande:badgeNorm(o.badge)};
  attribuerBadge(res,null);
  return res;
}
/* Garde le badge demandé s'il est libre, sinon prend le prochain libre et le signale. */
function attribuerBadge(res,saufId){
  const b=res.badgeDemande,pris=badgesPris(saufId);
  res.messages=res.messages.filter(m=>!m.startsWith('Le badge'));
  if(b&&b.length<=2&&!BADGES_RESERVES[b]&&!pris[b]){res.modele.badge=b;return;}
  const libre=badgeLibre(saufId);
  if(b)res.messages.push(`Le badge « ${b} » ${BADGES_RESERVES[b]?'est réservé':pris[b]?`est déjà pris par « ${pris[b]} »`:'n\'est pas valable'} : la séance prend « ${libre} ».`);
  res.modele.badge=libre;
}
/* Enregistre la séance lue. remplacer : écrase la séance perso du même nom. */
function enregistrerCode(res,{remplacer}={}){
  const m=clone(res.modele);
  m.ex=res.lignes.filter(l=>l.ok&&!l.ignore).map(l=>l.ligne);
  if(remplacer&&res.memeNom){
    m.id=res.memeNom;
    if(!res.badgeDemande)m.badge=modeleParId(res.memeNom).badge;
    else{attribuerBadge(res,res.memeNom);m.badge=res.modele.badge;}
  }
  else{m.id=null;attribuerBadge(res,null);m.badge=res.modele.badge;}
  return enregistrerModele(m);
}
