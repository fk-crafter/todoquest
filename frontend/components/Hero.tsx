"use client";

import { useRouter } from "next/navigation";
import { Gamepad2, Rocket } from "lucide-react";
import { useSession } from "next-auth/react";

export default function Hero() {
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
    <main className="flex flex-col items-center justify-center min-h-screen bg-[url('/pixel-bg.gif')] bg-contain bg-no-repeat bg-center relative px-4">
      <h1 className="text-2xl md:text-4xl font-bold text-blue-400 drop-shadow-[2px_2px_0px_black] flex items-center gap-2 text-center">
        <Gamepad2 className="w-6 h-6 md:w-8 md:h-8" />
        TodoQuest
      </h1>

      <p className="mt-4 text-base md:text-lg text-gray-300 drop-shadow-[1px_1px_0px_black] text-center">
        Transforme tes tâches en aventures !
      </p>

      <button
        onClick={handleStart}
        className="mt-6 px-4 py-2 md:px-6 md:py-3 text-sm md:text-base cursor-pointer bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg border-[3px] border-black shadow-[3px_3px_0px_black] active:translate-x-[2px] active:translate-y-[2px] flex items-center gap-2 transition-transform"
      >
        <Rocket className="w-4 h-4 md:w-5 md:h-5" />
        Démarrer l&apos;aventure
      </button>
    </main>
  );
}
