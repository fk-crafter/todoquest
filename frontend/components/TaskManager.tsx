"use client";
import { useState } from "react";
import TaskForm from "@/components/TaskForm";

export default function TaskManager() {
  const [tasks, setTasks] = useState<{ title: string; description: string }[]>(
    []
  );

  const addTask = (task: { title: string; description: string }) => {
    setTasks([...tasks, task]);
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <TaskForm onTaskAdded={addTask} />
      <div className="w-full max-w-md p-4 bg-gray-800 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-2">Liste des tâches</h2>
        {tasks.length === 0 ? (
          <p className="text-gray-400">Aucune tâche pour l&apos;instant.</p>
        ) : (
          <ul className="list-disc list-inside text-white">
            {tasks.map((task, index) => (
              <li key={index}>
                <strong>{task.title}</strong> - {task.description}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
