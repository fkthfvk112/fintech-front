import howtoEn from "@/languages/en/howto.json";
import howtoJa from "@/languages/ja/howto.json";
import howtoKo from "@/languages/ko/howto.json";
import seoEn from "@/languages/en/seo.json";
import seoJa from "@/languages/ja/seo.json";
import seoKo from "@/languages/ko/seo.json";
import { localizedAbsoluteUrl, type SiteLocale } from "./site";

type HowToStep = { label: string; body: string };

const seoByLocale = { ko: seoKo, en: seoEn, ja: seoJa } as const;
const howtoByLocale = { ko: howtoKo, en: howtoEn, ja: howtoJa } as const;

/** WebApplication + HowTo (FAQPage는 FaqSection에서 별도 출력). */
export function buildRebalancingJsonLd(locale: SiteLocale = "ko") {
  const seo = seoByLocale[locale];
  const howto = howtoByLocale[locale];
  const basicSteps = (howto.basic.steps as HowToStep[]) ?? [];

  const webApp = {
    "@type": "WebApplication",
    name: seo.site.title,
    url: localizedAbsoluteUrl(locale, "rebalancing"),
    applicationCategory: "FinanceApplication",
    operatingSystem: "Any",
    description: seo.rebalancing.description,
    inLanguage: locale,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: locale === "ko" ? "KRW" : locale === "ja" ? "JPY" : "USD",
    },
  };

  const howTo = {
    "@type": "HowTo",
    name: howto.basic.title,
    description: Array.isArray(howto.basic.summary)
      ? howto.basic.summary.join(" ")
      : String(howto.basic.summary ?? ""),
    inLanguage: locale,
    step: basicSteps.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step.label,
      text: step.body,
    })),
  };

  return {
    "@context": "https://schema.org",
    "@graph": [webApp, howTo],
  };
}

export function buildHomeJsonLd(locale: SiteLocale = "ko") {
  const seo = seoByLocale[locale];
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: seo.site.title,
    url: localizedAbsoluteUrl(locale, "home"),
    description: seo.home.description,
    inLanguage: locale,
    potentialAction: {
      "@type": "ReadAction",
      target: localizedAbsoluteUrl(locale, "rebalancing"),
    },
  };
}
