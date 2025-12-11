// types/types.ts
import {
  GAME_STATES,
  DIRECTIONS,
  CELL_TYPES,
  GHOST_NAMES,
} from "../constants/gameConstants";

// Basic types
export type MazeCell = (typeof CELL_TYPES)[keyof typeof CELL_TYPES];
export type CellType = MazeCell;
export type Direction = (typeof DIRECTIONS)[keyof typeof DIRECTIONS];
export type GameStateType = (typeof GAME_STATES)[keyof typeof GAME_STATES];
export type GhostName = (typeof GHOST_NAMES)[keyof typeof GHOST_NAMES];

// Score types
export interface ScoreEntry {
  score: number;
  level: number;
  date: number;
  playerName?: string;
  completion: number;
  ghostsEaten: number;
}

export interface GameScore extends ScoreEntry {
  timestamp: number;
}

// Position
export interface Position {
  x: number;
  y: number;
}

// Ghost Modes
export enum GhostMode {
  CHASE = "CHASE",
  SCATTER = "SCATTER",
  FRIGHTENED = "FRIGHTENED",
  EATEN = "EATEN",
  HOUSE = "HOUSE",
}

// Entity interfaces
export interface Ghost {
  position: Position;
  color: string;
  name: GhostName;
  mode: GhostMode;
  speed: number;
  targetPosition: Position;
  previousPosition: Position;
  direction: Direction;
  isMoving: boolean;
  frightenedTimeLeft?: number;
  houseTimeLeft?: number;
}

export interface GameState {
  isPlaying: boolean;
  gameOver: boolean;
  gameWon: boolean;
  level: number;
  score: number;
  highScore: number;
  lives: number;
  gameStateType: GameStateType;
  powerPelletActive: boolean;
  dotsEaten: number;
  totalDots: number;
  ghostsEaten: number;
}

export interface LevelConfig {
  layout: MazeCell[][];
  ghostSpeed: number;
  dotCount: number;
  powerPellets: Position[];
  difficulty: number;
}

// Collision detection
export interface Hitbox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface GameEntity {
  position: Position;
}

// Utility types
export type Matrix<T> = T[][];
