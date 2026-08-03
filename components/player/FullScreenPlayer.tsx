"use client";

import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Play, Pause, SkipBack, SkipForward, CalendarDays } from "lucide-react";
import { usePlayer } from "@/context/PlayerContext";
import { formatTime, artistProfileUrl } from "@/lib/format";
import { ShareButton } from "./ShareButton";

const RING_RADIUS = 138;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export function FullScreenPlayer({
  playlistName,
  playlistUrl,
}: {
  playlistName: string;
  playlistUrl: string;
}) {
  const {
    currentSong,
    isPlaying,
    progress,
    duration,
    togglePlay,
    next,
    prev,
    seek,
  } = usePlayer();

  const pct = duration > 0 ? progress / duration : 0;
  const dashOffset = RING_CIRCUMFERENCE * (1 - pct);

  const eventCount = currentSong?.artist?.upcomingEventCount ?? 0;

  if (!currentSong) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-6 text-center text-[--text-muted]">
        This playlist doesn&apos;t have any tracks yet.
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center px-6 pb-8 pt-10 sm:pt-16">
      <p className="mb-8 text-xs font-semibold uppercase tracking-[0.2em] text-[--text-muted]">
        {playlistName}
      </p>

      {/* artwork + circular seek ring (signature element) */}
      <div className="relative mb-8 h-72 w-72 sm:h-80 sm:w-80">
        <svg
          viewBox="0 0 300 300"
          className="absolute inset-0 h-full w-full -rotate-90"
        >
          <circle
            cx="150"
            cy="150"
            r={RING_RADIUS}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="4"
          />
          <circle
            cx="150"
            cy="150"
            r={RING_RADIUS}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={RING_CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            style={{ transition: "stroke-dashoffset 0.15s linear" }}
          />
        </svg>
        <div className="absolute inset-[18px] overflow-hidden rounded-full bg-black/40 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)]">
          {currentSong.cover_image_url ? (
            <Image
              src={currentSong.cover_image_url}
              alt={currentSong.title ?? "Album artwork"}
              fill
              sizes="320px"
              className="object-cover"
              priority
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[--surface-2] text-[--text-muted]">
              No artwork
            </div>
          )}
        </div>
      </div>

      {/* title + artist */}
      <h1 className="mb-1 text-center font-[var(--font-display)] text-3xl font-semibold uppercase tracking-wide text-[--text] sm:text-4xl">
        {currentSong.title ?? "Untitled"}
      </h1>
      {currentSong.artist?.name && (
        <p className="mb-3 text-center text-base text-[--text-muted]">
          {currentSong.artist.name}
        </p>
      )}

      {/* upcoming events tag */}
      {eventCount > 0 && currentSong.artist?.slug && (
        <Link
          href={artistProfileUrl(currentSong.artist.slug)}
          target="_blank"
          rel="noopener noreferrer"
          className="mb-6 inline-flex items-center gap-1.5 rounded-full bg-[--accent-2]/15 px-3 py-1 text-xs font-medium text-[--accent-2] transition hover:bg-[--accent-2]/25"
        >
          <CalendarDays size={13} />
          {eventCount} upcoming {eventCount === 1 ? "event" : "events"}
        </Link>
      )}

      {/* scrub bar */}
      <div className="mb-2 w-full">
        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.1}
          value={progress}
          onChange={(e) => seek(Number(e.target.value))}
          aria-label="Seek"
          className="player-scrub h-1.5 w-full cursor-pointer appearance-none bg-transparent"
          style={{ ["--pct" as string]: `${pct * 100}%` }}
        />
      </div>
      <div className="mb-8 flex w-full justify-between font-mono text-xs text-[--text-muted]">
        <span>{formatTime(progress)}</span>
        <span>-{formatTime(Math.max(0, duration - progress))}</span>
      </div>

      {/* transport */}
      <div className="mb-8 flex items-center gap-6">
        <button
          onClick={prev}
          aria-label="Previous track"
          className="text-[--text] transition hover:text-[--accent]"
        >
          <SkipBack size={26} />
        </button>
        <button
          onClick={togglePlay}
          aria-label={isPlaying ? "Pause" : "Play"}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-[--accent] text-black shadow-lg transition hover:brightness-110"
        >
          {isPlaying ? (
            <Pause size={28} fill="currentColor" />
          ) : (
            <Play size={28} fill="currentColor" className="ml-1" />
          )}
        </button>
        <button
          onClick={next}
          aria-label="Next track"
          className="text-[--text] transition hover:text-[--accent]"
        >
          <SkipForward size={26} />
        </button>
      </div>

      {/* buy + share */}
      <div className="flex items-center gap-3">
        {currentSong.buy_link && (
          <a
            href={currentSong.buy_link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded-full bg-[--text] px-6 py-2 text-sm font-semibold text-black transition hover:brightness-90"
          >
            Buy
          </a>
        )}
        <ShareButton
          title={currentSong.title ?? "Listen"}
          text={
            currentSong.artist?.name
              ? `${currentSong.title} — ${currentSong.artist.name}`
              : currentSong.title ?? undefined
          }
          url={playlistUrl}
        />
      </div>
    </div>
  );
}
