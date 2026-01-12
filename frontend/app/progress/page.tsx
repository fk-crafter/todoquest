"use client";

import { useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ArrowRight, LogOut, Trophy, Star } from "lucide-react";
import { useAudio } from "@/context/AudioContext";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/Sidebar";

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

  const playSound = () => {
    const clickAudio = new Audio("/click-sound.wav");
    clickAudio.play().catch(() => {});
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/");
  };

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white font-press">
        <h1 className="text-xl">Connexion requise...</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-900 text-white font-press">
      <Sidebar />

      <main className="flex-1 p-4 md:p-8 flex flex-col items-center justify-center">
        <div className="bg-gray-800 border-4 border-gray-600 p-8 rounded-xl shadow-2xl max-w-lg w-full text-center">
          <h1 className="text-2xl md:text-3xl font-bold mb-8 text-yellow-400">
            Bienvenue, {session.user?.name} !
          </h1>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-gray-700 p-4 rounded-lg border border-gray-500 flex flex-col items-center">
              <Star className="text-yellow-400 mb-2" size={32} />
              <span className="text-gray-400 text-xs uppercase">Niveau</span>
              <span className="text-2xl font-bold">{level}</span>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg border border-gray-500 flex flex-col items-center">
              <Trophy className="text-purple-400 mb-2" size={32} />
              <span className="text-gray-400 text-xs uppercase">XP Total</span>
              <span className="text-2xl font-bold">{xp}</span>
            </div>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => {
                playSound();
                router.push("/tasks");
              }}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white py-4 rounded font-bold shadow-[0_4px_0_rgb(0,0,0,0.5)] active:shadow-none active:translate-y-1 transition-all"
            >
              VOIR MES QUÊTES <ArrowRight size={20} />
            </button>

            <button
              onClick={() => {
                playSound();
                handleLogout();
              }}
              className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white py-4 rounded font-bold shadow-[0_4px_0_rgb(0,0,0,0.5)] active:shadow-none active:translate-y-1 transition-all"
            >
              SE DÉCONNECTER <LogOut size={20} />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
