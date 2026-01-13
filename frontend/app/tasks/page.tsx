"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Sidebar from "@/components/Sidebar";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
} from "@dnd-kit/sortable";
import { Trophy, X, Pencil, Trash } from "lucide-react";
import { useAudio } from "@/context/AudioContext";

import TaskItem from "@/components/tasks/TaskItem";
import TaskForm from "@/components/tasks/TaskForm";
import StatsSection from "@/components/tasks/StatsSection";
import {
  Task,
  TaskFormData,
  Difficulty,
  ACHIEVEMENTS_THRESHOLDS,
} from "@/types/todo";

export default function TasksPage() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const { setMusicSource } = useAudio();

  const [achievementMessage, setAchievementMessage] = useState<{
    label: string;
  } | null>(null);
  const [levelUpMessage, setLevelUpMessage] = useState("");
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDifficulty, setEditDifficulty] = useState<Difficulty>("EASY");

  const [showTimeModal, setShowTimeModal] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [daysInput, setDaysInput] = useState("");
  const [hoursInput, setHoursInput] = useState("");
  const [minutesInput, setMinutesInput] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setMusicSource("/tasks.wav");
  }, [setMusicSource]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const playSound = () => {
    new Audio("/click-sound.wav").play().catch(() => {});
  };
  const playLevelUpSound = () => {
    new Audio("/lvl-up.mp3").play().catch(() => {});
  };

  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ["tasks"],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tasks`,
        {
          headers: { Authorization: `Bearer ${session?.accessToken}` },
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
      return res.json();
    },
    enabled: !!session?.accessToken,
  });

  const isNewUser = user?.level === 1 && user?.xp === 0;

  useEffect(() => {
    if (
      isNewUser &&
      session?.user?.id &&
      !localStorage.getItem(`todoquest_tutorial_seen_${session.user.id}`)
    ) {
      setShowTutorial(true);
    }
  }, [isNewUser, session]);

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

  const addTask = async (data: TaskFormData) => {
    playSound();
    setIsSubmitting(true);
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.accessToken}`,
        },
        body: JSON.stringify(data),
      });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    } catch (e) {
      console.error(e);
    }
    setIsSubmitting(false);
  };

  const deleteTask = async (id: string) => {
    playSound();
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tasks/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${session?.accessToken}` },
      });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    } catch (e) {
      console.error(e);
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
    if (!editingTask) return;
    playSound();
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tasks/${editingTask.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.accessToken}`,
          },
          body: JSON.stringify({
            title: editTitle,
            description: editDescription,
            difficulty: editDifficulty,
          }),
        }
      );
      setShowEditModal(false);
      setEditingTask(null);
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    } catch (e) {
      console.error(e);
    }
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

  const handleOpenTimeModal = (id: string) => {
    playSound();
    setSelectedTaskId(id);
    setDaysInput("");
    setHoursInput("");
    setMinutesInput("");
    setShowTimeModal(true);
  };

  const handleConfirmTime = async () => {
    const totalMinutes =
      parseInt(daysInput || "0") * 1440 +
      parseInt(hoursInput || "0") * 60 +
      parseInt(minutesInput || "0");
    if (totalMinutes <= 0) {
      alert("Durée invalide !");
      return;
    }

    if (!session || !selectedTaskId) return;
    const task = tasks.find((t) => t.id === selectedTaskId);
    if (!task) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tasks/${selectedTaskId}/complete`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.accessToken}`,
          },
          body: JSON.stringify({ timeSpent: totalMinutes }),
        }
      );
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();

      checkAchievements(task.difficulty);
      if (data.userStats.level > (user?.level || 1)) {
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
      setShowTimeModal(false);
    } catch (e) {
      console.error(e);
    }
  };

  const incompleteTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);
  const tutorialMessages = [
    "Ô vaillant héros, sois le bienvenu dans TodoQuest !",
    "Transforme tes corvées en épopées : chaque tâche est une quête.",
    "Choisis la difficulté pour gagner plus d'expérience (XP).",
    "Utilise le Crayon ✏️ pour modifier une quête en cours de route.",
    "À toi de jouer, ta destinée t'attend !",
  ];

  if (!session)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <h1 className="text-3xl font-bold">Connexion requise</h1>
      </div>
    );

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
              {[
                { l: "Jours", v: daysInput, s: setDaysInput },
                { l: "Heures", v: hoursInput, s: setHoursInput },
                { l: "Min", v: minutesInput, s: setMinutesInput },
              ].map((f, i) => (
                <div key={i} className="flex-1">
                  <label className="text-xs font-bold text-gray-400 uppercase">
                    {f.l}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={f.v}
                    onChange={(e) => f.s(e.target.value)}
                    className="w-full p-2 rounded border border-app-border bg-app-bg text-white text-center"
                    placeholder="0"
                  />
                </div>
              ))}
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
                            ? "bg-app-accent text-app-bg border-app-accent"
                            : "bg-app-bg border-app-border text-gray-400"
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
                Sauvegarder
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
                if (tutorialStep < tutorialMessages.length - 1)
                  setTutorialStep(tutorialStep + 1);
                else {
                  setShowTutorial(false);
                  if (session?.user?.id)
                    localStorage.setItem(
                      `todoquest_tutorial_seen_${session.user.id}`,
                      "true"
                    );
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
            <StatsSection user={user} />
            <TaskForm onAdd={addTask} isSubmitting={isSubmitting} />

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
                        <TaskItem
                          key={task.id}
                          task={task}
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
                      <span className="text-[10px] md:text-xs bg-gray-800 text-gray-500 px-2 py-1 rounded border border-gray-700 whitespace-nowrap">
                        {task.difficulty}
                      </span>
                    </div>
                    {task.description && (
                      <p className="text-sm text-gray-600 break-words">
                        {task.description}
                      </p>
                    )}
                    {task.timeSpent != null && (
                      <p className="text-sm text-gray-500 italic mt-1">
                        ⏱ {(task.timeSpent / 60).toFixed(1)}h
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
