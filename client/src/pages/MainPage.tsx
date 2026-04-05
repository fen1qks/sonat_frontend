import { useState } from "react";
import HomeForm from "../components/forms/HomeForm";
import SettingForm from "../components/forms/SettingForm.tsx";
import LibraryForm from "../components/forms/LibraryForm.tsx";
import backgroundImage from "../assets/images/log_reg_bg.png";

export type ActiveView = "home" | "settings" | "library";

function MainPage() {
  const [activeView, setActiveView] = useState<ActiveView>("home");

  return (
    <main className="relative min-h-screen overflow-hidden">
      <img
        src={backgroundImage}
        alt="Background"
        className="absolute inset-0 h-full w-full object-cover"
      />

      <div className="relative z-10">
        {activeView === "home" && (
          <HomeForm setActiveView={setActiveView} />
        )}

        {activeView === "settings" && (
          <SettingForm setActiveView={setActiveView} />
        )}

        {activeView === "library" && (
          <LibraryForm setActiveView={setActiveView} />
        )}
      </div>
    </main>
  );
}

export default MainPage;