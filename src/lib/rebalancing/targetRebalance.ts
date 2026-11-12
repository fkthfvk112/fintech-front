import {
  MergedHoldingResult,
  PortfolioAddResult,
  PortfolioHolding,
  StockRowInput,
} from "@/rebalancing/interface/types";
import { fromMinor, parseAmountString, toMinor } from "./money";
import { mergePurchaseRowsForCalc, normalizeStockName } from "./purchaseRows";

const CASH_RESULT_ID = "__cash__";

/**
 * 목표 비중 리밸런싱
 * 1) 총 금액 = 현재가로 평가한 기존 보유 금액 + 추가 금액
 * 2) 할당 금액 = 총 금액 × 종목 비중
 * 3) 목표 수량 = 할당 금액 ÷ 가격 (내림)
 *    보유 수량이 목표보다 많으면 매도, 같으면 홀딩, 적으면 매수
 * 4) 주식으로 채우고 남은 차액은 전부 현금
 *
 * 금액은 부동소수 오차를 피하려고 minor 단위(×100 정수)로 계산한다.
 */
export function calculateTargetRebalance(
  holdings: PortfolioHolding[],
  purchaseRows: StockRowInput[],
  additionalBudget: number,
  options?: { cashLabel?: string }
): PortfolioAddResult {
  // 종목명 기준으로 보유 종목과 입력 행을 하나로 합친다.
  // 보유 종목은 일단 비중 0%로 넣고, 입력 행이 있으면 현재가·비중을 덮어쓴다.
  // (비중 입력이 끝내 없는 보유 종목은 0% → 전량 매도 대상)
  const stockMap = new Map<
    string,
    {
      id: string;
      name: string;
      priceMinor: number;
      weight: number;
      previousQuantity: number;
    }
  >();

  for (const h of holdings) {
    const name = normalizeStockName(h.name);
    stockMap.set(name, {
      id: h.id,
      name,
      priceMinor: toMinor(h.price),
      weight: 0,
      previousQuantity: h.quantity,
    });
  }

  for (const row of mergePurchaseRowsForCalc(purchaseRows)) {
    const name = normalizeStockName(row.name);
    const price = parseAmountString(row.price);
    const weight = parseAmountString(row.weight);
    if (!name || !price || !weight) continue;

    const held = stockMap.get(name);
    stockMap.set(name, {
      id: held?.id ?? row.id,
      name,
      priceMinor: toMinor(price),
      weight,
      previousQuantity: held?.previousQuantity ?? 0,
    });
  }

  const stocks = Array.from(stockMap.values());

  // 1) 총 금액
  const previousMinor = stocks.reduce(
    (sum, s) => sum + s.priceMinor * s.previousQuantity,
    0
  );
  const totalMinor = previousMinor + toMinor(additionalBudget);

  // 2)·3) 종목별 할당 금액 → 목표 수량 → 매수/매도 수량
  const trades = stocks.map((s) => {
    const targetAmountMinor = Math.round((totalMinor * s.weight) / 100);
    // 가격이 minor 단위로 0이 되는 극소 가격은 살 수 없으므로 0주로 둔다.
    const targetQuantity =
      s.priceMinor > 0 ? Math.floor(targetAmountMinor / s.priceMinor) : 0;
    const diff = targetQuantity - s.previousQuantity;
    return {
      ...s,
      targetAmountMinor,
      targetQuantity,
      finalValueMinor: targetQuantity * s.priceMinor,
      buyShares: Math.max(diff, 0),
      sellShares: Math.max(-diff, 0),
    };
  });

  // 4) 남은 차액 = 현금
  const stockMinor = trades.reduce((sum, t) => sum + t.finalValueMinor, 0);
  const cashMinor = totalMinor - stockMinor;

  // 비중은 주식 + 현금을 합친 총 금액 기준
  const weightOf = (valueMinor: number) =>
    totalMinor === 0 ? 0 : (valueMinor / totalMinor) * 100;

  const holdingsResult: MergedHoldingResult[] = trades
    .filter((t) => t.targetQuantity > 0)
    .map((t) => ({
      id: t.id,
      name: t.name,
      price: fromMinor(t.priceMinor),
      previousQuantity: t.previousQuantity,
      addedQuantity: t.buyShares,
      soldQuantity: t.sellShares,
      finalQuantity: t.targetQuantity,
      finalValue: fromMinor(t.finalValueMinor),
      finalWeight: weightOf(t.finalValueMinor),
    }));

  if (cashMinor !== 0) {
    holdingsResult.push({
      id: CASH_RESULT_ID,
      name: options?.cashLabel ?? "Cash",
      price: 0,
      previousQuantity: 0,
      addedQuantity: 0,
      soldQuantity: 0,
      finalQuantity: 0,
      finalValue: fromMinor(cashMinor),
      finalWeight: weightOf(cashMinor),
      isCash: true,
    });
  }

  return {
    additionalBudget,
    previousPortfolioValue: fromMinor(previousMinor),
    totalCapital: fromMinor(totalMinor),
    actualSpend: fromMinor(
      trades.reduce((sum, t) => sum + t.buyShares * t.priceMinor, 0)
    ),
    actualSellProceeds: fromMinor(
      trades.reduce((sum, t) => sum + t.sellShares * t.priceMinor, 0)
    ),
    cashRemaining: fromMinor(cashMinor),
    plans: trades.map((t) => ({
      id: t.id,
      name: t.name,
      price: fromMinor(t.priceMinor),
      weight: t.weight,
      previousQuantity: t.previousQuantity,
      targetAmount: fromMinor(t.targetAmountMinor),
      buyShares: t.buyShares,
      sellShares: t.sellShares,
    })),
    holdings: holdingsResult,
  };
}

/** 계산 결과의 최종 보유 내역을 저장 가능한 포트폴리오로 변환한다 (현금 행 제외). */
export function holdingsFromAddResult(
  result: PortfolioAddResult
): PortfolioHolding[] {
  return result.holdings
    .filter((h) => !h.isCash && h.finalQuantity > 0)
    .map((h) => ({
      id: h.id,
      name: h.name,
      price: h.price,
      quantity: h.finalQuantity,
    }));
}
