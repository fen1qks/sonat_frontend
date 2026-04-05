import { useState } from "react";
import MusicBanner from "../banner/MusicBanner";
import type { ActiveView } from "../../pages/MainPage";
import filter_icon from "../../assets/images/logo/filter_icon.png";
import spotify_icon from "../../assets/images/logo/spotify_logo.png";
import telegram_icon from "../../assets/images/logo/telegram_logo.png";
import youtube_icon from "../../assets/images/logo/yt_logo.png";

type Track = {
  id: number | string;
  title: string;
  author: string;
  cover?: string;
  youtubeId?: string;
  watchUrl?: string;
};

type LibraryFormProps = {
  setActiveView: React.Dispatch<React.SetStateAction<ActiveView>>;
  tracks?: Track[];
};

function LibraryForm({ setActiveView, tracks = [] }: LibraryFormProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const socialIconClass = "relative z-10 h-[58px] w-[58px] object-contain";
  const telegramIconClass = `${socialIconClass} scale-140`;
  const filterIconClass = `${socialIconClass} scale-65`;
  const youtubeIconClass = `${socialIconClass} scale-80`;
  const spotifyIconClass = `${socialIconClass} scale-65`;

  const mediaButtonClass =
    "relative flex h-[58px] w-[58px] cursor-pointer items-center justify-center rounded-[40px] bg-[#0c0c0c] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]";


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

                {<img src={filter_icon} alt="Filter" className={filterIconClass} />}
                <div
                  className={`${filterIconClass} flex items-center justify-center text-[14px] text-white`}
                >
                </div>
              </button>
            ) : (
              <div className="flex items-center rounded-[40px] bg-[rgba(12,12,12,0.55)] p-[6px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] backdrop-blur-[35px]">
                <button type="button" className={mediaButtonClass}>
                  <div className="absolute inset-0 rounded-[40px] border-2 border-[rgba(255,255,255,0.25)]" />
                  {<img src={youtube_icon} alt="YouTube" className={youtubeIconClass} /> }
                  <div
                    className={`${youtubeIconClass} flex items-center justify-center text-[14px] text-white`}
                  >
                  </div>
                </button>

                <button
                  type="button"
                  className={`${mediaButtonClass} ml-[8px]`}
                >
                  <div className="absolute inset-0 rounded-[40px] border-2 border-[rgba(255,255,255,0.25)]" />
                  {<img src={spotify_icon} alt="Spotify" className={spotifyIconClass} /> }
                  <div
                    className={`${spotifyIconClass} flex items-center justify-center text-[14px] text-white`}
                  >
                  </div>
                </button>

                <button
                  type="button"
                  className={`${mediaButtonClass} ml-[8px]`}
                >
                  <div className="absolute inset-0 rounded-[40px] border-2 border-[rgba(255,255,255,0.25)]" />
                  {<img src={telegram_icon} alt="Telegram" className={telegramIconClass} />}
                  <div
                    className={`${telegramIconClass} flex items-center justify-center text-[10px] text-white`}
                  >
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="w-full rounded-[49px] bg-[rgba(12,12,12,0.55)] px-[26px] py-[20px] shadow-[0px_18px_45px_0px_rgba(0,0,0,0.22)] backdrop-blur-[8px]">
          {tracks.length > 0 ? (
            <div className="flex flex-col gap-[28px]">
              {tracks.map((track) => (
                <MusicBanner
                  key={track.id}
                  cover={track.cover}
                  title={track.title}
                  author={track.author}
                  onAdd={() => {}}
                  onPlay={() => {}}
                />
              ))}
            </div>
          ) : (
            <div className="flex h-[400px] items-center justify-center text-[24px] text-white/70">
              No tracks yet
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default LibraryForm;