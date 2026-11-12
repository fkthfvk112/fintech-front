import { ImageResponse } from "next/og";
import { getSeoCopy } from "@/lib/seo/metadata";
import { isSiteLocale, type SiteLocale } from "@/lib/seo/site";

export const runtime = "edge";
export const alt = "Ramza";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage({
  params,
}: {
  params: { locale: string };
}) {
  const locale: SiteLocale = isSiteLocale(params.locale) ? params.locale : "ko";
  const site = getSeoCopy(locale, "site");
  const home = getSeoCopy(locale, "home");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "72px",
          background:
            "linear-gradient(145deg, #F7FAFF 0%, #E8F1FF 55%, #D6E6FF 100%)",
          color: "#0f172a",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 28,
            fontWeight: 600,
            color: "#3B6FD9",
            marginBottom: 20,
          }}
        >
          fintech.ramza.app
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 56,
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
          }}
        >
          {site.title}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 28,
            fontSize: 26,
            color: "#475569",
            lineHeight: 1.4,
            maxWidth: 920,
          }}
        >
          {home.description}
        </div>
      </div>
    ),
    { ...size }
  );
}
