import { atom } from "jotai";
import { ReactNode } from "react";
import { createSafeStorageAtom } from "./storageHelper";

// 1. 전역 모달 상태 인터페이스
export interface ModalState {
  isOpen: boolean;
  title: string;
  description?: string;
  content?: ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export const modalAtom = atom<ModalState>({
  isOpen: false,
  title: "",
});

// 모달 열기/닫기 편의 액션
export const openModalActionAtom = atom(
  null,
  (get, set, options: Omit<ModalState, "isOpen">) => {
    set(modalAtom, { ...options, isOpen: true });
  }
);

export const closeModalActionAtom = atom(null, (get, set) => {
  set(modalAtom, (prev) => ({ ...prev, isOpen: false }));
});

// 2. 전역 토스트 알림 인터페이스
export interface ToastItem {
  id: string;
  type: "success" | "error" | "info" | "warning";
  message: string;
}

export const toastListAtom = atom<ToastItem[]>([]);

// 토스트 추가 액션 (3초 후 자동 제거)
export const addToastActionAtom = atom(
  null,
  (get, set, toast: Omit<ToastItem, "id">) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastItem = { ...toast, id };
    set(toastListAtom, (prev) => [...prev, newToast]);

    setTimeout(() => {
      set(toastListAtom, (prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }
);

export const removeToastActionAtom = atom(null, (get, set, id: string) => {
  set(toastListAtom, (prev) => prev.filter((t) => t.id !== id));
});

// 3. 다크모드/라이트모드 테마 Atom
export const themeModeAtom = createSafeStorageAtom<"light" | "dark">("boilerplate_theme", "light");
