// localStorage 키
export const STORAGE_KEY = {
  MARKET: "my-home-market",
  RESULT: "my-home-result",
  PRODUCT: "my-home-product",
  CART: "my-home-cart:v2",
  // 이전 장바구니 형식(결과 id → { item, count }). 새 형식으로 옮긴 뒤 삭제한다.
  LEGACY_CART: "my-home-selected-results",
} as const;

// sessionStorage 키(탭을 닫으면 사라지는 값)
export const SESSION_KEY = {
  // 이 탭에서 관리자 비밀번호를 확인했는지(화면 표시용 게이트일 뿐, 서버 인증이 아님)
  ADMIN: "my-home-admin",
} as const;

// 저장소(localStorage·sessionStorage) 공통 동작.
// 저장소 접근 자체가 예외를 던질 수 있어(저장 차단 등) 저장소도 try 안에서 가져온다.
function read(getStorage: () => Storage, key: string): unknown {
  try {
    const raw = getStorage().getItem(key);
    return raw === null ? undefined : JSON.parse(raw);
  } catch {
    return undefined;
  }
}

function write(getStorage: () => Storage, key: string, value: unknown) {
  try {
    getStorage().setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

function remove(getStorage: () => Storage, key: string) {
  try {
    getStorage().removeItem(key);
  } catch {
    // 삭제 실패는 무시한다
  }
}

const local = () => localStorage;
const session = () => sessionStorage;

// 저장값을 읽는다. 없거나 손상되었거나 저장소를 쓸 수 없으면 undefined.
// 형태 검사는 호출부에서 한다.
export const readJSON = (key: string): unknown => read(local, key);
// 저장 공간 부족·저장 차단 등으로 실패해도 예외를 던지지 않고 false를 반환한다
export const writeJSON = (key: string, value: unknown): boolean =>
  write(local, key, value);
export const removeItem = (key: string) => remove(local, key);

// sessionStorage 판. 동작은 위와 같다.
export const readSession = (key: string): unknown => read(session, key);
export const writeSession = (key: string, value: unknown): boolean =>
  write(session, key, value);
export const removeSession = (key: string) => remove(session, key);
