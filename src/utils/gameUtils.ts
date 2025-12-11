// utils/gameUtils.ts
import type { Position, Direction, CellType, Matrix } from "../types/types";
import { CELL_TYPES, DIRECTION_DELTAS } from "../constants/gameConstants";

/**
 * Check if a position is a valid move (within bounds and not a wall)
 */
export const isValidMove = (pos: Position, level: Matrix<CellType>): boolean =>
  pos.x >= 0 &&
  pos.x < level[0].length &&
  pos.y >= 0 &&
  pos.y < level.length &&
  level[pos.y][pos.x] !== CELL_TYPES.WALL;

/**
 * Get the next position based on current position and direction
 */
export const getNextPosition = (
  pos: Position,
  direction: Direction
): Position => ({
  x: pos.x + DIRECTION_DELTAS[direction].x,
  y: pos.y + DIRECTION_DELTAS[direction].y,
});

/**
 * Get a position N tiles ahead in a given direction
 */
export const getPositionAhead = (
  pos: Position,
  direction: Direction,
  tiles: number
): Position => ({
  x: pos.x + DIRECTION_DELTAS[direction].x * tiles,
  y: pos.y + DIRECTION_DELTAS[direction].y * tiles,
});

/**
 * Calculate Euclidean distance between two positions
 */
export const calculateDistance = (pos1: Position, pos2: Position): number =>
  Math.sqrt(Math.pow(pos2.x - pos1.x, 2) + Math.pow(pos2.y - pos1.y, 2));

/**
 * Get all dot positions from a level layout
 */
export const getInitialDots = (level: Matrix<CellType>): Position[] => {
  const dots: Position[] = [];
  for (let y = 0; y < level.length; y++) {
    for (let x = 0; x < level[0].length; x++) {
      if (level[y][x] === CELL_TYPES.DOT) {
        dots.push({ x, y });
      }
    }
  }
  return dots;
};

/**
 * Get all power pellet positions from a level layout
 */
export const getPowerPellets = (level: Matrix<CellType>): Position[] => {
  const pellets: Position[] = [];
  for (let y = 0; y < level.length; y++) {
    for (let x = 0; x < level[0].length; x++) {
      if (level[y][x] === CELL_TYPES.POWER_PELLET) {
        pellets.push({ x, y });
      }
    }
  }
  return pellets;
};
