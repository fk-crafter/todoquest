import { useEffect } from "react";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";

interface MonsterModalProps {
  isOpen: boolean;
  onClose: () => void;
  monster: { hp: number; maxHp: number } | null;
  timeLeftStr: string;
  senderName?: string | null;
}

export default function MonsterModal({
  isOpen,
  onClose,
  monster,
  timeLeftStr,
  senderName,
}: MonsterModalProps) {
  const t = useTranslations("Tasks");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !monster) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 p-6 rounded-xl shadow-2xl w-full max-w-sm border-4 border-red-900 text-center relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-white"
        >
          <X size={24} />
        </button>

        <h2 className="text-xl font-bold mb-1 text-red-500 animate-pulse">
          {" "}
          {senderName
            ? t("Monster.monsterWarning", { name: senderName })
            : t("Monster.invasion") || "Invasion !"}{" "}
        </h2>
        <h3 className="text-lg text-white mb-4">
          {t("Monster.title") || "Gobelin"}
        </h3>

        <div className="w-24 h-24 mx-auto mb-4 bg-[url('/ennemy.png')] bg-contain bg-center bg-no-repeat drop-shadow-[0_0_15px_rgba(220,38,38,0.5)]"></div>

        <p className="text-xs text-gray-400 mb-4 px-2">
          {t("Monster.description") || "Faites vos tâches pour l'attaquer !"}
        </p>

        <div className="w-full bg-gray-950 border-2 border-gray-700 rounded-full h-6 mb-2 relative overflow-hidden">
          <div
            className="bg-red-600 h-full transition-all duration-500 ease-out"
            style={{ width: `${(monster.hp / monster.maxHp) * 100}%` }}
          ></div>
          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white text-shadow">
            {monster.hp} / {monster.maxHp} {t("Monster.hp") || "PV"}
          </span>
        </div>

        <p className="text-yellow-400 font-bold text-sm mt-4">
          ⏳ {t("Monster.timeLeft") || "Temps :"} {timeLeftStr}
        </p>
      </div>
    </div>
  );
}
