import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { ApiResponse, ApiError } from "./types";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export const axiosInstance: AxiosInstance = axios.create({
  baseURL: BACKEND_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Request Interceptor: JWT 토큰 자동 헤더 주입
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("boilerplate_access_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: 일관된 에러 핸들링
axiosInstance.interceptors.response.use(
  (response) => {
    return response.data; // ApiResponse<T> 형태로 반환
  },
  (error: AxiosError<any>) => {
    const apiError: ApiError = {
      status: error.response?.status || 0,
      code: error.response?.data?.code || "NETWORK_ERROR",
      message:
        error.response?.data?.message ||
        error.message ||
        "서버와 통신하는 중 오류가 발생했습니다.",
      error: error.response?.data?.error,
    };

    // 401 인증 만료 처리
    if (apiError.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("boilerplate_access_token");
      localStorage.removeItem("boilerplate_user");
    }

    return Promise.reject(apiError);
  }
);

/**
 * 범용 API 요청 래퍼 함수
 */
export async function apiRequest<T = any>(
  url: string,
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" = "GET",
  data?: any,
  params?: any
): Promise<ApiResponse<T>> {
  return (await axiosInstance({
    url,
    method,
    data,
    params,
  })) as unknown as ApiResponse<T>;
}
