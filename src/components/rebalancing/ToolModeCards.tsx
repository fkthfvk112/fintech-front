"use client";

import { useTranslation } from "react-i18next";

export type RebalancingMode = "basic" | "portfolio";

interface ToolModeCardsProps {
  mode: RebalancingMode;
  onChange: (mode: RebalancingMode) => void;
}

export function ToolModeCards({ mode, onChange }: ToolModeCardsProps) {
  const { t } = useTranslation("common");

  const cards: {
    id: RebalancingMode;
    eyebrow: string;
    title: string;
    description: string;
  }[] = [
    {
      id: "basic",
      eyebrow: t("shell.basic.eyebrow"),
      title: t("shell.basic.title"),
      description: t("shell.basic.description"),
    },
    {
      id: "portfolio",
      eyebrow: t("shell.portfolio.eyebrow"),
      title: t("shell.portfolio.title"),
      description: t("shell.portfolio.description"),
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
      {cards.map((card) => {
        const selected = mode === card.id;
        return (
          <button
            key={card.id}
            type="button"
            onClick={() => onChange(card.id)}
            aria-pressed={selected}
            className={`rounded-2xl border px-5 py-5 text-left transition-colors duration-150 sm:px-6 sm:py-6 ${
              selected
                ? "border-[#4A89F3] bg-[#E8F1FF]"
                : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            <p className="mt-2 text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
              {card.title}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              {card.description}
            </p>
          </button>
        );
      })}
    </div>
  );
}
