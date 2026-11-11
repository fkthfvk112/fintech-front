"use client";

import { useEffect, useRef, useState } from "react";

export interface SSEMessage {
  eventName: string;
  data: any;
  receivedAt: Date;
}

export function useSSE(endpointUrl: string | null) {
  const [messages, setMessages] = useState<SSEMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!endpointUrl) return;

    const es = new EventSource(endpointUrl);
    eventSourceRef.current = es;

    es.onopen = () => {
      setIsConnected(true);
      setError(null);
    };

    es.onerror = () => {
      setIsConnected(false);
      setError("SSE 연결이 끊어졌거나 오류가 발생했습니다.");
    };

    es.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        setMessages((prev) => [
          ...prev,
          { eventName: "message", data: parsed, receivedAt: new Date() },
        ]);
      } catch {
        setMessages((prev) => [
          ...prev,
          { eventName: "message", data: event.data, receivedAt: new Date() },
        ]);
      }
    };

    const handleCustomEvent = (eventName: string) => (event: MessageEvent) => {
      try {
        const parsed = JSON.parse(event.data);
        setMessages((prev) => [
          ...prev,
          { eventName, data: parsed, receivedAt: new Date() },
        ]);
      } catch {
        setMessages((prev) => [
          ...prev,
          { eventName, data: event.data, receivedAt: new Date() },
        ]);
      }
    };

    es.addEventListener("CONNECTED", handleCustomEvent("CONNECTED"));
    es.addEventListener("PROGRESS", handleCustomEvent("PROGRESS"));
    es.addEventListener("COMPLETE", handleCustomEvent("COMPLETE"));
    es.addEventListener("ERROR", handleCustomEvent("ERROR"));

    return () => {
      es.close();
      setIsConnected(false);
    };
  }, [endpointUrl]);

  const clearMessages = () => setMessages([]);

  return {
    messages,
    isConnected,
    error,
    clearMessages,
  };
}
