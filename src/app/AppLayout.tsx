import { Grid, Layout, Spin } from "antd";
import { AppHeader } from "@/app/AppHeader";
import { RouteErrorBoundary } from "@/app/RouteErrorBoundary";
import { Suspense } from "react";
import { Outlet } from "react-router";

// 공통 레이아웃. 헤더는 오류 화면에 가려지지 않도록 ErrorBoundary 밖에 둔다.
export function AppLayout() {
  const screens = Grid.useBreakpoint();

  return (
    <Layout style={{ padding: screens.sm ? "10px 100px" : "10px" }}>
      <AppHeader />
      <RouteErrorBoundary>
        {/* 지연 로딩하는 화면(관리)의 코드를 받는 동안 표시. 받기 실패 시 ErrorBoundary가 새로고침을 안내한다 */}
        <Suspense
          fallback={<Spin style={{ display: "block", margin: "40px auto" }} />}
        >
          <Outlet />
        </Suspense>
      </RouteErrorBoundary>
    </Layout>
  );
}
