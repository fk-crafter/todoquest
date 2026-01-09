"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { CheckCircle, Swords, Wand2, Target } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

const CLASS_OPTIONS = {
  male: [
    {
      id: "ARCHER",
      name: "Archer",
      image: "char1.png",
      icon: Target,
      desc: "Maître de la distance, rapide et précis.",
      color: "text-green-400 border-green-500",
    },
    {
      id: "MAGE",
      name: "Mage",
      image: "char2.png",
      icon: Wand2,
      desc: "Manipule les éléments pour détruire ses ennemis.",
      color: "text-purple-400 border-purple-500",
    },
    {
      id: "SWORDSMAN",
      name: "Escrimeur",
      image: "char3.png",
      icon: Swords,
      desc: "Combattant au corps-à-corps, résistant et puissant.",
      color: "text-red-400 border-red-500",
    },
  ],
  female: [
    {
      id: "ARCHER",
      name: "Archère",
      image: "char4.png",
      icon: Target,
      desc: "Maîtresse de la distance, rapide et précise.",
      color: "text-green-400 border-green-500",
    },
    {
      id: "MAGE",
      name: "Magicienne",
      image: "char5.png",
      icon: Wand2,
      desc: "Manipule les éléments pour détruire ses ennemis.",
      color: "text-purple-400 border-purple-500",
    },
    {
      id: "SWORDSMAN",
      name: "Escrimeuse",
      image: "char6.png",
      icon: Swords,
      desc: "Combattante au corps-à-corps, résistante et puissante.",
      color: "text-red-400 border-red-500",
    },
  ],
};

interface Props {
  userGender: "male" | "female";
  userName: string;
}

export default function ClassSelectionModal({ userGender, userName }: Props) {
  const { data: session, update } = useSession();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [selectedClass, setSelectedClass] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const safeGender = userGender === "female" ? "female" : "male";
  const options = CLASS_OPTIONS[safeGender];

  const handleConfirmClass = async () => {
    if (!selectedClass || !session?.accessToken) return;
    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/me`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.accessToken}`,
          },
          body: JSON.stringify({
            class: selectedClass.id,
            image: selectedClass.image,
          }),
        }
      );

      if (!res.ok) throw new Error("Erreur lors du changement de classe");

      await update({
        ...session,
        user: {
          ...session?.user,
          image: selectedClass.image,
        },
      });

      await queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      await queryClient.invalidateQueries({ queryKey: ["profile"] });

      window.location.reload();
    } catch (error) {
      console.error(error);
      alert("Une erreur est survenue. Réessaie !");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-press animate-fadeIn">
      <div className="bg-gray-800 border-4 border-yellow-500 rounded-xl p-6 w-full max-w-2xl shadow-[0_0_30px_rgba(234,179,8,0.3)] relative overflow-hidden">
        {step === 1 && (
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-32 h-32 md:w-40 md:h-40 bg-gray-700 border-4 border-blue-400 rounded-full overflow-hidden flex-shrink-0">
              <img
                src="/char-male.png"
                alt="Guide"
                className="w-full h-full object-cover pixelated grayscale contrast-125"
              />
            </div>
            <div className="flex-1 space-y-4 text-center md:text-left">
              <h2 className="text-xl text-yellow-400 font-bold">
                Guide de l'Aventure
              </h2>
              <div className="bg-gray-900 border-2 border-gray-600 p-4 rounded-lg text-white text-sm md:text-base leading-relaxed">
                <p>
                  "Halte là, <span className="text-yellow-300">{userName}</span>{" "}
                  ! Je t'observe depuis tes débuts..."
                </p>
                <p className="mt-3">
                  "Tu n'es plus un simple aventurier. Ton âme réclame plus de
                  puissance. Il est temps pour toi de choisir ta véritable voie
                  !"
                </p>
              </div>
              <button
                onClick={() => setStep(2)}
                className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-2 px-6 rounded border-b-4 border-yellow-700 active:border-b-0 active:translate-y-1 transition-all ml-auto block"
              >
                JE SUIS PRÊT !
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h1 className="text-2xl md:text-3xl text-yellow-400 text-center font-bold drop-shadow-md">
              Choisis ta Destinée
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {options.map((option) => {
                const Icon = option.icon;
                const isSelected = selectedClass?.id === option.id;
                return (
                  <button
                    key={option.id}
                    onClick={() => setSelectedClass(option)}
                    className={`relative rounded-xl overflow-hidden border-4 transition-all group bg-gray-900 flex flex-col h-full text-left
                      ${
                        isSelected
                          ? `${option.color} scale-105 shadow-[0_0_15px_rgba(255,255,255,0.2)]`
                          : "border-gray-700 hover:border-gray-500 hover:bg-gray-850"
                      }
                    `}
                  >
                    <div className="h-40 w-full bg-gray-800 relative overflow-hidden border-b-2 border-gray-700">
                      <img
                        src={`/${option.image}`}
                        alt={option.name}
                        className="w-full h-full object-cover pixelated group-hover:scale-110 transition-transform duration-300"
                        style={{ imageRendering: "pixelated" }}
                      />
                      <div
                        className={`absolute top-2 right-2 p-2 rounded-full bg-gray-900/80 ${option.color}`}
                      >
                        <Icon size={20} />
                      </div>
                      {isSelected && (
                        <div className="absolute inset-0 bg-yellow-400/20 flex items-center justify-center z-10 animate-pulse">
                          <CheckCircle
                            className="text-yellow-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
                            size={40}
                          />
                        </div>
                      )}
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                      <h3
                        className={`text-lg font-bold mb-1 ${
                          option.color.split(" ")[0]
                        }`}
                      >
                        {option.name}
                      </h3>
                      <p className="text-gray-400 text-xs leading-tight">
                        {option.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleConfirmClass}
              disabled={!selectedClass || loading}
              className="w-full md:w-2/3 mx-auto block bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-lg font-bold text-lg shadow-[0_4px_0_rgb(0,0,0,0.5)] active:shadow-none active:translate-y-1 transition-all"
            >
              {loading
                ? "TRANSFORMATION..."
                : selectedClass
                ? `DEVENIR ${selectedClass.name.toUpperCase()}`
                : "CHOISIS UNE CLASSE"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
