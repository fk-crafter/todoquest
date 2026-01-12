"use client";

import { X } from "lucide-react";
import { useEffect } from "react";

interface RetroModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  type?: "default" | "danger" | "success";
}

export default function RetroModal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  type = "default",
}: RetroModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const borderColor =
    type === "danger"
      ? "border-red-600"
      : type === "success"
      ? "border-green-500"
      : "border-gray-600";

  const titleColor =
    type === "danger"
      ? "text-red-500"
      : type === "success"
      ? "text-green-400"
      : "text-yellow-400";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
      <div
        className={`bg-gray-800 border-4 ${borderColor} rounded-xl shadow-2xl w-full max-w-md relative flex flex-col max-h-[90vh]`}
        role="dialog"
      >
        <div className="flex justify-between items-center p-4 border-b-2 border-gray-700 bg-gray-900/50 rounded-t-lg">
          <h2
            className={`text-lg md:text-xl font-bold uppercase tracking-wider ${titleColor}`}
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto text-gray-200 leading-relaxed text-sm md:text-base">
          {children}
        </div>

        {footer && (
          <div className="p-4 border-t-2 border-gray-700 bg-gray-900/50 rounded-b-lg flex justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
