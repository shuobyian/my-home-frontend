import { getAuthSession, subscribeAuthSession } from "@/lib/authSession";
import { useSyncExternalStore } from "react";

// 로그인한 회원(로그아웃 상태면 null). 로그인·로그아웃, 서버의 토큰 거절(401),
// 다른 탭의 변경이 바로 반영된다.
export function useCurrentUser() {
  return (
    useSyncExternalStore(subscribeAuthSession, getAuthSession)?.user ?? null
  );
}
