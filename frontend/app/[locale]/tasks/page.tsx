"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import MonsterModal from "@/components/tasks/MonsterModal";
import Sidebar from "@/components/Sidebar";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
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
import { Trophy, Trash, Swords } from "lucide-react";
import { useAudio } from "@/context/AudioContext";
import { useTutorial } from "@/context/TutorialContext";

import TaskItem from "@/components/tasks/TaskItem";
import TaskForm from "@/components/tasks/TaskForm";
import StatsSection from "@/components/tasks/StatsSection";
import TimeSpentModal from "@/components/tasks/TimeSpentModal";
import EditTaskModal from "@/components/tasks/EditTaskModal";
import {
  Task,
  TaskFormData,
  Difficulty,
  ACHIEVEMENTS_THRESHOLDS,
} from "@/types/todo";

export default function TasksPage() {
  const t = useTranslations("Tasks");
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const { setMusicSource } = useAudio();

  const [achievementMessage, setAchievementMessage] = useState<{
    label: string;
  } | null>(null);
  const [levelUpMessage, setLevelUpMessage] = useState("");
  const {
    isTutorialActive: showTutorial,
    tutorialStep,
    nextTutorialStep,
    startTutorial,
    endTutorial,
  } = useTutorial();

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
  const [monster, setMonster] = useState<{
    hp: number;
    maxHp: number;
    endTime: number;
  } | null>(null);
  const [showMonsterModal, setShowMonsterModal] = useState(false);
  const [monsterMessage, setMonsterMessage] = useState("");
  const [timeLeftStr, setTimeLeftStr] = useState("");

  useEffect(() => {
    setMusicSource("/tasks.wav");
  }, [setMusicSource]);

  useEffect(() => {
    if (!monster) return;
    const interval = setInterval(() => {
      const diff = monster.endTime - Date.now();
      if (diff <= 0) {
        setMonster(null);
        localStorage.removeItem("todoquest_monster");
        const cooldown =
          Math.floor(Math.random() * (72 - 24 + 1) + 24) * 60 * 60 * 1000;
        localStorage.setItem(
          "todoquest_next_invasion",
          (Date.now() + cooldown).toString(),
        );
      } else {
        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setTimeLeftStr(`${h}h ${m}m`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [monster]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
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
        },
      );
      if (!res.ok) throw new Error(t("errors.tasks"));
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
        },
      );
      return res.json();
    },
    enabled: !!session?.accessToken,
  });

  useEffect(() => {
    if (user) {
      if (user.monsterHp && user.monsterHp > 0 && user.monsterEndTime) {
        const endTime = new Date(user.monsterEndTime).getTime();
        if (endTime > Date.now()) {
          setMonster({
            hp: user.monsterHp,
            maxHp: user.monsterMaxHp,
            endTime: endTime,
          });
        } else {
          setMonster(null);
        }
      } else {
        setMonster(null);
      }
    }
  }, [user]);

  const isNewUser = user?.level === 1 && user?.xp === 0;

  useEffect(() => {
    if (isNewUser) {
      startTutorial();
    }
  }, [isNewUser, startTutorial]);

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

      if (showTutorial && tutorialStep === 7) {
        nextTutorialStep();
      }

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
        },
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
      alert(t("timeModal.invalidDuration"));
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
        },
      );
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();

      if (monster) {
        const damageMap = { EASY: 10, MEDIUM: 30, HARD: 50, EPIC: 100 };
        const dmg = damageMap[task.difficulty] || 10;
        const newHp = monster.hp - dmg;

        if (newHp <= 0) {
          playLevelUpSound();
          setMonsterMessage("⚔️ Monstre vaincu ! Vous avez protégé le camp !");
          setMonster(null);
          setShowMonsterModal(false);
          localStorage.removeItem("todoquest_monster");

          const cooldown =
            Math.floor(Math.random() * (72 - 24 + 1) + 24) * 60 * 60 * 1000;
          localStorage.setItem(
            "todoquest_next_invasion",
            (Date.now() + cooldown).toString(),
          );

          setTimeout(() => setMonsterMessage(""), 5000);
        } else {
          const updatedMonster = { ...monster, hp: newHp };
          setMonster(updatedMonster);
          localStorage.setItem(
            "todoquest_monster",
            JSON.stringify(updatedMonster),
          );
        }
      }

      if (showTutorial && tutorialStep === 8) {
        nextTutorialStep();
      }

      checkAchievements(task.difficulty);
      if (data.userStats.level > (user?.level || 1)) {
        playLevelUpSound();
        setLevelUpMessage(t("levelUp", { level: data.userStats.level }));
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
    t("tutorial.step1"),
    t("tutorial.step2"),
    t("tutorial.step3"),
    t("tutorial.step4"),
    t("tutorial.step5"),
    t("tutorial.step6"),
    t("tutorial.step7"),
    t("tutorial.step8"),
    t("tutorial.step9"),
    t("tutorial.step10"),
  ];

  const isWaitingForTaskCreation = showTutorial && tutorialStep === 7;
  const isWaitingForTaskCompletion = showTutorial && tutorialStep === 8;
  const isFinalStep = showTutorial && tutorialStep === 9;

  if (!session)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <h1 className="text-3xl font-bold">{t("loading")}</h1>
      </div>
    );

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      {achievementMessage && (
        <div
          className={`fixed left-1/2 transform -translate-x-1/2 z-50 bg-app-surface text-app-accent font-bold px-4 py-3 md:px-6 rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.5)] border-2 border-app-accent w-[90%] md:w-auto flex flex-col items-center gap-2 animate-bounce transition-all duration-300 ${
            levelUpMessage ? "top-28 md:top-32" : "top-20"
          }`}
        >
          <div className="flex items-center gap-2">
            <Trophy className="text-app-accent" />
            <span>{t("achievementUnlocked")}</span>
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

      {monsterMessage && (
        <div
          className={`fixed left-1/2 transform -translate-x-1/2 z-50 bg-green-500 text-white font-bold px-4 py-3 md:px-6 rounded-xl shadow-[0_0_20px_rgba(34,197,94,0.5)] border-2 border-white w-[90%] md:w-auto text-center animate-bounce transition-all duration-300 ${
            levelUpMessage && achievementMessage
              ? "top-60 md:top-64"
              : levelUpMessage
                ? "top-28 md:top-32"
                : achievementMessage
                  ? "top-48 md:top-52"
                  : "top-20"
          }`}
        >
          {monsterMessage}
        </div>
      )}

      <TimeSpentModal
        isOpen={showTimeModal}
        onClose={() => setShowTimeModal(false)}
        onConfirm={handleConfirmTime}
        days={daysInput}
        setDays={setDaysInput}
        hours={hoursInput}
        setHours={setHoursInput}
        minutes={minutesInput}
        setMinutes={setMinutesInput}
      />

      <EditTaskModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={saveEdit}
        title={editTitle}
        setTitle={setEditTitle}
        description={editDescription}
        setDescription={setEditDescription}
        difficulty={editDifficulty}
        setDifficulty={setEditDifficulty}
      />

      {showTutorial &&
        tutorialStep < tutorialMessages.length &&
        !isWaitingForTaskCreation &&
        !isWaitingForTaskCompletion && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-end gap-4 p-6 justify-center md:justify-start">
            <div className="w-20 h-20 md:w-24 md:h-24 bg-[url('/tuto.png')] bg-contain bg-no-repeat flex-shrink-0" />
            <div className="bg-app-surface text-white p-4 rounded-lg shadow-lg border-2 border-app-accent max-w-sm w-full">
              <p className="mb-4">{tutorialMessages[tutorialStep]}</p>
              <button
                onClick={() => {
                  playSound();
                  if (isFinalStep) {
                    endTutorial();
                  } else {
                    nextTutorialStep();
                  }
                }}
                className="px-4 py-2 bg-app-accent text-app-bg font-bold rounded hover:opacity-80 cursor-pointer w-full md:w-auto"
              >
                {isFinalStep ? t("tutorial.finish") : t("tutorial.next")}
              </button>
            </div>
          </div>
        )}

      {monster && !showTutorial && (
        <button
          onClick={() => setShowMonsterModal(true)}
          className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-40 bg-red-600 hover:bg-red-500 text-white p-3 md:p-4 rounded-full shadow-[0_0_15px_rgba(220,38,38,0.7)] border-2 border-black flex items-center justify-center animate-pulse"
        >
          <Swords size={28} />
        </button>
      )}

      <MonsterModal
        isOpen={showMonsterModal}
        onClose={() => setShowMonsterModal(false)}
        monster={monster}
        timeLeftStr={timeLeftStr}
      />

      <main className="w-full p-4 md:p-6 mt-12 md:mt-12 mb-16 md:mb-0 relative z-10">
        <div className="flex flex-col md:flex-row items-start justify-center min-h-screen gap-6 md:gap-8">
          <div
            className={`w-full md:w-1/2 ${isWaitingForTaskCreation ? "relative z-[60] ring-4 ring-app-accent rounded-xl p-2 bg-black/60" : ""}`}
          >
            {isWaitingForTaskCreation && (
              <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-app-accent text-app-bg px-4 py-3 rounded-lg font-bold text-xs md:text-sm shadow-xl w-[95%] md:w-[90%] max-w-[450px] text-center animate-bounce z-[70] leading-relaxed">
                {tutorialMessages[tutorialStep]}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-r-[8px] border-t-[8px] border-l-transparent border-r-transparent border-t-app-accent"></div>
              </div>
            )}

            <h1 className="text-2xl md:text-3xl font-bold mb-4 text-app-accent mt-2">
              {t("main.title")}
            </h1>
            <StatsSection user={user} />
            <TaskForm onAdd={addTask} isSubmitting={isSubmitting} />
            <div
              className={`mt-6 ${isWaitingForTaskCompletion ? "relative z-[60] ring-4 ring-app-accent rounded-xl p-2 bg-black/60" : ""}`}
            >
              {isWaitingForTaskCompletion && (
                <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 bg-app-accent text-app-bg px-4 py-3 rounded-lg font-bold text-xs md:text-sm shadow-xl w-[95%] md:w-[90%] max-w-[450px] text-center animate-bounce z-[70] leading-relaxed">
                  {tutorialMessages[tutorialStep]}
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-r-[8px] border-t-[8px] border-l-transparent border-r-transparent border-t-app-accent"></div>
                </div>
              )}
              <h2 className="text-xl font-semibold mb-2 text-white mt-2">
                {t("main.todo")}
              </h2>
              {incompleteTasks.length === 0 ? (
                <p className="text-gray-400">{t("main.noTodo")}</p>
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
              {t("main.completed")}
            </h2>
            {completedTasks.length === 0 ? (
              <p className="text-gray-400">{t("main.noCompleted")}</p>
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
