"use client";

import { usePathname, useRouter } from "next/navigation";
import { persistLocale } from "./detectLocale";
import { Locale, SUPPORTED_LOCALES } from "./resources";
import { changeI18nLanguage } from "./config";
import { isSiteLocale, localePath, type SeoPathKey } from "@/lib/seo/site";

export function useLocaleFromPath(): Locale {
  const pathname = usePathname() || "/ko";
  const first = pathname.split("/")[1] ?? "ko";
  return isSiteLocale(first) ? first : "ko";
}

export function useLocaleHref(pathKey: SeoPathKey = "home") {
  const locale = useLocaleFromPath();
  return localePath(locale, pathKey);
}

/** 언어 전환 시 URL locale prefix를 바꾸고 i18n·cookie 동기화 */
export function useChangeLocaleRoute() {
  const pathname = usePathname() || "/ko";
  const router = useRouter();

  return async (next: Locale) => {
    if (!SUPPORTED_LOCALES.includes(next)) return;

    const parts = pathname.split("/");
    // ["", "ko", "rebalancing"?]
    if (parts.length >= 2 && isSiteLocale(parts[1])) {
      parts[1] = next;
    } else {
      parts.splice(1, 0, next);
    }

    const target = parts.join("/") || `/${next}`;
    persistLocale(next);
    document.documentElement.lang = next;
    document.cookie = `rebalancer.locale=${next};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`;
    await changeI18nLanguage(next);
    router.push(target);
  };
}
