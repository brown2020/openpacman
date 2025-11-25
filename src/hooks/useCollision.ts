// Collision detection is now handled in useGameLoop
// This hook is kept for backward compatibility but can be removed

import { useEffect } from "react";

export const useCollision = () => {
  // All collision logic has been moved to useGameLoop for better performance
  // and to avoid duplicate state updates
  
  useEffect(() => {
    // No-op - collision is handled in the game loop now
  }, []);
};
