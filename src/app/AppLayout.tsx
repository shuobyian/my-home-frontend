import { AppHeader } from "@/app/AppHeader";
import { RouteErrorBoundary } from "@/app/RouteErrorBoundary";
import { Spin } from "@/ui";
import { Suspense } from "react";
import { Outlet } from "react-router";
import { styles } from "./AppLayout.styles";

// 공통 레이아웃. 헤더는 오류 화면에 가려지지 않도록 ErrorBoundary 밖에 둔다.
export function AppLayout() {
  return (
    <div css={styles.layout}>
      <AppHeader />
      <RouteErrorBoundary>
        {/* 지연 로딩하는 화면(관리)의 코드를 받는 동안 표시. 받기 실패 시 ErrorBoundary가 새로고침을 안내한다 */}
        <Suspense fallback={<Spin />}>
          <Outlet />
        </Suspense>
      </RouteErrorBoundary>
    </div>
  );
}
