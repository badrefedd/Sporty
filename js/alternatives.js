'use strict';
/* =====================================================================
   Alternatives : par exercice, les exercices à faire à la place quand le
   poste est pris. Écrit à la main, sans IA.

   Règle : une vraie alternative fait le MÊME MOUVEMENT (schéma) et travaille
   les MÊMES MUSCLES, avec un autre matériel. Classement :
     (a) autre poste avant même poste (le même poste est en fin de liste) ;
     (b) même angle et même trajectoire ;
     (c) guidé si l'original est guidé, libre si l'original est libre ;
     (d) facilité à charger lourd.
   Dépannage : mouvement différent, en dernier recours, 2 au maximum.

   Ce fichier est la seule source : ALTERNATIVES.md et les tests en sont tirés.
   Pour une note affichée à côté d'un nom : 'id|note'.
   ===================================================================== */

/* Schémas de mouvement. */
const SCHEMAS={
  poussee_h:'Poussée horizontale',poussee_i:'Poussée inclinée',poussee_d:'Poussée déclinée',poussee_v:'Poussée verticale',
  poussee_tri:'Poussée verrouillage triceps',ecarte:'Écarté (bras vers l\'avant)',pullover:'Pull-over (bras tendus)',
  tirage_v:'Tirage vertical',tirage_h:'Tirage horizontal',haussement:'Haussement d\'épaules',tirage_menton:'Tirage menton',
  abd_epaule:'Abduction de l\'épaule (élévation latérale)',flex_epaule:'Élévation frontale',arriere_epaule:'Écarté arrière (arrière d\'épaule)',
  flex_coude:'Flexion du coude (curl)',ext_coude:'Extension du coude (triceps)',flex_poignet:'Flexion du poignet',portage:'Portage',
  squat:'Squat (2 jambes)',fente:'Fente (1 jambe)',ext_genou:'Extension du genou',flex_genou:'Flexion du genou',
  charniere:'Charnière de hanche',ext_hanche:'Extension de hanche (fessiers)',abd_hanche:'Abduction de hanche',add_hanche:'Adduction de hanche',
  ext_cheville:'Extension de la cheville (mollets)',flex_tronc:'Enroulement du buste',flex_hanche:'Relevé de jambes',
  anti_ext:'Gainage face',anti_flex_lat:'Gainage latéral',rotation:'Rotation du buste',ext_tronc:'Extension du dos',
  cardio_marche:'Cardio : marche et montée',cardio_course:'Cardio : course et sauts',cardio_portee:'Cardio sans impact (portée)',
  cardio_velo:'Cardio : vélo',cardio_tirage:'Cardio : tirage',
  explosif_hanche:'Charnière explosive',saut:'Saut',complet:'Corps entier',poussee_traineau:'Poussée de traîneau',
  squat_lancer:'Squat + poussée',lancer:'Lancer'
};

/* Type : poly = polyarticulaire, iso = isolation (une seule articulation bouge),
   tronc, cardio, fonct. La règle « pas d'isolation à la place d'un polyarticulaire »
   ne compare que poly et iso. */
const TYPES={poly:'Polyarticulaire',iso:'Isolation',tronc:'Gainage et abdos',cardio:'Cardio',fonct:'Fonctionnel'};

/* id : [schéma, type, poste, drapeaux]
   poste : identifiant du poste de travail ; null = matériel libre disponible en plusieurs exemplaires.
   Deux exercices au même poste = « même poste ».
   drapeaux : u = unilatéral (par bras / par jambe), t = technique. */
const MOUV={
  /* Pectoraux */
  dc:['poussee_h','poly','banc_couche',''],
  dc_halt:['poussee_h','poly',null,''],
  dci:['poussee_i','poly',null,''],
  dci_barre:['poussee_i','poly','banc_incline',''],
  dd_barre:['poussee_d','poly','banc_decline',''],
  dc_smith:['poussee_h','poly','smith',''],
  dci_smith:['poussee_i','poly','smith',''],
  dci_convergent:['poussee_i','poly','dci_convergent',''],
  chest_press:['poussee_h','poly','chest_press',''],
  chest_press_inc:['poussee_i','poly','chest_press_inc',''],
  dc_convergent:['poussee_h','poly','dc_convergent',''],
  pec_deck:['ecarte','iso','pec_deck',''],
  ecarte_halt:['ecarte','iso',null,''],
  ecarte_inc:['ecarte','iso',null,''],
  crossover:['ecarte','iso','poulie',''],
  crossover_bas:['ecarte','iso','poulie',''],
  pompes:['poussee_h','poly',null,''],
  dips_pecs:['poussee_d','poly','barres_paralleles',''],
  pullover:['pullover','iso',null,''],
  /* Dos */
  tirage:['tirage_v','poly','tirage_poulie',''],
  tirage_serre:['tirage_v','poly','tirage_poulie',''],
  tirage_unilat:['tirage_v','poly','tirage_unilat','u'],
  tirage_machine:['tirage_v','poly','tirage_machine',''],
  traction:['tirage_v','poly','barre_fixe','t'],
  traction_assist:['tirage_v','poly','traction_assist',''],
  row:['tirage_h','poly','row_poulie',''],
  row_machine:['tirage_h','poly','row_machine',''],
  row_convergent:['tirage_h','poly','row_convergent',''],
  row_barre:['tirage_h','poly',null,'t'],
  row_halt:['tirage_h','poly',null,'u'],
  row_t:['tirage_h','poly','row_t',''],
  row_trx:['tirage_h','poly','sangles',''],
  pullover_poulie:['pullover','iso','poulie',''],
  sdt:['charniere','poly',null,'t'],
  sdt_trapbar:['charniere','poly',null,''],
  shrug_halt:['haussement','iso',null,''],
  shrug_barre:['haussement','iso',null,''],
  shrug_smith:['haussement','iso','smith',''],
  /* Épaules */
  dm_halt:['poussee_v','poly',null,''],
  dm_barre:['poussee_v','poly',null,''],
  shoulder_press:['poussee_v','poly','shoulder_press',''],
  dm_smith:['poussee_v','poly','smith',''],
  arnold:['poussee_v','poly',null,''],
  lat:['abd_epaule','iso',null,''],
  lat_poulie:['abd_epaule','iso','poulie','u'],
  lat_machine:['abd_epaule','iso','lat_machine',''],
  front_raise:['flex_epaule','iso',null,''],
  front_raise_poulie:['flex_epaule','iso','poulie',''],
  oiseau:['arriere_epaule','iso',null,''],
  rear_delt:['arriere_epaule','iso','pec_deck',''],
  face_pull:['arriere_epaule','iso','poulie',''],
  upright_row:['tirage_menton','poly',null,''],
  /* Biceps */
  curl:['flex_coude','iso',null,''],
  curl_barre:['flex_coude','iso',null,''],
  curl_ez:['flex_coude','iso',null,''],
  curl_marteau:['flex_coude','iso',null,''],
  curl_incline:['flex_coude','iso',null,''],
  curl_pupitre:['flex_coude','iso','pupitre',''],
  curl_poulie:['flex_coude','iso','poulie',''],
  curl_concentre:['flex_coude','iso',null,'u'],
  curl_machine:['flex_coude','iso','curl_machine',''],
  /* Triceps */
  tri:['ext_coude','iso','poulie',''],
  tri_corde:['ext_coude','iso','poulie',''],
  tri_overhead:['ext_coude','iso','poulie',''],
  barre_front:['ext_coude','iso',null,''],
  tri_halt_tete:['ext_coude','iso',null,''],
  kickback:['ext_coude','iso',null,'u'],
  dips:['poussee_tri','poly','barres_paralleles',''],
  dips_machine:['poussee_tri','poly','dips_machine',''],
  dc_serre:['poussee_tri','poly','banc_couche',''],
  dips_banc:['poussee_tri','poly',null,''],
  /* Avant-bras */
  wrist_curl:['flex_poignet','iso',null,''],
  reverse_curl:['flex_coude','iso',null,''],
  farmer:['portage','fonct',null,''],
  /* Quadriceps */
  presse:['squat','poly','presse',''],
  presse_horiz:['squat','poly','presse_horiz',''],
  squat:['squat','poly','rack','t'],
  squat_smith:['squat','poly','smith',''],
  hack_squat:['squat','poly','hack_squat',''],
  front_squat:['squat','poly','rack','t'],
  goblet:['squat','poly',null,''],
  legext:['ext_genou','iso','legext',''],
  legext_poulie:['ext_genou','iso','poulie','u'],
  sissy:['ext_genou','iso','sissy','t'],
  fentes:['fente','poly',null,'u'],
  fentes_marchees:['fente','poly',null,'u'],
  bulgare:['fente','poly',null,'u'],
  step_up:['fente','poly',null,'u'],
  /* Ischio-jambiers */
  legcurl:['flex_genou','iso','legcurl',''],
  legcurl_assis:['flex_genou','iso','legcurl_assis',''],
  legcurl_debout:['flex_genou','iso','legcurl_debout','u'],
  legcurl_poulie:['flex_genou','iso','poulie','u'],
  sdt_roumain:['charniere','poly',null,''],
  sdt_roumain_halt:['charniere','poly',null,''],
  good_morning:['charniere','poly','rack',''],
  /* Fessiers : le hip thrust ne fait bouger que la hanche, il est classé en isolation. */
  hip:['ext_hanche','iso',null,''],
  hip_machine:['ext_hanche','iso','hip_machine',''],
  hip_smith:['ext_hanche','iso','smith',''],
  glute_bridge:['ext_hanche','iso',null,''],
  kickback_poulie:['ext_hanche','iso','poulie','u'],
  glute_machine:['ext_hanche','iso','glute_machine','u'],
  abducteurs:['abd_hanche','iso','abducteurs',''],
  abduc_poulie:['abd_hanche','iso','poulie','u'],
  sdt_sumo:['charniere','poly',null,''],
  /* Adducteurs */
  adducteurs:['add_hanche','iso','adducteurs',''],
  adduc_poulie:['add_hanche','iso','poulie','u'],
  /* Mollets */
  mollets_debout:['ext_cheville','iso','mollets_debout',''],
  mollets_assis:['ext_cheville','iso','mollets_assis',''],
  mollets_presse:['ext_cheville','iso','presse',''],
  mollets_smith:['ext_cheville','iso','smith',''],
  /* Abdos */
  crunch:['flex_tronc','tronc',null,''],
  crunch_machine:['flex_tronc','tronc','crunch_machine',''],
  crunch_poulie:['flex_tronc','tronc','poulie',''],
  releve_jambes:['flex_hanche','tronc','barre_fixe',''],
  releve_chaise:['flex_hanche','tronc','chaise_romaine',''],
  planche:['anti_ext','tronc',null,''],
  planche_cote:['anti_flex_lat','tronc',null,''],
  russian:['rotation','tronc',null,''],
  ab_wheel:['anti_ext','tronc',null,''],
  rotation:['rotation','tronc','rotation',''],
  woodchop:['rotation','tronc','poulie',''],
  mountain:['anti_ext','tronc',null,''],
  /* Lombaires */
  hyperext:['ext_tronc','iso','banc_45',''],
  lomb_machine:['ext_tronc','iso','lomb_machine',''],
  /* Cardio */
  tapis:['cardio_marche','cardio','tapis',''],
  tapis_course:['cardio_course','cardio','tapis',''],
  velo:['cardio_velo','cardio','velo',''],
  velo_couche:['cardio_velo','cardio','velo_couche',''],
  biking:['cardio_velo','cardio','biking',''],
  elliptique:['cardio_portee','cardio','elliptique',''],
  rameur:['cardio_tirage','cardio','rameur',''],
  stairmaster:['cardio_marche','cardio','stairmaster',''],
  skierg:['cardio_tirage','cardio','skierg',''],
  airbike:['cardio_velo','cardio','airbike',''],
  corde:['cardio_course','cardio',null,''],
  stepper:['cardio_marche','cardio','stepper',''],
  /* Fonctionnel */
  kb_swing:['explosif_hanche','fonct',null,''],
  burpees:['complet','fonct',null,''],
  box_jump:['saut','fonct','box',''],
  battle_rope:['complet','fonct','cordes',''],
  sled:['poussee_traineau','fonct','traineau',''],
  wall_ball:['squat_lancer','fonct',null,''],
  thruster:['squat_lancer','fonct',null,''],
  slam_ball:['lancer','fonct',null,'']
};

/* id : { a: vraies alternatives classées, d: dépannages (2 max) } */
const ALT={
  /* Pectoraux */
  dc:{a:['dc_halt','chest_press','dc_convergent','dc_smith','pompes'],d:[]},
  dc_halt:{a:['dc','chest_press','dc_convergent','dc_smith','pompes'],d:[]},
  dci:{a:['dci_barre','dci_convergent','chest_press_inc','dci_smith','dc_halt|angle plat, moins proche'],d:[]},
  dci_barre:{a:['dci','dci_smith','dci_convergent','chest_press_inc','dc|angle plat, moins proche'],d:[]},
  dd_barre:{a:['dips_pecs','dc','dc_halt','chest_press','dc_convergent'],d:[]},
  dc_smith:{a:['chest_press','dc_convergent','dc','dc_halt','pompes'],d:[]},
  dci_smith:{a:['chest_press_inc','dci_convergent','dci_barre','dci'],d:[]},
  dci_convergent:{a:['chest_press_inc','dci_smith','dci_barre','dci','dc_convergent|angle plat, moins proche'],d:[]},
  chest_press:{a:['dc_convergent','dc_smith','dc','dc_halt','pompes'],d:[]},
  chest_press_inc:{a:['dci_convergent','dci_smith','dci_barre','dci','chest_press|angle plat, moins proche'],d:[]},
  dc_convergent:{a:['chest_press','dc_smith','dc','dc_halt','pompes'],d:[]},
  pec_deck:{a:['crossover','ecarte_halt','crossover_bas','ecarte_inc'],d:[]},
  ecarte_halt:{a:['ecarte_inc','pec_deck','crossover','crossover_bas'],d:[]},
  ecarte_inc:{a:['ecarte_halt','crossover_bas','pec_deck','crossover'],d:[]},
  crossover:{a:['pec_deck','ecarte_halt','ecarte_inc','crossover_bas'],d:[]},
  crossover_bas:{a:['ecarte_inc','ecarte_halt','pec_deck','crossover'],d:[]},
  pompes:{a:['dc_halt','dc','chest_press','dc_convergent','dc_smith'],d:[]},
  dips_pecs:{a:['dd_barre','dc_halt','dc','chest_press','dips|buste plus droit'],d:[]},
  pullover:{a:['pullover_poulie'],d:['ecarte_halt']},
  /* Dos */
  tirage:{a:['tirage_machine','traction_assist','tirage_unilat','traction','tirage_serre'],d:['pullover_poulie']},
  tirage_serre:{a:['tirage_machine','traction_assist','tirage_unilat','traction','tirage'],d:['pullover_poulie']},
  tirage_unilat:{a:['tirage_machine','traction_assist','tirage','tirage_serre','traction'],d:['pullover_poulie']},
  tirage_machine:{a:['tirage_unilat','traction_assist','tirage','tirage_serre','traction'],d:['pullover_poulie']},
  traction:{a:['traction_assist','tirage','tirage_machine','tirage_serre','tirage_unilat'],d:['pullover_poulie']},
  traction_assist:{a:['tirage_machine','tirage','tirage_unilat','tirage_serre','traction'],d:['pullover_poulie']},
  row:{a:['row_machine','row_convergent','row_t','row_halt','row_trx','row_barre'],d:[]},
  row_machine:{a:['row_convergent','row_t','row','row_halt','row_barre','row_trx'],d:[]},
  row_convergent:{a:['row_machine','row_t','row','row_halt','row_barre','row_trx'],d:[]},
  row_barre:{a:['row_halt','row_t','row','row_machine','row_convergent','row_trx'],d:[]},
  row_halt:{a:['row_barre','row_t','row_convergent','row_machine','row','row_trx'],d:[]},
  row_t:{a:['row_barre','row_halt','row_machine','row_convergent','row','row_trx'],d:[]},
  row_trx:{a:['row_halt','row_barre','row','row_machine','row_convergent'],d:[]},
  pullover_poulie:{a:['pullover'],d:['tirage']},
  sdt:{a:['sdt_trapbar','sdt_sumo','sdt_roumain','sdt_roumain_halt'],d:['hyperext']},
  sdt_trapbar:{a:['sdt','sdt_sumo','sdt_roumain','sdt_roumain_halt'],d:[]},
  shrug_halt:{a:['shrug_barre','shrug_smith'],d:['farmer']},
  shrug_barre:{a:['shrug_halt','shrug_smith'],d:['farmer']},
  shrug_smith:{a:['shrug_barre','shrug_halt'],d:['farmer']},
  /* Épaules */
  dm_halt:{a:['dm_barre','arnold','shoulder_press','dm_smith'],d:[]},
  dm_barre:{a:['dm_halt','arnold','dm_smith','shoulder_press'],d:[]},
  shoulder_press:{a:['dm_smith','dm_halt','dm_barre','arnold'],d:[]},
  dm_smith:{a:['shoulder_press','dm_barre','dm_halt','arnold'],d:[]},
  arnold:{a:['dm_halt','dm_barre','shoulder_press','dm_smith'],d:[]},
  lat:{a:['lat_poulie','lat_machine'],d:['upright_row|prise large']},
  lat_poulie:{a:['lat_machine','lat'],d:['upright_row|prise large']},
  lat_machine:{a:['lat_poulie','lat'],d:['upright_row|prise large']},
  front_raise:{a:['front_raise_poulie'],d:['dm_halt','shoulder_press']},
  front_raise_poulie:{a:['front_raise'],d:['dm_halt','shoulder_press']},
  oiseau:{a:['rear_delt','face_pull'],d:[]},
  rear_delt:{a:['oiseau','face_pull'],d:[]},
  face_pull:{a:['rear_delt','oiseau'],d:[]},
  upright_row:{a:[],d:['lat','shrug_barre']},
  /* Biceps */
  curl:{a:['curl_poulie','curl_ez','curl_barre','curl_machine','curl_pupitre','curl_marteau|vise aussi l\'avant-bras','curl_incline','curl_concentre'],d:[]},
  curl_barre:{a:['curl_ez','curl','curl_poulie','curl_pupitre','curl_machine','curl_marteau|vise aussi l\'avant-bras'],d:[]},
  curl_ez:{a:['curl_barre','curl','curl_pupitre','curl_poulie','curl_machine','curl_marteau|vise aussi l\'avant-bras'],d:[]},
  curl_marteau:{a:['reverse_curl','curl','curl_poulie','curl_ez','curl_barre'],d:[]},
  curl_incline:{a:['curl','curl_poulie','curl_ez','curl_barre','curl_concentre'],d:[]},
  curl_pupitre:{a:['curl_machine','curl_concentre','curl_ez','curl_barre','curl_poulie','curl'],d:[]},
  curl_poulie:{a:['curl_machine','curl','curl_ez','curl_barre','curl_pupitre','curl_incline'],d:[]},
  curl_concentre:{a:['curl_pupitre','curl_incline','curl','curl_machine','curl_poulie'],d:[]},
  curl_machine:{a:['curl_pupitre','curl_poulie','curl_ez','curl_barre','curl'],d:[]},
  /* Triceps */
  tri:{a:['barre_front','tri_halt_tete','kickback','tri_corde','tri_overhead'],d:['dips_machine']},
  tri_corde:{a:['barre_front','tri_halt_tete','kickback','tri','tri_overhead'],d:['dips_machine']},
  tri_overhead:{a:['tri_halt_tete','barre_front','kickback','tri','tri_corde'],d:['dips_machine']},
  barre_front:{a:['tri_halt_tete','kickback','tri','tri_corde','tri_overhead'],d:['dc_serre']},
  tri_halt_tete:{a:['barre_front','kickback','tri_overhead','tri','tri_corde'],d:['dc_serre']},
  kickback:{a:['tri','tri_corde','tri_halt_tete','barre_front','tri_overhead'],d:[]},
  dips:{a:['dips_machine','dips_banc','dc_serre','dips_pecs|buste penché, plus de pectoraux'],d:[]},
  dips_machine:{a:['dips','dips_banc','dc_serre'],d:['tri']},
  dc_serre:{a:['dips','dips_machine','dips_banc'],d:['barre_front']},
  dips_banc:{a:['dips','dips_machine','dc_serre'],d:['tri']},
  /* Avant-bras */
  wrist_curl:{a:[],d:['farmer']},
  reverse_curl:{a:['curl_marteau','curl_poulie|prise paumes vers le bas'],d:[]},
  farmer:{a:[],d:['shrug_halt','sled']},
  /* Quadriceps */
  presse:{a:['hack_squat','presse_horiz','squat_smith','goblet','squat'],d:['bulgare']},
  presse_horiz:{a:['presse','hack_squat','squat_smith','goblet','squat'],d:['bulgare']},
  squat:{a:['goblet','squat_smith','hack_squat','presse','presse_horiz','front_squat'],d:['bulgare']},
  squat_smith:{a:['hack_squat','presse','presse_horiz','squat','goblet'],d:['bulgare']},
  hack_squat:{a:['presse','squat_smith','presse_horiz','squat','goblet','front_squat'],d:['bulgare']},
  front_squat:{a:['goblet','hack_squat','squat_smith','presse','squat'],d:['bulgare']},
  goblet:{a:['front_squat','squat','squat_smith','hack_squat','presse'],d:['bulgare']},
  legext:{a:['legext_poulie','sissy'],d:['presse|pieds bas et serrés','goblet|talons surélevés']},
  legext_poulie:{a:['legext','sissy'],d:['presse|pieds bas et serrés','goblet|talons surélevés']},
  sissy:{a:['legext','legext_poulie'],d:['presse|pieds bas et serrés','goblet|talons surélevés']},
  fentes:{a:['fentes_marchees','bulgare','step_up'],d:[]},
  fentes_marchees:{a:['fentes','bulgare','step_up'],d:[]},
  bulgare:{a:['fentes','step_up','fentes_marchees'],d:[]},
  step_up:{a:['bulgare','fentes','fentes_marchees'],d:[]},
  /* Ischio-jambiers */
  legcurl:{a:['legcurl_assis','legcurl_debout','legcurl_poulie'],d:['sdt_roumain_halt']},
  legcurl_assis:{a:['legcurl','legcurl_debout','legcurl_poulie'],d:['sdt_roumain_halt']},
  legcurl_debout:{a:['legcurl_poulie','legcurl','legcurl_assis'],d:['sdt_roumain_halt']},
  legcurl_poulie:{a:['legcurl_debout','legcurl','legcurl_assis'],d:['sdt_roumain_halt']},
  sdt_roumain:{a:['sdt_roumain_halt','good_morning','sdt','sdt_sumo'],d:['hyperext']},
  sdt_roumain_halt:{a:['sdt_roumain','good_morning','sdt','sdt_trapbar'],d:['hyperext']},
  good_morning:{a:['sdt_roumain','sdt_roumain_halt'],d:['hyperext','lomb_machine']},
  /* Fessiers */
  hip:{a:['hip_smith','hip_machine','glute_bridge|avec un disque sur les hanches','glute_machine','kickback_poulie'],d:['sdt_roumain_halt']},
  hip_machine:{a:['hip_smith','hip','glute_bridge|avec un disque sur les hanches','glute_machine','kickback_poulie'],d:['sdt_roumain_halt']},
  hip_smith:{a:['hip_machine','hip','glute_bridge|avec un disque sur les hanches','glute_machine','kickback_poulie'],d:['sdt_roumain_halt']},
  glute_bridge:{a:['hip','hip_smith','hip_machine','glute_machine','kickback_poulie'],d:[]},
  kickback_poulie:{a:['glute_machine','hip_machine','hip_smith','hip','glute_bridge'],d:[]},
  glute_machine:{a:['kickback_poulie','hip_machine','hip_smith','hip','glute_bridge'],d:[]},
  abducteurs:{a:['abduc_poulie'],d:['step_up|sollicite aussi le moyen fessier']},
  abduc_poulie:{a:['abducteurs'],d:['step_up|sollicite aussi le moyen fessier']},
  sdt_sumo:{a:['sdt','sdt_trapbar','sdt_roumain','sdt_roumain_halt'],d:[]},
  /* Adducteurs */
  adducteurs:{a:['adduc_poulie'],d:['goblet|pieds très écartés (squat sumo)']},
  adduc_poulie:{a:['adducteurs'],d:['goblet|pieds très écartés (squat sumo)']},
  /* Mollets */
  mollets_debout:{a:['mollets_smith','mollets_presse','mollets_assis|genoux pliés, plus le bas du mollet'],d:[]},
  mollets_assis:{a:['mollets_debout','mollets_presse','mollets_smith'],d:[]},
  mollets_presse:{a:['mollets_debout','mollets_smith','mollets_assis'],d:[]},
  mollets_smith:{a:['mollets_debout','mollets_presse','mollets_assis'],d:[]},
  /* Abdos */
  crunch:{a:['crunch_machine','crunch_poulie'],d:['releve_chaise']},
  crunch_machine:{a:['crunch_poulie','crunch'],d:['releve_chaise']},
  crunch_poulie:{a:['crunch_machine','crunch'],d:['releve_chaise']},
  releve_jambes:{a:['releve_chaise'],d:['crunch']},
  releve_chaise:{a:['releve_jambes'],d:['crunch']},
  planche:{a:['ab_wheel','mountain'],d:[]},
  planche_cote:{a:[],d:['planche','woodchop']},
  russian:{a:['woodchop','rotation'],d:[]},
  ab_wheel:{a:['planche','mountain'],d:[]},
  rotation:{a:['woodchop','russian'],d:[]},
  woodchop:{a:['rotation','russian'],d:[]},
  mountain:{a:['planche','ab_wheel'],d:[]},
  /* Lombaires */
  hyperext:{a:['lomb_machine'],d:['good_morning','sdt_roumain_halt']},
  lomb_machine:{a:['hyperext'],d:['good_morning']},
  /* Cardio : même impact d'abord */
  tapis:{a:['stairmaster','stepper','elliptique','velo','velo_couche','rameur'],d:[]},
  tapis_course:{a:['corde','elliptique','airbike','rameur','biking','tapis|marche inclinée'],d:[]},
  velo:{a:['velo_couche','biking','airbike','elliptique','rameur'],d:[]},
  velo_couche:{a:['velo','biking','airbike','elliptique','rameur'],d:[]},
  biking:{a:['velo','airbike','velo_couche','elliptique','rameur'],d:[]},
  elliptique:{a:['stepper','velo','airbike','rameur','stairmaster','tapis'],d:[]},
  rameur:{a:['skierg','airbike','elliptique','velo','biking'],d:[]},
  stairmaster:{a:['stepper','tapis','elliptique','velo'],d:[]},
  skierg:{a:['rameur','airbike','elliptique','velo'],d:[]},
  airbike:{a:['biking','rameur','skierg','elliptique','velo'],d:[]},
  corde:{a:['tapis_course','airbike','elliptique','biking'],d:[]},
  stepper:{a:['stairmaster','tapis','elliptique','velo'],d:[]},
  /* Fonctionnel */
  kb_swing:{a:[],d:['sdt_roumain_halt','hip']},
  burpees:{a:[],d:['mountain','corde']},
  box_jump:{a:[],d:['step_up|en montant vite','corde']},
  battle_rope:{a:[],d:['skierg','slam_ball']},
  sled:{a:[],d:['fentes_marchees','airbike']},
  wall_ball:{a:['thruster'],d:['goblet']},
  thruster:{a:['wall_ball'],d:['goblet','dm_halt']},
  slam_ball:{a:[],d:['battle_rope','woodchop']}
};

/* ---------- Lecture ---------- */
const BAS_DU_CORPS=['quadri','ischios','fessiers','adducteurs','mollets'];
const parseAlt=s=>{const [id,note]=String(s).split('|');return {id,note:note||''};};
const memePoste=(a,b)=>{const pa=MOUV[a]&&MOUV[a][2],pb=MOUV[b]&&MOUV[b][2];return !!pa&&pa===pb;};
function uniLabel(id){const e=EX[id];return e&&BAS_DU_CORPS.includes(e.group)?'par jambe':'par bras';}

/* Étiquettes d'une alternative b proposée pour a. */
function altTags(a,b,opts={}){
  const t=[],m=MOUV[b]||[];
  if(opts.perso)t.push('perso');
  if(opts.dep)t.push('dépannage');
  if(memePoste(a,b))t.push('même poste');
  if(/t/.test(m[3]||''))t.push('technique');
  if(/u/.test(m[3]||''))t.push(uniLabel(b));
  return t;
}

/* Les 3 listes affichées pour un exercice, sans les exercices masqués ni ceux qu'on veut exclure. */
function altLists(id,exclude){
  const ex=new Set(exclude||[]);ex.add(id);
  const ok=x=>EX[x]&&!isHidden(x)&&!ex.has(x);
  const base=ALT[id]||{a:[],d:[]};
  const off=base.a.map(parseAlt).filter(x=>ok(x.id));
  const dep=base.d.map(parseAlt).filter(x=>ok(x.id));
  const known=new Set(base.a.concat(base.d).map(s=>parseAlt(s).id));
  const perso=((S.settings.alts||{})[id]||[]).filter(x=>ok(x)&&!known.has(x)).map(x=>({id:x,note:''}));
  return {off,perso,dep};
}
