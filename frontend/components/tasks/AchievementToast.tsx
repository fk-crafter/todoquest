"use client";

import { Trophy } from "lucide-react";
import { useTranslations } from "next-intl";

interface AchievementToastProps {
  message: string | null;
  hasLevelUp: boolean;
}

export default function AchievementToast({
  message,
  hasLevelUp,
}: AchievementToastProps) {
  const t = useTranslations("Tasks");

  if (!message) return null;

  return (
    <div
      className={`fixed left-1/2 transform -translate-x-1/2 z-50 bg-app-surface text-app-accent font-bold px-4 py-3 md:px-6 rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.5)] border-2 border-app-accent w-[90%] md:w-auto flex flex-col items-center gap-2 animate-bounce transition-all duration-300 ${
        hasLevelUp ? "top-28 md:top-32" : "top-20"
      }`}
    >
      <div className="flex items-center gap-2">
        <Trophy className="text-app-accent" />
        <span>{t("achievementUnlocked")}</span>
      </div>
      <p className="text-sm md:text-base text-white">{message}</p>
    </div>
  );
}
