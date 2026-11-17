'use strict';
/* ---------- Render ---------- */
function renderTabs(){
  const active=S.route==='mois'?'semaine':S.route==='programme'?'reglages':S.route;
  $('#tabs').innerHTML=TABS.map(r=>`<a href="#${r}" class="${active===r?'on':''}" ${active===r?'aria-current="page"':''}>${I['tab_'+r]}<span>${TAB_LABEL[r]}</span></a>`).join('');
}
function render(){
  const v=$('#view');
  const map={semaine:viewSemaine,seance:viewSeance,exos:viewExos,historique:viewHistorique,poids:viewPoids,reglages:viewReglages,mois:viewCalendrier,programme:viewProgramme};
  v.innerHTML=(map[S.route]||viewSemaine)();
  renderTabs();applyTheme();
}
function handleHash(){
  const h=decodeURIComponent(location.hash.slice(1)).replace(/[\s  ]/g,'');
  if(h==='calendrier'){location.replace('#mois');return;}
  const prev=S.route;
  S.route=ROUTES.includes(h)?h:'semaine';
  render();
  if(prev!==S.route)window.scrollTo(0,0);
}
function addWeight(date,kg){
  kg=Math.round(kg*100)/100;
  const ex=S.weights.find(w=>w.date===date);
  if(ex)ex.kg=kg;else S.weights.push({date,kg});
  Store.saveWeight({date,kg});
}
function setDay(date,steps,kcal){
  let d=S.days.find(x=>x.date===date);
  if(!d){d={date};S.days.push(d);}
  if(steps!=null&&!isNaN(steps))d.steps=steps;else delete d.steps;
  if(kcal!=null&&!isNaN(kcal))d.kcal=kcal;else delete d.kcal;
  if(d.steps==null&&d.kcal==null){S.days=S.days.filter(x=>x.date!==date);Store.deleteDay(date);}
  else Store.saveDay(d);
}

/* ---------- Events ---------- */
document.addEventListener('click',e=>{
  const el=e.target.closest('[data-act]');if(!el)return;
  const a=el.dataset.act,id=el.dataset.ex;
  switch(a){
    case 'cycletheme':{const order=['auto','light','dark'];S.settings.theme=order[(order.indexOf(S.settings.theme||'auto')+1)%3];Store.saveSettings();applyTheme();if(S.route==='reglages')render();toast('Thème : '+({auto:'automatique selon l\'heure',light:'clair',dark:'sombre'})[S.settings.theme]);break;}
    case 'theme':S.settings.theme=el.dataset.v;Store.saveSettings();render();break;
    case 'plan':S.settings.plan=el.dataset.v;Store.saveSettings();render();break;
    case 'start':unlockAudio();closeModal();startSession(el.dataset.type);break;
    case 'toggleset':{
      unlockAudio();
      const i=+el.dataset.i,set=S.draft.sets[id][i],ex=EX[id];
      if(!set.done){
        const F=fieldsFor(id),main=F.find(f=>f.main),other=F.find(f=>!f.main);
        const mv=num(set[main.k]);
        if(isNaN(mv)||mv<=0){toast(ex.mode==='time'?'Indique la durée en minutes.':ex.mode==='hold'?'Indique la durée en secondes.':'Indique le nombre de répétitions.');$(`#${main.k}-${id}-${i}`).focus();return;}
        if(ex.mode==='kg'){const w=num(set.w);if(isNaN(w)||w<0){toast('Indique la charge en kg (0 si sans charge).');$(`#w-${id}-${i}`).focus();return;}}
        else if(set[other.k]!==''&&isNaN(num(set[other.k]))){toast('Valeur non valide.');return;}
        set.done=true;
        const next=S.draft.sets[id].findIndex(x=>!x.done);
        if(next!==-1){const nx=S.draft.sets[id][next];if(nx.w===''||nx.w==null)nx.w=set.w;}
        const isLast=S.draft.sets[id].every(x=>x.done);
        if(ex.rest)Timer.start(ex.rest,isLast?'Exercice suivant':ex.name);
      }else set.done=false;
      Store.saveDraft();render();break;}
    case 'addset':{const arr=S.draft.sets[id],l=arr[arr.length-1]||{w:'',r:String(EX[id].min)};arr.push({w:l.w,r:l.r,done:false});Store.saveDraft();render();break;}
    case 'rmset':{const arr=S.draft.sets[id];if(arr.length>1){arr.pop();Store.saveDraft();render();}break;}
    case 'exinfo':if(S.route==='exos'&&S.draft&&!S.draft.list.includes(id)&&el.classList.contains('bank-row')){exInfo(id);}else exInfo(id);break;
    case 'close':closeModal();break;
    case 'confirmok':{const cb=confirmCb;confirmCb=null;closeModal();if(cb)cb();break;}
    case 'finish':finishSession();break;
    case 'stop':{const done=S.draft.list.reduce((n,x)=>n+(S.draft.sets[x]||[]).filter(s=>s.done).length,0);
      if(!done){confirmBox('Arrêter la séance ?','Aucune série n\'est validée : la séance sera annulée.','Annuler la séance',()=>{S.draft=null;Timer.stop();Store.saveDraft();location.hash='semaine';},true);}
      else confirmBox('Arrêter la séance ?',`Les ${done} séries validées sont enregistrées, les autres sont ignorées.`,'Arrêter et enregistrer',finishSession);break;}
    case 'abandon':confirmBox('Annuler la séance ?','Tout ce que tu as noté pendant cette séance sera effacé. Rien ne sera enregistré.','Annuler la séance',()=>{S.draft=null;Timer.stop();Store.saveDraft();location.hash='semaine';toast('Séance annulée');},true);break;
    case 'timeradd':Timer.add(15);break;
    case 'timerstop':Timer.stop();break;
    case 'five':fiveModal();break;
    case 'fivemin':fiveMin=+el.dataset.v;el.parentElement.querySelectorAll('button').forEach(b=>{const on=b===el;b.classList.toggle('on',on);b.setAttribute('aria-checked',on);});break;
    case 'savefive':{
      const date=$('#fivedate').value||dkey(),note=$('#fivenote').value.trim();
      const s={id:uid(),type:'five',date,ts:pkey(date).getTime()+20*3600e3,min:fiveMin};if(note)s.note=note;
      S.sessions.push(s);Store.saveSession(s);closeModal();render();toast('Five enregistré');break;}
    case 'histex':S.histEx=id;render();break;
    case 'togglehist':S.openHist=S.openHist===el.dataset.id?null:el.dataset.id;render();break;
    case 'delses':{const sid=el.dataset.id;confirmBox('Supprimer cette séance ?','Elle disparaîtra de ton historique et de tes courbes.','Supprimer',()=>{S.sessions=S.sessions.filter(s=>s.id!==sid);Store.deleteSession(sid);render();},true);break;}
    case 'addw':{
      const kg=num($('#wkg').value),date=$('#wdate').value||dkey();
      if(isNaN(kg)||kg<30||kg>300){toast('Indique ton poids en kg, par exemple 88,4.');$('#wkg').focus();return;}
      if(date>dkey()){toast('La date ne peut pas être dans le futur.');return;}
      addWeight(date,kg);render();toast(`Pesée enregistrée : ${fmt(kg)} kg`);break;}
    case 'delw':{const date=el.dataset.date;confirmBox('Supprimer cette pesée ?',fmtDate(date),'Supprimer',()=>{S.weights=S.weights.filter(w=>w.date!==date);Store.deleteWeight(date);render();},true);break;}
    /* sauvegarde & import */
    case 'backup':sauvegarder();break;
    case 'snooze':S.meta.snooze=Date.now()+7*864e5;Store.saveMeta();render();toast('Rappel dans 7 jours');break;
    case 'openimport':ouvrirImport();break;
    case 'importtxt':{const t=$('#importtxt').value.trim();if(!t){toast('Colle d\'abord le texte de la sauvegarde.');return;}lireTexteImport(t);break;}
    case 'importfusion':appliquerImport(false);break;
    case 'importremplacer':confirmBox('Tout remplacer ?','Les séances, pesées et pas actuellement dans l\'appli seront effacés et remplacés par ceux du fichier.','Tout remplacer',()=>appliquerImport(true),true);break;
    /* calendar & days */
    case 'calnav':{if(!S.cal){const n=new Date();S.cal={y:n.getFullYear(),m:n.getMonth()};}const dd=new Date(S.cal.y,S.cal.m+(+el.dataset.d),1);S.cal={y:dd.getFullYear(),m:dd.getMonth()};render();break;}
    case 'day':daySheet(el.dataset.date);break;
    case 'saveday':{
      const k=el.dataset.date,sv=$('#dsteps').value.trim(),kv=$('#dkcal').value.trim();
      const steps=sv===''?null:parseInt(sv.replace(/\D/g,''),10),kcal=kv===''?null:parseInt(kv.replace(/\D/g,''),10);
      if((steps!=null&&(isNaN(steps)||steps>200000))||(kcal!=null&&(isNaN(kcal)||kcal>20000))){toast('Vérifie les chiffres saisis.');return;}
      setDay(k,steps,kcal);closeModal();render();toast('Activité enregistrée');break;}
    /* bank */
    case 'bankg':S.bankG=el.dataset.g;render();break;
    case 'newex':newExSheet();break;
    case 'savenewex':{
      const name=$('#nxname').value.trim();if(!name){toast('Donne un nom à l\'exercice.');$('#nxname').focus();return;}
      const c={id:'c_'+uid(),name,group:$('#nxgroup').value,equip:$('#nxequip').value.trim()||'Perso',mode:$('#nxmode').value};
      S.settings.custom=(S.settings.custom||[]).concat([c]);Store.saveSettings();buildEx();closeModal();render();toast('Exercice créé');exInfo(c.id);break;}
    case 'delcustom':confirmBox('Supprimer cet exercice ?','Il disparaîtra de ta banque et de ton programme. Tes séances passées restent dans l\'historique.','Supprimer',()=>{
      const st=S.settings;st.custom=(st.custom||[]).filter(c=>c.id!==id);
      if(st.programme)for(const k in st.programme)st.programme[k]=st.programme[k].filter(x=>x!==id);
      if(st.alts){delete st.alts[id];for(const k in st.alts)st.alts[k]=st.alts[k].filter(x=>x!==id);}
      st.hidden=(st.hidden||[]).filter(x=>x!==id);
      Store.saveSettings();buildEx();render();toast('Exercice supprimé');},true);break;
    /* masquer */
    case 'hide':setHidden(id,true);closeModal();render();toast(`${EX[id].name} masqué`);break;
    case 'unhide':setHidden(id,false);closeModal();render();toast(`${EX[id].name} réaffiché`);break;
    case 'togglehidden':S.showHidden=!S.showHidden;render();break;
    /* mon programme */
    case 'progt':S.progT=el.dataset.v;render();break;
    case 'progup':case 'progdown':{const t=S.progT||'A',l=planEx(t).slice(),i=+el.dataset.i,j=a==='progup'?i-1:i+1;if(j<0||j>=l.length)break;[l[i],l[j]]=[l[j],l[i]];setPlanEx(t,l);render();break;}
    case 'progrm':{const t=S.progT||'A',l=planEx(t).slice(),i=+el.dataset.i,nm=EX[l[i]].name;l.splice(i,1);setPlanEx(t,l);render();toast(`${nm} retiré de la séance ${t}`);break;}
    case 'progadd':openPicker({mode:'prog',t:S.progT||'A'});break;
    case 'progreset':{const t=S.progT||'A';confirmBox(`Revenir à la séance ${t} d'origine ?`,'Ta liste d\'exercices modifiée sera remplacée par celle du départ.','Revenir à l\'origine',()=>{const p=Object.assign({},S.settings.programme);delete p[t];S.settings.programme=p;Store.saveSettings();render();},true);break;}
    case 'addtosession':addToSession(id);closeModal();toast(`${EX[id].name} ajouté à la séance`);location.hash='seance';setTimeout(()=>{const c=$('#ex-'+id);if(c)c.scrollIntoView({block:'center'});},120);break;
    case 'pickalt':openPicker({mode:'addalt',for:id});break;
    case 'pickswap':openPicker({mode:'swap',for:id});break;
    case 'addex':openPicker({mode:'add'});break;
    case 'pickg':picker.g=el.dataset.g;el.parentElement.querySelectorAll('.chip').forEach(b=>b.classList.toggle('on',b===el));$('#pickList').innerHTML=pickListHTML();break;
    case 'pick':{
      const p=picker;
      if(p.mode==='addalt'){addAlt(p.for,id);toast('Alternative ajoutée');exInfo(p.for);}
      else if(p.mode==='swap'){if(swapEx(p.for,id)!==false){addAlt(p.for,id);closeModal();render();toast(`${EX[id].name} à la place de ${EX[p.for].name}`);}}
      else if(p.mode==='prog'){setPlanEx(p.t,planEx(p.t).concat(id));closeModal();render();toast(`${EX[id].name} ajouté à la séance ${p.t}`);}
      else{addToSession(id);closeModal();render();setTimeout(()=>{const c=$('#ex-'+id);if(c)c.scrollIntoView({block:'center'});},80);}
      break;}
    case 'swapto':{const from=el.dataset.from;if(swapEx(from,id)!==false){closeModal();if(S.route!=='seance')location.hash='seance';else render();toast(`${EX[id].name} à la place de ${EX[from].name}`);}break;}
    case 'rmalt':removeAlt(el.dataset.from,id);exInfo(el.dataset.from);break;
    case 'altsheet':altSheet(id);break;
    case 'rmex':{const d=S.draft;const done=(d.sets[id]||[]).some(x=>x.done);
      const go=()=>{d.list=d.list.filter(x=>x!==id);delete d.sets[id];Store.saveDraft();closeModal();render();};
      if(done)confirmBox('Retirer cet exercice ?','Les séries déjà validées pour cet exercice seront perdues.','Retirer',go,true);else go();break;}
    case 'savevid':{const sid=$('#vidsel').value,v=$('#vidurl').value.trim();S.settings.videos=Object.assign({},S.settings.videos);
      if(v&&!/^https?:\/\//i.test(v)){toast('Colle un lien qui commence par https://');return;}
      if(v)S.settings.videos[sid]=v;else delete S.settings.videos[sid];Store.saveSettings();toast(v?'Lien enregistré':'Lien retiré, recherche YouTube par défaut');render();break;}
  }
});
function copyText(txt,ok){
  const fallback=()=>openModal(`<div class="sheet-head"><h2 class="title-l">Copie manuelle</h2><button class="x" data-act="close" aria-label="Fermer">${I.x}</button></div><p class="small muted" style="margin:0">Sélectionne le texte ci-dessous et copie-le.</p><textarea class="input" style="height:220px;padding:10px;font-family:ui-monospace,Menlo,monospace;font-size:12px" readonly>${esc(txt)}</textarea>`);
  try{navigator.clipboard.writeText(txt).then(()=>toast(ok),fallback);}catch(e){fallback();}
}
document.addEventListener('input',e=>{
  const el=e.target;
  if(el.dataset.f&&S.draft){const s=S.draft.sets[el.dataset.ex][+el.dataset.i];s[el.dataset.f]=el.value;saveDraftSoon();}
  else if(el.id==='bankq'){S.bankQ=el.value;$('#bankList').innerHTML=bankListHTML();}
  else if(el.id==='pickq'&&picker){picker.q=el.value;$('#pickList').innerHTML=pickListHTML();}
});
document.addEventListener('change',e=>{
  const el=e.target;
  if(el.id==='importfile'){
    const f=el.files&&el.files[0];if(!f)return;
    if(f.size>20e6){erreurImport('Ce fichier est trop gros pour être une sauvegarde Sporty.');return;}
    f.text().then(lireTexteImport,()=>erreurImport('Impossible de lire ce fichier.'));el.value='';return;
  }
  if(el.id==='goal'){const g=num(el.value);if(!isNaN(g)&&g>30&&g<300){S.settings.goal=g;Store.saveSettings();toast('Objectif enregistré');}else toast('Indique un objectif en kg, par exemple 72.');}
  else if(el.id==='vidsel'){$('#vidurl').value=(S.settings.videos||{})[el.value]||'';}
});
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'&&!$('#modal').hidden)closeModal();
  if(e.key==='Enter'&&e.target.id==='wkg'){e.preventDefault();$('[data-act="addw"]').click();}
});
$('#modal').addEventListener('click',e=>{if(e.target.id==='modal')closeModal();});
window.addEventListener('hashchange',handleHash);

/* ---------- Boot ---------- */
(async function(){
  buildEx();applyTheme();renderTabs();
  await Store.init();
  buildEx();
  S.draft=migrateDraft(S.draft);
  applyTheme();
  handleHash();
  requestAnimationFrame(animate);
  /* Mode hors connexion : le « service worker » garde une copie de l'appli sur le téléphone. */
  if('serviceWorker' in navigator&&location.protocol!=='file:'){
    navigator.serviceWorker.register('sw.js').catch(e=>console.warn('SW',e));
  }
})();

