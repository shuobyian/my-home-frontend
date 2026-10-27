import { AppHeader } from "@/app/AppHeader";
import { AppNav } from "@/app/AppNav";
import { RouteErrorBoundary } from "@/app/RouteErrorBoundary";
import { ScrollTopButton } from "@/app/ScrollTopButton";
import { useCurrentUser } from "@/state/auth";
import { Spin, Text } from "@/ui";
import { Suspense } from "react";
import { Outlet } from "react-router";
import { styles } from "./AppLayout.styles";

// 공통 레이아웃. 메뉴·헤더·footer는 오류 화면에 가려지지 않도록 ErrorBoundary 밖에 둔다.
// 목록이 길어 쪽을 나누지 않으므로 어느 화면에서나 '맨 위로' 버튼을 쓸 수 있게 한다.
export function AppLayout() {
  const user = useCurrentUser();

  return (
    <div css={styles.layout}>
      <AppNav />
      <div css={[styles.content, user?.isAdmin && styles.adminSpace]}>
        <AppHeader />
        <RouteErrorBoundary>
          {/* 지연 로딩하는 화면(관리)의 코드를 받는 동안 표시. 받기 실패 시 ErrorBoundary가 새로고침을 안내한다 */}
          <Suspense fallback={<Spin />}>
            <Outlet />
          </Suspense>
        </RouteErrorBoundary>
        <footer css={styles.footer}>
          <Text tone='secondary'>제작자: 늘흰</Text>
        </footer>
      </div>
      <ScrollTopButton />
    </div>
  );
}
