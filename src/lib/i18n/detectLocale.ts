import { Locale, SUPPORTED_LOCALES } from "./resources";

const STORAGE_KEY = "rebalancer.locale";

/**
 * Accept-Language를 q값 내림차순으로 파싱해 지원 로케일을 고른다.
 * 예: "en-US,en;q=0.9,ko;q=0.8,ja;q=0.7" → en
 * 예: "ko-KR,ko;q=0.9,ja;q=0.8" → ko
 */
export function detectLocaleFromAcceptLanguage(
  header: string | null
): Locale {
  if (!header) return "ko";

  const entries = header
    .split(",")
    .map((part) => {
      const [rawTag, ...params] = part.trim().split(";");
      const tag = (rawTag ?? "").trim().toLowerCase();
      const qParam = params.find((p) => p.trim().startsWith("q="));
      const q = qParam ? Number.parseFloat(qParam.split("=")[1] ?? "1") : 1;
      return {
        tag,
        q: Number.isFinite(q) ? q : 0,
      };
    })
    .filter((e) => e.tag && e.tag !== "*")
    .sort((a, b) => b.q - a.q);

  for (const { tag } of entries) {
    if (tag === "ko" || tag.startsWith("ko-")) return "ko";
    if (tag === "ja" || tag.startsWith("ja-")) return "ja";
    if (tag === "en" || tag.startsWith("en-")) return "en";
  }

  return "ko";
}

export function detectLocale(): Locale {
  if (typeof window === "undefined") return "ko";

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved && SUPPORTED_LOCALES.includes(saved as Locale)) {
      return saved as Locale;
    }
  } catch {
    // ignore storage errors
  }

  return detectLocaleFromAcceptLanguage(
    typeof navigator !== "undefined"
      ? [navigator.language, ...(navigator.languages ?? [])].join(",")
      : null
  );
}

export function persistLocale(locale: Locale) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    // ignore storage errors
  }
}
