"use client";

import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { CurrencyCode } from "@/rebalancing/interface/types";

interface ModeToolbarProps {
  title: string;
  description?: string;
  currency: CurrencyCode;
  onCurrencyChange: (currency: CurrencyCode) => void;
  meta?: ReactNode;
}

/** 선택된 도구 폼 상단: 모드 제목 + 통화 */
export function ModeToolbar({
  title,
  description,
  currency,
  onCurrencyChange,
  meta,
}: ModeToolbarProps) {
  const { t } = useTranslation("common");

  return (
    <div className="mb-6 flex flex-col gap-3 border-b border-slate-100 pb-5 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
        {description && (
          <p className="mt-1 max-w-2xl text-sm text-slate-600">{description}</p>
        )}
        {meta}
      </div>
      <label className="inline-flex shrink-0 items-center gap-2 text-sm text-slate-600">
        <span>{t("currency")}</span>
        <select
          className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-800 outline-none focus:border-[#4A89F3] focus:ring-1 focus:ring-[#4A89F3]"
          value={currency}
          onChange={(e) => onCurrencyChange(e.target.value as CurrencyCode)}
        >
          <option value="USD">USD</option>
          <option value="KRW">KRW</option>
          <option value="JPY">JPY</option>
        </select>
      </label>
    </div>
  );
}
