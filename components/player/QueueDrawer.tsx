"use client";

import Image from "next/image";
import { X, ListMusic } from "lucide-react";
import { usePlayer } from "@/context/PlayerContext";
import { formatTime } from "@/lib/format";

export function QueueDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { queue, currentIndex, playSongAt } = usePlayer();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/60">
      <button
        aria-label="Close queue"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
      />
      <div className="relative z-10 max-h-[70vh] w-full max-w-lg overflow-y-auto rounded-t-2xl border-t border-white/10 bg-[--surface] p-4 pb-24 shadow-2xl">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-[--text-muted]">
            <ListMusic size={16} />
            Queue
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1.5 text-[--text-muted] hover:bg-white/5 hover:text-[--text]"
          >
            <X size={18} />
          </button>
        </div>

        <ul className="flex flex-col gap-1">
          {queue.map((song, i) => {
            const isCurrent = i === currentIndex;
            return (
              <li key={`${song.id}-${i}`}>
                <button
                  onClick={() => playSongAt(i)}
                  className={`flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition hover:bg-white/5 ${
                    isCurrent ? "bg-white/5" : ""
                  }`}
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
          {queue.length === 0 && (
            <li className="py-8 text-center text-sm text-[--text-muted]">
              Nothing queued yet.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
