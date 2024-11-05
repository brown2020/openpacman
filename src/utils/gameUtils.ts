// utils/gameUtils.ts
import {
  Position,
  Direction,
  Ghost,
  Player,
  GhostMode,
  CellType,
  Hitbox,
  ScoreEntry,
  GameEntity,
  Matrix,
  GhostName,
} from "../types/types";

import {
  CELL_SIZE,
  GHOST_COLORS,
  GHOST_NAMES,
  GHOST_INITIAL_POSITIONS,
  CELL_TYPES,
  DIRECTIONS,
  STORAGE_KEYS,
  HIGH_SCORES_MAX,
} from "../constants/gameConstants";

// Position and Movement Utils
export const isValidMove = (
  pos: Position,
  level: Matrix<CellType>
): boolean => {
  return (
    pos.x >= 0 &&
    pos.x < level[0].length &&
    pos.y >= 0 &&
    pos.y < level.length &&
    level[pos.y][pos.x] !== CELL_TYPES.WALL
  );
};

export const getNextPosition = (
  currentPos: Position,
  direction: Direction
): Position => {
  switch (direction) {
    case DIRECTIONS.UP:
      return { x: currentPos.x, y: currentPos.y - 1 };
    case DIRECTIONS.DOWN:
      return { x: currentPos.x, y: currentPos.y + 1 };
    case DIRECTIONS.LEFT:
      return { x: currentPos.x - 1, y: currentPos.y };
    case DIRECTIONS.RIGHT:
      return { x: currentPos.x + 1, y: currentPos.y };
    default:
      return currentPos;
  }
};

export const calculateDistance = (pos1: Position, pos2: Position): number => {
  return Math.sqrt(Math.pow(pos2.x - pos1.x, 2) + Math.pow(pos2.y - pos1.y, 2));
};

// Ghost Utils
export const getInitialGhosts = (): Ghost[] => {
  return [
    {
      position: GHOST_INITIAL_POSITIONS[0],
      previousPosition: GHOST_INITIAL_POSITIONS[0],
      color: GHOST_COLORS[GHOST_NAMES.BLINKY],
      name: GHOST_NAMES.BLINKY,
      mode: GhostMode.HOUSE,
      speed: 1,
      targetPosition: GHOST_INITIAL_POSITIONS[0],
      direction: DIRECTIONS.LEFT,
      isMoving: false,
      houseTimeLeft: 2000,
    },
    {
      position: GHOST_INITIAL_POSITIONS[1],
      previousPosition: GHOST_INITIAL_POSITIONS[1],
      color: GHOST_COLORS[GHOST_NAMES.PINKY],
      name: GHOST_NAMES.PINKY,
      mode: GhostMode.HOUSE,
      speed: 1,
      targetPosition: GHOST_INITIAL_POSITIONS[1],
      direction: DIRECTIONS.LEFT,
      isMoving: false,
      houseTimeLeft: 3000,
    },
    {
      position: GHOST_INITIAL_POSITIONS[2],
      previousPosition: GHOST_INITIAL_POSITIONS[2],
      color: GHOST_COLORS[GHOST_NAMES.INKY],
      name: GHOST_NAMES.INKY,
      mode: GhostMode.HOUSE,
      speed: 1,
      targetPosition: GHOST_INITIAL_POSITIONS[2],
      direction: DIRECTIONS.LEFT,
      isMoving: false,
      houseTimeLeft: 4000,
    },
    {
      position: GHOST_INITIAL_POSITIONS[3],
      previousPosition: GHOST_INITIAL_POSITIONS[3],
      color: GHOST_COLORS[GHOST_NAMES.CLYDE],
      name: GHOST_NAMES.CLYDE,
      mode: GhostMode.HOUSE,
      speed: 1,
      targetPosition: GHOST_INITIAL_POSITIONS[3],
      direction: DIRECTIONS.LEFT,
      isMoving: false,
      houseTimeLeft: 5000,
    },
  ];
};

export const getGhostTarget = (
  ghost: Ghost,
  player: Player,
  level: Matrix<CellType>
): Position => {
  switch (ghost.mode) {
    case GhostMode.CHASE:
      switch (ghost.name) {
        case GHOST_NAMES.BLINKY:
          return player.position;
        case GHOST_NAMES.PINKY:
          return getPositionInFront(player.position, player.direction, 4);
        case GHOST_NAMES.INKY:
          const twoTilesAhead = getPositionInFront(
            player.position,
            player.direction,
            2
          );
          return getInkyTarget(twoTilesAhead, ghost.position);
        case GHOST_NAMES.CLYDE:
          return calculateDistance(ghost.position, player.position) > 8
            ? player.position
            : getScatterPosition(ghost.name);
        default:
          return player.position;
      }
    case GhostMode.SCATTER:
      return getScatterPosition(ghost.name);
    case GhostMode.FRIGHTENED:
      return getRandomValidPosition(level);
    case GhostMode.EATEN:
      return { x: 9, y: 9 };
    default:
      return ghost.position;
  }
};

const getInkyTarget = (
  pacmanAhead: Position,
  blinkyPos: Position
): Position => {
  const vectorX = pacmanAhead.x - blinkyPos.x;
  const vectorY = pacmanAhead.y - blinkyPos.y;
  return {
    x: pacmanAhead.x + vectorX,
    y: pacmanAhead.y + vectorY,
  };
};

const getPositionInFront = (
  pos: Position,
  direction: Direction,
  tiles: number
): Position => {
  switch (direction) {
    case DIRECTIONS.UP:
      return { x: pos.x, y: pos.y - tiles };
    case DIRECTIONS.DOWN:
      return { x: pos.x, y: pos.y + tiles };
    case DIRECTIONS.LEFT:
      return { x: pos.x - tiles, y: pos.y };
    case DIRECTIONS.RIGHT:
      return { x: pos.x + tiles, y: pos.y };
  }
};

const getScatterPosition = (ghostName: GhostName): Position => {
  switch (ghostName) {
    case GHOST_NAMES.BLINKY:
      return { x: 18, y: 0 };
    case GHOST_NAMES.PINKY:
      return { x: 0, y: 0 };
    case GHOST_NAMES.INKY:
      return { x: 18, y: 19 };
    case GHOST_NAMES.CLYDE:
      return { x: 0, y: 19 };
    default:
      return { x: 0, y: 0 };
  }
};

// Collision Detection
export const checkCollision = (
  entity1: GameEntity,
  entity2: GameEntity
): boolean => {
  const box1 = getHitbox(entity1.position);
  const box2 = getHitbox(entity2.position);

  return (
    box1.x < box2.x + box2.width &&
    box1.x + box1.width > box2.x &&
    box1.y < box2.y + box2.height &&
    box1.y + box1.height > box2.y
  );
};

export const getHitbox = (position: Position): Hitbox => {
  return {
    x: position.x * CELL_SIZE,
    y: position.y * CELL_SIZE,
    width: CELL_SIZE,
    height: CELL_SIZE,
  };
};

// Dot Utils
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

export const getRandomValidPosition = (level: Matrix<CellType>): Position => {
  let position: Position;
  do {
    position = {
      x: Math.floor(Math.random() * level[0].length),
      y: Math.floor(Math.random() * level.length),
    };
  } while (!isValidMove(position, level));
  return position;
};

// Score Management
export const updateHighScores = (score: number, level: number): void => {
  try {
    const storedScores = localStorage.getItem(STORAGE_KEYS.HIGH_SCORES);
    const highScores: ScoreEntry[] = storedScores
      ? JSON.parse(storedScores)
      : [];

    const newScore: ScoreEntry = {
      score,
      level,
      date: Date.now(),
      completion: ((level + 1) / 3) * 100,
      ghostsEaten: 0,
    };

    highScores.push(newScore);
    highScores.sort((a, b) => b.score - a.score);

    const topScores = highScores.slice(0, HIGH_SCORES_MAX);
    localStorage.setItem(STORAGE_KEYS.HIGH_SCORES, JSON.stringify(topScores));
  } catch (error) {
    console.error(
      "Error updating high scores:",
      error instanceof Error ? error.message : "Unknown error"
    );
  }
};

// Debug Utils
export const debugLog = (message: string, data?: unknown): void => {
  if (process.env.NODE_ENV === "development") {
    console.log(`[DEBUG] ${message}`, data);
  }
};

export const getFPS = (deltaTime: number): number => {
  return Math.round(1000 / deltaTime);
};
