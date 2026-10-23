import { queryClient } from "@/app/queryClient";
import { ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router";
import { CartProvider } from "@/state/cart";
import { UIProvider } from "@/ui";

// 앱 전역 프로바이더. UIProvider는 알림(useToast)과 확인·안내 대화상자(useDialogs)를 띄운다.
// React Router v7은 화면 이동을 기본으로 transition으로 처리해, 지연 로딩 화면의 코드를 받는 동안
// 이전 화면을 유지한다. 테스트의 MemoryRouter도 같은 기본값을 쓰므로 useTransitions는 지정하지 않는다
// (false로 두면 이 동작이 꺼진다).
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <UIProvider>
        <CartProvider>
          <BrowserRouter>{children}</BrowserRouter>
        </CartProvider>
      </UIProvider>
    </QueryClientProvider>
  );
}
