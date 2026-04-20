import { useTranslations } from "next-intl";
import { Star } from "lucide-react";

interface CustomizationSectionProps {
  title: string;
  category: "FRAME" | "THEME" | "TITLE";
  equippedId: string;
  inventory: string[];
  metadata: Record<string, any>;
  metadataKey: string;
  onEquip: (id: string) => void;
  isLoading: boolean;
}

export default function CustomizationSection({
  title,
  category,
  equippedId,
  inventory,
  metadata,
  metadataKey,
  onEquip,
  isLoading,
}: CustomizationSectionProps) {
  const t = useTranslations("Profile");

  const prefix = category.toLowerCase() + "_";
  const ownedItems = inventory.filter((id: string) => id.startsWith(prefix));
  const allItems = ["default", ...ownedItems];

  return (
    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg h-full">
      <h2 className="text-xl font-bold mb-4 text-white flex items-center gap-2">
        {title}
      </h2>

      <div
        className={`grid grid-cols-2 ${
          category === "FRAME" ? "md:grid-cols-4" : ""
        } gap-4`}
      >
        {allItems.map((itemId) => {
          const meta = metadata[itemId] || {
            icon: Star,
            color: "text-white",
          };
          const isEquipped = equippedId === itemId;
          const Icon = meta.icon;

          return (
            <div
              key={itemId}
              className={`p-3 rounded-lg border-2 flex flex-col items-center gap-2 transition-all ${
                isEquipped
                  ? "border-green-500 bg-gray-700 scale-105"
                  : "border-gray-600 bg-gray-900 opacity-70 hover:opacity-100"
              }`}
            >
              <Icon size={28} className={meta.color} />
              <span className="font-bold text-[10px] text-center truncate w-full">
                {t(`metadata.${metadataKey}.${itemId}` as any)}
              </span>
              <button
                onClick={() => onEquip(itemId)}
                disabled={isEquipped || isLoading}
                className={`px-3 py-1 rounded text-[10px] font-bold uppercase w-full ${
                  isEquipped
                    ? "bg-green-600 text-white cursor-default"
                    : "bg-gray-600 hover:bg-blue-600 text-white"
                }`}
              >
                {isEquipped ? t("ui.actions.equipped") : t("ui.actions.choose")}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
