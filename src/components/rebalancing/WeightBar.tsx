"use client";

import { useTranslation } from "react-i18next";
import { formatGroupedNumber } from "@/lib/rebalancing/money";

interface WeightBarProps {
  sum: number;
  /** i18n namespace for labels (default: calculator) */
  ns?: "calculator" | "portfolio";
}

export function WeightBar({ sum, ns = "calculator" }: WeightBarProps) {
  const { t } = useTranslation(ns);
  const rounded = Math.round(sum * 1000) / 1000;
  const over = rounded > 100 + 1e-9;
  const under = rounded < 100 - 1e-9;
  const cash = under ? Math.max(0, 100 - rounded) : 0;
  const stockPct = Math.min(100, Math.max(0, rounded));

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
        <span className="font-medium text-slate-700">
          {t("weightSum")}: {formatGroupedNumber(rounded, { maxFractionDigits: 3 })}%
        </span>
        {under && (
          <span className="text-slate-500">
            {t("cash")}: {formatGroupedNumber(cash, { maxFractionDigits: 3 })}%
          </span>
        )}
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className={`h-full transition-all ${over ? "bg-rose-500" : "bg-emerald-600"}`}
          style={{ width: `${Math.min(stockPct, 100)}%` }}
        />
      </div>

      {over && <p className="text-sm font-medium text-rose-600">{t("weightOver")}</p>}
    </div>
  );
}
