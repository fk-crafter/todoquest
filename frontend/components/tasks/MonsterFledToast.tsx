"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";

interface MonsterFledToastProps {
  stolenGold?: number;
}

export default function MonsterFledToast({
  stolenGold,
}: MonsterFledToastProps) {
  const t = useTranslations("Tasks.Monster");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (stolenGold && stolenGold > 0) {
      setIsVisible(true);

      const timer = setTimeout(() => setIsVisible(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [stolenGold]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-[60] bg-red-950 border-2 border-red-500 text-white px-6 py-4 rounded-xl shadow-[0_0_30px_rgba(239,68,68,0.6)] text-center animate-in slide-in-from-top-10 fade-in duration-300 w-[90%] max-w-sm font-press">
      <button
        onClick={() => setIsVisible(false)}
        className="absolute top-2 right-2 text-red-500 hover:text-white transition-colors p-1"
      >
        <X size={18} />
      </button>
      <h3 className="font-bold text-red-500 text-sm md:text-base mb-2 animate-pulse tracking-wider mt-1">
        ⚠️ {t("fled")} ⚠️
      </h3>
      <p className="text-xs md:text-sm text-gray-300 leading-relaxed mb-1">
        {t("stolen", { gold: stolenGold ?? 0 })}
      </p>
    </div>
  );
}
