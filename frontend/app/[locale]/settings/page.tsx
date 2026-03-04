"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Volume2, VolumeX, Trash2, LogOut, AlertTriangle } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { useAudio } from "@/context/AudioContext";
import RetroModal from "@/components/ui/RetroModal"; // 👈 Import

export default function SettingsPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const { isPlaying, toggleMusic, volume, setVolume } = useAudio();

  const [notifications, setNotifications] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false); // État pour la modale
  const [isDeleting, setIsDeleting] = useState(false);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/");
  };

  const confirmDeleteAccount = async () => {
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
      setShowDeleteModal(false);
    }
  };

  if (!session) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white font-press">
        <h1 className="text-xl">Connexion requise...</h1>
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
          {/* ... AUDIO ... */}
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

          {/* ... PREFERENCES ... */}
          <div className="bg-gray-800 p-4 md:p-6 rounded-xl shadow-lg border border-gray-700">
            <h2 className="text-lg md:text-xl font-semibold mb-4 text-purple-400">
              Préférences
            </h2>
            <div className="flex items-center justify-between text-sm md:text-base opacity-50 cursor-not-allowed">
              <div className="flex items-center gap-2">
                <span>Notifications de quête</span>
                <span className="text-[10px] bg-yellow-500/20 text-yellow-400 border border-yellow-500/50 px-2 py-0.5 rounded-full uppercase font-bold">
                  Bientôt
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

          {/* ... DANGER ZONE ... */}
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
              onClick={() => setShowDeleteModal(true)} // On ouvre la modale
              className="w-full flex items-center justify-center gap-2 p-3 bg-red-600 hover:bg-red-700 rounded text-white font-bold transition-colors text-sm md:text-base"
            >
              <Trash2 size={20} /> Supprimer mon compte
            </button>
            <p className="text-xs text-red-400 mt-2 text-center">
              Attention : Cette action effacera toute votre progression.
            </p>
          </div>
        </div>
      </main>

      {/* MODALE DE SUPPRESSION */}
      <RetroModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Zone de Danger"
        type="danger"
        footer={
          <>
            <button
              onClick={() => setShowDeleteModal(false)}
              className="px-4 py-2 text-gray-400 hover:text-white font-bold"
            >
              Annuler
            </button>
            <button
              onClick={confirmDeleteAccount}
              disabled={isDeleting}
              className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded shadow-[0_4px_0_rgb(153,27,27)] active:translate-y-1 active:shadow-none transition-all"
            >
              {isDeleting ? "Suppression..." : "Confirmer"}
            </button>
          </>
        }
      >
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertTriangle size={48} className="text-red-500 animate-pulse" />
          <p className="font-bold text-lg">Êtes-vous absolument sûr ?</p>
          <p className="text-sm text-gray-400">
            Cette action est{" "}
            <span className="text-red-400 underline">irréversible</span>. Votre
            niveau, votre or, vos objets et toutes vos quêtes seront supprimés
            définitivement.
          </p>
        </div>
      </RetroModal>
    </div>
  );
}
