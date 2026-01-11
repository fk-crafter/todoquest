"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { ArrowLeft } from "lucide-react";
import { useAudio } from "@/context/AudioContext";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Format d'email invalide"),
  password: z.string().min(1, "Le mot de passe est requis"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function AuthPage() {
  const router = useRouter();
  const { stopMusic } = useAudio();
  const [globalError, setGlobalError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setGlobalError("");

    const result = await signIn("credentials", {
      redirect: false,
      email: data.email,
      password: data.password,
    });

    if (result?.error) {
      setGlobalError("Email ou mot de passe incorrect");
    } else {
      stopMusic();
      router.push("/progress");
    }
  };

  const playSound = () => {
    const clickAudio = new Audio("/click-sound.wav");
    clickAudio.play();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center">
        Authentification
      </h1>

      {globalError && (
        <p className="text-red-500 font-bold mb-4">{globalError}</p>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4 bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-xs md:w-80"
      >
        <div className="flex flex-col gap-1">
          <input
            type="email"
            placeholder="Email"
            {...register("email")}
            className="p-2 rounded bg-gray-700 text-white w-full"
          />
          {errors.email && (
            <span className="text-red-400 text-xs">{errors.email.message}</span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <input
            type="password"
            placeholder="Mot de passe"
            {...register("password")}
            className="p-2 rounded bg-gray-700 text-white w-full"
          />
          {errors.password && (
            <span className="text-red-400 text-xs">
              {errors.password.message}
            </span>
          )}
        </div>

        <button
          onClick={playSound}
          type="submit"
          disabled={isSubmitting}
          className="p-2 bg-blue-500 hover:bg-blue-600 rounded text-white font-bold w-full disabled:opacity-50"
        >
          {isSubmitting ? "Connexion..." : "Connexion"}
        </button>
      </form>

      <div className="flex flex-col gap-2 mt-4 w-full max-w-xs md:w-80">
        <button
          type="button"
          onClick={() => {
            playSound();
            signIn("github", { callbackUrl: "/progress" });
          }}
          className="flex items-center justify-center gap-2 p-2 bg-gray-900 hover:bg-gray-700 text-white rounded w-full"
        >
          <FaGithub size={20} /> Connexion avec GitHub
        </button>

        <button
          type="button"
          onClick={() => {
            playSound();
            signIn("google", { callbackUrl: "/progress" });
          }}
          className="flex items-center justify-center gap-2 p-2 bg-orange-300 hover:bg-orange-400 text-white rounded w-full"
        >
          <FcGoogle size={20} /> Connexion avec Google
        </button>
      </div>

      <p className="mt-4 text-gray-300 text-center">
        Pas de compte ?{" "}
        <span
          onClick={() => {
            playSound();
            router.push("/register");
          }}
          className="text-blue-400 cursor-pointer hover:underline whitespace-nowrap"
        >
          Créer un compte
        </span>
      </p>

      <button
        type="button"
        onClick={() => {
          playSound();
          router.push("/");
        }}
        className="mt-6 flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-lg shadow-md transition-all text-sm px-4 py-2 w-full whitespace-nowrap md:text-lg md:px-6 md:py-3 md:w-auto"
      >
        <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" /> Retour à l&apos;accueil
      </button>
    </div>
  );
}
