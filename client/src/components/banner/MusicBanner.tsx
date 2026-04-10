import AddButton from "../button/AddButton";
import PlayButton from "../button/PlayButton";
import defaultTrackCover from "../../assets/images/logo/default_track_cover.png";

type MusicBannerProps = {
  cover?: string;
  title: string;
  author: string;
  onPlay?: () => void;
  onAdd?: () => void;
  onDelete?: () => void;
  deleteIcon?: string;
};

export default function MusicBanner({
  cover,
  title,
  author,
  onPlay,
  onAdd,
  onDelete,
  deleteIcon,
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

        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="relative h-[64px] w-[64px] rounded-full bg-[rgba(255,255,255,0.83)] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] cursor-pointer"
          >
            <div className="absolute inset-0 rounded-full border-2 border-[rgba(255,255,255,0.25)]" />

            {deleteIcon && (
              <img
                src={deleteIcon}
                alt="Delete track"
                className="absolute left-1/2 top-1/2 h-[26px] w-[26px] -translate-x-1/2 -translate-y-1/2 object-contain"
              />
            )}
          </button>
        )}

        <PlayButton onClick={onPlay} />
      </div>
    </div>
  );
}