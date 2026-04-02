"use client";

import { X, Pencil } from "lucide-react";
import { useTranslations } from "next-intl";
import { Difficulty } from "@/types/todo";

interface EditTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  title: string;
  setTitle: (val: string) => void;
  description: string;
  setDescription: (val: string) => void;
  difficulty: Difficulty;
  setDifficulty: (val: Difficulty) => void;
}

export default function EditTaskModal({
  isOpen,
  onClose,
  onSave,
  title,
  setTitle,
  description,
  setDescription,
  difficulty,
  setDifficulty,
}: EditTaskModalProps) {
  const t = useTranslations("Tasks");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-app-surface p-6 rounded-xl shadow-2xl w-full max-w-md border-2 border-app-border text-white relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X size={24} />
        </button>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-app-accent">
          <Pencil size={24} /> {t("editModal.title")}
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-300">
              {t("editModal.taskTitle")}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 rounded bg-app-bg border border-app-border focus:border-app-accent outline-none text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-300">
              {t("editModal.description")}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 rounded bg-app-bg border border-app-border focus:border-app-accent outline-none h-24 resize-none text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">
              {t("editModal.difficulty")}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(["EASY", "MEDIUM", "HARD", "EPIC"] as Difficulty[]).map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`py-2 px-2 rounded text-xs font-bold border transition-all ${
                    difficulty === d
                      ? "bg-app-accent text-app-bg border-app-accent"
                      : "bg-app-bg border-app-border text-gray-400"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={onSave}
            className="w-full py-3 mt-4 bg-app-accent hover:opacity-90 text-app-bg rounded font-bold shadow-lg transition-transform active:scale-95"
          >
            {t("editModal.save")}
          </button>
        </div>
      </div>
    </div>
  );
}
