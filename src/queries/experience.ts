import { calculateWalnut, fetchExperience } from "@/apis/experience";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { WalnutParams } from "@/types/experience";

export const experienceKeys = {
  all: ["experience"] as const,
  list: () => [...experienceKeys.all, "list"] as const,
  walnut: (params?: WalnutParams) =>
    [...experienceKeys.all, "walnut", params] as const,
};

export const useExperienceQuery = () =>
  useQuery({
    queryKey: experienceKeys.list(),
    queryFn: fetchExperience,
    // 레벨별 경험치 표는 거의 바뀌지 않으므로 이 탭에서는 한 번만 받는다(새로고침하면 다시 받음)
    staleTime: Infinity,
  });

// 호두작 계산(GET). 조건이 같으면 캐시를 쓰고, 조건이 없으면 요청하지 않는다.
export const useWalnutQuery = (params?: WalnutParams) =>
  useQuery({
    queryKey: experienceKeys.walnut(params),
    queryFn: () => calculateWalnut(params as WalnutParams),
    enabled: !!params,
    // 조건을 바꿔 다시 계산하는 동안 이전 결과를 유지한다
    placeholderData: keepPreviousData,
    // 화면에서 오류 메시지를 직접 보여 준다
    throwOnError: false,
  });
