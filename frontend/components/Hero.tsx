"use client";

import { useRouter } from "next/navigation";
import { Gamepad2, Rocket } from "lucide-react";

export default function Hero() {
  const router = useRouter();

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-[url('/pixel-bg.gif')] bg-contain bg-no-repeat bg-center">
      <h1 className="text-4xl font-bold text-yellow-400 drop-shadow-[2px_2px_0px_black] flex items-center gap-2">
        <Gamepad2 size={32} /> TodoQuest
      </h1>
      <p className="mt-4 text-lg text-gray-300 drop-shadow-[1px_1px_0px_black]">
        Transforme tes tâches en aventures !
      </p>
      <button
        onClick={() => router.push("/tasks")}
        className="mt-6 px-6 py-3 cursor-pointer bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg border-[3px] border-black shadow-[3px_3px_0px_black] active:translate-x-[2px] active:translate-y-[2px] flex items-center gap-2"
      >
        <Rocket size={20} /> Commencer l'aventure
      </button>
    </main>
  );
}
