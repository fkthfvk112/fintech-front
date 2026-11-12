"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { Plus } from "lucide-react";
import { useAtomValue, useSetAtom } from "jotai";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/Button";
import { ColorCode } from "@/constants/Colors";
import { createRowId, indexToName, nextDefaultName } from "@/lib/rebalancing/names";
import {
  formatInputWithCommas,
  formatMoney,
  fromMinor,
  parseAmountString,
  toMinor,
} from "@/lib/rebalancing/money";
import {
  findManualTwinId,
  getPriceOverrideMap,
  mergePurchaseRowsForCalc,
  normalizeStockName,
} from "@/lib/rebalancing/purchaseRows";
import {
  calculateTargetRebalance,
  holdingsFromAddResult,
} from "@/lib/rebalancing/targetRebalance";
import {
  holdingToInput,
  validateAdditionalPurchase,
  validatePortfolioDraft,
} from "@/lib/rebalancing/validatePortfolio";
import { sumWeights } from "@/lib/rebalancing/validate";
import {
  CurrencyCode,
  FieldErrors,
  PortfolioAddResult,
  PortfolioHolding,
  PortfolioHoldingInput,
  StockRowInput,
} from "@/rebalancing/interface/types";
import {
  savedPortfoliosAtom,
  upsertSavedPortfolioActionAtom,
} from "@/stores/portfolioAtom";
import { addToastActionAtom, openModalActionAtom } from "@/stores/uiAtom";
import {
  PortfolioEditor,
  createEmptyHoldingInput,
} from "./PortfolioEditor";
import { PortfolioLoadModalContent } from "./PortfolioLoadModalContent";
import { PortfolioResultPanel } from "./PortfolioResultPanel";
import { PortfolioSaveNameContent } from "./PortfolioSaveNameContent";
import { ModeToolbar } from "./ModeToolbar";
import { StockRow } from "./StockRow";
import { WeightBar } from "./WeightBar";

function createManualRows(count = 1): StockRowInput[] {
  return Array.from({ length: count }, (_, i) => ({
    id: createRowId(),
    name: indexToName(i),
    isDefaultName: true,
    price: "",
    weight: "",
  }));
}

function holdingToPurchaseRow(
  holding: PortfolioHolding,
  prevWeight = ""
): StockRowInput {
  const price = formatInputWithCommas(String(holding.price));
  return {
    id: `pf-${holding.id}`,
    name: holding.name,
    isDefaultName: false,
    price,
    weight: prevWeight,
    fromPortfolio: true,
    originalPrice: price,
    sourceHoldingId: holding.id,
    heldQuantity: holding.quantity,
  };
}

interface PortfolioAddModeProps {
  /** 쉘 안에 임베드 (히어로·모드 카드는 상위에서 담당) */
  embedded?: boolean;
  currency: CurrencyCode;
  onCurrencyChange: (currency: CurrencyCode) => void;
}

export function PortfolioAddMode({
  embedded = false,
  currency,
  onCurrencyChange,
}: PortfolioAddModeProps) {
  const { t } = useTranslation("portfolio");
  const { t: tCommon } = useTranslation("common");

  const savedPortfolios = useAtomValue(savedPortfoliosAtom);
  const upsertPortfolio = useSetAtom(upsertSavedPortfolioActionAtom);
  const openModal = useSetAtom(openModalActionAtom);
  const addToast = useSetAtom(addToastActionAtom);

  const [activePortfolioId, setActivePortfolioId] = useState<string | null>(null);
  const [draft, setDraft] = useState<PortfolioHoldingInput[]>([
    createEmptyHoldingInput(),
  ]);
  const [draftErrors, setDraftErrors] = useState<
    Record<string, { name?: string; price?: string; quantity?: string }>
  >({});

  const [additionalAmount, setAdditionalAmount] = useState("");
  const [rows, setRows] = useState<StockRowInput[]>(() => createManualRows(1));
  const [errors, setErrors] = useState<FieldErrors>({});
  const [result, setResult] = useState<PortfolioAddResult | null>(null);
  const [stale, setStale] = useState(false);

  const saveNameRef = useRef("");

  const draftHoldingsPreview = useMemo(() => {
    const holdings: PortfolioHolding[] = [];
    for (const row of draft) {
      const name = row.name.trim();
      const price = parseAmountString(row.price);
      const qtyRaw = row.quantity.replace(/,/g, "").trim();
      if (!name || price === null || price <= 0 || !/^\d+$/.test(qtyRaw)) continue;
      const quantity = Number(qtyRaw);
      if (!Number.isInteger(quantity) || quantity < 0) continue;
      holdings.push({ id: row.id, name, price, quantity });
    }
    return holdings;
  }, [draft]);

  // Mirror current portfolio holdings into the purchase list (keep manual rows).
  useEffect(() => {
    setRows((prev) => {
      const manual = prev.filter((r) => !r.fromPortfolio);
      const weightByHoldingId = new Map(
        prev
          .filter((r) => r.fromPortfolio && r.sourceHoldingId)
          .map((r) => [r.sourceHoldingId!, r.weight] as const)
      );

      const portfolioRows = draftHoldingsPreview.map((h) =>
        holdingToPurchaseRow(h, weightByHoldingId.get(h.id) ?? "")
      );

      if (portfolioRows.length === 0) {
        return manual.length > 0 ? manual : createManualRows(1);
      }

      return [
        ...portfolioRows,
        ...(manual.length > 0 ? manual : createManualRows(1)),
      ];
    });
  }, [draftHoldingsPreview]);

  const activePortfolioName = useMemo(
    () => savedPortfolios.find((p) => p.id === activePortfolioId)?.name ?? "",
    [savedPortfolios, activePortfolioId]
  );

  const priceOverrides = useMemo(() => getPriceOverrideMap(rows), [rows]);

  const weightSum = useMemo(
    () => sumWeights(mergePurchaseRowsForCalc(rows)),
    [rows]
  );
  const weightOver = weightSum > 100 + 1e-9;

  const markDirty = () => {
    if (result) setStale(true);
    setErrors({});
  };

  const updateDraft = (id: string, patch: Partial<PortfolioHoldingInput>) => {
    setDraft((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
    setDraftErrors({});
  };

  const addDraftRow = () => {
    setDraft((prev) => [...prev, createEmptyHoldingInput()]);
    setDraftErrors({});
  };

  const deleteDraftRow = (id: string) => {
    setDraft((prev) => {
      const next = prev.filter((r) => r.id !== id);
      return next.length === 0 ? [createEmptyHoldingInput()] : next;
    });
    setDraftErrors({});
  };

  const applyHoldingsToDraft = (
    holdings: PortfolioHolding[],
    portfolioId: string | null
  ) => {
    setDraft(
      holdings.length > 0
        ? holdings.map(holdingToInput)
        : [createEmptyHoldingInput()]
    );
    setDraftErrors({});
    setActivePortfolioId(portfolioId);
  };

  const openSaveModal = (holdings: PortfolioHolding[], preferName?: string) => {
    const defaultName = preferName ?? activePortfolioName;
    saveNameRef.current = defaultName;

    openModal({
      title: t("saveNameTitle"),
      description: t("saveNameDescription"),
      content: (
        <PortfolioSaveNameContent
          defaultName={defaultName}
          nameRef={saveNameRef}
        />
      ),
      confirmText: t("confirm"),
      cancelText: t("cancel"),
      onConfirm: () => {
        const name = saveNameRef.current.trim();
        if (!name) {
          addToast({ type: "error", message: t("errors.portfolioNameRequired") });
          return false;
        }
        const saved = upsertPortfolio({ name, holdings });
        if (saved) {
          applyHoldingsToDraft(saved.holdings, saved.id);
          addToast({ type: "success", message: t("portfolioSaved") });
        }
      },
    });
  };

  const saveDraftPortfolio = () => {
    const nonEmpty = draft.filter(
      (r) => r.name.trim() || r.price.trim() || r.quantity.trim()
    );
    if (nonEmpty.length === 0) {
      addToast({ type: "error", message: t("errors.portfolioEmptySave") });
      return;
    }

    const validated = validatePortfolioDraft(nonEmpty, (key) => t(key));
    if (!validated.ok) {
      setDraftErrors(validated.errors);
      return;
    }

    openSaveModal(validated.holdings);
  };

  const loadSavedPortfolio = () => {
    openModal({
      title: t("loadModalTitle"),
      description: t("loadModalDescription"),
      content: (
        <PortfolioLoadModalContent
          onSelect={(portfolio) => {
            applyHoldingsToDraft(portfolio.holdings, portfolio.id);
            addToast({ type: "success", message: t("portfolioLoaded") });
          }}
        />
      ),
      cancelText: t("close"),
      hideConfirm: true,
      size: "lg",
    });
  };

  const updateRow = (id: string, patch: Partial<StockRowInput>) => {
    markDirty();
    setRows((prev) => {
      const current = prev.find((r) => r.id === id);
      const next = prev.map((r) => (r.id === id ? { ...r, ...patch } : r));

      // Keep top portfolio editor draft in sync when mirrored rows are edited
      if (
        current?.fromPortfolio &&
        current.sourceHoldingId &&
        (patch.name !== undefined || patch.price !== undefined)
      ) {
        setDraft((draftPrev) =>
          draftPrev.map((d) =>
            d.id === current.sourceHoldingId
              ? {
                  ...d,
                  name: patch.name !== undefined ? patch.name : d.name,
                  price: patch.price !== undefined ? patch.price : d.price,
                }
              : d
          )
        );
      }

      return next;
    });
  };

  const addRow = () => {
    markDirty();
    setRows((prev) => {
      const manualNames = prev
        .filter((r) => !r.fromPortfolio)
        .map((r) => r.name);
      const name = nextDefaultName(manualNames);
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
    setRows((prev) => {
      const target = prev.find((r) => r.id === id);
      if (!target || target.fromPortfolio) return prev;
      const next = prev.filter((r) => r.id !== id);
      const manuals = next.filter((r) => !r.fromPortfolio);
      if (manuals.length === 0 && next.some((r) => r.fromPortfolio)) {
        return [...next, ...createManualRows(1)];
      }
      return next.length === 0 ? createManualRows(1) : next;
    });
  };

  const resolveCurrentHoldings = () => {
    const nonEmpty = draft.filter(
      (r) => r.name.trim() || r.price.trim() || r.quantity.trim()
    );
    if (nonEmpty.length === 0) {
      return { ok: true as const, holdings: [] as PortfolioHolding[] };
    }
    const validated = validatePortfolioDraft(nonEmpty, (key) => t(key));
    if (!validated.ok) {
      setDraftErrors(validated.errors);
      return { ok: false as const };
    }
    setDraftErrors({});
    return { ok: true as const, holdings: validated.holdings };
  };

  const handleCalculate = () => {
    const current = resolveCurrentHoldings();
    if (!current.ok) return;

    const validated = validateAdditionalPurchase(additionalAmount, rows, (key) =>
      t(key)
    );
    if (!validated.ok) {
      setErrors(validated.errors);
      return;
    }

    setResult(
      calculateTargetRebalance(current.holdings, rows, validated.totalBudget, {
        cashLabel: t("cash"),
      })
    );
    setStale(false);
    setErrors({});
  };

  const confirmSaveResult = () => {
    if (!result || stale) return;
    openSaveModal(holdingsFromAddResult(result), activePortfolioName);
  };

  const manualCount = rows.filter((r) => !r.fromPortfolio).length;
  // Existing holdings valued two ways:
  // - stored: portfolio editor prices (what "전체 평가 금액" shows above)
  // - mtm: same-name manual row price wins (same basis as calculate)
  const { portfolioStoredValue, portfolioMtmValue } = useMemo(() => {
    let storedMinor = 0;
    let mtmMinor = 0;
    for (const h of draftHoldingsPreview) {
      const key = normalizeStockName(h.name);
      const overrideRaw = priceOverrides.get(key);
      const override = overrideRaw ? parseAmountString(overrideRaw) : null;
      const price =
        override !== null && override > 0 ? override : h.price;
      storedMinor += toMinor(h.price) * h.quantity;
      mtmMinor += toMinor(price) * h.quantity;
    }
    return {
      portfolioStoredValue: fromMinor(storedMinor),
      portfolioMtmValue: fromMinor(mtmMinor),
    };
  }, [draftHoldingsPreview, priceOverrides]);
  const portfolioRevalued = portfolioStoredValue !== portfolioMtmValue;
  const additionalBudgetValue = Math.max(
    0,
    parseAmountString(additionalAmount) ?? 0
  );
  const totalEvaluationAmount = portfolioMtmValue + additionalBudgetValue;

  return (
    <div className={embedded ? "" : "mx-auto min-h-screen max-w-5xl px-4 py-8 sm:px-6"}>
      <ModeToolbar
        title={tCommon("shell.portfolio.title")}
        description={t("modeSubtitle")}
        currency={currency}
        onCurrencyChange={(next) => {
          markDirty();
          onCurrencyChange(next);
        }}
        meta={
          activePortfolioName ? (
            <p className="mt-2 text-xs text-slate-500">
              {t("activePortfolio")}:{" "}
              <span className="font-semibold text-slate-700">
                {activePortfolioName}
              </span>
            </p>
          ) : undefined
        }
      />

      <div className="space-y-8">
        <PortfolioEditor
          currency={currency}
          draft={draft}
          errors={draftErrors}
          onChange={updateDraft}
          onAdd={addDraftRow}
          onDelete={deleteDraftRow}
          onSave={saveDraftPortfolio}
          onLoad={loadSavedPortfolio}
        />

        <section className="space-y-6">
          <h2 className="text-sm font-semibold text-slate-800">
            {t("additionalSection")}
          </h2>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-800">
              {t("additionalAmount")}
            </label>
            <input
              type="text"
              inputMode="numeric"
              placeholder={t("additionalAmountPlaceholder")}
              value={additionalAmount}
              onChange={(e) => {
                markDirty();
                setAdditionalAmount(
                  formatInputWithCommas(e.target.value.replace(/\./g, ""))
                );
              }}
              className={`w-full max-w-md rounded-xl border px-4 py-3 text-base outline-none focus:ring-1 ${
                errors.totalAmount
                  ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500"
                  : "border-slate-300 focus:border-emerald-600 focus:ring-emerald-600"
              }`}
            />
            {errors.totalAmount && (
              <p className="mt-1.5 text-sm text-rose-600">{errors.totalAmount}</p>
            )}
            <p className="mt-2 text-sm text-slate-700">
              <span className="font-semibold text-slate-800">
                {t("totalEvaluation")}
              </span>
              {": "}
              <span className="font-semibold text-slate-900">
                {formatMoney(totalEvaluationAmount, currency)}
              </span>
              <span className="ml-1 text-slate-500">
                (
                {t("totalEvaluationHint", {
                  portfolio: formatMoney(portfolioMtmValue, currency),
                  additional: formatMoney(additionalBudgetValue, currency),
                })}
                )
              </span>
            </p>
            {portfolioRevalued && (
              <p
                className="mt-1 flex items-start gap-1 text-xs font-medium"
                style={{ color: ColorCode.info }}
              >
                <InfoOutlinedIcon
                  sx={{ fontSize: 14, mt: "1px", flexShrink: 0 }}
                  aria-hidden
                />
                <span>
                  {t("portfolioRevalued", {
                    from: formatMoney(portfolioStoredValue, currency),
                    to: formatMoney(portfolioMtmValue, currency),
                  })}
                </span>
              </p>
            )}
          </div>

          <div className="space-y-3">
            <p className="text-xs text-slate-500">{t("portfolioRowsHint")}</p>

            <div className="space-y-3">
              {rows.map((row) => {
                const key = normalizeStockName(row.name);
                const override = row.fromPortfolio
                  ? priceOverrides.get(key)
                  : undefined;
                const twinId = findManualTwinId(rows, row);
                const weightLocked = Boolean(row.fromPortfolio && twinId);
                const showMismatch =
                  Boolean(override) &&
                  parseAmountString(row.price) !== null &&
                  parseAmountString(override ?? "") !== null &&
                  parseAmountString(row.price) !==
                    parseAmountString(override ?? "");

                return (
                  <StockRow
                    key={row.id}
                    row={row}
                    canDelete={!row.fromPortfolio && manualCount > 1}
                    nameLabel={t("name")}
                    portfolioBadge={t("portfolioBadge")}
                    overriddenPrice={override}
                    priceMismatchMessage={
                      showMismatch ? t("priceMismatch") : undefined
                    }
                    weightLocked={weightLocked}
                    focusWeightTargetId={twinId}
                    currency={currency}
                    heldQuantityLabel={t("heldQuantity")}
                    holdingValueLabel={t("holdingValue")}
                    nameError={errors.rows?.[row.id]?.name}
                    priceError={errors.rows?.[row.id]?.price}
                    weightError={errors.rows?.[row.id]?.weight}
                    onChange={updateRow}
                    onDelete={deleteRow}
                  />
                );
              })}
            </div>

            <div className="flex justify-center pt-1">
              <Button type="button" size="sm" variant="secondary" onClick={addRow}>
                <Plus className="mr-1 h-4 w-4" />
                {t("addStock")}
              </Button>
            </div>

            <WeightBar sum={weightSum} ns="portfolio" />
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
          <PortfolioResultPanel
            result={result}
            currency={currency}
            stale={stale}
            onReset={() => {
              setResult(null);
              setStale(false);
            }}
            onSave={confirmSaveResult}
          />
        )}
      </div>
    </div>
  );
}
