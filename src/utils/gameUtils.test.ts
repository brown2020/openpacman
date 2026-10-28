import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { stepsForElapsed } from "./gameUtils";

describe("stepsForElapsed", () => {
  it("scales steps by speed and keeps the leftover", () => {
    const slow = stepsForElapsed(0, 100, 0.5, 100, 1);
    assert.deepEqual(slow, { accumulator: 50, steps: 0 });

    const full = stepsForElapsed(50, 100, 0.5, 100, 1);
    assert.deepEqual(full, { accumulator: 0, steps: 1 });
  });

  it("does not take more than the requested step cap", () => {
    const capped = stepsForElapsed(0, 500, 1, 100, 1);
    assert.equal(capped.steps, 1);
    assert.equal(capped.accumulator, 400);
  });
});
