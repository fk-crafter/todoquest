"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Volume2, VolumeX, Trash2, LogOut } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { useAudio } from "@/context/AudioContext";

export default function SettingsPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const { isPlaying, toggleMusic, volume, setVolume } = useAudio();

  const [notifications, setNotifications] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/");
  };

  const handleDeleteAccount = async () => {
    const confirmed = confirm(
      "Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible et toutes vos quêtes seront perdues à jamais."
    );

    if (confirmed) {
      setIsDeleting(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/me`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${session?.accessToken}` },
          }
        );

        if (res.ok) {
          await signOut({ redirect: false });
          router.push("/");
        } else {
          alert("Erreur lors de la suppression du compte.");
        }
      } catch (error) {
        console.error("Erreur delete account", error);
      } finally {
        setIsDeleting(false);
      }
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
    <div className="min-h-screen bg-gray-900 text-white font-press flex flex-col md:flex-row">
      <Sidebar />

      <main className="flex-1 p-4 md:p-8 flex flex-col items-center mt-12 md:mt-0">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 flex items-center gap-3 text-center">
          ⚙️ Sanctuaire des Réglages
        </h1>

        <div className="w-full max-w-md space-y-4 md:space-y-6">
          <div className="bg-gray-800 p-4 md:p-6 rounded-xl shadow-lg border border-gray-700">
            <h2 className="text-lg md:text-xl font-semibold mb-4 text-blue-400">
              Ambiance Sonore
            </h2>

            <div className="flex items-center justify-between mb-4 text-sm md:text-base">
              <span>Musique de fond</span>
              <button
                onClick={toggleMusic}
                className={`px-3 py-1.5 md:px-4 md:py-2 rounded font-bold transition-colors text-sm md:text-base ${
                  isPlaying
                    ? "bg-green-600 hover:bg-green-500"
                    : "bg-red-600 hover:bg-red-500"
                }`}
              >
                {isPlaying ? "Activée" : "Désactivée"}
              </button>
            </div>

            <div className="flex items-center gap-4">
              {volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}

              <input
                type="range"
                min="0"
                max="100"
                value={volume * 100}
                onChange={(e) => setVolume(parseInt(e.target.value) / 100)}
                className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />

              <span className="w-8 text-right text-sm md:text-base">
                {Math.round(volume * 100)}%
              </span>
            </div>
          </div>

          <div className="bg-gray-800 p-4 md:p-6 rounded-xl shadow-lg border border-gray-700">
            <h2 className="text-lg md:text-xl font-semibold mb-4 text-purple-400">
              Préférences
            </h2>

            <div className="flex items-center justify-between text-sm md:text-base opacity-50 cursor-not-allowed">
              <div className="flex items-center gap-2">
                <span>Notifications de quête</span>
                <span className="text-[10px] bg-yellow-500/20 text-yellow-400 border border-yellow-500/50 px-2 py-0.5 rounded-full uppercase font-bold">
                  Bientôt disponible
                </span>
              </div>

              <label className="relative inline-flex items-center cursor-not-allowed">
                <input
                  type="checkbox"
                  checked={notifications}
                  disabled
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus:outline-none peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-400 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
            </div>
          </div>

          <div className="bg-gray-800 p-4 md:p-6 rounded-xl shadow-lg border border-red-900">
            <h2 className="text-lg md:text-xl font-semibold mb-4 text-red-500">
              Zone de Danger
            </h2>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 p-3 bg-gray-700 hover:bg-gray-600 rounded text-white mb-3 transition-colors text-sm md:text-base"
            >
              <LogOut size={20} /> Se déconnecter
            </button>

            <button
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              className="w-full flex items-center justify-center gap-2 p-3 bg-red-600 hover:bg-red-700 rounded text-white font-bold transition-colors text-sm md:text-base"
            >
              {isDeleting ? (
                "Suppression..."
              ) : (
                <>
                  <Trash2 size={20} /> Supprimer mon compte
                </>
              )}
            </button>
            <p className="text-xs text-red-400 mt-2 text-center">
              Attention : Cette action effacera toute votre progression (XP,
              tâches, succès).
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
