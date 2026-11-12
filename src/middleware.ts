import { NextRequest, NextResponse } from "next/server";
import { detectLocaleFromAcceptLanguage } from "@/lib/i18n/detectLocale";
import {
  DEFAULT_LOCALE,
  isSiteLocale,
  type SiteLocale,
} from "@/lib/seo/site";

/**
 * 명시적 선택(쿠키)이 있으면 그걸 쓰고,
 * 없으면 Accept-Language(q 정렬) → 기본 ko.
 * locale 경로 방문만으로 쿠키를 덮어쓰지 않는다 (테스트/크롤러로 ja 고정되는 문제 방지).
 */
function resolveLocale(request: NextRequest): SiteLocale {
  const cookie = request.cookies.get("rebalancer.locale")?.value;
  if (cookie && isSiteLocale(cookie)) return cookie;

  return (
    detectLocaleFromAcceptLanguage(
      request.headers.get("accept-language")
    ) || DEFAULT_LOCALE
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 이미 /ko|/en|/ja 로 시작하면 통과 (쿠키는 LocaleSwitcher에서만 기록)
  const first = pathname.split("/")[1] ?? "";
  if (isSiteLocale(first)) {
    return NextResponse.next();
  }

  const locale = resolveLocale(request);

  // `/` → `/{locale}`, `/rebalancing` → `/{locale}/rebalancing`
  const url = request.nextUrl.clone();
  url.pathname =
    pathname === "/" ? `/${locale}` : `/${locale}${pathname}`;

  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|brand/|robots.txt|sitemap.xml|.*\\..*|opengraph-image|icon|apple-icon).*)",
  ],
};
