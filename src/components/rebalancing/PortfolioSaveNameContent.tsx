"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

interface PortfolioSaveNameContentProps {
  defaultName?: string;
  nameRef: { current: string };
}

export function PortfolioSaveNameContent({
  defaultName = "",
  nameRef,
}: PortfolioSaveNameContentProps) {
  const { t } = useTranslation("portfolio");
  const [name, setName] = useState(defaultName);

  useEffect(() => {
    nameRef.current = name;
  }, [name, nameRef]);

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">
        {t("portfolioName")}
      </label>
      <input
        type="text"
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={t("portfolioNamePlaceholder")}
        className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
      />
      <p className="mt-2 text-xs text-slate-500">{t("portfolioNameHint")}</p>
    </div>
  );
}
