"use client";

import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  const t = useTranslations("NotFound");
  const locale = useLocale();

  const playSound = () => {
    const clickAudio = new Audio("/click-sound.wav");
    clickAudio.play().catch(() => {});
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center font-press">
      <h1 className="text-6xl md:text-8xl font-bold mb-4 text-yellow-500 drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]">
        404
      </h1>
      <h2 className="text-xl md:text-3xl font-bold mb-6 text-white">
        {t("title")}
      </h2>
      <p className="max-w-md text-gray-400 mb-8 leading-relaxed text-xs md:text-sm">
        {t("message")}
      </p>

      <Link
        href={`/${locale}/`}
        onClick={playSound}
        className="flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-750 border-2 border-gray-600 hover:border-yellow-500 text-white font-bold rounded-lg transition-all text-xs md:text-sm px-4 py-3 md:px-6 md:py-4 active:scale-95 group"
      >
        <ArrowLeft className="w-5 h-5 md:w-6 md:h-6 group-hover:-translate-x-1 transition-transform" />
        {t("backToHome")}
      </Link>
    </div>
  );
}
