import { act, renderHook } from "@testing-library/react";
import { SESSION_KEY } from "@/lib/storage";
import { AuthProvider, useAuth } from "@/state/auth";
import { silenceExpectedErrors } from "@/test/silenceErrors";
import { ReactNode } from "react";

const wrapper = ({ children }: { children: ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

beforeEach(() => {
  sessionStorage.clear();
});

describe("AuthProvider / useAuth", () => {
  it("관리자 확인을 이 탭(sessionStorage)에 기억하고, 관리 종료로 지운다", () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.isAdmin).toBe(false);

    act(() => result.current.markAdmin());
    expect(result.current.isAdmin).toBe(true);
    expect(sessionStorage.getItem(SESSION_KEY.ADMIN)).toBe("true");

    act(() => result.current.logout());
    expect(result.current.isAdmin).toBe(false);
    expect(sessionStorage.getItem(SESSION_KEY.ADMIN)).toBeNull();
  });

  it("이 탭에서 이미 확인했으면 처음부터 관리자로 본다", () => {
    sessionStorage.setItem(SESSION_KEY.ADMIN, "true");
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.isAdmin).toBe(true);
  });

  it("AuthProvider 밖에서 쓰면 오류를 던진다", () => {
    silenceExpectedErrors();
    expect(() => renderHook(() => useAuth())).toThrow(
      "useAuth는 AuthProvider 안에서만 사용할 수 있습니다."
    );
  });
});
