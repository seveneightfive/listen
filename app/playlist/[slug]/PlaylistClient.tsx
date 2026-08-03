"use client";

import { useEffect, useRef } from "react";
import { usePlayer } from "@/context/PlayerContext";
import { FullScreenPlayer } from "@/components/player/FullScreenPlayer";
import { TrackList } from "@/components/player/TrackList";
import type { Playlist } from "@/lib/types";

export function PlaylistClient({ playlist }: { playlist: Playlist }) {
  const { playQueue, currentSong } = usePlayer();
  const hasLoaded = useRef(false);

  // Load this playlist into the shared queue once, the first time the
  // page mounts — unless the mini player is already partway through a
  // track from this same playlist (e.g. the user navigated back), in
  // which case we leave playback alone.
  useEffect(() => {
    if (hasLoaded.current) return;
    hasLoaded.current = true;
    const alreadyOnThisPlaylist =
      currentSong && playlist.songs.some((s) => s.id === currentSong.id);
    if (!alreadyOnThisPlaylist) {
      playQueue(playlist.songs, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const playlistUrl =
    typeof window !== "undefined"
      ? window.location.href
      : `https://listen.seveneightfive.com/playlist/${playlist.slug}`;

  return (
    <main className="min-h-screen bg-[--ink]">
      <FullScreenPlayer playlistName={playlist.name ?? "Playlist"} playlistUrl={playlistUrl} />
      <TrackList songs={playlist.songs} />
    </main>
  );
}
