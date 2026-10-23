import { client } from "@/apis/client";
import { ENDPOINTS } from "@/apis/endpoints";
import { AuthSession, Credentials } from "@/types/auth";

export async function login(body: Credentials) {
  const { data } = await client.post<AuthSession>(ENDPOINTS.AUTH_LOGIN, body);
  return data;
}

// 가입하면 바로 로그인된 세션을 돌려준다
export async function signup(body: Credentials) {
  const { data } = await client.post<AuthSession>(ENDPOINTS.AUTH_SIGNUP, body);
  return data;
}

// 이 기기의 토큰을 서버에서 지운다
export async function logout() {
  await client.post(ENDPOINTS.AUTH_LOGOUT);
}
