import type { Metadata } from "next";
import { Provider as JotaiProvider } from "jotai";
import { fontInter, fontNotoSansJp } from "@/lib/fonts";
import "./globals.css";

/** GSC HTML 태그 확인용 (삭제하지 말 것) */
export const metadata: Metadata = {
  verification: {
    google: "33ga0dbjQg_82U4F_MMzUEIKjAJh04a1E2argj_FSi0",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ko"
      className={`${fontInter.variable} ${fontNotoSansJp.variable}`}
      suppressHydrationWarning
    >
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased">
        <JotaiProvider>{children}</JotaiProvider>
      </body>
    </html>
  );
}
