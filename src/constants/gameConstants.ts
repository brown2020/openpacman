// constants/gameConstants.ts
import type { Position, Direction } from "../types/types";

// Board and Cell Configuration
export const CELL_SIZE = 24; // pixels
export const INITIAL_POSITION: Position = { x: 1, y: 1 };
export const GHOST_HOUSE_POSITION: Position = { x: 9, y: 9 };

// Game Timing (in milliseconds)
export const PACMAN_MOVE_INTERVAL = 150;
export const GHOST_MOVEMENT_INTERVAL = 400;
export const MOUTH_ANIMATION_INTERVAL = 200;
export const LEVEL_TRANSITION_DELAY = 2000;

// Scoring
export const SCORE_DOT = 10;
export const SCORE_POWER_PELLET = 50;

// Ghost Configuration
export const GHOST_NAMES = {
  BLINKY: "BLINKY",
  PINKY: "PINKY",
  INKY: "INKY",
  CLYDE: "CLYDE",
} as const;

export const GHOST_COLORS = {
  [GHOST_NAMES.BLINKY]: "#FF0000",
  [GHOST_NAMES.PINKY]: "#FFB8FF",
  [GHOST_NAMES.INKY]: "#00FFFF",
  [GHOST_NAMES.CLYDE]: "#FFB852",
} as const;

export const GHOST_INITIAL_POSITIONS: Position[] = [
  { x: 18, y: 1 }, // BLINKY
  { x: 1, y: 18 }, // PINKY
  { x: 18, y: 18 }, // INKY
  { x: 9, y: 9 }, // CLYDE
];

// Ghost Behavior
export const GHOST_FRIGHTENED_DURATION = 8000;
export const GHOST_FRIGHTENED_FLASH_THRESHOLD = 2000;
export const GHOST_HOUSE_RELEASE_DELAY = 2000;
export const CLYDE_CHASE_DISTANCE = 8;
export const GHOST_FRIGHTENED_COLOR = "#2121DE";

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
