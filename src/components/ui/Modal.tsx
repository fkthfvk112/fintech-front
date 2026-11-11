"use client";

import { useAtom, useSetAtom } from "jotai";
import { modalAtom, closeModalActionAtom } from "@/stores/uiAtom";
import { X } from "lucide-react";

export function GlobalModal() {
  const [modal] = useAtom(modalAtom);
  const closeModal = useSetAtom(closeModalActionAtom);

  if (!modal.isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative border border-slate-100">
        <button
          onClick={() => {
            modal.onCancel?.();
            closeModal();
          }}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-bold text-slate-900 mb-1">{modal.title}</h3>
        {modal.description && (
          <p className="text-sm text-slate-500 mb-4">{modal.description}</p>
        )}

        {modal.content && <div className="my-4">{modal.content}</div>}

        <div className="flex justify-end gap-2.5 mt-6">
          {modal.cancelText && (
            <button
              onClick={() => {
                modal.onCancel?.();
                closeModal();
              }}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              {modal.cancelText}
            </button>
          )}
          <button
            onClick={() => {
              modal.onConfirm?.();
              closeModal();
            }}
            className="px-4 py-2 text-sm font-medium bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition"
          >
            {modal.confirmText || "확인"}
          </button>
        </div>
      </div>
    </div>
  );
}
