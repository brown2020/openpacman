# OpenPacman Current State

## Purpose

OpenPacman is a browser-playable Pac-Man style arcade game. The repository
currently ships a Next.js App Router application with React, TypeScript,
Tailwind CSS, Zustand state management, synthesized Web Audio effects, keyboard
and touch input, score/life/level progression, fruit scoring, ghost modes, and
local high-score persistence.

## Implemented User Workflows

- Start a new game from the title screen.
- Move Pacman with arrow keys, WASD, or touch swipes.
- Pause/resume gameplay from keyboard shortcuts or the mobile pause button.
- Collect dots, power pellets, and fruit.
- Eat frightened ghosts for chained score bonuses.
- Lose lives on ghost collision and reset entities after death.
- Advance to the next level when all dots and power pellets are cleared.
- Persist and display local high scores.

## Current Architecture

- `src/app/page.tsx` is the game entry and dynamically loads `PacmanGame` with
  SSR disabled.
- `src/app/layout.tsx` defines metadata, viewport behavior, fonts, and global
  styling.
- `src/components/PacmanGame.tsx` coordinates the game UI, board rendering,
  start screen, HUD, controls, and gameplay hooks.
- `src/stores/game-store.ts` is the central Zustand store for game state,
  entity state, score/life/level state, high scores, and actions.
- `src/hooks/useGameLoop.ts` runs requestAnimationFrame timing and coordinates
  movement, collection, collision, sound, and level transitions.
- `src/hooks/useInput.ts` handles keyboard and touch direction changes.
- `src/hooks/useSound.ts` bridges React hooks to the Web Audio sound manager.
- `src/utils/gameEngine.ts` contains ghost mode, targeting, collision, and score
  helpers.
- `src/utils/gameUtils.ts`, `src/utils/position.ts`, and
  `src/utils/pathfinding.ts` provide framework-free movement and position
  helpers.
- `src/levels/gameLevels.ts`, `src/constants/gameConstants.ts`, and
  `src/types/types.ts` define the shared gameplay data model.

## Validation

- `npm run lint` is the configured lint gate.
- `npm run build` is the configured production build gate.
- No unit, integration, or browser test script is currently configured.
- Existing docs mention Node.js 20.9.0+ as the runtime requirement.

## Quality Risks

- Gameplay correctness relies mostly on manual inspection and lint/build because
  no automated gameplay tests are configured.
- `src/stores/game-store.ts` and `src/hooks/useGameLoop.ts` are high-impact
  files with many responsibilities.
- Audio and animation behavior depends on browser runtime APIs and should be
  checked in-browser after meaningful gameplay changes.
- Package versions in `package.json` have moved ahead of some README badge and
  tech-stack text, so docs should be kept in sync during maintenance.

## Improvement Goals For This Codebase Pass

- Establish committed run reports and repo guidance for future agents.
- Record a trustworthy validation baseline.
- Build an evidence-backed backlog for bugs, race risks, dead code, dependency
  drift, architecture risks, and lean-code opportunities.
- Execute only locally verifiable codebase-health improvements that preserve the
  current game behavior.
