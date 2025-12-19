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

  const [notifications, setNotifications] = useState(true);
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
    <div className="min-h-screen bg-gray-900 text-white p-6 flex flex-col items-center">
      <Sidebar />

      <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
        ⚙️ Sanctuaire des Réglages
      </h1>

      <div className="w-full max-w-md space-y-6">
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
          <h2 className="text-xl font-semibold mb-4 text-blue-400">
            Ambiance Sonore
          </h2>

          <div className="flex items-center justify-between mb-4">
            <span>Musique de fond</span>
            <button
              onClick={toggleMusic}
              className={`px-4 py-2 rounded font-bold transition-colors ${
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

            <span className="w-8 text-right">{Math.round(volume * 100)}%</span>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
          <h2 className="text-xl font-semibold mb-4 text-purple-400">
            Préférences
          </h2>

          <div className="flex items-center justify-between">
            <span>Notifications de quête</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications}
                onChange={() => setNotifications(!notifications)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-red-900">
          <h2 className="text-xl font-semibold mb-4 text-red-500">
            Zone de Danger
          </h2>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 p-3 bg-gray-700 hover:bg-gray-600 rounded text-white mb-3 transition-colors"
          >
            <LogOut size={20} /> Se déconnecter
          </button>

          <button
            onClick={handleDeleteAccount}
            disabled={isDeleting}
            className="w-full flex items-center justify-center gap-2 p-3 bg-red-600 hover:bg-red-700 rounded text-white font-bold transition-colors"
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
    </div>
  );
}
