"use client";

import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ArrowRight, LogOut } from "lucide-react";

export default function ProgressPage() {
  const { data: session } = useSession();
  const router = useRouter();

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-3xl font-bold mb-6">
          Veuillez vous connecter pour accéder à votre progression
        </h1>
      </div>
    );
  }

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold mb-6">
        Bienvenue, {session.user?.name} !
      </h1>
      <p className="text-xl ">Votre progression</p>
      <p className="text-lg">
        XP: <span className="font-bold">{session.user?.xp}</span> | Niveau:{" "}
        <span className="font-bold">{session.user?.level}</span>
      </p>

      <button
        onClick={() => router.push("/tasks")}
        className="mt-6 flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold rounded-lg shadow-md transition-all"
      >
        Accéder à la liste des tâches <ArrowRight size={24} />
      </button>

      <button
        onClick={handleLogout}
        className="mt-4 flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white text-lg font-bold rounded-lg shadow-md transition-all"
      >
        Se déconnecter <LogOut size={24} />
      </button>
    </div>
  );
}
