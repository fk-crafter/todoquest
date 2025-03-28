"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function SuccessPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [tasksCreated, setTasksCreated] = useState(0);
  const [tasksCompleted, setTasksCompleted] = useState(0);

  useEffect(() => {
    if (!session || !session.user) return;
    fetchData();
  }, [session]);

  const fetchData = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/${session?.user.id}/stats`,
        {
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
          },
        }
      );

      const data = await res.json();

      setXp(data.xp);
      setLevel(data.level);
      setTasksCreated(data.tasksCreated);
      setTasksCompleted(data.tasksCompleted);
    } catch (error) {
      console.error("Erreur chargement des succès", error);
    }
  };

  const achievements = [
    {
      id: 1,
      label: "🗡️ Première quête accomplie",
      condition: tasksCompleted >= 1,
    },
    {
      id: 2,
      label: "🧙 Héros émergent (10 tâches terminées)",
      condition: tasksCompleted >= 10,
    },
    {
      id: 3,
      label: "📜 Maître des listes (20 tâches créées)",
      condition: tasksCreated >= 20,
    },
    {
      id: 4,
      label: "🔥 Aventurier confirmé (niveau 5)",
      condition: level >= 5,
    },
    {
      id: 5,
      label: "👑 Légende montante (niveau 10)",
      condition: level >= 10,
    },
  ];

  if (!session) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <h1 className="text-2xl font-bold">Veuillez vous connecter</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 flex flex-col items-center">
      <button
        onClick={() => router.back()}
        className="self-start mb-4 flex items-center gap-2 text-gray-400 hover:text-white cursor-pointer transition"
      >
        <ArrowLeft size={20} />
        Retour
      </button>

      <h1 className="text-3xl font-bold mb-6">Succès déverrouillés</h1>

      <div className="w-full max-w-md space-y-4">
        {achievements.map((ach) => (
          <div
            key={ach.id}
            className={`p-4 rounded-lg border ${
              ach.condition
                ? "bg-green-800 border-green-500 text-white"
                : "bg-gray-700 border-gray-600 text-gray-400 opacity-60"
            }`}
          >
            {ach.label}
          </div>
        ))}
      </div>
    </div>
  );
}
