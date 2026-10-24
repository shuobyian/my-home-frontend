import { deleteMarkets, fetchMarkets, updateMarkets } from "@/apis/market";
import { useInvalidateCatalog } from "@/queries/invalidate";
import { marketKeys } from "@/queries/keys";
import { useMutation, useQuery } from "@tanstack/react-query";

export { marketKeys } from "@/queries/keys";

export const useMarketsQuery = () =>
  useQuery({
    queryKey: marketKeys.all,
    queryFn: fetchMarkets,
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
