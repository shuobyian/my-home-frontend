// localStorage 키
export const STORAGE_KEY = {
  MARKET: "my-home-market",
  RESULT: "my-home-result",
  PRODUCT: "my-home-product",
  CART: "my-home-cart:v2",
  // 이전 장바구니 형식(결과 id → { item, count }). 새 형식으로 옮긴 뒤 삭제한다.
  LEGACY_CART: "my-home-selected-results",
} as const;

// 저장값을 읽는다. 없거나 손상되었거나 저장소를 쓸 수 없으면 undefined.
// 형태 검사는 호출부에서 한다.
export function readJSON(key: string): unknown {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? undefined : JSON.parse(raw);
  } catch {
    return undefined;
  }
}

// 저장에 실패해도(저장 공간 부족, 시크릿 모드 등) 화면 동작은 계속한다
export function writeJSON(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // 저장 실패는 무시한다
  }
}

export function removeItem(key: string) {
  try {
    localStorage.removeItem(key);
  } catch {
    // 삭제 실패는 무시한다
  }
}
