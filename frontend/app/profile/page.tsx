"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Sidebar from "@/components/Sidebar";
import { Shield, Sword, Scroll, Trophy, Pencil, Check, X } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export default function ProfilePage() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const fetchProfile = async () => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/me`,
      {
        headers: { Authorization: `Bearer ${session?.accessToken}` },
      }
    );
    if (!res.ok) throw new Error("Erreur chargement profil");
    return res.json();
  };

  const { data: user, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: fetchProfile,
    enabled: !!session?.accessToken,
  });

  useEffect(() => {
    if (user?.name) {
      setNewName(user.name);
    }
  }, [user]);

  const updateUsername = async () => {
    if (!newName.trim() || !session?.accessToken) return;
    setIsSaving(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/me`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.accessToken}`,
          },
          body: JSON.stringify({ name: newName }),
        }
      );

      if (!res.ok) throw new Error("Erreur mise à jour");

      await queryClient.invalidateQueries({ queryKey: ["profile"] });
      setIsEditing(false);
    } catch (error) {
      console.error("Impossible de modifier le pseudo", error);
      alert("Erreur lors de la modification du pseudo");
    } finally {
      setIsSaving(false);
    }
  };

  const level = user?.level || 1;
  const xp = user?.xp || 0;
  const tasksCreated = user?.stats?.totalTasks || 0;
  const tasksCompleted = user?.stats?.completedTasks || 0;

  const xpToNextLevel = level * 25;
  const xpProgressPercent = Math.min((xp / xpToNextLevel) * 100, 100);

  const successRate =
    tasksCreated > 0 ? Math.round((tasksCompleted / tasksCreated) * 100) : 0;

  const currentName = user?.name || session?.user?.name || "Héros";

  const avatarUrl = currentName
    ? `https://api.dicebear.com/9.x/pixel-art/svg?seed=${currentName}`
    : "";

  const getHeroTitle = (lvl: number) => {
    if (lvl < 5) return "Novice du To-Do";
    if (lvl < 10) return "Aventurier Organisé";
    if (lvl < 20) return "Maître des Quêtes";
    if (lvl < 40) return "Héros de la Productivité";
    return "Légende Vivante";
  };

  if (!session) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white">
        <h1 className="text-2xl font-bold">
          Portail fermé (Connexion requise)
        </h1>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white">
        <p>Invocation du profil...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-900 text-white font-press">
      <Sidebar />

      <main className="flex-1 p-4 md:p-8 flex flex-col items-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-yellow-400 drop-shadow-md">
          Fiche de Héros
        </h1>

        <div className="bg-gray-800 border-4 border-gray-600 rounded-xl p-6 w-full max-w-2xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full mix-blend-overlay filter blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2"></div>

          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start z-10 relative">
            <div className="flex flex-col items-center gap-4">
              <div className="w-32 h-32 md:w-40 md:h-40 bg-gray-700 rounded-full border-4 border-yellow-500 overflow-hidden shadow-[0_0_15px_rgba(234,179,8,0.5)]">
                <img
                  src={avatarUrl}
                  alt="Avatar Héros"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="text-center w-full flex flex-col items-center">
                {isEditing ? (
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="bg-gray-700 text-white px-2 py-1 rounded border border-gray-500 focus:border-yellow-400 outline-none w-32 text-center"
                      autoFocus
                    />
                    <button
                      onClick={updateUsername}
                      disabled={isSaving}
                      className="p-1 bg-green-600 hover:bg-green-500 rounded text-white transition disabled:opacity-50"
                    >
                      <Check size={16} />
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setNewName(currentName);
                      }}
                      disabled={isSaving}
                      className="p-1 bg-red-600 hover:bg-red-500 rounded text-white transition disabled:opacity-50"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 group relative">
                    <h2 className="text-xl font-bold text-white break-all">
                      {currentName}
                    </h2>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-gray-400 hover:text-yellow-400 transition-colors opacity-0 group-hover:opacity-100 md:opacity-100"
                      title="Modifier le pseudo"
                    >
                      <Pencil size={16} />
                    </button>
                  </div>
                )}

                <span className="text-xs bg-blue-900 text-blue-300 px-3 py-1 rounded-full border border-blue-500 mt-2 inline-block">
                  {getHeroTitle(level)}
                </span>
              </div>
            </div>

            <div className="flex-1 w-full space-y-6">
              <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-yellow-400 font-bold text-lg">
                    Niveau {level}
                  </span>
                  <span className="text-gray-400 text-xs">
                    {xp} / {xpToNextLevel} XP
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden border border-gray-600">
                  <div
                    className="bg-gradient-to-r from-yellow-600 to-yellow-400 h-full transition-all duration-1000 ease-out"
                    style={{ width: `${xpProgressPercent}%` }}
                  ></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-700 p-3 rounded-lg flex items-center gap-3 border border-gray-600">
                  <div className="p-2 bg-gray-800 rounded text-blue-400">
                    <Scroll size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase">
                      Quêtes Créées
                    </p>
                    <p className="font-bold text-lg">{tasksCreated}</p>
                  </div>
                </div>

                <div className="bg-gray-700 p-3 rounded-lg flex items-center gap-3 border border-gray-600">
                  <div className="p-2 bg-gray-800 rounded text-green-400">
                    <Sword size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase">
                      Accomplies
                    </p>
                    <p className="font-bold text-lg">{tasksCompleted}</p>
                  </div>
                </div>

                <div className="bg-gray-700 p-3 rounded-lg flex items-center gap-3 border border-gray-600">
                  <div className="p-2 bg-gray-800 rounded text-purple-400">
                    <Trophy size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase">
                      Efficacité
                    </p>
                    <p className="font-bold text-lg">{successRate}%</p>
                  </div>
                </div>

                <div className="bg-gray-700 p-3 rounded-lg flex items-center gap-3 border border-gray-600 opacity-70">
                  <div className="p-2 bg-gray-800 rounded text-red-400">
                    <Shield size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase">
                      Classe
                    </p>
                    <p className="font-bold text-sm text-gray-300">???</p>
                  </div>
                </div>
              </div>

              <div className="text-center mt-4">
                <p className="text-xs text-gray-500 italic">
                  &quot;L&apos;aventure ne fait que commencer...&quot;
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
