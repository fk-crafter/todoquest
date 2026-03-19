import { useTranslations } from "next-intl";
import { Marquee } from "@/components/ui/marquee";

export default function SocialProofSection() {
  const t = useTranslations("Landing");

  const reviews = [
    {
      text: "review1",
      author: "author1",
      color: "border-yellow-400",
      textColor: "text-yellow-400",
    },
    {
      text: "review2",
      author: "author2",
      color: "border-blue-400",
      textColor: "text-blue-400",
    },
    {
      text: "review3",
      author: "author3",
      color: "border-red-400",
      textColor: "text-red-400",
    },
    {
      text: "review4",
      author: "author4",
      color: "border-green-400",
      textColor: "text-green-400",
    },
    {
      text: "review5",
      author: "author5",
      color: "border-purple-400",
      textColor: "text-purple-400",
    },
  ];

  return (
    <section className="reveal-section bg-gray-800/50 py-12 rounded-3xl border border-gray-700 overflow-hidden relative">
      <h2 className="text-2xl md:text-3xl font-bold mb-10 text-center font-press text-blue-400 px-8">
        {t("socialTitle")}
      </h2>

      <div className="relative flex w-full flex-col items-center justify-center overflow-hidden">
        <Marquee pauseOnHover className="[--duration:40s]">
          {reviews.map((review, index) => (
            <div
              key={index}
              className={`bg-gray-900 p-6 rounded-lg border-l-4 ${review.color} w-80 mx-4 flex flex-col justify-between shrink-0 shadow-lg`}
            >
              <p className="text-gray-300 italic mb-4">{t(review.text)}</p>
              <p className={`${review.textColor} text-sm font-bold font-press`}>
                {t(review.author)}
              </p>
            </div>
          ))}
        </Marquee>

        <div className="pointer-events-none absolute inset-y-0 left-0 w-1/6 bg-gradient-to-r from-gray-800/90 to-transparent"></div>
        <div className="pointer-events-none absolute inset-y-0 right-0 w-1/6 bg-gradient-to-l from-gray-800/90 to-transparent"></div>
      </div>
    </section>
  );
}
