"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Gamepad2, Rocket, Music, MicOff } from "lucide-react";

export default function Hero() {
  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    audioRef.current = new Audio("/title-sound.wav");
    audioRef.current.loop = true;
    audioRef.current.volume = 0.5;
  }, []);

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current
          .play()
          .catch((err) => console.log("Autoplay blocked:", err));
      }
      setIsPlaying(!isPlaying);
    }
  };

  const playSound = () => {
    const clickAudio = new Audio("/click-sound.wav");
    clickAudio.play();
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-[url('/pixel-bg.gif')] bg-contain bg-no-repeat bg-center relative">
      <button
        onClick={toggleMusic}
        className="absolute top-4 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg flex items-center gap-2 border border-gray-600"
      >
        {isPlaying ? <MicOff size={20} /> : <Music size={20} />}
        {isPlaying ? "stop" : "play"}
      </button>

      <h1 className="text-4xl font-bold text-blue-400 drop-shadow-[2px_2px_0px_black] flex items-center gap-2">
        <Gamepad2 size={32} /> TodoQuest
      </h1>
      <p className="mt-4 text-lg text-gray-300 drop-shadow-[1px_1px_0px_black]">
        Transforme tes tâches en aventures !
      </p>
      <button
        onClick={() => {
          playSound();
          setTimeout(() => router.push("/auth"), 200);
        }}
        className="mt-6 px-6 py-3 cursor-pointer bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg border-[3px] border-black shadow-[3px_3px_0px_black] active:translate-x-[2px] active:translate-y-[2px] flex items-center gap-2"
      >
        <Rocket size={20} /> Démarrer l'aventure
      </button>
    </main>
  );
}
