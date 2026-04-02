"use client";

import { useTranslations } from "next-intl";

interface TimeSpentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  days: string;
  setDays: (val: string) => void;
  hours: string;
  setHours: (val: string) => void;
  minutes: string;
  setMinutes: (val: string) => void;
}

export default function TimeSpentModal({
  isOpen,
  onClose,
  onConfirm,
  days,
  setDays,
  hours,
  setHours,
  minutes,
  setMinutes,
}: TimeSpentModalProps) {
  const t = useTranslations("Tasks");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-app-surface p-6 rounded-lg shadow-xl w-full max-w-sm border-2 border-app-border">
        <h2 className="text-xl font-bold mb-4 text-app-accent">
          {t("timeModal.title")}
        </h2>
        <div className="flex gap-2 mb-6">
          {[
            { l: t("timeModal.days"), v: days, s: setDays },
            { l: t("timeModal.hours"), v: hours, s: setHours },
            { l: t("timeModal.minutes"), v: minutes, s: setMinutes },
          ].map((f, i) => (
            <div key={i} className="flex-1">
              <label className="text-xs font-bold text-gray-400 uppercase">
                {f.l}
              </label>
              <input
                type="number"
                min="0"
                value={f.v}
                onChange={(e) => f.s(e.target.value)}
                className="w-full p-2 rounded border border-app-border bg-app-bg text-white text-center"
                placeholder="0"
              />
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-500 text-white"
          >
            {t("timeModal.cancel")}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded bg-app-accent hover:opacity-80 text-app-bg font-bold"
          >
            {t("timeModal.confirm")}
          </button>
        </div>
      </div>
    </div>
  );
}
