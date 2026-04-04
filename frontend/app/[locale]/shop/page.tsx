"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Sidebar from "@/components/Sidebar";
import RetroModal from "@/components/ui/RetroModal";
import SharePreview from "@/components/SharePreview";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useTutorial } from "@/context/TutorialContext";
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
    name: "frame_gold",
    category: "FRAME",
    price: 300,
    icon: Frame,
    color: "text-yellow-400",
  },
  {
    id: "frame_fire",
    name: "frame_fire",
    category: "FRAME",
    price: 800,
    icon: Flame,
    color: "text-orange-500",
  },
  {
    id: "frame_neon",
    name: "frame_neon",
    category: "FRAME",
    price: 600,
    icon: Zap,
    color: "text-cyan-400",
  },
  {
    id: "frame_emerald",
    name: "frame_emerald",
    category: "FRAME",
    price: 500,
    icon: Hexagon,
    color: "text-green-400",
  },
  {
    id: "title_slayer",
    name: "title_slayer",
    category: "TITLE",
    price: 200,
    icon: Sword,
    color: "text-red-400",
  },
  {
    id: "title_paladin",
    name: "title_paladin",
    category: "TITLE",
    price: 500,
    icon: Shield,
    color: "text-blue-300",
  },
  {
    id: "title_ninja",
    name: "title_ninja",
    category: "TITLE",
    price: 800,
    icon: Ghost,
    color: "text-gray-400",
  },
  {
    id: "title_rich",
    name: "title_rich",
    category: "TITLE",
    price: 5000,
    icon: Crown,
    color: "text-yellow-300",
  },
  {
    id: "title_legend",
    name: "title_legend",
    category: "TITLE",
    price: 2500,
    icon: Sparkles,
    color: "text-purple-400",
  },
  {
    id: "theme_magma",
    name: "theme_magma",
    category: "THEME",
    price: 1000,
    icon: Mountain,
    color: "text-red-600",
  },
  {
    id: "theme_forest",
    name: "theme_forest",
    category: "THEME",
    price: 1000,
    icon: Trees,
    color: "text-green-500",
  },
  {
    id: "theme_cyber",
    name: "theme_cyber",
    category: "THEME",
    price: 1500,
    icon: Cpu,
    color: "text-purple-500",
  },
];

const GOLD_PACKS = [
  {
    id: "small",
    amount: 500,
    gradient: "from-yellow-900/40 to-yellow-900/10",
    border: "border-yellow-600/50 hover:border-yellow-400",
    glow: "bg-yellow-500/20 group-hover:bg-yellow-500/30",
    button: "bg-yellow-500 hover:bg-yellow-400 text-black",
  },
  {
    id: "medium",
    amount: 1200,
    gradient: "from-orange-900/40 to-orange-900/10",
    border:
      "border-orange-500/80 hover:border-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.2)]",
    glow: "bg-orange-500/20 group-hover:bg-orange-500/40",
    button: "bg-orange-500 hover:bg-orange-400 text-black",
  },
  {
    id: "large",
    amount: 3000,
    gradient: "from-red-900/40 to-red-900/10",
    border: "border-red-600/50 hover:border-red-400",
    glow: "bg-red-500/20 group-hover:bg-red-500/30",
    button: "bg-red-500 hover:bg-red-400 text-white",
  },
];

export default function ShopPage() {
  const t = useTranslations("Shop");
  const tTasks = useTranslations("Tasks");
  const { data: session } = useSession();
  const { isTutorialActive, tutorialStep, endTutorial } = useTutorial();
  const queryClient = useQueryClient();

  const [itemToBuy, setItemToBuy] = useState<ShopItem | null>(null);
  const [successItem, setSuccessItem] = useState<ShopItem | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState<string | null>(null);

  const fetchProfile = async () => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/me`,
      {
        headers: { Authorization: `Bearer ${session?.accessToken}` },
      },
    );
    if (!res.ok) throw new Error(t("modals.error.default"));
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
        throw new Error(err.message || t("modals.error.default"));
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

  const handleBuyGold = async (packId: string) => {
    if (!session?.accessToken) return;
    setIsRedirecting(packId);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/checkout`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.accessToken}`,
          },
          body: JSON.stringify({ packId }),
        },
      );

      if (!res.ok) throw new Error("Erreur lors de la création du paiement");

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error(error);
      setErrorMessage(
        "Impossible de joindre la boutique. Réessayez plus tard.",
      );
      setIsRedirecting(null);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-900 text-white font-press">
      <Sidebar />

      <main className="flex-1 p-4 md:p-6 flex flex-col">
        <div className="flex justify-between items-center mb-6 mt-12 bg-gray-800 p-3 rounded-xl border-b-4 border-gray-600">
          <div className="flex items-center gap-3">
            <ShoppingBag className="text-yellow-400" size={24} />
            <h1 className="text-xl md:text-2xl font-bold text-yellow-400">
              {t("header.title")}
            </h1>
          </div>

          <div className="bg-gray-900 px-3 py-1 rounded-lg border-2 border-yellow-500 flex items-center gap-2 shadow-[0_0_10px_rgba(234,179,8,0.3)]">
            <span className="text-yellow-400 text-lg font-bold">
              {isLoading ? t("header.loading") : gold}
            </span>
            <Coins className="text-yellow-500" size={18} />
          </div>
        </div>

        <div className="space-y-8 pb-10">
          <div>
            <h2 className="text-lg text-yellow-400 mb-3 border-b border-yellow-800 pb-1 uppercase tracking-wider flex items-center gap-2">
              <Gem size={20} /> {t("treasury.title")}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {GOLD_PACKS.map((pack) => (
                <div
                  key={pack.id}
                  className={`bg-gradient-to-br ${pack.gradient} border-2 ${pack.border} rounded-lg p-4 flex items-center justify-between relative overflow-hidden group transition-all`}
                >
                  <div
                    className={`absolute -right-6 -top-6 w-24 h-24 rounded-full blur-xl transition-all ${pack.glow}`}
                  ></div>

                  <div className="flex flex-col gap-1 z-10">
                    <h3 className="font-bold text-yellow-100 text-sm">
                      {t(`treasury.packs.${pack.id}.name` as any)}
                    </h3>
                    <div className="flex items-center gap-2 text-yellow-400 font-bold text-xl">
                      {pack.amount} <Coins size={20} />
                    </div>
                    <span className="text-[10px] text-yellow-200/70">
                      {t(`treasury.packs.${pack.id}.desc` as any)}
                    </span>
                  </div>

                  <button
                    onClick={() => handleBuyGold(pack.id)}
                    disabled={!!isRedirecting}
                    className={`z-10 font-bold py-2 px-4 rounded-lg shadow-lg active:scale-95 transition-all flex items-center gap-1 text-sm cursor-pointer ${
                      pack.button
                    } ${
                      isRedirecting === pack.id ? "opacity-70 cursor-wait" : ""
                    }`}
                  >
                    {isRedirecting === pack.id ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : (
                      t(`treasury.packs.${pack.id}.price` as any)
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {(["FRAME", "TITLE", "THEME"] as const).map((catKey) => {
            const items = SHOP_ITEMS.filter((item) => item.category === catKey);
            if (items.length === 0) return null;

            return (
              <div key={catKey}>
                <h2 className="text-lg text-gray-400 mb-3 border-b border-gray-700 pb-1 uppercase tracking-wider">
                  {t(`categories.${catKey}` as any)}
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
                            {t(`items.${item.id}` as any)}
                          </h3>
                        </div>

                        <button
                          onClick={() => !isOwned && handleRequestBuy(item)}
                          disabled={isOwned || !canBuy || buyMutation.isPending}
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
                              <Check size={12} /> {t("actions.owned")}
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
          })}
        </div>
      </main>

      {isTutorialActive && tutorialStep === 10 && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end gap-4 p-6 justify-center md:justify-start">
          <div className="w-20 h-20 md:w-24 md:h-24 bg-[url('/tuto.png')] bg-contain bg-no-repeat flex-shrink-0" />
          <div className="bg-app-surface text-white p-4 rounded-lg shadow-lg border-2 border-app-accent max-w-sm w-full">
            <p className="mb-4">{t("tutorial.step1")}</p>
            <button
              onClick={() => {
                new Audio("/click-sound.wav").play().catch(() => {});
                endTutorial();
              }}
              className="px-4 py-2 bg-app-accent text-app-bg font-bold rounded hover:opacity-80 cursor-pointer w-full md:w-auto"
            >
              {tTasks("tutorial.finish")}
            </button>
          </div>
        </div>
      )}

      <RetroModal
        isOpen={!!itemToBuy}
        onClose={() => setItemToBuy(null)}
        title={t("modals.confirm.title")}
        footer={
          <>
            <button
              onClick={() => setItemToBuy(null)}
              className="px-4 py-2 text-gray-400 hover:text-white font-bold"
            >
              {t("actions.cancel")}
            </button>
            <button
              onClick={confirmBuy}
              disabled={buyMutation.isPending}
              className="px-6 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded flex items-center gap-2"
            >
              {buyMutation.isPending && (
                <Loader2 className="animate-spin" size={16} />
              )}
              {t("actions.buy")}
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
                {t("modals.confirm.question", {
                  name: t(`items.${itemToBuy.id}` as any),
                })}
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
        title={t("modals.success.title")}
        type="success"
        footer={
          <button
            onClick={() => setSuccessItem(null)}
            className="w-full px-6 py-2 bg-green-600 hover:bg-green-500 text-white font-bold rounded"
          >
            {t("actions.awesome")}
          </button>
        }
      >
        <div className="flex flex-col items-center gap-4 text-center">
          {successItem && (
            <SharePreview
              title={t("modals.success.shareTitle")}
              message={t("modals.success.shareMessage", {
                name: t(`items.${successItem.id}` as any),
              })}
              icon={successItem.icon}
              color={successItem.color}
            />
          )}
        </div>
      </RetroModal>

      <RetroModal
        isOpen={!!errorMessage}
        onClose={() => setErrorMessage(null)}
        title={t("modals.error.title")}
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
