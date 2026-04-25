"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Sidebar from "@/components/Sidebar";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import {
  Search,
  Users,
  UserPlus,
  UserCheck,
  X,
  Check,
  Loader2,
  UserMinus,
} from "lucide-react";
import FriendProfileModal from "@/components/friends/FriendProfileModal";

export default function FriendsPage() {
  const t = useTranslations("Friends");
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<"LIST" | "REQUESTS" | "SEARCH">(
    "LIST",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState<any>(null);
  const [searchError, setSearchError] = useState("");
  const [selectedFriendId, setSelectedFriendId] = useState<string | null>(null);

  const { data: friends = [], isLoading: loadingFriends } = useQuery({
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

  const { data: requests = [], isLoading: loadingRequests } = useQuery({
    queryKey: ["friend-requests"],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/friends/requests`,
        {
          headers: { Authorization: `Bearer ${session?.accessToken}` },
        },
      );
      if (!res.ok) throw new Error("Erreur requêtes");
      return res.json();
    },
    enabled: !!session?.accessToken,
  });

  const sendRequestMutation = useMutation({
    mutationFn: async (targetId: string) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/friends/request`,
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
    },
    onSuccess: () => {
      alert(t("requestSent"));
      setSearchResult(null);
    },
    onError: (err: Error) => alert(err.message),
  });

  const acceptMutation = useMutation({
    mutationFn: async (friendshipId: string) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/friends/accept/${friendshipId}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${session?.accessToken}` },
        },
      );
      if (!res.ok) throw new Error("Erreur acceptation");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      queryClient.invalidateQueries({ queryKey: ["friend-requests"] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (friendshipId: string) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/friends/remove/${friendshipId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${session?.accessToken}` },
        },
      );
      if (!res.ok) throw new Error("Erreur suppression");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      queryClient.invalidateQueries({ queryKey: ["friend-requests"] });
    },
  });

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError("");
    setSearchResult(null);

    if (!searchQuery.includes("#")) {
      setSearchError(t("searchPlaceholder"));
      return;
    }

    try {
      const encodedQuery = encodeURIComponent(searchQuery);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/search?q=${encodedQuery}`,
        {
          headers: { Authorization: `Bearer ${session?.accessToken}` },
        },
      );

      if (!res.ok) throw new Error(t("noResults"));

      const data = await res.json();
      setSearchResult(data);
    } catch (err: any) {
      setSearchError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-900 text-white font-press">
      <Sidebar />

      <main className="flex-1 p-4 md:p-8 flex flex-col max-w-4xl mx-auto w-full mt-12 md:mt-0">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-yellow-400 flex items-center gap-3">
          <Users size={32} /> {t("title")}
        </h1>

        <div className="flex gap-2 mb-6 bg-gray-800 p-2 rounded-lg border border-gray-700 overflow-x-auto">
          {[
            {
              id: "LIST",
              label: t("myFriends"),
              icon: UserCheck,
              count: friends.length,
            },
            {
              id: "REQUESTS",
              label: t("requests"),
              icon: UserPlus,
              count: requests.length,
            },
            { id: "SEARCH", label: t("search"), icon: Search, count: 0 },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded text-xs md:text-sm font-bold transition-all min-w-[120px] ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white shadow-lg"
                  : "bg-gray-900 text-gray-400 hover:bg-gray-700"
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
              {tab.count > 0 && (
                <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {activeTab === "LIST" && (
          <div className="space-y-3">
            {loadingFriends ? (
              <Loader2
                className="animate-spin mx-auto text-blue-500 my-10"
                size={32}
              />
            ) : friends.length === 0 ? (
              <p className="text-center text-gray-500 my-10">
                {t("noFriends")}
              </p>
            ) : (
              friends.map((f: any) => (
                <div
                  key={f.friendshipId}
                  onClick={() => setSelectedFriendId(f.friend.id)}
                  className="bg-gray-800 border-2 border-gray-700 hover:border-yellow-500 hover:bg-gray-750 p-4 rounded-lg flex items-center justify-between cursor-pointer transition-all"
                >
                  {" "}
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-700 rounded-full border border-gray-600 overflow-hidden">
                      <img
                        src={`/${f.friend.image || "char-male.png"}`}
                        alt="avatar"
                        className="w-full h-full object-cover"
                        style={{ imageRendering: "pixelated" }}
                      />
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm md:text-base">
                        {f.friend.name}{" "}
                        <span className="text-gray-500 text-xs">
                          #{f.friend.userTag}
                        </span>
                      </p>
                      <p className="text-[10px] text-yellow-400 mt-1">
                        {t("level")} {f.friend.level} • {f.friend.class}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeMutation.mutate(f.friendshipId);
                    }}
                    className="p-2 bg-red-900/50 hover:bg-red-600 border border-red-800 text-white rounded transition-colors"
                    title={t("remove")}
                  >
                    <UserMinus size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "REQUESTS" && (
          <div className="space-y-3">
            {loadingRequests ? (
              <Loader2
                className="animate-spin mx-auto text-blue-500 my-10"
                size={32}
              />
            ) : requests.length === 0 ? (
              <p className="text-center text-gray-500 my-10">
                {t("noRequests")}
              </p>
            ) : (
              requests.map((req: any) => (
                <div
                  key={req.id}
                  className="bg-gray-800 border-2 border-blue-900/50 p-4 rounded-lg flex flex-col md:flex-row items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="w-12 h-12 bg-gray-700 rounded-full border border-gray-600 overflow-hidden">
                      <img
                        src={`/${req.requester.image || "char-male.png"}`}
                        alt="avatar"
                        className="w-full h-full object-cover"
                        style={{ imageRendering: "pixelated" }}
                      />
                    </div>
                    <div>
                      <p className="font-bold text-white">
                        {req.requester.name}{" "}
                        <span className="text-gray-500 text-xs">
                          #{req.requester.userTag}
                        </span>
                      </p>
                      <p className="text-[10px] text-yellow-400">
                        {t("level")} {req.requester.level}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 w-full md:w-auto">
                    <button
                      onClick={() => acceptMutation.mutate(req.id)}
                      disabled={acceptMutation.isPending}
                      className="flex-1 md:flex-none flex items-center justify-center gap-1 px-4 py-2 bg-green-600 hover:bg-green-500 text-white font-bold rounded text-xs"
                    >
                      <Check size={16} /> {t("accept")}
                    </button>
                    <button
                      onClick={() => removeMutation.mutate(req.id)}
                      disabled={removeMutation.isPending}
                      className="flex-1 md:flex-none flex items-center justify-center gap-1 px-4 py-2 bg-gray-700 hover:bg-red-600 text-white font-bold rounded text-xs"
                    >
                      <X size={16} /> {t("decline")}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "SEARCH" && (
          <div>
            <form onSubmit={handleSearch} className="flex gap-2 mb-6">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("searchPlaceholder")}
                className="flex-1 bg-gray-800 border-2 border-gray-600 focus:border-blue-500 p-3 rounded text-white outline-none"
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-500 px-6 font-bold rounded text-white flex items-center gap-2"
              >
                <Search size={18} />{" "}
                <span className="hidden md:inline">{t("searchBtn")}</span>
              </button>
            </form>

            {searchError && (
              <p className="text-red-400 text-center font-bold">
                {searchError}
              </p>
            )}

            {searchResult && (
              <div className="bg-gray-800 border-2 border-blue-500 p-6 rounded-lg flex flex-col md:flex-row items-center justify-between gap-4 animate-in fade-in zoom-in-95">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-700 rounded-full border-2 border-yellow-400 overflow-hidden">
                    <img
                      src={`/${searchResult.image || "char-male.png"}`}
                      alt="avatar"
                      className="w-full h-full object-cover"
                      style={{ imageRendering: "pixelated" }}
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {searchResult.name}{" "}
                      <span className="text-gray-500 text-sm">
                        #{searchResult.userTag}
                      </span>
                    </h3>
                    <p className="text-yellow-400 text-xs mt-1">
                      {t("level")} {searchResult.level} • {searchResult.class}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => sendRequestMutation.mutate(searchResult.id)}
                  disabled={sendRequestMutation.isPending}
                  className="w-full md:w-auto px-6 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {sendRequestMutation.isPending ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <UserPlus size={18} />
                  )}
                  {t("addFriend")}
                </button>
              </div>
            )}
          </div>
        )}
        {selectedFriendId && (
          <FriendProfileModal
            friendId={selectedFriendId}
            onClose={() => setSelectedFriendId(null)}
          />
        )}
      </main>
    </div>
  );
}
