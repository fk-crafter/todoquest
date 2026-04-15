import { useTranslations } from "next-intl";
import { ScrollText, Swords, Crown } from "lucide-react";

const STEPS = [
  {
    id: "step1",
    titleKey: "step1Title",
    descKey: "step1Desc",
    icon: ScrollText,
    styles: {
      card: "border-blue-900 shadow-[4px_4px_0px_rgba(30,58,138,1)]",
      iconWrapper: "bg-blue-900/50 border-blue-500",
      iconColor: "text-blue-400",
      titleColor: "text-blue-400",
    },
  },
  {
    id: "step2",
    titleKey: "step2Title",
    descKey: "step2Desc",
    icon: Swords,
    styles: {
      card: "border-red-900 shadow-[4px_4px_0px_rgba(127,29,29,1)]",
      iconWrapper: "bg-red-900/50 border-red-500",
      iconColor: "text-red-400",
      titleColor: "text-red-500",
    },
  },
  {
    id: "step3",
    titleKey: "step3Title",
    descKey: "step3Desc",
    icon: Crown,
    styles: {
      card: "border-yellow-900 shadow-[4px_4px_0px_rgba(113,63,18,1)]",
      iconWrapper: "bg-yellow-900/50 border-yellow-500",
      iconColor: "text-yellow-400",
      titleColor: "text-yellow-500",
    },
  },
];

export default function HowItWorksSection() {
  const t = useTranslations("Landing");

  return (
    <section className="reveal-section grid grid-cols-1 md:grid-cols-3 gap-8">
      {STEPS.map((step) => {
        const Icon = step.icon;

        return (
          <div
            key={step.id}
            className={`bg-gray-900 p-6 md:p-8 rounded-xl border-2 hover:-translate-y-2 transition-transform duration-300 flex flex-col items-center text-center ${step.styles.card}`}
          >
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 border-2 ${step.styles.iconWrapper}`}
            >
              <Icon className={`w-8 h-8 ${step.styles.iconColor}`} />
            </div>
            <h3
              className={`text-lg md:text-xl font-bold mb-4 font-press ${step.styles.titleColor}`}
            >
              {t(step.titleKey as any)}
            </h3>
            <p className="text-xs md:text-sm text-gray-400 leading-relaxed font-press">
              {t(step.descKey as any)}
            </p>
          </div>
        );
      })}
    </section>
  );
}
