# Architecture

## Map

```
Browser
  └─ Next.js App Router (static /, /about)
       └─ page.tsx (client Home; dynamic PacmanGame ssr:false)
            ├─ StartScreen / GameBoard / HUD
            ├─ useGameLoop / useInput / useSound
            └─ Zustand game-store
                 ├─ utils/gameEngine, gameUtils, pathfinding, position
                 ├─ soundManager (Web Audio)
                 └─ localStorage high scores
```

## Authority per write

| Path | Fact | Writer | Cache / durability |
| --- | --- | --- | --- |
| start_game | isPlaying, entities, level | `startGame` in game-store | in-memory |
| move_pacman | pacmanPos, direction | useInput → store + useGameLoop tick | in-memory |
| collect_dot | dots[], score | game-store / game loop | in-memory |
| eat_ghost | ghosts, score, popups | handleGhostCollision | in-memory |
| pause_game | isPaused | togglePause | in-memory |
| persist_high_score | highScores[] | game-store on game over | localStorage only |
| level_clear | level++, maze reset | game loop / store | in-memory |

No server cache. Reload restores high scores from localStorage; live game state is discarded.

## Server / client

All interactive gameplay is client (`"use client"` / dynamic ssr:false). `/about` is a Server Component page. No route handlers or server actions. Unauthorized `/api/*` returns Next 404 — there is no privileged mutation surface.

## Change exercises

1. **Data:** change `SCORE_DOT` in `gameConstants.ts` — scoring helpers and any score unit tests update; UI stays the same.
2. **Access:** adding a future `/api/scores` would require a new route file and explicit auth; today access is "everyone mutates local state; nobody mutates server state" proven by absent routes + 404.
