// 서버가 내려주는 에러 응답 본문
export interface IMyHomeError {
  statusCode: string;
  message: string;
  error: string;
}
