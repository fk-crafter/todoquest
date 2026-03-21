"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useMemo,
} from "react";
import { useSession } from "next-auth/react";

interface TutorialContextType {
  isTutorialActive: boolean;
  tutorialStep: number;
  startTutorial: () => void;
  nextTutorialStep: () => void;
  endTutorial: () => void;
  setTutorialStep: (step: number) => void;
}

const TutorialContext = createContext<TutorialContextType | undefined>(
  undefined,
);

export const TutorialProvider = ({ children }: { children: ReactNode }) => {
  const { data: session } = useSession();
  const [isTutorialActive, setIsTutorialActive] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const userId = session?.user?.id;

  const startTutorial = useCallback(() => {
    if (userId) {
      const seen = localStorage.getItem(`todoquest_tutorial_seen_${userId}`);
      if (seen !== "true") {
        setIsTutorialActive(true);
        setTutorialStep(0);
      }
    }
  }, [userId]);

  const nextTutorialStep = useCallback(() => {
    setTutorialStep((prev) => prev + 1);
  }, []);

  const endTutorial = useCallback(() => {
    setIsTutorialActive(false);
    setTutorialStep(0);
    if (userId) {
      localStorage.setItem(`todoquest_tutorial_seen_${userId}`, "true");
    }
  }, [userId]);

  const setTutorialStepCb = useCallback((step: number) => {
    setTutorialStep(step);
  }, []);

  const value = useMemo(
    () => ({
      isTutorialActive,
      tutorialStep,
      startTutorial,
      nextTutorialStep,
      endTutorial,
      setTutorialStep: setTutorialStepCb,
    }),
    [
      isTutorialActive,
      tutorialStep,
      startTutorial,
      nextTutorialStep,
      endTutorial,
      setTutorialStepCb,
    ],
  );

  return (
    <TutorialContext.Provider value={value}>{children}</TutorialContext.Provider>
  );
};

export const useTutorial = () => {
  const context = useContext(TutorialContext);
  if (context === undefined) {
    throw new Error("useTutorial must be used within a TutorialProvider");
  }
  return context;
};
