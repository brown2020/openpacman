// utils/gameEngine.ts
import type {
  Position,
  Direction,
  Ghost,
  Matrix,
  CellType,
} from "../types/types";
import { GhostMode } from "../types/types";
import {
  GHOST_CONFIG,
  GHOST_NAMES,
  DIRECTIONS,
  GHOST_FRIGHTENED_DURATION,
  GHOST_HOUSE_RELEASE_DELAY,
  GHOST_HOUSE_POSITION,
  CLYDE_CHASE_DISTANCE,
} from "../constants/gameConstants";
import { getNextMoveTowards, getRandomWanderTarget } from "./pathfinding";
import {
  isValidMove,
  getNextPosition,
  calculateDistance,
  getPositionAhead,
} from "./gameUtils";
import { positionEquals } from "./position";

/**
 * Get the target position for a ghost based on its personality and mode
 */
const getGhostChaseTarget = (
  ghost: Ghost,
  pacmanPos: Position,
  pacmanDir: Direction,
  blinkyPos: Position
): Position => {
  switch (ghost.name) {
    case GHOST_NAMES.BLINKY:
      return pacmanPos;

    case GHOST_NAMES.PINKY:
      return getPositionAhead(pacmanPos, pacmanDir, 4);

    case GHOST_NAMES.INKY: {
      const twoAhead = getPositionAhead(pacmanPos, pacmanDir, 2);
      return {
        x: twoAhead.x + (twoAhead.x - blinkyPos.x),
        y: twoAhead.y + (twoAhead.y - blinkyPos.y),
      };
    }

    case GHOST_NAMES.CLYDE: {
      const distance = calculateDistance(ghost.position, pacmanPos);
      return distance > CLYDE_CHASE_DISTANCE
        ? pacmanPos
        : GHOST_CONFIG.CLYDE.scatterTarget;
    }

    default:
      return pacmanPos;
  }
};

/**
 * Update a single ghost's position based on its mode
 */
export const updateGhostPosition = (
  ghost: Ghost,
  pacmanPos: Position,
  pacmanDir: Direction,
  maze: Matrix<CellType>,
  blinkyPos: Position,
  deltaTime: number
): Ghost => {
  // Handle house mode - ghosts waiting to be released
  if (ghost.mode === GhostMode.HOUSE) {
    if (ghost.houseTimeLeft && ghost.houseTimeLeft > 0) {
      return { ...ghost, houseTimeLeft: ghost.houseTimeLeft - deltaTime };
    }
    return { ...ghost, mode: GhostMode.CHASE, houseTimeLeft: 0 };
  }

  // Determine target and mode based on current mode
  let target: Position;
  let newMode: GhostMode = ghost.mode;

  switch (ghost.mode) {
    case GhostMode.CHASE:
      target = getGhostChaseTarget(ghost, pacmanPos, pacmanDir, blinkyPos);
      break;

    case GhostMode.SCATTER:
      target = GHOST_CONFIG[ghost.name]?.scatterTarget ?? { x: 0, y: 0 };
      break;

    case GhostMode.FRIGHTENED:
      target = getRandomWanderTarget(ghost.position, maze, ghost.direction);
      if (ghost.frightenedTimeLeft && ghost.frightenedTimeLeft <= 0) {
        newMode = GhostMode.CHASE;
      }
      break;

    case GhostMode.EATEN:
      target = GHOST_HOUSE_POSITION;
      if (positionEquals(ghost.position, target)) {
        return {
          ...ghost,
          mode: GhostMode.HOUSE,
          houseTimeLeft: GHOST_HOUSE_RELEASE_DELAY,
        };
      }
      break;

    default:
      target = pacmanPos;
  }

  // Get next direction towards target
  const newDirection = getNextMoveTowards(
    ghost.position,
    target,
    maze,
    ghost.direction
  );
  const newPosition = getNextPosition(ghost.position, newDirection);

  // Calculate new frightened time
  const newFrightenedTime =
    ghost.mode === GhostMode.FRIGHTENED
      ? (ghost.frightenedTimeLeft || 0) - deltaTime
      : undefined;

  if (isValidMove(newPosition, maze)) {
    return {
      ...ghost,
      previousPosition: ghost.position,
      position: newPosition,
      direction: newDirection,
      targetPosition: target,
      mode: newMode,
      frightenedTimeLeft: newFrightenedTime,
    };
  }

  return { ...ghost, mode: newMode, frightenedTimeLeft: newFrightenedTime };
};

/**
 * Create initial ghost array
 */
export const createInitialGhosts = (): Ghost[] =>
  Object.values(GHOST_NAMES).map((name) => {
    const config = GHOST_CONFIG[name];
    return {
      position: { ...config.initialPosition },
      previousPosition: { ...config.initialPosition },
      color: config.color,
      name: name as Ghost["name"],
      mode: GhostMode.HOUSE,
      speed: config.speed,
      targetPosition: { ...config.initialPosition },
      direction: DIRECTIONS.LEFT,
      isMoving: false,
      houseTimeLeft: config.releaseDelay,
    };
  });

/**
 * Set all ghosts to frightened mode
 */
export const frightenGhosts = (ghosts: Ghost[]): Ghost[] =>
  ghosts.map((ghost) => {
    if (ghost.mode === GhostMode.EATEN || ghost.mode === GhostMode.HOUSE) {
      return ghost;
    }
    return {
      ...ghost,
      mode: GhostMode.FRIGHTENED,
      frightenedTimeLeft: GHOST_FRIGHTENED_DURATION,
    };
  });

/**
 * Check if Pacman collides with any ghost
 */
export const checkGhostCollision = (
  pacmanPos: Position,
  ghosts: Ghost[]
): { collision: boolean; ghost: Ghost | null; canEat: boolean } => {
  for (const ghost of ghosts) {
    if (positionEquals(ghost.position, pacmanPos)) {
      if (ghost.mode === GhostMode.EATEN) continue;
      return {
        collision: true,
        ghost,
        canEat: ghost.mode === GhostMode.FRIGHTENED,
      };
    }
  }
  return { collision: false, ghost: null, canEat: false };
};

/**
 * Eat a ghost and update its state
 */
export const eatGhost = (ghosts: Ghost[], eatenGhost: Ghost): Ghost[] =>
  ghosts.map((ghost) =>
    ghost.name === eatenGhost.name
      ? { ...ghost, mode: GhostMode.EATEN, frightenedTimeLeft: undefined }
      : ghost
  );

/**
 * Calculate score multiplier for eating ghosts in a chain
 */
export const getGhostEatScore = (ghostsEatenInChain: number): number =>
  200 * Math.pow(2, Math.min(ghostsEatenInChain, 3));
