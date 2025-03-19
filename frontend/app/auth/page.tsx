"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";

export default function AuthPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Email:", email, "Password:", password);
  };

  const handleOAuth = (provider: string) => {
    console.log(`OAuth with ${provider}`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Authentication</h1>

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
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="p-2 rounded bg-gray-700 text-white w-full"
          required
        />
        <button
          type="submit"
          className="p-2 bg-blue-500 hover:bg-blue-600 rounded text-white font-bold w-full"
        >
          Login
        </button>
      </form>

      <div className="flex flex-col gap-2 mt-4 w-80">
        <button
          onClick={() => handleOAuth("github")}
          className="flex items-center justify-center gap-2 p-2 bg-gray-900 hover:bg-gray-700 text-white rounded w-full"
        >
          <FaGithub size={20} /> Login with GitHub
        </button>
        <button
          onClick={() => handleOAuth("google")}
          className="flex items-center justify-center gap-2 p-2 bg-orange-300 hover:bg-orange-400 text-white rounded w-full"
        >
          <FcGoogle size={20} /> Login with Google
        </button>
      </div>

      <p className="mt-4 text-gray-300">
        Don't have an account?{" "}
        <span
          onClick={() => router.push("/auth/register")}
          className="text-blue-400 cursor-pointer hover:underline"
        >
          Create an account
        </span>
      </p>
    </div>
  );
}
