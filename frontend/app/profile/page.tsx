"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Menu, X, ArrowLeft } from "lucide-react";

export default function ProfilePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [tasksCreated, setTasksCreated] = useState(0);
  const [tasksCompleted, setTasksCompleted] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const getHeroTitle = (level: number) => {
    if (level < 5) return "Novice du To-Do";
    if (level < 10) return "Aventurier Organisé";
    if (level < 20) return "Maître des Quêtes";
    if (level < 40) return "Héros de la Productivité";
    if (level < 50) return "Légende de la Productivité";
    return "Légende de la Productivité";
  };

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
      <button
        onClick={() => setSidebarOpen(true)}
        className="fixed top-4 left-4 z-50 p-2 bg-gray-800 text-white rounded cursor-pointer"
      >
        <Menu size={24} />
      </button>
      {sidebarOpen && (
        <>
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
          />

          <div className="fixed top-0 left-0 h-full w-64 bg-gray-900 text-white p-6 z-50 shadow-lg">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 text-white hover:text-red-400 cursor-pointer"
            >
              <X size={24} />
            </button>
            <div className="flex flex-col justify-between h-full">
              <div>
                <h1 className="text-2xl font-bold mb-8 pt-5">Fiche de Héros</h1>
                <nav className="flex flex-col gap-4 text-sm">
                  <button
                    onClick={() => {
                      router.push("/success");
                      setSidebarOpen(false);
                    }}
                    className="hover:text-green-400 text-left flex items-center gap-2 cursor-pointer"
                  >
                    🏆 Succès
                  </button>
                </nav>
              </div>

              <button
                onClick={() => {
                  router.back();
                  setSidebarOpen(false);
                }}
                className="text-sm text-gray-400 hover:text-white flex items-center gap-2 cursor-pointer"
              >
                <ArrowLeft size={16} /> Retour
              </button>
            </div>
          </div>
        </>
      )}

      <h1 className="text-4xl font-bold mb-6">Fiche de Héros</h1>

      <div className="bg-gray-800 p-6 rounded-xl shadow-lg w-full max-w-md space-y-6 border border-green-500">
        <div>
          <h2 className="text-xl font-semibold mb-2">Identité</h2>
          <p>
            <span className="text-green-400">Nom :</span> {session.user.name}
          </p>
          <p>
            <span className="text-green-400">Email :</span> {session.user.email}
          </p>

          <p>
            <span className="text-green-400">Titre :</span>{" "}
            {getHeroTitle(level)}
          </p>
        </div>

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
