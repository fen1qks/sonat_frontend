import React, { useEffect, useState } from "react";
import SonatText from "../text/SonatText";
import telegram_logo from "../../assets/images/logo/telegram_logo.png";
import refresh_icon from "../../assets/images/logo/refresh_icon.png";
import { API_BASE_URL } from "../../config/api";
import type { ActiveView } from "../../pages/MainPage";

type ProfileResponse = {
  username: string;
  first_name: string;
  last_name: string;
  description: string;
  birth_day: string;
  telegram_link: boolean;
};

type TelegramCodeResponse = {
  code?: string;
  error?: string;
};

type FormData = {
  first_name: string;
  last_name: string;
  username: string;
  birth_day: string;
  description: string;
};

type SettingsFormProps = {
  setActiveView: React.Dispatch<React.SetStateAction<ActiveView>>;
};

type FieldCardProps = {
  label: string;
  value: string;
  name: keyof FormData;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  type?: string;
};

type SidePanelProps = {
  side: "left" | "right";
  title: string;
  icon: string;
  children: React.ReactNode;
  onClose: () => void;
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

function FieldCard({
  label,
  value,
  name,
  onChange,
  type = "text",
}: FieldCardProps) {
  return (
    <div className="flex h-[100px] w-[402px] flex-col rounded-[40px] bg-[rgba(4,4,4,0.9)] px-[29px] pt-[16px] pb-[27px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]">
      <label className="text-[24px] font-medium tracking-[-0.12px] text-white">
        {label}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full border-b border-white bg-transparent pb-[1px] text-[20px] text-white outline-none"
      />
    </div>
  );
}

function SidePanel({ side, title, icon, children, onClose }: SidePanelProps) {
  const sideClass = side === "left" ? "left-[20px]" : "right-[20px]";

  return (
    <div
      className={`absolute top-1/2 z-20 w-[300px] -translate-y-1/2 rounded-[32px] bg-[rgba(4,4,4,0.92)] p-[20px] shadow-[0px_8px_24px_rgba(0,0,0,0.35)] ${sideClass}`}
    >
      <div className="mb-[20px] flex items-center justify-between">
        <div className="flex items-center gap-[12px]">
          <img
            src={icon}
            alt={title}
            className="h-[36px] w-[36px] object-contain"
          />
          <h3 className="text-[22px] font-medium text-white">{title}</h3>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="cursor-pointer rounded-[12px] bg-black px-[10px] py-[4px] text-white"
        >
          ×
        </button>
      </div>

      {children}
    </div>
  );
}

function SettingsForm({ setActiveView }: SettingsFormProps) {
  const [formData, setFormData] = useState<FormData>({
    first_name: "",
    last_name: "",
    username: "",
    birth_day: "",
    description: "",
  });

  const [telegramConnected, setTelegramConnected] = useState(false);
  const [activePanel, setActivePanel] = useState<"telegram" | null>(null);
  const [telegramCode, setTelegramCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [telegramLoading, setTelegramLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [telegramMessage, setTelegramMessage] = useState("");

  const telegramIconClass = "relative z-10 h-[58px] w-[58px] scale-175 object-contain";

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await fetch(`${API_BASE_URL}/profile/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCookie("csrftoken") || "",
          },
          credentials: "include",
        });

        const data: ProfileResponse = await response.json();

        if (!response.ok) {
          setMessage("Failed to load profile");
          return;
        }

        setFormData({
          username: data.username || "",
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          birth_day: data.birth_day || "",
          description: data.description || "",
        });

        setTelegramConnected(Boolean(data.telegram_link));
      } catch {
        setMessage("Server error while loading profile");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");
    setSaving(true);

    try {
      const response = await fetch(`${API_BASE_URL}/profile/edit/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCookie("csrftoken") || "",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Failed to save profile");
        return;
      }

      setActiveView("home");
    } catch {
      setMessage("Server error while saving profile");
    } finally {
      setSaving(false);
    }
  }

  async function requestTelegramCode() {
    if (telegramConnected) {
      setTelegramMessage("Telegram already connected");
      return;
    }

    setTelegramLoading(true);
    setTelegramMessage("");
    setMessage("");

    try {
      const response = await fetch(`${API_BASE_URL}/telegram_code/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": getCookie("csrftoken") || "",
        },
        credentials: "include",
      });

      const data: TelegramCodeResponse = await response.json();

      if (!response.ok) {
        setTelegramMessage(data.error || "Failed to generate Telegram code");
        return;
      }

      setTelegramCode(data.code || "");
      setTelegramMessage("Use this code in Telegram bot to link your account.");
    } catch {
      setTelegramMessage("Server error while generating Telegram code");
    } finally {
      setTelegramLoading(false);
    }
  }

  async function handleTelegramConnect() {
    setActivePanel((prev) => (prev === "telegram" ? null : "telegram"));

    if (!telegramConnected) {
      await requestTelegramCode();
    }
  }

  return (
    <section className="relative min-h-screen overflow-hidden px-[20px] py-[32px]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(110,179,170,0.9),rgba(13,126,168,0.78)_35%,rgba(133,163,145,0.75)_70%,rgba(0,0,0,0.35)_100%)]" />

      {activePanel === "telegram" && (
        <SidePanel
          side="left"
          title="Telegram"
          icon={telegram_logo}
          onClose={() => setActivePanel(null)}
        >
          <div className="rounded-[20px] bg-[rgba(255,255,255,0.04)] p-[16px]">
            {telegramConnected ? (
              <p className="text-[15px] text-[#7CFF9E]">
                Telegram account already connected.
              </p>
            ) : (
              <>
                <p className="text-[15px] text-white/80">
                  {telegramMessage ||
                    "Use this code in Telegram bot to link your account."}
                </p>

                <div className="mt-[16px] rounded-[18px] bg-black px-[16px] py-[14px] text-center text-[28px] font-semibold tracking-[2px] text-white">
                  {telegramLoading ? "Loading..." : telegramCode || "---- ----"}
                </div>

                <button
                  type="button"
                  onClick={requestTelegramCode}
                  disabled={telegramLoading}
                  className="mt-[16px] flex w-full cursor-pointer items-center justify-center gap-[10px] rounded-[18px] bg-black px-[16px] py-[12px] text-white disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <img
                    src={refresh_icon}
                    alt="Refresh"
                    className="h-[22px] w-[22px] object-contain"
                  />
                  {telegramLoading ? "Generating..." : "Generate new code"}
                </button>
              </>
            )}
          </div>
        </SidePanel>
      )}

      <div className="relative z-10 mx-auto flex max-w-[1280px] flex-col items-center gap-[10px]">
        <SonatText />

        <form
          onSubmit={handleSave}
          className="w-full max-w-[1172px] rounded-[49px] bg-[rgba(12,12,12,0.55)] px-[58px] pb-[46px] pt-[20px]"
        >
          <div className="mx-auto mb-[37px] flex h-[53px] w-[394px] items-center justify-center rounded-[30px] bg-[rgba(0,0,0,0.8)] text-[32px] font-medium tracking-[-0.16px] text-white shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]">
            Personal information
          </div>

          {loading ? (
            <div className="py-[120px] text-center text-[24px] text-white">
              Loading...
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-x-[212px] gap-y-[12px]">
                <FieldCard
                  label="Name:"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                />

                <FieldCard
                  label="Surname:"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                />

                <FieldCard
                  label="Username:"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                />

                <FieldCard
                  label="Date of birthday:"
                  name="birth_day"
                  value={formData.birth_day}
                  onChange={handleChange}
                  type="date"
                />
              </div>

              <div className="mt-[14px] flex justify-center">
                <div className="relative h-[160px] w-[560px] rounded-[40px] bg-[rgba(4,4,4,0.9)] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]">
                  <div className="pt-[18px] text-center text-[30px] font-medium tracking-[-0.12px] text-white">
                    Link account
                  </div>

                  <div className="absolute bottom-[20px] left-1/2 -translate-x-1/2">
                    <button
                      type="button"
                      onClick={handleTelegramConnect}
                      className="relative flex h-[70px] w-[70px] cursor-pointer items-center justify-center rounded-full bg-black"
                    >
                      <div className="absolute inset-0 rounded-full border-2 border-[rgba(255,255,255,0.25)] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]" />
                      <img
                        src={telegram_logo}
                        alt="Telegram"
                        className={telegramIconClass}
                      />
                    </button>
                  </div>

                  {telegramConnected && (
                    <div className="absolute right-[24px] top-[20px] rounded-[16px] bg-[rgba(9,184,67,0.15)] px-[12px] py-[4px] text-[14px] text-[#7CFF9E]">
                      Telegram connected
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-[12px] rounded-[30px] bg-[rgba(4,4,4,0.9)] px-[35px] pb-[10px] pt-[16px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]">
                <label className="block text-[24px] font-medium tracking-[-0.12px] text-white">
                  Tell something about yourself:
                </label>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={1}
                  className="mt-[8px] w-full resize-none border-b border-white bg-transparent pb-0 text-[20px] text-white outline-none"
                />
              </div>

              {message && (
                <div className="mt-[20px] text-center text-[18px] text-white">
                  {message}
                </div>
              )}

              <div className="mt-[24px] flex items-end justify-between px-[46px]">
                <button
                  type="button"
                  onClick={() => setActiveView("home")}
                  className="h-[61px] w-[204px] cursor-pointer rounded-[40px] bg-black text-[24px] font-medium tracking-[-0.12px] text-white shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]"
                >
                  Back
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="h-[61px] w-[204px] cursor-pointer rounded-[40px] border border-[rgba(22,190,0,0.7)] bg-black text-[24px] font-medium tracking-[-0.12px] text-white disabled:cursor-not-allowed"
                >
                  {saving ? "Saving..." : "Save changes"}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </section>
  );
}

export default SettingsForm;
