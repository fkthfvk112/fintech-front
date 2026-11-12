"use client";

import { useState } from "react";
import { RotateCcw, Save } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/Button";
import { ColorCode } from "@/constants/Colors";
import { formatGroupedNumber, formatMoney } from "@/lib/rebalancing/money";
import {
  CurrencyCode,
  PortfolioAddResult,
  PortfolioSlice,
  TargetTradePlan,
} from "@/rebalancing/interface/types";
import { PortfolioPieChart } from "./PortfolioPieChart";

interface PortfolioResultPanelProps {
  result: PortfolioAddResult;
  currency: CurrencyCode;
  stale: boolean;
  onReset: () => void;
  onSave: () => void;
}

type TradeMode = "buy" | "sell";

/** ko/ja: 매수=빨강·매도=파랑 / en: 매수=파랑·매도=빨강 */
function tradeColors(language: string) {
  const asian = language === "ko" || language === "ja";
  return {
    buy: asian ? ColorCode.tradeRed : ColorCode.tradeBlue,
    sell: asian ? ColorCode.tradeBlue : ColorCode.tradeRed,
  };
}

export function PortfolioResultPanel({
  result,
  currency,
  stale,
  onReset,
  onSave,
}: PortfolioResultPanelProps) {
  const { t, i18n } = useTranslation("portfolio");
  const [mode, setMode] = useState<TradeMode>("buy");
  const colors = tradeColors(i18n.language);

  const plans = result.plans ?? [];
  const buyPlans = plans.filter((p) => p.buyShares > 0);
  const sellPlans = plans.filter((p) => p.sellShares > 0);
  const activePlans = mode === "buy" ? buyPlans : sellPlans;
  const modeColor = mode === "buy" ? colors.buy : colors.sell;

  const buyTotal = result.actualSpend;
  const sellTotal = result.actualSellProceeds;
  const modeTotal = mode === "buy" ? buyTotal : sellTotal;
  const totalCapital = result.totalCapital;

  const slices: PortfolioSlice[] = result.holdings.map((h) => ({
    id: h.id,
    name: h.name,
    value: h.finalValue,
    weight: h.finalWeight,
  }));

  return (
    <section className="mt-8 space-y-4 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-bold text-slate-900">{t("result.title")}</h2>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="ghost" onClick={onReset}>
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
            {t("resetResult")}
          </Button>
          <Button
            size="sm"
            onClick={onSave}
            disabled={stale}
            className="bg-emerald-700 hover:bg-emerald-800"
          >
            <Save className="mr-1.5 h-3.5 w-3.5" />
            {t("saveToPortfolio")}
          </Button>
        </div>
      </div>

      {stale && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {t("staleResult")}
        </p>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        <SummaryCard
          label={t("result.previousValue")}
          value={formatMoney(result.previousPortfolioValue, currency)}
        />
        <SummaryCard
          label={t("result.additionalBudget")}
          value={formatMoney(result.additionalBudget, currency)}
        />
        <SummaryCard
          label={t("result.totalCapital")}
          value={formatMoney(result.totalCapital, currency)}
        />
        <SummaryCard
          label={t("result.actualSpend")}
          value={formatMoney(result.actualSpend, currency)}
        />
        <SummaryCard
          label={t("result.sellProceeds")}
          value={formatMoney(result.actualSellProceeds, currency)}
        />
        <SummaryCard
          label={t("result.cashRemaining")}
          value={formatMoney(result.cashRemaining, currency)}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant={mode === "buy" ? "primary" : "outline"}
          onClick={() => setMode("buy")}
          className={mode === "buy" ? "text-white hover:opacity-90" : ""}
          style={
            mode === "buy"
              ? { backgroundColor: colors.buy, borderColor: colors.buy }
              : undefined
          }
        >
          {t("result.buyTab")} ({buyPlans.length})
        </Button>
        <Button
          size="sm"
          variant={mode === "sell" ? "primary" : "outline"}
          onClick={() => setMode("sell")}
          className={mode === "sell" ? "text-white hover:opacity-90" : ""}
          style={
            mode === "sell"
              ? { backgroundColor: colors.sell, borderColor: colors.sell }
              : undefined
          }
        >
          {t("result.sellTab")} ({sellPlans.length})
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
              <th className="px-2 py-2 font-medium">{t("result.name")}</th>
              <th className="px-2 py-2 font-medium">{t("result.price")}</th>
              <th className="px-2 py-2 font-medium">{t("result.targetWeight")}</th>
              <th className="px-2 py-2 font-medium">{t("result.targetAmount")}</th>
              <th className="px-2 py-2 font-medium">{t("result.previousQty")}</th>
              <th className="px-2 py-2 font-medium">
                {mode === "buy" ? t("result.buyQty") : t("result.sellQty")}
              </th>
              <th className="px-2 py-2 font-medium">
                {mode === "buy" ? t("result.buyAmount") : t("result.sellAmount")}
              </th>
            </tr>
          </thead>
          <tbody>
            {activePlans.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-2 py-6 text-center text-sm text-slate-500"
                >
                  {mode === "buy"
                    ? t("result.noBuyTrades")
                    : t("result.noSellTrades")}
                </td>
              </tr>
            ) : (
              activePlans.map((p) => (
                <TradeRow
                  key={p.id}
                  plan={p}
                  mode={mode}
                  currency={currency}
                  qtyColor={modeColor}
                />
              ))
            )}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-slate-300 bg-slate-50 font-semibold text-slate-800">
              <td colSpan={6} className="px-2 py-2.5 text-right">
                {mode === "buy" ? t("result.buyTotal") : t("result.sellTotal")}
              </td>
              <td className="px-2 py-2.5 tabular-nums" style={{ color: modeColor }}>
                {formatMoney(modeTotal, currency)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="overflow-x-auto border-t border-slate-100 pt-4">
        <h3 className="mb-3 text-sm font-semibold text-slate-800">
          {t("result.finalHoldings")}
        </h3>
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
              <th className="px-2 py-2 font-medium">{t("result.name")}</th>
              <th className="px-2 py-2 font-medium">{t("result.price")}</th>
              <th className="px-2 py-2 font-medium">{t("result.previousQty")}</th>
              <th className="px-2 py-2 font-medium">{t("result.buyQty")}</th>
              <th className="px-2 py-2 font-medium">{t("result.sellQty")}</th>
              <th className="px-2 py-2 font-medium">{t("result.finalQty")}</th>
              <th className="px-2 py-2 font-medium">{t("result.finalAmount")}</th>
              <th className="px-2 py-2 font-medium">{t("result.finalWeight")}</th>
            </tr>
          </thead>
          <tbody>
            {result.holdings.map((h) => (
              <tr
                key={h.id}
                className={`border-b border-slate-100 text-slate-800 ${
                  h.isCash ? "bg-slate-50" : ""
                }`}
              >
                <td className="px-2 py-2.5 font-medium">{h.name}</td>
                <td className="px-2 py-2.5">
                  {h.isCash ? "—" : formatMoney(h.price, currency)}
                </td>
                <td className="px-2 py-2.5">
                  {h.isCash ? "—" : h.previousQuantity}
                </td>
                <td
                  className="px-2 py-2.5 font-semibold"
                  style={
                    !h.isCash && h.addedQuantity > 0
                      ? { color: colors.buy }
                      : undefined
                  }
                >
                  {h.isCash ? "—" : h.addedQuantity}
                </td>
                <td
                  className="px-2 py-2.5 font-semibold"
                  style={
                    !h.isCash && (h.soldQuantity ?? 0) > 0
                      ? { color: colors.sell }
                      : undefined
                  }
                >
                  {h.isCash ? "—" : h.soldQuantity ?? 0}
                </td>
                <td className="px-2 py-2.5 font-semibold">
                  {h.isCash ? "—" : h.finalQuantity}
                </td>
                <td className="px-2 py-2.5">
                  {formatMoney(h.finalValue, currency)}
                </td>
                <td className="px-2 py-2.5">
                  {formatGroupedNumber(h.finalWeight, { maxFractionDigits: 2 })}%
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <HoldingsSummaryRow
              label={t("result.buyTotal")}
              value={formatMoney(buyTotal, currency)}
              valueColor={colors.buy}
            />
            <HoldingsSummaryRow
              label={t("result.sellTotal")}
              value={formatMoney(sellTotal, currency)}
              valueColor={colors.sell}
            />
            <HoldingsSummaryRow
              label={t("result.totalCapital")}
              value={formatMoney(totalCapital, currency)}
              emphasize
            />
          </tfoot>
        </table>
      </div>

      <div className="border-t border-slate-100 pt-4">
        <h3 className="mb-3 text-sm font-semibold text-slate-800">
          {t("result.chart")}
        </h3>
        <PortfolioPieChart slices={slices} emptyLabel={t("portfolioEmpty")} />
      </div>
    </section>
  );
}

function TradeRow({
  plan,
  mode,
  currency,
  qtyColor,
}: {
  plan: TargetTradePlan;
  mode: TradeMode;
  currency: CurrencyCode;
  qtyColor: string;
}) {
  const qty = mode === "buy" ? plan.buyShares : plan.sellShares;
  const amount = plan.price * qty;
  return (
    <tr className="border-b border-slate-100 text-slate-800">
      <td className="px-2 py-2.5 font-medium">{plan.name}</td>
      <td className="px-2 py-2.5">{formatMoney(plan.price, currency)}</td>
      <td className="px-2 py-2.5">
        {formatGroupedNumber(plan.weight, { maxFractionDigits: 3 })}%
      </td>
      <td className="px-2 py-2.5">{formatMoney(plan.targetAmount, currency)}</td>
      <td className="px-2 py-2.5">{plan.previousQuantity}</td>
      <td className="px-2 py-2.5 font-semibold" style={{ color: qtyColor }}>
        {qty}
      </td>
      <td className="px-2 py-2.5">{formatMoney(amount, currency)}</td>
    </tr>
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

function HoldingsSummaryRow({
  label,
  value,
  emphasize = false,
  valueColor,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
  valueColor?: string;
}) {
  return (
    <tr
      className={`border-t text-slate-800 ${
        emphasize
          ? "border-slate-300 bg-slate-100 font-semibold"
          : "border-slate-200 bg-slate-50/80"
      }`}
    >
      <td
        colSpan={6}
        className={`px-2 py-2.5 text-right ${
          emphasize ? "text-slate-800" : "text-slate-600"
        }`}
      >
        {label}
      </td>
      <td
        className="px-2 py-2.5 tabular-nums"
        style={valueColor ? { color: valueColor } : undefined}
      >
        {value}
      </td>
      <td className="px-2 py-2.5" />
    </tr>
  );
}
