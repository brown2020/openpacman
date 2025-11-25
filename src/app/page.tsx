"use client";

import dynamic from "next/dynamic";

// Dynamic import to avoid SSR issues with game state
const PacmanGame = dynamic(() => import("@/components/PacmanGame"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="text-center">
        <div 
          className="text-4xl font-bold text-yellow-400 mb-4 animate-pulse"
          style={{ fontFamily: "'Press Start 2P', monospace" }}
        >
          PAC-MAN
        </div>
        <div className="text-gray-500">Loading...</div>
      </div>
    </div>
  ),
});

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      <PacmanGame />
    </main>
  );
}
