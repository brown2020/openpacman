// types/types.ts
import {
  DIRECTIONS,
  CELL_TYPES,
  GHOST_NAMES,
} from "../constants/gameConstants";

// Basic types derived from constants
export type CellType = (typeof CELL_TYPES)[keyof typeof CELL_TYPES];
export type Direction = (typeof DIRECTIONS)[keyof typeof DIRECTIONS];
export type GhostName = (typeof GHOST_NAMES)[keyof typeof GHOST_NAMES];

// Position
export interface Position {
  x: number;
  y: number;
}

// High Score Entry
export interface GameScore {
  score: number;
  level: number;
  date: number;
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
}

// Level Configuration
export interface LevelConfig {
  layout: CellType[][];
  ghostSpeed: number;
  difficulty: number;
}

// Utility type for maze matrices
export type Matrix<T> = T[][];
