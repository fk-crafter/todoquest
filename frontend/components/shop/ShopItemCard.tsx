"use client";

import { Coins, Check, Lock, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { ShopItem } from "./constants";

interface ShopItemCardProps {
  item: ShopItem;
  isOwned: boolean;
  canBuy: boolean;
  isProcessing: boolean;
  onBuyRequest: (item: ShopItem) => void;
}

export default function ShopItemCard({
  item,
  isOwned,
  canBuy,
  isProcessing,
  onBuyRequest,
}: ShopItemCardProps) {
  const t = useTranslations("Shop");
  const IconComponent = item.icon;

  return (
    <div
      className={`bg-gray-800 border-2 rounded-lg p-3 flex flex-col items-center gap-2 transition-all group relative ${isOwned ? "border-green-600/50" : "border-gray-600 hover:border-blue-500 hover:bg-gray-750"}`}
    >
      <div className="w-12 h-12 bg-gray-700 rounded-md flex items-center justify-center border border-gray-600 group-hover:scale-105 transition-transform">
        <IconComponent size={28} className={item.color} />
      </div>

      <div className="text-center w-full">
        <h3 className="text-[10px] md:text-xs font-bold text-white w-full break-words leading-tight">
          {t(`items.${item.id}` as any)}
        </h3>
      </div>

      <button
        onClick={() => !isOwned && onBuyRequest(item)}
        disabled={isOwned || !canBuy || isProcessing}
        className={`w-full py-1.5 px-2 rounded text-xs font-bold border-b-2 active:border-b-0 active:translate-y-0.5 transition-all flex items-center justify-center gap-1 mt-auto ${isOwned ? "bg-green-700 text-white border-green-900 cursor-default" : canBuy ? "bg-yellow-500 hover:bg-yellow-400 text-black border-yellow-700 cursor-pointer" : "bg-gray-600 text-gray-400 border-gray-700 cursor-not-allowed"}`}
      >
        {isProcessing ? (
          <Loader2 className="animate-spin" size={12} />
        ) : isOwned ? (
          <>
            <Check size={12} /> {t("actions.owned")}
          </>
        ) : canBuy ? (
          <>
            {item.price} <Coins size={12} />
          </>
        ) : (
          <>
            <Lock size={12} /> {item.price}
          </>
        )}
      </button>
    </div>
  );
}
