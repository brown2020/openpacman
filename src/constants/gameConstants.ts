// constants/gameConstants.ts
import type { Position, Direction } from "../types/types";

// Board and Cell Configuration
export const CELL_SIZE = 24; // pixels
export const INITIAL_POSITION: Position = { x: 1, y: 1 };
export const GHOST_HOUSE_POSITION: Position = { x: 9, y: 9 };

// Game Timing (in milliseconds)
export const PACMAN_MOVE_INTERVAL = 100; // Faster for responsive turning
export const GHOST_MOVEMENT_INTERVAL = 300; // Adjusted to match Pacman speed
export const MOUTH_ANIMATION_INTERVAL = 200;
export const LEVEL_TRANSITION_DELAY = 2000;

// Scoring
export const SCORE_DOT = 10;
export const SCORE_POWER_PELLET = 50;

// Ghost Names (for type derivation)
export const GHOST_NAMES = {
  BLINKY: "BLINKY",
  PINKY: "PINKY",
  INKY: "INKY",
  CLYDE: "CLYDE",
} as const;

// Ghost Behavior Constants
export const GHOST_FRIGHTENED_DURATION = 8000;
export const GHOST_FRIGHTENED_FLASH_THRESHOLD = 2000;
export const GHOST_HOUSE_RELEASE_DELAY = 2000;
export const CLYDE_CHASE_DISTANCE = 8;
export const GHOST_FRIGHTENED_COLOR = "#2121DE";

/**
 * Consolidated ghost configuration
 * Contains all ghost-specific settings in one place
 */
export const GHOST_CONFIG = {
  [GHOST_NAMES.BLINKY]: {
    name: GHOST_NAMES.BLINKY,
    color: "#FF0000",
    initialPosition: { x: 18, y: 1 },
    releaseDelay: 0,
    speed: 1,
    scatterTarget: { x: 18, y: 0 },
  },
  [GHOST_NAMES.PINKY]: {
    name: GHOST_NAMES.PINKY,
    color: "#FFB8FF",
    initialPosition: { x: 1, y: 18 },
    releaseDelay: 2000,
    speed: 0.95,
    scatterTarget: { x: 0, y: 0 },
  },
  [GHOST_NAMES.INKY]: {
    name: GHOST_NAMES.INKY,
    color: "#00FFFF",
    initialPosition: { x: 18, y: 18 },
    releaseDelay: 4000,
    speed: 0.9,
    scatterTarget: { x: 18, y: 19 },
  },
  [GHOST_NAMES.CLYDE]: {
    name: GHOST_NAMES.CLYDE,
    color: "#FFB852",
    initialPosition: { x: 9, y: 9 },
    releaseDelay: 6000,
    speed: 0.85,
    scatterTarget: { x: 0, y: 19 },
  },
} as const;

// Legacy exports for backward compatibility (derived from GHOST_CONFIG)
export const GHOST_COLORS = {
  [GHOST_NAMES.BLINKY]: GHOST_CONFIG.BLINKY.color,
  [GHOST_NAMES.PINKY]: GHOST_CONFIG.PINKY.color,
  [GHOST_NAMES.INKY]: GHOST_CONFIG.INKY.color,
  [GHOST_NAMES.CLYDE]: GHOST_CONFIG.CLYDE.color,
} as const;

// Movement Directions
export const DIRECTIONS = {
  UP: "up",
  DOWN: "down",
  LEFT: "left",
  RIGHT: "right",
} as const;

// Direction deltas for position calculations
export const DIRECTION_DELTAS: Record<Direction, Position> = {
  [DIRECTIONS.UP]: { x: 0, y: -1 },
  [DIRECTIONS.DOWN]: { x: 0, y: 1 },
  [DIRECTIONS.LEFT]: { x: -1, y: 0 },
  [DIRECTIONS.RIGHT]: { x: 1, y: 0 },
} as const;

// Opposite direction mapping
export const OPPOSITE_DIRECTION: Record<Direction, Direction> = {
  [DIRECTIONS.UP]: DIRECTIONS.DOWN,
  [DIRECTIONS.DOWN]: DIRECTIONS.UP,
  [DIRECTIONS.LEFT]: DIRECTIONS.RIGHT,
  [DIRECTIONS.RIGHT]: DIRECTIONS.LEFT,
} as const;

// Cell Types for Maze
export const CELL_TYPES = {
  WALL: 1,
  DOT: 0,
  EMPTY: 2,
  POWER_PELLET: 3,
  GHOST_HOUSE: 4,
} as const;

// Sound Configuration
export const SOUND = {
  VOLUME: {
    MASTER: 1.0,
    EFFECTS: 0.7,
  },
  EFFECTS: {
    DOT_FREQUENCY: 440,
    DOT_DURATION: 0.1,
    DEATH_START_FREQUENCY: 200,
    DEATH_END_FREQUENCY: 50,
    DEATH_DURATION: 0.5,
  },
} as const;

// Touch Controls
export const TOUCH = {
  MIN_SWIPE_DISTANCE: 30,
} as const;
