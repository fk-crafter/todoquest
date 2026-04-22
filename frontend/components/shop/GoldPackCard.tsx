"use client";

import { Coins, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

interface GoldPackCardProps {
  pack: {
    id: string;
    amount: number;
    gradient: string;
    border: string;
    glow: string;
    button: string;
  };
  onBuy: (packId: string) => void;
  isRedirecting: boolean;
}

export default function GoldPackCard({
  pack,
  onBuy,
  isRedirecting,
}: GoldPackCardProps) {
  const t = useTranslations("Shop");

  return (
    <div
      className={`bg-gradient-to-br ${pack.gradient} border-2 ${pack.border} rounded-lg p-4 flex items-center justify-between relative overflow-hidden group transition-all`}
    >
      <div
        className={`absolute -right-6 -top-6 w-24 h-24 rounded-full blur-xl transition-all ${pack.glow}`}
      ></div>
      <div className="flex flex-col gap-1 z-10">
        <h3 className="font-bold text-yellow-100 text-sm">
          {t(`treasury.packs.${pack.id}.name` as any)}
        </h3>
        <div className="flex items-center gap-2 text-yellow-400 font-bold text-xl">
          {pack.amount} <Coins size={20} />
        </div>
        <span className="text-[10px] text-yellow-200/70">
          {t(`treasury.packs.${pack.id}.desc` as any)}
        </span>
      </div>

      <button
        onClick={() => onBuy(pack.id)}
        disabled={isRedirecting}
        className={`z-10 font-bold py-2 px-4 rounded-lg shadow-lg active:scale-95 transition-all flex items-center gap-1 text-sm cursor-pointer ${pack.button} ${isRedirecting ? "opacity-70 cursor-wait" : ""}`}
      >
        {isRedirecting ? (
          <Loader2 className="animate-spin" size={16} />
        ) : (
          t(`treasury.packs.${pack.id}.price` as any)
        )}
      </button>
    </div>
  );
}
