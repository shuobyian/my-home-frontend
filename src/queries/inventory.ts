import { fetchInventory, updateInventory } from "@/apis/inventory";
import { inventoryKeys } from "@/queries/keys";
import { InventoryUpdateItem } from "@/types/inventory";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// 로그인한 회원(userId)의 보유 재료. 로그아웃 상태(undefined)면 요청하지 않는다.
// throwOnError: false면 실패를 라우트 ErrorBoundary로 넘기지 않는다(넘기지 않으면 QueryClient 기본값)
export const useInventoryQuery = (
  userId: number | undefined,
  { throwOnError }: { throwOnError?: boolean } = {}
) =>
  useQuery({
    queryKey: inventoryKeys.mine(userId),
    queryFn: fetchInventory,
    enabled: userId !== undefined,
    ...(throwOnError !== undefined && { throwOnError }),
  });

// 응답이 저장 뒤의 전체 보유 재료라서 다시 받지 않고 캐시를 바로 바꾼다
export const useUpdateInventoryMutation = (userId: number | undefined) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: InventoryUpdateItem[]) => updateInventory(body),
    onSuccess: (inventory) =>
      queryClient.setQueryData(inventoryKeys.mine(userId), inventory),
  });
};
