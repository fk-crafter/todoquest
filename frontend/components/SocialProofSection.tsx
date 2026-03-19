import { useTranslations } from "next-intl";

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
    <section className="reveal-section bg-gray-800/50 p-8 md:p-12 rounded-3xl border border-gray-700">
      <h2 className="text-2xl md:text-3xl font-bold mb-10 text-center font-press text-blue-400">
        {t("socialTitle")}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reviews.map((review, index) => (
          <div
            key={index}
            className={`bg-gray-900 p-6 rounded-lg border-l-4 ${review.color} relative flex flex-col justify-between`}
          >
            <p className="text-gray-300 italic mb-4">{t(review.text)}</p>
            <p className={`${review.textColor} text-sm font-bold font-press`}>
              {t(review.author)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
