import spotifyLogo from "../../assets/images/logo/spotify_logo.png";
import youtubeLogo from "../../assets/images/logo/yt_logo.png";

type SearchType = "spotify" | "youtube";

type ChangeTypeSearchButtonProps = {
  searchType: SearchType;
  onToggle: () => void;
};

export default function ChangeTypeSearchButton({
  searchType,
  onToggle,
}: ChangeTypeSearchButtonProps) {
  const iconSrc = searchType === "spotify" ? spotifyLogo : youtubeLogo;
  const altText = searchType === "spotify" ? "Spotify logo" : "YouTube logo";

  return (
    <button
      type="button"
      onClick={onToggle}
      className="relative flex h-[64px] w-[64px] shrink-0 cursor-pointer items-center justify-center rounded-[50px] bg-black px-[12px] py-[12px]"
    >
      <div className="absolute inset-0 rounded-[50px] border-2 border-[rgba(255,255,255,0.25)] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]" />
      <img
        src={iconSrc}
        alt={altText}
        className="relative z-10 h-[36px] w-[36px] object-contain"
      />
    </button>
  );
}