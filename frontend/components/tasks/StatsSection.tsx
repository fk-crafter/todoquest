"use client";

import { Coins } from "lucide-react";

export default function StatsSection({ user }: { user: any }) {
  const xp = user?.xp || 0;
  const level = user?.level || 1;
  const gold = user?.gold || 0;
  const xpToNextLevel = level * 25;
  const xpProgressPercent = Math.min((xp / xpToNextLevel) * 100, 100);

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <p className="text-base md:text-lg font-semibold text-white">
          Niveau {level}
        </p>
        <div className="flex items-center gap-2 bg-app-surface px-3 py-1 rounded-lg border border-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.2)]">
          <span className="text-yellow-400 font-bold">{gold}</span>
          <Coins className="text-yellow-500" size={16} />
        </div>
      </div>
      <div className="w-full bg-app-surface rounded-full h-4 mt-2 overflow-hidden border border-app-border">
        <div
          className="bg-app-accent h-4 transition-all duration-500"
          style={{ width: `${xpProgressPercent}%` }}
        ></div>
      </div>
      <p className="text-xs md:text-sm text-gray-400 mt-1 text-right">
        {xp} / {xpToNextLevel} XP
      </p>
    </div>
  );
}
