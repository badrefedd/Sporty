'use strict';
/* =====================================================================
   Écrans des séances : onglet Séance, Mes séances, éditeur, journée,
   coller une séance (code SPORTY-SEANCE-V1).
   ===================================================================== */

/* Badge coloré. etat : '' (plein), 'out' (prévu), 'passe' (gris), 'fait' (plein + ✓). */
function badgeHTML(info,etat){
  return `<span class="badge c-${esc(info.couleur||'gris')}${etat?' '+etat:''}">${esc(info.badge)}</span>`;
}
const uniteLigne=id=>{const m=(EX[id]||{}).mode;return m==='time'?'min':m==='hold'?'s':'rép.';};
function resumeModele(m){const n=m.ex.length;return `${n} exercice${n>1?'s':''} · ~${dureeEstimee(m)} min`;}
function joursTxt(m){return (m.jours||[]).length?(m.jours||[]).map(d=>DAYS[d-1]).join(', '):'';}

/* ---------- Onglet Séance ---------- */
function viewChoose(){
  const st=weekStatus();
  const carte=m=>{const info=infoModele(m.id),fait=(m.id==='A'||m.id==='B')&&st[m.id];
    return `<button class="scard" data-act="start" data-type="${m.id}">${badgeHTML(info)}<b>${esc(m.nom)}</b><span class="small muted">${esc(m.desc||'')}</span><span class="small">${resumeModele(m)}${fait?' · faite cette semaine':''}</span></button>`;};
  return `<div class="head-row"><div><div class="eyebrow">Séance</div><h1 class="title-xl">Quelle séance ?</h1></div><button class="icon-btn" data-act="coller">${I.paste}<span>Coller</span></button></div>
  <div class="choice">${modelesTous().map(carte).join('')}
    <button class="scard" data-act="start" data-type="L">${badgeHTML(infoModele('L'))}<b>Séance libre</b><span class="small muted">Tes exercices au choix</span><span class="small">Ajoute les exos en direct</span></button>
    <button class="scard" data-act="five">${badgeHTML(infoModele('five'))}<b>Five</b><span class="small muted">Foot du vendredi</span><span class="small">${st.five?'Noté cette semaine':'À noter'}</span></button>
  </div>
  <div class="row"><a class="btn ghost" style="flex:1" href="#seances">Gérer mes séances</a><button class="btn ghost" style="flex:1" data-act="newseance">${I.plus} Créer</button></div>
  <section class="card stack"><h2 class="title-m">Les règles</h2>
  <ul class="cues"><li>Repos de 1 min 30 à 2 min sur les gros exercices, 1 min sur les petits. Le minuteur se lance tout seul quand tu valides une série.</li><li>Quand tu atteins le haut de la fourchette sur toutes les séries, Sporty te propose de monter la charge.</li><li>Machine prise ? Touche « Alternative » sur l'exercice.</li><li>Séance ratée : fais celle qui manque à la prochaine occasion, sans rattraper.</li></ul></section>`;
}

/* ---------- Mes séances ---------- */
function viewSeances(){
  const ligne=m=>`<section class="card stack mseance">
    <div class="row" style="align-items:flex-start">${badgeHTML(infoModele(m.id))}<div style="flex:1;min-width:0"><b class="title-m" style="font-size:19px">${esc(m.nom)}</b>
      <div class="small muted">${esc(m.desc||'')}</div><div class="small">${resumeModele(m)}${m.tapis?' · tapis':''}${!m.integree&&joursTxt(m)?' · '+joursTxt(m):''}</div></div></div>
    <div class="mseance-act">
      <button class="btn sm ghost" data-act="editseance" data-m="${m.id}">${I.edit} Modifier</button>
      <button class="btn sm ghost" data-act="dupseance" data-m="${m.id}">${I.copy} Dupliquer</button>
      <button class="btn sm ghost" data-act="copycode" data-m="${m.id}">${I.share} Copier le code</button>
      ${m.integree?'':`<button class="btn sm ghost rm" data-act="delseance" data-m="${m.id}">${I.trash} Supprimer</button>`}
    </div></section>`;
  return `<div><a class="link small" href="#reglages">← Réglages</a><div class="eyebrow" style="margin-top:8px">Réglages</div><h1 class="title-xl">Mes séances</h1></div>
  <div class="row"><button class="btn primary" style="flex:1" data-act="newseance">${I.plus} Créer une séance</button><button class="btn ghost" style="flex:1" data-act="coller">${I.paste} Coller une séance</button></div>
  ${modelesTous().map(ligne).join('')}
  <p class="small muted" style="margin:0">« Copier le code » met la séance dans le presse-papiers : tu peux l'envoyer à Claude pour qu'il la modifie, puis la recoller avec « Coller une séance ».</p>`;
}

/* ---------- Éditeur ---------- */
function ouvrirEditeur(m,retour){
  S.edit={m:clone(m),retour:retour||location.hash.slice(1)||'seances'};
  if(location.hash==='#seance-edit')render();else location.hash='seance-edit';
  window.scrollTo(0,0);
}
function viewEditeur(){
  const E=S.edit;if(!E){setTimeout(()=>{location.hash='seances';});return '';}
  const m=E.m,neuf=!m.id;
  const lignes=m.ex.map((l,i)=>{const e=EX[l.id];if(!e)return '';const u=uniteLigne(l.id);return `<div class="ed-ex">
    <div class="row" style="gap:4px"><span class="prog-n">${i+1}</span><button class="prog-nm" data-act="exinfo" data-ex="${l.id}"><b>${esc(e.name)}</b><br><span class="small muted">${esc(e.equip)}</span></button>
      <button class="x" data-act="edup" data-i="${i}" ${i===0?'disabled':''} aria-label="Monter ${esc(e.name)}">${I.up}</button>
      <button class="x" data-act="eddown" data-i="${i}" ${i===m.ex.length-1?'disabled':''} aria-label="Descendre ${esc(e.name)}">${I.down}</button>
      <button class="x" data-act="edrm" data-i="${i}" aria-label="Retirer ${esc(e.name)}">${I.trash}</button></div>
    <div class="ed-f">
      <label><span>Séries</span><input inputmode="numeric" data-edi="${i}" data-edf="sets" value="${l.sets}" aria-label="Séries pour ${esc(e.name)}"></label>
      <label><span>${u==='rép.'?'Rép. min':u==='s'?'Sec. min':'Min. min'}</span><input inputmode="numeric" data-edi="${i}" data-edf="min" value="${l.min}" aria-label="Minimum pour ${esc(e.name)}"></label>
      <label><span>${u==='rép.'?'Rép. max':u==='s'?'Sec. max':'Min. max'}</span><input inputmode="numeric" data-edi="${i}" data-edf="max" value="${l.max}" aria-label="Maximum pour ${esc(e.name)}"></label>
      <label><span>Repos</span><select data-edi="${i}" data-edf="rest" aria-label="Repos pour ${esc(e.name)}">${REPOS_CHOIX.concat(REPOS_CHOIX.includes(+l.rest)?[]:[+l.rest]).map(r=>`<option value="${r}" ${+l.rest===r?'selected':''}>${r?(r>=60?`${Math.floor(r/60)} min${r%60?' '+(r%60):''}`:r+' s'):'aucun'}</option>`).join('')}</select></label>
    </div></div>`;}).join('');
  return `<div><button class="link small" data-act="edcancel">← Annuler</button><div class="eyebrow" style="margin-top:8px">${neuf?'Nouvelle séance':'Modifier la séance'}</div><h1 class="title-xl">${m.integree?esc(m.nom):neuf?'Créer une séance':esc(m.nom||'Séance')}</h1></div>
  ${m.integree?`<p class="small muted" style="margin:0">Le nom, le badge et les jours de ${esc(m.nom)} sont fixes (jours : Réglages → Mes jours de salle). Tu peux changer les exercices et leurs valeurs.</p>`:`
  <section class="card stack">
    <label class="stack" style="gap:6px"><span class="small" style="font-weight:700">Nom</span><input class="input" id="ed-nom" maxlength="40" placeholder="Ex. : Bras, Express 30 min" value="${esc(m.nom)}"></label>
    <div class="row" style="align-items:flex-start">
      <label class="stack" style="gap:6px;width:80px;flex:none"><span class="small" style="font-weight:700">Badge</span><input class="input" id="ed-badge" maxlength="2" autocapitalize="characters" value="${esc(m.badge)}" style="text-align:center;font-weight:800"></label>
      <div class="stack" style="gap:6px;flex:1"><span class="small" style="font-weight:700">Couleur</span><div class="couleurs">${Object.keys(COULEURS).map(c=>`<button class="pastille c-${c} ${m.couleur===c?'on':''}" data-act="edcouleur" data-c="${c}" aria-label="${COULEURS[c]}" aria-pressed="${m.couleur===c}"></button>`).join('')}</div></div>
    </div>
    <p class="small muted" style="margin:-4px 0 0">1 ou 2 caractères. « L » et « 5 » sont réservés à la séance libre et au Five.</p>
    <label class="stack" style="gap:6px"><span class="small" style="font-weight:700">Description <span class="muted">(facultatif)</span></span><input class="input" id="ed-desc" maxlength="60" placeholder="Ex. : Haut du corps, jambes légères" value="${esc(m.desc||'')}"></label>
  </section>`}
  <section class="card stack">
    <h2 class="title-m">Exercices</h2>
    ${lignes||'<div class="empty">Ajoute au moins un exercice.</div>'}
    <button class="btn ghost block" data-act="edadd">${I.plus} Ajouter un exercice</button>
    <label class="opt ${m.tapis?'on':''}"><input type="checkbox" id="ed-tapis" ${m.tapis?'checked':''} hidden><span class="dot"></span><span><b>20 min de tapis à la fin</b><br><span class="small muted">Incliné, 10 à 12 %</span></span></label>
  </section>
  ${m.integree?'':`<section class="card stack"><h2 class="title-m">Jours prévus <span class="small muted">(facultatif)</span></h2>
    <div class="jours">${DAYS.map((d,i)=>`<button class="chip ${(m.jours||[]).includes(i+1)?'on':''}" data-act="edjour" data-d="${i+1}" aria-pressed="${(m.jours||[]).includes(i+1)}">${d}</button>`).join('')}</div>
    <p class="small muted" style="margin:0">La séance apparaît ces jours-là dans la vue Semaine et compte dans l'objectif de la semaine.</p></section>`}
  <p class="hint" id="ed-err" style="color:var(--danger)" hidden></p>
  <button class="btn primary block" data-act="edsave">Enregistrer</button>
  ${m.integree&&m.modifiee?`<button class="btn ghost block" data-act="edreset">Revenir à la ${esc(m.nom)} d'origine</button>`:''}
  ${!m.integree&&m.id?`<button class="btn ghost block rm" data-act="delseance" data-m="${m.id}">${I.trash} Supprimer cette séance</button>`:''}`;
}

/* ---------- Journée (semaine et mois) ---------- */
function itemsDuJour(k){
  const ws=weekStart(pkey(k));return semaineItems(ws).filter(x=>x.date===k);
}
function daySheet(k){
  const ses=S.sessions.filter(s=>s.date===k).sort((a,b)=>(a.ts||0)-(b.ts||0));
  const w=S.weights.find(x=>x.date===k),act=dayData(k)||{};
  const future=k>dkey();
  const prevus=itemsDuJour(k).filter(x=>x.src!=='extra'&&x.etat!=='fait'&&x.modele!=='five');
  const prevuHTML=prevus.map(it=>{const info=infoModele(it.modele);return `<div class="prevu">
    <div class="row">${badgeHTML(info,it.etat==='passe'?'passe':'out')}<b style="flex:1">${esc(info.nom)}</b><span class="small muted">${it.src==='date'?'prévue ce jour':'chaque semaine'}</span></div>
    <div class="row" style="flex-wrap:wrap">
      <button class="btn sm primary" data-act="start" data-type="${it.modele}" ${it.planId?`data-plan="${it.planId}"`:''}>${I.play} Démarrer</button>
      ${it.src==='date'?`<button class="btn sm ghost" data-act="pmove" data-plan="${it.planId}">Déplacer</button><button class="btn sm ghost rm" data-act="pdel" data-plan="${it.planId}">Retirer de ce jour</button>`:''}
    </div>
    ${it.src==='date'?`<div class="row pmove" id="pm-${it.planId}" hidden><input class="input" type="date" id="pmd-${it.planId}" value="${k}" style="flex:1;height:44px"><button class="btn sm primary" data-act="pmoveok" data-plan="${it.planId}">OK</button></div>`:''}
  </div>`;}).join('');
  openModal(`<div class="sheet-head"><div><div class="eyebrow">Journée</div><h2 class="title-l" style="text-transform:capitalize">${fmtDate(k)}</h2></div><button class="x" data-act="close" aria-label="Fermer">${I.x}</button></div>
    ${ses.map(s=>{const info=infoSeance(s);return `<div class="card" style="box-shadow:none;padding:12px"><div class="row">${badgeHTML(info,'fait')}<b>${esc(info.nom)}</b><span class="small muted">${s.type==='five'?(s.min||60)+' min':(s.dur||'?')+' min'}</span></div>
      ${s.ex?`<div class="hist-detail" style="border:0;padding-top:8px">${Object.keys(s.ex).map(id=>`<div class="l"><span>${esc(exLabel(id,s))}</span><b class="num">${setsStr(id,s.ex[id])}</b></div>`).join('')}${s.tapis?`<div class="l"><span>Tapis</span><b class="num">${s.tapis.min} min · ${fmt(s.tapis.inc)} %</b></div>`:''}</div>`:''}
      ${s.note?`<div class="small muted">${esc(s.note)}</div>`:''}</div>`;}).join('')}
    ${prevuHTML?`<div class="stack" style="gap:8px"><h3 class="title-m">Prévu</h3>${prevuHTML}</div>`:''}
    ${!ses.length&&!prevuHTML?`<p class="muted" style="margin:0">${future?'Rien de prévu ce jour-là.':'Pas de séance ce jour-là.'}</p>`:''}
    <button class="btn ghost block" data-act="prevoir" data-date="${k}">${I.plus} Prévoir une séance</button>
    ${w?`<div class="row"><span class="pill">Pesée : ${fmt(w.kg)} kg</span></div>`:''}
    ${future?'':`<div class="stack" style="gap:8px"><h3 class="title-m">Activité (app Forme)</h3>
      <div class="row"><label class="fld" style="flex:1"><input id="dsteps" inputmode="numeric" placeholder="0" value="${act.steps!=null?act.steps:''}" aria-label="Nombre de pas"><span>pas</span></label>
      <label class="fld" style="flex:1"><input id="dkcal" inputmode="numeric" placeholder="0" value="${act.kcal!=null?act.kcal:''}" aria-label="Kcal actives"><span>kcal</span></label></div>
      <button class="btn primary block" data-act="saveday" data-date="${k}">Enregistrer l'activité</button></div>`}`);
}
function prevoirSheet(k){
  openModal(`<div class="sheet-head"><div><div class="eyebrow">Prévoir une séance</div><h2 class="title-l" style="text-transform:capitalize">${fmtDate(k)}</h2></div><button class="x" data-act="close" aria-label="Fermer">${I.x}</button></div>
    <div class="stack" style="gap:8px">${modelesTous().map(m=>`<button class="opt" data-act="prevoirpick" data-m="${m.id}" data-date="${k}">${badgeHTML(infoModele(m.id))}<span><b>${esc(m.nom)}</b><br><span class="small muted">${resumeModele(m)}</span></span></button>`).join('')}</div>
    <button class="btn ghost block" data-act="day" data-date="${k}">Retour</button>`);
}

/* ---------- Coller une séance ---------- */
async function ouvrirCollerSeance(){
  S.imp=null;
  openModal(`<div class="sheet-head"><div><div class="eyebrow">Coller une séance</div><h2 class="title-l">Importer un code</h2></div><button class="x" data-act="close" aria-label="Fermer">${I.x}</button></div>
    <div id="impzone"><p class="small muted" style="margin:0">Lecture du presse-papiers…</p></div>`);
  let txt='';
  try{if(navigator.clipboard&&navigator.clipboard.readText)txt=await navigator.clipboard.readText();}catch(e){txt='';}
  if(txt&&/[{]/.test(txt)&&/nom|exercices|SPORTY/i.test(txt))lireCollage(txt);
  else zoneCollage('');
}
function zoneCollage(msg){
  const z=$('#impzone');if(!z)return;
  z.innerHTML=`${msg?`<p class="hint" style="color:var(--danger)">${esc(msg)}</p>`:''}
    <p class="small muted" style="margin:0 0 8px">Colle ici le code qui commence par <span class="code">SPORTY-SEANCE-V1</span> (appui long, puis « Coller »).</p>
    <textarea class="input" id="imptxt" style="height:160px;padding:10px;font-family:ui-monospace,Menlo,monospace;font-size:12px" placeholder="SPORTY-SEANCE-V1&#10;{ &quot;nom&quot;: … }" aria-label="Code de la séance"></textarea>
    <button class="btn primary block" data-act="impread" style="margin-top:8px">Lire le code</button>`;
}
function lireCollage(txt){
  try{S.imp=lireCodeSeance(txt);S.imp.choix=S.imp.memeNom?'garder':null;apercuCollage();}
  catch(e){zoneCollage(e.message||ERR_CODE);const t=$('#imptxt');if(t)t.value=txt;}
}
function apercuCollage(){
  const r=S.imp;if(!r)return;
  if(!$('#impzone')){openModal(`<div class="sheet-head"><div><div class="eyebrow">Coller une séance</div><h2 class="title-l">Importer un code</h2></div><button class="x" data-act="close" aria-label="Fermer">${I.x}</button></div><div id="impzone"></div>`);}
  const m=r.modele;
  const lignes=r.lignes.map((l,i)=>{
    if(l.ignore)return `<div class="imp-l ign"><span>${esc(l.nom)}</span><span class="small muted">ignoré</span></div>`;
    if(!l.ok)return `<div class="imp-l ko"><div><b>${esc(l.nom)}</b><br><span class="small">Introuvable dans la banque</span></div>
      <div class="row" style="flex-wrap:wrap;margin-top:6px"><button class="btn sm ghost" data-act="impbanque" data-i="${i}">Choisir dans la banque</button><button class="btn sm ghost" data-act="impcreer" data-i="${i}">Créer comme exercice perso</button><button class="btn sm ghost" data-act="impignorer" data-i="${i}">Ignorer</button></div></div>`;
    const x=l.ligne,u=uniteLigne(l.id);
    return `<div class="imp-l ok"><span><b>${esc(EX[l.id].name)}</b>${nomCle(l.raw.nom||'')&&nomCle(l.raw.nom)!==nomCle(EX[l.id].name)?`<br><span class="small muted">« ${esc(l.raw.nom)} »</span>`:''}</span><span class="small num">${x.sets} × ${plage(x.min,x.max)} ${u}${x.rest?` · ${x.rest} s`:''}</span></div>`;}).join('');
  const reste=r.lignes.filter(l=>!l.ok&&!l.ignore).length;
  $('#impzone').innerHTML=`<section class="stack" style="gap:10px">
    <div class="row">${badgeHTML(m)}<div style="flex:1;min-width:0"><b class="title-m" style="font-size:20px">${esc(m.nom)}</b><div class="small muted">${esc(m.desc||'')}</div></div></div>
    <div class="small">Couleur : ${COULEURS[m.couleur]} · Tapis à la fin : ${m.tapis?'oui':'non'}${m.jours.length?` · Chaque ${m.jours.map(d=>DAYS_LONG[d-1]).join(', ')}`:''}${r.date?` · Date proposée : ${fmtDate(r.date)}`:''}</div>
    ${r.messages.map(t=>`<p class="hint">${esc(t)}</p>`).join('')}
    <div class="imp-list">${lignes}</div>
    ${r.memeNom?`<div class="stack" style="gap:6px"><p class="hint">Tu as déjà une séance « ${esc(m.nom)} ».</p>
      <div class="seg seg2"><button class="${r.choix==='remplacer'?'on':''}" data-act="impchoix" data-v="remplacer">Remplacer</button><button class="${r.choix==='garder'?'on':''}" data-act="impchoix" data-v="garder">Garder les deux</button></div></div>`:''}
    ${reste?`<p class="hint" style="color:var(--danger)">Choisis quoi faire pour ${reste>1?`les ${reste} exercices`:'l\'exercice'} en rouge.</p>`:''}
    <button class="btn primary block" data-act="impsave" ${reste?'disabled':''}>Enregistrer dans mes séances</button>
    <div class="row"><input class="input" type="date" id="impdate" value="${r.date||dkey()}" style="flex:1;height:46px" aria-label="Date"><button class="btn ghost" data-act="impplace" ${reste?'disabled':''}>Enregistrer et placer</button></div>
    <button class="btn ghost block" data-act="impstart" ${reste?'disabled':''}>${I.play} Démarrer maintenant</button>
    <p class="small muted" style="margin:0">« Démarrer maintenant » enregistre aussi la séance dans Mes séances.</p>
  </section>`;
}
/* Enregistre le code lu. Renvoie l'id du modèle ou null. */
function validerCollage(){
  const r=S.imp;if(!r)return null;
  if(r.memeNom&&!r.choix){toast('Choisis « Remplacer » ou « Garder les deux ».');return null;}
  const res=enregistrerCode(r,{remplacer:r.choix==='remplacer'});
  if(res.erreur){toast(res.erreur);return null;}
  return res.id;
}
