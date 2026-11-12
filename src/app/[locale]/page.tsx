import {
  HomeCta,
  HomeHeroTitle,
  HomeIntro,
  HomeLocaleBar,
} from "@/components/home/HomeClientBits";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildHomeJsonLd } from "@/lib/seo/jsonLd";
import { isSiteLocale, type SiteLocale } from "@/lib/seo/site";
import { notFound } from "next/navigation";

export default function HomePage({
  params,
}: {
  params: { locale: string };
}) {
  if (!isSiteLocale(params.locale)) notFound();
  const locale = params.locale as SiteLocale;

  return (
    <main className="min-h-screen bg-[#F7FAFF]">
      <JsonLd data={buildHomeJsonLd(locale)} />
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col px-4 py-16 sm:px-6">
        <HomeLocaleBar />

        <div className="flex flex-1 flex-col justify-center text-center sm:text-left">
          <div className="mb-4 flex justify-center sm:justify-start">
            <img
              src="/brand/ramza-icon.jpg"
              alt="Ramza"
              width={48}
              height={48}
              className="h-12 w-12 rounded-xl"
            />
          </div>
          <HomeHeroTitle />
          <HomeIntro />
          <HomeCta />
        </div>
      </div>
    </main>
  );
}
