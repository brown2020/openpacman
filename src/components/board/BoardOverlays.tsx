"use client";

import React, { memo } from "react";

interface BoardOverlaysProps {
  gameOver: boolean;
  gameWon: boolean;
  isPaused: boolean;
  isReady: boolean;
  isPowerMode: boolean;
}

const ReadyOverlay = memo(function ReadyOverlay() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-50">
      <div
        className="text-3xl font-bold text-yellow-400 tracking-wider ready-text"
        style={{
          textShadow: "0 0 20px rgba(255, 255, 0, 0.8)",
          animation: "ready-pulse 0.5s ease-in-out infinite",
        }}
      >
        READY!
      </div>
    </div>
  );
});

const PauseOverlay = memo(function PauseOverlay() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-50">
      <div className="pause-text text-4xl font-bold text-yellow-400 mb-4 tracking-wider">
        PAUSED
      </div>
      <div className="text-lg text-gray-400">Press ESC or P to resume</div>
    </div>
  );
});

const EndOverlay = memo(function EndOverlay({
  gameOver,
}: {
  gameOver: boolean;
}) {
  return (
    <div
      className={`absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-50 ${
        gameOver ? "game-over-shake" : "level-flash"
      }`}
    >
      <div
        className={`text-4xl font-bold mb-4 tracking-wider ${
          gameOver ? "text-red-500" : "text-green-400"
        }`}
        style={{
          textShadow: gameOver
            ? "0 0 20px rgba(255, 0, 0, 0.8)"
            : "0 0 20px rgba(0, 255, 0, 0.8)",
        }}
      >
        {gameOver ? "GAME OVER" : "LEVEL COMPLETE!"}
      </div>
      <div className="text-xl text-gray-300">
        {gameOver ? "Press Start to try again" : "Get ready..."}
      </div>
    </div>
  );
});

const PowerModeOverlay = memo(function PowerModeOverlay() {
  return (
    <div
      className="absolute inset-0 pointer-events-none z-5"
      style={{
        background:
          "radial-gradient(circle at center, transparent 30%, rgba(0, 0, 255, 0.1) 100%)",
        animation: "pulse 0.5s ease-in-out infinite",
      }}
    />
  );
});

export const BoardOverlays = memo(function BoardOverlays({
  gameOver,
  gameWon,
  isPaused,
  isReady,
  isPowerMode,
}: BoardOverlaysProps) {
  const showPause = isPaused && !gameOver && !gameWon;
  const showReady = isReady && !gameOver && !gameWon && !isPaused;
  const showEnd = gameOver || gameWon;
  const showPower = isPowerMode && !gameOver && !gameWon && !isReady && !isPaused;

  return (
    <>
      {showReady ? <ReadyOverlay /> : null}
      {showPause ? <PauseOverlay /> : null}
      {showEnd ? <EndOverlay gameOver={gameOver} /> : null}
      {showPower ? <PowerModeOverlay /> : null}
    </>
  );
});

BoardOverlays.displayName = "BoardOverlays";
