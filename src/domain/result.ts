import { ToolType } from "@/types/enums";
import { MaterialCost, Result } from "@/types/result";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isMaterialCost(value: unknown): value is MaterialCost {
  return (
    isRecord(value) &&
    typeof value.name === "string" &&
    typeof value.count === "number" &&
    typeof value.price === "number"
  );
}

// 저장된 결과가 화면과 합산에 필요한 필드를 갖췄는지 검사한다
export function isResult(value: unknown): value is Result {
  return (
    isRecord(value) &&
    typeof value.id === "number" &&
    typeof value.name === "string" &&
    Array.isArray(value.materials) &&
    value.materials.every(isMaterialCost)
  );
}

// 저장된 결과 목록을 복원한다. 형태가 맞지 않으면 undefined.
export function parseResultList(value: unknown): Result[] | undefined {
  return Array.isArray(value) && value.every(isResult) ? value : undefined;
}

// 기초 재료 99개를 1뭉으로 센다(게임 내 묶음 단위, 프론트 전용 규칙)
export const MUNG_UNIT = 99;

// 뭉 단위 개수. 1뭉 미만이면 0
export function toMung(count: number) {
  return Math.floor(count / MUNG_UNIT);
}

// 뭉으로 묶고 남는 낱개 수(0 이상 MUNG_UNIT 미만)
export function mungRemainder(count: number) {
  return count % MUNG_UNIT;
}

// 제작에 드는 전체 비용(재료비 + 제작비)
export function getTotalCost(result: Result) {
  return result.totalPrice + result.craftingPrice;
}

// 미미 화덕으로 만드는 물품은 레벨 대신 미미 호감도가 필요하다
export function requiresAffinity(result: Result) {
  return result.tool === ToolType.MIMI;
}
