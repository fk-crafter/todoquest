"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
// On a retiré useRouter car il ne servait pas
import { Check, Plus, Trash } from "lucide-react";
import { useAudio } from "@/context/AudioContext";
import Sidebar from "@/components/Sidebar";

interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  timeSpent?: number; // On l'a ajouté ici pour que TypeScript soit content
}

export default function TasksPage() {
  const { data: session } = useSession();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  // On a retiré setIsNewUser car on ne s'en sert pas pour l'instant
  const [isNewUser] = useState(false);

  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);

  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);

  const completedTasks = tasks.filter((task) => task.completed);
  const incompleteTasks = tasks.filter((task) => !task.completed);

  const [levelUpMessage, setLevelUpMessage] = useState("");
  const xpProgressPercent = Math.min((xp / 100) * 100, 100);

  const [showTimeModal, setShowTimeModal] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [timeInput, setTimeInput] = useState("");

  const { setMusicSource } = useAudio();

  // --- AUDIO ---
  useEffect(() => {
    setMusicSource("/tasks.wav");
  }, [setMusicSource]); // Dépendance propre

  // --- FETCH DATA (Avec useCallback pour stabiliser les fonctions) ---
  const fetchTasks = useCallback(async () => {
    if (!session?.accessToken) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tasks`,
        {
          headers: { Authorization: `Bearer ${session?.accessToken}` },
        }
      );
      const data = await res.json();
      setTasks(data);
    } catch (error) {
      console.error("Error fetching tasks", error);
    }
  }, [session]);

  const fetchUserData = useCallback(async () => {
    if (!session?.accessToken) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/me`,
        {
          headers: { Authorization: `Bearer ${session?.accessToken}` },
        }
      );

      if (!res.ok) throw new Error("Failed to fetch user data");
      const data = await res.json();

      setXp(data.xp);
      setLevel(data.level);
    } catch (error) {
      console.error("Error fetching user data", error);
    }
  }, [session]);

  // --- INIT DATA ---
  useEffect(() => {
    if (session?.accessToken) {
      fetchTasks();
      fetchUserData();
    }
  }, [session, fetchTasks, fetchUserData]); // Toutes les dépendances sont là !

  useEffect(() => {
    if (
      isNewUser &&
      session?.user?.id &&
      !localStorage.getItem(`todoquest_tutorial_seen_${session.user.id}`)
    ) {
      setShowTutorial(true);
    }
  }, [isNewUser, session]);

  const tutorialMessages = [
    "Ô vaillant héros, sois le bienvenu dans TodoQuest, terre d'ordre et de bravoure.",
    "Transforme tes corvées en épopées : chaque tâche est une quête en devenir.",
    "Triomphe d’elles pour gagner de l'expérience et élever ton rang parmi les élus.",
    "Saisis ta plume, trace ta destinée — ta première quête t’attend",
  ];

  // --- ACTIONS ---
  const addTask = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tasks`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.accessToken}`,
          },
          body: JSON.stringify({ title, description }),
        }
      );

      if (!res.ok) throw new Error("Failed to add task");

      setTitle("");
      setDescription("");
      fetchTasks();
    } catch (error) {
      console.error("Error adding task", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tasks/${taskId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${session?.accessToken}` },
        }
      );
      fetchTasks();
      fetchUserData();
    } catch (error) {
      console.error("Error deleting task", error);
    }
  };

  // --- COMPLETION LOGIC ---
  const handleOpenTimeModal = (taskId: string) => {
    setSelectedTaskId(taskId);
    setTimeInput("");
    setShowTimeModal(true);
  };

  const handleConfirmTime = async () => {
    const timeSpent = parseInt(timeInput);
    if (isNaN(timeSpent) || timeSpent < 0) {
      alert("Temps invalide !");
      return;
    }
    await completeTaskWithTime(selectedTaskId!, timeSpent);
    setShowTimeModal(false);
  };

  const playLevelUpSound = () => {
    const audio = new Audio("/lvl-up.mp3");
    audio.play();
  };

  const completeTaskWithTime = async (taskId: string, timeSpent: number) => {
    if (!session || !session.user) return;

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

      const newLevel = data.userStats.level;
      const newXP = data.userStats.xp;

      if (newLevel > level) {
        playLevelUpSound();
        setLevelUpMessage(
          `🎉 Félicitations ! Vous avez atteint le niveau ${newLevel} !`
        );
        setTimeout(() => setLevelUpMessage(""), 5000);
      }

      setXp(newXP);
      setLevel(newLevel);
      fetchTasks();
    } catch (error) {
      console.error("Error completing task", error);
    }
  };

  const playSound = () => {
    const clickAudio = new Audio("/click-sound.wav");
    clickAudio.play();
  };

  // --- RENDER ---
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
      {levelUpMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-yellow-500 text-black font-bold px-6 py-3 rounded-xl shadow-lg border-2 border-black ">
          {levelUpMessage}
        </div>
      )}
      {showTimeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm border-2 border-black">
            <h2 className="text-xl font-bold mb-4 text-black">
              Temps passé sur la tâche
            </h2>
            <input
              type="number"
              value={timeInput}
              onChange={(e) => setTimeInput(e.target.value)}
              placeholder="Temps (en minutes)"
              className="w-full p-2 rounded border border-gray-400 text-black mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowTimeModal(false)}
                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-black"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmTime}
                className="px-4 py-2 rounded bg-green-600 hover:bg-green-700 text-white"
              >
                Valider
              </button>
            </div>
          </div>
        </div>
      )}
      <main className="w-full p-6 mt-12">
        <div className="flex flex-col md:flex-row items-start justify-center min-h-screen gap-8">
          {/* Section Gauche : Ajout & Liste à faire */}
          <div className="w-full md:w-1/2">
            <h1 className="text-3xl font-bold mb-4">Vos Tâches</h1>
            <div className="mb-4">
              <p className="text-lg font-semibold">
                XP: {xp} | Niveau: {level}
              </p>
              <div className="w-full bg-gray-600 rounded-full h-4 mt-2 overflow-hidden">
                <div
                  className="bg-green-500 h-4 transition-all duration-500"
                  style={{ width: `${xpProgressPercent}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-300 mt-1 text-right">
                {xp} / 100 XP
              </p>
            </div>

            <form onSubmit={addTask} className="flex flex-col gap-4 w-full">
              <input
                type="text"
                placeholder="Titre de la tâche"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="p-2 rounded bg-gray-700 text-white w-full"
                required
              />
              <textarea
                placeholder="Description (optionnel)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="p-2 resize-none rounded bg-gray-700 text-white w-full"
              />
              <button
                type="submit"
                disabled={loading}
                className="p-2 bg-green-500 hover:bg-green-600 rounded text-white font-bold w-full flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? "Ajout..." : "Ajouter la tâche"} <Plus size={18} />
              </button>
            </form>

            <div className="mt-6">
              <h2 className="text-xl font-semibold mb-2">À faire</h2>
              {incompleteTasks.length === 0 ? (
                <p className="text-gray-400">Aucune tâche en cours.</p>
              ) : (
                incompleteTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between bg-gray-800 p-4 rounded-lg mt-2"
                  >
                    <div>
                      <h2 className="font-bold text-white">{task.title}</h2>
                      {task.description && (
                        <p className="text-sm text-gray-300">
                          {task.description}
                        </p>
                      )}
                      {/* Plus besoin de 'as any' car l'interface est correcte */}
                      {task.timeSpent != null && (
                        <p className="text-sm text-black italic mt-1">
                          ⏱ Temps passé : {task.timeSpent} min
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOpenTimeModal(task.id)}
                        className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg cursor-pointer"
                      >
                        <Check size={20} />
                      </button>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg cursor-pointer"
                      >
                        <Trash size={20} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Section Droite : Tâches terminées */}
          <div className="w-full md:w-1/2">
            <h2 className="text-xl font-semibold mb-4">Tâches complétées</h2>
            {completedTasks.length === 0 ? (
              <p className="text-gray-400">
                Aucune tâche complétée pour l&apos;instant.
              </p>
            ) : (
              completedTasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-green-800 p-4 rounded-lg mb-2 text-white flex justify-between items-center"
                >
                  <div>
                    <h3 className="font-bold">{task.title}</h3>
                    {task.description && (
                      <p className="text-sm text-gray-300">
                        {task.description}
                      </p>
                    )}
                    {task.timeSpent != null && (
                      <p className="text-sm text-gray-200 italic mt-1">
                        ⏱ Temps passé : {task.timeSpent} min
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg cursor-pointer"
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
