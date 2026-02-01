// levels/gameLevels.ts
import { CELL_TYPES } from "../constants/gameConstants";
import type { LevelConfig, CellType } from "../types/types";

// Cell type legend:
// 0 = DOT, 1 = WALL, 2 = EMPTY, 3 = POWER_PELLET, 4 = GHOST_HOUSE, 5 = TUNNEL, 6 = GHOST_DOOR

// Authentic Pac-Man maze layout (28x31)
// Based on the original 1980 Namco arcade game
const CLASSIC_MAZE: CellType[][] = [
  // Row 0 - Top wall
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  // Row 1
  [1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1],
  // Row 2
  [1,0,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,1,0,1],
  // Row 3 - Power pellets in corners
  [1,3,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,1,3,1],
  // Row 4
  [1,0,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,1,0,1],
  // Row 5
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  // Row 6
  [1,0,1,1,1,1,0,1,1,0,1,1,1,1,1,1,1,1,0,1,1,0,1,1,1,1,0,1],
  // Row 7
  [1,0,1,1,1,1,0,1,1,0,1,1,1,1,1,1,1,1,0,1,1,0,1,1,1,1,0,1],
  // Row 8
  [1,0,0,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,0,0,1],
  // Row 9
  [1,1,1,1,1,1,0,1,1,1,1,1,2,1,1,2,1,1,1,1,1,0,1,1,1,1,1,1],
  // Row 10
  [2,2,2,2,2,1,0,1,1,1,1,1,2,1,1,2,1,1,1,1,1,0,1,2,2,2,2,2],
  // Row 11
  [2,2,2,2,2,1,0,1,1,2,2,2,2,2,2,2,2,2,2,1,1,0,1,2,2,2,2,2],
  // Row 12
  [2,2,2,2,2,1,0,1,1,2,1,1,1,6,6,1,1,1,2,1,1,0,1,2,2,2,2,2],
  // Row 13 - Ghost house row
  [1,1,1,1,1,1,0,1,1,2,1,4,4,4,4,4,4,1,2,1,1,0,1,1,1,1,1,1],
  // Row 14 - Tunnel row
  [5,2,2,2,2,2,0,2,2,2,1,4,4,4,4,4,4,1,2,2,2,0,2,2,2,2,2,5],
  // Row 15
  [1,1,1,1,1,1,0,1,1,2,1,4,4,4,4,4,4,1,2,1,1,0,1,1,1,1,1,1],
  // Row 16
  [2,2,2,2,2,1,0,1,1,2,1,1,1,1,1,1,1,1,2,1,1,0,1,2,2,2,2,2],
  // Row 17
  [2,2,2,2,2,1,0,1,1,2,2,2,2,2,2,2,2,2,2,1,1,0,1,2,2,2,2,2],
  // Row 18
  [2,2,2,2,2,1,0,1,1,2,1,1,1,1,1,1,1,1,2,1,1,0,1,2,2,2,2,2],
  // Row 19
  [1,1,1,1,1,1,0,1,1,2,1,1,1,1,1,1,1,1,2,1,1,0,1,1,1,1,1,1],
  // Row 20
  [1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1],
  // Row 21
  [1,0,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,1,0,1],
  // Row 22
  [1,0,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,1,0,1],
  // Row 23 - Power pellets and Pacman start area
  [1,3,0,0,1,1,0,0,0,0,0,0,0,2,2,0,0,0,0,0,0,0,1,1,0,0,3,1],
  // Row 24
  [1,1,1,0,1,1,0,1,1,0,1,1,1,1,1,1,1,1,0,1,1,0,1,1,0,1,1,1],
  // Row 25
  [1,1,1,0,1,1,0,1,1,0,1,1,1,1,1,1,1,1,0,1,1,0,1,1,0,1,1,1],
  // Row 26
  [1,0,0,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,0,0,1],
  // Row 27
  [1,0,1,1,1,1,1,1,1,1,1,1,0,1,1,0,1,1,1,1,1,1,1,1,1,1,0,1],
  // Row 28
  [1,0,1,1,1,1,1,1,1,1,1,1,0,1,1,0,1,1,1,1,1,1,1,1,1,1,0,1],
  // Row 29
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  // Row 30 - Bottom wall
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

// Level configurations with progressive difficulty
// Speed values are multipliers (1.0 = base speed)
// Frightened duration decreases per level
export const LEVELS: LevelConfig[] = [
  {
    layout: CLASSIC_MAZE,
    ghostSpeed: 0.75,
    pacmanSpeed: 0.80,
    frightenedDuration: 6000,
    frightenedSpeed: 0.50,
    tunnelSpeed: 0.40,
    elroyDotsLeft1: 20,
    elroySpeed1: 0.80,
    elroyDotsLeft2: 10,
    elroySpeed2: 0.85,
    fruitType: 'cherry',
    fruitPoints: 100,
  },
  {
    layout: CLASSIC_MAZE,
    ghostSpeed: 0.85,
    pacmanSpeed: 0.90,
    frightenedDuration: 5000,
    frightenedSpeed: 0.55,
    tunnelSpeed: 0.45,
    elroyDotsLeft1: 30,
    elroySpeed1: 0.90,
    elroyDotsLeft2: 15,
    elroySpeed2: 0.95,
    fruitType: 'strawberry',
    fruitPoints: 300,
  },
  {
    layout: CLASSIC_MAZE,
    ghostSpeed: 0.85,
    pacmanSpeed: 0.90,
    frightenedDuration: 4000,
    frightenedSpeed: 0.55,
    tunnelSpeed: 0.45,
    elroyDotsLeft1: 40,
    elroySpeed1: 0.90,
    elroyDotsLeft2: 20,
    elroySpeed2: 0.95,
    fruitType: 'orange',
    fruitPoints: 500,
  },
  {
    layout: CLASSIC_MAZE,
    ghostSpeed: 0.85,
    pacmanSpeed: 0.90,
    frightenedDuration: 3000,
    frightenedSpeed: 0.55,
    tunnelSpeed: 0.45,
    elroyDotsLeft1: 40,
    elroySpeed1: 0.90,
    elroyDotsLeft2: 20,
    elroySpeed2: 0.95,
    fruitType: 'orange',
    fruitPoints: 500,
  },
  {
    layout: CLASSIC_MAZE,
    ghostSpeed: 0.95,
    pacmanSpeed: 1.00,
    frightenedDuration: 2000,
    frightenedSpeed: 0.60,
    tunnelSpeed: 0.50,
    elroyDotsLeft1: 40,
    elroySpeed1: 1.00,
    elroyDotsLeft2: 20,
    elroySpeed2: 1.05,
    fruitType: 'apple',
    fruitPoints: 700,
  },
  {
    layout: CLASSIC_MAZE,
    ghostSpeed: 0.95,
    pacmanSpeed: 1.00,
    frightenedDuration: 5000,
    frightenedSpeed: 0.60,
    tunnelSpeed: 0.50,
    elroyDotsLeft1: 50,
    elroySpeed1: 1.00,
    elroyDotsLeft2: 25,
    elroySpeed2: 1.05,
    fruitType: 'apple',
    fruitPoints: 700,
  },
  {
    layout: CLASSIC_MAZE,
    ghostSpeed: 0.95,
    pacmanSpeed: 1.00,
    frightenedDuration: 2000,
    frightenedSpeed: 0.60,
    tunnelSpeed: 0.50,
    elroyDotsLeft1: 50,
    elroySpeed1: 1.00,
    elroyDotsLeft2: 25,
    elroySpeed2: 1.05,
    fruitType: 'melon',
    fruitPoints: 1000,
  },
  {
    layout: CLASSIC_MAZE,
    ghostSpeed: 0.95,
    pacmanSpeed: 1.00,
    frightenedDuration: 2000,
    frightenedSpeed: 0.60,
    tunnelSpeed: 0.50,
    elroyDotsLeft1: 50,
    elroySpeed1: 1.00,
    elroyDotsLeft2: 25,
    elroySpeed2: 1.05,
    fruitType: 'melon',
    fruitPoints: 1000,
  },
  {
    layout: CLASSIC_MAZE,
    ghostSpeed: 0.95,
    pacmanSpeed: 1.00,
    frightenedDuration: 1000,
    frightenedSpeed: 0.60,
    tunnelSpeed: 0.50,
    elroyDotsLeft1: 60,
    elroySpeed1: 1.00,
    elroyDotsLeft2: 30,
    elroySpeed2: 1.05,
    fruitType: 'galaxian',
    fruitPoints: 2000,
  },
  {
    layout: CLASSIC_MAZE,
    ghostSpeed: 0.95,
    pacmanSpeed: 1.00,
    frightenedDuration: 5000,
    frightenedSpeed: 0.60,
    tunnelSpeed: 0.50,
    elroyDotsLeft1: 60,
    elroySpeed1: 1.00,
    elroyDotsLeft2: 30,
    elroySpeed2: 1.05,
    fruitType: 'galaxian',
    fruitPoints: 2000,
  },
  {
    layout: CLASSIC_MAZE,
    ghostSpeed: 0.95,
    pacmanSpeed: 1.00,
    frightenedDuration: 2000,
    frightenedSpeed: 0.60,
    tunnelSpeed: 0.50,
    elroyDotsLeft1: 60,
    elroySpeed1: 1.00,
    elroyDotsLeft2: 30,
    elroySpeed2: 1.05,
    fruitType: 'bell',
    fruitPoints: 3000,
  },
  {
    layout: CLASSIC_MAZE,
    ghostSpeed: 0.95,
    pacmanSpeed: 1.00,
    frightenedDuration: 1000,
    frightenedSpeed: 0.60,
    tunnelSpeed: 0.50,
    elroyDotsLeft1: 60,
    elroySpeed1: 1.00,
    elroyDotsLeft2: 30,
    elroySpeed2: 1.05,
    fruitType: 'bell',
    fruitPoints: 3000,
  },
  // Level 13+ uses key fruit
  {
    layout: CLASSIC_MAZE,
    ghostSpeed: 0.95,
    pacmanSpeed: 1.00,
    frightenedDuration: 1000,
    frightenedSpeed: 0.60,
    tunnelSpeed: 0.50,
    elroyDotsLeft1: 60,
    elroySpeed1: 1.00,
    elroyDotsLeft2: 30,
    elroySpeed2: 1.05,
    fruitType: 'key',
    fruitPoints: 5000,
  },
];

export const LEVEL_COUNT = LEVELS.length;

/**
 * Get level config with fallback to last level for infinite play
 */
export const getLevelConfig = (level: number): LevelConfig => {
  if (level < LEVELS.length) {
    return LEVELS[level];
  }
  // After all defined levels, use the last level config (key level)
  return LEVELS[LEVELS.length - 1];
};

/**
 * Get layout for a level
 */
export const getLayout = (level: number): CellType[][] =>
  getLevelConfig(level).layout;

// Maze dimensions
export const MAZE_WIDTH = 28;
export const MAZE_HEIGHT = 31;

// Key positions in the maze
export const PACMAN_START: Position = { x: 13, y: 23 };
export const FRUIT_POSITION: Position = { x: 13, y: 17 };

// Ghost house positions
export const GHOST_HOUSE_CENTER: Position = { x: 13, y: 14 };
export const GHOST_HOUSE_EXIT: Position = { x: 13, y: 11 };

// Ghost starting positions (inside ghost house)
export const GHOST_START_POSITIONS = {
  BLINKY: { x: 13, y: 11 }, // Starts outside house
  PINKY: { x: 13, y: 14 },
  INKY: { x: 11, y: 14 },
  CLYDE: { x: 15, y: 14 },
};

// Ghost scatter target corners
export const GHOST_SCATTER_TARGETS = {
  BLINKY: { x: 25, y: 0 },   // Top-right
  PINKY: { x: 2, y: 0 },     // Top-left
  INKY: { x: 27, y: 30 },    // Bottom-right
  CLYDE: { x: 0, y: 30 },    // Bottom-left
};

// Tunnel positions
export const TUNNEL_LEFT: Position = { x: 0, y: 14 };
export const TUNNEL_RIGHT: Position = { x: 27, y: 14 };

// Import Position type
import type { Position } from "../types/types";
