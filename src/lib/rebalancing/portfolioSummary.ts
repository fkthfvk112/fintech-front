import {
  PortfolioHolding,
  PortfolioSlice,
  PortfolioSummary,
} from "@/rebalancing/interface/types";
import { fromMinor, toMinor } from "./money";

export function holdingValueMinor(holding: PortfolioHolding): number {
  return toMinor(holding.price) * holding.quantity;
}

export function calculatePortfolioSummary(
  holdings: PortfolioHolding[]
): PortfolioSummary {
  const totalMinor = holdings.reduce(
    (sum, h) => sum + holdingValueMinor(h),
    0
  );

  const slices: PortfolioSlice[] = holdings.map((h) => {
    const valueMinor = holdingValueMinor(h);
    return {
      id: h.id,
      name: h.name,
      value: fromMinor(valueMinor),
      weight: totalMinor === 0 ? 0 : (valueMinor / totalMinor) * 100,
    };
  });

  return {
    totalValue: fromMinor(totalMinor),
    slices,
  };
}
