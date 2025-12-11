// utils/gameUtils.ts
import {
  Position,
  Direction,
  CellType,
  Hitbox,
  ScoreEntry,
  GameEntity,
  Matrix,
} from "../types/types";

import {
  CELL_SIZE,
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

export const getPositionAhead = (
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
    default:
      return pos;
  }
};

export const calculateDistance = (pos1: Position, pos2: Position): number => {
  return Math.sqrt(Math.pow(pos2.x - pos1.x, 2) + Math.pow(pos2.y - pos1.y, 2));
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
