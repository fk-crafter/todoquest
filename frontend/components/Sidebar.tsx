"use client";

import { useRouter } from "next/navigation";
import { Menu, X, Sword, ScrollText, Settings2, ArrowLeft } from "lucide-react";
import { useState } from "react";

export default function Sidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  return (
    <>
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
                <h1 className="text-2xl font-bold mb-8 pt-5">TodoQuest</h1>
                <nav className="flex flex-col gap-4 text-sm">
                  <button
                    onClick={() => {
                      router.push("/tasks");
                      setSidebarOpen(false);
                    }}
                    className="hover:text-green-400 text-left flex items-center gap-2 cursor-pointer"
                  >
                    <Sword size={18} /> Quêtes perso
                  </button>

                  <button
                    onClick={() => {
                      router.push("/profile");
                      setSidebarOpen(false);
                    }}
                    className="hover:text-green-400 text-left flex items-center gap-2 cursor-pointer"
                  >
                    <ScrollText size={18} /> Fiche de Héros
                  </button>

                  <button
                    onClick={() => {
                      router.push("/success");
                      setSidebarOpen(false);
                    }}
                    className="hover:text-green-400 text-left flex items-center gap-2 cursor-pointer"
                  >
                    🏆 Succès
                  </button>

                  <button
                    onClick={() => {
                      router.push("/settings");
                      setSidebarOpen(false);
                    }}
                    className="hover:text-green-400 text-left flex items-center gap-2 cursor-pointer"
                  >
                    <Settings2 size={18} /> Sanctuaire des réglages
                  </button>
                </nav>
              </div>

              <button
                onClick={() => {
                  router.push("/progress");
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
    </>
  );
}
