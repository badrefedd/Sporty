'use strict';
/* ---------- Views: week ---------- */
/* Sélecteur « Semaine | Mois », en haut des deux vues. */
function vueSeg(cur){
  return `<nav class="seg seg2 vueseg" aria-label="Vue du programme">${[['semaine','Semaine'],['mois','Mois']].map(([k,l])=>`<a href="#${k}" class="${cur===k?'on':''}" ${cur===k?'aria-current="page"':''}>${l}</a>`).join('')}</nav>`;
}
function draftBanner(){
  if(!S.draft||S.route==='seance')return '';
  const info=S.draft.info||infoModele(S.draft.type);const st=new Date(S.draft.start);
  return `<div class="banner">${badgeHTML(info)}<div><b>${esc(info.nom)} en cours</b><div class="small muted">Commencée à ${st.getHours()} h ${pad(st.getMinutes())}</div></div><div class="spacer"></div><a class="btn sm primary" href="#seance">Reprendre</a></div>`;
}
function stripes(){return `<svg class="stripes" viewBox="0 0 100 100" aria-hidden="true"><path d="M58 4 30 54h18l-9 42 31-56H52l10-36z" fill="#fff"/></svg>`;}
function activityCard(){
  const today=dkey(),td=dayData(today);
  const last7=[];for(let i=0;i<7;i++){const d=dayData(dkey(addDays(new Date(),-i)));if(d&&d.steps!=null)last7.push(d.steps);}
  const avg=last7.length?last7.reduce((a,b)=>a+b,0)/last7.length:null;
  const steps=td&&td.steps!=null?td.steps:null,kcal=td&&td.kcal!=null?td.kcal:null;
  return `<section class="card stack">
    <div class="row" style="justify-content:space-between"><h2 class="title-m">Activité du jour</h2><button class="btn sm ghost" data-act="day" data-date="${today}">Saisir</button></div>
    <div class="tiles">
      <div class="tile"><div class="l">Pas</div><div class="v num">${steps!=null?fmtInt(steps):'–'}</div></div>
      <div class="tile"><div class="l">Kcal actives</div><div class="v num">${kcal!=null?fmtInt(kcal):'–'}</div></div>
    </div>
    <div class="stepbar" role="progressbar" aria-label="Pas du jour vers 10 000" aria-valuemin="0" aria-valuemax="${STEP_GOAL}" aria-valuenow="${steps||0}"><i style="width:${Math.min(100,(steps||0)/STEP_GOAL*100)}%"></i></div>
    <div class="small muted">${steps==null?'Note tes pas et tes kcal actives de l\'app Forme avec « Saisir ».':`Objectif 8 000 à 10 000 pas.${avg!=null?` Moyenne sur 7 jours : ${fmtInt(avg)} pas.`:''}`}</div>
  </section>`;
}
function viewSemaine(){
  const ws=weekStart(),opt=WEEK_OPTS[S.settings.plan]||WEEK_OPTS['1'],st=weekStatus(ws),today=dkey();
  const items=semaineItems(ws),obj=objectifSemaine(ws);
  let strip='';
  for(let i=0;i<7;i++){
    const d=addDays(ws,i),k=dkey(d),its=items.filter(x=>x.date===k);
    const b=its.map(it=>{const info=it.ses?infoSeance(it.ses):infoModele(it.modele);return `<span class="bwrap">${badgeHTML(info,it.etat==='fait'?'fait':it.etat==='passe'?'passe':'out')}${it.etat==='fait'?`<i class="ok">${I.check}</i>`:''}</span>`;}).join('');
    const lab=its.map(it=>{const info=it.ses?infoSeance(it.ses):infoModele(it.modele);return `${info.nom} ${it.etat==='fait'?'faite':it.etat==='passe'?'non faite':'prévue'}`;}).join(', ');
    strip+=`<button class="day ${k===today?'today':''}" data-act="day" data-date="${k}" aria-label="${DAYS_LONG[i]} ${d.getDate()}${lab?' : '+esc(lab):''}"><span class="dname">${DAYS[i]}</span><span class="dnum">${d.getDate()}</span>
      <span class="dbadges">${b||'<span class="badge rest">–</span>'}</span></button>`;
  }
  const next=!st.A?'A':!st.B?'B':null;
  let hero;
  if(S.draft){
    const info=S.draft.info||infoModele(S.draft.type);
    hero=`<section class="card hero c-${info.couleur}"><div class="eyebrow">Séance en cours</div><h2>${esc(info.nom)}</h2><ul>${(S.draft.list||[]).map(id=>EX[id]?`<li>${esc(EX[id].name)}</li>`:'').join('')}</ul><a class="btn block" href="#seance">Reprendre la séance</a>${stripes()}</section>`;
  }else if(next){
    const p=modeleAB(next),itn=items.find(x=>x.modele===next&&x.etat==='prevu');
    const quand=itn?(itn.date===today?' · prévue aujourd\'hui':' · prévue '+DAYS_LONG[(pkey(itn.date).getDay()+6)%7]):'';
    hero=`<section class="card hero c-${p.couleur}"><div class="eyebrow">Prochaine séance${quand}</div><h2>${esc(p.nom)}</h2><div style="font-weight:600;opacity:.9">${esc(p.desc)} · environ ${dureeEstimee(p)} min</div><ul>${p.ex.map(l=>`<li>${esc(EX[l.id].name)}</li>`).join('')}</ul><button class="btn block" data-act="start" data-type="${next}">Démarrer la séance ${next}</button>${stripes()}</section>`;
  }else{
    const reste=obj.total-obj.faites;
    if(reste>0)hero=`<section class="card hero done"><div class="eyebrow">Semaine</div><h2>A et B faites !</h2><div style="font-weight:600;opacity:.9">Encore ${reste} séance${reste>1?'s':''} prévue${reste>1?'s':''} cette semaine. Touche un jour pour la démarrer.</div>${stripes()}</section>`;
    else hero=`<section class="card hero done"><div class="eyebrow">Semaine</div><h2>Salle validée !</h2><div style="font-weight:600;opacity:.9">${st.five?'Les 2 séances et le Five sont faits. Repos et marche jusqu\'à lundi.':'Les 2 séances sont faites. Il reste le Five vendredi.'}</div>${stripes()}</section>`;
  }
  const now=new Date(),mStart=new Date(now.getFullYear(),now.getMonth(),1);
  const monthCount=S.sessions.filter(s=>s.type!=='five'&&s.date&&pkey(s.date)>=mStart).length;
  const avg7=avgBetween(addDays(pkey(today),-6),pkey(today));
  const lastW=sortedWeights().slice(-1)[0];
  const other=next==='A'?'B':'A';
  return `${draftBanner()}
  ${vueSeg('semaine')}
  ${rappelSauvegarde()}
  <div><div class="eyebrow">Semaine du ${ws.getDate()} ${MONTHS[ws.getMonth()]}</div><h1 class="title-xl">Ton programme</h1></div>
  <div class="week" role="list" aria-label="Programme de la semaine">${strip}</div>
  <p class="small muted" style="margin:-6px 0 0">${obj.total?`<b>Objectif de la semaine : ${obj.faites}/${obj.total} séance${obj.total>1?'s':''}.</b> `:''}${esc(opt.label)} + Five le vendredi. Touche un jour pour prévoir une séance.</p>
  ${exceptionsSemaine(ws).length?`<button class="btn sm ghost" data-act="semdefaut" style="align-self:flex-start">${I.undo} Remettre la semaine par défaut</button>`:''}
  ${seancesManquees(ws).map(it=>{const info=infoModele(it.modele);return `<div class="nudge manquee">${badgeHTML(info,'passe')}<span>${esc(info.nom)} pas faite ${DAYS_LONG[(pkey(it.date).getDay()+6)%7]}</span><button class="link" data-act="itmove" data-it="${cleItem(it)}" data-to="${today}">La placer aujourd'hui</button></div>`;}).join('')}
  ${hero}
  ${!S.draft?`<div class="row">
    <button class="btn ghost" style="flex:1" data-act="start" data-type="${other}">${badgeHTML(infoModele(other))} Faire la ${other}</button>
    <a class="btn ghost" style="flex:1" href="#seance">Autre séance</a></div>`:''}
  <button class="btn ghost block" data-act="five">${badgeHTML(infoModele('five'))} ${st.five?'Five noté cette semaine':'Noter le Five'}</button>
  ${activityCard()}
  <div class="tiles">
    <a class="tile" href="#mois" style="text-decoration:none;color:inherit"><div class="l">Séances ce mois-ci</div><div class="v num">${monthCount}</div></a>
    <a class="tile" href="#poids" style="text-decoration:none;color:inherit"><div class="l">Moyenne poids 7 jours</div><div class="v num">${avg7!=null?fmt1(avg7)+'<small>kg</small>':lastW?fmt1(lastW.kg)+'<small>kg</small>':'–'}</div></a>
  </div>`;
}

/* ---------- Views: calendar ---------- */
function viewCalendrier(){
  if(!S.cal){const n=new Date();S.cal={y:n.getFullYear(),m:n.getMonth()};}
  const {y,m}=S.cal,first=new Date(y,m,1),last=new Date(y,m+1,0),today=dkey();
  let d=weekStart(first),cells=DAYS.map(x=>`<div class="dh">${x}</div>`).join('');
  const calItems={};
  for(let x=weekStart(first);x<=last;x=addDays(x,7))semaineItems(x).forEach(it=>{(calItems[it.date]=calItems[it.date]||[]).push(it);});
  while(d<=last||(d.getDay()+6)%7!==0){
    const k=dkey(d),out=d.getMonth()!==m;
    const its=calItems[k]||[];
    const w=S.weights.find(x=>x.date===k),act=dayData(k);
    const nm=it=>(it.ses?infoSeance(it.ses):infoModele(it.modele));
    cells+=`<button class="cal-cell ${out?'out':''} ${k===today?'today':''}" data-act="day" data-date="${k}" aria-label="${fmtDate(k)}${its.length?', '+its.map(it=>nm(it).nom+(it.etat==='fait'?' faite':it.etat==='passe'?' non faite':' prévue')).join(', '):''}">
      <span class="n">${d.getDate()}${w?'<span class="wd" aria-hidden="true"></span>':''}</span>
      <span class="mb">${its.map(it=>{const info=nm(it);return `<i class="c-${esc(info.couleur)} ${it.etat}">${esc(info.badge)}</i>`;}).join('')}</span>
      ${act&&act.steps!=null?`<span class="st">${act.steps>=1000?fmt1(act.steps/1000)+'k':act.steps} pas</span>`:''}</button>`;
    d=addDays(d,1);
    if(d>last&&(d.getDay()+6)%7===0)break;
  }
  const inM=k=>{const x=pkey(k);return x>=first&&x<=last;};
  const ms=S.sessions.filter(s=>s.date&&inM(s.date));
  const gym=ms.filter(s=>s.type!=='five').length,five=ms.filter(s=>s.type==='five').length;
  const tap=ms.reduce((a,s)=>a+tapisMin(s),0);
  const md=S.days.filter(x=>inM(x.date));
  const st=md.filter(x=>x.steps!=null).map(x=>x.steps),kc=md.filter(x=>x.kcal!=null).map(x=>x.kcal);
  const mw=sortedWeights().filter(x=>inM(x.date));
  const wd=mw.length>=2?mw[mw.length-1].kg-mw[0].kg:null;
  return `${vueSeg('mois')}
  <div class="cal-head"><button class="icon-btn" data-act="calnav" data-d="-1" aria-label="Mois précédent">${I.left}</button>
    <div style="text-align:center"><div class="eyebrow">Calendrier</div><h1 class="title-l">${MONTHS_LONG[m]} ${y}</h1></div>
    <button class="icon-btn" data-act="calnav" data-d="1" aria-label="Mois suivant">${I.right}</button></div>
  <div class="cal">${cells}</div>
  <div class="legend2"><span><span class="badge A" style="min-width:16px;height:16px;font-size:10px;padding:0 3px;border-radius:4px">A</span>Séance A</span><span><span class="badge B" style="min-width:16px;height:16px;font-size:10px;padding:0 3px;border-radius:4px">B</span>Séance B</span><span><span class="badge L" style="min-width:16px;height:16px;font-size:10px;padding:0 3px;border-radius:4px">L</span>Libre</span><span><span class="badge five" style="min-width:16px;height:16px;font-size:10px;padding:0 3px;border-radius:4px">5</span>Five</span><span><span class="wd" style="width:8px;height:8px;border-radius:50%;background:var(--accent-2);display:inline-block"></span>Pesée</span></div>
  <h2 class="title-m">Bilan de ${MONTHS_LONG[m]}</h2>
  <div class="tiles">
    <div class="tile"><div class="l">Séances de salle</div><div class="v num">${gym}</div></div>
    <div class="tile"><div class="l">Five</div><div class="v num">${five}</div></div>
    <div class="tile"><div class="l">Tapis et cardio</div><div class="v num">${fmtInt(tap)}<small>min</small></div></div>
    <div class="tile"><div class="l">Évolution du poids</div><div class="v num ${wd!=null?(wd<=0?'trend-down':'trend-up'):''}">${wd!=null?(wd>0?'+':'')+fmt1(wd)+'<small>kg</small>':'–'}</div></div>
    <div class="tile"><div class="l">Pas par jour (moy.)</div><div class="v num">${st.length?fmtInt(st.reduce((a,b)=>a+b,0)/st.length):'–'}</div></div>
    <div class="tile"><div class="l">Kcal actives par jour</div><div class="v num">${kc.length?fmtInt(kc.reduce((a,b)=>a+b,0)/kc.length):'–'}</div></div>
  </div>
  <p class="small muted" style="margin:0">Touche un jour pour voir le détail ou ajouter tes pas et tes kcal.</p>`;
}
/* ---------- Views: session ---------- */
function exCard(id){
  const e=rx(id),d=cur(),sets=d.sets[id]||[],sg=suggest(id),F=fieldsFor(id);
  const allDone=sets.length&&sets.every(x=>x.done);
  const L=altLists(id),nAlt=L.off.length+L.perso.length+L.dep.length,orig=remplaceDe(id);
  const rows=sets.map((x,i)=>`<div class="set ${x.done?'done':''}">
    <span class="set-n">${i+1}</span>
    ${F.map(f=>`<label class="fld"><input id="${f.k}-${id}-${i}" data-ex="${id}" data-i="${i}" data-f="${f.k}" inputmode="${f.im}" autocomplete="off" placeholder="–" value="${esc(x[f.k])}" aria-label="${esc(f.label)} série ${i+1}"><span>${esc(f.label)}</span></label>`).join('')}
    <button class="check" data-act="toggleset" data-ex="${id}" data-i="${i}" aria-label="${x.done?'Annuler':'Valider'} la série ${i+1}" aria-pressed="${x.done}">${I.check}</button></div>`).join('');
  return `<section class="card ex ${allDone?'complete':''}" id="ex-${id}">
    <div class="ex-top">
      <button class="ex-thumb" data-act="exinfo" data-ex="${id}" aria-label="Voir comment faire : ${esc(e.name)}">${illuHTML(id,'vignette')}<span class="play">${I.play}</span></button>
      <div style="min-width:0"><h3>${esc(e.name)}</h3>${orig&&EX[orig]?`<p class="small muted" style="margin:2px 0 0">À la place de ${esc(EX[orig].name)}</p>`:''}<p class="presc">${presc(id)}${e.rest?' · repos '+restLabel(e.rest):''}${e.perHand?' · kg par haltère':''}${e.note?' · '+esc(e.note):''}</p>
      ${sg.last&&S.route!=='modif'?`<p class="last" style="margin-top:4px">Dernière fois : <b>${setsStr(id,sg.last.ex[id])}</b></p>`:''}</div>
    </div>
    ${S.route==='modif'?'':`<p class="hint ${sg.up?'up':''}">${esc(sg.txt)}</p>`}
    <div class="sets">${rows}</div>
    <div class="ex-actions"><button class="btn sm ghost" data-act="addset" data-ex="${id}">${I.plus} Série</button><button class="btn sm ghost" data-act="rmset" data-ex="${id}" ${sets.length>1?'':'disabled'}>− Série</button><button class="btn sm ghost" data-act="altsheet" data-ex="${id}">${I.swap} Alternative${nAlt?` (${nAlt})`:''}</button><button class="btn sm ghost rm" data-act="rmex" data-ex="${id}" aria-label="Retirer ${esc(e.name)} de la séance">${I.trash} Retirer</button></div>
  </section>`;
}
function migrateDraft(d){
  if(!d)return d;
  if(!d.list)d.list=Object.keys(d.sets||{});
  d.from=d.from||{};d.rx=d.rx||{};
  if(d.tapis){if(!d.list.includes('tapis')){d.list.push('tapis');d.sets.tapis=[{r:String(d.tapis.min||'20'),w:String(d.tapis.inc||'11'),done:!!d.tapis.done}];}delete d.tapis;}
  d.list=d.list.filter(id=>EX[id]);
  return d;
}
function viewSeance(){
  if(!S.draft)return viewChoose();
  const d=S.draft,info=d.info||infoModele(d.type),p=modeleParId(d.type);
  const total=d.list.reduce((a,id)=>a+(d.sets[id]||[]).length,0),done=d.list.reduce((a,id)=>a+(d.sets[id]||[]).filter(x=>x.done).length,0);
  const st=new Date(d.start);
  return `<div class="session-head"><div><div class="eyebrow">${p&&p.desc?esc(p.desc)+' · ':''}depuis ${st.getHours()} h ${pad(st.getMinutes())}</div><h1 class="title-xl">${badgeHTML(info)} ${esc(info.nom)}</h1></div><div class="small muted num" style="text-align:right">${done}/${total}<br>${total>1?'séries':'série'}</div></div>
  <div class="progress" aria-hidden="true"><i style="width:${total?done/total*100:0}%"></i></div>
  <div class="row"><button class="btn sm danger" data-act="abandon">${I.x} Annuler la séance</button></div>
  ${d.list.length?d.list.map(exCard).join(''):'<div class="empty">Ajoute ton premier exercice avec le bouton ci-dessous.</div>'}
  <button class="btn ghost block" data-act="addex">${I.plus} Ajouter un exercice</button>
  <button class="btn primary block" data-act="finish">Terminer la séance</button>`;
}
function startSession(type,opts={}){
  if(S.draft){location.hash='seance';toast('Une séance est déjà en cours.');return;}
  if(type!=='L'&&!modeleParId(type)){toast('Séance introuvable.');return;}
  demarrerSeance(type,opts);Ecran.garder();
  if(location.hash==='#seance')render();else location.hash='seance';
  window.scrollTo(0,0);
  if(type==='L')setTimeout(()=>openPicker({mode:'add'}),150);
}
/* Fin de séance : 1) séries pas validées ? 2) plus de 3 heures ? 3) enregistrement et récapitulatif. */
function finishSession(etape){
  const d=S.draft;if(!d)return;
  const e=etatFin(d);
  if(etape!=='duree'&&etape!=='series'&&(e.remplies||e.vides)){
    const parts=[];
    if(e.remplies)parts.push(`${nb(e.remplies,'série remplie','séries remplies')} mais pas ${e.remplies>1?'validées':'validée'}`);
    if(e.vides)parts.push(nb(e.vides,'série vide','séries vides'));
    openModal(`<div class="sheet-head"><div><div class="eyebrow">Fin de séance</div><h2 class="title-l">Terminer la séance ?</h2></div><button class="x" data-act="close" aria-label="Fermer">${I.x}</button></div>
      <p class="muted" style="margin:0">Il reste ${parts.join(' et ')}.${e.valides?` ${nb(e.valides,'série est validée','séries sont validées')}.`:''}</p>
      ${e.remplies?`<button class="btn primary block" data-act="finvalider">Valider ${e.remplies>1?`ces ${e.remplies} séries`:'cette série'} et terminer</button>`:''}
      <button class="btn ${e.remplies?'ghost':'primary'} block" data-act="finsans">Terminer sans ${e.remplies+e.vides>1?'elles':'elle'}</button>
      <button class="btn ghost block" data-act="close">Continuer la séance</button>
      ${e.remplies&&e.vides?`<p class="small muted" style="margin:0">« Valider et terminer » garde les séries remplies et laisse de côté les vides. « Terminer sans elles » ne garde que les séries déjà validées.</p>`:''}`);
    return;
  }
  if(etape!=='duree'&&seanceTropLongue()){
    const st=new Date(d.start);
    openModal(`<div class="sheet-head"><div><div class="eyebrow">Fin de séance</div><h2 class="title-l">À quelle heure as-tu fini ?</h2></div><button class="x" data-act="close" aria-label="Fermer">${I.x}</button></div>
      <p class="muted" style="margin:0">Ta séance a commencé le ${fmtDate(dkey(st))} à ${st.getHours()} h ${pad(st.getMinutes())}, il y a plus de 3 heures. Indique l'heure de fin réelle pour garder une durée juste.</p>
      <label class="stack" style="gap:6px"><span class="small" style="font-weight:700">Heure de fin</span><input class="input" type="time" id="finheure" value="${hhmm(finEstimee())}"></label>
      <p class="hint" id="finerr" style="color:var(--danger)" hidden></p>
      <button class="btn primary block" data-act="finheure">Terminer la séance</button>
      <button class="btn ghost block" data-act="close">Continuer la séance</button>`);
    return;
  }
  terminerEtAfficher(etape==='duree'?S.finChoisie:undefined);
}
/* Heure de fin choisie (HH:MM, le jour du début ; le lendemain si elle est avant le début). */
function finDepuisHeure(v){
  const d=S.draft,m=String(v||'').match(/^(\d{1,2}):(\d{2})$/);if(!m)return null;
  const base=new Date(d.start);base.setHours(+m[1],+m[2],0,0);let f=base.getTime();
  if(f<=d.start)f+=864e5;
  return f>Date.now()?null:f;
}
function terminerEtAfficher(fin){
  const r=terminerSeance(fin);
  if(r.erreur){toast(r.erreur);closeModal();return;}
  const {ses,n,vol,records}=r,info=infoSeance(ses);
  Timer.stop();Ecran.liberer();S.derniere=ses.id;S.finChoisie=null;
  location.hash='semaine';
  openModal(`<div class="sheet-head"><div><div class="eyebrow">Bien joué</div><h2 class="title-xl">${esc(info.nom)} terminée</h2></div><button class="x" data-act="close" aria-label="Fermer">${I.x}</button></div>
    <div class="tiles"><div class="tile"><div class="l">Durée</div><div class="v num">${ses.dur}<small>min</small></div></div><div class="tile"><div class="l">${n>1?'Séries':'Série'}</div><div class="v num">${n}</div></div>
    <div class="tile"><div class="l">Volume soulevé</div><div class="v num">${fmtInt(vol)}<small>kg</small></div></div><div class="tile"><div class="l">Cardio</div><div class="v num">${tapisMin(ses)?tapisMin(ses)+'<small>min</small>':'–'}</div></div></div>
    ${records.length?`<div class="hint up">Nouveau record : ${records.map(id=>esc(EX[id].name)).join(', ')}</div>`:''}
    ${ses.type==='L'?`<button class="btn ghost block" data-act="saveasperso" data-id="${ses.id}">${I.plus} Enregistrer comme séance perso</button>`:''}
    <div class="row"><button class="btn ghost" style="flex:1" data-act="modifier" data-id="${ses.id}">${I.edit} Modifier</button><button class="btn ghost" style="flex:1" data-act="rouvrir" data-id="${ses.id}">${I.undo} Rouvrir la séance</button></div>
    <p class="small muted" style="margin:0">« Rouvrir » remet la séance en cours pendant 3 heures, pour ajouter ce qui manque.</p>
    <button class="btn primary block" data-act="close">Fermer</button>`);
}

/* ---------- Modifier une séance terminée ---------- */
function viewModif(){
  const m=S.modif;if(!m){setTimeout(()=>{location.hash='historique';});return '';}
  const ses=S.sessions.find(s=>s.id===m.sesId)||{},info=infoSeance(ses),c=m.champs;
  const tete=`<div><button class="link small" data-act="modifannuler">← Annuler</button><div class="eyebrow" style="margin-top:8px">Modifier la séance</div><h1 class="title-xl">${badgeHTML(info)} ${esc(info.nom)}</h1></div>`;
  const boutons=`<p class="hint" id="moderr" style="color:var(--danger)" hidden></p>
    <button class="btn primary block" data-act="modifsave">Enregistrer les modifications</button>
    <button class="btn ghost block" data-act="modifannuler">Annuler</button>`;
  if(m.five)return `${tete}
    <section class="card stack">
      <label class="stack" style="gap:6px"><span class="small" style="font-weight:700">Date</span><input class="input" type="date" id="m-date" value="${esc(c.date)}" max="${dkey()}"></label>
      <label class="stack" style="gap:6px"><span class="small" style="font-weight:700">Durée</span><span class="fld"><input id="m-min" inputmode="numeric" value="${esc(c.min)}" aria-label="Durée en minutes"><span>min</span></span></label>
      <label class="stack" style="gap:6px"><span class="small" style="font-weight:700">Note</span><input class="input" id="m-note" value="${esc(c.note)}" placeholder="Ex. : bonne forme, 3 buts"></label>
    </section>${boutons}`;
  const d=m.d;
  return `${tete}
  <section class="card stack">
    <div class="modif-champs">
      <label><span>Date</span><input class="input" type="date" id="m-date" value="${esc(c.date)}" max="${dkey()}"></label>
      <label><span>Début</span><input class="input" type="time" id="m-heure" value="${esc(c.heure)}"></label>
      <label><span>Durée (min)</span><input class="input" id="m-dur" inputmode="numeric" value="${esc(c.dur)}"></label>
    </div>
    <p class="small muted" style="margin:0">Seules les séries cochées ✓ sont enregistrées.</p>
  </section>
  ${d.list.length?d.list.map(exCard).join(''):'<div class="empty">Ajoute au moins un exercice.</div>'}
  <button class="btn ghost block" data-act="addex">${I.plus} Ajouter un exercice</button>
  ${boutons}`;
}

/* Une ligne d'alternative avec ses étiquettes. */
function altRow(from,x,opts){
  const e=EX[x.id],tags=altTags(from,x.id,opts);
  const act=opts.act||'swapto';
  return `<button class="bank-row alt" data-act="${act}" data-ex="${x.id}" data-from="${from}"><span class="ic">${illuHTML(x.id,'liste')}</span><span style="min-width:0;flex:1"><span class="nm">${esc(e.name)}</span><br><span class="sb">${esc(e.equip)}${x.note?' · '+esc(x.note):''}</span>${tags.length?`<span class="tags">${tags.map(t=>`<i class="t-${norm(t).replace(/\W+/g,'-')}">${esc(t)}</i>`).join('')}</span>`:''}</span></button>`;
}
function altSheet(id){
  const e=EX[id],d=cur(),L=altLists(id,d?d.list:[]);
  const sec=(t,arr,o)=>arr.length?`<div class="stack" style="gap:0"><div class="pick-sec">${t}</div>${arr.map(x=>altRow(id,x,o)).join('')}</div>`:'';
  openModal(`<div class="sheet-head"><div><div class="eyebrow">Alternative</div><h2 class="title-l">Remplacer ${esc(e.name)}</h2></div><button class="x" data-act="close" aria-label="Fermer">${I.x}</button></div>
    ${sec('Même mouvement, autre matériel',L.off,{})}
    ${sec('Tes alternatives perso',L.perso,{perso:true})}
    ${sec('Dépannage : mouvement différent',L.dep,{dep:true})}
    ${!L.off.length&&!L.perso.length&&!L.dep.length?'<p class="small muted" style="margin:0">Pas d\'alternative disponible pour cet exercice.</p>':''}
    <button class="btn ghost block" data-act="pickswap" data-ex="${id}">${I.search} Choisir dans la banque d'exos</button>
    <p class="small muted" style="margin:0">La charge n'est jamais reprise : Sporty propose celle de ta dernière fois sur l'alternative. Séries, repos et répétitions restent ceux de ${esc((EX[remplaceDe(id)]||e).name)}, sauf pour un exercice au poids du corps ou en durée.</p>`);
}

/* ---------- Views: bank ---------- */
function bankRow(id,act,from){
  const e=EX[id];if(!e)return '';
  const L=act?null:altLists(id),n=L?L.off.length+L.perso.length:0;
  return `<button class="bank-row" data-act="${act||'exinfo'}" data-ex="${id}"${from?` data-from="${from}"`:''}><span class="ic">${illuHTML(id,'liste')}</span><span style="min-width:0"><span class="nm">${esc(e.name)}</span><br><span class="sb">${esc(GROUPS[e.group]||'')} · ${esc(e.equip)}${e.custom?' · perso':''}</span></span>${isHidden(id)&&!act?`<span class="tag off">masqué</span>`:n&&!act?`<span class="tag">${n} alt.</span>`:''}</button>`;
}
function filterIds(q,g,withHidden){
  const nq=norm(q.trim());
  return Object.keys(EX).filter(id=>{const e=EX[id];if(!withHidden&&isHidden(id))return false;if(g!=='all'&&e.group!==g)return false;if(!nq)return true;return norm(e.name+' '+e.equip+' '+e.muscles.join(' ')+' '+(GROUPS[e.group]||'')).includes(nq);});
}
function bankListHTML(){
  const ids=filterIds(S.bankQ,S.bankG,S.showHidden);
  if(!ids.length)return `<div class="empty">Aucun exercice trouvé. Tu peux le créer avec « Créer un exercice ».</div>`;
  return Object.keys(GROUPS).map(g=>{const gi=ids.filter(id=>EX[id].group===g);if(!gi.length)return '';return `<section class="card bank-group"><h3>${GROUPS[g]} <span>${gi.length}</span></h3>${gi.map(id=>bankRow(id)).join('')}</section>`;}).join('');
}
function viewExos(){
  const vis=Object.keys(EX).filter(id=>S.showHidden||!isHidden(id)),total=vis.length;
  const nHid=Object.keys(EX).filter(isHidden).length;
  const counts={};vis.forEach(id=>counts[EX[id].group]=(counts[EX[id].group]||0)+1);
  return `<div class="head-row"><div><div class="eyebrow">${nb(total,'exercice','exercices')}</div><h1 class="title-xl">Banque d'exos</h1></div><button class="icon-btn" data-act="newex">${I.plus}<span>Créer</span></button></div>
  ${S.draft?`<p class="small muted" style="margin:0">Touche un exercice pour l'ajouter à ta séance en cours.</p>`:''}
  <label class="search">${I.search}<input id="bankq" type="search" placeholder="Chercher : poulie, fessiers, presse…" value="${esc(S.bankQ)}" aria-label="Chercher un exercice"></label>
  <div class="chips" role="tablist"><button class="chip ${S.bankG==='all'?'on':''}" data-act="bankg" data-g="all">Tous</button>${Object.keys(GROUPS).map(g=>`<button class="chip ${S.bankG===g?'on':''}" data-act="bankg" data-g="${g}">${GROUPS[g]} · ${counts[g]||0}</button>`).join('')}</div>
  ${nHid?`<button class="btn sm ghost" data-act="togglehidden" aria-pressed="${!!S.showHidden}">${S.showHidden?'Cacher les exercices masqués':`Voir les exercices masqués (${nHid})`}</button>`:''}
  <div id="bankList" class="stack">${bankListHTML()}</div>`;
}
function exInfo(id){
  const D=cur(),e=EX[id],inDraft=!!D&&D.list.includes(id),L=altLists(id,inDraft?D.list:[]);
  openModal(`<div class="sheet-head"><div><div class="eyebrow">${esc(GROUPS[e.group]||'')} · ${presc(id)}${e.rest?' · repos '+restLabel(e.rest):''}</div><h2 class="title-l">${esc(e.name)}</h2></div><button class="x" data-act="close" aria-label="Fermer">${I.x}</button></div>
  <div class="figbox${['photo','perso'].includes(typeVisuel(id))?' photo':''}">${illuHTML(id,'grand')}</div>
  ${illuNote(id)}
  ${['photo','perso','bonhomme'].includes(typeVisuel(id))?`<div class="muscles-mini">${mmapSVG(e.group,'Muscles travaillés : '+e.muscles.join(', '),true)}<span class="small"><b>Muscles travaillés</b><br><span class="muted">${esc(e.muscles.join(', '))}</span></span></div>`:''}
  <div class="row" style="flex-wrap:wrap">
    <button class="btn sm ghost" data-act="photos" data-ex="${id}">${I.camera} ${typeVisuel(id)==='perso'?'Changer mes photos':'Ajouter mes photos'}</button>
    ${typeVisuel(id)==='perso'?`<button class="btn sm ghost" data-act="photosdel" data-ex="${id}">Revenir à l'illustration d'origine</button>`:''}
  </div>
  <div class="pills"><span class="pill">${esc(e.equip)}</span>${e.muscles.map(m=>`<span class="pill">${esc(m)}</span>`).join('')}${e.perHand?'<span class="pill">Charge par haltère</span>':''}</div>
  ${e.cues.length?`<ul class="cues">${e.cues.map(c=>`<li>${esc(c)}</li>`).join('')}</ul>`:'<p class="small muted" style="margin:0">Exercice perso : ajoute ta vidéo dans Réglages si tu veux.</p>'}
  <a class="btn primary block" href="${esc(videoUrl(id))}" target="_blank" rel="noopener noreferrer">${I.ext} Voir la vidéo</a>
  ${D&&!inDraft?`<button class="btn blue block" data-act="addtosession" data-ex="${id}">${I.plus} Ajouter à la séance${S.route==='modif'?'':' en cours'}</button>`:''}
  <div class="stack" style="gap:0"><h3 class="title-m" style="margin-bottom:4px">Alternatives</h3>
    ${MOUV[id]?`<p class="small muted" style="margin:0 0 4px">Mouvement : ${esc(SCHEMAS[MOUV[id][0]])}</p>`:''}
    ${L.off.map(x=>altRow(id,x,{act:inDraft?'swapto':'exinfo'})).join('')}
    ${L.perso.map(x=>`<div class="alt-row">${altRow(id,x,{perso:true,act:inDraft?'swapto':'exinfo'})}<button class="x" data-act="rmalt" data-ex="${x.id}" data-from="${id}" aria-label="Retirer ${esc(EX[x.id].name)} de tes alternatives">${I.trash}</button></div>`).join('')}
    ${L.dep.length?`<div class="pick-sec">Dépannage</div>${L.dep.map(x=>altRow(id,x,{dep:true,act:inDraft?'swapto':'exinfo'})).join('')}`:''}
    ${!L.off.length&&!L.perso.length&&!L.dep.length?'<p class="small muted" style="margin:4px 0 8px">Pas encore d\'alternative pour cet exercice.</p>':''}
    <button class="btn ghost block" data-act="pickalt" data-ex="${id}" style="margin-top:8px">${I.plus} Ajouter une alternative perso</button>
  </div>
  ${id==='tapis'?'':isHidden(id)?`<button class="btn ghost block" data-act="unhide" data-ex="${id}">${I.eye} Réafficher dans la banque</button>`:`<button class="btn ghost block" data-act="hide" data-ex="${id}">${I.eyeoff} Masquer de la banque</button>`}
  <p class="small muted" style="margin:-4px 0 0">${isHidden(id)?'Cet exercice est masqué : il n\'apparaît plus dans la banque ni dans les suggestions.':'Pour un exercice que tu ne fais jamais ou qui n\'existe pas dans ta salle. Tes séances passées ne changent pas.'}</p>
  ${e.custom?`<button class="btn danger block" data-act="delcustom" data-ex="${id}">${I.trash} Supprimer cet exercice perso</button>`:''}`);
}
/* Picker */
let picker=null;
function openPicker(ctx){
  picker=Object.assign({q:'',g:'all'},ctx);
  const t=ctx.mode==='addalt'?`Alternative à ${EX[ctx.for].name}`:ctx.mode==='swap'?`Remplacer ${EX[ctx.for].name}`:ctx.mode==='edit'?'Ajouter à la séance':ctx.mode==='impfix'?`Remplacer « ${S.imp.lignes[ctx.i].nom} »`:'Ajouter un exercice';
  openModal(`<div class="sheet-head"><div><div class="eyebrow">Banque d'exos</div><h2 class="title-l">${esc(t)}</h2></div><button class="x" data-act="close" aria-label="Fermer">${I.x}</button></div>
    <label class="search">${I.search}<input id="pickq" type="search" placeholder="Chercher un exercice" aria-label="Chercher un exercice" data-autofocus></label>
    <div class="chips"><button class="chip on" data-act="pickg" data-g="all">Tous</button>${Object.keys(GROUPS).map(g=>`<button class="chip" data-act="pickg" data-g="${g}">${GROUPS[g]}</button>`).join('')}</div>
    <div class="pick-list" id="pickList">${pickListHTML()}</div>`);
}
function pickListHTML(){
  const p=picker;const exclude=new Set(p.for?[p.for].concat(p.mode==='addalt'?alts(p.for):[]):[]);
  if(p.mode==='edit'&&S.edit)S.edit.m.ex.forEach(l=>exclude.add(l.id));
  else if(cur()&&p.mode!=='addalt')cur().list.forEach(x=>exclude.add(x));
  let ids=filterIds(p.q,p.g).filter(id=>!exclude.has(id));
  let html='';
  if(p.for&&!p.q&&p.g==='all'){
    const grp=EX[p.for].group;const same=ids.filter(id=>EX[id].group===grp);
    if(same.length)html+=`<div class="pick-sec">Même groupe : ${esc(GROUPS[grp])}</div>`+same.map(id=>bankRow(id,'pick')).join('');
    ids=ids.filter(id=>EX[id].group!==grp);
    if(ids.length)html+=`<div class="pick-sec">Tous les autres</div>`;
  }
  html+=ids.map(id=>bankRow(id,'pick')).join('');
  return html||'<div class="empty">Aucun exercice trouvé.</div>';
}
function newExSheet(nom){
  openModal(`<div class="sheet-head"><div><div class="eyebrow">Banque d'exos</div><h2 class="title-l">Créer un exercice</h2></div><button class="x" data-act="close" aria-label="Fermer">${I.x}</button></div>
    <p class="small muted" style="margin:0">Pour une machine de ta salle qui n'est pas dans la liste.</p>
    <label class="stack" style="gap:6px"><span class="small" style="font-weight:700">Nom</span><input class="input" id="nxname" placeholder="Ex. : Presse à cuisses Panatta" value="${esc(nom||'')}" data-autofocus></label>
    <label class="stack" style="gap:6px"><span class="small" style="font-weight:700">Groupe musculaire</span><select class="sel" id="nxgroup">${Object.keys(GROUPS).map(g=>`<option value="${g}">${GROUPS[g]}</option>`).join('')}</select></label>
    <label class="stack" style="gap:6px"><span class="small" style="font-weight:700">Matériel</span><input class="input" id="nxequip" placeholder="Ex. : Machine, Poulie, Haltères"></label>
    <label class="stack" style="gap:6px"><span class="small" style="font-weight:700">Ce que tu notes</span><select class="sel" id="nxmode">${Object.keys(MODES).map(m=>`<option value="${m}">${MODES[m]}</option>`).join('')}</select></label>
    <button class="btn primary block" data-act="savenewex">Créer l'exercice</button>`);
}

/* ---------- Views: history ---------- */
function progValue(id,sets){
  const m=(EX[id]||{}).mode;
  if(m==='time')return sets.reduce((a,x)=>a+(x.r||0),0);
  if(m==='bw'||m==='hold')return Math.max(...sets.map(x=>x.r||0));
  return Math.max(...sets.map(x=>x.w||0));
}
function progLabel(id){const m=(EX[id]||{}).mode;return m==='time'?['Minutes par séance','min']:m==='bw'?['Répétitions max par série','rép.']:m==='hold'?['Durée max','s']:['Charge max par séance','kg'];}
function viewHistorique(){
  const ses=sortedSessions();
  const used=[];ses.forEach(s=>{if(s.ex)Object.keys(s.ex).forEach(id=>{if(EX[id]&&!used.includes(id))used.push(id);});});
  const ids=used.length?used:modeleAB('A').ex.concat(modeleAB('B').ex).map(l=>l.id);
  if(!S.histEx||!ids.includes(S.histEx))S.histEx=ids[0];
  const cur=S.histEx,[lab,unit]=progLabel(cur);
  const pts=ses.filter(s=>s.ex&&s.ex[cur]).map(s=>({x:pkey(s.date).getTime(),y:progValue(cur,s.ex[cur])}));
  let prog='';
  if(pts.length>=2){
    const sorted=pts.slice().sort((a,b)=>a.x-b.x),first=sorted[0].y,lastv=sorted[sorted.length-1].y,diff=lastv-first;
    prog=`<div class="row" style="justify-content:space-between"><div><div class="small muted">${lab}</div><div class="title-l num">${fmt(first)} → ${fmt(lastv)} ${unit}</div></div><span class="badge ${diff>0?'A':'rest'}" style="font-size:16px">${diff>0?'+':''}${fmt(diff)} ${unit}</span></div>`+
      lineChart({series:[{pts,cls:'ln',dots:true,area:true,end:true}],label:'Progression pour '+EX[cur].name});
  }else prog=`<div class="empty">${pts.length?'Encore une séance avec cet exercice et la courbe apparaît.':'Pas encore de séance avec cet exercice.'}</div>`;
  const list=ses.length?ses.map(s=>{
    const open=S.openHist===s.id;
    const nsets=s.ex?Object.values(s.ex).reduce((a,x)=>a+x.length,0):0;
    const tm=tapisMin(s);
    const meta=(s.type==='five'?`${s.min||60} min de foot`:`${nb(nsets,'série','séries')} · ${s.dur||'?'} min${tm?` · cardio ${tm} min`:''}`)+(s.modifiee?' · modifiée':'');
    let det='';
    if(open){
      det=`<div class="hist-detail">${s.ex?Object.keys(s.ex).map(id=>`<div class="l"><span>${esc(exLabel(id,s))}</span><b class="num">${setsStr(id,s.ex[id])}</b></div>`).join(''):''}
      ${s.tapis?`<div class="l"><span>Tapis</span><b class="num">${s.tapis.min} min · ${fmt(s.tapis.inc)} % · ${fmt(s.tapis.v)} km/h</b></div>`:''}
      ${s.note?`<div class="muted">${esc(s.note)}</div>`:''}
      ${s.modifiee?'<div><span class="pill">modifiée</span></div>':''}
      <div class="row" style="flex-wrap:wrap"><button class="btn sm ghost" data-act="modifier" data-id="${s.id}">${I.edit} Modifier</button>${peutRouvrir(s)?`<button class="btn sm ghost" data-act="rouvrir" data-id="${s.id}">${I.undo} Rouvrir la séance</button>`:''}${s.ex&&s.type!=='five'?`<button class="btn sm ghost" data-act="refaire" data-id="${s.id}">${I.copy} Refaire cette séance</button>`:''}<button class="btn sm danger" data-act="delses" data-id="${s.id}">${I.trash} Supprimer</button></div></div>`;
    }
    return `<div class="card hist-item"><button class="h" data-act="togglehist" data-id="${s.id}" aria-expanded="${open}">${badgeHTML(infoSeance(s))}<div style="flex:1;min-width:0"><b>${esc(infoSeance(s).nom)}</b><div class="meta">${fmtDate(s.date)} · ${meta}</div></div><span class="muted" aria-hidden="true">${open?'▴':'▾'}</span></button>${det}</div>`;
  }).join(''):`<div class="empty">Tes séances apparaîtront ici dès que tu en auras terminé une.</div>`;
  return `<div class="head-row"><div><div class="eyebrow">Progrès</div><h1 class="title-xl">Historique</h1></div><a class="icon-btn" href="#mois">${I.cal}<span>Mois</span></a></div>
  <section class="card stack"><h2 class="title-m">Progression par exercice</h2>
    <div class="chips" role="tablist">${ids.map(id=>`<button class="chip ${id===cur?'on':''}" data-act="histex" data-ex="${id}" role="tab" aria-selected="${id===cur}">${esc(EX[id].name)}</button>`).join('')}</div>
    ${prog}</section>
  <h2 class="title-m">Séances</h2>
  ${list}`;
}

/* ---------- Views: weight ---------- */
function viewPoids(){
  const ws=sortedWeights(),goal=num(S.settings.goal)||72,today=pkey(dkey());
  const last=ws[ws.length-1],first=ws[0];
  const a7=avgBetween(addDays(today,-6),today),p7=avgBetween(addDays(today,-13),addDays(today,-7));
  const delta=a7!=null&&p7!=null?a7-p7:null;
  const ref=a7!=null?a7:last?last.kg:null;
  const startKg=first?first.kg:null;
  const pct=startKg&&ref!=null&&startKg>goal?Math.max(0,Math.min(100,(startKg-ref)/(startKg-goal)*100)):0;
  const rows=ws.slice(-12).reverse().map(w=>`<div class="l"><span>${fmtDate(w.date)}</span><span class="row"><b class="num">${fmt(w.kg)} kg</b><button class="x" data-act="delw" data-date="${w.date}" aria-label="Supprimer la pesée du ${fmtDate(w.date)}">${I.trash}</button></span></div>`).join('');
  const roll=rolling();
  const chart=ws.length>=2?`${lineChart({series:[{pts:ws.map(w=>({x:pkey(w.date).getTime(),y:w.kg})),cls:'ln',dots:true},{pts:roll.map(w=>({x:pkey(w.date).getTime(),y:w.kg})),cls:'ln2',end:true}],goal,label:'Courbe de poids et moyenne sur 7 jours'})}
    <div class="legend"><span><i style="background:var(--accent)"></i>Pesées</span><span><i style="background:var(--accent-2)"></i>Moyenne 7 jours</span></div>`:`<div class="empty">${ws.length?'Encore une pesée et la courbe apparaît.':'Ajoute ta première pesée pour voir ta courbe.'}</div>`;
  return `<div><div class="eyebrow">Poids</div><h1 class="title-xl">Suivi du poids</h1></div>
  <section class="card stack">
    <h2 class="title-m">Pesée du jour</h2>
    <p class="small muted" style="margin:-6px 0 0">Le matin, à jeun, 3 à 4 fois par semaine. Regarde la moyenne, pas le chiffre du jour.</p>
    <div class="row">
      <label class="fld" style="flex:1.2"><input id="wkg" inputmode="decimal" placeholder="${last?fmt(last.kg):'88,45'}" aria-label="Poids en kg"><span>kg</span></label>
      <input id="wdate" class="input" type="date" value="${dkey()}" max="${dkey()}" style="flex:1;height:50px" aria-label="Date de la pesée">
    </div>
    <button class="btn primary block" data-act="addw">Enregistrer la pesée</button>
  </section>
  <div class="tiles">
    <div class="tile"><div class="l">Moyenne 7 jours</div><div class="v num">${a7!=null?fmt1(a7)+'<small>kg</small>':'–'}</div></div>
    <div class="tile"><div class="l">Vs semaine d'avant</div><div class="v num ${delta!=null?(delta<=0?'trend-down':'trend-up'):''}">${delta!=null?(delta>0?'+':'')+fmt1(delta)+'<small>kg</small>':'–'}</div></div>
    <div class="tile"><div class="l">Dernière pesée</div><div class="v num">${last?fmt(last.kg)+'<small>kg</small>':'–'}</div></div>
    <div class="tile"><div class="l">Reste à perdre</div><div class="v num">${ref!=null?fmt1(Math.max(0,ref-goal))+'<small>kg</small>':'–'}</div></div>
  </div>
  <section class="card stack">
    <div class="row" style="justify-content:space-between"><h2 class="title-m">Vers ${fmt(goal)} kg</h2><span class="small muted num">${startKg?`départ ${fmt(startKg)} kg`:''}</span></div>
    <div class="goalbar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(pct)}" aria-label="Progression vers l'objectif"><i style="width:${pct}%"></i></div>
    <div class="small muted">${startKg?`${Math.round(pct)} % du chemin · rythme visé : environ 0,5 kg par semaine`:'Ta première pesée sert de point de départ.'}</div>
    ${chart}
  </section>
  ${ws.length?`<section class="card"><h2 class="title-m" style="margin-bottom:4px">Dernières pesées</h2><div class="wlist">${rows}</div></section>`:''}
`;
}

/* ---------- Views: settings ---------- */
function viewReglages(){
  const t=S.settings.theme||'auto',plan=S.settings.plan||'1';
  return `<div><div class="eyebrow">Réglages</div><h1 class="title-xl">Ton Sporty</h1></div>
  <section class="card stack"><h2 class="title-m">Thème</h2>
    <div class="seg" role="radiogroup" aria-label="Thème">${[['light','Clair'],['dark','Sombre'],['auto','Auto']].map(([k,l])=>`<button role="radio" aria-checked="${t===k}" class="${t===k?'on':''}" data-act="theme" data-v="${k}">${l}</button>`).join('')}</div>
    <p class="small muted" style="margin:0">Auto : clair de 7 h à 19 h, sombre le soir, pour tes séances de 19 h à 20 h.</p></section>
  ${Ecran.dispo?`<section class="card stack"><h2 class="title-m">Pendant la séance</h2>
    <button class="opt ${S.settings.ecranAllume!==false?'on':''}" data-act="ecran" role="switch" aria-checked="${S.settings.ecranAllume!==false}"><span class="dot"></span><span><b>Garder l'écran allumé pendant la séance</b><br><span class="small muted">L'écran ne se met pas en veille entre deux séries. Il redevient normal à la fin de la séance.</span></span></button></section>`:''}
  <section class="card stack" id="jours-salle"><h2 class="title-m">Mes jours de salle</h2>
    ${Object.entries(WEEK_OPTS).map(([k,o])=>`<button class="opt ${plan===k?'on':''}" data-act="plan" data-v="${k}" role="radio" aria-checked="${plan===k}"><span class="dot"></span><span><b>${o.label}</b> + Five le vendredi<br><span class="small muted">${esc(o.note)}</span></span></button>`).join('')}
  </section>
  <section class="card stack"><h2 class="title-m">Objectif de poids</h2>
    <label class="fld" style="max-width:200px"><input id="goal" inputmode="decimal" value="${esc(fmt(num(S.settings.goal)||72))}" aria-label="Objectif en kg"><span>kg</span></label></section>
  <section class="card stack"><h2 class="title-m">Mes séances</h2>
    <p class="small muted" style="margin:0">Modifie A et B, crée tes séances perso, colle une séance reçue.</p>
    <a class="btn ghost block" href="#seances">Gérer mes séances (${modelesTous().length})</a></section>
  <section class="card stack"><h2 class="title-m">Mes vidéos</h2>
    <p class="small muted" style="margin:0">Par défaut, « Voir la vidéo » ouvre une recherche YouTube en français. Pour garder une vidéo précise, colle son lien ici.</p>
    <select class="sel" id="vidsel" aria-label="Exercice">${Object.keys(EX).sort((a,b)=>EX[a].name.localeCompare(EX[b].name,'fr')).map(id=>`<option value="${id}">${esc(EX[id].name)}${(S.settings.videos||{})[id]?' ✓':''}</option>`).join('')}</select>
    <input class="input" id="vidurl" type="url" placeholder="https://www.youtube.com/watch?v=…" aria-label="Lien de la vidéo">
    <button class="btn ghost" data-act="savevid">Enregistrer le lien</button>
  </section>
  <section class="card stack" id="donnees"><h2 class="title-m">Mes données</h2>
    <p class="small muted" style="margin:0">Tes séances, pesées et pas sont enregistrés uniquement sur ce téléphone. Si tu supprimes l'appli ou changes de téléphone, seule une sauvegarde permet de les retrouver.</p>
    <p class="small" style="margin:0;font-weight:600">${texteDerniereSauvegarde()}</p>
    ${nbPhotos()?`<label class="row small" style="gap:8px;font-weight:600"><input type="checkbox" id="bk-photos" checked> Inclure mes photos (${nbPhotos()} photo${nbPhotos()>1?'s':''})</label>`:''}
    <button class="btn primary block" data-act="backup">${I.save} Sauvegarder mes données</button>
    <button class="btn ghost block" data-act="openimport">Importer une sauvegarde</button>
    <p class="small muted" style="margin:0">La sauvegarde crée un fichier : choisis « Enregistrer dans Fichiers », puis iCloud Drive pour le garder en lieu sûr. Sporty te le rappelle si ta dernière sauvegarde date de plus de ${RAPPEL_JOURS} jours.</p>
  </section>
  <section class="card stack" id="apropos"><h2 class="title-m">À propos</h2>
    <p class="small muted" style="margin:0">Illustrations : free-exercise-db (domaine public).<br>Polices : Barlow et Barlow Condensed (licence SIL OFL).</p>
  </section>`;
}

/* ---------- Five ---------- */
let fiveMin=60;
function fiveModal(){
  const st=weekStatus();
  openModal(`<div class="sheet-head"><div><div class="eyebrow">Vendredi</div><h2 class="title-l">Noter le Five</h2></div><button class="x" data-act="close" aria-label="Fermer">${I.x}</button></div>
    ${st.five?'<p class="hint">Un Five est déjà noté cette semaine. Tu peux en ajouter un autre.</p>':''}
    <div class="stack" style="gap:6px"><span class="small" style="font-weight:700">Durée</span>
      <div class="seg" role="radiogroup" aria-label="Durée du Five">${[60,75,90].map(m=>`<button role="radio" aria-checked="${m===60}" class="${m===60?'on':''}" data-act="fivemin" data-v="${m}">${m===60?'1 h':m===75?'1 h 15':'1 h 30'}</button>`).join('')}</div></div>
    <label class="stack" style="gap:6px"><span class="small" style="font-weight:700">Date</span><input class="input" id="fivedate" type="date" value="${dkey()}" max="${dkey()}"></label>
    <label class="stack" style="gap:6px"><span class="small" style="font-weight:700">Note (facultatif)</span><input class="input" id="fivenote" placeholder="Ex. : bonne forme, 3 buts"></label>
    <button class="btn primary block" data-act="savefive">Enregistrer</button>`);
  fiveMin=60;
}

