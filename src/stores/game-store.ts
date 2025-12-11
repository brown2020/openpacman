import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { LEVELS, getLayout } from "../levels/gameLevels";
import {
  getInitialDots,
  isValidMove,
  getNextPosition,
  getPowerPellets,
} from "../utils/gameUtils";
import {
  createInitialGhosts,
  updateGhostPosition,
  frightenGhosts,
  eatGhost,
  checkGhostCollision,
  getGhostEatScore,
} from "../utils/gameEngine";
import { removeAtPosition } from "../utils/position";
import {
  INITIAL_POSITION,
  SCORE_DOT,
  SCORE_POWER_PELLET,
  GHOST_FRIGHTENED_DURATION,
  DIRECTIONS,
} from "../constants/gameConstants";
import type {
  Direction,
  GameScore,
  GameState,
  Ghost,
  Position,
} from "../types/types";

export interface GameStoreState {
  // Game state
  gameState: GameState;
  pacmanPos: Position;
  pacmanPrevPos: Position;
  direction: Direction;
  nextDirection: Direction | null;
  dots: Position[];
  powerPellets: Position[];
  ghosts: Ghost[];
  mouthOpen: boolean;
  highScores: GameScore[];
  ghostsEatenInChain: number;
  isPaused: boolean;
  isTransitioning: boolean;

  // Timing
  lastMoveTime: number;
  moveAccumulator: number;

  // Actions
  startGame: (level?: number) => void;
  setPacmanPos: (pos: Position) => void;
  setDirection: (dir: Direction) => void;
  setNextDirection: (dir: Direction | null) => void;
  updateGhosts: (deltaTime: number) => void;
  setDots: (dots: Position[]) => void;
  toggleMouth: () => void;
  setHighScores: (scores: GameScore[]) => void;
  setGameOver: () => void;
  collectDot: (dotPos: Position) => void;
  collectPowerPellet: (pelletPos: Position) => void;
  handleGhostCollision: () => {
    died: boolean;
    ateGhost: boolean;
    score: number;
  };
  updateGameState: (updater: (s: GameState) => GameState) => void;
  resetEntitiesAfterDeath: () => void;
  resetGame: () => void;
  togglePause: () => void;
  movePacman: () => boolean;
  tick: (deltaTime: number) => void;
}

const createInitialGameState = (): GameState => ({
  isPlaying: false,
  gameOver: false,
  gameWon: false,
  level: 0,
  score: 0,
  highScore: 0,
  lives: 3,
  powerPelletActive: false,
  powerPelletTimeRemaining: 0,
  dotsEaten: 0,
  totalDots: 0,
  ghostsEaten: 0,
});

export const useGameStore = create<GameStoreState>()(
  persist(
    (set, get) => ({
      gameState: createInitialGameState(),
      pacmanPos: INITIAL_POSITION,
      pacmanPrevPos: INITIAL_POSITION,
      direction: DIRECTIONS.RIGHT,
      nextDirection: null,
      dots: [],
      powerPellets: [],
      ghosts: [],
      mouthOpen: true,
      highScores: [],
      ghostsEatenInChain: 0,
      isPaused: false,
      isTransitioning: false,
      lastMoveTime: 0,
      moveAccumulator: 0,

      startGame: (level = 0) => {
        const prev = get().gameState;
        const layout = getLayout(level);
        const initialDots = getInitialDots(layout);
        const initialPowerPellets = getPowerPellets(layout);

        set({
          gameState: {
            ...createInitialGameState(),
            isPlaying: true,
            level,
            score: level === 0 ? 0 : prev.score,
            highScore: prev.highScore,
            totalDots: initialDots.length + initialPowerPellets.length,
          },
          pacmanPos: INITIAL_POSITION,
          pacmanPrevPos: INITIAL_POSITION,
          direction: DIRECTIONS.RIGHT,
          nextDirection: null,
          dots: initialDots,
          powerPellets: initialPowerPellets,
          ghosts: createInitialGhosts(),
          mouthOpen: true,
          ghostsEatenInChain: 0,
          isPaused: false,
          isTransitioning: false,
          lastMoveTime: performance.now(),
          moveAccumulator: 0,
        });
      },

      setPacmanPos: (pos) =>
        set((s) => ({ pacmanPrevPos: s.pacmanPos, pacmanPos: pos })),

      setDirection: (dir) => set({ direction: dir }),

      setNextDirection: (dir) => set({ nextDirection: dir }),

      movePacman: () => {
        const { pacmanPos, direction, nextDirection, gameState } = get();
        const layout = getLayout(gameState.level);

        // Try queued direction first if set
        if (nextDirection) {
          const turnPos = getNextPosition(pacmanPos, nextDirection);
          if (isValidMove(turnPos, layout)) {
            set((s) => ({
              pacmanPrevPos: s.pacmanPos,
              pacmanPos: turnPos,
              direction: nextDirection,
              nextDirection: null,
            }));
            return true;
          }

          // Pre-turn: Check if turn would be valid after moving forward
          // This allows pressing direction slightly early
          const forwardPos = getNextPosition(pacmanPos, direction);
          if (isValidMove(forwardPos, layout)) {
            const turnFromForward = getNextPosition(forwardPos, nextDirection);
            if (isValidMove(turnFromForward, layout)) {
              // Move forward - turn will execute next tick
              set((s) => ({
                pacmanPrevPos: s.pacmanPos,
                pacmanPos: forwardPos,
              }));
              return true;
            }
          }
        }

        // Continue in current direction
        const newPos = getNextPosition(pacmanPos, direction);
        if (isValidMove(newPos, layout)) {
          set((s) => ({ pacmanPrevPos: s.pacmanPos, pacmanPos: newPos }));
          return true;
        }

        return false;
      },

      updateGhosts: (deltaTime: number) => {
        const { ghosts, pacmanPos, direction, gameState } = get();
        if (!gameState.isPlaying || gameState.gameOver || gameState.gameWon)
          return;

        const layout = getLayout(gameState.level);
        const blinky = ghosts.find((g) => g.name === "BLINKY");
        const blinkyPos = blinky?.position || pacmanPos;

        const newGhosts = ghosts.map((ghost) =>
          updateGhostPosition(
            ghost,
            pacmanPos,
            direction,
            layout,
            blinkyPos,
            deltaTime
          )
        );

        set({ ghosts: newGhosts });
      },

      setDots: (dots) => set({ dots }),

      toggleMouth: () => set((s) => ({ mouthOpen: !s.mouthOpen })),

      setHighScores: (scores) => set({ highScores: scores }),

      setGameOver: () => {
        const { gameState, highScores } = get();

        const newScore: GameScore = {
          score: gameState.score,
          level: gameState.level,
          timestamp: Date.now(),
          completion: ((gameState.level + 1) / LEVELS.length) * 100,
          ghostsEaten: gameState.ghostsEaten,
        };

        const newHighScores = [...highScores, newScore]
          .sort((a, b) => b.score - a.score)
          .slice(0, 5);

        set((s) => ({
          gameState: {
            ...s.gameState,
            isPlaying: false,
            gameOver: true,
          },
          highScores: newHighScores,
        }));
      },

      collectDot: (dotPos: Position) => {
        const { dots, gameState } = get();
        const remainingDots = removeAtPosition(dots, dotPos);

        if (remainingDots.length < dots.length) {
          const newScore = gameState.score + SCORE_DOT;
          set({
            dots: remainingDots,
            gameState: {
              ...gameState,
              score: newScore,
              dotsEaten: gameState.dotsEaten + 1,
              highScore: Math.max(gameState.highScore, newScore),
            },
          });
        }
      },

      collectPowerPellet: (pelletPos: Position) => {
        const { powerPellets, ghosts, gameState } = get();
        const remainingPellets = removeAtPosition(powerPellets, pelletPos);

        if (remainingPellets.length < powerPellets.length) {
          const newScore = gameState.score + SCORE_POWER_PELLET;

          set({
            powerPellets: remainingPellets,
            ghosts: frightenGhosts(ghosts),
            ghostsEatenInChain: 0,
            gameState: {
              ...gameState,
              score: newScore,
              powerPelletActive: true,
              powerPelletTimeRemaining: GHOST_FRIGHTENED_DURATION,
              highScore: Math.max(gameState.highScore, newScore),
            },
          });
        }
      },

      handleGhostCollision: () => {
        const { pacmanPos, ghosts, gameState, ghostsEatenInChain } = get();
        const collision = checkGhostCollision(pacmanPos, ghosts);

        if (!collision.collision || !collision.ghost) {
          return { died: false, ateGhost: false, score: 0 };
        }

        if (collision.canEat) {
          const score = getGhostEatScore(ghostsEatenInChain);
          const newGhosts = eatGhost(ghosts, collision.ghost);

          set({
            ghosts: newGhosts,
            ghostsEatenInChain: ghostsEatenInChain + 1,
            gameState: {
              ...gameState,
              score: gameState.score + score,
              ghostsEaten: gameState.ghostsEaten + 1,
              highScore: Math.max(gameState.highScore, gameState.score + score),
            },
          });

          return { died: false, ateGhost: true, score };
        }

        return { died: true, ateGhost: false, score: 0 };
      },

      updateGameState: (updater) =>
        set((s) => ({ gameState: updater(s.gameState) })),

      resetEntitiesAfterDeath: () =>
        set({
          pacmanPos: INITIAL_POSITION,
          pacmanPrevPos: INITIAL_POSITION,
          direction: DIRECTIONS.RIGHT,
          nextDirection: null,
          ghosts: createInitialGhosts(),
          ghostsEatenInChain: 0,
        }),

      resetGame: () =>
        set({
          gameState: createInitialGameState(),
          pacmanPos: INITIAL_POSITION,
          pacmanPrevPos: INITIAL_POSITION,
          direction: DIRECTIONS.RIGHT,
          nextDirection: null,
          dots: [],
          powerPellets: [],
          ghosts: [],
          isPaused: false,
          ghostsEatenInChain: 0,
          isTransitioning: false,
        }),

      togglePause: () => set((s) => ({ isPaused: !s.isPaused })),

      tick: (deltaTime: number) => {
        const state = get();
        const { gameState, isPaused } = state;

        if (
          !gameState.isPlaying ||
          gameState.gameOver ||
          gameState.gameWon ||
          isPaused
        ) {
          return;
        }

        // Update power pellet timer only - ghost updates are handled by game loop
        if (
          gameState.powerPelletActive &&
          gameState.powerPelletTimeRemaining > 0
        ) {
          const remaining = gameState.powerPelletTimeRemaining - deltaTime;
          if (remaining <= 0) {
            set((s) => ({
              gameState: {
                ...s.gameState,
                powerPelletActive: false,
                powerPelletTimeRemaining: 0,
              },
            }));
          } else {
            set((s) => ({
              gameState: {
                ...s.gameState,
                powerPelletTimeRemaining: remaining,
              },
            }));
          }
        }
      },
    }),
    {
      name: "pacman-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        highScores: state.highScores,
        gameState: { highScore: state.gameState.highScore },
      }),
    }
  )
);

// Selector helpers for batched access
export const selectGameplay = (s: GameStoreState) => ({
  isPlaying: s.gameState.isPlaying,
  isPaused: s.isPaused,
  isTransitioning: s.isTransitioning,
  gameOver: s.gameState.gameOver,
  gameWon: s.gameState.gameWon,
  level: s.gameState.level,
});

export const selectEntities = (s: GameStoreState) => ({
  pacmanPos: s.pacmanPos,
  dots: s.dots,
  powerPellets: s.powerPellets,
  ghosts: s.ghosts,
});

export const selectActions = (s: GameStoreState) => ({
  movePacman: s.movePacman,
  updateGhosts: s.updateGhosts,
  toggleMouth: s.toggleMouth,
  collectDot: s.collectDot,
  collectPowerPellet: s.collectPowerPellet,
  handleGhostCollision: s.handleGhostCollision,
  setGameOver: s.setGameOver,
  updateGameState: s.updateGameState,
  resetEntitiesAfterDeath: s.resetEntitiesAfterDeath,
  startGame: s.startGame,
  tick: s.tick,
});

/**
 * Check if game is in a playable state (not paused, not over, not won)
 */
export const selectCanPlay = (s: GameStoreState): boolean =>
  s.gameState.isPlaying &&
  !s.gameState.gameOver &&
  !s.gameState.gameWon &&
  !s.isPaused;
