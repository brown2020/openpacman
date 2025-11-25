import { useEffect, useRef, useCallback } from "react";
import { useGameStore } from "../stores/game-store";
import { useSound } from "./useSound";
import { 
  GHOST_MOVEMENT_INTERVAL, 
  MOUTH_ANIMATION_INTERVAL,
} from "../constants/gameConstants";
import { LEVELS } from "../levels/gameLevels";

const PACMAN_MOVE_INTERVAL = 150; // ms between Pacman moves

export const useGameLoop = () => {
  const isPlaying = useGameStore((s) => s.gameState.isPlaying);
  const isPaused = useGameStore((s) => s.isPaused);
  const isTransitioning = useGameStore((s) => s.isTransitioning);
  const gameOver = useGameStore((s) => s.gameState.gameOver);
  const gameWon = useGameStore((s) => s.gameState.gameWon);
  const level = useGameStore((s) => s.gameState.level);
  const pacmanPos = useGameStore((s) => s.pacmanPos);
  const dots = useGameStore((s) => s.dots);
  const powerPellets = useGameStore((s) => s.powerPellets);
  const ghosts = useGameStore((s) => s.ghosts);

  const movePacman = useGameStore((s) => s.movePacman);
  const updateGhosts = useGameStore((s) => s.updateGhosts);
  const toggleMouth = useGameStore((s) => s.toggleMouth);
  const collectDot = useGameStore((s) => s.collectDot);
  const collectPowerPellet = useGameStore((s) => s.collectPowerPellet);
  const handleGhostCollision = useGameStore((s) => s.handleGhostCollision);
  const setGameOver = useGameStore((s) => s.setGameOver);
  const updateGameState = useGameStore((s) => s.updateGameState);
  const resetEntitiesAfterDeath = useGameStore((s) => s.resetEntitiesAfterDeath);
  const startGame = useGameStore((s) => s.startGame);

  const { playSound } = useSound();

  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const pacmanMoveAccumulator = useRef<number>(0);
  const ghostMoveAccumulator = useRef<number>(0);
  const mouthAnimAccumulator = useRef<number>(0);
  const levelTransitionRef = useRef<boolean>(false);

  const gameLoop = useCallback((currentTime: number) => {
    // Don't run loop if paused, game over, or transitioning levels
    if (!isPlaying || gameOver || gameWon || isPaused || isTransitioning) {
      animationFrameRef.current = requestAnimationFrame(gameLoop);
      return;
    }

    const deltaTime = lastTimeRef.current ? currentTime - lastTimeRef.current : 16;
    lastTimeRef.current = currentTime;

    // Cap deltaTime to prevent huge jumps if tab was backgrounded
    const cappedDelta = Math.min(deltaTime, 100);

    // Accumulate time for different systems
    pacmanMoveAccumulator.current += cappedDelta;
    ghostMoveAccumulator.current += cappedDelta;
    mouthAnimAccumulator.current += cappedDelta;

    // Move Pacman at fixed intervals
    if (pacmanMoveAccumulator.current >= PACMAN_MOVE_INTERVAL) {
      movePacman();
      pacmanMoveAccumulator.current = 0;
    }

    // Move ghosts at fixed intervals
    if (ghostMoveAccumulator.current >= GHOST_MOVEMENT_INTERVAL) {
      updateGhosts(GHOST_MOVEMENT_INTERVAL); // Use fixed interval, not accumulated
      ghostMoveAccumulator.current = 0;
    }

    // Animate mouth
    if (mouthAnimAccumulator.current >= MOUTH_ANIMATION_INTERVAL) {
      toggleMouth();
      mouthAnimAccumulator.current = 0;
    }

    animationFrameRef.current = requestAnimationFrame(gameLoop);
  }, [isPlaying, isPaused, isTransitioning, gameOver, gameWon, movePacman, updateGhosts, toggleMouth]);

  // Collision and collection effect
  useEffect(() => {
    if (!isPlaying || gameOver || gameWon || isPaused || isTransitioning) return;
    if (levelTransitionRef.current) return;

    // Check dot collection
    const dotAtPos = dots.find(
      (dot) => dot.x === pacmanPos.x && dot.y === pacmanPos.y
    );
    if (dotAtPos) {
      playSound("dot");
      collectDot(dotAtPos);
    }

    // Check power pellet collection
    const pelletAtPos = powerPellets.find(
      (p) => p.x === pacmanPos.x && p.y === pacmanPos.y
    );
    if (pelletAtPos) {
      playSound("powerPellet");
      collectPowerPellet(pelletAtPos);
    }

    // Check ghost collision
    const result = handleGhostCollision();
    if (result.died) {
      playSound("death");
      const lives = useGameStore.getState().gameState.lives;
      if (lives <= 1) {
        setGameOver();
      } else {
        updateGameState((prev) => ({
          ...prev,
          lives: prev.lives - 1,
        }));
        resetEntitiesAfterDeath();
      }
      return;
    }
    
    if (result.ateGhost) {
      playSound("eatGhost");
    }

    // Check level complete
    const currentDots = useGameStore.getState().dots;
    const currentPellets = useGameStore.getState().powerPellets;
    
    if (currentDots.length === 0 && currentPellets.length === 0 && !levelTransitionRef.current) {
      levelTransitionRef.current = true;
      
      if (level === LEVELS.length - 1) {
        // Game won!
        updateGameState((prev) => ({
          ...prev,
          gameWon: true,
          isPlaying: false,
          gameStateType: "GAME_WON",
        }));
      } else {
        // Level complete - transition to next level
        updateGameState((prev) => ({
          ...prev,
          gameStateType: "LEVEL_COMPLETE",
        }));
        
        // Use the store's isTransitioning flag
        useGameStore.setState({ isTransitioning: true });
        
        setTimeout(() => {
          levelTransitionRef.current = false;
          startGame(level + 1);
        }, 2000);
      }
    }
  }, [
    pacmanPos, 
    dots, 
    powerPellets, 
    ghosts, // Added: check collision when ghosts move too
    isPlaying, 
    isPaused, 
    isTransitioning,
    gameOver, 
    gameWon, 
    level,
    playSound,
    collectDot, 
    collectPowerPellet, 
    handleGhostCollision,
    setGameOver,
    updateGameState,
    resetEntitiesAfterDeath,
    startGame,
  ]);

  // Start/stop game loop
  useEffect(() => {
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
  }, [isPlaying, gameOver, gameWon, gameLoop]);

  return null;
};
