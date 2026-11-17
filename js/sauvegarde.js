'use strict';
/* =====================================================================
   Sauvegarde dans un fichier, import d'un fichier, rappel tous les 30 jours.
   Le format du fichier reprend celui de la v2 (seances, pesees, activite,
   reglages) : un fichier v2 ou v3 s'importe de la même façon.
   ===================================================================== */
const RAPPEL_JOURS=30;

function nomFichierSauvegarde(){return `sporty-sauvegarde-${dkey()}.json`;}
function contenuSauvegarde(){
  return JSON.stringify({app:'sporty',version:3,exporte_le:new Date().toISOString(),seances:S.sessions,pesees:S.weights,activite:S.days,reglages:S.settings},null,1);
}
function marquerSauvegarde(){S.meta.lastBackup=Date.now();delete S.meta.snooze;Store.saveMeta();}

/* Sur iPhone, la feuille de partage propose « Enregistrer dans Fichiers » (iCloud Drive ou le téléphone).
   Sur ordinateur, ou si le partage n'est pas possible : téléchargement classique. */
async function sauvegarder(){
  const txt=contenuSauvegarde(),nom=nomFichierSauvegarde();
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
  const has=['seances','pesees','activite','reglages'].some(k=>k in o);
  if(!has)throw new Error('Ce fichier ne contient ni séances, ni pesées, ni activité.');
  const arr=x=>Array.isArray(x)?x:[];
  const seances=arr(o.seances).filter(s=>s&&typeof s==='object'&&s.type&&isDate(s.date)).map(s=>Object.assign({},s,{id:s.id?String(s.id):uid()}));
  const pesees=arr(o.pesees).map(w=>w&&{date:w.date,kg:typeof w.kg==='number'?w.kg:num(w.kg)}).filter(w=>w&&isDate(w.date)&&w.kg>=30&&w.kg<=300);
  const activite=arr(o.activite).filter(d=>d&&isDate(d.date)).map(d=>{const x={date:d.date};if(typeof d.steps==='number')x.steps=d.steps;if(typeof d.kcal==='number')x.kcal=d.kcal;return x;}).filter(d=>d.steps!=null||d.kcal!=null);
  const reglages=o.reglages&&typeof o.reglages==='object'&&!Array.isArray(o.reglages)?o.reglages:null;
  return {seances,pesees,activite,reglages,date:o.exporte_le||null,version:o.version||2};
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

async function appliquerImport(remplacer){
  const r=importEnAttente;if(!r)return;
  const avant=clone({settings:S.settings,sessions:S.sessions,weights:S.weights,days:S.days});
  /* Appli encore vide (premier import) : on reprend aussi le thème, les jours et l'objectif du fichier. */
  const vide=!S.sessions.length&&!S.weights.length&&!S.days.length;
  if(remplacer||vide){
    S.sessions=r.seances;S.weights=r.pesees;S.days=r.activite;
    if(r.reglages)S.settings=Object.assign({theme:'auto',plan:'1',goal:72,videos:{},alts:{},custom:[]},r.reglages);
  }else{
    const byId=new Map(S.sessions.map(s=>[s.id,s]));r.seances.forEach(s=>byId.set(s.id,s));S.sessions=[...byId.values()];
    const wm=new Map(S.weights.map(w=>[w.date,w]));r.pesees.forEach(w=>wm.set(w.date,w));S.weights=[...wm.values()];
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
