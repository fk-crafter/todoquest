"use client";

import { useSession } from "next-auth/react";
import { useMemo, useState } from "react";
import Sidebar from "@/components/Sidebar";
import { Trophy, Star, Shield, Sword, Crown, Lock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

type Difficulty = "ALL" | "EASY" | "MEDIUM" | "HARD" | "EPIC";

interface Task {
  id: string;
  difficulty: "EASY" | "MEDIUM" | "HARD" | "EPIC";
  completed: boolean;
}

export default function SuccessPage() {
  const { data: session } = useSession();
  const [selectedTab, setSelectedTab] = useState<Difficulty>("ALL");

  const { data: user } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/me`,
        {
          headers: { Authorization: `Bearer ${session?.accessToken}` },
        }
      );
      if (!res.ok) throw new Error("Erreur user");
      return res.json();
    },
    enabled: !!session?.accessToken,
  });

  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ["tasks"],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tasks`,
        {
          headers: { Authorization: `Bearer ${session?.accessToken}` },
        }
      );
      if (!res.ok) throw new Error("Erreur tasks");
      return res.json();
    },
    enabled: !!session?.accessToken,
  });

  const level = user?.level || 1;

  const stats = useMemo(() => {
    const completed = tasks.filter((t) => t.completed);
    return {
      total: completed.length,
      easy: completed.filter((t) => t.difficulty === "EASY").length,
      medium: completed.filter((t) => t.difficulty === "MEDIUM").length,
      hard: completed.filter((t) => t.difficulty === "HARD").length,
      epic: completed.filter((t) => t.difficulty === "EPIC").length,
    };
  }, [tasks]);

  const allAchievements = [
    {
      id: "gen_1",
      category: "ALL",
      label: "🌱 Le début du voyage",
      desc: "Terminer 1 tâche (peu importe la difficulté)",
      condition: stats.total >= 1,
      progress: `${Math.min(stats.total, 1)}/1`,
      icon: <Star size={24} className="text-yellow-400" />,
    },
    {
      id: "gen_2",
      category: "ALL",
      label: "🔥 Aventurier Confirmé",
      desc: "Atteindre le niveau 5",
      condition: level >= 5,
      progress: `Niv ${Math.min(level, 5)}/5`,
      icon: <Trophy size={24} className="text-blue-400" />,
    },
    {
      id: "gen_3",
      category: "ALL",
      label: "👑 Légende Vivante",
      desc: "Atteindre le niveau 10",
      condition: level >= 10,
      progress: `Niv ${Math.min(level, 10)}/10`,
      icon: <Crown size={24} className="text-yellow-500" />,
    },
    {
      id: "easy_1",
      category: "EASY",
      label: "🧹 Nettoyeur de Gobelins",
      desc: "Terminer 5 tâches Faciles",
      condition: stats.easy >= 5,
      progress: `${Math.min(stats.easy, 5)}/5`,
      icon: <Shield size={24} className="text-green-400" />,
    },
    {
      id: "easy_2",
      category: "EASY",
      label: "🏃‍♂️ Routine Matinale",
      desc: "Terminer 20 tâches Faciles",
      condition: stats.easy >= 20,
      progress: `${Math.min(stats.easy, 20)}/20`,
      icon: <Shield size={24} className="text-green-500" />,
    },

    {
      id: "med_1",
      category: "MEDIUM",
      label: "🛡️ Garde du Village",
      desc: "Terminer 5 tâches Moyennes",
      condition: stats.medium >= 5,
      progress: `${Math.min(stats.medium, 5)}/5`,
      icon: <Sword size={24} className="text-yellow-400" />,
    },
    {
      id: "med_2",
      category: "MEDIUM",
      label: "🔨 Forgeron Productif",
      desc: "Terminer 15 tâches Moyennes",
      condition: stats.medium >= 15,
      progress: `${Math.min(stats.medium, 15)}/15`,
      icon: <Sword size={24} className="text-yellow-600" />,
    },

    {
      id: "hard_1",
      category: "HARD",
      label: "👹 Chasseur de Trolls",
      desc: "Terminer 3 tâches Difficiles",
      condition: stats.hard >= 3,
      progress: `${Math.min(stats.hard, 3)}/3`,
      icon: <Crown size={24} className="text-orange-400" />,
    },
    {
      id: "hard_2",
      category: "HARD",
      label: "🌋 Survivant du Volcan",
      desc: "Terminer 10 tâches Difficiles",
      condition: stats.hard >= 10,
      progress: `${Math.min(stats.hard, 10)}/10`,
      icon: <Crown size={24} className="text-orange-600" />,
    },

    {
      id: "epic_1",
      category: "EPIC",
      label: "🐉 Tueur de Dragons",
      desc: "Terminer 1 tâche Épique (L'exploit !)",
      condition: stats.epic >= 1,
      progress: `${Math.min(stats.epic, 1)}/1`,
      icon: <Crown size={24} className="text-purple-400 animate-pulse" />,
    },
    {
      id: "epic_2",
      category: "EPIC",
      label: "🌌 Roi de la Productivité",
      desc: "Terminer 5 tâches Épiques",
      condition: stats.epic >= 5,
      progress: `${Math.min(stats.epic, 5)}/5`,
      icon: <Crown size={24} className="text-purple-600" />,
    },
  ];

  const filteredAchievements = allAchievements.filter(
    (ach) => selectedTab === "ALL" || ach.category === selectedTab
  );

  if (!session) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <h1 className="text-2xl font-bold">Veuillez vous connecter</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col md:flex-row">
      <Sidebar />

      <div className="flex-1 flex flex-col items-center p-4 md:p-6">
        <h1 className="text-2xl mt-15 font-bold mb-4 flex items-center gap-2 md:text-3xl md:mb-2">
          <Trophy className="text-yellow-500 w-6 h-6 md:w-8 md:h-8" />
          Salle des Trophées
        </h1>

        <p className="text-gray-400 mb-6 text-center text-sm md:text-base md:mb-8">
          Accomplis des tâches de différentes difficultés pour débloquer ces
          titres.
        </p>

        <div className="flex flex-wrap justify-center gap-2 mb-6 bg-gray-800 p-2 rounded-lg shadow-md border border-gray-700 w-full md:w-auto md:mb-8">
          {(["ALL", "EASY", "MEDIUM", "HARD", "EPIC"] as Difficulty[]).map(
            (diff) => (
              <button
                key={diff}
                onClick={() => setSelectedTab(diff)}
                className={`flex-1 md:flex-none px-2 py-2 md:px-3 md:py-1.5 rounded-md text-xs md:text-sm font-bold transition-all ${
                  selectedTab === diff
                    ? diff === "EASY"
                      ? "bg-green-600 text-white shadow-lg scale-105"
                      : diff === "MEDIUM"
                      ? "bg-yellow-600 text-white shadow-lg scale-105"
                      : diff === "HARD"
                      ? "bg-orange-600 text-white shadow-lg scale-105"
                      : diff === "EPIC"
                      ? "bg-purple-600 text-white shadow-lg scale-105"
                      : "bg-blue-600 text-white shadow-lg scale-105"
                    : "bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-white"
                }`}
              >
                {diff === "ALL" ? "Général" : diff}
              </button>
            )
          )}
        </div>

        <div className="grid grid-cols-1 gap-3 w-full max-w-4xl md:grid-cols-2 md:gap-4">
          {filteredAchievements.map((ach) => (
            <div
              key={ach.id}
              className={`relative p-3 md:p-4 rounded-xl border-2 flex items-center gap-3 md:gap-4 transition-all duration-300 ${
                ach.condition
                  ? ach.category === "EPIC"
                    ? "bg-purple-900/30 border-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                    : ach.category === "HARD"
                    ? "bg-orange-900/30 border-orange-500 text-white"
                    : ach.category === "MEDIUM"
                    ? "bg-yellow-900/30 border-yellow-500 text-white"
                    : ach.category === "EASY"
                    ? "bg-green-900/30 border-green-500 text-white"
                    : "bg-blue-900/30 border-blue-500 text-white"
                  : "bg-gray-800 border-gray-700 text-gray-500 grayscale opacity-70"
              }`}
            >
              <div
                className={`p-2 md:p-3 rounded-full flex-shrink-0 ${
                  ach.condition ? "bg-black/20" : "bg-gray-700"
                }`}
              >
                {ach.condition ? (
                  ach.icon
                ) : (
                  <Lock className="w-5 h-5 md:w-6 md:h-6" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-base md:text-lg flex items-center gap-2 truncate pr-2">
                  {ach.label}
                </h3>
                <p className="text-xs md:text-sm opacity-80">{ach.desc}</p>

                <div className="mt-2 w-full bg-black/40 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      ach.condition ? "bg-white" : "bg-gray-600"
                    }`}
                    style={{
                      width: ach.condition ? "100%" : "30%",
                    }}
                  ></div>
                </div>
                <p className="text-[10px] text-right mt-1 opacity-60">
                  {ach.progress}
                </p>
              </div>

              {ach.condition && (
                <div className="absolute top-2 right-2">
                  <span className="text-[8px] md:text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full font-bold">
                    DÉBLOQUÉ
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredAchievements.length === 0 && (
          <p className="text-gray-500 mt-10">
            Aucun succès dans cette catégorie.
          </p>
        )}
      </div>
    </div>
  );
}
