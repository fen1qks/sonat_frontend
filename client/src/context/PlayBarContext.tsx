import React, { createContext, useContext, useMemo, useRef, useState } from "react";

export type Track = {
  id: number | string;
  title: string;
  author: string;
  cover?: string;
  youtubeId?: string;
  watchUrl?: string;
};

type YouTubePlayerLike = {
  loadVideoById: (videoId: string) => void;
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead?: boolean) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  setVolume: (volume: number) => void;
};

type PlayerContextType = {
  currentTrack: Track | null;
  queue: Track[];
  currentTrackIndex: number;
  isPlaying: boolean;
  currentTime: string;
  duration: string;
  progressPercent: number;
  volumePercent: number;

  setCurrentTime: React.Dispatch<React.SetStateAction<string>>;
  setDuration: React.Dispatch<React.SetStateAction<string>>;
  setProgressPercent: React.Dispatch<React.SetStateAction<number>>;
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  setVolumePercent: React.Dispatch<React.SetStateAction<number>>;

  playTrack: (track: Track, tracks?: Track[]) => void;
  togglePlay: () => void;
  playNext: () => void;
  playPrev: () => void;
  seekToPercent: (percent: number) => void;
  setVolume: (volume: number) => void;

  playerRef: React.MutableRefObject<YouTubePlayerLike | null>;
};

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

function formatTime(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return "0:00";
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [queue, setQueue] = useState<Track[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState(false);

  const [currentTime, setCurrentTime] = useState("0:00");
  const [duration, setDuration] = useState("0:00");
  const [progressPercent, setProgressPercent] = useState(0);
  const [volumePercent, setVolumePercent] = useState(100);

  const playerRef = useRef<YouTubePlayerLike | null>(null);

  function resetProgress() {
    setCurrentTime("0:00");
    setDuration("0:00");
    setProgressPercent(0);
  }

  function playTrack(track: Track, tracks?: Track[]) {
    let nextIndex = 0;
    let nextQueue = queue;

    if (tracks && tracks.length > 0) {
      nextQueue = tracks;
      setQueue(tracks);

      nextIndex = tracks.findIndex(
        (item) =>
          String(item.id) === String(track.id) ||
          item.youtubeId === track.youtubeId
      );

      if (nextIndex < 0) nextIndex = 0;
      setCurrentTrackIndex(nextIndex);
      setCurrentTrack(tracks[nextIndex]);
    } else if (queue.length === 0) {
      nextQueue = [track];
      setQueue([track]);
      setCurrentTrackIndex(0);
      setCurrentTrack(track);
    } else {
      setCurrentTrack(track);
    }

    setIsPlaying(true);
    resetProgress();

    const videoId =
      (tracks && tracks.length > 0
        ? nextQueue[nextIndex]?.youtubeId
        : track.youtubeId) || "";

    if (videoId && playerRef.current) {
      playerRef.current.loadVideoById(videoId);
      playerRef.current.playVideo();
    }
  }

  function togglePlay() {
    if (!currentTrack || !playerRef.current) return;

    if (isPlaying) {
      playerRef.current.pauseVideo();
      setIsPlaying(false);
    } else {
      playerRef.current.playVideo();
      setIsPlaying(true);
    }
  }

  function playNext() {
    if (queue.length === 0) return;

    const nextIndex = currentTrackIndex + 1 >= queue.length ? 0 : currentTrackIndex + 1;
    const nextTrack = queue[nextIndex];

    setCurrentTrack(nextTrack);
    setCurrentTrackIndex(nextIndex);
    setIsPlaying(true);
    resetProgress();

    if (nextTrack.youtubeId && playerRef.current) {
      playerRef.current.loadVideoById(nextTrack.youtubeId);
      playerRef.current.playVideo();
    }
  }

  function playPrev() {
    if (queue.length === 0) return;

    const prevIndex = currentTrackIndex - 1 < 0 ? queue.length - 1 : currentTrackIndex - 1;
    const prevTrack = queue[prevIndex];

    setCurrentTrack(prevTrack);
    setCurrentTrackIndex(prevIndex);
    setIsPlaying(true);
    resetProgress();

    if (prevTrack.youtubeId && playerRef.current) {
      playerRef.current.loadVideoById(prevTrack.youtubeId);
      playerRef.current.playVideo();
    }
  }

  function seekToPercent(percent: number) {
    if (!playerRef.current) return;

    const durationSeconds = playerRef.current.getDuration();
    if (!durationSeconds) return;

    const clamped = Math.max(0, Math.min(100, percent));
    const targetSeconds = (clamped / 100) * durationSeconds;

    playerRef.current.seekTo(targetSeconds, true);
    setCurrentTime(formatTime(targetSeconds));
    setDuration(formatTime(durationSeconds));
    setProgressPercent(clamped);
  }

  function setVolume(volume: number) {
  const clamped = Math.max(0, Math.min(100, volume));
  setVolumePercent(clamped);

  if (playerRef.current) {
    playerRef.current.setVolume(clamped);
  }
}

const value = useMemo(
  () => ({
    currentTrack,
    queue,
    currentTrackIndex,
    isPlaying,
    currentTime,
    duration,
    progressPercent,
    volumePercent,
    setCurrentTime,
    setDuration,
    setProgressPercent,
    setIsPlaying,
    setVolumePercent,
    playTrack,
    togglePlay,
    playNext,
    playPrev,
    seekToPercent,
    setVolume,
    playerRef,
  }),
  [
    currentTrack,
    queue,
    currentTrackIndex,
    isPlaying,
    currentTime,
    duration,
    progressPercent,
    volumePercent,
  ]
);

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error("usePlayer must be used inside PlayerProvider");
  }
  return context;
}