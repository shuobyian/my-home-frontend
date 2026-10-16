// 배포로 파일 이름이 바뀌었거나 연결이 끊겨 지연 로딩 코드(청크)를 받지 못한 오류인지.
// React.lazy는 실패한 import를 기억하므로 이 경우에는 새로고침해야 복구된다.
export function isChunkLoadError(error: unknown) {
  if (!(error instanceof Error)) return false;
  return (
    error.name === "ChunkLoadError" ||
    /Loading (CSS )?chunk [\w-]+ failed/i.test(error.message)
  );
}
