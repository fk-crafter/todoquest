"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Coins,
  Loader2,
  Sparkles,
  X,
  Flame,
  AlertTriangle,
  Snowflake,
} from "lucide-react";
import toast from "react-hot-toast";

interface DailyRewardModalProps {
  currentStreak: number;
  availableFreezes: number;
  hasMissedDay: boolean;
  onClaim: (useFreeze?: boolean) => Promise<void>;
}

export default function DailyRewardModal({
  currentStreak,
  availableFreezes,
  hasMissedDay,
  onClaim,
}: DailyRewardModalProps) {
  const t = useTranslations("DailyReward");
  const [isClaiming, setIsClaiming] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const showDangerScreen = hasMissedDay && currentStreak > 0;

  const expectedStreak = showDangerScreen ? currentStreak : currentStreak + 1;

  const handleClaim = async (useFreeze: boolean) => {
    setIsClaiming(true);
    try {
      await onClaim(useFreeze);
      if (useFreeze) {
        toast.success(t("danger.saved"), { icon: "❄️" });
      } else if (showDangerScreen) {
        toast(t("danger.lost"), { icon: "💔" });
      } else {
        toast.success(t("success"), { icon: "🪙" });
      }
      setTimeout(() => setIsVisible(false), 500);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t("error");
      if (
        errorMessage.includes("déjà récupéré") ||
        errorMessage.includes("already claimed")
      ) {
        toast.error(errorMessage);
        setTimeout(() => setIsVisible(false), 800);
      } else {
        toast.error(errorMessage);
        setIsClaiming(false);
      }
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4 animate-in fade-in duration-300 font-press">
      {showDangerScreen ? (
        <div className="relative bg-gray-900 border-4 border-red-500 rounded-2xl p-6 md:p-8 max-w-sm w-full text-center shadow-[0_0_30px_rgba(239,68,68,0.3)] animate-in zoom-in-95 duration-300">
          <button
            onClick={() => setIsVisible(false)}
            className="absolute top-3 right-3 text-gray-500 hover:text-white hover:bg-gray-700 rounded-full p-1 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="relative w-24 h-24 mx-auto mb-6 mt-4 flex items-center justify-center bg-red-500/20 rounded-full animate-pulse">
            <AlertTriangle className="text-red-500 w-16 h-16" />
          </div>

          <h2 className="text-xl md:text-2xl text-red-500 mb-2 tracking-wider">
            {t("danger.title")}
          </h2>

          <p className="text-gray-300 mb-6 text-xs leading-relaxed">
            {t.rich("danger.description", {
              streak: currentStreak,
              highlight: (chunks) => (
                <span className="text-orange-500 font-bold">{chunks}</span>
              ),
            })}
          </p>

          <div className="flex flex-col gap-3 w-full">
            {availableFreezes > 0 ? (
              <button
                onClick={() => handleClaim(true)}
                disabled={isClaiming}
                className="w-full bg-blue-500 hover:bg-blue-400 text-white font-bold py-3 px-4 rounded-xl border-b-4 border-blue-700 active:border-b-0 active:translate-y-1 transition-all flex justify-center items-center gap-2 text-sm"
              >
                {isClaiming ? (
                  <Loader2 className="animate-spin w-5 h-5" />
                ) : (
                  <>
                    <Snowflake size={18} />{" "}
                    {t("danger.useFreeze", { count: availableFreezes })}
                  </>
                )}
              </button>
            ) : (
              <p className="text-xs text-blue-400 mb-2">
                {t("danger.noFreeze")}
              </p>
            )}

            <button
              onClick={() => handleClaim(false)}
              disabled={isClaiming}
              className="w-full bg-gray-700 hover:bg-red-900/50 text-gray-300 font-bold py-3 px-4 rounded-xl border-b-4 border-gray-800 active:border-b-0 active:translate-y-1 transition-all text-xs"
            >
              {isClaiming ? (
                <Loader2 className="animate-spin w-4 h-4" />
              ) : (
                t("danger.loseStreak")
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="relative bg-gray-900 border-4 border-yellow-500 rounded-2xl p-6 md:p-8 max-w-sm w-full text-center shadow-[0_0_30px_rgba(234,179,8,0.3)] animate-in zoom-in-95 duration-300">
          <button
            onClick={() => setIsVisible(false)}
            disabled={isClaiming}
            className="absolute top-3 right-3 text-gray-500 hover:text-white hover:bg-gray-700 rounded-full p-1 transition-colors"
            aria-label={t("close")}
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-[10px] md:text-xs px-4 py-1.5 rounded-full border-2 border-orange-700 shadow-lg flex items-center gap-2 whitespace-nowrap">
            <Flame
              size={14}
              className={expectedStreak > 1 ? "animate-pulse" : ""}
            />
            {t("streak", { days: expectedStreak })}
          </div>

          <div className="relative w-24 h-24 mx-auto mb-6 mt-4 flex items-center justify-center bg-yellow-500/20 rounded-full animate-bounce">
            <Sparkles className="absolute top-0 right-0 text-yellow-300 w-6 h-6 animate-pulse" />
            <Coins className="text-yellow-400 w-16 h-16" />
            <Sparkles className="absolute bottom-2 left-0 text-yellow-300 w-4 h-4 animate-pulse delay-150" />
          </div>

          <h2 className="text-xl md:text-2xl text-yellow-400 mb-4 tracking-wider">
            {t("title")}
          </h2>

          <p className="text-gray-300 mb-6 text-xs leading-relaxed">
            {t("description")}
          </p>

          <div className="flex gap-2 justify-center mb-6">
            <div className="bg-black/50 border-2 border-yellow-600 rounded-lg py-3 flex flex-col items-center gap-1 shadow-inner px-8">
              <Coins size={16} className="text-yellow-500" />
              <span className="text-yellow-400 text-sm md:text-base">
                {t("baseAmount")}
              </span>
            </div>
          </div>

          <button
            onClick={() => handleClaim(false)}
            disabled={isClaiming}
            className="w-full bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold py-4 px-6 rounded-xl border-b-4 border-yellow-700 hover:border-yellow-600 active:border-b-0 active:translate-y-1 transition-all disabled:opacity-50 flex justify-center items-center gap-2 text-sm"
          >
            {isClaiming ? (
              <Loader2 className="animate-spin w-5 h-5" />
            ) : (
              t("claim")
            )}
          </button>
        </div>
      )}
    </div>
  );
}
