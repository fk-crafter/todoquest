import TaskManager from "@/components/TaskManager";

export default function TasksPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Gestion des Tâches</h1>
      <TaskManager />
    </div>
  );
}
