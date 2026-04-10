import { useEffect, useRef, useState } from "react";
import { loadSpotifyIframeApi } from "./loadSpotifyIframeApi";
import { usePlayer } from "./PlayBarContext.tsx";
import type { Track } from "../types/track";

function formatTime(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return "0:00";
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function getTrackIdFromSpotifyUri(uri: string): string | null {
  const parts = uri.split(":");
  if (parts.length >= 3 && parts[0] === "spotify" && parts[1] === "track") {
    return parts[2];
  }
  return null;
}

export default function SpotifyPlayer() {
  const {
    currentTrack,
    isPlaying,
    spotifyPlayerRef,
    setCurrentTime,
    setDuration,
    setProgressPercent,
    setIsPlaying,
  } = usePlayer();

  const containerRef = useRef<HTMLDivElement | null>(null);
  const localControllerRef = useRef<SpotifyEmbedController | null>(null);
  const loadedSourceIdRef = useRef<string | null>(null);
  const currentTrackRef = useRef<Track | null>(currentTrack);
  const [isControllerReady, setIsControllerReady] = useState(false);

  const playbackIntentRef = useRef<{
    expectedPaused: boolean | null;
    until: number;
  }>({
    expectedPaused: null,
    until: 0,
  });

  useEffect(() => {
    currentTrackRef.current = currentTrack;
  }, [currentTrack]);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      if (!containerRef.current) return;
      if (localControllerRef.current) return;

      const IFrameAPI = await loadSpotifyIframeApi();

      if (cancelled || !containerRef.current || localControllerRef.current) {
        return;
      }

      const initialUri = "spotify:track:4uLU6hMCjMI75M1A2tKUQC";

      console.log("[SpotifyPlayer] createController()", { initialUri });

      IFrameAPI.createController(
        containerRef.current,
        {
          uri: initialUri,
          width: "100%",
          height: 152,
        },
        (embedController: SpotifyEmbedController) => {
          if (cancelled) {
            embedController.destroy();
            return;
          }

          console.log("[SpotifyPlayer] controller created");

          localControllerRef.current = embedController;
          spotifyPlayerRef.current = embedController;

          embedController.addListener("ready", () => {
            console.log("[SpotifyPlayer] ready event");
            setIsControllerReady(true);
          });

          embedController.addListener(
            "playback_started",
            (event: SpotifyPlaybackStartedEvent) => {
              console.log("[SpotifyPlayer] playback_started", event.data);

              const activeTrack = currentTrackRef.current;
              const playingTrackId = getTrackIdFromSpotifyUri(
                event.data.playingURI
              );

              if (
                !activeTrack ||
                activeTrack.sourceType !== "spotify" ||
                !activeTrack.sourceId ||
                playingTrackId !== activeTrack.sourceId
              ) {
                return;
              }

              setIsPlaying(true);
            }
          );

          embedController.addListener(
            "playback_update",
            (event: SpotifyPlaybackUpdateEvent) => {
              console.log("[SpotifyPlayer] playback_update", event.data);

              const activeTrack = currentTrackRef.current;
              const playingTrackId = getTrackIdFromSpotifyUri(
                event.data.playingURI
              );

              if (
                !activeTrack ||
                activeTrack.sourceType !== "spotify" ||
                !activeTrack.sourceId ||
                playingTrackId !== activeTrack.sourceId
              ) {
                return;
              }

              const now = Date.now();
              const { expectedPaused, until } = playbackIntentRef.current;
              const isLocked =
                expectedPaused !== null && now < until;

              if (isLocked && event.data.isPaused !== expectedPaused) {
                console.log("[SpotifyPlayer] ignore stale playback_update", {
                  eventPaused: event.data.isPaused,
                  expectedPaused,
                });
                return;
              }

              if (!isLocked || event.data.isPaused === expectedPaused) {
                playbackIntentRef.current = {
                  expectedPaused: null,
                  until: 0,
                };
              }

              const durationSeconds = event.data.duration / 1000;
              const positionSeconds = event.data.position / 1000;

              setCurrentTime(formatTime(positionSeconds));
              setDuration(formatTime(durationSeconds));
              setProgressPercent(
                durationSeconds > 0
                  ? (positionSeconds / durationSeconds) * 100
                  : 0
              );
              setIsPlaying(!event.data.isPaused);
            }
          );
        }
      );
    }

    init();

    return () => {
      cancelled = true;
    };
  }, [spotifyPlayerRef, setCurrentTime, setDuration, setProgressPercent, setIsPlaying]);

  useEffect(() => {
    return () => {
      console.log("[SpotifyPlayer] destroy()");
      localControllerRef.current?.destroy();
      localControllerRef.current = null;
      spotifyPlayerRef.current = null;
      loadedSourceIdRef.current = null;
      playbackIntentRef.current = {
        expectedPaused: null,
        until: 0,
      };
      setIsControllerReady(false);
    };
  }, [spotifyPlayerRef]);

  useEffect(() => {
    if (
      !currentTrack ||
      currentTrack.sourceType !== "spotify" ||
      !currentTrack.sourceId ||
      !localControllerRef.current ||
      !isControllerReady
    ) {
      return;
    }

    if (loadedSourceIdRef.current === currentTrack.sourceId) {
      return;
    }

    const spotifyUri = `spotify:track:${currentTrack.sourceId}`;

    console.log("[SpotifyPlayer] loadUri()", spotifyUri);

    localControllerRef.current.loadUri(spotifyUri);
    loadedSourceIdRef.current = currentTrack.sourceId;
    playbackIntentRef.current = {
      expectedPaused: null,
      until: 0,
    };
  }, [currentTrack?.sourceId, currentTrack?.sourceType, isControllerReady]);

  useEffect(() => {
    if (!localControllerRef.current || !isControllerReady) {
      return;
    }

    if (
      !currentTrack ||
      currentTrack.sourceType !== "spotify" ||
      !currentTrack.sourceId
    ) {
      console.log("[SpotifyPlayer] pause() because active track is not spotify");
      playbackIntentRef.current = {
        expectedPaused: true,
        until: Date.now() + 1200,
      };
      localControllerRef.current.pause();
      return;
    }

    if (isPlaying) {
      console.log("[SpotifyPlayer] play()");
      playbackIntentRef.current = {
        expectedPaused: false,
        until: Date.now() + 1200,
      };
      localControllerRef.current.play();
    } else {
      console.log("[SpotifyPlayer] pause()");
      playbackIntentRef.current = {
        expectedPaused: true,
        until: Date.now() + 1200,
      };
      localControllerRef.current.pause();
    }
  }, [isPlaying, currentTrack?.sourceId, currentTrack?.sourceType, isControllerReady]);

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