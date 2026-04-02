"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

function VerifyContent() {
  const t = useTranslations("Verify");
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
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
            <h2 className="text-xl font-bold">{t("status.loading")}</h2>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center">
            <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
            <h2 className="text-2xl font-bold text-green-400 mb-2">
              {t("status.success.title")}
            </h2>
            <p className="text-gray-300 mb-4">
              {t("status.success.description")}
            </p>
            <p className="text-sm text-gray-500">
              {t("status.success.redirect")}
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center">
            <XCircle className="w-16 h-16 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-red-400 mb-2">
              {t("status.error.title")}
            </h2>
            <p className="text-gray-300 mb-4">
              {t("status.error.description")}
            </p>
            <button
              onClick={() => router.push("/register")}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white"
            >
              {t("status.error.button")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyPage() {
  const t = useTranslations("Verify");

  return (
    <Suspense fallback={<div>{t("fallback")}</div>}>
      <VerifyContent />
    </Suspense>
  );
}
