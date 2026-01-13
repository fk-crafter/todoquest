import { z } from "zod";

export const taskSchema = z.object({
  title: z.string().min(1, "Le titre est requis").max(50, "Titre trop long"),
  description: z.string().optional(),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD", "EPIC"]),
});

export type TaskFormData = z.infer<typeof taskSchema>;
export type Difficulty = "EASY" | "MEDIUM" | "HARD" | "EPIC";

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  timeSpent?: number;
  difficulty: Difficulty;
}

export const ACHIEVEMENTS_THRESHOLDS = [
  { id: "gen_1", count: 1, type: "TOTAL", label: "🌱 Le début du voyage" },
  { id: "gen_2", count: 10, type: "TOTAL", label: "🔥 Aventurier Confirmé" },
  { id: "gen_3", count: 20, type: "TOTAL", label: "👑 Légende montante" },
  { id: "easy_1", count: 5, type: "EASY", label: "🧹 Nettoyeur de Gobelins" },
  { id: "easy_2", count: 20, type: "EASY", label: "🏃‍♂️ Routine Matinale" },
  { id: "med_1", count: 5, type: "MEDIUM", label: "🛡️ Garde du Village" },
  { id: "med_2", count: 15, type: "MEDIUM", label: "🔨 Forgeron Productif" },
  { id: "hard_1", count: 3, type: "HARD", label: "👹 Chasseur de Trolls" },
  { id: "hard_2", count: 10, type: "HARD", label: "🌋 Survivant du Volcan" },
  { id: "epic_1", count: 1, type: "EPIC", label: "🐉 Tueur de Dragons" },
  { id: "epic_2", count: 5, type: "EPIC", label: "🌌 Roi de la Productivité" },
];
