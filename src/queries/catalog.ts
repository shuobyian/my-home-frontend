import { fetchCatalogCheck } from "@/apis/catalog";
import { catalogKeys } from "@/queries/keys";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export { catalogKeys } from "@/queries/keys";

// 서버의 데이터 점검(관리자). 카탈로그 쓰기 뒤에는 useInvalidateCatalog가 다시 받게 한다.
export const useCatalogCheckQuery = ({
  enabled = true,
}: { enabled?: boolean } = {}) =>
  useQuery({
    queryKey: catalogKeys.check,
    queryFn: fetchCatalogCheck,
    enabled,
    // 점검 정보 없이도 관리 화면은 쓸 수 있으므로 화면에서 오류를 직접 보여 준다
    throwOnError: false,
  });

// 점검 정보만 다시 받는다. 쓰기가 실패해 서버 데이터가 그대로일 때 쓴다.
// 이 쿼리는 실패해도 오류 화면으로 올라가지 않으므로, 연결이 끊긴 상태에서도 열려 있는 모달을 지킨다.
export function useInvalidateCatalogCheck() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: catalogKeys.check });
  };
}
