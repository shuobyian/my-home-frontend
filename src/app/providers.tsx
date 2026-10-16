import { App as AntdApp, ConfigProvider, ThemeConfig } from "antd";
import koKR from "antd/locale/ko_KR";
import { queryClient } from "@/app/queryClient";
import { ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/state/auth";
import { CartProvider } from "@/state/cart";

const theme: ThemeConfig = {
  token: {
    colorPrimary: "#5c3572",
  },
};

// 앱 전역 프로바이더. antd App은 message·modal이 테마와 locale을 따르게 한다(App.useApp).
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider locale={koKR} theme={theme}>
        <AntdApp component={false}>
          <AuthProvider>
            <CartProvider>
              {/* React Router v7 동작을 미리 켠다: 이동을 transition으로 처리해 지연 로딩 화면을
                  받는 동안 이전 화면을 유지하고, splat 라우트의 상대 경로 해석을 v7과 맞춘다 */}
              <BrowserRouter
                future={{
                  v7_startTransition: true,
                  v7_relativeSplatPath: true,
                }}
              >
                {children}
              </BrowserRouter>
            </CartProvider>
          </AuthProvider>
        </AntdApp>
      </ConfigProvider>
    </QueryClientProvider>
  );
}
