"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

export default function TaskForm({
  onTaskAdded,
}: {
  onTaskAdded: (task: { title: string; description: string }) => void;
}) {
  const t = useTranslations("Tasks.form");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onTaskAdded({ title, description });
    setTitle("");
    setDescription("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 p-4 bg-gray-800 rounded-lg shadow-md w-full max-w-md"
    >
      <h2 className="text-xl font-bold">{t("title")}</h2>
      <input
        type="text"
        placeholder={t("placeholderTitle")}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="p-2 rounded bg-gray-700 text-white"
        required
      />
      <textarea
        placeholder={t("placeholderDesc")}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="p-2 rounded bg-gray-700 text-white"
      />
      <button
        type="submit"
        className="p-2 bg-blue-500 hover:bg-blue-600 rounded text-white font-bold"
      >
        {t("submit")}
      </button>
    </form>
  );
}
