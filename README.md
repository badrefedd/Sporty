# Sporty

Appli web perso pour suivre mes séances de musculation, mon poids, mes pas et mes kcal.
Pensée pour l'iPhone, installable sur l'écran d'accueil, utilisable sans connexion.

## Installer sur l'iPhone

1. Ouvre l'adresse de l'appli dans **Safari**.
2. Touche le bouton **Partager**, puis **Sur l'écran d'accueil**.
3. Ouvre Sporty depuis l'icône éclair.

## Mes données

- Tout est enregistré **sur le téléphone** (IndexedDB), rien n'est envoyé sur Internet.
- **Réglages → Mes données → Sauvegarder mes données** crée un fichier `.json`.
  Choisis « Enregistrer dans Fichiers », puis iCloud Drive.
- **Importer une sauvegarde** relit ce fichier. Les sauvegardes de la v2 marchent aussi
  (fichier, ou texte copié avec l'ancien bouton « Copier une sauvegarde »).
- Un rappel discret apparaît si la dernière sauvegarde date de plus de 30 jours.

## Organisation du code

Pas de framework, pas d'étape de compilation : les fichiers du dépôt sont ceux qui sont servis.

| Fichier | Rôle |
|---|---|
| `index.html` | Structure de la page, ordre de chargement des scripts |
| `css/styles.css` | Apparence (thèmes clair et sombre) |
| `js/outils.js` | Icônes, petites fonctions, thème, minuteur de repos |
| `js/exercices.js` | Banque d'exercices, séances A et B, options de jours |
| `js/alternatives.js` | Schéma de mouvement et alternatives de chaque exercice |
| `js/illustrations.js` | Photos des exercices : liste générée (type, image fixe, taille) |
| `js/photos.js` | Affichage des photos animées, mes photos, mise en cache hors connexion |
| `images/exos/` | Photos WebP des exercices (free-exercise-db, domaine public) |
| `js/stockage.js` | État de l'appli et enregistrement (IndexedDB, secours localStorage) |
| `js/sauvegarde.js` | Fichier de sauvegarde, import, rappel des 30 jours |
| `js/visuels.js` | Animations et schémas des muscles |
| `js/logique.js` | Calculs : suggestions de charge, moyennes, courbes |
| `js/seances.js` | Séances A, B et perso, séances prévues, code SPORTY-SEANCE-V1 (sans écran) |
| `js/vues.js` | Les écrans |
| `js/vues-seances.js` | Écrans des séances : onglet Séance, Mes séances, éditeur, journée, coller un code |
| `js/app.js` | Navigation, boutons, démarrage |
| `sw.js` | Mode hors connexion (service worker) |

**Ajouter Supabase plus tard** : écrire dans `js/stockage.js` un moteur avec les mêmes
méthodes que `MoteurIDB` (`ouvrir`, `charger`, `put`, `suppr`, `putKv`, `remplacer`).
Le reste de l'appli ne passe que par `Store` et n'a pas à changer.

**Publier une mise à jour** : modifier `VERSION` en haut de `sw.js`, sinon les téléphones
garderont l'ancienne version en mémoire.

## Séances perso et code de partage

- Réglages → **Mes séances** : créer, modifier, dupliquer, supprimer, copier le code.
- Une séance se partage avec un texte qui commence par `SPORTY-SEANCE-V1` (format décrit dans `EXERCICES.md`).
  Pour qu'une autre discussion Claude écrive une séance, lui donner `EXERCICES.md`.
- « Coller une séance » (onglet Séance ou Mes séances) relit ce code.

## Tests

```bash
npm test
```

Vérifie les alternatives et les séances (création, refus, historique, sauvegarde, code, dates prévues), sans navigateur.

```bash
npm run e2e
```

Rejoue les parcours dans un iPhone simulé (nécessite Playwright).

## Illustrations

- Photos de free-exercise-db (domaine public). Correspondance et choix « animée / fixe » dans
  `outils/animations.json`, version lisible dans `ANIMATIONS.md`.
- Pour régénérer les images et `js/illustrations.js` après une modification :

```bash
python3 -I outils/images-exos.py <dossier de free-exercise-db>
```

- Les images des exercices de mes séances sont gardées pour le hors connexion dès l'ouverture ;
  les autres la première fois qu'elles s'affichent.
- Mes photos (fiche d'un exercice → « Ajouter mes photos ») sont réduites et gardées sur le téléphone,
  et incluses dans la sauvegarde si la case « Inclure mes photos » est cochée.

## Alternatives

Les alternatives sont écrites à la main dans `js/alternatives.js` (règles en tête du fichier).
Après une modification :

```bash
node tests/alternatives.test.js
```

```bash
node outils/alternatives-md.js
```

Le premier vérifie les règles, le second régénère `ALTERNATIVES.md`, la version lisible.
`npm run docs` régénère `ALTERNATIVES.md` et `EXERCICES.md` d'un coup.

## Tester en local

```bash
python3 -m http.server 8000
```

Puis ouvrir http://localhost:8000.

## Crédits

Polices Barlow et Barlow Condensed (Jeremy Tribby), licence SIL Open Font License 1.1.
