"use client";

import { useSession } from "next-auth/react";
import { useMemo, useState } from "react";
import Sidebar from "@/components/Sidebar";
import RetroModal from "@/components/ui/RetroModal";
import {
  Trophy,
  Star,
  Shield,
  Sword,
  Crown,
  Lock,
  Loader2,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

type Difficulty = "ALL" | "EASY" | "MEDIUM" | "HARD" | "EPIC";

interface Task {
  id: string;
  difficulty: "EASY" | "MEDIUM" | "HARD" | "EPIC";
  completed: boolean;
}

interface Achievement {
  id: string;
  category: Difficulty;
  label: string;
  desc: string;
  condition: boolean;
  progress: string;
  progressPercent: number;
  icon: React.ReactNode;
  color: string;
}

export default function SuccessPage() {
  const { data: session } = useSession();
  const [selectedTab, setSelectedTab] = useState<Difficulty>("ALL");
  const [selectedAchievement, setSelectedAchievement] =
    useState<Achievement | null>(null);

  // --- DATA FETCHING ---
  const { data: user, isLoading: userLoading } = useQuery({
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

  const { data: tasks = [], isLoading: tasksLoading } = useQuery<Task[]>({
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

  const isLoading = userLoading || tasksLoading;
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

  const allAchievements: Achievement[] = [
    {
      id: "gen_1",
      category: "ALL",
      label: "🌱 Le début du voyage",
      desc: "Terminer 1 tâche",
      condition: stats.total >= 1,
      progress: `${Math.min(stats.total, 1)}/1`,
      progressPercent: Math.min(stats.total, 1) * 100,
      icon: <Star size={24} />,
      color: "text-yellow-400",
    },
    {
      id: "gen_2",
      category: "ALL",
      label: "🔥 Aventurier Confirmé",
      desc: "Atteindre le niveau 5",
      condition: level >= 5,
      progress: `Niv ${Math.min(level, 5)}/5`,
      progressPercent: (Math.min(level, 5) / 5) * 100,
      icon: <Trophy size={24} />,
      color: "text-blue-400",
    },
    {
      id: "gen_3",
      category: "ALL",
      label: "👑 Légende Vivante",
      desc: "Atteindre le niveau 10",
      condition: level >= 10,
      progress: `Niv ${Math.min(level, 10)}/10`,
      progressPercent: (Math.min(level, 10) / 10) * 100,
      icon: <Crown size={24} />,
      color: "text-yellow-500",
    },
    {
      id: "easy_1",
      category: "EASY",
      label: "🧹 Nettoyeur",
      desc: "Terminer 5 tâches Faciles",
      condition: stats.easy >= 5,
      progress: `${Math.min(stats.easy, 5)}/5`,
      progressPercent: (Math.min(stats.easy, 5) / 5) * 100,
      icon: <Shield size={24} />,
      color: "text-green-400",
    },
    {
      id: "easy_2",
      category: "EASY",
      label: "🏃‍♂️ Routine Matinale",
      desc: "Terminer 20 tâches Faciles",
      condition: stats.easy >= 20,
      progress: `${Math.min(stats.easy, 20)}/20`,
      progressPercent: (Math.min(stats.easy, 20) / 20) * 100,
      icon: <Shield size={24} />,
      color: "text-green-500",
    },
    {
      id: "med_1",
      category: "MEDIUM",
      label: "🛡️ Garde du Village",
      desc: "Terminer 5 tâches Moyennes",
      condition: stats.medium >= 5,
      progress: `${Math.min(stats.medium, 5)}/5`,
      progressPercent: (Math.min(stats.medium, 5) / 5) * 100,
      icon: <Sword size={24} />,
      color: "text-yellow-400",
    },
    {
      id: "med_2",
      category: "MEDIUM",
      label: "🔨 Forgeron",
      desc: "Terminer 15 tâches Moyennes",
      condition: stats.medium >= 15,
      progress: `${Math.min(stats.medium, 15)}/15`,
      progressPercent: (Math.min(stats.medium, 15) / 15) * 100,
      icon: <Sword size={24} />,
      color: "text-yellow-600",
    },
    {
      id: "hard_1",
      category: "HARD",
      label: "👹 Chasseur de Trolls",
      desc: "Terminer 3 tâches Difficiles",
      condition: stats.hard >= 3,
      progress: `${Math.min(stats.hard, 3)}/3`,
      progressPercent: (Math.min(stats.hard, 3) / 3) * 100,
      icon: <Crown size={24} />,
      color: "text-orange-400",
    },
    {
      id: "hard_2",
      category: "HARD",
      label: "🌋 Survivant",
      desc: "Terminer 10 tâches Difficiles",
      condition: stats.hard >= 10,
      progress: `${Math.min(stats.hard, 10)}/10`,
      progressPercent: (Math.min(stats.hard, 10) / 10) * 100,
      icon: <Crown size={24} />,
      color: "text-orange-600",
    },
    {
      id: "epic_1",
      category: "EPIC",
      label: "🐉 Tueur de Dragons",
      desc: "Terminer 1 tâche Épique",
      condition: stats.epic >= 1,
      progress: `${Math.min(stats.epic, 1)}/1`,
      progressPercent: (Math.min(stats.epic, 1) / 1) * 100,
      icon: <Crown size={24} />,
      color: "text-purple-400 animate-pulse",
    },
    {
      id: "epic_2",
      category: "EPIC",
      label: "🌌 Roi Productif",
      desc: "Terminer 5 tâches Épiques",
      condition: stats.epic >= 5,
      progress: `${Math.min(stats.epic, 5)}/5`,
      progressPercent: (Math.min(stats.epic, 5) / 5) * 100,
      icon: <Crown size={24} />,
      color: "text-purple-600",
    },
  ];

  const filteredAchievements = allAchievements.filter(
    (ach) => selectedTab === "ALL" || ach.category === selectedTab
  );

  if (!session) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white font-press">
        <h1 className="text-xl">Connexion requise...</h1>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white font-press">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white font-press flex flex-col md:flex-row">
      <Sidebar />

      <div className="flex-1 flex flex-col items-center p-4 md:p-6">
        <h1 className="text-2xl mt-12 md:mt-6 font-bold mb-4 flex items-center gap-2 md:text-3xl md:mb-2 text-yellow-400">
          <Trophy className="text-yellow-500 w-6 h-6 md:w-8 md:h-8" />
          Salle des Trophées
        </h1>

        <p className="text-gray-400 mb-6 text-center text-xs md:text-sm md:mb-8">
          Accomplis des tâches de différentes difficultés pour débloquer ces
          titres légendaires.
        </p>

        <div className="flex flex-wrap justify-center gap-2 mb-6 bg-gray-800 p-2 rounded-lg shadow-md border border-gray-700 w-full md:w-auto md:mb-8">
          {(["ALL", "EASY", "MEDIUM", "HARD", "EPIC"] as Difficulty[]).map(
            (diff) => (
              <button
                key={diff}
                onClick={() => setSelectedTab(diff)}
                className={`flex-1 md:flex-none px-2 py-2 md:px-3 md:py-1.5 rounded-md text-[10px] md:text-xs font-bold transition-all ${
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

        {/* GRID DES SUCCES */}
        <div className="grid grid-cols-1 gap-3 w-full max-w-4xl md:grid-cols-2 md:gap-4 pb-10">
          {filteredAchievements.map((ach) => (
            <AchievementCard
              key={ach.id}
              achievement={ach}
              onClick={() => setSelectedAchievement(ach)}
            />
          ))}
        </div>

        {filteredAchievements.length === 0 && (
          <p className="text-gray-500 mt-10">
            Aucun succès dans cette catégorie.
          </p>
        )}
      </div>

      <RetroModal
        isOpen={!!selectedAchievement}
        onClose={() => setSelectedAchievement(null)}
        title="Détails du Succès"
        type={selectedAchievement?.condition ? "success" : "default"}
      >
        <div className="flex flex-col items-center gap-6 text-center">
          {selectedAchievement && (
            <>
              <div
                className={`p-6 rounded-full border-4 shadow-xl ${
                  selectedAchievement.condition
                    ? "bg-gray-700 border-yellow-500"
                    : "bg-gray-800 border-gray-600 opacity-50"
                }`}
              >
                <div className={`${selectedAchievement.color} scale-[2.5]`}>
                  {selectedAchievement.icon}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {selectedAchievement.label}
                </h3>
                <p className="text-gray-400 text-sm">
                  {selectedAchievement.desc}
                </p>
              </div>

              <div className="w-full bg-gray-700 h-4 rounded-full overflow-hidden border border-gray-600">
                <div
                  className={`h-full transition-all duration-1000 ${
                    selectedAchievement.condition
                      ? "bg-green-500"
                      : "bg-blue-500"
                  }`}
                  style={{ width: `${selectedAchievement.progressPercent}%` }}
                ></div>
              </div>
              <p className="font-bold text-yellow-400">
                {selectedAchievement.progress}
              </p>

              {selectedAchievement.condition ? (
                <span className="text-green-400 font-bold border border-green-500 px-3 py-1 rounded bg-green-900/20">
                  COMPLÉTÉ
                </span>
              ) : (
                <span className="text-gray-500 font-bold border border-gray-600 px-3 py-1 rounded bg-gray-900/20">
                  VERROUILLÉ
                </span>
              )}
            </>
          )}
        </div>
      </RetroModal>
    </div>
  );
}

function AchievementCard({
  achievement,
  onClick,
}: {
  achievement: Achievement;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`relative p-3 md:p-4 rounded-xl border-2 flex items-center gap-3 md:gap-4 transition-all duration-300 cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${
        achievement.condition
          ? achievement.category === "EPIC"
            ? "bg-purple-900/30 border-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:bg-purple-900/40"
            : achievement.category === "HARD"
            ? "bg-orange-900/30 border-orange-500 text-white hover:bg-orange-900/40"
            : achievement.category === "MEDIUM"
            ? "bg-yellow-900/30 border-yellow-500 text-white hover:bg-yellow-900/40"
            : achievement.category === "EASY"
            ? "bg-green-900/30 border-green-500 text-white hover:bg-green-900/40"
            : "bg-blue-900/30 border-blue-500 text-white hover:bg-blue-900/40"
          : "bg-gray-800 border-gray-700 text-gray-500 grayscale opacity-70 hover:opacity-90"
      }`}
    >
      <div
        className={`p-2 md:p-3 rounded-full flex-shrink-0 ${
          achievement.condition ? "bg-black/20" : "bg-gray-700"
        }`}
      >
        {achievement.condition ? (
          <div className={achievement.color}>{achievement.icon}</div>
        ) : (
          <Lock className="w-5 h-5 md:w-6 md:h-6" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-xs md:text-sm flex items-center gap-2 truncate pr-2 uppercase">
          {achievement.label}
        </h3>
        <p className="text-[10px] md:text-xs opacity-80 truncate">
          {achievement.desc}
        </p>

        <div className="mt-2 w-full bg-black/40 h-1.5 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              achievement.condition ? "bg-white" : "bg-gray-600"
            }`}
            style={{
              width: `${achievement.progressPercent}%`,
            }}
          ></div>
        </div>
      </div>

      {achievement.condition && (
        <div className="absolute top-2 right-2">
          <span className="text-[8px] bg-white/20 px-1.5 py-0.5 rounded-full font-bold">
            OK
          </span>
        </div>
      )}
    </div>
  );
}
