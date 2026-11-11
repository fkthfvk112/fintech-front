import { atom } from "jotai";
import { createSafeStorageAtom } from "./storageHelper";

export interface UserProfile {
  userId: string;
  email?: string;
  nickname?: string;
  roles: string[];
}

// 1. JWT Access Token Atom (로컬 스토리지 자동 동기화)
export const accessTokenAtom = createSafeStorageAtom<string | null>(
  "boilerplate_access_token",
  null
);

// 2. 유저 프로필 Atom
export const userProfileAtom = createSafeStorageAtom<UserProfile | null>(
  "boilerplate_user",
  null
);

// 3. 로그인 여부 판단 파생 Atom (Read-Only)
export const isAuthenticatedAtom = atom((get) => {
  return !!get(accessTokenAtom);
});

// 4. 로그아웃 Action Atom (Write-Only)
export const logoutActionAtom = atom(null, (get, set) => {
  set(accessTokenAtom, null);
  set(userProfileAtom, null);
  if (typeof window !== "undefined") {
    localStorage.removeItem("boilerplate_access_token");
    localStorage.removeItem("boilerplate_user");
  }
});
