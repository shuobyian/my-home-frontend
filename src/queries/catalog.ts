import { fetchCatalogCheck } from "@/apis/catalog";
import { catalogKeys } from "@/queries/keys";
import { useQuery } from "@tanstack/react-query";

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
