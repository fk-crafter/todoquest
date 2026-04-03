"use client";

import { Trash } from "lucide-react";
import { useTranslations } from "next-intl";
import { Task } from "@/types/todo";

interface CompletedTasksListProps {
  tasks: Task[];
  onDelete: (id: string) => void;
}

export default function CompletedTasksList({
  tasks,
  onDelete,
}: CompletedTasksListProps) {
  const t = useTranslations("Tasks");

  return (
    <div className="w-full md:w-1/2">
      <h2 className="text-xl font-semibold mb-4 text-white">
        {t("main.completed")}
      </h2>
      {tasks.length === 0 ? (
        <p className="text-gray-400">{t("main.noCompleted")}</p>
      ) : (
        tasks.map((task) => (
          <div
            key={task.id}
            className="bg-app-surface/60 p-4 rounded-lg mb-2 text-white flex justify-between items-center border border-app-border/50"
          >
            <div className="flex-1 mr-2">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-bold line-through text-gray-500 break-all">
                  {task.title}
                </h3>
                <span className="text-[10px] md:text-xs bg-gray-800 text-gray-500 px-2 py-1 rounded border border-gray-700 whitespace-nowrap">
                  {task.difficulty}
                </span>
              </div>
              {task.description && (
                <p className="text-sm text-gray-600 break-words">
                  {task.description}
                </p>
              )}
              {task.timeSpent != null && (
                <p className="text-sm text-gray-500 italic mt-1">
                  ⏱ {(task.timeSpent / 60).toFixed(1)}h
                </p>
              )}
            </div>
            <button
              onClick={() => onDelete(task.id)}
              className="p-2 bg-red-900/30 hover:bg-red-700 text-white rounded-lg cursor-pointer flex-shrink-0"
            >
              <Trash size={20} />
            </button>
          </div>
        ))
      )}
    </div>
  );
}
