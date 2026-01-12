"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Suspense } from "react";

function VerifyContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );

  useEffect(() => {
    if (!token) {
      setStatus("error");
      return;
    }

    const verify = async () => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
        const res = await fetch(`${backendUrl}/api/auth/verify?token=${token}`);

        if (res.ok) {
          setStatus("success");
          setTimeout(() => router.push("/auth"), 3000);
        } else {
          setStatus("error");
        }
      } catch (error) {
        setStatus("error");
      }
    };

    verify();
  }, [token, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <div className="bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700 max-w-md w-full text-center">
        {status === "loading" && (
          <div className="flex flex-col items-center">
            <Loader2 className="w-16 h-16 text-blue-500 animate-spin mb-4" />
            <h2 className="text-xl font-bold">Vérification en cours...</h2>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center">
            <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
            <h2 className="text-2xl font-bold text-green-400 mb-2">
              Email Vérifié !
            </h2>
            <p className="text-gray-300 mb-4">
              Votre compte est maintenant actif.
            </p>
            <p className="text-sm text-gray-500">
              Redirection vers la connexion...
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center">
            <XCircle className="w-16 h-16 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-red-400 mb-2">
              Échec de la vérification
            </h2>
            <p className="text-gray-300 mb-4">
              Le lien est invalide ou a expiré.
            </p>
            <button
              onClick={() => router.push("/register")}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white"
            >
              Retour
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <VerifyContent />
    </Suspense>
  );
}
