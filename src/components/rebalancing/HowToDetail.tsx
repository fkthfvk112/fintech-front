"use client";

import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useId, useState } from "react";
import { useTranslation } from "react-i18next";
import type { RebalancingMode } from "./ToolModeCards";

interface LabelBody {
  label: string;
  body: string;
}

interface ResultsGroup {
  heading: string;
  items: LabelBody[];
}

interface ModeGuide {
  title: string;
  summary: string[];
  stepsHeading: string;
  steps: LabelBody[];
  resultsHeading: string;
  resultsIntro: string;
  results?: LabelBody[];
  resultsGroups?: ResultsGroup[];
  exampleHeading: string;
  exampleIntro: string;
  exampleTitle: string;
  exampleSetup: string;
  exampleItems: string[];
  useCasesHeading: string;
  useCases: string[];
  notesHeading: string;
  notes: string[];
}

interface HowToDetailProps {
  mode: RebalancingMode;
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function asLabelBodyArray(value: unknown): LabelBody[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (item): item is LabelBody =>
      !!item &&
      typeof item === "object" &&
      typeof (item as LabelBody).label === "string" &&
      typeof (item as LabelBody).body === "string"
  );
}

function asResultsGroups(value: unknown): ResultsGroup[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((group) => {
      if (!group || typeof group !== "object") return null;
      const heading = (group as ResultsGroup).heading;
      const items = asLabelBodyArray((group as ResultsGroup).items);
      if (typeof heading !== "string" || items.length === 0) return null;
      return { heading, items };
    })
    .filter((group): group is ResultsGroup => group !== null);
}

function readModeGuide(
  t: (key: string, options?: { returnObjects?: boolean }) => unknown,
  mode: RebalancingMode
): ModeGuide {
  const prefix = mode;
  return {
    title: String(t(`${prefix}.title`) ?? ""),
    summary: asStringArray(t(`${prefix}.summary`, { returnObjects: true })),
    stepsHeading: String(t(`${prefix}.stepsHeading`) ?? ""),
    steps: asLabelBodyArray(t(`${prefix}.steps`, { returnObjects: true })),
    resultsHeading: String(t(`${prefix}.resultsHeading`) ?? ""),
    resultsIntro: String(t(`${prefix}.resultsIntro`) ?? ""),
    results: asLabelBodyArray(t(`${prefix}.results`, { returnObjects: true })),
    resultsGroups: asResultsGroups(
      t(`${prefix}.resultsGroups`, { returnObjects: true })
    ),
    exampleHeading: String(t(`${prefix}.exampleHeading`) ?? ""),
    exampleIntro: String(t(`${prefix}.exampleIntro`) ?? ""),
    exampleTitle: String(t(`${prefix}.exampleTitle`) ?? ""),
    exampleSetup: String(t(`${prefix}.exampleSetup`) ?? ""),
    exampleItems: asStringArray(
      t(`${prefix}.exampleItems`, { returnObjects: true })
    ),
    useCasesHeading: String(t(`${prefix}.useCasesHeading`) ?? ""),
    useCases: asStringArray(t(`${prefix}.useCases`, { returnObjects: true })),
    notesHeading: String(t(`${prefix}.notesHeading`) ?? ""),
    notes: asStringArray(t(`${prefix}.notes`, { returnObjects: true })),
  };
}

export function HowToDetail({ mode }: HowToDetailProps) {
  const { t, i18n } = useTranslation("howto");
  const [open, setOpen] = useState(false);
  const panelId = useId();

  const guide = readModeGuide(t, mode);
  const rules = asStringArray(t("common.rules", { returnObjects: true }));
  const rulesHeading = String(t("common.rulesHeading") ?? "");
  const disclaimer = String(t("common.disclaimer") ?? "");

  return (
    <div className="mt-6" lang={i18n.language}>
      <div className="flex justify-center">
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold text-[#4A89F3] transition hover:bg-[#4A89F3]/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4A89F3]"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((prev) => !prev)}
        >
          {open ? t("toggleClose") : t("toggleOpen")}
          {open ? (
            <ExpandLessIcon sx={{ fontSize: 20 }} aria-hidden />
          ) : (
            <ExpandMoreIcon sx={{ fontSize: 20 }} aria-hidden />
          )}
        </button>
      </div>

      <div
        id={panelId}
        hidden={!open}
        className="mt-4 rounded-2xl border border-[#BFD4F8] bg-[#F7FAFF] px-4 py-5 sm:px-6 sm:py-6"
      >
        <article>
          <h3 className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
            {guide.title}
          </h3>

          <div className="mt-3 space-y-2 text-sm leading-relaxed text-slate-600">
            {guide.summary.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          {/* 이용 방법 + 결과 설명 */}
          <section className="mt-6" aria-labelledby={`${panelId}-steps`}>
            <h4
              id={`${panelId}-steps`}
              className="text-base font-bold text-slate-900"
            >
              {guide.stepsHeading}
            </h4>
            <ol className="mt-3 space-y-4">
              {guide.steps.map((step) => (
                <li key={step.label}>
                  <p className="text-sm font-semibold text-slate-900">
                    {step.label}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">
                    {step.body}
                  </p>
                </li>
              ))}
            </ol>
          </section>

          <hr className="my-6 border-0 border-t border-[#BFD4F8]" />

          <section aria-labelledby={`${panelId}-results`}>
            <h4
              id={`${panelId}-results`}
              className="text-base font-bold text-slate-900"
            >
              {guide.resultsHeading}
            </h4>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              {guide.resultsIntro}
            </p>

            {guide.results && guide.results.length > 0 && (
              <dl className="mt-3 space-y-3">
                {guide.results.map((item) => (
                  <div key={item.label}>
                    <dt className="text-sm font-semibold text-slate-900">
                      {item.label}
                    </dt>
                    <dd className="mt-0.5 text-sm leading-relaxed text-slate-600">
                      {item.body}
                    </dd>
                  </div>
                ))}
              </dl>
            )}

            {guide.resultsGroups && guide.resultsGroups.length > 0 && (
              <div className="mt-4 space-y-5">
                {guide.resultsGroups.map((group) => (
                  <div key={group.heading}>
                    <p className="text-sm font-bold text-slate-800">
                      {group.heading}
                    </p>
                    <dl className="mt-2 space-y-3">
                      {group.items.map((item) => (
                        <div key={item.label}>
                          <dt className="text-sm font-semibold text-slate-900">
                            {item.label}
                          </dt>
                          <dd className="mt-0.5 text-sm leading-relaxed text-slate-600">
                            {item.body}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                ))}
              </div>
            )}
          </section>

          <hr className="my-6 border-0 border-t border-[#BFD4F8]" />

          {/* 정수 주수·잔여 현금 설명 */}
          <section aria-labelledby={`${panelId}-example`}>
            <h4
              id={`${panelId}-example`}
              className="text-base font-bold text-slate-900"
            >
              {guide.exampleHeading}
            </h4>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              {guide.exampleIntro}
            </p>
            {guide.exampleTitle && (
              <p className="mt-4 text-sm font-bold text-slate-800">
                {guide.exampleTitle}
              </p>
            )}
            {guide.exampleSetup && (
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                {guide.exampleSetup}
              </p>
            )}
            {guide.exampleItems.length > 0 && (
              <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm leading-relaxed text-slate-600">
                {guide.exampleItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ol>
            )}
          </section>

          <hr className="my-6 border-0 border-t border-[#BFD4F8]" />

          {/* 활용 상황 */}
          <section aria-labelledby={`${panelId}-usecases`}>
            <h4
              id={`${panelId}-usecases`}
              className="text-base font-bold text-slate-900"
            >
              {guide.useCasesHeading}
            </h4>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-slate-600">
              {guide.useCases.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <hr className="my-6 border-0 border-t border-[#BFD4F8]" />

          {/* 주의·알아둘 점 */}
          <section aria-labelledby={`${panelId}-notes`}>
            <h4
              id={`${panelId}-notes`}
              className="text-base font-bold text-slate-900"
            >
              {guide.notesHeading}
            </h4>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-slate-600">
              {guide.notes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <hr className="my-6 border-0 border-t border-[#BFD4F8]" />

          {/* 공통 계산 기준·면책 */}
          <section>
            <h4 className="text-base font-bold text-slate-900">
              {rulesHeading}
            </h4>
            <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm leading-relaxed text-slate-600">
              {rules.map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ol>
            <p className="mt-4 text-xs leading-relaxed text-slate-500">
              {disclaimer}
            </p>
          </section>
        </article>
      </div>
    </div>
  );
}
