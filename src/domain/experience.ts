import { WalnutParams } from "@/types/experience";

// 호두작(식물앰플)은 55레벨부터 가능하고, 최대 레벨은 112다(백엔드 규칙)
export const WALNUT_MIN_LEVEL = 55;
export const MAX_LEVEL = 112;
// 생산 경험치 버프 비율 기본값(입력하지 않으면 서버가 60으로 계산)
export const DEFAULT_PRODUCTION_PERCENT = 60;

const KEYS = [
  "presentLevel",
  "presentExperience",
  "objectiveLevel",
  "productionPercent",
] as const;

// 레벨·경험치는 정수, 버프 비율만 소수를 허용한다(10진수 표기만)
const PATTERN: Record<(typeof KEYS)[number], RegExp> = {
  presentLevel: /^\d+$/,
  presentExperience: /^\d+$/,
  objectiveLevel: /^\d+$/,
  productionPercent: /^\d+(\.\d+)?$/,
};

// URL 쿼리를 호두작 계산 조건으로 바꾼다. 현재 레벨이 없으면 계산하지 않는다(undefined).
// 범위 검사는 폼과 서버가 한다(주소를 직접 고친 경우 서버 메시지를 보여 준다).
export function parseWalnutParams(
  params: URLSearchParams
): WalnutParams | undefined {
  const values: Partial<Record<(typeof KEYS)[number], number>> = {};
  KEYS.forEach((key) => {
    const raw = params.get(key);
    if (raw !== null && PATTERN[key].test(raw)) values[key] = Number(raw);
  });

  if (values.presentLevel === undefined) return undefined;
  return { ...values, presentLevel: values.presentLevel };
}

export function toWalnutSearchParams(walnut: WalnutParams): URLSearchParams {
  const params = new URLSearchParams();
  KEYS.forEach((key) => {
    const value = walnut[key];
    if (value !== undefined && value !== null) params.set(key, String(value));
  });
  return params;
}
