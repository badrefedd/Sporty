'use strict';
/* ---------- Stick-figure animations ---------- */
const FIG={
  presse:{period:2600,props:'<line class="floor" x1="20" y1="136" x2="185" y2="136"/><line class="prop" x1="92" y1="96" x2="166" y2="22"/><line class="prop" x1="30" y1="70" x2="56" y2="114"/><line class="prop" x1="54" y1="117" x2="86" y2="117"/><line class="prop thin" x1="70" y1="120" x2="70" y2="136"/><line class="prop thin" x1="120" y1="68" x2="120" y2="136"/>',
    a:{h:[40,63],n:[46,76],p:[70,108],k:[80,72],f:[116,70],e:[58,94],w:[72,104]},
    b:{h:[40,63],n:[46,76],p:[70,108],k:[99,83],f:[128,58],e:[58,94],w:[72,104]},load:'plat45'},
  dc:{period:2400,props:'<line class="floor" x1="20" y1="136" x2="185" y2="136"/><line class="prop" x1="38" y1="102" x2="150" y2="102"/><line class="prop thin" x1="55" y1="106" x2="55" y2="136"/><line class="prop thin" x1="135" y1="106" x2="135" y2="136"/>',
    a:{h:[46,88],n:[60,95],p:[118,95],k:[146,96],f:[150,134],e:[74,110],w:[72,86]},
    b:{h:[46,88],n:[60,95],p:[118,95],k:[146,96],f:[150,134],e:[63,73],w:[64,52]},load:'plate'},
  tirage:{period:2600,props:'<line class="floor" x1="20" y1="136" x2="185" y2="136"/><line class="prop" x1="86" y1="105" x2="124" y2="105"/><line class="prop thin" x1="106" y1="108" x2="106" y2="136"/><line class="prop thin" x1="160" y1="4" x2="160" y2="136"/><line class="prop thin" x1="104" y1="6" x2="160" y2="6"/><circle class="prop thin" cx="130" cy="92" r="5"/><circle class="pulley" cx="104" cy="8" r="3.5"/>',
    a:{h:[95,46],n:[96,60],p:[100,99],k:[130,99],f:[132,134],e:[99,36],w:[101,15]},
    b:{h:[94,46],n:[95,60],p:[100,99],k:[130,99],f:[132,134],e:[91,84],w:[100,64]},load:'bar',cable:[104,8]},
  legcurl:{period:2400,props:'<line class="floor" x1="20" y1="136" x2="185" y2="136"/><line class="prop" x1="34" y1="99" x2="150" y2="99"/><line class="prop thin" x1="50" y1="103" x2="50" y2="136"/><line class="prop thin" x1="132" y1="103" x2="132" y2="136"/>',
    a:{h:[40,83],n:[54,90],p:[108,91],k:[140,91],f:[176,93],e:[48,106],w:[36,108]},
    b:{h:[40,83],n:[54,90],p:[108,91],k:[140,91],f:[152,57],e:[48,106],w:[36,108]},load:'pad'},
  lat:{period:2600,front:true,props:'<line class="floor" x1="40" y1="136" x2="160" y2="136"/>',
    a:{h:[100,26],n:[100,41],p:[100,88],k:[93,111],f:[91,135],k2:[107,111],f2:[109,135],e:[90,64],w:[88,86],e2:[110,64],w2:[112,86]},
    b:{h:[100,26],n:[100,41],p:[100,88],k:[93,111],f:[91,135],k2:[107,111],f2:[109,135],e:[78,44],w:[57,46],e2:[122,44],w2:[143,46]},load:'dbfront'},
  dci:{period:2400,props:'<line class="floor" x1="20" y1="136" x2="185" y2="136"/><line class="prop" x1="50" y1="68" x2="110" y2="102"/><line class="prop" x1="110" y1="103" x2="140" y2="103"/><line class="prop thin" x1="120" y1="107" x2="120" y2="136"/>',
    a:{h:[56,60],n:[66,71],p:[116,96],k:[144,96],f:[150,134],e:[80,90],w:[77,67]},
    b:{h:[56,60],n:[66,71],p:[116,96],k:[144,96],f:[150,134],e:[68,49],w:[70,27]},load:'dbside'},
  row:{period:2600,props:'<line class="floor" x1="20" y1="136" x2="185" y2="136"/><line class="prop" x1="48" y1="115" x2="94" y2="115"/><line class="prop thin" x1="70" y1="118" x2="70" y2="136"/><line class="prop" x1="128" y1="94" x2="128" y2="124"/><line class="prop thin" x1="176" y1="60" x2="176" y2="136"/><circle class="pulley" cx="176" cy="94" r="3.5"/>',
    a:{h:[70,56],n:[71,70],p:[72,109],k:[100,90],f:[124,108],e:[93,80],w:[115,86]},
    b:{h:[68,56],n:[70,70],p:[72,109],k:[100,90],f:[124,108],e:[52,88],w:[74,92]},load:'handle',cable:[176,94]},
  hip:{period:2400,props:'<line class="floor" x1="10" y1="136" x2="185" y2="136"/><line class="prop" x1="18" y1="89" x2="58" y2="89"/><line class="prop thin" x1="28" y1="93" x2="28" y2="136"/><line class="prop thin" x1="50" y1="93" x2="50" y2="136"/>',
    a:{h:[46,78],n:[56,84],p:[84,112],k:[114,96],f:[126,134],e:[68,104],w:[80,104]},
    b:{h:[46,78],n:[56,84],p:[92,86],k:[122,96],f:[126,134],e:[72,94],w:[88,78]},load:'hipbar'},
  legext:{period:2400,props:'<line class="floor" x1="20" y1="136" x2="185" y2="136"/><line class="prop" x1="62" y1="105" x2="112" y2="105"/><line class="prop" x1="58" y1="102" x2="56" y2="56"/><line class="prop thin" x1="90" y1="109" x2="90" y2="136"/>',
    a:{h:[73,46],n:[74,60],p:[78,99],k:[112,99],f:[114,134],e:[80,80],w:[92,97]},
    b:{h:[73,46],n:[74,60],p:[78,99],k:[112,99],f:[148,95],e:[80,80],w:[92,97]},load:'pad'},
  curl:{period:2200,props:'<line class="floor" x1="50" y1="136" x2="150" y2="136"/>',
    a:{h:[100,24],n:[100,38],p:[100,86],k:[102,110],f:[100,135],k2:[98,110],f2:[94,135],e:[103,62],w:[105,85]},
    b:{h:[100,24],n:[100,38],p:[100,86],k:[102,110],f:[100,135],k2:[98,110],f2:[94,135],e:[103,62],w:[92,43]},load:'dbside'},
  tri:{period:2200,props:'<line class="floor" x1="50" y1="136" x2="170" y2="136"/><line class="prop thin" x1="150" y1="2" x2="150" y2="136"/><line class="prop thin" x1="138" y1="6" x2="150" y2="6"/><circle class="pulley" cx="138" cy="8" r="3.5"/>',
    a:{h:[101,26],n:[98,40],p:[94,86],k:[98,110],f:[96,135],k2:[92,110],f2:[88,135],e:[104,64],w:[122,53]},
    b:{h:[101,26],n:[98,40],p:[94,86],k:[98,110],f:[96,135],k2:[92,110],f2:[88,135],e:[104,64],w:[108,86]},load:'handle',cable:[138,8]},
  tapis:{period:1100,props:'<line class="prop" x1="28" y1="130" x2="172" y2="110"/><line class="floor" x1="20" y1="136" x2="185" y2="136"/><line class="prop thin" x1="34" y1="131" x2="34" y2="136"/><line class="prop thin" x1="166" y1="113" x2="166" y2="136"/><line class="prop thin" x1="160" y1="112" x2="156" y2="58"/><line class="prop" x1="146" y1="54" x2="166" y2="58"/>',
    a:{h:[102,24],n:[100,38],p:[98,80],k:[110,100],f:[120,116],k2:[92,102],f2:[84,122],e:[93,60],w:[99,78],e2:[107,58],w2:[115,72]},
    b:{h:[102,24],n:[100,38],p:[98,80],k:[92,102],f:[84,122],k2:[110,100],f2:[120,116],e:[107,58],w:[115,72],e2:[93,60],w2:[99,78]},load:null}
};
const lerp=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];
function poseAt(id,t){const f=FIG[id],o={};for(const k in f.a)o[k]=lerp(f.a[k],f.b[k],t);return o;}
function drawLoad(f,P){
  const w=P.w,L=f.load;let s='';
  if(f.cable&&w)s+=`<line class="cable" x1="${w[0]}" y1="${w[1]}" x2="${f.cable[0]}" y2="${f.cable[1]}"/>`;
  if(L==='plate')s+=`<line class="loadline" x1="${w[0]-22}" y1="${w[1]}" x2="${w[0]+22}" y2="${w[1]}" style="opacity:.5"/><circle class="load" cx="${w[0]}" cy="${w[1]}" r="9"/>`;
  else if(L==='bar')s+=`<line class="loadline" x1="${w[0]-28}" y1="${w[1]}" x2="${w[0]+28}" y2="${w[1]}"/>`;
  else if(L==='dbside')s+=`<circle class="load" cx="${w[0]}" cy="${w[1]}" r="6"/>`;
  else if(L==='dbfront'){[P.w,P.w2].forEach(q=>{s+=`<line class="loadline" x1="${q[0]}" y1="${q[1]-7}" x2="${q[0]}" y2="${q[1]+7}"/>`;});}
  else if(L==='handle')s+=`<line class="loadline" x1="${w[0]}" y1="${w[1]-7}" x2="${w[0]}" y2="${w[1]+7}"/>`;
  else if(L==='pad')s+=`<circle class="load" cx="${P.f[0]}" cy="${P.f[1]}" r="6"/>`;
  else if(L==='plat45')s+=`<line class="loadline" x1="${P.f[0]-12}" y1="${P.f[1]-12}" x2="${P.f[0]+12}" y2="${P.f[1]+12}" style="stroke-width:6"/>`;
  else if(L==='hipbar')s+=`<circle class="load" cx="${P.p[0]+2}" cy="${P.p[1]-11}" r="10"/>`;
  return s;
}
const pl=(...pts)=>pts.map(p=>p.join(',')).join(' ');
function bodySVG(id,P){
  const f=FIG[id];let s='';
  const back=f.front?'':' back';
  if(P.k2)s+=`<polyline class="limb${back}" points="${pl(P.p,P.k2,P.f2)}"/>`;
  if(P.e2)s+=`<polyline class="limb${back}" points="${pl(P.n,P.e2,P.w2)}"/>`;
  s+=`<polyline class="limb" points="${pl(P.h,P.n,P.p)}"/>`;
  s+=`<polyline class="limb" points="${pl(P.p,P.k,P.f)}"/>`;
  s+=`<polyline class="limb" points="${pl(P.n,P.e,P.w)}"/>`;
  s+=`<circle class="head" cx="${P.h[0]}" cy="${P.h[1]}" r="8.5"/>`;
  return drawLoad(f,P)+s;
}
function figSVG(id,label){
  return `<svg class="fig" viewBox="0 0 200 145" data-fig="${id}" role="img" aria-label="${esc(label||('Mouvement : '+EX[id].name))}">${FIG[id].props}<g class="fb">${bodySVG(id,poseAt(id,0))}</g></svg>`;
}
/* Muscle map for every other exercise: front figure with the worked zone highlighted */
function mmapSVG(group,label,small){
  const P=FIG.lat.a;
  const L=(a,b,dash)=>`<line class="hl${dash?' dash':''}" x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}"/>`;
  const arms=(fromN,dash)=>fromN?L(P.n,P.e,dash)+L(P.n,P.e2,dash):L(P.e,P.w,dash)+L(P.e2,P.w2,dash);
  const thighs=dash=>L(P.p,P.k,dash)+L(P.p,P.k2,dash);
  let h='';
  switch(group){
    case 'pecs':h=L([93,50],[107,50]);break;
    case 'dos':h=L([100,47],[100,74],true)+L([94,52],[106,52],true);break;
    case 'epaules':h=`<circle class="hlf" cx="94.5" cy="49" r="5.5"/><circle class="hlf" cx="105.5" cy="49" r="5.5"/>`;break;
    case 'biceps':h=arms(true);break;
    case 'triceps':h=arms(true,true);break;
    case 'avbras':h=arms(false);break;
    case 'quadri':h=thighs();break;
    case 'ischios':h=thighs(true);break;
    case 'fessiers':h=`<circle class="hlf" cx="100" cy="89" r="7"/>`;break;
    case 'adducteurs':h=L([100,91],[97,104])+L([100,91],[103,104]);break;
    case 'mollets':h=L(P.k,P.f)+L(P.k2,P.f2);break;
    case 'abdos':h=L([100,62],[100,84]);break;
    case 'lombaires':h=L([100,66],[100,86],true);break;
    case 'cardio':h=`<path class="hlf" d="M100 64c-6-5-12-9-12-15a6 6 0 0 1 12-2a6 6 0 0 1 12 2c0 6-6 10-12 15z"/>`;break;
    default:h=`<g style="opacity:.6">${thighs()}${arms(true)}${L(P.n,P.p)}</g>`;
  }
  const body=`<polyline class="body" points="${pl(P.h,P.n,P.p)}"/><polyline class="body" points="${pl(P.p,P.k,P.f)}"/><polyline class="body" points="${pl(P.p,P.k2,P.f2)}"/><polyline class="body" points="${pl(P.n,P.e,P.w)}"/><polyline class="body" points="${pl(P.n,P.e2,P.w2)}"/><circle class="bodyhead" cx="${P.h[0]}" cy="${P.h[1]}" r="8.5"/>`;
  return `<svg class="mmap" viewBox="${small?'64 14 72 126':'40 12 120 128'}" role="img" aria-label="${esc(label||('Muscles travaillés : '+(GROUPS[group]||'')))}">${body}${h}</svg>`;
}
function visualFor(id,label){const e=EX[id];return FIG[id]?figSVG(id,label):mmapSVG(e.group,label);}
const reduceMotion=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function animate(now){
  if(!reduceMotion){
    document.querySelectorAll('svg.fig').forEach(svg=>{
      const id=svg.dataset.fig,f=FIG[id];if(!f)return;
      const ph=(now%f.period)/f.period;const t=(1-Math.cos(ph*Math.PI*2))/2;
      const g=svg.querySelector('.fb');if(g)g.innerHTML=bodySVG(id,poseAt(id,t));
    });
  }
  requestAnimationFrame(animate);
}

