"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(2, "Le pseudo doit faire au moins 2 caractères"),
  email: z.string().email("Format d'email invalide"),
  password: z
    .string()
    .min(6, "Le mot de passe doit faire au moins 6 caractères"),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setError("");

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      if (!backendUrl) throw new Error("Backend URL is not defined");

      const res = await fetch(`${backendUrl}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const resData = await res.json();

      if (!res.ok) {
        throw new Error(resData.message || "Registration failed");
      }

      setShowSuccessModal(true);
      setTimeout(() => {
        router.push("/auth");
      }, 3000);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Une erreur inconnue est survenue");
      }
    }
  };

  const playSound = () => {
    const clickAudio = new Audio("/click-sound.wav");
    clickAudio.play();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen relative p-4">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center">
        Créer un compte
      </h1>

      {error && (
        <p className="text-red-400 mb-4 font-bold text-center">{error}</p>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4 bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-xs md:w-80"
      >
        <div className="flex flex-col gap-1">
          <input
            type="text"
            placeholder="Pseudo"
            {...register("name")}
            className="p-2 rounded bg-gray-700 text-white w-full"
          />
          {errors.name && (
            <span className="text-red-400 text-xs">{errors.name.message}</span>
          )}
        </div>

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
          className="p-2 bg-green-500 hover:bg-green-600 rounded text-white font-bold w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Inscription..." : "Inscription"}
        </button>
      </form>

      <p className="mt-4 text-gray-300 text-center">
        Vous avez déjà un compte ?{" "}
        <span
          onClick={() => {
            playSound();
            router.push("/auth");
          }}
          className="text-blue-400 cursor-pointer hover:underline whitespace-nowrap"
        >
          Connexion
        </span>
      </p>

      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 text-white p-6 rounded-lg shadow-lg w-full max-w-md text-center border border-gray-600">
            <h2 className="text-2xl font-bold mb-4 text-green-400">
              Inscription réussie !
            </h2>
            <p className="mb-2 leading-relaxed">Ton compte a bien été créé.</p>
            <p className="text-sm text-gray-400 italic">
              Redirection en cours...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
