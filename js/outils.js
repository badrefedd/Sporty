'use strict';
/* ---------- Icons ---------- */
const I = {
  paste:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="8" y="3" width="8" height="4" rx="1"/><path d="M8 5H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/></svg>',
  edit:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16z"/></svg>',
  copy:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h9"/></svg>',
  share:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12M7 8l5-5 5 5M5 14v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5"/></svg>',
  up:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 15 6-6 6 6"/></svg>',
  down:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>',
  eye:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',
  eyeoff:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 3l18 18M10.6 5.1A10.9 10.9 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4M6.6 6.6C3.8 8.4 2 12 2 12s3.5 7 10 7c1.7 0 3.2-.5 4.5-1.2M9.9 9.9a3 3 0 0 0 4.2 4.2"/></svg>',
  save:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12M7 10l5 5 5-5M5 21h14"/></svg>',
  check:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  play:'<svg viewBox="0 0 10 10"><path d="M2.5 1.5v7l6-3.5z" fill="currentColor"/></svg>',
  x:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  trash:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>',
  sun:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/></svg>',
  moon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg>',
  auto:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3.2 2"/></svg>',
  ext:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>',
  plus:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  swap:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8h13l-3-3M20 16H7l3 3"/></svg>',
  search:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.2-4.2"/></svg>',
  cal:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="15" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4M8 14h2M12 14h2M16 14h0M8 17h2M12 17h2"/></svg>',
  left:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>',
  right:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>',
  stop:'<svg viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="2.5" fill="currentColor"/></svg>',
  tab_semaine:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="15" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg>',
  tab_seance:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6.5 7v10M17.5 7v10M3.5 9.5v5M20.5 9.5v5M6.5 12h11"/></svg>',
  tab_exos:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5.5h16M4 12h16M4 18.5h10"/><circle cx="19" cy="18.5" r="1.4" fill="currentColor"/></svg>',
  tab_historique:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19V5M4 19h16M8 15l3.5-4 3 2.5L20 7"/></svg>',
  tab_poids:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="3.5" width="17" height="17" rx="4"/><path d="M8.5 9a5 5 0 0 1 7 0l-2.3 2.6"/></svg>',
  tab_reglages:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2.2"/><circle cx="10" cy="17" r="2.2"/></svg>'
};
const TAB_LABEL={semaine:'Semaine',seance:'Séance',exos:'Exos',historique:'Progrès',poids:'Poids',reglages:'Réglages'};

/* ---------- Helpers ---------- */
const $=(s,el=document)=>el.querySelector(s);
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pad=n=>String(n).padStart(2,'0');
const dkey=(d=new Date())=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const pkey=k=>{const [y,m,d]=k.split('-').map(Number);return new Date(y,m-1,d);};
const fmt=n=>{if(n==null||isNaN(n))return '–';return String(Math.round(n*100)/100).replace('.',',');};
const fmt1=n=>(Math.round(n*10)/10).toFixed(1).replace('.',',');
const fmtInt=n=>Math.round(n).toLocaleString('fr-FR');
const num=s=>{if(s==null||s==='')return NaN;return parseFloat(String(s).replace(',','.').trim());};
const clone=o=>JSON.parse(JSON.stringify(o));
const fmtDate=k=>{const d=pkey(k);return `${DAYS_LONG[(d.getDay()+6)%7]} ${d.getDate()} ${MONTHS[d.getMonth()]}`;};
const weekStart=(d=new Date())=>{const x=new Date(d.getFullYear(),d.getMonth(),d.getDate());x.setDate(x.getDate()-((x.getDay()+6)%7));return x;};
const addDays=(d,n)=>{const x=new Date(d);x.setDate(x.getDate()+n);return x;};
const timeout=(p,ms)=>Promise.race([p,new Promise((_,rej)=>setTimeout(()=>rej(new Error('timeout')),ms))]);
const uid=()=>'s'+Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const norm=s=>String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');

/* ---------- Theme ---------- */
const isNight=()=>{const h=new Date().getHours();return h>=19||h<7;};
function applyTheme(){
  const t=S.settings.theme||'auto';
  const dark=t==='dark'||(t==='auto'&&isNight());
  document.documentElement.classList.toggle('dark',dark);
  const m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute('content',dark?'#0C1020':'#F3F4F8');
  const b=$('#themeBtn');
  if(b){b.innerHTML=(t==='auto'?I.auto:t==='dark'?I.moon:I.sun)+`<span>${t==='auto'?'Auto':t==='dark'?'Sombre':'Clair'}</span>`;b.setAttribute('aria-label','Thème : '+(t==='auto'?'automatique selon l\'heure':t==='dark'?'sombre':'clair')+'. Toucher pour changer.');}
}
setInterval(applyTheme,60000);

/* ---------- Toast & modal ---------- */
let toastT=null;
function toast(msg){const t=$('#toast');t.textContent=msg;t.hidden=false;clearTimeout(toastT);toastT=setTimeout(()=>{t.hidden=true;},2800);}
function openModal(html){const m=$('#modal');$('#sheet').innerHTML=html;m.hidden=false;$('#sheet').scrollTop=0;const f=$('#sheet [data-autofocus]');if(f)setTimeout(()=>f.focus(),50);}
function closeModal(){$('#modal').hidden=true;$('#sheet').innerHTML='';}
let confirmCb=null;
function confirmBox(title,text,okLabel,onOk,danger){
  confirmCb=onOk;
  openModal(`<div class="sheet-head"><h2 class="title-l">${esc(title)}</h2></div><p class="muted" style="margin:0">${esc(text)}</p>
  <div class="row"><button class="btn ghost" data-act="close" style="flex:1">Retour</button><button class="btn ${danger?'danger':'primary'}" data-act="confirmok" style="flex:1${danger?';background:var(--danger);color:#fff;border:0':''}">${esc(okLabel)}</button></div>`);
}

/* ---------- Audio ---------- */
let actx=null;
function unlockAudio(){try{if(!actx){const C=window.AudioContext||window.webkitAudioContext;if(C)actx=new C();}if(actx&&actx.state==='suspended')actx.resume();}catch(e){}}
function beep(){
  try{if(actx){const t0=actx.currentTime;[0,.28,.56].forEach((t,i)=>{const o=actx.createOscillator(),g=actx.createGain();o.type='sine';o.frequency.value=i===2?1320:880;g.gain.setValueAtTime(.0001,t0+t);g.gain.exponentialRampToValueAtTime(.35,t0+t+.02);g.gain.exponentialRampToValueAtTime(.0001,t0+t+.2);o.connect(g);g.connect(actx.destination);o.start(t0+t);o.stop(t0+t+.22);});}}catch(e){}
  try{if(navigator.vibrate)navigator.vibrate([200,100,200]);}catch(e){}
}

/* ---------- Rest timer ---------- */
const Timer={end:0,dur:0,iv:null,label:'',over:false,
  start(sec,label){this.dur=sec;this.end=Date.now()+sec*1000;this.label=label||'Repos';this.over=false;clearInterval(this.iv);this.iv=setInterval(()=>this.tick(),250);this.tick();},
  add(s){if(this.over){this.start(s,this.label);return;}this.end+=s*1000;this.dur+=s;this.tick();},
  stop(){clearInterval(this.iv);this.iv=null;$('#timer').hidden=true;document.body.classList.remove('timer-on');},
  tick(){
    const el=$('#timer');el.hidden=false;document.body.classList.add('timer-on');
    const left=Math.ceil((this.end-Date.now())/1000);
    if(left<=0&&!this.over){this.over=true;beep();setTimeout(()=>{if(this.over)this.stop();},8000);}
    el.classList.toggle('over',this.over);
    $('#timerT').textContent=this.over?'Go !':`${Math.floor(left/60)}:${pad(left%60)}`;
    $('#timerL').innerHTML=this.over?'Série suivante':`Repos<br>${esc(this.label)}`;
    $('#timerBar').style.width=this.over?'0':`${Math.max(0,Math.min(100,(left/this.dur)*100))}%`;
  }
};

