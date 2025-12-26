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
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-3xl font-bold mb-6">
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
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold mb-6">
        Bienvenue, {session.user?.name} !
      </h1>
      <p className="text-xl ">Votre progression</p>
      <p className="text-lg">
        XP: <span className="font-bold">{xp}</span> | Niveau:{" "}
        <span className="font-bold">{level}</span>
      </p>

      <button
        onClick={() => {
          playSound();
          router.push("/tasks");
        }}
        className="mt-6 flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold rounded-lg shadow-md transition-all"
      >
        Accéder à la liste des tâches <ArrowRight size={24} />
      </button>

      <button
        onClick={() => {
          playSound();
          handleLogout();
        }}
        className="mt-4 flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white text-lg font-bold rounded-lg shadow-md transition-all"
      >
        Se déconnecter <LogOut size={24} />
      </button>
    </div>
  );
}
