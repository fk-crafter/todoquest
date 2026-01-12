"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import Image from "next/image";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const onboardingSchema = z.object({
  pseudo: z
    .string()
    .min(2, "Le pseudo doit faire au moins 2 caractères")
    .max(15, "Le pseudo est trop long (max 15)")
    .regex(/^[a-zA-Z0-9_]+$/, "Caractères alphanumériques seulement"),
});

type OnboardingForm = z.infer<typeof onboardingSchema>;

export default function OnboardingPage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [step, setStep] = useState(1);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<OnboardingForm>({
    resolver: zodResolver(onboardingSchema),
    mode: "onChange",
  });

  const pseudoValue = watch("pseudo");

  useEffect(() => {
    if (session?.user?.name) {
      setValue("pseudo", session.user.name);
    }
  }, [session, setValue]);

  const playSound = () => {
    const clickAudio = new Audio("/click-sound.wav");
    clickAudio.play().catch(() => {});
  };

  const mutation = useMutation({
    mutationFn: async ({
      name,
      gender,
    }: {
      name: string;
      gender: "male" | "female";
    }) => {
      const avatarImage =
        gender === "male" ? "char-male.png" : "char-female.png";

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/me`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.accessToken}`,
          },
          body: JSON.stringify({
            name,
            gender,
            image: avatarImage,
            isOnboarded: true,
          }),
        }
      );

      if (!res.ok) throw new Error("Erreur lors de la sauvegarde");

      await update({
        ...session,
        user: {
          ...session?.user,
          name,
          gender,
          image: avatarImage,
          isOnboarded: true,
        },
      });
    },
    onSuccess: () => {
      router.push("/tasks");
      router.refresh();
    },
    onError: (error) => {
      console.error("Erreur onboarding:", error);
      alert("Une erreur est survenue, réessaie !");
    },
  });

  const handleNextStep = () => {
    playSound();
    setStep(2);
  };

  const handleFinish = (gender: "male" | "female") => {
    playSound();
    mutation.mutate({ name: pseudoValue, gender });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white font-press flex flex-col items-center justify-center p-4">
      <div className="bg-gray-800 border-4 border-gray-600 p-8 rounded-xl shadow-2xl w-full max-w-md relative transition-all">
        <div className="flex justify-center mb-6 gap-2">
          {[1, 2].map((s) => (
            <div
              key={s}
              className={`h-2 w-1/2 rounded transition-colors duration-300 ${
                step >= s ? "bg-yellow-400" : "bg-gray-700"
              }`}
            />
          ))}
        </div>

        {step === 1 && (
          <form
            onSubmit={handleSubmit(handleNextStep)}
            className="space-y-6 animate-fadeIn"
          >
            <h1 className="text-2xl text-yellow-400 text-center">Ton Pseudo</h1>

            <div className="space-y-2">
              <input
                {...register("pseudo")}
                type="text"
                placeholder="Héros..."
                className="w-full bg-gray-900 border-2 border-gray-600 rounded p-4 text-center text-xl text-white focus:border-yellow-400 focus:outline-none placeholder-gray-600 transition-colors"
              />
              {errors.pseudo && (
                <p className="text-red-400 text-xs text-center">
                  {errors.pseudo.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={!isValid}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded font-bold shadow-[0_4px_0_rgb(0,0,0,0.5)] active:shadow-none active:translate-y-1 transition-all"
            >
              SUIVANT
            </button>
          </form>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-fadeIn">
            <button
              className="absolute top-4 left-4 text-gray-400 hover:text-white transition-colors"
              onClick={() => {
                playSound();
                setStep(1);
              }}
              type="button"
            >
              <ArrowLeft size={24} />
            </button>

            <h1 className="text-2xl text-yellow-400 text-center mt-2">
              Choisis ton Héros
            </h1>

            <div className="grid grid-cols-2 gap-4">
              <CharacterCard
                gender="male"
                imgSrc="/char-male.png"
                label="HOMME"
                colorClass="text-blue-400"
                borderColorClass="hover:border-blue-500"
                onClick={() => handleFinish("male")}
                isLoading={mutation.isPending}
              />

              <CharacterCard
                gender="female"
                imgSrc="/char-female.png"
                label="FEMME"
                colorClass="text-pink-400"
                borderColorClass="hover:border-pink-500"
                onClick={() => handleFinish("female")}
                isLoading={mutation.isPending}
              />
            </div>

            {mutation.isPending && (
              <div className="flex items-center justify-center gap-2 text-gray-400 text-xs animate-pulse">
                <Loader2 className="animate-spin" size={16} />
                Création du personnage...
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function CharacterCard({
  imgSrc,
  label,
  colorClass,
  borderColorClass,
  onClick,
  isLoading,
  gender,
}: {
  imgSrc: string;
  label: string;
  colorClass: string;
  borderColorClass: string;
  onClick: () => void;
  isLoading: boolean;
  gender: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className={`group p-4 rounded-xl border-4 border-gray-700 bg-gray-900 ${borderColorClass} hover:bg-gray-800 transition-all flex flex-col items-center gap-3 relative overflow-hidden`}
    >
      <div className="w-full aspect-square bg-gray-800 rounded-lg overflow-hidden border-2 border-gray-600 group-hover:scale-105 transition-transform relative">
        <Image
          src={imgSrc}
          alt={gender}
          fill
          sizes="(max-width: 768px) 100vw, 200px"
          className="object-cover"
          style={{ imageRendering: "pixelated" }}
        />
      </div>
      <span className={`font-bold ${colorClass} text-lg`}>{label}</span>
      {isLoading && <div className="absolute inset-0 bg-black/50 z-10" />}
    </button>
  );
}
