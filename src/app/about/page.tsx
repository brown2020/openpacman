import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About — OpenPacman",
  description: "About the OpenPacman open-source arcade game.",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-black text-white px-6 py-12 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-yellow-400 mb-4 font-arcade">
        About OpenPacman
      </h1>
      <p className="text-gray-300 mb-4 leading-relaxed">
        OpenPacman is a browser-playable Pac-Man style arcade game built with
        Next.js, React, TypeScript, Tailwind CSS, and Zustand. Gameplay runs
        entirely in the client: dots, power pellets, ghost AI, fruit bonuses,
        and local high scores persist in your browser.
      </p>
      <p className="text-gray-300 mb-8 leading-relaxed">
        There is no account system and no server-side game mutation surface.
        Scores stay on this device via localStorage.
      </p>
      <Link
        href="/"
        className="text-cyan-400 underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-400"
      >
        Back to game
      </Link>
    </main>
  );
}
