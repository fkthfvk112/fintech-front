/**
 * nuzelcat 프로젝트에서 추출된 날짜/시간 차이 계산 유틸 (TimeDiff)
 * 예: "방금 전", "5분 전", "2시간 전", "3일 전", "2024-05-12"
 */
export function formatTimeDiff(dateInput: string | Date | number): string {
  const target = new Date(dateInput);
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - target.getTime()) / 1000);

  if (isNaN(diffSec)) return "";
  if (diffSec < 60) return "방금 전";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}분 전`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}시간 전`;
  if (diffSec < 86400 * 7) return `${Math.floor(diffSec / 86400)}일 전`;

  const year = target.getFullYear();
  const month = String(target.getMonth() + 1).padStart(2, "0");
  const day = String(target.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
