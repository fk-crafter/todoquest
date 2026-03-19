import { useTranslations } from "next-intl";

export default function ProblemSection() {
  const t = useTranslations("Landing");

  return (
    <section className="reveal-section text-center max-w-3xl mx-auto">
      <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 font-press">
        {t("problemTitle")}
        <span className="text-yellow-400">{t("problemHighlight")}</span>.
      </h2>
      <p className="text-lg md:text-xl text-gray-400 leading-relaxed">
        {t("problemDesc")}
      </p>
    </section>
  );
}
