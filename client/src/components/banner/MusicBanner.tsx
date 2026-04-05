import AddButton from "../button/AddButton";
import PlayButton from "../button/PlayButton";
import defaultTrackCover from "../../assets/images/logo/default_track_cover.png";

type MusicBannerProps = {
  cover?: string;
  title: string;
  author: string;
  onPlay?: () => void;
  onAdd?: () => void;
};

export default function MusicBanner({
  cover,
  title,
  author,
  onPlay,
  onAdd,
}: MusicBannerProps) {
  const imageSrc = cover && cover.trim() !== "" ? cover : defaultTrackCover;

  return (
    <div className="relative flex h-[123px] w-full items-center rounded-[40px] bg-black px-[16px]">
      <div className="h-[91px] w-[91px] shrink-0 overflow-hidden rounded-[20px] bg-white">
        <img
          src={imageSrc}
          alt={title}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="ml-[24px] flex min-w-0 flex-col justify-center">
        <h3 className="truncate text-[36px] font-medium leading-[1.45] tracking-[-0.18px] text-white">
          {title}
        </h3>

        <p className="truncate text-[24px] font-medium leading-[1.45] tracking-[-0.12px] text-white">
          {author}
        </p>
      </div>

      <div className="ml-auto flex items-center gap-[25px]">
        <AddButton onClick={onAdd} />
        <PlayButton onClick={onPlay} />
      </div>
    </div>
  );
}