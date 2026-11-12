"use client";

import { Check, Copy, RotateCcw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/Button";
import { useClipboard } from "@/lib/hooks/useClipboard";
import { formatGroupedNumber, formatMoney } from "@/lib/rebalancing/money";
import { CurrencyCode, RebalancingResult } from "@/rebalancing/interface/types";

interface ResultPanelProps {
  result: RebalancingResult;
  currency: CurrencyCode;
  stale: boolean;
  onReset: () => void;
}

export function ResultPanel({ result, currency, stale, onReset }: ResultPanelProps) {
  const { t } = useTranslation("calculator");
  const { copy, hasCopied } = useClipboard();

  const handleCopy = () => {
    const lines = [
      `${t("result.title")}`,
      `${t("result.totalBudget")}: ${formatMoney(result.totalBudget, currency)}`,
      `${t("result.actualSpend")}: ${formatMoney(result.actualSpend, currency)}`,
      `${t("result.cashRemaining")}: ${formatMoney(result.cashRemaining, currency)}`,
      `${t("result.totalShares")}: ${formatGroupedNumber(result.totalShares, { maxFractionDigits: 0 })}`,
      "",
      ...result.stocks.map((s) =>
        s.isCash
          ? `${s.name} | ${t("result.targetWeight")}: ${formatGroupedNumber(s.targetWeight, { maxFractionDigits: 3 })}% | ${t("result.actualAmount")}: ${formatMoney(s.actualAmount, currency)} | ${t("result.actualWeight")}: ${formatGroupedNumber(s.actualWeight, { maxFractionDigits: 2 })}%`
          : `${s.name} | ${t("result.shares")}: ${s.shares} | ${t("result.actualAmount")}: ${formatMoney(s.actualAmount, currency)} | ${t("result.actualWeight")}: ${formatGroupedNumber(s.actualWeight, { maxFractionDigits: 2 })}%`
      ),
    ];
    void copy(lines.join("\n"));
  };

  return (
    <section className="mt-8 space-y-4 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-bold text-slate-900">{t("result.title")}</h2>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={handleCopy}>
            {hasCopied ? (
              <>
                <Check className="mr-1.5 h-3.5 w-3.5 text-emerald-600" />
                {t("copied")}
              </>
            ) : (
              <>
                <Copy className="mr-1.5 h-3.5 w-3.5" />
                {t("copyResult")}
              </>
            )}
          </Button>
          <Button size="sm" variant="ghost" onClick={onReset}>
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
            {t("resetResult")}
          </Button>
        </div>
      </div>

      {stale && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {t("staleResult")}
        </p>
      )}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <SummaryCard
          label={t("result.totalBudget")}
          value={formatMoney(result.totalBudget, currency)}
        />
        <SummaryCard
          label={t("result.actualSpend")}
          value={formatMoney(result.actualSpend, currency)}
        />
        <SummaryCard
          label={t("result.cashRemaining")}
          value={formatMoney(result.cashRemaining, currency)}
        />
        <SummaryCard
          label={t("result.totalShares")}
          value={formatGroupedNumber(result.totalShares, { maxFractionDigits: 0 })}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
              <th className="px-2 py-2 font-medium">{t("result.stockName")}</th>
              <th className="px-2 py-2 font-medium">{t("result.unitPrice")}</th>
              <th className="px-2 py-2 font-medium">{t("result.targetWeight")}</th>
              <th className="px-2 py-2 font-medium">{t("result.targetAmount")}</th>
              <th className="px-2 py-2 font-medium">{t("result.shares")}</th>
              <th className="px-2 py-2 font-medium">{t("result.actualAmount")}</th>
              <th className="px-2 py-2 font-medium">{t("result.actualWeight")}</th>
            </tr>
          </thead>
          <tbody>
            {result.stocks.map((s) => (
              <tr
                key={s.id}
                className={`border-b border-slate-100 text-slate-800 ${
                  s.isCash ? "bg-slate-50" : ""
                }`}
              >
                <td className="px-2 py-2.5 font-medium">{s.name}</td>
                <td className="px-2 py-2.5">
                  {s.isCash ? "—" : formatMoney(s.price, currency)}
                </td>
                <td className="px-2 py-2.5">
                  {formatGroupedNumber(s.targetWeight, { maxFractionDigits: 3 })}%
                </td>
                <td className="px-2 py-2.5">{formatMoney(s.targetAmount, currency)}</td>
                <td className="px-2 py-2.5 font-semibold">
                  {s.isCash ? "—" : s.shares}
                </td>
                <td className="px-2 py-2.5">{formatMoney(s.actualAmount, currency)}</td>
                <td className="px-2 py-2.5">
                  {formatGroupedNumber(s.actualWeight, { maxFractionDigits: 2 })}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 px-3 py-3">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-1 text-base font-semibold text-slate-900">{value}</div>
    </div>
  );
}
