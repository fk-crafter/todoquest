"use client";

import { useTranslations } from "next-intl";

interface TutorialOverlayProps {
  showTutorial: boolean;
  tutorialStep: number;
  tutorialMessages: string[];
  isWaitingForTaskCreation: boolean;
  isWaitingForTaskCompletion: boolean;
  isFinalStep: boolean;
  onNext: () => void;
  onFinish: () => void;
}

export default function TutorialOverlay({
  showTutorial,
  tutorialStep,
  tutorialMessages,
  isWaitingForTaskCreation,
  isWaitingForTaskCompletion,
  isFinalStep,
  onNext,
  onFinish,
}: TutorialOverlayProps) {
  const t = useTranslations("Tasks");

  if (
    !showTutorial ||
    tutorialStep >= tutorialMessages.length ||
    isWaitingForTaskCreation ||
    isWaitingForTaskCompletion
  ) {
    return null;
  }

  const playSound = () => {
    new Audio("/click-sound.wav").play().catch(() => {});
  };

  const handleAction = () => {
    playSound();
    if (isFinalStep) {
      onFinish();
    } else {
      onNext();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end gap-4 p-6 justify-center md:justify-start">
      <div className="w-20 h-20 md:w-24 md:h-24 bg-[url('/tuto.png')] bg-contain bg-no-repeat flex-shrink-0" />
      <div className="bg-app-surface text-white p-4 rounded-lg shadow-lg border-2 border-app-accent max-w-sm w-full">
        <p className="mb-4">{tutorialMessages[tutorialStep]}</p>
        <button
          onClick={handleAction}
          className="px-4 py-2 bg-app-accent text-app-bg font-bold rounded hover:opacity-80 cursor-pointer w-full md:w-auto"
        >
          {isFinalStep ? t("tutorial.finish") : t("tutorial.next")}
        </button>
      </div>
    </div>
  );
}
