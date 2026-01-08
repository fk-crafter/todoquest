"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { ArrowLeft } from "lucide-react";

export default function OnboardingPage() {
  const { data: session, update } = useSession();

  const [step, setStep] = useState(1);
  const [pseudo, setPseudo] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session?.user?.name) setPseudo(session.user.name);
  }, [session]);

  const handleFinish = async (gender: "male" | "female") => {
    if (!pseudo) return;
    setLoading(true);

    const avatarImage = gender === "male" ? "char-male.png" : "char-female.png";

    try {
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
            gender: gender,
            image: avatarImage,
            isOnboarded: true,
          }),
        }
      );

      if (!res.ok) throw new Error("Erreur sauvegarde");

      await update({
        ...session,
        user: {
          ...session?.user,
          name: pseudo,
          gender: gender,
          image: avatarImage,
          isOnboarded: true,
        },
      });

      window.location.href = "/tasks";
    } catch (error) {
      console.error("Erreur onboarding:", error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white font-press flex flex-col items-center justify-center p-4">
      <div className="bg-gray-800 border-4 border-gray-600 p-8 rounded-xl shadow-2xl w-full max-w-md relative transition-all">
        <div className="flex justify-center mb-6 gap-2">
          {[1, 2].map((s) => (
            <div
              key={s}
              className={`h-2 w-1/2 rounded ${
                step >= s ? "bg-yellow-400" : "bg-gray-700"
              }`}
            />
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-6 animate-fadeIn">
            <h1 className="text-2xl text-yellow-400 text-center">Ton Pseudo</h1>
            <input
              type="text"
              value={pseudo}
              onChange={(e) => setPseudo(e.target.value)}
              placeholder="Héros..."
              className="w-full bg-gray-900 border-2 border-gray-600 rounded p-4 text-center text-xl text-white focus:border-yellow-400 focus:outline-none placeholder-gray-600"
            />
            <button
              onClick={() => setStep(2)}
              disabled={!pseudo.trim()}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded font-bold shadow-[0_4px_0_rgb(0,0,0,0.5)] active:shadow-none active:translate-y-1 transition-all"
            >
              SUIVANT
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-fadeIn">
            <div
              className="flex items-center absolute top-4 left-4 cursor-pointer text-gray-400 hover:text-white"
              onClick={() => setStep(1)}
            >
              <ArrowLeft size={24} />
            </div>
            <h1 className="text-2xl text-yellow-400 text-center mt-2">
              Choisis ton Héros
            </h1>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleFinish("male")}
                disabled={loading}
                className="group p-4 rounded-xl border-4 border-gray-700 bg-gray-900 hover:border-blue-500 hover:bg-gray-800 transition-all flex flex-col items-center gap-3 relative overflow-hidden"
              >
                <div className="w-full aspect-square bg-gray-800 rounded-lg overflow-hidden border-2 border-gray-600 group-hover:scale-105 transition-transform">
                  <img
                    src="/char-male.png"
                    alt="Homme"
                    className="w-full h-full object-cover"
                    style={{ imageRendering: "pixelated" }}
                  />
                </div>
                <span className="font-bold text-blue-400 text-lg">HOMME</span>
                {loading && (
                  <div className="absolute inset-0 bg-black/50 z-10" />
                )}
              </button>

              <button
                onClick={() => handleFinish("female")}
                disabled={loading}
                className="group p-4 rounded-xl border-4 border-gray-700 bg-gray-900 hover:border-pink-500 hover:bg-gray-800 transition-all flex flex-col items-center gap-3 relative overflow-hidden"
              >
                <div className="w-full aspect-square bg-gray-800 rounded-lg overflow-hidden border-2 border-gray-600 group-hover:scale-105 transition-transform">
                  <img
                    src="/char-female.png"
                    alt="Femme"
                    className="w-full h-full object-cover"
                    style={{ imageRendering: "pixelated" }}
                  />
                </div>
                <span className="font-bold text-pink-400 text-lg">FEMME</span>
                {loading && (
                  <div className="absolute inset-0 bg-black/50 z-10" />
                )}
              </button>
            </div>

            {loading && (
              <p className="text-center text-gray-400 text-xs animate-pulse">
                Création du personnage...
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
