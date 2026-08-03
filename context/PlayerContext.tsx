"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { RepeatMode, Song } from "@/lib/types";

interface PlayerContextValue {
  queue: Song[];
  currentSong: Song | null;
  currentIndex: number; // index within `queue`, -1 if nothing loaded
  isPlaying: boolean;
  isBuffering: boolean;
  progress: number; // seconds
  duration: number; // seconds
  volume: number; // 0-1
  isMuted: boolean;
  isShuffled: boolean;
  repeatMode: RepeatMode;

  playQueue: (songs: Song[], startIndex?: number) => void;
  playSongAt: (index: number) => void;
  togglePlay: () => void;
  next: () => void;
  prev: () => void;
  seek: (seconds: number) => void;
  setVolume: (v: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

function shuffledOrder(length: number, keepFirst: number) {
  const indices = Array.from({ length }, (_, i) => i).filter(
    (i) => i !== keepFirst
  );
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return keepFirst >= 0 ? [keepFirst, ...indices] : indices;
}

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [originalQueue, setOriginalQueue] = useState<Song[]>([]);
  const [order, setOrder] = useState<number[]>([]); // indices into originalQueue
  const [pointer, setPointer] = useState(-1); // position within `order`

  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>("off");

  const currentIndex = pointer >= 0 ? order[pointer] : -1;
  const currentSong = currentIndex >= 0 ? originalQueue[currentIndex] : null;

  // Lazily create the single shared <audio> element.
  useEffect(() => {
    const audio = new Audio();
    audio.preload = "metadata";
    audioRef.current = audio;

    const onTimeUpdate = () => setProgress(audio.currentTime);
    const onLoadedMetadata = () => setDuration(audio.duration || 0);
    const onWaiting = () => setIsBuffering(true);
    const onPlaying = () => setIsBuffering(false);
    const onEnded = () => handleEndedRef.current();
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("waiting", onWaiting);
    audio.addEventListener("playing", onPlaying);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("waiting", onWaiting);
      audio.removeEventListener("playing", onPlaying);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.pause();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Swap the audio source whenever the current song changes.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong?.audio_url) return;
    audio.src = currentSong.audio_url;
    setProgress(0);
    if (isPlaying) {
      audio.play().catch(() => setIsPlaying(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSong?.id]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  const advance = useCallback(
    (direction: 1 | -1) => {
      setPointer((p) => {
        const len = order.length;
        if (len === 0) return -1;
        let next = p + direction;
        if (next >= len) {
          next = repeatMode === "all" ? 0 : p; // stop on last track
          if (repeatMode !== "all") setIsPlaying(false);
        }
        if (next < 0) next = 0;
        return next;
      });
    },
    [order.length, repeatMode]
  );

  function handleEnded() {
    if (repeatMode === "one") {
      const audio = audioRef.current;
      if (audio) {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      }
      return;
    }
    // The browser fires a native `pause` event right before `ended` when a
    // track finishes on its own (per the HTML5 media spec) — our `onPause`
    // listener turns that into setIsPlaying(false), which is correct for a
    // real user pause but wrong here, since we're about to continue to the
    // next track. Re-assert `true`; if `advance` finds nothing left to play
    // (last track, repeat off), it calls setIsPlaying(false) itself right
    // after this and that call wins instead.
    setIsPlaying(true);
    advance(1);
  }
  // The mount-only effect above registers `onEnded` once, so it can't close
  // over fresh `repeatMode`/`advance` values on later renders. Keeping a
  // ref updated every render lets that one-time listener always call the
  // current logic instead of whatever was true on first mount.
  const handleEndedRef = useRef(handleEnded);
  useEffect(() => {
    handleEndedRef.current = handleEnded;
  });

  const playQueue = useCallback((songs: Song[], startIndex = 0) => {
    setOriginalQueue(songs);
    setOrder(songs.map((_, i) => i)); // identity order; shuffle is opt-in separately
    setPointer(startIndex);
    setIsPlaying(true);
  }, []);

  const playSongAt = useCallback(
    (index: number) => {
      const posInOrder = order.indexOf(index);
      if (posInOrder === -1) return;
      setPointer(posInOrder);
      setIsPlaying(true);
    },
    [order]
  );

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(() => {});
    }
  }, [isPlaying, currentSong]);

  const next = useCallback(() => advance(1), [advance]);

  const prev = useCallback(() => {
    const audio = audioRef.current;
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    advance(-1);
  }, [advance]);

  const seek = useCallback((seconds: number) => {
    if (audioRef.current) audioRef.current.currentTime = seconds;
    setProgress(seconds);
  }, []);

  const setVolume = useCallback((v: number) => {
    setVolumeState(Math.min(1, Math.max(0, v)));
    setIsMuted(false);
  }, []);

  const toggleMute = useCallback(() => setIsMuted((m) => !m), []);

  const toggleShuffle = useCallback(() => {
    setIsShuffled((wasShuffled) => {
      const willShuffle = !wasShuffled;
      setOrder((prevOrder) => {
        const current = pointer >= 0 ? prevOrder[pointer] : -1;
        const newOrder = willShuffle
          ? shuffledOrder(originalQueue.length, current)
          : originalQueue.map((_, i) => i);
        setPointer(newOrder.indexOf(current));
        return newOrder;
      });
      return willShuffle;
    });
  }, [originalQueue.length, pointer]);

  const cycleRepeat = useCallback(() => {
    setRepeatMode((m) => (m === "off" ? "all" : m === "all" ? "one" : "off"));
  }, []);

  const value = useMemo<PlayerContextValue>(
    () => ({
      queue: order.map((i) => originalQueue[i]),
      currentSong,
      currentIndex,
      isPlaying,
      isBuffering,
      progress,
      duration,
      volume,
      isMuted,
      isShuffled,
      repeatMode,
      playQueue,
      playSongAt,
      togglePlay,
      next,
      prev,
      seek,
      setVolume,
      toggleMute,
      toggleShuffle,
      cycleRepeat,
    }),
    [
      order,
      originalQueue,
      currentSong,
      currentIndex,
      isPlaying,
      isBuffering,
      progress,
      duration,
      volume,
      isMuted,
      isShuffled,
      repeatMode,
      playQueue,
      playSongAt,
      togglePlay,
      next,
      prev,
      seek,
      setVolume,
      toggleMute,
      toggleShuffle,
      cycleRepeat,
    ]
  );

  return (
    <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within a PlayerProvider");
  return ctx;
}
