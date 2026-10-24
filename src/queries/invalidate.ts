import {
  calculatorKeys,
  catalogKeys,
  experienceKeys,
  marketKeys,
  productKeys,
  resultKeys,
} from "@/queries/keys";
import { useQueryClient } from "@tanstack/react-query";

// 물품이나 시세를 저장하면 서버가 결과까지 다시 맞추므로 한 도메인만 다시 받으면 화면끼리 어긋난다.
// 호두작 계산은 결과(앰플 가격)를 쓰므로 함께 무효화하고, 레벨별 경험치 표는 바뀌지 않아 그대로 둔다.
export const CATALOG_QUERY_KEYS = [
  productKeys.all,
  marketKeys.all,
  resultKeys.all,
  calculatorKeys.all,
  catalogKeys.all,
  experienceKeys.walnutAll,
] as const;

// 카탈로그 쓰기(물품·시세·결과) 뒤에 부른다.
// 완료를 기다리지 않아 호출부의 성공 메시지가 바로 뜬다.
export function useInvalidateCatalog() {
  const queryClient = useQueryClient();
  return () => {
    CATALOG_QUERY_KEYS.forEach((queryKey) => {
      queryClient.invalidateQueries({ queryKey });
    });
  };
}
