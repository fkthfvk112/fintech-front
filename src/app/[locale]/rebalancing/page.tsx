import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RebalancingShell } from "@/components/rebalancing/RebalancingShell";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildRebalancingJsonLd } from "@/lib/seo/jsonLd";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { isSiteLocale, type SiteLocale } from "@/lib/seo/site";

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  if (!isSiteLocale(params.locale)) return {};
  return buildPageMetadata("rebalancing", {
    locale: params.locale,
    pathKey: "rebalancing",
  });
}

export default function RebalancingPage({
  params,
}: {
  params: { locale: string };
}) {
  if (!isSiteLocale(params.locale)) notFound();
  const locale = params.locale as SiteLocale;

  return (
    <>
      <JsonLd data={buildRebalancingJsonLd(locale)} />
      <RebalancingShell />
    </>
  );
}
