import type { Metadata } from "next";
import ko from "@/languages/ko/seo.json";
import en from "@/languages/en/seo.json";
import ja from "@/languages/ja/seo.json";
import {
  DEFAULT_LOCALE,
  SITE_URL,
  buildHreflangLanguages,
  localePath,
  localizedAbsoluteUrl,
  type SeoPathKey,
  type SiteLocale,
} from "./site";

const seoByLocale = { ko, en, ja } as const;

type SeoPageKey = keyof typeof ko;

export function getSeoCopy(locale: SiteLocale, page: SeoPageKey) {
  const pack = seoByLocale[locale] ?? seoByLocale[DEFAULT_LOCALE];
  return pack[page];
}

/**
 * 페이지 Metadata (Title / Description / Canonical / hreflang / OG / Twitter).
 * canonical·hreflang은 `/{locale}` · `/{locale}/rebalancing`.
 */
export function buildPageMetadata(
  page: SeoPageKey,
  options: {
    locale: SiteLocale;
    pathKey: SeoPathKey;
  }
): Metadata {
  const { locale, pathKey } = options;
  const copy = getSeoCopy(locale, page);
  const url = localizedAbsoluteUrl(locale, pathKey);
  const ogImagePath =
    pathKey === "rebalancing"
      ? `${localePath(locale, "rebalancing")}/opengraph-image`
      : `${localePath(locale, "home")}/opengraph-image`;

  return {
    title: copy.title,
    description: copy.description,
    metadataBase: new URL(SITE_URL),
    applicationName: getSeoCopy(locale, "site").title,
    icons: {
      icon: [{ url: "/brand/ramza-icon.jpg", type: "image/jpeg" }],
      apple: [{ url: "/brand/ramza-icon.jpg", type: "image/jpeg" }],
    },
    alternates: {
      canonical: url,
      languages: buildHreflangLanguages(pathKey),
    },
    openGraph: {
      type: "website",
      locale: locale === "ko" ? "ko_KR" : locale === "ja" ? "ja_JP" : "en_US",
      url,
      title: copy.title,
      description: copy.description,
      siteName: getSeoCopy(locale, "site").title,
      images: [
        {
          url: ogImagePath,
          width: 1200,
          height: 630,
          alt: copy.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: copy.title,
      description: copy.description,
      images: [ogImagePath],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}
