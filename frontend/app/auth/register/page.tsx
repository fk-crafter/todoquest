"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Name:", name, "Email:", email, "Password:", password);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Create an Account</h1>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 bg-gray-800 p-6 rounded-lg shadow-lg w-80"
      >
        <input
          type="text"
          placeholder="Username"
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
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="p-2 rounded bg-gray-700 text-white w-full"
          required
        />
        <button
          type="submit"
          className="p-2 bg-green-500 hover:bg-green-600 rounded text-white font-bold w-full"
        >
          Sign Up
        </button>
      </form>

      <p className="mt-4 text-gray-300">
        Already have an account?{" "}
        <span
          onClick={() => router.push("/auth")}
          className="text-blue-400 cursor-pointer hover:underline"
        >
          Log in
        </span>
      </p>
    </div>
  );
}
