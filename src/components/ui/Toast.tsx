"use client";

import { useAtom, useSetAtom } from "jotai";
import { toastListAtom, removeToastActionAtom } from "@/stores/uiAtom";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react";

export function GlobalToastContainer() {
  const [toasts] = useAtom(toastListAtom);
  const removeToast = useSetAtom(removeToastActionAtom);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2.5 pointer-events-none">
      {toasts.map((toast) => {
        const icons = {
          success: <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />,
          error: <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />,
          warning: <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />,
          info: <Info className="w-4 h-4 text-sky-500 shrink-0" />,
        };

        const borderColors = {
          success: "border-emerald-200 bg-emerald-50/90 text-emerald-900",
          error: "border-rose-200 bg-rose-50/90 text-rose-900",
          warning: "border-amber-200 bg-amber-50/90 text-amber-900",
          info: "border-sky-200 bg-sky-50/90 text-sky-900",
        };

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-xl border shadow-lg backdrop-blur-sm text-sm font-medium transition-all max-w-sm ${
              borderColors[toast.type]
            }`}
          >
            <div className="flex items-center gap-2">
              {icons[toast.type]}
              <span>{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="opacity-60 hover:opacity-100 transition ml-2"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
