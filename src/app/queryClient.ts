import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 0,
      refetchOnWindowFocus: false,
      // 쿼리 에러는 라우트 ErrorBoundary(app/RouteErrorBoundary)가 받는다
      throwOnError: true,
      // 오프라인이어도 요청을 보내 바로 실패시킨다. v5 기본값('online')은 연결될 때까지
      // 요청을 멈춰 두어 스피너도 오류 안내도 없는 빈 화면이 된다(v3 동작 유지).
      networkMode: "always",
    },
    mutations: {
      // 저장 버튼이 계속 로딩하다가 연결되면 뒤늦게 저장되는 일을 막는다
      networkMode: "always",
    },
  },
});
