// components/StartScreen.tsx
import React from "react";

interface GameScore {
  score: number;
  level: number;
  timestamp: number;
}

interface StartScreenProps {
  onStart: () => void;
  score: number;
  highScores: GameScore[];
  gameOver: boolean;
  gameWon: boolean;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  onStart,
  score,
  highScores,
  gameOver,
  gameWon,
}) => {
  // Format the date for high scores
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  // Get appropriate message based on game state
  const getMessage = () => {
    if (gameWon) return "Congratulations! You've Won!";
    if (gameOver) return "Game Over!";
    return "Welcome to Pac-Man!";
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-4">
      {/* Logo/Title */}
      <div className="mb-8 text-center">
        <h1 className="text-6xl font-bold text-yellow-400 mb-2">PAC-MAN</h1>
        <div className="text-2xl text-yellow-200">{getMessage()}</div>
      </div>

      {/* Score Display (if game just ended) */}
      {(gameOver || gameWon) && (
        <div className="mb-8 text-center">
          <div className="text-xl text-gray-400">Your Score</div>
          <div className="text-4xl text-white">{score}</div>
        </div>
      )}

      {/* High Scores */}
      {highScores.length > 0 && (
        <div className="mb-8 w-full max-w-md">
          <h2 className="text-2xl font-bold text-blue-400 mb-4 text-center">
            High Scores
          </h2>
          <div className="bg-gray-900 rounded-lg p-4">
            <table className="w-full">
              <thead>
                <tr className="text-gray-400">
                  <th className="text-left py-2">Rank</th>
                  <th className="text-right">Score</th>
                  <th className="text-right">Level</th>
                  <th className="text-right">Date</th>
                </tr>
              </thead>
              <tbody>
                {highScores.map((highScore, index) => (
                  <tr
                    key={highScore.timestamp}
                    className={`
                      ${index === 0 ? "text-yellow-400" : "text-white"}
                      ${
                        score === highScore.score && gameOver
                          ? "bg-blue-900 bg-opacity-50"
                          : ""
                      }
                    `}
                  >
                    <td className="py-2">{index + 1}</td>
                    <td className="text-right">{highScore.score}</td>
                    <td className="text-right">{highScore.level + 1}</td>
                    <td className="text-right">
                      {formatDate(highScore.timestamp)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Start Button */}
      <button
        onClick={onStart}
        className="mb-8 px-8 py-4 text-2xl bg-blue-600 hover:bg-blue-700 rounded-full
                   transition-all duration-200 transform hover:scale-105
                   focus:outline-hidden focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50"
      >
        {gameOver || gameWon ? "Play Again" : "Start Game"}
      </button>

      {/* Instructions */}
      <div className="text-center text-gray-400 max-w-md">
        <h2 className="text-xl font-bold mb-4">How to Play</h2>
        <div className="grid gap-4 text-sm">
          <div className="bg-gray-900 rounded-lg p-4">
            <h3 className="font-bold text-white mb-2">Desktop Controls</h3>
            <p>Use arrow keys to move Pac-Man</p>
          </div>
          <div className="bg-gray-900 rounded-lg p-4">
            <h3 className="font-bold text-white mb-2">Mobile Controls</h3>
            <p>Swipe in any direction to move Pac-Man</p>
          </div>
          <div className="bg-gray-900 rounded-lg p-4">
            <h3 className="font-bold text-white mb-2">Objective</h3>
            <ul className="list-disc list-inside">
              <li>Eat all dots to complete each level</li>
              <li>Avoid the ghosts</li>
              <li>Complete all levels to win</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-gray-600 text-sm">
        <p>© 2024 Pac-Man Clone</p>
        <p className="mt-1">
          Created with Next.js, TypeScript, and Tailwind CSS
        </p>
      </div>
    </div>
  );
};

export default StartScreen;
