import { useTranslations } from "next-intl";

export default function ProblemSection() {
  const t = useTranslations("Landing");

  return (
    <section className="reveal-section text-center max-w-4xl mx-auto relative px-4">
      <h2 className="text-2xl md:text-4xl font-bold mb-6 leading-[1.4] font-press text-white">
        {t.rich("problemTitle", {
          highlight: (chunks) => (
            <span className="text-yellow-400 drop-shadow-[2px_2px_0px_black] animate-pulse">
              {chunks}
            </span>
          ),
        })}
      </h2>
      <p className="text-sm md:text-lg text-gray-400 leading-relaxed md:leading-loose">
        {t("problemDesc")}
      </p>
    </section>
  );
}
