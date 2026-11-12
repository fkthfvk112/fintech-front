[!IMPORTANT]

⚠️ AI 코딩 지침 & 필수 준수 사항 (Mandatory AI Rules)


상시 참조 의무: AI 어시스턴트는 본 프론트엔드의 코드를 분석, 추가, 수정, 리팩토링할 때 반드시 본 가이드 문서를 사전에 정독하고 아키텍처 원칙과 인터페이스 규칙을 준수해야 합니다.


작업 후 문서 갱신 의무: 새로운 파일 추가, 기존 메소드 변경/추가, 아톰/캐시/이벤트 구조 변경 등의 작업이 완료되면, 작업 종료 전 반드시 본 문서의 해당 섹션을 최신 상태로 업데이트해야 합니다.

## 📌 목차 (Table of Contents)
1. [프로젝트 개요 (Overview)]
2. 디렉토리 구조 및 파일/컴포넌트/훅 가이드
3. [AI 작업 완료 체크리스트 & 변경 관리 규정]

## 1. 프로젝트 개요 (Overview)
**람자 포트폴리오 리밸런싱 계산기** (프론트엔드 전용, 백엔드 미연동). 브랜드: ko 람자 / en·ja Ramza.

- 스택: Next.js 14 (App Router) + React 18 + TypeScript + Tailwind + Jotai + i18next + recharts
- 라우트
  - `/{ko|en|ja}` : 제품 소개 + 계산기 CTA
  - `/{locale}/rebalancing` : 리밸런싱 계산기 (+ 포트폴리오 기반 모드)
  - `/`, `/rebalancing` → locale 경로로 리다이렉트 (middleware)
  - `/robots.txt`, `/sitemap.xml` : 기술 SEO
- 공통 H1: `common.shell` — **람자 포트폴리오 리밸런싱 계산기** (강조색 분리). 모드 전환은 대형 카드 (`ToolModeCards`)
- 다국어: URL prefix `ko` / `en` / `ja` + hreflang (전환 시 URL·i18n 동기화)
- 폰트: ko Pretendard / en Inter / ja Noto Sans JP (`html[lang]` → `--font-app`)
- 통화: `USD` / `KRW` / `JPY` (표시용, 계산은 동일 로직)
- SEO: **P2 완료** — `/{ko\|en\|ja}` · `/{locale}/rebalancing`, hreflang, 로케일 메타/sitemap. 도메인 `https://fintech.ramza.app`. **수동:** GSC. 상세: `docs/seo-plan.md`

## 2.1. 디렉토리 구조 및 파일/컴포넌트/훅 가이드

```
src/
  app/
    layout.tsx                    # buildPageMetadata(home)
    page.tsx
    rebalancing/page.tsx          # RebalancingShell + metadata
    robots.ts
    sitemap.ts
  languages/
    {ko,en,ja}/
      common.json                 # h1, nav
      calculator.json
      portfolio.json
      seo.json                    # 페이지별 title/description
      faq.json                    # FAQ 6문항 (ko/en/ja)
      howto.json                  # 사용 방법 상세 안내 (basic/portfolio/common)
  lib/
    i18n/ ...
    seo/
      site.ts                     # SITE_URL, LOCALES, SEO_PATHS
      metadata.ts                 # buildPageMetadata (canonical/OG)
    rebalancing/
      money.ts
      calculate.ts                # 신규 매수 수량 계산 (재사용)
      validate.ts                 # 기본 계산기 검증
      validatePortfolio.ts        # 포트폴리오/추가매수 검증
      names.ts
      portfolioSummary.ts         # calculatePortfolioSummary
      purchaseRows.ts             # 포트폴리오+수동 행 병합·가격 오버라이드
      targetRebalance.ts          # calculateTargetRebalance, holdingsFromAddResult
  rebalancing/interface/types.ts
  stores/
    portfolioAtom.ts              # portfolioHoldingsAtom (localStorage)
    storageHelper.ts
    uiAtom.ts                     # 저장 확인 모달/토스트
  components/rebalancing/
    RebalancingShell.tsx          # 히어로 + ToolModeCards + 임베드 폼 + FAQ
    ToolModeCards.tsx / ModeSteps.tsx / ModeToolbar.tsx
    HowToDetail.tsx               # 사용 방법 「자세히 보기」 (모드별 howto 본문, 접혀도 DOM 유지)
    RebalancingCalculator.tsx     # 단순 매수 (embedded)
    PortfolioAddMode.tsx          # 포트폴리오 기반 (embedded)
    PortfolioEditor.tsx
    PortfolioPieChart.tsx
    PortfolioResultPanel.tsx
    PortfolioLoadModalContent.tsx
    PortfolioSaveNameContent.tsx
    FaqSection.tsx                # 공용 FAQ 아코디언 + FAQPage JSON-LD
    StockRow.tsx / WeightBar.tsx / ResultPanel.tsx / LocaleSwitcher.tsx
docs/
  seo-plan.md                     # SEO·콘텐츠·다국어 기획서
  howto-detail-plan.md            # 사용 방법 상세 안내 기획서
```

### 계산 로직 요약 (`calculateRebalancing`)
1. 총 금액 = 총 매수 금액 — minor unit(×100) 정수 연산
2. 할당 금액 = 총 금액 × (비중/100)
3. 매수 수량 = floor(할당 금액 / 주가)
4. 현금 = 총 금액 − 실제 매수 금액 (미입력 비중 + 내림으로 남은 차액). 잔여액 추가 매수(greedy) 없음
5. 현금이 있으면 결과 테이블에 `현금 (Cash)` 행 추가 (비중 합 100%여도 차액이 남으면 표시)

### 포트폴리오 기반 추가
- 진입: 기본 계산기 `총 매수 금액` 위 `포트폴리오 기반 추가` 버튼 → `PortfolioAddMode`로 교체
- 기본 계산기와 상태 완전 분리 (`RebalancingShell` 모드 전환)
- 보유 포트폴리오: 초안 편집 → 이름 입력 모달로 **복수** 저장 (`savedPortfoliosAtom`)
- 불러오기: 공용 모달에 이름/저장일시/삭제 목록 → 항목 클릭 시 로드
- 추가 매수 목록에 포트폴리오 종목 행 표시 (`*포트폴리오.`)
- 포트폴리오 행: 기본은 이름·가격·비중 편집 가능 / 수동 동명 행이 있으면 가격 ~~기존~~신규 + 붉은 안내, 비중 잠금(클릭 시 신규 비중 포커스)
- **배분 원칙 (`calculateTargetRebalance`)**
  1. 총 금액 = 현재가(동명 신규 행 가격 우선)로 평가한 기존 보유 금액 + 추가 매수 금액
  2. 할당 금액 = 총 금액 × 종목 비중 (절대 %, 재정규화 없음)
  3. 목표 수량 = floor(할당 금액 ÷ 가격) → 보유 수량보다 많으면 매수, 같으면 홀딩, 적으면 매도
  4. 현금 = 총 금액 − 최종 주식 평가액 (미할당 비중 + 내림으로 남은 차액). 잔여액 추가 매수(greedy) 없음
- 결과 비중은 총 금액(주식+현금) 기준, 현금 행 별도 표시
- `포트폴리오로 저장`: 이름 모달로 최종 보유 저장(동명 시 덮어쓰기)

### 검증 규칙
- 총액/추가매수금액: 필수, 0 초과 정수
- 가격: 필수, 0 초과(소수점 허용)
- 비중: 필수, 0 초과 100 이하, 합계 ≤ 100%
- 비중 합 > 100%: UI 빨간 경고 + 계산 버튼 비활성
- 비중 합 < 100%: 나머지를 `현금 (Cash)` 행으로 자동 편입
- 포트폴리오 모드: 종목명 필수·중복 불가, 보유 수량 0 이상 정수

## 2.2. 아톰(Atom) 구조 및 전역 상태 관리
모든 아톰은 `stores/...Atom.ts`에 도메인별로 기록합니다.

| Atom | 키/위치 | 설명 |
|------|---------|------|
| `savedPortfoliosAtom` | `rebalancer.portfolios` | `SavedPortfolio[]` (이름·저장일시·holdings) |
| `upsertSavedPortfolioActionAtom` | write | 동명 덮어쓰기 / 신규 추가 |
| `deleteSavedPortfolioActionAtom` | write | 목록에서 삭제 |
| `modalAtom` / toast atoms | `uiAtom` | 불러오기·저장 이름 모달·토스트 |
| 기본 계산기 입력/결과 | 로컬 state | 페이지 로컬 |

## 3.3 ColorCode 및 공통 디자인 톤앤매너
모든 컴포넌트는 `constants/Colors.ts`의 `ColorCode`를 기준으로 톤앤매너를 유지합니다.
현재 프로젝트의 핵심 톤앤 매너: slate 배경 + emerald 액센트(계산/CTA), rose 에러.

## 3.4 텍스트 크기 공용화
모든 텍스트의 크기를 조정할 때에는 `constants/Text.ts`의 `Texts`를 적용합니다.
(리밸런싱 UI는 Tailwind 유틸로 반응형 타이포를 사용 중이며, 신규 공통 컴포넌트에서는 `Texts`를 우선 검토합니다.)

### 3.5 인터페이스 & 데이터 타입 규칙
1. **인터페이스 접미사 규칙**:
   - `*_C`: 데이터 생성(Create) 요청 모델
   - `*_R`: 서버에서 읽어온(Read) 응답 모델
   - `*_U`: 데이터 수정(Update) 요청 모델

리밸런싱/포트폴리오 로컬 타입은 `src/rebalancing/interface/types.ts`:
`StockRowInput`, `RebalancingResult`, `PortfolioHolding`, `PortfolioAddResult`, `MergedHoldingResult` 등.

#### 4. AI 작업 완료 체크리스트 & 변경 관리 규정

AI 어시스턴트는 코드 작업 완료 후 응답을 반환하기 전에 아래 체크리스트를 점검해야 합니다.

- [ ] **1차 재검토 (코드 정합성)**: 추가/수정된 프론트엔드 코드가 본 가이드에 명시된 디렉토리 위치, 패키지 네이밍, DTO/인터페이스 컨벤션과 일치하는가?
- [ ] **2차 재검토 (아키텍처 영향도)**:
  - 새로운 상태가 Jotai 아톰 분리 원칙에 부합하는가?
  - 디자인 컬러가 `ColorCode` 상수를 충실히 사용하는가?
- [ ] **문서 최신화**: 새로 생성된 파일이나 변경된 핵심 컴포넌트/훅/아톰이 본 문서(`agent.md`)에 누락 없이 반영되었는가?

---

## 기능 구현 기록

### 2026-11-12 — 리밸런싱 계산기 초기 구성
- i18n (`i18next` + `react-i18next`) 및 `src/languages/{ko,en,ja}` JSON 네임스페이스 추가
- `/rebalancing` 주식 매수 리밸런싱 UI/검증/계산/결과(복사·초기화·stale 표시) 구현
- `/` 프로젝트 설명 플레이스홀더로 교체
- 백엔드 연동 없음

### 2026-11-12 — i18n 언어 감지 버그 수정
- 원인: `I18nProvider` 렌더마다 `initI18n()` 기본값 `en` 호출 → `ko` 적용 후 리렌더 시 다시 `en`으로 되돌림
- 수정: `initI18n`은 초기화만 수행, 언어 변경은 `changeI18nLanguage`로 분리. 감지 완료 전 children 미렌더

### 2026-11-12 — 비중 미달분 현금 자동 편입
- 비중 합 = 100% 필수 검증 제거 → 합 ≤ 100% 허용
- 100% − 주식 비중 합을 `현금 (Cash)` 결과 행으로 추가
- 의도적 현금 비중은 주식 추가매수에 쓰지 않도록 예약 후 배분

### 2026-11-12 — 포트폴리오 기반 추가
- `RebalancingShell`로 기본 계산기 / 포트폴리오 모드 분리
- `portfolioHoldingsAtom` (Jotai + localStorage) 및 편집·파이차트·저장
- `calculateRebalancing` + `mergePortfolio` + `calculatePortfolioSummary`
- 통합 결과 UI, 확인 모달 후 포트폴리오 저장, ko/en/ja `portfolio` 네임스페이스

### 2026-11-12 — 모드 전환 버튼 위치 통일
- `기본 계산기로` 버튼을 헤더 링크에서 본문 상단 outline 버튼으로 이동
- `포트폴리오 기반 추가`와 동일한 위치/스타일

### 2026-11-12 — 파이차트 recharts 재구현
- 커스텀 SVG `PortfolioPieChart`를 `recharts` (`PieChart` / `Pie` / `Tooltip` / `Legend`)로 교체

### 2026-11-12 — 파이차트 색상 개선 + 포트폴리오 불러오기
- 파이 슬라이스 팔레트를 고채도·고대비 색상으로 교체
- `포트폴리오 저장` 옆에 `포트폴리오 불러오기` 추가 (localStorage/atom 저장본 → 편집 초안)

### 2026-11-12 — 복수 포트폴리오 저장
- `SavedPortfolio[]` + `rebalancer.portfolios`로 저장 구조 변경 (레거시 단일 배열 마이그레이션)
- 저장 시 이름 입력 모달, 불러오기 시 공용 모달에 이름/저장일시/삭제·클릭 로드
- `GlobalModal`에 `hideConfirm` / `size` / `onConfirm===false` 유지 지원

### 2026-11-12 — 추가 매수 목록에 포트폴리오 종목 표시
- 포트폴리오 행: `*포트폴리오.` 붉은 표기, 이름·가격 readOnly, 비중만 편집(추가 매수 배분용)
- 수동 행과 동명 시 ~~기존가~~ 신규가 표시, 계산 병합은 `purchaseRows.mergePurchaseRowsForCalc`
- 기존 보유 수량은 배분 입력으로 쓰지 않음 — 추가 매수 금액만 비중 배분 후 merge

### 2026-11-12 — 총자본 목표비중 매수/매도 리밸런싱
- 동명 시 가격 불일치 문구 + 포트폴리오 비중 잠금(신규 비중으로 포커스)
- 포트폴리오 행 기본 편집 가능(동명 예외 제외)
- `calculateTargetRebalance`: (기존평가+추가금액)×비중 → 매수/매도 정수 수량, 결과 탭 분리

### 2026-11-12 — 주식 행 기본값/추가 버튼 UI
- 기본·포트폴리오 모드 모두 초기 수동 행을 `A` 1개만 생성
- `주식 추가` 버튼을 행 목록 하단 중앙으로 이동

### 2026-11-12 — 포트폴리오 뱃지 스타일
- `*포트폴리오` 문구/배경을 emerald 톤으로 변경, 말미 `.` 제거

### 2026-11-12 — 미할당 비중 현금 예약 수정
- 목표비중 합 < 100%일 때 나머지를 종목에 흡수하지 않고 현금 슬리브로 유지
- 최종 비중/파이차트에 현금 행 포함 (총자본 대비 %)

### 2026-11-12 — 총 평가 금액 기준 가격 명시
- 동명 신규 행이 있으면 기존 보유분도 신규 가격으로 재평가됨 (종목당 가격은 하나). 총 운용 금액 = 재평가된 기존 평가액 + 추가 매수 금액
- 상단 `전체 평가 금액`(포트폴리오 저장 가격)과 다를 수 있으므로, 추가 매수 금액 아래 문구에 더해지는 두 값을 직접 표기하고 재평가 시 info 안내(`portfolioRevalued`) 노출

### 2026-11-13 — `calculateTargetRebalance` 단순화
- 총 금액 → 비중 할당 → floor(할당 ÷ 가격) = 목표 수량 → 보유 수량과 비교해 매수/홀딩/매도, 남은 차액은 현금. greedy 추가 매수·매수 한도 조정 제거
- `PortfolioAddResult`를 직접 반환 (`TargetRebalanceResult`/`toPortfolioAddResult` 제거), 미사용 필드(`finalPortfolioValue`, `currentValue`) 제거
- 쓰이지 않던 이전 방식 코드 삭제: `mergePortfolio.ts`(→ `holdingsFromAddResult`만 `targetRebalance.ts`로 이동), `stocksFromMergedRows`

### 2026-11-13 — `calculateRebalancing` 단순화
- 포트폴리오 모드와 같은 순서로 정리: 총 금액 × 비중 → floor(할당 ÷ 가격) → 남은 차액은 현금. 편차 최소화 greedy 추가 매수 제거
- 비중 합이 100%여도 차액이 남으면 현금 행 표시 (목표 비중 0%)

### 2026-11-13 — 공통 H1 + SEO 1단계 골격
- 기본/포트폴리오 모드 공통 H1 (`common.h1`) + `CalculatorPageHeader`
- `docs/seo-plan.md` 기획서 (기술·콘텐츠·유입 3단계, ko/en/ja 매트릭스, 로케일 URL 로드맵)
- `buildPageMetadata` / `robots.ts` / `sitemap.ts` / `seo.json` 페이지 키 확장
- `NEXT_PUBLIC_SITE_URL` (`.env.example`) — GSC·canonical용

### 2026-11-13 — 공용 FAQ 아코디언 (SEO)
- `FaqSection`: details/summary 아코디언, 답변은 항상 DOM에 포함, `FAQPage` JSON-LD
- 기본·포트폴리오 모드 하단 공통 배치. 문구: `languages/{ko,en,ja}/faq.json` (Q1~Q6)

### 2026-11-13 — 툴 선택 UI (대형 카드)
- `/rebalancing` 상단: 뱃지 + 강조 H1 + 리드문 + MAIN/SUB 대형 카드 + 3단계 안내
- 단순 매수 / 포트폴리오 기반 리밸런싱을 카드로 전환, 폼은 하단에 임베드
- 액센트 컬러 `#4A89F3` (참고 UI 톤)

### 2026-11-13 — 사용 방법 상세 안내 (`HowToDetail`)
- `ModeSteps` 아래 「자세히 보기」 토글: `aria-expanded` / `aria-controls`, 기본 접힘, 접혀도 DOM 유지
- 모드별 본문만 렌더 (`basic` / `portfolio`), 모드 전환 시 펼침 상태 유지
- i18n `howto` 네임스페이스 (`languages/{ko,en,ja}/howto.json`) + 공통 계산 기준·면책
- `/rebalancing` seo title/description 키워드 보강 (ko/en/ja)
- 기획: `docs/howto-detail-plan.md`

### 2026-11-13 — SEO 현황 판정·부족분 기획서 갱신
- `docs/seo-plan.md`: 부분 최적화 판정, FAQ/howto ✅, P0b~P4 채움 로드맵·DoD 반영

### 2026-11-13 — SEO 단일 페이지·도메인 확정
- `SEO_PATHS` / sitemap = `/`, `/rebalancing`만 · `SITE_URL=https://fintech.ramza.app`
- `seo.json` guides/faq 키 제거, `common.nav` guides/faq 제거
- 가이드·독립 FAQ 라우트는 현 범위에서 제외 (FAQ는 `/rebalancing` 섹션)

### 2026-11-13 — SEO P1 코드 반영
- 홈 SSR intro, OG `opengraph-image`, WebApplication/HowTo/WebSite JSON-LD
- 가짜 `alternates.languages` 제거, 홈↔계산기 내부링크
- GSC 등록은 배포 후 수동 (`docs/seo-plan.md` P1-ops)

### 2026-11-13 — Ramza 브랜드 아이콘 · SEO 소개 섹션 제거
- `/rebalancing` 「이 계산기로 할 수 있는 것」 서버 섹션 삭제 (`RebalancingSeoIntro` 제거)
- Ramza 로고 아이콘: `public/brand/ramza-icon.jpg` + `app/icon.jpg` / `apple-icon.jpg` (계산기 형상 없음)

### 2026-11-13 — 제품명 「람자 포트폴리오 리밸런싱 계산기」
- ko: 람자 / en·ja: Ramza. H1·seo·howto·OG·헤더 `appName` 통일

### 2026-11-13 — P2 로케일 라우팅 · hreflang
- `app/[locale]/…`, middleware로 `/`·`/rebalancing` → `/{locale}/…`
- 로케일별 generateMetadata + alternates.languages, sitemap × 3 locale
- LocaleSwitcher가 URL prefix 전환, I18nProvider는 URL locale 동기화
