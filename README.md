# Tilted Director

Table de bord ludique pour diriger un tournoi de poker : suivi des niveaux de blindes, gestion des joueurs et statistiques clés dans une interface cartoon déjantée.

## Aperçu rapide

- **Dashboard** : résumé du tournoi (joueurs actifs/éliminés, niveau en cours, temps restant) via [`DashboardView`](src/views/Dashboard.tsx).
- **Timer** : minuteur de blindes interactif (play/pause, précédent/suivant, reset) avec structure affichée dans [`TimerView`](src/views/Timer.tsx).
- **Players** : ajout, élimination/réintégration, suppression et affichage par sièges dans [`PlayersView`](src/views/Players.tsx).
- **Director** : réglages (nom, tapis de départ), annonces et stats moyennes dans [`DirectorView`](src/views/Director.tsx).
- **Navigation** : barre inférieure pilotant les vues dans [`BottomNav`](src/common/layout/BottomNav.tsx).
- **Logique centrale** : état du tournoi (joueurs, blindes, minuteur) géré par [`useTournament`](src/hooks/useTournament.tsx) et orchestré dans [`Index`](src/modules/Index.tsx).

## Pile technique

- [React 19](package.json) + [Vite 7](vite.config.ts)
- TypeScript strict ([tsconfig.app.json](tsconfig.app.json))
- Tailwind CSS v4 + utilitaires d’animation (voir [src/index.css](src/index.css))
- Icôn
  es : lucide-react

## 🚀 Déploiement

L'application est déployée et accessible à l'adresse : **https://tilted-director.github.io/web/**

## Scripts PNPM

```bash
pnpm install  # installer les dépendences du projet
pnpm dev      # démarre Vite en mode dev
pnpm build    # tsc -b puis vite build
pnpm preview  # prévisualisation de la build
```

## Structure

- `src/components/` : UI réutilisable (ex. `CartoonCard`, `CartoonButton`).
- `src/views/` : vues métier.
- `src/hooks/` : logique état/données.
- `src/common/layout/` : navigation.
- `src/assets/` : visuels.

## Démarrage

1. `pnpm install`
2. `pnpm dev`
3. Ouvrir http://localhost:5173
