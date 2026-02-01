// constants/gameConstants.ts
import type { Position, Direction, ModeTimingConfig } from "../types/types";

// Board and Cell Configuration
export const CELL_SIZE = 16; // pixels (smaller for 28x31 maze)
export const MAZE_WIDTH = 28;
export const MAZE_HEIGHT = 31;

// Starting positions
export const PACMAN_START_POSITION: Position = { x: 13, y: 23 };
export const GHOST_HOUSE_POSITION: Position = { x: 13, y: 14 };
export const GHOST_HOUSE_EXIT: Position = { x: 13, y: 11 };
export const FRUIT_SPAWN_POSITION: Position = { x: 13, y: 17 };

// Game Timing (in milliseconds)
export const BASE_MOVE_INTERVAL = 120; // Base movement speed
export const PACMAN_MOVE_INTERVAL = 100; // Pacman moves slightly faster
export const GHOST_MOVEMENT_INTERVAL = 150; // Ghost base movement
export const MOUTH_ANIMATION_INTERVAL = 100;
export const LEVEL_TRANSITION_DELAY = 2000;
export const READY_SCREEN_DURATION = 4000;
export const DEATH_ANIMATION_DURATION = 1500;
export const LEVEL_FLASH_DURATION = 2000;

// Scoring
export const SCORE_DOT = 10;
export const SCORE_POWER_PELLET = 50;
export const SCORE_EXTRA_LIFE_THRESHOLD = 10000;

// Ghost Names (for type derivation)
export const GHOST_NAMES = {
  BLINKY: "BLINKY",
  PINKY: "PINKY",
  INKY: "INKY",
  CLYDE: "CLYDE",
} as const;

// Fruit Types
export const FRUIT_TYPES = {
  CHERRY: "cherry",
  STRAWBERRY: "strawberry",
  ORANGE: "orange",
  APPLE: "apple",
  MELON: "melon",
  GALAXIAN: "galaxian",
  BELL: "bell",
  KEY: "key",
} as const;

// Fruit points by type
export const FRUIT_POINTS: Record<string, number> = {
  cherry: 100,
  strawberry: 300,
  orange: 500,
  apple: 700,
  melon: 1000,
  galaxian: 2000,
  bell: 3000,
  key: 5000,
};

// Fruit timing
export const FRUIT_SPAWN_DOT_COUNT_1 = 70;  // First fruit appears after 70 dots
export const FRUIT_SPAWN_DOT_COUNT_2 = 170; // Second fruit appears after 170 dots
export const FRUIT_VISIBLE_DURATION = 9500; // ~9.5 seconds

// Ghost Behavior Constants
export const GHOST_FRIGHTENED_DURATION = 6000; // Base duration, varies by level
export const GHOST_FRIGHTENED_FLASH_THRESHOLD = 2000;
export const GHOST_HOUSE_RELEASE_DELAY = 500;
export const CLYDE_CHASE_DISTANCE = 8;
export const GHOST_FRIGHTENED_COLOR = "#2121DE";
export const GHOST_FRIGHTENED_FLASH_COLOR = "#FFFFFF";

// Ghost dot counters for release (personal counters)
export const GHOST_DOT_LIMITS = {
  [GHOST_NAMES.BLINKY]: 0,  // Blinky starts outside
  [GHOST_NAMES.PINKY]: 0,   // Pinky leaves immediately
  [GHOST_NAMES.INKY]: 30,   // Inky waits for 30 dots
  [GHOST_NAMES.CLYDE]: 60,  // Clyde waits for 60 dots
} as const;

// Global dot counter limits (used when Pac-Man dies)
export const GLOBAL_DOT_LIMITS = {
  [GHOST_NAMES.PINKY]: 7,
  [GHOST_NAMES.INKY]: 17,
  [GHOST_NAMES.CLYDE]: 32,
} as const;

// Scatter/Chase mode timing (in milliseconds)
// Original Pac-Man timing varies by level
export const MODE_TIMING: Record<number, ModeTimingConfig> = {
  // Level 1
  0: {
    scatter: [7000, 7000, 5000, 5000],
    chase: [20000, 20000, 20000, Infinity],
  },
  // Levels 2-4
  1: {
    scatter: [7000, 7000, 5000, 17], // 17ms ≈ 1 frame
    chase: [20000, 20000, 20000, Infinity],
  },
  // Level 5+
  4: {
    scatter: [5000, 5000, 5000, 17],
    chase: [20000, 20000, 20000, Infinity],
  },
};

/**
 * Get mode timing for a specific level
 */
export const getModeTiming = (level: number): ModeTimingConfig => {
  if (level === 0) return MODE_TIMING[0];
  if (level < 4) return MODE_TIMING[1];
  return MODE_TIMING[4];
};

/**
 * Consolidated ghost configuration
 * Contains all ghost-specific settings in one place
 */
export const GHOST_CONFIG = {
  [GHOST_NAMES.BLINKY]: {
    name: GHOST_NAMES.BLINKY,
    color: "#FF0000",
    initialPosition: { x: 13, y: 11 }, // Starts outside house
    scatterTarget: { x: 25, y: 0 },    // Top-right corner
    dotLimit: 0,
  },
  [GHOST_NAMES.PINKY]: {
    name: GHOST_NAMES.PINKY,
    color: "#FFB8FF",
    initialPosition: { x: 13, y: 14 }, // Center of ghost house
    scatterTarget: { x: 2, y: 0 },     // Top-left corner
    dotLimit: 0,
  },
  [GHOST_NAMES.INKY]: {
    name: GHOST_NAMES.INKY,
    color: "#00FFFF",
    initialPosition: { x: 11, y: 14 }, // Left side of ghost house
    scatterTarget: { x: 27, y: 30 },   // Bottom-right corner
    dotLimit: 30,
  },
  [GHOST_NAMES.CLYDE]: {
    name: GHOST_NAMES.CLYDE,
    color: "#FFB852",
    initialPosition: { x: 15, y: 14 }, // Right side of ghost house
    scatterTarget: { x: 0, y: 30 },    // Bottom-left corner
    dotLimit: 60,
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
  DOT: 0,
  WALL: 1,
  EMPTY: 2,
  POWER_PELLET: 3,
  GHOST_HOUSE: 4,
  TUNNEL: 5,
  GHOST_DOOR: 6,
} as const;

// Sound Configuration
export const SOUND = {
  VOLUME: {
    MASTER: 1.0,
    EFFECTS: 0.7,
    SIREN: 0.4,
  },
  EFFECTS: {
    // Waka-waka sounds (alternating)
    WAKA_FREQ_1: 261, // C4
    WAKA_FREQ_2: 392, // G4
    WAKA_DURATION: 0.08,
    // Death sound
    DEATH_START_FREQUENCY: 500,
    DEATH_END_FREQUENCY: 100,
    DEATH_DURATION: 1.5,
    // Siren frequencies (increases as dots decrease)
    SIREN_BASE_FREQ: 100,
    SIREN_MAX_FREQ: 300,
    // Power pellet
    POWER_FREQUENCIES: [262, 330, 392, 523],
    // Ghost eaten
    GHOST_EAT_START_FREQ: 100,
    GHOST_EAT_END_FREQ: 800,
    // Intro jingle duration
    INTRO_DURATION: 4000,
  },
} as const;

// Touch Controls
export const TOUCH = {
  MIN_SWIPE_DISTANCE: 30,
} as const;

// Tunnel row for wrapping
export const TUNNEL_ROW = 14;

// Animation
export const PACMAN_DEATH_FRAMES = 11;
export const LEVEL_FLASH_COUNT = 4;

// Backward compatibility
export const INITIAL_POSITION = PACMAN_START_POSITION;
