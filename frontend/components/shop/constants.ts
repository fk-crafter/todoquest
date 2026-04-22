import {
  Frame,
  Flame,
  Zap,
  Crown,
  Sword,
  Mountain,
  Trees,
  Cpu,
  Shield,
  Ghost,
  Sparkles,
  Hexagon,
  Snowflake,
  FlaskConical,
} from "lucide-react";

export type ShopItem = {
  id: string;
  name: string;
  category: "POTION" | "FRAME" | "TITLE" | "THEME";
  price: number;
  icon: React.ElementType;
  color: string;
};

export const SHOP_ITEMS: ShopItem[] = [
  {
    id: "potion_freeze",
    name: "potion_freeze",
    category: "POTION",
    price: 100,
    icon: Snowflake,
    color: "text-blue-300 drop-shadow-[0_0_8px_rgba(147,197,253,0.8)]",
  },
  {
    id: "potion_dxp",
    name: "potion_dxp",
    category: "POTION",
    price: 300,
    icon: FlaskConical,
    color: "text-purple-400 drop-shadow-[0_0_8px_rgba(192,132,252,0.8)]",
  },
  {
    id: "frame_gold",
    name: "frame_gold",
    category: "FRAME",
    price: 300,
    icon: Frame,
    color: "text-yellow-400",
  },
  {
    id: "frame_fire",
    name: "frame_fire",
    category: "FRAME",
    price: 800,
    icon: Flame,
    color: "text-orange-500",
  },
  {
    id: "frame_neon",
    name: "frame_neon",
    category: "FRAME",
    price: 600,
    icon: Zap,
    color: "text-cyan-400",
  },
  {
    id: "frame_emerald",
    name: "frame_emerald",
    category: "FRAME",
    price: 500,
    icon: Hexagon,
    color: "text-green-400",
  },
  {
    id: "title_slayer",
    name: "title_slayer",
    category: "TITLE",
    price: 200,
    icon: Sword,
    color: "text-red-400",
  },
  {
    id: "title_paladin",
    name: "title_paladin",
    category: "TITLE",
    price: 500,
    icon: Shield,
    color: "text-blue-300",
  },
  {
    id: "title_ninja",
    name: "title_ninja",
    category: "TITLE",
    price: 800,
    icon: Ghost,
    color: "text-gray-400",
  },
  {
    id: "title_rich",
    name: "title_rich",
    category: "TITLE",
    price: 5000,
    icon: Crown,
    color: "text-yellow-300",
  },
  {
    id: "title_legend",
    name: "title_legend",
    category: "TITLE",
    price: 2500,
    icon: Sparkles,
    color: "text-purple-400",
  },
  {
    id: "theme_magma",
    name: "theme_magma",
    category: "THEME",
    price: 1000,
    icon: Mountain,
    color: "text-red-600",
  },
  {
    id: "theme_forest",
    name: "theme_forest",
    category: "THEME",
    price: 1000,
    icon: Trees,
    color: "text-green-500",
  },
  {
    id: "theme_cyber",
    name: "theme_cyber",
    category: "THEME",
    price: 1500,
    icon: Cpu,
    color: "text-purple-500",
  },
];

export const GOLD_PACKS = [
  {
    id: "small",
    amount: 500,
    gradient: "from-yellow-900/40 to-yellow-900/10",
    border: "border-yellow-600/50 hover:border-yellow-400",
    glow: "bg-yellow-500/20 group-hover:bg-yellow-500/30",
    button: "bg-yellow-500 hover:bg-yellow-400 text-black",
  },
  {
    id: "medium",
    amount: 1200,
    gradient: "from-orange-900/40 to-orange-900/10",
    border:
      "border-orange-500/80 hover:border-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.2)]",
    glow: "bg-orange-500/20 group-hover:bg-orange-500/40",
    button: "bg-orange-500 hover:bg-orange-400 text-black",
  },
  {
    id: "large",
    amount: 3000,
    gradient: "from-red-900/40 to-red-900/10",
    border: "border-red-600/50 hover:border-red-400",
    glow: "bg-red-500/20 group-hover:bg-red-500/30",
    button: "bg-red-500 hover:bg-red-400 text-white",
  },
];
