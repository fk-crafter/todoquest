"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import {
  Menu,
  X,
  Sword,
  ScrollText,
  Settings2,
  ArrowLeft,
  Trophy,
  ShoppingBag,
} from "lucide-react";
import ClassSelectionModal from "./ClassSelectionModal";

export default function Sidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showClassModal, setShowClassModal] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  const fetchUserData = async () => {
    if (!session?.accessToken) return null;
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/me`,
      {
        headers: { Authorization: `Bearer ${session.accessToken}` },
      }
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

  const navItems = [
    { name: "Quêtes perso", href: "/tasks", icon: Sword },
    { name: "Fiche de Héros", href: "/profile", icon: ScrollText },
    { name: "Boutique", href: "/shop", icon: ShoppingBag },
    { name: "Succès", href: "/success", icon: Trophy },
    { name: "Sanctuaire des réglages", href: "/settings", icon: Settings2 },
  ];

  return (
    <>
      {showClassModal && user && (
        <ClassSelectionModal
          userGender={user.gender || "male"}
          userName={user.name || "Héros"}
        />
      )}

      <button
        onClick={() => setSidebarOpen(true)}
        className="fixed top-4 left-4 z-50 p-2 bg-gray-800 text-white rounded cursor-pointer hover:bg-gray-700 transition-colors border-2 border-gray-600 shadow-md"
      >
        <Menu size={24} />
      </button>

      {sidebarOpen && (
        <>
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black bg-opacity-70 z-40 backdrop-blur-sm"
          />

          <div className="fixed top-0 left-0 h-full w-72 bg-gray-900 text-white p-6 z-50 shadow-2xl animate-in slide-in-from-left duration-200 border-r-4 border-gray-700 flex flex-col justify-between">
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
                    <p className="font-bold truncate text-sm">{user.name}</p>
                    <p className="text-[10px] text-gray-400">
                      Lvl {user.level} -{" "}
                      <span className="capitalize">
                        {user.class ? user.class.toLowerCase() : "Aventurier"}
                      </span>
                    </p>
                  </div>
                </div>
              )}

              <nav className="flex flex-col gap-3 text-sm">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
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
                            : "hover:text-white hover:bg-gray-800 text-gray-400"
                        }
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
              <ArrowLeft size={16} /> Retour
            </Link>
          </div>
        </>
      )}
    </>
  );
}
