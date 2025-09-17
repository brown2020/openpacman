import { create } from "zustand";
import { LEVELS } from "../levels/gameLevels";
import { getInitialDots, getInitialGhosts } from "../utils/gameUtils";
import { INITIAL_POSITION } from "../constants/gameConstants";
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
  setGhosts: (ghosts: Ghost[]) => void;
  setDots: (dots: Position[]) => void;
  toggleMouth: () => void;
  setHighScores: (scores: GameScore[]) => void;
  setGameOver: () => void;
  incrementScoreForDot: () => void;
  updateGameState: (updater: (s: GameState) => GameState) => void;
  resetEntitiesAfterDeath: () => void;
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
  totalDots: getInitialDots(LEVELS[0].layout).length,
  ghostsEaten: 0,
});

export const useGameStore = create<GameStoreState>((set, get) => ({
  gameState: createInitialGameState(),
  pacmanPos: INITIAL_POSITION,
  direction: "right",
  dots: [],
  ghosts: [],
  mouthOpen: true,
  highScores: [],

  startGame: (level = 0) => {
    const prev = get().gameState;
    const totalDots = getInitialDots(LEVELS[level].layout).length;
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
      dots: getInitialDots(LEVELS[level].layout),
      ghosts: getInitialGhosts(),
      mouthOpen: true,
    });
  },

  setPacmanPos: (pos) => set({ pacmanPos: pos }),
  setDirection: (dir) => set({ direction: dir }),
  setGhosts: (ghosts) => set({ ghosts }),
  setDots: (dots) => set({ dots }),
  toggleMouth: () => set((s) => ({ mouthOpen: !s.mouthOpen })),
  setHighScores: (scores) => set({ highScores: scores }),
  setGameOver: () =>
    set((s) => ({
      gameState: {
        ...s.gameState,
        isPlaying: false,
        gameOver: true,
        gameStateType: "GAME_OVER",
      },
    })),
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
}));
