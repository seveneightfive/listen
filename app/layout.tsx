import type { Metadata } from "next";
import { Oswald, DM_Sans, IBM_Plex_Mono } from "next/font/google";
import { PlayerProvider } from "@/context/PlayerContext";
import { MiniPlayer } from "@/components/player/MiniPlayer";
import "./globals.css";

// Matches app/globals.css's --font-display / --font-sans in the main
// seveneightfive.com repo (Oswald + DM Sans).
const display = Oswald({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});
const body = DM_Sans({ subsets: ["latin"], variable: "--font-body" });
// Not part of the 785 design system — used only for the tape-counter-style
// time readouts in the player, which is a "listen" specific accent.
const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Listen — Seven Eight Five",
  description: "Music from Topeka artists, curated and streamed.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      {/* Neutral/light by default, matching seveneightfive.com's public
          pages. The full-screen player sets its own dark background
          locally (app/playlist/[slug]/PlaylistClient.tsx) — that screen
          is intentionally moodier, the way Spotify's now-playing view is
          dark even though the browse UI around it is light. */}
      <body className="bg-white font-[var(--font-body)] text-gray-800">
        <PlayerProvider>
          {/* pb-20 keeps page content clear of the fixed mini player */}
          <div className="pb-20">{children}</div>
          <MiniPlayer />
        </PlayerProvider>
      </body>
    </html>
  );
}
