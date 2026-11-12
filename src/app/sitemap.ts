import type { MetadataRoute } from "next";
import {
  LOCALES,
  SEO_PATHS,
  buildHreflangLanguages,
  localizedAbsoluteUrl,
  type SeoPathKey,
} from "@/lib/seo/site";

/** 로케일 × 공개 경로 + hreflang alternates. */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const pathKeys = Object.keys(SEO_PATHS) as SeoPathKey[];

  return LOCALES.flatMap((locale) =>
    pathKeys.map((pathKey) => ({
      url: localizedAbsoluteUrl(locale, pathKey),
      lastModified: now,
      changeFrequency: pathKey === "rebalancing" ? "weekly" : "monthly",
      priority: 1,
      alternates: {
        languages: buildHreflangLanguages(pathKey),
      },
    }))
  );
}
