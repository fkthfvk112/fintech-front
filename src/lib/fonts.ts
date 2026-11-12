import { Inter, Noto_Sans_JP } from "next/font/google";

/** 영어 */
export const fontInter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

/** 일본어 */
export const fontNotoSansJp = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-noto-sans-jp",
  display: "swap",
});
