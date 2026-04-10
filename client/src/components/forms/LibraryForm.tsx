import { useEffect, useState } from "react";
import MusicBanner from "../banner/MusicBanner";
import type { ActiveView } from "../../pages/MainPage";
import type { Track, TrackSourceType } from "../../types/track";
import { usePlayer } from "../../context/PlayBarContext.tsx";
import { API_BASE_URL } from "../../config/api";
import filter_icon from "../../assets/images/logo/filter_icon.png";
import spotify_icon from "../../assets/images/logo/spotify_logo.png";
import telegram_icon from "../../assets/images/logo/telegram_logo.png";
import youtube_icon from "../../assets/images/logo/yt_logo.png";
import delete_track_icon from "../../assets/images/logo/trash_icon.png";

type LibraryFilterType = "all" | "youtube" | "spotify" | "telegram";

type LibraryFormProps = {
  setActiveView: React.Dispatch<React.SetStateAction<ActiveView>>;
  tracks: Track[];
};

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

      const sourceType = raw.sourceType as TrackSourceType;

      if (
        sourceType !== "youtube" &&
        sourceType !== "spotify" &&
        sourceType !== "telegram"
      ) {
        return null;
      }

      return {
        id: raw.id ?? raw.sourceId ?? Math.random().toString(36),
        title: raw.title,
        author: raw.author,
        cover: raw.cover,
        watchUrl: raw.watchUrl,
        sourceId: raw.sourceId,
        sourceType,
      };
    })
    .filter((track): track is Track => Boolean(track));
}

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

function LibraryForm({ setActiveView, tracks }: LibraryFormProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<LibraryFilterType>("all");
  const [localTracks, setLocalTracks] = useState<Track[]>(tracks);
  const [filteredTracks, setFilteredTracks] = useState<Track[]>(tracks);
  const [isFiltering, setIsFiltering] = useState(false);

  const { playTrack } = usePlayer();

  const socialIconClass = "relative z-10 h-[58px] w-[58px] object-contain";
  const telegramIconClass = `${socialIconClass} scale-140`;
  const filterIconClass = `${socialIconClass} scale-65`;
  const youtubeIconClass = `${socialIconClass} scale-80`;
  const spotifyIconClass = `${socialIconClass} scale-65`;

  const mediaButtonClass =
    "relative flex h-[58px] w-[58px] cursor-pointer items-center justify-center rounded-[40px] bg-[#0c0c0c] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]";

  useEffect(() => {
    setLocalTracks(tracks);

    if (activeFilter === "all") {
      setFilteredTracks(tracks);
    }
  }, [tracks, activeFilter]);

  async function handleFilterClick(filter: Exclude<LibraryFilterType, "all">) {
    if (activeFilter === filter) {
      setActiveFilter("all");
      setFilteredTracks(localTracks);
      return;
    }

    try {
      setIsFiltering(true);

      const response = await fetch(
        `${API_BASE_URL}/filter/?sourceType=${encodeURIComponent(filter)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCookie("csrftoken") || "",
          },
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.log("[LibraryForm] filter failed", data);
        return;
      }

      const normalizedTracks = normalizeLibraryTracks(data);

      setActiveFilter(filter);
      setFilteredTracks(normalizedTracks);

      console.log("[LibraryForm] filter success", {
        filter,
        count: normalizedTracks.length,
      });
    } catch (error) {
      console.log("[LibraryForm] filter server error", error);
    } finally {
      setIsFiltering(false);
    }
  }

  function isActive(filter: Exclude<LibraryFilterType, "all">) {
    return activeFilter === filter;
  }

  function handlePlay(track: Track) {
    const activeTracks = activeFilter === "all" ? localTracks : filteredTracks;
    playTrack(track, activeTracks);
  }

  async function handleDeleteTrack(track: Track) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/delete_track/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCookie("csrftoken") || "",

          },
          credentials: "include",
          body: JSON.stringify({
            sourceId: track.sourceId,
            sourceType: track.sourceType,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.log("[LibraryForm] delete failed", data);
        return;
      }

      setLocalTracks((prev) =>
        prev.filter(
          (item) =>
            !(
              String(item.id) === String(track.id) &&
              item.sourceId === track.sourceId
            )
        )
      );

      setFilteredTracks((prev) =>
        prev.filter(
          (item) =>
            !(
              String(item.id) === String(track.id) &&
              item.sourceId === track.sourceId
            )
        )
      );

      console.log("[LibraryForm] delete success", {
        track,
      });
    } catch (error) {
      console.log("[LibraryForm] delete server error", error);
    }
  }

  const displayTracks = activeFilter === "all" ? localTracks : filteredTracks;

  return (
    <section className="relative z-10 flex min-h-screen w-full items-start justify-center px-[30px] py-[28px]">
      <div className="flex w-full max-w-[1280px] flex-col items-center">
        <div className="mb-[18px] grid w-full grid-cols-[1fr_auto_1fr] items-center">
          <div className="flex justify-start">
            <button
              type="button"
              onClick={() => setActiveView("home")}
              className="cursor-pointer rounded-[40px] bg-[#0c0c0c] px-[28px] py-[14px] text-[16px] font-medium tracking-[-0.08px] text-white shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] backdrop-blur-[35px]"
            >
              <span className="leading-[1.45]">Back</span>
            </button>
          </div>

          <div className="flex justify-center">
            <h1 className="text-center text-[64px] font-bold leading-[1.1] tracking-[-2.56px] text-white">
              SONAT
            </h1>
          </div>

          <div className="flex justify-end">
            {!isFilterOpen ? (
              <button
                type="button"
                onClick={() => setIsFilterOpen(true)}
                className="relative flex h-[58px] w-[58px] cursor-pointer items-center justify-center rounded-full bg-[#0c0c0c] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]"
              >
                <div className="absolute inset-0 rounded-full border-2 border-[rgba(255,255,255,0.25)]" />
                <img src={filter_icon} alt="Filter" className={filterIconClass} />
              </button>
            ) : (
              <div className="flex items-center rounded-[40px] bg-[rgba(12,12,12,0.55)] p-[6px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] backdrop-blur-[35px]">
                <button
                  type="button"
                  onClick={() => handleFilterClick("youtube")}
                  className={`${mediaButtonClass} ${
                    isActive("youtube") ? "ring-2 ring-white/70" : ""
                  }`}
                >
                  <div className="absolute inset-0 rounded-[40px] border-2 border-[rgba(255,255,255,0.25)]" />
                  <img src={youtube_icon} alt="YouTube" className={youtubeIconClass} />
                </button>

                <button
                  type="button"
                  onClick={() => handleFilterClick("spotify")}
                  className={`${mediaButtonClass} ml-[8px] ${
                    isActive("spotify") ? "ring-2 ring-white/70" : ""
                  }`}
                >
                  <div className="absolute inset-0 rounded-[40px] border-2 border-[rgba(255,255,255,0.25)]" />
                  <img src={spotify_icon} alt="Spotify" className={spotifyIconClass} />
                </button>

                <button
                  type="button"
                  onClick={() => handleFilterClick("telegram")}
                  className={`${mediaButtonClass} ml-[8px] ${
                    isActive("telegram") ? "ring-2 ring-white/70" : ""
                  }`}
                >
                  <div className="absolute inset-0 rounded-[40px] border-2 border-[rgba(255,255,255,0.25)]" />
                  <img src={telegram_icon} alt="Telegram" className={telegramIconClass} />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="w-full rounded-[49px] bg-[rgba(12,12,12,0.55)] px-[26px] py-[20px] shadow-[0px_18px_45px_0px_rgba(0,0,0,0.22)] backdrop-blur-[8px]">
          {isFiltering ? (
            <div className="flex h-[220px] items-center justify-center text-[24px] text-white/70">
              Filtering...
            </div>
          ) : displayTracks.length > 0 ? (
            <div className="flex flex-col gap-[28px]">
              {displayTracks.map((track) => (
                <MusicBanner
                  key={track.sourceId ?? track.id}
                  cover={track.cover}
                  title={track.title}
                  author={track.author}
                  onAdd={() => {}}
                  onDelete={() => handleDeleteTrack(track)}
                  deleteIcon={delete_track_icon}
                  onPlay={() => handlePlay(track)}
                />
              ))}
            </div>
          ) : (
            <div className="flex h-[400px] items-center justify-center text-[24px] text-white/70">
              No tracks found
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default LibraryForm;