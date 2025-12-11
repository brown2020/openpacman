import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { LEVELS } from "../levels/gameLevels";
import {
  getInitialDots,
  isValidMove,
  getNextPosition,
} from "../utils/gameUtils";
import {
  createInitialGhosts,
  updateGhostPosition,
  frightenGhosts,
  eatGhost,
  checkGhostCollision,
  getGhostEatScore,
  getPowerPellets,
} from "../utils/gameEngine";
import {
  INITIAL_POSITION,
  CELL_TYPES,
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
  GhostMode,
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
  powerPelletTimeoutId: NodeJS.Timeout | null;
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
  gameStateType: "READY",
  powerPelletActive: false,
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
      powerPelletTimeoutId: null,
      isTransitioning: false,
      lastMoveTime: 0,
      moveAccumulator: 0,

      startGame: (level = 0) => {
        const prev = get().gameState;
        const prevTimeoutId = get().powerPelletTimeoutId;
        const layout = LEVELS[level]?.layout || LEVELS[0].layout;
        const initialDots = getInitialDots(layout);
        const initialPowerPellets = getPowerPellets(layout);

        // Clear any existing power pellet timeout
        if (prevTimeoutId) {
          clearTimeout(prevTimeoutId);
        }

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
          powerPelletTimeoutId: null,
          isTransitioning: false,
          lastMoveTime: performance.now(),
          moveAccumulator: 0,
        });
      },

      setPacmanPos: (pos) =>
        set((s) => ({
          pacmanPrevPos: s.pacmanPos,
          pacmanPos: pos,
        })),

      setDirection: (dir) => set({ direction: dir }),

      setNextDirection: (dir) => set({ nextDirection: dir }),

      movePacman: () => {
        const { pacmanPos, direction, nextDirection, gameState } = get();
        const layout = LEVELS[gameState.level]?.layout || LEVELS[0].layout;

        // Try next direction first if set
        if (nextDirection) {
          const nextPos = getNextPosition(pacmanPos, nextDirection);
          if (isValidMove(nextPos, layout)) {
            set((s) => ({
              pacmanPrevPos: s.pacmanPos,
              pacmanPos: nextPos,
              direction: nextDirection,
              nextDirection: null,
            }));
            return true;
          }
        }

        // Otherwise continue in current direction
        const newPos = getNextPosition(pacmanPos, direction);
        if (isValidMove(newPos, layout)) {
          set((s) => ({
            pacmanPrevPos: s.pacmanPos,
            pacmanPos: newPos,
          }));
          return true;
        }

        return false;
      },

      updateGhosts: (deltaTime: number) => {
        const { ghosts, pacmanPos, direction, gameState } = get();
        if (!gameState.isPlaying || gameState.gameOver || gameState.gameWon)
          return;

        const layout = LEVELS[gameState.level]?.layout || LEVELS[0].layout;

        // Find Blinky's position for Inky's AI
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
          date: Date.now(),
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
            gameStateType: "GAME_OVER",
          },
          highScores: newHighScores,
        }));
      },

      collectDot: (dotPos: Position) => {
        const { dots, gameState } = get();
        const remainingDots = dots.filter(
          (dot) => dot.x !== dotPos.x || dot.y !== dotPos.y
        );

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
        const { powerPellets, ghosts, gameState, powerPelletTimeoutId } = get();
        const remainingPellets = powerPellets.filter(
          (p) => p.x !== pelletPos.x || p.y !== pelletPos.y
        );

        if (remainingPellets.length < powerPellets.length) {
          // Clear any existing power pellet timeout
          if (powerPelletTimeoutId) {
            clearTimeout(powerPelletTimeoutId);
          }

          const newScore = gameState.score + SCORE_POWER_PELLET;

          // Create new timeout for power pellet expiration
          const newTimeoutId = setTimeout(() => {
            set((s) => ({
              gameState: {
                ...s.gameState,
                powerPelletActive: false,
              },
              powerPelletTimeoutId: null,
            }));
          }, GHOST_FRIGHTENED_DURATION);

          set({
            powerPellets: remainingPellets,
            ghosts: frightenGhosts(ghosts),
            ghostsEatenInChain: 0,
            powerPelletTimeoutId: newTimeoutId,
            gameState: {
              ...gameState,
              score: newScore,
              powerPelletActive: true,
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
          // Eat the ghost
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

        // Pacman dies
        return { died: true, ateGhost: false, score: 0 };
      },

      updateGameState: (updater) =>
        set((s) => ({
          gameState: updater(s.gameState),
        })),

      resetEntitiesAfterDeath: () =>
        set(() => ({
          pacmanPos: INITIAL_POSITION,
          pacmanPrevPos: INITIAL_POSITION,
          direction: DIRECTIONS.RIGHT,
          nextDirection: null,
          ghosts: createInitialGhosts(),
          ghostsEatenInChain: 0,
        })),

      resetGame: () => {
        const { powerPelletTimeoutId } = get();
        if (powerPelletTimeoutId) {
          clearTimeout(powerPelletTimeoutId);
        }

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
          powerPelletTimeoutId: null,
          isTransitioning: false,
        });
      },

      togglePause: () => {
        set((s) => ({ isPaused: !s.isPaused }));
      },

      tick: (deltaTime: number) => {
        const state = get();
        if (
          !state.gameState.isPlaying ||
          state.gameState.gameOver ||
          state.gameState.gameWon ||
          state.isPaused
        )
          return;

        // Update ghosts with delta time
        state.updateGhosts(deltaTime);
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
