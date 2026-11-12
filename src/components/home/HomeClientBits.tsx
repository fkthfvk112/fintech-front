"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { LocaleSwitcher } from "@/components/rebalancing/LocaleSwitcher";
import { useLocaleHref } from "@/lib/i18n/useLocaleRouting";

export function HomeLocaleBar() {
  return (
    <div className="mb-10 flex justify-end">
      <LocaleSwitcher />
    </div>
  );
}

export function HomeHeroTitle() {
  const { t } = useTranslation("common");

  return (
    <>
      <p className="inline-flex self-center rounded-full border border-[#C9DCFF] bg-[#E8F1FF] px-3.5 py-1 text-xs font-semibold tracking-wide text-[#3B6FD9] sm:self-start">
        {t("shell.badge")}
      </p>
      <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
        {t("shell.h1Before")}
        <span className="text-[#4A89F3]">{t("shell.h1Accent")}</span>
        {t("shell.h1After")}
      </h1>
    </>
  );
}

export function HomeIntro() {
  const { t } = useTranslation("common");
  const body = t("home.introBody", { returnObjects: true });
  const paragraphs = Array.isArray(body)
    ? body.filter((item): item is string => typeof item === "string")
    : [];

  return (
    <>
      <h2 className="mt-6 text-lg font-bold text-slate-900 sm:text-xl">
        {t("home.introHeading")}
      </h2>
      <div className="mt-3 space-y-2 text-base leading-relaxed text-slate-600">
        {paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </>
  );
}

export function HomeCta() {
  const { t } = useTranslation("common");
  const href = useLocaleHref("rebalancing");

  return (
    <Link
      href={href}
      className="mt-8 inline-flex w-fit self-center items-center justify-center rounded-xl bg-[#4A89F3] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#3B7AE0] active:scale-[0.98] sm:self-start"
    >
      {t("home.goToCalculator")}
    </Link>
  );
}
