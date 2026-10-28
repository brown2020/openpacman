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
  GHOST_DOT_LIMITS,
  GLOBAL_DOT_LIMITS,
} from "../constants/gameConstants";
import { getNextMoveTowards } from "./pathfinding";
import {
  isValidMove,
  getNextPosition,
  calculateDistance,
  getPositionAhead,
  isInTunnel,
  wrapTunnel,
  stepsForElapsed,
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

const RELEASE_ORDER = [
  GHOST_NAMES.PINKY,
  GHOST_NAMES.INKY,
  GHOST_NAMES.CLYDE,
] as const;

/** Brief pause after a ghost is eaten before it can leave the house again. */
const EATEN_RESPAWN_DELAY = 500;

export interface GhostStepContext {
  pacmanPos: Position;
  pacmanDir: Direction;
  maze: Matrix<CellType>;
  blinkyPos: Position;
  gameMode: GameMode;
  levelConfig: LevelConfig;
  dotsRemaining: number;
  powerPelletMs: number;
  globalDotCounterEnabled: boolean;
  globalDotCounter: number;
  interval: number;
}

/**
 * Dot limit that must be reached before a housed ghost may leave.
 * After a death the global counter is shared; otherwise each ghost has its own.
 */
export const ghostDotLimit = (
  name: Ghost["name"],
  globalDotCounterEnabled: boolean
): number => {
  if (name === GHOST_NAMES.BLINKY) return 0;
  if (globalDotCounterEnabled) {
    if (name === GHOST_NAMES.PINKY) return GLOBAL_DOT_LIMITS.PINKY;
    if (name === GHOST_NAMES.INKY) return GLOBAL_DOT_LIMITS.INKY;
    if (name === GHOST_NAMES.CLYDE) return GLOBAL_DOT_LIMITS.CLYDE;
    return 0;
  }
  return GHOST_DOT_LIMITS[name];
};

export const isGhostReadyToLeave = (
  ghost: Ghost,
  globalDotCounterEnabled: boolean,
  globalDotCounter: number
): boolean => {
  if (ghost.mode !== GhostMode.HOUSE) return false;
  if ((ghost.houseTimeLeft ?? 0) > 0) return false;
  const limit = ghostDotLimit(ghost.name, globalDotCounterEnabled);
  if (globalDotCounterEnabled && ghost.name !== GHOST_NAMES.BLINKY) {
    return globalDotCounter >= limit;
  }
  return ghost.dotCounter >= limit;
};

/**
 * Give the next housed ghost credit for one eaten dot.
 * Pinky's limit is 0, so dots start counting toward Inky immediately.
 * Global mode uses `globalDotCounter` instead of these personal counters.
 */
export const countDotTowardRelease = (
  ghosts: Ghost[],
  globalDotCounterEnabled: boolean
): Ghost[] => {
  if (globalDotCounterEnabled) return ghosts;

  for (const name of RELEASE_ORDER) {
    const ghost = ghosts.find((candidate) => candidate.name === name && candidate.mode === GhostMode.HOUSE);
    if (!ghost) continue;
    if (ghost.dotCounter >= ghostDotLimit(name, false)) continue;
    return ghosts.map((candidate) =>
      candidate.name === name
        ? { ...candidate, dotCounter: candidate.dotCounter + 1 }
        : candidate
    );
  }

  return ghosts;
};

/**
 * Frightened time is real time. A value of 0 (or below) ends the mode;
 * the old `time && time <= 0` check could never succeed.
 */
export const decayFrightenedTimer = (
  ghost: Ghost,
  deltaMs: number,
  gameMode: GameMode
): Ghost => {
  if (ghost.mode !== GhostMode.FRIGHTENED) return ghost;
  const left = Math.max(0, (ghost.frightenedTimeLeft ?? 0) - Math.max(0, deltaMs));
  if (left <= 0) {
    return {
      ...ghost,
      mode: gameMode === GameMode.CHASE ? GhostMode.CHASE : GhostMode.SCATTER,
      frightenedTimeLeft: undefined,
    };
  }
  return { ...ghost, frightenedTimeLeft: left };
};

export const releaseFrightenedGhosts = (
  ghosts: Ghost[],
  gameMode: GameMode
): Ghost[] =>
  ghosts.map((ghost) =>
    ghost.mode === GhostMode.FRIGHTENED
      ? decayFrightenedTimer({ ...ghost, frightenedTimeLeft: 0 }, 0, gameMode)
      : ghost
  );

const decayHouseDelay = (ghost: Ghost, deltaMs: number): Ghost => {
  if (ghost.mode !== GhostMode.HOUSE || !(ghost.houseTimeLeft && ghost.houseTimeLeft > 0)) {
    return ghost;
  }
  return { ...ghost, houseTimeLeft: Math.max(0, ghost.houseTimeLeft - Math.max(0, deltaMs)) };
};

const leaveHouse = (ghost: Ghost, ctx: GhostStepContext): Ghost => {
  const frightened = ctx.powerPelletMs > 0;
  return {
    ...ghost,
    previousPosition: ghost.position,
    position: { ...GHOST_HOUSE_EXIT },
    mode: frightened
      ? GhostMode.FRIGHTENED
      : ctx.gameMode === GameMode.CHASE
        ? GhostMode.CHASE
        : GhostMode.SCATTER,
    frightenedTimeLeft: frightened ? ctx.powerPelletMs : undefined,
    houseTimeLeft: 0,
    direction: frightened ? OPPOSITE_DIRECTION[ghost.direction] : ghost.direction,
  };
};

/**
 * Move one tile. Speed is applied by the caller via how often this runs.
 */
export const stepGhostOnce = (ghost: Ghost, ctx: GhostStepContext): Ghost => {
  if (ghost.mode === GhostMode.HOUSE) {
    if (!isGhostReadyToLeave(ghost, ctx.globalDotCounterEnabled, ctx.globalDotCounter)) {
      return ghost;
    }
    return leaveHouse(ghost, ctx);
  }

  let mode = ghost.mode;
  if (mode === GhostMode.CHASE && ctx.gameMode === GameMode.SCATTER) {
    mode = GhostMode.SCATTER;
  } else if (mode === GhostMode.SCATTER && ctx.gameMode === GameMode.CHASE) {
    mode = GhostMode.CHASE;
  }

  if (mode === GhostMode.EATEN && positionEquals(ghost.position, GHOST_HOUSE_EXIT)) {
    return {
      ...ghost,
      mode: GhostMode.HOUSE,
      position: { ...GHOST_HOUSE_POSITION },
      previousPosition: ghost.position,
      houseTimeLeft: EATEN_RESPAWN_DELAY,
      frightenedTimeLeft: undefined,
      moveAccumulator: 0,
    };
  }

  const acting = mode === ghost.mode ? ghost : { ...ghost, mode };
  let target: Position;
  if (acting.mode === GhostMode.CHASE) {
    target = getGhostChaseTarget(acting, ctx.pacmanPos, ctx.pacmanDir, ctx.blinkyPos);
  } else if (acting.mode === GhostMode.SCATTER) {
    target = getScatterTarget(acting);
  } else if (acting.mode === GhostMode.EATEN) {
    target = GHOST_HOUSE_POSITION;
  } else {
    target = acting.position;
  }

  let newDirection: Direction;
  if (acting.mode === GhostMode.FRIGHTENED) {
    newDirection = getFrightenedDirection(acting, ctx.maze);
  } else if (acting.mode === GhostMode.EATEN) {
    newDirection = getNextMoveTowards(acting.position, target, ctx.maze, acting.direction);
  } else {
    newDirection = getBestDirectionAtIntersection(acting, target, ctx.maze);
  }

  const newPosition = getNextPosition(acting.position, newDirection);

  let elroyLevel = acting.elroyLevel;
  let isElroy = acting.isElroy;
  if (acting.name === GHOST_NAMES.BLINKY) {
    if (ctx.dotsRemaining <= ctx.levelConfig.elroyDotsLeft2) {
      elroyLevel = 2;
      isElroy = true;
    } else if (ctx.dotsRemaining <= ctx.levelConfig.elroyDotsLeft1) {
      elroyLevel = 1;
      isElroy = true;
    }
  }

  if (isValidMove(newPosition, ctx.maze, true)) {
    return {
      ...acting,
      previousPosition: acting.position,
      position: newPosition,
      direction: newDirection,
      targetPosition: target,
      mode,
      isElroy,
      elroyLevel,
    };
  }

  return {
    ...acting,
    mode,
    targetPosition: target,
    isElroy,
    elroyLevel,
  };
};

/**
 * Apply real-time timers, then step using speed as a movement multiplier.
 * At most one tile per call so collision checks can run between steps.
 */
export const advanceGhostByTime = (
  ghost: Ghost,
  deltaMs: number,
  speed: number,
  ctx: GhostStepContext
): Ghost => {
  let current = decayHouseDelay(decayFrightenedTimer(ghost, deltaMs, ctx.gameMode), deltaMs);
  if (
    current.mode === GhostMode.HOUSE &&
    !isGhostReadyToLeave(current, ctx.globalDotCounterEnabled, ctx.globalDotCounter)
  ) {
    return { ...current, moveAccumulator: 0 };
  }

  const paced = stepsForElapsed(
    current.moveAccumulator ?? 0,
    deltaMs,
    speed,
    ctx.interval,
    1
  );
  for (let step = 0; step < paced.steps; step += 1) {
    current = stepGhostOnce(current, ctx);
  }
  return { ...current, moveAccumulator: paced.accumulator };
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
      houseTimeLeft: 0,
      dotCounter: 0,
      moveAccumulator: 0,
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
const ghostsOverlap = (
  ghost: Ghost,
  pacmanPos: Position,
  pacmanPrevPos?: Position
): boolean => {
  if (positionEquals(ghost.position, pacmanPos)) return true;
  if (!pacmanPrevPos || positionEquals(pacmanPrevPos, pacmanPos)) return false;
  if (positionEquals(ghost.previousPosition, ghost.position)) return false;
  return (
    positionEquals(ghost.position, pacmanPrevPos) &&
    positionEquals(ghost.previousPosition, pacmanPos)
  );
};

/**
 * Same-cell hits and head-on swaps both count.
 * A chase ghost on the tile wins over a frightened ghost so the lethal hit is not hidden.
 */
export const checkGhostCollision = (
  pacmanPos: Position,
  ghosts: Ghost[],
  pacmanPrevPos?: Position
): { collision: boolean; ghost: Ghost | null; canEat: boolean } => {
  let edible: Ghost | null = null;

  for (const ghost of ghosts) {
    if (ghost.mode === GhostMode.EATEN || ghost.mode === GhostMode.HOUSE) continue;
    if (!ghostsOverlap(ghost, pacmanPos, pacmanPrevPos)) continue;
    if (ghost.mode !== GhostMode.FRIGHTENED) {
      return { collision: true, ghost, canEat: false };
    }
    if (!edible) edible = ghost;
  }

  if (edible) return { collision: true, ghost: edible, canEat: true };
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

