"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { TaskFormData, taskSchema, Difficulty } from "@/types/todo";

interface TaskFormProps {
  onAdd: (data: TaskFormData) => Promise<void>;
  isSubmitting: boolean;
}

export default function TaskForm({ onAdd, isSubmitting }: TaskFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: { title: "", description: "", difficulty: "EASY" },
  });

  const currentDifficulty = watch("difficulty");

  return (
    <form
      onSubmit={handleSubmit(onAdd)}
      className="flex flex-col gap-3 md:gap-4 w-full bg-app-surface p-4 rounded-lg shadow-md border border-app-border"
    >
      <div>
        <input
          type="text"
          placeholder="Titre de la tâche"
          {...register("title")}
          className="p-2 rounded bg-app-bg text-white w-full border border-app-border focus:border-app-accent outline-none"
        />
        {errors.title && (
          <span className="text-red-400 text-xs">{errors.title.message}</span>
        )}
      </div>

      <textarea
        placeholder="Description (optionnel)"
        {...register("description")}
        className="p-2 resize-none rounded bg-app-bg text-white w-full border border-app-border focus:border-app-accent outline-none h-20 md:h-auto"
      />

      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-gray-300">
          Difficulté & Récompense :
        </label>
        <div className="grid grid-cols-2 gap-2 md:flex md:flex-wrap">
          {(["EASY", "MEDIUM", "HARD", "EPIC"] as Difficulty[]).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setValue("difficulty", d)}
              className={`py-3 md:py-2 px-1 rounded text-xs md:text-sm font-bold border transition-all md:flex-1 ${
                currentDifficulty === d
                  ? d === "EASY"
                    ? "bg-green-600 border-green-400 text-white"
                    : d === "MEDIUM"
                    ? "bg-yellow-600 border-yellow-400 text-white"
                    : d === "HARD"
                    ? "bg-orange-600 border-orange-400 text-white"
                    : "bg-purple-600 border-purple-400 text-white"
                  : "bg-app-bg border-app-border text-gray-400 hover:bg-gray-700"
              }`}
            >
              {d === "EASY"
                ? "Facile (10 XP)"
                : d === "MEDIUM"
                ? "Moyen (30 XP)"
                : d === "HARD"
                ? "Difficile (50 XP)"
                : "Épique (100 XP)"}
            </button>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="p-3 bg-app-accent hover:opacity-90 rounded text-app-bg font-bold w-full flex items-center justify-center gap-2 cursor-pointer transition-colors mt-2 text-sm md:text-base disabled:opacity-50"
      >
        {isSubmitting ? "Ajout..." : "Ajouter la tâche"} <Plus size={18} />
      </button>
    </form>
  );
}
