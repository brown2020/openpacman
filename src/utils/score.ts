import { SCORE_EXTRA_LIFE_THRESHOLD } from "../constants/gameConstants";
import type { GameState } from "../types/types";

/**
 * Add points and grant the single 10,000-point extra life from any source.
 */
export function awardScore(
  state: GameState,
  points: number
): { state: GameState; extraLife: boolean } {
  const score = state.score + points;
  const extraLife = !state.extraLifeAwarded && score >= SCORE_EXTRA_LIFE_THRESHOLD;
  return {
    extraLife,
    state: {
      ...state,
      score,
      highScore: Math.max(state.highScore, score),
      lives: state.lives + (extraLife ? 1 : 0),
      extraLifeAwarded: state.extraLifeAwarded || extraLife,
    },
  };
}
