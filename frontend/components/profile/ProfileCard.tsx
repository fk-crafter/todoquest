"use client";

import { useTranslations } from "next-intl";
import {
  Scroll,
  Sword,
  Trophy,
  Shield,
  Pencil,
  Check,
  X,
  Loader2,
} from "lucide-react";
import StatCard from "./StatCard";
import { UseMutationResult } from "@tanstack/react-query";

interface ProfileCardProps {
  user: any;
  currentName: string;
  avatarUrl: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  xpProgressPercent: number;
  tasksCreated: number;
  tasksCompleted: number;
  successRate: number;
  displayTitle: string;
  displayClassName: string;
  currentFrameData: any;
  isEditing: boolean;
  setIsEditing: (val: boolean) => void;
  newName: string;
  setNewName: (val: string) => void;
  updateNameMutation: UseMutationResult<void, Error, string, unknown>;
}

export default function ProfileCard({
  user,
  currentName,
  avatarUrl,
  level,
  xp,
  xpToNextLevel,
  xpProgressPercent,
  tasksCreated,
  tasksCompleted,
  successRate,
  displayTitle,
  displayClassName,
  currentFrameData,
  isEditing,
  setIsEditing,
  newName,
  setNewName,
  updateNameMutation,
}: ProfileCardProps) {
  const t = useTranslations("Profile");

  return (
    <div className="bg-gray-800 border-4 border-gray-600 rounded-xl p-6 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full mix-blend-overlay filter blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2" />

      <div className="flex flex-col md:flex-row gap-8 items-center md:items-start z-10 relative">
        <div className="flex flex-col items-center gap-4">
          <div
            className={`w-32 h-32 md:w-40 md:h-40 bg-gray-700 rounded-full border-4 overflow-hidden flex items-center justify-center relative transition-all duration-300 ${currentFrameData.style}`}
          >
            <img
              src={avatarUrl}
              alt="Avatar"
              className="w-full h-full object-cover"
              style={{ imageRendering: "pixelated" }}
              onError={(e) => {
                e.currentTarget.src = "/char-male.png";
              }}
            />
          </div>

          <div className="text-center w-full flex flex-col items-center">
            {isEditing ? (
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="bg-gray-700 text-white px-2 py-1 rounded border border-gray-500 focus:border-yellow-400 outline-none w-32 text-center"
                  autoFocus
                />
                <button
                  onClick={() => updateNameMutation.mutate(newName)}
                  disabled={updateNameMutation.isPending}
                  className="p-1 bg-green-600 rounded text-white"
                >
                  {updateNameMutation.isPending ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    <Check size={16} />
                  )}
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setNewName(currentName);
                  }}
                  className="p-1 bg-red-600 rounded text-white"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 group relative">
                <h2 className="text-xl font-bold text-white break-all">
                  {currentName}
                </h2>
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-gray-400 hover:text-yellow-400 opacity-0 group-hover:opacity-100 md:opacity-100 transition-opacity"
                >
                  <Pencil size={16} />
                </button>
              </div>
            )}

            <span
              className={`text-xs px-3 py-1 rounded-full border mt-2 inline-block ${
                user?.equippedTitle && user?.equippedTitle !== "default"
                  ? "bg-yellow-900/50 text-yellow-300 border-yellow-500"
                  : "bg-blue-900 text-blue-300 border-blue-500"
              }`}
            >
              {displayTitle}
            </span>
          </div>
        </div>

        <div className="flex-1 w-full space-y-6">
          <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
            <div className="flex justify-between items-end mb-2">
              <span className="text-yellow-400 font-bold text-lg">
                {t("ui.level", { level })}
              </span>
              <span className="text-gray-400 text-xs">
                {t("ui.xp", { xp, xpToNextLevel })}
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden border border-gray-600">
              <div
                className="bg-gradient-to-r from-yellow-600 to-yellow-400 h-full transition-all duration-1000 ease-out"
                style={{ width: `${xpProgressPercent}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <StatCard
              icon={Scroll}
              label={t("ui.stats.quests")}
              value={tasksCreated}
              color="text-blue-400"
            />
            <StatCard
              icon={Sword}
              label={t("ui.stats.completed")}
              value={tasksCompleted}
              color="text-green-400"
            />
            <StatCard
              icon={Trophy}
              label={t("ui.stats.efficiency")}
              value={`${successRate}%`}
              color="text-purple-400"
            />

            <div
              className={`bg-gray-700 p-3 rounded-lg flex items-center gap-3 border border-gray-600 ${
                user?.class === "ADVENTURER" || !user?.class
                  ? "opacity-70"
                  : "border-yellow-500 bg-gray-800"
              }`}
            >
              <div className="p-2 bg-gray-800 rounded text-red-400">
                <Shield size={20} />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 uppercase">
                  {t("ui.stats.class")}
                </p>
                <p className="font-bold text-sm text-yellow-400 capitalize">
                  {displayClassName}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
