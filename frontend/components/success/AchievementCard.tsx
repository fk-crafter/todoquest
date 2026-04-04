"use client";

import { Lock } from "lucide-react";
import React from "react";

export type AchievementDifficulty = "ALL" | "EASY" | "MEDIUM" | "HARD" | "EPIC";

export interface Achievement {
  id: string;
  category: AchievementDifficulty;
  label: string;
  desc: string;
  condition: boolean;
  progress: string;
  progressPercent: number;
  icon: React.ReactNode;
  color: string;
}

interface AchievementCardProps {
  achievement: Achievement;
  onClick: () => void;
}

export default function AchievementCard({
  achievement,
  onClick,
}: AchievementCardProps) {
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
