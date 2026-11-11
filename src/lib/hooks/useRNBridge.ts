"use client";

import { useEffect, useCallback } from "react";

/**
 * recipe-front에서 추출된 React Native WebView 양방향 브릿지 훅
 * 웹사이트가 향후 React Native 웹뷰 앱으로 패키징될 때 네이티브와 통신을 담당합니다.
 */
export interface RNBridgeMessage {
  type: string;
  payload?: any;
}

export function useRNBridge(onMessageReceived?: (msg: RNBridgeMessage) => void) {
  // 웹 -> React Native 앱으로 메시지 전송
  const postMessageToRN = useCallback((message: RNBridgeMessage) => {
    if (typeof window !== "undefined" && (window as any).ReactNativeWebView) {
      (window as any).ReactNativeWebView.postMessage(JSON.stringify(message));
    } else {
      console.log("[RNBridge Web Fallback]", message);
    }
  }, []);

  // React Native 앱 -> 웹으로 전달된 메시지 수신 리스너
  useEffect(() => {
    if (typeof window === "undefined" || !onMessageReceived) return;

    const handleMessage = (event: MessageEvent) => {
      try {
        const data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
        onMessageReceived(data);
      } catch (e) {
        console.warn("[RNBridge] Failed to parse message from RN:", event.data);
      }
    };

    // 안드로이드 / iOS 네이티브 수신 이벤트 등록
    window.addEventListener("message", handleMessage);
    document.addEventListener("message" as any, handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
      document.removeEventListener("message" as any, handleMessage);
    };
  }, [onMessageReceived]);

  const isInsideRN = typeof window !== "undefined" && !!(window as any).ReactNativeWebView;

  return {
    postMessageToRN,
    isInsideRN,
  };
}
