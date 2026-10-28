import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getLevelConfig, getLayout } from "../levels/gameLevels";
import { GHOST_HOUSE_EXIT, GHOST_MOVEMENT_INTERVAL } from "../constants/gameConstants";
import { GhostMode, GameMode } from "../types/types";
import type { Ghost } from "../types/types";
import {
  advanceGhostByTime,
  checkGhostCollision,
  countDotTowardRelease,
  createInitialGhosts,
  frightenGhosts,
  isGhostReadyToLeave,
  releaseFrightenedGhosts,
  type GhostStepContext,
} from "./gameEngine";

const layout = getLayout(0);

const ctx = (overrides: Partial<GhostStepContext> = {}): GhostStepContext => ({
  pacmanPos: { x: 13, y: 23 },
  pacmanDir: "left",
  maze: layout,
  blinkyPos: { x: 13, y: 11 },
  gameMode: GameMode.CHASE,
  levelConfig: getLevelConfig(0),
  dotsRemaining: 100,
  powerPelletMs: 0,
  globalDotCounterEnabled: false,
  globalDotCounter: 0,
  interval: GHOST_MOVEMENT_INTERVAL,
  ...overrides,
});

const named = (name: Ghost["name"]): Ghost => {
  const ghost = createInitialGhosts().find((candidate) => candidate.name === name);
  if (!ghost) throw new Error(`missing ${name}`);
  return ghost;
};

describe("frightened mode", () => {
  it("ends when the timer reaches zero instead of sticking", () => {
    const blinky = {
      ...named("BLINKY"),
      mode: GhostMode.FRIGHTENED,
      frightenedTimeLeft: 40,
    };
    const next = advanceGhostByTime(blinky, 100, 0, ctx());
    assert.notEqual(next.mode, GhostMode.FRIGHTENED);
    assert.equal(next.frightenedTimeLeft, undefined);
    assert.deepEqual(next.position, blinky.position);
  });

  it("decays frightened time in real milliseconds, not speed-scaled time", () => {
    const blinky = {
      ...named("BLINKY"),
      mode: GhostMode.FRIGHTENED,
      frightenedTimeLeft: 1000,
    };
    const next = advanceGhostByTime(blinky, 150, 0.5, ctx());
    assert.equal(next.frightenedTimeLeft, 850);
    assert.equal(next.mode, GhostMode.FRIGHTENED);
  });

  it("clears every frightened ghost when the pellet ends", () => {
    const released = releaseFrightenedGhosts(frightenGhosts(createInitialGhosts(), 5000), GameMode.SCATTER);
    assert.equal(released.some((ghost) => ghost.mode === GhostMode.FRIGHTENED), false);
    assert.equal(released.find((ghost) => ghost.name === "BLINKY")?.mode, GhostMode.SCATTER);
    assert.equal(released.find((ghost) => ghost.name === "INKY")?.mode, GhostMode.HOUSE);
  });
});

describe("movement speed", () => {
  it("waits longer when speed is below 1 and then steps one tile", () => {
    const blinky = named("BLINKY");
    const partial = advanceGhostByTime(blinky, 150, 0.5, ctx());
    assert.deepEqual(partial.position, blinky.position);
    assert.equal(partial.moveAccumulator, 75);

    const stepped = advanceGhostByTime(partial, 150, 0.5, ctx());
    assert.equal(
      Math.abs(stepped.position.x - blinky.position.x) + Math.abs(stepped.position.y - blinky.position.y),
      1
    );
  });
});

describe("ghost house release", () => {
  it("releases Pinky immediately and counts dots toward Inky then Clyde", () => {
    const pinky = named("PINKY");
    const inky = named("INKY");
    assert.equal(isGhostReadyToLeave(pinky, false, 0), true);
    assert.equal(isGhostReadyToLeave(inky, false, 0), false);

    let ghosts = createInitialGhosts();
    for (let eaten = 0; eaten < 30; eaten += 1) {
      ghosts = countDotTowardRelease(ghosts, false);
    }
    const countedInky = ghosts.find((ghost) => ghost.name === "INKY");
    const clyde = ghosts.find((ghost) => ghost.name === "CLYDE");
    assert.equal(countedInky?.dotCounter, 30);
    assert.equal(clyde?.dotCounter, 0);
    assert.equal(isGhostReadyToLeave(countedInky!, false, 0), true);

    ghosts = countDotTowardRelease(ghosts, false);
    assert.equal(ghosts.find((ghost) => ghost.name === "CLYDE")?.dotCounter, 1);
  });

  it("uses the global dot counter after a death", () => {
    const pinky = named("PINKY");
    const inky = named("INKY");
    assert.equal(isGhostReadyToLeave(pinky, true, 6), false);
    assert.equal(isGhostReadyToLeave(pinky, true, 7), true);
    assert.equal(isGhostReadyToLeave(inky, true, 16), false);
    assert.equal(isGhostReadyToLeave(inky, true, 17), true);
    const ghosts = countDotTowardRelease(createInitialGhosts(), true);
    assert.equal(ghosts.find((ghost) => ghost.name === "INKY")?.dotCounter, 0);
  });

  it("leaves the house frightened while a power pellet is active", () => {
    const pinky = named("PINKY");
    let current = pinky;
    for (let frame = 0; frame < 20 && current.mode === GhostMode.HOUSE; frame += 1) {
      current = advanceGhostByTime(current, 150, 1, ctx({ powerPelletMs: 2500, gameMode: GameMode.CHASE }));
    }
    assert.equal(current.mode, GhostMode.FRIGHTENED);
    assert.equal(current.frightenedTimeLeft, 2500);
    assert.deepEqual(current.position, GHOST_HOUSE_EXIT);
  });
});

describe("ghost collision", () => {
  it("counts a head-on tile swap", () => {
    const blinky = {
      ...named("BLINKY"),
      position: { x: 2, y: 1 },
      previousPosition: { x: 1, y: 1 },
      mode: GhostMode.CHASE,
    };
    const hit = checkGhostCollision({ x: 1, y: 1 }, [blinky], { x: 2, y: 1 });
    assert.equal(hit.collision, true);
    assert.equal(hit.canEat, false);
  });

  it("prefers a lethal ghost when a frightened ghost shares the tile", () => {
    const frightened = { ...named("BLINKY"), position: { x: 4, y: 4 }, mode: GhostMode.FRIGHTENED };
    const chase = { ...named("PINKY"), position: { x: 4, y: 4 }, mode: GhostMode.CHASE };
    const hit = checkGhostCollision({ x: 4, y: 4 }, [frightened, chase]);
    assert.equal(hit.canEat, false);
    assert.equal(hit.ghost?.name, "PINKY");
  });
});
