"use client";

import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { ShieldAlert, Calendar, Mail, Sword, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminPage() {
  const t = useTranslations("Admin");
  const { data: session, status } = useSession();
  const router = useRouter();

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

  if (status === "loading" || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="w-12 h-12 text-yellow-500 animate-spin mb-4" />
        <p className="text-gray-400 font-press text-sm">{t("loading")}</p>
      </div>
    );
  }

  if (session?.user?.role !== "ADMIN") {
    return null;
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto font-press animate-fadeIn pb-24">
      <div className="flex flex-col md:flex-row items-center gap-4 mb-8 border-b-2 border-gray-700 pb-4 text-center md:text-left">
        <ShieldAlert className="w-12 h-12 text-red-500" />
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            {t("title")}
          </h1>
          <p className="text-gray-400 text-sm mt-2">
            {t("subtitle")}{" "}
            <span className="text-yellow-400">({users?.length || 0})</span>
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-400 p-4 rounded-lg mb-6 text-sm">
          {t("error")}
        </div>
      )}

      <div className="overflow-x-auto bg-gray-800 rounded-xl border-2 border-gray-700 shadow-2xl">
        <table className="w-full text-left text-sm text-gray-300">
          <thead className="text-[10px] md:text-xs text-gray-400 uppercase bg-gray-900 border-b-2 border-gray-700 whitespace-nowrap">
            <tr>
              <th className="px-4 py-4">{t("table.player")}</th>
              <th className="px-4 py-4">{t("table.email")}</th>
              <th className="px-4 py-4">{t("table.stats")}</th>
              <th className="px-4 py-4">{t("table.class")}</th>
              <th className="px-4 py-4">{t("table.role")}</th>
              <th className="px-4 py-4">{t("table.joined")}</th>
            </tr>
          </thead>
          <tbody>
            {users?.map((u: any) => (
              <tr
                key={u.id}
                className="border-b border-gray-700/50 hover:bg-gray-700/50 transition-colors whitespace-nowrap"
              >
                <td className="px-4 py-4 font-bold text-white">
                  {u.name || "Aventurier"}
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <Mail size={14} className="text-gray-500" />
                    <span className="text-xs md:text-sm font-mono text-gray-300">
                      {u.email}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-400 font-bold text-xs md:text-sm">
                      Lvl {u.level}
                    </span>
                    <span className="text-gray-500 text-[10px] md:text-xs">
                      ({u.xp} XP)
                    </span>
                  </div>
                </td>
                <td className="px-4 py-4 capitalize">
                  <div className="flex items-center gap-2">
                    <Sword size={14} className="text-gray-500" />
                    {u.class?.toLowerCase() || "adventurer"}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span
                    className={`px-2 py-1 rounded text-[10px] font-bold ${u.role === "ADMIN" ? "bg-red-500/20 text-red-400 border border-red-500" : "bg-blue-500/20 text-blue-400 border border-blue-500"}`}
                  >
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-4 text-xs text-gray-500">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-gray-500" />
                    {new Date(u.createdAt).toLocaleDateString()}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
