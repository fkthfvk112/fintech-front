import {
  RebalancingResult,
  StockForCalc,
  StockResult,
} from "@/rebalancing/interface/types";
import { fromMinor, toMinor } from "./money";

const CASH_RESULT_ID = "__cash__";

export interface CalculateOptions {
  /** 미입력 비중(100% − 종목 비중 합). 현금 행의 목표 비중으로만 쓰인다. */
  cashWeight?: number;
  /** 현금 행 표시 이름 */
  cashLabel?: string;
}

/**
 * 기본 계산기 (보유 종목 없음)
 * 1) 총 금액 = 총 매수 금액
 * 2) 할당 금액 = 총 금액 × 종목 비중
 * 3) 매수 수량 = 할당 금액 ÷ 가격 (내림)
 * 4) 주식으로 채우고 남은 차액은 전부 현금
 *
 * 금액은 부동소수 오차를 피하려고 minor 단위(×100 정수)로 계산한다.
 */
export function calculateRebalancing(
  totalBudget: number,
  stocks: StockForCalc[],
  options: CalculateOptions = {}
): RebalancingResult {
  const cashWeight = Math.max(0, options.cashWeight ?? 0);
  const totalMinor = toMinor(totalBudget);

  // 2)·3) 종목별 할당 금액 → 매수 수량
  const bought = stocks.map((s) => {
    const targetAmountMinor = Math.round((totalMinor * s.weight) / 100);
    // 가격이 minor 단위로 0이 되는 극소 가격은 살 수 없으므로 0주로 둔다.
    const shares =
      s.priceMinor > 0 ? Math.floor(targetAmountMinor / s.priceMinor) : 0;
    return {
      ...s,
      targetAmountMinor,
      shares,
      actualAmountMinor: shares * s.priceMinor,
    };
  });

  // 4) 남은 차액 = 현금
  const spentMinor = bought.reduce((sum, b) => sum + b.actualAmountMinor, 0);
  const cashMinor = totalMinor - spentMinor;

  // 실제 비중은 주식 + 현금을 합친 총 금액 기준
  const weightOf = (valueMinor: number) =>
    totalMinor === 0 ? 0 : (valueMinor / totalMinor) * 100;

  const results: StockResult[] = bought.map((b) => ({
    id: b.id,
    name: b.name,
    price: fromMinor(b.priceMinor),
    targetWeight: b.weight,
    targetAmount: fromMinor(b.targetAmountMinor),
    shares: b.shares,
    actualAmount: fromMinor(b.actualAmountMinor),
    actualWeight: weightOf(b.actualAmountMinor),
  }));

  if (cashWeight > 0 || cashMinor !== 0) {
    results.push({
      id: CASH_RESULT_ID,
      name: options.cashLabel ?? "Cash",
      price: 0,
      targetWeight: cashWeight,
      targetAmount: fromMinor(Math.round((totalMinor * cashWeight) / 100)),
      shares: 0,
      actualAmount: fromMinor(cashMinor),
      actualWeight: weightOf(cashMinor),
      isCash: true,
    });
  }

  return {
    totalBudget,
    actualSpend: fromMinor(spentMinor),
    cashRemaining: fromMinor(cashMinor),
    totalShares: bought.reduce((sum, b) => sum + b.shares, 0),
    stocks: results,
  };
}
