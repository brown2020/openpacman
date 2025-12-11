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
  GHOST_COLORS,
  GHOST_NAMES,
  GHOST_INITIAL_POSITIONS,
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
 * Ghost behavior configuration per ghost type
 */
interface GhostBehaviorConfig {
  releaseDelay: number;
  speed: number;
  scatterTarget: Position;
}

const GHOST_CONFIGS: Record<string, GhostBehaviorConfig> = {
  [GHOST_NAMES.BLINKY]: {
    releaseDelay: 0,
    speed: 1,
    scatterTarget: { x: 18, y: 0 },
  },
  [GHOST_NAMES.PINKY]: {
    releaseDelay: 2000,
    speed: 0.95,
    scatterTarget: { x: 0, y: 0 },
  },
  [GHOST_NAMES.INKY]: {
    releaseDelay: 4000,
    speed: 0.9,
    scatterTarget: { x: 18, y: 19 },
  },
  [GHOST_NAMES.CLYDE]: {
    releaseDelay: 6000,
    speed: 0.85,
    scatterTarget: { x: 0, y: 19 },
  },
};

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
        : GHOST_CONFIGS[GHOST_NAMES.CLYDE].scatterTarget;
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
      target = GHOST_CONFIGS[ghost.name]?.scatterTarget || { x: 0, y: 0 };
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
export const createInitialGhosts = (): Ghost[] => {
  const ghostNames = Object.values(GHOST_NAMES) as Array<
    keyof typeof GHOST_NAMES
  >;

  return ghostNames.map((name, index) => ({
    position: { ...GHOST_INITIAL_POSITIONS[index] },
    previousPosition: { ...GHOST_INITIAL_POSITIONS[index] },
    color: GHOST_COLORS[name as keyof typeof GHOST_COLORS],
    name: name as Ghost["name"],
    mode: GhostMode.HOUSE,
    speed: GHOST_CONFIGS[name]?.speed || 1,
    targetPosition: { ...GHOST_INITIAL_POSITIONS[index] },
    direction: DIRECTIONS.LEFT,
    isMoving: false,
    houseTimeLeft: GHOST_CONFIGS[name]?.releaseDelay || 0,
  }));
};

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
