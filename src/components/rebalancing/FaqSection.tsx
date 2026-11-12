"use client";

import { useMemo } from "react";
import { useTranslation } from "react-i18next";

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

/**
 * 공용 FAQ (SEO)
 * - 시맨틱 section + h2
 * - details/summary 아코디언: 답변이 항상 HTML에 포함되어 크롤러가 본문을 읽음
 * - FAQPage JSON-LD
 */
export function FaqSection() {
  const { t, i18n } = useTranslation("faq");

  const items = t("items", { returnObjects: true }) as FaqItem[];
  const list = Array.isArray(items) ? items : [];

  const jsonLd = useMemo(() => {
    if (list.length === 0) return null;
    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: list.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    };
  }, [list]);

  if (list.length === 0) return null;

  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="mt-12 border-t border-slate-200 pt-10"
      lang={i18n.language}
    >
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}

      <div className="mb-5">
        <h2
          id="faq-heading"
          className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl"
        >
          {t("heading")}
        </h2>
        <p className="mt-1.5 text-sm text-slate-500">
          {t("countLabel", { count: list.length })}
        </p>
      </div>

      <div className="divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
        {list.map((item, index) => (
          <details
            key={item.id}
            className="group px-4 py-1 open:bg-slate-50/80 sm:px-5"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-3.5 text-left text-sm font-semibold text-slate-900 marker:content-none [&::-webkit-details-marker]:hidden">
              <span>
                <span className="text-emerald-700">Q{index + 1}.</span>{" "}
                {item.question}
              </span>
              <span
                aria-hidden
                className="shrink-0 text-lg leading-none text-slate-400 transition group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <div className="pb-4 pr-8 text-sm leading-relaxed text-slate-600">
              <p>{item.answer}</p>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
