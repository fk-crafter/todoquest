"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { X, Loader2, Skull } from "lucide-react";

interface InvasionModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function InvasionModal({
  onClose,
  onSuccess,
}: InvasionModalProps) {
  const t = useTranslations("Shop.invasionModal");
  const { data: session } = useSession();
  const [selectedFriendId, setSelectedFriendId] = useState<string | null>(null);

  const { data: friends = [], isLoading } = useQuery({
    queryKey: ["friends"],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/friends`,
        {
          headers: { Authorization: `Bearer ${session?.accessToken}` },
        },
      );
      if (!res.ok) throw new Error("Erreur amis");
      return res.json();
    },
    enabled: !!session?.accessToken,
  });

  const invasionMutation = useMutation({
    mutationFn: async (targetId: string) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/invasion`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.accessToken}`,
          },
          body: JSON.stringify({ targetId }),
        },
      );
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message);
      }
      return res.json();
    },
    onSuccess: (data) => {
      alert(data.message || t("success"));
      onSuccess();
      onClose();
    },
    onError: (err: Error) => alert(err.message),
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 border-4 border-red-900 p-6 rounded-xl shadow-[0_0_30px_rgba(220,38,38,0.3)] w-full max-w-sm relative flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        <h2 className="text-xl font-bold text-red-500 text-center flex items-center justify-center gap-2 mb-6 font-press">
          <Skull size={24} /> {t("title")}
        </h2>

        {isLoading ? (
          <Loader2
            className="animate-spin mx-auto text-red-500 my-6"
            size={32}
          />
        ) : friends.length === 0 ? (
          <p className="text-center text-gray-500 my-6">{t("empty")}</p>
        ) : (
          <div className="max-h-60 overflow-y-auto space-y-2 mb-6 custom-scrollbar pr-2">
            {friends.map((f: any) => (
              <div
                key={f.friendshipId}
                onClick={() => setSelectedFriendId(f.friend.id)}
                className={`p-3 rounded-lg border-2 cursor-pointer transition-all flex items-center gap-3 ${
                  selectedFriendId === f.friend.id
                    ? "border-red-500 bg-red-900/30"
                    : "border-gray-700 bg-gray-800 hover:border-gray-500"
                }`}
              >
                <div className="w-10 h-10 bg-gray-700 rounded-full overflow-hidden border border-gray-600">
                  <img
                    src={`/${f.friend.image || "char-male.png"}`}
                    alt="avatar"
                    className="w-full h-full object-cover"
                    style={{ imageRendering: "pixelated" }}
                  />
                </div>
                <div>
                  <p className="font-bold text-white text-sm">
                    {f.friend.name}
                  </p>
                  <p className="text-[10px] text-yellow-400">
                    Niv {f.friend.level}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2 mt-auto">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded"
          >
            {t("cancel")}
          </button>
          <button
            onClick={() =>
              selectedFriendId && invasionMutation.mutate(selectedFriendId)
            }
            disabled={!selectedFriendId || invasionMutation.isPending}
            className="flex-1 bg-red-700 hover:bg-red-600 disabled:opacity-50 text-white font-bold py-3 rounded flex items-center justify-center gap-2"
          >
            {invasionMutation.isPending ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Skull size={18} />
            )}
            {t("send")}
          </button>
        </div>
      </div>
    </div>
  );
}
