"use client";

import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ArrowRight, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { useAudio } from "@/context/AudioContext";

export default function ProgressPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { setMusicSource, isPlaying, toggleMusic } = useAudio();
  const [userStats, setUserStats] = useState({ xp: 0, level: 1 });

  useEffect(() => {
    setMusicSource("/tasks.wav");

    if (!isPlaying) {
      toggleMusic();
    }
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      if (!session?.user?.id || !session?.accessToken) return;

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/me`,
          {
            headers: { Authorization: `Bearer ${session.accessToken}` },
          }
        );

        const data = await res.json();
        setUserStats({ xp: data.xp, level: data.level });
      } catch (err) {
        console.error("Erreur récupération stats:", err);
      }
    };

    fetchStats();
  }, [session]);

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
        XP: <span className="font-bold">{userStats.xp}</span> | Niveau:{" "}
        <span className="font-bold">{userStats.level}</span>
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
