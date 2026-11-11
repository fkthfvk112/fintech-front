"use client";

import { useEffect, useState } from "react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import {
  accessTokenAtom,
  userProfileAtom,
  isAuthenticatedAtom,
  logoutActionAtom,
} from "@/stores/authAtom";
import {
  openModalActionAtom,
  addToastActionAtom,
} from "@/stores/uiAtom";
import { hasSeenWelcomeTutorialAtom } from "@/stores/onboardingAtom";
import { apiRequest } from "@/lib/api/client";
import { useSSE } from "@/lib/hooks/useSSE";
import { useClipboard } from "@/lib/hooks/useClipboard";
import { formatTimeDiff } from "@/lib/utils/time";
import { Button } from "@/components/ui/Button";
import {
  Activity,
  Shield,
  Bot,
  Radio,
  Copy,
  Check,
  Sparkles,
  Layers,
  LogOut,
  Bell,
  RefreshCw,
} from "lucide-react";

export default function Home() {
  // 1. Jotai 전역 상태 구독
  const [accessToken, setAccessToken] = useAtom(accessTokenAtom);
  const [userProfile, setUserProfile] = useAtom(userProfileAtom);
  const isAuthenticated = useAtomValue(isAuthenticatedAtom);
  const logout = useSetAtom(logoutActionAtom);

  const openModal = useSetAtom(openModalActionAtom);
  const addToast = useSetAtom(addToastActionAtom);

  const [hasSeenTutorial, setHasSeenTutorial] = useAtom(hasSeenWelcomeTutorialAtom);

  // 2. 컴포넌트 로컬 상태
  const [health, setHealth] = useState<any>(null);
  const [loadingHealth, setLoadingHealth] = useState(false);
  const [apiResult, setApiResult] = useState<any>(null);
  const [clientId] = useState(() => "client-" + Math.random().toString(36).substring(2, 9));
  const [streamUrl, setStreamUrl] = useState<string | null>(null);

  const { messages, isConnected, clearMessages } = useSSE(streamUrl);
  const { copy, hasCopied } = useClipboard();

  // 3. 백엔드 헬스체크
  const checkHealth = async () => {
    setLoadingHealth(true);
    try {
      const res = await apiRequest("/api/v1/health");
      setHealth(res.data);
    } catch (err: any) {
      setHealth({ status: "DOWN", message: err.message });
    } finally {
      setLoadingHealth(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  // 4. API 테스트 핸들러
  const handleSuccessCall = async () => {
    try {
      const res = await apiRequest("/api/v1/sample/success");
      setApiResult({ type: "success", data: res });
      addToast({ type: "success", message: "성공 응답을 성공적으로 수신했습니다." });
    } catch (err: any) {
      setApiResult({ type: "error", data: err });
      addToast({ type: "error", message: err.message });
    }
  };

  const handleErrorCall = async () => {
    try {
      const res = await apiRequest("/api/v1/sample/business-error");
      setApiResult({ type: "success", data: res });
    } catch (err: any) {
      setApiResult({ type: "error", data: err });
      addToast({ type: "error", message: `[${err.code}] ${err.message}` });
    }
  };

  const handleIssueJwt = async () => {
    try {
      const res = await apiRequest("/api/v1/sample/token?userId=tester_kim", "POST");
      const { accessToken: token, userId } = res.data;

      // Jotai 전역 상태에 저장 -> localStorage 자동 동기화
      setAccessToken(token);
      setUserProfile({ userId, roles: ["ROLE_USER"] });

      setApiResult({ type: "success", data: res });
      addToast({ type: "success", message: "Jotai 상태 및 LocalStorage에 JWT가 저장되었습니다." });
    } catch (err: any) {
      setApiResult({ type: "error", data: err });
      addToast({ type: "error", message: err.message });
    }
  };

  const handleTestAi = async () => {
    try {
      const res = await apiRequest("/api/v1/sample/ai", "POST", {
        prompt: "스타트업 보일러플레이트를 완성한 개발자에게 칭찬 한마디 해줘!",
      });
      setApiResult({ type: "success", data: res });
      addToast({ type: "info", message: "Gemini AI 응답이 도착했습니다." });
    } catch (err: any) {
      setApiResult({ type: "error", data: err });
      addToast({ type: "error", message: err.message });
    }
  };


  return (
    <main className="min-h-screen p-6 md:p-10 max-w-6xl mx-auto">
      {/* Header */}
      <header className="mb-8 pb-6 border-b border-slate-200 flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-md bg-indigo-100 text-indigo-800 text-xs font-bold">
              Next.js 14 + Jotai
            </span>
            <span className="px-2.5 py-0.5 rounded-md bg-purple-100 text-purple-800 text-xs font-bold">
              Kotlin Spring Boot 3.4
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Fullstack Starter Boilerplate
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            참고 프로젝트(recipe-front, branchOutMobileRN, nuzelcat)의 실전 패턴 집약체
          </p>
        </div>

        {/* Backend & Auth Status */}
        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
              health?.status === "UP"
                ? "bg-emerald-100 text-emerald-800"
                : "bg-rose-100 text-rose-800"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                health?.status === "UP" ? "bg-emerald-500 animate-pulse" : "bg-rose-500"
              }`}
            />
            Backend: {health?.status || "CHECKING"}
          </span>

          <button
            onClick={checkHealth}
            disabled={loadingHealth}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition"
            title="새로고침"
          >
            <RefreshCw className={`w-4 h-4 ${loadingHealth ? "animate-spin" : ""}`} />
          </button>
        </div>
      </header>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Jotai Global State Management */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3 text-indigo-600 font-bold">
              <Layers className="w-5 h-5" />
              <h2 className="text-lg text-slate-900">Jotai 전역 상태 관리 (Atoms)</h2>
            </div>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              `atomWithStorage` (Next.js SSR 안전 래퍼)와 파생 아톰(`isAuthenticatedAtom`)으로
              새로고침해도 상태가 유지되는 모던 상태 관리를 테스트합니다.
            </p>

            {/* Auth State Preview */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 mb-4 text-xs space-y-1.5 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">인증 상태:</span>
                <span className={isAuthenticated ? "text-emerald-600 font-bold" : "text-slate-400"}>
                  {isAuthenticated ? "로그인됨 (Authenticated)" : "미인증 (Guest)"}
                </span>
              </div>
              {userProfile && (
                <div className="flex justify-between">
                  <span className="text-slate-500">유저 ID:</span>
                  <span className="text-slate-800 font-semibold">{userProfile.userId}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500">온보딩 튜토리얼 완료 여부:</span>
                <span className={hasSeenTutorial ? "text-emerald-600" : "text-amber-600"}>
                  {hasSeenTutorial ? "완료됨 (True)" : "미확인 (False)"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
            {!isAuthenticated ? (
              <Button size="sm" onClick={handleIssueJwt}>
                JWT 발급 & Jotai 저장
              </Button>
            ) : (
              <Button size="sm" variant="danger" onClick={logout}>
                <LogOut className="w-3.5 h-3.5 mr-1" /> 로그아웃
              </Button>
            )}

            <Button
              size="sm"
              variant="outline"
              onClick={() => setHasSeenTutorial((prev) => !prev)}
            >
              온보딩 토글
            </Button>

            <Button
              size="sm"
              variant="ghost"
              onClick={() =>
                openModal({
                  title: "Jotai 전역 모달",
                  description: "uiAtom을 통해 열린 전역 모달 창입니다.",
                  content: (
                    <div className="text-xs text-slate-600 p-2 bg-slate-50 rounded-lg">
                      `openModalActionAtom`을 호출하면 컴포넌트 트리 어디서든 모달이 뜹니다.
                    </div>
                  ),
                  confirmText: "확인 완료",
                })
              }
            >
              전역 모달 열기
            </Button>
          </div>
        </section>

        {/* Card 2: Axios Client & Error Handling */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3 text-emerald-600 font-bold">
              <Activity className="w-5 h-5" />
              <h2 className="text-lg text-slate-900">API 클라이언트 & 인터셉터</h2>
            </div>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Axios 요청 시 JWT 토큰 자동 주입, 백엔드 `ApiResponse` 규격 언래핑,
              `GlobalExceptionHandler` 에러 변환을 테스트합니다.
            </p>

            <div className="flex flex-wrap gap-2 mb-4">
              <Button size="sm" variant="secondary" onClick={handleSuccessCall}>
                성공 API 호출
              </Button>
              <Button size="sm" variant="outline" onClick={handleErrorCall}>
                비즈니스 에러 유발
              </Button>
            </div>
          </div>

          {/* Quick Utility Demos */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
            <div className="text-slate-500 font-semibold mb-1">참고 프로젝트 추출 유틸리티:</div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">상대 시간(TimeDiff):</span>
              <span className="font-mono text-slate-800">
                {formatTimeDiff(new Date(Date.now() - 1000 * 60 * 15))}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">클립보드 복사(CopyUrl):</span>
              <button
                onClick={() => copy("http://localhost:3000")}
                className="inline-flex items-center gap-1 text-indigo-600 hover:underline font-mono"
              >
                {hasCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {hasCopied ? "복사완료!" : "현재 URL 복사"}
              </button>
            </div>
          </div>
        </section>

        {/* Card 3: AI Client (Gemini) */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-3 text-purple-600 font-bold">
            <Bot className="w-5 h-5" />
            <h2 className="text-lg text-slate-900">Gemini AI 모듈</h2>
          </div>
          <p className="text-xs text-slate-600 mb-4 leading-relaxed">
            `sourceTwo`의 멀티 모델 폴백 큐(`gemini-2.5-flash` $\rightarrow$ `1.5-flash`) 클라이언트와 연동합니다.
          </p>
          <Button size="sm" className="bg-purple-600 hover:bg-purple-700" onClick={handleTestAi}>
            <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Gemini 프롬프트 테스트
          </Button>
        </section>

        {/* Card 4: SSE Realtime Streaming */}
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-sky-600 font-bold">
              <Radio className="w-5 h-5" />
              <h2 className="text-lg text-slate-900">Server-Sent Events (SSE)</h2>
            </div>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                isConnected ? "bg-sky-100 text-sky-800" : "bg-slate-100 text-slate-600"
              }`}
            >
              {isConnected ? "연결됨" : "미연결"}
            </span>
          </div>
          <p className="text-xs text-slate-600 mb-4 leading-relaxed">
            AI 분석, 크롤링 등 장시간 비동기 작업의 진행률을 실시간 스트리밍합니다.
          </p>

          <div className="flex gap-2 mb-3">
            {!streamUrl ? (
              <Button size="sm" className="bg-sky-600 hover:bg-sky-700" onClick={startSseStream}>
                SSE 연결 시작
              </Button>
            ) : (
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700"
                disabled={!isConnected}
                onClick={triggerSseSimulation}
              >
                비동기 시뮬레이션 작업 트리거
              </Button>
            )}
          </div>

          <div className="bg-slate-900 text-slate-200 p-3 rounded-xl text-xs font-mono min-h-[90px] max-h-[140px] overflow-y-auto space-y-1">
            {messages.length === 0 && (
              <div className="text-slate-500">이벤트 대기 중...</div>
            )}
            {messages.map((m, idx) => (
              <div key={idx} className="flex gap-2">
                <span className="text-sky-400 font-semibold">[{m.eventName}]</span>
                <span className="text-slate-300">
                  {typeof m.data === "object" ? JSON.stringify(m.data) : m.data}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Raw JSON Inspector */}
      {apiResult && (
        <div className="mt-8 bg-slate-950 text-slate-200 p-5 rounded-2xl border border-slate-800 font-mono text-xs">
          <div className="flex justify-between items-center mb-2">
            <span className="font-bold text-slate-300">API 응답 결과 (Raw JSON)</span>
            <button onClick={() => setApiResult(null)} className="text-slate-400 hover:text-white">
              닫기
            </button>
          </div>
          <pre className="overflow-x-auto p-3 bg-slate-900 rounded-lg text-emerald-400">
            {JSON.stringify(apiResult.data, null, 2)}
          </pre>
        </div>
      )}
    </main>
  );
}
