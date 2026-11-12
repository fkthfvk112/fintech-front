"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/Button";
import { calculateRebalancing } from "@/lib/rebalancing/calculate";
import { createRowId, indexToName, nextDefaultName } from "@/lib/rebalancing/names";
import { formatInputWithCommas } from "@/lib/rebalancing/money";
import { sumWeights, validateInputs } from "@/lib/rebalancing/validate";
import {
  CurrencyCode,
  FieldErrors,
  RebalancingResult,
  StockRowInput,
} from "@/rebalancing/interface/types";
import { ModeToolbar } from "./ModeToolbar";
import { ResultPanel } from "./ResultPanel";
import { StockRow } from "./StockRow";
import { WeightBar } from "./WeightBar";

function createInitialRows(): StockRowInput[] {
  return [
    {
      id: createRowId(),
      name: indexToName(0),
      isDefaultName: true,
      price: "",
      weight: "",
    },
  ];
}

interface RebalancingCalculatorProps {
  /** 쉘 안에 임베드 (히어로·모드 카드는 상위에서 담당) */
  embedded?: boolean;
  currency: CurrencyCode;
  onCurrencyChange: (currency: CurrencyCode) => void;
}

export function RebalancingCalculator({
  embedded = false,
  currency,
  onCurrencyChange,
}: RebalancingCalculatorProps) {
  const { t } = useTranslation("calculator");
  const { t: tCommon } = useTranslation("common");

  const [totalAmount, setTotalAmount] = useState("");
  const [rows, setRows] = useState<StockRowInput[]>(createInitialRows);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [result, setResult] = useState<RebalancingResult | null>(null);
  const [stale, setStale] = useState(false);

  const weightSum = useMemo(() => sumWeights(rows), [rows]);
  const weightOver = weightSum > 100 + 1e-9;

  const markDirty = () => {
    if (result) setStale(true);
    setErrors({});
  };

  const updateRow = (id: string, patch: Partial<StockRowInput>) => {
    markDirty();
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const addRow = () => {
    markDirty();
    setRows((prev) => {
      const name = nextDefaultName(prev.map((r) => r.name));
      return [
        ...prev,
        {
          id: createRowId(),
          name,
          isDefaultName: true,
          price: "",
          weight: "",
        },
      ];
    });
  };

  const deleteRow = (id: string) => {
    markDirty();
    setRows((prev) => (prev.length <= 1 ? prev : prev.filter((r) => r.id !== id)));
  };

  const handleCalculate = () => {
    const validated = validateInputs(totalAmount, rows, (key) => t(key));
    if (!validated.ok) {
      setErrors(validated.errors);
      return;
    }

    const next = calculateRebalancing(validated.totalBudget, validated.stocks, {
      cashWeight: validated.cashWeight,
      cashLabel: t("cash"),
    });
    setResult(next);
    setStale(false);
    setErrors({});
  };

  return (
    <div className={embedded ? "" : "mx-auto min-h-screen max-w-5xl px-4 py-8 sm:px-6"}>
      <ModeToolbar
        title={tCommon("shell.basic.title")}
        description={t("subtitle")}
        currency={currency}
        onCurrencyChange={(next) => {
          markDirty();
          onCurrencyChange(next);
        }}
      />

      <section className="space-y-6">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-800">
            {t("totalAmount")}
          </label>
          <input
            type="text"
            inputMode="numeric"
            placeholder={t("totalAmountPlaceholder")}
            value={totalAmount}
            onChange={(e) => {
              markDirty();
              setTotalAmount(
                formatInputWithCommas(e.target.value.replace(/\./g, ""))
              );
            }}
            className={`w-full max-w-md rounded-xl border px-4 py-3 text-base outline-none focus:ring-1 ${
              errors.totalAmount
                ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500"
                : "border-slate-300 focus:border-[#4A89F3] focus:ring-[#4A89F3]"
            }`}
          />
          {errors.totalAmount && (
            <p className="mt-1.5 text-sm text-rose-600">{errors.totalAmount}</p>
          )}
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-800">{t("stockList")}</h3>

          <div className="space-y-3">
            {rows.map((row) => (
              <StockRow
                key={row.id}
                row={row}
                canDelete={rows.length > 1}
                priceError={errors.rows?.[row.id]?.price}
                weightError={errors.rows?.[row.id]?.weight}
                onChange={updateRow}
                onDelete={deleteRow}
              />
            ))}
          </div>

          <div className="flex justify-center pt-1">
            <Button type="button" size="sm" variant="secondary" onClick={addRow}>
              <Plus className="mr-1 h-4 w-4" />
              {t("addStock")}
            </Button>
          </div>

          <WeightBar sum={weightSum} />
          {errors.weightSum && (
            <p className="text-sm text-rose-600">{errors.weightSum}</p>
          )}
          {errors.general && (
            <p className="text-sm text-rose-600">{errors.general}</p>
          )}
        </div>

        <Button
          type="button"
          size="lg"
          onClick={handleCalculate}
          disabled={weightOver}
          className="w-full bg-[#4A89F3] hover:bg-[#3B7AE0] sm:w-auto"
        >
          {t("calculate")}
        </Button>
      </section>

      {result && (
        <ResultPanel
          result={result}
          currency={currency}
          stale={stale}
          onReset={() => {
            setResult(null);
            setStale(false);
          }}
        />
      )}
    </div>
  );
}
