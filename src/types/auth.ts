// 회원 정보. 관리자만 물품·시세·결과를 바꿀 수 있다.
export interface User {
  id: number;
  username: string;
  isAdmin: boolean;
}

// 로그인·회원가입 응답. token은 이후 요청의 Authorization: Bearer 헤더에 넣는다.
export interface AuthSession {
  token: string;
  // ISO 8601 시각
  expiresAt: string;
  user: User;
}

export interface Credentials {
  username: string;
  password: string;
}
