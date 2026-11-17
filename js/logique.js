'use strict';
/* ---------- Domain logic ---------- */
const videoUrl=id=>(S.settings.videos&&S.settings.videos[id])||YT(EX[id].q);
function fieldsFor(id){
  const e=EX[id]||{mode:'kg'};
  if(e.mode==='bw')return [{k:'w',label:'lest kg',im:'decimal'},{k:'r',label:'rép.',im:'numeric',main:true}];
  if(e.mode==='time')return [{k:'r',label:'min',im:'decimal',main:true},{k:'w',label:e.lvl||'niveau',im:'decimal'}];
  if(e.mode==='hold')return [{k:'r',label:'sec',im:'numeric',main:true},{k:'w',label:'kg',im:'decimal'}];
  return [{k:'w',label:'kg',im:'decimal'},{k:'r',label:'rép.',im:'numeric',main:true}];
}
/* Prescription effective : en séance, une alternative garde séries, repos et fourchette
   de l'exercice qu'elle remplace (S.draft.rx). */
function rx(id){return Object.assign({},EX[id],(S.draft&&S.draft.rx&&S.draft.rx[id])||{});}
const remplaceDe=id=>S.draft&&S.draft.from?S.draft.from[id]||null:null;
/* « Chest press (à la place de Développé couché) » */
function exLabel(id,ses){
  const n=EX[id]?EX[id].name:id,o=ses&&ses.remplace&&ses.remplace[id];
  return o?`${n} (à la place de ${EX[o]?EX[o].name:o})`:n;
}
function presc(id){
  const e=rx(id);const rng=e.min===e.max?e.min:e.min+'-'+e.max;
  if(e.mode==='time')return `${rng} min`;
  if(e.mode==='hold')return `${e.sets} × ${rng} s`;
  return `${e.sets} × ${rng}`;
}
function restLabel(sec){return !sec?'':sec>=120?'2 min':sec===90?'1 min 30':'1 min';}
function sortedSessions(){return S.sessions.slice().sort((a,b)=>(b.ts||0)-(a.ts||0));}
function lastFor(id){return sortedSessions().find(s=>s.ex&&s.ex[id]&&s.ex[id].length)||null;}
function maxEver(id){let m=0;S.sessions.forEach(s=>{if(!s.ex||!s.ex[id])return;s.ex[id].forEach(x=>{if(x.w>m)m=x.w;});});return m;}
function setsStr(id,sets){
  if(!sets||!sets.length)return '';
  const e=EX[id]||{mode:'kg'};
  if(e.mode==='time')return sets.map(x=>`${fmt(x.r)} min${x.w?` (${e.lvl?fmt(x.w)+' %':'niv. '+fmt(x.w)})`:''}`).join(' · ');
  if(e.mode==='hold')return sets.map(x=>`${fmt(x.r)} s${x.w?` à ${fmt(x.w)} kg`:''}`).join(' · ');
  if(e.mode==='bw'){const lest=sets.some(x=>x.w>0);return lest?sets.map(x=>`${x.w?'+'+fmt(x.w)+' kg ':''}×${x.r}`).join(' · '):`${sets.map(x=>x.r).join(' · ')} rép.`;}
  const same=sets.every(x=>x.w===sets[0].w);
  return same?`${fmt(sets[0].w)} kg × ${sets.map(x=>x.r).join(' · ')}`:sets.map(x=>`${fmt(x.w)}×${x.r}`).join(' · ');
}
function suggest(id){
  const e=rx(id),last=lastFor(id);
  if(!last){
    if(remplaceDe(id)&&e.mode==='kg')return{w:null,reps:[],up:false,last:null,txt:'Première fois : commence léger, vise le haut de la fourchette.'};
    if(e.mode==='kg')return{w:null,reps:[],up:false,last:null,txt:`Première fois : choisis une charge avec laquelle tu fais ${e.max} répétitions en gardant 1 ou 2 en réserve.`};
    if(e.mode==='bw')return{w:0,reps:[],up:false,last:null,txt:'Première fois : fais le maximum de répétitions propres, sans aller à l\'échec.'};
    if(e.mode==='time')return{w:id==='tapis'?11:null,reps:[],up:false,last:null,txt:id==='tapis'?'20 min à 10-12 % d\'inclinaison, 4,5 à 5,5 km/h.':'Note la durée et le niveau de la machine.'};
    return{w:0,reps:[],up:false,last:null,txt:'Première fois : tiens le plus longtemps possible en gardant une bonne position.'};
  }
  const sets=last.ex[id],w=Math.max(...sets.map(x=>x.w||0));
  if(e.mode==='kg'){
    const top=sets.length>=e.sets&&sets.every(x=>x.r>=e.max);
    if(top){const nw=Math.round((w+e.inc)*100)/100;return{w:nw,reps:[],up:true,last,txt:`Objectif atteint la dernière fois : monte à ${fmt(nw)} kg${e.perHand?' par haltère':''}.`};}
    return{w,reps:sets.map(x=>x.r),up:false,last,txt:'Même charge, essaie de faire 1 répétition de plus sur une série.'};
  }
  if(e.mode==='bw'){
    const top=sets.length>=e.sets&&sets.every(x=>x.r>=e.max);
    return{w,reps:sets.map(x=>x.r),up:top,last,txt:top?'Objectif atteint : ajoute un peu de lest ou 1 à 2 répétitions.':'Essaie de faire 1 répétition de plus sur une série.'};
  }
  return{w:sets[0].w||0,reps:sets.map(x=>x.r),up:false,last,txt:'Fais au moins autant que la dernière fois.'};
}
function initSets(id){
  const e=rx(id),sg=suggest(id);
  return Array.from({length:e.sets},(_,i)=>{
    let w=sg.w==null?'':fmt(sg.w),r;
    if(e.mode==='kg'||e.mode==='bw')r=String(sg.up&&e.mode==='kg'?e.min:(sg.reps[i]!=null?sg.reps[i]:e.min));
    else r=String(sg.reps[i]!=null?sg.reps[i]:sg.reps[0]!=null?sg.reps[0]:e.min);
    if((e.mode==='time'||e.mode==='hold'||e.mode==='bw')&&(sg.w===0))w='';
    return {w,r,done:false};
  });
}
function inWeek(k,ws){const d=pkey(k);return d>=ws&&d<addDays(ws,7);}
function weekStatus(ws=weekStart()){
  const st={A:false,B:false,five:false};
  S.sessions.forEach(s=>{if(s.date&&inWeek(s.date,ws)&&st.hasOwnProperty(s.type))st[s.type]=true;});
  return st;
}
function sortedWeights(){return S.weights.slice().sort((a,b)=>a.date<b.date?-1:1);}
function avgBetween(fromD,toD){const xs=S.weights.filter(w=>{const d=pkey(w.date);return d>=fromD&&d<=toD;}).map(w=>w.kg);return xs.length?xs.reduce((a,b)=>a+b,0)/xs.length:null;}
function rolling(){const ws=sortedWeights();return ws.map(w=>{const d=pkey(w.date),from=addDays(d,-6);const xs=ws.filter(x=>{const dx=pkey(x.date);return dx>=from&&dx<=d;}).map(x=>x.kg);return{date:w.date,kg:xs.reduce((a,b)=>a+b,0)/xs.length};});}
const dayData=k=>S.days.find(d=>d.date===k)||null;
function tapisMin(s){let m=0;if(s.tapis&&s.tapis.min)m+=s.tapis.min;if(s.ex&&s.ex.tapis)s.ex.tapis.forEach(x=>m+=x.r||0);return m;}
/* Exercices masqués de la banque. */
const isHidden=id=>(S.settings.hidden||[]).includes(id);
function setHidden(id,on){
  const h=new Set(S.settings.hidden||[]);on?h.add(id):h.delete(id);
  S.settings.hidden=[...h];Store.saveSettings();
}
function alts(id){return ((S.settings.alts||{})[id]||[]).filter(a=>EX[a]);}
function addAlt(a,b){
  if(a===b)return;
  S.settings.alts=Object.assign({},S.settings.alts);
  [[a,b],[b,a]].forEach(([x,y])=>{const l=(S.settings.alts[x]||[]).slice();if(!l.includes(y))l.push(y);S.settings.alts[x]=l;});
  Store.saveSettings();
}
function removeAlt(a,b){
  S.settings.alts=Object.assign({},S.settings.alts);
  [[a,b],[b,a]].forEach(([x,y])=>{S.settings.alts[x]=(S.settings.alts[x]||[]).filter(z=>z!==y);});
  Store.saveSettings();
}

/* ---------- Charts ---------- */
function niceTicks(min,max,n=4){const span=max-min||1,raw=span/n,mag=Math.pow(10,Math.floor(Math.log10(raw))),st=[1,2,2.5,5,10].map(m=>m*mag).find(x=>x>=raw)||raw;const lo=Math.floor(min/st)*st,hi=Math.ceil(max/st)*st,out=[];for(let v=lo;v<=hi+st/2;v+=st)out.push(Math.round(v*100)/100);return out;}
function lineChart({series,goal,label}){
  const W=340,H=190,L=38,R=12,T=12,B=26;
  const all=series.flatMap(s=>s.pts);
  if(all.length<2)return '';
  const xs=all.map(p=>p.x),ys=all.map(p=>p.y);
  let x0=Math.min(...xs),x1=Math.max(...xs);if(x0===x1){x0-=864e5;x1+=864e5;}
  let ymin=Math.min(...ys),ymax=Math.max(...ys);
  if(goal!=null&&goal>=ymin-3&&goal<=ymax+3){ymin=Math.min(ymin,goal);ymax=Math.max(ymax,goal);}
  const padY=Math.max((ymax-ymin)*.12,.5);ymin-=padY;ymax+=padY;
  const ticks=niceTicks(ymin,ymax,4);const y0=ticks[0],y1=ticks[ticks.length-1];
  const X=x=>L+(x-x0)/(x1-x0)*(W-L-R),Y=y=>T+(1-(y-y0)/(y1-y0))*(H-T-B);
  let s=`<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(label)}">`;
  ticks.forEach(t=>{s+=`<line class="grid" x1="${L}" x2="${W-R}" y1="${Y(t)}" y2="${Y(t)}"/><text x="${L-6}" y="${Y(t)+4}" text-anchor="end">${fmt(t)}</text>`;});
  const nX=Math.min(4,new Set(xs).size);for(let i=0;i<nX;i++){const xv=x0+(x1-x0)*(nX===1?0:i/(nX-1));const d=new Date(xv);s+=`<text x="${X(xv)}" y="${H-6}" text-anchor="${i===0?'start':i===nX-1?'end':'middle'}">${d.getDate()} ${MONTHS[d.getMonth()]}</text>`;}
  if(goal!=null&&goal>=y0&&goal<=y1)s+=`<line class="goal" x1="${L}" x2="${W-R}" y1="${Y(goal)}" y2="${Y(goal)}"/><text x="${W-R}" y="${Y(goal)-5}" text-anchor="end" style="fill:var(--accent-2);font-weight:700">Objectif ${fmt(goal)}</text>`;
  series.forEach(se=>{
    const p=se.pts.slice().sort((a,b)=>a.x-b.x);if(!p.length)return;
    const d=p.map((q,i)=>(i?'L':'M')+X(q.x).toFixed(1)+','+Y(q.y).toFixed(1)).join('');
    if(se.area&&p.length>1)s+=`<path class="area" d="${d}L${X(p[p.length-1].x).toFixed(1)},${H-B}L${X(p[0].x).toFixed(1)},${H-B}Z"/>`;
    if(p.length>1)s+=`<path class="${se.cls}" d="${d}"/>`;
    if(se.dots)p.forEach(q=>{s+=`<circle class="pt" cx="${X(q.x)}" cy="${Y(q.y)}" r="3.2"/>`;});
    if(se.end){const q=p[p.length-1];s+=`<circle class="end" cx="${X(q.x)}" cy="${Y(q.y)}" r="5"/>`;}
  });
  return s+'</svg>';
}

