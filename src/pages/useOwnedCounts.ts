import { toOwnedCounts } from "@/domain/inventory";
import { useInventoryQuery } from "@/queries/inventory";
import { useCurrentUser } from "@/state/auth";
import { useMemo } from "react";

// 로그인한 회원의 재료 이름별 보유 개수(결과·장바구니 합산·시세 조작 모드 결과의 부족 개수용).
// 로그아웃 상태이거나 받지 못했으면 undefined라 재료 표가 보유·부족 열 없이 그대로 보인다.
// 덧붙이는 정보라서 실패해도 화면을 오류 화면으로 바꾸지 않는다.
export function useOwnedCounts() {
  const user = useCurrentUser();
  const { data } = useInventoryQuery(user?.id, { throwOnError: false });
  return useMemo(() => (data ? toOwnedCounts(data) : undefined), [data]);
}
