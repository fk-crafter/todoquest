"use client";

interface MonsterAlertToastProps {
  message: string;
  hasLevelUp: boolean;
  hasAchievement: boolean;
}

export default function MonsterAlertToast({
  message,
  hasLevelUp,
  hasAchievement,
}: MonsterAlertToastProps) {
  if (!message) return null;

  return (
    <div
      className={`fixed left-1/2 transform -translate-x-1/2 z-50 bg-green-500 text-white font-bold px-4 py-3 md:px-6 rounded-xl shadow-[0_0_20px_rgba(34,197,94,0.5)] border-2 border-white w-[90%] md:w-auto text-center animate-bounce transition-all duration-300 ${
        hasLevelUp && hasAchievement
          ? "top-60 md:top-64"
          : hasLevelUp
            ? "top-28 md:top-32"
            : hasAchievement
              ? "top-48 md:top-52"
              : "top-20"
      }`}
    >
      {message}
    </div>
  );
}
