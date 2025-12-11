// utils/gameEngine.ts
import {
  Position,
  Direction,
  Ghost,
  GhostMode,
  Matrix,
  CellType,
} from "../types/types";
import {
  CELL_TYPES,
  GHOST_COLORS,
  GHOST_NAMES,
  GHOST_INITIAL_POSITIONS,
  DIRECTIONS,
  GHOST_FRIGHTENED_DURATION,
  GHOST_CHASE_DURATION,
  GHOST_SCATTER_DURATION,
} from "../constants/gameConstants";
import { getNextMoveTowards, getRandomWanderTarget } from "./pathfinding";
import {
  isValidMove,
  getNextPosition,
  calculateDistance,
  getPositionAhead,
} from "./gameUtils";

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
export const getGhostChaseTarget = (
  ghost: Ghost,
  pacmanPos: Position,
  pacmanDir: Direction,
  blinkyPos: Position
): Position => {
  switch (ghost.name) {
    case GHOST_NAMES.BLINKY:
      // Red ghost - directly targets Pacman
      return pacmanPos;

    case GHOST_NAMES.PINKY:
      // Pink ghost - targets 4 tiles ahead of Pacman
      return getPositionAhead(pacmanPos, pacmanDir, 4);

    case GHOST_NAMES.INKY:
      // Cyan ghost - complex targeting using Blinky's position
      const twoAhead = getPositionAhead(pacmanPos, pacmanDir, 2);
      return {
        x: twoAhead.x + (twoAhead.x - blinkyPos.x),
        y: twoAhead.y + (twoAhead.y - blinkyPos.y),
      };

    case GHOST_NAMES.CLYDE:
      // Orange ghost - targets Pacman if far, scatters if close
      const distance = calculateDistance(ghost.position, pacmanPos);
      if (distance > 8) {
        return pacmanPos;
      }
      return GHOST_CONFIGS[GHOST_NAMES.CLYDE].scatterTarget;

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
      return {
        ...ghost,
        houseTimeLeft: ghost.houseTimeLeft - deltaTime,
      };
    }
    // Release the ghost
    return {
      ...ghost,
      mode: GhostMode.CHASE,
      houseTimeLeft: 0,
    };
  }

  // Determine target based on mode
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
      // Random movement when frightened
      target = getRandomWanderTarget(ghost.position, maze, ghost.direction);

      // Check if frightened time is over
      if (ghost.frightenedTimeLeft && ghost.frightenedTimeLeft <= 0) {
        newMode = GhostMode.CHASE;
      }
      break;

    case GhostMode.EATEN:
      // Return to ghost house
      target = { x: 9, y: 9 };

      // Check if reached ghost house
      if (ghost.position.x === target.x && ghost.position.y === target.y) {
        newMode = GhostMode.HOUSE;
        return {
          ...ghost,
          mode: newMode,
          houseTimeLeft: 2000,
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

  // Calculate new position
  const newPosition = getNextPosition(ghost.position, newDirection);

  // Validate the move
  if (isValidMove(newPosition, maze)) {
    return {
      ...ghost,
      previousPosition: ghost.position,
      position: newPosition,
      direction: newDirection,
      targetPosition: target,
      mode: newMode,
      frightenedTimeLeft:
        ghost.mode === GhostMode.FRIGHTENED
          ? (ghost.frightenedTimeLeft || 0) - deltaTime
          : undefined,
    };
  }

  return {
    ...ghost,
    mode: newMode,
    frightenedTimeLeft:
      ghost.mode === GhostMode.FRIGHTENED
        ? (ghost.frightenedTimeLeft || 0) - deltaTime
        : undefined,
  };
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
export const frightenGhosts = (ghosts: Ghost[]): Ghost[] => {
  return ghosts.map((ghost) => {
    // Don't frighten eaten ghosts
    if (ghost.mode === GhostMode.EATEN || ghost.mode === GhostMode.HOUSE) {
      return ghost;
    }

    return {
      ...ghost,
      mode: GhostMode.FRIGHTENED,
      frightenedTimeLeft: GHOST_FRIGHTENED_DURATION,
    };
  });
};

/**
 * Check if Pacman collides with any ghost
 */
export const checkGhostCollision = (
  pacmanPos: Position,
  ghosts: Ghost[]
): { collision: boolean; ghost: Ghost | null; canEat: boolean } => {
  for (const ghost of ghosts) {
    if (ghost.position.x === pacmanPos.x && ghost.position.y === pacmanPos.y) {
      // Only EATEN ghosts (eyes returning home) don't cause collision
      // HOUSE mode ghosts still kill Pacman - they're waiting on the playfield
      if (ghost.mode === GhostMode.EATEN) {
        continue;
      }

      const canEat = ghost.mode === GhostMode.FRIGHTENED;
      return { collision: true, ghost, canEat };
    }
  }
  return { collision: false, ghost: null, canEat: false };
};

/**
 * Eat a ghost and update its state
 */
export const eatGhost = (ghosts: Ghost[], eatenGhost: Ghost): Ghost[] => {
  return ghosts.map((ghost) => {
    if (ghost.name === eatenGhost.name) {
      return {
        ...ghost,
        mode: GhostMode.EATEN,
        frightenedTimeLeft: undefined,
      };
    }
    return ghost;
  });
};

/**
 * Get power pellet positions from the level layout
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

/**
 * Calculate score multiplier for eating ghosts in a chain
 */
export const getGhostEatScore = (ghostsEatenInChain: number): number => {
  // 200, 400, 800, 1600 for consecutive ghosts
  return 200 * Math.pow(2, Math.min(ghostsEatenInChain, 3));
};
