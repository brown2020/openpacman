# Repository Guidance

## Project Snapshot

OpenPacman is a Next.js App Router browser game implemented in TypeScript. The
game UI is client-side only: `src/app/page.tsx` dynamically imports
`src/components/PacmanGame.tsx` with server-side rendering disabled. Gameplay
state lives in `src/stores/game-store.ts`, the main animation loop is in
`src/hooks/useGameLoop.ts`, input handling is in `src/hooks/useInput.ts`, sound
is synthesized through `src/utils/soundManager.ts`, and movement, collision, and
ghost behavior are split across `src/utils/gameUtils.ts`,
`src/utils/gameEngine.ts`, and `src/utils/pathfinding.ts`.

## Commands

Use the project scripts from `package.json`:

```bash
npm run dev
npm run build
npm run start
npm run lint
```

There is no test script configured. For code changes, run `npm run lint` first,
then `npm run build` when behavior, rendering, types, or dependency surfaces
change.

## Architecture Notes

- `src/app/layout.tsx` owns metadata, viewport settings, local Geist fonts, and
  global CSS import.
- `src/components/PacmanGame.tsx` composes the HUD, board, start screen, input,
  and game loop hooks.
- `src/components/board/*` renders board layers. Keep rendering concerns there
  rather than pushing DOM details into game utilities.
- `src/stores/game-store.ts` is the central mutation boundary. Keep persistence,
  score/life/level state, entity state, and game actions coordinated there.
- `src/hooks/useGameLoop.ts` owns requestAnimationFrame timing, sound effects,
  dot/power-pellet/fruit collection, collision handling, and level transitions.
- `src/utils/gameEngine.ts` owns ghost targeting, modes, collision behavior, and
  score calculations.
- `src/utils/gameUtils.ts`, `src/utils/position.ts`, and
  `src/utils/pathfinding.ts` should remain framework-free helpers.
- `src/constants/gameConstants.ts`, `src/levels/gameLevels.ts`, and
  `src/types/types.ts` define shared data contracts and should not import React.

## Conventions

- Keep React components functional and typed.
- Keep client-only browser APIs behind client components/hooks.
- Prefer the `@/*` path alias for app-level imports when it improves clarity;
  local sibling imports are already common in source files.
- Keep gameplay behavior changes separate from cleanup or dependency updates.
- Preserve the current public gameplay model unless a change is explicitly
  recorded as a behavior fix.
- Use `rg` for code search and prefer small, verifiable changes.

## Risk Areas

- `src/hooks/useGameLoop.ts` mixes timing, side effects, collection, collision,
  and level transition behavior; changes there should be checked carefully.
- `src/stores/game-store.ts` is broad and stateful. Confirm selector behavior,
  persistence, and action ordering when editing it.
- `src/utils/gameEngine.ts` and `src/utils/pathfinding.ts` determine ghost
  movement. Verify gameplay assumptions with focused inspection and build/lint
  checks.
- Web Audio startup and cleanup are browser-lifecycle sensitive.
- No automated tests are configured, so lint/build are the current machine
  gates.
