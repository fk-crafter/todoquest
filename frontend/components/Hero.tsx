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
    clickAudio.play().catch(() => {});
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

      <h1 className="text-3xl md:text-5xl font-bold text-blue-400 drop-shadow-[3px_3px_0px_black] flex items-center gap-3 text-center mb-2">
        <Gamepad2 className="w-8 h-8 md:w-12 md:h-12 text-blue-400 animate-pulse" />
        TodoQuest
      </h1>

      <p className="mt-4 text-base md:text-xl text-gray-200 drop-shadow-[2px_2px_0px_black] text-center max-w-2xl leading-relaxed">
        {t("subtitle")}
      </p>

      <button
        onClick={handleStart}
        className="mt-8 px-6 py-3 md:px-8 md:py-4 text-sm md:text-lg cursor-pointer bg-blue-500 hover:bg-blue-400 text-white font-bold rounded-lg border-4 border-black shadow-[4px_4px_0px_black] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[0px_0px_0px_black] flex items-center gap-3 transition-all"
      >
        <Rocket className="w-5 h-5 md:w-6 md:h-6" />
        {t("cta")}
      </button>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce opacity-80 cursor-default">
        <span className="text-white text-[10px] md:text-xs tracking-widest whitespace-nowrap uppercase text-center w-full px-4 drop-shadow-[1px_1px_0px_black]">
          {t("scroll")}
        </span>
        <div className="w-5 h-8 md:w-6 md:h-10 border-2 border-gray-300 rounded-full flex justify-center pt-2 shadow-[2px_2px_0px_black] bg-black/50">
          <div className="w-1 h-2 bg-white rounded-full animate-pulse"></div>
        </div>
      </div>
    </main>
  );
}
