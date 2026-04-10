import { useEffect, useRef, useState } from "react";
import { usePlayer } from "./PlayBarContext.tsx";
import type { Track } from "../types/track";

type YTPlayerState = {
  PLAYING: number;
  PAUSED: number;
  ENDED: number;
};

type YTPlayerInstance = {
  loadVideoById: (videoId: string) => void;
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead?: boolean) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  setVolume: (volume: number) => void;
  destroy?: () => void;
};

type YTPlayerReadyEvent = {
  target: YTPlayerInstance;
};

type YTPlayerStateChangeEvent = {
  data: number;
  target: YTPlayerInstance;
};

type YTPlayerErrorEvent = {
  data: number;
  target: YTPlayerInstance;
};

type YTPlayerConstructor = new (
  element: HTMLElement,
  options: {
    height: string;
    width: string;
    videoId: string;
    playerVars: {
      controls: number;
      autoplay: number;
      disablekb: number;
      fs: number;
      modestbranding: number;
      rel: number;
      enablejsapi: number;
    };
    events: {
      onReady?: (event: YTPlayerReadyEvent) => void;
      onStateChange?: (event: YTPlayerStateChangeEvent) => void;
      onError?: (event: YTPlayerErrorEvent) => void;
    };
  }
) => YTPlayerInstance;

declare global {
  interface Window {
    YT?: {
      Player?: YTPlayerConstructor;
      PlayerState: YTPlayerState;
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

let youtubeApiPromise: Promise<void> | null = null;

function loadYouTubeIframeApi(): Promise<void> {
  if (window.YT?.Player) {
    return Promise.resolve();
  }

  if (youtubeApiPromise) {
    return youtubeApiPromise;
  }

  youtubeApiPromise = new Promise((resolve) => {
    const existingScript = document.querySelector(
      'script[src="https://www.youtube.com/iframe_api"]'
    );

    window.onYouTubeIframeAPIReady = () => {
      console.log("[YouTubePlayer] iframe api ready");
      resolve();
    };

    if (existingScript) {
      return;
    }

    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.body.appendChild(tag);
  });

  return youtubeApiPromise;
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
    youtubePlayerRef,
    setCurrentTime,
    setDuration,
    setProgressPercent,
    setIsPlaying,
    playNext,
  } = usePlayer();

  const containerRef = useRef<HTMLDivElement | null>(null);
  const pollRef = useRef<number | null>(null);
  const loadedSourceIdRef = useRef<string | null>(null);
  const currentTrackRef = useRef<Track | null>(currentTrack);
  const [isPlayerReady, setIsPlayerReady] = useState(false);

  useEffect(() => {
    currentTrackRef.current = currentTrack;
  }, [currentTrack]);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      if (
        !currentTrack ||
        currentTrack.sourceType !== "youtube" ||
        !currentTrack.sourceId
      ) {
        return;
      }

      if (youtubePlayerRef.current) {
        return;
      }

      await loadYouTubeIframeApi();

      if (
        cancelled ||
        !containerRef.current ||
        !window.YT?.Player ||
        youtubePlayerRef.current
      ) {
        return;
      }

      loadedSourceIdRef.current = currentTrack.sourceId;

      console.log("[YouTubePlayer] createPlayer()", {
        sourceId: currentTrack.sourceId,
      });

      youtubePlayerRef.current = new window.YT.Player(containerRef.current, {
        height: "200",
        width: "200",
        videoId: currentTrack.sourceId,
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
          onReady: () => {
            console.log("[YouTubePlayer] onReady");
            setIsPlayerReady(true);
          },
          onStateChange: (event: YTPlayerStateChangeEvent) => {
            const activeTrack = currentTrackRef.current;

            if (
              !activeTrack ||
              activeTrack.sourceType !== "youtube" ||
              !activeTrack.sourceId
            ) {
              return;
            }

            if (loadedSourceIdRef.current !== activeTrack.sourceId) {
              return;
            }

            console.log("[YouTubePlayer] onStateChange", event.data);

            if (event.data === window.YT?.PlayerState.PLAYING) {
              setIsPlaying(true);
            }

            if (event.data === window.YT?.PlayerState.PAUSED) {
              setIsPlaying(false);
            }

            if (event.data === window.YT?.PlayerState.ENDED) {
              playNext();
            }
          },
          onError: (event: YTPlayerErrorEvent) => {
            console.log("[YouTubePlayer] onError", event.data);
          },
        },
      });
    }

    init();

    return () => {
      cancelled = true;
    };
  }, [currentTrack?.sourceId, currentTrack?.sourceType, playNext, setIsPlaying, youtubePlayerRef]);

  useEffect(() => {
    return () => {
      if (pollRef.current) {
        window.clearInterval(pollRef.current);
        pollRef.current = null;
      }

      if (youtubePlayerRef.current?.destroy) {
        console.log("[YouTubePlayer] destroy()");
        youtubePlayerRef.current.destroy();
      }

      youtubePlayerRef.current = null;
      loadedSourceIdRef.current = null;
      setIsPlayerReady(false);
    };
  }, [youtubePlayerRef]);

  useEffect(() => {
    if (
      !currentTrack ||
      currentTrack.sourceType !== "youtube" ||
      !currentTrack.sourceId ||
      !youtubePlayerRef.current ||
      !isPlayerReady
    ) {
      return;
    }

    if (loadedSourceIdRef.current === currentTrack.sourceId) {
      return;
    }

    console.log("[YouTubePlayer] loadVideoById()", {
      sourceId: currentTrack.sourceId,
    });

    youtubePlayerRef.current.loadVideoById(currentTrack.sourceId);
    loadedSourceIdRef.current = currentTrack.sourceId;
  }, [currentTrack?.sourceId, currentTrack?.sourceType, isPlayerReady, youtubePlayerRef]);

  useEffect(() => {
    if (
      !currentTrack ||
      currentTrack.sourceType !== "youtube" ||
      !youtubePlayerRef.current ||
      !isPlayerReady
    ) {
      return;
    }

    console.log("[YouTubePlayer] sync play state", {
      isPlaying,
      sourceId: currentTrack.sourceId,
    });

    if (isPlaying) {
      youtubePlayerRef.current.playVideo();
    } else {
      youtubePlayerRef.current.pauseVideo();
    }
  }, [isPlaying, currentTrack?.sourceId, currentTrack?.sourceType, isPlayerReady, youtubePlayerRef]);

  useEffect(() => {
    if (!currentTrack || currentTrack.sourceType !== "youtube") {
      if (youtubePlayerRef.current) {
        console.log("[YouTubePlayer] non-youtube track -> pauseVideo()");
        youtubePlayerRef.current.pauseVideo();
      }
      return;
    }

    if (!youtubePlayerRef.current || !isPlayerReady) return;

    if (pollRef.current) {
      window.clearInterval(pollRef.current);
      pollRef.current = null;
    }

    pollRef.current = window.setInterval(() => {
      if (!youtubePlayerRef.current) return;

      const current = youtubePlayerRef.current.getCurrentTime?.() ?? 0;
      const total = youtubePlayerRef.current.getDuration?.() ?? 0;

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
        pollRef.current = null;
      }
    };
  }, [
    currentTrack?.sourceId,
    currentTrack?.sourceType,
    isPlayerReady,
    youtubePlayerRef,
    setCurrentTime,
    setDuration,
    setProgressPercent,
  ]);

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