import PlayBar from "../components/forms/PlayBar.tsx";
import { usePlayer } from "./PlayBarContext.tsx";

export default function PlayBarContainer() {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    progressPercent,
    togglePlay,
    playNext,
    playPrev,
  } = usePlayer();

  if (!currentTrack) return null;

  return (
    <PlayBar
      cover={currentTrack.cover}
      title={currentTrack.title}
      author={currentTrack.author}
      isPlaying={isPlaying}
      currentTime={currentTime}
      duration={duration}
      progressPercent={progressPercent}

      onPlayPause={togglePlay}
      onPrev={playPrev}
      onNext={playNext}
    />
  );
}