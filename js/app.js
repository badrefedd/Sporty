'use strict';
/* ---------- Render ---------- */
function renderTabs(){
  const active=S.route==='mois'?'semaine':['seances','seance-edit'].includes(S.route)?'reglages':S.route==='modif'?'historique':S.route;
  $('#tabs').innerHTML=TABS.map(r=>`<a href="#${r}" class="${active===r?'on':''}" ${active===r?'aria-current="page"':''}>${I['tab_'+r]}<span>${TAB_LABEL[r]}</span></a>`).join('');
}
/* ---------- Mise à jour de l'appli ---------- */
/* Une nouvelle version téléchargée attend ; le bandeau la propose, jamais pendant une séance. */
const Maj={reg:null,dispo:false,demandee:false,recharge:false,
  verifier(){this.dispo=!!(this.reg&&this.reg.waiting&&navigator.serviceWorker.controller);this.afficher();},
  afficher(){const el=$('#maj');if(el)el.hidden=!(this.dispo&&!S.draft);},
  lancer(){const w=this.reg&&this.reg.waiting;if(!w){location.reload();return;}this.demandee=true;w.postMessage('mettre-a-jour');}
};
function render(){
  const v=$('#view');
  const map={semaine:viewSemaine,seance:viewSeance,exos:viewExos,historique:viewHistorique,poids:viewPoids,reglages:viewReglages,mois:viewCalendrier,seances:viewSeances,'seance-edit':viewEditeur,modif:viewModif};
  v.innerHTML=(map[S.route]||viewSemaine)();
  renderTabs();applyTheme();Maj.afficher();
}
function handleHash(){
  const h=decodeURIComponent(location.hash.slice(1)).replace(/[\s  ]/g,'');
  if(h==='calendrier'){location.replace('#mois');return;}
  if(h==='programme'){location.replace('#seances');return;}
  /* quitter l'écran « Modifier » avec des changements non enregistrés : confirmation */
  if(S.route==='modif'&&h!=='modif'&&S.modif){
    if(modifSale()&&!S.modifQuitte){
      const cible=h;history.replaceState(null,'','#modif');
      confirmBox('Quitter sans enregistrer ?','Tes modifications de cette séance seront perdues.','Quitter sans enregistrer',()=>{S.modifQuitte=true;S.modif=null;location.hash=cible||'historique';},true);
      return;
    }
    S.modif=null;
  }
  S.modifQuitte=false;
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
  /* toucher une animation (fiche) : pause ou reprise */
  const il=e.target.closest('.illu.anim:not(.vignette)');if(il){basculerPause(il);return;}
  const el=e.target.closest('[data-act]');if(!el)return;
  const a=el.dataset.act,id=el.dataset.ex;
  switch(a){
    case 'cycletheme':{const order=['auto','light','dark'];S.settings.theme=order[(order.indexOf(S.settings.theme||'auto')+1)%3];Store.saveSettings();applyTheme();if(S.route==='reglages')render();toast('Thème : '+({auto:'automatique selon l\'heure',light:'clair',dark:'sombre'})[S.settings.theme]);break;}
    case 'theme':S.settings.theme=el.dataset.v;Store.saveSettings();render();break;
    case 'plan':S.settings.plan=el.dataset.v;Store.saveSettings();render();break;
    case 'start':unlockAudio();closeModal();startSession(el.dataset.type,el.dataset.plan?{planId:el.dataset.plan}:{});break;
    case 'toggleset':{
      unlockAudio();
      const D=cur(),i=+el.dataset.i,set=D.sets[id][i],ex=rx(id);
      if(!set.done){
        const F=fieldsFor(id),main=F.find(f=>f.main),other=F.find(f=>!f.main);
        const mv=num(set[main.k]);
        if(isNaN(mv)||mv<=0){toast(ex.mode==='time'?'Indique la durée en minutes.':ex.mode==='hold'?'Indique la durée en secondes.':'Indique le nombre de répétitions.');$(`#${main.k}-${id}-${i}`).focus();return;}
        if(ex.mode==='kg'){const w=num(set.w);if(isNaN(w)||w<0){toast('Indique la charge en kg (0 si sans charge).');$(`#w-${id}-${i}`).focus();return;}}
        else if(set[other.k]!==''&&isNaN(num(set[other.k]))){toast('Valeur non valide.');return;}
        set.done=true;
        const next=D.sets[id].findIndex(x=>!x.done);
        if(next!==-1){const nx=D.sets[id][next];if(nx.w===''||nx.w==null)nx.w=set.w;}
        const isLast=D.sets[id].every(x=>x.done);
        if(ex.rest&&S.route!=='modif')Timer.start(ex.rest,isLast?'Exercice suivant':ex.name);
      }else set.done=false;
      Store.saveDraft();render();break;}
    case 'addset':{const arr=cur().sets[id],l=arr[arr.length-1]||{w:'',r:String(rx(id).min)};arr.push({w:l.w,r:l.r,done:false});Store.saveDraft();render();break;}
    case 'rmset':{const arr=cur().sets[id];if(arr.length>1){arr.pop();Store.saveDraft();render();}break;}
    case 'exinfo':if(S.route==='exos'&&S.draft&&!S.draft.list.includes(id)&&el.classList.contains('bank-row')){exInfo(id);}else exInfo(id);break;
    case 'close':closeModal();break;
    case 'confirmok':{const cb=confirmCb;confirmCb=null;closeModal();if(cb)cb();break;}
    case 'finish':finishSession();break;
    case 'maj':Maj.lancer();break;
    case 'ecran':S.settings.ecranAllume=S.settings.ecranAllume===false;Store.saveSettings();if(S.settings.ecranAllume===false)Ecran.liberer();else Ecran.garder();render();break;
    case 'abandon':{const re=S.draft&&S.draft.reouverte;
      confirmBox('Annuler la séance ?',re?'Tes ajouts depuis la réouverture seront effacés. La séance revient telle qu\'elle était dans ton historique.':'Tout ce que tu as noté pendant cette séance sera effacé. Rien ne sera enregistré.','Annuler la séance',()=>{annulerSeance();Timer.stop();Ecran.liberer();location.hash='semaine';toast(re?'Séance remise telle qu\'elle était':'Séance annulée');},true);break;}
    /* fin de séance */
    case 'finvalider':validerRemplies();closeModal();finishSession('series');break;
    case 'finsans':closeModal();finishSession('series');break;
    case 'finheure':{const f=finDepuisHeure($('#finheure').value);const er=$('#finerr');
      if(!f){er.textContent='Indique une heure de fin passée, après le début de la séance.';er.hidden=false;return;}
      S.finChoisie=f;closeModal();finishSession('duree');break;}
    /* modifier ou rouvrir une séance terminée */
    case 'modifier':{const r=ouvrirModif(el.dataset.id,el.dataset.retour||S.route);if(r.erreur){toast(r.erreur);return;}closeModal();location.hash='modif';window.scrollTo(0,0);break;}
    case 'modifsave':{S.modifRetour=S.modif&&S.modif.retour;const r=enregistrerModif();
      if(r.erreur){const e=$('#moderr');if(e){e.textContent=r.erreur;e.hidden=false;e.scrollIntoView({block:'center'});}toast(r.erreur);return;}
      const ret=S.modifRetour||'historique';toast('Séance modifiée');location.hash=ret==='modif'?'historique':ret;break;}
    case 'modifannuler':location.hash=(S.modif&&S.modif.retour&&S.modif.retour!=='modif')?S.modif.retour:'historique';break;
    case 'rouvrir':{const r=rouvrirSeance(el.dataset.id);if(r.erreur){toast(r.erreur);return;}closeModal();unlockAudio();Ecran.garder();location.hash='seance';toast('Séance rouverte : tes séries validées sont cochées');break;}
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
      S.settings.custom=(S.settings.custom||[]).concat([c]);Store.saveSettings();buildEx();
      if(S.impCreer!=null&&S.imp){const l=S.imp.lignes[S.impCreer];S.impCreer=null;Object.assign(l,{ok:true,id:c.id,ligne:ligneDepuisCode(c.id,l.raw)});toast('Exercice perso créé');apercuCollage();break;}
      closeModal();render();toast('Exercice créé');exInfo(c.id);break;}
    case 'delcustom':confirmBox('Supprimer cet exercice ?','Il disparaîtra de ta banque et de ton programme. Tes séances passées restent dans l\'historique.','Supprimer',()=>{
      const st=S.settings;st.custom=(st.custom||[]).filter(c=>c.id!==id);
      if(st.programme)for(const k in st.programme){const p=st.programme[k];if(Array.isArray(p))st.programme[k]=p.filter(x=>x!==id);else if(p&&p.ex)p.ex=p.ex.filter(l=>l.id!==id);}
      if((S.modeles||[]).some(m=>m.ex.some(l=>l.id===id))){S.modeles=S.modeles.map(m=>Object.assign({},m,{ex:m.ex.filter(l=>l.id!==id)}));Store.saveModeles();}
      if(st.alts){delete st.alts[id];for(const k in st.alts)st.alts[k]=st.alts[k].filter(x=>x!==id);}
      st.hidden=(st.hidden||[]).filter(x=>x!==id);
      Store.saveSettings();buildEx();render();toast('Exercice supprimé');},true);break;
    /* masquer */
    case 'hide':setHidden(id,true);closeModal();render();toast(`${EX[id].name} masqué`);break;
    case 'unhide':setHidden(id,false);closeModal();render();toast(`${EX[id].name} réaffiché`);break;
    case 'togglehidden':S.showHidden=!S.showHidden;render();break;
    /* mes séances */
    case 'newseance':ouvrirEditeur(nouveauModele());break;
    case 'editseance':ouvrirEditeur(modeleParId(el.dataset.m));break;
    case 'dupseance':{const m=dupliquerModele(el.dataset.m);if(m){ouvrirEditeur(m);toast('Copie prête : change le nom puis enregistre.');}break;}
    case 'copycode':copyText(codeSeance(el.dataset.m),'Code de la séance copié');break;
    case 'delseance':{const m=modeleParId(el.dataset.m);if(!m)break;
      confirmBox(`Supprimer « ${m.nom} » ?`,'La séance disparaît de tes séances et des jours où elle était prévue. Ton historique ne change pas.','Supprimer',()=>{const r=supprimerModele(m.id);if(r.erreur){toast(r.erreur);return;}S.edit=null;toast('Séance supprimée');if(location.hash==='#seances')render();else location.hash='seances';},true);break;}
    case 'edcouleur':S.edit.m.couleur=el.dataset.c;render();break;
    case 'edup':case 'eddown':{const l=S.edit.m.ex,i=+el.dataset.i,j=a==='edup'?i-1:i+1;if(j<0||j>=l.length)break;[l[i],l[j]]=[l[j],l[i]];render();break;}
    case 'edrm':{const l=S.edit.m.ex,i=+el.dataset.i;const nm=EX[l[i].id].name;l.splice(i,1);render();toast(`${nm} retiré`);break;}
    case 'edadd':openPicker({mode:'edit'});break;
    case 'edjour':{const d=+el.dataset.d,j=new Set(S.edit.m.jours||[]);j.has(d)?j.delete(d):j.add(d);S.edit.m.jours=[...j].sort();render();break;}
    case 'edsave':{const r=enregistrerModele(S.edit.m);
      if(r.erreur){const e=$('#ed-err');if(e){e.textContent=r.erreur;e.hidden=false;e.scrollIntoView({block:'center'});}toast(r.erreur);return;}
      const ret=S.edit.retour;S.edit=null;toast('Séance enregistrée');garderImagesSeances();location.hash=ret==='seance-edit'?'seances':ret;break;}
    case 'edcancel':{const ret=S.edit?S.edit.retour:'seances';S.edit=null;location.hash=ret==='seance-edit'?'seances':ret;break;}
    case 'edreset':{const t=S.edit.m.id;confirmBox(`Revenir à la ${S.edit.m.nom} d'origine ?`,'Tes changements d\'exercices seront remplacés par ceux du départ.','Revenir à l\'origine',()=>{reinitialiserAB(t);S.edit=null;location.hash='seances';toast('Séance d\'origine rétablie');},true);break;}
    case 'saveasperso':{const ses=S.sessions.find(x=>x.id===el.dataset.id);if(!ses)break;closeModal();ouvrirEditeur(modeleDepuisSeance(ses,''),'seances');toast('Donne un nom à ta séance.');break;}
    case 'refaire':{const ses=S.sessions.find(x=>x.id===el.dataset.id);if(!ses)break;ouvrirEditeur(modeleDepuisSeance(ses,`${infoSeance(ses).nom} (copie)`),'historique');break;}
    /* mes photos */
    case 'photos':S.photoEdit=null;photosSheet(id);break;
    case 'pslotdel':S.photoEdit.imgs[+el.dataset.k]=null;photosSheet(S.photoEdit.id);break;
    case 'psave':{const P=S.photoEdit,imgs=P.imgs.filter(Boolean);
      enregistrerPhotos(P.id,imgs).then(()=>{S.photoEdit=null;render();exInfo(P.id);toast(imgs.length>1?'Photos enregistrées : elles s\'animent':'Photo enregistrée');});break;}
    case 'photosdel':confirmBox('Revenir à l\'illustration d\'origine ?','Tes photos pour cet exercice seront supprimées de ce téléphone.','Supprimer mes photos',()=>{supprimerPhotos(id).then(()=>{render();exInfo(id);toast('Illustration d\'origine rétablie');});},true);break;
    /* coller une séance */
    case 'coller':ouvrirCollerSeance();break;
    case 'impread':{const t=$('#imptxt').value;if(!t.trim()){toast('Colle d\'abord le code.');return;}lireCollage(t);break;}
    case 'impchoix':S.imp.choix=el.dataset.v;apercuCollage();break;
    case 'impignorer':S.imp.lignes[+el.dataset.i].ignore=true;apercuCollage();break;
    case 'impbanque':openPicker({mode:'impfix',i:+el.dataset.i});break;
    case 'impcreer':S.impCreer=+el.dataset.i;newExSheet(S.imp.lignes[+el.dataset.i].nom);break;
    case 'impsave':{const mid=validerCollage();if(!mid)break;garderImagesSeances();closeModal();toast('Séance enregistrée dans Mes séances');if(location.hash==='#seances')render();else location.hash='seances';break;}
    case 'impplace':{const date=$('#impdate').value;if(!date){toast('Choisis une date.');return;}const mid=validerCollage();if(!mid)break;const r=prevoir(mid,date);closeModal();render();toast(r.erreur||`Séance prévue le ${fmtDate(date)}`);break;}
    case 'impstart':{const mid=validerCollage();if(!mid)break;closeModal();unlockAudio();startSession(mid);break;}
    /* séances prévues */
    case 'prevoir':prevoirSheet(el.dataset.date);break;
    case 'prevoirpick':{const r=prevoir(el.dataset.m,el.dataset.date);if(r.erreur){toast(r.erreur);return;}render();daySheet(el.dataset.date);toast(`${infoModele(el.dataset.m).nom} prévue le ${fmtDate(el.dataset.date)}`);break;}
    case 'itpanel':{const z=document.getElementById('pan-'+el.dataset.it);if(z){z.hidden=!z.hidden;if(!z.hidden)z.scrollIntoView({block:'nearest'});}break;}
    case 'itmove':case 'itmoveok':{
      const it=itemDeCle(el.dataset.it),to=a==='itmove'?el.dataset.to:(document.getElementById('pd-'+el.dataset.it)||{}).value;
      const r=deplacerItem(it,to);if(r.erreur){toast(r.erreur);return;}
      const ouvert=!$('#modal').hidden;render();if(ouvert)daySheet(to);
      toast(`${infoModele(it.modele||(S.plans.find(p=>p.id===it.planId)||{}).modele).nom} déplacée au ${fmtDate(to)}${it.planId?'':' (cette semaine seulement)'}`);break;}
    case 'itdel':{const it=itemDeCle(el.dataset.it),p=it.planId?(S.plans||[]).find(x=>x.id===it.planId):null;
      const date=p?p.date:(exceptionDe(it.modele,it.origine)||{}).vers||it.origine;
      const r=retirerItem(it);if(r.erreur){toast(r.erreur);return;}
      render();daySheet(date);toast(it.planId?'Retirée de ce jour':'Retirée de ce jour, pour cette semaine seulement');break;}
    case 'habituels':{const m=el.dataset.m;closeModal();
      if(m==='A'||m==='B'||m==='five'){location.hash='reglages';setTimeout(()=>{const c=$('#jours-salle');if(c)c.scrollIntoView({block:'start'});},120);}
      else{const mo=modeleParId(m);if(mo)ouvrirEditeur(mo,'semaine');}break;}
    case 'semdefaut':confirmBox('Remettre la semaine par défaut ?','Les séances déplacées ou retirées cette semaine reviennent à leurs jours habituels. Les séances placées à une date ne bougent pas.','Remettre par défaut',()=>{remettreSemaine(weekStart());render();toast('Semaine remise par défaut');});break;
    case 'addtosession':addToSession(id);closeModal();toast(`${EX[id].name} ajouté à la séance`);if(S.route==='modif')render();else location.hash='seance';setTimeout(()=>{const c=$('#ex-'+id);if(c)c.scrollIntoView({block:'center'});},120);break;
    case 'pickalt':openPicker({mode:'addalt',for:id});break;
    case 'pickswap':openPicker({mode:'swap',for:id});break;
    case 'addex':openPicker({mode:'add'});break;
    case 'pickg':picker.g=el.dataset.g;el.parentElement.querySelectorAll('.chip').forEach(b=>b.classList.toggle('on',b===el));$('#pickList').innerHTML=pickListHTML();break;
    case 'pick':{
      const p=picker;
      if(p.mode==='addalt'){addAlt(p.for,id);toast('Alternative ajoutée');exInfo(p.for);}
      else if(p.mode==='swap'){if(swapEx(p.for,id)!==false){addAlt(p.for,id);closeModal();render();toast(`${EX[id].name} à la place de ${EX[p.for].name}`);}}
      else if(p.mode==='edit'){S.edit.m.ex.push(ligneDefaut(id));closeModal();render();toast(`${EX[id].name} ajouté`);}
      else if(p.mode==='impfix'){const l=S.imp.lignes[p.i];Object.assign(l,{ok:true,id,ligne:ligneDepuisCode(id,l.raw)});apercuCollage();}
      else{addToSession(id);closeModal();render();setTimeout(()=>{const c=$('#ex-'+id);if(c)c.scrollIntoView({block:'center'});},80);}
      break;}
    case 'swapto':{const from=el.dataset.from;if(swapEx(from,id)!==false){closeModal();if(S.route!=='seance'&&S.route!=='modif')location.hash='seance';else render();toast(`${EX[id].name} à la place de ${EX[from].name}`);setTimeout(()=>{const c=$('#ex-'+id);if(c)c.scrollIntoView({block:'center'});},80);}break;}
    case 'rmalt':removeAlt(el.dataset.from,id);exInfo(el.dataset.from);break;
    case 'altsheet':altSheet(id);break;
    case 'rmex':{const d=cur();const done=(d.sets[id]||[]).some(x=>x.done);
      const go=()=>{d.list=d.list.filter(x=>x!==id);delete d.sets[id];if(d.from)delete d.from[id];if(d.rx)delete d.rx[id];Store.saveDraft();closeModal();render();toast(`${EX[id].name} retiré de la séance`);};
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
  if(el.dataset.f&&cur()){const s=cur().sets[el.dataset.ex][+el.dataset.i];s[el.dataset.f]=el.value;s.saisie=true;if(S.route!=='modif')saveDraftSoon();}
  else if(el.id==='bankq'){S.bankQ=el.value;$('#bankList').innerHTML=bankListHTML();}
  else if(el.id==='pickq'&&picker){picker.q=el.value;$('#pickList').innerHTML=pickListHTML();}
  else if(S.modif&&/^m-(date|heure|dur|min|note)$/.test(el.id)){S.modif.champs[el.id.slice(2)]=el.value;}
  else if(S.edit&&el.dataset.edf){S.edit.m.ex[+el.dataset.edi][el.dataset.edf]=el.value;}
  else if(S.edit&&el.id==='ed-nom')S.edit.m.nom=el.value;
  else if(S.edit&&el.id==='ed-badge')S.edit.m.badge=el.value.toUpperCase();
  else if(S.edit&&el.id==='ed-desc')S.edit.m.desc=el.value;
});
document.addEventListener('change',e=>{
  const el=e.target;
  if(el.dataset.pslot!=null&&S.photoEdit){
    const f=el.files&&el.files[0],k=+el.dataset.pslot;if(!f)return;
    toast('Préparation de la photo…');
    reduirePhoto(f).then(u=>{S.photoEdit.imgs[k]=u;photosSheet(S.photoEdit.id);},()=>toast('Impossible de lire cette photo.'));
    return;
  }
  if(el.id==='importfile'){
    const f=el.files&&el.files[0];if(!f)return;
    if(f.size>20e6){erreurImport('Ce fichier est trop gros pour être une sauvegarde Sporty.');return;}
    f.text().then(lireTexteImport,()=>erreurImport('Impossible de lire ce fichier.'));el.value='';return;
  }
  if(S.edit&&el.id==='ed-tapis'){S.edit.m.tapis=el.checked;render();return;}
  if(S.edit&&el.dataset.edf){S.edit.m.ex[+el.dataset.edi][el.dataset.edf]=el.value;return;}
  if(el.id==='goal'){const g=num(el.value);if(!isNaN(g)&&g>30&&g<300){S.settings.goal=g;Store.saveSettings();toast('Objectif enregistré');}else toast('Indique un objectif en kg, par exemple 72.');}
  else if(el.id==='vidsel'){$('#vidurl').value=(S.settings.videos||{})[el.value]||'';}
});
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'&&!$('#modal').hidden)closeModal();
  if((e.key==='Enter'||e.key===' ')&&e.target.classList&&e.target.classList.contains('illu')&&e.target.classList.contains('anim')){e.preventDefault();basculerPause(e.target);}
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
  /* séance en cours : repos et écran allumé */
  Timer.reprendre();Ecran.garder();
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'){if(Timer.iv)Timer.tick();else Timer.reprendre();Ecran.garder();}});
  /* animations : seulement celles visibles à l'écran */
  surveillerIllus();new MutationObserver(()=>surveillerIllus()).observe(document.body,{childList:true,subtree:true});
  /* Mode hors connexion : le « service worker » garde une copie de l'appli sur le téléphone. */
  if('serviceWorker' in navigator&&location.protocol!=='file:'){
    navigator.serviceWorker.register('sw.js').then(reg=>{
      Maj.reg=reg;Maj.verifier();
      reg.addEventListener('updatefound',()=>{const w=reg.installing;if(w)w.addEventListener('statechange',()=>{if(w.state==='installed')Maj.verifier();});});
      /* au retour dans l'appli, on regarde s'il y a une nouvelle version */
      document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')reg.update().catch(()=>{});});
    }).catch(e=>console.warn('SW',e));
    navigator.serviceWorker.addEventListener('controllerchange',()=>{if(Maj.demandee&&!Maj.recharge){Maj.recharge=true;location.reload();}});
    navigator.serviceWorker.ready.then(()=>garderImagesSeances());
  }
})();

