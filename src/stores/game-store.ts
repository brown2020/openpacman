import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { LEVELS, getLayout, getLevelConfig } from "../levels/gameLevels";
import {
  getInitialDots,
  isValidMove,
  getNextPosition,
  getPowerPellets,
  wrapTunnel,
} from "../utils/gameUtils";
import {
  createInitialGhosts,
  updateGhostPosition,
  frightenGhosts,
  eatGhost,
  checkGhostCollision,
  getGhostEatScore,
  reverseGhostDirections,
  getGhostSpeed,
} from "../utils/gameEngine";
import { removeAtPosition } from "../utils/position";
import {
  PACMAN_START_POSITION,
  SCORE_DOT,
  SCORE_POWER_PELLET,
  SCORE_EXTRA_LIFE_THRESHOLD,
  DIRECTIONS,
  getModeTiming,
  FRUIT_SPAWN_DOT_COUNT_1,
  FRUIT_SPAWN_DOT_COUNT_2,
  FRUIT_VISIBLE_DURATION,
  FRUIT_SPAWN_POSITION,
  READY_SCREEN_DURATION,
} from "../constants/gameConstants";
import type {
  Direction,
  GameScore,
  GameState,
  Ghost,
  Position,
  FruitType,
  LevelConfig,
  ScorePopup,
} from "../types/types";
import { GameMode } from "../types/types";

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
  levelConfig: LevelConfig;
  scorePopups: ScorePopup[];
  wakaAlternate: boolean; // For alternating waka sound

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
  collectFruit: () => boolean;
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
  finishReady: () => void;
  addScorePopup: (position: Position, points: number) => void;
  updateScorePopups: (deltaTime: number) => void;
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
  // Scatter/Chase mode
  gameMode: GameMode.SCATTER,
  modeTimeRemaining: 7000, // Start with scatter
  modeIndex: 0,
  // Fruit
  fruit: null,
  fruitEaten: [],
  // Ready screen
  isReady: true,
  readyTimeRemaining: READY_SCREEN_DURATION,
  // Global dot counter
  globalDotCounter: 0,
  globalDotCounterEnabled: false,
  // Extra life
  extraLifeAwarded: false,
});

const getDefaultLevelConfig = (): LevelConfig => ({
  layout: [],
  ghostSpeed: 0.75,
  pacmanSpeed: 0.80,
  frightenedDuration: 6000,
  frightenedSpeed: 0.50,
  tunnelSpeed: 0.40,
  elroyDotsLeft1: 20,
  elroySpeed1: 0.80,
  elroyDotsLeft2: 10,
  elroySpeed2: 0.85,
  fruitType: 'cherry' as FruitType,
  fruitPoints: 100,
});

export const useGameStore = create<GameStoreState>()(
  persist(
    (set, get) => ({
      gameState: createInitialGameState(),
      pacmanPos: PACMAN_START_POSITION,
      pacmanPrevPos: PACMAN_START_POSITION,
      direction: DIRECTIONS.LEFT,
      nextDirection: null,
      dots: [],
      powerPellets: [],
      ghosts: [],
      mouthOpen: true,
      highScores: [],
      ghostsEatenInChain: 0,
      isPaused: false,
      isTransitioning: false,
      levelConfig: getDefaultLevelConfig(),
      scorePopups: [],
      wakaAlternate: false,
      lastMoveTime: 0,
      moveAccumulator: 0,

      startGame: (level = 0) => {
        const prev = get().gameState;
        const layout = getLayout(level);
        const config = getLevelConfig(level);
        const initialDots = getInitialDots(layout);
        const initialPowerPellets = getPowerPellets(layout);
        const modeTiming = getModeTiming(level);

        set({
          gameState: {
            ...createInitialGameState(),
            isPlaying: true,
            level,
            score: level === 0 ? 0 : prev.score,
            highScore: prev.highScore,
            totalDots: initialDots.length + initialPowerPellets.length,
            // Start in scatter mode
            gameMode: GameMode.SCATTER,
            modeTimeRemaining: modeTiming.scatter[0],
            modeIndex: 0,
            // Ready screen
            isReady: true,
            readyTimeRemaining: READY_SCREEN_DURATION,
            // Preserve extra life status across levels
            extraLifeAwarded: level === 0 ? false : prev.extraLifeAwarded,
            // Preserve eaten fruits for display
            fruitEaten: level === 0 ? [] : prev.fruitEaten,
          },
          pacmanPos: PACMAN_START_POSITION,
          pacmanPrevPos: PACMAN_START_POSITION,
          direction: DIRECTIONS.LEFT,
          nextDirection: null,
          dots: initialDots,
          powerPellets: initialPowerPellets,
          ghosts: createInitialGhosts(),
          mouthOpen: true,
          ghostsEatenInChain: 0,
          isPaused: false,
          isTransitioning: false,
          levelConfig: config,
          scorePopups: [],
          wakaAlternate: false,
          lastMoveTime: performance.now(),
          moveAccumulator: 0,
        });
      },

      finishReady: () => {
        set((s) => ({
          gameState: {
            ...s.gameState,
            isReady: false,
            readyTimeRemaining: 0,
          },
        }));
      },

      setPacmanPos: (pos) =>
        set((s) => ({ pacmanPrevPos: s.pacmanPos, pacmanPos: wrapTunnel(pos) })),

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
              pacmanPos: wrapTunnel(turnPos),
              direction: nextDirection,
              nextDirection: null,
            }));
            return true;
          }

          // Pre-turn: Check if turn would be valid after moving forward
          const forwardPos = getNextPosition(pacmanPos, direction);
          if (isValidMove(forwardPos, layout)) {
            const turnFromForward = getNextPosition(forwardPos, nextDirection);
            if (isValidMove(turnFromForward, layout)) {
              set((s) => ({
                pacmanPrevPos: s.pacmanPos,
                pacmanPos: wrapTunnel(forwardPos),
              }));
              return true;
            }
          }
        }

        // Continue in current direction
        const newPos = getNextPosition(pacmanPos, direction);
        if (isValidMove(newPos, layout)) {
          set((s) => ({
            pacmanPrevPos: s.pacmanPos,
            pacmanPos: wrapTunnel(newPos),
          }));
          return true;
        }

        return false;
      },

      updateGhosts: (deltaTime: number) => {
        const { ghosts, pacmanPos, direction, gameState, levelConfig, dots, powerPellets } = get();
        if (!gameState.isPlaying || gameState.gameOver || gameState.gameWon || gameState.isReady)
          return;

        const layout = getLayout(gameState.level);
        const blinky = ghosts.find((g) => g.name === "BLINKY");
        const blinkyPos = blinky?.position || pacmanPos;
        const dotsRemaining = dots.length + powerPellets.length;

        const newGhosts = ghosts.map((ghost) => {
          // Calculate speed-adjusted delta time
          const ghostSpeed = getGhostSpeed(ghost, levelConfig, dotsRemaining);
          const adjustedDelta = deltaTime * ghostSpeed;

          return updateGhostPosition(
            ghost,
            pacmanPos,
            direction,
            layout,
            blinkyPos,
            adjustedDelta,
            gameState.gameMode,
            levelConfig,
            dotsRemaining
          );
        });

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
        const { dots, gameState, levelConfig, wakaAlternate } = get();
        const remainingDots = removeAtPosition(dots, dotPos);

        if (remainingDots.length < dots.length) {
          const newScore = gameState.score + SCORE_DOT;
          const newDotsEaten = gameState.dotsEaten + 1;

          // Check for fruit spawn (at 70 and 170 dots eaten)
          let newFruit = gameState.fruit;
          if (
            (newDotsEaten === FRUIT_SPAWN_DOT_COUNT_1 ||
              newDotsEaten === FRUIT_SPAWN_DOT_COUNT_2) &&
            !gameState.fruit
          ) {
            newFruit = {
              type: levelConfig.fruitType,
              position: FRUIT_SPAWN_POSITION,
              points: levelConfig.fruitPoints,
              visible: true,
              timeRemaining: FRUIT_VISIBLE_DURATION,
            };
          }

          // Check for extra life
          let newLives = gameState.lives;
          let extraLifeAwarded = gameState.extraLifeAwarded;
          if (!extraLifeAwarded && newScore >= SCORE_EXTRA_LIFE_THRESHOLD) {
            newLives = gameState.lives + 1;
            extraLifeAwarded = true;
          }

          // Increment global dot counter
          const newGlobalDotCounter = gameState.globalDotCounter + 1;

          set({
            dots: remainingDots,
            wakaAlternate: !wakaAlternate,
            gameState: {
              ...gameState,
              score: newScore,
              dotsEaten: newDotsEaten,
              highScore: Math.max(gameState.highScore, newScore),
              fruit: newFruit,
              lives: newLives,
              extraLifeAwarded,
              globalDotCounter: newGlobalDotCounter,
            },
          });
        }
      },

      collectPowerPellet: (pelletPos: Position) => {
        const { powerPellets, ghosts, gameState, levelConfig } = get();
        const remainingPellets = removeAtPosition(powerPellets, pelletPos);

        if (remainingPellets.length < powerPellets.length) {
          const newScore = gameState.score + SCORE_POWER_PELLET;
          const frightenedDuration = levelConfig.frightenedDuration;

          // Check for extra life
          let newLives = gameState.lives;
          let extraLifeAwarded = gameState.extraLifeAwarded;
          if (!extraLifeAwarded && newScore >= SCORE_EXTRA_LIFE_THRESHOLD) {
            newLives = gameState.lives + 1;
            extraLifeAwarded = true;
          }

          set({
            powerPellets: remainingPellets,
            ghosts: frightenGhosts(ghosts, frightenedDuration),
            ghostsEatenInChain: 0,
            gameState: {
              ...gameState,
              score: newScore,
              powerPelletActive: frightenedDuration > 0,
              powerPelletTimeRemaining: frightenedDuration,
              highScore: Math.max(gameState.highScore, newScore),
              lives: newLives,
              extraLifeAwarded,
            },
          });
        }
      },

      collectFruit: () => {
        const { gameState, pacmanPos } = get();
        const fruit = gameState.fruit;

        if (!fruit || !fruit.visible) return false;

        // Check if Pacman is at fruit position
        if (
          pacmanPos.x === fruit.position.x &&
          pacmanPos.y === fruit.position.y
        ) {
          const newScore = gameState.score + fruit.points;

          set((s) => ({
            gameState: {
              ...s.gameState,
              score: newScore,
              highScore: Math.max(s.gameState.highScore, newScore),
              fruit: null,
              fruitEaten: [...s.gameState.fruitEaten, fruit.type],
            },
          }));

          // Add score popup
          get().addScorePopup(fruit.position, fruit.points);
          return true;
        }

        return false;
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
          const newScore = gameState.score + score;

          set({
            ghosts: newGhosts,
            ghostsEatenInChain: ghostsEatenInChain + 1,
            gameState: {
              ...gameState,
              score: newScore,
              ghostsEaten: gameState.ghostsEaten + 1,
              highScore: Math.max(gameState.highScore, newScore),
            },
          });

          // Add score popup
          get().addScorePopup(pacmanPos, score);

          return { died: false, ateGhost: true, score };
        }

        return { died: true, ateGhost: false, score: 0 };
      },

      updateGameState: (updater) =>
        set((s) => ({ gameState: updater(s.gameState) })),

      resetEntitiesAfterDeath: () => {
        const { gameState } = get();
        set({
          pacmanPos: PACMAN_START_POSITION,
          pacmanPrevPos: PACMAN_START_POSITION,
          direction: DIRECTIONS.LEFT,
          nextDirection: null,
          ghosts: createInitialGhosts(),
          ghostsEatenInChain: 0,
          gameState: {
            ...gameState,
            // Reset to scatter mode
            gameMode: GameMode.SCATTER,
            modeTimeRemaining: getModeTiming(gameState.level).scatter[0],
            modeIndex: 0,
            // Enable global dot counter after death
            globalDotCounterEnabled: true,
            globalDotCounter: 0,
            // Brief ready state
            isReady: true,
            readyTimeRemaining: 2000, // Shorter ready after death
          },
        });
      },

      resetGame: () =>
        set({
          gameState: createInitialGameState(),
          pacmanPos: PACMAN_START_POSITION,
          pacmanPrevPos: PACMAN_START_POSITION,
          direction: DIRECTIONS.LEFT,
          nextDirection: null,
          dots: [],
          powerPellets: [],
          ghosts: [],
          isPaused: false,
          ghostsEatenInChain: 0,
          isTransitioning: false,
          scorePopups: [],
        }),

      togglePause: () => set((s) => ({ isPaused: !s.isPaused })),

      addScorePopup: (position: Position, points: number) => {
        set((s) => ({
          scorePopups: [
            ...s.scorePopups,
            { position, points, timeRemaining: 1000 },
          ],
        }));
      },

      updateScorePopups: (deltaTime: number) => {
        set((s) => ({
          scorePopups: s.scorePopups
            .map((popup) => ({
              ...popup,
              timeRemaining: popup.timeRemaining - deltaTime,
            }))
            .filter((popup) => popup.timeRemaining > 0),
        }));
      },

      tick: (deltaTime: number) => {
        const state = get();
        const { gameState, isPaused, ghosts } = state;

        if (
          !gameState.isPlaying ||
          gameState.gameOver ||
          gameState.gameWon ||
          isPaused
        ) {
          return;
        }

        // Handle ready screen countdown
        if (gameState.isReady) {
          const newReadyTime = gameState.readyTimeRemaining - deltaTime;
          if (newReadyTime <= 0) {
            set((s) => ({
              gameState: {
                ...s.gameState,
                isReady: false,
                readyTimeRemaining: 0,
              },
            }));
          } else {
            set((s) => ({
              gameState: {
                ...s.gameState,
                readyTimeRemaining: newReadyTime,
              },
            }));
          }
          return;
        }

        // Update score popups
        state.updateScorePopups(deltaTime);

        // Update power pellet timer
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

        // Update scatter/chase mode timer (only when not in power mode)
        if (!gameState.powerPelletActive) {
          const modeTiming = getModeTiming(gameState.level);
          const newModeTime = gameState.modeTimeRemaining - deltaTime;

          if (newModeTime <= 0) {
            // Switch modes
            const currentMode = gameState.gameMode;
            const currentIndex = gameState.modeIndex;
            const isScatter = currentMode === GameMode.SCATTER;

            // Get next mode duration
            const nextIndex = isScatter ? currentIndex : currentIndex + 1;
            const nextDurations = isScatter ? modeTiming.chase : modeTiming.scatter;
            const nextDuration = nextDurations[Math.min(nextIndex, nextDurations.length - 1)];

            // If infinite (chase forever), stay in chase
            if (nextDuration === Infinity) {
              set((s) => ({
                gameState: {
                  ...s.gameState,
                  gameMode: GameMode.CHASE,
                  modeTimeRemaining: Infinity,
                },
              }));
            } else {
              const newMode = isScatter ? GameMode.CHASE : GameMode.SCATTER;

              // Reverse ghost directions on mode change
              const reversedGhosts = reverseGhostDirections(ghosts);

              set((s) => ({
                ghosts: reversedGhosts,
                gameState: {
                  ...s.gameState,
                  gameMode: newMode,
                  modeTimeRemaining: nextDuration,
                  modeIndex: nextIndex,
                },
              }));
            }
          } else {
            set((s) => ({
              gameState: {
                ...s.gameState,
                modeTimeRemaining: newModeTime,
              },
            }));
          }
        }

        // Update fruit timer
        if (gameState.fruit && gameState.fruit.visible) {
          const newFruitTime = gameState.fruit.timeRemaining - deltaTime;
          if (newFruitTime <= 0) {
            set((s) => ({
              gameState: {
                ...s.gameState,
                fruit: null,
              },
            }));
          } else {
            set((s) => ({
              gameState: {
                ...s.gameState,
                fruit: {
                  ...s.gameState.fruit!,
                  timeRemaining: newFruitTime,
                },
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
  isReady: s.gameState.isReady,
  gameMode: s.gameState.gameMode,
});

export const selectEntities = (s: GameStoreState) => ({
  pacmanPos: s.pacmanPos,
  dots: s.dots,
  powerPellets: s.powerPellets,
  ghosts: s.ghosts,
  fruit: s.gameState.fruit,
  scorePopups: s.scorePopups,
});

export const selectActions = (s: GameStoreState) => ({
  movePacman: s.movePacman,
  updateGhosts: s.updateGhosts,
  toggleMouth: s.toggleMouth,
  collectDot: s.collectDot,
  collectPowerPellet: s.collectPowerPellet,
  collectFruit: s.collectFruit,
  handleGhostCollision: s.handleGhostCollision,
  setGameOver: s.setGameOver,
  updateGameState: s.updateGameState,
  resetEntitiesAfterDeath: s.resetEntitiesAfterDeath,
  startGame: s.startGame,
  tick: s.tick,
  finishReady: s.finishReady,
});

export const selectUI = (s: GameStoreState) => ({
  score: s.gameState.score,
  highScore: s.gameState.highScore,
  lives: s.gameState.lives,
  level: s.gameState.level,
  fruitEaten: s.gameState.fruitEaten,
  powerPelletActive: s.gameState.powerPelletActive,
  powerPelletTimeRemaining: s.gameState.powerPelletTimeRemaining,
});

/**
 * Check if game is in a playable state (not paused, not over, not won, not ready)
 */
export const selectCanPlay = (s: GameStoreState): boolean =>
  s.gameState.isPlaying &&
  !s.gameState.gameOver &&
  !s.gameState.gameWon &&
  !s.isPaused &&
  !s.gameState.isReady;
