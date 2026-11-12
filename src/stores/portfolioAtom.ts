import { atom } from "jotai";
import {
  PortfolioHolding,
  SavedPortfolio,
} from "@/rebalancing/interface/types";
import { createRowId } from "@/lib/rebalancing/names";
import { createSafeStorageAtom } from "./storageHelper";

export const PORTFOLIOS_STORAGE_KEY = "rebalancer.portfolios";
const LEGACY_PORTFOLIO_KEY = "rebalancer.portfolio";

function isHoldingArray(value: unknown): value is PortfolioHolding[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        item &&
        typeof item === "object" &&
        typeof (item as PortfolioHolding).id === "string" &&
        typeof (item as PortfolioHolding).name === "string" &&
        typeof (item as PortfolioHolding).price === "number" &&
        typeof (item as PortfolioHolding).quantity === "number"
    )
  );
}

function isSavedPortfolioArray(value: unknown): value is SavedPortfolio[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        item &&
        typeof item === "object" &&
        typeof (item as SavedPortfolio).id === "string" &&
        typeof (item as SavedPortfolio).name === "string" &&
        typeof (item as SavedPortfolio).savedAt === "string" &&
        Array.isArray((item as SavedPortfolio).holdings)
    )
  );
}

function readInitialPortfolios(): SavedPortfolio[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(PORTFOLIOS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as unknown;
      if (isSavedPortfolioArray(parsed)) return parsed;
    }

    // Migrate legacy single-portfolio storage
    const legacyRaw = window.localStorage.getItem(LEGACY_PORTFOLIO_KEY);
    if (legacyRaw) {
      const legacy = JSON.parse(legacyRaw) as unknown;
      if (isHoldingArray(legacy) && legacy.length > 0) {
        const migrated: SavedPortfolio[] = [
          {
            id: createRowId(),
            name: "Portfolio",
            savedAt: new Date().toISOString(),
            holdings: legacy,
          },
        ];
        window.localStorage.setItem(
          PORTFOLIOS_STORAGE_KEY,
          JSON.stringify(migrated)
        );
        window.localStorage.removeItem(LEGACY_PORTFOLIO_KEY);
        return migrated;
      }
    }
  } catch {
    // ignore parse/storage errors
  }

  return [];
}

/** Persisted named portfolios (Jotai ↔ localStorage). */
export const savedPortfoliosAtom = createSafeStorageAtom<SavedPortfolio[]>(
  PORTFOLIOS_STORAGE_KEY,
  typeof window !== "undefined" ? readInitialPortfolios() : []
);

export const upsertSavedPortfolioActionAtom = atom(
  null,
  (
    get,
    set,
    payload: {
      name: string;
      holdings: PortfolioHolding[];
    }
  ) => {
    const name = payload.name.trim();
    if (!name) return null;

    const now = new Date().toISOString();
    const list = get(savedPortfoliosAtom);
    // Same name (case-insensitive) overwrites; otherwise create a new entry.
    const existing = list.find(
      (p) => p.name.trim().toLowerCase() === name.toLowerCase()
    );

    if (existing) {
      const updated: SavedPortfolio = {
        ...existing,
        name,
        savedAt: now,
        holdings: payload.holdings,
      };
      set(
        savedPortfoliosAtom,
        list.map((p) => (p.id === existing.id ? updated : p))
      );
      return updated;
    }

    const created: SavedPortfolio = {
      id: createRowId(),
      name,
      savedAt: now,
      holdings: payload.holdings,
    };
    set(savedPortfoliosAtom, [created, ...list]);
    return created;
  }
);

export const deleteSavedPortfolioActionAtom = atom(
  null,
  (get, set, id: string) => {
    set(
      savedPortfoliosAtom,
      get(savedPortfoliosAtom).filter((p) => p.id !== id)
    );
  }
);
