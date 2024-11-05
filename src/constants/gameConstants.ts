// constants/gameConstants.ts
import { Position } from "../types/types";

// Board and Cell Configuration
export const CELL_SIZE = 24; // pixels
export const INITIAL_POSITION: Position = { x: 1, y: 1 };

// Game Timing (in milliseconds)
export const GHOST_MOVEMENT_INTERVAL = 400;
export const MOUTH_ANIMATION_INTERVAL = 200;
export const LEVEL_TRANSITION_DELAY = 2000;
export const GAME_SPEED = 1000 / 60; // 60 FPS

// Scoring
export const SCORE_DOT = 10;
export const SCORE_POWER_PELLET = 50;
export const SCORE_GHOST = 200;
export const HIGH_SCORES_MAX = 5;

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
export const GHOST_CHASE_PROBABILITY = 0.8; // 80% chance to chase Pacman
export const GHOST_SCATTER_DURATION = 7000; // Duration of scatter mode
export const GHOST_CHASE_DURATION = 20000; // Duration of chase mode
export const GHOST_FRIGHTENED_DURATION = 6000; // Duration when power pellet is active
export const GHOST_FRIGHTENED_FLASH_START = 4000; // When to start flashing
export const GHOST_FRIGHTENED_COLOR = "#0000FF";
export const GHOST_FRIGHTENED_FLASH_COLOR = "#FFFFFF";

// Game States
export const GAME_STATES = {
  READY: "READY",
  PLAYING: "PLAYING",
  PAUSED: "PAUSED",
  GAME_OVER: "GAME_OVER",
  LEVEL_COMPLETE: "LEVEL_COMPLETE",
  GAME_WON: "GAME_WON",
} as const;

// Movement
export const DIRECTIONS = {
  UP: "up",
  DOWN: "down",
  LEFT: "left",
  RIGHT: "right",
} as const;

// Cell Types for Maze
export const CELL_TYPES = {
  WALL: 1,
  DOT: 0,
  EMPTY: 2,
  POWER_PELLET: 3,
  GHOST_HOUSE: 4,
} as const;

// Visual Constants
export const COLORS = {
  WALL: "#1a237e", // Dark blue for walls
  WALL_BORDER: "#283593", // Slightly lighter blue for wall borders
  DOT: "#FFD700", // Gold for dots
  POWER_PELLET: "#FFB74D", // Orange for power pellets
  BACKGROUND: "#000000", // Black background
  TEXT: "#FFFFFF", // White text
  SCORE: "#FFD700", // Gold for score
  HIGH_SCORE: "#4CAF50", // Green for high score
} as const;

// Animation Constants
export const ANIMATION = {
  PACMAN_MOUTH_MAX: 45, // Maximum mouth angle
  PACMAN_MOUTH_MIN: 5, // Minimum mouth angle
  GHOST_WAVE_HEIGHT: 2, // Pixels for ghost wave animation
  GHOST_WAVE_DURATION: 2000, // Duration of ghost wave animation
  DEATH_ANIMATION_DURATION: 1500, // Duration of death animation
  LEVEL_TRANSITION_DURATION: 500, // Duration of level transition animation
} as const;

// Sound Configuration
export const SOUND = {
  VOLUME: {
    MASTER: 1.0,
    BACKGROUND: 0.5,
    EFFECTS: 0.7,
  },
  EFFECTS: {
    DOT_FREQUENCY: 440,
    DOT_DURATION: 0.1,
    DEATH_START_FREQUENCY: 200,
    DEATH_END_FREQUENCY: 50,
    DEATH_DURATION: 0.5,
    GHOST_EAT_FREQUENCY: 300,
    POWER_PELLET_FREQUENCY: 375,
  },
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  HIGH_SCORES: "pacman-high-scores",
  SETTINGS: "pacman-settings",
  SOUND_ENABLED: "pacman-sound-enabled",
} as const;

// Debug Constants
export const DEBUG = {
  SHOW_HITBOXES: false,
  SHOW_GHOST_TARGETS: false,
  SHOW_PATHFINDING: false,
  INVINCIBLE: false,
  LEVEL_SKIP_ENABLED: false,
} as const;

// Touch Controls
export const TOUCH = {
  MIN_SWIPE_DISTANCE: 30, // Minimum distance for swipe detection
  SWIPE_TIMEOUT: 300, // Maximum time for swipe detection
  VIRTUAL_JOYSTICK_SIZE: 100, // Size of virtual joystick if implemented
} as const;

// Responsive Design Breakpoints
export const BREAKPOINTS = {
  MOBILE: 480,
  TABLET: 768,
  DESKTOP: 1024,
} as const;
