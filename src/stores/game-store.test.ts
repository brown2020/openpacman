import assert from "node:assert/strict";
import { describe, it } from "node:test";

const memory = new Map<string, string>();
Object.defineProperty(globalThis, "localStorage", {
  configurable: true,
  writable: true,
  value: {
    getItem: (key: string) => memory.get(key) ?? null,
    setItem: (key: string, value: string) => {
      memory.set(key, String(value));
    },
    removeItem: (key: string) => {
      memory.delete(key);
    },
    clear: () => {
      memory.clear();
    },
    key: (index: number) => [...memory.keys()][index] ?? null,
    get length() {
      return memory.size;
    },
  },
});

describe("game store rules", () => {
  it("keeps lives on the next level and resets them for a new game", async () => {
    const { useGameStore } = await import("./game-store");
    useGameStore.getState().startGame(0);
    useGameStore.setState((state) => ({
      gameState: { ...state.gameState, lives: 1 },
    }));
    useGameStore.getState().startGame(1);
    assert.equal(useGameStore.getState().gameState.lives, 1);
    useGameStore.getState().startGame(0);
    assert.equal(useGameStore.getState().gameState.lives, 3);
  });

  it("awards an extra life from fruit and from eating a ghost", async () => {
    const { useGameStore } = await import("./game-store");
    const { GhostMode } = await import("../types/types");
    const { createInitialGhosts } = await import("../utils/gameEngine");

    useGameStore.getState().startGame(0);
    const pacmanPos = { x: 13, y: 17 };
    useGameStore.setState((state) => ({
      pacmanPos,
      gameState: {
        ...state.gameState,
        isReady: false,
        score: 9900,
        extraLifeAwarded: false,
        lives: 2,
        fruit: {
          type: "key",
          position: pacmanPos,
          points: 5000,
          visible: true,
          timeRemaining: 1000,
        },
      },
    }));
    assert.equal(useGameStore.getState().collectFruit(), true);
    assert.equal(useGameStore.getState().gameState.score, 14900);
    assert.equal(useGameStore.getState().gameState.lives, 3);
    assert.equal(useGameStore.getState().extraLifeSeq, 1);

    const blinky = createInitialGhosts().find((ghost) => ghost.name === "BLINKY");
    if (!blinky) throw new Error("missing blinky");
    useGameStore.setState((state) => ({
      pacmanPos: { x: 4, y: 4 },
      pacmanPrevPos: { x: 4, y: 4 },
      ghosts: [{ ...blinky, position: { x: 4, y: 4 }, mode: GhostMode.FRIGHTENED, frightenedTimeLeft: 1000 }],
      gameState: {
        ...state.gameState,
        score: 9900,
        extraLifeAwarded: false,
        lives: 2,
      },
    }));
    const eaten = useGameStore.getState().handleGhostCollision();
    assert.equal(eaten.ateGhost, true);
    assert.equal(useGameStore.getState().gameState.lives, 3);
    assert.equal(useGameStore.getState().gameState.score, 10100);
  });

  it("returns frightened ghosts to scatter when the pellet timer ends", async () => {
    const { useGameStore } = await import("./game-store");
    const { frightenGhosts } = await import("../utils/gameEngine");
    const { GhostMode } = await import("../types/types");

    useGameStore.getState().startGame(0);
    useGameStore.setState((state) => ({
      ghosts: frightenGhosts(state.ghosts, 5000),
      gameState: {
        ...state.gameState,
        isReady: false,
        powerPelletActive: true,
        powerPelletTimeRemaining: 20,
      },
    }));
    useGameStore.getState().tick(50);
    const blinky = useGameStore.getState().ghosts.find((ghost) => ghost.name === "BLINKY");
    assert.equal(useGameStore.getState().gameState.powerPelletActive, false);
    assert.notEqual(blinky?.mode, GhostMode.FRIGHTENED);
  });
});
