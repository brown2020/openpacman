# CLAUDE.md

## Project Overview

OpenPacman is a modern, open-source Pac-Man game built with Next.js 16, React 19, TypeScript, and Zustand. Features authentic ghost AI with A* pathfinding, power pellet mechanics, touch controls, and retro arcade aesthetics.

## Commands

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Create production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

Requirements: Node.js 20.9.0+

## Project Structure

```
src/
├── app/                 # Next.js App Router (layout, page, globals.css)
├── components/          # React components
│   ├── PacmanGame.tsx   # Main game container (client component)
│   ├── GameBoard.tsx    # Game board renderer
│   ├── StartScreen.tsx  # Menu/title screen
│   ├── Pacman.tsx       # Pacman entity (SVG)
│   ├── Ghost.tsx        # Ghost entity (SVG)
│   └── board/           # WallsLayer, DotsLayer, EntitiesLayer
├── stores/game-store.ts # Zustand state management
├── hooks/               # useGameLoop, useInput, useSound
├── utils/               # gameEngine, pathfinding, position, soundManager
├── constants/           # gameConstants.ts (timings, speeds, colors)
├── levels/              # gameLevels.ts (maze layouts)
└── types/               # TypeScript interfaces and enums
```

## Architecture

### State Management (Zustand)
- Single store in `stores/game-store.ts`
- Core state: gameState, pacmanPos, direction, dots, powerPellets, ghosts
- Batched selectors: `selectGameplay`, `selectEntities`, `selectActions`
- Persists highScores to localStorage

### Game Loop (useGameLoop.ts)
- 60 FPS via requestAnimationFrame
- Fixed timestep pattern with accumulators
- Timing: Pacman moves every 100ms, ghosts every 300ms

### Ghost AI (gameEngine.ts)
- **Blinky (Red)**: Direct chase
- **Pinky (Pink)**: Targets 4 tiles ahead
- **Inky (Cyan)**: Vector from Blinky + 2 tiles ahead
- **Clyde (Orange)**: Chase if far, retreat if within 8 tiles
- Modes: CHASE, SCATTER, FRIGHTENED, EATEN, HOUSE

### Level Format (gameLevels.ts)
- 20x20 grid arrays
- Cell types: 0=DOT, 1=WALL, 2=EMPTY, 3=POWER_PELLET, 4=GHOST_HOUSE

## Key Patterns

- All game components use `"use client"` directive (SSR disabled)
- PacmanGame loaded via dynamic import with `ssr: false`
- Use `useShallow` from Zustand for object comparison in selectors
- Path alias: `@/*` maps to `./src/*`
- Sound via Web Audio API synthesis (no audio files)

## Conventions

- Functional components only
- PascalCase for components, camelCase for utilities
- UPPERCASE for constants
- Strict TypeScript enabled
- No testing framework configured

## Important Files

- `src/stores/game-store.ts` - Central game state and all actions
- `src/utils/gameEngine.ts` - Ghost AI and collision detection
- `src/utils/pathfinding.ts` - A* algorithm implementation
- `src/constants/gameConstants.ts` - All timing, speed, and config values
- `src/hooks/useGameLoop.ts` - Main game loop orchestration
