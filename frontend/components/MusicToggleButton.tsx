"use client";

import { Music, MicOff } from "lucide-react";
import { useAudio } from "@/context/AudioContext";

export default function MusicToggleButton() {
  const { isPlaying, toggleMusic } = useAudio();

  return (
    <button
      onClick={toggleMusic}
      className="fixed top-4 cursor-pointer right-4 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg flex items-center gap-2 border border-gray-600 z-50"
    >
      {isPlaying ? <MicOff size={20} /> : <Music size={20} />}
    </button>
  );
}
