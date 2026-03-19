import { useTranslations } from "next-intl";

export default function SocialProofSection() {
  const t = useTranslations("Landing");

  return (
    <section className="reveal-section bg-gray-800/50 p-8 md:p-12 rounded-3xl border border-gray-700">
      <h2 className="text-2xl md:text-3xl font-bold mb-10 text-center font-press text-blue-400">
        {t("socialTitle")}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-900 p-6 rounded-lg border-l-4 border-yellow-400 relative">
          <p className="text-gray-300 italic mb-4">{t("review1")}</p>
          <p className="text-yellow-400 text-sm font-bold font-press">
            {t("author1")}
          </p>
        </div>
        <div className="bg-gray-900 p-6 rounded-lg border-l-4 border-blue-400 relative">
          <p className="text-gray-300 italic mb-4">{t("review2")}</p>
          <p className="text-blue-400 text-sm font-bold font-press">
            {t("author2")}
          </p>
        </div>
      </div>
    </section>
  );
}
