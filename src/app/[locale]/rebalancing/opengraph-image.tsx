import { ImageResponse } from "next/og";
import { getSeoCopy } from "@/lib/seo/metadata";
import { isSiteLocale, type SiteLocale } from "@/lib/seo/site";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage({
  params,
}: {
  params: { locale: string };
}) {
  const locale: SiteLocale = isSiteLocale(params.locale) ? params.locale : "ko";
  const copy = getSeoCopy(locale, "rebalancing");

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
            fontSize: 26,
            fontWeight: 600,
            color: "#3B6FD9",
            marginBottom: 18,
          }}
        >
          Ramza
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 48,
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
          }}
        >
          {copy.title}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 24,
            fontSize: 24,
            color: "#475569",
            lineHeight: 1.4,
            maxWidth: 920,
          }}
        >
          {copy.description}
        </div>
      </div>
    ),
    { ...size }
  );
}
