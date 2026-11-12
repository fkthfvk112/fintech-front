/** Fixed-point money helpers (2 decimal places) to avoid float error. */

export const MONEY_SCALE = 100;

export function toMinor(amount: number): number {
  return Math.round(amount * MONEY_SCALE);
}

export function fromMinor(minor: number): number {
  return minor / MONEY_SCALE;
}

export function parseAmountString(raw: string): number | null {
  const cleaned = raw.replace(/,/g, "").trim();
  if (!cleaned) return null;
  if (!/^\d+(\.\d+)?$/.test(cleaned)) return null;
  const n = Number(cleaned);
  if (!Number.isFinite(n)) return null;
  return n;
}

export function parsePositiveIntegerString(raw: string): number | null {
  const cleaned = raw.replace(/,/g, "").trim();
  if (!cleaned) return null;
  if (!/^\d+$/.test(cleaned)) return null;
  const n = Number(cleaned);
  if (!Number.isFinite(n) || !Number.isInteger(n) || n <= 0) return null;
  return n;
}

/** Integer >= 0 (portfolio quantity). */
export function parseNonNegativeIntegerString(raw: string): number | null {
  const cleaned = raw.replace(/,/g, "").trim();
  if (!cleaned) return null;
  if (!/^\d+$/.test(cleaned)) return null;
  const n = Number(cleaned);
  if (!Number.isFinite(n) || !Number.isInteger(n) || n < 0) return null;
  return n;
}

export function formatGroupedNumber(
  value: number,
  options?: { maxFractionDigits?: number; minFractionDigits?: number }
): string {
  const max = options?.maxFractionDigits ?? 2;
  const min = options?.minFractionDigits ?? 0;
  return value.toLocaleString("en-US", {
    minimumFractionDigits: min,
    maximumFractionDigits: max,
  });
}

export function formatMoney(
  value: number,
  currency: "USD" | "KRW" | "JPY"
): string {
  if (currency === "KRW") {
    return `₩${formatGroupedNumber(Math.round(value), { maxFractionDigits: 0 })}`;
  }
  if (currency === "JPY") {
    return `¥${formatGroupedNumber(Math.round(value), { maxFractionDigits: 0 })}`;
  }
  return `$${formatGroupedNumber(value, { minFractionDigits: 2, maxFractionDigits: 2 })}`;
}

/** Format input display with thousand separators while typing integers/decimals. */
export function formatInputWithCommas(raw: string): string {
  const cleaned = raw.replace(/[^\d.]/g, "");
  if (!cleaned) return "";

  const parts = cleaned.split(".");
  const intPart = parts[0] ?? "";
  const fracPart = parts.length > 1 ? parts.slice(1).join("") : undefined;

  const withCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  if (fracPart !== undefined) {
    return `${withCommas}.${fracPart}`;
  }
  return withCommas;
}
