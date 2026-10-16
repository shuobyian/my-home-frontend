import {
  readSession,
  removeSession,
  SESSION_KEY,
  writeSession,
} from "lib/storage";
import { createContext, ReactNode, useContext, useMemo, useState } from "react";

interface AuthContextValue {
  // 이 탭에서 관리자 비밀번호를 확인했는지
  isAdmin: boolean;
  markAdmin: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// 관리 화면 게이트 상태. 서버에 인증이 없어(모든 API가 공개) 화면을 숨기는 용도일 뿐이며,
// 실제 보호는 서버에서 인증을 강제해야 한다. 로그인은 탭을 닫을 때까지 유지한다(sessionStorage).
export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(
    () => readSession(SESSION_KEY.ADMIN) === true
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      isAdmin,
      markAdmin: () => {
        writeSession(SESSION_KEY.ADMIN, true);
        setIsAdmin(true);
      },
      logout: () => {
        removeSession(SESSION_KEY.ADMIN);
        setIsAdmin(false);
      },
    }),
    [isAdmin]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth는 AuthProvider 안에서만 사용할 수 있습니다.");
  }
  return context;
}
