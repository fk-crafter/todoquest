"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Sidebar from "@/components/Sidebar";
import {
  Shield,
  Sword,
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
} from "lucide-react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

import ProfileCard from "@/components/profile/ProfileCard";
import InventorySection from "@/components/profile/InventorySection";
import CustomizationSection from "@/components/profile/CustomizationSection";

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
  const isDxpActive = dxpUntil !== null && dxpUntil > now;

  return (
    <div className="min-h-screen flex bg-gray-900 text-white font-press">
      <Sidebar />

      <main className="flex-1 p-4 md:p-8 flex flex-col items-center">
        <h1 className="text-xl md:text-4xl font-bold mb-8 mt-15 text-yellow-400 drop-shadow-md">
          {t("ui.title")}
        </h1>

        <div className="w-full max-w-2xl flex flex-col gap-6">
          <ProfileCard
            user={user}
            currentName={currentName}
            avatarUrl={avatarUrl}
            level={level}
            xp={xp}
            xpToNextLevel={xpToNextLevel}
            xpProgressPercent={xpProgressPercent}
            tasksCreated={tasksCreated}
            tasksCompleted={tasksCompleted}
            successRate={successRate}
            displayTitle={displayTitle}
            displayClassName={displayClassName}
            currentFrameData={currentFrameData}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            newName={newName}
            setNewName={setNewName}
            updateNameMutation={updateNameMutation}
          />

          <InventorySection
            streakFreezes={streakFreezes}
            dxpPotions={dxpPotions}
            isDxpActive={isDxpActive}
            dxpTimeLeft={dxpTimeLeft}
            usePotionMutation={usePotionMutation}
          />

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
