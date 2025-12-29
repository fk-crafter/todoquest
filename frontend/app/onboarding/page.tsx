"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { User as UserIcon, CheckCircle, ArrowRight } from "lucide-react"; // J'ai viré les épées/baguettes

export default function OnboardingPage() {
  const { data: session, update } = useSession();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [pseudo, setPseudo] = useState("");
  const [selectedGender, setSelectedGender] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session?.user?.name) setPseudo(session.user.name);
  }, [session]);

  const getAvatarPreview = (gender: string) => {
    const seed = pseudo || "Hero";
    return `https://api.dicebear.com/9.x/pixel-art/svg?seed=${seed}-${gender}`;
  };

  const handleFinish = async () => {
    if (!pseudo || !selectedGender) return;
    setLoading(true);

    try {
      // 1. Sauvegarde en base de données
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/me`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.accessToken}`,
          },
          body: JSON.stringify({
            name: pseudo,
            gender: selectedGender,
            isOnboarded: true,
          }),
        }
      );

      if (!res.ok) throw new Error("Erreur sauvegarde");

      // 2. 👇 LE FIX EST ICI : On force la mise à jour de la session locale
      // Sans ça, le "OnboardingGuard" croit toujours que t'es nouveau et te re-bloque.
      await update({
        ...session,
        user: {
          ...session?.user,
          name: pseudo,
          gender: selectedGender,
          isOnboarded: true, // C'est CA qui manquait !
        },
      });

      // 3. Redirection propre
      // On force un rechargement complet pour être sûr
      window.location.href = "/tasks";
    } catch (error) {
      console.error("Erreur onboarding:", error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white font-press flex flex-col items-center justify-center p-4">
      <div className="bg-gray-800 border-4 border-gray-600 p-8 rounded-xl shadow-2xl w-full max-w-md relative">
        {step === 1 && (
          <div className="space-y-6">
            <h1 className="text-2xl text-yellow-400 text-center">Ton Pseudo</h1>
            <input
              type="text"
              value={pseudo}
              onChange={(e) => setPseudo(e.target.value)}
              className="w-full bg-gray-900 border-2 border-gray-600 rounded p-4 text-center text-xl text-white focus:border-yellow-400 focus:outline-none"
            />
            <button
              onClick={() => setStep(2)}
              disabled={!pseudo.trim()}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded font-bold"
            >
              Suivant
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h1 className="text-2xl text-yellow-400 text-center">
              Ton Personnage
            </h1>

            <div className="grid grid-cols-2 gap-4">
              {[
                { id: "male", label: "HOMME" },
                { id: "female", label: "FEMME" },
              ].map((style) => (
                <button
                  key={style.id}
                  onClick={() => setSelectedGender(style.id)}
                  className={`relative p-4 rounded-xl border-4 transition-all flex flex-col items-center gap-3 ${
                    selectedGender === style.id
                      ? "bg-gray-700 border-yellow-400 scale-105"
                      : "bg-gray-900 border-gray-700 hover:border-gray-500"
                  }`}
                >
                  <div className="w-20 h-20 rounded bg-gray-800 overflow-hidden">
                    <img src={getAvatarPreview(style.id)} alt={style.label} />
                  </div>
                  <span className="font-bold">{style.label}</span>
                  {selectedGender === style.id && (
                    <CheckCircle
                      className="absolute top-2 right-2 text-yellow-400"
                      size={20}
                    />
                  )}
                </button>
              ))}
            </div>

            <button
              onClick={handleFinish}
              disabled={!selectedGender || loading}
              className="w-full bg-green-600 hover:bg-green-500 text-white py-4 rounded font-bold mt-4"
            >
              {loading ? "Chargement..." : "VALIDER ET JOUER"}
            </button>
            <button
              onClick={() => setStep(1)}
              className="w-full text-center text-gray-500 text-sm mt-2 hover:text-white"
            >
              Retour
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
