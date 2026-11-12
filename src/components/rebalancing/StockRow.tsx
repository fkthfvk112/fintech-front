"use client";

import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ColorCode } from "@/constants/Colors";
import { CurrencyCode, StockRowInput } from "@/rebalancing/interface/types";
import {
  formatGroupedNumber,
  formatInputWithCommas,
  formatMoney,
  fromMinor,
  parseAmountString,
  toMinor,
} from "@/lib/rebalancing/money";

interface StockRowProps {
  row: StockRowInput;
  canDelete: boolean;
  nameError?: string;
  priceError?: string;
  weightError?: string;
  nameLabel?: string;
  overriddenPrice?: string;
  portfolioBadge?: string;
  priceMismatchMessage?: string;
  /** When set, portfolio weight is locked and focus redirects here. */
  weightLocked?: boolean;
  focusWeightTargetId?: string | null;
  currency?: CurrencyCode;
  heldQuantityLabel?: string;
  holdingValueLabel?: string;
  onChange: (id: string, patch: Partial<StockRowInput>) => void;
  onDelete: (id: string) => void;
}

export function StockRow({
  row,
  canDelete,
  nameError,
  priceError,
  weightError,
  nameLabel,
  overriddenPrice,
  portfolioBadge,
  priceMismatchMessage,
  weightLocked = false,
  focusWeightTargetId,
  currency = "KRW",
  heldQuantityLabel,
  holdingValueLabel,
  onChange,
  onDelete,
}: StockRowProps) {
  const { t } = useTranslation("calculator");
  const fromPortfolio = Boolean(row.fromPortfolio);
  const portfolioPriceNum = parseAmountString(row.price);
  const overrideNum = overriddenPrice
    ? parseAmountString(overriddenPrice)
    : null;
  const showOverride =
    fromPortfolio &&
    overrideNum !== null &&
    portfolioPriceNum !== null &&
    overrideNum !== portfolioPriceNum;

  const effectivePrice = showOverride ? overrideNum : portfolioPriceNum;
  const heldQuantity = row.heldQuantity ?? 0;
  const holdingValue =
    effectivePrice !== null && effectivePrice > 0
      ? fromMinor(toMinor(effectivePrice) * heldQuantity)
      : 0;

  const focusTwinWeight = () => {
    if (!focusWeightTargetId) return;
    const el = document.querySelector<HTMLInputElement>(
      `[data-weight-id="${focusWeightTargetId}"]`
    );
    el?.focus();
  };

  return (
    <div
      className={`space-y-3 rounded-xl border p-3 ${
        fromPortfolio
          ? "border-emerald-200 bg-emerald-50/50"
          : "border-slate-200 bg-white"
      }`}
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-start">
        <div>
          <label className="mb-1 flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <span>{nameLabel ?? t("name")}</span>
            {fromPortfolio && portfolioBadge && (
              <span className="font-semibold text-emerald-700">
                {portfolioBadge}
              </span>
            )}
          </label>
          <input
            type="text"
            value={row.name}
            onFocus={() => {
              if (!fromPortfolio && row.isDefaultName) {
                onChange(row.id, { name: "", isDefaultName: false });
              }
            }}
            onChange={(e) =>
              onChange(row.id, { name: e.target.value, isDefaultName: false })
            }
            className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-1 ${
              nameError
                ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500"
                : "border-slate-300 focus:border-emerald-600 focus:ring-emerald-600"
            }`}
          />
          {nameError && <p className="mt-1 text-xs text-rose-600">{nameError}</p>}
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">
            {t("price")}
          </label>
          {showOverride ? (
            <div className="space-y-1">
              <div className="flex min-h-[42px] flex-wrap items-center gap-2 rounded-lg border border-slate-300 bg-slate-100 px-3 py-2 text-sm">
                <span className="text-slate-400 line-through">{row.price}</span>
                <span className="font-semibold text-slate-900">
                  {overriddenPrice}
                </span>
              </div>
            {priceMismatchMessage && (
              <p
                className="flex items-start gap-1 text-xs font-medium"
                style={{ color: ColorCode.info }}
              >
                <InfoOutlinedIcon
                  sx={{ fontSize: 14, mt: "1px", flexShrink: 0 }}
                  aria-hidden
                />
                <span>{priceMismatchMessage}</span>
              </p>
            )}
            </div>
          ) : (
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
                priceError
                  ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500"
                  : "border-slate-300 focus:border-emerald-600 focus:ring-emerald-600"
              }`}
            />
          )}
          {priceError && (
            <p className="mt-1 text-xs text-rose-600">{priceError}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">
            {t("weight")}
          </label>
          <input
            type="text"
            inputMode="decimal"
            data-weight-id={row.id}
            value={weightLocked ? "" : row.weight}
            readOnly={weightLocked}
            onFocus={() => {
              if (weightLocked) {
                focusTwinWeight();
              }
            }}
            onClick={() => {
              if (weightLocked) {
                focusTwinWeight();
              }
            }}
            onChange={(e) => {
              if (weightLocked) return;
              onChange(row.id, {
                weight: formatInputWithCommas(e.target.value),
              });
            }}
            className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-1 ${
              weightLocked ? "cursor-pointer bg-slate-100 text-slate-400" : ""
            } ${
              weightError
                ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500"
                : "border-slate-300 focus:border-emerald-600 focus:ring-emerald-600"
            }`}
          />
          {weightError && (
            <p className="mt-1 text-xs text-rose-600">{weightError}</p>
          )}
        </div>

        <div className="flex sm:pt-6">
          <button
            type="button"
            disabled={!canDelete || fromPortfolio}
            onClick={() => onDelete(row.id)}
            className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 disabled:pointer-events-none disabled:opacity-40"
            aria-label={t("delete")}
          >
            <Trash2 className="h-4 w-4" />
            <span className="sm:hidden">{t("delete")}</span>
          </button>
        </div>
      </div>

      {fromPortfolio && (heldQuantityLabel || holdingValueLabel) && (
        <div className="grid grid-cols-1 gap-3 border-t border-emerald-100 pt-3 sm:grid-cols-2">
          {heldQuantityLabel && (
            <div>
              <p className="mb-1 text-xs font-medium text-slate-500">
                {heldQuantityLabel}
              </p>
              <p className="text-sm font-semibold text-slate-800">
                {formatGroupedNumber(heldQuantity, { maxFractionDigits: 0 })}
              </p>
            </div>
          )}
          {holdingValueLabel && (
            <div>
              <p className="mb-1 text-xs font-medium text-slate-500">
                {holdingValueLabel}
              </p>
              <p className="text-sm font-semibold text-slate-800">
                {formatMoney(holdingValue, currency)}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
