// components/StartScreen.tsx
import React from "react";
import type { GameScore } from "../types/types";

interface StartScreenProps {
  onStart: () => void;
  score: number;
  highScores: GameScore[];
  gameOver: boolean;
  gameWon: boolean;
}

// Animated ghost component for the start screen
const AnimatedGhost: React.FC<{ color: string; delay: number; x: number }> = ({
  color,
  delay,
  x,
}) => (
  <div
    className="absolute"
    style={{
      left: `${x}%`,
      bottom: "20%",
      animation: `ghost-float 2s ease-in-out infinite ${delay}s`,
    }}
  >
    <svg width="40" height="40" viewBox="0 0 24 24">
      <defs>
        <linearGradient
          id={`startGhost-${color}`}
          x1="0%"
          y1="0%"
          x2="0%"
          y2="100%"
        >
          <stop offset="0%" stopColor={color} />
          <stop offset="100%" stopColor={color} stopOpacity="0.7" />
        </linearGradient>
      </defs>
      <path
        d="M 0 18 Q 3 24 6 18 Q 9 24 12 18 Q 15 24 18 18 Q 21 24 24 18 L 24 6 Q 24 0 18 0 L 6 0 Q 0 0 0 6 Z"
        fill={`url(#startGhost-${color})`}
      />
      <ellipse cx="7" cy="8" rx="3" ry="4" fill="white" />
      <ellipse cx="17" cy="8" rx="3" ry="4" fill="white" />
      <circle cx="8" cy="9" r="1.5" fill="#111" />
      <circle cx="18" cy="9" r="1.5" fill="#111" />
    </svg>
  </div>
);

// Generate stars once at module level (not on every render)
const STARS = Array.from({ length: 50 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 2 + 1,
  delay: Math.random() * 5,
}));

export const StartScreen: React.FC<StartScreenProps> = ({
  onStart,
  score,
  highScores,
  gameOver,
  gameWon,
}) => {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  };

  const getMessage = () => {
    if (gameWon) return "🏆 VICTORY! 🏆";
    if (gameOver) return "GAME OVER";
    return "READY?";
  };

  const getSubMessage = () => {
    if (gameWon) return "You conquered all levels!";
    if (gameOver) return "Better luck next time!";
    return "Insert coin to play";
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center arcade-bg text-white p-4 overflow-hidden relative">
      {/* Animated starfield background */}
      {STARS.map((star) => (
        <div
          key={star.id}
          className="star"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
            animationDelay: `${star.delay}s`,
          }}
        />
      ))}

      {/* Animated ghosts */}
      <AnimatedGhost color="#FF0000" delay={0} x={70} />
      <AnimatedGhost color="#FFB8FF" delay={0.3} x={78} />
      <AnimatedGhost color="#00FFFF" delay={0.6} x={86} />
      <AnimatedGhost color="#FFB852" delay={0.9} x={94} />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center max-w-lg w-full">
        {/* Logo */}
        <div className="mb-8 text-center">
          <h1 className="text-5xl md:text-7xl font-bold title-glow mb-2 font-arcade text-[#FFE135]">
            PAC-MAN
          </h1>
          <div
            className={`text-xl md:text-2xl mt-4 tracking-wide ${
              gameWon
                ? "text-green-400"
                : gameOver
                ? "text-red-400"
                : "text-blue-400"
            }`}
          >
            {getMessage()}
          </div>
          <div className="text-sm text-gray-500 mt-2">{getSubMessage()}</div>
        </div>

        {/* Score Display (after game ends) */}
        {(gameOver || gameWon) && (
          <div className="mb-8 text-center">
            <div className="text-sm text-gray-500 uppercase tracking-wider mb-2">
              Your Score
            </div>
            <div className="text-4xl md:text-5xl font-bold text-yellow-400 font-arcade text-glow-yellow">
              {score.toLocaleString()}
            </div>
          </div>
        )}

        {/* Start Button */}
        <button
          onClick={onStart}
          className="neon-button mb-8 px-8 py-4 text-xl md:text-2xl rounded-lg
                     text-white tracking-wider uppercase font-arcade"
        >
          {gameOver || gameWon ? "Play Again" : "Start Game"}
        </button>

        {/* High Scores */}
        {highScores.length > 0 && (
          <div className="w-full mb-8">
            <h2 className="text-lg font-bold text-blue-400 mb-4 text-center tracking-wider font-arcade">
              HIGH SCORES
            </h2>
            <div className="arcade-card-dark">
              <table className="w-full arcade-table">
                <thead>
                  <tr className="text-gray-500 text-xs">
                    <th className="text-left py-2 px-2">#</th>
                    <th className="text-right px-2">Score</th>
                    <th className="text-right px-2">LVL</th>
                    <th className="text-right px-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {highScores.slice(0, 5).map((highScore, index) => (
                    <tr
                      key={highScore.timestamp}
                      className={`
                        ${index === 0 ? "text-yellow-400" : "text-gray-300"}
                        ${
                          score === highScore.score && (gameOver || gameWon)
                            ? "bg-blue-900/30"
                            : ""
                        }
                      `}
                    >
                      <td className="py-2 px-2">{index + 1}</td>
                      <td className="text-right px-2">
                        {highScore.score.toLocaleString()}
                      </td>
                      <td className="text-right px-2">{highScore.level + 1}</td>
                      <td className="text-right px-2">
                        {formatDate(highScore.timestamp)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="text-center max-w-md">
          <h2 className="text-lg font-bold text-gray-400 mb-4 tracking-wider">
            HOW TO PLAY
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="arcade-card">
              <div className="text-yellow-400 font-bold mb-2">🎮 Controls</div>
              <p className="text-gray-400">
                <span className="hidden md:inline">Arrow keys or WASD</span>
                <span className="md:hidden">Swipe in any direction</span>
              </p>
            </div>
            <div className="arcade-card">
              <div className="text-yellow-400 font-bold mb-2">🎯 Objective</div>
              <p className="text-gray-400">Eat all dots, avoid ghosts!</p>
            </div>
            <div className="arcade-card">
              <div className="text-yellow-400 font-bold mb-2">
                ⚡ Power Pellets
              </div>
              <p className="text-gray-400">Eat ghosts for bonus points!</p>
            </div>
            <div className="arcade-card">
              <div className="text-yellow-400 font-bold mb-2">🏆 Scoring</div>
              <p className="text-gray-400">Dots: 10 • Ghosts: 200+</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-600 text-xs">
          <p>Open Source Pac-Man Clone</p>
          <p className="mt-1 text-gray-700">
            Next.js • TypeScript • Tailwind CSS
          </p>
        </div>
      </div>
    </div>
  );
};

export default StartScreen;
