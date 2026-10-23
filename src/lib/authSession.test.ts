import {
  clearAuthSession,
  getAuthSession,
  saveAuthSession,
  subscribeAuthSession,
} from "@/lib/authSession";
import { STORAGE_KEY } from "@/lib/storage";
import { createSession } from "@/test/fixtures";

// 다른 탭이 저장값을 바꾼 것처럼 한다(storage 이벤트는 다른 탭의 변경에만 온다)
function otherTabWrites(raw: string | null) {
  if (raw === null) localStorage.removeItem(STORAGE_KEY.AUTH);
  else localStorage.setItem(STORAGE_KEY.AUTH, raw);
  window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY.AUTH }));
}

beforeEach(() => {
  clearAuthSession();
});

describe("authSession", () => {
  it("저장하면 같은 세션을 돌려주고 구독자에게 알리며, 지우면 null이 된다", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeAuthSession(listener);
    const session = createSession();

    saveAuthSession(session);
    expect(getAuthSession()).toBe(session);
    expect(localStorage.getItem(STORAGE_KEY.AUTH)).toBe(
      JSON.stringify(session)
    );

    clearAuthSession();
    expect(getAuthSession()).toBeNull();
    expect(localStorage.getItem(STORAGE_KEY.AUTH)).toBeNull();
    expect(listener).toHaveBeenCalledTimes(2);

    unsubscribe();
    saveAuthSession(session);
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it("다른 탭의 로그인·로그아웃을 반영한다", () => {
    const session = createSession();

    otherTabWrites(JSON.stringify(session));
    expect(getAuthSession()).toEqual(session);

    otherTabWrites(null);
    expect(getAuthSession()).toBeNull();
  });

  it.each([
    ["손상된 값", "{broken"],
    ["형태가 다른 값", JSON.stringify({ token: "t", user: { id: 1 } })],
    [
      "만료된 세션",
      JSON.stringify(createSession({ expiresAt: "2000-01-01T00:00:00Z" })),
    ],
    [
      "읽을 수 없는 만료 시각",
      JSON.stringify(createSession({ expiresAt: "?" })),
    ],
  ])("%s은 로그아웃 상태로 본다", (_, raw) => {
    saveAuthSession(createSession());

    otherTabWrites(raw);

    expect(getAuthSession()).toBeNull();
  });
});
