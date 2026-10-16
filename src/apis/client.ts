import { MyHomeError } from "@/apis/errors";
import axios from "axios";

// API 서버 주소는 환경별 .env 파일의 VITE_API_BASE_URL로 정한다.
// (pnpm start → .env.development, pnpm build → .env.production)
export const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  // 응답이 없을 때 무한 로딩 대신 오류로 처리한다
  timeout: 30000,
});

// 모든 API 에러를 MyHomeError로 정규화한다 (응답이 없는 네트워크 오류 포함)
client.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(MyHomeError.from(error))
);
