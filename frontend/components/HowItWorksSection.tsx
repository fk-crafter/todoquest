import { useTranslations } from "next-intl";

export default function HowItWorksSection() {
  const t = useTranslations("Landing");

  return (
    <section className="reveal-section grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="bg-gray-800 p-8 rounded-xl border-2 border-gray-700 text-center hover:border-blue-400 transition-colors">
        <div className="text-5xl mb-4">📝</div>
        <h3 className="text-xl font-bold text-white mb-2">{t("step1Title")}</h3>
        <p className="text-gray-400 text-sm">{t("step1Desc")}</p>
      </div>
      <div className="bg-gray-800 p-8 rounded-xl border-2 border-gray-700 text-center hover:border-red-400 transition-colors">
        <div className="text-5xl mb-4">⚔️</div>
        <h3 className="text-xl font-bold text-white mb-2">{t("step2Title")}</h3>
        <p className="text-gray-400 text-sm">{t("step2Desc")}</p>
      </div>
      <div className="bg-gray-800 p-8 rounded-xl border-2 border-gray-700 text-center hover:border-yellow-400 transition-colors">
        <div className="text-5xl mb-4">💰</div>
        <h3 className="text-xl font-bold text-white mb-2">{t("step3Title")}</h3>
        <p className="text-gray-400 text-sm">{t("step3Desc")}</p>
      </div>
    </section>
  );
}
