// utils/gameUtils.ts
import type { Position, Direction, CellType, Matrix } from "../types/types";
import {
  CELL_TYPES,
  DIRECTION_DELTAS,
  TUNNEL_ROW,
  MAZE_WIDTH,
} from "../constants/gameConstants";

/**
 * Check if a position is within the maze bounds
 */
export const isInBounds = (pos: Position, maze: Matrix<CellType>): boolean =>
  pos.x >= 0 &&
  pos.x < maze[0].length &&
  pos.y >= 0 &&
  pos.y < maze.length;

/**
 * Check if a position is a valid move (within bounds and not a wall)
 * Allows movement through tunnels and ghost doors for ghosts
 */
export const isValidMove = (
  pos: Position,
  level: Matrix<CellType>,
  isGhost = false
): boolean => {
  // Handle tunnel wrapping - always valid on tunnel row edges
  if (pos.y === TUNNEL_ROW && (pos.x < 0 || pos.x >= level[0].length)) {
    return true;
  }

  if (!isInBounds(pos, level)) {
    return false;
  }

  const cell = level[pos.y][pos.x];

  // Walls are never valid
  if (cell === CELL_TYPES.WALL) {
    return false;
  }

  // Ghost door is only passable by ghosts
  if (cell === CELL_TYPES.GHOST_DOOR) {
    return isGhost;
  }

  return true;
};

/**
 * Check if position is in a tunnel
 */
export const isInTunnel = (pos: Position): boolean =>
  pos.y === TUNNEL_ROW && (pos.x < 6 || pos.x > 21);

/**
 * Apply tunnel wrapping to a position
 */
export const wrapTunnel = (pos: Position): Position => {
  if (pos.y !== TUNNEL_ROW) return pos;

  if (pos.x < 0) {
    return { x: MAZE_WIDTH - 1, y: pos.y };
  }
  if (pos.x >= MAZE_WIDTH) {
    return { x: 0, y: pos.y };
  }
  return pos;
};

/**
 * Get the next position based on current position and direction
 * Handles tunnel wrapping automatically
 */
export const getNextPosition = (
  pos: Position,
  direction: Direction
): Position => {
  const delta = DIRECTION_DELTAS[direction];
  const newPos = {
    x: pos.x + delta.x,
    y: pos.y + delta.y,
  };
  return wrapTunnel(newPos);
};

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
 * Calculate Manhattan distance between two positions
 */
export const manhattanDistance = (pos1: Position, pos2: Position): number =>
  Math.abs(pos2.x - pos1.x) + Math.abs(pos2.y - pos1.y);

/**
 * Get all positions of a specific cell type from a level layout
 */
const getPositionsByCellType = (
  level: Matrix<CellType>,
  cellType: CellType
): Position[] => {
  const positions: Position[] = [];
  for (let y = 0; y < level.length; y++) {
    for (let x = 0; x < level[0].length; x++) {
      if (level[y][x] === cellType) {
        positions.push({ x, y });
      }
    }
  }
  return positions;
};

/**
 * Get all dot positions from a level layout
 */
export const getInitialDots = (level: Matrix<CellType>): Position[] =>
  getPositionsByCellType(level, CELL_TYPES.DOT);

/**
 * Get all power pellet positions from a level layout
 */
export const getPowerPellets = (level: Matrix<CellType>): Position[] =>
  getPositionsByCellType(level, CELL_TYPES.POWER_PELLET);

/**
 * Count total collectibles (dots + power pellets) in a maze
 */
export const countTotalDots = (level: Matrix<CellType>): number =>
  getInitialDots(level).length + getPowerPellets(level).length;

/**
 * Check if a cell is passable (not a wall)
 */
export const isPassable = (
  x: number,
  y: number,
  maze: Matrix<CellType>,
  isGhost = false
): boolean => {
  if (y < 0 || y >= maze.length || x < 0 || x >= maze[0].length) {
    // Allow tunnel wrapping
    if (y === TUNNEL_ROW) return true;
    return false;
  }
  const cell = maze[y][x];
  if (cell === CELL_TYPES.WALL) return false;
  if (cell === CELL_TYPES.GHOST_DOOR && !isGhost) return false;
  return true;
};

/**
 * Get valid directions from a position
 */
export const getValidDirections = (
  pos: Position,
  maze: Matrix<CellType>,
  isGhost = false
): Direction[] => {
  const directions: Direction[] = [];
  const deltas = DIRECTION_DELTAS;

  for (const [dir, delta] of Object.entries(deltas)) {
    const newX = pos.x + delta.x;
    const newY = pos.y + delta.y;
    if (isPassable(newX, newY, maze, isGhost)) {
      directions.push(dir as Direction);
    }
  }

  return directions;
};
