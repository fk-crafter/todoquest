"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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

export default function Sidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { name: "Quêtes perso", href: "/tasks", icon: Sword },
    { name: "Fiche de Héros", href: "/profile", icon: ScrollText },
    { name: "Boutique", href: "/shop", icon: ShoppingBag },
    { name: "Succès", href: "/success", icon: Trophy },
    { name: "Sanctuaire des réglages", href: "/settings", icon: Settings2 },
  ];

  return (
    <>
      <button
        onClick={() => setSidebarOpen(true)}
        className="fixed top-4 left-4 z-50 p-2 bg-gray-800 text-white rounded cursor-pointer hover:bg-gray-700 transition-colors"
      >
        <Menu size={24} />
      </button>

      {sidebarOpen && (
        <>
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
          />

          <div className="fixed top-0 left-0 h-full w-64 bg-gray-900 text-white p-6 z-50 shadow-lg animate-in slide-in-from-left duration-200">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 text-white hover:text-red-400 cursor-pointer transition-colors"
            >
              <X size={24} />
            </button>

            <div className="flex flex-col justify-between h-full">
              <div>
                <h1 className="text-2xl font-bold mb-8 pt-5 font-press">
                  TodoQuest
                </h1>

                <nav className="flex flex-col gap-4 text-sm">
                  {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`
                          flex items-center gap-2 cursor-pointer transition-colors p-2 rounded
                          ${
                            isActive
                              ? "text-yellow-400 bg-gray-800"
                              : "hover:text-green-400 text-gray-300"
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
                className="text-sm text-gray-400 hover:text-white flex items-center gap-2 cursor-pointer transition-colors"
              >
                <ArrowLeft size={16} /> Retour
              </Link>
            </div>
          </div>
        </>
      )}
    </>
  );
}
