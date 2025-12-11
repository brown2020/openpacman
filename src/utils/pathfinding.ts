// utils/pathfinding.ts
import type { Position, Matrix, CellType, Direction } from "../types/types";
import {
  CELL_TYPES,
  DIRECTIONS,
  DIRECTION_DELTAS,
  OPPOSITE_DIRECTION,
} from "../constants/gameConstants";

interface PathNode {
  position: Position;
  g: number;
  h: number;
  f: number;
  parent: PathNode | null;
}

const ALL_DIRECTIONS = Object.values(DIRECTIONS) as Direction[];

/**
 * Manhattan distance heuristic for A* pathfinding
 */
const manhattanDistance = (a: Position, b: Position): number =>
  Math.abs(a.x - b.x) + Math.abs(a.y - b.y);

/**
 * Create a unique key for position
 */
const posKey = (pos: Position): string => `${pos.x},${pos.y}`;

/**
 * Get valid neighbors for a position in the maze
 */
const getNeighbors = (pos: Position, maze: Matrix<CellType>): Position[] => {
  const neighbors: Position[] = [];

  for (const dir of ALL_DIRECTIONS) {
    const delta = DIRECTION_DELTAS[dir];
    const newPos = { x: pos.x + delta.x, y: pos.y + delta.y };

    if (
      newPos.x >= 0 &&
      newPos.x < maze[0].length &&
      newPos.y >= 0 &&
      newPos.y < maze.length &&
      maze[newPos.y][newPos.x] !== CELL_TYPES.WALL
    ) {
      neighbors.push(newPos);
    }
  }

  return neighbors;
};

/**
 * A* pathfinding algorithm
 */
export const findPath = (
  start: Position,
  goal: Position,
  maze: Matrix<CellType>,
  maxIterations = 1000
): Position[] | null => {
  if (posKey(start) === posKey(goal)) {
    return [start];
  }

  const openSet = new Map<string, PathNode>();
  const closedSet = new Set<string>();

  const startNode: PathNode = {
    position: start,
    g: 0,
    h: manhattanDistance(start, goal),
    f: manhattanDistance(start, goal),
    parent: null,
  };

  openSet.set(posKey(start), startNode);
  let iterations = 0;

  while (openSet.size > 0 && iterations < maxIterations) {
    iterations++;

    // Find node with lowest f score
    let current: PathNode | null = null;
    let lowestF = Infinity;

    for (const node of openSet.values()) {
      if (node.f < lowestF) {
        lowestF = node.f;
        current = node;
      }
    }

    if (!current) break;

    // Check if we reached the goal
    if (posKey(current.position) === posKey(goal)) {
      const path: Position[] = [];
      let node: PathNode | null = current;
      while (node) {
        path.unshift(node.position);
        node = node.parent;
      }
      return path;
    }

    // Move current from open to closed
    openSet.delete(posKey(current.position));
    closedSet.add(posKey(current.position));

    // Check neighbors
    for (const neighborPos of getNeighbors(current.position, maze)) {
      const neighborKey = posKey(neighborPos);

      if (closedSet.has(neighborKey)) continue;

      const g = current.g + 1;
      const h = manhattanDistance(neighborPos, goal);
      const f = g + h;

      const existingNode = openSet.get(neighborKey);

      if (!existingNode || g < existingNode.g) {
        openSet.set(neighborKey, {
          position: neighborPos,
          g,
          h,
          f,
          parent: current,
        });
      }
    }
  }

  return null;
};

/**
 * Get the direction from current position to next position
 */
const getDirectionFromDelta = (dx: number, dy: number): Direction => {
  if (dx === 1) return DIRECTIONS.RIGHT;
  if (dx === -1) return DIRECTIONS.LEFT;
  if (dy === 1) return DIRECTIONS.DOWN;
  return DIRECTIONS.UP;
};

/**
 * Get the next move direction towards a target using A*
 */
export const getNextMoveTowards = (
  current: Position,
  target: Position,
  maze: Matrix<CellType>,
  currentDirection: Direction
): Direction => {
  const path = findPath(current, target, maze);

  if (path && path.length > 1) {
    const next = path[1];
    return getDirectionFromDelta(next.x - current.x, next.y - current.y);
  }

  // Fallback: try to continue in current direction or find any valid move
  const neighbors = getNeighbors(current, maze);

  // Prefer current direction
  const currentDelta = DIRECTION_DELTAS[currentDirection];
  const preferredPos = {
    x: current.x + currentDelta.x,
    y: current.y + currentDelta.y,
  };

  if (neighbors.some((n) => n.x === preferredPos.x && n.y === preferredPos.y)) {
    return currentDirection;
  }

  // Random valid direction
  if (neighbors.length > 0) {
    const randomNeighbor =
      neighbors[Math.floor(Math.random() * neighbors.length)];
    return getDirectionFromDelta(
      randomNeighbor.x - current.x,
      randomNeighbor.y - current.y
    );
  }

  return currentDirection;
};

/**
 * Get a random valid position to wander to (for frightened ghosts)
 */
export const getRandomWanderTarget = (
  current: Position,
  maze: Matrix<CellType>,
  previousDirection: Direction
): Position => {
  const neighbors = getNeighbors(current, maze);
  const oppositeDir = OPPOSITE_DIRECTION[previousDirection];
  const oppositeDelta = DIRECTION_DELTAS[oppositeDir];

  // Avoid going back the way we came
  const filteredNeighbors = neighbors.filter((n) => {
    const dx = n.x - current.x;
    const dy = n.y - current.y;
    return dx !== oppositeDelta.x || dy !== oppositeDelta.y;
  });

  const validNeighbors =
    filteredNeighbors.length > 0 ? filteredNeighbors : neighbors;

  if (validNeighbors.length > 0) {
    return validNeighbors[Math.floor(Math.random() * validNeighbors.length)];
  }

  return current;
};
