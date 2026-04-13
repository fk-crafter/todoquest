"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import {
  Menu,
  X,
  Sword,
  ScrollText,
  Settings2,
  ArrowLeft,
  Trophy,
  ShoppingBag,
  ShieldAlert,
} from "lucide-react";
import ClassSelectionModal from "./ClassSelectionModal";
import DailyRewardModal from "./DailyRewardModal";
import { motion, AnimatePresence } from "motion/react";
import { useTutorial } from "@/context/TutorialContext";
import { useQueryClient } from "@tanstack/react-query";

export default function Sidebar() {
  const t = useTranslations("Sidebar");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showClassModal, setShowClassModal] = useState(false);
  const queryClient = useQueryClient();

  const pathname = usePathname();
  const { data: session } = useSession();
  const { isTutorialActive, tutorialStep } = useTutorial();

  const fetchUserData = async () => {
    if (!session?.accessToken) return null;
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/me`,
      {
        headers: { Authorization: `Bearer ${session.accessToken}` },
      },
    );
    if (!res.ok) return null;
    return res.json();
  };

  const { data: user } = useQuery({
    queryKey: ["userProfile"],
    queryFn: fetchUserData,
    enabled: !!session?.accessToken,
    refetchInterval: 10000,
  });

  useEffect(() => {
    if (user) {
      const level = user.level || 1;
      const currentClass = user.class || "ADVENTURER";

      if (level >= 20 && currentClass === "ADVENTURER") {
        setShowClassModal(true);
      }
    }
  }, [user]);

  let showDailyReward = false;
  let hasMissedDay = false;

  if (user) {
    const now = new Date();
    if (user.lastRewardClaimedAt) {
      const lastClaim = new Date(user.lastRewardClaimedAt);
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const lastClaimDay = new Date(
        lastClaim.getFullYear(),
        lastClaim.getMonth(),
        lastClaim.getDate(),
      );

      const diffTime = today.getTime() - lastClaimDay.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays > 0) {
        showDailyReward = true;
        hasMissedDay = diffDays > 1;
      }
    } else {
      const createdAt = new Date(user.createdAt);
      const isRegistrationDay =
        createdAt.getFullYear() === now.getFullYear() &&
        createdAt.getMonth() === now.getMonth() &&
        createdAt.getDate() === now.getDate();

      if (!isRegistrationDay) {
        showDailyReward = true;
        hasMissedDay = false;
      }
    }
  }

  const handleClaimReward = async (useFreeze: boolean = false) => {
    if (!session?.accessToken) throw new Error("Non autorisé");

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/daily-reward`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ useFreeze }),
      },
    );

    if (!res.ok) {
      let errorData;
      try {
        errorData = await res.json();
      } catch (e) {
        throw new Error("Erreur inattendue du serveur.");
      }
      throw new Error(errorData.message || "Erreur lors de la récupération");
    }

    await queryClient.invalidateQueries({ queryKey: ["userProfile"] });
  };

  const navItems = [
    { name: t("nav.tasks"), href: "/tasks", icon: Sword },
    { name: t("nav.profile"), href: "/profile", icon: ScrollText },
    { name: t("nav.shop"), href: "/shop", icon: ShoppingBag },
    { name: t("nav.success"), href: "/success", icon: Trophy },
    { name: t("nav.settings"), href: "/settings", icon: Settings2 },
  ];

  if (session?.user?.role === "ADMIN") {
    navItems.push({
      name: "Admin",
      href: "/admin",
      icon: ShieldAlert,
    });
  }

  return (
    <>
      {showClassModal && user && (
        <ClassSelectionModal
          userGender={user.gender || "male"}
          userName={user.name || t("fallbackName")}
        />
      )}

      {showDailyReward && user && (
        <DailyRewardModal
          currentStreak={user?.streakCount || 0}
          availableFreezes={user?.streakFreezes || 0}
          hasMissedDay={hasMissedDay}
          onClaim={handleClaimReward}
        />
      )}

      <button
        onClick={() => setSidebarOpen(true)}
        className="fixed top-4 left-4 z-50 p-2 bg-gray-800 text-white rounded cursor-pointer hover:bg-gray-700 transition-colors border-2 border-gray-600 shadow-md"
      >
        <Menu size={24} />
      </button>

      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/70 z-40 backdrop-blur-sm"
            />

            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", ease: "easeInOut", duration: 0.3 }}
              className="fixed top-0 left-0 h-full w-72 bg-gray-900 text-white p-6 z-50 shadow-2xl border-r-4 border-gray-700 flex flex-col justify-between"
            >
              <button
                onClick={() => setSidebarOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-red-400 cursor-pointer transition-colors"
              >
                <X size={24} />
              </button>

              <div>
                <h1 className="text-2xl font-bold mb-6 pt-2 font-press text-yellow-400 text-center">
                  TodoQuest
                </h1>

                {user && (
                  <div className="flex items-center gap-3 mb-8 p-3 bg-gray-800 rounded-lg border border-gray-600">
                    <div className="w-10 h-10 rounded overflow-hidden border border-gray-500">
                      <img
                        src={
                          user.image
                            ? user.image.startsWith("/")
                              ? user.image
                              : `/${user.image}`
                            : "/char-male.png"
                        }
                        alt="Avatar"
                        className="w-full h-full object-cover"
                        style={{ imageRendering: "pixelated" }}
                      />
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-bold truncate text-sm">
                        {user.name || t("fallbackName")}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        {t("level", { level: user.level || 1 })} -{" "}
                        <span className="capitalize">
                          {user.class
                            ? t.has(`classes.${user.class}`)
                              ? t(`classes.${user.class}`)
                              : user.class.toLowerCase()
                            : t("fallbackClass")}
                        </span>
                      </p>
                    </div>
                  </div>
                )}

                <nav className="flex flex-col gap-3 text-sm">
                  {navItems.map((item) => {
                    const isActive =
                      pathname === item.href ||
                      pathname === `/en${item.href}` ||
                      pathname === `/fr${item.href}`;
                    const isShopAndTutorialStep =
                      isTutorialActive &&
                      item.href === "/shop" &&
                      tutorialStep === 6;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`
                          flex items-center gap-3 cursor-pointer transition-all p-3 rounded-lg font-bold
                          ${
                            isActive
                              ? "text-yellow-400 bg-gray-800 border-l-4 border-yellow-400"
                              : item.href === "/admin"
                                ? "hover:text-white hover:bg-gray-800 text-red-400"
                                : "hover:text-white hover:bg-gray-800 text-gray-400"
                          }
                          ${isShopAndTutorialStep ? "animate-pulse bg-yellow-500/20 border-2 border-yellow-400" : ""}
                        `}
                      >
                        <item.icon size={18} />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>

              <Link
                href="/progress"
                onClick={() => setSidebarOpen(false)}
                className="text-sm text-gray-500 hover:text-white flex items-center gap-2 cursor-pointer transition-colors mt-auto p-2"
              >
                <ArrowLeft size={16} /> {t("back")}
              </Link>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
