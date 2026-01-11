"use client";

import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ArrowRight, LogOut } from "lucide-react";
import { useEffect } from "react";
import { useAudio } from "@/context/AudioContext";
import { useQuery } from "@tanstack/react-query";

export default function ProgressPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { setMusicSource, isPlaying, toggleMusic } = useAudio();

  useEffect(() => {
    setMusicSource("/tasks.wav");
    if (!isPlaying) {
      toggleMusic();
    }
  }, []);

  const { data: user } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/me`,
        {
          headers: { Authorization: `Bearer ${session?.accessToken}` },
        }
      );
      if (!res.ok) throw new Error("Erreur stats");
      return res.json();
    },
    enabled: !!session?.accessToken,
  });

  const xp = user?.xp || 0;
  const level = user?.level || 1;

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <h1 className="text-2xl md:text-3xl font-bold mb-6">
          Veuillez vous connecter pour accéder à votre progression
        </h1>
      </div>
    );
  }

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/");
  };

  const playSound = () => {
    const clickAudio = new Audio("/click-sound.wav");
    clickAudio.play();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">
        Bienvenue, {session.user?.name} !
      </h1>

      <p className="text-lg md:text-xl">Votre progression</p>

      <p className="text-base md:text-lg">
        XP: <span className="font-bold">{xp}</span> | Niveau:{" "}
        <span className="font-bold">{level}</span>
      </p>

      <button
        onClick={() => {
          playSound();
          router.push("/tasks");
        }}
        className="
          mt-6 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md transition-all
          w-full max-w-xs px-4 py-3 text-base
          md:w-auto md:px-6 md:py-3 md:text-lg
        "
      >
        Accéder à la liste des tâches
        <ArrowRight className="w-5 h-5 md:w-6 md:h-6" />
      </button>

      <button
        onClick={() => {
          playSound();
          handleLogout();
        }}
        className="
          mt-4 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-md transition-all
          w-full max-w-xs px-4 py-3 text-base
          md:w-auto md:px-6 md:py-3 md:text-lg
        "
      >
        Se déconnecter
        <LogOut className="w-5 h-5 md:w-6 md:h-6" />
      </button>
    </div>
  );
}
