import type { Metadata } from "next";
import { Provider as JotaiProvider } from "jotai";
import { GlobalModal } from "@/components/ui/Modal";
import { GlobalToastContainer } from "@/components/ui/Toast";
import { ScrollToTop } from "@/components/ui/ScrollToTop";
import "./globals.css";

export const metadata: Metadata = {
  title: "Boilerplate Starter Kit",
  description: "Next.js 14 + Jotai + Kotlin Spring Boot 3.4 Fullstack Starter Kit",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="antialiased bg-slate-50 text-slate-900 min-h-screen">
        <JotaiProvider>
          {children}
          <GlobalModal />
          <GlobalToastContainer />
          <ScrollToTop />
        </JotaiProvider>
      </body>
    </html>
  );
}
