// types/types.ts
import {
  DIRECTIONS,
  CELL_TYPES,
  GHOST_NAMES,
  FRUIT_TYPES,
} from "../constants/gameConstants";

// Basic types derived from constants
export type CellType = (typeof CELL_TYPES)[keyof typeof CELL_TYPES];
export type Direction = (typeof DIRECTIONS)[keyof typeof DIRECTIONS];
export type GhostName = (typeof GHOST_NAMES)[keyof typeof GHOST_NAMES];
export type FruitType = (typeof FRUIT_TYPES)[keyof typeof FRUIT_TYPES];

// Position
export interface Position {
  x: number;
  y: number;
}

// High Score Entry
export interface GameScore {
  score: number;
  level: number;
  timestamp: number;
  completion: number;
  ghostsEaten: number;
}

// Ghost Modes
export enum GhostMode {
  CHASE = "CHASE",
  SCATTER = "SCATTER",
  FRIGHTENED = "FRIGHTENED",
  EATEN = "EATEN",
  HOUSE = "HOUSE",
}

// Game Mode for scatter/chase alternation
export enum GameMode {
  SCATTER = "SCATTER",
  CHASE = "CHASE",
}

// Ghost entity
export interface Ghost {
  position: Position;
  previousPosition: Position;
  color: string;
  name: GhostName;
  mode: GhostMode;
  speed: number;
  targetPosition: Position;
  direction: Direction;
  isMoving: boolean;
  frightenedTimeLeft?: number;
  houseTimeLeft?: number;
  dotCounter: number; // For dot-based release from house
  isElroy: boolean; // Blinky's "Cruise Elroy" mode
  elroyLevel: number; // 0 = none, 1 = elroy1, 2 = elroy2
}

// Fruit entity
export interface Fruit {
  type: FruitType;
  position: Position;
  points: number;
  visible: boolean;
  timeRemaining: number;
}

// Game State
export interface GameState {
  isPlaying: boolean;
  gameOver: boolean;
  gameWon: boolean;
  level: number;
  score: number;
  highScore: number;
  lives: number;
  powerPelletActive: boolean;
  powerPelletTimeRemaining: number;
  dotsEaten: number;
  totalDots: number;
  ghostsEaten: number;
  // Scatter/Chase mode tracking
  gameMode: GameMode;
  modeTimeRemaining: number;
  modeIndex: number; // Which phase of scatter/chase we're in
  // Fruit tracking
  fruit: Fruit | null;
  fruitEaten: FruitType[];
  // Ready screen
  isReady: boolean;
  readyTimeRemaining: number;
  // Global dot counter for ghost release
  globalDotCounter: number;
  globalDotCounterEnabled: boolean;
  // Extra life tracking
  extraLifeAwarded: boolean;
}

// Level Configuration
export interface LevelConfig {
  layout: CellType[][];
  ghostSpeed: number;
  pacmanSpeed: number;
  frightenedDuration: number;
  frightenedSpeed: number;
  tunnelSpeed: number;
  elroyDotsLeft1: number;
  elroySpeed1: number;
  elroyDotsLeft2: number;
  elroySpeed2: number;
  fruitType: FruitType;
  fruitPoints: number;
}

// Scatter/Chase mode timing configuration
export interface ModeTimingConfig {
  scatter: number[]; // Duration in ms for each scatter phase
  chase: number[];   // Duration in ms for each chase phase
}

// Utility type for maze matrices
export type Matrix<T> = T[][];

// Score popup for displaying points
export interface ScorePopup {
  position: Position;
  points: number;
  timeRemaining: number;
}
