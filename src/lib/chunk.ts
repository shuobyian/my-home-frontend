// 배포로 파일 이름이 바뀌었거나 연결이 끊겨 지연 로딩 코드(청크)를 받지 못한 오류인지.
// React.lazy는 실패한 import를 기억하므로 이 경우에는 새로고침해야 복구된다.

// 동적 import 실패 메시지는 브라우저마다 다르다(Chrome, Firefox, Safari 순).
// 없는 청크 주소에 서버가 index.html을 돌려주면 Safari는 MIME 타입 오류를 낸다.
const DYNAMIC_IMPORT_FAILED =
  /Failed to fetch dynamically imported module|error loading dynamically imported module|Importing a module script failed|is not a valid JavaScript MIME type|Unable to preload CSS/i;

// Vite가 받기 실패를 알린 에러(메시지로 판별하지 못하는 경우까지 잡기 위해)
const chunkLoadErrors = new WeakSet<object>();

// 빌드된 앱에서 Vite는 지연 로딩 코드·CSS를 받지 못하면 vite:preloadError 이벤트를 보낸 뒤
// 같은 에러 객체를 다시 던진다. 앱 시작 시 한 번 등록한다.
export function trackChunkLoadErrors(target: Window) {
  target.addEventListener("vite:preloadError", (event) => {
    if (event.payload instanceof Object) chunkLoadErrors.add(event.payload);
  });
}

export function isChunkLoadError(error: unknown) {
  if (!(error instanceof Error)) return false;
  return (
    chunkLoadErrors.has(error) || DYNAMIC_IMPORT_FAILED.test(error.message)
  );
}
