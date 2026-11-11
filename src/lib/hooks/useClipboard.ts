"use client";

import { useState, useCallback } from "react";

/**
 * recipe-front & nuzelcat에서 추출된 클립보드 복사 훅
 */
export function useClipboard(timeout = 2000) {
  const [hasCopied, setHasCopied] = useState(false);

  const copy = useCallback(
    async (text: string) => {
      if (typeof window === "undefined" || !navigator.clipboard) return false;

      try {
        await navigator.clipboard.writeText(text);
        setHasCopied(true);
        setTimeout(() => setHasCopied(false), timeout);
        return true;
      } catch (err) {
        console.error("클립보드 복사 실패:", err);
        setHasCopied(false);
        return false;
      }
    },
    [timeout]
  );

  return { copy, hasCopied };
}
