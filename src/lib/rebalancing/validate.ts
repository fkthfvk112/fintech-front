import {
  FieldErrors,
  StockForCalc,
  StockRowInput,
} from "@/rebalancing/interface/types";
import {
  parseAmountString,
  parsePositiveIntegerString,
  toMinor,
} from "./money";

type TFn = (key: string) => string;

export interface ValidationSuccess {
  ok: true;
  totalBudget: number;
  stocks: StockForCalc[];
  /** Remaining weight (0–100) treated as cash when stock weights sum to < 100%. */
  cashWeight: number;
}

export interface ValidationFailure {
  ok: false;
  errors: FieldErrors;
}

export type ValidationResult = ValidationSuccess | ValidationFailure;

export function sumWeights(rows: StockRowInput[]): number {
  return rows.reduce((sum, row) => {
    const n = parseAmountString(row.weight);
    return sum + (n ?? 0);
  }, 0);
}

export function validateInputs(
  totalAmountRaw: string,
  rows: StockRowInput[],
  t: TFn
): ValidationResult {
  const errors: FieldErrors = { rows: {} };

  if (rows.length === 0) {
    errors.general = t("errors.noRows");
    return { ok: false, errors };
  }

  const totalBudget = parsePositiveIntegerString(totalAmountRaw);
  if (totalAmountRaw.trim() === "") {
    errors.totalAmount = t("errors.totalRequired");
  } else if (totalBudget === null || totalBudget <= 0) {
    errors.totalAmount = t("errors.totalPositive");
  }

  const stocks: StockForCalc[] = [];

  for (const row of rows) {
    const rowErr: { price?: string; weight?: string } = {};

    const price = parseAmountString(row.price);
    if (row.price.trim() === "") {
      rowErr.price = t("errors.priceRequired");
    } else if (price === null || price <= 0) {
      rowErr.price = t("errors.pricePositive");
    }

    const weight = parseAmountString(row.weight);
    if (row.weight.trim() === "") {
      rowErr.weight = t("errors.weightRequired");
    } else if (weight === null || weight <= 0 || weight > 100) {
      rowErr.weight = t("errors.weightRange");
    }

    if (rowErr.price || rowErr.weight) {
      errors.rows![row.id] = rowErr;
    } else if (price !== null && weight !== null) {
      stocks.push({
        id: row.id,
        name: row.name.trim() || "?",
        priceMinor: toMinor(price),
        weight,
      });
    }
  }

  const weightTotal = sumWeights(rows);
  // Over 100% is rejected; under 100% is filled with cash.
  if (
    Object.keys(errors.rows!).length === 0 &&
    !errors.totalAmount &&
    weightTotal > 100 + 1e-9
  ) {
    errors.weightSum = t("errors.weightSum");
  }

  const hasRowErrors = Object.keys(errors.rows!).length > 0;
  if (errors.totalAmount || hasRowErrors || errors.weightSum || errors.general) {
    return { ok: false, errors };
  }

  const cashWeight = Math.max(0, Math.round((100 - weightTotal) * 1e9) / 1e9);

  return {
    ok: true,
    totalBudget: totalBudget!,
    stocks,
    cashWeight,
  };
}
