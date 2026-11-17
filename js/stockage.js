'use strict';
/* =====================================================================
   État de l'appli + stockage.

   Toute l'appli passe par l'objet « Store » (saveSession, saveWeight…).
   Store délègue le vrai travail à un « moteur » :
     - aujourd'hui : MoteurIDB (IndexedDB, sur le téléphone),
       avec MoteurLS (localStorage) en secours si IndexedDB est indisponible ;
     - plus tard, si besoin : un moteur Supabase avec les mêmes méthodes
       (charger, put, suppr, remplacer). Rien d'autre à changer dans l'appli.
   ===================================================================== */

/* ---------- État ---------- */
const S={settings:{theme:'auto',plan:'1',goal:72,videos:{},alts:{},custom:[]},sessions:[],weights:[],days:[],draft:null,meta:{},modeles:[],plans:[],exceptions:[],photos:{},route:'semaine',histEx:null,openHist:null,bankQ:'',bankG:'all',cal:null,semVue:'semaine'};

/* Collections : nom → champ servant de clé. */
const COLLECTIONS={sessions:'id',weights:'date',days:'date'};

/* ---------- Moteur IndexedDB ---------- */
const MoteurIDB={
  nom:'IndexedDB',db:null,
  ouvrir(){
    return new Promise((ok,ko)=>{
      if(!window.indexedDB)return ko(new Error('IndexedDB absent'));
      const r=indexedDB.open('sporty',2);
      r.onupgradeneeded=()=>{
        const db=r.result;
        for(const [n,k] of Object.entries(COLLECTIONS))if(!db.objectStoreNames.contains(n))db.createObjectStore(n,{keyPath:k});
        if(!db.objectStoreNames.contains('kv'))db.createObjectStore('kv');
        /* v2 : mes photos d'exercices, une entrée par exercice { id, imgs:[data URL…] } */
        if(!db.objectStoreNames.contains('photos'))db.createObjectStore('photos',{keyPath:'id'});
      };
      r.onsuccess=()=>{this.db=r.result;ok();};
      r.onerror=()=>ko(r.error);
      r.onblocked=()=>ko(new Error('IndexedDB bloqué'));
    });
  },
  tx(stores,mode,fn){
    return new Promise((ok,ko)=>{
      const t=this.db.transaction(stores,mode);let res;
      t.oncomplete=()=>ok(res);t.onerror=()=>ko(t.error);t.onabort=()=>ko(t.error||new Error('abort'));
      res=fn(t);
    });
  },
  async charger(){
    const out={};
    await this.tx(Object.keys(COLLECTIONS).concat('kv','photos'),'readonly',t=>{
      const rp=t.objectStore('photos').getAll();rp.onsuccess=()=>{out.photos={};rp.result.forEach(x=>{out.photos[x.id]=x.imgs;});};
      for(const n of Object.keys(COLLECTIONS)){const r=t.objectStore(n).getAll();r.onsuccess=()=>{out[n]=r.result;};}
      for(const k of ['settings','draft','meta','modeles','plans','exceptions']){const r=t.objectStore('kv').get(k);r.onsuccess=()=>{out[k]=r.result;};}
    });
    return out;
  },
  put(col,val){return this.tx([col],'readwrite',t=>{t.objectStore(col).put(val);});},
  suppr(col,key){return this.tx([col],'readwrite',t=>{t.objectStore(col).delete(key);});},
  putKv(k,val){return this.tx(['kv'],'readwrite',t=>{val==null?t.objectStore('kv').delete(k):t.objectStore('kv').put(val,k);});},
  /* Remplace tout le contenu d'un coup (import). Une seule transaction : tout ou rien. */
  putPhoto(id,imgs){return this.tx(['photos'],'readwrite',t=>{imgs&&imgs.length?t.objectStore('photos').put({id,imgs}):t.objectStore('photos').delete(id);});},
  remplacer(d){
    return this.tx(Object.keys(COLLECTIONS).concat('kv','photos'),'readwrite',t=>{
      if(d.photos){const ps=t.objectStore('photos');ps.clear();Object.entries(d.photos).forEach(([id,imgs])=>ps.put({id,imgs}));}
      for(const n of Object.keys(COLLECTIONS)){const s=t.objectStore(n);s.clear();(d[n]||[]).forEach(v=>s.put(v));}
      const kv=t.objectStore('kv');
      kv.put(d.settings,'settings');
      d.draft?kv.put(d.draft,'draft'):kv.delete('draft');
      kv.put(d.meta||{},'meta');
      kv.put(d.modeles||[],'modeles');
      kv.put(d.plans||[],'plans');
      kv.put(d.exceptions||[],'exceptions');
    });
  }
};

/* ---------- Moteur localStorage (secours) ---------- */
const MoteurLS={
  nom:'localStorage',
  async ouvrir(){localStorage.setItem('sporty:test','1');localStorage.removeItem('sporty:test');},
  async charger(){const raw=localStorage.getItem('sporty:data');const d=raw?JSON.parse(raw):{};try{d.photos=JSON.parse(localStorage.getItem('sporty:photos')||'{}');}catch(e){}return d;},
  async putPhoto(){localStorage.setItem('sporty:photos',JSON.stringify(S.photos||{}));},
  ecrire(){localStorage.setItem('sporty:data',JSON.stringify({settings:S.settings,sessions:S.sessions,weights:S.weights,days:S.days,draft:S.draft,meta:S.meta,modeles:S.modeles,plans:S.plans,exceptions:S.exceptions}));},
  async put(){this.ecrire();},async suppr(){this.ecrire();},async putKv(){this.ecrire();},
  async remplacer(d){this.ecrire();if(d&&d.photos)localStorage.setItem('sporty:photos',JSON.stringify(d.photos));}
};

/* ---------- Store : ce que le reste de l'appli utilise ---------- */
const Store={
  moteur:null,queues:{},
  async init(){
    for(const m of [MoteurIDB,MoteurLS]){
      try{await m.ouvrir();this.moteur=m;break;}catch(e){console.warn(m.nom,e);}
    }
    if(!this.moteur){toast('Stockage indisponible : tes données ne seront pas gardées.');return;}
    try{
      const d=await this.moteur.charger();
      this.appliquer(d);
      /* Première ouverture avec IndexedDB : on reprend d'éventuelles données de l'ancien stockage local. */
      if(this.moteur===MoteurIDB&&!d.settings){
        const raw=localStorage.getItem('sporty:data');
        if(raw){this.appliquer(JSON.parse(raw));await this.toutEnregistrer();}
      }
    }catch(e){console.warn(e);}
    /* Demande au navigateur de ne pas effacer les données s'il manque de place. */
    try{if(navigator.storage&&navigator.storage.persist)navigator.storage.persist();}catch(e){}
  },
  appliquer(d){
    if(d.settings)Object.assign(S.settings,d.settings);
    S.sessions=d.sessions||[];S.weights=(d.weights||[]).filter(w=>typeof w.kg==='number');S.days=d.days||[];
    S.draft=d.draft&&d.draft.type?d.draft:null;S.meta=d.meta||{};
    S.modeles=Array.isArray(d.modeles)?d.modeles:[];S.plans=Array.isArray(d.plans)?d.plans:[];S.exceptions=Array.isArray(d.exceptions)?d.exceptions:[];S.photos=d.photos&&typeof d.photos==='object'?d.photos:{};
  },
  q(key,fn){
    const prev=this.queues[key]||Promise.resolve();
    const p=prev.then(()=>{if(this.moteur)return fn(this.moteur);}).catch(e=>{
      console.warn(e);
      toast(e&&e.name==='QuotaExceededError'?'Stockage plein sur ce téléphone : fais une sauvegarde puis supprime d\'anciennes données.':'Pas enregistré. Réessaie, et fais une sauvegarde par précaution.');
    });
    this.queues[key]=p;return p;
  },
  saveSettings(){
    try{localStorage.setItem('sporty:theme',S.settings.theme);}catch(e){}
    const v=clone(S.settings);return this.q('settings',m=>m.putKv('settings',v));
  },
  saveSession(s){const v=clone(s);return this.q('s:'+s.id,m=>m.put('sessions',v));},
  deleteSession(id){return this.q('s:'+id,m=>m.suppr('sessions',id));},
  saveWeight(w){const v={date:w.date,kg:w.kg};return this.q('w:'+w.date,m=>m.put('weights',v));},
  deleteWeight(date){return this.q('w:'+date,m=>m.suppr('weights',date));},
  saveDay(d){
    const v={date:d.date};if(d.steps!=null)v.steps=d.steps;if(d.kcal!=null)v.kcal=d.kcal;
    return this.q('d:'+d.date,m=>m.put('days',v));
  },
  deleteDay(date){return this.q('d:'+date,m=>m.suppr('days',date));},
  saveDraft(){const v=S.draft?clone(S.draft):null;return this.q('draft',m=>m.putKv('draft',v));},
  saveModeles(){const v=clone(S.modeles||[]);return this.q('modeles',m=>m.putKv('modeles',v));},
  savePlans(){const v=clone(S.plans||[]);return this.q('plans',m=>m.putKv('plans',v));},
  saveExceptions(){const v=clone(S.exceptions||[]);return this.q('exceptions',m=>m.putKv('exceptions',v));},
  savePhotos(id){const v=S.photos&&S.photos[id]?S.photos[id].slice():null;return this.q('p:'+id,m=>m.putPhoto(id,v));},
  saveMeta(){const v=clone(S.meta);return this.q('meta',m=>m.putKv('meta',v));},
  /* Réécrit tout l'état courant (après un import). Rejette en cas d'échec, pour que l'écran d'import le dise. */
  async toutEnregistrer(){
    if(!this.moteur)throw new Error('Stockage indisponible');
    await Promise.all(Object.values(this.queues));
    const d=clone({settings:S.settings,sessions:S.sessions,weights:S.weights,days:S.days,draft:S.draft,meta:S.meta,modeles:S.modeles||[],plans:S.plans||[],exceptions:S.exceptions||[]});
    d.photos=S.photos||{};
    try{localStorage.setItem('sporty:theme',S.settings.theme);}catch(e){}
    await this.moteur.remplacer(d);
  }
};

/* Enregistre la séance en cours peu après chaque saisie (charge, répétitions). */
let draftTimer=null;
function saveDraftSoon(){clearTimeout(draftTimer);draftTimer=setTimeout(()=>Store.saveDraft(),900);}
