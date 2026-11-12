"use client";

import { Plus, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/Button";
import {
  formatInputWithCommas,
  formatMoney,
  parseAmountString,
  parseNonNegativeIntegerString,
} from "@/lib/rebalancing/money";
import { calculatePortfolioSummary } from "@/lib/rebalancing/portfolioSummary";
import { createRowId } from "@/lib/rebalancing/names";
import {
  CurrencyCode,
  PortfolioHolding,
  PortfolioHoldingInput,
} from "@/rebalancing/interface/types";
import { PortfolioPieChart } from "./PortfolioPieChart";

interface PortfolioEditorProps {
  currency: CurrencyCode;
  draft: PortfolioHoldingInput[];
  errors: Record<string, { name?: string; price?: string; quantity?: string }>;
  onChange: (id: string, patch: Partial<PortfolioHoldingInput>) => void;
  onAdd: () => void;
  onDelete: (id: string) => void;
  onSave: () => void;
  onLoad: () => void;
}

function draftToHoldingsPreview(draft: PortfolioHoldingInput[]): PortfolioHolding[] {
  const holdings: PortfolioHolding[] = [];
  for (const row of draft) {
    const name = row.name.trim();
    const price = parseAmountString(row.price);
    const quantity = parseNonNegativeIntegerString(row.quantity);
    if (!name || price === null || price <= 0 || quantity === null) continue;
    holdings.push({ id: row.id, name, price, quantity });
  }
  return holdings;
}

export function createEmptyHoldingInput(): PortfolioHoldingInput {
  return {
    id: createRowId(),
    name: "",
    price: "",
    quantity: "",
  };
}

export function PortfolioEditor({
  currency,
  draft,
  errors,
  onChange,
  onAdd,
  onDelete,
  onSave,
  onLoad,
}: PortfolioEditorProps) {
  const { t } = useTranslation("portfolio");
  const summary = calculatePortfolioSummary(draftToHoldingsPreview(draft));

  return (
    <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-slate-800">
          {t("portfolioSection")}
        </h2>
        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" variant="outline" onClick={onLoad}>
            {t("loadPortfolio")}
          </Button>
          <Button type="button" size="sm" onClick={onSave}>
            {t("savePortfolio")}
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {draft.map((row) => {
          const err = errors[row.id];
          return (
            <div
              key={row.id}
              className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 p-3 sm:grid-cols-[1.2fr_1fr_1fr_auto]"
            >
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">
                  {t("name")}
                </label>
                <input
                  type="text"
                  value={row.name}
                  onChange={(e) => onChange(row.id, { name: e.target.value })}
                  className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-1 ${
                    err?.name
                      ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500"
                      : "border-slate-300 focus:border-emerald-600 focus:ring-emerald-600"
                  }`}
                />
                {err?.name && (
                  <p className="mt-1 text-xs text-rose-600">{err.name}</p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">
                  {t("price")}
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={row.price}
                  onChange={(e) =>
                    onChange(row.id, {
                      price: formatInputWithCommas(e.target.value),
                    })
                  }
                  className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-1 ${
                    err?.price
                      ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500"
                      : "border-slate-300 focus:border-emerald-600 focus:ring-emerald-600"
                  }`}
                />
                {err?.price && (
                  <p className="mt-1 text-xs text-rose-600">{err.price}</p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">
                  {t("quantity")}
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={row.quantity}
                  onChange={(e) =>
                    onChange(row.id, {
                      quantity: formatInputWithCommas(
                        e.target.value.replace(/\./g, "")
                      ),
                    })
                  }
                  className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-1 ${
                    err?.quantity
                      ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500"
                      : "border-slate-300 focus:border-emerald-600 focus:ring-emerald-600"
                  }`}
                />
                {err?.quantity && (
                  <p className="mt-1 text-xs text-rose-600">{err.quantity}</p>
                )}
              </div>
              <div className="flex sm:items-end sm:pb-0.5">
                <button
                  type="button"
                  onClick={() => onDelete(row.id)}
                  className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-rose-600 hover:bg-rose-50"
                  aria-label={t("delete")}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sm:hidden">{t("delete")}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-center pt-1">
        <Button type="button" size="sm" variant="secondary" onClick={onAdd}>
          <Plus className="mr-1 h-4 w-4" />
          {t("addHolding")}
        </Button>
      </div>

      <div className="border-t border-slate-100 pt-4">
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-sm font-semibold text-slate-800">
            {t("portfolioChart")}
          </h3>
          <p className="text-sm text-slate-600">
            {t("portfolioTotal")}:{" "}
            <span className="font-semibold text-slate-900">
              {formatMoney(summary.totalValue, currency)}
            </span>
          </p>
        </div>
        <PortfolioPieChart
          slices={summary.slices}
          emptyLabel={t("portfolioEmpty")}
        />
      </div>
    </section>
  );
}
