import { deleteMarkets, fetchMarkets, updateMarkets } from "@/apis/market";
import { useInvalidateCatalog } from "@/queries/invalidate";
import { marketKeys } from "@/queries/keys";
import { useMutation, useQuery } from "@tanstack/react-query";

export { marketKeys } from "@/queries/keys";

// throwOnError: false면 실패를 라우트 ErrorBoundary로 넘기지 않고 화면이 직접 보여 준다.
// 넘기지 않으면 QueryClient 기본값을 따른다(undefined를 넣으면 기본값을 덮어쓰므로 빼고 넘긴다)
export const useMarketsQuery = ({
  throwOnError,
}: { throwOnError?: boolean } = {}) =>
  useQuery({
    queryKey: marketKeys.all,
    queryFn: fetchMarkets,
    ...(throwOnError !== undefined && { throwOnError }),
  });

// 시세가 바뀌면 서버가 결과를 다시 계산하고 레시피의 재료 이름도 바꾸므로 카탈로그 전체를 다시 받는다
export const useUpdateMarketsMutation = () =>
  useMutation({
    mutationFn: updateMarkets,
    onSuccess: useInvalidateCatalog(),
  });

export const useDeleteMarketsMutation = () =>
  useMutation({
    mutationFn: deleteMarkets,
    onSuccess: useInvalidateCatalog(),
  });
