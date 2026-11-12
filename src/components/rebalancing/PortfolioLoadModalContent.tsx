"use client";

import { Trash2 } from "lucide-react";
import { useAtomValue, useSetAtom } from "jotai";
import { useTranslation } from "react-i18next";
import { SavedPortfolio } from "@/rebalancing/interface/types";
import {
  deleteSavedPortfolioActionAtom,
  savedPortfoliosAtom,
} from "@/stores/portfolioAtom";
import { closeModalActionAtom } from "@/stores/uiAtom";

interface PortfolioLoadModalContentProps {
  onSelect: (portfolio: SavedPortfolio) => void;
}

function formatSavedAt(iso: string, language: string) {
  const locale = language.startsWith("ko")
    ? "ko-KR"
    : language.startsWith("ja")
      ? "ja-JP"
      : "en-US";
  try {
    return new Date(iso).toLocaleString(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function PortfolioLoadModalContent({
  onSelect,
}: PortfolioLoadModalContentProps) {
  const { t, i18n } = useTranslation("portfolio");
  const portfolios = useAtomValue(savedPortfoliosAtom);
  const deletePortfolio = useSetAtom(deleteSavedPortfolioActionAtom);
  const closeModal = useSetAtom(closeModalActionAtom);

  if (portfolios.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
        {t("portfolioLoadEmpty")}
      </p>
    );
  }

  const sorted = [...portfolios].sort(
    (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
  );

  return (
    <ul className="max-h-80 space-y-2 overflow-y-auto">
      {sorted.map((portfolio) => (
        <li key={portfolio.id}>
          <div className="flex items-stretch gap-2">
            <button
              type="button"
              onClick={() => {
                onSelect(portfolio);
                closeModal();
              }}
              className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-3 text-left transition hover:border-emerald-500 hover:bg-emerald-50"
            >
              <div className="truncate text-sm font-semibold text-slate-900">
                {portfolio.name}
              </div>
              <div className="mt-1 text-xs text-slate-500">
                {t("savedAt")}: {formatSavedAt(portfolio.savedAt, i18n.language)}
              </div>
              <div className="mt-0.5 text-xs text-slate-400">
                {t("holdingCount", { count: portfolio.holdings.length })}
              </div>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                deletePortfolio(portfolio.id);
              }}
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-3 text-rose-600 transition hover:bg-rose-50"
              aria-label={t("delete")}
              title={t("delete")}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
