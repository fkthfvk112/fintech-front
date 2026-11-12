export type CurrencyCode = "USD" | "KRW" | "JPY";

export interface StockRowInput {
  id: string;
  name: string;
  isDefaultName: boolean;
  /** raw string from input; empty when unset */
  price: string;
  /** raw string from input; empty when unset */
  weight: string;
  /** Row mirrored from current portfolio draft (name/price read-only). */
  fromPortfolio?: boolean;
  /** Original portfolio price string; used when a manual row overrides price. */
  originalPrice?: string;
  /** Portfolio holding id when fromPortfolio. */
  sourceHoldingId?: string;
  /** Shares currently held when fromPortfolio. */
  heldQuantity?: number;
}

export interface StockForCalc {
  id: string;
  name: string;
  /** price in minor units (cents) */
  priceMinor: number;
  /** target weight percent, e.g. 25.5 */
  weight: number;
}

export interface StockResult {
  id: string;
  name: string;
  price: number;
  targetWeight: number;
  targetAmount: number;
  shares: number;
  actualAmount: number;
  actualWeight: number;
  /** Intentional cash sleeve (remaining weight under 100%). */
  isCash?: boolean;
}

export interface RebalancingResult {
  totalBudget: number;
  actualSpend: number;
  cashRemaining: number;
  totalShares: number;
  stocks: StockResult[];
}

export interface FieldErrors {
  totalAmount?: string;
  rows?: Record<string, { name?: string; price?: string; weight?: string }>;
  weightSum?: string;
  general?: string;
}

/** Saved / draft portfolio holding (localStorage via Jotai). */
export interface PortfolioHolding {
  id: string;
  name: string;
  /** Current price per share */
  price: number;
  /** Shares held (integer >= 0) */
  quantity: number;
}

/** Named portfolio snapshot persisted in localStorage. */
export interface SavedPortfolio {
  id: string;
  name: string;
  /** ISO timestamp */
  savedAt: string;
  holdings: PortfolioHolding[];
}

/** Raw row while editing portfolio in the form. */
export interface PortfolioHoldingInput {
  id: string;
  name: string;
  price: string;
  quantity: string;
}

export interface PortfolioSlice {
  id: string;
  name: string;
  value: number;
  weight: number;
}

export interface PortfolioSummary {
  totalValue: number;
  slices: PortfolioSlice[];
}

/** 리밸런싱 후 최종 보유 내역의 한 행 (현금 행 포함). */
export interface MergedHoldingResult {
  id: string;
  name: string;
  price: number;
  previousQuantity: number;
  addedQuantity: number;
  soldQuantity: number;
  finalQuantity: number;
  finalValue: number;
  /** 총 금액(주식 + 현금) 대비 비중 % */
  finalWeight: number;
  /** 주식으로 채우고 남은 현금 행 */
  isCash?: boolean;
}

/** 종목별 매수/매도 계획. */
export interface TargetTradePlan {
  id: string;
  name: string;
  price: number;
  /** 목표 비중 % */
  weight: number;
  previousQuantity: number;
  /** 총 금액 × 비중 */
  targetAmount: number;
  buyShares: number;
  sellShares: number;
}

export interface PortfolioAddResult {
  additionalBudget: number;
  /** 현재가로 평가한 기존 보유 금액 */
  previousPortfolioValue: number;
  /** 기존 보유 금액 + 추가 금액 */
  totalCapital: number;
  /** 매수 총액 */
  actualSpend: number;
  /** 매도 총액 */
  actualSellProceeds: number;
  /** 총 금액 − 최종 주식 평가액 */
  cashRemaining: number;
  plans: TargetTradePlan[];
  holdings: MergedHoldingResult[];
}
