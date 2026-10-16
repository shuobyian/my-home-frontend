import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 0,
      refetchOnWindowFocus: false,
      // 쿼리 에러는 라우트 ErrorBoundary(app/RouteErrorBoundary)가 받는다
      throwOnError: true,
    },
  },
});
