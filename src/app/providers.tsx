import { App as AntdApp, ConfigProvider, ThemeConfig } from "antd";
import koKR from "antd/locale/ko_KR";
import { queryClient } from "app/queryClient";
import { ReactNode } from "react";
import { QueryClientProvider } from "react-query";
import { BrowserRouter } from "react-router-dom";

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
          <BrowserRouter>{children}</BrowserRouter>
        </AntdApp>
      </ConfigProvider>
    </QueryClientProvider>
  );
}
