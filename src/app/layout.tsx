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

export const metadata: Metadata = {
  title: "OpenPacman - Classic Arcade Game",
  description: "A modern, open-source Pac-Man clone built with Next.js, TypeScript, and Tailwind CSS. Play the classic arcade game in your browser!",
  keywords: ["pacman", "pac-man", "arcade", "game", "retro", "classic", "browser game", "next.js"],
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
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0a0a0a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black`}
      >
        {children}
      </body>
    </html>
  );
}
