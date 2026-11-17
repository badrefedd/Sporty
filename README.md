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
| `js/stockage.js` | État de l'appli et enregistrement (IndexedDB, secours localStorage) |
| `js/sauvegarde.js` | Fichier de sauvegarde, import, rappel des 30 jours |
| `js/visuels.js` | Animations et schémas des muscles |
| `js/logique.js` | Calculs : suggestions de charge, moyennes, courbes |
| `js/vues.js` | Les écrans |
| `js/app.js` | Navigation, boutons, démarrage |
| `sw.js` | Mode hors connexion (service worker) |

**Ajouter Supabase plus tard** : écrire dans `js/stockage.js` un moteur avec les mêmes
méthodes que `MoteurIDB` (`ouvrir`, `charger`, `put`, `suppr`, `putKv`, `remplacer`).
Le reste de l'appli ne passe que par `Store` et n'a pas à changer.

**Publier une mise à jour** : modifier `VERSION` en haut de `sw.js`, sinon les téléphones
garderont l'ancienne version en mémoire.

## Tester en local

```bash
python3 -m http.server 8000
```

Puis ouvrir http://localhost:8000.

## Crédits

Polices Barlow et Barlow Condensed (Jeremy Tribby), licence SIL Open Font License 1.1.
