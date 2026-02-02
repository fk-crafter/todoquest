"use client";

import { useEffect, useState } from "react";
import { Smartphone, Share, PlusSquare } from "lucide-react";
import RetroModal from "@/components/ui/RetroModal";

export default function InstallPWA() {
  const [showModal, setShowModal] = useState(false);
  const [isInstalled, setIsInstalled] = useState(true);

  useEffect(() => {
    const checkStandalone = () => {
      const isStandaloneIOS = (window.navigator as any).standalone === true;
      const isStandaloneGeneric =
        window.matchMedia &&
        window.matchMedia("(display-mode: standalone)").matches;

      if (isStandaloneIOS || isStandaloneGeneric) {
        setIsInstalled(true);
      } else {
        setIsInstalled(false);
      }
    };
    setTimeout(checkStandalone, 500);
  }, []);

  if (isInstalled) return null;

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="md:hidden absolute top-4 right-18 flex items-center gap-1.5 px-3 py-2.5 bg-black/40 hover:bg-black/60 text-gray-200 text-[10px] font-bold rounded border border-white/20 backdrop-blur-sm font-press transition-all active:scale-95"
      >
        <Smartphone size={12} />
        Installer l'app
      </button>

      <RetroModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Installer l'App"
      >
        <div className="space-y-6 text-center font-press">
          <p className="text-xs text-gray-400 leading-relaxed">
            Installe TodoQuest sur ton écran d&apos;accueil pour jouer en plein
            écran !
          </p>

          <div className="bg-gray-800 p-4 rounded-lg border-2 border-gray-700 text-left space-y-4 text-xs">
            <div className="flex items-start gap-3">
              <div className="bg-gray-700 p-2 rounded-md border border-gray-600 text-blue-400 shrink-0">
                <Share size={18} />
              </div>
              <div>
                <p className="font-bold text-yellow-400 mb-1 uppercase">
                  1. Appuie sur Partager
                </p>
                <p className="text-gray-400 text-[10px] leading-tight">
                  L'icône carrée avec une flèche, en bas de Safari ou dans le
                  menu Chrome.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-gray-700 p-2 rounded-md border border-gray-600 text-gray-300 shrink-0">
                <PlusSquare size={18} />
              </div>
              <div>
                <p className="font-bold text-yellow-400 mb-1 uppercase">
                  2. Sur l&apos;écran d&apos;accueil
                </p>
                <p className="text-gray-400 text-[10px] leading-tight">
                  Cherche &quot;Ajouter à l&apos;écran d&apos;accueil&quot;.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowModal(false)}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg border-[3px] border-black shadow-[3px_3px_0px_black] active:translate-y-[2px] active:shadow-[1px_1px_0px_black] transition-all uppercase"
          >
            OK, J&apos;ai compris
          </button>
        </div>
      </RetroModal>
    </>
  );
}
