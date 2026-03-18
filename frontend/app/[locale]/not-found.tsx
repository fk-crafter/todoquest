"use client";

import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  const t = useTranslations("NotFound");
  const locale = useLocale();
  const router = useRouter();

  const playSound = () => {
    const clickAudio = new Audio("/click-sound.wav");
    clickAudio.play();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h1 className="text-4xl md:text-6xl font-bold mb-4">404</h1>
      <h2 className="text-2xl md:text-3xl font-bold mb-6">{t("title")}</h2>
      <p className="max-w-md text-gray-300 mb-8">{t("message")}</p>

      <button
        type="button"
        onClick={() => {
          playSound();
          router.push(`/${locale}/`);
        }}
        className="flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-lg shadow-md transition-all text-sm px-4 py-2 md:text-lg md:px-6 md:py-3"
      >
        <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" /> {t("backToHome")}
      </button>
    </div>
  );
}
