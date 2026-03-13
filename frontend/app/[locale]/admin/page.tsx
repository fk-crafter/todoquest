"use client";

import { useSession } from "next-auth/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import {
  ShieldAlert,
  Calendar,
  Mail,
  Sword,
  Loader2,
  User,
  Trophy,
  Coins,
  Plus,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function AdminPage() {
  const t = useTranslations("Admin");
  const { data: session, status } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();

  // État pour la modale d'ajout d'or
  const [selectedPlayer, setSelectedPlayer] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [goldAmount, setGoldAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role !== "ADMIN") {
      router.push("/");
    }
  }, [session, status, router]);

  const fetchUsers = async () => {
    if (!session?.accessToken) return null;
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/admin/all`,
      {
        headers: { Authorization: `Bearer ${session.accessToken}` },
      },
    );
    if (!res.ok) throw new Error("Erreur de récupération");
    return res.json();
  };

  const {
    data: users,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["adminUsers"],
    queryFn: fetchUsers,
    enabled: !!session?.accessToken && session?.user?.role === "ADMIN",
  });

  // Fonction pour envoyer l'or
  const handleGiveGold = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlayer || !goldAmount || isNaN(Number(goldAmount))) return;

    setIsSubmitting(true);
    try {
      // NOTE: Il faudra s'assurer que ton backend possède cette route
      await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/admin/${selectedPlayer.id}/gold`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.accessToken}`,
          },
          body: JSON.stringify({ amount: Number(goldAmount) }),
        },
      );

      // Rafraîchir la liste
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      setSelectedPlayer(null);
      setGoldAmount("");
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'ajout d'or.");
    }
    setIsSubmitting(false);
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 text-yellow-500 animate-spin mb-4" />
        <p className="text-gray-400 font-press text-xs">{t("loading")}</p>
      </div>
    );
  }

  if (session?.user?.role !== "ADMIN") return null;

  return (
    <div className="p-2 md:p-6 max-w-[1400px] mx-auto font-press animate-fadeIn pb-24">
      {/* HEADER ULTRA COMPACT */}
      <div className="flex items-center gap-3 mb-6 border-b border-gray-800 pb-4">
        <ShieldAlert className="w-6 h-6 md:w-8 md:h-8 text-red-500" />
        <div>
          <h1 className="text-lg md:text-xl font-bold text-white tracking-wide">
            {t("title")}
          </h1>
          <p className="text-gray-400 text-[8px] md:text-[10px] mt-1">
            {t("subtitle")}{" "}
            <span className="text-yellow-400">[{users?.length || 0}]</span>
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border-l-2 border-red-500 text-red-400 p-2 mb-4 text-[10px]">
          {t("error")}
        </div>
      )}

      {/* LISTE DES JOUEURS COMPACTE */}
      <div className="flex flex-col gap-2">
        {/* En-tête (PC) - 12 Colonnes */}
        <div className="hidden lg:grid grid-cols-12 gap-2 px-3 py-1 text-[8px] text-gray-500 uppercase border-b border-gray-800/50">
          <div className="col-span-2">Joueur</div>
          <div className="col-span-3">Email</div>
          <div className="col-span-2">Stats</div>
          <div className="col-span-1 text-yellow-500">Or</div>
          <div className="col-span-1">Classe</div>
          <div className="col-span-1 text-center">Rôle</div>
          <div className="col-span-1">Rejoint</div>
          <div className="col-span-1 text-right">Action</div>
        </div>

        {users?.map((u: any) => (
          <div
            key={u.id}
            className="flex flex-col lg:grid lg:grid-cols-12 lg:items-center gap-2 p-2 md:p-3 rounded border border-gray-800/50 bg-gray-900/20 hover:bg-gray-800/40 transition-all text-[10px] md:text-xs"
          >
            {/* 1. Nom */}
            <div className="col-span-2 flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-gray-800 flex items-center justify-center border border-gray-700 flex-shrink-0">
                <User size={10} className="text-gray-400" />
              </div>
              <span className="font-bold text-white truncate">
                {u.name || "Aventurier"}
              </span>
            </div>

            {/* 2. Email */}
            <div className="col-span-3 flex items-center gap-1 text-gray-400">
              <Mail size={10} className="hidden lg:block flex-shrink-0" />
              <span className="font-mono truncate">{u.email}</span>
            </div>

            {/* 3. Stats */}
            <div className="col-span-2 flex items-center gap-1">
              <Trophy size={10} className="text-yellow-500 hidden lg:block" />
              <span className="text-yellow-400 font-bold whitespace-nowrap">
                Lvl {u.level}
              </span>
              <span className="text-gray-500 text-[8px] whitespace-nowrap">
                ({u.xp} XP)
              </span>
            </div>

            {/* 4. Or */}
            <div className="col-span-1 flex items-center gap-1 text-yellow-400 font-bold">
              <Coins size={10} className="text-yellow-500" />
              <span className="lg:hidden text-gray-500 text-[8px] uppercase">
                Or:{" "}
              </span>
              {u.gold || 0}
            </div>

            {/* 5. Classe */}
            <div className="col-span-1 flex items-center gap-1 text-gray-300 capitalize">
              <Sword size={10} className="hidden lg:block text-gray-500" />
              {u.class?.toLowerCase() || "adv."}
            </div>

            {/* 6. Role */}
            <div className="col-span-1 flex lg:justify-center">
              <span
                className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${u.role === "ADMIN" ? "text-red-400 bg-red-500/10" : "text-blue-400 bg-blue-500/10"}`}
              >
                {u.role}
              </span>
            </div>

            {/* 7. Date */}
            <div className="col-span-1 flex items-center gap-1 text-[8px] text-gray-500">
              <Calendar size={10} className="hidden lg:block" />
              {new Date(u.createdAt).toLocaleDateString()}
            </div>

            {/* 8. Action (Bouton Or) */}
            <div className="col-span-1 flex lg:justify-end mt-2 lg:mt-0">
              <button
                onClick={() =>
                  setSelectedPlayer({ id: u.id, name: u.name || "Aventurier" })
                }
                className="flex items-center justify-center gap-1 bg-yellow-500/20 hover:bg-yellow-500/40 text-yellow-400 border border-yellow-500/50 rounded py-1 px-2 transition-all w-full lg:w-auto"
                title="Donner de l'or"
              >
                <Plus size={10} /> <Coins size={10} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODALE D'AJOUT D'OR */}
      {selectedPlayer && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4">
          <div className="bg-gray-900 border-2 border-yellow-500/50 rounded-xl p-6 max-w-sm w-full relative animate-fadeIn">
            <button
              onClick={() => setSelectedPlayer(null)}
              className="absolute top-3 right-3 text-gray-400 hover:text-white"
            >
              <X size={16} />
            </button>
            <h2 className="text-sm font-bold text-yellow-400 mb-2 flex items-center gap-2">
              <Coins size={16} /> Récompenser
            </h2>
            <p className="text-[10px] text-gray-400 mb-4 leading-relaxed">
              Envoyer de l'or divin à{" "}
              <span className="text-white font-bold">
                {selectedPlayer.name}
              </span>
              .
            </p>
            <form onSubmit={handleGiveGold} className="flex flex-col gap-3">
              <input
                type="number"
                min="1"
                required
                value={goldAmount}
                onChange={(e) => setGoldAmount(e.target.value)}
                placeholder="Montant (ex: 500)"
                className="bg-gray-800 border border-gray-700 text-white text-xs p-2 rounded outline-none focus:border-yellow-500 text-center font-mono"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-xs py-2 rounded transition-all disabled:opacity-50"
              >
                {isSubmitting ? "Envoi..." : "Envoyer l'Or"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
