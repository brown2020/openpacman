# OpenPacman spec

Browser arcade game. All gameplay runs in the client. This file describes the app as built.

## Product

The player clears a maze of dots and power pellets while four ghosts chase. Eating a power pellet frightens the ghosts so they can be eaten. Fruit appears twice per level. Clearing the maze advances the level. The game does not end in a victory state; after the authored level table, the last config repeats. Losing all lives ends the run and can record a local high score.

## Routes

| Path | Role |
| --- | --- |
| `/` | Game. `page.tsx` dynamically imports `PacmanGame` with server rendering off. |
| `/about` | Static about page. Server Component. |
| `/api/*` | Not implemented. No route handlers and no server actions. |

## Player flow

1. Title screen shows the last score (after a game over) and the local high-score list. Start begins level 1 (store level index 0) with 3 lives.
2. A ready period (4 seconds) plays before movement. Pause is available from the keyboard (P or Esc) and from a button on narrow screens. Touch swipes set direction.
3. Pac-Man starts at tile (13, 23), facing left. Dots are 10 points. The four power pellets are 50 points and frighten ghosts for that level's duration.
4. While frightened, eating a ghost scores 200, then 400, 800, and 1600 in the same chain. Eaten ghosts return through the house.
5. Fruit spawns at tile (13, 17) after 70 dots and again after 170 dots, and stays about 9.5 seconds. Points follow the level config (cherry 100 through key 5000).
6. One extra life is awarded the first time the score reaches 10,000, from any source.
7. Contact with a chase or scatter ghost costs a life and resets the actors. The last life ends the game.
8. When no dots and no power pellets remain, the next level starts. Lives carry over. A brand-new game (`startGame(0)`) restores 3 lives.
9. The top five scores are kept in `localStorage`. Corrupt saved rows are dropped on load. A reload does not restore an in-progress game.

## Ghosts

| Ghost | Color | Chase idea | House release |
| --- | --- | --- | --- |
| Blinky | Red | Pac-Man's tile. Speeds up (Cruise Elroy) as dots run out. | Starts outside |
| Pinky | Pink | Four tiles ahead of Pac-Man, with the original up-direction offset | Leaves immediately |
| Inky | Cyan | Vector from Blinky through a point ahead of Pac-Man | After 30 dots |
| Clyde | Orange | Chases when far, scatters when within 8 tiles | After 60 dots |

Modes are chase, scatter, frightened, eaten, and house. Scatter and chase alternate on the level's timer, then chase continues. After a death, Pinky, Inky, and Clyde use the global dot counter (7, 17, and 32) before they leave the house. Chase and scatter pick a direction at intersections. Frightened movement is a random legal turn. Eaten ghosts path back with A*.

## Levels

`LEVELS` has 13 entries. They share one 28×31 maze and change ghost speed, Pac-Man speed, frightened duration, tunnel speed, Elroy thresholds, and fruit. `getLevelConfig` returns the last entry (key, 5000 points, 1 second frightened) for every index past the table.

Cell values: 0 dot, 1 wall, 2 empty, 3 power pellet, 4 ghost house, 5 tunnel, 6 ghost door.

## Presentation

- HUD: 1UP, high score, level number, extra-life icons, recent fruit, progress bar.
- The POWER MODE badge keeps its slot while power mode is off so the centered board does not jump.
- Board layers draw walls, dots, entities, fruit, score popups, and overlays (ready, pause, game over, power-mode tint).
- Fonts are local: Press Start 2P, VT323, and Geist. No remote font stylesheet.
- Sounds are synthesized in `SoundManager`. A suspended `AudioContext` is resumed when the browser allows it; a failed resume is ignored.

## Security and configuration

- `getSecurityHeaders` sets Content-Security-Policy and `X-Content-Type-Options: nosniff`. Production script-src does not include `unsafe-eval`. Development does, so the Next dev server can run. `frame-ancestors` is `'none'`.
- No environment variables are required. No secrets, Firebase rules, or payment config live in this repo.
- No AI model IDs or provider SDKs are used.

## Validation

CI on Node.js 22 runs lint, `tsc --noEmit`, `node --import tsx --test src/**/*.test.ts`, and `next build`.

## Out of scope

Accounts, multiplayer, server scoreboards, Firebase, Stripe, and any AI model.
