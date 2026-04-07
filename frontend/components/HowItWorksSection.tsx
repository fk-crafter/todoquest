import { useTranslations } from "next-intl";
import { ScrollText, Swords, Crown } from "lucide-react";

type TranslationKey = Parameters<ReturnType<typeof useTranslations>>[0];

const STEPS = [
  {
    id: "step1",
    titleKey: "step1Title" as TranslationKey,
    descKey: "step1Desc" as TranslationKey,
    icon: ScrollText,
    styles: {
      border: "border-blue-900",
      shadow: "shadow-[4px_4px_0px_rgba(30,58,138,1)]",
      iconBg: "bg-blue-900/50",
      iconBorder: "border-blue-500",
      iconColor: "text-blue-400",
      titleColor: "text-blue-400",
    },
  },
  {
    id: "step2",
    titleKey: "step2Title" as TranslationKey,
    descKey: "step2Desc" as TranslationKey,
    icon: Swords,
    styles: {
      border: "border-red-900",
      shadow: "shadow-[4px_4px_0px_rgba(127,29,29,1)]",
      iconBg: "bg-red-900/50",
      iconBorder: "border-red-500",
      iconColor: "text-red-400",
      titleColor: "text-red-500",
    },
  },
  {
    id: "step3",
    titleKey: "step3Title" as TranslationKey,
    descKey: "step3Desc" as TranslationKey,
    icon: Crown,
    styles: {
      border: "border-yellow-900",
      shadow: "shadow-[4px_4px_0px_rgba(113,63,18,1)]",
      iconBg: "bg-yellow-900/50",
      iconBorder: "border-yellow-500",
      iconColor: "text-yellow-400",
      titleColor: "text-yellow-500",
    },
  },
];

export default function HowItWorksSection() {
  const t = useTranslations("Landing");

  return (
    <section className="reveal-section grid grid-cols-1 md:grid-cols-3 gap-8">
      {STEPS.map(({ id, titleKey, descKey, icon: Icon, styles }) => (
        <div
          key={id}
          className={`bg-gray-900 p-6 md:p-8 rounded-xl border-2 hover:-translate-y-2 transition-transform duration-300 flex flex-col items-center text-center ${styles.border} ${styles.shadow}`}
        >
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 border-2 ${styles.iconBg} ${styles.iconBorder}`}
          >
            <Icon className={`w-8 h-8 ${styles.iconColor}`} />
          </div>
          <h3
            className={`text-lg md:text-xl font-bold mb-4 font-press ${styles.titleColor}`}
          >
            {t(titleKey)}
          </h3>
          <p className="text-xs md:text-sm text-gray-400 leading-relaxed font-press">
            {t(descKey)}
          </p>
        </div>
      ))}
    </section>
  );
}
