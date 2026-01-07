"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Sidebar from "@/components/Sidebar";
import {
  Shield,
  Sword,
  Scroll,
  Trophy,
  Pencil,
  Check,
  X,
  Moon,
  Mountain,
  Trees,
  Cpu,
  Crown,
  Star,
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const THEMES_METADATA = {
  default: { name: "Classique", icon: Moon, color: "text-gray-400" },
  theme_magma: { name: "Magma", icon: Mountain, color: "text-red-500" },
  theme_forest: { name: "Forêt", icon: Trees, color: "text-green-500" },
  theme_cyber: { name: "Cyberpunk", icon: Cpu, color: "text-purple-500" },
};

const TITLES_METADATA = {
  default: { name: "Rang de Niveau", icon: Star, color: "text-gray-400" },
  title_rich: { name: "Le Bourgeois", icon: Crown, color: "text-yellow-400" },
  title_slayer: { name: "Tueur", icon: Sword, color: "text-red-500" },
};

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

  const handleEquip = async (itemId: string, category: string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/equip`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.accessToken}`,
          },
          body: JSON.stringify({ itemId, category }),
        }
      );

      if (!res.ok) throw new Error("Erreur lors de l'équipement");

      await queryClient.invalidateQueries({ queryKey: ["profile"] });
      window.location.reload();
    } catch (error) {
      console.error(error);
      alert("Impossible d'équiper cet objet.");
    }
  };

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

  const getLevelTitle = (lvl: number) => {
    if (lvl < 5) return "Novice du To-Do";
    if (lvl < 10) return "Aventurier Organisé";
    if (lvl < 20) return "Maître des Quêtes";
    if (lvl < 40) return "Héros de la Productivité";
    return "Légende Vivante";
  };

  const equippedTitleId = user?.equippedTitle || "default";
  const displayTitle =
    equippedTitleId !== "default" &&
    TITLES_METADATA[equippedTitleId as keyof typeof TITLES_METADATA]
      ? TITLES_METADATA[equippedTitleId as keyof typeof TITLES_METADATA].name
      : getLevelTitle(level);

  let avatarFileName =
    user?.avatar || user?.image || session?.user?.image || "char1.png";
  avatarFileName = avatarFileName.replace("/avatars/", "").replace("/", "");
  const avatarUrl = `/${avatarFileName}`;

  if (!session) {
    return (
      <div className="text-white text-center mt-20">Connexion requise...</div>
    );
  }

  if (isLoading) {
    return <div className="text-white text-center mt-20">Chargement...</div>;
  }

  return (
    <div className="min-h-screen flex bg-gray-900 text-white font-press">
      <Sidebar />

      <main className="flex-1 p-4 md:p-8 flex flex-col items-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-yellow-400 drop-shadow-md">
          Fiche de Héros
        </h1>

        <div className="w-full max-w-2xl flex flex-col gap-6">
          <div className="bg-gray-800 border-4 border-gray-600 rounded-xl p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full mix-blend-overlay filter blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2"></div>

            <div className="flex flex-col md:flex-row gap-8 items-center md:items-start z-10 relative">
              <div className="flex flex-col items-center gap-4">
                <div className="w-32 h-32 md:w-40 md:h-40 bg-gray-700 rounded-full border-4 border-yellow-500 overflow-hidden shadow-[0_0_15px_rgba(234,179,8,0.5)] flex items-center justify-center relative">
                  <img
                    src={avatarUrl}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                    style={{ imageRendering: "pixelated" }}
                    onError={(e) => {
                      e.currentTarget.src = "/char1.png";
                    }}
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
                        className="p-1 bg-green-600 rounded text-white"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setNewName(currentName);
                        }}
                        className="p-1 bg-red-600 rounded text-white"
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
                        className="text-gray-400 hover:text-yellow-400 opacity-0 group-hover:opacity-100 md:opacity-100"
                      >
                        <Pencil size={16} />
                      </button>
                    </div>
                  )}

                  <span
                    className={`text-xs px-3 py-1 rounded-full border mt-2 inline-block ${
                      equippedTitleId !== "default"
                        ? "bg-yellow-900/50 text-yellow-300 border-yellow-500"
                        : "bg-blue-900 text-blue-300 border-blue-500"
                    }`}
                  >
                    {displayTitle}
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
                        Quêtes
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
                        Finies
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
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
              <h2 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
                🎨 Mes Thèmes
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div
                  className={`p-3 rounded-lg border-2 flex flex-col items-center gap-2 transition-all ${
                    !user?.equippedTheme
                      ? "border-green-500 bg-gray-700 scale-105"
                      : "border-gray-600 bg-gray-900 opacity-70 hover:opacity-100"
                  }`}
                >
                  <Moon size={28} className="text-gray-400" />
                  <span className="font-bold text-[10px]">Classique</span>
                  <button
                    onClick={() => handleEquip("default", "THEME")}
                    disabled={!user?.equippedTheme}
                    className={`px-3 py-1 rounded text-[10px] font-bold uppercase ${
                      !user?.equippedTheme
                        ? "bg-green-600 text-white cursor-default"
                        : "bg-gray-600 hover:bg-blue-600 text-white"
                    }`}
                  >
                    {!user?.equippedTheme ? "ÉQUIPÉ" : "CHOISIR"}
                  </button>
                </div>

                {user?.inventory
                  ?.filter((id: string) => id.startsWith("theme_"))
                  .map((themeId: string) => {
                    const meta =
                      THEMES_METADATA[themeId as keyof typeof THEMES_METADATA];
                    const isEquipped = user?.equippedTheme === themeId;
                    const Icon = meta?.icon || Moon;

                    return (
                      <div
                        key={themeId}
                        className={`p-3 rounded-lg border-2 flex flex-col items-center gap-2 transition-all ${
                          isEquipped
                            ? "border-green-500 bg-gray-700 scale-105"
                            : "border-gray-600 bg-gray-900 opacity-70 hover:opacity-100"
                        }`}
                      >
                        <Icon
                          size={28}
                          className={meta?.color || "text-white"}
                        />
                        <span className="font-bold text-[10px]">
                          {meta?.name || themeId}
                        </span>
                        <button
                          onClick={() => handleEquip(themeId, "THEME")}
                          disabled={isEquipped}
                          className={`px-3 py-1 rounded text-[10px] font-bold uppercase ${
                            isEquipped
                              ? "bg-green-600 text-white cursor-default"
                              : "bg-gray-600 hover:bg-blue-600 text-white"
                          }`}
                        >
                          {isEquipped ? "ÉQUIPÉ" : "CHOISIR"}
                        </button>
                      </div>
                    );
                  })}
              </div>
            </div>

            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
              <h2 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
                👑 Mes Titres
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div
                  className={`p-3 rounded-lg border-2 flex flex-col items-center gap-2 transition-all ${
                    !user?.equippedTitle || user?.equippedTitle === "default"
                      ? "border-green-500 bg-gray-700 scale-105"
                      : "border-gray-600 bg-gray-900 opacity-70 hover:opacity-100"
                  }`}
                >
                  <Star size={28} className="text-gray-400" />
                  <span className="font-bold text-[10px]">Par Niveau</span>
                  <button
                    onClick={() => handleEquip("default", "TITLE")}
                    disabled={
                      !user?.equippedTitle || user?.equippedTitle === "default"
                    }
                    className={`px-3 py-1 rounded text-[10px] font-bold uppercase ${
                      !user?.equippedTitle || user?.equippedTitle === "default"
                        ? "bg-green-600 text-white cursor-default"
                        : "bg-gray-600 hover:bg-blue-600 text-white"
                    }`}
                  >
                    {!user?.equippedTitle || user?.equippedTitle === "default"
                      ? "ÉQUIPÉ"
                      : "CHOISIR"}
                  </button>
                </div>

                {user?.inventory
                  ?.filter((id: string) => id.startsWith("title_"))
                  .map((titleId: string) => {
                    const meta =
                      TITLES_METADATA[titleId as keyof typeof TITLES_METADATA];
                    const isEquipped = user?.equippedTitle === titleId;
                    const Icon = meta?.icon || Crown;

                    return (
                      <div
                        key={titleId}
                        className={`p-3 rounded-lg border-2 flex flex-col items-center gap-2 transition-all ${
                          isEquipped
                            ? "border-green-500 bg-gray-700 scale-105"
                            : "border-gray-600 bg-gray-900 opacity-70 hover:opacity-100"
                        }`}
                      >
                        <Icon
                          size={28}
                          className={meta?.color || "text-white"}
                        />
                        <span className="font-bold text-[10px]">
                          {meta?.name || titleId}
                        </span>
                        <button
                          onClick={() => handleEquip(titleId, "TITLE")}
                          disabled={isEquipped}
                          className={`px-3 py-1 rounded text-[10px] font-bold uppercase ${
                            isEquipped
                              ? "bg-green-600 text-white cursor-default"
                              : "bg-gray-600 hover:bg-blue-600 text-white"
                          }`}
                        >
                          {isEquipped ? "ÉQUIPÉ" : "CHOISIR"}
                        </button>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
