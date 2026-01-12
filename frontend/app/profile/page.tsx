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
  Frame,
  Flame,
  Zap,
  Hexagon,
  Ghost,
  Sparkles,
  Loader2,
} from "lucide-react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";

const THEMES_METADATA: Record<string, any> = {
  default: { name: "Classique", icon: Moon, color: "text-gray-400" },
  theme_magma: { name: "Magma", icon: Mountain, color: "text-red-500" },
  theme_forest: { name: "Forêt", icon: Trees, color: "text-green-500" },
  theme_cyber: { name: "Cyberpunk", icon: Cpu, color: "text-purple-500" },
};

const TITLES_METADATA: Record<string, any> = {
  default: { name: "Rang de Niveau", icon: Star, color: "text-gray-400" },
  title_rich: { name: "Le Bourgeois", icon: Crown, color: "text-yellow-400" },
  title_slayer: { name: "Tueur", icon: Sword, color: "text-red-500" },
  title_paladin: { name: "Paladin", icon: Shield, color: "text-blue-300" },
  title_ninja: { name: "Ombre", icon: Ghost, color: "text-gray-400" },
  title_legend: { name: "Légende", icon: Sparkles, color: "text-purple-400" },
};

const FRAMES_METADATA: Record<string, any> = {
  default: {
    name: "Standard",
    icon: Frame,
    style: "border-gray-500 shadow-none",
    color: "text-gray-400",
  },
  frame_gold: {
    name: "Cadre Doré",
    icon: Frame,
    style: "border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.6)]",
    color: "text-yellow-400",
  },
  frame_fire: {
    name: "Enflammé",
    icon: Flame,
    style:
      "border-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.8)] animate-pulse",
    color: "text-orange-500",
  },
  frame_neon: {
    name: "Néon Bleu",
    icon: Zap,
    style: "border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.8)]",
    color: "text-cyan-400",
  },
  frame_emerald: {
    name: "Émeraude",
    icon: Hexagon,
    style: "border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.6)]",
    color: "text-green-400",
  },
};

export default function ProfilePage() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState("");

  const { data: user, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/me`,
        {
          headers: { Authorization: `Bearer ${session?.accessToken}` },
        }
      );
      if (!res.ok) throw new Error("Erreur chargement profil");
      return res.json();
    },
    enabled: !!session?.accessToken,
  });

  useEffect(() => {
    if (user?.name) setNewName(user.name);
  }, [user]);

  const equipMutation = useMutation({
    mutationFn: async ({
      itemId,
      category,
    }: {
      itemId: string;
      category: string;
    }) => {
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
      if (!res.ok) throw new Error("Erreur équipement");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: () => alert("Impossible d'équiper cet objet."),
  });

  const updateNameMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/me`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.accessToken}`,
          },
          body: JSON.stringify({ name }),
        }
      );
      if (!res.ok) throw new Error("Erreur update");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      setIsEditing(false);
    },
    onError: () => alert("Erreur modification pseudo"),
  });

  if (!session)
    return (
      <div className="text-center mt-20 text-white">Connexion requise...</div>
    );
  if (isLoading)
    return <div className="text-center mt-20 text-white">Chargement...</div>;

  const level = user?.level || 1;
  const xp = user?.xp || 0;
  const tasksCreated = user?.stats?.totalTasks || 0;
  const tasksCompleted = user?.stats?.completedTasks || 0;
  const xpToNextLevel = level * 25;
  const xpProgressPercent = Math.min((xp / xpToNextLevel) * 100, 100);
  const successRate =
    tasksCreated > 0 ? Math.round((tasksCompleted / tasksCreated) * 100) : 0;
  const currentName = user?.name || session?.user?.name || "Héros";

  let avatarFileName =
    user?.avatar || user?.image || session?.user?.image || "char-male.png";
  avatarFileName = avatarFileName.replace("/avatars/", "").replace("/", "");
  const avatarUrl = `/${avatarFileName}`;

  const equippedFrameId = user?.equippedFrame || "default";
  const currentFrameData =
    FRAMES_METADATA[equippedFrameId] || FRAMES_METADATA["default"];

  const getLevelTitle = (lvl: number) => {
    if (lvl < 5) return "Novice du To-Do";
    if (lvl < 10) return "Aventurier Organisé";
    if (lvl < 20) return "Maître des Quêtes";
    if (lvl < 40) return "Héros de la Productivité";
    return "Légende Vivante";
  };

  const equippedTitleId = user?.equippedTitle || "default";
  const displayTitle =
    equippedTitleId !== "default" && TITLES_METADATA[equippedTitleId]
      ? TITLES_METADATA[equippedTitleId].name
      : getLevelTitle(level);

  const userClass = user?.class || "ADVENTURER";
  const userGender = user?.gender || "male";
  const displayClassName = (() => {
    switch (userClass) {
      case "ARCHER":
        return userGender === "female" ? "Archère" : "Archer";
      case "MAGE":
        return "Mage";
      case "SWORDSMAN":
        return "Escrim";
      default:
        return "???";
    }
  })();

  return (
    <div className="min-h-screen flex bg-gray-900 text-white font-press">
      <Sidebar />

      <main className="flex-1 p-4 md:p-8 flex flex-col items-center">
        <h1 className="text-xl md:text-4xl font-bold mb-8 mt-15 text-yellow-400 drop-shadow-md">
          Fiche de Héros
        </h1>

        <div className="w-full max-w-2xl flex flex-col gap-6">
          <div className="bg-gray-800 border-4 border-gray-600 rounded-xl p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full mix-blend-overlay filter blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2" />

            <div className="flex flex-col md:flex-row gap-8 items-center md:items-start z-10 relative">
              <div className="flex flex-col items-center gap-4">
                <div
                  className={`w-32 h-32 md:w-40 md:h-40 bg-gray-700 rounded-full border-4 overflow-hidden flex items-center justify-center relative transition-all duration-300 ${currentFrameData.style}`}
                >
                  <img
                    src={avatarUrl}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                    style={{ imageRendering: "pixelated" }}
                    onError={(e) => {
                      e.currentTarget.src = "/char-male.png";
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
                        onClick={() => updateNameMutation.mutate(newName)}
                        disabled={updateNameMutation.isPending}
                        className="p-1 bg-green-600 rounded text-white"
                      >
                        {updateNameMutation.isPending ? (
                          <Loader2 className="animate-spin" size={16} />
                        ) : (
                          <Check size={16} />
                        )}
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
                        className="text-gray-400 hover:text-yellow-400 opacity-0 group-hover:opacity-100 md:opacity-100 transition-opacity"
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
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <StatCard
                    icon={Scroll}
                    label="Quêtes"
                    value={tasksCreated}
                    color="text-blue-400"
                  />
                  <StatCard
                    icon={Sword}
                    label="Finies"
                    value={tasksCompleted}
                    color="text-green-400"
                  />
                  <StatCard
                    icon={Trophy}
                    label="Efficacité"
                    value={`${successRate}%`}
                    color="text-purple-400"
                  />

                  <div
                    className={`bg-gray-700 p-3 rounded-lg flex items-center gap-3 border border-gray-600 ${
                      userClass === "ADVENTURER"
                        ? "opacity-70"
                        : "border-yellow-500 bg-gray-800"
                    }`}
                  >
                    <div className="p-2 bg-gray-800 rounded text-red-400">
                      <Shield size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase">
                        Classe
                      </p>
                      <p className="font-bold text-sm text-yellow-400 capitalize">
                        {displayClassName}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-10">
            <div className="md:col-span-2">
              <CustomizationSection
                title="🖼️ Mes Cadres d'Avatar"
                category="FRAME"
                equippedId={user?.equippedFrame || "default"}
                inventory={user?.inventory || []}
                metadata={FRAMES_METADATA}
                onEquip={(id) =>
                  equipMutation.mutate({ itemId: id, category: "FRAME" })
                }
                isLoading={equipMutation.isPending}
              />
            </div>

            <CustomizationSection
              title="🎨 Mes Thèmes"
              category="THEME"
              equippedId={user?.equippedTheme || "default"}
              inventory={user?.inventory || []}
              metadata={THEMES_METADATA}
              onEquip={(id) =>
                equipMutation.mutate({ itemId: id, category: "THEME" })
              }
              isLoading={equipMutation.isPending}
            />

            <CustomizationSection
              title="👑 Mes Titres"
              category="TITLE"
              equippedId={user?.equippedTitle || "default"}
              inventory={user?.inventory || []}
              metadata={TITLES_METADATA}
              onEquip={(id) =>
                equipMutation.mutate({ itemId: id, category: "TITLE" })
              }
              isLoading={equipMutation.isPending}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: any;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="bg-gray-700 p-3 rounded-lg flex items-center gap-3 border border-gray-600">
      <div className={`p-2 bg-gray-800 rounded ${color}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-[10px] text-gray-400 uppercase">{label}</p>
        <p className="font-bold text-lg">{value}</p>
      </div>
    </div>
  );
}

function CustomizationSection({
  title,
  category,
  equippedId,
  inventory,
  metadata,
  onEquip,
  isLoading,
}: {
  title: string;
  category: string;
  equippedId: string;
  inventory: string[];
  metadata: Record<string, any>;
  onEquip: (id: string) => void;
  isLoading: boolean;
}) {
  const prefix = category.toLowerCase() + "_";
  const ownedItems = inventory.filter((id: string) => id.startsWith(prefix));
  const allItems = ["default", ...ownedItems];

  return (
    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg h-full">
      <h2 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
        {title}
      </h2>

      <div
        className={`grid grid-cols-2 ${
          category === "FRAME" ? "md:grid-cols-4" : ""
        } gap-4`}
      >
        {allItems.map((itemId) => {
          const meta = metadata[itemId] || {
            name: itemId,
            icon: Star,
            color: "text-white",
          };
          const isEquipped = equippedId === itemId;
          const Icon = meta.icon;

          return (
            <div
              key={itemId}
              className={`p-3 rounded-lg border-2 flex flex-col items-center gap-2 transition-all ${
                isEquipped
                  ? "border-green-500 bg-gray-700 scale-105"
                  : "border-gray-600 bg-gray-900 opacity-70 hover:opacity-100"
              }`}
            >
              <Icon size={28} className={meta.color} />
              <span className="font-bold text-[10px] text-center truncate w-full">
                {meta.name}
              </span>
              <button
                onClick={() => onEquip(itemId)}
                disabled={isEquipped || isLoading}
                className={`px-3 py-1 rounded text-[10px] font-bold uppercase w-full ${
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
  );
}
