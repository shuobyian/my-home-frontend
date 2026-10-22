import { App as AntdApp, ConfigProvider, ThemeConfig } from "antd";
import koKR from "antd/locale/ko_KR";
import { queryClient } from "@/app/queryClient";
import { ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router";
import { AuthProvider } from "@/state/auth";
import { CartProvider } from "@/state/cart";

const theme: ThemeConfig = {
  token: {
    colorPrimary: "#5c3572",
  },
};

// 앱 전역 프로바이더. antd App은 message·modal이 테마와 locale을 따르게 한다(App.useApp).
// React Router v7은 화면 이동을 기본으로 transition으로 처리해, 지연 로딩 화면의 코드를 받는 동안
// 이전 화면을 유지한다. 테스트의 MemoryRouter도 같은 기본값을 쓰므로 useTransitions는 지정하지 않는다
// (false로 두면 이 동작이 꺼진다).
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider locale={koKR} theme={theme}>
        <AntdApp component={false}>
          <AuthProvider>
            <CartProvider>
              <BrowserRouter>{children}</BrowserRouter>
            </CartProvider>
          </AuthProvider>
        </AntdApp>
      </ConfigProvider>
    </QueryClientProvider>
  );
}
