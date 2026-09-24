# OpenPacman

A browser-playable Pac-Man style arcade game. Eat dots and power pellets, dodge (or eat) Blinky, Pinky, Inky, and Clyde, grab fruit bonuses, and climb levels with local high-score persistence. Live demo: [openpacman.vercel.app](https://openpacman.vercel.app/).

## Features

Verified from the current codebase:

- Authentic-style 28×31 maze with tunnels, ghost house, dots, and power pellets
- Four ghosts with chase / scatter / frightened / eaten / house modes and personality targeting (Blinky, Pinky, Inky, Clyde), including Blinky “Elroy” speed-ups
- Level progression via `LEVELS` configs (speeds, frightened timing, fruit types)
- Fruit bonuses (cherry through key) spawned at dot thresholds
- Chained ghost-eat scoring while frightened; score popups
- Lives, extra life at score threshold, ready screen and death / level transitions
- Keyboard (arrows / WASD, P or Esc pause) and touch swipe input
- Web Audio synthesized effects (waka, siren, eat, death, etc.) via `SoundManager`
- Local high scores persisted with Zustand `persist` + `localStorage`
- Static About page at `/about` (no accounts, no server game APIs)

## Tech stack

| Area | Choice | Version (package.json) |
| --- | --- | --- |
| Framework | Next.js (App Router) | ^16.3.6 |
| UI | React | ^19.3.0 |
| Language | TypeScript | ^6 |
| Styling | Tailwind CSS + `@tailwindcss/postcss` | ^4.3.3 |
| State | Zustand | ^5.0.15 |
| Audio | Web Audio API | — |
| Lint / test | ESLint 10, Node test runner + `tsx` | — |

No Firebase, Stripe, AI providers, or backend APIs — gameplay is entirely client-side.

## Project structure

```
src/
  app/
    page.tsx                 # Dynamic PacmanGame (ssr: false)
    about/page.tsx           # About (Server Component)
    layout.tsx               # Metadata, fonts, global styles
  components/                # PacmanGame, GameBoard, Pacman, Ghost, Fruit, StartScreen
  stores/game-store.ts       # Zustand game state + high scores
  hooks/                     # useGameLoop, useInput, useSound
  levels/gameLevels.ts       # Maze layout + per-level configs
  constants/gameConstants.ts
  utils/                     # gameEngine, gameUtils, pathfinding, position, soundManager
  types/types.ts
  lib/routes.test.ts
docs/
.github/workflows/ci.yml
```

## Getting started

### Prerequisites

- Node.js 22 (matches CI) or a current LTS
- npm

### Clone and install

```bash
git clone https://github.com/brown2020/openpacman.git
cd openpacman
npm install
```

### Environment variables

None required. This app has no `process.env` usage and no `.env` template. If you add client env later, prefer `NEXT_PUBLIC_*` wired through host secrets — never commit real values.

### Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). About page: [http://localhost:3000/about](http://localhost:3000/about).

### Controls

| Input | Action |
| --- | --- |
| Arrow keys or WASD | Move |
| P or Esc | Pause / resume |
| Touch swipe | Move on mobile |

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Next.js development server |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Node test runner via `tsx` (`src/**/*.test.ts`) |
| `npm run doctor` | Optional `react-doctor` scan |

## Testing and CI

- Tests: `src/utils/position.test.ts`, `src/lib/routes.test.ts` (asserts no privileged API / server-action surface).
- CI (`.github/workflows/ci.yml`): on push/PR to `dev` and `main` — install, lint, typecheck, test, build (Node 22). No secrets required.

## Deployment

Standard Next.js deploy (demo on Vercel at [openpacman.vercel.app](https://openpacman.vercel.app/). No `vercel.json` or Firebase config in-repo.

## Contributing

1. Branch from `dev`.
2. Run `npm run lint`, `npm run typecheck`, and `npm test` before opening a PR.
3. Prefer focused gameplay/docs changes; do not invent server APIs without explicit design.

## License

[GNU Affero General Public License v3.0](LICENSE.md) (AGPL-3.0).
