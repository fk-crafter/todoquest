"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Sidebar from "@/components/Sidebar";
import RetroModal from "@/components/ui/RetroModal";
import SharePreview from "@/components/SharePreview";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import {
  ShoppingBag,
  Lock,
  Coins,
  Check,
  Frame,
  Flame,
  Zap,
  Crown,
  Sword,
  Mountain,
  Trees,
  Cpu,
  Shield,
  Ghost,
  Sparkles,
  Hexagon,
  Gem,
  Loader2,
  CreditCard,
  AlertCircle,
} from "lucide-react";

type ShopItem = {
  id: string;
  name: string;
  category: string;
  price: number;
  icon: React.ElementType;
  color: string;
};

const SHOP_ITEMS: ShopItem[] = [
  {
    id: "frame_gold",
    name: "Cadre Doré",
    category: "FRAME",
    price: 300,
    icon: Frame,
    color: "text-yellow-400",
  },
  {
    id: "frame_fire",
    name: "Enflammé",
    category: "FRAME",
    price: 800,
    icon: Flame,
    color: "text-orange-500",
  },
  {
    id: "frame_neon",
    name: "Néon Bleu",
    category: "FRAME",
    price: 600,
    icon: Zap,
    color: "text-cyan-400",
  },
  {
    id: "frame_emerald",
    name: "Émeraude",
    category: "FRAME",
    price: 500,
    icon: Hexagon,
    color: "text-green-400",
  },
  {
    id: "title_slayer",
    name: "Tueur",
    category: "TITLE",
    price: 200,
    icon: Sword,
    color: "text-red-400",
  },
  {
    id: "title_paladin",
    name: "Paladin",
    category: "TITLE",
    price: 500,
    icon: Shield,
    color: "text-blue-300",
  },
  {
    id: "title_ninja",
    name: "Ombre",
    category: "TITLE",
    price: 800,
    icon: Ghost,
    color: "text-gray-400",
  },
  {
    id: "title_rich",
    name: "Le Bourgeois",
    category: "TITLE",
    price: 5000,
    icon: Crown,
    color: "text-yellow-300",
  },
  {
    id: "title_legend",
    name: "Légende",
    category: "TITLE",
    price: 2500,
    icon: Sparkles,
    color: "text-purple-400",
  },
  {
    id: "theme_magma",
    name: "Magma",
    category: "THEME",
    price: 1000,
    icon: Mountain,
    color: "text-red-600",
  },
  {
    id: "theme_forest",
    name: "Forêt",
    category: "THEME",
    price: 1000,
    icon: Trees,
    color: "text-green-500",
  },
  {
    id: "theme_cyber",
    name: "Cyberpunk",
    category: "THEME",
    price: 1500,
    icon: Cpu,
    color: "text-purple-500",
  },
];

const CATEGORIES = {
  FRAME: "Cadres d'Avatar 🖼️",
  TITLE: "Titres Rares 👑",
  THEME: "Thèmes Visuels 🎨",
};

export default function ShopPage() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  const [itemToBuy, setItemToBuy] = useState<ShopItem | null>(null);
  const [successItem, setSuccessItem] = useState<ShopItem | null>(null);
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchProfile = async () => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/me`,
      {
        headers: { Authorization: `Bearer ${session?.accessToken}` },
      },
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
  const userInventory: string[] = user?.inventory || [];

  const buyMutation = useMutation({
    mutationFn: async (item: ShopItem) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/buy`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.accessToken}`,
          },
          body: JSON.stringify({
            itemId: item.id,
            price: item.price,
          }),
        },
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Erreur lors de l'achat");
      }
    },
    onSuccess: (_, item) => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      setItemToBuy(null);
      setSuccessItem(item);
    },
    onError: (error: any) => {
      setItemToBuy(null);
      setErrorMessage(error.message);
    },
  });

  const handleRequestBuy = (item: ShopItem) => {
    if (!session?.accessToken) return;
    if (gold < item.price) return;
    setItemToBuy(item);
  };

  const confirmBuy = () => {
    if (itemToBuy) {
      buyMutation.mutate(itemToBuy);
    }
  };

  const handleBuyGold = () => {
    setShowComingSoon(true);
  };

  return (
    <div className="min-h-screen flex bg-gray-900 text-white font-press">
      <Sidebar />

      <main className="flex-1 p-4 md:p-6 flex flex-col">
        <div className="flex justify-between items-center mb-6 mt-12 bg-gray-800 p-3 rounded-xl border-b-4 border-gray-600">
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
          <div>
            <h2 className="text-lg text-yellow-400 mb-3 border-b border-yellow-800 pb-1 uppercase tracking-wider flex items-center gap-2">
              <Gem size={20} /> Trésorerie
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-yellow-900/40 to-yellow-900/10 border-2 border-yellow-600/50 rounded-lg p-4 flex items-center justify-between relative overflow-hidden group hover:border-yellow-400 transition-all">
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-yellow-500/20 rounded-full blur-xl group-hover:bg-yellow-500/30 transition-all"></div>

                <div className="flex flex-col gap-1 z-10">
                  <h3 className="font-bold text-yellow-100 text-sm">
                    Bourse d'Or
                  </h3>
                  <div className="flex items-center gap-2 text-yellow-400 font-bold text-xl">
                    1 500 <Coins size={20} />
                  </div>
                  <span className="text-[10px] text-yellow-200/70">
                    Idéal pour débuter
                  </span>
                </div>

                <button
                  onClick={handleBuyGold}
                  className="z-10 bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-2 px-4 rounded-lg shadow-lg active:scale-95 transition-all flex items-center gap-1 text-sm cursor-pointer"
                >
                  2,99 €
                </button>
              </div>

              <div className="bg-gray-800/50 border-2 border-gray-700 border-dashed rounded-lg p-4 flex items-center justify-center text-gray-500 gap-2 opacity-50">
                <Lock size={16} /> Plus d'offres bientôt...
              </div>
            </div>
          </div>

          {(Object.keys(CATEGORIES) as Array<keyof typeof CATEGORIES>).map(
            (catKey) => {
              const items = SHOP_ITEMS.filter(
                (item) => item.category === catKey,
              );
              if (items.length === 0) return null;

              return (
                <div key={catKey}>
                  <h2 className="text-lg text-gray-400 mb-3 border-b border-gray-700 pb-1 uppercase tracking-wider">
                    {CATEGORIES[catKey]}
                  </h2>

                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {items.map((item) => {
                      const isOwned = userInventory.includes(item.id);
                      const canBuy = gold >= item.price;
                      const IconComponent = item.icon;
                      const isProcessing =
                        buyMutation.isPending &&
                        buyMutation.variables?.id === item.id;

                      return (
                        <div
                          key={item.id}
                          className={`bg-gray-800 border-2 rounded-lg p-3 flex flex-col items-center gap-2 transition-all group relative ${
                            isOwned
                              ? "border-green-600/50"
                              : "border-gray-600 hover:border-blue-500 hover:bg-gray-750"
                          }`}
                        >
                          <div className="w-12 h-12 bg-gray-700 rounded-md flex items-center justify-center border border-gray-600 group-hover:scale-105 transition-transform">
                            <IconComponent size={28} className={item.color} />
                          </div>

                          <div className="text-center w-full">
                            <h3 className="text-xs md:text-sm font-bold text-white truncate w-full">
                              {item.name}
                            </h3>
                          </div>

                          <button
                            onClick={() => !isOwned && handleRequestBuy(item)}
                            disabled={
                              isOwned || !canBuy || buyMutation.isPending
                            }
                            className={`w-full py-1.5 px-2 rounded text-xs font-bold border-b-2 active:border-b-0 active:translate-y-0.5 transition-all flex items-center justify-center gap-1 mt-auto ${
                              isOwned
                                ? "bg-green-700 text-white border-green-900 cursor-default"
                                : canBuy
                                  ? "bg-yellow-500 hover:bg-yellow-400 text-black border-yellow-700 cursor-pointer"
                                  : "bg-gray-600 text-gray-400 border-gray-700 cursor-not-allowed"
                            }`}
                          >
                            {isProcessing ? (
                              <Loader2 className="animate-spin" size={12} />
                            ) : isOwned ? (
                              <>
                                <Check size={12} /> POSSÉDÉ
                              </>
                            ) : canBuy ? (
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
                      );
                    })}
                  </div>
                </div>
              );
            },
          )}
        </div>
      </main>

      <RetroModal
        isOpen={!!itemToBuy}
        onClose={() => setItemToBuy(null)}
        title="Confirmation"
        footer={
          <>
            <button
              onClick={() => setItemToBuy(null)}
              className="px-4 py-2 text-gray-400 hover:text-white font-bold"
            >
              Annuler
            </button>
            <button
              onClick={confirmBuy}
              disabled={buyMutation.isPending}
              className="px-6 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded flex items-center gap-2"
            >
              {buyMutation.isPending && (
                <Loader2 className="animate-spin" size={16} />
              )}
              Acheter
            </button>
          </>
        }
      >
        <div className="flex flex-col items-center gap-4 text-center">
          {itemToBuy && (
            <>
              <div className="p-4 bg-gray-700 rounded-lg border-2 border-gray-600">
                <itemToBuy.icon size={48} className={itemToBuy.color} />
              </div>
              <p>
                Voulez-vous acheter <strong>{itemToBuy.name}</strong> ?
              </p>
              <p className="text-yellow-400 font-bold text-xl flex items-center gap-2">
                -{itemToBuy.price} <Coins size={20} />
              </p>
            </>
          )}
        </div>
      </RetroModal>

      <RetroModal
        isOpen={!!successItem}
        onClose={() => setSuccessItem(null)}
        title="Butin Acquis !"
        type="success"
        footer={
          <button
            onClick={() => setSuccessItem(null)}
            className="w-full px-6 py-2 bg-green-600 hover:bg-green-500 text-white font-bold rounded"
          >
            Génial !
          </button>
        }
      >
        <div className="flex flex-col items-center gap-4 text-center">
          {successItem && (
            <>
              <div className="flex flex-col items-center gap-4 text-center">
                {successItem && (
                  <SharePreview
                    title="BUTIN LÉGENDAIRE !"
                    message={`Je viens d'obtenir ${successItem.name} sur TodoQuest !`}
                    icon={successItem.icon}
                    color={successItem.color}
                  />
                )}
              </div>
            </>
          )}
        </div>
      </RetroModal>

      <RetroModal
        isOpen={showComingSoon}
        onClose={() => setShowComingSoon(false)}
        title="Bientôt..."
      >
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <CreditCard size={48} className="text-gray-500" />
          </div>
          <p>
            Le système de paiement est en cours de construction par nos
            gobelins.
          </p>
          <p className="text-sm text-gray-500">Revenez plus tard !</p>
        </div>
      </RetroModal>

      <RetroModal
        isOpen={!!errorMessage}
        onClose={() => setErrorMessage(null)}
        title="Erreur"
        type="danger"
      >
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertCircle size={48} className="text-red-500" />
          <p>{errorMessage}</p>
        </div>
      </RetroModal>
    </div>
  );
}
