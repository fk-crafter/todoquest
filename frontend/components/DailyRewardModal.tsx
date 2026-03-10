"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Coins, Loader2, Sparkles } from "lucide-react";
import toast from "react-hot-toast";

interface DailyRewardModalProps {
  onClaim: () => Promise<void>;
}

export default function DailyRewardModal({ onClaim }: DailyRewardModalProps) {
  const t = useTranslations("DailyReward");
  const [isClaiming, setIsClaiming] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const handleClaim = async () => {
    setIsClaiming(true);
    try {
      await onClaim();
      toast.success(t("success"), { icon: "🪙" });
      setTimeout(() => setIsVisible(false), 500);
    } catch (error) {
      toast.error(t("error"));
      setIsClaiming(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4 animate-in fade-in duration-300">
      <div className="bg-gray-900 border-4 border-yellow-500 rounded-2xl p-6 md:p-8 max-w-sm w-full text-center shadow-[0_0_30px_rgba(234,179,8,0.3)] animate-in zoom-in-95 duration-300">
        <div className="relative w-24 h-24 mx-auto mb-6 flex items-center justify-center bg-yellow-500/20 rounded-full animate-bounce">
          <Sparkles className="absolute top-0 right-0 text-yellow-300 w-6 h-6 animate-pulse" />
          <Coins className="text-yellow-400 w-16 h-16" />
          <Sparkles className="absolute bottom-2 left-0 text-yellow-300 w-4 h-4 animate-pulse delay-150" />
        </div>

        <h2 className="text-2xl font-press text-yellow-400 mb-4 tracking-wider">
          {t("title")}
        </h2>

        <p className="text-gray-300 mb-6 text-sm leading-relaxed">
          {t("description")}
        </p>

        <div className="bg-black/50 border-2 border-yellow-600 rounded-lg py-3 mb-6">
          <span className="font-press text-yellow-400 text-xl">
            {t("amount")}
          </span>
        </div>

        <button
          onClick={handleClaim}
          disabled={isClaiming}
          className="w-full bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold font-press py-4 px-6 rounded-xl border-b-4 border-yellow-700 hover:border-yellow-600 active:border-b-0 active:translate-y-1 transition-all disabled:opacity-50 flex justify-center items-center gap-2"
        >
          {isClaiming ? (
            <Loader2 className="animate-spin w-5 h-5" />
          ) : (
            t("claim")
          )}
        </button>
      </div>
    </div>
  );
}
