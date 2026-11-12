import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GlobalModal } from "@/components/ui/Modal";
import { GlobalToastContainer } from "@/components/ui/Toast";
import { ScrollToTop } from "@/components/ui/ScrollToTop";
import { I18nProvider } from "@/lib/i18n/I18nProvider";
import type { Locale } from "@/lib/i18n/resources";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { LOCALES, isSiteLocale, type SiteLocale } from "@/lib/seo/site";

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  if (!isSiteLocale(params.locale)) return {};
  return buildPageMetadata("home", {
    locale: params.locale,
    pathKey: "home",
  });
}

export default function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!isSiteLocale(params.locale)) {
    notFound();
  }

  const locale = params.locale as SiteLocale;

  return (
    <I18nProvider locale={locale as Locale}>
      {children}
      <GlobalModal />
      <GlobalToastContainer />
      <ScrollToTop />
    </I18nProvider>
  );
}
