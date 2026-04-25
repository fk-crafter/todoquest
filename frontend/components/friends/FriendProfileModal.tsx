"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { X, Shield, ScrollText, Calendar } from "lucide-react";

interface FriendProfileModalProps {
  friendId: string;
  onClose: () => void;
}

export default function FriendProfileModal({
  friendId,
  onClose,
}: FriendProfileModalProps) {
  const t = useTranslations("Friends");
  const { data: session } = useSession();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["publicProfile", friendId],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/public/${friendId}`,
        {
          headers: { Authorization: `Bearer ${session?.accessToken}` },
        },
      );
      if (!res.ok) throw new Error("Erreur");
      return res.json();
    },
    enabled: !!session?.accessToken && !!friendId,
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 border-4 border-gray-700 p-6 rounded-xl shadow-2xl w-full max-w-sm relative flex flex-col items-center animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        {isLoading || !profile ? (
          <div className="py-10 animate-pulse text-yellow-400">
            Chargement...
          </div>
        ) : (
          <>
            <div className="w-24 h-24 bg-gray-800 rounded-full border-4 border-yellow-500 overflow-hidden mb-4 shadow-[0_0_15px_rgba(234,179,8,0.3)]">
              <img
                src={`/${profile.image || "char-male.png"}`}
                alt="avatar"
                className="w-full h-full object-cover"
                style={{ imageRendering: "pixelated" }}
              />
            </div>

            <h2 className="text-2xl font-bold text-white text-center">
              {profile.name}{" "}
              <span className="text-gray-500 text-sm">#{profile.userTag}</span>
            </h2>

            <p className="text-yellow-400 font-bold mb-6">
              {t("level")} {profile.level} • {profile.class}
            </p>

            <div className="w-full space-y-3">
              <div className="bg-gray-800 p-3 rounded-lg border border-gray-700 flex items-center gap-3">
                <ScrollText className="text-blue-400" size={20} />
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-400 uppercase">
                    {t("profileModal.tasksCompleted")}
                  </span>
                  <span className="font-bold text-white">
                    {profile.stats.completedTasks}
                  </span>
                </div>
              </div>

              <div className="bg-gray-800 p-3 rounded-lg border border-gray-700 flex items-center gap-3">
                <Shield className="text-purple-400" size={20} />
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-400 uppercase">
                    XP Total
                  </span>
                  <span className="font-bold text-white">{profile.xp} XP</span>
                </div>
              </div>

              <div className="bg-gray-800 p-3 rounded-lg border border-gray-700 flex items-center gap-3">
                <Calendar className="text-green-400" size={20} />
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-400 uppercase">
                    {t("profileModal.memberSince")}
                  </span>
                  <span className="font-bold text-white">
                    {new Date(profile.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
