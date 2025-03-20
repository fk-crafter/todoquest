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

  useEffect(() => {
    if (!session || !session.user) return;
    fetchTasks();
    fetchUserData(); // Rafraîchir les données utilisateur au chargement
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

      // Vérifie que session et user existent avant d'affecter
      if (session && session.user) {
        session.user.xp = data.xp;
        session.user.level = data.level;
      }
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
    if (!session || !session.user) return; // Vérifie que session et user existent

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

      // Vérifie que data contient bien newXP et newLevel avant d'affecter
      if (data.newXP !== undefined && data.newLevel !== undefined) {
        session.user.xp = data.newXP;
        session.user.level = data.newLevel;
      }

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
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <h1 className="text-3xl font-bold mb-6">Vos Tâches</h1>
      <p className="text-lg font-semibold">
        XP: {session.user.xp} | Niveau: {session.user.level}
      </p>

      <form
        onSubmit={addTask}
        className="flex flex-col gap-4 mt-6 w-full max-w-md"
      >
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
          className="p-2 bg-green-500 hover:bg-green-600 rounded text-white font-bold w-full"
        >
          {loading ? "Ajout..." : "Ajouter la tâche"} <Plus size={18} />
        </button>
      </form>

      <div className="mt-6 w-full max-w-md">
        {tasks.length === 0 ? (
          <p className="text-gray-400">Aucune tâche pour l'instant.</p>
        ) : (
          tasks.map((task) => (
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
                {!task.completed && (
                  <button
                    onClick={() => completeTask(task.id)}
                    className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
                  >
                    <Check size={20} />
                  </button>
                )}
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
  );
}
