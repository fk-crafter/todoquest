"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      if (!backendUrl) {
        throw new Error("Backend URL is not defined");
      }

      const res = await fetch(`${backendUrl}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Registration failed");
      }

      setShowSuccessModal(true);
      setTimeout(() => {
        router.push("/auth");
      }, 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const playSound = () => {
    const clickAudio = new Audio("/click-sound.wav");
    clickAudio.play();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen relative">
      <h1 className="text-3xl font-bold mb-6">Créer un compte</h1>

      {error && <p className="text-red-400">{error}</p>}

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 bg-gray-800 p-6 rounded-lg shadow-lg w-80"
      >
        <input
          type="text"
          placeholder="Pseudo"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="p-2 rounded bg-gray-700 text-white w-full"
          required
        />
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
          disabled={loading}
          className="p-2 bg-green-500 hover:bg-green-600 rounded text-white font-bold w-full"
        >
          {loading ? "Inscription en cours..." : "Inscription"}
        </button>
      </form>

      <p className="mt-4 text-gray-300">
        Vous avez déjà un compte ?{" "}
        <span
          onClick={() => {
            playSound();
            router.push("/auth");
          }}
          className="text-blue-400 cursor-pointer hover:underline"
        >
          Connexion
        </span>
      </p>

      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
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
