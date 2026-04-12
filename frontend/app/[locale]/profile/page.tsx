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
  Snowflake,
  FlaskConical,
  Clock,
} from "lucide-react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

const THEMES_METADATA: Record<string, any> = {
  default: { icon: Moon, color: "text-gray-400" },
  theme_magma: { icon: Mountain, color: "text-red-500" },
  theme_forest: { icon: Trees, color: "text-green-500" },
  theme_cyber: { icon: Cpu, color: "text-purple-500" },
};

const TITLES_METADATA: Record<string, any> = {
  default: { icon: Star, color: "text-gray-400" },
  title_rich: { icon: Crown, color: "text-yellow-400" },
  title_slayer: { icon: Sword, color: "text-red-500" },
  title_paladin: { icon: Shield, color: "text-blue-300" },
  title_ninja: { icon: Ghost, color: "text-gray-400" },
  title_legend: { icon: Sparkles, color: "text-purple-400" },
};

const FRAMES_METADATA: Record<string, any> = {
  default: {
    icon: Frame,
    style: "border-gray-500 shadow-none",
    color: "text-gray-400",
  },
  frame_gold: {
    icon: Frame,
    style: "border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.6)]",
    color: "text-yellow-400",
  },
  frame_fire: {
    icon: Flame,
    style:
      "border-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.8)] animate-pulse",
    color: "text-orange-500",
  },
  frame_neon: {
    icon: Zap,
    style: "border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.8)]",
    color: "text-cyan-400",
  },
  frame_emerald: {
    icon: Hexagon,
    style: "border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.6)]",
    color: "text-green-400",
  },
};

export default function ProfilePage() {
  const t = useTranslations("Profile");

  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState("");
  const [dxpTimeLeft, setDxpTimeLeft] = useState<string | null>(null);

  const { data: user, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/me`,
        {
          headers: { Authorization: `Bearer ${session?.accessToken}` },
        },
      );
      if (!res.ok) throw new Error(t("errors.loadProfile"));
      return res.json();
    },
    enabled: !!session?.accessToken,
  });

  useEffect(() => {
    if (user?.name) setNewName(user.name);
  }, [user]);

  useEffect(() => {
    if (!user?.doubleXpUntil) return;

    const until = new Date(user.doubleXpUntil);

    const updateTimer = () => {
      const now = new Date();
      const diff = until.getTime() - now.getTime();

      if (diff <= 0) {
        setDxpTimeLeft(null);
        return;
      }

      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setDxpTimeLeft(`${h}h ${m}m`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000);

    return () => clearInterval(interval);
  }, [user?.doubleXpUntil]);

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
        },
      );
      if (!res.ok) throw new Error("Erreur équipement");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: () => alert(t("errors.equipItem")),
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
        },
      );
      if (!res.ok) throw new Error("Erreur update");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      setIsEditing(false);
    },
    onError: () => alert(t("errors.updateName")),
  });

  const usePotionMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/use-dxp`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${session?.accessToken}` },
        },
      );
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      alert(t("inventory.alerts.dxpActivated"));
    },
    onError: (err: any) => alert(err.message),
  });

  if (!session)
    return (
      <div className="text-center mt-20 text-white">
        {t("loading.authRequired")}
      </div>
    );
  if (isLoading)
    return (
      <div className="text-center mt-20 text-white">{t("loading.loading")}</div>
    );

  const level = user?.level || 1;
  const xp = user?.xp || 0;
  const tasksCreated = user?.stats?.totalTasks || 0;
  const tasksCompleted = user?.stats?.completedTasks || 0;
  const xpToNextLevel = level * 25;
  const xpProgressPercent = Math.min((xp / xpToNextLevel) * 100, 100);
  const successRate =
    tasksCreated > 0 ? Math.round((tasksCompleted / tasksCreated) * 100) : 0;
  const currentName = user?.name || session?.user?.name || t("defaultName");

  let avatarFileName =
    user?.avatar || user?.image || session?.user?.image || "char-male.png";
  avatarFileName = avatarFileName.replace("/avatars/", "").replace("/", "");
  const avatarUrl = `/${avatarFileName}`;

  const equippedFrameId = user?.equippedFrame || "default";
  const currentFrameData =
    FRAMES_METADATA[equippedFrameId] || FRAMES_METADATA["default"];

  const getLevelTitle = (lvl: number) => {
    if (lvl < 5) return t("levelTitles.novice");
    if (lvl < 10) return t("levelTitles.adventurer");
    if (lvl < 20) return t("levelTitles.master");
    if (lvl < 40) return t("levelTitles.hero");
    return t("levelTitles.legend");
  };

  const equippedTitleId = user?.equippedTitle || "default";

  const displayTitle =
    equippedTitleId !== "default" && TITLES_METADATA[equippedTitleId]
      ? t(`metadata.titles.${equippedTitleId}` as any)
      : getLevelTitle(level);

  const userClass = user?.class || "ADVENTURER";
  const userGender = user?.gender || "male";
  const displayClassName = (() => {
    switch (userClass) {
      case "ARCHER":
        return userGender === "female"
          ? t("classes.archerFemale")
          : t("classes.archerMale");
      case "MAGE":
        return t("classes.mage");
      case "SWORDSMAN":
        return t("classes.swordsman");
      default:
        return t("classes.unknown");
    }
  })();

  const streakFreezes = user?.streakFreezes || 0;
  const dxpPotions = user?.doubleXpPotions || 0;

  const now = new Date();
  const dxpUntil = user?.doubleXpUntil ? new Date(user?.doubleXpUntil) : null;
  const isDxpActive = dxpUntil && dxpUntil > now;

  return (
    <div className="min-h-screen flex bg-gray-900 text-white font-press">
      <Sidebar />

      <main className="flex-1 p-4 md:p-8 flex flex-col items-center">
        <h1 className="text-xl md:text-4xl font-bold mb-8 mt-15 text-yellow-400 drop-shadow-md">
          {t("ui.title")}
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
                      {t("ui.level", { level })}
                    </span>
                    <span className="text-gray-400 text-xs">
                      {t("ui.xp", { xp, xpToNextLevel })}
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
                    label={t("ui.stats.quests")}
                    value={tasksCreated}
                    color="text-blue-400"
                  />
                  <StatCard
                    icon={Sword}
                    label={t("ui.stats.completed")}
                    value={tasksCompleted}
                    color="text-green-400"
                  />
                  <StatCard
                    icon={Trophy}
                    label={t("ui.stats.efficiency")}
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
                        {t("ui.stats.class")}
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

          {(streakFreezes > 0 || dxpPotions > 0 || isDxpActive) && (
            <div className="bg-gray-800 p-6 rounded-xl border border-yellow-900/50 shadow-lg">
              <h2 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
                {t("inventory.title")}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {streakFreezes > 0 && (
                  <div className="bg-gray-900 border border-blue-900 p-4 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-900/50 rounded-lg border border-blue-700">
                        <Snowflake className="text-blue-400" size={24} />
                      </div>
                      <div>
                        <p className="font-bold text-blue-300 text-sm">
                          {t("inventory.freeze.name")}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          {t("inventory.freeze.desc")}
                        </p>
                      </div>
                    </div>
                    <span className="bg-blue-800 text-blue-100 font-bold px-3 py-1 rounded-full text-sm">
                      x{streakFreezes}
                    </span>
                  </div>
                )}

                {(dxpPotions > 0 || isDxpActive) && (
                  <div
                    className={`bg-gray-900 border p-4 rounded-lg flex items-center justify-between ${isDxpActive ? "border-purple-500 animate-pulse" : "border-purple-900"}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-900/50 rounded-lg border border-purple-700 relative">
                        <FlaskConical className="text-purple-400" size={24} />
                        {!isDxpActive && (
                          <span className="absolute -top-2 -right-2 bg-purple-600 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold">
                            {dxpPotions}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-purple-300 text-sm">
                          {t("inventory.dxp.name")}
                        </p>
                        {isDxpActive ? (
                          <p className="text-[10px] text-purple-400 flex items-center gap-1">
                            <Clock size={10} /> {t("inventory.dxp.active")}
                          </p>
                        ) : (
                          <p className="text-[10px] text-gray-400">
                            {t("inventory.dxp.desc")}
                          </p>
                        )}
                      </div>
                    </div>

                    {!isDxpActive ? (
                      <button
                        onClick={() => usePotionMutation.mutate()}
                        disabled={usePotionMutation.isPending}
                        className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-4 py-2 rounded-lg text-xs transition-colors"
                      >
                        {usePotionMutation.isPending ? (
                          <Loader2 className="animate-spin" size={16} />
                        ) : (
                          t("inventory.dxp.drink")
                        )}
                      </button>
                    ) : (
                      <span className="text-purple-400 font-bold text-xs uppercase bg-purple-900/50 px-3 py-1 rounded text-center min-w-[90px]">
                        {dxpTimeLeft
                          ? t("inventory.dxp.remaining", { time: dxpTimeLeft })
                          : "..."}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-10">
            <div className="md:col-span-2">
              <CustomizationSection
                title={t("ui.sections.frames")}
                category="FRAME"
                equippedId={user?.equippedFrame || "default"}
                inventory={user?.inventory || []}
                metadata={FRAMES_METADATA}
                metadataKey="frames"
                onEquip={(id) =>
                  equipMutation.mutate({ itemId: id, category: "FRAME" })
                }
                isLoading={equipMutation.isPending}
              />
            </div>

            <CustomizationSection
              title={t("ui.sections.themes")}
              category="THEME"
              equippedId={user?.equippedTheme || "default"}
              inventory={user?.inventory || []}
              metadata={THEMES_METADATA}
              metadataKey="themes"
              onEquip={(id) =>
                equipMutation.mutate({ itemId: id, category: "THEME" })
              }
              isLoading={equipMutation.isPending}
            />

            <CustomizationSection
              title={t("ui.sections.titles")}
              category="TITLE"
              equippedId={user?.equippedTitle || "default"}
              inventory={user?.inventory || []}
              metadata={TITLES_METADATA}
              metadataKey="titles"
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
  metadataKey,
  onEquip,
  isLoading,
}: {
  title: string;
  category: string;
  equippedId: string;
  inventory: string[];
  metadata: Record<string, any>;
  metadataKey: string;
  onEquip: (id: string) => void;
  isLoading: boolean;
}) {
  const t = useTranslations("Profile");

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
                {t(`metadata.${metadataKey}.${itemId}` as any)}
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
                {isEquipped ? t("ui.actions.equipped") : t("ui.actions.choose")}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
