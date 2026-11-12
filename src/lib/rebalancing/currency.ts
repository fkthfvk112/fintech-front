import { CurrencyCode } from "@/rebalancing/interface/types";

/** 언어 → 기본 통화 (통화 변경은 언어에 영향 없음) */
export function currencyFromLocale(locale: string): CurrencyCode {
  const lang = locale.slice(0, 2).toLowerCase();
  if (lang === "ko") return "KRW";
  if (lang === "ja") return "JPY";
  return "USD";
}
