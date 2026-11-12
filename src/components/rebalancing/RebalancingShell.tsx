"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocaleHref } from "@/lib/i18n/useLocaleRouting";
import { currencyFromLocale } from "@/lib/rebalancing/currency";
import { CurrencyCode } from "@/rebalancing/interface/types";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { FaqSection } from "./FaqSection";
import { ModeSteps } from "./ModeSteps";
import { PortfolioAddMode } from "./PortfolioAddMode";
import { RebalancingCalculator } from "./RebalancingCalculator";
import { ToolModeCards, type RebalancingMode } from "./ToolModeCards";

export function RebalancingShell() {
  const { t, i18n } = useTranslation("common");
  const homeHref = useLocaleHref("home");
  const [mode, setMode] = useState<RebalancingMode>("basic");
  const [currency, setCurrency] = useState<CurrencyCode>(() =>
    currencyFromLocale(i18n.language)
  );

  // 언어 → 통화만 동기화 (통화 변경은 언어에 영향 없음)
  useEffect(() => {
    setCurrency(currencyFromLocale(i18n.language));
  }, [i18n.language]);

  return (
    <div className="min-h-screen bg-[#F7FAFF]">
      <div className="mx-auto max-w-5xl px-4 pb-16 pt-8 sm:px-6 sm:pt-10">
        <div className="mb-6 flex items-center justify-between gap-3">
          <Link
            href={homeHref}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-[#4A89F3]"
          >
            <img
              src="/brand/ramza-icon.jpg"
              alt=""
              width={28}
              height={28}
              className="h-7 w-7 rounded-lg"
            />
            <span>{t("appName")}</span>
          </Link>
          <LocaleSwitcher />
        </div>

        <header className="mx-auto max-w-3xl text-center">
          <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl md:text-[2.75rem] md:leading-tight">
            {t("shell.h1Before")}
            <span className="text-[#4A89F3]">{t("shell.h1Accent")}</span>
            {t("shell.h1After")}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
            {t("shell.lead")}
          </p>
        </header>

        <div className="mt-10">
          <ToolModeCards mode={mode} onChange={setMode} />
        </div>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white px-4 py-6 sm:px-8">
          <ModeSteps mode={mode} />
        </div>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
          {mode === "basic" ? (
            <RebalancingCalculator
              embedded
              currency={currency}
              onCurrencyChange={setCurrency}
            />
          ) : (
            <PortfolioAddMode
              embedded
              currency={currency}
              onCurrencyChange={setCurrency}
            />
          )}
        </div>

        <FaqSection />
      </div>
    </div>
  );
}
