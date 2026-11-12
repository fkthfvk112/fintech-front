/** 배포 도메인. 미설정 시 프로덕션 기본값 (sitemap/OG/canonical용). */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://fintech.ramza.app";

export const LOCALES = ["ko", "en", "ja"] as const;
export type SiteLocale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: SiteLocale = "ko";

/** 로케일 prefix 뒤 경로 (`/{locale}` + path). */
export const SEO_PATHS = {
  home: "",
  rebalancing: "/rebalancing",
} as const;

export type SeoPathKey = keyof typeof SEO_PATHS;

export function isSiteLocale(value: string): value is SiteLocale {
  return (LOCALES as readonly string[]).includes(value);
}

/** 예: ko + home → `/ko`, ko + rebalancing → `/ko/rebalancing` */
export function localePath(locale: SiteLocale, pathKey: SeoPathKey = "home") {
  const suffix = SEO_PATHS[pathKey];
  return `/${locale}${suffix}`;
}

export function localizedAbsoluteUrl(
  locale: SiteLocale,
  pathKey: SeoPathKey = "home"
) {
  return `${SITE_URL}${localePath(locale, pathKey)}`;
}

/** hreflang용: ko/en/ja + x-default(ko) */
export function buildHreflangLanguages(pathKey: SeoPathKey) {
  const languages: Record<string, string> = {};
  for (const lng of LOCALES) {
    languages[lng] = localizedAbsoluteUrl(lng, pathKey);
  }
  languages["x-default"] = localizedAbsoluteUrl(DEFAULT_LOCALE, pathKey);
  return languages;
}
