import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { mergeHighScorePersist, sanitizeHighScores } from "./highScore";

const current = {
  highScores: [],
  gameState: { highScore: 0, score: 0 },
};

describe("high score persistence", () => {
  it("drops corrupt rows instead of throwing", () => {
    const merged = mergeHighScorePersist(
      { highScores: { score: 1 }, highScore: "nope" },
      current
    );
    assert.deepEqual(merged.highScores, []);
    assert.equal(merged.gameState.highScore, 0);
    assert.equal(merged.gameState.score, 0);
    assert.equal(Array.isArray(sanitizeHighScores("nope")), true);
  });

  it("keeps numeric score rows and the saved high score", () => {
    const row = {
      score: 1200,
      level: 2,
      timestamp: 10,
      completion: 50,
      ghostsEaten: 3,
    };
    const merged = mergeHighScorePersist({ highScores: [row, { score: "x" }], highScore: 1200 }, current);
    assert.deepEqual(merged.highScores, [row]);
    assert.equal(merged.gameState.highScore, 1200);
  });
});
