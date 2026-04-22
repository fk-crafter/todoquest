"use client";

import { ShoppingBag, Coins } from "lucide-react";
import { useTranslations } from "next-intl";

interface ShopHeaderProps {
  gold: number;
  isLoading: boolean;
}

export default function ShopHeader({ gold, isLoading }: ShopHeaderProps) {
  const t = useTranslations("Shop");

  return (
    <div className="flex justify-between items-center mb-6 mt-12 bg-gray-800 p-3 rounded-xl border-b-4 border-gray-600">
      <div className="flex items-center gap-3">
        <ShoppingBag className="text-yellow-400" size={24} />
        <h1 className="text-xl md:text-2xl font-bold text-yellow-400">
          {t("header.title")}
        </h1>
      </div>

      <div className="bg-gray-900 px-3 py-1 rounded-lg border-2 border-yellow-500 flex items-center gap-2 shadow-[0_0_10px_rgba(234,179,8,0.3)]">
        <span className="text-yellow-400 text-lg font-bold">
          {isLoading ? "..." : gold}
        </span>
        <Coins className="text-yellow-500" size={18} />
      </div>
    </div>
  );
}
