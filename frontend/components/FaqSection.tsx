"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown, MessageCircleQuestion } from "lucide-react";

const FAQ_ITEMS = [
  { id: "1", qKey: "q1", aKey: "a1" },
  { id: "2", qKey: "q2", aKey: "a2" },
  { id: "3", qKey: "q3", aKey: "a3" },
  { id: "4", qKey: "q4", aKey: "a4" },
];

export default function FaqSection() {
  const t = useTranslations("Landing.faq");
  const [openIndex, setOpenIndex] = useState<string | null>(null);

  const toggleItem = (id: string) => {
    setOpenIndex((current) => (current === id ? null : id));
  };

  return (
    <section className="reveal-section max-w-3xl mx-auto w-full my-24 px-4">
      <div className="text-center mb-12 flex flex-col items-center">
        <div className="w-16 h-16 bg-blue-900/30 rounded-full flex items-center justify-center mb-6 border-2 border-blue-500/50">
          <MessageCircleQuestion className="w-8 h-8 text-blue-400" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 font-press tracking-wider">
          {t("title")}
        </h2>
        <p className="text-xs md:text-sm text-gray-400 font-press leading-relaxed">
          {t("subtitle")}
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {FAQ_ITEMS.map((item) => {
          const isOpen = openIndex === item.id;

          return (
            <div
              key={item.id}
              className={`bg-gray-900 border-2 rounded-xl overflow-hidden transition-colors duration-300 ${
                isOpen
                  ? "border-blue-500"
                  : "border-gray-800 hover:border-gray-700"
              }`}
            >
              <button
                onClick={() => toggleItem(item.id)}
                className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
              >
                <span
                  className={`font-press text-xs md:text-sm leading-relaxed ${
                    isOpen ? "text-blue-400" : "text-gray-200"
                  }`}
                >
                  {t(item.qKey as any)}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-gray-500 shrink-0 transition-transform duration-300 ${
                    isOpen ? "rotate-180 text-blue-400" : ""
                  }`}
                />
              </button>

              <div
                className={`transition-all duration-300 ease-in-out ${
                  isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="px-6 pb-6 text-gray-400 text-xs md:text-sm font-press leading-loose border-t border-gray-800/50 pt-4 mt-2 mx-2">
                  {t(item.aKey as any)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
