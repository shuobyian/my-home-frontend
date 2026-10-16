import { calculateWalnut, fetchExperience } from "apis/experience";
import { useQuery } from "react-query";
import { WalnutParams } from "types/experience";

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
  });

// 호두작 계산(GET). 조건이 같으면 캐시를 쓰고, 조건이 없으면 요청하지 않는다.
export const useWalnutQuery = (params?: WalnutParams) =>
  useQuery({
    queryKey: experienceKeys.walnut(params),
    queryFn: () => calculateWalnut(params as WalnutParams),
    enabled: !!params,
    // 화면에서 오류 메시지를 직접 보여 준다
    useErrorBoundary: false,
  });
