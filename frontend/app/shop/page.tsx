"use client";

import { useSession } from "next-auth/react";
import Sidebar from "@/components/Sidebar";
import { useQuery } from "@tanstack/react-query";
import { ShoppingBag, Lock, Coins } from "lucide-react";

const SHOP_ITEMS = [
  {
    id: "skin_knight",
    name: "Chevalier",
    category: "SKIN",
    price: 500,
    image: "🛡️",
  },
  {
    id: "skin_wizard",
    name: "Sorcier",
    category: "SKIN",
    price: 500,
    image: "🔮",
  },
  {
    id: "skin_robot",
    name: "Robot",
    category: "SKIN",
    price: 800,
    image: "🤖",
  },

  {
    id: "frame_gold",
    name: "Cadre Doré",
    category: "FRAME",
    price: 300,
    image: "🖼️",
  },
  {
    id: "frame_fire",
    name: "Enflammé",
    category: "FRAME",
    price: 800,
    image: "🔥",
  },
  {
    id: "frame_neon",
    name: "Néon Bleu",
    category: "FRAME",
    price: 600,
    image: "⚡",
  },

  {
    id: "title_rich",
    name: "Le Bourgeois",
    category: "TITLE",
    price: 5000,
    image: "🎩",
  },
  {
    id: "title_slayer",
    name: "Tueur de Procrastination",
    category: "TITLE",
    price: 200,
    image: "⚔️",
  },

  {
    id: "theme_magma",
    name: "Magma",
    category: "THEME",
    price: 1000,
    image: "🌋",
  },
  {
    id: "theme_forest",
    name: "Forêt",
    category: "THEME",
    price: 1000,
    image: "🌲",
  },
  {
    id: "theme_cyber",
    name: "Cyberpunk",
    category: "THEME",
    price: 1500,
    image: "👾",
  },
];

const CATEGORIES = {
  SKIN: "Apparences 👤",
  FRAME: "Cadres 🖼️",
  TITLE: "Titres Rares 👑",
  THEME: "Thèmes Visuels 🎨",
};

export default function ShopPage() {
  const { data: session } = useSession();

  const fetchProfile = async () => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/me`,
      {
        headers: { Authorization: `Bearer ${session?.accessToken}` },
      }
    );
    if (!res.ok) throw new Error("Erreur chargement");
    return res.json();
  };

  const { data: user, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: fetchProfile,
    enabled: !!session?.accessToken,
  });

  const gold = user?.gold || 0;

  const handleBuy = (item: any) => {
    alert(`Achat de ${item.name} pour ${item.price} Or (Bientôt disponible !)`);
  };

  return (
    <div className="min-h-screen flex bg-gray-900 text-white font-press">
      <Sidebar />

      <main className="flex-1 p-4 md:p-6 flex flex-col">
        <div className="flex justify-between items-center mb-6 bg-gray-800 p-3 rounded-xl border-b-4 border-gray-600">
          <div className="flex items-center gap-3">
            <ShoppingBag className="text-yellow-400" size={24} />
            <h1 className="text-xl md:text-2xl font-bold text-yellow-400">
              Boutique
            </h1>
          </div>

          <div className="bg-gray-900 px-3 py-1 rounded-lg border-2 border-yellow-500 flex items-center gap-2 shadow-[0_0_10px_rgba(234,179,8,0.3)]">
            <span className="text-yellow-400 text-lg font-bold">
              {isLoading ? "..." : gold}
            </span>
            <Coins className="text-yellow-500" size={18} />
          </div>
        </div>

        <div className="space-y-8 pb-10">
          {(Object.keys(CATEGORIES) as Array<keyof typeof CATEGORIES>).map(
            (catKey) => {
              const items = SHOP_ITEMS.filter(
                (item) => item.category === catKey
              );
              if (items.length === 0) return null;

              return (
                <div key={catKey}>
                  <h2 className="text-lg text-gray-400 mb-3 border-b border-gray-700 pb-1 uppercase tracking-wider">
                    {CATEGORIES[catKey]}
                  </h2>

                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="bg-gray-800 border-2 border-gray-600 rounded-lg p-3 flex flex-col items-center gap-2 hover:border-blue-500 hover:bg-gray-750 transition-all group relative"
                      >
                        <div className="w-12 h-12 bg-gray-700 rounded-md flex items-center justify-center text-2xl border border-gray-600 group-hover:scale-105 transition-transform">
                          {item.image}
                        </div>

                        <div className="text-center w-full">
                          <h3 className="text-xs md:text-sm font-bold text-white truncate w-full">
                            {item.name}
                          </h3>
                        </div>

                        <button
                          onClick={() => handleBuy(item)}
                          disabled={gold < item.price}
                          className={`w-full py-1.5 px-2 rounded text-xs font-bold border-b-2 active:border-b-0 active:translate-y-0.5 transition-all flex items-center justify-center gap-1 mt-auto ${
                            gold >= item.price
                              ? "bg-yellow-500 hover:bg-yellow-400 text-black border-yellow-700"
                              : "bg-gray-600 text-gray-400 border-gray-700 cursor-not-allowed"
                          }`}
                        >
                          {gold >= item.price ? (
                            <>
                              {item.price} <Coins size={12} />
                            </>
                          ) : (
                            <>
                              <Lock size={12} /> {item.price}
                            </>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            }
          )}
        </div>
      </main>
    </div>
  );
}
