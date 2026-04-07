import { useTranslations } from "next-intl";
import { ScrollText, Swords, Crown } from "lucide-react";

export default function HowItWorksSection() {
  const t = useTranslations("Landing");

  return (
    <section className="reveal-section grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="bg-gray-900 p-6 md:p-8 rounded-xl border-2 border-blue-900 shadow-[4px_4px_0px_rgba(30,58,138,1)] hover:-translate-y-2 transition-transform duration-300 flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-blue-900/50 rounded-full flex items-center justify-center mb-6 border-2 border-blue-500">
          <ScrollText className="w-8 h-8 text-blue-400" />
        </div>
        <h3 className="text-lg md:text-xl font-bold text-blue-400 mb-4 font-press">
          {t("step1Title")}
        </h3>
        <p className="text-xs md:text-sm text-gray-400 leading-relaxed font-press">
          {t("step1Desc")}
        </p>
      </div>

      <div className="bg-gray-900 p-6 md:p-8 rounded-xl border-2 border-red-900 shadow-[4px_4px_0px_rgba(127,29,29,1)] hover:-translate-y-2 transition-transform duration-300 flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-red-900/50 rounded-full flex items-center justify-center mb-6 border-2 border-red-500">
          <Swords className="w-8 h-8 text-red-400" />
        </div>
        <h3 className="text-lg md:text-xl font-bold text-red-500 mb-4 font-press">
          {t("step2Title")}
        </h3>
        <p className="text-xs md:text-sm text-gray-400 leading-relaxed font-press">
          {t("step2Desc")}
        </p>
      </div>

      <div className="bg-gray-900 p-6 md:p-8 rounded-xl border-2 border-yellow-900 shadow-[4px_4px_0px_rgba(113,63,18,1)] hover:-translate-y-2 transition-transform duration-300 flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-yellow-900/50 rounded-full flex items-center justify-center mb-6 border-2 border-yellow-500">
          <Crown className="w-8 h-8 text-yellow-400" />
        </div>
        <h3 className="text-lg md:text-xl font-bold text-yellow-500 mb-4 font-press">
          {t("step3Title")}
        </h3>
        <p className="text-xs md:text-sm text-gray-400 leading-relaxed font-press">
          {t("step3Desc")}
        </p>
      </div>
    </section>
  );
}
