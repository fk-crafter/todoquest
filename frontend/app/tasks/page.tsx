"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Check, Plus, Trash } from "lucide-react";

interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
}

export default function TasksPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);

  const completedTasks = tasks.filter((task) => task.completed);
  const incompleteTasks = tasks.filter((task) => !task.completed);

  useEffect(() => {
    if (!session || !session.user) return;
    fetchTasks();
    fetchUserData();
  }, [session]);

  const fetchTasks = async () => {
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
  };

  const fetchUserData = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/${session?.user.id}/stats`,
        {
          headers: { Authorization: `Bearer ${session?.accessToken}` },
        }
      );

      if (!res.ok) {
        throw new Error("Failed to fetch user data");
      }

      const data = await res.json();

      setXp(data.xp);
      setLevel(data.level);
    } catch (error) {
      console.error("Error fetching user data", error);
    }
  };

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

  const completeTask = async (taskId: string) => {
    if (!session || !session.user) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tasks/${taskId}/complete`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${session.accessToken}` },
        }
      );

      if (!res.ok) {
        throw new Error("Failed to complete task");
      }

      const data = await res.json();

      setXp(data.newXP);
      setLevel(data.newLevel);

      fetchTasks();
    } catch (error) {
      console.error("Error completing task", error);
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
    } catch (error) {
      console.error("Error deleting task", error);
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
    <div className="flex flex-col md:flex-row items-start justify-center min-h-screen p-6 gap-8">
      <div className="w-full md:w-1/2">
        <h1 className="text-3xl font-bold mb-4">Vos Tâches</h1>
        <p className="text-lg font-semibold mb-4">
          XP: {xp} | Niveau: {level}
        </p>

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
            className="p-2 bg-green-500 hover:bg-green-600 rounded text-white font-bold w-full flex items-center justify-center gap-2"
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
                    <p className="text-gray-400 text-sm">{task.description}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => completeTask(task.id)}
                    className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
                  >
                    <Check size={20} />
                  </button>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
                  >
                    <Trash size={20} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="w-full md:w-1/2">
        <h2 className="text-xl font-semibold mb-4">Tâches complétées</h2>
        {completedTasks.length === 0 ? (
          <p className="text-gray-400">
            Aucune tâche complétée pour l'instant.
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
                  <p className="text-sm text-gray-300">{task.description}</p>
                )}
              </div>
              <button
                onClick={() => deleteTask(task.id)}
                className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
              >
                <Trash size={20} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
