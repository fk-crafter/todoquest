"use client";

import { useSession } from "next-auth/react";
import { useMemo, useState } from "react";
import Sidebar from "@/components/Sidebar";
import { useTranslations } from "next-intl";
import { Trophy, Star, Shield, Sword, Crown, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import AchievementCard, {
  Achievement,
  AchievementDifficulty,
} from "@/components/success/AchievementCard";
import AchievementModal from "@/components/success/AchievementModal";

interface Task {
  id: string;
  difficulty: "EASY" | "MEDIUM" | "HARD" | "EPIC";
  completed: boolean;
}

export default function SuccessPage() {
  const t = useTranslations("Success");
  const { data: session } = useSession();
  const [selectedTab, setSelectedTab] = useState<AchievementDifficulty>("ALL");
  const [selectedAchievement, setSelectedAchievement] =
    useState<Achievement | null>(null);

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/me`,
        {
          headers: { Authorization: `Bearer ${session?.accessToken}` },
        },
      );
      if (!res.ok) throw new Error(t("errors.user"));
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
        },
      );
      if (!res.ok) throw new Error(t("errors.tasks"));
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
      label: t("achievements.gen_1.label"),
      desc: t("achievements.gen_1.desc"),
      condition: stats.total >= 1,
      progress: `${Math.min(stats.total, 1)}/1`,
      progressPercent: Math.min(stats.total, 1) * 100,
      icon: <Star size={24} />,
      color: "text-yellow-400",
    },
    {
      id: "gen_2",
      category: "ALL",
      label: t("achievements.gen_2.label"),
      desc: t("achievements.gen_2.desc"),
      condition: level >= 5,
      progress: `Niv ${Math.min(level, 5)}/5`,
      progressPercent: (Math.min(level, 5) / 5) * 100,
      icon: <Trophy size={24} />,
      color: "text-blue-400",
    },
    {
      id: "gen_3",
      category: "ALL",
      label: t("achievements.gen_3.label"),
      desc: t("achievements.gen_3.desc"),
      condition: level >= 10,
      progress: `Niv ${Math.min(level, 10)}/10`,
      progressPercent: (Math.min(level, 10) / 10) * 100,
      icon: <Crown size={24} />,
      color: "text-yellow-500",
    },
    {
      id: "easy_1",
      category: "EASY",
      label: t("achievements.easy_1.label"),
      desc: t("achievements.easy_1.desc"),
      condition: stats.easy >= 5,
      progress: `${Math.min(stats.easy, 5)}/5`,
      progressPercent: (Math.min(stats.easy, 5) / 5) * 100,
      icon: <Shield size={24} />,
      color: "text-green-400",
    },
    {
      id: "easy_2",
      category: "EASY",
      label: t("achievements.easy_2.label"),
      desc: t("achievements.easy_2.desc"),
      condition: stats.easy >= 20,
      progress: `${Math.min(stats.easy, 20)}/20`,
      progressPercent: (Math.min(stats.easy, 20) / 20) * 100,
      icon: <Shield size={24} />,
      color: "text-green-500",
    },
    {
      id: "med_1",
      category: "MEDIUM",
      label: t("achievements.med_1.label"),
      desc: t("achievements.med_1.desc"),
      condition: stats.medium >= 5,
      progress: `${Math.min(stats.medium, 5)}/5`,
      progressPercent: (Math.min(stats.medium, 5) / 5) * 100,
      icon: <Sword size={24} />,
      color: "text-yellow-400",
    },
    {
      id: "med_2",
      category: "MEDIUM",
      label: t("achievements.med_2.label"),
      desc: t("achievements.med_2.desc"),
      condition: stats.medium >= 15,
      progress: `${Math.min(stats.medium, 15)}/15`,
      progressPercent: (Math.min(stats.medium, 15) / 15) * 100,
      icon: <Sword size={24} />,
      color: "text-yellow-600",
    },
    {
      id: "hard_1",
      category: "HARD",
      label: t("achievements.hard_1.label"),
      desc: t("achievements.hard_1.desc"),
      condition: stats.hard >= 3,
      progress: `${Math.min(stats.hard, 3)}/3`,
      progressPercent: (Math.min(stats.hard, 3) / 3) * 100,
      icon: <Crown size={24} />,
      color: "text-orange-400",
    },
    {
      id: "hard_2",
      category: "HARD",
      label: t("achievements.hard_2.label"),
      desc: t("achievements.hard_2.desc"),
      condition: stats.hard >= 10,
      progress: `${Math.min(stats.hard, 10)}/10`,
      progressPercent: (Math.min(stats.hard, 10) / 10) * 100,
      icon: <Crown size={24} />,
      color: "text-orange-600",
    },
    {
      id: "epic_1",
      category: "EPIC",
      label: t("achievements.epic_1.label"),
      desc: t("achievements.epic_1.desc"),
      condition: stats.epic >= 1,
      progress: `${Math.min(stats.epic, 1)}/1`,
      progressPercent: (Math.min(stats.epic, 1) / 1) * 100,
      icon: <Crown size={24} />,
      color: "text-purple-400 animate-pulse",
    },
    {
      id: "epic_2",
      category: "EPIC",
      label: t("achievements.epic_2.label"),
      desc: t("achievements.epic_2.desc"),
      condition: stats.epic >= 5,
      progress: `${Math.min(stats.epic, 5)}/5`,
      progressPercent: (Math.min(stats.epic, 5) / 5) * 100,
      icon: <Crown size={24} />,
      color: "text-purple-600",
    },
  ];

  const filteredAchievements = allAchievements.filter(
    (ach) => selectedTab === "ALL" || ach.category === selectedTab,
  );

  if (!session) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white font-press">
        <h1 className="text-xl">{t("loading")}</h1>
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
          {t("header.title")}
        </h1>

        <p className="text-gray-400 mb-6 text-center text-xs md:text-sm md:mb-8">
          {t("header.description")}
        </p>

        <div className="flex flex-wrap justify-center gap-2 mb-6 bg-gray-800 p-2 rounded-lg shadow-md border border-gray-700 w-full md:w-auto md:mb-8">
          {(
            ["ALL", "EASY", "MEDIUM", "HARD", "EPIC"] as AchievementDifficulty[]
          ).map((diff) => (
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
              {t(`tabs.${diff}` as any)}
            </button>
          ))}
        </div>

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
          <p className="text-gray-500 mt-10">{t("empty")}</p>
        )}
      </div>

      <AchievementModal
        achievement={selectedAchievement}
        onClose={() => setSelectedAchievement(null)}
      />
    </div>
  );
}
