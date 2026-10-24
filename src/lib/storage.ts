// localStorage 키
export const STORAGE_KEY = {
  MARKET: "my-home-market",
  RESULT: "my-home-result",
  PRODUCT: "my-home-product",
  // Raw 화면에서 서버에 올렸거나 서버 목록에서 본 물품 이름(string[]).
  // 서버에 없는 이름이 새 물품인지, 서버에서 지워진 물품인지 가르는 데 쓴다.
  PRODUCT_KNOWN_NAMES: "my-home-product-known-names",
  CART: "my-home-cart:v2",
  // 이전 장바구니 형식(결과 id → { item, count }). 새 형식으로 옮긴 뒤 삭제한다.
  LEGACY_CART: "my-home-selected-results",
  // 로그인 세션(lib/authSession)
  AUTH: "my-home-auth",
} as const;

// 저장소 접근 자체가 예외를 던질 수 있어(저장 차단 등) 모두 try 안에서 한다.

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

// 저장 공간 부족·저장 차단 등으로 실패해도 예외를 던지지 않고 false를 반환한다
export function writeJSON(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function removeItem(key: string) {
  try {
    localStorage.removeItem(key);
  } catch {
    // 삭제 실패는 무시한다
  }
}
