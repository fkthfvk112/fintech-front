import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { resources } from "./resources";

let initialized = false;

export function initI18n(locale: string = "en") {
  if (initialized) {
    return i18n;
  }

  void i18n.use(initReactI18next).init({
    resources,
    lng: locale,
    fallbackLng: "en",
    defaultNS: "common",
    ns: ["common", "calculator", "seo", "portfolio", "faq", "howto"],
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });

  initialized = true;
  return i18n;
}

export async function changeI18nLanguage(locale: string) {
  initI18n(locale);
  if (i18n.language !== locale) {
    await i18n.changeLanguage(locale);
  }
  return i18n;
}

export default i18n;
