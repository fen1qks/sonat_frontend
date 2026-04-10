import { useEffect, useRef } from "react";
import { usePlayer } from "./PlayBarContext.tsx";
import type { Track } from "../types/track";

function formatTime(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return "0:00";
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export default function TelegramAudioPlayer() {
  const {
    currentTrack,
    isPlaying,
    volumePercent,
    audioPlayerRef,
    setCurrentTime,
    setDuration,
    setProgressPercent,
    setIsPlaying,
    playNext,
  } = usePlayer();

  const localAudioRef = useRef<HTMLAudioElement | null>(null);
  const currentTrackRef = useRef<Track | null>(currentTrack);
  const loadedUrlRef = useRef<string | null>(null);

  useEffect(() => {
    currentTrackRef.current = currentTrack;
  }, [currentTrack]);

  useEffect(() => {
    audioPlayerRef.current = localAudioRef.current;

    return () => {
      if (audioPlayerRef.current === localAudioRef.current) {
        audioPlayerRef.current = null;
      }
    };
  }, [audioPlayerRef]);

  useEffect(() => {
    const audio = localAudioRef.current;
    if (!audio) return;

    const isActiveTelegramTrack = () => {
      const activeTrack = currentTrackRef.current;

      return Boolean(
        activeTrack &&
          activeTrack.sourceType === "telegram" &&
          activeTrack.watchUrl &&
          loadedUrlRef.current === activeTrack.watchUrl
      );
    };

    const syncProgress = () => {
      if (!isActiveTelegramTrack()) return;

      const current = audio.currentTime || 0;
      const total = audio.duration || 0;

      setCurrentTime(formatTime(current));
      setDuration(formatTime(total));
      setProgressPercent(total > 0 ? (current / total) * 100 : 0);
    };

    const handlePlay = () => {
      if (!isActiveTelegramTrack()) return;
      setIsPlaying(true);
    };

    const handlePause = () => {
      if (!isActiveTelegramTrack()) return;
      setIsPlaying(false);
    };

    const handleEnded = () => {
      if (!isActiveTelegramTrack()) return;
      playNext();
    };

    audio.addEventListener("loadedmetadata", syncProgress);
    audio.addEventListener("timeupdate", syncProgress);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("loadedmetadata", syncProgress);
      audio.removeEventListener("timeupdate", syncProgress);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [playNext, setCurrentTime, setDuration, setProgressPercent, setIsPlaying]);

  useEffect(() => {
    const audio = localAudioRef.current;
    if (!audio) return;

    audio.volume = volumePercent / 100;
  }, [volumePercent]);

  useEffect(() => {
    const audio = localAudioRef.current;
    if (!audio) return;

    if (
      !currentTrack ||
      currentTrack.sourceType !== "telegram" ||
      !currentTrack.watchUrl
    ) {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
      loadedUrlRef.current = null;
      return;
    }

    if (loadedUrlRef.current === currentTrack.watchUrl) {
      return;
    }

    audio.src = currentTrack.watchUrl;
    audio.load();
    loadedUrlRef.current = currentTrack.watchUrl;
  }, [currentTrack?.sourceType, currentTrack?.watchUrl]);

  useEffect(() => {
    const audio = localAudioRef.current;
    if (!audio) return;

    if (
      !currentTrack ||
      currentTrack.sourceType !== "telegram" ||
      !currentTrack.watchUrl
    ) {
      return;
    }

    if (isPlaying) {
      void audio.play().catch((error) => {
        console.log("[TelegramAudioPlayer] play() failed", error);
        setIsPlaying(false);
      });
    } else {
      audio.pause();
    }
  }, [isPlaying, currentTrack?.sourceType, currentTrack?.watchUrl, setIsPlaying]);

  return (
    <audio
      ref={localAudioRef}
      preload="metadata"
      style={{
        position: "fixed",
        width: 1,
        height: 1,
        overflow: "hidden",
        opacity: 0,
        pointerEvents: "none",
      }}
    />
  );
}