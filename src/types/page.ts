// 서버의 페이지 응답
export interface Page<T> {
  content: T[];
  totalElements: number;
}
