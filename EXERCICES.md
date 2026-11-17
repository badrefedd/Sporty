# Exercices Sporty (144)

Liste à donner à Claude pour écrire une séance que Sporty sait lire.
Fichier généré par `node outils/exercices-md.js`.

## Format d'une séance

```
SPORTY-SEANCE-V1
{
  "nom": "Bras express",
  "badge": "C",
  "couleur": "bleu",
  "description": "Biceps, triceps, épaules",
  "tapis": true,
  "date": "2026-11-20",
  "jours": [],
  "exercices": [
    {"id": "curl_ez", "nom": "Curl barre EZ", "series": 3, "reps": "10-12", "repos": 90},
    {"id": "planche", "nom": "Gainage (planche)", "series": 3, "duree": "30-45", "repos": 60}
  ]
}
```

- Obligatoires : `nom` et `exercices` (au moins 1). Le reste est facultatif.
- `id` : l'identifiant de la liste ci-dessous (colonne id). `nom` sert de secours si l'id est inconnu.
- `reps` pour les types *charge* et *poids du corps* ; `duree` en secondes pour le *gainage*, en minutes pour le *cardio*. Un nombre ou une fourchette (« 8-12 »).
- `repos` en secondes. `couleur` : orange, bleu, violet, rouge, jaune, rose ou gris (jamais de vert).
- `badge` : 1 ou 2 caractères ; « A », « B », « L » et « 5 » sont déjà pris.
- `date` : AAAA-MM-JJ. `jours` : "lundi" … "dimanche", pour une séance qui revient chaque semaine.

## Liste

id | nom | groupe | matériel | type
---|---|---|---|---
dc | Développé couché | Pectoraux | Barre | charge
dc_halt | Développé couché haltères | Pectoraux | Haltères | charge
dci | Développé incliné haltères | Pectoraux | Haltères | charge
dci_barre | Développé incliné barre | Pectoraux | Barre | charge
dd_barre | Développé décliné barre | Pectoraux | Barre | charge
dc_smith | Développé couché à la Smith machine | Pectoraux | Smith machine | charge
dci_convergent | Développé incliné convergent | Pectoraux | Machine à disques | charge
dci_smith | Développé incliné à la Smith machine | Pectoraux | Smith machine | charge
chest_press | Chest press (développé assis machine) | Pectoraux | Machine | charge
chest_press_inc | Chest press incliné (machine) | Pectoraux | Machine | charge
dc_convergent | Développé convergent (machine à disques) | Pectoraux | Machine à disques | charge
pec_deck | Pec deck (butterfly) | Pectoraux | Machine | charge
ecarte_halt | Écarté couché haltères | Pectoraux | Haltères | charge
ecarte_inc | Écarté incliné haltères | Pectoraux | Haltères | charge
crossover | Écarté à la poulie vis-à-vis | Pectoraux | Poulie | charge
crossover_bas | Écarté poulie basse vers le haut | Pectoraux | Poulie | charge
pompes | Pompes | Pectoraux | Poids du corps | poids du corps
dips_pecs | Dips buste penché | Pectoraux | Barres parallèles | poids du corps
pullover | Pull-over haltère | Pectoraux | Haltère | charge
tirage | Tirage vertical | Dos | Poulie | charge
tirage_serre | Tirage vertical prise serrée | Dos | Poulie | charge
tirage_unilat | Tirage vertical unilatéral (machine) | Dos | Machine | charge
tirage_machine | Tirage vertical machine (convergent) | Dos | Machine à disques | charge
traction | Tractions | Dos | Barre fixe | poids du corps
traction_assist | Tractions assistées (machine) | Dos | Machine | charge
row | Rowing assis à la poulie | Dos | Poulie | charge
row_machine | Rowing assis machine (appui poitrine) | Dos | Machine | charge
row_convergent | Rowing convergent (machine à disques) | Dos | Machine à disques | charge
row_barre | Rowing barre buste penché | Dos | Barre | charge
row_halt | Rowing haltère un bras | Dos | Haltère | charge
row_t | Rowing barre en T | Dos | Machine à disques | charge
row_trx | Rowing aux sangles (TRX) | Dos | Sangles | poids du corps
pullover_poulie | Pull-over à la poulie haute | Dos | Poulie | charge
sdt | Soulevé de terre | Dos | Barre | charge
sdt_trapbar | Soulevé de terre à la barre hexagonale | Dos | Barre hexagonale | charge
shrug_halt | Shrugs haltères | Dos | Haltères | charge
shrug_smith | Shrugs à la Smith machine | Dos | Smith machine | charge
shrug_barre | Shrugs barre ou machine | Dos | Barre | charge
dm_halt | Développé épaules haltères assis | Épaules | Haltères | charge
dm_barre | Développé militaire barre debout | Épaules | Barre | charge
shoulder_press | Shoulder press (machine) | Épaules | Machine | charge
dm_smith | Développé épaules à la Smith machine | Épaules | Smith machine | charge
arnold | Développé Arnold | Épaules | Haltères | charge
lat | Élévations latérales | Épaules | Haltères | charge
lat_poulie | Élévations latérales à la poulie | Épaules | Poulie | charge
lat_machine | Élévations latérales machine | Épaules | Machine | charge
front_raise | Élévations frontales | Épaules | Haltères | charge
front_raise_poulie | Élévations frontales à la poulie | Épaules | Poulie | charge
oiseau | Oiseau haltères (buste penché) | Épaules | Haltères | charge
rear_delt | Oiseau à la machine (reverse pec deck) | Épaules | Machine | charge
face_pull | Face pull à la poulie | Épaules | Poulie | charge
upright_row | Tirage menton | Épaules | Barre | charge
curl | Curl biceps haltères | Biceps | Haltères | charge
curl_barre | Curl barre droite | Biceps | Barre | charge
curl_ez | Curl barre EZ | Biceps | Barre EZ | charge
curl_marteau | Curl marteau | Biceps | Haltères | charge
curl_incline | Curl incliné haltères | Biceps | Haltères | charge
curl_pupitre | Curl au pupitre | Biceps | Machine | charge
curl_poulie | Curl à la poulie basse | Biceps | Poulie | charge
curl_concentre | Curl concentré | Biceps | Haltère | charge
curl_machine | Curl biceps machine | Biceps | Machine | charge
tri | Extension triceps à la poulie | Triceps | Poulie | charge
tri_corde | Extension triceps à la corde | Triceps | Poulie | charge
tri_overhead | Extension triceps au-dessus de la tête (poulie) | Triceps | Poulie | charge
barre_front | Barre au front | Triceps | Barre EZ | charge
tri_halt_tete | Extension haltère derrière la tête | Triceps | Haltère | charge
kickback | Kickback haltère | Triceps | Haltère | charge
dips | Dips | Triceps | Barres parallèles | poids du corps
dips_machine | Dips machine (triceps press) | Triceps | Machine | charge
dc_serre | Développé couché prise serrée | Triceps | Barre | charge
dips_banc | Dips entre deux bancs | Triceps | Poids du corps | poids du corps
wrist_curl | Curl poignets | Avant-bras | Barre | charge
reverse_curl | Curl inversé | Avant-bras | Barre EZ | charge
farmer | Marche du fermier | Avant-bras | Haltères | gainage (secondes)
presse | Presse à cuisses | Quadriceps | Machine | charge
presse_horiz | Presse horizontale | Quadriceps | Machine | charge
squat | Squat barre | Quadriceps | Barre | charge
squat_smith | Squat à la Smith machine | Quadriceps | Smith machine | charge
hack_squat | Hack squat | Quadriceps | Machine | charge
front_squat | Squat avant | Quadriceps | Barre | charge
goblet | Goblet squat | Quadriceps | Haltère | charge
legext | Leg extension | Quadriceps | Machine | charge
legext_poulie | Leg extension à la poulie basse | Quadriceps | Poulie (sangle cheville) | charge
sissy | Sissy squat | Quadriceps | Poids du corps ou machine sissy | poids du corps
fentes | Fentes avant haltères | Quadriceps | Haltères | charge
fentes_marchees | Fentes marchées | Quadriceps | Haltères | charge
bulgare | Squat bulgare | Quadriceps | Haltères | charge
step_up | Montée sur banc (step-up) | Quadriceps | Haltères | charge
legcurl | Leg curl allongé | Ischio-jambiers | Machine | charge
legcurl_assis | Leg curl assis | Ischio-jambiers | Machine | charge
legcurl_debout | Leg curl debout unilatéral | Ischio-jambiers | Machine | charge
legcurl_poulie | Leg curl à la poulie basse | Ischio-jambiers | Poulie (sangle cheville) | charge
sdt_roumain | Soulevé de terre roumain | Ischio-jambiers | Barre | charge
sdt_roumain_halt | Soulevé de terre roumain haltères | Ischio-jambiers | Haltères | charge
good_morning | Good morning | Ischio-jambiers | Barre | charge
hip | Hip thrust | Fessiers | Barre | charge
hip_machine | Hip thrust machine | Fessiers | Machine | charge
hip_smith | Hip thrust à la Smith machine | Fessiers | Smith machine | charge
glute_bridge | Pont fessier | Fessiers | Poids du corps | poids du corps
kickback_poulie | Kickback fessier à la poulie | Fessiers | Poulie | charge
glute_machine | Machine fessiers (kickback) | Fessiers | Machine | charge
abducteurs | Machine abducteurs | Fessiers | Machine | charge
abduc_poulie | Abduction à la poulie basse | Fessiers | Poulie (sangle cheville) | charge
sdt_sumo | Soulevé de terre sumo | Fessiers | Barre | charge
adducteurs | Machine adducteurs | Adducteurs | Machine | charge
adduc_poulie | Adduction à la poulie | Adducteurs | Poulie | charge
mollets_debout | Mollets debout (machine) | Mollets | Machine | charge
mollets_assis | Mollets assis (machine) | Mollets | Machine | charge
mollets_presse | Mollets à la presse | Mollets | Machine | charge
mollets_smith | Mollets à la Smith machine | Mollets | Smith machine | charge
crunch | Crunch | Abdos et gainage | Poids du corps | poids du corps
crunch_machine | Crunch machine | Abdos et gainage | Machine | charge
crunch_poulie | Crunch à la poulie haute | Abdos et gainage | Poulie | charge
releve_jambes | Relevé de jambes suspendu | Abdos et gainage | Barre fixe | poids du corps
releve_chaise | Relevé de genoux à la chaise romaine | Abdos et gainage | Chaise romaine | poids du corps
planche | Gainage (planche) | Abdos et gainage | Poids du corps | gainage (secondes)
planche_cote | Gainage latéral | Abdos et gainage | Poids du corps | gainage (secondes)
russian | Russian twist | Abdos et gainage | Poids du corps | poids du corps
ab_wheel | Roue abdominale | Abdos et gainage | Roue | poids du corps
rotation | Machine rotation du buste | Abdos et gainage | Machine | charge
woodchop | Bûcheron à la poulie | Abdos et gainage | Poulie | charge
mountain | Mountain climbers | Abdos et gainage | Poids du corps | gainage (secondes)
hyperext | Extension lombaire au banc à 45° | Lombaires | Banc | poids du corps
lomb_machine | Machine lombaires | Lombaires | Machine | charge
tapis | Tapis incliné | Cardio | Tapis | cardio (minutes)
tapis_course | Tapis de course | Cardio | Tapis | cardio (minutes)
velo | Vélo droit | Cardio | Vélo | cardio (minutes)
velo_couche | Vélo semi-allongé | Cardio | Vélo | cardio (minutes)
biking | Vélo de biking | Cardio | Vélo | cardio (minutes)
elliptique | Vélo elliptique | Cardio | Elliptique | cardio (minutes)
rameur | Rameur | Cardio | Rameur | cardio (minutes)
stairmaster | Simulateur d'escaliers | Cardio | Escalier | cardio (minutes)
skierg | SkiErg | Cardio | SkiErg | cardio (minutes)
airbike | Air bike | Cardio | Vélo | cardio (minutes)
corde | Corde à sauter | Cardio | Corde | cardio (minutes)
stepper | Stepper | Cardio | Stepper | cardio (minutes)
kb_swing | Kettlebell swing | Cross-training | Kettlebell | charge
burpees | Burpees | Cross-training | Poids du corps | poids du corps
box_jump | Saut sur box | Cross-training | Box | poids du corps
battle_rope | Battle rope | Cross-training | Cordes | gainage (secondes)
sled | Poussée de traîneau | Cross-training | Traîneau | gainage (secondes)
wall_ball | Wall ball | Cross-training | Médecine-ball | charge
thruster | Thruster haltères | Cross-training | Haltères | charge
slam_ball | Slam ball | Cross-training | Médecine-ball | charge
