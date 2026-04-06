import { useEffect, useRef } from "react";
import { usePlayer } from "./PlayBarContext.tsx";

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

function formatTime(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return "0:00";
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export default function YouTubePlayer() {
  const {
    currentTrack,
    isPlaying,
    playerRef,
    setCurrentTime,
    setDuration,
    setProgressPercent,
    setIsPlaying,
    playNext,
  } = usePlayer();

  const containerRef = useRef<HTMLDivElement | null>(null);
  const pollRef = useRef<number | null>(null);

  useEffect(() => {
    function createPlayer() {
      if (!containerRef.current || !window.YT?.Player) return;
      if (playerRef.current) return;

      playerRef.current = new window.YT.Player(containerRef.current, {
        height: "200",
        width: "200",
        videoId: currentTrack?.youtubeId || "",
        playerVars: {
          controls: 0,
          autoplay: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          rel: 0,
          enablejsapi: 1,
        },
        events: {
          onReady: () => {},
          onStateChange: (event: any) => {
            const state = event.data;
            if (state === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true);
            }
            if (state === window.YT.PlayerState.PAUSED) {
              setIsPlaying(false);
            }
            if (state === window.YT.PlayerState.ENDED) {
              playNext();
            }
          },
        },
      });
    }

    if (window.YT?.Player) {
      createPlayer();
      return;
    }

    const existingScript = document.querySelector('script[src="https://www.youtube.com/iframe_api"]');
    if (!existingScript) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);
    }

    window.onYouTubeIframeAPIReady = createPlayer;
  }, [currentTrack?.youtubeId, playerRef, playNext, setIsPlaying]);

  useEffect(() => {
    if (!playerRef.current || !currentTrack?.youtubeId) return;
    playerRef.current.loadVideoById(currentTrack.youtubeId);

    if (isPlaying) {
      playerRef.current.playVideo();
    } else {
      playerRef.current.pauseVideo();
    }
  }, [currentTrack?.youtubeId]);

  useEffect(() => {
    if (!playerRef.current) return;

    if (isPlaying) {
      playerRef.current.playVideo();
    } else {
      playerRef.current.pauseVideo();
    }
  }, [isPlaying, playerRef]);

  useEffect(() => {
    if (pollRef.current) {
      window.clearInterval(pollRef.current);
      pollRef.current = null;
    }

    pollRef.current = window.setInterval(() => {
      if (!playerRef.current) return;

      const current = playerRef.current.getCurrentTime?.() ?? 0;
      const total = playerRef.current.getDuration?.() ?? 0;

      setCurrentTime(formatTime(current));
      setDuration(formatTime(total));

      if (total > 0) {
        setProgressPercent((current / total) * 100);
      } else {
        setProgressPercent(0);
      }
    }, 500);

    return () => {
      if (pollRef.current) {
        window.clearInterval(pollRef.current);
      }
    };
  }, [playerRef, setCurrentTime, setDuration, setProgressPercent]);

  return (
    <div
      style={{
        position: "fixed",
        width: 1,
        height: 1,
        overflow: "hidden",
        opacity: 0,
        pointerEvents: "none",
      }}
    >
      <div ref={containerRef} />
    </div>
  );
}