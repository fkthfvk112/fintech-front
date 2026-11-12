import { Provider as JotaiProvider } from "jotai";
import { fontInter, fontNotoSansJp } from "@/lib/fonts";
import "./globals.css";

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
