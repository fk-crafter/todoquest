"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Check, Plus, Trash, Pencil, X, Trophy, Coins } from "lucide-react";
import { useAudio } from "@/context/AudioContext";
import Sidebar from "@/components/Sidebar";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const taskSchema = z.object({
  title: z.string().min(1, "Le titre est requis").max(50, "Titre trop long"),
  description: z.string().optional(),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD", "EPIC"]),
});

type TaskFormData = z.infer<typeof taskSchema>;

type Difficulty = "EASY" | "MEDIUM" | "HARD" | "EPIC";

interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  timeSpent?: number;
  difficulty: Difficulty;
}

const ACHIEVEMENTS_THRESHOLDS = [
  { id: "gen_1", count: 1, type: "TOTAL", label: "🌱 Le début du voyage" },
  { id: "gen_2", count: 10, type: "TOTAL", label: "🔥 Aventurier Confirmé" },
  { id: "gen_3", count: 20, type: "TOTAL", label: "👑 Légende montante" },
  { id: "easy_1", count: 5, type: "EASY", label: "🧹 Nettoyeur de Gobelins" },
  { id: "easy_2", count: 20, type: "EASY", label: "🏃‍♂️ Routine Matinale" },
  { id: "med_1", count: 5, type: "MEDIUM", label: "🛡️ Garde du Village" },
  { id: "med_2", count: 15, type: "MEDIUM", label: "🔨 Forgeron Productif" },
  { id: "hard_1", count: 3, type: "HARD", label: "👹 Chasseur de Trolls" },
  { id: "hard_2", count: 10, type: "HARD", label: "🌋 Survivant du Volcan" },
  { id: "epic_1", count: 1, type: "EPIC", label: "🐉 Tueur de Dragons" },
  { id: "epic_2", count: 5, type: "EPIC", label: "🌌 Roi de la Productivité" },
];

interface SortableTaskProps {
  task: Task;
  getDifficultyBadge: (diff: Difficulty) => React.ReactNode;
  formatTimeSpent: (min: number) => string;
  onEdit: (task: Task) => void;
  onCheck: (id: string) => void;
  onDelete: (id: string) => void;
}

function SortableTaskItem({
  task,
  getDifficultyBadge,
  formatTimeSpent,
  onEdit,
  onCheck,
  onDelete,
}: SortableTaskProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="flex flex-col sm:flex-row sm:items-center justify-between bg-app-surface p-4 rounded-lg mt-2 border-l-4 border-l-app-accent gap-3 sm:gap-0 group touch-none cursor-grab active:cursor-grabbing border border-app-border"
    >
      <div className="flex-1">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <h2 className="font-bold text-white text-lg break-words">
            {task.title}
          </h2>
          {getDifficultyBadge(task.difficulty)}
        </div>
        {task.description && (
          <p className="text-sm text-gray-300 break-words">
            {task.description}
          </p>
        )}
        {task.timeSpent != null && (
          <p className="text-sm text-app-accent italic mt-1 font-bold">
            ⏱ Temps passé : {formatTimeSpent(task.timeSpent)}
          </p>
        )}
      </div>
      <div className="flex gap-2 self-end sm:self-center">
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => onEdit(task)}
          className="p-2 bg-gray-700 hover:bg-app-accent hover:text-app-bg text-white rounded-lg cursor-pointer transition-colors border border-gray-600 hover:border-app-accent"
        >
          <Pencil size={20} />
        </button>

        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => onCheck(task.id)}
          className="p-2 bg-app-accent hover:opacity-80 text-app-bg rounded-lg cursor-pointer transition-colors font-bold shadow-[0_0_10px_rgba(0,0,0,0.3)]"
        >
          <Check size={20} />
        </button>
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => onDelete(task.id)}
          className="p-2 bg-red-900/50 hover:bg-red-600 border border-red-800 text-white rounded-lg cursor-pointer transition-colors"
        >
          <Trash size={20} />
        </button>
      </div>
    </div>
  );
}

export default function TasksPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const queryClient = useQueryClient();

  const [achievementMessage, setAchievementMessage] = useState<{
    label: string;
  } | null>(null);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      difficulty: "EASY",
    },
  });

  const currentDifficulty = watch("difficulty");

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDifficulty, setEditDifficulty] = useState<Difficulty>("EASY");

  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [levelUpMessage, setLevelUpMessage] = useState("");
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const [daysInput, setDaysInput] = useState("");
  const [hoursInput, setHoursInput] = useState("");
  const [minutesInput, setMinutesInput] = useState("");

  const { setMusicSource } = useAudio();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      queryClient.setQueryData(["tasks"], (oldTasks: Task[] | undefined) => {
        if (!oldTasks) return [];
        const oldIndex = oldTasks.findIndex((t) => t.id === active.id);
        const newIndex = oldTasks.findIndex((t) => t.id === over?.id);
        return arrayMove(oldTasks, oldIndex, newIndex);
      });
    }
  };

  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ["tasks"],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tasks`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.accessToken}`,
          },
        }
      );
      if (!res.ok) throw new Error("Erreur tasks");
      return res.json();
    },
    enabled: !!session?.accessToken,
  });

  const { data: user } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/me`,
        {
          headers: { Authorization: `Bearer ${session?.accessToken}` },
        }
      );
      if (!res.ok) throw new Error("Erreur user");
      return res.json();
    },
    enabled: !!session?.accessToken,
  });

  const xp = user?.xp || 0;
  const level = user?.level || 1;
  const gold = user?.gold || 0;
  const isNewUser = user?.level === 1 && user?.xp === 0;

  const completedTasks = tasks.filter((task) => task.completed);
  const incompleteTasks = tasks.filter((task) => !task.completed);
  const xpToNextLevel = level * 25;
  const xpProgressPercent = Math.min((xp / xpToNextLevel) * 100, 100);

  const tutorialMessages = [
    "Ô vaillant héros, sois le bienvenu dans TodoQuest !",
    "Transforme tes corvées en épopées : chaque tâche est une quête.",
    "Choisis la difficulté pour gagner plus d'expérience (XP).",
    "Utilise le Crayon ✏️ pour modifier une quête en cours de route.",
    "À toi de jouer, ta destinée t'attend !",
  ];

  useEffect(() => {
    setMusicSource("/tasks.wav");
  }, [setMusicSource]);

  const playSound = () => {
    const clickAudio = new Audio("/click-sound.wav");
    clickAudio.play();
  };

  const playLevelUpSound = () => {
    const audio = new Audio("/lvl-up.mp3");
    audio.play();
  };

  useEffect(() => {
    if (
      isNewUser &&
      session?.user?.id &&
      !localStorage.getItem(`todoquest_tutorial_seen_${session.user.id}`)
    ) {
      setShowTutorial(true);
    }
  }, [isNewUser, session]);

  const addTask = async (data: TaskFormData) => {
    playSound();
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tasks`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.accessToken}`,
          },
          body: JSON.stringify(data),
        }
      );
      if (!res.ok) throw new Error("Failed to add task");
      reset();
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    } catch (error) {
      console.error("Error adding task", error);
    }
  };

  const openEditModal = (task: Task) => {
    playSound();
    setEditingTask(task);
    setEditTitle(task.title);
    setEditDescription(task.description || "");
    setEditDifficulty(task.difficulty);
    setShowEditModal(true);
  };

  const saveEdit = async () => {
    if (!editingTask || !session?.accessToken) return;
    playSound();
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tasks/${editingTask.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.accessToken}`,
          },
          body: JSON.stringify({
            title: editTitle,
            description: editDescription,
            difficulty: editDifficulty,
          }),
        }
      );
      if (!res.ok) throw new Error("Failed to update task");
      setShowEditModal(false);
      setEditingTask(null);
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    } catch (error) {
      console.error("Error updating task", error);
    }
  };

  const deleteTask = async (taskId: string) => {
    playSound();
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tasks/${taskId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${session?.accessToken}` },
        }
      );
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    } catch (error) {
      console.error("Error deleting task", error);
    }
  };

  const handleOpenTimeModal = (taskId: string) => {
    playSound();
    setSelectedTaskId(taskId);
    setDaysInput("");
    setHoursInput("");
    setMinutesInput("");
    setShowTimeModal(true);
  };

  const handleConfirmTime = async () => {
    const days = parseInt(daysInput || "0");
    const hours = parseInt(hoursInput || "0");
    const minutes = parseInt(minutesInput || "0");
    const totalMinutes = days * 24 * 60 + hours * 60 + minutes;

    if (totalMinutes <= 0) {
      alert("Veuillez entrer une durée valide !");
      return;
    }
    await completeTaskWithTime(selectedTaskId!, totalMinutes);
    setShowTimeModal(false);
  };

  const checkAchievements = (completedTaskDifficulty: Difficulty) => {
    const currentCompleted = tasks.filter((t) => t.completed);
    const newTotalCount = currentCompleted.length + 1;
    const newDiffCount =
      currentCompleted.filter((t) => t.difficulty === completedTaskDifficulty)
        .length + 1;

    const unlocked = ACHIEVEMENTS_THRESHOLDS.find((ach) => {
      if (ach.type === "TOTAL" && ach.count === newTotalCount) return true;
      if (ach.type === completedTaskDifficulty && ach.count === newDiffCount)
        return true;
      return false;
    });

    if (unlocked) {
      playSound();
      setAchievementMessage({ label: unlocked.label });
      setTimeout(() => setAchievementMessage(null), 6000);
    }
  };

  const completeTaskWithTime = async (taskId: string, timeSpent: number) => {
    if (!session || !session.user) return;
    const taskToComplete = tasks.find((t) => t.id === taskId);
    const taskDifficulty = taskToComplete?.difficulty || "EASY";

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tasks/${taskId}/complete`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.accessToken}`,
          },
          body: JSON.stringify({ timeSpent }),
        }
      );
      if (!res.ok) throw new Error("Failed to complete task");
      const data = await res.json();
      checkAchievements(taskDifficulty);

      if (data.userStats.level > level) {
        playLevelUpSound();
        setLevelUpMessage(
          `🎉 Félicitations ! Vous avez atteint le niveau ${data.userStats.level} !`
        );
        setTimeout(() => setLevelUpMessage(""), 5000);
      } else {
        playSound();
      }
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    } catch (error) {
      console.error("Error completing task", error);
    }
  };

  const formatTimeSpent = (totalMinutes: number) => {
    const days = Math.floor(totalMinutes / (24 * 60));
    const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
    const minutes = totalMinutes % 60;
    let result = "";
    if (days > 0) result += `${days}j `;
    if (hours > 0) result += `${hours}h `;
    if (minutes > 0 || result === "") result += `${minutes}min`;
    return result.trim();
  };

  const getDifficultyBadge = (diff: Difficulty) => {
    switch (diff) {
      case "EASY":
        return (
          <span className="text-[10px] md:text-xs bg-green-900/50 text-green-300 px-2 py-1 rounded border border-green-700 whitespace-nowrap">
            Facile (+10 XP)
          </span>
        );
      case "MEDIUM":
        return (
          <span className="text-[10px] md:text-xs bg-yellow-900/50 text-yellow-300 px-2 py-1 rounded border border-yellow-700 whitespace-nowrap">
            Moyen (+30 XP)
          </span>
        );
      case "HARD":
        return (
          <span className="text-[10px] md:text-xs bg-orange-900/50 text-orange-300 px-2 py-1 rounded border border-orange-700 whitespace-nowrap">
            Difficile (+50 XP)
          </span>
        );
      case "EPIC":
        return (
          <span className="text-[10px] md:text-xs bg-purple-900/50 text-purple-300 px-2 py-1 rounded border border-purple-700 whitespace-nowrap">
            Épique (+100 XP)
          </span>
        );
      default:
        return null;
    }
  };

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-3xl font-bold">Veuillez vous connecter</h1>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      {achievementMessage && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-app-surface text-app-accent font-bold px-4 py-3 md:px-6 rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.5)] border-2 border-app-accent w-[90%] md:w-auto flex flex-col items-center gap-2 animate-bounce">
          <div className="flex items-center gap-2">
            <Trophy className="text-app-accent" />
            <span>Succès Débloqué !</span>
          </div>
          <p className="text-sm md:text-base text-white">
            {achievementMessage.label}
          </p>
        </div>
      )}
      {levelUpMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-app-accent text-app-bg font-bold px-4 py-3 md:px-6 rounded-xl shadow-lg border-2 border-black w-[90%] md:w-auto text-center">
          {levelUpMessage}
        </div>
      )}

      {showTimeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-app-surface p-6 rounded-lg shadow-xl w-full max-w-sm border-2 border-app-border">
            <h2 className="text-xl font-bold mb-4 text-app-accent">
              Temps passé sur la tâche
            </h2>

            <div className="flex gap-2 mb-6">
              <div className="flex-1">
                <label className="text-xs font-bold text-gray-400 uppercase">
                  Jours
                </label>
                <input
                  type="number"
                  min="0"
                  value={daysInput}
                  onChange={(e) => setDaysInput(e.target.value)}
                  className="w-full p-2 rounded border border-app-border bg-app-bg text-white text-center"
                  placeholder="0"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs font-bold text-gray-400 uppercase">
                  Heures
                </label>
                <input
                  type="number"
                  min="0"
                  value={hoursInput}
                  onChange={(e) => setHoursInput(e.target.value)}
                  className="w-full p-2 rounded border border-app-border bg-app-bg text-white text-center"
                  placeholder="0"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs font-bold text-gray-400 uppercase">
                  Min
                </label>
                <input
                  type="number"
                  min="0"
                  value={minutesInput}
                  onChange={(e) => setMinutesInput(e.target.value)}
                  className="w-full p-2 rounded border border-app-border bg-app-bg text-white text-center"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowTimeModal(false)}
                className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-500 text-white"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmTime}
                className="px-4 py-2 rounded bg-app-accent hover:opacity-80 text-app-bg font-bold"
              >
                Valider
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-app-surface p-6 rounded-xl shadow-2xl w-full max-w-md border-2 border-app-border text-white relative">
            <button
              onClick={() => setShowEditModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X size={24} />
            </button>

            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-app-accent">
              <Pencil size={24} /> Modifier la quête
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-300">
                  Titre
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full p-2 rounded bg-app-bg border border-app-border focus:border-app-accent outline-none text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-300">
                  Description
                </label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full p-2 rounded bg-app-bg border border-app-border focus:border-app-accent outline-none h-24 resize-none text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">
                  Difficulté
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(["EASY", "MEDIUM", "HARD", "EPIC"] as Difficulty[]).map(
                    (d) => (
                      <button
                        key={d}
                        onClick={() => setEditDifficulty(d)}
                        className={`py-2 px-2 rounded text-xs font-bold border transition-all ${
                          editDifficulty === d
                            ? d === "EASY"
                              ? "bg-green-600 border-green-400"
                              : d === "MEDIUM"
                              ? "bg-yellow-600 border-yellow-400"
                              : d === "HARD"
                              ? "bg-orange-600 border-orange-400"
                              : "bg-purple-600 border-purple-400"
                            : "bg-app-bg border-app-border text-gray-400 hover:bg-gray-700"
                        }`}
                      >
                        {d}
                      </button>
                    )
                  )}
                </div>
              </div>

              <button
                onClick={saveEdit}
                className="w-full py-3 mt-4 bg-app-accent hover:opacity-90 text-app-bg rounded font-bold shadow-lg transition-transform active:scale-95"
              >
                Sauvegarder les modifications
              </button>
            </div>
          </div>
        </div>
      )}

      {showTutorial && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end gap-4 p-6 justify-center md:justify-start">
          <div className="w-20 h-20 md:w-24 md:h-24 bg-[url('/tuto.png')] bg-contain bg-no-repeat flex-shrink-0" />

          <div className="bg-app-surface text-white p-4 rounded-lg shadow-lg border-2 border-app-accent max-w-sm w-full">
            <p className="mb-4">{tutorialMessages[tutorialStep]}</p>
            <button
              onClick={() => {
                playSound();
                if (tutorialStep < tutorialMessages.length - 1) {
                  setTutorialStep(tutorialStep + 1);
                } else {
                  setShowTutorial(false);
                  if (session?.user?.id) {
                    localStorage.setItem(
                      `todoquest_tutorial_seen_${session.user.id}`,
                      "true"
                    );
                  }
                }
              }}
              className="px-4 py-2 bg-app-accent text-app-bg font-bold rounded hover:opacity-80 cursor-pointer w-full md:w-auto"
            >
              {tutorialStep < tutorialMessages.length - 1
                ? "Suivant"
                : "Terminer"}
            </button>
          </div>
        </div>
      )}

      <main className="w-full p-4 md:p-6 mt-12 md:mt-12 mb-16 md:mb-0">
        <div className="flex flex-col md:flex-row items-start justify-center min-h-screen gap-6 md:gap-8">
          <div className="w-full md:w-1/2">
            <h1 className="text-2xl md:text-3xl font-bold mb-4 text-app-accent">
              Vos Tâches
            </h1>

            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <p className="text-base md:text-lg font-semibold text-white">
                  Niveau {level}
                </p>
                <div className="flex items-center gap-2 bg-app-surface px-3 py-1 rounded-lg border border-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.2)]">
                  <span className="text-yellow-400 font-bold">{gold}</span>
                  <Coins className="text-yellow-500" size={16} />
                </div>
              </div>
              <div className="w-full bg-app-surface rounded-full h-4 mt-2 overflow-hidden border border-app-border">
                <div
                  className="bg-app-accent h-4 transition-all duration-500"
                  style={{ width: `${xpProgressPercent}%` }}
                ></div>
              </div>
              <p className="text-xs md:text-sm text-gray-400 mt-1 text-right">
                {xp} / {xpToNextLevel} XP
              </p>
            </div>

            <form
              onSubmit={handleSubmit(addTask)}
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
                  <span className="text-red-400 text-xs">
                    {errors.title.message}
                  </span>
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
                  {(["EASY", "MEDIUM", "HARD", "EPIC"] as Difficulty[]).map(
                    (d) => (
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
                    )
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="p-3 bg-app-accent hover:opacity-90 rounded text-app-bg font-bold w-full flex items-center justify-center gap-2 cursor-pointer transition-colors mt-2 text-sm md:text-base disabled:opacity-50"
              >
                {isSubmitting ? "Ajout..." : "Ajouter la tâche"}{" "}
                <Plus size={18} />
              </button>
            </form>

            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-2 text-white">À faire</h2>

              {incompleteTasks.length === 0 ? (
                <p className="text-gray-400">Aucune tâche en cours.</p>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={incompleteTasks}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="flex flex-col gap-2">
                      {incompleteTasks.map((task) => (
                        <SortableTaskItem
                          key={task.id}
                          task={task}
                          getDifficultyBadge={getDifficultyBadge}
                          formatTimeSpent={formatTimeSpent}
                          onEdit={openEditModal}
                          onCheck={handleOpenTimeModal}
                          onDelete={deleteTask}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </div>
          </div>

          <div className="w-full md:w-1/2">
            <h2 className="text-xl font-semibold mb-4 text-white">
              Tâches complétées
            </h2>
            {completedTasks.length === 0 ? (
              <p className="text-gray-400">
                Aucune tâche complétée pour l&apos;instant.
              </p>
            ) : (
              completedTasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-app-surface/60 p-4 rounded-lg mb-2 text-white flex justify-between items-center border border-app-border/50"
                >
                  <div className="flex-1 mr-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold line-through text-gray-500 break-all">
                        {task.title}
                      </h3>
                      {getDifficultyBadge(task.difficulty)}
                    </div>
                    {task.description && (
                      <p className="text-sm text-gray-600 break-words">
                        {task.description}
                      </p>
                    )}
                    {task.timeSpent != null && (
                      <p className="text-sm text-gray-500 italic mt-1">
                        ⏱ Temps passé : {formatTimeSpent(task.timeSpent)}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="p-2 bg-red-900/30 hover:bg-red-700 text-white rounded-lg cursor-pointer flex-shrink-0"
                  >
                    <Trash size={20} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
