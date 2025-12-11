// utils/pathfinding.ts
import { Position, Matrix, CellType, Direction } from "../types/types";
import { CELL_TYPES, DIRECTIONS } from "../constants/gameConstants";

interface PathNode {
  position: Position;
  g: number; // Cost from start to current node
  h: number; // Heuristic (estimated cost from current to goal)
  f: number; // Total cost (g + h)
  parent: PathNode | null;
}

/**
 * Manhattan distance heuristic for A* pathfinding
 */
const manhattanDistance = (a: Position, b: Position): number => {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
};

/**
 * Create a unique key for position to use in maps/sets
 */
const posKey = (pos: Position): string => `${pos.x},${pos.y}`;

/**
 * Get valid neighbors for a position in the maze
 */
const getNeighbors = (pos: Position, maze: Matrix<CellType>): Position[] => {
  const neighbors: Position[] = [];
  const directions = [
    { x: 0, y: -1 }, // up
    { x: 0, y: 1 },  // down
    { x: -1, y: 0 }, // left
    { x: 1, y: 0 },  // right
  ];

  for (const dir of directions) {
    const newPos = { x: pos.x + dir.x, y: pos.y + dir.y };
    
    // Check bounds
    if (
      newPos.x >= 0 &&
      newPos.x < maze[0].length &&
      newPos.y >= 0 &&
      newPos.y < maze.length
    ) {
      // Check if not a wall
      const cell = maze[newPos.y][newPos.x];
      if (cell !== CELL_TYPES.WALL) {
        neighbors.push(newPos);
      }
    }
  }

  return neighbors;
};

/**
 * A* pathfinding algorithm
 * Returns the path from start to goal, or null if no path exists
 */
export const findPath = (
  start: Position,
  goal: Position,
  maze: Matrix<CellType>,
  maxIterations = 1000
): Position[] | null => {
  // Handle edge cases
  if (posKey(start) === posKey(goal)) {
    return [start];
  }

  const openSet: Map<string, PathNode> = new Map();
  const closedSet: Set<string> = new Set();

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
      // Reconstruct path
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
    const neighbors = getNeighbors(current.position, maze);

    for (const neighborPos of neighbors) {
      const neighborKey = posKey(neighborPos);

      // Skip if in closed set
      if (closedSet.has(neighborKey)) continue;

      const g = current.g + 1;
      const h = manhattanDistance(neighborPos, goal);
      const f = g + h;

      const existingNode = openSet.get(neighborKey);

      if (!existingNode || g < existingNode.g) {
        const neighborNode: PathNode = {
          position: neighborPos,
          g,
          h,
          f,
          parent: current,
        };
        openSet.set(neighborKey, neighborNode);
      }
    }
  }

  // No path found - return path to closest point
  return null;
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
    const dx = next.x - current.x;
    const dy = next.y - current.y;

    if (dx === 1) return DIRECTIONS.RIGHT;
    if (dx === -1) return DIRECTIONS.LEFT;
    if (dy === 1) return DIRECTIONS.DOWN;
    if (dy === -1) return DIRECTIONS.UP;
  }

  // Fallback: try to continue in current direction or find any valid move
  const neighbors = getNeighbors(current, maze);
  
  // Prefer current direction
  for (const neighbor of neighbors) {
    const dx = neighbor.x - current.x;
    const dy = neighbor.y - current.y;
    
    if (currentDirection === DIRECTIONS.RIGHT && dx === 1) return DIRECTIONS.RIGHT;
    if (currentDirection === DIRECTIONS.LEFT && dx === -1) return DIRECTIONS.LEFT;
    if (currentDirection === DIRECTIONS.DOWN && dy === 1) return DIRECTIONS.DOWN;
    if (currentDirection === DIRECTIONS.UP && dy === -1) return DIRECTIONS.UP;
  }

  // Random valid direction
  if (neighbors.length > 0) {
    const randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
    const dx = randomNeighbor.x - current.x;
    const dy = randomNeighbor.y - current.y;

    if (dx === 1) return DIRECTIONS.RIGHT;
    if (dx === -1) return DIRECTIONS.LEFT;
    if (dy === 1) return DIRECTIONS.DOWN;
    if (dy === -1) return DIRECTIONS.UP;
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
  
  // Avoid going back the way we came
  const oppositeDir = getOppositeDirection(previousDirection);
  const filteredNeighbors = neighbors.filter((n) => {
    const dx = n.x - current.x;
    const dy = n.y - current.y;
    
    if (oppositeDir === DIRECTIONS.RIGHT && dx === 1) return false;
    if (oppositeDir === DIRECTIONS.LEFT && dx === -1) return false;
    if (oppositeDir === DIRECTIONS.DOWN && dy === 1) return false;
    if (oppositeDir === DIRECTIONS.UP && dy === -1) return false;
    
    return true;
  });

  const validNeighbors = filteredNeighbors.length > 0 ? filteredNeighbors : neighbors;
  
  if (validNeighbors.length > 0) {
    return validNeighbors[Math.floor(Math.random() * validNeighbors.length)];
  }
  
  return current;
};

const getOppositeDirection = (dir: Direction): Direction => {
  switch (dir) {
    case DIRECTIONS.UP: return DIRECTIONS.DOWN;
    case DIRECTIONS.DOWN: return DIRECTIONS.UP;
    case DIRECTIONS.LEFT: return DIRECTIONS.RIGHT;
    case DIRECTIONS.RIGHT: return DIRECTIONS.LEFT;
    default: return dir;
  }
};


