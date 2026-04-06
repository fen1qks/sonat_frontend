import HomeForm from "../components/forms/HomeForm";
import SettingForm from "../components/forms/SettingForm.tsx";
import LibraryForm from "../components/forms/LibraryForm.tsx";
import backgroundImage from "../assets/images/log_reg_bg.png";
import PlayBar from "../components/forms/PlayBar.tsx";
import YouTubePlayer from "../context/YouTubePlayer.tsx";
import { useState } from "react";
import { usePlayer } from "../context/PlayBarContext.tsx";

export type ActiveView = "home" | "settings" | "library";

function MainPage() {
  const [activeView, setActiveView] = useState<ActiveView>("home");

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
      setVolume,
    } = usePlayer();

  return (
    <main className="relative min-h-screen overflow-hidden">
      <img
        src={backgroundImage}
        alt="Background"
        className="absolute inset-0 h-full w-full object-cover"
      />

      <YouTubePlayer />

      <div className="relative z-10 min-h-screen pb-[118px]">
        {activeView === "home" && (
          <HomeForm setActiveView={setActiveView} />
        )}

        {activeView === "settings" && (
          <SettingForm setActiveView={setActiveView} />
        )}

        {activeView === "library" && (
          <LibraryForm setActiveView={setActiveView} />
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
            onVolumeChange={setVolume}
            onAdd={() => console.log("add")}
          />
        )}
      </div>
    </main>
  );
}

export default MainPage;