import { MaterialCost, Result } from "types/result";

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
