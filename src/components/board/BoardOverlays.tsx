"use client";

import React, { memo } from "react";

interface BoardOverlaysProps {
  gameOver: boolean;
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

const EndOverlay = memo(function EndOverlay() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-50 game-over-shake">
      <div
        className="text-4xl font-bold mb-4 tracking-wider text-red-500"
        style={{ textShadow: "0 0 20px rgba(255, 0, 0, 0.8)" }}
      >
        GAME OVER
      </div>
      <div className="text-xl text-gray-300">Press Start to try again</div>
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
  isPaused,
  isReady,
  isPowerMode,
}: BoardOverlaysProps) {
  const showPause = isPaused && !gameOver;
  const showReady = isReady && !gameOver && !isPaused;
  const showPower = isPowerMode && !gameOver && !isReady && !isPaused;

  return (
    <>
      {showReady ? <ReadyOverlay /> : null}
      {showPause ? <PauseOverlay /> : null}
      {gameOver ? <EndOverlay /> : null}
      {showPower ? <PowerModeOverlay /> : null}
    </>
  );
});

BoardOverlays.displayName = "BoardOverlays";
