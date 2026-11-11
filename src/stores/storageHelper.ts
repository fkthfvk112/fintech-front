import { atomWithStorage, createJSONStorage } from "jotai/utils";

/**
 * Next.js SSR 환경에서 Hydration Mismatch를 방지하는 안전한 JSON LocalStorage Wrapper
 */
export function createSafeStorageAtom<T>(key: string, initialValue: T) {
  const storage = createJSONStorage<T>(() => {
    if (typeof window !== "undefined") {
      return window.localStorage;
    }
    // SSR 서버 환경 더미 스토리지
    return {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    };
  });

  return atomWithStorage<T>(key, initialValue, storage, {
    getOnInit: true,
  });
}
