# 포트폴리오 리밸런싱 계산기 — SEO·콘텐츠 기획서

> 대상 서비스: 포트폴리오 리밸런싱 계산기 (ko / en / ja)  
> 문서 목적: 기술 SEO · 콘텐츠 SEO · 검색 유입 개선의 범위, 다국어 구조, 우선순위, 검수 기준을 한곳에 고정한다.  
> 관련 코드: `src/lib/seo/*`, `src/languages/{ko,en,ja}/seo.json` · `faq.json` · `howto.json`, `src/app/robots.ts`, `src/app/sitemap.ts`  
> **현황 판정 (2026-11-13):** **코드 SEO P2 완료** — `/{ko|en|ja}` · `/{locale}/rebalancing`, 진짜 hreflang, 로케일별 메타·sitemap·OG·JSON-LD. 도메인 `https://fintech.ramza.app`. **남은 수동:** GSC 등록·콘텐츠·백링크.

---

## 0. 현황 판정 요약

### 0.1 한 줄 판정

**코드 측 SEO는 P1까지 반영.**  
공개 범위는 **단일 페이지 2개** (`/`, `/rebalancing`). 서버 소개·OG·구조화 데이터까지 완료. **GSC는 배포 후 수동.** **P2 로케일 라우팅·P3 가이드는 현 범위 밖.**

### 0.2 잘 된 것

| 항목 | 근거 |
|------|------|
| 페이지 메타 | `buildPageMetadata` + `seo.json` (home/rebalancing 키워드 보강) |
| robots / sitemap 골격 | `app/robots.ts`, `app/sitemap.ts` |
| H1 키워드 | `/rebalancing` 공통 H1 (리밸런싱 계산기) |
| FAQ SEO | `FaqSection` + FAQPage JSON-LD, 답변 DOM 유지 |
| 사용법 SEO | `HowToDetail` 모드별 장문, 접혀도 DOM 유지 (`howto.json`) |
| 면책·정수주수 설명 | howto + FAQ에 계산 규칙 정합 |

### 0.3 부족한 것 / 위험

| 심각도 | 항목 | 현황 |
|--------|------|------|
| — | **sitemap soft-404** | ✅ 해소: `SEO_PATHS` = `/`, `/rebalancing`만 |
| — | **SITE_URL** | ✅ `https://fintech.ramza.app` (`.env` / `.env.example` / 코드 기본값) |
| — | **로케일 URL · hreflang** | ✅ `/ko` `/en` `/ja` + alternates.languages |
| — | **본문 SSR** | ✅ 홈·`/rebalancing` 서버 소개·면책 HTML. FAQ/howto는 클라이언트+DOM 유지 |
| — | **가이드·FAQ 독립 URL** | **현재 범위 제외.** FAQ·howto는 `/rebalancing` 내 섹션 |
| — | **OG 이미지** | ✅ `opengraph-image.tsx` (홈·rebalancing) |
| — | **구조화 데이터** | ✅ WebApplication + HowTo + FAQPage + WebSite |
| 낮 | **GSC** | ⬜ 배포 후 수동 등록·sitemap 제출 |
| — | **홈 콘텐츠** | ✅ 서버 intro + CTA 내부링크 |

---

## 0.4 제품 포지셔닝

| 항목 | 내용 |
|------|------|
| 핵심 가치 | 목표 비중 → 정수 매수/매도 수량 계산 (기본 매수 + 보유 포트폴리오 리밸런싱) |
| 공통 H1 | **람자 포트폴리오 리밸런싱 계산기** (`common.shell` / `common.h1`, 모드와 무관. ja는 Ramza 표기) |
| 모드 | 단순 매수 / 포트폴리오 기반 (클라이언트 전환, URL은 `/rebalancing` 공유) |
| 언어 | `ko` (기본 SEO 로케일) · `en` · `ja` |
| 통화 표시 | `KRW` / `USD` / `JPY` (계산 로직 동일) |

### 공통 H1 (다국어)

| Locale | H1 |
|--------|-----|
| ko | 람자 포트폴리오 리밸런싱 계산기 |
| en | Ramza Portfolio Rebalancing Calculator |
| ja | Ramza ポートフォリオリバランス計算機 |

모드 구분은 대형 카드·본문 제목으로 두고, SEO 랜딩 URL은 `/rebalancing` 하나를 유지한다.

---

## 1. 정보 구조 (IA) & URL

### 1.1 현재 공개 URL (확정 · P2)

| 경로 | 역할 | sitemap · hreflang |
|------|------|---------------------|
| `https://fintech.ramza.app/{ko\|en\|ja}` | 홈 · CTA | ✅ |
| `https://fintech.ramza.app/{locale}/rebalancing` | 계산기 + FAQ + howto | ✅ |

- `/`, `/rebalancing` → Accept-Language·쿠키 기준 `/{locale}/…`로 **리다이렉트**
- `x-default` → `ko`
- 가이드·독립 FAQ 라우트는 **만들지 않음**. FAQ/howto는 계산기 페이지 섹션

환경 변수: `NEXT_PUBLIC_SITE_URL=https://fintech.ramza.app`

---

## 2. 1단계 · 기술적 SEO

### 2.1 체크리스트

| # | 항목 | 상태 | 비고 |
|---|------|------|------|
| T1 | 페이지별 Title / Description | ✅ | `seo.json` + `buildPageMetadata` |
| T2 | Canonical / Open Graph / Twitter | ✅ | 텍스트 + images |
| T3 | robots.txt / sitemap.xml | ✅ | `/`, `/rebalancing`만 · host `fintech.ramza.app` |
| T4 | Google Search Console 등록·사이트맵 제출 | ⬜ | **수동** — 배포 후 `fintech.ramza.app` |
| T5 | SSR 색인 본문 | ✅ | 홈·rebalancing 서버 소개. FAQ/howto DOM 유지 |
| T6 | OG / Twitter 이미지 | ✅ | `app/opengraph-image.tsx`, `app/rebalancing/opengraph-image.tsx` |
| T7 | HowTo / WebApplication JSON-LD | ✅ | + FAQPage(FaqSection) + WebSite(홈) |
| T8 | 실질 hreflang (서로 다른 URL) | ✅ | `/{locale}` · `/{locale}/rebalancing` + x-default=ko |

### 2.2 구현 원칙

1. **메타는 서버에서**: `generateMetadata` / `buildPageMetadata`만 사용. 클라이언트에서 `document.title` 덮어쓰지 않음.
2. **본문 H1 = 브랜드 검색어**: 계산기 화면 H1은 항상 공통 H1.
3. **색인 단위**: 모드(기본/포트폴리오)는 클라이언트 state, SEO 랜딩은 `/` · `/rebalancing`만.
4. **계산 UI는 hydration 후 동작**해도 되며, 상단 설명·FAQ·howto는 가능하면 서버 HTML에 포함.
5. **sitemap URL = `/`, `/rebalancing`만.** 새 공개 페이지를 만들기 전까지 경로를 추가하지 않음.

### 2.3 Search Console (수동 절차)

1. `NEXT_PUBLIC_SITE_URL`을 프로덕션 도메인으로 설정·배포  
2. GSC에서 도메인 또는 URL 접두어 속성 추가  
3. DNS/HTML 파일/메타태그로 소유권 확인  
4. `https://{domain}/sitemap.xml` 제출 (**실페이지만 포함한 뒤**)  
5. URL 검사로 `/`, `/rebalancing` 색인 요청  
6. (로케일 도입 후) 국제 타겟팅·`hreflang` 오류 리포트 모니터링  

### 2.4 Core Web Vitals

- LCP: 헤더·히어로 텍스트 우선, 대형 차트는 lazy  
- INP: 입력 핸들러 단순 유지  
- CLS: 표·파이차트 영역 min-height 예약  

---

## 3. 2단계 · 콘텐츠 SEO

### 3.1 페이지·콘텐츠 매트릭스 (다국어)

모든 본문은 **ko 원문 작성 → en/ja 번역(또는 병렬 집필)** 후 `src/languages/{locale}/` 또는 MDX에 둔다.

| 슬러그 | 검색 의도 (예시 키워드) | 상태 |
|--------|-------------------------|------|
| (home) | 포트폴리오 리밸런싱 계산기 | ✅ 서버 intro + CTA |
| rebalancing | 주식·ETF 리밸런싱, 목표 비중 계산 | ✅ 계산기 + FAQ + howto + 서버 소개·면책 |

### 3.2 체크리스트

| # | 항목 | 상태 | 콘텐츠 요구 |
|---|------|------|-------------|
| C1 | 메인 계산기 설명 콘텐츠 | ✅ | `RebalancingSeoIntro` 서버 렌더 + howto 아코디언 |
| C1b | 사용 방법 상세 (`howto`) | ✅ | `HowToDetail` + `howto.json` (ko/en/ja). 모드별 본문, 접혀도 DOM 유지 |
| C5 | FAQ (`/rebalancing` 섹션) | ✅ | `FaqSection` 6문항 + FAQPage JSON-LD. 독립 `/faq` 없음 |

### 3.3 콘텐츠 공통 템플릿 (가이드 1편)

```
1. H1 (검색 의도 키워드 포함, seo.json title과 정합)
2. 요약 3~5문장: 시세로 비중이 저절로 깨짐 → 목표 비중으로 되돌리는 매수·매도액
3. CTA → /rebalancing
4. 개념 H2
5. 숫자 예시 (표) + 계산기에서 따라 하기
6. 세금·수수료·면책 (투자 자문 아님)
7. 관련 가이드·FAQ 링크
```

### 3.4 FAQ

- 본문: `src/languages/{ko,en,ja}/faq.json`
- UI: `FaqSection` (details/summary, 답변 항상 DOM)
- JSON-LD: `FAQPage`

투자자 질문 우선, 앱 조작 질문은 짧게.

### 3.5 i18n 파일 역할

| 파일 | 역할 |
|------|------|
| `seo.json` | Title / Description (페이지 키) |
| `common.json` | H1, 내비, 셸 UI |
| `calculator.json` / `portfolio.json` | 계산기 UI |
| `faq.json` | FAQ 문항 |
| `howto.json` | 사용 방법 상세 (basic / portfolio / common) |
| content/MDX (예정) | 가이드 본문 |

SEO 문구와 화면 H1은 **같은 핵심 키워드**를 쓰되, Title은 클릭유도·Description은 요약으로 분화한다.

---

## 4. 3단계 · 검색 유입 개선

| # | 항목 | 상태 | 실행 |
|---|------|------|------|
| G1 | 홈 ↔ 계산기 내부 링크 | ✅ | 홈 CTA ↔ 계산기 홈 링크 |
| G2 | 모바일·CWV 점검 | ⬜ | 배포 후 PageSpeed / CrUX (운영) |
| G3 | 검색어별 노출·CTR 분석 | ⬜ | GSC 검색 실적 (운영) |
| G4 | 실적 기반 콘텐츠 보완 | ⬜ | Description·H2 보강 (운영) |

### 4.1 내부 링크 규칙

- 홈 → `/rebalancing` CTA  
- (선택) 계산기 → 홈 복귀 링크  
- 앵커 텍스트는 키워드 자연어  

### 4.2 측정

| 지표 | 도구 | 주기 |
|------|------|------|
| 노출 / 클릭 / CTR / 평균 순위 | GSC | 주 1회 초반, 이후 월 1회 |
| LCP / INP / CLS | PSI, CrUX | 배포마다 |
| 로케일별 유입 | GSC + (선택) analytics | 월 1회 |

---

## 5. 다국어 운영 규칙

1. **키 구조 동일**: `seo.json` 페이지 키는 ko/en/ja 완전 동일.  
2. **번역 단위**: UI ≠ 마케팅 본문. 본문은 로케일별 자연 검색어로 재작성 가능.  
3. **hreflang**: 동등 페이지끼리만, **서로 다른 URL**. 미번역은 sitemap 제외.  
4. **날짜·숫자·통화**: ko 원 / en $ / ja 円 또는 달러 병기.  
5. **면책**: 세 언어 모두 “투자 권유·자문 아님” 유지.

---

## 6. 우선순위 로드맵 (부족분 채움)

| Phase | 기간 감 | 산출물 | 상태 |
|-------|---------|--------|------|
| **P0a** | — | 공통 H1, seo.json, metadata/robots/sitemap 골격, FAQ, howto | ✅ |
| **P0b** | — | sitemap = `/`, `/rebalancing`만 · `SITE_URL=https://fintech.ramza.app` · guides/faq SEO 키·nav 제거 | ✅ |
| **P1** | — | OG·JSON-LD·sitemap 정리·내부링크 | ✅ |
| **P2** | — | `app/[locale]` · 실 hreflang · 로케일 메타/sitemap/OG/JSON-LD · 구 URL 리다이렉트 | ✅ |
| **P2-ops** | 수동 | GSC 등록 · sitemap 제출 · `/ko` `/en` `/ja` URL 검사 · 국제 타겟팅 | ⬜ |
| **P3** | — | 가이드·독립 FAQ 페이지 없음 | — |
| **P4** | 지속 | CWV, GSC 기반 Description/H2 개선 | ⬜ 운영 |

---

## 7. 검수 기준 (Definition of Done)

### 기술

- [x] 각 공개 URL 고유 title / description / canonical (코드)  
- [x] `/robots.txt`, `/sitemap.xml` + host `https://fintech.ramza.app`  
- [x] **sitemap URL = `/`, `/rebalancing`만**  
- [x] OG/Twitter 이미지 메타 + `opengraph-image` 라우트  
- [x] 가짜 hreflang 미사용  
- [ ] GSC 등록·sitemap 제출 (수동)  
- [ ] (P2 이후) hreflang 상호 참조 오류 0  

### 콘텐츠

- [x] `/rebalancing` H1 1개 + 핵심 키워드  
- [x] FAQ + howto 본문 (클라이언트 DOM 유지)  
- [x] 서버 렌더 소개·면책 블록  
- [x] seo.json 페이지 키 = `site` / `home` / `rebalancing`만 (ko/en/ja)  

### 공통 UI

- [x] 기본·포트폴리오 모드 동일 H1  
- [x] 모드 카드로 도구 구분  

---

## 8. 리스크·제약

- **클라이언트 전용 본문**: FAQ/howto는 DOM 유지로 완화했으나, 서버 HTML 보강이 더 안전 (P1).  
- **단일 URL 다국어**: 언어별 색인 분리 불가 → P2 로케일 라우트 (`/`, `/rebalancing`만).  
- **금융 규제·면책**: 수익 보장·종목 추천 문구 금지.  
- **로컬스토리지**: 서버 미전송은 FAQ에 명시 (E-E-A-T).

---

## 9. 참고 파일

| 경로 | 설명 |
|------|------|
| `src/lib/seo/site.ts` | SITE_URL, 로케일, 경로 상수 (`SEO_PATHS`) |
| `src/lib/seo/metadata.ts` | Title/Description/Canonical/OG 빌더 |
| `src/lib/seo/jsonLd.ts` | WebSite / WebApplication / HowTo JSON-LD |
| `src/app/opengraph-image.tsx` | 홈 OG 이미지 |
| `src/app/rebalancing/opengraph-image.tsx` | 계산기 OG 이미지 |
| `public/brand/ramza-icon.jpg` | Ramza 브랜드 아이콘 (favicon/apple) |
| `src/app/icon.jpg` · `apple-icon.jpg` | Next 앱 아이콘 |
| `src/languages/*/seo.json` | 페이지별 SEO 카피 (+ intro) |
| `src/languages/*/faq.json` | FAQ 본문 |
| `src/languages/*/howto.json` | 사용 방법 상세 |
| `src/components/rebalancing/FaqSection.tsx` | FAQ 아코디언 + FAQPage JSON-LD |
| `src/components/rebalancing/HowToDetail.tsx` | 사용 방법 자세히 보기 |
| `src/components/rebalancing/ModeSteps.tsx` | 사용 방법 3스텝 + HowToDetail |
| `src/components/rebalancing/RebalancingShell.tsx` | 히어로·모드·계산기·FAQ |
| `src/app/robots.ts` / `sitemap.ts` | 크롤러 진입점 |
| `docs/howto-detail-plan.md` | howto UI·카피 기획 |

---

## 10. 변경 이력

| 날짜 | 내용 |
|------|------|
| 2026-11-13 | 초기 기획 (P0 골격·3단계 로드맵) |
| 2026-11-13 | **현황 판정 반영**: 부분 최적화, FAQ·howto ✅, P0b~P4 부족분 체크리스트 재작성 |
| 2026-11-13 | **단일 페이지 범위 확정**: `/`·`/rebalancing`만, 도메인 `fintech.ramza.app`, guides/faq 경로·seo 키 제거, P3 보류 |
| 2026-11-13 | **P1 코드 완료**: OG·JSON-LD·내부링크 |
| 2026-11-13 | **P2 로케일 SEO**: `/{ko,en,ja}` · `/{locale}/rebalancing`, hreflang, middleware 리다이렉트 |
