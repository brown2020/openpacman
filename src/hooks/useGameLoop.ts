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


export const useGameLoop = () => {
  // Batched state selectors
  const gameplay = useGameStore(useShallow(selectGameplay));
  const entities = useGameStore(useShallow(selectEntities));
  const actions = useGameStore(useShallow(selectActions));
  const canPlay = useGameStore(selectCanPlay);
  const powerPelletActive = useGameStore(
    (s) => s.gameState.powerPelletActive
  );
  const totalDots = useGameStore((s) => s.gameState.totalDots);

  const {
    playSound,
    startSiren,
    stopSiren,
    startFrightenedSiren,
    updateSirenSpeed,
  } = useSound();

  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const pacmanMoveAccumulator = useRef<number>(0);
  const ghostMoveAccumulator = useRef<number>(0);
  const mouthAnimAccumulator = useRef<number>(0);
  const levelTransitionRef = useRef<boolean>(false);
  const introPlayedRef = useRef<boolean>(false);
  const sirenActiveRef = useRef<boolean>(false);
  const prevPowerModeRef = useRef<boolean>(false);

  // Handle intro jingle when game starts
  useEffect(() => {
    if (gameplay.isPlaying && gameplay.isReady && !introPlayedRef.current) {
      playSound("intro");
      introPlayedRef.current = true;
    }
    if (!gameplay.isPlaying) {
      introPlayedRef.current = false;
    }
  }, [gameplay.isPlaying, gameplay.isReady, playSound]);

  // Handle siren based on game state
  useEffect(() => {
    if (!gameplay.isPlaying || gameplay.gameOver || gameplay.gameWon) {
      stopSiren();
      sirenActiveRef.current = false;
      return;
    }

    if (gameplay.isPaused || gameplay.isReady) {
      stopSiren();
      sirenActiveRef.current = false;
      return;
    }

    // Power mode - different siren
    if (powerPelletActive && !prevPowerModeRef.current) {
      startFrightenedSiren();
      sirenActiveRef.current = true;
    } else if (!powerPelletActive && prevPowerModeRef.current) {
      // Power mode ended - restart normal siren
      stopSiren();
      const dotsRemaining = entities.dots.length + entities.powerPellets.length;
      const speed = 1 + (1 - dotsRemaining / totalDots);
      startSiren(speed);
      sirenActiveRef.current = true;
    } else if (!sirenActiveRef.current && !powerPelletActive) {
      // Start siren if not running
      const dotsRemaining = entities.dots.length + entities.powerPellets.length;
      const speed = 1 + (1 - dotsRemaining / totalDots);
      startSiren(speed);
      sirenActiveRef.current = true;
    }

    prevPowerModeRef.current = powerPelletActive;
  }, [
    gameplay.isPlaying,
    gameplay.isPaused,
    gameplay.isReady,
    gameplay.gameOver,
    gameplay.gameWon,
    powerPelletActive,
    entities.dots.length,
    entities.powerPellets.length,
    totalDots,
    startSiren,
    stopSiren,
    startFrightenedSiren,
  ]);

  // Update siren speed as dots decrease
  useEffect(() => {
    if (!sirenActiveRef.current || powerPelletActive) return;
    const dotsRemaining = entities.dots.length + entities.powerPellets.length;
    const speed = 1 + (1 - dotsRemaining / Math.max(totalDots, 1));
    updateSirenSpeed(speed);
  }, [
    entities.dots.length,
    entities.powerPellets.length,
    totalDots,
    powerPelletActive,
    updateSirenSpeed,
  ]);

  const gameLoopRef = useRef<((currentTime: number) => void) | null>(null);

  const gameLoop = useCallback(
    (currentTime: number) => {
      const { isTransitioning, isReady } = gameplay;

      // During ready screen, only tick for countdown
      if (isReady && gameplay.isPlaying) {
        const deltaTime = lastTimeRef.current
          ? currentTime - lastTimeRef.current
          : 16;
        lastTimeRef.current = currentTime;
        actions.tick(Math.min(deltaTime, 100));
        animationFrameRef.current = requestAnimationFrame((t) => gameLoopRef.current?.(t));
        return;
      }

      if (!canPlay || isTransitioning) {
        animationFrameRef.current = requestAnimationFrame((t) => gameLoopRef.current?.(t));
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

      // Update timers via tick
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

      animationFrameRef.current = requestAnimationFrame((t) => gameLoopRef.current?.(t));
    },
    [gameplay, actions, canPlay]
  );

  // Keep ref in sync with latest gameLoop
  useEffect(() => {
    gameLoopRef.current = gameLoop;
  }, [gameLoop]);

  // Collision and collection effect
  useEffect(() => {
    const { isTransitioning, level, isReady } = gameplay;
    const { pacmanPos, dots, powerPellets, fruit } = entities;

    if (!canPlay || isTransitioning || isReady) return;
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

    // Check fruit collection
    if (fruit && fruit.visible) {
      const fruitCollected = actions.collectFruit();
      if (fruitCollected) {
        playSound("fruit");
      }
    }

    // Check ghost collision
    const result = actions.handleGhostCollision();
    if (result.died) {
      stopSiren();
      sirenActiveRef.current = false;
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
      stopSiren();
      sirenActiveRef.current = false;

      useGameStore.setState({ isTransitioning: true });
      setTimeout(() => {
        levelTransitionRef.current = false;
        actions.startGame(level + 1);
      }, LEVEL_TRANSITION_DELAY);
    }
  }, [gameplay, entities, actions, playSound, canPlay, stopSiren]);

  // Start/stop game loop
  useEffect(() => {
    if (gameplay.isPlaying && !gameplay.gameOver && !gameplay.gameWon) {
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
  }, [gameplay, gameLoop]);

  // Cleanup siren on unmount
  useEffect(() => {
    return () => {
      stopSiren();
    };
  }, [stopSiren]);

  return null;
};
