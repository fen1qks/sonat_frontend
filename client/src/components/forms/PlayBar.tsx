import type { MouseEvent as ReactMouseEvent, ReactNode } from "react";
import defaultTrackCover from "../../assets/images/logo/default_track_cover.png";

type PlayBarProps = {
  cover?: string;
  title?: string;
  author?: string;
  isPlaying?: boolean;
  currentTime?: string;
  duration?: string;
  progressPercent?: number;
  volumePercent?: number;
  onPlayPause?: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  onAdd?: () => void;
  onSeek?: (percent: number) => void;
  onVolumeChange?: (volume: number) => void;
  prevIcon?: string;
  nextIcon?: string;
  playIcon?: string;
  pauseIcon?: string;
  addIcon?: string;
};

function CircleControlButton({
  onClick,
  children,
  size = "md",
}: {
  onClick?: () => void;
  children: ReactNode;
  size?: "md" | "lg";
}) {
  const sizeClass = size === "lg" ? "h-[48px] w-[48px]" : "h-[40px] w-[40px]";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex ${sizeClass} shrink-0 cursor-pointer items-center justify-center rounded-full bg-[rgba(255,255,255,0.86)] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]`}
    >
      <div className="absolute inset-0 rounded-full border border-[rgba(255,255,255,0.25)]" />
      <div className="relative z-10 flex items-center justify-center">
        {children}
      </div>
    </button>
  );
}

function TrianglePlayIcon() {
  return (
    <div className="ml-[2px] h-0 w-0 border-y-[9px] border-l-[15px] border-y-transparent border-l-black" />
  );
}

function PauseIcon() {
  return (
    <div className="flex items-center gap-[4px]">
      <div className="h-[16px] w-[4px] rounded-[2px] bg-black" />
      <div className="h-[16px] w-[4px] rounded-[2px] bg-black" />
    </div>
  );
}

function FallbackPrevIcon() {
  return (
    <div className="flex items-center">
      <div className="mr-[2px] h-[14px] w-[3px] rounded bg-black" />
      <div className="h-0 w-0 border-y-[8px] border-r-[11px] border-y-transparent border-r-black" />
    </div>
  );
}

function FallbackNextIcon() {
  return (
    <div className="flex items-center">
      <div className="h-0 w-0 border-y-[8px] border-l-[11px] border-y-transparent border-l-black" />
      <div className="ml-[2px] h-[14px] w-[3px] rounded bg-black" />
    </div>
  );
}

function FallbackAddIcon() {
  return (
    <span className="flex h-full w-full items-center justify-center text-[30px] font-semibold leading-none text-black">
      +
    </span>
  );
}

export default function PlayBar({
  cover,
  title = "Name of track",
  author = "Name author",
  isPlaying = false,
  currentTime = "0:00",
  duration = "0:00",
  progressPercent = 0,
  volumePercent = 100,
  onPlayPause,
  onPrev,
  onNext,
  onAdd,
  onSeek,
  onVolumeChange,
  prevIcon,
  nextIcon,
  playIcon,
  pauseIcon,
  addIcon,
}: PlayBarProps) {
  const safeProgress = Math.max(0, Math.min(progressPercent, 100));
  const safeVolume = Math.max(0, Math.min(volumePercent, 100));
  const imageSrc = cover && cover.trim() !== "" ? cover : defaultTrackCover;

  function handleSeekClick(event: ReactMouseEvent<HTMLDivElement>) {
    if (!onSeek) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const percent = ((event.clientX - rect.left) / rect.width) * 100;
    onSeek(Math.max(0, Math.min(100, percent)));
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-[24px]">
      <div className="relative mx-auto h-[106px] w-full max-w-[1280px] rounded-t-[30px] bg-[linear-gradient(90deg,rgba(35,72,93,0.96)_0%,rgba(10,32,46,0.96)_72%,rgba(0,0,0,0.96)_100%)] shadow-[0px_-8px_30px_rgba(0,0,0,0.24)]">
        <div className="flex h-full items-center justify-between px-[16px]">
          <div className="flex min-w-0 max-w-[320px] items-center">
            <div className="h-[74px] w-[74px] shrink-0 overflow-hidden rounded-[10px] bg-[#d9d9d9]">
              <img
                src={imageSrc}
                alt={title}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="ml-[12px] min-w-0">
              <p className="truncate text-[24px] font-bold leading-[1.1] tracking-[-0.96px] text-white">
                {title}
              </p>
              <p className="mt-[4px] truncate text-[20px] font-bold leading-[1.1] tracking-[-0.8px] text-white">
                {author}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-[14px]">
            <div className="flex w-[140px] items-center gap-[10px]">
              <span className="text-[14px] font-bold text-white">Vol</span>

              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={safeVolume}
                onChange={(e) => onVolumeChange?.(Number(e.target.value))}
                className="w-full accent-white"
              />
            </div>

            <button
              type="button"
              onClick={onAdd}
              className="relative flex h-[48px] w-[48px] shrink-0 cursor-pointer items-center justify-center rounded-full bg-[rgba(255,255,255,0.86)] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]"
            >
              <div className="absolute inset-0 rounded-full border border-[rgba(255,255,255,0.25)]" />
              <div className="relative z-10 flex h-full w-full items-center justify-center">
                {addIcon ? (
                  <img
                    src={addIcon}
                    alt="Add to library"
                    className="h-[24px] w-[24px] object-contain"
                  />
                ) : (
                  <FallbackAddIcon />
                )}
              </div>
            </button>
          </div>
        </div>

        <div className="absolute left-1/2 top-1/2 flex w-full max-w-[520px] -translate-x-1/2 -translate-y-1/2 flex-col items-center">
          <div className="mb-[10px] flex items-center gap-[16px]">
            <CircleControlButton onClick={onPrev}>
              {prevIcon ? (
                <img
                  src={prevIcon}
                  alt="Previous track"
                  className="h-[16px] w-[16px] object-contain"
                />
              ) : (
                <FallbackPrevIcon />
              )}
            </CircleControlButton>

            <CircleControlButton onClick={onPlayPause} size="lg">
              {isPlaying ? (
                pauseIcon ? (
                  <img
                    src={pauseIcon}
                    alt="Pause"
                    className="h-[20px] w-[20px] object-contain"
                  />
                ) : (
                  <PauseIcon />
                )
              ) : playIcon ? (
                <img
                  src={playIcon}
                  alt="Play"
                  className="h-[20px] w-[20px] object-contain"
                />
              ) : (
                <TrianglePlayIcon />
              )}
            </CircleControlButton>

            <CircleControlButton onClick={onNext}>
              {nextIcon ? (
                <img
                  src={nextIcon}
                  alt="Next track"
                  className="h-[16px] w-[16px] object-contain"
                />
              ) : (
                <FallbackNextIcon />
              )}
            </CircleControlButton>
          </div>

          <div className="flex w-full items-center gap-[12px]">
            <span className="w-[42px] shrink-0 text-center text-[16px] font-bold tracking-[-0.64px] text-white">
              {currentTime}
            </span>

            <div
              className="relative h-[12px] flex-1 cursor-pointer"
              onClick={handleSeekClick}
            >
              <div className="absolute left-0 right-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-white/50" />

              <div
                className="absolute left-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-white"
                style={{ width: `${safeProgress}%` }}
              />

              <div
                className="absolute top-1/2 h-[8px] w-[8px] -translate-y-1/2 rounded-full bg-[#d9d9d9]"
                style={{ left: `calc(${safeProgress}% - 4px)` }}
              />
            </div>

            <span className="w-[42px] shrink-0 text-center text-[16px] font-bold tracking-[-0.64px] text-white">
              {duration}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}