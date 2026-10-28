import type { GameScore } from "../types/types";

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

export function sanitizeHighScore(value: unknown, fallback: number): number {
  return isFiniteNumber(value) ? value : fallback;
}

/** Keep only complete numeric score rows so corrupt localStorage cannot crash the menu. */
export function sanitizeHighScores(value: unknown): GameScore[] {
  if (!Array.isArray(value)) return [];

  const scores: GameScore[] = [];
  for (const entry of value) {
    if (!entry || typeof entry !== "object") continue;
    const row = entry as Record<string, unknown>;
    if (
      !isFiniteNumber(row.score) ||
      !isFiniteNumber(row.level) ||
      !isFiniteNumber(row.timestamp) ||
      !isFiniteNumber(row.completion) ||
      !isFiniteNumber(row.ghostsEaten)
    ) {
      continue;
    }
    scores.push({
      score: row.score,
      level: row.level,
      timestamp: row.timestamp,
      completion: row.completion,
      ghostsEaten: row.ghostsEaten,
    });
    if (scores.length >= 5) break;
  }
  return scores;
}

export function mergeHighScorePersist<
  T extends { highScores: GameScore[]; gameState: { highScore: number } },
>(persisted: unknown, current: T): T {
  const record =
    persisted && typeof persisted === "object"
      ? (persisted as Record<string, unknown>)
      : {};
  const nested =
    record.gameState && typeof record.gameState === "object"
      ? (record.gameState as Record<string, unknown>)
      : undefined;
  const highScore = sanitizeHighScore(
    record.highScore ?? nested?.highScore,
    current.gameState.highScore
  );
  const highScores =
    record.highScores === undefined
      ? current.highScores
      : sanitizeHighScores(record.highScores);

  return {
    ...current,
    highScores,
    gameState: {
      ...current.gameState,
      highScore,
    },
  };
}
