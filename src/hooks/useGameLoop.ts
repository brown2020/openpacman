import { useEffect, useRef, useCallback } from "react";
import { useShallow } from "zustand/react/shallow";
import {
  useGameStore,
  selectGameplay,
  selectEntities,
  selectActions,
  selectCanPlay,
} from "../stores/game-store";
import { useSound } from "./useSound";
import { findAtPosition } from "../utils/position";
import {
  PACMAN_MOVE_INTERVAL,
  GHOST_MOVEMENT_INTERVAL,
  MOUTH_ANIMATION_INTERVAL,
  LEVEL_TRANSITION_DELAY,
} from "../constants/gameConstants";
import { LEVEL_COUNT } from "../levels/gameLevels";

export const useGameLoop = () => {
  // Batched state selectors
  const gameplay = useGameStore(useShallow(selectGameplay));
  const entities = useGameStore(useShallow(selectEntities));
  const actions = useGameStore(useShallow(selectActions));
  const canPlay = useGameStore(selectCanPlay);

  const { playSound } = useSound();

  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const pacmanMoveAccumulator = useRef<number>(0);
  const ghostMoveAccumulator = useRef<number>(0);
  const mouthAnimAccumulator = useRef<number>(0);
  const levelTransitionRef = useRef<boolean>(false);

  const gameLoop = useCallback(
    (currentTime: number) => {
      const { isTransitioning } = gameplay;

      if (!canPlay || isTransitioning) {
        animationFrameRef.current = requestAnimationFrame(gameLoop);
        return;
      }

      const deltaTime = lastTimeRef.current
        ? currentTime - lastTimeRef.current
        : 16;
      lastTimeRef.current = currentTime;
      const cappedDelta = Math.min(deltaTime, 100);

      pacmanMoveAccumulator.current += cappedDelta;
      ghostMoveAccumulator.current += cappedDelta;
      mouthAnimAccumulator.current += cappedDelta;

      // Update power pellet timer via tick
      actions.tick(cappedDelta);

      // Move Pacman at fixed intervals
      if (pacmanMoveAccumulator.current >= PACMAN_MOVE_INTERVAL) {
        actions.movePacman();
        pacmanMoveAccumulator.current = 0;
      }

      // Move ghosts at fixed intervals
      if (ghostMoveAccumulator.current >= GHOST_MOVEMENT_INTERVAL) {
        actions.updateGhosts(GHOST_MOVEMENT_INTERVAL);
        ghostMoveAccumulator.current = 0;
      }

      // Animate mouth
      if (mouthAnimAccumulator.current >= MOUTH_ANIMATION_INTERVAL) {
        actions.toggleMouth();
        mouthAnimAccumulator.current = 0;
      }

      animationFrameRef.current = requestAnimationFrame(gameLoop);
    },
    [gameplay, actions, canPlay]
  );

  // Collision and collection effect
  useEffect(() => {
    const { isTransitioning, level } = gameplay;
    const { pacmanPos, dots, powerPellets } = entities;

    if (!canPlay || isTransitioning) return;
    if (levelTransitionRef.current) return;

    // Check dot collection
    const dotAtPos = findAtPosition(dots, pacmanPos);
    if (dotAtPos) {
      playSound("dot");
      actions.collectDot(dotAtPos);
    }

    // Check power pellet collection
    const pelletAtPos = findAtPosition(powerPellets, pacmanPos);
    if (pelletAtPos) {
      playSound("powerPellet");
      actions.collectPowerPellet(pelletAtPos);
    }

    // Check ghost collision
    const result = actions.handleGhostCollision();
    if (result.died) {
      playSound("death");
      const currentState = useGameStore.getState().gameState;
      if (currentState.lives <= 1) {
        actions.setGameOver();
      } else {
        actions.updateGameState((prev) => ({ ...prev, lives: prev.lives - 1 }));
        actions.resetEntitiesAfterDeath();
      }
      return;
    }

    if (result.ateGhost) {
      playSound("eatGhost");
    }

    // Check level complete
    const currentState = useGameStore.getState();
    if (
      currentState.dots.length === 0 &&
      currentState.powerPellets.length === 0 &&
      !levelTransitionRef.current
    ) {
      levelTransitionRef.current = true;

      if (level === LEVEL_COUNT - 1) {
        actions.updateGameState((prev) => ({
          ...prev,
          gameWon: true,
          isPlaying: false,
        }));
      } else {
        useGameStore.setState({ isTransitioning: true });
        setTimeout(() => {
          levelTransitionRef.current = false;
          actions.startGame(level + 1);
        }, LEVEL_TRANSITION_DELAY);
      }
    }
  }, [gameplay, entities, actions, playSound, canPlay]);

  // Start/stop game loop
  useEffect(() => {
    const { isPlaying, gameOver, gameWon } = gameplay;

    if (isPlaying && !gameOver && !gameWon) {
      lastTimeRef.current = 0;
      pacmanMoveAccumulator.current = 0;
      ghostMoveAccumulator.current = 0;
      mouthAnimAccumulator.current = 0;
      levelTransitionRef.current = false;
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameplay.isPlaying, gameplay.gameOver, gameplay.gameWon, gameLoop]);

  return null;
};
