"use client";

import { useTranslations } from "next-intl";
import { Snowflake, FlaskConical, Clock, Loader2 } from "lucide-react";
import { UseMutationResult } from "@tanstack/react-query";

interface InventorySectionProps {
  streakFreezes: number;
  dxpPotions: number;
  isDxpActive: boolean;
  dxpTimeLeft: string | null;
  usePotionMutation: UseMutationResult<void, Error, void, unknown>;
}

export default function InventorySection({
  streakFreezes,
  dxpPotions,
  isDxpActive,
  dxpTimeLeft,
  usePotionMutation,
}: InventorySectionProps) {
  const t = useTranslations("Profile");

  if (streakFreezes <= 0 && dxpPotions <= 0 && !isDxpActive) {
    return null;
  }

  return (
    <div className="bg-gray-800 p-6 rounded-xl border border-yellow-900/50 shadow-lg">
      <h2 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
        {t("inventory.title")}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {streakFreezes > 0 && (
          <div className="bg-gray-900 border border-blue-900 p-4 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-900/50 rounded-lg border border-blue-700">
                <Snowflake className="text-blue-400" size={24} />
              </div>
              <div>
                <p className="font-bold text-blue-300 text-sm">
                  {t("inventory.freeze.name")}
                </p>
                <p className="text-[10px] text-gray-400">
                  {t("inventory.freeze.desc")}
                </p>
              </div>
            </div>
            <span className="bg-blue-800 text-blue-100 font-bold px-3 py-1 rounded-full text-sm">
              x{streakFreezes}
            </span>
          </div>
        )}

        {(dxpPotions > 0 || isDxpActive) && (
          <div
            className={`bg-gray-900 border p-3 rounded-lg flex flex-wrap items-center justify-between gap-3 ${
              isDxpActive
                ? "border-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.3)]"
                : "border-purple-900"
            }`}
          >
            <div className="flex items-center gap-3 flex-1 min-w-[150px]">
              <div className="p-2 bg-purple-900/50 rounded-lg border border-purple-700 relative shrink-0">
                <FlaskConical
                  className={`text-purple-400 ${isDxpActive ? "animate-pulse" : ""}`}
                  size={24}
                />
                {!isDxpActive && (
                  <span className="absolute -top-2 -right-2 bg-purple-600 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold">
                    {dxpPotions}
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-purple-300 text-sm truncate">
                  {t("inventory.dxp.name")}
                </p>
                {isDxpActive ? (
                  <p className="text-[10px] text-purple-400 flex items-center gap-1 mt-1">
                    <Clock size={10} className="shrink-0" />{" "}
                    {t("inventory.dxp.active")}
                  </p>
                ) : (
                  <p className="text-[9px] md:text-[10px] text-gray-400 leading-tight mt-1">
                    {t("inventory.dxp.desc")}
                  </p>
                )}
              </div>
            </div>

            {!isDxpActive ? (
              <button
                onClick={() => usePotionMutation.mutate()}
                disabled={usePotionMutation.isPending}
                className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-4 py-2 rounded-lg text-xs transition-colors shrink-0"
              >
                {usePotionMutation.isPending ? (
                  <Loader2 className="animate-spin mx-auto" size={14} />
                ) : (
                  t("inventory.dxp.drink")
                )}
              </button>
            ) : (
              <div className="bg-purple-900/40 border border-purple-500/50 px-3 py-1.5 rounded-lg text-center shrink-0">
                <p className="text-[8px] text-purple-300 uppercase opacity-80 mb-0.5">
                  {t("inventory.dxp.timeLeftLabel")}
                </p>
                <p className="text-purple-400 font-bold text-[10px] md:text-xs tracking-wider">
                  {dxpTimeLeft || "..."}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
