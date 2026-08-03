"use client";

import Image from "next/image";
import { Play, Pause } from "lucide-react";
import { usePlayer } from "@/context/PlayerContext";
import { formatTime } from "@/lib/format";
import type { Song } from "@/lib/types";

export function TrackList({ songs }: { songs: Song[] }) {
  const { currentIndex, isPlaying, playSongAt, togglePlay } = usePlayer();

  return (
    <div className="mx-auto w-full max-w-md px-6 pb-32">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[--text-muted]">
        Up next
      </p>
      <ul className="flex flex-col divide-y divide-white/5">
        {songs.map((song, i) => {
          const isCurrent = i === currentIndex;
          return (
            <li key={song.id}>
              <button
                onClick={() => (isCurrent ? togglePlay() : playSongAt(i))}
                className="flex w-full items-center gap-3 py-2.5 text-left transition hover:bg-white/5"
              >
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-black/40">
                  {song.cover_image_url && (
                    <Image
                      src={song.cover_image_url}
                      alt=""
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  )}
                  {isCurrent && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                      {isPlaying ? (
                        <Pause size={14} className="text-white" />
                      ) : (
                        <Play size={14} className="ml-0.5 text-white" />
                      )}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className={`truncate text-sm font-medium ${
                      isCurrent ? "text-[--accent]" : "text-[--text]"
                    }`}
                  >
                    {song.title ?? "Untitled"}
                  </p>
                  <p className="truncate text-xs text-[--text-muted]">
                    {song.artist?.name ?? "Unknown artist"}
                  </p>
                </div>
                <span className="font-mono text-xs text-[--text-muted]">
                  {formatTime(song.duration_seconds)}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
