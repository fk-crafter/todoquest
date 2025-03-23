"use client";

import { useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { ArrowLeft } from "lucide-react";

export default function AuthPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (result?.error) {
      setError(result.error);
    } else {
      router.push("/progress");
    }
  };

  const playSound = () => {
    const clickAudio = new Audio("/click-sound.wav");
    clickAudio.play();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Authentification</h1>

      {error && <p className="text-red-500 font-bold">Compte non reconnu</p>}

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 bg-gray-800 p-6 rounded-lg shadow-lg w-80"
      >
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="p-2 rounded bg-gray-700 text-white w-full"
          required
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="p-2 rounded bg-gray-700 text-white w-full"
          required
        />
        <button
          onClick={playSound}
          type="submit"
          className="p-2 bg-blue-500 hover:bg-blue-600 rounded text-white font-bold w-full"
        >
          Connexion
        </button>
      </form>

      <div className="flex flex-col gap-2 mt-4 w-80">
        <button
          onClick={() => {
            playSound();
            signIn("github", { callbackUrl: "/progress" });
          }}
          className="flex items-center justify-center gap-2 p-2 bg-gray-900 hover:bg-gray-700 text-white rounded w-full"
        >
          <FaGithub size={20} /> Connexion avec GitHub
        </button>

        <button
          onClick={() => {
            playSound();
            signIn("google", { callbackUrl: "/progress" });
          }}
          className="flex items-center justify-center gap-2 p-2 bg-orange-300 hover:bg-orange-400 text-white rounded w-full"
        >
          <FcGoogle size={20} /> Connexion avec Google
        </button>
      </div>

      <p className="mt-4 text-gray-300">
        Pas de compte ?{" "}
        <span
          onClick={() => {
            playSound();
            router.push("/register");
          }}
          className="text-blue-400 cursor-pointer hover:underline"
        >
          Créer un compte
        </span>
      </p>

      <button
        onClick={() => {
          playSound();
          router.push("/");
        }}
        className="mt-6 flex items-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white text-lg font-bold rounded-lg shadow-md transition-all"
      >
        <ArrowLeft size={24} /> Retour à l'accueil
      </button>
    </div>
  );
}
