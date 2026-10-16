import { Grid, Layout } from "antd";
import { AppHeader } from "app/AppHeader";
import { RouteErrorBoundary } from "app/RouteErrorBoundary";
import { Outlet } from "react-router-dom";

// 공통 레이아웃. 헤더는 오류 화면에 가려지지 않도록 ErrorBoundary 밖에 둔다.
export function AppLayout() {
  const screens = Grid.useBreakpoint();

  return (
    <Layout style={{ padding: screens.sm ? "10px 100px" : "10px" }}>
      <AppHeader />
      <RouteErrorBoundary>
        <Outlet />
      </RouteErrorBoundary>
    </Layout>
  );
}
