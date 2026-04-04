"use client";

import RetroModal from "@/components/ui/RetroModal";
import { useTranslations } from "next-intl";
import { Achievement } from "./AchievementCard";

interface AchievementModalProps {
  achievement: Achievement | null;
  onClose: () => void;
}

export default function AchievementModal({
  achievement,
  onClose,
}: AchievementModalProps) {
  const t = useTranslations("Success");

  return (
    <RetroModal
      isOpen={!!achievement}
      onClose={onClose}
      title={t("modal.title")}
      type={achievement?.condition ? "success" : "default"}
    >
      <div className="flex flex-col items-center gap-6 text-center">
        {achievement && (
          <>
            <div
              className={`p-6 rounded-full border-4 shadow-xl ${
                achievement.condition
                  ? "bg-gray-700 border-yellow-500"
                  : "bg-gray-800 border-gray-600 opacity-50"
              }`}
            >
              <div className={`${achievement.color} scale-[2.5]`}>
                {achievement.icon}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-white mb-2">
                {achievement.label}
              </h3>
              <p className="text-gray-400 text-sm">{achievement.desc}</p>
            </div>

            <div className="w-full bg-gray-700 h-4 rounded-full overflow-hidden border border-gray-600">
              <div
                className={`h-full transition-all duration-1000 ${
                  achievement.condition ? "bg-green-500" : "bg-blue-500"
                }`}
                style={{ width: `${achievement.progressPercent}%` }}
              ></div>
            </div>
            <p className="font-bold text-yellow-400">{achievement.progress}</p>

            {achievement.condition ? (
              <span className="text-green-400 font-bold border border-green-500 px-3 py-1 rounded bg-green-900/20">
                {t("modal.completed")}
              </span>
            ) : (
              <span className="text-gray-500 font-bold border border-gray-600 px-3 py-1 rounded bg-gray-900/20">
                {t("modal.locked")}
              </span>
            )}
          </>
        )}
      </div>
    </RetroModal>
  );
}
