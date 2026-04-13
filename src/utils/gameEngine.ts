// utils/gameEngine.ts
import type {
  Position,
  Direction,
  Ghost,
  Matrix,
  CellType,
  LevelConfig,
} from "../types/types";
import { GhostMode, GameMode } from "../types/types";
import {
  GHOST_CONFIG,
  GHOST_NAMES,
  DIRECTIONS,
  GHOST_HOUSE_POSITION,
  GHOST_HOUSE_EXIT,
  CLYDE_CHASE_DISTANCE,
  DIRECTION_DELTAS,
  OPPOSITE_DIRECTION,
} from "../constants/gameConstants";
import { getNextMoveTowards } from "./pathfinding";
import {
  isValidMove,
  getNextPosition,
  calculateDistance,
  getPositionAhead,
  isInTunnel,
  wrapTunnel,
} from "./gameUtils";
import { positionEquals } from "./position";

/**
 * Get the target position for a ghost based on its personality and mode
 * Uses authentic Pac-Man ghost AI targeting
 */
const getGhostChaseTarget = (
  ghost: Ghost,
  pacmanPos: Position,
  pacmanDir: Direction,
  blinkyPos: Position
): Position => {
  switch (ghost.name) {
    case GHOST_NAMES.BLINKY:
      // Blinky (Red) - Direct chase, targets Pacman's position
      return pacmanPos;

    case GHOST_NAMES.PINKY:
      // Pinky (Pink) - Targets 4 tiles ahead of Pacman
      // Original game had overflow bug when Pacman faces up
      const pinkTarget = getPositionAhead(pacmanPos, pacmanDir, 4);
      // Replicate the original overflow bug when facing up
      if (pacmanDir === DIRECTIONS.UP) {
        return { x: pinkTarget.x - 4, y: pinkTarget.y };
      }
      return pinkTarget;

    case GHOST_NAMES.INKY:
      // Inky (Cyan) - Complex targeting using Blinky's position
      // Target is: 2 tiles ahead of Pacman, then vector doubled from Blinky
      const twoAhead = getPositionAhead(pacmanPos, pacmanDir, 2);
      // Same overflow bug for up direction
      const adjustedTwoAhead =
        pacmanDir === DIRECTIONS.UP
          ? { x: twoAhead.x - 2, y: twoAhead.y }
          : twoAhead;
      return {
        x: adjustedTwoAhead.x + (adjustedTwoAhead.x - blinkyPos.x),
        y: adjustedTwoAhead.y + (adjustedTwoAhead.y - blinkyPos.y),
      };

    case GHOST_NAMES.CLYDE:
      // Clyde (Orange) - Chases when far, retreats when close
      const distance = calculateDistance(ghost.position, pacmanPos);
      return distance > CLYDE_CHASE_DISTANCE
        ? pacmanPos
        : GHOST_CONFIG.CLYDE.scatterTarget;

    default:
      return pacmanPos;
  }
};

/**
 * Get ghost's scatter target (corner of the maze)
 */
const getScatterTarget = (ghost: Ghost): Position => {
  const config = GHOST_CONFIG[ghost.name];
  return config?.scatterTarget ?? { x: 0, y: 0 };
};

/**
 * Calculate ghost speed based on mode and position
 */
export const getGhostSpeed = (
  ghost: Ghost,
  levelConfig: LevelConfig,
  dotsRemaining: number
): number => {
  // Eaten ghosts move fastest
  if (ghost.mode === GhostMode.EATEN) {
    return 1.5; // 150% speed to return to house quickly
  }

  // Frightened ghosts are slower
  if (ghost.mode === GhostMode.FRIGHTENED) {
    return levelConfig.frightenedSpeed;
  }

  // Tunnel slowdown
  if (isInTunnel(ghost.position)) {
    return levelConfig.tunnelSpeed;
  }

  // Elroy mode for Blinky (speeds up when dots are low)
  if (ghost.name === GHOST_NAMES.BLINKY) {
    if (dotsRemaining <= levelConfig.elroyDotsLeft2) {
      return levelConfig.elroySpeed2;
    }
    if (dotsRemaining <= levelConfig.elroyDotsLeft1) {
      return levelConfig.elroySpeed1;
    }
  }

  return levelConfig.ghostSpeed;
};

/**
 * Determine best direction at intersection using distance-based targeting
 * This is more authentic to the original game than A* pathfinding
 */
const getBestDirectionAtIntersection = (
  ghost: Ghost,
  target: Position,
  maze: Matrix<CellType>
): Direction => {
  const currentPos = ghost.position;
  const currentDir = ghost.direction;
  const oppositeDir = OPPOSITE_DIRECTION[currentDir];

  // Priority order: Up, Left, Down, Right (original game priority)
  const directionPriority: Direction[] = [
    DIRECTIONS.UP,
    DIRECTIONS.LEFT,
    DIRECTIONS.DOWN,
    DIRECTIONS.RIGHT,
  ];

  let bestDirection = currentDir;
  let bestDistance = Infinity;

  for (const dir of directionPriority) {
    // Ghosts cannot reverse direction (except when mode changes)
    if (dir === oppositeDir) continue;

    const delta = DIRECTION_DELTAS[dir];
    const nextPos = wrapTunnel({
      x: currentPos.x + delta.x,
      y: currentPos.y + delta.y,
    });

    // Check if this direction is valid
    if (!isValidMove(nextPos, maze, true)) continue;

    // Calculate distance to target from this position
    const distance = calculateDistance(nextPos, target);

    if (distance < bestDistance) {
      bestDistance = distance;
      bestDirection = dir;
    }
  }

  return bestDirection;
};

/**
 * Get next direction for frightened ghost (pseudo-random)
 */
const getFrightenedDirection = (
  ghost: Ghost,
  maze: Matrix<CellType>
): Direction => {
  const currentPos = ghost.position;
  const oppositeDir = OPPOSITE_DIRECTION[ghost.direction];

  // Get all valid directions except reverse
  const validDirections: Direction[] = [];
  const directionOrder: Direction[] = [
    DIRECTIONS.UP,
    DIRECTIONS.LEFT,
    DIRECTIONS.DOWN,
    DIRECTIONS.RIGHT,
  ];

  for (const dir of directionOrder) {
    if (dir === oppositeDir) continue;

    const delta = DIRECTION_DELTAS[dir];
    const nextPos = wrapTunnel({
      x: currentPos.x + delta.x,
      y: currentPos.y + delta.y,
    });

    if (isValidMove(nextPos, maze, true)) {
      validDirections.push(dir);
    }
  }

  if (validDirections.length === 0) {
    // Dead end - must reverse
    return oppositeDir;
  }

  // Random selection (pseudo-random based on position for consistency)
  const randomIndex =
    (ghost.position.x * 13 + ghost.position.y * 17 + Date.now()) %
    validDirections.length;
  return validDirections[Math.floor(randomIndex) % validDirections.length];
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
  deltaTime: number,
  gameMode: GameMode,
  levelConfig: LevelConfig,
  dotsRemaining: number
): Ghost => {
  // Handle house mode - ghosts waiting to be released
  if (ghost.mode === GhostMode.HOUSE) {
    if (ghost.houseTimeLeft && ghost.houseTimeLeft > 0) {
      return { ...ghost, houseTimeLeft: ghost.houseTimeLeft - deltaTime };
    }
    // Exit house - move to exit position
    return {
      ...ghost,
      mode: GhostMode.CHASE,
      position: GHOST_HOUSE_EXIT,
      houseTimeLeft: 0,
    };
  }

  // Determine target based on mode
  let target: Position;
  let newMode: GhostMode = ghost.mode;

  switch (ghost.mode) {
    case GhostMode.CHASE:
      target = getGhostChaseTarget(ghost, pacmanPos, pacmanDir, blinkyPos);
      // Check if game mode says we should scatter
      if (gameMode === GameMode.SCATTER) {
        newMode = GhostMode.SCATTER;
        target = getScatterTarget(ghost);
      }
      break;

    case GhostMode.SCATTER:
      target = getScatterTarget(ghost);
      // Check if game mode says we should chase
      if (gameMode === GameMode.CHASE) {
        newMode = GhostMode.CHASE;
        target = getGhostChaseTarget(ghost, pacmanPos, pacmanDir, blinkyPos);
      }
      break;

    case GhostMode.FRIGHTENED:
      // Frightened ghosts use random movement
      target = ghost.position; // Target doesn't matter for frightened
      if (ghost.frightenedTimeLeft && ghost.frightenedTimeLeft <= 0) {
        newMode = gameMode === GameMode.CHASE ? GhostMode.CHASE : GhostMode.SCATTER;
      }
      break;

    case GhostMode.EATEN:
      // Head back to ghost house
      target = GHOST_HOUSE_POSITION;
      if (positionEquals(ghost.position, GHOST_HOUSE_EXIT)) {
        return {
          ...ghost,
          mode: GhostMode.HOUSE,
          position: GHOST_HOUSE_POSITION,
          houseTimeLeft: 500, // Brief delay before re-emerging
          frightenedTimeLeft: undefined,
        };
      }
      break;

    default:
      target = pacmanPos;
  }

  // Get next direction
  let newDirection: Direction;

  if (ghost.mode === GhostMode.FRIGHTENED) {
    newDirection = getFrightenedDirection(ghost, maze);
  } else if (ghost.mode === GhostMode.EATEN) {
    // Use A* for eaten ghosts to find fastest path home
    newDirection = getNextMoveTowards(
      ghost.position,
      target,
      maze,
      ghost.direction
    );
  } else {
    // Use intersection-based targeting for chase/scatter (more authentic)
    newDirection = getBestDirectionAtIntersection(ghost, target, maze);
  }

  // Calculate new position
  const newPosition = getNextPosition(ghost.position, newDirection);

  // Calculate new frightened time
  const newFrightenedTime =
    ghost.mode === GhostMode.FRIGHTENED
      ? Math.max(0, (ghost.frightenedTimeLeft || 0) - deltaTime)
      : undefined;

  // Update Elroy status for Blinky
  let elroyLevel = ghost.elroyLevel;
  let isElroy = ghost.isElroy;

  if (ghost.name === GHOST_NAMES.BLINKY) {
    if (dotsRemaining <= levelConfig.elroyDotsLeft2) {
      elroyLevel = 2;
      isElroy = true;
    } else if (dotsRemaining <= levelConfig.elroyDotsLeft1) {
      elroyLevel = 1;
      isElroy = true;
    }
  }

  if (isValidMove(newPosition, maze, true)) {
    return {
      ...ghost,
      previousPosition: ghost.position,
      position: newPosition,
      direction: newDirection,
      targetPosition: target,
      mode: newMode,
      frightenedTimeLeft: newFrightenedTime,
      isElroy,
      elroyLevel,
    };
  }

  return {
    ...ghost,
    mode: newMode,
    frightenedTimeLeft: newFrightenedTime,
    isElroy,
    elroyLevel,
  };
};

/**
 * Create initial ghost array
 */
export const createInitialGhosts = (): Ghost[] =>
  Object.values(GHOST_NAMES).map((name) => {
    const config = GHOST_CONFIG[name];
    const isOutside = name === GHOST_NAMES.BLINKY;

    return {
      position: { ...config.initialPosition },
      previousPosition: { ...config.initialPosition },
      color: config.color,
      name: name as Ghost["name"],
      mode: isOutside ? GhostMode.SCATTER : GhostMode.HOUSE,
      speed: 1,
      targetPosition: { ...config.initialPosition },
      direction: DIRECTIONS.LEFT,
      isMoving: false,
      houseTimeLeft: isOutside ? 0 : config.dotLimit * 50, // Approximation for dot-based release
      dotCounter: 0,
      isElroy: false,
      elroyLevel: 0,
    };
  });

/**
 * Set all active ghosts to frightened mode and reverse their direction
 */
export const frightenGhosts = (
  ghosts: Ghost[],
  frightenedDuration: number
): Ghost[] =>
  ghosts.map((ghost) => {
    // Don't frighten ghosts in house or already eaten
    if (ghost.mode === GhostMode.EATEN || ghost.mode === GhostMode.HOUSE) {
      return ghost;
    }

    // Reverse direction when entering frightened mode
    const reversedDirection = OPPOSITE_DIRECTION[ghost.direction];

    return {
      ...ghost,
      mode: GhostMode.FRIGHTENED,
      direction: reversedDirection,
      frightenedTimeLeft: frightenedDuration,
    };
  });

/**
 * Reverse ghost directions (called when mode changes between scatter/chase)
 */
export const reverseGhostDirections = (ghosts: Ghost[]): Ghost[] =>
  ghosts.map((ghost) => {
    // Only reverse active ghosts (not in house, not eaten, not frightened)
    if (
      ghost.mode === GhostMode.HOUSE ||
      ghost.mode === GhostMode.EATEN ||
      ghost.mode === GhostMode.FRIGHTENED
    ) {
      return ghost;
    }

    return {
      ...ghost,
      direction: OPPOSITE_DIRECTION[ghost.direction],
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
      if (ghost.mode === GhostMode.EATEN || ghost.mode === GhostMode.HOUSE) {
        continue;
      }
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
 * Original: 200, 400, 800, 1600
 */
export const getGhostEatScore = (ghostsEatenInChain: number): number =>
  200 * Math.pow(2, Math.min(ghostsEatenInChain, 3));

