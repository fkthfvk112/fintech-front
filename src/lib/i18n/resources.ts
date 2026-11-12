import koCommon from "@/languages/ko/common.json";
import koCalculator from "@/languages/ko/calculator.json";
import koSeo from "@/languages/ko/seo.json";
import koPortfolio from "@/languages/ko/portfolio.json";
import koFaq from "@/languages/ko/faq.json";
import koHowto from "@/languages/ko/howto.json";
import enCommon from "@/languages/en/common.json";
import enCalculator from "@/languages/en/calculator.json";
import enSeo from "@/languages/en/seo.json";
import enPortfolio from "@/languages/en/portfolio.json";
import enFaq from "@/languages/en/faq.json";
import enHowto from "@/languages/en/howto.json";
import jaCommon from "@/languages/ja/common.json";
import jaCalculator from "@/languages/ja/calculator.json";
import jaSeo from "@/languages/ja/seo.json";
import jaPortfolio from "@/languages/ja/portfolio.json";
import jaFaq from "@/languages/ja/faq.json";
import jaHowto from "@/languages/ja/howto.json";

export const SUPPORTED_LOCALES = ["ko", "en", "ja"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const resources = {
  ko: {
    common: koCommon,
    calculator: koCalculator,
    seo: koSeo,
    portfolio: koPortfolio,
    faq: koFaq,
    howto: koHowto,
  },
  en: {
    common: enCommon,
    calculator: enCalculator,
    seo: enSeo,
    portfolio: enPortfolio,
    faq: enFaq,
    howto: enHowto,
  },
  ja: {
    common: jaCommon,
    calculator: jaCalculator,
    seo: jaSeo,
    portfolio: jaPortfolio,
    faq: jaFaq,
    howto: jaHowto,
  },
} as const;
