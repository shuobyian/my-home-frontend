import { readJSON, removeItem, STORAGE_KEY, writeJSON } from "@/lib/storage";
import { AuthSession } from "@/types/auth";

// 로그인 세션(토큰과 회원 정보). localStorage에 두어 새로고침·다른 탭에서도 로그인이 유지된다.
// React 밖(apis/client의 요청 가로채기)에서도 읽으므로 여기 두고, 화면은 state/auth의 훅으로 구독한다.

function isAuthSession(value: unknown): value is AuthSession {
  if (typeof value !== "object" || value === null) return false;
  const { token, expiresAt, user } = value as Record<string, unknown>;
  if (typeof token !== "string" || typeof expiresAt !== "string") return false;
  if (typeof user !== "object" || user === null) return false;
  // 닉네임이 생기기 전에 저장한 세션은 다시 로그인해 닉네임을 받는다
  const { id, username, nickname, isAdmin } = user as Record<string, unknown>;
  return (
    typeof id === "number" &&
    typeof username === "string" &&
    typeof nickname === "string" &&
    typeof isAdmin === "boolean"
  );
}

// 시각을 읽을 수 없어도 만료로 본다
export const isExpired = (session: AuthSession) =>
  !(Date.parse(session.expiresAt) > Date.now());

// 저장된 세션. 형태가 다르거나 만료됐으면 없는 것으로 본다.
function load() {
  const value = readJSON(STORAGE_KEY.AUTH);
  return isAuthSession(value) && !isExpired(value) ? value : null;
}

let current = load();
const listeners = new Set<() => void>();

function set(session: AuthSession | null) {
  current = session;
  listeners.forEach((listener) => listener());
}

// 바뀌기 전까지 같은 객체를 돌려준다(useSyncExternalStore의 스냅샷).
// ponytail: 쓰는 중에 만료되면 다음 요청(apis/client)에서야 지운다. 만료 시각에 맞춘 타이머는 필요해지면 단다.
export const getAuthSession = () => current;

export function saveAuthSession(session: AuthSession) {
  writeJSON(STORAGE_KEY.AUTH, session);
  set(session);
}

export function clearAuthSession() {
  removeItem(STORAGE_KEY.AUTH);
  set(null);
}

export function subscribeAuthSession(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

// 다른 탭에서 로그인·로그아웃하면 이 탭에도 반영한다(storage 이벤트는 다른 탭의 변경에만 온다)
window.addEventListener("storage", (event) => {
  if (event.key === STORAGE_KEY.AUTH || event.key === null) set(load());
});
