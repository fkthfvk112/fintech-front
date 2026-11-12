"use client";

import { useTranslation } from "react-i18next";
import { useChangeLocaleRoute, useLocaleFromPath } from "@/lib/i18n/useLocaleRouting";
import { Locale, SUPPORTED_LOCALES } from "@/lib/i18n/resources";

const LABELS: Record<Locale, string> = {
  ko: "한국어",
  en: "English",
  ja: "日本語",
};

export function LocaleSwitcher() {
  const { t } = useTranslation("common");
  const changeLocale = useChangeLocaleRoute();
  const current = useLocaleFromPath();

  return (
    <label className="inline-flex items-center gap-2 text-sm text-slate-600">
      <span className="sr-only md:not-sr-only">{t("language")}</span>
      <select
        className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-800"
        value={SUPPORTED_LOCALES.includes(current) ? current : "ko"}
        onChange={(e) => void changeLocale(e.target.value as Locale)}
      >
        {SUPPORTED_LOCALES.map((locale) => (
          <option key={locale} value={locale}>
            {LABELS[locale]}
          </option>
        ))}
      </select>
    </label>
  );
}
