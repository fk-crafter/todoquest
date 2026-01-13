"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Pencil, Check, Trash } from "lucide-react";
import { Task, Difficulty } from "@/types/todo";

interface TaskItemProps {
  task: Task;
  onEdit: (task: Task) => void;
  onCheck: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function TaskItem({
  task,
  onEdit,
  onCheck,
  onDelete,
}: TaskItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const formatTimeSpent = (min: number) => {
    const d = Math.floor(min / 1440);
    const h = Math.floor((min % 1440) / 60);
    const m = min % 60;
    let res = "";
    if (d > 0) res += `${d}j `;
    if (h > 0) res += `${h}h `;
    if (m > 0 || res === "") res += `${m}min`;
    return res.trim();
  };

  const getBadge = (diff: Difficulty) => {
    const badges = {
      EASY: "bg-green-900/50 text-green-300 border-green-700",
      MEDIUM: "bg-yellow-900/50 text-yellow-300 border-yellow-700",
      HARD: "bg-orange-900/50 text-orange-300 border-orange-700",
      EPIC: "bg-purple-900/50 text-purple-300 border-purple-700",
    };
    const labels = {
      EASY: "Facile (+10 XP)",
      MEDIUM: "Moyen (+30 XP)",
      HARD: "Difficile (+50 XP)",
      EPIC: "Épique (+100 XP)",
    };

    return (
      <span
        className={`text-[10px] md:text-xs px-2 py-1 rounded border whitespace-nowrap ${badges[diff]}`}
      >
        {labels[diff]}
      </span>
    );
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="flex flex-col sm:flex-row sm:items-center justify-between bg-app-surface p-4 rounded-lg mt-2 border-l-4 border-l-app-accent gap-3 sm:gap-0 group touch-none cursor-grab active:cursor-grabbing border border-app-border"
    >
      <div className="flex-1">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <h2 className="font-bold text-white text-lg break-words">
            {task.title}
          </h2>
          {getBadge(task.difficulty)}
        </div>
        {task.description && (
          <p className="text-sm text-gray-300 break-words">
            {task.description}
          </p>
        )}
        {task.timeSpent != null && (
          <p className="text-sm text-app-accent italic mt-1 font-bold">
            ⏱ Temps passé : {formatTimeSpent(task.timeSpent)}
          </p>
        )}
      </div>
      <div className="flex gap-2 self-end sm:self-center">
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => onEdit(task)}
          className="p-2 bg-gray-700 hover:bg-app-accent hover:text-app-bg text-white rounded-lg border border-gray-600 hover:border-app-accent transition-colors"
        >
          <Pencil size={20} />
        </button>
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => onCheck(task.id)}
          className="p-2 bg-app-accent hover:opacity-80 text-app-bg rounded-lg font-bold shadow-[0_0_10px_rgba(0,0,0,0.3)] transition-colors"
        >
          <Check size={20} />
        </button>
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => onDelete(task.id)}
          className="p-2 bg-red-900/50 hover:bg-red-600 border border-red-800 text-white rounded-lg transition-colors"
        >
          <Trash size={20} />
        </button>
      </div>
    </div>
  );
}
