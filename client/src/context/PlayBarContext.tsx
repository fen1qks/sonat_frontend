import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Track } from "../types/track";

type YouTubePlayerLike = {
  loadVideoById: (videoId: string) => void;
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead?: boolean) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  setVolume: (volume: number) => void;
  destroy?: () => void;
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

  youtubePlayerRef: React.MutableRefObject<YouTubePlayerLike | null>;
  spotifyPlayerRef: React.MutableRefObject<SpotifyEmbedController | null>;
  audioPlayerRef: React.MutableRefObject<HTMLAudioElement | null>;
};

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

function formatTime(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return "0:00";
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function parseTimeToSeconds(value: string): number {
  if (!value || !value.includes(":")) return 0;

  const parts = value.split(":").map(Number);
  if (parts.some((part) => Number.isNaN(part))) return 0;

  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }

  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }

  return 0;
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

  const youtubePlayerRef = useRef<YouTubePlayerLike | null>(null);
  const spotifyPlayerRef = useRef<SpotifyEmbedController | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  const resetProgress = useCallback(() => {
    setCurrentTime("0:00");
    setDuration("0:00");
    setProgressPercent(0);
  }, []);

  const stopYouTubePlayer = useCallback(() => {
    if (youtubePlayerRef.current) {
      console.log("[PlayerContext] stopYouTubePlayer -> pauseVideo()");
      youtubePlayerRef.current.pauseVideo();
    }
  }, []);

  const stopSpotifyPlayer = useCallback(() => {
    if (spotifyPlayerRef.current) {
      console.log("[PlayerContext] stopSpotifyPlayer -> pause()");
      spotifyPlayerRef.current.pause();
    }
  }, []);

  const stopTelegramPlayer = useCallback(() => {
    if (audioPlayerRef.current) {
      console.log("[PlayerContext] stopTelegramPlayer -> pause()");
      audioPlayerRef.current.pause();
    }
  }, []);

  const stopPlayersExcept = useCallback(
    (sourceType?: Track["sourceType"] | null) => {
      if (sourceType !== "youtube") {
        stopYouTubePlayer();
      }

      if (sourceType !== "spotify") {
        stopSpotifyPlayer();
      }

      if (sourceType !== "telegram") {
        stopTelegramPlayer();
      }
    },
    [stopSpotifyPlayer, stopTelegramPlayer, stopYouTubePlayer]
  );

  const pauseActivePlayer = useCallback(() => {
    if (currentTrack?.sourceType === "youtube") {
      stopYouTubePlayer();
    }

    if (currentTrack?.sourceType === "spotify") {
      stopSpotifyPlayer();
    }

    if (currentTrack?.sourceType === "telegram") {
      stopTelegramPlayer();
    }
  }, [
    currentTrack?.sourceType,
    stopSpotifyPlayer,
    stopTelegramPlayer,
    stopYouTubePlayer,
  ]);

  const playTrack = useCallback(
    (track: Track, tracks?: Track[]) => {
      console.log("[PlayerContext] playTrack called", {
        track,
        sourceType: track?.sourceType,
        sourceId: track?.sourceId,
        id: track?.id,
        watchUrl: track?.watchUrl,
        tracksLength: tracks?.length,
      });

      let nextQueue = queue;
      let nextIndex = 0;
      let nextTrack = track;

      if (tracks && tracks.length > 0) {
        nextQueue = tracks;
        setQueue(tracks);

        nextIndex = tracks.findIndex(
          (item) =>
            String(item.id) === String(track.id) ||
            item.sourceId === track.sourceId
        );

        if (nextIndex < 0) nextIndex = 0;
        nextTrack = tracks[nextIndex];
      } else if (queue.length === 0) {
        nextQueue = [track];
        nextIndex = 0;
        nextTrack = track;
        setQueue(nextQueue);
      } else {
        const queueIndex = queue.findIndex(
          (item) =>
            String(item.id) === String(track.id) ||
            item.sourceId === track.sourceId
        );

        if (queueIndex >= 0) {
          nextIndex = queueIndex;
          nextTrack = queue[queueIndex];
        } else {
          nextQueue = [track];
          nextIndex = 0;
          nextTrack = track;
          setQueue(nextQueue);
        }
      }

      stopPlayersExcept(nextTrack?.sourceType);
      setCurrentTrackIndex(nextIndex);
      setCurrentTrack(nextTrack);
      setIsPlaying(true);
      resetProgress();
    },
    [queue, resetProgress, stopPlayersExcept]
  );

  const togglePlay = useCallback(() => {
    if (!currentTrack) return;

    console.log("[PlayerContext] togglePlay called", {
      currentTrack,
      sourceType: currentTrack.sourceType,
      isPlaying,
    });

    if (!isPlaying) {
      stopPlayersExcept(currentTrack.sourceType);
    }

    setIsPlaying((prev) => !prev);
  }, [currentTrack, isPlaying, stopPlayersExcept]);

  const playNext = useCallback(() => {
    if (queue.length === 0) return;

    const isLastTrack = currentTrackIndex >= queue.length - 1;

    if (isLastTrack) {
      console.log("[PlayerContext] playNext -> end of queue, stop");
      setIsPlaying(false);
      pauseActivePlayer();
      return;
    }

    const nextIndex = currentTrackIndex + 1;
    const nextTrack = queue[nextIndex];

    if (!nextTrack) return;

    console.log("[PlayerContext] playNext resolved", {
      nextTrack,
      sourceType: nextTrack?.sourceType,
      sourceId: nextTrack?.sourceId,
      watchUrl: nextTrack?.watchUrl,
    });

    stopPlayersExcept(nextTrack.sourceType);
    setCurrentTrack(nextTrack);
    setCurrentTrackIndex(nextIndex);
    setIsPlaying(true);
    resetProgress();
  }, [queue, currentTrackIndex, pauseActivePlayer, resetProgress, stopPlayersExcept]);

  const playPrev = useCallback(() => {
    if (queue.length === 0) return;
    if (currentTrackIndex <= 0) {
      console.log("[PlayerContext] playPrev -> start of queue");
      return;
    }

    const prevIndex = currentTrackIndex - 1;
    const prevTrack = queue[prevIndex];

    if (!prevTrack) return;

    console.log("[PlayerContext] playPrev resolved", {
      prevTrack,
      sourceType: prevTrack?.sourceType,
      sourceId: prevTrack?.sourceId,
      watchUrl: prevTrack?.watchUrl,
    });

    stopPlayersExcept(prevTrack.sourceType);
    setCurrentTrack(prevTrack);
    setCurrentTrackIndex(prevIndex);
    setIsPlaying(true);
    resetProgress();
  }, [queue, currentTrackIndex, resetProgress, stopPlayersExcept]);

  const seekToPercent = useCallback(
    (percent: number) => {
      if (!currentTrack) return;

      console.log("[PlayerContext] seekToPercent called", {
        percent,
        sourceType: currentTrack.sourceType,
      });

      if (currentTrack.sourceType === "youtube" && youtubePlayerRef.current) {
        const durationSeconds = youtubePlayerRef.current.getDuration();
        if (!durationSeconds) return;

        const clamped = Math.max(0, Math.min(100, percent));
        const targetSeconds = (clamped / 100) * durationSeconds;

        youtubePlayerRef.current.seekTo(targetSeconds, true);
        setCurrentTime(formatTime(targetSeconds));
        setDuration(formatTime(durationSeconds));
        setProgressPercent(clamped);
        return;
      }

      if (currentTrack.sourceType === "spotify" && spotifyPlayerRef.current) {
        const clamped = Math.max(0, Math.min(100, percent));
        const totalSeconds = parseTimeToSeconds(duration);

        if (totalSeconds > 0) {
          spotifyPlayerRef.current.seek((clamped / 100) * totalSeconds);
          setProgressPercent(clamped);
        }
        return;
      }

      if (currentTrack.sourceType === "telegram" && audioPlayerRef.current) {
        const totalSeconds = audioPlayerRef.current.duration;

        if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) {
          return;
        }

        const clamped = Math.max(0, Math.min(100, percent));
        const targetSeconds = (clamped / 100) * totalSeconds;

        audioPlayerRef.current.currentTime = targetSeconds;
        setCurrentTime(formatTime(targetSeconds));
        setDuration(formatTime(totalSeconds));
        setProgressPercent(clamped);
      }
    },
    [currentTrack, duration]
  );

  const setVolume = useCallback(
    (volume: number) => {
      const clamped = Math.max(0, Math.min(100, volume));
      setVolumePercent(clamped);

      console.log("[PlayerContext] setVolume called", {
        volume,
        clamped,
        sourceType: currentTrack?.sourceType,
      });

      if (currentTrack?.sourceType === "youtube" && youtubePlayerRef.current) {
        youtubePlayerRef.current.setVolume(clamped);
      }

      if (currentTrack?.sourceType === "telegram" && audioPlayerRef.current) {
        audioPlayerRef.current.volume = clamped / 100;
      }
    },
    [currentTrack]
  );

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
      youtubePlayerRef,
      spotifyPlayerRef,
      audioPlayerRef,
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
      playTrack,
      togglePlay,
      playNext,
      playPrev,
      seekToPercent,
      setVolume,
    ]
  );

  return (
    <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error("usePlayer must be used inside PlayerProvider");
  }
  return context;
}