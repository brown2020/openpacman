import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  findAtPosition,
  positionEquals,
  removeAtPosition,
} from "./position";

describe("position helpers", () => {
  it("compares positions", () => {
    assert.equal(positionEquals({ x: 1, y: 2 }, { x: 1, y: 2 }), true);
    assert.equal(positionEquals({ x: 1, y: 2 }, { x: 2, y: 1 }), false);
  });

  it("removes and finds by position", () => {
    const items = [
      { x: 0, y: 0, id: "a" },
      { x: 1, y: 1, id: "b" },
    ];
    assert.equal(findAtPosition(items, { x: 1, y: 1 })?.id, "b");
    const next = removeAtPosition(items, { x: 0, y: 0 });
    assert.equal(next.length, 1);
    assert.equal(next[0].id, "b");
  });
});
