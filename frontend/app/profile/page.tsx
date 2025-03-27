"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation"; // 👈 Import du router
import { ArrowLeft } from "lucide-react"; // Icône rétro sympa (optionnel)

export default function ProfilePage() {
  const { data: session } = useSession();
  const router = useRouter(); // 👈 Initialiser le router
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [tasksCreated, setTasksCreated] = useState(0);
  const [tasksCompleted, setTasksCompleted] = useState(0);

  useEffect(() => {
    if (!session || !session.user) return;
    fetchProfileData();
  }, [session]);

  const fetchProfileData = async () => {
    if (!session || !session.user) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/${session.user.id}/stats`,
        {
          headers: { Authorization: `Bearer ${session.accessToken}` },
        }
      );

      if (!res.ok) throw new Error("Failed to fetch profile data");

      const data = await res.json();

      setXp(data.xp);
      setLevel(data.level);
      setTasksCreated(data.tasksCreated);
      setTasksCompleted(data.tasksCompleted);
    } catch (error) {
      console.error("Erreur lors du chargement des données du héros", error);
    }
  };

  if (!session) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <h1 className="text-2xl font-bold">Veuillez vous connecter</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 flex flex-col items-center bg-gray-900 text-white">
      {/* Bouton Retour */}
      <button
        onClick={() => router.back()}
        className="self-start mb-4 flex items-center gap-2 text-green-400 hover:text-white transition"
      >
        <ArrowLeft size={20} />
        Retour
      </button>

      <h1 className="text-4xl font-bold mb-6">Fiche de Héros</h1>

      <div className="bg-gray-800 p-6 rounded-xl shadow-lg w-full max-w-md space-y-6 border border-green-500">
        {/* Identité */}
        <div>
          <h2 className="text-xl font-semibold mb-2">Identité</h2>
          <p>
            <span className="text-green-400">Nom :</span> {session.user.name}
          </p>
          <p>
            <span className="text-green-400">Email :</span> {session.user.email}
          </p>
        </div>

        {/* Statistiques */}
        <div>
          <h2 className="text-xl font-semibold mb-2">Statistiques</h2>
          <p>
            <span className="text-green-400">XP :</span> {xp}
          </p>
          <p>
            <span className="text-green-400">Niveau :</span> {level}
          </p>
          <p>
            <span className="text-green-400">Tâches créées :</span>{" "}
            {tasksCreated ?? 0}
          </p>
          <p>
            <span className="text-green-400">Tâches complétées :</span>{" "}
            {tasksCompleted ?? 0}
          </p>
        </div>
      </div>
    </div>
  );
}
