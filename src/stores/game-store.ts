import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { LEVELS } from "../levels/gameLevels";
import { getInitialDots, getInitialGhosts, isValidMove } from "../utils/gameUtils";
import { INITIAL_POSITION, GHOST_NAMES, CELL_TYPES } from "../constants/gameConstants";
import type {
  Direction,
  GameScore,
  GameState,
  Ghost,
  Position,
} from "../types/types";

export interface GameStoreState {
  gameState: GameState;
  pacmanPos: Position;
  direction: Direction;
  dots: Position[];
  ghosts: Ghost[];
  mouthOpen: boolean;
  highScores: GameScore[];

  // actions
  startGame: (level?: number) => void;
  setPacmanPos: (pos: Position) => void;
  setDirection: (dir: Direction) => void;
  moveGhosts: () => void;
  setDots: (dots: Position[]) => void;
  toggleMouth: () => void;
  setHighScores: (scores: GameScore[]) => void;
  setGameOver: () => void;
  incrementScoreForDot: () => void;
  updateGameState: (updater: (s: GameState) => GameState) => void;
  resetEntitiesAfterDeath: () => void;
  resetGame: () => void;
}

const createInitialGameState = (): GameState => ({
  isPlaying: false,
  gameOver: false,
  gameWon: false,
  level: 0,
  score: 0,
  highScore: 0,
  lives: 3,
  paused: false,
  gameStateType: "READY",
  powerPelletActive: false,
  dotsEaten: 0,
  totalDots: 0, // Initialize to 0, update on start
  ghostsEaten: 0,
});

export const useGameStore = create<GameStoreState>()(
  persist(
    (set, get) => ({
      gameState: createInitialGameState(),
      pacmanPos: INITIAL_POSITION,
      direction: "right",
      dots: [],
      ghosts: [],
      mouthOpen: true,
      highScores: [],

      startGame: (level = 0) => {
        const prev = get().gameState;
        const layout = LEVELS[level]?.layout || LEVELS[0].layout;
        const totalDots = getInitialDots(layout).length;
        
        set({
          gameState: {
            ...createInitialGameState(),
            isPlaying: true,
            level,
            score: level === 0 ? 0 : prev.score,
            highScore: prev.highScore,
            totalDots,
          },
          pacmanPos: INITIAL_POSITION,
          direction: "right",
          dots: getInitialDots(layout),
          ghosts: getInitialGhosts(),
          mouthOpen: true,
        });
      },

      setPacmanPos: (pos) => set({ pacmanPos: pos }),
      
      setDirection: (dir) => set({ direction: dir }),
      
      moveGhosts: () => {
        const { ghosts, pacmanPos, gameState } = get();
        if (!gameState.isPlaying || gameState.gameOver || gameState.gameWon) return;

        const currentLevelLayout = LEVELS[gameState.level].layout;

        const newGhosts = ghosts.map((ghost) => {
          const dx = pacmanPos.x - ghost.position.x;
          const dy = pacmanPos.y - ghost.position.y;

          const newPos = { ...ghost.position };

          // Simple AI: Random or Chase
          // Ideally this should be in gameUtils using getGhostTarget
          if (Math.random() < 0.8) {
            if (Math.abs(dx) > Math.abs(dy)) {
              newPos.x += Math.sign(dx);
            } else {
              newPos.y += Math.sign(dy);
            }
          } else {
            const directions = [
              { x: 1, y: 0 },
              { x: -1, y: 0 },
              { x: 0, y: 1 },
              { x: 0, y: -1 },
            ];
            const randomDir = directions[Math.floor(Math.random() * directions.length)];
            newPos.x += randomDir.x;
            newPos.y += randomDir.y;
          }

          if (isValidMove(newPos, currentLevelLayout)) {
             // If valid move, update ghost
             // Note: Need to handle walls properly.
             // This simple logic might get ghosts stuck. 
             // Refactoring to more robust pathfinding later would be good but simple check is ok for now.
             return { ...ghost, position: newPos };
          }
          return ghost;
        });

        set({ ghosts: newGhosts });
      },

      setDots: (dots) => set({ dots }),
      
      toggleMouth: () => set((s) => ({ mouthOpen: !s.mouthOpen })),
      
      setHighScores: (scores) => set({ highScores: scores }),
      
      setGameOver: () => {
         const { gameState, highScores } = get();
         // Update high scores on game over
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
          highScores: newHighScores
        }));
      },
      
      incrementScoreForDot: () =>
        set((s) => {
          const score = s.gameState.score + 10;
          return {
            gameState: {
              ...s.gameState,
              score,
              dotsEaten: s.gameState.dotsEaten + 1,
              highScore: Math.max(s.gameState.highScore, score),
            },
          };
        }),
        
      updateGameState: (updater) =>
        set((s) => ({
          gameState: updater(s.gameState),
        })),
        
      resetEntitiesAfterDeath: () =>
        set(() => ({
          pacmanPos: INITIAL_POSITION,
          ghosts: getInitialGhosts(),
        })),

      resetGame: () => set({
          gameState: createInitialGameState(),
          pacmanPos: INITIAL_POSITION,
          dots: [],
          ghosts: [],
      })
    }),
    {
      name: "pacman-storage", // unique name
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
      partialize: (state) => ({ highScores: state.highScores }), // Only persist highScores
    }
  )
);
