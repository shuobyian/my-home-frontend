import { MyHomeError } from "@/apis/errors";
import { clearAuthSession, getAuthSession, isExpired } from "@/lib/authSession";
import axios from "axios";

// API 서버 주소는 환경별 .env 파일의 VITE_API_BASE_URL로 정한다.
// (pnpm start → .env.development, pnpm build → .env.production)
export const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  // 응답이 없을 때 무한 로딩 대신 오류로 처리한다
  timeout: 30000,
});

const bearer = (token: string) => `Bearer ${token}`;

// 로그인했으면 토큰을 붙인다. 만료된 세션은 보내지 않고 로그아웃 처리한다.
client.interceptors.request.use((config) => {
  const session = getAuthSession();
  if (session && isExpired(session)) clearAuthSession();
  else if (session) config.headers.Authorization = bearer(session.token);
  return config;
});

// 모든 API 에러를 MyHomeError로 정규화한다 (응답이 없는 네트워크 오류 포함).
// 지금 세션의 토큰을 서버가 거절하면(401: 서버에서 만료·삭제됨) 로그아웃 처리한다.
// 그사이 다시 로그인했으면 이전 토큰의 401로 새 세션을 지우지 않는다.
client.interceptors.response.use(
  (response) => response,
  (error) => {
    const session = getAuthSession();
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      session &&
      error.config?.headers.Authorization === bearer(session.token)
    ) {
      clearAuthSession();
    }
    return Promise.reject(MyHomeError.from(error));
  }
);
