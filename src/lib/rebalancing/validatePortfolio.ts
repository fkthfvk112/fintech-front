import {
  FieldErrors,
  PortfolioHolding,
  PortfolioHoldingInput,
  StockForCalc,
  StockRowInput,
} from "@/rebalancing/interface/types";
import {
  parseAmountString,
  parsePositiveIntegerString,
  toMinor,
} from "./money";
import {
  findManualTwinId,
  mergePurchaseRowsForCalc,
  normalizeStockName,
} from "./purchaseRows";
import { sumWeights } from "./validate";

type TFn = (key: string) => string;

export interface PortfolioValidationSuccess {
  ok: true;
  holdings: PortfolioHolding[];
}

export interface PortfolioValidationFailure {
  ok: false;
  errors: Record<string, { name?: string; price?: string; quantity?: string }>;
  general?: string;
}

export type PortfolioValidationResult =
  | PortfolioValidationSuccess
  | PortfolioValidationFailure;

export function validatePortfolioDraft(
  rows: PortfolioHoldingInput[],
  t: TFn
): PortfolioValidationResult {
  const errors: Record<
    string,
    { name?: string; price?: string; quantity?: string }
  > = {};
  const nameCounts = new Map<string, number>();
  const holdings: PortfolioHolding[] = [];

  for (const row of rows) {
    const name = row.name.trim();
    if (name) {
      nameCounts.set(name, (nameCounts.get(name) ?? 0) + 1);
    }
  }

  for (const row of rows) {
    const rowErr: { name?: string; price?: string; quantity?: string } = {};
    const name = row.name.trim();

    if (!name) {
      rowErr.name = t("errors.nameRequired");
    } else if ((nameCounts.get(name) ?? 0) > 1) {
      rowErr.name = t("errors.nameDuplicate");
    }

    const price = parseAmountString(row.price);
    if (row.price.trim() === "") {
      rowErr.price = t("errors.priceRequired");
    } else if (price === null || price <= 0) {
      rowErr.price = t("errors.pricePositive");
    }

    const cleanedQty = row.quantity.replace(/,/g, "").trim();
    let quantity: number | null = null;
    if (cleanedQty === "") {
      rowErr.quantity = t("errors.quantityRequired");
    } else if (!/^\d+$/.test(cleanedQty)) {
      rowErr.quantity = t("errors.quantityInteger");
    } else {
      quantity = Number(cleanedQty);
      if (!Number.isInteger(quantity) || quantity < 0) {
        rowErr.quantity = t("errors.quantityInteger");
      }
    }

    if (rowErr.name || rowErr.price || rowErr.quantity) {
      errors[row.id] = rowErr;
    } else if (price !== null && quantity !== null) {
      holdings.push({
        id: row.id,
        name,
        price,
        quantity,
      });
    }
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return { ok: true, holdings };
}

export interface AdditionalPurchaseSuccess {
  ok: true;
  totalBudget: number;
  stocks: StockForCalc[];
  cashWeight: number;
}

export interface AdditionalPurchaseFailure {
  ok: false;
  errors: FieldErrors;
}

export type AdditionalPurchaseResult =
  | AdditionalPurchaseSuccess
  | AdditionalPurchaseFailure;

/**
 * Validate additional-purchase rows for target rebalance.
 * - Portfolio + one manual same-name: allowed; weight required on manual only
 * - Otherwise both portfolio and manual rows need their own weights
 */
export function validateAdditionalPurchase(
  totalAmountRaw: string,
  rows: StockRowInput[],
  t: TFn
): AdditionalPurchaseResult {
  const errors: FieldErrors = { rows: {} };

  if (rows.length === 0) {
    errors.general = t("errors.noRows");
    return { ok: false, errors };
  }

  const totalBudget = parsePositiveIntegerString(totalAmountRaw);
  if (totalAmountRaw.trim() === "") {
    errors.totalAmount = t("errors.additionalRequired");
  } else if (totalBudget === null || totalBudget <= 0) {
    errors.totalAmount = t("errors.additionalPositive");
  }

  const manualNameCounts = new Map<string, number>();
  for (const row of rows) {
    if (row.fromPortfolio) continue;
    const name = normalizeStockName(row.name);
    if (name) manualNameCounts.set(name, (manualNameCounts.get(name) ?? 0) + 1);
  }

  for (const row of rows) {
    const rowErr: { name?: string; price?: string; weight?: string } = {};
    const name = normalizeStockName(row.name);
    const twinId = findManualTwinId(rows, row);
    const hasTwin = Boolean(twinId);

    if (!name) {
      rowErr.name = t("errors.nameRequired");
    } else if (!row.fromPortfolio && (manualNameCounts.get(name) ?? 0) > 1) {
      rowErr.name = t("errors.nameDuplicate");
    }

    // Portfolio price may be overridden visually by twin; still require base price
    // unless twin supplies price (then portfolio price field may be hidden).
    const twin = twinId ? rows.find((r) => r.id === twinId) : undefined;
    const twinPrice = twin ? parseAmountString(twin.price) : null;
    const price = parseAmountString(row.price);

    if (row.fromPortfolio && hasTwin && twinPrice !== null && twinPrice > 0) {
      // portfolio price OK via twin
    } else if (row.price.trim() === "") {
      rowErr.price = t("errors.priceRequired");
    } else if (price === null || price <= 0) {
      rowErr.price = t("errors.pricePositive");
    }

    if (row.fromPortfolio && hasTwin) {
      // weight locked — required on twin instead
    } else {
      const weight = parseAmountString(row.weight);
      if (row.weight.trim() === "") {
        rowErr.weight = t("errors.weightRequired");
      } else if (weight === null || weight <= 0 || weight > 100) {
        rowErr.weight = t("errors.weightRange");
      }
    }

    // Manual twin must have weight
    if (!row.fromPortfolio) {
      const weight = parseAmountString(row.weight);
      if (row.weight.trim() === "") {
        rowErr.weight = t("errors.weightRequired");
      } else if (weight === null || weight <= 0 || weight > 100) {
        rowErr.weight = t("errors.weightRange");
      }
    }

    if (rowErr.name || rowErr.price || rowErr.weight) {
      errors.rows![row.id] = rowErr;
    }
  }

  const merged = mergePurchaseRowsForCalc(rows);
  const weightTotal = sumWeights(merged);

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

  const stocks: StockForCalc[] = [];
  for (const row of merged) {
    const name = normalizeStockName(row.name);
    const price = parseAmountString(row.price);
    const weight = parseAmountString(row.weight);
    if (
      !name ||
      price === null ||
      price <= 0 ||
      weight === null ||
      weight <= 0 ||
      weight > 100
    ) {
      errors.general = t("errors.noRows");
      return { ok: false, errors };
    }
    stocks.push({
      id: row.id,
      name,
      priceMinor: toMinor(price),
      weight,
    });
  }

  if (stocks.length === 0) {
    errors.general = t("errors.noRows");
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

export function holdingToInput(h: PortfolioHolding): PortfolioHoldingInput {
  return {
    id: h.id,
    name: h.name,
    price: String(h.price),
    quantity: String(h.quantity),
  };
}
