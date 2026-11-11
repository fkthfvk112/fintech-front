import { createSafeStorageAtom } from "./storageHelper";

/**
 * branchOutMobileRN 프로젝트에서 추출된 온보딩 및 튜토리얼 확인 플래그 패턴
 * 브라우저를 껐다 켜도 유저가 이미 본 가이드나 튜토리얼은 다시 노출되지 않도록 영구 관리
 */
export const hasSeenWelcomeTutorialAtom = createSafeStorageAtom<boolean>(
  "boilerplate_seen_welcome_tutorial",
  false
);

export const hasSeenFeatureGuideAtom = createSafeStorageAtom<boolean>(
  "boilerplate_seen_feature_guide",
  false
);
