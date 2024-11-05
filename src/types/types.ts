// types/types.ts
import {
  GAME_STATES,
  DIRECTIONS,
  CELL_TYPES,
  GHOST_NAMES,
} from "../constants/gameConstants";

// Basic types
export type MazeCell = (typeof CELL_TYPES)[keyof typeof CELL_TYPES];
export type CellType = MazeCell; // Add this alias for backward compatibility
export type Direction = (typeof DIRECTIONS)[keyof typeof DIRECTIONS];
export type GameStateType = (typeof GAME_STATES)[keyof typeof GAME_STATES];
export type GhostName = (typeof GHOST_NAMES)[keyof typeof GHOST_NAMES];

// Add ScoreEntry interface
export interface ScoreEntry {
  score: number;
  level: number;
  date: number;
  playerName?: string;
  completion: number;
  ghostsEaten: number;
}

// GameScore can extend ScoreEntry
export interface GameScore extends ScoreEntry {
  timestamp: number;
}

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

export interface Player {
  position: Position;
  direction: Direction;
  nextDirection: Direction;
  lives: number;
  isMoving: boolean;
  powerPelletActive: boolean;
  powerPelletTimeLeft: number;
  invincible: boolean;
}

export interface GameState {
  isPlaying: boolean;
  gameOver: boolean;
  gameWon: boolean;
  level: number;
  score: number;
  highScore: number;
  lives: number;
  paused: boolean;
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
  bonusItems?: BonusItem[];
  ghostPatterns?: GhostPattern[];
}

export interface BonusItem {
  type: string;
  position: Position;
  points: number;
  duration: number;
  isActive: boolean;
  sprite: string;
}

export interface GhostPattern {
  ghostName: GhostName;
  waypoints: Position[];
  mode: GhostMode;
  duration: number;
}

export interface GameScore {
  score: number;
  level: number;
  timestamp: number;
  playerName?: string;
}

export interface GameSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  volume: number;
  difficulty: number;
  controls: ControlSettings;
  display: DisplaySettings;
}

export interface ControlSettings {
  keyboard: {
    up: string;
    down: string;
    left: string;
    right: string;
    pause: string;
  };
  touchEnabled: boolean;
  touchSensitivity: number;
}

export interface DisplaySettings {
  showFPS: boolean;
  showGrid: boolean;
  showHitboxes: boolean;
  theme: GameTheme;
  animations: boolean;
}

export interface GameTheme {
  name: string;
  wallColor: string;
  backgroundColor: string;
  dotColor: string;
  powerPelletColor: string;
  textColor: string;
}

export interface AnimationState {
  mouthOpen: boolean;
  deathAnimation: boolean;
  levelStartAnimation: boolean;
  powerPelletAnimation: boolean;
  ghostFlashing: boolean;
}

export interface GameStats {
  totalGamesPlayed: number;
  highestScore: number;
  totalDotsEaten: number;
  totalGhostsEaten: number;
  totalTimePlayed: number;
  levelsCompleted: number;
  averageScore: number;
}

// Entity type for collision detection
export type GameEntity = Ghost | Player | BonusItem;

// Event system
export type GameEvent =
  | { type: "DOT_EATEN"; position: Position }
  | { type: "POWER_PELLET_EATEN"; position: Position }
  | { type: "GHOST_EATEN"; ghost: Ghost }
  | { type: "PACMAN_DIED"; position: Position }
  | { type: "LEVEL_COMPLETE"; level: number }
  | { type: "GAME_OVER"; finalScore: number }
  | { type: "BONUS_COLLECTED"; item: BonusItem }
  | { type: "PAUSE_GAME" }
  | { type: "RESUME_GAME" };

export interface SoundEffect {
  name: string;
  src: string;
  volume: number;
  loop: boolean;
}

export interface MovementQueue {
  current: Direction;
  next: Direction | null;
  timestamp: number;
}

export interface Hitbox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DebugInfo {
  fps: number;
  entityCount: number;
  collisionChecks: number;
  renderTime: number;
  updateTime: number;
  memoryUsage: number;
}

export interface PerformanceMetrics {
  averageFPS: number;
  lowFPS: number;
  highFPS: number;
  frameTimeHistory: number[];
  lastFrameTime: number;
}

export interface InputState {
  keyboard: Record<string, boolean>;
  touch: {
    active: boolean;
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
  };
  gamepad: {
    connected: boolean;
    axes: number[];
    buttons: GamepadButton[];
  };
}

// Utility types
export type Matrix<T> = T[][];
export type UpdateCallback = (deltaTime: number) => void;
export type RenderCallback = (ctx: CanvasRenderingContext2D) => void;
export type CollisionCallback = (
  entity1: GameEntity,
  entity2: GameEntity
) => void;

// Constructor type for mixins
export type Constructor<T = object> = new (...args: Array<unknown>) => T;

// Ghost behavior function type
export type GhostBehavior = (ghost: Ghost, player: Player) => Position;
