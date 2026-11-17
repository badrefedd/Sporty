'use strict';
/* ---------- Exercise bank ---------- */
const GROUPS={pecs:'Pectoraux',dos:'Dos',epaules:'Épaules',biceps:'Biceps',triceps:'Triceps',avbras:'Avant-bras',quadri:'Quadriceps',ischios:'Ischio-jambiers',fessiers:'Fessiers',adducteurs:'Adducteurs',mollets:'Mollets',abdos:'Abdos et gainage',lombaires:'Lombaires',cardio:'Cardio',fonctionnel:'Cross-training'};
const MODES={kg:'Charge + répétitions',bw:'Poids du corps',time:'Cardio (durée)',hold:'Temps (secondes)'};
const BANK=[
['dc','Développé couché','pecs','Barre','kg','Pectoraux, Triceps, Épaules','','H'],
['dc_halt','Développé couché haltères','pecs','Haltères','kg','Pectoraux, Triceps, Épaules','Omoplates serrées sur le banc|Descends les haltères sur les côtés de la poitrine|Pousse en rapprochant légèrement les haltères en haut','H'],
['dci','Développé incliné haltères','pecs','Haltères','kg','Haut des pectoraux, Épaules, Triceps','','H'],
['dci_barre','Développé incliné barre','pecs','Barre','kg','Haut des pectoraux, Épaules, Triceps','Banc à 30° environ|Descends la barre sur le haut de la poitrine|Coudes à 45° du corps, pas écartés à 90°','H'],
['dd_barre','Développé décliné barre','pecs','Barre','kg','Bas des pectoraux, Triceps','Pieds bien bloqués sous les rouleaux|Descends la barre sur le bas des pectoraux|Garde les omoplates serrées','H'],
['dc_smith','Développé couché à la Smith machine','pecs','Smith machine','kg','Pectoraux, Triceps','Place le banc pour que la barre descende sur le bas des pectoraux|Déverrouille la barre en tournant les poignets|Contrôle la descente','H'],
['dci_smith','Développé incliné à la Smith machine','pecs','Smith machine','kg','Haut des pectoraux, Épaules','Banc à 30°, barre au niveau du haut de la poitrine|Omoplates serrées|Pousse sans verrouiller les coudes','H'],
['chest_press','Chest press (développé assis machine)','pecs','Machine','kg','Pectoraux, Triceps, Épaules','Règle le siège : poignées à hauteur de poitrine|Dos plaqué au dossier|Pousse sans décoller les épaules'],
['chest_press_inc','Chest press incliné (machine)','pecs','Machine','kg','Haut des pectoraux, Épaules','Poignées au niveau du haut de la poitrine|Dos et tête contre le dossier|Reviens lentement jusqu\'à l\'étirement'],
['dc_convergent','Développé convergent (machine à disques)','pecs','Machine à disques','kg','Pectoraux, Triceps','Siège réglé pour que les poignées arrivent sous la poitrine|Pousse en rapprochant les mains|Note le total des disques des deux côtés'],
['pec_deck','Pec deck (butterfly)','pecs','Machine','kg','Pectoraux','Coudes légèrement fléchis, à hauteur des épaules|Ramène les bras devant toi en serrant les pectoraux|Reviens lentement sans aller trop loin en arrière'],
['ecarte_halt','Écarté couché haltères','pecs','Haltères','kg','Pectoraux','Bras légèrement fléchis, comme pour enlacer un arbre|Descends jusqu\'à sentir l\'étirement, pas plus|Charge légère, mouvement lent'],
['ecarte_inc','Écarté incliné haltères','pecs','Haltères','kg','Haut des pectoraux','Banc à 30°|Coudes légèrement fléchis tout le long|Remonte en serrant le haut des pectoraux'],
['crossover','Écarté à la poulie vis-à-vis','pecs','Poulie','kg','Pectoraux','Poulies en haut, un pied en avant pour la stabilité|Ramène les mains devant le bas de la poitrine|Coudes légèrement fléchis et fixes'],
['crossover_bas','Écarté poulie basse vers le haut','pecs','Poulie','kg','Haut des pectoraux','Poulies en bas|Monte les mains devant toi jusqu\'au niveau du menton|Contrôle le retour'],
['pompes','Pompes','pecs','Poids du corps','bw','Pectoraux, Triceps, Gainage','Mains un peu plus larges que les épaules|Corps bien droit et gainé|Descends la poitrine près du sol'],
['dips_pecs','Dips buste penché','pecs','Barres parallèles','bw','Bas des pectoraux, Triceps','Buste penché en avant, coudes un peu écartés|Descends jusqu\'à 90° aux coudes|Utilise la machine d\'assistance si besoin'],
['pullover','Pull-over haltère','pecs','Haltère','kg','Pectoraux, Grand dorsal','Allongé, haltère tenu à deux mains au-dessus de la poitrine|Descends derrière la tête, bras presque tendus|Remonte jusqu\'au-dessus de la poitrine'],

['tirage','Tirage vertical','dos','Poulie','kg','Grand dorsal, Biceps',''],
['tirage_serre','Tirage vertical prise serrée','dos','Poulie','kg','Grand dorsal, Biceps','Poignée triangle ou prise serrée|Tire vers le haut de la poitrine en sortant la poitrine|Remonte lentement'],
['tirage_unilat','Tirage vertical unilatéral (machine)','dos','Machine','kg','Grand dorsal','Un bras à la fois|Tire le coude vers la hanche|Garde le buste stable'],
['tirage_machine','Tirage vertical machine (convergent)','dos','Machine à disques','kg','Grand dorsal, Biceps','Cuisses bien calées sous les rouleaux|Tire les coudes vers le bas et l\'arrière|Remonte bras presque tendus'],
['traction','Tractions','dos','Barre fixe','bw','Grand dorsal, Biceps','Prise un peu plus large que les épaules|Monte le menton au-dessus de la barre|Redescends bras presque tendus, sans élan'],
['traction_assist','Tractions assistées (machine)','dos','Machine','kg','Grand dorsal, Biceps','Plus la charge est lourde, plus l\'aide est forte|Note la charge d\'assistance et baisse-la au fil des semaines|Monte le menton au-dessus de la barre'],
['row','Rowing assis à la poulie','dos','Poulie','kg','Milieu du dos, Biceps',''],
['row_machine','Rowing assis machine (appui poitrine)','dos','Machine','kg','Milieu du dos, Arrière d\'épaules','Poitrine contre l\'appui|Tire les coudes vers l\'arrière|Serre les omoplates 1 seconde'],
['row_convergent','Rowing convergent (machine à disques)','dos','Machine à disques','kg','Milieu du dos, Grand dorsal','Poitrine contre l\'appui|Tire un bras ou les deux|Serre les omoplates en fin de mouvement'],
['row_barre','Rowing barre buste penché','dos','Barre','kg','Milieu du dos, Grand dorsal','Buste penché à 45°, dos bien droit|Tire la barre vers le nombril|Ne te redresse pas pour tricher','H'],
['row_halt','Rowing haltère un bras','dos','Haltère','kg','Grand dorsal, Milieu du dos','Main et genou en appui sur le banc|Tire l\'haltère vers la hanche|Dos plat, sans tourner le buste'],
['row_t','Rowing barre en T','dos','Machine à disques','kg','Milieu du dos, Grand dorsal','Poitrine contre l\'appui si la machine en a un|Tire vers le bas des pectoraux|Contrôle la descente','H'],
['row_trx','Rowing aux sangles (TRX)','dos','Sangles','bw','Milieu du dos, Biceps','Corps droit et gainé|Tire la poitrine vers les mains|Plus tu es incliné, plus c\'est dur'],
['pullover_poulie','Pull-over à la poulie haute','dos','Poulie','kg','Grand dorsal','Bras presque tendus, buste légèrement penché|Descends la barre jusqu\'aux cuisses|Remonte lentement à hauteur des yeux'],
['sdt','Soulevé de terre','dos','Barre','kg','Dos, Fessiers, Ischio-jambiers','Barre contre les tibias, dos bien droit|Pousse le sol avec les jambes, la barre frôle les jambes|Ne t\'arrondis jamais le dos : baisse la charge si besoin','H'],
['sdt_trapbar','Soulevé de terre à la barre hexagonale','dos','Barre hexagonale','kg','Cuisses, Fessiers, Dos','Place-toi au centre de la barre|Dos droit, pousse le sol avec les jambes|Plus facile à apprendre que la barre droite','H'],
['shrug_halt','Shrugs haltères','dos','Haltères','kg','Trapèzes','Bras tendus le long du corps|Monte les épaules vers les oreilles|Pas de rotation des épaules'],
['shrug_barre','Shrugs barre ou machine','dos','Barre','kg','Trapèzes','Prise largeur d\'épaules|Monte les épaules et marque 1 seconde|Redescends lentement'],

['dm_halt','Développé épaules haltères assis','epaules','Haltères','kg','Épaules, Triceps','Dossier presque vertical|Haltères à hauteur des oreilles au départ|Pousse sans cambrer le bas du dos','H'],
['dm_barre','Développé militaire barre debout','epaules','Barre','kg','Épaules, Triceps, Gainage','Fessiers et abdos serrés|Pousse la barre au-dessus de la tête, en ligne avec les oreilles|Ne cambre pas le bas du dos','H'],
['shoulder_press','Shoulder press (machine)','epaules','Machine','kg','Épaules, Triceps','Poignées à hauteur des épaules au départ|Dos contre le dossier|Pousse sans verrouiller les coudes'],
['dm_smith','Développé épaules à la Smith machine','epaules','Smith machine','kg','Épaules, Triceps','Banc presque vertical sous la barre|Barre devant le visage, jusqu\'au menton|Pousse sans cambrer'],
['arnold','Développé Arnold','epaules','Haltères','kg','Épaules','Départ paumes vers toi devant le menton|Tourne les poignets en poussant vers le haut|Charge modérée, mouvement fluide'],
['lat','Élévations latérales','epaules','Haltères','kg','Deltoïde moyen',''],
['lat_poulie','Élévations latérales à la poulie','epaules','Poulie','kg','Deltoïde moyen','Poulie basse, câble devant ou derrière toi|Monte le bras sur le côté jusqu\'à hauteur d\'épaule|Un bras à la fois, sans élan'],
['lat_machine','Élévations latérales machine','epaules','Machine','kg','Deltoïde moyen','Épaules alignées avec l\'axe de la machine|Pousse avec les coudes, pas les mains|Redescends lentement'],
['front_raise','Élévations frontales','epaules','Haltères','kg','Avant des épaules','Bras presque tendus|Monte jusqu\'à hauteur des yeux|Pas d\'élan avec le buste'],
['oiseau','Oiseau haltères (buste penché)','epaules','Haltères','kg','Arrière des épaules','Buste penché presque à l\'horizontale, dos droit|Écarte les bras sur les côtés, coudes légèrement fléchis|Charge légère'],
['rear_delt','Oiseau à la machine (reverse pec deck)','epaules','Machine','kg','Arrière des épaules, Haut du dos','Face à la machine, poitrine contre le dossier|Ouvre les bras vers l\'arrière, coudes à hauteur d\'épaules|Marque 1 seconde en arrière'],
['face_pull','Face pull à la poulie','epaules','Poulie','kg','Arrière des épaules, Haut du dos','Corde à hauteur du visage|Tire vers le front en écartant les mains|Coudes hauts, serre les omoplates'],
['upright_row','Tirage menton','epaules','Barre','kg','Épaules, Trapèzes','Prise largeur d\'épaules ou plus large|Monte les coudes jusqu\'à hauteur d\'épaules, pas plus|Arrête si ça pince dans l\'épaule'],

['curl','Curl biceps haltères','biceps','Haltères','kg','Biceps',''],
['curl_barre','Curl barre droite','biceps','Barre','kg','Biceps','Coudes collés au corps|Monte sans balancer le buste|Redescends jusqu\'à bras tendus'],
['curl_ez','Curl barre EZ','biceps','Barre EZ','kg','Biceps, Avant-bras','Prise sur la partie coudée de la barre|Coudes fixes|Plus confortable pour les poignets'],
['curl_marteau','Curl marteau','biceps','Haltères','kg','Biceps, Avant-bras','Paumes face à face tout le long|Coudes collés au corps|Alterne ou fais les deux bras ensemble'],
['curl_incline','Curl incliné haltères','biceps','Haltères','kg','Biceps','Banc incliné à 45-60°, bras pendants|Monte sans avancer les coudes|Charge plus légère qu\'en curl debout'],
['curl_pupitre','Curl au pupitre','biceps','Machine','kg','Biceps','Aisselles calées en haut du pupitre|Descends presque bras tendus|Pas de rebond en bas'],
['curl_poulie','Curl à la poulie basse','biceps','Poulie','kg','Biceps','Barre ou corde à la poulie basse|Coudes fixes le long du corps|Contrôle le retour'],
['curl_concentre','Curl concentré','biceps','Haltère','kg','Biceps','Assis, coude calé contre l\'intérieur de la cuisse|Monte l\'haltère vers l\'épaule|Redescends lentement'],
['curl_machine','Curl biceps machine','biceps','Machine','kg','Biceps','Coudes alignés avec l\'axe de la machine|Monte en serrant les biceps|Contrôle la descente'],

['tri','Extension triceps à la poulie','triceps','Poulie','kg','Triceps',''],
['tri_corde','Extension triceps à la corde','triceps','Poulie','kg','Triceps','Coudes collés au corps|Pousse vers le bas et écarte la corde en fin de mouvement|Remonte sans bouger les coudes'],
['tri_overhead','Extension triceps au-dessus de la tête (poulie)','triceps','Poulie','kg','Triceps','Dos à la poulie, corde derrière la tête|Coudes pointés vers l\'avant et fixes|Tends les bras vers l\'avant et le haut'],
['barre_front','Barre au front','triceps','Barre EZ','kg','Triceps','Allongé, bras verticaux|Descends la barre vers le front en pliant seulement les coudes|Charge modérée, coudes fixes'],
['tri_halt_tete','Extension haltère derrière la tête','triceps','Haltère','kg','Triceps','Assis, haltère tenu à deux mains au-dessus de la tête|Descends derrière la tête, coudes serrés|Tends les bras complètement'],
['kickback','Kickback haltère','triceps','Haltère','kg','Triceps','Buste penché, bras collé au corps|Tends l\'avant-bras vers l\'arrière|Charge légère, marque 1 seconde bras tendu'],
['dips','Dips','triceps','Barres parallèles','bw','Triceps, Pectoraux','Buste le plus droit possible|Descends jusqu\'à 90° aux coudes|Machine d\'assistance si besoin'],
['dips_machine','Dips machine (triceps press)','triceps','Machine','kg','Triceps','Dos contre le dossier|Pousse les poignées vers le bas jusqu\'à bras tendus|Remonte lentement'],
['dc_serre','Développé couché prise serrée','triceps','Barre','kg','Triceps, Pectoraux','Mains à largeur d\'épaules|Coudes près du corps|Descends sur le bas des pectoraux','H'],
['dips_banc','Dips entre deux bancs','triceps','Poids du corps','bw','Triceps','Mains sur le bord du banc, fesses proches du banc|Descends jusqu\'à 90° aux coudes|Jambes pliées pour faciliter'],

['wrist_curl','Curl poignets','avbras','Barre','kg','Avant-bras','Avant-bras posés sur les cuisses ou un banc|Monte la barre en pliant les poignets|Mouvement court et contrôlé'],
['reverse_curl','Curl inversé','avbras','Barre EZ','kg','Avant-bras, Biceps','Prise par le dessus|Coudes collés au corps|Charge légère'],
['farmer','Marche du fermier','avbras','Haltères','hold','Avant-bras, Trapèzes, Gainage','Un haltère lourd dans chaque main|Marche droit, épaules basses|Note la durée et la charge par haltère'],

['presse','Presse à cuisses','quadri','Machine','kg','Quadriceps, Fessiers','','H'],
['presse_horiz','Presse horizontale','quadri','Machine','kg','Quadriceps, Fessiers','Dos plaqué au dossier|Pieds à largeur d\'épaules|Ne verrouille pas les genoux en fin de poussée'],
['squat','Squat barre','quadri','Barre','kg','Quadriceps, Fessiers, Gainage','Barre sur le haut du dos, pas sur la nuque|Descends en poussant les fesses en arrière, dos droit|Genoux dans l\'axe des pieds','H'],
['squat_smith','Squat à la Smith machine','quadri','Smith machine','kg','Quadriceps, Fessiers','Pieds légèrement devant la barre|Descends cuisses parallèles au sol|Pousse dans les talons','H'],
['hack_squat','Hack squat','quadri','Machine','kg','Quadriceps, Fessiers','Dos et épaules contre les appuis|Descends au moins à 90°|Pousse sans verrouiller les genoux','H'],
['front_squat','Squat avant','quadri','Barre','kg','Quadriceps, Gainage','Barre posée sur l\'avant des épaules, coudes hauts|Buste bien droit|Descends au moins cuisses parallèles','H'],
['goblet','Goblet squat','quadri','Haltère','kg','Quadriceps, Fessiers','Haltère ou kettlebell tenu contre la poitrine|Descends entre tes genoux, dos droit|Idéal pour apprendre le squat'],
['legext','Leg extension','quadri','Machine','kg','Quadriceps',''],
['fentes','Fentes avant haltères','quadri','Haltères','kg','Quadriceps, Fessiers','Grand pas en avant, buste droit|Descends le genou arrière près du sol|Repousse avec la jambe avant'],
['fentes_marchees','Fentes marchées','quadri','Haltères','kg','Quadriceps, Fessiers','Avance en enchaînant les fentes|Genou avant au-dessus de la cheville|Compte les répétitions par jambe'],
['bulgare','Squat bulgare','quadri','Haltères','kg','Quadriceps, Fessiers','Pied arrière posé sur un banc|Descends à la verticale, buste droit|Compte les répétitions par jambe'],
['step_up','Montée sur banc (step-up)','quadri','Haltères','kg','Quadriceps, Fessiers','Pied entier posé sur le banc|Monte en poussant sur la jambe du haut|Redescends lentement'],

['legcurl','Leg curl allongé','ischios','Machine','kg','Ischio-jambiers',''],
['legcurl_assis','Leg curl assis','ischios','Machine','kg','Ischio-jambiers','Genoux alignés avec l\'axe de la machine|Rouleau du haut bien serré sur les cuisses|Ramène les talons sous le siège, remonte lentement'],
['legcurl_debout','Leg curl debout unilatéral','ischios','Machine','kg','Ischio-jambiers','Une jambe à la fois|Hanches contre l\'appui|Ramène le talon vers la fesse'],
['sdt_roumain','Soulevé de terre roumain','ischios','Barre','kg','Ischio-jambiers, Fessiers','Genoux légèrement fléchis et fixes|Descends la barre le long des cuisses en reculant les fesses|Dos droit, remonte en serrant les fessiers','H'],
['sdt_roumain_halt','Soulevé de terre roumain haltères','ischios','Haltères','kg','Ischio-jambiers, Fessiers','Haltères le long des cuisses|Recule les fesses, dos droit|Descends jusqu\'à mi-tibia environ'],
['good_morning','Good morning','ischios','Barre','kg','Ischio-jambiers, Lombaires','Barre sur le haut du dos|Penche le buste en reculant les fesses, dos droit|Charge légère'],

['hip','Hip thrust','fessiers','Barre','kg','Fessiers, Ischio-jambiers','','H'],
['hip_machine','Hip thrust machine','fessiers','Machine','kg','Fessiers','Haut du dos contre l\'appui, ceinture sur les hanches|Monte en serrant les fessiers|Marque 1 seconde en haut'],
['glute_bridge','Pont fessier','fessiers','Poids du corps','bw','Fessiers','Allongé, pieds à plat près des fesses|Monte le bassin en serrant les fessiers|Pose un disque sur les hanches pour progresser'],
['kickback_poulie','Kickback fessier à la poulie','fessiers','Poulie','kg','Fessiers','Sangle à la cheville, poulie basse|Tends la jambe vers l\'arrière sans cambrer|Compte les répétitions par jambe'],
['glute_machine','Machine fessiers (kickback)','fessiers','Machine','kg','Fessiers','Avant-bras et genou en appui|Pousse la jambe vers l\'arrière et le haut|Contrôle le retour'],
['abducteurs','Machine abducteurs','fessiers','Machine','kg','Fessier moyen','Dos contre le dossier|Écarte les jambes et marque 1 seconde|Penche-toi un peu en avant pour viser les fessiers'],
['sdt_sumo','Soulevé de terre sumo','fessiers','Barre','kg','Fessiers, Cuisses, Adducteurs','Pieds très écartés, pointes vers l\'extérieur|Mains à l\'intérieur des jambes|Dos droit, pousse le sol','H'],

['adducteurs','Machine adducteurs','adducteurs','Machine','kg','Adducteurs','Dos contre le dossier|Serre les jambes et marque 1 seconde|Ouvre lentement sans forcer l\'écart'],
['adduc_poulie','Adduction à la poulie','adducteurs','Poulie','kg','Adducteurs','Sangle à la cheville, poulie basse sur le côté|Ramène la jambe devant l\'autre|Compte par jambe'],

['mollets_debout','Mollets debout (machine)','mollets','Machine','kg','Mollets','Avant des pieds sur la marche, talons dans le vide|Monte le plus haut possible et marque 1 seconde|Descends jusqu\'à l\'étirement'],
['mollets_assis','Mollets assis (machine)','mollets','Machine','kg','Mollets','Genoux sous l\'appui|Monte sur la pointe des pieds|Mouvement complet et lent'],
['mollets_presse','Mollets à la presse','mollets','Machine','kg','Mollets','Avant des pieds en bas de la plateforme|Pousse avec les pointes, jambes presque tendues|Ne verrouille pas les genoux'],
['mollets_smith','Mollets à la Smith machine','mollets','Smith machine','kg','Mollets','Avant des pieds sur un disque ou une marche|Monte et marque 1 seconde|Redescends lentement'],

['crunch','Crunch','abdos','Poids du corps','bw','Abdos','Bas du dos collé au sol|Enroule le buste en rapprochant les côtes du bassin|Ne tire pas sur la nuque'],
['crunch_machine','Crunch machine','abdos','Machine','kg','Abdos','Enroule le buste vers les cuisses|Souffle en descendant|Pas d\'élan'],
['crunch_poulie','Crunch à la poulie haute','abdos','Poulie','kg','Abdos','À genoux, corde de chaque côté de la tête|Enroule le buste vers les cuisses|Les hanches ne bougent pas'],
['releve_jambes','Relevé de jambes suspendu','abdos','Barre fixe','bw','Bas des abdos','Suspendu à la barre, sans balancer|Monte les genoux ou les jambes vers la poitrine|Redescends lentement'],
['releve_chaise','Relevé de genoux à la chaise romaine','abdos','Chaise romaine','bw','Bas des abdos','Dos plaqué contre le dossier|Monte les genoux vers la poitrine|Enroule le bassin en haut'],
['planche','Gainage (planche)','abdos','Poids du corps','hold','Abdos, Gainage','Sur les avant-bras, corps bien droit|Serre les abdos et les fessiers|Ne laisse pas le bassin tomber'],
['planche_cote','Gainage latéral','abdos','Poids du corps','hold','Obliques','Sur un avant-bras, corps aligné|Bassin haut|Fais les deux côtés'],
['russian','Russian twist','abdos','Poids du corps','bw','Obliques','Assis, buste incliné en arrière|Tourne le buste d\'un côté à l\'autre|Ajoute un disque pour progresser'],
['ab_wheel','Roue abdominale','abdos','Roue','bw','Abdos, Gainage','À genoux, roue devant toi|Avance en gardant le dos plat|Ne va pas plus loin que ce que tu contrôles'],
['rotation','Machine rotation du buste','abdos','Machine','kg','Obliques','Assis, bassin bloqué|Tourne le buste lentement|Fais les deux côtés'],
['woodchop','Bûcheron à la poulie','abdos','Poulie','kg','Obliques, Gainage','Poulie haute ou basse sur le côté|Tire en diagonale en tournant le buste|Bras presque tendus, compte par côté'],
['mountain','Mountain climbers','abdos','Poids du corps','hold','Abdos, Cardio','Position de pompe, corps droit|Ramène les genoux vers la poitrine en alternant|Rythme rapide mais contrôlé'],

['hyperext','Extension lombaire au banc à 45°','lombaires','Banc','bw','Lombaires, Fessiers','Bassin juste au bord de l\'appui|Descends dos droit, remonte jusqu\'à l\'alignement|Ne monte pas plus haut que le corps aligné'],
['lomb_machine','Machine lombaires','lombaires','Machine','kg','Lombaires','Dos contre le rouleau|Pousse vers l\'arrière jusqu\'à être droit|Charge légère, mouvement lent'],

['tapis','Tapis incliné','cardio','Tapis','time','Cardio, Brûle-graisse',''],
['tapis_course','Tapis de course','cardio','Tapis','time','Cardio','Commence par 5 min de marche|Regarde devant toi, pas tes pieds|Note la vitesse moyenne comme niveau'],
['velo','Vélo droit','cardio','Vélo','time','Cardio, Cuisses','Selle à hauteur de hanche|Jambe presque tendue en bas|Note le niveau de résistance'],
['velo_couche','Vélo semi-allongé','cardio','Vélo','time','Cardio, Cuisses','Dos contre le dossier|Ménage le dos et les genoux|Note le niveau de résistance'],
['biking','Vélo de biking','cardio','Vélo','time','Cardio','Selle et guidon réglés à hauteur de hanche|Alterne assis et en danseuse|Ajuste la résistance avec la molette'],
['elliptique','Vélo elliptique','cardio','Elliptique','time','Cardio, Tout le corps','Pousse et tire avec les bras|Garde le buste droit|Note le niveau de résistance'],
['rameur','Rameur','cardio','Rameur','time','Cardio, Dos, Jambes','Pousse d\'abord avec les jambes, puis tire avec les bras|Dos droit|Au retour : bras, buste, puis jambes'],
['stairmaster','Simulateur d\'escaliers','cardio','Escalier','time','Cardio, Fessiers','Ne te tiens pas aux barres|Pose le pied entier sur la marche|Très efficace en peu de temps'],
['skierg','SkiErg','cardio','SkiErg','time','Cardio, Dos, Bras','Tire les poignées vers le bas en fléchissant les hanches|Bras presque tendus|Rythme régulier'],
['airbike','Air bike','cardio','Vélo','time','Cardio, Tout le corps','Pousse et tire avec les bras|Idéal en intervalles : 20 s fort, 40 s lent|Note le niveau'],
['corde','Corde à sauter','cardio','Corde','time','Cardio, Mollets','Petits sauts sur l\'avant des pieds|Les poignets font tourner la corde|Commence par des séries de 1 min'],
['stepper','Stepper','cardio','Stepper','time','Cardio, Cuisses','Buste droit|Amplitude complète|Note le niveau'],

['kb_swing','Kettlebell swing','fonctionnel','Kettlebell','kg','Fessiers, Ischio-jambiers, Cardio','Le mouvement vient des hanches, pas des bras|Dos droit, la kettlebell monte à hauteur de poitrine|Serre les fessiers en haut'],
['burpees','Burpees','fonctionnel','Poids du corps','bw','Tout le corps, Cardio','Descends mains au sol, pieds en arrière|Reviens et saute bras en l\'air|Garde un rythme régulier'],
['box_jump','Saut sur box','fonctionnel','Box','bw','Cuisses, Explosivité','Atterris en douceur, genoux fléchis|Redescends en marchant, pas en sautant|Box basse pour commencer'],
['battle_rope','Battle rope','fonctionnel','Cordes','hold','Épaules, Bras, Cardio','Genoux fléchis, dos droit|Fais des vagues rapides avec les bras|Note la durée en secondes'],
['sled','Poussée de traîneau','fonctionnel','Traîneau','hold','Jambes, Cardio','Bras tendus sur les poignées, buste penché|Petits pas rapides|Note la durée et la charge ajoutée'],
['wall_ball','Wall ball','fonctionnel','Médecine-ball','kg','Cuisses, Épaules, Cardio','Squat avec le ballon contre la poitrine|Lance le ballon vers la cible en te relevant|Rattrape et enchaîne'],
['thruster','Thruster haltères','fonctionnel','Haltères','kg','Cuisses, Épaules','Squat avec les haltères aux épaules|Pousse au-dessus de la tête en te relevant|Enchaîne sans pause'],
['slam_ball','Slam ball','fonctionnel','Médecine-ball','kg','Tout le corps, Cardio','Monte le ballon au-dessus de la tête|Lance-le au sol de toutes tes forces|Fléchis les jambes pour le ramasser']
];


const YT = q => 'https://www.youtube.com/results?search_query=' + encodeURIComponent(q);

const CORE = {
  presse:{sets:3,min:8,max:12,rest:120,inc:5,q:'presse à cuisses 45 degrés technique',
    cues:['Dos et fesses bien plaqués contre le dossier','Pieds à largeur d\'épaules, au milieu de la plateforme','Descends jusqu\'à environ 90° aux genoux, sans décoller le bas du dos','Pousse avec les talons et ne verrouille pas les genoux en haut']},
  dc:{sets:3,min:8,max:12,rest:120,inc:2.5,note:'Machine ou haltères',q:'développé couché technique',
    cues:['Omoplates serrées et plaquées sur le banc','Pieds bien ancrés au sol','Descends la charge au niveau du bas des pectoraux','Coudes à environ 45° du corps, pas à 90°']},
  tirage:{sets:3,min:8,max:12,rest:90,inc:2.5,q:'tirage vertical poulie haute technique',
    cues:['Prise un peu plus large que les épaules','Buste légèrement incliné en arrière, poitrine sortie','Tire la barre vers le haut de la poitrine en abaissant les coudes','Remonte lentement, bras presque tendus']},
  legcurl:{sets:2,min:10,max:15,rest:60,inc:2.5,q:'leg curl allongé machine technique',
    cues:['Genoux juste après le bord du banc','Rouleau au-dessus des talons','Ramène les talons vers les fesses sans décoller les hanches','Redescends en 2 à 3 secondes']},
  lat:{sets:2,min:12,max:15,rest:60,inc:1,q:'élévations latérales haltères technique',
    cues:['Debout, genoux légèrement fléchis','Coudes très légèrement pliés','Monte les bras sur les côtés jusqu\'à hauteur des épaules, pas plus haut','Charge légère, sans élan avec le dos']},
  dci:{sets:3,min:8,max:12,rest:120,inc:2,q:'développé incliné haltères technique',
    cues:['Banc incliné à 30° environ','Omoplates serrées, pieds au sol','Descends les haltères sur les côtés du haut des pectoraux','Pousse vers le haut en rapprochant légèrement les haltères']},
  row:{sets:3,min:8,max:12,rest:90,inc:2.5,note:'Machine ou câble',q:'rowing assis poulie basse technique',
    cues:['Dos droit, poitrine sortie, genoux légèrement fléchis','Tire la poignée vers le nombril','Serre les omoplates en fin de mouvement','Ne te balance pas d\'avant en arrière']},
  hip:{sets:3,min:10,max:12,rest:90,inc:5,q:'hip thrust barre technique',
    cues:['Haut du dos appuyé sur le banc, sous les omoplates','Barre sur le pli des hanches, avec un coussin','Pieds à plat, tibias verticaux en haut du mouvement','Monte en serrant les fessiers, sans cambrer le bas du dos']},
  legext:{sets:2,min:12,max:15,rest:60,inc:2.5,q:'leg extension machine technique',
    cues:['Genoux alignés avec l\'axe de la machine','Rouleau en bas des tibias','Tends les jambes et marque 1 seconde en haut','Redescends lentement']},
  curl:{sets:2,min:12,max:12,rest:60,inc:1,q:'curl biceps haltères technique',
    cues:['Debout, coudes collés au corps','Monte l\'haltère en tournant la paume vers le haut','Ne balance pas le buste','Redescends lentement jusqu\'en bas']},
  tri:{sets:2,min:12,max:12,rest:60,inc:2.5,q:'extension triceps poulie haute technique',
    cues:['Coudes collés au corps et immobiles','Buste légèrement penché en avant','Pousse vers le bas jusqu\'à bras tendus','Remonte sans dépasser l\'angle droit']},
  tapis:{sets:1,min:20,max:20,rest:0,q:'marche tapis incliné technique',lvl:'% incl.',
    cues:['Inclinaison 10 à 12 %, vitesse 4,5 à 5,5 km/h','Ne te tiens pas aux barres','Tu dois pouvoir parler, en étant un peu essoufflé','Option mardi + jeudi : reste à 8-10 % le jeudi pour garder de l\'énergie pour le Five']}
};
const EX={};
function makeEx(row){
  const [id,name,group,equip,mode,mus,cues,fl]=row;
  const e={id,name,group,equip,mode,muscles:mus?mus.split(', '):[GROUPS[group]||''],cues:cues?cues.split('|'):[],q:name+' technique',perHand:mode==='kg'&&/^Haltères?$/.test(equip)};
  if(mode==='kg')Object.assign(e,{sets:3,min:8,max:12,rest:fl==='H'?120:90,inc:/Haltère/.test(equip)?2:2.5});
  else if(mode==='bw')Object.assign(e,{sets:3,min:8,max:15,rest:60,inc:0});
  else if(mode==='time')Object.assign(e,{sets:1,min:10,max:20,rest:0});
  else Object.assign(e,{sets:3,min:30,max:60,rest:60});
  return e;
}
function buildEx(){
  Object.keys(EX).forEach(k=>delete EX[k]);
  BANK.forEach(r=>{const e=makeEx(r);EX[e.id]=Object.assign(e,CORE[e.id]||{});});
  (S.settings.custom||[]).forEach(c=>{EX[c.id]=Object.assign(makeEx([c.id,c.name,c.group,c.equip||'Perso',c.mode,'','']),{custom:true});});
}
const PLANS = {
  A:{title:'Séance A',sub:'Jambes plus lourdes',ex:['presse','dc','tirage','legcurl','lat']},
  B:{title:'Séance B',sub:'Haut du corps, jambes légères',ex:['dci','row','hip','legext','curl','tri']},
  L:{title:'Séance libre',sub:'Tes exercices au choix',ex:[]}
};
const WEEK_OPTS = {
  '1':{label:'Lundi + mercredi',days:{1:'A',3:'B',5:'five'},note:'48 h de récupération entre les séances, idéal avant le Five.'},
  '2':{label:'Mardi + mercredi',days:{2:'A',3:'B',5:'five'},note:'Deux jours d\'affilée : si tu es courbaturé le mercredi, enlève 1 série au hip thrust.'},
  '3':{label:'Mardi + jeudi',days:{2:'A',4:'B',5:'five'},note:'Le jeudi, tapis à 8-10 % pour garder de l\'énergie pour le Five.'}
};
const DAYS=['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];
const DAYS_LONG=['lundi','mardi','mercredi','jeudi','vendredi','samedi','dimanche'];
const MONTHS=['janv.','févr.','mars','avr.','mai','juin','juil.','août','sept.','oct.','nov.','déc.'];
const MONTHS_LONG=['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
const TABS=['semaine','seance','exos','historique','poids','reglages'];
const ROUTES=TABS.concat(['mois','programme']);
const STEP_GOAL=10000;

