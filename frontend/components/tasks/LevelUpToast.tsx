"use client";

interface LevelUpToastProps {
  message: string;
}

export default function LevelUpToast({ message }: LevelUpToastProps) {
  if (!message) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-app-accent text-app-bg font-bold px-4 py-3 md:px-6 rounded-xl shadow-lg border-2 border-black w-[90%] md:w-auto text-center">
      {message}
    </div>
  );
}
