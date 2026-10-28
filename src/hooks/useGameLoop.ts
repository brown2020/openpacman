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
  MOUTH_ANIMATION_INTERVAL,
  LEVEL_TRANSITION_DELAY,
} from "../constants/gameConstants";
import { stepsForElapsed } from "../utils/gameUtils";


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
  const pacmanSpeed = useGameStore((s) => s.levelConfig.pacmanSpeed);
  const extraLifeSeq = useGameStore((s) => s.extraLifeSeq);

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
  const mouthAnimAccumulator = useRef<number>(0);
  const pacmanSpeedRef = useRef(pacmanSpeed);
  const extraLifeSeenRef = useRef(extraLifeSeq);
  const loopActiveRef = useRef(false);
  const gameplayRef = useRef(gameplay);
  const canPlayRef = useRef(canPlay);
  const actionsRef = useRef(actions);
  const levelTransitionRef = useRef<boolean>(false);
  const levelTransitionTimeoutRef = useRef<number | null>(null);
  const introPlayedRef = useRef<boolean>(false);
  const sirenActiveRef = useRef<boolean>(false);
  const prevPowerModeRef = useRef<boolean>(false);

  useEffect(() => {
    pacmanSpeedRef.current = pacmanSpeed;
    gameplayRef.current = gameplay;
    canPlayRef.current = canPlay;
    actionsRef.current = actions;
  }, [pacmanSpeed, gameplay, canPlay, actions]);

  const clearLevelTransitionTimeout = useCallback(() => {
    if (levelTransitionTimeoutRef.current !== null) {
      window.clearTimeout(levelTransitionTimeoutRef.current);
      levelTransitionTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (extraLifeSeq === extraLifeSeenRef.current) return;
    extraLifeSeenRef.current = extraLifeSeq;
    playSound("extraLife");
  }, [extraLifeSeq, playSound]);

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

  const scheduleNextFrame = useCallback(() => {
    if (!loopActiveRef.current) return;
    animationFrameRef.current = requestAnimationFrame((t) => gameLoopRef.current?.(t));
  }, []);

  const gameLoop = useCallback(
    (currentTime: number) => {
      if (!loopActiveRef.current) return;

      const currentGameplay = gameplayRef.current;
      const currentActions = actionsRef.current;
      const playingNow = canPlayRef.current;

      // During ready screen, only tick for countdown
      if (currentGameplay.isReady && currentGameplay.isPlaying) {
        const deltaTime = lastTimeRef.current
          ? currentTime - lastTimeRef.current
          : 16;
        lastTimeRef.current = currentTime;
        currentActions.tick(Math.min(deltaTime, 100));
        scheduleNextFrame();
        return;
      }

      if (!playingNow || currentGameplay.isTransitioning) {
        lastTimeRef.current = currentTime;
        scheduleNextFrame();
        return;
      }

      const deltaTime = lastTimeRef.current
        ? currentTime - lastTimeRef.current
        : 16;
      lastTimeRef.current = currentTime;
      const cappedDelta = Math.min(deltaTime, 100);

      mouthAnimAccumulator.current += cappedDelta;

      // Update timers via tick
      currentActions.tick(cappedDelta);

      // Pac-Man's level speed fills the move accumulator; one tile per frame
      // so the collision effect still sees every cell.
      const paced = stepsForElapsed(
        pacmanMoveAccumulator.current,
        cappedDelta,
        pacmanSpeedRef.current,
        PACMAN_MOVE_INTERVAL,
        1
      );
      pacmanMoveAccumulator.current = paced.accumulator;
      for (let step = 0; step < paced.steps; step += 1) {
        currentActions.movePacman();
      }

      // Ghost speed is applied inside the store from this real-time delta.
      currentActions.updateGhosts(cappedDelta);

      // Animate mouth
      if (mouthAnimAccumulator.current >= MOUTH_ANIMATION_INTERVAL) {
        currentActions.toggleMouth();
        mouthAnimAccumulator.current = 0;
      }

      scheduleNextFrame();
    },
    [scheduleNextFrame]
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
      clearLevelTransitionTimeout();
      levelTransitionTimeoutRef.current = window.setTimeout(() => {
        levelTransitionTimeoutRef.current = null;
        levelTransitionRef.current = false;
        // Authored levels continue via getLevelConfig; there is no terminal victory.
        actions.startGame(level + 1);
      }, LEVEL_TRANSITION_DELAY);
    }
  }, [
    gameplay,
    entities,
    actions,
    playSound,
    canPlay,
    stopSiren,
    clearLevelTransitionTimeout,
  ]);

  useEffect(() => {
    pacmanMoveAccumulator.current = 0;
    mouthAnimAccumulator.current = 0;
  }, [gameplay.level, gameplay.isReady]);

  // Run the loop only while a game is active. Pause stops it; scatter/chase
  // changes do not restart it, so movement accumulators keep their progress.
  useEffect(() => {
    const shouldRun =
      gameplay.isPlaying && !gameplay.gameOver && !gameplay.gameWon && !gameplay.isPaused;
    if (!shouldRun) {
      loopActiveRef.current = false;
      return;
    }

    loopActiveRef.current = true;
    lastTimeRef.current = 0;
    animationFrameRef.current = requestAnimationFrame((t) => gameLoopRef.current?.(t));

    return () => {
      loopActiveRef.current = false;
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [gameplay.isPlaying, gameplay.gameOver, gameplay.gameWon, gameplay.isPaused]);

  useEffect(() => {
    if (!gameplay.isPlaying || gameplay.gameOver || gameplay.gameWon) {
      clearLevelTransitionTimeout();
      levelTransitionRef.current = false;
    }
  }, [
    gameplay.isPlaying,
    gameplay.gameOver,
    gameplay.gameWon,
    clearLevelTransitionTimeout,
  ]);

  // Cleanup siren on unmount
  useEffect(() => {
    return () => {
      clearLevelTransitionTimeout();
      stopSiren();
    };
  }, [clearLevelTransitionTimeout, stopSiren]);

  return null;
};
