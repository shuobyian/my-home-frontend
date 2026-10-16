// 배포로 파일 이름이 바뀌었거나 연결이 끊겨 지연 로딩 코드(청크)를 받지 못한 오류인지.
// 동적 import 실패 메시지는 브라우저마다 다르다(Chrome·Firefox·Safari 순).
// React.lazy는 실패한 import를 기억하므로 이 경우에는 새로고침해야 복구된다.
const DYNAMIC_IMPORT_FAILED =
  /Failed to fetch dynamically imported module|error loading dynamically imported module|Importing a module script failed/i;

export function isChunkLoadError(error: unknown) {
  return error instanceof Error && DYNAMIC_IMPORT_FAILED.test(error.message);
}
