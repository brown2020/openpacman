# OpenPacman

A browser-playable Pac-Man style arcade game. Eat dots and power pellets, dodge or eat Blinky, Pinky, Inky, and Clyde, grab fruit bonuses, and keep climbing. High scores stay on this device. Live demo: [openpacman.vercel.app](https://openpacman.vercel.app/).

## Features

- 28×31 maze with tunnels, a ghost house, dots, and four power pellets
- Blinky, Pinky, Inky, and Clyde with chase, scatter, frightened, eaten, and house modes, including Cruise Elroy speed-ups
- 13 authored level configs (speed, frightened time, fruit). After the last one, play continues on that final config
- Fruit from cherry through key, spawned after 70 and 170 dots
- Ghost-eat chain of 200, 400, 800, and 1600 points, with score popups
- Three lives, one extra life at 10,000 points, ready screen, death, and level transitions
- Keyboard (arrows or WASD, P or Esc to pause) and touch swipe
- Synthesized Web Audio effects (no audio files)
- Top five high scores in `localStorage`
- About page at `/about`
- Response headers: Content-Security-Policy (`frame-ancestors 'none'`) and `X-Content-Type-Options: nosniff`

There is no account system, no game API, and no server-side score storage.

## Tech stack

| Area | Choice | Version |
| --- | --- | --- |
| Framework | Next.js (App Router, Turbopack) | 16.4.3 |
| UI | React | 19.3.1 |
| Language | TypeScript | 6.0.3 |
| Styling | Tailwind CSS and `@tailwindcss/postcss` | 4.3.3 |
| State | Zustand | 5.0.16 |
| Lint | ESLint and `eslint-config-next` | 10.13.0 / 16.4.3 |
| Tests | Node.js test runner with `tsx` | — |
| Audio | Web Audio API | — |

Versions are the ones installed from `package.json` as of this maintenance pass. TypeScript stays on 6.0.3: TypeScript 7.0.2 is published, and `typescript-eslint` (pulled in by `eslint-config-next`) does not support 7.0 yet.

No Firebase, Stripe, or AI provider packages are installed.

## Project structure

```
src/
  app/
    page.tsx                 # Loads PacmanGame with ssr: false
    about/page.tsx           # About page
    layout.tsx               # Metadata, local fonts, global CSS
    fonts/                   # Press Start 2P, VT323, Geist
  components/                # PacmanGame, board layers, entities, start screen
  stores/game-store.ts       # Zustand state and actions
  hooks/                     # useGameLoop, useInput, useSound
  levels/gameLevels.ts       # Maze and per-level configs
  constants/gameConstants.ts
  utils/                     # gameEngine, gameUtils, pathfinding, position, sound, score
  lib/security-headers.ts    # CSP and nosniff
  types/types.ts
.github/workflows/ci.yml
```

## Getting started

### Prerequisites

- Node.js 22 (the version CI uses). Next.js itself allows Node.js 20.9.0 or newer.
- npm

### Install

```bash
git clone https://github.com/brown2020/openpacman.git
cd openpacman
npm install
```

### Environment variables

None. The app does not read `process.env` for configuration, and there is no `.env` example file. Do not commit secrets. If a client variable is added later, use a `NEXT_PUBLIC_` name and set the value in the host, not in git.

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). About: [http://localhost:3000/about](http://localhost:3000/about).

### Controls

| Input | Action |
| --- | --- |
| Arrow keys or WASD | Move |
| P or Esc | Pause or resume |
| Touch swipe | Move |
| On-screen button (narrow screens) | Pause or resume |

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Node test runner (`src/**/*.test.ts`) |
| `npm run doctor` | Optional `react-doctor` scan |

## Testing and CI

CI (`.github/workflows/ci.yml`) runs on push and pull request to `dev` and `main`: `npm ci`, lint, typecheck, test, and build on Node.js 22. No secrets are required.

Tests cover the opening of a level (ready, move, dot, power pellet), lives across level changes, extra-life scoring, frightened timers, ghost release and collisions, high-score persistence, security headers, and the absence of API routes and server actions.

## Deployment

The demo is a standard Next.js deploy on Vercel: [openpacman.vercel.app](https://openpacman.vercel.app/). There is no `vercel.json` and no Firebase config in this repo.

## Contributing

1. Branch from `dev`.
2. Run `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build` before opening a PR.
3. Keep gameplay changes separate from dependency bumps.

## License

[GNU Affero General Public License v3.0](LICENSE.md) (AGPL-3.0).
