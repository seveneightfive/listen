"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  Volume1,
  VolumeX,
  ListMusic,
} from "lucide-react";
import { usePlayer } from "@/context/PlayerContext";
import { formatTime, artistProfileUrl } from "@/lib/format";
import { QueueDrawer } from "./QueueDrawer";

export function MiniPlayer() {
  const {
    currentSong,
    isPlaying,
    progress,
    duration,
    volume,
    isMuted,
    isShuffled,
    repeatMode,
    togglePlay,
    next,
    prev,
    seek,
    setVolume,
    toggleMute,
    toggleShuffle,
    cycleRepeat,
  } = usePlayer();

  const [queueOpen, setQueueOpen] = useState(false);

  if (!currentSong) return null;

  const pct = duration > 0 ? (progress / duration) * 100 : 0;
  const VolumeIcon = isMuted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;
  const RepeatIcon = repeatMode === "one" ? Repeat1 : Repeat;

  return (
    <>
      <QueueDrawer open={queueOpen} onClose={() => setQueueOpen(false)} />

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-[--surface]/95 backdrop-blur">
        {/* scrub bar */}
        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.1}
          value={progress}
          onChange={(e) => seek(Number(e.target.value))}
          aria-label="Seek"
          className="player-scrub absolute -top-[3px] h-1.5 w-full cursor-pointer appearance-none bg-transparent"
          style={{ ["--pct" as string]: `${pct}%` }}
        />

        <div className="mx-auto flex max-w-6xl items-center gap-3 px-3 py-2.5 sm:gap-4 sm:px-6">
          {/* artwork + meta */}
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-md bg-black/40 sm:h-12 sm:w-12">
              {currentSong.cover_image_url && (
                <Image
                  src={currentSong.cover_image_url}
                  alt=""
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[--text]">
                {currentSong.title ?? "Untitled"}
              </p>
              {currentSong.artist?.name && (
                <Link
                  href={artistProfileUrl(currentSong.artist.slug)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="truncate text-xs text-[--text-muted] hover:text-[--accent] hover:underline"
                >
                  {currentSong.artist.name}
                </Link>
              )}
            </div>
          </div>

          {/* transport controls */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={toggleShuffle}
              aria-label="Toggle shuffle"
              aria-pressed={isShuffled}
              className={`hidden rounded-full p-2 transition hover:bg-white/5 sm:inline-flex ${
                isShuffled ? "text-[--accent]" : "text-[--text-muted]"
              }`}
            >
              <Shuffle size={17} />
            </button>
            <button
              onClick={prev}
              aria-label="Previous track"
              className="rounded-full p-2 text-[--text] transition hover:bg-white/5"
            >
              <SkipBack size={18} />
            </button>
            <button
              onClick={togglePlay}
              aria-label={isPlaying ? "Pause" : "Play"}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[--accent] text-black transition hover:brightness-110"
            >
              {isPlaying ? (
                <Pause size={18} fill="currentColor" />
              ) : (
                <Play size={18} fill="currentColor" className="ml-0.5" />
              )}
            </button>
            <button
              onClick={next}
              aria-label="Next track"
              className="rounded-full p-2 text-[--text] transition hover:bg-white/5"
            >
              <SkipForward size={18} />
            </button>
            <button
              onClick={cycleRepeat}
              aria-label="Cycle repeat mode"
              className={`hidden rounded-full p-2 transition hover:bg-white/5 sm:inline-flex ${
                repeatMode !== "off" ? "text-[--accent]" : "text-[--text-muted]"
              }`}
            >
              <RepeatIcon size={17} />
            </button>
          </div>

          {/* time + volume + queue */}
          <div className="hidden flex-1 items-center justify-end gap-3 md:flex">
            <span className="font-mono text-xs text-[--text-muted]">
              {formatTime(progress)} / {formatTime(duration)}
            </span>
            <button
              onClick={toggleMute}
              aria-label={isMuted ? "Unmute" : "Mute"}
              className="text-[--text-muted] hover:text-[--text]"
            >
              <VolumeIcon size={17} />
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              aria-label="Volume"
              className="player-volume h-1 w-20 cursor-pointer appearance-none bg-transparent"
            />
          </div>

          <button
            onClick={() => setQueueOpen(true)}
            aria-label="Open queue"
            className="rounded-full p-2 text-[--text-muted] transition hover:bg-white/5 hover:text-[--text]"
          >
            <ListMusic size={18} />
          </button>
        </div>
      </div>
    </>
  );
}
