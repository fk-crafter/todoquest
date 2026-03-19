"use client";

import { useRouter } from "next/navigation";
import { Gamepad2, Rocket } from "lucide-react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import InstallPWA from "@/components/InstallPWA";

export default function Hero() {
  const t = useTranslations("Hero");
  const router = useRouter();
  const { status } = useSession();

  const playSound = () => {
    const clickAudio = new Audio("/click-sound.wav");
    clickAudio.play();
  };

  const handleStart = () => {
    playSound();

    setTimeout(() => {
      if (status === "authenticated") {
        router.push("/tasks");
      } else {
        router.push("/auth");
      }
    }, 200);
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-[url('/pixel-bg.gif')] bg-contain bg-no-repeat bg-center relative px-4 font-press">
      <InstallPWA />

      <h1 className="text-2xl md:text-4xl font-bold text-blue-400 drop-shadow-[2px_2px_0px_black] flex items-center gap-2 text-center">
        <Gamepad2 className="w-6 h-6 md:w-8 md:h-8" />
        TodoQuest
      </h1>

      <p className="mt-4 text-base md:text-lg text-gray-300 drop-shadow-[1px_1px_0px_black] text-center">
        {t("subtitle")}
      </p>

      <button
        onClick={handleStart}
        className="mt-6 px-4 py-2 md:px-6 md:py-3 text-sm md:text-base cursor-pointer bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg border-[3px] border-black shadow-[3px_3px_0px_black] active:translate-x-[2px] active:translate-y-[2px] flex items-center gap-2 transition-transform"
      >
        <Rocket className="w-4 h-4 md:w-5 md:h-5" />
        {t("cta")}
      </button>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce opacity-70">
        <span className="text-gray-300 text-[10px] md:text-xs tracking-widest uppercase">
          {t("scroll")}
        </span>
        <div className="w-5 h-8 md:w-6 md:h-10 border-2 border-gray-400 rounded-full flex justify-center pt-2">
          <div className="w-1 h-2 bg-gray-400 rounded-full animate-pulse"></div>
        </div>
      </div>
    </main>
  );
}
