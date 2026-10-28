import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const pressStart = localFont({
  src: "./fonts/PressStart2P-Regular.ttf",
  variable: "--font-arcade",
  weight: "400",
  display: "swap",
});

const vt323 = localFont({
  src: "./fonts/VT323-Regular.ttf",
  variable: "--font-vt323",
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  title: "OpenPacman - Classic Arcade Game",
  description:
    "A modern, open-source Pac-Man clone built with Next.js, TypeScript, and Tailwind CSS. Play the classic arcade game in your browser!",
  keywords: [
    "pacman",
    "pac-man",
    "arcade",
    "game",
    "retro",
    "classic",
    "browser game",
    "next.js",
  ],
  authors: [{ name: "OpenPacman Contributors" }],
  openGraph: {
    title: "OpenPacman - Classic Arcade Game",
    description: "Play the classic Pac-Man arcade game in your browser!",
    type: "website",
    locale: "en_US",
    siteName: "OpenPacman",
  },
  twitter: {
    card: "summary_large_image",
    title: "OpenPacman - Classic Arcade Game",
    description: "Play the classic Pac-Man arcade game in your browser!",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a0a0a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${pressStart.variable} ${vt323.variable} antialiased bg-black`}
      >
        {children}
      </body>
    </html>
  );
}
