'use strict';
/* =====================================================================
   Sauvegarde dans un fichier, import d'un fichier, rappel tous les 30 jours.
   Le format du fichier reprend celui de la v2 (seances, pesees, activite,
   reglages) : un fichier v2 ou v3 s'importe de la même façon.
   ===================================================================== */
const RAPPEL_JOURS=30;

function nomFichierSauvegarde(){return `sporty-sauvegarde-${dkey()}.json`;}
const LIMITE_SAUVEGARDE=20*1024*1024;
/* avecPhotos : inclure mes photos d'exercices (case « Inclure mes photos », cochée par défaut). */
function contenuSauvegarde(avecPhotos){
  const o={app:'sporty',version:6,exporte_le:new Date().toISOString(),seances:S.sessions,pesees:S.weights,activite:S.days,reglages:S.settings,modeles:S.modeles||[],prevues:S.plans||[],exceptions:S.exceptions||[]};
  if(avecPhotos&&nbPhotos())o.photos=S.photos;
  return JSON.stringify(o,null,1);
}
const tailleMo=t=>(new Blob([t]).size/1024/1024);
function marquerSauvegarde(){S.meta.lastBackup=Date.now();delete S.meta.snooze;Store.saveMeta();}

/* Sur iPhone, la feuille de partage propose « Enregistrer dans Fichiers » (iCloud Drive ou le téléphone).
   Sur ordinateur, ou si le partage n'est pas possible : téléchargement classique. */
async function sauvegarder(confirme){
  const caseP=$('#bk-photos'),avecPhotos=caseP?caseP.checked:true;
  const txt=contenuSauvegarde(avecPhotos),nom=nomFichierSauvegarde();
  const mo=tailleMo(txt);
  if(!confirme&&mo*1024*1024>LIMITE_SAUVEGARDE){
    confirmBox('Fichier volumineux',`La sauvegarde fait ${fmt1(mo)} Mo, surtout à cause de tes photos. Tu peux continuer, ou décocher « Inclure mes photos » pour un fichier plus léger.`,'Continuer',()=>{sauvegarder(true);});
    return;
  }
  let fichier=null;
  try{fichier=new File([txt],nom,{type:'application/json'});}catch(e){}
  if(fichier&&navigator.canShare&&navigator.canShare({files:[fichier]})){
    try{
      await navigator.share({files:[fichier],title:'Sauvegarde Sporty'});
      marquerSauvegarde();render();toast('Sauvegarde enregistrée');return;
    }catch(e){
      if(e&&e.name==='AbortError'){toast('Sauvegarde annulée');return;}
      console.warn(e);
    }
  }
  try{
    const url=URL.createObjectURL(new Blob([txt],{type:'application/json'}));
    const a=document.createElement('a');a.href=url;a.download=nom;document.body.appendChild(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),10000);
    marquerSauvegarde();render();toast('Fichier de sauvegarde téléchargé');
  }catch(e){console.warn(e);toast('Impossible de créer le fichier de sauvegarde.');}
}

/* ---------- Lecture et vérification d'un fichier importé ---------- */
const isDate=k=>typeof k==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(k);
function lireSauvegarde(txt){
  let o;
  try{o=JSON.parse(String(txt).replace(/^﻿/,'').trim());}catch(e){throw new Error('Ce fichier n\'est pas une sauvegarde Sporty lisible.');}
  if(!o||typeof o!=='object'||Array.isArray(o))throw new Error('Ce fichier n\'est pas une sauvegarde Sporty.');
  const has=['seances','pesees','activite','reglages','modeles','prevues','exceptions'].some(k=>k in o);
  if(!has)throw new Error('Ce fichier ne contient ni séances, ni pesées, ni activité.');
  const arr=x=>Array.isArray(x)?x:[];
  const seances=arr(o.seances).filter(s=>s&&typeof s==='object'&&s.type&&isDate(s.date)).map(s=>Object.assign({},s,{id:s.id?String(s.id):uid()}));
  const pesees=arr(o.pesees).map(w=>w&&{date:w.date,kg:typeof w.kg==='number'?w.kg:num(w.kg)}).filter(w=>w&&isDate(w.date)&&w.kg>=30&&w.kg<=300);
  const activite=arr(o.activite).filter(d=>d&&isDate(d.date)).map(d=>{const x={date:d.date};if(typeof d.steps==='number')x.steps=d.steps;if(typeof d.kcal==='number')x.kcal=d.kcal;return x;}).filter(d=>d.steps!=null||d.kcal!=null);
  const reglages=o.reglages&&typeof o.reglages==='object'&&!Array.isArray(o.reglages)?o.reglages:null;
  /* v4 : séances perso et dates prévues (absentes des sauvegardes plus anciennes). */
  const modeles=arr(o.modeles).filter(m=>m&&typeof m==='object'&&m.id&&m.nom&&Array.isArray(m.ex)).map(m=>({
    id:String(m.id),nom:String(m.nom),badge:badgeNorm(m.badge)||'?',couleur:COULEURS[m.couleur]?m.couleur:'orange',
    desc:String(m.desc||''),tapis:m.tapis!==false,jours:arr(m.jours).map(Number).filter(d=>d>=1&&d<=7),
    ex:m.ex.filter(l=>l&&typeof l==='object'&&l.id).map(l=>Object.assign({},l,{id:String(l.id)}))}));
  const prevues=arr(o.prevues).filter(p=>p&&p.id&&isDate(p.date)&&p.modele).map(p=>({id:String(p.id),date:p.date,modele:String(p.modele)}));
  /* v5 : séances récurrentes déplacées ou retirées pour une semaine. */
  const exceptions=arr(o.exceptions).filter(e=>e&&e.id&&e.modele&&isDate(e.origine)&&(e.action==='retire'||(e.action==='deplace'&&isDate(e.vers)))).map(e=>{const x={id:String(e.id),modele:String(e.modele),origine:e.origine,action:e.action};if(e.action==='deplace')x.vers=e.vers;return x;});
  /* v6 : mes photos d'exercices (facultatives). null = le fichier n'en contient pas. */
  let photos=null;
  if(o.photos&&typeof o.photos==='object'&&!Array.isArray(o.photos)){
    photos={};
    for(const [id,imgs] of Object.entries(o.photos)){const ok=arr(imgs).filter(u=>typeof u==='string'&&/^data:image\/(jpeg|png|webp);base64,/.test(u)).slice(0,2);if(ok.length)photos[id]=ok;}
  }
  return {seances,pesees,activite,reglages,modeles,prevues,exceptions,photos,date:o.exporte_le||null,version:o.version||2};
}

let importEnAttente=null;
function ouvrirImport(){
  importEnAttente=null;
  openModal(`<div class="sheet-head"><div><div class="eyebrow">Mes données</div><h2 class="title-l">Importer une sauvegarde</h2></div><button class="x" data-act="close" aria-label="Fermer">${I.x}</button></div>
    <p class="small muted" style="margin:0">Choisis un fichier de sauvegarde Sporty (<span class="code">.json</span>) dans Fichiers ou iCloud Drive. Les sauvegardes de la v2 marchent aussi.</p>
    <label class="btn primary block" style="cursor:pointer">Choisir le fichier<input type="file" id="importfile" accept=".json,.txt,application/json,text/plain" hidden></label>
    <details class="small"><summary class="muted" style="cursor:pointer">Tu as seulement copié la sauvegarde de la v2 ?</summary>
      <div class="stack" style="gap:8px;margin-top:8px">
        <p class="muted" style="margin:0">Dans la v2, le bouton « Copier une sauvegarde » met le texte dans le presse-papiers. Colle-le ici.</p>
        <textarea class="input" id="importtxt" style="height:120px;padding:10px;font-family:ui-monospace,Menlo,monospace;font-size:12px" placeholder='{"seances":[…],"pesees":[…]…}' aria-label="Texte de la sauvegarde"></textarea>
        <button class="btn ghost block" data-act="importtxt">Lire le texte collé</button>
      </div></details>
    <div id="importres"></div>`);
}
function apercuImport(r){
  importEnAttente=r;
  const d=r.date?new Date(r.date):null;
  const n=(x,s,p)=>`${x} ${x>1?p:s}`;
  $('#importres').innerHTML=`<section class="card stack" style="box-shadow:none;border:1px solid var(--line)">
    <h3 class="title-m">Contenu du fichier</h3>
    <ul class="cues" style="margin:0">
      <li>${n(r.seances.length,'séance','séances')}</li>
      <li>${n(r.pesees.length,'pesée','pesées')}</li>
      <li>${n(r.activite.length,'jour d\'activité','jours d\'activité')}</li>
      ${r.modeles.length?`<li>${n(r.modeles.length,'séance perso','séances perso')}</li>`:''}
      ${r.prevues.length?`<li>${n(r.prevues.length,'séance prévue à une date','séances prévues à une date')}</li>`:''}
      ${r.photos&&Object.keys(r.photos).length?`<li>${n(Object.keys(r.photos).length,'exercice avec mes photos','exercices avec mes photos')}</li>`:''}
      ${r.exceptions.length?`<li>${n(r.exceptions.length,'changement de semaine (séance déplacée ou retirée)','changements de semaine (séances déplacées ou retirées)')}</li>`:''}
      <li>${r.reglages?'Tes réglages (thème, jours, objectif, alternatives, exercices perso)':'Pas de réglages'}</li>
    </ul>
    ${d&&!isNaN(d)?`<p class="small muted" style="margin:0">Sauvegarde du ${d.getDate()} ${MONTHS_LONG[d.getMonth()]} ${d.getFullYear()}.</p>`:''}
    <button class="btn primary block" data-act="importfusion">Ajouter à mes données</button>
    <p class="small muted" style="margin:-4px 0 0">Garde ce qui est déjà dans l'appli. Pour un même jour, la pesée et l'activité du fichier remplacent celles de l'appli.</p>
    <button class="btn ghost block" data-act="importremplacer" style="color:var(--danger)">Tout remplacer par le fichier</button>
  </section>`;
  $('#importres').scrollIntoView({block:'nearest',behavior:'smooth'});
}
function erreurImport(msg){$('#importres').innerHTML=`<p class="hint" style="color:var(--danger)">${esc(msg)}</p>`;}
function lireTexteImport(txt){try{apercuImport(lireSauvegarde(txt));}catch(e){erreurImport(e.message);}}

/* Ajoute les séances perso et dates prévues du fichier ; un badge déjà pris par une autre séance est remplacé. */
function fusionnerSeancesPerso(r){
  const mm=new Map((S.modeles||[]).map(m=>[m.id,m]));
  r.modeles.forEach(m=>{mm.set(m.id,Object.assign({},m));});
  S.modeles=[];
  for(const m of mm.values()){
    const pris=badgesPris(null);
    if(!m.badge||m.badge.length>2||BADGES_RESERVES[m.badge]||pris[m.badge])m.badge=badgeLibre(null);
    S.modeles.push(m);
  }
  const pm=new Map((S.plans||[]).map(p=>[p.id,p]));r.prevues.forEach(p=>pm.set(p.id,p));S.plans=[...pm.values()];
  /* une seule exception par séance et par date d'origine : celle du fichier l'emporte */
  const cle=e=>e.modele+'|'+e.origine,em=new Map((S.exceptions||[]).map(e=>[cle(e),e]));r.exceptions.forEach(e=>em.set(cle(e),e));S.exceptions=[...em.values()];
}
async function appliquerImport(remplacer){
  const r=importEnAttente;if(!r)return;
  const avant=clone({photos:S.photos||{},settings:S.settings,sessions:S.sessions,weights:S.weights,days:S.days,modeles:S.modeles||[],plans:S.plans||[],exceptions:S.exceptions||[]});
  /* Appli encore vide (premier import) : on reprend aussi le thème, les jours et l'objectif du fichier. */
  const vide=!S.sessions.length&&!S.weights.length&&!S.days.length;
  if(remplacer||vide){
    S.sessions=r.seances;S.weights=r.pesees;S.days=r.activite;
    if(remplacer){S.modeles=r.modeles;S.plans=r.prevues;S.exceptions=r.exceptions;}
    if(r.photos)S.photos=remplacer?r.photos:Object.assign({},S.photos,r.photos);
    else fusionnerSeancesPerso(r);
    if(r.reglages)S.settings=Object.assign({theme:'auto',plan:'1',goal:72,videos:{},alts:{},custom:[]},r.reglages);
  }else{
    const byId=new Map(S.sessions.map(s=>[s.id,s]));r.seances.forEach(s=>byId.set(s.id,s));S.sessions=[...byId.values()];
    const wm=new Map(S.weights.map(w=>[w.date,w]));r.pesees.forEach(w=>wm.set(w.date,w));S.weights=[...wm.values()];
    if(r.photos)S.photos=Object.assign({},S.photos,r.photos);
    fusionnerSeancesPerso(r);
    const dm=new Map(S.days.map(d=>[d.date,d]));r.activite.forEach(d=>dm.set(d.date,Object.assign({},dm.get(d.date),d)));S.days=[...dm.values()];
    if(r.reglages){
      const g=r.reglages,cur=S.settings;
      const customs=new Map((cur.custom||[]).map(c=>[c.id,c]));(g.custom||[]).forEach(c=>c&&c.id&&customs.set(c.id,c));
      S.settings=Object.assign({},cur,{
        videos:Object.assign({},g.videos,cur.videos),
        alts:Object.assign({},g.alts,cur.alts),
        custom:[...customs.values()]
      });
    }
  }
  try{
    await Store.toutEnregistrer();
  }catch(e){
    console.warn(e);Object.assign(S,avant);
    toast('Import impossible : rien n\'a été modifié.');return;
  }
  importEnAttente=null;buildEx();closeModal();applyTheme();render();
  toast(`Import terminé : ${r.seances.length} séances, ${r.pesees.length} pesées`);
}

/* ---------- Rappel discret ---------- */
function joursDepuisSauvegarde(){
  if(S.meta.lastBackup)return Math.floor((Date.now()-S.meta.lastBackup)/864e5);
  /* Jamais sauvegardé : on compte depuis la donnée la plus ancienne. */
  const dates=S.sessions.map(s=>s.date).concat(S.weights.map(w=>w.date),S.days.map(d=>d.date)).filter(isDate).sort();
  if(!dates.length)return 0;
  return Math.floor((Date.now()-pkey(dates[0]).getTime())/864e5);
}
function rappelSauvegarde(){
  const j=joursDepuisSauvegarde();
  if(j<RAPPEL_JOURS)return '';
  if(S.meta.snooze&&Date.now()<S.meta.snooze)return '';
  const txt=S.meta.lastBackup?`Dernière sauvegarde il y a ${j} jours.`:'Tu n\'as encore jamais sauvegardé tes données.';
  return `<div class="nudge" role="status">${I.save}<span>${txt}</span><button class="link" data-act="backup">Sauvegarder</button><button class="x" data-act="snooze" aria-label="Me le rappeler plus tard">${I.x}</button></div>`;
}
function texteDerniereSauvegarde(){
  if(!S.meta.lastBackup)return 'Aucune sauvegarde pour l\'instant.';
  const d=new Date(S.meta.lastBackup),j=Math.floor((Date.now()-S.meta.lastBackup)/864e5);
  return `Dernière sauvegarde : ${d.getDate()} ${MONTHS_LONG[d.getMonth()]} ${d.getFullYear()}${j===0?' (aujourd\'hui)':j===1?' (hier)':` (il y a ${j} jours)`}.`;
}
