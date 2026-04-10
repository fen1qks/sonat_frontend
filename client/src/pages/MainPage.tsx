import { useCallback, useEffect, useRef, useState } from "react";
import HomeForm from "../components/forms/HomeForm";
import SettingForm from "../components/forms/SettingForm.tsx";
import LibraryForm from "../components/forms/LibraryForm.tsx";
import PlayBar from "../components/forms/PlayBar.tsx";
import backgroundImage from "../assets/images/log_reg_bg.png";
import YouTubePlayer from "../context/YouTubePlayer.tsx";
import SpotifyPlayer from "../context/SpotifyPlayer.tsx";
import { usePlayer } from "../context/PlayBarContext.tsx";
import { API_BASE_URL } from "../config/api";
import type { Track } from "../types/track";
import TelegramAudioPlayer from "../context/TelegramAudioPlayer.tsx";

export type ActiveView = "home" | "settings" | "library";
type BannerType = "success" | "warning" | "error";

type BannerState = {
  message: string;
  type: BannerType;
} | null;

function getCookie(name: string): string | null {
  const cookies = document.cookie.split(";");

  for (let cookie of cookies) {
    cookie = cookie.trim();

    if (cookie.startsWith(`${name}=`)) {
      return cookie.substring(name.length + 1);
    }
  }

  return null;
}

function normalizeLibraryTracks(data: unknown): Track[] {
  if (!data || typeof data !== "object") return [];

  const payload = data as { tracks?: unknown };
  if (!Array.isArray(payload.tracks)) return [];

  return payload.tracks
    .map((item): Track | null => {
      if (!item || typeof item !== "object") return null;

      const raw = item as Partial<Track>;

      if (!raw.title || !raw.author || !raw.sourceType) {
        return null;
      }

      return {
        id: raw.id ?? raw.sourceId ?? Math.random().toString(36),
        title: raw.title,
        author: raw.author,
        cover: raw.cover,
        watchUrl: raw.watchUrl,
        sourceId: raw.sourceId,
        sourceType: raw.sourceType,
      };
    })
    .filter((track): track is Track => Boolean(track));
}

function MainPage() {
  const [activeView, setActiveView] = useState<ActiveView>("home");
  const [searchTracks, setSearchTracks] = useState<Track[]>([]);
  const [libraryTracks, setLibraryTracks] = useState<Track[]>([]);
  const [banner, setBanner] = useState<BannerState>(null);

  const bannerTimeoutRef = useRef<number | null>(null);

  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    progressPercent,
    volumePercent,
    togglePlay,
    playNext,
    playPrev,
    seekToPercent,
    setVolume,
  } = usePlayer();

  const showBanner = useCallback((message: string, type: BannerType) => {
    setBanner({ message, type });

    if (bannerTimeoutRef.current) {
      window.clearTimeout(bannerTimeoutRef.current);
    }

    bannerTimeoutRef.current = window.setTimeout(() => {
      setBanner(null);
      bannerTimeoutRef.current = null;
    }, 3000);
  }, []);

  useEffect(() => {
    return () => {
      if (bannerTimeoutRef.current) {
        window.clearTimeout(bannerTimeoutRef.current);
      }
    };
  }, []);

  const loadLibrary = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/library/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        console.log("[MainPage] load library failed", data);
        return;
      }

      const normalizedTracks = normalizeLibraryTracks(data);
      setLibraryTracks(normalizedTracks);

      console.log("[MainPage] library loaded", {
        count: normalizedTracks.length,
      });
    } catch (error) {
      console.log("[MainPage] load library server error", error);
    }
  }, []);

  useEffect(() => {
    loadLibrary();
  }, [loadLibrary]);

  const addTrackToLibrary = useCallback(
    async (track: Track) => {
      if (!track.sourceType || !track.sourceId) {
        console.log("[MainPage] skip add to library: missing source data", track);
        showBanner("Track has no source data", "error");
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/add_library/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCookie("csrftoken") || "",
          },
          credentials: "include",
          body: JSON.stringify({
            title: track.title,
            author: track.author,
            cover: track.cover,
            watchUrl: track.watchUrl,
            sourceType: track.sourceType,
            sourceId: track.sourceId,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          console.log("[MainPage] add library failed", data);
          showBanner(data?.error || "Failed to add track", "error");
          return;
        }

        console.log("[MainPage] add library success", data);

        if (data?.message === "Track already in library") {
          showBanner("Track already in library", "warning");
          return;
        }

        if (data?.message === "Track successfully add to library") {
          setLibraryTracks((prev) => {
            const exists = prev.some(
              (item) =>
                String(item.id) === String(track.id) ||
                item.sourceId === track.sourceId
            );

            if (exists) {
              return prev;
            }

            return [...prev, track];
          });

          showBanner("Track added to library", "success");
          return;
        }

        showBanner(data?.message || "Done", "success");
      } catch (error) {
        console.log("[MainPage] add library server error", error);
        showBanner("Server error while adding track", "error");
      }
    },
    [showBanner]
  );

  const bannerClass =
    banner?.type === "success"
      ? "border-[#16be00]/60 bg-[rgba(22,190,0,0.18)] text-[#c8ffc0]"
      : banner?.type === "warning"
        ? "border-[#f0c040]/60 bg-[rgba(240,192,64,0.18)] text-[#ffe7a3]"
        : "border-[#ff4d4f]/60 bg-[rgba(255,77,79,0.18)] text-[#ffd1d1]";

  return (
    <main className="relative min-h-screen overflow-hidden">
      <img
        src={backgroundImage}
        alt="Background"
        className="absolute inset-0 h-full w-full object-cover"
      />

      <YouTubePlayer />
      <SpotifyPlayer />
      <TelegramAudioPlayer />

      {banner && (
        <div className="pointer-events-none fixed right-[24px] top-[24px] z-[100]">
          <div
            className={`min-w-[280px] max-w-[360px] rounded-[18px] border px-[18px] py-[14px] text-[15px] font-medium shadow-[0px_8px_24px_rgba(0,0,0,0.28)] backdrop-blur-[10px] ${bannerClass}`}
          >
            {banner.message}
          </div>
        </div>
      )}

      <div className="relative z-10 min-h-screen pb-[118px]">
        {activeView === "home" && (
          <HomeForm
            setActiveView={setActiveView}
            tracks={searchTracks}
            setTracks={setSearchTracks}
            onAddToLibrary={addTrackToLibrary}
          />
        )}

        {activeView === "settings" && (
          <SettingForm setActiveView={setActiveView} />
        )}

        {activeView === "library" && (
          <LibraryForm
            setActiveView={setActiveView}
            tracks={libraryTracks}
          />
        )}

        {currentTrack && (
          <PlayBar
            cover={currentTrack.cover}
            title={currentTrack.title}
            author={currentTrack.author}
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={duration}
            progressPercent={progressPercent}
            volumePercent={volumePercent}
            onPlayPause={togglePlay}
            onPrev={playPrev}
            onNext={playNext}
            onSeek={seekToPercent}
            onVolumeChange={
              currentTrack.sourceType === "youtube" || currentTrack.sourceType === "telegram"
                ? setVolume
                : undefined
            }
            onAdd={() => addTrackToLibrary(currentTrack)}
          />
        )}
      </div>
    </main>
  );
}

export default MainPage;