"use client";

import { useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import Sidebar from "@/components/Sidebar";
import RetroModal from "@/components/ui/RetroModal";
import SharePreview from "@/components/SharePreview";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useTutorial } from "@/context/TutorialContext";
import { Coins, Gem, Loader2, AlertCircle } from "lucide-react";

import { SHOP_ITEMS, GOLD_PACKS, ShopItem } from "@/components/shop/constants";
import ShopHeader from "@/components/shop/ShopHeader";
import GoldPackCard from "@/components/shop/GoldPackCard";
import ShopItemCard from "@/components/shop/ShopItemCard";

type ValidTranslationKey = Parameters<ReturnType<typeof useTranslations>>[0];

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

  const groupedItems = useMemo(() => {
    return {
      POTION: SHOP_ITEMS.filter((i) => i.category === "POTION"),
      FRAME: SHOP_ITEMS.filter((i) => i.category === "FRAME"),
      TITLE: SHOP_ITEMS.filter((i) => i.category === "TITLE"),
      THEME: SHOP_ITEMS.filter((i) => i.category === "THEME"),
    };
  }, []);

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
          body: JSON.stringify({ itemId: item.id, price: item.price }),
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
    onError: (error: Error) => {
      setItemToBuy(null);
      setErrorMessage(error.message);
    },
  });

  const handleRequestBuy = (item: ShopItem) => {
    if (!session?.accessToken || gold < item.price) return;
    setItemToBuy(item);
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
      if (data.url) window.location.href = data.url;
    } catch (error) {
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
        <ShopHeader gold={gold} isLoading={isLoading} />

        <div className="space-y-8 pb-10">
          <div>
            <h2 className="text-lg text-yellow-400 mb-3 border-b border-yellow-800 pb-1 uppercase tracking-wider flex items-center gap-2">
              <Gem size={20} /> {t("treasury.title")}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {GOLD_PACKS.map((pack) => (
                <GoldPackCard
                  key={pack.id}
                  pack={pack}
                  onBuy={handleBuyGold}
                  isRedirecting={isRedirecting === pack.id}
                />
              ))}
            </div>
          </div>

          {(Object.keys(groupedItems) as Array<keyof typeof groupedItems>).map(
            (catKey) => {
              const items = groupedItems[catKey];
              if (items.length === 0) return null;

              return (
                <div key={catKey}>
                  <h2 className="text-lg text-gray-400 mb-3 border-b border-gray-700 pb-1 uppercase tracking-wider">
                    {t(`categories.${catKey}` as ValidTranslationKey)}
                  </h2>

                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {items.map((item) => (
                      <ShopItemCard
                        key={item.id}
                        item={item}
                        isOwned={
                          item.category === "POTION"
                            ? false
                            : userInventory.includes(item.id)
                        }
                        canBuy={gold >= item.price}
                        isProcessing={
                          buyMutation.isPending &&
                          buyMutation.variables?.id === item.id
                        }
                        onBuyRequest={handleRequestBuy}
                      />
                    ))}
                  </div>
                </div>
              );
            },
          )}
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
              onClick={() => itemToBuy && buyMutation.mutate(itemToBuy)}
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
