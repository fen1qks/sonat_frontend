import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import SearchBar from "../search/SearchBar";
import ChangeTypeSearchButton from "../button/ChangeTypeSearchButton";
import AccountButton from "../button/AccountButton";
import MusicBanner from "../banner/MusicBanner";
import AccountMenu from "../menu/AccountMenu";
import { API_BASE_URL } from "../../config/api";
import type { ActiveView } from "../../pages/MainPage";
import { usePlayer } from "../../context/PlayBarContext.tsx";
import type { SearchType, Track } from "../../types/track";

type HomeFormProps = {
  setActiveView: React.Dispatch<React.SetStateAction<ActiveView>>;
  tracks: Track[];
  setTracks: React.Dispatch<React.SetStateAction<Track[]>>;
  onAddToLibrary: (track: Track) => void | Promise<void>;
};

type SearchRequest = {
  searchType: SearchType;
  searchValue: string;
};

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

function normalizeTracks(data: unknown, searchType: SearchType): Track[] {
  if (!Array.isArray(data)) return [];

  return data
    .map((item): Track | null => {
      if (!item || typeof item !== "object") return null;

      const raw = item as Partial<Track>;

      const fallbackSourceId =
        typeof raw.sourceId === "string"
          ? raw.sourceId
          : typeof raw.id === "string"
            ? raw.id
            : undefined;

      if (!raw.title || !raw.author) {
        return null;
      }

      return {
        id: raw.id ?? fallbackSourceId ?? Math.random().toString(36),
        title: raw.title,
        author: raw.author,
        cover: raw.cover,
        watchUrl: raw.watchUrl,
        sourceId: fallbackSourceId,
        sourceType:
          raw.sourceType === "youtube" || raw.sourceType === "spotify"
            ? raw.sourceType
            : searchType,
      };
    })
    .filter((track): track is Track => Boolean(track));
}

function HomeForm({
  setActiveView,
  tracks,
  setTracks,
  onAddToLibrary,
}: HomeFormProps) {
  const [searchValue, setSearchValue] = useState("");
  const [searchType, setSearchType] = useState<SearchType>("youtube");
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  const { playTrack } = usePlayer();
  const accountRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  const handleToggleSearchType = () => {
    setSearchType((prev) => (prev === "youtube" ? "spotify" : "youtube"));
  };

  const handleSearch = async () => {
    const trimmedValue = searchValue.trim();
    if (!trimmedValue || isSearching) return;

    setIsSearching(true);
    setSearchError("");

    const body: SearchRequest = {
      searchType,
      searchValue: trimmedValue,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/search/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCookie("csrftoken") || "",
        },
        credentials: "include",
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        setSearchError("Search failed");
        setTracks([]);
        return;
      }

      const normalizedTracks = normalizeTracks(data, searchType);
      setTracks(normalizedTracks);

      console.log("[HomeForm] search result", {
        searchType,
        query: trimmedValue,
        count: normalizedTracks.length,
      });
    } catch (error) {
      console.log("[HomeForm] search error", error);
      setSearchError("Server error while searching");
      setTracks([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleGoLibrary = () => {
    setActiveView("library");
  };

  const handleToggleAccountMenu = () => {
    setIsAccountMenuOpen((prev) => !prev);
  };

  const handleGoSettings = () => {
    setIsAccountMenuOpen(false);
    setActiveView("settings");
  };

  const handleLogout = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/logout/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCookie("csrftoken") || "",
        },
        credentials: "include",
      });

      setIsAccountMenuOpen(false);

      if (response.ok) {
        navigate("/");
        return;
      }

      console.log("Logout failed");
    } catch (error) {
      console.log("Server error", error);
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        accountRef.current &&
        !accountRef.current.contains(event.target as Node)
      ) {
        setIsAccountMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <section className="relative z-10 flex min-h-screen w-full items-start justify-center px-[30px] py-[28px]">
      <div className="flex w-full max-w-[1240px] flex-col items-center">
        <div className="mb-[22px] grid w-full grid-cols-[minmax(0,1fr)_64px_440px] items-start gap-[14px]">
          <SearchBar
            value={searchValue}
            onChange={setSearchValue}
            onSearch={handleSearch}
          />

          <ChangeTypeSearchButton
            searchType={searchType}
            onToggle={handleToggleSearchType}
          />

          <div ref={accountRef} className="mt-[6px] ml-[30px] flex justify-end">
            {isAccountMenuOpen ? (
              <AccountMenu
                onAccountClick={handleToggleAccountMenu}
                onSettingsClick={handleGoSettings}
                onLogoutClick={handleLogout}
              />
            ) : (
              <div className="grid w-[430px] grid-cols-[130px_140px_130px] items-center gap-[10px]">
                <div />
                <div className="flex justify-center">
                  <AccountButton onClick={handleToggleAccountMenu} />
                </div>
                <div />
              </div>
            )}
          </div>
        </div>

        <div className="w-full rounded-[36px] bg-[rgba(35,72,93,0.82)] px-[24px] py-[26px] shadow-[0px_18px_45px_0px_rgba(0,0,0,0.22)] backdrop-blur-[8px]">
          {searchError && (
            <div className="mb-[18px] rounded-[20px] bg-black/40 px-[18px] py-[12px] text-[16px] text-white">
              {searchError}
            </div>
          )}

          <div className="flex flex-col gap-[24px]">
            {tracks.slice(0, 4).map((track) => (
              <MusicBanner
                key={track.sourceId ?? track.id}
                cover={track.cover}
                title={track.title}
                author={track.author}
                onAdd={() => onAddToLibrary(track)}
                onPlay={() => {
                  console.log("[HomeForm] clicked track", {
                    track,
                    searchType: track.sourceType,
                    sourceId: track.sourceId,
                    id: track.id,
                  });
                  playTrack(track, tracks);
                }}
              />
            ))}
          </div>

          {!isSearching && tracks.length === 0 && (
            <div className="mt-[10px] flex h-[220px] items-center justify-center text-[24px] text-white/80">
              Start a search to see tracks
            </div>
          )}

          <div className="mt-[32px] flex justify-center">
            <button
              type="button"
              onClick={handleGoLibrary}
              className="min-w-[210px] rounded-[40px] border border-[#09B843]/40 bg-black px-[40px] py-[16px] text-[16px] font-medium tracking-[-0.08px] text-white shadow-[0px_0px_14px_0px_rgba(9,184,67,0.2)]"
            >
              <span className="leading-[1.45]">
                {isSearching ? "Searching..." : "Library"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HomeForm;