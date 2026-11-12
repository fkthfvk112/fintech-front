"use client";

import { ReactNode, useEffect } from "react";
import { I18nextProvider } from "react-i18next";
import { changeI18nLanguage, initI18n } from "./config";
import { persistLocale } from "./detectLocale";
import { Locale } from "./resources";

const i18n = initI18n("ko");

interface I18nProviderProps {
  children: ReactNode;
  /** URL `[locale]`과 동기화 */
  locale: Locale;
}

export function I18nProvider({ children, locale }: I18nProviderProps) {
  useEffect(() => {
    persistLocale(locale);
    document.documentElement.lang = locale;
    void changeI18nLanguage(locale);
  }, [locale]);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
