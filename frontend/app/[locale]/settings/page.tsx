"use client";

import { useState, useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Volume2, VolumeX, Trash2, LogOut, AlertTriangle } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { useAudio } from "@/context/AudioContext";
import RetroModal from "@/components/ui/RetroModal";
import { useTranslations } from "next-intl";

export default function SettingsPage() {
  const t = useTranslations("Settings");
  const { data: session, status } = useSession();
  const router = useRouter();

  const { isPlaying, toggleMusic, volume, setVolume } = useAudio();

  const [notifications] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await signOut({ redirect: false });
      if (isMounted.current) {
        router.push("/");
      }
    } catch (error) {
      console.error("Erreur logout", error);
      if (isMounted.current) setIsLoggingOut(false);
    }
  };

  const confirmDeleteAccount = async () => {
    if (isDeleting) return;
    setIsDeleting(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/me`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${session?.accessToken}` },
        },
      );

      if (res.ok) {
        await signOut({ redirect: false });
        if (isMounted.current) {
          router.push("/");
        }
      } else {
        alert(t("deleteModal.error"));
        if (isMounted.current) {
          setIsDeleting(false);
          setShowDeleteModal(false);
        }
      }
    } catch (error) {
      console.error("Erreur delete account", error);
      if (isMounted.current) {
        setIsDeleting(false);
        setShowDeleteModal(false);
      }
    }
  };

  if (status === "loading" || !session) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white font-press">
        <h1 className="text-xl animate-pulse">{t("loading")}</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white font-press flex flex-col md:flex-row">
      <Sidebar />

      <main className="flex-1 p-4 md:p-8 flex flex-col items-center mt-12 md:mt-0 animate-in fade-in duration-300">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 flex items-center gap-3 text-center">
          {t("header")}
        </h1>

        <div className="w-full max-w-md space-y-4 md:space-y-6">
          <div className="bg-gray-800 p-4 md:p-6 rounded-xl shadow-lg border border-gray-700 transition-all hover:border-gray-600">
            <h2 className="text-lg md:text-xl font-semibold mb-4 text-blue-400">
              {t("audio.title")}
            </h2>

            <div className="flex items-center justify-between mb-4 text-sm md:text-base">
              <span>{t("audio.backgroundMusic")}</span>
              <button
                onClick={toggleMusic}
                className={`px-3 py-1.5 md:px-4 md:py-2 rounded font-bold transition-all text-sm md:text-base shadow-[0_4px_0_rgba(0,0,0,0.3)] active:translate-y-1 active:shadow-none ${
                  isPlaying
                    ? "bg-green-600 hover:bg-green-500 text-white"
                    : "bg-red-600 hover:bg-red-500 text-white"
                }`}
              >
                {isPlaying ? t("audio.on") : t("audio.off")}
              </button>
            </div>

            <div className="flex items-center gap-4">
              {volume === 0 ? (
                <VolumeX size={20} className="text-gray-400" />
              ) : (
                <Volume2 size={20} className="text-blue-400" />
              )}
              <input
                type="range"
                min="0"
                max="100"
                value={volume * 100}
                onChange={(e) => setVolume(parseInt(e.target.value) / 100)}
                className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400 transition-all"
              />
              <span className="w-12 text-right text-sm md:text-base text-gray-300">
                {Math.round(volume * 100)}%
              </span>
            </div>
          </div>

          <div className="bg-gray-800 p-4 md:p-6 rounded-xl shadow-lg border border-gray-700">
            <h2 className="text-lg md:text-xl font-semibold mb-4 text-purple-400">
              {t("preferences.title")}
            </h2>
            <div className="flex items-center justify-between text-sm md:text-base opacity-50 cursor-not-allowed">
              <div className="flex items-center gap-2">
                <span>{t("preferences.notifications")}</span>
                <span className="text-[10px] bg-yellow-500/20 text-yellow-400 border border-yellow-500/50 px-2 py-0.5 rounded-full uppercase font-bold whitespace-nowrap">
                  {t("preferences.comingSoon")}
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

          <div className="bg-gray-800 p-4 md:p-6 rounded-xl shadow-lg border border-red-900/50 hover:border-red-900 transition-colors">
            <h2 className="text-lg md:text-xl font-semibold mb-4 text-red-500">
              {t("dangerZone.title")}
            </h2>

            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full flex items-center justify-center gap-2 p-3 bg-gray-700 hover:bg-gray-600 rounded text-white mb-3 transition-all text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <LogOut size={20} />{" "}
              {isLoggingOut ? t("loading") : t("dangerZone.logout")}
            </button>

            <button
              onClick={() => setShowDeleteModal(true)}
              className="w-full flex items-center justify-center gap-2 p-3 bg-red-600/80 hover:bg-red-600 rounded text-white font-bold transition-all text-sm md:text-base shadow-[0_4px_0_rgba(153,27,27,0.5)] active:translate-y-1 active:shadow-none"
            >
              <Trash2 size={20} /> {t("dangerZone.deleteAccount")}
            </button>
            <p className="text-xs text-red-400/70 mt-3 text-center leading-relaxed">
              {t("dangerZone.warning")}
            </p>
          </div>
        </div>
      </main>

      <RetroModal
        isOpen={showDeleteModal}
        onClose={() => !isDeleting && setShowDeleteModal(false)}
        title={t("deleteModal.title")}
        type="danger"
        footer={
          <>
            <button
              onClick={() => setShowDeleteModal(false)}
              disabled={isDeleting}
              className="px-4 py-2 text-gray-400 hover:text-white font-bold disabled:opacity-50"
            >
              {t("deleteModal.cancel")}
            </button>
            <button
              onClick={confirmDeleteAccount}
              disabled={isDeleting}
              className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded shadow-[0_4px_0_rgb(153,27,27)] active:translate-y-1 active:shadow-none transition-all disabled:opacity-50 disabled:translate-y-0 disabled:shadow-[0_4px_0_rgb(153,27,27)]"
            >
              {isDeleting
                ? t("deleteModal.deleting")
                : t("deleteModal.confirmBtn")}
            </button>
          </>
        }
      >
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertTriangle
            size={48}
            className="text-red-500 animate-pulse drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]"
          />
          <p className="font-bold text-lg">{t("deleteModal.confirm")}</p>
          <p className="text-sm text-gray-400 leading-relaxed">
            {t.rich("deleteModal.description", {
              danger: (chunks) => (
                <span className="text-red-400 font-bold underline decoration-red-500/50 underline-offset-4">
                  {chunks}
                </span>
              ),
            })}
          </p>
        </div>
      </RetroModal>
    </div>
  );
}
