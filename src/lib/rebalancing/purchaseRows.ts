import { StockRowInput } from "@/rebalancing/interface/types";
import { parseAmountString } from "./money";

export function normalizeStockName(name: string): string {
  return name.trim();
}

/** Manual twin names that override a portfolio row price. */
export function getPriceOverrideMap(rows: StockRowInput[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const row of rows) {
    if (row.fromPortfolio) continue;
    const key = normalizeStockName(row.name);
    if (!key) continue;
    const price = parseAmountString(row.price);
    if (price !== null && price > 0) {
      map.set(key, row.price);
    }
  }
  return map;
}

export function findManualTwinId(
  rows: StockRowInput[],
  portfolioRow: StockRowInput
): string | null {
  if (!portfolioRow.fromPortfolio) return null;
  const key = normalizeStockName(portfolioRow.name);
  if (!key) return null;
  const twin = rows.find(
    (r) => !r.fromPortfolio && normalizeStockName(r.name) === key
  );
  return twin?.id ?? null;
}

/**
 * Merge portfolio + manual purchase rows into unique calc entries.
 * Same name (portfolio + one manual): price from manual if set, else portfolio;
 * weight from manual only (portfolio weight ignored when twin exists).
 */
export function mergePurchaseRowsForCalc(rows: StockRowInput[]): StockRowInput[] {
  const portfolioByName = new Map<string, StockRowInput>();
  const manualByName = new Map<string, StockRowInput[]>();

  for (const row of rows) {
    const key = normalizeStockName(row.name);
    if (row.fromPortfolio) {
      if (key) portfolioByName.set(key, row);
      continue;
    }
    const listKey = key || "";
    const list = manualByName.get(listKey) ?? [];
    list.push(row);
    manualByName.set(listKey, list);
  }

  const merged: StockRowInput[] = [];
  const used = new Set<string>();

  Array.from(portfolioByName.entries()).forEach(([key, pf]) => {
    const manuals = manualByName.get(key) ?? [];
    used.add(key);
    if (manuals.length === 1) {
      const m = manuals[0];
      const manualPrice = parseAmountString(m.price);
      merged.push({
        ...pf,
        price: manualPrice !== null && manualPrice > 0 ? m.price : pf.price,
        weight: m.weight,
        fromPortfolio: true,
      });
    } else if (manuals.length > 1) {
      merged.push(pf, ...manuals);
    } else {
      merged.push(pf);
    }
  });

  Array.from(manualByName.entries()).forEach(([key, manuals]) => {
    if (key && used.has(key)) return;
    merged.push(...manuals);
  });

  return merged;
}
