import { onTestFinished } from "vitest";

// 테스트가 일부러 던진 에러의 출력을 숨긴다(현재 테스트가 끝나면 원래대로).
// - React가 잡은 렌더 에러를 console.error로 출력하는 것
// - jsdom이 처리되지 않은 에러를 Node 콘솔로 직접 보고하는 것(console 모킹으로는 막히지 않음)
// 주의: window error 리스너가 있는 동안 Vitest는 처리되지 않은 에러 검사를 끈다.
// 에러를 기대하는 테스트에서만 부르고, 그 테스트는 화면에 보이는 결과로 검증한다.
export function silenceExpectedErrors() {
  vi.spyOn(console, "error").mockImplementation(() => {});
  const preventReport = (event: ErrorEvent) => event.preventDefault();
  window.addEventListener("error", preventReport);
  onTestFinished(() => window.removeEventListener("error", preventReport));
}
