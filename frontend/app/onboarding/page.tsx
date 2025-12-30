"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { CheckCircle, ArrowLeft } from "lucide-react";

const MALE_AVATARS = ["char1.png", "char2.png", "char3.png"];
const FEMALE_AVATARS = ["char4.png", "char5.png", "char6.png"];

export default function OnboardingPage() {
  const { data: session, update } = useSession();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [pseudo, setPseudo] = useState("");
  const [selectedGender, setSelectedGender] = useState<
    "male" | "female" | null
  >(null);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session?.user?.name) setPseudo(session.user.name);
  }, [session]);

  const handleFinish = async () => {
    if (!pseudo || !selectedGender || !selectedAvatar) return;
    setLoading(true);

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
            gender: selectedGender,
            image: selectedAvatar,
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
          gender: selectedGender,
          image: selectedAvatar,
          isOnboarded: true,
        },
      });

      window.location.href = "/tasks";
    } catch (error) {
      console.error("Erreur onboarding:", error);
      setLoading(false);
    }
  };

  const selectGenderAndNext = (gender: "male" | "female") => {
    setSelectedGender(gender);
    setStep(3);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white font-press flex flex-col items-center justify-center p-4">
      <div className="bg-gray-800 border-4 border-gray-600 p-8 rounded-xl shadow-2xl w-full max-w-md relative transition-all">
        <div className="flex justify-center mb-6 gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2 w-1/3 rounded ${
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
              Tu es ?
            </h1>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => selectGenderAndNext("male")}
                className="p-6 rounded-xl border-4 border-gray-700 bg-gray-900 hover:border-blue-500 hover:bg-gray-800 transition-all flex flex-col items-center gap-2"
              >
                <span className="text-4xl">👨</span>
                <span className="font-bold text-blue-400">HOMME</span>
              </button>
              <button
                onClick={() => selectGenderAndNext("female")}
                className="p-6 rounded-xl border-4 border-gray-700 bg-gray-900 hover:border-pink-500 hover:bg-gray-800 transition-all flex flex-col items-center gap-2"
              >
                <span className="text-4xl">👩</span>
                <span className="font-bold text-pink-400">FEMME</span>
              </button>
            </div>
          </div>
        )}

        {step === 3 && selectedGender && (
          <div className="space-y-6 animate-fadeIn">
            <div
              className="flex items-center absolute top-4 left-4 cursor-pointer text-gray-400 hover:text-white"
              onClick={() => setStep(2)}
            >
              <ArrowLeft size={24} />
            </div>
            <h1 className="text-2xl text-yellow-400 text-center mt-2">
              Choisis ton héros
            </h1>

            <div className="grid grid-cols-3 gap-3">
              {(selectedGender === "male" ? MALE_AVATARS : FEMALE_AVATARS).map(
                (avatarFile) => (
                  <button
                    key={avatarFile}
                    onClick={() => setSelectedAvatar(avatarFile)}
                    className={`relative rounded-lg overflow-hidden border-4 transition-all group ${
                      selectedAvatar === avatarFile
                        ? "border-yellow-400 scale-105 shadow-[0_0_15px_rgba(250,204,21,0.5)]"
                        : "border-gray-700 hover:border-gray-500"
                    }`}
                  >
                    <img
                      src={`/${avatarFile}`}
                      alt="Avatar"
                      className="w-full h-auto bg-gray-700 pixelated"
                      style={{ imageRendering: "pixelated" }}
                    />
                    {selectedAvatar === avatarFile && (
                      <div className="absolute inset-0 bg-yellow-400/20 flex items-center justify-center">
                        <CheckCircle
                          className="text-yellow-400 drop-shadow-md"
                          size={32}
                        />
                      </div>
                    )}
                  </button>
                )
              )}
            </div>

            <button
              onClick={handleFinish}
              disabled={!selectedAvatar || loading}
              className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded font-bold mt-4 shadow-[0_4px_0_rgb(0,0,0,0.5)] active:shadow-none active:translate-y-1 transition-all"
            >
              {loading ? "INITIALISATION..." : "COMMENCER L'AVENTURE"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
